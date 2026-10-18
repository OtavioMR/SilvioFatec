const MAX_NAME_LENGTH = 50;

/**
 * Monta uma saudação. Valida e limpa o nome recebido.
 * @param {unknown} name
 * @returns {string}
 */
export function buildGreeting(name) {
  if (name === undefined || name === null || name === '') {
    return 'Olá, mundo!';
  }
  if (typeof name !== 'string') {
    throw new TypeError('name deve ser um texto');
  }
  const clean = name.trim().replace(/[<>&"']/g, '');
  if (clean.length === 0) {
    return 'Olá, mundo!';
  }
  if (clean.length > MAX_NAME_LENGTH) {
    throw new RangeError(`name deve ter no máximo ${MAX_NAME_LENGTH} caracteres`);
  }
  return `Olá, ${clean}!`;
}
