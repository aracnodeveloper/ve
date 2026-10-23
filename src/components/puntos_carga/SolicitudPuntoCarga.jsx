import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Spinner } from "@material-tailwind/react";
import { enviarContacto } from "../../controllers/contacto/contactoController";
import Config from "../../global/config";

/**
 * Panel lateral "Solicita tu punto de carga".
 *
 * Lleva los mismos datos de contacto que Contáctanos (el backend lo trata como tipo
 * "puntoCarga": correo a gerencia y comercial y lead CARGADORES en RISE) y dos cosas
 * propias del punto: tres fotos (establecimiento, parqueadero y lugar donde quieren el
 * cargador), arriba de todo para que no pasen desapercibidas, y la ubicación, que se
 * marca en un mapa.
 */

const VACIO = {
    ci: "",
    nombres: "",
    email: "",
    telefonos: "",
    direccion: "",
    ciudad: "",
    pais: "",
    mensaje: "",
};

// El mapa arranca mostrando todo Ecuador continental.
const CENTRO_ECUADOR = [-1.6, -78.6];
const ZOOM_PAIS = 6;
const ZOOM_PUNTO = 16;
const MAX_FOTO_MB = 10;
const DURACION_PANEL = 250;

// Pin propio: el icono por defecto de Leaflet no encuentra su imagen con el bundler.
const PIN = L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
             <path d="M16 1C7.7 1 1 7.6 1 15.9 1 27.3 16 41 16 41s15-13.7 15-25.1C31 7.6 24.3 1 16 1z"
                   fill="#8AB600" stroke="#ffffff" stroke-width="2"/>
             <circle cx="16" cy="16" r="5.5" fill="#ffffff"/>
           </svg>`,
    iconSize: [32, 42],
    iconAnchor: [16, 41],
});

const formatoCoord = (p) => `${p[0].toFixed(6)}, ${p[1].toFixed(6)}`;

// Las tres fotos que se piden. `clave` es el nombre del campo que recibe el backend.
const FOTOS = [
    { clave: "fotoEstablecimiento", titulo: "Establecimiento", ayuda: "Fachada o entrada", icono: "icon-[ph--storefront-fill]" },
    { clave: "fotoParqueadero", titulo: "Parqueadero", ayuda: "Donde se estacionan los autos", icono: "icon-[ph--car-fill]" },
    { clave: "fotoLugar", titulo: "Lugar del punto", ayuda: "Donde quieres el cargador", icono: "icon-[ph--charging-station-fill]" },
];

// El mapa nace mientras el panel todavía se desliza: sin avisarle su tamaño final,
// Leaflet pinta los mosaicos a medias.
const AjustarTamano = () => {
    const map = useMap();
    useEffect(() => {
        const t = setTimeout(() => map.invalidateSize(), DURACION_PANEL + 50);
        return () => clearTimeout(t);
    }, [map]);
    return null;
};

const MarcarConClic = ({ onMarcar }) => {
    useMapEvents({ click: (e) => onMarcar([e.latlng.lat, e.latlng.lng]) });
    return null;
};

// Solo se mueve la vista cuando la ubicación llega del GPS; al tocar el mapa, la
// persona ya está mirando ese lugar y no hace falta moverla.
const VolarA = ({ destino }) => {
    const map = useMap();
    useEffect(() => {
        if (destino) map.flyTo(destino, ZOOM_PUNTO, { duration: 0.8 });
    }, [destino, map]);
    return null;
};

/**
 * Un recuadro de foto: vacío invita a subirla (tocar o arrastrar); con foto muestra la
 * vista previa, su estado y botones para cambiarla o quitarla.
 */
const FotoRecuadro = ({ def, estado, onElegir, onQuitar }) => {
    const input = useRef(null);
    const [arrastrando, setArrastrando] = useState(false);
    const abrir = () => input.current && input.current.click();

    const alElegir = (e) => {
        const archivo = e.target.files && e.target.files[0];
        if (archivo) onElegir(archivo);
        e.target.value = "";   // permite volver a elegir el mismo archivo
    };
    const alSoltar = (e) => {
        e.preventDefault();
        setArrastrando(false);
        const archivo = e.dataTransfer.files && e.dataTransfer.files[0];
        if (archivo) onElegir(archivo);
    };

    return (
        <div className="flex flex-col gap-1">
            <input ref={input} type="file" accept="image/*" onChange={alElegir} className="sr-only" />

            {estado && estado.vistaPrevia ? (
                <div className="relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                    <img src={estado.vistaPrevia} alt={`Foto: ${def.titulo}`} className="h-full w-full object-cover" />
                    {estado.subiendo && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <Spinner className="h-6 w-6" />
                        </div>
                    )}
                    <div className="absolute top-1.5 right-1.5 flex gap-1">
                        <button
                            type="button"
                            onClick={abrir}
                            aria-label={`Cambiar foto de ${def.titulo}`}
                            className="h-7 w-7 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-700 hover:bg-white"
                        >
                            <span className="icon-[ph--arrows-clockwise-bold] h-3.5 w-3.5"></span>
                        </button>
                        <button
                            type="button"
                            onClick={onQuitar}
                            aria-label={`Quitar foto de ${def.titulo}`}
                            className="h-7 w-7 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-700 hover:bg-white"
                        >
                            <span className="icon-[ph--trash-bold] h-3.5 w-3.5"></span>
                        </button>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pt-4 pb-1.5 flex items-center gap-1 text-white text-xs font-semibold">
                        {estado.url && <span className="icon-[ph--check-circle-fill] h-4 w-4 text-[#B4DB40] flex-shrink-0"></span>}
                        {estado.error && <span className="icon-[ph--warning-circle-fill] h-4 w-4 text-red-400 flex-shrink-0"></span>}
                        <span className="truncate">{def.titulo}</span>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={abrir}
                    onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
                    onDragLeave={() => setArrastrando(false)}
                    onDrop={alSoltar}
                    className={`aspect-square sm:aspect-[4/3] w-full rounded-xl border-2 border-dashed px-2 flex flex-col items-center justify-center gap-1.5 text-center transition-colors
                                ${arrastrando ? "border-[#8AB600] bg-greenVE-100" : "border-greenVE-300 bg-greenVE-50 hover:bg-greenVE-100 hover:border-[#8AB600]"}`}
                >
                    <span className="h-10 w-10 rounded-full bg-[#8AB600] text-white flex items-center justify-center shadow">
                        <span className={`${def.icono} h-5 w-5`}></span>
                    </span>
                    <span className="text-xs font-semibold text-greenVE-800 leading-tight">{def.titulo}</span>
                    <span className="hidden sm:block text-[11px] text-gray-500 leading-tight">{def.ayuda}</span>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-greenVE-700">
                        <span className="icon-[ph--camera-plus-fill] h-3.5 w-3.5"></span>
                        Subir foto
                    </span>
                </button>
            )}
            {estado && estado.error && <p className="text-[11px] leading-tight text-red-600">{estado.error}</p>}
        </div>
    );
};

const Campo = ({ label, name, value, onChange, required, type = "text", placeholder }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none transition-all
                       focus:border-greenVE-400 focus:ring-1 focus:ring-greenVE-200"
        />
    </div>
);

const Seccion = ({ numero, titulo, ayuda, children, requerida, extra }) => (
    <section className="space-y-3">
        <div className="flex items-start gap-3">
            <span className="h-6 w-6 flex-shrink-0 rounded-full bg-[#8AB600] text-white text-xs font-bold flex items-center justify-center">
                {numero}
            </span>
            <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 flex-wrap">
                    {titulo}
                    {requerida && <span className="text-red-500">*</span>}
                    {extra}
                </h3>
                {ayuda && <p className="text-xs text-gray-500 mt-0.5">{ayuda}</p>}
            </div>
        </div>
        {children}
    </section>
);

const SolicitudPuntoCarga = ({ onCerrar }) => {
    const [visible, setVisible] = useState(false);
    const [datos, setDatos] = useState(VACIO);
    const [ubicacion, setUbicacion] = useState(null);       // [lat, lng]
    const [vuelo, setVuelo] = useState(null);               // destino del GPS
    const [buscandoGps, setBuscandoGps] = useState(false);
    const [errorUbicacion, setErrorUbicacion] = useState("");
    // Por clave de FOTOS: { vistaPrevia, url (cuando ya subió), subiendo, error }.
    const [fotos, setFotos] = useState({});
    const intentos = useRef({});                            // descarta subidas viejas al reemplazar
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");
    const [resultado, setResultado] = useState(null);      // "ok" | "error" | null

    // Entra deslizándose: se monta fuera de pantalla y en el siguiente cuadro se mueve.
    useEffect(() => {
        const id = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);

    const cerrar = () => {
        setVisible(false);
        setTimeout(onCerrar, DURACION_PANEL);
    };

    useEffect(() => {
        const alPresionar = (e) => e.key === "Escape" && cerrar();
        window.addEventListener("keydown", alPresionar);
        return () => window.removeEventListener("keydown", alPresionar);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // El aviso de validación se va en cuanto la persona corrige algo.
    const onChange = (e) => {
        setDatos((d) => ({ ...d, [e.target.name]: e.target.value }));
        setError("");
    };

    // ---------- Fotos ----------
    const cambiarFoto = (clave, cambios) =>
        setFotos((f) => ({ ...f, [clave]: { ...(f[clave] || {}), ...cambios } }));

    const subirFoto = async (clave, archivo) => {
        if (!archivo.type.startsWith("image/")) {
            setFotos((f) => ({ ...f, [clave]: { error: "Tiene que ser una imagen." } }));
            return;
        }
        if (archivo.size > MAX_FOTO_MB * 1024 * 1024) {
            setFotos((f) => ({ ...f, [clave]: { error: `Supera los ${MAX_FOTO_MB} MB.` } }));
            return;
        }
        const intento = (intentos.current[clave] || 0) + 1;
        intentos.current[clave] = intento;
        setFotos((f) => ({ ...f, [clave]: { vistaPrevia: URL.createObjectURL(archivo), subiendo: true } }));

        let cambios;
        try {
            const cuerpo = new FormData();
            cuerpo.append("foto", archivo);
            const resp = await fetch(Config.URL_FOTO_PUNTO_CARGA, { method: "POST", body: cuerpo });
            const data = await resp.json();
            cambios = data && data.estado && data.url
                ? { url: data.url, subiendo: false, error: "" }
                : { subiendo: false, error: (data && data.msj) || "No se pudo subir." };
        } catch {
            cambios = { subiendo: false, error: "Error de conexión al subir." };
        }
        // Si mientras subía la cambiaron por otra, esta respuesta ya no cuenta.
        if (intentos.current[clave] === intento) cambiarFoto(clave, cambios);
    };

    const quitarFoto = (clave) => {
        intentos.current[clave] = (intentos.current[clave] || 0) + 1;
        setFotos((f) => {
            const { [clave]: _, ...resto } = f;
            return resto;
        });
    };

    const subiendoFotos = Object.values(fotos).some((f) => f.subiendo);

    // ---------- Ubicación ----------
    const marcar = (punto) => {
        setUbicacion(punto);
        setErrorUbicacion("");
        setError("");
    };

    const usarMiUbicacion = () => {
        if (!navigator.geolocation) {
            setErrorUbicacion("Tu navegador no permite obtener la ubicación. Márcala tocando el mapa.");
            return;
        }
        setBuscandoGps(true);
        setErrorUbicacion("");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const punto = [pos.coords.latitude, pos.coords.longitude];
                marcar(punto);
                setVuelo(punto);
                setBuscandoGps(false);
            },
            () => {
                setErrorUbicacion("No pudimos obtener tu ubicación. Márcala tocando el mapa.");
                setBuscandoGps(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // ---------- Envío ----------
    const validar = () => {
        if (!ubicacion) return "Marca en el mapa dónde quieres el punto de carga.";
        if (!datos.ci.trim()) return "Ingresa tu CI.";
        if (!datos.nombres.trim()) return "Ingresa tus nombres y apellidos.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email.trim())) return "Ingresa un email válido.";
        if (!datos.mensaje.trim()) return "Cuéntanos sobre tu punto de carga.";
        return "";
    };

    const enviar = async () => {
        if (enviando || subiendoFotos) return;
        const err = validar();
        if (err) {
            setError(err);
            return;
        }
        setError("");
        setEnviando(true);
        const ok = await enviarContacto(
            {
                ...datos,
                ...Object.fromEntries(FOTOS.map(({ clave }) => [clave, (fotos[clave] && fotos[clave].url) || ""])),
                latitud: ubicacion[0].toFixed(6),
                longitud: ubicacion[1].toFixed(6),
            },
            "puntoCarga"
        );
        setEnviando(false);
        setResultado(ok ? "ok" : "error");
    };

    const reiniciar = () => {
        setDatos(VACIO);
        setUbicacion(null);
        setVuelo(null);
        setFotos({});
        setError("");
        setResultado(null);
    };

    // Va en un portal sobre <body>: el contenedor del mapa lleva `isolate` y, renderizado
    // dentro, el panel quedaría por debajo de la cabecera y del botón de WhatsApp.
    return createPortal(
        <div className="fixed inset-0 z-[1100] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="titulo-punto-carga">
            <div
                onClick={cerrar}
                className={`absolute inset-0 bg-black/40 transition-opacity duration-[250ms] ${visible ? "opacity-100" : "opacity-0"}`}
            />

            <aside
                className={`relative h-full w-full sm:max-w-xl lg:max-w-2xl bg-white shadow-2xl flex flex-col
                            transition-transform duration-[250ms] ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Encabezado */}
                <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div>
                        <h2 id="titulo-punto-carga" className="text-lg font-bold text-greenVE-800">
                            Solicita tu punto de carga
                        </h2>
                        <p className="text-sm text-gray-500">
                            Cuéntanos dónde está y cómo es; nos comunicamos contigo para sumarlo al mapa.
                        </p>
                    </div>
                    <button
                        onClick={cerrar}
                        aria-label="Cerrar"
                        className="h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                    >
                        <span className="icon-[ph--x-bold] h-4 w-4"></span>
                    </button>
                </header>

                {resultado === "ok" ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-6">
                        <span className="icon-[ph--check-circle-fill] h-16 w-16 text-[#8AB600]"></span>
                        <h3 className="font-bold text-lg text-gray-800">¡Solicitud enviada!</h3>
                        <p className="text-sm text-gray-500 max-w-sm">
                            Gracias. Revisaremos tu punto de carga y nos comunicamos contigo.
                        </p>
                        <div className="flex gap-3 mt-2">
                            <button onClick={reiniciar} className="text-sm font-medium text-greenVE-700 hover:text-greenVE-800">
                                Enviar otro punto
                            </button>
                            <button onClick={cerrar} className="text-sm font-medium text-gray-500 hover:text-gray-700">
                                Cerrar
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
                            {/* 1. Fotos */}
                            <Seccion
                                numero={1}
                                titulo="Fotos del lugar"
                                ayuda="Toca cada recuadro para tomar la foto o elegirla de tu galería; en computadora también puedes arrastrarla. JPG, PNG o WEBP, hasta 10 MB."
                                extra={
                                    <span className="px-2 py-0.5 rounded-full bg-greenVE-100 text-greenVE-800 text-[11px] font-semibold">
                                        Recomendadas
                                    </span>
                                }
                            >
                                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                    {FOTOS.map((def) => (
                                        <FotoRecuadro
                                            key={def.clave}
                                            def={def}
                                            estado={fotos[def.clave]}
                                            onElegir={(archivo) => subirFoto(def.clave, archivo)}
                                            onQuitar={() => quitarFoto(def.clave)}
                                        />
                                    ))}
                                </div>
                            </Seccion>

                            {/* 2. Ubicación */}
                            <Seccion
                                numero={2}
                                titulo="Ubicación del punto"
                                requerida
                                ayuda="Marca dónde quieres el punto de carga. Puedes arrastrar el pin para afinarlo."
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={usarMiUbicacion}
                                        disabled={buscandoGps}
                                        className="inline-flex items-center justify-center gap-2 bg-[#8AB600] hover:bg-greenVE-600 disabled:opacity-70
                                                   text-white font-semibold text-sm rounded-xl px-4 py-2.5 shadow-md transition-colors"
                                    >
                                        {buscandoGps
                                            ? <Spinner color="white" className="h-4 w-4" />
                                            : <span className="icon-[ph--gps-fix-fill] h-5 w-5"></span>}
                                        {buscandoGps ? "Buscando tu ubicación..." : "Usar mi ubicación actual"}
                                    </button>
                                    <span className="text-xs text-gray-500 text-center sm:text-left">o toca el mapa para marcar el punto</span>
                                </div>
                                <div className="relative rounded-2xl overflow-hidden border border-gray-200 isolate">
                                    <MapContainer
                                        center={CENTRO_ECUADOR}
                                        zoom={ZOOM_PAIS}
                                        scrollWheelZoom
                                        className="h-80 sm:h-96 w-full cursor-crosshair"
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <AjustarTamano />
                                        <MarcarConClic onMarcar={marcar} />
                                        <VolarA destino={vuelo} />
                                        {ubicacion && (
                                            <Marker
                                                position={ubicacion}
                                                icon={PIN}
                                                draggable
                                                eventHandlers={{
                                                    dragend: (e) => {
                                                        const ll = e.target.getLatLng();
                                                        marcar([ll.lat, ll.lng]);
                                                    },
                                                }}
                                            />
                                        )}
                                    </MapContainer>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className={`icon-[ph--map-pin-fill] h-4 w-4 ${ubicacion ? "text-[#8AB600]" : "text-gray-300"}`}></span>
                                    {ubicacion ? (
                                        <span className="text-gray-700 font-mono">{formatoCoord(ubicacion)}</span>
                                    ) : (
                                        <span className="text-gray-400">Todavía no marcas el punto en el mapa.</span>
                                    )}
                                </div>
                                {errorUbicacion && <p className="text-xs text-red-600">{errorUbicacion}</p>}
                            </Seccion>

                            {/* 3. Detalles */}
                            <Seccion numero={3} titulo="Cuéntanos de tu punto" requerida>
                                <textarea
                                    name="mensaje"
                                    value={datos.mensaje}
                                    onChange={onChange}
                                    rows={4}
                                    placeholder="Tipo de conector, potencia, horario de atención, si es público o privado..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none transition-all
                                               focus:border-greenVE-400 focus:ring-1 focus:ring-greenVE-200 resize-y"
                                />
                            </Seccion>

                            {/* 4. Contacto */}
                            <Seccion numero={4} titulo="Tus datos de contacto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Campo label="CI" name="ci" value={datos.ci} onChange={onChange} required placeholder="Cédula" />
                                    <Campo label="Nombres / Apellidos" name="nombres" value={datos.nombres} onChange={onChange} required placeholder="Tus nombres" />
                                    <Campo label="Email" name="email" value={datos.email} onChange={onChange} required type="email" placeholder="correo@ejemplo.com" />
                                    <Campo label="Teléfonos" name="telefonos" value={datos.telefonos} onChange={onChange} placeholder="Teléfono de contacto" />
                                    <Campo label="Dirección" name="direccion" value={datos.direccion} onChange={onChange} placeholder="Tu dirección" />
                                    <Campo label="Ciudad" name="ciudad" value={datos.ciudad} onChange={onChange} placeholder="Ciudad" />
                                    <Campo label="País" name="pais" value={datos.pais} onChange={onChange} placeholder="País" />
                                </div>
                            </Seccion>
                        </div>

                        {/* Pie fijo: los botones siempre a la vista */}
                        <footer className="border-t border-gray-100 px-5 py-3 space-y-2 bg-white">
                            {error && (
                                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
                            )}
                            {resultado === "error" && (
                                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                    No se pudo enviar la solicitud. Intenta nuevamente.
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={enviar}
                                    disabled={enviando || subiendoFotos}
                                    className="flex-1 flex items-center justify-center gap-2 bg-[#8AB600] hover:bg-greenVE-600 disabled:opacity-60
                                               text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm text-sm"
                                >
                                    {enviando ? (
                                        <><Spinner color="white" className="h-4 w-4" /> Enviando...</>
                                    ) : subiendoFotos ? (
                                        <><Spinner color="white" className="h-4 w-4" /> Subiendo fotos...</>
                                    ) : (
                                        <><span className="icon-[mdi--send] h-4 w-4"></span> Enviar punto de carga</>
                                    )}
                                </button>
                                <button
                                    onClick={cerrar}
                                    disabled={enviando}
                                    className="py-2.5 px-5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </footer>
                    </>
                )}
            </aside>
        </div>,
        document.body
    );
};

export default SolicitudPuntoCarga;
