/**
 * Averigua la ciudad y la provincia de cada punto de Electromaps a partir de sus coordenadas,
 * con el servicio público de OpenStreetMap (Nominatim), y las guarda en un archivo para que
 * importarPuntosElectromaps.js no dependa de internet.
 *
 *   node scripts/geocodificarElectromaps.js
 *
 * Entrada: backend-php/electromaps.txt
 * Salida:  backend-php/electromaps_ciudades.json  { "<id>": { ciudad (cantón), parroquia, provincia, pais } }
 *
 * Solo consulta los ids que todavía no están en la salida, así que se puede cortar y volver
 * a correr. Nominatim pide como máximo una consulta por segundo: no bajar la espera.
 */
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const ENTRADA = path.join(RAIZ, "backend-php", "electromaps.txt");
const SALIDA = path.join(RAIZ, "backend-php", "electromaps_ciudades.json");
const ESPERA_MS = 1100;

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// "Santa Isabel (Chaguarurco)" -> "Santa Isabel"; "Distrito Metropolitano de Quito" -> "Quito".
const limpiarCiudad = (t) =>
    String(t || "")
        .replace(/\s*\(.*?\)\s*/g, " ")
        .replace(/^Distrito Metropolitano de\s+/i, "")
        .replace(/^Cant[oó]n\s+/i, "")
        .replace(/\s+/g, " ")
        .trim();

const provinciaLimpia = (t) => String(t || "").replace(/^Provincia (de|del)\s+/i, "").trim();

const main = async () => {
    const puntos = JSON.parse(fs.readFileSync(ENTRADA, "utf8"));
    const guardado = fs.existsSync(SALIDA) ? JSON.parse(fs.readFileSync(SALIDA, "utf8")) : {};
    const pendientes = puntos.filter((p) => !guardado[p.id]);
    console.log(`${pendientes.length} por consultar (${Object.keys(guardado).length} ya guardados)`);

    for (const [i, p] of pendientes.entries()) {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=es` +
            `&lat=${p.latitude}&lon=${p.longitude}`;
        try {
            const res = await fetch(url, { headers: { "User-Agent": "VisitaEcuador-puntos-carga/1.0" } });
            const d = await res.json();
            const a = d.address || {};
            // El mapa agrupa por cantón ("Quito", no "Cumbayá"): la parroquia queda aparte.
            guardado[p.id] = {
                ciudad: limpiarCiudad(a.county || a.city || a.town || a.municipality),
                parroquia: limpiarCiudad(a.city || a.town || a.village || a.municipality),
                provincia: provinciaLimpia(a.state),
                pais: a.country_code || "",
            };
        } catch (e) {
            console.log(`  ${p.id} falló: ${e.message} (se reintenta en la próxima corrida)`);
        }
        if ((i + 1) % 20 === 0) {
            fs.writeFileSync(SALIDA, JSON.stringify(guardado, null, 1));
            console.log(`  ${i + 1}/${pendientes.length}`);
        }
        await esperar(ESPERA_MS);
    }
    fs.writeFileSync(SALIDA, JSON.stringify(guardado, null, 1));
    console.log(`listo: ${Object.keys(guardado).length} guardados en ${path.relative(RAIZ, SALIDA)}`);
};

main();
