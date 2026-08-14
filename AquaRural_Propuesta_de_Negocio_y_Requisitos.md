# Propuesta de Negocio y Documento Base de Requisitos
## Plataforma Integral para la Gestión, Facturación y Recaudo Digital de Acueductos Veredales

**Versión:** 1.0  
**Fecha:** Agosto de 2026  
**Tipo de proyecto:** Plataforma SaaS / Sistema de información web y aplicación para usuarios  
**Modelo:** Multiacueducto / Multiempresa  
**Medio de pago:** Wompi, con posibilidad de utilizar medios como Nequi, PSE, tarjetas y otros habilitados por la pasarela.

---

# 1. Resumen ejecutivo

El presente proyecto propone el desarrollo de una plataforma tecnológica especializada en la gestión administrativa, facturación, cartera y recaudo digital de acueductos veredales y organizaciones comunitarias encargadas de prestar el servicio de abastecimiento de agua en zonas rurales de Colombia.

Actualmente, muchos acueductos veredales realizan procesos de cobro de manera manual o presencial. Los usuarios deben desplazarse hasta las oficinas de la asociación para realizar el pago de sus obligaciones, lo que representa una dificultad especialmente importante para las personas que viven en zonas rurales alejadas.

La solución propuesta permitirá digitalizar este proceso mediante una plataforma centralizada que conectará tres niveles:

1. **Superadministrador de la plataforma:** encargado de administrar las asociaciones o acueductos vinculados al sistema.
2. **Administrador de cada asociación/acueducto:** encargado de gestionar usuarios, tarifas, facturación, cartera, pagos, reportes y configuración de recaudo.
3. **Usuario final:** podrá consultar sus obligaciones y realizar pagos en línea desde una aplicación o interfaz web.

La plataforma utilizará una arquitectura multiempresa, permitiendo que múltiples asociaciones administren sus propios usuarios y operaciones dentro de una misma infraestructura, manteniendo separados sus datos, facturación y recaudos.

El sistema estará diseñado para reutilizar la estructura tecnológica existente del proyecto previamente desarrollado, particularmente el frontend, backend, autenticación, componentes visuales, estructura de base de datos y mecanismos de integración con servicios externos, realizando las modificaciones necesarias para convertirlo en una plataforma especializada para acueductos veredales.

---

# 2. Nombre tentativo del proyecto

## AquaRural

**AquaRural – Plataforma de Gestión y Recaudo para Acueductos Veredales**

El nombre es provisional y podrá modificarse posteriormente de acuerdo con la estrategia comercial y disponibilidad de marca y dominio.

---

# 3. Problema identificado

Los acueductos veredales cumplen una función fundamental en las comunidades rurales, pero muchos de sus procesos administrativos continúan dependiendo de mecanismos tradicionales.

Entre las principales dificultades se encuentran:

- Cobro presencial.
- Desplazamiento de los usuarios hasta las oficinas.
- Manejo manual de pagos.
- Dificultad para identificar usuarios en mora.
- Procesos manuales para generar cuentas de cobro.
- Falta de información consolidada.
- Dificultad para generar reportes contables.
- Riesgo de errores en la digitación.
- Falta de historial digital de pagos.
- Dificultad para conocer el recaudo en tiempo real.
- Dependencia de efectivo.
- Falta de herramientas para realizar seguimiento a la cartera.

Estas dificultades generan cargas administrativas para las asociaciones y representan una barrera para los usuarios que viven en zonas rurales.

---

# 4. Solución propuesta

La solución consiste en crear una plataforma tecnológica especializada que permita administrar integralmente el proceso:

**Asociación → Usuarios → Facturación → Cobro → Pago → Confirmación → Reporte → Contabilidad**

El usuario podrá ingresar a la plataforma, seleccionar su acueducto, identificarse mediante su número de documento y consultar las obligaciones pendientes.

Posteriormente podrá realizar el pago mediante la plataforma Wompi.

Una vez confirmado el pago, el sistema actualizará automáticamente el estado de la factura y registrará la transacción.

---

# 5. Propuesta de valor

## Para las asociaciones

- Digitalización del proceso de recaudo.
- Reducción del manejo de efectivo.
- Administración centralizada de usuarios.
- Generación automática de facturas.
- Control de cartera.
- Estadísticas de recaudo.
- Reportes contables.
- Exportación de información.
- Historial de pagos.
- Identificación de usuarios morosos.
- Automatización de procesos administrativos.

## Para los usuarios

- No necesitan desplazarse hasta la oficina.
- Consulta de obligaciones desde cualquier lugar.
- Pago en línea.
- Consulta del historial.
- Visualización de sus facturas.
- Confirmación del pago.
- Mayor facilidad y disponibilidad del servicio.

## Para el propietario de la plataforma

- Modelo de negocio escalable.
- Posibilidad de vincular múltiples asociaciones.
- Administración centralizada.
- Modelo SaaS.
- Cobro por asociación, usuarios o transacciones.
- Posibilidad de incorporar nuevos servicios posteriormente.

---

# 6. Modelo de negocio

El proyecto se plantea inicialmente bajo un modelo **SaaS (Software as a Service)**.

La plataforma será propiedad del operador del sistema y las asociaciones utilizarán el servicio mediante una cuenta administrativa.

## Alternativas de monetización

### Modelo 1 – Suscripción mensual

Cada asociación paga una tarifa mensual por utilizar la plataforma.

Ejemplo:

- Plan básico.
- Plan estándar.
- Plan empresarial.

### Modelo 2 – Cobro por cantidad de usuarios

La tarifa depende del número de usuarios registrados.

Ejemplo:

- Hasta 100 usuarios.
- 101 a 300 usuarios.
- 301 a 1.000 usuarios.
- Más de 1.000 usuarios.

### Modelo 3 – Comisión por transacción

Se puede establecer una comisión por cada pago realizado mediante la plataforma, teniendo en cuenta las condiciones comerciales y técnicas de la pasarela de pagos.

### Modelo 4 – Modelo híbrido

Una alternativa flexible sería:

**Suscripción mensual + comisión por transacción.**

Este modelo puede generar ingresos recurrentes y, simultáneamente, relacionar parte del costo con el nivel de utilización del sistema.

---

# 7. Arquitectura general del sistema

La plataforma estará organizada bajo una arquitectura multiempresa.

```text
                         PLATAFORMA AQUARURAL
                                  │
                         SUPERADMINISTRADOR
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
       ASOCIACIÓN A          ASOCIACIÓN B          ASOCIACIÓN C
             │                    │                    │
       ADMINISTRADOR          ADMINISTRADOR          ADMINISTRADOR
             │                    │                    │
       ┌─────┼─────┐        ┌────┼─────┐         ┌────┼─────┐
       │     │     │        │    │     │         │    │     │
    Usuarios Facturas     Usuarios Facturas    Usuarios Facturas
       │     │                │                    │
       └─────┴────────────────┴────────────────────┘
                          │
                     USUARIO FINAL
                          │
                    CONSULTA / PAGO
                          │
                        WOMPI
                          │
              CONFIRMACIÓN DE PAGO
                          │
                    ACTUALIZACIÓN
                    DE LA FACTURA
```

---

# 8. Roles del sistema

## 8.1 Superadministrador

Es el propietario o administrador general de la plataforma.

Tendrá acceso a:

- Crear asociaciones.
- Editar asociaciones.
- Activar/desactivar asociaciones.
- Crear administradores.
- Consultar asociaciones.
- Configurar integraciones.
- Gestionar las credenciales necesarias para la integración de pagos.
- Consultar estadísticas globales.
- Consultar recaudos.
- Consultar transacciones.
- Generar reportes.
- Administrar planes.
- Controlar el estado de las cuentas.
- Gestionar parámetros generales.

---

# 9. Consideración importante sobre las credenciales de Wompi

La arquitectura deberá diseñarse cuidadosamente para que cada asociación pueda utilizar su propia configuración de pagos.

No se recomienda manejar las credenciales sensibles como simples campos visibles dentro de la interfaz.

Se deberá contemplar:

- Almacenamiento seguro.
- Cifrado cuando corresponda.
- Variables protegidas.
- Control de acceso.
- Separación de credenciales por asociación.
- Registro de modificaciones.
- Manejo diferenciado entre credenciales públicas y privadas.
- Nunca exponer claves privadas al frontend.

La plataforma debe utilizar únicamente las credenciales y mecanismos oficialmente soportados por Wompi para el tipo de integración seleccionado.

Esto permitirá que los recaudos permanezcan correctamente asociados a cada organización.

---

# 10. Módulo del Superadministrador

El panel del superadministrador será el centro de control de la plataforma.

## Dashboard

Debe mostrar:

- Total de asociaciones.
- Asociaciones activas.
- Asociaciones suspendidas.
- Total de usuarios.
- Total de facturas.
- Facturas pendientes.
- Facturas pagadas.
- Recaudo total.
- Transacciones realizadas.
- Transacciones pendientes.
- Transacciones rechazadas.

## Gestión de asociaciones

Permitir:

- Crear asociación.
- Editar asociación.
- Consultar información.
- Activar/desactivar.
- Asignar administrador.
- Configurar datos de facturación.
- Configurar integración de pagos.
- Consultar estadísticas.
- Consultar usuarios.
- Consultar recaudo.

---

# 11. Información de una asociación

Cada asociación deberá contar con información independiente:

- Nombre.
- NIT.
- Dirección.
- Municipio.
- Departamento.
- Vereda.
- Teléfono.
- Correo electrónico.
- Representante.
- Estado.
- Fecha de creación.
- Administrador.
- Configuración de facturación.
- Configuración de pagos.
- Información bancaria cuando sea necesaria.
- Parámetros del servicio.

---

# 12. Administrador de la asociación

Cada asociación tendrá uno o varios usuarios administrativos autorizados.

El administrador podrá gestionar exclusivamente la información correspondiente a su asociación.

Sus principales funciones serán:

- Dashboard.
- Usuarios.
- Tarifas.
- Facturación.
- Cartera.
- Pagos.
- Reportes.
- Estadísticas.
- Exportaciones.
- Configuración.

---

# 13. Gestión de usuarios

El administrador deberá poder cargar la totalidad de los usuarios del acueducto.

## Registro individual

Podrá crear un usuario manualmente.

Datos posibles:

- Tipo de documento.
- Número de documento.
- Nombres.
- Apellidos.
- Dirección.
- Vereda.
- Teléfono.
- Correo.
- Código del usuario.
- Número de cuenta o matrícula.
- Estado.
- Tipo de tarifa.
- Información del medidor.
- Fecha de vinculación.

## Carga masiva

Será fundamental permitir la carga de usuarios mediante Excel.

El administrador podrá:

1. Descargar una plantilla.
2. Diligenciar los usuarios.
3. Subir el archivo.
4. Validar información.
5. Detectar errores.
6. Confirmar importación.
7. Crear automáticamente los usuarios.

Esto permitirá migrar rápidamente las bases de datos existentes de las asociaciones.

---

# 14. Panel individual del usuario

Cada usuario deberá tener una ficha administrativa.

El administrador podrá consultar:

- Información personal.
- Estado.
- Historial de facturas.
- Facturas pendientes.
- Facturas pagadas.
- Valores cobrados.
- Pagos realizados.
- Fecha de pago.
- Método de pago.
- Saldo pendiente.
- Historial de modificaciones.

Esto permitirá tener una trazabilidad completa.

---

# 15. Sistema de tarifas

La plataforma debe permitir diferentes modelos de cobro.

## Modalidad A – Tarifa general

La asociación establece un valor único.

Ejemplo:

**Tarifa mensual: $25.000**

El sistema puede aplicar automáticamente ese valor a todos los usuarios activos.

## Modalidad B – Tarifa individual

Cada usuario puede tener un valor diferente.

Ejemplo:

- Usuario A: $20.000
- Usuario B: $25.000
- Usuario C: $30.000
- Usuario D: $35.000

## Modalidad C – Consumo medido

Como evolución del proyecto, se podrá incorporar:

- Lectura anterior.
- Lectura actual.
- Consumo.
- Tarifa por metro cúbico.
- Cargo fijo.
- Otros conceptos.
- Total.

Esto permitirá evolucionar posteriormente hacia un sistema completo de facturación por consumo.

---

# 16. Generación de facturas

El administrador podrá generar facturas de manera mensual.

Ejemplo:

**Periodo:** Agosto 2026

El sistema toma:

- Usuarios activos.
- Tarifa correspondiente.
- Conceptos.
- Fecha de generación.
- Fecha de vencimiento.

Y genera automáticamente las facturas.

---

# 17. Facturación masiva

El administrador podrá seleccionar:

**Generar facturación del periodo**

El sistema generará automáticamente las facturas de todos los usuarios activos.

Posteriormente podrá mostrar:

- Total de facturas generadas.
- Valor total facturado.
- Facturas pendientes.
- Facturas pagadas.
- Facturas con error.

---

# 18. Factura digital

Cada factura deberá tener una presentación similar a una factura o cuenta de cobro.

Debe contener:

- Nombre de la asociación.
- Identificación.
- Datos del usuario.
- Número de factura.
- Periodo.
- Fecha de generación.
- Fecha de vencimiento.
- Concepto.
- Valor.
- Estado.
- Información del servicio.
- Medio de pago.
- Código de referencia.

Estados posibles:

- Pendiente.
- Pagada.
- Vencida.
- Anulada.
- En proceso.

---

# 19. Aplicación / portal del usuario

La aplicación del usuario tendrá una experiencia sencilla.

## Paso 1

Seleccionar el acueducto veredal.

## Paso 2

Ingresar número de documento.

## Paso 3

Validar identidad y cuenta.

## Paso 4

Mostrar información:

**Bienvenido, Juan Pérez**

**Factura pendiente**

Periodo: Agosto 2026  
Valor: $25.000  
Vencimiento: 30/08/2026

**[Pagar ahora]**

---

# 20. Flujo de pago

```text
Usuario
   ↓
Selecciona acueducto
   ↓
Ingresa documento
   ↓
Sistema identifica usuario
   ↓
Consulta facturas pendientes
   ↓
Selecciona factura
   ↓
Presiona "Pagar"
   ↓
Sistema inicia proceso Wompi
   ↓
Usuario selecciona medio de pago
   ↓
Realiza el pago
   ↓
Wompi procesa transacción
   ↓
Sistema recibe confirmación
   ↓
Actualiza factura
   ↓
Factura = PAGADA
   ↓
Registra transacción
   ↓
Usuario consulta comprobante
```

La confirmación definitiva del pago deberá depender de la respuesta y mecanismos oficiales de confirmación de la pasarela, no simplemente de que el usuario regrese a la aplicación.

---

# 21. Historial del usuario

El usuario podrá consultar:

- Facturas anteriores.
- Facturas pagadas.
- Facturas pendientes.
- Fecha de pago.
- Valor.
- Número de factura.
- Estado.
- Comprobante.

---

# 22. Dashboard del administrador

El dashboard deberá mostrar:

### Recaudo

- Recaudo del día.
- Recaudo del mes.
- Recaudo del año.
- Recaudo acumulado.

### Facturación

- Total facturado.
- Total pagado.
- Total pendiente.
- Total vencido.

### Cartera

- Usuarios en mora.
- Valor de cartera.
- Cartera vencida.
- Porcentaje de recuperación.

### Usuarios

- Total.
- Activos.
- Inactivos.
- Con deuda.
- Al día.

---

# 23. Gráficos y estadísticas

Se podrán incluir:

- Recaudo mensual.
- Comparativo entre meses.
- Facturación vs. recaudo.
- Usuarios al día vs. morosos.
- Cartera.
- Pagos por método.
- Evolución de ingresos.
- Número de transacciones.

---

# 24. Gestión de cartera

El sistema deberá identificar automáticamente las obligaciones pendientes.

Clasificaciones:

- Al día.
- Próxima a vencer.
- Vencida.
- En mora.

El administrador podrá consultar:

**Usuario | Factura | Periodo | Valor | Vencimiento | Días de mora | Estado**

---

# 25. Reportes

La plataforma deberá contar con un módulo completo de reportes.

## Reporte de recaudo

- Fecha.
- Usuario.
- Factura.
- Valor.
- Medio de pago.
- Estado.
- Referencia de transacción.

## Reporte de cartera

- Usuario.
- Documento.
- Facturas pendientes.
- Valor pendiente.
- Días de mora.

## Reporte de facturación

- Periodo.
- Facturas generadas.
- Valor facturado.
- Pagadas.
- Pendientes.
- Vencidas.

## Reporte de usuarios

- Usuarios activos.
- Usuarios inactivos.
- Información de contacto.
- Estado de cuenta.

---

# 26. Exportación a Excel

La exportación a Excel será una funcionalidad fundamental.

El administrador podrá seleccionar:

- Tipo de reporte.
- Periodo.
- Estado.
- Usuario.
- Fecha inicial.
- Fecha final.

Y descargar un archivo XLS/XLSX.

Ejemplo:

**Reporte_Recaudo_Agosto_2026.xlsx**

Esto permitirá que la contadora pueda procesar y validar la información.

---

# 27. Exportación PDF

También podrá incorporarse:

- Factura individual en PDF.
- Comprobante de pago.
- Reporte de recaudo.
- Reporte de cartera.
- Estado de cuenta.

---

# 28. Módulo contable / información para contador

La plataforma no necesariamente debe reemplazar un software contable especializado.

Su función será proporcionar información estructurada para facilitar el trabajo de la contadora.

Debe permitir obtener:

- Total recaudado.
- Total facturado.
- Pagos individuales.
- Fechas.
- Referencias.
- Métodos de pago.
- Usuarios.
- Facturas.
- Anulaciones.
- Reembolsos cuando corresponda.
- Cartera.

---

# 29. Auditoría

Cada operación administrativa importante deberá quedar registrada.

Ejemplos:

- Usuario creado.
- Usuario modificado.
- Tarifa modificada.
- Factura generada.
- Factura anulada.
- Pago registrado.
- Configuración modificada.
- Credenciales modificadas.

Se recomienda registrar:

- Usuario que realizó la acción.
- Fecha.
- Hora.
- Acción.
- Registro afectado.
- Valor anterior.
- Valor nuevo.

---

# 30. Seguridad

Se deberá implementar:

- Autenticación segura.
- Contraseñas cifradas.
- Control de roles.
- Autorización por asociación.
- Protección de endpoints.
- Validación de datos.
- Protección contra acceso no autorizado.
- Protección de credenciales.
- Registro de auditoría.
- HTTPS.
- Manejo seguro de sesiones.
- Copias de seguridad.
- Separación lógica de información entre asociaciones.

---

# 31. Arquitectura multiempresa

Cada registro deberá estar asociado a una organización.

Conceptualmente:

```text
Association
   │
   ├── Administrators
   ├── Users
   ├── Tariffs
   ├── Invoices
   ├── Payments
   ├── Reports
   └── Payment Configuration
```

El backend deberá validar permanentemente que un administrador solo pueda acceder a los registros pertenecientes a su asociación.

---

# 32. Modelo de datos inicial

Las entidades principales podrían ser:

- `PlatformAdmin`
- `Association`
- `AssociationAdmin`
- `User`
- `Meter`
- `Tariff`
- `Invoice`
- `InvoiceItem`
- `Payment`
- `PaymentTransaction`
- `PaymentConfiguration`
- `AuditLog`
- `Report`

---

# 33. Relación conceptual

```text
SUPERADMIN
    │
    └── ASSOCIATION
           │
           ├── ADMINISTRATOR
           │
           ├── USERS
           │     │
           │     └── INVOICES
           │              │
           │              └── PAYMENTS
           │
           ├── TARIFFS
           │
           ├── REPORTS
           │
           └── PAYMENT CONFIGURATION
                         │
                       WOMPI
```

---

# 34. Requerimientos funcionales principales

- **RF-001:** El sistema deberá permitir al superadministrador crear asociaciones.
- **RF-002:** El sistema deberá permitir crear administradores asociados a una organización.
- **RF-003:** El sistema deberá permitir activar o desactivar asociaciones.
- **RF-004:** El sistema deberá permitir configurar la integración de pagos de cada asociación.
- **RF-005:** El administrador deberá poder crear usuarios.
- **RF-006:** El administrador deberá poder cargar usuarios masivamente mediante Excel.
- **RF-007:** El administrador deberá poder modificar usuarios.
- **RF-008:** El administrador deberá poder configurar una tarifa general.
- **RF-009:** El administrador deberá poder asignar tarifas individuales.
- **RF-010:** El administrador deberá poder generar facturación masiva.
- **RF-011:** El sistema deberá generar facturas individuales.
- **RF-012:** El usuario deberá poder consultar sus obligaciones.
- **RF-013:** El usuario deberá poder realizar pagos en línea.
- **RF-014:** El sistema deberá recibir y procesar la confirmación de las transacciones.
- **RF-015:** El sistema deberá actualizar el estado de las facturas.
- **RF-016:** El administrador deberá consultar el recaudo.
- **RF-017:** El administrador deberá consultar usuarios morosos.
- **RF-018:** El administrador deberá consultar estadísticas.
- **RF-019:** El administrador deberá descargar reportes.
- **RF-020:** El sistema deberá permitir exportar información a Excel.
- **RF-021:** El sistema deberá permitir generar documentos PDF.
- **RF-022:** El sistema deberá mantener historial de pagos.
- **RF-023:** El sistema deberá registrar operaciones administrativas.

---

# 35. Requerimientos no funcionales

## Rendimiento

El sistema deberá responder rápidamente ante operaciones habituales.

## Escalabilidad

La arquitectura deberá permitir incorporar nuevas asociaciones sin reconstruir el sistema.

## Disponibilidad

La plataforma deberá estar disponible permanentemente, salvo mantenimientos programados.

## Seguridad

La información deberá estar protegida mediante mecanismos de autenticación, autorización y cifrado.

## Usabilidad

La interfaz deberá ser sencilla, especialmente para usuarios con poca experiencia tecnológica.

## Compatibilidad

La aplicación deberá funcionar correctamente en:

- Computadores.
- Tablets.
- Teléfonos Android.
- iPhone.

---

# 36. Diseño de experiencia de usuario

La aplicación para el usuario final debe ser mucho más sencilla que el panel administrativo.

El objetivo será:

**Entrar → Identificarse → Ver deuda → Pagar**

No se debe sobrecargar al usuario con opciones innecesarias.

---

# 37. Flujo completo del negocio

```text
SUPERADMINISTRADOR
        │
        ↓
CREA ASOCIACIÓN
        │
        ↓
CONFIGURA ADMINISTRADOR
        │
        ↓
CONFIGURA INTEGRACIÓN DE PAGOS
        │
        ↓
ASOCIACIÓN ACTIVA
        │
        ↓
ADMINISTRADOR INGRESA
        │
        ↓
CARGA USUARIOS
        │
        ↓
CONFIGURA TARIFAS
        │
        ↓
GENERA FACTURACIÓN
        │
        ↓
USUARIOS RECIBEN OBLIGACIÓN
        │
        ↓
USUARIO INGRESA A LA APP
        │
        ↓
SELECCIONA ACUEDUCTO
        │
        ↓
INGRESA DOCUMENTO
        │
        ↓
CONSULTA FACTURA
        │
        ↓
PAGA MEDIANTE WOMPI
        │
        ↓
CONFIRMACIÓN DE TRANSACCIÓN
        │
        ↓
FACTURA PAGADA
        │
        ↓
RECAUDO REGISTRADO
        │
        ↓
DASHBOARD ACTUALIZADO
        │
        ↓
CONTADORA DESCARGA REPORTE
```

---

# 38. Fases de desarrollo

## Fase 1 – Reutilización del proyecto existente

Analizar:

- Frontend.
- Backend.
- Base de datos.
- Autenticación.
- Componentes.
- Servicios.
- Integraciones.
- Sistema de usuarios.

Objetivo: determinar qué componentes pueden reutilizarse directamente.

## Fase 2 – Arquitectura multiempresa

Implementar:

- Asociaciones.
- Superadministrador.
- Administradores.
- Separación de datos.

## Fase 3 – Gestión de usuarios

Implementar:

- Registro.
- Edición.
- Importación Excel.
- Estados.

## Fase 4 – Tarifas y facturación

Implementar:

- Tarifa general.
- Tarifa individual.
- Generación de facturas.
- Estados.

## Fase 5 – Pagos

Implementar:

- Wompi.
- Transacciones.
- Confirmación.
- Actualización de facturas.

## Fase 6 – Aplicación del usuario

Implementar:

- Selección de acueducto.
- Identificación.
- Consulta.
- Factura.
- Pago.
- Historial.

## Fase 7 – Estadísticas y reportes

Implementar:

- Dashboard.
- Gráficos.
- Cartera.
- Recaudo.
- Excel.
- PDF.

## Fase 8 – Pruebas

Realizar:

- Pruebas funcionales.
- Pruebas de seguridad.
- Pruebas de pagos.
- Pruebas de facturación.
- Pruebas de carga masiva.
- Pruebas de reportes.

## Fase 9 – Implementación piloto

Seleccionar una asociación para realizar el primer piloto.

Posteriormente:

**Piloto → Correcciones → Validación → Comercialización**

---

# 39. MVP – Primera versión comercial

## Superadministrador

- Login.
- Dashboard.
- Crear asociaciones.
- Administrar asociaciones.
- Crear administradores.
- Configurar pagos.

## Administrador

- Login.
- Dashboard.
- Usuarios.
- Importación Excel.
- Tarifas.
- Facturación.
- Cartera.
- Pagos.
- Reportes.
- Exportación Excel.

## Usuario

- Selección de asociación.
- Identificación.
- Consulta de factura.
- Pago Wompi.
- Estado de pago.
- Historial.

Con esto se podría comenzar a probar el modelo de negocio.

---

# 40. Funcionalidades futuras

Después del MVP se pueden incorporar:

- Lectura de medidores.
- Facturación por consumo.
- Tarifas escalonadas.
- Notificaciones por WhatsApp.
- Notificaciones SMS.
- Correo electrónico.
- Recordatorios automáticos.
- Código QR para pago.
- Portal web.
- Aplicación móvil nativa.
- Módulo de peticiones y reclamos.
- Gestión de daños.
- Registro de mantenimientos.
- Inventario.
- Gestión de empleados.
- Georreferenciación de usuarios.
- Mapa de redes.
- Indicadores operativos.
- Inteligencia artificial para análisis administrativo.

---

# 41. Ventaja competitiva

La principal ventaja será la especialización.

No se busca crear simplemente una plataforma genérica de pagos.

Se busca crear una solución específicamente diseñada para:

**Acueductos veredales + Asociaciones comunitarias + Usuarios rurales + Facturación + Recaudo digital.**

Esto permite adaptar el sistema a las necesidades reales de estas organizaciones.

---

# 42. Estrategia de implementación comercial

Se recomienda comenzar con una asociación piloto.

### Etapa 1

Identificar una asociación.

### Etapa 2

Migrar su información.

### Etapa 3

Configurar tarifas.

### Etapa 4

Configurar pagos.

### Etapa 5

Generar la primera facturación.

### Etapa 6

Realizar pagos reales controlados.

### Etapa 7

Validar reportes con la contadora.

### Etapa 8

Recopilar comentarios.

### Etapa 9

Mejorar el sistema.

### Etapa 10

Utilizar el caso como referencia comercial para incorporar nuevas asociaciones.

---

# 43. Estrategia de crecimiento

La plataforma debe diseñarse desde el principio para crecer.

La estructura ideal será:

```text
1 Plataforma
       ↓
10 Asociaciones
       ↓
50 Asociaciones
       ↓
100 Asociaciones
       ↓
500 Asociaciones
       ↓
Miles de usuarios
```

El crecimiento no debería requerir crear una aplicación independiente para cada asociación.

Todas utilizarán la misma plataforma bajo un modelo multiempresa.

---

# 44. Indicadores clave del negocio

El superadministrador podrá conocer:

- Número de asociaciones vinculadas.
- Número de asociaciones activas.
- Usuarios totales.
- Facturas generadas.
- Valor total facturado.
- Valor total recaudado.
- Número de transacciones.
- Valor promedio de transacción.
- Asociaciones con mayor utilización.
- Crecimiento mensual.
- Ingresos de la plataforma.

---

# 45. Indicadores de cada asociación

El administrador podrá consultar:

- Usuarios registrados.
- Usuarios activos.
- Facturas del periodo.
- Total facturado.
- Total recaudado.
- Total pendiente.
- Cartera vencida.
- Porcentaje de recaudo.
- Número de pagos.
- Valor promedio.
- Evolución mensual.

---

# 46. Propuesta de experiencia completa

### Para el superadministrador

**Crear asociación → configurar → activar → supervisar**

### Para el administrador

**Cargar usuarios → configurar tarifas → facturar → recaudar → controlar cartera → reportar**

### Para el usuario

**Ingresar → consultar → pagar → recibir confirmación**

### Para la contadora

**Ingresar → consultar → descargar Excel → validar información**

---

# 47. Resultado esperado

Al finalizar la implementación, una asociación deberá poder realizar prácticamente todo su ciclo básico de recaudo desde la plataforma:

**Registrar usuarios**

↓

**Configurar tarifas**

↓

**Generar facturas**

↓

**Notificar obligaciones**

↓

**Recibir pagos**

↓

**Actualizar cartera**

↓

**Consultar estadísticas**

↓

**Descargar información**

↓

**Entregar información a contabilidad**

Esto permitirá transformar un proceso actualmente presencial y manual en un proceso digital, trazable y centralizado.

---

# 48. Consideraciones legales y operativas

Antes de una implementación comercial será necesario validar, con asesoría jurídica y contable cuando corresponda:

- Tratamiento de datos personales.
- Política de privacidad.
- Autorizaciones para tratamiento de datos.
- Términos y condiciones.
- Responsabilidades de la plataforma.
- Responsabilidades de cada asociación.
- Manejo de información financiera.
- Facturación y documentos equivalentes, según corresponda.
- Condiciones comerciales de la pasarela de pagos.
- Manejo de reembolsos.
- Manejo de transacciones rechazadas.
- Manejo de información tributaria.
- Requisitos aplicables a cada asociación.

La plataforma deberá diferenciar claramente entre el servicio tecnológico ofrecido por la plataforma y las obligaciones propias de cada asociación.

---

# 49. Recomendación técnica inicial

Dado que ya existe un proyecto desarrollado con:

- Frontend.
- Backend.
- Base de datos.
- Autenticación.
- Integración con Wompi.
- Componentes reutilizables.

la estrategia recomendada no es comenzar desde cero.

Se deberá realizar primero una **auditoría técnica del proyecto existente**.

El objetivo será clasificar cada componente en:

### Reutilizar

Código que puede utilizarse sin modificaciones importantes.

### Adaptar

Código que puede mantenerse, pero requiere modificaciones.

### Reestructurar

Componentes que funcionan actualmente, pero necesitan ser reorganizados para soportar el modelo multiempresa.

### Crear

Funcionalidades inexistentes que deben desarrollarse.

### Eliminar

Componentes del proyecto anterior que no tienen utilidad en la nueva solución.

---

# 50. Concepto final del proyecto

> **AquaRural será una plataforma SaaS multiempresa especializada en la administración, facturación y recaudo digital de acueductos veredales, permitiendo a las asociaciones gestionar sus usuarios y obligaciones, recibir pagos electrónicos y obtener información financiera y administrativa en tiempo real, mientras que los usuarios podrán consultar y pagar sus facturas sin necesidad de desplazarse hasta las oficinas del acueducto.**

La visión de largo plazo es convertir la plataforma no solamente en un sistema de recaudo, sino en un **sistema integral de gestión para acueductos rurales**.

---

# 51. Próximo paso recomendado

El siguiente paso no debería ser comenzar inmediatamente a programar.

Primero se debe tomar el proyecto existente y realizar una:

## Auditoría de reutilización tecnológica

Comparar:

**PROYECTO ACTUAL**

vs.

**NUEVO PROYECTO AQUARURAL**

y construir una matriz:

| Componente | Proyecto actual | Nuevo proyecto | Acción |
|---|---|---|---|
| Frontend | Existente | Necesario | Reutilizar/adaptar |
| Backend | Existente | Necesario | Reestructurar |
| Base de datos | Existente | Nueva estructura | Reestructurar |
| Autenticación | Existente | Necesario | Adaptar |
| Wompi | Existente | Necesario | Adaptar |
| Usuarios | Existente | Necesario | Ampliar |
| Roles | Existente | 3 niveles | Ampliar |
| Facturación | Por definir | Fundamental | Crear/adaptar |
| Reportes | Parcial | Fundamental | Ampliar |
| Excel | Por definir | Necesario | Crear |
| Dashboard | Existente | Necesario | Adaptar |
| Multiempresa | Por definir | Fundamental | Crear |
| Cartera | Por definir | Fundamental | Crear |
| Asociación | No aplica | Fundamental | Crear |

Este análisis permitirá determinar exactamente **qué porcentaje del proyecto anterior puede convertirse en la base de AquaRural**, reduciendo tiempo, costos y esfuerzo de desarrollo.

---

# 52. Conclusión

El proyecto presenta una oportunidad para solucionar una necesidad concreta de los acueductos veredales: facilitar el recaudo, disminuir los pagos presenciales y proporcionar a las asociaciones herramientas modernas de administración y control financiero.

La arquitectura multiempresa permitirá que una única plataforma pueda atender múltiples asociaciones, mientras que la separación de roles garantizará que cada organización administre únicamente su información.

El componente de facturación, cartera, estadísticas y exportación de información permitirá además que la plataforma no sea únicamente un medio de pago, sino un verdadero sistema de información administrativa.

El proyecto deberá comenzar con un MVP controlado en una asociación piloto y posteriormente evolucionar hacia una plataforma comercial escalable.

**Concepto central:**

> **Una plataforma para que el acueducto administre, el usuario pague y la asociación controle todo desde un mismo sistema.**
