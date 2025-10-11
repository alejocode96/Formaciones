import React, { useState, useEffect, useCallback } from 'react';
import { TrainingLogiTransContext } from '../../Context';
import ModalFlipCard from './modalFlipCard';
import { Volume2, ChevronRight, ChevronLeft, Lock, CheckCircle } from 'lucide-react';

function FlipCard({ cards, onContentIsEnded, courseId, moduleId }) {
    const currentUtteranceRef = React.useRef(null);
    const currentCharIndexRef = React.useRef(0);
    const remainingTextRef = React.useRef("");
    const currentCallbackRef = React.useRef(null);
    const audioTimeoutRef = React.useRef(null);

    const { getUserProgressForCourse } = React.useContext(TrainingLogiTransContext);
    const courseProgress = getUserProgressForCourse(parseInt(courseId));

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

    // 🟢 CAMBIO: Eliminado el control de "isMobile" y "requiereInteraccionMovil"
    // Ahora el contenido siempre muestra la introducción y simula interacción

    useEffect(() => {
        if (courseProgress && courseProgress.flipCardProgress) {
            const flipCardData = courseProgress.flipCardProgress[moduleId];
            if (flipCardData) {
                setSeccionesVistas(flipCardData.seccionesVistas || {});
                setEtapasCompletadas(flipCardData.etapasCompletadas || []);
                setEtapaActiva(flipCardData.etapaActiva || 1);
            }
        }
    }, [courseProgress, moduleId]);

    // 🔹 Guardar progreso
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
        } catch (error) {
            console.error('❌ Error al guardar progreso de FlipCard:', error);
        }
    }, [seccionesVistas, etapasCompletadas, etapaActiva, courseId, moduleId, courseProgress]);

    useEffect(() => {
        if (Object.keys(seccionesVistas).length > 0 || etapasCompletadas.length > 0) {
            saveFlipCardProgress();
        }
    }, [seccionesVistas, etapaActiva, saveFlipCardProgress]);

    // 🟢 Cargar voces
    useEffect(() => {
        const cargarVoces = () => {
            const voices = window.speechSynthesis.getVoices();
            const vocesEspanol = voices.filter(v => v.lang.toLowerCase().startsWith('es'));
            const prioridadMicrosoft = [
                'Microsoft Salome Online (Natural) - Spanish (Colombia)',
                'Microsoft Dalia Online (Natural) - Spanish (Mexico)',
            ];
            let mejorOpcion = null;
            for (const nombre of prioridadMicrosoft) {
                mejorOpcion = vocesEspanol.find(v => v.name.toLowerCase().includes(nombre.toLowerCase()));
                if (mejorOpcion) break;
            }
            if (!mejorOpcion) {
                mejorOpcion = vocesEspanol[0];
            }
            setMejorVoz(mejorOpcion || null);
        };

        cargarVoces();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = cargarVoces;
        }
    }, []);

    // 🟢 CAMBIO: Mejor manejo de errores (solo pasa al siguiente si no puede reproducir)
    const reproducirAudio = useCallback((texto, callback, yaVista = false, esUltimaSeccion = false) => {
        if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setAudioEnReproduccion(false);

        if (!audioEnabled || !mejorVoz) {
            setAudioCompletado(true);
            if (callback) callback();
            return;
        }

        setAudioEnReproduccion(true);
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.voice = mejorVoz;
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;

        utterance.onstart = () => {
            setIsPlaying(true);
        };

        utterance.onend = () => {
            setIsPlaying(false);
            setAudioCompletado(true);
            setAudioEnReproduccion(false);
            if (callback) callback();
            if (esUltimaSeccion && etapaAbierta) {
                setTimeout(() => verificarEtapaCompletada(etapaAbierta), 200);
            }
        };

        utterance.onerror = (event) => {
            console.warn('⚠️ Error real de audio:', event.error);
            // Solo si el error es "not-allowed" o "interrupted" por el navegador, se pasa
            if (event.error === 'not-allowed' || event.error === 'synthesis-failed') {
                setAudioCompletado(true);
                if (callback) callback();
            }
            // Si es interrumpido manualmente, no avanzar
            setIsPlaying(false);
            setAudioEnReproduccion(false);
        };

        try {
            window.speechSynthesis.speak(utterance);
            currentUtteranceRef.current = utterance;
        } catch (error) {
            console.error('❌ No se pudo reproducir el audio:', error);
            setAudioCompletado(true);
            if (callback) callback();
        }
    }, [audioEnabled, mejorVoz, etapaAbierta]);

    // 🟢 CAMBIO: La introducción siempre se reproduce automáticamente (móvil y desktop)
    useEffect(() => {
        if (audioIntroReproducido || !mejorVoz) return;

        const simularInteraccion = () => {
            // Simula interacción en móviles para desbloquear audio
            const evento = document.createEvent('MouseEvents');
            evento.initEvent('click', true, true);
            document.body.dispatchEvent(evento);
        };
        simularInteraccion();

        setAudioIntroReproducido(true);
        setAudioEnReproduccion(true);
        setMostrarCards(false);

        const textoIntro =
            "Etapas del SARLAFT. El SARLAFT funciona como un ciclo de protección que nunca se detiene. Sus etapas son: identificación, medición, control y monitoreo. Haz clic sobre cada etapa para ver su información.";

        const utterance = new SpeechSynthesisUtterance(textoIntro);
        utterance.voice = mejorVoz;
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onend = () => {
            setAudioEnReproduccion(false);
            setMostrarCards(true);
        };
        utterance.onerror = () => {
            console.warn("⚠️ Error al reproducir intro. Mostrando contenido.");
            setMostrarCards(true);
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }, [mejorVoz, audioIntroReproducido]);

    // 🔹 Resto de funciones (abrirEtapa, cambiarSeccion, siguiente, anterior, etc.) permanecen igual...

    const abrirEtapa = (etapaId) => {
        if (etapaId > etapaActiva) return;
        setEtapaAbierta(etapaId);
        setSeccionActiva('objetivo');
        const etapa = cards.find(e => e.id === etapaId);
        const seccionKey = `${etapaId}-objetivo`;
        const yaVista = seccionesVistas[seccionKey];
        reproducirAudio(etapa.audioObjetivo, () => {
            setSeccionesVistas(prev => ({ ...prev, [seccionKey]: true }));
        }, yaVista);
    };

    const cerrarModal = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setAudioEnReproduccion(false);
        if (etapaAbierta) verificarEtapaCompletada(etapaAbierta);
        setEtapaAbierta(null);
        setSeccionActiva(null);
    };

    const verificarEtapaCompletada = (etapaId) => {
        const etapa = cards.find(e => e.id === etapaId);
        const todasLasSecciones = ['objetivo', ...etapa.secciones.map(s => s.id)];
        const todasVistas = todasLasSecciones.every(seccion => seccionesVistas[`${etapaId}-${seccion}`]);
        if (todasVistas && !etapasCompletadas.includes(etapaId)) {
            setEtapasCompletadas(prev => [...prev, etapaId]);
            if (etapaId < cards.length) setEtapaActiva(etapaId + 1);
            if (etapaId === cards.length && onContentIsEnded) onContentIsEnded();
        }
    };

    return (
        <div className="w-full mx-auto pt-10 pb-14 lg:pb-0">
            {/* 🟢 CAMBIO: Mostrar siempre la introducción */}
            {!audioCompletado && etapaAbierta === null && audioEnReproduccion && (
                <div className="text-center px-6 py-10 max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-2">Etapas del SARLAFT</h1>
                    <p className="text-slate-300 text-base leading-relaxed mb-6">
                        El SARLAFT funciona como un ciclo de protección que nunca se detiene. Sus etapas son:
                        identificación, medición, control y monitoreo.
                    </p>
                    <div className="animate-pulse">
                        <Volume2 size={48} className="mx-auto text-blue-400" />
                    </div>
                </div>
            )}

            {mostrarCards && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((etapa) => {
                        const bloqueada = etapa.id > etapaActiva;
                        const completada = etapasCompletadas.includes(etapa.id);
                        return (
                            <button
                                key={etapa.id}
                                onClick={() => !bloqueada && abrirEtapa(etapa.id)}
                                disabled={bloqueada}
                                className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300
                                ${bloqueada
                                    ? 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed'
                                    : `bg-gradient-to-br ${etapa.color} border-transparent hover:scale-105 hover:shadow-2xl cursor-pointer`}`}
                            >
                                {bloqueada && <Lock size={24} className="absolute top-3 right-3 text-slate-500" />}
                                {completada && <CheckCircle size={24} className="absolute top-3 right-3 text-green-400" />}
                                <div className="text-5xl mb-3">{etapa.icono}</div>
                                <div className="text-white text-center flex flex-col items-center">
                                    <div className="font-bold text-lg">{etapa.titulo}</div>
                                    {bloqueada ? (
                                        <p className="text-xs text-slate-400 mt-2">Completa la etapa anterior</p>
                                    ) : completada ? (
                                        <p className="text-sm text-slate-300 mt-2">Etapa completada</p>
                                    ) : (
                                        <div className="mt-4 flex items-center gap-2 text-sm opacity-75 animate-bounce">
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
        </div>
    );
}

export default FlipCard;