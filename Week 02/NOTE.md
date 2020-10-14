学习笔记

1. line-height:
  - css 中用来控制行与行之间的垂直距离
  - 对其内容生效
  - 默认为 `normal`。约为 `1.2`
  - 一般与 `font-size` 综合作用， 于是便有 `font` 属性中的缩写。如：`<font-size>/<line-height>`
  - 最好使用纯数字，因为其会随着 `font-size` 的改变而改变
  - 参考：[深入理解css的行高Line Height属性](https://www.cnblogs.com/fengzheng126/archive/2012/05/18/2507632.html)

2. localStorage:
  - 参考：[Window.localStorage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage)
  - 特定于某页面的数据。与 `sessionStorage` 不同的是，当前页面关闭时，`localStorage` 中的数据不会丢失，而 `sessionStorage` 的数据会丢失。
  - 总是以字符串的形式存储