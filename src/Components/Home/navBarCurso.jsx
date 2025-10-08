
import React, { useContext } from 'react';
import { TrainingLogiTransContext } from '../../Context';
import { TableOfContents, ChevronLast } from 'lucide-react';
import ContentSidebar from '../Home/ContentSidebar';


//logo
import logo from '../../assets/logitranslogo.png'
/**
 * NavbarCurso - Ahora es responsable del sidebar y toda la navegación
 * Props simplificadas usando los hooks personalizados
 */

function NavbarCurso({
    course, currentModule, nextModule,
    contentFinished, onNextModule,
    // Props para el sidebar
    moduleProgress, onModuleClick
}) {
    const {
        showContentSidebar,
        setShowContentSidebar,
        getUserProgressForCourse
    } = useContext(TrainingLogiTransContext);

    const userProgress = getUserProgressForCourse(course?.id);

    const handleShowContent = () => {
        setShowContentSidebar(true);
    };

    const handleCloseSidebar = () => {
        setShowContentSidebar(false);
    };

    const handleNextModule = () => {
        if (contentFinished && nextModule && onNextModule) {
            onNextModule(nextModule.id);
        }
    };

    if (!course || !currentModule) return null;

    return (
        <>
            <header className="px-2 md:px-6 py-2 ">
                <div className="relative mx-2 my-2 px-4 py-2 backdrop-blur-sm rounded-xl shadow-2xl bg-white/5 ring-1 ring-zinc-700">
                    <div className='w-full flex items-center justify-between'>
                        {/* Logo y texto */}
                        <div className='flex items-center space-x-3'>
                            <div className='relative bg-gradient-to-br bg-white backdrop-blur-md h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center p-1.5 shadow-xl border border-white/20'>
                                <img src={logo} alt="Logo" className='w-full h-full object-contain' />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-sm md:text-xl lg:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent select-none'>
                                    {course.title}
                                </span>
                                <span className='text-xs text-slate-400 font-medium tracking-wider'>
                                    {currentModule.name}
                                </span>
                            </div>
                        </div>

                        {/* Botones - solo en desktop */}

                        <div className='hidden lg:flex items-center space-x-3'>
                            <button onClick={handleShowContent} className='p-2 px-4 bg-gradient-to-r from-zinc-800 to-zinc-800 rounded-lg flex items-center space-x-3 border border-zinc-700/50 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg hover:shadow-zinc-900/25 hover:bg-gradient-to-r hover:from-zinc-700 hover:to-zinc-600'>
                                <TableOfContents strokeWidth={1.5} size={18} className='text-white' />
                                <span className='text-white font-medium'>Ver Contenido</span>
                            </button>

                            <button onClick={handleNextModule} disabled={!contentFinished || !nextModule}
                                className={`p-2 px-6 rounded-lg flex items-center space-x-3 border transition-all duration-300 ease-out ${contentFinished && nextModule
                                    ? 'bg-gradient-to-r from-zinc-200 to-zinc-300 text-zinc-800 border-zinc-400/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-zinc-400/25 hover:bg-gradient-to-r hover:from-zinc-300 hover:to-zinc-100 hover:text-zinc-900 cursor-pointer'
                                    : 'bg-zinc-800 text-zinc-500 border-zinc-700/50 cursor-not-allowed opacity-50'
                                    }`}  >
                                <span className='font-medium'>Siguiente Clase</span>
                                <ChevronLast strokeWidth={1.5} size={18} />
                            </button>
                        </div>

                    </div>
                </div>
            </header>

            {/* ContentSidebar integrado - ahora es responsabilidad del Navbar */}
            {moduleProgress && (
                <ContentSidebar
                    isOpen={showContentSidebar}
                    onClose={handleCloseSidebar}
                    course={course}
                    currentModuleId={currentModule.id}
                    userProgress={userProgress}
                    groupedModules={moduleProgress.groupedModules}
                    allModules={moduleProgress.allModules}
                    isModuleCompleted={moduleProgress.isModuleCompleted}
                    canNavigateToModule={moduleProgress.canNavigateToModule}
                    onModuleClick={onModuleClick}
                    visualProgressPercentage={moduleProgress.visualProgressPercentage}
                />
            )}
        </>
    )
}
export default NavbarCurso;