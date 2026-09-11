import React, { useEffect, useState } from "react";
import CashbackTotal from "./CashbackTotal";
import CashbackPorFacturar from "./CashbackPorFacturar";
import CashbackEnProceso from "./CashbackEnProceso";
import CashbackFacturado from "./CashbackFacturado";
import { es } from "react-date-range/dist/locale/";
import { Checkbox, ClickAwayListener } from "@mui/material";
import { setSolicitudCashback } from "../../../controllers/perfil/perfilController";
import { Spinner } from "@material-tailwind/react";
import CashbackFactura from "./CashbackFactura";
import MisSuscriptores from "./MisSuscriptores";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file

const Cashback = () => {
  const [historial, setHistorial] = useState();
  const [title, setTitle] = useState();
  const [checkedItems, setCheckedItems] = useState({});
  const [cambiar, setCambiar] = useState(false);
  const [correcto, setCorrecto] = useState(false);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [date, setDate] = useState([
    {
      startDate: new Date("2024-01-01"),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date("2024-01-02"),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleClickAway = () => {
    if (openDate) {
      setOpenDate(false);
    }
  };

  const handleClickBuscar = () => {
    setDate(dateRange);
  };

  const handleChange = (event) => {
    const { name, checked } = event.target;
    if (checked) {
      setTotal(
        total +
          parseFloat(
            historial.find((item) => item.id_tbl_red_comision === name).valor
          )
      );
    } else {
      setTotal(
        total -
          parseFloat(
            historial.find((item) => item.id_tbl_red_comision === name).valor
          )
      );
    }
    setCheckedItems({ ...checkedItems, [name]: checked });
  };

  const handleClickCobrar = () => {
    setCargando(true);
    //var totalTmp =0;
    var ids = "";
    for (const key in checkedItems) {
      if (checkedItems[key]) {
        ids += key + ",";
      }
    }
    //setTotal(totalTmp)
    setSolicitudCashback(ids.slice(0, -1)).then((result) => {
      if (result) {
        setCambiar(!cambiar);
        setHistorial();
        setCorrecto(true);
      }
      setCargando(false);
    });
  };

  const handleChangeDate = (value) => {
    setDateRange(value);
  };

  const formatDate = (date) => {
    const options = { weekday: "short", day: "2-digit", month: "short" };
    const formattedDate = date.toLocaleDateString("es-ES", options);
    return formattedDate;
  };

  return (
    <div className="flex flex-col ">
      <div className="flex justify-between items-center border-b pb-2">
        <div className="flex flex-col">
          <h1 className="font-semibold text-3xl">Cashback</h1>
          <label>Revisa tu estado de cuenta</label>
        </div>
      </div>
      <div className="flex p-3 justify-center">
        <div className="border py-1 px-2 flex items-center gap-2 rounded-l-lg">
          <span className="icon-[material-symbols--calendar-today-outline]"></span>
          <span
            onClick={() => setOpenDate(!openDate)}
            className="placeholder-gray-600 hover:cursor-pointer "
          >{`${formatDate(new Date(dateRange[0].startDate))} al ${formatDate(
            new Date(dateRange[0].endDate)
          )}`}</span>
          {openDate && (
            <ClickAwayListener onClickAway={handleClickAway}>
              <DateRange
                editableDateInputs={true}
                onChange={(item) =>
                  handleChangeDate([
                    item.selection ? item.selection : item["Invalid Date"],
                  ])
                }
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
                locale={es}
                months={2}
                direction="horizontal"
                className="absolute mt-100 shadow-xl z-50"
                rangeColors={["#96c121"]}
              />
            </ClickAwayListener>
          )}
        </div>
        <button className="bg-greenVE-500 text-white px-2 rounded-r-lg">
          Buscar
        </button>
      </div>

      <div className="flex gap-2">
        <CashbackTotal
          setHistorial={setHistorial}
          setTitle={setTitle}
          cambiar={cambiar}
          fechas={date}
        />
        <CashbackPorFacturar
          setHistorial={setHistorial}
          setTitle={setTitle}
          cambiar={cambiar}
          fechas={date}
        />
        <CashbackEnProceso
          setHistorial={setHistorial}
          setTitle={setTitle}
          cambiar={cambiar}
          fechas={date}
        />
        <CashbackFacturado
          setHistorial={setHistorial}
          setTitle={setTitle}
          cambiar={cambiar}
          fechas={date}
        />
      </div>
      {title && historial && (
        <div
          className={`w-full text-white flex items-center justify-center mb-3 rounded-lg ${
            title == "Ventas totales"
              ? "bg-green-700"
              : title == "Ventas por facturar"
              ? "bg-blue-500"
              : title == "Ventas en proceso de pago"
              ? "bg-amber-500"
              : "bg-greenVE-500"
          }`}
        >
          <div className="w-full flex items-center justify-center">
            <label>{title}</label>
          </div>
          {title == "Ventas por facturar" ? (
            <button
              className="bg-red-500 px-6 rounded-r-md font-medium"
              onClick={() => (!cargando ? handleClickCobrar() : () => {})}
            >
              {!cargando ? "Cobrar $" + total.toFixed(2) : <Spinner></Spinner>}
            </button>
          ) : (
            <></>
          )}
        </div>
      )}
      <div className="flex flex-col gap-3 max-h-80 overflow-auto">
        {historial &&
          historial.map((item) => (
            <div className="flex flex-col rounded-lg">
              <div
                className={`${
                  item.estado == "EnProceso"
                    ? "bg-[#ffecb4]"
                    : item.estado == "PorFacturar"
                    ? "bg-[#bbdefa]"
                    : "bg-greenVE-100"
                } flex justify-between px-4 text-black rounded-t-lg text-sm py-1 items-center font-medium`}
              >
                <label>{item.producto}</label>
                <label className="text-lg font-semibold">
                  ${parseFloat(item.valor).toFixed(2)}
                </label>
              </div>
              <div className="border-l-2 border-r-2 border-b-2 rounded-b-lg px-3 py-1 gap-2">
                {title == "Ventas por facturar" ? (
                  <input
                    className="mr-3"
                    type="checkbox"
                    name={item.id_tbl_red_comision}
                    checked={checkedItems[item.id_tbl_red_comision] || false}
                    onChange={handleChange}
                  />
                ) : (
                  <di></di>
                )}
                <label className="text-sm">
                  {item.estado == "PorFacturar"
                    ? "Fecha de venta: "
                    : item.estado == "EnProceso"
                    ? "Fecha de solicitud: "
                    : "Fecha de pago: "}
                  {item.fecha}
                </label>
              </div>
            </div>
          ))}
      </div>
      <MisSuscriptores fechas={date} cambiar={cambiar} />

      {correcto ? <CashbackFactura total={total} /> : <></>}
    </div>
  );
};

export default Cashback;
