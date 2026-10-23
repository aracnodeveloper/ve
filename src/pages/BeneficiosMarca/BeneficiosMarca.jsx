import React, { Suspense, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/global_components/navbar/Navbar";
import Footer from "../../components/global_components/footer/Footer";
import MainBanner from "../../components/home_components/mainBanner/MainBanner";
import { etiquetaMarcaDeSesion } from "../../global/codigoMadre";
import { beneficiosVigentes, cargarBeneficiosMarca } from "../../controllers/beneficiosMarca/beneficiosMarcaController";

/**
 * Beneficios de la marca del usuario (su código madre), igual que la pantalla
 * de la app (BeneficiosMarcaUI): banners de la marca arriba y, debajo, los
 * beneficios vigentes en tarjetas, filtrados por categoría.
 *
 * Es la cara pública de lo que la cuenta madre administra en "Mis beneficios":
 * solo se muestran los vigentes y no se puede editar nada.
 */

const TODAS = "__TODAS__";
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fechaCorta = (f) => `${f.getDate()} ${MESES[f.getMonth()]}`;

const enlaceValido = (link) => /^https?:\/\/\S+$/i.test(String(link || "").trim());

const TarjetaBeneficio = ({ beneficio }) => {
  const [expandido, setExpandido] = useState(false);
  const [seCorta, setSeCorta] = useState(false);
  const descRef = useRef(null);

  // Se mide si el texto de verdad se corta: así "Mostrar más" no aparece en
  // descripciones que ya caben enteras.
  useEffect(() => {
    const el = descRef.current;
    if (el && !expandido) setSeCorta(el.scrollHeight > el.clientHeight + 1);
  }, [beneficio.descripcion, expandido]);

  const tieneLink = enlaceValido(beneficio.link);

  return (
    <article className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-100">
        {beneficio.imagenUrl ? (
          <img src={beneficio.imagenUrl} alt={beneficio.titulo} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-300">
            <span className="icon-[ph--image] h-12 w-12"></span>
          </div>
        )}
        {beneficio.categoria && (
          <span className="absolute top-3 left-3 bg-greenVE-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
            {beneficio.categoria}
          </span>
        )}
        {beneficio.lugar && (
          <span className="absolute top-3 right-3 bg-black/55 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {beneficio.lugar}
          </span>
        )}
        {beneficio.fechaFin && (
          <span className="absolute bottom-3 right-3 bg-black/55 text-white text-sm font-bold px-2.5 py-1 rounded-full">
            Hasta {fechaCorta(beneficio.fechaFin)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-4 flex-1">
        <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2">{beneficio.titulo}</h3>
        {beneficio.subcategoria && (
          <span className="self-start text-[11px] font-semibold text-amber-700 border border-amber-300 bg-amber-50 rounded-full px-2 py-0.5">
            {beneficio.subcategoria}
          </span>
        )}
        {beneficio.descripcion && (
          <>
            <p
              ref={descRef}
              className={`text-sm text-gray-600 leading-relaxed whitespace-pre-line ${expandido ? "" : "line-clamp-2"}`}
            >
              {beneficio.descripcion}
            </p>
            {(seCorta || expandido) && (
              <button
                type="button"
                onClick={() => setExpandido((v) => !v)}
                className="self-start text-xs font-semibold text-greenVE-600 hover:text-greenVE-700"
              >
                {expandido ? "Mostrar menos" : "Mostrar más"}
              </button>
            )}
          </>
        )}

        {tieneLink && (
          <div className="mt-auto pt-3 flex justify-end">
            <a
              href={beneficio.link.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-bold text-gray-800 hover:text-greenVE-600"
            >
              Ver más
              <span className="icon-[ph--caret-right-bold] h-4 w-4"></span>
            </a>
          </div>
        )}
      </div>
    </article>
  );
};

const Aviso = ({ icono, titulo, detalle, children }) => (
  <div className="flex flex-col items-center text-center py-14 px-6">
    <span className={`${icono} h-16 w-16 text-gray-300`}></span>
    <p className="mt-4 text-lg font-bold text-gray-800">{titulo}</p>
    <p className="mt-2 text-sm text-gray-500 max-w-md leading-relaxed">{detalle}</p>
    {children}
  </div>
);

const BeneficiosMarca = () => {
  const navigate = useNavigate();
  const session = JSON.parse(localStorage.getItem("datos"));
  const logueado = !!session && session.data?.nivel !== "visitante";
  const marca = etiquetaMarcaDeSesion(session);

  const [beneficios, setBeneficios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [categoria, setCategoria] = useState(TODAS);
  // Subcategoría elegida dentro de cada categoría. Sin entrada = "Todas".
  const [subcategoriaDe, setSubcategoriaDe] = useState({});
  const [menuAbierto, setMenuAbierto] = useState(null);
  const filtrosRef = useRef(null);

  const cargar = async (forzar = false) => {
    setCargando(true);
    setError("");
    const res = forzar ? await cargarBeneficiosMarca({ soloVigentes: true }) : await beneficiosVigentes();
    setBeneficios(res.beneficios);
    setError(res.ok ? "" : res.msj);
    setCargando(false);
  };

  useEffect(() => {
    if (logueado) cargar();
    else setCargando(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Se cierra al tocar fuera de las pestañas, como los desplegables de la navbar.
  useEffect(() => {
    if (!menuAbierto) return undefined;
    const alTocar = (e) => {
      if (filtrosRef.current && !filtrosRef.current.contains(e.target)) setMenuAbierto(null);
    };
    document.addEventListener("mousedown", alTocar);
    return () => document.removeEventListener("mousedown", alTocar);
  }, [menuAbierto]);

  // Categorías y subcategorías salen de los propios beneficios. "Todos" va
  // primero porque la categoría es opcional: sin esa pestaña los beneficios sin
  // clasificar quedarían inalcanzables.
  const categorias = [...new Set(beneficios.map((b) => b.categoria).filter(Boolean))].sort();
  const subcategoriasDe = (cat) =>
    [...new Set(beneficios.filter((b) => b.categoria === cat && b.subcategoria).map((b) => b.subcategoria))].sort();

  const activa = categoria === TODAS || categorias.includes(categoria) ? categoria : TODAS;
  const visibles =
    activa === TODAS
      ? beneficios
      : beneficios.filter(
        (b) => b.categoria === activa && (!subcategoriaDe[activa] || b.subcategoria === subcategoriaDe[activa])
      );

  const titulo = marca ? `Beneficios ${marca}` : "Beneficios de tu marca";

  const elegirPestana = (cat) => {
    setCategoria(cat);
    // Con subcategorías, tocar la pestaña abre (o cierra) su desplegable.
    const tieneSubs = cat !== TODAS && subcategoriasDe(cat).length > 0;
    setMenuAbierto(tieneSubs && menuAbierto !== cat ? cat : null);
  };

  const contenido = () => {
    if (!logueado) {
      return (
        <Aviso
          icono="icon-[ph--lock-simple]"
          titulo="Inicia sesión"
          detalle="Los beneficios de tu marca se muestran a sus suscriptores. Inicia sesión para verlos."
        >
          <button
            onClick={() => navigate("/login")}
            className="mt-5 bg-greenVE-500 hover:bg-greenVE-600 text-white font-semibold text-sm rounded-xl px-6 py-2.5"
          >
            Iniciar sesión
          </button>
        </Aviso>
      );
    }
    if (cargando && beneficios.length === 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      );
    }
    if (visibles.length === 0) {
      const enCategoria = activa !== TODAS;
      return (
        <Aviso
          icono={error ? "icon-[ph--cloud-slash]" : "icon-[ph--tag]"}
          titulo={error ? "No se pudo cargar" : enCategoria ? `Nada en ${subcategoriaDe[activa] || activa}` : "Todavía no hay beneficios"}
          detalle={
            error
              ? error
              : enCategoria
                ? "No hay beneficios aquí. Prueba con «Todos»."
                : "Cuando tu marca publique promociones, las verás aquí."
          }
        >
          <button onClick={() => cargar(true)} className="mt-4 text-sm font-semibold text-greenVE-600 hover:text-greenVE-700">
            Reintentar
          </button>
        </Aviso>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibles.map((b) => (
          <TarjetaBeneficio key={b.id} beneficio={b} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Suspense>
        <Navbar activo={9} />
      </Suspense>

      {logueado && <MainBanner />}

      {/* Fondo propio: el body de la web es oscuro. */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-greenVE-100 text-greenVE-600">
              <span className="icon-[ph--storefront-fill] h-6 w-6"></span>
            </span>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{titulo}</h1>
              <p className="text-sm text-gray-500">Promociones exclusivas para los suscriptores de tu marca.</p>
            </div>
          </div>

          <div ref={filtrosRef}>
            {/* Pestañas por categoría: la pestaña muestra la subcategoría elegida y al
                tocarla se abre el desplegable, como en la app. */}
            {categorias.length > 0 && (
              <nav className="flex gap-1 border-b border-gray-200 mb-5 overflow-x-auto">
                {[TODAS, ...categorias].map((cat) => {
                  const esActiva = cat === activa;
                  const subs = cat === TODAS ? [] : subcategoriasDe(cat);
                  return (
                    <div key={cat} className="relative flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => elegirPestana(cat)}
                        className={`flex items-center gap-1 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap
                          ${esActiva ? "border-greenVE-600 text-greenVE-700" : "border-transparent text-gray-500 hover:text-greenVE-600"}`}
                      >
                        {cat === TODAS ? "Todos" : subcategoriaDe[cat] || cat}
                        {subs.length > 0 && <span className="icon-[ph--caret-down-bold] h-3 w-3"></span>}
                      </button>
                    </div>
                  );
                })}
              </nav>
            )}

            {menuAbierto && (
              <div className="relative -mt-4 mb-5">
                <div className="flex flex-wrap gap-2 bg-white border border-gray-100 shadow-lg rounded-xl p-3">
                  {[null, ...subcategoriasDe(menuAbierto)].map((sub) => {
                    const elegida = (subcategoriaDe[menuAbierto] || null) === sub;
                    return (
                      <button
                        key={sub || "todas"}
                        type="button"
                        onClick={() => {
                          setSubcategoriaDe((prev) => ({ ...prev, [menuAbierto]: sub }));
                          setMenuAbierto(null);
                        }}
                        className={`text-sm rounded-full px-3 py-1 border transition-colors
                          ${elegida ? "bg-greenVE-500 border-greenVE-500 text-white font-semibold" : "border-gray-200 text-gray-600 hover:border-greenVE-400"}`}
                      >
                        {sub || "Todas"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {contenido()}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BeneficiosMarca;
