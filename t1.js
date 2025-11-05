var J = Object.defineProperty;
var X = (h, t, s) => t in h ? J(h, t, {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: s
}) : h[t] = s;

var d = (h, t, s) => X(h, typeof t != "symbol" ? t + "" : t, s);

const gt = [1779033703, -1150833019, 1013904242, -1521486534, 1359893119, -1694144372, 528734635, 1541459225]
  , _t = [1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993, -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987, 1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885, -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872, -1866530822, -1538233109, -1090935817, -965641998]
  , kt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
  , N = [];
class bt {
    constructor() {
        d(this, "_data", new E);
        d(this, "_hash", new E([...gt]));
        d(this, "_nDataBytes", 0);
        d(this, "_minBufferSize", 0)
    }
    finalize(t) {
        t && this._append(t);
        const s = this._nDataBytes * 8
          , e = this._data.sigBytes * 8;
        return this._data.words[e >>> 5] |= 128 << 24 - e % 32,
        this._data.words[(e + 64 >>> 9 << 4) + 14] = Math.floor(s / 4294967296),
        this._data.words[(e + 64 >>> 9 << 4) + 15] = s,
        this._data.sigBytes = this._data.words.length * 4,
        this._process(),
        this._hash
    }
    _doProcessBlock(t, s) {
        const e = this._hash.words;
        let i = e[0]
          , n = e[1]
          , u = e[2]
          , o = e[3]
          , w = e[4]
          , a = e[5]
          , y = e[6]
          , v = e[7];
        for (let f = 0; f < 64; f++) {
            if (f < 16)
                N[f] = t[s + f] | 0;
            else {
                const D = N[f - 15]
                  , k = (D << 25 | D >>> 7) ^ (D << 14 | D >>> 18) ^ D >>> 3
                  , P = N[f - 2]
                  , F = (P << 15 | P >>> 17) ^ (P << 13 | P >>> 19) ^ P >>> 10;
                N[f] = k + N[f - 7] + F + N[f - 16]
            }
            const O = w & a ^ ~w & y
              , z = i & n ^ i & u ^ n & u
              , m = (i << 30 | i >>> 2) ^ (i << 19 | i >>> 13) ^ (i << 10 | i >>> 22)
              , G = (w << 26 | w >>> 6) ^ (w << 21 | w >>> 11) ^ (w << 7 | w >>> 25)
              , L = v + G + O + _t[f] + N[f]
              , V = m + z;
            v = y,
            y = a,
            a = w,
            w = o + L | 0,
            o = u,
            u = n,
            n = i,
            i = L + V | 0
        }
        e[0] = e[0] + i | 0,
        e[1] = e[1] + n | 0,
        e[2] = e[2] + u | 0,
        e[3] = e[3] + o | 0,
        e[4] = e[4] + w | 0,
        e[5] = e[5] + a | 0,
        e[6] = e[6] + y | 0,
        e[7] = e[7] + v | 0
    }
    _append(t) {
        typeof t == "string" && (t = E.fromUtf8(t)),
        this._data.concat(t),
        this._nDataBytes += t.sigBytes
    }
    _process(t) {
        let s, e = this._data.sigBytes / 64;
        t ? e = Math.ceil(e) : e = Math.max((e | 0) - this._minBufferSize, 0);
        const i = e * 16
          , n = Math.min(i * 4, this._data.sigBytes);
        if (i) {
            for (let u = 0; u < i; u += 16)
                this._doProcessBlock(this._data.words, u);
            s = this._data.words.splice(0, i),
            this._data.sigBytes -= n
        }
        return new E(s,n)
    }
}
class E {
    constructor(t, s) {
        d(this, "words");
        d(this, "sigBytes");
        t = this.words = t || [],
        this.sigBytes = s === void 0 ? t.length * 4 : s
    }
    static fromUtf8(t) {
        const s = unescape(encodeURIComponent(t))
          , e = s.length
          , i = [];
        for (let n = 0; n < e; n++)
            i[n >>> 2] |= (s.charCodeAt(n) & 255) << 24 - n % 4 * 8;
        return new E(i,e)
    }
    toBase64() {
        const t = [];
        for (let s = 0; s < this.sigBytes; s += 3) {
            const e = this.words[s >>> 2] >>> 24 - s % 4 * 8 & 255
              , i = this.words[s + 1 >>> 2] >>> 24 - (s + 1) % 4 * 8 & 255
              , n = this.words[s + 2 >>> 2] >>> 24 - (s + 2) % 4 * 8 & 255
              , u = e << 16 | i << 8 | n;
            for (let o = 0; o < 4 && s * 8 + o * 6 < this.sigBytes * 8; o++)
                t.push(kt.charAt(u >>> 6 * (3 - o) & 63))
        }
        return t.join("")
    }
    concat(t) {
        if (this.words[this.sigBytes >>> 2] &= 4294967295 << 32 - this.sigBytes % 4 * 8,
        this.words.length = Math.ceil(this.sigBytes / 4),
        this.sigBytes % 4)
            for (let s = 0; s < t.sigBytes; s++) {
                const e = t.words[s >>> 2] >>> 24 - s % 4 * 8 & 255;
                this.words[this.sigBytes + s >>> 2] |= e << 24 - (this.sigBytes + s) % 4 * 8
            }
        else
            for (let s = 0; s < t.sigBytes; s += 4)
                this.words[this.sigBytes + s >>> 2] = t.words[s >>> 2];
        this.sigBytes += t.sigBytes
    }
}

function Bt(h) {
    return new bt().finalize(h).toBase64()
}

let a = Bt("['$Y_-N4Q-pUC','/api/fastdown/v1/getID?paged=143&key=X28JxXeMvRmjHQZyTDEN','GET',undefined]");

console.log(a);

let encr = "529A4994E0C3596423D7A4A8F189926F15813C50AA4C8ADDFB8BB107FD162D95377F0655AF01369FBB427EBBD61C3AF83097CE4D78334FA114A245D4EAC0673294F2D1F84E42C854E5A4BAA2CE9E0F8A99CC9A2436B559CEEBAC9A08CC887F49274338F6F0E6354F1E31971C33EC1E0385B46313DDCC2F269720321B248E079AA880BDCEB8C7960C824335C458A702C9940D8255591E1E39C345AC263D67FE0BF8481250B08561CFAF44E5B3EB21739F166E15B1DF536C2263CB3F2A263F8D8E3C80D42C6A7C382BDEAC8846B9A202196BF0914A8141B57CA567AAE11DF7BC2C698C52E5E615C1FEC1846E2DBD1B3FC5A2E9404529B25A2692950806519D91FE0FEFBE675E0E3F35787B78E23542270F5DE4EAFDDDA6B1EA5C13CB51F38D42BD0C9E215977F9A44FE67ECB7363A2959E887A39C6FCE751950299D96185EF2B1363F1716BF148274A4BDEC96017EEDD08472AF541D709835CC9D26B66620188D13F8E205C42A61C960293002EB13DF36F25E82898EED5A16E7D003CA19429D590A6836909A7BE6000BFCF23AA329361B048264042765191456BAC2C6809CB0D1B253745E314DD78DD8FE4291CDB29CAE0E10B0EB3BB5BF0432D73B8085E4250D63D5C8185EE218496615ABBDC57A21B167A73132F42CE529A02CDA8C9975B825A364176A5743B3251673EF935FB4081FE6ABF87EBC71647EE8A10524DB6B654F76D5455E52C07C131A9EA1C94AC5B5796282C94600E4C030182ED27609D98FFB4B9B55786161332316C9222561D05400CE2CFAD47DAC70499F21F48AC78769E6E918BB14171A2BDB772D9D210C4D5332FDC94BFBC700D28C185A5B09C388AFA44556710E1C905E09477F71C402EDF50FEF82C58696E55DF9546A6F841B2256E26CED6C1949A13AA71D6090636790E95E4C45FBD42AA5FA4300B2F9CD52384AA3E3893C8324FEC15D7DB8C8ABAB9E6405E3D46F6E7BF54AB211AC6994E237C28D4F0383BFC34E90FF7D31015B581D08C3B2C15F1606D765C159CAA3710593F1CF5";