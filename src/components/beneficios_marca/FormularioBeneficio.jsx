import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Spinner } from "@material-tailwind/react";
import {
  cargarCatalogoBeneficios,
  crearOpcionCatalogo,
  guardarBeneficioMarca,
  subirImagenBeneficio,
} from "../../controllers/beneficiosMarca/beneficiosMarcaController";

/**
 * Panel lateral para crear o editar un beneficio de la cuenta madre. Mismos
 * campos y reglas que el formulario de la app (mis_beneficios_ui.dart):
 * imagen, código (solo si tiene más de uno), título, descripción, enlace,
 * categoría y subcategoría (con "Crear nueva") y vigencia.
 */

const DURACION_PANEL = 250;
const MAX_FOTO_MB = 5; // el límite de subirImagenPublicidad.php
const CREAR = "__crear__";

const aInput = (f) => {
  if (!f) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${f.getFullYear()}-${p(f.getMonth() + 1)}-${p(f.getDate())}`;
};

const enlaceValido = (t) => {
  try {
    const u = new URL(t);
    return /^https?:$/.test(u.protocol) && !!u.host;
  } catch {
    return false;
  }
};

const Campo = ({ titulo, children, ayuda }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-bold text-gray-800">{titulo}</label>
    {children}
    {ayuda && <p className="text-xs text-gray-500">{ayuda}</p>}
  </div>
);

const claseInput =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-greenVE-300 focus:border-greenVE-400";

const FormularioBeneficio = ({ beneficio, codigos, onCerrar, onGuardado }) => {
  const esEdicion = !!beneficio;
  const [visible, setVisible] = useState(false);

  const [titulo, setTitulo] = useState(beneficio?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(beneficio?.descripcion ?? "");
  const [link, setLink] = useState(beneficio?.link ?? "");
  // Con un solo código no tiene sentido hacer elegir: se preselecciona.
  const [idCodigo, setIdCodigo] = useState(beneficio?.idCodigo ?? (codigos.length === 1 ? codigos[0].id : 0));
  const [idCategoria, setIdCategoria] = useState(beneficio?.idCategoria ?? 0);
  const [idSubcategoria, setIdSubcategoria] = useState(beneficio?.idSubcategoria ?? 0);
  const [inicio, setInicio] = useState(aInput(beneficio?.fechaInicio ?? new Date()));
  const [fin, setFin] = useState(aInput(beneficio?.fechaFin));

  // Slug ya subido: se manda tal cual al guardar.
  const [imagen, setImagen] = useState(beneficio?.imagen ?? "");
  const [vistaPrevia, setVistaPrevia] = useState(beneficio?.imagenUrl ?? "");
  const [subiendo, setSubiendo] = useState(false);
  const inputFoto = useRef(null);
  const intentoFoto = useRef(0);

  const [catalogo, setCatalogo] = useState({ categorias: [], subcategorias: [] });
  // Alta en línea de una categoría o subcategoría: { esSub, nombre, guardando }.
  const [nueva, setNueva] = useState(null);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    // El catálogo se pide al abrir el formulario: solo hace falta aquí.
    cargarCatalogoBeneficios().then(setCatalogo);
    return () => cancelAnimationFrame(id);
  }, []);

  const cerrar = () => {
    setVisible(false);
    setTimeout(onCerrar, DURACION_PANEL);
  };

  useEffect(() => {
    const alPresionar = (e) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subcategorias = catalogo.subcategorias.filter((s) => s.idCategoria === Number(idCategoria));

  const elegirFoto = async (archivo) => {
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) return setError("Elija una imagen (JPG, PNG o WEBP).");
    if (archivo.size > MAX_FOTO_MB * 1024 * 1024) return setError(`La imagen supera ${MAX_FOTO_MB} MB.`);
    setError("");
    const intento = ++intentoFoto.current;
    const anterior = { imagen, vistaPrevia };
    setVistaPrevia(URL.createObjectURL(archivo));
    setSubiendo(true);
    const res = await subirImagenBeneficio(archivo);
    // Si mientras subía eligieron otra, esta respuesta ya no cuenta.
    if (intento !== intentoFoto.current) return;
    setSubiendo(false);
    if (res.slug) {
      setImagen(res.slug);
    } else {
      setImagen(anterior.imagen);
      setVistaPrevia(anterior.vistaPrevia);
      setError(res.error);
    }
  };

  const cambiarInicio = (valor) => {
    setInicio(valor);
    // Un fin anterior al nuevo inicio dejaría el beneficio imposible de mostrar.
    if (fin && valor && fin < valor) setFin("");
  };

  const elegirCategoria = (valor) => {
    if (valor === CREAR) return abrirNueva(false);
    setIdCategoria(Number(valor) || 0);
    // La subcategoría cuelga de la categoría: al cambiarla deja de tener sentido.
    setIdSubcategoria(0);
  };

  const elegirSubcategoria = (valor) => {
    if (valor === CREAR) return abrirNueva(true);
    setIdSubcategoria(Number(valor) || 0);
  };

  const abrirNueva = (esSub) => {
    if (!idCodigo) return setError("Elija primero el código.");
    setError("");
    setNueva({ esSub, nombre: "", guardando: false });
  };

  const crearNueva = async () => {
    const nombre = nueva.nombre.trim();
    if (!nombre) return;
    setNueva((n) => ({ ...n, guardando: true }));
    const res = await crearOpcionCatalogo({
      nombre,
      idCodigo,
      idCategoria: nueva.esSub ? Number(idCategoria) : null,
    });
    if (!res.ok) {
      setNueva((n) => ({ ...n, guardando: false }));
      return setError(res.msj);
    }
    setCatalogo(await cargarCatalogoBeneficios());
    if (nueva.esSub) setIdSubcategoria(res.id);
    else {
      setIdCategoria(res.id);
      setIdSubcategoria(0);
    }
    setNueva(null);
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!idCodigo) return setError("Elija el código.");
    if (!titulo.trim()) return setError("El título es obligatorio.");
    if (link.trim() && !enlaceValido(link.trim())) return setError("Escriba el enlace completo, con https://");
    if (!inicio) return setError("Elija desde cuándo se muestra.");

    setError("");
    setGuardando(true);
    const msj = await guardarBeneficioMarca({
      id: beneficio?.id ?? 0,
      id_tbl_codigo_promocional: idCodigo,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      link: link.trim(),
      imagen,
      // El fin se guarda al cierre del día para que ese día siga siendo vigente.
      fecha_inicio: `${inicio} 00:00:00`,
      fecha_fin: fin ? `${fin} 23:59:59` : "",
      id_tbl_lugar: beneficio?.idLugar ?? 0,
      id_tbl_beneficio_categoria: Number(idCategoria) || 0,
      id_tbl_beneficio_subcategoria: Number(idSubcategoria) || 0,
      orden: beneficio?.orden ?? 0,
    });
    setGuardando(false);
    if (msj) return setError(msj);
    onGuardado();
    cerrar();
  };

  const selectorNueva = (esSub) =>
    nueva && nueva.esSub === esSub ? (
      <div className="flex gap-2 mt-1">
        <input
          autoFocus
          maxLength={100}
          value={nueva.nombre}
          onChange={(e) => setNueva((n) => ({ ...n, nombre: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              crearNueva();
            }
          }}
          placeholder={esSub ? "Nombre de la subcategoría" : "Nombre de la categoría"}
          className={claseInput}
        />
        <button
          type="button"
          onClick={crearNueva}
          disabled={nueva.guardando || !nueva.nombre.trim()}
          className="flex-shrink-0 rounded-xl bg-greenVE-500 px-4 text-sm font-semibold text-white hover:bg-greenVE-600 disabled:opacity-50"
        >
          {nueva.guardando ? <Spinner className="h-4 w-4" /> : "Crear"}
        </button>
        <button
          type="button"
          onClick={() => setNueva(null)}
          className="flex-shrink-0 rounded-xl border border-gray-200 px-3 text-sm text-gray-500 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    ) : null;

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="titulo-beneficio">
      <div
        onClick={cerrar}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-[250ms] ${visible ? "opacity-100" : "opacity-0"}`}
      />

      <aside
        className={`relative h-full w-full sm:max-w-lg bg-white shadow-2xl flex flex-col
                    transition-transform duration-[250ms] ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div>
            <h2 id="titulo-beneficio" className="text-lg font-bold text-greenVE-800">
              {esEdicion ? "Editar beneficio" : "Nuevo beneficio"}
            </h2>
            <p className="text-sm text-gray-500">Tus suscriptores lo verán en el menú de tu marca mientras esté vigente.</p>
          </div>
          <button
            onClick={cerrar}
            aria-label="Cerrar"
            className="h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
          >
            <span className="icon-[ph--x-bold] h-4 w-4"></span>
          </button>
        </header>

        <form onSubmit={guardar} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
            <Campo titulo="Imagen">
              <input
                ref={inputFoto}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  elegirFoto(e.target.files && e.target.files[0]);
                  e.target.value = "";
                }}
              />
              {vistaPrevia ? (
                <div className="relative h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                  <img src={vistaPrevia} alt="Imagen del beneficio" className="h-full w-full object-cover" />
                  {subiendo && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <Spinner className="h-6 w-6" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => inputFoto.current?.click()}
                    className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/75"
                  >
                    <span className="icon-[ph--camera-bold] h-4 w-4"></span>
                    Cambiar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputFoto.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    elegirFoto(e.dataTransfer.files && e.dataTransfer.files[0]);
                  }}
                  className="h-48 rounded-xl border-2 border-dashed border-greenVE-300 bg-greenVE-50/50 hover:bg-greenVE-50 flex flex-col items-center justify-center gap-2 text-greenVE-700"
                >
                  <span className="icon-[ph--image-square-bold] h-10 w-10"></span>
                  <span className="text-sm font-semibold">Toca o arrastra una imagen</span>
                  <span className="text-xs text-gray-500">JPG, PNG o WEBP, hasta {MAX_FOTO_MB} MB</span>
                </button>
              )}
            </Campo>

            {codigos.length > 1 && (
              <Campo titulo="Código">
                <select value={idCodigo || ""} onChange={(e) => setIdCodigo(Number(e.target.value) || 0)} className={claseInput}>
                  <option value="">Elija el código</option>
                  {codigos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo}
                    </option>
                  ))}
                </select>
              </Campo>
            )}

            <Campo titulo="Título">
              <input
                value={titulo}
                maxLength={150}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Mantenimiento gratis"
                className={claseInput}
              />
            </Campo>

            <Campo titulo="Descripción">
              <textarea
                value={descripcion}
                rows={4}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Qué incluye el beneficio"
                className={`${claseInput} resize-y`}
              />
            </Campo>

            <Campo titulo="Enlace (opcional)" ayuda="Se abre con el botón «Ver más» de la tarjeta.">
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className={claseInput}
              />
            </Campo>

            <Campo titulo="Categoría">
              <select value={idCategoria || ""} onChange={(e) => elegirCategoria(e.target.value)} className={claseInput}>
                <option value="">Sin categoría</option>
                {catalogo.categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
                <option value={CREAR}>+ Crear nueva</option>
              </select>
              {selectorNueva(false)}
            </Campo>

            {!!idCategoria && (
              <Campo titulo="Subcategoría">
                <select value={idSubcategoria || ""} onChange={(e) => elegirSubcategoria(e.target.value)} className={claseInput}>
                  <option value="">Sin subcategoría</option>
                  {subcategorias.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                  <option value={CREAR}>+ Crear nueva</option>
                </select>
                {selectorNueva(true)}
              </Campo>
            )}

            <Campo titulo="Vigencia" ayuda="Deja «Hasta» vacío para que no caduque.">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-semibold text-gray-500">Desde</span>
                  <input type="date" value={inicio} onChange={(e) => cambiarInicio(e.target.value)} className={claseInput} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500">Hasta</span>
                  <div className="relative">
                    <input type="date" value={fin} min={inicio || undefined} onChange={(e) => setFin(e.target.value)} className={claseInput} />
                  </div>
                  {fin && (
                    <button type="button" onClick={() => setFin("")} className="mt-1 text-xs font-semibold text-greenVE-600 hover:text-greenVE-700">
                      Quitar fecha (sin caducidad)
                    </button>
                  )}
                </div>
              </div>
            </Campo>
          </div>

          <footer className="border-t border-gray-100 px-5 py-4 flex flex-col gap-2">
            {error && (
              <p className="flex items-start gap-1.5 text-sm text-red-600">
                <span className="icon-[ph--warning-circle-fill] h-4 w-4 flex-shrink-0 mt-0.5"></span>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={guardando || subiendo}
              className="w-full rounded-xl bg-greenVE-500 hover:bg-greenVE-600 py-3 text-sm font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {guardando && <Spinner className="h-4 w-4" />}
              {subiendo ? "Subiendo imagen…" : "Guardar"}
            </button>
          </footer>
        </form>
      </aside>
    </div>,
    document.body
  );
};

export default FormularioBeneficio;
