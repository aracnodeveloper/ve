import Config from "./config";

/**
 * Esquema de suscripcion para pagos por transferencia / deposito.
 *
 * Este esquema SI se envia de inmediato a gestionarSuscripcion: la suscripcion
 * se crea apenas el cliente sube el comprobante, pero nace en estado de pago
 * 9 = "Pago por Confirmar". Contabilidad revisa el deposito desde el
 * administrador y la pasa a 2 = "Pagado" o la bloquea/anula si el pago nunca
 * llego.
 *
 * tipo_pago_boton 10 = "Transferencia / deposito" (tbl_diferido).
 *
 * El estado 9 va explicito en el bloque de pago; si no se enviara, el backend
 * lo derivaria de tbl_tipo_pago y quedaria en 1 (Fondos por Confirmar).
 */
export function generarEsquemaSusTransferencia(datos) {
    var subtotal = parseFloat(datos?.producto?.PrecioProducto || 0).toFixed(2);
    var total = (parseFloat(subtotal) * 1.12).toFixed(2);
    var iva = (parseFloat(total) - parseFloat(subtotal)).toFixed(2);

    var esquema = {
        id_empresa: Config.IDEMPRESA,
        tiempo: 5,
        canal: "web",
        aceptocondiciones: 1,
        notificar: false,
        verificar: false,
        id_servicio: Config.IDSERVICIO,
        metodo: Config.METODO,
        personal: {
            ci: datos?.persona?.cedula || "",
            nombres: datos?.persona?.nombres || "",
            celular: datos?.persona?.telefono || "",
            email: datos?.persona?.correo || "",
            pais: Config.IDPAIS,
            ciudad: 297,
        },
        producto: {
            id_codigo_promocional: datos?.codigo?.id_codigo_promocional || "",
            beneficio_cantidad_tiempo: (Array.isArray(datos?.codigo?.beneficio) && datos.codigo.beneficio.length > 0)
                ? datos.codigo.beneficio[0].cantidad_tipo_tiempo
                : "0",
            beneficio_tipo_tiempo: (Array.isArray(datos?.codigo?.beneficio) && datos.codigo.beneficio.length > 0)
                ? datos.codigo.beneficio[0].tiempo
                : "0",
            id_usuario_vendedor: datos?.codigo?.vendedor?.id_usuario_vendedor || "",
            id_suscripcion_vendedor: datos?.codigo?.vendedor?.id_suscripcion_vendedor || "",
            cantidad: 1,
            fecha_final: "",
            precio: datos?.producto?.PrecioProducto || "0.00",
            id_producto: datos?.producto?.IdProducto || "",
            id_lista_precio_producto: datos?.producto?.IdListaPrecioProducto || "",
            id_prod_suscripcion: datos?.producto?.IdProductoSuscripcion || "",
            id_tipo_canal: "11",
            pago: [
                {
                    tipo_pago: 2,
                    // Estado de pago con el que nace la suscripcion. Sin esto, el
                    // backend lo derivaria de tbl_tipo_pago (tipo 2 -> estado 1).
                    // 9 = Pago por Confirmar: activa pero pendiente de que
                    // contabilidad concilie el deposito.
                    id_tbl_estado_pago_suscripcion: 9,
                    id_prepago: 0,
                    tipo_pago_boton: 10,
                    intereses: "2",
                    diferido: "1",
                    envio: 0,
                    subtotal: subtotal,
                    iva: iva,
                    total: total,
                    cuenta: {
                        nombreTitular: datos?.persona?.nombres || "",
                        id_diferido: 0,
                        datapago: datos?.transferencia?.banco || "",
                    },
                    transaccion: {
                        metodo: "transferencia",
                        banco: datos?.transferencia?.banco || "",
                        fecha: datos?.transferencia?.fecha || "",
                        documento: datos?.transferencia?.documento || "",
                        comprobante: datos?.transferencia?.comprobanteUrl || "",
                    },
                },
            ],
        },
    };

    return esquema;
}
