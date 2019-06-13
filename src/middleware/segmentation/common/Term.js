const { Nature } = require("../../corpus/tag/Nature");

/**
 * 一个单词，用户可以直接访问此单词的全部属性
 */
class Term {
    constructor(word, nature) {
        this.word = word; //词语
        this.nature = nature; //词性
        this.offset; //在文本中的起始位置
    }
    toString() {
        return this.word + "/" + this.nature;
    }
    length() {
        return this.word.length;
    }
}
module.exports = Term;
