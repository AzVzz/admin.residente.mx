import { Iconografia } from "../../utils/Iconografia.jsx";
import { urlApi, imgApi } from "../../api/url.js";

const PlantillaPostPrincipal = ({ post, onClick }) => {
    const iconosDisponibles = [
        ...Iconografia.categorias,
        ...Iconografia.ocasiones,
        ...Iconografia.zonas
    ];

    const stickers = Array.isArray(post.sticker)
        ? post.sticker
        : post.sticker
            ? [post.sticker]
            : [];

    return (
        <div
            className="flex flex-col cursor-pointer max-h-[900px] overflow-hidden mb-4 pb-4 pt"
            onClick={onClick}
        >
            <div className="h-[450px] overflow-hidden">
                <div className="relative h-full">
                    <img
                        src={post.imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                        className="w-full h-full object-cover"
                        alt={post.titulo}
                    />
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
            <div
                className="bg-transparent flex flex-col min-h-[120px] max-h-[395px] relative justify-start"
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
        </div>
    );
};

export default PlantillaPostPrincipal;