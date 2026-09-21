# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Nota: el monorepo también incluye `mobile-app` (React Native + Expo), el portal del suscriptor final. Se registra como "web" porque el lenguaje visual central del producto (panel admin + SuperAdmin + landing) vive en web; la app móvil consume la misma identidad de marca, no un lenguaje de diseño nativo independiente.

## Users

Tres roles con necesidades muy distintas:

1. **Suscriptor final** (usuario rural del acueducto veredal) — con frecuencia poca experiencia tecnológica, conectividad limitada. Su tarea: identificarse, ver su deuda y pagar sin desplazarse a la oficina. Flujo objetivo: **Entrar → Identificarse → Ver deuda → Pagar**.
2. **Administrador de acueducto/asociación** — junta directiva o persona designada que gestiona suscriptores, tarifas, facturación masiva, cartera y reportes de su propia asociación. Necesita eficiencia en tareas repetitivas (carga masiva Excel, facturación en 1-clic) y confianza en las cifras que reporta a la contadora.
3. **SuperAdmin de la plataforma (MetaDevelopment Ltd)** — controla todas las asociaciones afiliadas, sus llaves Wompi cifradas, activación/desactivación y estadísticas globales del negocio SaaS.

Rol secundario mencionado en el flujo de negocio: la **contadora** de cada asociación, que consume reportes/exportaciones Excel generados por el administrador (no tiene login propio en el MVP).

## Product Purpose

AquaRural Pro digitaliza la administración, facturación masiva y recaudo digital de acueductos veredales en Colombia, reemplazando el cobro presencial y manual por un ciclo completo: **Asociación → Usuarios → Facturación → Cobro → Pago → Confirmación → Reporte → Contabilidad**. Éxito = una asociación puede correr su ciclo de recaudo mensual completo (cargar/gestionar suscriptores, tarifar, facturar, cobrar vía Wompi, y entregar reportes a contabilidad) sin procesos manuales ni desplazamientos del usuario final.

## Positioning

No es una pasarela de pagos genérica ni un ERP genérico: es una plataforma **especializada en acueductos veredales y asociaciones comunitarias rurales colombianas**, con arquitectura multiempresa (multi-acueducto) donde cada asociación mantiene sus propios suscriptores, tarifas, facturación y credenciales de recaudo (Wompi) aisladas, sobre una única infraestructura SaaS operada por MetaDevelopment Ltd.

## Operating Context

- Modelo SaaS multi-inquilino: **SuperAdmin (MetaDevelopment) → Asociación/Acueducto → Administrador → Suscriptores**.
- Medio de pago: Wompi (PSE, tarjeta, Nequi); la confirmación de pago depende del mecanismo oficial de Wompi, nunca solo del regreso del usuario a la app.
- Carga masiva de suscriptores vía Excel (plantilla → diligenciar → subir → validar → confirmar importación).
- Facturación en 1-clic / facturación masiva mensual por periodo, con estados: Pendiente, Pagada, Vencida, Anulada, En proceso.
- Carné QR digital del suscriptor, firmado HMAC-SHA256, TTL 30 días.
- Módulo de configuración por asociación (nombre, logo, color primario, teléfono de contacto) pensado para que cada cliente reciba su propia instancia con identidad personalizada (ver Fase 11 en CLAUDE.md).
- Landing page pública (Fase 11, pendiente) por asociación, alimentada por datos reales del backend (noticias, convenios, precios, videos, configuración) — no contenido inventado.
- Reportes/exportación Excel y PDF son entregables clave para la contadora de cada asociación.
- Cliente demo actual: Acueducto Veredal La Argentina — Garzón, Huila, Colombia.

## Capabilities and Constraints

- Arquitectura multiempresa obligatoria: todo registro pertenece a una asociación; el backend debe impedir que un administrador acceda a datos de otra asociación.
- Credenciales Wompi por asociación deben almacenarse cifradas (AES-256 mencionado en CLAUDE.md), nunca expuestas al frontend, con separación entre claves públicas y privadas.
- Tres modalidades de tarifa: tarifa general (un valor para todos los activos), tarifa individual (valor por suscriptor), y consumo medido (lectura anterior/actual, tarifa por m³ — evolución del MVP, ya con modelos `LecturaHistorica` en el backend).
- El sistema nunca debe exponer el campo `password` en respuestas de API (regla dura de CLAUDE.md).
- Toda operación administrativa relevante debe quedar en auditoría (usuario, fecha/hora, acción, valores antes/después).
- Compatibilidad requerida: computadores, tablets, Android e iPhone.
- Sin módulo contable propio: el sistema entrega información estructurada, no reemplaza software contable especializado.
- Pendiente/no decidido aún: modelo de monetización final entre asociaciones (suscripción, por número de usuarios, comisión por transacción, o híbrido) — las cuatro alternativas siguen abiertas según la propuesta de negocio.

## Brand Commitments

- Nombre de producto: **AquaRural Pro**.
- Empresa desarrolladora: **MetaDevelopment Ltd** (Inglaterra y Gales No. 15830243; Cámara de Comercio del Huila No. 394664).
- Cliente demo: Acueducto Veredal La Argentina, Garzón, Huila, Colombia.
- Cada asociación cliente recibe instancia propia con nombre, logo y color primario personalizables desde el panel admin (Configuración) — el producto debe soportar white-labeling ligero por diseño, no una identidad visual fija de fábrica.
- Sin paleta, tipografía ni logo definitivo confirmados todavía para la marca AquaRural Pro en sí (más allá del blanco-etiquetado por asociación).

## Evidence on Hand

- `AquaRural_Propuesta_de_Negocio_y_Requisitos.md` — documento base de requisitos y modelo de negocio (agosto 2026), fuente principal de este archivo.
- CLAUDE.md raíz — estado de fases, stack técnico completo, reglas del proyecto.
- Backend ya tiene modelos para `Acueducto`, `AdminUser`, `Asociado`, `Factura`, `FacturaSaaS`, `LecturaHistorica` — evidencia de que la arquitectura multiempresa y facturación por consumo ya están en desarrollo activo, más allá de lo descrito como "futuro" en la propuesta original.
- Web-admin ya tiene páginas construidas para Asociados, Configuración, Convenios, Dashboard, Eventos, Facturación, Lecturas, Licencia, Login, Mapa, Noticias, Precios, Reportes, SuperAdmin, Suscriptores — superset de lo listado en el MVP de la propuesta original. Las páginas `Mercado` y `GanaderoTV`, residuo de un proyecto ganadero anterior sin rutas ni enlaces activos, fueron eliminadas (2026-09-16). Otras páginas heredadas de ese proyecto (p. ej. `AsociadosPage.jsx`, ya no enrutada; textos sueltos con "ganaderos" en `Noticias`) siguen pendientes de revisión y su vigencia para AquaRural debe confirmarse caso a caso al tocarlas.
- Sin testimonios, casos de estudio, cifras de recaudo real, ni prensa disponibles todavía — no fabricar evidencia de este tipo en trabajo de diseño futuro.

## Product Principles

1. **Aislamiento estricto entre asociaciones** — ninguna decisión de producto o de UI debe filtrar datos o configuración entre acueductos distintos.
2. **Simplicidad radical para el suscriptor final** — el usuario rural con poca experiencia tecnológica siempre tiene prioridad de simplicidad sobre el poder de features del panel admin.
3. **La confirmación de pago manda sobre la UI** — el estado mostrado al usuario y al admin debe reflejar la fuente de verdad de Wompi, nunca un estado optimista del cliente.
4. **Replicable, no a medida** — cada nueva funcionalidad debe pensarse como algo que cualquier asociación pueda activar/configurar (logo, color, nombre, tarifas), no como algo hardcodeado para un solo cliente.
5. **La contadora es un usuario indirecto pero real** — reportes y exportaciones deben ser confiables y completos aunque no tengan su propio login.

## Accessibility & Inclusion

Usuarios finales rurales con posible baja alfabetización digital y conectividad limitada: la interfaz del portal de suscriptor debe priorizarse por simplicidad y tolerancia a redes lentas sobre densidad de información. Sin requisito de accesibilidad formal (WCAG u otro estándar) confirmado aún.
