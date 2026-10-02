import Config from "../../global/config";
import { checkData } from "../../global/util";
import Detalle from "../../models/Detalle";
import HotelInicio from "../../models/HotelInicio";
import Noticia from "../../models/Noticia";
import ReservaReciente from "../../models/ReservaReciente";
import InfoService from "../../services/info/InfoService"

export const getNews = async function (){
    try{
        const bdStr= await checkData('datos');
        if(bdStr){
            var bd = JSON.parse(bdStr)
            const infoService= new InfoService();
            const listaNoticias=[];
            const params={
                "token": bd['token'],
                "npag": 24,
                "pag":1,
                "id_metodo": Config.IDMETODO,
            }
            
            const res= await infoService.obtenerNoticias(params)
            
            if(res['estado']&&res['codigo']==0){
                for(const noticia of res['data']){
                    const noticiaTmp= new Noticia();
                    noticiaTmp.Id=noticia['id_tbl_noticia']
                    noticiaTmp.Autor=noticia['nombreAutor']
                    noticiaTmp.Fecha=noticia['fecha']
                    noticiaTmp.Imagen=noticia['img']['300x1000']
                    noticiaTmp.Titulo=noticia['titulo']
                    noticiaTmp.Tipo=noticia['tipo']
                    noticiaTmp.Url=noticia['url']
                    listaNoticias.push(noticiaTmp)
                }
            }
            if(res['codigo']==401){
                return 401;
            }
            return listaNoticias;
        }
        return [];
    }catch(e){
       
    }
}

export const getHotels = async function (){
    try{
        const bdStr= await checkData('datos');
        if(bdStr){
            var bd = JSON.parse(bdStr)
            const infoService= new InfoService();
            const listaHoteles=[];
            const params={
                "token": bd['token'],
                "id_empresa": Config.IDEMPRESA,
            }
            
            const res= await infoService.obtenerImágenesHoteles(params)
            if(res['estado']&&res['codigo']==0){
                for(const hotel of res['data']){
                    const hotelTmp= new HotelInicio();
                    hotelTmp.Titulo=hotel['establecimiento']
                    hotelTmp.Foto=hotel['logoHotel']
                    hotelTmp.Minimo=hotel['oferta_mejor_precio']
                    hotelTmp.Id=hotel['id_establecimiento']
                    listaHoteles.push(hotelTmp)
                }
            }
            if(res['codigo']==401){
                return 401;
            }
            return listaHoteles;
        }
        return [];
    }catch{
    }
}

export const getReserves = async function (){
    try{
        const bdStr= await checkData('datos');
        if(bdStr){
            var bd = JSON.parse(bdStr)
            const infoService= new InfoService();
            const listaRecientes=[];
            const params={
                "token": bd['token'],
            }
            
            const res= await infoService.obtenerActividadReservas(params)
            if(res['estado']&&res['codigo']==0){
                for(const reciente of res['data']){
                    const recienteTmp = new ReservaReciente();
                    recienteTmp.Costo=reciente['costo']
                    recienteTmp.Establecimiento=reciente['establecimiento']
                    recienteTmp.LugarEstablecimiento= reciente['lugarEstablecimiento']
                    recienteTmp.LugarSuscriptor=reciente['lugarSuscriptor']
                    listaRecientes.push(recienteTmp)
                }
            }
            if(res['codigo']==401){
                return 401;
            }
            return listaRecientes;
        }
        return[];
        
    }catch{

    }
}

export const getDestinoExpress = async function (lat, long){
    try{
        const bdStr= await checkData('datos');
        if(bdStr){
            var bd = JSON.parse(bdStr)
            const infoService= new InfoService();
            const listaDestinos=[];
            const params={
                "token": bd['token'],
                "latitud":lat,
                "longitud":long,
            }
            
            const res= await infoService.obtenerDestinoExpress(params)
            if(res['estado']&&res['codigo']==0){
                for(const destino of res['data']){
                    const destinoTmp = new Detalle();
                    destinoTmp.Icono=destino['imagen']
                    destinoTmp.Valor=destino['distancia']
                    destinoTmp.Titulo= destino['destino_express']
                    listaDestinos.push(destinoTmp)
                }
            }
            if(res['codigo']==401){
                return 401;
            }
            return listaDestinos;
        }
        return [];
    }catch{

    }
}

/**
 * Códigos madre habilitados para el header (endpoint getCodigosHeader).
 * Devuelve { CODIGO: "ETIQUETA" } o null si falla (el llamador usa la lista local).
 */
export const getCodigosHeader = async function(){
    try{
        const bdStr = await checkData('datos');
        if(!bdStr) return null;
        const bd = JSON.parse(bdStr);
        const infoService = new InfoService();
        const res = await infoService.obtenerCodigosHeader({ token: bd['token'] });
        if(res && res['estado'] && res['codigo'] === 0){
            const mapa = {};
            for(const fila of (res['data']?.['codigos'] ?? [])){
                const codigo = String(fila['codigo'] ?? '').trim().toUpperCase();
                if(codigo) mapa[codigo] = String(fila['etiqueta'] ?? codigo).trim().toUpperCase();
            }
            return mapa;
        }
        return null;
    }catch{
        return null;
    }
}

export const getBanners  = async function(){
    try{
        const bdStr= await checkData('datos');
        if(bdStr){
            var bd = JSON.parse(bdStr)
            const infoService= new InfoService();
            const listaBanners=[];
            const params={
                "token": bd['token'],
                "id_servicio": Config.IDSERVICIO, // 1 = visita; fuerza el servicio aunque no haya login
                // Código madre del visitante (enlace .../?codigo=BYD): banners de esa cuenta madre
                "codigo": localStorage.getItem("codigo") || ""
            }

            const res= await infoService.obtenerBannersWeb(params)
            if(res['estado']&&res['codigo']==0){
                for(const destino of res['data']){
                    const destinoTmp = new Detalle();
                    destinoTmp.Icono=destino['direccion_foto']
                    destinoTmp.Valor=destino['vinculo']
                    destinoTmp.Titulo= destino['descripcion']
                    listaBanners.push(destinoTmp)
                }
            }
            if(res['codigo']==401){
                return 401;
            }
            return listaBanners;
        }
        return [];
    }catch{

    }
}

export const getOperador  = async function(){
    try{
            const infoService= new InfoService();
            
            const res= await infoService.obtenerOperador()
            if(res['estado']&&res['codigo']==0){
                return res['data']
            }
            if(res['codigo']==401){
                return 401;
            }
            return [];
    }catch{

    }
}