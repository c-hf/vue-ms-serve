/**
 * CoNLL中的一个句子
 */
const CoNLLWord = require("./CoNLLWord");
const StringBuilder = require("../../../utils/StringBuilder");
const DyadicArray = require("../../../utils/DyadicArray");
class CoNLLSentence {
    constructor() {
        this.word = arguments[0] || []; //有许多行，每行是一个单词
    }
    /**
     * 构造一个句子
     */
    CoNLLSentence(lineList) {
        // this.word = [lineList.length];
        // let i = 0;
        // for (let line of lineList) {
        //     this.word[i++] = new CoNLLWord().CoNLLWord(line);
        // }
        // for (let nllWord of this.word) {
        //     let head = parseInt(lineList[nllWord.ID - 1].value[6]) - 1;
        //     if (head != -1) {
        //         nllWord.HEAD = this.word[head];
        //     } else {
        //         nllWord.HEAD = new CoNLLWord().ROOT;
        //     }
        // }

        if (arguments[0] !== undefined) {
            this.word = new Array(arguments[0].size);
            let arr = new Array();
            for (let item of arguments[0]) {
                arr.push(item);
            }
            let i = 0;
            for (let CoNllLine of arguments[0]) {
                let coNLLWord = new CoNLLWord();
                coNLLWord.CoNLLWord(CoNllLine);
                this.word[i++] = coNLLWord;
            }
            for (let nllWord of this.word) {
                let head = parseInt(arr[nllWord.ID - 1].value[6]) - 1;
                // console.log(this.word[head]);
                if (head !== -1) {
                    nllWord.HEAD = this.word[head];
                } else {
                    nllWord.HEAD = new CoNLLWord().ROOT;
                }
            }
        }
    }
    CoNLLSentenceWord(word) {
        this.word = word;
    }
    toString() {
        let sb = new StringBuilder();
        for (let word of this.word) {
            sb.append(word.toString());
            sb.append("\n");
        }
        return sb.toString();
    }

    /**
     * 获取边的列表，edge[i][j]表示id为i的词语与j存在一条依存关系为该值的边，否则为null
     * @return
     */
    getEdgeArray() {
        let edge = DyadicArray.DyadicArray(
            this.word.length + 1,
            this.word.length + 1
        );
        for (let coNLLWord of this.word) {
            edge[coNLLWord.ID][coNLLWord.HEAD.ID] = coNLLWord.DEPREL || "null";
        }
        return edge;
    }
    /**
     * 获取包含根节点在内的单词数组
     * @return
     */
    getWordArrayWithRoot() {
        let wordArray = [];
        wordArray[0] = new CoNLLWord().ROOT;
        wordArray = wordArray.concat(this.word);
        return wordArray;
    }
}

module.exports = CoNLLSentence;

// let a = new CoNLLSentence();
// let str = {};
// a.CoNLLSentence();
