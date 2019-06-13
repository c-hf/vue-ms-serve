/**
 * 通用的双数组前缀树
 * 用于快速检索 K V 对
 */
const Arraylist = require("./ArrayList");
class Node {
    constructor() {
        this.code; //中文字符的unicode编码
        this.depth; //树深
        this.left; //表示这个节点在字典中的索引范围
        this.right; //表示这个节点在字典中的索引范围
        this.value; //用于存放词频
        this.v; //和byte有关
    }
    toString() {
        return (
            "Node{" +
            "code=" +
            this.code +
            "[" +
            this.code +
            "]" +
            ", depth=" +
            this.depth +
            ", left=" +
            this.left +
            ", right=" +
            this.right +
            ", value=" +
            this.value +
            "}"
        );
    }
}

class DoubleArrayGenericTrie {
    constructor() {
        this.size = 65000;
        this.check = []; //check[begin+code]=begin
        this.base = []; //base[begin+code]=child_begin
        this.used = []; //判断begin的值是否已经用过
        this.nextCheckPos;
    }
    DoubleArrayGenericTrie() {
        console.log("初始化双数组前缀树");
    }
    /**
     *计算兄弟节点, 为parent生成子节点,返回互为兄弟的节点
     */
    toTree(parent, items, map) {
        let siblings = new Arraylist(); //兄弟节点
        let prev = 0; //表示上一个节点的code
        //遍历父节点的索引范围
        for (let i = parent.left; i < parent.right; i++) {
            //如果某个孩子的长度小于父节点的树深,跳出循环
            if (items.get(i).length < parent.depth) {
                continue;
            }
            let item = items.get(i);
            let cur = 0; //表示当前节点的code
            //如果一个词的长度不等于父节点的树深,结合上面的if就是大于父节点的树深
            if (item.length != parent.depth) {
                cur = item.charCodeAt(parent.depth);
            }
            //如果code不等于上一个code或者兄弟节点的数组等于0,创建一个新的节点
            if (cur != prev || siblings.size() == 0) {
                let node = new Node();
                node.depth = parent.depth + 1;
                node.code = cur;
                node.left = i;
                if (cur == 0 || cur == item.charCodeAt(item.length - 1)) {
                    if (map.get(item) != null) {
                        node.value = map.get(item);
                    }
                }
                if (siblings.size() != 0) {
                    siblings.get(siblings.size() - 1).right = i;
                }
                siblings.add(node);
            }
            prev = cur;
        }
        if (siblings.size() != 0) {
            siblings.get(siblings.size() - 1).right = parent.right;
        }
        return siblings;
    }

    /**
     * 为check数组和base数组赋值
     *
     */
    toDoubleArray(siblings, words, map) {
        let begin = 0;
        let index =
            siblings.get(0).code > this.nextCheckPos
                ? siblings.get(0).code
                : this.nextCheckPos;
        let isFirst = true;
        //为兄弟节点寻找begin, 有check[begin+ a1]=0 ... check[begin + an]=0,寻找begin的方式有多种，满足条件即可
        //也可叫做check的合法性检查
        outer: while (true) {
            index++;
            //判断code在check是否不等于零,不等于零则重新查找
            if (this.check[index] != undefined) {
                continue;
            } else if (isFirst) {
                this.nextCheckPos = index;
                isFirst = false;
            }
            begin = index - siblings.get(0).code; //寻找begin
            //如果begin已经使用过,则重新寻找begin
            if (this.used[begin]) {
                continue;
            }
            for (let i = 1; i < siblings.size(); i++) {
                //如果check数组[begin+code]不为空,则重新寻找为空的check
                if (this.check[begin + siblings.get(i).code] != undefined) {
                    continue outer;
                }
            }
            break;
        }
        this.used[begin] = true; //把begin标志成已经使用过
        //让check[begin+code]=begin,计算所有子节点的check值
        for (let i = 0; i < siblings.size(); i++) {
            this.check[begin + siblings.get(i).code] = begin;
        }
        //计算所有子节点的base值
        for (let i = 0; i < siblings.size(); i++) {
            let newSiblings = this.toTree(siblings.get(i), words, map);
            //判断成词,即父亲有个孩子为空,从root到该父亲为一个词
            if (newSiblings.size() == 0) {
                this.base[begin + siblings.get(i).code] = -1;
                this.check[begin + siblings.get(i).code] = siblings.get(
                    i
                ).value; //null的节点的check存放从root到词尾在整个字典中的词频
            } else {
                let h = this.toDoubleArray(newSiblings, words, map);
                this.base[begin + siblings.get(i).code] = h;
            }
        }
        return begin;
    }
    /*
     * 分配
     */
    allocate() {
        this.check = null;
        this.base = null;
        this.used = null;
        this.nextCheckPos = 0;

        this.base = [];
        this.check = [];
        this.used = [];
        this.base[0] = 1;
        this.check[0] = 0;
    }
    /**
     * 返回的是词语的在词典中的频率
     * @param {查找的词语} item
     */
    search(item) {
        return this.get(item, 0, item.length);
    }
    Get(key) {
        let index = this.exactMatchSearch(key);
        if (index >= 0) {
            return this.getValueAt(index);
        }
    }
    getValueAt(index) {
        return this.v[index];
    }
    exactMatchSearch(key) {
        return this.exactMatchSearchs(key, 0, 0, 0);
    }
    exactMatchSearchs(key, pos, len, nodePos) {
        if (len <= 0) {
            len = key.length;
        }
        if (nodePos <= 0) {
            nodePos = 0;
        }
        let result = -1;
        let keyChar = key.split("");
        let b = this.base[nodePos];
        let p;
        for (let i = pos; i < len; i++) {
            p = b + keyChar[i].charCodeAt(0) + 1;
            if (b == this.check[p]) {
                b = this.base[p];
            } else {
                return result;
            }
        }
        p = b;
        let n = this.base[p];
        if (b == this.check[p] && n < 0) {
            result = -n - 1;
        }
        return result;
    }
    get(item, start, length) {
        if (this.base == null) {
            return;
        }
        //this.base[0]=1;
        let begin = this.base[0]; //是root节点孩子的begin=1
        let index;
        for (let i = start; i < start + length; i++) {
            index = begin + item.charCodeAt(i);
            //如果index索引大于check的数组长度,退出
            //check[begin + code]=begin,base[begin + code]=child_begin
            if (index > this.check.length || index < 0) {
                return;
            }
            //判断begin是否等于check[begin+unicode],是让begin=base[begin+unicode],等于孩子的begin
            //如果在check中相等,让begin等于该节点孩子的begin,base中记录的是节点孩子的begin
            if (begin == this.check[index]) {
                begin = this.base[index];
            } else {
                return 0;
            }
        }
        index = begin;
        //如果index大于check的数组长度,退出
        if (index > this.check.length || index < 0) {
            return;
        }
        //如果在base中为负数,说明到达词尾
        if (this.base[index] < 0) {
            // console.log("在词典中查到词:",item.substring(start, start + length));
            return this.check[begin];
        }
        return;
    }

    /**
     * 添加全部项
     */
    putAll(map) {
        // let maps = this.sort(map);
        // let items = new Set();
        let items = new Arraylist();
        for (let key of map.keys()) {
            items.add(key);
        }
        this.init(items, map);
        // console.log(this.check.length);
        // console.log(this.base.length);
    }

    /**
     * 清除
     */
    clear() {
        this.check = null;
        this.base = null;
        this.used = null;
        this.nextCheckPos = 0;
    }

    /**
     * 初始化双数组前缀树
     */
    init(items, map) {
        if (items == null) {
            return;
        }
        //前缀树的虚拟根节点root
        let rootNode = new Node();
        rootNode.left = 0;
        rootNode.right = items.size();
        rootNode.depth = 0;
        while (true) {
            try {
                this.allocate();
                let siblings = this.toTree(rootNode, items, map);
                this.toDoubleArray(siblings, items, map);
                break;
            } catch (e) {
                this.size += this.size / 10;
                console.log("分配空间不够，增加至:" + this.size);
            }
        }
        items.clear();
        items = null;
        map.clear();
        map = null;
        this.used = null;
    }
    /**
     * 对map结构进行排序
     */
    sort(maps) {
        let map = maps;
        let array = [...map];
        return new Map(
            array.sort((a, b) => {
                return a[0] - b[0];
            })
        );
    }
    load(byteArray, value) {
        if (byteArray == null) {
            return false;
        }
        this.size = byteArray.nextInt();
        this.base = [this.size + 65535];
        this.check = [this.size + 65535];
        for (let i = 0; i < this.size; i++) {
            this.base[i] = byteArray.nextInt();
            this.check[i] = byteArray.nextInt();
        }
        this.v = value;
        return true;
    }
}
module.exports = DoubleArrayGenericTrie;
// let map = new Map();
// let doubleArrayGenericTrie = new DoubleArrayGenericTrie();
// // map.set("国家:主席", 1);
// // map.set("国家:和", 3);
// // map.set("主席:江泽民", 2);
// map.set("一举", 2);
// map.set("一举一动");
// map.set("一举成名");
// map.set("万能");
// map.set("万能胶");
// doubleArrayGenericTrie.putAll(map);
// let a = doubleArrayGenericTrie.search("一举");
// console.log(a);
