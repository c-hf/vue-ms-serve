const IOUtil = require("./IOUtil");
const ByteUtil = require("../../utils/ByteUtil");
const StringBuilder = require("../../utils/StringBuilder");
/**
 * 对字节数组进行封装，提供方便的读取操作
 */
class ByteArray {
    constructor(bytes) {
        this.bytes = bytes;
        this.offset = 0;
    }
    /**
     * 从文件读取一个字节数组
     */
    createByteArray(path) {
        let bytes = new IOUtil().readBytes(path);
        if (bytes == null) {
            return null;
        }
        return new ByteArray(bytes);
    }
    nextInt() {
        // let result = new ByteUtil().bytesHighFirstToInt(this.bytes, this.offset);
        let result = this.bytes.readInt32BE(this.offset);
        this.offset += 4;
        return result;
    }
    nextDouble() {
        // let result = new ByteUtil().bytesHighFirstToDouble(this.bytes, this.offset);
        let result = this.bytes.readDoubleBE(this.offset);
        this.offset += 8;
        return result;
    }
    nextString() {
        let sb = new StringBuilder();
        let length = this.nextInt();
        for (let i = 0; i < length; ++i) {
            sb.append(this.nextChar());
        }
        return sb.toString();
    }
    nextChar() {
        let result = new ByteUtil().bytesHighFirstToChar(
            this.bytes,
            this.offset
        );
        this.offset += 2;
        return result;
    }
}
module.exports = ByteArray;


// let a = new ByteArray();
// let b = a.createByteArray(
//     "E:/data-for-1.1.5/data/model/dependency/WordNature.txt.bi.bin"
// );
// console.log(b.bytes.readInt32BE(0));
// console.log(b.bytes.readDoubleBE(0));

// console.log(result);
// let c = b.bytes;
