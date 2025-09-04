import './ContenidoRestaurante.css';

const ContenidoRestaurante = ({
  fechaInauguracion,
  nombreRestaurante,
  comida,
  reseñas // Recibe el array de reseñas
}) => {
  
  // Unir todas las reseñas en un solo texto
  const textoReseñas = reseñas.map(item => {
    // Cada item es un objeto con una sola propiedad
    const valor = Object.values(item)[0];
    return valor;
  }).join(' ');

  return (
    <div className="container-contenido-restaurante flex items-center flex-col">
      <h3 className="text-[clamp(1.2rem,2.2vw,1.8rem)] font-grotesk uppercase leading-5 mt-4">
        Desde {fechaInauguracion || '... Fecha no disponible'}
      </h3>

      <div>
        <h1 className="text-[clamp(2.8rem,10.2vw,6rem)] font-grotesk text-center font-extrabold leading-[0.5] text-rendering-optimizeLegibility subpixel-antialiased tracking-tighter py-[clamp(.6rem,1.2vw,1.2rem)] uppercase mb-3">
          {nombreRestaurante}
        </h1>
      </div>

      <h3 className="text-categoria">
        {comida}
      </h3>

      {/* Nueva sección para mostrar reseñas unidas */}
      <div className="w-full max-w-3xl text-center">
        <p className="text-global">
          {textoReseñas || 'No hay reseñas disponibles'}
        </p>
      </div>
    </div>
  );
};

export default ContenidoRestaurante;