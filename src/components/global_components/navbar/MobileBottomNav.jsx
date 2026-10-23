import { useState, useRef, useEffect } from "react";

/**
 * Barra inferior del movil con el mismo diseño que el menu de la app
 * (CurvedNavigationBar): barra gris clara con una muesca en U debajo del item
 * activo y una burbuja verde flotante que se hunde, se desliza y vuelve a
 * subir al cambiar de seccion. Los items y su orden son los de la web.
 *
 * Las medidas y la curva son las mismas del paquete que usa la app:
 * barra de 55px dibujada sobre un trazo de 75px, muesca del ancho de un item
 * (20%) y 60% de alto, burbuja de 46px y animacion de 300ms.
 */

const ALTO = 55;
const ALTO_TRAZO = 75;
const MUESCA = 0.2;
const DURACION = 300;
const COLOR_BARRA = "#e0e0e0";
const COLOR_BURBUJA = "#96c121";
const COLOR_ICONO = "#616161";
// Los iconos del menu son siluetas de un solo color, asi que se tiñen por CSS:
// gris como COLOR_ICONO cuando estan apagados y blancos dentro de la burbuja,
// igual que hace la app con los suyos.
const FILTRO_GRIS = "brightness(0) invert(0.38)";
const FILTRO_BLANCO = "brightness(0) invert(1)";
const BURBUJA = 46;

// Mismo trazo que pinta la app: el eje x va en porcentaje del ancho y el eje y
// en pixeles, por eso el viewBox mezcla 100 con el alto real.
const trazo = (loc) => {
  const x = (v) => (v * 100).toFixed(2);
  const h = ALTO_TRAZO;
  return (
    `M0 0 L${x(loc - 0.1)} 0` +
    ` C${x(loc + MUESCA * 0.2)} ${h * 0.05} ${x(loc)} ${h * 0.6} ${x(loc + MUESCA * 0.5)} ${h * 0.6}` +
    ` C${x(loc + MUESCA)} ${h * 0.6} ${x(loc + MUESCA * 0.8)} ${h * 0.05} ${x(loc + MUESCA + 0.1)} 0` +
    ` L100 0 L100 ${h} L0 ${h} Z`
  );
};

const TRAZO_PLANO = `M0 0 L100 0 L100 ${ALTO_TRAZO} L0 ${ALTO_TRAZO} Z`;

const MobileBottomNav = ({
  activo,
  onClickInicio,
  onClickDisney,
  onClickVinos,
  onClickTours,
  onClickPuntosCarga,
  onClickContactanos,
  marca,
  onClickMarca,
}) => {
  // Desplegable abierto: "beneficios" | "mas" | null. Solo uno a la vez.
  const [abierto, setAbierto] = useState(null);
  const [rutasOpen, setRutasOpen] = useState(false);
  const desplegableRef = useRef(null);

  const cerrarDesplegable = () => {
    setAbierto(null);
    setRutasOpen(false);
  };

  // Cerrar el desplegable al tocar fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (desplegableRef.current && !desplegableRef.current.contains(e.target)) cerrarDesplegable();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const alternar = (nombre) => {
    setRutasOpen(false);
    setAbierto((actual) => (actual === nombre ? null : nombre));
  };

  const items = [
    {
      id: 1,
      label: "Hospedaje",
      icon: "https://visitaecuador.com/img/web/home.png",
      onClick: onClickInicio,
    },
    {
      id: 4,
      label: "Beneficios",
      icon: "https://visitaecuador.com/img/web/Beneficios-Icon03_VE_1-8.png",
      desplegable: "beneficios",
    },
    // Marca del usuario (BYD, JETOUR...) al lado de Beneficios, como en la app.
    // Solo aparece si tiene una; entonces la barra pasa de 5 a 6 items.
    ...(marca
      ? [{ id: 9, label: marca, iconClass: "icon-[ph--storefront-fill]", onClick: onClickMarca }]
      : []),
    {
      // El id es el mismo `activo` que manda la pagina de Puntos de Carga (Navbar activo={8}).
      // En el movil la etiqueta va cortada a "Carga" para que entre junto a las demas.
      id: 8,
      label: "Carga",
      iconClass: "icon-[ph--charging-station-fill]",
      onClick: onClickPuntosCarga,
    },
    {
      // Agrupa Disney (activo 3) y Contacto (activo 7): en esas páginas la burbuja
      // se queda sobre "Más".
      id: "mas",
      label: "Más",
      iconClass: "icon-[ph--dots-three-outline-fill]",
      desplegable: "mas",
      incluye: [3, 7],
    },
  ];

  // Opciones del menu "Más".
  const opcionesMas = [
    { label: "Disney", icon: "https://visitaecuador.com/img/web/magic.png", onClick: onClickDisney },
    { label: "Contacto", icon: "https://visitaecuador.com/img/web/contacto.png", onClick: onClickContactanos },
  ];

  const total = items.length;
  const indiceActivo = items.findIndex((i) => i.id === activo || (i.incluye || []).includes(activo));
  // Con un desplegable abierto la burbuja se va a su item y vuelve al cerrarlo,
  // igual que hace la app con el menu "Más".
  const destino = abierto ? items.findIndex((i) => i.desplegable === abierto) : indiceActivo;
  const sinActivo = destino < 0;

  const [pos, setPos] = useState(() => (destino < 0 ? 0 : destino / total));
  const [oculto, setOculto] = useState(0);
  const [iconoBurbuja, setIconoBurbuja] = useState(destino < 0 ? 0 : destino);
  const posRef = useRef(pos);
  const animRef = useRef(null);

  useEffect(() => {
    if (destino < 0) return undefined;
    const inicio = posRef.current;
    const fin = destino / total;
    if (inicio === fin) {
      setIconoBurbuja(destino);
      return undefined;
    }
    const medio = (fin + inicio) / 2;
    const t0 = performance.now();
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / DURACION);
      const suave = 1 - (1 - k) * (1 - k);
      const p = inicio + (fin - inicio) * suave;
      posRef.current = p;
      setPos(p);
      // La burbuja baja hasta esconderse en la mitad del recorrido y vuelve a subir.
      setOculto(Math.abs(1 - Math.abs((medio - p) / (inicio - medio))));
      if (Math.abs(fin - p) < Math.abs(inicio - p)) setIconoBurbuja(destino);
      if (k < 1) animRef.current = requestAnimationFrame(paso);
    };
    animRef.current = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(animRef.current);
  }, [destino, total]);

  // Los iconos de la web son a color y con fondo blanco propio, asi que dentro de
  // la burbuja van tal cual; solo el monocromo se pinta de blanco como en la app.
  const iconoDe = (item, activa) =>
    item.iconClass ? (
      <span
        className={`${item.iconClass} ${activa ? "h-7 w-7" : "h-6 w-6"}`}
        style={{ color: activa ? "#ffffff" : COLOR_ICONO }}
        role="img"
        aria-label={item.label}
      />
    ) : (
      <img
        src={item.icon}
        alt={item.label}
        className={`object-contain ${activa ? "h-7 w-7" : "h-6 w-6"}`}
        style={{ filter: activa ? FILTRO_BLANCO : FILTRO_GRIS }}
      />
    );

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[60]"
      style={{ backgroundColor: COLOR_BARRA, paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="relative bg-white" style={{ height: `${ALTO}px` }}>
        <svg
          className="absolute left-0 w-full"
          style={{ bottom: `-${ALTO_TRAZO - ALTO}px`, height: `${ALTO_TRAZO}px` }}
          viewBox={`0 0 100 ${ALTO_TRAZO}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={sinActivo ? TRAZO_PLANO : trazo(pos)} fill={COLOR_BARRA} />
        </svg>

        {!sinActivo && (
          <div
            className="absolute flex items-center justify-center rounded-full pointer-events-none"
            style={{
              width: `${BURBUJA}px`,
              height: `${BURBUJA}px`,
              backgroundColor: COLOR_BURBUJA,
              bottom: `-${BURBUJA + 14}px`,
              left: `calc(${((pos + 1 / (2 * total)) * 100).toFixed(2)}% - ${BURBUJA / 2}px)`,
              transform: `translateY(${-(1 - oculto) * 80}px)`,
            }}
          >
            {iconoDe(items[iconoBurbuja], true)}
          </div>
        )}

        <div className="absolute inset-0 flex">
          {items.map((item, indice) => {
            const dif = Math.abs(pos - indice / total);
            const opacidad = sinActivo || dif >= 0.99 / total ? 1 : Math.min(1, total * dif);
            const baja = sinActivo || dif >= 1 / total ? 0 : (1 - total * dif) * 40;
            const contenido = (
              <button
                type="button"
                onClick={item.desplegable ? () => alternar(item.desplegable) : item.onClick}
                className="w-full h-full flex flex-col items-center justify-center gap-1"
                style={{ opacity: opacidad, transform: `translateY(${baja}px)`, color: COLOR_ICONO }}
              >
                {iconoDe(item, false)}
                <span className="text-[10px] font-medium tracking-wide flex items-center gap-0.5 max-w-full px-0.5">
                  {/* Las marcas pueden ser largas (JARDINAZUAYO): se cortan con puntos suspensivos */}
                  <span className="truncate">{item.label}</span>
                  {item.desplegable && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-2.5 w-2.5 transition-transform duration-200 ${abierto === item.desplegable ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
              </button>
            );

            if (!item.desplegable) {
              return (
                <div key={item.id} className="flex-1">
                  {contenido}
                </div>
              );
            }

            const estaAbierto = abierto === item.desplegable;
            return (
              <div key={item.id} className="flex-1 relative" ref={estaAbierto ? desplegableRef : undefined}>
                {/* El panel sale por encima de la burbuja, que sobresale de la barra */}
                {estaAbierto && item.desplegable === "beneficios" && (
                  <div className="absolute bottom-full mb-5 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-xl border border-gray-100 min-w-[150px] overflow-hidden">
                    <button
                      onClick={() => setRutasOpen(!rutasOpen)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#ACCD7B] hover:text-white transition-colors font-medium flex justify-between items-center"
                    >
                      Rutas
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${rutasOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {rutasOpen && (
                      <button
                        onClick={() => { onClickVinos(); cerrarDesplegable(); }}
                        className="w-full text-left pl-8 pr-4 py-2.5 text-sm text-gray-600 hover:bg-[#ACCD7B] hover:text-white transition-colors font-medium bg-gray-50"
                      >
                        Ruta del vino
                      </button>
                    )}
                    <div className="h-px bg-gray-100" />
                    <button
                      onClick={() => { onClickTours(); cerrarDesplegable(); }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#ACCD7B] hover:text-white transition-colors font-medium"
                    >
                      Tours
                    </button>
                  </div>
                )}
                {/* "Más" es el último item: el panel se alinea a la derecha para no salirse de la pantalla */}
                {estaAbierto && item.desplegable === "mas" && (
                  <div className="absolute bottom-full mb-5 right-1 z-50 bg-white rounded-xl shadow-xl border border-gray-100 min-w-[180px] overflow-hidden">
                    {opcionesMas.map((op, i) => (
                      <div key={op.label}>
                        {i > 0 && <div className="h-px bg-gray-100" />}
                        <button
                          onClick={() => { op.onClick(); cerrarDesplegable(); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#ACCD7B] hover:text-white transition-colors font-medium flex items-center gap-3 whitespace-nowrap"
                        >
                          <img src={op.icon} alt="" className="h-5 w-5 object-contain" style={{ filter: FILTRO_GRIS }} />
                          {op.label}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {contenido}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
