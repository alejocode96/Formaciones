import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { TrainingLogiTransContext } from '../../Context';
import ModalFlipCard from './modalFlipCard';
import { Volume2, VolumeX, ChevronRight, ChevronLeft, BookOpen, Target, Lightbulb, Wrench, Lock, CheckCircle, X } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
function FlipCard({ currentModule, onContentIsEnded, courseId, moduleId }) {
    // ========================================
    // 🔷 REFS
    // ========================================
    let cards = currentModule.cards;
    // Refs para control de audio
    const currentUtteranceRef = useRef(null);
    const currentCharIndexRef = useRef(0);
    const remainingTextRef = useRef("");
    const currentCallbackRef = useRef(null);

    // Refs para mantener estados actualizados
    const seccionesVistasRef = useRef({});
    const etapasCompletadasRef = useRef([]);
    const etapaActivaRef = useRef(1);

    // ========================================
    // 🔷 CONTEXT & PROPS
    // ========================================

    const { getUserProgressForCourse, completeModule } = React.useContext(TrainingLogiTransContext);
    const courseProgress = getUserProgressForCourse(parseInt(courseId));

    // ========================================
    // 🔷 ESTADOS
    // ========================================

    // Estados de progreso
    const [etapaActiva, setEtapaActiva] = useState(1);
    const [etapasCompletadas, setEtapasCompletadas] = useState([]);
    const [seccionesVistas, setSeccionesVistas] = useState({});

    // Estados de modal y navegación
    const [etapaAbierta, setEtapaAbierta] = useState(null);
    const [seccionActiva, setSeccionActiva] = useState(null);

    // Estados de audio
    const [audioCompletado, setAudioCompletado] = useState(false);
    const [audioEnReproduccion, setAudioEnReproduccion] = useState(false);
    const [audioIntroReproducido, setAudioIntroReproducido] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [mejorVoz, setMejorVoz] = useState(null);

    // Estados de UI
    const [introMostrada, setIntroMostrada] = useState(false);
    const [requiereInteraccion, setRequiereInteraccion] = useState(false);
    const [mostrarCards, setMostrarCards] = useState(false);
    const [vocesCargadas, setVocesCargadas] = useState(false);
    // Datos de etapa actual
    const etapaActualData = etapaAbierta ? cards.find(e => e.id === etapaAbierta) : null;

    // ========================================
    // 🔷 FUNCIONES DE GUARDADO
    // ========================================

    const guardarProgresoDirecto = useCallback((seccionesVistasActual, etapasCompletadasActual, etapaActivaActual) => {
        try {
            const storedProgress = localStorage.getItem("userProgress");
            const allProgress = storedProgress ? JSON.parse(storedProgress) : {};

            const progresoPrevio = allProgress?.[courseId]?.flipCardProgress?.[moduleId] || {};

            const mergedSecciones = {
                ...(progresoPrevio.seccionesVistas || {}),
                ...seccionesVistasActual,
            };

            const mergedEtapas = Array.from(
                new Set([...(progresoPrevio.etapasCompletadas || []), ...etapasCompletadasActual])
            );

            const todasEtapasCompletadas = mergedEtapas.length === cards.length;

            const updatedCourseProgress = {
                ...allProgress[courseId],
                flipCardProgress: {
                    ...allProgress[courseId]?.flipCardProgress,
                    [moduleId]: {
                        seccionesVistas: mergedSecciones,
                        etapasCompletadas: mergedEtapas,
                        etapaActiva: etapaActivaActual,
                        completado: todasEtapasCompletadas,
                        lastUpdated: new Date().toISOString(),
                    },
                },
            };

            allProgress[courseId] = updatedCourseProgress;
            localStorage.setItem("userProgress", JSON.stringify(allProgress));

            console.log("💾 Progreso fusionado guardado correctamente:", {
                seccionesVistas: mergedSecciones,
                etapasCompletadas: mergedEtapas,
                etapaActiva: etapaActivaActual,
            });
        } catch (error) {
            console.error("❌ Error al guardar progreso:", error);
        }
    }, [courseId, moduleId, cards.length]);

    const saveFlipCardProgress = useCallback(() => {
        if (!courseProgress) return;
        guardarProgresoDirecto(
            seccionesVistasRef.current,
            etapasCompletadasRef.current,
            etapaActivaRef.current
        );
    }, [courseProgress, guardarProgresoDirecto]);

    // ========================================
    // 🔷 FUNCIONES DE AUDIO
    // ========================================

    const cargarVoces = useCallback(() => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices.length) {
            // Si aún no hay voces, reintentar después de un delay
            setTimeout(cargarVoces, 200); // Reintenta cada 200ms hasta cargarlas
            return;
        };

        const vocesEspanol = voices.filter(v => v.lang.toLowerCase().startsWith('es'));

        const prioridadMicrosoft = [
            'Microsoft Andrea Online (Natural) - Spanish (Ecuador)',
            'Microsoft Dalia Online (Natural) - Spanish (Mexico)',
            // 'Microsoft Camila Online (Natural) - Spanish (Peru)',
            // 'Microsoft Catalina Online (Natural) - Spanish (Chile)',
            // 'Microsoft Paola Online (Natural) - Spanish (Venezuela)',
            // 'Microsoft Yolanda Online (Natural) - Spanish (Nicaragua)',
            // 'Microsoft Salome Online (Natural) - Spanish (Colombia)',
        ];

        let mejorOpcion = null;

        for (const nombre of prioridadMicrosoft) {
            mejorOpcion = vocesEspanol.find(v => v.name.toLowerCase().includes(nombre.toLowerCase()));
            if (mejorOpcion) break;
        }

        if (!mejorOpcion) {
            const vocesFemeninas = vocesEspanol.filter(v =>
                /(female|mujer|paulina|monica|soledad|camila|lucia|maría|carla|rosa|laura|catalina|dalia|salome|andrea|paola)/i.test(v.name)
            );

            mejorOpcion =
                vocesFemeninas.find(v => v.name.toLowerCase().includes('monica')) ||
                vocesFemeninas.find(v => v.name.toLowerCase().includes('paulina')) ||
                vocesFemeninas.find(v => v.name.toLowerCase().includes('camila')) ||
                vocesFemeninas.find(v => v.name.toLowerCase().includes('catalina')) ||
                vocesFemeninas.find(v => v.name.toLowerCase().includes('salome')) ||
                vocesFemeninas.find(v => v.name.toLowerCase().includes('andrea')) ||
                vocesFemeninas.find(v => v.name.toLowerCase().includes('dalia')) ||
                vocesFemeninas.find(v => v.name.toLowerCase().includes('paola')) ||
                vocesFemeninas.find(v => v.name.toLowerCase().includes('google')) ||
                vocesFemeninas.find(v => v.name.toLowerCase().includes('microsoft')) ||
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
    }, []);

    const reproducirAudio = useCallback((texto, callback, yaVista = false, esUltimaSeccion = false) => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setAudioEnReproduccion(false);

        if (!audioEnabled || !mejorVoz) {
            setAudioCompletado(true);
            if (callback) callback();
            return;
        }

        if (!yaVista) {
            setAudioCompletado(false);
        }

        setAudioEnReproduccion(true);
        currentCallbackRef.current = callback;

        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.voice = mejorVoz;
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;

        utterance.onstart = () => setIsPlaying(true);

        utterance.onend = () => {
            setIsPlaying(false);
            setAudioCompletado(true);
            setAudioEnReproduccion(false);

            if (callback) {
                callback();
            }

            if (esUltimaSeccion && etapaAbierta) {
                setTimeout(() => {
                    console.log('✅ Última sección completada, verificando etapa...');
                    verificarEtapaCompletada(etapaAbierta);
                }, 100);
            }
        };

        utterance.onerror = () => {
            setIsPlaying(false);
            setAudioEnReproduccion(false);
        };

        utterance.onboundary = (event) => {
            currentCharIndexRef.current = event.charIndex;
        };

        currentUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [audioEnabled, mejorVoz, etapaAbierta]);

    const iniciarAudioIntroduccion = useCallback(() => {
        setAudioIntroReproducido(true);
        setAudioEnReproduccion(true);
        setMostrarCards(false);
        setRequiereInteraccion(false);

        const textoIntro = currentModule.audioObjetivo;
        const utterance = new SpeechSynthesisUtterance(textoIntro);
        utterance.voice = mejorVoz;
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        const timeoutId = setTimeout(() => {
            if (!window.speechSynthesis.speaking) {
                console.warn('⚠️ Audio bloqueado o no se pudo reproducir, mostrando cards');
                setAudioEnReproduccion(false);
                setMostrarCards(true);
            }
        }, 2000);

        utterance.onstart = () => {
            clearTimeout(timeoutId);
            console.log('✅ Audio de introducción iniciado correctamente');
        };

        utterance.onend = () => {
            clearTimeout(timeoutId);
            setAudioEnReproduccion(false);
            setMostrarCards(true);
        };

        utterance.onerror = (error) => {
            clearTimeout(timeoutId);
            console.error('❌ Error en audio de introducción:', error);
            setAudioEnReproduccion(false);
            setMostrarCards(true);
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }, [mejorVoz]);

    // ========================================
    // 🔷 FUNCIONES DE NAVEGACIÓN Y CONTROL
    // ========================================

    const verificarEtapaCompletada = useCallback((etapaId) => {
        const etapa = cards.find(e => e.id === etapaId);
        const todasLasSecciones = ['objetivo', ...etapa.secciones.map(s => s.id)];

        setTimeout(() => {
            const seccionesActuales = seccionesVistasRef.current;
            const etapasCompletadasActuales = etapasCompletadasRef.current;

            const todasVistas = todasLasSecciones.every(seccion =>
                seccionesActuales[`${etapaId}-${seccion}`] === true
            );

            console.log('🔍 Verificando etapa:', etapaId);
            console.log('📋 Secciones actuales:', seccionesActuales);
            console.log('✅ Todas vistas:', todasVistas);

            if (todasVistas && !etapasCompletadasActuales.includes(etapaId)) {
                console.log('✅ Etapa completada:', etapaId);

                const nuevasEtapasCompletadas = [...etapasCompletadasActuales, etapaId];
                const nuevaEtapaActiva = etapaId < cards.length ? etapaId + 1 : etapaId;

                setEtapasCompletadas(nuevasEtapasCompletadas);
                if (etapaId < cards.length) {
                    setEtapaActiva(nuevaEtapaActiva);
                }

                guardarProgresoDirecto(
                    seccionesActuales,
                    nuevasEtapasCompletadas,
                    nuevaEtapaActiva
                );

                if (etapaId === cards.length) {
                    console.log("🎉 Última etapa completada, guardando definitivamente...");
                    guardarProgresoDirecto(seccionesActuales, nuevasEtapasCompletadas, nuevaEtapaActiva);

                    setTimeout(() => {
                        console.log("🚀 Llamando a onContentIsEnded");
                        if (onContentIsEnded) onContentIsEnded();
                    }, 800);
                }
            }
        }, 200);
    }, [cards, guardarProgresoDirecto, onContentIsEnded]);

    const abrirEtapa = useCallback((etapaId) => {
        if (etapaId > etapaActiva) return;

        setEtapaAbierta(etapaId);
        setSeccionActiva('objetivo');

        const etapa = cards.find(e => e.id === etapaId);
        const seccionKey = `${etapaId}-objetivo`;

        const yaVista = seccionesVistas[seccionKey] === true;
        if (yaVista) {
            setAudioCompletado(true);
        }

        const todasLasSecciones = ['objetivo', ...etapa.secciones.map(s => s.id)];
        const esUltimaSeccion = todasLasSecciones.length === 1;

        reproducirAudio(etapa.audioObjetivo, () => {
            setSeccionesVistas(prev => ({
                ...prev,
                [seccionKey]: true
            }));
        }, yaVista, esUltimaSeccion);
    }, [etapaActiva, cards, seccionesVistas, reproducirAudio]);

    const cerrarModal = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setAudioEnReproduccion(false);
        setAudioCompletado(false);

        if (etapaAbierta) {
            verificarEtapaCompletada(etapaAbierta);
        }

        setEtapaAbierta(null);
        setSeccionActiva(null);
    }, [etapaAbierta, verificarEtapaCompletada]);

    const puedeAvanzarASeccion = useCallback((seccionActual, nuevaSeccion) => {
        if (!etapaAbierta) return false;

        const etapa = cards.find(e => e.id === etapaAbierta);
        const secciones = ['objetivo', ...etapa.secciones.map(s => s.id)];
        const indexActual = secciones.indexOf(seccionActual);
        const indexNueva = secciones.indexOf(nuevaSeccion);

        const currentKey = `${etapaAbierta}-${seccionActual}`;

        if (indexNueva < indexActual) return true;
        if (seccionesVistas[currentKey]) return true;

        return false;
    }, [etapaAbierta, cards, seccionesVistas]);

    const cambiarSeccion = useCallback((nuevaSeccion) => {
        if (!etapaAbierta) return;

        const etapa = cards.find(e => e.id === etapaAbierta);
        const seccionKey = `${etapaAbierta}-${nuevaSeccion}`;
        const yaVista = seccionesVistas[seccionKey] === true;

        const todasLasSecciones = ['objetivo', ...etapa.secciones.map(s => s.id)];
        const esUltimaSeccion = nuevaSeccion === todasLasSecciones[todasLasSecciones.length - 1];

        setSeccionActiva(nuevaSeccion);
        setAudioCompletado(yaVista);

        const reproducir = (texto) => {
            reproducirAudio(texto, () => {
                setSeccionesVistas(prev => ({ ...prev, [seccionKey]: true }));

                if (!esUltimaSeccion) {
                    setTimeout(() => {
                        verificarEtapaCompletada(etapaAbierta);
                    }, 100);
                }

                if (yaVista) setAudioCompletado(true);
            }, yaVista, esUltimaSeccion);
        };

        if (nuevaSeccion === 'objetivo') {
            reproducir(etapa.audioObjetivo);
        } else {
            const seccion = etapa.secciones.find(s => s.id === nuevaSeccion);
            reproducir(seccion.audio);
        }
    }, [etapaAbierta, cards, seccionesVistas, reproducirAudio, verificarEtapaCompletada]);

    const siguienteSeccion = useCallback(() => {
        if (!etapaAbierta) return;
        const etapa = cards.find(e => e.id === etapaAbierta);
        const secciones = ['objetivo', ...etapa.secciones.map(s => s.id)];
        const currentIndex = secciones.indexOf(seccionActiva);

        if (currentIndex < secciones.length - 1) {
            const currentKey = `${etapaAbierta}-${seccionActiva}`;

            if (seccionesVistas[currentKey]) {
                cambiarSeccion(secciones[currentIndex + 1]);
            }
        }
    }, [etapaAbierta, cards, seccionActiva, seccionesVistas, cambiarSeccion]);

    const anteriorSeccion = useCallback(() => {
        if (!etapaAbierta) return;
        const etapa = cards.find(e => e.id === etapaAbierta);
        const secciones = ['objetivo', ...etapa.secciones.map(s => s.id)];
        const currentIndex = secciones.indexOf(seccionActiva);

        if (currentIndex > 0) {
            const seccionAnterior = secciones[currentIndex - 1];
            const keyAnterior = `${etapaAbierta}-${seccionAnterior}`;

            const yaVista = seccionesVistas[keyAnterior] === true;
            setAudioCompletado(yaVista);

            cambiarSeccion(seccionAnterior);
        }
    }, [etapaAbierta, cards, seccionActiva, seccionesVistas, cambiarSeccion]);

    // ========================================
    // 🔷 EFFECTS - Sincronización de Refs
    // ========================================

    useEffect(() => {
        seccionesVistasRef.current = seccionesVistas;
    }, [seccionesVistas]);

    useEffect(() => {
        etapasCompletadasRef.current = etapasCompletadas;
    }, [etapasCompletadas]);

    useEffect(() => {
        etapaActivaRef.current = etapaActiva;
    }, [etapaActiva]);

    // ========================================
    // 🔷 EFFECTS - Carga de Progreso
    // ========================================

    useEffect(() => {
        if (courseProgress && courseProgress.flipCardProgress) {
            const flipCardData = courseProgress.flipCardProgress[moduleId];

            if (flipCardData) {
                setSeccionesVistas(flipCardData.seccionesVistas || {});
                setEtapasCompletadas(flipCardData.etapasCompletadas || []);
                setEtapaActiva(flipCardData.etapaActiva || 1);

                console.log('✅ Progreso de FlipCard cargado desde localStorage:', flipCardData);
            }
        }
    }, [courseProgress, moduleId]);

    // ========================================
    // 🔷 EFFECTS - Guardado Automático
    // ========================================

    useEffect(() => {
        if (Object.keys(seccionesVistas).length > 0 || etapasCompletadas.length > 0) {
            const timeoutId = setTimeout(() => {
                saveFlipCardProgress();
            }, 150);

            return () => clearTimeout(timeoutId);
        }
    }, [seccionesVistas, etapasCompletadas, etapaActiva, saveFlipCardProgress]);

    useEffect(() => {
        return () => {
            console.log('🔄 Componente desmontándose - Guardando progreso final');
            if (Object.keys(seccionesVistasRef.current).length > 0 || etapasCompletadasRef.current.length > 0) {
                guardarProgresoDirecto(
                    seccionesVistasRef.current,
                    etapasCompletadasRef.current,
                    etapaActivaRef.current
                );
            }
        };
    }, [guardarProgresoDirecto]);

    // ========================================
    // 🔷 EFFECTS - Voces y Audio
    // ========================================

    useEffect(() => {
        const handleVoicesChanged = () => {
            cargarVoces();
        };

        // Escuchar cambios de voces
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

        // Intentar cargar inmediatamente (por si ya están disponibles)
        cargarVoces();

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        };
    }, [cargarVoces]);

    useEffect(() => {
        if (audioIntroReproducido) return;

        const esMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (esMovil) {
            setRequiereInteraccion(true);
            setMostrarCards(false);
            return;
        }


        if (vocesCargadas && mejorVoz) {
            iniciarAudioIntroduccion();
        }
    }, [mejorVoz, audioIntroReproducido, iniciarAudioIntroduccion]);

    // ========================================
    // 🔷 EFFECTS - Control de Audio en Cambio de Visibilidad
    // ========================================

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (window.speechSynthesis.speaking && currentUtteranceRef.current) {
                    const textoOriginal = currentUtteranceRef.current.text;
                    const posicion = currentCharIndexRef.current;
                    remainingTextRef.current = textoOriginal.slice(posicion);
                    window.speechSynthesis.cancel();
                    setIsPlaying(false);
                    setAudioEnReproduccion(false);
                    console.log("🔇 Audio pausado y posición guardada");
                }
            } else if (remainingTextRef.current && !window.speechSynthesis.speaking) {
                const utterance = new SpeechSynthesisUtterance(remainingTextRef.current);
                utterance.voice = mejorVoz;
                utterance.lang = 'es-ES';
                utterance.rate = 0.9;
                utterance.pitch = 1;
                utterance.volume = 0.8;

                utterance.onboundary = (event) => {
                    currentCharIndexRef.current = event.charIndex;
                };

                utterance.onend = () => {
                    if (typeof currentCallbackRef.current === 'function') {
                        currentCallbackRef.current();
                    }
                    remainingTextRef.current = "";
                    currentUtteranceRef.current = null;
                    currentCharIndexRef.current = 0;
                    currentCallbackRef.current = null;
                    setIsPlaying(false);
                    setAudioEnReproduccion(false);
                    setAudioCompletado(true);
                    console.log("✅ Audio reanudado completamente y marcado como completado");
                };

                currentUtteranceRef.current = utterance;
                window.speechSynthesis.speak(utterance);
                setIsPlaying(true);
                setAudioEnReproduccion(true);
                console.log("▶️ Audio reanudado al volver a la pestaña");
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.speechSynthesis.cancel();
        };
    }, [mejorVoz]);

    // ========================================
    // 🔷 EFFECTS - Verificación Automática de Etapa Completada
    // ========================================

    useEffect(() => {
        if (!etapaAbierta) return;

        const etapa = cards.find(e => e.id === etapaAbierta);
        const todasLasSecciones = ['objetivo', ...etapa.secciones.map(s => s.id)];

        const todasVistas = todasLasSecciones.every(seccion =>
            seccionesVistas[`${etapaAbierta}-${seccion}`]
        );

        if (todasVistas && !etapasCompletadas.includes(etapaAbierta)) {
            console.log('🎯 Etapa completada detectada automáticamente');
            verificarEtapaCompletada(etapaAbierta);
        }
    }, [seccionesVistas, etapaAbierta, etapasCompletadas, cards, verificarEtapaCompletada]);



    // En tu FlipCard, después de mostrar las cards:
    useEffect(() => {
        if (mostrarCards) {
            AOS.refresh(); // Actualiza AOS con los nuevos elementos
        }
    }, [mostrarCards]);

    // ========================================
    // 🔷 RENDER
    // ========================================

    return (
        <div className='w-full mx-auto pt-10 pb-14 lg:pb-0' data-aos="fade-up" data-aos-delay={300} data-aos-duration="600">
            {/* Botón de interacción móvil */}
            {requiereInteraccion && (
                <div
                    onClick={iniciarAudioIntroduccion}
                    className="relative w-full h-full flex items-center justify-center   rounded-xl cursor-pointer min-h-[400px]"
                >
                    {/* Borde exterior */}
                    <div className="absolute inset-0   rounded-xl scale-[1.03] pointer-events-none"></div>

                    <div className="text-center py-2 z-10">
                        <p className="text-white text-2xl md:text-3xl font-light animate-pulse">
                            Click para iniciar
                        </p>
                    </div>
                </div>


            )}

            {/* Texto introductorio */}
            {!requiereInteraccion && (
                <div className="text-center px-6 py-10 max-w-3xl mx-auto animate-fadeIn" data-aos="fade-up">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-0">
                        {currentModule.name}
                    </h1>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                        {currentModule.objetivo}
                    </p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-aos="fade-up">
                {cards.map((etapa) => {

                    if (audioEnReproduccion && !etapaAbierta) {
                        return (
                            <div
                                key={etapa.id}
                                className="relative flex flex-col items-center justify-center p-6 rounded-2xl border-1 border-[#2c2c2f] bg-[#121214] overflow-hidden"
                            >
                                {/* Fondo con efecto radial pulse */}
                                <div className="absolute inset-0 rounded-2xl bg-[#3a3a3f]/40 animate-pulse-radial"></div>

                                {/* Skeleton del ícono */}
                                <div className="relative w-16 h-16 mb-3 rounded-full bg-[#1f1f23] overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#2c2c2f] via-[#3a3a3f] to-[#2c2c2f] rounded-full animate-pulse-delay"></div>
                                </div>

                                {/* Skeleton del texto */}
                                <div className="w-full space-y-2 mt-2">
                                    <div className="h-3 bg-[#1f1f23] rounded w-1/3 mx-auto animate-pulse delay-75"></div>
                                    <div className="h-5 bg-[#1f1f23] rounded w-2/3 mx-auto animate-pulse delay-150"></div>
                                    <div className="h-4 bg-[#1f1f23] rounded w-4/5 mx-auto mt-4 animate-pulse delay-200"></div>
                                </div>
                            </div>

                        );
                    }
                })}
            </div>


            {/* Grid de cards de etapas */}
            {mostrarCards && (
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
                                ${estaBloqueada ? 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed' : `bg-gradient-to-br ${etapa.color} border-transparent hover:scale-105 hover:shadow-2xl cursor-pointer`}`}
                            >
                                {estaBloqueada && (
                                    <Lock size={24} className="absolute top-3 right-3 text-slate-500" />
                                )}
                                {estaCompletada && (
                                    <CheckCircle size={24} className="absolute top-3 right-3 text-green-400" />
                                )}

                                <div className="text-5xl mb-3">{etapa.icono}</div>

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

            {/* Modal de etapa */}
            {etapaAbierta && etapaActualData && (
                <ModalFlipCard etapaActualData={etapaActualData} onClose={cerrarModal}>
                    <div className="p-2 md:p-4 space-y-2">
                        {/* Sección Objetivo */}
                        {seccionActiva === 'objetivo' && (
                            <div className="space-y-2 animate-fadeIn">
                                <div className="flex items-center gap-2 text-zinc-200 mb-1">
                                    <h3 className="text-md md:text-2xl font-bold">Objetivo</h3>
                                </div>
                                <p className="text-slate-300 leading-relaxed text-sm md:text-lg">
                                    {etapaActualData.objetivo}
                                </p>
                            </div>
                        )}

                        {/* Otras secciones */}
                        {seccionActiva && seccionActiva !== 'objetivo' && (
                            <div className="space-y-3 animate-fadeIn">
                                {(() => {
                                    const seccionData = etapaActualData.secciones.find(s => s.id === seccionActiva);
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
                    </div>

                    {/* Controles de navegación */}
                    <div className="bg-[#151518] border-t-2 border-slate-700 p-4">
                        <div className="flex items-center justify-between gap-1 md:gap-4">
                            {/* Botón Anterior */}
                            <button
                                onClick={anteriorSeccion}
                                disabled={seccionActiva === 'objetivo'}
                                className={`flex items-center gap-2 px-1 md:px-4 py-2 rounded-lg font-medium transition-all ${seccionActiva === 'objetivo'
                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                    : 'bg-slate-700 text-white hover:bg-slate-600'
                                    }`}
                            >
                                <ChevronLeft size={20} />
                                <span className='hidden md:block'>Anterior</span>
                            </button>

                            {/* Botones de secciones */}
                            <div className="flex gap-2 flex-wrap justify-center">
                                <button
                                    onClick={() => cambiarSeccion('objetivo')}
                                    disabled={!audioCompletado && seccionActiva !== 'objetivo' && !seccionesVistas[`${etapaAbierta}-objetivo`]}
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

                                {etapaActualData.secciones.map((s) => {
                                    const seccionVista = seccionesVistas[`${etapaAbierta}-${s.id}`];
                                    const puedeAcceder = puedeAvanzarASeccion(seccionActiva, s.id);

                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => cambiarSeccion(s.id)}
                                            disabled={!puedeAcceder}
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

                            {/* Botón Siguiente */}
                            <button
                                onClick={siguienteSeccion}
                                disabled={
                                    !audioCompletado ||
                                    seccionActiva === etapaActualData.secciones[etapaActualData.secciones.length - 1].id
                                }
                                className={`flex items-center gap-2 px-1 md:px-4 py-2 rounded-lg font-medium transition-all ${!audioCompletado ||
                                    seccionActiva === etapaActualData.secciones[etapaActualData.secciones.length - 1].id
                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                    : 'bg-slate-700 text-white hover:bg-slate-600'
                                    }`}
                            >
                                <span className='hidden md:block'>Siguiente</span>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </ModalFlipCard>
            )}
        </div>
    );
}

export default FlipCard;