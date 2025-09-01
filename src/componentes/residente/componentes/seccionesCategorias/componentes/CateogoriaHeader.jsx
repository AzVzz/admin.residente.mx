import DirectorioVertical from "../../componentesColumna2/DirectorioVertical";

const CategoriaHeader = ({
    categoriaH1ContainerRef,
    categoriaH1Ref,
    categoriaFontSize,
    renderCategoriaH1,
    categoria,
    restaurantes
}) => (
    <div
        ref={categoriaH1ContainerRef}
        className="col-span-2 min-w-0 overflow-hidden flex flex-col h-full"
    >
        <h1 className="text-[60px] leading-15 tracking-tight flex-shrink-0">
            {categoria}
        </h1>

        {/*
        <DirectorioVertical
            categoria={categoria}
            restaurantes={restaurantes}
        />*/}
        <p className="text-[22px] leading-[1.6rem]">
            Recomendaciones y noticias de los mejores restaurantes con un tikeckt promedio de $1,200
        </p>
    </div>
);

export default CategoriaHeader;