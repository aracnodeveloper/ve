import Contactos from "../../models/Contactos";
import Detalle from "../../models/Detalle";
import Establecimiento from "../../models/Establecimiento";
import Favorito from "../../models/Favorito";
import Oferta from "../../models/Oferta";
import OfertaInicio from "../../models/OfertaInicio";
import ResultadoBusqueda from "../../models/ResultadoBusqueda";
import Sugerencia from "../../models/Sugerencia";
import EstablecimientoService from "../../services/establecimiento/EstablecimientoService";
import SuscripcionService from "../../services/suscripcion/SuscripcionService";
import { DefaultToken } from "../web/webController";

export const getRemoteOfertas = async function () {

    var bd = JSON.parse(localStorage.getItem('datos'))
    if (bd == null) {
        return DefaultToken()
            .then((result) => {
                if (result) {
                    return _getRemoteOfertas();
                }
            });
    } else {
        return _getRemoteOfertas()
    }
}

export const getEstablacimientoDestino = async function (termino) {
    var bd = JSON.parse(localStorage.getItem('datos'))
    if (bd == null) {
        return DefaultToken()
            .then((result) => {
                if (result) {
                    return _getEstablecimientoDestino(termino);
                }
            });
    } else {
        return _getEstablecimientoDestino(termino)
    }
}


export const shareHotel=async function(tipo, url){
    try{
        var params={
            "tipo":tipo,
            "url":url
        }
        const establecimientoService = new EstablecimientoService;
        const res = await establecimientoService.shareHotel(params);
        if(res!=null&&res.estado){
            return res.data
        }
        return false;
    }catch{
    }
}

export const getCertificado=async function  (usuario, id_establecimiento, ofertas, fechas, adultos, ninos){
    try{
        var bd = JSON.parse(localStorage.getItem('datos'))
        var params = {
            "token": bd['token'],
            "usuario":(usuario==null||usuario=="")?bd["data"]['codigo']:usuario,
            "id_establecimiento":id_establecimiento,
            "ofertas":ofertas,
            "fecha":fechas,
            "adultos":adultos,
            "ninos":ninos,
        }
        
        const establecimientoService = new EstablecimientoService;
        const res = await establecimientoService.generarCertificado(params);
        if(res!=null&&res["estado"]){
            return res["data"];
        }
        return false;
    }catch{
       
    }
}

export const getResultadoFiltro = async function (filtro) {
    var bd = JSON.parse(localStorage.getItem('datos'))
    if (bd == null) {
        return DefaultToken()
            .then((result) => {
                if (result) {
                    return _getResultadoFiltro(filtro);
                }
            });
    } else {
        return _getResultadoFiltro(filtro)
    }
}
export const getResultadoRFiltro = async function (filtro) {
    var bd = JSON.parse(localStorage.getItem('datos'))
    if (bd == null) {
        return DefaultToken()
            .then((result) => {
                if (result) {
                    return _getResultadoRFiltro(filtro);
                }
            });
    } else {
        return _getResultadoRFiltro(filtro)
    }
}

const _getRemoteOfertas = async function () {

    const listadoOfertas = [];

    try {
        const establecimientoService = new EstablecimientoService;
        var bd = JSON.parse(localStorage.getItem('datos'))
        var params = {
            "token": bd['token']
        }

        const res = await establecimientoService.getOfertasPublicidad(params);
        if (res.estado && res.codigo == 0) { 
            if (Object.values(res).length > 0) {
                var ofertas = res['data']['ofertas']
                var establecimientos=res['data']['establecimientos']
                var url = res['data']['url']['oferta']
                for (const oferta of ofertas) {
                    const estData = establecimientos[oferta['id_establecimiento']] || {};
                    const ofertaInicio = new OfertaInicio(
                        oferta['id'],
                        oferta['id_establecimiento'],
                        url + oferta['foto'],
                        oferta['final'],
                        oferta['ciudad'],
                        oferta['nombreEst'],
                        oferta['tituloOferta'],
                        oferta['noches'],
                        oferta['dias'],
                        oferta['adultos'],
                        oferta['ninos'],
                        estData['catalogacion']
                    )
                    // Descripción del establecimiento
                    ofertaInicio.Descripcion = estData['descripcionEst'] || estData['descripcion'] || '';
                    // Check-in y Check-out desde sistemaServEst
                    const sistServ = estData['sistemaServEst'] || {};
                    const sistValues = Object.values(sistServ);
                    const checkInVal = sistValues.find(v => typeof v === 'string' && v.toLowerCase().includes('check in'));
                    const checkOutVal = sistValues.find(v => typeof v === 'string' && v.toLowerCase().includes('check out'));
                    ofertaInicio.CheckIn  = checkInVal  ? checkInVal.replace(/hora check in[:\s]*/i, '').trim()  : null;
                    ofertaInicio.CheckOut = checkOutVal ? checkOutVal.replace(/hora check out[:\s]*/i, '').trim() : null;
                    listadoOfertas.push(ofertaInicio)
                }
                return listadoOfertas
            }
        }
        if(res.codigo==401){
            return 401;
        }
    } catch (e) {
    }
}

const _getEstablecimientoDestino =async function(termino){
    const listadoSugerencias = [];

    try {
        const establecimientoService = new EstablecimientoService;
        var bd = JSON.parse(localStorage.getItem('datos'))
        var params = {
            "token": bd['token'],
            "termino":termino
        }

        const res = await establecimientoService.getEstablecimientoDestino(params);
        if (res.estado && res.codigo == 0) {   // falso
            if (Object.values(res).length > 0) {
                var sugerencias = res['data']['sugerencias']
                for (const sugerencia of sugerencias) {
                    const sugerenciaBusqueda = new Sugerencia();

                    sugerenciaBusqueda.Id=sugerencia['id'];
                    sugerenciaBusqueda.Titulo=sugerencia['titulo'];
                    sugerenciaBusqueda.Lugar=sugerencia['descripcion'];
                    sugerenciaBusqueda.Tipo=sugerencia['tipo'];

                    listadoSugerencias.push(sugerenciaBusqueda)
                }
                return listadoSugerencias
            }
        }
        if(res.codigo==401){
            return 401;
        }
    } catch (e) {
        
    }
}

const _getResultadoFiltro = async function (filtro) {
    try {
        const establecimientoService = new EstablecimientoService();
        const bd = JSON.parse(localStorage.getItem('datos'));
        var params = {
            "token": bd['token'],
            "id":filtro.IdDestino,
            "tipo":filtro.TipoDestino,
        }

        filtro.IdDestino&&(params.id=filtro.IdDestino); 
        filtro.TipoDestino&&(params.tipo=filtro.TipoDestino);
        filtro.IdEstablecimiento&&(params.id_establecimiento=filtro.IdEstablecimiento);
        filtro.txtBusqueda&&(params.txtBusqueda=filtro.txtBusqueda);
        filtro.IdBeneficios&&(params.beneficios=filtro.IdBeneficios); 
        filtro.IdServicios&&(params.idservicios=filtro.IdServicios);
        filtro.Personas&&(params.personas=filtro.Personas); 
        filtro.Tiempo&&(params.tiempo=filtro.Tiempo); 
        filtro.Precio&&(params.precio=filtro.Precio); 
        filtro.Habitaciones&&(params.habitaciones=filtro.Habitaciones); 
        filtro.Ordenar&&(params.ordenar=filtro.Ordenar); 
        filtro.Fechas&&(params.fechas=filtro.Fechas); 
        filtro.Pax&&(params.pax=filtro.Pax);
        filtro.Pag&&(params.pag=filtro.Pag);
        filtro.Nitems&&(params.nitems=filtro.Nitems);
        const res = await establecimientoService.filtro(params);
       
        if (res.estado && res.codigo === 0) {
            const {
                establecimientos,
                centralReserva,
                opcionesOrden,
                beneficios,
                url,
                filtro: { catalogacion, locacion, precios, servicios, serviciosHabEst, incluyeEst, adicionalesEst },
            } = res.data;

            const listadoCatalogaciones = createDetalles(catalogacion, 'nombre', 'catalogacion');
            const listadoLocaciones = createDetalles(locacion, 'nombre', 'color');
            const listadoServicios = createDetalles(servicios, 'nombre', 'estilo');
            const listadoServiciosHab = createDetalles(serviciosHabEst,  'nombre', 'estilo');
            const listadoIncluye = createDetalles(incluyeEst, 'nombre', 'Icono');
            const listadoAdicionales = createDetalles(adicionalesEst, 'nombre', 'Icono');
            const listadoOrdenes = createDetalles(opcionesOrden, 'name', 'text');
            const listadoBeneficios = createDetalles(beneficios, 'nombre',  'color');

            const resultadoBusqueda = new ResultadoBusqueda(
                createEstablecimientos(establecimientos, url.oferta, beneficios, centralReserva),
                precios.MinPrecio,
                precios.MaxPrecio,
                listadoCatalogaciones,
                listadoLocaciones,
                listadoServicios,
                listadoServiciosHab,
                listadoIncluye,
                listadoAdicionales,
                listadoOrdenes,
                listadoBeneficios
            );
            resultadoBusqueda.Paginacion = res.data.paginacion;
            return resultadoBusqueda;
        }
        if(res.codigo==401){
            return 401
        }
    } catch (e) {
        console.error(e);
    }
};

const _getResultadoRFiltro = async function (filtro) {
    try {
        const establecimientoService = new EstablecimientoService();
        const bd = JSON.parse(localStorage.getItem('datos'));
        var params = {
            "token": bd['token'],
            "id":filtro.IdDestino,
            "tipo":filtro.TipoDestino,
        }

        filtro.IdDestino&&(params.id=filtro.IdDestino); 
        filtro.TipoDestino&&(params.tipo=filtro.TipoDestino);
        filtro.IdEstablecimiento&&(params.id_establecimiento=filtro.IdEstablecimiento);
        filtro.txtBusqueda&&(params.txtBusqueda=filtro.txtBusqueda);
        filtro.IdBeneficios&&(params.beneficios=filtro.IdBeneficios); 
        filtro.IdServicios&&(params.idservicios=filtro.IdServicios);
        filtro.Personas&&(params.personas=filtro.Personas); 
        filtro.Tiempo&&(params.tiempo=filtro.Tiempo); 
        filtro.Precio&&(params.precio=filtro.Precio); 
        filtro.Habitaciones&&(params.habitaciones=filtro.Habitaciones); 
        filtro.Ordenar&&(params.ordenar=filtro.Ordenar); 
        filtro.Fechas&&(params.fechas=filtro.Fechas); 
        filtro.Pax&&(params.pax=filtro.Pax); 
        const res = await establecimientoService.filtroR(params);
       
        if (res.estado && res.codigo === 0) {
            const {
                establecimientos,
                centralReserva,
                opcionesOrden,
                beneficios,
                url,
                filtro: { catalogacion, locacion, precios, servicios, serviciosHabEst, incluyeEst, adicionalesEst },
            } = res.data;

            const listadoCatalogaciones = createDetalles(catalogacion, 'nombre', 'catalogacion');
            const listadoLocaciones = createDetalles(locacion, 'nombre', 'color');
            const listadoServicios = createDetalles(servicios, 'nombre', 'estilo');
            const listadoServiciosHab = createDetalles(serviciosHabEst,  'nombre', 'estilo');
            const listadoIncluye = createDetalles(incluyeEst, 'nombre', 'Icono');
            const listadoAdicionales = createDetalles(adicionalesEst, 'nombre', 'Icono');
            const listadoOrdenes = createDetalles(opcionesOrden, 'name', 'text');
            const listadoBeneficios = createDetalles(beneficios, 'nombre',  'color');

            const resultadoBusqueda = new ResultadoBusqueda(
                createEstablecimientos(establecimientos, url.oferta, beneficios, centralReserva),
                precios.MinPrecio,
                precios.MaxPrecio,
                listadoCatalogaciones,
                listadoLocaciones,
                listadoServicios,
                listadoServiciosHab,
                listadoIncluye,
                listadoAdicionales,
                listadoOrdenes,
                listadoBeneficios
            );
            resultadoBusqueda.Paginacion = res.data.paginacion;
            return resultadoBusqueda;
        }
        if(res.codigo==401){
            return 401
        }
    } catch (e) {
        console.error(e);
    }
};

function createDetalles(data, titleKey, iconKey) {
    const listDetalles = [];
    if (data) {
        for (const item in data) {
            if (data.hasOwnProperty(item)) {
                const detalle = new Detalle();
                detalle.Titulo = data[item][titleKey] || data[item];
                detalle.Valor = item;
                detalle.Icono = data[item][iconKey];
                listDetalles.push(detalle);
            }
        }
    }
    return listDetalles;
}

// Función para crear una lista de objetos Establecimiento a partir de un array
function createEstablecimientos(establecimientos, url, beneficios, centralReservas) {

    // Función para mapear propiedades de oferta
    function mapPropiedadesOferta(ofertaTmp) {
        const oferta = new Oferta();
        const propiedadesOfertaObj = ['Id', 'IdLugar', 'EstadoBusqueda', 'IdOferta', 'Habitaciones', 'IdEstablecimiento', 'AplicaEn', 'TituloOferta', 'Ninos', 'Adultos', 'Dias', 'Noches', 'Ganga', 'Rack', 'Final', 'Ahorro', 'FinalSinImpuestos', 'Impuestos', 'Ciudad', 'Provincia', 'Favorito', 'FotoPrincipal', 'EstiloBeneficio', 'IdBeneficio', 'ColorBeneficio', 'Localidad', 'Acomodacion', 'Incluye', 'NoIncluye', 'Restricciones', 'SistemaServicios', 'NumOfertas', 'Base', 'FechaHoraAgotado', 'FechaHoraAgotadoFin', 'Agotamientos'];
        const propiedadesOferta = ['id', 'id_lugar', 'estadoBusqueda', 'id_oferta', 'habitaciones', 'id_establecimiento', 'aplicaen', 'tituloOferta', 'ninos', 'adultos', 'dias', 'noches', 'ganga', 'rack', 'final', 'ahorro', 'sinImpuestos', 'impuestos', 'ciudad', 'provincia', 'fav', 'foto', 'estiloBeneficio', 'idBeneficio', 'colorBeneficio', 'localidad', 'acomodacion', 'incluyeOferta', 'noIncluyeOferta', 'restriccionesOferta', 'sistemaServiciosOferta', 'numOfertas', 'base', 'fecha_hora', 'fecha_hora_fin', 'agotamientos'];

        propiedadesOferta.forEach((prop, index) => oferta[propiedadesOfertaObj[index]] = ofertaTmp[prop]);

        // Porcentaje de ahorro
        oferta.PorcentajeAhorro = Math.round(100 - (parseInt(oferta.Final) * 100) / parseInt(oferta.Rack));


        // Detalles
        const propiedadesObj=['Incluye', 'NoIncluye', 'Restricciones', 'SistemaServicios'];
        ['incluyeOferta', 'noIncluyeOferta', 'restriccionesOferta', 'sistemaServiciosOferta'].forEach((detalle, index) => {
            ofertaTmp[detalle]&&(oferta[propiedadesObj[index]] = Object.entries(ofertaTmp[detalle]).map(([key, value]) => new Detalle(value, key, "")));
        });

        return oferta;
    }

    return establecimientos.filter(establecimientoTmp => establecimientoTmp.ofertas && Object.keys(establecimientoTmp.ofertas).length > 0).map(establecimientoTmp => {
        const establecimiento = new Establecimiento();

        // Mapeo de propiedades
        const propiedadesObj = ['IdEstablecimiento', 'Titulo', 'Ciudad', 'Pais', 'IdPais', 'IdCiudad', 'EdadNino', 'Catalogacion', 'Longitud', 'Latitud', 'Logo', 'Direccion', 'Descripcion', 'Favorito', 'TipoEstablecimiento'];
        const propiedades = ['id_establecimiento', 'titulo', 'ciudad', 'pais', 'idPais', 'idCiudad', 'edad_nino', 'catalogacion', 'longitud', 'latitud', 'logo', 'direccion', 'descripcionEst', 'favorito', 'tipoEstablecimiento'];
        propiedades.forEach((prop, index) => establecimiento[propiedadesObj[index]] = establecimientoTmp[prop]);

        // Foto
        establecimiento.Foto = url + establecimientoTmp.fotoHotel;

        // Galería
        establecimiento.Galeria = establecimientoTmp.galeria.map(g => new Detalle(g.nombre, url + g.img));

        // Ofertas
        establecimiento.Ofertas = Object.values(establecimientoTmp.ofertas).map(mapPropiedadesOferta);

        // Servicios
        const propiedadesServ=['Servicios', 'Incluye', 'NoIncluye', 'Restricciones', 'SistemaServicios', 'ServiciosHab','Adicionales'];
        ['serviciosEst', 'incluyeEst', 'noIncluyeEst', 'restriccionesEst', 'sistemaServEst', 'serviciosHabEst', 'adicionalesEst'].forEach((servicio, index) => {
            if(servicio=='serviciosEst'){
                establecimientoTmp[servicio]&&(establecimiento[propiedadesServ[index]] = Object.entries(establecimientoTmp[servicio]).map(([key, value]) => new Detalle(value.nombre, key, value.estilo)));
            }
            else{
                establecimientoTmp[servicio]&&(establecimiento[propiedadesServ[index]] = Object.entries(establecimientoTmp[servicio]).map(([key, value]) => new Detalle(value, key)));
            }
        });

        // Contactos Establecimiento
        const listaContactos = {
            Whatsapp: [],
            Telefono: [],
            Email: [],
            Web: []
        };

        if(establecimientoTmp.contactos){
            establecimientoTmp.contactos.forEach(contacto => {
                if (contacto.nombre.includes("WhatsApp")) listaContactos.Whatsapp.push(contacto.valor);
                if (contacto.nombre.includes("Teléfono Reservas")) listaContactos.Telefono.push(contacto.valor);
                if (contacto.nombre.includes("Email")) listaContactos.Email.push(contacto.valor);
                if (contacto.nombre.includes("Página Web")) listaContactos.Web.push(contacto.valor);
            });
        }

        establecimiento.Contactos = new Contactos(listaContactos.Whatsapp, listaContactos.Email,  listaContactos.Telefono,listaContactos.Web);

        // Contactos Central Reservas
        const contactosCR=new Contactos();
        contactosCR.Whatsapp=centralReservas.whatsapp.contacto;
        contactosCR.Telefono=centralReservas.telefono_reservas.contacto;
        contactosCR.Email=centralReservas.email.contacto;

        establecimiento.ContactosCentral = contactosCR;

        // Recomendados
        establecimiento.Recomendados = establecimientoTmp.recomendados.map(recomendadoTmp => {
            const ofertaTmp = establecimientoTmp.ofertas[recomendadoTmp.id];
            ofertaTmp.numOfertas=recomendadoTmp.numOfertas;
            return mapPropiedadesOferta(ofertaTmp);
        });

        // Precio y otros datos
        establecimiento.PrecioSinImpuestos = establecimientoTmp.precioRecomendadoSinImp;
        establecimiento.PrecioConImpuestos = establecimientoTmp.precioRecomendadoFinal;
        establecimiento.Rack = establecimientoTmp.precioRecomendadoRack;
        establecimiento.Impuestos = establecimientoTmp.precioRecomendadoImpuestos;

        //Calificacion
        establecimiento.Calificacion= new Detalle(
            establecimientoTmp.comentarios.calificacion,
            establecimientoTmp.comentarios.cantidadComentarios,
            establecimientoTmp.comentarios.puntuacion,
        )

        return establecimiento;
    });
}


//Nueva forma de reserva


export const createReservation = async function (datosReserva, listaOfertas){
    try{
        const establecimientoService = new EstablecimientoService();
        var bd = JSON.parse(localStorage.getItem('datos'));
        datosReserva.id_tbl_usuario_cliente= bd.data.id_usuario
        var params={
            "token":bd.token,
            "tipo":"guardar",
            "reserva":datosReserva,
            "ofertas":listaOfertas
        }
        const res = await establecimientoService.guardarReserva(params);
        if (res.estado && res.codigo == 0) {   // falso
            return res
        }
    }catch(e){
        ;
    }
    return false;
}

/*export const createReservation = async function (id, adultos, ninos, cantidad, inicio, fin, edades){
    try{
        const establecimientoService = new EstablecimientoService();
        var bd = JSON.parse(localStorage.getItem('datos'))
        var params = {
            "token": bd['token'],
            "id_oferta":id,
            "adultos":adultos,
            "ninos":ninos, 
            "cantidad_ofertas":cantidad,
            "fecha_inicio":inicio,
            "fecha_fin":fin,
            "edad_ninos":edades
        }
        const res = await establecimientoService.reserva(params);

        if (res.estado && res.codigo === 0) {
            return res.data;
        }
    }catch(e){

    }
    return false;
}*/

export const sendMailReservaExpress = async function (email, idReservas){
    try{
        const suscripcionService = new SuscripcionService();
        var params = {
            "tipo": 'mailExpress',
            "email":email,
            "id_tbl_reserva":idReservas
            //"reserva":idReservas
        }
        const res = await suscripcionService.sendCorreoPagoCashback(params);

        if (res.estado && res.codigo === 0) {
            return res;
        }
    }catch(e){

    }
    return false;
}

export const changeFavoritoStatus = async function (idEst, estado){
    try{
        const establecimientoService = new EstablecimientoService();
        var bd = JSON.parse(localStorage.getItem('datos'))
        var params={
            "token": bd['token'],
            "id_establecimiento":idEst,
            "favorito": estado?1:2
        }
        const res= await establecimientoService.cambiarEstadoFavorito(params);
        if (res.estado && res.codigo === 0) {
            return res.estado;
        }
        if(res.codigo==401){
            return 401;
        }

    }catch{
        
    }
}

export const getFavoritos = async function (){
    try{
        const establecimientoService = new EstablecimientoService();
        var bd = JSON.parse(localStorage.getItem('datos'));
        var favoritosList=[];
        var params={
            "token":bd['token']
        }
        const res= await establecimientoService.getFavoritos(params);
        if(res.estado){
            for(const favorito of res.data){
                var favoritoTmp= new Favorito()
                favoritoTmp.Id= favorito["id_tbl_establecimiento"];
                favoritoTmp.Titulo= favorito["titulo"];
                favoritoTmp.Catalogacion= favorito["catalogacion"];
                favoritoTmp.Direccion=favorito["direccion_establecimiento"];
                favoritoTmp.Latitud=favorito["latitud"];
                favoritoTmp.Longitud=favorito["longitud"];
                favoritoTmp.Foto=res.url.hotel+favorito["direccion_foto"];
                favoritosList.push(favoritoTmp);
            }
        }
        if(res.codigo==401){
            return 401
        }
        return favoritosList;
    }catch(e){
        
    }
}