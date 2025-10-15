import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { TrainingLogiTransContext } from '../../Context';


function FlipCardReverse({ currentModule, onContentIsEnded, courseId, moduleId }) {

    //estado para saber si no es movil
    const [isMobile, setIsMobile] = useState(false);
    //Etsado para la inicializacion de la introduccion
    const [introStarted, setIntroStarted] = useState(false);
    const [introPlayed, setIntroPlayed] = useState(false);
    const [unlockedCards, setUnlockedCards] = useState([]);

    const synthRef = useRef(window.speechSynthesis);
    //Efecto que reproduce audio cuando el dispositivo no es movile
    useEffect(() => {
        if (!isMobile && !introStarted) {
            handleStartIntro();
        }
    }, [isMobile]);


    // funcion para hacer sonar el audio
    const handleStartIntro = () => {
        setIntroStarted(true);
        speak(currentModule.audioObjetivo, () => {
            setIntroPlayed(true);
            setUnlockedCards([1]);
        });
    };


    const speak = (text, onEnd) => {
        if (synthRef.current.speaking) {
            synthRef.current.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
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
    return (
        <div className='w-full mx-auto pt-10 pb-14 lg:pb-0' data-aos="fade-up" data-aos-delay={300} data-aos-duration="600">
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