const CoNLLWord = require("../../corpus/dependency/CoNll/CoNLLWord");
const PosTagCompiler = require("../../corpus/dependency/CoNll/PosTagCompiler");
const Term = require("../../segmentation/common/Term");
const { Nature } = require("../../corpus/tag/Nature");
/**
 *   节点
 */
class Node {
    constructor(term, id) {
        this.NULL = {
            word: "##空白##",
            label: "n",
            compiledWord: "##空白##",
            id: "-1"
        };
        this.word = term.word;
        switch (term.nature) {
            case "bg":
                this.label = "b";
                break;
            case "mg":
                this.label = "Mg";
                break;
            case "nx":
                this.label = "x";
                break;
            case "qg":
                this.label = "q";
                break;
            case "ud":
                this.label = "u";
                break;
            case "uj":
                this.label = "u";
                break;
            case "uz":
                this.label = "uzhe";
                break;
            case "ug":
                this.label = "uguo";
                break;
            case "ul":
                this.label = "ulian";
                break;
            case "uv":
                this.label = "u";
                break;
            case "yg":
                this.label = "y";
                break;
            case "zg":
                this.label = "z";
                break;
            case "ntc":
            case "ntcf":
            case "ntcb":
            case "ntch":
            case "nto":
            case "ntu":
            case "nts":
            case "nth":
                this.label = "nt";
                break;
            case "nh":
            case "nhm":
            case "nhd":
                this.label = "nz";
                break;
            case "nn":
                this.label = "n";
                break;
            case "nnt":
                this.label = "n";
                break;
            case "nnd":
                this.label = "n";
                break;
            case "nf":
                this.label = "n";
                break;
            case "ni":
            case "nit":
            case "nic":
                this.label = "nt";
                break;
            case "nis":
                this.label = "n";
                break;
            case "nm":
                this.label = "n";
                break;
            case "nmc":
                this.label = "nz";
                break;
            case "nb":
                this.label = "nz";
                break;
            case "nba":
                this.label = "nz";
                break;
            case "nbc":
            case "nbp":
            case "nz":
                this.label = "nz";
                break;
            case "g":
                this.label = "nz";
                break;
            case "gm":
            case "gp":
            case "gc":
            case "gb":
            case "gbc":
            case "gg":
            case "gi":
                this.label = "nz";
                break;
            case "j":
                this.label = "nz";
                break;
            case "i":
                this.label = "nz";
                break;
            case "l":
                this.label = "nz";
                break;
            case "rg":
            case "Rg":
                this.label = "Rg";
                break;
            case "udh":
                this.label = "u";
                break;
            case "e":
                this.label = "y";
                break;
            case "xx":
                this.label = "x";
                break;
            case "xu":
                this.label = "x";
                break;
            case "w":
            case "wkz":
            case "wky":
            case "wyz":
            case "wyy":
            case "wj":
            case "ww":
            case "wt":
            case "wd":
            case "wf":
            case "wn":
            case "wm":
            case "ws":
            case "wp":
            case "wb":
            case "wh":
                this.label = "x";
                break;
            case "begin":
                this.label = "root";
                break;
            case "eng":
                this.label = "eng";
                break;
            case "eng":
                this.label = "eng";
                break;
            case "mh":
                this.label = "mh";
                break;
            case "mx":
                this.label = "mx";
                break;
            case "mf":
                this.label = "mf";
                break;
            case "tq":
                this.label = "tq";
                break;
            case "mf":
                this.label = "mf";
                break;
            case "tdq":
                this.label = "tdq";
                break;
            case "uk":
                this.label = "uk";
                break;
            default:
                this.label = term.nature;
                break;
        }
        this.compiledWord = new PosTagCompiler().compile(this.label, this.word);
        this.id = id;
    }
}
// let NULL = new Node(new Term(new CoNLLWord().NULL.NAME, Nature.n), -1);
module.exports = Node;
