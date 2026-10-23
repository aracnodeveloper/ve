<?php
	
	//error_reporting(E_ALL); ini_set('display_errors', 1);

	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	header('Access-Control-Allow-Headers: *');
	 
	include('configuraciones.php');	 
	include_once ($GLOBALS['vtClass'] . 'reportes.php');  
	$reportes = new Reportes();

	$method = $_SERVER['REQUEST_METHOD'];
	$fileExecute = $_SERVER['REQUEST_URI'];
	try {
		
		/*Inicializacion*/
		if($method !='POST')
			throw new Exception("Metodo de conexion equivocado", 1004);

		//obtener flujo de informacion por POST con file_get_content
		$post = json_decode(file_get_contents("php://input"), true);
	 	$id_log_api = $app->log_api($post,$fileExecute);
		//pr($post);
		
        if(!$post)
			throw new Exception("No existen parametros", 1001);
		
		if (empty($post['fecha_inicio']) or !isset($post['fecha_inicio'])) 
			throw new Exception("No existe fecha_inicio", 1);

        if (empty($post['fecha_fin']) or !isset($post['fecha_fin'])) 
			throw new Exception("No existe fecha_fin", 1);

		//if (empty($post['agrupar']) or !isset($post['agrupar'])) 
		//	throw new Exception("No existe agrupar", 1);
		
		//if (empty($post['tipoCuenta']) or !isset($post['tipoCuenta'])) 
		//	throw new Exception("No existe tipoCuenta", 1);
		
		if(!$infor = $reportes->getRepSuscripciones($post))
			throw new Exception($reportes->error, $reportes->codeerror);
		
		
	 
			
		/*fin de inicializacion*/
		$resultado = 
 		array(
 			"estado"		=>	true,
			"codigo" 		=> 	0,
			'msj'			=> "Correcto",
			'data'			=> $infor
 		);

		//$id_log_api = $app->log_api($resultado,$fileExecute,$id_log_api);

		echo __json_encode($resultado);

			// echo __json_encode(array('response'=>200,'msj'=>$respuesta));
			 
		 

	} catch (Exception $e) {
		$resultado =array('estado'=>false,'codigo'=>$e->getCode(),'msj'=>$e->getMessage());		
		//$id_log_api = $app->log_api($resultado,$fileExecute,$id_log_api);
		echo json_encode($resultado);
		// echo json_encode(array('estado'=>false,'message'=>$e->getMessage()));		
	}
 
