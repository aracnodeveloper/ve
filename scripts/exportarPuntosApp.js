/**
 * Copia los puntos de carga del mapa de la web a la app de VisitaEcuador (Flutter).
 *
 *   node scripts/exportarPuntosApp.js [ruta-del-archivo-dart]
 *
 * Entrada: los cuatro listados de src/components/puntos_carga (nuestro, Kia, Chevrolet y
 *          Electromaps), los mismos que junta PuntosCargaMap.jsx.
 * Salida:  ~/visita_ecuador_app/lib/global/puntos_carga.dart (se sobrescribe).
 *
 * La app lee `lat` y `lng` sueltos en vez de `coords`, y espera dobles: un 0 entero haría
 * fallar el `as double`, por eso las coordenadas se escriben siempre con decimales.
 * Correr cada vez que cambie algún listado de la web, para que los dos mapas muestren lo mismo.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const CARPETA = path.join(RAIZ, "src", "components", "puntos_carga");
const SALIDA = process.argv[2] || path.join(os.homedir(), "visita_ecuador_app", "lib", "global", "puntos_carga.dart");

const LISTADOS = [
    ["puntosCargaData.js", "nuestro listado"],
    ["puntosCargaKia.js", "electrolineras de Kia"],
    ["puntosCargaChevrolet.js", "PlugShare (mapa de Chevrolet)"],
    ["puntosCargaElectromaps.js", "Electromaps (+ Open Charge Map)"],
];

const leerListado = (archivo) => {
    const texto = fs.readFileSync(path.join(CARPETA, archivo), "utf8");
    const inicio = texto.indexOf("[", texto.indexOf("export const"));
    // eslint-disable-next-line no-new-func
    return new Function(`return ${texto.slice(inicio).replace(/;\s*$/, "")}`)();
};

// Cadena de Dart: `$` interpola, así que se escapa junto con las comillas y la barra.
const cadena = (t) => `"${String(t ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\$/g, "\\$").replace(/\n/g, "\\n")}"`;
const doble = (n) => (Number.isInteger(n) ? `${n}.0` : String(n));

const conector = (c) =>
    `{"conector": ${cadena(c.conector)}, "tipoCarga": ${cadena(c.tipoCarga)}, ` +
    `"potencia": ${cadena(c.potencia)}, "cantidad": ${Number(c.cantidad) || 1}}`;

const punto = (p) => {
    const campos = [
        ["id", cadena(p.id)],
        ["nombre", cadena(p.nombre)],
        ["ciudad", cadena(p.ciudad)],
        ["provincia", cadena(p.provincia)],
        ["convenio", cadena(p.convenio)],
        ["tipoCarga", cadena(p.tipoCarga)],
        ["conector", cadena(p.conector)],
        ["tarifado", cadena(p.tarifado)],
        ["app", cadena(p.app)],
        ["direccion", cadena(p.direccion)],
        ["horario", cadena(p.horario)],
        ["horarioFeriados", cadena(p.horarioFeriados)],
        ["nota", cadena(p.nota)],
        ["lat", doble(p.coords[0])],
        ["lng", doble(p.coords[1])],
        ["conectores", `[${(p.conectores || []).map(conector).join(", ")}]`],
    ];
    return `  {\n${campos.map(([k, v]) => `    "${k}": ${v},`).join("\n")}\n  },`;
};

const todos = [];
const resumen = LISTADOS.map(([archivo, nombre]) => {
    const lista = leerListado(archivo);
    todos.push(...lista);
    return `${lista.length} de ${nombre}`;
});

const ids = new Set();
todos.forEach((p) => {
    if (ids.has(p.id)) throw new Error(`id repetido: ${p.id}`);
    ids.add(p.id);
});

const dart = `/// Puntos de carga para vehículos eléctricos.
///
/// ARCHIVO GENERADO por ve/scripts/exportarPuntosApp.js a partir de los listados del mapa
/// de la web (ve/src/components/puntos_carga): no editar a mano. Los cambios se hacen en la
/// web y se vuelve a correr el script, para que los dos mapas muestren lo mismo.
///
/// ${todos.length} puntos: ${resumen.join(", ")}.
///
/// Muchos puntos externos traen pocos datos: \`convenio\`, \`tipoCarga\`, \`tarifado\`,
/// \`direccion\`, \`horario\` y \`nota\` pueden venir vacíos, y \`conectores\` sin elementos.
library;

const List<Map<String, dynamic>> puntosDeCarga = [
${todos.map(punto).join("\n")}
];
`;

fs.writeFileSync(SALIDA, dart);
console.log(`${todos.length} puntos escritos en ${SALIDA}`);
console.log(resumen.join(" · "));
