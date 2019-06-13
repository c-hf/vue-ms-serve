const MinimumMatching = require("./MinimumMatching"); //正向最小匹配算法
const ReverseMinimumMatching = require("./ReverseMinimumMatching"); //逆向最小匹配算法
//双向最小匹配算法,加入启发规则对结果进一步消除歧义,强调细粒度
BidirectionalMinimumMatching = (text, MAX_LENGTH = global.MAX_LENGTH) => {
    let fmm = MinimumMatching(text); //正向最小匹配算法
    let bmm = ReverseMinimumMatching(text); //逆向最小匹配算法
    //如果正逆两项分词结果词数不同,则取分词数较多的那个
    if (fmm.length !== bmm.length) {
        if (fmm.length > bmm.length) {
            return fmm;
        } else {
            return bmm;
        }
    }
    //如果分词数结果相同
    else {
        //正逆分词数目相同,可以返回任意一个,然后判断两种分词结果单字的个数,返回单字个数多的结果
        let FSingle = 0; //用于计算正向最大分词法单字的个数
        let BSingle = 0; //用于计算逆向最大分词法单字的个数
        for (let i = 0; i < fmm.length; i++) {
            if (fmm[i].length === 1) {
                FSingle = FSingle + 1;
            }
            if (bmm[i].length === 1) {
                BSingle = BSingle + 1;
            }
        }
        //相同返回正向最小结果
        if (FSingle === BSingle) {
            return fmm;
        } else if (FSingle > BSingle) {
            return fmm;
        } else {
            return bmm;
        }
    }
};
module.exports = BidirectionalMinimumMatching;
