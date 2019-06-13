const CoNLLSentence = require("./CoNLLSentence");
const CoNLLLine = require("./CoNLLLine");
const fs = require("fs");

/**
 * CoNLL格式依存语料加载
 *
 */
class CoNLLLoader {
    loadSentenceList(path) {
        let result = new Set(); //存放每一个句子,即整个语料库
        var sentence = new Set(); //存放每一个词,即一个句子
        let data = fs.readFileSync(path, "utf-8"); //同步加载数据
        let txt = data.split("\n");
        // console.log(txt);
        for (let line of txt) {
            if (line.trim().length == 0) {
                //当中间有一行空白，表示是前面到空白之前是一个句子
                let Sentence = new CoNLLSentence();
                Sentence.CoNLLSentence(sentence);
                result.add(Sentence);
                sentence = new Set();
            }
            let word = line.trim().split("\t");
            if (line !== "") {
                sentence.add(new CoNLLLine(word));
            }
            if (line.trim() == "END") {
                return result;
            }
        }
    }
}
// const a = new CoNLLLoader();
// let b = a.loadSentenceList("E:/依存分析训练数据/THU/test.txt");
// console.log(b);

module.exports = CoNLLLoader;
