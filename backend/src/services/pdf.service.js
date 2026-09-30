const PDFDocument = require('pdfkit');

// Mismo contenido/orden que el ticket POS de web-admin (FacturacionPage.jsx,
// modal "Imprimir Ticket POS") — encabezado del acueducto, datos de la
// factura, desglose del mes, total y sello de pagado/pendiente — pero en
// formato carta para descarga en PDF en vez de impresión térmica 80mm.
const generarPdfFactura = (factura, asociado, acueducto) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  const formatMonto = (valor) => `$${Math.round(valor || 0).toLocaleString('es-CO')} COP`;
  const pagada = factura.estado === 'PAGADA';

  doc.fontSize(16).font('Helvetica-Bold').text(acueducto.nombre || 'AquaRural Pro', { align: 'center' });
  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#475569')
    .text(`NIT: ${acueducto.nit || 'S/D'} · ${acueducto.municipio || ''}, ${acueducto.departamento || ''}`, {
      align: 'center',
    });
  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .fillColor(pagada ? '#047857' : '#0e7490')
    .text(pagada ? 'COMPROBANTE OFICIAL DE PAGO' : 'CUENTA DE COBRO / FACTURA DEL MES', { align: 'center' });

  doc.moveDown(1.2);
  doc.strokeColor('#e2e8f0').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.8);

  doc.fontSize(10).fillColor('#0f172a');
  const filaDato = (label, valor) => {
    doc.font('Helvetica').fillColor('#64748b').text(label, 50, doc.y, { continued: true, width: 200 });
    doc.font('Helvetica-Bold').fillColor('#0f172a').text(valor || 'S/D', { align: 'right' });
  };
  filaDato('N° Factura:', factura.codigoFactura);
  filaDato('Periodo:', factura.periodo);
  filaDato('Suscriptor:', `${asociado.nombres} ${asociado.apellidos || ''}`.trim());
  filaDato('Cédula:', asociado.cedula);

  doc.moveDown(0.8);
  doc.strokeColor('#e2e8f0').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.8);

  doc.font('Helvetica-Bold').fillColor('#0f172a').fontSize(10).text('DETALLE DEL MES');
  doc.moveDown(0.4);
  if (factura.consumoM3 > 0) filaDato('Consumo del Mes:', `${factura.consumoM3} m³`);
  filaDato('Cargo Fijo:', formatMonto(factura.montoCargoFijo));
  if (factura.montoConsumo > 0) filaDato('Valor Consumo:', formatMonto(factura.montoConsumo));
  if (factura.montoRecargoLicencia > 0) filaDato('Aporte Plataforma AquaRural:', formatMonto(factura.montoRecargoLicencia));
  if (factura.montoMora > 0) {
    doc.font('Helvetica').fillColor('#b91c1c').text('Recargo por Mora:', 50, doc.y, { continued: true, width: 200 });
    doc.font('Helvetica-Bold').text(formatMonto(factura.montoMora), { align: 'right' });
  }
  // Solo aparece si el pago fue por Wompi con el traslado de comisión
  // activo — nunca en pagos en efectivo en oficina, que no pasan por la
  // pasarela y por tanto no generan esta comisión.
  if (factura.montoComisionWompi > 0) {
    filaDato('Comisión pasarela de pago:', formatMonto(factura.montoComisionWompi));
  }

  const montoFinal = factura.montoTotal + (factura.montoComisionWompi || 0);
  doc.moveDown(0.8);
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#0f172a');
  doc.text(pagada ? 'TOTAL CANCELADO:' : 'TOTAL A PAGAR:', 50, doc.y, { continued: true, width: 300 });
  doc.fillColor(pagada ? '#047857' : '#0e7490').text(formatMonto(montoFinal), { align: 'right' });

  doc.moveDown(1);
  const cajaY = doc.y;
  doc
    .rect(50, cajaY, 495, 40)
    .fillAndStroke(pagada ? '#ecfdf5' : '#fffbeb', pagada ? '#a7f3d0' : '#fde68a');
  doc
    .fillColor(pagada ? '#065f46' : '#92400e')
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(
      pagada ? 'PAGO CONFIRMADO — EN REGLA' : 'FACTURA PENDIENTE DE PAGO',
      50,
      cajaY + 8,
      { width: 495, align: 'center' }
    );
  doc
    .font('Helvetica')
    .fontSize(9)
    .text(
      pagada
        ? `Método: ${factura.metodoPago === 'EFECTIVO_OFICINA' ? 'Efectivo en Oficina' : 'Digital Wompi'}`
        : `Fecha Límite: ${new Date(factura.fechaVencimiento).toISOString().split('T')[0]}`,
      50,
      cajaY + 24,
      { width: 495, align: 'center' }
    );

  doc.moveDown(3);
  doc
    .fontSize(8)
    .fillColor('#64748b')
    .font('Helvetica-Bold')
    .text('¡Gracias por apoyar a tu Acueducto Veredal!', { align: 'center' });
  doc.font('Helvetica').text('Agua potable y salud para nuestra tierra.', { align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

module.exports = { generarPdfFactura };
