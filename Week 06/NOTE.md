# JavaScript（二）

## 运算符和表达式

### 表达式

- Member

	- a.b
	- a[b]
	- foo`string`
	- super.b
	- super['b']
	- new.target
	- new Foo()
	- new Foo

		- 优先级相对带括号的（new Foo()）较低

- Reference

	- Object
	- key
	- 使用

		- delete
		- assign

- Call

	- foo()
	- super()
	- foo()['b']
	- foo().b
	- foo()`abc`

- 左手运算和右手运算

	- Left HandSide：能放到等号左边
	- Right HandSide

		- Update

- 单目运算符

	- delete a.b
	- void foo()
	- typeof a
	- + a
	- - a
	- ~ a
	- ! a
	- await a

- 右结合运算符

	- **

		- 3 ** 2 ** 3 == 3 ** （2 ** 3）

- 双目运算符

	- 乘除
	- 加减

		- 连接两个字符串
		- 两个数字相加

	- 位移运算
	- 关系运算符

		- instanceof

- 相等

	- ==
	- !=
	- ===
	- !==

- 逻辑运算符

	- 短路原则
	- 三目运算符

### 类型转换

- 常规转换
- 拆箱（unboxing）

	- object -> 基本类型
	- ToPremitive
	- toString
	- valueOf
	- Symbol.toPrimitive

- 装箱（boxing）

	- 包装类

## 语句

### 语法

- 简单语句

	- 表达式语句（ExpressionStatement）
	- 空语句（EmptyStatement）
	- Debugger 语句（DebuggerStatement）

		- 触发一个断点，用来调试用（debugger;）

	- ThrowStatement
	- ContinueStatement
	- BreakStatement
	- ReturnStatement

- 复合语句

	- BlockStatement

		- 使用花括号包起来，可以形成一个作用域

	- IfStatement
	- SwitchStatement

		- 建议使用 if 来代替 Switch

	- IterationStatement

		- 包括一大堆循环语句（for...in, for...of， while）

	- WithStatement

		- 不建议使用

	- LabelledStatement
	- TryStatement

		- 不能省略花括号

- 声明

	- 类型

		- 函数声明

	- 预处理

		- 所有的声明都具有预处理机制

	- 作用域

### 运行时

- Completion Record（语句完成的记录）

	- [[type]]

		- normal，break，continue，return，throw

	- [[value]]

		- 基本类型

	- [[target]]

		- lable

## 结构化

### JS 执行粒度

- 宏任务

	- 传给 JavaScript 引擎的任务

- 微任务

	- 在 JavaScript 中执行的任务
	- Promise

- 函数调用

	- 函数调用
	- 执行上下文（Execution Context）
	- 闭包

		- 每个函数都会生成一个闭包
		- 包含

			- 环境部分：Environment Record
			- 代码部分：Code

		- 

	- Realm

		- 在 JS 中，函数表达式和对象直接量会创建对象
		- 使用 .  做隐式转换也会创建对象
		- 这些对象是具有原型的，如果我们没有 Realm，就不知道它们的原型是什么。

- 语句/声明
- 表达式
- 直接量/变量/this

