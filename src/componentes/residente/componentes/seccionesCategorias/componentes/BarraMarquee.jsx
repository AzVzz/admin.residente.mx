
//Noticias y más recomendaciones de {categoria}
const BarraMarquee = ({ categoria, repeticiones = 7 }) => (
    <div className="max-w-[1080px] bg-black text-[#fff300] px-3 py-2 overflow-hidden relative w-full">
        <div className="flex flex-nowrap animate-marquee items-center">
            {Array.from({ length: repeticiones }).map((_, idx) => (
                <span
                    key={idx}
                    className={`whitespace-nowrap${idx > 0 ? " ml-[150px]" : ""}`}
                >
                    {categoria}
                </span>
            ))}
        </div>
    </div>
);

export default BarraMarquee;