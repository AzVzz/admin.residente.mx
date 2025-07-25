const CategoriaHeader = ({
    categoriaH1ContainerRef,
    categoriaH1Ref,
    categoriaFontSize,
    renderCategoriaH1,
    categoria,
}) => (
    <div
        ref={categoriaH1ContainerRef}
        className="col-span-2 p-5 rounded-lg shadow-md min-w-0 overflow-hidden flex flex-col h-full"
    >
        <h1
            ref={categoriaH1Ref}
            className="font-bold mb-4 leading-30 tracking-tight w-full"
            style={{ fontSize: `${categoriaFontSize}px`, lineHeight: 1.1 }}
        >
            {renderCategoriaH1(categoria)}
        </h1>
        <p className="text-[21px] leading-[1.6rem] mt-auto">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
        </p>
    </div>
);

export default CategoriaHeader;