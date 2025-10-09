import React, { useState, useEffect } from 'react';

const TrainingLogiTransContext = React.createContext();
import {  BookOpen, Lightbulb, Wrench } from 'lucide-react';
//conetneidos
import introSARLAFT from '../assets/introduccionSARLAFT.mp4';
import queesSARLAFT from '../assets/queesSARLAFT.mp4';

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
                    { id: 1, lessons: "Fundamentos", name: "Introducción al SARLAFT", completed: false, type: "Video", path: introSARLAFT, resumen: ["¿Por qué no debemos ignorarlo? ", "Por que somos una pieza clave para proteger la organización y el sistema financiero  no es solo cumplir la norma es  asumir compromiso con seguridad, transparencia y sostenibilidad"], duration: "00:23", },
                    {
                        id: 2, lessons: "Fundamentos", name: "¿Crees que una empresa de transporte puede ser usada para actividades ilegales?",
                        respuestas: [
                            { opcion: "Sí, pero únicamente si toda la empresa está dedicada a actividades criminales.", rsp: false },
                            { opcion: "No, porque la finalidad de una empresa de transporte es solo logística y no puede desviarse de ese fin.", rsp: false },
                            { opcion: "Sí, porque los vehículos pueden emplearse para movilizar mercancía ilícita de manera encubierta.", rsp: true },
                            { opcion: "No, ya que las regulaciones y controles hacen imposible que sean usadas con otros propósitos.", rsp: false }
                        ], completed: false, type: "Pregunta", duration: "01:00",
                    },
                    { id: 3, lessons: "Fundamentos", name: "¿Qué es SARLAFT?", completed: false, type: "Video", path: queesSARLAFT, resumen: ["¿Qué es SARLAFT?", "es un sistema para prevenir y gestionar el riesgo de lavado de activos y financiación del terrorismo. Funciona como un filtro de seguridad: analiza clientes, operaciones y recursos para asegurar que todo sea legal y transparente. Va más allá de solo revisar listas sospechosas; es un mecanismo de prevención que protege a la empresa, sus empleados y su reputación.",], duration: "00:48", },
                    {
                        id: 4, lessons: "Fundamentos", name: "Etapas del SARLAFT", completed: false, type: "FlipCard",
                        cards: [
                            {
                                id: 1, numero: "Etapa 1", titulo: "Identificación del Riesgo", icono: "🔍", color: "from-blue-500 to-blue-600", colorSolido: "bg-blue-500",
                                objetivo: "Reconocer y documentar las posibles fuentes de riesgo de lavado de activos, financiación del terrorismo y proliferación de armas de destrucción masiva en las operaciones del sector transporte.",
                                audioObjetivo: "Objetivo: Reconocer y documentar las posibles fuentes de riesgo de lavado de activos, financiación del terrorismo y proliferación de armas de destrucción masiva en las operaciones del sector transporte.",
                                secciones: [
                                    {
                                        id: 'quehace', titulo: '¿Qué se hace?',
                                        icono: <BookOpen size={20} />,
                                        contenido: [
                                            {
                                                subtitulo: 'Análisis de Actividades Vulnerables',
                                                texto: 'Identificación de procesos susceptibles a riesgos, como la recepción de pagos en efectivo, transporte de mercancías sin documentación adecuada, o relaciones con clientes de alto riesgo.'
                                            },
                                            {
                                                subtitulo: 'Clasificación de Factores de Riesgo',
                                                texto: 'Segmentación de riesgos según tipo de cliente (por ejemplo, empresas de transporte internacional), ubicación geográfica (zonas de alto riesgo), y tipo de operación (transporte de productos sensibles).'
                                            }
                                        ],
                                        audio: '¿Qué se hace? Análisis de Actividades Vulnerables: Identificación de procesos susceptibles a riesgos, como la recepción de pagos en efectivo, transporte de mercancías sin documentación adecuada, o relaciones con clientes de alto riesgo. Clasificación de Factores de Riesgo: Segmentación de riesgos según tipo de cliente, por ejemplo, empresas de transporte internacional, ubicación geográfica, zonas de alto riesgo, y tipo de operación, transporte de productos sensibles.'
                                    },
                                    {
                                        id: 'como', titulo: '¿Cómo se hace?', icono: <Wrench size={20} />,
                                        contenido: [
                                            {
                                                subtitulo: 'Metodología de Identificación',
                                                texto: 'Aplicación de cuestionarios de riesgo, entrevistas con personal clave, y revisión de documentos y registros operativos.'
                                            },
                                            {
                                                subtitulo: 'Herramientas Utilizadas',
                                                texto: 'Matrices de riesgo, listas de verificación, y software de gestión de riesgos.'
                                            }
                                        ],
                                        audio: '¿Cómo se hace? Metodología de Identificación: Aplicación de cuestionarios de riesgo, entrevistas con personal clave, y revisión de documentos y registros operativos. Herramientas Utilizadas: Matrices de riesgo, listas de verificación, y software de gestión de riesgos.'
                                    },
                                    {
                                        id: 'ejemplo', titulo: 'Ejemplo Práctico', icono: <Lightbulb size={20} />,
                                        contenido: [
                                            {
                                                texto: 'Una empresa de transporte terrestre que realiza envíos internacionales identifica que ciertos clientes en zonas de conflicto presentan un mayor riesgo de ser utilizados para actividades ilícitas. Se segmentan estos clientes como de alto riesgo y se implementan medidas de debida diligencia reforzada.'
                                            }
                                        ],
                                        audio: 'Ejemplo Práctico: Una empresa de transporte terrestre que realiza envíos internacionales identifica que ciertos clientes en zonas de conflicto presentan un mayor riesgo de ser utilizados para actividades ilícitas. Se segmentan estos clientes como de alto riesgo y se implementan medidas de debida diligencia reforzada.'
                                    }
                                ]
                            },
                            {
                                id: 2, numero: "Etapa 2", titulo: "Medición o Evaluación", icono: "📊", color: "from-green-500 to-green-600",   colorSolido: "bg-green-500",
                                objetivo: "Determinar la probabilidad de ocurrencia y el impacto potencial de los riesgos identificados en las operaciones del sector transporte.",
                                audioObjetivo: "Objetivo: Determinar la probabilidad de ocurrencia y el impacto potencial de los riesgos identificados en las operaciones del sector transporte.",
                                secciones: [
                                    {
                                        id: 'quehace', titulo: '¿Qué se hace?', icono: <BookOpen size={20} />,
                                        contenido: [
                                            {
                                                subtitulo: 'Evaluación de Riesgos',
                                                texto: 'Asignación de puntuaciones a cada factor de riesgo según su probabilidad e impacto. Cálculo del riesgo inherente y residual.'
                                            },
                                            {
                                                subtitulo: 'Revisión de Nuevas Operaciones',
                                                texto: 'Evaluación de riesgos al ingresar a nuevos mercados o al ofrecer nuevos servicios de transporte.'
                                            }
                                        ],
                                        audio: '¿Qué se hace? Evaluación de Riesgos: Asignación de puntuaciones a cada factor de riesgo según su probabilidad e impacto. Cálculo del riesgo inherente y residual. Revisión de Nuevas Operaciones: Evaluación de riesgos al ingresar a nuevos mercados o al ofrecer nuevos servicios de transporte.'
                                    },
                                    {
                                        id: 'como', titulo: '¿Cómo se hace?', icono: <Wrench size={20} />,
                                        contenido: [
                                            {
                                                subtitulo: 'Metodología de Evaluación',
                                                texto: 'Uso de escalas cualitativas y cuantitativas. Análisis de escenarios y simulaciones.'
                                            },
                                            {
                                                subtitulo: 'Herramientas Utilizadas',
                                                texto: 'Software de análisis de riesgos y modelos de puntuación de riesgos.'
                                            }
                                        ],
                                        audio: '¿Cómo se hace? Metodología de Evaluación: Uso de escalas cualitativas y cuantitativas. Análisis de escenarios y simulaciones. Herramientas Utilizadas: Software de análisis de riesgos y modelos de puntuación de riesgos.'
                                    },
                                    {
                                        id: 'ejemplo', titulo: 'Ejemplo Práctico', icono: <Lightbulb size={20} />,
                                        contenido: [
                                            {
                                                texto: 'Al evaluar una nueva ruta de transporte que atraviesa regiones con presencia de grupos armados ilegales, la empresa asigna un alto riesgo a esta operación y decide implementar medidas adicionales de seguridad y monitoreo.'
                                            }
                                        ],
                                        audio: 'Ejemplo Práctico: Al evaluar una nueva ruta de transporte que atraviesa regiones con presencia de grupos armados ilegales, la empresa asigna un alto riesgo a esta operación y decide implementar medidas adicionales de seguridad y monitoreo.'
                                    }
                                ]
                            },
                            {
                                id: 3,numero: "Etapa 3", titulo: "Control del Riesgo", icono: "🛡️", color: "from-orange-500 to-orange-600",   colorSolido: "bg-orange-500",
                                objetivo: "Implementar medidas razonables para mitigar los riesgos inherentes identificados en las operaciones del sector transporte.",
                                audioObjetivo: "Objetivo: Implementar medidas razonables para mitigar los riesgos inherentes identificados en las operaciones del sector transporte.",
                                secciones: [
                                    {
                                        id: 'quehace', titulo: '¿Qué se hace?', icono: <BookOpen size={20} />,
                                        contenido: [
                                            {
                                                subtitulo: 'Diseño de Controles',
                                                texto: 'Establecimiento de procedimientos para la validación de clientes y proveedores. Implementación de sistemas de monitoreo de transacciones.'
                                            },
                                            {
                                                subtitulo: 'Aplicación de Controles',
                                                texto: 'Capacitación del personal en la identificación de señales de alerta. Realización de auditorías internas periódicas.'
                                            }
                                        ],
                                        audio: '¿Qué se hace? Diseño de Controles: Establecimiento de procedimientos para la validación de clientes y proveedores. Implementación de sistemas de monitoreo de transacciones. Aplicación de Controles: Capacitación del personal en la identificación de señales de alerta. Realización de auditorías internas periódicas.'
                                    },
                                    {
                                        id: 'como', titulo: '¿Cómo se hace?', icono: <Wrench size={20} />,
                                        contenido: [
                                            {
                                                subtitulo: 'Metodología de Control',
                                                texto: 'Desarrollo de políticas internas de cumplimiento. Integración de controles en los sistemas operativos.'
                                            },
                                            {
                                                subtitulo: 'Herramientas Utilizadas',
                                                texto: 'Sistemas de gestión de cumplimiento y plataformas de monitoreo de transacciones.'
                                            }
                                        ],
                                        audio: '¿Cómo se hace? Metodología de Control: Desarrollo de políticas internas de cumplimiento. Integración de controles en los sistemas operativos. Herramientas Utilizadas: Sistemas de gestión de cumplimiento y plataformas de monitoreo de transacciones.'
                                    },
                                    {
                                        id: 'ejemplo', titulo: 'Ejemplo Práctico', icono: <Lightbulb size={20} />,
                                        contenido: [
                                            {
                                                texto: 'Una empresa de transporte aéreo implementa un sistema de verificación de antecedentes de clientes y proveedores, y establece procedimientos para la revisión de documentos de carga, con el fin de detectar posibles operaciones sospechosas.'
                                            }
                                        ],
                                        audio: 'Ejemplo Práctico: Una empresa de transporte aéreo implementa un sistema de verificación de antecedentes de clientes y proveedores, y establece procedimientos para la revisión de documentos de carga, con el fin de detectar posibles operaciones sospechosas.'
                                    }
                                ]
                            },
                            {
                                id: 4,  numero: "Etapa 4", titulo: "Monitoreo del Riesgo", icono: "👁️", color: "from-purple-500 to-purple-600",  colorSolido: "bg-purple-500",
                                objetivo: "Vigilar y evaluar la efectividad de las medidas de control implementadas, asegurando la detección temprana de operaciones inusuales o sospechosas.",
                                audioObjetivo: "Objetivo: Vigilar y evaluar la efectividad de las medidas de control implementadas, asegurando la detección temprana de operaciones inusuales o sospechosas.",
                                secciones: [
                                    {
                                        id: 'quehace', titulo: '¿Qué se hace?', icono: <BookOpen size={20} />,
                                        contenido: [
                                            {
                                                subtitulo: 'Seguimiento Continuo',
                                                texto: 'Revisión periódica de transacciones y operaciones. Análisis de alertas generadas por sistemas de monitoreo.'
                                            },
                                            {
                                                subtitulo: 'Evaluación de Eficacia',
                                                texto: 'Auditorías internas y externas. Retroalimentación y mejora continua del sistema.'
                                            }
                                        ],
                                        audio: '¿Qué se hace? Seguimiento Continuo: Revisión periódica de transacciones y operaciones. Análisis de alertas generadas por sistemas de monitoreo. Evaluación de Eficacia: Auditorías internas y externas. Retroalimentación y mejora continua del sistema.'
                                    },
                                    {
                                        id: 'como', titulo: '¿Cómo se hace?', icono: <Wrench size={20} />,
                                        contenido: [
                                            {
                                                subtitulo: 'Metodología de Monitoreo',
                                                texto: 'Establecimiento de indicadores clave de rendimiento (KPI). Implementación de auditorías programadas y no programadas.'
                                            },
                                            {
                                                subtitulo: 'Herramientas Utilizadas',
                                                texto: 'Software de monitoreo de cumplimiento y herramientas de análisis de datos.'
                                            }
                                        ],
                                        audio: '¿Cómo se hace? Metodología de Monitoreo: Establecimiento de indicadores clave de rendimiento, KPI. Implementación de auditorías programadas y no programadas. Herramientas Utilizadas: Software de monitoreo de cumplimiento y herramientas de análisis de datos.'
                                    },
                                    {
                                        id: 'ejemplo', titulo: 'Ejemplo Práctico', icono: <Lightbulb size={20} />,
                                        contenido: [
                                            {
                                                texto: 'Una empresa de transporte marítimo recibe una alerta por una transacción inusual relacionada con un cliente en una zona de alto riesgo. Se activa una investigación interna que confirma la existencia de una operación sospechosa, la cual es reportada a la Unidad de Información y Análisis Financiero (UIAF).'
                                            }
                                        ],
                                        audio: 'Ejemplo Práctico: Una empresa de transporte marítimo recibe una alerta por una transacción inusual relacionada con un cliente en una zona de alto riesgo. Se activa una investigación interna que confirma la existencia de una operación sospechosa, la cual es reportada a la Unidad de Información y Análisis Financiero, UIAF.'
                                    }
                                ]
                            }
                        ], duration: "01:26",
                    },
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

    //estado para sidebar
    const [showContentSidebar, setShowContentSidebar] = useState(false);
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

    // Función para obtener curso por ID
    const getCourseById = (courseId) => {
        return defaultTrainings.find(training => training.id === parseInt(courseId));
    };

    // Función para verificar si un usuario ya tiene progreso en un curso
    const hasUserProgress = (courseId) => {
        return userProgress[courseId] && userProgress[courseId].nombre && userProgress[courseId].cedula;
    };

    // Función para obtener progreso de usuario para un curso específico
    const getUserProgressForCourse = (courseId) => {
        return userProgress[courseId] || null;
    };

    // Función para crear nuevo progreso de curso
    const createCourseProgress = (courseId, userData) => {
        const course = getCourseById(courseId);
        if (!course) return false;

        const newCourseProgress = {
            id: courseId,
            title: course.title,
            nombre: userData.nombre,
            cedula: userData.cedula,
            cumplimiento: 0,
            startedAt: new Date().toISOString(),
            lastAccessAt: new Date().toISOString(),
            currentModule: 1,
            completedModules: []
        };

        const newProgress = {
            ...userProgress,
            [courseId]: newCourseProgress
        };

        setUserProgress(newProgress);
        localStorage.setItem("userProgress", JSON.stringify(newProgress));
        return true;
    };


    // Función para resetear progreso de curso (cuando el usuario decide cambiar datos)
    const resetCourseProgress = (courseId, userData) => {
        return createCourseProgress(courseId, userData);
    };

    //funcion para completar modulo
    const completeModule = (courseId, moduleId, attempts = 1) => {
        const courseIdNum = parseInt(courseId);
        const moduleIdNum = parseInt(moduleId);

        const currentProgress = userProgress[courseIdNum];
        if (!currentProgress) return false;

        const course = getCourseById(courseIdNum);
        if (!course) return false;

        // Verificar si el módulo ya está completado
        const existingModule = currentProgress.completedModules.find(m => m.id === moduleIdNum);

        let updatedCompletedModules;
        if (existingModule) {
            // Si ya existe, NO actualizar (ya está completado)
            updatedCompletedModules = currentProgress.completedModules;
        } else {
            // Si no existe, agregarlo
            updatedCompletedModules = [
                ...currentProgress.completedModules,
                { id: moduleIdNum, attempts }
            ];
        }

        // Calcular el siguiente módulo
        const allModules = course.content.modules;
        const currentIndex = allModules.findIndex(m => m.id === moduleIdNum);
        const nextModule = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1].id : moduleIdNum;

        // Calcular el porcentaje de cumplimiento
        const totalModules = allModules.length;
        const completedCount = updatedCompletedModules.length;
        const cumplimiento = Math.round((completedCount / totalModules) * 100);

        // Actualizar el progreso
        const updatedProgress = {
            ...currentProgress,
            currentModule: nextModule,
            completedModules: updatedCompletedModules,
            cumplimiento,
            lastAccessAt: new Date().toISOString()
        };

        const newProgress = {
            ...userProgress,
            [courseIdNum]: updatedProgress
        };

        setUserProgress(newProgress);
        localStorage.setItem("userProgress", JSON.stringify(newProgress));

        return true;
    };

    // 🔹 Cerrar sidebar automáticamente en pantallas medianas o pequeñas
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) { // < 1024px → pantallas "lg" o menores
                setShowContentSidebar(false);
            }
        };

        // Ejecutar una vez al montar (por si el usuario abre desde móvil)
        handleResize();

        // Escuchar cambios de tamaño
        window.addEventListener('resize', handleResize);

        // Limpieza del listener
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <TrainingLogiTransContext.Provider value={{
            getTrainingsWithProgress,
            getCourseById, hasUserProgress, getUserProgressForCourse, createCourseProgress, resetCourseProgress, completeModule,
            showContentSidebar, setShowContentSidebar
        }}>
            {children}
        </TrainingLogiTransContext.Provider>
    )
}

export { TrainingLogiTransContext, TrainingLogiTransProvider };