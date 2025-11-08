import BannerHorizontal from './BannerHorizontal';
import { urlApi, imgApi } from '../../../componentes/api/url.js'

// Banner específico para Chevrolet Rivero Valle
const BannerChevrolet = ({ size = "big" }) => {
  const imageUrl = `${urlApi}fotos/fotos-estaticas/chevrolet-rivero-valle.jpg`;
  const redirectUrl = "https://chevroletrivero.com/";

  return (
    <BannerHorizontal
      size={size}
      customImage={imageUrl}
      customPdf={redirectUrl}
    />
  );
};

export default BannerChevrolet;
