// PostPrincipal.jsx
import { Iconografia } from '../../../utils/Iconografia.jsx';
import { urlApi } from "../../../api/url.js";

const PostPrincipal = ({ post, onClick }) => {
    const iconosDisponibles = [
        ...Iconografia.categorias,
        ...Iconografia.ocasiones,
        ...Iconografia.zonas
    ];

    // Filtrar iconos que están en el post
    const stickers = Array.isArray(post.sticker)
        ? post.sticker
        : post.sticker
            ? [post.sticker]
            : [];

    return (
        <div
            className="flex flex-col cursor-pointer max-h-[735px] overflow-hidden mb-4 pb-4 pt" 
            onClick={onClick}
        >{/** Antes h-[725] */}
            <div className="h-[400px] overflow-hidden">
                <div className="relative h-full">

                    
                    <img
                        src={post.imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                        className="w-full h-full object-cover"
                        alt={post.titulo}
                    />

                    {/* Mostrar los stickers seleccionados */}
                    <div className="absolute top-5 right-6 flex gap-1 z-10">
                        {stickers.map(clave => {
                            const icono = iconosDisponibles.find(i => i.clave === clave);
                            return icono ? (
                                <img
                                    key={clave}
                                    src={icono.icono}
                                    alt={icono.nombre}
                                    className="h-15 w-15 rounded-full shadow"
                                />
                            ) : null;
                        })}
                    </div>
                </div>
            </div>
            {/** max-h-[325px] antes */}
            <div
                className="bg-transparent flex flex-col min-h-[120px] max-h-[365px] relative justify-start"
                style={{
                    height: 'auto',
                }}
            >
                <div className="flex justify-center items-center pt-3">
                    <div className="z-10 bg-gradient-to-r bg-transparent text-black text-[14px] font-black px-6 py-0.5 font-roman uppercase w-fit flex pt-3">
                        {post.fecha}
                    </div>
                </div>
                <h1
                    className="text-black text-[47px] leading-[1.05] font-black flex-1 overflow-hidden text-center px-2 pb-2 my-0 tracking-tight pt-2"
                    style={{
                        whiteSpace: 'pre-line',
                        wordBreak: 'break-word',
                    }}
                >
                    {post.titulo}
                </h1>
            </div>
            {/** <hr className="border-gray-800/80 border-dotted mt-5"/>*/}
            
        </div>
    )
}

export default PostPrincipal;