// import { Stream } from "stream";
const fs = require("fs");

/**
 * 一些常用的IO操作
 */
class IOUtil {
    /**
     * 将整个文件读取为buffer
     *
     */
    readBytes(path) {
        try {
            let data = fs.readFileSync(path);
            // console.log(data);
            // return data;
            // let json = JSON.stringify(data);
            // let bytes = JSON.parse(json);
            // console.log(bytes.data[1]);
            return data;
        } catch (e) {
            console.log("读取" + path + "时发生异常" + e);
        }
        return null;
    }
}
module.exports = IOUtil;

// new IOUtil().readBytes();
