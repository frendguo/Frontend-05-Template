const EOF = Symbol('EOF')
const css = require('css')

let currentToken = null
let currentAttribute = null
let currentTextNode = null
let stack = [{type: 'document', children: []}]
let rules = []

function addRules(text) {
  let ast = css.parse(text)  
  rules.push(...ast.stylesheet.rules)
}

/**
 * 生成specificity四元组
 * @param {选择器} selector 
 */
function specificity(selector) {
  let p = [0,0,0,0]
  let selectorParts = selector.split(' ')
  for (let part of selectorParts) {
    if (part.charAt(0) === '#') {
      p[1] +=1
    } else if (part.charAt(0) === '.') {
      p[2] +=1
    } else {
      p[3] +=1
    }
  }
  return p
}

function compareSpecificity(sp1, sp2) {
  if (sp1[0] - sp2[0]) {
    return sp1[0] - sp2[0]
  } else if (sp1[1] - sp2[1]) {
    return sp1[1] - sp2[1]
  } else if (sp1[2] - sp2[2]) {
    return sp1[2] - sp2[2]
  } 
  return sp1[3] - sp2[3]
}


/**
 * 目前只支持tag\id\class
 * @param {*} element 
 * @param {*} selector 
 */
function match(element, selector) {
  if (!element.attributes || !selector) { 
    return false
  }

  // id选择器
  if (selector.charAt(0) === '#') {
    let attr = element.attributes.filter(attr => attr.name === 'id')[0]
    if (attr && attr.value === selector.replace('#', '')) {
      return true
    }
  } else if (selector.charAt(0) === '.') {  
    let attr = element.attributes.filter(attr => attr.name === 'class')[0]
    if (attr && attr.value === selector.replace('.', '')) {
      return true
    }
  } else {  
    if (element.tagName === selector) {
      return true
    }
  } 
  return false
}

function computeCSS(element) {
  /**
   * 获取当前元素的所有父元素 
   * 使用slice是为了防止后边stack操作对当前stack影响
   * 使用reverse反转是因为我们要从当前元素到上方查找。
   */
  let elements = stack.slice().reverse()

  if (!element.computedStyle) {
    element.computedStyle = {}
  }

  for (let rule of rules) {
    let selectorParts = rule.selectors[0].split(' ').reverse()
    if (!match(element, selectorParts[0])) {
      continue
    }

    let matched = false
    let j = 1
    for (let i=0; i<elements.length; i++) {
      if (match(elements[i], selectorParts[j])) {
        j++
      }
    }

    if (j >= selectorParts.length) {
      matched = true
    }
    
    if (matched) {
      sp = specificity(rule.selectors[0])
      let computedStyle = element.computedStyle
      for (let declaration of rule.declarations) {
        if (!computedStyle[declaration.property]) {
          computedStyle[declaration.property] = {}
        }
        if (!computedStyle[declaration.property].specificity) {
          computedStyle[declaration.property].value = declaration.value
          computedStyle[declaration.property].specificity = sp
        } else if(compareSpecificity(computedStyle[declaration.property].specificity, sp) < 0) {
          computedStyle[declaration.property].value = declaration.value
          computedStyle[declaration.property].specificity = sp
        }
      }
      console.log('Element', element, 'matched rule', rule)
    }
  }
}

function emit(token) {
  let top = stack[stack.length-1]
  if (token.tokenType === 'startTag') {
    let element = {
      type: 'element',
      tagName: token.tagName,
      children: [],
      attributes: []
    }

    for (let p in token) {
      if (p !== 'tokenType' && p !== 'tagName' && p !== 'isSelfClosing') {
        element.attributes.push({
          name: p,
          value: token[p]
        })
      }
    }

    computeCSS(element)

    if (!token.isSelfClosing) {
      stack.push(element)
    } else {
      element.isSelfClosing = true
    }

    top.children.push(element)
    element.parent = top
    currentTextNode = null
  } else if (token.tokenType === 'endTag') {
    currentTextNode = null
    if (token.tagName === top.tagName) { 
      if (top.tagName === 'style') {
        addRules(top.children[0].content)
      }
      stack.pop()
    } else {
      throw Error('缺少标签')
    }
  } else if (token.tokenType === 'text') {
    if (currentTextNode === null) {
      currentTextNode = {
        type: 'text',
        content: ''
      }
      top.children.push(currentTextNode)
    }
    currentTextNode.content += token.content
  }
}

function data(c) {
  if (c === '<') {
    return tagOpen
  } else if (c === EOF) {
    emit({
      tokenType: 'EOF'
    })
    return
  } else {

    emit({
      tokenType: 'text',
      content: c
    })
    return data
  }
}

function tagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      tokenType: 'startTag',
      tagName: ''
    }
    return tagName(c)
  } else if (c === '/') {
    return endTagOpen
  } else if (c === EOF) {
    console.log('EOF-before-tag-name parse error')
    return
  } else {
    console.log('invalid-first-character-of-tag-name parse error')
    return
  }
}

function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      tokenType: 'endTag',
      tagName: ''
    }
    return tagName(c)
  } else if (c === '>') {
    console.log('missing-end-tag-name parse error')
  } else if (c === EOF) {
    console.log('EOF-before-tag-name parse error')
  } else {
    console.log('invalid-first-character-of-tag-name parse error')
  }
}

function tagName(c) {
  if (c.match(/^[A-Z]$/)) {
    currentToken.tagName += c.toLowerCase()
    return tagName
  }
  else if (c === '>') {
    emit(currentToken)
    return data
  } else if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c === '/') {
    return selfClosingStartTag
  } else if (c === EOF) {
    console.log('EOF-in-tag parse error')
  } else {
    currentToken.tagName += c
    return tagName
  }
}

function selfClosingStartTag(c) {
  if (c === '>') {
    currentToken.isSelfClosing = true
    emit(currentToken)
    return data
  } else if (c === EOF) {
    console.log('eof-in-tag error')
  } else {
    console.log('unspected-solidus-in-tag parse error')
  }
}

function beforeAttributeName(c) {
  if (c === '/' || c === '>' || c === EOF) {
    return afterAttributeName(c)
  } else if (c.match(/^[\n\f\t ]$/)) {
    return beforeAttributeName
  } else if (c === '=') {
    console.log('unexpected-equals-sign-before-attribute-name parse error')
  } else {
    // 字符
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}


/**
 * <div class="c"></div>
 * <input type="number" />
 * <input type='number" />
 * @param {*} c 
 */
function attributeName(c) {
  if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c ==='EOF') {
    return afterAttributeName(c)
  } else if (c === '=') {
    return beforeAttributeValue
  } else if (c === '\u0000') { // Null
    console.log('unexpected-null-character parse error')
  } else if (c.match(/^[A-Z]$/)) {
    currentAttribute.name +=c
    return attributeName
  } else {
    currentAttribute.name +=c
    return attributeName
  }
}

function afterAttributeName(c) {
  if (c.match(/^[\r\n\f ]$/)) {
    return afterAttributeName
  } else if (c === '/') {
    return selfClosingStartTag
  } else if (c === '=') {
    return beforeAttributeValue
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c === EOF) {
    console.log('eof-in-tag parse error')
    emit({
      tokenType: 'EOF'
    })
  } else {
    currentToken[currentAttribute.name] = currentAttribute.value
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}

function beforeAttributeValue(c) {
  if (c.match(/^[\r\n\f ]$/)) {
    return beforeAttributeValue
  } else if (c === '"') {
    return doubleQuoteAttributeValue
  } else if (c === '\'') {
    return singleQuoteAttributeValue
  } else if (c === '>') {
    console.log('missing-attribute-value parse error')
  } else {
    return unquoteAttributeValue(c)
  }
}

function doubleQuoteAttributeValue(c) {
  if (c === '"') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterAttributeValue
  } else if (c === '\u0000') {
    console.log('unexpected-null-character parse error')
  } else if (c === EOF) {  
    console.log('eof-in-tag parse error')
  } else {
    currentAttribute.value += c
    return doubleQuoteAttributeValue
  }
}

function singleQuoteAttributeValue(c) {
  if (c === '\'') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterAttributeValue
  } else if (c === '\u0000') {
    console.log('unexpected-null-character parse error')
  } else if (c === EOF) {  
    console.log('eof-in-tag parse error')
  } else {
    currentAttribute.value += c
    return singleQuoteAttributeValue
  }
}

function unquoteAttributeValue(c) {
  if (c.match(/^[\r\n\f ]$/)) { 
    currentToken[currentAttribute.name] = currentAttribute.value
    return beforeAttributeName
  } else if (c === '/') {  
    currentToken[currentAttribute.name] = currentAttribute.value 
    return selfClosingStartTag
  } else if (c === '>') {  
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c === '\u0000') { 
    console.log('unexpected-null-character parse error')
  } else if (c === '"' || c === '\'' || c === '<' || c === '=' || c === '`') {
    console.log('unexpected-character-in-unquoted-attribute-value parse error')
  } else if (c === EOF) { 
    console.log('eof-in-tag parse error')
  } else {
    currentAttribute.value += c
    return unquoteAttributeValue
  }
}

function afterAttributeValue(c) {
  if (c.match(/^[\r\n\f ]$/)) {
    return beforeAttributeName
  } else if (c === '/') {
    return selfClosingStartTag
  } else if (c === '>') {
    emit(currentToken)
    return data
  } else if (c === EOF) {
    console.log('EOF-in-tag parser error')
  } else {
    console.log('missing-whitespace-between-attibutes parser error')
    return beforeAttributeName
  }
}

module.exports.parseHTML = function parseHTML(html) {
  let state = data
  console.log('html', html)
  for (let c of html) {
    state = state(c)
  }
  console.log('stack', stack)
  state = state(EOF)
}