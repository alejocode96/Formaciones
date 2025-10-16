import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { TrainingLogiTransContext } from '../../Context';

function FlipCardReverse({ currentModule, onContentIsEnded, courseId, moduleId }) {

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
    }, [isMobile, vocesCargadas]);

    if (!vocesCargadas) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-slate-400 text-lg animate-pulse">
                    Cargando voces en español...
                </p>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto pt-10 pb-14 lg:pb-0" data-aos="fade-up" data-aos-delay={300} data-aos-duration="600">
            <div className="text-center px-6 py-10 max-w-5xl mx-auto animate-fadeIn" data-aos="fade-up">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-0">
                    {currentModule.name}
                </h1>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
                    {currentModule.objetivo}
                </p>
            </div>
        </div>
    );
}

export default FlipCardReverse;
