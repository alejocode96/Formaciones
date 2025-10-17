import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Lock } from 'lucide-react';

const SarlaftAlerts = () => {
    const [introStarted, setIntroStarted] = useState(false);
    const [introPlayed, setIntroPlayed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [activeCard, setActiveCard] = useState(null);
    const [unlockedCards, setUnlockedCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [audioFailed, setAudioFailed] = useState(false);
    const synthRef = useRef(window.speechSynthesis);

    const introText = "Las señales de alerta son comportamientos o situaciones que nos indican que algo podría no estar bien y que existe un posible riesgo de lavado de activos o financiación del terrorismo. Identificarlas a tiempo ayuda a proteger a la organización y cumplir con la normativa.";

    const alerts = [
        {
            id: 1,
            title: "Pagos inusuales o muy altos en efectivo",
            content: "Hoy la mayoría de pagos grandes se hacen por transferencia o tarjeta. Si un cliente insiste en pagar en efectivo cantidades muy altas, podría estar intentando ocultar el origen del dinero.",
            example: "Ejemplo: Una empresa que normalmente paga sus facturas por transferencia, de repente quiere cancelar un contrato de 50 millones en efectivo.",
            icono: "💵",
            color: "from-emerald-500 to-teal-600"
        },
        {
            id: 2,
            title: "Cambios frecuentes en remitentes o destinatarios",
            content: "Si los pagos o cobros cambian constantemente de nombre, puede que se esté tratando de ocultar quién está realmente detrás de la operación.",
            example: "Ejemplo: Un proveedor diferente cada mes para el mismo servicio, sin razón clara.",
            icono: "🔄",
            color: "from-purple-500 to-indigo-600"
        },
        {
            id: 3,
            title: "Documentos incompletos o falsos",
            content: "Información faltante o documentos alterados son señales claras de intento de engaño.",
            example: "Ejemplo: Facturas sin número de identificación o con fechas que no coinciden con la operación.",
            icono: "📋",
            color: "from-red-500 to-pink-600"
        },
        {
            id: 4,
            title: "Clientes que no quieren dar información",
            content: "La falta de transparencia es un signo de riesgo, ya que impide evaluar correctamente al cliente.",
            example: "Ejemplo: Un cliente se niega a entregar estados financieros o datos de contacto completos.",
            icono: "🚫",
            color: "from-orange-500 to-amber-600"
        },
        {
            id: 5,
            title: "Operaciones que no coinciden con el perfil del cliente",
            content: "Movimientos que difieren del comportamiento habitual pueden indicar actividad sospechosa.",
            example: "Ejemplo: Un cliente que normalmente hace transferencias pequeñas, de repente realiza pagos millonarios en sectores distintos a su negocio.",
            icono: "📊",
            color: "from-blue-500 to-cyan-600"
        }
    ];

    useEffect(() => {
        const checkMobile = () => {
            const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
            setIsMobile(mobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!isMobile && !introStarted) {
            handleStartIntro();
        }
    }, [isMobile]);

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

    const handleStartIntro = () => {
        setIntroStarted(true);
        speak(introText, () => {
            setIntroPlayed(true);
            setUnlockedCards([1]);
        });
    };

    const handleCardClick = (cardId) => {
        if (!introPlayed && !audioFailed) return;
        if (!unlockedCards.includes(cardId)) return;
        if (isPlayingAudio) return;
        if (flippedCards.includes(cardId)) return;

        setActiveCard(cardId);
        setFlippedCards([...flippedCards, cardId]);

        const card = alerts.find(a => a.id === cardId);
        const fullText = `${card.content} ${card.example}`;

        speak(fullText, () => {
            const nextCardId = cardId + 1;
            if (nextCardId <= alerts.length) {
                setUnlockedCards([...unlockedCards, nextCardId]);
            }
            setActiveCard(null);
        });
    };

    const showCards = introPlayed || audioFailed;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
                        Señales de Alerta en SARLAFT
                    </h1>

                    {/* Botón de inicio móvil */}
                    {isMobile && !introStarted && (
                        <div className="flex items-center justify-center min-h-[200px]">
                            <button
                                onClick={handleStartIntro}
                                className="px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-2xl flex items-center gap-4 animate-pulse"
                            >
                                <Volume2 size={32} />
                                Clic para iniciar
                            </button>
                        </div>
                    )}

                    {/* Texto de introducción */}
                    {introStarted && (
                        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 max-w-4xl mx-auto">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    {isPlayingAudio && !introPlayed ? (
                                        <Volume2 className="text-blue-600 animate-pulse" size={28} />
                                    ) : (
                                        <VolumeX className="text-gray-400" size={28} />
                                    )}
                                </div>
                                <p className="text-gray-700 text-base md:text-lg leading-relaxed text-left">
                                    {introText}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cards Section */}
                {introStarted && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {alerts.map((alert, index) => {
                            const isUnlocked = unlockedCards.includes(alert.id) || audioFailed;
                            const isFlipped = flippedCards.includes(alert.id);

                            return (
                                <div
                                    key={alert.id}
                                    className="h-80 md:h-96 perspective-1000"
                                >
                                    {!showCards ? (
                                        /* Loader State */
                                        <div className="relative w-full h-full">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="relative w-32 h-32 md:w-40 md:h-40">
                                                    <div
                                                        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse-radial"
                                                        style={{
                                                            animationDelay: `${index * 0.2}s`
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="absolute inset-4 rounded-full bg-gradient-to-r from-indigo-400 to-pink-500 animate-pulse-radial"
                                                        style={{
                                                            animationDelay: `${index * 0.2 + 0.3}s`
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="absolute inset-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 animate-pulse-delay"
                                                        style={{
                                                            animationDelay: `${index * 0.2 + 0.6}s`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Flip Card */
                                        <div
                                            className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''
                                                } ${!isUnlocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            onClick={() => handleCardClick(alert.id)}
                                        >
                                            {/* Front */}
                                            <div className="absolute w-full h-full backface-hidden">
                                                <div className={`w-full h-full ${isUnlocked
                                                        ? `bg-gradient-to-br ${alert.color}`
                                                        : 'bg-gradient-to-br from-gray-300 to-gray-400'
                                                    } rounded-2xl shadow-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-500`}>
                                                    {/* Overlay de deshabilitado */}
                                                    {!isUnlocked && (
                                                        <div className="absolute inset-0 bg-gray-600/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                                                            <div className="text-center">
                                                                <Lock size={48} className="text-white/80 mx-auto mb-2" />
                                                                <p className="text-white/90 font-semibold text-sm">Bloqueada</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Check mark para cards vistas */}
                                                    {isFlipped && (
                                                        <div className="absolute top-4 right-4 z-10">
                                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-sm"></div>
                                                    <div className="relative z-10 flex flex-col items-center">
                                                        <div className={`mb-6 p-4 rounded-full ${isUnlocked ? 'bg-white/20' : 'bg-white/10'
                                                            } transition-all duration-500`}>
                                                            <span className={`text-7xl md:text-8xl ${isUnlocked ? 'grayscale-0' : 'grayscale opacity-40'
                                                                } transition-all duration-500`}>
                                                                {alert.icono}
                                                            </span>
                                                        </div>
                                                        <div className={`text-5xl md:text-6xl mb-4 font-bold transition-all duration-500 ${isUnlocked ? 'text-white' : 'text-white/40'
                                                            }`}>
                                                            {alert.id}
                                                        </div>
                                                        <h3 className={`text-lg md:text-xl font-bold text-center leading-tight px-2 transition-all duration-500 ${isUnlocked ? 'text-white' : 'text-white/40'
                                                            }`}>
                                                            {alert.title}
                                                        </h3>
                                                        {isUnlocked && !isFlipped && (
                                                            <div className="mt-6 px-4 py-2 bg-white/30 rounded-full backdrop-blur-sm animate-pulse">
                                                                <p className="text-white text-sm font-semibold">
                                                                    Clic para ver más
                                                                </p>
                                                            </div>
                                                        )}
                                                        {isFlipped && (
                                                            <div className="mt-6 px-4 py-2 bg-green-500/30 rounded-full backdrop-blur-sm">
                                                                <p className="text-white text-sm font-semibold">
                                                                    ✓ Completada
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Back */}
                                            <div className="absolute w-full h-full backface-hidden rotate-y-180">
                                                <div className="w-full h-full bg-white rounded-2xl shadow-2xl p-6 flex flex-col justify-between border-4 border-gray-100">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 bg-gradient-to-br ${alert.color} rounded-lg flex items-center justify-center`}>
                                                                    <span className="text-3xl">{alert.icono}</span>
                                                                </div>
                                                                <span className="text-3xl font-bold text-gray-800">
                                                                    {alert.id}
                                                                </span>
                                                            </div>
                                                            {activeCard === alert.id && isPlayingAudio && (
                                                                <Volume2 className="text-blue-600 animate-pulse" size={24} />
                                                            )}
                                                        </div>
                                                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                                                            {alert.title}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm md:text-base mb-4 leading-relaxed">
                                                            {alert.content}
                                                        </p>
                                                        <div className={`bg-gradient-to-r ${alert.color} bg-opacity-10 border-l-4 border-current p-3 rounded`}>
                                                            <p className="text-gray-700 text-xs md:text-sm italic font-medium">
                                                                {alert.example}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-center mt-4 pt-4 border-t border-gray-200">
                                                        <p className="text-xs text-gray-500 font-semibold">
                                                            Alerta {alert.id} de {alerts.length}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {showCards && (
                    <div className="mt-8 text-center">
                        <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg">
                            <div className="flex gap-2">
                                {alerts.map((alert) => {
                                    const isViewed = flippedCards.includes(alert.id);
                                    const isUnlocked = unlockedCards.includes(alert.id);

                                    return (
                                        <div
                                            key={alert.id}
                                            className="relative"
                                            title={`Señal ${alert.id}: ${isViewed ? 'Completada' : isUnlocked ? 'Disponible' : 'Bloqueada'}`}
                                        >
                                            <div
                                                className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center text-sm font-bold ${isViewed
                                                        ? 'bg-green-500 text-white shadow-md'
                                                        : isUnlocked
                                                            ? 'bg-blue-500 text-white animate-pulse'
                                                            : 'bg-gray-300 text-gray-500'
                                                    }`}
                                            >
                                                {isViewed ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    alert.id
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="h-8 w-px bg-gray-300"></div>
                            <p className="text-sm text-gray-700 font-semibold">
                                {flippedCards.length} de {alerts.length} completadas
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        @keyframes pulseRadial {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
        }
        
        .animate-pulse-radial {
          animation: pulseRadial 1.5s ease-in-out infinite;
        }
        
        .animate-pulse-delay {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};

export default SarlaftAlerts;