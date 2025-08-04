import { Link } from 'react-router-dom';
import { urlApi } from '../../api/url';

const Footer = () => {
    return (
        <div className="w-full max-w-[1280px] mx-auto flex items-center justify-between py-5">
            
            <div className="relative w-[70%] max-w-[900px]">
                <img 
                    src={`${urlApi}fotos/fotos-estaticas/componente-sin-carpetas/barcode.avif`} 
                    alt="Código de barras" 
                    className="w-full object-contain"
                />
                
                {/* Botón invisible debajo del código */}
                <Link 
                    to="/formulario" // Cambia esto al link que desees
                    className="absolute top-full mt-1 w-1 h-6 opacity-0"
                >
                    Irs
                </Link>
            </div>

            <Link to="/" className="w-[25%] max-w-[300px]">
                <img 
                    src={`${urlApi}fotos/fotos-estaticas/residente-logos/estrellasdenuevoleon.webp`} 
                    alt="Estrellas de Nuevo León" 
                    className="w-full object-contain"
                />
            </Link>
        </div>
    );
};

export default Footer;
