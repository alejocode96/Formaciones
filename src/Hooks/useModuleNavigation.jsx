// hooks/useModuleNavigation.js
import { useState, useCallback, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TrainingLogiTransContext } from '../Context';

/**
 * Hook para manejar toda la navegación entre módulos
 */
export const useModuleNavigation = () => {
    const navigate = useNavigate();
    const { courseId, moduleId } = useParams();
    const { completeModule } = useContext(TrainingLogiTransContext);
    
    const [contentFinished, setContentFinished] = useState(false);
    
    const currentModuleId = Number(moduleId);

    // Navegar a un módulo específico
    const navigateToModule = useCallback((targetModuleId) => {
        navigate(`/training/${courseId}/module/${targetModuleId}`);
        setContentFinished(false);
    }, [courseId, navigate]);

    // Navegar al siguiente módulo
    const goToNextModule = useCallback((nextModuleId) => {
        if (!contentFinished) return false;
        
        if (nextModuleId) {
            navigateToModule(nextModuleId);
            return true;
        }
        return false;
    }, [contentFinished, navigateToModule]);

    // Navegar al módulo anterior
    const goToPreviousModule = useCallback((previousModuleId) => {
        if (previousModuleId) {
            navigateToModule(previousModuleId);
            return true;
        }
        return false;
    }, [navigateToModule]);

    // Marcar contenido como finalizado
    const markContentFinished = useCallback(() => {
        setContentFinished(true);
    }, []);

    // Marcar contenido como no finalizado
    const resetContentFinished = useCallback(() => {
        setContentFinished(false);
    }, []);

    // Completar módulo actual
    const completeCurrentModule = useCallback((attempts = 1) => {
        completeModule(courseId, currentModuleId, attempts);
        markContentFinished();
    }, [courseId, currentModuleId, completeModule, markContentFinished]);

    return {
        // IDs
        courseId,
        currentModuleId,
        
        // Estados
        contentFinished,
        
        // Funciones de navegación
        navigateToModule,
        goToNextModule,
        goToPreviousModule,
        
        // Funciones de estado
        markContentFinished,
        resetContentFinished,
        completeCurrentModule
    };
};