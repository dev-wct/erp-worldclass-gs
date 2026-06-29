/**
 * Tests: PORTAL_Routes.json (Single Source of Truth)
 * ─────────────────────────────────────────────────────────────────────────
 * Ejecutar: Copiar en GAS Apps Script > Ejecutar testRoutesConfig()
 * ─────────────────────────────────────────────────────────────────────────
 */

const testRoutesConfig = () => {
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

  // Cargar configuración
  let config;
  try {
    const json = HtmlService.createHtmlOutputFromFile('00_portal/config/PORTAL_Routes.json').getContent();
    config = JSON.parse(json);
    console.log('✅ Configuración cargada correctamente');
  } catch (e) {
    console.error(`❌ Error cargando configuración: ${e.message}`);
    return { passed: 0, failed: 1, errors: [{ testName: 'Carga de configuración', detail: e.message }] };
  }

  // ══════════════════════════════════════════════════════════════════════
  // Tests de estructura
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📋 Tests de estructura');

  assert('Config tiene propiedad routes',
    config.routes && typeof config.routes === 'object',
    'routes no es un objeto');

  assert('Config tiene propiedad menu',
    config.menu && Array.isArray(config.menu),
    'menu no es un array');

  // ══════════════════════════════════════════════════════════════════════
  // Tests de rutas
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📋 Tests de rutas');

  const requiredRoutes = [
    'launchpad', 'inbox', 'vacante', 'empleado', 'lead',
    'equipo', 'chip', 'asignacion', 'nomina', 'analytics'
  ];

  requiredRoutes.forEach(page => {
    assert(`Ruta "${page}" existe`,
      config.routes[page] !== undefined,
      `Falta ruta: ${page}`);

    if (config.routes[page]) {
      assert(`Ruta "${page}" tiene title`,
        config.routes[page].title && config.routes[page].title.length > 0,
        `title vacío en: ${page}`);

      assert(`Ruta "${page}" tiene file`,
        config.routes[page].file && config.routes[page].file.length > 0,
        `file vacío en: ${page}`);

      assert(`Ruta "${page}" tiene icon`,
        config.routes[page].icon && config.routes[page].icon.length > 0,
        `icon vacío en: ${page}`);
    }
  });

  // ══════════════════════════════════════════════════════════════════════
  // Tests de consistencia rutas ↔ menu
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📋 Tests de consistencia rutas ↔ menu');

  const menuPages = new Set();
  config.menu.forEach(section => {
    section.items.forEach(page => menuPages.add(page));
  });

  const routePages = new Set(Object.keys(config.routes));

  // Todas las páginas del menú deben existir en rutas
  menuPages.forEach(page => {
    assert(`Página del menú "${page}" existe en rutas`,
      routePages.has(page),
      `Menú referencia ruta inexistente: ${page}`);
  });

  // Todas las rutas (excepto launchpad) deben estar en el menú
  routePages.forEach(page => {
    if (page !== 'launchpad') {
      assert(`Ruta "${page}" está en el menú`,
        menuPages.has(page),
        `Ruta no referenciada en menú: ${page}`);
    }
  });

  // ══════════════════════════════════════════════════════════════════════
  // Tests de menú
  // ══════════════════════════════════════════════════════════════════════
  console.log('\n📋 Tests de menú');

  config.menu.forEach(section => {
    assert(`Sección "${section.id}" tiene label`,
      section.label && section.label.length > 0,
      `label vacío en: ${section.id}`);

    assert(`Sección "${section.id}" tiene items`,
      section.items && section.items.length > 0,
      `items vacío en: ${section.id}`);

    assert(`Sección "${section.id}" tiene icon`,
      section.icon && section.icon.length > 0,
      `icon vacío en: ${section.id}`);
  });

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
