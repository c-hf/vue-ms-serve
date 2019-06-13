const Pair = require("../utils/Pair");
const CoNLLSentence = require("../corpus/dependency/CoNll/CoNLLSentence");
const Edge = require("./common/Edge");
const Node = require("./common/Node");
const State = require("./common/State");
const Term = require("../segmentation/common/Term");
const Predefine = require("../utils/Predefine");
const LinkedList = require("../utils/LinkedList");
const MaxEntModel = require("../corpus/model/maxent/MaxEntModel");
const ByteArray = require("../corpus/io/ByteArray");
const { Nature } = require("../corpus/tag/Nature");
const DyadicArray = require("../utils/DyadicArray");
const CoNLLWord = require("../corpus/dependency/CoNll/CoNLLWord");

/**
 * 最大熵依存句法分析器
 */
class MaxEntDependencyParser {
    constructor() {
        this.model = new MaxEntModel();
    }
    parse(termList) {
        if (termList == null || termList.length == 0) {
            return null;
        }

        // termList.unshift("##核心##" + "/" + Nature.begin);
        termList.unshift(new Term("##核心##", Nature.begin));
        let nodeArray = new Array(termList.length);
        for (let i = 0; i < nodeArray.length; ++i) {
            nodeArray[i] = new Node(termList[i], i);
        }
        // console.log(nodeArray);
        let edges = DyadicArray.DyadicArray(nodeArray.length, nodeArray.length);
        for (let i = 0; i < edges.length; ++i) {
            for (let j = 0; j < edges[i].length; ++j) {
                if (i != j) {
                    edges[j][i] = this.makeEdge(nodeArray, i, j);
                }
            }
        }
        //最小生成Prim算法
        let MAX_VALUE = 3.4028235e38;
        let max_v = nodeArray.length * (nodeArray.length - 1);
        let mincost = new Array(max_v);
        mincost.fill(MAX_VALUE / 3);
        let used = new Array(max_v);
        used.fill(false);
        used[0] = true;
        let set = new Set();
        // 找虚根的唯一孩子
        let minCostToRoot = MAX_VALUE;
        let firstEdge = null;
        let edgeResult = new Array(termList.length - 1);
        for (let edge of edges[0]) {
            if (edge.length == 0) {
                continue;
            }
            if (minCostToRoot > edge.cost) {
                firstEdge = edge;
                minCostToRoot = edge.cost;
            }
        }
        if (firstEdge == null) {
            return null;
        }
        set.add(new State(minCostToRoot, firstEdge.from, firstEdge));
        while (set.size !== 0) {
            let p;
            for (let value of set.values()) {
                if (p == undefined) {
                    p = value;
                }
                if (p.cost > value.cost) {
                    p = value;
                }
            }
            set.delete(p);
            let v = p.id;
            if (used[v] || p.cost > mincost[v]) {
                continue;
            }

            used[v] = true;
            if (p.edge !== null) {
                edgeResult[p.edge.from - 1] = p.edge;
            }
            // for (let e of edges[v])
            for (let i = 0, len = edges[v].length; i < len; i++) {
                if (edges[v][i] == null) {
                    continue;
                }
                if (mincost[edges[v][i].from] > edges[v][i].cost) {
                    mincost[edges[v][i].from] = edges[v][i].cost;
                    set.add(
                        new State(
                            mincost[edges[v][i].from],
                            edges[v][i].from,
                            edges[v][i]
                        )
                    );
                }
            }
        }
        let wordArray = new Array(termList.length - 1);
        for (let i = 0; i < wordArray.length; ++i) {
            wordArray[i] = new CoNLLWord(
                i + 1,
                nodeArray[i + 1].word,
                nodeArray[i + 1].label
            );
            wordArray[i].DEPREL = edgeResult[i].label;
        }
        for (let i = 0; i < edgeResult.length; ++i) {
            let index = edgeResult[i].to - 1;
            if (index < 0) {
                wordArray[i].HEAD = new CoNLLWord().ROOT;
                continue;
            }
            wordArray[i].HEAD = wordArray[index];
        }
        let coNLLSentence = new CoNLLSentence(wordArray);

        return coNLLSentence;
        // return coNLLSentence.toString();
    }
    load(path) {
        // console.time();
        let byteArray = new ByteArray().createByteArray(path);
        if (byteArray !== null) {
            this.model = new MaxEntModel().createByByte(byteArray);
            // this.model = new MaxEntModel().createByPath(byteArray);
        }
        // console.timeEnd();
        let result = this.model == null ? "失败" : "成功";
        console.log("最大熵依存句法模型载入" + result);
    }
    compute() {
        //分词后
        if (arguments[0].length > 1) {
            let maxEntDependencyParser = new MaxEntDependencyParser();
            maxEntDependencyParser.model = this.model;
            return maxEntDependencyParser.parse(arguments[0]);
        } //分词前
        else if (arguments[0].length == 1) {
        }
    }

    makeEdge(nodeArray, from, to) {
        let context = new LinkedList();
        let index = from;
        for (let i = index - 2; i < index + 2 + 1; ++i) {
            let w =
                i >= 0 && i < nodeArray.length
                    ? nodeArray[i]
                    : {
                          word: "##空白##",
                          label: "null",
                          compiledWord: "##空白##",
                          id: "-1"
                      };
            context.append(w.compiledWord + "i" + (i - index));
            context.append(w.label + "i" + (i - index));
        }
        index = to;
        for (let i = index - 2; i < index + 2 + 1; ++i) {
            let w =
                i >= 0 && i < nodeArray.length
                    ? nodeArray[i]
                    : {
                          word: "##空白##",
                          label: "null",
                          compiledWord: "##空白##",
                          id: "-1"
                      };

            context.append(w.compiledWord + "j" + (i - index));
            context.append(w.label + "j" + (i - index));
        }
        context.append(
            nodeArray[from].compiledWord + "→" + nodeArray[to].compiledWord
        );
        context.append(nodeArray[from].label + "→" + nodeArray[to].label);
        context.append(
            nodeArray[from].compiledWord +
                "→" +
                nodeArray[to].compiledWord +
                (from - to)
        );
        context.append(
            nodeArray[from].label + "→" + nodeArray[to].label + (from - to)
        );
        let wordBeforeI =
            from - 1 >= 0
                ? nodeArray[from - 1]
                : {
                      word: "##空白##",
                      label: "null",
                      compiledWord: "##空白##",
                      id: "-1"
                  };
        let wordBeforeJ =
            to - 1 >= 0
                ? nodeArray[to - 1]
                : {
                      word: "##空白##",
                      label: "null",
                      compiledWord: "##空白##",
                      id: "-1"
                  };
        context.append(
            wordBeforeI.compiledWord +
                "@" +
                nodeArray[from].compiledWord +
                "→" +
                nodeArray[to].compiledWord
        );
        context.append(
            nodeArray[from].compiledWord +
                "→" +
                wordBeforeJ.compiledWord +
                "@" +
                nodeArray[to].compiledWord
        );
        context.append(
            wordBeforeI.label +
                "@" +
                nodeArray[from].label +
                "→" +
                nodeArray[to].label
        );
        context.append(
            nodeArray[from].label +
                "→" +
                wordBeforeJ.label +
                "@" +
                nodeArray[to].label
        );
        // console.log(context.toArray());
        let mapList = this.model.predict(context.toArray());
        // console.log(mapList);
        let maxPair = new Pair("null", -1.0);
        let i = 0;
        for (let map of mapList) {
            for (let [key, value] of map) {
                if (value > maxPair.getValue() && "null" !== key) {
                    maxPair.setKey(key);
                    maxPair.setValue(value);
                }
            }
        }
        return new Edge(
            from,
            to,
            -Math.log(maxPair.getValue()),
            maxPair.getKey()
        );
    }
}
module.exports = MaxEntDependencyParser;

///test//////////////////////////////////
// let a = new MaxEntDependencyParser();
// a.load("E:/test-koa/src/middleware/data/model/MaxEnt_train.txt.bin");
// // a.load("E:/test/data/model/MaxEnt_train.txt.bin");

// // console.log(a.model);
// let b = a.compute([
//     {
//         word: "坚决",
//         nature: "ad"
//     },
//     {
//         word: "惩治",
//         nature: "v"
//     },
//     {
//         word: "贪污",
//         nature: "v"
//     },
//     {
//         word: "贿赂",
//         nature: "vn"
//     },
//     {
//         word: "等",
//         nature: "udeng"
//     },
//     {
//         word: "经济",
//         nature: "n"
//     },
//     {
//         word: "犯罪",
//         nature: "vn"
//     }
// ]);

// let b = a.compute([
//     {
//         word: "把",
//         nature: "p"
//     },
//     {
//         word: "客厅",
//         nature: "n"
//     },
//     {
//         word: "的",
//         nature: "u"
//     },
//     {
//         word: "吸顶灯",
//         nature: "n"
//     },
//     {
//         word: "开",
//         nature: "v"
//     }
// ]);

// let b = a.compute([
//     {
//         word: "关闭",
//         nature: "v"
//     },
//     {
//         word: "客厅1",
//         nature: "n"
//     },
//     {
//         word: "的",
//         nature: "u"
//     },
//     {
//         word: "吸顶灯",
//         nature: "n"
//     }
// ]);
// let b = a.compute([
//     {
//         word: "请",
//         nature: "v"
//     },
//     {
//         word: "你",
//         nature: "r"
//     },
//     {
//         word: "启动",
//         nature: "v"
//     },
//     {
//         word: "客厅",
//         nature: "n"
//     },
//     {
//         word: "的",
//         nature: "u"
//     },
//     {
//         word: "吸顶灯",
//         nature: "n"
//     }
// ]);

// let b = a.compute([
//     {
//         word: "把",
//         nature: "v"
//     },
//     {
//         word: "卧室",
//         nature: "n"
//     },
//     {
//         word: "的",
//         nature: "u"
//     },
//     {
//         word: "吸顶灯",
//         nature: "n"
//     },
//     {
//         word: "亮度",
//         nature: "n"
//     },
//     {
//         word: "调到",
//         nature: "v"
//     },
//     {
//         word: "90%",
//         nature: "m"
//     }
// ]);
// console.log(b);
