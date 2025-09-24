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

                <div className="relative">
                    {/* Línea amarilla con bordes inclinados */}
                    <div className="absolute left-[-90px] top-1/2 transform -translate-y-1/2 w-20 h-[10px] bg-[#fff300] -skew-x-32"></div>

                    {/* Logo */}
                    <img
                        src={`${urlApi}fotos/fotos-estaticas/residente-logos/negros/newsletter1.webp`}
                        className="h-full w-46 object-contain"
                        alt="Logo Infografías"
                    />
                </div>

                <div className="flex flex-col items-end justify-center py-2">
                    <p className="leading-5 text-[20px] font-roman pl-14 mb-2">
                        Recibe cada mañana las noticias y promociones relevantes del mundo gastronómico de NL
                    </p>
                    <span className="text-[55px] leading-10 tracking-tight">Suscríbete</span>
                </div>

                <form
                    className="flex flex-row justify-end items-center w-full pb-3"
                    onSubmit={handleSubmit}
                >
                    <div className="flex items-center rounded gap-2">
                        <input
                            type="email"
                            value={correo}
                            onChange={e => setCorreo(e.target.value)}
                            placeholder="Ingresa tu correo electrónico"
                            className="bg-[#fff] p-2 h-10 rounded-l border border-white w-43.5 text-xs"
                            required
                        />
                        <button
                            type="submit"
                            className="flex justify-center items-center bg-[#fff] h-10 text-black uppercase cursor-pointer px-2.5 rounded-r text-sm"
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
