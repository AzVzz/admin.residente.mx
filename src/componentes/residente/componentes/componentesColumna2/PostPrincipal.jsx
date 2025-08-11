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
            className="flex flex-col cursor-pointer max-h-[725px] overflow-hidden mb-4"
            onClick={onClick}
        >
            <div className="h-[400px] overflow-hidden">
                <div className="relative h-full">
                    <div className="absolute top-8 left-7 z-10 bg-gradient-to-r bg-[#FFF300] text-gray-900 text-[11px] font-semibold px-3 py-0.5 shadow-md font-serif uppercase">
                        {post.fecha}
                    </div>
                    <img
                        src={post.imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                        className="w-full h-full object-cover"
                        alt={post.titulo}
                    />
                    {/* Mostrar los stickers seleccionados */}
                    <div className="absolute top-7 right-9 flex gap-1 z-10">
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
            <div
                className="bg-black p-8 flex flex-col min-h-[120px] max-h-[325px] relative justify-start"
                style={{
                    height: 'auto',
                }}
            >
                <div className="mb-1 flex items-center justify-between">
                    <span className="font-serif inline-block bg-[#FFF200] text-gray-900 uppercase text-[10px] font-bold px-3 py-0.5 shadow-md">
                        {post.tipo_nota}
                    </span>
                </div>
                <h1
                    className="text-white text-[40px] leading-[1.1] font-black flex-1 overflow-hidden content-center"
                    style={{
                        whiteSpace: 'pre-line',
                        wordBreak: 'break-word',
                    }}
                >
                    {post.titulo}
                </h1>
            </div>
        </div>
    )
}

export default PostPrincipal;