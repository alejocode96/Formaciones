import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TrainingLogiTransContext } from '../../Context';
import {ChevronRight} from 'lucide-react'

function FlipCard({ cards, isCompleted = false }) {

    const { } = React.useContext(TrainingLogiTransContext);

    console.log(cards)
    return (
        <div className='w-full  mx-auto pt-6 pb-14 lg:pb-0' data-aos="fade-up" data-aos-delay={300} data-aos-duration="600">
            <div className="text-start mb-12">
                <h1 className="text-xl md:text-3xl font-bold text-white">
                    Etapas del SARLAFT
                </h1>
                <p className="text-slate-300 text-xs md:text-xl">
                    Haz clic en cada tarjeta para explorar el contenido paso a paso
                </p>
                <div className="w-[30%] h-[2px] bg-zinc-500 mt-1 rounded"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {cards.map((etapa) => {
                    return (
                        <div key={etapa.id} className="perspective-1000 h-[200px]">
                            <div className={`relative w-full h-full cursor-pointer transition-transform duration-700 transform-style-3d`}>
                                <div
                                    className={`absolute w-full h-full bg-gradient-to-br ${etapa.color} rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center text-white backface-hidden`}
                                    style={{ backfaceVisibility: 'hidden' }}
                                >
                                    <div className="text-7xl mb-6">{etapa.icono}</div>
                                    <div className="text-sm font-medium opacity-90 mb-2">{etapa.numero}</div>
                                    <h3 className="text-3xl font-bold mb-2 text-center">{etapa.titulo}</h3>
                                    <p className="text-lg opacity-90 mb-6">{etapa.subtitulo}</p>
                                    <div className="mt-4 flex items-center gap-2 text-sm opacity-75 animate-bounce">
                                        <span>Click para explorar</span>
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>

        </div>
    );
}

export default FlipCard;