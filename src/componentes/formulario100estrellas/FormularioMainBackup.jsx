import { useForm, FormProvider } from 'react-hook-form';
import RestaurantPoster from '../api/RestaurantPoster';
import RestaurantFetcher from '../api/RestaurantFetcher';

import './FormularioMain.css';
import TipoRestaurante from './componentes/TipoRestaurante';
import Categorias from './componentes/Categorias';
import Informacion from './componentes/Informacion';
import RedesSociales from './componentes/RedesSociales';
import OcasionIdeal from './componentes/OcasionIdeal';
import Sucursales from './componentes/Sucursales';
import CodigoVestir from './componentes/CodigoVestir';
import UbicacionPrincipal from './componentes/UbicacionPrincipal';
import ZonasHabilitadas from './componentes/ZonasHabilitadas';
import Reconocimientos from './componentes/Reconocimientos';
import Resenas from './componentes/Resenas';
import CincoRazones from './componentes/CincoRazones';
import QuePido from './componentes/QuePido';
import Testimonios from './componentes/Testimonios';
import Imagenes from './componentes/Imagenes';
import Logros from './componentes/Logros';
import Historia from './componentes/Historia';
import ExpertosOpinan from './componentes/ExpertosOpinan';

const FormularioMain = () => {
    const methods = useForm({
        defaultValues: {
            sucursales: [],
            tipo_area: [],
            tipo_area_restaurante: []
        }
    });

    return (
        <div className="formulario">
            <h1>Formulario</h1>

            <FormProvider {...methods}>
                <RestaurantPoster>
                    {({ postRestaurante, isPosting, postError, postResponse }) => (
                        <form onSubmit={methods.handleSubmit(async (data) => {
                            try {
                                const formData = new FormData();

                                // 1. Procesar campos normales excluyendo logros individuales e imágenes
                                Object.entries(data).forEach(([key, value]) => {
                                    if (key === 'imagenes' || key.startsWith('logro_')) return;

                                    if (Array.isArray(value)) {
                                        formData.append(key, JSON.stringify(value));
                                    } else {
                                        formData.append(key, value);
                                    }
                                });

                                // 2. Construir array de logros
                                const logros = [];
                                for (let i = 1; i <= 5; i++) {
                                    const fecha = data[`logro_fecha_${i}`];
                                    const cuerpo = data[`logro_cuerpo_${i}`];

                                    // Validación consistente con el componente
                                    if ((fecha || cuerpo) && (!fecha || !cuerpo)) {
                                        throw new Error(`Debes completar ambos campos del logro ${i}`);
                                    }

                                    if (fecha && cuerpo) {
                                        logros.push({
                                            fecha: parseInt(fecha),
                                            cuerpo: cuerpo.substring(0, 60) // Aplica límite de caracteres
                                        });
                                    }
                                }
                                formData.append('logros', JSON.stringify(logros));

                                // 3. Procesar imágenes (manteniendo tu lógica actual)
                                if (data.imagenes && data.imagenes.length > 0) {
                                    data.imagenes.forEach((file, index) => {
                                        formData.append('fotos', file);
                                    });
                                }

                                // 4. Enviar datos
                                const result = await postRestaurante(formData);
                                methods.reset();

                            } catch (error) {
                                console.error('Error en el envío:', error);
                            }
                        })}>
                            <Informacion />

                            <Imagenes />

                            <TipoRestaurante />

                            <Categorias />

                            <RedesSociales />

                            <OcasionIdeal />

                            <Sucursales />

                            <CodigoVestir />

                            <UbicacionPrincipal />

                            <ZonasHabilitadas />

                            {[1, 2, 3, 4, 5].map(num => (
                                <Reconocimientos
                                    key={num}
                                    numero={num}
                                />
                            ))}

                            <Resenas />

                            <div className="form-logros">
                                <fieldset>
                                    <legend>Escribe 5 logros del restaurante</legend>
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <Logros
                                            key={num}
                                            numero={num}
                                        />
                                    ))}
                                </fieldset>
                            </div>

                            <Historia />

                            <div className="form-cinco-razones">
                                <fieldset>
                                    <legend>Describe 5 razones por las que alguién debe asistir a tu restaurante *</legend>
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <CincoRazones
                                            key={num}
                                            numero={num}
                                        />
                                    ))}
                                </fieldset>
                            </div>


                            <div className="form-que-pido">
                                <fieldset>
                                    <legend>Que pido cuando asisto la primera vez *<br/>(4 ó 6 platillos *)</legend>
                                    {[1, 2, 3, 4, 5, 6].map(num => (
                                        <QuePido
                                            key={num}
                                            numero={num}
                                        />
                                    ))}
                                </fieldset>
                            </div>

                            <ExpertosOpinan />

                            <div className="form-testimonios">
                                <fieldset>
                                    <legend>Testimonios *</legend>
                                    {[1, 2, 3].map(num => (
                                        <Testimonios
                                            key={num}
                                            numero={num}
                                        />
                                    ))}
                                </fieldset>
                            </div>

                            {postError && (
                                <div className="error-message">
                                    Error: {postError}
                                </div>
                            )}

                            {postResponse && (
                                <div className="success-message">
                                    ¡Restaurante registrado exitosamente!
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isPosting}
                                className="form-button"
                            >
                                {isPosting ? 'Enviando...' : 'Enviar'}
                            </button>
                        </form>
                    )}
                </RestaurantPoster>
            </FormProvider>
        </div>
    )
}

export default FormularioMain;