<?php
/**
 * @Creacion Fecha: 2/01/2012
 * @author Wilson Cajamarca
 * @Caso de Uso: #56
 * @descripcion: FUNCION DE CONSULTA ADICIONAL  - Para obtener datos de un movimiento, con el ingreso de un parametro de IdMovimientoss.
 * @historial: 1. Wilson Cajamarca, 02/02/2012, Primer Desarrollo.
 * @param integer $piIdMovimiento: Id del Movimiento que se desea obtener sus registros
 * 
*/
function fn_obtenerMovimiento($piIdMovimiento){
				//obtener Establecimiento
				$laResultado=mysql_query("
			     SELECT id_tbl_movimiento, nombre_movimiento, secuencial
                 FROM tbl_movimiento t
                 where id_tbl_movimiento = '".$piIdMovimiento."'
                 limit 0,1
                 ;
				") or die (mysql_error());
				return $laResultado;
}
?>