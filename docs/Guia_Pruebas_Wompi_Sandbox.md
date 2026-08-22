# 💳 Guía Oficial de Pruebas: Pasarela Wompi en Modo Sandbox (AquaRural)

Esta guía contiene los datos oficiales de tarjetas y métodos de prueba simulados para la pasarela de pagos **Wompi Colombia** en el entorno **Sandbox** (`pub_test_...` / `prv_test_...`).

---

## 🔑 Credenciales Wompi Sandbox Predeterminadas

* **Llave Pública (Public Key):** `pub_test_TYld0TKr4chIS8TbArF0lDp85rLkyX35`
* **Llave Privada (Private Key):** `prv_test_O2MzF7vbaMtMEb7PqDZRIreBqDbXFshl`
* **Firma de Eventos (Events Secret):** `test_events_qBjWDMVdomom7TB6zuSCMfbhsu3iqodw`
* **Firma de Integridad (Integrity Secret):** `test_integrity_Ck1W1N3nS3YwdpitCdiPBFrz0Zabvlnn`
* **Entorno:** `Wompi Sandbox` (100% Simulado / Sin cobro de dinero real)

---

## 💳 1. Tarjetas de Crédito / Débito de Prueba (Simulador Wompi)

Al presionar el botón **`[ 💳 Pagar Renovación Wompi / PSE ]`** en el Dashboard o en la pestaña de Licencia, se abrirá el Checkout de Wompi. Utiliza las siguientes tarjetas según la respuesta que desees evaluar:

| Resultado Deseado | Número de Tarjeta de Prueba | Expiración | CVC | Nombre Titular |
|---|---|---|---|---|
| **🟢 Transacción Aprobada (Éxito)** | `4242 4242 4242 4242` | `12/28` *(Cualquier fecha futura)* | `123` | Pedro Gómez |
| **🔴 Transacción Declinada / Rechazada** | `4000 0000 0000 0002` | `12/28` *(Cualquier fecha futura)* | `123` | Pedro Gómez |
| **⚠️ Error de Fondos Insuficientes** | `4000 0000 0000 0051` | `12/28` *(Cualquier fecha futura)* | `123` | Pedro Gómez |

---

## 🏦 2. Prueba con PSE (Débito Bancario a Cuenta de Ahorros / Corriente)

Para simular una transferencia bancaria PSE desde cualquier banco colombiano:

1. En el Checkout de Wompi, selecciona el método **PSE**.
2. Tipo de Persona: **Natural** o **Jurídica**.
3. Banco: Selecciona la opción **"Banco de Pruebas Wompi (Sandbox)"**.
4. Presiona **Continuar Pago**.
5. En la pantalla del simulador bancario:
   - Haz clic en **Aprobar Pago** para simular la transferencia exitosa.
   - O haz clic en **Rechazar Pago** para probar el flujo de error.

---

## 📱 3. Prueba con Nequi o Billeteras Digitales

1. Selecciona el método **Nequi**.
2. Ingresa cualquier número celular de prueba (ej. `3181112233`).
3. En la ventana de autorización simulada de Nequi, presiona el botón **Aprobar Nequi Sandbox**.

---

## 🔄 4. Verificación de Cambios Automáticos en AquaRural

Una vez aprobada la transacción en Wompi Sandbox:

### A. Licenciamiento SaaS del Acueducto:
* **Estado Pago SaaS:** Pasa automáticamente a **`✓ AL DÍA`** (Insignia Verde).
* **Vigencia Licencia:**
  - **Plan Mensual:** Se extiende **+1 Mes** exacto desde la fecha de vencimiento anterior en MongoDB Atlas.
  - **Plan Anual:** Se extiende **+1 Año** exacto desde la fecha de vencimiento anterior en MongoDB Atlas.
* **Alertas Visuales:** El Banner Animado de Mora **desaparece del Dashboard y de la pestaña Licencia**, activando el indicador **`Licencia SaaS OPERATIVA`**.
* **Comprobante Comercial:** Se emite automáticamente la cuenta de cobro pagada `FAC-202608-XXXX` en la tabla **Historial de Cuentas de Cobro de Software (Junta Directiva)**.

### B. Recibos de Agua Veredal (Suscriptores):
* La factura individual del usuario en la tabla cambia a estado **`PAGADA`**.
* El recibo queda respaldado con la referencia y el ID de transacción oficial de Wompi.
