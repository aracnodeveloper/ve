import CertificadoService from "../../services/certificado/CertificadosService";
import { getWineOfferById, getEstablishmentById, wineImageUrl } from "../../core/vinoApiService";

// id_tbl_type en tbl_certificado
export const TYPE_CERTIFICADO = 1;
export const TYPE_TICKET = 2;

// is_active en tbl_certificado
export const CERT_ACTIVO = 1;
export const CERT_USADO = 2;

const getSesion = () => {
    try {
        return JSON.parse(localStorage.getItem("datos"));
    } catch {
        return null;
    }
};

/**
 * tbl_certificado guarda ids de dos sistemas: enteros de VE (apidev) o UUIDs de
 * vino_api. Los enteros ya los resuelve el backend por JOIN; los UUIDs se
 * resuelven aqui contra vino_api, igual que hace resolveTicketVino en el admin.
 */
const isUuid = (s) =>
    typeof s === "string" &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(s.trim());

// Cache por sesion del navegador: evita repetir peticiones del mismo UUID.
const cacheVino = { est: new Map(), ofe: new Map() };

const fetchVino = async (cache, uuid, fetcher) => {
    if (cache.has(uuid)) return cache.get(uuid);
    const promesa = fetcher(uuid)
        .then((res) => res?.data ?? res)
        .catch(() => null);
    cache.set(uuid, promesa);
    return promesa;
};

/** Completa nombre_establecimiento y titulo_oferta cuando los ids son UUIDs. */
const resolverVino = async (item) => {
    const idEst = item.id_tbl_establecimiento;
    const idOfe = item.id_tbl_oferta;
    if (!isUuid(idEst) && !isUuid(idOfe)) return item;

    const [est, ofe] = await Promise.all([
        isUuid(idEst) ? fetchVino(cacheVino.est, idEst, getEstablishmentById) : null,
        isUuid(idOfe) ? fetchVino(cacheVino.ofe, idOfe, getWineOfferById) : null,
    ]);

    return {
        ...item,
        nombre_establecimiento: item.nombre_establecimiento || est?.name || null,
        direccion_establecimiento:
            item.direccion_establecimiento ||
            [est?.city, est?.country].filter(Boolean).join(", ") ||
            null,
        titulo_oferta: item.titulo_oferta || ofe?.title || null,
        // Para la vista del ticket: foto de la oferta y precio del beneficio.
        foto_oferta: wineImageUrl(ofe?.image),
        precio_oferta: ofe?.price ?? null,
    };
};

/**
 * Guarda el registro en tbl_certificado.
 * tipo: 1 = Certificado (hoteles), 2 = Ticket (restaurantes).
 * Complementa al flujo que ya existe (PDF / WhatsApp); no lo reemplaza.
 * Los campos opcionales solo se envian si tienen valor.
 */
export const crearCertificado = async function ({
    tipo = TYPE_CERTIFICADO,
    idEstablecimiento,
    idOferta,
    adultos,
    ninos,
    edadesNinos,
    latitud,
    longitud,
    ubicacion,
    wineType,
    wineSubtype,
    fechaInicio,
    fechaFin,
    precioTotal,
} = {}) {
    try {
        const bd = getSesion();
        if (!bd) return false;

        const params = {
            token: bd["token"],
            id_tbl_type: tipo,
            id_tbl_usuario: bd["data"]["id_usuario"],
        };

        if (idEstablecimiento) params.id_tbl_establecimiento = idEstablecimiento;
        if (idOferta) params.id_tbl_oferta = idOferta;
        if (adultos > 0) params.beneficiarios = adultos;
        if (ninos > 0) params.ninos = ninos;
        if (edadesNinos?.length > 0) params.edades_ninos = edadesNinos.join(",");
        if (latitud) params.latitud = latitud;
        if (longitud) params.longitud = longitud;
        if (ubicacion) params.ubicacion = ubicacion;
        if (wineType) params.wine_type = wineType;
        if (wineSubtype) params.wine_subtype = wineSubtype;
        // Necesarios para convertir el certificado en reserva al marcarlo usado.
        if (fechaInicio) params.fecha_inicio = fechaInicio;
        if (fechaFin) params.fecha_fin = fechaFin;
        if (precioTotal >= 0) params.precio_total = precioTotal;

        const certificadoService = new CertificadoService();
        const res = await certificadoService.crearCertificado(params);

        if (res != null && res["estado"]) return res["data"];
        return false;
    } catch {
        return false;
    }
};

/**
 * Certificados del usuario logueado (paginado).
 * Usa obtenerCertificado, que resuelve establecimiento y oferta contra VE.
 * tipo: 1 = Certificado, 2 = Ticket. Pasar null para traer ambos.
 * Devuelve { items, pagina, cantidad, paginas, lista } o false.
 */
export const getCertificadosUsuario = async function (
    pagina = 1,
    cantidad = 20,
    tipo = TYPE_CERTIFICADO
) {
    try {
        const bd = getSesion();
        if (!bd) return false;

        const params = {
            token: bd["token"],
            id_tbl_usuario: bd["data"]["id_usuario"],
            pagina: pagina,
            cantidad: cantidad,
        };

        if (tipo) params.id_tbl_type = tipo;

        const certificadoService = new CertificadoService();
        const res = await certificadoService.obtenerCertificado(params);

        if (res?.codigo === 401) return 401;
        if (res == null || !res["estado"]) return false;

        // Si algun id resulta ser UUID de vino_api, el JOIN lo deja vacio;
        // se completa aqui antes de entregar la lista.
        const data = res["data"];
        if (Array.isArray(data?.lista)) {
            data.lista = await Promise.all(data.lista.map(resolverVino));
        }
        return data;
    } catch {
        return false;
    }
};

/**
 * Tickets del usuario logueado (paginado).
 * Usa obtenerTicket, el endpoint original sin joins: los ids de los tickets son
 * UUIDs de vino_api y se resuelven aqui en el front.
 * Devuelve { items, pagina, cantidad, paginas, lista } o false.
 */
export const getTicketsUsuario = async function (pagina = 1, cantidad = 20) {
    try {
        const bd = getSesion();
        if (!bd) return false;

        const certificadoService = new CertificadoService();
        const res = await certificadoService.obtenerTicket({
            token: bd["token"],
            id_tbl_usuario: bd["data"]["id_usuario"],
            pagina: pagina,
            cantidad: cantidad,
        });

        if (res?.codigo === 401) return 401;
        if (res == null || !res["estado"]) return false;

        const data = res["data"];
        if (Array.isArray(data?.lista)) {
            // obtenerTicket no filtra por tipo: devuelve certificados y tickets.
            const soloTickets = data.lista.filter(
                (item) => Number(item.id_tbl_type) === TYPE_TICKET
            );
            data.lista = await Promise.all(soloTickets.map(resolverVino));
        }
        return data;
    } catch {
        return false;
    }
};

/**
 * Cuenta cuantos certificados/tickets tiene el usuario en active=1 (activos, sin
 * marcar como usados ni eliminados). Ligero: no resuelve datos de vino_api.
 * tipo: 1 = certificados (hoteles), 2 = tickets (restaurantes).
 */
export const contarPendientes = async function (tipo) {
    try {
        const bd = getSesion();
        if (!bd) return 0;

        const certificadoService = new CertificadoService();
        const params = {
            token: bd["token"],
            id_tbl_usuario: bd["data"]["id_usuario"],
            pagina: 1,
            cantidad: 100,
        };

        let res;
        if (Number(tipo) === TYPE_TICKET) {
            // obtenerTicket no filtra por tipo; se filtra aqui.
            res = await certificadoService.obtenerTicket(params);
        } else {
            params.id_tbl_type = tipo;
            res = await certificadoService.obtenerCertificado(params);
        }

        if (res == null || !res["estado"]) return 0;
        const lista = res["data"]?.lista ?? [];
        return lista.filter(
            (x) => Number(x.is_active) === 1 && Number(x.id_tbl_type) === Number(tipo)
        ).length;
    } catch {
        return 0;
    }
};

/**
 * Beneficios ya consumidos por el usuario logueado (politica OneShot).
 * Devuelve { oneShot, certificados, subtypes } o false.
 */
export const getBeneficiosUsados = async function () {
    try {
        const bd = getSesion();
        if (!bd) return false;

        const certificadoService = new CertificadoService();
        const res = await certificadoService.beneficiosUsados({
            token: bd["token"],
            id_tbl_usuario: bd["data"]["id_usuario"],
        });

        if (res != null && res["estado"]) return res["data"];
        return false;
    } catch {
        return false;
    }
};

/** Marca el certificado como usado (is_active = 2, used_at = now). */
export const marcarCertificadoUsado = async function (idCertificado) {
    try {
        const bd = getSesion();
        if (!bd) return false;

        const certificadoService = new CertificadoService();
        const res = await certificadoService.marcarCertificadoUsado({
            token: bd["token"],
            id_tbl_certificado: idCertificado,
        });

        return res != null && res["estado"] ? true : false;
    } catch {
        return false;
    }
};

/** Borrado logico del certificado (is_active = 0). */
export const eliminarCertificado = async function (idCertificado) {
    try {
        const bd = getSesion();
        if (!bd) return false;

        const certificadoService = new CertificadoService();
        const res = await certificadoService.eliminarCertificado({
            token: bd["token"],
            id_tbl_certificado: idCertificado,
        });

        return res != null && res["estado"] ? true : false;
    } catch {
        return false;
    }
};
