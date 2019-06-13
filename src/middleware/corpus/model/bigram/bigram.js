const DoubleArrayGenericTrie = require("../../../utils/DoubleArrayGenericTrie.js");
const ArrayList = require("../../../utils/ArrayList");
const fs = require("fs");
const { Path } = require("../../../utils/Path");
const data = fs.readFileSync(Path.BiGramDictionaryPath, "utf8");
/**
 * 二元语法模型
 */
class Bigram {
    constructor() {
        this.DOUBLE_ARRAY_GENERIC_TRIE = new DoubleArrayGenericTrie();
        this.maxFrequency = 0;
    }
    clear() {
        this.DOUBLE_ARRAY_GENERIC_TRIE.clear();
    }
    /**
     *
     * @param {数组} lines
     */
    load(lines) {
        console.log("初始化bigram");
        let map = new Map();
        for (let i of lines) {
            try {
                this.addLine(i, map);
            } catch (e) {
                console.log("错误的bigram数据:" + i);
            }
        }
        let size = map.size;
        // console.log(map);
        this.DOUBLE_ARRAY_GENERIC_TRIE.putAll(map);
        console.log("bigram初始化完毕,bigram数据条数:" + size);
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
        // console.time();

        let result = data.split("\n"); //把字符串转化成数组
        console.log("加载数据" + result.length + "行");
        this.clear();
        this.load(result);
        // console.timeEnd();
    }

    getMaxFrequency() {
        return this.maxFrequency;
    }
    /**
     * 含有语境的二元模型分值算法
     * 计算多种分词结果的分值
     * 利用获得的二元模型分值重新计算分词结果的分值
     * 补偿细粒度切分获得分值而粗粒度切分未获得分值的情况
     * @param sentences 多种分词结果
     * @return 分词结果及其对应的分值
     */
    bigram(sentences) {
        let map = new Map();
        let bigramScores = new Map();
        //两个连续的bigram补偿粗粒度分值
        //如:如果美国,加州,大学。如果美国:加州,加州:大学有分值
        //则美国加州大学也会获得分值
        let twoBigramScores = new Map();
        for (let sentence in sentences) {
            if (map.get(sentence) != null) {
                continue;
            }
            let score = 0;
            //1.计算其中一种分词结果的分值
            if (sentence.length > 1) {
                let last = "";
                for (let i = 0; i < sentence.length - 1; i++) {
                    let first = sentence[i];
                    let second = sentence[i + 1];
                    let bigramScore = this.getScore(first, second);
                    if (bigramScore > 0) {
                        if (last.endsWith(first)) {
                            twoBigramScores.set(
                                last + second,
                                bigramScores.get(last) + bigramScore
                            );
                        }
                        last = first + second;
                        bigramScores.set(last, bigramScore);
                        score += bigramScore;
                    }
                }
            }
            map.set(sentence, score);
        }
        //2、利用获得的二元模型分值重新计算分词结果的分值
        //补偿细粒度切分获得分值而粗粒度切分未获得分值的情况
        //计算多种分词结果的分值
        if (bigramScores.size > 0 || twoBigramScores.size > 0) {
            for (let sentence of map.keys()) {
                for (let word of sentence) {
                    let bigramScore = bigramScores.get(word);
                    let twoBigramScore = twoBigramScores.get(word);
                    let array = [bigramScore, twoBigramScore];
                    for (let score of array) {
                        if (score != null && score > 0) {
                            console.log(`${word}获得分值:${score}`);
                            let value = map.get(sentence);
                            value += value;
                            map.set(sentence, value);
                        }
                    }
                }
            }
        }
        return map;
    }
    sentenceScore(words) {
        ///////////////////////需要修改
        if (words.length > 1) {
            let total = words.length - 1;
            let match = 0;
            for (let i = 0; i < words.length - 1; i++) {
                if (this.getScore(words[i], words[i + 1]) > 0) {
                    match++;
                }
            }
            return match / total;
        }
        return 0;
    }
    /**
     * 计算分词结果的二元模型分值
     * @param words 分词结果
     * @return 二元模型分值
     */
    calculateBigram(words) {
        if (words.length > 1) {
            let score = 0;
            for (let i = 0; i < words.length - 1; i++) {
                score += this.getScore(words[i], words[i + 1]);
            }
            return score;
        }
        return 0;
    }
    /**
     * 获取两个词一前一后紧挨着同时出现在语料库中的分值
     * 分值被归一化了：
     * 完全没有出现分值为0
     * 出现频率最高的分值为1
     * @param first 前一个词
     * @param second 后一个词
     * @return 同时出现的分值
     */
    getScore(first, second) {
        let frequency = this.getFrequency(first, second);
        let score = frequency / this.maxFrequency;
        if (score > 0) {
            // console.log(`二元模型[${first}:${second}]获得分值:${score}`); //////////////////////////////
        }
        return score;
    }
    getFrequency(first, second) {
        let value = this.DOUBLE_ARRAY_GENERIC_TRIE.search(first + ":" + second);
        if (value == null || value < 0) {
            return 0;
        }
        return value;
    }
}
/**
 * 用于判断字符串是否以输入的字符串结尾
 * @param {输入的字符串} suffix
 */
endWith = suffix => {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
module.exports = Bigram;

// //////////////////////////////////test///////////////////////////////////////

// const MaximumMatching = require("../../../segmentation/MaximumMatching");
// const MinimumMatching = require("../../../segmentation/MinimumMatching");
// const ReverseMaximumMatching = require("../../../segmentation/ReverseMaximumMatching");
// const ReverseMinimumMatching = require("../../../segmentation/ReverseMinimumMatching");
// const BidirectionalMaximumMatching = require("../../../segmentation/BidirectionalMaximumMatching");
// const BidirectionalMinimumMatching = require("../../../segmentation/BidirectionalMinimumMatching");
// const BidirectionalMaximumMinimumMatching = require("../../../segmentation/BidirectionalMaximumMinimumMatching");
// // // /////加载字典数据////////////
// const data2 = fs.readFileSync(
//     "E:/test-koa/src/middleware/data/dictionary/ripe-dictionary/dictionary.txt",
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

// // ////////分词///////////////

// let words = "客厅吸顶灯调亮10%";
// let result1 = MaximumMatching(words);
// let result2 = ReverseMaximumMatching(words);
// let result3 = MinimumMatching(words);
// let result4 = ReverseMinimumMatching(words);
// let result5 = BidirectionalMaximumMatching(words);
// let result6 = BidirectionalMinimumMatching(words);
// let result7 = BidirectionalMaximumMinimumMatching(words);

// console.log("待分词的字符串: ", words);
// console.log("正向最大匹配算法:          ", result1);
// console.log("逆向最大匹配算法:          ", result2);
// console.log("正向最小匹配算法:          ", result3);
// console.log("逆向最小匹配算法:          ", result4);
// console.log("双向最大匹配算法:          ", result5);
// console.log("双向最小匹配算法:          ", result6);
// console.log("双向最大最小匹配算法:       ", result7);

// // ////////初始化bigram模型////////////
// let bigram = new Bigram();
// bigram.loadAndWatch();

// // ////////获得分词结果在bigram里的分值/////////////////////////
// let score1 = bigram.calculateBigram(result1);
// let score2 = bigram.calculateBigram(result2);
// let score3 = bigram.calculateBigram(result3);
// let score4 = bigram.calculateBigram(result4);
// let score5 = bigram.calculateBigram(result5);
// let score6 = bigram.calculateBigram(result6);
// let score7 = bigram.calculateBigram(result7);

// console.log("正向最大匹配算法得分:       ", score1);
// console.log("逆向最大匹配算法得分:       ", score2);
// console.log("正向最小匹配算法得分:       ", score3);
// console.log("逆向最小匹配算法得分:       ", score4);
// console.log("双向最大匹配算法得分:       ", score5);
// console.log("双向最小匹配算法得分:       ", score6);
// console.log("双向最大最小匹配算法得分:       ", score7);
