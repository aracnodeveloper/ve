import { useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PUNTOS_CARGA } from "./puntosCargaData";
import { PUNTOS_KIA } from "./puntosCargaKia";
import { PUNTOS_CHEVROLET } from "./puntosCargaChevrolet";
import { PUNTOS_ELECTROMAPS } from "./puntosCargaElectromaps";
import iconoEvinka from "../../assets/Logo VE - evinka.png";
import iconoEvinkaBlanco from "../../assets/Logo_white VE - evinka.png";
import logoByd from "../../assets/logos/byd.png";
import logoEvinka from "../../assets/logos/evinka.png";
import logoCondor from "../../assets/logos/condor.png";
import logoRayoCarga from "../../assets/logos/rayo-carga.png";
import logoPlugNDrive from "../../assets/logos/plug-n-drive.png";
import logoVisitaEcuador from "../../assets/logos/visitaecuador.png";
import logoKfc from "../../assets/logos/kfc.png";
import logoWyndham from "../../assets/logos/wyndham.png";
import logoOroVerde from "../../assets/logos/oro-verde.png";
import logoDk from "../../assets/logos/dk.png";
import logoKia from "../../assets/logos/kia.png";
import logoChevrolet from "../../assets/logos/chevrolet.png";
import logoMavesa from "../../assets/logos/mavesa.png";
import logoAutomekano from "../../assets/logos/mekano-auto.png";
import SolicitudPuntoCarga from "./SolicitudPuntoCarga";

/**
 * Mapa de puntos a pantalla completa.
 *
 * Cada punto lleva una categoria (que define su color y el filtro de la
 * leyenda) y los atributos por los que se puede filtrar. coords va como
 * [latitud, longitud], asi lo espera Leaflet.
 */

export const CATEGORIAS = {
    aliados: { label: "Aliados", color: "#6b7280" },
    puntos: { label: "Puntos de carga", color: "#2563eb" },
    destinos: { label: "Destinos", color: "#84b60a" },
};

// Los nuestros, las electrolineras de Kia, los puntos de Chevrolet y los de Electromaps que no
// estaban ya (puntosCargaKia.js, puntosCargaChevrolet.js y puntosCargaElectromaps.js se generan
// con scripts/importarPuntos*.js).
export const PUNTOS = [...PUNTOS_CARGA, ...PUNTOS_KIA, ...PUNTOS_CHEVROLET, ...PUNTOS_ELECTROMAPS];

// Los puntos del convenio Evinka no van como circulo azul: llevan su propio
// logo. El icono se mide en pixeles y se ancla al centro, para que quede sobre
// la coordenada igual que el circulo al que reemplaza.
const ICONO_EVINKA = L.icon({
    iconUrl: iconoEvinka,
    iconSize: [20, 20],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    tooltipAnchor: [0, -15],
    className: "punto-carga-evinka",
});

const esEvinka = (p) => /evinka/i.test(p.convenio || "");

/**
 * Logos que se muestran en el detalle de un punto.
 *
 * Son archivos en blanco sobre fondo transparente, por eso van dentro de una
 * pastilla oscura: sobre el fondo blanco de la ventana no se verian.
 *
 * - Por convenio: un convenio como "BYD - Evinka" muestra los dos logos.
 * - Por local: hoy solo coincide KFC; Wyndham, Oro Verde y dk quedan listos
 *   para cuando se agreguen esos puntos.
 */
const LOGOS_CONVENIO = [
    { busca: /byd/i, nombre: "BYD", src: logoByd },
    { busca: /evinka/i, nombre: "Evinka", src: logoEvinka },
    { busca: /condor|cóndor/i, nombre: "Condor Energy", src: logoCondor },
    { busca: /rayo/i, nombre: "Rayo Carga", src: logoRayoCarga },
    { busca: /plug/i, nombre: "Plug N' Drive", src: logoPlugNDrive },
    { busca: /^kia$/i, nombre: "Kia", src: logoKia },
    { busca: /^chevrolet$/i, nombre: "Chevrolet", src: logoChevrolet },
    { busca: /^mavesa$/i, nombre: "Mavesa", src: logoMavesa },
    { busca: /^automekano$/i, nombre: "Automekano", src: logoAutomekano },
];

const LOGOS_LOCAL = [
    { busca: /^kfc\b/i, nombre: "KFC", src: logoKfc },
    { busca: /wyndham/i, nombre: "Wyndham", src: logoWyndham },
    { busca: /oro\s*verde/i, nombre: "Oro Verde", src: logoOroVerde },
    { busca: /\bdk\b/i, nombre: "dk", src: logoDk },
];

const logosDelPunto = (p) => {
    const encontrados = LOGOS_CONVENIO.filter((l) => l.busca.test(p.convenio || ""));
    // Los puntos del convenio Evinka llevan ademas el logo de VisitaEcuador.
    if (esEvinka(p))
        encontrados.push({ nombre: "VisitaEcuador.com", src: logoVisitaEcuador });
    LOGOS_LOCAL.forEach((l) => {
        if (l.busca.test(p.nombre || "")) encontrados.push(l);
    });
    return encontrados;
};

const CENTRO_ECUADOR = [-1.6, -78.6];
const ZOOM_ECUADOR = 7;

const googleMapsUrl = (p) =>
    `https://www.google.com/maps/search/?api=1&query=${p.coords[0]},${p.coords[1]}`;

/** Distancia aproximada en km entre dos coordenadas. */
const distanciaKm = ([lat1, lon1], [lat2, lon2]) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
};

/** Expone el mapa al componente padre para poder volar a un punto. */
const CapturarMapa = ({ onReady }) => {
    const map = useMap();
    onReady(map);
    return null;
};

/**
 * Datos del punto. Se usa igual al pasar el cursor (globo) y al hacer click
 * (ventana), asi no hay dos versiones del mismo contenido que mantener. Los
 * enlaces solo van en el click: en el globo no se pueden tocar, porque se
 * cierra al mover el cursor.
 */
const DetallePunto = ({ p, conEnlaces = false }) => (
    <>
        <strong className="block text-gray-800">{p.nombre}</strong>
        {(p.ciudad || p.provincia) && (
            <span className="block text-gray-600">
                {[p.ciudad, p.provincia].filter(Boolean).join(", ")}
            </span>
        )}
        {p.direccion && <span className="block text-gray-500 text-[11px]">{p.direccion}</span>}
        {p.convenio && (
            <span className="block text-gray-500 text-[11px] mt-0.5">Convenio: {p.convenio}</span>
        )}

        {logosDelPunto(p).length > 0 && (
            <span className="flex flex-wrap items-center gap-1 mt-1.5">
                {/* Todos los recuadros miden lo mismo: los logos tienen proporciones muy distintas
                    (dk es cuadrado, Plug N' Drive siete veces más ancho que alto), así que cada uno se
                    ajusta dentro del mismo espacio sin deformarse. */}
                {logosDelPunto(p).map((l) => (
                    <span key={l.nombre} className="inline-flex items-center justify-center bg-[#1e293b] rounded w-[88px] h-7 px-1.5">
                        <img src={l.src} alt={l.nombre} title={l.nombre} className="max-w-full max-h-[18px] w-auto h-auto object-contain" />
                    </span>
                ))}
            </span>
        )}

        {(p.conectores || []).length > 0 && (
            <span className="block mt-1.5">
                <span className="block font-semibold text-gray-700">Conectores</span>
                {p.conectores.map((c, i) => (
                    <span key={i} className="block text-gray-600">
                        {/* Sin el tipo de conector (aún no lo sabemos) se nombra genérico. */}
                        • {c.conector || "Cargador"}
                        {c.cantidad > 1 ? ` (x${c.cantidad})` : ""} —{" "}
                        {/* Chevrolet (PlugShare) no publica la potencia: se omite si no viene. */}
                        {[c.potencia, c.tipoCarga === "RAPIDA" ? "carga rápida" : "carga estándar"].filter(Boolean).join(", ")}
                    </span>
                ))}
            </span>
        )}

        {/* Sin el detalle de conectores (los puntos de Kia no lo publican), al menos la velocidad si se conoce. */}
        {(p.conectores || []).length === 0 && p.tipoCarga && (
            <span className="block text-gray-600 mt-1">
                {p.tipoCarga === "RAPIDA" ? "Carga rápida" : "Carga estándar"}
            </span>
        )}

        {p.nota && <span className="block text-amber-700 mt-1">{p.nota}</span>}

        {p.horario && (
            <span className="block text-gray-600 mt-1">
                Horario: {p.horario}
                {p.horarioFeriados && <span className="block">Feriados: {p.horarioFeriados}</span>}
            </span>
        )}

        {/* La tarifa solo se muestra si se conoce. */}
        {(p.tarifado === "SI" || p.tarifado === "NO") && (
            <span className="block text-gray-600 mt-1">
                {p.tarifado === "SI" ? "Servicio tarifado" : "Sin costo"}
            </span>
        )}

        {conEnlaces ? (
            <>
                {p.app && (
                    <a href={p.app} target="_blank" rel="noreferrer" className="block text-greenVE-700 mt-1">
                        Descargar app del operador
                    </a>
                )}
                <a href={googleMapsUrl(p)} target="_blank" rel="noreferrer" className="block text-greenVE-700 mt-1">
                    <span className="icon-[ph--map-pin-fill] h-3 w-3 text-red flex-shrink-0"></span>
                    Cómo llegar
                </a>
            </>
        ) : (
            <span className="block font-bold text-black text-[11px] mt-1.5">
                Haz clic para ver cómo llegar
            </span>
        )}
    </>
);

const Selector = ({ label, value, onChange, options, placeholder = "Todos" }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs text-black/80">{label}:</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-white border border-greenVE-500 text-black text-sm rounded px-2 py-1.5
                       focus:outline-none focus:border-greenVE-500 [&>option]:text-gray-800"
        >
            <option value="">{placeholder}</option>
            {options.map((o) => (
                <option key={o} value={o}>{o}</option>
            ))}
        </select>
    </div>
);

const PuntosCargaMap = ({ puntos = PUNTOS }) => {
    const [mapa, setMapa] = useState(null);

    // Categorias visibles (todas encendidas al inicio)
    const [visibles, setVisibles] = useState(() =>
        Object.keys(CATEGORIAS).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );

    // Filtros
    const [ciudad, setCiudad] = useState("");
    const [conector, setConector] = useState("");
    const [tipoCarga, setTipoCarga] = useState("");
    const [convenio, setConvenio] = useState("");
    const [aviso, setAviso] = useState(null);
    // Panel lateral "Solicita tu punto de carga" (ver SolicitudPuntoCarga).
    const [formAbierto, setFormAbierto] = useState(false);

    // Opciones de los selects, sacadas de los propios datos
    const unicos = (campo) =>
        [...new Set(puntos.map((p) => p[campo]).filter(Boolean))].sort();

    const ciudades = useMemo(() => unicos("ciudad"), [puntos]);
    const convenios = useMemo(() => unicos("convenio"), [puntos]);
    const tiposCarga = useMemo(() => unicos("tipoCarga"), [puntos]);

    // Los conectores salen del detalle de cada estacion, no del texto resumido.
    const conectores = useMemo(() => {
        const set = new Set();
        puntos.forEach((p) => (p.conectores || []).forEach((c) => c.conector && set.add(c.conector)));
        return [...set].sort();
    }, [puntos]);

    const tieneConector = (p, c) =>
        !c || (p.conectores || []).some((x) => x.conector === c);

    // Se mira cada conector; los puntos sin detalle de conectores (los de Kia) usan su tipo general.
    const tieneTipoCarga = (p, t) => {
        if (!t) return true;
        const conectores = p.conectores || [];
        return conectores.length > 0 ? conectores.some((c) => c.tipoCarga === t) : p.tipoCarga === t;
    };

    const filtrados = useMemo(
        () =>
            puntos.filter(
                (p) =>
                    visibles[p.categoria] !== false &&
                    (!ciudad || p.ciudad === ciudad) &&
                    tieneConector(p, conector) &&
                    (!convenio || p.convenio === convenio) &&
                    tieneTipoCarga(p, tipoCarga)
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [puntos, visibles, ciudad, conector, convenio, tipoCarga]
    );

    const toggleCategoria = (k) =>
        setVisibles((v) => ({ ...v, [k]: !v[k] }));

    const reiniciar = () => {
        setCiudad("");
        setConector("");
        setTipoCarga("");
        setConvenio("");
        setVisibles(Object.keys(CATEGORIAS).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
        setAviso(null);
        if (mapa) mapa.flyTo(CENTRO_ECUADOR, ZOOM_ECUADOR, { duration: 0.8 });
    };

    const irAlMasCercano = () => {
        setAviso(null);
        if (!filtrados.length) {
            setAviso("No hay puntos con estos filtros.");
            return;
        }
        if (!navigator.geolocation) {
            setAviso("Tu navegador no permite ubicarte.");
            return;
        }
        setAviso("Buscando tu ubicación...");
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const yo = [coords.latitude, coords.longitude];
                const cercano = filtrados.reduce((a, b) =>
                    distanciaKm(yo, a.coords) <= distanciaKm(yo, b.coords) ? a : b
                );
                setAviso(`Más cercano: ${cercano.nombre} (${distanciaKm(yo, cercano.coords).toFixed(1)} km)`);
                if (mapa) mapa.flyTo(cercano.coords, 14, { duration: 1 });
            },
            () => setAviso("No pudimos obtener tu ubicación.")
        );
    };

    return (
        <div className="relative w-full h-full">
            <MapContainer
                center={CENTRO_ECUADOR}
                zoom={ZOOM_ECUADOR}
                scrollWheelZoom
                zoomControl={false}
                style={{ height: "100%", width: "100%" }}
            >
                <CapturarMapa onReady={setMapa} />
                {/* OpenStreetMap: sin API key. Para el estilo claro tipo CARTO se
                    necesita una cuenta con token, se puede cambiar aqui. */}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {filtrados.map((p) => {
                    const Punto = esEvinka(p) ? Marker : CircleMarker;
                    const propiosDelPunto = esEvinka(p)
                        ? { position: p.coords, icon: ICONO_EVINKA }
                        : {
                            center: p.coords,
                            radius: 7,
                            pathOptions: {
                                color: "#ffffff",
                                weight: 2,
                                fillColor: (CATEGORIAS[p.categoria] || CATEGORIAS.puntos).color,
                                fillOpacity: 1,
                            },
                        };
                    return (
                        <Punto
                            key={p.id}
                            {...propiosDelPunto}
                            eventHandlers={{
                                // Si la ventana del punto ya esta abierta, el globo
                                // sobra y ademas la tapa.
                                mouseover: (e) => e.target.isPopupOpen() && e.target.closeTooltip(),
                                popupopen: (e) => e.target.closeTooltip(),
                            }}
                        >
                            <Tooltip direction="top" offset={[0, -8]} opacity={1} className="punto-carga-globo">
                                <DetallePunto p={p} />
                            </Tooltip>
                            <Popup>
                                <DetallePunto p={p} conEnlaces />
                            </Popup>
                        </Punto>
                    );
                })}
            </MapContainer>

            {/* Leyenda / capas: arriba a la derecha */}
            <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-lg px-3 py-2.5">
                <div className="flex items-start gap-2">
                    <span className="icon-[ph--map-pin-fill] h-7 w-7 text-gray-800 flex-shrink-0"></span>
                    <div className="flex flex-col gap-1">
                        {Object.entries(CATEGORIAS).map(([k, c]) => (
                            <button
                                key={k}
                                onClick={() => toggleCategoria(k)}
                                className={`flex items-center gap-1.5 text-sm font-semibold transition-opacity ${visibles[k] ? "opacity-100" : "opacity-35"
                                    }`}
                                title={visibles[k] ? "Ocultar" : "Mostrar"}
                            >
                                <span
                                    className="h-3 w-3 rounded-full border border-white shadow flex-shrink-0"
                                    style={{ backgroundColor: c.color }}
                                ></span>
                                <span className="text-gray-800">{c.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Columna de abajo a la derecha: el boton de agregar punto va pegado encima del panel
                de filtros, asi sube y baja con el panel sin medidas fijas. */}
            <div className="absolute bottom-24 md:bottom-8 right-3 w-72 flex flex-col gap-2 z-[1000]">
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#8AB600] hover:bg-greenVE-600 text-white font-semibold text-xs md:text-sm rounded-lg shadow-xl
                           py-2.5 px-3 transition-colors flex items-center justify-center gap-2"
                >
                    <img className="h-6 w-6" src={iconoEvinkaBlanco} alt="" />
                    {/* El total sale de los listados: crece solo al sumar puntos. */}
                    {PUNTOS.length} Puntos de carga
                </a>
                <button
                    onClick={() => setFormAbierto(true)}
                    className="bg-[#8AB600] hover:bg-greenVE-600 text-white font-semibold text-sm rounded-lg shadow-xl
                           py-2.5 px-3 transition-colors flex items-center justify-center gap-2"
                >
                    <span className="icon-[ph--plus-circle-fill] h-4 w-4"></span>
                    Solicita tu punto de carga
                </button>

                {/* Filtros */}
                <div className="bg-white backdrop-blur rounded-lg shadow-xl p-3 flex flex-col gap-2.5">
                    <Selector label="Ciudad" value={ciudad} onChange={setCiudad} options={ciudades} placeholder="Todas" />
                    <Selector label="Conector" value={conector} onChange={setConector} options={conectores} />
                    <Selector label="Tipo de Carga" value={tipoCarga} onChange={setTipoCarga} options={tiposCarga} />
                    <Selector label="Convenio" value={convenio} onChange={setConvenio} options={convenios} />

                    <button
                        onClick={irAlMasCercano}
                        className="bg-white hover:bg-greenVE-500/10 border border-greenVE-500 text-black text-sm rounded py-1.5 transition-colors"
                    >
                        Ir al más cercano
                    </button>
                    <button
                        onClick={reiniciar}
                        className="bg-white hover:bg-greenVE-500/10 border border-greenVE-500 text-black text-sm rounded py-1.5 transition-colors"
                    >
                        Reiniciar filtros
                    </button>

                    {aviso && <p className="text-[11px] text-black/80 leading-snug">{aviso}</p>}
                    <p className="text-[11px] text-black/50">
                        {filtrados.length} de {puntos.length} puntos
                    </p>
                </div>
            </div>

            {formAbierto && <SolicitudPuntoCarga onCerrar={() => setFormAbierto(false)} />}
        </div>
    );
};

export default PuntosCargaMap;
