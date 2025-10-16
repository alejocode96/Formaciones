import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { TrainingLogiTransContext } from '../../Context';
import AOS from 'aos';
import 'aos/dist/aos.css';

function FlipCardReverse({ currentModule, onContentIsEnded, courseId, moduleId }) {
    let cards = currentModule.cards;
    const [isMobile, setIsMobile] = useState(false);
    const [introStarted, setIntroStarted] = useState(false);
    const [introPlayed, setIntroPlayed] = useState(false);
    const [unlockedCards, setUnlockedCards] = useState([]);
    const [mejorVoz, setMejorVoz] = useState(null);
    const [vocesCargadas, setVocesCargadas] = useState(false);
    const [audioFailed, setAudioFailed] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    const synthRef = useRef(window.speechSynthesis);

    // 🧠 useEffect: Cargar voces con fallback y reintentos
    useEffect(() => {
        const synth = window.speechSynthesis;

        const cargarVoces = () => {
            const voices = synth.getVoices();

            if (!voices.length) {
                // Si aún no hay voces, reintentar
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

        // 🚀 Intentar carga inmediata
        cargarVoces();

        // 🗣 Escuchar cuando las voces estén listas (Chrome / Edge)
        synth.onvoiceschanged = cargarVoces;

        // 👆 Fallback: algunos navegadores requieren interacción del usuario
        const handleUserInteraction = () => {
            console.log('👆 Usuario hizo clic: forzando carga de voces...');
            cargarVoces();
            document.removeEventListener('click', handleUserInteraction);
        };
        document.addEventListener('click', handleUserInteraction);

        // 🧹 Limpieza
        return () => {
            synth.onvoiceschanged = null;
            document.removeEventListener('click', handleUserInteraction);
        };
    }, []);

    // 🎧 Función para hablar
    const speak = (text, onEnd) => {
        if (!vocesCargadas || !mejorVoz) {
            console.warn('⚠️ Voces aún no cargadas, no se puede reproducir.');
            return;
        }

        if (synthRef.current.speaking) {
            synthRef.current.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = mejorVoz;
        utterance.lang = mejorVoz.lang || 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onstart = () => setIsPlayingAudio(true);

        utterance.onend = () => {
            setIsPlayingAudio(false);
            if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
            console.error('Speech synthesis error:', e);
            setIsPlayingAudio(false);
            setAudioFailed(true);
            if (onEnd) onEnd();
        };

        try {
            synthRef.current.speak(utterance);
        } catch (error) {
            console.error('Error speaking:', error);
            setAudioFailed(true);
            if (onEnd) onEnd();
        }
    };

    // 🎬 Reproducir introducción cuando todo esté listo
    useEffect(() => {

        if (!isMobile && vocesCargadas && !introStarted) {
            setIntroStarted(true);
            speak(currentModule.audioObjetivo, () => {
                setIntroPlayed(true);
                setUnlockedCards([1]);
            });
        }
    }, [isMobile, vocesCargadas, introStarted]);

    //Efecto  que identifica si es mobile
    useEffect(() => {
        const checkMobile = () => {
            const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
            setIsMobile(isMobileDevice);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);



    if (!vocesCargadas) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-slate-400 text-lg animate-pulse">
                    Cargando voces en español...
                </p>
            </div>
        );
    }


    const iniciarIntroMovil = () => {
        if (!introStarted && vocesCargadas) {
            setIntroStarted(true);
            speak(currentModule.audioObjetivo, () => {
                setIntroPlayed(true);
                setUnlockedCards([1]);
            });
        }
    };


    const showCards = introPlayed || audioFailed;

    return (
        <div className="w-full mx-auto pt-10 pb-14 lg:pb-0">
            {isMobile && !introStarted && (
                <div
                    onClick={iniciarIntroMovil}
                    className="relative w-full flex items-center justify-center   rounded-xl cursor-pointer min-h-[400px] " data-aos="fade-up"
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
            {introStarted && (
                <div className="text-center px-6 py-10 max-w-5xl mx-auto animate-fadeIn" data-aos="fade-up">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-0">
                        {currentModule.name}
                    </h1>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                        {currentModule.objetivo}
                    </p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6 mb-6 " data-aos="fade-up">
                {cards.map((etapa,index) => {

                    if (!showCards && introStarted) {
                        // Verifica si es la última card
                        const isLast = index === cards.length - 1
                        return (
                            <div
                                key={etapa.id}
                                className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-1 border-[#2c2c2f] bg-[#121214] overflow-hidden 
                                ${isLast ? "col-span-1 lg:col-span-2" : ""}`} >
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

        </div>
    );
}

export default FlipCardReverse;
