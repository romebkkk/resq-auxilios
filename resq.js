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

  var VERSION = '2.0.0';

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
   * Feedback en tiempo real del ritmo de compresiones (ERC 2021/2025)
   * Evalúa la cadencia de pulsaciones del reanimador
   */
  function evaluarCalidadCompresion(intervalosMsArray) {
    if (!intervalosMsArray || intervalosMsArray.length < 2) {
      return { estado: 'insuficiente', mensaje: 'Sigue comprimiendo para calibrar el ritmo', bpmMedio: 0 };
    }
    // Promedio de los últimos intervalos
    var ultimos = intervalosMsArray.slice(-5);
    var suma = 0;
    for (var i = 0; i < ultimos.length; i++) {
      suma += ultimos[i];
    }
    var mediaMs = suma / ultimos.length;
    var bpm = Math.round(60000 / mediaMs);

    var estado = 'optimo';
    var mensaje = '✅ Ritmo óptimo (100-120 cpm). Mantén la profundidad y permite la descompresión total del pecho.';

    if (bpm < 100) {
      estado = 'lento';
      mensaje = '⚠️ Demasiado lento (' + bpm + ' cpm). Acelera al ritmo de Stayin\' Alive (100-120 cpm).';
    } else if (bpm > 120) {
      estado = 'rapido';
      mensaje = '⚠️ Demasiado rápido (' + bpm + ' cpm). Ralentiza un poco; si vas muy rápido el corazón no se llena de sangre entre compresiones.';
    }

    return {
      bpmMedio: bpm,
      estado: estado,
      mensaje: mensaje,
      recordatorioExpansion: 'Recuerda: permite que el esternón retroceda completamente sin separar las manos.'
    };
  }

  /**
   * Protocolo diferencial de Soporte Vital Básico: Adulto vs Pediátrico (Lactante / Niño)
   * Basado en Guías ERC 2021 / 2025 y AHA PALS
   */
  function obtenerProtocoloRCP(tipoPaciente) {
    tipoPaciente = tipoPaciente || 'adulto'; // 'adulto', 'nino', 'lactante'

    if (tipoPaciente === 'lactante') {
      return {
        tipo: 'Lactante (<1 año)',
        relacionCompresionesVentilaciones: '15:2 (reanimador sanitario/entrenado) o 30:2 (lego)',
        ventilacionesIniciales: 5,
        ventilacionInicialExplicacion: 'En parada pediátrica la causa suele ser hipóxica/asfíctica: 5 insuflaciones de rescate ANTES de las compresiones torácicas.',
        profundidad: 'Aproximadamente 4 cm (1/3 del diámetro anteroposterior del tórax)',
        tecnicaCompresion: '2 dedos en el centro del pecho (esternón inferior) o técnica de 2 pulgares abrazando el tórax',
        frecuencia: '100 - 120 compresiones/minuto',
        dea: 'Usar DEA con atenuador de dosis pediátrica si está disponible.'
      };
    }

    if (tipoPaciente === 'nino') {
      return {
        tipo: 'Niño (1 año a pubertad)',
        relacionCompresionesVentilaciones: '15:2 o 30:2',
        ventilacionesIniciales: 5,
        ventilacionInicialExplicacion: '5 insuflaciones de rescate iniciales (boca a boca sellando nariz).',
        profundidad: 'Aproximadamente 5 cm (1/3 del diámetro del tórax)',
        tecnicaCompresion: 'Con el talón de 1 mano (o 2 manos en niños grandes) sobre la mitad inferior del esternón',
        frecuencia: '100 - 120 compresiones/minuto',
        dea: 'Usar parches pediátricos (<8 años o <25 kg). Si no hay, usar parches de adulto asegurando que no se toquen entre sí.'
      };
    }

    return {
      tipo: 'Adulto',
      relacionCompresionesVentilaciones: '30:2 (o RCP solo con las manos continua a 100-120 cpm si no entrenado)',
      ventilacionesIniciales: 0,
      ventilacionInicialExplicacion: 'En adultos la parada suele ser cardíaca súbita (FV/TV): empezar inmediatamente con compresiones torácicas.',
      profundidad: '5 a 6 cm',
      tecnicaCompresion: '2 manos entrelazadas en el centro del tórax con brazos rectos perpendiculares',
      frecuencia: '100 - 120 compresiones/minuto',
      dea: 'Colocar parches del DEA inmediatamente tan pronto como llegue y seguir instrucciones de voz.'
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
    evaluarCalidadCompresion: evaluarCalidadCompresion,
    obtenerProtocoloRCP: obtenerProtocoloRCP,
    evaluarAtragantamiento: evaluarAtragantamiento,
    pautasQuemadura: pautasQuemadura
  };
});
