/**
 * Convierte el listado de electrolineras de Kia Ecuador al formato del mapa de Puntos de Carga.
 *
 *   node scripts/importarPuntosKia.js [ruta-del-json]
 *
 * Entrada: el JSON que devuelve la API de https://electrolinerakia.kiaecuador.com.ec/
 *          ({ total, items: [...] }), por defecto backend-php/kia_puntos.txt.
 * Salida:  src/components/puntos_carga/puntosCargaKia.js (se sobrescribe).
 *
 * Kia no publica conectores, potencia ni tarifa: solo nombre, dirección, horario y
 * coordenadas. Por eso los puntos van sin `conectores` y sin `tarifado`, y solo se marca
 * carga rápida cuando el propio nombre lo dice ("Carga Rápida" / "Ultrarrápida").
 */
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const ENTRADA = process.argv[2] || path.join(RAIZ, "backend-php", "kia_puntos.txt");
const SALIDA = path.join(RAIZ, "src", "components", "puntos_carga", "puntosCargaKia.js");

// Dos registros a menos de esta distancia son la misma estación (p. ej. el cargador
// normal y el ultrarrápido de un mismo centro comercial).
const MISMA_ESTACION_M = 30;

const limpiar = (t) => String(t || "").replace(/\s+/g, " ").trim();

const MINUSCULAS = new Set(["de", "del", "la", "las", "los", "y", "el"]);
const titulo = (t) =>
    limpiar(t)
        .toLowerCase()
        .split(" ")
        .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
        .join(" ");

const esRapida = (p) => /r[aá]pida/i.test(`${p.name} ${p.description}`);

const horario = (h) => {
    const v = limpiar(h);
    if (!v || v === "00:00 - 00:00") return "";
    return v === "00:00 a 23:59" ? "24 horas" : v;
};

const metros = (a, b) => {
    const rad = (x) => (x * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * 6371000 * Math.asin(Math.sqrt(h));
};

const datos = JSON.parse(fs.readFileSync(ENTRADA, "utf8"));
const items = datos.items || [];

// Fuera: sin coordenadas (Kia publica algunos recién creados con 0,0), inactivos o fuera de Ecuador.
const validos = [];
const descartados = [];
items.forEach((p) => {
    const lat = typeof p.latitude === "number" ? p.latitude : NaN;
    const lng = typeof p.longitude === "number" ? p.longitude : NaN;
    const enEcuador = lat >= -5.1 && lat <= 1.6 && lng >= -92.1 && lng <= -75.1;
    if (!enEcuador || p.status !== 1) {
        descartados.push(limpiar(p.name) || p.id);
        return;
    }
    validos.push({ ...p, lat, lng });
});

// Agrupa los registros de una misma estación.
const estaciones = [];
validos.forEach((p) => {
    const misma = estaciones.find((e) => metros(e.registros[0], p) < MISMA_ESTACION_M);
    if (misma) misma.registros.push(p);
    else estaciones.push({ registros: [p] });
});

const puntos = estaciones.map(({ registros }, i) => {
    // El nombre de la estación es el más corto (el del cargador sin "Carga Ultrarrápida").
    const base = [...registros].sort((a, b) => limpiar(a.name).length - limpiar(b.name).length)[0];
    const normal = horario(base.customerService);
    const feriados = horario(base.holidayCustomerService);
    return {
        id: `kia-${i + 1}`,
        categoria: "puntos",
        nombre: limpiar(base.name),
        ciudad: titulo(base.cityName),
        provincia: titulo(base.stateName),
        convenio: "Kia",
        tipoCarga: registros.some(esRapida) ? "RAPIDA" : "",
        conector: "",
        conectores: [],
        tarifado: "",
        app: "",
        direccion: limpiar(base.address),
        horario: normal,
        horarioFeriados: feriados && feriados !== normal ? feriados : "",
        coords: [Number(base.lat.toFixed(6)), Number(base.lng.toFixed(6))],
    };
});

const cabecera = `/**
 * Electrolineras de Kia Ecuador (https://electrolinerakia.kiaecuador.com.ec/).
 *
 * ARCHIVO GENERADO por scripts/importarPuntosKia.js a partir de ${path.relative(RAIZ, ENTRADA)}:
 * no editar a mano, volver a correr el script cuando Kia actualice su listado.
 *
 * ${items.length} registros de Kia -> ${puntos.length} estaciones (se agrupan los cargadores de un mismo lugar).
 * Descartados por coordenadas inválidas o inactivos: ${descartados.length ? descartados.join(", ") : "ninguno"}.
 * Kia no publica conectores, potencia ni tarifa; tipoCarga solo es "RAPIDA" cuando el nombre lo indica.
 */
export const PUNTOS_KIA = ${JSON.stringify(puntos, null, 4)};
`;

fs.writeFileSync(SALIDA, cabecera);
console.log(`${puntos.length} estaciones de Kia escritas en ${path.relative(RAIZ, SALIDA)}`);
console.log(`Rápidas: ${puntos.filter((p) => p.tipoCarga === "RAPIDA").length}`);
console.log(`Descartados: ${descartados.length ? descartados.join(", ") : "ninguno"}`);
