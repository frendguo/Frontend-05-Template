学习笔记

1. line-height 与 元素高度 大小一致时，可实现内部元素居中对齐
2. 深拷贝：
  - 为避免修改原对象的内容，通常采用从原对象拷贝一份内容出来进行操作。JS中自带的 `Object.assign` 和 `{...obj}` 都属于浅拷贝，即只拷贝其引用，而不拷贝其内容。
  - 简单粗暴的方式：序列化与反序列化：`JSON.sringify` && `JSON.parse`
    - 使用简单，对于一些简单的对象，可以使用。
    - 不能复制复杂对象。比如 `function`, `Symbol` 等
    - 存在循环引用时，会失败。

  - 通过递归实现：
    ```JavaScript
    function deepCopy(target){ 
      let copyed_objs = [];
      function _deepCopy(target){ 
          if((typeof target !== 'object')||!target){return target;}
          for(let i= 0 ;i<copyed_objs.length;i++){
              if(copyed_objs[i].target === target){
                  return copyed_objs[i].copyTarget;
              }
          }
        let obj = {};
        if(Array.isArray(target)){
            obj = [];//处理target是数组的情况 
        }
        copyed_objs.push({target:target,copyTarget:obj}) 
        Object.keys(target).forEach(key=>{ 
            if(obj[key]){ return;} 
            obj[key] = _deepCopy(target[key]);
        }); 
        return obj;
      } 
      return _deepCopy(target);
    }
    ```