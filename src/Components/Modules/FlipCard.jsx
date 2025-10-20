import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { TrainingLogiTransContext } from '../../Context';
import ModalFlipCard from './modalFlipCard';
import { Volume2, VolumeX, ChevronRight, ChevronLeft, BookOpen, Target, Lightbulb, Wrench, Lock, CheckCircle, X } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

/**
 * =============================================================================
 * FLIPCARD COMPONENT
 * =============================================================================
 * 
 * Componente principal que gestiona el aprendizaje interactivo mediante tarjetas
 * con reproducción de audio automática y seguimiento de progreso.
 * 
 * @param {Object} currentModule - Módulo actual con información de cards y audio
 * @param {Function} onContentIsEnded - Callback cuando se completa todo el contenido
 * @param {string|number} courseId - ID del curso actual
 * @param {string|number} moduleId - ID del módulo actual
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - Reproducción de audio con síntesis de voz en español
 * - Sistema de progreso con localStorage
 * - Navegación secuencial entre etapas
 * - Detección de dispositivos móviles
 * - Manejo de visibilidad y foco de ventana
 * - Reintentos automáticos en caso de error de audio
 */
function FlipCard({ currentModule, onContentIsEnded, courseId, moduleId }) {

    // =========================================================================
    // SECCIÓN 1: DATOS Y CONFIGURACIÓN INICIAL
    // =========================================================================

    const cards = currentModule.cards;
    const maxRetries = 10; // Número máximo de reintentos para el audio

    // =========================================================================
    // SECCIÓN 2: ESTADOS - Organizados por categoría
    // =========================================================================

    // --- Estados de UI y Dispositivo ---
    const [isMobile, setIsMobile] = useState(false);
    const [showAudioPopup, setShowAudioPopup] = useState(false);

    // --- Estados de Introducción ---
    const [introStarted, setIntroStarted] = useState(false);
    const [introPlayed, setIntroPlayed] = useState(false);

    // --- Estados de Audio y Voces ---
    const [mejorVoz, setMejorVoz] = useState(null);
    const [vocesCargadas, setVocesCargadas] = useState(false);
    const [audioFailed, setAudioFailed] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [audioCompletado, setAudioCompletado] = useState(false);

    // --- Estados de Navegación del Modal ---
    const [etapaAbierta, setEtapaAbierta] = useState(null);
    const [seccionActiva, setSeccionActiva] = useState('objetivo');

    // --- Estados de Progreso ---
    const [etapaActiva, setEtapaActiva] = useState(1);
    const [etapasCompletadas, setEtapasCompletadas] = useState([]);
    const [seccionesVistas, setSeccionesVistas] = useState({});

    // =========================================================================
    // SECCIÓN 3: REFERENCIAS
    // =========================================================================

    const synthRef = useRef(window.speechSynthesis);
    const pausedTextRef = useRef({ text: "" });
    const currentUtteranceRef = useRef(null);
    const audioRetryRef = useRef(0);

    // Referencia para mantener el estado del audio entre renderizados
    const audioStateRef = useRef({
        isPlaying: false,
        wasPaused: false
    });

    // =========================================================================
    // SECCIÓN 4: FUNCIONES DE LOCAL STORAGE
    // =========================================================================

    /**
     * Obtiene la clave para acceder al progreso del usuario
     * @returns {string} Clave del localStorage
     */
    const getProgressKey = () => `userProgress`;

    /**
     * Carga el progreso guardado del usuario desde localStorage
     * 
     * ESTRUCTURA DE DATOS:
     * {
     *   [courseId]: {
     *     flipCardProgress: {
     *       course_X: {
     *         module_Y: ["cardId-seccion-titulo", ...]
     *       }
     *     }
     *   }
     * }
     * 
     * @returns {Object} { seccionesVistas: {}, completadas: [] }
     */
    const loadProgress = () => {
        const key = getProgressKey();
        const existingProgress = localStorage.getItem(key);

        if (existingProgress) {
            try {
                const allProgress = JSON.parse(existingProgress);
                const userProgress = allProgress[courseId];

                if (!userProgress || !userProgress.flipCardProgress) {
                    console.warn(`⚠️ No hay progreso para el curso ${courseId}`);
                    return { seccionesVistas: {}, completadas: [] };
                }

                const courseProgress = userProgress.flipCardProgress[`course_${courseId}`] || {};
                const moduleProgress = courseProgress[`module_${moduleId}`] || [];

                // Procesar secciones vistas
                const seccionesVistasObj = {};
                const completadasPorCard = {};

                moduleProgress.forEach(entry => {
                    const parts = entry.split('-');
                    if (parts.length >= 3) {
                        const cardId = parseInt(parts[0]);
                        const seccion = parts[1];
                        const key = `${cardId}-${seccion}`;
                        seccionesVistasObj[key] = true;

                        if (!completadasPorCard[cardId]) {
                            completadasPorCard[cardId] = [];
                        }
                        completadasPorCard[cardId].push(seccion);
                    }
                });

                // Determinar cards completadas (todas las secciones vistas)
                const completadas = [];
                Object.keys(completadasPorCard).forEach(cardId => {
                    const secciones = completadasPorCard[cardId];
                    if (secciones.includes('objetivo') &&
                        secciones.includes('quehace') &&
                        secciones.includes('como') &&
                        secciones.includes('ejemplo')) {
                        completadas.push(parseInt(cardId));
                    }
                });

                console.log('📖 Progreso cargado:', { seccionesVistasObj, completadas });
                return { seccionesVistas: seccionesVistasObj, completadas };

            } catch (error) {
                console.error('❌ Error cargando progreso:', error);
                return { seccionesVistas: {}, completadas: [] };
            }
        }

        return { seccionesVistas: {}, completadas: [] };
    };

    /**
     * Guarda el progreso de una sección en localStorage
     * 
     * @param {number} cardId - ID de la card
     * @param {string} seccion - ID de la sección (objetivo, quehace, como, ejemplo)
     * @param {string} titulo - Título de la card
     */
    const saveProgress = (cardId, seccion, titulo) => {
        const key = getProgressKey();
        const existingProgress = localStorage.getItem(key);

        try {
            let allProgress = existingProgress ? JSON.parse(existingProgress) : {};

            // Inicializar estructura si no existe
            if (!allProgress[courseId]) {
                allProgress[courseId] = {
                    id: courseId,
                    flipCardProgress: {}
                };
            }

            if (!allProgress[courseId].flipCardProgress) {
                allProgress[courseId].flipCardProgress = {};
            }

            const courseKey = `course_${courseId}`;
            const moduleKey = `module_${moduleId}`;

            if (!allProgress[courseId].flipCardProgress[courseKey]) {
                allProgress[courseId].flipCardProgress[courseKey] = {};
            }

            if (!allProgress[courseId].flipCardProgress[courseKey][moduleKey]) {
                allProgress[courseId].flipCardProgress[courseKey][moduleKey] = [];
            }

            // Agregar entrada si no existe
            const entry = `${cardId}-${seccion}-${titulo}`;
            const moduleProgress = allProgress[courseId].flipCardProgress[courseKey][moduleKey];

            if (!moduleProgress.includes(entry)) {
                moduleProgress.push(entry);
                localStorage.setItem(key, JSON.stringify(allProgress));
                console.log(`💾 Progreso guardado: ${entry}`);
            }

        } catch (error) {
            console.error('❌ Error guardando progreso:', error);
        }
    };

    // =========================================================================
    // SECCIÓN 5: FUNCIONES DE AUDIO - Síntesis de voz
    // =========================================================================

    /**
     * Detiene completamente la reproducción de audio actual
     */
    const stopAudio = () => {
        const synth = synthRef.current;
        if (synth.speaking) {
            try {
                synth.cancel();
                console.log('🛑 Audio detenido');
            } catch (error) {
                console.error('Error deteniendo audio:', error);
            }
        }
        setIsPlayingAudio(false);
        setIsPaused(false);
        audioStateRef.current.isPlaying = false;
    };

    /**
     * Reproduce texto usando síntesis de voz con reintentos automáticos
     * 
     * COMPORTAMIENTO:
     * - Usa la mejor voz disponible en español
     * - Reintenta automáticamente en caso de error (máx 10 veces)
     * - No reintenta si el error es por interrupción del usuario
     * - Maneja estados de reproducción y pausa
     * 
     * @param {string} text - Texto a reproducir
     * @param {Function} onEnd - Callback al finalizar exitosamente
     * @param {Function} onError - Callback en caso de error definitivo
     */
    const speak = (text, onEnd, onError) => {
        if (!vocesCargadas || !mejorVoz) {
            console.warn('⚠️ Voces aún no cargadas');
            setAudioFailed(true);
            setShowAudioPopup(true);
            if (onError) onError();
            return;
        }

        const synth = synthRef.current;

        // Cancelar audio anterior si existe
        if (synth.speaking) {
            try {
                synth.cancel();
                console.log('⚠️ Audio anterior cancelado');
            } catch (error) {
                console.error('Error cancelando audio previo:', error);
            }
        }

        // Configurar utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = mejorVoz;
        utterance.lang = mejorVoz.lang || 'es-ES';
        utterance.rate = 0.9;  // Velocidad de reproducción
        utterance.pitch = 1;   // Tono de voz

        pausedTextRef.current.text = text;
        currentUtteranceRef.current = utterance;

        // Evento: inicio de reproducción
        utterance.onstart = () => {
            setIsPlayingAudio(true);
            setIsPaused(false);
            audioStateRef.current.isPlaying = true;
            audioRetryRef.current = 0;
            console.log('▶️ Audio iniciado');
            setShowAudioPopup(false);
        };

        // Evento: fin de reproducción
        utterance.onend = () => {
            setIsPlayingAudio(false);
            setIsPaused(false);
            audioStateRef.current.isPlaying = false;
            console.log('✅ Audio finalizado');
            setShowAudioPopup(false);
            if (onEnd) onEnd();
        };

        // Evento: error en reproducción
        utterance.onerror = (e) => {
            const isInterrupted = e.error === 'interrupted';
            setShowAudioPopup(true);
            console.error('❌ Error de síntesis:', e.error);

            // Reintentar si no fue interrumpido y no se alcanzó el límite
            if (!isInterrupted && audioRetryRef.current < maxRetries) {
                audioRetryRef.current++;
                console.log(`🔄 Reintentando audio (${audioRetryRef.current}/${maxRetries})...`);

                setTimeout(() => {
                    if (audioRetryRef.current <= maxRetries) {
                        try {
                            synth.speak(utterance);
                        } catch (error) {
                            console.error('Error en reintento:', error);
                        }
                    }
                }, 800);
            } else if (audioRetryRef.current >= maxRetries) {
                handleAudioFailed(onError);
            }
        };
        // ⏸️ Evento: Audio pausado
        utterance.onpause = () => {
            console.log('⏸️ Audio pausado');
        };

        // ▶️ Evento: Audio reanudado
        utterance.onresume = () => {
            setIsPaused(false);
            audioStateRef.current.wasPaused = false;
            console.log('▶️ Audio reanudado (evento)');
        };

        // Iniciar reproducción
        try {
            synth.speak(utterance);
        } catch (error) {
            setShowAudioPopup(true);
            console.error('❌ Error al hablar:', error);
            handleAudioFailed(onError);
        }
    };

    /**
     * Maneja el fallo definitivo de audio después de agotar reintentos
     * @param {Function} onError - Callback de error
     */
    const handleAudioFailed = (onError) => {
        setIsPlayingAudio(false);
        setIsPaused(false);
        setAudioFailed(true);
        audioStateRef.current.isPlaying = false;
        audioRetryRef.current = 0;

        if (onError) onError();
    };

    /**
     * Reproduce audio de una sección y guarda el progreso automáticamente
     * 
     * @param {string} text - Texto a reproducir
     * @param {number} cardId - ID de la card
     * @param {string} seccionId - ID de la sección
     * @param {string} titulo - Título de la card
     * @param {Function} onError - Callback de error
     */
    const speakAndSave = (text, cardId, seccionId, titulo, onError) => {
        const key = `${cardId}-${seccionId}`;

        speak(text, () => {
            // Guardar progreso al completar
            saveProgress(cardId, seccionId, titulo);
            setAudioCompletado(true);

            // Actualizar secciones vistas
            const updatedVistas = { ...seccionesVistas, [key]: true };
            setSeccionesVistas(updatedVistas);

            // Verificar si la card está completa
            verificarCardCompleta(cardId, updatedVistas);
        }, onError);
    };

    /**
     * Verifica si una card tiene todas sus secciones completadas
     * Si está completa, la marca como completada y desbloquea la siguiente
     * 
     * @param {number} cardId - ID de la card a verificar
     * @param {Object} currentVistas - Estado actual de secciones vistas
     */
    const verificarCardCompleta = (cardId, currentVistas = null) => {
        const secciones = ['objetivo', 'quehace', 'como', 'ejemplo'];
        const vistasActuales = currentVistas || seccionesVistas;

        // Verificar si todas las secciones fueron vistas
        const todasVistas = secciones.every(s => vistasActuales[`${cardId}-${s}`]);

        if (todasVistas && !etapasCompletadas.includes(cardId)) {
            console.log(`✅ Card ${cardId} completada!`);
            setEtapasCompletadas(prev => [...prev, cardId]);

            // Desbloquear siguiente etapa
            if (cardId < cards.length) {
                setEtapaActiva(cardId + 1);
            }

            // Si es la última etapa, notificar finalización
            if (cardId === cards.length) {
                console.log("🎉 Última etapa completada, guardando definitivamente...");

                setTimeout(() => {
                    console.log("🚀 Llamando a onContentIsEnded");
                    if (onContentIsEnded) onContentIsEnded();
                }, 800);
            }
        }
    };

    // =========================================================================
    // SECCIÓN 6: FUNCIONES DE NAVEGACIÓN DEL MODAL
    // =========================================================================

    /**
     * Abre una etapa (card) y reproduce su audio de objetivo
     * @param {number} etapaId - ID de la etapa a abrir
     */
    const abrirEtapa = (etapaId) => {
        stopAudio();
        setEtapaAbierta(etapaId);
        setSeccionActiva('objetivo');
        setAudioCompletado(false);

        const etapa = cards.find(e => e.id === etapaId);
        if (etapa) {
            speakAndSave(etapa.audioObjetivo, etapaId, 'objetivo', etapa.titulo, () => {
                setAudioCompletado(true);
            });
        }
    };

    /**
     * Cierra el modal de etapa y detiene el audio
     */
    const cerrarEtapa = () => {
        stopAudio();
        setEtapaAbierta(null);
        setSeccionActiva('objetivo');
        setAudioCompletado(false);
    };

    /**
     * Navega a la sección anterior dentro de una etapa
     */
    const irSeccionAnterior = () => {
        stopAudio();

        const etapa = cards.find(e => e.id === etapaAbierta);
        if (!etapa) return;

        const secciones = ['objetivo', ...etapa.secciones.map(s => s.id)];
        const indexActual = secciones.indexOf(seccionActiva);

        if (indexActual > 0) {
            const seccionAnterior = secciones[indexActual - 1];
            setSeccionActiva(seccionAnterior);
            setAudioCompletado(false);

            // Reproducir audio de la sección anterior
            if (seccionAnterior === 'objetivo') {
                speakAndSave(etapa.audioObjetivo, etapaAbierta, 'objetivo', etapa.titulo, () => {
                    setAudioCompletado(true);
                });
            } else {
                const seccionData = etapa.secciones.find(s => s.id === seccionAnterior);
                if (seccionData) {
                    speakAndSave(seccionData.audio, etapaAbierta, seccionAnterior, etapa.titulo, () => {
                        setAudioCompletado(true);
                    });
                }
            }
        }
    };

    /**
     * Navega a la siguiente sección dentro de una etapa
     */
    const irSeccionSiguiente = () => {
        stopAudio();

        const etapa = cards.find(e => e.id === etapaAbierta);
        if (!etapa) return;

        const secciones = ['objetivo', ...etapa.secciones.map(s => s.id)];
        const indexActual = secciones.indexOf(seccionActiva);

        if (indexActual < secciones.length - 1) {
            const seccionSiguiente = secciones[indexActual + 1];
            setSeccionActiva(seccionSiguiente);
            setAudioCompletado(false);

            // Reproducir audio de la siguiente sección
            const seccionData = etapa.secciones.find(s => s.id === seccionSiguiente);
            if (seccionData) {
                speakAndSave(seccionData.audio, etapaAbierta, seccionSiguiente, etapa.titulo, () => {
                    setAudioCompletado(true);
                });
            }
        }
    };

    /**
     * Navega directamente a una sección específica
     * Solo permite navegar a secciones ya vistas (excepto objetivo)
     * 
     * @param {string} seccionId - ID de la sección destino
     */
    const irASeccion = (seccionId) => {
        const key = `${etapaAbierta}-${seccionId}`;

        // Bloquear secciones no vistas (excepto objetivo)
        if (seccionId !== 'objetivo' && !seccionesVistas[key]) {
            return;
        }

        stopAudio();
        setSeccionActiva(seccionId);
        setAudioCompletado(false);

        const etapa = cards.find(e => e.id === etapaAbierta);
        if (!etapa) return;

        // Reproducir audio de la sección seleccionada
        if (seccionId === 'objetivo') {
            speakAndSave(etapa.audioObjetivo, etapaAbierta, 'objetivo', etapa.titulo, () => {
                setAudioCompletado(true);
            });
        } else {
            const seccionData = etapa.secciones.find(s => s.id === seccionId);
            if (seccionData) {
                speakAndSave(seccionData.audio, etapaAbierta, seccionId, etapa.titulo, () => {
                    setAudioCompletado(true);
                });
            }
        }
    };

    // =========================================================================
    // SECCIÓN 7: FUNCIONES AUXILIARES
    // =========================================================================

    /**
     * Inicia la introducción en dispositivos móviles
     * (requiere interacción del usuario por políticas del navegador)
     */
    const iniciarIntroMovil = () => {
        if (!introStarted && vocesCargadas) {
            setIntroStarted(true);
            speak(currentModule.audioObjetivo, () => {
                setIntroPlayed(true);
            });
        }
    };

    // =========================================================================
    // SECCIÓN 8: EFFECTS - Inicialización y eventos
    // =========================================================================

    /**
     * EFFECT: Carga y selección de voces en español
     * Prioriza voces Microsoft Natural y femeninas
     */
    useEffect(() => {
        const synth = window.speechSynthesis;

        const cargarVoces = () => {
            const voices = synth.getVoices();

            if (!voices.length) {
                console.log('🔄 Reintentando cargar voces...');
                setTimeout(cargarVoces, 300);
                return;
            }

            const vocesEspanol = voices.filter(v => v.lang.toLowerCase().startsWith('es'));

            // Prioridad de voces Microsoft Natural
            const prioridadMicrosoft = [
                'Microsoft Andrea Online (Natural) - Spanish (Ecuador)',
                'Microsoft Dalia Online (Natural) - Spanish (Mexico)',
                'Microsoft Salome Online (Natural) - Spanish (Colombia)',
                'Microsoft Catalina Online (Natural) - Spanish (Chile)',
                'Microsoft Camila Online (Natural) - Spanish (Peru)',
                'Microsoft Paola Online (Natural) - Spanish (Venezuela)',
            ];

            let mejorOpcion = null;

            // Buscar voz de prioridad
            for (const nombre of prioridadMicrosoft) {
                mejorOpcion = vocesEspanol.find(v => v.name.toLowerCase().includes(nombre.toLowerCase()));
                if (mejorOpcion) break;
            }

            // Fallback: buscar voces femeninas
            if (!mejorOpcion) {
                const vocesFemeninas = vocesEspanol.filter(v =>
                    /(female|mujer|paulina|monica|soledad|camila|lucia|maría|carla|rosa|laura|catalina|dalia|salome|andrea|paola|google|microsoft)/i.test(v.name)
                );

                mejorOpcion =
                    vocesFemeninas.find(v => v.name.toLowerCase().includes('monica')) ||
                    vocesFemeninas.find(v => v.name.toLowerCase().includes('camila')) ||
                    vocesFemeninas.find(v => v.name.toLowerCase().includes('andrea')) ||
                    vocesFemeninas.find(v => v.name.toLowerCase().includes('salome')) ||
                    vocesFemeninas[0] ||
                    vocesEspanol[0];
            }

            if (mejorOpcion) {
                setMejorVoz(mejorOpcion);
                setVocesCargadas(true);
                console.log(`✅ Voz seleccionada: ${mejorOpcion.name} [${mejorOpcion.lang}]`);
            } else {
                console.warn('⚠️ No se encontró ninguna voz en español.');
            }
        };

        cargarVoces();
        synth.onvoiceschanged = cargarVoces;

        // Forzar carga al primer clic del usuario
        const handleUserInteraction = () => {
            console.log('👆 Usuario hizo clic: forzando carga de voces...');
            cargarVoces();
            document.removeEventListener('click', handleUserInteraction);
        };
        document.addEventListener('click', handleUserInteraction);

        return () => {
            synth.onvoiceschanged = null;
            document.removeEventListener('click', handleUserInteraction);
        };
    }, []);

    /**
     * EFFECT: Carga el progreso guardado cuando las voces estén listas
     */
    useEffect(() => {
        if (vocesCargadas) {
            const savedProgress = loadProgress();
            setSeccionesVistas(savedProgress.seccionesVistas);
            setEtapasCompletadas(savedProgress.completadas);

            // Determinar etapa activa según progreso
            if (savedProgress.completadas.length > 0) {
                const ultimaCompletada = Math.max(...savedProgress.completadas);
                setEtapaActiva(ultimaCompletada < cards.length ? ultimaCompletada + 1 : cards.length);
            } else {
                setEtapaActiva(1);
            }
        }
    }, [vocesCargadas]);

    /**
     * EFFECT: Inicia la introducción automáticamente en desktop
     */
    useEffect(() => {
        if (!isMobile && vocesCargadas && !introStarted) {
            setIntroStarted(true);
        }
    }, [vocesCargadas, isMobile]);

    /**
     * EFFECT: Reproduce el audio de introducción
     */
    useEffect(() => {
        if (!isMobile && vocesCargadas && introStarted && !introPlayed) {
            console.log('🎬 Reproduciendo intro...');
            speak(currentModule.audioObjetivo, () => {
                console.log('✅ Intro terminada');
                setIntroPlayed(true);
            });
        }
    }, [isMobile, vocesCargadas, introStarted, introPlayed]);

    /**
     * EFFECT: Detecta si el dispositivo es móvil
     */
    useEffect(() => {
        const checkMobile = () => {
            const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
            setIsMobile(isMobileDevice);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    /**
         * useEffect: Detectar cuando el usuario cambia de pestaña
         */
    useEffect(() => {
        const handleVisibilityChange = () => {
            const synth = synthRef.current;

            if (document.hidden) {
                // Usuario cambió de pestaña
                if (synth.speaking && !synth.paused) {
                    console.log('👁️ Página oculta: pausando audio...');
                    synth.pause();
                    setIsPaused(true);
                    audioStateRef.current.wasPaused = true;
                }
            } else {
                // Usuario regresó a la pestaña
                if (audioStateRef.current.wasPaused && audioStateRef.current.isPlaying) {
                    console.log('👁️ Página visible: intentando reanudar audio...');
                    setTimeout(() => {
                        try {
                            synth.resume();
                            setIsPaused(false);
                            audioStateRef.current.wasPaused = false;
                            console.log('✅ Resume ejecutado');
                        } catch (error) {
                            console.error('❌ Error al reanudar:', error);
                        }
                    }, 100);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    /**
     *  useEffect: Detectar cuando la ventana pierde/recupera el foco
     * 
     */
    useEffect(() => {
        const handleBlur = () => {
            const synth = synthRef.current;
            if (synth.speaking && !synth.paused) {
                console.log('🔇 Ventana perdió el foco: pausando...');
                synth.pause();
                setIsPaused(true);
                audioStateRef.current.wasPaused = true;
                // ✅ NOTA: NO se marca wasCancelled = true aquí
                // Esto permite que si el usuario regresa, el progreso se guarde
            }
        };

        const handleFocus = () => {
            const synth = synthRef.current;
            if (audioStateRef.current.wasPaused && audioStateRef.current.isPlaying) {
                console.log('🔊 Ventana recuperó el foco: intentando reanudar...');
                setTimeout(() => {
                    try {
                        synth.resume();
                        setIsPaused(false);
                        audioStateRef.current.wasPaused = false;
                        console.log('✅ Resume ejecutado');
                    } catch (error) {
                        console.error('❌ Error al reanudar:', error);
                    }
                }, 100);
            }
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    /**
     *  useEffect: Cancelar audio al cerrar página o desmontar componente
     * 
     */
    useEffect(() => {
        const handleBeforeUnload = () => {
            const synth = synthRef.current;
            if (synth.speaking) {
                console.log('🛑 Cerrando página: cancelando audio...');
                // 🚩 Marcar como cancelado para que NO se guarde el progreso
                if (currentUtteranceRef.current)
                    currentUtteranceRef.current.wasCancelled = true;
                synth.cancel();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup al desmontar el componente
        return () => {
            const synth = synthRef.current;
            if (synth.speaking) {
                console.log('🧹 Componente desmontado: cancelando audio...');
                synth.cancel();
            }
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // =========================================================================
    // SECCIÓN 9: VARIABLES COMPUTADAS PARA RENDERIZADO
    // =========================================================================

    const isPlayingIntro = introStarted && !introPlayed && isPlayingAudio;
    const showCards = introPlayed || audioFailed;
    const etapaActualData = etapaAbierta ? cards.find(e => e.id === etapaAbierta) : null;

    // =========================================================================
    // SECCIÓN 10: RENDERIZADO CONDICIONAL - Loading
    // =========================================================================

    if (!vocesCargadas) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-slate-400 text-lg animate-pulse">
                    Cargando voces en español...
                </p>
            </div>
        );
    }

    // =========================================================================
    // SECCIÓN 11: RENDERIZADO PRINCIPAL
    // =========================================================================

    return (
        <div className="w-full mx-auto pt-10 pb-14 lg:pb-0">

            {/* ====== BOTÓN INICIAL MÓVIL ====== */}
            {isMobile && !introStarted && (
                <div
                    onClick={iniciarIntroMovil}
                    className="relative w-full flex items-center justify-center rounded-xl cursor-pointer min-h-[400px]"
                    data-aos="fade-up"
                >
                    <div className="text-center py-2 z-10">
                        <p className="text-white text-2xl md:text-3xl font-light animate-pulse">
                            Click para iniciar
                        </p>
                    </div>
                </div>
            )}

            {/* ====== TÍTULO Y DESCRIPCIÓN DEL MÓDULO ====== */}
            {introStarted && (
                <div className="text-center px-6 py-2 max-w-5xl mx-auto animate-fadeIn" data-aos="fade-up">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-0">
                        {currentModule.name}
                    </h1>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                        {currentModule.objetivo}
                    </p>
                </div>
            )}

            {/* ====== SKELETON LOADING (Durante reproducción de intro) ====== */}
            {isPlayingIntro && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-aos="fade-up">
                    {cards.map((etapa) => (
                        <div
                            key={etapa.id}
                            className="relative flex flex-col items-center justify-center p-6 rounded-2xl border-1 border-[#2c2c2f] bg-[#121214] overflow-hidden"
                        >
                            {/* Efecto de carga animado */}
                            <div className="absolute inset-0 rounded-2xl bg-[#3a3a3f]/40 animate-pulse-radial"></div>

                            {/* Ícono skeleton */}
                            <div className="relative w-16 h-16 mb-3 rounded-full bg-[#1f1f23] overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#2c2c2f] via-[#3a3a3f] to-[#2c2c2f] rounded-full animate-pulse-delay"></div>
                            </div>

                            {/* Líneas de texto skeleton */}
                            <div className="w-full space-y-2 mt-2">
                                <div className="h-3 bg-[#1f1f23] rounded w-1/3 mx-auto animate-pulse delay-75"></div>
                                <div className="h-5 bg-[#1f1f23] rounded w-2/3 mx-auto animate-pulse delay-150"></div>
                                <div className="h-4 bg-[#1f1f23] rounded w-4/5 mx-auto mt-4 animate-pulse delay-200"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ====== GRID DE CARDS (Etapas) ====== */}
            {showCards && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-aos="fade-up">
                    {cards.map((etapa) => {
                        const estaBloqueada = etapa.id > etapaActiva;
                        const estaCompletada = etapasCompletadas.includes(etapa.id);

                        return (
                            <button
                                key={etapa.id}
                                onClick={() => !estaBloqueada && abrirEtapa(etapa.id)}
                                disabled={estaBloqueada}
                                className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300
                                ${estaBloqueada
                                        ? 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed'
                                        : `bg-gradient-to-br ${etapa.color} border-transparent hover:scale-105 hover:shadow-2xl cursor-pointer`
                                    }`}
                            >
                                {/* Indicador: Bloqueada */}
                                {estaBloqueada && (
                                    <Lock size={24} className="absolute top-3 right-3 text-slate-500" />
                                )}

                                {/* Indicador: Completada */}
                                {estaCompletada && (
                                    <CheckCircle size={24} className="absolute top-3 right-3 text-green-400" />
                                )}

                                {/* Ícono de la etapa */}
                                <div className="text-5xl mb-3">{etapa.icono}</div>

                                {/* Contenido de la card */}
                                <div className="text-white text-center flex flex-col items-center">
                                    <div className="text-xs opacity-75 mb-1">{etapa.numero}</div>
                                    <div className="font-bold text-lg">{etapa.titulo}</div>

                                    {/* Estados de la card */}
                                    {estaBloqueada ? (
                                        <div className="text-xs opacity-90 text-center mt-2">
                                            <p>Completa la etapa anterior</p>
                                        </div>
                                    ) : estaCompletada ? (
                                        <div className="text-sm text-zinc-300 text-center flex items-center gap-2 mt-2">
                                            <span>Etapa completada - Click para revisar</span>
                                        </div>
                                    ) : (
                                        <div className="mt-4 flex justify-center items-center gap-2 text-sm opacity-75 animate-bounce">
                                            <span>Click para comenzar</span>
                                            <ChevronRight size={20} />
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ====== MODAL DE ETAPA ====== */}
            {etapaAbierta && etapaActualData && (() => {
                // Calcular estado de navegación
                const siguienteEsUltima = seccionActiva ===
                    etapaActualData.secciones[etapaActualData.secciones.length - 1]?.id;

                const puedeAvanzar = audioCompletado ||
                    seccionesVistas[`${etapaAbierta}-${seccionActiva}`];

                const bottonSiguienteDisabled = !puedeAvanzar || siguienteEsUltima;

                return (
                    <ModalFlipCard etapaActualData={etapaActualData} onClose={cerrarEtapa}>

                        {/* ====== CONTENIDO DEL MODAL ====== */}
                        <div className="p-2 md:p-4 space-y-2">

                            {/* --- Sección: Objetivo --- */}
                            {seccionActiva === 'objetivo' && (
                                <div className="space-y-2 animate-fadeIn">
                                    <div className="flex items-center gap-2 text-zinc-200 mb-1">
                                        <Target size={20} />
                                        <h3 className="text-md md:text-2xl font-bold">Objetivo</h3>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed text-sm md:text-lg">
                                        {etapaActualData.objetivo}
                                    </p>
                                </div>
                            )}

                            {/* --- Otras Secciones (Qué hace, Cómo, Ejemplo) --- */}
                            {seccionActiva && seccionActiva !== 'objetivo' && (
                                <div className="space-y-3 animate-fadeIn">
                                    {(() => {
                                        const seccionData = etapaActualData.secciones.find(s => s.id === seccionActiva);
                                        if (!seccionData) return null;

                                        return (
                                            <>
                                                {/* Título de la sección */}
                                                <div className="flex items-center gap-2 text-zinc-300 mb-4">
                                                    {seccionData.icono}
                                                    <h3 className="text-lg md:text-2xl font-bold">{seccionData.titulo}</h3>
                                                </div>

                                                {/* Contenido de la sección */}
                                                {seccionData.contenido.map((item, idx) => (
                                                    <div key={idx} className="bg-zinc-800 rounded-lg p-5 border border-zinc-700">
                                                        {item.subtitulo && (
                                                            <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm md:text-lg">
                                                                <span className="text-zinc-300">•</span>
                                                                {item.subtitulo}
                                                            </h4>
                                                        )}
                                                        <p className="text-slate-300 leading-relaxed text-sm md:text-lg">
                                                            {item.texto}
                                                        </p>
                                                    </div>
                                                ))}
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* ====== CONTROLES DE NAVEGACIÓN ====== */}
                        <div className="bg-[#151518] border-t-2 border-slate-700 p-4">
                            <div className="flex items-center justify-between gap-1 md:gap-4">

                                {/* --- Botón: Anterior --- */}
                                <button
                                    onClick={irSeccionAnterior}
                                    disabled={seccionActiva === 'objetivo'}
                                    className={`flex items-center gap-2 px-1 md:px-4 py-2 rounded-lg font-medium transition-all ${seccionActiva === 'objetivo'
                                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                        : 'bg-slate-700 text-white hover:bg-slate-600'
                                        }`}
                                >
                                    <ChevronLeft size={20} />
                                    <span className='hidden md:block'>Anterior</span>
                                </button>

                                {/* --- Botones de Secciones --- */}
                                <div className="flex gap-2 flex-wrap justify-center">

                                    {/* Botón: Objetivo */}
                                    <button
                                        onClick={() => irASeccion('objetivo')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${seccionActiva === 'objetivo'
                                            ? `${etapaActualData.colorSolido} text-white`
                                            : seccionesVistas[`${etapaAbierta}-objetivo`]
                                                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                            }`}
                                    >
                                        Objetivo
                                        {seccionesVistas[`${etapaAbierta}-objetivo`] && (
                                            <CheckCircle size={14} className="absolute -top-1 -right-1 text-green-400" />
                                        )}
                                    </button>

                                    {/* Botones: Otras secciones */}
                                    {etapaActualData.secciones.map((s) => {
                                        const seccionVista = seccionesVistas[`${etapaAbierta}-${s.id}`];

                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => irASeccion(s.id)}
                                                disabled={!seccionVista}
                                                className={`px-2 md:px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${seccionActiva === s.id
                                                    ? `${etapaActualData.colorSolido} text-white`
                                                    : seccionVista
                                                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                                    }`}
                                                title={s.titulo}
                                            >
                                                <span className="flex items-center gap-1">
                                                    {s.icono}
                                                </span>
                                                {seccionVista && (
                                                    <CheckCircle size={14} className="absolute -top-1 -right-1 text-green-400" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* --- Botón: Siguiente --- */}
                                <button
                                    onClick={irSeccionSiguiente}
                                    disabled={bottonSiguienteDisabled}
                                    className={`flex items-center gap-2 px-1 md:px-4 py-2 rounded-lg font-medium transition-all ${bottonSiguienteDisabled
                                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                        : 'bg-slate-700 text-white hover:bg-slate-600'
                                        }`}
                                >
                                    <span className='hidden md:block'>Siguiente</span>
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* ====== POPUP DE AUDIO (Notificación de reintento) ====== */}
                        {showAudioPopup && (
                            <div
                                className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg text-sm text-center animate-pulse z-[9999]"
                            >
                                🔊 <strong>Estamos intentando reproducir el audio...</strong><br />
                                Si el problema persiste, cierra esta etapa y vuelve a cargarla.
                            </div>
                        )}

                    </ModalFlipCard>
                );
            })()}

        </div>
    );
}

export default FlipCard;