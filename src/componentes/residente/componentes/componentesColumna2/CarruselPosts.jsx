import imagenTarjeta from "../../../../imagenes/cola-de-caballo.jpg";

const CarruselPosts = () => {
  return (
    <div className="relative mb-3 group">
      <div className="relative overflow-hidden">
        <img
          src="https://img.hellofresh.com/w_3840,q_auto,f_auto,c_fill,fl_lossy/hellofresh_website/es/cms/SEO/recipes/albondigas-caseras-de-cerdo-con-salsa-barbacoa.jpeg"
          className="h-110 w-full object-cover transition-all duration-500 ease-in-out"
          alt="Imagen del restaurante"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center overflow-hidden">
          <div className="w-full flex flex-wrap mb-1"></div>
          <span className="inline-block bg-white/60 px-4 py-2 rounded font-bold text-center text-8xl tracking-tight">
            Pangea
          </span>
        </div>
      </div>
    </div>
  );
};

export default CarruselPosts;