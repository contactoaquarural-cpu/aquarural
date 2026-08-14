const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Acueducto = require('../models/Acueducto');
const Suscriptor = require('../models/Suscriptor');
const Factura = require('../models/Factura');
const { encrypt } = require('../services/encryption.service');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aquarural-db';

const poblarBaseDeDatos = async () => {
  try {
    console.log('🔄 Conectando a la base de datos de AquaRural...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas.');

    // Limpiar colecciones anteriores para iniciar limpio en AquaRural
    console.log('🧹 Limpiando colecciones anteriores...');
    await Acueducto.deleteMany({});
    await Suscriptor.deleteMany({});
    await Factura.deleteMany({});

    console.log('🌱 Creando Acueducto Demo...');
    const acueductoDemo = await Acueducto.create({
      nombre: 'Acueducto Veredal La Argentina',
      nit: '891100234-5',
      departamento: 'Huila',
      municipio: 'Garzón',
      vereda: 'La Argentina',
      direccion: 'Vía Principal Sector El Carmen',
      telefono: '3166160377',
      email: 'contacto@laargentina.org.co',
      representanteLegal: 'Carlos Alberto Trujillo',
      colorPrimario: '#0EA5E9',
      colorSecundario: '#10B981',
      planSaaS: 'ESTANDAR',
      costoMensualSaaS: 80000,
      tarifaBaseMensual: 25000,
      wompiPublicKey: 'pub_test_Qn3n4m5p6q7r8s9t',
      wompiPrivateKeyEncrypted: encrypt('prv_test_X1y2z3a4b5c6d7e8'),
      wompiEventsSecretEncrypted: encrypt('test_events_SecretEvents2026'),
      wompiIntegritySecretEncrypted: encrypt('test_integrity_SecretIntegrity2026'),
      wompiSandbox: true,
    });

    console.log('🌱 Creando SuperAdmin y Admin de Acueducto...');
    const passwordHashAdmin = await bcrypt.hash('Admin2026*', 10);
    const passwordHashSuper = await bcrypt.hash('SuperAdmin2026*', 10);

    // SuperAdmin Global
    await Suscriptor.create({
      acueductoId: acueductoDemo._id,
      matricula: 'SUPER-001',
      cedula: '000000001',
      nombres: 'SuperAdmin',
      apellidos: 'AquaRural',
      correo: 'superadmin@aquarural.com',
      telefono: '3000000000',
      rol: 'SUPERADMIN',
      password: passwordHashSuper,
    });

    // Admin del Acueducto
    await Suscriptor.create({
      acueductoId: acueductoDemo._id,
      matricula: 'ADM-001',
      cedula: '12203639',
      nombres: 'Julián Andrés',
      apellidos: 'Trujillo Morales',
      correo: 'admin@laargentina.org.co',
      telefono: '3166160377',
      rol: 'ADMIN_ACUEDUCTO',
      password: passwordHashAdmin,
    });

    console.log('🌱 Creando Suscriptores Demo con Coordenadas GPS...');
    const suscriptoresData = [
      {
        acueductoId: acueductoDemo._id,
        matricula: 'ACU-0101',
        cedula: '1075234891',
        nombres: 'José Donaldo',
        apellidos: 'Gómez Murcia',
        telefono: '3124567890',
        correo: 'jose.gomez@gmail.com',
        vereda: 'La Argentina - Sector El Mirador',
        numeroMedidor: 'MED-90812',
        latitud: 2.198421,
        longitud: -75.623412,
        estadoMoratorio: 'AL_DIA',
      },
      {
        acueductoId: acueductoDemo._id,
        matricula: 'ACU-0102',
        cedula: '36304582',
        nombres: 'María Eudoxia',
        apellidos: 'Rojas de Trujillo',
        telefono: '3119876543',
        correo: 'maria.rojas@gmail.com',
        vereda: 'La Argentina - Sector Bajo',
        numeroMedidor: 'MED-90813',
        latitud: 2.199105,
        longitud: -75.624001,
        estadoMoratorio: 'EN_MORA',
      },
      {
        acueductoId: acueductoDemo._id,
        matricula: 'ACU-0103',
        cedula: '12245890',
        nombres: 'Hernando',
        apellidos: 'Parra Lasso',
        telefono: '3157891234',
        vereda: 'La Argentina - Alto del Tabaco',
        numeroMedidor: 'MED-90814',
        latitud: 2.197850,
        longitud: -75.621980,
        estadoMoratorio: 'AL_DIA',
      },
    ];

    const suscriptoresCreados = await Suscriptor.insertMany(suscriptoresData);

    console.log('🌱 Creando Facturas Demo...');
    const periodoActual = '2026-08';
    const fechaVencimiento = new Date('2026-08-30');

    await Factura.create({
      acueductoId: acueductoDemo._id,
      suscriptorId: suscriptoresCreados[0]._id,
      codigoFactura: `FAC-202608-ACU-0101`,
      periodo: periodoActual,
      montoCargoFijo: 25000,
      montoConsumo: 0,
      montoMora: 0,
      montoTotal: 25000,
      fechaVencimiento,
      estado: 'PAGADA',
      metodoPago: 'WOMPI_PSE',
      referenciaWompi: 'FAC-202608-ACU-0101-1723644000',
      wompiTransactionId: 'tr_test_wompi_998822',
      fechaPago: new Date(),
    });

    await Factura.create({
      acueductoId: acueductoDemo._id,
      suscriptorId: suscriptoresCreados[1]._id,
      codigoFactura: `FAC-202608-ACU-0102`,
      periodo: periodoActual,
      montoCargoFijo: 25000,
      montoConsumo: 0,
      montoMora: 5000,
      montoTotal: 30000,
      fechaVencimiento,
      estado: 'PENDIENTE',
    });

    console.log('✨ Base de Datos de AquaRural inicializada con éxito!');
    console.log('──────────────────────────────────────────────────────');
    console.log(`🏛️ Acueducto: ${acueductoDemo.nombre} (ID: ${acueductoDemo._id})`);
    console.log('👤 SuperAdmin: superadmin@aquarural.com / SuperAdmin2026*');
    console.log('👤 Admin Acueducto: admin@laargentina.org.co (Cédula: 12203639) / Admin2026*');
    console.log('💧 Suscriptores Creados: 3 suscriptores con coordenadas GPS');
    console.log('──────────────────────────────────────────────────────');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando el seed de AquaRural:', error);
    process.exit(1);
  }
};

poblarBaseDeDatos();
