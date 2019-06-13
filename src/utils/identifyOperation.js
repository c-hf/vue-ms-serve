const fs = require("fs");
const Relationaltuple = require("../middleware/relationalTuple/Relationaltuple");
const {
    position,
    action,
    metric,
    actionSubject,
    actionPredicate,
    actionObject
} = require("./conf.js"); //命令

/**
 * 位置对应的参数
 */

/**
 * 打开
 */
const identifyOpenOperation = text => {
    let segOrder = textConversionCommand(Relationaltuple.WordSeg(text));
    let depencyOrder = depencyTextToDataPoint(
        Relationaltuple.WordFiltering(text)
    );
    let datapoints = {
        metric: depencyOrder.metric || segOrder.metric,
        position: depencyOrder.position || segOrder.position,
        action: depencyOrder.action || segOrder.action,
        type: depencyOrder.type || segOrder.type
    };
    console.log(datapoints);
    return datapoints;
};
/**
 *  把经过过滤的文字转换成命令
 */

const textConversionCommand = text => {
    let arr = text;
    let datapoints = {
        metric: "",
        position: "",
        action: "",
        type: 1
    };
    let actionSynthesis = "";
    //position位置
    for (let i = 0, len = arr.length; i < len; i++) {
        if (position[arr[i]]) {
            datapoints.position = arr[i];
            arr.splice(i, 1);
        }
    }
    //metric设备类型
    for (let i = 0, len = arr.length; i < len; i++) {
        if (metric[arr[i]]) {
            datapoints.metric = arr[i];
            arr.splice(i, 1);
        }
    }

    //action动作
    for (let i = 0, len = arr.length; i < len; i++) {
        //先判断是否只是开关
        if (action[text[i]]) {
            datapoints.action = action[text[i]];
            return datapoints;
        } else {
            //动作的主语
            if (actionSubject[arr[i]]) {
                actionSynthesis = `"${actionSubject[arr[i]]}"`;
            }
            //动作的谓语
            if (actionObject[arr[i]]) {
                actionSynthesis = actionSynthesis + ":" + actionObject[arr[i]];
            }
            if (actionPredicate[arr[i]]) {
                datapoints.type = actionPredicate[arr[i]];
            }
        }
    }
    actionSynthesis = "{" + actionSynthesis + "}";
    actionSynthesis = JSON.parse(actionSynthesis);
    datapoints.action = actionSynthesis;
    return datapoints;
};
/**
 * 把依存信息转换成数据点，根据设备位置，设备名称，设备属性，设备属性值来定义数据点,
 * type 1为指定值，2在原来基础上加，3在原来基础上减
 * @param {依存句子信息} depencyText
 */

const depencyTextToDataPoint = depencyText => {
    console.log(depencyText.toString());
    let datapoints = {
        metric: "",
        position: "",
        action: "",
        type: 1
    };
    let actionSynthesis = "";
    for (let i of depencyText.word) {
        //提取实词 m为数词，n为名词，v为动词
        if (
            i.CPOSTAG == "m" ||
            i.CPOSTAG == "mq" ||
            i.CPOSTAG == "n" ||
            i.CPOSTAG == "v"
        ) {
            //提取句子中的核心成分
            if (
                i.DEPREL == "核心关系" ||
                i.DEPREL == "动宾关系" ||
                i.DEPREL == "动补结构" ||
                i.DEPREL == "定中关系" ||
                i.DEPREL == "主谓关系" ||
                i.DEPREL == "介宾关系"
            ) {
                if (position[i.LEMMA]) {
                    datapoints.position = i.LEMMA;
                }
                if (metric[i.LEMMA]) {
                    datapoints.metric = i.LEMMA;
                }
                //先判断动作是简单开关
                if (action[i.LEMMA]) {
                    datapoints.action = action[i.LEMMA];
                }
                //判断复杂动作
                else {
                    if (actionSubject[i.LEMMA]) {
                        actionSynthesis = `"${actionSubject[i.LEMMA]}"`;
                    }
                    //判断复杂动作的宾语
                    if (
                        (actionObject[i.LEMMA] &&
                            i.HEAD.CPOSTAG == "v" &&
                            i.DEPREL == "动宾关系") ||
                        (actionObject[i.LEMMA] &&
                            i.HEAD.CPOSTAG == "v" &&
                            i.DEPREL == "动补结构")
                    ) {
                        if (actionPredicate[i.HEAD.LEMMA]) {
                            actionSynthesis =
                                actionSynthesis + ":" + actionObject[i.LEMMA];

                            actionSynthesis = "{" + actionSynthesis + "}";
                            actionSynthesis = JSON.parse(actionSynthesis);
                            datapoints.type = actionPredicate[i.HEAD.LEMMA];
                            datapoints.action = actionSynthesis;
                        } else {
                            actionSynthesis =
                                actionSynthesis + ":" + actionObject[i.LEMMA];
                            actionSynthesis = "{" + actionSynthesis + "}";
                            actionSynthesis = JSON.parse(actionSynthesis);
                            datapoints.action = actionSynthesis;
                        }
                    }
                }
            }
        }
    }
    return datapoints;
};

/**
 * 判断数组是否存在某一项
 */
const contains = (arr, obj) => {
    let i = arr.length;
    while (i--) {
        if (arr[i] === obj) {
            return true;
        }
    }
    return false;
};

module.exports = {
    identifyOpenOperation: identifyOpenOperation
};
