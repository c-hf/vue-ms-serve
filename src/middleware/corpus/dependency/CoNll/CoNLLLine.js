/**
 * CoNLL语料中的一行
 */
const StringBuilder = require("../../../utils/StringBuilder");
class CoNllLine {
    constructor() {
        this.value = new Array(10); //十个值
        this.id; //第一个值化为id
        this.CoNllLine(arguments[0]);
    }
    CoNllLine() {
        // console.log(arguments[0]);
        let length = Math.min(arguments[0].length, this.value.length);
        for (let i = 0; i < length; i++) {
            this.value[i] = arguments[0][i];
        }
        this.id = this.value[0];
    }
    toString() {
        let sb = new StringBuilder();
        for (let value of this.value) {
            sb.append(value);
            sb.append("\t");
        }
        return sb.deleteCharAt(sb.size() - 1).toString();
    }
}
module.exports = CoNllLine;
