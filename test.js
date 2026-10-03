/**
 * Resq-Auxilios - Suite de tests unitarios
 * Comando: node test.js
 */
'use strict';
var assert = require('assert');
var Resq = require('./resq.js');

var passed = 0;
function test(nombre, fn) {
  try {
    fn();
    passed++;
    console.log('  [OK] ' + nombre);
  } catch (e) {
    console.error('  [FAIL] ' + nombre + '\n         ' + e.message);
    process.exitCode = 1;
  }
}

console.log('=== 1. Metrónomo y Ritmo de RCP (ERC / AHA) ===');

test('Ritmo de 110 bpm está en el rango recomendado de 100-120 bpm', function () {
  var r = Resq.calcularIntervaloRCP(110);
  assert.strictEqual(r.bpm, 110);
  assert.strictEqual(r.esRitmoRecomendado, true);
  assert.strictEqual(r.intervaloMs, 545);
});

console.log('\n=== 2. Protocolo de Atragantamiento y Asfixia ===');

test('Persona tosiendo con fuerza debe animarse a toser sin golpes', function () {
  var r = Resq.evaluarAtragantamiento({ tosiendoEficaz: true, consciente: true });
  assert.ok(/ANIMAR A SEGUIR TOSIENDO/i.test(r.accionPrincipal));
});

test('Bebé < 1 año prohíbe explícitamente Heimlich abdominal y prescribe golpes + compresiones torácicas', function () {
  var r = Resq.evaluarAtragantamiento({ esLactanteMenor1Anio: true, tosiendoEficaz: false, consciente: true });
  assert.ok(/GOLPES EN LA ESPALDA \+ 5 COMPRESIONES TORÁCICAS/i.test(r.accionPrincipal));
  assert.ok(/NUNCA hagas compresiones abdominales/i.test(r.advertenciaVital));
});

test('Adulto que no puede toser ni hablar activa Heimlich + golpes', function () {
  var r = Resq.evaluarAtragantamiento({ esLactanteMenor1Anio: false, tosiendoEficaz: false, consciente: true });
  assert.ok(/HEIMLICH/i.test(r.accionPrincipal));
});

test('Víctima inconsciente por atragantamiento activa RCP inmediata', function () {
  var r = Resq.evaluarAtragantamiento({ consciente: false });
  assert.ok(/INICIAR RCP/i.test(r.accionPrincipal));
});

console.log('\n=== 3. Primeros Auxilios en Quemaduras ===');

test('Quemaduras prescriben 20 minutos de agua fresca y prohíben hielo directo', function () {
  var r = Resq.pautasQuemadura('mano');
  assert.ok(/20 MINUTOS/i.test(r.reglaOro));
  assert.ok(/hielo directo/i.test(r.prohibiciones[0]));
});

console.log('\n' + passed + ' tests de soporte vital superados con éxito.');
