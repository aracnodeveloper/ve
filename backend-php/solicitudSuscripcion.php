<?php
/**
 *  solicitudSuscripcion.php
 *  Ruta: /var/www/html/api/apiv1.7/classes/solicitudSuscripcion.php
 *
 *  @author  Aracno_Developer
 *  @version 1.0
 *  @abstract Clase de dominio para tbl_solicitud_suscripcion.
 *
 *  Solicitudes de suscripcion pagadas por transferencia / deposito. La web
 *  guarda la solicitud con el comprobante; contabilidad la aprueba desde el
 *  administrador y recien ahi se crea la suscripcion real.
 *
 *  is_active: 1 = Pendiente, 2 = Aprobada, 3 = Rechazada, 0 = Anulada
 *
 *  ERRORES 800
 */

class SolicitudSuscripcion extends Model
{
    const ESTADO_PENDIENTE = 1;
    const ESTADO_APROBADA  = 2;
    const ESTADO_RECHAZADA = 3;
    const ESTADO_ANULADA   = 0;

    public $error;
    public $codeerror;

    public $estados = array(
        0 => 'Anulada',
        1 => 'Pendiente',
        2 => 'Aprobada',
        3 => 'Rechazada'
    );

    /** Codigo generado en el ultimo crear(). */
    public $codigoGenerado = '';

    /* ------------------------------------------------------------------ */
    /* Helpers de saneamiento                                              */
    /* ------------------------------------------------------------------ */

    private function txt($valor, $largo = 255)
    {
        if ($valor === null || $valor === false) return '';
        $valor = trim((string)$valor);
        if ($valor === '') return '';
        return substr($valor, 0, $largo);
    }

    private function entero($valor)
    {
        if ($valor === null || $valor === '' || $valor === false) return null;
        if (!is_numeric($valor)) return null;
        return intval($valor);
    }

    private function decimal($valor)
    {
        if ($valor === null || $valor === '' || $valor === false) return null;
        if (!is_numeric($valor)) return null;
        return floatval($valor);
    }

    /** Devuelve 'YYYY-MM-DD' valido o ''. */
    private function fecha($valor)
    {
        if ($valor === null || $valor === '' || $valor === false) return '';
        $valor = trim((string)$valor);
        if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})/', $valor, $m)) return '';
        if (!checkdate(intval($m[2]), intval($m[3]), intval($m[1]))) return '';
        return $m[1] . '-' . $m[2] . '-' . $m[3];
    }

    /* ------------------------------------------------------------------ */
    /* Codigo de referencia                                                */
    /* ------------------------------------------------------------------ */

    /**
     * Siguiente codigo correlativo: SOL-000123.
     */
    private function siguienteCodigo()
    {
        $fila = $this->find('first', array(
            'select' => 'max(id_tbl_solicitud_suscripcion) as ultimo',
            'from'   => 'tbl_solicitud_suscripcion'
        ));
        $siguiente = (isset($fila['ultimo']) ? intval($fila['ultimo']) : 0) + 1;
        return 'SOL-' . str_pad($siguiente, 6, '0', STR_PAD_LEFT);
    }

    /* ------------------------------------------------------------------ */
    /* Crear                                                               */
    /* ------------------------------------------------------------------ */

    /**
     * Crea una solicitud pendiente.
     *
     * $data: ci, nombres, email, celular, id_tbl_lugar,
     *        id_tbl_producto, id_tbl_prod_suscripcion,
     *        id_tbl_lista_precio_producto, titulo_producto, precio,
     *        id_tbl_codigo_promocional, codigo_promocional,
     *        id_usuario_vendedor, id_suscripcion_vendedor,
     *        beneficio_cantidad_tiempo, beneficio_tipo_tiempo,
     *        subtotal, iva, total, comprobante_url, banco_destino,
     *        fecha_transferencia, num_documento, payload (array).
     *
     * @return int|false id de la solicitud creada.
     */
    public function crear($data)
    {
        try {
            $ci      = $this->txt(isset($data['ci']) ? $data['ci'] : '', 20);
            $nombres = $this->txt(isset($data['nombres']) ? $data['nombres'] : '', 150);
            $email   = $this->txt(isset($data['email']) ? $data['email'] : '', 150);

            if ($ci === '')
                throw new Exception("Debe enviar el documento de identidad", 801);
            if ($nombres === '')
                throw new Exception("Debe enviar los nombres", 802);
            if ($email === '')
                throw new Exception("Debe enviar el correo electronico", 803);

            $campos = array(
                'codigo'     => $this->siguienteCodigo(),
                'ci'         => $ci,
                'nombres'    => $nombres,
                'email'      => $email,
                'is_active'  => self::ESTADO_PENDIENTE,
                'created_at' => date('Y-m-d H:i:s')
            );

            // Texto opcional
            $textos = array(
                'celular'            => 50,
                'titulo_producto'    => 200,
                'codigo_promocional' => 50,
                'comprobante_url'    => 255,
                'banco_destino'      => 100,
                'num_documento'      => 50,
                'beneficio_cantidad_tiempo' => 10,
                'beneficio_tipo_tiempo'     => 10
            );
            foreach ($textos as $k => $largo) {
                $v = $this->txt(isset($data[$k]) ? $data[$k] : '', $largo);
                if ($v !== '') $campos[$k] = $v;
            }

            // Enteros opcionales
            $enteros = array(
                'id_tbl_lugar',
                'id_tbl_producto',
                'id_tbl_prod_suscripcion',
                'id_tbl_lista_precio_producto',
                'id_tbl_codigo_promocional',
                'id_usuario_vendedor',
                'id_suscripcion_vendedor'
            );
            foreach ($enteros as $k) {
                $v = $this->entero(isset($data[$k]) ? $data[$k] : null);
                if ($v !== null && $v > 0) $campos[$k] = $v;
            }

            // Decimales
            foreach (array('precio', 'subtotal', 'iva', 'total') as $k) {
                $v = $this->decimal(isset($data[$k]) ? $data[$k] : null);
                if ($v !== null && $v >= 0) $campos[$k] = $v;
            }

            // Fecha del deposito
            $f = $this->fecha(isset($data['fecha_transferencia']) ? $data['fecha_transferencia'] : null);
            if ($f !== '') $campos['fecha_transferencia'] = $f;

            // Snapshot del esquema con el que se creara la suscripcion.
            if (isset($data['payload']) && !empty($data['payload'])) {
                $payload = is_string($data['payload'])
                    ? $data['payload']
                    : json_encode($data['payload']);
                $campos['payload_json'] = $payload;
            }

            $this->table  = 'tbl_solicitud_suscripcion';
            $this->fields = $campos;

            if (!$id = $this->save())
                throw new Exception("No se pudo guardar la solicitud: " . $this->error, 804);

            $this->codigoGenerado = $campos['codigo'];
            return $id;
        } catch (Exception $e) {
            $this->error     = $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        }
    }

    /* ------------------------------------------------------------------ */
    /* Consultas                                                           */
    /* ------------------------------------------------------------------ */

    /**
     * Listado con filtros para el administrador.
     *
     * $filtros: estado, ci, texto, desde, hasta, pagina, cantidad.
     */
    public function listar($filtros = array())
    {
        try {
            $where = array('1 = 1');

            if (isset($filtros['estado']) && $filtros['estado'] !== '' && $filtros['estado'] !== null) {
                $where[] = 'is_active = ' . intval($filtros['estado']);
            }

            $ci = $this->txt(isset($filtros['ci']) ? $filtros['ci'] : '', 20);
            if ($ci !== '') {
                $where[] = 'ci like "%' . addslashes($ci) . '%"';
            }

            $texto = $this->txt(isset($filtros['texto']) ? $filtros['texto'] : '', 100);
            if ($texto !== '') {
                $t = addslashes($texto);
                $where[] = '(nombres like "%' . $t . '%" or email like "%' . $t . '%" or codigo like "%' . $t . '%")';
            }

            $desde = $this->fecha(isset($filtros['desde']) ? $filtros['desde'] : null);
            if ($desde !== '') $where[] = 'created_at >= "' . $desde . ' 00:00:00"';

            $hasta = $this->fecha(isset($filtros['hasta']) ? $filtros['hasta'] : null);
            if ($hasta !== '') $where[] = 'created_at <= "' . $hasta . ' 23:59:59"';

            $cantidad = intval(isset($filtros['cantidad']) ? $filtros['cantidad'] : 50);
            if ($cantidad <= 0 || $cantidad > 500) $cantidad = 50;

            $pagina = intval(isset($filtros['pagina']) ? $filtros['pagina'] : 1);
            if ($pagina <= 0) $pagina = 1;
            $offset = ($pagina - 1) * $cantidad;

            $condicion = implode(' and ', $where);

            $total = $this->find('first', array(
                'select' => 'count(*) as total',
                'from'   => 'tbl_solicitud_suscripcion',
                'where'  => $condicion
            ));

            // Se consulta con * para no depender de que existan las columnas
            // opcionales; el payload (que es pesado y solo sirve al aprobar)
            // se descarta aqui y se entrega solo en obtener().
            $lista = $this->find('all', array(
                'select' => '*',
                'from'   => 'tbl_solicitud_suscripcion',
                'where'  => $condicion,
                'order'  => 'id_tbl_solicitud_suscripcion desc',
                'limit'  => $offset . ', ' . $cantidad
            ));

            if (!is_array($lista)) $lista = array();

            foreach ($lista as $i => $fila) {
                unset($lista[$i]['payload_json']);

                $estado = intval(isset($fila['is_active']) ? $fila['is_active'] : 0);
                $lista[$i]['estado_texto'] = isset($this->estados[$estado])
                    ? $this->estados[$estado]
                    : 'Desconocido';
            }

            return array(
                'lista'    => $lista,
                'total'    => isset($total['total']) ? intval($total['total']) : 0,
                'pagina'   => $pagina,
                'cantidad' => $cantidad
            );
        } catch (Exception $e) {
            $this->error     = $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        }
    }

    /**
     * Detalle completo de una solicitud (incluye payload_json).
     */
    public function obtener($id)
    {
        try {
            $id = intval($id);
            if ($id <= 0)
                throw new Exception("Debe especificar una solicitud valida", 805);

            $fila = $this->find('first', array(
                'select' => '*',
                'from'   => 'tbl_solicitud_suscripcion',
                'where'  => 'id_tbl_solicitud_suscripcion = ' . $id
            ));

            if (empty($fila))
                throw new Exception("La solicitud no existe", 806);

            $estado = intval($fila['is_active']);
            $fila['estado_texto'] = isset($this->estados[$estado])
                ? $this->estados[$estado]
                : 'Desconocido';

            // Nombre del vendedor resuelto desde los ids guardados.
            $vendedor = $this->obtenerVendedor(
                isset($fila['id_usuario_vendedor']) ? $fila['id_usuario_vendedor'] : 0,
                isset($fila['id_suscripcion_vendedor']) ? $fila['id_suscripcion_vendedor'] : 0
            );
            $fila['vendedor_nombre'] = $vendedor ? $vendedor['nombre'] : '';
            $fila['vendedor_codigo'] = $vendedor ? $vendedor['codigo'] : '';
            $fila['vendedor_email']  = $vendedor ? $vendedor['email']  : '';

            return $fila;
        } catch (Exception $e) {
            $this->error     = $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        }
    }

    /**
     * Datos del vendedor a partir de los ids guardados en la solicitud.
     * id_usuario_vendedor  -> tbl_usuario.id_tbl_usuario
     * id_suscripcion_vendedor -> tbl_suscripcion.id_tbl_suscripcion (respaldo)
     *
     * Devuelve array(nombre, codigo, email) o null si no se puede resolver.
     */
    public function obtenerVendedor($idUsuario, $idSuscripcion = 0)
    {
        try {
            $idUsuario     = intval($idUsuario);
            $idSuscripcion = intval($idSuscripcion);

            if ($idUsuario <= 0 && $idSuscripcion <= 0)
                return null;

            $where = $idUsuario > 0
                ? 'u.id_tbl_usuario = ' . $idUsuario
                : 's.id_tbl_suscripcion = ' . $idSuscripcion;

            $fila = $this->find('first', array(
                'select' => 'u.id_tbl_usuario,
                             u.usu_o_email,
                             concat_ws(" ", trim(d.nom1), trim(d.nom2), trim(d.ape1), trim(d.ape2)) as nombre,
                             s.codigo',
                'from'   => 'tbl_usuario u
                             join tbl_directorio d on d.id_tbl_directorio = u.id_tbl_directorio
                             left join tbl_suscripcion s on s.id_tbl_usuario = u.id_tbl_usuario',
                'where'  => $where,
                'order'  => 's.id_tbl_suscripcion desc'
            ));

            if (empty($fila))
                return null;

            return array(
                'nombre' => isset($fila['nombre']) ? trim($fila['nombre']) : '',
                'codigo' => isset($fila['codigo']) ? $fila['codigo'] : '',
                'email'  => isset($fila['usu_o_email']) ? $fila['usu_o_email'] : ''
            );
        } catch (Exception $e) {
            return null;
        }
    }

    /* ------------------------------------------------------------------ */
    /* Cambios de estado                                                   */
    /* ------------------------------------------------------------------ */

    /**
     * Marca la solicitud como aprobada y guarda la suscripcion creada.
     * No crea la suscripcion: eso lo hace el endpoint reutilizando
     * gestionarSuscripcion con el payload guardado.
     */
    public function marcarAprobada($id, $resultado, $revisadoPor, $observacion = '')
    {
        try {
            $id = intval($id);
            if ($id <= 0)
                throw new Exception("Debe especificar una solicitud valida", 805);

            if (!is_array($resultado)) $resultado = array();

            $campos = array(
                'is_active'  => self::ESTADO_APROBADA,
                'revisado_at' => date('Y-m-d H:i:s')
            );

            $mapa = array(
                'id_tbl_suscripcion'        => 'id_tbl_suscripcion',
                'id_suscripcion_renovacion' => 'id_suscripcion_renovacion',
                'id_tbl_usuario'            => 'id_tbl_usuario'
            );
            foreach ($mapa as $origen => $destino) {
                $v = $this->entero(isset($resultado[$origen]) ? $resultado[$origen] : null);
                if ($v !== null && $v > 0) $campos[$destino] = $v;
            }

            $codSus = $this->txt(isset($resultado['codigo']) ? $resultado['codigo'] : '', 50);
            if ($codSus !== '') $campos['codigo_suscripcion'] = $codSus;

            $rev = $this->entero($revisadoPor);
            if ($rev !== null && $rev > 0) $campos['revisado_por'] = $rev;

            $obs = $this->txt($observacion, 255);
            if ($obs !== '') $campos['observacion'] = $obs;

            $this->table  = 'tbl_solicitud_suscripcion';
            $this->fields = $campos;
            $this->where  = 'id_tbl_solicitud_suscripcion = ' . $id;

            if (!$this->update())
                throw new Exception("No se pudo actualizar la solicitud: " . $this->error, 807);

            return true;
        } catch (Exception $e) {
            $this->error     = $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        }
    }

    /**
     * Rechaza (estado 3) o anula (estado 0) una solicitud pendiente.
     */
    public function cambiarEstado($id, $estado, $revisadoPor, $observacion = '')
    {
        try {
            $id = intval($id);
            if ($id <= 0)
                throw new Exception("Debe especificar una solicitud valida", 805);

            $estado = intval($estado);
            if (!in_array($estado, array(self::ESTADO_RECHAZADA, self::ESTADO_ANULADA, self::ESTADO_PENDIENTE)))
                throw new Exception("Estado invalido", 808);

            $campos = array(
                'is_active'   => $estado,
                'revisado_at' => date('Y-m-d H:i:s')
            );

            $rev = $this->entero($revisadoPor);
            if ($rev !== null && $rev > 0) $campos['revisado_por'] = $rev;

            $obs = $this->txt($observacion, 255);
            if ($obs !== '') $campos['observacion'] = $obs;

            $this->table  = 'tbl_solicitud_suscripcion';
            $this->fields = $campos;
            $this->where  = 'id_tbl_solicitud_suscripcion = ' . $id;

            if (!$this->update())
                throw new Exception("No se pudo actualizar la solicitud: " . $this->error, 807);

            return true;
        } catch (Exception $e) {
            $this->error     = $e->getMessage();
            $this->codeerror = $e->getCode();
            return false;
        }
    }
}
