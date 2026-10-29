<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header('Access-Control-Allow-Headers: *');
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// === AGREGAR ESTAS 2 LÍNEAS ===
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include('configuraciones.php');

include_once($GLOBALS['vtClass'] . 'subscriber.php');    // persona
$subscriber = new Subscriber();

$method = $_SERVER['REQUEST_METHOD'];
$fileExecute = $_SERVER['REQUEST_URI'];
try {

	/*Inicializacion*/
	if ($method != 'POST')
		throw new Exception("Metodo de conexion equivocado", 1004);


	//obtener flujo de informacion por POST con file_get_content
	$post = json_decode(file_get_contents("php://input"), true);
	$id_log_api = $app->log_api("gestionSuscripcion", "gestionarSuscripcion");
	$id_log_api = $app->log_api($post, $fileExecute);

	if (!$post)
		throw new Exception("No existen parametros", 1001);


	//datos personales
	$personal['ci_ruc'] = $post['personal']['ci'];
	// pr($personal);

	$id_usuario_creador =  $post['id_usuario_creador'] ?? 0;

	$id_usuario_nuevo = 0;

	$arrayNombress = explode(' ', $post['personal']['nombres']);
	$arrayNombres = array_filter($arrayNombress);
	foreach ($arrayNombres as $key => $nombre) {
		# code...
		$arrayNombre[] = $nombre;
	}
	// pr($arrayNombre);
	switch (count($arrayNombre)) {
		case '1':
			# code...
			$personal['nombre1'] = implode(' ', $arrayNombre);
			$personal['nombre2'] = " ";
			$personal['apellido1'] = " ";
			$personal['apellido2'] = " ";

			break;
		case '2':
			# code...
			$personal['nombre1'] = $arrayNombre[0];
			$personal['nombre2'] = " ";
			$personal['apellido1'] = $arrayNombre[1];
			$personal['apellido2'] = " ";

			break;
		case '3':
			# code...
			# 
			$personal['nombre1'] = $arrayNombre[0];
			$personal['nombre2'] = $arrayNombre[1];
			$personal['apellido1'] = $arrayNombre[2];
			$personal['apellido2'] = " ";
			break;
		case '4':
			# code...
			$personal['nombre1'] 	= $arrayNombre[0];
			$personal['nombre2'] 	= $arrayNombre[1];
			$personal['apellido1'] 	= $arrayNombre[2];
			$personal['apellido2'] 	= $arrayNombre[3];
			break;

		default:
			# code...
			$personal['nombre1'] 	= $arrayNombre[0];
			$personal['nombre2'] 	= $arrayNombre[1];
			$personal['apellido1'] 	= $arrayNombre[2];
			$personal['apellido2'] 	= $arrayNombre[3] . ' ' . $arrayNombre[4] . ' ' . $arrayNombre[5] . ' ' . $arrayNombre[6];
			break;
	}
	// pr($personal);
	// $personal['nombre1'] = $post['personal']['nombres'];
	// $personal['apellido1'] = $post['personal']['apellidos'];
	$personal['direccion'] = $post['personal']['direccion'];
	$personal['referencia'] = $post['personal']['referencia'];
	$personal['id_tbl_lugar'] = $post['personal']['ciudad'];
	$personal['email'] 		  	= $post['personal']['email'];
	// $personal['id_servicio_web'] = ID_SERVICIO_WEB;
	// $direccion		= $post['personal']['direccion'];
	// $referencia		= $post['personal']['referencia_direccion'];

	//contacto       = tipo de contacto
	$contacto[$post['personal']['email']]  	= 1;
	$contacto[$post['personal']['email1']]  	= 1;
	$contacto[$post['personal']['celular']] 	= 2;
	$contacto[$post['personal']['telefono']] 	= 3;
	$personal['contacto'] = $contacto;



	$suscripcion[] = array(
		'id_tbl_tipo_canal'		=> $post['producto']['id_tipo_canal'],
		'id_tbl_tipo_pago'		=> $post['producto']['tipo_pago'],
		'id_tbl_lugar'			=> $post['producto']['ciudad'],
		'total'					=> $post['producto']['total'],
		'fecha_final'			=> $post['producto']['fecha_final'],
		'beneficio_cantidad_tiempo'	=> $post['producto']['beneficio_cantidad_tiempo'],
		'beneficio_tipo_tiempo'		=> $post['producto']['beneficio_tipo_tiempo'],
		'cantidad'					=> $post['producto']['cantidad'],
		'cantidad'					=> $post['producto']['cantidad'],
		'precio'					=> $post['producto']['precio'],
		'id_producto'				=> $post['producto']['id_producto'],
		'id_tbl_prod_suscripcion'	=> $post['producto']['id_prod_suscripcion'],
		'id_usuario_vendedor'		=> $post['producto']['id_usuario_vendedor'],
		'id_suscripcion_vendedor'	=> $post['producto']['id_suscripcion_vendedor'],
		'id_codigo_promocional'		=> $post['producto']['id_codigo_promocional'],
		'id_tbl_lista_precio_producto'	=> $post['producto']['id_lista_precio_producto'],
		'pago'						=> $post['producto']['pago']
	);

	// pr($suscripcion);
	// exit();

	//array necesario : PERSONAL, SUSCRIPCION, PAGO
	$data =	array(
		'personal'		=> $personal,		//datos personales
		'suscripcion'	=> $suscripcion,		//datos suscripcion(producto)
	);
	$data['pago'] = $post['pago'];

	// pr($personal);
	//*INFOMRACION NECESARIA PARA LLAMAR A LA FUNCIONA DE CREAR SUSCRIPCION FAST*/
	$subscriber->id_servicio = $post['id_servicio'];
	$subscriber->metodo = $post['metodo'];
	$subscriber->id_metodo  = $subscriber->getMetodoServicio($post['metodo']);
	//acivar renovaciones automaticas
	$subscriber->renovarAutomaticamente = true;

	$campos = [];

	if (isset($post['crearCodigoBarras']) && !empty($post['crearCodigoBarras']) && $post['crearCodigoBarras']) {

		$sus = $subscriber->verificarSuscripcion($post['personal']['ci']);
		//pr($sus);
		if (empty($sus)) { 	//NO existe suscripción
			$idSus = $subscriber->crearDatos($data);
			if (!empty($idSus)) {
				$suscriptor = $subscriber->getSuscripcion($idSus);
				$sus = $subscriber->verificarSuscripcion($suscriptor['ci_ruc']);
				if (!$res = $subscriber->down($userapp->id_tbl_usuario, ['observacion' => "porque el usuario creó codigo promocional", 'motivo' => 'porque el usuario creó codigo promocional']))  //eliminar suscripción
					throw new Exception($subscriber->error, 1);
			}
		}

		$data = array('id_servicio' => $post['id_servicio'], 'id_empresa' => $post['id_empresa'], 'id_grupo' => ($post['id_grupo'] > 0) ? $post['id_grupo'] : 12, 'personal' => $sus, 'producto' => $post['producto']);
		//pr($data);

		$resRenovacion = $subscriber->crearSuscripcionRenovacionGiftCard($data);

		if ($resRenovacion) {
			//pr("creación de codigo de barras");		
			$app->id_servicio = $post['id_servicio'];
			if (isset($post['id_metodo']) and $post['id_metodo'] > 0) {
				$app->id_metodo = $post['id_metodo'];
				$dat = $app->getInfoMetodo();
				$post['id_tbl_servicio'] 	= $dat['id_tbl_servicio_web'];
				$post['id_tbl_metodo'] 		= $post['id_metodo'];
			} else {
				$post['id_tbl_servicio'] 	= $post['id_servicio'];
				$post['id_tbl_metodo'] 		= $post['metodo'];
			}

			$post['id_tbl_usuario'] 		= $sus['id_tbl_usuario'];
			$id 							= ($post['id'] > 0)		? $post['id']		: 0;
			$post['id_grupo'] 				= ($post['id_grupo'] > 0)	? $post['id_grupo']	: 12; //12 grupo de creacion automatica
			$post['id_usuario']				= $sus['id_tbl_usuario'];

			//pr($post);
			// $post['id_tbl_estado_prepago']	= 1;
			if (!$infocodigo = $app->setCodigoPrepagoGiftCard($post, $id))
				throw new Exception($app->error, $app->codeerror);

			$datos['cantidad'] = 1;
			$post['id_tbl_usuario'] = $sus['id_tbl_usuario'];
			$infoCodSub = $app->getCodigoPrepagoGiftCards($datos);

			$primerElemento = reset($infoCodSub['lista']);
			if (!empty($primerElemento)) {
				$campos['codigo'] = $primerElemento[0]['codigo'];
				$campos['urlimg'] = $primerElemento[0]['urlimg'];
				$campos['titulo'] = $primerElemento[0]['titulo'];
			}
			//pr($campos);	
		} else {
			throw new Exception($subscriber->error, $subscriber->codeerror);
		}
	} else {
		// $contactos[$post['telefono']] = 3;
		// pr($suscripcion);
		// exit();
		if ($post['demo'] == true)
			$subscriber->demo = true;

		$data['notificarCliente'] = true;
		if (isset($post['notificarCliente']))
			$data['notificarCliente']  = $post['notificarCliente'];

		$data['notificar'] = true;
		if (isset($post['notificar']))
			$data['notificar']  = $post['notificar'];

		if (!$respuesta =  $subscriber->addSuscripcionFast($data))
			throw new Exception($subscriber->error, $subscriber->codeerror);

		if (isset($respuesta['vendedor'])) {
			$campos['vendedor'] = $respuesta['vendedor'];
		}
		$id_usuario_nuevo = $respuesta['id_tbl_suscripcion'];
		$campos['codigo'] = $subscriber->codigo;
		$campos['clave'] = $subscriber->clave;
		// $campos['identificacion'] = $subscriber->ci;
		$campos['identificacion'] = $post['personal']['ci'];
		$campos['fecha_caducidad'] = $subscriber->fecha_final_suscripcion;
		$campos['id_suscripcion_renovacion'] = $subscriber->id_suscripcion_renovacion;

		$arrayFecha = explode("-", $subscriber->fecha_final_suscripcion);
		$campos['fecha_caducidad_texto'] = $arrayFecha[2] . ' de ' . $model->meses['full'][$arrayFecha[1]] . ' de ' . $arrayFecha['0'];

		// Alta hecha desde RISE: avisar a administracion para que ingresen el pago.
		if (isset($post['origen']) && $post['origen'] === 'rise')
			notificarSuscripcionRise($app, $subscriber, $post);
	}

	if ($id_usuario_creador > 0) {
		$subscriber->setUsuarioCreador($id_usuario_creador, $subscriber->id_suscripcion_renovacion);
	}


	$respuesta  = array('estado' => true, 'msj' => $txtMensajesalida, 'data' => $campos);
	//REGISTRO DE LOG
	$id_log_api = $app->log_api($respuesta, $fileExecute, $id_log_api);

	//API EXTERNA
	$data2 = [
		"email" => $personal['email'],
		"cedula" => $campos['identificacion'],
		"password" => $campos['clave'],
		"name" => $post['personal']['nombres'],
		"description" => $campos['codigo'],
		"avatarUrl" => $campos['urlimg'],
		"site" => "",
		"phone" => $post['personal']['celular']
	];

	// Suscripcion con codigo promocional: el biosite nuevo es hijo del biosite del dueño del codigo
	$cedulaPadreBiosite = getCedulaDuenoCodigoPromocional($app, $subscriber, $post['producto']['id_codigo_promocional'] ?? 0);
	if (!empty($cedulaPadreBiosite) && $cedulaPadreBiosite != $campos['identificacion'])
		$data2['parentCedula'] = $cedulaPadreBiosite;

	$curl = curl_init();

	curl_setopt_array($curl, [
		CURLOPT_URL => "https://visitaecuador.com/bio-api/auth/register",
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_POST => true,
		CURLOPT_HTTPHEADER => [
			"Content-Type: application/json"
		],
		CURLOPT_POSTFIELDS => json_encode($data2)
	]);

	$response = curl_exec($curl);


	curl_close($curl);
	//FIN API EXTERNA

	echo json_encode($respuesta);
} catch (Exception $e) {
	$retornar = array('estado' => false, 'codigo' => $e->getCode(), 'msj' => $e->getMessage());
	$id_log_api = $app->log_api($retornar, $fileExecute, $id_log_api);
	echo json_encode($retornar);
	// echo json_encode(array('estado'=>false,'message'=>$e->getMessage()));

}


/**
 * Cedula del dueño (id_tbl_usuario_vendedor) del codigo promocional usado en la suscripcion,
 * para registrar su biosite como padre en la API de biosite. Si no hay codigo o no se
 * encuentra al dueño devuelve null y el biosite se crea sin padre.
 */
function getCedulaDuenoCodigoPromocional($app, $subscriber, $id_codigo_promocional)
{
	if (!($id_codigo_promocional > 0))
		return null;

	if (!$codigopromo = $app->getCodigoPromocionalById($id_codigo_promocional))
		return null;

	if (!($codigopromo['id_tbl_usuario_vendedor'] > 0))
		return null;

	if (!$dueno = $subscriber->getSuscripcion($codigopromo['id_tbl_usuario_vendedor']))
		return null;

	return !empty($dueno['ci_ruc']) ? $dueno['ci_ruc'] : null;
}

/**
 * Aviso interno de una suscripcion creada desde RISE (venta del call center), para que
 * administracion y contabilidad ingresen el pago. Usa el mismo correo que el pago con
 * tarjeta por POS (sendContacto tipo 7, plantilla_notificacion_pago_por_tarjeta_CV.php)
 * y los mismos destinatarios que Subscriber::setPagoBoton.
 *
 * La suscripcion ya quedo creada: si el correo falla solo se deja en el log, sin tocar
 * la respuesta. Lo que imprima PHPMailer o algun warning se descarta para no romper
 * el JSON que espera RISE.
 */
function notificarSuscripcionRise($app, $subscriber, $post)
{
	try {
		$info = array();
		$asunto = '';
		if ($subscriber->demo) {
			$asunto = '(EMAIL DE PRUEBA) ';
			$info['bcc'][] = array('email' => 'desarrollo@visitaecuador.com', 'nombre' => 'Desarrollo');
		} else {
			$info['bcc'][] = array('email' => 'GAdministrativo@visitaecuador.com', 'nombre' => 'Diego');
			$info['bcc'][] = array('email' => 'subgerencia@visitaecuador.com', 'nombre' => 'Ma. Andrea');
			$info['bcc'][] = array('email' => 'contabilidad3@visitaecuador.com', 'nombre' => 'Gabriela');
		}

		$pago = isset($post['producto']['pago'][0]) ? $post['producto']['pago'][0] : array();
		$vendedor = is_array($subscriber->vendedor) ? $subscriber->vendedor : array();

		$info['subject']          = $asunto . 'Suscripción creada en RISE - Ingresar pago - VisitaEcuador.com';
		$info['id_servicio']      = $post['id_servicio'];
		$info['identificacion']   = $post['personal']['ci'];
		$info['nombreSuscriptor'] = $post['personal']['nombres'];
		$info['celular']          = $post['personal']['celular'];
		$info['emailCliente']     = $post['personal']['email'];
		$info['codigo']           = $subscriber->codigo;
		$info['nombreProducto']   = $subscriber->nombreProducto;
		$info['valorSuscripcion'] = isset($pago['total']) ? $pago['total'] : $subscriber->valorSuscripcion;
		$info['codigoVendedor']   = isset($vendedor['codigo']) ? $vendedor['codigo'] : '';
		$info['nombreVendedor']   = isset($vendedor['ltNomUsuario']) ? $vendedor['ltNomUsuario'] : '';
		$info['origen']           = 'RISE';
		$info['formaPago']        = 'Por confirmar con el cliente';

		ob_start();
		$enviado = $app->sendContacto(7, $info);
		ob_end_clean();

		if (!$enviado)
			error_log('notificarSuscripcionRise: ' . $app->error);
	} catch (Throwable $e) {
		if (ob_get_level() > 0)
			ob_end_clean();
		error_log('notificarSuscripcionRise: ' . $e->getMessage());
	}
}
