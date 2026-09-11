import { useEffect, useState } from "react";
import { getBeneficiosUsados } from "../controllers/certificado/certificadoController";

/**
 * Politica del producto "Suscripcion OneShot".
 *
 * El suscriptor tiene un solo uso de cada beneficio: un certificado (hoteles)
 * y un ticket por cada wine_subtype (vinos, burgerKing, tour...). Al agotarlos
 * se le ocultan los botones de generar y los contactos del establecimiento.
 *
 * Un beneficio se consume al MARCARLO COMO USADO (used_at), no al generarlo.
 *
 * Ojo: esto es solo para pintar la UI. La regla se hace cumplir en el backend
 * (Ticket::validarOneShot), porque los endpoints son publicos.
 */

// tbl_prod_suscripcion del producto OneShot. Ver data.prodSuscripcion del login.
export const ONESHOT_ID_PROD_SUSCRIPCION = "522";
export const ONESHOT_ID_PRODUCTO = "17536";

/** Lee data.prodSuscripcion del localStorage. */
const getProdSuscripcion = () => {
    try {
        return JSON.parse(localStorage.getItem("datos"))?.data?.prodSuscripcion ?? null;
    } catch {
        return null;
    }
};

/** true si el usuario logueado tiene el producto OneShot. Sincrono. */
export const esOneShot = () => {
    const prod = getProdSuscripcion();
    if (!prod) return false;
    return (
        String(prod.id_tbl_prod_suscripcion) === ONESHOT_ID_PROD_SUSCRIPCION ||
        String(prod.id_tbl_producto) === ONESHOT_ID_PRODUCTO
    );
};

// ── Cache a nivel de modulo ───────────────────────────────────────────────
// La peticion se dispara al entrar a la pagina (no al abrir el modal) para que
// el estado ya este listo cuando el usuario llegue al boton. Se guarda la
// promesa, no el resultado: si el modal se abre mientras carga, reusa la misma
// peticion en vez de lanzar otra.
let promesaBeneficios = null;
let beneficiosCache = null;

/** Dispara la carga de beneficios. Idempotente: llamar al montar la pagina. */
export const precargarBeneficios = () => {
    if (!esOneShot()) return null;
    if (!promesaBeneficios) {
        promesaBeneficios = getBeneficiosUsados().then((res) => {
            beneficiosCache = res || null;
            return beneficiosCache;
        });
    }
    return promesaBeneficios;
};

/** Limpia el cache. Llamar tras marcar un certificado/ticket como usado. */
export const invalidarBeneficios = () => {
    promesaBeneficios = null;
    beneficiosCache = null;
};

/**
 * Estado de beneficios para pintar la UI.
 *
 * cargando solo puede ser true para usuarios OneShot: para el resto es siempre
 * false y no se hace ninguna peticion. Eso permite deshabilitar el boton
 * mientras se resuelve sin afectar a los usuarios normales.
 */
export const useBeneficios = () => {
    const [beneficios, setBeneficios] = useState(beneficiosCache);
    const [cargando, setCargando] = useState(esOneShot() && beneficiosCache === null);

    useEffect(() => {
        if (!esOneShot()) return;
        if (beneficiosCache) {
            setBeneficios(beneficiosCache);
            setCargando(false);
            return;
        }
        let vivo = true;
        precargarBeneficios()?.then((res) => {
            if (!vivo) return;
            setBeneficios(res);
            setCargando(false);
        });
        return () => {
            vivo = false;
        };
    }, []);

    return { beneficios, cargando };
};

/**
 * Decide si se puede generar un certificado de hospedaje.
 * beneficios: resultado de useBeneficios(), o null mientras carga.
 */
export const puedeGenerarCertificado = (beneficios) => {
    if (!esOneShot()) return true;
    if (!beneficios) return true; // el backend decide igual (validarOneShot)
    return Number(beneficios.certificados) === 0;
};

/**
 * Decide si se puede generar un ticket de un subType.
 * Sin subType no se puede evaluar la regla, asi que se permite y el backend decide.
 */
export const puedeGenerarTicket = (beneficios, subType) => {
    if (!esOneShot()) return true;
    if (!beneficios) return true;
    if (!subType) return true;
    return !(beneficios.subtypes ?? []).includes(subType);
};
