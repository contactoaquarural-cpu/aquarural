# Manual de Integración Wompi — Plataforma Digital Ganadera

> Este manual explica paso a paso cómo crear la cuenta en Wompi, configurar el entorno de pruebas y activar pagos reales en la plataforma.

---

## 1. Crear cuenta en Wompi

1. Ve a [https://comercios.wompi.co](https://comercios.wompi.co)
2. Haz clic en **"Regístrate"**
3. Completa el formulario con los datos de la asociación:
   - **Nombre del comercio:** Asociación de Ganaderos de Garzón – Asogacentro
   - **NIT / Cédula:** NIT de la asociación
   - **Correo electrónico:** correo oficial de la junta directiva
   - **País:** Colombia
4. Verifica tu correo electrónico con el enlace que Wompi envía
5. Inicia sesión en el dashboard de Wompi

---

## 2. Obtener las llaves de prueba (Sandbox)

Una vez dentro del dashboard:

1. Ve al menú **Desarrolladores → Llaves de API**
2. Selecciona el ambiente **Sandbox (pruebas)**
3. Copia las siguientes llaves:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `WOMPI_PUBLIC_KEY` | Llave pública para el widget | `pub_test_XXXXXXXX` |
| `WOMPI_PRIVATE_KEY` | Llave privada para el backend | `prv_test_XXXXXXXX` |
| `WOMPI_INTEGRITY_SECRET` | Secreto para firmar transacciones | `test_integrity_XXXXXXXX` |
| `WOMPI_EVENTS_SECRET` | Secreto para verificar webhooks | `test_events_XXXXXXXX` |

> **Importante:** `WOMPI_INTEGRITY_SECRET` y `WOMPI_EVENTS_SECRET` son secretos distintos. El primero firma el checkout, el segundo verifica los webhooks.

---

## 3. Configurar el backend

Abre el archivo `backend/.env` y reemplaza los valores de Wompi:

```env
WOMPI_PUBLIC_KEY=pub_test_XXXXXXXX
WOMPI_PRIVATE_KEY=prv_test_XXXXXXXX
WOMPI_INTEGRITY_SECRET=test_integrity_XXXXXXXX
WOMPI_SANDBOX=true
```

> El archivo `backend/.env.example` ya tiene estas variables como referencia.

Reinicia el servidor backend después de guardar los cambios:

```bash
cd backend
npm run dev
```

---

## 4. Configurar el webhook en Wompi

El webhook permite que Wompi notifique al backend cuando un pago es aprobado.

### 4.1 En el dashboard de Wompi

1. Ve a **Desarrolladores → Webhooks**
2. Haz clic en **"Agregar endpoint"**
3. Completa los campos:
   - **URL:** `https://tu-dominio-railway.up.railway.app/pagos/webhook`
   - **Eventos:** selecciona `transaction.updated`
4. Guarda y copia el **Secreto de eventos** (`WOMPI_EVENTS_SECRET`)

### 4.2 En el backend

Agrega el secreto de eventos al archivo `backend/.env`:

```env
WOMPI_EVENTS_SECRET=test_events_XXXXXXXX
```

> En desarrollo local Wompi no puede alcanzar `localhost`. Usa [ngrok](https://ngrok.com) para exponer el puerto local temporalmente:
> ```bash
> ngrok http 3000
> # Copia la URL https://xxxx.ngrok.io y úsala como URL del webhook
> ```

---

## 5. Probar pagos en Sandbox

Wompi provee tarjetas de prueba para simular distintos escenarios:

### Tarjetas de crédito de prueba

| Número | Red | Resultado |
|---|---|---|
| `4242 4242 4242 4242` | Visa | ✅ Aprobado |
| `4111 1111 1111 1111` | Visa | ✅ Aprobado |
| `5555 5555 5555 4444` | Mastercard | ✅ Aprobado |
| `4000 0000 0000 0002` | Visa | ❌ Rechazado |

- **Fecha de vencimiento:** cualquier fecha futura (ej. `12/27`)
- **CVV:** cualquier número de 3 dígitos (ej. `123`)
- **Nombre:** cualquier nombre

### PSE de prueba

En el widget de Wompi en modo sandbox, selecciona cualquier banco de la lista — las transacciones PSE siempre se aprueban automáticamente en sandbox.

### Nequi de prueba

Usa el número `3991111111` para simular un pago Nequi aprobado en sandbox.

---

## 6. Verificar que el flujo completo funciona

1. Abre la app móvil
2. Ve a **Pagos → Estado Financiero**
3. Si hay meses pendientes, toca **"Pagar X mes"**
4. En la pantalla de resumen toca **"Pagar $XX.XXX →"**
5. El widget de Wompi debe abrirse con las opciones de pago
6. Selecciona **Tarjeta** e ingresa `4242 4242 4242 4242`
7. Completa el pago
8. La app debe mostrar la pantalla **"¡Pago exitoso!"**
9. Verifica en MongoDB Atlas que el aporte cambió de `PENDIENTE` a `PAGADO`
10. Verifica en el dashboard de Wompi que la transacción aparece como aprobada

---

## 7. Activar producción (pagos reales)

Cuando el sistema esté listo para recibir pagos reales:

### 7.1 Completar verificación en Wompi

Wompi requiere documentación del comercio para activar producción:

- RUT de la asociación
- Cédula del representante legal
- Certificado de existencia y representación legal
- Número de cuenta bancaria para recibir los pagos

### 7.2 Obtener llaves de producción

Una vez aprobada la verificación, en **Desarrolladores → Llaves de API** selecciona **Producción (live)**:

```env
WOMPI_PUBLIC_KEY=pub_live_XXXXXXXX
WOMPI_PRIVATE_KEY=prv_live_XXXXXXXX
WOMPI_INTEGRITY_SECRET=prod_integrity_XXXXXXXX
WOMPI_SANDBOX=false
```

### 7.3 Actualizar variables en Railway

1. Ve al dashboard de [Railway](https://railway.app)
2. Selecciona el proyecto del backend
3. Ve a **Variables**
4. Actualiza las 4 variables de Wompi con los valores de producción
5. Railway reinicia el servidor automáticamente

### 7.4 Actualizar webhook en Wompi

Repite el paso 4 con la URL de producción de Railway y las llaves live.

---

## 8. Resolución de problemas comunes

| Problema | Causa probable | Solución |
|---|---|---|
| Widget no carga | `WOMPI_PUBLIC_KEY` incorrecta | Verifica que empiece con `pub_test_` o `pub_live_` |
| Error de firma | `WOMPI_INTEGRITY_SECRET` incorrecta | Copia el secreto de integridad (no el de eventos) |
| Webhook no recibe eventos | URL incorrecta o servidor caído | Verifica la URL en el dashboard de Wompi |
| Pago aprobado pero aporte sigue PENDIENTE | Webhook no configurado | Sigue el paso 4 de este manual |
| Error 401 en `/pagos/iniciar` | Token JWT expirado | Cierra sesión y vuelve a iniciar |

---

## 9. Contacto de soporte Wompi

- **Centro de ayuda:** [https://docs.wompi.co](https://docs.wompi.co)
- **Soporte:** soporte@wompi.co
- **WhatsApp:** disponible en el dashboard de Wompi

---

*Manual generado para la Plataforma Digital Ganadera — MetaDevelopment Ltd*
