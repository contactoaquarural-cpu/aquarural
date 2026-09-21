# Mejoras futuras — AquaRural Pro

> Funcionalidades identificadas durante el desarrollo, conscientemente pospuestas por no ser
> necesarias en la escala actual (acueducto veredal pequeño/mediano, un fontanero). Construir
> cuando haya un caso de uso real presionando (crecimiento, segundo fontanero, incidente real),
> no antes.

---

## 1. Cierre formal del ciclo de facturación

**Problema actual**: el ciclo de facturación es un mes calendario (`YYYY-MM`) sin cierre real.
Se puede generar, corregir o volver a tocar un período en cualquier momento, sin bloqueo ni
trazabilidad de auditoría formal.

**Cómo se maneja en una empresa de servicios públicos real**:
- El **ciclo de lectura** (cuándo se toma el consumo) es una ventana de días fija, no el mes
  completo (ej. "del 20 al 25 de cada mes"), configurable por acueducto.
- Pasada la fecha de corte, las lecturas de ese ciclo quedan **congeladas** — nadie puede
  editarlas directamente.
- La facturación se genera sobre lecturas ya congeladas.
- Una vez facturado, el ciclo queda **bloqueado**: no se pueden generar más facturas de ese
  período, ni modificar las lecturas que lo originaron.
- Cualquier corrección posterior (reclamo, error de lectura) se maneja como una **nota de
  crédito/débito** sobre la factura ya emitida — nunca regenerando o editando la factura
  original. Esto es clave para trazabilidad contable y auditoría.

**Por qué se pospuso**: resuelve un problema de *coordinación entre múltiples fontaneros
cubriendo zonas grandes en varios días*. Con un acueducto pequeño y un solo fontanero, ese
problema casi no existe — el recorrido se completa en uno o dos días sin necesitar una ventana
formal.

**Qué construir cuando se necesite**:
- Campo `diaCorteConsumo` (o rango `diaInicioCorte`/`diaFinCorte`) en `Acueducto`.
- Bloqueo de `POST /asociados/lecturas-masivas` para lecturas fuera de la ventana vigente.
- Estado de ciclo en `Factura`/período (`ABIERTO` → `FACTURADO` → `CERRADO`).
- Modelo `NotaCredito`/`NotaDebito` para ajustes posteriores a un ciclo cerrado, en vez de
  editar la factura original.

---

## 2. Notificación de "lecturas listas para facturar"

**Problema actual**: cuando el fontanero termina de registrar las lecturas del mes, no hay
ninguna notificación ni indicador que le avise al Admin/Tesorero que ya puede generar la
facturación. Hoy tendría que enterarse por fuera del sistema (WhatsApp, de palabra) o revisar
manualmente el avance en `/lecturas`.

**Qué construir**:
- Indicador de avance de lecturas visible en `/facturacion` (no solo en `/lecturas`, a la que
  el fontanero tiene acceso pero el admin no siempre revisa antes de facturar).
- Notificación push/email al Admin cuando el fontanero marca el ciclo como completo, o cuando
  el avance llega al 100%.

---

## 3. Auto-guardado offline para el fontanero en campo (Nivel 2)

**Estado actual (Nivel 1, ya construido)**: el fontanero necesita conexión solo al momento de
guardar; mientras digita lecturas puede estar sin señal.

**Nivel 2 — offline-first completo** (no construido): permitir que el fontanero **abra** la
app y vea el listado de asociados incluso sin haber tenido señal ese día en absoluto (no solo
mientras trabaja), usando datos cacheados de la última sincronización, con una cola de
sincronización que reintenta automáticamente cuando vuelve la señal.

**Por qué se pospuso**: requiere Service Worker + IndexedDB + lógica de reconciliación de
conflictos (si dos personas editan lo mismo estando ambas offline) — varios días de trabajo,
no una tarde. El Nivel 1 ya cubre el caso de uso más común (señal intermitente mientras se
trabaja, no ausencia total de señal todo el día).

---

## 4. Historial de consumo — gráfica y comparativa

**Estado actual**: `GET /asociados/:id/historial-consumo` devuelve la lista cruda de lecturas
mensuales (usado en el Expediente del asociado en el panel admin).

**Qué falta**: visualización tipo gráfica de línea/barras (consumo mes a mes), y comparativa
contra el promedio del acueducto o contra el propio histórico del asociado, para detectar
fugas o consumos anómalos de forma visual — hoy solo hay una tabla plana.

---

## 5. Mapa GPS de predios

**Estado actual**: `Asociado.latitud`/`longitud` existen en el modelo y se muestran en el
Expediente (enlace a Google Maps), pero no hay una vista de mapa consolidada del acueducto.

**Qué falta**: pantalla `/mapa` (existe como placeholder en el sidebar, oculta) con todos los
predios geolocalizados del acueducto en un mapa interactivo — útil para planificación de rutas
del fontanero y visualización de cobertura del servicio.

---

## 6. Eventos y reuniones de junta

**Estado actual**: `/eventos` existe como placeholder en el código (oculto del sidebar), sin
backend construido.

**Qué falta**: definir si esto sigue siendo parte del alcance de AquaRural (reuniones de junta
directiva, asambleas, confirmación de asistencia de asociados) o si se descarta definitivamente
como residuo del dominio anterior — no se tomó una decisión explícita todavía.

---

## 7. Encoding UTF-8 en cargas masivas / pruebas por terminal

**Problema encontrado dos veces durante desarrollo**: nombres con tildes (`Garzón`, `Pérez`)
se corrompieron al crear datos de prueba vía `curl` en Git Bash de Windows — no ocurre desde
el navegador (formularios, carga de Excel), solo fue un artefacto de pruebas manuales por
terminal. No requiere corrección de código, solo queda documentado por si vuelve a ocurrir
al hacer pruebas similares.

---

## 8. Recargo de licencia SaaS — ajuste retroactivo al cambiar de plan

**Estado actual**: el recargo de licencia trasladado a los asociados (`montoRecargoLicencia`)
se recalcula en cada corrida de facturación masiva, dividiendo el costo vigente entre los
asociados activos en ese momento.

**Qué falta considerar**: si el acueducto sube de plan a mitad de un ciclo ya facturado (ej.
creció de 150 a 160 suscriptores y pasa de Manantial a Caudal), las facturas ya emitidas no se
ajustan retroactivamente — el nuevo costo solo aplica a partir de la siguiente facturación
masiva. Esto es coherente con el resto del sistema (nunca se edita una factura ya emitida),
pero vale la pena que quede documentado explícitamente para no generar confusión.
