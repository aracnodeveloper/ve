import Config from "../../global/config";
import SuscripcionService from "../../services/suscripcion/SuscripcionService";
import Cookie from "js-cookie";

export const loginRemote = async function (params) {
  try {
    const suscripcionService = new SuscripcionService();
    const res = await suscripcionService.getInformacionPerfil(params);

    if (!res || !res.estado || res.codigo != 0) {
      return res?.msj || false;
    }

    // Verificar suscripción caducada
    if (res.data.fin != null) {
      if (new Date(res.data.fin) < new Date()) {
        return (
          <label>
            {"Cuenta caducada el " + res.data.fin}
            <br />
            <a
              className="text-blue-500 underline cursor-pointer"
              href={window.location.origin + "/suscripcion"}
            >
              Renueva aquí
            </a>
          </label>
        );
      }
    }
    // ✅ Guardar en localStorage ANTES de intentar leerlo
    localStorage.setItem("datos", JSON.stringify(res));

    // Ahora sí leer la cédula para Biosite
    const cedula = res.data?.ci;
    if (cedula) {
      const email = cedula;
      const password = cedula.substring(0, 5);

      try {
        const responseData = await suscripcionService.getInformacionBiosite({
          cedula: email,
          password: password,
        });

        if (responseData?.userId) {
          const { accessToken, refreshToken, userId, roleName, biositeId } =
            responseData;

          const accessExpirationDate = new Date();
          const refreshExpirationDate = new Date();
          accessExpirationDate.setDate(accessExpirationDate.getDate() + 2);
          refreshExpirationDate.setDate(refreshExpirationDate.getDate() + 7);

          Cookie.set("accessToken", accessToken, { expires: accessExpirationDate });
          Cookie.set("refreshToken", refreshToken, { expires: refreshExpirationDate });
          Cookie.set("userId", userId, { expires: refreshExpirationDate });
          Cookie.set("roleName", roleName.toString(), { expires: refreshExpirationDate });
          Cookie.set("biositeId", biositeId, { expires: refreshExpirationDate });
        }
      } catch (biositeError) {
        // Si Biosite falla, el login principal igual debe funcionar
        console.warn("Biosite no disponible:", biositeError);
      }
    }

    return true;

  } catch (e) {
    console.error("Error en loginRemote:", e);
    return false;
  }
};

/**
 * Avisa a contabilidad del cobro con tarjeta recien procesado por PayPhone.
 *
 * No corta el flujo si falla: la suscripcion ya se creo y el dinero ya se
 * cobro, asi que un correo caido no puede romperle la bienvenida al cliente.
 */
export const notificarPagoPayphone = async function ({ state, dataSuscripcion }) {
  try {
    const producto = state?.producto || {};
    const precio = parseFloat(producto.PrecioProducto || 0);
    const subtotal = precio.toFixed(2);
    const total = (precio * 1.12).toFixed(2);
    const iva = (precio * 1.12 - precio).toFixed(2);

    const suscripcionService = new SuscripcionService();
    const res = await suscripcionService.notificarPagoPayphone({
      personal: {
        nombres: state?.persona?.nombres || "",
        ci: state?.persona?.cedula || "",
        email: state?.persona?.correo || "",
        celular: state?.persona?.telefono || "",
      },
      producto: {
        titulo: producto.Titulo || producto.nombreProducto || "",
        subtotal: subtotal,
        iva: iva,
        total: total,
      },
      pago: {
        boton: state?.pago?.NombreBotonPago || state?.pago?.IdTipoBotonPago || "",
        diferido: state?.pago?.Meses || "",
        intereses: state?.pago?.Intereses || "",
        codigo_suscripcion: dataSuscripcion?.codigo || "",
      },
      transaccion: state?.pago?.transaccion || {},
    });
    return !!(res && res.estado);
  } catch (e) {
    console.error("No se pudo notificar el pago de PayPhone:", e);
    return false;
  }
};

export const getPermissions = async function (idUsuario) {
  try {
    const suscripcionService = new SuscripcionService();
    var bd = JSON.parse(localStorage.getItem("datos"));
    const params = {
      id_usuario: idUsuario,
    };
    const res = await suscripcionService.setAdministrador(params);
    if (res.estado) {
      const expirationDate = new Date();
      expirationDate.setTime(expirationDate.getTime() + 8 * 60 * 60 * 1000);

      document.cookie = `PHPSESSID=${
        res.data
      };expires=${expirationDate.toUTCString()}`;
      return res.estado;
    }
    return false;
  } catch (e) {}
};

export const setPermissionsAdmin = async function () {
  try {
    const suscripcionService = new SuscripcionService();
    var bd = JSON.parse(localStorage.getItem("datos"));
    const params = {
      token: bd.token,
    };
    const res = await suscripcionService.getPermisos(params);
    if (res.estado) {
      localStorage.setItem("permisos", JSON.stringify(res.data));
      return res.estado;
    }
    return false;
  } catch (e) {}
};

export const endRemoteSession = async function () {
  try {
    var bd = JSON.parse(localStorage.getItem("datos"));
    var params = {
      token: bd["token"],
    };
    localStorage.removeItem("datos");
    localStorage.removeItem("permisos");
    // Expirar la cookie del administrador
    document.cookie =
      "PHPSESSID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    const suscripcionService = new SuscripcionService();
    const res = await suscripcionService.cerrarSesion(params);
    if (res.estado && res.codigo == 0) {
      return res.estado;
    }
    if (res.codigo == 401) {
      return 401;
    }
  } catch (e) {}
};

export const gestionarSuscripcion = async function (params) {
  try {
    const suscripcionService = new SuscripcionService();
    const res = await suscripcionService.registroTransaccion(params);
    if (res.estado) {
      suscripcionService.sendNotificationSubscription({
        id_suscripcion_renovacion: res.data.id_suscripcion_renovacion,
      });
      return res;
    }
    return false;
  } catch (e) {}
};

export const resetContrasenia = async function (tipo, valor) {
  try {
    const params = {
      tipo: tipo,
      valor: valor,
      servicio: Config.SERVICIO,
    };
    const suscripcionService = new SuscripcionService();
    const res = await suscripcionService.reenviarContrasena(params);
    if (res != null) {
      return res;
    }
  } catch (e) {}
  return false;
};
