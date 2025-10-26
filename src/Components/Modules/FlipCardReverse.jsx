import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { TrainingLogiTransContext } from '../../Context';
import { Volume2, VolumeX, ChevronRight, ChevronLeft, BookOpen, Target, Lightbulb, Wrench, Lock, CheckCircle, X } from 'lucide-react';

import AOS from 'aos';
import 'aos/dist/aos.css';

/**
 * 🎴 FlipCardReverse Component
 * 
 * Componente interactivo de tarjetas educativas con las siguientes características:
 * - Sistema de tarjetas que se voltean (flip) al hacer clic
 * - Reproducción automática de audio usando síntesis de voz del navegador
 * - Sistema de progreso: las tarjetas se desbloquean secuencialmente
 * - Persistencia del progreso en localStorage
 * - Adaptación para dispositivos móviles y desktop
 * - Manejo inteligente de audio cuando el usuario cambia de pestaña/ventana
 * 
 * @param {Object} currentModule - Módulo actual con las tarjetas y configuración
 * @param {Function} onContentIsEnded - Callback que se ejecuta al completar todas las tarjetas
 * @param {String} courseId - ID del curso actual
 * @param {String} moduleId - ID del módulo actual
 */
function FlipCardReverse({ currentModule, onContentIsEnded, courseId, moduleId }) {
    const location = useLocation();

    // 📦 DATOS: Array de tarjetas del módulo actual
    let cards = currentModule.cards;
    const maxRetries = 10;
    // 📱 ESTADO: Detección de dispositivo móvil
    const [isMobile, setIsMobile] = useState(false);
    const [showAudioPopup, setShowAudioPopup] = useState(false);

    // 🎬 ESTADO: Control de la introducción (audio inicial)
    const [introStarted, setIntroStarted] = useState(false); // Si ya se inició la intro
    const [introPlayed, setIntroPlayed] = useState(false);   // Si ya terminó la intro

    // 🔓 ESTADO: Control de tarjetas desbloqueadas
    const [unlockedCards, setUnlockedCards] = useState([]);

    // 🎤 ESTADO: Control de voces del navegador
    const [mejorVoz, setMejorVoz] = useState(null);         // Voz seleccionada para usar
    const [vocesCargadas, setVocesCargadas] = useState(false); // Si las voces ya están disponibles
    const [audioFailed, setAudioFailed] = useState(false);  // Si hubo error con el audio

    // 🔊 ESTADO: Control de reproducción de audio
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // 🎴 ESTADO: Control de tarjetas volteadas y completadas
    const [flippedCards, setFlippedCards] = useState([]);    // Tarjetas actualmente volteadas (mostrando reverso)
    const [activeCard, setActiveCard] = useState(null);      // ID de la tarjeta con audio reproduciéndose
    const [completedCards, setCompletedCards] = useState([]); // Tarjetas que ya fueron completadas

    // 🔗 REFERENCIAS: Objetos que persisten entre re-renders
    const synthRef = useRef(window.speechSynthesis);         // API de síntesis de voz
    const pausedTextRef = useRef({ text: "" });              // Texto que se estaba reproduciendo
    const currentUtteranceRef = useRef(null);
    const audioRetryRef = useRef(0);               // Utterance actual (objeto de audio)
    const audioStateRef = useRef({
        isPlaying: false,  // Si hay audio reproduciéndose
        wasPaused: false   // Si el audio fue pausado por pérdida de foco
    });
    const previousModuleIdRef = useRef(moduleId); // 🔥 NUEVO
    const isNavigatingRef = useRef(false); // 🔥 NUEVO
    const introAudioRef = useRef(null);

    // ==============================================================
    // 💾 FUNCIONES DE PERSISTENCIA (localStorage)
    // ==============================================================

    /**
     * 🔑 Obtiene la clave para guardar/leer progreso en localStorage
     * @returns {String} Clave única para el progreso del usuario
     */
    const getProgressKey = () => `userProgress`;

    /**
     * 💾 Guarda el progreso de una tarjeta completada en localStorage
     * 
     * Estructura del progreso guardado:
     * {
     *   [courseId]: {
     *     id: courseId,
     *     title: "Título del curso",
     *     cumplimiento: 0,
     *     startedAt: "2024-01-01T00:00:00.000Z",
     *     lastAccessAt: "2024-01-01T00:00:00.000Z",
     *     currentModule: moduleId,
     *     completedModules: [],
     *     flipCardProgress: {},
     *     flipCardReverseProgress: {
     *       course_X: {
     *         module_Y: ["1-Título Card 1", "2-Título Card 2", ...]
     *       }
     *     }
     *   }
     * }
     * 
     * @param {Number} cardId - ID de la tarjeta completada
     */
    const updateFlipCardReverseProgress = (cardId) => {
        const key = getProgressKey();
        const existingProgress = localStorage.getItem(key);

        // Crear clave única para la tarjeta: "ID-Título"
        const cardTitle = cards.find(c => c.id === cardId)?.title || "";
        const cardKey = `${cardId}-${cardTitle}`;

        // Obtener o crear estructura de progreso
        let allProgress = existingProgress ? JSON.parse(existingProgress) : {};

        // Crear entrada del curso si no existe
        if (!allProgress[courseId]) {
            allProgress[courseId] = {
                id: courseId,
                title: currentModule.title || "",
                cumplimiento: 0,
                startedAt: new Date().toISOString(),
                lastAccessAt: new Date().toISOString(),
                currentModule: moduleId,
                completedModules: [],
                flipCardProgress: {},
                flipCardReverseProgress: {},
                dragDropProgress: {},
                dragDropOrderProgress: {},
            };
        }

        const userProgress = allProgress[courseId];

        // Crear estructura de progreso por curso y módulo si no existe
        if (!userProgress.flipCardReverseProgress[`course_${courseId}`]) {
            userProgress.flipCardReverseProgress[`course_${courseId}`] = {};
        }

        if (!userProgress.flipCardReverseProgress[`course_${courseId}`][`module_${moduleId}`]) {
            userProgress.flipCardReverseProgress[`course_${courseId}`][`module_${moduleId}`] = [];
        }

        const moduleProgress = userProgress.flipCardReverseProgress[`course_${courseId}`][`module_${moduleId}`];

        // Agregar la tarjeta si no está ya en el progreso
        if (!moduleProgress.includes(cardKey)) {
            moduleProgress.push(cardKey);
        }

        // Actualizar fecha de último acceso
        userProgress.lastAccessAt = new Date().toISOString();

        // Guardar en localStorage
        localStorage.setItem(key, JSON.stringify(allProgress));
        console.log(`✅ Progreso guardado: curso ${courseId} módulo ${moduleId} -> ${cardKey}`);
    };

    /**
     * 📖 Carga el progreso guardado desde localStorage
     * 
     * @returns {Object} Objeto con arrays de tarjetas:
     *   - flipped: Tarjetas volteadas (siempre vacío al cargar)
     *   - unlocked: IDs de tarjetas desbloqueadas
     *   - completed: IDs de tarjetas completadas
     */
    const loadFlipCardReverseProgress = () => {
        const key = getProgressKey();
        const existingProgress = localStorage.getItem(key);

        if (existingProgress) {
            try {
                const allProgress = JSON.parse(existingProgress);
                const userProgress = allProgress[courseId];

                // Validar que exista progreso para este curso
                if (!userProgress || !userProgress.flipCardReverseProgress) {
                    console.warn(`⚠️ No hay progreso para el curso ${courseId}`);
                    return { flipped: [], unlocked: [1], completed: [] };
                }

                // Obtener progreso específico del módulo actual
                const courseProgress = userProgress.flipCardReverseProgress[`course_${courseId}`] || {};
                const moduleProgress = courseProgress[`module_${moduleId}`] || [];

                // Extraer IDs de tarjetas completadas (parsear "1-Título" -> 1)
                const completedCardIds = moduleProgress.map(cardKey => {
                    const id = parseInt(cardKey.match(/^\d+/)?.[0]);
                    return id;
                });

                // Calcular qué tarjeta desbloquear siguiente
                const lastCompleted = completedCardIds.length > 0 ? Math.max(...completedCardIds) : 0;
                const nextUnlocked = lastCompleted + 1;

                // Construir array de tarjetas desbloqueadas
                // (todas las completadas + la siguiente si existe)
                const unlocked =
                    nextUnlocked <= cards.length
                        ? [...completedCardIds, nextUnlocked]
                        : [...completedCardIds];

                console.log('📖 Cards completadas cargadas:', completedCardIds);
                console.log('🔓 Cards desbloqueadas:', unlocked);

                return { flipped: [], unlocked, completed: completedCardIds };
            } catch (error) {
                console.error('❌ Error cargando progreso:', error);
                return { flipped: [], unlocked: [1], completed: [] };
            }
        }

        // Si no hay progreso guardado, desbloquear solo la primera tarjeta
        return { flipped: [], unlocked: [1], completed: [] };
    };

    // ==============================================================
    // 🧠 EFFECTS: Lógica de inicialización y carga de datos
    // ==============================================================

    /**
     * 🧠 useEffect: Cargar progreso guardado al montar el componente
     * 
     * Se ejecuta UNA SOLA VEZ cuando:
     * - Las voces ya están cargadas (vocesCargadas = true)
     * - La intro aún no ha iniciado (introStarted = false)
     * 
     * Comportamiento:
     * - Desktop SIN progreso: Inicia intro automáticamente
     * - Desktop CON progreso: Inicia sin reproducir intro (salta al contenido)
     * - Mobile: No hace nada aquí (espera interacción del usuario)
     */
    useEffect(() => {
        if (vocesCargadas && !introStarted) {
            // Cargar progreso guardado
            const savedProgress = loadFlipCardReverseProgress();
            setFlippedCards(savedProgress.flipped);
            setUnlockedCards(savedProgress.unlocked);
            setCompletedCards(savedProgress.completed || []);

            // Lógica de inicio según dispositivo y progreso existente
            if (!isMobile && savedProgress.flipped.length === 0) {
                // Desktop SIN progreso previo: reproducir intro normalmente
                setIntroStarted(true);
            } else if (!isMobile && savedProgress.flipped.length > 0) {
                // Desktop CON progreso previo: saltar intro, mostrar cards directamente
                setIntroStarted(true);
                // Nota: No se marca introPlayed = true porque se hace en otro useEffect
            }
        }
    }, [vocesCargadas, isMobile]);

    /**
     * 🧠 useEffect: Cargar y seleccionar voces del navegador
     * 
     * Proceso:
     * 1. Intenta cargar voces del navegador (con reintentos si no están listas)
     * 2. Filtra voces en español
     * 3. Prioriza voces Microsoft Natural de países específicos
     * 4. Si no encuentra, busca voces femeninas en español
     * 5. Fallback a cualquier voz disponible en español
     * 
     * Las voces Microsoft Online (Natural) ofrecen mejor calidad de síntesis.
     */
    useEffect(() => {
        const synth = window.speechSynthesis;

        const cargarVoces = () => {
            const voices = synth.getVoices();

            // Si no hay voces disponibles aún, reintentar
            if (!voices.length) {
                console.log('🔄 Reintentando cargar voces...');
                setTimeout(cargarVoces, 300);
                return;
            }

            // Filtrar solo voces en español
            const vocesEspanol = voices.filter(v => v.lang.toLowerCase().startsWith('es'));

            // Lista de voces priorizadas (Microsoft Natural - mejor calidad)
            const prioridadMicrosoft = [
                'Microsoft Andrea Online (Natural) - Spanish (Ecuador)',
                'Microsoft Dalia Online (Natural) - Spanish (Mexico)',
                'Microsoft Salome Online (Natural) - Spanish (Colombia)',
                'Microsoft Catalina Online (Natural) - Spanish (Chile)',
                'Microsoft Camila Online (Natural) - Spanish (Peru)',
                'Microsoft Paola Online (Natural) - Spanish (Venezuela)',
            ];

            let mejorOpcion = null;

            // Intentar encontrar una voz de la lista de prioridad
            for (const nombre of prioridadMicrosoft) {
                mejorOpcion = vocesEspanol.find(v => v.name.toLowerCase().includes(nombre.toLowerCase()));
                if (mejorOpcion) break;
            }

            // Si no se encontró ninguna prioritaria, buscar voces femeninas
            if (!mejorOpcion) {
                const vocesFemeninas = vocesEspanol.filter(v =>
                    /(female|mujer|paulina|monica|soledad|camila|lucia|maría|carla|rosa|laura|catalina|dalia|salome|andrea|paola|google|microsoft)/i.test(v.name)
                );

                // Intentar voces femeninas específicas en orden de preferencia
                mejorOpcion =
                    vocesFemeninas.find(v => v.name.toLowerCase().includes('monica')) ||
                    vocesFemeninas.find(v => v.name.toLowerCase().includes('camila')) ||
                    vocesFemeninas.find(v => v.name.toLowerCase().includes('andrea')) ||
                    vocesFemeninas.find(v => v.name.toLowerCase().includes('salome')) ||
                    vocesFemeninas[0] ||
                    vocesEspanol[0]; // Fallback a cualquier voz en español
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

        // Evento que se dispara cuando las voces están disponibles
        synth.onvoiceschanged = cargarVoces;

        // Forzar carga de voces con interacción del usuario (algunos navegadores lo requieren)
        const handleUserInteraction = () => {
            console.log('👆 Usuario hizo clic: forzando carga de voces...');
            cargarVoces();
            document.removeEventListener('click', handleUserInteraction);
        };
        document.addEventListener('click', handleUserInteraction);

        // Cleanup: limpiar listeners al desmontar
        return () => {
            synth.onvoiceschanged = null;
            document.removeEventListener('click', handleUserInteraction);
        };
    }, []);

    // ==============================================================
    // 🎧 FUNCIÓN DE REPRODUCCIÓN DE AUDIO
    // ==============================================================

    // ==============================================================
    // 🛑 FUNCIÓN: Detener audio completamente
    // ==============================================================

    const stopAudio = () => {
        return new Promise((resolve) => {
            const synth = synthRef.current;

            try {
                console.log('🛑 Iniciando stopAudio...');

                // 🔥 PASO 1: Marcar como navegando
                isNavigatingRef.current = true;

                // 🔥 PASO 2: Limpiar currentUtteranceRef
                if (currentUtteranceRef.current) {
                    currentUtteranceRef.current.wasCancelled = true;
                    currentUtteranceRef.current.onend = null;
                    currentUtteranceRef.current.onboundary = null;
                    currentUtteranceRef.current.onerror = null;
                    currentUtteranceRef.current.onstart = null;
                    currentUtteranceRef.current.onpause = null;
                    currentUtteranceRef.current.onresume = null;
                    currentUtteranceRef.current = null;
                    console.log('✅ currentUtterance limpiado');
                }

                // 🔥 PASO 3: Limpiar introAudioRef
                if (introAudioRef.current) {
                    introAudioRef.current.wasCancelled = true;
                    introAudioRef.current.onend = null;
                    introAudioRef.current.onboundary = null;
                    introAudioRef.current.onerror = null;
                    introAudioRef.current.onstart = null;
                    introAudioRef.current.onpause = null;
                    introAudioRef.current.onresume = null;
                    introAudioRef.current = null;
                    console.log('✅ introAudio limpiado');
                }

                // 🔥 PASO 4: Resetear todas las referencias
                pausedTextRef.current.text = '';
                audioStateRef.current = {
                    isPlaying: false,
                    wasPaused: false
                };

                // 🔥 PASO 5: Resetear estados de React
                setIsPlayingAudio(false);
                setIsPaused(false);

                // 🔥 PASO 6: Cancelar síntesis
                if (synth && (synth.speaking || synth.pending)) {
                    try { synth.resume(); } catch (e) { }
                    try { synth.cancel(); } catch (e) { }

                    setTimeout(() => {
                        try { synth.cancel(); } catch (e) { }
                        console.log('✅ Audio cancelado completamente');

                        setTimeout(() => {
                            isNavigatingRef.current = false;
                            resolve();
                        }, 100);
                    }, 300);
                } else {
                    console.log('✅ No había audio reproduciéndose');
                    setTimeout(() => {
                        isNavigatingRef.current = false;
                        resolve();
                    }, 100);
                }
            } catch (error) {
                console.error('❌ Error en stopAudio:', error);
                isNavigatingRef.current = false;
                resolve();
            }
        });
    };

    // ==============================================================
    // 🎧 FUNCIÓN DE REPRODUCCIÓN DE AUDIO
    // ==============================================================

    /**
     * 🎧 Reproduce texto usando síntesis de voz del navegador
     * 
        /**
         * 🎧 Reproduce texto usando síntesis de voz del navegador
         * 
         * Características:
         * - Usa la voz previamente seleccionada (mejorVoz)
         * - Cancela cualquier audio en reproducción antes de empezar uno nuevo
         * - Maneja eventos de inicio, fin, error, pausa y reanudación
         * - Solo ejecuta el callback onEnd si el audio terminó NATURALMENTE
         *   (no si fue cancelado por cerrar página/navegar)
         * 
         * @param {String} text - Texto a reproducir
         * @param {Function} onEnd - Callback que se ejecuta al terminar (solo si no fue cancelado)
         */
    const speak = (text, onEnd, onError, isIntro = false) => {
        // 🔥 Bloquear si estamos navegando
        if (isNavigatingRef.current) {
            console.warn('⛔ Navegación activa - Audio BLOQUEADO');
            if (onError) onError();
            return;
        }

        // Validar que las voces estén cargadas
        if (!vocesCargadas || !mejorVoz) {
            setShowAudioPopup(true);
            console.warn('⚠️ Voces aún no cargadas, no se puede reproducir.');
            return;
        }
        const synth = synthRef.current;
        // Cancelar cualquier audio previo
        if (synthRef.current.speaking) {
            synthRef.current.cancel();
        }

        // Crear nuevo utterance (objeto de síntesis de voz)
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = mejorVoz;
        utterance.lang = mejorVoz.lang || 'es-ES';
        utterance.rate = 0.9;  // Velocidad de habla (0.1 - 10)
        utterance.pitch = 1;   // Tono de voz (0 - 2)

        // 🚩 CRÍTICO: Bandera para controlar si el audio fue cancelado
        utterance.wasCancelled = false;

        // Guardar referencias
        pausedTextRef.current.text = text;
        currentUtteranceRef.current = utterance;
        // 🔥 NUEVO: Si es intro, guardar también en introAudioRef
        if (isIntro) {
            introAudioRef.current = utterance;
            console.log('💾 Audio de intro guardado en introAudioRef');
        }


        // 📢 Evento: Cuando el audio inicia
        utterance.onstart = () => {
            setIsPlayingAudio(true);
            setIsPaused(false);
            audioStateRef.current.isPlaying = true;
            audioStateRef.current.wasPaused = false;
            audioRetryRef.current = 0;
            console.log('▶️ Audio iniciado');
            setShowAudioPopup(false);
        };

        // 🏁 Evento: Cuando el audio termina
        utterance.onend = () => {
            setIsPlayingAudio(false);
            setIsPaused(false);
            currentUtteranceRef.current = null;
            audioStateRef.current.isPlaying = false;
            audioStateRef.current.wasPaused = false;
            setShowAudioPopup(false);
            // 🎯 CRÍTICO: Solo ejecutar callback si NO fue cancelado
            if (!utterance.wasCancelled) {
                console.log('✅ Audio finalizado naturalmente');
                if (onEnd) onEnd(); // Aquí se guarda el progreso de la tarjeta
            } else {
                console.log('🚫 Audio cancelado, no guardar progreso');
            }
        };

        // ❌ Evento: Error en la reproducción
        // Evento: error en reproducción (LÓGICA DE REINTENTOS)
        utterance.onerror = (e) => {
            const isInterrupted = e.error === 'interrupted';
            console.error('❌ Error de síntesis:', e.error);

            // Solo reintentar si NO fue interrumpido y aún quedan reintentos
            if (!isInterrupted && audioRetryRef.current < maxRetries) {
                audioRetryRef.current++;
                setShowAudioPopup(true); // Mostrar popup durante reintentos
                console.log(`🔄 Reintentando audio (${audioRetryRef.current}/${maxRetries})...`);

                // Reintentar después de un delay
                setTimeout(() => {
                    if (audioRetryRef.current <= maxRetries) {
                        try {
                            synth.speak(utterance);
                        } catch (error) {
                            console.error('Error en reintento:', error);
                        }
                    }
                }, 800); // Delay de 800ms entre reintentos
            } else if (audioRetryRef.current >= maxRetries) {
                // Se agotaron los reintentos
                handleAudioFailed(onError);
            }
            // Si fue interrumpido, no hacer nada (comportamiento normal)
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
            synthRef.current.speak(utterance);
        } catch (error) {
            setShowAudioPopup(true);
            console.error('Error speaking:', error);
            setAudioFailed(true);
            currentUtteranceRef.current = null;
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
        setShowAudioPopup(true); // Mantener popup visible para informar al usuario

        if (onError) onError();
    };

    // ==============================================================
    // 👁️ EFFECTS: Manejo de visibilidad y foco de página
    // ==============================================================

    // 🔥 NUEVO: Resetear flag al montar
    useEffect(() => {
        console.log('🎯 FlipCardReverse montado - Reseteando flags');
        isNavigatingRef.current = false;
        previousModuleIdRef.current = moduleId;

        return () => {
            console.log('🧹 FlipCardReverse desmontado');
        };
    }, []);

    // 🔥 NUEVO: Detectar cambio de módulo/ruta y cancelar audio
    // 🔥 SOLUCIÓN DEFINITIVA: Detectar cambio de módulo/ruta y cancelar TODO
    useEffect(() => {
        const currentModuleId = moduleId;

        // Si el módulo cambió, cancelar INMEDIATAMENTE
        if (previousModuleIdRef.current !== currentModuleId) {
            console.log(`🚨 CAMBIO DE MÓDULO DETECTADO: ${previousModuleIdRef.current} → ${currentModuleId}`);

            // Actualizar referencia
            previousModuleIdRef.current = currentModuleId;

            // 🔥 Usar stopAudio() - TODO en una sola llamada
            stopAudio().then(() => {
                console.log('✅ Audio cancelado por cambio de módulo');
            });
        }

        // Cleanup cuando cambia la ruta completa
        return () => {
            console.log('🧹 Cleanup por cambio de ruta:', location.pathname);

            // 🔥 Usar stopAudio() en el cleanup también
            stopAudio().then(() => {
                console.log('✅ Cleanup completado');
            });
        };
    }, [location.pathname, moduleId]);

    /**
     * 👁️ useEffect: Detectar cuando el usuario cambia de pestaña
     * 
     * Comportamiento:
     * - Cuando oculta la pestaña (document.hidden = true):
     *   → Pausa el audio TEMPORALMENTE (NO lo marca como cancelado)
     * - Cuando regresa a la pestaña:
     *   → Reanuda el audio automáticamente
     * 
     * Esto permite que el usuario cambie de pestaña sin perder el progreso,
     * siempre que regrese y deje que el audio termine.
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
     * 🎵 useEffect: Detectar cuando la ventana pierde/recupera el foco
     * 
     * Comportamiento similar a visibilitychange pero para cuando el usuario:
     * - Hace clic en otra ventana/aplicación (blur)
     * - Regresa a esta ventana (focus)
     * 
     * IMPORTANTE: NO marca el audio como cancelado al perder el foco,
     * solo lo pausa temporalmente. Esto permite que si el usuario regresa
     * y deja terminar el audio, la tarjeta SÍ se marque como completada.
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
     * 🚪 useEffect: Cancelar audio al cerrar página o desmontar componente
     * 
     * Comportamiento:
     * - beforeunload: Usuario está cerrando/recargando la página
     *   → Marca el audio como cancelado y lo detiene
     * - unmount: El componente se está desmontando (navegación interna)
     *   → Cancela el audio en reproducción
     * 
     * IMPORTANTE: Aquí SÍ se marca wasCancelled = true porque el usuario
     * está abandonando realmente la página/módulo.
     */
    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log('🛑 Cerrando página: cancelando audio...');
            stopAudio(); // 🔥 Una sola llamada
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            console.log('🧹 Componente desmontado: cancelando audio...');
            stopAudio(); // 🔥 Una sola llamada
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    /**
     * 🎬 useEffect: Reproducir audio de introducción
     * 
     * Se ejecuta cuando:
     * - NO es móvil (en móvil se espera clic del usuario)
     * - Las voces están cargadas
     * - La intro ya inició (introStarted = true)
     * - Pero aún no se ha reproducido (introPlayed = false)
     * 
     * Al terminar la intro:
     * - Marca introPlayed = true (para mostrar las tarjetas)
     * - Desbloquea la primera tarjeta si no hay progreso previo
     */

    useEffect(() => {
        // 🔥 Verificar y resetear flag si es necesario
        if (isNavigatingRef.current) {
            console.warn('⚠️ Flag detectado en carga inicial, reseteando...');
            isNavigatingRef.current = false;
        }

        if (!isMobile && vocesCargadas && introStarted && !introPlayed) {
            console.log('🎬 Reproduciendo intro...');

            const timer = setTimeout(() => {
                if (isNavigatingRef.current) {
                    console.log('⛔ Navegación detectada, NO reproducir intro');
                    return;
                }

                speak(
                    currentModule.audioObjetivo,
                    // onEnd
                    () => {
                        console.log('✅ Intro terminada');
                        setIntroPlayed(true);
                        setUnlockedCards(prev => {
                            if (prev && prev.length > 1) return prev;
                            return [1];
                        });
                    },
                    // onError
                    () => {
                        console.log('❌ Intro falló después de reintentos');
                        setIntroPlayed(true);
                        setUnlockedCards([1]);
                    },
                    true // 🔥 NUEVO: Marcar como intro
                );
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [isMobile, vocesCargadas, introStarted, introPlayed]);


    /**
     * 📱 useEffect: Detectar si el dispositivo es móvil
     * 
     * Verifica:
     * 1. User agent (iPhone, iPad, iPod, Android)
     * 2. Ancho de pantalla (< 768px)
     * 
     * Se ejecuta:
     * - Al montar el componente
     * - Cada vez que la ventana cambia de tamaño
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

    // ==============================================================
    // 🎮 FUNCIÓN: Manejar clic en tarjeta
    // ==============================================================

    /**
     * 🎮 Maneja el clic del usuario en una tarjeta
     * 
     * Validaciones (no hace nada si):
     * 1. La intro aún está reproduciéndose
     * 2. La tarjeta no está desbloqueada
     * 3. Hay otro audio reproduciéndose
     * 
     * Comportamiento:
     * - Si la tarjeta ya está volteada → La vuelve al frente
     * - Si no está volteada → La voltea y reproduce su audio
     * 
     * Al terminar el audio:
     * 1. Guarda el progreso en localStorage
     * 2. Actualiza el estado de tarjetas completadas
     * 3. Desbloquea la siguiente tarjeta
     * 4. Si es la última, ejecuta callback onContentIsEnded
     * 
     * @param {Number} cardId - ID de la tarjeta clickeada
     */
    /**
 * 🎮 Maneja el clic del usuario en una tarjeta
 * 
 * Validaciones (no hace nada si):
 * 1. La intro aún está reproduciéndose
 * 2. La tarjeta no está desbloqueada
 * 3. Hay otro audio reproduciéndose
 * 
 * Comportamiento:
 * - Si la tarjeta ya está volteada → La vuelve al frente y detiene audio
 * - Si no está volteada → La voltea y reproduce su audio
 * 
 * Al terminar el audio:
 * 1. Guarda el progreso en localStorage
 * 2. Actualiza el estado de tarjetas completadas
 * 3. Desbloquea la siguiente tarjeta
 * 4. Si es la última, ejecuta callback onContentIsEnded
 * 
 * @param {Number} cardId - ID de la tarjeta clickeada
 */
    const handleCardClick = async (cardId) => {
        // Validación 1: Intro debe haber terminado o fallado
        if (!introPlayed && !audioFailed) return;

        // Validación 2: Tarjeta debe estar desbloqueada
        if (!unlockedCards.includes(cardId)) return;

        // Si ya está volteada, regresarla al frente Y DETENER AUDIO
        if (flippedCards.includes(cardId)) {
            await stopAudio(); // 🔥 Detener audio antes de cerrar
            setFlippedCards(flippedCards.filter(id => id !== cardId));
            setActiveCard(null);
            return;
        }

        // Validación 3: No debe haber otro audio reproduciéndose
        if (isPlayingAudio) {
            console.log('⚠️ Ya hay audio reproduciéndose');
            return;
        }

        // 🔥 VOLTEAR LA TARJETA
        setActiveCard(cardId);
        setFlippedCards([...flippedCards, cardId]);

        // 🔥 CONSTRUIR TEXTO COMPLETO PARA REPRODUCIR
        const card = cards.find(a => a.id === cardId);
        const fullText = `${card.title}.     ${card.content} ${card.example}`;

        // 🔥 REPRODUCIR AUDIO DE LA TARJETA
        speak(
            fullText,
            // ✅ onEnd: Callback cuando el audio termina naturalmente
            () => {
                // 1. Guardar progreso en localStorage
                updateFlipCardReverseProgress(cardId);

                // 2. Actualizar estado local de tarjetas completadas
                setCompletedCards(prev => [...new Set([...prev, cardId])]);

                const nextCardId = cardId + 1;
                const isLastCard = cardId === cards.length;

                // 3. Desbloquear siguiente tarjeta si existe
                if (nextCardId <= cards.length) {
                    setUnlockedCards([...unlockedCards, nextCardId]);
                }

                // 4. Si es la última tarjeta, ejecutar callback de finalización
                if (isLastCard) {
                    console.log('🏁 Última card completada!');
                    onContentIsEnded(); // Notifica al componente padre que terminó el módulo
                }

                // 5. Limpiar tarjeta activa
                setActiveCard(null);
            },
            // ❌ onError: Callback de error definitivo
            () => {
                console.log('❌ Audio falló definitivamente después de reintentos');
                setActiveCard(null);
            },
            false // No es intro
        );
    };

    // ==============================================================
    // 🎨 RENDERIZADO: Pantalla de carga
    // ==============================================================

    /**
     * Mientras las voces no estén cargadas, mostrar pantalla de carga
     */
    if (!vocesCargadas) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-slate-400 text-lg animate-pulse">
                    Cargando voces en español...
                </p>
            </div>
        );
    }

    // ==============================================================
    // 📱 FUNCIÓN: Iniciar intro en móvil
    // ==============================================================

    /**
     * 📱 Inicia la introducción en dispositivos móviles
     * 
     * En móvil, la intro NO se reproduce automáticamente.
     * El usuario debe hacer clic en el botón para iniciarla.
     * Esto cumple con las políticas de autoplay de los navegadores móviles.
     */
    const iniciarIntroMovil = () => {
        // 🔥 Verificar que no estamos navegando
        if (isNavigatingRef.current) {
            console.log('⚠️ Navegación en progreso, esperando...');
            setTimeout(iniciarIntroMovil, 200);
            return;
        }

        if (!introStarted && vocesCargadas) {
            setIntroStarted(true);
            speak(
                currentModule.audioObjetivo,
                // onEnd
                () => {
                    setIntroPlayed(true);
                    setUnlockedCards(prev => {
                        if (prev && prev.length > 1) return prev;
                        return [1];
                    });
                },
                // onError
                () => {
                    console.log('❌ Intro falló después de reintentos');
                    setIntroPlayed(true);
                    setUnlockedCards([1]);
                },
                true // 🔥 NUEVO: Marcar como intro
            );
        }
    };
    // ==============================================================
    // 🎯 VARIABLES DE CONTROL DE RENDERIZADO
    // ==============================================================

    /**
     * isPlayingIntro: Indica si la intro se está reproduciendo AHORA
     * - Usado para mostrar skeleton loading mientras suena la intro
     */
    const isPlayingIntro = introStarted && !introPlayed && isPlayingAudio;

    /**
     * showCards: Indica si se deben mostrar las tarjetas
     * - Se muestran después de que la intro terminó O si hubo error de audio
     */
    const showCards = introPlayed || audioFailed;

    // ==============================================================
    // 🎨 RENDERIZADO PRINCIPAL
    // ==============================================================

    return (
        <div className="w-full mx-auto pt-10 pb-14 lg:pb-0">

            {/* ========================================
                📱 MÓVIL: Botón para iniciar intro
                ======================================== */}
            {isMobile && !introStarted && (
                <div
                    onClick={iniciarIntroMovil}
                    className="relative w-full flex items-center justify-center rounded-xl cursor-pointer min-h-[400px]"
                    data-aos="fade-up"
                >
                    <div className="absolute inset-0 rounded-xl scale-[1.03] pointer-events-none"></div>
                    <div className="text-center py-2 z-10">
                        <p className="text-white text-2xl md:text-3xl font-light animate-pulse">
                            Click para iniciar
                        </p>
                    </div>
                </div>
            )}

            {/* ========================================
                📋 Título y objetivo del módulo
                Se muestra cuando la intro ha iniciado
                ======================================== */}
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

            {/* ========================================
                🔄 SKELETON LOADING
                Se muestra MIENTRAS se reproduce la intro
                
                Propósito:
                - Dar feedback visual de que algo está cargando
                - Mostrar cuántas tarjetas hay sin revelar contenido
                - Efecto visual atractivo con animaciones pulse
                ======================================== */}
            {isPlayingIntro && (
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 mb-6" data-aos="fade-up">
                    {cards.map((etapa, index) => {
                        const isLast = index === cards.length - 1;
                        return (
                            <div
                                key={etapa.id}
                                className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-1 border-[#2c2c2f] bg-[#121214] overflow-hidden 
                                ${isLast ? "col-span-1 lg:col-span-2" : ""}`}
                            >
                                {/* Fondo con efecto pulse radial */}
                                <div className="absolute inset-0 rounded-2xl bg-[#3a3a3f]/40 animate-pulse-radial"></div>

                                {/* Skeleton del ícono circular */}
                                <div className="relative w-16 h-16 mb-3 rounded-full bg-[#1f1f23] overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#2c2c2f] via-[#3a3a3f] to-[#2c2c2f] rounded-full animate-pulse-delay"></div>
                                </div>

                                {/* Skeleton de textos (líneas pulsantes) */}
                                <div className="w-full space-y-2 mt-2">
                                    <div className="h-3 bg-[#1f1f23] rounded w-1/3 mx-auto animate-pulse delay-75"></div>
                                    <div className="h-5 bg-[#1f1f23] rounded w-2/3 mx-auto animate-pulse delay-150"></div>
                                    <div className="h-4 bg-[#1f1f23] rounded w-4/5 mx-auto mt-4 animate-pulse delay-200"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ========================================
                🎴 TARJETAS INTERACTIVAS
                Se muestran DESPUÉS de que la intro terminó
                
                Sistema de tarjetas flip con:
                - Front: Ícono, título y estado (bloqueada/desbloqueada/completada)
                - Back: Contenido completo con título, descripción y ejemplo
                ======================================== */}
            {showCards && (
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 mb-6" data-aos="fade-up">
                    {cards.map((card, index) => {
                        // Estados de la tarjeta
                        const isUnlocked = unlockedCards.includes(Number(card.id)) || audioFailed;
                        const isFlipped = flippedCards.includes(card.id);
                        const isLast = index === cards.length - 1;

                        return (
                            <div
                                key={card.id}
                                className={`h-100 md:h-96 perspective-1000 ${isLast ? "col-span-1 lg:col-span-2" : ""}`}
                            >
                                {/* Contenedor con efecto 3D flip */}
                                <div
                                    className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''} ${!isUnlocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    onClick={() => handleCardClick(card.id)}
                                >
                                    {/* ========================================
                                        ✋ FRONT: Cara frontal de la tarjeta
                                        
                                        Muestra:
                                        - Ícono emoji grande
                                        - Número de tarjeta
                                        - Título
                                        - Estado: bloqueada/desbloqueada/completada
                                        - CTA "Clic para ver más" (si está desbloqueada)
                                        ======================================== */}
                                    <div className="absolute w-full h-full backface-hidden">
                                        <div
                                            className={`w-full h-full ${isUnlocked
                                                ? ` bg-gradient-to-br from-[#0a1a3a]/80 to-[#071D49]/70 backdrop-blur-md border border-[#071D49]/30 shadow-md shadow-[#071D49]/40 hover:border-[#1a4fff] hover:shadow-xl hover:shadow-[#1a4fff]/40 transition-all duration-300   rounded-2xl` // Degradado de color si está desbloqueada
                                                : 'bg-zinc-950' // Gris oscuro si está bloqueada
                                                } rounded-2xl shadow-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-500`}
                                        >
                                            {/* Overlay de tarjeta bloqueada */}
                                            {!isUnlocked && (
                                                <div className="absolute inset-0 bg-gray-600/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                                                    <div className="text-center">
                                                        <Lock size={48} className="text-white/80 mx-auto mb-2" />
                                                        <p className="text-white/90 font-semibold text-sm">Bloqueada</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ✓ Check mark: Indica que la tarjeta ya fue completada */}
                                            {completedCards.includes(card.id) && (
                                                <div className="absolute top-4 right-4 z-10">
                                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Capa de glassmorphism (efecto vidrio) */}
                                            {/* <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-sm"></div> */}

                                            {/* Contenido principal del front */}
                                            <div className="relative z-10 flex flex-col items-center text-center">
                                                {/* Ícono emoji grande */}


                                                <div className={` mb-6 p-4 w-34 h-34 mx-auto  bg-gradient-to-br ${!isUnlocked ? 'grayscale-0' : 'from-[#071D49] to-[#1a4fff] '
                                                    } rounded-xl flex items-center justify-center shadow-inner shadow-black/50`}>
                                                    <span className={`text-7xl md:text-8xl drop-shadow-lg ${isUnlocked ? 'grayscale-0' : 'grayscale opacity-40'} `}>{card.icon}</span>
                                                </div>

                                                {/* Número de tarjeta */}
                                                <div className={`text-xs md:text-xl font-bold transition-all duration-500 ${isUnlocked ? 'text-white' : 'text-white/40'
                                                    }`}>
                                                    carda #{card.id}
                                                </div>

                                                {/* Título de la tarjeta */}
                                                <div className={`text-md md:text-3xl font-bold transition-all duration-500 ${isUnlocked ? 'text-white' : 'text-white/40'
                                                    }`}>
                                                    {card.title}
                                                </div>

                                                {/* CTA: Call to action para voltear la tarjeta */}
                                                {isUnlocked && !isFlipped && (
                                                    <div className="mt-6 px-4 py-2 bg-white/30 rounded-full backdrop-blur-sm animate-pulse">
                                                        <p className="text-white text-sm font-semibold">
                                                            Clic para ver más
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ========================================
                                        📄 BACK: Cara trasera de la tarjeta
                                        
                                        Muestra:
                                        - Ícono pequeño con gradiente
                                        - Número de tarjeta
                                        - Título completo
                                        - Descripción del contenido
                                        - Ejemplo destacado con borde
                                        - Indicador de reproducción de audio
                                        - Contador de progreso (X de Y)
                                        ======================================== */}
                                    <div className="absolute w-full h-full backface-hidden rotate-y-180">
                                        <div className="w-full h-full bg-[#121214] rounded-2xl shadow-2xl p-6 flex flex-col justify-between border-1 border-zinc-800">
                                            <div>
                                                {/* Header con ícono y número */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* Ícono con gradiente de color */}
                                                        <div className={`p-2 bg-gradient-to-br from-[#071D49] to-[#1a4fff] rounded-lg flex items-center justify-center`}>
                                                            <span className="text-3xl">{card.icono}</span>
                                                        </div>
                                                        {/* Número de tarjeta */}
                                                        <span className="text-3xl font-bold text-gray-300">
                                                            {card.id}
                                                        </span>
                                                    </div>
                                                    {/* Indicador de audio reproduciéndose */}
                                                    {activeCard === card.id && isPlayingAudio && (
                                                        <Volume2 className="text-blue-600 animate-pulse" size={24} />
                                                    )}
                                                </div>

                                                {/* Título de la tarjeta */}
                                                <h3 className="text-lg md:text-xl font-bold text-gray-200 mb-4">
                                                    {card.title}
                                                </h3>

                                                {/* Contenido/descripción principal */}
                                                <p className="text-gray-300 text-sm md:text-base mb-4 leading-relaxed">
                                                    {card.content}
                                                </p>

                                                {/* Ejemplo destacado con borde de color */}
                                                <div className={`bg-[#1a1a1d] border-l-4 border-[#1a4fff]  p-3 rounded`}>
                                                    <p className="text-gray-400 text-xs md:text-sm italic font-medium">
                                                        {card.example}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Footer con contador de progreso */}
                                            <div className="text-center mt-4 pt-4 border-t border-gray-400">
                                                <p className="text-xs text-gray-400 font-semibold">
                                                    carda {card.id} de {cards.length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}


            {/* Indicador de reproducción de intro */}
            {isPlayingIntro && (
                <div data-aos="fade-up" className="fixed bottom-14 lg:bottom-4 right-1 lg:right-4 bg-zinc-800/90 backdrop-blur-sm px-4 py-3 rounded-lg border border-zinc-700 shadow-xl z-50 animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            <span className="w-1 h-4 bg-blue-400 rounded-full animate-pulse"></span>
                            <span className="w-1 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-1 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                        <span className="text-white text-sm">Reproduciendo introducción...</span>
                    </div>
                </div>
            )}

            {isPlayingAudio && !isPlayingIntro && (
                <div data-aos="fade-up" className="fixed bottom-14 lg:bottom-4 right-1 lg:right-4 bg-zinc-800/90 backdrop-blur-sm px-4 py-3 rounded-lg border border-zinc-700 shadow-xl z-50 animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            <span className="w-1 h-4 bg-blue-400 rounded-full animate-pulse"></span>
                            <span className="w-1 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-1 h-4 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                        <span className="text-white text-sm">Reproduciendo información...</span>
                    </div>
                </div>
            )}


            {showAudioPopup && (
                <div data-aos="fade-up"
                    className="fixed bottom-14 lg:bottom-4 right-1 lg:right-4 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg text-sm text-center animate-pulse z-[9999]"
                >
                    🔊 <strong>Estamos intentando reproducir el audio...</strong><br />
                    Si el problema persiste, cierra esta etapa y vuelve a cargarla.
                </div>
            )}
        </div>
    );
}

export default FlipCardReverse;

