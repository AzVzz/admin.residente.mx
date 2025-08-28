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
        {/**
         * 
         * 
         * <h1
            ref={categoriaH1Ref}
            className="font-bold mb-4 leading-30 tracking-tight w-full"
            style={{ fontSize: `${categoriaFontSize}px`, lineHeight: 1.1 }}
        >
            {renderCategoriaH1(categoria)}
        </h1>
         */}
        <DirectorioVertical
            categoria={categoria}
            restaurantes={restaurantes}
        />
        <p className="text-[22px] leading-[1.6rem]">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
        </p>
    </div>
);

export default CategoriaHeader;