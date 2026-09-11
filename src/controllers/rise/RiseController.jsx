import RiseService from "../../services/rise/RiseService";

/**
 * Detalle de cliente de RIS por cedula.
 *
 * Sustituye a getDatosCRM: el boton de la tabla de descargas ahora consulta
 * RIS en lugar del CRM viejo.
 *
 * @returns {Promise<object|null>} CustomerDetail, o null si RIS no lo tiene.
 */
export const getDetalleClienteRise = async function (cedula) {
  try {
    if (!cedula) return null;
    const riseService = new RiseService();
    return await riseService.getCustomerByCedula(String(cedula).trim());
  } catch (e) {
    console.error("Error consultando RIS:", e);
    return null;
  }
};
