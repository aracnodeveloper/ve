/**
 * Convierte el listado de puntos de carga de Chevrolet al formato del mapa de Puntos de Carga.
 *
 *   node scripts/importarPuntosChevrolet.js [ruta-del-json]
 *
 * Entrada: backend-php/chevrolet_puntos.txt, la respuesta de la API de PlugShare que usa el
 *          mapa de Chevrolet (lista de ubicaciones con estaciones y conectores).
 * Salida:  src/components/puntos_carga/puntosCargaChevrolet.js (se sobrescribe).
 *
 * PlugShare reúne cargadores de todas las redes, así que muchos de estos puntos ya están en
 * nuestro listado o en el de Kia: se descartan para no duplicar marcadores. Por eso este
 * script se corre DESPUÉS de importarPuntosKia.js.
 *
 * Qué se toma: nombre, dirección, coordenadas, tipo de cada conector y si es carga rápida
 * (salida DC). PlugShare no trae potencia ni tarifa, ni ciudad: la ciudad se saca de la
 * dirección o, si no aparece, del punto conocido más cercano.
 */
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const ENTRADA = process.argv[2] || path.join(RAIZ, "backend-php", "chevrolet_puntos.txt");
const CARPETA = path.join(RAIZ, "src", "components", "puntos_carga");
const SALIDA = path.join(CARPETA, "puntosCargaChevrolet.js");

// Códigos de conector de PlugShare -> nombre que usa el mapa (mismos que el filtro "Conector").
const CONECTORES = {
    1: "TOMACORRIENTE",
    2: "TIPO 1",       // J-1772
    3: "TIPO CHADEMO",
    7: "TIPO 2",
    13: "CCS1",
    16: "GB/T",
    17: "GB/T",        // GB/T rápido (DC)
    20: "CCS2",
};

// Revisados a mano (ids de PlugShare); la regla automática no alcanza en estos casos.
const SON_DUPLICADOS = new Set([
    1676098, // Bambolí Shopping = "Bomboli Shopping" (Condor), 100 m y nombre mal escrito
    1326448, // BYD MACHALA = "BYD Machala"
    593548,  // Kia point of charge at Megamaxi = "C.C. San Luis Shopping" de Kia
    2162852, // "Ambato", a 70 m del Mall de los Andes (que ya está)
    1676228, // Hosteria Balcón de Alcalá = la nuestra (Plug & Drive), 300 m
    1509359, // Cargadores Kia Puma = Gasolinera Puma - Via a Papallacta de Kia, 254 m
    730577,  // Megamaxi 6 de diciembre = el nuestro de Condor (antes con la ubicación corrida 1 km)
]);
const NO_SON_DUPLICADOS = new Set([
    1529795, // Concesionario Chevrolet El Recreo: está cerca del C.C. El Recreo, pero es otro lugar
    1860749, // Supermercado La Tienda (Casa Blanca): no es el Club Casablanca de Kia
]);

// Ciudad puesta a mano cuando la dirección no la trae de forma reconocible.
const CIUDAD_A_MANO = {
    2103088: { ciudad: "Papallacta", provincia: "Napo" }, // Pana Llacta Restobar: "triangulo de papallacta"
};

// Duplicado automático: muy cerca, o cerca y con alguna palabra distintiva del nombre en común.
const MUY_CERCA_M = 30;
const CERCA_M = 200;
const GENERICAS = new Set(
    ("de del la las los el y en at of the point charge punto carga cc centro comercial mall " +
     "parqueadero parqueaderos estacionamiento plaza shopping center kia chevrolet byd matriz " +
     "quito guayaquil cuenca manta machala ambato riobamba ibarra loja salinas cumbaya tumbaco " +
     "samborondon daule portoviejo orellana aurora sur norte").split(" ")
);

const limpiar = (t) => String(t || "").replace(/\s+/g, " ").trim();

// El recuadro de coordenadas de Ecuador también toma pedazos de Colombia y Perú, así que se
// mira además la dirección y la costa al sur de Huaquillas (ahí ya es Tumbes, Perú).
const enEcuador = (p) =>
    p.lat >= -5.1 && p.lat <= 1.6 && p.lng >= -92.1 && p.lng <= -75.1 &&
    !/colombia|per[uú]\b/i.test(p.address || "") &&
    !(p.lat < -3.4 && p.lng < -80.3);

const titulo = (t) => limpiar(t).toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase());
const normalizar = (t) => limpiar(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const palabras = (t) =>
    new Set(normalizar(t).replace(/'/g, "").match(/[a-z0-9]+/g)?.filter((p) => p.length >= 4 && !GENERICAS.has(p)) || []);

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

const conocidos = [...leerListado("puntosCargaData.js"), ...leerListado("puntosCargaKia.js")]
    .map((p) => ({ ...p, lat: p.coords[0], lng: p.coords[1] }));

// Ciudades conocidas, de la más larga a la más corta ("Santo Domingo" antes que "Santo").
const provinciaDe = {};
conocidos.forEach((p) => p.ciudad && !provinciaDe[p.ciudad] && (provinciaDe[p.ciudad] = p.provincia));
const ciudades = Object.keys(provinciaDe).sort((a, b) => b.length - a.length);

const ubicar = (p) => {
    if (CIUDAD_A_MANO[p.id]) return CIUDAD_A_MANO[p.id];
    const dir = ` ${normalizar(p.address)} `;
    const enDireccion = ciudades.find((c) => dir.includes(` ${normalizar(c)} `) || dir.includes(` ${normalizar(c)},`));
    if (enDireccion) return { ciudad: enDireccion, provincia: provinciaDe[enDireccion] || "" };

    // "76V3+3P, Ayampe, Ecuador" o "..., Guaranda 020101, Ecuador": el pueblo antes del país.
    // También una dirección que es solo el nombre del lugar ("Guaranda"). La provincia no se
    // adivina: queda vacía.
    const partes = limpiar(p.address).split(",").map((x) => x.trim()).filter(Boolean);
    const iPais = partes.findIndex((x) => /^ecuador$/i.test(x));
    const candidato = iPais > 0 ? partes[iPais - 1].replace(/\s*\d+$/, "") : partes.length === 1 ? partes[0] : "";
    if (/^[a-záéíóúñü .]+$/i.test(candidato) && candidato.split(" ").length <= 3)
        return { ciudad: titulo(candidato), provincia: "" };

    const cercano = conocidos.reduce((m, c) => (metros(p, c) < metros(p, m) ? c : m), conocidos[0]);
    return metros(p, cercano) < 20000
        ? { ciudad: cercano.ciudad || "", provincia: cercano.provincia || "" }
        : { ciudad: "", provincia: "" };
};

const datos = JSON.parse(fs.readFileSync(ENTRADA, "utf8"));
const todos = Array.isArray(datos) ? datos : datos.items || [];

const motivos = { fueraEcuador: [], proximamente: [], enReparacion: [], duplicados: [], repetidosEntreSi: [] };
const nuevos = [];

todos.forEach((p) => {
    const punto = { ...p, lat: p.latitude, lng: p.longitude };
    const nombre = limpiar(p.name);
    if (!enEcuador(punto)) return motivos.fueraEcuador.push(nombre);
    if (p.coming_soon) return motivos.proximamente.push(nombre);
    if (p.under_repair) return motivos.enReparacion.push(nombre);

    let duplicado = SON_DUPLICADOS.has(p.id);
    if (!duplicado && !NO_SON_DUPLICADOS.has(p.id)) {
        const mio = palabras(nombre);
        duplicado = conocidos.some((c) => {
            const d = metros(punto, c);
            return d < MUY_CERCA_M || (d < CERCA_M && [...palabras(c.nombre)].some((w) => mio.has(w)));
        });
    }
    if (duplicado) return motivos.duplicados.push(nombre);

    // PlugShare a veces lista el mismo lugar dos veces.
    if (nuevos.some((n) => metros(punto, n) < MUY_CERCA_M)) return motivos.repetidosEntreSi.push(nombre);
    nuevos.push(punto);
});

const puntos = nuevos.map((p, i) => {
    // Un conector por tipo y velocidad, con la cantidad de salidas.
    const grupos = new Map();
    (p.stations || []).forEach((s) =>
        (s.outlets || []).forEach((o) => {
            const conector = CONECTORES[o.connector];
            if (!conector) return;
            const tipoCarga = o.is_dc ? "RAPIDA" : "ESTANDAR";
            const clave = `${conector}|${tipoCarga}`;
            const g = grupos.get(clave) || { conector, tipoCarga, potencia: "", cantidad: 0 };
            g.cantidad += 1;
            grupos.set(clave, g);
        })
    );
    const conectores = [...grupos.values()].sort((a, b) => (a.tipoCarga === b.tipoCarga ? 0 : a.tipoCarga === "RAPIDA" ? -1 : 1));
    const { ciudad, provincia } = ubicar(p);
    return {
        id: `chev-${i + 1}`,
        categoria: "puntos",
        nombre: limpiar(p.name).replace(/\s*\(coming soon\)\s*$/i, ""),
        ciudad,
        provincia,
        convenio: "Chevrolet",
        tipoCarga: p.is_fast_charger || conectores.some((c) => c.tipoCarga === "RAPIDA") ? "RAPIDA" : "ESTANDAR",
        conector: conectores.map((c) => (c.cantidad > 1 ? `${c.conector} x${c.cantidad}` : c.conector)).join(", "),
        conectores,
        tarifado: "",
        app: "",
        direccion: limpiar(p.address),
        coords: [Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6))],
    };
});

const resumen = (lista) => (lista.length ? lista.join(", ") : "ninguno");
const cabecera = `/**
 * Puntos de carga de Chevrolet (listado de PlugShare que usa el mapa de Chevrolet).
 *
 * ARCHIVO GENERADO por scripts/importarPuntosChevrolet.js a partir de ${path.relative(RAIZ, ENTRADA)}:
 * no editar a mano. Volver a correr el script (después del de Kia) cuando cambie el listado.
 *
 * ${todos.length} registros -> ${puntos.length} puntos nuevos.
 * Ya estaban en nuestro listado o en el de Kia (${motivos.duplicados.length}): ${resumen(motivos.duplicados)}.
 * Repetidos dentro del propio listado (${motivos.repetidosEntreSi.length}): ${resumen(motivos.repetidosEntreSi)}.
 * Próximamente (${motivos.proximamente.length}): ${resumen(motivos.proximamente)}.
 * En reparación (${motivos.enReparacion.length}): ${resumen(motivos.enReparacion)}.
 * Fuera de Ecuador (${motivos.fueraEcuador.length}): ${resumen(motivos.fueraEcuador)}.
 * PlugShare no publica potencia ni tarifa.
 */
export const PUNTOS_CHEVROLET = ${JSON.stringify(puntos, null, 4)};
`;

fs.writeFileSync(SALIDA, cabecera);
console.log(`${puntos.length} puntos nuevos de Chevrolet escritos en ${path.relative(RAIZ, SALIDA)}`);
Object.entries(motivos).forEach(([k, v]) => console.log(`${k}: ${v.length}`));
console.log(`sin ciudad: ${puntos.filter((p) => !p.ciudad).map((p) => p.nombre).join(", ") || "ninguno"}`);
