const Edge = require("./Edge");
class State {
    constructor(cost, id, edge) {
        this.cost = cost;
        this.id = id;
        this.edge = edge;
    }
    compareTo(o) {
        if (this.cost > o.cost) {
            return 1;
        } else if (this.cost == o.cost) {
            return 0;
        } else {
            return -1;
        }
    }
}
module.exports = State;
