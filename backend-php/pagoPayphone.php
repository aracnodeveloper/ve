<?php
/**
 * Plantilla de correo: pago con tarjeta a traves del formulario de PayPhone.
 *
 * Se renderiza desde Mail::sendMailPagoPayphone() con renderTemplate(), por lo
 * que aqui se dispone del arreglo $params.
 *
 * $params: nombre, cedula, telefono, correo, suscripcion, codigoSuscripcion,
 *          subtotal, iva, total, botonPago, diferido, intereses,
 *          transactionId (lote), clientTransactionId, authorizationCode,
 *          recap, tarjeta, marcaTarjeta, estado, mensaje, fechaTransaccion,
 *          fechaActual, transaccion (array crudo de PayPhone),
 *          consultaPayphone (respuesta de GET /api/sale/<transactionId>).
 *
 * Misma identidad grafica que visitaEcuadorSuscripcion.php y
 * confirmacionPago.php: encabezado verde con logo, franja naranja, barra de
 * redes, secciones con icono y cabecera #aacc4d, y datos sobre #f0f8ea.
 */

/**
 * Escapa para HTML, decodificando primero: varios textos ya llegan del API con
 * entidades (&oacute;, &ntilde;) y escaparlos otra vez los mostraba crudos
 * ("Suscripci&oacute;n VisitaEcuador.com 1 a&ntilde;o").
 */
$esc = function ($valor) {
    return htmlentities(html_entity_decode((string)$valor, ENT_QUOTES, 'UTF-8'), ENT_QUOTES, 'UTF-8');
};
$e = function ($k) use ($params, $esc) {
    return isset($params[$k]) ? $esc($params[$k]) : '';
};
/** Monto con signo de dolar, o vacio si no llego. */
$monto = function ($k) use ($e) {
    return $e($k) !== '' ? '$ ' . $e($k) : '';
};

$iconos = 'https://visitaecuador.com/img/mailing/nuevosRecursos/';

// Cabecera de seccion: icono + titulo en la barra verde. Sin icono ($icono
// vacio) la celda queda en blanco, para no usar uno que no corresponda.
$seccion = function ($icono, $titulo, $valor = '') use ($iconos) {
    return '<tr>'
        . '<td style="color: black; padding: 0px; width: 30px; padding-left: 5px; padding-right: 15px; vertical-align: middle;" align="center">'
        . ($icono !== '' ? '<img src="' . $iconos . $icono . '" width="17">' : '') . '</td>'
        . '<td style="background-color: #aacc4d; color: white; font-weight: 600; padding-top: 1px; padding-bottom: 1px; padding-left: 22px; border: #aacc4d solid 1; font-size: 13px; width: 160px;">'
        . '<label>' . $titulo . '</label></td>'
        . '<td style="background-color: #aacc4d; border: #aacc4d solid 1; color: #2c305a; padding-top: 1px; padding-bottom: 1px; padding-left: 50px; font-size: 13px;">'
        . '<label>' . $valor . '</label></td>'
        . '</tr>';
};

// Fila de dato: etiqueta a la izquierda, valor sobre fondo claro. $valor ya
// viene escapado; si esta vacio se muestra una raya para que se note que falta.
$fila = function ($etiqueta, $valor, $estiloValor = '') {
    return '<tr>'
        . '<td style="color: #2c305a; padding-top: 2px; padding-bottom: 2px"></td>'
        . '<td style="padding-left: 22px; color: #2c305a; padding-top: 1px; font-weight: 600; padding-bottom: 1px; font-size: 13px;">'
        . '<label>' . $etiqueta . '</label></td>'
        . '<td style="padding-left: 50px; background-color: #f0f8ea; color: #2c305a; padding-top: 1px; padding-bottom: 1px; font-size: 13px; font-weight: normal; border: #f0f8ea solid 1; ' . $estiloValor . '">'
        . '<label>' . ($valor === '' ? '&mdash;' : $valor) . '</label></td>'
        . '</tr>';
};

// Fila tecnica (respuesta cruda de PayPhone): mismos colores, letra menor.
$filaTecnica = function ($clave, $valor) use ($esc) {
    return '<tr>'
        . '<td style="padding: 0px;"></td>'
        . '<td style="padding-left: 22px; color: #2c305a; padding-top: 1px; padding-bottom: 1px; font-size: 11px; font-weight: 600;">' . $esc($clave) . '</td>'
        . '<td style="padding-left: 50px; background-color: #f0f8ea; color: #2c305a; padding-top: 1px; padding-bottom: 1px; font-size: 11px; border: #f0f8ea solid 1; word-break: break-all;">' . $esc($valor) . '</td>'
        . '</tr>';
};

/** Bloque con la respuesta cruda, ocultando los campos sensibles. */
$bloqueCrudo = function ($titulo, $detalle, $datos, $ocultar) use ($seccion, $filaTecnica) {
    $html = $seccion('', $titulo, $detalle);
    foreach ($datos as $clave => $valor) {
        if (is_array($valor) || is_object($valor)) $valor = json_encode($valor);
        if (in_array(strtolower($clave), $ocultar)) $valor = '(oculto)';
        $html .= $filaTecnica($clave, $valor);
    }
    return $html;
};

// El boton 5 es "Registro de tarjeta": no pasa por PayPhone, no genera
// transaccion y su cobro lo hace un operador a mano. Mostrar ahi las filas
// vacias solo confundia, asi que se avisa explicitamente.
$sinTransaccion = $e('transactionId') === '' && $e('authorizationCode') === '';

$tipoSuscripcion = $e('suscripcion') . ($e('total') !== '' ? ' &nbsp;|&nbsp; $ ' . $e('total') : '');
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo pago con tarjeta</title>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        body {
            margin: 0;
            font-family: 'Open Sans', sans-serif;
            background-color: #ffffff;
        }

        td {
            border: 0px solid #ffffff;
            border-collapse: collapse;
            padding: 10px;
        }
    </style>
</head>

<body bgcolor="#ffffff">
    <table width="750" align="center" cellspacing="0">
        <tr>
            <td style="color:#84b60a; font-weight: 600; text-align: start; font-size: 13px; padding: 0px; padding-top: 2px;" align="start">
                <label>NUEVO PAGO CON TARJETA - PAYPHONE</label>
            </td>
        </tr>
        <tr>
            <td style="color:#84b60a; font-weight: normal; text-align: start; font-size: 13px; padding: 0px; padding-bottom: 2px;" align="start">
                <label>Enviado el <?php echo $e('fechaActual'); ?></label>
            </td>
        </tr>
    </table>
    <table style="background-color: #96c121;" width="750" align="center" cellspacing="0">
        <tr>
            <td style="padding: 0px; padding-left: 7px; border: #96c121 solid 1.0; width: 50px;" align="center">
                <img src="<?php echo $iconos; ?>logo_ve_blanco.png" style="margin-left: 20px;" height="50">
            </td>
            <td align="center" style="padding: 0px; border: #96c121 solid 1.0; height: 90px;">
                <table width="400">
                    <tr>
                        <td align="center" style="padding: 0px; border: #96c121 solid 1.0; color: white; font-size: 15px; line-height: 1.2; padding-bottom: 5px; font-weight: 800;">
                            <label style="font-family: Arial, sans-serif; color: white; font-size: 22px;">Pago con tarjeta recibido</label>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 0px; border: #96c121 solid 1.0; color: white; font-size: 13px; line-height: 1.2;">
                            <label style="font-family: Arial, sans-serif; color: white;">Cobro procesado con el formulario de PayPhone (web o app)</label>
                        </td>
                    </tr>
                </table>
            </td>
            <td style="padding: 0; padding-right: 20px; border: #96c121 solid 1.0; width: 50px;" align="right">
                <img src="<?php echo $iconos; ?>cashback_verde.png" alt="Visita Ecuador" height="50" width="50">
            </td>
        </tr>
    </table>
    <table style="background-color: #84b60a; padding: 0px; border: #84b60a solid 1.0;" width="750" align="center" cellspacing="0">
        <tr>
            <td align="center" colspan="8" style="height: 5px; border:solid #e9840e 1.0; padding: 0px; background-color: #e9840e;">
            </td>
        </tr>
        <tr>
            <td align="center" style="height: 20px; width: 400px; border:solid #84b60a 1.0; padding: 0px; padding-bottom: 5px; padding-top: 5px;">
            </td>
            <td align="center" style="height: 20px; border:solid #84b60a 1.0; padding: 0px; padding-top: 5px; padding-right: 10px; padding-bottom: 5px;">
                <a href="https://api.whatsapp.com/send/?phone=593981850436&text&type=phone_number&app_absent=0"><img src="<?php echo $iconos; ?>whatsapp.png" width="20" height="20"></a>
            </td>
            <td align="center" style="height: 20px; border:solid #84b60a 1.0; padding: 0px; padding-top: 5px; padding-right: 10px; padding-bottom: 5px;">
                <a href="https://www.tiktok.com/@visitaecuador.com"><img src="<?php echo $iconos; ?>tiktok.png" width="20" height="20"></a>
            </td>
            <td align="center" style="height: 20px; border:solid #84b60a 1.0; padding: 0px; padding-top: 5px; padding-right: 10px; padding-bottom: 5px;">
                <a href="https://www.facebook.com/visitaecuadorcom"><img src="<?php echo $iconos; ?>facebook.png" width="20" height="20"></a>
            </td>
            <td align="center" style="height: 20px; border:solid #84b60a 1.0; padding: 0px; padding-top: 5px; padding-right: 10px; padding-bottom: 5px;">
                <a href="https://www.instagram.com/visitaecuadorcom/"><img src="<?php echo $iconos; ?>instagram.png" width="20" height="20"></a>
            </td>
            <td align="center" style="height: 20px; border:solid #84b60a 1.0; padding: 0px; padding-top: 5px; padding-right: 10px; padding-bottom: 5px;">
                <a href="https://www.youtube.com/channel/UClovC-v5-XvWcL2eYr4enXg"><img src="<?php echo $iconos; ?>youtube.png" width="20" height="20"></a>
            </td>
            <td align="center" style="height: 20px; border:solid #84b60a 1.0; padding: 0px; padding-top: 5px; padding-bottom: 5px;">
                <a href="https://www.youtube.com/channel/UClovC-v5-XvWcL2eYr4enXg"><img src="<?php echo $iconos; ?>twiterx.png" width="20" height="20"></a>
            </td>
            <td align="center" style="height: 20px; width: 400px; border:solid #84b60a 1.0; padding: 0px; padding-top: 5px; padding-bottom: 5px;">
            </td>
        </tr>
    </table>
    <table style="padding: 0px;" width="750" align="center" cellspacing="0">
        <tr>
            <td style="color:#84b60a; text-align: center; font-size: 13px; line-height: 1.2;" align="center">
                <?php if ($sinTransaccion) { ?>
                    <label>Se registr&oacute; una tarjeta para una suscripci&oacute;n, pero <strong>no se gener&oacute; un cobro en PayPhone</strong>.<br>
                        El cobro debe procesarse manualmente.</label>
                <?php } else { ?>
                    <label>Un cliente pag&oacute; su suscripci&oacute;n con tarjeta desde el formulario de PayPhone.<br>
                        Usa el <strong>N&deg; de lote</strong> para conciliar el cobro.</label>
                <?php } ?>
            </td>
        </tr>
    </table>
    <table width="750" align="center" cellspacing="0">
        <tr>
            <td align="left" style="border:solid #808080 1.0px">
                <table width="730" align="center" cellspacing="0">
                    <?php
                    echo $seccion('icon-13.png', 'Tipo de Suscripci&oacute;n', $tipoSuscripcion);
                    echo $fila('Cod. Suscripci&oacute;n', $e('codigoSuscripcion'));
                    echo $fila('Tarjeta', trim($e('marcaTarjeta') . ' ' . $e('tarjeta')));
                    echo $fila('Bot&oacute;n de pago', $e('botonPago'));
                    echo $fila('Diferido', $e('diferido') . (($e('intereses') !== '') ? ' (' . $e('intereses') . ')' : ''));
                    echo $fila('Subtotal', $monto('subtotal'));
                    echo $fila('IVA', $monto('iva'));
                    echo $fila($sinTransaccion ? 'Total a cobrar' : 'Total cobrado', $monto('total'), 'font-weight: 700;');

                    echo $seccion('icon-14.png', 'Datos del cliente');
                    echo $fila('Nombres y apellidos', $e('nombre'));
                    echo $fila('C&eacute;dula', $e('cedula'));
                    echo $fila('Tel&eacute;fono', $e('telefono'));
                    echo $fila('Correo electr&oacute;nico', $e('correo') !== ''
                        ? '<a href="mailto:' . $e('correo') . '">' . $e('correo') . '</a>' : '');

                    echo $seccion('icon-17.png', 'Transacci&oacute;n PayPhone');
                    if ($sinTransaccion) {
                        echo $fila('Sin transacci&oacute;n', 'La tarjeta qued&oacute; registrada y el cobro debe procesarse manualmente.',
                            'color: #e9840e; font-weight: 700;');
                        if ($e('estado') !== '')
                            echo $fila('Estado reportado', $e('estado'));
                    } else {
                        echo $fila('N&deg; de lote', $e('transactionId'), 'font-weight: 700;');
                        echo $fila('C&oacute;digo de autorizaci&oacute;n', $e('authorizationCode'));
                        echo $fila('Recap', $e('recap'));
                        echo $fila('Referencia del comercio', $e('clientTransactionId'));
                        echo $fila('Estado', $e('estado'));
                        echo $fila('Mensaje', $e('mensaje'));
                        echo $fila('Fecha de la transacci&oacute;n', $e('fechaTransaccion'));
                    }
                    ?>
                </table>
            </td>
        </tr>
    </table>

    <?php
    // Respuesta cruda: lo que PayPhone devolvio, para conciliar cualquier campo
    // que no este arriba (p.ej. el recap, si lo envian con otro nombre).
    $hayCreate   = !empty($params['transaccion']) && is_array($params['transaccion']);
    $hayConsulta = !empty($params['consultaPayphone']) && is_array($params['consultaPayphone']);
    if ($hayCreate || $hayConsulta) {
    ?>
        <table width="750" align="center" cellspacing="0" style="margin-top: 10px;">
            <tr>
                <td align="left" style="border:solid #808080 1.0px">
                    <table width="730" align="center" cellspacing="0">
                        <?php
                        if ($hayCreate)
                            echo $bloqueCrudo('Respuesta PayPhone', 'Datos devueltos al procesar el cobro', $params['transaccion'], array('cardtoken', 'datapago'));
                        if ($hayConsulta)
                            echo $bloqueCrudo('Consulta PayPhone', 'GET /api/sale/' . $e('transactionId'), $params['consultaPayphone'], array('cardtoken'));
                        ?>
                    </table>
                </td>
            </tr>
        </table>
    <?php } ?>

    <table width="750" align="center" cellspacing="0">
        <tr>
            <td align="center" style="font-size: 11px; color: #909090; padding-top: 25px; border-bottom: #808080 solid 0.5px;">
                <label>Correo autom&aacute;tico generado desde visitaecuador.com</label>
            </td>
        </tr>
    </table>
</body>

</html>
