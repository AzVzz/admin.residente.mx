import BannerHorizontal from './BannerHorizontal';

// Banner específico para Chevrolet Rivero Valle
const BannerChevrolet = ({ size = "big" }) => {
  const imageUrl = "https://residente.mx/fotos/fotos-estaticas/chevrolet-rivero-valle.jpg";
  const redirectUrl = "https://chevroletrivero.com/";
  
  // Debug: verificar que la URL esté correcta
  console.log("🚗 Cargando banner de Chevrolet:", imageUrl);
  console.log("🔗 URL de redirección:", redirectUrl);
  
  return (
    <BannerHorizontal 
      size={size}
      customImage={imageUrl}
      customPdf={redirectUrl}
    />
  );
};

export default BannerChevrolet;
