import { useState } from "react";

/**
 * Tarjeta para los productos de la lista de precio 155 (programas especiales):
 *   523 -> Campaña Nacional Mes del Turismo
 *   524 -> Embajadores VisitaEcuador
 *
 * Se muestran aparte de la lista normal porque no son paquetes de suscripción
 * comunes: cada uno pertenece a un programa distinto y conviene que el
 * usuario los distinga de un vistazo.
 */
export const PROGRAMAS = {
    523: {
        clave: "campania",
        etiqueta: "Campaña",
        titulo: "Campaña Nacional Mes del Turismo",
        descripcion: "Suscripción 100% bonificada por 3 meses.",
        icono: "icon-[fluent--star-16-filled]",
        // amber
        borde: "border-amber-300",
        fondo: "bg-amber-50",
        cinta: "bg-amber-500",
        texto: "text-amber-700",
        boton: "bg-amber-500 hover:bg-amber-600",
    },
    524: {
        clave: "embajadores",
        etiqueta: "Embajadores",
        titulo: "Embajadores VisitaEcuador",
        descripcion: "Programa de capacitación para embajadores.",
        icono: "icon-[iconamoon--certificate-badge]",
        // indigo
        borde: "border-[#96C121]",
        fondo: "bg-[#EDF2E0]",
        cinta: "bg-[#96C121]",
        texto: "text-[#688616]",
        boton: "bg-[#96C121] hover:bg-indigo-600",
    },
};

const getTiempo = (TipoTiempo) => {
    if (TipoTiempo == 1) return "año(s)";
    if (TipoTiempo == 2) return "mes(es)";
    if (TipoTiempo == 3) return "día(s)";
    if (TipoTiempo == 4) return "hora(s)";
    if (TipoTiempo == 5) return "minuto(s)";
    return "";
};

const ProductItemEspecial = ({ Producto, setOpcion, setProducto, codigo, setCodigo }) => {
    const [copiado, setCopiado] = useState(false);
    const [tiempoAdicional, setTiempoAdicional] = useState(0);

    const prog = PROGRAMAS[Producto.IdProductoSuscripcion] || PROGRAMAS[523];

    const checkPermission = () => {
        const data = JSON.parse(localStorage.getItem("datos"));
        if (data) {
            return !!data.data.permisos.perfil.suscripcionPersonalizada;
        }
        return false;
    };

    const changeTiempoAdicional = () => {
        if (tiempoAdicional > 0) {
            const porcentajeAdicional = ((tiempoAdicional / 12) / Producto.Tiempo) * 100;
            if (codigo.beneficio[0] && codigo.beneficio[0].length > 0) {
                codigo.beneficio[0].cantidad = porcentajeAdicional;
                setCodigo(codigo);
            }
            if (!Producto.Titulo.includes("+")) {
                Producto.Titulo += " + " + tiempoAdicional + " mes(es) adicionales";
            }
        } else if (codigo.beneficio[0] && codigo.beneficio[0].length > 0) {
            codigo.beneficio[0].cantidad = 0;
            setCodigo(codigo);
        }
    };

    const handleClick = () => {
        setOpcion(3);
        setProducto(Producto);
        if (checkPermission()) changeTiempoAdicional();
    };

    const handleChangePrice = (event) => {
        Producto.PrecioProducto = (event.target.value / 1.12).toFixed(2);
    };

    const handleCLickShare = () => {
        let currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("producto", Producto.IdProducto);
        currentUrl.searchParams.set("value", Producto.PrecioProducto);
        currentUrl.searchParams.set("time", tiempoAdicional);
        if (codigo) currentUrl.searchParams.set("codigo", codigo.codigo);
        navigator.clipboard.writeText(currentUrl.toString()).then(() => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        });
    };

    return (
        <div className={`relative flex flex-col rounded-xl border-2 ${prog.borde} ${prog.fondo} overflow-hidden h-full`}>
            {/* Cinta con el programa */}
            <div className={`${prog.cinta} px-3 py-1.5 flex items-center gap-1.5`}>
                <span className={`${prog.icono} h-4 w-4 text-white`}></span>
                <label className="text-white text-xs font-bold uppercase tracking-wide">
                    {prog.etiqueta}
                </label>
            </div>

            <div className="flex flex-col gap-2 p-3 flex-1">
                <div className="flex items-start gap-2">
                    <img
                        className="h-12 w-auto object-contain flex-shrink-0"
                        src="https://visitaecuador.com/img/web/suscription_card.png"
                        alt={prog.titulo}
                    />
                    <div className="flex flex-col min-w-0">
                        <label className={`text-sm font-bold ${prog.texto} leading-tight`}>
                            {Producto.Titulo}
                        </label>
                        <label className="text-xs text-gray-600 mt-0.5">{prog.descripcion}</label>
                    </div>
                </div>
                {/*
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="icon-[mdi--calendar-blank] h-4 w-4"></span>
                    {Producto.TiempoVendido} {getTiempo(Producto.TipoTiempo)} de suscripción
                </div>
*/}
                {checkPermission() && (
                    <div className="flex flex-col gap-1.5 bg-white/70 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                            <label className="text-xxs md:text-xs w-24">Nuevo precio:</label>
                            <input
                                className="w-20 text-xs border rounded px-1"
                                type="number"
                                defaultValue={(Producto.PrecioProducto * 1.12).toFixed(2)}
                                onChange={handleChangePrice}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xxs md:text-xs w-24">Meses regalo:</label>
                            <input
                                className="w-20 text-xs border rounded px-1"
                                type="number"
                                value={tiempoAdicional}
                                onChange={(e) => setTiempoAdicional(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Precio y acción */}
                <div className="flex items-end justify-between mt-auto pt-2">
                    <div className="flex flex-col">
                        <label className="text-[10px] text-gray-500 uppercase">Total</label>
                        <label className={`text-xl font-bold ${prog.texto}`}>
                            ${(Producto.PrecioProducto * 1.12).toFixed(2)}
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <div title="Compartir" className="cursor-pointer" onClick={handleCLickShare}>
                            {copiado ? (
                                <span className="icon-[octicon--check-circle-fill-12] h-5 w-5 text-greenVE-500"></span>
                            ) : (
                                <span className="icon-[entypo--share-alternitive] h-5 w-5 text-gray-400 hover:text-gray-600"></span>
                            )}
                        </div>
                        <button
                            className={`${prog.boton} text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors`}
                            onClick={handleClick}
                        >
                            Comprar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductItemEspecial;
