const Bigram = require("../corpus/model/bigram/bigram");
//节点
class Node {
    constructor(_byte) {
        this.childs = {}; //子节点集合
        this._byte = _byte || null; //此节点上存储的字节
        this._isWord = false; //边界保存，表示是否可以组成一个词
        this._count = 0; //表示已经判断的次数
    }
    isWord() {
        return this._isWord && this._count == 0;
    }
    asWord() {
        this._isWord = true;
    }
    addCount() {
        this._count++;
    }
    getCount() {
        return this._count;
    }
}

class Trie {
    constructor() {
        this.root = new Node(null);
    }
    /**
     * 添加每个单词到Trie树
     */
    add(word) {
        let node = this.root,
            len = word.length;
        let words = word.split("");
        for (let i = 0; i < len; i++) {
            let c = words[i];
            // 如果不存在则添加，存在则不需要添加，因为共用前缀
            if (!(c in node.childs)) {
                node.childs[c] = new Node(c);
            }
            node = node.childs[c];
        }
        node.asWord(); // 成词边界
    }
    /**
     * 按单字在Trie树中搜索
     */
    search(words) {
        let node = this.root;
        let len = words.length;
        for (let i = 0; i < len; i++) {
            let c = words[i];
            let childs = node.childs;
            if (!(c in childs)) {
                return false;
            }

            let cnode = childs[c];
            if (cnode.isWord() && i == len - 1) {
                return true;
            }

            node = cnode;
        }
    }

    /**
     *
     * 初始化整颗Trie树
     */
    init(dict) {
        this.MAX_LENGTH = 0;
        for (let item of dict.keys()) {
            if (item.length > this.MAX_LENGTH) {
                this.MAX_LENGTH = item.length;
            }
            this.add(item);
        }
    }
    /**
     * 分词
     */
    //正向最大匹配算法,强调粗粒度
    MaximumMatching(text, MAX_LENGTH = this.MAX_LENGTH) {
        let arr = "";
        while (text.length > 0) {
            let len = MAX_LENGTH;
            if (text.length < len) {
                len = text.length;
            }
            //取指定的正向最大长度的文本去词典里面匹配
            let tryWord = text.substring(0, 0 + len);
            while (!this.search(tryWord)) {
                //如果长度为一且在词典中未找到匹配，则按长度为一切分
                if (tryWord.length == 1) {
                    break;
                }
                //如果匹配不到，则长度减一继续匹配
                tryWord = tryWord.substring(0, tryWord.length - 1);
            }
            // if (this.search(tryWord)) {
            //     arr = arr + "/" + tryWord;
            // }
            arr = arr + "/" + tryWord;
            //从待分词文本中去除已经分词的文本
            text = text.substring(tryWord.length);
        }
        return arr.split("/").slice(1);
    }
    //逆向最大匹配法,强调粗粒度
    ReverseMaximumMatching(text, MAX_LENGTH = this.MAX_LENGTH) {
        let arr = "";
        while (text.length > 0) {
            let len = MAX_LENGTH;
            if (text.length < len) {
                len = text.length;
            }
            let LENGTH = text.length;
            //取指定的逆向最大长度的文本去词典里面匹配
            let tryWord = text.substring(LENGTH - len, LENGTH);
            while (!this.search(tryWord)) {
                //如果长度为一且在词典中未找到匹配，则按长度为一切分
                if (tryWord.length == 1) {
                    break;
                }
                //如果匹配不到，则长度减一继续匹配
                tryWord = tryWord.substring(1, tryWord.length);
            }
            arr = arr + "/" + tryWord;
            //从待分词文本中去除已经分词的文本
            text = text.substring(0, text.length - tryWord.length);
        }
        return arr.split("/").slice(1);
    }
    //正向最小匹配算法,强调细粒度
    MinimumMatching(text, MAX_LENGTH = this.MAX_LENGTH) {
        let arr = "";
        let length = 1; //从未分词的文本截取的长度
        while (text.length > 0) {
            //取指定的正向最最小长度的文本去词典里面匹配
            let tryWord = text.substring(0, length);
            while (!this.search(tryWord)) {
                //如果长度为词典最大长度且在词典中未找到匹配
                //活已经遍历挽剩下的文本且在词典中未找到匹配
                if (length > MAX_LENGTH) {
                    length = 1;
                    tryWord = text.substring(0, 1);
                    break;
                }
                //如果匹配不到，则长度加一继续匹配
                length++;
                tryWord = text.substring(0, length);
            }
            length = 1;
            arr = arr + "/" + tryWord;
            //从待分词文本中去除已经分词的文本
            text = text.substring(tryWord.length);
        }
        return arr.split("/").slice(1);
    }
    //逆向最小匹配算法,强调细粒度
    ReverseMinimumMatching(text, MAX_LENGTH = this.MAX_LENGTH) {
        let arr = "";
        let length = 1; //从未分词的文本截取的长度
        while (text.length > 0) {
            let LENGTH = text.length;
            let tryWord = text.substring(LENGTH - length, LENGTH);
            //如果长度为词典最大长度且在词典中未找到匹配
            //活已经遍历挽剩下的文本且在词典中未找到匹配
            while (!this.search(tryWord)) {
                //如果长度为词典最大长度且在词典中未找到匹配
                //活已经遍历挽剩下的文本且在词典中未找到匹配
                if (length > MAX_LENGTH) {
                    length = 1;
                    tryWord = text.substring(LENGTH - 1, LENGTH);
                    break;
                }
                //如果匹配不到，则长度加一继续匹配
                length++;
                tryWord = text.substring(LENGTH - length, LENGTH);
            }
            length = 1;
            arr = arr + "/" + tryWord;
            //从待分词文本中去除已经分词的文本
            text = text.substring(0, text.length - tryWord.length);
        }
        return arr.split("/").slice(1);
    }
    //双向最大匹配算法,加入启发规则对结果进一步消除歧义,强调粗粒度
    BidirectionalMaximumMatching(text, MAX_LENGTH = this.MAX_LENGTH) {
        let fmm = this.MaximumMatching(text); //正向最大匹配算法
        let bmm = this.ReverseMaximumMatching(text); //逆向最大匹配算法
        //如果正逆两项分词结果词数不同,则取分词数较少的那个
        if (fmm.length !== bmm.length) {
            if (fmm.length > bmm.length) {
                return bmm;
            } else {
                return fmm;
            }
        }
        //如果分词数结果相同
        else {
            //正逆分词数目相同,可以返回任意一个,然后判断两种分词结果单字的个数,返回单字个数少的结果
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
            //相同返回正向最大结果
            if (FSingle === BSingle) {
                return fmm;
            } else if (FSingle > BSingle) {
                return bmm;
            } else {
                return fmm;
            }
        }
    }
    //双向最小匹配算法,加入启发规则对结果进一步消除歧义,强调细粒度
    BidirectionalMinimumMatching(text, MAX_LENGTH = this.MAX_LENGTH) {
        let fmm = this.MinimumMatching(text); //正向最小匹配算法
        let bmm = this.ReverseMinimumMatching(text); //逆向最小匹配算法
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
    }
    //双向最大最小匹配算法,利用ngram从 正向最大匹配、逆向最大匹配、正向最小匹配、逆向最小匹配
    BidirectionalMaximumMinimumMatching(text, MAX_LENGTH = global.MAX_LENGTH) {
        let wordsRMM = this.ReverseMaximumMatching(text); //逆向最大匹配算法分词结果
        let wordsMM = this.MaximumMatching(text); //正向最大匹配算法分词结果
        let wordsMIM = this.MinimumMatching(text); //正向最小匹配算法分词结果
        let wordsRMIM = this.ReverseMinimumMatching(text); //逆向最小匹配算法分词结果
        //如果分词结果都一样返回逆向最大匹配算法的分词结果
        if (
            wordsRMM == wordsMM &&
            wordsRMM == wordsMIM &&
            wordsRMM == wordsRMIM
        ) {
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
    }
}

////////////////////test///////////////////////////

//初始化分词字典
const fs = require("fs");
//分词字典路径
const data = fs.readFileSync(
    "E:/test-koa/src/middleware/data/dictionary/ripe-dictionary/dictionary.txt",
    "utf8"
);
const ConstructingDictionary = () => {
    let maxlength = 0;
    let result = data.split("\n"); //把字符串转化成数组
    global.dictionary = new Set(result);
    for (let item of global.dictionary.keys()) {
        if (maxlength < item.length) {
            maxlength = item.length;
        }
    }
    global.MAX_LENGTH = maxlength;
    console.log("加载分词字典词最大长度:" + maxlength);
    console.log("加载字典数据" + result.length + "行");
};
ConstructingDictionary();

//待分的字符串
let words = "把客厅的吸顶灯给我打开";
let trie = new Trie();
trie.init(global.dictionary);

let result1 = trie.MaximumMatching(words);
let result2 = trie.ReverseMaximumMatching(words);
let result3 = trie.MinimumMatching(words);
let result4 = trie.ReverseMinimumMatching(words);
let result5 = trie.BidirectionalMaximumMatching(words);
let result6 = trie.BidirectionalMinimumMatching(words);
let result7 = trie.BidirectionalMaximumMinimumMatching(words);

console.log(result1);
console.log(result2);
console.log(result3);
console.log(result4);
console.log(result5);
console.log(result6);
console.log(result7);
