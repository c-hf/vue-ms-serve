//自己实现的字符串拼接类
class StringBuilder {
    constructor() {
        this.__asBuilder = [];
    }
    clear() {
        this.__asBuilder = [];
    }
    size() {
        return this.__asBuilder.length;
    }
    append() {
        Array.prototype.push.apply(this.__asBuilder, arguments);
        return this;
    }
    toString() {
        return this.__asBuilder.join("");
    }
    deleteCharAt(i) {
        this.__asBuilder.splice(i, 1);
    }
}
module.exports = StringBuilder;
