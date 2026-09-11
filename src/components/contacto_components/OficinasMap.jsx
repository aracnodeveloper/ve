import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix de iconos de Leaflet en webpack (por defecto no cargan).
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

/**
 * Oficinas de VisitaEcuador. Las coordenadas son aproximadas al sector de cada
 * direccion; ajustalas si necesitas mayor precision.
 */
const OFICINAS = [
    {
        id: "cuenca",
        tipo: "Principal",
        ciudad: "Cuenca",
        direccion: "Calle del Batán 5-137 y Esmeraldas",
        telefonos: ["(+593) 986253432"],
        coords: [-2.897, -79.024],
    },
    {
        id: "guayaquil",
        tipo: "Sucursal",
        ciudad: "Guayaquil",
        direccion: "Av. Juan Tanca Marengo s/n y Joaquín Orrantia, Edificio Professional Center",
        telefonos: ["(+593) 981850436"],
        coords: [-2.152, -79.889],
    },
];

// Centro y zoom para ver las oficinas de Cuenca y Guayaquil.
const CENTER = [-2.5, -79.45];
const ZOOM = 8;

// Link a Google Maps con la direccion de la oficina.
const googleMapsUrl = (o) =>
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(`VisitaEcuador ${o.ciudad}, ${o.direccion}`);

// Mueve el mapa a una oficina cuando se selecciona en la lista.
const VolarA = ({ coords }) => {
    const map = useMap();
    if (coords) map.flyTo(coords, 13, { duration: 0.8 });
    return null;
};

const telHref = (t) => "tel:" + t.replace(/[^\d+]/g, "");

const OficinaCard = ({ oficina, activa, onClick }) => (
    <div
        onClick={onClick}
        role="button"
        tabIndex={0}
        className={`w-full text-left rounded-xl border p-3 transition-all cursor-pointer ${activa
            ? "border-greenVE-400 bg-greenVE-50 shadow-sm"
            : "border-gray-300 hover:border-greenVE-300 hover:bg-gray-50"
            }`}
    >
        <div className="flex items-center gap-2">
            <span className="icon-[ph--map-pin-fill] h-4 w-4 text-greenVE-600 flex-shrink-0"></span>
            <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">{oficina.tipo}</p>
        </div>
        <p className="font-bold text-gray-800 text-sm mt-0.5">{oficina.ciudad}</p>
        <p className="text-xs text-gray-500 leading-snug mt-0.5">{oficina.direccion}</p>
        {oficina.telefonos.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {oficina.telefonos.map((t, i) => (
                    <a
                        key={i}
                        href={telHref(t)}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-greenVE-700 hover:text-greenVE-800 font-medium"
                    >
                        <span className="icon-[ph--phone-fill] h-3.5 w-3.5"></span>
                        {t}
                    </a>
                ))}
            </div>
        )}

        <a
            href={googleMapsUrl(oficina)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 mt-3 bg-white border border-gray-200 hover:border-greenVE-400
                       text-gray-700 text-xs font-medium rounded-lg px-2.5 py-1.5 transition-all"
        >
            <span className="icon-[logos--google-maps] h-3.5 w-3.5"></span>
            Ver en Google Maps
        </a>
    </div>
);

const OficinasMap = () => {
    const [activa, setActiva] = useState(null); // id de la oficina seleccionada
    const oficinaActiva = OFICINAS.find((o) => o.id === activa);

    return (
        <div className="space-y-5">
            {/* Encabezado */}
            <div className="flex items-start gap-3">
                <div>
                    <h2 className="text-lg font-bold text-greenVE-800">Ubica nuestras oficinas</h2>
                    <p className="text-sm text-gray-500">
                        Atención de lunes a viernes de 9h00 a 18h30. Sábados (Quito y Cuenca) de 9h00 a 13h00.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
                {/* Lista de oficinas */}
                <div className="space-y-2.5 order-2 lg:order-1 max-h-[460px] overflow-y-auto pr-1">
                    {OFICINAS.map((o) => (
                        <OficinaCard
                            key={o.id}
                            oficina={o}
                            activa={o.id === activa}
                            onClick={() => setActiva(o.id)}
                        />
                    ))}
                </div>

                {/* Mapa */}
                <div className="order-1 lg:order-2 h-[300px] lg:h-[460px] rounded-2xl overflow-hidden border border-gray-200">
                    <MapContainer center={CENTER} zoom={ZOOM} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {oficinaActiva && <VolarA coords={oficinaActiva.coords} />}
                        {OFICINAS.map((o) => (
                            <Marker key={o.id} position={o.coords} eventHandlers={{ click: () => setActiva(o.id) }}>
                                <Popup>
                                    <strong className="block text-greenVE-800">
                                        {o.tipo} · {o.ciudad}
                                    </strong>
                                    <span className="block text-gray-600 mt-0.5">{o.direccion}</span>
                                    {o.telefonos.map((t, i) => (
                                        <a key={i} href={telHref(t)} className="block text-greenVE-700 mt-1">
                                            📞 {t}
                                        </a>
                                    ))}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default OficinasMap;
