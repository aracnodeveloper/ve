-- ─────────────────────────────────────────────────────────────────────────────
-- Diagnóstico: suscriptores activos HOY — ¿qué criterio da el número esperado?
-- MOTOR: MySQL (base del PHP antiguo).
--
-- El dashboard (acción «suscripciones») cuenta hoy la columna A:
--   USUARIOS distintos · solo empresa VisitaEcuador · renovación no anulada (4) ni
--   bloqueada (8) cuyo fecha_inicio–fecha_fin cubre hoy.
-- Las demás columnas cambian UN criterio a la vez.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) Variantes del conteo (una sola fila)
SELECT
    -- A: criterio actual del dashboard
    COUNT(DISTINCT CASE WHEN ve AND valida THEN usuario END)       AS A_usuarios_VE_validas,
    -- B: suscripciones en vez de usuarios
    COUNT(DISTINCT CASE WHEN ve AND valida THEN suscripcion END)   AS B_suscripciones_VE_validas,
    -- C: usuarios de TODAS las empresas
    COUNT(DISTINCT CASE WHEN valida THEN usuario END)              AS C_usuarios_todas_empresas,
    -- D: suscripciones de TODAS las empresas
    COUNT(DISTINCT CASE WHEN valida THEN suscripcion END)          AS D_suscripciones_todas_empresas,
    -- E: usuarios VE incluyendo renovaciones anuladas/bloqueadas
    COUNT(DISTINCT CASE WHEN ve THEN usuario END)                  AS E_usuarios_VE_con_anuladas,
    -- F: renovaciones (filas) VE válidas, sin agrupar
    SUM(ve AND valida)                                             AS F_renovaciones_VE_validas
FROM (
    SELECT
        s.id_tbl_usuario      AS usuario,
        s.id_tbl_suscripcion  AS suscripcion,
        (COALESCE(ps.id_tbl_empresa, sw.id_tbl_empresa, 1) = 1)             AS ve,
        (sr.id_tbl_estado_pago_suscripcion NOT IN (4, 8))                   AS valida
    FROM tbl_suscripcion_renovacion sr
    JOIN tbl_suscripcion s                  ON s.id_tbl_suscripcion = sr.id_tbl_suscripcion
    LEFT JOIN tbl_prod_suscripcion ps       ON ps.id_tbl_prod_suscripcion = sr.id_tbl_prod_suscripcion
    LEFT JOIN tbl_servicio_web sw           ON sw.id_tbl_servicio_web = ps.id_tbl_servicio_web
    WHERE sr.fecha_fin IS NOT NULL
      AND CURDATE() BETWEEN DATE(sr.fecha_inicio) AND DATE(sr.fecha_fin)
) t;


-- 2) Por la CABECERA de la suscripción (tbl_suscripcion), sin mirar renovaciones
SELECT
    COUNT(*)                                                    AS G_suscripciones_cabecera_vigentes,
    COUNT(DISTINCT s.id_tbl_usuario)                            AS G_usuarios_cabecera_vigentes,
    SUM(s.id_tbl_activacion = 1)                                AS G_cabecera_vigentes_y_activas
FROM tbl_suscripcion s
WHERE CURDATE() BETWEEN DATE(s.fecha_inicio) AND DATE(s.fecha_fin);


-- 3) Beneficiarios de cuentas empresariales (suscripción madre vigente)
SELECT COUNT(*) AS H_beneficiarios_activos
FROM tbl_usuario_notificacion b
WHERE b.is_active = 1
  AND EXISTS (SELECT 1 FROM tbl_suscripcion_renovacion sr
              WHERE sr.id_tbl_suscripcion = b.id_tbl_suscripcion_madre
                AND sr.id_tbl_estado_pago_suscripcion NOT IN (4, 8)
                AND CURDATE() BETWEEN DATE(sr.fecha_inicio) AND DATE(sr.fecha_fin));


-- 4) Desglose por empresa y estado de pago (usuarios distintos, vigentes hoy)
SELECT
    COALESCE(ps.id_tbl_empresa, sw.id_tbl_empresa, 1)        AS empresa,
    sr.id_tbl_estado_pago_suscripcion                         AS id_estado_pago,
    ep.nombre_estado_pago_suscripcion                         AS estado_pago,
    COUNT(DISTINCT s.id_tbl_usuario)                          AS usuarios,
    COUNT(DISTINCT s.id_tbl_suscripcion)                      AS suscripciones
FROM tbl_suscripcion_renovacion sr
JOIN tbl_suscripcion s                  ON s.id_tbl_suscripcion = sr.id_tbl_suscripcion
LEFT JOIN tbl_prod_suscripcion ps       ON ps.id_tbl_prod_suscripcion = sr.id_tbl_prod_suscripcion
LEFT JOIN tbl_servicio_web sw           ON sw.id_tbl_servicio_web = ps.id_tbl_servicio_web
LEFT JOIN tbl_estado_pago_suscripcion ep ON ep.id_tbl_estado_pago_suscripcion = sr.id_tbl_estado_pago_suscripcion
WHERE sr.fecha_fin IS NOT NULL
  AND CURDATE() BETWEEN DATE(sr.fecha_inicio) AND DATE(sr.fecha_fin)
GROUP BY empresa, sr.id_tbl_estado_pago_suscripcion, ep.nombre_estado_pago_suscripcion
ORDER BY empresa, usuarios DESC;
