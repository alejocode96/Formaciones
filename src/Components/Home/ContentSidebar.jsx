import React from 'react';
import { X, PlayCircle, CheckCircle, Clock, Zap } from 'lucide-react';

/**
 * ContentSidebar - Componente puro que muestra el contenido del curso
 * Ya no depende de useParams, recibe todo por props
 */

function ContentSidebar({
    isOpen,
    onClose,
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
    if (!course) return null;

    return (
        <>
            {/* Overlay - solo en desktop */}
            {isOpen && (
                <div onClick={onClose} className='hidden lg:block fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300' />
            )}

            {/* Sidebar */}
            <div className={`hidden lg:flex flex-col fixed top-0 right-0 h-full w-[35%] bg-zinc-900/95 backdrop-blur-sm transform transition-transform duration-300 ease-out z-50 border-l border-zinc-700/50 shadow-2xl  ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className='p-6 pt-4 border-b border-zinc-700/50'>
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-zinc-200 text-sm">
                            {course.title}
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>
                    <p className="text-zinc-400 text-xs">
                        {allModules.length} módulos
                    </p>
                    {userProgress && (
                        <div className="mt-2">
                            <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                <span>Progreso</span>
                                <span>{userProgress.cumplimiento}%</span>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-full h-1.5">
                                <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${userProgress.cumplimiento}%` }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Content scrolleable */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
                    <div className="relative">
                        {/* Línea vertical de progreso */}
                        <div className="absolute left-1 top-0 w-0.5 bg-zinc-600" style={{ height: `${allModules.length * 110}px` }}>
                            <div className="w-full bg-blue-500 transition-all duration-500" style={{ height: `${visualProgressPercentage}%` }} />
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
                                                {/* Círculo numerado */}
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

                                                {/* Contenido del módulo */}
                                                <div className="flex-1">
                                                    <div
                                                        onClick={() => canNavigate && onModuleClick(lesson.id)}
                                                        className={`rounded-lg p-4 transition-all duration-300 ${canNavigate
                                                                ? 'cursor-pointer hover:bg-zinc-800/70'
                                                                : 'cursor-not-allowed opacity-50'
                                                            } ${isCurrentLesson ? 'bg-zinc-800/30' : ''}`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {/* Icono */}
                                                            <div className="w-10 h-10 bg-zinc-700 rounded-md flex items-center justify-center text-sm flex-shrink-0 mt-1">
                                                                🎥
                                                            </div>

                                                            {/* Info */}
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

                                                                    {isCompleted  && (
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

        </>
    )
}

export default ContentSidebar;