import Icons from "../../../global/icons";
import LogoFooter from "./LogoFooter";

const Footer = () => {
  const codigo = localStorage.getItem("codigo");
  const year = new Date().getFullYear();
  const icons = new Icons();
  return (
    !codigo && (
      <footer className="bg-footerColor mt-20 md:px-0 px-5">
        <div className="mx-auto max-w-6xl py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-y-5">
            <div className="w-1/2 md:w-1/4">
              <h3 className="text-greenVE-700 font-bold text-sm">Nosotros</h3>
              <div>
                <a
                  href="/nosotros"
                  className="text-greenVE-700 font-normal hover:text-greenVE-500 text-xs"
                >
                  Quienes somos
                </a>
              </div>
              <div>
                <a
                  href="/remate"
                  className="text-greenVE-700 font-normal hover:text-greenVE-500 text-xs"
                >
                  Remate y consulta
                </a>
              </div>
              <div>
                <a
                  href="/contacto?tab=emprende"
                  className="text-greenVE-700 font-normal hover:text-greenVE-500 text-xs"
                >
                  Emprende con nosotros
                </a>
              </div>
            </div>
            <div className="w-1/2 md:w-1/4">
              <h3 className="text-greenVE-700 font-bold text-sm">
                Servicio Premium
              </h3>
              <div>
                <a
                  href="/disney"
                  className="text-greenVE-700 font-normal hover:text-greenVE-500 text-xs"
                >
                  Disney Destinations Concierge
                </a>
              </div>
              <div>
                <a
                  href="/remate"
                  className="text-greenVE-700 font-normal hover:text-greenVE-500 text-xs"
                >
                  Remate y consulta
                </a>
              </div>
            </div>
            <div className="w-1/2 md:w-1/4">
              <h3 className="text-greenVE-700 font-bold text-sm">
                SMART Hoteles
              </h3>
              <div>
                <a
                  href="/smart/"
                  target="_blank"
                  className="text-greenVE-700 font-normal hover:text-greenVE-500 text-xs"
                >
                  Registrar establecimiento
                </a>
              </div>
              <div>
                <a
                  href="/smart/"
                  target="_blank"
                  className="text-greenVE-700 font-normal hover:text-greenVE-500 text-xs"
                >
                  Administrar establecimiento
                </a>
              </div>
            </div>
            <div className="w-1/2 md:w-1/4">
              <h3 className="text-greenVE-700 font-bold text-sm">
                Descargar APP
              </h3>
              <div>
                <a
                  href="https://apps.apple.com/ec/app/visitaecuador-com/id1385161516"
                  target="_blank"
                  className="text-greenVE-700 font-normal hover:text-greenVE-500 text-xs"
                >
                  Descargar para iOS
                </a>
              </div>
              <div>
                <a
                  href="https://play.google.com/store/apps/details?id=com.visitaEcuador"
                  target="_blank"
                  className="text-greenVE-700 font-normal hover:text-greenVE-500 text-xs"
                >
                  Descargar para Android
                </a>
              </div>
            </div>
            <div className="w-1/2 md:w-1/4">
              <h3 className="text-greenVE-700 font-bold text-sm">
                Contáctanos
              </h3>
              <div>
                <a
                  href="/contacto"
                  className="text-greenVE-700 font-normal hover:text-greenVE-500 text-xs"
                >
                  Formulario de consulta
                </a>
              </div>
            </div>
            <div className="w-1/2 md:w-1/4">
              <h3 className="text-greenVE-700 font-bold text-sm">InfoTour</h3>
              <div>
                <a
                  href="https://www.infotour.app/"
                  target="_blank"
                  className="text-greenVE-700 font-normal hover:text-greenVE-500 text-xs"
                >
                  Ir al sitio web
                </a>
              </div>
            </div>
            <div className="w-1/2 md:w-1/4">
              <h3 className="text-greenVE-700 font-bold text-sm">
                Suscripciones
              </h3>
              <div>
                <a
                  href="/suscripcion"
                  className="text-greenVE-700 font-normal hover:text-greenVE-500 text-xs"
                >
                  Comprar suscripción
                </a>
              </div>
              <div>
                <a
                  href="/activacion"
                  className="text-greenVE-700 font-normal hover:text-greenVE-500 text-xs"
                >
                  Activar suscripción
                </a>
              </div>
            </div>
            <div className="w-1/2 md:w-1/4">
              <h3 className="text-greenVE-700 font-bold text-sm">Legal</h3>
              <div>
                <a
                  href="/politicas-privacidad"
                  className="text-greenVE-700 font-normal hover:text-greenVE-500 text-xs"
                >
                  Políticas de privacidad
                </a>
              </div>
              <div>
                <a
                  href="/terminos-condiciones"
                  className="text-greenVE-700 font-normal hover:text-greenVE-500 text-xs"
                >
                  Términos y condiciones
                </a>
              </div>
            </div>
          </div>
          <div className="flex justify-center pt-3 bg-greenVE-500 w-full absolute left-0 mt-2">
            <LogoFooter />
          </div>
          <div className="flex flex-wrap justify-center md:gap-4 mt-20 gap-3 ">
            <a
              className="bg-greenVE-500 w-6 h-6 rounded-full flex items-center justify-center"
              href="https://www.facebook.com/visitaecuadorcom"
              target="_blank"
            >
              <span className="icon-[iconoir--facebook] text-white h-4 w-4"></span>
            </a>
            <a
              className="bg-greenVE-500 w-6 h-6 rounded-full flex items-center justify-center"
              href="https://www.instagram.com/visitaecuadorcom/"
              target="_blank"
            >
              <span className="icon-[mdi--instagram] text-white h-4 w-4"></span>
            </a>
            <a
              className="bg-greenVE-500 w-6 h-6 rounded-full flex items-center justify-center"
              href="https://walink.co/99db0b"
              target="_blank"
            >
              <span className="icon-[mdi--whatsapp] text-white h-4 w-4"></span>
            </a>
            <a
              className="bg-greenVE-500 w-6 h-6 rounded-full flex items-center justify-center"
              href="https://www.tiktok.com/@visitaecuador.com"
              target="_blank"
            >
              <span className="icon-[ph--tiktok-logo] text-white h-4 w-4"></span>
            </a>
            <a
              className="bg-greenVE-500 w-6 h-6 rounded-full flex items-center justify-center"
              href="https://www.youtube.com/@VisitaEcuador-com"
              target="_blank"
            >
              <span className="icon-[ph--youtube-logo-bold] text-white h-4 w-4"></span>
            </a>
            <a
              className="bg-greenVE-500 w-6 h-6 rounded-full flex items-center justify-center"
              href="https://www.linkedin.com/in/visita-ecuador-44411353"
              target="_blank"
            >
              <span className="icon-[uil--linkedin-alt] h-4 w-4 text-white"></span>
            </a>
            <a
              className="bg-greenVE-500 w-6 h-6 rounded-full flex items-center justify-center"
              href="https://x.com/clubvisita"
              target="_blank"
            >
              <span className="icon-[flowbite--x-company-solid] text-white h-3 w-3"></span>
            </a>
          </div>
          <div className="flex flex-col items-center text-center text-xxs text-gray-500 mt-3">
            <label>
              Copyright © {year} Visitaecuador.com. Todos los derechos
              reservados
            </label>
            <label>
              VisitaEcuador.com forma parte de Aracno Cia. Ltda., Líder nacional
              en viajes online y servicios nacionales.
            </label>
          </div>
        </div>
      </footer>
    )
  );
};

export default Footer;
