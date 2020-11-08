学习笔记

- proxy:
    - 一个包含另一个对象或函数并允许你对其进行拦截的对象
    - 可以理解为对象的 hook，通过 get、set 等方式。参考：[Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

- reactive
    - 理解为一个 Proxy 的封装，在 Vue 中使用较为广泛

- effect:
    - 与 hook 相似
    - 对应 react 中的 `componentDidMount`, `componentDidUpdate`, `componentWillUnmount` 类型

- CSSOM:
    - CSS Object Model 是一组允许用JavaScript操纵CSS的API。 它是继DOM和HTML API之后，又一个操纵CSS的接口，从而能够动态地读取和修改CSS样式
    - 参考：[CSS Object Model](https://developer.mozilla.org/zh-CN/docs/Web/API/CSS_Object_Model)
    - range: 表示一个包含节点与文本节点的一部分的文档片段