import ContactoService from "../../services/contacto/ContactoService";

/**
 * Envia el formulario de contacto al backend (/inf/contactanos/).
 *
 * El backend decide destinatarios y asunto segun `tipo`:
 *   - "contactoWeb"  -> gerencia@ (cc: subgerencia@, gventas@), asunto Contacto
 *   - "emprendedor"  -> mismos correos, asunto Emprendedor
 *
 * Devuelve true si se envio, false si no.
 */
export const enviarContacto = async function (datos, tipo = "contactoWeb") {
    try {
        const service = new ContactoService();
        const params = {
            tipo,
            ci: datos.ci?.trim() || "",
            nombres: datos.nombres?.trim() || "",
            email: datos.email?.trim() || "",
            telefonos: datos.telefonos?.trim() || "",
            direccion: datos.direccion?.trim() || "",
            ciudad: datos.ciudad?.trim() || "",
            pais: datos.pais?.trim() || "",
            mensaje: datos.mensaje?.trim() || "",
            // Solo los usa "puntoCarga": URLs de las fotos ya subidas y ubicación marcada en el mapa.
            fotoEstablecimiento: datos.fotoEstablecimiento || "",
            fotoParqueadero: datos.fotoParqueadero || "",
            fotoLugar: datos.fotoLugar || "",
            latitud: datos.latitud || "",
            longitud: datos.longitud || "",
        };

        const res = await service.enviarContacto(params);
        return res != null && res["estado"] === true;
    } catch {
        return false;
    }
};
