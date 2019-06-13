const ArrayList = require("../../../utils/ArrayList");
const EvalParameters = require("./EvalParameters");
const Context = require("./Context");
const UniformPrior = require("./UniformPrior");
const DoubleArrayGenericTrie = require("../../../utils/DoubleArrayGenericTrie");
const fs = require("fs");
const DyadicArray = require("../../../utils/DyadicArray");
const ByteArray = require("../../io/ByteArray");
const readline = require("readline");
/**
 * 最大熵模型，采用双数组Trie树
 */
class MaxEntModel {
    constructor() {
        this.correctionConstant; //常数C，训练的时候用到
        this.correctionParam; //为修正特征函数对应的参数，在预测的时候并没有用到
        this.prior = new UniformPrior(); //归一化
        this.outcomeNames = []; //事件名
        this.evalParams = new EvalParameters(); //衡量参数
        this.pmap = new DoubleArrayGenericTrie(); //将特征与一个数字（下标）对应起来的映射map
    }
    /**
     * 预测分布 计算p(y|x)=1/z *exp(∑λ(i))
     * @param {context} 环境
     * @return 概率数组
     */
    eval(context) {
        return this.evall(context, new Array(this.evalParams.getNumOutcomes()));
    }

    /**
     * 预测分布
     * @param {context} 数组
     * @return
     */
    predict(context) {
        // let result = new ArrayList(); //长度为outcomeNames.length
        let result = new Set();
        let p = this.eval(context);
        for (let i = 0; i < p.length; ++i) {
            let a = new Map();
            a.set(this.outcomeNames[i], p[i]);
            result.add(a);
        }
        return result;
    }

    /**
     * 预测分布
     * @param {context}
     * @return
     */

    /**
     * 预测分布 计算p(y|x)=1/z *exp(∑λ(i))
     *
     * @param {context} 环境
     * @param {outsums} 先验分布
     * @return 概率数组
     */
    evall(context, outsums) {
        let scontexts = new Array(context.length);
        for (let i = 0; i < context.length; i++) {
            let ci = this.pmap.Get(context[i]);
            scontexts[i] = ci == null ? -1 : ci;
        }
        this.prior.logPrior(outsums);
        return this.evalll(scontexts, outsums, this.evalParams);
    }
    /**
     * 预测 计算p(y|x)=1/z *exp(∑λ(i))
     * @param {context} 环境
     * @param {prior} 先验概率
     * @param {model} 特征函数
     * @return
     */
    evalll(context, prior, model) {
        let params = model.getParams();
        let numfeats = new Array(model.getNumOutcomes());
        numfeats.fill(0);
        let activeOutcomes;
        let activeParameters;
        let value = 1;
        for (let ci = 0; ci < context.length; ci++) {
            if (context[ci] > 0) {
                let predParams = params[context[ci]];
                activeOutcomes = predParams.getOutcomes();
                activeParameters = predParams.getParameters();
                for (let ai = 0; ai < activeOutcomes.length; ai++) {
                    let oid = activeOutcomes[ai];
                    numfeats[oid]++;
                    prior[oid] += activeParameters[ai] * value;
                }
            }
        }
        let normal = 0.0;
        for (let oid = 0; oid < model.getNumOutcomes(); oid++) {
            if (model.getCorrectionParam() != 0) {
                prior[oid] = Math.exp(
                    prior[oid] * model.getConstantInverse() +
                        (1.0 - numfeats[oid] / model.getCorrectionConstant()) *
                            model.getCorrectionParam()
                );
            } else {
                prior[oid] = Math.exp(prior[oid] * model.getConstantInverse());
            }
            normal += prior[oid];
        }
        for (let oid = 0; oid < model.getNumOutcomes(); oid++) {
            prior[oid] /= normal;
        }
        return prior;
    }

    /**
     * 从文件加载，同时缓存为二进制文件
     * @param {path}
     * @return
     */
    createByPath(path) {
        let m = new MaxEntModel();
        const data = fs.readFileSync(path, "utf-8");
        let result = data.split("\r\n");

        let n = 1;
        m.correctionConstant = result[n];
        n++;
        m.correctionParam = result[n];
        n++;

        //label
        let numOutcomes = result[n];
        n++;
        let outcomeLabels = new Array(numOutcomes);
        m.outcomeNames = outcomeLabels;
        for (let i = 0; i < numOutcomes; i++) {
            outcomeLabels[i] = result[n];
            n++;
        }

        //pattern
        let numOCTypes = result[n];
        n++;
        let outcomePatterns = new Array(numOCTypes);
        for (let i = 0; i < numOCTypes; i++) {
            let arr = result[n].split(" ");
            n++;
            let infoInts = new Array(arr.length);
            for (let j = 0, len = arr.length; j < len; j++) {
                infoInts[j] = arr[j];
            }
            outcomePatterns[i] = infoInts;
        }

        //feature
        let NUM_PREDS = result[n];
        n++;
        //
        let predLabels = new Array(NUM_PREDS);
        m.pmap = new DoubleArrayGenericTrie();
        let map = new Map();
        for (let i = 0; i < NUM_PREDS; i++) {
            predLabels[i] = result[n];
            map.set(predLabels[i], i);
            n++;
        }
        map = this.sort(map);
        m.pmap.build(map);
        for (let value of map.values()) {
            let valueBuffer = new Buffer(4);
            valueBuffer.writeInt32BE(value, 0);
            buffer = Buffer.concat([buffer, valueBuffer]);
        }
        buffer = m.pmap.save(buffer);
        // params
        let params = new Array(NUM_PREDS);
        let pid = 0;
        for (let i = 0; i < outcomePatterns.length; i++) {
            let outcomePattern = new Array(outcomePatterns[i].length - 1);
            for (let k = 1; k < outcomePatterns[i].length; k++) {
                outcomePattern[k - 1] = outcomePatterns[i][k];
            }
            for (let j = 0; j < outcomePatterns[i][0]; j++) {
                let contextParameters = [outcomePatterns[i].length - 1];
                for (let k = 1; k < outcomePatterns[i].length; k++) {
                    contextParameters[k - 1] = result[n];
                    n++;
                }
                params[pid] = new Context(outcomePattern, contextParameters);
                pid++;
            }
        }
        //prior
        m.prior = new UniformPrior();
        m.prior.setLabels(outcomeLabels);
        //eval
        m.evalParams = new EvalParameters(
            params,
            m.correctionParam,
            m.correctionConstant,
            outcomeLabels.length
        );
        // } catch (e) {
        //     console.error("从" + path + "加载最大熵模型失败！");
        //     return null;
        // }
        return m;
    }
    /**
     * 从字节流快速加载
     * @param byteArray
     * @return
     */
    createByByte(byteArray) {
        let m = new MaxEntModel();
        m.correctionConstant = byteArray.nextInt(); //常数C，训练的时候用到
        m.correctionParam = byteArray.nextDouble(); //为修正特征函数对应的参数，在预测的时候并没有用到
        // console.log(m.correctionConstant);
        // console.log(m.correctionParam);
        // label
        let numOutcomes = byteArray.nextInt();
        // console.log(numOutcomes);
        let outcomeLabels = new Array(numOutcomes);
        m.outcomeNames = outcomeLabels;

        for (let i = 0; i < numOutcomes; i++) {
            outcomeLabels[i] = byteArray.nextString();
        }

        // pattern
        let numOCTypes = byteArray.nextInt();

        let outcomePatterns = new Array(numOCTypes);
        for (let i = 0; i < numOCTypes; i++) {
            let length = byteArray.nextInt();
            let infoInts = new Array(length);
            for (let j = 0; j < length; j++) {
                infoInts[j] = byteArray.nextInt();
            }
            outcomePatterns[i] = infoInts;
        }

        // feature
        let NUM_PREDS = byteArray.nextInt();
        let predLabels = new Array(NUM_PREDS);
        m.pmap = new DoubleArrayGenericTrie();
        for (let i = 0; i < NUM_PREDS; i++) {
            predLabels[i] = byteArray.nextString();
        }
        let v = new Array(NUM_PREDS);
        for (let i = 0; i < v.length; i++) {
            v[i] = byteArray.nextInt();
        }
        m.pmap.load(byteArray, v);

        // params
        let params = new Array(NUM_PREDS);
        let pid = 0;
        for (let i = 0; i < outcomePatterns.length; i++) {
            let outcomePattern = new Array(outcomePatterns[i].length - 1);
            for (let k = 1; k < outcomePatterns[i].length; k++) {
                outcomePattern[k - 1] = outcomePatterns[i][k];
            }
            for (let j = 0; j < outcomePatterns[i][0]; j++) {
                let contextParameters = [outcomePatterns[i].length - 1];
                for (let k = 1; k < outcomePatterns[i].length; k++) {
                    contextParameters[k - 1] = byteArray.nextDouble();
                }
                params[pid] = new Context(outcomePattern, contextParameters);
                pid++;
            }
        }

        // prior
        m.prior = new UniformPrior();
        m.prior.setLabels(outcomeLabels);
        //eval
        m.evalParams = new EvalParameters(
            params,
            m.correctionParam,
            m.correctionConstant,
            outcomeLabels.length
        );

        return m;
    }
}
module.exports = MaxEntModel;
///////////test/////////////////////////
// let bytes = new ByteArray().createByteArray(
//     "E:/依存分析训练数据/MaxEnt_train.txt.bin"
// );
// let a = new MaxEntModel().createByByte(bytes);

// let a = new MaxEntModel();
// let b = a.createByPath("E:/依存分析训练数据/MaxEnt_train.txt");

// let a = new MaxEntModel();
// let b = a.createByByte("E:/依存分析训练数据/MaxEnt_train.txt.bin");
