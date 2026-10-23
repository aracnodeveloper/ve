<?php
//include('configuraciones.php');
//error_reporting(E_ALL); ini_set('display_errors', 1);

//include ('mejorOferta.php');

class Certificado  extends Model
{
    function __construct()
    {
        # code...
        //instanaciar model para
         $this->model = new Model();
       // $this->helper = new Helper();
        //conecat a la base de datos
         $this->connect_db();
         $this->app  = new App();

         //Configuracion de App
         if ($this->id_servicio > 0)
             $this->configApp = $this->app->getConfig(array('id_servicio' => $this->id_servicio));
        else
            $this->configApp = $this->app->getConfig(array('id_servicio' => 1));

    }
    function getCertificado($data,$arraySuscripcion){
        try{          

            if(!empty($data)){
                $ofertas_valores = array_column($data['ofertas'], "oferta");
                $ofertas_concatenadas = implode(",", $ofertas_valores);
                //pr($ofertas_concatenadas);                
                
                // Reemision: el certificado YA se emitio y solo se esta volviendo a
                // abrir desde "Mis reservas". Validar la vigencia de la oferta
                // aqui es incorrecto -el certificado documenta una compra
                // pasada-, y hacia que al caducar la oferta el usuario no
                // pudiera volver a ver su propio certificado: la consulta no
                // devolvia filas y saltaba "No existe ofertas".
                $esReemision = !empty($data['reemision']);

                // En reemision se omiten TODOS los filtros que dependen del
                // momento: vigencia, activacion, estado de aprobacion y
                // visibilidad. Una oferta cambia de estado o se deja de mostrar
                // con el tiempo, y eso no debe impedir ver un certificado ya
                // emitido. Se conservan los estructurales (empresa y el id de
                // la oferta), que no cambian.
                if (!$esReemision) {
                    $subWhere[] = "of.id_tbl_activacion = 1";
                    // Las dos lineas forman un BETWEEN: el ORM une con AND.
                    $subWhere[] = "DATE(NOW()) BETWEEN DATE(of.fecha_inicio) ";
                    $subWhere[] = "DATE(of.fecha_fin)";
                    $subWhere[] = "est.id_tbl_estado_modificacion = 3";
                    $subWhere[] = "of.id_tbl_estado_modificacion = 3";
                    $subWhere[] = "tbs.mostrar = 1";
                }
                $subWhere[] = "ofeemp.id_tbl_empresa = 1";
                $subWhere[] = 'infoof.id_tbl_info_indice IN ('.$ofertas_concatenadas.')';


                $reserv = $this->find('all', array(
                    'select' => "est.id_tbl_usuario, concat_ws(', ',lugarest.desc_lugar, provest.desc_lugar, paisest.desc_lugar) as lugar,est.id_tbl_establecimiento,infest.titulo hotel,est.direccion_establecimiento,
                        infest.latitud,infest.longitud,logoest.direccion_foto foto,CURDATE() as fecha_reserva,infoof.titulo habitacion,acom.nombre_acomodacion as acomodacion,
                        (of.precio_oferta / moneda.factor_conversion) as precio, of.adultos as adultosOferta,of.ninos as ninosOferta,of.noches,infoof.id_tbl_info_indice as id_oferta,of.id_tbl_oferta",
                    'from'	=> 'tbl_oferta of JOIN tbl_producto prd ON (prd.id_tbl_producto = of.id_tbl_producto)
                        JOIN tbl_establecimiento est ON (est.id_tbl_establecimiento = prd.id_tbl_establecimiento)
                        JOIN tbl_contrato cont ON cont.id_tbl_establecimiento = est.id_tbl_establecimiento
                        JOIN tbl_tipo_beneficio_suscripcion tbs ON (tbs.id_tbl_tipo_beneficio_suscripcion = of.id_tbl_tipo_beneficio_suscripcion)
                        JOIN tbl_acomodacion acom ON ( acom.id_tbl_acomodacion = of.id_tbl_acomodacion)	
                        JOIN tbl_info_indice infoof ON infoof.id_tbl_info_indice = prd.id_tbl_info_indice	
                        JOIN tbl_info_indice infest ON infest.id_tbl_info_indice = est.id_tbl_info_indice
                        LEFT OUTER JOIN tbl_foto logoest ON logoest.id_tbl_foto = infest.id_tbl_foto
                        JOIN tbl_lugar lugarest ON lugarest.id_tbl_lugar = infest.id_tbl_lugar
                        JOIN tbl_lugar provest ON provest.id_tbl_lugar = lugarest.id_tbl_lugarpadre
                        JOIN tbl_lugar regest ON regest.id_tbl_lugar = provest.id_tbl_lugarpadre
                        JOIN tbl_lugar paisest ON paisest.id_tbl_lugar = regest.id_tbl_lugarpadre
                        JOIN tbl_lugar lugarof ON lugarof.id_tbl_lugar = infoof.id_tbl_lugar
                        JOIN tbl_lugar provof ON provof.id_tbl_lugar = lugarof.id_tbl_lugarpadre
                        JOIN tbl_lugar regof ON regof.id_tbl_lugar = provof.id_tbl_lugarpadre
                        JOIN tbl_lugar paisof ON paisof.id_tbl_lugar = regof.id_tbl_lugarpadre
                        JOIN tbl_moneda moneda ON moneda.id_tbl_lugar = paisof.id_tbl_lugar
                        JOIN tbl_oferta_empresa ofeemp ON ofeemp.id_tbl_oferta = of.id_tbl_oferta',
                    'where'	=> $subWhere,
                    'group' => "of.id_tbl_oferta "
                ));
                //echo $this->lastQuery;
                // echo $this->error;   
                //pr($serv);
                

                if (!$reserv)
                    throw new Exception("No existe ofertas", 120);                
            }
            //pr($reserv);
            $arraySuscripcion['fecha_reserva']=$reserv[0]['fecha_reserva'];;
            $arraySuscripcion['NombreEst']=utf8_encode($reserv[0]['hotel']);
            $arraySuscripcion['DireccionEst']=utf8_encode($reserv[0]['direccion_establecimiento']);
            $arraySuscripcion['LugarEst']=utf8_encode($reserv[0]['lugar']);
            $arraySuscripcion['LatitudEst']=$reserv[0]['latitud'];
            $arraySuscripcion['LongitudEst']=$reserv[0]['longitud'];
            $arraySuscripcion['FotoEst']=$this->configApp['urlimg']['141x82'].$reserv[0]['foto'];    
            
            $hotels = new Hotels(1); 

            $this->serviciosEstablecimiento($reserv[0]['id_tbl_establecimiento'],$arraySuscripcion,$hotels);
                
            $i=0;
            $hab=array();
            $sumaHab=0;
            $tSub=0;
            $tImp=0;
            $total=0;

            $fini=new DateTime($data['fecha']['inicio']);
            $ffin=new DateTime($data['fecha']['fin']);

            $noches=$fini->diff($ffin);
            $noches=$noches->days;

            foreach ($reserv as &$id) {                         
                $this->incluirServicios($id);
                //$this->noIncluirServicios($id);
                $cant=($data['ofertas'][$i]['cant']);
                if($cant!=0){ 
                    $ganga="";
                    $ganga=($this->listaPrecios(array($id['id_tbl_oferta'])));   // verificar si la oferta es ganga
                    if($ganga)
                        $precio=($ganga[$id['id_tbl_oferta']]);
                    else
                        $precio=$id['precio'];

                    $nocheOf=($reserv[$i]['noches']);
                    $imp=$id['iva']+$id['servicios'];                
                    $imp=$imp>0 ? ($imp/100):0; 
                
                    $sumaHab+=$data['ofertas'][$i]['cant']; 

                    $tot= (obtenerPrecioTotal($noches,$nocheOf, ($precio))*$cant);               
                    $sub= (($tot) /(1+$imp));
                    $impuestos=$tot-$sub;

                    $tSub+=$sub;
                    $tImp+=$impuestos;
                    $total+=$tot;
                    
                    $serv =$hotels->getServiceOferta($id['id_tbl_oferta']);
                    $aplicaEn = "";
                    if (is_array($serv) && isset($serv['item'][6]['items']) && is_array($serv['item'][6]['items'])) {
                        $valores = array_values($serv['item'][6]['items']);
                        $aplicaEn = implode(" / ", $valores);
                    }

                    $hab[]=array(                        
                        "Nombre"        =>  utf8_encode($id['habitacion']),
                        "Cantidad"      =>  $cant,                   
                        "Acomodacion"   =>  utf8_encode($id['acomodacion']),                   
                    // "Incluye"       =>  $id['incluye'],     
                        "Subtotal"  => round($sub, 2),
                        "Impuestos" => round($impuestos,2),
                        "Total"     => round($tot,2), 
                        "Adultos"   => $id['adultosOferta'],
                        "Ninos"     => $id['ninosOferta'],
                        "AplicaEn"  =>$aplicaEn                   
                    );
                }
                $i++;
            }
                       
            $contactos = $hotels->getContactos(array($reserv[0]['id_tbl_usuario']));
            if ($contactos) 
                $this->obtenerContacto($reserv[0], $contactos);
            
            $arraySuscripcion['CantidadHab']=$sumaHab;
            $arraySuscripcion['Estado']="Pendiente";
            $arraySuscripcion['CheckIn']=$reserv[0]['check_in'];
            $arraySuscripcion['CheckOut']=$reserv[0]['check_out'];
            $arraySuscripcion['WhatsappEst']=$reserv[0]['whatsApp'];
            $arraySuscripcion['EmailEst']=$reserv[0]['email'];
            $arraySuscripcion['TelefonoEst']=$reserv[0]['telefono'];

            $arraySuscripcion['Subtotal']= round($tSub,2);
            $arraySuscripcion['Impuestos']= round($tImp,2);
            $arraySuscripcion['Total']= round($total,2);            
            $arraySuscripcion['Habitaciones']=$hab;   
            
           // pr(json_encode($arraySuscripcion));

            return $this->buildUriParams($arraySuscripcion);

        } catch (\Throwable $e) {
            $this->error = $e->getMessage() . ' @ ' . basename($e->getFile()) . ':' . $e->getLine();
            $this->codeerror = $e->getCode() ?: 500;
            error_log('[getCertificado] ' . $this->error);
            return false;
        }
    }

    function serviciosEstablecimiento($id_establecimiento,&$arraySuscripcion,$hotels){        
        $serviciosEst = $hotels->getServiceEstablecimiento($id_establecimiento);    
            
        $servicios= $serviciosEst['serviciosEstablecimiento']['1']['items'];
        $sistemaServEst = $serviciosEst['serviciosOferta']['1']['items'];               
        $serviciosHabEst = ($serviciosEst['serviciosEstablecimiento']['2']['items']);
        $incluyeEst = $serviciosEst['serviciosOferta']['2']['items'];
        $noIncluyeEst = $serviciosEst['serviciosOferta']['3']['items'];               
        $restriccionesEst = $serviciosEst['serviciosOferta']['4']['items'];             

        $servicios = array_column($servicios, 'nombre');
        $servicios = implode(' - ', $servicios); 
        $sistemaServEst = array_values($sistemaServEst); 
        $sistemaServEst = implode(' - ', $sistemaServEst);
        $serviciosHabEst = array_column($serviciosHabEst, 'nombre');
        $serviciosHabEst = implode(' - ', $serviciosHabEst);                 
        $incluyeEst = array_values($incluyeEst); 
        $incluyeEst = implode(' - ', $incluyeEst);
        $noIncluyeEst = array_values($noIncluyeEst); 
        $noIncluyeEst = array_values(array_filter($noIncluyeEst, function($element) {
            return strpos($element, "10% Servicios") === false && strpos($element, "15% IVA") === false;
        }));
        $noIncluyeEst = implode(' - ', $noIncluyeEst);
        $restriccionesEst = array_values($restriccionesEst); 
        $restriccionesEst = implode(' - ', $restriccionesEst);

        $arraySuscripcion['serviciosEst']= $servicios;
        $arraySuscripcion['sistemaServEst']= $sistemaServEst;
        $arraySuscripcion['serviciosHabEst']= $serviciosHabEst;
        $arraySuscripcion['incluyeEst']=$incluyeEst;
        $arraySuscripcion['noIncluyeEst']= $noIncluyeEst;
        $arraySuscripcion['restriccionesEst']= $restriccionesEst;
    }

    function buildUriParams($data) {
        // Inicializamos un objeto Uri vacío
        $uri = '';
      
        // Iteramos sobre los datos
        foreach ($data as $key => $value) {
          // Si el valor es un array o un objeto, lo convertimos a JSON
          if (is_array($value) || is_object($value)) {
            $value = json_encode($value);
          }
          // Agregamos el parámetro a la URL
          $uri .= '&' . urlencode($key) . '=' . urlencode($value);
        }
      
        // Removemos el primer "&" ya que es redundante
        $uri = ltrim($uri, '&');
      
        // Retornamos la cadena de consulta
        return $uri;
      }



      function getCertificadoReserva($post)
      {      
          try {       
             
              require_once $GLOBALS['vtClass'] . 'administrador/reservasClass.php';
              $reserva = new ReservasClass();
  
              if (!$reserv = $reserva->listarReserva($post)) 
                  throw new Exception($reserva->error, $reserva->codeerror);
                  $datos=[];
                  $hotels = new Hotels(1);  
  
                  //pr($reserv);
                  
                  foreach ($reserv['ofertas'] as $id) {
                      //pr($id);
                      $dato=[];
                      $fini=new DateTime($id['fecha_inicio']);
                      $ffin=new DateTime($id['fecha_fin']);        
                      $noches=$fini->diff($ffin);
                      $noches=$noches->days;
  
                      $dato['id_tbl_reserva']=            $reserv['reserva']['id_tbl_reserva'];
                      $dato['id_tbl_establecimiento']=    $id['id_tbl_establecimiento'];
                      $dato['hotel']=                     $id['nombreEstablecimiento'];           
                      $dato['foto']=                      $this->configApp['urlimg']['141x82'].$id['foto'];       
                      $dato['direccion_establecimiento']= $id['direccion_establecimiento'];
                      $dato['lugar']=                     $id['ubicacion'];
                      $dato['latitud']=                   $id['latitud'];
                      $dato['longitud']=                   $id['longitud'];
                      $dato['fecha_reserva']=             $reserv['reserva']['fecha_creacion'];
                      $dato['adultos']=                   $id['adultos'];
                      $dato['ninos']=                     $id['ninos'];
                      $dato['fecha_inicio']=              $id['fecha_inicio'];
                      $dato['fecha_fin']=                 $id['fecha_fin'];
                      $dato['cantidad']=                  $id['cantidad_ofertas'];
                      $dato['habitacion']=                $id['tituloOferta'];
                      $dato['acomodacion']=               $id['acomodacion'];
                      $dato['usu_o_email']=               $reserv['usuario'][0]['usuario'];
                      $dato['ci_ruc']=                    $reserv['usuario'][0]['ci_ruc'];
                      $dato['nombre_suscriptor']=         $reserv['usuario'][0]['nombres'];
  
                      $dato['id_tbl_estado_reserva']=     $reserv['reserva']['id_tbl_estado_reserva'];
  
                      if($dato['id_tbl_estado_reserva']==1)
                          $dato['nombre_estado_reserva']=     "Pendiente"; 
  
                      if($dato['id_tbl_estado_reserva']==2)
                          $dato['nombre_estado_reserva']=     "Confirmada"; 
  
                      if($dato['id_tbl_estado_reserva']==3)
                          $dato['nombre_estado_reserva']=     "Cancelada"; 
  
                      if($dato['id_tbl_estado_reserva']==4)
                          $dato['nombre_estado_reserva']=     "Cotización"; 
  
                                                              
                      $dato['adultosOferta']=             $id['adultos'];
                      $dato['ninosOferta']=               $id['ninos'];
                      $dato['id_tbl_reserva']=$reserv['reserva']['id_tbl_reserva'];
                      $dato['id_usuario']=$reserv['reserva']['id_tbl_usuario_cliente'];
  
                      if (!empty($id['precio_feriado']) && isset($id['precio_feriado']) && $id['precio_feriado'] > 0)
                          $dato['precio']=                 ($id['precio_feriado']*$noches);
                      else
                          $dato['precio']=                 ($id['precioOferta']*$noches);     
  
                      $dato['adultos_extras']=            $id['adultos_extras'];
                      $dato['ninos_extras']=              $id['ninos_extras'];
                      $dato['precio_nino_adicional']=     $id['precio_nino_adicional'];
                      $dato['precio_adulto_adicional']=   $id['precio_adulto_adicional'];
                      
                      $this->serviciosEstablecimiento($id['id_tbl_establecimiento'],$id,$hotels);
                      $dato['serviciosEst']=$id['serviciosEst'];
                      $dato['sistemaServEst']=$id['sistemaServEst'];
                      $dato['serviciosHabEst']=$id['serviciosHabEst'];
                      $dato['incluyeEst']=$id['incluyeEst'];
                      $dato['noIncluyeEst']=$id['noIncluyeEst'];
                      $dato['restriccionesEst']=$id['restriccionesEst'];
  
                      //$serv =$hotels->getServiceOferta($id['id_tbl_oferta']);
                      //pr($serv);
  
                      //pr($id);
                      $dato['aplicaEn']=$id['aplicaEn'];
  
                      $this->incluirServicios($id);  
                      $dato['iva']=$id['iva'];
                      $dato['servicios']=$id['servicios'];
                      $dato['check_out']=$id['check_out'];
                      $dato['check_in']=$id['check_in'];
  
  
                      $this->obtenerContacto($id, $reserv['contactosEstablecimiento']);
                      
                      /*$tipoMap = [
                          'Telefono' => 'telefono',
                          'Celular Trabajo' => 'telefono',
                          'Teléfono Reservas' => 'telefono',
                          'Email' => 'email',
                          'WhatsApp' => 'whatsApp'
                      ];
  
                      foreach ($reserv['contactosEstablecimiento'] as $elemento) {
                          if (isset($tipoMap[$elemento['tipo']])) {
                              $campo = $tipoMap[$elemento['tipo']];
                              $dato[$campo] = $elemento['contacto'];
                          }
                      }    */            
                
                      $dato['telefono'] = $id['telefono'];
                      $dato['email'] = $id['email'];
                      $dato['whatsApp'] = $id['whatsApp'];       
                      
                     
                  
                      $datos[]=$dato;
                  }
                  //pr($reserv);        
   
              return $datos;
          } catch (Exception $e) {
              $this->error = $e->getMessage();
              $this->codeerror = $e->getCode();
              return false;
          }
      }

    

    function incluirServicios(&$id)
    {
        $res = $this->find('all', array(
            'select' => "so.id_tbl_servicio_smart,se.nombre_servicio_smart,detalle ",
            'from'   => 'tbl_dtl_servicio_establecimiento so JOIN tbl_servicio_smart se ON (so.id_tbl_servicio_smart = se.id_tbl_servicio_smart)',
            'where'  => array('so.id_tbl_servicio_smart in(141,142,105,106) and id_tbl_establecimiento ='.$id['id_tbl_establecimiento']),
        ));
        //pr($res);

        //$inc = "";
        $resultado = "";
        if ($res) {
            foreach ($res as $e) {
                //$inc = $inc . utf8_encode($e['nombre_servicio_smart']);
               // if (!empty($e['detalle']))
               //     $inc = $inc . " " . utf8_encode($e['detalle']) . " - ";
               // else
                //    $inc = $inc . " - ";
                if ($e['id_tbl_servicio_smart'] == 105)
                    $id['check_in'] = ($e['detalle']);
                if ($e['id_tbl_servicio_smart'] == 106)
                    $id['check_out'] = ($e['detalle']);
                if ($e['id_tbl_servicio_smart'] == 141)
                    $id['iva'] = strstr($e['nombre_servicio_smart'], '%', true); //tomar el valor despues del %
                if ($e['id_tbl_servicio_smart'] == 142)
                    $id['servicios'] = strstr($e['nombre_servicio_smart'], '%', true); //tomar el valor despues del %
            }
           // $resultado = rtrim($inc, ' - ');
            if (!$id['check_in'])
                $id['check_in'] = "14h00";
            if (!$id['check_out'])
                $id['check_out'] = "12h00";
            if (!$id['iva'])
                $id['iva'] = "0";
            if (!$id['servicios'])
                $id['servicios'] = "0";
        }else {  
            $id['check_in'] = "14h00";
            $id['check_out'] = "12h00";      
            $id['iva'] = "0";
            $id['servicios'] = "0";
        }

        //pr($resultado);     
    }

    /*
    function noIncluirServicios(&$id){
        $noIncluye = $this->find('all', array(
            'select' => "so.id_tbl_servicio_smart,se.nombre_servicio_smart",
            'from'   => ' tbl_dtl_servicio_establecimiento so JOIN tbl_servicio_smart se ON ( so.id_tbl_servicio_smart = se.id_tbl_servicio_smart ) ',
            'where'  => array('so.id_tbl_servicio_smart in(141,142) and id_tbl_establecimiento =' . $id['id_tbl_establecimiento']),
        ));

        if ($noIncluye) {
            foreach ($noIncluye as $elemento) {
                if ($elemento['id_tbl_servicio_smart'] == 141)
                    $id['iva'] = strstr($elemento['nombre_servicio_smart'], '%', true); //tomar el valor despues del %
                if ($elemento['id_tbl_servicio_smart'] == 142)
                    $id['servicios'] = strstr($elemento['nombre_servicio_smart'], '%', true); //tomar el valor despues del %
            }
            if (!$id['iva'])
                $id['iva'] = "0";
            if (!$id['servicios'])
                $id['servicios'] = "0";
        } else {
            $id['iva'] = "0";
            $id['servicios'] = "0";
        }
    }
    */

    function obtenerContacto(&$id, $contactos){       
        $mapeo = [
            'Telefono' => 'telefono',
            'Celular Trabajo' => 'telefono',
            'Teléfono Reservas' => 'telefono',
            'Email' => 'email',
            'WhatsApp' => 'whatsApp'
        ];
    
        foreach ($contactos as $elemento) {            // Determinar si usar 'nombre' y 'valor' o 'tipo' y 'contacto'
            $claveTipo = isset($elemento['nombre']) ? 'nombre' : 'tipo';
            $claveValor = isset($elemento['valor']) ? 'valor' : 'contacto';
    
            if (isset($mapeo[$elemento[$claveTipo]])) {
                $campo = $mapeo[$elemento[$claveTipo]];
                $id[$campo] = $elemento[$claveValor];
            }
        }
        // Asignar valores predeterminados si no se encontraron
        $id['telefono'] = $id['telefono'] ?? "";
        $id['email'] = $id['email'] ?? "";
        $id['whatsApp'] = $id['whatsApp'] ?? "";   
    }

    public function listaPrecios(array $idOfertas, string $rangofechas = null)
	{
		try {
			$where[] = 'activo = 1';
			if ($rangofechas == null) {
				$hoyfecha = date('Y-m-d');
				$nuevaFecha = $this->app->addFecha($hoyfecha, 1, 3, $format = 'Y-m-d');
				$rangofechas = $hoyfecha . ' - ' . $nuevaFecha;
			}
			if (empty($idOfertas) or count($idOfertas) == 0)
				throw new Exception("Por favor un id de oferta", 1);

			if (is_array($idOfertas))
				$where[] = 'id_tbl_oferta in (' . implode(',', $idOfertas) . ')';
			if (is_int($idOfertas))
				$where[] = 'id_tbl_oferta = ' . $idOfertas;
			if ($rangofechas != null) {
				$fechas = explode(' - ', $rangofechas);
				$where[] = '"' . $fechas[0] . '" between fecha_inicio and fecha_fin';
			}

			$preciosofertas = $this->find('all', array(
				'select' => 'precio,id_tbl_oferta',
				'from'    => 'tbl_precios_oferta',
				'where'    => $where,
			));

            //pr($this->lastQuery);

			if ($preciosofertas) {
				foreach ($preciosofertas as $key => $preciooferta) {
					# code...
					$arrayPreciosNuevos[$preciooferta['id_tbl_oferta']] = $preciooferta['precio'];
				}
			}


			return $arrayPreciosNuevos;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();

			return false;
		}
	}
}