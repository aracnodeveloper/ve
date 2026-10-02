-- =============================================================================
--  Historial de titulares del plan empresarial
--  Reutiliza tbl_usuario_notificacion.
--
--  Plan empresarial: una cuenta madre con 5 cuentas hijas (cada cuenta es una
--  suscripcion). El titular de cada cuenta hija puede cambiar (nombre, cedula,
--  correo, celular). Cada fila de esta tabla es UN titular durante UN periodo
--  de UNA cuenta hija, asi que al cambiarlo no se pierde quien estuvo antes.
--
--    titular vigente   -> fecha_fin IS NULL  (is_active = 1)
--    titular anterior  -> fecha_fin con fecha (is_active = 0)
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 0) VERIFICAR ANTES DE CORRER NADA
--    El paso 2 elimina columnas. Si esta consulta devuelve filas, la tabla SI
--    se esta usando en algun lado (el servidor tiene codigo que no esta en los
--    repositorios): no sigas y revisa primero que la llena.
-- -----------------------------------------------------------------------------
SELECT COUNT(*) AS filas FROM tbl_usuario_notificacion;


-- -----------------------------------------------------------------------------
-- 1) Respaldo (por si acaso, aunque este vacia)
-- -----------------------------------------------------------------------------
CREATE TABLE bkp_tbl_usuario_notificacion AS SELECT * FROM tbl_usuario_notificacion;


-- -----------------------------------------------------------------------------
-- 2) Quitar las columnas de notificaciones y agregar las del historial
-- -----------------------------------------------------------------------------
ALTER TABLE tbl_usuario_notificacion
    -- Columnas que ya no aplican
    DROP COLUMN id_tbl_estado_notificacion,
    DROP COLUMN id_tbl_notificacion,
    DROP COLUMN id_tbl_tipo_usuario,

    -- La PK se conserva; se asegura el autoincremento
    MODIFY COLUMN id_tbl_usuario_notificacion BIGINT(11) NOT NULL AUTO_INCREMENT,

    -- id_usuario se renombra al estandar de la base
    CHANGE COLUMN id_usuario id_tbl_usuario INT(11) NULL
        COMMENT 'Usuario de la cuenta hija',

    -- A que plan y a que cuenta pertenece este titular
    ADD COLUMN id_tbl_suscripcion_madre INT(11) NOT NULL
        COMMENT 'Suscripcion de la cuenta madre (plan empresarial)'
        AFTER id_tbl_usuario_notificacion,
    ADD COLUMN id_tbl_suscripcion INT(11) NOT NULL
        COMMENT 'Suscripcion de la cuenta hija'
        AFTER id_tbl_suscripcion_madre,
    ADD COLUMN orden TINYINT(2) NULL
        COMMENT 'Numero de cuenta dentro del plan (1 a 5)'
        AFTER id_tbl_suscripcion,

    -- Datos del titular en ese periodo
    ADD COLUMN nombres VARCHAR(150) NOT NULL AFTER id_tbl_usuario,
    ADD COLUMN ci_ruc  VARCHAR(20)  NOT NULL AFTER nombres,
    ADD COLUMN email   VARCHAR(150) NULL     AFTER ci_ruc,
    ADD COLUMN celular VARCHAR(20)  NULL     AFTER email,

    -- Periodo en que fue titular
    ADD COLUMN fecha_inicio DATETIME NOT NULL AFTER celular,
    ADD COLUMN fecha_fin    DATETIME NULL
        COMMENT 'NULL = titular vigente'
        AFTER fecha_inicio,
    ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1
        COMMENT '1 vigente, 0 reemplazado'
        AFTER fecha_fin,

    -- Auditoria del cambio
    ADD COLUMN motivo VARCHAR(255) NULL
        COMMENT 'Por que se reemplazo al titular'
        AFTER is_active,
    ADD COLUMN id_usuario_registra INT(11) NULL
        COMMENT 'Quien hizo el cambio (cuenta madre o administrador)'
        AFTER motivo,
    ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        AFTER id_usuario_registra,

    -- Consultas tipicas
    ADD INDEX idx_titular_vigente (id_tbl_suscripcion, is_active),
    ADD INDEX idx_plan (id_tbl_suscripcion_madre),
    ADD INDEX idx_ci (ci_ruc);


-- -----------------------------------------------------------------------------
-- 3) (Opcional, recomendado) Nombre que diga lo que guarda
--    El nombre actual habla de notificaciones y ya no las guarda. Si lo
--    renombras, hazlo ANTES de escribir el codigo que la usa.
-- -----------------------------------------------------------------------------
-- RENAME TABLE tbl_usuario_notificacion TO tbl_historial_titular;


-- =============================================================================
--  USO
-- =============================================================================

-- Alta de la cuenta hija: se registra su primer titular
-- INSERT INTO tbl_usuario_notificacion
--   (id_tbl_suscripcion_madre, id_tbl_suscripcion, orden, id_tbl_usuario,
--    nombres, ci_ruc, email, celular, fecha_inicio, id_usuario_registra)
-- VALUES (1000, 1001, 1, 5001, 'Juan Perez', '0102030405',
--         'juan@empresa.com', '0999999999', NOW(), 4000);

-- Cambio de titular: 1) se cierra el vigente  2) se inserta el nuevo
-- UPDATE tbl_usuario_notificacion
--    SET fecha_fin = NOW(), is_active = 0, motivo = 'Salio de la empresa'
--  WHERE id_tbl_suscripcion = 1001 AND is_active = 1;
-- INSERT INTO tbl_usuario_notificacion (...) VALUES (... datos del nuevo ..., NOW(), ...);

-- Titulares vigentes del plan
-- SELECT orden, nombres, ci_ruc, email, celular, fecha_inicio
--   FROM tbl_usuario_notificacion
--  WHERE id_tbl_suscripcion_madre = 1000 AND is_active = 1
--  ORDER BY orden;

-- Historia completa de una cuenta hija (quien estuvo y cuando)
-- SELECT nombres, ci_ruc, fecha_inicio, fecha_fin, motivo
--   FROM tbl_usuario_notificacion
--  WHERE id_tbl_suscripcion = 1001
--  ORDER BY fecha_inicio;
