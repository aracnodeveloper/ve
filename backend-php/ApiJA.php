<?php
    
    //error_reporting(E_ALL); ini_set('display_errors', 1);

    header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	header('Access-Control-Allow-Headers: *');
    //include('configuraciones.php');
    include 'JApasswd.php';

    $method = $_SERVER['REQUEST_METHOD'];
	$fileExecute = $_SERVER['REQUEST_URI'];
	try {
            /*Inicializacion*/
            if($method !='POST')
            throw new Exception("Metodo de conexion equivocado", 1004);

        //obtener flujo de informacion por POST con file_get_content
        $post = json_decode(file_get_contents("php://input"), true);
       // $id_log_api = $app->log_api($post,$fileExecute);
        //pr($post);

        $resp="";
        if(!$post)
            throw new Exception("No existen parametros", 1001);     
       
        if (empty($post['cedula']) or !isset($post['cedula'])) 
            throw new Exception("No existe cedula", 1);

        if (empty($post['cuenta']) or !isset($post['cuenta'])) 
            throw new Exception("No existe cuenta", 2);

        if (empty($post['desc_producto']) or !isset($post['desc_producto'])) 
            throw new Exception("No existe descripcion_producto", 3);

        if (empty($post['precio']) or !isset($post['precio']) or !is_numeric($post['precio'])) 
            throw new Exception("No existe o no es numérico el  precio", 4);

        $datosUsr=array(
            "cedula"=>          $post['cedula'],
            "cuenta"=>          $post['cuenta'],
            "desc_producto"=>   $post['desc_producto'],
            "precio"=>          $post['precio']   
        );

        if($post['tipo']=="validarCuenta"){                 
            $resp=validarCuenta($datosUsr);           
          //print_r(getAccessToken());
        }else if($post['tipo']=="validarOTP"){ 
            if (empty($post['otp']) or !isset($post['otp'])) 
                throw new Exception("No existe otp", 2);
            
            if (empty($post['idDispositivo']) or !isset($post['idDispositivo'])) 
                throw new Exception("No existe idDispositivo", 3);

            if (empty($post['ipDispositivo']) or !isset($post['ipDispositivo'])) 
                throw new Exception("No existe ipDispositivo", 4);

            if (empty($post['mac']) or !isset($post['mac'])) 
                throw new Exception("No existe mac", 5);

            if (empty($post['sistemaOperativo']) or !isset($post['sistemaOperativo'])) 
                throw new Exception("No existe sistemaOperativo", 6);

            if (empty($post['userAgent']) or !isset($post['userAgent'])) 
                throw new Exception("No existe userAgent", 3);
                
            
            $datosUsr['otp'] = $post['otp'];
            $datosUsr['idDispositivo'] = $post['idDispositivo'];
            $datosUsr['ipDispositivo'] = $post['ipDispositivo'];
            $datosUsr['mac'] = $post['mac'];
            $datosUsr['sistemaOperativo'] = $post['sistemaOperativo'];
            $datosUsr['userAgent'] = $post['userAgent'];                

            $resp=validarOTP($datosUsr);
        }else
            throw new Exception("tipo equivocado", 4);


        /*fin de inicializacion*/
        $resultado = 
        array(
        "estado"		=>	true,
        "codigo" 		=> 	0,
        'msj'			=> "Correcto",        
        );

       // $id_log_api = $app->log_api($resultado,$fileExecute,$id_log_api);

        echo json_encode($resultado);


    } catch (Exception $e) {
		$resultado =array('estado'=>false,'codigo'=>$e->getCode(),'msj'=>$e->getMessage());		
		//$id_log_api = $app->log_api($resultado,$fileExecute,$id_log_api);
		echo json_encode($resultado);
		// echo json_encode(array('estado'=>false,'message'=>$e->getMessage()));		
	}




            


    
function getAccessToken()
{    
    try {
        global $params;
        global $urlToken;
        //echo($urlToken);

        $tokenContent = "grant_type=".$params['grant_type']."&username=".$params['usr']."&password=".$params['passwd'];
        $authorization = base64_encode($params['cli_id']. ":".$params['cli_secret']);
        $tokenHeaders = array("Authorization: Basic {$authorization}","Content-Type: application/x-www-form-urlencoded");

        //print_r($tokenContent);
        //print_r($authorization);
        //print_r($tokenHeaders);


        $token = curl_init();
        curl_setopt($token, CURLOPT_URL, $urlToken);
        curl_setopt($token, CURLOPT_HTTPHEADER, $tokenHeaders);
        curl_setopt($token, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($token, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($token, CURLOPT_POST, true);
        curl_setopt($token, CURLOPT_POSTFIELDS, $tokenContent);
        $response = curl_exec($token);

        //print_r($response);
        
        if(curl_errno($token)){        
            throw new Exception('Error en la petición token: ' . curl_error($token));
        } 
        curl_close ($token); 
      
        return(json_decode($response)); 
    
    } catch (Exception $e) {      
        throw new Exception (json_encode(array("error" => "Error interno del servidor: " . $e->getMessage()))); 
    }
}

//print_r(json_encode(getAccessToken()));

  
function validarCuenta($datosUsr){
    global $urlValidarCta;
    $token_data = getAccessToken();
    //echo("***");
    //echo($token_data);
    if (!$token_data || !isset($token_data->access_token) || empty($token_data->access_token)){       
        throw new Exception("No se pudo obtener un token válido ".json_encode($token_data));
    } else {
        $datos = array(
            "operationTrxId" => 5,
            "fechaDispositivo" => date("Y-m-d H:i:s"),
            "fechaRed" => date("Y-m-d H:i:s"),
            "origenTrx"=>0,
            "producto"=>1,
            "cuenta"=>$datosUsr['cuenta'],    //2231964
            "monto"=>$datosUsr['precio'],
            "tipoTrx"=>1,
            "normal"=>true,
            "identificacion"=>$datosUsr['cedula'],
            "cliente"=>"0190167895001",
            "operacion"=>$datosUsr['desc_producto']
        );
        $json_data = json_encode($datos);
        //print($json_data);
        $stringBase64 = base64_encode($json_data);
    // print("    base64:   ".$stringBase64);       

        $data = array('data' => $stringBase64);
        $data_string = json_encode($data);

        $ch = curl_init($urlValidarCta);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Authorization: Bearer '. $token_data->access_token,
            'Content-Length: ' . strlen($data_string))
        );

        $response = curl_exec($ch);
        //print_r(json_decode($response));
        
        if(curl_errno($ch)){
            curl_close($ch);
            throw new Exception('Error en la petición validarCuenta: ' . curl_error($ch));
        }else {  
            curl_close($ch); 
            $resp=json_decode($response);        
            if(!empty($resp->status) && isset($resp->status))
                throw new Exception ("error en la URL");            
            if (empty($resp->code) || !isset($resp->code) || $resp->code != 1)
                throw new Exception("error: " . $resp->mensajeError);
            
            //print_r("correcto.!!!!".json_encode($resp));
            return true;
        }
    }
}

function validarOTP($datosUsr){   
    global $urlValidarOtp;
    $token_data = getAccessToken();
    if (!$token_data || !isset($token_data->access_token) || empty($token_data->access_token)){
       // print_r($token_data);
        throw new Exception("No se pudo obtener un token válido OTP".json_encode($token_data));
    } else {
        $datos = array(
            "operationTrxId" => 5,
            "fechaDispositivo" => date("Y-m-d H:i:s"),
            "fechaRed" => date("Y-m-d H:i:s"),
            "origenTrx"=>0,
            "producto"=>1,
            "cuenta"=>$datosUsr['cuenta'],    //2231964
            "monto"=>$datosUsr['precio'],
            "tipoTrx"=>1,
            "normal"=>true,
            "identificacion"=>$datosUsr['cedula'],
            "cliente"=>"0190167895001",
            "operacion"=>$datosUsr['desc_producto'],   

            "otp"=>base64_encode($datosUsr['otp']),
            "host"=>"192.168.0.50",
            "idDispositivo"=> $datosUsr['idDispositivo'],
            "ipDispositivo"=>$datosUsr['ipDispositivo'],
            "mac"=>$datosUsr['mac'],
            "sistemaOperativo"=>$datosUsr['sistemaOperativo'],
            "userAgent"=>$datosUsr['userAgent']
        );
        $json_data = json_encode($datos);
        //print_r($json_data);
         $stringBase64 = base64_encode($json_data);
      //print("    base64:   ".$stringBase64); 
       
 
         $data = array('data' => $stringBase64);
         $data_string = json_encode($data);
 
         $ch = curl_init($urlValidarOtp);
         curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
         curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
         curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
         curl_setopt($ch, CURLOPT_HTTPHEADER, array(
             'Content-Type: application/json',
             'Authorization: Bearer '. $token_data->access_token,
             'Content-Length: ' . strlen($data_string))
         );
 
         $response = curl_exec($ch);
         //print_r(json_decode($response));
         
         if(curl_errno($ch)){
             curl_close($ch);
             throw new Exception('Error en la petición validarCuenta: ' . curl_error($ch));
         }else {  
             curl_close($ch); 
             $resp=json_decode($response);              
             
             //print_r($resp);
             
             if(!empty($resp->status) && isset($resp->status))
                 throw new Exception ("error en la URL");            
             if (empty($resp->code) || !isset($resp->code) || $resp->code != 1)
                 throw new Exception($resp->mensajeError);
             
            // print_r("correcto.!!!!".json_encode($resp));
             return true;
        }
    }
}




