// Calcule l'empreinte à coller dans src/lib/formationCodes.ts.
// Usage : node scripts/code-empreinte.mjs <formationId> <code>
const [, , formationId, ...rest] = process.argv;
const code = rest.join(' ');
if (!formationId || !code) {
  console.error('Usage : node scripts/code-empreinte.mjs <formationId> <code>');
  process.exit(1);
}
const fingerprint = (value) => {
  let h = 5381;
  for (let i = 0; i < value.length; i++) h = ((h * 33) ^ value.charCodeAt(i)) >>> 0;
  return h.toString(36);
};
const normalized = code.trim().toUpperCase().replace(/\s+/g, '');
console.log(`${formationId}: '${fingerprint('revision-tp:formation:' + formationId + ':' + normalized)}',`);
