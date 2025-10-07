import React, { useEffect, useState, useContext } from 'react';
import { TrainingLogiTransContext } from '../../Context';


// Hooks personalizados
import { useModuleProgress } from '../../Hooks/useModuleProgress';
import { useModuleNavigation } from '../../Hooks/useModuleNavigation';

import NavbarCurso from '../../Components/Home/navBarCurso';
import MobileBottomBar from '../../Components/Modules/MobileBottomBar';
import MobileModal, { ResumenContent, ContenidoContent } from '../../Components/Modules/MobileModal';
import VideoModule from '../../Components/Modules/videoModule';
import QuestionModule from '../../Components/Modules/questionModule';
/**
 * ModulePage - Componente principal simplificado
 * Ya no maneja lógica compleja, solo orquesta los componentes
 */

function ModulePage() {
    const {
        getCourseById,
        getUserProgressForCourse
    } = useContext(TrainingLogiTransContext);

    // Hook de navegación - maneja toda la lógica de navegación
    const navigation = useModuleNavigation();
    const { courseId, currentModuleId, contentFinished, goToNextModule, navigateToModule, completeCurrentModule } = navigation;

    // Obtener curso y progreso
    const currentCourse = getCourseById(courseId);
    const userProgress = getUserProgressForCourse(courseId);

    // Hook de progreso - maneja toda la lógica de progreso
    const moduleProgress = useModuleProgress(currentCourse, userProgress, currentModuleId);
    const { currentModule, nextModule, isModuleCompleted } = moduleProgress;

    // Estados para el modal móvil
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState('');

    // Detectar si el módulo actual ya está completado
    useEffect(() => {
        if (isModuleCompleted(currentModuleId)) {
            navigation.markContentFinished();
        } else {
            navigation.resetContentFinished();
        }
    }, [currentModuleId, isModuleCompleted]);


    // 🔹 Cerrar modal automáticamente cuando el ancho de pantalla es de escritorio
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) { // >= 1024px → pantallas grandes
                setShowModal(false);
            }
        };

        // Ejecutar una vez al montar
        handleResize();

        // Escuchar redimensionamientos
        window.addEventListener("resize", handleResize);

        // Limpieza del listener
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Handlers para el modal móvil
    const handleShowModal = (type) => {
        setModalContent(type);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    // Handler para navegación entre módulos
    const handleModuleClick = (moduleId) => {
        navigateToModule(moduleId);
        handleCloseModal();
    };

    // Handler para siguiente módulo
    const handleNextModule = () => {
        if (nextModule) {
            goToNextModule(nextModule.id);
        }
    };

    // Handler cuando el contenido termina
    const handleContentFinished = () => {
        navigation.markContentFinished();
        completeCurrentModule(1);
    };

    // Handler para respuestas correctas en quiz
    const handleCorrectAnswer = (attempts) => {
        completeCurrentModule(attempts);
    };

    if (!currentCourse || !currentModule) {
        return <div className="h-screen w-full bg-[#09090b] text-white flex items-center justify-center">
            Cargando...
        </div>;
    }
    return (
        <div className="h-screen w-full bg-[#09090b] text-white flex flex-col">
            {/* Navbar con sidebar integrado - altura fija */}
            <div className="flex-shrink-0">
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

            {/* Contenido principal - ocupará el espacio restante con scroll */}
            <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-8 pb-4">
                {/* Renderizar módulo según tipo */}
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
            </main>

            {/* Barra inferior móvil - siempre fija en la parte inferior */}
            <MobileBottomBar
                contentFinished={contentFinished}
                hasNextModule={!!nextModule}
                onShowResumen={() => handleShowModal('resumen')}
                onShowContent={() => handleShowModal('contenido')}
                onNextModule={handleNextModule}
            />


            {/* Modal móvil - renderizar contenido según tipo */}
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
    )
}

export default ModulePage;