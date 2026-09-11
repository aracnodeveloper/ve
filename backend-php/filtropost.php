<?php
/**
 * ver ofertas favoritas de una persona
 */ 
//error_reporting(E_ALL); ini_set('display_errors', 1);

	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	header('Access-Control-Allow-Headers: *');
	 
	include('configuraciones.php');
	//autenticacion
	// include($GLOBALS['vtClass'] . 'auth.php');
	// include($GLOBALS['vtClass'] . 'hotels.php');    // persona

	$method = $_SERVER['REQUEST_METHOD'];
	$fileExecute = $_SERVER['REQUEST_URI'];

	try {

		if($method !='POST')
			throw new Exception("Metodo de conexion equivocado", 1004);


		//obtener flujo de informacion por POST con file_get_content
		$post = json_decode(file_get_contents("php://input"), true);
	 	$id_log_api = $app->log_api($post,$fileExecute);

		if(!$post)
			throw new Exception("No existen parametros", 1001);
			
		//verificar que este auntenticados
		$tokenGet = $post['token'];

		if(!isset($post['token']) or empty($tokenGet))
			throw new Exception("no existe token", 1);
		//verificar autenticacion de token
		if(!$userapp->AuthToken($tokenGet))
			throw new Exception($userapp->error, $userapp->codeerror);
		// pr(json_decode(json_encode($userapp),true));
		

		//comprobar autenticacion por token
		// $data  	= Auth::GetData($tokenGet);
		// $data 	= json_decode( json_encode($data),true);
		//Envio información de usuario
		if($userapp->id_tbl_usuario > 0)
			$post['id_tbl_usuario'] = $userapp->id_tbl_usuario;
		
		if($userapp->id_servicio > 0)
			$post['id_servicio'] = $userapp->id_servicio;
		
		if(!empty($userapp->metodo))
			$post['metodo'] = $userapp->metodo;
		
		if(!empty($userapp->origen))
			$post['origen'] = $userapp->origen;
		 
		$post['mode'] = 'filtro';
		
		$hotels = new Hotels($userapp->id_servicio);
		$hotels->rangofechas = $post['fechas'];
		if(!$respuesta  = $hotels->verOfertas($post))
			throw new Exception($hotels->error, $hotels->codeerror);
		
		//pr($hotels->opcionesReserva);

	$resultado = array(
		"estado" => true,
		"codigo" => 0,
		"data"   => array(
			"establecimientos" => $hotels->establecimientosdemo,
			"beneficios"       => $hotels->getTipoOfertas(),
			"filtro"           => $hotels->filtro,
			"resultadotexto"   => $hotels->resultadotexto,

			// ── NUEVO: metadatos de paginación (por establecimiento) ──
			"paginacion" => array(
				"totalEstablecimientos" => (int) $hotels->totalOfertas,
				"nPaginas"              => (int) $hotels->nPaginas,
				"paginaActual"          => (int) $hotels->paginaActual,
				"porPagina"             => (int) $hotels->nPorPagina,
				"hayMas"                => ((int) $hotels->paginaActual < (int) $hotels->nPaginas),
			),

			'centralReserva' => $app->getConfig(array('id_servicio' => $userapp->id_servicio))['contacto_reserva'],
			'url' => [
				'logo'   => $hotels->configApp['urlimg']['100x67'],
				'oferta' => $hotels->configApp['urlimg']['500x500']
			],
		)
	);

		$id_log_api = $app->log_api($resultado,$fileExecute,$id_log_api);

		echo __json_encode($resultado);
			
			// echo __json_encode(array('estado'=>true,"codigo"=>0,'msj'=>$respuesta));


	} catch (Exception $e) {
		// echo json_encode(array('estado'=>false,'codigo'=>$e->getCode(),'msj'=>$e->getMessage(),'error'=>$hotels->model->error));
		$resultado = array('estado'=>false,'codigo'=>$e->getCode(),'msj'=>$e->getMessage());
		$id_log_api = $app->log_api($resultado,$fileExecute,$id_log_api);
		echo json_encode($resultado);
	}