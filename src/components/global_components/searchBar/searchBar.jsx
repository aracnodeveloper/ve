import { DateRange } from "react-date-range";
import { useEffect, useState, useRef } from "react";
import { es, is } from "react-date-range/dist/locale/";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useLocation, useNavigate } from "react-router-dom";
import { ClickAwayListener } from "@mui/material";
import { getEstablacimientoDestino } from "../../../controllers/establecimiento/establecimientoController";
import Icons from "../../../global/icons";
import MenuTabs from "../menu_tabs/MenuTabs";

const SearchBar = (props) => {
  const { Place, Dates, Options, type, onSearch } = props;
  const [inputValue, setInputValue] = useState("");
  const icons = new Icons();
  const location = useLocation();
  const inputRef = useRef(null);


  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClickAway = () => {
    if (openOptions) {
      setOpenOptions(false);
    }
    if (suggestion) {
      setSuggestion(null);
    }
  };

  const handleDateClickAway = () => {
    setOpenDate(false);
  };

  const [destination, setDestination] = useState(
    Place != null
      ? Place
      : {
          Titulo: "",
          Tipo: "",
          Id: "",
          Lugar: "",
        }
  );
  const [openDate, setOpenDate] = useState(false);
  const [date, setDate] = useState(
    Dates != null
      ? Dates
      : [
          {
            startDate: new Date(),
            endDate: new Date().setDate(new Date().getDate() + 1),
            key: "selection",
          },
        ]
  );
  const [openOptions, setOpenOptions] = useState(false);

  const formatDate = (date) => {
    const options = { weekday: "short", day: "2-digit", month: "short" };
    const formattedDate = date.toLocaleDateString("es-ES", options);
    return formattedDate;
  };

  const [options, setOptions] = useState(
    Options != null
      ? Options
      : {
          adult: 1,
          children: 0,
          childrenAges: [],
          room: 1,
        }
  );

  const [openSearch, setOpenSearch] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  const [selectedAges, setSelectedAges] = useState([]);

  const handleAgeChange = (event, index) => {
    const newSelectedAges = [...options["childrenAges"]];
    newSelectedAges[index] = parseInt(event.target.value, 10);
    setOptions((prev) => {
      return {
        ...prev,
        childrenAges: newSelectedAges,
      };
    });
  };

  const handleOption = (name, operation) => {
    if ((name == "children") & (operation == "i")) {
      const tmpSelectedAges = [...options["childrenAges"]];
      tmpSelectedAges.push(0);
      setOptions((prev) => {
        return {
          ...prev,
          childrenAges: tmpSelectedAges,
        };
      });
    }
    if ((name == "children") & (operation == "d")) {
      const tmpSelectedAges = [...options["childrenAges"]];
      tmpSelectedAges.pop();

      setOptions((prev) => {
        return {
          ...prev,
          childrenAges: tmpSelectedAges,
        };
      });
    }
    setOptions((prev) => {
      return {
        ...prev,
        [name]: operation === "i" ? options[name] + 1 : options[name] - 1,
      };
    });
  };

  const navigate = useNavigate();

  const handleSearch = () => {

    const path = `/busqueda/?destino=${encodeURIComponent(
      JSON.stringify(destination)
    )}&fechas=${encodeURIComponent(
      JSON.stringify(date)
    )}&opciones=${encodeURIComponent(JSON.stringify(options))}`;
    if (type === 0 || type === 3) {
      navigate(path);
    }
    if (type === 1 || type === 4) {
      navigate(path);
      window.location.reload();
    }
    if (type == 2) {
      window.open("/#" + path);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== "") {
        getEstablacimientoDestino(inputValue).then((res) => {
          if (res) {
            if (res == 401) {
              localStorage.removeItem("datos");
              window.location.reload();
            } else {
              setSuggestion(res);
            }
          }
        });
      } else {
        setSuggestion(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleChange = (value) => {
    setInputValue(value);
    setDestination({ Titulo: value });
  };

  const handleChangeDate = (value) => {
    setDate(value);
  };

  // Sincroniza con el padre (Hotel) en tiempo real cuando cambian opciones o fechas
  useEffect(() => {
    if (onSearch) {
      onSearch({ destination, date, options });
    }
  }, [options, date]);

  const ishotel = location.pathname.includes("busqueda") || location.pathname.includes("hotel");
    const isbusqueda = location.pathname.includes("busqueda") ;

    const isMobile = window.innerWidth < 768; // Puedes ajustar el breakpoint según tus necesidades


  return type === 0 || type === 1 ? (
    <div className="relative -mt-3">
      <div className={`w-full ${ishotel ? "hidden" : ""} ${isMobile ? "hidden" : ""}`} >
      <MenuTabs/>
      </div>
      <>
        <div className={`bottom-[0px] bg-white relative rounded-lg  w-full mt-1 border-2 border-amber-400 shadow-lg ${isbusqueda ? `mt-10` : ""} `}>
          <div className="grid lg:grid-cols-12 md:grid-cols-12 grid-flow-row">
            <div className="gap-3 col-span-4 max-sm:col-span-1 bg-white flex items-center justify-center m-0 rounded-l-lg pl-4 relative border-r border-gray-200 cursor-text" onClick={handleContainerClick}>
              <div className="flex items-center gap-3 w-full">
                <div dangerouslySetInnerHTML={{ __html: icons.Data.Bed }} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder=" ¿A dónde vas?"
                  className="w-full max-w-full overflow-hidden placeholder-gray-600 mr-4 focus:outline-none"
                  onChange={(e) => handleChange(e.target.value)}
                  onClick={() => setOpenSearch(true)}
                  value={
                    destination.Titulo.charAt(0).toUpperCase() +
                    destination.Titulo.slice(1)
                  }
                />
              </div>
              {suggestion && (
                <ClickAwayListener onClickAway={handleClickAway}>
                  <div className=" absolute top-12 max-h-[17rem] w-[24rem] bg-white z-50 shadow-2xl p-2 overflow-y-auto  rounded-lg">
                    {suggestion.map((item, key) => (
                      <div
                        key={key}
                        className={`flex items-center p-1 ${
                          key !== suggestion.length - 1 ? "border-b" : ""
                        } cursor-pointer gap-2`}
                        onClick={() => (
                          setDestination(item), setSuggestion(null)
                        )}
                      >
                        {item.Tipo === "destino" ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: icons.Data.MapPin,
                            }}
                          />
                        ) : (
                          <div
                            dangerouslySetInnerHTML={{ __html: icons.Data.Bed }}
                          />
                        )}
                        <div className="flex flex-col p-1 cursor-pointer">
                          <label
                            key={key}
                            className="text-sm font-semibold cursor-pointer"
                          >
                            {item.Titulo.charAt(0).toUpperCase() +
                              item.Titulo.slice(1)}
                          </label>
                          <label className="text-xs cursor-pointer">
                            {item.Lugar.charAt(0).toUpperCase() +
                              item.Lugar.slice(1)}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </ClickAwayListener>
              )}
            </div>
            <div className="col-span-3  border-r border-gray-200 px-4 py-2 flex flex-col items-start cursor-pointer" onClick={() => setOpenDate(!openDate)}>
                <div className="flex flex-row items-center gap-3">

                <span><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16"><path fill="#929292" d="M14 1v3h-3V1H5v3H2V1H0v15h16V1h-2zM3 15H1v-2h2v2zm0-3H1v-2h2v2zm0-3H1V7h2v2zm3 6H4v-2h2v2zm0-3H4v-2h2v2zm0-3H4V7h2v2zm3 6H7v-2h2v2zm0-3H7v-2h2v2zm0-3H7V7h2v2zm3 6h-2v-2h2v2zm0-3h-2v-2h2v2zm0-3h-2V7h2v2zm3 6h-2v-2h2v2zm0-3h-2v-2h2v2zm0-3h-2V7h2v2z"/><path fill="#929292" d="M3 0h1v3H3V0zm9 0h1v3h-1V0z"/></svg></span>
                <div>
                    <label className="text-sm text-gray-600 font-normal block mb-1 mt-1">
                      Fecha de entrada y salida
                    </label>
                    <div
                      className="flex items-center text-xs text-gray-800 font-medium"
                    >
                      {`${formatDate(new Date(date[0].startDate))} - ${formatDate(
                        new Date(date[0].endDate)
                      )}`}
                </div>
            </div>
          </div>
              {openDate && (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    onClick={handleDateClickAway}
  >
    <div 
      className="bg-white rounded-lg shadow-2xl max-w-full overflow-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <DateRange
        editableDateInputs={true}
        onChange={(item) =>
          handleChangeDate([
            item.selection ? item.selection : item["Invalid Date"],
          ])
        }
        moveRangeOnFirstSelection={false}
        ranges={date}
        locale={es}
        months={1}
        direction="horizontal"
        rangeColors={["#96c121"]}
        minDate={new Date()}
      />
      <div className="flex justify-end p-3 border-t border-gray-200">
        <button
          onClick={handleDateClickAway}
          className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-2 rounded-lg text-sm"
        >
          Aplicar fechas
        </button>
      </div>
    </div>
  </div>
)}
            </div>
            <div className="col-span-3 border-r border-gray-200 px-4 py-2 flex flex-col items-start cursor-pointer" onClick={() => setOpenOptions(!openOptions)}>
              <div className="flex flex-row items-center gap-5 w-full">
                <span><svg width="22" height="22" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#929292"><g fill="none" stroke="#929292" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10"><path d="m20.5 23.5l-2-7L12 15l-6.5 1.5l-2 7zM8.625 5.812L12 7.5h4.5"/><path d="M16.5 12.25L12 14l-4.5-1.75v-6L12 4.5l4.5 1.75zm-6-2.25v-.5m3 .5v-.5m.953 6.066L12 19.5l-2.453-3.934"/></g></svg></span>
                <div className="flex flex-col items-center flex-1">
                  <label className="text-sm font-normal mb-1">
                    Personas y habitaciones
                  </label>
                  <span
                    className="text-xs"
                  >{`${options.adult} ${options.adult > 1 ? "adultos" : "adulto"} · 
                        ${options.children} ${
                    options.children != 1 ? "niños" : "niño"
                  } · 
                        ${options.room} ${
                    options.room > 1 ? "habitaciones" : "habitación"
                  }`}</span>
                </div>
              </div>
              {/* El panel lleva stopPropagation: vive dentro del div que abre y
                  cierra el desplegable, asi que sin eso cada clic en + o -
                  llegaba hasta el padre y lo cerraba. Mismo recurso que ya usa
                  el panel del calendario. */}
              {openOptions && (
                <ClickAwayListener onClickAway={handleClickAway}>
                  <div
                    className="absolute top-16 bg-white shadow-xl px-1 py-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between px-3 ">
                      <span>Adultos</span>
                      <div className="flex items-center justify-between border border-greenVE-600 rounded-md ">
                        <button
                          disabled={options.adult <= 1}
                          className="w-7 h-7 disabled:cursor-not-allowed hover:bg-greenVE-100 hover:rounded-l-md text-greenVE-700 disabled:text-gray-400"
                          onClick={() => handleOption("adult", "d")}
                        >
                          -
                        </button>
                        <span className="w-7 text-center">{options.adult}</span>
                        <button
                          className="w-7 h-7  cursor-pointer hover:bg-greenVE-100 hover:rounded-r-md text-greenVE-700 disabled:text-gray-400"
                          onClick={() => handleOption("adult", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between px-3 pt-2">
                      <span>Niños</span>
                      <div className="flex items-center justify-between border border-greenVE-600 rounded-md">
                        <button
                          disabled={options.children <= 0}
                          className="w-7 h-7  cursor-pointer disabled:cursor-not-allowed hover:bg-greenVE-100 hover:rounded-l-md text-greenVE-700 disabled:text-gray-400"
                          onClick={() => handleOption("children", "d")}
                        >
                          -
                        </button>
                        <span className="w-7 text-center">{options.children}</span>
                        <button
                          className="w-7 h-7 cursor-pointer rounded-sm hover:bg-greenVE-100 hover:rounded-r-md text-greenVE-700 disabled:text-gray-400"
                          disabled={options.children >= 10}
                          onClick={() => handleOption("children", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 px-3">
                      {Array.from({ length: options.children }, (_, index) => (
                        <select
                          key={index}
                          name="age"
                          value={options["childrenAges"][index]}
                          className="px-2 bg-white border border-greenVE-400 rounded-sm mt-2"
                          onChange={(event) => handleAgeChange(event, index)}
                        >
                          <option value="0" data-key="0">
                            0 años
                          </option>
                          <option value="1" data-key="1">
                            1 año
                          </option>
                          <option value="2" data-key="2">
                            2 años
                          </option>
                          <option value="3" data-key="3">
                            3 años
                          </option>
                          <option value="4" data-key="4">
                            4 años
                          </option>
                          <option value="5" data-key="5">
                            5 años
                          </option>
                          <option value="6" data-key="6">
                            6 años
                          </option>
                          <option value="7" data-key="7">
                            7 años
                          </option>
                          <option value="8" data-key="8">
                            8 años
                          </option>
                          <option value="9" data-key="9">
                            9 años
                          </option>
                          <option value="10" data-key="10">
                            10 años
                          </option>
                          <option value="11" data-key="11">
                            11 años
                          </option>
                          <option value="12" data-key="12">
                            12 años
                          </option>
                        </select>
                      ))}
                    </div>
                    <div className="flex justify-between px-3 pt-2">
                      <span className="mr-6 ">Habitaciones</span>
                      <div className="flex items-center justify-between border border-greenVE-600 rounded-md">
                        <button
                          disabled={options.room <= 1}
                          className="w-7 h-7  cursor-pointer disabled:cursor-not-allowed hover:bg-greenVE-100 hover:rounded-l-md text-greenVE-700 disabled:text-gray-400"
                          onClick={() => handleOption("room", "d")}
                        >
                          -
                        </button>
                        <span className="w-7 text-center">{options.room}</span>
                        <button
                          className="w-7 h-7 cursor-pointer hover:bg-greenVE-100 hover:rounded-r-md text-greenVE-700 disabled:text-gray-400"
                          onClick={() => handleOption("room", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </ClickAwayListener>
              )}
            </div>
            <div onClick={handleSearch} className="flex cursor-pointer justify-center col-span-2 bg-greenVE-600 rounded-r-lg">
              <button
                className="text-white font-semibold"
             
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      </>
    </div>
  ) : (
    <div className={`${ishotel ? "p-0 ": "p-4"}`}>
      <div className="bg-white rounded-lg shadow-lg border-2 border-amber-400 overflow-hidden">
        {/* Campo de búsqueda - Destino */}
        <div className="relative border-b border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 cursor-text" onClick={handleContainerClick}>
            <div dangerouslySetInnerHTML={{ __html: icons.Data.Bed }} className="text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              placeholder="¿A dónde vas?"
              className="w-full placeholder-gray-600 focus:outline-none text-sm"
              onChange={(e) => handleChange(e.target.value)}
              onClick={() => setOpenSearch(true)}
              value={
                destination.Titulo.charAt(0).toUpperCase() +
                destination.Titulo.slice(1)
              }
            />
          </div>
          {suggestion && (
            <ClickAwayListener onClickAway={handleClickAway}>
              <div className="absolute top-full left-0 right-0 max-h-64 bg-white z-50 shadow-2xl overflow-y-auto border-t border-gray-200">
                {suggestion.map((item, key) => (
                  <div
                    key={key}
                    className={`flex items-center p-3 ${
                      key !== suggestion.length - 1 ? "border-b border-gray-100" : ""
                    } cursor-pointer gap-3 hover:bg-gray-50 active:bg-gray-100`}
                    onClick={() => (
                      setDestination(item), setSuggestion(null)
                    )}
                  >
                    {item.Tipo == "destino" ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: icons.Data.MapPin,
                        }}
                        className="text-gray-500"
                      />
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{ __html: icons.Data.Bed }}
                        className="text-gray-500"
                      />
                    )}
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-gray-800">
                        {item.Titulo.charAt(0).toUpperCase() +
                          item.Titulo.slice(1)}
                      </label>
                      <label className="text-xs text-gray-500">
                        {item.Lugar.charAt(0).toUpperCase() +
                          item.Lugar.slice(1)}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </ClickAwayListener>
          )}
        </div>

        {/* Fechas */}
        <div className="border-b border-gray-200 px-4 py-3">
            <div className="flex flex-row items-center gap-3">

            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16"><path fill="#929292" d="M14 1v3h-3V1H5v3H2V1H0v15h16V1h-2zM3 15H1v-2h2v2zm0-3H1v-2h2v2zm0-3H1V7h2v2zm3 6H4v-2h2v2zm0-3H4v-2h2v2zm0-3H4V7h2v2zm3 6H7v-2h2v2zm0-3H7v-2h2v2zm0-3H7V7h2v2zm3 6h-2v-2h2v2zm0-3h-2v-2h2v2zm0-3h-2V7h2v2zm3 6h-2v-2h2v2zm0-3h-2v-2h2v2zm0-3h-2V7h2v2z"/><path fill="#929292" d="M3 0h1v3H3V0zm9 0h1v3h-1V0z"/></svg>
            <div>
                <label className="text-sm text-gray-600 font-normal block mb-1">
                  Fecha de entrada y salida
                </label>
                <div
                  onClick={() => setOpenDate(!openDate)}
                  className="flex items-center text-xs cursor-pointer text-gray-800 font-medium"
                >
                  {`${formatDate(new Date(date[0].startDate))} - ${formatDate(
                    new Date(date[0].endDate)
                  )}`}
                </div>
            </div>
          </div>
   {openDate && (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    onClick={handleDateClickAway}
  >
    <div 
      className="bg-white rounded-lg shadow-2xl max-w-full overflow-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <DateRange 
        editableDateInputs={true}
        onChange={(item) =>
          handleChangeDate([
            item.selection ? item.selection : item["Invalid Date"],
          ])
        }
        moveRangeOnFirstSelection={false}
        ranges={date}
        locale={es}
        months={1}
        direction="horizontal"
        rangeColors={["#96c121"]}
        minDate={new Date()}
      />
      <div className="flex justify-end p-3 border-t border-gray-200">
        <button
          onClick={handleDateClickAway}
          className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6 py-2 rounded-lg text-sm"
        >
          Aplicar fechas
        </button>
      </div>
    </div>
  </div>
)}
        </div>

        {/* Personas y habitaciones */}
        <div className="px-4 py-3">
          <div className="flex flex-row items-center gap-3">
                <span><svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#929292"><g fill="none" stroke="#929292" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10"><path d="m20.5 23.5l-2-7L12 15l-6.5 1.5l-2 7zM8.625 5.812L12 7.5h4.5"/><path d="M16.5 12.25L12 14l-4.5-1.75v-6L12 4.5l4.5 1.75zm-6-2.25v-.5m3 .5v-.5m.953 6.066L12 19.5l-2.453-3.934"/></g></svg></span>
                <div className="flex flex-col">
                  <label className="text-sm font-normal ">
                    Personas y habitaciones
                  </label>
                  <span
                    className="text-xs cursor-pointer"
                    onClick={() => setOpenOptions(!openOptions)}
                  >{`${options.adult} ${options.adult > 1 ? "adultos" : "adulto"} · 
                        ${options.children} ${
                    options.children != 1 ? "niños" : "niño"
                  } · 
                        ${options.room} ${
                    options.room > 1 ? "habitaciones" : "habitación"
                  }`}</span>
                </div>
              </div>
          {openOptions && (
            <ClickAwayListener onClickAway={handleClickAway}>
              <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
                <div className="bg-white w-full max-w-md rounded-t-2xl shadow-2xl p-4 max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">Opciones de búsqueda</h3>
                    <button 
                      onClick={() => setOpenOptions(false)}
                      className="text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Adultos</span>
                      <div className="flex items-center justify-between border-2 border-greenVE-600 rounded-lg">
                        <button
                          disabled={options.adult <= 1}
                          className="w-10 h-10 disabled:cursor-not-allowed cursor-pointer hover:bg-greenVE-100 rounded-l-lg text-greenVE-700 disabled:text-gray-400 font-semibold text-lg"
                          onClick={() => handleOption("adult", "d")}
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-semibold text-gray-800">{options.adult}</span>
                        <button
                          className="w-10 h-10 cursor-pointer hover:bg-greenVE-100 rounded-r-lg text-greenVE-700 font-semibold text-lg"
                          onClick={() => handleOption("adult", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Niños</span>
                      <div className="flex items-center justify-between border-2 border-greenVE-600 rounded-lg">
                        <button
                          disabled={options.children <= 0}
                          className="w-10 h-10 cursor-pointer disabled:cursor-not-allowed hover:bg-greenVE-100 rounded-l-lg text-greenVE-700 disabled:text-gray-400 font-semibold text-lg"
                          onClick={() => handleOption("children", "d")}
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-semibold text-gray-800">{options.children}</span>
                        <button
                          className="w-10 h-10 cursor-pointer hover:bg-greenVE-100 rounded-r-lg text-greenVE-700 disabled:text-gray-400 font-semibold text-lg"
                          disabled={options.children >= 10}
                          onClick={() => handleOption("children", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    {options.children > 0 && (
                      <div className="pt-2">
                        <label className="text-xs text-gray-600 font-medium block mb-2">
                          Edad de los niños
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {Array.from({ length: options.children }, (_, index) => (
                            <select
                              key={index}
                              name="age"
                              value={options["childrenAges"][index]}
                              className="px-3 py-2 bg-white border-2 border-greenVE-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-greenVE-500"
                              onChange={(event) => handleAgeChange(event, index)}
                            >
                              <option value="0">0 años</option>
                              <option value="1">1 año</option>
                              <option value="2">2 años</option>
                              <option value="3">3 años</option>
                              <option value="4">4 años</option>
                              <option value="5">5 años</option>
                              <option value="6">6 años</option>
                              <option value="7">7 años</option>
                              <option value="8">8 años</option>
                              <option value="9">9 años</option>
                              <option value="10">10 años</option>
                              <option value="11">11 años</option>
                              <option value="12">12 años</option>
                            </select>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Habitaciones</span>
                      <div className="flex items-center justify-between border-2 border-greenVE-600 rounded-lg">
                        <button
                          disabled={options.room <= 1}
                          className="w-10 h-10 cursor-pointer disabled:cursor-not-allowed hover:bg-greenVE-100 rounded-l-lg text-greenVE-700 disabled:text-gray-400 font-semibold text-lg"
                          onClick={() => handleOption("room", "d")}
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-semibold text-gray-800">{options.room}</span>
                        <button
                          className="w-10 h-10 cursor-pointer hover:bg-greenVE-100 rounded-r-lg text-greenVE-700 font-semibold text-lg"
                          onClick={() => handleOption("room", "i")}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full bg-greenVE-600 text-white font-semibold py-3 rounded-lg mt-6 hover:bg-greenVE-700 transition-colors"
                    onClick={() => setOpenOptions(false)}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </ClickAwayListener>
          )}
        </div>

        {/* Botón de búsqueda */}
        <div    onClick={handleSearch} className="px-4 cursor-pointer pb-4">
          <button
            className="w-full bg-greenVE-600 hover:bg-greenVE-700 text-white font-semibold py-3 rounded-lg transition-colors"
          
          >
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;