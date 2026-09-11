import { useEffect, useState } from "react";
import Icons from "../../global/icons";
import { getProfileData } from "../../controllers/perfil/perfilController";

const ProfileMenu = ({ handleChangeOption, selectedOption, profileData }) => {
    const icons = new Icons();

    const handleVeSiteClick = () => {
        // Abrir VeSite en una nueva ventana/pestaña
        window.open("https://visitaecuador.com/vesite", "_blank");
    };

    const handleLogout = () => {
        localStorage.removeItem("datos");
        window.location.reload();
    };

    return (
        <div className="border rounded-md">
            <div className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:text-greenVE-500"
                 onClick={() => handleChangeOption(1)}>
                <div className="bg-gray-100 h-9 w-9 rounded-full flex items-center justify-center">
                    <span
                        className={`${selectedOption == 1 ? "text-greenVE-500" : ""} icon-[material-symbols-light--person-edit-outline] h-8 w-8`}></span>
                </div>
                <label
                    className={`${selectedOption == 1 ? "text-greenVE-500" : ""} font-medium cursor-pointer text-sm `}>Datos
                    personales</label>
            </div>
            {
                (profileData && profileData.Codigo && profileData.Codigo != "") &&
                <div className="flex items-center gap-3 px-4 py-2 cursor-pointer border-t hover:text-greenVE-500"
                     onClick={() => handleChangeOption(2)}>
                    <div className="bg-gray-100 h-9 w-9 rounded-full flex items-center justify-center">
                        <span
                            className={`${selectedOption == 2 ? "text-greenVE-500" : ""} icon-[material-symbols-light--web] h-8 w-8`}></span>
                    </div>
                    <label
                        className={`${selectedOption == 2 ? "text-greenVE-500" : ""} font-medium cursor-pointer text-sm `}>Página
                        de Agencia</label>
                </div>
            }
            <div className="flex items-center gap-3 px-4 py-2 cursor-pointer border-t hover:text-greenVE-500"
                 onClick={() => handleChangeOption(3)}>
                <div className="bg-gray-100 h-9 w-9 rounded-full flex items-center justify-center">
                    <span
                        className={`${selectedOption == 3 ? "text-greenVE-500" : ""} icon-[material-symbols-light--change-circle-outline-rounded] h-8 w-8`}></span>
                </div>
                <label
                    className={`${selectedOption == 3 ? "text-greenVE-500" : ""} font-medium cursor-pointer text-sm `}>Mi
                    Cashback</label>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 cursor-pointer border-t hover:text-greenVE-500"
                 onClick={() => handleChangeOption(4)}>
                <div className="bg-gray-100 h-9 w-9 rounded-full flex items-center justify-center">
                    <span
                        className={`${selectedOption == 4 ? "text-greenVE-500" : ""} icon-[cil--https] h-6 w-6`}></span>
                </div>
                <label
                    className={`${selectedOption == 4 ? "text-greenVE-500" : ""} font-medium cursor-pointer text-sm `}>Seguridad</label>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:text-greenVE-500"
                 onClick={() => handleChangeOption(5)}>
                <div className="bg-gray-100 h-9 w-9 rounded-full flex items-center justify-center">
                    <span
                        className={`${selectedOption == 5 ? "text-greenVE-500" : ""} icon-[material-symbols--admin-panel-settings-outline] h-8 w-8`}></span>
                </div>
                <label
                    className={`${selectedOption == 5 ? "text-greenVE-500" : ""} font-medium cursor-pointer text-sm `}>Administración</label>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:text-greenVE-500"
                 onClick={handleVeSiteClick}>
                <div className="bg-gray-100 h-9 w-9 rounded-full flex items-center justify-center">
                    <span
                        className={`${selectedOption == 6 ? "text-greenVE-500" : ""} px-1  h-8 w-8`}><svg
                        xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path
                        d="M0 0h24v24H0z" fill="none"/><path
                        d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/></svg></span>
                </div>
                <label
                    className={`${selectedOption == 6 ? "text-greenVE-500" : ""} font-medium cursor-pointer text-sm `}>My
                    VeSite</label>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 cursor-pointer border-t hover:bg-red-50 hover:text-red-600 group"
                 onClick={handleLogout}>
                <div className="bg-red-50 h-9 w-9 rounded-full flex items-center justify-center group-hover:bg-red-100">
                    <span className="icon-[material-symbols-light--logout] h-6 w-6 text-red-500"></span>
                </div>
                <label className="font-medium cursor-pointer text-sm text-red-500">Cerrar sesión</label>
            </div>
        </div>
    );
}

export default ProfileMenu;
