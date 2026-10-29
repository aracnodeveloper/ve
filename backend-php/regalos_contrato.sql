-- =====================================================================================
-- Regalos por contrato
--
-- Un contrato puede incluir una cantidad de regalos (reservas sin costo para el
-- suscriptor). El contrato dice si aplica y cuántos tiene; cada reserva que es un
-- regalo se marca con Isaward. Contando esas reservas se sabe cuántos regalos
-- consumió cada contrato del establecimiento.
--
-- Las dos tablas son MyISAM: el ALTER bloquea la tabla mientras corre. Con
-- tbl_reserva_new (~141 mil filas) es rápido, pero conviene hacerlo fuera de hora pico.
-- =====================================================================================

-- 1) Contrato: si incluye regalos y cuántos.
--    BOOLEAN en MySQL es TINYINT(1), igual que `comisionable` en esta misma tabla.
--    Por defecto 0: los contratos existentes quedan sin regalos.
ALTER TABLE tbl_contrato
    ADD COLUMN aplica_regalo TINYINT(1) NOT NULL DEFAULT 0
        COMMENT '1 = el contrato incluye regalos (ver regalos)',
    ADD COLUMN regalos INT NOT NULL DEFAULT 0
        COMMENT 'cantidad de regalos que incluye el contrato';

-- 2) Reserva: si es un regalo. Las reservas existentes quedan como no regalo.
ALTER TABLE tbl_reserva_new
    ADD COLUMN Isaward TINYINT(1) NOT NULL DEFAULT 0
        COMMENT '1 = la reserva es un regalo y descuenta de los regalos del contrato';


-- =====================================================================================
-- Consumo de regalos por contrato
--
-- tbl_reserva_new no guarda el establecimiento: se toma de tbl_reserva_oferta. Una
-- reserva cuenta para el contrato del establecimiento que estaba vigente el día en que
-- se creó la reserva. Solo cuentan las pendientes (1) y confirmadas (2), como las numera el
-- administrador para tbl_reserva_new (Config.ESTADOS): no las canceladas (3) ni las cotizaciones (4). Una
-- reserva con varias ofertas cuenta como un solo regalo (COUNT DISTINCT).
-- =====================================================================================
SELECT c.id_tbl_contrato,
       c.id_tbl_establecimiento,
       c.fecha_ini,
       c.fecha_fin,
       c.regalos,
       COUNT(DISTINCT r.id_tbl_reserva)              AS regalos_consumidos,
       c.regalos - COUNT(DISTINCT r.id_tbl_reserva)  AS regalos_disponibles
FROM tbl_contrato c
LEFT JOIN (tbl_reserva_oferta ro
           JOIN tbl_reserva_new r
             ON r.id_tbl_reserva = ro.id_tbl_reserva
            AND r.Isaward = 1
            AND r.id_tbl_estado_reserva IN (1, 2))
       ON ro.id_tbl_establecimiento = c.id_tbl_establecimiento
      AND DATE(r.fecha_creacion) BETWEEN c.fecha_ini AND c.fecha_fin
WHERE c.aplica_regalo = 1
GROUP BY c.id_tbl_contrato
ORDER BY c.id_tbl_establecimiento, c.fecha_ini DESC;


-- =====================================================================================
-- Regalos disponibles HOY para un establecimiento (para validar antes de crear una
-- reserva marcada como regalo). Si no devuelve filas, el establecimiento no tiene un
-- contrato vigente con regalos.
-- =====================================================================================
SET @est := 440;

SELECT c.id_tbl_contrato,
       c.regalos,
       COUNT(DISTINCT r.id_tbl_reserva)              AS regalos_consumidos,
       c.regalos - COUNT(DISTINCT r.id_tbl_reserva)  AS regalos_disponibles
FROM tbl_contrato c
LEFT JOIN (tbl_reserva_oferta ro
           JOIN tbl_reserva_new r
             ON r.id_tbl_reserva = ro.id_tbl_reserva
            AND r.Isaward = 1
            AND r.id_tbl_estado_reserva IN (1, 2))
       ON ro.id_tbl_establecimiento = c.id_tbl_establecimiento
      AND DATE(r.fecha_creacion) BETWEEN c.fecha_ini AND c.fecha_fin
WHERE c.id_tbl_establecimiento = @est
  AND c.aplica_regalo = 1
  AND c.id_tbl_activacion = 1
  AND CURDATE() BETWEEN c.fecha_ini AND c.fecha_fin
GROUP BY c.id_tbl_contrato;


-- Para deshacer:
-- ALTER TABLE tbl_contrato DROP COLUMN aplica_regalo, DROP COLUMN regalos;
-- ALTER TABLE tbl_reserva_new DROP COLUMN Isaward;
