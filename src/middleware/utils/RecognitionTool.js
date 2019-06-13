/**
 * 分词特殊情况识别工具
 * 如英文单词、数字、时间等
 */

class RecognitionTool {
    constructor() {
        this.chineseNumbers = [
            "一",
            "二",
            "三",
            "四",
            "五",
            "六",
            "七",
            "八",
            "九",
            "十",
            "百",
            "千",
            "万",
            "亿",
            "零",
            "壹",
            "贰",
            "叁",
            "肆",
            "伍",
            "陆",
            "柒",
            "捌",
            "玖",
            "拾",
            "佰",
            "仟",
            "〇"
        ]; //中国数字
    }
    /**
     * 识别文本（英文单词、数字、时间等）
     * @param text 识别文本
     * @return 是否识别
     */
    firstRecog(text) {
        return this.recog(text, 0, text.length);
    }
    /**
     * 识别文本（英文单词、数字、时间等）
     * @param text 识别文本
     * @param start 待识别文本开始索引
     * @param len 识别长度
     * @return 是否识别
     */
    recog(text, start, len) {
        return (
            this.isEnglishAndNumberMix(text, start, len) ||
            this.isFraction(text, start, len) ||
            this.isQuantifier(text, start, len) ||
            this.isChineseNumber(text, start, len)
        );
    }
    /**
     * 小数和分数识别
     * @param text 识别文本
     * @return 是否识别``
     */
    firstIsFraction(text) {
        return this.isFraction(text, 0, text.length);
    }
    /**
     * 小数和分数识别
     * @param text 识别文本
     * @param start 待识别文本开始索引
     * @param len 识别长度
     * @return 是否识别
     */
    isFraction(text, start, len) {
        if (len < 3) {
            return false;
        }
        let index = -1;
        for (let i = start; i < start + len; i++) {
            let c = text.charAt(i);
            if (c == "." || c == "/" || c == "／" || c == "．" || c == "·") {
                index = i;
                break;
            }
        }
        if (index == -1 || index == start || index == start + len - 1) {
            return false;
        }
        let beforeLen = index - start;
        return (
            this.isNumber(text, start, beforeLen) &&
            this.isNumber(text, index + 1, len - (beforeLen + 1))
        );
    }
    /**
     * 英文字母和数字混合识别，能识别纯数字、纯英文单词以及混合的情况
     * @param text 识别文本
     * @param start 待识别文本开始索引
     * @param len 识别长度
     * @return 是否识别
     */
    isEnglishAndNumberMix(text, start, len) {
        for (let i = start; i < start + len; i++) {
            let c = text.charAt(i);
            if (!(this.isEnglishCode(c) || this.isNumberCode(c))) {
                return false;
            }
        }
        //指定的字符串已经识别为英文字母和数字混合串
        //下面要判断英文字母和数字混合串是否完整
        if (start > 0) {
            //判断前一个字符，如果为英文字符或数字则识别失败
            let c = text.charAt(start - 1);
            if (!this.isEnglishCode(c) || this.isNumberCode(c)) {
                return false;
            }
        }
        if (start + len < text.length) {
            //判断后一个字符，如果为英文字符或数字则识别失败
            let c = text.charAt(start + len);
            if (this.isEnglishCode(c) || this.isNumberCode(c)) {
                return false;
            }
        }
        console.debug(
            "识别出英文字母和数字混合串:" + text.substring(start, start + len)
        );
        return true;
    }
    /**
     * 英文单词识别
     * @param text 识别文本
     * @return 是否识别
     */
    firstIsEnglish(text) {
        return this.isEnglish(text, 0, text.length);
    }
    /**
     * 英文单词识别
     * @param text 识别文本
     * @param start 待识别文本开始索引
     * @param len 识别长度
     * @return 是否识别
     */
    isEnglish(text, start, len) {
        for (let i = start; i < start + len; i++) {
            let c = text.charAt(i);
            if (!this.isEnglishCode(c)) {
                return false;
            }
        }
        //指定的字符串已经识别为英文串
        //下面要判断英文串是否完整
        if (start > 0) {
            //判断前一个字符，如果为英文字符则识别失败
            let c = text.charAt(start - 1);
            if (this.isEnglishCode(c)) {
                return false;
            }
        }
        if (start + len < text.length) {
            //判断后一个字符，如果为英文字符则识别失败
            let c = text.charAt(start + len);
            if (this.isEnglishCode(c)) {
                return false;
            }
        }
        console.debug("识别出英文单词:" + text.substring(start, start + len));
        return true;
    }
    /**
     * 英文字符识别，包括大小写，包括全角和半角
     * @param c 字符
     * @return 是否是英文字符
     */
    isEnglishCode(c) {
        //大部分字符在这个范围
        if (c > "z" && c < "Ａ") {
            return false;
        }
        if (c < "A") {
            return false;
        }
        if (c > "Z" && c < "a") {
            return false;
        }
        if (c > "Ｚ" && c < "ａ") {
            return false;
        }
        if (c > "ｚ") {
            return false;
        }
        return true;
    }
    /**
     * 数量词识别，如日期、时间、长度、容量、重量、面积等等
     * @param text 识别文本
     * @return 是否识别
     */
    firstIsQuantifier(text) {
        return this.isQuantifier(text, 0, text.length);
    }
    /**
     * 数量词识别，如日期、时间、长度、容量、重量、面积等等
     * @param text 识别文本
     * @param start 待识别文本开始索引
     * @param len 识别长度
     * @return 是否识别
     */
    isQuantifier(text, start, len) {
        if (len < 2) {
            return false;
        }
        //避免量词和不完整小数结合
        //.的值是46,/的值是47
        //判断前一个字符是否是.或/
        let index = start - 1;
        if (
            (index > -1 && text.charAt(index) == 46) ||
            text.charAt(index) == 47
        ) {
            return false;
        }
        let lastChar = text.charAt(start + len - 1);
        if (
            this.isNumber(text, start, len - 1) ||
            this.isChineseNumber(text, start, len - 1) ||
            this.isFraction(text, start, len - 1)
        ) {
            console.debug("识别数量词:" + text.substring(start, start + len));
            return true;
        }
        return false;
    }

    /**
     * 数字识别
     * @param text 识别文本
     * @return 是否识别
     */
    firstIsNumber(text) {
        return this.isNumber(text, 0, text.length);
    }
    /**
     * 数字识别
     * @param text 识别文本
     * @param start 待识别文本开始索引
     * @param len 识别长度
     * @return 是否识别
     */
    isNumber(text, start, len) {
        for (let i = start; i < start + len; i++) {
            let c = text.charAt(i);
            if (!this.isNumberCode(c)) {
                return false;
            }
        }
        //指定的字符串已经识别为数字串
        //下面要判断数字串是否完整
        if (start > 0) {
            //判断前一个字符，如果为数字字符则识别失败
            let c = text.charAt(start - 1);
            if (this.isNumberCode(c)) {
                return false;
            }
        }
        if (start + len < text.length) {
            //判断前一个字符，如果为数字字符则识别失败
            let c = text.charAt(start + len);
            if (this.isNumberCode(c)) {
                return false;
            }
        }
        console.debug("识别出数字:" + text.substring(start, start + len));
        return true;
    }

    /**
     * 阿拉伯数字识别，包括全角和半角
     * @param c 字符
     * @return 是否是阿拉伯数字
     */
    isNumberCode(c) {
        //大部分字符在这个范围
        if (c > "9" && c < "０") {
            return false;
        }
        if (c < "0") {
            return false;
        }
        if (c > "９") {
            return false;
        }
        return true;
    }

    /**
     * 中文数字识别，包括大小写
     * @param text 识别文本
     * @return 是否识别
     */
    firstIsChineseNumber(text) {
        return this.isChineseNumber(text, 0, text.length);
    }
    isChineseNumber(text, start, len) {
        for (let i = start; i < start + len; i++) {
            let c = text.charAt(i);
            let isChineseNumber = false;
            for (let chineseNumber of this.chineseNumbers) {
                if (c == chineseNumber) {
                    isChineseNumber = true;
                    break;
                }
            }
            if (!isChineseNumber) {
                return false;
            }
        }
        //指定的字符串已经识别为中文数字串
        //下面要判断中文数字串是否完整
        if (start > 0) {
            //判断前一个字符，如果为中文数字字符则识别失败
            let c = text.charAt(start - 1);
            for (let chineseNumber of this.chineseNumbers) {
                if (c == chineseNumber) {
                    return false;
                }
            }
        }
        if (start + len < text.length) {
            //判断后一个字符，如果为中文数字字符则识别失败
            let c = text.charAt(start + len);
            for (let chineseNumber of this.chineseNumbers) {
                if (c == chineseNumber) {
                    return false;
                }
            }
        }
        console.debug("识别出中文数字:" + text.substring(start, start + len));
        return true;
    }
}

module.exports = RecognitionTool;
/////////////////////test////////////////////////////////
// const recognitionTool = new RecognitionTool();
// let t = "一";

// recognitionTool.firstIsFraction(t);
// console.log("" + recognitionTool.firstRecog(t));
// console.log(" 1: " + recognitionTool.isEnglishAndNumberMix(t, 0, t.length));
// console.log(" 2: " + recognitionTool.firstIsFraction(t));
// console.log(" 3: " + recognitionTool.firstIsQuantifier(t));
// console.log(" 4: " + recognitionTool.firstIsChineseNumber(t));
// console.log(" 5: " + recognitionTool.firstIsEnglish(t));
// console.log(" 6: " + recognitionTool.firstIsNumber(t));
// console.log(" 7: " + recognitionTool.isNumberCode(t));
// console.log(" 8: " + recognitionTool.isEnglishCode(t));
