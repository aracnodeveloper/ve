import { useState, useRef, useEffect } from "react";

const MobileBottomNav = ({ 
  activo, 
  onClickInicio, 
  onClickDisney, 
  onClickVinos,
  onClickTours,
  onClickVisas, 
  onClickContactanos 
}) => {
  const [beneficiosOpen, setBeneficiosOpen] = useState(false);
  const [rutasOpen, setRutasOpen] = useState(false);
  const beneficiosRef = useRef(null);

  // Cerrar dropdown al tocar fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (beneficiosRef.current && !beneficiosRef.current.contains(e.target)) {
        setBeneficiosOpen(false);
        setRutasOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mobileItems = [
    {
      id: 1,
      label: "Hospedaje",
      icon: "https://visitaecuador.com/img/web/homeMenu.svg",
      onClick: onClickInicio,
    },
    {
      id: 3,
      label: "Disney",
      icon: "https://visitaecuador.com/img/web/disney.png",
      onClick: onClickDisney,
    },
    {
      id: 5,
      label: "Visas",
      icon: "https://visitaecuador.com/img/web/visas-concierge.jpeg",
      onClick: onClickVisas,
      rounded: true
    },
    {
      id: 7,
      label: "Contacto",
      icon: "https://visitaecuador.com/img/web/contacto.svg",
      onClick: onClickContactanos,
      rounded: true
    }
  ];

  const isBeneficiosActive = activo === 4;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-[60]">
      <div className="flex justify-around items-center py-2 px-2">

        {/* Hospedaje y Disney primero */}
        {mobileItems.slice(0, 2).map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
              activo === item.id
                ? "text-greenVE-600 bg-greenVE-50"
                : "text-gray-500 hover:text-greenVE-500 hover:bg-gray-100"
            }`}
          >
            <img
              src={item.icon}
              className={`h-5 w-5 ${activo === item.id ? "opacity-100" : "opacity-70"}`}
              alt={item.label}
            />
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </button>
        ))}

        {/* Beneficios con dropdown hacia arriba */}
        <div className="relative flex flex-col items-center" ref={beneficiosRef}>
          {/* Dropdown panel — aparece encima del botón */}
          {beneficiosOpen && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-xl border border-gray-100 min-w-[150px] overflow-hidden">
              <div>
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
                    onClick={() => { onClickVinos(); setBeneficiosOpen(false); setRutasOpen(false); }}
                    className="w-full text-left pl-8 pr-4 py-2.5 text-sm text-gray-600 hover:bg-[#ACCD7B] hover:text-white transition-colors font-medium bg-gray-50"
                  >
                    Ruta del vino
                  </button>
                )}
              </div>
              <div className="h-px bg-gray-100" />
              <button
                onClick={() => { onClickTours(); setBeneficiosOpen(false); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#ACCD7B] hover:text-white transition-colors font-medium"
              >
                Tours
              </button>
            </div>
          )}

          <button
            onClick={() => setBeneficiosOpen((prev) => !prev)}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
              isBeneficiosActive || beneficiosOpen
                ? "text-greenVE-600 bg-greenVE-50"
                : "text-gray-500 hover:text-greenVE-500 hover:bg-gray-100"
            }`}
          >
            <div
              className={`rounded-full p-0.5 ${
                isBeneficiosActive || beneficiosOpen ? "bg-greenVE-100" : "bg-gray-100"
              }`}
              style={{ height: "24px", width: "24px" }}
            >
              <img
                src="https://visitaecuador.com/img/web/benefit.svg"
                className="rounded-full w-full h-full object-cover"
                alt="Beneficios"
              />
            </div>
            <span className="text-[10px] font-medium tracking-wide flex items-center gap-0.5">
              Beneficios
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-2.5 w-2.5 transition-transform duration-200 ${beneficiosOpen ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </button>
        </div>

        {/* Visas y Contacto */}
        {mobileItems.slice(2).map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
              activo === item.id
                ? "text-greenVE-600 bg-greenVE-50"
                : "text-gray-500 hover:text-greenVE-500 hover:bg-gray-100"
            }`}
          >
            {item.rounded ? (
              <div
                className={`rounded-full p-0.5 ${activo === item.id ? "bg-greenVE-100" : "bg-gray-100"}`}
                style={{ height: "24px", width: "24px" }}
              >
                <img
                  src={item.icon}
                  className="rounded-full w-full h-full object-cover"
                  alt={item.label}
                />
              </div>
            ) : (
              <img
                src={item.icon}
                className={`h-5 w-5 ${activo === item.id ? "opacity-100" : "opacity-70"}`}
                alt={item.label}
              />
            )}
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </button>
        ))}

      </div>

      {/* Safe area para dispositivos con notch */}
      <div className="h-safe-area-inset-bottom bg-white/95" />
    </nav>
  );
};

export default MobileBottomNav;