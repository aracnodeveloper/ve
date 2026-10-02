<?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	header('Access-Control-Allow-Headers: *');
	 
	include('configuraciones.php');
	require_once($GLOBALS['vtClass'] . 'enviarMail.php');

	//error_reporting(E_ALL); ini_set('display_errors', 1);

/**
 * Crea en RISE el lead de quien llena "Agregar tu punto de carga".
 *
 * Tipo CARGADORES (ya existe en RISE; su canal destino es Operaciones, que el propio RISE hereda
 * del tipo y con el que realinea la etapa). Se manda la etapa "Nuevo" y RISE la ajusta al canal.
 *
 * Nunca interrumpe el formulario: si RISE no responde, el correo igual sale y el visitante ve su
 * confirmacion. Devuelve "creado", "existente" (ya habia un lead activo con esa cedula y tipo) o
 * "error".
 */
function crearLeadPuntoCarga($post)
{
	// Tipo de lead CARGADORES en RISE.
	$typeId  = '01a0fd2f-9d8e-7f05-b9cd-94d48c0d6ee1';
	// Etapa "Nuevo"; RISE la cambia por la equivalente del canal del tipo.
	$stageId = '44444444-4444-4444-4444-444444444444';
	$riseApiUrl = defined('RISE_API_URL') ? RISE_API_URL : 'https://ris.redinservsa.com/ris';

	$g = function ($k) use ($post) {
		return isset($post[$k]) ? trim((string)$post[$k]) : '';
	};

	$ciudad = $g('ciudad');
	$payload = array(
		'stageId'     => $stageId,
		'typeId'      => $typeId,
		'name'        => $g('nombres'),
		'phone'       => $g('telefonos'),
		'email'       => $g('email'),
		'cedula'      => $g('ci'),
		// city es obligatorio en RISE.
		'city'        => $ciudad !== '' ? $ciudad : 'No especificada',
		'address'     => $g('direccion'),
		'occupation'  => '',
		// El mensaje del formulario queda como observacion del lead.
		'observation' => $g('mensaje'),
	);

	try {
		$ch = curl_init($riseApiUrl . '/api/Lead');
		curl_setopt_array($ch, array(
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_POST           => true,
			CURLOPT_POSTFIELDS     => json_encode($payload),
			CURLOPT_HTTPHEADER     => array('Content-Type: application/json', 'Accept: application/json'),
			CURLOPT_CONNECTTIMEOUT => 3,
			CURLOPT_TIMEOUT        => 8,
		));
		$respuesta = curl_exec($ch);
		$httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);

		if ($httpCode == 200 || $httpCode == 201)
			return 'creado';

		// RISE no permite dos leads activos con la misma cedula y tipo: si ya estaba, no es un error.
		if (stripos((string)$respuesta, 'ya existe') !== false || $httpCode == 409)
			return 'existente';

		error_log('[puntoCarga] RISE no creo el lead (HTTP ' . $httpCode . '): ' . substr((string)$respuesta, 0, 300));
		return 'error';
	} catch (Exception $e) {
		error_log('[puntoCarga] Error creando lead en RISE: ' . $e->getMessage());
		return 'error';
	}
}

	$method = $_SERVER['REQUEST_METHOD'];
	$fileExecute = $_SERVER['REQUEST_URI'];

	try {

		if($method !='POST')
			throw new Exception("Metodo de conexion equivocado", 1004);

		//obtener flujo de informacion por POST con file_get_content
		$post = json_decode(file_get_contents("php://input"), true);	 	

		if(!$post)
			throw new Exception("No existen parametros", 1001);
			
			
		//if(!isset($post['contactarseCon']) or empty($post['contactarseCon']))
		///	throw new Exception("no existe contactarseCon", 1);

       // if(!isset($post['cedula']) or empty($post['cedula']))
		//	throw new Exception("no existe cédula", 1);
        
        //if(!isset($post['nombres']) or empty($post['nombres']))
		//	throw new Exception("no existe Nombres", 1);

        if(!isset($post['email']) or empty($post['email']))
			throw new Exception("no existe email", 1);

        if(!isset($post['tipo']) or empty($post['tipo']))
			throw new Exception("no existe tipo", 1);

		$mail=new Mail();		

		switch ($post['tipo']) {
			case "mailCPN":
				if (!isset($post['mensaje']) || empty($post['mensaje'])) 
					throw new Exception("No existe mensaje", 1);            
				$resp = $mail->sendMail($post);
				break;
			case "mailGiftcard":
				$resp = $mail->sendMailCodigoBarrasSuscripcion($post);
				break;
			case "mailSolicitudCobroCashback":					 
				$resp = $mail->sendMailSolicitudCobroCashback($post);           
				break;
			case "mailExpress":					 
				$resp = $mail->sendMailExpress($post);           
				break;
			case "mailPrueba":
				$resp = $mail->sendMailPrueba($post);
				break;
			case "puntoCarga":
				// Primero el lead: si el correo falla y la persona reintenta, RISE responde que ya
				// existe y no se duplica.
				$lead = crearLeadPuntoCarga($post);
				$resp = $mail->sendMailContacto($post);
				break;
			case "contactoWeb":
			case "emprendedor":
				$resp = $mail->sendMailContacto($post);
				break;
			case "confirmacionPago":
				$resp = $mail->sendMailConfirmacionPago($post);
				break;
			default:
				throw new Exception("Tipo equivocado", 88);
		}

		if (!$resp) 
			throw new Exception($mail->error, $mail->codeerror);    
				
		$mensaje = "Mensaje enviado correctamente";

		$resultado = array(
				"estado"		=>	true,
				"codigo" 		=> 	0,
				"data"			=>  $resp				
			);

		if (isset($lead))
			$resultado['lead'] = $lead;
	
		//$id_log_api = $app->log_api($resultado,$fileExecute,$id_log_api);
		echo json_encode($resultado);

	} catch (Exception $e) {		
		$resultado = array('estado'=>false,'codigo'=>$e->getCode(),'msj'=>$e->getMessage());
		//$id_log_api = $app->log_api($resultado,$fileExecute,$id_log_api);
		echo json_encode($resultado);
	}