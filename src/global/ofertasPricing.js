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
 * Lista de rangos de agotamiento de una oferta.
 *
 * La fuente es `Agotamientos` (tbl_oferta_agotada, varios rangos por oferta). Si
 * no viene, se usa el rango único de siempre (FechaHoraAgotado / FechaHoraAgotadoFin),
 * que el API sigue publicando con el rango vigente o el próximo.
 */
const rangosAgotamiento = (oferta) => {
    if (!oferta) return [];
    const lista = Array.isArray(oferta.Agotamientos) ? oferta.Agotamientos : [];
    if (lista.length > 0) {
        return lista.map((r) => ({ ini: aInstante(r.inicio), fin: aInstante(r.fin) }));
    }
    const ini = aInstante(oferta.FechaHoraAgotado);
    const fin = aInstante(oferta.FechaHoraAgotadoFin);
    return (ini || fin) ? [{ ini, fin }] : [];
};

/**
 * Si un rango de agotamiento bloquea la busqueda:
 *  1. Si el rango YA TERMINO (fin < ahora, con hora exacta), no bloquea. Esto permite
 *     ventanas cortas el mismo dia (p.ej. 09:51 a 09:53) sin bloquear el resto de la jornada.
 *  2. Con fecha de busqueda, bloquea solo si el DIA de check-in cae dentro del rango.
 *     Un agotamiento vigente hoy no afecta a quien reserva para despues de que termine
 *     (agotada del 18 al 22: hoy 19 se puede reservar para el 23).
 *  3. Sin fecha de busqueda, bloquea mientras este vigente ahora.
 * Un extremo vacio deja ese lado abierto; sin ninguna fecha, no bloquea.
 */
const rangoBloquea = ({ ini, fin }, ahora, diaCheckIn) => {
    if (!ini && !fin) return false;
    if (fin && ahora > fin) return false;
    if (!diaCheckIn) return (!ini || ahora >= ini) && (!fin || ahora <= fin);

    const diaIni = ini ? aDia(ini) : null;
    const diaFin = fin ? aDia(fin) : null;
    if (diaIni && diaCheckIn < diaIni) return false;
    if (diaFin && diaCheckIn > diaFin) return false;
    return true;
};

/** La oferta esta agotada si ALGUNO de sus rangos bloquea la busqueda (ver rangoBloquea). */
export const esOfertaAgotada = (oferta, fechaCheckIn) => {
    const ahora = new Date();
    const diaCheckIn = aDia(fechaCheckIn);
    return rangosAgotamiento(oferta).some((rango) => rangoBloquea(rango, ahora, diaCheckIn));
};

/**
 * De todos los rangos de la oferta, el que realmente bloquea la busqueda actual.
 * Misma regla que esOfertaAgotada, pero devolviendo el rango para poder explicarlo.
 * @returns {Object|null} { ini, fin } o null si la oferta esta disponible
 */
export const rangoAgotamientoAplicable = (oferta, fechaCheckIn) => {
    const ahora = new Date();
    const diaCheckIn = aDia(fechaCheckIn);

    // El vigente manda sobre uno futuro: es el que explica mejor por que no se puede reservar hoy.
    const rangos = rangosAgotamiento(oferta).filter((rango) => rangoBloquea(rango, ahora, diaCheckIn));
    if (rangos.length === 0) return null;
    const vigente = rangos.find(({ ini, fin }) => (!ini || ahora >= ini) && (!fin || ahora <= fin));
    return vigente || rangos.sort((a, b) => (a.ini ? a.ini.getTime() : 0) - (b.ini ? b.ini.getTime() : 0))[0];
};

/**
 * Primer dia libre despues de un rango. Si otro rango empieza el mismo dia en que
 * termina este (o antes), se encadena: con "agotada del 1 al 5 y del 6 al 9" la
 * respuesta es el 10, no el 6.
 * @returns {Date|null} null si el bloqueo no tiene fin (indefinido)
 */
export const proximaFechaDisponible = (oferta, rangoBloqueante) => {
    if (!rangoBloqueante || !rangoBloqueante.fin) return null;
    const rangos = rangosAgotamiento(oferta);
    let fin = rangoBloqueante.fin;

    // Se encadenan los rangos pegados o solapados, hasta donde alcance.
    for (let vuelta = 0; vuelta < rangos.length; vuelta++) {
        const siguiente = rangos.find(({ ini, fin: f }) => {
            if (!f || f <= fin) return false;            // ya cubierto por el actual
            if (!ini) return true;                        // abierto por la izquierda
            return aDia(ini) <= aDia(new Date(fin.getTime() + 24 * 60 * 60 * 1000));
        });
        if (!siguiente) break;
        fin = siguiente.fin;
    }
    return new Date(fin.getFullYear(), fin.getMonth(), fin.getDate() + 1);
};

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "14 oct" y, si es de otro ano, "14 oct 2027". */
const diaCorto = (d) => {
    if (!d) return "";
    const base = `${d.getDate()} ${MESES[d.getMonth()]}`;
    return d.getFullYear() !== new Date().getFullYear() ? `${base} ${d.getFullYear()}` : base;
};

const hhmm = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const mismoDia = (a, b) => a && b && aDia(a).getTime() === aDia(b).getTime();

/**
 * Texto del cartel de una oferta agotada: dice QUE ventana la bloquea y desde
 * cuando vuelve a estar libre. Con varios rangos solo se explica el que aplica a
 * la busqueda; el resto se consulta con periodosAgotados().
 */
export const textoAgotada = (oferta, fechaCheckIn) => {
    const bloqueo = rangoAgotamientoAplicable(oferta, fechaCheckIn);
    if (!bloqueo) return "No disponible para estas fechas";
    const { ini, fin } = bloqueo;

    if (!fin) return "No disponible por el momento";

    // Ventana corta dentro de un mismo dia: la hora es lo que aporta.
    if (ini && mismoDia(ini, fin)) {
        const cuando = mismoDia(ini, new Date()) ? "hoy" : `el ${diaCorto(ini)}`;
        return `No disponible ${cuando} de ${hhmm(ini)} a ${hhmm(fin)}`;
    }

    const libre = proximaFechaDisponible(oferta, bloqueo);
    const desde = libre ? `, disponible desde el ${diaCorto(libre)}` : "";
    if (!ini || ini <= new Date()) return `No disponible hasta el ${diaCorto(fin)}${desde}`;
    return `No disponible del ${diaCorto(ini)} al ${diaCorto(fin)}${desde}`;
};

/**
 * Todas las ventanas de agotamiento que siguen vigentes o estan por venir, ya
 * formateadas ("14 oct - 16 oct"). Sirve para mostrar el detalle cuando una
 * oferta tiene varias: el cartel explica una y esto las lista todas.
 */
export const periodosAgotados = (oferta) => {
    const ahora = new Date();
    return rangosAgotamiento(oferta)
        .filter(({ ini, fin }) => (ini || fin) && (!fin || fin >= ahora))
        .sort((a, b) => (a.ini ? a.ini.getTime() : 0) - (b.ini ? b.ini.getTime() : 0))
        .map(({ ini, fin }) => {
            if (ini && fin && mismoDia(ini, fin)) return `${diaCorto(ini)} de ${hhmm(ini)} a ${hhmm(fin)}`;
            if (ini && fin) return `${diaCorto(ini)} - ${diaCorto(fin)}`;
            if (fin) return `hasta el ${diaCorto(fin)}`;
            return `desde el ${diaCorto(ini)}`;
        });
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
