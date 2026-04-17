// 敏感内容
function sensitiveFilter(result) {
    if (result.__typename === "TweetWithVisibilityResults") {
        return result.tweet;
    }
    return result;
}
function mp4Filter(media) {
    return media.video_info?.variants?.filter(item => item.content_type.includes("mp4")) || [];
}
function handler2(a, b) {
    try {
        const response = JSON.parse(b);
        // 与视频相关的推文
        const tweets = response.data.home.home_timeline_urt.instructions[0].entries
            .filter(item => item.content.itemContent)
            .map(item => {
                const tweetId = item.entryId.split("-")[1];
                const media = getMedia(item.content.itemContent.tweet_results.result);
                return {
                    tweetId,
                    media: media.map(item => mp4Filter(item)).filter(item => item.length),
                    referenceId: [...media.referenceId, ...media.map(item => item.source_status_id_str).filter(item => item)]
                };
            })
            .filter(item => item.media.length);
        // 理论上，应该不会超过200条数据
        for (const tweet of tweets) {
            tweetVideoMap.set(tweet.tweetId, tweet.media);
            // 如果是转推或引用的话，映射到相同的media
            for (const item of tweet.referenceId) {
                tweetVideoMap.set(item, tweet.media);
            }
        }
    }
    catch (error) {
        console.log(error);
    }
}

const tweetVideoMap = new Map();
function getMedia(result) {
    const list = [];
    const reference = [];
    list.referenceId = reference;
    if (!result) {
        return list;
    }
    result = sensitiveFilter(result);
    // [转推]
    if (result?.retweeted_status_result) {
        const retweeted_status_result = sensitiveFilter(result.retweeted_status_result.result);
        const media = retweeted_status_result.legacy?.entities?.media;
        if (media) {
            list.push(media[0]);
            reference.push(retweeted_status_result.rest_id);
        }
        return list;
    }
    else {
        const legacy = result?.legacy;
        // [reposted];跟转推一样，只会存在原推的数据
        if (legacy.retweeted_status_result) {
            const retweeted_status_result = sensitiveFilter(legacy.retweeted_status_result.result);
            const media = retweeted_status_result.legacy?.entities?.media;
            if (media) {
                list.push(media[0]);
                reference.push(retweeted_status_result.rest_id);
            }
            return list;
        }
        // 如果是第二种情况，第一个坑位是自己的视频信息，第二个坑位是引用视频信息
        let media = legacy?.entities?.media;
        if (media) {
            list.push(media[0]);
        }
        if (result?.quoted_status_result) {
            const quoted_status_result = sensitiveFilter(result.quoted_status_result.result);
            media = quoted_status_result.legacy?.entities?.media;
            if (media) {
                list.push(media[0]);
                reference.push(quoted_status_result.rest_id);
            }
        }
        return list;
    }
}

const fs = require("fs");

const timeline = fs.readFileSync("./timeline.json", {
    encoding: 'utf-8'
});


handler2(null, timeline);