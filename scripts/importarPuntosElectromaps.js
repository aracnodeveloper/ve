/**
 * Toma de Electromaps los puntos de carga de Ecuador que todavía no están en el mapa y los
 * convierte al formato del mapa de Puntos de Carga.
 *
 *   node scripts/geocodificarElectromaps.js   (solo si cambió electromaps.txt)
 *   node scripts/importarPuntosElectromaps.js
 *
 * Entrada: backend-php/electromaps.txt (id, nombre, latitud y longitud; nada más) y
 *          backend-php/electromaps_ciudades.json (cantón y provincia de cada id, sacados de
 *          las coordenadas con OpenStreetMap por geocodificarElectromaps.js).
 * Salida:  src/components/puntos_carga/puntosCargaElectromaps.js (se sobrescribe).
 *
 * Los puntos de las marcas de MARCAS llevan esa marca como convenio (y su logo en el mapa);
 * el resto va sin convenio. Electromaps no trae en este listado conectores, potencia, tarifa
 * ni dirección: esos campos quedan vacíos.
 *
 * Se corre DESPUÉS de importarPuntosKia.js e importarPuntosChevrolet.js, porque descarta los
 * que ya están en esos listados o en el nuestro.
 */
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const ENTRADA = path.join(RAIZ, "backend-php", "electromaps.txt");
const CIUDADES = path.join(RAIZ, "backend-php", "electromaps_ciudades.json");
// Open Charge Map (respuesta de su API para Ecuador): completa conectores, potencia y costo.
const OPEN_CHARGE_MAP = path.join(RAIZ, "backend-php", "chargemaps.txt");
const CARPETA = path.join(RAIZ, "src", "components", "puntos_carga");
const SALIDA = path.join(CARPETA, "puntosCargaElectromaps.js");

// Marca -> cómo reconocerla en el nombre. El nombre de la marca es el `convenio` del punto.
const MARCAS = [
    { convenio: "Mavesa", busca: /mavesa/i },
    { convenio: "Automekano", busca: /automekano/i },
];

// Nombres puestos a mano: Electromaps repite "Automekano" en varias ciudades, tiene dos
// "Mavesa Manta" a 9 km uno del otro y algunos nombres sin sentido fuera de su app.
const NOMBRE_A_MANO = {
    858956: "Mavesa Manta - Barbasquillo",
    858953: "Mavesa Manta - Vía a Montecristi",
    454253: "Automekano Ambato",
    453686: "Automekano Quito Sur",
    451706: "Automekano Quito Norte",
    451256: "Automekano Guayaquil",
    134027: "Terminal Terrestre Binacional de Santa Rosa (EMOVTT)",
    884889: "CONECTZ Lago Agrio",
};

// Revisados a mano (ids de Electromaps); la regla automática no alcanza en estos casos.
const SON_DUPLICADOS = new Set([
    // El mismo lugar con otro nombre en nuestros listados.
    72418,  // Kia Motor = Kmotor Orellana (Kia), 196 m
    574280, // Concesionario Kia Ambato = Asiauto Atahualpa (Kia), 85 m
    239204, // Universidad Técnica de Ambato (Chevrolet), 289 m
    828697, // P&S La Union = P&S La Unión (Kia), 253 m
    463815, // MCDonald Av. de la Prensa = McDonald's La Prensa (Kia), 432 m
    810225, // Plug and Drive - Evinka CCI = CCI (Kia), 45 m
    // Muy cerca de uno nuestro con otro nombre: por confirmar, mientras tanto no se duplican.
    805198, // BYD - Evinka - PD, a 41 m del KFC de Santo Domingo
    661236, // Mall del Norte, a 61 m de PROMART (Guayaquil)
    583223, // MegaKywi - Tumbaco, a 35 m del Supermaxi La Cerámica
    867262, // Asiauto Riobamba = el de la lista oficial de Kia (Electromaps lo pone 1.4 km corrido)
    // Repetido dentro del propio Electromaps.
    737501, // terminal terrestre binacional de santa rosa = EMOVTT SR EP, 60 m
    558525, // "Mavesa Ecuador" = Mavesa Cuenca, 193 m
]);
// Edificio Metropolitan está a 173 m de Pilisimas Power Port - Edificio Tofino, pero es otro.
const NO_DUPLICADO_POR_NOMBRE = /^edificio metropolitan$/i;

// Cantón corregido a mano: OpenStreetMap devuelve la parroquia o nada.
const CIUDAD_A_MANO = {
    239237: { ciudad: "San Miguel", provincia: "Bolívar" }, // Estación los Arrayanes, parroquia Bilován
    849479: { ciudad: "Antonio Ante", provincia: "Imbabura" }, // Hotel Royal, Atuntaqui
};

// Mismo cantón con otro nombre en nuestros listados: se usa el nuestro para que el filtro de
// ciudad no lo muestre dos veces.
const CIUDAD_IGUAL_A = { "francisco de orellana": "Orellana" };

const MISMO_LUGAR_M = 40;
const CERCA_M = 250;
const GENERICAS = new Set(
    ("de del la las los el y en at of the point charge punto carga cc centro comercial mall " +
     "parqueadero parqueaderos estacionamiento plaza shopping center kia chevrolet byd matriz " +
     "quito guayaquil cuenca manta machala ambato riobamba ibarra loja salinas cumbaya tumbaco " +
     "samborondon daule portoviejo hotel electrolinera estacion station sur norte edificio").split(" ")
);

const limpiar = (t) => String(t || "").replace(/\s+/g, " ").trim();
const normalizar = (t) => limpiar(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const palabras = (t) =>
    new Set((normalizar(t).match(/[a-z0-9]+/g) || []).filter((p) => p.length >= 4 && !GENERICAS.has(p)));

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

// Nombre del cantón como ya lo usan nuestros listados ("Samborondón" -> "Samborondon").
const ciudadesConocidas = [...new Set(conocidos.map((c) => c.ciudad).filter(Boolean))];
const comoLaConocemos = (ciudad) =>
    CIUDAD_IGUAL_A[normalizar(ciudad)] ||
    ciudadesConocidas.find((c) => normalizar(c) === normalizar(ciudad)) ||
    ciudad;

const ciudades = JSON.parse(fs.readFileSync(CIUDADES, "utf8"));
const todos = JSON.parse(fs.readFileSync(ENTRADA, "utf8"));

const motivos = { fueraEcuador: [], yaEstaban: [], sinCiudad: [] };
const puntos = [];

todos.forEach((e) => {
    const nombre = limpiar(e.name);
    const geo = ciudades[e.id];
    if (!geo) return motivos.sinCiudad.push(nombre); // falta correr geocodificarElectromaps.js
    if (geo.pais !== "ec") return motivos.fueraEcuador.push(nombre);

    const p = { lat: e.latitude, lng: e.longitude };
    let duplicado = SON_DUPLICADOS.has(e.id);
    if (!duplicado && !NO_DUPLICADO_POR_NOMBRE.test(nombre)) {
        const mio = palabras(nombre);
        duplicado = conocidos.some((c) => {
            const d = metros(p, c);
            return d < MISMO_LUGAR_M || (d < CERCA_M && [...palabras(c.nombre)].some((w) => mio.has(w)));
        });
    }
    if (duplicado) return motivos.yaEstaban.push(nombre);

    const marca = MARCAS.find((m) => m.busca.test(nombre));
    const { ciudad, provincia } = CIUDAD_A_MANO[e.id] || geo;
    puntos.push({
        id: `em-${e.id}`,
        categoria: "puntos",
        nombre: NOMBRE_A_MANO[e.id] || nombre,
        ciudad: comoLaConocemos(ciudad || ""),
        provincia: provincia || "",
        convenio: marca ? marca.convenio : "",
        tipoCarga: "",
        conector: "",
        conectores: [],
        tarifado: "",
        app: "",
        direccion: "",
        coords: [Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6))],
    });
});

// ── Datos de Open Charge Map ──────────────────────────────────────────────────────────────
// Electromaps solo trae nombre y coordenadas; Open Charge Map tiene, para algunos de estos
// mismos lugares, conectores, potencia, costo y si es solo para clientes. Se toman de ahí.

// Códigos de conector de Open Charge Map -> nombre que usa el mapa. 0 = desconocido.
const OCM_CONECTOR = { 1: "TIPO 1", 2: "TIPO CHADEMO", 25: "TIPO 2", 1036: "TIPO 2", 28: "TOMACORRIENTE", 32: "CCS1", 33: "CCS2" };
// Mismo lugar, pero a más de MISMO_LUGAR_M (id Electromaps -> id Open Charge Map).
const OCM_DEL_PUNTO = {
    879679: 494931, // Dos Chorreras: las coordenadas difieren 657 m
    134027: 161698, // Terminal Terrestre Binacional de Santa Rosa: 178 m
};
// Conector desconocido que el propio Open Charge Map describe en el comentario.
const OCM_CONECTOR_A_MANO = { 311755: "TOMACORRIENTE" }; // Pululahua: "Conector 110V y Conector 220V"

const ocm = fs.existsSync(OPEN_CHARGE_MAP) ? JSON.parse(fs.readFileSync(OPEN_CHARGE_MAP, "utf8")) : [];
const sinCosto = (t) => /^\s*(0|0[.,]0+|free|gratis|sin costo)/i.test(String(t || ""));
const conCosto = (t) => /\d/.test(String(t || "")) && !sinCosto(t);
let completados = 0;

puntos.forEach((p) => {
    const idEm = Number(p.id.replace("em-", ""));
    const yo = { lat: p.coords[0], lng: p.coords[1] };
    const o = OCM_DEL_PUNTO[idEm]
        ? ocm.find((x) => x.ID === OCM_DEL_PUNTO[idEm])
        : ocm.find((x) => metros(yo, { lat: x.AddressInfo.Latitude, lng: x.AddressInfo.Longitude }) < MISMO_LUGAR_M);
    if (!o || o.StatusTypeID !== 50) return; // 50 = operativo

    const grupos = new Map();
    (o.Connections || []).forEach((c) => {
        const conector = OCM_CONECTOR[c.ConnectionTypeID] || OCM_CONECTOR_A_MANO[o.ID] || "";
        const rapida = c.CurrentTypeID === 30 || c.LevelID === 3 || [2, 32, 33].includes(c.ConnectionTypeID);
        const tipoCarga = rapida ? "RAPIDA" : "ESTANDAR";
        const potencia = c.PowerKW ? `${c.PowerKW} kW` : "";
        const clave = `${conector}|${tipoCarga}|${potencia}`;
        const g = grupos.get(clave) || { conector, tipoCarga, potencia, cantidad: 0 };
        g.cantidad += c.Quantity || 1;
        grupos.set(clave, g);
    });
    p.conectores = [...grupos.values()];
    p.tipoCarga = p.conectores.some((c) => c.tipoCarga === "RAPIDA") ? "RAPIDA" : p.conectores.length ? "ESTANDAR" : "";
    // Resumen por tipo: dos potencias del mismo conector cuentan juntas.
    const porTipo = new Map();
    p.conectores.filter((c) => c.conector).forEach((c) => porTipo.set(c.conector, (porTipo.get(c.conector) || 0) + c.cantidad));
    p.conector = [...porTipo].map(([c, n]) => (n > 1 ? `${c} x${n}` : c)).join(", ");
    p.tarifado = sinCosto(o.UsageCost) ? "NO" : conCosto(o.UsageCost) ? "SI" : "";
    // 6 = privado para clientes o huéspedes: se avisa en el detalle.
    if (o.UsageTypeID === 6) p.nota = "Solo para clientes o huéspedes";
    const a = o.AddressInfo;
    p.direccion = [a.AddressLine1, a.AddressLine2].filter(Boolean).map(limpiar).join(", ");
    p.fuenteDetalle = "Open Charge Map";
    completados += 1;
});

puntos.sort((a, b) => a.ciudad.localeCompare(b.ciudad) || a.nombre.localeCompare(b.nombre));

const porMarca = MARCAS.map((m) => `${m.convenio} ${puntos.filter((p) => p.convenio === m.convenio).length}`).join(", ");
const resumen = (lista) => (lista.length ? lista.join(", ") : "ninguno");
const cabecera = `/**
 * Puntos de carga de Electromaps que no estaban en nuestro listado ni en los de Kia y Chevrolet.
 *
 * ARCHIVO GENERADO por scripts/importarPuntosElectromaps.js a partir de ${path.relative(RAIZ, ENTRADA)}:
 * no editar a mano. Volver a correr el script (después de los de Kia y Chevrolet) cuando cambie.
 *
 * ${todos.length} registros -> ${puntos.length} puntos nuevos (${porMarca}; el resto sin convenio).
 * Ya estaban (${motivos.yaEstaban.length}): ${resumen(motivos.yaEstaban)}.
 * Fuera de Ecuador (${motivos.fueraEcuador.length}): ${resumen(motivos.fueraEcuador)}.
 * Conectores, potencia y costo de ${completados} de ellos: Open Charge Map (CC BY 4.0), de ${path.relative(RAIZ, OPEN_CHARGE_MAP)}.
 * Del resto, Electromaps no publica conectores, potencia, tarifa ni dirección. El cantón y
 * la provincia salen de las coordenadas (OpenStreetMap), ver geocodificarElectromaps.js.
 */
export const PUNTOS_ELECTROMAPS = ${JSON.stringify(puntos, null, 4)};
`;

fs.writeFileSync(SALIDA, cabecera);
console.log(`${puntos.length} puntos nuevos (${porMarca}) escritos en ${path.relative(RAIZ, SALIDA)}`);
Object.entries(motivos).forEach(([k, v]) => console.log(`${k}: ${v.length}`));
console.log(`completados con Open Charge Map: ${completados}`);
puntos.filter((p) => p.fuenteDetalle).forEach((p) => console.log(`  ${p.nombre}: ${p.conector || "?"} | ${p.conectores.map((c) => c.potencia).join("/")} | tarifado ${p.tarifado || "?"}${p.nota ? " | " + p.nota : ""}`));
