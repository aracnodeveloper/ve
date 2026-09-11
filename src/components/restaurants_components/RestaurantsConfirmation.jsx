import { useNavigate } from "react-router-dom";
import { crearCertificado, TYPE_TICKET } from "../../controllers/certificado/certificadoController";
import { useBeneficios, puedeGenerarTicket } from "../../global/oneShot";

const DAY_NAMES_0 = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAY_NAMES_1 = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

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

const getScheduleParts = (scheduleDateTime) => {
    const pad = (n) => String(n).padStart(2, '0');
    const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    if (scheduleDateTime && scheduleDateTime.includes('T')) {
        const [datePart, timePart] = scheduleDateTime.split('T');
        const [y, m, d] = datePart.split('-').map(Number);
        const time_st = (timePart || '').slice(0, 5);
        const dow = new Date(y, m - 1, d);
        return {
            date_st: datePart,
            time_st,
            dateDisplay: `${dias[dow.getDay()]} ${pad(d)} ${meses[m - 1]} ${y}`,
            timeDisplay: time_st,
        };
    }
    const now = new Date();
    const date_st = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time_st = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    return {
        date_st,
        time_st,
        dateDisplay: `${dias[now.getDay()]} ${pad(now.getDate())} ${meses[now.getMonth()]} ${now.getFullYear()}`,
        timeDisplay: time_st,
    };
};


const RestaurantsConfirmation = ({ Ofertas, isOpen, Establecimiento, Fechas, Valores, OnClose, Opciones, scheduleDateTime }) => {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('datos'));
    const id = user?.data?.codigo || '';
    const nombre = user?.data?.nombre || '';
    const email = user?.data?.email || '';
    const nivel = user?.data?.nivel || 'suscriptor';

    const { dateDisplay, timeDisplay } = getScheduleParts(scheduleDateTime);

    // Politica OneShot: un ticket por subType. La peticion ya la disparo
    // Restaurant.jsx al entrar; aqui solo se lee el cache. El hook va antes del
    // early return de abajo para no romper las reglas de hooks.
    const { beneficios, cargando: cargandoBeneficios } = useBeneficios();
    const subTypeOferta = Ofertas?.[0]?.subType || '';
    const beneficioAgotado = !puedeGenerarTicket(beneficios, subTypeOferta);

    if (!isOpen) return null;

    const buildMensaje = () => {
        const establecimientoNombre = Establecimiento.name || Establecimiento.Titulo;
        const ciudad = Establecimiento.city || Establecimiento.Ciudad || '';
        const pais = Establecimiento.country || Establecimiento.Pais || '';
        const direccion = Establecimiento.address || Establecimiento.Direccion || '';

        let ofertasText = '';
        Ofertas.forEach(el => {
            const personas = parseInt(el.NumPersonas || el.NumOfertas || el.cantidad) || 1;
            ofertasText += `• ${el.TituloOferta || el.title} — ${personas} persona${personas !== 1 ? 's' : ''} \n`;
            if (el.inventories?.length > 0)
                ofertasText += `  🎁 ${el.inventories.map(i => i.name || i.title).join(', ')}\n`;
            if ((el.schedules || []).length > 0)
                ofertasText += `  🕐 ${el.schedules.map(s => `${fmtDayRange(s.day_start, s.day_end)} ${fmtTime(s.time_st)}–${fmtTime(s.time_ed)}`).join(' | ')}\n`;
        });

        return (
            `Hola, deseo confirmar mi reserva 👋\n\n` +
            `Suscriptor de VisitaEcuador.com\n\n` +
            `*Titular:* ${nombre}\n` +
            `*ID:* ${id}\n` +
            `*Email:* ${email}\n` +
            `*Nivel:* ${nivel}\n\n` +
            `*Establecimiento:* ${establecimientoNombre}\n` +
            (ciudad ? `*Ciudad:* ${ciudad}${pais ? `, ${pais}` : ''}\n` : '') +
            (direccion ? `*Dirección:* ${direccion}\n` : '') +
            `\n*Fecha de visita:* ${dateDisplay}\n` +
            `*Hora:* ${timeDisplay}\n\n` +
            `*Oferta${Ofertas.length > 1 ? 's' : ''}:*\n${ofertasText}\n` +
            `Gracias.`
        );
    };

    const contactosHotel = Establecimiento.Contactos || {};
    const wsHotel = contactosHotel.Whatsapp?.[0];
    const wsNum = wsHotel
        ? (wsHotel.formateado || wsHotel.valor || wsHotel).toString().replace(/[\s+]/g, '')
        : '5939862634321';

    const handleWhatsApp = () => {
        const msg = buildMensaje().replace(/ /g, '%20').replace(/\n/g, '%0A');
        // Se abre primero para que el navegador no bloquee el popup.
        window.open(`https://wa.me/${wsNum}?text=${msg}`);

        // Se registra el ticket en tbl_certificado. No bloquea el envio por WhatsApp.
        // Los ids son los UUID de vino_api, que es donde viven estas ofertas.
        const personas = Ofertas.reduce(
            (total, el) => total + (parseInt(el.NumPersonas || el.NumOfertas || el.cantidad) || 1),
            0
        );
        const ofertaVino = Ofertas?.[0];
        crearCertificado({
            tipo: TYPE_TICKET,
            idEstablecimiento: ofertaVino?.wineEstablishment?.id,
            idOferta: ofertaVino?.IdOferta,
            adultos: personas,
            latitud: Establecimiento.Latitud,
            longitud: Establecimiento.Longitud,
            ubicacion: [ciudad, direccion].filter(Boolean).join(' - '),
            // Se guardan para poder contar beneficios por subType sin consultar vino_api.
            wineType: ofertaVino?.type,
            wineSubtype: ofertaVino?.subType,
        });
    };

    const ciudad = Establecimiento.city || Establecimiento.Ciudad || '';
    const pais = Establecimiento.country || Establecimiento.Pais || '';
    const direccion = Establecimiento.address || Establecimiento.Direccion || '';

    return (
        <div className="fixed inset-0 flex items-center sm:items-center justify-center z-40">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={OnClose} />

            {/* Modal */}
            <div className="relative w-full sm:w-[520px] mx-auto z-50
                             flex flex-col
                            rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">

                {/* Header — nombre + meta en una sola línea compacta */}
                <div className="bg-greenVE-600 px-4 pt-4 pb-3 flex-shrink-0 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
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
                        className="bg-white/20 hover:bg-white/30 text-white rounded-full h-7 w-7 flex items-center justify-center transition-colors flex-shrink-0"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Fecha + hora — justo debajo del header, pegado */}
                <div className="bg-greenVE-700 px-4 py-2 flex items-center gap-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white/70 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white text-xs capitalize">{dateDisplay}</span>
                    <span className="text-white/40 text-xs">·</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white/70 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white text-xs">{timeDisplay}</span>
                </div>

                {/* Ofertas */}
                <div className="flex-1 overflow-y-auto bg-white px-3 py-3 space-y-2">
                    {Ofertas.map((item, index) => {
                        const personas = parseInt(item.NumPersonas || item.NumOfertas || item.cantidad) || 1;
                        const schedules = item.schedules || [];
                        const inventories = item.inventories || [];
                        return (
                            <div key={index} className="flex gap-2.5 p-2.5 rounded-xl border border-gray-100 bg-gray-50">
                                {(item.image || item.FotoPrincipal) && (
                                    <img
                                        src={item.image || item.FotoPrincipal}
                                        alt={item.TituloOferta || item.title}
                                        className="w-16 h-14 object-cover rounded-lg flex-shrink-0"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-1">
                                        <p className="font-semibold text-gray-800 text-xs leading-tight">
                                            {item.TituloOferta || item.title}
                                        </p>
                                        <span className="bg-greenVE-100 text-greenVE-800 text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                                            {personas} personas
                                        </span>
                                    </div>

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
                                        <p className="text-[10px] text-greenVE-700 mt-1">
                                            🎁 {inventories.map(i => i.name || i.title).join(', ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-gray-100 px-3 py-3 flex-shrink-0">
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
                        <button
                            onClick={handleWhatsApp}
                            disabled={cargandoBeneficios}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all active:scale-95"
                        >
                            <span className="icon-[mdi--whatsapp] h-4 w-4"></span>
                            {cargandoBeneficios ? "Verificando tu suscripción..." : "Confirmar por WhatsApp"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RestaurantsConfirmation;