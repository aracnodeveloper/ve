-- ============================================================================
--  tbl_solicitud_suscripcion
--  Solicitudes de suscripcion pagadas por transferencia / deposito.
--
--  Flujo:
--    1. El cliente llena sus datos, elige el producto y sube el comprobante.
--       -> se inserta la fila con is_active = 1 (pendiente).
--    2. Contabilidad revisa el comprobante en el administrador.
--    3. Aprobar  -> se crea la suscripcion con payload_json y se guarda
--                   id_tbl_suscripcion (is_active = 2).
--       Rechazar -> is_active = 3 + observacion.
--
--  is_active: 1 = Pendiente, 2 = Aprobada, 3 = Rechazada, 0 = Anulada
-- ============================================================================

CREATE TABLE IF NOT EXISTS tbl_solicitud_suscripcion (
    id_tbl_solicitud_suscripcion  INT(11)       NOT NULL AUTO_INCREMENT,
    codigo                        VARCHAR(20)   NOT NULL COMMENT 'Referencia visible: SOL-000123',

    -- ---------- datos personales (van a gestionarSuscripcion.personal) ----------
    ci                            VARCHAR(20)   NOT NULL,
    nombres                       VARCHAR(150)  NOT NULL,
    email                         VARCHAR(150)  NOT NULL,
    celular                       VARCHAR(50)            DEFAULT NULL,
    id_tbl_lugar                  INT(11)                DEFAULT NULL COMMENT 'ciudad',

    -- ---------- producto (van a gestionarSuscripcion.producto) ----------
    id_tbl_producto               INT(11)                DEFAULT NULL,
    id_tbl_prod_suscripcion       INT(11)                DEFAULT NULL,
    id_tbl_lista_precio_producto  INT(11)                DEFAULT NULL,
    titulo_producto               VARCHAR(200)           DEFAULT NULL,
    precio                        DECIMAL(10,2)          DEFAULT 0.00,

    -- ---------- codigo promocional / vendedor ----------
    id_tbl_codigo_promocional     INT(11)                DEFAULT NULL,
    codigo_promocional            VARCHAR(50)            DEFAULT NULL,
    id_usuario_vendedor           INT(11)                DEFAULT NULL,
    id_suscripcion_vendedor       INT(11)                DEFAULT NULL,
    beneficio_cantidad_tiempo     VARCHAR(10)            DEFAULT NULL,
    beneficio_tipo_tiempo         VARCHAR(10)            DEFAULT NULL,

    -- ---------- valores y comprobante ----------
    subtotal                      DECIMAL(10,2)          DEFAULT 0.00,
    iva                           DECIMAL(10,2)          DEFAULT 0.00,
    total                         DECIMAL(10,2)          DEFAULT 0.00,
    comprobante_url               VARCHAR(255)           DEFAULT NULL,
    banco_destino                 VARCHAR(100)           DEFAULT NULL,
    fecha_transferencia           DATE                   DEFAULT NULL,
    num_documento                 VARCHAR(50)            DEFAULT NULL,

    -- ---------- snapshot exacto para recrear la suscripcion ----------
    payload_json                  TEXT                   DEFAULT NULL,

    -- ---------- estado y resultado ----------
    is_active                     TINYINT(1)    NOT NULL DEFAULT 1 COMMENT '1 Pendiente, 2 Aprobada, 3 Rechazada, 0 Anulada',
    id_tbl_suscripcion            INT(11)                DEFAULT NULL COMMENT 'se llena al aprobar',
    id_suscripcion_renovacion     INT(11)                DEFAULT NULL COMMENT 'devuelto por gestionarSuscripcion',
    codigo_suscripcion            VARCHAR(50)            DEFAULT NULL COMMENT 'codigo de suscriptor creado',
    id_tbl_usuario                INT(11)                DEFAULT NULL,

    -- ---------- auditoria ----------
    created_at                    DATETIME               DEFAULT NULL,
    revisado_por                  INT(11)                DEFAULT NULL COMMENT 'id_tbl_usuario del admin',
    revisado_at                   DATETIME               DEFAULT NULL,
    observacion                   VARCHAR(255)           DEFAULT NULL,

    PRIMARY KEY (id_tbl_solicitud_suscripcion),
    UNIQUE KEY uq_codigo (codigo),
    KEY idx_estado (is_active),
    KEY idx_ci (ci),
    KEY idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
