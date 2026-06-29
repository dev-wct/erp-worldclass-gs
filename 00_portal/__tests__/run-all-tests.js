/**
 * Test Runner: Todos los tests del portal
 * ─────────────────────────────────────────────────────────────────────────
 * INSTRUCCIONES:
 *
 * 1. Copiar este archivo y los archivos de test a GAS Apps Script
 * 2. Ejecutar: runAllTests()
 * 3. Ver resultados en la consola (View > Logs)
 *
 * Archivos de test:
 *   - security.test.js  → testSecurityModule()
 *   - routes.test.js    → testRoutesConfig()
 *   - gateway.test.js   → testGatewayAdapter()
 *
 * ─────────────────────────────────────────────────────────────────────────
 */

const runAllTests = () => {
  console.log('🚀 Iniciando suite de tests del portal ERP...\n');
  console.log('═'.repeat(60));

  const startTime = new Date();
  const allResults = { passed: 0, failed: 0, errors: [] };

  // ══════════════════════════════════════════════════════════════════════
  // 1. Tests de Seguridad
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n\n🔐 MÓDULO DE SEGURIDAD');
  console.log('─'.repeat(60));
  try {
    const securityResults = testSecurityModule();
    allResults.passed += securityResults.passed;
    allResults.failed += securityResults.failed;
    allResults.errors.push(...securityResults.errors);
  } catch (e) {
    console.error('❌ Error ejecutando tests de seguridad:', e.message);
    allResults.failed++;
  }

  // ══════════════════════════════════════════════════════════════════════
  // 2. Tests de Rutas
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n\n📋 CONFIGURACIÓN DE RUTAS');
  console.log('─'.repeat(60));
  try {
    const routesResults = testRoutesConfig();
    allResults.passed += routesResults.passed;
    allResults.failed += routesResults.failed;
    allResults.errors.push(...routesResults.errors);
  } catch (e) {
    console.error('❌ Error ejecutando tests de rutas:', e.message);
    allResults.failed++;
  }

  // ══════════════════════════════════════════════════════════════════════
  // 3. Tests de Gateway
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n\n🔌 GATEWAY ADAPTER');
  console.log('─'.repeat(60));
  try {
    const gatewayResults = testGatewayAdapter();
    allResults.passed += gatewayResults.passed;
    allResults.failed += gatewayResults.failed;
    allResults.errors.push(...gatewayResults.errors);
  } catch (e) {
    console.error('❌ Error ejecutando tests de gateway:', e.message);
    allResults.failed++;
  }

  // ══════════════════════════════════════════════════════════════════════
  // RESUMEN FINAL
  // ══════════════════════════════════════════════════════════════════════
  const endTime = new Date();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n\n' + '═'.repeat(60));
  console.log('📊 RESUMEN FINAL');
  console.log('═'.repeat(60));
  console.log(`⏱️  Duración: ${duration}s`);
  console.log(`✅ Pasaron: ${allResults.passed}`);
  console.log(`❌ Fallaron: ${allResults.failed}`);
  console.log(`📈 Tasa de éxito: ${((allResults.passed / (allResults.passed + allResults.failed)) * 100).toFixed(1)}%`);

  if (allResults.failed > 0) {
    console.log('\n❌ TESTS FALLIDOS:');
    allResults.errors.forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.testName}`);
      if (e.detail) console.log(`     → ${e.detail}`);
    });
  } else {
    console.log('\n🎉 ¡TODOS LOS TESTS PASARON!');
  }

  console.log('\n' + '═'.repeat(60));

  return allResults;
};

/**
 * Ejecutar tests individuales
 */
const runSecurityTests = () => testSecurityModule();
const runRoutesTests = () => testRoutesConfig();
const runGatewayTests = () => testGatewayAdapter();
