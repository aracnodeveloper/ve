<?php
/**
 * Plantilla de correo: Confirmacion de pago por transferencia / deposito.
 *
 * Se renderiza desde Mail::sendMailConfirmacionPago() con renderTemplate(),
 * por lo que aqui se dispone del arreglo $params.
 *
 * $params: nombre, cedula, telefono, correo, suscripcion, metodoPago,
 *          subtotal, iva, total, comprobanteUrl, fechaActual.
 */
$e = function ($k) use ($params) {
    return isset($params[$k]) ? htmlentities((string)$params[$k], ENT_QUOTES, 'UTF-8') : '';
};
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmaci&oacute;n de pago</title>
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
                <label>CONFIRMACI&Oacute;N DE PAGO - TRANSFERENCIA / DEP&Oacute;SITO</label>
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
                    Nuevo pago por transferencia
                </label><br>
                <label style="font-family: Arial, sans-serif; color: white; font-size: 13px;">
                    Un suscriptor envi&oacute; su comprobante de pago
                </label>
            </td>
        </tr>
    </table>
    <table style="background-color: #84b60a; padding: 0px; border: #84b60a solid 1.0;" width="750" align="center" cellspacing="0">
        <tr>
            <td align="center" style="height: 5px; padding: 0px; background-color: #e9840e; border:solid #e9840e 1.0;"></td>
        </tr>
    </table>

    <!-- Mensaje -->
    <table width="750" align="center" cellspacing="0">
        <tr>
            <td style="color:#84b60a; text-align: center; font-size: 13px; line-height: 1.4; padding: 12px 10px;" align="center">
                <label>
                    Se cre&oacute; una suscripci&oacute;n con pago por transferencia o dep&oacute;sito y qued&oacute; en estado
                    <strong>Pago por Confirmar</strong>.<br>
                    Verifica el dep&oacute;sito y confirma o bloquea la suscripci&oacute;n desde el administrador
                    (Suscriptores &rarr; Pagos por Confirmar).
                </label>
            </td>
        </tr>
    </table>

    <!-- Datos del cliente -->
    <table width="750" align="center" cellspacing="0">
        <tr>
            <td align="left" style="border:solid #808080 1.0px; padding: 10px;">
                <table width="730" align="center" cellspacing="0">
                    <?php if ($e('codigoSolicitud') !== '') { ?>
                        <tr>
                            <td style="background-color: #e9840e; color: white; font-weight: 700; padding: 6px 12px; border: #e9840e solid 1; font-size: 14px; width: 200px;">
                                <label>Suscripci&oacute;n N&deg;</label>
                            </td>
                            <td style="background-color: #e9840e; border: #e9840e solid 1; color: #ffffff; padding: 6px 12px; font-size: 16px; font-weight: 700;">
                                <label><?php echo $e('codigoSolicitud'); ?></label>
                            </td>
                        </tr>
                    <?php } ?>
                    <tr>
                        <td style="background-color: #aacc4d; color: white; font-weight: 600; padding: 4px 12px; border: #aacc4d solid 1; font-size: 13px; width: 200px;">
                            <label>Suscripci&oacute;n</label>
                        </td>
                        <td style="background-color: #aacc4d; border: #aacc4d solid 1; color: #2c305a; padding: 4px 12px; font-size: 13px;">
                            <label><?php echo $e('suscripcion'); ?></label>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 12px; color: #2c305a; font-weight: 600; font-size: 13px;">
                            <label>Nombres y apellidos</label>
                        </td>
                        <td style="padding: 4px 12px; background-color: #f0f8ea; color: #2c305a; font-size: 13px; border: #f0f8ea solid 1;">
                            <label><?php echo $e('nombre'); ?></label>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 12px; color: #2c305a; font-weight: 600; font-size: 13px;">
                            <label>Documento de identidad</label>
                        </td>
                        <td style="padding: 4px 12px; background-color: #f0f8ea; color: #2c305a; font-size: 13px; border: #f0f8ea solid 1;">
                            <label><?php echo $e('cedula'); ?></label>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 12px; color: #2c305a; font-weight: 600; font-size: 13px;">
                            <label>Tel&eacute;fono</label>
                        </td>
                        <td style="padding: 4px 12px; background-color: #f0f8ea; color: #2c305a; font-size: 13px; border: #f0f8ea solid 1;">
                            <label><?php echo $e('telefono'); ?></label>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 12px; color: #2c305a; font-weight: 600; font-size: 13px;">
                            <label>Correo electr&oacute;nico</label>
                        </td>
                        <td style="padding: 4px 12px; background-color: #f0f8ea; color: #2c305a; font-size: 13px; border: #f0f8ea solid 1;">
                            <a href="mailto:<?php echo $e('correo'); ?>"><?php echo $e('correo'); ?></a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 12px; color: #2c305a; font-weight: 600; font-size: 13px;">
                            <label>Forma de pago</label>
                        </td>
                        <td style="padding: 4px 12px; background-color: #f0f8ea; color: #2c305a; font-size: 13px; border: #f0f8ea solid 1;">
                            <label><?php echo $e('metodoPago'); ?></label>
                        </td>
                    </tr>
                    <?php if ($e('bancoDestino') !== '') { ?>
                        <tr>
                            <td style="padding: 4px 12px; color: #2c305a; font-weight: 600; font-size: 13px;">
                                <label>Banco del dep&oacute;sito</label>
                            </td>
                            <td style="padding: 4px 12px; background-color: #f0f8ea; color: #2c305a; font-size: 13px; border: #f0f8ea solid 1;">
                                <label><?php echo $e('bancoDestino'); ?></label>
                            </td>
                        </tr>
                    <?php } ?>
                    <?php if ($e('fechaTransferencia') !== '') { ?>
                        <tr>
                            <td style="padding: 4px 12px; color: #2c305a; font-weight: 600; font-size: 13px;">
                                <label>Fecha del dep&oacute;sito</label>
                            </td>
                            <td style="padding: 4px 12px; background-color: #f0f8ea; color: #2c305a; font-size: 13px; border: #f0f8ea solid 1;">
                                <label><?php echo $e('fechaTransferencia'); ?></label>
                            </td>
                        </tr>
                    <?php } ?>
                    <?php if ($e('numDocumento') !== '') { ?>
                        <tr>
                            <td style="padding: 4px 12px; color: #2c305a; font-weight: 600; font-size: 13px;">
                                <label>N&deg; de documento</label>
                            </td>
                            <td style="padding: 4px 12px; background-color: #f0f8ea; color: #2c305a; font-size: 13px; border: #f0f8ea solid 1;">
                                <label><?php echo $e('numDocumento'); ?></label>
                            </td>
                        </tr>
                    <?php } ?>
                    <tr>
                        <td style="padding: 4px 12px; color: #2c305a; font-weight: 600; font-size: 13px;">
                            <label>Fecha de env&iacute;o</label>
                        </td>
                        <td style="padding: 4px 12px; background-color: #f0f8ea; color: #2c305a; font-size: 13px; border: #f0f8ea solid 1;">
                            <label><?php echo $e('fechaActual'); ?></label>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Valores -->
    <table width="750" align="center" cellspacing="0" style="margin-top: 10px;">
        <tr>
            <td align="left" style="border:solid #808080 1.0px; padding: 10px;">
                <table width="730" align="center" cellspacing="0">
                    <tr>
                        <td style="background-color: #aacc4d; color: white; font-weight: 600; padding: 4px 12px; border: #aacc4d solid 1; font-size: 13px; width: 200px;">
                            <label>Valores</label>
                        </td>
                        <td style="background-color: #aacc4d; border: #aacc4d solid 1; padding: 4px 12px; font-size: 13px;"></td>
                    </tr>
                    <?php if ($e('subtotal') !== '') { ?>
                        <tr>
                            <td style="padding: 4px 12px; color: #2c305a; font-weight: 600; font-size: 13px;">
                                <label>Subtotal</label>
                            </td>
                            <td style="padding: 4px 12px; background-color: #f0f8ea; color: #2c305a; font-size: 13px; border: #f0f8ea solid 1;">
                                <label>$ <?php echo $e('subtotal'); ?></label>
                            </td>
                        </tr>
                    <?php } ?>
                    <?php if ($e('iva') !== '') { ?>
                        <tr>
                            <td style="padding: 4px 12px; color: #2c305a; font-weight: 600; font-size: 13px;">
                                <label>IVA</label>
                            </td>
                            <td style="padding: 4px 12px; background-color: #f0f8ea; color: #2c305a; font-size: 13px; border: #f0f8ea solid 1;">
                                <label>$ <?php echo $e('iva'); ?></label>
                            </td>
                        </tr>
                    <?php } ?>
                    <tr>
                        <td style="padding: 6px 12px; color: #2c305a; font-weight: 700; font-size: 14px;">
                            <label>Total depositado</label>
                        </td>
                        <td style="padding: 6px 12px; background-color: #f0f8ea; color: #84b60a; font-size: 16px; font-weight: 700; border: #f0f8ea solid 1;">
                            <label>$ <?php echo $e('total'); ?></label>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Comprobante -->
    <?php if ($e('comprobanteUrl') !== '') { ?>
        <table width="750" align="center" cellspacing="0" style="margin-top: 10px;">
            <tr>
                <td align="center" style="border:solid #808080 1.0px; padding: 12px;">
                    <table width="730" align="center" cellspacing="0">
                        <tr>
                            <td style="background-color: #aacc4d; color: white; font-weight: 600; padding: 4px 12px; border: #aacc4d solid 1; font-size: 13px;" align="center">
                                <label>Comprobante de pago</label>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding-top: 12px;">
                                <a href="<?php echo $e('comprobanteUrl'); ?>" target="_blank">
                                    <img src="<?php echo $e('comprobanteUrl'); ?>" alt="Comprobante de pago"
                                        style="max-width: 600px; border: 1px solid #dddddd;" width="600">
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding-top: 10px; font-size: 12px;">
                                <a href="<?php echo $e('comprobanteUrl'); ?>" target="_blank" style="color:#84b60a;">
                                    Ver / descargar el comprobante original
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    <?php } ?>

    <!-- Pie -->
    <table width="750" align="center" cellspacing="0">
        <tr>
            <td align="center" style="font-size: 11px; color: #909090; padding-top: 25px; border-bottom: #808080 solid 0.5px;">
                <label>Correo autom&aacute;tico generado desde visitaecuador.com<br>
                    Por favor verificar el dep&oacute;sito antes de activar la suscripci&oacute;n.</label>
            </td>
        </tr>
    </table>
</body>

</html>
