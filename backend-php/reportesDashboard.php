<?php
/**
 * Métricas del dashboard (bloques Hoteles y Reservas).
 *
 * Desplegar junto a getReporteReservas.php (apiv1.7/reportes/), queda publicado en
 *   POST /v1.7/rep/reportesDashboard/
 *
 * Parámetros POST:
 *   accion        "hoteles_flujo" | "hoteles_interanual" | "produccion_contratos" | "reservas_hoteles"
 *                 | "certificados_establecimiento" | "mapa_calor" | "suscripciones"
 *   fecha_inicio  "YYYY-MM-DD" (requerido)
 *   fecha_fin     "YYYY-MM-DD" (requerido)
 *   agrupar       "d" | "m" (default) | "a"   — reservas_hoteles y certificados_establecimiento
 *   anio_comparar año contra el que se compara  — hoteles_interanual (año principal = año de fecha_inicio)
 *
 * Definiciones:
 *   · TODAS las métricas son solo de hoteles: establecimientos de tipo «Hoteles»
 *     (tbl_info_indice.id_tbl_servicio = 25) — ver RD_SERVICIOS_HOTEL y rd_esHotel().
 *     Para entradas/salidas y contratos además deben estar aprobados (id_tbl_estado_modificacion = 3).
 *   · Hotel activo en una fecha = tiene un contrato ACTIVO (id_tbl_activacion = 1) cuyo
 *     fecha_ini–fecha_fin la cubre. Para entradas/salidas, contratos separados por <= 31 días
 *     se consideran continuos (renovación), pero el hueco no cuenta como activo.
 *     «Por vencer» = activo cuyo último contrato vence en <= 30 días (sigue contando como activo).
 *     Entrada = inicio de un tramo continuo (nuevo o reingreso). Salida = fin de un tramo ya vencido.
 *   · Reservas: tbl_reserva_new + tbl_reserva_oferta. 1 Pendiente · 2 Confirmada · 3 Cancelada
 *     (4 Cotización queda fuera).
 *     Período medido por r.fecha_creacion.
 *   · Noches producidas = noches × habitaciones de TODAS las reservas confirmadas con check-in
 *     dentro del contrato (cualquier forma de pago, regalos incluidos — decisión del usuario 2026-10-30).
 *     Noches históricas = como el listado del administrador: todas las confirmadas del hotel desde
 *     siempre, sin multiplicar por habitaciones (solo para cuadrar).
 *   · Bono de producción: superada la meta (noches_gratis_meta), por cada x_noches_gratis noches
 *     adicionales → bono_noches noches. aplica_meta = 0 anula la meta (desde la 1a noche).
 *     Usadas = noches confirmadas con forma_pago_oferta = 1.
 *   · Canje: por cada x_noches_canje noches producidas se devengan canje_noches noches. Con
 *     aplica_valor_canje = 1, se devenga hasta cubrir el valor (USD) al precio promedio por noche.
 *     El valor es el pago tipo 8 «Canje» de Negociación/Pagos del contrato (última tbl_carga).
 *     Usadas = forma_pago 2 y 3. Requiere contrato_politicas.sql.
 *   · Regalos (regalos_contrato.sql, opcional): el contrato incluye `regalos` reservas sin costo
 *     (aplica_regalo = 1). Consumido = reserva Isaward = 1 pendiente (1) o confirmada (2) del
 *     hotel creada en la vigencia del contrato. Las reservas regalo SÍ cuentan como producción.
 *   · Mapa de calor: demanda por provincia/ciudad/establecimiento. Solicitados = reservas creadas
 *     (pendiente, confirmada, cancelada) + certificados generados. Consumidos = reservas confirmadas
 *     + certificados usados. Ubicación = tbl_info_indice del establecimiento (lugar y lat/long).
 *   · Certificados: tbl_certificado tipo 1. is_active 1 Activo · 2 Usado · 0 Anulado.
 *     Se omiten los generados por los usuarios de RD_USUARIOS_CERT_EXCLUIDOS (412).
 */

ob_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
header('Access-Control-Allow-Headers: *');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include('configuraciones.php');

// Tipo de establecimiento (tbl_info_indice.id_tbl_servicio → tbl_servicio) que cuenta como hotel.
// Decisión del usuario 2026-10-15: SOLO el tipo «Hoteles» (25). Quedan fuera Haciendas, Hosterías,
// Cabañas, Resort, SPA, Hoteles Residenciales (87), Hotel Apartamento (24), Apartamento Hotel (98).
const RD_SERVICIOS_HOTEL = '25';
const RD_DIAS_POR_VENCER = 30;          // igual que el listado de establecimientos del administrador
const RD_DIAS_RENOVACION = 31;
const RD_TIPO_PAGO_CANJE = 8;          // tbl_tipo_pago «Canje»: el valor del canje del contrato
const RD_CANJE_MINIMO = 1;              // montos menores son simbólicos (se cargaba 0.01)
const RD_TIPO_LUGAR_CIUDAD = 4;          // tbl_lugar.id_tbl_tipo_lugar de las ciudades
const RD_TIPO_DIRECTORIO_EXPRESS = 38;  // cuenta express (creada por el flujo express)
const RD_METODO_EXPRESS = 45;           // tbl_metodo_servicio «express» (Config.IDMETODO_EXPRESS)
const RD_EXPRESS_HORAS_ANTES = 24;      // ingreso express hasta 24 h antes de crear la reserva
const RD_EMPRESA_VE = 1;                 // tbl_empresa VisitaEcuador (2 FullVacations, 3 SuViajeYa)
const RD_PAGOS_SUSCRIPCION_INVALIDOS = '4, 8'; // renovación anulada / bloqueada (como el administrador)
const RD_ESTADOS_RESERVA = '1, 2, 3';   // 4 = cotización, no es reserva
const RD_USUARIOS_CERT_EXCLUIDOS = '412'; // certificados generados por estos usuarios no cuentan

/** Mismo patrón que la clase Reportes (reportes.php): Model con conexión propia. */
class ReportesDashboard extends Model
{
    function __construct()
    {
        $this->connect_db();
    }
}

try {

    if ($_SERVER['REQUEST_METHOD'] != 'POST')
        throw new Exception("Método de conexión equivocado", 1004);

    $post = json_decode(file_get_contents("php://input"), true);
    if (!$post)
        throw new Exception("No existen parámetros", 1001);

    $inicio = rd_fecha($post['fecha_inicio'] ?? '');
    $fin    = rd_fecha($post['fecha_fin'] ?? '');
    if (!$inicio || !$fin)
        throw new Exception("Se requiere fecha_inicio y fecha_fin (YYYY-MM-DD)", 1002);
    if ($inicio > $fin)
        throw new Exception("fecha_inicio no puede ser mayor que fecha_fin", 1003);

    $agrupar = in_array($post['agrupar'] ?? '', array('d', 'm', 'a')) ? $post['agrupar'] : 'm';

    $model = new ReportesDashboard();

    switch ($post['accion'] ?? '') {
        case 'hoteles_flujo':
            $data = rd_hotelesFlujo($model, $inicio, $fin);
            break;
        case 'hoteles_interanual':
            // Año principal = año de fecha_inicio; anio_comparar por defecto el anterior
            $anio = intval(substr($inicio, 0, 4));
            $anioComp = intval($post['anio_comparar'] ?? 0);
            if ($anioComp < 2000 || $anioComp > 2100 || $anioComp == $anio)
                $anioComp = $anio - 1;
            $data = rd_hotelesInteranual($model, $anio, $anioComp);
            break;
        case 'produccion_contratos':
            $data = rd_produccionContratos($model, $inicio, $fin);
            break;
        case 'reservas_hoteles':
        case 'reservas_canceladas':   // nombre anterior (misma respuesta, ampliada)
            $data = rd_reservasHoteles($model, $inicio, $fin, $agrupar);
            break;
        case 'certificados_establecimiento':
            $data = rd_certificadosEstablecimiento($model, $inicio, $fin, $agrupar);
            break;
        case 'suscripciones':
            $data = rd_suscripciones($model, $inicio, $fin, $agrupar);
            break;
        case 'mapa_calor':
            $data = rd_mapaCalor($model, $inicio, $fin);
            break;
        default:
            throw new Exception("Acción no soportada", 1005);
    }

    ob_clean();
    echo json_encode(
        array('estado' => true, 'codigo' => 0, 'data' => $data),
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

} catch (Exception $e) {
    ob_clean();
    echo json_encode(
        array('estado' => false, 'codigo' => $e->getCode(), 'msj' => $e->getMessage()),
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
}


// ─── Utilidades ──────────────────────────────────────────────────────────────

function rd_fecha($valor)
{
    $valor = substr(trim((string) $valor), 0, 10);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $valor))
        return null;
    list($a, $m, $d) = array_map('intval', explode('-', $valor));
    return checkdate($m, $d, $a) ? $valor : null;
}

function rd_find($model, $campos)
{
    $res = $model->find('all', $campos);
    return $res ? array_map('rd_utf8', $res) : array();
}

/** La BD es latin1 (reportes.php hace utf8_encode); sin esto json_encode falla con tildes. */
function rd_utf8($fila)
{
    foreach ($fila as $k => $v)
        if (is_string($v) && !preg_match('//u', $v))
            $fila[$k] = function_exists('mb_convert_encoding') ? mb_convert_encoding($v, 'UTF-8', 'ISO-8859-1') : utf8_encode($v);
    return $fila;
}

function rd_dias($desde, $hasta)
{
    return intval(round((strtotime($hasta) - strtotime($desde)) / 86400));
}

function rd_sumarDias($fecha, $dias)
{
    return date('Y-m-d', strtotime($fecha . ' ' . ($dias >= 0 ? '+' : '') . $dias . ' days'));
}

function rd_periodo($fecha, $agrupar)
{
    if ($agrupar == 'd') return substr($fecha, 0, 10);
    if ($agrupar == 'a') return substr($fecha, 0, 4);
    return substr($fecha, 0, 7);
}

/** Lista de períodos consecutivos entre dos fechas, para que la serie no tenga huecos. */
function rd_periodos($inicio, $fin, $agrupar)
{
    $lista = array();
    $paso  = $agrupar == 'd' ? '+1 day' : ($agrupar == 'a' ? '+1 year' : '+1 month');
    $f     = $agrupar == 'd' ? $inicio : ($agrupar == 'a' ? substr($inicio, 0, 4) . '-01-01' : substr($inicio, 0, 7) . '-01');
    $tope  = 0;
    while ($f <= $fin && $tope++ < 1000) {
        $lista[] = rd_periodo($f, $agrupar);
        $f = date('Y-m-d', strtotime($f . ' ' . $paso));
    }
    return $lista;
}

/** Condición SQL "es hotel" (alojamiento) sobre el alias de tbl_info_indice del establecimiento. */
function rd_esHotel($alias)
{
    return $alias . '.id_tbl_servicio in (' . RD_SERVICIOS_HOTEL . ')';
}

function rd_hotelFrom()
{
    return 'tbl_contrato c
            join tbl_establecimiento e on e.id_tbl_establecimiento = c.id_tbl_establecimiento
                                      and e.id_tbl_estado_modificacion = 3
            join tbl_info_indice i     on i.id_tbl_info_indice = e.id_tbl_info_indice
            left outer join tbl_lugar lug  on lug.id_tbl_lugar = i.id_tbl_lugar
            left outer join tbl_lugar prov on prov.id_tbl_lugar = lug.id_tbl_lugarpadre';
}


// ─── Entrada vs salida de hoteles ────────────────────────────────────────────

/**
 * Tramos continuos de contrato por establecimiento aprobado (contratos separados por
 * <= RD_DIAS_RENOVACION días se unen). Solo hoteles.
 */
function rd_tramosEstablecimientos($model)
{
    $contratos = rd_find($model, array(
        'select' => 'c.id_tbl_establecimiento, DATE(c.fecha_ini) as ini, DATE(c.fecha_fin) as fin,
                     i.titulo, lug.desc_lugar as ciudad, prov.desc_lugar as provincia',
        'from'   => rd_hotelFrom(),
        'where'  => rd_esHotel('i') . '
                     and c.id_tbl_activacion = 1
                     and c.fecha_ini is not null and c.fecha_fin is not null
                     and DATE(c.fecha_fin) >= DATE(c.fecha_ini)',
        'order'  => 'c.id_tbl_establecimiento, c.fecha_ini',
    ));

    $hoteles = array();
    foreach ($contratos as $c) {
        $id = intval($c['id_tbl_establecimiento']);
        if (!isset($hoteles[$id]))
            $hoteles[$id] = array('hotel' => $c['titulo'], 'ciudad' => $c['ciudad'], 'provincia' => $c['provincia'],
                                  'tramos' => array(), 'contratos' => array());

        // Contratos tal cual: para «activo en una fecha» (sin puentear huecos de renovación)
        $hoteles[$id]['contratos'][] = array('ini' => $c['ini'], 'fin' => $c['fin']);

        $tramos = &$hoteles[$id]['tramos'];
        $n = count($tramos);
        if ($n && rd_dias($tramos[$n - 1]['fin'], $c['ini']) <= RD_DIAS_RENOVACION) {
            if ($c['fin'] > $tramos[$n - 1]['fin'])
                $tramos[$n - 1]['fin'] = $c['fin'];
        } else {
            $tramos[] = array('ini' => $c['ini'], 'fin' => $c['fin']);
        }
        unset($tramos);
    }
    return $hoteles;
}

/**
 * Activo en una fecha = algún contrato activo la cubre. Se mira el contrato real, no el
 * tramo: el tramo une contratos separados <= 31 días (para no contar una renovación como
 * salida + entrada), y en ese hueco el hotel NO tiene contrato vigente.
 */
function rd_activoEn($hotel, $fecha)
{
    foreach ($hotel['contratos'] as $c)
        if ($c['ini'] <= $fecha && $c['fin'] >= $fecha) return true;
    return false;
}

function rd_hotelesFlujo($model, $inicio, $fin)
{
    $hoy = date('Y-m-d');
    $hoteles = rd_tramosEstablecimientos($model);

    $periodos = rd_periodos($inicio, $fin, 'm');
    $serie = array();
    foreach ($periodos as $p) {
        $corte = date('Y-m-t', strtotime($p . '-01'));
        $serie[$p] = array('periodo' => $p, 'nuevos' => 0, 'reingresos' => 0, 'entradas' => 0,
                           'salidas' => 0, 'neto' => 0, 'activos' => 0, 'corte' => min($corte, $hoy));
    }

    $entradas = array();
    $salidas  = array();
    $porVencer = array();
    $activosInicio = 0;
    $activosFin = 0;
    $activosFinPorVencer = 0;
    $corteFin = min($fin, $hoy);

    foreach ($hoteles as $id => $h) {
        $base = array('id_establecimiento' => $id, 'hotel' => $h['hotel'], 'ciudad' => $h['ciudad'], 'provincia' => $h['provincia']);
        $activoInicio = rd_activoEn($h, $inicio);
        $activoFin = rd_activoEn($h, $corteFin);
        foreach ($serie as $p => $s)
            if (rd_activoEn($h, $s['corte']))
                $serie[$p]['activos']++;

        foreach ($h['tramos'] as $idx => $t) {
            if ($t['ini'] >= $inicio && $t['ini'] <= $fin) {
                $tipo = $idx == 0 ? 'nuevo' : 'reingreso';
                $p = substr($t['ini'], 0, 7);
                if (isset($serie[$p])) {
                    $serie[$p][$tipo == 'nuevo' ? 'nuevos' : 'reingresos']++;
                    $serie[$p]['entradas']++;
                }
                $entradas[] = $base + array('fecha' => $t['ini'], 'tipo' => $tipo);
            }

            if ($t['fin'] < $hoy && $t['fin'] >= $inicio && $t['fin'] <= $fin) {
                $p = substr($t['fin'], 0, 7);
                if (isset($serie[$p]))
                    $serie[$p]['salidas']++;
                $salidas[] = $base + array('fecha' => $t['fin'], 'meses_activo' => max(1, round(rd_dias($t['ini'], $t['fin']) / 30.4)));
            }
        }

        $ultimo = end($h['tramos']);
        if ($ultimo['fin'] >= $hoy && $ultimo['fin'] <= rd_sumarDias($hoy, 60))
            $porVencer[] = $base + array('fecha' => $ultimo['fin'], 'dias_restantes' => rd_dias($hoy, $ultimo['fin']));

        if ($activoInicio) $activosInicio++;
        if ($activoFin) {
            $activosFin++;
            // «Por vencer» como en el administrador: su último contrato vence en <= 30 días
            $ultimoFin = max(array_column($h['contratos'], 'fin'));
            if ($ultimoFin <= rd_sumarDias($corteFin, RD_DIAS_POR_VENCER)) $activosFinPorVencer++;
        }
    }

    foreach ($serie as $p => $s) {
        $serie[$p]['neto'] = $s['entradas'] - $s['salidas'];
        unset($serie[$p]['corte']);
    }

    usort($entradas, function ($a, $b) { return strcmp($b['fecha'], $a['fecha']); });
    usort($salidas, function ($a, $b) { return strcmp($b['fecha'], $a['fecha']); });
    usort($porVencer, function ($a, $b) { return $a['dias_restantes'] - $b['dias_restantes']; });

    return array(
        'resumen' => array(
            'activos_inicio' => $activosInicio,
            'activos_fin'    => $activosFin,
            'activos_fin_por_vencer' => $activosFinPorVencer,
            'entradas'       => count($entradas),
            'nuevos'         => count(array_filter($entradas, function ($e) { return $e['tipo'] == 'nuevo'; })),
            'salidas'        => count($salidas),
            'neto'           => count($entradas) - count($salidas),
            'por_vencer'     => count($porVencer),
        ),
        'serie'      => array_values($serie),
        'entradas'   => $entradas,
        'salidas'    => $salidas,
        'por_vencer' => $porVencer,
    );
}


// ─── Entradas y salidas mes a mes: año vs año ────────────────────────────────

/** Último mes con datos de un año: 12 si ya pasó, el mes actual si es el año en curso, 0 si es futuro. */
function rd_ultimoMes($anio)
{
    $actual = intval(date('Y'));
    return $anio < $actual ? 12 : ($anio == $actual ? intval(date('n')) : 0);
}

/** 12 meses de un año: entradas (nuevos/reingresos), salidas y activos al cierre. Meses futuros = null. */
function rd_flujoAnual($hoteles, $anio)
{
    $hoy = date('Y-m-d');
    $ultimo = rd_ultimoMes($anio);
    $meses = array();
    for ($m = 1; $m <= 12; $m++) {
        if ($m > $ultimo) { $meses[$m] = null; continue; }
        $corte = min(date('Y-m-t', mktime(0, 0, 0, $m, 1, $anio)), $hoy);
        $meses[$m] = array('nuevos' => 0, 'reingresos' => 0, 'entradas' => 0, 'salidas' => 0, 'neto' => 0, 'activos' => 0, 'corte' => $corte);
    }

    foreach ($hoteles as $h) {
        foreach ($meses as $m => $s)
            if ($s && rd_activoEn($h, $s['corte']))
                $meses[$m]['activos']++;

        foreach ($h['tramos'] as $idx => $t) {
            if (intval(substr($t['ini'], 0, 4)) == $anio) {
                $m = intval(substr($t['ini'], 5, 2));
                if ($meses[$m]) {
                    $meses[$m][$idx == 0 ? 'nuevos' : 'reingresos']++;
                    $meses[$m]['entradas']++;
                }
            }
            if ($t['fin'] < $hoy && intval(substr($t['fin'], 0, 4)) == $anio) {
                $m = intval(substr($t['fin'], 5, 2));
                if ($meses[$m]) $meses[$m]['salidas']++;
            }
        }
    }

    foreach ($meses as $m => $s)
        if ($s) {
            $meses[$m]['neto'] = $s['entradas'] - $s['salidas'];
            unset($meses[$m]['corte']);
        }
    return $meses;
}

function rd_hotelesInteranual($model, $anio, $anioComp)
{
    $hoteles = rd_tramosEstablecimientos($model);
    $a = rd_flujoAnual($hoteles, $anio);
    $b = rd_flujoAnual($hoteles, $anioComp);

    // Acumulado comparable: mismos meses en ambos años (si uno es el año en curso, hasta el mes actual)
    $comparables = min(rd_ultimoMes($anio), rd_ultimoMes($anioComp));
    $acumular = function ($serie) use ($comparables) {
        $t = array('entradas' => 0, 'nuevos' => 0, 'reingresos' => 0, 'salidas' => 0, 'neto' => 0, 'activos_cierre' => 0);
        for ($m = 1; $m <= $comparables; $m++) {
            foreach (array('entradas', 'nuevos', 'reingresos', 'salidas', 'neto') as $k)
                $t[$k] += $serie[$m][$k];
            $t['activos_cierre'] = $serie[$m]['activos'];
        }
        return $t;
    };

    $meses = array();
    for ($m = 1; $m <= 12; $m++)
        $meses[] = array('mes' => $m, 'actual' => $a[$m], 'comparado' => $b[$m]);

    return array(
        'anio'              => $anio,
        'anio_comparar'     => $anioComp,
        'meses_comparables' => $comparables,
        'mes_en_curso'      => ($anio == intval(date('Y')) || $anioComp == intval(date('Y'))) ? intval(date('n')) : null,
        'resumen'           => array('actual' => $acumular($a), 'comparado' => $acumular($b)),
        'meses'             => $meses,
    );
}


// ─── Bono de producción y frecuencia de canje (por contrato) ─────────────────

/**
 * true si ya se corrió regalos_contrato.sql (tbl_contrato.aplica_regalo / regalos y
 * tbl_reserva_new.Isaward). Misma comprobación que fn_regalosContrato.php del administrador:
 * sin las columnas, nombrarlas rompería la consulta entera.
 */
function rd_regalosHabilitados($model)
{
    static $habilitados = null;
    if ($habilitados !== null) return $habilitados;
    $f = rd_find($model, array(
        'select' => 'COUNT(*) as n',
        'from'   => 'information_schema.columns',
        'where'  => "table_schema = DATABASE() AND (
                        (table_name = 'tbl_contrato' AND column_name IN ('aplica_regalo', 'regalos'))
                     OR (table_name = 'tbl_reserva_new' AND column_name = 'Isaward'))",
    ));
    $habilitados = $f && intval($f[0]['n']) === 3;
    return $habilitados;
}

function rd_produccionContratos($model, $inicio, $fin)
{
    $conRegalos = rd_regalosHabilitados($model);

    // 1) Contratos (sin unir reservas). tbl_reserva_oferta no tiene índice por establecimiento:
    //    unirla a cada contrato (más 5 subconsultas de regalos) tardaba ~55 s y el navegador cortaba
    //    la conexión. Las reservas se leen aparte en UNA pasada y se reparten en PHP (paso 2).
    $filas = rd_find($model, array(
        'select' => 'c.id_tbl_contrato, c.id_tbl_establecimiento, DATE(c.fecha_ini) as fecha_ini, DATE(c.fecha_fin) as fecha_fin,
                     c.noches_gratis_meta, c.x_noches_gratis, c.x_noches_canje,
                     c.aplica_meta, c.bono_noches, c.aplica_valor_canje, c.canje_noches' . ($conRegalos ? ', c.aplica_regalo, c.regalos' : '') . ',
                     (SELECT SUM(des.cantidad) FROM tbl_descarga des
                       WHERE des.id_tbl_tipo_pago = ' . RD_TIPO_PAGO_CANJE . '
                         AND des.id_tbl_carga = (SELECT MAX(car.id_tbl_carga) FROM tbl_carga car
                                                 WHERE car.id_tbl_cab_kardex = c.id_tbl_cab_kardex
                                                   AND car.id_tbl_movimiento = c.id_tbl_movimiento)) as valor_canje,
                     i.titulo, lug.desc_lugar as ciudad, prov.desc_lugar as provincia',
        'from'   => rd_hotelFrom(),
        'where'  => rd_esHotel('i') . ' and c.id_tbl_activacion = 1
                     and DATE(c.fecha_ini) <= "' . $fin . '" and DATE(c.fecha_fin) >= "' . $inicio . '"
                     and (c.x_noches_gratis > 0 or c.x_noches_canje > 0' . ($conRegalos ? ' or c.aplica_regalo = 1' : '') . ')',
    ));

    // 2) Líneas de reserva de esos hoteles: confirmadas (producción, bono/canje usados) y, si hay
    //    regalos, todas las marcadas Isaward. Una sola lectura de tbl_reserva_oferta.
    $porHotel = array();
    $historico = array();
    if ($filas) {
        $ests   = array_values(array_unique(array_map('intval', array_column($filas, 'id_tbl_establecimiento'))));
        $desde  = min(array_column($filas, 'fecha_ini'));
        $lineas = rd_find($model, array(
            'select' => 'ro.id_tbl_establecimiento as est, ro.id_tbl_reserva as id, DATE(ro.fecha_inicio) as ini,
                         DATE(r.fecha_creacion) as creada, r.id_tbl_estado_reserva as estado, ro.forma_pago_oferta as forma,
                         ' . ($conRegalos ? 'r.Isaward' : '0') . ' as regalo,
                         DATEDIFF(ro.fecha_fin, ro.fecha_inicio) * GREATEST(ro.cantidad_ofertas, 1) as noches,
                         ro.precio_total as precio',
            'from'   => 'tbl_reserva_oferta ro join tbl_reserva_new r on r.id_tbl_reserva = ro.id_tbl_reserva',
            'where'  => 'ro.id_tbl_establecimiento in (' . implode(',', $ests) . ')
                         and (DATE(ro.fecha_inicio) >= "' . $desde . '" or DATE(r.fecha_creacion) >= "' . $desde . '")
                         and (r.id_tbl_estado_reserva = 2' . ($conRegalos ? ' or (r.Isaward = 1 and r.id_tbl_estado_reserva in (1, 2, 3))' : '') . ')',
        ));
        foreach ($lineas as $l)
            $porHotel[intval($l['est'])][] = $l;

        // Históricas, igual que la columna «N. NOCHES» del listado de establecimientos del administrador
        foreach (rd_find($model, array(
            'select' => 'ro.id_tbl_establecimiento as est, COUNT(DISTINCT ro.id_tbl_reserva) as reservas,
                         COALESCE(SUM(DATEDIFF(ro.fecha_fin, ro.fecha_inicio)), 0) as noches',
            'from'   => 'tbl_reserva_oferta ro join tbl_reserva_new r on r.id_tbl_reserva = ro.id_tbl_reserva',
            'where'  => 'r.id_tbl_estado_reserva = 2 and ro.id_tbl_establecimiento in (' . implode(',', $ests) . ')',
            'group'  => 'ro.id_tbl_establecimiento',
        )) as $h)
            $historico[intval($h['est'])] = array('reservas' => intval($h['reservas']), 'noches' => intval($h['noches']));
    }
    foreach ($filas as &$f) {
        $prod = array(); $noches = 0; $monto = 0; $bonoUsadas = 0; $canjeUsadas = 0;
        $rgCons = array(); $rgConf = array(); $rgCanc = array(); $rgNoches = 0; $rgValor = 0;
        foreach ($porHotel[intval($f['id_tbl_establecimiento'])] ?? array() as $l) {
            $estado = intval($l['estado']);
            $esRegalo = intval($l['regalo']) === 1;
            $n = intval($l['noches']);
            // Producción: TODAS las confirmadas con check-in dentro del contrato (cualquier forma de
            // pago, regalos incluidos). Usadas: las pagadas con bono (1) o canje (2, 3).
            if ($estado === 2 && $l['ini'] >= $f['fecha_ini'] && $l['ini'] <= $f['fecha_fin']) {
                $forma = intval($l['forma']);
                $prod[$l['id']] = true;
                $noches += $n;
                $monto  += floatval($l['precio']);
                if ($forma === 1) $bonoUsadas += $n;
                if ($forma === 2 || $forma === 3) $canjeUsadas += $n;
            }
            // Regalos: creados durante la vigencia del contrato (misma regla que el administrador)
            if ($esRegalo && $l['creada'] >= $f['fecha_ini'] && $l['creada'] <= $f['fecha_fin']) {
                if ($estado === 1 || $estado === 2) {
                    $rgCons[$l['id']] = true;
                    $rgNoches += $n;
                    $rgValor  += floatval($l['precio']);
                }
                if ($estado === 2) $rgConf[$l['id']] = true;
                if ($estado === 3) $rgCanc[$l['id']] = true;
            }
        }
        $f['reservas'] = count($prod);
        $f['noches'] = $noches;
        $f['monto'] = $monto;
        $f['bono_usadas'] = $bonoUsadas;
        $f['canje_usadas'] = $canjeUsadas;
        $f['regalos_consumidos'] = count($rgCons);
        $f['regalos_confirmados'] = count($rgConf);
        $f['regalos_cancelados'] = count($rgCanc);
        $f['regalos_noches'] = $rgNoches;
        $f['regalos_valor'] = $rgValor;
        $hist = $historico[intval($f['id_tbl_establecimiento'])] ?? array('reservas' => 0, 'noches' => 0);
        $f['noches_historicas'] = $hist['noches'];
        $f['reservas_historicas'] = $hist['reservas'];
    }
    unset($f);
    usort($filas, function ($a, $b) { return $b['noches'] - $a['noches']; });

    $hoy = date('Y-m-d');
    $contratos = array();
    $bono  = array('contratos' => 0, 'superaron_meta' => 0, 'sin_meta' => 0, 'ganadas' => 0, 'usadas' => 0, 'saldo' => 0);
    $canje = array('contratos' => 0, 'generadas' => 0, 'usadas' => 0, 'saldo' => 0, 'valor_saldo' => 0,
                   'con_valor' => 0, 'sin_valor' => 0, 'valor_sin_cargar' => 0, 'valor_total' => 0, 'valor_devengado' => 0, 'valor_pendiente' => 0);
    $distCanje = array();
    $distBono  = array();
    $regalos = array('contratos' => 0, 'incluidos' => 0, 'consumidos' => 0, 'confirmados' => 0, 'pendientes' => 0,
                     'cancelados' => 0, 'disponibles' => 0, 'excedidos' => 0, 'agotados' => 0, 'noches' => 0, 'valor' => 0);

    foreach ($filas as $f) {
        $n     = intval($f['noches']);
        $sinMeta = intval($f['aplica_meta']) === 0;
        $meta  = $sinMeta ? 0 : intval($f['noches_gratis_meta']);
        $xg    = intval($f['x_noches_gratis']);
        $yg    = max(1, intval($f['bono_noches']));
        $xc    = intval($f['x_noches_canje']);
        $yc    = max(1, intval($f['canje_noches']));
        $conValor   = intval($f['aplica_valor_canje']) === 1;
        // Valor = pago «Canje» del contrato; montos simbólicos (< $1) cuentan como no cargados
        $valorCanje = $conValor && floatval($f['valor_canje']) >= RD_CANJE_MINIMO ? floatval($f['valor_canje']) : 0;
        $monto = floatval($f['monto']);
        $precioNoche = $n > 0 ? $monto / $n : 0;

        $fila = array(
            'id_contrato'        => intval($f['id_tbl_contrato']),
            'id_establecimiento' => intval($f['id_tbl_establecimiento']),
            'hotel'              => $f['titulo'],
            'ciudad'             => $f['ciudad'],
            'provincia'          => $f['provincia'],
            'fecha_ini'          => $f['fecha_ini'],
            'fecha_fin'          => $f['fecha_fin'],
            'vigente'            => $f['fecha_fin'] >= $hoy,
            'reservas'           => intval($f['reservas']),
            'noches'             => $n,
            'monto'              => round($monto, 2),
            'precio_noche'       => round($precioNoche, 2),
            // Como «N. NOCHES» / «N. RESERVAS» del listado de establecimientos del administrador
            'noches_historicas'  => intval($f['noches_historicas']),
            'reservas_historicas'=> intval($f['reservas_historicas']),
            'bono'               => null,
            'canje'              => null,
        );

        if ($xg > 0) {
            // Superada la meta (o desde la 1a noche si no hay meta): cada X noches → Y noches de bono
            $excedente = max(0, $n - $meta);
            $ganadas   = intdiv($excedente, $xg) * $yg;
            $usadas    = intval($f['bono_usadas']);
            $fila['bono'] = array(
                'sin_meta'         => $sinMeta,
                'meta'             => $meta,
                'cada'             => $xg,
                'otorga'           => $yg,
                'avance_meta'      => $meta > 0 ? round(min($n / $meta, 9.99) * 100, 1) : 100,
                'supero_meta'      => $n > $meta,
                'faltan_meta'      => max(0, $meta - $n),
                'faltan_siguiente' => $n >= $meta ? $xg - ($excedente % $xg) : $meta - $n + $xg,
                'ganadas'          => $ganadas,
                'usadas'           => $usadas,
                'saldo'            => $ganadas - $usadas,
            );
            $bono['contratos']++;
            if ($sinMeta) $bono['sin_meta']++;
            else if ($n > $meta) $bono['superaron_meta']++;
            $bono['ganadas'] += $ganadas;
            $bono['usadas']  += $usadas;
            $distBono[$xg . ':' . $yg] = rd_acumular($distBono[$xg . ':' . $yg] ?? null, $xg, $yg, $n, $ganadas);
        }

        if ($xc > 0) {
            // Cada X noches producidas se devengan Y noches del valor del canje.
            // Con valor en USD, se devenga solo hasta cubrir ese valor (a precio promedio por noche).
            $devengadas = intdiv($n, $xc) * $yc;
            $tope = null;
            if ($conValor && $valorCanje > 0 && $precioNoche > 0) {
                $tope = (int) ceil($valorCanje / $precioNoche);
                $devengadas = min($devengadas, $tope);
            }
            $usadas = intval($f['canje_usadas']);
            $saldo  = $devengadas - $usadas;
            $valorDevengado = $conValor && $valorCanje > 0 ? min($valorCanje, $devengadas * $precioNoche) : null;
            $fila['canje'] = array(
                'con_valor'        => $conValor,
                'valor'            => $conValor && $valorCanje > 0 ? round($valorCanje, 2) : null,
                'valor_sin_cargar' => $conValor && $valorCanje <= 0,
                'cada'             => $xc,
                'otorga'           => $yc,
                'generadas'        => $devengadas,
                'tope_noches'      => $tope,
                'tope_alcanzado'   => $tope !== null && $devengadas >= $tope,
                'faltan_siguiente' => $xc - ($n % $xc),
                'usadas'           => $usadas,
                'saldo'            => $saldo,
                'valor_saldo'      => round(max(0, $saldo) * $precioNoche, 2),
                'valor_devengado'  => $valorDevengado === null ? null : round($valorDevengado, 2),
                'valor_pendiente'  => $valorDevengado === null ? null : round($valorCanje - $valorDevengado, 2),
            );
            $canje['contratos']++;
            $canje[$conValor ? 'con_valor' : 'sin_valor']++;
            if ($fila['canje']['valor_sin_cargar']) $canje['valor_sin_cargar']++;
            $canje['generadas']   += $devengadas;
            $canje['usadas']      += $usadas;
            $canje['valor_saldo'] += $fila['canje']['valor_saldo'];
            if ($valorDevengado !== null) {
                $canje['valor_total']     += $valorCanje;
                $canje['valor_devengado'] += $valorDevengado;
                $canje['valor_pendiente'] += $valorCanje - $valorDevengado;
            }
            $distCanje[$xc . ':' . $yc] = rd_acumular($distCanje[$xc . ':' . $yc] ?? null, $xc, $yc, $n, $devengadas);
        }

        // Regalos: el contrato incluye N reservas sin costo para el suscriptor
        $fila['regalo'] = null;
        if ($conRegalos && intval($f['aplica_regalo']) === 1) {
            $incluidos  = intval($f['regalos']);
            $consumidos = intval($f['regalos_consumidos']);
            $confirmados = intval($f['regalos_confirmados']);
            $fila['regalo'] = array(
                'incluidos'   => $incluidos,
                'consumidos'  => $consumidos,
                'confirmados' => $confirmados,
                'pendientes'  => $consumidos - $confirmados,
                'cancelados'  => intval($f['regalos_cancelados']),
                'disponibles' => $incluidos - $consumidos,       // negativo = se usaron de más
                'uso'         => $incluidos > 0 ? round($consumidos * 100 / $incluidos, 1) : null,
                'noches'      => intval($f['regalos_noches']),
                'valor'       => round(floatval($f['regalos_valor']), 2),
            );
            $regalos['contratos']++;
            $regalos['incluidos']   += $incluidos;
            $regalos['consumidos']  += $consumidos;
            $regalos['confirmados'] += $confirmados;
            $regalos['pendientes']  += $consumidos - $confirmados;
            $regalos['cancelados']  += intval($f['regalos_cancelados']);
            $regalos['disponibles'] += max(0, $incluidos - $consumidos);
            $regalos['excedidos']   += max(0, $consumidos - $incluidos);
            if ($consumidos >= $incluidos) $regalos['agotados']++;
            $regalos['noches']      += $fila['regalo']['noches'];
            $regalos['valor']       += $fila['regalo']['valor'];
        }

        $contratos[] = $fila;
    }
    $regalos['valor'] = round($regalos['valor'], 2);
    $regalos['uso'] = $regalos['incluidos'] > 0 ? round($regalos['consumidos'] * 100 / $regalos['incluidos'], 1) : null;

    $bono['saldo']  = $bono['ganadas'] - $bono['usadas'];
    $canje['saldo'] = $canje['generadas'] - $canje['usadas'];
    foreach (array('valor_saldo', 'valor_total', 'valor_devengado', 'valor_pendiente') as $k)
        $canje[$k] = round($canje[$k], 2);
    $porFrecuencia = function ($a, $b) { return $a['cada'] - $b['cada'] ?: $a['otorga'] - $b['otorga']; };
    usort($distBono, $porFrecuencia);
    usort($distCanje, $porFrecuencia);

    return array(
        'resumen_bono'       => $bono,
        'resumen_canje'      => $canje,
        'resumen_regalos'    => $conRegalos ? $regalos : null,   // null = falta regalos_contrato.sql
        'distribucion_bono'  => $distBono,
        'distribucion_canje' => $distCanje,
        'contratos'          => $contratos,
    );
}

function rd_acumular($acc, $cada, $otorga, $noches, $generadas)
{
    if (!$acc) $acc = array('cada' => $cada, 'otorga' => $otorga, 'contratos' => 0, 'noches' => 0, 'generadas' => 0);
    $acc['contratos']++;
    $acc['noches']    += $noches;
    $acc['generadas'] += $generadas;
    return $acc;
}


// ─── Reservas de hoteles (estados, cancelaciones y express) ──────────────────

/**
 * Reservas de hoteles creadas en el rango (sistema nuevo, sin cotizaciones), con el
 * segmento EXPRESS: cuenta express (directorio tipo 38) o reserva hecha por el flujo
 * express (ingreso con método 45 hasta 24 h antes). Monto/noches «confirmados» = estado 2.
 * La respuesta es un superconjunto de la antigua acción reservas_canceladas.
 */
function rd_reservasHoteles($model, $inicio, $fin, $agrupar)
{
    // Solo líneas de reserva de hoteles (eh/ih) + cliente (uc/dc) para marcar express
    $from  = 'tbl_reserva_new r
              join tbl_reserva_oferta ro      on ro.id_tbl_reserva = r.id_tbl_reserva
              join tbl_establecimiento eh     on eh.id_tbl_establecimiento = ro.id_tbl_establecimiento
              join tbl_info_indice ih         on ih.id_tbl_info_indice = eh.id_tbl_info_indice
              left outer join tbl_usuario uc  on uc.id_tbl_usuario = r.id_tbl_usuario_cliente
              left outer join tbl_directorio dc on dc.id_tbl_directorio = uc.id_tbl_directorio';
    $where = 'r.fecha_creacion >= "' . $inicio . ' 00:00:00" and r.fecha_creacion <= "' . $fin . ' 23:59:59"
              and r.id_tbl_estado_reserva in (' . RD_ESTADOS_RESERVA . ')
              and ' . rd_esHotel('ih');
    // Express = el cliente es una cuenta express (directorio tipo 38) O la reserva salió del flujo
    // express: ese flujo (web HotelExpress y administrador «Reserva express») hace loginpost con
    // id_metodo 45, que REUTILIZA la cuenta si la cédula ya existe (sin cambiar su tipo) pero
    // siempre registra el ingreso en tbl_usuario_metodo. Se busca ese ingreso alrededor de la reserva.
    $express = '(dc.id_tbl_tipo_directorio = ' . RD_TIPO_DIRECTORIO_EXPRESS . '
                 OR EXISTS (SELECT 1 FROM tbl_usuario_metodo um
                            WHERE um.id_tbl_usuario = r.id_tbl_usuario_cliente
                              AND um.id_tbl_metodo_servicio = ' . RD_METODO_EXPRESS . '
                              AND um.fecha BETWEEN DATE_SUB(r.fecha_creacion, INTERVAL ' . RD_EXPRESS_HORAS_ANTES . ' HOUR)
                                               AND DATE_ADD(r.fecha_creacion, INTERVAL 10 MINUTE)))';
    $noches  = 'DATEDIFF(ro.fecha_fin, ro.fecha_inicio) * GREATEST(ro.cantidad_ofertas, 1)';

    // Serie: por día, estado y express (se agrupa a d/m/a en PHP)
    $dias = rd_find($model, array(
        'select' => 'DATE(r.fecha_creacion) as dia, r.id_tbl_estado_reserva as estado, IF(' . $express . ', 1, 0) as express,
                     COUNT(DISTINCT r.id_tbl_reserva) as reservas, SUM(ro.precio_total) as monto, SUM(' . $noches . ') as noches',
        'from'   => $from,
        'where'  => $where,
        'group'  => 'DATE(r.fecha_creacion), r.id_tbl_estado_reserva, express',
    ));

    $vacioSerie = array('total' => 0, 'confirmadas' => 0, 'pendientes' => 0, 'canceladas' => 0,
                        'monto_confirmado' => 0, 'monto_cancelado' => 0,
                        'express_total' => 0, 'express_confirmadas' => 0, 'express_canceladas' => 0);
    $serie = array();
    foreach (rd_periodos($inicio, $fin, $agrupar) as $p)
        $serie[$p] = array('periodo' => $p) + $vacioSerie;

    $vacioRes = array('total' => 0, 'confirmadas' => 0, 'pendientes' => 0, 'canceladas' => 0,
                      'monto_total' => 0, 'monto_confirmado' => 0, 'monto_cancelado' => 0, 'noches_confirmadas' => 0);
    $res = $vacioRes;
    $exp = $vacioRes;
    $claves = array(1 => 'pendientes', 2 => 'confirmadas', 3 => 'canceladas');

    foreach ($dias as $d) {
        $p = rd_periodo($d['dia'], $agrupar);
        if (!isset($serie[$p])) continue;
        $cant  = intval($d['reservas']);
        $monto = floatval($d['monto']);
        $clave = $claves[intval($d['estado'])] ?? null;
        $esExp = intval($d['express']) === 1;

        foreach ($esExp ? array(&$res, &$exp) : array(&$res) as &$r) {
            $r['total']       += $cant;
            $r['monto_total'] += $monto;
            if ($clave) $r[$clave] += $cant;
            if ($clave == 'confirmadas') { $r['monto_confirmado'] += $monto; $r['noches_confirmadas'] += intval($d['noches']); }
            if ($clave == 'canceladas')  $r['monto_cancelado'] += $monto;
        }
        unset($r);

        $serie[$p]['total'] += $cant;
        if ($clave) $serie[$p][$clave] += $cant;
        if ($clave == 'confirmadas') $serie[$p]['monto_confirmado'] += $monto;
        if ($clave == 'canceladas')  $serie[$p]['monto_cancelado'] += $monto;
        if ($esExp) {
            $serie[$p]['express_total'] += $cant;
            if ($clave == 'confirmadas') $serie[$p]['express_confirmadas'] += $cant;
            if ($clave == 'canceladas')  $serie[$p]['express_canceladas'] += $cant;
        }
    }

    $tasa = function ($parte, $total) { return $total ? round($parte * 100 / $total, 1) : 0; };
    $cerrarRes = function ($r) use ($tasa) {
        foreach (array('monto_total', 'monto_confirmado', 'monto_cancelado') as $k) $r[$k] = round($r[$k], 2);
        $r['tasa']              = $tasa($r['canceladas'], $r['total']);   // tasa de cancelación (nombre anterior)
        $r['tasa_cancelacion']  = $r['tasa'];
        $r['tasa_confirmacion'] = $tasa($r['confirmadas'], $r['total']);
        $r['ticket_promedio']   = $r['confirmadas'] ? round($r['monto_confirmado'] / $r['confirmadas'], 2) : 0;
        return $r;
    };
    foreach ($serie as $p => $s) {
        $serie[$p]['tasa']             = $tasa($s['canceladas'], $s['total']);
        $serie[$p]['express_tasa']     = $tasa($s['express_canceladas'], $s['express_total']);
        $serie[$p]['monto_confirmado'] = round($s['monto_confirmado'], 2);
        $serie[$p]['monto_cancelado']  = round($s['monto_cancelado'], 2);
    }
    $res = $cerrarRes($res);
    $exp = $cerrarRes($exp);
    $exp['participacion'] = $tasa($exp['total'], $res['total']);

    // Conteos distintos (no se pueden sumar por día)
    $distintos = rd_find($model, array(
        'select' => 'COUNT(DISTINCT r.id_tbl_usuario_cliente) as clientes,
                     COUNT(DISTINCT ro.id_tbl_establecimiento) as hoteles,
                     COUNT(DISTINCT CASE WHEN ' . $express . ' THEN r.id_tbl_usuario_cliente END) as clientes_express,
                     COUNT(DISTINCT CASE WHEN ' . $express . ' THEN ro.id_tbl_establecimiento END) as hoteles_express',
        'from'   => $from,
        'where'  => $where,
    ));
    $dist = $distintos ? $distintos[0] : array();
    $res['clientes'] = intval($dist['clientes'] ?? 0);
    $res['hoteles']  = intval($dist['hoteles'] ?? 0);
    $exp['clientes'] = intval($dist['clientes_express'] ?? 0);
    $exp['hoteles']  = intval($dist['hoteles_express'] ?? 0);

    // Por hotel
    $filas = rd_find($model, array(
        'select' => 'ro.id_tbl_establecimiento, ih.titulo, lug.desc_lugar as ciudad,
                     COUNT(DISTINCT r.id_tbl_reserva) as total,
                     COUNT(DISTINCT CASE WHEN r.id_tbl_estado_reserva = 2 THEN r.id_tbl_reserva END) as confirmadas,
                     COUNT(DISTINCT CASE WHEN r.id_tbl_estado_reserva = 3 THEN r.id_tbl_reserva END) as canceladas,
                     COUNT(DISTINCT CASE WHEN ' . $express . ' THEN r.id_tbl_reserva END) as express,
                     SUM(CASE WHEN r.id_tbl_estado_reserva = 2 THEN ro.precio_total ELSE 0 END) as monto_confirmado,
                     SUM(CASE WHEN r.id_tbl_estado_reserva = 3 THEN ro.precio_total ELSE 0 END) as monto_cancelado,
                     SUM(CASE WHEN r.id_tbl_estado_reserva = 2 THEN ' . $noches . ' ELSE 0 END) as noches',
        'from'   => $from . '
                     left outer join tbl_lugar lug on lug.id_tbl_lugar = ih.id_tbl_lugar',
        'where'  => $where,
        'group'  => 'ro.id_tbl_establecimiento',
        'order'  => 'total desc',
        'limit'  => '300',
    ));
    $establecimientos = array();
    foreach ($filas as $e) {
        $total = intval($e['total']);
        $establecimientos[] = array(
            'id_establecimiento' => intval($e['id_tbl_establecimiento']),
            'establecimiento'    => $e['titulo'] ?: 'Establecimiento ' . $e['id_tbl_establecimiento'],
            'ciudad'             => $e['ciudad'],
            'total'              => $total,
            'confirmadas'        => intval($e['confirmadas']),
            'canceladas'         => intval($e['canceladas']),
            'express'            => intval($e['express']),
            'tasa'               => $tasa(intval($e['canceladas']), $total),
            'noches'             => intval($e['noches']),
            'monto_confirmado'   => round(floatval($e['monto_confirmado']), 2),
            'monto_cancelado'    => round(floatval($e['monto_cancelado']), 2),
        );
    }

    // Detalle: reservas más recientes del rango (todas)
    $detalle = rd_find($model, array(
        'select' => 'r.id_tbl_reserva, r.id_tbl_estado_reserva as estado, IF(' . $express . ', 1, 0) as express,
                     r.fecha_creacion, r.fecha_actualizacion, r.comentario_reserva,
                     concat_ws(" ", dc.nom1, dc.nom2, dc.ape1, dc.ape2) as cliente,
                     GROUP_CONCAT(DISTINCT ih.titulo SEPARATOR ", ") as establecimiento,
                     MIN(ro.fecha_inicio) as check_in, MAX(ro.fecha_fin) as check_out,
                     SUM(' . $noches . ') as noches, SUM(ro.precio_total) as monto',
        'from'   => $from,
        'where'  => $where,
        'group'  => 'r.id_tbl_reserva',
        'order'  => 'r.fecha_creacion desc',
        'limit'  => '1000',
    ));
    $nombresEstado = array(1 => 'Pendiente', 2 => 'Confirmada', 3 => 'Cancelada');
    foreach ($detalle as &$d) {
        $d = array(
            'id_reserva'        => intval($d['id_tbl_reserva']),
            'estado'            => $nombresEstado[intval($d['estado'])] ?? 'Otro',
            'express'           => intval($d['express']) === 1,
            'fecha_creacion'    => $d['fecha_creacion'],
            'fecha_cancelacion' => intval($d['estado']) === 3 ? $d['fecha_actualizacion'] : null,
            'fecha_actualizacion' => $d['fecha_actualizacion'],
            'cliente'           => trim(preg_replace('/\s+/', ' ', $d['cliente'])),
            'establecimiento'   => $d['establecimiento'],
            'check_in'          => $d['check_in'],
            'check_out'         => $d['check_out'],
            'noches'            => intval($d['noches']),
            'monto'             => round(floatval($d['monto']), 2),
            'comentario'        => $d['comentario_reserva'],
        );
    }
    unset($d);

    return array(
        'resumen'          => $res,
        'express'          => $exp,
        'serie'            => array_values($serie),
        'establecimientos' => $establecimientos,
        'detalle'          => $detalle,
    );
}


// ─── Suscriptores: activos, entradas vs salidas y uso ────────────────────────

/**
 * Unidad = suscriptor (tbl_suscripcion.id_tbl_usuario), salvo «suscripciones activas», que
 * cuenta renovaciones vigentes (una persona puede tener varias; así cuenta el administrador).
 * Solo empresa VisitaEcuador.
 * Renovación vigente = fecha_fin válida y estado de pago NO anulado (4) ni bloqueado (8),
 * igual que el listado «por vencer» del administrador.
 *   · Activo en una fecha  = tiene una renovación vigente que la cubre.
 *   · Nuevo (entrada)      = su PRIMERA renovación vigente empieza en el período.
 *   · Renovación           = renovación que empieza en el período y no es la primera.
 *   · Vence / salida       = una renovación vence en el período; es SALIDA si el suscriptor
 *                            no tiene otra renovación vigente que termine después (a hoy).
 *   · Uso                  = reservas confirmadas + certificados (no anulados) de HOTELES
 *                            creados en el período por suscriptores activos en el período.
 */
function rd_suscripciones($model, $inicio, $fin, $agrupar)
{
    $hoy   = date('Y-m-d');
    $finEf = min($fin, $hoy);
    $fmt   = $agrupar == 'd' ? '%Y-%m-%d' : ($agrupar == 'a' ? '%Y' : '%Y-%m');

    $valida  = 'sr.fecha_fin IS NOT NULL AND DATE(sr.fecha_fin) > "1900-01-01"
                AND sr.id_tbl_estado_pago_suscripcion NOT IN (' . RD_PAGOS_SUSCRIPCION_INVALIDOS . ')';
    $empresa = 'COALESCE(ps.id_tbl_empresa, sw.id_tbl_empresa, ' . RD_EMPRESA_VE . ') = ' . RD_EMPRESA_VE;
    $fromSr  = 'tbl_suscripcion_renovacion sr
                join tbl_suscripcion s                 on s.id_tbl_suscripcion = sr.id_tbl_suscripcion
                left outer join tbl_prod_suscripcion ps on ps.id_tbl_prod_suscripcion = sr.id_tbl_prod_suscripcion
                left outer join tbl_servicio_web sw    on sw.id_tbl_servicio_web = ps.id_tbl_servicio_web';
    $base    = $valida . ' AND ' . $empresa;

    // ── Activos al cierre de cada período (y el día anterior al inicio) ──────
    $periodos = rd_periodos($inicio, $fin, $agrupar);
    $cortes = array('__inicio' => rd_sumarDias($inicio, -1));
    foreach ($periodos as $p) {
        $finP = $agrupar == 'd' ? $p : ($agrupar == 'a' ? $p . '-12-31' : date('Y-m-t', strtotime($p . '-01')));
        $ini  = $agrupar == 'd' ? $p : ($agrupar == 'a' ? $p . '-01-01' : $p . '-01');
        if ($ini <= $hoy) $cortes[$p] = min($finP, $hoy);
    }
    $union = array();
    foreach ($cortes as $p => $c)
        $union[] = 'SELECT "' . $p . '" as periodo, "' . $c . '" as corte';
    $activosCorte = array();
    $suscripcionesCorte = array();
    foreach (rd_find($model, array(
        // activos = personas; suscripciones = renovaciones vigentes (una persona puede tener varias)
        'select' => 'm.periodo, COUNT(DISTINCT s.id_tbl_usuario) as activos,
                     COUNT(DISTINCT sr.id_tbl_suscripcion_renovacion) as suscripciones',
        'from'   => '(' . implode(' UNION ALL ', $union) . ') m
                     join tbl_suscripcion_renovacion sr on DATE(sr.fecha_inicio) <= m.corte and DATE(sr.fecha_fin) >= m.corte
                     join tbl_suscripcion s                 on s.id_tbl_suscripcion = sr.id_tbl_suscripcion
                     left outer join tbl_prod_suscripcion ps on ps.id_tbl_prod_suscripcion = sr.id_tbl_prod_suscripcion
                     left outer join tbl_servicio_web sw    on sw.id_tbl_servicio_web = ps.id_tbl_servicio_web',
        'where'  => $base,
        'group'  => 'm.periodo',
    )) as $f) {
        $activosCorte[$f['periodo']] = intval($f['activos']);
        $suscripcionesCorte[$f['periodo']] = intval($f['suscripciones']);
    }

    // ── Nuevos: primera renovación vigente del suscriptor dentro del rango ───
    $nuevosDia = rd_find($model, array(
        'select' => 't.ini as dia, COUNT(*) as n',
        'from'   => '(SELECT s.id_tbl_usuario, MIN(DATE(sr.fecha_inicio)) as ini FROM ' . $fromSr . '
                      WHERE ' . $base . ' GROUP BY s.id_tbl_usuario) t',
        'where'  => 't.ini >= "' . $inicio . '" and t.ini <= "' . $finEf . '"',
        'group'  => 't.ini',
    ));

    // ── Inicios de renovación (para renovaciones = inicios − nuevos) ─────────
    $iniciosDia = rd_find($model, array(
        'select' => 'DATE(sr.fecha_inicio) as dia, COUNT(DISTINCT s.id_tbl_usuario) as n',
        'from'   => $fromSr,
        'where'  => $base . ' and DATE(sr.fecha_inicio) >= "' . $inicio . '" and DATE(sr.fecha_inicio) <= "' . $finEf . '"',
        'group'  => 'DATE(sr.fecha_inicio)',
    ));

    // ── Vencimientos y si renovaron (otra renovación vigente que termina después) ──
    $vencenDia = rd_find($model, array(
        'select' => 'DATE(sr.fecha_fin) as dia, COUNT(DISTINCT s.id_tbl_usuario) as vencen,
                     COUNT(DISTINCT CASE WHEN EXISTS (
                         SELECT 1 FROM tbl_suscripcion_renovacion sr2
                         JOIN tbl_suscripcion s2 ON s2.id_tbl_suscripcion = sr2.id_tbl_suscripcion
                         WHERE s2.id_tbl_usuario = s.id_tbl_usuario
                           AND sr2.id_tbl_estado_pago_suscripcion NOT IN (' . RD_PAGOS_SUSCRIPCION_INVALIDOS . ')
                           AND sr2.fecha_fin > sr.fecha_fin
                     ) THEN s.id_tbl_usuario END) as renovadas',
        'from'   => $fromSr,
        'where'  => $base . ' and DATE(sr.fecha_fin) >= "' . $inicio . '" and DATE(sr.fecha_fin) <= "' . $finEf . '"',
        'group'  => 'DATE(sr.fecha_fin)',
    ));

    // Serie
    $serie = array();
    foreach ($periodos as $p)
        $serie[$p] = array('periodo' => $p, 'activos' => $activosCorte[$p] ?? null,
                           'suscripciones' => $suscripcionesCorte[$p] ?? null, 'activos_inicio' => null,
                           'nuevos' => 0, 'renovaciones' => 0, 'vencen' => 0, 'renovadas' => 0, 'salidas' => 0,
                           'tasa_entrada' => null, 'tasa_salida' => null, 'tasa_renovacion' => null,
                           'reservas' => 0, 'certificados' => 0, 'usuarios_uso' => 0, 'tasa_uso' => null);
    $acumular = function ($filas, $campo, $col) use (&$serie, $agrupar) {
        foreach ($filas as $f) {
            $p = rd_periodo($f['dia'], $agrupar);
            if (isset($serie[$p])) $serie[$p][$campo] += intval($f[$col]);
        }
    };
    $acumular($nuevosDia, 'nuevos', 'n');
    $acumular($iniciosDia, 'renovaciones', 'n');
    $acumular($vencenDia, 'vencen', 'vencen');
    $acumular($vencenDia, 'renovadas', 'renovadas');

    $tasa = function ($parte, $total) { return $total ? round($parte * 100 / $total, 1) : null; };
    $anterior = $activosCorte['__inicio'] ?? 0;
    foreach ($serie as $p => $s) {
        $serie[$p]['renovaciones']    = max(0, $s['renovaciones'] - $s['nuevos']);
        $serie[$p]['salidas']         = $s['vencen'] - $s['renovadas'];
        $serie[$p]['activos_inicio']  = $anterior;
        $serie[$p]['tasa_entrada']    = $tasa($s['nuevos'], $anterior);
        $serie[$p]['tasa_salida']     = $tasa($serie[$p]['salidas'], $anterior);
        $serie[$p]['tasa_renovacion'] = $tasa($s['renovadas'], $s['vencen']);
        if ($s['activos'] !== null) $anterior = $s['activos'];
    }

    // ── Uso por suscriptor ────────────────────────────────────────────────────
    $activosRango = '(SELECT DISTINCT s.id_tbl_usuario FROM ' . $fromSr . '
                      WHERE ' . $base . ' AND DATE(sr.fecha_inicio) <= "' . $finEf . '" AND DATE(sr.fecha_fin) >= "' . $inicio . '")';
    $rangoR = 'r.fecha_creacion >= "' . $inicio . ' 00:00:00" and r.fecha_creacion <= "' . $fin . ' 23:59:59"';
    $rangoC = 'c.created_at >= "' . $inicio . ' 00:00:00" and c.created_at <= "' . $fin . ' 23:59:59"';
    $reservasUsuario = '(SELECT r.id_tbl_usuario_cliente as u, COUNT(DISTINCT r.id_tbl_reserva) as n
                         FROM tbl_reserva_new r
                         JOIN tbl_reserva_oferta ro  ON ro.id_tbl_reserva = r.id_tbl_reserva
                         JOIN tbl_establecimiento eh ON eh.id_tbl_establecimiento = ro.id_tbl_establecimiento
                         JOIN tbl_info_indice ih     ON ih.id_tbl_info_indice = eh.id_tbl_info_indice
                         WHERE r.id_tbl_estado_reserva = 2 AND ' . $rangoR . ' AND ' . rd_esHotel('ih') . '
                         GROUP BY r.id_tbl_usuario_cliente)';
    $certificadosUsuario = '(SELECT c.id_tbl_usuario as u, COUNT(*) as n
                         FROM tbl_certificado c
                         JOIN tbl_establecimiento eh ON c.id_tbl_establecimiento REGEXP "^[0-9]+$"
                                                    AND eh.id_tbl_establecimiento = c.id_tbl_establecimiento
                         JOIN tbl_info_indice ih     ON ih.id_tbl_info_indice = eh.id_tbl_info_indice
                         WHERE c.id_tbl_type = 1 AND c.is_active != 0 AND ' . $rangoC . ' AND ' . rd_esHotel('ih') . '
                           AND c.id_tbl_usuario NOT IN (' . RD_USUARIOS_CERT_EXCLUIDOS . ')
                         GROUP BY c.id_tbl_usuario)';

    $totalActivos = rd_find($model, array('select' => 'COUNT(*) as n', 'from' => $activosRango . ' a'));
    $suscriptores = intval($totalActivos[0]['n'] ?? 0);

    $usos = rd_find($model, array(
        'select' => 'a.id_tbl_usuario, COALESCE(rv.n, 0) as reservas, COALESCE(ce.n, 0) as certificados',
        'from'   => $activosRango . ' a
                     LEFT JOIN ' . $reservasUsuario . ' rv ON rv.u = a.id_tbl_usuario
                     LEFT JOIN ' . $certificadosUsuario . ' ce ON ce.u = a.id_tbl_usuario',
        'where'  => 'rv.u IS NOT NULL OR ce.u IS NOT NULL',
    ));

    $buckets = array('0' => 0, '1' => 0, '2-3' => 0, '4-5' => 0, '6+' => 0);
    $totReservas = 0; $totCertificados = 0;
    foreach ($usos as &$u) {
        $u['reservas'] = intval($u['reservas']);
        $u['certificados'] = intval($u['certificados']);
        $u['usos'] = $u['reservas'] + $u['certificados'];
        $totReservas += $u['reservas'];
        $totCertificados += $u['certificados'];
        $n = $u['usos'];
        $buckets[$n == 1 ? '1' : ($n <= 3 ? '2-3' : ($n <= 5 ? '4-5' : '6+'))]++;
    }
    unset($u);
    $conUso = count($usos);
    $buckets['0'] = max(0, $suscriptores - $conUso);

    // Top suscriptores por uso, con nombre, plan y vencimiento
    usort($usos, function ($a, $b) { return $b['usos'] - $a['usos']; });
    $top = array_slice($usos, 0, 100);
    if ($top) {
        $ids = implode(',', array_map('intval', array_column($top, 'id_tbl_usuario')));
        $info = array();
        foreach (rd_find($model, array(
            'select' => 'u.id_tbl_usuario, u.usu_o_email as usuario,
                         concat_ws(" ", d.nom1, d.nom2, d.ape1, d.ape2) as nombre,
                         (SELECT ps2.titulo FROM tbl_suscripcion_renovacion sr2
                            JOIN tbl_suscripcion s2 ON s2.id_tbl_suscripcion = sr2.id_tbl_suscripcion
                            LEFT JOIN tbl_prod_suscripcion ps2 ON ps2.id_tbl_prod_suscripcion = sr2.id_tbl_prod_suscripcion
                           WHERE s2.id_tbl_usuario = u.id_tbl_usuario
                             AND sr2.id_tbl_estado_pago_suscripcion NOT IN (' . RD_PAGOS_SUSCRIPCION_INVALIDOS . ')
                           ORDER BY sr2.fecha_fin DESC LIMIT 1) as plan,
                         (SELECT MAX(DATE(sr3.fecha_fin)) FROM tbl_suscripcion_renovacion sr3
                            JOIN tbl_suscripcion s3 ON s3.id_tbl_suscripcion = sr3.id_tbl_suscripcion
                           WHERE s3.id_tbl_usuario = u.id_tbl_usuario
                             AND sr3.id_tbl_estado_pago_suscripcion NOT IN (' . RD_PAGOS_SUSCRIPCION_INVALIDOS . ')) as vence',
            'from'   => 'tbl_usuario u left outer join tbl_directorio d on d.id_tbl_directorio = u.id_tbl_directorio',
            'where'  => 'u.id_tbl_usuario in (' . $ids . ')',
        )) as $f)
            $info[intval($f['id_tbl_usuario'])] = $f;
        foreach ($top as &$t) {
            $i = $info[intval($t['id_tbl_usuario'])] ?? array();
            $t = array(
                'id_usuario'   => intval($t['id_tbl_usuario']),
                'usuario'      => $i['usuario'] ?? '',
                'nombre'       => trim(preg_replace('/\s+/', ' ', $i['nombre'] ?? '')),
                'plan'         => $i['plan'] ?? null,
                'vence'        => $i['vence'] ?? null,
                'reservas'     => $t['reservas'],
                'certificados' => $t['certificados'],
                'usos'         => $t['usos'],
            );
        }
        unset($t);
    }

    // Uso por período (usuarios distintos con uso, entre los activos del rango)
    $usoPeriodo = rd_find($model, array(
        'select' => 'x.periodo, SUM(x.tipo = "r") as reservas, SUM(x.tipo = "c") as certificados, COUNT(DISTINCT x.u) as usuarios',
        'from'   => '(SELECT DISTINCT DATE_FORMAT(r.fecha_creacion, "' . $fmt . '") as periodo, "r" as tipo, r.id_tbl_reserva as id, r.id_tbl_usuario_cliente as u
                        FROM tbl_reserva_new r
                        JOIN tbl_reserva_oferta ro  ON ro.id_tbl_reserva = r.id_tbl_reserva
                        JOIN tbl_establecimiento eh ON eh.id_tbl_establecimiento = ro.id_tbl_establecimiento
                        JOIN tbl_info_indice ih     ON ih.id_tbl_info_indice = eh.id_tbl_info_indice
                       WHERE r.id_tbl_estado_reserva = 2 AND ' . $rangoR . ' AND ' . rd_esHotel('ih') . '
                      UNION ALL
                      SELECT DATE_FORMAT(c.created_at, "' . $fmt . '"), "c", c.id_tbl_certificado, c.id_tbl_usuario
                        FROM tbl_certificado c
                        JOIN tbl_establecimiento eh ON c.id_tbl_establecimiento REGEXP "^[0-9]+$"
                                                   AND eh.id_tbl_establecimiento = c.id_tbl_establecimiento
                        JOIN tbl_info_indice ih     ON ih.id_tbl_info_indice = eh.id_tbl_info_indice
                       WHERE c.id_tbl_type = 1 AND c.is_active != 0 AND ' . $rangoC . ' AND ' . rd_esHotel('ih') . '
                         AND c.id_tbl_usuario NOT IN (' . RD_USUARIOS_CERT_EXCLUIDOS . ')) x
                     JOIN ' . $activosRango . ' a ON a.id_tbl_usuario = x.u',
        'group'  => 'x.periodo',
    ));
    foreach ($usoPeriodo as $f) {
        if (!isset($serie[$f['periodo']])) continue;
        $p = $f['periodo'];
        $serie[$p]['reservas']     = intval($f['reservas']);
        $serie[$p]['certificados'] = intval($f['certificados']);
        $serie[$p]['usuarios_uso'] = intval($f['usuarios']);
    }
    foreach ($serie as $p => $s)
        $serie[$p]['tasa_uso'] = $s['activos'] ? round($s['usuarios_uso'] * 100 / $s['activos'], 1) : null;

    // Activos hoy (o al cierre) por plan
    $porPlan = array();
    foreach (rd_find($model, array(
        'select' => 'COALESCE(ps.titulo, "Sin plan") as plan, COUNT(DISTINCT s.id_tbl_usuario) as activos',
        'from'   => $fromSr,
        'where'  => $base . ' and DATE(sr.fecha_inicio) <= "' . $finEf . '" and DATE(sr.fecha_fin) >= "' . $finEf . '"',
        'group'  => 'COALESCE(ps.titulo, "Sin plan")',
        'order'  => 'activos desc',
        'limit'  => '12',
    )) as $f)
        $porPlan[] = array('plan' => $f['plan'], 'activos' => intval($f['activos']));

    // Resumen
    $sum = function ($k) use ($serie) { return array_sum(array_column($serie, $k)); };
    $activosInicio = $activosCorte['__inicio'] ?? 0;
    $ultimo = null;
    $ultimoSus = null;
    foreach ($serie as $s) if ($s['activos'] !== null) { $ultimo = $s['activos']; $ultimoSus = $s['suscripciones']; }
    $vencen = $sum('vencen'); $renovadas = $sum('renovadas'); $salidas = $sum('salidas'); $nuevos = $sum('nuevos');

    return array(
        'resumen' => array(
            'activos_inicio'  => $activosInicio,
            'activos_fin'     => $ultimo ?? $activosInicio,
            'suscripciones_inicio' => $suscripcionesCorte['__inicio'] ?? 0,
            'suscripciones_fin'    => $ultimoSus ?? ($suscripcionesCorte['__inicio'] ?? 0),
            'nuevos'          => $nuevos,
            'renovaciones'    => $sum('renovaciones'),
            'vencen'          => $vencen,
            'renovadas'       => $renovadas,
            'salidas'         => $salidas,
            'neto'            => $nuevos - $salidas,
            'tasa_entrada'    => $tasa($nuevos, $activosInicio),
            'tasa_salida'     => $tasa($salidas, $activosInicio),
            'tasa_renovacion' => $tasa($renovadas, $vencen),
        ),
        'uso' => array(
            'suscriptores'               => $suscriptores,
            'con_uso'                    => $conUso,
            'sin_uso'                    => max(0, $suscriptores - $conUso),
            'tasa_uso'                   => $tasa($conUso, $suscriptores),
            'reservas'                   => $totReservas,
            'certificados'               => $totCertificados,
            'reservas_por_suscriptor'    => $suscriptores ? round($totReservas / $suscriptores, 2) : 0,
            'certificados_por_suscriptor'=> $suscriptores ? round($totCertificados / $suscriptores, 2) : 0,
            'usos_por_suscriptor'        => $suscriptores ? round(($totReservas + $totCertificados) / $suscriptores, 2) : 0,
            'usos_por_suscriptor_activo' => $conUso ? round(($totReservas + $totCertificados) / $conUso, 2) : 0,
            'distribucion'               => array_map(function ($k, $v) { return array('usos' => (string) $k, 'suscriptores' => $v); }, array_keys($buckets), $buckets),
        ),
        'serie'     => array_values($serie),
        'por_plan'  => $porPlan,
        'top'       => $top,
    );
}


// ─── Certificados generados por establecimiento ──────────────────────────────

function rd_certificadosEstablecimiento($model, $inicio, $fin, $agrupar)
{
    // Solo certificados de hoteles (eh/ih: establecimiento del certificado)
    $from  = 'tbl_certificado c
              join tbl_establecimiento eh on c.id_tbl_establecimiento REGEXP "^[0-9]+$"
                                         and eh.id_tbl_establecimiento = c.id_tbl_establecimiento
              join tbl_info_indice ih     on ih.id_tbl_info_indice = eh.id_tbl_info_indice';
    $where = rd_esHotel('ih') . '
              and c.id_tbl_type = 1
              and c.created_at >= "' . $inicio . ' 00:00:00" and c.created_at <= "' . $fin . ' 23:59:59"
              and (c.id_tbl_usuario is null or c.id_tbl_usuario not in (' . RD_USUARIOS_CERT_EXCLUIDOS . '))';

    $dias = rd_find($model, array(
        'select' => 'DATE(c.created_at) as dia, c.is_active, COUNT(*) as cantidad',
        'from'   => $from,
        'where'  => $where,
        'group'  => 'DATE(c.created_at), c.is_active',
    ));

    $serie = array();
    foreach (rd_periodos($inicio, $fin, $agrupar) as $p)
        $serie[$p] = array('periodo' => $p, 'generados' => 0, 'activos' => 0, 'usados' => 0, 'anulados' => 0);

    $claves = array(0 => 'anulados', 1 => 'activos', 2 => 'usados');
    $res = array('generados' => 0, 'activos' => 0, 'usados' => 0, 'anulados' => 0);
    foreach ($dias as $d) {
        $p = rd_periodo($d['dia'], $agrupar);
        if (!isset($serie[$p])) continue;
        $cant  = intval($d['cantidad']);
        $clave = $claves[intval($d['is_active'])] ?? null;
        $serie[$p]['generados'] += $cant;
        $res['generados']       += $cant;
        if ($clave) {
            $serie[$p][$clave] += $cant;
            $res[$clave]       += $cant;
        }
    }
    $res['tasa_uso'] = ($res['generados'] - $res['anulados']) > 0
        ? round($res['usados'] * 100 / ($res['generados'] - $res['anulados']), 1) : 0;

    $filas = rd_find($model, array(
        'select' => 'c.id_tbl_establecimiento, i.titulo, lug.desc_lugar as ciudad, prov.desc_lugar as provincia,
                     COUNT(*) as generados,
                     SUM(c.is_active = 1) as activos, SUM(c.is_active = 2) as usados, SUM(c.is_active = 0) as anulados,
                     COALESCE(SUM(c.beneficiarios), 0) as beneficiarios,
                     COALESCE(SUM(CASE WHEN c.is_active != 0 THEN c.precio_total END), 0) as monto,
                     MAX(c.created_at) as ultimo',
        'from'   => $from . '
                     left outer join tbl_establecimiento e on c.id_tbl_establecimiento REGEXP "^[0-9]+$"
                                                          and e.id_tbl_establecimiento = c.id_tbl_establecimiento
                     left outer join tbl_info_indice i     on i.id_tbl_info_indice = e.id_tbl_info_indice
                     left outer join tbl_lugar lug         on lug.id_tbl_lugar = i.id_tbl_lugar
                     left outer join tbl_lugar prov        on prov.id_tbl_lugar = lug.id_tbl_lugarpadre',
        'where'  => $where,
        'group'  => 'c.id_tbl_establecimiento',
        'order'  => 'generados desc',
    ));

    $establecimientos = array();
    foreach ($filas as $f) {
        $vigentes = intval($f['generados']) - intval($f['anulados']);
        $establecimientos[] = array(
            'id_establecimiento' => $f['id_tbl_establecimiento'],
            'establecimiento'    => $f['titulo'] ?: ($f['id_tbl_establecimiento'] ? 'Establecimiento ' . $f['id_tbl_establecimiento'] : 'Sin establecimiento'),
            'ciudad'             => $f['ciudad'],
            'provincia'          => $f['provincia'],
            'generados'          => intval($f['generados']),
            'activos'            => intval($f['activos']),
            'usados'             => intval($f['usados']),
            'anulados'           => intval($f['anulados']),
            'tasa_uso'           => $vigentes > 0 ? round(intval($f['usados']) * 100 / $vigentes, 1) : 0,
            'beneficiarios'      => intval($f['beneficiarios']),
            'monto'              => round(floatval($f['monto']), 2),
            'ultimo'             => $f['ultimo'],
        );
    }
    $res['establecimientos'] = count($establecimientos);

    return array(
        'resumen'          => $res,
        'serie'            => array_values($serie),
        'establecimientos' => $establecimientos,
    );
}


// ─── Mapa de calor de destinos (reservas + certificados) ─────────────────────

/** Nombre normalizado (sin tildes, mayúsculas) → nombre oficial, igual al del GeoJSON del dashboard. */
function rd_provincias()
{
    $nombres = array('Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 'Esmeraldas',
        'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos', 'Manabi', 'Morona Santiago', 'Napo', 'Orellana',
        'Pastaza', 'Pichincha', 'Santa Elena', 'Santo Domingo de los Tsáchilas', 'Sucumbios', 'Tungurahua', 'Zamora Chinchipe');
    $mapa = array();
    foreach ($nombres as $n)
        $mapa[rd_normalizar($n)] = $n;
    $mapa['SANTO DOMINGO'] = 'Santo Domingo de los Tsáchilas';
    $mapa['SANTO DOMINGO DE LOS TSACHILAS'] = 'Santo Domingo de los Tsáchilas';
    $mapa['FRANCISCO DE ORELLANA'] = 'Orellana';
    $mapa['ZAMORA'] = 'Zamora Chinchipe';
    return $mapa;
}

function rd_titulo($texto)
{
    return function_exists('mb_convert_case') ? mb_convert_case($texto, MB_CASE_TITLE, 'UTF-8') : ucwords(strtolower($texto));
}

function rd_normalizar($texto)
{
    $t = strtr((string) $texto, array('á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ñ' => 'n',
        'Á' => 'A', 'É' => 'E', 'Í' => 'I', 'Ó' => 'O', 'Ú' => 'U', 'Ü' => 'U', 'Ñ' => 'N'));
    $t = preg_replace('/^PROVINCIA (DE |DEL )?/i', '', trim($t));
    return strtoupper(preg_replace('/\s+/', ' ', $t));
}

/**
 * id_tbl_lugar → [id_ciudad, ciudad, provincia] subiendo hasta 4 niveles en tbl_lugar.
 * Ciudad = primer nivel con id_tbl_tipo_lugar = 4; provincia = primer nivel cuyo nombre es una de las 24.
 */
function rd_ubicarLugares($model, $ids)
{
    $ids = array_values(array_unique(array_filter(array_map('intval', $ids))));
    $res = array();
    if (!$ids) return $res;

    $provincias = rd_provincias();
    foreach (array_chunk($ids, 500) as $lote) {
        $filas = rd_find($model, array(
            'select' => 'l1.id_tbl_lugar,
                         l1.id_tbl_lugar as i1, l1.desc_lugar as d1, l1.id_tbl_tipo_lugar as t1,
                         l2.id_tbl_lugar as i2, l2.desc_lugar as d2, l2.id_tbl_tipo_lugar as t2,
                         l3.id_tbl_lugar as i3, l3.desc_lugar as d3, l3.id_tbl_tipo_lugar as t3,
                         l4.id_tbl_lugar as i4, l4.desc_lugar as d4, l4.id_tbl_tipo_lugar as t4',
            'from'   => 'tbl_lugar l1
                         left outer join tbl_lugar l2 on l2.id_tbl_lugar = l1.id_tbl_lugarpadre
                         left outer join tbl_lugar l3 on l3.id_tbl_lugar = l2.id_tbl_lugarpadre
                         left outer join tbl_lugar l4 on l4.id_tbl_lugar = l3.id_tbl_lugarpadre',
            'where'  => 'l1.id_tbl_lugar in (' . implode(',', $lote) . ')',
        ));
        foreach ($filas as $f) {
            $provincia = null;
            $idCiudad = null;
            $ciudad = null;
            foreach (array(1, 2, 3, 4) as $n) {
                if (!$idCiudad && intval($f['t' . $n]) === RD_TIPO_LUGAR_CIUDAD) {
                    $idCiudad = intval($f['i' . $n]);
                    $ciudad = rd_titulo($f['d' . $n]);
                }
                $norm = rd_normalizar($f['d' . $n]);
                if (!$provincia && $norm !== '' && isset($provincias[$norm]))
                    $provincia = $provincias[$norm];
            }
            $res[intval($f['id_tbl_lugar'])] = array('id_ciudad' => $idCiudad, 'ciudad' => $ciudad, 'provincia' => $provincia);
        }
    }
    return $res;
}

/** Coordenada dentro de Ecuador (continente + Galápagos) y distinta de 0,0. */
function rd_coordValida($lat, $lng)
{
    $lat = floatval($lat);
    $lng = floatval($lng);
    return !($lat < -5.1 || $lat > 1.7 || $lng < -92.1 || $lng > -75.1 || ($lat == 0 && $lng == 0));
}

function rd_mapaCalor($model, $inicio, $fin)
{
    $infoEst = 'join tbl_establecimiento e on e.id_tbl_establecimiento = %s
                join tbl_info_indice i     on i.id_tbl_info_indice = e.id_tbl_info_indice';

    // Reservas por establecimiento (sin cotizaciones)
    $reservas = rd_find($model, array(
        'select' => 'ro.id_tbl_establecimiento as id_est, i.titulo, i.id_tbl_lugar, i.latitud, i.longitud,
                     COUNT(DISTINCT r.id_tbl_reserva) as solicitadas,
                     COUNT(DISTINCT CASE WHEN r.id_tbl_estado_reserva = 2 THEN r.id_tbl_reserva END) as confirmadas,
                     COALESCE(SUM(CASE WHEN r.id_tbl_estado_reserva = 2 THEN DATEDIFF(ro.fecha_fin, ro.fecha_inicio) * GREATEST(ro.cantidad_ofertas, 1) END), 0) as noches,
                     COALESCE(SUM(CASE WHEN r.id_tbl_estado_reserva = 2 THEN ro.precio_total END), 0) as monto',
        'from'   => 'tbl_reserva_new r
                     join tbl_reserva_oferta ro on ro.id_tbl_reserva = r.id_tbl_reserva ' . sprintf($infoEst, 'ro.id_tbl_establecimiento'),
        'where'  => 'r.fecha_creacion >= "' . $inicio . ' 00:00:00" and r.fecha_creacion <= "' . $fin . ' 23:59:59"
                     and r.id_tbl_estado_reserva in (' . RD_ESTADOS_RESERVA . ')
                     and ' . rd_esHotel('i'),
        'group'  => 'ro.id_tbl_establecimiento',
    ));

    // Certificados por establecimiento (mismos filtros que el reporte de certificados)
    $certificados = rd_find($model, array(
        'select' => 'e.id_tbl_establecimiento as id_est, i.titulo, i.id_tbl_lugar,
                     COALESCE(i.latitud, MAX(c.latitud)) as latitud, COALESCE(i.longitud, MAX(c.longitud)) as longitud,
                     SUM(c.is_active != 0) as generados, SUM(c.is_active = 2) as usados',
        'from'   => 'tbl_certificado c ' . sprintf(str_replace('join tbl_establecimiento e on', 'join tbl_establecimiento e on c.id_tbl_establecimiento REGEXP "^[0-9]+$" and', $infoEst), 'c.id_tbl_establecimiento'),
        'where'  => rd_esHotel('i') . ' and c.id_tbl_type = 1
                     and c.created_at >= "' . $inicio . ' 00:00:00" and c.created_at <= "' . $fin . ' 23:59:59"
                     and (c.id_tbl_usuario is null or c.id_tbl_usuario not in (' . RD_USUARIOS_CERT_EXCLUIDOS . '))',
        'group'  => 'e.id_tbl_establecimiento',
    ));

    // Oferta hotelera vigente hoy, para detectar zonas con demanda y sin cobertura
    $hoy = date('Y-m-d');
    $hoteles = rd_find($model, array(
        'select' => 'i.id_tbl_lugar, COUNT(DISTINCT c.id_tbl_establecimiento) as hoteles',
        'from'   => rd_hotelFrom(),
        'where'  => rd_esHotel('i') . ' and c.id_tbl_activacion = 1
                     and DATE(c.fecha_ini) <= "' . $hoy . '" and DATE(c.fecha_fin) >= "' . $hoy . '"',
        'group'  => 'i.id_tbl_lugar',
    ));

    $lugares = rd_ubicarLugares($model, array_merge(
        array_column($reservas, 'id_tbl_lugar'), array_column($certificados, 'id_tbl_lugar'), array_column($hoteles, 'id_tbl_lugar')
    ));

    $vacio = array('reservas_solicitadas' => 0, 'reservas_confirmadas' => 0, 'noches' => 0, 'monto' => 0,
                   'certificados_generados' => 0, 'certificados_usados' => 0, 'hoteles_activos' => 0);
    $provincias = array();
    foreach (rd_provincias() as $nombre)
        $provincias[$nombre] = array('provincia' => $nombre) + $vacio;
    $ciudades = array();
    $coordCiudad = array();   // clave ciudad → [id_est => [lat, lng]] para ubicar la burbuja
    $puntos = array();
    $sinUbicacion = 0;
    $sinCiudad = 0;

    $claveCiudad = function ($u) {
        return $u['id_ciudad'] ? 'c' . $u['id_ciudad'] : 'p' . $u['provincia'];
    };

    $sumar = function ($f, $valores) use (&$provincias, &$ciudades, &$coordCiudad, &$sinUbicacion, &$sinCiudad, $lugares, $vacio, $claveCiudad) {
        $u = $lugares[intval($f['id_tbl_lugar'])] ?? null;
        $cantidad = ($valores['reservas_solicitadas'] ?? 0) + ($valores['certificados_generados'] ?? 0);
        if (!$u || !$u['provincia']) {
            $sinUbicacion += $cantidad;
            return;
        }
        if (!$u['id_ciudad'])
            $sinCiudad += $cantidad;
        $kc = $claveCiudad($u);
        if (!isset($ciudades[$kc]))
            $ciudades[$kc] = array('id_ciudad' => $u['id_ciudad'], 'ciudad' => $u['ciudad'] ?: '(sin ciudad)',
                                   'provincia' => $u['provincia'], 'lat' => null, 'lng' => null) + $vacio;
        foreach ($valores as $k => $v) {
            $provincias[$u['provincia']][$k] += $v;
            $ciudades[$kc][$k] += $v;
        }
        if ($u['id_ciudad'] && rd_coordValida($f['latitud'], $f['longitud']))
            $coordCiudad[$kc][intval($f['id_est'])] = array(floatval($f['latitud']), floatval($f['longitud']));
    };

    $punto = function ($f, $valores) use (&$puntos, $lugares) {
        if (!rd_coordValida($f['latitud'], $f['longitud'])) return;
        $lat = floatval($f['latitud']);
        $lng = floatval($f['longitud']);
        $id = intval($f['id_est']);
        if (!isset($puntos[$id]))
            $puntos[$id] = array('establecimiento' => $f['titulo'], 'lat' => round($lat, 4), 'lng' => round($lng, 4),
                                 'provincia' => $lugares[intval($f['id_tbl_lugar'])]['provincia'] ?? null,
                                 'reservas_solicitadas' => 0, 'reservas_confirmadas' => 0, 'certificados_generados' => 0, 'certificados_usados' => 0);
        foreach ($valores as $k => $v)
            if (isset($puntos[$id][$k])) $puntos[$id][$k] += $v;
    };

    foreach ($reservas as $f) {
        $v = array('reservas_solicitadas' => intval($f['solicitadas']), 'reservas_confirmadas' => intval($f['confirmadas']),
                   'noches' => intval($f['noches']), 'monto' => floatval($f['monto']));
        $sumar($f, $v);
        $punto($f, $v);
    }
    foreach ($certificados as $f) {
        $v = array('certificados_generados' => intval($f['generados']), 'certificados_usados' => intval($f['usados']));
        $sumar($f, $v);
        $punto($f, $v);
    }
    foreach ($hoteles as $f) {
        $u = $lugares[intval($f['id_tbl_lugar'])] ?? null;
        if (!$u || !$u['provincia']) continue;
        $provincias[$u['provincia']]['hoteles_activos'] += intval($f['hoteles']);
        $kc = $claveCiudad($u);
        if (isset($ciudades[$kc])) $ciudades[$kc]['hoteles_activos'] += intval($f['hoteles']);
    }

    // Ubicación de la ciudad = centro de sus establecimientos con demanda
    foreach ($coordCiudad as $kc => $coords) {
        $ciudades[$kc]['lat'] = round(array_sum(array_column($coords, 0)) / count($coords), 4);
        $ciudades[$kc]['lng'] = round(array_sum(array_column($coords, 1)) / count($coords), 4);
    }

    $cerrar = function ($fila) {
        $fila['monto'] = round($fila['monto'], 2);
        $fila['solicitados'] = $fila['reservas_solicitadas'] + $fila['certificados_generados'];
        $fila['consumidos'] = $fila['reservas_confirmadas'] + $fila['certificados_usados'];
        $fila['sin_cobertura'] = $fila['solicitados'] > 0 && $fila['hoteles_activos'] == 0;
        return $fila;
    };
    $provincias = array_map($cerrar, array_values($provincias));
    $ciudades = array_map($cerrar, array_values($ciudades));
    $porDemanda = function ($a, $b) { return $b['solicitados'] - $a['solicitados']; };
    usort($provincias, $porDemanda);
    usort($ciudades, $porDemanda);

    $suma = function ($k) use ($provincias) { return array_sum(array_column($provincias, $k)); };
    return array(
        'resumen' => array(
            'reservas_solicitadas'   => $suma('reservas_solicitadas'),
            'reservas_confirmadas'   => $suma('reservas_confirmadas'),
            'certificados_generados' => $suma('certificados_generados'),
            'certificados_usados'    => $suma('certificados_usados'),
            'provincias_con_demanda' => count(array_filter($provincias, function ($p) { return $p['solicitados'] > 0; })),
            'provincias_sin_cobertura' => count(array_filter($provincias, function ($p) { return $p['sin_cobertura']; })),
            'ciudades_sin_cobertura' => count(array_filter($ciudades, function ($c) { return $c['id_ciudad'] && $c['sin_cobertura']; })),
            'sin_ubicacion'          => $sinUbicacion,
            'sin_ciudad'             => $sinCiudad,
            'ciudades_con_demanda'   => count(array_filter($ciudades, function ($c) { return $c['id_ciudad'] && $c['solicitados'] > 0; })),
        ),
        'provincias' => $provincias,
        'ciudades'   => $ciudades,
        'puntos'     => array_values($puntos),
    );
}
