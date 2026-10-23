<?php

	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	header('Access-Control-Allow-Headers: *');
	header("Access-Control-Allow-Origin: *");

	error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', '/tmp/cert_debug.log');
register_shutdown_function(function() {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, 1, 4, 16, 64, 256])) {
        error_log('[FATAL] ' . print_r($err, true));
    }
});

	if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
		exit(0);
	} 
	include('configuraciones.php');
	 
	include_once ($GLOBALS['vtClass'] . 'certificado.php');  
	$certificado = new Certificado();

	include_once ($GLOBALS['vtClass'] . 'subscriber.php');    // persona
	$subscriber = new Subscriber();

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
		
		$tokenGet = $post['token'];
		if(!isset($post['token']) or empty($tokenGet))
			throw new Exception("no existe token", 1);
		if(!$userapp->AuthToken($tokenGet))
			throw new Exception($userapp->error, $userapp->codeerror);
		if($userapp->id_tbl_usuario>0)
			$post['id_tbl_usuario'] = $userapp->id_tbl_usuario;

		if (empty($post['id_establecimiento']) or !isset($post['id_establecimiento'])) 
			throw new Exception("No existe establecimiento", 1);
	
		if (empty($post['ofertas']) or !isset($post['ofertas'])) 
			throw new Exception("No existe oferta(s)", 1);
		
		if (empty($post['fecha']) or !isset($post['fecha'])) 
			throw new Exception("No existe fechas", 1);
			
		if (empty($post['usuario']) or !isset($post['usuario'])) 
			throw new Exception("No existe usuario", 404);

		if($post['usuario']==2)
			$post['usuario']="gerencia@visitaecuador.com";

		// getUser busca por usu_o_email, NO por el codigo de suscripcion. La app
		// envia infoUsuario['codigo'], que solo coincide en los usuarios cuyo
		// nombre de acceso es su codigo; para quien se registro con correo la
		// busqueda falla con "No existe el usuario".
		//
		// En reemision se sabe quien pide el certificado por el token, asi que
		// se reintenta por id. No se hace en la emision normal: ahi un
		// 'usuario' que no resuelve debe seguir siendo un error, para no emitir
		// a nombre de quien llama cuando se pidio para otra persona.
		$usuario = $userapp->getUser(0, $post);
		if (!$usuario && !empty($post['reemision']) && $userapp->id_tbl_usuario > 0) {
			error_log('[getCertificado] usuario "' . $post['usuario']
				. '" no resuelve por usu_o_email; se usa el del token ('
				. $userapp->id_tbl_usuario . ')');
			$usuario = $userapp->getUser($userapp->id_tbl_usuario);
		}
		if (!$usuario)
			throw new Exception($userapp->error, $userapp->codeerror);
		$hoy = date('Y-m-d');
		$suscripcion = $subscriber->getSuscripcion($usuario['id_tbl_usuario']);
		//if($suscripcion['esSuscriptor'] == 'si'){
			//if ($suscripcion['fecha_fin'] < $hoy) {		
				//throw new Exception("Su suscripción caducó");
			//}else{
				$arraySuscripcion = ['IdSus'	=> ($suscripcion['codigo']==null ? "express":$suscripcion['codigo']),	
								'id_tbl_usuario'=>$usuario['id_tbl_usuario'],	
								'CedulaSus'=>$usuario['ci_ruc'],
								'NombreSus'=>$usuario['nom1']." ".$usuario['nom2']." ".$usuario['ape1']." ".$usuario['ape2'],	
								'fecha_fin_sus'		=>$suscripcion['fecha_fin'],															
								'Adultos'=>$post['adultos'],
								'Ninos'=>$post['ninos'], 
								'FechaIn'=>$post['fecha']['inicio'],
								'FechaOut'=>$post['fecha']['fin'],
							];
			//}
		//}	
		
		if(!$infor = $certificado->getCertificado($post,$arraySuscripcion))
		 	throw new Exception($certificado->error, $certificado->codeerror);
		
		//$res=array_merge($arraySuscripcion,array("ofertas"=>$infor));

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
			 
		 

	} catch (\Throwable $e) {
		// Este bloque venia copiado de un metodo de clase: usaba $this (que no
		// existe en un script) y hacia return en el nivel superior del archivo.
		// El propio catch lanzaba entonces un Error fatal, asi que CUALQUIER
		// excepcion -incluidas las validaciones normales como "no existe token"-
		// salia como HTTP 500 con cuerpo vacio en vez de como JSON, y la app
		// solo podia mostrar un mensaje generico.
		error_log('[getCertificado] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine() . "\n" . $e->getTraceAsString());

		$resultado = array(
			'estado' => false,
			'codigo' => $e->getCode() ?: 500,
			'msj'    => $e->getMessage(),
		);
		echo json_encode($resultado);
	}
 
