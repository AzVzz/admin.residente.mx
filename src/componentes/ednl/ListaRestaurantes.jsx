// src/componentes/ListaRestaurantes.jsx
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { FaEdit, FaToggleOn, FaToggleOff, FaInstagram, FaFacebook, FaEnvelope } from 'react-icons/fa';
import './ListaRestaurantes.css'


import { urlApi, imgApi } from '../../componentes/api/url.js';
import { useAuth } from '../Context';
import NotasRelacionadas from './NotasRelacionadas';


const topofthetop = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/topofthetop.avif`;
const favoritosdelpublico = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/favoritsdelpublico.avif`;
const losmasfrecuentados = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/losmasfrecuentados.avif`;
const favoritosdelacritica = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/favoritosdelacritica.avif`;
const valorportudinero = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/valorportudinero.avif`;
const lamejorexperiencia = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/lamejorexperiencia.avif`;
const genuino = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/genuino.avif`;
const iconicos = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/iconicos.avif`;
const innovadores = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/innovadores.avif`;
const joyasocultas = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/joyasocultas.avif`;
const paraveryservistos = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/paraveryservistos.avif`;
const reyesdelcolonia = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/reyesdelcolonia.avif`;
const desayunos = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/desayunos.avif`;
const enpareja = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/enpareja.avif`;
const clasicosregiomontanos = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/clasicosregiomontanos.avif`;
const mexicano = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/mexicano.avif`;
const oriental = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/oriental.avif`;
const comfortfood = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/comfortfood.avif`;
const mariscos = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/mariscos.avif`;
const tacos = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/tacos.avif`;
const italianoypizza = `${imgApi}fotos/fotos-estaticas/listado-iconos-100estrellas/italianoypizza.avif`;


import Footer from './componentes/Footer';
import PromocionesMain from '../promociones/componentes/TicketPromo';

const ListaRestaurantes = () => {
  const { usuario, token } = useAuth(); // Retrieve token from Auth context
  const [categoriasAgrupadas, setCategoriasAgrupadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeCopia, setMensajeCopia] = useState('');

  const copiarEnlace = async (restaurante, slug, canal) => {
    const url = new URL(`https://residente.mx/restaurantes/${encodeURIComponent(slug)}`);
    url.searchParams.set('utm_source', canal.source);
    url.searchParams.set('utm_medium', canal.medium);
    try {
      await navigator.clipboard.writeText(url.toString());
      setMensajeCopia(`Enlace de ${canal.nombre} copiado al portapapeles`);
    } catch {
      setMensajeCopia('No se pudo copiar el enlace. Revisa los permisos del navegador.');
    }
  };

  useEffect(() => {
    if (!mensajeCopia) return;
    const timeout = setTimeout(() => setMensajeCopia(''), 3000);
    return () => clearTimeout(timeout);
  }, [mensajeCopia]);

  // Definición de categorías con título e imagen
  const categorias = [
    { titulo: "Top of the top", imagen: topofthetop },
    { titulo: "Favoritos del público", imagen: favoritosdelpublico },
    { titulo: "Los más frecuentados", imagen: losmasfrecuentados },
    { titulo: "Favoritos de la crítica", imagen: favoritosdelacritica },
    { titulo: "Valor por tu dinero", imagen: valorportudinero },
    { titulo: "La mejor experiencia", imagen: lamejorexperiencia },
    { titulo: "Genuino", imagen: genuino },
    { titulo: "Icónicos", imagen: iconicos },
    { titulo: "Innovadores", imagen: innovadores },
    { titulo: "Joyas ocultas", imagen: joyasocultas },
    { titulo: "Para ver y ser vistos", imagen: paraveryservistos },
    { titulo: "Rey de Colonia", imagen: reyesdelcolonia },
    { titulo: "Desayunos", imagen: desayunos },
    { titulo: "En pareja", imagen: enpareja },
    { titulo: "Clásicos regiomontanos", imagen: clasicosregiomontanos },
    { titulo: "Mexicano", imagen: mexicano },
    { titulo: "Oriental", imagen: oriental },
    { titulo: "Comfort food", imagen: comfortfood },
    { titulo: "Mariscos", imagen: mariscos },
    { titulo: "Tacos", imagen: tacos },
    { titulo: "Italiano & Pizza", imagen: italianoypizza },
  ];

  // Función para formatear los nombres de los restaurantes
  const formatearNombre = (nombre) => {
    if (!nombre) return '';

    // Convertir a minúsculas y luego capitalizar cada palabra
    return nombre.toLowerCase()
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  };

  const handleToggleStatus = async (restaurante) => {
    try {
      const newStatus = restaurante.status === 1 ? 0 : 1;
      const response = await fetch(`${urlApi}api/restaurante/${restaurante.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add Authorization header
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setCategoriasAgrupadas(prev => prev.map(cat => ({
          ...cat,
          restaurantes: cat.restaurantes.map(r =>
            r.id === restaurante.id ? { ...r, status: newStatus } : r
          )
        })));
      } else {
        console.error('Error updating status');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${urlApi}api/restaurante`);
        if (!response.ok) throw new Error('Error al obtener restaurantes');
        const restaurantes = await response.json();

        // Agrupar restaurantes por categoría
        const restaurantesPorCategoria = {};

        restaurantes.forEach(restaurante => {
          if (restaurante.categoria) {
            if (!restaurantesPorCategoria[restaurante.categoria]) {
              restaurantesPorCategoria[restaurante.categoria] = [];
            }
            restaurantesPorCategoria[restaurante.categoria].push(restaurante);
          }
        });

        // Crear estructura final de categorías con restaurantes
        const categoriasConRestaurantes = categorias.map(categoria => ({
          ...categoria,
          restaurantes: restaurantesPorCategoria[categoria.titulo] || []
        }));

        setCategoriasAgrupadas(categoriasConRestaurantes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Cargando lista de restaurantes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="lista-restaurantes">
      {mensajeCopia && createPortal(
        <div role="status" aria-live="polite" className="fixed bottom-4 right-4 z-[9999] rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {mensajeCopia}
        </div>,
        document.body,
      )}
      <div className="lista-logos">
        <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/grises/magazine-logo-gris.webp`} alt="Residente Restaurant Magazine Logo" />
        <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/estrellasdenuevoleon.webp`} alt="Estrellas de Nuevo León Logo" />
        <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/grises/researchdata-logo-gris.webp`} alt="Residente Restaurant Research&Data" />
      </div>
      <p className="text-global">Desde 2016 y con una metodología probada, <b className="font-grotesk">Residente Food&Drink-Media</b> realiza constantemente estudios de mercado entre el público, críticos y expertos de la industria. Estos estudios nos permiten entender y balancear por geografía, edad y poder de compra las preferencias de los consumidores. A continuación se presentan las <b className="font-grotesk">“Estrellas de Nuevo León”</b>, aquellos restaurantes que han logrado distinguirse y posicionarse, por muy diversas razones, dentro del gusto de los consumidores. Los nombres que <b className="font-grotesk">aquí aparecen representan lo mejor de lo mejor, el 1% de la oferta gastronómica de Nuevo León.</b> Esta, no es una lista comercial ni una preferencia amistosa, mucho menos un capricho editorial, sino el resultado de años de estudio y del conocimiento profundo de la cultura culinaria de nuestro estado.</p>

      <div className="categorias-container w-full sm:relative sm:left-1/2 sm:w-[calc(100vw-2rem)] sm:max-w-[1600px] sm:-translate-x-1/2 md:grid-cols-2! xl:grid-cols-3!">
        {categoriasAgrupadas.map((categoria, index) => (
          <div className="categoria-grupo min-w-0" key={index}>
            <div className="categoria-grupo-titulo">
              <h2 className="lista-categorias">{categoria.titulo}</h2>
            </div>
            <div className="categoria-contenido">
              <img src={categoria.imagen} className="categoria-imagen" alt={categoria.titulo} />
              {categoria.restaurantes.length > 0 ? (
                <ul className="min-w-0 flex-1">
                  {categoria.restaurantes.map((restaurante, i) => {
                    const slug = restaurante.slug || restaurante.nombre_restaurante
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/ñ/g, 'n')
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-]/g, '')
                      .replace(/-+/g, '-')        // colapsa multiples guiones
                      .replace(/^-+|-+$/g, '');   // quita guiones al inicio/fin

                    return (
                      <li key={i} className={restaurante.status === 0 ? 'opacity-75' : ''}>
                        <div className="flex items-center justify-end gap-2">
                          {(usuario?.rol === 'residente' || usuario?.permisos === 'todos') && (
                            <>
                              <button
                                onClick={() => handleToggleStatus(restaurante)}
                                className="text-gray-500 hover:text-blue-500 transition-colors focus:outline-none mr-2"
                                title={restaurante.status === 1 ? "Desactivar" : "Activar"}
                              >
                                {restaurante.status === 1 ? (
                                  <FaToggleOn size={22} className="text-green-600" />
                                ) : (
                                  <FaToggleOff size={22} className="text-red-500" />
                                )}
                              </button>
                              {[
                                { nombre: 'Instagram', source: 'instagram', medium: 'social', Icono: FaInstagram },
                                { nombre: 'Facebook', source: 'facebook', medium: 'social', Icono: FaFacebook },
                                { nombre: 'Correo', source: 'newsletter', medium: 'email', Icono: FaEnvelope },
                              ].map(({ Icono, ...canal }) => (
                                <button key={canal.source} type="button" onClick={() => copiarEnlace(restaurante, slug, canal)}
                                  className="shrink-0 text-gray-500 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                                  title={`Copiar enlace para ${canal.nombre}`} aria-label={`Copiar enlace de ${restaurante.nombre_restaurante} para ${canal.nombre}`}>
                                  <Icono size={14} aria-hidden="true" />
                                </button>
                              ))}
                              <Link
                                to={`/formulario/${slug}`}
                                className="text-gray-400 hover:text-blue-500 transition-colors"
                                title="Editar Restaurante"
                              >
                                <FaEdit size={14} />
                              </Link>
                            </>
                          )}
                          <Link
                            to={`/restaurantes/${slug}`}
                            className={`enlace-restaurante ${restaurante.status === 0 ? 'text-red-800 line-through decoration-red-500' : ''}`}
                            title={restaurante.status === 0 ? "Restaurante Inactivo" : ""}
                          >
                            {formatearNombre(restaurante.nombre_restaurante)}
                          </Link>
                        </div>
                        {(usuario?.rol === 'residente' || usuario?.permisos === 'todos') && (
                          <NotasRelacionadas restaurante={restaurante} slug={slug} />
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="sin-restaurantes">Próximamente</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default ListaRestaurantes;
