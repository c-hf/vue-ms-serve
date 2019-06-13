const fs = require("fs");
const { Path } = require("../utils/Path");
const data = fs.readFileSync(Path.PartOfSpeechDictionaryPath, "utf8");
/**
 *词性
 */
class PartOfSpeech {
    constructor(pos, des) {
        this.pos = pos;
        this.des = des;

        // this.i = new PartOfSpeech("i", "未知");
    }
    /**
     *  判断词性是否在词性字典中
     * @param {输入词性} pos
     * @return pos 或者 i(未知词性)
     */
    valueOf(pos) {
        if (pos == null || pos == "" || pos == undefined) {
            return "i";
        }
        const p = new PartOfSpeechMap();
        p.loadAndWatch();
        let partOfSpeech = p.isGetPos(pos);
        if (partOfSpeech == false) {
            //未知词性
            // return new PartOfSpeech(pos, "");
            return "i";
        }
        return pos;
    }
    isPos(pos) {
        const p = new PartOfSpeechMap();
        p.loadAndWatch();
        return p.isGetPos(pos) !== false;
    }
    getPos() {
        return this.pos;
    }
    setPos(pos) {
        this.pos = pos;
    }
    getDes() {
        return this.des;
    }
    setDes(des) {
        this.des = des;
    }
}
class PartOfSpeechMap {
    constructor() {
        this.pos = new Map();
    }
    loadAndWatch() {
        if (!data) {
            console.log("没有资源可以加载");
            return;
        }
        console.log("开始加载资源");
        let result = data.split("\n"); //把字符串转化成数组
        console.log("加载词性说明" + result.length + "行");
        this.clear();
        this.load(result);
    }
    clear() {
        this.pos.clear();
    }
    load(lines) {
        console.log("初始化自定义词性说明");
        let count = 0;
        for (let line of lines) {
            try {
                let attr = line.split("=");
                // this.pos.set(attr[0], new PartOfSpeech(attr[0], attr[1]));
                this.pos.set(attr[0], attr[1]);
                count++;
            } catch (e) {
                console.log("错误的自定义词性说明数据:" + line);
            }
        }
        console.log("自定义词性说明初始化完毕,数据条数:" + count);
    }
    add(line) {
        try {
            let attr = line.split("=");
            this.pos.set(attr[0], new PartOfSpeech(attr[0], attr[1]));
        } catch (e) {
            console.log("错误的自定义词性说明数据:" + line);
        }
    }
    remove(line) {
        try {
            let attr = line.split("=");
            this.pos.delete(attr[0]);
        } catch (e) {
            console.log("错误的自定义词性说明数据:" + line);
        }
    }
    /**
     * 判断词性是否在字典里
     * @param {词性} pos
     */
    isGetPos(pos) {
        return this.pos.has(pos);
    }
    /**
     *
     * @param {词性} pos
     */
}

module.exports = PartOfSpeech;

///////////////////test////////////////////////////

// const partOfSpeech = new PartOfSpeech();

// // console.log(partOfSpeech.isPos("n"));
// // console.log(partOfSpeech.isPos("ns"));
// partOfSpeech.isPos("nnss");
// console.log(partOfSpeech.isPos("n"));
