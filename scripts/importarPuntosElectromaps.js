/**
 * Toma de Electromaps los puntos de carga de las marcas elegidas y los convierte al formato
 * del mapa de Puntos de Carga.
 *
 *   node scripts/importarPuntosElectromaps.js [ruta-del-json]
 *
 * Entrada: backend-php/electromaps.txt, la lista de ubicaciones de Electromaps
 *          (id, nombre, latitud y longitud; nada más).
 * Salida:  src/components/puntos_carga/puntosCargaElectromaps.js (se sobrescribe).
 *
 * No se importa todo Electromaps: solo las marcas de MARCAS, cada una con su logo en el mapa.
 * Para sumar otra marca basta con agregarla ahí (y su logo en PuntosCargaMap.jsx).
 *
 * Electromaps no trae ciudad, conectores, potencia ni tarifa en este listado: la ciudad se
 * toma del punto conocido más cercano y el resto queda vacío.
 *
 * Se corre DESPUÉS de importarPuntosKia.js e importarPuntosChevrolet.js, porque descarta los
 * que ya están en esos listados.
 */
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const ENTRADA = process.argv[2] || path.join(RAIZ, "backend-php", "electromaps.txt");
const CARPETA = path.join(RAIZ, "src", "components", "puntos_carga");
const SALIDA = path.join(CARPETA, "puntosCargaElectromaps.js");

// Marca -> cómo reconocerla en el nombre. El nombre de la marca es el `convenio` del punto.
const MARCAS = [
    { convenio: "Mavesa", busca: /mavesa/i },
    { convenio: "Automekano", busca: /automekano/i },
];

// Nombres puestos a mano: Electromaps repite "Automekano" en varias ciudades y tiene dos
// "Mavesa Manta" a 9 km uno del otro.
const NOMBRE_A_MANO = {
    858956: "Mavesa Manta - Barbasquillo",
    858953: "Mavesa Manta - Vía a Montecristi",
    454253: "Automekano Ambato",
    453686: "Automekano Quito Sur",
    451706: "Automekano Quito Norte",
    451256: "Automekano Guayaquil",
};

// Ya está en otro listado si hay un punto a menos de esto.
const MISMO_LUGAR_M = 40;

const limpiar = (t) => String(t || "").replace(/\s+/g, " ").trim();

const metros = (a, b) => {
    const rad = (x) => (x * Math.PI) / 180;
    const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
        Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
    return 2 * 6371000 * Math.asin(Math.sqrt(h));
};

// Los listados existentes son módulos ES con `export const X = [...]`.
const leerListado = (archivo) => {
    const texto = fs.readFileSync(path.join(CARPETA, archivo), "utf8");
    const inicio = texto.indexOf("[", texto.indexOf("export const"));
    // eslint-disable-next-line no-new-func
    return new Function(`return ${texto.slice(inicio).replace(/;\s*$/, "")}`)();
};

const conocidos = ["puntosCargaData.js", "puntosCargaKia.js", "puntosCargaChevrolet.js"]
    .flatMap(leerListado)
    .map((p) => ({ ...p, lat: p.coords[0], lng: p.coords[1] }));

const masCercano = (p) =>
    conocidos.reduce((m, c) => (metros(p, c) < metros(p, m) ? c : m), conocidos[0]);

const todos = JSON.parse(fs.readFileSync(ENTRADA, "utf8"));
const yaEstaban = [];
const puntos = [];

todos.forEach((e) => {
    const marca = MARCAS.find((m) => m.busca.test(e.name || ""));
    if (!marca) return;
    const p = { lat: e.latitude, lng: e.longitude };
    const cercano = masCercano(p);
    if (metros(p, cercano) < MISMO_LUGAR_M) return yaEstaban.push(limpiar(e.name));

    puntos.push({
        id: `em-${e.id}`,
        categoria: "puntos",
        nombre: NOMBRE_A_MANO[e.id] || limpiar(e.name),
        // Todos los puntos de estas marcas están en ciudades que ya tienen puntos cerca.
        ciudad: cercano.ciudad || "",
        provincia: cercano.provincia || "",
        convenio: marca.convenio,
        tipoCarga: "",
        conector: "",
        conectores: [],
        tarifado: "",
        app: "",
        direccion: "",
        coords: [Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6))],
    });
});

puntos.sort((a, b) => a.convenio.localeCompare(b.convenio) || a.ciudad.localeCompare(b.ciudad) || a.nombre.localeCompare(b.nombre));

const porMarca = MARCAS.map((m) => `${m.convenio} ${puntos.filter((p) => p.convenio === m.convenio).length}`).join(", ");
const cabecera = `/**
 * Puntos de carga de marcas tomados de Electromaps (${MARCAS.map((m) => m.convenio).join(", ")}).
 *
 * ARCHIVO GENERADO por scripts/importarPuntosElectromaps.js a partir de ${path.relative(RAIZ, ENTRADA)}:
 * no editar a mano. Volver a correr el script (después de los de Kia y Chevrolet) cuando cambie.
 *
 * ${puntos.length} puntos (${porMarca}).
 * Ya estaban en otro listado (${yaEstaban.length}): ${yaEstaban.join(", ") || "ninguno"}.
 * Electromaps no publica en este listado ciudad, conectores, potencia ni tarifa: la ciudad
 * es la del punto conocido más cercano.
 */
export const PUNTOS_ELECTROMAPS = ${JSON.stringify(puntos, null, 4)};
`;

fs.writeFileSync(SALIDA, cabecera);
console.log(`${puntos.length} puntos (${porMarca}) escritos en ${path.relative(RAIZ, SALIDA)}`);
console.log(`ya estaban: ${yaEstaban.length}`);
puntos.forEach((p) => console.log(`  ${p.convenio} | ${p.nombre} | ${p.ciudad}, ${p.provincia}`));
