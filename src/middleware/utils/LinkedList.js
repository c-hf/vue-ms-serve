/**
 * js实现的单向链表
 */
class Node {
    constructor(element) {
        this.element = element;
        this.next = null; //指向链表中下一个节点项的指针
    }
}
class LinkedList {
    constructor() {
        this.head = null;
        this.length = 0; //链表的长度
    }
    /**
     * 向链表尾部添加一个新的项
     */
    append(element) {
        let node = new Node(element);
        let current;
        if (this.head === null) {
            //如果链表为空，添加到首部
            this.head = node;
        } else {
            //循环链表，直到找到最后一项
            current = this.head;
            while (current.next !== null) {
                current = current.next;
            }
            //找到最后一项，将其next赋为node，建立连接
            current.next = node;
        }
        this.length++;
    }
    /**
     * 向链表尾部添加链表，相当于合并两个链表
     */
    appendAll(LindedList) {
        let current = LindedList.head;
        while (current) {
            this.append(current.element);
            current = current.next;
        }
    }

    /**
     * 向链表特定位置插入一个新的项
     */
    insert(position, element) {
        //检查是否越界
        if (position > -1 && position < this.length) {
            let node = new Node(element);
            let current = this.head;
            let previous;
            let index = 0;
            if (position === 0) {
                //在第一个位置添加
                node.next = current;
                this.head = node;
            } else {
                while (index++ < position) {
                    previous = current;
                    current = current.next;
                }
                //通过改变指针，将node链接在previous和current之间
                node.next = current;
                previous.next = node;
            }
            this.length++;
            return true;
        } else {
            return false;
        }
    }

    /**
     * 从链表特定位置移除一项
     */
    removeAt(position) {
        //检查是否越界
        if (position > -1 && position < this.length) {
            let current = this.head;
            let previous;
            let index = 0;
            if (position === 0) {
                this.head = current.next;
            } else {
                while (index++ < position) {
                    previous = current;
                    current = current.next;
                }
                //将previous与current的下一项链接起来，跳过current，从而移除它
                previous.next = current.next;
            }
            this.length--;
            return current.element;
        } else {
            return null;
        }
    }

    /**
     *  从链表中移除一项
     */
    remove(element) {
        let index = this.indexOf(element);
        return this.removeAt(index);
    }

    /**
     * 返回元素在链表中的索引，如果没有则返回-1
     */
    indexOf(element) {
        let current = this.head;
        let index = 0;
        while (current) {
            if (current.element === element) {
                return index;
            }
            index++;
            current = current.next;
        }
        return -1;
    }

    /**
     * //判断链表是否为空
     */
    isEmpty() {
        return this.length === 0;
    }

    /**
     * 返回链表包含元素个数
     */
    size() {
        return this.length;
    }

    /**
     * 返回链表第一个元素
     */
    getHead() {
        return this.head;
    }

    /**
     * 只输出元素的值
     */
    toString() {
        let current = this.head;
        let str = "";
        while (current) {
            str += `,${current.element}`;
            current = current.next;
        }
        return str.slice(1);
    }
    toArray() {
        let current = this.head;
        let array = [];
        while (current) {
            array.push(current.element);
            current = current.next;
        }
        return array;
    }
    /**
     * 打印元素的值
     */
    print() {
        console.log(this.toString());
    }
}
module.exports = LinkedList;
// let a = new LinkedList();
// a.append("a");
// a.append("b");
// a.append("c");

// a.insert(1, "d");
// a.removeAt(1);

// console.log(a);
