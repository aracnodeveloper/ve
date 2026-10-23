import { useLocation, useNavigate } from "react-router-dom";
import Icons from "../../../global/icons";
import { useState, useRef, useEffect } from "react";
import { endRemoteSession, getPermissions, loginRemote, setPermissionsAdmin } from "../../../controllers/suscripcion/suscripcionController";
import { ClickAwayListener } from "@mui/material";
import { Spinner } from "@material-tailwind/react";
import { FacebookAuthProvider, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../../firebase";
import encodePass from "../../../global/encodePass";
import Config from "../../../global/config";
import MarcaPais from "./MarcaPais";
import MobileMenu from "./MobileMenu";
import MobileBottomNav from "./MobileBottomNav";
import ModalCodigoPromocional from "../../login_components/ModalCodigoPromocional";
import { cargarCodigosHeader, etiquetaMarcaActual, etiquetaMarcaDeSesion } from "../../../global/codigoMadre";

const icons = new Icons();

const Navbar = ({ activo, isExposed = false }) => {
  const codigo = localStorage.getItem("codigo");
  const navigate = new useNavigate();
  const location = useLocation();
  const [openProfile, setOpenProfile] = useState(false);
  const [openSuscription, setOpenSuscription] = useState(false);
  const [openConvenios, setOpenConvenios] = useState(false);
  const session = JSON.parse(localStorage.getItem("datos"));
  const nivel = session ? session.data.nivel : "visitante";
  const nombre = session ? session.data.nombre : "";
  const yaGanaste = session ? session.data.permisos.perfil.yaGanaste : false;
  const dashboard = session ? session.data.permisos.perfil.dashboard : false;
  const beta = session ? session.data.permisos.perfil.pruebasBeta : false;
  // Cuenta madre (permiso 544): administra los beneficios de su marca.
  const misBeneficios = session?.data?.permisos?.perfil?.misBeneficios === true;
  const foto = session ? (session.data.fotos ? session.data.fotos.m : "") : "";
  const [isLoadingAdmin, setLoadingAdmin] = useState(false);
  const [isLoadingAdminBeta, setLoadingAdminBeta] = useState(false);
  const [isLoagingLogOut, setIsLoadingLogOut] = useState(false);
  const [isLoadingGoogle, setisLoadingGoogle] = useState(false);
  const [isLoadingFB, setIsLoadingFB] = useState(false);
  // Proveedor elegido esperando el codigo: "google" | "facebook" | null.
  // Mismo orden que la app: primero el codigo, despues la ventana del proveedor.
  const [proveedorPendiente, setProveedorPendiente] = useState(null);
  const gProvider = new GoogleAuthProvider();
  const fProvider = new FacebookAuthProvider();
  const isExposedRoute = location.pathname === "/disney" || isExposed;
  const [openMenu, setOpenMenu] = useState(false);
  const [openMobileProfile, setOpenMobileProfile] = useState(false);
  const [beneficiosOpen, setBeneficiosOpen] = useState(false);
  const [rutasOpen, setRutasOpen] = useState(false);
  const beneficiosRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  // Marca a mostrar en el header (BYD, JETOUR, ...), o null si no aplica.
  // Igual que la app: codigo madre de la suscripcion o codigo propio; los dos
  // vienen en la sesion, sin consultas extra.
  // Las marcas del header se administran en el admin; hasta que lleguen se usa la lista local.
  const [codigoMadre, setCodigoMadre] = useState(() => etiquetaMarcaActual(session));
  // Menú de la marca junto a Beneficios, como en la app. Solo con sesión: los
  // beneficios se resuelven con el token, y un visitante que entró con
  // ?codigo=BYD todavía no tiene de dónde sacarlos. Se recalcula en cada
  // render porque las marcas del servidor llegan después (setCodigoMadre).
  const marcaMenu = nivel !== "visitante" ? etiquetaMarcaDeSesion(session) : null;

  // Solo al montar: `session` se reconstruye en cada render y dispararía el efecto sin parar.
  useEffect(() => {
    let cancelado = false;
    cargarCodigosHeader().then((cambiaron) => {
      if (cancelado || !cambiaron) return;
      setCodigoMadre(etiquetaMarcaActual(JSON.parse(localStorage.getItem("datos"))));
    });
    return () => { cancelado = true; };
  }, []);



  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleClickLogin = () => { navigate("/login"); setOpenMenu(false); };
  const handleClickSuscription = () => { setOpenSuscription(false); setOpenMenu(false); navigate("/suscripcion", { state: { showMenu: true } }); };
  const handleClickNosotros = () => { navigate("/nosotros"); setOpenMenu(false); };
  // Estas tres salen tanto del panel del perfil como del menu, asi que cierran los dos.
  const handleClickProfileSet = () => { navigate("/perfil"); setOpenMobileProfile(false); setOpenMenu(false); };
  const handleClickBookHistory = () => { navigate("/historial"); setOpenMobileProfile(false); setOpenMenu(false); };
  const handleClickFavorites = () => { navigate("/favoritos"); setOpenMobileProfile(false); setOpenMenu(false); };
  const handleClickYaGanaste = () => { navigate("/yaganaste"); };
  const handleClickVinos = () => { navigate("/vinos"); setOpenMenu(false); };
  const handleClickTours = () => { navigate("/Tours"); setOpenMenu(false); };
  const handleClickPromociones = () => { navigate("/Promociones"); setOpenMenu(false); };
  const handleClickDashboard = () => { window.open("/dashboard"); };
  const handleClickPack = () => { navigate("/pack"); };
  const handleClickLogo = () => { navigate("/"); setOpenMenu(false); };

  const handleClickAdministradorBeta = () => {
    if (!isLoadingAdminBeta) {
      setLoadingAdminBeta(true);
      setPermissionsAdmin().then((result) => {
        if (result) { window.open("/administrador"); setLoadingAdminBeta(false); }
      });
    }
  };

  const handleClickAdministrador = () => {
    if (!isLoadingAdmin) {
      setLoadingAdmin(true);
      getPermissions(session.data.id_usuario).then((result) => {
        if (result) { window.open("/ve/administrador"); setLoadingAdmin(false); }
      });
    }
  };

  const handleClickProfile = () => { setOpenProfile(!openProfile); };
  const handleClickMobileProfile = () => {
    setOpenMenu(false);
    if (nivel == "visitante") { navigate("/login"); }
    else { setOpenMobileProfile(!openMobileProfile); }
  };
  const handleClickSuscribing = () => { setOpenConvenios(false); setOpenSuscription(!openSuscription); };
  const handleClickLogOut = () => {
    setIsLoadingLogOut(true);
    try {
      endRemoteSession().then((result) => {
        setIsLoadingLogOut(false);
        if (result) { window.location.reload(); }
      });
    } catch (error) { console.error("Error:", error); }
  };

  const handleClickDisney = () => { navigate("/disney"); setOpenMenu(false); };
  const handleClickVisas = () => { navigate("/visas-concierge"); setOpenMenu(false); };
  const handleClickInicio = () => { navigate("/"); setOpenMenu(false); };
  const handleClickInfotour = () => { window.open("https://www.infotour.app/"); setOpenMenu(false); };
  const handleClickContactanos = () => { navigate("/contacto"); setOpenMenu(false); };
  const handleClickPuntosCarga = () => { navigate("/puntos-carga"); setOpenMenu(false); };
  const handleClickMarca = () => { navigate("/marca"); setOpenMenu(false); };
  const handleClickMisBeneficios = () => { navigate("/mis-beneficios"); setOpenProfile(false); setOpenMobileProfile(false); setOpenMenu(false); };
  const handleClickMenu = () => { setOpenConvenios(false); setOpenMobileProfile(false); setOpenMenu(!openMenu); };

  /** Arma el params de loginpost desde el usuario de Firebase. */
  const construirParams = (user, metodo, idMetodo) => {
    const random = () => Math.floor(Math.random() * 100);
    const randomStr = Array.from({ length: 7 }, () => random()).join("");
    const username = user.displayName ?? "usuario" + randomStr.substring(0, 6);
    const email = user.email ?? "";
    if (email.trim() === "") return null;
    return { id: user.uid ?? randomStr, pass: encodePass(email), servicio: Config.SERVICIO, metodo, username, nombre: username, email, id_servicio: Config.IDSERVICIO, id_metodo: idMetodo };
  };

  /**
   * Continua el login con el codigo que devolvio el modal ("" si se omitio).
   * signInWithPopup se llama dentro del click del boton del modal para no
   * perder el gesto del usuario.
   */
  const continuarConProveedor = async (codigo) => {
    const esGoogle = proveedorPendiente === "google";
    const provider = esGoogle ? gProvider : fProvider;
    const metodo = esGoogle ? Config.METODO_EX_GO : Config.METODO_EX_FB;
    const idMetodo = esGoogle ? Config.IDMETODO_EX_GO : Config.IDMETODO_EX_FB;
    const apagarSpinner = esGoogle ? setisLoadingGoogle : setIsLoadingFB;

    setProveedorPendiente(null);
    apagarSpinner(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const params = construirParams(result.user, metodo, idMetodo);
      if (!params) { apagarSpinner(false); alert("Correo inválido, intente con otra cuenta"); return; }
      if (codigo) params.cp = codigo;

      const res = await loginRemote(params);
      if (res === true) { window.location.reload(); return; }
      apagarSpinner(false);
      alert(typeof res === "string" ? res : "Ha ocurrido un error, intente nuevamente");
    } catch (error) {
      apagarSpinner(false);
      const code = error?.code || "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
      console.error("Fallo el inicio de sesion social:", code, error?.message);
      alert(code === "auth/popup-blocked"
        ? "Tu navegador bloqueó la ventana de inicio de sesión. Habilita las ventanas emergentes para este sitio."
        : "No se pudo abrir el inicio de sesión. Intenta nuevamente.");
    }
  };

  const handleClickGoogle = () => setProveedorPendiente("google");
  const handleClickFacebook = () => { if (!isLoadingFB) setProveedorPendiente("facebook"); };

  const isSmall = window.innerWidth < 470;
  const router = location.pathname === "/vinos" || location.pathname === "/Tours" || location.pathname === "/Promociones";
  const route = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 bg-[#8AB600]">
      <ModalCodigoPromocional
        abierto={proveedorPendiente !== null}
        proveedor={proveedorPendiente}
        onConfirmar={continuarConProveedor}
        onCancelar={() => setProveedorPendiente(null)}
      />

      <div className="bg-[#8AB600] flex justify-center lg:justify-between xl:justify-between md:justify-center xs:justify-center sm:justify-center xl:px-28 lg:px-5 flex-wrap sm:flex-row">
        <a className="p-2" href="/"><img src="https://visitaecuador.com/img/web/ve_logo.svg" title="nosotros" style={{ width: "70px", height: "auto" }} /></a>
        {codigoMadre && (
          <div className="flex flex-1 items-center justify-center px-2">
            <span
              className="rounded-[10px]  px-3.5 py-1.5 leading-none whitespace-nowrap text-white font-extrabold tracking-[0.08em] text-sm sm:text-lg "
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
            >
              {codigoMadre}
            </span>
          </div>
        )}
        {!isExposedRoute && (<div className="flex flex-center items-center gap-4 py-2">
          <div className="flex sm:justify-end gap-3 align-start py-3 lg:px-6 p-2 ">
            {!codigo && <MarcaPais />}
            <div className={`mt-1 flex flex-row gap-2 ${isSmall ? "hidden" : ""} `}>
              <a className="w-6 h-6 rounded-full flex items-center justify-center" href="https://www.facebook.com/visitaecuadorcom" target="_blank"><span className="icon-[iconoir--facebook] text-white h-4 w-4"></span></a>
              <a className="w-6 h-6 rounded-full flex items-center justify-center" href="https://www.instagram.com/visitaecuadorcom/" target="_blank"><span className="icon-[mdi--instagram] text-white h-4 w-4"></span></a>
              <a className="w-6 h-6 rounded-full flex items-center justify-center" href="https://wa.me/593981850436" target="_blank"><span className="icon-[mdi--whatsapp] text-white h-4 w-4"></span></a>
              <a className="w-6 h-6 rounded-full flex items-center justify-center" href="https://www.tiktok.com/@visitaecuador.com" target="_blank"><span className="icon-[ph--tiktok-logo] text-white h-4 w-4"></span></a>
              <a className="w-6 h-6 rounded-full flex items-center justify-center" href="https://www.youtube.com/@VisitaEcuador-com" target="_blank"><span className="icon-[ph--youtube-logo-bold] text-white h-4 w-4"></span></a>
              <a className="w-6 h-6 rounded-full flex items-center justify-center" href="https://www.linkedin.com/in/visita-ecuador-44411353" target="_blank"><span className="icon-[uil--linkedin-alt] h-4 w-4 text-white"></span></a>
              <a className="w-6 h-6 rounded-full flex items-center justify-center" href="https://x.com/clubvisita" target="_blank"><span className="icon-[flowbite--x-company-solid] text-white h-3 w-3"></span></a>
            </div>
          </div>

          <div className="flex gap-2 justify-end sm:justify-start items-center">
            <div className="sr-only sm:not-sr-only md:flex gap-2">
              <a className="flex gap-1 text-white border-white rounded-md border-2 px-3 py-1 text-xs hover:border-gray-300 hover:text-gray-300" href="/smart/">Registrar Establecimiento</a>
              <div className="flex justify-center relative">
                <button className="flex gap-1 text-greenVE-600 bg-white rounded-md px-5 py-1 text-xs hover:border-gray-300 hover:text-gray-500" onClick={handleClickSuscribing}>Suscribirse</button>
                {openSuscription && (
                  <ClickAwayListener onClickAway={handleClickSuscribing}>
                    <div className="absolute z-50 bg-white flex flex-col items-start py-2 top-12 gap-2 shadow-2xl rounded-md">
                      <button className="hover:bg-greenVE-200 px-4 text-xs py-1 w-full text-start flex items-center gap-2" onClick={handleClickSuscription}>
                        <div dangerouslySetInnerHTML={{ __html: icons.Data.Buy }} />Comprar suscripción
                      </button>
                      <button className="hover:bg-greenVE-200 px-4 text-xs py-1 w-full text-start flex items-center gap-2" onClick={handleClickPack}>
                        <div dangerouslySetInnerHTML={{ __html: icons.Data.Gift }} />Activar VisitaPack
                      </button>
                      <label className="text-xs font-medium text-center w-full">Prueba gratis con:</label>
                      <div className="flex justify-center items-center w-full gap-2 pb-3">
                        {isLoadingGoogle ? <Spinner color="blue" className="text-greenVE-300" /> : (
                          <a dangerouslySetInnerHTML={{ __html: icons.Data["LoginGoogleSM"] }} className="border p-2 rounded-md hover:border-greenVE-500" onClick={() => handleClickGoogle()} />
                        )}
                        {isLoadingFB ? <Spinner color="blue" className="text-greenVE-300" /> : (
                          <a dangerouslySetInnerHTML={{ __html: icons.Data["LoginFacebookSM"] }} className="border p-2 rounded-md hover:border-greenVE-500" onClick={() => handleClickFacebook()} />
                        )}
                      </div>
                    </div>
                  </ClickAwayListener>
                )}
              </div>
              {nivel === "visitante" && (
                <button className="flex gap-1 text-greenVE-600 bg-white rounded-md px-3 py-1 text-xs hover:border-gray-300 hover:text-gray-500" onClick={() => (activo != 6 ? handleClickLogin() : {})}>Iniciar Sesión</button>
              )}
            </div>
            <div className="flex md:hidden gap-2 ml-auto items-center">
              {nivel !== "visitante" && <img src={foto} onClick={handleClickMobileProfile} className="rounded-full h-8 w-8 border-2 border-white cursor-pointer" alt="Profile" />}
              <button onClick={handleClickMenu} className="text-white p-2" aria-label="Menú">
                {openMenu
                  ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                }
              </button>
            </div>
            <div className="hidden md:flex items-end justify-end">
              {foto !== "" && nivel !== "visitante" && (
                <div className="flex gap-2 items-center cursor-pointer hover:bg-white hover:bg-opacity-20 hover:rounded-md p-1" onClick={() => handleClickProfile()}>
                  <img src={foto} className="rounded-full h-10 w-10 border-2 hidden md:block" />
                  <div className="flex flex-col">
                    <label className="font-semibold text-white cursor-pointer">{nombre}</label>
                    <label className="capitalize text-xs text-white cursor-pointer">{nivel}</label>
                  </div>
                </div>
              )}
              {nivel !== "visitante" && openProfile && (
                <ClickAwayListener onClickAway={handleClickProfile}>
                  <div className="md:absolute z-50 bg-white flex flex-col items-start py-2 top-14 gap-2 shadow-2xl rounded-md">
                    <button className="hover:bg-greenVE-200 px-4 text-xs py-1 w-full text-start flex items-center gap-2" onClick={handleClickProfileSet}><div dangerouslySetInnerHTML={{ __html: icons.Data.Account }} /> Mi perfil</button>
                    <button onClick={handleClickBookHistory} className="hover:bg-greenVE-200 w-full px-4 text-xs py-1 text-start flex items-center gap-2"><div dangerouslySetInnerHTML={{ __html: icons.Data.HistorialReservas }} />Historial de reservas</button>
                    <button onClick={handleClickFavorites} className="hover:bg-greenVE-200 w-full px-4 text-xs py-1 text-start flex items-center gap-2"><div dangerouslySetInnerHTML={{ __html: icons.Data.Favorito }} />Favoritos</button>
                    <button className="hover:bg-greenVE-200 px-4 text-xs py-1 w-full text-start flex items-center gap-2" onClick={handleClickAdministrador}><div dangerouslySetInnerHTML={{ __html: icons.Data.Administrador }} />Administrador{isLoadingAdmin && <Spinner className="h-4 w-4" color="white" />}</button>
                    {beta && <button className="hover:bg-greenVE-200 px-4 text-xs py-1 w-full text-start flex items-center gap-2" onClick={handleClickAdministradorBeta}><div dangerouslySetInnerHTML={{ __html: icons.Data.Administrador }} />Administrador (Beta){isLoadingAdminBeta && <Spinner className="h-4 w-4" color="white" />}</button>}
                    {yaGanaste && <button className="hover:bg-greenVE-200 px-4 text-xs py-1 w-full text-start flex items-center gap-2" onClick={handleClickYaGanaste}><div dangerouslySetInnerHTML={{ __html: icons.Data.CrearUsuario }} />Crear Suscripción</button>}
                    {misBeneficios && <button onClick={handleClickMisBeneficios} className="hover:bg-greenVE-200 w-full px-4 text-xs py-1 text-start flex items-center gap-2"><span className="icon-[ph--tag-bold] h-4 w-4 text-gray-700"></span>Mis beneficios</button>}
                    {dashboard && <button onClick={() => handleClickDashboard()} className="hover:bg-greenVE-200 w-full px-4 text-xs py-1 flex items-center gap-2"><div dangerouslySetInnerHTML={{ __html: icons.Data.Dashboard }} />Dashboard</button>}
                    <button onClick={() => handleClickLogOut()} className="hover:bg-greenVE-200 w-full px-4 text-xs py-1 flex items-center gap-2"><div dangerouslySetInnerHTML={{ __html: icons.Data.Logout }} />Cerrar sesión{isLoagingLogOut && <Spinner className="h-4 w-4" color="white" />}</button>
                  </div>
                </ClickAwayListener>
              )}
            </div>
          </div>

        </div>)}
      </div>


      <div className={`flex mx-auto w-full py-2 px-3 sm:px-6 lg:px-8 ${router && !scrolled ? "hidden" : ""} ${route && !scrolled ? "hidden" : ""} ${isExposedRoute ? "-mt-14" : ""}`}>
        <div className={`flex flex-col align-center align-middle items-center ${codigo ? "w-full" : "w-10/12"} justify-center`}>
          <div className="relative z-40 w-full flex justify-center">
            <div className="flex w-full max-w-7xl items-center justify-between px-4">

              {(activo > 0 || location.pathname === "/suscripcion" || location.pathname.includes("/busqueda")) && (
                <div className="hidden md:flex gap-0.5 items-end mt-4 sm:mt-0 flex-wrap">
                  {/* Hospedaje */}
                  <a
                    href="https://visitaecuador.com/"
                    onClick={(e) => { e.preventDefault(); handleClickInicio(); }}
                    className={`flex w-fit gap-2 ${activo == 1 ? "bg-white text-gray-800" : "bg-white/20 text-white hover:bg-white/40"} rounded-t-lg px-4 py-2 text-sm items-center transition-all`}
                  >
                    <img src="https://visitaecuador.com/img/web/homeMenu.svg" style={{ height: "20px" }} />
                    <label className="hidden md:flex cursor-pointer font-medium">Hospedaje</label>
                  </a>

                  {/* InfoTour */}
                  <a
                    href="https://www.infotour.app/"
                    onClick={(e) => { e.preventDefault(); handleClickInfotour(); }}
                    className={`flex gap-2 ${activo == 2 ? "bg-white text-gray-800" : "bg-white/20 text-white hover:bg-white/40"} rounded-t-lg px-4 py-2 text-sm items-center transition-all`}
                  >
                    <img src="https://visitaecuador.com/img/web/infotourMenu.svg" style={{ height: "20px" }} />
                    <label className="hidden md:flex cursor-pointer font-medium">InfoTour</label>
                  </a>

                  {/* Disney */}
                  <a
                    href="https://visitaecuador.com/disney"
                    onClick={(e) => { e.preventDefault(); handleClickDisney(); }}
                    className={`flex gap-2 ${activo == 3 ? "bg-white text-gray-800" : "bg-white/20 text-white hover:bg-white/40"} rounded-t-lg px-4 py-2 text-sm items-center transition-all`}
                  >
                    <img src="https://visitaecuador.com/img/web/disney.png" style={{ height: "20px" }} />
                    <label className="hidden md:flex cursor-pointer font-medium">Magic Concierge</label>
                  </a>

                  {/* Beneficios con dropdown */}
                  <div className="relative" ref={beneficiosRef}>
                    <button
                      onClick={() => setBeneficiosOpen((prev) => !prev)}
                      className={`flex gap-2 ${activo == 4 ? "bg-white text-gray-800" : "bg-white/20 text-white hover:bg-white/40"} rounded-t-lg px-4 py-2 text-sm items-center transition-all cursor-pointer`}
                    >
                      <div className="rounded-full bg-white p-0.5" style={{ height: "22px", width: "22px" }}>
                        <img src="https://visitaecuador.com/img/web/Beneficios-Icon01_VE_1-8.png" className="" style={{ height: "100%", width: "100%" }} />
                      </div>
                      <span className="hidden md:flex font-medium">Beneficios</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-3 w-3 transition-transform duration-200 ${beneficiosOpen ? "rotate-180" : ""}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {beneficiosOpen && (
                      <div className="absolute left-0 top-full mt-1 z-[100] bg-white rounded-lg shadow-lg border border-gray-100 min-w-[160px]">
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
                                onClick={() => { handleClickVinos(); setBeneficiosOpen(false); setRutasOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#ACCD7B] hover:text-white transition-colors font-medium"
                              >
                                Ruta del vino
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => { handleClickTours(); setBeneficiosOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#ACCD7B] hover:text-white transition-colors font-medium"
                        >
                          Tours
                        </button>
                        <button
                          onClick={() => { handleClickPromociones(); setBeneficiosOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#ACCD7B] hover:text-white transition-colors font-medium"
                        >
                          Promociones
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Marca del usuario (BYD, JETOUR...), al lado de Beneficios */}
                  {marcaMenu && (
                    <a
                      href="/marca"
                      onClick={(e) => { e.preventDefault(); handleClickMarca(); }}
                      className={`flex gap-2 ${activo == 9 ? "bg-white text-gray-800" : "bg-white/20 text-white hover:bg-white/40"} rounded-t-lg px-4 py-2 text-sm items-center transition-all`}
                    >
                      <div className="rounded-full bg-white flex items-center justify-center" style={{ height: "22px", width: "22px" }}>
                        <span className="icon-[ph--storefront-fill] h-3.5 w-3.5 text-greenVE-600"></span>
                      </div>
                      <label className="hidden md:flex cursor-pointer font-medium">{marcaMenu}</label>
                    </a>
                  )}

                  {/* Visas 
                  <a
                    href="https://visitaecuador.com/visas-concierge"
                    onClick={(e) => { e.preventDefault(); handleClickVisas(); }}
                    className={`flex gap-2 ${activo == 5 ? "bg-white text-gray-800" : "bg-white/20 text-white hover:bg-white/40"} rounded-t-lg px-4 py-2 text-sm items-center transition-all`}
                  >
                    <div className="rounded-full bg-white p-0.5" style={{ height: "22px", width: "22px" }}>
                      <img src="https://visitaecuador.com/img/web/visas-concierge.jpeg" className="rounded-full" style={{ height: "100%", width: "100%" }} />
                    </div>
                    <label className="hidden md:flex cursor-pointer font-medium">Visas</label>
                  </a>
*/}
                  {/* Nosotros 
                  <a
                    href="https://visitaecuador.com/nosotros"
                    onClick={(e) => { e.preventDefault(); handleClickNosotros(); }}
                    className={`flex gap-2 ${activo == 6 ? "bg-white text-gray-800" : "bg-white/20 text-white hover:bg-white/40"} rounded-t-lg px-4 py-2 text-sm items-center transition-all`}
                  >
                    <div className="rounded-full bg-white " style={{ height: "22px", width: "22px" }}>
                      <img src="https://visitaecuador.com/img/web/nosotrosMenu.svg" className="rounded-full" style={{ height: "100%", width: "100%" }} />
                    </div>
                    <label className="hidden md:flex cursor-pointer font-medium">Nosotros</label>
                  </a>
*/}
                  {/* Contacto */}
                  <a
                    href="https://visitaecuador.com/contacto"
                    onClick={(e) => { e.preventDefault(); handleClickContactanos(); }}
                    className={`flex gap-1 ${activo == 7 ? "bg-white text-gray-800" : "bg-white/20 text-white hover:bg-white/40"} rounded-t-lg px-4 py-2 text-sm items-center transition-all`}
                  >
                    <div className="rounded-full bg-white p-0.5" style={{ height: "22px", width: "22px" }}>
                      <img src="https://visitaecuador.com/img/web/contacto.svg" className="rounded-full" style={{ height: "100%", width: "100%" }} />
                    </div>
                    <label className="hidden md:flex cursor-pointer">Contactanos</label>
                  </a>

                  {/* Puntos de carga */}
                  <a
                    href="https://visitaecuador.com/puntos-carga"
                    onClick={(e) => { e.preventDefault(); handleClickPuntosCarga(); }}
                    className={`flex gap-1 ${activo == 8 ? "bg-white text-gray-800" : "bg-white/20 text-white hover:bg-white/40"} rounded-t-lg px-4 py-2 text-sm items-center transition-all`}
                  >
                    <div className="rounded-full bg-white flex items-center justify-center" style={{ height: "22px", width: "22px" }}>
                      <span className="icon-[ph--map-pin-fill] h-3.5 w-3.5 text-greenVE-600"></span>
                    </div>
                    <label className="hidden md:flex cursor-pointer">Puntos de Carga</label>
                  </a>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobileMenu
        openMenu={openMenu}
        openMobileProfile={openMobileProfile}
        nivel={nivel}
        nombre={nombre}
        foto={foto}
        beta={beta}
        isLoadingGoogle={isLoadingGoogle}
        isLoadingFB={isLoadingFB}
        isLoadingAdmin={isLoadingAdmin}
        isLoadingAdminBeta={isLoadingAdminBeta}
        icons={icons}
        handleClickMenu={handleClickMenu}
        handleClickLogo={handleClickLogo}
        handleClickLogin={handleClickLogin}
        handleClickSuscription={handleClickSuscription}
        handleClickGoogle={handleClickGoogle}
        handleClickFacebook={handleClickFacebook}
        handleClickMobileProfile={handleClickMobileProfile}
        setOpenMobileProfile={setOpenMobileProfile}
        handleClickProfileSet={handleClickProfileSet}
        handleClickAdministrador={handleClickAdministrador}
        handleClickAdministradorBeta={handleClickAdministradorBeta}
        handleClickBookHistory={handleClickBookHistory}
        handleClickFavorites={handleClickFavorites}
        handleClickLogOut={handleClickLogOut}
        misBeneficios={misBeneficios}
        handleClickMisBeneficios={handleClickMisBeneficios}
      />

      <MobileBottomNav
        activo={activo}
        onClickInicio={handleClickInicio}
        onClickDisney={handleClickDisney}
        onClickVinos={handleClickVinos}
        onClickTours={handleClickTours}
        onClickPuntosCarga={handleClickPuntosCarga}
        onClickContactanos={handleClickContactanos}
        marca={marcaMenu}
        onClickMarca={handleClickMarca}
      />
    </header>
  );
};

export default Navbar;