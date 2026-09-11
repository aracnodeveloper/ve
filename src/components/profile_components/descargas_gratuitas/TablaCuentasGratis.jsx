import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import Config from "../../../global/config";
import EditarCuentaGratis from "./EditarCuentaGratis";
import { capitalize } from "../../../global/util";
import { getDetalleClienteRise } from "../../../controllers/rise/RiseController";
import VisualizadorRise from "./VisualizadorRise";

const TablaCuentasGratis = ({ listado, handleUpdateData }) => {
  const [loadingId, setLoadingId] = useState();
  const [editId, setEditId] = useState();
  var cedulaCRM = "";
  const [openEdit, setOpenEdit] = useState(false);
  const [openCRM, setOpenCRM] = useState(false);
  const [dataCRM, setDataCRM] = useState();
  const [sinDatos, setSinDatos] = useState(null);

  // Consulta el detalle del cliente en RIS (antes iba al CRM viejo).
  const handleClickCrm = () => {
    const cedula = cedulaCRM;
    setSinDatos(null);
    getDetalleClienteRise(cedula)
      .then((res) => {
        if (res) {
          setDataCRM(res);
          setOpenCRM(true);
        } else {
          // RIS devuelve 404 cuando la cedula no esta registrada: se avisa en
          // vez de dejar el boton sin reaccion aparente.
          setSinDatos(cedula);
          setTimeout(() => setSinDatos(null), 4000);
        }
      })
      .finally(() => {
        setLoadingId();
      });
  };

  const obtenerReservaPorId = (id) => {
    return listado.find((map) => map.id_tbl_usuario === id);
  };

  const buttonEditar = (id) => {
    return (
      <div className="flex justify-start items-center h-full w-full gap-2 mt-1">
        <div
          title="Editar reserva"
          onClick={() => {
            setEditId(id);
            setOpenEdit(true);
          }}
        >
          <a className="icon-[typcn--edit] w-5 h-5 hover:bg-blue-600 cursor-pointer text-gray-500" />
        </div>
      </div>
    );
  };

  const buttonCRM = (id) => {
    return (
      <div>
        <div
          title="Ver detalle en RIS"
          onClick={() => {
            cedulaCRM = id;
            setLoadingId(id);
            handleClickCrm();
          }}
        >
          {loadingId === id ? (
            <a className="icon-[line-md--loading-twotone-loop] w-5 h-5 hover:bg-blue-600 cursor-pointer text-gray-500" />
          ) : (
            <a className="icon-[material-symbols-light--data-loss-prevention-outline-rounded] w-5 h-5 hover:bg-blue-600 cursor-pointer text-gray-500" />
          )}
        </div>
      </div>
    );
  };
  /**
   * Una cuenta es "prueba gratis" mientras no tenga suscripcion asociada.
   * listarCuentasGratisPatrocinador devuelve s.id_tbl_suscripcion en la raiz del
   * item (viene de un LEFT JOIN, asi que llega null cuando el usuario solo se
   * descargo la app y todavia no compro).
   */
  const esSuscriptor = (item) =>
    item.id_tbl_suscripcion != null &&
    item.id_tbl_suscripcion !== "" &&
    parseInt(item.id_tbl_suscripcion) > 0;

  const badgeTipo = (suscriptor) => (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
        suscriptor
          ? "bg-greenVE-100 text-greenVE-700"
          : "bg-blue-50 text-blue-600"
      }`}
    >
      {suscriptor ? "Suscriptor" : "Prueba gratis"}
    </span>
  );

  // Definir las columnas y su configuración
  const columns = [
    { field: "id", headerName: "#", flex: 2 },
    {
      field: "opciones",
      headerName: "Opc.",
      flex: 7,
      renderCell: (params) => buttonEditar(params.row.id_tbl_usuario),
      sortable: false,
    },
    {
      field: "tipo",
      headerName: "Tipo",
      flex: 10,
      renderCell: (params) => badgeTipo(params.row.esSuscriptor),
    },
    { field: "nombre", headerName: "Nombre", flex: 19 },
    { field: "ci", headerName: "Cédula", flex: 10 },
    { field: "mail", headerName: "Correo", flex: 19 },
    { field: "telefono", headerName: "Teléfono", flex: 10 },
    { field: "fecha", headerName: "Fecha", flex: 8 },
    { field: "hora", headerName: "Hora", flex: 8 },
    {
      field: "crm",
      headerName: "CRM",
      flex: 5,
      renderCell: (params) => buttonCRM(params.row.ci),
      sortable: false,
    },
  ];

  // Mapear la lista recibida a las filas
  const rows = listado.map((item, index) => ({
    id: index + 1, // Utilizo el índice + 1 como identificador
    id_tbl_usuario: item.id_tbl_usuario,
    esSuscriptor: esSuscriptor(item),
    // Valor de texto para que la columna se pueda ordenar por tipo.
    tipo: esSuscriptor(item) ? "Suscriptor" : "Prueba gratis",
    nombre: capitalize(item.nombre),
    ci: item.ci,
    mail: item.mail,
    telefono: item.telefono,
    fecha: item.fecha.split(" ")[0],
    hora: item.fecha.split(" ")[1],
  }));

  return (
    <>
      <div style={{ width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableSelectionOnClick
          localeText={Config.esEs}
          hideFooterPagination={true}
          getRowClassName={(params) =>
            params.row.esSuscriptor ? "fila-suscriptor" : ""
          }
          sx={{
            ...(Config.SettingTable || {}),
            // Tinte suave para leer de un vistazo quien ya compro.
            "& .fila-suscriptor": { backgroundColor: "#f9fde8" },
          }}
          autoHeight
          pagination={false}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: rows.length,
              },
            },
          }}
        />
      </div>
      {editId && (
        <EditarCuentaGratis
          open={openEdit}
          setOpen={setOpenEdit}
          item={obtenerReservaPorId(editId)}
          handleUpdateData={handleUpdateData}
        />
      )}
      {sinDatos && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-gray-900 text-white rounded-lg px-4 py-2 shadow-lg">
          <span className="icon-[fluent--error-circle-24-regular] h-5 w-5 text-orange-400" />
          <span className="text-sm">
            RIS no tiene registro de la cédula {sinDatos}.
          </span>
        </div>
      )}
      {openCRM && dataCRM && (
        <VisualizadorRise
          open={openCRM}
          data={dataCRM}
          onClose={() => setOpenCRM(false)}
        />
      )}
    </>
  );
};

export default TablaCuentasGratis;
