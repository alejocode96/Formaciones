import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TrainingLogiTransContext } from '../../Context';

function VideoModule({ src, resumen, onContentIsEnded }) {

    const { } = React.useContext(TrainingLogiTransContext);

    const videoRef = useRef(null);
    const location = useLocation();
    const lastTimeRef = useRef(0); // aquí guardamos la última posición permitida


    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 3;

        const cancelSpeech = () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                console.log(`✅ SpeechSynthesis cancelado intento ${attempts + 1}`);
            }
            attempts += 1;
            if (attempts < maxAttempts) {
                setTimeout(cancelSpeech, 200); // reintenta cada 200ms
            }
        };

        cancelSpeech();
    }, []);

    // Efecto para auto-reproducir cuando el componente se monta (con delay de 2 segundos)
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            // Esperar 2 segundos antes de reproducir
            const timer = setTimeout(async () => {
                try {
                    await video.play();
                } catch (error) {
                    // Si falla la reproducción automática (políticas del navegador)

                }
            }, 2000); // 2000ms = 2 segundos

            // Cleanup del timer si el componente se desmonta antes
            return () => clearTimeout(timer);
        }
    }, [src]); // Se ejecuta cuando cambia el src del video

    // Efecto para pausar cuando cambia la ubicación/página
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.pause();
        }
    }, [location.pathname]); // Se ejecuta cuando cambia la ruta

    // Efecto para pausar cuando la ventana pierde el foco (opcional)
    useEffect(() => {
        const handleVisibilityChange = () => {
            const video = videoRef.current;
            if (video && document.hidden) {
                video.pause();
            }
        };

        const handleWindowBlur = () => {
            const video = videoRef.current;
            if (video) {
                video.pause();
            }
        };

        // Agregar event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, []);

    // Efecto de limpieza al desmontar el componente
    useEffect(() => {
        return () => {
            const video = videoRef.current;
            if (video) {
                video.pause();
            }
        };
    }, []);

    // Actualizar la última posición cuando el video avanza
    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (video && !video.seeking) {
            // Solo actualizar si NO está en proceso de seeking
            if (video.currentTime > lastTimeRef.current) {
                lastTimeRef.current = video.currentTime;
            }
        }
    };

    // Evitar adelantar - versión mejorada
    const handleSeeking = () => {
        const video = videoRef.current;
        if (video) {
            // Si intenta ir más adelante de lo permitido
            if (video.currentTime > lastTimeRef.current + 0.1) {

                video.currentTime = lastTimeRef.current;
            }
        }
    };

    // Agregar un listener adicional para "seeked" (cuando termina el seeking)
    const handleSeeked = () => {
        const video = videoRef.current;
        if (video && video.currentTime > lastTimeRef.current + 0.1) {
            video.currentTime = lastTimeRef.current;
        }
    };

    // Nuevo: avisar cuando termina
    const handleEnded = () => {
        if (onContentIsEnded) onContentIsEnded(); // avisa al padre
    };

    if (!src) {
        //TODO NO DEJAR AVANZAR
        return <p className="text-red-400">No se encontró el video contacta al administrador.</p>;
    }

    return (
        <div className='w-full  mx-auto pt-2 pb-14 lg:pb-0' data-aos="fade-up" data-aos-delay={300} data-aos-duration="600">
            <div className="flex flex-col lg:flex-row lg:gap-4 lg:h-[70vh] ">
                {/* Video container */}
                <div className='w-full lg:w-7/10 lg:h-full '>
                    <video
                        ref={videoRef}
                        className='w-full h-full rounded-lg shadow-lg object-cover'
                        controls
                        preload="metadata"
                        onTimeUpdate={handleTimeUpdate}
                        onSeeking={handleSeeking}
                        onSeeked={handleSeeked}
                        onEnded={handleEnded}
                    >
                        <source src={src} type="video/mp4" />
                    </video>
                </div>

                {/* Resumen panel - solo visible en desktop */}
                <div className="w-full lg:w-3/10 hidden lg:flex flex-col lg:h-full">
                    <div className='bg-gradient-to-r from-zinc-800/80 to-zinc-700/80 backdrop-blur-sm rounded-t-xl border border-zinc-600/30'>
                        <div className='flex overflow-x-auto scrollbar-hide'>
                            <button className='flex items-center gap-2 px-4 py-3 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap border-b-2 text-blue-400 border-blue-500 bg-zinc-700/50'>
                                Resumen
                            </button>
                        </div>
                    </div>

                    <div className='bg-zinc-800/40 backdrop-blur-sm rounded-b-xl border-x border-b border-zinc-600/30 flex-1 overflow-hidden'>
                        <div className='h-full overflow-y-auto p-4'>
                            <div className='space-y-4'>
                                <div className='flex items-start gap-3'>
                                    <div>
                                        <h3 className='font-semibold text-zinc-100 mb-2'>Resumen del Módulo</h3>
                                        <div className='text-zinc-300 text-sm leading-relaxed space-y-2'>
                                            {resumen.map((text, index) => {
                                                // 1️⃣ Reemplazar **texto** por <strong> con una clase blanca diferenciada
                                                const boldText = text.replace(
                                                    /\*\*(.*?)\*\*/g,
                                                    '<strong class="text-white font-semibold tracking-wide">$1</strong>'
                                                );

                                                // 2️⃣ Si el texto termina con punto, agregar un <br /> al final
                                                const formattedText = boldText.endsWith('.')
                                                    ? `${boldText}<br /> <br />`
                                                    : boldText;

                                                return (
                                                    <p
                                                        key={index}
                                                        className="text-gray-300 leading-relaxed"
                                                        dangerouslySetInnerHTML={{ __html: formattedText }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VideoModule;
