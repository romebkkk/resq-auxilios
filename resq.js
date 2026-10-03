/*!
 * Resq-Auxilios v1.0.0 — Guía interactiva de Soporte Vital Inmediato y Primeros Auxilios
 * Open-source emergency life support, CPR metronome (ERC guidelines) & choking rescue guide.
 *
 * Copyright (c) 2026 DataFlow Elegance - Ismael Ben Kazem
 * Licencia MIT · 100% en el navegador · Basado en las Guías ERC 2021/2025 y AHA
 */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ResqAuxilios = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = '1.0.0';

  /**
   * Cálculo del ritmo óptimo de RCP (100 - 120 compresiones/minuto)
   * Valor de referencia estándar: 110 bpm
   */
  function calcularIntervaloRCP(bpm) {
    var ritmo = Math.max(90, Math.min(140, parseInt(bpm, 10) || 110));
    var intervaloMs = Math.round(60000 / ritmo);
    var esRitmoRecomendado = ritmo >= 100 && ritmo <= 120;

    return {
      bpm: ritmo,
      intervaloMs: intervaloMs,
      esRitmoRecomendado: esRitmoRecomendado,
      profundidadRecomendada: '5 a 6 cm en adultos',
      cancionReferencia: 'Stayin\' Alive (Bee Gees) o La Macarena'
    };
  }

  /**
   * Árbol de decisión ante atragantamiento / asfixia aguda
   */
  function evaluarAtragantamiento(params) {
    params = params || {};
    var esLactante = !!params.esLactanteMenor1Anio;
    var tosiendoEficaz = !!params.tosiendoEficaz;
    var consciente = params.consciente !== false;

    // 1. Tose con fuerza y puede hablar
    if (tosiendoEficaz && consciente) {
      return {
        accionPrincipal: 'ANIMAR A SEGUIR TOSIENDO',
        urgencia: 'observacion',
        pasos: [
          'La tos es el mecanismo más eficaz para expulsar el cuerpo extraño.',
          'NUNCA des golpes en la espalda mientras la persona tosa con fuerza (podrías encajar más el objeto).',
          'Permanece a su lado vigilando que no empeore.'
        ]
      };
    }

    // 2. Pérdida de conocimiento
    if (!consciente) {
      return {
        accionPrincipal: 'INICIAR RCP INMEDIATA Y LLAMAR AL 112',
        urgencia: 'critica',
        pasos: [
          'Llama al 112 y pon el altavoz.',
          'Coloca a la persona boca arriba en el suelo firme e inicia 30 compresiones torácicas.',
          'Cada vez que abras la vía aérea para ventilar, mira dentro de la boca: extrae el objeto SOLO si está claramente visible. NUNCA hagas un barrido a ciegas con el dedo.'
        ]
      };
    }

    // 3. Obstrucción grave en Bebé Lactante (< 1 año)
    if (esLactante) {
      return {
        accionPrincipal: '5 GOLPES EN LA ESPALDA + 5 COMPRESIONES TORÁCICAS',
        urgencia: 'grave',
        advertenciaVital: 'NUNCA hagas compresiones abdominales (Heimlich) en menores de 1 año (alto riesgo de rotura de hígado/bazo).',
        pasos: [
          'Coloca al bebé boca abajo apoyado en tu antebrazo, sujetando su mandíbula con la cabeza más baja que el cuerpo.',
          'Aplica hasta 5 golpes secos con el talón de tu mano entre los omóplatos.',
          'Gira al bebé boca arriba sobre tu otro antebrazo.',
          'Aplica hasta 5 compresiones torácicas con dos dedos en el centro del pecho (como en RCP de bebé).',
          'Repite el ciclo alternando 5 y 5 hasta que expulse el objeto o pierda el conocimiento.'
        ]
      };
    }

    // 4. Obstrucción grave en Adulto o Niño mayor de 1 año
    return {
      accionPrincipal: '5 GOLPES EN LA ESPALDA + 5 COMPRESIONES ABDOMINALES (HEIMLICH)',
      urgencia: 'grave',
      advertenciaVital: 'Si la persona no puede hablar ni toser y se lleva las manos al cuello, actúa de inmediato.',
      pasos: [
        'Inclina a la persona hacia adelante y da 5 golpes firmes con el talón de la mano entre las paletillas.',
        'Si no sale, colócate detrás de ella y rodea su cintura con tus brazos.',
        'Coloca tu puño con el pulgar hacia dentro entre el ombligo y el esternón.',
        'Agarra el puño con la otra mano y presiona con fuerza hacia adentro y hacia arriba (maniobra de Heimlich) hasta 5 veces.',
        'Alterna 5 golpes y 5 compresiones de Heimlich.'
      ]
    };
  }

  /**
   * Pautas críticas para Quemaduras
   */
  function pautasQuemadura(zona) {
    return {
      reglaOro: 'Enfriar con agua corriente templada o fresca (15-20ºC) durante 20 MINUTOS CONTINUOS.',
      prohibiciones: [
        'NUNCA pongas hielo directo (causa congelación sobre el tejido quemado).',
        'NUNCA apliques pasta de dientes, mantequilla, aceites ni remedios caseros (multiplican la infección).',
        'NUNCA revientes las ampollas (su piel intacta es la mejor barrera estéril contra bacterias).'
      ],
      proteccion: 'Cubre la zona con film transparente limpio de cocina (sin apretar) o gasas estériles empapadas en suero, y acude a valoración médica.'
    };
  }

  return {
    VERSION: VERSION,
    calcularIntervaloRCP: calcularIntervaloRCP,
    evaluarAtragantamiento: evaluarAtragantamiento,
    pautasQuemadura: pautasQuemadura
  };
});
