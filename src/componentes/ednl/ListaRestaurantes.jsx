// src/componentes/ListaRestaurantes.jsx
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ListaRestaurantes.css'


import { urlApi, imgApi } from '../../componentes/api/url.js';


const topofthetop =`${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/topofthetop.avif`;
const favoritosdelpublico = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/favoritsdelpublico.avif`;
const losmasfrecuentados = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/losmasfrecuentados.avif`;
const favoritosdelacritica = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/favoritosdelacritica.avif`;
const valorportudinero = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/valorportudinero.avif`;
const lamejorexperiencia = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/lamejorexperiencia.avif`;
const genuino = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/genuino.avif`;
const iconicos = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/iconicos.avif`;
const innovadores = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/innovadores.avif`;
const joyasocultas = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/joyasocultas.avif`;
const paraveryservistos = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/paraveryservistos.avif`;
const reyesdelcolonia = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/reyesdelcolonia.avif`;
const desayunos = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/desayunos.avif`;
const enpareja = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/enpareja.avif`;
const clasicosregiomontanos = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/clasicosregiomontanos.avif`;
const mexicano = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/mexicano.avif`;
const oriental = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/oriental.avif`;
const comfortfood = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/comfortfood.avif`;
const mariscos = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/mariscos.avif`;
const tacos = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/tacos.avif`;
const italianoypizza = `${urlApi}fotos/fotos-estaticas/listado-iconos-100estrellas/italianoypizza.avif`;


import Footer from './componentes/Footer';
import PromocionesMain from '../promociones/componentes/TicketPromo';

const ListaRestaurantes = () => {
  const [categoriasAgrupadas, setCategoriasAgrupadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="lista-logos">
        <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/grises/magazine-logo-gris.webp`} alt="Residente Restaurant Magazine Logo" />
        <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/estrellasdenuevoleon.webp`} alt="Estrellas de Nuevo León Logo" />
        <img src={`${imgApi}fotos/fotos-estaticas/residente-logos/grises/researchdata-logo-gris.webp`} alt="Residente Restaurant Research&Data" />
      </div>
      <p className="text-global">Desde 2016 y con una metodología probada, <b className="font-grotesk">Residente Food&Drink-Media</b> realiza constantemente estudios de mercado entre el público, críticos y expertos de la industria. Estos estudios nos permiten entender y balancear por geografía, edad y poder de compra las preferencias de los consumidores. A continuación se presentan las <b className="font-grotesk">“Estrellas de Nuevo León”</b>, aquellos restaurantes que han logrado distinguirse y posicionarse, por muy diversas razones, dentro del gusto de los consumidores. Los nombres que <b className="font-grotesk">aquí aparecen representan lo mejor de lo mejor, el 1% de la oferta gastronómica de Nuevo León.</b> Esta, no es una lista comercial ni una preferencia amistosa, mucho menos un capricho editorial, sino el resultado de años de estudio y del conocimiento profundo de la cultura culinaria de nuestro estado.</p>

      <div className="categorias-container">
        {categoriasAgrupadas.map((categoria, index) => (
          <div className="categoria-grupo" key={index}>
            <div className="categoria-grupo-titulo">
              <h2 className="lista-categorias">{categoria.titulo}</h2>
            </div>
            <div className="categoria-contenido">
              <img src={categoria.imagen} className="categoria-imagen" alt={categoria.titulo} />
              {categoria.restaurantes.length > 0 ? (
                <ul>
                  {categoria.restaurantes.map((restaurante, i) => {
                    const slug = restaurante.nombre_restaurante
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/ñ/g, 'n')
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-]/g, '');

                    return (
                      <li key={i} >
                        <Link
                          to={`/restaurante/${slug}`}
                          className="enlace-restaurante"
                        >
                          {formatearNombre(restaurante.nombre_restaurante)}
                        </Link>
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