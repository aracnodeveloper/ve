import { useEffect, useState } from "react";
import { Spinner } from "@material-tailwind/react";
import { generarTicketVino } from "../../controllers/certificado/certificadoController";
import { useBeneficios, puedeGenerarTicket, invalidarBeneficios } from "../../global/oneShot";
import TicketModal from "../booking_history_components/TicketModal";

/**
 * Generar el ticket de una oferta de beneficio (restaurantes, rutas, tours).
 *
 * Antes este paso confirmaba la reserva por WhatsApp; ahora genera el ticket en
 * tbl_certificado y lo muestra al momento con su código de barras, para presentarlo
 * en el establecimiento. Luego queda en el historial del usuario.
 */

const DAY_NAMES_0 = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAY_NAMES_1 = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MAX_PERSONAS = 5;

const fmtDayRange = (s, e) => {
    const useB1 = s > 6 || e > 6;
    const names = useB1 ? DAY_NAMES_1 : DAY_NAMES_0;
    const sn = names[s] ?? s; const en = names[e] ?? e;
    return sn === en ? sn : `${sn}–${en}`;
};

const fmtTime = (t) => {
    if (!t) return '';
    const str = typeof t === 'string' ? t : new Date(t).toISOString();
    const part = str.includes('T') ? str.split('T')[1] : str;
    const [hh, mm] = part.split(':');
    const h = parseInt(hh, 10);
    return `${h % 12 || 12}:${mm}${h >= 12 ? 'pm' : 'am'}`;
};

const RestaurantsConfirmation = ({ Ofertas, isOpen, Establecimiento, OnClose }) => {
    const [personas, setPersonas] = useState(1);
    const [generando, setGenerando] = useState(false);
    const [error, setError] = useState("");
    const [ticket, setTicket] = useState(null);

    // Politica OneShot: un ticket por subType. La peticion ya la disparo
    // Restaurant.jsx al entrar; aqui solo se lee el cache. Los hooks van antes del
    // early return de abajo para no romper las reglas de hooks.
    const { beneficios, cargando: cargandoBeneficios } = useBeneficios();
    const oferta = Ofertas?.[0];
    const beneficioAgotado = !puedeGenerarTicket(beneficios, oferta?.subType || '');

    // Cada vez que se abre para una oferta, empieza de cero.
    useEffect(() => {
        if (isOpen) {
            setPersonas(1);
            setError("");
            setTicket(null);
        }
    }, [isOpen, oferta]);

    if (!isOpen || !oferta) return null;

    const ciudad = Establecimiento.city || Establecimiento.Ciudad || '';
    const pais = Establecimiento.country || Establecimiento.Pais || '';
    const direccion = Establecimiento.address || Establecimiento.Direccion || '';

    const generar = async () => {
        if (generando) return;
        setGenerando(true);
        setError("");
        const res = await generarTicketVino({
            oferta,
            personas,
            latitud: Establecimiento.Latitud,
            longitud: Establecimiento.Longitud,
            ubicacion: [ciudad, direccion].filter(Boolean).join(' - '),
        });
        setGenerando(false);
        if (!res.ok) {
            setError(res.msj);
            return;
        }
        // Ya se usó este beneficio: que la próxima consulta OneShot lo sepa.
        invalidarBeneficios();
        setTicket({
            ...res.ticket,
            // Si vino_api no responde, al menos se ven los datos que ya tenemos en pantalla.
            titulo_oferta: res.ticket.titulo_oferta || oferta.TituloOferta || oferta.title,
            nombre_establecimiento: res.ticket.nombre_establecimiento || Establecimiento.name || Establecimiento.Titulo,
            foto_oferta: res.ticket.foto_oferta || oferta.image || oferta.FotoPrincipal,
        });
    };

    // Generado: se muestra el ticket con su código de barras.
    if (ticket) return <TicketModal ticket={ticket} onClose={OnClose} />;

    const schedules = oferta.schedules || [];
    const inventories = oferta.inventories || [];
    const imagen = oferta.image || oferta.FotoPrincipal;

    return (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={generando ? undefined : OnClose} />

            <div className="relative w-full sm:w-[460px] mx-auto z-50 flex flex-col bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">
                {/* Encabezado */}
                <div className="bg-greenVE-600 px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-[11px] font-semibold uppercase tracking-wide">Generar ticket</p>
                        <p className="text-white font-bold text-sm leading-tight truncate">
                            {Establecimiento.name || Establecimiento.Titulo}
                        </p>
                        <p className="text-white/80 text-xs mt-0.5 truncate">
                            {[ciudad, pais].filter(Boolean).join(', ')}
                            {direccion ? ` · ${direccion}` : ''}
                        </p>
                    </div>
                    <button
                        onClick={OnClose}
                        disabled={generando}
                        aria-label="Cerrar"
                        className="bg-white/20 hover:bg-white/30 text-white rounded-full h-7 w-7 flex items-center justify-center transition-colors flex-shrink-0"
                    >
                        <span className="icon-[ph--x-bold] h-3.5 w-3.5"></span>
                    </button>
                </div>

                {/* Oferta */}
                <div className="px-4 pt-4 pb-3 flex gap-3">
                    {imagen && (
                        <img src={imagen} alt={oferta.TituloOferta || oferta.title} className="w-20 h-16 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm leading-tight">{oferta.TituloOferta || oferta.title}</p>
                        {schedules.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {schedules.map((s, i) => (
                                    <span key={i} className="text-[10px] bg-greenVE-50 text-greenVE-700 border border-greenVE-200 px-1.5 py-0.5 rounded">
                                        {fmtDayRange(s.day_start, s.day_end)} · {fmtTime(s.time_st)}–{fmtTime(s.time_ed)}
                                    </span>
                                ))}
                            </div>
                        )}
                        {inventories.length > 0 && (
                            <p className="text-[11px] text-greenVE-700 mt-1">
                                🎁 Incluye: {inventories.map((i) => i.name || i.title).join(', ')}
                            </p>
                        )}
                    </div>
                </div>

                {/* Personas */}
                <div className="mx-4 mb-3 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                    <div>
                        <p className="text-sm font-semibold text-gray-700">Personas</p>
                        <p className="text-[11px] text-gray-500">Cuántas personas usarán el beneficio</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setPersonas((n) => Math.max(1, n - 1))}
                            disabled={personas <= 1 || generando}
                            aria-label="Una persona menos"
                            className="h-8 w-8 rounded-full border border-gray-300 bg-white text-gray-700 flex items-center justify-center disabled:opacity-40"
                        >
                            <span className="icon-[ph--minus-bold] h-3.5 w-3.5"></span>
                        </button>
                        <span className="w-5 text-center font-bold text-gray-800">{personas}</span>
                        <button
                            type="button"
                            onClick={() => setPersonas((n) => Math.min(MAX_PERSONAS, n + 1))}
                            disabled={personas >= MAX_PERSONAS || generando}
                            aria-label="Una persona más"
                            className="h-8 w-8 rounded-full border border-gray-300 bg-white text-gray-700 flex items-center justify-center disabled:opacity-40"
                        >
                            <span className="icon-[ph--plus-bold] h-3.5 w-3.5"></span>
                        </button>
                    </div>
                </div>

                {/* Pie */}
                <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                    {error && (
                        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>
                    )}
                    {beneficioAgotado ? (
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                            <span className="icon-[mdi--information-outline] h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5"></span>
                            <div>
                                <p className="text-xs font-semibold text-amber-800">Beneficio ya utilizado</p>
                                <p className="text-[11px] text-amber-700 leading-relaxed">
                                    Tu suscripción OneShot incluye un solo ticket de este beneficio y ya lo usaste.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={generar}
                                disabled={generando || cargandoBeneficios}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-greenVE-500 hover:bg-greenVE-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all active:scale-95"
                            >
                                {generando || cargandoBeneficios
                                    ? <Spinner color="white" className="h-4 w-4" />
                                    : <span className="icon-[ph--ticket-fill] h-5 w-5"></span>}
                                {cargandoBeneficios ? "Verificando tu suscripción..." : generando ? "Generando ticket..." : "Generar ticket"}
                            </button>
                            <p className="text-[11px] text-gray-500 text-center">
                                Presenta el ticket en el establecimiento. Quedará guardado en tu historial.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RestaurantsConfirmation;
