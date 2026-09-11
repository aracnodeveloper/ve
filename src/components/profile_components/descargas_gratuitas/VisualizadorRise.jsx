import React, { useMemo, useState } from "react";
import { Box, Modal } from "@mui/material";
import { sumActiveSalaries } from "../../../global/salarioRise";

/**
 * Réplica del Customer Detail de RIS dentro de un modal de la web.
 *
 * Renderiza el CustomerDetail que devuelve GET /api/Customer/by-cedula, con la
 * misma estructura del componente customer-detail de RISE_Front: cabecera con
 * avatar y KPIs, pestaña "Datos" (ficha + contactos) y pestaña "Laboral"
 * (situación actual + historial agrupado por empresa).
 *
 * Se mantienen los colores azules de RIS en vez del verde de la web: es una
 * vista de otro sistema y conviene que se lea como tal.
 *
 * Las pestañas Familia, Tarjetas y VisitaEcuador de RIS no están: cada una vive
 * en un endpoint distinto (/familia, tarjetas, buró) y detrás de permisos que
 * este front no tiene. Aquí solo se pinta lo que entrega by-cedula.
 */

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  width: "92vw",
  maxWidth: 1100,
  maxHeight: "92vh",
  overflow: "auto",
  outline: "none",
};

const guion = (v) => (v === null || v === undefined || v === "" ? "—" : v);

/** "2026-09-08T00:00:00" -> "2026-09-08" */
const soloFecha = (v) => {
  if (!v) return "—";
  const s = String(v);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : s;
};

const territorio = (t) => {
  if (!t) return "—";
  const partes = [t.city, t.province].filter(Boolean);
  return partes.length ? partes.join(", ") : "—";
};

const iniciales = (nombre) =>
  String(nombre || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("") || "?";

/** Mismo criterio que getAvatarImage de RIS, resuelto como color. */
const colorAvatar = (c) => {
  const code = c?.gender?.code;
  const desc = (c?.gender?.description || "").toLowerCase();
  const esMujer = code === "F" || code === "2" || desc === "mujer" || desc === "femenino";
  return esMujer ? "bg-pink-100 text-pink-600" : "bg-blue-100 text-blue-600";
};

const trabajoActivo = (c) => (c?.works || []).find((w) => w.isActive) || null;

const Fila = ({ label, children, destacado = false }) => (
  <div className="flex items-stretch border-b border-gray-200 last:border-0">
    <span
      className={`w-40 flex-shrink-0 text-xs text-blue-600 py-1.5 px-1 ${destacado ? "bg-gray-100" : ""}`}
    >
      {label}
    </span>
    <span className="flex-1 text-sm text-gray-800 py-1.5 pl-3 border-l border-gray-200 break-words">
      {children}
    </span>
  </div>
);

const Estrella = ({ principal }) => (
  <span
    title={principal ? "Principal" : "Secundario"}
    className={`icon-[fluent--star-16-filled] h-4 w-4 flex-shrink-0 ${principal ? "text-yellow-500" : "text-gray-300"}`}
  />
);

const TarjetaContactos = ({ icono, titulo, items, vacio, render }) => (
  <div className="border border-gray-200 rounded-lg p-3 mb-3 bg-white">
    <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-2">
      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 flex-shrink-0">
        <span className={`${icono} h-4 w-4 text-blue-500`} />
      </span>
      <label className="font-semibold text-gray-800">{titulo}</label>
      <span className="ml-auto text-xs text-gray-400">{items.length}</span>
    </div>
    {items.length === 0 ? (
      <span className="text-sm text-gray-500">{vacio}</span>
    ) : (
      <div className="max-h-40 overflow-y-auto">
        {items.map((it, i) => (
          <div
            key={it.id || i}
            className={`flex items-center gap-2 py-1.5 ${i < items.length - 1 ? "border-b border-gray-100" : ""}`}
          >
            <span className={`${icono} h-4 w-4 text-blue-500 flex-shrink-0`} />
            {render(it)}
            <Estrella principal={it.isPrimary} />
          </div>
        ))}
      </div>
    )}
  </div>
);

const Kpi = ({ valor, etiqueta, icono, fondo, onClick, activo, titulo }) => (
  <button
    onClick={onClick}
    title={titulo}
    className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border px-3 py-2 min-w-[5.5rem] shadow-sm transition-colors ${fondo} ${activo ? "border-blue-400" : "border-gray-200"}`}
  >
    <div className="flex items-center gap-1">
      {icono && <span className={`${icono} h-4 w-4`} />}
      <span className="text-lg font-bold text-gray-800">{valor}</span>
    </div>
    <span className="text-[11px] text-gray-500 whitespace-nowrap">{etiqueta}</span>
  </button>
);

/* ── Pestaña Datos ──────────────────────────────────────────────────────── */
const TabDatos = ({ c }) => {
  const activo = trabajoActivo(c);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-7">
        <div className="border border-gray-200 rounded-lg px-3 py-1 bg-white">
          <Fila label="Nombres">
            <span className="font-medium">{guion(c.name)}</span>
          </Fila>
          <Fila label="Cédula">
            <span className="font-medium font-mono">{guion(c.ci?.ciNumber)}</span>
          </Fila>
          <Fila label="C. Dactilar">{guion(c.dactilar)}</Fila>
          <Fila label="Ciudad (domicilio)">{territorio(c.domicileTerritorial)}</Fila>
          <Fila label="F. Nacimiento">
            {soloFecha(c.birthDate)}
            {c.age != null && (
              <span className="text-gray-500 ml-3">
                Edad: <span className="text-gray-700 font-medium">{c.age} Años</span>
              </span>
            )}
          </Fila>
          <Fila label="Lugar de nacimiento">{territorio(c.birthTerritorial)}</Fila>
          <Fila label="Nacionalidad">{guion(c.nationality?.description)}</Fila>
          <Fila label="Sexo">{guion(c.gender?.description)}</Fila>
          <Fila label="Estado civil">{guion(c.civil?.description)}</Fila>
          <Fila label="Instrucción">{guion(c.instruction?.description)}</Fila>
          <Fila label="Profesión">{guion(c.profession?.description)}</Fila>
          <Fila label="Información adicional">{guion(c.additionalInfo)}</Fila>
          <Fila label="Sueldo" destacado>
            <span className="font-medium">
              {activo?.salary != null ? `$ ${activo.salary}` : "—"}
            </span>
          </Fila>
          <Fila label="Empresa laboral">
            <span className="font-medium">
              {guion(activo?.business?.name || activo?.business?.tradeName)}
            </span>
          </Fila>
        </div>
      </div>

      <div className="lg:col-span-5">
        <TarjetaContactos
          icono="icon-[fluent--location-20-regular]"
          titulo="Dirección"
          items={c.addresses || []}
          vacio="Sin direcciones registradas."
          render={(a) => (
            <span className="flex-1 text-sm text-gray-700 break-words">{a.description}</span>
          )}
        />
        <TarjetaContactos
          icono="icon-[material-symbols--mail-outline-rounded]"
          titulo="Email"
          items={c.mails || []}
          vacio="Sin emails registrados."
          render={(m) => (
            <span className="flex-1 text-sm text-gray-700 break-all">{m.email}</span>
          )}
        />
        <TarjetaContactos
          icono="icon-[fluent--phone-20-regular]"
          titulo="Teléfonos"
          items={c.phones || []}
          vacio="Sin teléfonos registrados."
          render={(p) => (
            <>
              <span className="flex-1 text-sm text-gray-700">{p.phone}</span>
              {p.description && (
                <span className="text-[11px] text-gray-400">{p.description}</span>
              )}
            </>
          )}
        />
      </div>
    </div>
  );
};

/* ── Pestaña Laboral ────────────────────────────────────────────────────── */
const CeldaEmpresa = ({ label, children }) => (
  <div className="border border-gray-200 px-2 py-1">
    <label className="block text-[11px] text-gray-500">{label}</label>
    <div className="text-sm text-gray-700 break-words">{children || "—"}</div>
  </div>
);

const TabLaboral = ({ c }) => {
  const activos = useMemo(() => (c.works || []).filter((w) => w.isActive), [c]);
  const historial = useMemo(() => (c.works || []).filter((w) => !w.isActive), [c]);

  // Misma funcion que el KPI: no suma dos veces el mismo empleo cuando el IESS
  // lo trae repetido o con cambios de sueldo del mismo puesto.
  const sueldo = sumActiveSalaries(activos);

  // Historial agrupado por empresa, como en RIS: una tarjeta por empresa con
  // todos sus periodos y cambios de sueldo.
  const grupos = useMemo(() => {
    const mapa = {};
    historial.forEach((w) => {
      const clave = w.business?.ruc || w.business?.name || "sin-empresa";
      if (!mapa[clave]) mapa[clave] = { business: w.business, works: [] };
      mapa[clave].works.push(w);
    });
    return Object.keys(mapa).map((k) => {
      const g = mapa[k];
      const ordenados = [...g.works].sort((a, b) =>
        String(b.stAt || "").localeCompare(String(a.stAt || ""))
      );
      return {
        clave: k,
        business: g.business,
        works: ordenados,
        ultimoSueldo: ordenados[0]?.salary ?? 0,
      };
    });
  }, [historial]);

  const [abierta, setAbierta] = useState(null);

  return (
    <div className="flex flex-col gap-4">
      {/* Situación laboral actual */}
      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <span className="icon-[mdi--office-building-outline] h-5 w-5 text-blue-600" />
          <label className="font-bold text-gray-800">Situación laboral actual</label>
          {activos.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-green-500 text-white text-[11px] font-semibold">
              {activos.length} {activos.length === 1 ? "empleo activo" : "empleos activos"}
            </span>
          )}
        </div>

        <div className="p-3">
          {activos.length === 0 ? (
            <span className="text-sm text-gray-500">Sin trabajo activo registrado.</span>
          ) : (
            <>
              {activos.map((w, i) => (
                <div key={w.id || i} className={i > 0 ? "border-t border-gray-200 pt-3 mt-3" : ""}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="icon-[mdi--office-building-outline] h-5 w-5 text-blue-600" />
                      <label className="font-bold">
                        {guion(w.business?.name || w.business?.tradeName)}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Sueldo:</span>
                      <span className="font-bold text-gray-700">$ {w.salary || 0}</span>
                      <span className="px-2 py-0.5 rounded-full bg-green-500 text-white text-[11px] font-semibold">
                        Activo
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4">
                    <CeldaEmpresa label="RUC">
                      <span className="font-mono">{w.business?.ruc}</span>
                    </CeldaEmpresa>
                    <CeldaEmpresa label="Sucursal">{w.subsidiary?.cdo}</CeldaEmpresa>
                    <CeldaEmpresa label="Tipo empresa">{w.business?.type}</CeldaEmpresa>
                    <CeldaEmpresa label="Ocupación">
                      <span className="text-blue-600">{w.ocupation?.description}</span>
                    </CeldaEmpresa>
                    <CeldaEmpresa label="Ingreso">{soloFecha(w.stAt)}</CeldaEmpresa>
                    <CeldaEmpresa label="Ubicación empresa">
                      {[w.business?.city, w.business?.province].filter(Boolean).join(" · ")}
                    </CeldaEmpresa>
                    <CeldaEmpresa label="Dirección empresa">{w.business?.address}</CeldaEmpresa>
                    <CeldaEmpresa label="Teléfono empresa">{w.business?.phone}</CeldaEmpresa>
                  </div>
                </div>
              ))}

              {activos.length > 1 && (
                <div className="flex flex-col items-end mt-2 pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-700">
                    <strong>Sueldo total activo:</strong> $ {sueldo.amount}
                  </span>
                  {sueldo.count > 1 && (
                    <span className="text-[11px] text-gray-500 text-right">
                      Suma de {sueldo.count} empleos distintos (empresas diferentes
                      con sueldo u ocupación distintos)
                    </span>
                  )}
                  {sueldo.count < activos.length && (
                    <span className="text-[11px] text-gray-400 text-right">
                      {activos.length - sueldo.count}{" "}
                      {activos.length - sueldo.count === 1
                        ? "registro no se sumó por considerarse duplicado"
                        : "registros no se sumaron por considerarse duplicados"}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Historial laboral */}
      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <span className="icon-[material-symbols--calendar-today-outline] h-5 w-5 text-gray-500" />
          <label className="font-bold text-gray-800">Historial laboral</label>
          <span className="ml-auto text-xs text-gray-400">
            {grupos.length} {grupos.length === 1 ? "empresa" : "empresas"}
          </span>
        </div>

        <div className="p-3 flex flex-col gap-3">
          {grupos.length === 0 ? (
            <span className="text-sm text-gray-500">Sin historial laboral registrado.</span>
          ) : (
            grupos.map((g) => (
              <div key={g.clave} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setAbierta(abierta === g.clave ? null : g.clave)}
                  className="w-full flex items-center justify-between gap-2 p-2.5 hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="icon-[mdi--office-building-outline] h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold truncate">
                        {g.business?.name || g.business?.tradeName || "Empleo sin empresa"}
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        RUC: {guion(g.business?.ruc)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[11px] text-gray-500 whitespace-nowrap">
                      {g.works.length} {g.works.length === 1 ? "registro" : "registros"}
                    </span>
                    <span className="text-[11px] text-gray-500 whitespace-nowrap">
                      Último: <span className="font-bold text-gray-700">$ {g.ultimoSueldo ?? 0}</span>
                    </span>
                    <span
                      className={`icon-[material-symbols--arrow-forward-ios-rounded] h-3 w-3 text-gray-400 transition-transform ${abierta === g.clave ? "rotate-90" : ""}`}
                    />
                  </div>
                </button>

                {abierta === g.clave && (
                  <div className="border-t border-gray-200 px-2 pb-2">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[11px] text-gray-500">
                          <th className="text-left font-medium py-1.5 px-1">Desde</th>
                          <th className="text-left font-medium py-1.5 px-1">Hasta</th>
                          <th className="text-left font-medium py-1.5 px-1">Ocupación</th>
                          <th className="text-right font-medium py-1.5 px-1">Sueldo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {g.works.map((w, i) => (
                          <tr key={w.id || i}>
                            <td className="py-1.5 px-1 text-gray-600">{soloFecha(w.stAt)}</td>
                            <td className="py-1.5 px-1 text-gray-600">{soloFecha(w.endAt)}</td>
                            <td className="py-1.5 px-1 text-gray-600">
                              {guion(w.ocupation?.description)}
                            </td>
                            <td className="py-1.5 px-1 text-right font-medium text-gray-800">
                              $ {w.salary || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Modal ──────────────────────────────────────────────────────────────── */
const VisualizadorRise = ({ open, data, onClose }) => {
  const [tab, setTab] = useState(0);
  const c = data;

  if (!c) return null;

  const activo = trabajoActivo(c);

  // Mismo criterio que el KPI de RIS: suma los empleos activos DISTINTOS en vez
  // de tomar solo el primero (ver sumActiveSalaries).
  const sueldo = sumActiveSalaries(c.works);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <div className="flex flex-col">
          {/* Cabecera */}
          <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 ${colorAvatar(c)}`}
              >
                {iniciales(c.name)}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="text-lg font-bold text-gray-900">{guion(c.name)}</label>
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <span className="icon-[mage--id-card] h-4 w-4 text-green-500" />
                    CI: {guion(c.ci?.ciNumber || c.dactilar)}
                  </span>
                </div>

                {/* KPIs */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <Kpi
                    valor={c.age ?? "—"}
                    etiqueta="Años"
                    icono="icon-[material-symbols--calendar-today-outline] text-blue-600"
                    fondo="bg-blue-50"
                    onClick={() => setTab(0)}
                    activo={tab === 0}
                  />
                  <Kpi
                    valor={`$ ${sueldo.amount || 0}`}
                    etiqueta={sueldo.amount ? "Posible sueldo" : "Sin sueldo"}
                    icono={
                      sueldo.count > 1
                        ? "icon-[akar-icons--people-group] text-blue-600"
                        : null
                    }
                    titulo={
                      sueldo.count > 1
                        ? `Suma de ${sueldo.count} empleos activos distintos (empresas diferentes con sueldo u ocupación distintos)`
                        : "Ver información laboral"
                    }
                    fondo="bg-blue-50"
                    onClick={() => setTab(1)}
                    activo={tab === 1}
                  />
                  <Kpi
                    valor={(c.works || []).length}
                    etiqueta="Registros IESS"
                    icono="icon-[mdi--office-building-outline] text-blue-600"
                    fondo="bg-blue-50"
                    onClick={() => setTab(1)}
                    activo={tab === 1}
                  />
                  <Kpi
                    valor={
                      <span className="text-sm">{guion(c.civil?.description)}</span>
                    }
                    etiqueta="Estado civil"
                    icono="icon-[akar-icons--people-group] text-orange-600"
                    fondo="bg-orange-50"
                    onClick={() => setTab(0)}
                  />
                </div>
              </div>
            </div>

            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <span className="icon-[mdi--close-circle-outline] h-7 w-7" />
            </button>
          </div>

          {/* Aviso de fallecimiento (alerta de luto de RIS) */}
          {c.isAlive === false && (
            <div className="mx-5 mt-3 flex items-center gap-2 bg-gray-900 text-white rounded-lg px-4 py-2">
              <span className="icon-[fluent--error-circle-24-regular] h-5 w-5 text-red-400" />
              <div className="flex flex-col">
                <span className="font-bold text-sm text-red-400">Atención</span>
                <span className="text-xs text-gray-200">
                  El cliente registra fallecimiento.
                </span>
              </div>
            </div>
          )}

          {/* Pestañas */}
          <div className="flex gap-1 px-5 pt-3 border-b border-gray-200">
            {[
              { i: 0, texto: "Datos" },
              { i: 1, texto: "Laboral" },
            ].map((t) => (
              <button
                key={t.i}
                onClick={() => setTab(t.i)}
                className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                  tab === t.i
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.texto}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === 0 ? <TabDatos c={c} /> : <TabLaboral c={c} />}
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default VisualizadorRise;
