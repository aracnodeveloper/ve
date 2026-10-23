<?php
/**
 * Plantilla de correo: "Agregar tu punto de carga" (mapa de Puntos de Carga de la web).
 *
 * Se renderiza desde Mail::sendMailContacto() con renderTemplate(), por lo que aqui se dispone
 * del arreglo $params.
 *
 * $params: ci, nombres, email, telefonos, direccion, ciudad, pais, mensaje,
 *          fotoEstablecimiento, fotoParqueadero, fotoLugar (URLs, cada una opcional),
 *          latitud, longitud (punto marcado en el mapa), fechaActual.
 *
 * Misma identidad grafica que visitaEcuadorSuscripcion.php, confirmacionPago.php y
 * pagoPayphone.php: encabezado verde con logo, franja naranja, barra de redes, secciones con
 * icono y cabecera #aacc4d, y datos sobre #f0f8ea.
 */
$e = function ($k) use ($params) {
    return isset($params[$k]) ? htmlentities(trim((string)$params[$k]), ENT_QUOTES, 'UTF-8') : '';
};

$iconos = 'https://visitaecuador.com/img/mailing/nuevosRecursos/';

// Cabecera de seccion: icono + titulo en la barra verde. Sin icono ($icono vacio) la celda queda
// en blanco, para no usar uno que no corresponda.
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

// Fila de dato: etiqueta a la izquierda, valor sobre fondo claro. Si esta vacio se muestra una
// raya, para que se note que la persona no lo lleno.
$fila = function ($etiqueta, $valor) {
    return '<tr>'
        . '<td style="color: #2c305a; padding-top: 2px; padding-bottom: 2px"></td>'
        . '<td style="padding-left: 22px; color: #2c305a; padding-top: 1px; font-weight: 600; padding-bottom: 1px; font-size: 13px;">'
        . '<label>' . $etiqueta . '</label></td>'
        . '<td style="padding-left: 50px; background-color: #f0f8ea; color: #2c305a; padding-top: 1px; padding-bottom: 1px; font-size: 13px; font-weight: normal; border: #f0f8ea solid 1;">'
        . '<label>' . ($valor === '' ? '&mdash;' : $valor) . '</label></td>'
        . '</tr>';
};

$ubicacion = trim(implode(', ', array_filter(array($e('ciudad'), $e('pais')))));

// Punto marcado en el mapa: solo se acepta si las dos coordenadas son numeros.
$coordenada = function ($k) use ($params) {
    $v = isset($params[$k]) ? trim((string)$params[$k]) : '';
    return is_numeric($v) ? $v : '';
};
$lat = $coordenada('latitud');
$lng = $coordenada('longitud');
// Fotos del formulario, cada una opcional. fotoUrl es el campo único de la versión
// anterior del formulario; se sigue aceptando por si llega de una página en caché.
// Solo se aceptan URLs http(s).
$fotos = array();
foreach (array(
    'fotoEstablecimiento' => 'Establecimiento',
    'fotoParqueadero'     => 'Parqueadero',
    'fotoLugar'           => 'Lugar del punto',
    'fotoUrl'             => 'Foto del punto',
) as $clave => $titulo) {
    if (preg_match('#^https?://#i', $e($clave)))
        $fotos[] = array('titulo' => $titulo, 'url' => $e($clave));
}

$enlaceMapa = ($lat !== '' && $lng !== '')
    ? '<a href="https://www.google.com/maps?q=' . $lat . ',' . $lng . '" target="_blank" style="color: #84b60a;">'
        . $lat . ', ' . $lng . '</a> &middot; <a href="https://www.google.com/maps?q=' . $lat . ',' . $lng
        . '" target="_blank" style="color: #84b60a;">Ver en el mapa</a>'
    : '';
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo punto de carga</title>
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
                <label>NUEVO PUNTO DE CARGA - FORMULARIO DE LA WEB</label>
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
                            <label style="font-family: Arial, sans-serif; color: white; font-size: 22px;">Nuevo punto de carga</label>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 0px; border: #96c121 solid 1.0; color: white; font-size: 13px; line-height: 1.2;">
                            <label style="font-family: Arial, sans-serif; color: white;">Alguien quiere sumar su punto al mapa de VisitaEcuador.com</label>
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
                <label>Esta persona llen&oacute; el formulario <strong>Agregar tu punto de carga</strong> en el mapa de la web.<br>
                    Para responderle basta con contestar este correo.</label>
            </td>
        </tr>
    </table>
    <table width="750" align="center" cellspacing="0">
        <tr>
            <td align="left" style="border:solid #808080 1.0px">
                <table width="730" align="center" cellspacing="0">
                    <?php
                    echo $seccion('icon-14.png', 'Datos de contacto', $ubicacion);
                    echo $fila('Nombres y apellidos', $e('nombres'));
                    echo $fila('C&eacute;dula', $e('ci'));
                    echo $fila('Tel&eacute;fonos', $e('telefonos'));
                    echo $fila('Correo electr&oacute;nico', $e('email') !== ''
                        ? '<a href="mailto:' . $e('email') . '">' . $e('email') . '</a>' : '');
                    echo $fila('Direcci&oacute;n', $e('direccion'));
                    echo $fila('Ciudad', $e('ciudad'));
                    echo $fila('Pa&iacute;s', $e('pais'));

                    echo $seccion('icon-13.png', 'Su punto de carga');
                    echo $fila('Ubicaci&oacute;n', $enlaceMapa);
                    ?>
                    <tr>
                        <td style="padding: 0px;"></td>
                        <td colspan="2" style="padding-top: 8px; padding-bottom: 4px;">
                            <div style="background-color: #f0f8ea; border: 1px solid #f0f8ea; border-radius: 4px; padding: 10px; color: #2c305a; font-size: 13px; line-height: 1.5;">
                                <?php echo nl2br($e('mensaje')) ?: '&mdash;'; ?>
                            </div>
                        </td>
                    </tr>

                    <?php if ($fotos) { ?>
                        <?php echo $seccion('', count($fotos) === 1 ? 'Foto' : 'Fotos'); ?>
                        <tr>
                            <td style="padding: 0px;"></td>
                            <td colspan="2" style="padding-top: 12px; padding-bottom: 4px;">
                                <table width="100%" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <?php foreach ($fotos as $foto) { ?>
                                            <td align="center" valign="top" width="<?php echo floor(100 / count($fotos)); ?>%" style="padding: 0 6px;">
                                                <div style="color: #2c305a; font-size: 12px; font-weight: 600; padding-bottom: 6px;"><?php echo $foto['titulo']; ?></div>
                                                <a href="<?php echo $foto['url']; ?>" target="_blank">
                                                    <img src="<?php echo $foto['url']; ?>" alt="<?php echo $foto['titulo']; ?>"
                                                        width="176" style="width: 176px; max-width: 100%; height: auto; border: 1px solid #e3eccf; border-radius: 4px;">
                                                </a>
                                                <div style="padding-top: 4px; font-size: 11px;">
                                                    <a href="<?php echo $foto['url']; ?>" target="_blank" style="color: #84b60a;">Ver en tama&ntilde;o original</a>
                                                </div>
                                            </td>
                                        <?php } ?>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 0px;"></td>
                            <td colspan="2" align="center" style="padding-top: 4px; font-size: 11px; color: #909090;">
                                Las fotos tambi&eacute;n van adjuntas a este correo.
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
                <label>Correo autom&aacute;tico generado desde visitaecuador.com</label>
            </td>
        </tr>
    </table>
</body>

</html>
