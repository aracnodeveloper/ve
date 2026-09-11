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

        'transaccion'       => isset($post['transaccion']) && is_array($post['transaccion'])
            ? $post['transaccion'] : array()
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
