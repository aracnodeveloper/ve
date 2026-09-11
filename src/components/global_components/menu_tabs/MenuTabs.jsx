import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MenuTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [beneficiosOpen, setBeneficiosOpen] = useState(false);
  const [rutasOpen, setRutasOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getActiveTab = () => {
    if (pathname === "/" || pathname.startsWith("/busqueda") || pathname.startsWith("/hotel/")) return 1;
    if (pathname === "/vinos" || pathname === "/Tours" || pathname === "/Promociones") return 4;
    if (pathname.startsWith("/disney")) return 3;
    if (pathname.startsWith("/visas-concierge")) return 5;
    if (pathname.startsWith("/nosotros")) return 6;
    if (pathname.startsWith("/contacto")) return 7;
    if (pathname.startsWith("/puntos-carga")) return 8;
    return 1;
  };

  const activo = getActiveTab();

  const handleClickInicio = () => navigate("/");
  const handleClickInfotour = () => window.open("https://www.infotour.app/");
  const handleClickDisney = () => navigate("/disney");
  const handleClickVinos = () => navigate("/vinos");
  const handleClickVisas = () => navigate("/visas-concierge");
  const handleClickNosotros = () => navigate("/nosotros");
  const handleClickContactanos = () => navigate("/contacto");
  const handleClickPuntosCarga = () => navigate("/puntos-carga");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setBeneficiosOpen(false);
        setRutasOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { id: 1, label: "Hospedaje", href: "https://visitaecuador.com/", icon: "https://visitaecuador.com/img/web/homeMenu.svg", onClick: handleClickInicio, rounded: false },
    { id: 2, label: "InfoTour", href: "https://www.infotour.app/", icon: "https://visitaecuador.com/img/web/infotourMenu.svg", onClick: handleClickInfotour, rounded: false },
    { id: 3, label: "Magic Concierge", href: "https://visitaecuador.com/disney", icon: "https://visitaecuador.com/img/web/disney.png", onClick: handleClickDisney, rounded: false },
    //{ id: 5, label: "Visas", href: "https://visitaecuador.com/visas-concierge", icon: "https://visitaecuador.com/img/web/visas-concierge.jpeg", onClick: handleClickVisas, rounded: true },
    // { id: 6, label: "Nosotros", href: "https://visitaecuador.com/nosotros", icon: "https://visitaecuador.com/img/web/nosotrosMenu.svg", onClick: handleClickNosotros, rounded: true },
    { id: 7, label: "Contacto", href: "https://visitaecuador.com/contacto", icon: "https://visitaecuador.com/img/web/contacto.svg", onClick: handleClickContactanos, rounded: true },
    { id: 8, label: "Puntos de Carga", href: "https://visitaecuador.com/puntos-carga", iconClass: "icon-[ph--map-pin-fill]", onClick: handleClickPuntosCarga, rounded: true },
  ];

  const busqueda =
    location.pathname.includes("busqueda") ||
    location.pathname.includes("hotel") ||
    location.pathname.includes("/busqueda-beneficios");

  const renderTabClass = (id) =>
    `flex gap-2 ${activo === id ? "bg-white text-gray-800" : "bg-[#ACCD7B] text-white"
    } rounded-t-lg px-4 py-2 text-sm items-center transition-all`;

  return (
    <>
      {/* ========== DESKTOP: Tabs superiores ========== */}
      <div className={`${busqueda ? "hidden " : ""}  md:flex gap-0.5 items-end flex-wrap`}>

        {/* Items 1–3 */}
        {menuItems.filter((i) => i.id < 4).map((item) => (
          <a
            key={item.id}
            href={item.href}
            onClick={(e) => { e.preventDefault(); item.onClick(); }}
            className={renderTabClass(item.id)}
          >
            {item.rounded ? (
              <div className="rounded-full bg-white p-0.5" style={{ height: "22px", width: "22px" }}>
                <img src={item.icon} className="rounded-full" style={{ height: "100%", width: "100%" }} alt={item.label} />
              </div>
            ) : (
              <img src={item.icon} style={{ height: "20px" }} alt={item.label} />
            )}
            <label className="hidden md:flex cursor-pointer font-medium">{item.label}</label>
          </a>
        ))}

        {/* ── Beneficios con dropdown ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setBeneficiosOpen((prev) => !prev)}
            className={`flex gap-2 ${activo === 4 ? "bg-white text-gray-800" : "bg-[#ACCD7B] text-white"
              } rounded-t-lg px-4 py-2 text-sm items-center transition-all cursor-pointer`}
          >
            <div className="rounded-full bg-white p-0.5" style={{ height: "22px", width: "22px" }}>
              <img
                src="https://visitaecuador.com/img/web/Beneficios-Icon01_VE_1-8.png"
                className=""
                style={{ height: "100%", width: "100%" }}
                alt="Beneficios"
              />
            </div>
            <span className="hidden md:flex font-medium">Beneficios</span>
            {/* Chevron */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3 w-3 transition-transform duration-200 ${beneficiosOpen ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Dropdown panel */}
          {beneficiosOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-100 min-w-[160px]">
              <div className="relative w-full">
                <button
                  onClick={(e) => { e.stopPropagation(); setRutasOpen(!rutasOpen); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#ACCD7B] hover:text-white transition-colors font-medium flex justify-between items-center"
                >
                  Rutas
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${rutasOpen ? "rotate-90" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {rutasOpen && (
                  <div className="absolute left-full top-0 ml-1 z-[100] bg-white rounded-lg shadow-lg border border-gray-100 min-w-[160px] overflow-hidden">
                    <button
                      onClick={() => { navigate("/vinos"); setBeneficiosOpen(false); setRutasOpen(false); }}
                      className="w-full text-left px-4 py-2.5  text-sm text-gray-700 hover:bg-[#ACCD7B] hover:text-white transition-colors font-medium"
                    >
                      Ruta del vino
                    </button>|
                  </div>
                )}
              </div>
              <button
                onClick={() => { navigate("/Tours"); setBeneficiosOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#ACCD7B] hover:text-white transition-colors font-medium"
              >
                Tours
              </button>
              <button
                onClick={() => { navigate("/Promociones"); setBeneficiosOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#ACCD7B] hover:text-white transition-colors font-medium"
              >
                Promociones
              </button>
            </div>
          )}
        </div>

        {/* Items 5–7 */}
        {menuItems.filter((i) => i.id > 4).map((item) => (
          <a
            key={item.id}
            href={item.href}
            onClick={(e) => { e.preventDefault(); item.onClick(); }}
            className={renderTabClass(item.id)}
          >
            {item.iconClass ? (
              <div className="rounded-full bg-white flex items-center justify-center" style={{ height: "22px", width: "22px" }}>
                <span className={`${item.iconClass} h-3.5 w-3.5 text-greenVE-600`}></span>
              </div>
            ) : item.rounded ? (
              <div className={`rounded-full bg-white ${item.id === 6 ? "" : "p-0.5"} `} style={{ height: "22px", width: "22px" }}>
                <img src={item.icon} className="rounded-full" style={{ height: "100%", width: "100%" }} alt={item.label} />
              </div>
            ) : (
              <img src={item.icon} style={{ height: "20px" }} alt={item.label} />
            )}
            <label className="hidden md:flex cursor-pointer font-medium">{item.label}</label>
          </a>
        ))}

      </div>
    </>
  );
};

export default MenuTabs;