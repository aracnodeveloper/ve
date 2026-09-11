import Config from "../../global/config";
import GenericService from "../service";

class ContactoService extends GenericService{
    async cargaProductos(params){
        const url = `${Config.URL_SERVICIOS}${Config.VERAPP}listarProductosxCodigoPromocional/`;
        return await this.post(url, params);
    }

    async verificarCodigo(params){
        const url = `${Config.URL_SERVICIOS}${Config.VERAPP}comprobarCodigoPromocional/`;
        return await this.post(url, params);
    }

    async listaTarjetas(params){
        const url = `${Config.URL_SERVICIOS}${Config.VERAPP}diferidos/`;
        return await this.post(url, params);
    }

    // Envia el formulario de contacto. El destinatario/asunto lo decide el
    // backend segun params.tipo (ej. "contactoWeb", "emprendedor").
    async enviarContacto(params){
        const url = `${Config.URL_SERVICIOS}${Config.VERINFO}contactanos/`;
        return await this.post(url, params);
    }
}

export default ContactoService;