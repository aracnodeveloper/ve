<?php
/**
 * Agotamiento de una oferta con VARIOS rangos de fechas (tbl_oferta_agotada).
 *
 * Desplegar junto a gestionarOfertas.php (apiv1.7/hoteles/), queda publicado en
 *   POST /v1.7/est/gestionarAgotamientos/
 *
 * Parámetros POST:
 *   token          (requerido)
 *   accion         "listar" (default) | "guardar" | "eliminar"
 *   id_tbl_oferta  requerido en listar y guardar
 *   rangos         en guardar: [ { inicio, fin, comentario }, ... ] (lista completa;
 *                  vacía deja la oferta disponible). Formato de fecha "YYYY-MM-DD HH:MM:SS"
 *                  o "YYYY-MM-DDTHH:MM".
 *   id_tbl_oferta_agotada  requerido en eliminar
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

$method      = $_SERVER['REQUEST_METHOD'];
$fileExecute = $_SERVER['REQUEST_URI'];

try {

    if ($method != 'POST')
        throw new Exception("Método de conexión equivocado", 1004);

    $post = json_decode(file_get_contents("php://input"), true);

    $id_log_api = $app->log_api($post, $fileExecute);

    if (!$post)
        throw new Exception("No existen parámetros", 1001);

    if (!isset($post['token']) || empty($post['token']))
        throw new Exception("No existe token", 1002);

    if (!$userapp->AuthToken($post['token']))
        throw new Exception($userapp->error, $userapp->codeerror);

    // El usuario que guarda queda registrado en el rango; nunca se toma del cliente.
    $post['id_tbl_usuario'] = $userapp->id_tbl_usuario;

    $hotels = new Hotels($userapp->id_servicio);
    $accion = isset($post['accion']) ? $post['accion'] : 'listar';

    if ($accion === 'guardar') {

        if (($rangos = $hotels->guardarAgotamientosOferta($post)) === false)
            throw new Exception($hotels->error, $hotels->codeerror);

    } else if ($accion === 'eliminar') {

        if (!isset($post['id_tbl_oferta_agotada']))
            throw new Exception("Falta el id del agotamiento", 400);
        if (!$hotels->eliminarAgotamientoOferta($post['id_tbl_oferta_agotada']))
            throw new Exception($hotels->error, $hotels->codeerror);
        // Se devuelve la lista que queda, si se sabe de qué oferta es.
        $rangos = isset($post['id_tbl_oferta'])
            ? $hotels->listarAgotamientosOferta($post['id_tbl_oferta'])
            : array();

    } else if (isset($post['ids_ofertas']) && is_array($post['ids_ofertas'])) {

        // Listado por lote: el administrador pide los rangos de todas las ofertas
        // de un establecimiento de una sola vez. Devuelve [id_tbl_oferta => rangos].
        $rangos = $hotels->getAgotamientosOfertas($post['ids_ofertas']);

    } else {

        if (!isset($post['id_tbl_oferta']) || intval($post['id_tbl_oferta']) <= 0)
            throw new Exception("Falta la oferta", 400);
        $rangos = $hotels->listarAgotamientosOferta($post['id_tbl_oferta']);
    }

    $resultado = array(
        "estado" => true,
        "codigo" => 0,
        "msj"    => "Correcto",
        "data"   => $rangos,
    );

    $id_log_api = $app->log_api($resultado, $fileExecute, $id_log_api);
    echo __json_encode($resultado);

} catch (Exception $e) {
    $resultado = array('estado' => false, 'codigo' => $e->getCode(), 'msj' => $e->getMessage());
    $id_log_api = $app->log_api($resultado, $fileExecute, $id_log_api);
    echo json_encode($resultado);
}
