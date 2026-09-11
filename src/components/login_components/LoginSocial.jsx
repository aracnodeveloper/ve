import { useEffect, useState } from "react";
import Icons from "../../global/icons";
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { auth } from '../../firebase'
import encodePass from "../../global/encodePass";
import Config from "../../global/config";
import { loginRemote } from "../../controllers/suscripcion/suscripcionController";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@material-tailwind/react";
import ModalCodigoPromocional from "./ModalCodigoPromocional";

const icons = new Icons

const LoginSocial = () => {
    const gProvider = new GoogleAuthProvider();
    const fProvider = new FacebookAuthProvider();
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // Código que viaja en el link compartido: /login/?cp=XXXX
    const codigoDelLink = (searchParams.get("cp") || searchParams.get("codigo") || "").trim()

    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingFB, setIsLoadingFB] = useState(false)
    const [errorPopup, setErrorPopup] = useState(null)

    // Proveedor elegido, esperando el código: "google" | "facebook" | null.
    // Mismo orden que la app: primero se pide el código y recién despues se
    // abre la ventana de Google/Facebook.
    const [proveedorPendiente, setProveedorPendiente] = useState(null)

    const pedirCodigo = (proveedor) => {
        setErrorPopup(null);
        setProveedorPendiente(proveedor);
    }

    // Si llegó por un link de registro con código, se abre directo el modal de
    // Google con el código puesto: solo le queda continuar. Puede cancelar y
    // elegir Facebook, que conserva el código escrito.
    useEffect(() => {
        if (codigoDelLink) setProveedorPendiente("google");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /** Arma el params de loginpost desde el usuario de Firebase. */
    const construirParams = (user, metodo, idMetodo) => {
        const random = () => Math.floor(Math.random() * 100);
        const randomStr = Array.from({ length: 7 }, () => random()).join('');
        const username = user.displayName ?? ('usuario' + randomStr.substring(0, 6));
        const email = user.email ?? '';
        if (email.trim() === '') return null;
        return {
            "id": user.uid ?? randomStr,
            "pass": encodePass(email),
            "servicio": Config.SERVICIO,
            "metodo": metodo,
            "username": username,
            "nombre": username,
            "email": email,
            "id_servicio": Config.IDSERVICIO,
            "id_metodo": idMetodo,
        };
    }

    /**
     * El popup de Firebase fallando en silencio era indistinguible de "no pasa
     * nada al hacer clic": el catch original solo llamaba a credentialFromError,
     * que no muestra ni registra nada. Cerrar la ventana a proposito no es error.
     */
    const manejarError = (error, apagarSpinner) => {
        apagarSpinner(false);
        const code = error?.code || "";
        if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
        console.error("Fallo el inicio de sesion social:", code, error?.message);
        setErrorPopup(
            code === "auth/popup-blocked"
                ? "Tu navegador bloqueó la ventana de inicio de sesión. Habilita las ventanas emergentes para este sitio e intenta de nuevo."
                : "No se pudo abrir el inicio de sesión. Intenta nuevamente."
        );
    }

    /**
     * Continúa el login con el código que devolvió el modal ("" si se omitió).
     *
     * signInWithPopup se llama aquí, dentro del click del botón del modal, para
     * no perder el gesto del usuario: si se omite el código no hay ningún await
     * previo, y si se ingresó uno, la validación es una sola petición corta que
     * cabe de sobra en la ventana de activación del navegador.
     */
    const continuarConProveedor = async (codigo) => {
        const esGoogle = proveedorPendiente === "google";
        const provider = esGoogle ? gProvider : fProvider;
        const metodo = esGoogle ? Config.METODO_EX_GO : Config.METODO_EX_FB;
        const idMetodo = esGoogle ? Config.IDMETODO_EX_GO : Config.IDMETODO_EX_FB;
        const apagarSpinner = esGoogle ? setIsLoading : setIsLoadingFB;

        setProveedorPendiente(null);
        apagarSpinner(true);

        try {
            const result = await signInWithPopup(auth, provider);
            const params = construirParams(result.user, metodo, idMetodo);
            if (!params) {
                apagarSpinner(false);
                setErrorPopup("Correo inválido, intente con otra cuenta.");
                return;
            }
            // El backend solo aplica cp cuando crea el usuario, asi que a quien
            // ya tiene cuenta se le ignora sin efecto.
            if (codigo) params.cp = codigo;

            const res = await loginRemote(params);
            if (res === true) {
                navigate(-1);
                return;
            }
            apagarSpinner(false);
            setErrorPopup(typeof res === "string" ? res : "Ha ocurrido un error, intente nuevamente.");
        } catch (error) {
            manejarError(error, apagarSpinner);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center gap-4 ">
            <ModalCodigoPromocional
                abierto={proveedorPendiente !== null}
                proveedor={proveedorPendiente}
                onConfirmar={continuarConProveedor}
                onCancelar={() => setProveedorPendiente(null)}
                codigoInicial={codigoDelLink}
            />
            <button onClick={() => navigate("/suscripcion")} className="bg-orange-500 md:bg-greenVE-500 px-4 py-1 rounded-md text-white w-3/4 md:w-1/2 ">Adquirir Suscripción</button>
            <h1 className="text-center w-3/4 md:w-1/2  font-bold text-greenVE-700 text-base md:text-xl ">Ó</h1>
            <h1 className="text-center w-3/4 md:w-1/2  font-bold text-greenVE-700 text-base md:text-xl ">PRUEBA GRATIS CON:</h1>
            <div className="flex gap-8 items-center justify-center">
                {
                    isLoading
                        ? <Spinner color="blue" className="text-greenVE-300"></Spinner>
                        : <a onClick={() => pedirCodigo("google")} dangerouslySetInnerHTML={{ __html: icons.Data['LoginGoogle'] }} className='border-2 p-2 rounded-md hover:border-greenVE-500 cursor-pointer' />
                }
                {
                    isLoadingFB
                        ? <Spinner color="blue" className="text-greenVE-300"></Spinner>
                        : <a onClick={() => pedirCodigo("facebook")} dangerouslySetInnerHTML={{ __html: icons.Data['LoginFacebook'] }} className='border-2 p-2 rounded-md hover:border-greenVE-500 cursor-pointer' />
                }
            </div>
            {errorPopup && (
                <label className="w-3/4 md:w-1/2 text-center font-semibold text-red-500 text-xs">
                    {errorPopup}
                </label>
            )}
        </div>
    )
}
export default LoginSocial;
