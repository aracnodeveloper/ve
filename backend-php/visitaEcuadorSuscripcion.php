<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        body {
            margin: 0;
            font-family: 'Open Sans', sans-serif;
            /*background-color: #e4e5e7;*/
        }

        .contenido {
            display: flex;
            justify-content: space-between;
            width: 100%;
            align-items: center;
        }

        td {
            border: 0px solid #ffffff;
            border-collapse: collapse;
            padding: 10px;
        }
    </style>
</head>

<body>
    <table width="750" align="center" cellspacing="0">
        <tr>
            <td style="color:#84b60a; font-weight: 600; text-align: start; font-size: 13px; padding: 0px; padding-top: 2px;" align="start">
                <label>SUSCRIPCION <?php if ($params['cortesia']) {
                                        echo (" - CORTESIA");
                                    } ?></label>
            </td>
        </tr>
        <tr>
            <td style="color:#84b60a; font-weight: normal; text-align: start; font-size: 13px;padding: 0px; padding-bottom: 2px;" align="start">
    <a style="color:#84b60a; " href="https://visitaecuador.com/#/suscripcion?codigo=<?php echo (htmlentities(explode(" - ", $params['patrocinador'])[1], ENT_QUOTES, 'UTF-8')); ?>">Patrocinada por: <?php echo (htmlentities($params['patrocinador'], ENT_QUOTES, 'UTF-8')); ?> - <?php echo (htmlentities($params['nombreVendedor'], ENT_QUOTES, 'UTF-8')); ?></a>
</td>
        </tr>
    </table>
    <table style="background-color: #96c121;" width="750" align="center" cellspacing="0">
        <tr>
            <td style="padding: 0px; padding-left: 7px; border: #96c121 solid 1.0; width: 50px;" align="center">
                <img src="https://visitaecuador.com/img/mailing/nuevosRecursos/logo_ve_blanco.png"
                    style="margin-left: 20px;" height="50">
            </td>
            <td style="padding: 0px; padding-left: 7px; border: #96c121 solid 1.0; width: 150px;" align="left">
                <img src="<?php echo $params['fotoBanner'] ?>"
                    style="margin-left: 20px;" height="90">
            </td>
            <td align="center" style="padding: 0px;border: #96c121 solid 1.0;">
                <table width="170">
                    <tr>
                        <td align="center" style="padding: 0px;border: #96c121 solid 1.0; color: white; font-size: 15px; line-height: 1.2; padding-bottom: 5px; font-weight: 800;">
                            <label style="font-family: Arial, sans-serif; color: white;">&iexcl;Hola <label style="font-family: Arial, sans-serif; color: white; font-size: 30; "><?php echo (htmlentities($params['nombre'], ENT_QUOTES, 'UTF-8')); ?></label>!</label>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 0px;border: #96c121 solid 1.0; color: white; font-size: 13px; line-height: 1.2;">
                            <label style="font-family: Arial, sans-serif; color: white; line-height: 0;">&iexcl;Estamos emocionados de<br>darte la bienvenida!</label>
                        </td>
                    </tr>
                </table>
            </td>
            <td style="padding: 0; border: #96c121 solid 1.0; width: 50px;" align="right">
                <img src="https://visitaecuador.com/img/mailing/nuevosRecursos/cashback_verde.png"
                    alt="Visita Ecuador" height="50" width="50">
            </td>
            <td style="padding: 0px; padding-right: 10px;border: #96c121 solid 1.0; width: 160px;" align="right">
                <table width="150">
                    <tr>
                        <td style="background-color: white; padding: 0px; border-radius: 5px;color: #f15a24; border: #84b60a solid 1.0; font-size: 12px;" align="center">
                            <label style="font-family: Arial, sans-serif; font-weight: bold; ">Especial de la semana</label>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: white; padding: 0px; border: #96c121 solid 1.0; font-size: 12px;" align="center">
                            <label style="font-family: Arial, sans-serif; font-weight: 600;">Sheraton Guayaquil <br>$230 a $95</label>
                        </td>
                    </tr>
                </table>
            </td>
            <td style="padding: 0; border: #96c121 solid 1.0; width: 40px;" align="right">
                <img src="https://visitaecuador.com/img/mailing/nuevosRecursos/ve_express-19.png"
                    alt="Visita Ecuador" height="40" width="40">
            </td>
        </tr>
    </table>
    <table style="background-color: #84b60a; padding: 0px; border: #84b60a solid 1.0;" width="750" align="center" cellspacing="0">
        <tr>
            <td align="center" colspan="8" style="height: 5px;  padding-right: 100px;border:solid #e9840e 1.0; padding: 0px; background-color: #e9840e;">
            </td>
        </tr>

        <?php if ($params['cortesia']) { ?>
            <tr></tr>
            <td style="padding: 0px; background-color: #FFDF80; height: 8px;border:solid #FFDF80 1.0" colspan="8"></td>
            </tr>
        <?php } ?>

        <tr>
            <td align="center" style="height: 20px; width: 400px; padding-right: 100px;border:solid #84b60a 1.0; padding: 0px;padding-bottom: 5px; padding-top: 5px;">
            </td>
            <td align="center" style="height: 20px; border:solid #84b60a 1.0; padding: 0px; padding-top: 5px; padding-right: 10px;padding-bottom: 5px;">
                <a href="https://api.whatsapp.com/send/?phone=593981850436&text&type=phone_number&app_absent=0"><img src="https://visitaecuador.com/img/mailing/nuevosRecursos/whatsapp.png" width="20" height="20"></a>
            </td>
            <td align="center" style="height: 20px; border:solid #84b60a 1.0; padding: 0px; padding-top: 5px; padding-right: 10px;padding-bottom: 5px;">
                <a href="https://www.tiktok.com/@visitaecuador.com"><img src="https://visitaecuador.com/img/mailing/nuevosRecursos/tiktok.png" width="20" height="20"></a>
            </td>
            <td align="center" style="height: 20px; border:solid #84b60a 1.0; padding: 0px; padding-top: 5px; padding-right: 10px;padding-bottom: 5px;">
                <a href="https://www.facebook.com/visitaecuadorcom"><img src="https://visitaecuador.com/img/mailing/nuevosRecursos/facebook.png" width="20" height="20"></a>
            </td>
            <td align="center" style="height: 20px; border:solid #84b60a 1.0; padding: 0px; padding-top: 5px; padding-right: 10px;padding-bottom: 5px;">
                <a href="https://www.instagram.com/visitaecuadorcom/"><img src="https://visitaecuador.com/img/mailing/nuevosRecursos/instagram.png" width="20" height="20"></a>
            </td>
            <td align="center" style="height: 20px; border:solid #84b60a 1.0; padding: 0px; padding-top: 5px; padding-right: 10px;padding-bottom: 5px;">
                <a href="https://www.youtube.com/channel/UClovC-v5-XvWcL2eYr4enXg"><img src="https://visitaecuador.com/img/mailing/nuevosRecursos/youtube.png" width="20" height="20"></a>
            </td>
            <td align="center" style="height: 20px; padding-right: 100px;border:solid #84b60a 1.0; padding: 0px; padding-top: 5px;padding-bottom: 5px;">
                <a href="https://www.youtube.com/channel/UClovC-v5-XvWcL2eYr4enXg"><img src="https://visitaecuador.com/img/mailing/nuevosRecursos/twiterx.png" width="20" height="20"></a>
            </td>
            <td align="center" style="height: 20px; width: 400px;padding-right: 100px;border:solid #84b60a 1.0; padding: 0px; padding-top: 5px; padding-bottom: 5px;">
            </td>
        </tr>
    </table>
    <table style=" padding: 0px;" width="750" align="center" cellspacing="0">
        <tr>
            <td style="color:#84b60a; text-align: center; font-size: 13px; line-height: 1.2;" align="center">
                <label>Hola, soy <?php echo (isset($params['nombreVendedor']) && $params['nombreVendedor'] != '' ? htmlentities($params['nombreVendedor'], ENT_QUOTES, 'UTF-8') : 'VisitaEcuador.com'); ?>, gracias por registrarte y confiar en mi.<br> Te invito a hacer uso de tu subscripci&oacute;n, seguro vas a disfrutar y viajar mucho.</label>
            </td>
        </tr>
    </table>
    <table width="750" align="center" cellspacing="0">
        <tr>
            <td align="left" style="border:solid #808080 1.0px">
                <table width="730" align="center" cellspacing="0">
                    <tr>
                        <td style="color: black; padding: 0px; width: 30px; padding-left: 5px; padding-right: 15px; vertical-align: middle;" align="center">
                            <img src="https://visitaecuador.com/img/mailing/nuevosRecursos/icon-13.png" width="17">
                        </td>
                        <td style="background-color: #aacc4d; color: white; font-weight: 600; padding-top: 1px; padding-bottom: 1px; padding-left: 22px; border: #aacc4d solid 1; font-size: 13px; width: 160px;">
                            <label>Tipo de Suscripci&oacute;n</label>
                        </td>
                        <td style="background-color: #aacc4d; border: #aacc4d solid 1; color: #2c305a; padding-top: 1px; padding-bottom: 1px; padding-left: 50px; font-size: 13px;" colspan="5">
                            <label>
                               <?php
                                    echo htmlentities($params['suscripcion'], ENT_QUOTES, 'UTF-8') . "   |   " .
                                        ($params['cortesia'] 
                                            ? "Cortesía" 
                                            : (strpos($params['patrocinador'], 'BYD1') !== false || strpos($params['patrocinador'], 'IB1') !== false 
                                                ? "" 
                                                : "$ " . $params['precioSuscripcion'])
                                        );
                                    ?>
                            </label>
                        </td>

                    </tr>
                    <tr>
                        <td style="color: #2c305a; padding-top: 2px; padding-bottom: 2px">
                        </td>
                        <td style="padding-left: 22px; color: #2c305a;  padding-top: 1px; font-weight: 600; padding-bottom: 1px; font-size: 13px;">
                            <label>Fecha de caducidad</label>
                        </td>
                        <td style="padding-left: 50px; background-color: #f0f8ea; color: #2c305a; padding-top: 1px; padding-bottom: 1px; font-size: 13px; font-weight: normal; border: #f0f8ea solid 1; " colspan="5">
                            <label><?php echo (htmlentities($params['fin_suscripcion'], ENT_QUOTES, 'UTF-8')); ?></label>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #2c305a; padding-top: 2px; padding-bottom: 2px">
                        </td>
                        <td style="padding-left: 22px; color: #2c305a;  padding-top: 1px; font-weight: 600; padding-bottom: 1px; font-size: 13px;">
                            <label>C&eacute;dula</label>
                        </td>
                        <td style="padding-left: 50px; background-color: #f0f8ea; color: #2c305a; padding-top: 1px; padding-bottom: 1px; font-size: 13px; font-weight: normal; border: #f0f8ea solid 1; " colspan="5">
                            <label><?php echo (htmlentities($params['usuario'], ENT_QUOTES, 'UTF-8')); ?></label>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #2c305a; padding-top: 2px; padding-bottom: 2px">
                        </td>
                        <td style="padding-left: 22px; color: #2c305a;  padding-top: 1px; font-weight: 600; padding-bottom: 1px; font-size: 13px;">
                            <label>Tel&eacute;fono</label>
                        </td>
                        <td style="padding-left: 50px; background-color: #f0f8ea; color: #2c305a; padding-top: 1px; padding-bottom: 1px; font-size: 13px; font-weight: normal; border: #f0f8ea solid 1; " colspan="5">
                            <label><?php echo ($params['telefono']); ?></label>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #2c305a; padding-top: 2px; padding-bottom: 2px">
                        </td>
                        <td style="padding-left: 22px; color: #2c305a;  padding-top: 1px; font-weight: 600; padding-bottom: 1px; font-size: 13px;">
                            <label>C&oacute;digo promocional</label>
                        </td>
                        <td style="padding-left: 50px; background-color: #f0f8ea; color: #2c305a; padding-top: 1px; padding-bottom: 1px; font-size: 13px; font-weight: normal; border: #f0f8ea solid 1; " colspan="5">
                            <label><?php echo (htmlentities($params['codigo'], ENT_QUOTES, 'UTF-8')); ?></label>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #2c305a; padding-top: 2px; padding-bottom: 2px">
                        </td>
                        <td style="padding-left: 22px; color: #2c305a;  padding-top: 1px; font-weight: 600; padding-bottom: 1px; font-size: 13px;">
                            <label>Cod. Suscripci&oacute;n</label>
                        </td>
                        <td style="padding-left: 50px; background-color: #f0f8ea; color: #2c305a; padding-top: 1px; padding-bottom: 1px; font-size: 13px; font-weight: normal; border: #f0f8ea solid 1; " colspan="5">
                            <label><?php echo (htmlentities($params['codSuscipcion'], ENT_QUOTES, 'UTF-8')); ?></label>
                        </td>
                    </tr>
                    <tr>
                        <td style=" color: black; padding-left: 5px; padding: 0px; padding-right: 15px;" align="center">
                            <img src="https://visitaecuador.com/img/mailing/nuevosRecursos/icon-14.png" width="17">
                        </td>
                        <td style="padding-left: 22px; background-color: #aacc4d; color: white; font-weight: 600; padding-top: 1px; padding-bottom: 1px;  border: #aacc4d solid 1;  font-size: 13px; ">
                            <label>Datos de ingreso</label>
                        </td>
                        <td style="background-color: #aacc4d; border: #aacc4d solid 1;  color: black; font-weight: bold; padding-top: 2px; padding-bottom: 2px" colspan="5"></td>
                    </tr>
                    <tr>
                        <td style="color: #2c305a; padding-top: 2px; padding-bottom: 2px">
                        </td>
                        <td style="padding-left: 22px; color: #2c305a; font-weight: 600; padding-top: 1px; padding-bottom: 1px; font-size: 13px;">
                            <label>Usuario</label>
                        </td>
                        <td style="padding-left: 50px; background-color: #f0f8ea; color: #2c305a; padding-top: 1px; padding-bottom: 1px; font-size: 13px; border: #f0f8ea solid 1; " colspan="5">
                            <label><?php echo (htmlentities($params['usuario'], ENT_QUOTES, 'UTF-8')); ?></label>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #2c305a; padding-top: 2px; padding-bottom: 2px">
                        </td>
                        <td style="padding-left: 22px; color: #2c305a; font-weight: 600; padding-top: 1px; padding-bottom: 1px; font-size: 13px;">
                            <label>Contrase&ntilde;a</label>
                        </td>
                        <td style="padding-left: 50px; background-color: #f0f8ea; color: #2c305a; padding-top: 1px; padding-bottom: 1px; font-size: 13px; border: #f0f8ea solid 1; " colspan="5">
                            <label><?php echo (htmlentities($params['clave'], ENT_QUOTES, 'UTF-8')); ?></label>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0px;color: black; padding-left: 5px; padding-right: 15px;" align="center">
                            <img src="https://visitaecuador.com/img/mailing/nuevosRecursos/icon-17.png" width="17">
                        </td>
                        <td style="padding-left: 22px; background-color: #aacc4d; color: white; font-weight: 600; padding-top: 1px; padding-bottom: 1px; border: #aacc4d solid 1; font-size: 13px;">
                            <label>Ingresa a tu cuenta</label>
                        </td>
                        <td style="background-color: #aacc4d; border: #aacc4d solid 1;  border: #aacc4d solid 1;  color: #2c305a; font-weight: bold; padding-top: 2px; padding-bottom: 2px" colspan="5"></td>
                    </tr>
                    <tr>
                        <td style="color: #2c305a; padding-top: 2px; padding-bottom: 2px">
                        </td>
                        <td style="padding-left: 22px; color: #2c305a; font-weight: 600; padding-top: 1px; padding-bottom: 1px; font-size: 13px;">
                            <label>Web</label>
                        </td>
                        <td style="padding-left: 50px; background-color: #f0f8ea; color: #2c305a; padding-top: 1px; padding-bottom: 1px; font-size: 13px; border: #f0f8ea solid 1; " colspan="5">
                            <a href="https://visitaecuador.com/">visitaecuador.com</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #2c305a; padding-top: 2px; padding-bottom: 2px">
                        </td>
                        <td style="padding-left: 22px; color: #2c305a; font-weight: 600; padding-top: 1px; padding-bottom: 1px; font-size: 13px;">
                            <label>App</label>
                        </td>
                        <td style="padding-left: 50px; background-color: #f0f8ea; color: #2c305a; padding-top: 1px; padding-bottom: 1px; font-size: 13px; border: #f0f8ea solid 1; " colspan="5">
                            <a href="https://visitaecuador.page.link/XktS">Desc&aacute;rgala Ahora</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: black; padding: 0px; padding-left: 5px; padding-right: 15px;" align="center">
                            <img src="https://visitaecuador.com/img/mailing/nuevosRecursos/icon-15.png" width="17">
                        </td>
                        <td style="padding-left: 22px; background-color: #aacc4d; color: white; font-weight: 600; padding-top: 1px; padding-bottom: 1px; border: #aacc4d solid 1; font-size: 13px;">
                            <label>Servicio al cliente</label>
                        </td>
                        <td style=" width: 40px; padding: 0px; background-color: #aacc4d; border: #aacc4d solid 1.0; "></td>
                        <td style="width: 150px; padding: 0px; background-color: #aacc4d; align-items: center; padding-left: 8px; color: #2c305a; text-decoration:none; border: #aacc4d solid 1.0; font-size: 13px; " align="center">
                            <a style="display: flex; align-items: center; color: #2c305a;text-decoration:none" href="https://api.whatsapp.com/send?phone=593986263432&text=Hola%20Denisse,%20quisiera%20que%20me%20asesores%20para%20mi%20proximo%20hospedaje%20">
                                <img src="https://visitaecuador.com/img/mailing/nuevosRecursos/whatsapp.png" height="16">
                                +593 9862 63432
                            </a>
                        </td>
                        <td style=" width: 10px; padding: 0px; background-color: #aacc4d; border: #aacc4d solid 1.0; "></td>
                        <td style="width: 150px;padding: 0px; background-color: #aacc4d; align-items: center;  padding-left: 8px; color: #2c305a; text-decoration: none; border: #aacc4d solid 1.0; font-size: 13px;" align="center">
                            <a style="display: flex; align-items: center; color: #2c305a; text-decoration:none" href="https://api.whatsapp.com/send?phone=593981850436&text=Hola%20Paula,%20quisiera%20que%20me%20asesores%20para%20mi%20proximo%20hospedaje%20">
                                <img src="https://visitaecuador.com/img/mailing/nuevosRecursos/whatsapp.png" height="16">
                                +593 9818 50436
                            </a>
                        </td>
                        <td style=" padding: 0px; background-color: #aacc4d; border: #aacc4d solid 1;"></td>
                    </tr>
                    <tr>
                        <td style="color: #2c305a; padding-top: 2px; padding-bottom: 2px">
                        </td>
                        <td style="padding-left: 22px; color: #1a1b22; font-weight: 600; padding-top: 1px; padding-bottom: 1px; font-size: 13px; border: #f0f8ea solid 1; ">
                            <label>Cont&aacute;ctenos</label>
                        </td>
                        <td style="padding-left: 50px; background-color: #f0f8ea; color: #2c305a; padding-top: 1px; padding-bottom: 1px; font-size: 13px;" colspan="5">
                            <a href="mailto:gerencia@visitaecuador.com">gerencia@visitaecuador.com</a>
                            <label>(593) 7 4134 500</label>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #2c305a; padding: 0px; padding-left: 5px; padding-right: 15px;" align="center">
                            <img src="https://visitaecuador.com/img/mailing/nuevosRecursos/icon-16.png" width="17">
                        </td>
                        <td style="padding-left: 22px; background-color: #aacc4d; color: white; font-weight: 600; padding-top: 1px; padding-bottom: 1px; border-right: #aacc4d solid 2px; border-left: #aacc4d solid 2px; font-size: 13px;">
                            <label>Agencias</label>
                        </td>
                        <td style="padding-left: 50px; background-color: #aacc4d; color: #2c305a; padding-top: 1px; padding-bottom: 1px; font-size: 13px;" colspan="5">
                            <a href="https://maps.app.goo.gl/AkkPCPQFdEshAASM8">Calle del Bat&aacute;n, 5-137</a>
                            <label>Cuenca - Ecuador</label>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <table width="750" align="center" cellspacing="0">
        <tr>
            <td align="center" style="font-size: 11px; color: #909090; padding-top: 25px; border-bottom: #808080 solid 0.5px;">
                <label>Gracias por unirte y explotar todos los beneficios<br>&iexcl;Estamos seguros que ahorrarp&aacute;s y disfrutar&aacute;s al m&aacute;ximo viajando con nosotros!</label>
            </td>
        </tr>
    </table>
</body>

</html>