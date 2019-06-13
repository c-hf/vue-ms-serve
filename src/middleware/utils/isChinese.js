const PATTERN_ONE = /^[\u4e00-\u9fa5]+$/; //至少出现一次中文字符，且以中文字符开头和结束
const PATTERN_TWO = /^[\u4e00-\u9fa5]{2,}$/; //至少出现两次中文字符，且以中文字符开头和结束
const PATTERN = /[\u4e00-\u9fa5]+/; //是否是中文

const isChineseCharAndLengthAtLeastOne = word => {
    if (PATTERN_ONE.test(word)) {
        return true;
    }
    return false;
};
const isChineseCharAndLengthAtLeastTwo = word => {
    if (PATTERN_TWO.test(word)) {
        return true;
    }
    return false;
};
const isChineseChar = word => {
    if (PATTERN.test(word)) {
        return true;
    }
    return false;
};
module.exports = {
    isChineseCharAndLengthAtLeastOne: isChineseCharAndLengthAtLeastOne,
    isChineseCharAndLengthAtLeastTwo: isChineseCharAndLengthAtLeastTwo,
    isChineseChar: isChineseChar
};
