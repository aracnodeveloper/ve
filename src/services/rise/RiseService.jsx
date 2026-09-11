import Config from "../../global/config";

/**
 * Cliente del API de RIS.
 *
 * No hereda de GenericService a proposito: ese cliente manda el token de
 * apidev, asume POST con JSON y, ante ciertos codigos, borra la sesion y
 * redirige a "/". RIS es otro host, con GET por query string y su propio
 * envoltorio { code, message, data }; mezclarlos haria que un 404 de RIS
 * (cedula que no existe, algo normal) cerrara la sesion del usuario.
 */
class RiseService {
  /** Base sin barra final, tolerando que RISE_API venga con o sin "/api". */
  base() {
    const raw = (Config.RISE_API || "").replace(/\/+$/, "");
    return /\/api$/i.test(raw) ? raw : `${raw}/api`;
  }

  /**
   * Detalle completo del cliente por cedula.
   * Devuelve el CustomerDetail ya desenvuelto, o null si no existe.
   */
  async getCustomerByCedula(cedula) {
    const url = `${this.base()}/Customer/by-cedula?cedula=${encodeURIComponent(
      cedula
    )}&isStatus=true`;

    const resp = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    // 404 = la cedula no esta en RIS. No es un error de la aplicacion.
    if (resp.status === 404) return null;
    if (!resp.ok) throw new Error(`RIS respondio ${resp.status}`);

    const json = await resp.json();
    return json && json.data ? json.data : null;
  }
}

export default RiseService;
