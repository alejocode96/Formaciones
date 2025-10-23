import React, { useState, useEffect } from 'react';

const TrainingLogiTransContext = React.createContext();
import { BookOpen, Lightbulb, Wrench } from 'lucide-react';


//conetneidos
import introSARLAFT from '../assets/introduccionSARLAFT.mp4';
import queesSARLAFT from '../assets/queesSARLAFT.mp4';
import finalSARLAFT from '../assets/final.mp4';
import casosSARLAFT from '../assets/casos_colombia.mp4';

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
                    { id: 1, lessons: "Fundamentos", name: "Introducción al SARLAFT", completed: false, type: "Video", path: introSARLAFT, resumen: ["**¿Por qué no debemos ignorarlo?** ", "Por que somos una pieza clave para proteger la organización y el sistema financiero  no es solo cumplir la norma es  asumir compromiso con seguridad, transparencia y sostenibilidad."], duration: "00:23", },
                    {
                        id: 2, lessons: "Fundamentos", name: "¿Crees que una empresa de transporte puede ser usada para actividades ilegales?",
                        respuestas: [
                            { opcion: "Sí, pero únicamente si toda la empresa está dedicada a actividades criminales.", rsp: false },
                            { opcion: "No, porque la finalidad de una empresa de transporte es solo logística y no puede desviarse de ese fin.", rsp: false },
                            { opcion: "Sí, porque los vehículos pueden emplearse para movilizar mercancía ilícita de manera encubierta.", rsp: true },
                            { opcion: "No, ya que las regulaciones y controles hacen imposible que sean usadas con otros propósitos.", rsp: false }
                        ], completed: false, type: "Pregunta", duration: "01:00",
                    },
                    { id: 3, lessons: "Fundamentos", name: "¿Qué es SARLAFT?", completed: false, type: "Video", path: queesSARLAFT, resumen: ["**¿Qué es SARLAFT?**", "es un sistema para prevenir y gestionar el riesgo de lavado de activos y financiación del terrorismo. Funciona como un filtro de seguridad: analiza clientes, operaciones y recursos para asegurar que todo sea legal y transparente. Va más allá de solo revisar listas sospechosas; es un mecanismo de prevención que protege a la empresa, sus empleados y su reputación.",], duration: "00:48", },



                    {
                        id: 4, lessons: "Fundamentos", name: "Etapas del SARLAFT", completed: false, type: "FlipCard",
                        objetivo: "El SARLAFT funciona como un ciclo de protección que nunca se detiene. Sus etapas son:",
                        audioObjetivo: "Etapas del SARLAFT. El SARLAFT funciona como un ciclo de protección que nunca se detiene. Sus etapas son: identificación, medición, control y monitoreo. Haz clic sobre cada etapa para ver su información.",
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
                        resumen: [
                            "**Etapas del SARLAFT**",
                            "El Sistema de Administración del Riesgo de Lavado de Activos, Financiación del Terrorismo y Proliferación de Armas de Destrucción Masiva (SARLAFT) se fundamenta en un ciclo continuo de gestión compuesto por cuatro etapas interrelacionadas: Identificación, Medición, Control y Monitoreo del Riesgo. Este ciclo busca prevenir y mitigar los riesgos asociados a actividades ilícitas dentro del sector transporte, garantizando la integridad y legalidad de las operaciones.",
                            "** 🔹 1. Identificación del Riesgo**",
                            "Esta etapa tiene como propósito reconocer y documentar las situaciones o factores que puedan representar un riesgo de lavado de activos, financiación del terrorismo o proliferación de armas dentro de las operaciones del transporte.",
                            "Se analizan actividades vulnerables como la recepción de pagos en efectivo, el transporte de mercancías sin documentación adecuada o las relaciones con clientes de alto riesgo. A través de la clasificación de factores de riesgo, se segmentan las exposiciones según el tipo de cliente, la ubicación geográfica y el tipo de operación.",
                            "El proceso se apoya en herramientas como cuestionarios de riesgo, entrevistas, matrices de evaluación y software de gestión, permitiendo obtener una visión integral de los riesgos.",
                            "**Ejemplo:** Una empresa de transporte identifica que ciertos clientes ubicados en zonas de conflicto representan un mayor riesgo, por lo que aplica medidas de debida diligencia reforzada.",
                            "** 🔹 2. Medición o Evaluación del Riesgo**",
                            "En esta fase se determina la probabilidad de ocurrencia y el impacto potencial de los riesgos identificados, con el fin de establecer prioridades de atención.",
                            "Se asignan puntuaciones o calificaciones a cada factor de riesgo para calcular el riesgo inherente (antes de aplicar controles) y el riesgo residual (después de aplicar medidas de mitigación).",
                            "Se utilizan escalas cualitativas y cuantitativas, análisis de escenarios y simulaciones que facilitan una comprensión precisa del nivel de exposición.",
                            "Además, se evalúan los riesgos al ingresar en nuevos mercados o servicios, asegurando decisiones informadas y preventivas.",
                            "**Ejemplo:** Antes de habilitar una ruta que atraviesa zonas con presencia de grupos armados, una empresa determina que la operación es de alto riesgo y decide implementar controles adicionales de seguridad y monitoreo.",
                            "**🔹 3. Control del Riesgo**",
                            "El objetivo de esta etapa es implementar medidas proporcionales que mitiguen los riesgos identificados, reduciendo su probabilidad e impacto.",
                            "Se desarrollan políticas internas y procedimientos operativos, como la validación de clientes y proveedores, la capacitación del personal, y la realización de auditorías periódicas.",
                            "Los controles se integran en los sistemas operativos de la organización mediante plataformas de monitoreo y software de cumplimiento, garantizando la trazabilidad y eficacia del sistema.",
                            "**Ejemplo:** Una empresa implementa un sistema de verificación de antecedentes para clientes y proveedores, y establece revisiones documentales y de rutas con el fin de detectar operaciones sospechosas y prevenir su uso indebido.",
                            "** 🔹 4. Monitoreo del Riesgo**",
                            "Esta etapa cierra el ciclo del SARLAFT mediante la vigilancia continua de los controles implementados. El monitoreo permite evaluar la efectividad de las medidas adoptadas, detectar operaciones inusuales o sospechosas y aplicar acciones correctivas oportunas.",
                            "Se utilizan indicadores clave de desempeño (KPI), auditorías internas y externas, y herramientas tecnológicas que facilitan el análisis de alertas y el seguimiento en tiempo real.",
                            "**Ejemplo:** Si un sistema de monitoreo detecta una transacción inusual en una zona de alto riesgo, la empresa activa una investigación interna y reporta el caso a la UIAF, cumpliendo con las obligaciones legales y fortaleciendo su control interno.",
                            "** 🔹 Conclusión**",
                            "**El SARLAFT** es un proceso dinámico y preventivo, diseñado para proteger a las empresas del sector transporte frente a actividades ilícitas.",
                            "Su efectividad depende de la aplicación coordinada de las cuatro etapas —identificación, medición, control y monitoreo— y del compromiso de todos los actores involucrados.",
                            "La implementación adecuada de este sistema no solo asegura el cumplimiento normativo, sino que también fortalece la reputación, sostenibilidad y confianza institucional en las operaciones del sector.",

                        ]
                    },
                    {
                        id: 5, lessons: "Fundamentos", name: "Factores de Riesgo en el Transporte de Carga", completed: false, type: "dragDropOrder",
                        objetivo: 'Es fundamental comprender los cuatro factores de riesgo del SARLAFT y cómo pueden presentarse en las operaciones de transporte de carga.  Explora y aprende de qué manera los factores del SARLAFT se manifiestan en el contexto logístico, fortaleciendo tu capacidad para prevenir, detectar y mitigar riesgos operativos y financieros dentro de la cadena de transporte.',
                        audioObjetivo: 'Factores de Riesgo en el Transporte de Carga. Es fundamental comprender los cuatro factores de riesgo del SARLAFT y cómo pueden presentarse en las operaciones de transporte de carga. Para afianzar este conocimiento, arrastra los elementos en el orden correcto y descubre información detallada sobre cada uno. Explora y aprende de qué manera los factores del SARLAFT se manifiestan en el contexto logístico, fortaleciendo tu capacidad para prevenir, detectar y mitigar riesgos operativos y financieros dentro de la cadena de transporte.',
                        cards: [
                            {
                                id: "intro",
                                title: "Introducción",
                                icon: "📋",
                                order: 1,
                                content: `El Sistema de Administración del Riesgo de Lavado de Activos y Financiación del Terrorismo (SARLAFT) nos exige identificar, prevenir y controlar los posibles riesgos que puedan afectar nuestras operaciones.

                                         Aunque nuestro cliente principal es Cementos Argos, nuestras actividades logísticas también pueden ser utilizadas de manera indebida por terceros. Por eso debemos conocer los cuatro factores de riesgo del SARLAFT y cómo se manifiestan en el transporte de carga.`,
                                audioText: 'El Sistema de Administración del Riesgo de Lavado de Activos y Financiación del Terrorismo, conocido como SARLAFT, nos exige identificar, prevenir y controlar los posibles riesgos que puedan afectar nuestras operaciones. Aunque nuestro cliente principal es Cementos Argos, nuestras actividades logísticas también pueden ser utilizadas de manera indebida por terceros. Por eso debemos conocer los cuatro factores de riesgo del SARLAFT y cómo se manifiestan en el transporte de carga.'

                            },
                            {
                                id: "factor1",
                                title: "Cliente o Contraparte",
                                icon: "👥",
                                order: 2,
                                content: `🔹 Quiénes son:
                                         Nuestro cliente directo es Cementos Argos o Concretos Argos, pero en la operación también interactuamos con conductores, contratistas, aliados logísticos, proveedores y destinatarios de la carga.

                                        🔹 Riesgo:
                                        Que alguno de estos actores intente utilizar la operación de transporte para actividades ilícitas, como desvío de carga, manipulación de información o colaboración con redes criminales.

                                        🔹 Ejemplo:
                                        Un conductor que altera su ruta para entregar la carga en un sitio no autorizado o filtra información sobre el movimiento de producto a terceros.`,
                                audioText: 'Factor uno: Cliente o Contraparte. Quiénes son: Nuestro cliente directo es Cementos Argos o Concretos Argos, pero en la operación también interactuamos con conductores, contratistas, aliados logísticos, proveedores y destinatarios de la carga. Riesgo: Que alguno de estos actores intente utilizar la operación de transporte para actividades ilícitas, como desvío de carga, manipulación de información o colaboración con redes criminales. Ejemplo: Un conductor que altera su ruta para entregar la carga en un sitio no autorizado o filtra información sobre el movimiento de producto a terceros.'
                            },
                            {
                                id: "factor2",
                                title: "Producto o Servicio",
                                icon: "📦",
                                order: 3,
                                content: `🔹 Qué ofrecemos:
                                            Prestamos el servicio de transporte de cemento y de materias primas utilizadas en su producción.

                                          🔹 Riesgo:
                                            Que este servicio sea usado como fachada para encubrir mercancías ilegales o justificar movimientos financieros irregulares.

                                          🔹 Ejemplo:
                                            Un despacho de cemento que se aprovecha para transportar mercancía contaminada (por ejemplo, sustancias ilícitas ocultas entre los sacos o dentro del vehículo).`,
                                audioText: 'Factor dos: Producto o Servicio. Qué ofrecemos: Prestamos el servicio de transporte de cemento y de materias primas utilizadas en su producción. Riesgo: Que este servicio sea usado como fachada para encubrir mercancías ilegales o justificar movimientos financieros irregulares. Ejemplo: Un despacho de cemento que se aprovecha para transportar mercancía contaminada, por ejemplo, sustancias ilícitas ocultas entre los sacos o dentro del vehículo.'

                            }, {
                                id: "factor3",
                                title: "Canal de Distribución",
                                icon: "🚚",
                                order: 4,
                                content: `🔹 Qué implica:
                                            El canal es la movilización física de la carga por carretera, junto con toda la documentación que respalda la operación (remesas, manifiestos, facturas, guías de despacho, etc.).

                                          🔹 Riesgo:
                                            Que el canal de transporte sea utilizado para introducir actividades irregulares, ya sea mediante falsificación documental o alteración de la carga.

                                          🔹 Ejemplo:
                                            Un tercero intenta incluir mercancía no autorizada junto al cemento o presenta documentos de transporte adulterados para cubrir desvíos o entregas falsas.`,
                                audioText: 'Factor tres: Canal de Distribución. Qué implica: El canal es la movilización física de la carga por carretera, junto con toda la documentación que respalda la operación, como remesas, manifiestos, facturas, guías de despacho, etcétera. Riesgo: Que el canal de transporte sea utilizado para introducir actividades irregulares, ya sea mediante falsificación documental o alteración de la carga. Ejemplo: Un tercero intenta incluir mercancía no autorizada junto al cemento o presenta documentos de transporte adulterados para cubrir desvíos o entregas falsas.'

                            },
                            {
                                id: "factor4",
                                title: "Jurisdicción o Zona Geográfica",
                                icon: "🗺️",
                                order: 5,
                                content: `🔹 Qué abarca:
                                            Nuestras rutas atraviesan diversas regiones del país, algunas con presencia de economías informales, grupos ilegales o puntos de control limitados.

                                          🔹 Riesgo:
                                            Que ciertas zonas se conviertan en corredores de riesgo donde se facilite el contrabando, la contaminación de mercancía o el lavado de activos mediante operaciones simuladas.

                                          🔹 Ejemplo:
                                            Durante un trayecto, una persona intenta aprovechar una parada o zona de baja supervisión para introducir carga ilícita al vehículo.`,
                                audioText: 'Factor cuatro: Jurisdicción o Zona Geográfica. Qué abarca: Nuestras rutas atraviesan diversas regiones del país, algunas con presencia de economías informales, grupos ilegales o puntos de control limitados. Riesgo: Que ciertas zonas se conviertan en corredores de riesgo donde se facilite el contrabando, la contaminación de mercancía o el lavado de activos mediante operaciones simuladas. Ejemplo: Durante un trayecto, una persona intenta aprovechar una parada o zona de baja supervisión para introducir carga ilícita al vehículo.'

                            },
                            {
                                id: "conclusion",
                                title: "Conclusión",
                                icon: "✅",
                                order: 6,
                                content: `🔍 En resumen:

                                            Aunque trabajamos con un cliente formal y de alta reputación, el riesgo no desaparece.
                                            Como empresa transportadora, debemos estar alertas y comprometidos con el control de cada etapa de la operación:

                                            ✅ Conocer a los actores involucrados (clientes, conductores, aliados).
                                            ✅ Verificar el servicio que prestamos y el tipo de carga movilizada.
                                            ✅ Revisar la documentación asociada al transporte.
                                            ✅ Evaluar las rutas y zonas donde operamos.

                                            👉 La prevención del riesgo es tarea de todos.
                                            Cada colaborador tiene un papel clave en garantizar que nuestras operaciones sean transparentes, seguras y alineadas con las políticas SARLAFT.`,
                                audioText: 'Conclusión. En resumen: Aunque trabajamos con un cliente formal y de alta reputación, el riesgo no desaparece. Como empresa transportadora, debemos estar alertas y comprometidos con el control de cada etapa de la operación: Conocer a los actores involucrados, como clientes, conductores y aliados. Verificar el servicio que prestamos y el tipo de carga movilizada. Revisar la documentación asociada al transporte. Evaluar las rutas y zonas donde operamos. La prevención del riesgo es tarea de todos. Cada colaborador tiene un papel clave en garantizar que nuestras operaciones sean transparentes, seguras y alineadas con las políticas SARLAFT.'
                            }
                        ],
                        duration: "01:26",
                        resumen: [
                            "El Sistema de Administración del Riesgo de Lavado de Activos y Financiación del Terrorismo (SARLAFT) busca que las empresas identifiquen, prevengan y controlen los riesgos que puedan afectar sus operaciones frente al uso indebido de recursos o actividades ilegales.",
                            "Aunque Cementos Argos es un cliente formal y de gran reputación, nuestras operaciones logísticas pueden verse expuestas a amenazas si terceros intentan aprovecharlas con fines ilícitos.",
                            "Por eso, es clave conocer los cuatro factores de riesgo del SARLAFT y cómo se manifiestan específicamente en el transporte de carga.",
                            "**🔹 Cliente o Contraparte**",
                            "Nuestro cliente principal es Cementos Argos (o Concretos Argos), pero en la operación intervienen muchos otros actores: conductores, contratistas, aliados logísticos, proveedores y destinatarios de carga. El riesgo surge cuando alguno de ellos intenta utilizar la operación de transporte para actividades ilícitas, como alterar rutas, filtrar información o colaborar con redes criminales.",
                            "**Ejemplo:** un conductor modifica su ruta para entregar la carga en un sitio no autorizado o comparte datos sobre los movimientos del producto.",
                            "** 🔹 Producto o Servicio**",
                            "Prestamos el servicio de transporte de cemento y materias primas usadas en su producción. El riesgo está en que este servicio sea utilizado como fachada para transportar mercancía ilegal o justificar movimientos financieros sospechosos.",
                            "**Ejemplo:** un despacho de cemento contaminado con sustancias ilícitas ocultas entre los sacos o dentro del vehículo.",
                            "** 🔹 Canal de Distribución**",
                            "El canal de distribución es la movilización física de la carga y toda la documentación que respalda el proceso: remesas, manifiestos, facturas, guías de despacho, etc. Existe riesgo de que el canal sea usado para falsificar documentos o alterar la carga, generando desvíos o entregas falsas.",
                            "**Ejemplo:** un tercero intenta incluir mercancía no autorizada junto al cemento o presenta documentos adulterados para justificar un desvío.",
                            "** 🔹 Jurisdicción o Zona Geográfica**",
                            "Las rutas de transporte atraviesan diferentes regiones del país, algunas con presencia de economías informales o grupos ilegales. Esto genera riesgo de que ciertas zonas se conviertan en corredores vulnerables al contrabando, contaminación de mercancía o lavado de activos mediante operaciones simuladas.",
                            "**Ejemplo:** durante una parada en una zona de baja supervisión, alguien aprovecha para introducir carga ilícita al vehículo.",
                            "** 🔹 Conclusión — La prevención es tarea de todos**",
                            "Aunque trabajemos con un cliente confiable, el riesgo nunca desaparece completamente. Como empresa transportadora, debemos mantener una actitud preventiva y comprometida con el control en cada etapa de la operación:",
                            "🔸Conocer a los actores involucrados (clientes, conductores, aliados)",
                            "🔸Verificar el servicio prestado y la carga movilizada",
                            "🔸Revisar la documentación del transporte",
                            "🔸Evaluar las rutas y zonas de operación",
                            "La prevención del riesgo es responsabilidad de todos. Cada colaborador cumple un papel clave para garantizar operaciones transparentes, seguras y alineadas con las políticas del SARLAFT.",

                        ]
                    },
                    {
                        id: 6, lessons: "Fundamentos", name: "Señales de Alerta", completed: false, type: "FlipCardReverse",
                        objetivo: 'Las señales de alerta son comportamientos o situaciones que nos indican que algo podría no estar bien y que existe un posible riesgo de lavado de activos o financiación del terrorismo. Identificarlas a tiempo ayuda a proteger a la organización y cumplir con la normativa.',
                        audioObjetivo: 'Señales de Alerta, Las señales de alerta son comportamientos o situaciones que nos indican que algo podría no estar bien y que existe un posible riesgo de lavado de activos o financiación del terrorismo. Identificarlas a tiempo ayuda a proteger a la organización y cumplir con la normativa. ',
                        cards: [
                            {
                                id: 1,
                                title: "Pagos inusuales o muy altos en efectivo",
                                content: "Hoy la mayoría de pagos grandes se hacen por transferencia o tarjeta. Si un cliente insiste en pagar en efectivo cantidades muy altas, podría estar intentando ocultar el origen del dinero.",
                                example: "Ejemplo: Una empresa que normalmente paga sus facturas por transferencia, de repente quiere cancelar un contrato de 50 millones en efectivo.",
                                icon: '💵',
                                color: "from-blue-500 to-blue-600",
                                colorSolido: "bg-blue-500",
                                colorBorde: "border-blue-500"
                            },
                            {
                                id: 2,
                                title: "Cambios frecuentes en remitentes o destinatarios",
                                content: "Si los pagos o cobros cambian constantemente de nombre, puede que se esté tratando de ocultar quién está realmente detrás de la operación.",
                                example: "Ejemplo: Un proveedor diferente cada mes para el mismo servicio, sin razón clara.",
                                icon: '🔄',
                                color: "from-green-500 to-green-600",
                                colorSolido: "bg-green-500",
                                colorBorde: "border-green-500"
                            },
                            {
                                id: 3,
                                title: "Documentos incompletos o falsos",
                                content: "Información faltante o documentos alterados son señales claras de intento de engaño.",
                                example: "Ejemplo: Facturas sin número de identificación o con fechas que no coinciden con la operación.",
                                icon: '📋',
                                color: "from-orange-500 to-orange-600",
                                colorSolido: "bg-orange-500",
                                colorBorde: "border-orange-500"
                            },
                            {
                                id: 4,
                                title: "Clientes que no quieren dar información",
                                content: "La falta de transparencia es un signo de riesgo, ya que impide evaluar correctamente al cliente.",
                                example: "Ejemplo: Un cliente se niega a entregar estados financieros o datos de contacto completos.",
                                icon: '🚫',
                                color: "from-purple-500 to-purple-600",
                                colorSolido: "bg-purple-500",
                                colorBorde: "border-purple-500"
                            },
                            {
                                id: 5,
                                title: "Operaciones que no coinciden con el perfil del cliente",
                                content: "Movimientos que difieren del comportamiento habitual pueden indicar actividad sospechosa.",
                                example: "Ejemplo: Un cliente que normalmente hace transferencias pequeñas, de repente realiza pagos millonarios en sectores distintos a su negocio.",
                                icon: '📊',
                                color: "from-pink-400 to-rose-600",
                                colorSolido: "bg-rose-600",
                                colorBorde: "border-rose-600"
                            }
                        ],
                        resumen: [
                            "**Señales de Alerta**",
                            "Las señales de alerta son indicadores tempranos que permiten identificar comportamientos, transacciones o situaciones atípicas que podrían estar relacionadas con el lavado de activos o la financiación del terrorismo.",
                            "Reconocer estas señales a tiempo es esencial para proteger la organización, evitar su utilización en actividades ilícitas y cumplir con la normativa nacional e internacional en materia de prevención del riesgo.",
                            "Estas señales no necesariamente confirman la existencia de un delito, pero sí exigen una revisión más profunda, la activación de los protocolos internos y, en caso de ser necesario, la comunicación con las autoridades competentes.",
                            "A continuación, se presentan las principales señales de alerta que deben tenerse en cuenta en el sector transporte y en cualquier operación comercial:",
                            "**🔹 1. Pagos inusuales o muy altos en efectivo**",
                            "En la actualidad, las transacciones de alto valor suelen realizarse por medios electrónicos como transferencias bancarias o pagos con tarjeta.",
                            "Cuando un cliente insiste en efectuar pagos en efectivo de montos elevados, podría estar intentando ocultar el origen ilícito de los fondos.",
                            "Esto representa un riesgo significativo de lavado de activos y debe reportarse para análisis adicional.",
                            "**Ejemplo:** Una empresa que normalmente paga sus facturas por transferencia solicita cancelar un contrato de 50 millones de pesos en efectivo.",
                            "**🔹 2. Cambios frecuentes en remitentes o destinatarios**",
                            "Las operaciones en las que los pagos o cobros cambian constantemente de nombre sin una justificación válida pueden indicar un intento de encubrir la identidad real del beneficiario o del origen del dinero. Este tipo de comportamiento busca crear confusión en la trazabilidad de las operaciones financieras.",
                            "**Ejemplo:** Un mismo servicio es facturado cada mes por un proveedor distinto, sin explicación clara ni relación comercial establecida.",
                            "** 🔹 3. Documentos incompletos o falsos**",
                            "La falta de documentación, la presentación de información inconsistente o la alteración de documentos son alertas directas de posible fraude o manipulación.",
                            "Estos casos pueden reflejar intentos de simular operaciones legales o de ocultar el verdadero propósito de una transacción.",
                            "**Ejemplo:** Facturas sin número de identificación, con datos inconsistentes o con fechas que no coinciden con la prestación real del servicio.",
                            "** 🔹 4. Clientes que no quieren suministrar información**",
                            "Cuando un cliente se niega a entregar información básica, como estados financieros, referencias o datos de contacto verificables, se debe considerar una alerta relevante.",
                            "La resistencia a la transparencia impide realizar una evaluación adecuada del riesgo y podría ser una señal de que la persona busca ocultar su identidad o sus actividades económicas reales.",
                            "**Ejemplo:** Un cliente se rehúsa a entregar sus estados financieros o evita brindar información sobre su estructura empresarial.",
                            "** 🔹 5. Operaciones que no coinciden con el perfil del cliente**",
                            "Toda empresa debe contar con un perfil transaccional de sus clientes, basado en su actividad económica, montos y comportamiento habitual.",
                            "Cuando una operación se desvía de ese patrón esperado, puede tratarse de una maniobra para canalizar recursos ilícitos o realizar movimientos fuera del propósito legítimo del negocio.",
                            "**Ejemplo:** Un cliente que usualmente realiza transferencias pequeñas comienza a efectuar pagos millonarios en sectores distintos a los de su actividad económica.",
                            "**Conclusión**",
                            "Detectar y reportar las señales de alerta es una responsabilidad compartida por todos los colaboradores de la organización.",
                            "Cada empleado, sin importar su cargo, debe estar atento a identificar comportamientos inusuales y comunicar oportunamente cualquier situación sospechosa al oficial de cumplimiento o al área encargada del SARLAFT.",
                            "La aplicación adecuada de estos controles contribuye a:",
                            " 🔸 Prevenir la vinculación de la empresa con actividades delictivas",
                            " 🔸 Fortalecer la cultura de cumplimiento y ética corporativa",
                            " 🔸 Proteger la reputación y sostenibilidad del negocio.",
                            "En conjunto, las señales de alerta constituyen una herramienta clave para la gestión integral del riesgo, reforzando el compromiso institucional con la transparencia, la legalidad y la responsabilidad empresarial.",

                        ],
                        duration: "01:26",
                    },
                    {
                        id: 7, lessons: "Fundamentos", name: "Casos Reales en Colombia", completed: false, type: "Video", duration: "01:26", path: casosSARLAFT,
                        resumen: [
                            "**Casos Reales en Colombia**",
                            "En Colombia, múltiples casos recientes han evidenciado la relevancia del Sistema de Administración del Riesgo de Lavado de Activos y Financiación del Terrorismo (SARLAFT) como herramienta clave para prevenir delitos financieros.",
                            "Algunos esquemas detectados incluyen el envío de dinero oculto en encomiendas declaradas como ropa usada, la creación de empresas fachada sin operaciones reales para mover recursos ilícitos y el transporte de mercancía contaminada con drogas, donde se comprometen tanto transportadores como empresas que no verifican adecuadamente a sus clientes.",
                            "Asimismo, se han identificado constructoras e inmobiliarias utilizadas para lavar dinero mediante sobrevaloración de inmuebles o pagos en efectivo injustificados. Incluso cooperativas y entidades financieras han sido sancionadas por no reportar oportunamente operaciones inusuales o sospechosas.",
                            "Estos casos reflejan que ningún sector está exento del riesgo de ser usado con fines ilícitos, y que el cumplimiento riguroso del SARLAFT es una responsabilidad compartida. Detectar señales de alerta, reportar irregularidades y actuar con transparencia no solo fortalece la integridad de las organizaciones, sino que también protege a cada persona involucrada en la cadena de valor.",

                        ]
                    },

                    {
                        id: 8, lessons: "Fundamentos", name: "El Rol de los Empleados", completed: false, type: "dragDropOrder",
                        objetivo: 'Comprender que cada colaborador desempeña un papel esencial en la prevención del Lavado de Activos y la Financiación del Terrorismo, y que son sus acciones diarias, su atención al detalle y su comunicación oportuna las que fortalecen el SARLAFT como sistema de defensa empresarial.',
                        audioObjetivo: 'Comprender que cada colaborador desempeña un papel esencial en la prevención del Lavado de Activos y la Financiación del Terrorismo. Son las acciones diarias, la atención al detalle y la comunicación oportuna las que fortalecen el SARLAFT como sistema de defensa empresarial. En esta actividad, podrás descubrir cómo cada comportamiento y decisión contribuyen a proteger a la organización frente a los riesgos del LAFT.'
                        ,
                        cards: [
                            {
                                id: "intro",
                                title: "Introducción",
                                icon: "🧠",
                                order: 1,
                                content: `El SARLAFT no es solo una política o un documento: es una cultura organizacional que requiere la participación activa de todos los empleados.

                                          Cada colaborador, sin importar su rol o cargo, forma parte de la primera línea de defensa contra los riesgos de Lavado de Activos y Financiación del Terrorismo.

                                          Esto significa que no necesitamos ser investigadores, sino personas atentas, responsables y comprometidas con reportar lo que no encaje con las operaciones normales.`,
                                audioText: `El SARLAFT no es solo una política o un documento: es una cultura organizacional que requiere la participación activa de todos los empleados. Cada colaborador, sin importar su rol o cargo, forma parte de la primera línea de defensa contra los riesgos de lavado de activos y financiación del terrorismo. Esto significa que no necesitamos ser investigadores, sino personas atentas, responsables y comprometidas con reportar lo que no encaje con las operaciones normales.`
                            },
                            {
                                id: "rol1",
                                title: "No somos detectives",
                                icon: "🕵️‍♂️",
                                order: 2,
                                content: `El SARLAFT no busca que los empleados actúen como investigadores o autoridades judiciales.

                                          Nuestro deber es detectar comportamientos o situaciones inusuales en el desarrollo de nuestras labores y reportarlas oportunamente.

                                         🔹 Ejemplo:
                                           Si un cliente o proveedor entrega documentos confusos, da respuestas evasivas o cambia constantemente la información, no debemos confrontarlo, sino informar al responsable SARLAFT.`,
                                audioText: `No somos detectives. El SARLAFT no busca que los empleados actúen como investigadores o autoridades judiciales. Nuestro deber es detectar comportamientos o situaciones inusuales y reportarlas oportunamente. Por ejemplo, si un cliente o proveedor entrega documentos confusos, da respuestas evasivas o cambia constantemente la información, debemos informar al responsable SARLAFT.`
                            },
                            {
                                id: "rol2",
                                title: "Reportar lo que no encaje",
                                icon: "📑",
                                order: 3,
                                content: `Todos los empleados debemos estar atentos a identificar y reportar operaciones inusuales o sospechosas. 

                                        Algunos ejemplos de señales de alerta:
                                            🔹 Documentos alterados o con información incompleta.
                                            🔹 Personas que se niegan a suministrar datos básicos.
                                            🔹 Operaciones o solicitudes que no coinciden con la actividad normal del cliente.
                                            🔹 Pagos o transferencias con montos inusuales o desde cuentas desconocidas.

                                        🚨 Si algo no encaja, se reporta. No se ignora.`,
                                audioText: `Todos los empleados debemos estar atentos a identificar y reportar operaciones inusuales o sospechosas. Por ejemplo, documentos alterados, personas que se niegan a entregar información, operaciones que no coinciden con la actividad del cliente, o pagos con montos inusuales. Si algo no encaja, se reporta. No se ignora.`

                            }, {
                                id: "rol3",
                                title: "Todos los cargos cuentan",
                                icon: "👷‍♀️",
                                order: 4,
                                content: `El SARLAFT aplica para todos los niveles y áreas de la organización. 

                                            Cada cargo tiene una función que puede ayudar a detectar y prevenir riesgos:
                                            🔹 Conductores: verifican documentos, rutas y cargues.
                                            🔹 Auxiliares de despacho: confirman cantidades, destinatarios y sellos.
                                            🔹 Personal administrativo o de caja: valida datos, pagos y registros.
                                            🔹 Supervisores y jefes: garantizan la aplicación de los controles.

                                            Todos sumamos en la protección de la empresa.`,
                                audioText: `El SARLAFT aplica para todos los niveles y áreas de la organización. Cada cargo cumple un papel clave: los conductores verifican documentos y rutas; los auxiliares de despacho revisan cantidades y sellos; el personal administrativo valida pagos y registros; y los supervisores garantizan que se cumplan los controles. Todos sumamos en la protección de la empresa.`
                            },
                            {
                                id: "rol4",
                                title: "Responsabilidad compartida",
                                icon: "🤝",
                                order: 5,
                                content: `La gestión del riesgo es una responsabilidad compartida entre la empresa y sus colaboradores.

                                            Cuando cada persona cumple con su deber de alertar sobre posibles irregularidades:
                                            🔹 Se protege la reputación de la compañía.
                                            🔹Se evita la participación involuntaria en delitos financieros.
                                            🔹 Se refuerza la transparencia de las operaciones.

                                        🛡️ Si todos cumplimos, protegemos a la empresa y fortalecemos la cultura del cumplimiento.`,
                                audioText: `La gestión del riesgo es una responsabilidad compartida entre la empresa y sus colaboradores. Cuando cada persona cumple con su deber de alertar sobre posibles irregularidades, se protege la reputación de la compañía, se evitan delitos financieros y se refuerza la transparencia. Si todos cumplimos, protegemos a la empresa y fortalecemos la cultura del cumplimiento.`
                            },
                            {
                                id: "conclusion",
                                title: "Conclusión",
                                icon: "✅",
                                order: 6,
                                content: `🔍 En resumen:

                                            🔹 Todos los empleados somos parte activa del SARLAFT.
                                            🔹 No necesitamos investigar, solo observar y reportar lo inusual.
                                            🔹 Cada rol tiene una responsabilidad concreta para prevenir riesgos.
                                            🔹 La comunicación y el trabajo en equipo son clave para mantener la integridad y la transparencia de la empresa.

                                            👉 Recuerda: tu atención y compromiso son la mejor defensa contra los riesgos de Lavado de Activos y Financiación del Terrorismo.`,
                                audioText: `En resumen: todos los empleados somos parte activa del SARLAFT. No necesitamos investigar, solo observar y reportar lo inusual. Cada rol tiene una responsabilidad concreta para prevenir riesgos. La comunicación y el trabajo en equipo son clave para mantener la integridad de la empresa. Recuerda: tu atención y compromiso son la mejor defensa contra los riesgos de lavado de activos y financiación del terrorismo.`
                            }
                        ],
                        duration: "01:26",
                        resumen: [
                            "**El Rol de los Empleados**",
                            "El SARLAFT no es solo un sistema, es una cultura organizacional que depende del compromiso de cada empleado.",
                            "Todos los colaboradores conforman la primera línea de defensa frente a los riesgos de Lavado de Activos y Financiación del Terrorismo.",
                            "El rol del empleado no es investigar, sino identificar y reportar comportamientos inusuales o sospechosos.",
                            "Cada cargo tiene un papel clave: desde el conductor y el auxiliar, hasta el administrativo y el jefe de área.",
                            "La prevención y el reporte oportuno son responsabilidades compartidas que protegen la reputación y transparencia de la empresa.",
                            "Si todos cumplimos con nuestros deberes, fortalecemos el SARLAFT y aseguramos operaciones éticas y seguras."

                        ]
                    },



                    {
                        id: 9,
                        lessons: "Fundamentos",
                        name: "Consecuencias de No Aplicar el SARLAFT",
                        completed: false,
                        type: "FlipCardReverse",
                        objetivo: 'Reconocer la importancia de cumplir con el SARLAFT y comprender las graves consecuencias que puede generar su incumplimiento tanto para la empresa como para los empleados. Entender que aplicar el SARLAFT no es un requisito formal, sino una medida esencial para proteger la reputación, la estabilidad y la sostenibilidad del negocio.',
                        audioObjetivo: 'Reconocer la importancia de cumplir con el SARLAFT y comprender las graves consecuencias que puede generar su incumplimiento tanto para la empresa como para los empleados. Aplicar el SARLAFT no es solo una obligación legal, sino una herramienta clave para proteger la reputación, la estabilidad y la sostenibilidad de la empresa y sus trabajadores.',
                        cards: [
                            {
                                id: 1,
                                title: "Multas y sanciones legales",
                                content: "El incumplimiento del SARLAFT puede generar sanciones económicas impuestas por la Superintendencia o por autoridades financieras. Estas multas pueden alcanzar cifras millonarias, afectar el flujo de caja de la empresa y poner en riesgo su continuidad.",
                                example: "Ejemplo: una empresa de transporte sancionada con más de 200 millones de pesos por no implementar adecuadamente sus políticas de prevención de lavado de activos.",
                                icon: '💰',
                                color: "from-red-500 to-red-700",
                                colorSolido: "bg-red-600",
                                colorBorde: "border-red-600"
                            },
                            {
                                id: 2,
                                title: "Pérdida de licencias o cierre de operaciones",
                                content: "La falta de controles SARLAFT puede llevar a la suspensión o cancelación del Registro Único de Transporte o de la habilitación para operar. Esto implica la pérdida de contratos, clientes y fuentes de empleo.",
                                example: "Ejemplo: una empresa del sector logístico fue cerrada temporalmente por no reportar operaciones sospechosas ante la autoridad competente.",
                                icon: '🏢',
                                color: "from-orange-500 to-orange-600",
                                colorSolido: "bg-orange-500",
                                colorBorde: "border-orange-500"
                            },
                            {
                                id: 3,
                                title: "Daño reputacional",
                                content: "El vínculo con actividades ilegales, incluso por omisión, puede afectar gravemente la imagen de la empresa. Recuperar la confianza de clientes, aliados y autoridades puede tardar años o ser imposible.",
                                example: "Ejemplo: una transportadora fue señalada en medios por estar involucrada en operaciones de contrabando debido a fallas en sus controles internos.",
                                icon: '⚠️',
                                color: "from-yellow-500 to-yellow-600",
                                colorSolido: "bg-yellow-500",
                                colorBorde: "border-yellow-500"
                            },
                            {
                                id: 4,
                                title: "Responsabilidad individual del empleado",
                                content: "El SARLAFT también protege a los empleados. Ignorar una señal de alerta o participar, incluso sin intención, en una operación irregular puede generar sanciones disciplinarias, pérdida del empleo o implicaciones legales.",
                                example: "Ejemplo: un auxiliar logístico sancionado por no reportar un documento falso detectado durante el cargue de mercancía.",
                                icon: '👤',
                                color: "from-blue-500 to-blue-600",
                                colorSolido: "bg-blue-500",
                                colorBorde: "border-blue-500"
                            },
                            {
                                id: 5,
                                title: "Casos reales y lecciones aprendidas",
                                content: "En Colombia y otros países, bancos, cooperativas y empresas han sido sancionadas o cerradas por incumplir los estándares del SARLAFT. Estos casos demuestran que la prevención no es opcional: es la única forma de garantizar la integridad y sostenibilidad de la organización.",
                                example: "Ejemplo: varias cooperativas financieras fueron intervenidas por permitir operaciones sospechosas sin aplicar controles adecuados.",
                                icon: '📚',
                                color: "from-green-500 to-green-600",
                                colorSolido: "bg-green-600",
                                colorBorde: "border-green-600"
                            }
                        ],
                        resumen: [
                            "**Consecuencias de No Aplicar el SARLAFT**",
                            "El SARLAFT no es un simple trámite administrativo. Es el sistema que protege a la empresa, sus empleados y su reputación frente a los riesgos del Lavado de Activos y la Financiación del Terrorismo.",
                            "Ignorar o incumplir sus políticas puede tener consecuencias graves tanto institucionales como personales:",
                            "**🔹 Para la empresa:**",
                            "- Multas millonarias y sanciones de las autoridades.",
                            "- Suspensión o pérdida de licencias y permisos para operar.",
                            "- Pérdida de contratos, clientes y aliados estratégicos.",
                            "- Daño irreparable a la reputación y pérdida de confianza.",
                            "**🔹 Para los empleados:**",
                            "- Sanciones internas o disciplinarias.",
                            "- Implicaciones legales por omisión o participación indirecta.",
                            "- Pérdida del empleo y afectación a la trayectoria laboral.",
                            "Los casos reales de sanciones a empresas y entidades financieras demuestran que no aplicar el SARLAFT puede poner en riesgo todo el esfuerzo de años de trabajo.",
                            "**Conclusión:**",
                            "Cumplir con el SARLAFT no es una carga, es una responsabilidad compartida que garantiza la sostenibilidad de la empresa, la protección de los empleos y la confianza de clientes y autoridades.",
                            "Aplicarlo correctamente es asegurar el futuro de la organización y el bienestar de todos sus colaboradores."
                        ],
                        duration: "01:35",
                    },


                    {
                        id: 10, lessons: "Fundamentos", name: "Canales internos de reporte", completed: false, type: "Video", duration: "01:26", path: finalSARLAFT,
                        resumen: [
                            "**llegamos al final**",
                            "El curso sobre el Sistema de Administración del Riesgo de Lavado de Activos y Financiación del Terrorismo (SARLAFT) concluye destacando la importancia de comprender sus componentes, su impacto en la organización y el rol esencial que cumple cada colaborador en la prevención y detección de operaciones inusuales o sospechosas.",
                            "Se enfatiza que el cumplimiento del SARLAFT trasciende la obligación legal: representa un compromiso ético con la transparencia, la legalidad y la reputación institucional. Ante cualquier situación que genere duda o parezca irregular, los empleados deben reportarla mediante los canales internos establecidos, como el correo institucional de cumplimiento, el Oficial de Cumplimiento o los canales confidenciales de reporte disponibles en la intranet o en el área correspondiente.",
                            "El propósito del reporte no es acusar, sino alertar para que los expertos evalúen y gestionen adecuadamente el riesgo. La participación activa de cada miembro de la organización fortalece el sistema, garantiza el cumplimiento normativo y consolida una cultura organizacional basada en la integridad, la transparencia y la confianza.",
                            "En conclusión, el SARLAFT no solo protege a la empresa frente a riesgos legales y reputacionales, sino que también promueve una cultura de responsabilidad compartida en la prevención del lavado de activos y la financiación del terrorismo.",
                        ]
                    },


                    {
                        id: 11, lessons: "Evaluación", name: "Evaluacion Final", completed: false, type: "Quiz",
                        questions: [
                            {
                                "etiqueta": "¿Qué es SARLAFT?",
                                "preguntas": [
                                    {
                                        "id": 1,
                                        "name": "¿Qué significa SARLAFT y cuál es su objetivo principal?",
                                        "respuestas": [
                                            { "opcion": "Es un sistema para prevenir el lavado de activos y la financiación del terrorismo dentro de las empresas.", "rsp": true },
                                            { "opcion": "Es un procedimiento para mejorar las ventas y la eficiencia operativa.", "rsp": false },
                                            { "opcion": "Es una norma exclusiva del sector bancario que no aplica a otras empresas.", "rsp": false },
                                            { "opcion": "Es un plan de emergencia ante desastres naturales.", "rsp": false }
                                        ]
                                    },
                                    {
                                        "id": 2,
                                        "name": "¿Por qué es importante aplicar el SARLAFT en una empresa de transporte?",
                                        "respuestas": [
                                            { "opcion": "Porque ayuda a evitar que la empresa sea utilizada en actividades ilícitas y protege su reputación.", "rsp": true },
                                            { "opcion": "Porque garantiza que los vehículos estén siempre en buen estado.", "rsp": false },
                                            { "opcion": "Porque reemplaza los controles de calidad en las operaciones logísticas.", "rsp": false },
                                            { "opcion": "Porque asegura que todos los clientes paguen a tiempo.", "rsp": false }
                                        ]
                                    },
                                    {
                                        "id": 3,
                                        "name": "¿Cuál de las siguientes afirmaciones describe mejor al SARLAFT?",
                                        "respuestas": [
                                            { "opcion": "Es un sistema de control que identifica, previene y gestiona riesgos relacionados con el lavado de activos y la financiación del terrorismo.", "rsp": true },
                                            { "opcion": "Es un protocolo interno para mejorar la atención al cliente.", "rsp": false },
                                            { "opcion": "Es una herramienta para optimizar la logística de transporte.", "rsp": false },
                                            { "opcion": "Es un proceso contable que revisa los pagos y cobros de la empresa.", "rsp": false }
                                        ]
                                    }
                                ]
                            },
                            {
                                "etiqueta": "Etapas del SARLAFT",
                                "preguntas": [
                                    {
                                        "id": 1,
                                        "name": "¿Cuáles son las etapas del SARLAFT?",
                                        "respuestas": [
                                            { "opcion": "Identificación, Medición, Control y Monitoreo", "correcta": true },
                                            { "opcion": "Planeación, Ejecución, Verificación y Cierre", "correcta": false },
                                            { "opcion": "Prevención, Detección, Acción y Reporte", "correcta": false }
                                        ]
                                    },
                                    {
                                        "id": 2,
                                        "name": "¿Qué se realiza en la etapa de Identificación del riesgo?",
                                        "respuestas": [
                                            { "opcion": "Reconocer y documentar factores que puedan representar peligro de lavado de activos o financiación del terrorismo", "correcta": true },
                                            { "opcion": "Implementar medidas de mitigación y controles internos", "correcta": false },
                                            { "opcion": "Monitorear continuamente las operaciones sospechosas", "correcta": false }
                                        ]
                                    },
                                    {
                                        "id": 3,
                                        "name": "¿Cuál es el propósito principal de la etapa de Medición o Evaluación del riesgo?",
                                        "respuestas": [
                                            { "opcion": "Determinar la probabilidad e impacto de los riesgos identificados para priorizar su atención", "correcta": true },
                                            { "opcion": "Registrar y documentar señales de alerta", "correcta": false },
                                            { "opcion": "Aplicar medidas correctivas ante operaciones sospechosas", "correcta": false }
                                        ]
                                    },
                                    {
                                        "id": 4,
                                        "name": "¿Qué se busca lograr en la etapa de Control del riesgo?",
                                        "respuestas": [
                                            { "opcion": "Reducir la probabilidad e impacto de los riesgos mediante la aplicación de controles y políticas internas", "correcta": true },
                                            { "opcion": "Identificar nuevos factores de riesgo", "correcta": false },
                                            { "opcion": "Evaluar la eficacia de las auditorías externas", "correcta": false }
                                        ]
                                    },
                                    {
                                        "id": 5,
                                        "name": "¿Cuál es el objetivo de la etapa de Monitoreo del riesgo en el SARLAFT?",
                                        "respuestas": [
                                            { "opcion": "Evaluar continuamente la efectividad de los controles y detectar operaciones inusuales o sospechosas", "correcta": true },
                                            { "opcion": "Establecer nuevos factores de riesgo por actividad económica", "correcta": false },
                                            { "opcion": "Clasificar clientes por nivel de riesgo", "correcta": false }
                                        ]
                                    }
                                ]

                            },
                            {
                                "etiqueta": "Factores de Riesgo en el Transporte de Carga",
                                "preguntas": [
                                    {
                                        "id": 1,
                                        "name": "¿Cuáles son los cuatro factores de riesgo del SARLAFT?",
                                        "respuestas": [
                                            { "opcion": "Cliente o contraparte, Producto o servicio, Canal de distribución y Jurisdicción o zona geográfica", "correcta": true },
                                            { "opcion": "Proveedor, Ruta, Documentación y Personal", "correcta": false },
                                            { "opcion": "Finanzas, Mercadeo, Operaciones y Tecnología", "correcta": false }
                                        ]
                                    },
                                    {
                                        "id": 2,
                                        "name": "¿Qué representa el factor de riesgo 'Cliente o Contraparte' en el transporte de carga?",
                                        "respuestas": [
                                            { "opcion": "Los actores con los que la empresa se relaciona y que podrían usar la operación para fines ilícitos", "correcta": true },
                                            { "opcion": "Las rutas por las que se moviliza la carga", "correcta": false },
                                            { "opcion": "Los productos que se transportan", "correcta": false }
                                        ]
                                    },
                                    {
                                        "id": 3,
                                        "name": "¿Qué riesgo está asociado al factor 'Producto o Servicio' dentro del SARLAFT?",
                                        "respuestas": [
                                            { "opcion": "Que el servicio de transporte sea usado como fachada para mover mercancías ilegales o justificar operaciones sospechosas", "correcta": true },
                                            { "opcion": "Que la documentación de transporte se extravíe durante el proceso logístico", "correcta": false },
                                            { "opcion": "Que el cliente no firme el manifiesto de carga", "correcta": false }
                                        ]
                                    },
                                    {
                                        "id": 4,
                                        "name": "¿Qué implica el factor 'Canal de Distribución' en el SARLAFT?",
                                        "respuestas": [
                                            { "opcion": "La movilización física de la carga y la documentación que respalda la operación, donde pueden presentarse riesgos como falsificación o alteración", "correcta": true },
                                            { "opcion": "El tipo de vehículo que se usa para transportar la carga", "correcta": false },
                                            { "opcion": "El contrato firmado con el cliente principal", "correcta": false }
                                        ]
                                    },
                                    {
                                        "id": 5,
                                        "name": "¿Qué riesgo se asocia al factor 'Jurisdicción o Zona Geográfica'?",
                                        "respuestas": [
                                            { "opcion": "Que algunas regiones del país representen mayor exposición al contrabando, lavado de activos o contaminación de carga", "correcta": true },
                                            { "opcion": "Que el cliente opere en varias ciudades del país", "correcta": false },
                                            { "opcion": "Que las rutas sean demasiado largas o costosas", "correcta": false }
                                        ]
                                    }
                                ]

                            },
                            {
                                "etiqueta": "Señales de Alerta",
                                "preguntas": [
                                    {
                                        "id": 1,
                                        "name": "¿Cuáles son las señales de alerta del SARLAFT?",
                                        "respuestas": [
                                            {
                                                "opcion": "Pagos inusuales o muy altos en efectivo, cambios frecuentes en remitentes o destinatarios, documentos incompletos o falsos, clientes que no quieren dar información y operaciones que no coinciden con el perfil del cliente",
                                                "correcta": true
                                            },
                                            {
                                                "opcion": "Altos niveles de rotación de personal y demoras en la entrega de mercancía",
                                                "correcta": false
                                            },
                                            {
                                                "opcion": "Incremento de ventas, nuevos clientes y expansión de rutas comerciales",
                                                "correcta": false
                                            }]
                                    },
                                    {
                                        "id": 2,
                                        "name": "¿Por qué un pago inusual o muy alto en efectivo puede considerarse una señal de alerta?",
                                        "respuestas": [
                                            { "opcion": "Porque podría indicar que se intenta ocultar el origen del dinero o evitar controles bancarios", "correcta": true },
                                            { "opcion": "Porque el cliente no tiene cuenta bancaria", "correcta": false },
                                            { "opcion": "Porque la empresa no acepta transferencias electrónicas", "correcta": false }
                                        ]
                                    },
                                    {
                                        "id": 3,
                                        "name": "¿Qué riesgo representa que haya cambios frecuentes en remitentes o destinatarios?",
                                        "respuestas": [
                                            { "opcion": "Podría tratarse de una forma de ocultar la identidad real del beneficiario o del origen de los fondos", "correcta": true },
                                            { "opcion": "Demuestra una estrategia comercial para diversificar proveedores", "correcta": false },
                                            { "opcion": "Indica que la empresa está creciendo y cambiando de socios", "correcta": false }
                                        ]
                                    },
                                    {
                                        "id": 4,
                                        "name": "¿Por qué los documentos incompletos o falsos son una señal de alerta?",
                                        "respuestas": [
                                            { "opcion": "Porque pueden ocultar información clave o usarse para simular operaciones legales que en realidad son ilícitas", "correcta": true },
                                            { "opcion": "Porque generan retrasos administrativos normales", "correcta": false },
                                            { "opcion": "Porque suelen ser errores humanos sin importancia", "correcta": false }
                                        ]
                                    },
                                    {
                                        "id": 5,
                                        "name": "¿Qué indica cuando un cliente no quiere suministrar información básica?",
                                        "respuestas": [
                                            { "opcion": "Que podría estar ocultando su identidad o la verdadera naturaleza de su actividad económica", "correcta": true },
                                            { "opcion": "Que no tiene tiempo disponible para llenar los formularios", "correcta": false },
                                            { "opcion": "Que la empresa ya tiene la información registrada anteriormente", "correcta": false }
                                        ]
                                    },
                                    {
                                        "id": 6,
                                        "name": "¿Por qué se considera señal de alerta una operación que no coincide con el perfil del cliente?",
                                        "respuestas": [
                                            { "opcion": "Porque puede reflejar movimientos financieros inusuales o sospechosos que no corresponden con su comportamiento habitual", "correcta": true },
                                            { "opcion": "Porque el cliente cambió su estrategia comercial", "correcta": false },
                                            { "opcion": "Porque se trata de una promoción temporal de servicios", "correcta": false }
                                        ]
                                    }
                                ]

                            },
                            {
                                "etiqueta": "Casos Reales en Colombia",
                                "preguntas": [
                                    {
                                        "id": 1,
                                        "name": "¿Qué tipo de práctica ilícita se ha detectado en Colombia relacionada con el transporte de carga?",
                                        "respuestas": [
                                            { "opcion": "El envío de dinero o mercancía ilegal oculta en encomiendas declaradas como ropa usada", "correcta": true },
                                            { "opcion": "La pérdida de documentos de transporte por errores administrativos", "correcta": false },
                                            { "opcion": "El uso de vehículos sin permisos de tránsito vigentes", "correcta": false }
                                        ]
                                    },
                                    {
                                        "id": 2,
                                        "name": "¿Cómo se han utilizado algunas constructoras e inmobiliarias para lavar dinero en Colombia?",
                                        "respuestas": [
                                            { "opcion": "Mediante la sobrevaloración de inmuebles y pagos en efectivo injustificados", "correcta": true },
                                            { "opcion": "Por no entregar los inmuebles en el tiempo acordado", "correcta": false },
                                            { "opcion": "Por usar materiales de baja calidad en la construcción", "correcta": false }
                                        ]
                                    },
                                    {
                                        "id": 3,
                                        "name": "¿Qué demuestra que empresas de distintos sectores pueden ser usadas para actividades ilícitas?",
                                        "respuestas": [
                                            { "opcion": "Que incluso cooperativas y entidades financieras han sido sancionadas por no reportar operaciones sospechosas", "correcta": true },
                                            { "opcion": "Que las empresas tienen dificultades tecnológicas para enviar reportes", "correcta": false },
                                            { "opcion": "Que los controles del SARLAFT solo aplican a grandes compañías", "correcta": false }
                                        ]
                                    }
                                ]

                            },
                            {
                                "etiqueta": "El Rol de los Empleados",
                                "preguntas": [
                                    {
                                        "id": 1,
                                        "name": "¿Cuáles son los roles de los empleados dentro del SARLAFT?",
                                        "respuestas": [
                                            {
                                                "opcion": "Detectar comportamientos inusuales, reportar lo que no encaje, cumplir responsabilidades según el cargo y asumir la gestión del riesgo como una tarea compartida",
                                                "correcta": true
                                            },
                                            {
                                                "opcion": "Cumplir únicamente las funciones operativas sin involucrarse en la gestión de riesgos",
                                                "correcta": false
                                            },
                                            {
                                                "opcion": "Solo los jefes y supervisores son responsables de detectar y reportar irregularidades",
                                                "correcta": false
                                            }
                                        ]
                                    },
                                    {
                                        "id": 2,
                                        "name": "¿Qué significa que los empleados no sean detectives dentro del SARLAFT?",
                                        "respuestas": [
                                            {
                                                "opcion": "Que su función no es investigar, sino identificar comportamientos inusuales y reportarlos al responsable SARLAFT",
                                                "correcta": true
                                            },
                                            {
                                                "opcion": "Que deben evitar involucrarse en cualquier situación sospechosa",
                                                "correcta": false
                                            },
                                            {
                                                "opcion": "Que solo deben seguir órdenes sin observar las operaciones diarias",
                                                "correcta": false
                                            }
                                        ]
                                    },
                                    {
                                        "id": 3,
                                        "name": "¿Qué deben hacer los empleados cuando algo no encaja o parece inusual?",
                                        "respuestas": [
                                            {
                                                "opcion": "Reportar la situación al responsable SARLAFT de manera oportuna",
                                                "correcta": true
                                            },
                                            {
                                                "opcion": "Ignorar el hecho si no afecta directamente su trabajo",
                                                "correcta": false
                                            },
                                            {
                                                "opcion": "Confrontar directamente al cliente o proveedor involucrado",
                                                "correcta": false
                                            }
                                        ]
                                    },
                                    {
                                        "id": 4,
                                        "name": "¿Qué significa que todos los cargos cuentan dentro del SARLAFT?",
                                        "respuestas": [
                                            {
                                                "opcion": "Que cada empleado, sin importar su posición, cumple un papel en la detección y prevención de riesgos",
                                                "correcta": true
                                            },
                                            {
                                                "opcion": "Que solo el personal administrativo debe aplicar los controles del SARLAFT",
                                                "correcta": false
                                            },
                                            {
                                                "opcion": "Que los cargos operativos no tienen relación con la gestión del riesgo",
                                                "correcta": false
                                            }
                                        ]
                                    },
                                    {
                                        "id": 5,
                                        "name": "¿Qué implica la responsabilidad compartida en el SARLAFT?",
                                        "respuestas": [
                                            {
                                                "opcion": "Que tanto la empresa como los empleados deben actuar para prevenir el lavado de activos y proteger la reputación de la organización",
                                                "correcta": true
                                            },
                                            {
                                                "opcion": "Que los empleados solo informan y la empresa asume toda la responsabilidad",
                                                "correcta": false
                                            },
                                            {
                                                "opcion": "Que la gestión del riesgo depende únicamente del área financiera o de cumplimiento",
                                                "correcta": false
                                            }
                                        ]
                                    }
                                ]


                            },
                            {
                                "etiqueta": "Consecuencias de No Aplicar el SARLAFT",
                                "preguntas": [
                                    {
                                        "id": 1,
                                        "name": "¿Cuáles son las posibles consecuencias de no aplicar el SARLAFT?",
                                        "respuestas": [
                                            {
                                                "opcion": "Multas y sanciones legales, pérdida de licencias o cierre de operaciones, daño reputacional, responsabilidad individual del empleado y sanciones derivadas de casos reales",
                                                "correcta": true
                                            },
                                            {
                                                "opcion": "Solo pérdida de tiempo en la implementación de controles innecesarios",
                                                "correcta": false
                                            },
                                            {
                                                "opcion": "Aumento en la productividad y reducción de costos administrativos",
                                                "correcta": false
                                            }
                                        ]
                                    },
                                    {
                                        "id": 2,
                                        "name": "¿Qué tipo de sanciones puede recibir una empresa por incumplir el SARLAFT?",
                                        "respuestas": [
                                            {
                                                "opcion": "Multas económicas impuestas por autoridades financieras o la Superintendencia",
                                                "correcta": true
                                            },
                                            {
                                                "opcion": "Reconocimientos públicos por transparencia y eficiencia",
                                                "correcta": false
                                            },
                                            {
                                                "opcion": "Bonificaciones tributarias por reducir procesos internos",
                                                "correcta": false
                                            }
                                        ]
                                    },
                                    {
                                        "id": 3,
                                        "name": "¿Qué puede ocurrir si una empresa no tiene controles SARLAFT adecuados?",
                                        "respuestas": [
                                            {
                                                "opcion": "Puede perder licencias, habilitaciones o incluso ser cerrada temporal o definitivamente",
                                                "correcta": true
                                            },
                                            {
                                                "opcion": "Recibirá nuevas oportunidades comerciales y más contratos",
                                                "correcta": false
                                            },
                                            {
                                                "opcion": "Solo enfrentará observaciones sin sanciones reales",
                                                "correcta": false
                                            }
                                        ]
                                    },
                                    {
                                        "id": 4,
                                        "name": "¿Qué tipo de daño puede sufrir una empresa si se asocia con actividades ilegales, incluso por omisión?",
                                        "respuestas": [
                                            {
                                                "opcion": "Daño reputacional que afecta la confianza de clientes, aliados y autoridades",
                                                "correcta": true
                                            },
                                            {
                                                "opcion": "Aumento inmediato de su credibilidad en el mercado",
                                                "correcta": false
                                            },
                                            {
                                                "opcion": "Solo una amonestación interna sin mayores consecuencias",
                                                "correcta": false
                                            }
                                        ]
                                    },
                                    {
                                        "id": 5,
                                        "name": "¿Qué consecuencias puede tener un empleado que ignore una señal de alerta o participe en una operación irregular?",
                                        "respuestas": [
                                            {
                                                "opcion": "Puede enfrentar sanciones disciplinarias, pérdida del empleo o incluso implicaciones legales",
                                                "correcta": true
                                            },
                                            {
                                                "opcion": "No tendrá ninguna consecuencia si no fue intencional",
                                                "correcta": false
                                            },
                                            {
                                                "opcion": "Recibirá capacitación adicional como única medida correctiva",
                                                "correcta": false
                                            }
                                        ]
                                    },
                                    {
                                        "id": 6,
                                        "name": "¿Qué enseñan los casos reales sobre el incumplimiento del SARLAFT?",
                                        "respuestas": [
                                            {
                                                "opcion": "Que la prevención no es opcional y que el incumplimiento puede llevar al cierre o intervención de empresas",
                                                "correcta": true
                                            },
                                            {
                                                "opcion": "Que las sanciones solo aplican a bancos y no a empresas de transporte",
                                                "correcta": false
                                            },
                                            {
                                                "opcion": "Que los controles del SARLAFT son opcionales y solo de cumplimiento formal",
                                                "correcta": false
                                            }
                                        ]
                                    }
                                ]

                            },
                            {
                                "etiqueta": "Canales internos de reporte",
                                "preguntas": [
                                    {
                                        "id": 1,
                                        "name": "¿Cuáles son los canales internos establecidos para reportar situaciones inusuales o sospechosas dentro de la empresa?",
                                        "respuestas": [
                                            {
                                                "opcion": "Correo institucional del Oficial de Cumplimiento (ycely@argos.com.co), teléfono de reporte del Oficial de Cumplimiento (320 216 34 23), Oficial de Cumplimiento.",
                                                "correcta": true
                                            },
                                            {
                                                "opcion": "Líneas de atención al cliente y redes sociales corporativas",
                                                "correcta": false
                                            },
                                            {
                                                "opcion": "Comunicación directa con proveedores o clientes externos",
                                                "correcta": false
                                            }
                                        ]
                                    },
                                    {
                                        "id": 2,
                                        "name": "¿Cuál es el propósito principal de reportar una operación inusual o sospechosa?",
                                        "respuestas": [
                                            {
                                                "opcion": "Alertar a los expertos del SARLAFT para que evalúen y gestionen adecuadamente el riesgo",
                                                "correcta": true
                                            },
                                            {
                                                "opcion": "Acusar directamente al cliente o colaborador involucrado",
                                                "correcta": false
                                            },
                                            {
                                                "opcion": "Evitar responsabilidades personales sin informar a nadie más",
                                                "correcta": false
                                            }
                                        ]
                                    },
                                    {
                                        "id": 3,
                                        "name": "¿Por qué el cumplimiento del SARLAFT trasciende una obligación legal?",
                                        "respuestas": [
                                            {
                                                "opcion": "Porque representa un compromiso ético con la transparencia, la legalidad y la reputación institucional",
                                                "correcta": true
                                            },
                                            {
                                                "opcion": "Porque solo aplica para empresas del sector financiero",
                                                "correcta": false
                                            },
                                            {
                                                "opcion": "Porque su aplicación depende de la decisión del área administrativa",
                                                "correcta": false
                                            }
                                        ]
                                    },
                                    {
                                        "id": 4,
                                        "name": "¿Qué se logra cuando todos los empleados reportan de forma activa y responsable las situaciones sospechosas?",
                                        "respuestas": [
                                            {
                                                "opcion": "Fortalecer el sistema SARLAFT, garantizar el cumplimiento normativo y consolidar una cultura basada en la integridad y la confianza",
                                                "correcta": true
                                            },
                                            {
                                                "opcion": "Reducir la carga de trabajo del Oficial de Cumplimiento sin generar impacto real",
                                                "correcta": false
                                            },
                                            {
                                                "opcion": "Evitar auditorías internas aunque se pierda trazabilidad de los casos",
                                                "correcta": false
                                            }
                                        ]
                                    }
                                ]

                            }


                        ], duration: "01:26",
                    },

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
            flipCardProgress: {},
            flipCardReverseProgress: {},
            dragDropProgress: {},
            dragDropOrderProgress: {}
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

        // 🟢 LEER PRIMERO el localStorage para obtener datos más recientes
        const storedProgress = localStorage.getItem("userProgress");
        const allStoredProgress = storedProgress ? JSON.parse(storedProgress) : {};
        const currentStoredCourseProgress = allStoredProgress[courseIdNum] || currentProgress;

        // 🟢 PRESERVAR flipCardProgress y otros datos que puedan existir
        const updatedProgress = {
            ...currentProgress,
            ...currentStoredCourseProgress, // Tomar datos más recientes del localStorage
            currentModule: nextModule,
            completedModules: updatedCompletedModules,
            cumplimiento,
            lastAccessAt: new Date().toISOString(),
            // 🟢 PRESERVAR explícitamente flipCardProgress
            flipCardProgress: currentStoredCourseProgress.flipCardProgress || currentProgress.flipCardProgress || {}
        };

        const newProgress = {
            ...userProgress,
            ...allStoredProgress, // Mantener todo lo que ya existe en localStorage
            [courseIdNum]: updatedProgress
        };

        setUserProgress(newProgress);
        localStorage.setItem("userProgress", JSON.stringify(newProgress));

        console.log('✅ Módulo completado - Progreso guardado:', {
            moduleId: moduleIdNum,
            flipCardProgress: updatedProgress.flipCardProgress,
            completedModules: updatedCompletedModules
        });

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