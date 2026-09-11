<?php
/**
 *  crearSuscripcionTransferencia.php
 *  Ruta: /var/www/html/api/apiv1.7/suscriptor/crearSuscripcionTransferencia.php
 *  URL : {URL_SERVICIOS}/sus/crearSuscripcionTransferencia/
 *
 *  Crea la suscripcion de un pago por transferencia / deposito apenas el
 *  cliente sube su comprobante.
 *
 *  ANTES: se guardaba una fila en tbl_solicitud_suscripcion y la suscripcion se
 *  creaba recien cuando contabilidad aprobaba desde el administrador.
 *  AHORA: la suscripcion se crea de una vez pero nace con
 *  id_tbl_estado_pago_suscripcion = 9 ("Pago por Confirmar"). Contabilidad la
 *  revisa en el administrador y la pasa a 2 ("Pagado") o la bloquea/anula si el
 *  deposito nunca aparecio.
 *
 *  Recibe (JSON) exactamente lo mismo que el endpoint anterior:
 *    personal: { ci, nombres, email, celular, ciudad }
 *    producto: { id_producto, id_prod_suscripcion, id_lista_precio_producto,
 *                titulo, precio }
 *    codigo:   { id_codigo_promocional, codigo, ... }
 *    pago:     { subtotal, iva, total, comprobante_url, banco_destino,
 *                fecha_transferencia, num_documento }
 *    payload:  esquema completo para gestionarSuscripcion
 *
 *  Devuelve: { estado, codigo, msj, data: { codigo, clave, identificacion,
 *              id_suscripcion_renovacion, fecha_caducidad, notificado,
 *              correo_enviado } }
 *
 *  Depende de la clase SuscripcionPagoConfirmar (apiv1.7/classes/
 *  suscripcionPagoConfirmar.php), que comparte con el administrador.
 *
 *  ERRORES 820
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
include_once($GLOBALS['vtClass'] . 'suscripcionPagoConfirmar.php');

/**
 * Un error fatal dejaria la respuesta vacia y el cliente veria la pantalla
 * colgada sin saber si su pago se registro. Se responde JSON generico (el
 * detalle no se expone: este endpoint es publico) y queda en el log de PHP.
 */
/**
 * Serializa la respuesta sin quedarse mudo.
 *
 * json_encode() devuelve false cuando el arreglo trae bytes que no son UTF-8
 * valido (texto legacy en latin1), y "echo false" no imprime nada: el cliente
 * recibe 200 con el cuerpo vacio y solo ve "unexpected end of JSON input".
 * Se usa el wrapper del framework si existe y, si no, se sustituyen los bytes
 * invalidos antes que responder nada.
 */
function responderJson($resultado)
{
    if (function_exists('__json_encode')) {
        $txt = __json_encode($resultado);
        if (is_string($txt) && $txt !== '') return $txt;
    }

    $txt = json_encode($resultado);

    if ($txt === false && defined('JSON_INVALID_UTF8_SUBSTITUTE'))
        $txt = json_encode($resultado, JSON_INVALID_UTF8_SUBSTITUTE);

    if ($txt === false)
        $txt = json_encode(array(
            'estado' => false,
            'codigo' => 500,
            'msj'    => 'No se pudo codificar la respuesta: ' . json_last_error_msg()
        ));

    return $txt;
}

register_shutdown_function(function () {
    $err = error_get_last();
    if ($err === null) return;
    if (!in_array($err['type'], array(E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR))) return;

    echo json_encode(array(
        'estado' => false,
        'codigo' => 500,
        'msj'    => 'No pudimos completar el registro. Escribenos por WhatsApp con tu comprobante.'
    ));
});

/** Estado de pago con el que nace una suscripcion pagada por transferencia. */
define('ESTADO_PAGO_POR_CONFIRMAR', 9);

/**
 * Envia a contabilidad el correo con el comprobante. Nunca lanza: si el correo
 * falla, el proceso continua (la plata ya se deposito y la suscripcion ya
 * existe, no se puede abortar por un SMTP caido).
 *
 * @param array  $datos      datos del cliente / deposito
 * @param string $referencia codigo de suscripcion, o texto de aviso si fallo
 * @return bool
 */
function enviarCorreoContabilidad($datos, $referencia)
{
    try {
        include_once($GLOBALS['vtClass'] . 'enviarMail.php');
        $mail = new Mail();
        return $mail->sendMailConfirmacionPago(array(
            'nombres'            => $datos['nombres'],
            'cedula'             => $datos['ci'],
            'telefono'           => $datos['celular'],
            'correo'             => $datos['email'],
            'suscripcion'        => $datos['titulo_producto'],
            'subtotal'           => $datos['subtotal'],
            'iva'                => $datos['iva'],
            'total'              => $datos['total'],
            'comprobanteUrl'     => $datos['comprobante_url'],
            'codigoSolicitud'    => $referencia,
            'bancoDestino'       => $datos['banco_destino'],
            'fechaTransferencia' => $datos['fecha_transferencia'],
            'numDocumento'       => $datos['num_documento']
        ));
    } catch (Exception $e) {
        return false;
    }
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

    if (empty($personal['ci']))
        throw new Exception("No existe el documento de identidad", 1);
    if (empty($personal['nombres']))
        throw new Exception("No existen los nombres", 1);
    if (empty($personal['email']))
        throw new Exception("No existe el email", 1);
    if (empty($pago['comprobante_url']))
        throw new Exception("No existe el comprobante", 1);

    $payload = isset($post['payload']) && is_array($post['payload']) ? $post['payload'] : array();
    if (empty($payload))
        throw new Exception("No existe el detalle de la compra", 820);

    $g = function ($arr, $k, $def = '') {
        return isset($arr[$k]) ? $arr[$k] : $def;
    };

    // Datos que van al correo de contabilidad.
    $datos = array(
        'ci'                  => $g($personal, 'ci'),
        'nombres'             => $g($personal, 'nombres'),
        'email'               => $g($personal, 'email'),
        'celular'             => $g($personal, 'celular'),
        'titulo_producto'     => $g($producto, 'titulo'),
        'subtotal'            => $g($pago, 'subtotal'),
        'iva'                 => $g($pago, 'iva'),
        'total'               => $g($pago, 'total'),
        'comprobante_url'     => $g($pago, 'comprobante_url'),
        'banco_destino'       => $g($pago, 'banco_destino'),
        'fecha_transferencia' => $g($pago, 'fecha_transferencia'),
        'num_documento'       => $g($pago, 'num_documento')
    );

    /* ------------------------------------------------------------------ */
    /* 1. Crear la suscripcion en estado "Pago por Confirmar"              */
    /* ------------------------------------------------------------------ */

    // El estado se fuerza aqui aunque el front ya lo mande: asi ninguna version
    // vieja de la web o de la app puede crear una suscripcion por transferencia
    // que nazca marcada como pagada.
    if (!isset($payload['producto']['pago'][0]) || !is_array($payload['producto']['pago'][0]))
        throw new Exception("El detalle de la compra no trae el bloque de pago", 821);

    $payload['producto']['pago'][0]['id_tbl_estado_pago_suscripcion'] = ESTADO_PAGO_POR_CONFIRMAR;

    $urlGestionar = 'https://' . $_SERVER['HTTP_HOST'] . '/apiv1.7/suscriptor/gestionarSuscripcion.php';

    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL            => $urlGestionar,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_TIMEOUT        => 120,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_HTTPHEADER     => array('Content-Type: application/json'),
        CURLOPT_POSTFIELDS     => json_encode($payload)
    ));
    $respuestaCruda = curl_exec($curl);
    $errCurl        = curl_error($curl);
    curl_close($curl);

    $respuesta = json_decode($respuestaCruda, true);

    if (!is_array($respuesta) || empty($respuesta['estado'])) {
        $detalle = ($respuestaCruda === false || $respuestaCruda === '')
            ? $errCurl
            : (isset($respuesta['msj']) ? $respuesta['msj'] : substr((string)$respuestaCruda, 0, 200));

        // La suscripcion no se creo, pero el cliente ya deposito: el comprobante
        // no se puede perder. Se avisa igual a contabilidad para que lo gestione
        // a mano.
        enviarCorreoContabilidad($datos, 'SIN SUSCRIPCION - REVISAR');

        throw new Exception("No se pudo crear la suscripcion: " . $detalle, 822);
    }

    $datosSuscripcion = isset($respuesta['data']) && is_array($respuesta['data'])
        ? $respuesta['data']
        : array();

    $codigoSuscripcion = isset($datosSuscripcion['codigo']) ? $datosSuscripcion['codigo'] : '';

    $idRenovacion = isset($datosSuscripcion['id_suscripcion_renovacion'])
        ? intval($datosSuscripcion['id_suscripcion_renovacion'])
        : 0;

    /* ------------------------------------------------------------------ */
    /* 2. Estado "Pago por Confirmar" y comprobante                        */
    /* ------------------------------------------------------------------ */
    // El estado ya va en el payload, pero subscriber.php solo lo respeta si
    // tiene desplegado el override de crearSuscripcionRenovacion(); sin el,
    // deriva el estado de tbl_tipo_pago y la suscripcion nace en 1 ("Fondos por
    // Confirmar"). Se escribe aqui para que el flujo sea correcto en cualquier
    // caso; si ya quedo en 9, no hace nada.
    $estadoOk      = false;
    $comprobanteOk = false;
    if ($idRenovacion > 0) {
        $pagos    = new SuscripcionPagoConfirmar();
        $estadoOk = $pagos->marcarPorConfirmar($idRenovacion);

        // Detalle del deposito en su propia tabla. Antes se leia del blob
        // tbl_pago_boton.array_json, pero esa fila la escribe subscriber.php por
        // una rama que no contempla el boton 10 y no siempre queda utilizable.
        $comprobanteOk = (bool)$pagos->guardarComprobante($idRenovacion, array(
            'banco_destino'       => $datos['banco_destino'],
            'fecha_transferencia' => $datos['fecha_transferencia'],
            'num_documento'       => $datos['num_documento'],
            'comprobante_url'     => $datos['comprobante_url']
        ));
    }

    /* ------------------------------------------------------------------ */
    /* 3. Correo con la clave de acceso para el cliente                    */
    /* ------------------------------------------------------------------ */
    // gestionarSuscripcion NO lo envia: en el flujo normal lo dispara una
    // segunda llamada desde el front. La suscripcion queda activa desde ya, asi
    // que el cliente necesita su clave aunque el pago siga por confirmar.
    $notificado = false;

    if ($idRenovacion > 0) {
        $urlNotificar = 'https://' . $_SERVER['HTTP_HOST'] . '/apiv1.7/suscriptor/sendNotificacionSuscripcion.php';

        $curlN = curl_init();
        curl_setopt_array($curlN, array(
            CURLOPT_URL            => $urlNotificar,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_TIMEOUT        => 60,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_HTTPHEADER     => array('Content-Type: application/json'),
            CURLOPT_POSTFIELDS     => json_encode(array('id_suscripcion_renovacion' => $idRenovacion))
        ));
        $respNotif = curl_exec($curlN);
        curl_close($curlN);

        $jsonNotif  = json_decode($respNotif, true);
        $notificado = (is_array($jsonNotif) && !empty($jsonNotif['estado']));
    }

    /* ------------------------------------------------------------------ */
    /* 4. Correo a contabilidad con el comprobante                         */
    /* ------------------------------------------------------------------ */
    $correoEnviado = enviarCorreoContabilidad($datos, $codigoSuscripcion);

    echo responderJson(array(
        'estado' => true,
        'codigo' => 0,
        'msj'    => 'Suscripcion creada, pago por confirmar',
        'data'   => array(
            'codigo'                    => $codigoSuscripcion,
            'clave'                     => isset($datosSuscripcion['clave']) ? $datosSuscripcion['clave'] : '',
            'identificacion'            => isset($datosSuscripcion['identificacion']) ? $datosSuscripcion['identificacion'] : '',
            'id_suscripcion_renovacion' => $idRenovacion,
            'fecha_caducidad'           => isset($datosSuscripcion['fecha_caducidad']) ? $datosSuscripcion['fecha_caducidad'] : '',
            'fecha_caducidad_texto'     => isset($datosSuscripcion['fecha_caducidad_texto']) ? $datosSuscripcion['fecha_caducidad_texto'] : '',
            'estado_pago'               => ESTADO_PAGO_POR_CONFIRMAR,
            'estado_pago_ok'            => $estadoOk,
            'comprobante_ok'            => $comprobanteOk,
            'notificado'                => $notificado,
            'correo_enviado'            => $correoEnviado
        )
    ));
} catch (Throwable $e) {
    echo responderJson(array(
        'estado' => false,
        'codigo' => $e->getCode(),
        'msj'    => $e->getMessage()
    ));
}
