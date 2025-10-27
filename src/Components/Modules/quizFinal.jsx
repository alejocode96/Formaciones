import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, CheckCircle, AlertCircle, RotateCcw, ChevronLeft, ChevronRight, } from 'lucide-react';


function QuizFinal({ currentModule, onContentIsEnded, courseId, moduleId }) {

    const [quizState, setQuizState] = useState('intro');
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [estimatedTime, setEstimatedTime] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});

    // Generar preguntas del quiz una sola vez
    useEffect(() => {
        console.log('currentModule:', currentModule);

        // Intentar acceder a questions de diferentes formas
        let questionGroups = null;

        if (currentModule?.questions) {
            questionGroups = currentModule.questions;
        } else if (Array.isArray(currentModule)) {
            questionGroups = currentModule;
        }

        console.log('questionGroups:', questionGroups);

        if (questionGroups && questionGroups.length > 0) {
            const generatedQuestions = generateQuizQuestions(questionGroups);
            console.log('generatedQuestions:', generatedQuestions);
            setQuizQuestions(generatedQuestions);
            // Calcular tiempo estimado (1.5 minutos por pregunta)
            setEstimatedTime(Math.ceil(generatedQuestions.length * 1.5));
        }
    }, [currentModule]);


    // Función para generar preguntas del quiz
    const generateQuizQuestions = (questionGroups) => {
        const selectedQuestions = [];

        questionGroups.forEach((group) => {
            console.log('Processing group:', group);

            if (group.multipleOption === false) {
                // Seleccionar una pregunta al azar del grupo
                const randomIndex = Math.floor(Math.random() * group.preguntas.length);
                const randomQuestion = group.preguntas[randomIndex];
                selectedQuestions.push({
                    ...randomQuestion,
                    etiqueta: group.etiqueta,
                    respuestas: shuffleArray([...randomQuestion.respuestas])
                });
            } else {
                // Tomar la primera pregunta
                if (group.preguntas.length > 0) {
                    selectedQuestions.push({
                        ...group.preguntas[0],
                        etiqueta: group.etiqueta,
                        respuestas: shuffleArray([...group.preguntas[0].respuestas])
                    });
                }
                // Tomar una pregunta al azar del resto
                if (group.preguntas.length > 1) {
                    const remainingQuestions = group.preguntas.slice(1);
                    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
                    const randomQuestion = remainingQuestions[randomIndex];
                    selectedQuestions.push({
                        ...randomQuestion,
                        etiqueta: group.etiqueta,
                        respuestas: shuffleArray([...randomQuestion.respuestas])
                    });
                }
            }
        });

        return selectedQuestions;
    };

    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Comenzar quiz
    const startQuiz = () => {
        setQuizState('taking');
    };

    // Manejar selección de respuesta
    const handleSelectAnswer = (answerIndex) => {
        if (quizState === 'taking') {
            setUserAnswers({
                ...userAnswers,
                [currentQuestionIndex]: answerIndex
            });
        }
    };

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const allQuestionsAnswered = Object.keys(userAnswers).length === quizQuestions.length;
    const currentAnswer = userAnswers[currentQuestionIndex];
    const minCorrectAnswers = Math.ceil(quizQuestions.length * currentModule.aprovacion);

    if (quizState === 'intro') {
        return (
            <div className="max-w-6xl mx-auto py-12 px-4">
                <div className="flex items-center justify-center mb-12 gap-4">

                    {/* Texto */}
                    <div className="text-left">
                        <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 leading-tight">
                            Evaluación Final
                        </h1>
                        <p className="text-xl text-zinc-400 leading-tight">
                            Es momento de demostrar lo aprendido
                        </p>
                    </div>
                </div>

                <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-8 mb-8">
                    {/* <h2 className="text-2xl font-bold text-zinc-100 mb-6">
                        Acerca de esta evaluación
                    </h2> */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                                    Cantidad de preguntas
                                </h3>
                                <p className="text-zinc-400">
                                    {currentModule.subtitle}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-8 mb-8">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                                    ¿Qué se evaluará?
                                </h3>
                                <p className="text-zinc-400">
                                    El quiz consta de <span className="font-bold text-zinc-200">{quizQuestions.length} preguntas</span> de
                                    opción múltiple que deberás responder de manera individual.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-8 mb-8">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                                    Tiempo estimado
                                </h3>
                                <p className="text-zinc-400">
                                    El tiempo estimado para completar esta evaluación es de aproximadamente{' '}
                                    <span className="font-bold text-zinc-200">{estimatedTime} minutos</span>.
                                    Tómate el tiempo necesario para leer cada pregunta cuidadosamente.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-8 mb-8">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                <RotateCcw className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                                    Intentos disponibles
                                </h3>
                                {currentModule.attemptsLimit === 'unlimited' && (
                                    <p className="text-zinc-400">
                                        Tienes <span className="font-bold text-zinc-200">intentos ilimitados</span> para aprobar
                                        la evaluación. Si no apruebas en el primer intento, podrás volver a intentarlo las veces que necesites.
                                    </p>
                                )}
                                {currentModule.attemptsLimit >= 0 && (
                                    <p className="text-zinc-400">
                                        Tienes <span className="font-bold text-zinc-200">{currentModule.attemptsLimit} intentos</span> para aprobar
                                        la evaluación. Si no apruebas en los intentos establecidos debes volver a realizar el curso completamente.
                                    </p>
                                )}

                            </div>

                        </div>
                    </div>
                </div>

                <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-8 mb-8">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                                    Criterio de aprobación
                                </h3>
                                <p className="text-zinc-400">
                                    Para aprobar esta evaluación necesitas obtener un{' '}
                                    <span className="font-bold text-zinc-200">mínimo del {currentModule.aprovacion * 100}%</span> de respuestas correctas.
                                    Esto significa acertar al menos{' '}
                                    <span className="font-bold text-zinc-200">{minCorrectAnswers} de {quizQuestions.length} preguntas</span>.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mb-8">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-blue-200 mb-2">Recomendaciones importantes</h3>
                            <ul className="text-sm text-blue-300 space-y-2">
                                <li>• Lee cada pregunta cuidadosamente antes de seleccionar tu respuesta</li>
                                <li>• Puedes navegar entre preguntas usando los botones "Anterior" y "Siguiente"</li>
                                <li>• Antes de enviar, tendrás la oportunidad de revisar todas tus respuestas</li>
                                <li>• Si no apruebas, revisa los módulos sugeridos antes de volver a intentarlo</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <button
                    onClick={startQuiz}
                    className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-xl font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                    <Send className="w-6 h-6" />
                    Comenzar Evaluación
                </button>
            </div>
        )
    }

    // VISTA: Tomando el quiz
    if (quizState === 'taking') {
        return (
            <div className="max-w-[100%] mx-auto py-8 px-4">
                <div className="max-w-6xl mx-auto mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
                                {currentQuestionIndex + 1}
                            </div>
                            <span className="text-gray-400">de {quizQuestions.length} preguntas</span>
                        </div>
                        <span className="text-cyan-400 font-semibold">{Math.round((Object.keys(userAnswers).length / quizQuestions.length) * 100)}% completado</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/50" style={{ width: `${(Object.keys(userAnswers).length / quizQuestions.length) * 100}%` }} />
                    </div>
                </div>

                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">


                    {/* Pregunta con línea decorativa */}
                    <div className=" md:mb-12">
                        <div className="flex items-center gap-6">
                            <div className="w-1 bg-gradient-to-b from-zinc-800 to-gray-300 rounded-full h-28 lg:h-48" />
                            <div>
                                <div className="text-sm font-bold text-gray-400 mb-3 tracking-wider">PREGUNTA {currentQuestionIndex + 1}</div>
                                <h2 className="text-xl lg:text-5xl font-bold text-gray-200 leading-tight">
                                    {currentQuestion.name}
                                </h2>

                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {/* Opciones de respuesta */}
                        <div className="space-y-4 mb-8">
                            {currentQuestion.respuestas.map((option, index) => {
                                const isSelected = currentAnswer === index;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectAnswer(index)}
                                        className={`w-full text-left p-2 rounded-2xl transition-all duration-300 border group relative overflow-hidden ${isSelected ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500 shadow-lg shadow-cyan-500/30' : 'bg-zinc-800/40 border-zinc-700/50 hover:border-cyan-500/50 hover:shadow-lg'} cursor-pointer group`} >
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-pulse" />
                                        )}
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all ${isSelected
                                                ? 'bg-white text-cyan-600 shadow-lg'
                                                : 'bg-zinc-700 text-zinc-300 group-hover:bg-zinc-600'
                                                }`}>
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                {option.opcion}
                                            </span>

                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Navegación */}
                        <div className="flex items-center justify-between gap-4">
                            <button
                                // onClick={goToPreviousQuestion}
                                disabled={currentQuestionIndex === 0}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${currentQuestionIndex === 0 ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'}`}  >
                                <ChevronLeft className="w-5 h-5" />
                                Anterior
                            </button>

                            {currentQuestionIndex === quizQuestions.length - 1 && allQuestionsAnswered ? (
                                <button
                                    // onClick={goToReview}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transition-all duration-300 shadow-lg" >
                                    Revisar Respuestas
                                    <Send className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    // onClick={goToNextQuestion}
                                    disabled={currentQuestionIndex === quizQuestions.length - 1}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${currentQuestionIndex === quizQuestions.length - 1 ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}  >
                                    Siguiente
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                    </div>
                </div>





                {/* Advertencia si faltan respuestas */}
                {currentQuestionIndex === quizQuestions.length - 1 && !allQuestionsAnswered && (
                    <div className="mt-6 p-4 bg-orange-900/20 border border-orange-500/50 rounded-xl">
                        <div className="flex items-center gap-3 text-orange-300">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">
                                Debes responder todas las preguntas antes de continuar.
                                Faltan {quizQuestions.length - Object.keys(userAnswers).length} pregunta(s) por responder.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        )

    }

}

export default QuizFinal;