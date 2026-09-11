import React, { useRef, useState } from 'react';
import Config from '../../../global/config';
import SuscripcionService from '../../../services/suscripcion/SuscripcionService';
import { generarEsquemaSusTransferencia } from '../../../global/esquemaSuscripcionTransferencia';
import { CUENTAS, BENEFICIARIO, RUC, textoCuenta } from '../../../global/cuentasTransferencia';

const WHATSAPP_NUMERO = '593997396731';

const hoy = () => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
};

const Transferencia = ({ persona, producto, pago, codigo }) => {
    const [copiado, setCopiado] = useState(null);

    // Datos del depósito. La cuenta se eligió en el paso 3 y llega en `pago`;
    // si por alguna razón no viniera, se cae al selector local como respaldo.
    const [bancoIdx, setBancoIdx] = useState('');
    const [fechaDeposito, setFechaDeposito] = useState(hoy());
    const [numDocumento, setNumDocumento] = useState('');

    // Comprobante
    const [archivo, setArchivo] = useState(null);
    const [preview, setPreview] = useState(null);
    const [subiendo, setSubiendo] = useState(false);
    const [urlComprobante, setUrlComprobante] = useState(null);
    const [errorSubida, setErrorSubida] = useState(null);

    // Resultado
    const [enviando, setEnviando] = useState(false);
    const [suscripcion, setSuscripcion] = useState(null); // { codigo, clave, ... }
    const [errorEnvio, setErrorEnvio] = useState(null);

    const inputRef = useRef(null);

    // Mismos valores que muestra el resumen del paso de pago.
    const total = producto ? (producto.PrecioProducto * 1.12).toFixed(2) : '0.00';
    const subtotal = producto ? ((producto.PrecioProducto * 1.12) / 1.15).toFixed(2) : '0.00';
    const iva = producto ? ((producto.PrecioProducto * 1.12) - ((producto.PrecioProducto * 1.12) / 1.15)).toFixed(2) : '0.00';

    const cuentaDelPaso3 = pago?.cuentaTransferencia || null;
    const cuentaElegida = cuentaDelPaso3 || (bancoIdx !== '' ? CUENTAS[parseInt(bancoIdx)] : null);
    const bancoTexto = textoCuenta(cuentaElegida);

    const copiar = (texto, key) => {
        const marcar = () => {
            setCopiado(key);
            setTimeout(() => setCopiado(null), 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(texto).then(marcar).catch(marcar);
        } else {
            marcar();
        }
    };

    /** Etiqueta + valor + botón de copiar, en una sola pieza compacta. */
    const campoCopiable = (etiqueta, valor, clave) => (
        <button
            onClick={() => copiar(valor, clave)}
            className='flex flex-col items-start text-left group min-w-0'
            title={`Copiar ${etiqueta}`}
        >
            <span className='text-[10px] text-gray-500'>{etiqueta}</span>
            <span className='flex items-center gap-1 font-mono font-bold text-gray-900 text-base break-all'>
                {valor}
                <span className={`${copiado === clave ? 'icon-[mdi--check-bold] text-greenVE-600' : 'icon-[mynaui--copy] text-gray-400 group-hover:text-greenVE-600'} h-4 w-4 flex-shrink-0`}></span>
            </span>
        </button>
    );

    const subirComprobante = async (file) => {
        setSubiendo(true);
        setErrorSubida(null);
        setUrlComprobante(null);
        try {
            const formData = new FormData();
            formData.append('comprobante', file);
            const resp = await fetch(Config.URL_COMPROBANTE, {
                method: 'POST',
                body: formData,
            });
            const data = await resp.json();
            if (data && data.estado && data.url) {
                setUrlComprobante(data.url);
            } else {
                setErrorSubida((data && data.msj) || 'No se pudo subir el comprobante.');
            }
        } catch (e) {
            setErrorSubida('Error de conexión al subir el comprobante.');
        }
        setSubiendo(false);
    };

    const onSeleccionArchivo = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        setArchivo(file);
        setUrlComprobante(null);
        setErrorSubida(null);
        setErrorEnvio(null);
        if (file.type && file.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
        subirComprobante(file);
    };

    // Crea la suscripción (queda con el pago por confirmar) y dispara el correo
    // con el comprobante para contabilidad.
    const enviarSolicitud = async () => {
        setErrorEnvio(null);

        if (!cuentaElegida) {
            setErrorEnvio('Selecciona el banco al que realizaste el depósito.');
            return;
        }
        if (!fechaDeposito) {
            setErrorEnvio('Indica la fecha del depósito.');
            return;
        }
        if (!urlComprobante) {
            setErrorEnvio('Sube la foto del comprobante.');
            return;
        }

        setEnviando(true);
        try {
            const payload = generarEsquemaSusTransferencia({
                persona,
                producto,
                codigo,
                transferencia: {
                    banco: bancoTexto,
                    fecha: fechaDeposito,
                    documento: numDocumento,
                    comprobanteUrl: urlComprobante,
                },
            });

            const service = new SuscripcionService();
            const resp = await service.crearSuscripcionTransferencia({
                personal: {
                    ci: persona?.cedula || '',
                    nombres: persona?.nombres || '',
                    email: persona?.correo || '',
                    celular: persona?.telefono || '',
                    ciudad: persona?.ciudad || 297,
                },
                producto: {
                    id_producto: producto?.IdProducto || '',
                    id_prod_suscripcion: producto?.IdProductoSuscripcion || '',
                    id_lista_precio_producto: producto?.IdListaPrecioProducto || '',
                    titulo: producto?.Titulo || '',
                    precio: producto?.PrecioProducto || 0,
                },
                codigo: {
                    id_codigo_promocional: codigo?.id_codigo_promocional || '',
                    codigo: codigo?.codigo || '',
                    beneficio_cantidad_tiempo: (Array.isArray(codigo?.beneficio) && codigo.beneficio.length > 0)
                        ? codigo.beneficio[0].cantidad_tipo_tiempo : '',
                    beneficio_tipo_tiempo: (Array.isArray(codigo?.beneficio) && codigo.beneficio.length > 0)
                        ? codigo.beneficio[0].tiempo : '',
                    id_usuario_vendedor: codigo?.vendedor?.id_usuario_vendedor || '',
                    id_suscripcion_vendedor: codigo?.vendedor?.id_suscripcion_vendedor || '',
                },
                pago: {
                    subtotal: subtotal,
                    iva: iva,
                    total: total,
                    comprobante_url: urlComprobante,
                    banco_destino: bancoTexto,
                    fecha_transferencia: fechaDeposito,
                    num_documento: numDocumento,
                },
                payload: payload,
            });

            if (resp && resp.estado && resp.data) {
                setSuscripcion(resp.data);
            } else {
                setErrorEnvio((resp && resp.msj) || 'No se pudo crear la suscripción. Intenta nuevamente.');
            }
        } catch (e) {
            setErrorEnvio('Error de conexión al crear la suscripción.');
        }
        setEnviando(false);
    };

    const enviarPorWhatsapp = () => {
        const mensaje =
            `Hola, soy *${persona?.nombres || ''}* con documento *${persona?.cedula || ''}*. ` +
            `Realicé el pago por transferencia/depósito de la suscripción *${producto?.Titulo || ''}* ` +
            `por un valor de *$${total}*.` +
            (suscripcion?.codigo ? `\nSuscripción: *${suscripcion.codigo}*` : '') +
            (bancoTexto ? `\nDepositado en: ${bancoTexto}` : '') +
            (urlComprobante ? `\nComprobante: ${urlComprobante}` : '');
        const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    };

    /* ------------------------------------------------------------------ */
    /* Pantalla de confirmación                                            */
    /* ------------------------------------------------------------------ */
    if (suscripcion) {
        return (
            <div className='flex w-full justify-center items-start mt-4'>
                <div className='shadow-xl rounded-xl flex flex-col gap-4 p-6 w-full max-w-lg bg-white items-center text-center'>
                    <span className='icon-[mdi--check-circle-outline] h-16 w-16 text-greenVE-500'></span>
                    <label className='font-semibold text-xl text-greenVE-600'>¡Tu suscripción ya está activa!</label>

                    <div className='bg-[#f7f9f3] rounded-lg p-4 w-full flex flex-col gap-1'>
                        <label className='text-xs text-gray-500'>Tu código de suscriptor</label>
                        <div className='flex items-center justify-center gap-2'>
                            <label className='text-2xl font-bold text-greenVE-600 font-mono'>{suscripcion.codigo}</label>
                            <button
                                onClick={() => copiar(suscripcion.codigo, 'sol')}
                                className='text-greenVE-600 hover:text-greenVE-700'
                                title='Copiar'
                            >
                                <span className={`${copiado === 'sol' ? 'icon-[mdi--check-bold]' : 'icon-[mynaui--copy]'} h-5 w-5`}></span>
                            </button>
                        </div>
                    </div>

                    <label className='text-sm text-gray-600 leading-relaxed'>
                        Ya puedes usar tu suscripción <strong>{producto?.Titulo}</strong>. Te enviamos tus datos
                        de acceso a <strong>{persona?.correo}</strong>.
                    </label>

                    <div className='flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-full text-left'>
                        <span className='icon-[fluent--error-circle-24-regular] text-amber-500 h-4 w-4 flex-shrink-0 mt-0.5'></span>
                        <label className='text-[11px] text-amber-700 leading-relaxed'>
                            Tu pago queda <strong>por confirmar</strong> hasta que contabilidad verifique el
                            depósito. Guarda tu comprobante por si necesitamos revisarlo contigo.
                        </label>
                    </div>

                    <button
                        onClick={enviarPorWhatsapp}
                        className='bg-greenVE-500 hover:bg-greenVE-600 text-white flex items-center justify-center gap-2 rounded-full py-2 px-6 font-semibold text-sm transition-all w-full'
                    >
                        <span className='icon-[logos--whatsapp-icon] h-5 w-5'></span>
                        Avisar también por WhatsApp
                    </button>
                </div>
            </div>
        );
    }

    /* ------------------------------------------------------------------ */
    /* Formulario                                                          */
    /* ------------------------------------------------------------------ */
    return (
        <div className='flex w-full justify-center items-start mt-4'>
            <div className='shadow-xl rounded-xl flex flex-col gap-4 p-5 w-full max-w-3xl bg-white'>
                <div className='flex items-center gap-2 flex-wrap'>
                    {cuentaElegida?.logo ? (
                        <img
                            src={cuentaElegida.logo}
                            alt={cuentaElegida.banco}
                            className='h-7 w-7 object-contain rounded bg-white border border-gray-200 p-0.5 flex-shrink-0'
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <span className='icon-[basil--bank-outline] h-6 w-6 text-greenVE-600'></span>
                    )}
                    <label className='font-semibold text-normal text-greenVE-600'>Transferencia / Depósito</label>
                    {cuentaElegida && (
                        <span className='text-[10px] font-medium text-greenVE-700 bg-greenVE-50 border border-greenVE-200 rounded px-1.5 py-0.5'>
                            {cuentaElegida.banco} · {cuentaElegida.tipo}
                        </span>
                    )}
                </div>

                {/* Resumen 
                <div className='bg-[#f7f9f3] rounded-lg p-3 flex flex-col gap-1'>
                    <div className='flex justify-between text-sm'>
                        <label className='text-gray-500'>Suscripción</label>
                        <label className='font-semibold text-gray-700 text-right'>{producto?.Titulo}</label>
                    </div>
                    <div className='flex justify-between text-sm'>
                        <label className='text-gray-500'>Total a depositar</label>
                        <label className='font-bold text-greenVE-600'>${total}</label>
                    </div>
                </div>
*/}
                {/* Beneficiario y cuenta, en un solo bloque: antes eran dos tarjetas
                    (uno para el titular y otra grande para la cuenta) y ocupaban
                    casi toda la pantalla del paso 4. */}
                {cuentaElegida ? (
                    <div className='border border-greenVE-200 bg-greenVE-50 rounded-lg p-3 flex flex-col gap-2'>
                        <div className='flex justify-between items-baseline gap-3'>
                            <label className='text-xs text-gray-500 flex-shrink-0'>Beneficiario</label>
                            <label className='text-xs font-semibold text-gray-800 text-right'>{BENEFICIARIO}</label>
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-greenVE-200 pt-2'>
                            {campoCopiable('RUC', RUC, 'ruc')}
                            {campoCopiable('N° de cuenta', cuentaElegida.cuenta, 'cta')}
                        </div>
                    </div>
                ) : (
                    /* Respaldo: si no llegó la cuenta del paso 3, se elige aquí. */
                    <div className='flex flex-col gap-1'>
                        <label className='text-xs text-gray-500'>¿A qué cuenta vas a depositar?</label>
                        <select
                            value={bancoIdx}
                            onChange={(e) => setBancoIdx(e.target.value)}
                            className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-greenVE-500 cursor-pointer'
                        >
                            <option value='' disabled hidden>Selecciona la cuenta</option>
                            {CUENTAS.map((c, i) => (
                                <option key={i} value={i}>{c.banco} · {c.tipo} · {c.cuenta}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Datos del depósito */}
                <div className='flex flex-col gap-3 border-t border-gray-200 pt-2'>
                    <label className='text-sm font-semibold text-gray-700'>Datos de tu depósito</label>

                    <div className='flex gap-3'>
                        <div className='flex flex-col gap-1 flex-1'>
                            <label className='text-xs text-gray-500'>Fecha del depósito</label>
                            <input
                                type='date'
                                value={fechaDeposito}
                                max={hoy()}
                                onChange={(e) => setFechaDeposito(e.target.value)}
                                className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-greenVE-500'
                            />
                        </div>
                        <div className='flex flex-col gap-1 flex-1'>
                            <label className='text-xs text-gray-500'>N° documento <span className='text-gray-400'>(opcional)</span></label>
                            <input
                                type='text'
                                value={numDocumento}
                                onChange={(e) => setNumDocumento(e.target.value)}
                                placeholder='Ej. 123456'
                                className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-greenVE-500'
                            />
                        </div>
                    </div>
                </div>

                {/* Subir comprobante */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-semibold text-gray-700'>Comprobante de pago</label>
                    <input
                        ref={inputRef}
                        type='file'
                        accept='image/*,application/pdf'
                        className='hidden'
                        onChange={onSeleccionArchivo}
                    />

                    {!archivo ? (
                        <button
                            onClick={() => inputRef.current && inputRef.current.click()}
                            className='border-2 border-dashed border-gray-300 hover:border-greenVE-400 rounded-lg py-6 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-greenVE-600 transition-all'
                        >
                            <span className='icon-[material-symbols-light--upload-rounded] h-8 w-8'></span>
                            <label className='text-sm font-medium cursor-pointer'>Sube la foto del comprobante</label>
                            <label className='text-[11px] text-gray-400'>JPG, PNG o PDF (máx. 10 MB)</label>
                        </button>
                    ) : (
                        <div className='border border-gray-200 rounded-lg p-3 flex items-center gap-3'>
                            {preview ? (
                                <img src={preview} alt='comprobante' className='h-16 w-16 object-cover rounded-md flex-shrink-0' />
                            ) : (
                                <span className='icon-[material-symbols-light--picture-as-pdf-outline] h-12 w-12 text-gray-400 flex-shrink-0'></span>
                            )}
                            <div className='flex flex-col min-w-0 flex-1'>
                                <label className='text-sm font-medium text-gray-700 truncate'>{archivo.name}</label>
                                {subiendo && (
                                    <label className='text-xs text-gray-500 flex items-center gap-1'>
                                        <span className='icon-[eos-icons--loading] h-4 w-4'></span> Subiendo...
                                    </label>
                                )}
                                {urlComprobante && (
                                    <label className='text-xs text-greenVE-600 flex items-center gap-1'>
                                        <span className='icon-[mdi--check-bold] h-4 w-4'></span> Comprobante listo
                                    </label>
                                )}
                                {errorSubida && (
                                    <label className='text-xs text-red-500'>{errorSubida}</label>
                                )}
                            </div>
                            <button
                                onClick={() => inputRef.current && inputRef.current.click()}
                                className='text-xs text-greenVE-600 hover:text-greenVE-700 font-medium flex-shrink-0'
                            >
                                Cambiar
                            </button>
                        </div>
                    )}
                </div>

                {errorEnvio && (
                    <div className='flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2'>
                        <span className='icon-[fluent--error-circle-24-regular] text-red-500 h-4 w-4'></span>
                        <label className='text-xs text-red-600 font-medium'>{errorEnvio}</label>
                    </div>
                )}

                {/* Enviar */}
                <button
                    onClick={enviando ? undefined : enviarSolicitud}
                    disabled={!urlComprobante || subiendo || enviando}
                    className={`flex items-center justify-center gap-2 rounded-full py-2.5 font-semibold text-sm transition-all ${!urlComprobante || subiendo || enviando
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-greenVE-500 hover:bg-greenVE-600 text-white'
                        }`}
                >
                    {enviando ? (
                        <>
                            <span className='icon-[eos-icons--loading] h-5 w-5'></span> Activando tu suscripción...
                        </>
                    ) : (
                        <>
                            <span className='icon-[material-symbols-light--send-outline] h-5 w-5'></span>
                            Enviar comprobante y activar
                        </>
                    )}
                </button>
                {!urlComprobante && (
                    <label className='text-[11px] text-gray-400 text-center -mt-2'>
                        Sube tu comprobante para habilitar el envío.
                    </label>
                )}
            </div>
        </div>
    );
};

export default Transferencia;
