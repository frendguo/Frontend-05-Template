学习笔记

# HTML标签分类

开始标签、结束标签、自封闭标签

# JavaScript中的空白符

## CRLF

#### 参考

[CRLF](https://developer.mozilla.org/zh-CN/docs/Glossary/CRLF)

[HTML Entities](https://www.compart.com/en/unicode/html)

```javascript
\t \n \f 空格
```

# HTML语法分析的中的状态

按照[HTML标准文档](https://whatwg-cn.github.io/html/#tokenization)书写。

# tag & element

tag分为 startTag 和 endTag ，一对 startTag和endTag构成一个element。

# input的type属性与token的type属性相同

# 引用类型

```javascript
let obj = {}
let arr = []
arr.push(obj)
console.log(arr) // [{}]
obj.a = 1
console.log(arr) // [{ a: 1 }]
obj = null
console.log(arr) // [{ a: 1 }]
```

# 复杂选择器 & 复合选择器

## 复合选择器

```css
body div .a {}
```

# 复杂选择器

```css
body div .a, body div p {}
```

## 简单选择器

```css
body {}
```

# TODO:

## 1. 目前HTML模版里存在中文会出现未报错但是程序未执行结束的错误。

```html
<P>我是玩具浏览器</p>
```

## 2. 给DOM添加复合选择器样式