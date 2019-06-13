//逆向最大匹配法,强调粗粒度
ReverseMaximumMatching = (text, MAX_LENGTH = global.MAX_LENGTH) => {
    let arr = "";
    while (text.length > 0) {
        let len = MAX_LENGTH;
        if (text.length < len) {
            len = text.length;
        }
        let LENGTH = text.length;
        //取指定的逆向最大长度的文本去词典里面匹配
        let tryWord = text.substring(LENGTH - len, LENGTH);
        while (!global.dictionary.has(tryWord)) {
            //如果长度为一且在词典中未找到匹配，则按长度为一切分
            if (tryWord.length == 1) {
                break;
            }
            //如果匹配不到，则长度减一继续匹配
            tryWord = tryWord.substring(1, tryWord.length);
        }
        arr = arr + "/" + tryWord;
        //从待分词文本中去除已经分词的文本
        text = text.substring(0, text.length - tryWord.length);
    }
    return arr
        .split("/")
        .slice(1)
        .reverse();
};
module.exports = ReverseMaximumMatching;
