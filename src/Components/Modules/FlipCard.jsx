import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { TrainingLogiTransContext } from '../../Context';

import ModalFlipCard from './modalFlipCard';
import { Volume2, VolumeX, ChevronRight, ChevronLeft, BookOpen, Target, Lightbulb, Wrench, Lock, CheckCircle, X } from 'lucide-react';

function FlipCard({ cards, onContentIsEnded, courseId, moduleId }) {
    // 🧠 Refs para manejar pausa/reanudación del audio
    const currentUtteranceRef = React.useRef(null);
    const currentCharIndexRef = React.useRef(0);
    const remainingTextRef = React.useRef("");
    const currentCallbackRef = React.useRef(null);
    const audioTimeoutRef = React.useRef(null);
    const audioStartedRef = React.useRef(false); // 🟢 NUEVO: Detectar si el audio realmente inició

    const { getUserProgressForCourse } = React.useContext(TrainingLogiTransContext);

    // 🔹 Obtener progreso del curso desde el contexto
    const courseProgress = getUserProgressForCourse(parseInt(courseId));

    // Control de progreso
    const [etapaActiva, setEtapaActiva] = useState(1);
    const [etapasCompletadas, setEtapasCompletadas] = useState([]);

    const [etapaAbierta, setEtapaAbierta] = useState(null);
    const [seccionActiva, setSeccionActiva] = useState(null);
    const [seccionesVistas, setSeccionesVistas] = useState({});
    const [audioCompletado, setAudioCompletado] = useState(false);
    const [audioEnReproduccion, setAudioEnReproduccion] = useState(false);
    const [audioIntroReproducido, setAudioIntroReproducido] = useState(false);
    const etapaActualData = etapaAbierta ? cards.find(e => e.id === etapaAbierta) : null;
    const [mostrarCards, setMostrarCards] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [mejorVoz, setMejorVoz] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // 🟢 NUEVO: Detectar móvil
    const [isMobile, setIsMobile] = useState(false);

    // 🟢 Detectar si es móvil al cargar
    useEffect(() => {
        const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        setIsMobile(checkMobile);
    }, []);

    // 🔹 CARGAR PROGRESO DESDE EL CONTEXTO/LOCALSTORAGE AL MONTAR
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

    // 🔹 GUARDAR PROGRESO EN LOCALSTORAGE CADA VEZ QUE CAMBIE
    const saveFlipCardProgress = useCallback(() => {
        if (!courseProgress) return;
        try {
            const storedProgress = localStorage.getItem("userProgress");
            const allProgress = storedProgress ? JSON.parse(storedProgress) : {};

            const updatedCourseProgress = {
                ...allProgress[courseId],
                flipCardProgress: {
                    ...allProgress[courseId]?.flipCardProgress,
                    [moduleId]: {
                        seccionesVistas,
                        etapasCompletadas,
                        etapaActiva,
                        lastUpdated: new Date().toISOString()
                    }
                }
            };

            allProgress[courseId] = updatedCourseProgress;
            localStorage.setItem("userProgress", JSON.stringify(allProgress));

            console.log('💾 Progreso de FlipCard guardado en localStorage');
        } catch (error) {
            console.error('❌ Error al guardar progreso de FlipCard:', error);
        }
    }, [seccionesVistas, etapasCompletadas, etapaActiva, courseId, moduleId, courseProgress]);


    useEffect(() => {
        if (Object.keys(seccionesVistas).length > 0 || etapasCompletadas.length > 0) {
            saveFlipCardProgress();
        }
    }, [seccionesVistas, etapaActiva, saveFlipCardProgress]);


    useEffect(() => {
        const cargarVoces = () => {
            const voices = window.speechSynthesis.getVoices();
            if (!voices.length) return;

            const vocesEspanol = voices.filter(v => v.lang.toLowerCase().startsWith('es'));

            const prioridadMicrosoft = [
                'Microsoft Andrea Online (Natural) - Spanish (Ecuador)',
                'Microsoft Dalia Online (Natural) - Spanish (Mexico)',
                'Microsoft Camila Online (Natural) - Spanish (Peru)',
                'Microsoft Catalina Online (Natural) - Spanish (Chile)',
                'Microsoft Paola Online (Natural) - Spanish (Venezuela)',
                'Microsoft Yolanda Online (Natural) - Spanish (Nicaragua)',
                'Microsoft Salome Online (Natural) - Spanish (Colombia)',
            ];

            let mejorOpcion = null;

            for (const nombre of prioridadMicrosoft) {
                mejorOpcion = vocesEspanol.find(v => v.name.toLowerCase().includes(nombre.toLowerCase()));
                if (mejorOpcion) break;
            }

            if (!mejorOpcion) {
                mejorOpcion =
                    vocesEspanol.find(v => v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('espa')) ||
                    vocesEspanol.find(v => v.name.toLowerCase().includes('monica')) ||
                    vocesEspanol.find(v => v.name.toLowerCase().includes('paulina')) ||
                    vocesEspanol.find(v => v.name.toLowerCase().includes('google')) ||
                    vocesEspanol.find(v => v.name.toLowerCase().includes('microsoft')) ||
                    vocesEspanol[0];
            }

            if (mejorOpcion) {
                setMejorVoz(mejorOpcion);
                console.log(`✅ Voz seleccionada: ${mejorOpcion.name} [${mejorOpcion.lang}]`);
            } else {
                console.warn('⚠️ No se encontró ninguna voz en español.');
            }
        };

        cargarVoces();

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = cargarVoces;
        }
    }, []);

    // 🟢 MODIFICADO: Detectar correctamente si el audio falló o solo se pausó
    const reproducirAudio = useCallback((texto, callback, yaVista = false, esUltimaSeccion = false) => {
        // Limpiar timeout anterior si existe
        if (audioTimeoutRef.current) {
            clearTimeout(audioTimeoutRef.current);
            audioTimeoutRef.current = null;
        }

        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setAudioEnReproduccion(false);
        audioStartedRef.current = false; // 🟢 Resetear flag

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

        utterance.onstart = () => {
            setIsPlaying(true);
            audioStartedRef.current = true; // 🟢 Marcamos que SÍ inició
            // Limpiar timeout si el audio sí inició
            if (audioTimeoutRef.current) {
                clearTimeout(audioTimeoutRef.current);
                audioTimeoutRef.current = null;
            }
        };

        utterance.onend = () => {
            setIsPlaying(false);
            setAudioCompletado(true);
            setAudioEnReproduccion(false);

            if (callback) callback();

            if (esUltimaSeccion && etapaAbierta) {
                setTimeout(() => {
                    console.log('✅ Última sección completada, verificando etapa...');
                    verificarEtapaCompletada(etapaAbierta);
                }, 200);
            }
        };

        utterance.onerror = (event) => {
            console.warn('⚠️ Error en audio:', event);
            setIsPlaying(false);
            setAudioEnReproduccion(false);
            
            // 🟢 SOLO habilitar contenido si el audio NUNCA inició
            if (!audioStartedRef.current) {
                console.warn('⚠️ Audio falló (nunca inició), habilitando contenido');
                setAudioCompletado(true);
                if (callback) callback();
            }
        };

        currentUtteranceRef.current = utterance;
        utterance.onboundary = (event) => {
            currentCharIndexRef.current = event.charIndex;
        };

        try {
            window.speechSynthesis.speak(utterance);
            
            // 🟢 TIMEOUT: Si después de 2 segundos no inició, habilitar contenido
            audioTimeoutRef.current = setTimeout(() => {
                if (!audioStartedRef.current) {
                    console.warn('⚠️ Audio no se inició en 2s, habilitando contenido automáticamente');
                    window.speechSynthesis.cancel();
                    setIsPlaying(false);
                    setAudioEnReproduccion(false);
                    setAudioCompletado(true);
                    if (callback) callback();
                }
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error al reproducir audio:', error);
            setAudioCompletado(true);
            if (callback) callback();
        }
    }, [audioEnabled, mejorVoz, etapaAbierta]);


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
    }, [seccionesVistas]);

    // 🟢 MODIFICADO: Solo en desktop
    useEffect(() => {
        if (isMobile) return; // No ejecutar en móviles

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
    }, [mejorVoz, isMobile]);

    // 🟢 NUEVO: Función para iniciar automáticamente (simula click del usuario en móvil)
    const iniciarAutomaticamente = useCallback(() => {
        if (!mejorVoz) return;

        const textoIntro = "Etapas del SARLAFT. El SARLAFT funciona como un ciclo de protección que nunca se detiene. Sus etapas son: identificación, medición, control y monitoreo. Haz clic sobre cada etapa para ver su información.";
        
        const utterance = new SpeechSynthesisUtterance(textoIntro);
        utterance.voice = mejorVoz;
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onend = () => {
            setAudioEnReproduccion(false);
            setMostrarCards(true);
            setAudioIntroReproducido(true);
        };

        utterance.onerror = () => {
            console.warn('⚠️ Error en intro, mostrando cards');
            setMostrarCards(true);
            setAudioIntroReproducido(true);
        };

        try {
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
            setAudioEnReproduccion(true);
            
            // Timeout de seguridad
            setTimeout(() => {
                if (!mostrarCards) {
                    console.warn('⚠️ Timeout intro, mostrando cards');
                    setMostrarCards(true);
                    setAudioIntroReproducido(true);
                }
            }, 15000);
        } catch (error) {
            console.error('❌ Error al reproducir intro:', error);
            setMostrarCards(true);
            setAudioIntroReproducido(true);
        }
    }, [mejorVoz, mostrarCards]);

    // 🟢 MODIFICADO: Auto-iniciar en móviles y desktop
    useEffect(() => {
        if (audioIntroReproducido || !mejorVoz) return;
        
        setAudioIntroReproducido(true);
        
        if (isMobile) {
            // En móvil: simular interacción con un pequeño delay
            const timer = setTimeout(() => {
                iniciarAutomaticamente();
            }, 500);
            return () => clearTimeout(timer);
        } else {
            // En desktop: iniciar inmediatamente
            setAudioEnReproduccion(true);
            setMostrarCards(false);

            const textoIntro = "Etapas del SARLAFT. El SARLAFT funciona como un ciclo de protección que nunca se detiene. Sus etapas son: identificación, medición, control y monitoreo. Haz clic sobre cada etapa para ver su información.";

            const utterance = new SpeechSynthesisUtterance(textoIntro);
            utterance.voice = mejorVoz;
            utterance.lang = 'es-ES';
            utterance.rate = 0.9;
            utterance.pitch = 1;

            utterance.onend = () => {
                setAudioEnReproduccion(false);
                setMostrarCards(true);
            };
            utterance.onerror = () => {setMostrarCards(true);}
            
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    }, [mejorVoz, audioIntroReproducido, isMobile, iniciarAutomaticamente]);


    const abrirEtapa = (etapaId) => {
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
    };

    const cerrarModal = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setAudioEnReproduccion(false);
        setAudioCompletado(false);

        if (etapaAbierta) {
            verificarEtapaCompletada(etapaAbierta);
        }

        setEtapaAbierta(null);
        setSeccionActiva(null);
    };

    const puedeAvanzarASeccion = (seccionActual, nuevaSeccion) => {
        if (!etapaAbierta) return false;

        const etapa = cards.find(e => e.id === etapaAbierta);
        const secciones = ['objetivo', ...etapa.secciones.map(s => s.id)];
        const indexActual = secciones.indexOf(seccionActual);
        const indexNueva = secciones.indexOf(nuevaSeccion);

        const currentKey = `${etapaAbierta}-${seccionActual}`;

        if (indexNueva < indexActual) return true;
        if (seccionesVistas[currentKey]) return true;

        return false;
    };

    const cambiarSeccion = (nuevaSeccion) => {
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
                verificarEtapaCompletada(etapaAbierta);
                if (yaVista) setAudioCompletado(true);
            }, yaVista, esUltimaSeccion);
        };

        if (nuevaSeccion === 'objetivo') {
            reproducir(etapa.audioObjetivo);
        } else {
            const seccion = etapa.secciones.find(s => s.id === nuevaSeccion);
            reproducir(seccion.audio);
        }
    };

    const verificarEtapaCompletada = (etapaId) => {
        const etapa = cards.find(e => e.id === etapaId);
        const todasLasSecciones = ['objetivo', ...etapa.secciones.map(s => s.id)];
        
        const todasVistas = todasLasSecciones.every(seccion =>
            seccionesVistas[`${etapaId}-${seccion}`] === true
        );
        
        if (todasVistas && !etapasCompletadas.includes(etapaId)) {
            setEtapasCompletadas(prev => [...prev, etapaId]);
            
            if (etapaId < cards.length) {
                setEtapaActiva(etapaId + 1);
            }

            if (etapaId === cards.length) {
                console.log("🎉 Todo el contenido ha sido completado");
                if (onContentIsEnded) onContentIsEnded();
            }
        }
    };

    const siguienteSeccion = () => {
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
    };

    const anteriorSeccion = () => {
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
    };

    // Limpiar timeout al desmontar
    useEffect(() => {
        return () => {
            if (audioTimeoutRef.current) {
                clearTimeout(audioTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className='w-full mx-auto pt-10 pb-14 lg:pb-0' data-aos="fade-up" data-aos-delay={300} data-aos-duration="600">
            {/* 🔹 INTRODUCCIÓN SIMPLIFICADA - Solo texto */}
            {!audioCompletado && etapaAbierta === null && audioEnReproduccion && (
                <div className="text-center px-6 py-10 max-w-3xl mx-auto animate-fadeIn" data-aos="fade-up">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Etapas del SARLAFT
                    </h1>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                        El SARLAFT funciona como un ciclo de protección que nunca se detiene. Sus etapas son: identificación, medición, control y monitoreo.
                    </p>
                </div>
            )}

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

            {etapaAbierta && etapaActualData && (
                <ModalFlipCard etapaActualData={etapaActualData} onClose={cerrarModal}>
                    <div className="p-2 md:p-4 space-y-2">
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

                    <div className="bg-[#151518] border-t-2 border-slate-700 p-4">
                        <div className="flex items-center justify-between gap-1 md:gap-4">
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