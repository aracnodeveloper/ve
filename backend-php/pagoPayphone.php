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
 *          fechaActual, transaccion (array crudo de PayPhone).
 */
$e = function ($k) use ($params) {
    return isset($params[$k]) ? htmlentities((string)$params[$k], ENT_QUOTES, 'UTF-8') : '';
};

/** Fila etiqueta / valor. */
$fila = function ($etiqueta, $valor, $destacar = false) {
    $fondo = $destacar ? '#e9840e' : '#aacc4d';
    $tinta = $destacar ? '#ffffff' : '#2c305a';
    $peso  = $destacar ? '700' : '400';
    $tam   = $destacar ? '15px' : '13px';
    echo '<tr>'
        . '<td style="background-color: ' . $fondo . '; color: white; font-weight: 600; padding: 4px 12px; border: ' . $fondo . ' solid 1; font-size: 13px; width: 220px;"><label>' . $etiqueta . '</label></td>'
        . '<td style="background-color: ' . $fondo . '; border: ' . $fondo . ' solid 1; color: ' . $tinta . '; padding: 4px 12px; font-size: ' . $tam . '; font-weight: ' . $peso . ';"><label>'
        . (($valor === '' || $valor === null) ? '&mdash;' : htmlentities((string)$valor, ENT_QUOTES, 'UTF-8'))
        . '</label></td></tr>';
};
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo pago con tarjeta</title>
    <style>
        body {
            margin: 0;
            font-family: 'Open Sans', Arial, sans-serif;
            background-color: #ffffff;
            color: #2c305a;
        }

        td {
            border: 0px solid #ffffff;
            border-collapse: collapse;
        }
    </style>
</head>

<body bgcolor="#ffffff">
    <!-- Encabezado -->
    <table width="750" align="center" cellspacing="0">
        <tr>
            <td style="color:#84b60a; font-weight: 600; text-align: start; font-size: 13px; padding: 0px; padding-top: 2px;" align="start">
                <label>NUEVO PAGO CON TARJETA - PAYPHONE</label>
            </td>
        </tr>
    </table>
    <table style="background-color: #96c121;" width="750" align="center" cellspacing="0">
        <tr>
            <td style="padding: 10px; padding-left: 20px; border: #96c121 solid 1.0; width: 200px;" align="left">
                <img src="https://www.visitaecuador.com/img/mailing/nuevosRecursos/logo_ve_blanco.png" height="50">
            </td>
            <td align="center" style="padding: 10px; border: #96c121 solid 1.0;">
                <label style="font-family: Arial, sans-serif; color: white; font-size: 18px; font-weight: 800;">
                    Pago con tarjeta recibido
                </label><br>
                <label style="font-family: Arial, sans-serif; color: white; font-size: 13px;">
                    Cobro procesado por PayPhone desde el formulario de la web
                </label>
            </td>
        </tr>
    </table>
    <table style="background-color: #84b60a; padding: 0px; border: #84b60a solid 1.0;" width="750" align="center" cellspacing="0">
        <tr>
            <td align="center" style="height: 5px; padding: 0px; background-color: #e9840e; border:solid #e9840e 1.0;"></td>
        </tr>
    </table>

    <!-- Comprobante / transaccion -->
    <table width="750" align="center" cellspacing="0">
        <tr>
            <td align="left" style="border:solid #808080 1.0px; padding: 10px;">
                <table width="730" align="center" cellspacing="0">
                    <?php
                    $fila('N&deg; de lote (transactionId)', $e('transactionId'), true);
                    $fila('C&oacute;digo de autorizaci&oacute;n', $e('authorizationCode'));
                    $fila('Recap', $e('recap'));
                    $fila('Referencia del comercio', $e('clientTransactionId'));
                    $fila('Estado', $e('estado'));
                    $fila('Mensaje', $e('mensaje'));
                    $fila('Fecha de la transacci&oacute;n', $e('fechaTransaccion'));
                    ?>
                </table>
            </td>
        </tr>
    </table>

    <!-- Cliente -->
    <table width="750" align="center" cellspacing="0">
        <tr>
            <td align="left" style="border:solid #808080 1.0px; padding: 10px;">
                <table width="730" align="center" cellspacing="0">
                    <?php
                    $fila('Cliente', $e('nombre'));
                    $fila('Documento', $e('cedula'));
                    $fila('Correo', $e('correo'));
                    $fila('Tel&eacute;fono', $e('telefono'));
                    $fila('C&oacute;digo de suscriptor', $e('codigoSuscripcion'));
                    ?>
                </table>
            </td>
        </tr>
    </table>

    <!-- Compra -->
    <table width="750" align="center" cellspacing="0">
        <tr>
            <td align="left" style="border:solid #808080 1.0px; padding: 10px;">
                <table width="730" align="center" cellspacing="0">
                    <?php
                    $fila('Suscripci&oacute;n', $e('suscripcion'));
                    $fila('Tarjeta', trim($e('marcaTarjeta') . ' ' . $e('tarjeta')));
                    $fila('Bot&oacute;n de pago', $e('botonPago'));
                    $fila('Diferido', $e('diferido') . (($e('intereses') !== '') ? ' (' . $e('intereses') . ')' : ''));
                    $fila('Subtotal', '$ ' . $e('subtotal'));
                    $fila('IVA', '$ ' . $e('iva'));
                    $fila('Total cobrado', '$ ' . $e('total'), true);
                    ?>
                </table>
            </td>
        </tr>
    </table>

    <!-- Respuesta cruda: lo que PayPhone devolvio, para conciliar cualquier
         campo que no este arriba (p.ej. el recap, si lo envian con otro nombre). -->
    <?php if (!empty($params['transaccion']) && is_array($params['transaccion'])) { ?>
        <table width="750" align="center" cellspacing="0">
            <tr>
                <td align="left" style="border:solid #808080 1.0px; padding: 10px;">
                    <label style="font-size: 12px; color: #808080;">Respuesta completa de PayPhone</label>
                    <table width="730" align="center" cellspacing="0" style="margin-top: 6px;">
                        <?php foreach ($params['transaccion'] as $clave => $valor) {
                            if (is_array($valor) || is_object($valor)) $valor = json_encode($valor);
                            if (in_array(strtolower($clave), array('cardtoken', 'datapago'))) $valor = '(oculto)';
                            echo '<tr>'
                                . '<td style="padding: 2px 8px; font-size: 11px; color: #808080; width: 220px; border-bottom: 1px solid #eeeeee;">' . htmlentities((string)$clave, ENT_QUOTES, 'UTF-8') . '</td>'
                                . '<td style="padding: 2px 8px; font-size: 11px; color: #2c305a; border-bottom: 1px solid #eeeeee;">' . htmlentities((string)$valor, ENT_QUOTES, 'UTF-8') . '</td>'
                                . '</tr>';
                        } ?>
                    </table>
                </td>
            </tr>
        </table>
    <?php } ?>

    <!-- Pie -->
    <table width="750" align="center" cellspacing="0">
        <tr>
            <td align="center" style="padding: 10px; font-size: 11px; color: #808080;">
                <label>Generado autom&aacute;ticamente el <?php echo $e('fechaActual'); ?> por VisitaEcuador.com</label>
            </td>
        </tr>
    </table>
</body>

</html>
