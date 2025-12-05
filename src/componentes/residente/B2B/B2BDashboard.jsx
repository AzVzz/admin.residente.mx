import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { imgApi, urlApi } from "../../api/url";
import { useAuth } from "../../Context";
import CancelSubscriptionButton from "./CancelSubscriptionButton";

const B2BDashboard = () => {
    const [showModal, setShowModal] = useState(false);
    const [b2bId, setB2bId] = useState(null);
    const [loadingB2bId, setLoadingB2bId] = useState(true);
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [loadingSubscription, setLoadingSubscription] = useState(true);
    const [subscriptionError, setSubscriptionError] = useState(null);
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

    // Obtener el b2b_id del usuario
    useEffect(() => {
        const obtenerB2bId = async () => {
            if (!usuario) {
                console.log("⚠️ No hay usuario disponible");
                setLoadingB2bId(false);
                return;
            }

            console.log("🔍 Obteniendo b2b_id para usuario:", usuario);

            // Primero verificar si el usuario ya tiene b2b_id directamente
            if (usuario.b2b_id) {
                console.log("✅ b2b_id encontrado en usuario:", usuario.b2b_id);
                setB2bId(usuario.b2b_id);
                setLoadingB2bId(false);
                return;
            }

            // Si el usuario tiene un id que podría ser el b2b_id (si el id del usuario es el mismo que b2b_id)
            if (usuario.id && usuario.rol === 'b2b') {
                console.log("🔍 Intentando usar usuario.id como b2b_id:", usuario.id);
                // Intentar primero con el id del usuario
                try {
                    const apiUrl = import.meta.env.DEV
                        ? `${urlApi}api/usuariosb2b/${usuario.id}`
                        : `https://admin.residente.mx/api/usuariosb2b/${usuario.id}`;

                    const response = await fetch(apiUrl);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log("✅ Datos obtenidos:", data);
                        if (data.id) {
                            setB2bId(data.id);
                            setLoadingB2bId(false);
                            return;
                        } else if (data.usuario_b2b?.id) {
                            setB2bId(data.usuario_b2b.id);
                            setLoadingB2bId(false);
                            return;
                        }
                    }
                } catch (error) {
                    console.log("⚠️ Error en primer intento:", error);
                }
            }

            // Intentar buscar por usuario_id si existe
            if (usuario.id) {
                try {
                    const apiUrl = import.meta.env.DEV
                        ? `${urlApi}api/usuariosb2b?usuario_id=${usuario.id}`
                        : `https://admin.residente.mx/api/usuariosb2b?usuario_id=${usuario.id}`;

                    const response = await fetch(apiUrl);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log("✅ Datos por usuario_id:", data);
                        // Si es un array, tomar el primero
                        if (Array.isArray(data) && data.length > 0) {
                            setB2bId(data[0].id);
                            setLoadingB2bId(false);
                            return;
                        } else if (data.id) {
                            setB2bId(data.id);
                            setLoadingB2bId(false);
                            return;
                        }
                    }
                } catch (error) {
                    console.log("⚠️ Error buscando por usuario_id:", error);
                }
            }

            // Intentar buscar por correo
            if (usuario.correo) {
                try {
                    const apiUrl = import.meta.env.DEV
                        ? `${urlApi}api/usuariosb2b?correo=${encodeURIComponent(usuario.correo)}`
                        : `https://admin.residente.mx/api/usuariosb2b?correo=${encodeURIComponent(usuario.correo)}`;
                    
                    const response = await fetch(apiUrl);
                    if (response.ok) {
                        const data = await response.json();
                        console.log("✅ Datos por correo:", data);
                        // Si es un array, tomar el primero
                        if (Array.isArray(data) && data.length > 0) {
                            setB2bId(data[0].id);
                            setLoadingB2bId(false);
                            return;
                        } else if (data.id) {
                            setB2bId(data.id);
                            setLoadingB2bId(false);
                            return;
                        }
                    }
                } catch (error) {
                    console.log("⚠️ Error buscando por correo:", error);
                }
            }

            // Si nada funciona, usar el id del usuario como último recurso (si es b2b)
            if (usuario.id && usuario.rol === 'b2b') {
                console.log("⚠️ Usando usuario.id como b2b_id (último recurso):", usuario.id);
                setB2bId(usuario.id);
            }

            setLoadingB2bId(false);
        };

        obtenerB2bId();
    }, [usuario]);

    // Función para obtener información de suscripción
    const obtenerSuscripcion = async () => {
        if (!b2bId) {
            setLoadingSubscription(false);
            return;
        }

        setLoadingSubscription(true);
        setSubscriptionError(null);

        try {
            const apiUrl = import.meta.env.DEV
                ? `/api/stripe-suscripciones/user-subscription/${b2bId}`
                : `https://admin.residente.mx/api/stripe-suscripciones/user-subscription/${b2bId}`;

            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener la suscripción');
            }

            if (data.success && (data.subscription || data.suscripcionDB)) {
                setSubscriptionData(data);
                console.log('✅ Información de suscripción obtenida:', data);
            } else {
                setSubscriptionError('No se encontró una suscripción activa');
            }
        } catch (error) {
            console.error('❌ Error obteniendo suscripción:', error);
            setSubscriptionError(error.message);
        } finally {
            setLoadingSubscription(false);
        }
    };

    // Obtener información de suscripción cuando b2bId esté disponible
    useEffect(() => {
        obtenerSuscripcion();
    }, [b2bId]);

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
                    Usuario B2B
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
                {/* Columna verde - Información de Suscripción */}
                <div className="bg-green-500/20 border-r border-gray-300 px-6 py-6">
                    <h2 className="font-bold text-black text-center text-[30px] mb-4">Mi Suscripción</h2>
                    <div className="space-y-4">
                        {loadingSubscription ? (
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="text-gray-500 text-sm text-center py-4">
                                    Cargando información de suscripción...
                                </div>
                            </div>
                        ) : subscriptionError ? (
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-700 font-semibold">Estado:</span>
                                    <span className="bg-red-500 text-white font-bold px-3 py-1 rounded text-sm">
                                        Sin Suscripción
                                    </span>
                                </div>
                                <div className="text-gray-600 text-sm mt-2">
                                    <p className="text-red-600">{subscriptionError}</p>
                                </div>
                            </div>
                        ) : subscriptionData ? (
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-700 font-semibold">Estado:</span>
                                    <span className={`${
                                        subscriptionData.subscription?.status === 'active' || subscriptionData.suscripcionDB?.estado === 'active'
                                            ? 'bg-green-500'
                                            : subscriptionData.subscription?.status === 'canceled' || subscriptionData.suscripcionDB?.estado === 'canceled'
                                            ? 'bg-red-500'
                                            : 'bg-yellow-500'
                                    } text-white font-bold px-3 py-1 rounded text-sm`}>
                                        {subscriptionData.subscription?.status === 'active' || subscriptionData.suscripcionDB?.estado === 'active'
                                            ? 'Activa'
                                            : subscriptionData.subscription?.status === 'canceled' || subscriptionData.suscripcionDB?.estado === 'canceled'
                                            ? 'Cancelada'
                                            : subscriptionData.subscription?.status || subscriptionData.suscripcionDB?.estado || 'Desconocido'}
                                    </span>
                                </div>
                                <div className="text-gray-600 text-sm space-y-1">
                                    <p>
                                        <span className="font-semibold">Plan:</span>{' '}
                                        {subscriptionData.suscripcionDB?.nombre_plan || 
                                         subscriptionData.subscription?.items?.data?.[0]?.price?.nickname || 
                                         'B2B Residente'}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Pago:</span>{' '}
                                        {subscriptionData.suscripcionDB?.facturas === 'month' 
                                            ? 'Mensual' 
                                            : subscriptionData.suscripcionDB?.facturas === 'year'
                                            ? 'Anual'
                                            : subscriptionData.subscription?.items?.data?.[0]?.price?.recurring?.interval === 'month'
                                            ? 'Mensual'
                                            : subscriptionData.subscription?.items?.data?.[0]?.price?.recurring?.interval === 'year'
                                            ? 'Anual'
                                            : subscriptionData.suscripcionDB?.facturas || 'Mensual'}
                                    </p>
                                    {subscriptionData.suscripcionDB?.monto && (
                                        <p>
                                            <span className="font-semibold">Monto:</span>{' '}
                                            ${(subscriptionData.suscripcionDB.monto / 100).toFixed(2)}{' '}
                                            {subscriptionData.suscripcionDB.moneda?.toUpperCase() || 'MXN'}
                                        </p>
                                    )}
                                    {subscriptionData.suscripcionDB?.fecha_fin_periodo_actual && (
                                        <p>
                                            <span className="font-semibold">Próximo pago:</span>{' '}
                                            {new Date(subscriptionData.suscripcionDB.fecha_fin_periodo_actual).toLocaleDateString('es-MX', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    )}
                                    {subscriptionData.sincronizado && (
                                        <p className="text-xs text-blue-600 mt-2">
                                            ✅ Sincronizado automáticamente
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="text-gray-500 text-sm text-center py-4">
                                    No hay información de suscripción disponible
                                </div>
                            </div>
                        )}
                        
                        {/* Botón de cancelar suscripción - directamente debajo de la tarjeta */}
                        {loadingB2bId ? (
                            <div className="text-gray-500 text-sm text-center py-4">
                                Cargando información de suscripción...
                            </div>
                        ) : (
                            <div className="mt-2">
                                {b2bId ? (
                                    <CancelSubscriptionButton 
                                        b2bId={b2bId}
                                        onCancelSuccess={(data) => {
                                            console.log("Suscripción cancelada:", data);
                                            // Refrescar la información de suscripción después de cancelar
                                            obtenerSuscripcion();
                                        }}
                                    />
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-red-500 text-sm text-center py-2">
                                            ⚠️ No se pudo obtener el ID de suscripción
                                        </div>
                                        <div className="text-gray-500 text-xs text-center">
                                            Usuario: {usuario?.id || 'N/A'} | Correo: {usuario?.correo || 'N/A'}
                                        </div>
                                        <div className="text-gray-500 text-xs text-center">
                                            Por favor, contacta al soporte si necesitas cancelar tu suscripción.
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {/* Columna roja */}
                <div className="bg-red-500/20 flex items-center justify-center">
                    <span className="font-bold text-red-700">Columna 3</span>
                </div>
            </div>
            {/* Modal para cupon ampliado */}
            {showModal && (
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
            )}

        </div>
    );
};

export default B2BDashboard;
