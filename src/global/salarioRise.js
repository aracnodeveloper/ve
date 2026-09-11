/**
 * Suma de sueldos de los trabajos ACTIVOS, evitando duplicados.
 *
 * Port de app/shared/utils/salary.util.ts de RISE_Front. La regla es la misma:
 * dos trabajos solo se SUMAN si son de empresas diferentes y ademas difieren en
 * sueldo o en ocupacion. Es decir, un trabajo se considera duplicado (no se
 * vuelve a sumar) si comparte empresa con otro ya contado, o si coincide con
 * otro en sueldo Y ocupacion a la vez. Evita inflar el KPI cuando el IESS trae
 * el mismo empleo repetido o con cambios de sueldo del mismo puesto.
 *
 * Si cambia la regla en RIS, hay que reflejarla aqui: son dos copias.
 *
 * @param {Array} works works del CustomerDetail
 * @returns {{amount: number, count: number}}
 */
export function sumActiveSalaries(works) {
    const activos = (works || []).filter(
        (w) => w && w.isActive && (parseFloat(w.salary) || 0) > 0
    );

    const contados = [];
    activos.forEach((w) => {
        const duplicado = contados.some(
            (c) => mismaEmpresa(c, w) || (mismoSueldo(c, w) && mismaOcupacion(c, w))
        );
        if (!duplicado) contados.push(w);
    });

    return {
        amount: contados.reduce((suma, w) => suma + (parseFloat(w.salary) || 0), 0),
        count: contados.length,
    };
}

/** Si ambas empresas son desconocidas ('') se tratan como la misma: conservador. */
function mismaEmpresa(a, b) {
    return claveEmpresa(a) === claveEmpresa(b);
}

function claveEmpresa(w) {
    const id = (w.business && w.business.id ? String(w.business.id) : "").trim();
    if (id) return `id:${id}`;
    const nombre = (w.business && w.business.name ? String(w.business.name) : "")
        .trim()
        .toLowerCase();
    return nombre ? `name:${nombre}` : "";
}

function mismoSueldo(a, b) {
    return (parseFloat(a.salary) || 0) === (parseFloat(b.salary) || 0);
}

function mismaOcupacion(a, b) {
    const ida = (a.ocupation && a.ocupation.id ? String(a.ocupation.id) : "").trim();
    const idb = (b.ocupation && b.ocupation.id ? String(b.ocupation.id) : "").trim();
    return ida === idb;
}
