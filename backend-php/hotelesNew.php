<?php

/**
 *  @author  Geovany Orellana <geovanny6@gmail.com>	
 *  @version 1.0 alfa
 *  @abstract clases Persona
 */
//pr("holaaa");
include('mejorOferta.php');
class Hotels  extends Model
{
	private $user_name;
	public $detalleServicios = null;
	public $tipoServicios = null;
	public  $errores;
	public  $codeerror   = '';
	public  $vendedor;
	public  $totalOfertas;
	public  $ofertas = array();
	public  $establecimientos = array();
	public  $filtro = array();
	public $serviciosFiltro = array();
	public $serviciosHabEstFiltro = array();
	public $incluyeEstFiltro = array();
	public $adicionalesEstFiltro = array();
	public  $galeriaEstablecimiento = array();
	public  $opcionesReserva = [];
	public 	$id_tbl_usuario = 0;
	private $pass;
	public  $model;
	private $helper;
	public  $configApp = false;
	public  $id_servicio;
	private $configSuscriptor;
	private $selectOfertas;
	private $fromOfertas;
	public $rangofechas = null;
	public $txtGanga = 'Precio Especial de último momento, unidades limitadas. Aprovecha ahora!!!';
	public  $nPaginas    = 0;
	public  $paginaActual = 1;
	public  $nPorPagina  = 0;
	// public $opcionesReserva

	function __construct($id_servicio)
	{
		# code...
		$this->id_servicio = $id_servicio;
		$this->selectOfertas = '
						    infoof.id_tbl_info_indice id,
						    infest.id_tbl_info_indice id_info_establecimiento,
		    				ofeemp.id_tbl_empresa,
		    				est.id_tbl_establecimiento,
		    				est.id_tbl_usuario,
						    infest.titulo nombreEstablecimiento,
							infest.resumen descripcionEst,
						    of.id_tbl_oferta,
						    ofeemp.id_tbl_empresa,
						    serest.titulo_servicio tipoEstablecimiento,
						    infest.latitud,
						    infest.longitud,
						    est.catalogacion,
						    infest.titulo nombreEstablecimiento,
						    logoest.direccion_foto logoEstablecimiento,
						    fotoest.direccion_foto fotoEstablecimientoPrin,
						    est.direccion_establecimiento,
						    lugarest.desc_lugar ciudadEstablecimiento,
						    provest.desc_lugar provinciaEstablecimiento,
						    regest.desc_lugar regionEstablecimiento,
						    paisest.desc_lugar paisEstablecimiento,
						    paisest.id_tbl_lugar idPaisEstablecimiento,
						    contof.contenido_informacion detalleOferta,
						    lugarof.desc_lugar ciudadOferta,
						    provof.desc_lugar provinciaOferta,
						    regof.desc_lugar regionOferta,
						    paisof.desc_lugar paisOferta,
						    paisof.id_tbl_lugar idPaisOferta,
						    infoof.titulo tituloOferta,
						    infoof.id_tbl_lugar,
						    fotoof.direccion_foto fotoOfertaPrin,
						    tbs.nombre_tipo_beneficio_suscripcion nombreBeneficio,
						    tbs.estilo_tipo_beneficio_suscripcion estiloBeneficio,
						    tbs.id_tbl_tipo_beneficio_suscripcion idBeneficio,
						    tbs.color colorBeneficio,
						    cla.nombre_clasificacion_oferta,
						    acom.nombre_acomodacion,
						    of.dias,
						    of.noches,
						    of.adultos,
						    of.ninos,
						    (of.costo_rack / moneda.factor_conversion) 		costoRack,
						    (of.precio_oferta / moneda.factor_conversion) 	precioOferta,
						    of.cantidad,
						    of.habitaciones,
						    of.disponibles,
						    of.fecha_hora fechaHoraAgotado,
						    of.fecha_hora_fin fechaHoraAgotadoFin,
						    cont.edad_nino';

		$this->fromOfertas = ' 
							tbl_oferta of
						        JOIN
						    tbl_producto prd ON (prd.id_tbl_producto = of.id_tbl_producto)
						        JOIN
						    tbl_establecimiento est ON (est.id_tbl_establecimiento = prd.id_tbl_establecimiento)
						        JOIN
						    tbl_contrato cont ON cont.id_tbl_establecimiento = est.id_tbl_establecimiento
						        JOIN
						    tbl_tipo_beneficio_suscripcion tbs ON (tbs.id_tbl_tipo_beneficio_suscripcion = of.id_tbl_tipo_beneficio_suscripcion)
						        JOIN
						    tbl_acomodacion acom ON (acom.id_tbl_acomodacion = of.id_tbl_acomodacion)
						        JOIN
						    tbl_clasificacion_oferta cla ON (cla.id_tbl_clasificacion_oferta = of.id_tbl_clasificacion_oferta)
						        JOIN
						    tbl_info_indice infoof ON infoof.id_tbl_info_indice = prd.id_tbl_info_indice
						        JOIN
						    tbl_contenido_informacion contof ON contof.id_tbl_info_indice = infoof.id_tbl_info_indice
						        JOIN
						    tbl_info_indice infest ON infest.id_tbl_info_indice = est.id_tbl_info_indice
						        LEFT OUTER JOIN
						    tbl_foto logoest ON logoest.id_tbl_foto = est.id_tbl_foto
						        LEFT OUTER JOIN
						    tbl_foto fotoest ON fotoest.id_tbl_foto = infest.id_tbl_foto
						        LEFT OUTER JOIN
						    tbl_foto fotoof ON fotoof.id_tbl_foto = infoof.id_tbl_foto
						        JOIN
						    tbl_servicio serest ON serest.id_tbl_servicio = infest.id_tbl_servicio
						        JOIN
						    tbl_lugar lugarest ON lugarest.id_tbl_lugar = infest.id_tbl_lugar
						        JOIN
						    tbl_lugar provest ON provest.id_tbl_lugar = lugarest.id_tbl_lugarpadre
						        JOIN
						    tbl_lugar regest ON regest.id_tbl_lugar = provest.id_tbl_lugarpadre
						        JOIN
						    tbl_lugar paisest ON paisest.id_tbl_lugar = regest.id_tbl_lugarpadre
						        JOIN
						    tbl_lugar lugarof ON lugarof.id_tbl_lugar = infoof.id_tbl_lugar
						        JOIN
						    tbl_lugar provof ON provof.id_tbl_lugar = lugarof.id_tbl_lugarpadre
						        JOIN
						    tbl_lugar regof ON regof.id_tbl_lugar = provof.id_tbl_lugarpadre
						        JOIN
						    tbl_lugar paisof ON paisof.id_tbl_lugar = regof.id_tbl_lugarpadre
						        JOIN
						    tbl_moneda moneda ON moneda.id_tbl_lugar = paisof.id_tbl_lugar
						        JOIN
						    tbl_oferta_empresa ofeemp ON (ofeemp.id_tbl_oferta = of.id_tbl_oferta)';

		$this->opcionesOrden =  array(
			"1_2" => array("name" => "Recientes", "text" => "Nuevos primero"),
			"1_1" => array("name" => "Recientes", "text" => "Antiguos primero"),
			"7_1" => array("name" => "Ahorro", "text" => "Menor a mayor"),
			"7_2" => array("name" => "Ahorro", "text" => "Mayor a menor"),
			"2_1" => array("name" => "Precio Final", "text" => "Menor a mayor"),
			"2_2" => array("name" => "Precio Final", "text" => "Mayor a menor"),
			"3_1" => array("name" => "Establecimiento", "text" => "A - Z"),
			"3_2" => array("name" => "Establecimiento", "text" => "Z - A"),
			"5_1" => array("name" => "Ciudad", "text" => "A - Z"),
			"5_2" => array("name" => "Ciudad", "text" => "Z - A"),
			"6_1" => array("name" => "Pais", "text" => "A - Z"),
			"6_2" => array("name" => "Pais", "text" => "Z - A")
		);

		//instanciar model
		//$this->model = new Model();

		//conecat a la base de datos
		// $this->connect_db();

		//para verificar informacion de aplicacion
		$this->app  = new App();

		//Configuracion de App
		if ($this->id_servicio > 0)
			$this->configApp = $this->app->getConfig(array('id_servicio' => $this->id_servicio));


		//Configuracion de suscriptor
		$this->configSuscriptor = array(
			'id_beneficios'		=> array(1, 5, 7, 12, 2, 10, 9, 8),
			'permisos'			=> array(1, 2),
			'idioma'			=> 'es',
			'login'				=> true,
			'id_tbl_usuario'	=> 239

		);

		//token
		// $this->tokens = array(
		// 	'metodolog'		=>	've', //'go','ve'
		// 	'origen'		=>	'android', //'iphone' ,'www.cvp.com', etc
		// );
	}



	function genOfertaPdf($data)
	{

		try {
			$txtFecha = '';
			if (isset($data['fecha']))
				$txtFecha = 'fecha_inicio=' . $data['fecha']['inicio'] . '&fecha_fin=' . $data['fecha']['fin'];
			switch ($this->id_servicio) {
				case '1': //cv
					# code...
					$url = SITE_VE . "certificado/?id=" . $data['id'] . "&tipo=" . $data['tipo'] . "&id_usuario=" . $data['id_tbl_usuario'] . "&origen=" . $data['origen'] . "&" . $txtFecha;
					break;
				case '34': //cv
					# code...
					$url = "https://www.fullvacations.com.ec/certificado/?id=" . $data['id'] . "&tipo=" . $data['tipo'] . "&id_usuario=" . $data['id_tbl_usuario'] . "&origen=" . $data['origen'] . "&" . $txtFecha;
					break;

				default:
					# code...
					break;
			}
			$this->urlOfertaPdf = $url;
			return true;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	function viewReserva($id_reservas)
	{
		try {
		} catch (Exception $e) {
		}
	}

	function getReservas($data)
	{
		try {

			//pr($data);


			if ($data['id_tbl_usuario'] > 0)
				$where[] = 'ck.id_tbl_usuario_cliente =' . $data['id_tbl_usuario'];

			if ($data['id_movimiento'] > 0)
				$where[] = 'ck.id_tbl_movimiento =' . $data['id_movimiento'];

			// pr($data);
			$reservas = $this->find('all', array(
				'select' => ' indest.titulo establecimiento,
							indof.titulo oferta,
							prod.id_tbl_info_indice, 
							dk.id_tbl_producto, 
							dk.precio, dk.costo, 
							dk.cantidad,
							ck.subtotal,
							er.nombre_estado_reserva as estado_reserva,
							r.id_tbl_reserva id, 
							r.fecha_inicio, 
							r.fecha_fin,
							ck.fecha, lug.desc_lugar as ciudad,direccion_foto as foto',
				'from'	=> 'tbl_reserva r 
							join tbl_suscripcion s using(id_tbl_suscripcion) 
							join tbl_cab_kardex ck on ck.id_tbl_movimiento= r.id_tbl_movimiento and ck.id_tbl_cab_kardex = r.id_tbl_cab_kardex
							join tbl_dtl_kardex dk on dk.id_tbl_movimiento=ck.id_tbl_movimiento and dk.id_tbl_dtl_kardex =ck.id_tbl_cab_kardex
							join tbl_estado_reserva er using(id_tbl_estado_reserva)
							join tbl_producto prod using(id_tbl_producto)
							join tbl_info_indice indof on prod.id_tbl_info_indice = indof.id_tbl_info_indice
							join tbl_info_indice indest on indest.id_tbl_info_indice = indof.id_tbl_info_indice1
							join tbl_lugar lug ON lug.id_tbl_lugar = indest.id_tbl_lugar 
							join tbl_foto fo on fo.id_tbl_foto=indest.id_tbl_foto',
				'where'	=> $where,
				'order'	=> 'ck.fecha desc',
			));
			//pr($reservas);
			// pr($this->error);
			//pr($this->lastQuery);
			if (!$reservas)
				throw new Exception("Error Processing Request", 1);

			foreach ($reservas as $key => $reserva) {
				# code...
				$reserva['establecimiento'] = utf8_encode($reserva['establecimiento']);
				$reserva['oferta'] = utf8_encode($reserva['oferta']);
				$return[$reserva['id']] = $reserva;

				//comentado temporalmente
				// $return[$reserva['id']]['ofertas'][$reserva['id_tbl_info_indice']]['precio']= $reserva['precio'];
				// $return[$reserva['id']]['ofertas'][$reserva['id_tbl_info_indice']]['costo']= $reserva['costo'];
				// $return[$reserva['id']]['ofertas'][$reserva['id_tbl_info_indice']]['cantidad']= $reserva['cantidad'];
				// $productos[$reserva['id']][$reserva['id_tbl_producto']]['precio'] = $reserva['precio'];
				// $productos[$reserva['id']][$reserva['id_tbl_producto']]['costo'] = $reserva['costo'];
				// $productos[$reserva['id']][$reserva['id_tbl_producto']]['cantidad'] = $reserva['cantidad'];
				// $idProductos[$reserva['id_tbl_producto']] = $reserva['id_tbl_producto'];
				// $idOfertasII[$reserva['id']] 	= $reserva['id_tbl_info_indice'];
				// unset($return[$reserva['id']]['id']);//quitar id de reservas
				unset($return[$reserva['id']]['precio']);
				unset($return[$reserva['id']]['costo']);
				//unset($return[$reserva['id']]['cantidad']);
				unset($return[$reserva['id']]['id_tbl_producto']);
				unset($return[$reserva['id']]['id_tbl_info_indice']);
			}

			//pr($return);
			foreach ($return as $key => $ret) {
				$retornar[] = $ret;
			}

			//pr($retornar);
			//listar reservas agrupado por un margen de 1 minuto. 
			$datosAgrupados = [];

			foreach ($retornar as $dato) {
				$fecha = $dato['fecha'];

				// Obtener la fecha límite superior sumando 1 minuto a la fecha actual
				$limite_superior = date('Y-m-d H:i:s', strtotime($fecha) + 60);

				// Verificar si existe un grupo dentro del margen de 1 minuto
				$grupo_existente = false;
				foreach ($datosAgrupados as $grupo_fecha => $datos_grupo) {
					if ($grupo_fecha >= $fecha && $grupo_fecha <= $limite_superior) {
						$datosAgrupados[$grupo_fecha][] = $dato;
						$grupo_existente = true;
						break;
					}
				}

				// Si no hay grupo dentro del margen, crear uno nuevo
				if (!$grupo_existente) {
					$datosAgrupados[$fecha] = [$dato];
				}
			}

			$this->reservas = $datosAgrupados;


			return true;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	/**
	 * [addReserva description]
	 * @param [type] $data [description]
	 */
	function addReserva($data)
	{
		try {

			/**
			 * verificar informacion inicial
			 */
			// pr($data);
			// 
			if (!$this->configApp)
				$this->configApp = $this->app->getConfig(array('id_servicio' => $data['id_servicio']));

			// pr(json_decode( json_encode($configApp),true));

			//id oferta
			$adultos 			= $data['adultos'];
			$ninos 				= $data['ninos'];
			$fecha_inicio 		= $data['fecha_inicio'];
			$cantidad_ofertas 	= $data['cantidad_ofertas'];
			$edad_ninos 		= $data['edad_ninos'];
			$data['estado_reserva'] = 1;
			//fechas
			//niños
			//adultos
			//oferta
			//cantidad de ofertas
			//mas opciones
			if ($data['id_oferta']) {
				//obtener id_producto
				$whereProducto[] = 'id_tbl_info_indice = ' . $data['id_oferta'];
				$producto = $this->find('first', array(
					'select' => 'id_tbl_producto, id_tbl_establecimiento',
					'from'	=> 'tbl_producto',
					'where'	=> $whereProducto,
				));
				// echo $this->lastQuery;
				// echo $this->error;
				if (!$producto)
					throw new Exception("No existe oferta", 1);

				// Bloquear la reserva si el día de check-in cae dentro de alguno de los
				// rangos de agotamiento de la oferta (tbl_oferta_agotada).
				$ofertaAgot = $this->find('first', array(
					'select' => 'of.id_tbl_oferta',
					'from'	=> 'tbl_oferta of JOIN tbl_producto prd ON prd.id_tbl_producto = of.id_tbl_producto',
					'where'	=> 'prd.id_tbl_info_indice = ' . intval($data['id_oferta']),
				));
				if ($ofertaAgot) {
					$rangosAgot = $this->listarAgotamientosOferta($ofertaAgot['id_tbl_oferta']);
					$bloqueo = $this->rangoAgotamientoQueBloquea($rangosAgot, $fecha_inicio);
					if ($bloqueo !== null) {
						throw new Exception('Esta oferta está agotada para esa fecha'
							. (!empty($bloqueo['fin'])
								? ', disponible nuevamente después del ' . date('d/m/Y', strtotime($bloqueo['fin']))
								: '') . '.', 5710);
					}
				}
			}



			if (count($data['id_oferta']) > 0 and is_array($data['id_oferta']))
				$beneficio       =    $data['beneficios'];

			//obtener id de suscripcion
			$suscripcion = $this->find('first', array(
				'select' => 'id_tbl_suscripcion id',
				'from'	=> 'tbl_suscripcion',
				'where'	=> 'id_tbl_usuario=' . $data['id_tbl_usuario'],
			));
			if (!$suscripcion)
				$suscripcion['id'] = '84373';				//suscripcion de usuario de prueba web
			//	throw new Exception("no hay suscripcion", 1);



			$arrayCamposReserva = array(
				'fecha'                     => date('Y-m-d H:i:s'),
				'adultos'                   => $data['adultos'],
				'ninos'                     => $data['ninos'],
				'fecha_inicio'              => $data['fecha_inicio'],
				'fecha_fin'                 => $data['fecha_fin'],
				'cantidad_paquetes'         => 1,
				'comentarios'               => "$comentarios ",
				'comentarios_interno'       => "$comentarios_interno ",
				'costo_adicional'           => 0,
				'id_tbl_estado_reserva'     => $data['estado_reserva'],
				'id_tbl_suscripcion'        => $suscripcion['id'],
				'id_tbl_directorio'         => $tarjeta_adicional, //id de id_tbl_directorio de tarjeta adicional
				'id_tbl_activacion'         => 1,
				't_comision'                => $plan_comision,
				'i_servicios'               => $plan_factor,
				'id_tbl_call_cliente'       => $id_tbl_call_cliente,
				'fee'                       => $data[facturar],
				'fee_comentario'            => $comentario_fee,
				'id_tbl_reserva_ref'        => $id_reserva_referencia,
				'fee_valor'                 => $valor_fee,
				'fee_recalcular'            => $sumar_noches_fee,
				'num_confirmacion'          => $num_confirmacion
			);

			$this->table = 'tbl_reserva';
			$this->fields = $arrayCamposReserva;


			if (!$this->id_reserva =  $this->save()) {
				$errores['db'] = array('msj' => 'No se pudo Agregar reserva. Intente Nuevamente .' . $this->error);
				throw new Exception('No se pudo Agregar reserva. Intente Nuevamente .' . $this->error, 45464);
			}

			$rollback[$this->table] = $this->id_reserva;


			/**
			 * registrar Kardex
			 */

			// // $camposCabKardex['id_tbl_cab_kardex']		= $data[''];
			// $camposCabKardex['id_tbl_movimiento']		= 7;
			// $camposCabKardex['id_tbl_usuario_cliente']		= $data['id_usuario'];
			// $camposCabKardex['id_tbl_usuario_vendedor']		= $data['id_usuario'];
			// $camposCabKardex['fecha']		= date('Y-m-d H:i:s');
			// $camposCabKardex['subtotal']		= $data[''];
			// $camposCabKardex['aplica_canje']		= $data[''];
			// $camposCabKardex['id_tbl_establecimiento']		= $producto['id_establecimiento'];
			// $camposCabKardex['id_documento']		= $this->id_reserva;
			// $camposCabKardex['id_tbl_activacion']		= 1;
			// $camposCabKardex['documento_afecta']		= $data[''];
			// $camposCabKardex['id_tbl_usuario_creacion']		= $data['id_usuario'];
			// $camposCabKardex['id_tbl_movimientopadre']		= $data[''];
			// $camposCabKardex['observacion']		= $data[''];
			// $camposCabKardex['id_tbl_tipo_canal']		= $data[''];
			// $camposCabKardex['id_tbl_servicio_web']		= $data['id_servicio'];
			// $camposCabKardex['id_tbl_empresa']		= $data[''];


			// // $camposDtl['id_tbl_dtl_kardex'] 	= $data[''];
			// $camposDtl['id_tbl_movimiento'] 	= 7;
			// $camposDtl['secuencial'] 	= $data[''];
			// $camposDtl['cantidad'] 	= $data['cantidad_ofertas'];
			// $camposDtl['precio'] 	= $data[''];
			// $camposDtl['costo'] 	= $data[''];
			// $camposDtl['id_tbl_producto'] 	= $producto['id'];
			// $camposDtl['id_tbl_tipo_pago'] 	= $data[''];
			// $camposDtl['id_tbl_dtl_pago'] 	= $data[''];

			// registrar kardex 
			$dataOferta = array(
				'id_oferta'		=> array($data['id_oferta']),
				'id_tbl_usuario' => $data['id_tbl_usuario'],
				'id_servicio'	=> $data['id_servicio'],
			);
			if (!$infoOferta = $this->verOfertas($dataOferta))
				throw new Exception($this->error, $this->codeerror);
			//pr($this->ofertas);
			// pr($this->ofertas[0]);
			//obtener id de establecimeinto
			$establecimiento = $this->find('first', array(
				'select' => 'id_tbl_establecimiento id, id_tbl_producto id_producto',
				'from'	=> 'tbl_producto',
				'where'	=> 'id_tbl_info_indice=' . $data['id_oferta'],

			));
			/**
			 * registrar reservas
			 */

			$laPago[] = array(
				'cantidad' => $data['cantidad_ofertas'],
				'precio' => $this->ofertas[0]['final'],
				'id_producto' => $establecimiento['id_producto'],
				'id_tipo_pago' => $idPago[$tt]
			);

			$datoKardex['piIdMovimiento']		= 7;
			$datoKardex['piUsuarioCliente']		= $data['id_tbl_usuario'];
			$datoKardex['paDetalleKardex']		= $laPago;
			$datoKardex['piAplicaCanje']		= 2;
			$datoKardex['piIdEstablecimiento']	= $establecimiento['id'];
			$datoKardex['piIdDocumento']		= $this->id_reserva;
			$datoKardex['piIdActivacion']		= 1;
			$datoKardex['piIdDocumentoAfecta']	= 0;

			// pr($laPago);



			// $resKardexCabecera = $this->app->registrarKardex($idTipoMovimiento, $liIdUsuarioSuscriptor, $laPagos, $liPagoCanje, $idEstablecimiento,$id_tbl_reserva,1,0);

			$resKardexCabecera = $this->app->registrarKardex($datoKardex);
			// pr($resKardexCabecera);
			if ($resKardexCabecera[0] < 1)
				throw new Exception("Error, por favor comunicar al administrador.", 1);
			$camposReserva = array(
				'id_tbl_cab_kardex'         => $resKardexCabecera[0],
				'id_tbl_movimiento'         => $datoKardex['piIdMovimiento'],
				'cantidad_paquetes'         => $data['cantidad_ofertas'],
			);
			// pr($camposReserva);
			//realizar reserva
			$this->table = 'tbl_reserva';
			$this->fields = $camposReserva;
			$this->where = " id_tbl_reserva = " . $this->id_reserva;
			if (!$this->update())
				throw new Exception('No se pudo actualizar reserva. Intente Nuevamente .' . $this->error);
			// echo $this->error;     

			//realizar kardex empresa
			$this->table = 'tbl_cab_kardex';
			$this->fields = array(
				'id_tbl_empresa'         => 1
			);
			$this->where = " id_tbl_movimiento = " . $datoKardex['piIdMovimiento'] . " and id_tbl_cab_kardex = " . $resKardexCabecera[0];
			if (!$this->update())
				throw new Exception('No se pudo actualizar kardex. Intente Nuevamente .' . $this->error);

			/**
			 * enviar email de reserva
			 */

			//

			return true;
		} catch (Exception $e) {


			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}



	/**
	 * [getEstablecientoDestino description]
	 * @param  [type] $data [description]
	 * @return [type]       [description]
	 */
	function getEstablecientoDestino($data)
	{
		try {
			if (empty($data['termino'])) {
				throw new Exception("Error Processing Request", 1);
			}

			$ltDatoBuscar = $this->sanearString($data['termino']);
			$tempDatoBuscar = explode(' ', $ltDatoBuscar);
			$txtWhereTermino = [];

			foreach ($tempDatoBuscar as $dat) {
				if (!empty($dat)) {
					$txtWhereTermino[] = "|cons| like ('%$dat%')";
				}
			}

			$txtWhereTermino[] = 'id_tbl_empresa in (' . implode(',', $this->configApp['id_empresa']) . ')';
			$txtWhereTermino = implode(' and ', $txtWhereTermino);

			$mergedArray = [];

			if (empty($data['tipo']) || $data['tipo'] != 'establecimiento') {
				$destinos = $this->find("all", array(
					"select" => "lcase(Ciudad) titulo, concat('en ', Provincia,', ',Region,', ',Paises) descripcion, idciudad id, 'destino' tipo ",
					"from"   => "vista_ofertas_activas voa",
					"where"  => str_replace('|cons|', "concat_ws(' ',Paises,Region, Provincia,Ciudad)", $txtWhereTermino),
					"group"  => "Ciudad"
				));

				$mergedArray = array_merge($mergedArray, $destinos);
			}

			$establecimientos = $this->find("all", array(
				"select" => "lcase(Establecimiento) titulo, (concat('en ',Ciudad ,', ', Provincia,', ',Region,', ',Paises)) descripcion, id_tbl_establecimiento id, 'establecimiento' tipo ",
				"from"   => "vista_ofertas_activas voa",
				"where"  => str_replace('|cons|', "concat_ws(' ',Paises,Region, Provincia,Ciudad,Establecimiento) ", $txtWhereTermino),
				"group"  => "Establecimiento"
			));

			$mergedArray = array_merge($mergedArray, $establecimientos);

			foreach ($mergedArray as &$subArray) {
				$subArray = array_map('utf8_encode', $subArray);
			}

			return $mergedArray;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * [deleteHotelFavorito description]
	 * @param  [type] $array_id_info_indice [description]
	 * @return [type]                       [description]
	 */
	function deleteHotelFavorito($array_id_establecimiento)
	{
		try {
			if (empty($array_id_establecimiento))
				throw new Exception("Envie un id o ids de establecimiento", 5203);
			if (!is_array($array_id_establecimiento)) {
				if (!$array_id_establecimiento > 0)
					throw new Exception("tiene que ser numerico", 5204);
				$array_indice[] = $array_id_establecimiento;
			} else
				$array_indice = $array_id_establecimiento;

			foreach ($array_indice as $key => $indice) {
				# code...
				$this->table = 'tbl_info_fav';
				$this->fields = array('activo' => 2);
				$this->where = 'id_tbl_establecimiento=' . $indice . ' and id_tbl_usuario=' . $this->id_tbl_usuario;
				if (!$id_fav = $this->update())
					throw new Exception("no se pudo actualizar", 5205);
			}
			return true;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * [saveOfertasFavoritas description]
	 * @param  [type] $array_id_info_indice [description]
	 * @return [type]                       [description]
	 */
	function saveHotelFavorito($post)
	{
		try {
			//favorito=1 -> estadoActivo       favorito=2 ->  estadoEliminado

			$arrayWhere[] = 'id_tbl_usuario=' . $post['id_tbl_usuario'];
			$arrayWhere[] = 'id_tbl_establecimiento =' . $post['id_establecimiento'];
			$arrayWhere[] = 'id_tbl_establecimiento !=0';

			$HotelFav = $this->find('all', array(
				'select' => "IF(COUNT(*) > 0, 'true', 'false') AS resultado",
				'from'	=> 'tbl_info_fav',
				'where'	=> $arrayWhere,
			));

			//pr($this->lastQuery);
			//pr($HotelFav[0]['resultado']);

			if ($HotelFav[0]['resultado'] === 'true') {     //modificar registro				
				$this->table = 'tbl_info_fav';
				$this->fields = array('activo' => $post['favorito']);
				$this->where = 'id_tbl_establecimiento=' . $post['id_establecimiento'] . ' and id_tbl_usuario=' . $post['id_tbl_usuario'];
				if (!$id_fav = $this->update())
					throw new Exception("no se pudo actualizar", 5205);
			} else {    // guardar registro
				$this->table = 'tbl_info_fav';
				$this->fields = array('id_tbl_establecimiento' => $post['id_establecimiento'], 'fecha' => date('Y-m-d H:i:s'), 'id_tbl_usuario' => $post['id_tbl_usuario'], 'activo' => 1);
				if (!$id_fav = $this->save())
					throw new Exception("no se pudo guardar", 5105);
			}
			return true;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}


	public function getOfertasPublicidad($data)
	{
		try {
			// pr($data);
			if (!$data['id_tbl_usuario'] > 0)
				throw new Exception("es usuario no es correcto", 5101);

			if ($data['id_objeto'] > 0)
				$arrayWhere[] = 'pub.id_tbl_objeto = ' . $data['id_objeto'];
			else
				$arrayWhere[] = 'pub.id_tbl_objeto = 30';

			if ($data['id_lugar'] > 0)
				$arrayWhere[] = 'pub.id_tbl_lugar = ' . $data['id_lugar'];
			// $arrayWhere[] = 'id_tbl_usuario='.$data['id_tbl_usuario'];
			$arrayWhere[] = 'pub.id_tbl_tipo_publicidad in(3,1)';
			$arrayWhere[] = 'eliminado !=1';
			$arrayWhere[] = 'pub.id_tbl_info_indice is not null';
			$arrayWhere[] = 'wpd.id_tbl_servicio_web=' . $this->id_servicio;

			$ofertasPub = $this->find('all', array(
				'select' => 'distinct(id_tbl_info_indice) id',
				'from'	=> 'tbl_publicidad_dirigida pub join tbl_servicio_web_publicidad_dirigida wpd using(id_tbl_publicidad_dirigida)',
				'where'	=> $arrayWhere,
				'order' => 'id_tbl_publicidad_dirigida desc'
			));
			$this->lastQuery;
			// echo $this->error;
			//pr($this->lastQuery);
			// pr($ofertasPub);
			if (!$ofertasPub)
				throw new Exception("No hay ofertas de publicidad", 5103);
			// throw new Exception("Error sql en buscar favoritos".$this->error, 5102);

			foreach ($ofertasPub as $key => $ofert) {
				# code...
				$salida[] = $ofert['id'];
			}
			return $salida;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * [getOfertasEstablecimiento description]
	 * @param  [type] $post 		[description]
	 * @return [type]               [description]
	 */
	public function getOfertasEstablecimiento($post)
	{
		try {
			$arrayWhere[] = 'est.id_tbl_establecimiento =' . $post['id_establecimiento'];
			$arrayWhere[] = 'of.id_tbl_activacion = 1';
			$arrayWhere[] = 'DATE(	NOW()) BETWEEN DATE( of.fecha_inicio)';
			$arrayWhere[] = 'DATE( of.fecha_fin )';
			$arrayWhere[] = 'DATE(	NOW()) BETWEEN DATE( cont.fecha_ini)';
			$arrayWhere[] = 'DATE( cont.fecha_fin )';
			$arrayWhere[] = 'est.id_tbl_estado_modificacion = 3';
			$arrayWhere[] = 'of.id_tbl_estado_modificacion = 3';
			$arrayWhere[] = 'tbs.mostrar = 1';
			$arrayWhere[] = 'of.id_tbl_tipo_beneficio_suscripcion IN ( 1, 2, 5, 6, 7, 8, 9, 10, 12 )';
			$arrayWhere[] = 'ofeemp.id_tbl_empresa = 1';

			$ofertas = $this->find('all', array(
				'select' => "prd.id_tbl_info_indice id",
				'from'	=> 'tbl_oferta of	JOIN tbl_producto prd ON ( prd.id_tbl_producto = of.id_tbl_producto )
				JOIN tbl_establecimiento est ON ( est.id_tbl_establecimiento = prd.id_tbl_establecimiento )
				JOIN tbl_contrato cont ON cont.id_tbl_establecimiento = est.id_tbl_establecimiento
				JOIN tbl_tipo_beneficio_suscripcion tbs ON ( tbs.id_tbl_tipo_beneficio_suscripcion = of.id_tbl_tipo_beneficio_suscripcion )
				JOIN tbl_oferta_empresa ofeemp ON ( ofeemp.id_tbl_oferta = of.id_tbl_oferta )',
				'where'	=> $arrayWhere,
			));

			//pr($this->lastQuery);
			//pr($ofertas);

			if (!$ofertas)
				throw new Exception("No hay ofertas de este hotel", 5103);

			foreach ($ofertas as $key => $ofert) {
				# code...
				$salida[] = $ofert['id'];
			}

			return $salida;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * [getHotelFavorito description]
	 * @param  [type] $id_tbl_usuario [description]
	 * @return [type]                 [description]
	 */
	public function getHotelFavorito($id_usuario, $id_establecimiento)
	{
		try {

			if (!$id_usuario > 0)
				throw new Exception("el usuario no es correcto", 5101);

			$arrayWhere[] = 'id_tbl_usuario=' . $id_usuario;
			$arrayWhere[] = 'id_tbl_establecimiento =' . $id_establecimiento;
			$arrayWhere[] = 'id_tbl_establecimiento !=0';
			$arrayWhere[] = 'activo = 1';

			$HotelFav = $this->find('all', array(
				'select' => "IF(COUNT(*) > 0, 'true', 'false') AS resultado",
				'from'	=> 'tbl_info_fav',
				'where'	=> $arrayWhere,
			));
			// echo $this->lastQuery;

			return $HotelFav[0]['resultado'];
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}


	public function listadoHotelesFavoritos($id_usuario)
	{
		try {
			if (!$id_usuario > 0)
				throw new Exception("el usuario no es correcto", 5101);

			$arrayWhere[] = 'f.id_tbl_usuario=' . $id_usuario;
			$arrayWhere[] = 'f.activo=1';
			$arrayWhere[] = 'id_tbl_estado_modificacion=3';    //establecimiento esté en estado Revisado

			$HotelFav = $this->find('all', array(
				'select' => "id_tbl_establecimiento,titulo,catalogacion,direccion_establecimiento,latitud,longitud,	direccion_foto",
				'from'	=> 'tbl_info_fav f
				INNER JOIN tbl_establecimiento e USING ( id_tbl_establecimiento )
				INNER JOIN tbl_info_indice i ON e.id_tbl_info_indice = i.id_tbl_info_indice 
				INNER JOIN tbl_foto fo on fo.id_tbl_foto=i.id_tbl_foto',
				'where'	=> $arrayWhere
			));

			//pr($HotelFav);
			//pr($this->lastQuery);

			if (!$HotelFav)
				throw new Exception("No hay Hoteles favoritos", 5103);


			return $HotelFav;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
		return true;
	}

	/**
	 * [getHotelesActivos sirve para obtener logos de los hoteles activos.]
	 * @param  [type] $idEmpresa [empresa] 1 VE    4 FV
	 * @return [type]                 [listado]
	 */
	public function getHotelesActivos($idEmpresa)
	{
		$arrayWhere[] = 'id_tbl_empresa=' . $idEmpresa;
		$HotelFav = $this->find('all', array(
			'select' => "id_tbl_establecimiento as id_establecimiento,ROUND(MIN(precio) / 1.12) AS oferta_mejor_precio, lower( Establecimiento ) establecimiento, concat('https://visitaecuador.com/ve/img/contenido/informacion/thum141x82/', f.direccion_foto) as logoHotel",
			'from'	=> 'vista_ofertas_activas voa  join tbl_foto f  on voa.idFotoEstablecimiento=f.id_tbl_foto',
			'where'	=> $arrayWhere,
			'group' => 'id_tbl_establecimiento,idciudad'
		));

		//pr($HotelFav);
		//echo $this->lastQuery;
		if (!$HotelFav)
			throw new Exception("No hay Hoteles", 5103);

		$ArraysUtf8 = array_map(function ($item) {
			$item['establecimiento'] = utf8_encode($item['establecimiento']);
			return $item;
		}, $HotelFav);


		return $ArraysUtf8;
	}


	/**
	 * [verOferta description]
	 * @param  [array] $array_id_ofertas [array de ofertas]
	 * @return [type]                   [description]
	 */
	public function verOferta($array_id_ofertas)
	{

		try {
			if (empty($array_id_ofertas))
				throw new Exception("Envie un id o ids de ofertas", 5003);
			if (!is_array($array_id_ofertas))
				if (!$array_id_ofertas > 0)
					throw new Exception("tiene que ser numerico", 5004);

			switch (count($array_id_ofertas)) {
				case '1':
					# code...
					$arrayWhereOfertas[] = 'infoof.id_tbl_info_indice = ' . $array_id_ofertas[0];
					break;

				default:
					# code...
					$arrayWhereOfertas[] = 'infoof.id_tbl_info_indice in(' . implode(',', $array_id_ofertas) . ')';
					break;
			}


			switch (count($i)) {
				case 'value':
					# code...
					break;

				default:
					# code...
					break;
			}
		} catch (Exception $e) {
		}
	}

	public function arrayElementosUnicos($array_elementos)
	{
		$elementosUnicos = [];
		foreach ($array_elementos as $idServicio => $elementosServicio) {
			foreach ($elementosServicio as $idElemento => $elemento) {
				// Verificamos si ya hemos encontrado este elemento
				if (!isset($elementosUnicos[$idElemento])) {
					// Si no, lo almacenamos en el array de elementos únicos
					$elementosUnicos[$idElemento] = $elemento;
				}
			}
		}
		return $elementosUnicos;
	}


	/**
	 * ¿Está agotada la oferta para una búsqueda?
	 *
	 * Lee la lista de rangos de tbl_oferta_agotada (clave 'agotamientos') y, si no
	 * viene, cae al rango único de siempre (fecha_hora .. fecha_hora_fin) para no
	 * romper a quien llame este método con una oferta cruda de tbl_oferta.
	 * La regla de cada rango está en rangoAgotamientoQueBloquea().
	 *
	 * @param array       $oferta
	 * @param string|null $fechaCheckIn día de check-in buscado o reservado ('Y-m-d...');
	 *                                  sin él se evalúa contra "ahora"
	 */
	public function ofertaAgotadaAhora($oferta, $fechaCheckIn = null)
	{
		$rangos = array();
		if (!empty($oferta['agotamientos']) && is_array($oferta['agotamientos'])) {
			$rangos = $oferta['agotamientos'];
		} elseif (!empty($oferta['fecha_hora']) || !empty($oferta['fecha_hora_fin'])) {
			$rangos[] = array(
				'inicio' => isset($oferta['fecha_hora'])     ? $oferta['fecha_hora']     : null,
				'fin'    => isset($oferta['fecha_hora_fin']) ? $oferta['fecha_hora_fin'] : null,
			);
		}
		return $this->rangoAgotamientoQueBloquea($rangos, $fechaCheckIn) !== null;
	}

	/**
	 * El rango de agotamiento que bloquea una búsqueda, o null si la oferta está libre.
	 * Misma regla que esOfertaAgotada() del frontend (global/ofertasPricing.js):
	 *  1. Si el rango ya terminó (fin < ahora), no bloquea.
	 *  2. Con día de check-in, bloquea solo si ese día cae dentro del rango: un
	 *     agotamiento vigente hoy no impide reservar para después de que termine.
	 *  3. Sin día de check-in, bloquea mientras esté vigente ahora.
	 * Un extremo vacío queda abierto; sin ninguna fecha = no bloquea.
	 *
	 * @return array|null ['inicio'=>, 'fin'=>, ...] tal como viene en $rangos
	 */
	public function rangoAgotamientoQueBloquea($rangos, $fechaCheckIn = null)
	{
		if (!$rangos || !is_array($rangos)) return null;

		$ahora = time();
		$diaCheckIn = !empty($fechaCheckIn) ? date('Y-m-d', strtotime(substr($fechaCheckIn, 0, 10))) : null;

		foreach ($rangos as $rango) {
			$ini = !empty($rango['inicio']) ? strtotime($rango['inicio']) : null;
			$fin = !empty($rango['fin'])    ? strtotime($rango['fin'])    : null;
			if ($ini === null && $fin === null) continue;
			if ($fin !== null && $ahora > $fin) continue;

			if ($diaCheckIn === null) {
				if ($ini !== null && $ahora < $ini) continue;
				return $rango;
			}

			if ($ini !== null && $diaCheckIn < date('Y-m-d', $ini)) continue;
			if ($fin !== null && $diaCheckIn > date('Y-m-d', $fin)) continue;
			return $rango;
		}
		return null;
	}

	/**
	 * Rangos de agotamiento (tbl_oferta_agotada) de varias ofertas a la vez.
	 *
	 * @param  array $idsOfertas ids de tbl_oferta
	 * @return array [id_tbl_oferta => [ ['id'=>, 'inicio'=>, 'fin'=>, 'comentario'=>], ... ]]
	 */
	public function getAgotamientosOfertas($idsOfertas)
	{
		$ids = array();
		foreach ((array) $idsOfertas as $id) {
			$id = intval($id);
			if ($id > 0) $ids[$id] = $id;
		}
		if (!$ids) return array();

		try {
			$filas = $this->find('all', array(
				'select' => 'ag.id_tbl_oferta_agotada id, ag.id_tbl_oferta, ag.fecha_inicio, ag.fecha_fin, ag.comentario',
				'from'   => 'tbl_oferta_agotada ag',
				'where'  => 'ag.activo = 1 AND ag.id_tbl_oferta IN (' . implode(',', $ids) . ')',
				'order'  => 'ag.fecha_inicio asc, ag.id_tbl_oferta_agotada asc',
			));
		} catch (Exception $e) {
			// Si la tabla todavía no existe en este entorno, el módulo sigue
			// funcionando con el rango único de tbl_oferta.
			return array();
		}
		if (!$filas) return array();

		$porOferta = array();
		foreach ($filas as $fila) {
			$idOferta = intval($fila['id_tbl_oferta']);
			$porOferta[$idOferta][] = array(
				'id'         => intval($fila['id']),
				'inicio'     => $fila['fecha_inicio'],
				'fin'        => $fila['fecha_fin'],
				'comentario' => $fila['comentario'],
			);
		}
		return $porOferta;
	}

	/**
	 * De una lista de rangos devuelve el que manda para los campos antiguos
	 * fecha_hora / fecha_hora_fin del payload: el vigente ahora y, si no hay
	 * ninguno vigente, el próximo que empieza. Así la app móvil y cualquier
	 * cliente que todavía lea un solo rango siguen comportándose bien.
	 *
	 * @return array ['inicio'=>, 'fin'=>] con null si no hay rangos
	 */
	public function rangoAgotamientoPrincipal($rangos)
	{
		$vacio = array('inicio' => null, 'fin' => null);
		if (!$rangos || !is_array($rangos)) return $vacio;

		$ahora     = time();
		$proximo   = null;
		$proximoEn = null;
		foreach ($rangos as $rango) {
			$ini = !empty($rango['inicio']) ? strtotime($rango['inicio']) : null;
			$fin = !empty($rango['fin'])    ? strtotime($rango['fin'])    : null;
			if ($ini === null && $fin === null) continue;

			$vigente = ($ini === null || $ahora >= $ini) && ($fin === null || $ahora <= $fin);
			if ($vigente)
				return array('inicio' => $rango['inicio'], 'fin' => $rango['fin']);

			// Todavía no empieza: se guarda el más cercano.
			if ($ini !== null && $ini > $ahora && ($proximoEn === null || $ini < $proximoEn)) {
				$proximoEn = $ini;
				$proximo   = array('inicio' => $rango['inicio'], 'fin' => $rango['fin']);
			}
		}
		return $proximo ? $proximo : $vacio;
	}

	/**
	 * Rangos de agotamiento de UNA oferta, para el administrador.
	 * @return array lista de rangos (vacía si no tiene)
	 */
	public function listarAgotamientosOferta($idOferta)
	{
		$agotamientos = $this->getAgotamientosOfertas(array($idOferta));
		$idOferta = intval($idOferta);
		return isset($agotamientos[$idOferta]) ? $agotamientos[$idOferta] : array();
	}

	/**
	 * Reemplaza la lista de rangos de agotamiento de una oferta.
	 *
	 * Se guarda la lista completa (no rangos sueltos): los anteriores se desactivan
	 * y se insertan los que manda el administrador. Mandar una lista vacía deja la
	 * oferta disponible.
	 *
	 * @param  array $post ['id_tbl_oferta', 'rangos' => [['inicio','fin','comentario'], ...], 'id_tbl_usuario']
	 * @return array la lista guardada, o false con $this->error
	 */
	public function guardarAgotamientosOferta($post)
	{
		try {
			$idOferta = isset($post['id_tbl_oferta']) ? intval($post['id_tbl_oferta']) : 0;
			if ($idOferta <= 0)
				throw new Exception("Falta la oferta", 400);

			$rangos = isset($post['rangos']) && is_array($post['rangos']) ? $post['rangos'] : array();

			// Validación previa: nada se guarda si un rango está mal.
			$limpios = array();
			foreach ($rangos as $pos => $rango) {
				$inicio = isset($rango['inicio']) ? trim($rango['inicio']) : '';
				$fin    = isset($rango['fin'])    ? trim($rango['fin'])    : '';
				if ($inicio === '' && $fin === '')
					throw new Exception("El rango " . ($pos + 1) . " no tiene fechas", 400);
				if ($inicio !== '' && strtotime($inicio) === false)
					throw new Exception("Fecha de inicio inválida en el rango " . ($pos + 1), 400);
				if ($fin !== '' && strtotime($fin) === false)
					throw new Exception("Fecha de fin inválida en el rango " . ($pos + 1), 400);
				if ($inicio !== '' && $fin !== '' && strtotime($fin) <= strtotime($inicio))
					throw new Exception("En el rango " . ($pos + 1) . " el fin debe ser posterior al inicio", 400);

				$limpios[] = array(
					'inicio'     => $inicio !== '' ? date('Y-m-d H:i:s', strtotime($inicio)) : null,
					'fin'        => $fin    !== '' ? date('Y-m-d H:i:s', strtotime($fin))    : null,
					'comentario' => isset($rango['comentario']) ? substr(trim($rango['comentario']), 0, 255) : null,
				);
			}

			// Rangos que se solapan entre sí: se avisa, porque casi siempre es un error
			// de captura y deja fechas duplicadas en el calendario.
			$solapado = $this->rangosSeSolapan($limpios);
			if ($solapado)
				throw new Exception("Los rangos " . $solapado . " se cruzan entre sí", 400);

			// Fuera los anteriores (borrado lógico, para conservar el historial).
			$this->table  = 'tbl_oferta_agotada';
			$this->fields = array('activo' => 0);
			$this->where  = 'id_tbl_oferta = ' . $idOferta . ' AND activo = 1';
			$this->update();

			$idUsuario = isset($post['id_tbl_usuario']) ? intval($post['id_tbl_usuario']) : 0;
			foreach ($limpios as $rango) {
				$campos = array(
					'id_tbl_oferta'  => $idOferta,
					'activo'         => 1,
					'fecha_creacion' => date('Y-m-d H:i:s'),
				);
				// El Model omite los campos NULL al guardar, así que solo se mandan
				// los extremos que realmente tienen fecha (el otro queda NULL en la BD).
				if ($rango['inicio'] !== null) $campos['fecha_inicio'] = $rango['inicio'];
				if ($rango['fin']    !== null) $campos['fecha_fin']    = $rango['fin'];
				if ($rango['comentario']) $campos['comentario'] = $rango['comentario'];
				if ($idUsuario > 0) $campos['id_tbl_usuario_creacion'] = $idUsuario;

				$this->table  = 'tbl_oferta_agotada';
				$this->fields = $campos;
				if (!$this->save())
					throw new Exception("No se pudo guardar el agotamiento: " . $this->error, $this->codeerror);
			}

			return $this->listarAgotamientosOferta($idOferta);

		} catch (Exception $e) {
			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * Devuelve "1 y 3" con los dos primeros rangos que se cruzan, o '' si no hay cruces.
	 * Un extremo vacío cuenta como infinito hacia ese lado.
	 */
	public function rangosSeSolapan($rangos)
	{
		$total = count($rangos);
		for ($i = 0; $i < $total; $i++) {
			$iniA = $rangos[$i]['inicio'] !== null ? strtotime($rangos[$i]['inicio']) : -PHP_INT_MAX;
			$finA = $rangos[$i]['fin']    !== null ? strtotime($rangos[$i]['fin'])    : PHP_INT_MAX;
			for ($j = $i + 1; $j < $total; $j++) {
				$iniB = $rangos[$j]['inicio'] !== null ? strtotime($rangos[$j]['inicio']) : -PHP_INT_MAX;
				$finB = $rangos[$j]['fin']    !== null ? strtotime($rangos[$j]['fin'])    : PHP_INT_MAX;
				if ($iniA <= $finB && $iniB <= $finA)
					return ($i + 1) . " y " . ($j + 1);
			}
		}
		return '';
	}

	/** Elimina (borrado lógico) un rango de agotamiento por su id. */
	public function eliminarAgotamientoOferta($idAgotamiento)
	{
		try {
			$id = intval($idAgotamiento);
			if ($id <= 0)
				throw new Exception("Falta el id del agotamiento", 400);

			$this->table  = 'tbl_oferta_agotada';
			$this->fields = array('activo' => 0);
			$this->where  = 'id_tbl_oferta_agotada = ' . $id;
			if (!$this->update())
				throw new Exception("No se pudo eliminar el agotamiento: " . $this->error, $this->codeerror);

			return true;

		} catch (Exception $e) {
			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * [verOfertas description]
	 * @param  [type] $data [description]
	 * @return [type]       [description]
	 */
	public function verOfertas($data)
	{
		try {

			if (count($this->rangofechas) == 0)
				$rangofec = $this->rangofechas['inicio'] . ' - ' . $this->rangofechas['fin'];

			if (!$this->configApp)
				$this->configApp = $this->app->getConfig(array('id_servicio' => $data['id_servicio']));

			//paginacion
			if (isset($data['nitems']) and $data['nitems'] > 0)
				$nPorPagina = $data['nitems'];
			else
				$nPorPagina = $this->configApp['oferta_n_X_Pagina'];
			$nPagSigAnt = $this->configApp['oferta_nPagSigAnt'];

			//ordenacion
			$orden = empty($data['ordenar']) ? explode('_', $this->configApp['oferta_orden_default']) : explode('_', $data['ordenar']);

			//consulta de cliente
			$tipoConsulta    = ($data['tipo']);
			$evento          = ($data['evento']);
			$idConsulta      = ($data['id']);

			$destino         = ($data['txtBusqueda']);
			$txtBusqueda     = $this->sanearString($data['txtBusqueda']);
			$idEstablecimiento = $data['id_establecimiento'];

			//beneficios seleccionados
			if (isset($data['beneficios']))
				if (!(count($data['beneficios']) > 0 and is_array($data['beneficios'])))
					throw new Exception("Informacion de beneficios debe ser array o contener informacion", 1001);
			$beneficio = $data['beneficios'];

			//servicios disponibles
			if (isset($data['idservicios']))
				if (!(count($data['idservicios']) > 0 and is_array($data['idservicios'])))
					throw new Exception("Informacion de servicios debe ser array o contener informacion", 1001);
			$idsServicios = $data['idservicios'];

			//ninos y adultos
			if (isset($data['personas']))
				if (!(count($data['personas']) > 0 and is_array($data['personas'])))
					throw new Exception("Informacion de personas debe ser array o contener informacion", 1001);
			$idAdultosNinos = $data['personas'];

			//tiempo
			if (isset($data['tiempo']))
				if (!(count($data['tiempo']) > 0 and is_array($data['tiempo'])))
					throw new Exception("Informacion de tiempo debe ser array o contener informacion", 1001);
			$idDiasNoches = $data['tiempo'];

			//precios, minimo y maximo
			if (isset($data['precio']))
				if (!(count($data['precio']) > 0 and is_array($data['precio'])))
					throw new Exception("Informacion de precio debe ser array o contener informacion", 1001);
			$valorPrecios = [0, 10000];

			if (isset($data['habitaciones']))
				if (!(count($data['habitaciones']) > 0 and is_array($data['habitaciones'])))
					throw new Exception("Informacion de habitaciones debe ser array o contener informacion", 1001);
			$idHabitaciones = $data['habitaciones'];

			if (isset($data['pax'])) {
				if (!$data['pax']['adultos'] > 0)
					throw new Exception("Debe tener por lo menos 1 adulto", 1);
			}
			$pax = $data['pax'];

			if (isset($data['fechas'])) {
				$fechas = $data['fechas'];
			}

			if ($data['pag'] > 1)
				$pagSeleccionada = ($data['pag']);
			else
				$pagSeleccionada = 1;

			if (isset($data['id_oferta']))
				if (is_array($data['id_oferta']))
					$idsOfertas = $data['id_oferta'];
				else
					$idsOfertas = explode(',', $data['id_oferta']);

			if (isset($data['localidad']) and !empty($data['localidad']))
				$localidad = explode("::", ($data['localidad']));

			/********************************************************************************
			 * WHERE SQL , datos por default
			 */
			if ($data['mode'] != 'historial') {
				$arrayWhereOfertas[] = 'of.id_tbl_activacion = 1';
				$arrayWhereOfertas[] = 'DATE(NOW()) BETWEEN DATE(of.fecha_inicio) AND DATE(of.fecha_fin)';
				$arrayWhereOfertas[] = 'DATE(NOW()) BETWEEN DATE(cont.fecha_ini) AND DATE(cont.fecha_fin)';
				$arrayWhereOfertas[] = 'est.id_tbl_estado_modificacion = 3';
				$arrayWhereOfertas[] = 'of.id_tbl_estado_modificacion = 3';
				$arrayWhereOfertas[] = 'tbs.mostrar = 1';
				$arrayWhereOfertas[] = 'infest.id_tbl_servicio NOT IN (30, 92)';
			}

			/********************************************************************************
			 * FILTROS Configuracion de Aplicacion
			 */
			switch (count($this->configApp['id_beneficios'])) {
				case '1':
					$arrayWhereOfertas[] = 'of.id_tbl_tipo_beneficio_suscripcion = ' . $this->configApp['id_beneficios'][0];
					break;
				default:
					$arrayWhereOfertas[] = 'of.id_tbl_tipo_beneficio_suscripcion in(' . implode(',', $this->configApp['id_beneficios']) . ')';
					break;
			}

			switch (count($this->configApp['id_empresa'])) {
				case '1':
					$arrayWhereOfertas[] = 'ofeemp.id_tbl_empresa = ' . $this->configApp['id_empresa'][0];
					break;
				default:
					$arrayWhereOfertas[] = 'ofeemp.id_tbl_empresa in(' . implode(',', $this->configApp['id_empresa']) . ')';
					break;
			}

			/**
			 * FILTRO Configuracion Suscriptor
			 */
			switch (count($this->configSuscriptor['id_beneficios'])) {
				case '1':
					$arrayWhereOfertas[] = 'of.id_tbl_tipo_beneficio_suscripcion = ' . $this->configSuscriptor['id_beneficios'][0];
					break;
				default:
					$arrayWhereOfertas[] = 'of.id_tbl_tipo_beneficio_suscripcion in(' . implode(',', $this->configSuscriptor['id_beneficios']) . ')';
					break;
			}

			/********************************************************************************
			 * FILTRO seleccionado por el usuario
			 */
			if ($idEstablecimiento > 0)
				$arrayWhereOfertas[] = 'est.id_tbl_establecimiento = ' . $idEstablecimiento;

			if (isset($idsOfertas)) {
				switch (count($idsOfertas)) {
					case '1':
						$arrayWhereOfertas[] = 'infoof.id_tbl_info_indice = ' . array_shift($idsOfertas) . '';
						break;
					default:
						$arrayWhereOfertas[] = 'infoof.id_tbl_info_indice in (' . implode(',', $idsOfertas) . ')';
						break;
				}
			}

			if ($localidad) {
				switch ($localidad[0]) {
					case 'nacional':
						$arrayWhereOfertas[] = ' paisof.id_tbl_lugar = ' . $this->configApp['idpais'];
						break;
					case 'internacional':
						$arrayWhereOfertas[] = ' paisof.id_tbl_lugar != ' . $this->configApp['idpais'];
						break;
					default:
						break;
				}
			}

			if ($data['precio'])
				$arrayWhereOfertas[] = '(round(of.precio_oferta, 2)  between ' . $valorPrecios[0] . ' and ' . $valorPrecios[1] . ' )';

			if ($data['tiempo']) {
				foreach ($idDiasNoches as $key => $dn) {
					$dn = explode("-", $dn);
					$arrayDN[] = "(of.dias = " . $dn[0] . " and of.noches = " . $dn[1] . ")";
				}
				$arrayWhereOfertas[] = "(" . implode(" or ", $arrayDN) . ")";
			}

			if ($data['personas']) {
				foreach ($idAdultosNinos as $key => $an) {
					$an = explode("-", $an);
					$arrayAN[] = "(of.adultos = " . $an[0] . " and of.ninos = " . $an[1] . ")";
				}
				$arrayWhereOfertas[] = "(" . implode(" or ", $arrayAN) . ")";
			}

			if ($data['idservicios']) {
				switch (count($idsServicios)) {
					case '1':
						$arrayWhereEstablecimientoPorServicio[] = 'id_tbl_establecimiento = ' . $idsServicios[0] . ' ';
						break;
					default:
						$arrayWhereEstablecimientoPorServicio[] = 'id_tbl_establecimiento in (' . implode(',', $idsServicios) . ') ';
						break;
				}
				$establecimientoPorServicio = $this->find('all', array(
					'select' => 'distinct(id_tbl_establecimiento) id',
					'from'	=> 'tbl_dtl_servicio_establecimiento',
					'where'	=> $arrayWhereEstablecimientoPorServicio,
				));
				if ($establecimientoPorServicio) {
					foreach ($establecimientoPorServicio as $llave => $est)
						$arrayEstablecimeintoPorServicio[] = $est['id'];
					$arrayWhereOfertas[] = 'est.id_tbl_establecimiento in (' . implode(',', $arrayEstablecimeintoPorServicio) . ')';
				}
			}

			if ($idHabitaciones) {
				switch (count($idHabitaciones)) {
					case '1':
						$arrayWhereOfertas[] = 'of.habitaciones = ' . $idHabitaciones[0] . ' ';
						break;
					case '';
						break;
					default:
						$arrayWhereOfertas[] = 'of.habitaciones in (' . implode(',', $idHabitaciones) . ') ';
						break;
				}
			}

			if ($pax) {
				$totalNinosAdultos = 0;
				if (isset($pax['ninos'])) {
					$totalninos = $pax['ninos'];
					foreach ($edadninos as $key => $edadnino) {
						if ($edadnino > 11) {
							$totalNinosAdultos++;
							$totalninos--;
						}
					}
					$arrayCabacera[] = 'of.ninos = ' . $totalninos;
				}
				if (isset($pax['adultos'])) {
					$totalAdultos = $pax['adultos'] + $totalNinosAdultos;
					$arrayCabacera[] = 'of.adultos = ' . $totalAdultos;
				}
			}

			if ($fechas) {
				$arrayWhereOfertas[] = '( "' . $fechas['inicio'] . '" between of.fecha_inicio   and   of.fecha_fin  )';
				$semana['entre'] = ['1' => 1, '2' => 2, '3' => 3, '4' => 4];
				$semana['fin']   = ['5' => 5, '6' => 'Sabadp', '7' => 7];
				for ($i = 0; $i < $nochesSeleccionadas; $i++) { }
				$fecha1 = new DateTime($fechas['inicio']);
				$fecha2 = new DateTime($fechas['fin']);
				$difererenciaDias = $fecha1->diff($fecha2);
				$nochesSeleccionadas = $difererenciaDias->days;
				$diaInicioSemana = date("w", strtotime($fechas['inicio']));
				$arrayCabacera[] = 'of.noches = ' . $nochesSeleccionadas;
			}

			if (isset($beneficio))
				foreach ($beneficio as $key => $ben) {
					switch ($ben) {
						case '6': //internacional
							$arrayWhereOfertasPorPais[] = ' paisof.id_tbl_lugar != ' . $this->configApp['idpais'];
							break;
						default:
							$arrayWhereOfertasBeneficio[] = 'of.id_tbl_tipo_beneficio_suscripcion=' . $ben;
							break;
					}
					if (isset($arrayWhereOfertasPorPais))
						$arrayWhereOfertas[] = implode(' or ', $arrayWhereOfertasPorPais);
					if (isset($arrayWhereOfertasBeneficio))
						$arrayWhereOfertas[] = implode(' or ', $arrayWhereOfertasBeneficio);
				}

			/********************************************************************************
			 * (A) Resolución de ubicación SOLO si hay búsqueda real.
			 *     Sin búsqueda => no se escanea ni se arma el OR gigante de ciudades.
			 */
			$hayBusqueda = (!empty($txtBusqueda) || $idConsulta > 0);

			$idTblLugar = $idTblLugarCiudad = $idsEstable = '';

			if ($hayBusqueda) {
				$subWhere = [];
				$subWhere[] = "of.id_tbl_activacion = 1";
				$subWhere[] = "DATE(NOW()) BETWEEN DATE( of.fecha_inicio ) ";
				$subWhere[] = " DATE( of.fecha_fin ) ";
				$subWhere[] = "DATE(NOW()) BETWEEN DATE( cont.fecha_ini ) ";
				$subWhere[] = "DATE( cont.fecha_fin ) ";
				$subWhere[] = "est.id_tbl_estado_modificacion = 3 ";
				$subWhere[] = "of.id_tbl_estado_modificacion = 3 ";
				$subWhere[] = "of.id_tbl_tipo_beneficio_suscripcion IN ( 1, 2, 5, 6, 7, 8, 9, 10, 12 ) ";
				$subWhere[] = "ofeemp.id_tbl_empresa = 1 ";
				$subWhere[] = "of.id_tbl_tipo_beneficio_suscripcion IN ( 1, 5, 7, 12, 2, 10, 9, 8 )";
				if ($fechas)
					$subWhere[] = '( "' . $fechas['inicio'] . '" between of.fecha_inicio   and   of.fecha_fin  )';
				$subWhere[] = 'REPLACE (REPLACE(CONCAT_WS(" ",TRIM(REPLACE ( infest.titulo, "-", "" )),paisest.desc_lugar,regest.desc_lugar,provest.desc_lugar,l.desc_lugar),"  "," "),"  "," ") like "%' . $txtBusqueda . '%"';

				$dato = $this->find('all', array(
					'select' => 'est.id_tbl_establecimiento,l.id_tbl_lugar',
					'from'	=> 'tbl_oferta of
						JOIN tbl_producto prd ON ( prd.id_tbl_producto = of.id_tbl_producto )
						JOIN tbl_establecimiento est ON ( est.id_tbl_establecimiento = prd.id_tbl_establecimiento )
						JOIN tbl_contrato cont ON cont.id_tbl_establecimiento = est.id_tbl_establecimiento
						JOIN tbl_info_indice infoof ON infoof.id_tbl_info_indice = prd.id_tbl_info_indice
						JOIN tbl_info_indice infest ON infest.id_tbl_info_indice = est.id_tbl_info_indice
						JOIN tbl_oferta_empresa ofeemp ON ( ofeemp.id_tbl_oferta = of.id_tbl_oferta )
						JOIN tbl_lugar l ON l.id_tbl_lugar = infest.id_tbl_lugar
						JOIN tbl_lugar provest ON provest.id_tbl_lugar = l.id_tbl_lugarpadre
						JOIN tbl_lugar regest ON regest.id_tbl_lugar = provest.id_tbl_lugarpadre
						JOIN tbl_lugar paisest ON paisest.id_tbl_lugar = regest.id_tbl_lugarpadre',
					'where'	=> $subWhere,
					'group' => 'id_tbl_lugar'
				));

				$tLugar = '('; $tCiudad = '('; $tEst = '(';
				foreach ($dato as $datos) {
					$tLugar  .= 'lugarof.id_tbl_lugar = "' . $datos['id_tbl_lugar'] . '" OR ';
					$tCiudad .= 'voa.idCiudad = "' . $datos['id_tbl_lugar'] . '" OR ';
					$tEst    .= 'est.id_tbl_establecimiento ="' . $datos['id_tbl_establecimiento'] . '" OR ';
				}
				$idTblLugar       = rtrim($tLugar,  ' OR ') . ')';
				$idTblLugarCiudad = rtrim($tCiudad, ' OR ') . ')';
				$idsEstable       = rtrim($tEst,    ' OR ') . ')';
			}

			//Tipo de consulta disponible.
			switch ($tipoConsulta) {
				case 'establecimiento':
					if ($idConsulta > 0) {
						if (!empty($dato) && isset($dato))
							$arrayWhereOfertas[] = $idTblLugar;
						$txtWhereFiltro[] = $idTblLugarCiudad;
					}
					$txtMsjResultado = "|nOfertas| en $txtBusqueda";
					break;

				case 'destino':
					if ($idConsulta > 0) {
						if (!empty($dato) && isset($dato))
							$arrayWhereOfertas[] = $idTblLugar;
					}
					$txtWhereFiltro[] = 'voa.idCiudad = "' . $idConsulta . '"';
					$txtMsjResultado = "|nOfertas| en |nEstablecimiento| en $txtBusqueda";
					break;

				case '':
					if ($hayBusqueda && !empty($dato) && isset($dato) && (count($idsOfertas)) < 2 && $data['mode'] !== "detalle") {
						$arrayWhereOfertas[] = $idTblLugar;
					}
					if ($hayBusqueda)
						$txtWhereFiltro[] = $idTblLugarCiudad;
					$txtMsjResultado = "|nOfertas| en $txtBusqueda";
					break;
			}

			/******************************************************************************
			 * ORDENACION
			 */
			switch ($orden[1]) {
				case '1':  $via = "asc";  break;
				case '2':  $via = "desc"; break;
				default:   $via = "asc";  break;
			}

			switch ($orden[0]) {
				case '1': $txtOrderBy = "of.fecha_inicio "; break;
				case '2': $txtOrderBy = " of.precio_oferta "; break;
				case '3': $txtOrderBy = " infest.titulo "; break;
				case '4': $txtOrderBy = " of.costo_rack "; break;
				case '5': $txtOrderBy = " lugarof.desc_lugar "; break;
				case '6': $txtOrderBy = " if((provof.id_tbl_tipo_lugar = 1),provof.desc_lugar,  if((paisof.id_tbl_tipo_lugar = 1), paisof.desc_lugar, _latin1'')) "; break;
				case '7': $txtOrderBy = " ((of.costo_rack-of.precio_oferta) * " . $this->configApp['conversion'] . ") /  moneda.factor_conversion "; break;
				default:  $txtOrderBy = " of.fecha_inicio "; break;
			}

			/*******************************************************************************
			 * (D-F) PAGINACIÓN POR ESTABLECIMIENTO + DOS FASES
			 */
			$paginaActual = ($pagSeleccionada > 0) ? $pagSeleccionada : 1;
			$desde        = ($paginaActual - 1) * $nPorPagina;

			// FROM liviano: solo las tablas que aparecen en $arrayWhereOfertas + orden
			$fromLite = '
				tbl_oferta of
				JOIN tbl_producto prd            ON prd.id_tbl_producto = of.id_tbl_producto
				JOIN tbl_establecimiento est     ON est.id_tbl_establecimiento = prd.id_tbl_establecimiento
				JOIN tbl_contrato cont           ON cont.id_tbl_establecimiento = est.id_tbl_establecimiento
				JOIN tbl_tipo_beneficio_suscripcion tbs ON tbs.id_tbl_tipo_beneficio_suscripcion = of.id_tbl_tipo_beneficio_suscripcion
				JOIN tbl_oferta_empresa ofeemp   ON ofeemp.id_tbl_oferta = of.id_tbl_oferta
				JOIN tbl_info_indice infoof      ON infoof.id_tbl_info_indice = prd.id_tbl_info_indice
				JOIN tbl_info_indice infest      ON infest.id_tbl_info_indice = est.id_tbl_info_indice
				JOIN tbl_lugar lugarof           ON lugarof.id_tbl_lugar = infoof.id_tbl_lugar
				JOIN tbl_lugar provof            ON provof.id_tbl_lugar = lugarof.id_tbl_lugarpadre
				JOIN tbl_lugar regof             ON regof.id_tbl_lugar = provof.id_tbl_lugarpadre
				JOIN tbl_lugar paisof            ON paisof.id_tbl_lugar = regof.id_tbl_lugarpadre';

			// Orden a nivel establecimiento (representante = MIN), sin moneda (más liviano)
			switch ($orden[0]) {
				case '2': $ordEst = 'MIN(of.precio_oferta)';                 break; // precio
				case '3': $ordEst = 'MIN(infest.titulo)';                    break; // nombre
				case '4': $ordEst = 'MIN(of.costo_rack)';                    break; // rack
				case '5': $ordEst = 'MIN(lugarof.desc_lugar)';               break; // ciudad
				case '7': $ordEst = 'MIN(of.costo_rack - of.precio_oferta)'; break; // ahorro
				case '1':
				default:  $ordEst = 'MIN(of.fecha_inicio)';                  break;
			}
			$ordenEst = $ordEst . ' ' . $via;
			if (!empty($idsEstable) && $idsEstable !== '()')
				$ordenEst = 'CASE WHEN ' . $idsEstable . ' THEN 0 ELSE 1 END ASC, ' . $ordenEst;

			// FASE 1a: total de establecimientos (para paginación correcta)
			$totEst = $this->find('all', array(
				'select' => 'COUNT(DISTINCT est.id_tbl_establecimiento) total',
				'from'   => $fromLite,
				'where'  => $arrayWhereOfertas,
			));
			$this->totalOfertas = (int)($totEst[0]['total'] ?? 0); // = total establecimientos
			$nPaginas = (int)ceil($this->totalOfertas / $nPorPagina);

			$this->nPaginas     = $nPaginas;
			$this->paginaActual = $paginaActual;
			$this->nPorPagina   = $nPorPagina;
			// FASE 1b: IDs de los establecimientos de ESTA página
			$pageRows = $this->find('all', array(
				'select' => 'est.id_tbl_establecimiento id',
				'from'   => $fromLite,
				'where'  => $arrayWhereOfertas,
				'group'  => 'est.id_tbl_establecimiento',
				'order'  => $ordenEst,
				'limit'  => "$desde, $nPorPagina",
			));
			$pageEstIds = array_map(function ($r) { return (int)$r['id']; }, $pageRows);

			if (count($pageEstIds) == 0)
				throw new Exception("No esta/n disponible/s esta/s oferta/s", 5701);

			// FASE 2: detalle SOLO de los establecimientos de la página (ya NO va LIMIT aquí)
			$arrayWhereOfertas[] = 'est.id_tbl_establecimiento IN (' . implode(',', $pageEstIds) . ')';

			$ordenOfertas = $txtOrderBy . " " . $via;
			if (count($arrayCabacera) > 0 && !empty($idsEstable) && $idsEstable !== '()') {
				$this->selectOfertas = $this->selectOfertas . ',if(' . $idsEstable . ',"A","B") estadoBusqueda';
				$ordenOfertas = 'estadoBusqueda,' . $ordenOfertas;
			}

			$ofertas = $this->find('all', array(
				'select' => $this->selectOfertas,
				'from'	=> $this->fromOfertas,
				'where'	=> $arrayWhereOfertas,
				'group' => 'of.id_tbl_oferta',
				'order' =>  $ordenOfertas,
			));
			$this->sql = $this->lastQuery;

			foreach ($ofertas as $key => $ofs)
				$arrayIdOfertas[$ofs['id_tbl_oferta']] = $ofs['id_tbl_oferta'];

			if (count($ofertas) == 0)
				throw new Exception("No esta/n disponible/s esta/s oferta/s", 5701);
			if (!$ofertas)
				throw new Exception("No esta/n disponible/s esta/s oferta/s", 5701);

			//obtener informacion de paquete por fin de semana
			if (count($arrayIdOfertas) > 0) {
				$semana = $this->find('all', array(
					'select' => '*',
					'from'    => ' tbl_servicio_oferta so
						join tbl_servicio_smart sm using(id_tbl_servicio_smart) ',
					'where'    => 'id_tbl_servicio_smart in (92,93,96)
						and id_tbl_oferta in (' . implode(',', $arrayIdOfertas) . ')',
				));
				if ($semana) {
					foreach ($semana as $ksem => $sem) {
						$arraySemana[$sem['id_tbl_oferta']]['nombre'] = $sem['nombre_servicio_smart'];
						$arraySemana[$sem['id_tbl_oferta']]['id']     = $sem['id_tbl_servicio_smart'];
					}
				}
			}

			$arrayPreciosNuevos = $this->listaPrecios($arrayIdOfertas, implode(' - ', $fechas));

			$txtMsjResultado = str_replace('|nOfertas|', count($ofertas) . " ofertas", $txtMsjResultado);
			if (count($ofertas) == 1)
				$txtMsjResultado = str_replace('|nOfertas|', count($ofertas) . " oferta", $txtMsjResultado);

			/********************************************************************************
			 * (B) esSuscriptor se calcula UNA sola vez (mismo usuario para todas las ofertas)
			 */
			$esSuscriptor = false;
			if ($data['id_tbl_usuario'] > 0) {
				$tmpSus = $this->find('first', array(
					'select' => 'IF(sus.id_tbl_suscripcion IS NULL,"false","true") esSuscriptor',
					'from'   => 'tbl_usuario u LEFT JOIN tbl_suscripcion sus ON sus.id_tbl_usuario = u.id_tbl_usuario',
					'where'  => 'u.id_tbl_usuario = ' . intval($data['id_tbl_usuario'])
				));
				$esSuscriptor = ($tmpSus && $tmpSus['esSuscriptor'] === 'true');
			}

			// Rangos de agotamiento de todas las ofertas de la página, en una sola consulta.
			$idsAgotamiento = array();
			foreach ($ofertas as $ofertaTmp) $idsAgotamiento[] = $ofertaTmp['id_tbl_oferta'];
			$agotamientosPorOferta = $this->getAgotamientosOfertas($idsAgotamiento);

			foreach ($ofertas as $llave => $oferta) {

				$id                 = intval($oferta['id']);
				$id_establecimiento = intval($oferta['id_tbl_establecimiento']);
				$id_oferta          = intval($oferta['id_tbl_oferta']);
				$misOfertas[$llave]['id']                 = $id;
				$misOfertas[$llave]['id_lugar']           = $oferta['id_tbl_lugar'];
				$misOfertas[$llave]['nombreEst']          = utf8_encode($oferta['nombreEstablecimiento']);
				$misOfertas[$llave]['id_oferta']          = $id_oferta;
				$misOfertas[$llave]['habitaciones']       = $oferta['habitaciones'];
				$misOfertas[$llave]['id_establecimiento'] = $id_establecimiento;

				// Agotamiento: lista completa de rangos (tbl_oferta_agotada). Los campos
				// fecha_hora / fecha_hora_fin se mantienen con el rango vigente o el
				// próximo, para los clientes que todavía leen un solo rango.
				$rangosAgot = isset($agotamientosPorOferta[$id_oferta]) ? $agotamientosPorOferta[$id_oferta] : array();
				$principal  = $this->rangoAgotamientoPrincipal($rangosAgot);
				$misOfertas[$llave]['agotamientos']   = $rangosAgot;
				$misOfertas[$llave]['fecha_hora']     = $principal['inicio'];
				$misOfertas[$llave]['fecha_hora_fin'] = $principal['fin'];

				$misEstab[$id_establecimiento]['titulo']            = utf8_encode($oferta['nombreEstablecimiento']);
				$misEstab[$id_establecimiento]['ciudad']            = utf8_encode($oferta['ciudadEstablecimiento']);
				$misEstab[$id_establecimiento]['pais']              = utf8_encode($oferta['paisEstablecimiento']);
				$misEstab[$id_establecimiento]['idPais']            = utf8_encode($oferta['idPaisEstablecimiento']);
				$misEstab[$id_establecimiento]['idCiudad']          = utf8_encode($oferta['id_tbl_lugar']);
				$misEstab[$id_establecimiento]['descripcionEst']    = $oferta['descripcionEst'];
				$misEstab[$id_establecimiento]['fotoHotel']         = $oferta['fotoEstablecimientoPrin'];
				$misEstab[$id_establecimiento]['tipoEstablecimiento'] = utf8_encode($oferta['tipoEstablecimiento']);

				if ($oferta['edad_nino'])
					$misEstab[$id_establecimiento]['edad_nino'] = intval($oferta['edad_nino']);
				else
					$misEstab[$id_establecimiento]['edad_nino'] = $this->configApp['edad_nino'];

				$misEstab[$id_establecimiento]['catalogacion'] = ($oferta['catalogacion'] > 0) ? $oferta['catalogacion'] : 0;

				if ($oferta['longitud'] != 0)
					$misEstab[$id_establecimiento]['longitud'] = floatval($oferta['longitud']);
				else
					$misEstab[$id_establecimiento]['longitud'] = NULL;

				if ($oferta['latitud'] != 0)
					$misEstab[$id_establecimiento]['latitud'] = floatval($oferta['latitud']);
				else
					$misEstab[$id_establecimiento]['latitud'] = NULL;

				if ($oferta['logoEstablecimiento'])
					$misEstab[$id_establecimiento]['logo'] = $oferta['logoEstablecimiento'];
				else
					$misEstab[$id_establecimiento]['logo'] = NULL;

				if (!empty($oferta['direccion_establecimiento']))
					$misEstab[$id_establecimiento]['direccion'] = $oferta['direccion_establecimiento'];

				$misEstab[$id_establecimiento]['contactos'] = $this->getContactos($oferta['id_tbl_usuario']);

				$galeria = $this->getGaleriaInfo(array($oferta['id_info_establecimiento']), $id);
				if (!$galeria == false)
					$misEstab[$id_establecimiento]['galeria'] = $galeria;
				else
					$misEstab[$id_establecimiento]['galeria'] = array(array('descripcion' => null, 'img' => $misEstab[$id_establecimiento]['logo']));

				$serviciosEst = $this->getServiceEstablecimiento($id_establecimiento);

				$misEstab[$id_establecimiento]['serviciosEst'] = $serviciosEst['serviciosEstablecimiento']['1']['items'];

				$this->serviciosFiltro[$id_establecimiento]       = $serviciosEst['serviciosEstablecimiento']['1']['items'];
				$this->serviciosHabEstFiltro[$id_establecimiento] = ($serviciosEst['serviciosEstablecimiento']['2']['items']);
				$this->incluyeEstFiltro[$id_establecimiento]      = $serviciosEst['serviciosOferta']['2']['items'];
				$this->adicionalesEstFiltro[$id_establecimiento]  = $serviciosEst['serviciosOferta']['5']['items'];

				$misEstab[$id_establecimiento]['sistemaServEst']    = $serviciosEst['serviciosOferta']['1']['items'];
				$misEstab[$id_establecimiento]['serviciosHabEst']   = ($serviciosEst['serviciosEstablecimiento']['2']['items']);
				$misEstab[$id_establecimiento]['incluyeEst']        = $serviciosEst['serviciosOferta']['2']['items'];
				$misEstab[$id_establecimiento]['noIncluyeEst']      = $serviciosEst['serviciosOferta']['3']['items'];
				$misEstab[$id_establecimiento]['restriccionesEst']  = $serviciosEst['serviciosOferta']['4']['items'];
				$misEstab[$id_establecimiento]['adicionalesEst']    = $serviciosEst['serviciosOferta']['5']['items'];

				$misOfertas[$llave]['tituloOferta'] = utf8_encode($oferta['tituloOferta']);
				$misOfertas[$llave]['ninos']   = $oferta['ninos'] > 0 ? $oferta['ninos'] : NULL;
				$misOfertas[$llave]['adultos'] = $oferta['adultos'] > 0 ? $oferta['adultos'] : NULL;
				$misOfertas[$llave]['dias']    = $oferta['dias'] > 0 ? $oferta['dias'] : NULL;
				$misOfertas[$llave]['noches']  = $oferta['noches'] > 0 ? $oferta['noches'] : NULL;

				switch ($data['mode']) {
					case 'filtro':
						$misOfertas[$llave]['acomodacion'] = $oferta['nombre_acomodacion'];
						$serv = $this->getServiceOferta($id_oferta);

						$misOfertas[$llave]['sistemaServiciosOferta'] = ($serv['item'][1]['items']);
						$misOfertas[$llave]['incluyeOferta']          = ($serv['item'][2]['items']);
						$misOfertas[$llave]['noIncluyeOferta']        = ($serv['item'][3]['items']);
						$misOfertas[$llave]['restriccionesOferta']    = ($serv['item'][4]['items']);
						$misOfertas[$llave]['AplicaEnOferta']         = ($serv['item'][6]['items']);

						$valores = array_values($serv['item'][6]['items']);
						$texto_unido = implode(" / ", $valores);
						$misOfertas[$llave]['aplicaen'] = $texto_unido;
						break;

					case 'detalle':
						$misOfertas[$llave]['impresion'] = SITE_VE . 've/certificado_club.php?dat=&idRegistro=' . $id . '&tipo=1&mascara=&pestana=&siIdUsuario=' . $data['id_tbl_usuario'];

						if (!empty($oferta['nombre_acomodacion']))
							$misOfertas[$llave]['detalle']['acomodacion'] = $oferta['nombre_acomodacion'];

						$servicioOferta = $this->getServiceOferta($id_oferta);
						if (!$this->detalleServicios)
							$this->detalleServicios = $this->getTipoDetalleSmart();

						foreach ($this->detalleServicios as $key => $tipoDet) {
							unset($tempo);
							if (isset($servicioOferta['texto'][$tipoDet['nombre']]) and !empty($servicioOferta['texto'][$tipoDet['nombre']]))
								$tempo[$tipoDet['nombre']][] = $servicioOferta['texto'][$tipoDet['nombre']];
							if (isset($servicioEst['textoServiciosOferta'][$tipoDet['nombre']]) and !empty($servicioEst['textoServiciosOferta'][$tipoDet['nombre']]))
								$tempo[$tipoDet['nombre']][] = $servicioEst['textoServiciosOferta'][$tipoDet['nombre']];
							if (isset($tempo[$tipoDet['nombre']]))
								$misOfertas[$llave]['detalle'][$tipoDet['nombre']] = implode(' - ', $tempo[$tipoDet['nombre']]);
						}

						if (isset($servicioEst['textoServiciosEstablecimiento'])) {
							foreach ($servicioEst['textoServiciosEstablecimiento'] as $key => $serv)
								$newServ[] = array('nombre' => utf8_encode($key), 'valor' => ($serv));
						}
						$misEstab[$id_establecimiento]['servicios'] = ($newServ);

						foreach ($misOfertas[$llave]['detalle'] as $key => $det)
							$newDet[] = array('nombre' => $key, 'valor' => utf8_encode($det));
						if (!empty($oferta['detalleOferta']))
							$newDet[] = array('nombre' => 'Detalle', 'valor' => utf8_encode($oferta['detalleOferta']));
						$misOfertas[$llave]['detalle'] = $newDet;

						$misEstab[$id_establecimiento]['id_info'] = $oferta['id_info_establecimiento'];

						$galeria = $this->getGaleriaInfo(array($oferta['id_info_establecimiento']), $id);
						if (!$galeria == false)
							$misEstab[$id_establecimiento]['galeria'] = $galeria;
						else
							$misEstab[$id_establecimiento]['galeria'] = array(array('descripcion' => null, 'img' => $misEstab[$id_establecimiento]['logo']));
						break;

					default:
						break;
				}

				$demoestablecimientos[$id_establecimiento] = $misEstab[$id_establecimiento];

				if ($tipoConsulta === "establecimiento" or $tipoConsulta == "")
					$demoestablecimientos[$id_establecimiento]['estadoBusqueda'] = $oferta['estadoBusqueda'];
				else
					$demoestablecimientos[$id_establecimiento]['estadoBusqueda'] = 'B';

				$misOfertas[$llave]['ganga'] = $ganga = false;
				if (isset($arrayPreciosNuevos[$oferta['id_tbl_oferta']]) and $arrayPreciosNuevos[$oferta['id_tbl_oferta']] > 0) {
					$misOfertas[$llave]['ganga'] = $ganga = true;
					$misOfertas[$llave]['txtGanga'] = $this->txtGanga;
					$oferta['precioOferta'] = $arrayPreciosNuevos[$oferta['id_tbl_oferta']];
				}

				$unFormatTarifaRack  = $this->configApp['conversion'] * $oferta['costoRack'];
				$unFormatTarifaFinal = $this->configApp['conversion'] * $oferta['precioOferta'];

				$tarifaRack  = intval(number_format($this->configApp['conversion'] * $oferta['costoRack'], "0", ",", "."));
				$tarifaFinal = intval(number_format($this->configApp['conversion'] * $oferta['precioOferta'], "0", ",", "."));
				$tarifaDiferencia = $unFormatTarifaRack - $unFormatTarifaFinal;
				$data['metodo'];

				switch ($data['metodo']) {
					case 've':
					default:
						$intTarifaRack  = intval($unFormatTarifaRack);
						$intTarifaFinal = intval($unFormatTarifaFinal);

						// (C.1) Eliminada la subquery $contrato (factorImpuesto) — no se usaba.

						$Total = obtenerPrecioTotal($nochesSeleccionadas, $misOfertas[$llave]['noches'], round($unFormatTarifaFinal));

						switch ($oferta['idBeneficio']) {
							case '2': // Charter
								$misOfertas[$llave]['cashback'] = round($unFormatTarifaRack - $unFormatTarifaFinal);
								break;
							case '7':
								$disponibilidad = $this->getDisponibilidadRemate($oferta['id_tbl_oferta']);
								$misOfertas[$llave]['disponible'] = $disponibilidad;
								break;
							default:
								$base = round($unFormatTarifaFinal);
								break;
						}

						$tmpIva  = ($misEstab[$id_establecimiento]['noIncluyeEst']['141']);
						$tmpServ = ($misEstab[$id_establecimiento]['noIncluyeEst']['142']);
						$iva  = isset($tmpIva) ? (int)preg_replace('/[^0-9]/', '', $tmpIva) : 0;
						$serv = isset($tmpServ) ? (int)preg_replace('/[^0-9]/', '', $tmpServ) : 0;
						$impYserv = ($iva + $serv) / 100;

						// (B) usa $esSuscriptor ya calculado fuera del loop
						$valorExtraNoSuscriptor = 0;
						if (!$esSuscriptor)
							$valorExtraNoSuscriptor = ($id_establecimiento == 443) ? 3 : 10;

						$numNoches = $nochesSeleccionadas > 0 ? $nochesSeleccionadas : 1;

						$sinImpuestos = round(round($Total + ($valorExtraNoSuscriptor * $numNoches)) / (1 + $impYserv));
						$impuestos    = round(round($Total + ($valorExtraNoSuscriptor * $numNoches)) - $sinImpuestos);
						$rack  = obtenerPrecioTotal($numNoches, $misOfertas[$llave]['noches'], round($unFormatTarifaRack));
						$final = round($Total + ($valorExtraNoSuscriptor * $numNoches));
						$ahorro = $rack - $final;

						$misOfertas[$llave]['base']         = isset($base) ? $base : null;
						$misOfertas[$llave]['impuestos']    = round($impuestos);
						$misOfertas[$llave]['sinImpuestos'] = $sinImpuestos;
						$misOfertas[$llave]['rack']         = $rack;
						$misOfertas[$llave]['final']        = $final;
						$misOfertas[$llave]['ahorro']       = $ahorro;
						break;
				}

				$misOfertas[$llave]['ciudad']    = utf8_encode($oferta['ciudadOferta']);
				$misOfertas[$llave]['provincia'] = utf8_encode($oferta['provinciaOferta']);
				$misOfertas[$llave]['personas']  = $this->generarTextoPersonas($oferta['adultos'], $oferta['ninos']);
				$misOfertas[$llave]['tiempo']    = $this->generarTextoTiempo($oferta['dias'], $oferta['noches']);

				$fotoPrin = '';
				if (!empty($oferta['fotoOfertaPrin']))
					$fotoPrin = $oferta['fotoOfertaPrin'];
				else if (!empty($oferta['fotoEstablecimientoPrin']))
					$fotoPrin = $oferta['fotoEstablecimientoPrin'];
				else if (!empty($oferta['logoEstablecimiento']))
					$fotoPrin = $oferta['logoEstablecimiento'];
				$misOfertas[$llave]['foto'] = $fotoPrin;

				$misOfertas[$llave]['estiloBeneficio'] = $oferta['estiloBeneficio'];
				$misOfertas[$llave]['idBeneficio']     = intval($oferta['idBeneficio']);
				$misOfertas[$llave]['colorBeneficio']  = $oferta['colorBeneficio'];

				switch ($oferta['idPaisOferta']) {
					case $this->configApp['idpais']:
						$misOfertas[$llave]['localidad'] = 'nacional';
						break;
					default:
						$misOfertas[$llave]['localidad'] = 'internacional';
						break;
				}

				$misOfertas[$llave]['incluye'] = 'Impuesto';

				$arrayTodasOfertas[$oferta['id_tbl_oferta']]               = $oferta['id_tbl_oferta'];
				$arrayTodosEstablecimientos[$oferta['id_tbl_establecimiento']] = $oferta['id_tbl_establecimiento'];
				$itemsSeleccionados[$oferta['id_tbl_establecimiento']][$oferta['id_tbl_oferta']] = $oferta['id_tbl_oferta'];

				switch ($data['mode']) {
					case 'full':
						$ofertasR[$oferta['id']]['tipo']      = $Establecimientos[$oferta['id_tbl_establecimiento']]['tipo'];
						$ofertasR[$oferta['id']]['logo']      = $Establecimientos[$oferta['id_tbl_establecimiento']]['logo'];
						$ofertasR[$oferta['id']]['direccion'] = $Establecimientos[$oferta['id_tbl_establecimiento']]['direccion'];
						$ofertasR[$oferta['id']]['ciudad']    = $Establecimientos[$oferta['id_tbl_establecimiento']]['ciudad'];
						$ofertasR[$oferta['id']]['provincia'] = $Establecimientos[$oferta['id_tbl_establecimiento']]['provincia'];
						$ofertasR[$oferta['id']]['region']    = $Establecimientos[$oferta['id_tbl_establecimiento']]['region'];
						$ofertasR[$oferta['id']]['pais']      = $Establecimientos[$oferta['id_tbl_establecimiento']]['pais'];
						break;
					default:
						break;
				}
			}

			$ofertasTodoIncluido = $this->resultadoTodoIncluidoServicios($arrayTodasOfertas, $arrayTodosEstablecimientos, $itemsSeleccionados);
			$ofertasAprobada     = $this->resultadoDesayunoServicios($arrayTodasOfertas, $arrayTodosEstablecimientos, $itemsSeleccionados);

			foreach ($misOfertas as $key => $mioferta) {
				if (isset($ofertasTodoIncluido[$mioferta['id_oferta']])) {
					$misOfertas[$key]['incluye'] = 'Todo incluido';
				} else if (isset($ofertasAprobada[$mioferta['id_oferta']])) {
					$misOfertas[$key]['incluye'] = 'Desayuno - ' . $misOfertas[$key]['incluye'];
				}
			}

			foreach ($misOfertas as $key => $ofertax) {
				$ofNoches = ($ofertax['noches'] == null or empty($ofertax['noches'])) ? 1 : $ofertax['noches'];
				if ((intval($nochesSeleccionadas) % intval($ofNoches)) == 0) {
					$demoestablecimientos[$ofertax['id_establecimiento']]['ofertas'][$ofertax['id']] = $ofertax;
					unset($ofertax['id_establecimiento']);
				}
			}

			foreach ($demoestablecimientos as $key => $demoest) {
				$demoest['favorito'] = $this->getHotelFavorito($data['id_tbl_usuario'], $key);
				$coments = $this->getComents($key);

				if ($coments['puntuacion']) {
					$demoest['comentarios'] = [
						"puntuacion"          => $coments['puntuacion'],
						"calificacion"        => $coments['calificacion'],
						"cantidadComentarios" => $coments['cantidadComentarios'],
					];
				} else {
					$demoest['comentarios'] = [
						"puntuacion"          => "10",
						"calificacion"        => "Excepcional",
						"cantidadComentarios" => 1,
					];
				}

				$demoest['id_establecimiento'] = $key;

				$ListaOfertas = [];
				foreach ($demoest['ofertas'] as $oferta) {
					if (isset($oferta['id'], $oferta['sinImpuestos']) and !$this->ofertaAgotadaAhora($oferta, isset($fechas['inicio']) ? $fechas['inicio'] : null)) {
						$ListaOfertas[] = [
							'id'           => $oferta['id'],
							'adultos'      => $oferta['adultos'],
							'ninos'        => ($oferta['ninos'] !== null) ? $oferta['ninos'] : 0,
							'final'        => $oferta['final'],
							'rack'         => $oferta['rack'],
							'impuestos'    => $oferta['impuestos'],
							'sinImpuestos' => $oferta['sinImpuestos']
						];
					}
				}

				$MejorOferta = obtenerOfertasRecomendadas($pax['adultos'], $pax['ninos'], $ListaOfertas);
				$demoest['recomendados'] = $MejorOferta;

				$sumaPreciosSinImp = 0;
				$sumaPrecios = 0;
				$sumaRack = 0;
				$sumaImpuesto = 0;
				foreach ($MejorOferta as $oferta) {
					$sumaPrecios       += $oferta['final'] * $oferta['numOfertas'];
					$sumaRack          += $oferta['rack'] * $oferta['numOfertas'];
					$sumaImpuesto      += $oferta['impuestos'] * $oferta['numOfertas'];
					$sumaPreciosSinImp += $oferta['sinImpuestos'] * $oferta['numOfertas'];
				}
				$demoest['precioRecomendadoRack']      = round($sumaRack);
				$demoest['precioRecomendadoFinal']     = round($sumaPrecios);
				$demoest['precioRecomendadoImpuestos'] = round($sumaImpuesto);
				$demoest['precioRecomendadoSinImp']    = round($sumaPreciosSinImp);
				$demoEstablecimiento[] = $demoest;
			}

			if (isset($Establecimientos))
				foreach ($Establecimientos as $id => $esta) {
					$arrayIdEst[] = $id;
					$temp = $this->getServiceEstablecimiento($id);
					if (isset($temp['textoDetalles']))
						$Establecimientos[$id]['textodetalle'] = $temp['textoDetalles'];
					$Establecimientos[$id]['detalleTxt']   = $temp['servicios']['texto'];
					$Establecimientos[$id]['detalleItems'] = $temp['servicios']['item'];
					$Establecimientos[$id]['detalle']      = $temp['detalle'];
				}

			/*******************************************************************************
			 * OBTENER INFORMACION para FILTRO GENERAL
			 */
			if (!$establecimientoTotales = $this->getEstablecimientosFiltro($txtWhereFiltro))
				throw new Exception($this->error, $this->codeerror);

			$serviciosEstablecimientoTotal = $this->getServiceEstablecimiento($establecimientoTotales['id']);

			$catalogaciones = $this->find("all", array(
				"select" => "count(distinct(id_tbl_establecimiento)) total,catalogacion,concat(catalogacion, ' estrellas ') nombre",
				"from"   => 'vista_ofertas_activas voa ',
				"where"  => $txtWhereFiltro,
				"group"  => 'catalogacion'
			));

			$pestanas       = $this->getTipoOfertas();
			$pestanasFiltro = $this->getTipoOfertasFiltro($txtWhereFiltro);
			$locacion[1]    = $pestanas['1'];
			$locacion[6]    = $pestanas['6'];

			/*******************************************************************************
			 * datos de orden
			 */
			switch ($beneficio) {
				case '4':
					$this->opcionesOrden = array(
						"4_1" => array("name" => "Ahorro", "text" => "Menor a mayor"),
						"4_2" => array("name" => "Ahorro", "text" => "Mayor a menor"),
					);
					break;
				case '':
				default:
					break;
			}

			/*******************************************************************************
			 * RESULTADOS FINALES
			 */
			$this->establecimientosdemo = $demoEstablecimiento;
			$this->resultadotexto       = $txtMsjResultado;
			$this->ofertas              = $misOfertas;
			$this->establecimientos     = $misEstab;

			$menorPrecio = array_reduce($demoEstablecimiento, function ($menor, $oferta) {
				return min($menor, $oferta['precioRecomendadoSinImp']);
			}, PHP_FLOAT_MAX);

			$mayorPrecio = array_reduce($demoEstablecimiento, function ($mayor, $oferta) {
				return max($mayor, $oferta['precioRecomendadoSinImp']);
			}, PHP_FLOAT_MIN);

			$this->filtro['precios']         = ['MaxPrecio' => $mayorPrecio, 'MinPrecio' => $menorPrecio];
			$this->filtro['servicios']       = $this->arrayElementosUnicos($this->$serviciosFiltro);
			$this->filtro['serviciosHabEst'] = $this->arrayElementosUnicos($this->serviciosHabEstFiltro);
			$this->filtro['incluyeEst']      = $this->arrayElementosUnicos($this->incluyeEstFiltro);
			$this->filtro['personas']        = $totalPersonas;
			$this->filtro['tiempo']          = $totalTiempo;

			return true;

		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
public function verROfertas($data)
{
    try {
        if (count($this->rangofechas) == 0)
            $rangofec = $this->rangofechas['inicio'] . ' - ' . $this->rangofechas['fin'];

        if (!$this->configApp)
            $this->configApp = $this->app->getConfig(array('id_servicio' => $data['id_servicio']));

        if (isset($data['nitems']) and $data['nitems'] > 0)
            $nPorPagina = $data['nitems'];
        else
            $nPorPagina = $this->configApp['oferta_n_X_Pagina'];
        $nPagSigAnt = $this->configApp['oferta_nPagSigAnt'];

        $orden = empty($data['ordenar']) ? explode('_', $this->configApp['oferta_orden_default']) : explode('_', $data['ordenar']);

        $tipoConsulta = ($data['tipo']);
        $evento = ($data['evento']);
        $idConsulta = ($data['id']);
        $destino = ($data['txtBusqueda']);
        $txtBusqueda = $this->sanearString($data['txtBusqueda']);
        $idEstablecimiento = $data['id_establecimiento'];

        if (isset($data['beneficios']))
            if (!(count($data['beneficios']) > 0 and is_array($data['beneficios'])))
                throw new Exception("Informacion de beneficios debe ser array o contener informacion", 1001);
        $beneficio = $data['beneficios'];

        if (isset($data['idservicios']))
            if (!(count($data['idservicios']) > 0 and is_array($data['idservicios'])))
                throw new Exception("Informacion de servicios debe ser array o contener informacion", 1001);
        $idsServicios = $data['idservicios'];

        if (isset($data['personas']))
            if (!(count($data['personas']) > 0 and is_array($data['personas'])))
                throw new Exception("Informacion de personas debe ser array o contener informacion", 1001);
        $idAdultosNinos = $data['personas'];

        if (isset($data['tiempo']))
            if (!(count($data['tiempo']) > 0 and is_array($data['tiempo'])))
                throw new Exception("Informacion de tiempo debe ser array o contener informacion", 1001);
        $idDiasNoches = $data['tiempo'];

        if (isset($data['precio']))
            if (!(count($data['precio']) > 0 and is_array($data['precio'])))
                throw new Exception("Informacion de precio debe ser array o contener informacion", 1001);
        $valorPrecios = [0, 10000];

        if (isset($data['habitaciones']))
            if (!(count($data['habitaciones']) > 0 and is_array($data['habitaciones'])))
                throw new Exception("Informacion de habitaciones debe ser array o contener informacion", 1001);
        $idHabitaciones = $data['habitaciones'];

        if (isset($data['pax'])) {
            if (!$data['pax']['adultos'] > 0)
                throw new Exception("Debe tener por lo menos 1 adulto", 1);
        }
        $pax = $data['pax'];

        if (isset($data['fechas'])) {
            $fechas = $data['fechas'];
        }

        if ($data['pag'] > 1)
            $pagSeleccionada = ($data['pag']);
        else
            $pagSeleccionada = 1;

        if (isset($data['id_oferta']))
            if (is_array($data['id_oferta']))
                $idsOfertas = $data['id_oferta'];
            else
                $idsOfertas = explode(',', $data['id_oferta']);

        if (isset($data['localidad']) and !empty($data['localidad']))
            $localidad = explode("::", ($data['localidad']));

        if ($data['mode'] != 'historial') {
            $arrayWhereOfertas[] = 'of.id_tbl_activacion = 1';
            $arrayWhereOfertas[] = 'DATE(NOW()) BETWEEN DATE(of.fecha_inicio) AND DATE(of.fecha_fin)';
            $arrayWhereOfertas[] = 'DATE(NOW()) BETWEEN DATE(cont.fecha_ini) AND DATE(cont.fecha_fin)';
            $arrayWhereOfertas[] = 'est.id_tbl_estado_modificacion = 3';
            $arrayWhereOfertas[] = 'of.id_tbl_estado_modificacion = 3';
            $arrayWhereOfertas[] = 'tbs.mostrar = 1';
			$arrayWhereOfertas[] = 'infest.id_tbl_servicio IN (30, 92)';
        }

        switch (count($this->configApp['id_beneficios'])) {
            case '1':
                $arrayWhereOfertas[] = 'of.id_tbl_tipo_beneficio_suscripcion = ' . $this->configApp['id_beneficios'][0];
                break;
            default:
                $arrayWhereOfertas[] = 'of.id_tbl_tipo_beneficio_suscripcion in(' . implode(',', $this->configApp['id_beneficios']) . ')';
                break;
        }

        switch (count($this->configApp['id_empresa'])) {
            case '1':
                $arrayWhereOfertas[] = 'ofeemp.id_tbl_empresa = ' . $this->configApp['id_empresa'][0];
                break;
            default:
                $arrayWhereOfertas[] = 'ofeemp.id_tbl_empresa in(' . implode(',', $this->configApp['id_empresa']) . ')';
                break;
        }

        switch (count($this->configSuscriptor['id_beneficios'])) {
            case '1':
                $arrayWhereOfertas[] = 'of.id_tbl_tipo_beneficio_suscripcion = ' . $this->configSuscriptor['id_beneficios'][0];
                break;
            default:
                $arrayWhereOfertas[] = 'of.id_tbl_tipo_beneficio_suscripcion in(' . implode(',', $this->configSuscriptor['id_beneficios']) . ')';
                break;
        }

        if ($idEstablecimiento > 0)
            $arrayWhereOfertas[] = 'est.id_tbl_establecimiento = ' . $idEstablecimiento;

        if (isset($idsOfertas)) {
            switch (count($idsOfertas)) {
                case '1':
                    $arrayWhereOfertas[] = 'infoof.id_tbl_info_indice = ' . array_shift($idsOfertas) . '';
                    break;
                default:
                    $arrayWhereOfertas[] = 'infoof.id_tbl_info_indice in (' . implode(',', $idsOfertas) . ')';
                    break;
            }
        }

        if ($localidad) {
            switch ($localidad[0]) {
                case 'nacional':
                    $arrayWhereOfertas[] = ' paisof.id_tbl_lugar = ' . $this->configApp['idpais'];
                    break;
                case 'internacional':
                    $arrayWhereOfertas[] = ' paisof.id_tbl_lugar != ' . $this->configApp['idpais'];
                    break;
                default:
                    break;
            }
        }

        if ($data['precio'])
            $arrayWhereOfertas[] = '(round(of.precio_oferta, 2)  between ' . $valorPrecios[0] . ' and ' . $valorPrecios[1] . ' )';

        if ($data['tiempo']) {
            foreach ($idDiasNoches as $key => $dn) {
                $dn = explode("-", $dn);
                $arrayDN[] = "(of.dias = " . $dn[0] . " and of.noches = " . $dn[1] . ")";
            }
            $arrayWhereOfertas[] = "(" . implode(" or ", $arrayDN) . ")";
        }

        if ($data['personas']) {
            foreach ($idAdultosNinos as $key => $an) {
                $an = explode("-", $an);
                $arrayAN[] = "(of.adultos = " . $an[0] . " and of.ninos = " . $an[1] . ")";
            }
            $arrayWhereOfertas[] = "(" . implode(" or ", $arrayAN) . ")";
        }

        if ($data['idservicios']) {
            switch (count($idsServicios)) {
                case '1':
                    $arrayWhereEstablecimientoPorServicio[] = 'id_tbl_establecimiento = ' . $idsServicios[0] . ' ';
                    break;
                default:
                    $arrayWhereEstablecimientoPorServicio[] = 'id_tbl_establecimiento in (' . implode(',', $idsServicios) . ') ';
                    break;
            }
            $establecimientoPorServicio = $this->find('all', array(
                'select' => 'distinct(id_tbl_establecimiento) id',
                'from' => 'tbl_dtl_servicio_establecimiento',
                'where' => $arrayWhereEstablecimientoPorServicio,
            ));
            if ($establecimientoPorServicio) {
                foreach ($establecimientoPorServicio as $llave => $est)
                    $arrayEstablecimeintoPorServicio[] = $est['id'];
                $arrayWhereOfertas[] = 'est.id_tbl_establecimiento in (' . implode(',', $arrayEstablecimeintoPorServicio) . ')';
            }
        }

        if ($idHabitaciones) {
            switch (count($idHabitaciones)) {
                case '1':
                    $arrayWhereOfertas[] = 'of.habitaciones = ' . $idHabitaciones[0] . ' ';
                    break;
                case '':
                    break;
                default:
                    $arrayWhereOfertas[] = 'of.habitaciones in (' . implode(',', $idHabitaciones) . ') ';
                    break;
            }
        }

        if ($pax) {
            $totalNinosAdultos = 0;
            if (isset($pax['ninos'])) {
                $totalninos = $pax['ninos'];
                foreach ($edadninos as $key => $edadnino) {
                    if ($edadnino > 11) {
                        $totalNinosAdultos++;
                        $totalninos--;
                    }
                }
                $arrayCabacera[] = 'of.ninos = ' . $totalninos;
            }
            if (isset($pax['adultos'])) {
                $totalAdultos = $pax['adultos'] + $totalNinosAdultos;
                $arrayCabacera[] = 'of.adultos = ' . $totalAdultos;
            }
        }

        if ($fechas) {
            $arrayWhereOfertas[] = '( "' . $fechas['inicio'] . '" between of.fecha_inicio   and   of.fecha_fin  )';
            $semana['entre'] = ['1' => 1, '2' => 2, '3' => 3, '4' => 4];
            $semana['fin'] = ['5' => 5, '6' => 'Sabadp', '7' => 7];
            for ($i = 0; $i < $nochesSeleccionadas; $i++) {}
            $fecha1 = new DateTime($fechas['inicio']);
            $fecha2 = new DateTime($fechas['fin']);
            $difererenciaDias = $fecha1->diff($fecha2);
            $nochesSeleccionadas = $difererenciaDias->days;
            $diaInicioSemana = date("w", strtotime($fechas['inicio']));
            $arrayCabacera[] = 'of.noches = ' . $nochesSeleccionadas;
        }

        if (isset($beneficio))
            foreach ($beneficio as $key => $ben) {
                switch ($ben) {
                    case '6':
                        $arrayWhereOfertasPorPais[] = ' paisof.id_tbl_lugar != ' . $this->configApp['idpais'];
                        break;
                    default:
                        $arrayWhereOfertasBeneficio[] = 'of.id_tbl_tipo_beneficio_suscripcion=' . $ben;
                        break;
                }
                if (isset($arrayWhereOfertasPorPais))
                    $arrayWhereOfertas[] = implode(' or ', $arrayWhereOfertasPorPais);
                if (isset($arrayWhereOfertasBeneficio))
                    $arrayWhereOfertas[] = implode(' or ', $arrayWhereOfertasBeneficio);
            }

        $subWhere[] = "of.id_tbl_activacion = 1";
        $subWhere[] = "DATE(NOW()) BETWEEN DATE( of.fecha_inicio ) ";
        $subWhere[] = " DATE( of.fecha_fin ) ";
        $subWhere[] = "DATE(NOW()) BETWEEN DATE( cont.fecha_ini ) ";
        $subWhere[] = "DATE( cont.fecha_fin ) ";
        $subWhere[] = "est.id_tbl_estado_modificacion = 3 ";
        $subWhere[] = "of.id_tbl_estado_modificacion = 3 ";
        $subWhere[] = "of.id_tbl_tipo_beneficio_suscripcion IN ( 1, 2, 5, 6, 7, 8, 9, 10, 12 ) ";
        $subWhere[] = "ofeemp.id_tbl_empresa = 1 ";
        $subWhere[] = "of.id_tbl_tipo_beneficio_suscripcion IN ( 1, 5, 7, 12, 2, 10, 9, 8 )";
		$subWhere[] = "infest.id_tbl_servicio IN (30, 92)";
        if ($fechas)
            $subWhere[] = '( "' . $fechas['inicio'] . '" between of.fecha_inicio   and   of.fecha_fin  )';
        $subWhere[] = 'REPLACE (REPLACE(CONCAT_WS(" ",TRIM(REPLACE ( infest.titulo, "-", "" )),paisest.desc_lugar,regest.desc_lugar,provest.desc_lugar,l.desc_lugar),"  "," "),"  "," ") like "%' . $txtBusqueda . '%"';

        $dato = $this->find('all', array(
            'select' => 'est.id_tbl_establecimiento,l.id_tbl_lugar',
            'from' => 'tbl_oferta of
                JOIN tbl_producto prd ON ( prd.id_tbl_producto = of.id_tbl_producto )
                JOIN tbl_establecimiento est ON ( est.id_tbl_establecimiento = prd.id_tbl_establecimiento )
                JOIN tbl_contrato cont ON cont.id_tbl_establecimiento = est.id_tbl_establecimiento
                JOIN tbl_info_indice infoof ON infoof.id_tbl_info_indice = prd.id_tbl_info_indice
                JOIN tbl_info_indice infest ON infest.id_tbl_info_indice = est.id_tbl_info_indice
                JOIN tbl_oferta_empresa ofeemp ON ( ofeemp.id_tbl_oferta = of.id_tbl_oferta )
                JOIN tbl_lugar l ON l.id_tbl_lugar = infest.id_tbl_lugar
                JOIN tbl_lugar provest ON provest.id_tbl_lugar = l.id_tbl_lugarpadre
                JOIN tbl_lugar regest ON regest.id_tbl_lugar = provest.id_tbl_lugarpadre
                JOIN tbl_lugar paisest ON paisest.id_tbl_lugar = regest.id_tbl_lugarpadre',
            'where' => $subWhere,
            'group' => 'id_tbl_lugar'
        ));

        $idTblLugar = '(';
        $idTblLugarCiudad = "(";
        $idsEstable = '(';
        foreach ($dato as $datos) {
            $idTblLugar .= 'lugarof.id_tbl_lugar = "' . $datos['id_tbl_lugar'] . '" OR ';
            $idTblLugarCiudad .= 'voa.idCiudad = "' . $datos['id_tbl_lugar'] . '" OR ';
            $idsEstable .= 'est.id_tbl_establecimiento ="' . $datos['id_tbl_establecimiento'] . '" OR ';
        }
        $idTblLugar = rtrim($idTblLugar, ' OR ');
        $idsEstable = rtrim($idsEstable, ' OR ');
        $idTblLugarCiudad = rtrim($idTblLugarCiudad, ' OR ');
        $idTblLugar .= ")";
        $idsEstable .= ")";
        $idTblLugarCiudad .= ")";

        switch ($tipoConsulta) {
            case 'establecimiento':
                if ($idConsulta > 0) {
                    if (!empty($dato) && isset($dato))
                        $arrayWhereOfertas[] = $idTblLugar;
                    $txtWhereFiltro[] = $idTblLugarCiudad;
                }
                $txtMsjResultado = "|nOfertas| en $txtBusqueda";
                break;
            case 'destino':
                if ($idConsulta > 0) {
                    if (!empty($dato) && isset($dato))
                        $arrayWhereOfertas[] = $idTblLugar;
                }
                $txtWhereFiltro[] = 'voa.idCiudad = "' . $idConsulta . '"';
                $txtMsjResultado = "|nOfertas| en |nEstablecimiento| en $txtBusqueda";
                break;
            case '':
    if (!empty($dato) && isset($dato) && (count($idsOfertas)) < 2 && $data['mode'] !== "detalle") {
        $arrayWhereOfertas[] = $idTblLugar;
    } else if (!empty($txtBusqueda)) {
        $arrayWhereOfertas[] = 'infest.titulo LIKE "%' . $txtBusqueda . '%"';
    }
    $txtWhereFiltro[] = $idTblLugarCiudad;
    $txtMsjResultado = "|nOfertas| en $txtBusqueda";
    break;
        }

        switch ($orden[1]) {
            case '1':
                $via = "asc";
                break;
            case '2':
                $via = "desc";
                break;
            default:
                $via = "asc";
                break;
        }

        switch ($orden[0]) {
            case '1':
                $txtOrderBy = "of.fecha_inicio ";
                break;
            case '2':
                $txtOrderBy = " of.precio_oferta ";
                break;
            case '3':
                $txtOrderBy = " infest.titulo ";
                break;
            case '4':
                $txtOrderBy = " of.costo_rack ";
                break;
            case '5':
                $txtOrderBy = " lugarof.desc_lugar ";
                break;
            case '6':
                $txtOrderBy = " if((provof.id_tbl_tipo_lugar = 1),provof.desc_lugar,  if((paisof.id_tbl_tipo_lugar = 1), paisof.desc_lugar, _latin1'')) ";
                break;
            case '7':
                $txtOrderBy = " ((of.costo_rack-of.precio_oferta) * " . $this->configApp['conversion'] . ") /  moneda.factor_conversion ";
                break;
            default:
                $txtOrderBy = " of.fecha_inicio ";
                break;
        }

        if ($pagSeleccionada > 0)
            $paginaActual = $pagSeleccionada;
        else
            $paginaActual = 1;
        $nPaginas = ceil($this->totalOfertas / $nPorPagina);

        for ($i = 1; $i <= $nPaginas; $i++) {
            if ($paginaActual == $i)
                $txtActual = " actual ";
            else
                $txtActual = "";
            $txtSep = ($i == 1) ? "<li><span>...</span></li>" : "";
            $txtSep2 = (($nPaginas) == $i) ? "<li><span>...</span></li>" : "";
            if ($i == 1 or $i == $nPaginas or (($paginaActual - $nPagSigAnt) < $i and $i < ($paginaActual + $nPagSigAnt)))
                $txtPaginas .= " <li class='num $txtActual'><a href='#' data-pag='$i'>$i</a> </li>  ";
            elseif ($i == 2)
                $txtPaginas .= "<li><span>...</span></li>";
            elseif (($nPaginas - 1) == $i)
                $txtPaginas .= "<li><span>...</span></li>";
        }

        if ($paginaActual > 1) {
            $ant = $paginaActual - 1;
            $txtPaginas = "<li class=''><a href='?$ant' data-pag='$ant'>Anterior</a></li>" . $txtPaginas;
        } else {
            $txtPaginas = "<li class=''>Anterior</li>" . $txtPaginas;
        }

        if ($paginaActual < $nPaginas) {
            $sig = $paginaActual + 1;
            $txtPaginas .= "<li class=''><a href='?$sig' data-pag='$sig'>Siguiente</a></li>";
        } else {
            $txtPaginas .= "<li class=''>Siguiente</li>";
        }
        $desde = ($paginaActual - 1) * $nPorPagina;

        $ordenOfertas = $txtOrderBy . " " . $via;
        if (count($arrayCabacera) > 0) {
            $this->selectOfertas = $this->selectOfertas . ',if(' . $idsEstable . ',"A","B") estadoBusqueda';
            $ordenOfertas = 'estadoBusqueda,' . $ordenOfertas;
        }

        $ofertas = $this->find('all', array(
            'select' => $this->selectOfertas,
            'from' => $this->fromOfertas,
            'where' => $arrayWhereOfertas,
            'group' => 'of.id_tbl_oferta',
            'order' => $ordenOfertas,
            "limit" => "$desde, $nPorPagina",
        ));

        $this->sql = $this->lastQuery;

        foreach ($ofertas as $key => $ofs)
            $arrayIdOfertas[$ofs['id_tbl_oferta']] = $ofs['id_tbl_oferta'];

        if (count($ofertas) == 0)
            throw new Exception("No esta/n disponible/s esta/s oferta/s", 5701);
        if (!$ofertas)
            throw new Exception("No esta/n disponible/s esta/s oferta/s", 5701);

        if (count($arrayIdOfertas) > 0) {
            $semana = $this->find('all', array(
                'select' => '*',
                'from' => 'tbl_servicio_oferta so join tbl_servicio_smart sm using(id_tbl_servicio_smart)',
                'where' => 'id_tbl_servicio_smart in (92,93,96) and id_tbl_oferta in (' . implode(',', $arrayIdOfertas) . ')',
            ));
            if ($semana) {
                foreach ($semana as $ksem => $sem) {
                    $arraySemana[$sem['id_tbl_oferta']]['nombre'] = $sem['nombre_servicio_smart'];
                    $arraySemana[$sem['id_tbl_oferta']]['id'] = $sem['id_tbl_servicio_smart'];
                }
            }
        }

        $arrayPreciosNuevos = $this->listaPrecios($arrayIdOfertas, implode(' - ', $fechas));

        $txtMsjResultado = str_replace('|nOfertas|', count($ofertas) . " ofertas", $txtMsjResultado);
        if (count($ofertas) == 1)
            $txtMsjResultado = str_replace('|nOfertas|', count($ofertas) . " oferta", $txtMsjResultado);

        // Rangos de agotamiento de todas las ofertas de la página, en una sola consulta.
        $idsAgotamiento = array();
        foreach ($ofertas as $ofertaTmp) $idsAgotamiento[] = $ofertaTmp['id_tbl_oferta'];
        $agotamientosPorOferta = $this->getAgotamientosOfertas($idsAgotamiento);

        foreach ($ofertas as $llave => $oferta) {
            $id = intval($oferta['id']);
            $id_establecimiento = intval($oferta['id_tbl_establecimiento']);
            $id_oferta = intval($oferta['id_tbl_oferta']);
            $misOfertas[$llave]['id'] = $id;
            $misOfertas[$llave]['id_lugar'] = $oferta['id_tbl_lugar'];
            $misOfertas[$llave]['nombreEst'] = utf8_encode($oferta['nombreEstablecimiento']);
            $misOfertas[$llave]['id_oferta'] = $id_oferta;
            $misOfertas[$llave]['habitaciones'] = $oferta['habitaciones'];
            $misOfertas[$llave]['id_establecimiento'] = $id_establecimiento;

            // Agotamiento: lista completa de rangos (tbl_oferta_agotada). Los campos
            // fecha_hora / fecha_hora_fin se mantienen con el rango vigente o el
            // próximo, para los clientes que todavía leen un solo rango.
            $rangosAgot = isset($agotamientosPorOferta[$id_oferta]) ? $agotamientosPorOferta[$id_oferta] : array();
            $principal  = $this->rangoAgotamientoPrincipal($rangosAgot);
            $misOfertas[$llave]['agotamientos']   = $rangosAgot;
            $misOfertas[$llave]['fecha_hora']     = $principal['inicio'];
            $misOfertas[$llave]['fecha_hora_fin'] = $principal['fin'];

            $misEstab[$id_establecimiento]['titulo'] = utf8_encode($oferta['nombreEstablecimiento']);
            $misEstab[$id_establecimiento]['ciudad'] = utf8_encode($oferta['ciudadEstablecimiento']);
            $misEstab[$id_establecimiento]['pais'] = utf8_encode($oferta['paisEstablecimiento']);
            $misEstab[$id_establecimiento]['idPais'] = utf8_encode($oferta['idPaisEstablecimiento']);
            $misEstab[$id_establecimiento]['idCiudad'] = utf8_encode($oferta['id_tbl_lugar']);
            $misEstab[$id_establecimiento]['descripcionEst'] = $oferta['descripcionEst'];
            $misEstab[$id_establecimiento]['fotoHotel'] = $oferta['fotoEstablecimientoPrin'];
			$misEstab[$id_establecimiento]['tipoEstablecimiento'] = utf8_encode($oferta['tipoEstablecimiento']);

            if ($oferta['edad_nino'])
                $misEstab[$id_establecimiento]['edad_nino'] = intval($oferta['edad_nino']);
            else
                $misEstab[$id_establecimiento]['edad_nino'] = $this->configApp['edad_nino'];

            $misEstab[$id_establecimiento]['catalogacion'] = ($oferta['catalogacion'] > 0) ? $oferta['catalogacion'] : 0;

            if ($oferta['longitud'] != 0)
                $misEstab[$id_establecimiento]['longitud'] = floatval($oferta['longitud']);
            else
                $misEstab[$id_establecimiento]['longitud'] = NULL;

            if ($oferta['latitud'] != 0)
                $misEstab[$id_establecimiento]['latitud'] = floatval($oferta['latitud']);
            else
                $misEstab[$id_establecimiento]['latitud'] = NULL;

            if ($oferta['logoEstablecimiento'])
                $misEstab[$id_establecimiento]['logo'] = $oferta['logoEstablecimiento'];
            else
                $misEstab[$id_establecimiento]['logo'] = NULL;

            if (!empty($oferta['direccion_establecimiento']))
                $misEstab[$id_establecimiento]['direccion'] = $oferta['direccion_establecimiento'];

            $misEstab[$id_establecimiento]['contactos'] = $this->getContactos($oferta['id_tbl_usuario']);

            $galeria = $this->getGaleriaInfo(array($oferta['id_info_establecimiento']), $id);
            if (!$galeria == false)
                $misEstab[$id_establecimiento]['galeria'] = $galeria;
            else
                $misEstab[$id_establecimiento]['galeria'] = array(array('descripcion' => null, 'img' => $misEstab[$id_establecimiento]['logo']));

            $serviciosEst = $this->getServiceEstablecimiento($id_establecimiento);
            $misEstab[$id_establecimiento]['serviciosEst'] = $serviciosEst['serviciosEstablecimiento']['1']['items'];
            $this->serviciosFiltro[$id_establecimiento] = $serviciosEst['serviciosEstablecimiento']['1']['items'];
            $this->serviciosHabEstFiltro[$id_establecimiento] = ($serviciosEst['serviciosEstablecimiento']['2']['items']);
            $this->incluyeEstFiltro[$id_establecimiento] = $serviciosEst['serviciosOferta']['2']['items'];
			$this->adicionalesEstFiltro[$id_establecimiento] = $serviciosEst['serviciosOferta']['5']['items'];
            $misEstab[$id_establecimiento]['sistemaServEst'] = $serviciosEst['serviciosOferta']['1']['items'];
            $misEstab[$id_establecimiento]['serviciosHabEst'] = ($serviciosEst['serviciosEstablecimiento']['2']['items']);
            $misEstab[$id_establecimiento]['incluyeEst'] = $serviciosEst['serviciosOferta']['2']['items'];
            $misEstab[$id_establecimiento]['noIncluyeEst'] = $serviciosEst['serviciosOferta']['3']['items'];
            $misEstab[$id_establecimiento]['restriccionesEst'] = $serviciosEst['serviciosOferta']['4']['items'];
			$misEstab[$id_establecimiento]['adicionalesEst']   = $serviciosEst['serviciosOferta']['5']['items'];

            $misOfertas[$llave]['tituloOferta'] = utf8_encode($oferta['tituloOferta']);
            $misOfertas[$llave]['ninos'] = $oferta['ninos'] > 0 ? $oferta['ninos'] : NULL;
            $misOfertas[$llave]['adultos'] = $oferta['adultos'] > 0 ? $oferta['adultos'] : NULL;
            $misOfertas[$llave]['dias'] = $oferta['dias'] > 0 ? $oferta['dias'] : NULL;
            $misOfertas[$llave]['noches'] = $oferta['noches'] > 0 ? $oferta['noches'] : NULL;

            switch ($data['mode']) {
                case 'filtro':
                    $misOfertas[$llave]['acomodacion'] = $oferta['nombre_acomodacion'];
                    $serv = $this->getServiceOferta($id_oferta);
                    $misOfertas[$llave]['sistemaServiciosOferta'] = ($serv['item'][1]['items']);
                    $misOfertas[$llave]['incluyeOferta'] = ($serv['item'][2]['items']);
                    $misOfertas[$llave]['noIncluyeOferta'] = ($serv['item'][3]['items']);
                    $misOfertas[$llave]['restriccionesOferta'] = ($serv['item'][4]['items']);
                    $misOfertas[$llave]['AplicaEnOferta'] = ($serv['item'][6]['items']);
                    $valores = array_values($serv['item'][6]['items']);
                    $texto_unido = implode(" / ", $valores);
                    $misOfertas[$llave]['aplicaen'] = $texto_unido;
                    break;

                case 'detalle':
                    $misOfertas[$llave]['impresion'] = SITE_VE . 've/certificado_club.php?dat=&idRegistro=' . $id . '&tipo=1&mascara=&pestana=&siIdUsuario=' . $data['id_tbl_usuario'];
                    if (!empty($oferta['nombre_acomodacion']))
                        $misOfertas[$llave]['detalle']['acomodacion'] = $oferta['nombre_acomodacion'];
                    $servicioOferta = $this->getServiceOferta($id_oferta);
                    if (!$this->detalleServicios)
                        $this->detalleServicios = $this->getTipoDetalleSmart();
                    foreach ($this->detalleServicios as $key => $tipoDet) {
                        unset($tempo);
                        if (isset($servicioOferta['texto'][$tipoDet['nombre']]) and !empty($servicioOferta['texto'][$tipoDet['nombre']]))
                            $tempo[$tipoDet['nombre']][] = $servicioOferta['texto'][$tipoDet['nombre']];
                        if (isset($servicioEst['textoServiciosOferta'][$tipoDet['nombre']]) and !empty($servicioEst['textoServiciosOferta'][$tipoDet['nombre']]))
                            $tempo[$tipoDet['nombre']][] = $servicioEst['textoServiciosOferta'][$tipoDet['nombre']];
                        if (isset($tempo[$tipoDet['nombre']]))
                            $misOfertas[$llave]['detalle'][$tipoDet['nombre']] = implode(' - ', $tempo[$tipoDet['nombre']]);
                    }
                    if (isset($servicioEst['textoServiciosEstablecimiento'])) {
                        foreach ($servicioEst['textoServiciosEstablecimiento'] as $key => $serv)
                            $newServ[] = array('nombre' => utf8_encode($key), 'valor' => ($serv));
                    }
                    $misEstab[$id_establecimiento]['servicios'] = ($newServ);
                    foreach ($misOfertas[$llave]['detalle'] as $key => $det)
                        $newDet[] = array('nombre' => $key, 'valor' => utf8_encode($det));
                    if (!empty($oferta['detalleOferta']))
                        $newDet[] = array('nombre' => 'Detalle', 'valor' => utf8_encode($oferta['detalleOferta']));
                    $misOfertas[$llave]['detalle'] = $newDet;
                    $misEstab[$id_establecimiento]['id_info'] = $oferta['id_info_establecimiento'];
                    $galeria = $this->getGaleriaInfo(array($oferta['id_info_establecimiento']), $id);
                    if (!$galeria == false)
                        $misEstab[$id_establecimiento]['galeria'] = $galeria;
                    else
                        $misEstab[$id_establecimiento]['galeria'] = array(array('descripcion' => null, 'img' => $misEstab[$id_establecimiento]['logo']));
                    break;

                default:
                    break;
            }

            $demoestablecimientos[$id_establecimiento] = $misEstab[$id_establecimiento];

            if ($tipoConsulta === "establecimiento" or $tipoConsulta == "")
                $demoestablecimientos[$id_establecimiento]['estadoBusqueda'] = $oferta['estadoBusqueda'];
            else
                $demoestablecimientos[$id_establecimiento]['estadoBusqueda'] = 'B';

            $misOfertas[$llave]['ganga'] = $ganga = false;
            if (isset($arrayPreciosNuevos[$oferta['id_tbl_oferta']]) and $arrayPreciosNuevos[$oferta['id_tbl_oferta']] > 0) {
                $misOfertas[$llave]['ganga'] = $ganga = true;
                $misOfertas[$llave]['txtGanga'] = $this->txtGanga;
                $oferta['precioOferta'] = $arrayPreciosNuevos[$oferta['id_tbl_oferta']];
            }

            $unFormatTarifaRack = $this->configApp['conversion'] * $oferta['costoRack'];
            $unFormatTarifaFinal = $this->configApp['conversion'] * $oferta['precioOferta'];
            $tarifaRack = intval(number_format($this->configApp['conversion'] * $oferta['costoRack'], "0", ",", "."));
            $tarifaFinal = intval(number_format($this->configApp['conversion'] * $oferta['precioOferta'], "0", ",", "."));
            $tarifaDiferencia = $unFormatTarifaRack - $unFormatTarifaFinal;

            switch ($data['metodo']) {
                case 've':
                default:
                    $intTarifaRack = intval($unFormatTarifaRack);
                    $intTarifaFinal = intval($unFormatTarifaFinal);

                    $contrato = $this->find('all', array(
                        'select' => 'COALESCE(SUM(subtotal)/100, 0) as factorImpuesto',
                        'from' => '(
                            SELECT COALESCE(iva, 0) + COALESCE(servicios, 0) as subtotal
                            FROM tbl_contrato
                            WHERE id_tbl_establecimiento = ' . $id_establecimiento . '
                            ORDER BY id_tbl_contrato DESC
                            LIMIT 1
                        ) as subquery'
                    ))[0];

                    $Total = obtenerPrecioTotal($nochesSeleccionadas, $misOfertas[$llave]['noches'], round($unFormatTarifaFinal));

                    switch ($oferta['idBeneficio']) {
                        case '2':
                            $misOfertas[$llave]['cashback'] = round($unFormatTarifaRack - $unFormatTarifaFinal);
                            break;
                        case '7':
                            $disponibilidad = $this->getDisponibilidadRemate($oferta['id_tbl_oferta']);
                            $misOfertas[$llave]['disponible'] = $disponibilidad;
                            break;
                        default:
                            $base = round($unFormatTarifaFinal);
                            break;
                    }

                    $tmpIva = ($misEstab[$id_establecimiento]['noIncluyeEst']['141']);
                    $tmpServ = ($misEstab[$id_establecimiento]['noIncluyeEst']['142']);
                    $iva = isset($tmpIva) ? (int)preg_replace('/[^0-9]/', '', $tmpIva) : 0;
                    $serv = isset($tmpServ) ? (int)preg_replace('/[^0-9]/', '', $tmpServ) : 0;
                    $impYserv = ($iva + $serv) / 100;

                    $valorExtraNoSuscriptor = 0;
                    $esSus = $this->find('first', array(
                        'select' => 'IF( sus.id_tbl_suscripcion IS NULL, "false", "true" ) esSuscriptor',
                        'from' => 'tbl_usuario u
                                LEFT JOIN tbl_suscripcion sus ON sus.id_tbl_usuario = u.id_tbl_usuario
                                LEFT JOIN tbl_suscripcion_renovacion sr ON ( sus.id_tbl_suscripcion = sr.id_tbl_suscripcion )',
                        'where' => 'u.id_tbl_usuario =' . $data['id_tbl_usuario']
                    ));
                    if ($esSus)
                        if ($esSus['esSuscriptor'] == 'false')
                            if ($id_establecimiento == 443)
                                $valorExtraNoSuscriptor = 3;
                            else
                                $valorExtraNoSuscriptor = 10;

                    $numNoches = $nochesSeleccionadas > 0 ? $nochesSeleccionadas : 1;
                    $sinImpuestos = round(round($Total + ($valorExtraNoSuscriptor * $numNoches)) / (1 + $impYserv));
                    $impuestos = round(round($Total + ($valorExtraNoSuscriptor * $numNoches)) - $sinImpuestos);
                    $rack = obtenerPrecioTotal($numNoches, $misOfertas[$llave]['noches'], round($unFormatTarifaRack));
                    $final = round($Total + ($valorExtraNoSuscriptor * $numNoches));
                    $ahorro = $rack - $final;

                    $misOfertas[$llave]['base'] = isset($base) ? $base : null;
                    $misOfertas[$llave]['impuestos'] = round($impuestos);
                    $misOfertas[$llave]['sinImpuestos'] = $sinImpuestos;
                    $misOfertas[$llave]['rack'] = $rack;
                    $misOfertas[$llave]['final'] = $final;
                    $misOfertas[$llave]['ahorro'] = $ahorro;
                    break;
            }

            $misOfertas[$llave]['ciudad'] = utf8_encode($oferta['ciudadOferta']);
            $misOfertas[$llave]['provincia'] = utf8_encode($oferta['provinciaOferta']);
            $misOfertas[$llave]['personas'] = $this->generarTextoPersonas($oferta['adultos'], $oferta['ninos']);
            $misOfertas[$llave]['tiempo'] = $this->generarTextoTiempo($oferta['dias'], $oferta['noches']);

            $fotoPrin = '';
            if (!empty($oferta['fotoOfertaPrin']))
                $fotoPrin = $oferta['fotoOfertaPrin'];
            else if (!empty($oferta['fotoEstablecimientoPrin']))
                $fotoPrin = $oferta['fotoEstablecimientoPrin'];
            else if (!empty($oferta['logoEstablecimiento']))
                $fotoPrin = $oferta['logoEstablecimiento'];
            $misOfertas[$llave]['foto'] = $fotoPrin;

            $misOfertas[$llave]['estiloBeneficio'] = $oferta['estiloBeneficio'];
            $misOfertas[$llave]['idBeneficio'] = intval($oferta['idBeneficio']);
            $misOfertas[$llave]['colorBeneficio'] = $oferta['colorBeneficio'];

            switch ($oferta['idPaisOferta']) {
                case $this->configApp['idpais']:
                    $misOfertas[$llave]['localidad'] = 'nacional';
                    break;
                default:
                    $misOfertas[$llave]['localidad'] = 'internacional';
                    break;
            }

            $misOfertas[$llave]['incluye'] = 'Impuesto';
            $arrayTodasOfertas[$oferta['id_tbl_oferta']] = $oferta['id_tbl_oferta'];
            $arrayTodosEstablecimientos[$oferta['id_tbl_establecimiento']] = $oferta['id_tbl_establecimiento'];
            $itemsSeleccionados[$oferta['id_tbl_establecimiento']][$oferta['id_tbl_oferta']] = $oferta['id_tbl_oferta'];

            switch ($data['mode']) {
                case 'full':
                    $ofertasR[$oferta['id']]['tipo'] = $Establecimientos[$oferta['id_tbl_establecimiento']]['tipo'];
                    $ofertasR[$oferta['id']]['logo'] = $Establecimientos[$oferta['id_tbl_establecimiento']]['logo'];
                    $ofertasR[$oferta['id']]['direccion'] = $Establecimientos[$oferta['id_tbl_establecimiento']]['direccion'];
                    $ofertasR[$oferta['id']]['ciudad'] = $Establecimientos[$oferta['id_tbl_establecimiento']]['ciudad'];
                    $ofertasR[$oferta['id']]['provincia'] = $Establecimientos[$oferta['id_tbl_establecimiento']]['provincia'];
                    $ofertasR[$oferta['id']]['region'] = $Establecimientos[$oferta['id_tbl_establecimiento']]['region'];
                    $ofertasR[$oferta['id']]['pais'] = $Establecimientos[$oferta['id_tbl_establecimiento']]['pais'];
                    break;
                default:
                    break;
            }
        }

        $ofertasTodoIncluido = $this->resultadoTodoIncluidoServicios($arrayTodasOfertas, $arrayTodosEstablecimientos, $itemsSeleccionados);
        $ofertasAprobada = $this->resultadoDesayunoServicios($arrayTodasOfertas, $arrayTodosEstablecimientos, $itemsSeleccionados);

        foreach ($misOfertas as $key => $mioferta) {
            if (isset($ofertasTodoIncluido[$mioferta['id_oferta']]))
                $misOfertas[$key]['incluye'] = 'Todo incluido';
            else if (isset($ofertasAprobada[$mioferta['id_oferta']]))
                $misOfertas[$key]['incluye'] = 'Desayuno - ' . $misOfertas[$key]['incluye'];
        }

        foreach ($misOfertas as $key => $ofertax) {
            $ofNoches = ($ofertax['noches'] == null or empty($ofertax['noches'])) ? 1 : $ofertax['noches'];
            if ((intval($nochesSeleccionadas) % intval($ofNoches)) == 0) {
                $demoestablecimientos[$ofertax['id_establecimiento']]['ofertas'][$ofertax['id']] = $ofertax;
                unset($ofertax['id_establecimiento']);
            }
        }

        foreach ($demoestablecimientos as $key => $demoest) {
            $demoest['favorito'] = $this->getHotelFavorito($data['id_tbl_usuario'], $key);
            $coments = $this->getComents($key);
            if ($coments['puntuacion']) {
                $demoest['comentarios'] = [
                    "puntuacion" => $coments['puntuacion'],
                    "calificacion" => $coments['calificacion'],
                    "cantidadComentarios" => $coments['cantidadComentarios'],
                ];
            } else {
                $demoest['comentarios'] = [
                    "puntuacion" => "10",
                    "calificacion" => "Excepcional",
                    "cantidadComentarios" => 1,
                ];
            }

            $demoest['id_establecimiento'] = $key;
            $ListaOfertas = [];
            foreach ($demoest['ofertas'] as $oferta) {
                if (isset($oferta['id'], $oferta['sinImpuestos']) and !$this->ofertaAgotadaAhora($oferta, isset($fechas['inicio']) ? $fechas['inicio'] : null)) {
                    $ListaOfertas[] = [
                        'id' => $oferta['id'],
                        'adultos' => $oferta['adultos'],
                        'ninos' => ($oferta['ninos'] !== null) ? $oferta['ninos'] : 0,
                        'final' => $oferta['final'],
                        'rack' => $oferta['rack'],
                        'impuestos' => $oferta['impuestos'],
                        'sinImpuestos' => $oferta['sinImpuestos']
                    ];
                }
            }

            $MejorOferta = obtenerOfertasRecomendadas($pax['adultos'], $pax['ninos'], $ListaOfertas);
            $demoest['recomendados'] = $MejorOferta;
            $sumaPreciosSinImp = 0;
            $sumaPrecios = 0;
            $sumaRack = 0;
            $sumaImpuesto = 0;
            foreach ($MejorOferta as $oferta) {
                $sumaPrecios += $oferta['final'] * $oferta['numOfertas'];
                $sumaRack += $oferta['rack'] * $oferta['numOfertas'];
                $sumaImpuesto += $oferta['impuestos'] * $oferta['numOfertas'];
                $sumaPreciosSinImp += $oferta['sinImpuestos'] * $oferta['numOfertas'];
            }
            $demoest['precioRecomendadoRack'] = round($sumaRack);
            $demoest['precioRecomendadoFinal'] = round($sumaPrecios);
            $demoest['precioRecomendadoImpuestos'] = round($sumaImpuesto);
            $demoest['precioRecomendadoSinImp'] = round($sumaPreciosSinImp);
            $demoEstablecimiento[] = $demoest;
        }

        if (isset($Establecimientos))
            foreach ($Establecimientos as $id => $esta) {
                $arrayIdEst[] = $id;
                $temp = $this->getServiceEstablecimiento($id);
                if (isset($temp['textoDetalles']))
                    $Establecimientos[$id]['textodetalle'] = $temp['textoDetalles'];
                $Establecimientos[$id]['detalleTxt'] = $temp['servicios']['texto'];
                $Establecimientos[$id]['detalleItems'] = $temp['servicios']['item'];
                $Establecimientos[$id]['detalle'] = $temp['detalle'];
            }

        if (!$establecimientoTotales = $this->getEstablecimientosFiltro($txtWhereFiltro))
            throw new Exception($this->error, $this->codeerror);

        $serviciosEstablecimientoTotal = $this->getServiceEstablecimiento($establecimientoTotales['id']);

        $catalogaciones = $this->find("all", array(
            "select" => "count(distinct(id_tbl_establecimiento)) total,catalogacion,concat(catalogacion, ' estrellas ') nombre",
            "from" => 'vista_ofertas_activas voa ',
            "where" => $txtWhereFiltro,
            "group" => 'catalogacion'
        ));

        $pestanas = $this->getTipoOfertas();
        $pestanasFiltro = $this->getTipoOfertasFiltro($txtWhereFiltro);
        $locacion[1] = $pestanas['1'];
        $locacion[6] = $pestanas['6'];

        switch ($beneficio) {
            case '4':
                $this->opcionesOrden = array(
                    "4_1" => array("name" => "Ahorro", "text" => "Menor a mayor"),
                    "4_2" => array("name" => "Ahorro", "text" => "Mayor a menor"),
                );
                break;
            case '':
            default:
                break;
        }

        $this->establecimientosdemo = $demoEstablecimiento;
        $this->resultadotexto = $txtMsjResultado;
        $this->ofertas = $misOfertas;
        $this->establecimientos = $misEstab;

        $menorPrecio = array_reduce($demoEstablecimiento, function ($menor, $oferta) {
            return min($menor, $oferta['precioRecomendadoSinImp']);
        }, PHP_FLOAT_MAX);

        $mayorPrecio = array_reduce($demoEstablecimiento, function ($mayor, $oferta) {
            return max($mayor, $oferta['precioRecomendadoSinImp']);
        }, PHP_FLOAT_MIN);

        $this->filtro['precios'] = ['MaxPrecio' => $mayorPrecio, 'MinPrecio' => $menorPrecio];
        $this->filtro['servicios'] = $this->arrayElementosUnicos($this->$serviciosFiltro);
        $this->filtro['serviciosHabEst'] = $this->arrayElementosUnicos($this->serviciosHabEstFiltro);
        $this->filtro['incluyeEst'] = $this->arrayElementosUnicos($this->incluyeEstFiltro);
        $this->filtro['personas'] = $totalPersonas;
        $this->filtro['tiempo'] = $totalTiempo;
        return true;

    } catch (Exception $e) {
        $this->error = $e->getMessage();
        $this->codeerror = $e->getCode();
        return false;
    }
}

/**
 * [getEstablecimientosAdmin Lista establecimientos con estado de contrato para administrador]
 * @param array $data
 * @return boolean
 */
public function getEstablecimientosAdmin($data)
{
    try {
        $diasAlerta = isset($data['dias_alerta']) && $data['dias_alerta'] > 0
            ? intval($data['dias_alerta'])
            : 30;
 
        // ── WHERE dinámico ────────────────────────────────────────────────
        $whereExtra = [];
 
        // Solo establecimientos aprobados
        $whereExtra[] = "est.id_tbl_estado_modificacion = 3";
 
        // Filtro por estado de contrato
        $estadoContrato = $data['estado_contrato'] ?? null;
        switch ($estadoContrato) {
            case 'activo':
                $whereExtra[] = "DATE(cont.fecha_fin) > DATE_ADD(CURDATE(), INTERVAL $diasAlerta DAY)";
                $whereExtra[] = "CURDATE() BETWEEN DATE(cont.fecha_ini) AND DATE(cont.fecha_fin)";
                break;
            case 'por_vencer':
                $whereExtra[] = "CURDATE() BETWEEN DATE(cont.fecha_ini) AND DATE(cont.fecha_fin)";
                $whereExtra[] = "DATE(cont.fecha_fin) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL $diasAlerta DAY)";
                break;
            case 'caducado':
                $whereExtra[] = "cont.fecha_fin < CURDATE()";
                break;
        }
 
        // Filtro por texto
        if (!empty($data['txtBusqueda'])) {
            $txt = $this->sanearString($data['txtBusqueda']);
            $whereExtra[] = "CONCAT_WS(' ', infest.titulo, lug.desc_lugar, prov.desc_lugar) LIKE '%$txt%'";
        }
 
        // Filtro por id específico
        if (!empty($data['id_establecimiento']) && intval($data['id_establecimiento']) > 0)
            $whereExtra[] = "est.id_tbl_establecimiento = " . intval($data['id_establecimiento']);
 
        // Filtro por empresa — omitir EXISTS para caducado porque esos
        // establecimientos antiguos pueden no tener registros en oferta_empresa
        if (!empty($this->configApp['id_empresa']) && $estadoContrato !== 'caducado') {
            $ids = implode(',', array_map('intval', $this->configApp['id_empresa']));
            $whereExtra[] = "EXISTS (
                SELECT 1 FROM tbl_oferta_empresa oe_e
                JOIN tbl_oferta of_e ON of_e.id_tbl_oferta = oe_e.id_tbl_oferta
                JOIN tbl_producto prd_e ON prd_e.id_tbl_producto = of_e.id_tbl_producto
                WHERE prd_e.id_tbl_establecimiento = est.id_tbl_establecimiento
                AND oe_e.id_tbl_empresa IN ($ids)
            )";
        }
		// Filtro por rango de fecha de fin de contrato
		if (!empty($data['fecha_desde'])) {
			$whereExtra[] = "DATE(cont.fecha_fin) >= '" . date('Y-m-d', strtotime($data['fecha_desde'])) . "'";
		}
		if (!empty($data['fecha_hasta'])) {
			$whereExtra[] = "DATE(cont.fecha_fin) <= '" . date('Y-m-d', strtotime($data['fecha_hasta'])) . "'";
		}

		// Filtro por tipo de establecimiento (tbl_info_indice.id_tbl_servicio;
		// el catalogo es el de getTiposEstablecimiento)
		if (!empty($data['id_tbl_servicio']) && intval($data['id_tbl_servicio']) > 0) {
			$whereExtra[] = "infest.id_tbl_servicio = " . intval($data['id_tbl_servicio']);
		}

		// Filtros de ubicacion: se aplican aqui (y no en el navegador) para que el total
		// y la paginacion cuenten todos los resultados, no solo la pagina cargada.
		if (!empty($data['provincia'])) {
			$whereExtra[] = "prov.desc_lugar = '" . $this->sanearString($data['provincia']) . "'";
		}
		if (!empty($data['ciudad'])) {
			$whereExtra[] = "lug.desc_lugar = '" . $this->sanearString($data['ciudad']) . "'";
		}

        // ── Paginación ────────────────────────────────────────────────────
        $nPorPagina = isset($data['nitems']) && $data['nitems'] > 0 ? intval($data['nitems']) : 20;
        $pagina     = isset($data['pag'])    && $data['pag']    > 1 ? intval($data['pag'])    : 1;
        $desde      = ($pagina - 1) * $nPorPagina;
 
        $whereFinal = count($whereExtra) > 0 ? implode(' AND ', $whereExtra) : '1=1';

        // ── Ordenamiento ──────────────────────────────────────────────────
        // Mapeo seguro (whitelist) de las columnas ordenables desde la tabla del
        // admin. Así el orden se aplica sobre TODO el resultado antes de paginar,
        // y no solo sobre la página actual.
        $dir = (isset($data['dir']) && strtolower($data['dir']) === 'desc') ? 'DESC' : 'ASC';
        switch ($data['orden'] ?? '') {
            case 'nombre':    $orderSQL = "infest.titulo $dir";                    break;
            case 'ubicacion': $orderSQL = "prov.desc_lugar $dir, lug.desc_lugar $dir"; break;
            case 'contrato':  $orderSQL = "cont.fecha_fin $dir";                   break;
            case 'ofertas':   $orderSQL = "ofertasActivas $dir";                   break;
            case 'reservas':  $orderSQL = "nReservas $dir";                        break;
            case 'noches':    $orderSQL = "nNoches $dir";                          break;
            default:
                // Sin orden explícito: los caducados se muestran del más reciente
                // al más antiguo (fecha_fin descendente); el resto se agrupa por
                // estado y proximidad a vencer.
                $orderSQL = ($estadoContrato === 'caducado')
                    ? "cont.fecha_fin DESC"
                    : "estadoContrato ASC, diasRestantes ASC";
                break;
        }

        // ── SQL compacto ──────────────────────────────────────────────────
        $selectSQL = 'est.id_tbl_establecimiento, est.catalogacion, est.direccion_establecimiento, est.id_tbl_estado_modificacion, infest.titulo AS nombreEstablecimiento, infest.latitud, infest.longitud, infest.id_tbl_servicio AS idTipoEstablecimiento, serv.descripcion_servicio AS tipoEstablecimiento, lug.desc_lugar AS ciudad, prov.desc_lugar AS provincia, pais.desc_lugar AS pais, fo.direccion_foto AS logo, cont.id_tbl_contrato, cont.fecha_ini AS inicioContrato, cont.fecha_fin AS finContrato, CASE WHEN DATE(cont.fecha_fin) < CURDATE() THEN "caducado" WHEN DATE(cont.fecha_fin) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ' . $diasAlerta . ' DAY) THEN "por_vencer" ELSE "activo" END AS estadoContrato, DATEDIFF(cont.fecha_fin, NOW()) AS diasRestantes, COALESCE(oa.ofertasActivas, 0) AS ofertasActivas, COALESCE(rv.nReservas, 0) AS nReservas, COALESCE(rv.nNoches, 0) AS nNoches';
 
        $fromSQL = "tbl_establecimiento est JOIN tbl_info_indice infest ON infest.id_tbl_info_indice = est.id_tbl_info_indice LEFT JOIN tbl_servicio serv ON serv.id_tbl_servicio = infest.id_tbl_servicio JOIN ( SELECT id_tbl_establecimiento, MAX(id_tbl_contrato) id_tbl_contrato FROM tbl_contrato GROUP BY id_tbl_establecimiento ) cont_max ON cont_max.id_tbl_establecimiento = est.id_tbl_establecimiento JOIN tbl_contrato cont ON cont.id_tbl_contrato = cont_max.id_tbl_contrato LEFT JOIN tbl_foto fo ON fo.id_tbl_foto = est.id_tbl_foto JOIN tbl_lugar lug ON lug.id_tbl_lugar = infest.id_tbl_lugar JOIN tbl_lugar prov ON prov.id_tbl_lugar = lug.id_tbl_lugarpadre JOIN tbl_lugar reg ON reg.id_tbl_lugar = prov.id_tbl_lugarpadre JOIN tbl_lugar pais ON pais.id_tbl_lugar = reg.id_tbl_lugarpadre LEFT JOIN ( SELECT DISTINCT prd.id_tbl_establecimiento FROM tbl_oferta_empresa oe JOIN tbl_oferta of3 ON of3.id_tbl_oferta = oe.id_tbl_oferta JOIN tbl_producto prd ON prd.id_tbl_producto = of3.id_tbl_producto ) oe_est ON oe_est.id_tbl_establecimiento = est.id_tbl_establecimiento LEFT JOIN ( SELECT prd2.id_tbl_establecimiento, COUNT(*) AS ofertasActivas FROM tbl_oferta of2 JOIN tbl_producto prd2 ON prd2.id_tbl_producto = of2.id_tbl_producto WHERE of2.id_tbl_activacion = 1 AND CURDATE() BETWEEN DATE(of2.fecha_inicio) AND DATE(of2.fecha_fin) GROUP BY prd2.id_tbl_establecimiento ) oa ON oa.id_tbl_establecimiento = est.id_tbl_establecimiento LEFT JOIN ( SELECT ro.id_tbl_establecimiento, COUNT(DISTINCT ro.id_tbl_reserva) AS nReservas, COALESCE(SUM(DATEDIFF(ro.fecha_fin, ro.fecha_inicio)), 0) AS nNoches FROM tbl_reserva_oferta ro JOIN tbl_reserva_new r ON r.id_tbl_reserva = ro.id_tbl_reserva WHERE r.id_tbl_estado_reserva = 2 GROUP BY ro.id_tbl_establecimiento ) rv ON rv.id_tbl_establecimiento = est.id_tbl_establecimiento";
 
        $groupSQL = "est.id_tbl_establecimiento, est.catalogacion, est.direccion_establecimiento, est.id_tbl_estado_modificacion, infest.titulo, infest.latitud, infest.longitud, infest.id_tbl_servicio, serv.descripcion_servicio, lug.desc_lugar, prov.desc_lugar, pais.desc_lugar, fo.direccion_foto, cont.id_tbl_contrato, cont.fecha_ini, cont.fecha_fin";

        // ── Total de resultados (sin paginar) ──────────────────────────────
        // La consulta agrupa por establecimiento, asi que el total es el numero de
        // establecimientos distintos que cumplen los filtros.
        $totalFila = $this->find('first', array(
            'select' => 'COUNT(DISTINCT est.id_tbl_establecimiento) AS total',
            'from'   => $fromSQL,
            'where'  => $whereFinal,
        ));
        $this->totalEstablecimientos = $totalFila ? intval($totalFila['total']) : 0;

        // ── Consulta ──────────────────────────────────────────────────────
        $establecimientos = $this->find('all', array(
            'select' => $selectSQL,
            'from'   => $fromSQL,
            'where'  => $whereFinal,
            'group'  => $groupSQL,
            'order'  => $orderSQL,
            'limit'  => "$desde, $nPorPagina",
        ));
 
        // Sin resultados — respuesta válida con lista vacía
        if (empty($establecimientos)) {
            $this->establecimientos = [];
            $this->resumenContratos = ['activo' => 0, 'por_vencer' => 0, 'caducado' => 0];
            $this->totalEstablecimientos = 0;
            return true;
        }
 
        // ── Normalizar encoding y tipos ───────────────────────────────────
        $resumen = ['activo' => 0, 'por_vencer' => 0, 'caducado' => 0];
 
        foreach ($establecimientos as &$est) {
            // Campos de texto — normalizar a UTF-8 limpio
            // Los registros legacy (2008) pueden estar en Latin-1 o Windows-1252
            $camposTexto = ['nombreEstablecimiento', 'ciudad', 'provincia', 'pais', 'direccion_establecimiento', 'tipoEstablecimiento'];
            foreach ($camposTexto as $campo) {
                if (!empty($est[$campo])) {
                    $enc = mb_detect_encoding($est[$campo], ['UTF-8', 'ISO-8859-1', 'Windows-1252'], true);
                    if ($enc && $enc !== 'UTF-8') {
                        $est[$campo] = mb_convert_encoding($est[$campo], 'UTF-8', $enc);
                    } elseif (!$enc) {
                        $est[$campo] = mb_convert_encoding($est[$campo], 'UTF-8', 'ISO-8859-1');
                    }
                    // Eliminar bytes inválidos que puedan quedar
                    $est[$campo] = iconv('UTF-8', 'UTF-8//IGNORE', $est[$campo]);
                }
            }
 
            $est['diasRestantes'] = intval($est['diasRestantes']);
            $est['ofertasActivas']= intval($est['ofertasActivas']);
            $est['catalogacion']  = intval($est['catalogacion']);
            $est['nReservas']     = intval($est['nReservas']);
            $est['nNoches']       = intval($est['nNoches']);
            $est['idTipoEstablecimiento'] = intval($est['idTipoEstablecimiento']);
 
            if (isset($resumen[$est['estadoContrato']]))
                $resumen[$est['estadoContrato']]++;
        }
        unset($est);
 
        $this->establecimientos = $establecimientos;
        $this->resumenContratos = $resumen;
 
        return true;
 
    } catch (Exception $e) {
        $this->error     = $e->getMessage();
        $this->codeerror = $e->getCode();
        return false;
    }
}

/**
 * [getUbicacionesEstablecimientos provincias y ciudades para los filtros del admin]
 * Son las de TODOS los establecimientos aprobados (no solo la pagina cargada), asi el
 * selector ofrece todas las opciones aunque el listado este paginado.
 * @param string $provincia si viene, las ciudades se limitan a esa provincia
 * @return array ['provincias' => [...], 'ciudades' => [...]]
 */
public function getUbicacionesEstablecimientos($provincia = '')
{
    try {
        $fromUbic = "tbl_establecimiento est
            JOIN tbl_info_indice infest ON infest.id_tbl_info_indice = est.id_tbl_info_indice
            JOIN tbl_lugar lug  ON lug.id_tbl_lugar = infest.id_tbl_lugar
            JOIN tbl_lugar prov ON prov.id_tbl_lugar = lug.id_tbl_lugarpadre";

        $whereUbic = "est.id_tbl_estado_modificacion = 3";

        $provincias = $this->find('all', array(
            'select' => 'DISTINCT prov.desc_lugar AS nombre',
            'from'   => $fromUbic,
            'where'  => $whereUbic,
            'order'  => 'prov.desc_lugar ASC',
        ));

        $whereCiudades = $whereUbic;
        if (!empty($provincia))
            $whereCiudades .= " AND prov.desc_lugar = '" . $this->sanearString($provincia) . "'";

        $ciudades = $this->find('all', array(
            'select' => 'DISTINCT lug.desc_lugar AS nombre',
            'from'   => $fromUbic,
            'where'  => $whereCiudades,
            'order'  => 'lug.desc_lugar ASC',
        ));

        // Los registros legacy pueden venir en Latin-1: se normalizan igual que el listado
        $normalizar = function ($filas) {
            $salida = [];
            foreach ((array)$filas as $fila) {
                $texto = isset($fila['nombre']) ? $fila['nombre'] : '';
                if ($texto === '') continue;
                $enc = mb_detect_encoding($texto, ['UTF-8', 'ISO-8859-1', 'Windows-1252'], true);
                if ($enc && $enc !== 'UTF-8')      $texto = mb_convert_encoding($texto, 'UTF-8', $enc);
                elseif (!$enc)                     $texto = mb_convert_encoding($texto, 'UTF-8', 'ISO-8859-1');
                $salida[] = iconv('UTF-8', 'UTF-8//IGNORE', $texto);
            }
            return array_values(array_unique($salida));
        };

        return array(
            'provincias' => $normalizar($provincias),
            'ciudades'   => $normalizar($ciudades),
        );

    } catch (Exception $e) {
        $this->error     = $e->getMessage();
        $this->codeerror = $e->getCode();
        return array('provincias' => [], 'ciudades' => []);
    }
}



/**
 * [enviarAlertaContratos Envía email con reporte de contratos por vencer o caducados]
 * @param int    $diasAlerta  Días umbral para "por vencer"
 * @param array  $soloEstados Filtrar por estado: ['por_vencer','caducado'] o vacío para ambos
 * @return bool
 */
public function enviarAlertaContratos($diasAlerta = 30, $soloEstados = [])
{
    try {
        $data = [
            'dias_alerta'     => $diasAlerta,
            'estado_contrato' => null,  // traer todos para el reporte completo
            'pag'             => 1,
            'nitems'          => 200,   // suficiente para un reporte diario
        ];

        if (!$this->getEstablecimientosAdmin($data))
            throw new Exception($this->error, $this->codeerror);

        // Filtrar solo caducados y por_vencer para el email
        $establecimientos = array_filter(
            $this->establecimientos,
            function ($est) {
                return in_array($est['estadoContrato'], ['caducado', 'por_vencer']);
            }
        );

        if (empty($establecimientos))
            throw new Exception("No hay contratos por vencer o caducados", 0);

        // Recalcular resumen solo con lo que se va a enviar
        $resumen = ['activo' => 0, 'por_vencer' => 0, 'caducado' => 0];
        foreach ($establecimientos as $e)
            $resumen[$e['estadoContrato']]++;

        $totalAlerta = $resumen['por_vencer'] + $resumen['caducado'];

        $infoEmail = [
            'id_servicio'      => $this->id_servicio,
            'subject'          => "⚠️ Alerta contratos: $totalAlerta establecimiento(s) requieren atención",
            'establecimientos' => array_values($establecimientos),
            'resumen'          => $resumen,
            'dias_alerta'      => $diasAlerta,
            // Copia opcional a gerencia
            // 'bcc' => [['email' => 'gerencia@visitaecuador.com', 'nombre' => 'Gerencia']],
        ];

        if (!$this->app->sendContacto('18', $infoEmail))
            throw new Exception($this->app->error, $this->app->codeerror);

        return true;

    } catch (Exception $e) {
        $this->error     = $e->getMessage();
        $this->codeerror = $e->getCode();
        return false;
    }
}
	/**
	 * [getEstablecimientosFiltro description]
	 * @param  [type] $txtWhereFiltro [description]
	 * @return [type]                 [description]
	 */
	public function getEstablecimientosFiltro($txtWhereFiltro)
	{
		try {


			$totalEstablecimiento = $this->find(
				"all",
				array(
					"select" => "count(*) total, voa.idInfoIndiceEstablecimiento, voa.id_tbl_establecimiento, voa.direccion_foto,voa.Establecimiento, Longitud, Latitud",
					"from"  => "vista_ofertas_activas voa",
					"where" => $txtWhereFiltro,
					"group" => "voa.idInfoIndiceEstablecimiento",
				)
			);
			// $this->pr($totalEstablecimiento);
			// $this->pr($this->error);
			//$this->pr($this->lastQuery);
			//obtener total de pesonas;

			if (!$totalEstablecimiento)
				throw new Exception("No existen Establecimientos", 1004);

			$nEstablecimientos = count($totalEstablecimiento);
			foreach ($totalEstablecimiento as $key => $est) {
				# code...

				$return['id'][] = $est['id_tbl_establecimiento'];
				$return['establecimiento'][$est['id_tbl_establecimiento']] = $est;
				// $N_Establecimientos[$est['id_tbl_establecimiento']]  = $est; 
				// $N_Establecimientos[$est['id_tbl_establecimiento']]['ofertas']  = array(); 

			}
			// pr($return);
			return $return;
		} catch (Exception $e) {

			$this->error 	 = $e->getMessage();
			$this->codeerror = $e->getCode();

			return false;
		}
	}

	/**
	 * @abstract generarTextoPersonas
	 * @author Geo Orellana  <webmaster@visitaecuador.com>
	 * @param int $Adultos cantidad de adultro, valor desde 0 a 100
	 * @param int $Ninos cantidad de ninos, valor desde 0 a 100
	 * @param int $caracter opcional, para tener un separdor del texto
	 * @return  text Devuelde frase formateada de Personas ejm: 3 Dias <y> 2 noches ó 2 noches.
	 */

	function generarTextoPersonas($Adultos, $Ninos, $caracter = "")
	{
		switch ($Adultos) {
			case 1:
				# code...
				$personasAdultos = $Adultos . " adulto";
				break;
			case 0:
				# code...
				$personasAdultos = "";
				break;

			default:
				# code...
				$personasAdultos = $Adultos . " adultos";
				break;
		}
		switch ($Ninos) {
			case 1:
				# code...
				$personasNinos = $Ninos . " niño";
				break;
			case 0:
				# code...
				$personasNinos = "";
				break;

			default:
				# code...
				$personasNinos = $Ninos . " niños";
				break;
		}
		return $personasAdultos . " $caracter " . $personasNinos;
	}

	/**
	 * @abstract generarTextoPersonas
	 * @author Geo Orellana  <webmaster@visitaecuador.com>
	 * @param int $Adultos cantidad de adultro, valor desde 0 a 100
	 * @param int $Ninos cantidad de ninos, valor desde 0 a 100
	 * @param int $caracter opcional, para tener un separdor del texto
	 * @return  text Devuelde frase formateada de Personas ejm: 3 Dias <y> 2 noches ó 2 noches.
	 */
	function generarIcoPersonas($Adultos, $Ninos, $maxAdultos, $maxNinos)
	{
		$ico_personas = '';
		$ico_personasAdultos = "";
		$ico_personasNinos = "";

		if ($Adultos <= $maxAdultos) {

			for ($n = 1; $n <= $Adultos; $n++) {
				$arrayIco['adultos'] .= "<span class='glyphicons glyphicons-user'></span>";
			}
		} else {
			$arrayIco['adultos'] = "<span class='glyphicons glyphicons-user'></span> x $Adultos ";
		}

		if ($Ninos <= $maxNinos) {
			for ($n = 1; $n <= $Ninos; $n++) {
				$arrayIco['ninos'] .= "<span class='glyphicons glyphicons-child'></span>";
			}
		} else {
			$arrayIco['ninos'] = "<span class='glyphicons glyphicons-child'></span> x $Ninos ";
		}
		if (count($arrayIco) > 0)
			$txtIconos = implode("<span class='glyphicons glyphicons-plus'></span>", $arrayIco);
		else
			$txtIconos = "";

		return  $txtIconos;
	}

	/**
	 * @abstract generarTextoPersonas
	 * @author Geo Orellana  <webmaster@visitaecuador.com>
	 * @param int $Adultos cantidad de adultro, valor desde 0 a 100
	 * @param int $Ninos cantidad de ninos, valor desde 0 a 100
	 * @param int $caracter opcional, para tener un separdor del texto
	 * @return  text Devuelde frase formateada de Personas ejm: 3 Dias <y> 2 noches ó 2 noches.
	 */
	function generarTextoTiempo($dias, $noches, $caracter = "")
	{
		//obtener informacion 
		switch ($noches) {
			case 1:
				# code...
				$tiempoNoches = $noches . " noche";
				break;
			case 0:
				# code...
				$tiempoNoches = "";
				break;

			default:
				# code...
				$tiempoNoches = $noches . " noches";
				break;
		}
		switch ($dias) {
			case 1:
				# code...
				$tiempoDias = $dias . " día";
				break;
			case 0:
				# code...
				$tiempoDias = "";
				break;

			default:
				# code...
				$tiempoDias = $dias . " días";
				break;
		}
		$tiempo = $tiempoDias . " $caracter " . $tiempoNoches;
		return $tiempo;
	}

	/**
	 * [getContactos description]
	 * @param  [type] $array_id_tbl_usuarios [description]
	 * @return [type]                        [description]
	 */
	public function getContactos($array_id_tbl_usuarios)
	{
		try {

			if (is_array($array_id_tbl_usuarios) and count($array_id_tbl_usuarios) > 0)
				$where[] = 'id_tbl_usuario in (' . implode(',', $array_id_tbl_usuarios) . ')';
			else if (empty($array_id_tbl_usuarios))
				throw new Exception("Error Processing Request", 1);
			else
				$where[] = 'id_tbl_usuario =' . $array_id_tbl_usuarios;

			$contactos = $this->find('all', array(
				'select' => 'ico, contacto, tc.nombre_tipo_contacto tipo, id_tbl_tipo_contacto idtipo',
				'from'	=> 'tbl_usuario u join tbl_contacto_directorio cnt using(id_tbl_directorio) join tbl_tipo_contacto tc using(id_tbl_tipo_contacto)',
				'where'	=> $where,
				'order' => 'tc.orden_app ASC',
			));
			// pr($contactos);
			// exit();

			if (!$contactos)
				throw new Exception("No existen contactos", 1);



			// pr($contactos);
			$k = 0;
			foreach ($contactos as $key => $value) {
				# code...
				$texto[$value['tipo']][] = $value['contacto'];

				$textoArray[$key]['valor'] = $value['contacto'];
				$textoArray[$key]['nombre'] = utf8_encode($value['tipo']);
				// switch ($value['idtipo']) {
				// 	case '7': // SIP
				// 		# code...
				// 		$this->opcionesReserva[$k]['texto'] = ''.$this->configApp['contacto']['telPrefijo'].' ext: '. $value['contacto'];
				// 		$this->opcionesReserva[$k]['nombre'] = 'Club Visita';
				// 		$this->opcionesReserva[$k]['valor'] =  $value['contacto'];
				// 		$k++;
				// 		$this->opcionesReserva[$k]['texto'] = ''.$this->configApp['contacto']['skype'].' ext: '. $value['contacto'];
				// 		$this->opcionesReserva[$k]['nombre'] = 'Skype';
				// 		$this->opcionesReserva[$k]['valor'] =  $this->configApp['contacto']['skype'];
				// 		$k++;

				// 		break;
				// 	case '6': //telefono casa


				// 		$this->opcionesReserva[$k]['texto'] =   $value['contacto'];
				// 		$this->opcionesReserva[$k]['nombre'] = 'Directa al establecimiento';
				// 		$this->opcionesReserva[$k]['valor'] =  $value['contacto'];
				// 		$k++;
				// 		break;

				// 	default:
				// 		# code...
				// 		break;
				// }
			}
			// if(!isset($this->opcionesReserva['Llamada Directa']) or empty($this->opcionesReserva['Llamada Directa']))
			// {
			// 	// $this->opcionesReserva['Llamada Directa'] = $this->appConfig['sipExt'];
			// }
			// if(count($this->configApp['contacto']['whatsapp'])>0)
			// {
			// 	// pr($this->configApp['contacto']['whatsapp']);
			// 	$numeroSel = array_rand($this->configApp['contacto']['whatsapp'],1);
			// 	// pr($numeroSel);
			// 	// $this->opcionesReserva[$k]['texto'] =   $this->configApp['contacto']['whatsapp'][$numeroSel];
			// 	// $this->opcionesReserva[$k]['nombre'] = 'whatsapp';
			// 	// $this->opcionesReserva[$k]['valor'] =  $this->configApp['contacto']['whatsapp'][$numeroSel];

			// }

			$n = 0;
			// foreach ($texto as $key => $value) {
			// 	# code...
			// 	$textoArray[$n]['valor'] = implode(' - ', $value);
			// 	$textoArray[$n]['nombre'] = utf8_encode($key);
			// 	$n++;
			// }
			if (isset($textoArray)) {
				$retorno = $textoArray;
				// $retorno['texto'] = $textoArray ;
			}
			// if(isset($contactos))
			// 	$retorno['contacto'] = $textoArray ;


			$datosContacto = $this->find("all", array(
				"select" => " distinct(cd.contacto) contacto,cd.id_tbl_tipo_contacto,
                      tc.nombre_tipo_contacto tipoContacto,ico, icosocial",
				"from"  => " tbl_usuario  u
                    join tbl_contacto_directorio cd using(id_tbl_directorio) join tbl_tipo_contacto tc using(id_tbl_tipo_contacto)",
				"where" =>  $where,
				'order'    => 'tc.orden_app ,cd.id_tbl_tipo_contacto asc',

				// "group" => "cd.id_tbl_tipo_contacto"
			));


			#$this->error;
			// pr($this->lastQuery);

			if ($datosContacto) {
				foreach ($datosContacto as $key => $dato) {
					$tipoContacto = utf8_encode($dato['tipoContacto']);
					$contacto   = $dato['contacto'];
					$contacto = str_replace('@', "(a)", $dato['contacto']);

					switch ($dato['id_tbl_tipo_contacto']) {
						case '7':
							# code...
							// $this->opcionesReserva['skype']["nombre"]= 'Skype';
							//$this->opcionesReserva['skype']["ico"]= '';
							//$this->opcionesReserva['skype']["icosocial"]= 'skype';
							// $this->opcionesReserva['skype']['contacto'][]= array('valor'=>'clubvisitaecuador','ext'=>$dato['contacto'],'formateado'=>NULL);

							$this->opcionesReserva['telefono']["nombre"] = 'Teléfono';
							$this->opcionesReserva['telefono']["ico"] = '';
							$this->opcionesReserva['telefono']["icosocial"] = 'telefono';
							$this->opcionesReserva['telefono']['contacto'][] = array('valor' => '074134500', 'formateado' => '07413450', 'ext' => $dato['contacto']);
							// echo $contacto;
							break;
						case '2':
						case '3':
						case '4':
						case '6':
							# code...
							$this->opcionesReserva['telefono']["nombre"] = 'Teléfono';
							$this->opcionesReserva['telefono']["ico"] = '';
							$this->opcionesReserva['telefono']["icosocial"] = 'telefono';
							$this->opcionesReserva['telefono']['contacto'][] = array('valor' => $this->app->formatearTelefono($dato['contacto']), 'formateado' => $this->app->formatearTelefono($dato['contacto']));
							// echo $contacto;
							break;

						case '1':
						case '9':
							$this->opcionesReserva['email']["nombre"]	= 'email';
							$this->opcionesReserva['email']["ico"]		= 'e-mail';
							$this->opcionesReserva['email']["icosocial"] = 'e-mail';
							$this->opcionesReserva['email']['contacto'][] = array('valor' => $dato['contacto']);

							break;
						default:
							# code...
							$this->opcionesReserva[$this->_formatString(utf8_encode($dato['tipoContacto']))]["nombre"] = utf8_encode($dato['tipoContacto']);
							$this->opcionesReserva[$this->_formatString(utf8_encode($dato['tipoContacto']))]["ico"] = $dato['ico'];
							$this->opcionesReserva[$this->_formatString(utf8_encode($dato['tipoContacto']))]["icosocial"] = $dato['icosocial'];

							switch ($dato['id_tbl_tipo_contacto']) {
								case '14': //whatassp
									$this->opcionesReserva[$this->_formatString($dato['tipoContacto'])]['contacto'][] = array('valor' => $this->app->formatearCelular($dato['contacto']), 'formateado' => $this->app->formatearTelefonoWhatsapp($dato['contacto']));

									break;
								case '5': //pagina web
									$this->opcionesReserva[$this->_formatString(utf8_encode($dato['tipoContacto']))]['contacto'][] = array('valor' => ($dato['contacto']), 'formateado' => $this->app->formatearPaginaWeb($dato['contacto']));
									break;
								default:
									$this->opcionesReserva[$this->_formatString($dato['tipoContacto'])]['contacto'][] = array('valor' => $dato['contacto']);

									break;
							}
							break;
					}

					// switch ($dato['id_tbl_tipo_contacto']) {
					//     case '7'://sip
					//         # code...
					//         $telefonoSip = $contacto;

					//         $tipoContacto = "Reserva directa con el hotel";
					//         $contacto = VE_TELEFONO. '  / ext.: '.$contacto;

					//         break;
					//     case '1':// email
					//         $emailListaEstablecimiento[] =$dato['contactos'];
					//         break;
					//     case '2': //telefono de casa
					//     case '3': //celular trabajo
					//     case '4': //celular personal
					//     case '6': //telefono de reservas
					//         # code...
					//         $contactoDatosHotel[] = $contacto;
					//         break;
					//     case '9':
					//         # code...
					//         $contactoDatosHotel[] = '<span class="telefono" id="telefonoW"><a href="https://api.whatsapp.com/send?phone=593'.substr($contacto, 0,100).'&text=Quirero viajar a ... en estas fechas .... y somos ... adultos. Desde'. WEB_NAME .'" target="_blank">'.$contacto .'</a></span>';

					//         break;
					//     case '14'://whatsapp
					//         # code...

					//         break;
					//     case '5':
					//            # code...
					//         $contacto = '<a href="http://'.$contacto.'" class="url-ext" target="_blank">'.$contacto.'</a>';
					//         break;
					//     default:
					//         # code...

					//         break;
					// }

					// $txtDatosContacto .='<li><strong>'.$tipoContacto.' : </strong><span> '.$contacto.'</span></li>';

				}
			} else {
				$txtDatosContacto = "<p class='aviso'>Datos de contacto no disponible por el momento</p>";
			}



			//pr("xd..");
			return $retorno;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			return false;
		}
		//obtener info de contacto de establecimiento

	}

	public function getGaleriaInfo($array_id_info_indice)
	{
		try {

			if (is_array($array_id_info_indice) and count($array_id_info_indice) > 0)
				$where[] = 'id_tbl_info_indice in (' . implode(',', $array_id_info_indice) . ')';
			else if (empty($array_id_info_indice))
				throw new Exception("Error Processing Request", 1);
			else
				$where[] = 'id_tbl_info_indice =' . $array_id_info_indice;

			$fotos = $this->find('all', array(
				'select' => ' f.descripcion_foto descripcion,
    						f.direccion_foto img',
				'from'	=> 'tbl_foto_informacion fi
			        join
			    tbl_foto f USING (id_tbl_foto)',
				'where'	=> $where,
			));
			// if($array_id_info_indice == '43590')
			// {
			// pr($this->lastQuery);
			// pr($this->error);
			// exit();	
			// }

			if (!$fotos)
				throw new Exception("Error Processing Request", 1);
			foreach ($fotos as $key => $foto) {
				# code...
				if (empty($fotos['descripcion']))
					$fotos[$key]['descripcion'] = NULL;
				// unset($fotos[$key]['descripcion']);
				else
					$fotos[$key]['descripcion'] = utf8_encode($fotos['descripcion']);
			}
			// if($array_id_info_indice == '43590')
			// {
			// // pr($this->lastQuery);
			// // pr($this->error);
			// pr($fotos)	;
			// exit();
			// }
			// $this->galeriaEstablecimiento = $fotos;	
			return $fotos;
		} catch (Exception $e) {
			$this->galeriaEstablecimiento = false;

			return false;
		}
	}

	/**
	 * [getServiceOferta description]
	 * @param  [type] $array_id_tbl_oferta [description]
	 * @param  [type] $servicios           [description]
	 * @return [type]                      [description]
	 */
	public function getServiceOferta($array_id_tbl_oferta, $servicios = NULL)
	{
		try {

			if (is_array($array_id_tbl_oferta) and count($array_id_tbl_oferta) > 0)
				$where[] = 'id_tbl_oferta in (' . implode(',', $array_id_tbl_oferta) . ')';
			else if (empty($array_id_tbl_oferta))
				throw new Exception("Error Processing Request", 1);
			else
				$where[] = 'id_tbl_oferta =' . $array_id_tbl_oferta;

			if (is_array($servicios)) {
				foreach ($servicios as $key => $servicio) {
					# code...
					$whereS[] = "tss.nombre_servicio_smart like '%" . $servicio . "%'";
				}
				$where[] = implode(" or ", $whereS);
			} else if (!empty($servicios)) {

				$where[] = "tss.nombre_servicio_smart like '%" . $servicios . "%'";
			}
			//obtener servicios genericos
			if (!$this->tipoServicios)
				$this->tipoServicios 		= $this->getTipoServicios();
			if (!$this->detalleServicios)
				$this->detalleServicios 	= $this->getTipoDetalleSmart();
			if (isset($detalleServicios))
				foreach ($detalleServicios as $key => $detalle) {
					# code...
					$arrayDetalleServicios[$detalle['id']]['nombre'] = $detalle['nombre'];
				}

			$servicios = $this->find('all', array(
				'select' => 'td.id_tbl_tipo_detalle,
							tss.id_tbl_servicio_smart,
                        td.nombre_tipo_detalle tipo,
                        concat(tss.nombre_servicio_smart, " " ,
                                    so.detalle_o_comentario)  detalle,
					    tss.id_tbl_tipo_servicio_smart,
					    tss.estilo',
				'from'	=> ' tbl_servicio_oferta so
                            join
                        tbl_servicio_smart tss ON (so.id_tbl_servicio_smart = tss.id_tbl_servicio_smart)
                            join
                        tbl_tipo_detalle td ON td.id_tbl_tipo_detalle = so.id_tbl_tipo_detalle',
				'where'	=> $where,
				'order'	=> 'td.prioridad , tss.orden desc , tss.nombre_servicio_smart',
			));
			// pr($servicios);
			// pr($this->error);
			// pr($this->lastQuery);
			// exit();
			if (!$servicios)
				throw new Exception("Error Processing Request", 1);


			// pr($servicios);
			foreach ($servicios as $llave => $servicio) {
				$arrayDetalleServicios[$servicio['id_tbl_tipo_detalle']]['items'][$servicio['id_tbl_servicio_smart']] = utf8_encode($servicio['detalle']);
				$arrayDetalleServicios[$servicio['id_tbl_tipo_detalle']]['nombre'] = ($servicio['tipo']);
			}
			// pr($arrayDetalleServicios);
			foreach ($arrayDetalleServicios as $key => $temp) {
				// pr($temp);

				# code...
				if (!isset($temp['items']))
					unset($arrayDetalleServicios[$key]);
				else
	        		if (isset($temp['nombre']))
					$textodetalleServicios[$temp['nombre']] .= implode(' - ', $temp['items']);
			}

			// pr($textodetalleServicios);

			return array('texto' => $textodetalleServicios, 'item' => $arrayDetalleServicios);
		} catch (Exception $e) {
			return false;
		}
	}
	/**
	 * [getServiceEstablecimiento description]
	 * @param  [type] $array_id_establecimientos [description]
	 * @return [type]                            [description]
	 */
		function getServiceEstablecimiento($array_id_establecimientos, $servicios = NULL)
	{
		try {
			if (is_array($array_id_establecimientos) and count($array_id_establecimientos) > 0)
				$where[] = 'id_tbl_establecimiento in (' . implode(',', $array_id_establecimientos) . ')';
			else if (empty($array_id_establecimientos))
				throw new Exception("Error Processing Request", 1);
			else
				$where[] = 'id_tbl_establecimiento =' . $array_id_establecimientos;

			if (is_array($servicios)) {
				foreach ($servicios as $key => $servicio) {
					$whereS[] = "smart.nombre_servicio_smart like '%" . $servicio . "%'";
				}
				$where[] = implode(" or ", $whereS);
			} else if (!empty($servicios)) {
				$where[] = "smart.nombre_servicio_smart like '%" . $servicios . "%'";
			}

			// (C.2) obtener servicios genericos UNA sola vez (memoizado en la clase)
			if (!$this->tipoServicios)
				$this->tipoServicios = $this->getTipoServicios();
			if (!$this->detalleServicios)
				$this->detalleServicios = $this->getTipoDetalleSmart();

			$tipoServicios    = $this->tipoServicios;
			$detalleServicios = $this->detalleServicios;

			foreach ($tipoServicios as $key => $tipoServicio) {
				$arrayTipoServicios[$tipoServicio['id']]['nombre'] = utf8_encode($tipoServicio['nombre']);
				$arrayDetalle[$tipoServicio['id']]['nombre']       = utf8_encode($tipoServicio['nombre']);
				$textoDetalle[$tipoServicio['id']]['nombre']       = utf8_encode($tipoServicio['nombre']);
			}

			//pasar a array tipo de detalle servicio
			//(ojo: este foreach pisa la variable local $detalleServicios, NO la propiedad de la clase)
			foreach ($detalleServicios as $key => $detalleServicios) {
				$arraydetalleServicios[$detalleServicios['id']]['nombre'] = ($detalleServicios['nombre']);
			}

			$servicios = $this->find('all', array(
				'select' => '  count(*) total,
							id_tbl_servicio_smart id,
						    nombre_servicio_smart,
						    detalle,
						    estilo,
						    tipod.id_tbl_tipo_detalle,
						    tipo.id_tbl_tipo_servicio_smart tipo,
						    tipod.nombre_tipo_detalle nombre_detalle,
						    nombre_tipo_servicio_smart',
				'from'	=> '    tbl_dtl_servicio_establecimiento dtl
						        JOIN
						    tbl_servicio_smart smart USING (id_tbl_servicio_smart)
						        JOIN
						    tbl_tipo_servicio_smart tipo USING (id_tbl_tipo_servicio_smart)
						    left outer join tbl_tipo_detalle tipod using(id_tbl_tipo_detalle) ',
				'where'	=> $where,
				"group"	=> 'id_tbl_servicio_smart',
				'order'	=> 'count(*) desc',
			));

			if (!$servicios)
				throw new Exception("No existen servicios", 1);

			foreach ($servicios as $key => $servicio) {

				if ($servicio['tipo'] == 1 or $servicio['tipo'] == 2 or $servicio['tipo'] == 10) // no muestra comentarios para: Servicios del hotel / Servicios de habitación / Incluye
					$infoTxt = utf8_encode($servicio['nombre_servicio_smart']);
				else
					$infoTxt = utf8_encode($servicio['nombre_servicio_smart']) . ' ' . utf8_encode($servicio['detalle']);

				//servicios para ofertas si existe un tipo detalle vinculado
				if ($servicio['id_tbl_tipo_detalle'] > 0) {
					$arrayServiciosOferta[$servicio['id_tbl_tipo_detalle']]['items'][$servicio['id']] = $infoTxt;
					$textoServiciosOferta[$servicio['nombre_detalle']][] = $infoTxt;
				} else { //servicio para establecimientos
					$arrayServiciosEstablecimiento[$servicio['tipo']]['items'][$servicio['id']] = array('nombre' => $infoTxt, 'estilo' => $servicio['estilo'], 'total' => $servicio['total']);
					$textoServiciosEstablecimiento[$servicio['nombre_tipo_servicio_smart']][] = $infoTxt;
				}
			}

			if (is_array($arrayServiciosOferta))
				foreach ($textoServiciosOferta as $key => $seroferta) {
					$returnTextoServiciosOferta[$key] = implode(' - ', $seroferta);
				}
			if (is_array($arrayServiciosEstablecimiento))
				foreach ($textoServiciosEstablecimiento as $key => $serestablecimiento) {
					$returnTextoServiciosEstablecimiento[$key] = implode(' - ', $serestablecimiento);
				}

			if (isset($returnTextoServiciosOferta))
				$salida['textoServiciosOferta'] = $returnTextoServiciosOferta;

			if (isset($arrayServiciosOferta))
				$salida['serviciosOferta'] = $arrayServiciosOferta;

			if (isset($returnTextoServiciosEstablecimiento))
				$salida['textoServiciosEstablecimiento'] = $returnTextoServiciosEstablecimiento;

			if (isset($arrayServiciosEstablecimiento))
				$salida['serviciosEstablecimiento'] = $arrayServiciosEstablecimiento;

			return $salida;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			return false;
		}
	}

	/**
	 * [getTipoOfertasFiltro description]
	 * @param  [type] $where [description]
	 * @return [type]        [description]
	 */
	public function getTipoOfertasFiltro($where)
	{
		try {

			$totalEstablecimiento = $this->find(
				"all",
				array(
					"select" => "count(*) total, voa.estilo_tipo_beneficio_suscripcion estilo, voa.nombre_tipo_beneficio_suscripcion nombre,voa.id_tbl_tipo_beneficio_suscripcion id",
					"from"  => "vista_ofertas_activas voa",
					"where" => $txtWhereFiltro,
					"group" => "voa.id_tbl_tipo_beneficio_suscripcion",
				)
			);
			// $this->pr($totalEstablecimiento);
			// $this->pr($this->error);
			// $this->pr($this->lastQuery);
			//obtener total de pesonas;

			if (!$totalEstablecimiento)
				throw new Exception("No existen Tipo de ofertas", 1002);

			$nEstablecimientos = count($totalEstablecimiento);
			foreach ($totalEstablecimiento as $key => $est) {
				# code...

				$return['id'][] = $est['id'];
				$return['tipoOfertas'][$est['id']] = $est;
				// $N_Establecimientos[$est['id_tbl_establecimiento']]  = $est; 
				// $N_Establecimientos[$est['id_tbl_establecimiento']]['ofertas']  = array(); 

			}
			// pr($return);
			// return $return;
			return $return;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * [getTipoOfertas Tipo]
	 * @return [type] [description]
	 */
	public function getTipoOfertas()
	{
		try {

			$txtWhere[] = " mostrar = 1 "; 					//mostrar enpermisos activados
			$txtWhere[] = " id_tbl_empresa =  " . $this->configApp['id_empresa'][0];	//	Empresa VisitaEcuador
			//charters solo en ecuador / logueado o no
			if ($this->configApp['idpais'] != 239) {
				$nocharter[] 	= "54";	//permiso 54 charters 
			}

			if ($_SESSION['sesion_iniciada'] == 1) //procedimiento cuando esten logueados, mostrar beneficios
			{
				if (!empty($_SESSION['stBeneficios'])) // aun no se generan los permisos
				{
					//$txtWhere[] = "id_tbl_tipo_beneficio_suscripcion in (".$_SESSION['stBeneficios'].")" ;
				}
			} else {
				// $nocharter[] 	= "57";	//permiso 54 charters 
				// $nocharter[] 	= "197";	//permiso 54 charters 
				// $txtWhere[] = "id_tbl_permiso not in (57,197 $nocharter)"; 
				// no muestra ofertas de feriasdos 57 , 197 para businens
				if (count($nocharter) > 0)
					$txtWhere[] = "id_tbl_permiso not in ( " . implode(',', $nocharter) . ")";
			}
			// pr($txtWhere);

			// $txtWhereLog = implode(" and ", $txtWhere);
			$pestanas = $this->find('all', array(
				'select' => 'id_tbl_tipo_beneficio_suscripcion id,nombre_tipo_beneficio_suscripcion,estilo_tipo_beneficio_suscripcion estilo,descripcion, color',
				'from'	=> 'tbl_tipo_beneficio_suscripcion',
				"where"	=> $txtWhere,
				"order" => "orden desc"
			));
			// pr($pestanas);
			// pr($this->lastQuery);
			if (!$pestanas)
				throw new Exception("no Existen pestanas", 1);

			foreach ($pestanas as $llave => $pestana) {

				$arrayPestanas[$pestana['id']] = array(
					'nombre' => utf8_encode($pestana['nombre_tipo_beneficio_suscripcion']),
					'estilo' => $pestana['estilo'],
					'descripcion' => $pestana['descripcion'],
					'color' => $pestana['color'],
				);
			}
			return $arrayPestanas;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * [getTiposervicios description]
	 * @return array tipo de servicios smart
	 */
	function getTipoServicios()
	{
		try {
			$tipoServicios = $this->find('all', array(
				'select' => 'nombre_tipo_servicio_smart nombre ,id_tbl_tipo_servicio_smart id',
				'from'	=> 'tbl_tipo_servicio_smart',
				// 'where'	=>'', 
				'order'	=> 'orden',
			));
			if (!$tipoServicios)
				throw new Exception("Error Processing Request", 1);

			return $tipoServicios;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * [getTipoDetalleSmart description]
	 * @return [type] [description]
	 */
	function getTipoDetalleSmart()
	{
		try {
			$detalle = $this->find('all', array(
				'select' => 'id_tbl_tipo_detalle id, nombre_tipo_detalle nombre',
				'from'	=> 'tbl_tipo_detalle',
				// 'where'	=>'', 
				'order'	=> 'prioridad',
			));
			if (!$detalle)
				throw new Exception("Error Processing Request", 1);

			return $detalle;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}


	private function resultadoServicios($arrayTodasOfertas, $arrayTodosEstablecimientos, $itemsSeleccionados, $txt)
	{
		$ofertasAprobada = array();
		$whereOfer[] = $whereEste[] = " tss.nombre_servicio_smart LIKE '%" . $txt . "%'";
		$whereOfer[] = " id_tbl_oferta in (" . implode(',', $arrayTodasOfertas) . ")";
		$whereEste[] = " id_tbl_establecimiento in (" . implode(',', $arrayTodosEstablecimientos) . ")";

		$desayunosOfertas = $this->find('all', array(
			'select' => 'id_tbl_oferta',
			'from'	=> 'tbl_servicio_oferta so
			        JOIN
			    tbl_servicio_smart tss ON (so.id_tbl_servicio_smart = tss.id_tbl_servicio_smart)',
			'where'	=> $whereOfer,
		));
		// echo $this->lastQuery;
		// echo $this->error;
		if ($desayunosOfertas) {
			foreach ($desayunosOfertas as $key => $desayuno) {
				# code...
				$respuestaDesayunoOferta[$desayuno['id_tbl_oferta']] = $desayuno['id_tbl_oferta'];
			}
		}
		$desayunosEstablecimiento = $this->find('all', array(
			'select' => 'id_tbl_establecimiento',
			'from'	=> ' tbl_dtl_servicio_establecimiento dtl
						        JOIN
						    tbl_servicio_smart tss USING (id_tbl_servicio_smart)',
			'where'	=> $whereEste,
		));
		if ($desayunosEstablecimiento) {
			foreach ($desayunosEstablecimiento as $key => $desayuno) {
				# code...
				$respuestaDesayunoEstablecimiento[$desayuno['id_tbl_establecimiento']] = $desayuno['id_tbl_establecimiento'];
			}
		}

		foreach ($itemsSeleccionados as $idEstab => $idOfertas) {
			# code...
			if (isset($respuestaDesayunoEstablecimiento[$idEstab])) // si encontro por establecimiento marcar todos las ofertas correspondientes
			{
				foreach ($idOfertas as $idofe => $valofe) {
					# code...
					$ofertasAprobada[$idofe] = $idofe;
				}
			} else {
				foreach ($idOfertas as $idofe => $valofe) {
					# code...
					if (isset($respuestaDesayunoOferta[$idofe]))
						$ofertasAprobada[$idofe] = $idofe;
				}
			}
		}
		return $ofertasAprobada;
	}

	private function  resultadoDesayunoServicios($arrayTodasOfertas, $arrayTodosEstablecimientos, $itemsSeleccionados)
	{

		return $this->resultadoServicios($arrayTodasOfertas, $arrayTodosEstablecimientos, $itemsSeleccionados, 'desayuno');
	}

	private function  resultadoTodoIncluidoServicios($arrayTodasOfertas, $arrayTodosEstablecimientos, $itemsSeleccionados)
	{

		return $this->resultadoServicios($arrayTodasOfertas, $arrayTodosEstablecimientos, $itemsSeleccionados, 'todo incluido');
	}




	public function filtroUniversal()
	{
		try {
			$where[] = 'voa.id_tbl_empresa in(' . implode(',', $this->configApp['id_empresa']) . ")";
			// max(IF(descripcion = 'Dolar',
			//       CostoRack,
			//       (1 * CostoRack) / factor_conversion)) MaxTarifaRack,
			//   min(IF(descripcion = 'Dolar',
			//       CostoRack,
			//       (1 * CostoRack) / factor_conversion)) MinTarifaRack,

			$precios = $this->find('first', array(
				'select' => "
				        
				    max(IF(descripcion = 'Dolar',
				        Precio,
				        (1 * precio) / factor_conversion)) MaxPrecio,
				        
				    min(IF(descripcion = 'Dolar',
				        Precio,
				        (1 * precio) / factor_conversion)) MinPrecio",
				'from'	=> 'vista_ofertas_activas voa
					        JOIN
					    tbl_moneda m ON m.id_tbl_lugar = voa.idPaises',
				'where'	=> $where,
			));
			// pr($this->error);


			$array['precios'] = array($precios);

			$whereBen = $where;
			$whereBen[] = 'tp.mostrar=1';
			$beneficios = $this->find('all', array(
				'select' => '
					    COUNT(*) total,
					    if( idPaises="239",  tp.id_tbl_tipo_beneficio_suscripcion,6) id,
					    if( idPaises="239", tp.nombre_tipo_beneficio_suscripcion,"Internacionales") nombre,
					    if( idPaises="239", tp.icobeneficio,"fas fa-globe-americas") icono,
					     if( idPaises="239",tp.estilo_tipo_beneficio_suscripcion,"internacional" )estilo,
					     if( idPaises="239",tp.color,"#E8830D" ) color',
				'from'	=> ' tbl_tipo_beneficio_suscripcion tp
						        LEFT OUTER JOIN
						    vista_ofertas_activas voa USING (id_tbl_tipo_beneficio_suscripcion)',
				'where'	=> $whereBen,
				'group'	=> 'if( idPaises="239",  tp.id_tbl_tipo_beneficio_suscripcion,6)',
				'order'	=> 'COUNT(*)',
			));
			// pr($this->error);
			if ($beneficios) {
				foreach ($beneficios as $llave => $beneficio) {
					$id = $beneficio['id'];
					unset($beneficio['id']);

					$beneficio['nombre'] = utf8_encode($beneficio['nombre']);
					$arrayBeneficios[$id] = $beneficio;
				}
			}
			$array['beneficio'] = ($arrayBeneficios);


			$tiempos = $this->find('all', array(
				'select' => 'count(*) total,CONCAT(Dias, "-", Noches) tiempo, Dias, Noches ',
				'from'	=> ' vista_ofertas_activas voa',
				'where'	=> $where,
				'order'	=> 'Dias',
				'group'	=> 'CONCAT(Dias, "-", Noches)',
			));
			// pr($this->error);
			$array['tiempo'] = $tiempos;


			$personas = $this->find('all', array(
				'select' => 'count(*) total,CONCAT(Adultos, "-", Ninos) personas, Adultos, Ninos ',
				'from'	=> ' vista_ofertas_activas voa',
				'where'	=> $where,
				'order'	=> 'Adultos',
				'group'	=> 'CONCAT(Adultos, "-", Ninos)',
			));
			$array['personas'] = $personas;

			//SERVICIOS
			//ofertas
			$serOfertas = $this->find('all', array(
				'select' => 'id_tbl_servicio_smart id,count(*) total,ser.estilo,ser.nombre_servicio_smart nombre',
				'from'	=> 'vista_ofertas_activas voa
						    join tbl_dtl_servicio_establecimiento using(id_tbl_establecimiento)
						    join tbl_servicio_smart ser using(id_tbl_servicio_smart)',
				'where'	=> $where,
				'order'	=> 'count(*) desc',
				'group'	=> 'id_tbl_servicio_smart',
				'limit'	=> '10',
			));
			if ($serOfertas) {
				foreach ($serOfertas as $llave => $serOferta) {

					$serOferta['nombre'] = utf8_encode($serOferta['nombre']);
					$id = $serOferta['id'];
					unset($serOferta['id']);
					$arrayServicios[$id] = $serOferta;
				}
			}

			//establecimientos

			$serEstablecimientos = $this->find('all', array(
				'select' => 'id_tbl_servicio_smart id,count(*) total,ser.estilo,ser.nombre_servicio_smart nombre',
				'from'	=> ' vista_ofertas_activas voa
						    join
						    tbl_servicio_oferta using(id_tbl_oferta)
						    join tbl_servicio_smart ser using(id_tbl_servicio_smart)',
				'where'	=> $where,
				'order'	=> 'count(*) desc',
				'group'	=> 'id_tbl_servicio_smart',
				'limit'	=> '10',
			));
			if ($serEstablecimientos) {
				foreach ($serEstablecimientos as $llave => $serEstablecimiento) {
					$serEstablecimiento['nombre'] = utf8_encode($serEstablecimiento['nombre']);
					$id = $serEstablecimiento['id'];
					unset($serEstablecimiento['id']);
					$arrayServicios[$id] = $serEstablecimiento;
				}
			}
			// pr(count($arrayServicios));
			$array['servicios'] = $arrayServicios;
			$this->filtro = $array;

			return $array;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 *
	 */
	public function getDisponibilidadRemate($id_oferta)
	{
		try {
			$where[] = 'mes = MONTH(ADDDATE(CURDATE(), INTERVAL - 1 MONTH))';
			$where[] = 'ano = YEAR(ADDDATE(CURDATE(), INTERVAL - 1 MONTH))';
			$where[] = 's.id_tbl_oferta =' . $id_oferta;
			$saldos = $this->find('first', array(
				'select' => ' s.saldo,
    					o.id_tbl_producto ',
				'from'	=> ' tbl_saldos s
				        JOIN
				    tbl_oferta o ON s.id_tbl_oferta = o.id_tbl_oferta',
				'where'	=> $where
			));
			if (!$saldos)
				return 0;
			$saldototal = $saldos['saldo'];
			$whereing[] = 'ck.id_tbl_movimiento = 11';
			$whereing[] = 'ck.id_tbl_activacion = 1';
			$whereing[] = 'MONTH(fecha) = MONTH(CURDATE())';
			$whereing[] = 'YEAR(fecha) = YEAR(CURDATE())';
			$whereing[] = 'dk.id_tbl_producto =' . $saldos['id_tbl_producto'];
			$ingresos = $this->find('first', array(
				'select' => '  SUM(dk.cantidad) AS ingresos',
				'from'	=> ' tbl_cab_kardex ck
					        INNER JOIN
					    tbl_dtl_kardex dk ON ck.id_tbl_cab_kardex = dk.id_tbl_dtl_kardex
					        AND ck.id_tbl_movimiento = dk.id_tbl_movimiento
					        ',
				'where'	=> $whereing
			));
			$ingresostotal = $ingresos['ingresos'];
			if (!$ingresos)
				$ingresostotal = 0;
			$whereegreos[] = 'm.id_tbl_tipo_movimiento = 2';
			$whereegreos[] = 'ck.id_tbl_activacion = 1';
			$whereegreos[] = 'MONTH(fecha) = MONTH(CURDATE())';
			$whereegreos[] = 'YEAR(fecha) = YEAR(CURDATE())';
			$whereegreos[] = 'dk.id_tbl_producto =' . $saldos['id_tbl_producto'];
			$egresos = $this->find('first', array(
				'select' => 'SUM(dk.cantidad) AS egresos',
				'from'	=> ' tbl_cab_kardex ck
					        INNER JOIN
					    tbl_dtl_kardex dk ON ck.id_tbl_cab_kardex = dk.id_tbl_dtl_kardex
					        AND ck.id_tbl_movimiento = dk.id_tbl_movimiento
					        INNER JOIN
					    tbl_movimiento m ON ck.id_tbl_movimiento = m.id_tbl_movimiento',
				'where'	=> $whereegreos,
			));
			$egresostotal = $egresos['egresos'];
			if (!$egresos)
				$egresostotal = 0;

			$valor = $saldototal + ($ingresostotal - $egresostotal);

			return $valor;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * [listaPrecios description]
	 * @param  array       $idOfertas   [description]
	 * @param  string|null $rangofechas [description]
	 * @return [type]                   [description]
	 */
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


	/**
	 * [setTblEstablecimiento guardar información en tabla de establecimieno]
	 * @param [type] $campos [campso de acurdo a estrurctira de tabla]
	 * @return [type] $id [id de establecimiento]
	 */
	public function setTblEstablecimiento($campos)
	{
		try {

			$this->table = 'tbl_establecimiento';
			$this->fields = $campos;
			if (!$id_tbl_establecimiento = $this->save())
				throw new 	Exception($this->error, $this->codeerror);
			return  $id_tbl_establecimiento;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();

			return false;
		}
	}
	/**
	 * [setTblInfoIndice info indice agregar en tabla]
	 * @param [type] $campos [id con estrudutra de tabla]
	 * @return [int] [id_infoindice]
	 */
	public function setTblInfoIndice($campos)
	{
		try {

			$this->table = 'tbl_info_indice';
			$this->fields = $campos;
			if (!$id_tbl_info_indice = $this->save())
				throw new 	Exception($this->error, $this->codeerror);
			return  $id_tbl_info_indice;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();

			return false;
		}
	}


	/**
	 * [setTblDtlDirectorioEstablecimiento talba de detalle directorio(personas encargadas ) y establecimiento]
	 * @param [type] $campos [campos y valores deacuerdo a la estructura de la tabla]
	 * @return id id_ del detalle de la table
	 */
	public function setTblDtlDirectorioEstablecimiento($campos)
	{
		try {

			$this->table = 'tbl_dtl_directorio_establecimiento';
			$this->fields = $campos;
			if (!$id_tbl_dtl_directorio_establecimiento = $this->save())
				throw new Exception($this->error, $this->codeerror);

			return  $id_tbl_dtl_directorio_establecimiento;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();

			return false;
		}
	}

	/**
	 * Crear de establecimientos, gestionr info indice, tbl_establecimiento, 
	 * @param array $post estructura y valores de la table
	 * @return id id d establecimiento
	 */
	public function setEstablecimiento($post)
	{
		try {
			// pr($post);
			//crear establecimient
			$dataInfo['id_tbl_tipo_informacion'] = 1;
			$dataInfo['id_tbl_activacion']		= 1;
			$dataInfo['fecha']					= date('Y-m-d H:i:s');
			$dataInfo['titulo'] 				= $post['nombre'];

			$dataInfo['keywords']  				= (isset($post['keywords'])) ? $post['keywords'] : $post['nombre'];
			$dataInfo['resumen']  				= (isset($post['resumen'])) ? $post['resumen'] : $post['nombre'];


			if (isset($post['lat']))
				$dataInfo['latitud']  			= $post['lat'];

			if (isset($post['lon']))
				$dataInfo['longitud']  			= $post['lon'];

			$dataInfo['id_tbl_servicio'] 		= $post['id_servicio'];
			$dataInfo['id_tbl_lugar'] 			= $post['id_lugar'];
			if (!isset($post['id_tbl_info_indice1'])) {
				//buscar el info indice del lugar
				$infoLugar = $this->find('first', array(
					'select' => 'id_tbl_info_indice,titulo,resumen',
					'from'	=> 'tbl_info_indice',
					'where'	=> 'id_tbl_tipo_informacion = 3 and id_tbl_lugar=' . $post['id_lugar'],
				));


				if ($infoLugar)
					$dataInfo['id_tbl_info_indice1'] = $infoLugar['id_tbl_info_indice'];
			}


			if (!$id_info_indice     			= $this->setTblInfoIndice($dataInfo))
				throw new Exception("Error Processing Request", 1);



			$dataEstablecimiento['catalogacion']				= $post['catalogacion'];
			$dataEstablecimiento['id_tbl_directorio_establecimiento']				= $post['id_directorio'];
			// $dataEstablecimiento['id_tbl_dtl_directorio_establecimiento']=$post[''] ;
			$dataEstablecimiento['direccion_establecimiento']	= $post['direccion'];
			$dataEstablecimiento['id_tbl_info_indice']			= $id_info_indice;
			if (isset($post['id_foto']))
				$dataEstablecimiento['id_tbl_foto']				= $post['id_foto'];

			$dataEstablecimiento['id_tbl_estado_modificacion'] 	= (isset($post['estado_modificacion'])) ? $post['estado_modificacion'] : 1;
			$dataEstablecimiento['id_tbl_estado_establecimiento'] = (isset($post['estado_establecimiento'])) ? $post['estado_establecimiento'] : 1;
			$dataEstablecimiento['id_tbl_usuario'] 				= $post['id_usuario'];
			$dataEstablecimiento['prioridad'] 					= (isset($post['prioridad'])) ? $post['prioridad'] : 99;






			// pr($dataEstablecimiento);
			if (!$id_establecimiento = $this->setTblEstablecimiento($dataEstablecimiento))
				throw new Exception($this->error, $this->codeerror);

			//crear info indice

			//crear detalle
			$dataDtl['id_tbl_cargo'] = (isset($post['id_cargo']) and $post['id_cargo'] > 0) ? $post['id_cargo'] : 1;;
			$dataDtl['id_tbl_directorio'] = $post['id_directorio'];
			$dataDtl['id_tbl_establecimiento'] = $id_establecimiento;
			if (!$id_setTblDtlDirectorioEstablecimiento = $this->setTblDtlDirectorioEstablecimiento($dataDtl))
				throw new Exception($this->error, $this->codeerror);

			if ($id_setTblDtlDirectorioEstablecimiento > 0) {
				$this->table = 'tbl_establecimiento';
				$this->fields = array('id_tbl_dtl_directorio_establecimiento' => $id_setTblDtlDirectorioEstablecimiento);
				$this->where = 'id_tbl_establecimiento=' . $id_establecimiento;
				if (!$tmp = $this->update())
					throw new Exception($this->error, $this->codeerror);
			}
			/**
			 * enviar email de notificacion a cliente y a ventas
			 */

			if ($post['demo'] == true)

				$demoTxtSuject = '(EMAIL DE PRUEBA) ';


			$info['subject']		= $demoTxtSuject . "Alta de Establecimiento  - " . $this->configApp['nombreEmpresa'];
			$info['email']			= $post['usuario']['email'];
			$info['nombreUsuario']	= $post['usuario']['nombre'];

			$info['id_servicio'] 	= $this->id_servicio;
			$info['ciudad'] 		= $infoLugar['titulo'];
			$info['nombreEstablecimiento'] 	= $post['nombre'];

			$info['usuario_nombre']	= $post['usuario']['nombre'];
			$info['usuario_email']	= $post['usuario']['email'];
			$info['usuario_telefono'] 	= $post['usuario']['telefono'];
			$info['usuario_pass'] 	= $post['usuario']['pass'];
			$info['activar_data_notificacion'] = false;
			// $param = $dataEstablecimiento['id_tbl_usuario'].'::'.$id_establecimiento ;
			$param 					= 'idusuario=' . $dataEstablecimiento['id_tbl_usuario'] . '::idestablecimiento=' . $id_establecimiento;

			// $identificador = urlencode( encriptar($info['usu_o_email'].'::'.$ltContrasena.'::'.$identificador.'::'.$info['nombre']));

			$info['url_activacion'] 	= 'token=' . urlencode($this->app->encriptar($param));
			//$info['url_activacion'] 	= 'param='.$param.'&token='.urlencode($this->app->encriptar($param));
			$info['addaddress']     = [];  // ← esto falta, causa el error
			$info['bcc']     = [];
			$this->app->sendContacto('12', $info);
			//copia a vendedores

			$info['subject']		= 'Admin-' . $demoTxtSuject . "Alta de Establecimiento  - " . $this->configApp['nombreEmpresa'];
			if ($post['demo'] == false) {

				$info['bcc'][] = array('email' => 'gerencia@visitaecuador.com', 'nombre' => 'Bernardo');
				$info['bcc'][] = array('email' => 'GAdministrativo@visitaecuador.com', 'nombre' => 'Diego');
				$info['bcc'][] = array('email' => 'subgerencia@visitaecuador.com', 'nombre' => 'Ma. Andrea');
				$info['bcc'][] = array('email' => 'bernardopoloc@visitaecuador.com', 'nombre' => 'Bernardito');
				$info['bcc'][] = array('email' => 'gventas@visitaecuador.com', 'nombre' => 'Jose');
				$info['bcc'][] = array('email' => 'webdeveloper@visitaecuador.com', 'nombre' => 'Desarrollador');
			}

			$info['email']			= 'fgorellana@visitaecuador.com';
			$info['activar_data_notificacion'] = true;
			$this->app->sendContacto('12', $info);
			return $id_establecimiento;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();

			return false;
		}
	}


	/**
	 * [deleteServiciosEstablecimiento bottar servicios establecimiento 2020-08-18]
	 * @param  [type] $data [where]
	 * @return [bolean]       [description]
	 */
	private function deleteServiciosEstablecimiento($data)
	{
		try {
			if (!(is_array($data) and count($data) > 0))
				throw new Exception("necesito datos", 1);
			if (!$this->delete("tbl_dtl_servicio_establecimiento", $data))
				throw new Exception($this->error . "No de puedo guardar en tbl_dtl_servicio_establecimiento", 1);
			return true;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	/**
	 * [deleteServiciosEstablecimientoPorEstablecimiento description 2020-08-18]
	 * @return [bolena] [si todo estuvo ok]
	 */
	public function deleteServiciosEstablecimientoPorEstablecimiento()
	{
		try {
			if (!$this->id_establecimiento > 0)
				throw new Exception("Necesitamos id de establecimiento", 1);
			return $this->deleteServiciosEstablecimiento(array('id_tbl_establecimiento =' . $this->id_establecimiento));
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * [setServicioEstablecimiento asginar servicios establecimiento 2020-08-18]
	 * @param [array] $id_servicios [description]
	 * @param [array] $detalles     [description]
	 * @return [array]       [id se servicio establecimiento]
	 */
	public function setServicioEstablecimiento($id_servicios, $detalles)
	{
		try {
			if (!$this->id_establecimiento > 0)
				throw new Exception("Error Processing Request", 1);

			if (!(count($id_servicios) > 0 and is_array($id_servicios)))
				throw new Exception("servicios no son ", 1);


			//eliminar detalle de servicios anteriores del establecimiento
			$this->deleteServiciosEstablecimientoPorEstablecimiento();

			//agregar los ejegidos.
			foreach ($id_servicios as $id_servicio => $serv) {
				# code...
				unset($campos);
				$campos['id_tbl_servicio_smart'] 	= $id_servicio;
				$campos['id_tbl_establecimiento'] 	= $this->id_establecimiento;
				if (isset($detalles[$id_servicio]) and !empty($detalles[$id_servicio]))
					$campos['detalle'] 	= $detalles[$id_servicio];
				$this->table = "tbl_dtl_servicio_establecimiento";
				$this->fields = $campos;
				if (!$id_tbl_dtl_servicio_establecimiento[] = $this->save())
					throw new Exception("No de puedo guardar en detalle servicio_establecimiento", 1);
			}

			return $id_tbl_dtl_servicio_establecimiento;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}





	/**
	 * [deleteServiciosOferta bottar servicios oferta 2020-08-21]
	 * @param  [type] $data [where]
	 * @return [bolean]       [description]
	 */
	private function deleteServiciosOferta($data)
	{
		try {
			if (!(is_array($data) and count($data) > 0))
				throw new Exception("necesito datos", 1);
			if (!$this->delete("tbl_servicio_oferta", $data))
				throw new Exception($this->error . "No de puedo guardar en  servicio_oferta", 1);
			return true;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	/**
	 * [deleteServiciosOfertaPorOferta oferta 2020-08-21]
	 * @return [bolena] [si todo estuvo ok]
	 */
	public function deleteServiciosOfertaPorOferta()
	{
		try {
			if (!$this->id_oferta > 0)
				throw new Exception("Necesitamos id de oferrta", 1);
			return $this->deleteServiciosOferta(array('id_tbl_oferta =' . $this->id_oferta));
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * [setServicioOferta asginar servicios Oferta 2020-08-21]
	 * @param [array] $id_servicios [description]
	 * @param [array] $detalles     [description]
	 * @return [array]       [id se servicio establecimiento]
	 */
	public function setServicioOferta($id_servicios, $detalles)
	{
		try {
			if (!$this->id_oferta > 0)
				throw new Exception("Error Processing Request", 1);

			if (!(count($id_servicios) > 0 and is_array($id_servicios)))
				throw new Exception("servicios no son ", 1);


			//eliminar detalle de servicios anteriores del establecimiento
			$this->deleteServiciosOfertaPorOferta();

			//agregar los ejegidos.
			foreach ($id_servicios as $id_servicio => $tipoDetalle) {
				# code...
				if ($tipoDetalle > 0) {

					unset($campos);
					$campos['id_tbl_servicio_smart'] 	= $id_servicio;
					$campos['id_tbl_oferta'] 			= $this->id_oferta;
					$campos['id_tbl_tipo_detalle'] 		= $tipoDetalle;
					if (isset($detalles[$id_servicio]) and !empty($detalles[$id_servicio]))
						$campos['detalle_o_comentario'] 	= $detalles[$id_servicio];
					$this->table = "tbl_servicio_oferta";
					$this->fields = $campos;
					if (!$id_tbl_dtl_servicio_establecimiento[] = $this->save())
						throw new Exception("No de puedo guardar en detalle servicio_establecimiento", 1);
				}
			}

			return $id_tbl_dtl_servicio_establecimiento;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getServicios($data = array())
	{
		try {


			$where[] = 'sm.id_tbl_activacion = 1';
			if (is_array($data['id_servicio']) and count($data['id_servicio']) > 1)
				$where[] = 'sm.id_tbl_servicio_smart in( ' . implode(',', $data['id_servicio']) . ')';
			if (is_int($data['id_servicio']) and $data['id_servicio'] > 0)
				$where[] = 'sm.id_tbl_servicio_smart = ' . $data['id_servicio'];

			if (is_int($data['id_servicio']) and $data['id_servicio'] > 0)
				$where[] = 'sm.id_tbl_servicio_smart = ' . $data['id_servicio'];


			$servicios = $this->find('all', array(
				'select' => 'sm.id_tbl_servicio_smart,nombre_tipo_servicio_smart nombre_tipo,nombre_servicio_smart nombre_servicio,id_tbl_servicio_smart id_servicio, tsm.id_tbl_tipo_servicio_smart id_tipo,sm.estilo',
				'from'  => 'tbl_servicio_smart sm join tbl_tipo_servicio_smart tsm using(id_tbl_tipo_servicio_smart)',
				'where' => $where,
				'order' => 'tsm.id_tbl_tipo_servicio_smart asc, nombre_servicio_smart asc ',
			));
			if (!$servicios)
				throw new Exception($this->error, 1);
			return $servicios;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	/**
	 * [getEstablecimientoPorId description]
	 * @param  [type] $id [description]
	 * @return [type]     [description]
	 */
	public function getEstablecimientoPorId($id)
	{
		try {

			if (!$id > 0)
				throw new Exception("Debe existir un id", 1);

			$data['id_establecimiento'] = $id;

			return $this->getEstablecimientos($data);
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	/**
	 * [getEstablecimientoPorId description]
	 * @param  [type] $id [description]
	 * @return [type]     [description]
	 */
	public function getEstablecimientoPorUsuario($id, $order = null)
	{
		try {

			if (!$id > 0)
				throw new Exception("Debe existir un id", 1);
			if ($order != null)
				$data['order'] = $order;
			$data['id_usuario'] = $id;

			return $this->getEstablecimientos($data);
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	public function getEstablecimientos($data)
	{
		try {
			$type = "all";
			if (isset($data['id_establecimiento']) and $data['id_establecimiento'] > 0) {
				$where[] = 'est.id_tbl_establecimiento=' . $data['id_establecimiento'];
				$type = "first";
			}
			if (isset($data['id_usuario']) and $data['id_usuario'] > 0) {
				$where[] = 'est.id_tbl_usuario=' . $data['id_usuario'];
			}
			$order = '';
			if (!empty($data['order'])) {
				foreach ($data['order'] as $key => $val) {

					switch ($key) {
						case 'fecha':
							$order = 'ii.fecha ' . $val;
							break;
					}
				}
			}
			$establecimientos = $this->find($type, array(
				'select' => 'p.id_tbl_lugar id_lugar_provincia, tipo_categorizacion,	
				c.desc_lugar nombreCiudad, p.desc_lugar nombreProvincia, 
				s.descripcion_servicio,ii.titulo, ii.keywords,ii.id_tbl_lugar id_ciudad, 
				ii.latitud, ii.longitud, ii.id_tbl_foto id_tbl_foto_info_indice , ii.id_tbl_servicio,est.id_tbl_establecimiento, 
				est.catalogacion, id_tbl_dtl_directorio_establecimiento,
				est.direccion_establecimiento,est.id_tbl_info_indice,
				est.id_tbl_foto,
				ii.resumen,
				ii.id_tbl_foto id_foto_principal,
				est.id_tbl_estado_modificacion,
				est.id_tbl_usuario,est.prioridad,est.id_tbl_estado_establecimiento,
				est.verificado,est.id_tbl_directorio_establecimiento,ii.fecha,est.id_tbl_estado_proceso',
				'from'	=> 'tbl_establecimiento est 
							join tbl_info_indice ii using(id_tbl_info_indice) 
							left outer join tbl_tipo_informacion ti using(id_tbl_tipo_informacion) 
							join tbl_servicio s using(id_tbl_servicio)
							left outer join tbl_lugar c using(id_tbl_lugar) 
              				left outer join tbl_lugar p on p.id_tbl_lugar = c.id_tbl_lugarpadre ',
				'where'	=> $where,
				'order'	=> $order,
			));

			if (!$establecimientos)
				throw new Exception($this->error, 1);


			return $establecimientos;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getRipoEstablecimiento()
	{
		try {
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getServiciosTipoEstablecimiento()
	{
		try {
			$data['id_tbl_clasificacion_oferta'] = 1 || 2 || 5 || 9;
			return $this->getServiciosEstablecimiento($data);
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getServiciosEstablecimiento($data)
	{
		try {


			if (is_int($data['id_tbl_clasificacion_oferta']) and $data['id_tbl_clasificacion_oferta'] > 0)
				$where[] = 'id_tbl_clasificacion_oferta = ' . $data['id_tbl_clasificacion_oferta'];


			$servicios = $this->find('all', array(
				'select' => '*',
				'from'	=> 'tbl_servicio',
				'where'	=> $where,
				'order'	=> 'descripcion_servicio',
			));
			if (!$servicios)
				throw new Exception($this->error, 1);

			return $servicios;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}


	public function getContratoPorEstablecimiento($id)
	{
		try {
			if (!$id > 0)
				throw new Exception("necesitamos un id", 1);

			return $this->getContratos(array('est.id_tbl_establecimiento=' . $id));
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getContratosPorUsuario($id)
	{
		try {
			if (!$id > 0)
				throw new Exception("necesitamos un id", 1);

			return $this->getContratos(array('est.id_tbl_usuario=' . $id));
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	private function getContratos($where)
	{
		try {
			$where[] = 'c.id_tbl_activacion = 1';
			$contratos = $this->find('all', array(
				'select' => 'est.*,c.id_tbl_contrato,id_tbl_contrato, c.fecha, c.fecha_ini, c.fecha_fin, c.id_tbl_establecimiento,if(date(now()) between fecha_ini and fecha_fin , "activo","inactivo") estado',
				'from'	=> 'tbl_contrato c join tbl_establecimiento est using(id_tbl_establecimiento)',
				'where'	=> $where,
				'order'	=> 'id_tbl_contrato desc',
			));
			if (!$contratos)
				throw new Exception($this->error, 1);

			return $contratos;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}


	/**	
	 * 
	 */
	public function getTipoHabitacion()
	{
		try {
			$tipo = $this->find('all', array(
				'select' => '*',
				'from'	=> 'tbl_tipo_habitacion',
				'where'	=> '1=1',
				'order'	=> 'nombre',
			));
			// pr($tipo);
			if (!$tipo)
				throw new Exception($this->erorr, 1);

			return $tipo;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getHabitaciones($data)
	{
		try {
			$type = 'all';
			if (isset($data['id_habitacion']) and $data['id_habitacion'] > 0) {

				$type = 'first';
				$where[] = 'id_tbl_habitacion=' . $data['id_habitacion'];
			}

			if (isset($data['id_establecimiento']) and $data['id_establecimiento'] > 0)
				$where[] = 'id_tbl_establecimiento=' . $data['id_establecimiento'];
			$habitaciones = $this->find($type, array(
				'select' => 'h.*,th.nombre nombreTipoHabitacion ',
				'from'	=> 'tbl_habitacion h join tbl_tipo_habitacion th using(id_tbl_tipo_habitacion)',
				'where'	=> $where,
				'order'	=> 'id_tbl_habitacion',
			));
			if (!$habitaciones)
				throw new Exception($this->error, 1);

			return $habitaciones;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	public function getHabitacionesPorEstablecimiento($id)
	{
		try {
			return $this->getHabitaciones(array('id_establecimiento' => $id));
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getHabitacion($id)
	{

		try {
			return $this->getHabitaciones(array('id_habitacion' => $id));
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	private function getCamas($data)
	{
		try {

			$type = 'all';
			if (!isset($data['id_habitacion']) or !$data['id_habitacion'] > 0)
				throw new Exception("Es necesarios id", 1);

			$where[] = 'id_tbl_habitacion=' . $data['id_habitacion'];
			$camas = $this->find('all', array(
				'select' => '*',
				'from'	=> 'tbl_habitacion_cama',
				'where'	=> $where,

			));
			if (!$camas)
				throw new Exception($this->error . $this->lastQuery, 1);

			return $camas;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	public function getCamasPorHabitacion($id)
	{
		try {

			return $this->getCamas(array('id_habitacion' => $id));
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}



	public function setSeguimientoSmart($id_usuario, $id_establecimiento, $etapa)
	{
		try {

			$fields['id_tbl_smart_etapa'] = $etapa;

			switch ($etapa) {
				case '1':
					# code...
					$estado = 'registro';
					break;
				case '2':
					# code...
					$estado = 'activacionemail';
					break;
				case '3':
					# code...
					$estado = 'configurarEstablecimiento';
					break;

				default:
					# code...
					break;
			}
			$fields['fecha'] = date('Y-m-d H:i:s');
			if ($id_usuario > 0)
				$fields['id_tbl_usuario'] = $id_usuario;
			if ($id_establecimiento > 0)
				$fields['id_tbl_establecimiento'] = $id_establecimiento;
			$fields['estado'] = $estado;

			$this->table = "tbl_seguimiento_smart";
			$this->fields = $fields;
			if (!$id_tbl_seguimiento_smart = $this->save())
				throw new Exception("No de puedo guardar en tbl_seguimiento_smart", 1);
		} catch (Exception $e) {


			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getSeguimientoEstablecimientoSmart($id_usuario)
	{
		try {
			if (!$id_usuario > 0)
				throw new Exception("se necesita id", 1);
			if ($establecimientos = $this->getEstablecimientoPorUsuario($id_usuario, array('fecha' => 'desc')))
				foreach ($establecimientos as $key => $establecimiento) {
					$etapa = $this->comprobarEtapasEstablecimiento($establecimiento['id_tbl_establecimiento']);
					// pr($etapa);
					if (!$etapa['estado']) {
						// $arrayEstablecimientosPendientes[$establecimiento['id_tbl_establecimiento']]['id'] 				= $establecimiento['id_tbl_establecimiento'];
						$arrayEstablecimientosPendientes[$establecimiento['id_tbl_establecimiento']]['etapa'] 		= $etapa;
						$arrayEstablecimientosPendientes[$establecimiento['id_tbl_establecimiento']]['establecimiento'] 		= $establecimiento;
						// $arrayEstablecimientosPendientes[$establecimiento['id_tbl_establecimiento']]['nombreEtapa'] = $establecimiento['nombreEtapa'] ;
					}
				}
			else
				throw new Exception("no hay", 1);


			// $establecimientos = $this->find('all',array(
			// 	'select'=>'id_tbl_establecimiento id, max(id_tbl_smart_etapa) etapa, se.nombre nombreEtapa',
			// 	'from'	=>'tbl_seguimiento_smart ss join tbl_smart_etapa se using(id_tbl_smart_etapa)',
			//     'where'    =>'id_tbl_usuario ='.$id_usuario, 
			// 	// 'where'	=>'', 
			// 	'order'	=>'etapa desc', 
			// 	'group' =>'id_tbl_establecimiento', 
			// 	));
			// if(!$establecimientos)
			// throw new Exception($this->error, 1);

			// foreach ($establecimientos as $key => $establecimiento) {
			// 	# code...
			// 	if($establecimiento['etapa'] < 7)
			// 	{

			// 		$arrayEstablecimientosPendientes[$establecimiento['id']] = $this->getEstablecimientoPorId($establecimiento['id']);
			// 		$arrayEstablecimientosPendientes[$establecimiento['id']]['etapa'] = $establecimiento['etapa'] ;
			// 		$arrayEstablecimientosPendientes[$establecimiento['id']]['nombreEtapa'] = $establecimiento['nombreEtapa'] ;
			// 	}
			// }

			return $arrayEstablecimientosPendientes;
		} catch (Exception $e) {


			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getServiciosMasUtilizado($data)
	{
		try {
			//code...
			if (isset($data['id_tipo_smart']))
				$where[] = 'sm.id_tbl_tipo_servicio_smart in (' . implode(',', $data['id_tipo_smart']) . ')';
			if (!isset($where))
				$where[] = '1=1';
			$idiomas = $this->find('all', array(
				'select' => ' sm.nombre_servicio_smart nombre,id_tbl_servicio_smart id,count(*) total',
				'from' => 'tbl_dtl_servicio_establecimiento dtl join tbl_servicio_smart sm using(id_tbl_servicio_smart)',
				'where' => $where,
				'group' => 'id_tbl_servicio_smart',
				'order' => 'count(*) desc,nombre_servicio_smart desc',
				'limit' => 30
			));
			if (!$idiomas)
				throw new Exception($this->error, 1);

			return $idiomas;
		} catch (Exception $e) {
			//throw $th;

			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getServiciosMasUtilizadoSmart($data)
	{
		try {
			//code...
			if (isset($data['id_tipo_smart']))
				$where[] = 'sm.id_tbl_smart_tipo_servicio in (' . implode(',', $data['id_tipo_smart']) . ')';
			if (!isset($where))
				$where[] = '1=1';
			$idiomas = $this->find('all', array(
				'select' => ' sm.nombre_servicio_smart nombre,id_tbl_servicio_smart id,count(*) total',
				'from' => 'tbl_dtl_servicio_establecimiento dtl join tbl_smart_servicio sm using(id_tbl_servicio_smart)',
				'where' => $where,
				'group' => 'id_tbl_servicio_smart',
				'order' => 'count(*) desc,nombre_servicio_smart desc',
				'limit' => 30
			));
			if (!$idiomas)
				throw new Exception($this->error, 1);

			return $idiomas;
		} catch (Exception $e) {
			//throw $th;

			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	public function getServiciosSmart($data)
	{
		try {

			if (isset($data['tipo_smart']))
				$where[] = 'id_tbl_smart_tipo_servicio in (' . implode(',', $data['tipo_smart']) . ')';

			if (!isset($where))
				$where[] = '1=1';

			$consulta = array(
				'select' => 'ss.nombre_servicio_smart,sts.nombre_tipo_servicio_smart,id_tbl_smart_tipo_servicio,id_tbl_servicio_smart,estilo',
				'from' => 'tbl_smart_servicio ss join tbl_smart_tipo_servicio sts using(id_tbl_smart_tipo_servicio)',
				'where' => $where,
				'group' => 'id_tbl_servicio_smart',
				'order' => 'sts.orden asc, ss.nombre_servicio_smart'
			);


			if (!$servicios = $this->find('all', $consulta))
				throw new Exception($this->error, 1);

			return $servicios;
		} catch (Exception $e) {

			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function setParqueo($id, $parqueos, $tipo)
	{
		try {
			// pr('tipo:'.$tipo);
			if (!$id > 0)
				throw new Exception('necesitamos id de establecimiento', 1);

			//borrar datos de pequeo anteiroes del id de establecimeinto perteneciones
			$this->delete('tbl_establecimiento_parqueo', 'id_tbl_establecimiento=' . $id);
			if ($tipo > 1) {
				//agregar nuevos atributos
				$campos 			= $parqueos;
				$campos['fecha']	= date('Y-m-d H:i:s');
				$campos['id_tbl_establecimiento']	= $id;
				$this->table = "tbl_establecimiento_parqueo";
				$this->fields = $campos;
				$id_tmp = $this->save();
			}
			return true;
		} catch (Exception $e) {

			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getParqueoPorEstablecimiento($id)
	{
		try {

			if (!$id > 0)
				throw new Exception('debe colocar el establecimiento', 1);


			$campos['select']	= '*';
			$campos['from']		= 'tbl_establecimiento_parqueo';
			$campos['where']	= 'id_tbl_establecimiento=' . $id;

			if (!$parqueo = $this->find('all', $campos))
				throw new Exception($this->error, 1);


			return $parqueo;
		} catch (Exception $e) {

			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function setDesayuno($id, $desayunos)
	{
		try {
			if (!$id > 0)
				throw new Exception('necesitamos id de establecimiento', 1);

			//borrar datos de pequeo anteiroes del id de establecimeinto perteneciones
			$this->delete('tbl_establecimiento_desayuno', 'id_tbl_establecimiento=' . $id);
			//agregar nuevos atributos
			if (count($desayunos) > 0)
				foreach ($desayunos as $key => $desayuno) {

					$campos 			= $desayuno;
					$campos['fecha']	= date('Y-m-d H:i:s');
					$campos['id_tbl_establecimiento']	= $id;
					// pr($campos);
					$this->table = "tbl_establecimiento_desayuno";
					$this->fields = $campos;
					$id_tmp = $this->save();
					// pr($this->error);
					// pr($this->lastQuery);
				}




			return true;
		} catch (Exception $e) {

			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	public function getDesayunos($data)
	{
		try {

			if (isset($data['order']))
				$campos['order']	= $data['order'];

			$campos['select']	= 'id_tbl_desayuno id, nombre';
			$campos['from']		= 'tbl_desayuno';
			$campos['where']	= '1=1';

			if (!$desayunos = $this->find('all', $campos))
				throw new Exception($this->error, 1);
			return $desayunos;
		} catch (Exception $e) {

			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function setIdioma($id, $idiomas)
	{
		try {
			if (!$id > 0)
				throw new Exception('necesitamos id de establecimiento', 1);

			//borrar datos de pequeo anteiroes del id de establecimeinto perteneciones
			$this->delete('tbl_establecimiento_idioma', 'id_tbl_establecimiento=' . $id);
			//agregar nuevos atributos
			foreach ($idiomas as $key => $idioma) {

				$campos 			= $idioma;
				$campos['fecha']	= date('Y-m-d H:i:s');
				$campos['id_tbl_establecimiento']	= $id;
				// pr($campos);
				$this->table = "tbl_establecimiento_idioma";
				$this->fields = $campos;
				$id_tmp = $this->save();
			}




			return true;
		} catch (Exception $e) {

			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	public function setEstablecimientoServicios($id, $data)
	{
		try {

			if (!$id > 0)
				throw new Exception('necesitamos id de establecimiento', 1);

			//borrar datos de pequeo anteiroes del id de establecimeinto perteneciones
			if (count($data['servicios']) > 0) {
				// pr($data['servicios']);
				$this->delete('tbl_establecimiento_servicio', 'id_tbl_establecimiento=' . $id);
				foreach ($data['servicios'] as $key => $id_servicio) {
					# code...
					unset($campos);
					$campos = 	array(
						'id_tbl_establecimiento' => $id,
						'id_tbl_servicio_smart' => $id_servicio,
						'fecha' 				=> date('Y-m-d H:i:s')
					);
					if (isset($data['extra'][$id_servicio]) and !empty($data['extra'][$id_servicio]))
						$campos['detalle'] = $data['extra'][$id_servicio];
					// pr($campos);
					$this->table = 'tbl_establecimiento_servicio';
					$this->fields = $campos;
					if (!$tmp = $this->save())
						throw new Exception($this->error . $this->lastQuery, 1);
				}
			}
			//agregar nuevos atributos

			return true;
		} catch (Exception $e) {

			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getTipoCamas()
	{
		try {
			$camas = $this->find('all', array(
				'select' => '*',
				'from'    => 'tbl_cama',
				'where'    => '1=1',
				'order'    => 'nombre',
			));
			if (!$camas)
				throw new Exception($this->error, 1);
			return $camas;
		} catch (Exception $e) {
			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	public function setCamasSupletorias($id, $id_establecimiento = 0, $data)
	{
		try {
			// pr($data);

			foreach ($id as $key => $idh) {
				if (!$idh > 0)
					throw new Exception('debe colocar un id de habitacion', 1);
				$this->delete('tbl_habitacion_cama_supletoria', 'id_tbl_habitacion=' . $idh);
				if (count($data) > 0) {

					$campos = $data;
					$campos['id_tbl_habitacion'] = $idh;
					$campos['fecha'] = date('Y-m-d H:i:s');
					if ($id_establecimiento > 0)
						$campos['id_tbl_establecimiento'] = $idh;

					$this->table = 'tbl_habitacion_cama_supletoria';
					$this->fields = $campos;

					if (!$tmp = $this->save())
						throw new Exception('no se gurado', 1);
				}
			}

			return false;
		} catch (Exception $e) {
			$this->error 		= $e->getMessage();
			$this->codeerror 	= $e->getCode();
			return false;
		}
	}

	public function getCamasSupletorias($id)
	{
		try {
			if (!$id > 0)
				throw new Exception('id de habitacion', 1);
			$where[] = 'id_tbl_habitacion=' . $id;
			$camas = $this->find('first', array(
				'select' => 'id_tbl_establecimiento,
						id_tbl_habitacion,
						ncamas,
						cunavalor,
						ninovalor,
						ninoedad,
						adultovalor,
						fecha',
				'from' => 'tbl_habitacion_cama_supletoria',
				'where' => $where,
			));
			return $camas;
		} catch (Exception $e) {

			$this->error 		= $e->getMessage();
			$this->codeerror 	= $e->getCode();
			return false;
		}
	}

	public function getHabitacionServicios($data)
	{
		try {
			if (isset($data['id']) and $data['id'] > 0)
				$campos['where']	= 'id_tbl_habitacion=' . $data['id'];

			$campos['select']	= '*';
			$campos['from']		= 'tbl_habitacion_servicio';

			if (!$servicios = $this->find('all', $campos))
				throw new Exception($this->error, 1);
			return $servicios;
		} catch (Exception $e) {
			$this->error 		= $e->getMessage();
			$this->codeerror 	= $e->getCode();
			return false;
		}
	}
	public function setHabitacionServicios($id, $id_establecimiento = 0, $data)
	{
		try {
			if (!count($id) > 0)
				throw new Exception('necesitamos id de habitacion', 1);

			foreach ($id as $key => $idh) {
				if ($idh > 0)
					$this->delete('tbl_habitacion_servicio', 'id_tbl_habitacion=' . $idh);


				foreach ($data['servicios'] as $key => $id_servicio) {
					# code...
					unset($campos);
					$campos = 	array(
						'id_tbl_habitacion' 	=> $idh,
						'id_tbl_servicio_smart' => $id_servicio,
						'fecha' 				=> date('Y-m-d H:i:s')
					);
					if ($id_establecimiento > 0)
						$campos['id_tbl_establecimiento'] = $id_establecimiento;
					if (isset($data['extra'][$id_servicio]) and !empty($data['extra'][$id_servicio]))
						$campos['detalle'] = $data['extra'][$id_servicio];
					// pr($campos);
					$this->table = 'tbl_habitacion_servicio';
					$this->fields = $campos;
					if (!$tmp = $this->save())
						throw new Exception($this->error . $this->lastQuery, 1);
				}
			}
			//borrar datos de pequeo anteiroes del id de establecimeinto perteneciones
			if (count($data['servicios']) > 0) {
			}
			//agregar nuevos atributos

			return true;
		} catch (Exception $e) {

			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getCondicionesPorEstablecimiento($id)
	{
		try {

			if (!$id > 0)
				throw new Exception('debe colocar el establecimiento', 1);


			$campos['select']	= '*';
			$campos['from']		= 'tbl_establecimiento_condicion';
			$campos['where']	= 'id_tbl_establecimiento=' . $id;

			if (!$condiciones = $this->find('first', $campos))
				throw new Exception($this->error, 1);


			return $condiciones;
		} catch (Exception $e) {

			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function setCondicionesPorEstablecimiento($id, $condiciones)
	{
		try {
			if (!$id > 0)
				throw new Exception('necesitamos id de establecimiento', 1);

			//borrar datos de pequeo anteiroes del id de establecimeinto perteneciones
			$this->delete('tbl_establecimiento_condicion', 'id_tbl_establecimiento=' . $id);

			//agregar nuevos atributos


			$campos 			= $condiciones;
			$campos['fecha']	= date('Y-m-d H:i:s');
			$campos['id_tbl_establecimiento']	= $id;
			// pr($campos);
			$this->table = "tbl_establecimiento_condicion";
			$this->fields = $campos;
			$id_tmp = $this->save();

			return true;
		} catch (Exception $e) {

			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getParqueoPorIdEstablecimiento($id)
	{
		try {
			if (!$id > 0)
				throw new Exception('fatal establecimiento', 1);
			$parqueo = $this->find('first', array(
				'select' =>	'*',
				'from'	=> 'tbl_establecimiento_parqueo',
				'where'	=> 'id_tbl_establecimiento=' . $id

			));
			if (!$parqueo)
				throw new Exception($this->error, 1);
			return $parqueo;
		} catch (Exception $e) {
			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	public function getDesayunosPorIdEstablecimiento($id)
	{
		try {
			if (!$id > 0)
				throw new Exception('fatal establecimiento', 1);
			$desayunos  = $this->find('all', array(
				'select' =>	'*',
				'from'	=> 'tbl_establecimiento_desayuno',
				'where'	=> 'id_tbl_establecimiento=' . $id,

			));
			if (!$desayunos)
				throw new Exception($this->error, 1);
			return $desayunos;
		} catch (Exception $e) {
			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getIdiomasPorIdEstablecimiento($id)
	{
		try {
			if (!$id > 0)
				throw new Exception('fatal establecimiento', 1);
			$idiomas = $this->find('all', array(
				'select' =>	'*',
				'from'	=> 'tbl_establecimiento_idioma',
				'where'	=> 'id_tbl_establecimiento=' . $id,

			));
			if (count($idiomas) == 0)
				throw new Exception('no hay idiomas', 1);
			if (!$idiomas)
				throw new Exception($this->error, 1);

			return $idiomas;
		} catch (Exception $e) {
			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getServiciosPorIdEstablecimiento($id)
	{
		try {
			if (!$id > 0)
				throw new Exception('fatal establecimiento', 1);

			$servicios = $this->find('all', array(
				'select' =>	'*',
				'from'	=> 'tbl_establecimiento_servicio',
				'where'	=> 'id_tbl_establecimiento=' . $id,

			));
			if (!$servicios)
				throw new Exception($this->error, 1);
			return $servicios;
		} catch (Exception $e) {
			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function comprobarEtapasEstablecimiento($id)
	{
		try {
			$respuesta = true;
			$respuestas = array();
			$respuestas['formEstablecimiento'] 	= true;
			$respuestas['formHabitaciones'] 	= false;
			$respuestas['formInstalaciones'] 	= false;
			$respuestas['formServicios'] 		= false;
			$respuestas['formFotografias'] 		= false;
			$respuestas['formCondiciones'] 		= false;

			/**
			 * VALIDACIONES POR ETAPAS DE ACTUALIZACION DE ESTABLECIMIENTO
			 */

			$actualizarEstablecimiento = true;
			/**
			 * para habitaciones
			 */
			if ($misHabitaciones = $this->getHabitacionesPorEstablecimiento($id)) {
				$respuestas['formHabitaciones'] = true;
			} else {
				#pr($id.':'."n1");				
				$respuesta = false;
			}




			/**
			 *   PARA INSTALACIONES 
			 */
			/** para parqueo */
			$miParqueo      = $this->getParqueoPorIdEstablecimiento($id);
			/** para desayunos */
			$misDesayunos   = $this->getDesayunosPorIdEstablecimiento($id);
			/** para idiomas */
			$misIdiomas     = $this->getIdiomasPorIdEstablecimiento($id);

			/** para instalaciones */
			$misInstalaciones = $this->getServiciosPorIdEstablecimiento($id);


			if ($misIdiomas and $misInstalaciones) {
				$respuestas['formInstalaciones'] 	= true;
			} else {
				$respuesta = false;
			}


			/**
			 * para servicios
			 */

			if ($misHabitaciones[0]['id_tbl_habitacion'] > 0)
				if ($misServiciosHabitacion = $this->getHabitacionServicios(array('id' => $misHabitaciones[0]['id_tbl_habitacion']))) {

					// pr($this->lastQuery);
					//  pr($misServiciosHabitacion);
					$respuestas['formServicios'] 		= true;
					$actualizarEstablecimiento = false;
					$spanOkTabsServicios = 'fa-check';

					$script = 'cargarFormulario(' . $id . ',"formFotografias");' . PHP_EOL;
				} else {
					$respuesta = false;
				}

			$miEstablecimiento = $this->getEstablecimientoPorId($id);
			/**
			 * Fotografias
			 * 
			 */
			$miGaleria = $this->getGaleriaInfo($miEstablecimiento['id_tbl_info_indice']);
			if ($miGaleria) {
				$respuestas['formFotografias'] 		= true;
				$actualizarEstablecimiento = false;
				$spanOkTabsFotografias = 'fa-check';
				$script = 'cargarFormulario(' . $id . ',"formCondiciones");' . PHP_EOL;
				$scriptShowTabs = "$('.nav-tabs a[href=\"#formCondiciones\"]').tab('show');";
			} else {
				#pr($id.':'."n4");				
				$respuesta = false;
			}
			/**
			 * Para condiciones
			 */
			$misCondiciones = $this->getCondicionesPorEstablecimiento($id);
			if ($misCondiciones) {
				$respuestas['formCondiciones'] 		= true;
				$actualizarEstablecimiento = false;
				$spanOkTabsCondiciones = 'fa-check';
			} else {
				#pr($id.':'."n5");				
				$respuesta = false;
			}

			return array('estado' => $respuesta, 'detalle' => $respuestas);
		} catch (Exception $e) {
			$this->error     = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**	
	 * obtener tarifas para mostrar como ejemplos en la tarifas d de las habitaciones
	 */
	public function getTarifasOfertas($data)
	{
		try {
			$where[] = 'DATE(NOW()) BETWEEN ofe.fecha_inicio AND ofe.fecha_fin';
			$where[] = 'ofe.id_tbl_activacion = 1';
			$where[] = 'est.id_tbl_estado_modificacion = 3';
			if ($data['catalogacion'] > 0)
				$where[] = 'catalogacion = ' . $data['catalogacion'];
			if ($data['personas'] > 0)
				$where[] = 'adultos = ' . $data['personas'];
			$order = '';
			if (!empty($data['order'])) {
				foreach ($data['order'] as $key => $val) {

					switch ($key) {
						case 'costo':
							$order = 'costo_rack ' . $val;
							break;
						case 'precio':
							$order = 'precio_oferta ' . $val;
							break;
					}
				}
			}
			if ($data['id_servicio'] > 0)
				$where[] = 'ii.id_tbl_servicio = ' . $data['id_servicio'];

			$tarifas = $this->find('all', array(
				'select' => 'min(costo_rack) costo, min(precio_oferta) precio,ii.titulo nombreOferta,iie.titulo nombreEstablecimiento,ofe.adultos, ofe.noches',
				'from' => 'tbl_oferta ofe
							JOIN
						tbl_producto prd USING (id_tbl_producto)
							JOIN
						tbl_info_indice ii USING (id_tbl_info_indice)
						JOIN
					tbl_info_indice iie on iie.id_tbl_info_indice = ii.id_tbl_info_indice1
						JOIN
						tbl_establecimiento est USING (id_tbl_establecimiento)
							',
				'group' => 'est.id_tbl_establecimiento',
				'where' => $where,
				'order' => $order
			));
			if (!$tarifas)
				throw new Exception('no hay ', 1);

			return $tarifas;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}


	/** 
	 * obtener las ofertas relacionadas con habitaciones
	 */
	public function getOfertaPorHabitacion($id_habitacion)
	{
		try {
			if (!$id_habitacion > 0)
				throw new Exception(' falta id');
			$datos = $this->find('all', array(
				'select' => '*',
				'from'  => 'tbl_oferta_habitacion',
				'where' => 'id_tbl_habitacion=' . $id_habitacion
			));
			// $miofertas = $this->verOferta(array($datos[0]['id_tbl_oferta']));

			$datosoferta = $this->find('all', array(
				'select' => '*',
				'from'  => 'tbl_oferta of join tbl_producto p using(id_tbl_producto) join tbl_info_indice ii using(id_tbl_info_indice) join tbl_contenido_informacion ci on ci.id_tbl_info_indice = ii.id_tbl_info_indice',
				'where' => 'of.id_tbl_oferta=' . $datos[0]['id_tbl_oferta']
			));
			if (!$datosoferta)
				throw new Exception($this->error, 1);

			return $datosoferta;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * guardar y relacionar ofertas y habitaciones
	 */
	public function setOfertaHabitacion($habitaciones, $id_oferta)
	{
		try {
			if (!$id_oferta > 0)
				throw new Exception('debe existir un id');

			$this->delete('tbl_oferta_habitacion', 'id_tbl_oferta=' . $id_oferta);

			foreach ($habitaciones as $key => $empresa) {
				$this->table = 'tbl_oferta_habitacion';
				$this->fields = array('id_tbl_oferta' => $id_oferta, 'id_tbl_habitacion' => $empresa, 'fecha' => date('Y-m-d H:i:s'));
				if (!$this->save())
					throw new Exception('no se pudo' . $this->error, 1);
			}
			return true;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**	
	 * obtener las empresas con las que esta relacionada con la oferta
	 */
	public function getOfertaEmpresa($id_tbl_oferta)
	{
		try {
			if (!$id_tbl_oferta > 0)
				throw new Exception(' falta id');
			// throw new Exception('debe tener un id',1);

			$empresas = $this->find('all', array(
				'select' => '*',
				'from'  => 'tbl_oferta_empresa',
				'where' => 'id_tbl_oferta=' . $id_tbl_oferta
			));
			// pr($empresas);
			if (!$empresas)
				throw new Exception($this->error, 1);

			return $empresas;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * crear una oferta, relacinada con info, contenido, producto, y oferta
	 */
	public function setOfertas($campos)
	{
		try {
			$id_info_indice 	= $this->setInfoIndiceOferta($campos['camposInfoIndice']);
			$campos['camposProducto']['id_tbl_info_indice'] = $campos['camposContenidoInformacion']['id_tbl_info_indice'] = $id_info_indice;


			$this->informacion->setContenidoInformacion($campos['camposContenidoInformacion']);


			$id_producto 		= $this->setProductoOferta($campos['camposProducto']);

			$campos['camposOferta']['id_tbl_producto'] = $id_producto;


			$id_oferta 			= $this->setOferta($campos['camposOferta']);

			$this->setOfertaEmpresa($campos['camposPreciosEmpresa']['id_empresa'], $id_oferta);
			$this->setOfertaHabitacion($campos['habitaciones'], $id_oferta);
			// exit();

		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	/**
	 * relacionar la oferta con las empresas que estan apareciendo
	 */
	public function setOfertaEmpresa($empresas, $id_oferta)
	{
		try {
			if (!$id_oferta > 0)
				throw new Exception('debe existir un id');

			$this->delete('tbl_oferta_empresa', 'id_tbl_oferta=' . $id_oferta);

			foreach ($empresas as $key => $empresa) {
				$this->table = 'tbl_oferta_empresa';
				$this->fields = array('id_tbl_oferta' => $id_oferta, 'id_tbl_empresa' => $empresa, 'fecha' => date('Y-m-d H:i:s'));
				if (!$this->save())
					throw new Exception('no se pudo' . $this->error, 1);
			}
			return true;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	/**
	 * Guardar informacion en oferta
	 */
	public function setOferta($campos, $id_oferta = 0)
	{
		try {
			$id_oferta = $campos['id_tbl_oferta'];
			unset($campos['id_tbl_oferta']);
			$this->table = 'tbl_oferta';
			$this->fields = $campos;
			if ($id_oferta > 0) {
				$this->where = 'id_tbl_oferta=' . $id_oferta;
				if (!$tmpid_oferta = $this->update())
					throw new Exception('no se guardo' . $this->error, 1);
			} else {
				if (!$id_oferta = $this->save())
					throw new Exception('no se guardo oferta' . $this->error . $this->lastQuery, 1);
			}
			return $id_oferta;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * guardar producto de oferta
	 */
	public function setProductoOferta($campos)
	{
		try {
			$campos['id_tbl_tipo_producto'] = 1;
			$id =   $this->informacion->setProducto($campos);

			return $id;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * info indice para oferta
	 */
	public function setInfoIndiceOferta($campos)
	{
		try {
			$campos['id_tbl_tipo_informacion'] = 2;
			$id =   $this->informacion->setInfoIndice($campos);

			return $id;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	/**
	 * info indice para establecimiento
	 */
	public function setInfoIndiceEstablecimiento($campos)
	{
		try {
			$campos['id_tbl_tipo_informacion'] = 1;
			$this->informacion->setInfoIndice($campos);
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}

		$campos['camposInfoIndice']['id_tbl_tipo_informacion'] = '';
	}

	/**	
	 * guarda informacion de cumplimiento de politicas
	 */
	public function setAceptacion($data)
	{
		try {
			if ($data['id_establecimiento'] > 0)
				$this->delete('tbl_smart_aceptacion', 'id_tbl_establecimiento=' . $data['id_establecimiento']);

			foreach ($data['politicas'] as $key  => $idPolitica) {
				$this->table = 'tbl_smart_aceptacion';
				$this->fields = array('id_tbl_usuario' => $data['id_usuario'], 'id_tbl_smart_politica' => $idPolitica, 'id_tbl_establecimiento' => $data['id_establecimiento'], 'fecha' => date('Y-m-d H:i:s'));
				if (!$temp = $this->save())
					throw new Exception($this->error, 1);
			}
			return true;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	/**
	 * obtener informacion de aceptaciones
	 */
	public function getAceptacion($id)
	{
		try {

			if (!$id > 0)
				throw new Exception('falta id de establecimiento', 0);

			$where[] = 'id_tbl_establecimiento = ' . $id;
			$aceptacion = $this->find('all', array(
				'select' => '*',
				'where'	=> 'tbl_smart_aceptacion',
				'from'	=> $where,
			));
			if (!$aceptacion)
				throw new Exception($this->error, 0);
			return $aceptacion;
		} catch (Exception $e) {

			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
	public function setComents($idEstablecimiento, $idUsr, $comentario, $calificacion)
	{
		try {

			$sentencia = array(
				"id_tbl_establecimiento" => $idEstablecimiento,
				"id_tbl_usuario" => $idUsr,
				"comentario" => $comentario,
				"calificacion" => $calificacion,
				"fecha" => date("Y-m-d")
			);



			$this->table = 'tbl_comentario';
			$this->fields = $sentencia;
			if (!$id_fav = $this->save())
				throw new Exception("no se pudo guardar", 5105);
			//pr($this->error);
			//pr($this->lastQuery);

			return true;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}

	public function getComents($idEstablecimiento)
	{
		try {
			include('configuraciones.php');

			$consulta = $this->find('all', array(
				'select' => 'id_tbl_usuario,comentario,calificacion,fecha',
				'from'	=> 'tbl_comentario',
				'where'	=> 'id_tbl_establecimiento=' . $idEstablecimiento,
				'order'	=> 'fecha desc',
			));
			if (!$consulta)
				throw new Exception("No existen resultados", 1);

			$cant = count($consulta);
			$suma = 0;
			foreach ($consulta as &$comentario) {
				$user = ($userapp->getUser($comentario["id_tbl_usuario"], ''));
				$foto = $user['direccion_foto'];
				$nombres = '';
				if (!empty($user['nom1']))
					$nombres = $user['nom1'];
				if (!empty($user['nom2']))
					$nombres .= ' ' . $user['nom2'];
				if (!empty($user['ape1']))
					$nombres .= " " . $user['ape1'];
				if (!empty($user['ape2']))
					$nombres .= " " . $user['ape2'];
				$comentario["nombre"] = $nombres;
				$suma = $suma + $comentario["calificacion"];
				if ($foto == null)
					$comentario["foto"] = "https://visitaecuador.com/ve/img/contenido/suscriptor/thum72x57/fotoperfil2_xXA8V_0.png";
				else
					$comentario["foto"] = "https://visitaecuador.com/ve/img/contenido/suscriptor/thum72x57/" . $foto;
			}
			// pr($this->error);
			// pr($this->lastQuery);

			$promedio = number_format($suma / $cant, 1, '.', '');
			$calificacion = "";
			if ($promedio >= 9.5)
				$calificacion = "Excepcional";
			else if ($promedio >= 9 && $promedio < 9.5)
				$calificacion = "Fantástico";
			else if ($promedio >= 8 && $promedio < 9)
				$calificacion = "Fabuloso";
			else if ($promedio >= 7 && $promedio < 8)
				$calificacion = "Bien";
			else if ($promedio < 7) 
				$calificacion = "Puntuación";

			$new = array(
				'puntuacion' => $promedio,
				'calificacion' => $calificacion,
				'cantidadComentarios' => $cant,
				'comentarios' => $consulta
			);


			//pr($consulta);
			return $new;
		} catch (Exception $e) {
			$this->error = $e->getMessage();
			$this->codeerror = $e->getCode();
			return false;
		}
	}
}
