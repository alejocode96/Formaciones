import React, { useState, useEffect } from 'react';

const TrainingLogiTransContext = React.createContext();

function TrainingLogiTransProvider({ children }) {

    // Configuración de cursos base (información estática que no cambia)
    const defaultTrainings = [
        {
            id: 1,
            title: "CAPACITACIÓN ANUAL SARLAFT 2025",
            subtitle: "Prevención y control en empresas de transporte",
            direcionamiento: "sarlaft",
            content: {
                description: [
                    "Este curso tiene como propósito fortalecer los conocimientos y la cultura de prevención de los colaboradores de la empresa de transporte frente al **Sistema de Autocontrol y Gestión del Riesgo de Lavado de Activos y Financiación del Terrorismo (SARLAFT).**",
                    "A lo largo de la formación, los participantes adquirirán **herramientas prácticas** para identificar, reportar y controlar operaciones sospechosas, contribuyendo a la **protección de la organización, sus empleados y la sociedad** frente a riesgos **legales, financieros y reputacionales.**"
                ],
                modules: [
                    { id: 1, lessons: "Fundamentos", name: "Introducción al SARLAFT", completed: false, type: "Video", path: "/introduccionSARLAFT.mp4", resumen: ["¿Por qué no debemos ignorarlo? ", "Por que somos una pieza clave para proteger la organización y el sistema financiero  no es solo cumplir la norma es  asumir compromiso con seguridad, transparencia y sostenibilidad"], duration: "00:23", },
                    {
                        id: 2, lessons: "Fundamentos", name: "¿Crees que una empresa de transporte puede ser usada para actividades ilegales?",
                        respuestas: [
                            { opcion: "Sí, pero únicamente si toda la empresa está dedicada a actividades criminales.", rsp: false },
                            { opcion: "No, porque la finalidad de una empresa de transporte es solo logística y no puede desviarse de ese fin.", rsp: false },
                            { opcion: "Sí, porque los vehículos pueden emplearse para movilizar mercancía ilícita de manera encubierta.", rsp: true },
                            { opcion: "No, ya que las regulaciones y controles hacen imposible que sean usadas con otros propósitos.", rsp: false }
                        ], completed: false, type: "Pregunta", duration: "01:00",
                    },
                    { id: 3, lessons: "Fundamentos", name: "¿Qué es SARLAFT?", completed: false, type: "Video", path: "/queesSARLAFT.mp4", resumen: ["¿Qué es SARLAFT?", "es un sistema para prevenir y gestionar el riesgo de lavado de activos y financiación del terrorismo. Funciona como un filtro de seguridad: analiza clientes, operaciones y recursos para asegurar que todo sea legal y transparente. Va más allá de solo revisar listas sospechosas; es un mecanismo de prevención que protege a la empresa, sus empleados y su reputación.",], duration: "00:48", },
                    { id: 4, lessons: "Fundamentos", name: "Etapas del SARLAFT", completed: false, type: "Video", duration: "01:26", },
                    { id: 5, lessons: "Fundamentos", name: "Factores de Riesgo en el Transporte de Carga", completed: false, type: "Video", duration: "01:26", },
                    { id: 6, lessons: "Fundamentos", name: "Señales de Alerta", completed: false, type: "Video", duration: "01:26", },
                    { id: 7, lessons: "Fundamentos", name: "Casos Reales en Colombia", completed: false, type: "Video", duration: "01:26", },
                    { id: 8, lessons: "Fundamentos", name: "El Rol de los Empleados", completed: false, type: "Video", duration: "01:26", },
                    { id: 9, lessons: "Fundamentos", name: "Consecuencias de No Aplicar SARLAFT", completed: false, type: "Video", duration: "01:26", },
                    { id: 10, lessons: "Fundamentos", name: "Canales internos de reporte", completed: false, type: "Video", duration: "01:26", },
                    { id: 11, lessons: "Evaluación", name: "Evaluacion Final", completed: false, type: "Pregunta", duration: "01:26", },

                ]
            }
        },
        {
            id: 2,
            title: "SEGURIDAD VIAL 2025",
            subtitle: "Conducción segura y responsable",
            direcionamiento: "seguridad-vial",
            content: {
                description: [
                    "Este curso está diseñado para fortalecer las competencias de nuestros conductores en materia de seguridad vial, promoviendo prácticas de **conducción responsable y defensiva.**",
                    "Los participantes aprenderán **técnicas avanzadas de manejo, normativa vial actualizada** y estrategias para la prevención de accidentes, contribuyendo a la **reducción de riesgos** en las operaciones de transporte."
                ],
                modules: [
                    { id: 1, name: "Normativa de Tránsito", completed: false },
                    { id: 2, name: "Conducción Defensiva", completed: false },
                    { id: 3, name: "Mantenimiento Preventivo", completed: false },
                    { id: 4, name: "Primeros Auxilios", completed: false },
                    { id: 5, name: "Evaluación Práctica", completed: false }
                ]
            }
        },
        {
            id: 3,
            title: "GESTIÓN AMBIENTAL 2025",
            subtitle: "Sostenibilidad en el transporte",
            direcionamiento: "gestion-ambiental",
            content: {
                description: [
                    "Este programa formativo busca sensibilizar y capacitar a nuestros colaboradores en **prácticas ambientales sostenibles** aplicadas al sector del transporte.",
                    "Los participantes desarrollarán competencias para **minimizar el impacto ambiental** de las operaciones, implementando estrategias de **eficiencia energética y gestión de residuos** en sus actividades diarias."
                ],
                modules: [
                    { id: 1, name: "Fundamentos de Gestión Ambiental", completed: false, duration: "01:26", },
                    { id: 2, name: "Eficiencia Energética en Transporte", completed: false, duration: "01:26", },
                    { id: 3, name: "Gestión de Residuos", completed: false, duration: "01:26", },
                    { id: 4, name: "Evaluación de Impacto", completed: false, duration: "01:26", }
                ]
            }
        }
        
    ];

    // Estado para el progreso de usuarios
    const [userProgress, setUserProgress] = useState({});

    //Ayuda a no perder avance de los cursos
    useEffect(() => {
        // Cargar solo el progreso de usuarios desde localStorage
        const storedProgress = localStorage.getItem("userProgress");
        if (storedProgress) {
            setUserProgress(JSON.parse(storedProgress));
        }
    }, []);

    // Función para obtener todos los cursos con su progreso actual
    const getTrainingsWithProgress = () => {
        return defaultTrainings.map(training => ({
            ...training,
            cumplimiento: userProgress[training.id]?.cumplimiento || 0
        }));
    };

    return (
        <TrainingLogiTransContext.Provider value={{
            getTrainingsWithProgress
        }}>
            {children}
        </TrainingLogiTransContext.Provider>
    )
}

export { TrainingLogiTransContext, TrainingLogiTransProvider };