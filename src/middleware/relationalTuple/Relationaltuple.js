const fs = require("fs");
const StopWord = require("../utils/StopWords");
const PartOfSpeechTagging = require("../tagging/PartOfSpeechTagging");
const MaxEntDependencyParser = require("../dependency/MaxEntDependencyParser");
const BidirectionalMaximumMinimumMatching = require("../segmentation/BidirectionalMaximumMinimumMatching");
const { Path } = require("../utils/Path");
/**
 * @param {text} 待处理的文本
 */
const WordFiltering = text => {
    //分词
    let segText = BidirectionalMaximumMinimumMatching(text);
    console.log(segText);
    //词性标注
    const partOfSpeechTagging = new PartOfSpeechTagging();
    partOfSpeechTagging.loadAndWatch();
    let posText = partOfSpeechTagging.process(segText);
    //依存句法分析
    let maxEntDependencyParser = new MaxEntDependencyParser();
    maxEntDependencyParser.load(Path.MaxEntTrainPath + ".bin");
    let dependencyText = maxEntDependencyParser.compute(posText);
    return dependencyText;
};

const WordSeg = text => {
    return BidirectionalMaximumMinimumMatching(text);
};
module.exports = {
    WordFiltering: WordFiltering,
    WordSeg: WordSeg
};
