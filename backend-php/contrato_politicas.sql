-- ─────────────────────────────────────────────────────────────────────────────
-- Políticas de bono de producción y canje en el contrato (tbl_contrato)
--
-- BONO DE PRODUCCIÓN: superada la meta del contrato, el excedente se canjea en
--   noches para VisitaEcuador: por cada X noches vendidas sobre la meta → Y noches.
--   · aplica_meta = 0 anula la meta: el bono corre desde la primera noche.
--   · X = x_noches_gratis (ya existía) · Y = bono_noches (nuevo).
--
-- CANJE: valor que el hotel paga por pertenecer a la plataforma (USD), cobrado
--   en noches para no cobrar desmedidamente: por cada X noches producidas se
--   devengan Y noches del valor del canje.
--   · El VALOR en USD NO es una columna: ya se guarda como el pago tipo 8 «Canje»
--     de Negociación / Pagos (tbl_descarga.cantidad de la última tbl_carga del
--     kardex del contrato). Montos < $1 se consideran simbólicos (sin valor).
--   · aplica_valor_canje = 0 anula el valor en dinero (solo frecuencia en noches).
--   · X = x_noches_canje (ya existía) · Y = canje_noches (nuevo).
--
-- Los valores por defecto dejan a los contratos actuales igual que hoy
-- (meta activa, 1 noche por frecuencia).
--
-- Ejecutar ANTES de desplegar gestionarContrato.php / getDatosContrato.php /
-- getContratos.php (administrador/backend-php) y reportesDashboard.php.
--
-- MOTOR: MySQL — la base del PHP antiguo (apiv1.7), donde vive tbl_contrato.
-- NO ejecutar en la PostgreSQL de VE.Api: ahí falla con
-- 'syntax error at or near "COMMENT"' y, además, el PHP no lee esa base.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE tbl_contrato
  ADD COLUMN aplica_meta        TINYINT(1)  NOT NULL DEFAULT 1 COMMENT '1 = el bono aplica sobre la meta; 0 = sin meta (bono desde la 1a noche)',
  ADD COLUMN bono_noches        SMALLINT(5) NOT NULL DEFAULT 1 COMMENT 'Y: noches de bono por cada x_noches_gratis noches sobre la meta',
  ADD COLUMN aplica_valor_canje TINYINT(1)  NOT NULL DEFAULT 1 COMMENT '1 = el canje tiene valor en USD (pago tipo 8 Canje); 0 = canje solo por frecuencia',
  ADD COLUMN canje_noches       SMALLINT(5) NOT NULL DEFAULT 1 COMMENT 'Y: noches devengadas por cada x_noches_canje noches producidas';

-- Las frecuencias X (x_noches_gratis, x_noches_canje) eran TINYINT (máx. 127).
-- Se amplían para permitir frecuencias mayores; no cambia ningún valor existente.
ALTER TABLE tbl_contrato
  MODIFY COLUMN x_noches_gratis SMALLINT(5) NULL DEFAULT NULL,
  MODIFY COLUMN x_noches_canje  SMALLINT(5) NULL DEFAULT NULL;

-- ── Solo si YA ejecutaste la versión anterior de este script ─────────────────
-- (la que creaba la columna valor_canje). En ese caso los ALTER de arriba fallan
-- con "Duplicate column name" — no hace falta repetirlos; ejecuta solo esto:
--
-- ALTER TABLE tbl_contrato DROP COLUMN valor_canje;
