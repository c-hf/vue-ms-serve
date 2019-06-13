/**
 * 位置
 */
const position = {
	卧室: 'bedroom',
	卫生间: 'washroom',
	客厅: 'parlour',
};
/**
 * 物品
 */
const metric = {
	吸顶灯: 'ceilingLamp',
	台灯: 'tableLamp',
	led灯: 'LEDLamp',
	风扇: 'airFan',
	报警器: 'alarm',
};
//动作的特殊情况开关
//AN={所有属性的集合}
const action = {
	打开: { switch: true },
	启动: { switch: true },
	开启: { switch: true },
	开: { switch: true },
	关: { switch: false },
	关闭: { switch: false },
	关掉: { switch: false },
};
//动作的主语,一般是设备的某个属性
//AN={所有属性的集合}
const actionSubject = {
	亮度: 'luminance',
	亮: 'luminance',
	暗: 'luminance',
	调亮: 'luminance',
	调暗: 'luminance',
	延迟: 'delay',
	颜色: 'color',
	绿色: 'color',
	白色: 'color',
	红色: 'color',
	蓝色: 'color',
	速度: 'speed',
};
//动作的谓语,如调高,加快
//type 1为指定值，2在原来基础上加，3在原来基础上减
const actionPredicate = {
	调高: 2,
	调亮: 2,
	调低: 3,
	调暗: 3,
	加快: 1,
};
//动作的宾语,一般是目标值
const actionObject = {
	10: 10,
	20: 20,
	30: 30,
	40: 40,
	50: 50,
	60: 60,
	70: 70,
	80: 80,
	90: 90,
	100: 100,
	一点: 10,
	白色: 0,
	红色: 1,
	绿色: 2,
	蓝色: 3,
	一档: 1,
	二档: 2,
	三档: 3,
	百分百: 100,
};
module.exports = {
	position: position,
	metric: metric,
	action: action,
	actionSubject: actionSubject,
	actionPredicate: actionPredicate,
	actionObject: actionObject,
};
