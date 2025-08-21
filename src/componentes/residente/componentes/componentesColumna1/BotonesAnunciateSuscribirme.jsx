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
            <hr className="border-t border-gray-800/80 my-5 border-dotted" />
            
            {/* CONTENEDOR CENTRADO */}
            <div className="flex flex-col gap-3 m-2 items-center text-center">
                
                <div className="flex flex-col gap-2">
                    <span className="text-[60px] leading-10 tracking-tight">Suscríbete</span>
                    <p className="leading-3 text-[13px]">
                        Sé el primero en recibir lo más relevante y las promociones restauranteras de Nuevo León
                    </p>
                </div>

                <div className="flex justify-center gap-3">
                    <div className="flex flex-col justify-between items-center w-40">
                        <img 
                          src={`${urlApi}fotos/fotos-estaticas/residente-logos/grises/residente-restaurant-news-letter.webp`} 
                          alt="Logo" 
                        />
                    </div>
                </div>

                <form className="flex flex-row items-center justify-center w-full" onSubmit={handleSubmit}>
                    <div className="flex items-center rounded max-w-[320px] w-full gap-3">
                        <input
                            type="email"
                            value={correo}
                            onChange={e => setCorreo(e.target.value)}
                            placeholder="Ingresa tu correo electrónico"
                            className="bg-white p-2 h-10 rounded-l border border-gray-300 w-45.5 text-xs"
                            required
                        />
                        <button 
                          type="submit" 
                          className="flex justify-center items-center bg-black h-10 text-white uppercase cursor-pointer px-2.5 rounded-r text-sm"
                        >
                            Signup
                        </button>
                    </div>
                </form>

                {mensaje && <p className="text-sm mt-2">{mensaje}</p>}
            </div>

            <hr className="border-t border-gray-800/80 my-5 border-dotted" />
        </div>
    );
};

export default BotonesAnunciateSuscribirme;
