/**
 * Vista del ticket generado, replicando la de la app movil:
 * imagen de la oferta de vinos, codigo de barras y datos del beneficio.
 *
 * Es solo lectura: no crea ni modifica nada en tbl_certificado.
 */
const formatFechaHora = (valor) => {
    if (!valor) return "-";
    try {
        // El API devuelve datetime de MySQL; Safari necesita la T.
        const fecha = new Date(String(valor).replace(" ", "T"));
        if (isNaN(fecha)) return "-";
        return fecha.toLocaleString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    } catch {
        return "-";
    }
};

const Dato = ({ icono, label, valor }) => {
    if (!valor) return null;
    return (
        <div className="flex items-start gap-3">
            <span className={`${icono} h-5 w-5 text-greenVE-600 flex-shrink-0 mt-0.5`}></span>
            <div className="min-w-0">
                <p className="text-xs text-gray-400 leading-tight">{label}</p>
                <p className="text-sm text-gray-800 font-medium break-words">{valor}</p>
            </div>
        </div>
    );
};

const TicketModal = ({ ticket, onClose }) => {
    if (!ticket) return null;

    const beneficiarios = Number(ticket.beneficiarios) || 0;
    const beneficio =
        ticket.titulo_oferta ||
        (ticket.precio_oferta != null ? `US $${ticket.precio_oferta}` : null);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
                {/* Imagen de la oferta */}
                {ticket.foto_oferta && (
                    <img
                        src={ticket.foto_oferta}
                        alt={ticket.titulo_oferta || "Oferta"}
                        className="w-full h-40 object-cover flex-shrink-0"
                    />
                )}

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <h2 className="text-center text-base font-semibold tracking-wide text-gray-700 mb-4">
                        TICKET GENERADO
                    </h2>

                    {/* Codigo de barras */}
                    {ticket.url ? (
                        <img
                            src={ticket.url}
                            alt={`Código ${ticket.codigo}`}
                            className="mx-auto h-20 object-contain mb-5"
                        />
                    ) : (
                        <p className="text-center font-mono font-bold text-2xl tracking-widest text-gray-800 mb-5">
                            {ticket.codigo}
                        </p>
                    )}

                    <div className="space-y-4">
                        <Dato
                            icono="icon-[solar--user-rounded-outline]"
                            label="Usuario"
                            valor={ticket.nombre_usuario}
                        />
                        <Dato
                            icono="icon-[mdi--office-building-outline]"
                            label="Establecimiento"
                            valor={ticket.nombre_establecimiento}
                        />
                        <Dato
                            icono="icon-[mdi--calendar]"
                            label="Fecha"
                            valor={formatFechaHora(ticket.created_at)}
                        />
                        <Dato
                            icono="icon-[mdi--tag-outline]"
                            label="Beneficio"
                            valor={beneficio}
                        />
                        <Dato
                            icono="icon-[mdi--map-marker-outline]"
                            label="Lugar de referencia"
                            valor={ticket.ubicacion}
                        />
                        <Dato
                            icono="icon-[mdi--account-group-outline]"
                            label="Cantidad de beneficiarios"
                            valor={beneficiarios > 0 ? String(beneficiarios) : null}
                        />
                    </div>
                </div>

                <div className="px-6 pb-5 pt-2 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full bg-greenVE-500 hover:bg-greenVE-600 text-white font-semibold py-3 rounded-full transition-all active:scale-95"
                    >
                        CERRAR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketModal;
