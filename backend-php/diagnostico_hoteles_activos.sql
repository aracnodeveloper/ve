-- ─────────────────────────────────────────────────────────────────────────────
-- Diagnóstico: hoteles activos HOY según el dashboard (Entrada vs salida de hoteles)
-- y en qué difieren del listado de establecimientos del administrador.
-- MOTOR: MySQL (base del PHP antiguo).
--
-- Regla del dashboard (2026-10-15): establecimiento aprobado (estado_modificacion = 3),
-- de tipo «Hoteles» (id_tbl_servicio = 25) y con un contrato ACTIVO (id_tbl_activacion = 1)
-- que cubre hoy. Debe dar el total del administrador (activos + por vencer).
--
-- Columnas para comparar con el administrador, que:
--   · mira solo el ÚLTIMO contrato de cada establecimiento     → es_ultimo_contrato
--   · exige ofertas de la empresa VisitaEcuador (id 1)          → ofertas_visitaecuador
--   · separa «activo» de «por vencer» (30 días)                 → por_vencer_30d
--   · no filtra por tipo de establecimiento                     → tipo
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) Detalle: un hotel por fila
SELECT
    e.id_tbl_establecimiento,
    i.titulo                                            AS hotel,
    s.descripcion_servicio                              AS tipo,
    ee.nombre_estado                                    AS estado_establecimiento,
    MAX(DATE(c.fecha_fin))                              AS contrato_vigente_hasta,
    IF(MAX(DATE(c.fecha_fin)) <= DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'si', 'no') AS por_vencer_30d,
    IF(MAX(c.id_tbl_contrato) = (SELECT MAX(c2.id_tbl_contrato) FROM tbl_contrato c2
                                 WHERE c2.id_tbl_establecimiento = e.id_tbl_establecimiento),
       'si', 'no')                                      AS es_ultimo_contrato,
    IF(EXISTS (SELECT 1 FROM tbl_oferta_empresa oe
               JOIN tbl_oferta o    ON o.id_tbl_oferta = oe.id_tbl_oferta
               JOIN tbl_producto p  ON p.id_tbl_producto = o.id_tbl_producto
               WHERE p.id_tbl_establecimiento = e.id_tbl_establecimiento
                 AND oe.id_tbl_empresa = 1),
       'si', 'no')                                      AS ofertas_visitaecuador
FROM tbl_contrato c
JOIN tbl_establecimiento e ON e.id_tbl_establecimiento = c.id_tbl_establecimiento
                          AND e.id_tbl_estado_modificacion = 3
JOIN tbl_info_indice i     ON i.id_tbl_info_indice = e.id_tbl_info_indice
                          AND i.id_tbl_servicio = 25            -- tipo «Hoteles»
LEFT JOIN tbl_servicio s   ON s.id_tbl_servicio = i.id_tbl_servicio
LEFT JOIN tbl_estado_establecimiento ee ON ee.id_tbl_estado_establecimiento = e.id_tbl_estado_establecimiento
WHERE c.id_tbl_activacion = 1
  AND CURDATE() BETWEEN DATE(c.fecha_ini) AND DATE(c.fecha_fin)
GROUP BY e.id_tbl_establecimiento, i.titulo, s.descripcion_servicio, ee.nombre_estado
ORDER BY tipo, hotel;


-- 2) Resumen: cuántos hoteles cumple cada criterio (para ver de dónde sale la diferencia)
SELECT
    tipo,
    COUNT(*)                                       AS total_dashboard,
    SUM(ofertas_visitaecuador = 'si')              AS con_ofertas_visitaecuador,
    SUM(es_ultimo_contrato = 'si')                 AS vigente_en_ultimo_contrato,
    SUM(por_vencer_30d = 'no')                     AS activos_sin_por_vencer
FROM (
    SELECT
        e.id_tbl_establecimiento,
        s.descripcion_servicio AS tipo,
        IF(MAX(DATE(c.fecha_fin)) <= DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'si', 'no') AS por_vencer_30d,
        IF(MAX(c.id_tbl_contrato) = (SELECT MAX(c2.id_tbl_contrato) FROM tbl_contrato c2
                                     WHERE c2.id_tbl_establecimiento = e.id_tbl_establecimiento),
           'si', 'no') AS es_ultimo_contrato,
        IF(EXISTS (SELECT 1 FROM tbl_oferta_empresa oe
                   JOIN tbl_oferta o    ON o.id_tbl_oferta = oe.id_tbl_oferta
                   JOIN tbl_producto p  ON p.id_tbl_producto = o.id_tbl_producto
                   WHERE p.id_tbl_establecimiento = e.id_tbl_establecimiento
                     AND oe.id_tbl_empresa = 1),
           'si', 'no') AS ofertas_visitaecuador
    FROM tbl_contrato c
    JOIN tbl_establecimiento e ON e.id_tbl_establecimiento = c.id_tbl_establecimiento
                              AND e.id_tbl_estado_modificacion = 3
    JOIN tbl_info_indice i     ON i.id_tbl_info_indice = e.id_tbl_info_indice
                              AND i.id_tbl_servicio = 25            -- tipo «Hoteles»
    LEFT JOIN tbl_servicio s   ON s.id_tbl_servicio = i.id_tbl_servicio
    WHERE c.id_tbl_activacion = 1
      AND CURDATE() BETWEEN DATE(c.fecha_ini) AND DATE(c.fecha_fin)
    GROUP BY e.id_tbl_establecimiento, s.descripcion_servicio
) t
GROUP BY tipo WITH ROLLUP;
