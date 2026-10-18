import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGreeting } from '../../src/greeting.js';

test('sem nome devolve saudação padrão', () => {
  assert.equal(buildGreeting(), 'Olá, mundo!');
  assert.equal(buildGreeting(null), 'Olá, mundo!');
  assert.equal(buildGreeting(''), 'Olá, mundo!');
});

test('com nome devolve saudação personalizada', () => {
  assert.equal(buildGreeting('Ana'), 'Olá, Ana!');
});

test('remove espaços nas pontas', () => {
  assert.equal(buildGreeting('  Ana  '), 'Olá, Ana!');
});

test('remove caracteres perigosos (anti-XSS)', () => {
  assert.equal(buildGreeting('<script>x</script>'), 'Olá, scriptx/script!');
});

test('nome só de espaços vira saudação padrão', () => {
  assert.equal(buildGreeting('   '), 'Olá, mundo!');
});

test('rejeita tipo inválido', () => {
  assert.throws(() => buildGreeting(42), TypeError);
});

test('rejeita nome muito grande', () => {
  assert.throws(() => buildGreeting('a'.repeat(51)), RangeError);
  assert.equal(buildGreeting('a'.repeat(50)), `Olá, ${'a'.repeat(50)}!`);
});
