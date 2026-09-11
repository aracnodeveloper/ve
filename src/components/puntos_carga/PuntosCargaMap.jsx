import { useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { PUNTOS_CARGA } from "./puntosCargaData";

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

export const PUNTOS = PUNTOS_CARGA;

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

const Selector = ({ label, value, onChange, options, placeholder = "Todos" }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs text-white/80">{label}:</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-white/10 border border-white/20 text-white text-sm rounded px-2 py-1.5
                       focus:outline-none focus:border-white/50 [&>option]:text-gray-800"
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

    const filtrados = useMemo(
        () =>
            puntos.filter(
                (p) =>
                    visibles[p.categoria] !== false &&
                    (!ciudad || p.ciudad === ciudad) &&
                    tieneConector(p, conector) &&
                    (!convenio || p.convenio === convenio) &&
                    (!tipoCarga || (p.conectores || []).some((c) => c.tipoCarga === tipoCarga))
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

                {filtrados.map((p) => (
                    <CircleMarker
                        key={p.id}
                        center={p.coords}
                        radius={7}
                        pathOptions={{
                            color: "#ffffff",
                            weight: 2,
                            fillColor: (CATEGORIAS[p.categoria] || CATEGORIAS.puntos).color,
                            fillOpacity: 1,
                        }}
                    >
                        <Popup>
                            <strong className="block text-gray-800">{p.nombre}</strong>
                            {(p.ciudad || p.provincia) && (
                                <span className="block text-gray-600">
                                    {[p.ciudad, p.provincia].filter(Boolean).join(", ")}
                                </span>
                            )}
                            {p.convenio && (
                                <span className="block text-gray-500 text-[11px] mt-0.5">Convenio: {p.convenio}</span>
                            )}

                            {(p.conectores || []).length > 0 && (
                                <span className="block mt-1.5">
                                    <span className="block font-semibold text-gray-700">Conectores</span>
                                    {p.conectores.map((c, i) => (
                                        <span key={i} className="block text-gray-600">
                                            • {c.conector}
                                            {c.cantidad > 1 ? ` (x${c.cantidad})` : ""} — {c.potencia}, {c.tipoCarga === "RAPIDA" ? "carga rápida" : "carga estándar"}
                                        </span>
                                    ))}
                                </span>
                            )}

                            <span className="block text-gray-600 mt-1">
                                {p.tarifado === "SI" ? "Servicio tarifado" : "Sin costo"}
                            </span>

                            {p.app && (
                                <a href={p.app} target="_blank" rel="noreferrer" className="block text-greenVE-700 mt-1">
                                    Descargar app del operador
                                </a>
                            )}
                            <a href={googleMapsUrl(p)} target="_blank" rel="noreferrer" className="block text-greenVE-700 mt-1">
                                Cómo llegar
                            </a>
                        </Popup>
                    </CircleMarker>
                ))}
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

            {/* Filtros: abajo a la derecha */}
            <div className="absolute bottom-8 right-3 z-[1000] bg-[#1e293b]/95 backdrop-blur rounded-lg shadow-xl p-3 w-56 flex flex-col gap-2.5">
                <Selector label="Ciudad" value={ciudad} onChange={setCiudad} options={ciudades} placeholder="Todas" />
                <Selector label="Conector" value={conector} onChange={setConector} options={conectores} />
                <Selector label="Tipo de Carga" value={tipoCarga} onChange={setTipoCarga} options={tiposCarga} />
                <Selector label="Convenio" value={convenio} onChange={setConvenio} options={convenios} />

                <button
                    onClick={irAlMasCercano}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm rounded py-1.5 transition-colors"
                >
                    Ir al más cercano
                </button>
                <button
                    onClick={reiniciar}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm rounded py-1.5 transition-colors"
                >
                    Reiniciar filtros
                </button>

                {aviso && <p className="text-[11px] text-white/80 leading-snug">{aviso}</p>}
                <p className="text-[11px] text-white/50">
                    {filtrados.length} de {puntos.length} puntos
                </p>
            </div>
        </div>
    );
};

export default PuntosCargaMap;
