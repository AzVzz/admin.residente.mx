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
            {/* CONTENEDOR DERECHA */}
            <div className="relative gap-1 flex flex-col items-end text-right h-50">
                <span className="absolute -top-0 right-0 text-xl font-black text-[18px] italic uppercase bg-[#fff300] px-3 leading-8 h-[25px] w-[190px] flex items-center justify-center">
                    Newsletter
                </span>

                <div className="flex flex-col gap-2 items-end justify-center mt-7 py-2">
                    <p className="leading-5 text-[20px]">
                        Sé el primero en recibir lo más relevante y las promociones restauranteras de Nuevo León
                    </p>
                    <span className="text-[55px] leading-10 tracking-tight">Suscríbete</span>
                </div>

                <form
                    className="flex flex-row justify-end items-center w-full pb-3"
                    onSubmit={handleSubmit}
                >
                    <div className="flex items-center rounded gap-3">
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
