import { useState } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import StarIcon from "../../../iconos/StarIcon";
import "./PlatilloEstrellaCarrusel.css";
import useFitText from 'use-fit-text';
import { urlApi } from '../../api/url'

// Componente de flecha personalizada
function CustomArrow({ direction, onClick, modal = false }) {
  const isPrev = direction === "prev";
  const arrowClass = isPrev ? "slick-prev" : "slick-next";
  const arrowStyle = {
    color: 'black',
    fontSize: '24px',
    zIndex: 5,
    background: 'rgba(255, 255, 255, 0.7)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  };

  return (
    <button
      type="button"
      className={`slick-arrow ${arrowClass} custom-arrow`}
      onClick={onClick}
      style={arrowStyle}
      aria-label={isPrev ? "Anterior" : "Siguiente"}
    >
      {isPrev ? "←" : "→"}
    </button>
  );
}

const PlatilloEstrellaCarrusel = ({ imagenes = [], estrella, nombrePlatillo }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const isMobile = window.innerWidth <= 768;
  const { fontSize, ref: titleRef } = useFitText({
    minFontSize: 12,
    maxFontSize: isMobile ? 100 : 200, // Tamaño máximo más pequeño para el título
    resolution: 5,
  });

  // Settings para carrousel
  const settings = {
    dots: true,
    infinite: imagenes.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: imagenes.length > 1,
    adaptiveHeight: false,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    prevArrow: <CustomArrow direction="prev" />,
    nextArrow: <CustomArrow direction="next" />,
  };

  const modalSettings = {
    ...settings,
    initialSlide: currentSlide,
    dots: true,
    autoplay: false,
    beforeChange: (current, next) => setCurrentSlide(next),
  };

  const openModal = (index) => {
    setCurrentSlide(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="container-platillo-estrella">
      {/* Estilos personalizados para flechas y dots */}
      <style jsx global>{`
        .slick-prev:before, 
        .slick-next:before {
          display: none;
        }
        
        .slick-dots li button:before {
          color: black !important;
          opacity: 0.5;
        }
        .slick-dots li.slick-active button:before {
          color: black !important;
          opacity: 1;
        }
        
        .custom-arrow {
          background: rgba(255, 255, 255, 0.7) !important;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        .custom-arrow:hover {
          background: rgba(255, 255, 255, 0.9) !important;
        }
      `}</style>

      <div className="imagen-fondo">
        <Slider {...settings}>
          {imagenes.map((img, index) => (
            <div key={index} onClick={() => openModal(index)} style={{ cursor: 'pointer' }}>
              <img
                src={img ? `${urlApi}${img}` : "/placeholder.svg"}
                alt={`Slide ${index + 1}`}
                className="imagen-principal"
              />
            </div>
          ))}
        </Slider>
      </div>

      <img src={estrella || "/placeholder.svg"} className="estrella-decorativa" alt="Estrella decorativa" />

      <div className="contenedor-textos">
        <div className="badge-estrella">
          <div className="estrellas">
            <StarIcon />
            <StarIcon />
            <StarIcon />
          </div>
          <h4>
            Platillo
            <br />
            Favorito
          </h4>
          {/* Contenedor ajustable para el título */}
          <div
            ref={titleRef}
            style={{
              fontSize,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minHeight: isMobile ? '1px' : '45px',
              maxHeight: isMobile ? '30px' : '60px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              lineHeight: '1.2',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
            }}
          >
            <h3 className="titulo-platillo">
              {nombrePlatillo || 'Platillo no disponible'}
            </h3>
          </div>
        </div>
      </div>

      {/* Modal para vista expandida */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col items-center justify-center p-4"
          onClick={closeModal}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl z-50 bg-black rounded-full w-10 h-10"
            onClick={closeModal}
          >
            &times;
          </button>

          <div
            className="w-full max-w-6xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Slider {...modalSettings}>
              {imagenes.map((img, index) => (
                <div key={`modal-${index}`} className="flex items-center justify-center h-full">
                  <div className="flex items-center justify-center w-full h-full">
                    <img
                      src={img ? `${urlApi}${img}` : "/placeholder.svg"}
                      alt={`Platillo ampliado ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          <p className="text-white mt-4 text-center">
            {currentSlide + 1} / {imagenes.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default PlatilloEstrellaCarrusel;