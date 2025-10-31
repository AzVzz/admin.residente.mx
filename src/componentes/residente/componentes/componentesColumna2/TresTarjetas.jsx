import React, { useState, useEffect, useRef } from "react";
import { urlApi, imgApi } from "../../../api/url.js";
import BannerHorizontal from "../BannerHorizontal.jsx";

const TarjetaVerticalPost = ({ post, onClick }) => {
    return (
        <div
            className="group relative bg-transparent transition-all duration-300 overflow-hidden cursor-pointer"
            onClick={onClick}
        >
            <div className="flex flex-col">
                <div className="relative overflow-hidden">
                    <div className="relative">
                        <img
                            src={post.imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                            alt={post.titulo || "Nota"}
                            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                </div>

                <div className="flex flex-col py-2 justify-center items-center">
                    <div className="flex w-fit justify-center items-center py-1.5 pb-2 text-gray-900 text-[10px] font-semibold font-roman uppercase">
                        {post.fecha}
                    </div>
                    <h3 className="text-[18px] text-gray-900 leading-[1.1] mb-2 group-hover:text-gray-700 transition-colors duration-200 text-center">
                        {post.titulo}
                    </h3>
                </div>
            </div>
        </div>
    );
};

const TresTarjetas = ({ posts = [], onCardClick, mostrarBanner = false, revistaActual }) => {
    const [itemWidth, setItemWidth] = useState(0);
    const [perView, setPerView] = useState(3); // 3 columnas por fila, 6 en total
    const viewportRef = useRef(null);
    const GAP_PX = 32; // gap-x-8 ≈ 32px

    // Responsivo - ajustar número de columnas
    useEffect(() => {
        const onResize = () => {
            const w = window.innerWidth;
            if (w < 640) setPerView(1); // 1 columna en móvil
            else if (w < 768) setPerView(2); // 2 columnas en tablet pequeña
            else if (w < 1024) setPerView(3); // 3 columnas en tablet
            else setPerView(3); // 3 columnas en desktop
        };
        
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Calcular ancho de cada item
    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        
        const containerWidth = el.clientWidth;
        const totalGaps = GAP_PX * (perView - 1);
        const w = (containerWidth - totalGaps) / perView;
        setItemWidth(w);
    }, [perView, posts.length]);

    // Dividir posts en grupos de 6 (2 filas de 3)
    const groups = [];
    for (let i = 0; i < posts.length; i += 6) {
        groups.push(posts.slice(i, i + 6));
    }

    const scrollToGroup = (groupIndex) => {
        const el = viewportRef.current;
        if (!el) return;
        
        const scrollAmount = groupIndex * el.clientWidth;
        el.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    };

    const nextGroup = () => {
        const el = viewportRef.current;
        if (!el) return;
        
        const currentScroll = el.scrollLeft;
        const groupWidth = el.clientWidth;
        const nextScroll = currentScroll + groupWidth;
        
        el.scrollTo({ left: nextScroll, behavior: 'smooth' });
    };

    const prevGroup = () => {
        const el = viewportRef.current;
        if (!el) return;
        
        const currentScroll = el.scrollLeft;
        const groupWidth = el.clientWidth;
        const prevScroll = Math.max(0, currentScroll - groupWidth);
        
        el.scrollTo({ left: prevScroll, behavior: 'smooth' });
    };

    if (posts.length === 0) return null;

    return (
        <div className="w-full relative" style={{ overflow: "visible" }}>
            {/* Contenedor principal */}
            <div className="relative mx-auto w-full" style={{ overflow: "visible" }}>

                {/* Flecha izquierda */}
                {groups.length > 1 && (
                    <button 
                        onClick={prevGroup}
                        className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 left-[-4rem] bg-transparent hover:bg-transparent text-black rounded-full w-12 h-12 cursor-pointer z-20"
                        aria-label="Grupo anterior"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4.5} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                        </svg>
                    </button>
                )}

                {/* Viewport con scroll horizontal */}
                <div
                    ref={viewportRef}
                    className="overflow-x-auto w-full"
                    style={{
                        scrollSnapType: "x mandatory",
                        WebkitOverflowScrolling: "touch",
                        msOverflowStyle: "none",
                        scrollbarWidth: "none",
                    }}
                >
                    {/* Ocultar scrollbar en Webkit */}
                    <style jsx>{`
                        .overflow-x-auto::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>

                    {/* Contenedor de grupos */}
                    <div className="flex" style={{ scrollSnapAlign: "start" }}>
                        {groups.map((group, groupIndex) => {
                            const firstRow = group.slice(0, 3);
                            const secondRow = group.slice(3, 6);
                            
                            return (
                                <div 
                                    key={groupIndex}
                                    className="flex-shrink-0 w-full"
                                    style={{ 
                                        width: '100%',
                                        scrollSnapAlign: "start",
                                        marginRight: '32px'
                                    }}
                                >
                                    {/* Primera fila (3 tarjetas) */}
                                    <div 
                                        className="grid mb-4"
                                        style={{ 
                                            gridTemplateColumns: `repeat(3, 1fr)`,
                                            gap: `${GAP_PX}px`
                                        }}
                                    >
                                        {firstRow.map((post) => (
                                            <div key={post.id}>
                                                <TarjetaVerticalPost
                                                    post={post}
                                                    onClick={() => onCardClick(post)}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Segunda fila (3 tarjetas) */}
                                    <div 
                                        className="grid mt-4 mb-2"
                                        style={{ 
                                            gridTemplateColumns: `repeat(3, 1fr)`,
                                            gap: `${GAP_PX}px`
                                        }}
                                    >
                                        {secondRow.map((post) => (
                                            <div key={post.id}>
                                                <TarjetaVerticalPost
                                                    post={post}
                                                    onClick={() => onCardClick(post)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Flecha derecha */}
                {groups.length > 1 && (
                    <button 
                        onClick={nextGroup}
                        className="hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-[-4rem] bg-transparent hover:bg-transparent text-black rounded-full w-12 h-12 cursor-pointer z-20"
                        aria-label="Siguiente grupo"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4.5} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                        </svg>
                    </button>
                )}

                {/* Indicadores de grupo 
                {groups.length > 1 && (
                    <div className="flex justify-center mt-4 space-x-2 my-3">
                        {groups.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToGroup(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                    viewportRef.current && 
                                    Math.round(viewportRef.current.scrollLeft / viewportRef.current.clientWidth) === index
                                        ? 'bg-gray-800' 
                                        : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                                aria-label={`Ir al grupo ${index + 1}`}
                            />
                        ))}
                    </div>
                )}*/}
            </div>
            
            <BannerHorizontal size="small"/>
        </div>
    );
};

export default TresTarjetas;