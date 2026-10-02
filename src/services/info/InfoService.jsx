import Config from "../../global/config";
import GenericService from "../service";

class InfoService extends GenericService{
    async obtenerNoticias(params){
        const url = `${Config.URL_SERVICIOS}${Config.VERINFO}getNoticias/`;
        return await this.post(url, params);
    }
    async obtenerImágenesHoteles(params){
        const url = `${Config.URL_SERVICIOS}${Config.VEREST}getHotelesActivos/`;
        return await this.post(url, params);
    }
    async obtenerActividadReservas(params){
        const url = `${Config.URL_SERVICIOS}${Config.VERINFO}getActividadReservas/`;
        return await this.post(url, params);
    }
    async obtenerDestinoExpress(params){
        const url = `${Config.URL_SERVICIOS}${Config.VERINFO}destinoExpress/`;
        return await this.post(url, params);
    }
    async obtenerBannersWeb(params){
        const url = `${Config.URL_SERVICIOS}${Config.VERINFO}getPublicidadWebVe/`;
        return await this.post(url, params);
    }

    /** Códigos madre que se muestran como "letras" en el header (los administra el módulo de publicidad). */
    async obtenerCodigosHeader(params){
        const url = `${Config.URL_SERVICIOS}${Config.VERINFO}getCodigosHeader/`;
        return await this.post(url, params);
    }

    async obtenerOperador(){
        const url = `${Config.URL_SERVICIOS}${Config.VERAPP}getOperadorCallcenter/`;
        return await this.post(url, {});
    }
}

export default InfoService