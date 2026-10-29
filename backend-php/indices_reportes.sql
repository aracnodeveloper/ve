-- ─────────────────────────────────────────────────────────────────────────────
-- Índices para los reportes del dashboard (y el resto de consultas sobre reservas)
-- MOTOR: MySQL (base del PHP antiguo). OPCIONAL pero recomendado.
--
-- Según el esquema, tbl_reserva_oferta (InnoDB, ~17 mil filas) y tbl_reserva_new
-- (MyISAM, ~141 mil filas) solo tienen la clave primaria. Toda consulta que una
-- reservas con su establecimiento o filtre por fecha de creación recorre la tabla
-- completa; el reporte de bono/canje llegó a tardar ~55 s por eso.
--
-- 1) Revisa primero si ya existen (el esquema que tengo puede estar desactualizado):
SHOW INDEX FROM tbl_reserva_oferta;
SHOW INDEX FROM tbl_reserva_new;

-- 2) Crea solo los que falten. tbl_reserva_new es MyISAM: el ALTER bloquea la tabla
--    unos segundos; mejor fuera de hora pico.
ALTER TABLE tbl_reserva_oferta
  ADD INDEX idx_ro_reserva (id_tbl_reserva),
  ADD INDEX idx_ro_establecimiento_fecha (id_tbl_establecimiento, fecha_inicio);

ALTER TABLE tbl_reserva_new
  ADD INDEX idx_rn_fecha_creacion (fecha_creacion),
  ADD INDEX idx_rn_cliente (id_tbl_usuario_cliente),
  ADD INDEX idx_rn_estado (id_tbl_estado_reserva);

-- Para deshacer:
-- ALTER TABLE tbl_reserva_oferta DROP INDEX idx_ro_reserva, DROP INDEX idx_ro_establecimiento_fecha;
-- ALTER TABLE tbl_reserva_new DROP INDEX idx_rn_fecha_creacion, DROP INDEX idx_rn_cliente, DROP INDEX idx_rn_estado;
