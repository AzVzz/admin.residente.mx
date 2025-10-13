import React, { useState, useEffect, useRef } from "react";
import { urlApi } from "../../api/url.js";

const TarjetaVerticalPost = ({ post, onClick }) => (
    <div
        className="group relative bg-transparent transition-all duration-300 overflow-hidden cursor-pointer"
        onClick={onClick}
    >
        <div className="flex flex-col">
            <div className="relative overflow-hidden">
                <img
                    src={post.imagen || `${urlApi}fotos/fotos-estaticas/residente-columna1/SinFoto.webp`}
                    alt={post.titulo || "Nota"}
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
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

const PlantillaTresTarjetas = ({ posts = [], onCardClick }) => {
    // Divide los posts en grupos de 6 (2 filas de 3)
    const groups = [];
    for (let i = 0; i < posts.length; i += 6) {
        groups.push(posts.slice(i, i + 6));
    }

    if (posts.length === 0) return null;

    return (
        <div className="w-full relative" style={{ overflow: "visible" }}>
            <div className="relative mx-auto w-full" style={{ overflow: "visible" }}>
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
                                {/* Primera fila */}
                                <div
                                    className="grid mb-4"
                                    style={{
                                        gridTemplateColumns: `repeat(3, 1fr)`,
                                        gap: `32px`
                                    }}
                                >
                                    {firstRow.map((post, idx) => (
                                        <div key={post.id || idx}>
                                            <TarjetaVerticalPost
                                                post={post}
                                                onClick={() => onCardClick(post)}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {/* Segunda fila */}
                                <div
                                    className="grid mt-4 mb-2"
                                    style={{
                                        gridTemplateColumns: `repeat(3, 1fr)`,
                                        gap: `32px`
                                    }}
                                >
                                    {secondRow.map((post, idx) => (
                                        <div key={post.id || idx}>
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
        </div>
    );
};

export default PlantillaTresTarjetas;