/**
 * 等效词编译器
 *
 */
const Predefine = require("../../../utils/Predefine");
class PosTagCompiler {
    /**
     * 编译，比如将词性为数词的转为##数##
     * @param tag 标签
     * @param name 原词
     * @return 编译后的等效词
     */
    compile(tag, name) {
        if (startWith(tag, "m")) {
            return new Predefine().TAG_NUMBER;
        } else if (startWith(tag, "nr")) {
            return new Predefine().TAG_PEOPLE;
        } else if (startWith(tag, "ns")) {
            return new Predefine().TAG_PLACE;
        } else if (startWith(tag, "nt")) {
            return new Predefine().TAG_GROUP;
        } else if (startWith(tag, "t")) {
            return new Predefine().TAG_TIME;
        } else if (tag == "x") {
            return new Predefine().TAG_CLUSTER;
        } else if (tag == "nx") {
            return new Predefine().TAG_PROPER;
        } else if (tag == "xx") {
            return new Predefine().TAG_OTHER;
        }
        return name;
    }
}
/**
 *判断tag是否以s开头
 * @param {字符串} tag
 * @param {字符串} s
 */
const startWith = (tag, s) => {
    if (s == null || s == "" || tag.length == 0 || s.length > tag.length) {
        return false;
    }

    if (tag.substr(0, s.length) == s) {
        return true;
    } else {
        return false;
    }
    return true;
};

module.exports = PosTagCompiler;
