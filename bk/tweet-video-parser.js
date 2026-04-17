// ==UserScript==
// @name         推文视频解析工具
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  将推文中的视频解析，并供下载(实际表现为在新页打开视频)
// @author       err0l@qq.com
// @match        https://x.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @grant        window.onurlchange
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    const targets = new Map();
    // 以【tweetId:data】的形式保存
    const tweetVideoMap = new Map();
    const tweetIdPattern = /status\/([0-9]+)/;
    const open = XMLHttpRequest.prototype.open;
    const send = XMLHttpRequest.prototype.send;

    // XHR hook
    function hook() {
        XMLHttpRequest.prototype.open = function (method, url) {
            this._url = url;
            this._method = method;
            open.apply(this, arguments);
        };
        XMLHttpRequest.prototype.send = function (body) {
            const xhr = this;
            const onreadystatechange = xhr.onreadystatechange;
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
                    let target = targets.get(xhr._url) || null;
                    if (!target) {
                        for (const key of targets.keys()) {
                            if (xhr._url.includes(key)) {
                                target = targets.get(key);
                                break;
                            }
                        }
                        targets.set(xhr._url, target);
                    }
                    target && target.b(xhr._url, xhr.responseText, target);
                }
                if (onreadystatechange) {
                    onreadystatechange.apply(this, arguments);
                }
            };
            send.apply(xhr, arguments);
        };
        hook.hooked = true;
    }
    hook.reset = () => {
        XMLHttpRequest.prototype.open = open;
        XMLHttpRequest.prototype.send = send;
        hook.hooked = false;
    }
    // 过滤切片
    function mp4Filter(media) {
        return media.video_info?.variants?.filter(item => item.content_type.includes("mp4")) || [];
    }
    // 可能是'/TweetResultByRestId'和'/TweetDetail'的其中之一；
    // 调用过一次即可
    function handler(a, b, _this) {
        try {
            if (tweetVideoMap.get(_this.d)?.length) {
                return;
            }
            const response = JSON.parse(b);
            const media = getMedia(_this.c(response))
                .map(item => mp4Filter(item))
                .filter(item => item.length);
            if (media.length) {
                tweetVideoMap.set(_this.d, media);
                installDownloadBtn(document, 5, _this.d);
            }
            hook.reset();
        }
        catch (error) {
            console.log(error);
        }
    }

    // 敏感内容
    function sensitiveFilter(result) {
        if (!result) {
            return {};
        }
        if (result.__typename === "TweetWithVisibilityResults") {
            return result.tweet;
        }
        return result;
    }

    // 有几种类型：
    // 1）转推：若存在视频，只会在原推里，retweeted_status_result；目前看到有两个地方，一个是result.retweeted_status_result.result.legacy.entities.media，另一个是result.legacy.retweeted_status_result.result.legacy.entities.media；
    // 2）引用推：双方都存在视频，quoted_status_result和legacy；
    // 3）普通推：可能存在视频，legacy
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
    function download(id, ev) {
        ev.preventDefault();
        // 目前，假设最多只有一个视频，所以无法覆盖
        // 应该改为：{{id: {引用, 自身}}}
        const media = tweetVideoMap.get(id);
        if (media.length) {
            let videos;
            if (media.length > 1) {
                let index = window.prompt("1 -> 下载原推视频; 2 -> 下载引用视频, 请输入：");
                if (/\d/.test(index) && (index = +index) && (index == 0 || index == 1)) {
                    videos = media[index];
                }
            }
            else {
                videos = media[0];
            }
            if (videos) {
                const url = videos[videos.length - 1].url;
                let a = document.createElement("a");
                a.setAttribute("target", "_blank");
                a.style.display = 'none';
                a.href = url;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        }
        else {
            window.alert("无数据");
        }
    }
    /**
     * 安装按钮
     * @param {Node} rootNode 相对节点
     * @param {Number} retry 重试次数
     * @param {String} id 推文id; 准确来说，是/{username}/status/{id}
     */
    function installDownloadBtn(rootNode, retry = 5, id) {
        const GrokActions = rootNode.querySelector('[aria-label="Grok actions"]');
        if (!GrokActions) {
            setTimeout(() => {
                if (retry > 0) {
                    installDownloadBtn(rootNode, retry - 1, id);
                }
                else {
                    console.log(`[installDownloadBtn:${id}:失败:已到达最大次数]`);
                }
            }, 2000);
            return;
        }
        const GrokActionsParent = GrokActions.parentNode
        const btn = GrokActionsParent.cloneNode(true);
        btn.setAttribute("title", "下载视频");
        const svg = btn.querySelector('svg');
        svg.setAttribute("viewBox", "0 0 24 24")
        svg.querySelector("path").setAttribute("d", "M11.99 16l-5.7-5.7L7.7 8.88l3.29 3.3V2.59h2v9.59l3.3-3.3 1.41 1.42-5.71 5.7zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z");
        GrokActionsParent.parentNode.insertBefore(btn, GrokActionsParent);
        btn.addEventListener('click', download.bind(null , id));
    }
    const nodes = new Set();
    let timerForChecker;

    function startChecker() {
        if (timerForChecker) {
            return;
        }
        timerForChecker = setInterval(() => {
            const toDel = [];
            for (const node of nodes) {
                const article = node.querySelector('article');
                if (article) {
                    installDownloadBtnForHomePage(article);
                    toDel.push(node);
                }
            }
            for (const item of toDel) {
                nodes.delete(item);
            }
            if (!nodes.size) {
                clearInterval(timerForChecker);
                timerForChecker = null;
            }
        }, 2000);
    }
    const installDownloadBtnForHomePage = (node) => {
        const linkA = node.querySelector('time')?.parentNode;
        if (!linkA) {
            return;
        }
        const href = linkA.getAttribute("href");
        const matched = href.match(tweetIdPattern);
        if (matched) {
            const tweetId = matched[1];
            if (tweetVideoMap.has(tweetId) && !node.getAttribute("handled")) {
                installDownloadBtn(node, 5, tweetId);
                node.setAttribute("handled", 1);
            }
        }
    };
    function init(url = "") {
        if (targets.size) {
            targets.clear();
        }
        if (url.includes("status")) {
            const matched = url.match(tweetIdPattern);
            const tweetId = matched[1];
            targets.set("/TweetResultByRestId", {
                b: handler,
                c: response => response.data.tweetResult.result,
                d: tweetId
            });
            targets.set("/TweetDetail", {
                b: handler,
                c: response => response.data.threaded_conversation_with_injections_v2.instructions[1].entries[0].content.itemContent.tweet_results.result,
                d: tweetId
            });
        }
        else {
            targets.set("/HomeTimeline", {
                b: handler2
            });
            new MutationObserver(mutations => {
                for (const mutation of mutations) {
                    if (mutation.type === "childList") {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType !== 1) {
                                continue;
                            }
                            if (node.getAttribute("data-testid") === "cellInnerDiv") {
                                nodes.add(node);
                                startChecker();
                            }
                        }
                    }
                }
            }).observe(document.body, { subtree: true, childList: true });
        }
        if (!hook.hooked) {
            hook();
        }
    }
    init(window.location.href);
    if (window.onurlchange === null) {
        window.addEventListener('urlchange', (info) => {
            init(info.url);
        });
    }
})();