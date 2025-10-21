// Components/Module/MobileModal.jsx
import React from 'react';
import { X, PlayCircle, CheckCircle, Clock, Zap } from 'lucide-react';

/**
 * MobileModal - Modal deslizante para móviles
 * Componente reutilizable que puede mostrar diferentes contenidos
 */
function MobileModal({ isOpen, onClose, type, children }) {
    if (!isOpen) return null;

    return (
        <div className="lg:hidden fixed inset-0 z-50">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal content */}
            <div className={`absolute bottom-0 left-0 right-0 bg-zinc-900 rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`} style={{ height: '70vh' }}  >
                {/* Header del modal */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-700">
                    <div className="w-12 h-1 bg-zinc-600 rounded-full mx-auto" />
                    <button onClick={onClose} className="absolute right-4 p-2 hover:bg-zinc-800 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Contenido scrolleable del modal */}
                <div className="overflow-y-auto h-full pb-2">
                    {children}
                </div>
            </div>
        </div>
    );
}

/**
 * ResumenContent - Contenido del modal de resumen
 */
export function ResumenContent({ resumen }) {
    return (
        <div className="p-6">
            <h3 className='font-semibold text-zinc-100 mb-2'>Resumen del Módulo</h3>
            <div className='text-zinc-300 text-sm leading-relaxed whitespace-pre-line'>
                {resumen.map((text, index) => {
                    // 1️⃣ Reemplazar **texto** por <strong> con una clase blanca diferenciada
                    const boldText = text.replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="text-white font-semibold tracking-wide">$1</strong>'
                    );

                    // 2️⃣ Si el texto termina con punto, agregar un <br /> al final
                    const formattedText = boldText.endsWith('.')
                        ? `${boldText}<br /> <br />`
                        : boldText;

                    return (
                        <p
                            key={index}
                            className="text-gray-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: formattedText }}
                        />
                    );
                })}

            </div>
        </div>
    );
}

/**
 * ContenidoContent - Contenido del modal de contenido del curso
 */
export function ContenidoContent({
    course,
    currentModuleId,
    userProgress,
    groupedModules,
    allModules,
    isModuleCompleted,
    canNavigateToModule,
    onModuleClick,
    visualProgressPercentage
}) {
    return (
        <div className="flex flex-col h-full">
            {/* Header del contenido */}
            <div className='p-6 pt-4 border-b border-zinc-700/50'>
                <h3 className="font-semibold text-zinc-200 text-sm">
                    {course.title}
                </h3>

                <p className="text-zinc-400 text-xs mt-1">
                    {allModules.length} módulos
                </p>

                {userProgress && (
                    <div className="mt-2">
                        <div className="flex justify-between text-xs text-zinc-400 mb-1">
                            <span>Progreso</span>
                            <span>{userProgress.cumplimiento}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-1.5">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${userProgress.cumplimiento}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
                <div className="relative">
                    {/* Línea vertical continua */}
                    <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-zinc-600">
                        <div
                            className="w-full bg-blue-500 transition-all duration-500"
                            style={{ height: `${visualProgressPercentage}%` }}
                        />
                    </div>

                    {/* Círculo inicial */}
                    <div className="absolute left-0 top-0 w-2.5 h-2.5 bg-blue-500 rounded-full z-10" />

                    {Object.entries(groupedModules).map(([groupTitle, lessons]) => (
                        <div key={groupTitle} className="mb-6">
                            <h3 className="text-sm text-zinc-400 mb-4 ml-8">{groupTitle}</h3>

                            {lessons.map((lesson) => {
                                const isCompleted = isModuleCompleted(lesson.id);
                                const isCurrentLesson = lesson.id === currentModuleId;
                                const isQuiz = lesson.type === "Pregunta";
                                const canNavigate = canNavigateToModule(lesson.id);

                                return (
                                    <div key={lesson.id} className="relative mb-4">
                                        <div className="flex">
                                            {/* Espacio para la línea */}
                                            <div className="w-8 flex-shrink-0 flex justify-center">
                                                <div className="mr-6 relative z-10 mt-7">
                                                    <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold border-2 transition-all duration-300 ${isCurrentLesson
                                                        ? 'bg-blue-500 text-black border-blue-400 shadow-lg shadow-blue-500/30'
                                                        : isCompleted
                                                            ? 'bg-blue-500 text-black border-blue-400'
                                                            : 'bg-zinc-600 text-white border-zinc-500'
                                                        }`}>
                                                        {isQuiz ? <Zap className="w-3 h-3" /> : lesson.id}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contenido de la lección */}
                                            <div className="flex-1">
                                                <div
                                                    onClick={() => canNavigate && onModuleClick(lesson.id)}
                                                    className={`rounded-lg p-4 transition-all duration-300 ${canNavigate
                                                        ? 'cursor-pointer hover:bg-zinc-800/70'
                                                        : 'cursor-not-allowed opacity-50'
                                                        } ${isCurrentLesson ? 'bg-zinc-800/30' : ''}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {/* Icono de video/contenido */}
                                                        <div className="w-10 h-10 bg-zinc-700 rounded-md flex items-center justify-center text-sm flex-shrink-0 mt-1">
                                                            🎥
                                                        </div>

                                                        {/* Información del contenido */}
                                                        <div className="flex-1 min-w-0 pt-1">
                                                            <h4 className={`text-sm font-medium mb-1 line-clamp-2 ${isCurrentLesson ? 'text-blue-200' : 'text-zinc-200'
                                                                }`}>
                                                                {lesson.name}
                                                            </h4>

                                                            <div className="flex items-center gap-3 text-xs">
                                                                {lesson.duration && (
                                                                    <span className="text-zinc-400 flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {lesson.duration}
                                                                    </span>
                                                                )}

                                                                {isCompleted && (
                                                                    <span className="text-blue-400 flex items-center gap-1">
                                                                        <CheckCircle className="w-3 h-3" />
                                                                        Clase vista
                                                                    </span>
                                                                )}

                                                                {isCurrentLesson && !isCompleted && (
                                                                    <span className="text-blue-400 flex items-center gap-1">
                                                                        <PlayCircle className="w-3 h-3" />
                                                                        En progreso
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MobileModal;