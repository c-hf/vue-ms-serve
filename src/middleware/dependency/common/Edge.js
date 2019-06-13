/**
 * 一条边
 */
class Edge {
    constructor(from, to, cost, label) {
        this.from = from;
        this.to = to;
        this.cost = cost;
        this.label = label;
    }
}

module.exports = Edge;
