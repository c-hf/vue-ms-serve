/**
 * 语料库路径
 */
Path = {
    DictionaryPath:
        "./src/middleware/data/dictionary/unripe-dictionary/test.txt", //人工标注语料库路径
    BiGramDictionaryPath:
        "./src/middleware/data/dictionary/ripe-dictionary/bigram.txt", //二元语法词典路径
    TriGramDictionaryPath:
        "./src/middleware/data/dictionary/ripe-dictionary/trigram.txt", //三元语法词典路径
    CoreDictionaryPath:
        "./src/middleware/data/dictionary/ripe-dictionary/dictionary.txt", //核心词典路径
    PhraseDictionaryPath:
        "./src/middleware/data/dictionary/ripe-dictionary/phrase.txt", //短语结构词典路径
    PartOfSpeechDictionaryPath:
        "./src/middleware/data/dictionary/ripe-dictionary/part_of_speech_dic.txt", //词性词典路径
    CoNLLDictionaryPath:
        "./src/middleware/data/dictionary/unripe-dictionary/corpus.txt", //CoNLL格式的语料库
    MaxEntModelPath: "./src/middleware/data/model/MaxEntModel.txt", //特征提取后的CoNLL格式语料
    MaxEntTrainPath: "./src/middleware/data/model/MaxEnt_train.txt", //opennlp训练后的模型
    StopWordDictionaryPath:
        "./src/middleware/data/dictionary/unripe-dictionary/stopword.txt"
};
module.exports = { Path: Path };
