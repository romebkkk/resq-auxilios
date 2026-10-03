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

console.log('\n=== 2. Feedback de Calidad de Compresiones Torácicas ===');

test('Cadencia de 545 ms (~110 bpm) detecta ritmo óptimo', function () {
  var intervalos = [545, 540, 550, 542, 545];
  var r = Resq.evaluarCalidadCompresion(intervalos);
  assert.strictEqual(r.estado, 'optimo');
  assert.strictEqual(r.bpmMedio, 110);
  assert.ok(/Ritmo óptimo/i.test(r.mensaje));
});

test('Cadencia lenta de 750 ms (80 bpm) alerta para acelerar', function () {
  var intervalos = [750, 740, 760, 755, 750];
  var r = Resq.evaluarCalidadCompresion(intervalos);
  assert.strictEqual(r.estado, 'lento');
  assert.strictEqual(r.bpmMedio, 80);
  assert.ok(/Demasiado lento/i.test(r.mensaje));
});

test('Cadencia acelerada de 400 ms (150 bpm) alerta para frenar y permitir retorno venoso', function () {
  var intervalos = [400, 395, 405, 400, 400];
  var r = Resq.evaluarCalidadCompresion(intervalos);
  assert.strictEqual(r.estado, 'rapido');
  assert.strictEqual(r.bpmMedio, 150);
  assert.ok(/Demasiado rápido/i.test(r.mensaje));
});

console.log('\n=== 3. Protocolos Diferenciales: Lactante vs Niño vs Adulto ===');

test('Lactante (<1 año) exige 5 insuflaciones de rescate antes de comprimir y técnica de 2 dedos a 4 cm', function () {
  var r = Resq.obtenerProtocoloRCP('lactante');
  assert.strictEqual(r.ventilacionesIniciales, 5);
  assert.ok(/4 cm/i.test(r.profundidad));
  assert.ok(/2 dedos|2 pulgares/i.test(r.tecnicaCompresion));
  assert.ok(/hipóxica/i.test(r.ventilacionInicialExplicacion));
});

test('Niño exige 5 insuflaciones iniciales y compresión con 1 talón de mano a 5 cm', function () {
  var r = Resq.obtenerProtocoloRCP('nino');
  assert.strictEqual(r.ventilacionesIniciales, 5);
  assert.ok(/5 cm/i.test(r.profundidad));
  assert.ok(/1 mano/i.test(r.tecnicaCompresion));
});

test('Adulto comienza directamente con 30 compresiones a 5-6 cm de profundidad', function () {
  var r = Resq.obtenerProtocoloRCP('adulto');
  assert.strictEqual(r.ventilacionesIniciales, 0);
  assert.ok(/5 a 6 cm/i.test(r.profundidad));
  assert.ok(/2 manos entrelazadas/i.test(r.tecnicaCompresion));
  assert.ok(/30:2/i.test(r.relacionCompresionesVentilaciones));
});

console.log('\n=== 4. Protocolo de Atragantamiento y Asfixia ===');

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

console.log('\n=== 5. Primeros Auxilios en Quemaduras ===');

test('Quemaduras prescriben 20 minutos de agua fresca y prohíben hielo directo', function () {
  var r = Resq.pautasQuemadura('mano');
  assert.ok(/20 MINUTOS/i.test(r.reglaOro));
  assert.ok(/hielo directo/i.test(r.prohibiciones[0]));
});

console.log('\n' + passed + ' tests de soporte vital superados con éxito.');
