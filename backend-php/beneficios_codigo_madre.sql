-- =============================================================================
--  Beneficios / promociones de cuentas madre
--
--  Una cuenta madre es un codigo promocional (BYD, JETOUR, JARDINAZUAYO...).
--  Esta tabla guarda las promociones que esa marca quiere mostrar a SUS
--  suscriptores: cada fila es UNA promocion de UN codigo madre, vigente entre
--  dos fechas y opcionalmente limitada a un lugar.
--
--  La visibilidad del menu "Mis beneficios" NO se decide aqui: se decide con
--  el permiso 544, que se asigna por rol (ver seccion 2). Esta tabla solo dice
--  QUE se muestra; el permiso dice A QUIEN se le muestra el menu.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1) Tabla de promociones
-- -----------------------------------------------------------------------------
CREATE TABLE tbl_beneficio_codigo_promocional (

    id_tbl_beneficio_codigo_promocional INT(11) NOT NULL AUTO_INCREMENT,

    -- Conexion con el codigo madre. Se guarda el id, no el texto del codigo:
    -- el codigo se puede renombrar y las promociones no deben perderse.
    id_tbl_codigo_promocional INT(11) NOT NULL
        COMMENT 'Codigo madre dueno de la promocion (tbl_codigo_promocional)',

    titulo      VARCHAR(150) NOT NULL,
    descripcion TEXT         NULL,

    -- Solo el nombre del archivo, igual que el resto de imagenes de la base.
    -- La ruta base la arma el backend (urlimg), asi no queda el dominio escrito
    -- en los datos.
    imagen VARCHAR(255) NULL
        COMMENT 'Nombre del archivo; la ruta la arma el backend',

    link VARCHAR(500) NULL
        COMMENT 'URL a la que lleva la promocion. NULL = solo informativa',

    -- Vigencia. fecha_fin NULL = sin caducidad.
    fecha_inicio DATETIME NOT NULL,
    fecha_fin    DATETIME NULL
        COMMENT 'NULL = sin fecha de caducidad',

    -- NULL = aplica a todo el pais; con valor = solo en ese lugar.
    id_tbl_lugar INT(11) NULL
        COMMENT 'NULL = sin restriccion de lugar',

    orden SMALLINT(6) NOT NULL DEFAULT 0
        COMMENT 'Orden de aparicion; menor primero',

    -- Convencion de la base: 1 activo, 2 inactivo (igual que tbl_rol/tbl_permiso).
    id_tbl_activacion TINYINT(1) NOT NULL DEFAULT 1,

    id_usuario_registra INT(11) NULL
        COMMENT 'Quien creo o edito la promocion',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id_tbl_beneficio_codigo_promocional),

    -- La consulta de la app es siempre la misma: promociones vigentes y activas
    -- de MI codigo madre. Este indice la cubre entera.
    INDEX idx_vigentes (id_tbl_codigo_promocional, id_tbl_activacion, fecha_inicio, fecha_fin),
    INDEX idx_lugar (id_tbl_lugar)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- -----------------------------------------------------------------------------
-- 2) Permiso que controla la visibilidad del menu
--
--    544 cuelga de 409 ("Adicionales"), que es donde ya viven los otros menus
--    del perfil que se encienden por permiso: Packs (511), Giftcard (530),
--    Cliente prepago (531) y Ya Ganaste (532). El backend lo lee igual que
--    esos, con checkPermisoUsuario(544).
-- -----------------------------------------------------------------------------
INSERT INTO tbl_permiso
    (id_tbl_permiso, id_tbl_permisopadre, nombre, descripcion, vinculo,
     id_tbl_activacion, id_tbl_visible, orden)
VALUES
    (544, 409, 'Mis Beneficios',
     'Muestra el menu de beneficios de la cuenta madre en el perfil',
     '', 1, 1, 0);


-- -----------------------------------------------------------------------------
-- 3) Rol que se asigna a las cuentas madre
-- -----------------------------------------------------------------------------
INSERT INTO tbl_rol (id_tbl_rol, nombre, detalle, id_tbl_activacion)
VALUES (154, 'Cuenta Madre', 'Acceso al menu de beneficios de la cuenta madre', 1);


-- -----------------------------------------------------------------------------
-- 4) El rol 154 lleva el permiso 544.
--    Se agrega tambien al rol 8 ("Todos los permisos") para que administracion
--    pueda ver el menu sin tener que asignarse el rol de cuenta madre.
-- -----------------------------------------------------------------------------
INSERT INTO tbl_dtl_rol_permiso
    (id_tbl_dtl_rol_permiso, id_tbl_rol, id_tbl_permiso, id_tbl_activacion)
VALUES
    (51349, 154, 544, 1),
    (51350,   8, 544, 1);


-- =============================================================================
--  USO
-- =============================================================================

-- Asignar el rol a una cuenta madre. getPermisosUsuario() resuelve el permiso
-- con  tbl_rol_usuario ru JOIN tbl_dtl_rol_permiso dtl USING (id_tbl_rol),
-- asi que basta con dar de alta la fila en tbl_rol_usuario:
-- INSERT INTO tbl_rol_usuario (id_tbl_usuario, id_tbl_rol) VALUES (<usuario>, 154);

-- Alta de una promocion de BYD, solo en Cuenca, durante noviembre:
-- INSERT INTO tbl_beneficio_codigo_promocional
--   (id_tbl_codigo_promocional, titulo, descripcion, imagen, link,
--    fecha_inicio, fecha_fin, id_tbl_lugar, orden, id_usuario_registra)
-- VALUES
--   ((SELECT id_tbl_codigo_promocional FROM tbl_codigo_promocional WHERE codigo = 'BYD'),
--    'Mantenimiento gratis', 'Primer mantenimiento sin costo para suscriptores BYD.',
--    'byd_mantenimiento.jpg', 'https://byd.com.ec/promo',
--    '2026-11-01 00:00:00', '2026-11-30 23:59:59', 68, 0, NULL);

-- Lo que consulta la app: promociones vigentes del codigo madre del usuario.
-- SELECT b.id_tbl_beneficio_codigo_promocional, b.titulo, b.descripcion,
--        b.imagen, b.link, b.fecha_inicio, b.fecha_fin, b.id_tbl_lugar
--   FROM tbl_beneficio_codigo_promocional b
--  WHERE b.id_tbl_codigo_promocional = :idCodigoMadre
--    AND b.id_tbl_activacion = 1
--    AND NOW() >= b.fecha_inicio
--    AND (b.fecha_fin IS NULL OR NOW() <= b.fecha_fin)
--  ORDER BY b.orden, b.fecha_inicio DESC;
