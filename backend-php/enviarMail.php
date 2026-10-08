<?php

require_once $GLOBALS['vtClass'] . 'cl_phpmailer.php';
//error_reporting(E_ALL); ini_set('display_errors', 1);

class Mail extends Model
{
    public function __construct()
    {
        $this->helper = new Helper();
        $this->emails = new PHPMailer(true);
        $this->model = new Model();
        $this->connect_db();
    }

public function configureSMTP()
{
    $this->emails->IsSMTP();
    $this->emails->Host = "correo.visitaecuador.com"; 
    $this->emails->SMTPAuth = true; 
    
    // CAMBIO CLAVE: Usar SSL en lugar de TLS
    $this->emails->SMTPSecure = 'ssl'; 
    $this->emails->Port = 465; 

    // ELIMINAR COMPLETAMENTE: $this->emails->AuthType = "NTLM";
    
    $this->emails->Username = "suscripciones@visitaecuador.com"; 
    $this->emails->Password = "df.Dfd5*._d";
    $this->emails->SMTPOptions = array(
    'ssl' => array(
        'verify_peer' => false,
        'verify_peer_name' => false,
        'allow_self_signed' => true
    )
);
    $this->emails->isHTML(true);
    $this->emails->SetFrom('suscripciones@visitaecuador.com', 'visitaEcuador.com');
}

    public function configureSMTPDisney()
    {

        $this->emails->IsSMTP();
        $this->emails->Host = "correo.visitaecuador.com"; // SMTP server
        $this->emails->SMTPAuth = true; // enable SMTP authentication
        $this->emails->SMTPDebug = 0;
        $this->emails->Port = 587;
        $this->emails->AuthType = "NTLM"; // SMTP account username
        $this->emails->Username = "disneyconcierge@visitaecuador.com";
        $this->emails->Password = "2020Trabajo.*";
        $this->emails->isHTML(true);
        $this->emails->SetFrom('disneyconcierge@visitaecuador.com', 'DisneyConcierg.app');
    }
    private function renderTemplate($templatePath, $params)
    {
        if (!file_exists($templatePath)) {
            throw new Exception("El archivo de plantilla no existe: $templatePath");
        }
        extract($params); // Extraer los parámetros como variables
        ob_start(); // Iniciar el buffer de salida
        include $templatePath; // Incluir el archivo de la plantilla
        return ob_get_clean(); // Obtener el contenido del buffer y limpiarlo
    }

    public function sendMailPrueba($post)
    {
        try {

            $this->configureSMTP();
            $this->emails->addAddress("carrilloedisson@gmail.com", "PruebaMail");
            $this->emails->addAddress("programacion@visitaecuador.com", "PruebaMail");
            //$this->emails->addAddress("desarrollo@visitaecuador.com", "PruebaMail");
            //$this->emails->addAddress("carrilloedisson@gmail.com", "PruebaMail");
            //$this->emails->addAddress("contabilidad3@visitaecuador.com", "solicitud de pago Cashback");
            // $this->emails->addAddress($post['email'], $post['nombres']);

            $plantillaPath = $GLOBALS['vtClass'] . 'plantillasMail/prueba.php';

            $params = [
                'nombre' => 'Eddisson',
                'email' => 'carrilloedisson@gmail.com',
            ];

            $contenido = $this->renderTemplate($plantillaPath, $params);
            $this->emails->Subject = ("PruebaMail");
            $this->emails->Body = $contenido;

            $infoEmail = $this->emails->Send();
            return true;
        } catch (phpmailerException $e) {
            $this->error = "mailer: " . $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        } catch (Exception $e) {
            $this->error = $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        }
    }


    /**
     * Correo de los formularios de la web: Contacto, Emprende con Nosotros y
     * "Agregar tu punto de carga" (mapa de Puntos de Carga).
     *
     * Contacto / Emprendedor: To gerencia@, CC subgerencia@ + gventas@, BCC desarrollo@.
     *   Cuerpo armado en armarBodyContacto().
     * Punto de carga: To gerencia@, desarrollo@, asistentecomercial@ y gventas@, con su
     *   propia plantilla (plantillasMail/puntoCarga.php).
     *
     * En los tres casos el Reply-To es el correo de quien escribio, para responderle directo.
     *
     * $post: tipo (contactoWeb | emprendedor | puntoCarga), ci, nombres, email, telefonos,
     *        direccion, ciudad, pais, mensaje.
     */
    public function sendMailContacto($post)
    {
        try {
            $this->configureSMTP();

            $tipo = isset($post['tipo']) ? $post['tipo'] : '';
            $esEmprendedor = ($tipo === 'emprendedor');
            // Formulario "Agregar tu punto de carga" (mapa de Puntos de Carga).
            $esPuntoCarga = ($tipo === 'puntoCarga');

            if ($esPuntoCarga) {
                $this->emails->addAddress("gerencia@visitaecuador.com", "Gerencia");
                $this->emails->addAddress("desarrollo@visitaecuador.com", "Desarrollo");
                $this->emails->addAddress("asistentecomercial@visitaecuador.com", "Asistente Comercial");
                $this->emails->addAddress("gventas@visitaecuador.com", "Gerente Ventas");
            } else {
                $this->emails->addAddress("gerencia@visitaecuador.com", "Gerencia");
                $this->emails->addCC("subgerencia@visitaecuador.com", "Subgerencia");
                $this->emails->addCC("gventas@visitaecuador.com", "Gerente Ventas");
                // Copia oculta para desarrollo.
                $this->emails->addBCC("desarrollo@visitaecuador.com", "Desarrollo");
            }

            // Responder al interesado directamente desde el correo.
            if (!empty($post['email']) && filter_var(trim($post['email']), FILTER_VALIDATE_EMAIL)) {
                $this->emails->addReplyTo(trim($post['email']), isset($post['nombres']) ? $post['nombres'] : '');
            }

            if ($esPuntoCarga)
                $this->emails->Subject = "Nuevo punto de carga - VisitaEcuador.com";
            elseif ($esEmprendedor)
                $this->emails->Subject = "Nuevo emprendedor - VisitaEcuador.com";
            else
                $this->emails->Subject = "Nuevo contacto web - VisitaEcuador.com";

            if ($esPuntoCarga) {
                // Plantilla propia, con la identidad grafica de los demas correos.
                $datos = $post;
                $datos['fechaActual'] = date('d/m/Y H:i');
                $this->emails->Body = $this->renderTemplate(
                    $GLOBALS['vtClass'] . 'plantillasMail/puntoCarga.php',
                    $datos
                );
                // La foto va embebida en el correo (la plantilla la muestra por
                // su URL) y ademas adjunta, para poder guardarla sin entrar a la
                // web. Solo se adjunta si el archivo esta en este servidor.
                $this->adjuntarFotoPuntoCarga(isset($post['fotoUrl']) ? $post['fotoUrl'] : '');
            } else {
                $titulo = $esEmprendedor ? "Nuevo interesado en emprender" : "Nuevo mensaje de contacto";
                $this->emails->Body = $this->armarBodyContacto($post, $titulo);
            }

            $this->emails->isHTML(true);

            $this->emails->Send();
            return true;
        } catch (phpmailerException $e) {
            $this->error = "mailer: " . $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        } catch (Exception $e) {
            $this->error = $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        }
    }

    /**
     * Adjunta la foto del punto de carga cuando el archivo esta guardado en este
     * mismo servidor (la sube subirFotoPuntoCarga.php). Si no se encuentra, el
     * correo sale igual: la plantilla ya la muestra por su URL.
     */
    private function adjuntarFotoPuntoCarga($fotoUrl)
    {
        $fotoUrl = trim((string)$fotoUrl);
        if ($fotoUrl === '') return;

        $nombreArchivo = basename(parse_url($fotoUrl, PHP_URL_PATH));
        if ($nombreArchivo === '') return;

        $rutas = array(
            __DIR__ . '/../fotos-puntos-carga/' . $nombreArchivo,
            __DIR__ . '/fotos-puntos-carga/' . $nombreArchivo,
            $_SERVER['DOCUMENT_ROOT'] . '/apiv1.7/fotos-puntos-carga/' . $nombreArchivo,
        );
        foreach ($rutas as $ruta) {
            if (is_file($ruta)) {
                $this->emails->addAttachment($ruta, $nombreArchivo);
                return;
            }
        }
    }

    /**
     * Arma el cuerpo HTML del correo de contacto con los campos que traiga $post.
     */
    private function armarBodyContacto($post, $titulo)
    {
        $g = function ($k) use ($post) {
            return isset($post[$k]) ? htmlspecialchars(trim((string)$post[$k]), ENT_QUOTES, 'UTF-8') : '';
        };

        $campos = array(
            'ci'        => 'CI',
            'nombres'   => 'Nombres / Apellidos',
            'email'     => 'Email',
            'telefonos' => 'Telefonos',
            'direccion' => 'Direccion',
            'ciudad'    => 'Ciudad',
            'pais'      => 'Pais',
            'mensaje'   => 'Mensaje',
        );

        $filas = "";
        foreach ($campos as $k => $label) {
            $v = $g($k);
            if ($v === '') continue;
            $filas .= '<tr>'
                . '<td style="padding:8px 12px;font-weight:bold;color:#4b5563;border-bottom:1px solid #eee;vertical-align:top;">' . $label . '</td>'
                . '<td style="padding:8px 12px;color:#111;border-bottom:1px solid #eee;">' . nl2br($v) . '</td>'
                . '</tr>';
        }

        return '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">'
            . '<div style="background:#8EC552;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;">'
            . '<h2 style="margin:0;font-size:18px;">' . $titulo . '</h2>'
            . '<p style="margin:4px 0 0;font-size:12px;opacity:.9;">Enviado desde el formulario de VisitaEcuador.com</p>'
            . '</div>'
            . '<table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-top:0;">' . $filas . '</table>'
            . '</div>';
    }

    /**
     * Confirmacion de pago por transferencia / deposito.
     *
     * Envia los datos que ingreso el cliente junto con la imagen del
     * comprobante (embebida en el correo y adjunta cuando el archivo esta en
     * este servidor).
     *
     * To: contabilidad3@ - CC: gerencia@, subgerencia@, desarrollo@
     *
     * $post: nombres, cedula, telefono, correo, suscripcion, subtotal, iva,
     *        total, comprobanteUrl.
     */
    public function sendMailConfirmacionPago($post)
    {
        try {
            $this->configureSMTP();

            $this->emails->addAddress("contabilidad3@visitaecuador.com", "Contabilidad");
            $this->emails->addCC("gerencia@visitaecuador.com", "Gerencia");
            $this->emails->addCC("subgerencia@visitaecuador.com", "Subgerencia");
            $this->emails->addCC("desarrollo@visitaecuador.com", "Desarrollo");

            // Responder al cliente directamente desde el correo.
            if (!empty($post['correo'])) {
                $this->emails->addReplyTo($post['correo'], isset($post['nombres']) ? $post['nombres'] : '');
            }

            $comprobanteUrl = isset($post['comprobanteUrl']) ? trim((string)$post['comprobanteUrl']) : '';

            // Adjuntar el archivo si esta guardado en este mismo servidor.
            if ($comprobanteUrl !== '') {
                $nombreArchivo = basename(parse_url($comprobanteUrl, PHP_URL_PATH));
                if ($nombreArchivo !== '') {
                    $rutas = array(
                        __DIR__ . '/../comprobantes/' . $nombreArchivo,
                        __DIR__ . '/comprobantes/' . $nombreArchivo,
                        $_SERVER['DOCUMENT_ROOT'] . '/apiv1.7/comprobantes/' . $nombreArchivo,
                    );
                    foreach ($rutas as $ruta) {
                        if (is_file($ruta)) {
                            $this->emails->addAttachment($ruta, $nombreArchivo);
                            break;
                        }
                    }
                }
            }

            $data = array(
                'nombre'         => isset($post['nombres']) ? $post['nombres'] : '',
                'cedula'         => isset($post['cedula']) ? $post['cedula'] : '',
                'telefono'       => isset($post['telefono']) ? $post['telefono'] : '',
                'correo'         => isset($post['correo']) ? $post['correo'] : '',
                'suscripcion'    => isset($post['suscripcion']) ? $post['suscripcion'] : '',
                // Paquete comprado (id_tbl_prod_suscripcion): la plantilla lo usa
                // para mostrar la duracion solo en los programas especiales.
                'idProdSuscripcion' => isset($post['idProdSuscripcion']) ? $post['idProdSuscripcion'] : '',
                'metodoPago'     => 'Transferencia / Depósito',
                'subtotal'       => isset($post['subtotal']) ? $post['subtotal'] : '',
                'iva'            => isset($post['iva']) ? $post['iva'] : '',
                'total'          => isset($post['total']) ? $post['total'] : '',
                'comprobanteUrl' => $comprobanteUrl,
                'fechaActual'    => date('d/m/Y H:i'),
                // Datos para conciliar el deposito (opcionales).
                'codigoSolicitud'    => isset($post['codigoSolicitud']) ? $post['codigoSolicitud'] : '',
                'bancoDestino'       => isset($post['bancoDestino']) ? $post['bancoDestino'] : '',
                'fechaTransferencia' => isset($post['fechaTransferencia']) ? $post['fechaTransferencia'] : '',
                'numDocumento'       => isset($post['numDocumento']) ? $post['numDocumento'] : '',
            );

            $plantillaPath = $GLOBALS['vtClass'] . 'plantillasMail/confirmacionPago.php';

            $this->emails->Subject = "Confirmacion de pago"
                . ($data['codigoSolicitud'] !== '' ? " " . $data['codigoSolicitud'] : "")
                . " - " . $data['nombre'];
            $this->emails->Body = $this->renderTemplate($plantillaPath, $data);

            $this->emails->Send();
            return true;
        } catch (phpmailerException $e) {
            $this->error = "mailer: " . $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        } catch (Exception $e) {
            $this->error = $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        }
    }

    /**
     * Aviso a contabilidad de un cobro con tarjeta hecho desde el formulario de
     * PayPhone. Hasta ahora solo llegaba el voucher que envia PayPhone, sin los
     * datos del cliente ni de la compra.
     *
     * $post: nombre, cedula, telefono, correo, suscripcion, codigoSuscripcion,
     *        subtotal, iva, total, botonPago, diferido, intereses,
     *        transaccion (respuesta cruda de PayPhone).
     */
    public function sendMailPagoPayphone($post)
    {
        try {
            $this->configureSMTP();

            $this->emails->addAddress("contabilidad3@visitaecuador.com", "Contabilidad");
            $this->emails->addCC("gerencia@visitaecuador.com", "Gerencia");
            $this->emails->addCC("subgerencia@visitaecuador.com", "Subgerencia");
            $this->emails->addCC("desarrollo@visitaecuador.com", "Desarrollo");

            // Responder al cliente directamente desde el correo.
            if (!empty($post['correo'])) {
                $this->emails->addReplyTo($post['correo'], isset($post['nombre']) ? $post['nombre'] : '');
            }

            $t = (isset($post['transaccion']) && is_array($post['transaccion'])) ? $post['transaccion'] : array();
            $c = (isset($post['consultaPayphone']) && is_array($post['consultaPayphone'])) ? $post['consultaPayphone'] : array();

            // La consulta a PayPhone trae mas campos que el Create (que solo
            // devuelve 7), asi que se busca primero ahi y se cae al Create.
            $fuentes = array_merge($c, $t);

            /** Primera clave existente y no vacia, ignorando mayusculas. */
            $de = function ($claves, $def = '') use ($fuentes) {
                foreach ($claves as $clave) {
                    foreach ($fuentes as $k => $v) {
                        if (strcasecmp($k, $clave) === 0 && $v !== null && $v !== '') return $v;
                    }
                }
                return $def;
            };

            // El numero de lote que guarda tbl_descarga para PayPhone es el
            // transactionId (ver setPago en subscriber.php), asi que es el mismo
            // que debe ver contabilidad para conciliar.
            $lote = $de(array('transactionId', 'transaccionId', 'id'));

            $tarjeta = '';
            $bin     = $de(array('bin'));
            $ultimos = $de(array('lastDigits', 'last4Digits', 'ultimosDigitos'));
            if ($bin !== '' || $ultimos !== '')
                $tarjeta = trim($bin . 'XXXXXX' . $ultimos, 'X');

            $data = array(
                'nombre'            => isset($post['nombre']) ? $post['nombre'] : '',
                'cedula'            => isset($post['cedula']) ? $post['cedula'] : '',
                'telefono'          => isset($post['telefono']) ? $post['telefono'] : '',
                'correo'            => isset($post['correo']) ? $post['correo'] : '',
                'suscripcion'       => isset($post['suscripcion']) ? $post['suscripcion'] : '',
                'codigoSuscripcion' => isset($post['codigoSuscripcion']) ? $post['codigoSuscripcion'] : '',
                'subtotal'          => isset($post['subtotal']) ? $post['subtotal'] : '',
                'iva'               => isset($post['iva']) ? $post['iva'] : '',
                'total'             => isset($post['total']) ? $post['total'] : '',
                'botonPago'         => isset($post['botonPago']) ? $post['botonPago'] : '',
                'diferido'          => isset($post['diferido']) ? $post['diferido'] : '',
                'intereses'         => isset($post['intereses']) ? $post['intereses'] : '',

                'transactionId'       => $lote,
                'clientTransactionId' => $de(array('clientTransactionId')),
                'authorizationCode'   => $de(array('authorizationCode', 'codigoAutorizacion')),
                // PayPhone no siempre rotula el recap igual; si no viene con
                // ninguno de estos nombres, queda vacio y se puede ubicar en el
                // bloque de respuesta cruda que la plantilla imprime completo.
                'recap'               => $de(array('recap', 'reCap', 'recapNumber', 'numeroRecap')),
                'tarjeta'             => $tarjeta,
                'marcaTarjeta'        => $de(array('cardBrand', 'cardType', 'marcaTarjeta')),
                'estado'              => $de(array('transactionStatus', 'status')),
                'mensaje'             => $de(array('message', 'statusMessage', 'mensaje')),
                'fechaTransaccion'    => $de(array('transactionDate', 'date', 'fecha')),

                'fechaActual'       => date('d/m/Y H:i'),
                'transaccion'       => $t,
                'consultaPayphone'  => $c
            );

            $plantillaPath = $GLOBALS['vtClass'] . 'plantillasMail/pagoPayphone.php';

            $this->emails->Subject = "Pago con tarjeta"
                . ($lote !== '' ? " - Lote " . $lote : "")
                . " - " . $data['nombre'];
            $this->emails->Body = $this->renderTemplate($plantillaPath, $data);
            $this->emails->isHTML(true);

            $this->emails->Send();
            return true;
        } catch (phpmailerException $e) {
            $this->error = "mailer: " . $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        } catch (Exception $e) {
            $this->error = $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        }
    }

    public function sendMailPruebasGratis($post)
    {
        try {
            $this->configureSMTP();

            $this->emails->Subject = ("Prueba gratis");

            $this->emails->addAddress($post['mail'], $post['nombre']);
            if (!empty($post['mailVendedor'])) {
                $this->emails->addCC($post['mailVendedor'], $post['vendedor']);
            }

            $this->emails->addCC("programacion@visitaecuador.com", "PruebaMail");
            $this->emails->addCC("gerencia@visitaecuador.com", "Gerencia");
            $this->emails->addCC("subgerencia@visitaecuador.com", "Subgerencia");
            $this->emails->addCC("desarrollo@visitaecuador.com", "PruebaMail");
            $this->emails->addCC("gcomercial@visitaecuador.com", "Comercial");
            $this->emails->addCC("rrpp@visitaecuador.com", "Relaciones Publicas");

            $plantillaPath = $GLOBALS['vtClass'] . 'plantillasMail/mailPruebaGratis.php';

            $fecha = $this->formatearFecha(date("Y-m-d H:i:s"));
            $post['fecha'] = $fecha['m'] . ' ' . $fecha['d'] . ', ' . $fecha['a'] . ' | ' . $fecha['h'];
            $post['imagenBanner'] = $this->fotosBanners();


            //pr($post);

            $contenido = $this->renderTemplate($plantillaPath, $post);

            $this->emails->Body = $contenido;

            $infoEmail = $this->emails->Send();
            return true;
        } catch (phpmailerException $e) {
            $this->error = "mailer: " . $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        } catch (Exception $e) {
            $this->error = $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        }
    }

    public function sendMailDisney($post)
    {
        try {
            $this->configureSMTPDisney();

            $this->emails->Subject = ("Prueba gratis");

            $this->emails->addAddress($post['mail'], $post['nombre']);
            if (!empty($post['mailVendedor'])) {
                $this->emails->addCC($post['mailVendedor'], $post['vendedor']);
            }

            $this->emails->addCC("programacion@visitaecuador.com", "PruebaMail");
            $this->emails->addCC("gerencia@visitaecuador.com", "Gerencia");
            $this->emails->addCC("subgerencia@visitaecuador.com", "Subgerencia");
            $this->emails->addCC("desarrollo@visitaecuador.com", "PruebaMail");
            $this->emails->addCC("gcomercial@visitaecuador.com", "Comercial");
            $this->emails->addCC("rrpp@visitaecuador.com", "Relaciones Publicas");
            $this->emails->addCC("rocio.march.admin@smt.travel", "Rocio March");
            $this->emails->addCC("frank@smt.travel", "Frane de Acosta");

            $plantillaPath = $GLOBALS['vtClass'] . 'plantillasMail/mailDisneyConcierge.php';

            $fecha = $this->formatearFecha(date("Y-m-d H:i:s"));
            $post['fecha'] = $fecha['m'] . ' ' . $fecha['d'] . ', ' . $fecha['a'] . ' | ' . $fecha['h'];
            $post['imagenBanner'] = $this->fotosBanners();


            //pr($post);

            $contenido = $this->renderTemplate($plantillaPath, $post);

            $this->emails->Body = $contenido;

            $infoEmail = $this->emails->Send();
            return true;
        } catch (phpmailerException $e) {
            $this->error = "mailer: " . $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        } catch (Exception $e) {
            $this->error = $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        }
    }

    public function sendMailSuscripcionVE($post)
    {
        try {
            $this->configureSMTP();
            $this->emails->addAddress($post['mailSuscriptor'], $post['nombreSuscriptor']);

            $this->emails->addCC("gerencia@visitaecuador.com", "Gerencia");
            $this->emails->addCC("subgerencia@visitaecuador.com", "Subgerencia");
            $this->emails->addCC("contabilidad3@visitaecuador.com", "Contabilidad");
            $this->emails->addCC("GAdministrativo@visitaecuador.com", "Administrativo");
            //$this->emails->addCC("carrilloedisson@gmail.com", "Edisson"); 
            $this->emails->addCC("programacion@visitaecuador.com", "Programacion");



            $plantillaPath = $GLOBALS['vtClass'] . 'plantillasMail/visitaEcuadorSuscripcion.php';
            $fechaFinSus = $this->formatearFecha($post['fecha_fin']);
            $telefono = "";

            foreach ($post['addaddress'] as $mail) {
                $this->emails->addCC($mail[0], $mail[1]);
            }

            foreach ($post['contacto'] as $clave => $valor) {
                if ($valor == 2) {
                    $telefono = $clave;
                    break;
                }
            }

            $data = [
                'usuario' => $post['ci'],
                'clave' => $post['clave'],
                'nombre' => $post['nombreSuscriptor'],
                'suscripcion' => $post['nombreProducto'],
                'cashback' => $post['mostrarCodigodeVentas'],
                'codigo' => $post['redvendedor']['codigo'],
                'patrocinador' => $post['codigoVendedor'] . ' - ' . $post['codigo_promocional']['codigo'],
                'nombreVendedor' => $post['nombreVendedor'],
                'fechaActual' => $this->formatearFecha(date('Y-m-d H:i:s')),
                'fin_suscripcion' => $fechaFinSus['d'] . ' de ' . $fechaFinSus['m'] . ' de ' . $fechaFinSus['a'],
                'fotoBanner' => $this->fotosBanners(),
                'telefono' => $telefono,
                'cortesia' => $post['cortesia'],
                'precioSuscripcion' => $post['precioSuscripcion'],
                'codSuscipcion' => $post['codigo']
            ];

            //pr($post);
            // pr($this->utf8_transform_array($data));

            $contenido = $this->renderTemplate($plantillaPath, $this->utf8_transform_array($data));
            $this->emails->Subject = ("Bienvenido a VisitaEcuador.com");
            $this->emails->Body = $contenido;

            $infoEmail = $this->emails->Send();
            return true;
        } catch (phpmailerException $e) {
            $this->error = "mailer: " . $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        } catch (Exception $e) {
            $this->error = $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        }
    }

    private function fotosBanners()
    {
        $fotosBanners = [
            'https://visitaecuador.com/img/mailing/nuevosRecursos/ve_express-20.png',
            'https://visitaecuador.com/img/mailing/nuevosRecursos/ve_express1-22.png',
            'https://visitaecuador.com/img/mailing/nuevosRecursos/ve_express1-23.png',
            'https://visitaecuador.com/img/mailing/nuevosRecursos/ve_express1-24.png',
            'https://visitaecuador.com/img/mailing/nuevosRecursos/ve_express1-25.png',
            'https://visitaecuador.com/img/mailing/nuevosRecursos/ve_express1-26.png',
            'https://visitaecuador.com/img/mailing/nuevosRecursos/ve_express1-27.png',
            'https://visitaecuador.com/img/mailing/nuevosRecursos/ve_express1-28.png',
        ];
        $claveAleatoria = array_rand($fotosBanners);
        return $fotosBanners[$claveAleatoria];
    }

    public function sendMailExpress($post)
    {
        try {
            if (empty($post['id_tbl_reserva']) or !isset($post['id_tbl_reserva']))
                throw new Exception("No existe reserva", 1);

            $this->configureSMTP();
            $this->emails->Subject = ("Tu pre-reserva express ha sido recibida");

            $this->emails->addCC("programacion@visitaecuador.com", "Programacion");

            $this->emails->addCC("gerencia@visitaecuador.com", "Gerencia");
            $this->emails->addAddress($post['email']);

            $correoReservas = $this->find('first', array(
                'select'    =>    '*',
                'from'        =>    'tbl_mail_reservas',
                'where'        =>    'cant_reservas = (SELECT MIN(cant_reservas) FROM tbl_mail_reservas)'
            ));

            //pr($correoReservas);

            //actualizar contador de reservas
            if ($correoReservas) {
                $this->emails->addCC($correoReservas['mail'], $correoReservas['nombre']);

                $this->table             = 'tbl_mail_reservas ';
                $this->fields             = array('cant_reservas' => ($correoReservas['cant_reservas'] + 1));
                $this->where             = 'id_centralReservas = ' . $correoReservas['id_centralReservas'];

                if (!$this->update())
                    throw new Exception($this->error, 31);
            }

            $plantillaPath = $GLOBALS['vtClass'] . 'plantillasMail/visitaEcuadorExpress.php';

            require_once $GLOBALS['vtClass'] . 'administrador/reservasClass.php';
            $reserva = new ReservasClass();


            if (!$infor = $reserva->listarReserva($post))
                throw new Exception($reserva->error, $reserva->codeerror);

            // pr($infor);        

            $this->app      = new App();
            $hotels = new Hotels(1);
            $contactos = $hotels->getContactos(array($infor['reserva']['id_tbl_usuario_cliente']));

            $celular = "";
            $correo = "";
            foreach ($contactos as $contact) {
                if ($contact['nombre'] == 'Celular Trabajo')
                    $celular = $contact['valor'];
                if ($contact['nombre'] == 'Email')
                    $correo = $contact['valor'];
            }

            $impuestos = $this->find('all', array(
                'select' => "so.id_tbl_servicio_smart,se.nombre_servicio_smart",
                'from'   => 'tbl_dtl_servicio_establecimiento so JOIN tbl_servicio_smart se ON (so.id_tbl_servicio_smart = se.id_tbl_servicio_smart)',
                'where'  => array('so.id_tbl_servicio_smart in(141,142) and id_tbl_establecimiento =' . $infor['ofertas'][0]['id_tbl_establecimiento']),
            ));

            $iva = 0;
            $servicios = 0;
            if ($impuestos) {
                foreach ($impuestos as $e) {
                    if ($e['id_tbl_servicio_smart'] == 141)
                        $iva = (int) strstr($e['nombre_servicio_smart'], '%', true) ?: 0;
                    if ($e['id_tbl_servicio_smart'] == 142)
                        $servicios = (int) strstr($e['nombre_servicio_smart'], '%', true) ?: 0;
                }
            }
            $imp = $iva + $servicios;

            $usuario = [];
            $usuario['clave'] =                  $infor['usuario'][0]['clave'];
            $usuario['usu_o_email'] =            $infor['usuario'][0]['usuario'];
            $usuario['ci_ruc'] =                 $infor['usuario'][0]['ci_ruc'];
            $usuario['nombre_suscriptor'] =      $infor['usuario'][0]['nombres'];
            $usuario['id_usuario'] =             $infor['usuario'][0]['id_tbl_usuario'];
            $usuario['celular'] =                $celular;
            $usuario['correo'] =                 $correo;

            $reserva = [];
            $reserva['foto'] =                  $this->fotosBanners();
            $reserva['hotel'] =                 $infor['ofertas'][0]['nombreEstablecimiento'];
            $reserva['fecha_reserva'] =          $this->formatearFecha($infor['reserva']['fecha_creacion']);
            $reserva['fecha_inicio'] =           $this->formatearFecha($infor['ofertas'][0]['fecha_inicio']);
            $reserva['fecha_fin'] =              $this->formatearFecha($infor['ofertas'][0]['fecha_fin']);
            $reserva['ivaServ'] =                ($imp);
            $reserva['estado'] =                 "Pendiente";
            $reserva['numReserva'] =             $infor['reserva']['id_tbl_reserva'];

            $adulto = 0;
            $ninos = 0;
            $ofertas = [];
            $cantOferas = 0;
            $impuestos = 0;
            $total = 0;
            $fechaIng = new DateTime($infor['ofertas'][0]['fecha_inicio']);
            $fechaSal = new DateTime($infor['ofertas'][0]['fecha_fin']);
            $noches = $fechaIng->diff($fechaSal)->days;

            foreach ($infor['ofertas'] as $info) {
                $adultos +=  $info['adultos'];
                $ninos +=    $info['ninos'];
                $cantOferas += $info['cantidad_ofertas'];

                // Calcular precios
                $precioOferta = $info['precioOferta'];
                $cantidadOfertas = $info['cantidad_ofertas'];
                $precioAdicional = 10;

                $subtotalBruto = ($precioOferta + $precioAdicional) * $cantidadOfertas * $noches;
                $subtotalNeto = $subtotalBruto / (1 + ($imp / 100));
                $sub = number_format($subtotalNeto, 2);
                $total += $subtotalNeto;
                $impuestos += $subtotalBruto - $subtotalNeto;

                $ofertas[] =   [
                    "cantidad" =>       $info['cantidad_ofertas'],
                    "habitacion" =>     $info['tituloOferta'],
                    "aplicaEn" =>       $info['aplicaEn'],
                    "acomodacion" =>    $info['acomodacion'],
                    "totalSinImp" =>    $sub,
                    "maximoPersonas" => ("(Máximo: " . $info['adultos'] . " adultos, " . $info['ninos'] . " niños)")
                ];
            }
            $reserva['impuestos'] = number_format($impuestos, 2);
            $reserva['subtotal'] = number_format(($total), 2);
            $reserva['total'] = number_format($total + $impuestos, 2);
            $reserva['cantOfertas'] = $cantOferas;
            $reserva['ninos'] = $ninos;
            $reserva['adultos'] = $adultos;
            $reserva['noches'] = $noches;

            $resultado = (array_merge(array("usuario" => $usuario), array("reserva" => $reserva), array("ofertas" => $ofertas)));

            $contenido = $this->renderTemplate($plantillaPath, $resultado);
            $this->emails->Body = $contenido;

            $infoEmail = $this->emails->Send();

            //pr($infor);

            return true;
        } catch (phpmailerException $e) {
            $this->error = "mailer: " . $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        } catch (Exception $e) {
            $this->error = $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        }
    }

    public function sendMailSolicitudCobroCashback($post)
    {
        try {
            $this->configureSMTP();
            $this->emails->addAddress("programacion@visitaecuador.com", "solicitud de pago Cashback");
            $this->emails->addAddress("contabilidad3@visitaecuador.com", "solicitud de pago Cashback");
            $this->emails->addAddress($post['email'], $post['nombres']);
            $this->emails->Subject = ("solicitud de pago de cashback");

            $contactos = "";
            foreach ($post['contactos'] as $key => $value) {
                $contactos .= "$key: $value <br/>";
            }
            //$contactos = rtrim($contactos, "<br/>");

            $this->emails->Body = '
      <html lang="es">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Solicitud de pago de cashback</title>
            <style>
                body {
                    max-width: 800px;
                    margin: 0 auto;
                    font-family: Helvetica, Arial, sans-serif;
                }
                td {
                    border: 0px solid #ffffff;
                    padding: 10px;
                }
                td:last-child {
                    height: 33.33px;
                }
            </style>
        </head>

        <body>
            <!-- Tabla encabezado y letrero principal -->
            <table width="800" align="center">
                <tr>
                    <td align="center"><img src="https://visitaecuador.com/img/mailing/email-vec-cabecera.png" alt="visitaecuador.com"></td>
                </tr>
            </table>
            <table width="800" align="center">
                <tr>
                    <td align="left">
                        <h3 style="color:#4d4d4d; font-size: 1.3em;">
                            Estimado colaborador, ' . utf8_decode($post['nombres']) . '<br/><br/>
                            <p>Ha ingresado su solicitud de cobro de cashback</p>
                        </h3>
                    </td>
                </tr>
            </table>

            <table width="600" align="center" border="1" style="border-collapse: collapse;">
                <tr style="border: 1px solid black;">
                    <td style="padding: 10px; text-align: left; width: 220px; border: 1px solid black;">
                        <h3 style="font-weight: bold; color: #4d4d4d; margin: 0;">N&uacute;mero de Solicitud:</h3>
                    </td>
                    <td style="padding: 10px; text-align: left; border: 1px solid black;">
                        <h3 style="font-weight: bold; color: #4d4d4d; margin: 0;">' . $post['codigo'] . '</h3>
                    </td>
                </tr>
                <tr style="border: 1px solid black;">
                    <td style="padding: 10px; text-align: left; width: 220px; border: 1px solid black;">
                        <h3 style="font-weight: bold; color: #4d4d4d; margin: 0;">Valor:</h3>
                    </td>
                    <td style="padding: 10px; text-align: left; border: 1px solid black;">
                        <h3 style="font-weight: bold; color: #4d4d4d; margin: 0;">' . $post['valor'] . '</h3>
                    </td>
                </tr>
                <tr style="border: 1px solid black;">
                    <td style="padding: 10px; text-align: left; width: 220px; border: 1px solid black;">
                        <h3 style="font-weight: bold; color: #4d4d4d; margin: 0;">Contactos:</h3>
                    </td>
                    <td style="padding: 10px; text-align: left; border: 1px solid black;">
                        <h3 style="font-weight: bold; color: #4d4d4d; margin: 0;">' . $contactos . '</h3>
                    </td>
                </tr>
            </table>
            <br/>
            <table width="800" align="center">
              <tr>
                  <td align="left" colspan="2">
                      <h3 style="color:#4d4d4d; font-size: 1.3em;">
                          <p>Para hacer efectivo su pago, llene la factura con los siguientes datos y env&iacute;e al whatsapp o al correo electr&oacute;nico</p>
                      </h3>
                  </td>
              </tr>
              <tr>
                  <td><p style="font-weight: bold; color: #4d4d4d;">Raz&oacute;n social:</p></td>
                  <td>Aracno CIA. LTDA. </></td>
              </tr>
              <tr>
                  <td><p style="font-weight: bold; color: #4d4d4d; margin: 0;">RUC:</p></td>
                  <td>0190167895001</td>
              </tr>
              <tr>
                  <td><p style="font-weight: bold; color: #4d4d4d; margin: 0;">Direcci&oacute;n:</p></td>
                  <td>Del Bat&aacute;n 5-137 y Esmeraldas.</td>
              </tr>
              <tr>
                  <td><p style="font-weight: bold; color: #4d4d4d; margin: 0;">Email:</p></td>
                  <td>contabilidad3@visitaecuador.com</td>
              </tr>
          </table>

          <br/><br/>

            <table width="700" align="center" border="1" style="border-collapse: collapse;">
                  <thead>
                      <tr>
                          <th style="border: 1px solid black; width: calc(100% * 2 / 12); font-weight: 600; text-align: center;">Cantidad</th>
                          <th style="border: 1px solid black; width: calc(100% * 6 / 12); font-weight: 600; text-align: center;">Descripci&oacute;n</th>
                          <th style="border: 1px solid black; width: calc(100% * 2 / 12); font-weight: 600; text-align: center;">P. Unitario</th>
                          <th style="border: 1px solid black; width: calc(100% * 2 / 12); font-weight: 600; text-align: center;">P. Final</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td style="border: 1px solid black; width: calc(100% * 2 / 12); text-align: center;">1</td>
                          <td style="border: 1px solid black; width: calc(100% * 6 / 12); text-align: center;">Comisiones</td>
                          <td style="border: 1px solid black; width: calc(100% * 2 / 12); text-align: center;">' . number_format(($post["valor"] / 1.15), 2) . '</td>
                          <td style="border: 1px solid black; width: calc(100% * 2 / 12); text-align: center;">' . number_format(($post["valor"] / 1.15), 2) . '</td>
                      </tr>
                      <tr>
                          <td></td>
                          <td></td>
                          <td style="border: 1px solid black; width: calc(100% * 2 / 12); font-weight: 600; text-align: left; padding-left: 0.5rem;">IVA 15%:</td>
                          <td style="border: 1px solid black; width: calc(100% * 2 / 12); text-align: center;">' . number_format(($post["valor"] - ($post["valor"] / 1.15)), 2) . '</td>
                      </tr>
                      <tr>
                          <td></td>
                          <td></td>
                          <td style="border: 1px solid black; width: calc(100% * 2 / 12); font-weight: 600; text-align: left; padding-left: 0.5rem;">Total:</td>
                          <td style="border: 1px solid black; width: calc(100% * 2 / 12); text-align: center;">' . number_format($post["valor"], 2) . '</td>
                      </tr>
                  </tbody>
              </table>

              <table width="800" align="center">
                <tr>
                    <td align="left">
                        <h3 style="color:#4d4d4d; font-size: 1.3em;">
                            <p>Este mail ha sido recibido por el departamento de contabilidad. Pronto daremos respuesta a tu solicitud.</p>
                        </h3>
                    </td>
                </tr>
            </table>


            <!-- botone descarga de app -->
            <table width="800" align="center" style="margin-top: 1.2em;" >
                <tr>
                    <td align="center"><img src="http://clubvisita.info/ls/img/en/nu/linea_negra_ve.png" alt="linea verde" style="width: 100%; max-width: 800px; height: auto;"></td>
                </tr>
                <tr>
                    <td align="center">
                        <span style="color:#4d4d4d; font-weight: bold;  font-size: 1.8em;margin-top: 30px">DESCARGA LA APP</span>
                    </td>
                </tr>
            </table>
            <table width="800" align="center">
                <tr>
                    <td align="center"><a href="https://clubvisita.page.link/81nF"><img src="http://clubvisita.info/ls/img/en/nu/botones_app.png" alt="Descarga la aplicación"></a>
                    </td>
                </tr>
                <tr>
                    <td align="center"> <a href="visitaecuador.com"> <img src="https://visitaecuador.com/img/mailing/email-vec-footer.png" alt="Descarga la aplicaci&oacute;n"></a></td>
                </tr>
            </table>
            <!-- Tabla y botones de redes sociales -->
            <table width="800" align="center">
                <tr>
                    <td><span style="color:#4d4d4d; font-size: 1.0em; ">S&iacute;genos en redes sociales</span></td>
                    <td></td>
                    <td><a href="https://api.whatsapp.com/send/?phone=593981850436&text&type=phone_number&app_absent=0"><img src="http://clubvisita.info/ls/img/en/nu/boton_whatsapp_gris.png" alt="whatsapp" style="width: 70%; max-width: 800px; height: auto;"></td>
                    <td><a href="https://twitter.com/ClubVisita"><img src="http://clubvisita.info/ls/img/en/nu/boton_twitter_gris.png" alt="twitter" style="width: 70%; max-width: 800px; height: auto;"></td>
                    <td><a href="https://www.youtube.com/channel/UClovC-v5-XvWcL2eYr4enXg"><img src="http://clubvisita.info/ls/img/en/nu/boton_youtube_gris.png" alt="youtube" style="width: 70%; max-width: 800px; height: auto;"></td>
                    <td><a href="https://www.instagram.com/visitaecuadorcom/"><img src="http://clubvisita.info/ls/img/en/nu/boton_instagram_gris.png" alt="instagram" style="width: 70%; max-width: 800px; height: auto;"></td>
                    <td><a href="https://www.tiktok.com/@visitaecuador.com"><img src="http://clubvisita.info/ls/img/en/nu/boton_tiktok_gris.png" alt="tiktok" style="width: 70%; max-width: 800px; height: auto;"></td>
                    <td><a href="https://www.facebook.com/visitaecuadorcom"><img src="http://clubvisita.info/ls/img/en/nu/boton_facebook_gris.png" alt="facebook" style="width: 70%; max-width: 800px; height: auto;"></td>
                </tr>
            </table>
            <table width="800" align="center">
                <tr>
                    <td><span style="color:#4d4d4d; font-size: 1.0em; ">Visitaecuador.com<br>Calle del Bat&aacute;n 5-137, Cuenca, Ecuador.</span></td>
                </tr>
                <tr>
                    <td align="center"><img src="http://clubvisita.info/ls/img/en/nu/linea_negra_ve.png" alt="linea verde" style="width: 100%; max-width: 800px; height: auto;"></td>
                </tr>
            </table>
            <!-- Tablas de enlaces de terminos y condicones e inicio de sesion -->
            <table width="800" align="center">
                <tr>
                    <td><a href="https://visitaecuador.com/#/terminos-condiciones"><span style="color:#4d4d4d; font-size: 1.0em; ">T&eacute;rminos y Condiciones</span></td>
                    <td><a href="https://api.whatsapp.com/send/?phone=593981850436&text&type=phone_number&app_absent=0"><span style="color:#4d4d4d; font-size: 1.0em; ">Atenci&oacute;n al Cliente</span></td>
                    <td><a href="https://visitaecuador.com/#/login"><span style="color:#4d4d4d; font-size: 1.0em; ">Iniciar sesi&oacute;n </span></td>
                </tr>
            </table>
        </body>

      </html>
      ';

            $infoEmail = $this->emails->Send();

            return true;
        } catch (phpmailerException $e) {
            $this->error = "mailer: " . $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        } catch (Exception $e) {
            $this->error = $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        }
    }

    public function sendMail($post)
    {
        try {
            $this->configureSMTP();
            $this->emails->addAddress("programacion@visitaecuador.com", "web CPN");
            $this->emails->addAddress($post['email'], $post['nombres']);

            $this->emails->Subject = ("Mensaje desde cpn.visitaecuador.com");
            $this->emails->Body = '<img src="https://visitaecuador.com/ve/img/diseno/logo_clubvisita180.png" alt=""> </br></br>' .
                'Estimados visitaecuador.com, mi nombre es <b>' . $post['nombres'] . '</b> mi correo es ' . $post['email'] . '</br></br>' . $post['mensaje'] . '</br></br></br></br>' .
                '<a href="https://clubvisita.page.link/81nF"> <img src="http://api.visitaecuador.com:1823/apiv1.1/img/diseno/plantillasemail/email_pie_app.jpg" alt="" width="600"></a>';

            $infoEmail = $this->emails->Send();

            return true;
        } catch (phpmailerException $e) {
            $this->error = "mailer: " . $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        } catch (Exception $e) {
            $this->error = $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        }
    }

    public function sendMailCodigoBarrasSuscripcion($post)
    {
        try {
            $this->configureSMTP();
            $this->emails->Subject = ("Giftcard VisitaEcuador.com");

            $this->emails->addAddress($post['email'], $post['nombres']);
            $this->emails->addAddress("programacion@visitaecuador.com", "Programacion");

            //$this->emails->addCC("desarrollo@visitaecuador.com", "Programacion");

            $plantillaPath = $GLOBALS['vtClass'] . 'plantillasMail/MailGiftcardGratis.php';
            $fecha = $this->formatearFecha(date("Y-m-d H:i:s"));

            $post['fecha'] = $fecha['m'] . ' ' . $fecha['d'] . ', ' . $fecha['a'] . ' | ' . $fecha['h'];
            $post['imagenBanner'] = $this->fotosBanners();

            //pr($post);

            $contenido = $this->renderTemplate($plantillaPath, $this->utf8_transform_array($post));
            $this->emails->Body = $contenido;

            $infoEmail = $this->emails->Send();
            return true;
        } catch (phpmailerException $e) {
            $this->error = "mailer: " . $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        } catch (Exception $e) {
            $this->error = $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        }
    }
}
