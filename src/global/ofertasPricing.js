/**
 * Precios de ofertas de hotel para estancias que cruzan entre semana y fin de
 * semana.
 *
 * Un hotel puede tener la MISMA habitacion+acomodacion como dos ofertas: una
 * "Entre semana (Lun-Jue)" y otra "Fin de semana (Vie-Dom)", con precios
 * distintos. Cuando la estancia cubre ambos tipos de noche, se emparejan las
 * ofertas por titulo + acomodacion y se cobra cada noche a su tarifa.
 *
 * Una noche se clasifica por el dia de check-in:
 *   Lun/Mar/Mie/Jue -> entre semana ; Vie/Sab/Dom -> fin de semana.
 *
 * El precio por noche se deriva dividiendo el precio de la oferta (que viene
 * calculado para toda la estancia a una sola tarifa) entre el numero de noches.
 */

const num = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
};
const r2 = (v) => Math.round(v * 100) / 100;

const normalizar = (t) =>
    (t || "")
        .toLowerCase()
        .replace(/[áàä]/g, "a")
        .replace(/[éè]/g, "e")
        .replace(/[íì]/g, "i")
        .replace(/[óò]/g, "o")
        .replace(/[úù]/g, "u")
        .trim();

/** Convierte a Date conservando la HORA ("YYYY-MM-DD HH:MM:SS" o Date). */
const aInstante = (v) => {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
    const s = String(v).replace("T", " ").trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (m) {
        return new Date(
            Number(m[1]), Number(m[2]) - 1, Number(m[3]),
            Number(m[4] || 0), Number(m[5] || 0), Number(m[6] || 0)
        );
    }
    const dt = new Date(v);
    return isNaN(dt.getTime()) ? null : dt;
};

/** Normaliza un valor (Date o string "YYYY-MM-DD...") a medianoche local (solo dia). */
const aDia = (v) => {
    if (!v) return null;
    if (v instanceof Date) {
        return isNaN(v.getTime()) ? null : new Date(v.getFullYear(), v.getMonth(), v.getDate());
    }
    const s = String(v).replace("T", " ").trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const dt = new Date(v);
    return isNaN(dt.getTime()) ? null : new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
};

/**
 * RANGO de agotamiento: FechaHoraAgotado = INICIO, FechaHoraAgotadoFin = FIN.
 *
 * Se evalua en este orden:
 *  1. Si el rango YA TERMINO (fin < ahora, con hora exacta), la oferta vuelve a
 *     estar disponible de inmediato. Esto permite ventanas cortas el mismo dia
 *     (p.ej. 09:51 a 09:53) sin bloquear el resto de la jornada.
 *  2. Si el rango esta vigente AHORA, la oferta esta agotada.
 *  3. Si el rango es a futuro, se agota solo cuando el DIA de check-in elegido
 *     cae dentro del rango (p.ej. agotar solo el jueves no afecta a quien
 *     reserva para el lunes).
 * Un extremo vacio deja ese lado abierto; sin ninguna fecha, esta disponible.
 */
export const esOfertaAgotada = (oferta, fechaCheckIn) => {
    if (!oferta) return false;
    const ini = aInstante(oferta.FechaHoraAgotado);
    const fin = aInstante(oferta.FechaHoraAgotadoFin);
    if (!ini && !fin) return false;

    const ahora = new Date();

    // 1. El agotamiento ya expiro -> disponible
    if (fin && ahora > fin) return false;

    // 2. Agotamiento vigente en este momento
    if ((!ini || ahora >= ini) && (!fin || ahora <= fin)) return true;

    // 3. Agotamiento programado a futuro: depende del dia de check-in
    const diaCheckIn = aDia(fechaCheckIn);
    if (!diaCheckIn) return false;
    const diaIni = ini ? aDia(ini) : null;
    const diaFin = fin ? aDia(fin) : null;
    if (diaIni && diaCheckIn < diaIni) return false;
    if (diaFin && diaCheckIn > diaFin) return false;
    return true;
};

/**
 * Texto del cartel de una oferta agotada. Incluye la hora solo cuando aporta
 * (ventanas dentro del mismo dia); si el fin es a medianoche muestra solo la fecha.
 */
export const textoAgotada = (oferta) => {
    const fin = aInstante(oferta && oferta.FechaHoraAgotadoFin);
    if (!fin) return "No disponible para estas fechas";
    const pad = (n) => String(n).padStart(2, "0");
    const fecha = `${fin.getFullYear()}-${pad(fin.getMonth() + 1)}-${pad(fin.getDate())}`;
    const conHora = fin.getHours() !== 0 || fin.getMinutes() !== 0;
    const cuando = conHora ? `${fecha} ${pad(fin.getHours())}:${pad(fin.getMinutes())}` : fecha;
    return `No disponible para estas fechas, revisa disponibilidad en fechas posteriores`;
};

/** "semana" (entre semana) | "finde" (fin de semana) | null (sin restriccion). */
export const tipoAplica = (aplicaEn) => {
    const t = normalizar(aplicaEn);
    if (t.includes("entre semana") || t.includes("lunes a jueves")) return "semana";
    if (t.includes("fin de semana") || t.includes("viernes a domingo")) return "finde";
    return null;
};

/**
 * Cuenta noches de la estancia por tipo, segun el dia de check-in de cada noche.
 * Devuelve { semana, finde, total }.
 */
export const contarNoches = (fechas) => {
    const f = fechas && fechas[0];
    if (!f || !f.startDate || !f.endDate) return { semana: 0, finde: 0, total: 0 };

    const start = new Date(f.startDate);
    const end = new Date(f.endDate);
    let semana = 0;
    let finde = 0;

    const cur = new Date(start);
    // Cada noche va del dia actual al siguiente; la ultima noche es la previa al checkout.
    while (cur < end) {
        const d = cur.getDay(); // 0=Dom .. 6=Sab
        if (d >= 1 && d <= 4) semana++;
        else finde++;
        cur.setDate(cur.getDate() + 1);
    }
    return { semana, finde, total: semana + finde };
};

/**
 * Copia de una oferta escalada a `nochesParte` de las `nochesTotal` de la
 * estancia. Reparte precio, impuestos y rack de forma proporcional.
 */
const escalarOferta = (oferta, nochesParte, nochesTotal, aplicaEnTexto) => {
    const factor = nochesTotal > 0 ? nochesParte / nochesTotal : 0;
    const sin = r2(num(oferta.FinalSinImpuestos) * factor);
    const imp = r2(num(oferta.Impuestos) * factor);
    return {
        ...oferta,
        FinalSinImpuestos: sin,
        Impuestos: imp,
        Final: r2(sin + imp),
        Rack: r2(num(oferta.Rack) * factor),
        Noches: nochesParte,
        AplicaEn: aplicaEnTexto || oferta.AplicaEn,
        _porcionDe: oferta.Id, // referencia a la oferta original
    };
};

const etiquetaNoches = (tipo, n) =>
    (tipo === "semana" ? "Entre semana" : "Fin de semana") +
    ` (${n} noche${n !== 1 ? "s" : ""})`;

/**
 * Recibe las ofertas ya filtradas y el desglose de noches, y devuelve la lista
 * a mostrar. Si la estancia cubre ambos tipos y existe la pareja (mismo titulo
 * + acomodacion), fusiona las dos ofertas en una sola con precio mezclado y
 * guarda las dos porciones en `_partes` (para armar la reserva de dos lineas).
 *
 * Si la estancia es de un solo tipo, o no hay pareja, devuelve las ofertas tal
 * cual (sin cambios).
 *
 * esAgotada: funcion opcional para no fusionar si alguna parte esta agotada.
 */
export const construirOfertasMostradas = (ofertas, split, esAgotada) => {
    const { semana, finde, total } = split || {};
    const mixto = semana > 0 && finde > 0 && total > 0;
    if (!mixto || !Array.isArray(ofertas)) return ofertas || [];

    const usados = new Set();
    const resultado = [];

    ofertas.forEach((of) => {
        if (usados.has(of.Id)) return;

        const tipo = tipoAplica(of.AplicaEn);
        if (!tipo) {
            resultado.push(of);
            usados.add(of.Id);
            return;
        }

        // Pareja: mismo titulo + acomodacion, tipo opuesto, no usada.
        const pareja = ofertas.find(
            (o) =>
                !usados.has(o.Id) &&
                o.Id !== of.Id &&
                (o.TituloOferta || "") === (of.TituloOferta || "") &&
                (o.Acomodacion || "") === (of.Acomodacion || "") &&
                tipoAplica(o.AplicaEn) &&
                tipoAplica(o.AplicaEn) !== tipo
        );

        const algunaAgotada = esAgotada && (esAgotada(of) || (pareja && esAgotada(pareja)));

        if (!pareja || algunaAgotada) {
            resultado.push(of);
            usados.add(of.Id);
            return;
        }

        const wk = tipo === "semana" ? of : pareja;
        const we = tipo === "finde" ? of : pareja;

        const parteSemana = escalarOferta(wk, semana, total, etiquetaNoches("semana", semana));
        const parteFinde = escalarOferta(we, finde, total, etiquetaNoches("finde", finde));

        resultado.push({
            ...wk,
            Id: `mix-${wk.Id}-${we.Id}`,
            AplicaEn: "Entre semana + Fin de semana",
            FinalSinImpuestos: r2(parteSemana.FinalSinImpuestos + parteFinde.FinalSinImpuestos),
            Impuestos: r2(parteSemana.Impuestos + parteFinde.Impuestos),
            Final: r2(parteSemana.Final + parteFinde.Final),
            Rack: r2(num(wk.Rack) + num(we.Rack)),
            _mezcla: true,
            _partes: [parteSemana, parteFinde],
            _desglose: {
                semana: { noches: semana, precio: parteSemana.FinalSinImpuestos },
                finde: { noches: finde, precio: parteFinde.FinalSinImpuestos },
            },
        });

        usados.add(of.Id);
        usados.add(pareja.Id);
    });

    return resultado;
};
