import React, { Suspense, useEffect, useState } from "react";
import { Spinner } from "@material-tailwind/react";
import Navbar from "../../components/global_components/navbar/Navbar";
import Footer from "../../components/global_components/footer/Footer";
import FormularioBeneficio from "../../components/beneficios_marca/FormularioBeneficio";
import {
  cargarBeneficiosMarca,
  eliminarBeneficioMarca,
  estadoBeneficio,
  puedeAdministrarBeneficios,
} from "../../controllers/beneficiosMarca/beneficiosMarcaController";

/**
 * "Mis beneficios": la cuenta madre administra las promociones que sus
 * suscriptores ven en el menú de su marca. Igual que en la app, el menú solo
 * aparece con `permisos.perfil.misBeneficios` (permiso 544, rol Cuenta Madre);
 * esta página lo vuelve a mirar por si entran escribiendo la dirección.
 */

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fechaLarga = (f) => (f ? `${f.getDate()} ${MESES[f.getMonth()]} ${f.getFullYear()}` : "—");

const COLOR_ESTADO = {
  Vigente: "bg-green-50 text-green-700",
  Programado: "bg-orange-50 text-orange-700",
  Vencido: "bg-gray-100 text-gray-500",
};

const Chip = ({ children, className }) => (
  <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${className}`}>{children}</span>
);

const Aviso = ({ icono, titulo, detalle, children }) => (
  <div className="flex flex-col items-center text-center py-16 px-6">
    <span className={`${icono} h-16 w-16 text-gray-300`}></span>
    <p className="mt-4 text-lg font-bold text-gray-800">{titulo}</p>
    <p className="mt-2 text-sm text-gray-500 max-w-md leading-relaxed">{detalle}</p>
    {children}
  </div>
);

const TarjetaAdmin = ({ beneficio, onEditar, onEliminar }) => {
  const estado = estadoBeneficio(beneficio);
  return (
    <article className="flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200">
      <div className="h-36 bg-gray-100">
        {beneficio.imagenUrl ? (
          <img src={beneficio.imagenUrl} alt={beneficio.titulo} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-300">
            <span className="icon-[ph--image] h-10 w-10"></span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3 className="font-bold text-gray-900 leading-snug">{beneficio.titulo}</h3>
        {beneficio.descripcion && <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line">{beneficio.descripcion}</p>}
        <div className="flex flex-wrap gap-1.5">
          <Chip className="bg-greenVE-50 text-greenVE-700">{beneficio.codigo}</Chip>
          <Chip className={COLOR_ESTADO[estado]}>{estado}</Chip>
          {beneficio.categoria && (
            <Chip className="bg-indigo-50 text-indigo-700">
              {beneficio.subcategoria ? `${beneficio.categoria} · ${beneficio.subcategoria}` : beneficio.categoria}
            </Chip>
          )}
          {beneficio.lugar && <Chip className="bg-slate-100 text-slate-600">{beneficio.lugar}</Chip>}
        </div>
        <p className="text-xs text-gray-500">
          {fechaLarga(beneficio.fechaInicio)} → {beneficio.fechaFin ? fechaLarga(beneficio.fechaFin) : "sin caducidad"}
        </p>
        <div className="mt-auto pt-3 border-t border-gray-100 flex gap-2">
          <button
            onClick={onEditar}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <span className="icon-[ph--pencil-simple-bold] h-4 w-4"></span>
            Editar
          </button>
          <button
            onClick={onEliminar}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <span className="icon-[ph--trash-bold] h-4 w-4"></span>
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
};

const MisBeneficios = () => {
  const session = JSON.parse(localStorage.getItem("datos"));
  const permitido = puedeAdministrarBeneficios(session);

  const [beneficios, setBeneficios] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  // undefined = cerrado, null = alta, objeto = edición.
  const [enEdicion, setEnEdicion] = useState(undefined);
  const [porEliminar, setPorEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [aviso, setAviso] = useState("");

  const cargar = async () => {
    setCargando(true);
    const res = await cargarBeneficiosMarca();
    setBeneficios(res.beneficios);
    setCodigos(res.codigos);
    setError(res.ok ? "" : res.msj);
    setCargando(false);
  };

  useEffect(() => {
    if (permitido) cargar();
    else setCargando(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!aviso) return undefined;
    const t = setTimeout(() => setAviso(""), 3500);
    return () => clearTimeout(t);
  }, [aviso]);

  const confirmarEliminar = async () => {
    setEliminando(true);
    const msj = await eliminarBeneficioMarca(porEliminar.id);
    setEliminando(false);
    setPorEliminar(null);
    setAviso(msj || "Beneficio eliminado");
    if (!msj) cargar();
  };

  const contenido = () => {
    if (!permitido) {
      return (
        <Aviso
          icono="icon-[ph--lock-simple]"
          titulo="Sin acceso"
          detalle="Este menú es para las cuentas madre que administran los beneficios de su marca."
        />
      );
    }
    if (cargando && beneficios.length === 0) {
      return (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      );
    }
    if (error && beneficios.length === 0) {
      return (
        <Aviso icono="icon-[ph--cloud-slash]" titulo="No se pudo cargar" detalle={error}>
          <button onClick={cargar} className="mt-4 text-sm font-semibold text-greenVE-600 hover:text-greenVE-700">
            Reintentar
          </button>
        </Aviso>
      );
    }
    if (codigos.length === 0) {
      // Pasa si se asignó el rol a un usuario que no es cuenta madre.
      return (
        <Aviso
          icono="icon-[ph--info]"
          titulo="Sin códigos asignados"
          detalle="Su usuario no tiene códigos promocionales a su nombre, así que todavía no hay beneficios que administrar."
        />
      );
    }
    if (beneficios.length === 0) {
      return (
        <Aviso
          icono="icon-[ph--tag]"
          titulo="Aún no hay beneficios"
          detalle="Cree el primero con el botón «Nuevo beneficio». Sus suscriptores lo verán mientras esté vigente."
        />
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {beneficios.map((b) => (
          <TarjetaAdmin key={b.id} beneficio={b} onEditar={() => setEnEdicion(b)} onEliminar={() => setPorEliminar(b)} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Suspense>
        <Navbar />
      </Suspense>

      {/* Fondo propio: el body de la web es oscuro. */}
      <div className="bg-gray-50 min-h-[60vh]">
        <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Mis beneficios</h1>
              <p className="text-sm text-gray-500">Las promociones que tus suscriptores ven en el menú de tu marca.</p>
            </div>
            {permitido && codigos.length > 0 && (
              <button
                onClick={() => setEnEdicion(null)}
                className="inline-flex items-center gap-2 rounded-xl bg-greenVE-500 hover:bg-greenVE-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm"
              >
                <span className="icon-[ph--plus-bold] h-4 w-4"></span>
                Nuevo beneficio
              </button>
            )}
          </div>

          {contenido()}
        </div>
      </div>

      <Footer />

      {enEdicion !== undefined && (
        <FormularioBeneficio
          beneficio={enEdicion}
          codigos={codigos}
          onCerrar={() => setEnEdicion(undefined)}
          onGuardado={() => {
            setAviso("Beneficio guardado");
            cargar();
          }}
        />
      )}

      {porEliminar && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center px-6" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => !eliminando && setPorEliminar(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-gray-800">Eliminar beneficio</h2>
            <p className="mt-2 text-sm text-gray-600">
              «{porEliminar.titulo}» dejará de mostrarse a sus suscriptores. Esta acción no se puede deshacer.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setPorEliminar(null)}
                disabled={eliminando}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {eliminando && <Spinner className="h-4 w-4" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {aviso && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[1200] rounded-full bg-gray-900 px-5 py-2.5 text-sm text-white shadow-lg">
          {aviso}
        </div>
      )}
    </>
  );
};

export default MisBeneficios;
