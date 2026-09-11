import { useEffect, useState } from "react";
import { changePromoCode, updateProfileData } from "../../controllers/perfil/perfilController";
import ProfilePhoto from "./ProfilePhoto";
import { Spinner } from "@material-tailwind/react";

const ProfileEdit = ({ profileData, citiesData }) => {
    const [ciudad, setCiudad] = useState();
    const [errorCodigo, setErrorCodigo] = useState(false);
    const [direccionField, setDireccionField] = useState(profileData.Direccion);
    const [codigoField, setCodigoField] = useState(profileData.Codigo);
    const [cumpleaniosField, setCumpleaniosField] = useState(profileData.FechaNacimiento);
    const [contactosField, setContactosField] = useState(profileData.Contactos);
    const [fotoPerfil, setFotoPerfil] = useState(profileData.Foto);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProvincia, setSelectedProvincia] = useState(obtenerIndiceProvinciaPorValor(citiesData, profileData.IdLugar));
    const [selectedCanton, setSelectedCanton] = useState(profileData.IdLugar)
    const [editModes, setEditModes] = useState({
        codigo: false,
        ciudad: false,
        direccion: false,
        cumpleanios: false,
        contactos: Array(profileData.Contactos.length).fill(false),
    });

    const [loadingModes, setLoadingModes] = useState({
        codigo: false,
        ciudad: false,
        direccion: false,
        cumpleanios: false,
        contactos: Array(profileData.Contactos.length).fill(false),
    });

    const handleToggleEdit = (section) => {
        setEditModes((prevEditModes) => ({
            ...prevEditModes,
            [section]: !prevEditModes[section],
        }));
    };

    const handleCancel = (section) => {
        setEditModes((prevEditModes) => ({
            ...prevEditModes,
            [section]: false,
        }));
    };

    const handleSave = (section) => {
        setLoadingModes((prevLoadingModes) => ({
            ...prevLoadingModes,
            [section]: true,
        }));

        var key = ""
        var value = ""
        if ((section == "ciudad")) {
            key = "id_tbl_lugar";
            value = selectedCanton;
        }

        if ((section == "direccion")) {
            key = "direccion";
            value = direccionField;
        }

        if ((section == "cumpleanios")) {
            key = "fecha_nac";
            value = cumpleaniosField;
        }

        if ((section.includes("contactos"))) {
            key = "contactos";
            value = Object.values(contactosField).map(item => ({
                id_tbl_tipo_contacto: item.Valor,
                contacto: item.Titulo
            }));
        }

        if (section == "codigo") {
            changePromoCode(codigoField).then((res) => {
                if (res) {
                    if (res == 401) {
                        localStorage.removeItem("datos")
                        window.location.reload();
                    } else {
                        setLoadingModes((prevLoadingModes) => ({
                            ...prevLoadingModes,
                            [section]: false,
                        }));
                        setEditModes((prevEditModes) => ({
                            ...prevEditModes,
                            [section]: false,
                        }));
                        window.location.reload();
                    }
                } else {
                    setErrorCodigo(true);
                    setLoadingModes((prevLoadingModes) => ({
                        ...prevLoadingModes,
                        [section]: false,
                    }));
                }
            })
        } else {
            updateProfileData(key, value).then((res) => {
                if (res) {
                    if (res == 401) {
                        localStorage.removeItem("datos");
                        window.location.reload();
                    } else {
                        setLoadingModes((prevLoadingModes) => ({
                            ...prevLoadingModes,
                            [section]: false,
                        }));
                        setEditModes((prevEditModes) => ({
                            ...prevEditModes,
                            [section]: false,
                        }));
                        window.location.reload();
                    }
                } else {
                    setLoadingModes((prevLoadingModes) => ({
                        ...prevLoadingModes,
                        [section]: false,
                    }));
                }
            })
        }
    };

    const handleCumpleaniosChange = (event) => {
        setCumpleaniosField(event.target.value);
    };

    const handleCodigoChange = (event) => {
        setErrorCodigo(false);
        setCodigoField(event.target.value)
    }

    const handleDireccionChange = (event) => {
        setDireccionField(event.target.value);
    };

    const handleEditPhoto = () => {
        setModalOpen(!modalOpen);
    }

    const handleContactosChange = (event, index) => {
        setContactosField((prevContactosField) => {
            // Crear una copia del estado actual
            const newState = { ...prevContactosField };

            // Actualizar el título del objeto en el índice dado
            newState[index] = { ...newState[index], Titulo: event.target.value };

            // Devolver el nuevo estado
            return newState;
        });
    };

    const updateProfilePhoto = (imgSrc) => {
        setFotoPerfil(imgSrc);
    }

    const closeModal = () => {
        setModalOpen(false);
    }

    const handleChangeProvincia = (event) => {
        setSelectedProvincia(event.target.value)
    }

    const handleChangeCanton = (event) => {
        setSelectedCanton(event.target.value)
        for (let i = 0; i < citiesData.length; i++) {
            const provincia = citiesData[i];
            const cantones = provincia.Valor;

            for (let j = 0; j < cantones.length; j++) {
                const canton = cantones[j];

                if (canton.Valor === event.target.value) {
                    setCiudad(canton.Titulo);
                }
            }
        }
    }

    useEffect(() => {

        async function fetchData() {

            for (let i = 0; i < citiesData.length; i++) {
                const provincia = citiesData[i];
                const cantones = provincia.Valor;

                for (let j = 0; j < cantones.length; j++) {
                    const canton = cantones[j];

                    if (canton.Valor === profileData.IdLugar) {
                        setCiudad(canton.Titulo);
                    }
                }
            }
        }

        fetchData();
    }, []);

    return (
        <div className="flex flex-col">
            {
                modalOpen && <ProfilePhoto closeModal={closeModal} updateProfilePhoto={updateProfilePhoto} />
            }
            <div className="flex justify-between items-center border-b pb-2">
                <div className="flex flex-col">
                    <h1 className="font-semibold text-3xl">Datos personales</h1>
                    <label>Actualiza o revisa tus datos personales </label>
                </div>
                <div className="rounded-full bg-slate-300 h-14 w-14 border-4 border-greenVE-500 relative cursor-pointer" onClick={() => handleEditPhoto()}>
                    <img className="rounded-full w-14 h-12" src={fotoPerfil} />
                    <div className="flex items-center justify-center absolute bottom-0 left-0 right-0 text-center bg-gray-800 text-white h-6 opacity-75 rounded-b-full">
                        <label className="text-xxs cursor-pointer">Editar</label>
                    </div>
                </div>
            </div>
            <div className="flex py-5 border-b">
                <div className="flex w-10/12">
                    <div className="w-3/12">
                        <label className="text-sm font-semibold">Nombre:</label>
                    </div>
                    <div className="w-7/12">
                        <label className="text-sm">{profileData.Nombres}</label>
                    </div>
                </div>
            </div>
            {
                (profileData && profileData.Codigo && profileData.Codigo != "") &&
                <div className="flex py-5 border-b justify-between">
                    <div className="flex w-10/12">
                        <div className="w-3/12">
                            <label className="text-sm font-semibold">Código promocional:</label>
                        </div>
                        <div className="w-7/12">
                            {
                                editModes.codigo ? (
                                    <div className="flex gap-2 items-center">
                                        <input className="border border-greenVE-500 px-2 rounded-lg focus:outline-none text-sm" value={codigoField} onChange={handleCodigoChange}></input>
                                        {
                                            errorCodigo && <label className="text-xxs text-red-500">El código ya está en uso</label>
                                        }
                                    </div>
                                ) : (
                                    <label className="text-sm ">{codigoField}</label>
                                )
                            }
                        </div>
                    </div>
                    {editModes.codigo ? (
                        <>
                            <label className="text-sm text-red-500 cursor-pointer hover:underline" onClick={() => handleCancel('codigo')}>{loadingModes.codigo ? "" : "Cancelar"}</label>
                            <label className="ml-2 text-sm text-greenVE-500 cursor-pointer hover:underline" onClick={() => handleSave('codigo')}>{loadingModes.codigo ? <Spinner></Spinner> : "Guardar"}</label>
                        </>
                    ) : (
                        <label className="text-sm text-greenVE-500 cursor-pointer hover:underline" onClick={() => handleToggleEdit('codigo')}>Editar</label>
                    )}
                </div>
            }
            <div className="flex py-5 border-b justify-between">
                <div className="flex w-10/12">
                    <div className="w-3/12">
                        <label className="text-sm font-semibold">Ciudad:</label>
                    </div>
                    {
                        editModes.ciudad ? (
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-3">
                                    <label htmlFor="comboBox">Provincia:</label>
                                    <select id="provincias" value={selectedProvincia} onChange={handleChangeProvincia}>
                                        {
                                            citiesData.map((item, index) => (
                                                <option value={index} key={index}>{item.Titulo}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className="flex gap-7">
                                    <label htmlFor="comboBox">Cantón:</label>
                                    <select id="provincias" value={selectedCanton} onChange={handleChangeCanton}>
                                        {
                                            citiesData[selectedProvincia].Valor.map((item, index) => (
                                                <option value={item.Valor} key={item.Valor}>{item.Titulo}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        ) : (

                            <div className="w-7/12">
                                <label className="text-sm ">{ciudad}</label>
                            </div>
                        )
                    }

                </div>
                {editModes.ciudad ? (
                    <>
                        <label className="text-sm text-red-500 cursor-pointer hover:underline" onClick={() => handleCancel('ciudad')}>{loadingModes.ciudad ? "" : "Cancelar"}</label>
                        <label className="ml-2 text-sm text-greenVE-500 cursor-pointer hover:underline" onClick={() => handleSave('ciudad')}>{loadingModes.ciudad ? <Spinner></Spinner> : "Guardar"}</label>
                    </>
                ) : (
                    <label className="text-sm text-greenVE-500 cursor-pointer hover:underline" onClick={() => handleToggleEdit('ciudad')}>Editar</label>
                )}
            </div>
            <div className="flex py-5 border-b justify-between">
                <div className="flex w-10/12">
                    <div className="w-3/12">
                        <label className="text-sm font-semibold">Dirección:</label>
                    </div>
                    <div className="w-7/12">
                        {
                            editModes.direccion ? (
                                <input className="border border-greenVE-500 px-2 rounded-lg focus:outline-none text-sm" value={direccionField} onChange={handleDireccionChange}></input>
                            ) : (
                                <label className="text-sm ">{direccionField}</label>
                            )
                        }
                    </div>
                </div>
                {editModes.direccion ? (
                    <>
                        <label className="text-sm text-red-500 cursor-pointer hover:underline" onClick={() => handleCancel('direccion')}>{loadingModes.direccion ? "" : "Cancelar"}</label>
                        <label className="ml-2 text-sm text-greenVE-500 cursor-pointer hover:underline" onClick={() => handleSave('direccion')}>{loadingModes.direccion ? <Spinner></Spinner> : "Guardar"}</label>
                    </>
                ) : (
                    <label className="text-sm text-greenVE-500 cursor-pointer hover:underline" onClick={() => handleToggleEdit('direccion')}>Editar</label>
                )}
            </div>
            <div className="flex py-5 border-b justify-between">
                <div className="flex w-10/12">
                    <div className="w-3/12">
                        <label className="text-sm font-semibold">Fecha de nacimiento:</label>
                    </div>
                    <div className="w-7/12">
                        {
                            editModes.cumpleanios ? (
                                <input className="border border-greenVE-500 px-2 rounded-lg focus:outline-none text-sm" value={cumpleaniosField} onChange={handleCumpleaniosChange} type="date"></input>
                            ) : (
                                <label className="text-sm ">{cumpleaniosField}</label>
                            )
                        }

                    </div>
                </div>
                {editModes.cumpleanios ? (
                    <>
                        <label className="text-sm text-red-500 cursor-pointer hover:underline" onClick={() => handleCancel('cumpleanios')}>{loadingModes.cumpleanios ? "" : "Cancelar"}</label>
                        <label className="ml-2 text-sm text-greenVE-500 cursor-pointer hover:underline" onClick={() => handleSave('cumpleanios')}>{loadingModes.cumpleanios ? <Spinner></Spinner> : "Guardar"}</label>

                    </>
                ) : (
                    <label className="text-sm text-greenVE-500 cursor-pointer hover:underline" onClick={() => handleToggleEdit('cumpleanios')}>Editar</label>
                )}
            </div>
            {profileData.Contactos.map((item, index) => (
                <div key={item.Valor} className="flex py-5 border-b justify-between">
                    <div className="flex w-10/12">
                        <div className="w-3/12">
                            <label className="text-sm font-semibold">{item.Icono}:</label>
                        </div>
                        <div className="w-7/12">
                            {
                                editModes[`contactos_${index}`] ? (
                                    <input className="border border-greenVE-500 px-2 rounded-lg focus:outline-none text-sm" value={contactosField[index].Titulo} onChange={(event) => handleContactosChange(event, index)}></input>
                                ) : (
                                    <label className="text-sm">{contactosField[index].Titulo}</label>
                                )
                            }
                        </div>
                    </div>
                    {editModes[`contactos_${index}`] ? (
                        <>
                            <label className="text-sm text-red-500 cursor-pointer hover:underline" onClick={() => handleCancel(`contactos_${index}`)}>{loadingModes[`contactos_${index}`] ? "" : "Cancelar"}</label>
                            <label className="ml-2 text-sm text-greenVE-500 cursor-pointer hover:underline" onClick={() => handleSave(`contactos_${index}`)}>{loadingModes[`contactos_${index}`] ? <Spinner></Spinner> : "Guardar"}</label>
                        </>
                    ) : (
                        <label className="text-sm text-greenVE-500 cursor-pointer hover:underline" onClick={() => handleToggleEdit(`contactos_${index}`)}>Editar</label>
                    )}
                </div>
            ))}
        </div>
    )
}

export default ProfileEdit;

const obtenerIndiceProvinciaPorValor = (provincias, valorBuscar) => {
    for (let i = 0; i < provincias.length; i++) {
        const provincia = provincias[i];
        const cantones = provincia.Valor;

        for (let j = 0; j < cantones.length; j++) {
            const canton = cantones[j];

            if (canton.Valor === valorBuscar) {
                return i; // Devuelve el índice de la provincia
            }
        }
    }
    return -1; // Si no se encuentra, devuelve -1
};
