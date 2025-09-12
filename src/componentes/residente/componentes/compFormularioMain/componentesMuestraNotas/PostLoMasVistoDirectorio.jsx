const NotaLoMasVistoSeccion = ({ tipoDeNota, titulo, imagen }) => (
    <li className="min-h-[83px] relative">
        <div className="flex items-center h-full w-full transition-shadow">
            <div className="w-1/3 h-full">
                <img
                    src={imagen || `https://p.residente.mx/fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="w-2/3 pl-4 h-full flex flex-col justify-center">
                <div className="flex items-center mb-1">
                    <span className="font-serif inline-block bg-black text-[#fff300] text-[7px] px-0.5 py-0 shadow-md max-w-max mb-0.5">
                        {tipoDeNota}
                    </span>
                </div>
                <h4 className="font-bold text-sm leading-3.5">{titulo}</h4>
            </div>
        </div>
    </li>
);

const PostLoMasVistoDirectorio = ({ tipoDeNota, titulo, imagen }) => {
    return (
        <section className="mb-5 h-[100px] flex flex-col">
            <div className="flex justify-end items-end">
                <h3 className="pb-5 text-[40px] leading-4">Lo más visto</h3>
            </div>
            <div className="flex-grow">
                <ul className="h-full flex flex-col gap-3">
                    <li className="h-[calc(10%-0.625rem)] min-h-[83px] relative">
                        <div className="flex items-center cursor-pointer h-full w-full transition-shadow">
                            <div className="w-1/3 h-full">
                                <img
                                    src={imagen || `https://p.residente.mx/fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="w-2/3 pl-4 h-full flex flex-col justify-center">
                                <div className="flex items-center mb-1">
                                    <span className="font-serif inline-block bg-black text-[#fff300] text-[7px] px-0.5 py-0 shadow-md max-w-max mb-0.5">
                                        {tipoDeNota || 'Sin categoría'}
                                    </span>
                                </div>
                                <h4 className="font-bold text-sm leading-3.5">{titulo}</h4>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </section>
    );
};

export default PostLoMasVistoDirectorio;
