import Config from "../../global/config";
import GenericService from "../service";

/**
 * Certificados/tickets de tbl_certificado.
 * Las rutas usan el nombre del archivo PHP publicado en /apiv1.7/tickets/.
 */
class CertificadoService extends GenericService {

    async listarCertificados(params) {
        const url = `${Config.URL_SERVICIOS}${Config.TICKET}listarTickets/`;
        return await this.post(url, params);
    }

    async crearCertificado(params) {
        const url = `${Config.URL_SERVICIOS}${Config.TICKET}crearTicket/`;
        return await this.post(url, params);
    }

    /**
     * Endpoint original: sin joins a VE. Para tickets (tipo 2), cuyos ids son
     * UUIDs de vino_api y se resuelven en el front.
     */
    async obtenerTicket(params) {
        const url = `${Config.URL_SERVICIOS}${Config.TICKET}obtenerTicket/`;
        return await this.post(url, params);
    }

    /**
     * Endpoint nuevo: resuelve establecimiento y oferta contra las tablas de VE
     * y acepta filtro por tipo. Para certificados (tipo 1).
     */
    async obtenerCertificado(params) {
        const url = `${Config.URL_SERVICIOS}${Config.TICKET}obtenerCertificado/`;
        return await this.post(url, params);
    }

    async actualizarCertificado(params) {
        const url = `${Config.URL_SERVICIOS}${Config.TICKET}actualizarTicket/`;
        return await this.post(url, params);
    }

    async eliminarCertificado(params) {
        const url = `${Config.URL_SERVICIOS}${Config.TICKET}eliminarTicket/`;
        return await this.post(url, params);
    }

    async marcarCertificadoUsado(params) {
        const url = `${Config.URL_SERVICIOS}${Config.TICKET}marcarTicketUsado/`;
        return await this.post(url, params);
    }

    /** Beneficios ya consumidos por el usuario (politica OneShot). */
    async beneficiosUsados(params) {
        const url = `${Config.URL_SERVICIOS}${Config.TICKET}beneficiosUsados/`;
        return await this.post(url, params);
    }
}

export default CertificadoService;
