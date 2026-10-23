-- =====================================================================================
-- ¿Por qué un establecimiento no aparece en la web?
--
-- La página del hotel, la barra de búsqueda (vista_ofertas_activas) y la portada solo
-- muestran establecimientos con al menos UNA oferta que cumpla todas estas condiciones.
-- Cada consulta revisa un grupo; en las columnas de chequeo, 1 = cumple y 0 = no cumple.
--
-- Cambiar los dos valores y correr todo el archivo.
-- =====================================================================================
SET @est      := 440;
SET @contrato := 2161;

-- 1) Contrato: tiene que estar vigente HOY y activado.
SELECT c.id_tbl_contrato,
       c.id_tbl_establecimiento,
       c.fecha_ini,
       c.fecha_fin,
       CURDATE() BETWEEN DATE(c.fecha_ini) AND DATE(c.fecha_fin) AS ok_vigente_hoy,
       c.id_tbl_activacion,
       c.id_tbl_activacion = 1                                    AS ok_activado
FROM tbl_contrato c
WHERE c.id_tbl_establecimiento = @est OR c.id_tbl_contrato = @contrato
ORDER BY c.fecha_fin DESC;

-- 2) Establecimiento: aprobado (estado de modificación 3) y su ficha activa, de tipo 1.
SELECT e.id_tbl_establecimiento,
       e.id_tbl_estado_modificacion,
       e.id_tbl_estado_modificacion = 3 AS ok_est_aprobado,
       e.id_tbl_info_indice             AS ficha_est,
       ii.titulo,
       ii.id_tbl_activacion = 1         AS ok_ficha_activa,
       ii.id_tbl_tipo_informacion = 1   AS ok_ficha_tipo
FROM tbl_establecimiento e
LEFT JOIN tbl_info_indice ii ON ii.id_tbl_info_indice = e.id_tbl_info_indice
WHERE e.id_tbl_establecimiento = @est;

-- 3) Ofertas: una fila por oferta con cada condición. Basta con que UNA tenga todo en 1.
SELECT o.id_tbl_oferta,
       prd.id_tbl_info_indice                                              AS ficha_oferta,
       io.titulo,
       o.fecha_inicio,
       o.fecha_fin,
       CURDATE() BETWEEN DATE(o.fecha_inicio) AND DATE(o.fecha_fin)        AS ok_fechas_hoy,
       o.id_tbl_activacion = 1                                             AS ok_oferta_activada,
       o.id_tbl_estado_modificacion                                        AS estado_mod,
       o.id_tbl_estado_modificacion = 3                                    AS ok_oferta_aprobada,
       o.id_tbl_tipo_beneficio_suscripcion                                 AS tipo_beneficio,
       o.id_tbl_tipo_beneficio_suscripcion IN (1, 2, 5, 7, 8, 9, 10, 12)   AS ok_tipo_beneficio,
       (SELECT GROUP_CONCAT(oe.id_tbl_empresa) FROM tbl_oferta_empresa oe
         WHERE oe.id_tbl_oferta = o.id_tbl_oferta)                         AS empresas,
       EXISTS (SELECT 1 FROM tbl_oferta_empresa oe
                WHERE oe.id_tbl_oferta = o.id_tbl_oferta AND oe.id_tbl_empresa = 1) AS ok_empresa_ve,
       io.id_tbl_activacion = 1                                            AS ok_ficha_activa,
       io.id_tbl_tipo_informacion = 2                                      AS ok_ficha_tipo,
       io.id_tbl_info_indice1 = e.id_tbl_info_indice                       AS ok_ficha_ligada_al_est,
       EXISTS (SELECT 1 FROM tbl_contenido_informacion ci
                WHERE ci.id_tbl_info_indice = io.id_tbl_info_indice)       AS ok_tiene_contenido,
       io.id_tbl_lugar                                                     AS lugar,
       EXISTS (SELECT 1 FROM tbl_lugar l JOIN tbl_lugar l2 ON l2.id_tbl_lugar = l.id_tbl_lugarpadre
                WHERE l.id_tbl_lugar = io.id_tbl_lugar)                    AS ok_lugar
FROM tbl_oferta o
JOIN tbl_producto prd       ON prd.id_tbl_producto = o.id_tbl_producto
JOIN tbl_establecimiento e  ON e.id_tbl_establecimiento = prd.id_tbl_establecimiento
LEFT JOIN tbl_info_indice io ON io.id_tbl_info_indice = prd.id_tbl_info_indice
WHERE prd.id_tbl_establecimiento = @est
ORDER BY o.fecha_fin DESC;

-- 4) Barra de búsqueda: si esto sale vacío, el establecimiento no aparece al buscarlo.
SELECT id_tbl_empresa, id_tbl_oferta, TituloOferta, fecha_inicio, fecha_fin
FROM vista_ofertas_activas
WHERE id_tbl_establecimiento = @est;

-- 5) Portada ("Nuestras ofertas"): además de lo anterior, la oferta tiene que estar cargada
--    como publicidad dirigida con objeto 30, tipo 1 o 3, sin eliminar y asignada a un servicio web.
SELECT pub.id_tbl_publicidad_dirigida,
       pub.id_tbl_info_indice,
       pub.id_tbl_objeto,
       pub.id_tbl_objeto = 30                   AS ok_objeto,
       pub.id_tbl_tipo_publicidad,
       pub.id_tbl_tipo_publicidad IN (1, 3)     AS ok_tipo,
       pub.eliminado,
       GROUP_CONCAT(wpd.id_tbl_servicio_web)   AS servicios_web
FROM tbl_publicidad_dirigida pub
LEFT JOIN tbl_servicio_web_publicidad_dirigida wpd USING (id_tbl_publicidad_dirigida)
WHERE pub.id_tbl_info_indice IN (SELECT id_tbl_info_indice FROM tbl_producto WHERE id_tbl_establecimiento = @est)
GROUP BY pub.id_tbl_publicidad_dirigida;
