/**
 *  停用词判定
 */
const { Path } = require("../utils/Path");
const fs = require("fs");
const data = fs.readFileSync(Path.StopWordDictionaryPath, "utf8");
class StopWord {
    constructor() {
        this.stopwords = new Set();
    }
    clear() {
        this.stopwords.clear();
    }
    load(lines) {
        console.log("初始化停用词");
        for (let line of lines) {
            if (!this.isStopChar(line)) {
                this.stopwords.add(line);
            }
        }
        console.log("停用词初始化完毕，停用词个数：" + this.stopwords.size);
    }
    add(line) {
        if (!this.isStopChar(line)) {
            this.isStopChar.add(line);
        }
    }
    remove(line) {
        if (!this.isStopChar(line)) {
            this.isStopChar.delete(line);
        }
    }
    loadAndWatch() {
        if (!data) {
            console.log("没有词典资源可以加载");
            return;
        }
        console.log("开始加载资源");
        let result = data.split("\n"); //把字符串转化成数组
        console.log("加载停用词词典" + result.length + "行");
        //调用自定义加载逻辑
        this.clear();
        this.load(result);
    }
    isStopChar(word) {
        if (word.length == 1) {
            let _char = word.charCodeAt(0);
            if (_char < 48) {
                return true;
            }
            if (_char > 57 && _char < 19968) {
                return true;
            }
            if (_char > 40869) {
                return true;
            }
        }
        return false;
    }
    /**
     * 判断一个词是否是停用词
     */
    is(word) {
        if (word == null) {
            return false;
        }
        word = word.trim();
        return this.isStopChar(word) || this.stopwords.has(word);
    }
    /** 过滤停用词
     * @param {word}是一个数组
     */

    stopWord(word) {
        let arr = [];
        if (word.length > 0) {
            for (let i = 0; i < word.length; i++) {
                if (this.is(word[i])) {
                    continue;
                }
                arr.push(word[i]);
            }
        }

        return arr;
    }
}
module.exports = StopWord;
//////////////////test////////////////////////
// let stopWord = new StopWord();
// let word = ["把", "卧室", "的", "吸顶灯", "打开"];
// stopWord.loadAndWatch();
// console.log(stopWord.is("把"));
// console.log(stopWord.stopWord(word));
