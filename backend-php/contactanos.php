<?php
	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	header('Access-Control-Allow-Headers: *');
	 
	include('configuraciones.php');
	require_once($GLOBALS['vtClass'] . 'enviarMail.php');

	//error_reporting(E_ALL); ini_set('display_errors', 1);

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
	
		//$id_log_api = $app->log_api($resultado,$fileExecute,$id_log_api);
		echo json_encode($resultado);

	} catch (Exception $e) {		
		$resultado = array('estado'=>false,'codigo'=>$e->getCode(),'msj'=>$e->getMessage());
		//$id_log_api = $app->log_api($resultado,$fileExecute,$id_log_api);
		echo json_encode($resultado);
	}