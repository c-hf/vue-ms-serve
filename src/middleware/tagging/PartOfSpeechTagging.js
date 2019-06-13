const GenericTrie = require("../utils/GenericTrie");
const RecognitionTool = require("../utils/RecognitionTool");
const fs = require("fs");
const Term = require("../segmentation/common/Term");
const { Path } = require("../utils/Path");
const data = fs.readFileSync(Path.PartOfSpeechDictionaryPath, "utf8");
const PartOfSpeech = require("./PartOfSpeech");
const StringBuilder = require("../utils/StringBuilder");
/**
 * 词性标注
 */
class PartOfSpeechTagging {
    constructor() {
        this.GENERIC_TRIE = new GenericTrie();
    }
    clear() {
        this.GENERIC_TRIE.clear();
    }
    /**
     *加载词性字典
     * @param {字典} lines是数组
     */
    load(lines) {
        console.log("初始化词性标注器");
        let count = 0;
        for (let line of lines) {
            try {
                let attr = line.split(":");
                this.GENERIC_TRIE.put(attr[0], attr[1]);
                count++;
            } catch (e) {
                console.log("错误的词性数据:" + line);
            }
        }
        console.log("词性标注器初始化完毕,词性数据条数:" + count);
    }
    /**
     * 添加某一个词
     * @param {词} line
     */
    add(line) {
        try {
            let attr = line.split(":");
            this.GENERIC_TRIE.put(attr[0], attr[1]);
        } catch (e) {
            console.log("错误的词性数据:" + line);
        }
    }
    /**
     * 删除某一个词
     * @param {某一个词} line
     */
    remove(line) {
        try {
            let attr = line.split(":");
            this.GENERIC_TRIE.remove(attr[0]);
        } catch (e) {
            console.log("错误的词性数据:" + line);
        }
    }
    /**
     * 加载词性字典
     */
    loadAndWatch() {
        if (!data) {
            console.log("没有词典资源可以加载");
            return;
        }
        console.log("开始加载资源");
        let result = data.split("\n"); //把字符串转化成数组
        console.log("加载词性词典" + result.length + "行");
        //调用自定义加载逻辑
        this.clear();
        this.load(result);
    }
    /**
     *标注
     */
    process(words) {
        let arr = new Array();
        for (let word of words) {
            let wordText = word;
            let pos = this.GENERIC_TRIE.get(wordText);
            let recognitionTool = new RecognitionTool();
            //判断返回值为空的情况,在词典中找不到
            if (pos == null || pos == undefined) {
                //识别英文
                if (recognitionTool.firstIsEnglish(wordText)) {
                    pos = "eng";
                }
                //识别数字
                if (recognitionTool.firstIsNumber(wordText)) {
                    pos = "m";
                }
                //中文数字
                if (recognitionTool.firstIsNumber(wordText)) {
                    pos = "mh";
                }
                //识别小数和分数
                if (recognitionTool.firstIsFraction(wordText)) {
                    if (
                        contains(wordText, ".") ||
                        contains(wordText, "．") ||
                        contains(wordText, "·")
                    ) {
                        pos = "mx";
                    }
                    if (contains(wordText, "/") || contains(wordText, "／")) {
                        pos = "mf";
                    }
                }
                //识别数量词
                if (recognitionTool.firstIsQuantifier(wordText)) {
                    //百分数
                    if (
                        contains(wordText, "‰") ||
                        contains(wordText, "%") ||
                        contains(wordText, "％")
                    ) {
                        pos = "wb";
                    }
                    //时间量词
                    else if (
                        contains(wordText, "时") ||
                        contains(wordText, "分") ||
                        contains(wordText, "秒")
                    ) {
                        pos = "tq";
                    }
                    //日期量词
                    else if (
                        contains(wordText, "年") ||
                        contains(wordText, "月") ||
                        contains(wordText, "日") ||
                        contains(wordText, "天") ||
                        contains(wordText, "号")
                    ) {
                        pos = "tdq";
                    }
                    //数量词
                    else {
                        pos = "m";
                        // pos = "mq";
                    }
                }
                //如果以上条件都找不到 则标记为未知词性
                else {
                    pos = "uk";
                }
            }
            // let p = new PartOfSpeech();
            // if (p.isPos(pos)) {
            arr.push(new Term(word, pos));
            // }
        }
        return arr;
    }
}
/**
 * 判断字符串是否存在某一项
 * @param {字符串} str
 * @param { 某一项} substr
 */
contains = (str, substr) => {
    return str.indexOf(substr) !== -1;
};
module.exports = PartOfSpeechTagging;
//////////////////test///////////////////////////
// const Bigram = require("../corpus/model/bigram/bigram");
// const BidirectionalMaximumMinimumMatching = require("../segmentation/BidirectionalMaximumMinimumMatching");
// /////加载字典数据////////////

// const data2 = fs.readFileSync(
//     "E:/test/data/dictionary/ripe-dictionary/dictionary.txt",
//     "utf8"
// );
// const ConstructingDictionary = () => {
//     let maxlength = 0;
//     let result = data2.split("\n"); //把字符串转化成数组
//     global.dictionary = new Set(result);
//     for (let item of global.dictionary.keys()) {
//         if (maxlength < item.length) {
//             maxlength = item.length;
//         }
//     }
//     global.MAX_LENGTH = maxlength;
//     console.log("加载字典词最大长度:" + maxlength);
//     console.log("加载字典数据" + result.length + "行");
// };
// ConstructingDictionary();
// //////// 分词//////////////////

// // let words = "坚决惩治贪污贿赂等经济犯罪";
// let words = "把客厅吸顶灯打开";
// let result = BidirectionalMaximumMinimumMatching(words);
// console.log(result);
// const partOfSpeechTagging = new PartOfSpeechTagging();
// partOfSpeechTagging.loadAndWatch();
// console.log(partOfSpeechTagging.process(result));
