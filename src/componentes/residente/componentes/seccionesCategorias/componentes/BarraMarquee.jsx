const BarraMarquee = ({ categoria, repeticiones = 7 }) => (
    <div className="mb-5 bg-transparent text-black px-3 py-2 overflow-hidden relative rounded-xl">
        <div className="flex animate-marquee">
            {Array.from({ length: repeticiones }).map((_, idx) => (
                <span
                    key={idx}
                    className={`whitespace-nowrap${idx > 0 ? "ml-[100px]" : ""}`}
                >
                    Noticias y más recomendaciones de {categoria}
                </span>
            ))}
        </div>
    </div>
);

export default BarraMarquee;