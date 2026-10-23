-- ─────────────────────────────────────────────────────────────────────────────
-- Agotamiento de ofertas con VARIOS rangos de fechas
--
-- Antes: tbl_oferta.fecha_hora (inicio) y tbl_oferta.fecha_hora_fin (fin), un
-- solo rango por oferta. Ahora cada oferta puede tener N rangos.
--
-- Ejecutar ANTES de desplegar el PHP.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tbl_oferta_agotada (
  id_tbl_oferta_agotada   INT(11)      NOT NULL AUTO_INCREMENT,
  id_tbl_oferta           INT(11)      NOT NULL,
  -- Un extremo NULL deja ese lado abierto: sin inicio = agotada desde siempre,
  -- sin fin = agotada indefinidamente. Es la misma regla del rango único.
  fecha_inicio            DATETIME     NULL DEFAULT NULL,
  fecha_fin               DATETIME     NULL DEFAULT NULL,
  comentario              VARCHAR(255) NULL DEFAULT NULL,
  -- Borrado lógico, como el resto del esquema (1 = vigente, 0 = eliminado).
  activo                  TINYINT(1)   NOT NULL DEFAULT 1,
  fecha_creacion          DATETIME     NULL DEFAULT NULL,
  id_tbl_usuario_creacion INT(11)      NULL DEFAULT NULL,
  PRIMARY KEY (id_tbl_oferta_agotada),
  KEY idx_oferta_agotada_oferta (id_tbl_oferta),
  KEY idx_oferta_agotada_rango (id_tbl_oferta, activo, fecha_inicio, fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ── Migración de los rangos que ya existen en tbl_oferta ─────────────────────
-- Cada oferta con fecha_hora o fecha_hora_fin pasa a ser su primer rango.
INSERT INTO tbl_oferta_agotada (id_tbl_oferta, fecha_inicio, fecha_fin, comentario, activo, fecha_creacion)
SELECT of.id_tbl_oferta,
       of.fecha_hora,
       of.fecha_hora_fin,
       'Migrado del rango único de tbl_oferta',
       1,
       NOW()
  FROM tbl_oferta of
 WHERE (of.fecha_hora IS NOT NULL OR of.fecha_hora_fin IS NOT NULL)
   AND NOT EXISTS (
        SELECT 1 FROM tbl_oferta_agotada ag
         WHERE ag.id_tbl_oferta = of.id_tbl_oferta
   );

-- ── Columnas antiguas ────────────────────────────────────────────────────────
-- NO se eliminan: el API las sigue publicando en el payload (fecha_hora /
-- fecha_hora_fin) con el rango vigente o el próximo, para que la app móvil y
-- cualquier cliente viejo sigan funcionando sin cambios. Ya no se leen de la
-- tabla tbl_oferta, así que se limpian para que no queden dos verdades.
UPDATE tbl_oferta
   SET fecha_hora = NULL,
       fecha_hora_fin = NULL
 WHERE fecha_hora IS NOT NULL
    OR fecha_hora_fin IS NOT NULL;

-- Verificación
-- SELECT o.id_tbl_oferta, COUNT(ag.id_tbl_oferta_agotada) rangos
--   FROM tbl_oferta o
--   LEFT JOIN tbl_oferta_agotada ag ON ag.id_tbl_oferta = o.id_tbl_oferta AND ag.activo = 1
--  GROUP BY o.id_tbl_oferta HAVING rangos > 0;
