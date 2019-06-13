/**
 * js中自己封装的创建二维数组,创建一个i行,j列的二维数组
 */

const DyadicArray = (i, j) => {
    let DArray = new Array();
    for (let m = 0; m < i; m++) {
        DArray[m] = new Array();
        for (let n = 0; n < j; n++) {
            DArray[m][n] = new Array();
        }
    }
    return DArray;
};
module.exports = { DyadicArray: DyadicArray };
