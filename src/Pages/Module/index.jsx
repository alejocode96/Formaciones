import React, { useEffect, useState, useContext } from 'react';
import { TrainingLogiTransContext } from '../../Context';
import { useModuleProgress } from '../../Hooks/useModuleProgress';
import { useModuleNavigation } from '../../Hooks/useModuleNavigation';

import NavbarCurso from '../../Components/Home/navBarCurso';
import MobileBottomBar from '../../Components/Modules/MobileBottomBar';
import MobileModal, { ResumenContent, ContenidoContent } from '../../Components/Modules/MobileModal';
import VideoModule from '../../Components/Modules/videoModule';
import QuestionModule from '../../Components/Modules/questionModule';

function ModulePage() {
    const { getCourseById, getUserProgressForCourse } = useContext(TrainingLogiTransContext);

    // Hook de navegación
    const navigation = useModuleNavigation();
    const { courseId, currentModuleId, contentFinished, goToNextModule, navigateToModule, completeCurrentModule } = navigation;

    // Curso y progreso
    const currentCourse = getCourseById(courseId);
    const userProgress = getUserProgressForCourse(courseId);

    // Progreso del módulo
    const moduleProgress = useModuleProgress(currentCourse, userProgress, currentModuleId);
    const { currentModule, nextModule, isModuleCompleted } = moduleProgress;

    // Modal móvil
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState('');

    // Detectar módulo completado
    useEffect(() => {
        if (isModuleCompleted(currentModuleId)) {
            navigation.markContentFinished();
        } else {
            navigation.resetContentFinished();
        }
    }, [currentModuleId, isModuleCompleted]);

    // Cerrar modal automáticamente en desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) setShowModal(false);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleShowModal = (type) => {
        setModalContent(type);
        setShowModal(true);
    };
    const handleCloseModal = () => setShowModal(false);
    const handleModuleClick = (moduleId) => {
        navigateToModule(moduleId);
        handleCloseModal();
    };
    const handleNextModule = () => {
        if (nextModule) goToNextModule(nextModule.id);
    };
    const handleContentFinished = () => {
        navigation.markContentFinished();
        completeCurrentModule(1);
    };
    const handleCorrectAnswer = (attempts) => {
        completeCurrentModule(attempts);
    };

    if (!currentCourse || !currentModule) {
        return (
            <div className="h-screen w-full bg-[#09090b] text-white flex items-center justify-center">
                Cargando...
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col bg-[#09090b] text-white overflow-hidden">
            {/* Navbar fijo arriba - flex-none mantiene su tamaño */}
            <div className="flex-shrink-0  z-50">
                <NavbarCurso
                    course={currentCourse}
                    currentModule={currentModule}
                    nextModule={nextModule}
                    contentFinished={contentFinished}
                    onNextModule={handleNextModule}
                    moduleProgress={moduleProgress}
                    onModuleClick={handleModuleClick}
                />
            </div>

            {/* Main con scroll interno - flex-1 ocupa todo el espacio disponible */}
            {/* min-h-0 es CRÍTICO para que flexbox permita el scroll */}
            <main className="flex-1 min-h-0 overflow-y-auto">
                {/* Contenedor con centrado vertical y padding */}
                <div className="flex flex-col justify-center  px-4 md:px-8 py-6">
                    <div className="w-full">
                        {currentModule.type === 'Video' && (
                            <VideoModule
                                key={currentModuleId}
                                src={currentModule.path}
                                resumen={currentModule.resumen}
                                onContentIsEnded={handleContentFinished}
                            />
                        )}
                        {currentModule.type === 'Pregunta' && (
                            <QuestionModule
                                key={currentModuleId}
                                question={currentModule.name}
                                answer={currentModule.respuestas}
                                onContentIsEnded={navigation.markContentFinished}
                                onCorrectAnswer={handleCorrectAnswer}
                                isCompleted={isModuleCompleted(currentModuleId)}
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* MobileBottomBar fijo abajo - flex-none mantiene su tamaño */}
            <div className="flex-shrink-0 lg:hidden">
                <MobileBottomBar
                    contentFinished={contentFinished}
                    hasNextModule={!!nextModule}
                    onShowResumen={() => handleShowModal('resumen')}
                    onShowContent={() => handleShowModal('contenido')}
                    onNextModule={handleNextModule}
                />
            </div>

            {/* Modal móvil */}
            <MobileModal
                isOpen={showModal}
                onClose={handleCloseModal}
                type={modalContent}
            >
                {modalContent === 'resumen' && currentModule.resumen && (
                    <ResumenContent resumen={currentModule.resumen} />
                )}
                {modalContent === 'contenido' && (
                    <ContenidoContent
                        course={currentCourse}
                        currentModuleId={currentModuleId}
                        userProgress={userProgress}
                        groupedModules={moduleProgress.groupedModules}
                        allModules={moduleProgress.allModules}
                        isModuleCompleted={moduleProgress.isModuleCompleted}
                        canNavigateToModule={moduleProgress.canNavigateToModule}
                        onModuleClick={handleModuleClick}
                        visualProgressPercentage={moduleProgress.visualProgressPercentage}
                    />
                )}
            </MobileModal>
        </div>
    );
}

export default ModulePage;