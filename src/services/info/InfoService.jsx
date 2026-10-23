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

    /**
     * Beneficios de cuenta madre (los mismos endpoints que usa la app). El backend
     * resuelve con el token de qué códigos es dueño el usuario: nunca se manda un
     * id de código para elegir de quién son los datos, solo al guardar, y ahí el
     * servidor lo valida contra los suyos.
     */
    async obtenerBeneficiosMadre(params){
        const url = `${Config.URL_SERVICIOS}${Config.VERINFO}getBeneficiosCodigoMadre/`;
        return await this.post(url, params);
    }
    async guardarBeneficioMadre(params){
        const url = `${Config.URL_SERVICIOS}${Config.VERINFO}setBeneficioCodigoMadre/`;
        return await this.post(url, params);
    }
    async eliminarBeneficioMadre(params){
        const url = `${Config.URL_SERVICIOS}${Config.VERINFO}eliminarBeneficioCodigoMadre/`;
        return await this.post(url, params);
    }
    async obtenerCatalogoBeneficios(params){
        const url = `${Config.URL_SERVICIOS}${Config.VERINFO}getCatalogoBeneficios/`;
        return await this.post(url, params);
    }
    async crearCategoriaBeneficio(params){
        const url = `${Config.URL_SERVICIOS}${Config.VERINFO}crearCategoriaBeneficio/`;
        return await this.post(url, params);
    }

    /**
     * Sube la imagen de un beneficio. Es el endpoint de imágenes de publicidad: en
     * multipart el token va como campo plano, porque el cuerpo JSON llega vacío.
     */
    async subirImagenBeneficio(token, archivo){
        const url = `${Config.URL_SERVICIOS}${Config.VERINFO}subirImagenPublicidad/`;
        const datos = new FormData();
        datos.append("file", archivo);
        datos.append("token", token);
        try {
            // Sin Content-Type: el navegador pone el boundary del multipart.
            const response = await fetch(url, {
                method: "POST",
                headers: { Autorization: "bearer " + Config.DEVELOPER_TOKEN },
                body: datos,
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Cannot post to " + url + ". error:" + error.message);
            return { estado: false, msj: "No se pudo subir la imagen. Revise su conexión." };
        }
    }

    async obtenerOperador(){
        const url = `${Config.URL_SERVICIOS}${Config.VERAPP}getOperadorCallcenter/`;
        return await this.post(url, {});
    }
}

export default InfoService