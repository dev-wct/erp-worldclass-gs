/**
 * Tests: ERP.Security (Client-side)
 * ─────────────────────────────────────────────────────────────────────────
 * Ejecutar: Copiar en GAS Apps Script > Ejecutar testSecurityModule()
 * ─────────────────────────────────────────────────────────────────────────
 */

const testSecurityModule = () => {
  const results = { passed: 0, failed: 0, errors: [] };

  const assert = (testName, actual, expected) => {
    if (actual === expected) {
      results.passed++;
      console.log(`✅ ${testName}`);
    } else {
      results.failed++;
      results.errors.push({ testName, actual, expected });
      console.error(`❌ ${testName}: esperado "${expected}", obtuvo "${actual}"`);
    }
  };

  const assertContains = (testName, actual, substring) => {
    if (String(actual).includes(substring)) {
      results.passed++;
      console.log(`✅ ${testName}`);
    } else {
      results.failed++;
      results.errors.push({ testName, actual, expected: `contiene "${substring}"` });
      console.error(`❌ ${testName}: "${actual}" no contiene "${substring}"`);
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // Tests de escapeHtml
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📋 Tests de escapeHtml');

  assert('escapeHtml: texto normal sin cambios',
    ERP.Security.escapeHtml('Hola Mundo'),
    'Hola Mundo');

  assert('escapeHtml: escape < >',
    ERP.Security.escapeHtml('<script>'),
    '&lt;script&gt;');

  assert('escapeHtml: escape quotes',
    ERP.Security.escapeHtml('"test"'),
    '&quot;test&quot;');

  assert('escapeHtml: escape &',
    ERP.Security.escapeHtml('a & b'),
    'a &amp; b');

  assert('escapeHtml: escape apostrofe',
    ERP.Security.escapeHtml("it's"),
    'it&#39;s');

  assert('escapeHtml: string vacío',
    ERP.Security.escapeHtml(''),
    '');

  assert('escapeHtml: null/undefined',
    ERP.Security.escapeHtml(null),
    '');

  // ══════════════════════════════════════════════════════════════════════
  // Tests de sanitizeUrl
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📋 Tests de sanitizeUrl');

  assert('sanitizeUrl: page param seguro',
    ERP.Security.sanitizeUrl('?page=launchpad'),
    '?page=launchpad');

  assert('sanitizeUrl: hash seguro',
    ERP.Security.sanitizeUrl('#section'),
    '#section');

  assert('sanitizeUrl: javascript: bloqueado',
    ERP.Security.sanitizeUrl('javascript:alert(1)'),
    '#');

  assert('sanitizeUrl: data: bloqueado',
    ERP.Security.sanitizeUrl('data:text/html,<script>alert(1)</script>'),
    '#');

  assert('sanitizeUrl: onerror= bloqueado',
    ERP.Security.sanitizeUrl('onerror=alert(1)'),
    '#');

  assert('sanitizeUrl: URL vacía',
    ERP.Security.sanitizeUrl(''),
    '#');

  assert('sanitizeUrl: null',
    ERP.Security.sanitizeUrl(null),
    '#');

  // ══════════════════════════════════════════════════════════════════════
  // Tests de validateInput
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📋 Tests de validateInput');

  assert('validateInput: texto normal válido',
    ERP.Security.validateInput('Juan Pérez').valid,
    true);

  assert('validateInput: detecta <script>',
    ERP.Security.validateInput('<script>alert(1)</script>').valid,
    false);

  assert('validateInput: detecta javascript:',
    ERP.Security.validateInput('javascript:alert(1)').valid,
    false);

  assert('validateInput: detecta onerror=',
    ERP.Security.validateInput('<img onerror=alert(1)>').valid,
    false);

  assert('validateInput: detecta iframe',
    ERP.Security.validateInput('<iframe src="evil.com">').valid,
    false);

  // ══════════════════════════════════════════════════════════════════════
  // Tests de stripHtml
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📋 Tests de stripHtml');

  assert('stripHtml: remove tags',
    ERP.Security.stripHtml('<p>Hola</p>'),
    'Hola');

  assert('stripHtml: texto sin tags',
    ERP.Security.stripHtml('Texto plano'),
    'Texto plano');

  assert('stripHtml: tags anidados',
    ERP.Security.stripHtml('<div><span>Test</span></div>'),
    'Test');

  // ══════════════════════════════════════════════════════════════════════
  // Tests de generateNonce
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📋 Tests de generateNonce');

  const nonce1 = ERP.Security.generateNonce();
  const nonce2 = ERP.Security.generateNonce();

  assert('generateNonce: retorna string',
    typeof nonce1 === 'string',
    true);

  assert('generateNonce: no vacío',
    nonce1.length > 0,
    true);

  assert('generateNonce: únicos',
    nonce1 !== nonce2,
    true);

  // ══════════════════════════════════════════════════════════════════════
  // Resumen
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(50));
  console.log(`📊 Resultados: ${results.passed} pasaron, ${results.failed} fallaron`);

  if (results.failed > 0) {
    console.log('\n❌ Tests fallidos:');
    results.errors.forEach(e => {
      console.log(`  - ${e.testName}`);
    });
  }

  return results;
};
