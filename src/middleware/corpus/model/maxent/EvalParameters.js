/**
 * 封装了模型用来计算概率的一些参数
 */
class EvalParameters {
    constructor(params, correctionParam, correctionConstant, numOutcomes) {
        this.params = params; //将输出与参数映射起来，下标可以用 <code>pmap</code> 查询到
        this.numOutcomes = numOutcomes; //一共有几种输出
        this.correctionConstant = correctionConstant; //一个事件中最多包含的特征数
        this.constantInverse = 1.0 / correctionConstant; //correctionConstant的倒数
        this.correctionParam = correctionParam; //修正参数
    }
    getParams() {
        return this.params;
    }
    getNumOutcomes() {
        return this.numOutcomes;
    }
    getCorrectionConstant() {
        return correctionConstant;
    }
    getConstantInverse() {
        return this.constantInverse;
    }
    getCorrectionParam() {
        return this.correctionParam;
    }
}
module.exports = EvalParameters;
