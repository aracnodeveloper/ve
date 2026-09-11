-- ============================================================================
--  Columnas que se llenan al APROBAR una solicitud.
--  Ejecutar solo si la tabla se creo sin ellas.
--  Si ya existen, MySQL responde "Duplicate column name": se puede ignorar.
-- ============================================================================

ALTER TABLE tbl_solicitud_suscripcion
    ADD COLUMN id_suscripcion_renovacion INT(11) DEFAULT NULL COMMENT 'devuelto por gestionarSuscripcion'
    AFTER id_tbl_suscripcion;

ALTER TABLE tbl_solicitud_suscripcion
    ADD COLUMN codigo_suscripcion VARCHAR(50) DEFAULT NULL COMMENT 'codigo de suscriptor creado'
    AFTER id_suscripcion_renovacion;

-- Verificacion
-- SHOW COLUMNS FROM tbl_solicitud_suscripcion;
