//src/componentes/promociones/componentes/FormularioPromoExt.jsx
import fourreal from '../../../imagenes/Iconografia/4real.png';
import corazon from '../../../imagenes/Iconografia/corazon.png';
import tendencia from '../../../imagenes/Iconografia/tendencia.png';
import icon from '../../../imagenes/Iconografia/icon.png';
import newIcon from '../../../imagenes/Iconografia/new.png';
import estrellas from '../../../imagenes/Iconografia/estrellas.png';
import calidad from '../../../imagenes/Iconografia/calidad.png';
import calidadPrecio from '../../../imagenes/Iconografia/calidad-precio.png';
import desayunos from '../../../imagenes/Iconografia/desayunos.png';
import amigos from '../../../imagenes/Iconografia/amigos.png';
import cumpleaños from '../../../imagenes/Iconografia/cumpleaños.png';
import noche from '../../../imagenes/Iconografia/noche.png';
import familiar from '../../../imagenes/Iconografia/familiar.png';
import negocios from '../../../imagenes/Iconografia/negocios.png';
import yum from '../../../imagenes/Iconografia/yum.png';
import enPareja from '../../../imagenes/Iconografia/en-pareja.png';
import munch from '../../../imagenes/Iconografia/munch.png';
import mty from '../../../imagenes/Iconografia/mty.png';
import sta from '../../../imagenes/Iconografia/sta.png';
import apo from '../../../imagenes/Iconografia/apo.png';
import mtyPte from '../../../imagenes/Iconografia/mty-pte.png';
import spg from '../../../imagenes/Iconografia/spg.png';
import esc from '../../../imagenes/Iconografia/esc.png';
import mtySur from '../../../imagenes/Iconografia/mty-sur.png';
import gpe from '../../../imagenes/Iconografia/gpe.png';
import snn from '../../../imagenes/Iconografia/snn.png';


const FormularioPromoExt = ({ onStickerSelect }) => {

    const iconografia = {
        categorias: [
            { nombre: "Autenticidad", icono: fourreal },
            { nombre: "Garantía", icono: corazon },
            { nombre: "Tendencia", icono: tendencia },
            { nombre: "Iconico", icono: icon },
            { nombre: "Nuevo", icono: newIcon },
            { nombre: "Memorable", icono: estrellas },
            { nombre: "Calidad", icono: calidad },
            { nombre: "Calidad Precio", icono: calidadPrecio },
        ],
        ocasiones: [
            { nombre: "Desayunos", icono: desayunos },
            { nombre: "Amigos", icono: amigos },
            { nombre: "Cumpleaños", icono: cumpleaños },
            { nombre: "Night", icono: noche },
            { nombre: "Familiar", icono: familiar },
            { nombre: "Antojo", icono: yum },
            { nombre: "En pareja", icono: enPareja },
            { nombre: "Munch", icono: munch },
        ],
        zonas: [
            { nombre: "Monterrey", icono: mty },
            { nombre: "Santa Catarina", icono: sta },
            { nombre: "Apodaca", icono: apo },
            { nombre: "Poniente", icono: mtyPte },
            { nombre: "San Pedro", icono: spg },
            { nombre: "Escobedo", icono: esc },
            { nombre: "Sur", icono: mtySur },
            { nombre: "Guadalupe", icono: gpe },
            { nombre: "San Nicolás", icono: snn },
        ]
    };

    return (
        <div>
            <div className="bg-white p-5 rounded-xl">
                <div className="flex flex-col pb-5">
                    <label className="block text-4xl font-medium text-gray-950 mb-1 pb-4">Eligue un sticker para tu cupón ! *</label>
                    <h4 className="pb-2">Lo dice la crítica</h4>
                    <div className="flex flex-row justify-evenly w-full h-auto  rounded-full items-center">
                        {iconografia.categorias.map(categoria => (
                            <div key={categoria.nombre} className="flex flex-col justify-center items-center ">
                                <img
                                    src={categoria.icono}
                                    onClick={() => onStickerSelect(categoria.icono)}
                                    className="w-20 h-20 object-contain cursor-pointer drop-shadow-[-1.2px_2.5px_2px_rgba(0,0,0,0.35)]"
                                />
                                <p>{categoria.nombre}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col pb-5">
                    <h4 className="pb-2">Ocasión</h4>
                    <div className="flex flex-row justify-evenly w-full h-auto items-center">
                        {iconografia.ocasiones.map(ocasion => (
                            <div className="flex flex-col justify-center items-center">
                                <img
                                    src={ocasion.icono}
                                    onClick={() => onStickerSelect(ocasion.icono)}
                                    className="w-20 h-20 object-contain cursor-pointer drop-shadow-[-1.2px_2.5px_2px_rgba(0,0,0,0.35)]"
                                />
                                <p>{ocasion.nombre}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col">
                    <h4 className="pb-2">Por zona</h4>
                    <div className="flex flex-row justify-evenly w-full h-auto items-center">
                        {iconografia.zonas.map(zona => (
                            <div className="flex flex-col justify-center items-center">
                                <img
                                    src={zona.icono}
                                    onClick={() => onStickerSelect(zona.icono)}
                                    className="w-20 h-20 object-contain cursor-pointer drop-shadow-[-1.2px_2.5px_2px_rgba(0,0,0,0.35)]"
                                />
                                <p>{zona.nombre}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FormularioPromoExt;