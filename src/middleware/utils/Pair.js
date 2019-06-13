class Pair {
    constructor(first, second) {
        this.first = first;
        this.second = second;
    }
    getFirst() {
        return this.first;
    }

    getKey() {
        return this.first;
    }

    getSecond() {
        return this.second;
    }
    setKey(key) {
        this.first = key;
    }
    setValue(value) {
        this.second = value;
    }
    getValue() {
        return this.second;
    }
    toString() {
        return this.first + "=" + this.second;
    }
}
module.exports = Pair;
