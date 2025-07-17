import { useState, useEffect } from 'react';
import imagenTarjeta from "../../../../imagenes/cola-de-caballo.jpg";

const CarruselPosts = ({ item }) => {
  return (
    <div className="relative mb-3 group">
      <div className="relative overflow-hidden">
        <img
          src={imagenTarjeta}
          className="h-110 w-full object-cover transition-all duration-500 ease-in-out"
          alt="Imagen del post"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 flex flex-col overflow-hidden">
          <div className="w-full flex flex-wrap mb-1">
            <div className="bg-[#FFF200] text-gray-900 text-[10px] font-serif font-semibold px-1.5 py-0.5 shadow-md uppercase mr-1">
              {item.date}
            </div>
            <div className="bg-[#FFF200] text-gray-900 uppercase text-[10px] px-1.5 py-0.5 shadow-md font-serif">
              {item.category}
            </div>
          </div>
          <p className="flex-1 bg-white/60 text-left p-2 leading-tight">
            {item.title}
          </p>
        </div>
      </div>
    </div>
  )
}

const Carrusel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Datos para el carrusel (puedes obtenerlos de una API después)
  const carruselItems = [
    {
      date: "julio 3, 2025",
      category: "Cultura restaurantera",
      title: "¿Ya tienes plan este fin? Desde mariscos hasta carne asada en Cola de Caballo."
    },
    {
      date: "julio 4, 2025",
      category: "Eventos especiales",
      title: "Noche de vinos y tapas en el corazón de la ciudad."
    },
    {
      date: "julio 5, 2025",
      category: "Recomendaciones",
      title: "Los mejores postres para terminar tu comida perfecta."
    }
  ];

  // Cambio automático de slides cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === carruselItems.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000);
    
    return () => clearInterval(interval);
  }, [carruselItems.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Contenedor de slides */}
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {carruselItems.map((item, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <CarruselPosts item={item} />
          </div>
        ))}
      </div>
      
      {/* Controles de navegación */}
      <button 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/60 p-2 rounded-full hover:bg-white/80"
        onClick={() => goToSlide(currentIndex === 0 ? carruselItems.length - 1 : currentIndex - 1)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      
      <button 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/60 p-2 rounded-full hover:bg-white/80"
        onClick={() => goToSlide(currentIndex === carruselItems.length - 1 ? 0 : currentIndex + 1)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default Carrusel;