/**
 * 词首字索引式通用前缀树，高效存储，快速搜索
 * 为前缀树的一级节点（词首字）建立索引
 */
class GenericTrie {
    constructor() {
        //词表的首字母数量在一个可控范围内，默认值为12000
        this.INDEX_LENGTH = 12000;
        this.ROOT_NODES_INDEX = [];
    }
    /**
     *  清除
     */
    clear() {
        // for (let i = 0; i < this.INDEX_LENGTH; i++) {
        //     this.ROOT_NODES_INDEX[i] = null;
        // }
        this.ROOT_NODES_INDEX = [];
    }
    /**
     * 统计根节点冲突情况及预分配的数组空间利用情况
     */
    showConflict() {
        let emptySlot = 0;
        //key冲突长度,value冲突个数
        let map = new Map();
        for (let node in this.ROOT_NODES_INDEX) {
            if (node == null) {
                emptySlot++;
            } else {
                let i = 0;
                while ((node = node.getSibling()) != null) {
                    i++;
                }
                if (i > 0) {
                    let count = map.get(i);
                    if (count == null) {
                        count = 1;
                    } else {
                        count++;
                    }
                    map.set(i, count);
                }
            }
        }
        let count = 0;
        for (let [key, value] in map) {
            count += key * value;
            console.log(`冲突次数为:${key}的元素个数:${value}`);
        }
        console.log("冲突次数:" + count);
        console.log("总槽数:" + this.INDEX_LENGTH);
        console.log("用槽数:" + (this.INDEX_LENGTH - emptySlot));
        console.log(
            "使用率:" +
                ((this.INDEX_LENGTH - emptySlot) / this.INDEX_LENGTH) * 100 +
                "%"
        );
        console.log("剩槽数:" + emptySlot);
    }
    /**
     * 获取字符对应的根节点
     * 如果节点不存在
     * 则增加根节点后返回新增的节点
     * @param character 字符
     * @return 字符对应的根节点
     */
    getRootNodeIfNotExistThenCreate(character) {
        let trieNode = this.getRootNode(character);
        if (trieNode == null) {
            trieNode = new TrieNode(character);
            this.addRootNode(trieNode);
        }
        return trieNode;
    }
    /**
     * 新增一个根节点
     * @param rootNode 根节点
     */
    addRootNode(rootNode) {
        //计算节点的存储索引
        let index = rootNode.getCharacter() % this.INDEX_LENGTH;
        //检查索引是否和其他节点冲突
        let existTrieNode = this.ROOT_NODES_INDEX[index];
        if (existTrieNode != null) {
            //有冲突,将当前节点附加到当前节点之后
            rootNode.setSibling(existTrieNode);
        }
        //新增的节点总是在最前
        this.ROOT_NODES_INDEX[index] = rootNode;
    }
    /**
     * 获取字符对应的根节点
     * 如果不存在，则返回NULL
     * @param character 字符
     * @return 字符对应的根节点
     */
    getRootNode(character) {
        //计算节点的存储索引
        let index = character % this.INDEX_LENGTH;
        let trieNode = this.ROOT_NODES_INDEX[index];
        while (trieNode != null && character != trieNode.getCharacter()) {
            //如果节点和其他节点冲突,则需要链式查找
            trieNode = trieNode.getSibling();
        }
        return trieNode;
    }
    /**
     *
     * @param {词} item
     * @return 词性或者值
     */
    get(item) {
        let start = 0;
        let length = item.length;
        if (start < 0 || length < 1) {
            return null;
        }
        if (item == null) {
            return null;
        }
        //从根节点开始查找
        //获取根节点
        let node = this.getRootNode(item.charCodeAt(start));
        if (node == null) {
            //不存在根节点
            return null;
        }
        //存在根节点继续查找
        for (let i = 0; i < length; i++) {
            let character = item.charCodeAt(i + start);
            let child = node.getChild(character);
            if (child == null) {
                //未找到匹配节点
                return null;
            } else {
                //找到节点,继续往下找
                node = child;
            }
        }
        if (node.isTerminal()) {
            return node.getValue();
        }
        return null;
    }
    /**
     * 移除词性
     * @param item
     */
    remove(item) {
        if (item == null) {
            return;
        }
        //从根节点开始查找
        //获取根节点
        let node = this.getRootNode(item.charCodeAt(0));
        if (node == null) {
            //不存在根节点
            console.log("词性不存在" + item);
            return;
        }
        let length = item.length;
        //存在根节点,继续查找
        for (let i = 1; i < length; i++) {
            let character = item.charAt(i);
            let child = node.getChild(character);
            if (child == null) {
                //未找到匹配节点
                console.log("词性不存在" + item);
                return;
            } else {
                //找到节点继续往下找
                node = child;
            }
        }
        if (node.isTerminal()) {
            //设置为非子叶节点,效果相当于移除词性
            node.setTerminal(false);
            node.setValue(null);
            console.log("成功移除词性:" + item);
        } else {
            console.log("词性不存在:" + item);
        }
    }
    /**
     *
     * @param {词} item
     * @param {值或者词性} value
     */
    put(item, value) {
        //去掉首尾空白字符
        item = item.trim();
        let len = item.length;
        if (len < 1) {
            //长度小于1则忽略
            return;
        }
        //从根节点开始添加
        //获取根节点
        let node = this.getRootNodeIfNotExistThenCreate(item.charCodeAt(0));
        for (let i = 0; i < len; i++) {
            let character = item.charCodeAt(i);
            let child = node.getChildIfNotExistThenCreate(character);
            //改变顶级节点
            node = child;
        }
        //设置终结字符,表示从根节点遍历到此是一个合法的词
        node.setTerminal(true);
        //设置分值,词性
        node.setValue(value);
    }
}

class TrieNode {
    constructor(character) {
        this.character = character; //存放汉字的unicode
        this.value; //存放整个词的词性
        this.terminal; //表示是否到词尾
        this.sibling; //存放兄弟节点
        this.children = []; //存放孩子
    }
    TrieNode(character) {
        this.character = character;
    }
    isTerminal() {
        return this.terminal;
    }
    setTerminal(terminal) {
        this.terminal = terminal;
    }
    getCharacter() {
        return this.character;
    }
    setCharacter(character) {
        this.character = character;
    }
    getValue() {
        return this.value;
    }
    setValue(value) {
        this.value = value;
    }
    getSibling() {
        return this.sibling;
    }
    setSibling(sibling) {
        this.sibling = sibling;
    }
    getChildren() {}
    getChild(character) {
        let index = binarySearch(
            this.children,
            character,
            0,
            this.children.length - 1
        );
        if (index >= 0) {
            return this.children[index];
        }
        return null;
    }
    getChildIfNotExistThenCreate(character) {
        let child = this.getChild(character);
        if (child == null) {
            child = new TrieNode(character);
            this.addChild(child);
        }
        return child;
    }
    addChild(child) {
        this.children = this.insert(this.children, child);
    }
    /**
     * 将一个字符追加到有序数组
     * @param array 有序数组
     * @param element 字符
     * @return 新的有序数字
     */
    insert(array, element) {
        let length = array.length;
        if (length == 0) {
            array = [];
            array[0] = element;
            return array;
        }
        let newArray = [length + 1];
        let insert = false;
        for (let i = 0; i < length; i++) {
            if (element.getCharacter() <= array[i].getCharacter()) {
                //新元素找到合适的插入位置
                newArray[i] = element;
                //将array中剩下的元素依次加入newArray即可退出比较操作
                let newarray = array.slice(i);
                newArray = array.concat(newarray);
                insert = true;
                break;
            } else {
                newArray[i] = array[i];
            }
        }
        if (!insert) {
            //将新元素追加到尾部
            newArray[length] = element;
        }
        return newArray;
    }
}
/**
 * 二分法查找数组
 * arr:数组,findValue想要查找的元素,leftIndex rightIndex数组范围
 * @return 该元素在数组里对应的下标
 */
binarySearch = (arr, findValue, leftIndex, rightIndex) => {
    let middleIndex = Math.floor((leftIndex + rightIndex) / 2);
    let middleValue = arr[middleIndex];
    if (middleValue > findValue) {
        //左边
        binarySearch(arr, findValue, leftIndex, middleIndex - 1);
    } else if (middleValue < findValue) {
        //右边
        binarySearch(arr, findValue, middleIndex + 1, rightIndex);
    } else {
        return middleIndex;
    }
};
module.exports = GenericTrie;
/////////////////test////////////////////////////////////
// let trie = new GenericTrie();
// trie.put("写代码", "v");
// trie.put("写代", "s");
// trie.put("写", "a");
// trie.get("写");
// console.log(trie.get("写代码"));
// console.log(trie.get("写代"));
// console.log(trie.get("写"));
