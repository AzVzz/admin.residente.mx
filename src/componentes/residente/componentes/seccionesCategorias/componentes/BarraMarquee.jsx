
//Noticias y más recomendaciones de {categoria}
const BarraMarquee = ({ categoria, repeticiones = 7 }) => (
    <div className="bg-[#fff200] max-w-[1080px] text-black bg-trasnparent px-3 my-0 overflow-hidden relative w-full text-[18px]">
        <div className="flex flex-nowrap animate-marquee items-center">
            {Array.from({ length: repeticiones }).map((_, idx) => (
                <span
                    key={idx}
                    className={`whitespace-nowrap${idx > 0 ? " ml-[150px]" : ""}`}
                >
                    {categoria}
                </span>
            ))}
            {/* Duplicado para animación continua */}
            {Array.from({ length: repeticiones }).map((_, idx) => (
                <span key={`dup-${idx}`} className={`whitespace-nowrap${idx > 0 ? " ml-[150px]" : ""}`}>
                    {categoria}
                </span>
            ))}
        </div>
    </div>
);

export default BarraMarquee;