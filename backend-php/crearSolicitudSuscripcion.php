<?php
/**
 *  crearSolicitudSuscripcion.php
 *  Ruta: /var/www/html/api/apiv1.7/suscriptor/crearSolicitudSuscripcion.php
 *  URL : {URL_SERVICIOS}/sus/crearSolicitudSuscripcion/
 *
 *  COMPATIBILIDAD. El flujo de transferencia / deposito ya no guarda una
 *  solicitud en tbl_solicitud_suscripcion: ahora crea la suscripcion de una vez
 *  con id_tbl_estado_pago_suscripcion = 9 ("Pago por Confirmar").
 *
 *  Este archivo se mantiene porque las versiones ya publicadas de la web y de la
 *  app siguen apuntando a esta URL: reenvia al endpoint nuevo para que tambien
 *  ellas usen el flujo actual. La respuesta conserva la forma
 *  { estado, codigo, msj, data }, con la diferencia de que data.codigo es el
 *  codigo de la suscripcion y ya no un SOL-000000.
 *
 *  La logica vive en crearSuscripcionTransferencia.php.
 */

require_once(__DIR__ . '/crearSuscripcionTransferencia.php');
