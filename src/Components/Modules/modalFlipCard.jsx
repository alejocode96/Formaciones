    import React from "react";
    import { createPortal } from "react-dom";
    import { X } from 'lucide-react';

    const ModalFlipCard = ({ etapaActualData, children, onClose }) => {
        // ✅ Separamos el contenido principal y el footer si existen
        const contenido = React.Children.toArray(children);
        const cuerpo = contenido.slice(0, -1); // todo menos el último
        const footer = contenido[contenido.length - 1]; // último hijo

        return createPortal(
            <div onClick={onClose}  className='fixed inset-0 min-h-screen bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn'>
                <div onClick={(e) => e.stopPropagation()} className='bg-zinc-900 rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-zinc-700 shadow-2xl animate-scaleIn flex flex-col  mx-auto my-auto'>
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
                    <div className="flex-1 overflow-y-auto  ">
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
