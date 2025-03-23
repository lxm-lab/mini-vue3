import { reactive } from "./reactive";
const obj = {
  name: "labmen",
  age: 18,
  grade: {
    math: 90,
    english: 15,
    get totalScore() {
      return this.math + this.english;
    },
  },
};

const proxyObj = reactive(obj);
// console.log(proxyObj.name);
// proxyObj.name = 'xiaoMing'
// const proxyObj1 = reactive(proxyObj);
// const proxyObj2 = reactive(obj);
// 读c 时因为用到了 this.a this.b 所以这两个属性也应该被读取  如果对象里用到了 get 里面用到了代理对象的其他属性也需要被监听
// console.log(proxyObj1);
// 代理同一个对象 返回值相同
// console.log(proxyObj === proxyObj2);
// 代理 代理过的对象 直接返回且返回值要相同
// console.log(proxyObj === proxyObj1);

// 循环代理
// console.log(proxyObj.grade.totalScore);
// 除get set外 proxy 其他行为的依赖收集
// console.log("age" in proxyObj);
// @ts-ignore
// delete proxyObj.age;

// for (const key in proxyObj) {
//   console.log(key);
// }
// @ts-ignore
// proxyObj.a = 1;
// proxyObj.name = "labmen";
// proxyObj.name = "labmen2";
const o = {
  a: 4,
};
const arr = [3, o, , 3];
const proxyArr = reactive(arr);
// console.log(proxyArr[0]);
// proxyArr[1] = 22;
// proxyArr[4] = 44;
// for (let i = 0; i < proxyArr.length; i++) {
//   proxyArr[i];
// }
// for (const key in proxyArr) {
//   key
// }
// console.log(proxyArr.indexOf(o));
// 超出数组长度的赋值 没有对length进行依赖收集
// proxyArr[10] = 9
// proxyArr.length = 1;
// push pop shift unshift splice
// length属性被收集 又被设置 会引起死循环 vue3 issue #2137 重写方法
proxyArr.push(1)
console.log(proxyArr);
