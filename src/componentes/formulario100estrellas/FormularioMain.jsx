import { useForm, FormProvider } from 'react-hook-form';
import RestaurantPoster from '../api/RestaurantPoster';
import RestaurantFetcher from '../api/RestaurantFetcher';
import { useEffect } from 'react';

import './FormularioMain.css';
import TipoRestaurante from './componentes/TipoRestaurante';
import Categorias from './componentes/Categorias';
import Informacion from './componentes/Informacion';
import RedesSociales from './componentes/RedesSociales';
import OcasionIdeal from './componentes/OcasionIdeal';
import Sucursales from './componentes/Sucursales';
import CodigoVestir from './componentes/CodigoVestir';
import UbicacionPrincipal from './componentes/UbicacionPrincipal';
import Reconocimientos from './componentes/Reconocimientos';
import Resenas from './componentes/Resenas';
import CincoRazones from './componentes/CincoRazones';
import QuePido from './componentes/QuePido';
import Testimonios from './componentes/Testimonios';
import Imagenes from './componentes/Imagenes';
import Logros from './componentes/Logros';
import Historia from './componentes/Historia';
import ExpertosOpinan from './componentes/ExpertosOpinan';
import FotosLugar from './componentes/FotosLugar';
import Colaboraciones from './componentes/Colaboraciones';
import NuevasSeccionesCategorias from './componentes/NuevasSeccionesCategorias';

// Definir campos de reseñas
const reseñasFields = [
    'fundadores',
    'atmosfera',
    'receta_especial',
    'platillo_iconico',
    'promocion'
];

const FormularioMain = ({ restaurante, esEdicion }) => {

    const baseDefaults = {
        sucursales: [],
        tipo_area: [],
        tipo_area_restaurante: [],
        fotos_lugar: restaurante?.fotos_lugar || [],
        fotos_eliminadas: [],
        colaboracion_coca_cola: false,
        colaboracion_modelo: false,
        secciones_categorias: [],
        ...restaurante
    };

    baseDefaults.secciones_categorias = {};

    if (restaurante?.secciones_categorias) {
        restaurante.secciones_categorias.forEach(item => {
            baseDefaults.secciones_categorias[item.seccion] = item.categoria;
        });
    }

    // Inicializar campo de comida
    baseDefaults.comida = restaurante?.comida
        ? restaurante.comida.join(', ')  // Convertir array a string separado por comas
        : '';


    // Inicializar campos de reseñas
    reseñasFields.forEach(field => {
        // Buscar el valor en el array de reseñas
        const reseñaObj = restaurante?.reseñas?.find(item => item[field]);
        baseDefaults[field] = reseñaObj ? reseñaObj[field] : '';
    });

    // Inicializar campos de platillos
    for (let i = 1; i <= 6; i++) {
        baseDefaults[`platillo_${i}`] = restaurante?.platillos?.[i - 1] || '';
    }

    // Inicializar campos de testimonios
    for (let i = 1; i <= 3; i++) {
        baseDefaults[`testimonio_descripcion_${i}`] = restaurante?.testimonios?.[i - 1]?.descripcion || '';
        baseDefaults[`testimonio_persona_${i}`] = restaurante?.testimonios?.[i - 1]?.persona || '';
    }

    // Inicializar campos de logros
    if (restaurante?.logros) {
        restaurante.logros.forEach((logro, index) => {
            const num = index + 1;
            if (num <= 5) {
                baseDefaults[`logro_fecha_${num}`] = logro.fecha.toString();
                baseDefaults[`logro_descripcion_${num}`] = logro.descripcion;
            }
        });
    }


    // Inicializar campos de razones (cinco razones)
    for (let i = 1; i <= 5; i++) {
        const razon = restaurante?.razones?.[i - 1];
        baseDefaults[`razon_titulo_${i}`] = razon?.titulo || '';
        baseDefaults[`razon_descripcion_${i}`] = razon?.descripcion || '';
    }

    // Inicializar campos de experiencia_opinion
    if (restaurante?.experiencia_opinion && restaurante.experiencia_opinion.length > 0) {
        const experto = restaurante.experiencia_opinion[0];
        baseDefaults.exp_op_frase = experto.frase || '';
        baseDefaults.exp_op_nombre = experto.nombre || '';
        baseDefaults.exp_op_puesto = experto.puesto || '';
        baseDefaults.exp_op_empresa = experto.empresa || '';
    } else {
        baseDefaults.exp_op_frase = '';
        baseDefaults.exp_op_nombre = '';
        baseDefaults.exp_op_puesto = '';
        baseDefaults.exp_op_empresa = '';
    }


    const methods = useForm({
        defaultValues: baseDefaults
    });

    /* Resetear valores cuando cambien los datos del restaurante
    useEffect(() => {
        if (restaurante) {
            methods.reset(restaurante);
        }
    }, [restaurante, methods]);*/
    return (
        <div className="formulario">
            <h1 className="  text-[clamp(1.5rem,14vw,10rem)] leading-none tracking-tight font-bold">{esEdicion ? 'Editar Restaurante' : 'Nuevo Restaurante'}</h1>

            <FormProvider {...methods}>
                <RestaurantPoster
                    method={esEdicion ? "PUT" : "POST"}
                    slug={esEdicion ? restaurante.slug : null}
                >
                    {({ postRestaurante, postImages, postFotosLugar, isPosting, postError, postResponse }) => (
                        <form onSubmit={methods.handleSubmit(async (data) => {
                            try {

                                baseDefaults.secciones_categorias = {};

                                if (restaurante?.secciones_categorias) {
                                    restaurante.secciones_categorias.forEach((item) => {
                                        const { seccion, categoria } = item;

                                        // Si la sección aún no existe, inicialízala
                                        if (baseDefaults.secciones_categorias[seccion] === undefined) {
                                            baseDefaults.secciones_categorias[seccion] = categoria;
                                            return;
                                        }

                                        // Si ya había algo y no es array, conviértelo a array
                                        if (!Array.isArray(baseDefaults.secciones_categorias[seccion])) {
                                            baseDefaults.secciones_categorias[seccion] = [
                                                baseDefaults.secciones_categorias[seccion],
                                            ];
                                        }

                                        // Ahora sí, empuja la nueva categoría
                                        baseDefaults.secciones_categorias[seccion].push(categoria);
                                    });
                                }


                                // Construir payload como objeto JavaScript
                                const payload = {
                                    nombre_restaurante: data.nombre_restaurante,
                                    fecha_inauguracion: data.fecha_inauguracion,
                                    comida: data.comida
                                        ? data.comida.split(',').map(item => item.trim()).filter(Boolean)
                                        : [],
                                    telefono: data.telefono,
                                    ticket_promedio: data.ticket_promedio,
                                    platillo_mas_vendido: data.platillo_mas_vendido,
                                    numero_sucursales: data.numero_sucursales,
                                    sucursales: data.sucursales,
                                    imagenesEliminadas: data.imagenesEliminadas || [],
                                    //fotos_eliminadas: data.fotos_eliminadas || [],

                                    tipo_restaurante: data.tipo_restaurante,
                                    categoria: data.categoria,
                                    sitio_web: data.sitio_web,
                                    rappi_link: data.rappi_link,
                                    didi_link: data.didi_link,
                                    instagram: data.instagram,
                                    facebook: data.facebook,
                                    ubereats_link: data.ubereats_link,
                                    link_horario: data.link_horario,
                                    links: data.links,
                                    ocasiones_ideales: [
                                        data.ocasion_ideal_1,
                                        data.ocasion_ideal_2,
                                        data.ocasion_ideal_3
                                    ].filter(Boolean),
                                    codigo_vestir: data.codigo_vestir,
                                    tipo_area: data.tipo_area,
                                    historia: data.historia,
                                    logros: [],
                                    razones: [],
                                    platillos: [],
                                    testimonios: [],
                                    colaboracion_coca_cola: data.colaboracion_coca_cola || false,
                                    colaboracion_modelo: data.colaboracion_modelo || false,
                                    reseñas: reseñasFields.map(field => ({ [field]: data[field] })),
                                    experiencia_opinion: [],
                                    reconocimientos: [],
                                    secciones_categorias: seccionesCategorias,
                                };

                                // Construir arrays estructurados
                                for (let i = 1; i <= 5; i++) {
                                    const fecha = data[`logro_fecha_${i}`];
                                    const descripcion = data[`logro_descripcion_${i}`];
                                    if (fecha && descripcion) {
                                        payload.logros.push({
                                            fecha: parseInt(fecha),
                                            descripcion: descripcion.substring(0, 60)
                                        });
                                    }
                                }

                                for (let i = 1; i <= 5; i++) {
                                    const titulo = data[`razon_titulo_${i}`];
                                    const descripcion = data[`razon_descripcion_${i}`];
                                    if (titulo && descripcion) {
                                        payload.razones.push({
                                            titulo: titulo,
                                            descripcion: descripcion
                                        });
                                    }
                                }

                                for (let i = 1; i <= 6; i++) {
                                    const platillo = data[`platillo_${i}`];
                                    if (platillo) {
                                        payload.platillos.push(platillo);
                                    }
                                }

                                for (let i = 1; i <= 3; i++) {
                                    const descripcion = data[`testimonio_descripcion_${i}`];
                                    const persona = data[`testimonio_persona_${i}`];
                                    if (descripcion && persona) {
                                        payload.testimonios.push({
                                            descripcion: descripcion,
                                            persona: persona
                                        });
                                    }
                                }

                                for (let i = 1; i <= 5; i++) {
                                    const titulo = data[`reconocimiento_${i}`];
                                    const fecha = data[`fecha_reconocimiento_${i}`];
                                    if (titulo && fecha) {
                                        payload.reconocimientos.push({
                                            titulo: titulo,
                                            fecha: fecha
                                        });
                                    }
                                }

                                // Construir objeto de experto
                                const frase = data.exp_op_frase;
                                const nombre = data.exp_op_nombre;
                                const puesto = data.exp_op_puesto;
                                const empresa = data.exp_op_empresa;

                                if (frase || nombre || puesto || empresa) {
                                    payload.experiencia_opinion.push({
                                        frase: frase,
                                        nombre: nombre,
                                        puesto: puesto,
                                        empresa: empresa
                                    });
                                }


                                // 👇 Agrega este console.log justo antes de enviar los datos
                                console.log("Datos que se enviarán al backend:", payload);

                                // Enviar datos
                                const result = await postRestaurante(payload);

                                if (result && result.data && result.data.id) {
                                    const restaurantId = result.data.id;

                                    // 2. Procesar imágenes solo si hay cambios
                                    const imagenes = data.imagenes || [];
                                    const imagenesEliminadas = data.imagenesEliminadas || [];
                                    const newImages = imagenes.filter(img => img instanceof File);

                                    // Procesar FOTOS DEL LUGAR
                                    const fotosLugar = data.fotos_lugar || [];
                                    const fotosEliminadas = data.fotos_eliminadas || [];

                                    const nuevasFotos = fotosLugar.filter(
                                        foto => !foto.isExisting && foto.file
                                    ).map(foto => foto.file);

                                    const fotosConservadasIds = fotosLugar
                                        .filter(foto => foto.isExisting && !fotosEliminadas.includes(foto.id))
                                        .map(foto => foto.id);

                                    const fotosEliminadasIds = data.fotos_eliminadas || [];

                                    // Enviar solo si hay cambios
                                    if (nuevasFotos.length > 0 || fotosEliminadasIds.length > 0) {
                                        const formDataFotos = new FormData();

                                        // Nuevas fotos
                                        nuevasFotos.forEach(file => {
                                            formDataFotos.append('fotos', file);
                                        });

                                        // Metadatos
                                        formDataFotos.append('eliminadas', JSON.stringify(fotosEliminadasIds));
                                        formDataFotos.append('conservadas', JSON.stringify(fotosConservadasIds));

                                        await postFotosLugar(restaurantId, formDataFotos);
                                    }

                                    // Solo enviar si hay nuevas imágenes o imágenes para eliminar
                                    if (newImages.length > 0 || imagenesEliminadas.length > 0) {
                                        const formData = new FormData();

                                        // Agregar nuevas imágenes
                                        newImages.forEach(img => {
                                            formData.append('fotos', img);
                                        });

                                        // Agregar IDs de imágenes eliminadas
                                        formData.append('imagenesEliminadas', JSON.stringify(imagenesEliminadas));

                                        // Enviar al endpoint específico de imágenes
                                        await postImages(restaurantId, formData);
                                    }


                                    //console.log("Proceso completo: datos e imágenes enviados");
                                }
                            } catch (error) {
                                //console.error('Error en el envío:', error);
                            }
                        })}>

                            <NuevasSeccionesCategorias />

                            <Informacion />

                            <Imagenes
                                slug={restaurante?.slug}
                                existingImages={restaurante?.imagenes}
                            />

                            <FotosLugar existingFotos={restaurante?.fotos_lugar} />

                            <TipoRestaurante />

                            <Categorias />

                            <RedesSociales />

                            <OcasionIdeal />

                            <Sucursales />

                            <CodigoVestir />

                            <UbicacionPrincipal /> {/* Ubicación principal - Tipo de comedor */}

                            {/* <ZonasHabilitadas /> */}

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
                                    <legend>Que pido cuando asisto la primera vez *<br />(4 ó 6 platillos *)</legend>
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

                            <Colaboraciones />


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