// PostPrincipal.jsx
import SinFoto from '../../../../imagenes/ResidenteColumna1/SinFoto.png';
import real from '../../../../imagenes/Iconografia/4real.png'
import calidad from '../../../../imagenes/Iconografia/calidad.png'

const PostPrincipal = ({ post, onClick }) => {
    return (
        <div
            className="flex flex-col cursor-pointer h-[725px] overflow-hidden mb-5"
            onClick={onClick}
        >
            <div className="h-[400px] overflow-hidden">
                <div className="relative h-full">
                    <div className="absolute top-3 left-3 z-10 bg-gradient-to-r bg-[#FFF200] text-gray-900 text-[10px] font-semibold px-1.5 py-0.5 shadow-md font-serif uppercase">
                        {post.fecha}
                    </div>
                    <img
                        src={post.imagen || SinFoto}
                        className="w-full h-full object-cover"
                        alt={post.titulo}
                    />
                </div>
            </div>
            <div className="bg-black p-10 flex flex-col h-[325px] relative">
                <div className="mb-1 flex items-center justify-between">
                    <span className="font-serif inline-block bg-[#FFF200] text-gray-900 uppercase text-[10px] font-bold px-1.5 py-0.5 shadow-md">
                        {post.tipo_nota}
                    </span>
                    {/* Iconos en posición absoluta */}
                    <div className="absolute top-6 right-9 flex gap-4 z-10">
                        <img src={real} alt="Monterrey" className="h-12 w-12 rounded-full shadow" />
                        <img src={calidad} alt="San Nicolás" className="h-12 w-12 rounded-full shadow" />
                    </div>
                </div>
                <h1 className="text-white text-[40px] leading-[1.1] font-black flex-1 overflow-hidden content-center">
                    {post.titulo}
                </h1>
                <p className="text-white font-light">{`de ${post.autor}`}</p>
            </div>
        </div>
    )
}

export default PostPrincipal;