-- =============================================================================
--  Categorías y subcategorías de los beneficios de cuenta madre
--
--  Dos catálogos, para que crecer no implique tocar código ni desplegar nada.
--
--  ALCANCE DE CADA FILA  (id_tbl_codigo_promocional)
--    NULL  -> catálogo general: lo ve y lo usa cualquier cuenta madre.
--             Lo cura administración; nadie lo edita desde la app.
--    <id>  -> la creó esa cuenta madre y solo ella la ve.
--
--  Se eligió así para que una marca pueda inventarse sus propias categorías sin
--  ensuciar el selector de las demás, y que a la vez exista un fondo común.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1) Categorías
-- -----------------------------------------------------------------------------
CREATE TABLE tbl_beneficio_categoria (

    id_tbl_beneficio_categoria INT(11) NOT NULL AUTO_INCREMENT,

    nombre VARCHAR(100) NOT NULL,

    id_tbl_codigo_promocional INT(11) NULL
        COMMENT 'NULL = catalogo general; con valor = propia de esa cuenta madre',

    orden SMALLINT(6) NOT NULL DEFAULT 0,
    id_tbl_activacion TINYINT(1) NOT NULL DEFAULT 1,

    id_usuario_registra INT(11) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_tbl_beneficio_categoria),

    -- Evita que una misma marca repita el nombre. OJO: en MySQL un UNIQUE con
    -- NULL admite repetidos, asi que esto NO protege al catalogo general; esas
    -- filas las controla administracion y el modelo valida antes de insertar.
    UNIQUE KEY uk_categoria_marca (id_tbl_codigo_promocional, nombre),
    INDEX idx_cat_activas (id_tbl_activacion, orden)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- -----------------------------------------------------------------------------
-- 2) Subcategorías: siempre cuelgan de una categoría
-- -----------------------------------------------------------------------------
CREATE TABLE tbl_beneficio_subcategoria (

    id_tbl_beneficio_subcategoria INT(11) NOT NULL AUTO_INCREMENT,

    id_tbl_beneficio_categoria INT(11) NOT NULL,

    nombre VARCHAR(100) NOT NULL,

    id_tbl_codigo_promocional INT(11) NULL
        COMMENT 'NULL = catalogo general; con valor = propia de esa cuenta madre',

    orden SMALLINT(6) NOT NULL DEFAULT 0,
    id_tbl_activacion TINYINT(1) NOT NULL DEFAULT 1,

    id_usuario_registra INT(11) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_tbl_beneficio_subcategoria),

    UNIQUE KEY uk_subcategoria_marca
        (id_tbl_beneficio_categoria, id_tbl_codigo_promocional, nombre),
    INDEX idx_sub_categoria (id_tbl_beneficio_categoria, id_tbl_activacion, orden)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- -----------------------------------------------------------------------------
-- 3) El beneficio apunta al catálogo
--    Las dos son opcionales: un beneficio puede quedarse sin clasificar, y la
--    subcategoria no tiene sentido sin su categoria (lo valida el modelo).
-- -----------------------------------------------------------------------------
ALTER TABLE tbl_beneficio_codigo_promocional
    ADD COLUMN id_tbl_beneficio_categoria INT(11) NULL
        AFTER id_tbl_lugar,
    ADD COLUMN id_tbl_beneficio_subcategoria INT(11) NULL
        AFTER id_tbl_beneficio_categoria,
    ADD INDEX idx_beneficio_categoria (id_tbl_beneficio_categoria),
    ADD INDEX idx_beneficio_subcategoria (id_tbl_beneficio_subcategoria);


-- -----------------------------------------------------------------------------
-- 4) Catálogo general inicial. Ajusta o amplía según el negocio: son solo un
--    punto de partida para que el selector no aparezca vacío.
-- -----------------------------------------------------------------------------
INSERT INTO tbl_beneficio_categoria (nombre, id_tbl_codigo_promocional, orden) VALUES
    ('Descuentos',   NULL, 1),
    ('Mantenimiento', NULL, 2),
    ('Accesorios',   NULL, 3),
    ('Servicios',    NULL, 4),
    ('Eventos',      NULL, 5);

INSERT INTO tbl_beneficio_subcategoria (id_tbl_beneficio_categoria, nombre, id_tbl_codigo_promocional, orden)
SELECT c.id_tbl_beneficio_categoria, s.nombre, NULL, s.orden
  FROM tbl_beneficio_categoria c
  JOIN (
        SELECT 'Descuentos'    AS cat, 'Primera compra'   AS nombre, 1 AS orden
  UNION SELECT 'Descuentos',          'Temporada',               2
  UNION SELECT 'Mantenimiento',       'Preventivo',              1
  UNION SELECT 'Mantenimiento',       'Correctivo',              2
  UNION SELECT 'Servicios',           'Asistencia en vía',       1
  UNION SELECT 'Servicios',           'Garantía extendida',      2
  ) s ON s.cat = c.nombre
 WHERE c.id_tbl_codigo_promocional IS NULL;


-- =============================================================================
--  CONSULTAS DE USO
-- =============================================================================

-- Catálogo visible para una cuenta madre: el general más el suyo.
-- SELECT id_tbl_beneficio_categoria id, nombre,
--        (id_tbl_codigo_promocional IS NULL) AS general
--   FROM tbl_beneficio_categoria
--  WHERE id_tbl_activacion = 1
--    AND (id_tbl_codigo_promocional IS NULL
--         OR id_tbl_codigo_promocional IN (<sus codigos>))
--  ORDER BY orden, nombre;
