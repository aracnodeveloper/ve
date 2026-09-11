import Config from "../../global/config"
import Banco from "../../models/pagos/Banco";
import Diferido from "../../models/pagos/Diferido";
import Tarjeta from "../../models/pagos/Tarjeta";
import TipoPago from "../../models/pagos/TipoPago";
import ContactoService from "../../services/contacto/ContactoService"

export const getRemoteTarjetas = async function (){
    try{
        const params= {
            "id_empresa": Config.IDEMPRESA
        }
        const contactoService= new ContactoService();
        const res= await contactoService.listaTarjetas(params);
        if(res.estado&&res.codigo===0){
            const listaTipoPago = [];
            for(const tipoPago in res.data){
                const tipoPagoTmp=res.data[tipoPago]
                const tipoPagoObj=new TipoPago();
                tipoPagoObj.Nombre=tipoPagoTmp["nombre"]
                const listaBancos=[]
                for(const banco of tipoPagoTmp["bancos"]){
                    const bancoTmp= new Banco()
                    bancoTmp.Nombre=banco["nombre"]
                    bancoTmp.Formato=banco["formato"]
                    bancoTmp.Logo=banco["logo"]
                    const listaTarjetas=[]
                    for(const tarjeta of banco["tarjeta"]){
                        const tarjetaTmp= new Tarjeta()
                        tarjetaTmp.Nombre=tarjeta["nombre"]
                        tarjetaTmp.Logo=tarjeta["logo"]
                        tarjetaTmp.IdTipoTarjeta=tarjeta["id_tipo_tarjeta"]
                        tarjetaTmp.Cuenta=tarjeta["cuenta"]
                        const listaDiferidos=[]
                        for(const diferido of tarjeta["diferidos"]){
                            const diferidosTmp= new Diferido()
                            diferidosTmp.Titulo=diferido["texto"]
                            diferidosTmp.TipoBotonPago=diferido["nombre_tipo_boton_pago"]
                            diferidosTmp.Meses=diferido["meses"]
                            diferidosTmp.Intereses=diferido["intereses"]
                            diferidosTmp.IdTipoBotonPago=diferido["id_tipo_boton_pago"]
                            diferidosTmp.IdDiferido=diferido["id_diferido"]
                            listaDiferidos.push(diferidosTmp)
                        }
                        tarjetaTmp.ListaDiferidos=listaDiferidos
                        listaTarjetas.push(tarjetaTmp)
                    }
                    bancoTmp.ListaTarjetas=listaTarjetas
                    listaBancos.push(bancoTmp)
                }
                tipoPagoObj.ListaBancos=listaBancos
                listaTipoPago.push(tipoPagoObj)
            }
            return(listaTipoPago)
        }
    }catch(e){

    }
}

