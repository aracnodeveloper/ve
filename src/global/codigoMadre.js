/**
 * Códigos madre de suscripción que se muestran en el header.
 *
 * La clave es el código tal como llega del login; el valor es la marca que se
 * muestra. CJA y CJA1 son la misma marca que JARDINAZUAYO, por eso los tres
 * apuntan al mismo texto. Cualquier otro código (AARC1, PRD1, etc.) no se
 * muestra: el header queda como estaba.
 *
 * Esta lista es solo el RESPALDO: las marcas se administran en el módulo de
 * publicidad del admin (columna `mostrar_en_header` de tbl_codigo_promocional) y
 * llegan por `getCodigosHeader`. Si el endpoint falla se usa esta lista.
 */
export const codigosMadreEnHeader = {
  BYD: "BYD",
  JETOUR: "JETOUR",
  VANSERVICE: "VANSERVICE",
  AMARU: "AMARU",
  JARDINAZUAYO: "JARDINAZUAYO",
  CJA: "JARDINAZUAYO",
  CJA1: "JARDINAZUAYO",
};

/** Marcas vigentes: las del servidor si ya llegaron, si no las de respaldo. */
let marcasVigentes = null;

const CACHE_KEY = "codigosHeader";
const CACHE_HORAS = 6;

/** Texto a mostrar para un código, o null si no es una de las marcas. */
export const etiquetaCodigoMadre = (codigo) => {
  const c = String(codigo ?? "").trim().toUpperCase();
  if (c === "") return null;
  return (marcasVigentes ?? codigosMadreEnHeader)[c] ?? null;
};

/**
 * Carga las marcas desde el servidor (getCodigosHeader) y las deja en caché por
 * 6 horas. Devuelve true si cambiaron respecto a lo que ya había, para que el
 * header se vuelva a pintar. Nunca lanza: si algo falla se queda el respaldo.
 */
export const cargarCodigosHeader = async () => {
  const previas = marcasVigentes;
  try {
    const guardado = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (guardado?.mapa && Date.now() - (guardado.fecha ?? 0) < CACHE_HORAS * 3600000) {
      marcasVigentes = guardado.mapa;
      return previas === null;
    }
  } catch {
    // caché ilegible: se consulta al servidor
  }

  const { getCodigosHeader } = await import("../controllers/info/infoController");
  const mapa = await getCodigosHeader();
  if (!mapa || Object.keys(mapa).length === 0) return false;

  marcasVigentes = mapa;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ fecha: Date.now(), mapa }));
  } catch {
    // sin localStorage (modo privado): solo queda en memoria
  }
  return JSON.stringify(previas) !== JSON.stringify(mapa);
};

/** Código dentro de un enlace de compartir: .../login/?cp=CODIGO */
const codigoDeEnlace = (texto) => {
  const encontrado = String(texto ?? "").match(/[?&]cp=([A-Za-z0-9._-]+)/);
  return encontrado ? encontrado[1] : null;
};

/**
 * Código promocional propio del usuario (el que comparte para vender).
 *
 * Sale de los enlaces de compartir que el login ya devuelve en `configPerfil`:
 * loginPost arma esos mensajes con `getCodigoPromocionalByUsuario`, que es
 * justamente el código del usuario. Se lee de ahí y no del endpoint
 * `getMiCodigoPromocional` (que es el que usa la app) porque ese endpoint no
 * acepta llamadas del navegador: su CORS solo permite la cabecera
 * Authorization, no Content-Type, y el navegador bloquea la petición.
 */
export const codigoPropioDeSesion = (session) => {
  const config = session?.data?.configPerfil ?? {};
  return (
    codigoDeEnlace(config.cashback_mensaje_wa_compartir_registro_url) ??
    codigoDeEnlace(config.cashback_mensaje_wa_compartir_compra) ??
    null
  );
};

/**
 * Marca a mostrar en el header, o null. Igual que la app: primero el código
 * madre de la suscripción y, si no es una marca, el código propio del usuario
 * (así el dueño de la marca también la ve).
 */
export const etiquetaMarcaDeSesion = (session) =>
  etiquetaCodigoMadre(session?.data?.codigoPromocional?.codigo) ??
  etiquetaCodigoMadre(codigoPropioDeSesion(session));

/**
 * Marca a mostrar en el header. Como `etiquetaMarcaDeSesion`, pero además usa el
 * código con el que entró un visitante sin sesión (enlace .../?codigo=BYD, que la
 * home guarda en localStorage). Así la marca se ve desde antes del login.
 */
export const etiquetaMarcaActual = (session) => {
  const deSesion = etiquetaMarcaDeSesion(session);
  if (deSesion) return deSesion;
  try {
    return etiquetaCodigoMadre(localStorage.getItem("codigo"));
  } catch {
    return null;
  }
};
