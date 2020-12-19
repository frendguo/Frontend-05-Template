学习笔记

为什么 first-letter 可以设置 float 之类的，而 first-line 不行呢？

- 反证法： 由于 first-line 是布局完成后才能被选中，如果 first-line 可以设置 float 这些属性的话，在布局完成后修改了影响布局的属性，可能会导致 first-line 的变化，导致循环的布局。影响性能。