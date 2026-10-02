<?php
/**
 * Plantilla de correo: Confirmacion de pago por transferencia / deposito.
 *
 * Se renderiza desde Mail::sendMailConfirmacionPago() con renderTemplate(),
 * por lo que aqui se dispone del arreglo $params.
 *
 * $params: nombre, cedula, telefono, correo, suscripcion, idProdSuscripcion,
 *          metodoPago, subtotal, iva, total, comprobanteUrl, fechaActual,
 *          codigoSolicitud, bancoDestino, fechaTransferencia, numDocumento.
 *
 * Misma identidad grafica que visitaEcuadorSuscripcion.php: encabezado verde
 * con logo, franja naranja, barra de redes, secciones con icono y cabecera
 * #aacc4d, y datos sobre #f0f8ea. Los estilos de $seccion y $fila son los de
 * esa plantilla; si cambian alla, cambiarlos aqui tambien.
 */
$e = function ($k) use ($params) {
    return isset($params[$k]) ? htmlentities((string)$params[$k], ENT_QUOTES, 'UTF-8') : '';
};

// Programas especiales (lista de precio 155): 523 Campana Mes del Turismo y
// 524 Embajadores. Son de 3 meses; el resto de paquetes ya dice su duracion en
// el titulo, asi que el "- 3 Meses" solo va en estos dos.
$esProgramaEspecial = in_array((string)(isset($params['idProdSuscripcion']) ? $params['idProdSuscripcion'] : ''), array('523', '524'), true);

// crearSuscripcionTransferencia manda este texto cuando no pudo crear la
// suscripcion; se resalta para que contabilidad lo revise.
$sinSuscripcion = isset($params['codigoSolicitud']) && strpos((string)$params['codigoSolicitud'], 'SIN SUSCRIPCION') === 0;

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

// Fila de dato: etiqueta a la izquierda, valor sobre fondo claro.
$fila = function ($etiqueta, $valor, $estiloValor = '') {
    return '<tr>'
        . '<td style="color: #2c305a; padding-top: 2px; padding-bottom: 2px"></td>'
        . '<td style="padding-left: 22px; color: #2c305a; padding-top: 1px; font-weight: 600; padding-bottom: 1px; font-size: 13px;">'
        . '<label>' . $etiqueta . '</label></td>'
        . '<td style="padding-left: 50px; background-color: #f0f8ea; color: #2c305a; padding-top: 1px; padding-bottom: 1px; font-size: 13px; font-weight: normal; border: #f0f8ea solid 1; ' . $estiloValor . '">'
        . '<label>' . $valor . '</label></td>'
        . '</tr>';
};

$tipoSuscripcion = $e('suscripcion') . ($esProgramaEspecial ? ' - 3 Meses' : '')
    . ($e('total') !== '' ? ' &nbsp;|&nbsp; $ ' . $e('total') : '');
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmaci&oacute;n de pago</title>
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
                <label>CONFIRMACI&Oacute;N DE PAGO - TRANSFERENCIA / DEP&Oacute;SITO</label>
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
                            <label style="font-family: Arial, sans-serif; color: white; font-size: 22px;">Nuevo pago por transferencia</label>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 0px; border: #96c121 solid 1.0; color: white; font-size: 13px; line-height: 1.2;">
                            <label style="font-family: Arial, sans-serif; color: white;">Un suscriptor envi&oacute; su comprobante de pago</label>
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
                <label>Se cre&oacute; una suscripci&oacute;n con pago por transferencia o dep&oacute;sito y qued&oacute; en estado <strong>Pago por Confirmar</strong>.<br>
                    Verifica el dep&oacute;sito y confirma o bloquea la suscripci&oacute;n desde el administrador (Suscriptores &rarr; Pagos por Confirmar).</label>
            </td>
        </tr>
    </table>
    <table width="750" align="center" cellspacing="0">
        <tr>
            <td align="left" style="border:solid #808080 1.0px">
                <table width="730" align="center" cellspacing="0">
                    <?php
                    echo $seccion('icon-13.png', 'Tipo de Suscripci&oacute;n', $tipoSuscripcion);

                    if ($e('codigoSolicitud') !== '')
                        echo $fila('Cod. Suscripci&oacute;n', $e('codigoSolicitud'),
                            $sinSuscripcion ? 'color: #e9840e; font-weight: 700;' : '');

                    echo $seccion('icon-14.png', 'Datos del cliente');
                    echo $fila('Nombres y apellidos', $e('nombre'));
                    echo $fila('C&eacute;dula', $e('cedula'));
                    echo $fila('Tel&eacute;fono', $e('telefono'));
                    echo $fila('Correo electr&oacute;nico',
                        '<a href="mailto:' . $e('correo') . '">' . $e('correo') . '</a>');

                    echo $seccion('icon-17.png', 'Datos del pago');
                    echo $fila('Forma de pago', $e('metodoPago'));
                    if ($e('bancoDestino') !== '')
                        echo $fila('Banco del dep&oacute;sito', $e('bancoDestino'));
                    if ($e('fechaTransferencia') !== '')
                        echo $fila('Fecha del dep&oacute;sito', $e('fechaTransferencia'));
                    if ($e('numDocumento') !== '')
                        echo $fila('N&deg; de documento', $e('numDocumento'));
                    if ($e('subtotal') !== '')
                        echo $fila('Subtotal', '$ ' . $e('subtotal'));
                    if ($e('iva') !== '')
                        echo $fila('IVA', '$ ' . $e('iva'));
                    echo $fila('Total depositado', '$ ' . $e('total'), 'font-weight: 700;');

                    if ($e('comprobanteUrl') !== '') {
                        echo $seccion('', 'Comprobante de pago');
                    ?>
                        <tr>
                            <td style="padding: 0px;"></td>
                            <td colspan="2" align="center" style="padding-top: 12px; padding-bottom: 4px;">
                                <a href="<?php echo $e('comprobanteUrl'); ?>" target="_blank">
                                    <img src="<?php echo $e('comprobanteUrl'); ?>" alt="Comprobante de pago"
                                        style="max-width: 600px; border: 1px solid #f0f8ea;" width="600">
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0px;"></td>
                            <td colspan="2" align="center" style="padding-top: 0px; font-size: 12px;">
                                <a href="<?php echo $e('comprobanteUrl'); ?>" target="_blank" style="color: #84b60a;">Ver / descargar el comprobante original</a>
                            </td>
                        </tr>
                    <?php } ?>
                </table>
            </td>
        </tr>
    </table>
    <table width="750" align="center" cellspacing="0">
        <tr>
            <td align="center" style="font-size: 11px; color: #909090; padding-top: 25px; border-bottom: #808080 solid 0.5px;">
                <label>Correo autom&aacute;tico generado desde visitaecuador.com<br>Por favor verificar el dep&oacute;sito antes de activar la suscripci&oacute;n.</label>
            </td>
        </tr>
    </table>
</body>

</html>
