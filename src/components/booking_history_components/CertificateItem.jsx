import { useState } from "react";
import { Spinner } from "@material-tailwind/react";
import { CERT_USADO, TYPE_CERTIFICADO, TYPE_TICKET } from "../../controllers/certificado/certificadoController";
import { getCertificado } from "../../controllers/establecimiento/establecimientoController";
import TicketModal from "./TicketModal";

const formatFecha = (valor, conHora = false) => {
    if (!valor) return "-";
    try {
        // El API devuelve datetime de MySQL ("2026-07-16 09:08:45"); Safari necesita la T.
        const fecha = new Date(String(valor).replace(" ", "T"));
        if (isNaN(fecha)) return "-";
        return fecha.toLocaleString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            ...(conHora && { hour: "2-digit", minute: "2-digit", hour12: false }),
        });
    } catch {
        return "-";
    }
};

const CertificateItem = ({ certificado, onMarcarUsado, onEliminar }) => {
    const [accion, setAccion] = useState(null);
    const [verTicket, setVerTicket] = useState(false);
    const usado = Number(certificado.is_active) === CERT_USADO;

    const handleUsar = async () => {
        if (accion || usado) return;
        setAccion("usar");
        await onMarcarUsado(certificado.id_tbl_certificado);
        setAccion(null);
    };

    const handleEliminar = async () => {
        if (accion) return;
        if (!window.confirm("¿Eliminar este certificado? Esta acción no se puede deshacer.")) return;
        setAccion("eliminar");
        await onEliminar(certificado.id_tbl_certificado);
        setAccion(null);
    };

    const adultos = Number(certificado.beneficiarios) || 0;
    const ninos = Number(certificado.ninos) || 0;

    // El PDF se reconstruye desde los datos de la fila con getCertificado, que
    // es solo lectura (/est/getCertificado). No inserta nada en tbl_certificado:
    // esa tabla solo la escribe crearTicket.php.
    const puedeVerPdf =
        Number(certificado.id_tbl_type) === TYPE_CERTIFICADO &&
        !!certificado.id_tbl_establecimiento &&
        !!certificado.id_tbl_oferta &&
        !!certificado.fecha_inicio &&
        !!certificado.fecha_fin;

    // Los tickets no tienen PDF: se muestran en un modal con el codigo de barras
    // y la imagen de la oferta, igual que en la app movil.
    const esTicket = Number(certificado.id_tbl_type) === TYPE_TICKET;

    const handleVerPdf = async () => {
        if (accion) return;
        setAccion("pdf");
        const result = await getCertificado(
            "", // vacio = el usuario logueado
            certificado.id_tbl_establecimiento,
            [{ cant: 1, oferta: certificado.id_tbl_oferta }],
            { inicio: certificado.fecha_inicio, fin: certificado.fecha_fin },
            adultos,
            ninos
        );
        setAccion(null);
        if (result) {
            window.open(`/certificado?${result}&Adultos=${adultos}&Ninos=${ninos}`, "_blank");
        }
    };
    const estrellas = Number(certificado.catalogacion) || 0;
    // ubicacion es la guardada al generar el certificado (historica); la direccion actual es el fallback.
    const ubicacion = certificado.ubicacion || certificado.direccion_establecimiento || "";

    return (
        <div className="flex border shadow-lg rounded-lg p-4 gap-4 items-center">
            {/* Código de barras */}
            {certificado.url && (
                <img
                    src={certificado.url}
                    alt={`Código ${certificado.codigo}`}
                    className="hidden sm:block h-14 w-28 object-contain flex-shrink-0"
                />
            )}

            {/* Datos */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
                {/* Establecimiento + estado */}
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-800 truncate">
                        {certificado.nombre_establecimiento || "Establecimiento no disponible"}
                    </p>
                    {estrellas > 0 && (
                        <span className="flex gap-0.5">
                            {Array(estrellas).fill(null).map((_, i) => (
                                <svg key={i} height="11px" width="11px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="fill-amber-400">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                            ))}
                        </span>
                    )}
                    <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${usado
                            ? "bg-gray-100 text-gray-500"
                            : "bg-greenVE-100 text-greenVE-700"
                            }`}
                    >
                        {usado ? "Usado" : "Activo"}
                    </span>
                </div>

                {/* Oferta escogida */}
                {certificado.titulo_oferta && (
                    <p className="text-sm text-greenVE-700 font-medium truncate">
                        {certificado.titulo_oferta}
                    </p>
                )}

                {/* Código */}
                <p className="font-mono text-xs text-gray-500 tracking-wider">{certificado.codigo}</p>

                {ubicacion && (
                    <p className="text-sm text-gray-600 truncate">{ubicacion}</p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span>Generado: {formatFecha(certificado.created_at, true)}</span>
                    {usado && certificado.used_at && <span>Usado: {formatFecha(certificado.used_at)}</span>}
                    {adultos > 0 && <span>{adultos} adulto{adultos !== 1 ? "s" : ""}</span>}
                    {ninos > 0 && (
                        <span>
                            {ninos} niño{ninos !== 1 ? "s" : ""}
                            {certificado.edades_ninos ? ` (${certificado.edades_ninos} años)` : ""}
                        </span>
                    )}
                </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 flex-shrink-0">
                {/* Ver ticket: unica accion que sobrevive al marcarlo usado. */}
                {esTicket && (
                    <button
                        onClick={() => setVerTicket(true)}
                        disabled={accion !== null}
                        title="Ver ticket"
                        className="h-9 w-9 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all disabled:opacity-60"
                    >
                        <span className="icon-[iconamoon--certificate-badge] h-4 w-4"></span>
                    </button>
                )}

                {/* Ver certificado: unica accion que sobrevive al marcarlo usado. */}
                {puedeVerPdf && (
                    <button
                        onClick={handleVerPdf}
                        disabled={accion !== null}
                        title="Ver certificado"
                        className="h-9 w-9 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all disabled:opacity-60"
                    >
                        {accion === "pdf" ? (
                            <Spinner className="h-4 w-4" />
                        ) : (
                            <span className="icon-[iconamoon--certificate-badge] h-4 w-4"></span>
                        )}
                    </button>
                )}

                {/* Marcar como usado y eliminar solo existen mientras no este usado. */}
                {!usado && (
                    <button
                        onClick={handleUsar}
                        disabled={accion !== null}
                        title="Marcar como usado"
                        className="h-9 w-9 rounded-full flex items-center justify-center bg-greenVE-50 text-greenVE-600 hover:bg-greenVE-100 active:scale-95 transition-all disabled:opacity-60"
                    >
                        {accion === "usar" ? (
                            <Spinner className="h-4 w-4" />
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </button>
                )}

                {!usado && (
                    <button
                        onClick={handleEliminar}
                        disabled={accion !== null}
                        title="Eliminar (solo si aún no lo has usado)"
                        className="h-9 w-9 rounded-full flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all disabled:opacity-60"
                    >
                        {accion === "eliminar" ? (
                            <Spinner className="h-4 w-4" />
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </button>
                )}
            </div>

            {verTicket && (
                <TicketModal ticket={certificado} onClose={() => setVerTicket(false)} />
            )}
        </div>
    );
};

export default CertificateItem;
