const StringBuilder = require("../../../utils/StringBuilder");
const PosTagCompiler = require("./PosTagCompiler");
class CoNLLWordRoot {
    constructor(ID, LEMMA, CPOSTAG, POSTAG) {
        this.ID = ID; //当前词在句子中的序号
        this.LEMMA = LEMMA; //当前词语（或标点）的原型或词干，在中文中，此列与FORM相同
        this.CPOSTAG = CPOSTAG; //当前词语的词性(粗粒度)
        this.POSTAG = POSTAG; //当前词语的词性(细粒度)
        this.NAME = LEMMA;
    }
}

class CoNLLWord {
    constructor(ID, LEMMA, CPOSTAG, POSTAG) {
        this.ID = ID; //当前词在句子中的序号
        this.LEMMA = LEMMA; //当前词语（或标点）的原型或词干，在中文中，此列与FORM相同
        this.CPOSTAG = CPOSTAG; //当前词语的词性(粗粒度)
        this.POSTAG = POSTAG; //当前词语的词性(细粒度)
        this.HEAD; //当前词语的中心词
        this.DEPREL = null; //当前词语与中心词的依存关系
        this.NAME; //等效字符串
        this.ROOT = new CoNLLWordRoot(0, "##核心##", "ROOT", "root"); //根节点
        this.NULL = new CoNLLWordRoot(-1, "##空白##", "NULL", "null"); //空白节点，用于描述下标超出word数组的词语
    }
    compile() {
        this.NAME = new PosTagCompiler().compile(this.POSTAG, this.LEMMA);
    }
    CoNLLWord() {
        /**参数个数为3时
         * ID,当前词在句子中的序号，１开始.
         * LEMMA,当前词语（或标点）的原型或词干，在中文中，此列与FORM相同
         * POSTAG, 当前词语的词性（细粒度）
         * */

        if (arguments.length == 3) {
            this.ID = arguments[0];
            this.LEMMA = arguments[1];
            this.CPOSTAG = arguments[2].substring(0, 1); // 取首字母作为粗粒度词性
            this.POSTAG = arguments[2];
            this.compile();
        } else if (arguments.length == 4) {
            this.ID = arguments[0];
            this.LEMMA = arguments[1];
            this.CPOSTAG = arguments[2];
            this.POSTAG = arguments[3];
            this.compile();
        } else if (arguments.length == 1) {
            this.LEMMA = arguments[0].value[2];
            this.CPOSTAG = arguments[0].value[3];
            this.POSTAG = arguments[0].value[4];
            this.DEPREL = arguments[0].value[7];
            this.ID = arguments[0].id;
            this.compile();
        }
    }

    toString() {
        let sb = new StringBuilder();
        sb.append(this.ID)
            .append("\t")
            .append(this.LEMMA)
            .append("\t")
            .append(this.LEMMA)
            .append("\t")
            .append(this.CPOSTAG)
            .append("\t")
            .append(this.POSTAG || this.CPOSTAG)
            .append("\t")
            .append("_")
            .append("\t")
            .append(this.HEAD.ID || 0)
            .append("\t")
            .append(this.DEPREL)
            .append("\t")
            .append("_")
            .append("\t")
            .append("_");
        return sb;
    }
}

// const a = new CoNLLWord();
// a.CoNLLWord(1, 2, 3, 4);
module.exports = CoNLLWord;
