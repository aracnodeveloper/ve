import SuscriptoresService from "../../services/suscriptores/SuscriptoresService";

const susService = new SuscriptoresService();

export const listarSuscriptores = async function ({
  filtros,
  pagina = 1,
  idUsuario,
}) {
  try {
    const session = JSON.parse(localStorage.getItem("datos"));
    if (!session) return;

    var params = {
      token: session.token,
      pagina: pagina,
    };
    if (idUsuario) {
      params.id_tbl_usuario = idUsuario;
    }
    if (filtros && filtros.cod_vendedor) {
      params.cod_vendedor = filtros.cod_vendedor;
    }
    if (filtros && filtros.nombre_vendedor) {
      params.nombre_vendedor = filtros.nombre_vendedor;
    }
    if (filtros && filtros.ci_cliente) {
      params.ci_cliente = filtros.ci_cliente;
    }
    if (filtros && filtros.cod_cliente) {
      params.cod_cliente = filtros.cod_cliente;
    }
    if (filtros && filtros.nombre_cliente) {
      params.nombre_cliente = filtros.nombre_cliente;
    }

    if (filtros.cantidad) {
      params.cantidad = filtros.cantidad;
    }

    if (filtros.cantidad) {
      params.cantidad = filtros.cantidad;
    }

    console.log("Params", params);

    const res = await susService.listarSuscriptores(params);
    if (res.estado && res.codigo == 0) {
      // falso
      return res["data"];
    }
  } catch (e) {
    console.log(e);
  }
};
