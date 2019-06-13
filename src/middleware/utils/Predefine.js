/**
 * 一些预定义的静态全局变量
 */
class Predefine {
    constructor() {
        this.TAG_PLACE = "未##地"; //地址 ns
        this.TAG_BIGIN = "始##始"; //句子的开始 begin
        this.TAG_OTHER = "未##它"; //其它
        this.TAG_GROUP = "未##团"; //团体名词 nt
        this.TAG_NUMBER = "未##数"; //数词 m
        this.TAG_QUANTIFIER = "未##量"; //数量词 mq （现在觉得应该和数词同等处理，比如一个人和一人都是合理的）
        this.TAG_PROPER = "未##专"; //专有名词 nx
        this.TAG_TIME = "未##时"; //时间 t
        this.TAG_CLUSTER = "未##串"; //字符串 x
        this.TAG_END = "末##末"; //结束 end
        this.TAG_PEOPLE = "未##人"; //人名 nr
    }
}
module.exports = Predefine;
