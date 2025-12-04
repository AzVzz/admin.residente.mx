import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { imgApi } from "../../api/url";
import { useAuth } from "../../Context";

const B2BDashboard = () => {
    const [showModal, setShowModal] = useState(false);
    const { saveToken, saveUsuario, usuario } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [showModal]);

    const handleLogout = () => {
        saveToken(null);
        saveUsuario(null);
        navigate("/login");
    };

    const cuponImg = `${imgApi}fotos/tickets/promo_test_1764265100923.png`;

    return (
        <div>
            {/* Barra superior del usuario */}
            <div className="w-full h-10 bg-[#fff200] flex items-center justify-end mt-4 pr-6">
                <span className="font-bold text-[14px] mr-3">
                    {usuario?.nombre_usuario || 'Usuario B2B'}
                </span>
                <img
                    src={`${imgApi}/fotos/fotos-estaticas/Usuario-Icono.webp`}
                    alt="Foto usuario"
                    className="w-8 h-8 rounded-full object-cover border border-gray-300 mr-4"
                />
                <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1 rounded transition-colors"
                >
                    Cerrar Sesión
                </button>
            </div>
            {/* Grid de 3 columnas */}
            <div className="w-full grid grid-cols-3">
                {/* Columna azul */}
                <div className="bg-blue-500/20 border-r border-gray-300 px-6 py-6">
                    <h2 className="font-bold text-black text-center text-[30px] mb-4 ">Mis productos</h2>
                    <div className="flex items-center gap-4">
                        <img
                            src={`${imgApi}/_image?href=https%3A%2F%2Fresidente.mx%2F%2Ffotos%2Fplatillos%2Fsan-carlos%2Fsan-carlos1.webp&w=300&h=300&f=webp`}
                            alt="San Carlos"
                            className="w-[110px] h-[68px] object-cover rounded"
                        />
                        <div>
                            <div className="font-bold text-base">San Carlos</div>
                            <div className="text-gray-700 text-sm">Comida regional</div>
                        </div>
                    </div>
                    {/* Imagen de cupón y estado versión más pequeña */}
                    <div className="mt-8 flex items-start gap-4">
                        <img
                            src={cuponImg}
                            alt="Cupón"
                            className="w-[126px] h-[200px] object-cover rounded cursor-pointer"
                            onClick={() => setShowModal(true)}
                        />
                        <div>
                            <div className="bg-green-500 text-white font-bold px-4 py-2 rounded mb-2 text-center w-fit">
                                Activo
                            </div>
                            <div className="text-gray-700 text-sm text-center">
                                Fin: 27/11/2025
                            </div>
                        </div>
                    </div>
                </div>
                {/* Columna verde */}
                <div className="bg-green-500/20 flex items-center justify-center border-r border-gray-300">
                    <span className="font-bold text-green-700">Columna 2</span>
                </div>
                {/* Columna roja */}
                <div className="bg-red-500/20 flex items-center justify-center">
                    <span className="font-bold text-red-700">Columna 3</span>
                </div>
            </div>
            {/* Modal para cupon ampliado */}
            {
                showModal && (
                    <div>
                        {createPortal(
                            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] overflow-auto">
                                <div className="relative">
                                    <img
                                        src={cuponImg}
                                        alt="Cupón ampliado"
                                        className="w-auto h-auto max-h-[80vh]"
                                    />
                                    <button
                                        className="absolute top-2 right-3 bg-red-600 rounded-full px-3 py-1 text-white font-bold cursor-pointer"
                                        onClick={() => setShowModal(false)}
                                    >
                                        X
                                    </button>
                                </div>
                            </div>,
                            document.body
                        )}
                    </div>
                )
            }

        </div >
    );
};

export default B2BDashboard;
