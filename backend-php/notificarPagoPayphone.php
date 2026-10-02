<?php
/**
 *  notificarPagoPayphone.php
 *  Ruta: /var/www/html/api/apiv1.7/suscriptor/notificarPagoPayphone.php
 *  URL : {URL_SERVICIOS}/sus/notificarPagoPayphone/
 *
 *  Avisa a contabilidad de un cobro con tarjeta hecho desde el formulario de
 *  PayPhone. Antes solo llegaba el voucher de PayPhone, sin datos del cliente
 *  ni de la compra.
 *
 *  Se llama despues de crear la suscripcion: si el correo falla, no se aborta
 *  nada (la suscripcion ya existe y el cobro ya se hizo).
 *
 *  Recibe (JSON):
 *    personal:    { nombres, ci, email, celular }
 *    producto:    { titulo, subtotal, iva, total }
 *    pago:        { boton, diferido, intereses, codigo_suscripcion }
 *    transaccion: respuesta cruda de PayPhone
 *
 *  Devuelve: { estado, codigo, msj }
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include('configuraciones.php');

/**
 * Token de consulta de PayPhone (el mismo que usa getStatusTransaction en el
 * front). Deberia vivir en configuraciones.php junto al resto de credenciales;
 * queda aqui para no tocar ese archivo compartido.
 */
define('TOKEN_CONSULTA_PAYPHONE', '_lHifGqe0mLy7wQ-NElk3oX62v6KzkOjEkmn6DJwN_qPMoWUpCBc5ThqnMRcENtYVEfHPUFtBsiBYjuWnJhNihqZoDFqktxQxQsPkW455r4rsDhurhaNNhE-B9mZVYCryWVGK-h9gzvYzEXzaDOAvPkuA7mAQhBvgcojamlhk0RBE-gXum-VwXd_wQk2Y5aokqjAN4h9o5wBcLmBJ9g8C_0pj_jiN85hdkqK6_Nujk8H1MEQqPcVRY5w5KzdSz-yKX6CsAxCfp6-UGzufSUh5OeTQsaACdQnOlVTZ495ktUp8SNklZ-hfJ7xTehAeX4vhlzX9g');

/**
 * Consulta el detalle de la transaccion en PayPhone.
 *
 * El Create que usa el formulario devuelve solo 7 campos (cardToken,
 * authorizationCode, messageCode, status, statusCode, transactionId,
 * clientTransactionId): no trae recap, ni digitos de la tarjeta, ni fecha, ni
 * monto. Esta consulta es la que puede completarlos.
 *
 * Nunca lanza: si falla, el correo sale igual con lo que haya.
 *
 * @return array campos devueltos por PayPhone, o array vacio
 */
function consultarTransaccionPayphone($transactionId)
{
    $id = trim((string)$transactionId);
    if ($id === '' || !preg_match('/^[A-Za-z0-9_-]+$/', $id)) return array();

    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL            => 'https://pay.payphonetodoesposible.com/api/sale/' . rawurlencode($id),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 20,
        CURLOPT_HTTPHEADER     => array(
            'Authorization: Bearer ' . TOKEN_CONSULTA_PAYPHONE,
            'Accept: application/json'
        )
    ));
    $cruda  = curl_exec($curl);
    $codigo = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    if ($cruda === false || $codigo < 200 || $codigo >= 300)
        return array('_consulta' => 'PayPhone respondio HTTP ' . $codigo);

    $json = json_decode($cruda, true);
    return is_array($json) ? $json : array();
}

try {
    if ($_SERVER['REQUEST_METHOD'] != 'POST')
        throw new Exception("Metodo de conexion equivocado", 1004);

    $post = json_decode(file_get_contents("php://input"), true);
    if (!$post)
        throw new Exception("No existen parametros", 1001);

    $personal = isset($post['personal']) && is_array($post['personal']) ? $post['personal'] : array();
    $producto = isset($post['producto']) && is_array($post['producto']) ? $post['producto'] : array();
    $pago     = isset($post['pago'])     && is_array($post['pago'])     ? $post['pago']     : array();

    $g = function ($arr, $k, $def = '') {
        return isset($arr[$k]) ? $arr[$k] : $def;
    };

    // Solo el boton 4 cobra por el formulario de PayPhone. El 5 comparte la
    // misma pantalla en web y app pero es el registro de tarjeta de Banco
    // Austro (cobro manual, sin transaccion de PayPhone). Se filtra tambien
    // aqui para cubrir las versiones de la app ya instaladas, que lo enviaban.
    // id_boton lo mandan los clientes nuevos; los anteriores enviaban el id en
    // "boton".
    $idBoton = trim((string)$g($pago, 'id_boton', $g($pago, 'boton')));
    if ($idBoton !== '4') {
        echo json_encode(array(
            'estado' => false,
            'codigo' => 2,
            'msj'    => 'No aplica: solo se notifican pagos del formulario de PayPhone (boton 4)'
        ));
        exit;
    }

    $transaccion = isset($post['transaccion']) && is_array($post['transaccion'])
        ? $post['transaccion'] : array();

    // Se completa con la consulta a PayPhone cuando hubo transaccion real.
    $consulta = array();
    foreach ($transaccion as $k => $v) {
        if (strcasecmp($k, 'transactionId') === 0 && !empty($v)) {
            $consulta = consultarTransaccionPayphone($v);
            break;
        }
    }

    include_once($GLOBALS['vtClass'] . 'enviarMail.php');
    $mail = new Mail();

    $enviado = $mail->sendMailPagoPayphone(array(
        'nombre'            => $g($personal, 'nombres'),
        'cedula'            => $g($personal, 'ci'),
        'correo'            => $g($personal, 'email'),
        'telefono'          => $g($personal, 'celular'),

        'suscripcion'       => $g($producto, 'titulo'),
        'subtotal'          => $g($producto, 'subtotal'),
        'iva'               => $g($producto, 'iva'),
        'total'             => $g($producto, 'total'),

        'botonPago'         => $g($pago, 'boton'),
        'diferido'          => $g($pago, 'diferido'),
        'intereses'         => $g($pago, 'intereses'),
        'codigoSuscripcion' => $g($pago, 'codigo_suscripcion'),

        'transaccion'       => $transaccion,
        'consultaPayphone'  => $consulta
    ));

    echo json_encode(array(
        'estado' => (bool)$enviado,
        'codigo' => $enviado ? 0 : 1,
        'msj'    => $enviado ? 'Notificacion enviada' : 'No se pudo enviar la notificacion'
    ));
} catch (Exception $e) {
    echo json_encode(array(
        'estado' => false,
        'codigo' => $e->getCode(),
        'msj'    => $e->getMessage()
    ));
}
