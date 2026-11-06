// Verificação do patch: node vendor/deepmerge/test-poisoning.js
const assert = require('assert');
const merge = require('./index.js');

const target = JSON.parse('{"__proto__": {"isAdmin": true}, "a": 1}');
const result = merge(target, { b: 2 });
assert.strictEqual(Object.getPrototypeOf(result), Object.prototype, 'protótipo do resultado foi alterado');
assert.strictEqual(result.isAdmin, undefined, 'propriedade herdada injetada');
assert.deepStrictEqual({ a: result.a, b: result.b }, { a: 1, b: 2 });

const nested = merge({ x: { y: 1 } }, { x: { z: 2 } });
assert.deepStrictEqual(nested, { x: { y: 1, z: 2 } });
assert.deepStrictEqual(merge([1], [2]), [1, 2]);
assert.deepStrictEqual(merge.all([{ a: 1 }, { b: 2 }, { a: 3 }]), { a: 3, b: 2 });
console.log('deepmerge corrigido: ok');
