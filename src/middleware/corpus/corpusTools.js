/**
 * 语料库工具
 * 用于构建二元模型和三元模型并做进一步的分析处理
 * 同时把语料库中的新词加入词典
 *
 */
const fs = require("fs");
const readline = require("readline");
const StringBuilder = require("../utils/StringBuilder");
const ArrayList = require("../utils/ArrayList");
const isChinese = require("../utils/isChinese");
const { Path } = require("../utils/Path");
// const data = fs.readFileSync("./src/corpus.txt", "utf8");
// const data = fs.readFileSync(
//     "E:/test-koa/src/middleware/data/dictionary/unripe-dictionary/test.txt",
//     "utf8"
// );
const data = fs.readFileSync(Path.DictionaryPath, "utf8");

// const fReadName =
//     "E:/test-koa/src/middleware/data/dictionary/unripe-dictionary/test.txt";
// const fWriteName = "";
// const fRead = fs.createReadStream(fReadName);
class CorpusTools {
    constructor() {
        this.BIGRAM = new Map(); //二元模型
        this.TRIGRAM = new Map(); //三元模型
        this.LINES_COUNT = 0; //语料库的行数
        this.WORD_COUNT = 0; //词数
        this.CHAR_COUNT = 0; //字符数
        this.WORDS = new Map();
        this.PHRASES = new Map(); //短语
        this.PARTOFSPEECH = new Map(); //词性
    }
    /**
     * 分析语料库
     * 分析处理并保存二元模型
     * 分析处理并保存三元模型
     * 分析处理并保存语料库中提取出来的词
     * 将新提取的词和原来的词典合并
     * 二元和三元模型规范化
     */
    process() {
        this.analyzeCorpus();
    }
    /**
     * 分析语料库
     */
    analyzeCorpus() {
        this.constructNGram();
        this.processBiGram();
        this.BIGRAM.clear();
        this.processTRIGram();
        this.TRIGRAM.clear();
        this.processWords();
        this.WORDS.clear();
        this.processPhrase();
        this.PHRASES.clear();
        this.prcessPartOfSpeech();
        this.PARTOFSPEECH.clear();
        // console.log(this.PARTOFSPEECH);
        // console.log(this.WORDS);
    }

    /**
     * 构建二元模型、三元模型、短语结构，词典，词性词典，统计字符数、词数
     * 构建不重复词列表
     */

    constructNGram() {
        let corpus = data.split("\n");
        for (let i = 0; i < corpus.length; i++) {
            this.LINES_COUNT++; //语料库的行数
            corpus[i] = corpus[i].trim(); //去掉首尾空白字符
            if (corpus[i] !== "") {
                let words = corpus[i].split(/\s+/);
                if (words === null) {
                    //忽略不符合规范的行
                    continue;
                }
                let list = new ArrayList(); //存放词
                let phrase = new StringBuilder(); //存放短语
                let phraseCount = 0; //短语计数
                let find = false;
                for (let word in words) {
                    let attr = words[word].split("/");
                    if (attr == null || attr.length < 1) {
                        continue;
                    }
                    //存储短语
                    if (attr[0].trim().startsWith("[")) {
                        find = true;
                    }
                    let item = attr[0].replace("[", "").replace("[", "");
                    let item2 = attr[1].replace(/[\u4e00-\u9fa5]/g, ""); //筛选词性
                    list.add(item);
                    // if (isChinese.isChineseChar(item)) {
                    this.addWord(item);
                    this.addWordPartOfSpeech(item, item2);
                    // }
                    this.WORD_COUNT++; //词数
                    this.CHAR_COUNT = this.CHAR_COUNT + item.length; //字符数
                    if (find) {
                        phrase.append(item).append(" ");
                        phraseCount++;
                    }
                    //短语标注错误
                    if (phraseCount > 10) {
                        find = false;
                        phraseCount = 0;
                        phrase.clear();
                    }
                    if (
                        find &&
                        attr.length > 1 &&
                        attr[1].trim().endsWith("]")
                    ) {
                        find = false;
                        this.PHRASES.set(phrase.toString());
                        phrase.clear();
                    }
                    // 存储词性
                }
                //计算bigram模型
                let len = list.size();
                if (len < 2) {
                    continue;
                }
                for (let i = 0; i < len - 1; i++) {
                    let first = list.get(i);
                    if (!isChinese.isChineseCharAndLengthAtLeastOne(first)) {
                        continue;
                    }
                    let second = list.get(i + 1);
                    if (!isChinese.isChineseCharAndLengthAtLeastOne(second)) {
                        //跳过一个词
                        i++;
                        continue;
                    }
                    //忽略长度均为1的模型
                    if (first.length < 2 && second.length < 2) {
                        continue;
                    }
                    let key = `${first}:${second}`;
                    let value = this.BIGRAM.get(key);
                    if (value == null) {
                        value = 1;
                    } else {
                        value++;
                    }
                    this.BIGRAM.set(key, value);
                }
                //计算trigram模型
                if (len < 3) {
                    continue;
                }
                for (let i = 0; i < len - 2; i++) {
                    let first = list.get(i);
                    if (!isChinese.isChineseCharAndLengthAtLeastOne(first)) {
                        continue;
                    }
                    let second = list.get(i + 1);
                    if (!isChinese.isChineseCharAndLengthAtLeastOne(second)) {
                        continue;
                    }
                    let third = list.get(i + 2);
                    if (!isChinese.isChineseCharAndLengthAtLeastOne(third)) {
                        continue;
                    }
                    //忽略长度均为1的模型
                    if (
                        first.length < 2 &&
                        second.length < 2 &&
                        third.length < 2
                    ) {
                        continue;
                    }
                    let key = `${first}:${second}:${third}`;
                    let value = this.TRIGRAM.get(key);
                    if (value == null) {
                        value = 1;
                    } else {
                        value++;
                    }
                    this.TRIGRAM.set(key, value);
                }
            }
        }
    }
    /**
     * 添加词到WORDS中
     * @param {中文的词} word
     */
    addWord(word) {
        let value = this.WORDS.get(word);
        if (value == null) {
            value = 1;
        } else {
            value++;
        }
        this.WORDS.set(word, value);
    }
    /**
     * 添加词到中PARTOFSPEECH中
     * @param {中文的词} word
     * @param {词性} partofspeech
     */
    addWordPartOfSpeech(word, partofspeech) {
        let value = this.PARTOFSPEECH.get(word);
        if (value == null) {
            value = partofspeech;
        }
        this.PARTOFSPEECH.set(word, value);
    }
    /**
     * 分析处理并存储二元模型
     * 移除二元模型出现频率为1的情况
     * 排序后保存到bigram.txt文件
     */
    processBiGram() {
        try {
            // 移除二元模型出现频率为1的情况
            let str = "";
            let BIGRAM = this.sort(this.BIGRAM); //对BIGRAM进行排序
            // console.log(this.BIGRAM);
            for (let [key, value] of BIGRAM) {
                if (value > 1) {
                    str = str + `${key} ${value}\n`;
                }
            }
            // fs.writeFileSync("./src/bigram.txt", str);
            fs.writeFileSync(Path.BiGramDictionaryPath, str);
        } catch (e) {
            console.log("保存二元模型失败", e);
        }
    }
    /**
     * 分析处理并存储三元模型
     * 移除二元模型出现频率为1的情况
     * 排序后保存到trigram.txt文件
     */
    processTRIGram() {
        try {
            // 移除三元模型出现频率为1的情况
            let str = "";
            let TRIGRAM = this.sort(this.TRIGRAM); //对TRIGRAM进行排序
            for (let [key, value] of TRIGRAM) {
                if (value > 1) {
                    str = str + `${key} ${value}\n`;
                }
            }
            fs.writeFileSync(Path.TriGramDictionaryPath, str);
        } catch (e) {
            console.log("保存trigram模型失败", e);
        }
    }
    /**
     * 分析处理并存储不重复的词
     */
    processWords() {
        try {
            let str = "";
            let WORDS = this.sort(this.WORDS); //对WORDS进行排序
            for (let [key, value] of WORDS) {
                str = str + `${key}\n`;
            }
            fs.writeFileSync(Path.CoreDictionaryPath, str);
        } catch (e) {
            console.log("保存词典文件失败", e);
        }
    }
    /**
     * 分析处理并存储词的词性
     */
    // processWords() {
    //     try {
    //         let str = "";
    //         let WORDS = this.sort(this.WORDS); //对WORDS进行排序
    //         for (let [key, value] of WORDS) {
    //             str = str + `${key}\n`;
    //         }
    //         fs.writeFileSync("./dictionary.txt", str);
    //     } catch (e) {
    //         console.log("保存词典文件失败", e);
    //     }
    // }
    /**
     *  生成短语结构
     */
    processPhrase() {
        try {
            let str = "";
            let PHRASES = this.sort(this.PHRASES); //对WORDS进行排序

            for (let [key, value] of PHRASES) {
                str = str + `${key.trim()}\n`;
            }
            fs.writeFileSync(Path.PhraseDictionaryPath, str);
        } catch (e) {
            console.log("保存短语文件失败", e);
        }
    }
    /**
     * 生成词性词典
     */
    prcessPartOfSpeech() {
        try {
            let str = "";
            let PARTOFSPEECH = this.sort(this.PARTOFSPEECH);
            for (let [key, value] of PARTOFSPEECH) {
                str = str + `${key}:${value}\n`;
            }
            fs.writeFileSync(Path.PartOfSpeechDictionaryPath, str);
        } catch (e) {
            console.log("保存词性词典文件失败", e);
        }
    }
    /**
     * 对map结构进行排序
     */
    sort(maps) {
        let map = maps;
        let array = [...map];
        return new Map(array.sort());
    }
}

let corpustools = new CorpusTools();
corpustools.process();
