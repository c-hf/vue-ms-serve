const MaximumMatching = require("./MaximumMatching"); //正向最大匹配算法
const ReverseMaximumMatching = require("./ReverseMaximumMatching"); //逆向最大匹配算法
const MinimumMatching = require("./MinimumMatching"); //正向最小匹配算法
const ReverseMinimumMatching = require("./ReverseMinimumMatching"); //逆向最小匹配算法
const Bigram = require("../corpus/model/bigram/bigram");
/*双向最大最小匹配算法
 * 利用ngram从
 * 正向最大匹配、逆向最大匹配、正向最小匹配、逆向最小匹配
 * 4种切分结果中选择一种最好的分词结果
 * 如果分值都一样，则选择逆向最大匹配
 * 实验表明，对于汉语来说，逆向最大匹配算法比(正向)最大匹配算法更有效
 */
BidirectionalMaximumMinimumMatching = (
    text,
    MAX_LENGTH = global.MAX_LENGTH
) => {
    let wordsRMM = ReverseMaximumMatching(text); //逆向最大匹配算法分词结果
    let wordsMM = MaximumMatching(text); //正向最大匹配算法分词结果
    let wordsMIM = MinimumMatching(text); //正向最小匹配算法分词结果
    let wordsRMIM = ReverseMinimumMatching(text); //逆向最小匹配算法分词结果
    //如果分词结果都一样返回逆向最大匹配算法的分词结果
    if (wordsRMM == wordsMM && wordsRMM == wordsMIM && wordsRMM == wordsRMIM) {
        return wordsRMM;
    }
    //如果分词结果不一样则利用ngram消除歧义
    let bigram = new Bigram();
    let sroceRMM = bigram.calculateBigram(wordsRMM);
    //最终结果
    let result = wordsRMM;
    //最大分值
    let max = sroceRMM;
    //对四种分词获得的分值进行比较
    let sroceMM = bigram.calculateBigram(wordsMM);
    if (sroceMM > max) {
        result = wordsMIM;
        max = sroceMM;
    }
    let sroceMIM = bigram.calculateBigram(wordsMIM);
    if (sroceMIM > max) {
        result = wordsMIM;
        max = sroceMIM;
    }
    let sroceRMIM = bigram.calculateBigram(wordsRMIM);
    if (sroceRMIM > max) {
        result = wordsRMIM;
        max = sroceRMIM;
    }
    return result;
};
module.exports = BidirectionalMaximumMinimumMatching;
