<?php
/**
 * @Creacion Fecha: 03/01/2012
 * @author Wilson Cajamarca
 * @Caso de Uso: #56
 * @descripcion: Almacena las transacciones tanto de suscripciones como de smart
 * @historial: 1. Wilson Cajamarca, 03/01/2012, Primer Desarrollo.
 *                Wilson Cajamarca, 20/01/2012, Aumento del parametro $piIdActivacion.
 *                Wilson Cajamarca, 01/03/2012, Aumento del parametro $piDocumentoAfecta.
 * @param integer $piIdMovimiento: Id correspondiente de la Tabla tbl_movimiento seg�n el caso que corresponda.
 * @param integer $piUsuarioCliente: Id correspondiente de la Tabla tbl_usuario a quien se le esta realizando la transacci�n.
 * @param array $paDetalleKardex: Array Bidimensional que esta compuesto de 4 parametros que seran utilizados para el detalle del kardex, la forma de armar dicho array esta en la parte baja de la funcion como ejemplo.
 * @param integer $piAplicaCanje: Un valor bit (0,1). Si se apica canje va 1 caso contrario va 0.
 * @param $piIdEstablecimiento: Id del Establecimiento correspondiente cuando la transaccion sea de SMART.
 * @param $piIdDocumento: Id del Documento con relaci�n es decir el Id del Contrato del Establecimiento o el Id del registro de renovaci�n de la suscricpi�n.
 * @param $piIdActivacion: Id que corresponde si el registro es ACTIVO(1) e INACTIVO(2)
 * @param $piDocumentoAfecta: Id del de la id de la cabecera correspondiente que se inserta en el caso de existencia de pagos, Si se requiere poner el valor q corresponde caso contrario poner 0.
 */
//include("configuraciones.php");
include_once($vtLibreriasFunciones."fn_validarDatos.php");
include_once($vtLibreriasFunciones."fn_conectarBD.php");
include_once($vtLibreriasFunciones."fn_obtenerMovimiento.php");

//esto solo para probar el ejemplo desde la funcion, debe ir en los archivos correspondientes donde se la llamada a esta funcion
//include_once($vtLibreriasFunciones."fn_autentificacionSistema.php");
//$prueba=fn_autentificacionSistema("webmaster@visitaecuador.com","webmaster@visitaecuador.com",1); 
//var_dump($prueba);

function fn_registrarKardex($piIdMovimiento,$piUsuarioCliente, $paDetalleKardex, $piAplicaCanje, $piIdEstablecimiento, $piIdDocumento, $piIdActivacion, $piIdDocumentoAfecta,$piIdMovimientoPadre=0, $piIdTipoCanal=0)
{
    //Id de Usuario Vendedor
    $piIdUsuarioVendedor=(int)$_SESSION['siIdUsuario'];
    
    
    
//    $pais_array = explode(',', $pais['cadenas']);
//    
//    $cod_pais = $pais_array[count($pais_array) - 1];
//    
//    echo "CODIGO - $cod_pais";
//    
//    $sql = "SELECT id_tbl_servicio_web id FROM tbl_servicio_web WHERE id_tbl_lugar = $cod_pais";
//    $servicio_web = mysql_query($sql);
//    $servicio_web = mysql_fetch_array($servicio_web);
//    echo mysql_error();
//    $servicio_web = $servicio_web['id'];
    
    //Validaciones de Parametros
    $laValidaP1 = array();
    $laValidaP1 = fn_validarDatos($piIdMovimiento,13,true,false,".",true,1,12,"",false,"","");
    if($laValidaP1[1]==false){
        $laMsg['p1'] = $laValidaP1[2];
    }
    $laValidaP2 = array();
    $laValidaP2 = fn_validarDatos($piUsuarioCliente,13,true,false,"_",true,1,12,"",false,"","");
    if($laValidaP2[1]==false){
        $laMsg['p2'] = $laValidaP2[2];
    }
    if(!empty($paDetalleKardex)){
        $liContador = 0;
         foreach ($paDetalleKardex as $llave => $ltFila){
             
              //cantidad
              $laValidaP4 = array();
              $laValidaP4 = fn_validarDatos($ltFila['cantidad'],13,true,false,"_",true,1,3,"",false,"","");
              if($laValidaP4[1]==false){
                    $laMsg['p4'] = $laValidaP4[2];
                    
              }
               $laCantidad[] =   $laValidaP4[3];
              //precio
              $laValidaP5 = array();
              $laValidaP5 = fn_validarDatos($ltFila['precio'],13,true,false,".",true,1,100,"",false,"","");
              if($laValidaP5[1]==false){
                    $laMsg['p5'] = $laValidaP5[2];
                    
              }
              $laPrecio[] =     $laValidaP5[3];
              
               //id_producto-norequerido
              if(isset($ltFila['id_producto'])){
                      $laValidaP6 = array();
                      $laValidaP6 = fn_validarDatos($ltFila['id_producto'],13,true,false,"_",false,1,7,"",false,"","");
                      if($laValidaP6[1]==false){
                            $laMsg['p6'] = $laValidaP6[2];
                      }
                      $laIdProducto[] = $laValidaP6[3];
              
              }else{
                      $laIdProducto[] = 'NULL';
              }
             
              
              
              //id_tipo_pago-norequerido
              if(isset($ltFila['id_tipo_pago'])){
                     $laValidaP7 = array();
                     $laValidaP7 = fn_validarDatos($ltFila['id_tipo_pago'],13,true,false,"_",false,1,7,"",false,"","");
                     if($laValidaP7[1]==false){
                            $laMsg['p7'] = $laValidaP7[2];
                     }
                     $laIdTipoPago[] = $laValidaP7[3];
              }else{
                    $laIdTipoPago[] = 'NULL';
              }
             
               
              //id_tbl_dtl_pago-norequerido
              if(isset($ltFila['id_tbl_dtl_pago'])){
                  $laValidaP13 = array();
                  $laValidaP13 = fn_validarDatos($ltFila['id_tbl_dtl_pago'],13,true,false,"_",false,1,10,"",false,"","");
                  if($laValidaP13[1]==false){
                        $laMsg['p13'] = $laValidaP13[2];
                  }
                  $laIdDtlPago[] = $laValidaP13[3];
              }else{
                    $laIdDtlPago[] = 'NULL';
              }
              //id_tbl_dtl_pago-norequerido
              if(isset($ltFila['id_tbl_usuario_vendedor'])){
                  $laValidaP13 = array();
                  $laValidaP13 = fn_validarDatos($ltFila['id_tbl_usuario_vendedor'],13,true,false,"_",false,1,10,"",false,"","");
                  if($laValidaP13[1]==false){
                        $laMsg['p13'] = $laValidaP13[2];
                  }
   					$piIdUsuarioVendedor=(int)$laValidaP13[3];
              }
              
              $liContador++;
              
         }//fin foreach
     }//fin validacion array
     //aplica_canje
    
    
     $laValidaP8 = array();
     $laValidaP8 = fn_validarDatos($piAplicaCanje,13,true,false,".",true,1,1,"",false,"","");
     if($laValidaP8[1]==false)
     {
        $laMsg['p8'] = $laValidaP8[2];
     }
     //id_establecimiento
     $laValidaP9 = array();
     $laValidaP9 = fn_validarDatos($piIdEstablecimiento,13,true,false,".",true,1,12,"",false,"","");
     if($laValidaP9[1]==false)
     {
        $laMsg['p9'] = $laValidaP9[2];
     }
     //id_documento
     $laValidaP10 = array();
     $laValidaP10 = fn_validarDatos($piIdDocumento,13,true,false,".",false,1,12,"",false,"","");
     if($laValidaP10[1]==false)
     {
        $laMsg['p10'] = $laValidaP10[2];
     }
     $laValidaP11 = array();
     $laValidaP11 = fn_validarDatos($piIdActivacion,13,true,false,".",true,1,1,"",false,"","");
     if($laValidaP11[1]==false){
        $laMsg['p11'] = $laValidaP11[2];
     }
     $laValidaP12 = array();
     $laValidaP12 = fn_validarDatos($piIdDocumentoAfecta,13,true,false,".",false,1,10,"",false,"","");
     if($laValidaP12[1]==false){
        $laMsg['p12'] = $laValidaP12[2];
     }
	 
	 
      /**
     * Obtener pais del vendedor
     */
    $sql = "
            SELECT 
                s.id_tbl_servicio_web id 
            FROM 
                tbl_servicio_web s, tbl_directorio d 
                INNER JOIN tbl_usuario u ON u.id_tbl_directorio = d.id_tbl_directorio
                INNER JOIN tbl_lugar l ON d.id_tbl_lugar = l.id_tbl_lugar
            WHERE
                u.id_tbl_usuario = $piIdUsuarioVendedor
                AND
                SUBSTRING_INDEX(l.cadenas,',',-1) = s.id_tbl_lugar
                
     ";
    $servicio_web = mysql_query($sql);
    $servicio_web = mysql_fetch_array($servicio_web);
    $servicio_web = $servicio_web['id'];
    if( ! $servicio_web) $servicio_web = 1;
    
     //si existe errores de validacion de parametros podemos verificar aqui
     //echo "<pre>";
     //print_r($laMsg);
     //echo "</pre>";
     //fin de verificacion de errores de validacion de parametros
     if(empty($laMsg))
     {   
       $lbAfirmacion = false;
       $liIdMovimiento =   $laValidaP1[3];
       $liUsuarioCliente = $laValidaP2[3];
       $liAplicaCanje =    $laValidaP8[3];
       $liIdEstablecimiento = $laValidaP9[3];
       $liIdDocumento = $laValidaP10[3];
       $liIdActivacion = $laValidaP11[3];
       $liIdDocumentoAfecta = $laValidaP12[3];
 
       if($liContador>0)
       {
            //-----------------------Se pueden insertar los registros------------------------
            //consulto la tabla tbl_movimiento
            
             $laResultado = fn_obtenerMovimiento($liIdMovimiento);
             if(mysql_num_rows($laResultado)> 0)
             {
                    $liAcumuladorCosto = 0;
                    $laDato = mysql_fetch_assoc($laResultado);

                    // El número del kardex es el mayor entre el contador de tbl_movimiento y el
                    // máximo que ya existe para ese movimiento, más uno. Antes era solo el contador:
                    // si una corrida moría después de insertar la cabecera y antes de incrementarlo,
                    // todas las siguientes intentaban el mismo número y fallaban con
                    // "Duplicate entry 'N-movimiento' for key 'PRIMARY'" (contratos: desde 2025-11-13).
                    $laMaximo = mysql_fetch_assoc(mysql_query(
                        "SELECT COALESCE(MAX(id_tbl_cab_kardex), 0) AS maximo
                           FROM tbl_cab_kardex
                          WHERE id_tbl_movimiento = '".$liIdMovimiento."'"
                    ));
                    $liNuevoSecuencial = max((int)$laDato['secuencial'], (int)$laMaximo['maximo']) + 1;

                    //------insertar la cabecera-------------------------------//
                    
                    //colocar fecha de primer mes en caso que sea un ingreso autom�tico
                    switch($piIdMovimiento){
                        case 10: //egreso
                            //fecha final
                          
                            $lsSql = "   SELECT LAST_DAY(CONCAT(year(date_add(now(), interval -1 month)),'-',month(date_add(now(), interval -1 month)),'-01')) ";
                            $laQuery = mysql_query($lsSql);
                            $laFecha = mysql_fetch_array($laQuery);                                                
                            $ltFechaActual = $laFecha[0]." 23:58:58"; 
                        break;
                        case 11: //ingreso
                        //fecha inicial
                            $fec = date('Y-m');                        
                            $ltFechaActual = "$fec-01 00:00:00";
                        break;
                        default:
                            $ltFechaActual = date('Y-m-d H:i:s');
                        break;
                    } 
                    
                    //echo "fecha".$ltFechaActual."<br/>movimiento:$piIdMovimiento";
                    // By:Pancho / Da error al guardar nueva o modificar la reserva                   
                    $laSql = "INSERT INTO tbl_cab_kardex(id_tbl_cab_kardex,id_tbl_movimiento,id_tbl_usuario_cliente, id_tbl_usuario_vendedor, fecha, aplica_canje, id_tbl_establecimiento, id_documento,id_tbl_activacion,documento_afecta,id_tbl_usuario_creacion,id_tbl_movimientopadre, id_tbl_tipo_canal,id_tbl_servicio_web) 
                              VALUES ($liNuevoSecuencial,$liIdMovimiento, $liUsuarioCliente, $piIdUsuarioVendedor,'$ltFechaActual',$liAplicaCanje, $liIdEstablecimiento, $liIdDocumento, $liIdActivacion, $liIdDocumentoAfecta,'".$_SESSION['siIdUsuario']."','".$piIdMovimientoPadre."',$piIdTipoCanal,$servicio_web)";
                    //echo $laSql;
                    $laResultado = mysql_query(sprintf($laSql)) or die (mysql_error());
                    $liError = mysql_errno();
                    if(empty($liError)){
                            
                           
                           
                            //---------------insertar el detalle--------------------//
                            $laSql = "INSERT INTO tbl_dtl_kardex(id_tbl_dtl_kardex, id_tbl_movimiento, secuencial, cantidad, precio, costo, id_tbl_producto, id_tbl_tipo_pago, id_tbl_dtl_pago) VALUES"; 
                            for($liX=0;$liX<$liContador; $liX++){
                                $liDetalleSecuencial = $liX+1;
                                $liCalculo = ($laCantidad[$liX] * $laPrecio[$liX]);
                                $liAcumuladorCosto = $liAcumuladorCosto + $liCalculo;
                           	    $laSql .= "($liNuevoSecuencial,$liIdMovimiento, $liDetalleSecuencial, $laCantidad[$liX], $laPrecio[$liX],  $liCalculo, $laIdProducto[$liX], $laIdTipoPago[$liX], $laIdDtlPago[$liX]),";
                                $laPamDtlKardex[$liX]['id_tbl_dtl_kardex'] = $liNuevoSecuencial;
                                $laPamDtlKardex[$liX]['id_tbl_movimiento'] = $liIdMovimiento;
                                $laPamDtlKardex[$liX]['secuencial'] = $liDetalleSecuencial;
                            }
                            //echo "<br/>";
                            //echo $laSql;
                            $laMysql = substr($laSql, 0, -1) . ';';
                            mysql_query($laMysql) or die (mysql_error());
                            $liError = mysql_errno();
                            if(empty($liError)){
                                  //calcula el subtotal
                                      // La clave de tbl_cab_kardex es (id_tbl_cab_kardex, id_tbl_movimiento): sin
                                      // el movimiento se pisaba el subtotal del kardex N de OTROS movimientos.
                                      $ltActualizarSubtotal = "UPDATE tbl_cab_kardex SET subtotal  =  '$liAcumuladorCosto'".
                                      " WHERE id_tbl_cab_kardex ='$liNuevoSecuencial' AND id_tbl_movimiento = '$liIdMovimiento'";
                                      $laResult = mysql_query($ltActualizarSubtotal) or die (mysql_error()) ;
                                      $liError = mysql_errno();
                                      if(empty($liError)){
                                            //update de la tabla movimiento e incrementar el secuencial correspondiente
                                              $ltActualizar = "UPDATE tbl_movimiento SET secuencial  =  '$liNuevoSecuencial'".
                                              "WHERE id_tbl_movimiento ='$liIdMovimiento'";
                                              $laResult = mysql_query($ltActualizar) or die (mysql_error()) ;
                                              $liError = mysql_errno();
                                              if(empty($liError)){
                                                   $lbAfirmacion = true;
                                                    //return ($lbAfirmacion);
                                                    //return($liNuevoSecuencial);
                                                    $laRetornarParam[0] = $liNuevoSecuencial;
                                                    $laRetornarParam[1] = $laPamDtlKardex;
                                                    return ($laRetornarParam);
                                                   
                                              }else{
                                                   return ($lbAfirmacion);
                                              }    
                                      }
                                  
                            }
                    } 
             }//fin de valicacion de consulta a tabla movimiento         
       }else{
        //no se puede hacer nada si no hay datos para el detalle
        return ($lbAfirmacion);
        
       }
    }//fin si no existe errorres
    
        return ($laMsg);
}
//-----------------EJEMPLO-----------------------------------------------
//si se tiene mas de una forma de pago debe ir el array formado con los parametros correspondientes de esta forma
/*$array_plan = array(array('cantidad'=> 1, 
                          'precio' => 299.00, 
                          'id_producto'=> 0, 
                          'id_tipo_pago'=> 0
	               ),
                   array('cantidad'=> 1, 
                          'precio' => 159.00, 
                          'id_producto'=> 0, 
                          'id_tipo_pago'=> 0
	               ))
                   ;*/
//si se tiene solo un registro de pago debe venir el array formado de esta manera
/*$array_plan = array(array('cantidad'=> 1, 
                          'precio' => 99.00, 
                          'id_producto'=> 1, 
                          'id_tipo_pago'=> 1
	               ));*/

//la llamada a la funcion es de la siguiente manera, esta funcion devuelve verdadero en el caso de que se realize con exito
//echo fn_registrarKardex(1,2,$array_plan,0,2,12,1,1);
/*$array_certificados = array(array('cantidad'=> 1, 
                          'precio' => 299.00, 
                          'id_producto'=> 5, 
                          'id_tipo_pago'=> 2
	               ),
                   array('cantidad'=> 1, 
                          'precio' => 159.00, 
                          'id_producto'=> 4, 
                          'id_tipo_pago'=> 2
	               ),
                   array('cantidad'=> 1, 
                          'precio' => 159.00, 
                          'id_producto'=> 4, 
                          'id_tipo_pago'=> 0,
                          'id_tbl_dtl_pago'=> 28
	               ))
                   ;*/
?>