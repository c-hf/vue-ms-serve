/**
 * 对数字和字节进行转换。<br>
 * 基础知识：<br>
 * 假设数据存储是以大端模式存储的：<br>
 * byte: 字节类型 占8位二进制 00000000<br>
 * char: 字符类型 占2个字节 16位二进制 byte[0] byte[1]<br>
 * int : 整数类型 占4个字节 32位二进制 byte[0] byte[1] byte[2] byte[3]<br>
 * long: 长整数类型 占8个字节 64位二进制 byte[0] byte[1] byte[2] byte[3] byte[4] byte[5]
 * byte[6] byte[7]<br>
 * float: 浮点数(小数) 占4个字节 32位二进制 byte[0] byte[1] byte[2] byte[3]<br>
 * double: 双精度浮点数(小数) 占8个字节 64位二进制 byte[0] byte[1] byte[2] byte[3] byte[4]
 * byte[5] byte[6] byte[7]<br>
 */
class ByteUtil {
    /**
     * 字节数组和整型的转换，高位在前，适用于读取writeInt的数据
     */
    bytesHighFirstToInt(bytes, start) {
        let num = bytes[start + 3] & 0xff;
        num |= (bytes[start + 2] << 8) & 0xff00;
        num |= (bytes[start + 1] << 16) & 0xff0000;
        num |= (bytes[start] << 24) & 0xff000000;
        return num;
    }
    bytesHighFirstToDouble(bytes, start) {
        let l = (bytes[start] << 56) & 0xff00000000000000;
        l |= (bytes[1 + start] << 48) & 0xff000000000000;
        l |= (bytes[2 + start] << 40) & 0xff0000000000;
        l |= (bytes[3 + start] << 32) & 0xff00000000;
        l |= (bytes[4 + start] << 24) & 0xff000000;
        l |= (bytes[5 + start] << 16) & 0xff0000;
        l |= (bytes[6 + start] << 8) & 0xff00;
        l |= bytes[7 + start] & 0xff;
        return l;
    }
    bytesHighFirstToChar(bytes, start) {
        let c = ((bytes[start] & 0xff) << 8) | (bytes[start + 1] & 0xff);
        return this.unicodeToChineseCharacter(c);
    }
    //unicode 转成汉字,c为10进制数
    unicodeToChineseCharacter(c) {
        let num = c.toString(16);
        let str;
        //这是null的特例,需要\u006e才可以转成字母n,\u6e转不了
        if (num == "6e" || num == "75" || num == "6c") {
            str = "\\u" + "00" + num;
        } else {
            str = "\\u" + num;
        }

        str = str.replace(/\\/g, "%");
        return unescape(str);
    }
}
module.exports = ByteUtil;

// let a = new ByteUtil();
// console.log(unescape("u6e"));
