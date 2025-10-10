import React, { useState, useEffect } from 'react';

const TrainingLogiTransContext = React.createContext();
import { BookOpen, Lightbulb, Wrench } from 'lucide-react';
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
                    // { id: 1, lessons: "Fundamentos", name: "Introducción al SARLAFT", completed: false, type: "Video", path: introSARLAFT, resumen: ["¿Por qué no debemos ignorarlo? ", "Por que somos una pieza clave para proteger la organización y el sistema financiero  no es solo cumplir la norma es  asumir compromiso con seguridad, transparencia y sostenibilidad"], duration: "00:23", },
                    // {
                    //     id: 2, lessons: "Fundamentos", name: "¿Crees que una empresa de transporte puede ser usada para actividades ilegales?",
                    //     respuestas: [
                    //         { opcion: "Sí, pero únicamente si toda la empresa está dedicada a actividades criminales.", rsp: false },
                    //         { opcion: "No, porque la finalidad de una empresa de transporte es solo logística y no puede desviarse de ese fin.", rsp: false },
                    //         { opcion: "Sí, porque los vehículos pueden emplearse para movilizar mercancía ilícita de manera encubierta.", rsp: true },
                    //         { opcion: "No, ya que las regulaciones y controles hacen imposible que sean usadas con otros propósitos.", rsp: false }
                    //     ], completed: false, type: "Pregunta", duration: "01:00",
                    // },
                    // { id: 3, lessons: "Fundamentos", name: "¿Qué es SARLAFT?", completed: false, type: "Video", path: queesSARLAFT, resumen: ["¿Qué es SARLAFT?", "es un sistema para prevenir y gestionar el riesgo de lavado de activos y financiación del terrorismo. Funciona como un filtro de seguridad: analiza clientes, operaciones y recursos para asegurar que todo sea legal y transparente. Va más allá de solo revisar listas sospechosas; es un mecanismo de prevención que protege a la empresa, sus empleados y su reputación.",], duration: "00:48", },
                    {
                        id: 1, lessons: "Fundamentos", name: "Etapas del SARLAFT", completed: false, type: "FlipCard",
                        cards: [
                            {
                                id: 1, numero: "Etapa 1", titulo: "Identificación del Riesgo", icono: "🔍", color: "from-blue-500 to-blue-600", colorSolido: "bg-blue-500",
                                objetivo: "Reconocer y documentar aquellas situaciones o factores que puedan representar un peligro delavado de activos, financiación del terrorismo y proliferación de armas de destrucción masiva en las operaciones del sector transporte.",
                                audioObjetivo: "La identificación del riesgo consiste en reconocer y documentar aquellas situaciones o factores que puedan representar un peligro de lavado de activos, financiación del terrorismo o proliferación de armas de destrucción masiva dentro de las operaciones del sector transporte.",
                                secciones: [
                                    {
                                        id: 'quehace', titulo: '¿Qué se hace?',
                                        icono: <BookOpen size={20} />,
                                        contenido: [
                                            {
                                                subtitulo: 'Análisis de Actividades Vulnerables',
                                                texto: 'Se identifican aquellos procesos dentro de la empresa que pueden estar expuestos a riesgos, como la recepción de pagos en efectivo, transporte de mercancías sin documentación adecuada, o relaciones con clientes de alto riesgo.'
                                            },
                                            {
                                                subtitulo: 'Clasificación de Factores de Riesgo',
                                                texto: 'Segmentación de riesgos según tipo de cliente (por ejemplo, empresas de transporte internacional), ubicación geográfica (zonas de alto riesgo), y tipo de operación (transporte de productos sensibles).'
                                            }
                                        ],
                                        audio: '¿Qué se hace?, En esta etapa se realiza el análisis de actividades vulnerables, es decir, se identifican aquellos procesos dentro de la empresa que pueden estar expuestos a riesgos. Algunos ejemplos son la recepción de pagos en efectivo, el transporte de mercancías sin la documentación adecuada, o las relaciones con clientes considerados de alto riesgo. También se lleva a cabo la clasificación de los factores de riesgo, que consiste en segmentar o agrupar los riesgos según diferentes criterios, como el tipo de cliente —por ejemplo, empresas de transporte internacional—, la ubicación geográfica, las zonas de alto riesgo, o el tipo de operación, como el transporte de productos sensibles."'
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
                                        audio: '¿Cómo se hace?, Para identificar los riesgos, se aplica una metodología estructurada que incluye el uso de cuestionarios de riesgo, entrevistas con el personal clave y la revisión de documentos y registros operativos. Además, se emplean diversas herramientas de apoyo, como matrices de riesgo, listas de verificación y software especializado en gestión de riesgos, que facilitan el análisis y el seguimiento de la información recopilada.'
                                    },
                                    {
                                        id: 'ejemplo', titulo: 'Ejemplo Práctico', icono: <Lightbulb size={20} />,
                                        contenido: [
                                            {
                                                texto: 'Una empresa de transporte terrestre que realiza envíos nacionales identifica que ciertos clientes en zonas de conflicto presentan un mayor riesgo de ser utilizados para actividades ilícitas. Se segmentan estos clientes como de alto riesgo y se implementan medidas de debida diligencia reforzada.'
                                            }
                                        ],
                                        audio: 'Veamos un ejemplo práctico: Imaginemos una empresa de transporte terrestre que realiza envíos nacionales. Durante su análisis, identifica que algunos de sus clientes se encuentran en zonas de conflicto, lo que aumenta el riesgo de que sus operaciones puedan ser utilizadas para actividades ilícitas. Por esta razón, estos clientes se clasifican como de alto riesgo, y la empresa decide aplicar medidas de debida diligencia reforzada, asegurando un control más estricto sobre sus operaciones.'
                                    }
                                ]
                            },
                            {
                                id: 2, numero: "Etapa 2", titulo: "Medición o Evaluación", icono: "📊", color: "from-green-500 to-green-600", colorSolido: "bg-green-500",
                                objetivo: "Determinar la probabilidad de ocurrencia y el impacto potencial de los riesgos identificados, con el fin de establecer prioridades y enfocar los esfuerzos en aquellos que puedan generar mayores consecuencias en las operaciones del sector transporte.",
                                audioObjetivo: "Medición o evaluación   En esta etapa se determina qué tan probable es que ocurra cada riesgo y cuál sería su impacto en las operaciones del sector transporte. Este análisis permite establecer prioridades y enfocar los esfuerzos en los riesgos que puedan generar mayores consecuencias para la organización.",
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
                                        audio: '¿Qué se hace?, En esta etapa se realiza la evaluación de riesgos, asignando una puntuación a cada factor identificado, de acuerdo con su probabilidad de ocurrencia y su impacto en las operaciones. Con esta información, se calcula el riesgo inherente y el riesgo residual, lo que permite entender con mayor precisión el nivel real de exposición de la empresa. Además, se efectúa una revisión de las nuevas operaciones, evaluando los riesgos antes de ingresar a nuevos mercados o al ofrecer nuevos servicios de transporte, para garantizar que las decisiones se tomen con base en un análisis preventivo y responsable.'
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
                                        audio: '¿Cómo se hace?.  Para llevar a cabo la evaluación de riesgos, se aplica una metodología combinada, que utiliza tanto escalas cualitativas como cuantitativas para medir la probabilidad y el impacto de cada riesgo. También se realiza un análisis de escenarios y se desarrollan simulaciones, con el fin de anticipar posibles situaciones y evaluar cómo podrían afectar las operaciones del transporte. Para apoyar este proceso, se emplean herramientas tecnológicas, como software de análisis de riesgos y modelos de puntuación, que facilitan una evaluación más precisa y basada en datos.'
                                    },
                                    {
                                        id: 'ejemplo', titulo: 'Ejemplo Práctico', icono: <Lightbulb size={20} />,
                                        contenido: [
                                            {
                                                texto: 'Al evaluar una nueva ruta de transporte que atraviesa regiones con presencia de grupos armados ilegales, la empresa asigna un alto riesgo a esta operación y decide implementar medidas adicionales de seguridad y monitoreo.'
                                            }
                                        ],
                                        audio: 'Veamos un ejemplo práctico: Imaginemos que una empresa de transporte evalúa una nueva ruta que atraviesa regiones donde existe presencia de grupos armados ilegales. Durante el análisis, se determina que esta operación representa un alto nivel de riesgo para la seguridad del personal y de la carga. Por esta razón, la empresa decide implementar medidas adicionales de seguridad y monitoreo, con el fin de proteger sus operaciones y reducir la posibilidad de incidentes.'
                                    }
                                ]
                            },
                            {
                                id: 3, numero: "Etapa 3", titulo: "Control del Riesgo", icono: "🛡️", color: "from-orange-500 to-orange-600", colorSolido: "bg-orange-500",
                                objetivo: "Implementar medidas razonables y proporcionales que permitan mitigar los riesgos inherentes identificados en las operaciones del sector transporte, con el fin de reducir su probabilidad e impacto y garantizar el desarrollo seguro y controlado de las actividades empresariales.",
                                audioObjetivo: "Control del riesgo: En esta etapa se implementan medidas razonables y proporcionales para mitigar los riesgos inherentes que han sido identificados en las operaciones del sector transporte. Estas acciones buscan reducir la probabilidad de ocurrencia y minimizar el impacto de los riesgos, garantizando que las actividades de la empresa se desarrollen de manera segura, controlada y conforme a la normativa vigente.",
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
                                        audio: '¿Qué se hace?, En esta etapa se lleva a cabo el diseño de controles, que consiste en establecer procedimientos claros para la validación de clientes y proveedores, y en la implementación de sistemas de monitoreo que permitan detectar operaciones o transacciones inusuales. Además, se realiza la aplicación de los controles, lo que incluye la capacitación del personal para reconocer señales de alerta, y la ejecución de auditorías internas periódicas, con el fin de verificar la eficacia de los controles y fortalecer la gestión del riesgo en la organización.'
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
                                        audio: '¿Cómo se hace?, La metodología de control se basa en el desarrollo de políticas internas de cumplimiento, que orientan el comportamiento y las decisiones dentro de la organización. Además, se integran controles específicos en los sistemas operativos, para garantizar que cada proceso funcione de acuerdo con las normas establecidas. Para apoyar estas acciones, se utilizan sistemas de gestión de cumplimiento y plataformas de monitoreo de transacciones, que permiten detectar irregularidades y responder de manera oportuna ante posibles riesgos.'
                                    },
                                    {
                                        id: 'ejemplo', titulo: 'Ejemplo Práctico', icono: <Lightbulb size={20} />,
                                        contenido: [
                                            {
                                                texto: 'Una empresa de transporte terrestre implementa un sistema de verificación de antecedentes para sus clientes y proveedores, con el objetivo de asegurar la legitimidad de las relaciones comerciales. Además, establece procedimientos de revisión de documentos de carga y rutas de envío, con el fin de detectar operaciones sospechosas y prevenir el uso indebido de sus servicios en actividades ilícitas.'
                                            }
                                        ],
                                        audio: 'Veamos un ejemplo práctico: Imaginemos una empresa de transporte terrestre que busca fortalecer sus controles internos. Para ello, implementa un sistema de verificación de antecedentes de clientes y proveedores, con el propósito de garantizar que todas las relaciones comerciales sean legítimas. Además, la empresa establece procedimientos de revisión de documentos de carga y de rutas de envío, lo que permite identificar posibles operaciones sospechosas y prevenir que sus servicios sean utilizados para actividades ilícitas.'
                                    }
                                ]
                            },
                            {
                                id: 4, numero: "Etapa 4", titulo: "Monitoreo del Riesgo", icono: "👁️", color: "from-purple-500 to-purple-600", colorSolido: "bg-purple-500",
                                objetivo: "Monitorear y evaluar de manera continua la efectividad de las medidas de control implementadas, garantizando la detección temprana de operaciones inusuales o sospechosas y la adopción oportuna de acciones correctivas que fortalezcan la gestión del riesgo en el sector transporte.",
                                audioObjetivo: "Monitoreo del riesgo: En esta etapa se realiza una vigilancia constante de las medidas de control implementadas, con el fin de evaluar su efectividad y detectar a tiempo operaciones inusuales o sospechosas. Este seguimiento permite ajustar los controles cuando sea necesario, mejorar los procesos y fortalecer la gestión del riesgo dentro de las operaciones del transporte.",
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
                                        audio: '¿Qué se hace? En esta etapa se realiza un seguimiento continuo de las operaciones, mediante la revisión periódica de transacciones y el análisis de las alertas que generan los sistemas de monitoreo. Este proceso permite identificar de manera temprana cualquier irregularidad o posible señal de riesgo. Además, se lleva a cabo una evaluación de la eficacia de los controles, a través de auditorías internas y externas, y se promueve la retroalimentación y la mejora continua del sistema, asegurando que las medidas de prevención se mantengan actualizadas y efectivas.'
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
                                        audio: '¿Cómo se hace?, La metodología de monitoreo se basa en el establecimiento de indicadores clave de desempeño, o KPI, que permiten medir la efectividad de los controles implementados. Además, se realizan auditorías programadas y no programadas, con el fin de evaluar continuamente los procesos y detectar posibles irregularidades a tiempo. Para apoyar estas actividades, se utilizan software de monitoreo de cumplimiento y herramientas de análisis de datos, que facilitan la revisión y el seguimiento de la información de manera más precisa y eficiente.'
                                    },
                                    {
                                        id: 'ejemplo', titulo: 'Ejemplo Práctico', icono: <Lightbulb size={20} />,
                                        contenido: [
                                            {
                                                texto: 'Una empresa de transporte terrestre recibe una alerta por una transacción inusual relacionada con un cliente que opera en una zona de alto riesgo. Ante esta situación, se activa una investigación interna, que confirma la existencia de una operación sospechosa. Finalmente, la situación es reportada a la Unidad de Información y Análisis Financiero (UIAF), cumpliendo con las obligaciones legales y reforzando los controles internos de la empresa.'
                                            }
                                        ],
                                        audio: 'Veamos un ejemplo práctico: Imaginemos una empresa de transporte terrestre que detecta una transacción inusual vinculada a un cliente que opera en una zona de alto riesgo. En respuesta, se activa una investigación interna, que permite confirmar que se trata de una operación sospechosa. Posteriormente, la empresa reporta la situación a la Unidad de Información y Análisis Financiero, o UIAF, asegurando el cumplimiento de la normativa y reforzando sus controles internos.'
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
            completedModules: [],
            flipCardProgress: {}
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