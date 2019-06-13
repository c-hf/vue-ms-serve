//逆向最小匹配算法,强调细粒度
ReverseMinimumMatching = (text, MAX_LENGTH = global.MAX_LENGTH) => {
    let arr = "";
    let length = 1; //从未分词的文本截取的长度
    while (text.length > 0) {
        let LENGTH = text.length;
        let tryWord = text.substring(LENGTH - length, LENGTH);
        //如果长度为词典最大长度且在词典中未找到匹配
        //活已经遍历挽剩下的文本且在词典中未找到匹配
        while (!global.dictionary.has(tryWord)) {
            //如果长度为词典最大长度且在词典中未找到匹配
            //活已经遍历挽剩下的文本且在词典中未找到匹配
            if (length > MAX_LENGTH) {
                length = 1;
                tryWord = text.substring(LENGTH - 1, LENGTH);
                break;
            }
            //如果匹配不到，则长度加一继续匹配
            length++;
            tryWord = text.substring(LENGTH - length, LENGTH);
        }
        length = 1;
        arr = arr + "/" + tryWord;
        //从待分词文本中去除已经分词的文本
        text = text.substring(0, text.length - tryWord.length);
    }
    return arr
        .split("/")
        .slice(1)
        .reverse();
};
module.exports = ReverseMinimumMatching;
