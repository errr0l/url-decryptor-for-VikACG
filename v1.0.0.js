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