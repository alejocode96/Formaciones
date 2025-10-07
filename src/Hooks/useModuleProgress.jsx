// hooks/useModuleProgress.js
import { useMemo } from 'react';

/**
 * Hook para manejar toda la lógica relacionada con el progreso de módulos
 * @param {Object} course - Curso actual
 * @param {Object} userProgress - Progreso del usuario
 * @param {number} currentModuleId - ID del módulo actual
 */
export const useModuleProgress = (course, userProgress, currentModuleId) => {
    // Obtener todos los módulos aplanados
    const allModules = useMemo(() => {
        return course?.content?.modules || [];
    }, [course]);

    // Agrupar módulos por lecciones
    const groupedModules = useMemo(() => {
        if (!course?.content?.modules) return {};
        
        return course.content.modules.reduce((acc, item) => {
            if (!acc[item.lessons]) acc[item.lessons] = [];
            acc[item.lessons].push(item);
            return acc;
        }, {});
    }, [course]);

    // Verificar si un módulo está completado
    const isModuleCompleted = (moduleId) => {
        if (!userProgress?.completedModules) return false;
        return userProgress.completedModules.some(m => m.id === moduleId);
    };

    // Verificar si se puede navegar a un módulo
    const canNavigateToModule = (targetModuleId) => {
        // Si el módulo ya está completado, siempre se puede navegar
        if (isModuleCompleted(targetModuleId)) {
            return true;
        }

        // Encontrar índice del módulo objetivo
        const targetIndex = allModules.findIndex(m => m.id === targetModuleId);
        
        // El primer módulo siempre es accesible
        if (targetIndex === 0) return true;
        if (targetIndex === -1) return false;

        // Verificar que todos los módulos anteriores estén completados
        for (let i = 0; i < targetIndex; i++) {
            if (!isModuleCompleted(allModules[i].id)) {
                return false;
            }
        }
        return true;
    };

    // Obtener módulo actual
    const currentModule = useMemo(() => {
        return allModules.find(m => m.id === currentModuleId);
    }, [allModules, currentModuleId]);

    // Obtener índice del módulo actual
    const currentModuleIndex = useMemo(() => {
        return allModules.findIndex(m => m.id === currentModuleId);
    }, [allModules, currentModuleId]);

    // Obtener módulo siguiente
    const nextModule = useMemo(() => {
        return allModules.find(m => m.id === currentModuleId + 1);
    }, [allModules, currentModuleId]);

    // Obtener módulo anterior
    const previousModule = useMemo(() => {
        return allModules.find(m => m.id === currentModuleId - 1);
    }, [allModules, currentModuleId]);

    // Verificar si hay módulo siguiente
    const hasNextModule = useMemo(() => {
        return nextModule !== undefined;
    }, [nextModule]);

    // Verificar si hay módulo anterior
    const hasPreviousModule = useMemo(() => {
        return previousModule !== undefined && canNavigateToModule(previousModule.id);
    }, [previousModule, canNavigateToModule]);

    // Calcular progreso total
    const totalProgress = useMemo(() => {
        if (!userProgress?.completedModules || allModules.length === 0) {
            return 0;
        }
        return Math.round((userProgress.completedModules.length / allModules.length) * 100);
    }, [userProgress, allModules]);

    // Calcular índice del último módulo completado (para la línea de progreso visual)
    const lastCompletedIndex = useMemo(() => {
        let lastIndex = -1;
        allModules.forEach((module, index) => {
            if (isModuleCompleted(module.id)) {
                lastIndex = index;
            } else if (module.id === currentModuleId && lastIndex < index) {
                lastIndex = index;
            }
        });
        return lastIndex;
    }, [allModules, currentModuleId, isModuleCompleted]);

    // Calcular porcentaje de progreso visual
    const visualProgressPercentage = useMemo(() => {
        if (lastCompletedIndex === -1) return 0;
        return Math.min(((lastCompletedIndex + 1) / allModules.length) * 100, 100);
    }, [lastCompletedIndex, allModules]);

    return {
        // Datos
        allModules,
        groupedModules,
        currentModule,
        currentModuleIndex,
        nextModule,
        previousModule,
        
        // Estados
        hasNextModule,
        hasPreviousModule,
        
        // Funciones
        isModuleCompleted,
        canNavigateToModule,
        
        // Progreso
        totalProgress,
        visualProgressPercentage,
        completedCount: userProgress?.completedModules?.length || 0,
        totalCount: allModules.length
    };
};