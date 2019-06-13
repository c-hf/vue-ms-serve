//自己实现ArrayList
class ArrayList {
    constructor() {
        this.arr = [];
    }
    size() {
        return this.arr.length;
    }
    add() {
        if (arguments.length == 1) {
            this.arr.push(arguments[0]);
        } else if (arguments.length >= 2) {
            let deleteItem = this.arr[arguments[0]];
            this.arr.splice(arguments[0], 1, arguments[1], deleteItem);
        }
        return this;
    }
    get(index) {
        return this.arr[index];
    }
    removeIndex(index) {
        this.arr.splice(index);
    }
    removeObj() {
        this.removeIndex(this.indexOf(obj));
    }
    /**
     *
     * 判断基本类型
     */
    indexOf(obj) {
        for (let i = 0; i < this.arr.length; i++) {
            if (this.arr[i] == obj) {
                return i;
            }
        }
        return -1;
    }
    /**
     * 判断对象数组是否相等
     */
    IndexOf(obj) {
        for (let i = 0; i < this.arr.length; i++) {
            if (isObjectValueEqual(this.arr[i], obj)) {
                return i;
            }
        }
        return -1;
    }
    isEmpty() {
        return this.arr.length == 0;
    }
    clear() {
        this.arr = [];
    }
    contains(obj) {
        return this.indexOf(obj) != -1;
    }
}
module.exports = ArrayList;

const isObjectValueEqual = (a, b) => {
    let aProps = Object.getOwnPropertyNames(a);
    let bProps = Object.getOwnPropertyNames(b);

    if (aProps.length != bProps.length) {
        return false;
    }

    for (let i = 0; i < aProps.length; i++) {
        let propName = aProps[i];

        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    return true;
};
