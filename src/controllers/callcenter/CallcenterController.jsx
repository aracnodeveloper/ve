import CallcenterService from "../../services/callcenter/CallcenterService";

const callcenterService = new CallcenterService();

export const getCuentaGratis = async function (filtros) {
  try {
    const session = JSON.parse(localStorage.getItem("datos"));
    if (!session) return false;

    var params = {
      token: session.token,
      id_vendedor: session.data?.id_usuario,
    };

    if (filtros.pagina > 0) {
      params.pagina = filtros.pagina;
    } else {
      params.pagina = 1;
    }
    if (filtros.fechas) {
      params.fechas = filtros.fechas;
    }
    if (filtros.nombre) {
      params.nombre = filtros.nombre;
    }
    if (filtros.correo) {
      params.correo = filtros.correo;
    }
    if (filtros.ci) {
      params.ci = filtros.ci;
    }
    if (filtros.cantidad) {
      params.cantidad = filtros.cantidad;
    }
    const res = await callcenterService.listarCuentasGratisCall(params);
    if (res && res.estado) {
      return res.data;
    }
  } catch (e) {
    console.log(e);
  }
  return false;
};

export const gestionarCuentaGratis = async function ({
  tipo,
  idUsuario,
  idSuscripcion,
  llamada,
  comentario,
}) {
  try {
    const session = JSON.parse(localStorage.getItem("datos"));
    if (!session) return false;

    var params = {
      token: session.token,
      tipo: tipo,
      id_tbl_usuario: idUsuario,
      estado_llamada: llamada,
      comentario: comentario,
      id_tbl_suscripcion_renovacion: idSuscripcion,
    };
    const res = await callcenterService.gestionarCuentasGratisCall(params);
    if (res && res.estado) {
      //console.log(res)
      return res.data;
    }
  } catch (e) {
    console.log(e);
  }
  return false;
};
