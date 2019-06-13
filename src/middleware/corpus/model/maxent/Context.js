/**
 * 将参数与特征关联起来的类，用来储存最大熵的参数，也用来储存模型和经验分布
 */
class Context {
    /**
     * 构建一个新的上下文
     * @param {输出} outcomePattern
     * @param {参数} parameters
     */
    constructor(outcomePattern, parameters) {
        this.parameters = parameters; //参数
        this.outcomes = outcomePattern; // 输出（标签）
    }
    /**
     * 获取输出
     *
     */
    getOutcomes() {
        return this.outcomes;
    }

    /**
     * 获取参数
     */
    getParameters() {
        return this.parameters;
    }
}
module.exports = Context;
