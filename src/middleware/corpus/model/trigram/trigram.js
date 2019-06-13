const DoubleArrayGenericTrie = require("../../../utils/DoubleArrayGenericTrie.js");
const ArrayList = require("../../../utils/ArrayList");
const fs = require("fs");
const Path = require("../../../utils/Path");
const data = fs.readFileSync(Path.TriGramDictionaryPath, "utf8");
/**
 * 三元语法模型
 */
class Trigram {
    constructor() {
        this.DOUBLE_ARRAY_GENERIC_TRIE = new DoubleArrayGenericTrie();
        this.maxFrequency = 0;
    }

    //清除整个树
    clear() {
        this.DOUBLE_ARRAY_GENERIC_TRIE.clear();
    }
    /**
     *
     * @param {数组} lines
     */
    load(lines) {
        console.log("初始化trigram");
        let map = new Map();
        for (let i of lines) {
            try {
                this.addLine(i, map);
            } catch (e) {
                console.log("错误的trigram数据:" + i);
            }
        }
        let size = map.size;
        // console.log(map);
        this.DOUBLE_ARRAY_GENERIC_TRIE.putAll(map);
        console.log("trigram初始化完毕,trigram数据条数:" + size);
    }
    add() {}
    addLine(line, map) {
        let attr = line.split(/\s+/);
        let frequency = parseInt(attr[1]);
        if (frequency > this.maxFrequency) {
            this.maxFrequency = frequency;
        }
        map.set(attr[0], frequency);
    }
    remove() {}
    /**
     * 加载资源
     */
    loadAndWatch() {
        if (!data) {
            console.log("没有资源可以加载");
            return;
        }
        console.log("开始加载资源");
        let result = data.split("\n"); //把字符串转化成数组
        console.log("加载数据" + result.length + "行");
        this.clear();
        this.load(result);
    }
    getMaxFrequency() {
        return this.maxFrequency;
    }
    /**
     * 一次性计算多种分词结果的三元模型分值
     * @param sentences 多种分词结果
     * @return 分词结果及其对应的分值
     */
    trigram(sentences) {
        let map = new Map();
        //计算多种分词结果的分值
        for (let sentence in sentences) {
            if (map.get(sentence) != null) {
                continue;
            }
            let score = 0;
            //计算其中一种分词结果的分值
            if (sentence.length > 2) {
                for (let i = 0; i < sentence.length - 2; i++) {
                    let first = sentence[i];
                    let second = sentence[i + 1];
                    let third = sentence[i + 2];
                    let trigramScore = this.getScore(first, second, third);
                    if (trigramScore > 0) {
                        score += trigramScore;
                    }
                }
            }
            map.set(sentence, score);
        }
        return map;
    }
    /**
     * 计算分词结果的三元模型分值
     * @param words 分词结果
     * @return 三元模型分值
     */
    calculateTrigram(words) {
        if (words.length > 2) {
            let score = 0;
            for (let i = 0; i < words.length - 2; i++) {
                score += this.getScore(words[i], words[i + 1], words[i + 2]);
            }
            return score;
        }
    }
    /**
     * 获取三个词前后紧挨着同时出现在语料库中的分值
     * 分值被归一化了：
     * 完全没有出现分值为0
     * 出现频率最高的分值为1
     * @param first 第一个词
     * @param second 第二个词
     * @param third 第三个词
     * @return 同时出现的分值
     */
    getScore(first, second, third) {
        let frequency = this.getFrequency(first, second, third);
        let score = frequency / this.maxFrequency;
        if (score > 0) {
            // console.log(`三元模型[${first}:${second}:${third}]获得分值:${score}`); //////////////////////////////
        }
        return score;
    }
    getFrequency(first, second, third) {
        let value = this.DOUBLE_ARRAY_GENERIC_TRIE.search(
            first + ":" + second + ":" + third
        );
        if (value == null || value < 0) {
            return 0;
        }
        return value;
    }
}

module.exports = Trigram;

//////////////////////////////////test///////////////////////////////////////

// const MaximumMatching = require("../segmentation/MaximumMatching");
// const MinimumMatching = require("../segmentation/MinimumMatching");
// const ReverseMaximumMatching = require("../segmentation/ReverseMaximumMatching");
// const ReverseMinimumMatching = require("../segmentation/ReverseMinimumMatching");
// const BidirectionalMaximumMatching = require("../segmentation/BidirectionalMaximumMatching");
// const BidirectionalMinimumMatching = require("../segmentation/BidirectionalMinimumMatching");
// // const BidirectionalMaximumMinimumMatching = require("../segmentation/BidirectionalMaximumMinimumMatching");

// /////加载字典数据////////////
// const data2 = fs.readFileSync("E:/test/corpus/dictionary.txt", "utf8");
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

// ////////分词///////////////

// let words = "国家主席江泽民发表新年讲话";
// let result1 = MaximumMatching(words);
// let result2 = ReverseMaximumMatching(words);
// let result3 = MinimumMatching(words);
// let result4 = ReverseMinimumMatching(words);
// let result5 = BidirectionalMaximumMatching(words);
// let result6 = BidirectionalMinimumMatching(words);

// console.log("待分词的字符串: ", words);
// console.log("正向最大匹配算法:          ", result1);
// console.log("逆向最大匹配算法:          ", result2);
// console.log("正向最小匹配算法:          ", result3);
// console.log("逆向最小匹配算法:          ", result4);
// console.log("双向最大匹配算法:          ", result5);
// console.log("双向最小匹配算法:          ", result6);

// ////////初始化trigram模型////////////
// let trigram = new Trigram();
// trigram.loadAndWatch();

// ////////获得分词结果在trigram里的分值/////////////////////////
// let score1 = trigram.calculateTrigram(result1);
// let score2 = trigram.calculateTrigram(result2);
// let score3 = trigram.calculateTrigram(result3);
// let score4 = trigram.calculateTrigram(result4);
// let score5 = trigram.calculateTrigram(result5);
// let score6 = trigram.calculateTrigram(result6);

// console.log("正向最大匹配算法得分:       ", score1);
// console.log("逆向最大匹配算法得分:       ", score2);
// console.log("正向最小匹配算法得分:       ", score3);
// console.log("逆向最小匹配算法得分:       ", score4);
// console.log("双向最大匹配算法得分:       ", score5);
// console.log("双向最小匹配算法得分:       ", score6);
