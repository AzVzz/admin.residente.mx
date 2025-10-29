// BannerRevista.jsx es un nombre equivocado es el main de tda la página de residente.

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { catalogoNotasGet, notasDestacadasTopGet, notasPublicadasPorId, notasResidenteGet } from '../../api/notasPublicadasGet';
import { catalogoTipoNotaGet } from '../../../componentes/api/CatalogoSeccionesGet.js';
import { cuponesGet } from '../../api/cuponesGet.js';
import { useData } from '../../DataContext';
import DetalleBannerRevista from './DetalleBannerRevista';
import ListadoBannerRevista from './ListadoBannerRevista';

const BannerRevista = () => {
  const { id } = useParams();
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [detalleCargando, setDetalleCargando] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [cupones, setCupones] = useState([]);

  const topRef = useRef(null);
  const navigate = useNavigate();

  const { revistaActual } = useData();
  const [notasDestacadas, setNotasDestacadas] = useState([]);
  const [cargandoDestacadas, setCargandoDestacadas] = useState(true);
  const [errorDestacadas, setErrorDestacadas] = useState(null);

  // ✅ INICIALIZA VACÍO: que no use valores del front
  const [tiposNotas, setTiposNotas] = useState([]);

  useEffect(() => {
    const fetchDestacadas = async () => {
      setCargandoDestacadas(true);
      setErrorDestacadas(null);
      try {
        const data = await notasDestacadasTopGet();
        setNotasDestacadas(data);
      } catch (err) {
        setErrorDestacadas(err);
      } finally {
        setCargandoDestacadas(false);
      }
    };
    fetchDestacadas();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setCargando(true);
      setError(null);
      try {
        const data = await catalogoNotasGet();
        setPosts(data);
      } catch (err) {
        setError(err);
      } finally {
        setCargando(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (id) {
      setDetalleCargando(true);
      setErrorDetalle(null);
      setSelectedPost(null);
      notasPublicadasPorId(id)
        .then(post => setSelectedPost(post))
        .catch(err => setErrorDetalle(err))
        .finally(() => setDetalleCargando(false));
    }
  }, [id]);

  // ✅ CARGA DESDE BACK: catalogoTipoNotaGet() YA retorna el array
  useEffect(() => {
    const cargarTiposNotas = async () => {
      try {
        const data = await catalogoTipoNotaGet(); // <- data es el ARRAY
        // Opcional: debug
        //console.log('Tipos de notas (backend):', data);
        if (Array.isArray(data) && data.length) {
          setTiposNotas(data); // ✅ asigna directo
        } else {
          setTiposNotas([]); // o algún fallback si quieres
        }
      } catch (error) {
        console.error("Error al cargar tipos de notas:", error);
        setTiposNotas([]); // fallback mínimo
      }
    };
    cargarTiposNotas();
  }, []);

  // Cargar cupones
  useEffect(() => {
    cuponesGet()
      .then(data => setCupones(Array.isArray(data) ? data : []))
      .catch(() => setCupones([]));
  }, []);

  // Guardar posición al hacer clic en una tarjeta
  const handleCardClick = async (id) => {
    setScrollPosition(window.scrollY);
    navigate(`/notas/${id}`);
  };

  const handleVolver = () => {
    navigate('/notas');
    setSelectedPost(null);
    setErrorDetalle(null);
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">Error: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const normalizar = str => (str || '').toLowerCase().replace(/-/g, ' ').trim();

  const filtrarPostsPorTipoNota = (tipo) =>
    posts.filter(
      post =>
        normalizar(post.tipo_nota) === normalizar(tipo) ||
        normalizar(post.tipo_nota2) === normalizar(tipo)
    );
  const filtrarDestacadasPorTipoNota = (tipo) =>
    notasDestacadas.filter(
      nota =>
        normalizar(nota.tipo_nota) === normalizar(tipo) ||
        normalizar(nota.tipo_nota2) === normalizar(tipo)
    );

  return (
    <div ref={topRef} className="">
      {id ? (
        <div className="flex flex-col">
          <DetalleBannerRevista
            detalleCargando={detalleCargando}
            errorDetalle={errorDetalle}
            handleVolver={handleVolver}
            selectedPost={selectedPost}
            tiposNotas={tiposNotas}
            revistaActual={revistaActual}
            notasDestacadas={notasDestacadas}
            handleCardClick={handleCardClick}
            notasResidenteGet={notasResidenteGet}
            cupones={cupones}
          />
        </div>
      ) : (
        <ListadoBannerRevista
          tiposNotas={tiposNotas}
          filtrarPostsPorTipoNota={filtrarPostsPorTipoNota}
          filtrarDestacadasPorTipoNota={filtrarDestacadasPorTipoNota}
          handleCardClick={handleCardClick}
          revistaActual={revistaActual}
          notasResidenteGet={notasResidenteGet}
        />
      )}
    </div>
  );
};

export default BannerRevista;