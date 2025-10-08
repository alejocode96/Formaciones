// Components/Module/MobileBottomBar.jsx
import React from 'react';
import { TextInitial, ChevronLast, TableOfContents } from 'lucide-react';

/**
 * MobileBottomBar - Barra de navegación inferior para móviles
 * Componente puro que solo maneja UI y eventos
 */
function MobileBottomBar({
    contentFinished,
    hasNextModule,
    onShowResumen,
    onShowContent,
    onNextModule
}) {
    return (
        <div className="lg:hidden  bottom-0 left-0 w-full bg-zinc-900/80 backdrop-blur-sm rounded-t-xl py-3 flex items-center z-50">
            <button onClick={onShowResumen} className="flex flex-1 justify-center items-center gap-2 text-sm font-medium hover:text-blue-400 transition border-r border-gray-700">
                <TextInitial strokeWidth={1.5} size={20} />
                <span>Resumen</span>
            </button>

            <button onClick={onShowContent}
                className="flex flex-1 justify-center items-center gap-2 text-sm font-medium hover:text-blue-400 transition border-r border-gray-700">
                <TableOfContents strokeWidth={1.5} size={20} />
                <span>Contenido</span>
            </button>

            <button onClick={onNextModule} disabled={!contentFinished || !hasNextModule} className={`flex flex-1 justify-center items-center gap-2 text-sm font-medium transition  ${contentFinished && hasNextModule ? 'hover:text-blue-400' : 'opacity-50 cursor-not-allowed'}`}>
                <ChevronLast strokeWidth={1.5} size={20} />
                <span>Continuar</span>
            </button>
        </div>
    );
}

export default MobileBottomBar;