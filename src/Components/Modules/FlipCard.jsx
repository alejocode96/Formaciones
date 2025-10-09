import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { TrainingLogiTransContext } from '../../Context';

import ModalFlipCard from './modalFlipCard';
import { Volume2, VolumeX, ChevronRight, ChevronLeft, BookOpen, Target, Lightbulb, Wrench, Lock, CheckCircle, X } from 'lucide-react';

function FlipCard({ cards, onContentIsEnded }) {

    const { } = React.useContext(TrainingLogiTransContext);
    // Control de progreso
    const [etapaActiva, setEtapaActiva] = useState(1);
    const [etapasCompletadas, setEtapasCompletadas] = useState([]);

    const [etapaAbierta, setEtapaAbierta] = useState(null);
    const [seccionActiva, setSeccionActiva] = useState(null);
    const [seccionesVistas, setSeccionesVistas] = useState({});
    const [audioCompletado, setAudioCompletado] = useState(false);
    const [audioEnReproduccion, setAudioEnReproduccion] = useState(false); // NUEVO
    const etapaActualData = etapaAbierta ? cards.find(e => e.id === etapaAbierta) : null;

    const [audioEnabled, setAudioEnabled] = useState(true);
    const [mejorVoz, setMejorVoz] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);



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

    // FUNCIÓN MEJORADA: Ahora solo marca como vista cuando el audio termina completamente
    const reproducirAudio = useCallback((texto, callback) => {
        if (!audioEnabled || !mejorVoz) {
            setAudioCompletado(true);
            if (callback) callback();
            return;
        }

        window.speechSynthesis.cancel();
        setAudioCompletado(false);
        setAudioEnReproduccion(true); // NUEVO: marca que hay audio en curso

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
            setAudioEnReproduccion(false); // NUEVO
            if (callback) callback(); // Solo ejecuta el callback cuando termina
        };

        utterance.onerror = () => {
            setIsPlaying(false);
            setAudioCompletado(false); // CAMBIADO: en error NO marca como completado
            setAudioEnReproduccion(false); // NUEVO
        };

        window.speechSynthesis.speak(utterance);
    }, [audioEnabled, mejorVoz]);



    //abrir etapa
    const abrirEtapa = (etapaId) => {
        if (etapaId > etapaActiva) return;

        setEtapaAbierta(etapaId);
        setSeccionActiva('objetivo');
        setAudioCompletado(false); // NUEVO: resetea el estado al abrir

        const etapa = cards.find(e => e.id === etapaId);

        // CAMBIADO: Solo marca como vista cuando el audio termina
        reproducirAudio(etapa.audioObjetivo, () => {
            setSeccionesVistas(prev => ({
                ...prev,
                [`${etapaId}-objetivo`]: true
            }));
        });
    };

    //cerrar modal
    const cerrarModal = () => {
        // Detener cualquier audio en reproducción
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setAudioEnReproduccion(false);
        setAudioCompletado(false);

        // ⚡ NUEVO: Verificar si la etapa que estaba abierta ya fue completada
        // Esto garantiza que, aunque el usuario cierre el modal justo al terminar el último audio,
        // la siguiente etapa se desbloquee correctamente.
        if (etapaAbierta) {
            verificarEtapaCompletada(etapaAbierta);
        }

        // Cerrar modal y limpiar estados
        setEtapaAbierta(null);
        setSeccionActiva(null);
    };


    const puedeAvanzarASeccion = (seccionActual, nuevaSeccion) => {
        if (!etapaAbierta) return false;

        const etapa = cards.find(e => e.id === etapaAbierta);
        const secciones = ['objetivo', ...etapa.secciones.map(s => s.id)];
        const indexActual = secciones.indexOf(seccionActual);
        const indexNueva = secciones.indexOf(nuevaSeccion);

        // CAMBIADO: Usa audioEnReproduccion en lugar de solo audioCompletado
        if (audioEnReproduccion && indexNueva > indexActual) {
            return false;
        }

        if (indexNueva < indexActual) {
            return seccionesVistas[`${etapaAbierta}-${nuevaSeccion}`] === true;
        }

        if (indexNueva > indexActual) {
            return seccionesVistas[`${etapaAbierta}-${seccionActual}`] === true;
        }

        return true;
    };

    const cambiarSeccion = (nuevaSeccion) => {
        if (!etapaAbierta) return;

        if (!puedeAvanzarASeccion(seccionActiva, nuevaSeccion)) {
            return;
        }

        setSeccionActiva(nuevaSeccion);
        setAudioCompletado(false); // NUEVO: resetea al cambiar de sección

        const etapa = cards.find(e => e.id === etapaAbierta);

        if (nuevaSeccion === 'objetivo') {
            // CAMBIADO: Solo marca como vista cuando el audio termina
            reproducirAudio(etapa.audioObjetivo, () => {
                setSeccionesVistas(prev => ({
                    ...prev,
                    [`${etapaAbierta}-objetivo`]: true
                }));
            });
        } else {
            const seccion = etapa.secciones.find(s => s.id === nuevaSeccion);

            // CAMBIADO: Solo marca como vista cuando el audio termina
            reproducirAudio(seccion.audio, () => {
                setSeccionesVistas(prev => ({
                    ...prev,
                    [`${etapaAbierta}-${nuevaSeccion}`]: true
                }));

                // NUEVO: Verifica si completó toda la etapa DESPUÉS de marcar como vista
                verificarEtapaCompletada(etapaAbierta);
            });
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

            // NUEVO: Desbloquea la siguiente etapa
            if (etapaId < cards.length) {
                setEtapaActiva(etapaId + 1);
            }
        }
    };

    const siguienteSeccion = () => {
        if (!etapaAbierta) return;
        const etapa = cards.find(e => e.id === etapaAbierta);
        const secciones = ['objetivo', ...etapa.secciones.map(s => s.id)];
        const currentIndex = secciones.indexOf(seccionActiva);

        if (currentIndex < secciones.length - 1 && audioCompletado) {
            cambiarSeccion(secciones[currentIndex + 1]);
        }
    };

    const anteriorSeccion = () => {
        if (!etapaAbierta) return;
        const etapa = cards.find(e => e.id === etapaAbierta);
        const secciones = ['objetivo', ...etapa.secciones.map(s => s.id)];
        const currentIndex = secciones.indexOf(seccionActiva);

        if (currentIndex > 0) {
            cambiarSeccion(secciones[currentIndex - 1]);
        }
    };

    return (
        <div className='w-full  mx-auto pt-10 pb-14 lg:pb-0' data-aos="fade-up" data-aos-delay={300} data-aos-duration="600">
            <div className="text-start mb-12">
                <h1 className="text-xl md:text-2xl font-bold text-white">
                    Etapas del SARLAFT
                </h1>
                <p className="text-slate-300 text-xs md:text-sm">
                    Haz clic en cada tarjeta para explorar el contenido paso a paso
                </p>
                <div className="w-[50%] h-[2px] bg-zinc-500 mt-1 rounded"></div>
            </div>
            {/* Cards Pequeñas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((etapa) => {
                    const estaBloqueada = etapa.id > etapaActiva;
                    const estaCompletada = etapasCompletadas.includes(etapa.id);

                    return (
                        <button key={etapa.id} onClick={() => !estaBloqueada && abrirEtapa(etapa.id)} disabled={estaBloqueada} className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${estaBloqueada ? 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed' : `bg-gradient-to-br ${etapa.color} border-transparent hover:scale-105 hover:shadow-2xl cursor-pointer`}`}>
                            {estaBloqueada && (
                                <Lock size={24} className="absolute top-3 right-3 text-slate-500" />
                            )}
                            {estaCompletada && (
                                <CheckCircle size={24} className="absolute top-3 right-3 text-green-400" />
                            )}

                            <div className="text-5xl mb-3">{etapa.icono}</div>
                            <div className="text-white text-center">
                                <div className="text-xs opacity-75 mb-1">{etapa.numero}</div>
                                <div className="font-bold text-lg">{etapa.titulo}</div>

                                {estaBloqueada ? (
                                    <div className="text-xs opacity-90  text-center">
                                        <p>Completa la etapa anterior</p>
                                    </div>
                                ) : estaCompletada ? (
                                    <div className="text-sm text-green-300 text-center flex items-center gap-2">
                                        <CheckCircle size={20} />
                                        <span>Etapa completada - Click para revisar</span>
                                    </div>
                                ) : (
                                    <div className="mt-4 flex text-center justify-center gap-2 text-sm opacity-75 animate-bounce">
                                        <span>Click para comenzar</span>
                                        <ChevronRight size={20} />
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Modal Expandido */}
            {etapaAbierta && etapaActualData && (
                <ModalFlipCard etapaActualData={etapaActualData} onClose={cerrarModal}>
                    {/* Contenido del Modal */}
                    <div className="p-8 space-y-4">
                        {seccionActiva === 'objetivo' && (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="flex items-center gap-2 text-zinc-200 mb-1">
                                    <h3 className="text-xl md:text-2xl font-bold">Objetivo</h3>
                                </div>
                                <p className="text-slate-300 leading-relaxed text-sm md:text-lg">
                                    {etapaActualData.objetivo}
                                </p>
                            </div>
                        )}

                        {seccionActiva && seccionActiva !== 'objetivo' && (
                            <div className="space-y-4 animate-fadeIn">
                                {(() => {
                                    const seccionData = etapaActualData.secciones.find(s => s.id === seccionActiva);
                                    return (
                                        <>
                                            <div className="flex items-center gap-2 text-zinc-300 mb-4">
                                                {seccionData.icono}
                                                <h3 className="text-2xl font-bold">{seccionData.titulo}</h3>
                                            </div>

                                            {seccionData.contenido.map((item, idx) => (
                                                <div key={idx} className="bg-zinc-800 rounded-lg p-5 border border-zinc-700">
                                                    {item.subtitulo && (
                                                        <h4 className="text-white font-semibold mb-3 flex items-center gap-2 text-lg">
                                                            <span className="text-zinc-300">•</span>
                                                            {item.subtitulo}
                                                        </h4>
                                                    )}
                                                    <p className="text-slate-300 leading-relaxed">
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

                    {/* Footer - Navegación */}
                    <div className="bg-[#151518] border-t-2 border-slate-700 p-6">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <button
                                onClick={anteriorSeccion}
                                disabled={seccionActiva === 'objetivo'}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${seccionActiva === 'objetivo'
                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                    : 'bg-slate-700 text-white hover:bg-slate-600'
                                    }`}
                            >
                                <ChevronLeft size={20} />
                                <span>Anterior</span>
                            </button>

                            <div className="flex gap-2 flex-wrap justify-center">
                                <button
                                    onClick={() => cambiarSeccion('objetivo')}
                                    disabled={!audioCompletado && seccionActiva !== 'objetivo'}
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
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${seccionActiva === s.id
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
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${!audioCompletado ||
                                    seccionActiva === etapaActualData.secciones[etapaActualData.secciones.length - 1].id
                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                    : 'bg-slate-700 text-white hover:bg-slate-600'
                                    }`}
                            >
                                <span>Siguiente</span>
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