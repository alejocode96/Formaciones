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
const audioStartedRef = React.useRef(false);
const introAttemptedRef = React.useRef(false);


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

// 🟢 Detectar móvil
const [isMobile, setIsMobile] = useState(false);
const [esperandoInteraccion, setEsperandoInteraccion] = useState(false);

// 🟢 Detectar si es móvil al cargar
useEffect(() => {
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
    if (checkMobile) {
        setEsperandoInteraccion(true);
    }
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

const verificarEtapaCompletada = useCallback((etapaId) => {
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
}, [cards, seccionesVistas, etapasCompletadas, onContentIsEnded]);

const reproducirAudio = useCallback((texto, callback, yaVista = false, esUltimaSeccion = false) => {
    if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
        audioTimeoutRef.current = null;
    }

    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setAudioEnReproduccion(false);
    audioStartedRef.current = false;

    if (!audioEnabled || !mejorVoz) {
        console.log('⚠️ Audio deshabilitado o sin voz, avanzando directamente');
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
        console.log('▶️ Audio INICIÓ correctamente');
        setIsPlaying(true);
        audioStartedRef.current = true;
        if (audioTimeoutRef.current) {
            clearTimeout(audioTimeoutRef.current);
            audioTimeoutRef.current = null;
        }
    };

    utterance.onend = () => {
        console.log('✅ Audio COMPLETADO correctamente');
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
        
        if (!audioStartedRef.current) {
            console.warn('❌ Audio FALLÓ (nunca inició), habilitando contenido');
            setAudioCompletado(true);
            if (callback) callback();
        } else {
            console.log('⚠️ Audio se interrumpió pero había iniciado, NO avanzar automáticamente');
        }
    };

    currentUtteranceRef.current = utterance;
    utterance.onboundary = (event) => {
        currentCharIndexRef.current = event.charIndex;
    };

    try {
        window.speechSynthesis.speak(utterance);
        
        audioTimeoutRef.current = setTimeout(() => {
            if (!audioStartedRef.current) {
                console.warn('❌ Audio no inició en 3s (FALLO REAL), habilitando contenido');
                window.speechSynthesis.cancel();
                setIsPlaying(false);
                setAudioEnReproduccion(false);
                setAudioCompletado(true);
                if (callback) callback();
            }
        }, 3000);
        
    } catch (error) {
        console.error('❌ Error al reproducir audio:', error);
        setAudioCompletado(true);
        if (callback) callback();
    }
}, [audioEnabled, mejorVoz, etapaAbierta, verificarEtapaCompletada]);

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
}, [seccionesVistas, etapaAbierta, cards, etapasCompletadas, verificarEtapaCompletada]);

// 🟢 Solo en desktop: Pausar/reanudar al cambiar de pestaña
useEffect(() => {
    if (isMobile) return;

    const handleVisibilityChange = () => {
        if (document.hidden) {
            if (window.speechSynthesis.speaking && currentUtteranceRef.current) {
                const textoOriginal = currentUtteranceRef.current.text;
                const posicion = currentCharIndexRef.current;
                remainingTextRef.current = textoOriginal.slice(posicion);
                window.speechSynthesis.cancel();
                setIsPlaying(false);
                setAudioEnReproduccion(false);
                console.log("🔇 Audio pausado (cambio de pestaña)");
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
                console.log("✅ Audio reanudado y completado");
            };

            currentUtteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
            setAudioEnReproduccion(true);
            console.log("▶️ Audio reanudado");
        }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.speechSynthesis.cancel();
    };
}, [mejorVoz, isMobile]);

// 🟢 FUNCIÓN MEJORADA: Reproducir intro con manejo especial para móviles
const reproducirIntro = useCallback(() => {
    if (introAttemptedRef.current || !mejorVoz) return;
    
    introAttemptedRef.current = true;
    setAudioIntroReproducido(true);
    setAudioEnReproduccion(true);
    // ❌ NO establecer esperandoInteraccion a false aquí para mantener el texto visible

    const textoIntro = "Etapas del SARLAFT. El SARLAFT funciona como un ciclo de protección que nunca se detiene. Sus etapas son: identificación, medición, control y monitoreo. Haz clic sobre cada etapa para ver su información.";
    
    const utterance = new SpeechSynthesisUtterance(textoIntro);
    utterance.voice = mejorVoz;
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    let audioInicioReal = false;

    utterance.onstart = () => {
        console.log('▶️ Intro INICIÓ correctamente');
        audioInicioReal = true;
        setEsperandoInteraccion(false); // ✅ Ahora sí, ocultar el mensaje después de que inicie
    };

    utterance.onend = () => {
        console.log('✅ Intro COMPLETADA');
        setAudioEnReproduccion(false);
        setMostrarCards(true);
    };

    utterance.onerror = (e) => {
        console.warn('⚠️ Error en intro:', e);
        setAudioEnReproduccion(false);
        setMostrarCards(true);
        setEsperandoInteraccion(false);
    };

    try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        
        // 🟢 Timeout de seguridad: Si después de 5s no inició, mostrar cards
        setTimeout(() => {
            if (!audioInicioReal) {
                console.warn('⚠️ Audio intro no inició en 5s, mostrando cards');
                window.speechSynthesis.cancel();
                setAudioEnReproduccion(false);
                setMostrarCards(true);
                setEsperandoInteraccion(false);
            }
        }, 5000);
    } catch (error) {
        console.error('❌ Error al reproducir intro:', error);
        setAudioEnReproduccion(false);
        setMostrarCards(true);
        setEsperandoInteraccion(false);
    }
}, [mejorVoz]);

// 🟢 MANEJO DE INTERACCIÓN INICIAL EN MÓVIL
useEffect(() => {
    if (!isMobile || !mejorVoz || !esperandoInteraccion) return;

    // Esperar a que el usuario toque la pantalla por primera vez
    const handleFirstTouch = () => {
        console.log('👆 Primera interacción detectada en móvil');
        reproducirIntro();
    };

    // Agregar listeners para detectar primera interacción
    document.addEventListener('touchstart', handleFirstTouch, { once: true });
    document.addEventListener('click', handleFirstTouch, { once: true });

    return () => {
        document.removeEventListener('touchstart', handleFirstTouch);
        document.removeEventListener('click', handleFirstTouch);
    };
}, [isMobile, mejorVoz, esperandoInteraccion, reproducirIntro]);

// 🟢 REPRODUCIR INTRO AUTOMÁTICAMENTE EN DESKTOP
useEffect(() => {
    if (isMobile || audioIntroReproducido || !mejorVoz) return;
    
    // En desktop, reproducir inmediatamente
    const timer = setTimeout(() => {
        reproducirIntro();
    }, 500);

    return () => clearTimeout(timer);
}, [mejorVoz, audioIntroReproducido, isMobile, reproducirIntro]);

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
        {/* 🔹 INTRODUCCIÓN - Siempre visible, cambia solo el mensaje de interacción */}
        {etapaAbierta === null && !mostrarCards && (
            <div className="text-center px-6 py-10 md:py-20 max-w-3xl mx-auto animate-fadeIn mb-8" data-aos="fade-up">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
                    Etapas del SARLAFT
                </h1>
                <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8">
                    El SARLAFT funciona como un ciclo de protección que nunca se detiene. Sus etapas son: identificación, medición, control y monitoreo. Haz clic sobre cada etapa para ver su información.
                </p>
                
                {/* 🔹 Mensaje de interacción para móviles */}
                {isMobile && esperandoInteraccion && (
                    <p className="text-blue-400 text-lg font-semibold animate-pulse">
                        Toca la pantalla para comenzar
                    </p>
                )}
                
                {/* 🔹 Indicador de audio reproduciéndose */}
                {audioEnReproduccion && (
                    <div className="mt-6 flex items-center justify-center gap-2 text-blue-400">
                        <Volume2 size={24} className="animate-pulse" />
                        <span className="text-sm md:text-base">Reproduciendo audio...</span>
                    </div>
                )}
            </div>
        )}

        {/* 🔹 CARDS - Solo se muestran después de la intro */}
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