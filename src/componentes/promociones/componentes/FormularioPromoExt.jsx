//src/componentes/promociones/componentes/FormularioPromoExt.jsx
import { Iconografia } from '../../../componentes/utils/Iconografia.jsx'

const FormularioPromoExt = ({ onStickerSelect }) => {
    return (
        <div>
            <div className="bg-white p-5 rounded-xl">
                <div className="flex flex-col pb-5">
                    <label className="block text-4xl font-medium text-gray-950 mb-1 pb-4">Eligue un sticker para tu cupón ! *</label>
                    <h4 className="pb-2">Lo dice la crítica</h4>
                    <div className="flex flex-row justify-evenly w-full h-auto  rounded-full items-center">
                        {Iconografia.categorias.map(categoria => (
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
                        {Iconografia.ocasiones.map(ocasion => (
                            <div key={ocasion.nombre} className="flex flex-col justify-center items-center">
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
                        {Iconografia.zonas.map(zona => (
                            <div key={zona.nombre} className="flex flex-col justify-center items-center">
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