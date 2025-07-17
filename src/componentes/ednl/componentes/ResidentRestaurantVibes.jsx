import { useState } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ResidentRestaurantVibes = ({ fotos = [] }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  if (fotos.length === 0) {
    return null;
  }

  const settings = {
    dots: fotos.length > 1,
    infinite: fotos.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: fotos.length > 1,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    adaptiveHeight: false,
    prevArrow: <CustomArrow direction="prev" />,
    nextArrow: <CustomArrow direction="next" />,
  };

  const modalSettings = {
    ...settings,
    initialSlide: currentSlide,
    dots: true,
    autoplay: false,
    beforeChange: (current, next) => setCurrentSlide(next),
    prevArrow: <CustomArrow direction="prev" modal />,
    nextArrow: <CustomArrow direction="next" modal />,
  };

  // Componente personalizado para flechas
  function CustomArrow({ direction, onClick, modal = false }) {
    const isPrev = direction === "prev";
    const arrowClass = isPrev ? "slick-prev" : "slick-next";
    const arrowStyle = modal ? {
      color: 'black',
      fontSize: '24px',
      zIndex: 10,
    } : {
      color: 'black',
      fontSize: '24px',
    };
    
    return (
      <button
        type="button"
        className={`slick-arrow ${arrowClass} custom-arrow`}
        onClick={onClick}
        style={arrowStyle}
        aria-label={isPrev ? "Previous" : "Next"}
      >
        {isPrev ? "←" : "→"}
      </button>
    );
  }

  const openModal = (index) => {
    setCurrentSlide(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="mt-6">
      {/* Estilos personalizados para el carrusel */}
      <style jsx global>{`
        /* Flechas en negro */
        .slick-prev:before, 
        .slick-next:before {
          display: none; /* Ocultamos el icono predeterminado */
        }
        
        /* Puntos (dots) en negro */
        .slick-dots li button:before {
          color: black !important;
          opacity: 0.5;
        }
        .slick-dots li.slick-active button:before {
          color: black !important;
          opacity: 1;
        }
        
        /* Flechas personalizadas */
        .custom-arrow {
          width: 40px;
          height: 40px;
          display: flex !important;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        .custom-arrow:hover {
          background: rgba(255, 255, 255, 0.9);
        }
      `}</style>

      <h3 className="text-categoria">
        Residente Restaurant Vibes
      </h3>

      <div className="space-y-4">
        <div className={`relative w-full ${fotos.length > 1 ? 'pb-12' : ''}`}>
          <Slider {...settings} className="h-full">
            {fotos.map((foto, index) => (
              <div key={index} className="h-full">
                <div 
                  className="w-full aspect-video cursor-pointer"
                  onClick={() => openModal(index)}
                >
                  <img 
                    src={foto.url_imagen ? `https://estrellasdenuevoleon.com.mx${foto.url_imagen}` : "/placeholder.svg"} 
                    alt={`Vibes del restaurante ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Modal para vista expandida */}
      {modalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4"
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
              {fotos.map((foto, index) => (
                <div key={`modal-${index}`} className="h-[80vh] flex items-center justify-center">
                  <img 
                    src={foto.url_imagen ? `https://estrellasdenuevoleon.com.mx${foto.url_imagen}` : "/placeholder.svg"} 
                    alt={`Vibes ampliada ${index + 1}`}
                    className="max-w-full max-h-full object-contain mx-auto"
                  />
                </div>
              ))}
            </Slider>
          </div>
          
          <p className="text-white mt-4 text-center">
            {currentSlide + 1} / {fotos.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default ResidentRestaurantVibes;