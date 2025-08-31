import { useState, useEffect } from 'react';
import { urlApi } from '../../../../componentes/api/url.js';
import { bannerNewsletterGetReciente } from '../../../../componentes/api/bannerNewsletterGet.js';

const BotonesAnunciateSuscribirme = () => {
    const [correo, setCorreo] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [banner, setBanner] = useState(null);

    useEffect(() => {
        bannerNewsletterGetReciente()
            .then(setBanner)
            .catch(() => setBanner(null));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje('');
        try {
            const res = await fetch(`${urlApi}api/correos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo_electronico: correo })
            });
            const data = await res.json();
            if (res.ok) {
                setMensaje('¡Suscripción exitosa!');
                setCorreo('');
                setTimeout(() => setMensaje(''), 4000);
            } else {
                setMensaje(data.error || 'Error al suscribirse');
            }
        } catch (err) {
            setMensaje('Error de conexión');
        }
    };

    return (
        <div>
            {/* CONTENEDOR CENTRADO */}
            <div className="relative gap-3 m-2 flex flex-col items-center text-center h-50">
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xl font-black text-[20px] italic uppercase bg-[#fff300] px-3 leading-8 h-[32px] w-[190px] items-center justify-center">
                    Newsletter
                </span>

                <div className="flex flex-col gap-2 items-center justify-center mt-5.5 py-2">
                    <p className="leading-5 text-[20px]">
                        Sé el primero en recibir lo más relevante y las promociones restauranteras de Nuevo León
                    </p>
                    <span className="text-[55px] leading-10 tracking-tight">Suscríbete</span>
                </div>

                {/*<div className="flex justify-center gap-0">
                    <div className="flex flex-col justify-between items-center w-40">
                        <img
                            src={`${urlApi}fotos/fotos-estaticas/residente-logos/grises/residente-restaurant-news-letter.webp`}
                            alt="Logo"
                        />
                    </div>
                </div>*/}

                <form
                    className="flex flex-row justify-center items-center w-full pb-3"
                    onSubmit={handleSubmit}
                >
                    <div className="flex items-center rounded w-full gap-3 justify-center">
                        <input
                            type="email"
                            value={correo}
                            onChange={e => setCorreo(e.target.value)}
                            placeholder="Ingresa tu correo electrónico"
                            className="bg-[#fff] p-2 h-10 rounded-l border border-white w-45.5 text-xs drop-shadow-[4px_3px_2px_rgba(0,0,0,0.3)]"
                            required
                        />
                        <button
                            type="submit"
                            className="flex justify-center items-center bg-[#fff] h-10 text-black uppercase cursor-pointer px-2.5 rounded-r text-sm drop-shadow-[4px_3px_2px_rgba(0,0,0,0.3)]"
                        >
                            Signup
                        </button>
                    </div>
                </form>

                {mensaje && <p className="text-sm mt-2">{mensaje}</p>}
            </div>
        </div>
    );
};

export default BotonesAnunciateSuscribirme;
