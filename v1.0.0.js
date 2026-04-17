// ==UserScript==
// @name         维咔vikacg体验改善小助手
// @version      0.0.1
// @description  由于先前维护去广告脚本的作者已经删库跑路，使得维咔一下子就回到了荒蛮时期，广告肆虐，用户苦不堪言🤢... 简直和cs一样，不是直接弹出无法关闭，就是点一下直接跳转，作为用户的权益已经被维咔狠狠地侵犯、满满地灌注了，实在受不了。此时此刻，总得有人站出来💪🏻... 代码是前脚本作者的遗留物，使用方式基本相同，并在此基础上做了一点优化和更新，具体看下面👇🏻：-大幅减少了脚本体积 -新增了极速下载资源的获取方式，希望能让大伙ghs舒服一点吧，阿门🙏🏻。
// @author       wuyiiiiii777
// @match        https://www.vikacg.com/p/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=vikacg.com
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';
  const targets = [];
  function hook(targets) {
    const open = XMLHttpRequest.prototype.open;
    const send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url) {
      this._url = url;
      return open.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function (body) {
      const xhr = this;
      const onreadystatechange = xhr.onreadystatechange;
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
          for (let target of targets) {
            if (xhr._url.includes(target.a)) {
              target.b(xhr._url, xhr.responseText);
            }
          }
        }
        if (onreadystatechange) {
          onreadystatechange.apply(this, arguments);
        }
      };
      return send.apply(xhr, arguments);
    };
    hook.reset = () => {
      XMLHttpRequest.prototype.open = open;
      XMLHttpRequest.prototype.send = send;
    }
  }
  function base64ToBytes(base64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = base64.replace(/=+$/, '');
    let bytes = [];
    for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      bc++ % 4) ? bytes.push(255 & bs >> (-2 * bc & 6)) : 0) buffer = chars.indexOf(buffer);
    return bytes;
  }
  async function aesCbcDecrypt(base64, key, iv) {
    const data = new Uint8Array(base64ToBytes(base64));
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv: iv },
      cryptoKey,
      data
    );
    return new Uint8Array(decrypted);
  }
  const ll = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  const lll = /.*?\((.*?)\)/;
  function handler(a, b) {
    const c = JSON.parse(b);
    if (c.code == 200) {
      if (c.data.hidden_content?.locked) {
        targets[0] = { a: '/getPostHiddenContent', b: handler };
        return;
      }
      const d = c.data.hidden_content?.content || c.data.content;
      for (let e of d) {
        const f = new Set(e.match(ll));
        if (!f.size) { continue; }
        for (const g of f) {
          I.push({
            i: g,
            iiii(ii) {
              const iii = ii.replace(lll, '$1');
              if (iii && g.includes(iii)) {
                this.iii = createNode();
                this.iii.href = g;
                return true;
              }
            }
          });
        }
      }
      setTimeout(() => { runner(); hook.reset(); }, defaultDelay);
    }
  }
  targets.push({ a: '/getPost', b: handler });
  hook(targets);
  const msg1 = "【复制成功】";
  const msg2 = "【复制】";
  const defaultDelay = 3000;
  const patterns = [/.*?e=(.*?)&?/, /.*?id=(.*?)&?/];
  let anchor = ".prose";
  const I = [];
  const cached = {};
  const CryptoJS = (function () {
    const Utf8 = {
      parse: str => new TextEncoder().encode(str),
      stringify: bytes => new TextDecoder().decode(bytes)
    };
    return { enc: { Utf8 }, AES: { decrypt: aesCbcDecrypt } };
  })();
  const key = CryptoJS.enc.Utf8.parse("7R75R3JZE2PZUTHH");
  const iv = CryptoJS.enc.Utf8.parse("XWO76NCVZM2X1UCU");

  function copyHandler(ev) {
    ev.preventDefault();
    const target = ev.target;
    const it = target.innerText;
    if (it === msg1) {
      return;
    }
    navigator.clipboard.writeText(target.href, true);
    target.innerText = msg1;
    setTimeout(() => {
      target.innerText = msg2;
    }, defaultDelay);
  }
  function filter(nodes) {
    const res = [];
    for (const node of nodes) {
      let href;
      const tagName = node.tagName;
      if (!node.getAttribute('decrypted') && (href = node.getAttribute(tagName === "SPAN" ? "to" : 'href'))?.includes("external")) {
        for (let i = 0; i < patterns.length; i++) {
          const pattern = patterns[i];
          if (pattern.test(href)) {
            node.matchedIndex = i;
            break;
          }
        }
        node.href = href;
        res.push(node);
      }
    }
    return res;
  }
  function createNode() {
    const ele = document.createElement('a');
    ele.style = "display: inline-block !important";
    ele.className = "hover:text-danger-500 text-blue";
    ele.innerText = msg2;
    ele.addEventListener('click', copyHandler);
    return ele;
  }
  const fn1 = [
    "let index1 = 0;",
    "for (let i=0; i<I.length; i++) {",
    "    let target = I[i];",
    "    for (let j=index1; j<candidates.length; j++) {",
    "        const candidate = candidates[j];",
    "        let v;",
    "        const pn = candidate.parentNode;",
    "        const fc = candidate.firstChild;",
    "        if ((v = fc.nodeValue) && target.iiii(v)) {",
    "            const i = pn?.parentNode || pn;",
    "            i.setAttribute(\"decrypted\", \"1\");",
    "            i.insertBefore(target.iii, i.childNodes[i.childNodes.length == 1 ? 0 : 1]);",
    "            index1 = ++j;",
    "            break;",
    "        }}}",
    "I.length = 0;"
  ];
  function dynamic(parts, ...args) {
    return new Function(...args, parts.join(""));
  }
  async function runner(callback) {
    const entry_content = document.querySelector(anchor);
    const target = entry_content;
    const candidates = [...target.querySelectorAll('a'), ...target.querySelectorAll('span')];
    let aList = filter(candidates);
    for (const item of aList) {
      let encrypted;
      const index = item.matchedIndex;
      const pattern = patterns[index];
      let href = cached[item.href] || "";
      const ele = createNode();
      if (!href) {
        if (index === 0) {
          encrypted = item.href.replace(pattern, "$1");
          // href = hy.decrypt(encrypted);
          href = await CryptoJS.AES.decrypt(encrypted, key, iv);
        }
        else if (index === 1) {
          const id = item.href.replace(pattern, "$1");
          encrypted = await getEncryptedData(id);
          if (encrypted) {
            // let decrypted = hy.decrypt(encrypted, parameters);
            let decrypted = await CryptoJS.AES.decrypt(encrypted, key, iv);
            let json_decrypted = JSON.parse(decrypted).data;
            href = json_decrypted.download.s3.us2;
          }
        }
        href && (cached[item.href] = href);
      }
      item.setAttribute("decrypted", "1");
      ele.href = href;
      item.parentNode.insertBefore(ele, item);
      I.push({
        i: item.textContent,
        ii: item.tagName.toLocaleLowerCase(),
        iii: ele,
        iiii(i) {
          return this.i === i;
        }
      });
    }
    if (!aList.length && I.length) {
      dynamic(fn1, "I", "candidates")(I, candidates);
    }
    typeof callback == 'function' && callback();
  }
  runner(check);
  let times = 1;
  let maxTimes = 5;
  function check() {
    setTimeout(() => {
      if (!document.querySelector(anchor).querySelectorAll('[decrypted]').length) {
        if (times > maxTimes) {
          return;
        }
        times++;
        runner(check);
      }
    }, defaultDelay * 2);
  }
  function addBtnGenerate(times) {
    setTimeout(() => {
      let bFooter = document.querySelector('.harmonyos-moon_fill');
      if (!bFooter) {
        if (times > 0) {
          return addBtnGenerate(--times);
        }
        else {
          return;
        }
      }
      let dataVx = bFooter.parentNode;
      let group = dataVx.parentNode;
      let _span = dataVx.children[1];
      const btnGenerate = document.createElement('div');
      btnGenerate.style = "display: inline-block !important";
      btnGenerate.className = dataVx.className;
      const i = document.createElement('i');
      i.className = "vikacg-bolt md vikacg-icon";
      const span = document.createElement('span');
      span.innerText = "解密&创建节点";
      span.className = _span.className;
      btnGenerate.appendChild(i);
      btnGenerate.appendChild(span);
      group.appendChild(btnGenerate);
      btnGenerate.addEventListener('click', runner);
    }, defaultDelay * (maxTimes - times));
  }
  addBtnGenerate(maxTimes);
  async function getEncryptedData(id) {
    let url = `https://www.vikacg.com/external/fastdown?id=${id}`;
    const resp = await fetch(url, {
      method: 'GET',
      credentials: 'same-origin'
    });
    let html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const script = doc.querySelector('script#\\__NUXT_DATA__[type="application/json"][data-ssr="true"]');
    if (script && script.textContent) {
      try {
        const jsonData = JSON.parse(script.textContent);
        const key = "$f" + Bt(`['$Y_-N4Q-pUC','/api/fastdown/v1/getID?paged=${id}&key=X28JxXeMvRmjHQZyTDEN','GET',undefined]`);
        const index = jsonData.findIndex(item => item[key]);
        if (index != -1) {
          return jsonData[index + 1];
        }
        else {
          console.error('解析失败');
        }
      }
      catch (e) {
        console.error('解析失败: ', e);
      }
    }
    else {
      console.error('解析失败');
    }
  }
})();

// "retweeted_status_result": {
//   "result": {
//       "__typename": "TweetWithVisibilityResults",
//       "tweet": {
//           "rest_id": "2008079397241442766",
//           "core": {
//               "user_results": {
//                   "result": {
//                       "__typename": "User",
//                       "id": "VXNlcjoxNzQ4NTU1NTc0NzA5NzkyNzY4",
//                       "rest_id": "1748555574709792768",
//                       "affiliates_highlighted_label": {},
//                       "avatar": {
//                           "image_url": "https://pbs.twimg.com/profile_images/1993237532327526409/GjAaulMb_normal.png"
//                       },
//                       "core": {
//                           "created_at": "Sat Jan 20 03:58:56 +0000 2024",
//                           "name": "麻豆-全球官方账号",
//                           "screen_name": "Mdapp12com"
//                       },
//                       "dm_permissions": {
//                           "can_dm": true
//                       },
//                       "follow_request_sent": false,
//                       "has_graduated_access": true,
//                       "is_blue_verified": false,
//                       "legacy": {
//                           "default_profile": true,
//                           "default_profile_image": false,
//                           "description": "始于欲望，合于性趣，忠于品质，久于热爱\n华语原创｜国产经典｜情色文学｜系列宇宙\n情欲宇宙的边界，与您一起探索\uD83D\uDD0D\n麻豆网址➡️  https://t.co/5WTc73XS0o \n麻豆APP➡️  https://t.co/RulQf70rz3\n获得第一手情欲作品\uD83D\uDE0D\uD83D\uDC49\uD83D\uDC4C\uD83D\uDCA6",
//                           "entities": {
//                               "description": {
//                                   "urls": [
//                                       {
//                                           "display_url": "madou.com",
//                                           "expanded_url": "https://madou.com",
//                                           "url": "https://t.co/5WTc73XS0o",
//                                           "indices": [
//                                               64,
//                                               87
//                                           ]
//                                       },
//                                       {
//                                           "display_url": "mdapp12.com",
//                                           "expanded_url": "https://mdapp12.com",
//                                           "url": "https://t.co/RulQf70rz3",
//                                           "indices": [
//                                               98,
//                                               121
//                                           ]
//                                       }
//                                   ]
//                               },
//                               "url": {
//                                   "urls": [
//                                       {
//                                           "display_url": "madou.com",
//                                           "expanded_url": "https://madou.com",
//                                           "url": "https://t.co/5WTc73XS0o",
//                                           "indices": [
//                                               0,
//                                               23
//                                           ]
//                                       }
//                                   ]
//                               }
//                           },
//                           "fast_followers_count": 0,
//                           "favourites_count": 602,
//                           "followers_count": 63186,
//                           "friends_count": 5,
//                           "has_custom_timelines": false,
//                           "is_translator": false,
//                           "listed_count": 112,
//                           "media_count": 747,
//                           "normal_followers_count": 63186,
//                           "pinned_tweet_ids_str": [
//                               "1999507603445952840"
//                           ],
//                           "possibly_sensitive": true,
//                           "profile_banner_url": "https://pbs.twimg.com/profile_banners/1748555574709792768/1764067911",
//                           "profile_interstitial_type": "sensitive_media",
//                           "statuses_count": 1073,
//                           "translator_type": "none",
//                           "url": "https://t.co/5WTc73XS0o",
//                           "want_retweets": false,
//                           "withheld_in_countries": []
//                       },
//                       "location": {
//                           "location": "忠于品质，久于热爱"
//                       },
//                       "media_permissions": {
//                           "can_media_tag": true
//                       },
//                       "parody_commentary_fan_label": "None",
//                       "profile_image_shape": "Circle",
//                       "professional": {
//                           "rest_id": "1751074185974251754",
//                           "professional_type": "Business",
//                           "category": [
//                               {
//                                   "id": 477,
//                                   "name": "Professional Services",
//                                   "icon_name": "IconBriefcaseStroke"
//                               }
//                           ]
//                       },
//                       "profile_bio": {
//                           "description": "始于欲望，合于性趣，忠于品质，久于热爱\n华语原创｜国产经典｜情色文学｜系列宇宙\n情欲宇宙的边界，与您一起探索\uD83D\uDD0D\n麻豆网址➡️  https://t.co/5WTc73XS0o \n麻豆APP➡️  https://t.co/RulQf70rz3\n获得第一手情欲作品\uD83D\uDE0D\uD83D\uDC49\uD83D\uDC4C\uD83D\uDCA6"
//                       },
//                       "privacy": {
//                           "protected": false
//                       },
//                       "relationship_perspectives": {
//                           "following": false
//                       },
//                       "tipjar_settings": {},
//                       "verification": {
//                           "verified": false
//                       },
//                       "profile_description_language": "zh"
//                   }
//               }
//           },
//           "unmention_data": {},
//           "edit_control": {
//               "edit_tweet_ids": [
//                   "2008079397241442766"
//               ],
//               "editable_until_msecs": "1767602011000",
//               "is_edit_eligible": true,
//               "edits_remaining": "5"
//           },
//           "is_translatable": true,
//           "views": {
//               "count": "809007",
//               "state": "EnabledWithCount"
//           },
//           "source": "<a href=\"https://mobile.twitter.com\" rel=\"nofollow\">Twitter Web App</a>",
//           "grok_analysis_button": true,
//           "legacy": {
//               "bookmark_count": 5044,
//               "bookmarked": false,
//               "created_at": "Mon Jan 05 07:33:31 +0000 2026",
//               "conversation_id_str": "2008079397241442766",
//               "display_text_range": [
//                   0,
//                   151
//               ],
//               "entities": {
//                   "hashtags": [
//                       {
//                           "indices": [
//                               126,
//                               131
//                           ],
//                           "text": "清爽夏日"
//                       },
//                       {
//                           "indices": [
//                               132,
//                               135
//                           ],
//                           "text": "按摩"
//                       },
//                       {
//                           "indices": [
//                               136,
//                               139
//                           ],
//                           "text": "巨乳"
//                       },
//                       {
//                           "indices": [
//                               140,
//                               143
//                           ],
//                           "text": "挑逗"
//                       }
//                   ],
//                   "media": [
//                       {
//                           "display_url": "pic.x.com/pficZ1RmSh",
//                           "expanded_url": "https://x.com/Mdapp12com/status/2008079397241442766/video/1",
//                           "id_str": "2008079087794073600",
//                           "indices": [
//                               152,
//                               175
//                           ],
//                           "media_key": "13_2008079087794073600",
//                           "media_url_https": "https://pbs.twimg.com/amplify_video_thumb/2008079087794073600/img/v3-IpuhxIzC0DGi1.jpg",
//                           "type": "video",
//                           "url": "https://t.co/pficZ1RmSh",
//                           "additional_media_info": {
//                               "monetizable": false
//                           },
//                           "ext_media_availability": {
//                               "status": "Available"
//                           },
//                           "sizes": {
//                               "large": {
//                                   "h": 1944,
//                                   "w": 1080,
//                                   "resize": "fit"
//                               },
//                               "medium": {
//                                   "h": 1200,
//                                   "w": 667,
//                                   "resize": "fit"
//                               },
//                               "small": {
//                                   "h": 680,
//                                   "w": 378,
//                                   "resize": "fit"
//                               },
//                               "thumb": {
//                                   "h": 150,
//                                   "w": 150,
//                                   "resize": "crop"
//                               }
//                           },
//                           "original_info": {
//                               "height": 1944,
//                               "width": 1080,
//                               "focus_rects": []
//                           },
//                           "allow_download_status": {
//                               "allow_download": true
//                           },
//                           "video_info": {
//                               "aspect_ratio": [
//                                   5,
//                                   9
//                               ],
//                               "duration_millis": 16405,
//                               "variants": [
//                                   {
//                                       "content_type": "application/x-mpegURL",
//                                       "url": "https://video.twimg.com/amplify_video/2008079087794073600/pl/Bz6u9M9_qyACIk7V.m3u8?tag=14"
//                                   },
//                                   {
//                                       "bitrate": 632000,
//                                       "content_type": "video/mp4",
//                                       "url": "https://video.twimg.com/amplify_video/2008079087794073600/vid/avc1/320x576/Lz9iuye-yHxkMnrj.mp4?tag=14"
//                                   },
//                                   {
//                                       "bitrate": 950000,
//                                       "content_type": "video/mp4",
//                                       "url": "https://video.twimg.com/amplify_video/2008079087794073600/vid/avc1/480x864/T0ldw8OzD85zq5Mh.mp4?tag=14"
//                                   },
//                                   {
//                                       "bitrate": 2176000,
//                                       "content_type": "video/mp4",
//                                       "url": "https://video.twimg.com/amplify_video/2008079087794073600/vid/avc1/720x1296/fvbvxs3kiKRONjKo.mp4?tag=14"
//                                   }
//                               ]
//                           },
//                           "media_results": {
//                               "result": {
//                                   "media_key": "13_2008079087794073600"
//                               }
//                           }
//                       }
//                   ],
//                   "symbols": [],
//                   "timestamps": [],
//                   "urls": [],
//                   "user_mentions": []
//               },
//               "extended_entities": {
//                   "media": [
//                       {
//                           "display_url": "pic.x.com/pficZ1RmSh",
//                           "expanded_url": "https://x.com/Mdapp12com/status/2008079397241442766/video/1",
//                           "id_str": "2008079087794073600",
//                           "indices": [
//                               152,
//                               175
//                           ],
//                           "media_key": "13_2008079087794073600",
//                           "media_url_https": "https://pbs.twimg.com/amplify_video_thumb/2008079087794073600/img/v3-IpuhxIzC0DGi1.jpg",
//                           "type": "video",
//                           "url": "https://t.co/pficZ1RmSh",
//                           "additional_media_info": {
//                               "monetizable": false
//                           },
//                           "ext_media_availability": {
//                               "status": "Available"
//                           },
//                           "sizes": {
//                               "large": {
//                                   "h": 1944,
//                                   "w": 1080,
//                                   "resize": "fit"
//                               },
//                               "medium": {
//                                   "h": 1200,
//                                   "w": 667,
//                                   "resize": "fit"
//                               },
//                               "small": {
//                                   "h": 680,
//                                   "w": 378,
//                                   "resize": "fit"
//                               },
//                               "thumb": {
//                                   "h": 150,
//                                   "w": 150,
//                                   "resize": "crop"
//                               }
//                           },
//                           "original_info": {
//                               "height": 1944,
//                               "width": 1080,
//                               "focus_rects": []
//                           },
//                           "allow_download_status": {
//                               "allow_download": true
//                           },
//                           "video_info": {
//                               "aspect_ratio": [
//                                   5,
//                                   9
//                               ],
//                               "duration_millis": 16405,
//                               "variants": [
//                                   {
//                                       "content_type": "application/x-mpegURL",
//                                       "url": "https://video.twimg.com/amplify_video/2008079087794073600/pl/Bz6u9M9_qyACIk7V.m3u8?tag=14"
//                                   },
//                                   {
//                                       "bitrate": 632000,
//                                       "content_type": "video/mp4",
//                                       "url": "https://video.twimg.com/amplify_video/2008079087794073600/vid/avc1/320x576/Lz9iuye-yHxkMnrj.mp4?tag=14"
//                                   },
//                                   {
//                                       "bitrate": 950000,
//                                       "content_type": "video/mp4",
//                                       "url": "https://video.twimg.com/amplify_video/2008079087794073600/vid/avc1/480x864/T0ldw8OzD85zq5Mh.mp4?tag=14"
//                                   },
//                                   {
//                                       "bitrate": 2176000,
//                                       "content_type": "video/mp4",
//                                       "url": "https://video.twimg.com/amplify_video/2008079087794073600/vid/avc1/720x1296/fvbvxs3kiKRONjKo.mp4?tag=14"
//                                   }
//                               ]
//                           },
//                           "media_results": {
//                               "result": {
//                                   "media_key": "13_2008079087794073600"
//                               }
//                           }
//                       }
//                   ]
//               },
//               "favorite_count": 11142,
//               "favorited": false,
//               "full_text": "《夏⽇美乳少妇的⾊按初体验 / 挑逗G点手法全身颤抖痉挛 / MD-0356》\n汗水和暧昧，一起滴落在盛夏。\n热浪、触摸、呻吟、心跳。\n\uD83D\uDD25 她不是危险，而是欲望的引爆点。\n\uD83D\uDD25 太热了，所以没人能装作冷静。\n\n本片由：麻豆女神  艾熙 领衔主演！\n含： #清爽夏日、#按摩、#巨乳、#挑逗  等劲爆元素！ https://t.co/pficZ1RmSh",
//               "is_quote_status": false,
//               "lang": "zh",
//               "possibly_sensitive": true,
//               "possibly_sensitive_editable": false,
//               "quote_count": 1,
//               "reply_count": 46,
//               "retweet_count": 3276,
//               "retweeted": false,
//               "user_id_str": "1748555574709792768",
//               "id_str": "2008079397241442766"
//           }
//       },
//       "mediaVisibilityResults": {
//           "blurred_image_interstitial": {
//               "interstitial_action": "AgeVerificationPrompt",
//               "opacity": 0.8,
//               "text": {
//                   "rtl": false,
//                   "text": "X labeled this post as containing Adult Content.",
//                   "entities": []
//               },
//               "title": {
//                   "rtl": false,
//                   "text": "Content warning: Adult Content",
//                   "entities": []
//               }
//           }
//       }
//   }
// }