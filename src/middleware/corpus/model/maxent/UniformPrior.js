/**
 * 先验概率计算工具
 */
class UniformPrior {
    constructor() {
        this.numOutcomes;
        this.r;
    }
    /**
     * 获取先验概率
     * @param dist 储存位置
     */
    logPrior(dist) {
        for (let oi = 0; oi < this.numOutcomes; oi++) {
            dist[oi] = this.r;
        }
    }

    /**
     * 初始化
     * @param outcomeLabels
     */
    setLabels(outcomeLabels) {
        this.numOutcomes = outcomeLabels.length;
        this.r = Math.log(1.0 / this.numOutcomes);
    }
}

module.exports = UniformPrior;
