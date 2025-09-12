const NotaLoMasVistoMain = ({ fecha, titulo, imagen }) => (
    <li className="h-[calc(10%-0.625rem)] min-h-[83px] relative">
        <div className="flex items-center h-full w-full transition-shadow">
            <div className="w-1/3 h-full">
                <img
                    src={imagen || `https://p.residente.mx/fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="w-2/3 pl-4 h-full flex flex-col justify-center">
                <div className="text-xs text-gray-600 mb-1">
                    <span className="capitalize">{fecha}</span>
                </div>
                <h4 className="font-bold text-sm leading-3.5">{titulo}</h4>
            </div>
        </div>
    </li>
);

const PostLoMasVisto = ({ titulo, imagen, fecha }) => {
    return (
        <section className="mb-5 flex flex-col border-b">
            <div>
                <h3 className="pb-5 text-[30px] leading-4">Lo más visto (Main)</h3>
            </div>
            <div className="flex-grow">
                <ul className="h-full flex flex-col gap-3">
                    <NotaLoMasVistoMain 
                        titulo={titulo} 
                        imagen={imagen} 
                        fecha={fecha}
                    />
                </ul>
            </div>
        </section>
    );
};

export default PostLoMasVisto;
