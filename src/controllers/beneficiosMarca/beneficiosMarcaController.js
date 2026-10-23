import InfoService from "../../services/info/InfoService";

/**
 * Beneficios de la cuenta madre (BYD, JETOUR, JARDINAZUAYO...). Misma lógica que
 * `BeneficiosMadreMV` de la app:
 *  - la cuenta madre los administra en "Mis beneficios" (permiso 544 →
 *    `permisos.perfil.misBeneficios`);
 *  - sus suscriptores ven los vigentes en el menú de la marca, junto a Beneficios.
 *
 * El backend decide de qué códigos es dueño el usuario a partir del token, así
 * que aquí nunca se manda un id de código para elegir de quién son los datos.
 */

const tokenDeSesion = () => {
  try {
    return JSON.parse(localStorage.getItem("datos") || "null")?.token || "";
  } catch {
    return "";
  }
};

/** Los permisos llegan en la sesión del login. */
export const puedeAdministrarBeneficios = (session) =>
  session?.data?.permisos?.perfil?.misBeneficios === true;

const entero = (v) => parseInt(v ?? "", 10) || 0;

/** "2026-10-22 00:00:00" → Date local (Safari no acepta el espacio). */
const fecha = (v) => {
  if (!v) return null;
  const [d, h = "00:00:00"] = String(v).split(" ");
  const f = new Date(`${d}T${h}`);
  return isNaN(f) ? null : f;
};

const deJson = (j) => ({
  id: entero(j.id),
  idCodigo: entero(j.id_tbl_codigo_promocional),
  codigo: String(j.codigo ?? ""),
  titulo: String(j.titulo ?? ""),
  descripcion: String(j.descripcion ?? ""),
  imagen: String(j.imagen ?? ""),
  imagenUrl: String(j.imagen_url ?? ""),
  link: String(j.link ?? ""),
  fechaInicio: fecha(j.fecha_inicio),
  fechaFin: fecha(j.fecha_fin),
  idLugar: entero(j.id_tbl_lugar) || null,
  lugar: String(j.lugar ?? ""),
  idCategoria: entero(j.id_tbl_beneficio_categoria) || null,
  categoria: String(j.categoria ?? ""),
  idSubcategoria: entero(j.id_tbl_beneficio_subcategoria) || null,
  subcategoria: String(j.subcategoria ?? ""),
  orden: entero(j.orden),
});

/** "Programado" | "Vigente" | "Vencido". `fechaFin` nula es "sin caducidad". */
export const estadoBeneficio = (b, ahora = new Date()) => {
  if (b.fechaInicio && ahora < b.fechaInicio) return "Programado";
  if (b.fechaFin && ahora > b.fechaFin) return "Vencido";
  return "Vigente";
};

/**
 * Lista de beneficios. Con `soloVigentes` devuelve lo que ve el suscriptor; sin
 * él, también vencidos y programados (lo que necesita quien administra).
 * Devuelve { ok, beneficios, codigos, msj }.
 */
export const cargarBeneficiosMarca = async ({ soloVigentes = false } = {}) => {
  const token = tokenDeSesion();
  if (!token) return { ok: false, beneficios: [], codigos: [], msj: "Inicie sesión para ver los beneficios." };
  const res = await new InfoService().obtenerBeneficiosMadre({
    token,
    ...(soloVigentes ? { soloVigentes: 1 } : {}),
  });
  if (res?.estado === true) {
    const data = res.data || {};
    return {
      ok: true,
      beneficios: (data.beneficios || []).map(deJson),
      codigos: (data.codigos || []).map((c) => ({ id: entero(c.id), codigo: String(c.codigo ?? "") })),
      msj: "",
    };
  }
  return {
    ok: false,
    beneficios: [],
    codigos: [],
    // Sin `msj` es que la petición ni llegó (GenericService devuelve `msg`).
    msj: res?.msj ? String(res.msj) : "No se pudieron cargar los beneficios. Revise su conexión.",
  };
};

// Los vigentes se piden una vez por sesión: el menú de la marca vive en la
// navbar, que se vuelve a montar en cada página. Cerrar sesión recarga la web,
// así que la caché no sobrevive a un cambio de cuenta.
let cacheVigentes = null;
let tokenCache = null;

export const beneficiosVigentes = async () => {
  const token = tokenDeSesion();
  if (cacheVigentes && tokenCache === token) return cacheVigentes;
  const res = await cargarBeneficiosMarca({ soloVigentes: true });
  // Un fallo de red no se cachea: se reintenta en la siguiente página.
  if (res.ok) {
    cacheVigentes = res;
    tokenCache = token;
  }
  return res;
};

const limpiarCache = () => {
  cacheVigentes = null;
};

/** Devuelve null si salió bien, o el mensaje de error. */
export const guardarBeneficioMarca = async (datos) => {
  const res = await new InfoService().guardarBeneficioMadre({ ...datos, token: tokenDeSesion() });
  if (res?.estado === true) {
    limpiarCache();
    return null;
  }
  return String(res?.msj || "No se pudo guardar. Revise su conexión.");
};

export const eliminarBeneficioMarca = async (id) => {
  const res = await new InfoService().eliminarBeneficioMadre({ id, token: tokenDeSesion() });
  if (res?.estado === true) {
    limpiarCache();
    return null;
  }
  return String(res?.msj || "No se pudo eliminar. Revise su conexión.");
};

/** Categorías y subcategorías: el catálogo general más las que creó la marca. */
export const cargarCatalogoBeneficios = async () => {
  const res = await new InfoService().obtenerCatalogoBeneficios({ token: tokenDeSesion() });
  if (res?.estado !== true) return { categorias: [], subcategorias: [] };
  const data = res.data || {};
  const opcion = (o) => ({
    id: entero(o.id),
    nombre: String(o.nombre ?? ""),
    general: o.general === true,
    idCategoria: entero(o.id_tbl_beneficio_categoria) || null,
  });
  return {
    categorias: (data.categorias || []).map(opcion),
    subcategorias: (data.subcategorias || []).map(opcion),
  };
};

/**
 * Crea una categoría, o una subcategoría si llega `idCategoria`.
 * Devuelve { ok, id, msj }.
 */
export const crearOpcionCatalogo = async ({ nombre, idCodigo, idCategoria }) => {
  const res = await new InfoService().crearCategoriaBeneficio({
    token: tokenDeSesion(),
    nombre,
    id_tbl_codigo_promocional: idCodigo,
    ...(idCategoria ? { id_categoria: idCategoria } : {}),
  });
  if (res?.estado === true) return { ok: true, id: entero(res.data?.id), msj: "" };
  return { ok: false, id: 0, msj: String(res?.msj || "No se pudo crear la opción.") };
};

/** Devuelve { slug, url } o { error }. */
export const subirImagenBeneficio = async (archivo) => {
  const res = await new InfoService().subirImagenBeneficio(tokenDeSesion(), archivo);
  const slug = res?.data?.direccion_foto;
  if (res?.estado === true && slug) return { slug, url: res.data.url || "" };
  return { error: String(res?.msj || "No se pudo subir la imagen.") };
};
