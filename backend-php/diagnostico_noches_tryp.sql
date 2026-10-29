-- ─────────────────────────────────────────────────────────────────────────────
-- Cuadre de noches del Tryp By Wyndham Guayaquil (id_tbl_establecimiento = 364)
-- MOTOR: MySQL. Solo lectura.
--
-- Listado de reservas del admin (filtro por FECHA DE CREACIÓN 2026-01-16 → 2026-10-29):
--   161 confirmadas = 294 noches (suma de «# Paquetes»).
-- Dashboard «Beneficios de contratos» (por FECHA DE CHECK-IN dentro del contrato): 300.
-- Las mismas noches = DATEDIFF(fecha_fin, fecha_inicio) × habitaciones; la diferencia
-- solo puede venir de reservas que están en un lado y no en el otro.
-- ─────────────────────────────────────────────────────────────────────────────

SET @est := 364;
SET @crea_ini := '2026-01-16', @crea_fin := '2026-10-29';

-- Vigencia del contrato que usa el dashboard (contrato activo más reciente)
SELECT c.id_tbl_contrato, DATE(c.fecha_ini) AS ini, DATE(c.fecha_fin) AS fin
FROM tbl_contrato c
WHERE c.id_tbl_establecimiento = @est AND c.id_tbl_activacion = 1
ORDER BY c.fecha_ini DESC LIMIT 1
INTO @contrato, @ini, @fin;

SELECT @contrato AS contrato, @ini AS ini_contrato, @fin AS fin_contrato;

-- 1) Totales por los dos criterios (confirmadas)
SELECT
  SUM(CASE WHEN DATE(r.fecha_creacion) BETWEEN @crea_ini AND @crea_fin
           THEN DATEDIFF(ro.fecha_fin, ro.fecha_inicio) * GREATEST(ro.cantidad_ofertas, 1) END) AS noches_por_creacion,
  SUM(CASE WHEN DATE(ro.fecha_inicio) BETWEEN @ini AND @fin
           THEN DATEDIFF(ro.fecha_fin, ro.fecha_inicio) * GREATEST(ro.cantidad_ofertas, 1) END) AS noches_por_checkin
FROM tbl_reserva_oferta ro
JOIN tbl_reserva_new r ON r.id_tbl_reserva = ro.id_tbl_reserva
WHERE ro.id_tbl_establecimiento = @est AND r.id_tbl_estado_reserva = 2;

-- 2) Las reservas que explican la diferencia: cuentan en un criterio y no en el otro
SELECT r.id_tbl_reserva,
       DATE(r.fecha_creacion) AS creada,
       DATE(ro.fecha_inicio)  AS check_in,
       DATE(ro.fecha_fin)     AS check_out,
       ro.cantidad_ofertas    AS habitaciones,
       ro.forma_pago_oferta,
       DATEDIFF(ro.fecha_fin, ro.fecha_inicio) * GREATEST(ro.cantidad_ofertas, 1) AS noches,
       CASE WHEN DATE(ro.fecha_inicio) BETWEEN @ini AND @fin
            THEN 'solo dashboard (creada fuera del filtro del listado)'
            ELSE 'solo listado (check-in fuera del contrato)' END AS donde
FROM tbl_reserva_oferta ro
JOIN tbl_reserva_new r ON r.id_tbl_reserva = ro.id_tbl_reserva
WHERE ro.id_tbl_establecimiento = @est
  AND r.id_tbl_estado_reserva = 2
  AND (DATE(r.fecha_creacion) BETWEEN @crea_ini AND @crea_fin)
      <> (DATE(ro.fecha_inicio) BETWEEN @ini AND @fin)
ORDER BY r.id_tbl_reserva;
