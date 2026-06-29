/**
 * Tests: ERP.Gateway (Adapter Pattern)
 * ─────────────────────────────────────────────────────────────────────────
 * Ejecutar: Copiar en GAS Apps Script > Ejecutar testGatewayAdapter()
 *
 * NOTA: Estos tests verifican la estructura del adapter.
 * Para tests de integración reales, se necesita mock de google.script.run.
 * ─────────────────────────────────────────────────────────────────────────
 */

const testGatewayAdapter = () => {
  const results = { passed: 0, failed: 0, errors: [] };

  const assert = (testName, condition, detail) => {
    if (condition) {
      results.passed++;
      console.log(`✅ ${testName}`);
    } else {
      results.failed++;
      results.errors.push({ testName, detail });
      console.error(`❌ ${testName}: ${detail || 'falló'}`);
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // Tests de estructura
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📋 Tests de estructura ERP.Gateway');

  assert('ERP.Gateway existe',
    typeof ERP !== 'undefined' && ERP.Gateway !== undefined,
    'ERP.Gateway no está definido');

  assert('ERP.Gateway tiene init()',
    typeof ERP.Gateway.init === 'function',
    'init no es función');

  assert('ERP.Gateway tiene call()',
    typeof ERP.Gateway.call === 'function',
    'call no es función');

  assert('ERP.Gateway tiene callArgs()',
    typeof ERP.Gateway.callArgs === 'function',
    'callArgs no es función');

  assert('ERP.Gateway tiene submit()',
    typeof ERP.Gateway.submit === 'function',
    'submit no es función');

  assert('ERP.Gateway tiene adapters',
    typeof ERP.Gateway.adapters === 'object',
    'adapters no es objeto');

  // ══════════════════════════════════════════════════════════════════════
  // Tests de adapters
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📋 Tests de adapters');

  assert('Adapter GAS existe',
    typeof ERP.Gateway.adapters.gas === 'object',
    'Adapter GAS no existe');

  assert('Adapter fetch existe',
    typeof ERP.Gateway.adapters.fetch === 'object',
    'Adapter fetch no existe');

  // ══════════════════════════════════════════════════════════════════════
  // Tests de Adapter GAS
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📋 Tests de Adapter GAS');

  assert('GAS adapter tiene call()',
    typeof ERP.Gateway.adapters.gas.call === 'function',
    'GAS.call no es función');

  assert('GAS adapter tiene callArgs()',
    typeof ERP.Gateway.adapters.gas.callArgs === 'function',
    'GAS.callArgs no es función');

  // ══════════════════════════════════════════════════════════════════════
  // Tests de Adapter fetch
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📋 Tests de Adapter fetch');

  assert('fetch adapter tiene call()',
    typeof ERP.Gateway.adapters.fetch.call === 'function',
    'fetch.call no es función');

  assert('fetch adapter tiene callArgs()',
    typeof ERP.Gateway.adapters.fetch.callArgs === 'function',
    'fetch.callArgs no es función');

  // ══════════════════════════════════════════════════════════════════════
  // Tests de init()
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📋 Tests de init()');

  // Test init con adapter válido
  try {
    ERP.Gateway.init('gas');
    assert('init("gas") ejecuta sin error', true);
  } catch (e) {
    assert('init("gas") ejecuta sin error', false, e.message);
  }

  // Test init con adapter inválido
  try {
    ERP.Gateway.init('invalid_adapter');
    assert('init("invalid_adapter") maneja error gracefully', true);
  } catch (e) {
    assert('init("invalid_adapter") maneja error gracefully', false, e.message);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Tests de SecurityServer
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📋 Tests de SecurityServer');

  assert('SecurityServer existe',
    typeof SecurityServer !== 'undefined',
    'SecurityServer no está definido');

  if (typeof SecurityServer !== 'undefined') {
    assert('SecurityServer tiene escapeHtml()',
      typeof SecurityServer.escapeHtml === 'function',
      'escapeHtml no es función');

    assert('SecurityServer tiene sanitizeUrl()',
      typeof SecurityServer.sanitizeUrl === 'function',
      'sanitizeUrl no es función');

    assert('SecurityServer tiene isValidEmail()',
      typeof SecurityServer.isValidEmail === 'function',
      'isValidEmail no es función');

    assert('SecurityServer escapeHtml funciona',
      SecurityServer.escapeHtml('<test>') === '&lt;test&gt;',
      'escapeHtml no escapa correctamente');

    assert('SecurityServer isValidEmail válido',
      SecurityServer.isValidEmail('test@example.com') === true,
      'isValidEmail falla con email válido');

    assert('SecurityServer isValidEmail inválido',
      SecurityServer.isValidEmail('invalid-email') === false,
      'isValidEmail acepta email inválido');
  }

  // ══════════════════════════════════════════════════════════════════════
  // Resumen
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(50));
  console.log(`📊 Resultados: ${results.passed} pasaron, ${results.failed} fallaron`);

  if (results.failed > 0) {
    console.log('\n❌ Tests fallidos:');
    results.errors.forEach(e => {
      console.log(`  - ${e.testName}: ${e.detail}`);
    });
  }

  return results;
};
