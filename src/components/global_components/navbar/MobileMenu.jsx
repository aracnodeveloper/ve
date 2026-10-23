import { Spinner } from "@material-tailwind/react";
import MarcaPais from "./MarcaPais";

const MobileMenu = ({
  openMenu,
  openMobileProfile,
  nivel,
  nombre,
  foto,
  beta,
  isLoadingGoogle,
  isLoadingFB,
  isLoadingAdmin,
  isLoadingAdminBeta,
  icons,
  handleClickMenu,
  handleClickLogo,
  handleClickLogin,
  handleClickSuscription,
  handleClickGoogle,
  handleClickFacebook,
  handleClickMobileProfile,
  setOpenMobileProfile,
  handleClickProfileSet,
  handleClickAdministrador,
  handleClickAdministradorBeta,
  handleClickBookHistory,
  handleClickFavorites,
  handleClickLogOut,
  misBeneficios,
  handleClickMisBeneficios,
}) => {
  // Opciones de cuenta: salen en el panel del perfil y tambien en el del menu de
  // tres lineas, para que no haya que adivinar cual de los dos las tiene.
  const opcionesCuenta = (
    <>
      <div onClick={handleClickProfileSet} className="flex gap-3 items-center cursor-pointer hover:bg-greenVE-50 p-3 rounded-md">
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M16.5 6a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0zM18 6A6 6 0 1 0 6 6a6 6 0 0 0 12 0zM3 23.25a9 9 0 1 1 18 0 .75.75 0 0 0 1.5 0c0-5.799-4.701-10.5-10.5-10.5S1.5 17.451 1.5 23.25a.75.75 0 0 0 1.5 0z" />
        </svg>
        <button className="text-sm">Mi perfil</button>
      </div>

      <button
        className="py-2 w-full text-start flex items-center gap-3 hover:bg-greenVE-50 px-3 rounded-md"
        onClick={handleClickAdministrador}
      >
        <div dangerouslySetInnerHTML={{ __html: icons.Data.Administrador }} />
        <span className="text-sm">Administrador</span>
        {isLoadingAdmin && <Spinner className="h-4 w-4" color="white" />}
      </button>

      {beta && (
        <button
          className="py-2 w-full text-start flex items-center gap-3 hover:bg-greenVE-50 px-3 rounded-md"
          onClick={handleClickAdministradorBeta}
        >
          <div dangerouslySetInnerHTML={{ __html: icons.Data.Administrador }} />
          <span className="text-sm">Administrador (beta)</span>
          {isLoadingAdminBeta && <Spinner className="h-4 w-4" color="white" />}
        </button>
      )}

      <div onClick={handleClickBookHistory} className="flex gap-3 items-center cursor-pointer hover:bg-greenVE-50 p-3 rounded-md">
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M22.5 14.249v4.5a2.25 2.25 0 0 1-2.25 2.25H3.75a2.25 2.25 0 0 1-2.25-2.25v-9a2.25 2.25 0 0 1 2.25-2.25h16.5a2.25 2.25 0 0 1 2.25 2.25v4.5zm1.5 0v-4.5a3.75 3.75 0 0 0-3.75-3.75H3.75A3.75 3.75 0 0 0 0 9.749v9a3.75 3.75 0 0 0 3.75 3.75h16.5a3.75 3.75 0 0 0 3.75-3.75v-4.5zm-18-7.5v15a.75.75 0 0 0 1.5 0v-15a.75.75 0 0 0-1.5 0zm10.5 0v15a.75.75 0 0 0 1.5 0v-15a.75.75 0 0 0-1.5 0zm0 0v-3a2.25 2.25 0 0 0-2.25-2.25h-4.5a2.25 2.25 0 0 0-2.25 2.25v3a.75.75 0 0 0 1.5 0v-3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v3a.75.75 0 0 0 1.5 0z" />
        </svg>
        <button className="text-sm">Historial de Reservas</button>
      </div>

      <div onClick={handleClickFavorites} className="flex gap-3 items-center cursor-pointer hover:bg-greenVE-50 p-3 rounded-md">
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12.541 21.325l-9.588-10a4.923 4.923 0 1 1 6.95-6.976l1.567 1.566a.75.75 0 0 0 1.06 0l1.566-1.566a4.923 4.923 0 0 1 6.963 6.962l-9.6 10.014h1.082zm-1.082 1.038a.75.75 0 0 0 1.082 0l9.59-10.003a6.418 6.418 0 0 0-.012-9.07 6.423 6.423 0 0 0-9.083-.001L11.47 4.854h1.06l-1.566-1.566a6.423 6.423 0 1 0-9.082 9.086l9.577 9.99z" />
        </svg>
        <button className="text-sm">Mis Favoritos</button>
      </div>

      {/* Cuenta madre: crea y edita los beneficios que ven sus suscriptores */}
      {misBeneficios && (
        <div onClick={handleClickMisBeneficios} className="flex gap-3 items-center cursor-pointer hover:bg-greenVE-50 p-3 rounded-md">
          <span className="icon-[ph--tag-bold] h-5 w-5 text-black"></span>
          <button className="text-sm">Mis beneficios</button>
        </div>
      )}

      <div onClick={handleClickLogOut} className="flex gap-3 items-center cursor-pointer hover:bg-greenVE-50 p-3 rounded-md">
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
          <path d="M1.19 66.83l20 20a4.002 4.002 0 1 0 5.66-5.66L13.67 68H88a4 4 0 0 0 0-8H13.67l13.18-13.17a4.002 4.002 0 1 0-5.66-5.66l-20 20c-.183.186-.35.387-.5.6 0 0 0 .11-.08.16a3 3 0 0 0-.28.53 2.25 2.25 0 0 0-.08.24 3 3 0 0 0-.15.51 3.94 3.94 0 0 0 0 1.58c.036.174.086.344.15.51.022.081.049.162.08.24.076.182.17.357.28.52 0 .06.05.11.08.16.15.216.317.42.5.61zm31.13 35c20.876 19.722 53.787 18.787 73.509-2.089 14.874-15.743 18.432-39.058 8.931-58.521-10.77-22.12-42-37.41-69.52-24a52 52 0 0 0-12.91 8.93 4.004 4.004 0 0 1-5.49-5.83 60.002 60.002 0 0 1 14.9-10.29C67.26-2.37 106.48 6 122 37.74c14.519 29.787 2.142 65.704-27.645 80.223-22.44 10.938-49.308 6.839-67.465-10.293a4 4 0 0 1 5.48-5.82z" />
        </svg>
        <button className="text-sm">Cerrar sesión</button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Overlay */}
      {openMenu && (
        <div className="md:hidden fixed z-50 w-full h-full bg-white top-0 left-0 overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-greenVE-200">
            <img
              src="https://visitaecuador.com/img/web/ve_logo_green.svg"
              onClick={handleClickLogo}
              className="cursor-pointer w-24 h-auto"
              alt="Logo"
            />
            <button
              onClick={handleClickMenu}
              className="text-greenVE-500 text-3xl p-2"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col p-4 gap-4 text-greenVE-500">
    
            {/* Suscribirse sale siempre, igual que en la barra de escritorio; iniciar
                sesion solo tiene sentido para quien no la ha iniciado. */}
            <div className="border-t border-greenVE-200 pt-4 mt-4">
              {nivel === "visitante" && (
                <button
                  onClick={handleClickLogin}
                  className="w-full text-greenVE-500 border-2 border-greenVE-500 rounded-full px-4 py-2 mb-2 text-sm font-medium"
                >
                  Iniciar Sesión
                </button>
              )}
              <button
                onClick={handleClickSuscription}
                className="w-full bg-greenVE-500 text-white rounded-full px-4 py-2 text-sm font-medium"
              >
                Suscribirse
              </button>
            </div>

            {nivel === "visitante" && (
              <>
                <div className="flex flex-col gap-3 border-t border-greenVE-200 pt-4">
                  <p className="text-xs text-center text-gray-600 font-medium">Prueba gratis con:</p>
                  <div
                    onClick={handleClickGoogle}
                    className="flex gap-3 items-center justify-center border-2 border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                  >
                    {isLoadingGoogle ? (
                      <Spinner color="blue" className="h-5 w-5" />
                    ) : (
                      <>
                        <svg className="h-5 w-5" viewBox="0 0 48 48">
                          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                          <g id="SVGRepo_iconCarrier">
                            <path
                              fill="#FFC107"
                              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                            ></path>
                            <path
                              fill="#FF3D00"
                              d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
                            ></path>
                            <path
                              fill="#4CAF50"
                              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                            ></path>
                            <path
                              fill="#1976D2"
                              d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                            ></path>
                          </g>
                        </svg>
                        <span className="text-sm">Probar grátis con Google</span>
                      </>
                    )}
                  </div>

                  <div
                    onClick={handleClickFacebook}
                    className="flex gap-3 items-center justify-center border-2 border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                  >
                    {isLoadingFB ? (
                      <Spinner color="blue" className="h-5 w-5" />
                    ) : (
                      <>
                        <svg className="h-5 w-5" viewBox="0 0 266.895 266.895" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                          <g id="SVGRepo_iconCarrier">
                            <path d="M252.164 266.895c8.134 0 14.729-6.596 14.729-14.73V14.73c0-8.137-6.596-14.73-14.729-14.73H14.73C6.593 0 0 6.594 0 14.73v237.434c0 8.135 6.593 14.73 14.73 14.73h237.434z" fill="#485a96"></path>
                            <path d="M184.152 266.895V163.539h34.692l5.194-40.28h-39.887V97.542c0-11.662 3.238-19.609 19.962-19.609l21.329-.01V41.897c-3.689-.49-16.351-1.587-31.08-1.587-30.753 0-51.807 18.771-51.807 53.244v29.705h-34.781v40.28h34.781v103.355h41.597z" fill="#ffffff"></path>
                          </g>
                        </svg>
                        <span className="text-sm">Probar grátis con Facebook</span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {nivel !== "visitante" && opcionesCuenta}

            {/* Registrar alojamiento tambien esta siempre en el escritorio */}
            <a href="/smart/" className="flex gap-3 items-center justify-center border-2 border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" id="Building-2--Streamline-Core">
                <g id="building-2--real-home-tower-building-house-estate">
                  <path id="Vector" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" d="M8.5 13.5h-8V4l4 -3.5 4 3.5v9.5Z" strokeWidth="1"></path>
                  <path id="Vector_2" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" d="M8.5 13.5h5v-7h-5" strokeWidth="1"></path>
                  <path id="Vector_3" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" d="M4.5 13.5v-2" strokeWidth="1"></path>
                  <path id="Vector_4" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" d="M3 8.5h3" strokeWidth="1"></path>
                  <path id="Vector_5" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" d="M3 5.5h3" strokeWidth="1"></path>
                </g>
              </svg>
              <span className="text-sm">Registrar alojamiento</span>
            </a>

            <div className="flex justify-center mt-4">
              <MarcaPais />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Profile Menu */}
      {openMobileProfile && (
        <div className="md:hidden fixed z-50 w-full h-full bg-white top-0 left-0">
          <div className="flex items-center justify-end p-4 text-3xl">
            <button onClick={() => setOpenMobileProfile(false)} className="text-greenVE-500">×</button>
          </div>
          <div className="flex flex-col px-4 gap-6 text-greenVE-500">
            <div className="flex gap-3 items-center cursor-pointer hover:bg-greenVE-50 hover:rounded-md p-2">
              <img
                src={foto}
                className="rounded-full h-12 w-12 border-2 border-greenVE-600"
                alt="Profile"
              />
              <div className="flex flex-col">
                <label className="font-semibold text-black cursor-pointer text-sm">{nombre}</label>
                <label className="capitalize text-xs text-greenVE-600 cursor-pointer">{nivel}</label>
              </div>
            </div>

            {opcionesCuenta}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;