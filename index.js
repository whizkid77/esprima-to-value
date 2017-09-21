
'use strict';

const getObject = require('esprima-get-object');

function toValue (tree) {
  if (Array.isArray(tree)) {
    return tree.map(toValue);
  } else {
    let ret = undefined;
    switch (tree.type) {
      case 'Literal': 
        ret = tree.value; 
        break;
      case 'ArrayExpression': 
        ret = tree.elements.map(toValue); 
        break;
      case 'FunctionExpression':
        ret = getReturn(tree.body.body);
        break;
      case 'ObjectExpression':
        ret = {};
        for (let prop of tree.properties) {
          ret[prop.key.name || prop.key.value] = toValue(prop.value);
        }
        break;
      case 'UnaryExpression':
        if (tree.operator == '-') {
          ret = -1 * toValue(tree.argument);
        } else {
          throw new Error('Unknown unary operator')
        }
        break;
      case 'Program':
        ret = toValue(tree.body);
        break;
      case 'ExpressionStatement':
        ret = toValue(tree.expression);
        break;
      default:
        throw new Error('Unsupported type: ' + tree.type);
        break;
    }
    return ret;
  }
}

function getReturn (body) {
  const tree = body.shift();
  if (tree.type === 'ReturnStatement') {
    if (tree.argument && tree.argument.property) {
      return getObject(tree.argument);
    } else {
      return null;
    }
  } else if (tree.type === 'TryStatement') {
    return getReturn(tree.block.body);
  } else {
    return getReturn(body);
  }
}

module.exports = toValue;
