const CoNLLSentence = require("../corpus/dependency/CoNll/CoNLLSentence");
const CoNLLWord = require("../corpus/dependency/CoNll/CoNLLWord");
const Term = require("../segmentation/common/Term");
const { Nature } = require("../corpus/tag/Nature");
const Edge = require("./common/Edge");
const Node = require("./common/Node");
const State = require("./common/State");
const DyadicArray = require("../utils/DyadicArray");

class MinimumSpanningTreeParser {
    parse(termList) {
        if (termList == null || termList.size() == 0) {
            return null;
        }
        termList.append(0, new Term("##核心##", Nature.begin));
        let nodeArray = [];
        let iterator = termList;
        for (let i = 0; i < nodeArray.length; ++i) {
            nodeArray[i] = new Node(iterator[i], i);
        }
        let edges = new DyadicArray(nodeArray.length, nodeArray.length);
        for (let i = 0; i < edges.length; ++i) {
            for (let j = 0; j < edges[i].length; ++j) {
                if (i != j) {
                    edges[j][i] = this.makeEdge(nodeArray, i, j);
                }
            }
        }
        //最小生成Prim算法
        let max_v = nodeArray.length * (nodeArray.length - 1);
        let mincost = new Array(max_v);
        mincost.fill(Number.MAX_VALUE / 3);
        let used = [max_v];
        used.fill(false);
        used[0] = true;
        let map = new Map();
        // 找虚根的唯一孩子
        let minCostToRoot = Number.MAX_VALUE;
        let firstEdge = null;
        let edgeResult = new Array(termList.size() - 1);
        for (let edge of edges[0]) {
            if (edge == null) {
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
        map.set(new State(minCostToRoot, firstEdge.from, firstEdge));
        while (!map.map.size() == 0) {
            let p = map;
            map.clear();
            let v = p.id;
            if (used[v] || p.cost > mincost[v]) {
                continue;
            }
            used[v] = true;
            if (p.edge != null) {
                edgeResult[p.edge.from - 1] = p.edge;
            }
            for (let e of edges[v]) {
                if (e == null) {
                    continue;
                }
                if (mincost[e.from] > e.cost) {
                    mincost[e.from] = e.cost;
                    map.set(new State(mincost[e.from], e.from, e));
                }
            }
        }
        let wordArray = [termList.size() - 1];
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
                wordArray[i].HEAD = CoNLLWord.ROOT;
                continue;
            }
            wordArray[i].HEAD = wordArray[index];
        }
        return new CoNLLSentence(wordArray);
    }
    makeEdge(nodeArray, from, to) {}
}
module.exports = MinimumSpanningTreeParser;
