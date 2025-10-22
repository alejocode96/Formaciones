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
                        audioObjetivo: 'Es fundamental comprender los cuatro factores de riesgo del SARLAFT y cómo pueden presentarse en las operaciones de transporte de carga. Para afianzar este conocimiento, arrastra los elementos en el orden correcto y descubre información detallada sobre cada uno. Explora y aprende de qué manera los factores del SARLAFT se manifiestan en el contexto logístico, fortaleciendo tu capacidad para prevenir, detectar y mitigar riesgos operativos y financieros dentro de la cadena de transporte.',
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
                        audioObjetivo: 'Señales de Alerta, Las señales de alerta son comportamientos o situaciones que nos indican que algo podría no estar bien y que existe un posible riesgo de lavado de activos o financiación del terrorismo. Identificarlas a tiempo ayuda a proteger a la organización y cumplir con la normativa.',
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
                    { id: 8, lessons: "Fundamentos", name: "El Rol de los Empleados", completed: false, type: "Video", duration: "01:26", },
                    { id: 9, lessons: "Fundamentos", name: "Consecuencias de No Aplicar SARLAFT", completed: false, type: "Video", duration: "01:26", },

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