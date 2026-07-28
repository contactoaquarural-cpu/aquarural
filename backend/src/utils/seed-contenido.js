/**
 * Seed de convenios y noticias demo
 * Uso: node src/utils/seed-contenido.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const Convenio = require('../models/Convenio');
const Noticia  = require('../models/Noticia');
const logger   = require('./logger');

const CONVENIOS = [
  {
    nombre:              'Agropecuaria El Potrero',
    tipo:                'AGROPECUARIO',
    descripcion:         'Venta de concentrados, sal mineralizada y suplementos para ganado bovino. Descuento especial para asociados.',
    telefono:            '318 456 7890',
    descuentoPorcentaje: 10,
    direccion:           'Cra. 5 #8-32, Garzón, Huila',
    activo:              true,
  },
  {
    nombre:              'Clínica Veterinaria Los Andes',
    tipo:                'VETERINARIA',
    descripcion:         'Servicios de medicina veterinaria, vacunación, inseminación artificial y cirugías. Atención 24 horas para emergencias ganaderas.',
    telefono:            '312 789 0123',
    descuentoPorcentaje: 15,
    direccion:           'Cl. 12 #6-45, Garzón, Huila',
    activo:              true,
  },
  {
    nombre:              'Distribuidora AgroHuila',
    tipo:                'INSUMOS',
    descripcion:         'Herbicidas, fertilizantes, pesticidas y equipos agrícolas. Asesoría técnica gratuita para asociados con compras mayores a $200.000.',
    telefono:            '310 234 5678',
    descuentoPorcentaje: 8,
    direccion:           'Av. Circunvalar #15-10, Garzón, Huila',
    activo:              true,
  },
  {
    nombre:              'Almacén Ganadero del Sur',
    tipo:                'AGROPECUARIO',
    descripcion:         'Equipos de ordeño, herramientas para finca, cercas eléctricas y ropa de trabajo. El almacén más completo del sur del Huila.',
    telefono:            '315 678 9012',
    descuentoPorcentaje: 12,
    direccion:           'Cra. 9 #10-67, Garzón, Huila',
    activo:              true,
  },
  {
    nombre:              'Banco Agrario de Colombia',
    tipo:                'OTRO',
    descripcion:         'Créditos agropecuarios con tasas preferenciales para ganaderos asociados. Líneas especiales para compra de ganado, mejoramiento de praderas e infraestructura.',
    telefono:            '018000 912227',
    descuentoPorcentaje: 0,
    direccion:           'Cl. 7 #5-12, Garzón, Huila',
    activo:              true,
  },
  {
    nombre:              'Laboratorio Biovet Diagnóstico',
    tipo:                'VETERINARIA',
    descripcion:         'Análisis de brucelosis, tuberculosis, mastitis y perfiles sanitarios completos. Resultados en 48 horas con entrega a domicilio en la finca.',
    telefono:            '321 345 6789',
    descuentoPorcentaje: 20,
    direccion:           'Cl. 4 #3-89, Garzón, Huila',
    activo:              true,
  },
];

const NOTICIAS = [
  {
    titulo:           'Son días difíciles para el agro colombiano',
    contenido:        'El sector agropecuario colombiano enfrenta múltiples desafíos simultáneos: la posible prohibición de exportaciones de carne y ganado generaría pérdidas cercanas a 320 millones de dólares. Ajustes automáticos en los avalúos catastrales han provocado protestas de productores al aumentar significativamente el impuesto predial. El gremio ganadero pide al gobierno medidas urgentes de alivio económico.',
    categoria:        'GOBIERNO',
    publicado:        true,
    fechaPublicacion: new Date('2026-04-15'),
  },
  {
    titulo:           'Burger Master 2026: la parrilla que dinamiza la producción de carne en Colombia',
    contenido:        'El Burger Master 2026 regresa del 20 al 26 de abril como un evento gastronómico que impulsa el consumo de carne en Colombia. En su edición anterior alcanzó cifras históricas con 3.349.210 hamburguesas vendidas, generando más de 80.000 millones de pesos en siete días. El festival abre oportunidades para que ganaderos y emprendedores se integren verticalmente en la cadena productiva.',
    categoria:        'EVENTO',
    publicado:        true,
    fechaPublicacion: new Date('2026-04-10'),
  },
  {
    titulo:           'Golpe al bolsillo del ganadero: precio de la leche solo sube 1,3% en 2026',
    contenido:        'El precio base de la leche cruda en Colombia experimentará un incremento de apenas 1,3% a partir del 1 de marzo de 2026, según el ajuste anual del Ministerio de Agricultura. Este aumento, uno de los más bajos en años recientes, no refleja la realidad económica que enfrentan los productores. El sector enfrenta importaciones sin arancel, problemas climáticos y costos de producción en aumento.',
    categoria:        'PRECIOS',
    publicado:        true,
    fechaPublicacion: new Date('2026-03-14'),
  },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Conectado a MongoDB');

    // Convenios — solo inserta los que no existen por nombre
    let conveniosCreados = 0;
    for (const c of CONVENIOS) {
      const existe = await Convenio.findOne({ nombre: c.nombre });
      if (!existe) {
        await Convenio.create(c);
        conveniosCreados++;
        logger.info(`Convenio creado: ${c.nombre}`);
      } else {
        logger.info(`Convenio ya existe, omitido: ${c.nombre}`);
      }
    }

    // Noticias — solo inserta las que no existen por título
    let noticiasCreadas = 0;
    for (const n of NOTICIAS) {
      const existe = await Noticia.findOne({ titulo: n.titulo });
      if (!existe) {
        await Noticia.create(n);
        noticiasCreadas++;
        logger.info(`Noticia creada: ${n.titulo}`);
      } else {
        logger.info(`Noticia ya existe, omitida: ${n.titulo}`);
      }
    }

    logger.info(`\n✅ Seed completado — ${conveniosCreados} convenios, ${noticiasCreadas} noticias creados`);
    process.exit(0);
  } catch (err) {
    logger.error('Error en seed', { error: err.message });
    process.exit(1);
  }
};

run();
