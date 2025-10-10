import React from "react";
import { createPortal } from "react-dom";
import { X } from 'lucide-react';

const ModalFlipCard = ({ etapaActualData, children, onClose }) => {
    const contenido = React.Children.toArray(children);
    const cuerpo = contenido.slice(0, -1);
    const footer = contenido[contenido.length - 1];

    return createPortal(
        <div 
            onClick={onClose}  
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 p-4 flex justify-center items-center animate-fadeIn"
        >
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="bg-zinc-900 rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-zinc-700 shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className={`bg-gradient-to-r ${etapaActualData.color} p-3 flex items-center justify-between`}>
                    <div className='flex items-center gap-4'>
                        <div className="text-2xl md:text-5xl">{etapaActualData.icono}</div>
                        <div>
                            <div className='text-xs md:text-md text-white opacity-90'>{etapaActualData.numero}</div>
                            <h2 className='text-md md:text-3xl font-bold text-white'>{etapaActualData.titulo}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors" >
                        <X size={28} />
                    </button>
                </div>

                {/* Contenido Scrollable */}
                <div className="flex-1 overflow-y-auto p-4">
                    {cuerpo}
                </div>

                {/* Footer fijo */}
                <div className="mt-auto">
                    {footer}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ModalFlipCard;
