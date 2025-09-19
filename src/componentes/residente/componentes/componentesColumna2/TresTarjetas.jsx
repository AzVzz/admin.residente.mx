import React, { useState, useEffect, useRef } from "react";
import { urlApi } from "../../../api/url.js";
import BannerHorizontal from "../BannerHorizontal.jsx";

const TarjetaVerticalPost = ({ post, onClick }) => {
    return (
        <div
            className="group relative bg-transparent transition-all duration-300 overflow-hidden cursor-pointer max-w-sm"
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
    const [currentGroup, setCurrentGroup] = useState(0);
    const [groups, setGroups] = useState([]);
    const carouselRef = useRef(null);
    
    // Dividir los posts en grupos de 6
    useEffect(() => {
        const newGroups = [];
        for (let i = 0; i < posts.length; i += 6) {
            newGroups.push(posts.slice(i, i + 6));
        }
        setGroups(newGroups);
        setCurrentGroup(0);
    }, [posts]);

    const nextGroup = () => {
        setCurrentGroup(prev => (prev + 1) % groups.length);
    };

    const prevGroup = () => {
        setCurrentGroup(prev => (prev - 1 + groups.length) % groups.length);
    };

    if (groups.length === 0) return null;

    return (
        <div className="w-full relative" style={{ overflow: "visible" }}>
            {/* Contenedor principal centrado */}
            <div className="relative mx-auto w-full" style={{ overflow: "visible" }}>
                {/* Flecha izquierda - fuera del contenedor */}
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

                {/* Contenedor del carrusel con transición suave */}
                <div className="w-full overflow-hidden" ref={carouselRef}>
                    <div 
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentGroup * 100}%)` }}
                    >
                        {groups.map((group, index) => {
                            const firstThree = group.slice(0, 3);
                            const lastThree = group.slice(3, 6);
                            
                            return (
                                <div key={index} className="w-full flex-shrink-0">
                                    {/* Fila 1 (3 tarjetas) */}
                                    <div className="grid grid-cols-3 gap-x-8 gap-y-5 mb-4">
                                        {firstThree.map((post) => (
                                            <TarjetaVerticalPost
                                                key={post.id}
                                                post={post}
                                                onClick={() => onCardClick(post)}
                                            />
                                        ))}
                                    </div>

                                    {/* Fila 2 (3 tarjetas) */}
                                    <div className="grid grid-cols-3 gap-x-8 gap-y-5 mt-4 mb-2">
                                        {lastThree.map((post) => (
                                            <TarjetaVerticalPost
                                                key={post.id}
                                                post={post}
                                                onClick={() => onCardClick(post)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Flecha derecha - fuera del contenedor */}
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

                {/* Indicadores de grupo - con números 
                {groups.length > 1 && (
                    <div className="flex justify-center mt-4 space-x-2 my-3">
                        {groups.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentGroup(index)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    currentGroup === index 
                                        ? 'bg-gray-800 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                aria-label={`Ir al grupo ${index + 1}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                )}
                */}

            </div>
            
            <BannerHorizontal size="small"/>
        </div>
    );
};

export default TresTarjetas;