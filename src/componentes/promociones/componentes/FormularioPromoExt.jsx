    import { Iconografia } from '../../../componentes/utils/Iconografia.jsx'

    const FormularioPromoExt = ({ onStickerSelect, stickerSeleccionado }) => {
        // Función para verificar si un sticker está seleccionado
        const isSelected = clave => Array.isArray(stickerSeleccionado) && stickerSeleccionado.includes(clave);

        // Función para manejar el clic en un sticker
    const handleStickerClick = clave => {
        const currentSelection = Array.isArray(stickerSeleccionado) ? [...stickerSeleccionado] : [];

        if (currentSelection.includes(clave)) {
            // Si el sticker ya está seleccionado, lo quitamos (deseleccionar)
            onStickerSelect(currentSelection.filter(item => item !== clave));
        } else {
            if (currentSelection.length < 2) { 
                onStickerSelect([...currentSelection, clave]);
            } else {
                // Si se ha alcanzado el límite, mostramos una alerta o mensaje
                alert('Solo puedes seleccionar un máximo de 2 stickers.'); 
            }
        }
    };


        return (
            <div>
                <div className="bg-white p-5 rounded-xl">
                    <div className="flex flex-col pb-5">
                        <label className="block text-4xl font-medium text-gray-950 mb-1 pb-4">Elige stickers para tu cupón ! *</label>
                        <h4 className="pb-2">Lo dice la crítica</h4>
                        <div className="flex flex-row justify-evenly w-full h-auto rounded-full items-center">
                            {Iconografia.categorias.map(categoria => (
                                <div key={categoria.clave} className="flex flex-col justify-center items-center"> {/* Usa clave como key si es única */}
                                    <img
                                        src={categoria.icono}
                                        onClick={() => handleStickerClick(categoria.clave)} // Llama a la nueva función
                                        className={`w-20 h-20 object-contain cursor-pointer drop-shadow-[-1.2px_2.5px_2px_rgba(0,0,0,0.35)] ${isSelected(categoria.clave) ? 'ring-1 ring-yellow-400' : ''}`}
                                        alt={categoria.nombre}
                                    />
                                    <p>{categoria.nombre}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Sección de stickers para ocasiones y zonas */}
                    <div className="flex flex-col pb-5">
                        <h4 className="pb-2">Ocasión</h4>
                        <div className="flex flex-row justify-evenly w-full h-auto items-center">
                            {Iconografia.ocasiones.map(ocasion => (
                                <div key={ocasion.clave} className="flex flex-col justify-center items-center">
                                    <img
                                        src={ocasion.icono}
                                        onClick={() => handleStickerClick(ocasion.clave)}
                                        className={`w-20 h-20 object-contain cursor-pointer drop-shadow-[-1.2px_2.5px_2px_rgba(0,0,0,0.35)] ${isSelected(ocasion.clave) ? 'ring-1 ring-yellow-400' : ''}`}
                                        alt={ocasion.nombre}
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
                                <div key={zona.clave} className="flex flex-col justify-center items-center">
                                    <img
                                        src={zona.icono}
                                        onClick={() => handleStickerClick(zona.clave)}
                                        className={`w-20 h-20 object-contain cursor-pointer drop-shadow-[-1.2px_2.5px_2px_rgba(0,0,0,0.35)] ${isSelected(zona.clave) ? 'ring-1 ring-yellow-400' : ''}`}
                                        alt={zona.nombre}
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