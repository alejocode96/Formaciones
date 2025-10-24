import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, VolumeX, ChevronRight, ChevronLeft, BookOpen, Target, Lightbulb, Wrench, Lock, CheckCircle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
/**
 * =============================================================================
 * FLIPCARD COMPONENT
 * =============================================================================
 * 
 * Componente principal que gestiona el aprendizaje interactivo mediante tarjetas
 * con reproducción de audio automática y seguimiento de progreso.
 */
function FlipCard({ currentModule, onContentIsEnded, courseId, moduleId }) {

    // =========================================================================
    // SECCIÓN 1: DATOS Y CONFIGURACIÓN INICIAL
    // =========================================================================

    const cards = currentModule.cards;
    const maxRetries = 10;

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
    const [audioProgress, setAudioProgress] = useState(0);

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
    const progressIntervalRef = useRef(null);
    const pausedByVisibilityRef = useRef(false);
    const audioCompletedRef = useRef(false);
    const isNavigatingRef = useRef(false);
    // Referencia para mantener el estado del audio entre renderizados
    const audioStateRef = useRef({
        isPlaying: false,
        wasPaused: false
    });
    const location = useLocation();
    // =========================================================================
    // SECCIÓN 4: FUNCIONES DE LOCAL STORAGE
    // =========================================================================

    const getProgressKey = () => `userProgress`;

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

    const saveProgress = (cardId, seccion, titulo) => {
        const key = getProgressKey();
        const existingProgress = localStorage.getItem(key);

        try {
            let allProgress = existingProgress ? JSON.parse(existingProgress) : {};

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


    const stopAudio = () => {
        return new Promise((resolve) => {
            const synth = synthRef.current;

            try {
                console.log('🛑 Iniciando stopAudio...');

                // 🔥 PASO 1: Marcar como navegando para prevenir nuevos intervalos
                isNavigatingRef.current = true;

                // 🔥 PASO 2: Limpiar intervalo INMEDIATAMENTE
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                    console.log('✅ Intervalo limpiado');
                }

                // 🔥 PASO 3: Limpiar utterance COMPLETAMENTE
                if (currentUtteranceRef.current) {
                    currentUtteranceRef.current.wasCancelled = true;
                    currentUtteranceRef.current.onend = null;
                    currentUtteranceRef.current.onboundary = null;
                    currentUtteranceRef.current.onerror = null;
                    currentUtteranceRef.current.onstart = null;
                    currentUtteranceRef.current.onpause = null;
                    currentUtteranceRef.current.onresume = null;
                    currentUtteranceRef.current = null;
                    console.log('✅ Utterance limpiado');
                }

                // 🔥 PASO 4: Resetear TODOS los estados INMEDIATAMENTE
                pausedTextRef.current.text = '';
                audioStateRef.current = {
                    isPlaying: false,
                    wasPaused: false
                };
                pausedByVisibilityRef.current = false;
                audioCompletedRef.current = false;

                setIsPlayingAudio(false);
                setIsPaused(false);
                setAudioProgress(0);
                setAudioCompletado(false);

                // 🔥 PASO 5: Cancelar síntesis
                if (synth && (synth.speaking || synth.pending)) {
                    try { synth.resume(); } catch (e) { }
                    try { synth.cancel(); } catch (e) { }

                    setTimeout(() => {
                        try { synth.cancel(); } catch (e) { }
                        console.log('✅ Audio cancelado completamente');

                        // 🔥 Pequeña espera antes de permitir nuevo audio
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

    const speak = (text, onEnd, onError) => {
        // 🔥 PREVENIR ejecución si estamos navegando
        if (isNavigatingRef.current) {
            console.warn('⚠️ Navegación en progreso, esperando...');
            setTimeout(() => speak(text, onEnd, onError), 200);
            return;
        }

        if (!vocesCargadas || !mejorVoz) {
            console.warn('⚠️ Voces aún no cargadas');
            setAudioFailed(true);
            setShowAudioPopup(true);
            if (onError) onError();
            return;
        }

        const synth = synthRef.current;

        // 🔥 Limpieza previa ABSOLUTA
        if (synth.speaking) {
            try {
                synth.cancel();
                console.log('⚠️ Audio anterior cancelado');
            } catch (error) {
                console.error('Error cancelando audio previo:', error);
            }
        }

        // 🔥 CRÍTICO: Asegurar que no hay intervalo previo
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
            console.log('🧹 Intervalo previo limpiado');
        }

        // Dividir texto por frases
        const sentences = text.split(/(?<=[.,!?¡¿])/).map(s => s.trim()).filter(Boolean);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = mejorVoz;
        utterance.lang = mejorVoz.lang || 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.wasCancelled = false;

        pausedTextRef.current.text = text;
        currentUtteranceRef.current = utterance;

        // Cálculo de duración estimada
        const baseRate = 0.9;
        let totalEstimated = 2000;
        sentences.forEach(s => {
            const cps = 21 * baseRate;
            const punctuationBonus = (s.match(/[,;:]/g) || []).length * 180;
            const time = (s.length / cps) * 1000 + punctuationBonus;
            totalEstimated += time;
        });

        let startTime = null; // 🔥 Inicializar en null
        let currentSentence = 0;

        utterance.onstart = () => {
            // 🔥 CRÍTICO: Verificar que NO hay intervalo activo
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }

            setIsPlayingAudio(true);
            setIsPaused(false);
            setAudioProgress(0);
            startTime = Date.now(); // 🔥 Establecer AQUÍ, no antes

            audioStateRef.current.isPlaying = true;
            audioStateRef.current.wasPaused = false;
            audioRetryRef.current = 0;
            audioCompletedRef.current = false;

            // 🔥 CREAR intervalo SOLO si no existe
            if (!progressIntervalRef.current) {
                progressIntervalRef.current = setInterval(() => {
                    if (!startTime) return; // 🔥 Protección extra

                    const elapsed = Date.now() - startTime;
                    const progress = Math.min((elapsed / totalEstimated) * 100, 98);
                    setAudioProgress(progress);
                }, 100);

                console.log('▶️ Audio iniciado con nuevo intervalo');
            }

            setShowAudioPopup(false);
        };

        utterance.onboundary = (event) => {
            if (event.name === 'sentence' || event.name === 'word') {
                currentSentence++;
            }
        };

        utterance.onend = () => {
            console.log('🏁 utterance.onend disparado');

            // 🔥 Limpiar intervalo PRIMERO
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
                console.log('✅ Intervalo limpiado en onend');
            }

            setIsPlayingAudio(false);
            setIsPaused(false);
            setAudioProgress(100); // 🔥 Forzar a 100%
            currentUtteranceRef.current = null;
            audioStateRef.current.isPlaying = false;
            audioStateRef.current.wasPaused = false;

            console.log('✅ Audio finalizado');
            setShowAudioPopup(false);

            if (!utterance.wasCancelled) {
                audioCompletedRef.current = true;
                if (onEnd) onEnd();
            }
        };

        utterance.onerror = (e) => {
            const isInterrupted = e.error === 'interrupted';

            // 🔥 Limpiar intervalo en error también
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }

            setShowAudioPopup(true);
            console.error('❌ Error de síntesis:', e.error);

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

        utterance.onpause = () => {
            console.log('⏸️ Audio pausado');
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
            }
        };

        utterance.onresume = () => {
            setIsPaused(false);
            audioStateRef.current.wasPaused = false;
            console.log('▶️ Audio reanudado');

            // 🔥 NO recrear intervalo aquí, solo marcar estado
            // El intervalo se maneja en visibilitychange y blur/focus
        };

        try {
            synth.speak(utterance);
        } catch (error) {
            setShowAudioPopup(true);
            console.error('❌ Error al hablar:', error);
            handleAudioFailed(onError);
        }
    };

    const handleAudioFailed = (onError) => {
        setIsPlayingAudio(false);
        setIsPaused(false);
        setAudioFailed(true);
        audioStateRef.current.isPlaying = false;
        audioRetryRef.current = 0;

        if (onError) onError();
    };

    const speakAndSave = (text, cardId, seccionId, titulo, onError) => {
        const key = `${cardId}-${seccionId}`;

        speak(text, () => {
            saveProgress(cardId, seccionId, titulo);
            setAudioCompletado(true);

            const updatedVistas = { ...seccionesVistas, [key]: true };
            setSeccionesVistas(updatedVistas);

            verificarCardCompleta(cardId, updatedVistas);
        }, onError);
    };

    const verificarCardCompleta = (cardId, currentVistas = null) => {
        const secciones = ['objetivo', 'quehace', 'como', 'ejemplo'];
        const vistasActuales = currentVistas || seccionesVistas;

        const todasVistas = secciones.every(s => vistasActuales[`${cardId}-${s}`]);

        if (todasVistas && !etapasCompletadas.includes(cardId)) {
            console.log(`✅ Card ${cardId} completada!`);
            setEtapasCompletadas(prev => [...prev, cardId]);

            if (cardId < cards.length) {
                setEtapaActiva(cardId + 1);
            }

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

    const abrirEtapa = (etapaId) => {
        stopAudio();
        setEtapaAbierta(etapaId);
        setSeccionActiva('objetivo');
        setAudioCompletado(false);
        setAudioProgress(0);

        const etapa = cards.find(e => e.id === etapaId);
        if (etapa) {
            speakAndSave(etapa.audioObjetivo, etapaId, 'objetivo', etapa.titulo, () => {
                setAudioCompletado(true);
            });
        }
    };

    const cerrarEtapa = () => {
        stopAudio();
        resetAudioState();
        setEtapaAbierta(null);
        setSeccionActiva('objetivo');
        setAudioCompletado(false);
        setAudioProgress(0);
        progressIntervalRef.current = null;
    };

    const irSeccionAnterior = async () => {
        console.log('⬅️ Navegando a sección anterior...');

        // 🔥 Esperar a que se detenga completamente el audio
        await stopAudio();

        const etapa = cards.find(e => e.id === etapaAbierta);
        if (!etapa) return;

        const secciones = ['objetivo', ...etapa.secciones.map(s => s.id)];
        const indexActual = secciones.indexOf(seccionActiva);

        if (indexActual > 0) {
            const seccionAnterior = secciones[indexActual - 1];
            setSeccionActiva(seccionAnterior);

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

    const irSeccionSiguiente = async () => {
        console.log('➡️ Navegando a sección siguiente...');

        // 🔥 Esperar a que se detenga completamente el audio
        await stopAudio();

        const etapa = cards.find(e => e.id === etapaAbierta);
        if (!etapa) return;

        const secciones = ['objetivo', ...etapa.secciones.map(s => s.id)];
        const indexActual = secciones.indexOf(seccionActiva);

        if (indexActual < secciones.length - 1) {
            const seccionSiguiente = secciones[indexActual + 1];
            setSeccionActiva(seccionSiguiente);

            const seccionData = etapa.secciones.find(s => s.id === seccionSiguiente);
            if (seccionData) {
                speakAndSave(seccionData.audio, etapaAbierta, seccionSiguiente, etapa.titulo, () => {
                    setAudioCompletado(true);
                });
            }
        }
    };

    const irASeccion = async (seccionId) => {
        console.log(`🎯 Navegando a sección: ${seccionId}`);

        const key = `${etapaAbierta}-${seccionId}`;
        if (seccionId !== 'objetivo' && !seccionesVistas[key]) return;

        // 🔥 Esperar a que se detenga completamente el audio
        await stopAudio();

        setSeccionActiva(seccionId);

        const etapa = cards.find(e => e.id === etapaAbierta);
        if (!etapa) return;

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

    const resetAudioState = () => {
        console.log('🧹 Ejecutando resetAudioState...');
        const synth = synthRef.current;

        // 🔥 Limpiar intervalo
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }

        // 🔥 Cancelar síntesis
        try {
            if (synth && synth.speaking) {
                synth.resume(); // Forzar resume antes de cancel
                synth.cancel();
            }
        } catch (e) {
            console.warn('⚠️ Error cancelando síntesis al resetear:', e);
        }

        // 🔥 Limpiar utterance
        if (currentUtteranceRef.current) {
            currentUtteranceRef.current.wasCancelled = true;
            currentUtteranceRef.current.onend = null;
            currentUtteranceRef.current.onboundary = null;
            currentUtteranceRef.current.onerror = null;
            currentUtteranceRef.current.onstart = null;
            currentUtteranceRef.current.onpause = null;
            currentUtteranceRef.current.onresume = null;
            currentUtteranceRef.current = null;
        }

        // 🔥 Resetear TODOS los estados y referencias
        pausedTextRef.current.text = '';
        audioStateRef.current = { isPlaying: false, wasPaused: false };
        pausedByVisibilityRef.current = false;
        audioCompletedRef.current = false;

        setAudioProgress(0);
        setIsPlayingAudio(false);
        setIsPaused(false);
        setAudioCompletado(false);

        console.log('✅ Estado de audio reseteado completamente');
    };


    // =========================================================================
    // SECCIÓN 7: FUNCIONES AUXILIARES
    // =========================================================================

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

            const prioridadMicrosoft = [
                'Microsoft Andrea Online (Natural) - Spanish (Ecuador)',
                'Microsoft Dalia Online (Natural) - Spanish (Mexico)',
                'Microsoft Salome Online (Natural) - Spanish (Colombia)',
                'Microsoft Catalina Online (Natural) - Spanish (Chile)',
                'Microsoft Camila Online (Natural) - Spanish (Peru)',
                'Microsoft Paola Online (Natural) - Spanish (Venezuela)',
            ];

            let mejorOpcion = null;

            for (const nombre of prioridadMicrosoft) {
                mejorOpcion = vocesEspanol.find(v => v.name.toLowerCase().includes(nombre.toLowerCase()));
                if (mejorOpcion) break;
            }

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

    useEffect(() => {
        if (vocesCargadas) {
            const savedProgress = loadProgress();
            setSeccionesVistas(savedProgress.seccionesVistas);
            setEtapasCompletadas(savedProgress.completadas);

            if (savedProgress.completadas.length > 0) {
                const ultimaCompletada = Math.max(...savedProgress.completadas);
                setEtapaActiva(ultimaCompletada < cards.length ? ultimaCompletada + 1 : cards.length);
            } else {
                setEtapaActiva(1);
            }
        }
    }, [vocesCargadas]);

    useEffect(() => {
        if (!isMobile && vocesCargadas && !introStarted) {
            setIntroStarted(true);
        }
    }, [vocesCargadas, isMobile]);

    useEffect(() => {
        if (!isMobile && vocesCargadas && introStarted && !introPlayed) {
            console.log('🎬 Reproduciendo intro...');
            speak(currentModule.audioObjetivo, () => {
                console.log('✅ Intro terminada');
                setIntroPlayed(true);
            });
        }
    }, [isMobile, vocesCargadas, introStarted, introPlayed]);

    useEffect(() => {
        const checkMobile = () => {
            const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
            setIsMobile(isMobileDevice);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            const synth = synthRef.current;

            if (document.hidden) {
                // Solo pausar si realmente está reproduciendo
                if (synth.speaking && !synth.paused && audioStateRef.current.isPlaying) {
                    console.log('👁️ Página oculta: pausando audio...');
                    synth.pause();
                    setIsPaused(true);
                    audioStateRef.current.wasPaused = true;
                    pausedByVisibilityRef.current = true;

                    // 🔥 Limpiar intervalo
                    if (progressIntervalRef.current) {
                        clearInterval(progressIntervalRef.current);
                        progressIntervalRef.current = null;
                    }
                }
            } else {
                // Solo reanudar si fue pausado por visibilidad
                if (pausedByVisibilityRef.current &&
                    audioStateRef.current.isPlaying &&
                    currentUtteranceRef.current &&
                    !currentUtteranceRef.current.wasCancelled &&
                    !isNavigatingRef.current) { // 🔥 No reanudar si estamos navegando

                    console.log('👁️ Página visible: reanudando audio...');

                    setTimeout(() => {
                        try {
                            synth.resume();
                            setIsPaused(false);
                            audioStateRef.current.wasPaused = false;
                            pausedByVisibilityRef.current = false;

                            // 🔥 Recrear intervalo SOLO si no existe
                            const currentText = pausedTextRef.current.text;
                            if (currentText && audioProgress < 98 && !progressIntervalRef.current) {
                                const baseRate = 0.9;
                                const cps = 21 * baseRate;
                                const correctionFactor = 1.08;
                                const estimatedDuration = ((currentText.length / cps) * 1000 * correctionFactor) + 2000;

                                const startTime = Date.now() - (audioProgress / 100 * estimatedDuration);

                                progressIntervalRef.current = setInterval(() => {
                                    const elapsed = Date.now() - startTime;
                                    const progress = Math.min((elapsed / estimatedDuration) * 100, 98);
                                    setAudioProgress(progress);
                                }, 100);

                                console.log('✅ Intervalo recreado en visibilitychange');
                            }

                        } catch (error) {
                            console.error('❌ Error al reanudar:', error);
                            pausedByVisibilityRef.current = false;
                        }
                    }, 100);
                } else {
                    pausedByVisibilityRef.current = false;
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [audioProgress]);// 🔥 Dependencia necesaria

    useEffect(() => {
        const handleBlur = () => {
            const synth = synthRef.current;

            if (synth.speaking && !synth.paused && audioStateRef.current.isPlaying) {
                console.log('🔇 Ventana perdió el foco: pausando...');
                synth.pause();
                setIsPaused(true);
                audioStateRef.current.wasPaused = true;
                pausedByVisibilityRef.current = true;

                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                }
            }
        };

        const handleFocus = () => {
            const synth = synthRef.current;

            if (pausedByVisibilityRef.current &&
                audioStateRef.current.isPlaying &&
                currentUtteranceRef.current &&
                !currentUtteranceRef.current.wasCancelled &&
                !isNavigatingRef.current) { // 🔥 No reanudar si estamos navegando

                console.log('🔊 Ventana recuperó el foco: reanudando...');

                setTimeout(() => {
                    try {
                        synth.resume();
                        setIsPaused(false);
                        audioStateRef.current.wasPaused = false;
                        pausedByVisibilityRef.current = false;

                        const currentText = pausedTextRef.current.text;
                        if (currentText && audioProgress < 98 && !progressIntervalRef.current) {
                            const baseRate = 0.9;
                            const cps = 21 * baseRate;
                            const correctionFactor = 1.08;
                            const estimatedDuration = ((currentText.length / cps) * 1000 * correctionFactor) + 2000;

                            const startTime = Date.now() - (audioProgress / 100 * estimatedDuration);

                            progressIntervalRef.current = setInterval(() => {
                                const elapsed = Date.now() - startTime;
                                const progress = Math.min((elapsed / estimatedDuration) * 100, 98);
                                setAudioProgress(progress);
                            }, 100);

                            console.log('✅ Intervalo recreado en focus');
                        }

                    } catch (error) {
                        console.error('❌ Error al reanudar:', error);
                        pausedByVisibilityRef.current = false;
                    }
                }, 100);
            } else {
                pausedByVisibilityRef.current = false;
            }
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [audioProgress]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            const synth = synthRef.current;
            if (synth.speaking) {
                console.log('🛑 Cerrando página: cancelando audio...');
                if (currentUtteranceRef.current)
                    currentUtteranceRef.current.wasCancelled = true;
                synth.cancel();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            const synth = synthRef.current;
            if (synth.speaking) {
                console.log('🧹 Componente desmontado: cancelando audio...');
                synth.cancel();
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);



    useEffect(() => {
        // Solo limpieza al desmontar o cambiar ruta
        return () => {
            const synth = synthRef.current;
            if (synth.speaking) {
                console.log('🧹 Navegación: cancelando audio...');
                if (currentUtteranceRef.current) {
                    currentUtteranceRef.current.wasCancelled = true;
                }
                synth.cancel();
            }
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, [location]);



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
                            <div className="absolute inset-0 rounded-2xl bg-[#3a3a3f]/40 animate-pulse-radial"></div>
                            <div className="relative w-16 h-16 mb-3 rounded-full bg-[#1f1f23] overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#2c2c2f] via-[#3a3a3f] to-[#2c2c2f] rounded-full animate-pulse-delay"></div>
                            </div>
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
                                        : `bg-gradient-to-br   from-[#0a1a3a]/80 to-[#071D49]/70 backdrop-blur-md border border-[#071D49]/30 shadow-md shadow-[#071D49]/40 hover:border-[#1a4fff] hover:shadow-xl hover:shadow-[#1a4fff]/40 cursor-pointer`
                                    }`}
                            >
                                {estaBloqueada && (
                                    <Lock size={24} className="absolute top-3 right-3 text-slate-500" />
                                )}

                                {estaCompletada && (
                                    <CheckCircle size={24} className="absolute top-3 right-3 text-green-400" />
                                )}

                                <div className={`w-18 h-18 mx-auto mb-2 bg-gradient-to-br ${estaBloqueada ? '' : 'from-[#071D49] to-[#1a4fff]'}  rounded-xl flex items-center justify-center shadow-inner shadow-black/50`}>
                                    <span className={`text-5xl drop-shadow-lg ${!estaBloqueada ? 'grayscale-0' : 'grayscale opacity-40'
                                        }`}>{etapa.icono}</span>
                                </div>

                                <div className="text-white text-center flex flex-col items-center">
                                    <div className="text-xs opacity-75 mb-1">{etapa.numero}</div>
                                    <div className="font-bold text-lg">{etapa.titulo}</div>

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
                const siguienteEsUltima = seccionActiva ===
                    etapaActualData.secciones[etapaActualData.secciones.length - 1]?.id;

                const puedeAvanzar = audioCompletado ||
                    seccionesVistas[`${etapaAbierta}-${seccionActiva}`];

                const bottonSiguienteDisabled = !puedeAvanzar || siguienteEsUltima;

                return (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
                        <div className="bg-gradient-to-br bg-zinc-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-zinc-700 shadow-2xl">
                            {/* Header del modal */}
                            <div className={`bg-gradient-to-r from-[#071D49] to-[#1a4fff]  p-4 flex items-center justify-between`}>
                                <div className="flex items-center gap-3">
                                    {etapaActualData.icono && (
                                        <div className="w-10 h-10 bg-white/40 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                            <span className="text-xl">{etapaActualData.icono}</span>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            {etapaActualData.titulo}
                                        </h3>
                                        <p className="text-blue-100 text-xs">{etapaActualData.numero}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={cerrarEtapa}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Contenido del modal */}
                            <div className="p-2 md:p-4 space-y-2 overflow-y-auto max-h-[calc(90vh-280px)]">
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

                                {seccionActiva && seccionActiva !== 'objetivo' && (
                                    <div className="space-y-3 animate-fadeIn">
                                        {(() => {
                                            const seccionData = etapaActualData.secciones.find(s => s.id === seccionActiva);
                                            if (!seccionData) return null;

                                            return (
                                                <>
                                                    <div className="flex items-center gap-2 text-zinc-300 mb-4">
                                                        {seccionData.icono}
                                                        <h3 className="text-lg md:text-2xl font-bold">{seccionData.titulo}</h3>
                                                    </div>

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

                                {/* Controles de audio y progreso */}
                                <div className="bg-zinc-800 backdrop-blur-sm rounded-lg p-3 border-t border-zinc-700 mb-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <button
                                            onClick={() => {
                                                if (isPlayingAudio) {
                                                    synthRef.current.pause();
                                                    setIsPaused(true);
                                                } else if (isPaused) {
                                                    synthRef.current.resume();
                                                    setIsPaused(false);
                                                }
                                            }}
                                            className={`bg-gradient-to-br from-[#071D49] to-[#1a4fff] w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center flex-shrink-0
                                            ${audioCompletado
                                                    ? 'cursor-not-allowed'
                                                    : 'hover:shadow-lg hover:shadow-blue-500/30 active:scale-95'
                                                }`}
                                            disabled={audioCompletado}
                                        >
                                            <Volume2 className={`w-5 h-5 text-white ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                                        </button>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-slate-300">Progreso</span>
                                                <span className="text-xs font-bold text-blue-400">
                                                    {Math.round(audioProgress)}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#071D49] via-[#0e2e80] to-[#1a4fff] transition-all duration-200 rounded-full"
                                                    style={{ width: `${audioProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {isPlayingAudio && (
                                            <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 rounded-lg p-2">
                                                <div className="flex gap-1">
                                                    <span className="inline-block w-1 h-3 bg-blue-400 rounded-full animate-pulse"></span>
                                                    <span className="inline-block w-1 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                                    <span className="inline-block w-1 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                                </div>
                                                <span className="text-xs font-medium">Reproduciendo audio...</span>
                                            </div>
                                        )}

                                        {audioCompletado && (
                                            <div className="flex items-center gap-2 text-blue-400 bg-blue-400/10 rounded-lg p-2">
                                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-xs">¡Audio completado!</p>
                                                    <p className="text-xs text-blue-300">Puedes avanzar a la siguiente sección</p>
                                                </div>
                                            </div>
                                        )}

                                        {!audioCompletado && !isPlayingAudio && audioProgress === 0 && (
                                            <div className="text-center p-2 text-slate-400 text-xs">
                                                El audio se reproducirá automáticamente
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>



                            {/* Controles de navegación */}
                            <div className="bg-[#151518] border-t-2 border-slate-700 p-4">
                                <div className="flex items-center justify-between gap-1 md:gap-4">
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

                                    <div className="flex gap-2 flex-wrap justify-center">
                                        <button
                                            onClick={() => irASeccion('objetivo')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${seccionActiva === 'objetivo'
                                                ? `bg-[#1a4fff] text-white`
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

                                        {etapaActualData.secciones.map((s) => {
                                            const seccionVista = seccionesVistas[`${etapaAbierta}-${s.id}`];

                                            return (
                                                <button
                                                    key={s.id}
                                                    onClick={() => irASeccion(s.id)}
                                                    disabled={!seccionVista}
                                                    className={`px-2 md:px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${seccionActiva === s.id
                                                        ? `bg-[#1a4fff] text-white`
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

                            {showAudioPopup && (
                                <div
                                    className="fixed bottom-8 lg:bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg text-sm text-center animate-pulse z-[9999]"
                                >
                                    🔊 <strong>Estamos intentando reproducir el audio...</strong><br />
                                    Si el problema persiste, cierra esta etapa y vuelve a cargarla.
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

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
        </div>
    );
}

export default FlipCard;