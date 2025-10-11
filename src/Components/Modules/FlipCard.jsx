import React, { useState, useEffect, useCallback, useRef } from 'react';
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

    // 🟢 Refs para mantener los valores más recientes de los estados
    const seccionesVistasRef = useRef({});
    const etapasCompletadasRef = useRef([]);
    const etapaActivaRef = useRef(1);

    const { getUserProgressForCourse,completeModule } = React.useContext(TrainingLogiTransContext);

    // 🔹 Obtener progreso del curso desde el contexto
    const courseProgress = getUserProgressForCourse(parseInt(courseId));

    // Control de progreso
    const [etapaActiva, setEtapaActiva] = useState(1);
    const [etapasCompletadas, setEtapasCompletadas] = useState([]);

    const [etapaAbierta, setEtapaAbierta] = useState(null);
    const [seccionActiva, setSeccionActiva] = useState(null);
    const [seccionesVistas, setSeccionesVistas] = useState({});
    const [audioCompletado, setAudioCompletado] = useState(false);
    const [introMostrada, setIntroMostrada] = useState(false);
    const [audioEnReproduccion, setAudioEnReproduccion] = useState(false);
    const [audioIntroReproducido, setAudioIntroReproducido] = useState(false);
    const [requiereInteraccion, setRequiereInteraccion] = useState(false);
    const etapaActualData = etapaAbierta ? cards.find(e => e.id === etapaAbierta) : null;
    const [mostrarCards, setMostrarCards] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [mejorVoz, setMejorVoz] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // 🟢 Actualizar refs cuando cambien los estados
    useEffect(() => {
        seccionesVistasRef.current = seccionesVistas;
    }, [seccionesVistas]);

    useEffect(() => {
        etapasCompletadasRef.current = etapasCompletadas;
    }, [etapasCompletadas]);

    useEffect(() => {
        etapaActivaRef.current = etapaActiva;
    }, [etapaActiva]);

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

    // 🟢 Función DIRECTA para guardar en localStorage COMBINANDO datos existentes
    // 🟢 Guardar siempre fusionando con lo que ya existe
    const guardarProgresoDirecto = useCallback((seccionesVistasActual, etapasCompletadasActual, etapaActivaActual) => {
        try {
            const storedProgress = localStorage.getItem("userProgress");
            const allProgress = storedProgress ? JSON.parse(storedProgress) : {};

            // Mezclar con progreso existente sin borrar nada previo
            const progresoPrevio =
                allProgress?.[courseId]?.flipCardProgress?.[moduleId] || {};

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


    // 🟢 Función reutilizable para guardar progreso usando los estados actuales
    const saveFlipCardProgress = useCallback(() => {
        if (!courseProgress) return;
        guardarProgresoDirecto(
            seccionesVistasRef.current,
            etapasCompletadasRef.current,
            etapaActivaRef.current
        );
    }, [courseProgress, guardarProgresoDirecto]);

    // 🟣 Efecto para autoguardado cuando cambien estados
    useEffect(() => {
        if (Object.keys(seccionesVistas).length > 0 || etapasCompletadas.length > 0) {
            const timeoutId = setTimeout(() => {
                saveFlipCardProgress();
            }, 150);

            return () => clearTimeout(timeoutId);
        }
    }, [seccionesVistas, etapasCompletadas, etapaActiva, saveFlipCardProgress]);

    // 🟢 Guardar progreso cuando el componente se desmonte
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

    // 🔹 MODIFICADO: Agregado parámetro yaVista para mantener audioCompletado en true
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

            // 🟢 Ejecutar callback primero (marca sección como vista)
            if (callback) {
                callback();
            }

            // 🟢 Si es la última sección, esperar a que React actualice el estado
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
        currentUtteranceRef.current = utterance;
        utterance.onboundary = (event) => {
            currentCharIndexRef.current = event.charIndex;
        };
        window.speechSynthesis.speak(utterance);
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

    // 🟣 Controlar pausa/reanudación de audio al cambiar de pestaña o salir de la página
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
    };

    const verificarEtapaCompletada = (etapaId) => {
        const etapa = cards.find(e => e.id === etapaId);
        const todasLasSecciones = ['objetivo', ...etapa.secciones.map(s => s.id)];

        // 🟢 Usar setTimeout para asegurar que los estados estén actualizados
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

                // 🟢 Actualizar estados
                setEtapasCompletadas(nuevasEtapasCompletadas);
                if (etapaId < cards.length) {
                    setEtapaActiva(nuevaEtapaActiva);
                }

                // 🟢 Guardar INMEDIATAMENTE con los valores correctos
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

    useEffect(() => {
        if (audioIntroReproducido || !mejorVoz) return;

        const esMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (esMovil) {
            setRequiereInteraccion(true);
            setMostrarCards(false);
            return;
        }

        iniciarAudioIntroduccion();
    }, [mejorVoz, audioIntroReproducido]);

    const iniciarAudioIntroduccion = () => {
        setAudioIntroReproducido(true);
        setAudioEnReproduccion(true);
        setMostrarCards(false);
        setRequiereInteraccion(false);

        const textoIntro =
            "Etapas del SARLAFT. El SARLAFT funciona como un ciclo de protección que nunca se detiene. Sus etapas son: identificación, medición, control y monitoreo. Haz clic sobre cada etapa para ver su información.";

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
    };

    return (
        <div className='w-full mx-auto pt-10 pb-14 lg:pb-0' data-aos="fade-up" data-aos-delay={300} data-aos-duration="600">
            {requiereInteraccion && (
                <div
                    onClick={iniciarAudioIntroduccion}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl flex items-center justify-center z-50 cursor-pointer"
                >
                    <div className="text-center animate-pulse py-2">
                        <p className="text-white text-2xl md:text-3xl font-light">
                            Click para iniciar
                        </p>
                    </div>
                </div>
            )}

            {!audioCompletado && etapaAbierta === null && !requiereInteraccion && (
                <div className="text-center px-6 py-10 max-w-3xl mx-auto animate-fadeIn" data-aos="fade-up">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-0">
                        Etapas del SARLAFT
                    </h1>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                        El SARLAFT funciona como un ciclo de protección que nunca se detiene. Sus etapas son:
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