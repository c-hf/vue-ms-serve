const CoNLLSentence = require("../CoNll/CoNLLSentence");
const CoNLLLine = require("../CoNll/CoNLLLine");
const CoNLLLoader = require("../CoNll/CoNLLLoader");
const fs = require("fs");
const LinkedList = require("../../../utils/LinkedList");
const CoNLLWord = require("../CoNll/CoNLLWord");
const { Path } = require("../../../utils/Path");
/**
 * 最大熵模型构建工具，训练暂时不使用自己的代码，借用opennlp训练。本maker只生成训练文件
 */
class MaxEntDependencyModelMaker {
    makeModel(corpusLoadPath, modelSavePath) {
        var buffer = new Buffer("");
        // var a = new Buffer("");
        const coNLLLoader = new CoNLLLoader();
        let sentenceList = coNLLLoader.loadSentenceList(corpusLoadPath);
        let id = 1;
        for (let sentence of sentenceList) {
            console.log("%d / %d...", id++, sentenceList.size);
            let edgeArray = sentence.getEdgeArray();
            let word = sentence.getWordArrayWithRoot();

            for (let i = 0; i < word.length; ++i) {
                for (let j = 0; j < word.length; ++j) {
                    if (i == j) {
                        continue;
                    }
                    // 这就是一个边的实例，从i出发，到j，当然它可能存在也可能不存在，不存在取null照样是一个实例
                    let contextList = new LinkedList();
                    // 先生成i和j的原子特征
                    contextList.appendAll(
                        this.generateSingleWordContext(word, i, "i")
                    );
                    contextList.appendAll(
                        this.generateSingleWordContext(word, j, "j")
                    );
                    // 然后生成二元组的特征
                    contextList.appendAll(this.generateUniContext(word, i, j));
                    // 将特征字符串化
                    let current = contextList.head;
                    // while (current) {
                    //     let currentBuffer = new Buffer(current.element);
                    //     let blank = new Buffer(" ");
                    //     let item = Buffer.concat([currentBuffer, blank]);
                    //     buffer = Buffer.concat([buffer, item]);
                    //     current = current.next;
                    // } //事件名称为依存关系
                    // if (typeof edgeArray[i][j] !== "object") {
                    //     var dependency = new Buffer(edgeArray[i][j]);
                    // } else {
                    //     var dependency = new Buffer("null");
                    // }

                    // let newline = new Buffer("\n");
                    // buffer = Buffer.concat([buffer, dependency, newline]);
                    // 事件名称为依存关系

                    if (typeof edgeArray[i][j] !== "object") {
                        var dependency = new Buffer(edgeArray[i][j]);
                    } else {
                        var dependency = new Buffer("null");
                    }
                    let line = new Buffer("");
                    let blank = new Buffer(" ");
                    line = Buffer.concat([dependency, blank]);
                    var index = new Buffer("");
                    while (current) {
                        let currentBuffer = new Buffer(current.element);
                        let blank = new Buffer(" ");
                        let item = Buffer.concat([currentBuffer, blank]);
                        index = Buffer.concat([index, item]);
                        current = current.next;
                    }
                    let newline = new Buffer("\n");
                    buffer = Buffer.concat([buffer, line, index, newline]);
                }
            }
        }
        fs.writeFileSync(modelSavePath, buffer);
        return true;
    }
    generateSingleWordContext(word, index, mark) {
        let context = new LinkedList();
        for (let i = index - 2; i < index + 2 + 1; ++i) {
            let w = i >= 0 && i < word.length ? word[i] : new CoNLLWord().NULL;
            context.append(w.NAME + mark + (i - index));
            context.append(w.POSTAG + mark + (i - index));
        }

        return context;
    }
    generateUniContext(word, i, j) {
        let context = new LinkedList();
        context.append(`${word[i].NAME}→${word[j].NAME}`);
        context.append(`${word[i].POSTAG}→${word[j].POSTAG}`);
        context.append(`${word[i].NAME}→${word[j].NAME}${i - j}`);
        context.append(`${word[i].POSTAG}→${word[j].POSTAG}${i - j}`);
        let wordBeforeI = i - 1 >= 0 ? word[i - 1] : new CoNLLWord().NULL;
        let wordBeforeJ = j - 1 >= 0 ? word[j - 1] : new CoNLLWord().NULL;
        context.append(`${wordBeforeI.NAME}@${word[i].NAME}→${word[j].NAME}`);
        context.append(`${word[i].NAME}→${wordBeforeJ.NAME}@${word[j].NAME}`);
        context.append(
            `${wordBeforeI.POSTAG}@${word[i].POSTAG}→${word[j].POSTAG}`
        );
        context.append(
            `${word[i].POSTAG}→${wordBeforeJ.POSTAG}@${word[j].POSTAG}`
        );
        return context;
    }
}

////test////////////////
const a = new MaxEntDependencyModelMaker();
a.makeModel(Path.CoNLLDictionaryPath, Path.MaxEntModelPath);
// let word = [];

// word[0] = {
//     ID: 0,
//     LEMMA: "##核心##",
//     CPOSTAG: "ROOT",
//     POSTAG: "root",
//     NAME: "##核心##"
// };
// word[1] = {
//     ID: "1",
//     LEMMA: "坚决",
//     CPOSTAG: "a",
//     POSTAG: "ad",
//     ROOT: { ID: 0, LEMMA: "##核心##", CPOSTAG: "ROOT", POSTAG: "root" },
//     NULL: { ID: -1, LEMMA: "##空白##", CPOSTAG: "NULL", POSTAG: "null" },
//     DEPREL: "方式",
//     NAME: "坚决"
// };
// word[2] = {
//     ID: "2",
//     LEMMA: "惩治",
//     CPOSTAG: "v",
//     POSTAG: "v",
//     ROOT: { ID: 0, LEMMA: "##核心##", CPOSTAG: "ROOT", POSTAG: "root" },
//     NULL: { ID: -1, LEMMA: "##空白##", CPOSTAG: "NULL", POSTAG: "null" },
//     DEPREL: "核心成分",
//     NAME: "惩治",
//     HEAD: { ID: 0, LEMMA: "##核心##", CPOSTAG: "ROOT", POSTAG: "root" }
// };
// word[3] = {
//     ID: "3",
//     LEMMA: "贪污",
//     CPOSTAG: "v",
//     POSTAG: "v",
//     ROOT: { ID: 0, LEMMA: "##核心##", CPOSTAG: "ROOT", POSTAG: "root" },
//     NULL: { ID: -1, LEMMA: "##空白##", CPOSTAG: "NULL", POSTAG: "null" },
//     DEPREL: "限定",
//     NAME: "贪污"
// };

// word[4] = {
//     ID: "4",
//     LEMMA: "贿赂",
//     CPOSTAG: "n",
//     POSTAG: "n",
//     ROOT: { ID: 0, LEMMA: "##核心##", CPOSTAG: "ROOT", POSTAG: "root" },
//     NULL: { ID: -1, LEMMA: "##空白##", CPOSTAG: "NULL", POSTAG: "null" },
//     DEPREL: "连接依存",
//     NAME: "贿赂"
// };

// word[5] = {
//     ID: "5",
//     LEMMA: "等",
//     CPOSTAG: "u",
//     POSTAG: "udeng",
//     ROOT: { ID: 0, LEMMA: "##核心##", CPOSTAG: "ROOT", POSTAG: "root" },
//     NULL: { ID: -1, LEMMA: "##空白##", CPOSTAG: "NULL", POSTAG: "null" },
//     DEPREL: "连接依存",
//     NAME: "等"
// };
// word[6] = {
//     ID: "6",
//     LEMMA: "经济",
//     CPOSTAG: "n",
//     POSTAG: "n",
//     ROOT: { ID: 0, LEMMA: "##核心##", CPOSTAG: "ROOT", POSTAG: "root" },
//     NULL: { ID: -1, LEMMA: "##空白##", CPOSTAG: "NULL", POSTAG: "null" },
//     DEPREL: "限定",
//     NAME: "经济"
// };
// word[7] = {
//     ID: "7",
//     LEMMA: "犯罪",
//     CPOSTAG: "v",
//     POSTAG: "vn",
//     ROOT: { ID: 0, LEMMA: "##核心##", CPOSTAG: "ROOT", POSTAG: "root" },
//     NULL: { ID: -1, LEMMA: "##空白##", CPOSTAG: "NULL", POSTAG: "null" },
//     DEPREL: "受事",
//     NAME: "犯罪"
// };
// word[1].HEAD = word[2];
// word[3].HEAD = word[7];
// word[4].HEAD = word[3];
// word[5].HEAD = word[3];
// word[6].HEAD = word[7];
// word[7].HEAD = word[2];
// console.log(word);
// var buffer = new Buffer(0);
// let contextList = new LinkedList();
// let b = a.generateSingleWordContext(word, 0, "i");
// let c = a.generateSingleWordContext(word, 1, "j");
// let d = a.generateUniContext(word, 0, 1);

// contextList.appendAll(b);
// contextList.appendAll(c);
// contextList.appendAll(d);

// let current = contextList.head;
// while (current) {
//     let a = new Buffer(current.element);
//     let b = new Buffer(" ");
//     let c = Buffer.concat([a, b]);
//     buffer = Buffer.concat([buffer, c]);
//     current = current.next;
// }
// let s = new Buffer("null");
// let f = new Buffer("\n");
// buffer = Buffer.concat([buffer, s, f]);
// buffer.write("" + "null");
// console.log(buffer.length);
// console.log(buffer.toString());
