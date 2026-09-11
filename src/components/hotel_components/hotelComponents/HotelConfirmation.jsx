import { useState } from "react";
import { createReservation, getCertificado } from "../../../controllers/establecimiento/establecimientoController";
import { crearCertificado } from "../../../controllers/certificado/certificadoController";
import { useBeneficios, puedeGenerarCertificado } from "../../../global/oneShot";
import { Spinner } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import Icons from "../../../global/icons";
import Config from "../../../global/config";


const StepIndicator = ({ currentStep, onStepClick }) => {
    const steps = [
        { num: 1, label: "Consultar" },
        { num: 2, label: "Resumen" },
    ];

    return (
        <div className="flex items-center justify-center px-4">
            {steps.map((step, index) => (
                <div key={step.num} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={() => onStepClick && onStepClick(step.num)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                                ${currentStep === step.num
                                    ? "bg-greenVE-600 border-greenVE-600 text-white shadow-md scale-110"
                                    : currentStep + 1 === step.num
                                        ? "bg-greenVE-500 border-greenVE-500 text-white cursor-pointer hover:bg-greenVE-600 hover:scale-105"
                                        : "bg-white/30 border-white/50 text-white/60 cursor-pointer hover:bg-white/40"
                                }`}
                            disabled={currentStep + 1 < step.num}
                        >
                            {currentStep > step.num ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                step.num
                            )}
                        </button>
                        <span className={`text-[10px] font-medium transition-colors duration-300
                            ${currentStep === step.num
                                ? "bg-greenVE-600 border-greenVE-600 text-white shadow-md scale-110"
                                : currentStep > step.num
                                    ? "bg-greenVE-500 border-greenVE-500 text-white cursor-pointer hover:bg-greenVE-600 hover:scale-105"
                                    : currentStep + 1 === step.num  // ← paso siguiente: permitir click
                                        ? "bg-white/30 border-white/50 text-white/60 cursor-pointer hover:bg-white/40"
                                        : "bg-white/30 border-white/50 text-white/60 cursor-not-allowed"}`}>
                            {step.label}
                        </span>
                    </div>

                    {index < steps.length - 1 && (
                        <div className={`w-16 h-0.5 mx-2 mb-4 rounded transition-all duration-500
                            ${currentStep > step.num ? "bg-greenVE-400" : "bg-white/20"}`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};


// ── PASO 1: Consultar disponibilidad ─────────────────────────────────────────
const Step1Consultar = ({ Establecimiento, Fechas, WineOffer, Ofertas, Opciones, Valores }) => {
    const [isCreatingCert, setIsCreatingCert] = useState(false);
    const [certGenerated, setCertGenerated] = useState(false);
    const [inputUser, setInputUser] = useState('');
    const [showCertInput, setShowCertInput] = useState(false);

    const getCodigoFromLocalStorage = () => {
        try {
            const datos = localStorage.getItem("datos");
            if (datos) return JSON.parse(datos)?.data?.codigo || null;
        } catch { }
        return null;
    };
    const canEditId = ["39579", "77562", "79277", "77424", "2"].includes(getCodigoFromLocalStorage());


    // Politica OneShot: un solo certificado. Al agotarlo se oculta el boton de
    // generar y tambien los contactos, para que no pueda reservar por fuera.
    // La peticion ya la disparo Hotel.jsx al entrar; aqui solo se lee el cache.
    const { beneficios, cargando: cargandoBeneficios } = useBeneficios();
    const beneficioAgotado = !puedeGenerarCertificado(beneficios);

    const formatDateShort = (date) => {
        if (!date) return '-';
        try { return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return '-'; }
    };

    const calcularNoches = () => {
        if (!Fechas?.[0]?.startDate || !Fechas?.[0]?.endDate) return 0;
        return Math.ceil(Math.abs(new Date(Fechas[0].endDate) - new Date(Fechas[0].startDate)) / (1000 * 60 * 60 * 24));
    };

    const contactosHotel = Establecimiento.Contactos;
    const contactosCentral = Establecimiento.ContactosCentral;

    const user = JSON.parse(localStorage.getItem('datos'));
    const id = user?.data?.codigo || '';
    const nombre = user?.data?.nombre || '';

    const wineOfferInfo = WineOffer ? {
        titulo: WineOffer.TituloOferta || WineOffer.title || 'Oferta Ruta del Vino',
        precio: parseFloat(WineOffer.price || WineOffer.Precio || 0),
        imagen: WineOffer.FotoPrincipal || WineOffer.image || '',
        descripcion: WineOffer.Detalle || WineOffer.description || '',
        idOferta: WineOffer.IdOferta || WineOffer.id,
        inventarios: WineOffer.inventories || WineOffer.Inventarios || [],
    } : null;

    const mensaje = () => {
        let wineMsg = "";
        if (wineOfferInfo) {
            wineMsg = `\n *Oferta Ruta del Vino:* ${wineOfferInfo.titulo}`;
            if (wineOfferInfo.precio > 0) wineMsg += ` - $${wineOfferInfo.precio.toFixed(2)}`;
            if (wineOfferInfo.inventarios.length > 0) wineMsg += `\n🎁 Regalos: ${wineOfferInfo.inventarios.map(i => i.name).join(', ')}`;
        }
        return Config.MENSAJE
            .replaceAll("{{nombre}}", nombre)
            .replaceAll("{{id}}", id)
            .replaceAll("{{hotel}}", Establecimiento.Titulo)
            .replaceAll("{{checkin}}", formatDateShort(Fechas?.[0]?.startDate))
            .replaceAll("{{checkout}}", formatDateShort(Fechas?.[0]?.endDate))
            .replaceAll("{{personas}}", "")
            .replaceAll("{{habitaciones}}", wineMsg)
            .replaceAll("{{total}}", "");
    };

    const encode = (text) => text.replaceAll(" ", "%20").replaceAll("\n", "%0A");
    const handleWhatsApp = (num) => window.open("https://wa.me/" + num + "?text=" + encode(mensaje()));
    const handleEmail = (email) => window.open("mailto:" + email + "?subject=Consulta de disponibilidad&body=" + encode(mensaje()));

    const fechaString = (fecha) => {
        const d = new Date(fecha);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Misma formula que el Resumen (Step2), para que el total del certificado
    // y el de la reserva generada coincidan.
    const totalReserva = () =>
        Number(
            ((Valores?.SinImpuestos || 0) +
                (Valores?.Impuestos || 0) +
                (wineOfferInfo?.precio || 0)
            ).toFixed(2)
        );

    const createCert = () => {
        if (isCreatingCert || !Fechas?.[0]) return;
        setIsCreatingCert(true);
        const dataOfertas = Ofertas.map(item => ({ cant: item.NumOfertas, oferta: item.Id }));
        const fechas = { inicio: fechaString(Fechas[0].startDate), fin: fechaString(Fechas[0].endDate) };
        const personasParams = `&Adultos=${Opciones.adult}&Ninos=${Opciones.children || 0}`;
        let wineOfferParams = '';
        if (wineOfferInfo) {
            wineOfferParams = `&WineOfferTitulo=${encodeURIComponent(wineOfferInfo.titulo)}` +
                `&WineOfferPrecio=${wineOfferInfo.precio}` +
                `&WineOfferImagen=${encodeURIComponent(wineOfferInfo.imagen)}` +
                `&WineOfferDescripcion=${encodeURIComponent(wineOfferInfo.descripcion)}` +
                `&WineOfferRegalos=${encodeURIComponent(wineOfferInfo.inventarios.map(i => i.name).join(', '))}`;
        }
        getCertificado(inputUser, Establecimiento.IdEstablecimiento, dataOfertas, fechas, Opciones.adult, Opciones.children).then((result) => {
            setIsCreatingCert(false);
            if (result) {
                // Si hay ofertas mezcladas (dos líneas de la misma habitación:
                // entre semana + fin de semana), el backend cobra cada una por
                // la estancia completa. Se corrige el precio del certificado con
                // el desglose real: se sobrescriben Habitaciones/Subtotal/Total
                // (los últimos valores en la URL ganan al parsear el certificado).
                let overrideParams = '';
                if (Ofertas.some(o => o._porcionDe)) {
                    const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
                    const habitaciones = Ofertas.map(o => ({
                        Cantidad: Number(o.NumOfertas) || 1,
                        Nombre: o.TituloOferta,
                        Adultos: Number(o.Adultos) || 0,
                        Ninos: Number(o.Ninos) || 0,
                        AplicaEn: o.AplicaEn,
                        Acomodacion: o.Acomodacion || '',
                        Subtotal: r2(Number(o.FinalSinImpuestos) * (Number(o.NumOfertas) || 1)),
                    }));
                    const subtotal = r2(habitaciones.reduce((s, h) => s + h.Subtotal, 0));
                    const impuestos = r2(Ofertas.reduce((s, o) => s + Number(o.Impuestos) * (Number(o.NumOfertas) || 1), 0));
                    const totalHosp = r2(subtotal + impuestos);
                    overrideParams =
                        `&Habitaciones=${encodeURIComponent(JSON.stringify(habitaciones))}` +
                        `&Subtotal=${subtotal}&Impuestos=${impuestos}&Total=${totalHosp}`;
                }
                window.open("/certificado?" + result + personasParams + wineOfferParams + overrideParams, '_blank');
                setCertGenerated(true);
                // Se registra en tbl_certificado para el historial. No bloquea la descarga.
                crearCertificado({
                    idEstablecimiento: Establecimiento.IdEstablecimiento,
                    idOferta: Ofertas?.[0]?.Id,
                    adultos: Opciones.adult,
                    ninos: Opciones.children,
                    edadesNinos: Opciones.childrenAges,
                    latitud: Establecimiento.Latitud,
                    longitud: Establecimiento.Longitud,
                    ubicacion: [Establecimiento.Ciudad, Establecimiento.Direccion].filter(Boolean).join(' - '),
                    // Se guardan para poder convertir el certificado en reserva
                    // al marcarlo como usado (tbl_reserva_new los exige).
                    fechaInicio: fechas.inicio,
                    fechaFin: fechas.fin,
                    precioTotal: totalReserva(),
                });
            }
        });
    };

    const ContactBtn = ({ icon, iconBg, iconColor, label, sublabel, borderHover, onClick }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2.5 p-2.5 bg-white border border-gray-200 ${borderHover} rounded-xl transition-all hover:shadow-sm active:scale-95`}
        >
            <div className={`${iconBg} p-1.5 rounded-lg flex-shrink-0`}>
                <span className={`${icon} h-4 w-4 ${iconColor}`}></span>
            </div>
            <div className="flex-1 text-left overflow-hidden">
                <p className="text-[10px] text-gray-400">{label}</p>
                <p className="text-xs font-medium text-gray-700 truncate">{sublabel}</p>
            </div>
            <span className="icon-[material-symbols--arrow-forward-ios-rounded] h-3.5 w-3.5 text-gray-300 flex-shrink-0"></span>
        </button>
    );

    return (
        <div className="space-y-3">

            {/* ── Fechas compactas ── */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-greenVE-50 border border-greenVE-100 rounded-xl p-2.5">
                    <p className="text-[9px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">Check-in</p>
                    <p className="text-xs font-bold text-greenVE-800">{formatDateShort(Fechas?.[0]?.startDate)}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center">
                    <p className="text-xl font-bold text-greenVE-700 leading-none">{calcularNoches()}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">noches</p>
                </div>
                <div className="bg-greenVE-50 border border-greenVE-100 rounded-xl p-2.5">
                    <p className="text-[9px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">Check-out</p>
                    <p className="text-xs font-bold text-greenVE-800">{formatDateShort(Fechas?.[0]?.endDate)}</p>
                </div>
            </div>

            {/* ── Beneficio OneShot agotado: reemplaza certificado y contactos ── */}
            {beneficioAgotado && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 flex gap-2.5">
                    <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="icon-[mdi--information-outline] h-4 w-4 text-amber-600"></span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-amber-800">Ya usaste tu certificado</p>
                        <p className="text-[11px] text-amber-700 leading-relaxed">
                            Tu suscripción OneShot incluye un solo certificado de hospedaje y ya lo utilizaste.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Certificado ── */}
            {!beneficioAgotado && (
                <div className="rounded-xl border border-greenVE-200 bg-greenVE-50 overflow-hidden">
                    <div className="px-3 py-2.5 flex items-center gap-2">
                        <div className="w-7 h-7 bg-greenVE-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="icon-[ph--certificate-bold] h-4 w-4 text-greenVE-600"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-greenVE-800">Certificado de reserva</p>
                            <p className="text-[10px] text-greenVE-600 leading-tight">Descárgalo para confirmar tu estadía</p>
                        </div>
                        {certGenerated && (
                            <div className="flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                                Descargado
                            </div>
                        )}
                    </div>

                    <div className="px-3 pb-3 space-y-2">
                        {canEditId && (
                            <>
                                <button
                                    onClick={() => setShowCertInput(v => !v)}
                                    className="flex items-center gap-1.5 text-[10px] text-greenVE-600 hover:text-greenVE-800 transition-colors"
                                >
                                    {showCertInput
                                        ? <span className="icon-[mdi--chevron-up] h-3.5 w-3.5"></span>
                                        : <span className="icon-[mdi--chevron-down] h-3.5 w-3.5"></span>
                                    }                        ¿El certificado es para otra persona?
                                    {showCertInput
                                        ? <span className="icon-[mdi--chevron-up] h-3.5 w-3.5"></span>
                                        : <span className="icon-[mdi--chevron-down] h-3.5 w-3.5"></span>
                                    }
                                </button>
                                {showCertInput && (
                                    <input
                                        className="w-full border border-greenVE-200 focus:border-greenVE-400 focus:ring-1 focus:ring-greenVE-200 rounded-lg px-3 py-2 text-xs outline-none transition-all bg-white"
                                        type="text"
                                        value={inputUser}
                                        onChange={(e) => setInputUser(e.target.value)}
                                        placeholder="ID de otro usuario (opcional)"
                                    />
                                )}
                            </>
                        )}
                        <button
                            onClick={createCert}
                            disabled={isCreatingCert || cargandoBeneficios}
                            className="w-full flex items-center justify-center gap-2 bg-greenVE-600 hover:bg-greenVE-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 text-sm"
                        >
                            {isCreatingCert ? (
                                <>
                                    <Spinner color="white" className="h-4 w-4" />
                                    <span>Generando...</span>
                                </>
                            ) : cargandoBeneficios ? (
                                <>
                                    <Spinner color="white" className="h-4 w-4" />
                                    <span>Verificando tu suscripción...</span>
                                </>
                            ) : (
                                <>
                                    <span className="icon-[ph--download-bold] h-4 w-4"></span>
                                    <span>Descargar certificado</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Contactos: se ocultan por completo si el beneficio se agoto ── */}
            {!beneficioAgotado && (
                <>
                    {/* ── Aviso consultar disponibilidad ── */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 flex gap-2.5">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="icon-[mdi--calendar-search] h-3.5 w-3.5 text-blue-600"></span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-blue-800">Consulta la disponibilidad</p>
                            <p className="text-[11px] text-blue-600 leading-relaxed">
                                Contacta al establecimiento o a nuestra central de reservas para confirmar disponibilidad antes de tu reserva.
                            </p>
                        </div>
                    </div>

                    {/* ── Central de reservas ── */}
                    <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 border-b border-gray-100 px-3 py-2 flex items-center gap-2">
                            <span className="icon-[ph--phone-bold] h-3.5 w-3.5 text-greenVE-600"></span>
                            <h3 className="text-xs font-semibold text-gray-700">Central de reservas</h3>
                        </div>
                        <div className="p-3 space-y-1.5">
                            {contactosCentral?.Whatsapp?.length > 0 && (
                                <div className={contactosCentral.Whatsapp.length > 1 ? "flex flex-row gap-2" : ""}>
                                    {contactosCentral.Whatsapp.map((item, i) => (
                                        <ContactBtn key={i}
                                            icon="icon-[mdi--whatsapp]" iconBg="bg-green-100" iconColor="text-green-600"
                                            borderHover="hover:border-green-400"
                                            label="WhatsApp central" sublabel={item.valor}
                                            onClick={() => handleWhatsApp(item.formateado.replaceAll("+", "").replaceAll(" ", ""))}
                                        />
                                    ))}
                                </div>
                            )}
                            {contactosCentral?.Email?.length > 0 && (
                                <div className={contactosCentral.Email.length > 1 ? "flex flex-row gap-2" : ""}>
                                    {contactosCentral.Email.map((item, i) => (
                                        <ContactBtn key={i}
                                            icon="icon-[material-symbols--mail-outline-rounded]" iconBg="bg-red-100" iconColor="text-red-600"
                                            borderHover="hover:border-red-400"
                                            label="Email central" sublabel={item.valor}
                                            onClick={() => handleEmail(item.valor)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Hotel directo ── */}
                    {contactosHotel && (contactosHotel.Whatsapp?.length > 0 || contactosHotel.Telefono?.length > 0 || contactosHotel.Email?.length > 0) && (
                        <>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">o también</span>
                                <div className="flex-1 h-px bg-gray-200"></div>
                            </div>

                            <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                <div className="bg-gray-50 border-b border-gray-100 px-3 py-2 flex items-center gap-2">
                                    <span className="icon-[mdi--hotel] h-3.5 w-3.5 text-greenVE-600"></span>
                                    <h3 className="text-xs font-semibold text-gray-700">Directo al hotel</h3>
                                </div>
                                <div className="p-3 space-y-1.5">
                                    {contactosHotel.Whatsapp?.length > 0 && (
                                        <div className={contactosHotel.Whatsapp.length > 1 ? "flex flex-row gap-2" : ""}>
                                            {contactosHotel.Whatsapp.map((item, i) => (
                                                <ContactBtn key={i}
                                                    icon="icon-[mdi--whatsapp]" iconBg="bg-green-100" iconColor="text-green-600"
                                                    borderHover="hover:border-green-400"
                                                    label="WhatsApp hotel" sublabel={item}
                                                    onClick={() => handleWhatsApp(item.replaceAll("+", "").replaceAll(" ", ""))}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {contactosHotel.Telefono?.map((item, i) => (
                                        <a key={i} href={`tel:${item}`}
                                            className="w-full flex items-center gap-2.5 p-2.5 bg-white border border-gray-200 hover:border-blue-400 rounded-xl transition-all hover:shadow-sm">
                                            <div className="bg-blue-100 p-1.5 rounded-lg">
                                                <span className="icon-[ph--phone-bold] h-4 w-4 text-blue-600"></span>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-[10px] text-gray-400">Teléfono hotel</p>
                                                <p className="text-xs font-medium text-gray-700">{item}</p>
                                            </div>
                                            <span className="icon-[material-symbols--arrow-forward-ios-rounded] h-3.5 w-3.5 text-gray-300"></span>
                                        </a>
                                    ))}
                                    {contactosHotel.Email?.length > 0 && (
                                        <div className={contactosHotel.Email.length > 1 ? "flex flex-row gap-2" : ""}>
                                            {contactosHotel.Email.map((item, i) => (
                                                <ContactBtn key={i}
                                                    icon="icon-[material-symbols--mail-outline-rounded]" iconBg="bg-red-100" iconColor="text-red-600"
                                                    borderHover="hover:border-red-400"
                                                    label="Email hotel" sublabel={item}
                                                    onClick={() => handleEmail(item)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};


// ── PASO 2: Resumen ───────────────────────────────────────────────────────────
const Step2Resumen = ({ Ofertas, Establecimiento, Fechas, Valores, Opciones, WineOffer, user }) => {
    const wineOfferInfo = WineOffer ? {
        titulo: WineOffer.TituloOferta || WineOffer.title || 'Oferta Ruta del Vino',
        precio: parseFloat(WineOffer.price || WineOffer.Precio || 0),
        imagen: WineOffer.FotoPrincipal || WineOffer.image || '',
        inventarios: WineOffer.inventories || WineOffer.Inventarios || [],
    } : null;

    const nombreUsuario = user?.data?.nombre || '';
    const emailUsuario = user?.data?.email || '';
    const codigoUsuario = user?.data?.codigo || '';
    const nivelUsuario = user?.data?.nivel || 'visitante';

    const Section = ({ icon, title, children }) => (
        <div className="rounded-xl border border-gray-100 overflow-hidden mb-3 shadow-sm">
            <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
                <span className={`${icon} h-4 w-4 text-greenVE-600`}></span>
                <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );

    return (
        <div className="space-y-1">
            {/* ── Establecimiento ── */}
            <Section icon="icon-[mdi--hotel]" title="Establecimiento">
                <div className="flex gap-3">
                    {(Establecimiento.image || Establecimiento.FotoPrincipal) && (
                        <img
                            src={Establecimiento.image || Establecimiento.FotoPrincipal}
                            alt={Establecimiento.name || Establecimiento.Titulo}
                            className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm leading-tight">{Establecimiento.Titulo}</p>
                        <div className="flex gap-0.5 my-1">
                            {Array(+(Establecimiento.Catalogacion || 0)).fill(null).map((_, i) => (
                                <svg key={i} height="12px" width="12px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="fill-amber-400">
                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                </svg>
                            ))}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs">{Establecimiento.Ciudad} · {Establecimiento.Direccion}</p>
                        </div>
                    </div>
                </div>
            </Section>


            {/* ── Acomodación ── */}
            <Section icon="icon-[material-symbols--bed-outline-rounded]" title="Habitaciones seleccionadas - Personas">
                {Ofertas.some(o => o._porcionDe) && (
                    <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-2">
                        <span className="icon-[mdi--information-outline] h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5"></span>
                        <p className="text-[11px] text-blue-700 leading-snug">
                            Tu estadía cruza días entre semana y fin de semana. Cada habitación se
                            cobra por sus noches: las de entre semana a su tarifa y las de fin de
                            semana a la suya.
                        </p>
                    </div>
                )}
                <div className="space-y-2">
                    {Ofertas.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <div className="flex items-start gap-2">
                                <span className="bg-greenVE-100 text-greenVE-700 text-xs font-bold px-2 py-0.5 rounded-full mt-0.5">
                                    {item.NumOfertas}x
                                </span>
                                <div>
                                    <p className="text-sm text-gray-700 font-medium">{item.TituloOferta}</p>
                                    {item.AplicaEn && (
                                        <p className="text-[11px] text-blue-500 mt-0.5 flex items-center gap-1">
                                            <span className="icon-[material-symbols-light--calendar-month-rounded] h-3.5 w-3.5"></span>
                                            {item.AplicaEn}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {item.Acomodacion && (
                                    <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                                        {item.Acomodacion}
                                    </span>
                                )}
                                {item.FinalSinImpuestos != null && (
                                    <span className="text-sm font-semibold text-gray-700">
                                        ${(Number(item.FinalSinImpuestos) * (Number(item.NumOfertas) || 1)).toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4 space-y-2">
                    <div className="flex items-center gap-2 px-3">
                        <div className="flex gap-0.5">
                            {Array(Opciones.adult).fill(null).map((_, i) => (
                                <span key={i} className="icon-[solar--user-rounded-outline] h-5 w-5 text-greenVE-600"></span>
                            ))}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{Opciones.adult} adulto{Opciones.adult !== 1 ? 's' : ''}</span>
                    </div>
                    {Opciones.children > 0 && (
                        <div className="flex items-center gap-2 px-3">
                            <div className="flex gap-0.5">
                                {Array(Opciones.children).fill(null).map((_, i) => (
                                    <span key={i} className="icon-[solar--user-rounded-outline] h-4 w-4 text-blue-400"></span>
                                ))}
                            </div>
                            <span className="text-sm text-gray-700 font-medium">{Opciones.children} niño{Opciones.children !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                    {Opciones.childrenAges?.length > 0 && (
                        <p className="text-xs text-gray-500 self-center px-3">
                            Edades: {Opciones.childrenAges.join(', ')} años
                        </p>
                    )}
                </div>
            </Section>



            {/* ── Oferta Vino (si existe) ── */}
            {wineOfferInfo && (
                <Section icon="icon-[mdi--glass-wine]" title="Ruta del Vino incluida">
                    <div className="flex gap-3 items-center">
                        {wineOfferInfo.imagen && (
                            <img src={wineOfferInfo.imagen} alt={wineOfferInfo.titulo} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-700">{wineOfferInfo.titulo}</p>
                            {wineOfferInfo.inventarios.length > 0 && (
                                <p className="text-xs text-gray-600 mt-0.5">
                                    🎁 {wineOfferInfo.inventarios.map(i => i.name).join(', ')}
                                </p>
                            )}
                            {wineOfferInfo.precio > 0 && (
                                <p className="text-xs font-bold text-amber-600 mt-1">${wineOfferInfo.precio.toFixed(2)}</p>
                            )}
                        </div>
                    </div>
                </Section>
            )}

            {/* ── Resumen de precio ── */}
            <Section icon="icon-[mdi--cash-multiple]" title="Resumen de precios">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal hospedaje</span>
                        <span className="font-semibold">${Valores.SinImpuestos}</span>
                    </div>
                    {wineOfferInfo && wineOfferInfo.precio > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Ruta del Vino</span>
                            <span className="font-semibold text-amber-600">${wineOfferInfo.precio.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Impuestos y servicios</span>
                        <span className="font-semibold">${Valores.Impuestos}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200 mt-1">
                        <span className="font-bold text-greenVE-700 text-base">Total</span>
                        <span className="font-bold text-greenVE-700 text-base">
                            ${(Valores.SinImpuestos + Valores.Impuestos + (wineOfferInfo?.precio || 0)).toFixed(2)}
                        </span>
                    </div>
                </div>
            </Section>

            {/* ── Datos del usuario ── */}
            {user && (
                <Section icon="icon-[solar--user-id-bold-duotone]" title="Datos del titular">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {nombreUsuario && (
                            <div>
                                <p className="text-xs text-gray-500">Nombre</p>
                                <p className="font-medium text-gray-800">{nombreUsuario}</p>
                            </div>
                        )}
                        {codigoUsuario && (
                            <div>
                                <p className="text-xs text-gray-500">Código</p>
                                <p className="font-medium text-gray-800">{codigoUsuario}</p>
                            </div>
                        )}
                        {emailUsuario && (
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="font-medium text-gray-800">{emailUsuario}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-gray-500">Tipo de cuenta</p>
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold capitalize
                                ${nivelUsuario === 'suscriptor' ? 'bg-greenVE-100 text-greenVE-700' : 'bg-gray-100 text-gray-600'}`}>
                                {nivelUsuario}
                            </span>
                        </div>
                    </div>
                </Section>
            )}
        </div>
    );
};


const HotelConfirmation = ({ Ofertas, isOpen, Establecimiento, Fechas, Valores, OnClose, Opciones, WineOffer }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const { beneficios, cargando: cargandoBeneficios } = useBeneficios();
    const beneficioAgotado = !puedeGenerarCertificado(beneficios);

    const user = JSON.parse(localStorage.getItem('datos'));

    if (!isOpen) return null;

    const stepTitles = {
        1: "Consulta disponibilidad",
        2: "Resumen de tu reserva",
    };
    const stepSubtitles = {
        1: "Verifica fechas, descarga certificado y contacta al establecimiento",
        2: "Revisa los detalles de tu selección",
    };

    function formatDateToAAAAMMDD(date) {
        if (!date) return '';
        try {
            const d = new Date(date);
            return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
        } catch { return ''; }
    }


    return (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => !isLoading && OnClose()}
            />

            {/* Modal */}
            <div className="relative w-full sm:w-3/4 lg:w-2/3 xl:w-1/2 2xl:w-5/12 mx-auto z-50
                            max-h-[95vh] sm:max-h-[90vh] flex flex-col
                            rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">

                {/* ── Header ── */}
                <div className="bg-greenVE-600 px-5 pt-5 pb-3 flex-shrink-0">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 pr-8">
                            <h2 className="text-white text-lg font-bold leading-tight">{stepTitles[currentStep]}</h2>
                            <p className="text-white/80 text-xs mt-0.5">{stepSubtitles[currentStep]}</p>
                        </div>
                        <button
                            onClick={() => !isLoading && OnClose()}
                            disabled={isLoading}
                            className="bg-white/20 hover:bg-white/30 text-white rounded-full h-8 w-8 flex items-center justify-center transition-colors flex-shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {!beneficioAgotado && (
                        <div className="bg-white/10 rounded-xl px-2 pt-3 pb-1">
                            <StepIndicator currentStep={currentStep} onStepClick={(step) => setCurrentStep(step)} />
                        </div>
                    )}
                </div>

                {/* ── Contenido scrollable ── */}
                <div className="flex-1 overflow-y-auto bg-white px-4 py-4">
                    {currentStep === 1 && (
                        <Step1Consultar
                            Establecimiento={Establecimiento}
                            Fechas={Fechas}
                            WineOffer={WineOffer}
                            Ofertas={Ofertas}
                            Opciones={Opciones}
                            Valores={Valores}
                        />
                    )}
                    {currentStep === 2 && (
                        <Step2Resumen
                            Ofertas={Ofertas}
                            Establecimiento={Establecimiento}
                            Fechas={Fechas}
                            Valores={Valores}
                            Opciones={Opciones}
                            WineOffer={WineOffer}
                            user={user}
                        />
                    )}
                </div>

                {/* ── Footer navegación ── */}
                <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-3 flex-shrink-0">
                    {currentStep > 1 && (
                        <button
                            onClick={() => setCurrentStep(s => s - 1)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Anterior
                        </button>
                    )}
                    {!beneficioAgotado && (
                        <>
                            {currentStep < 2 && (
                                <button
                                    onClick={() => setCurrentStep(s => s + 1)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-greenVE-600 hover:bg-greenVE-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                                >
                                    Ver resumen de reserva
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            )}
                        </>)}
                    {currentStep === 2 && (
                        <button
                            onClick={OnClose}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-all"
                        >
                            Cerrar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HotelConfirmation;