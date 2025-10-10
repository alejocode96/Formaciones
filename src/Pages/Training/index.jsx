import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, IdCard, AlertCircle, CheckCircle } from 'lucide-react';
//contexto
import { TrainingLogiTransContext } from '../../Context';

function Training() {
    //id del curso actual
    const { courseId } = useParams();

    //importaciones del contexto
    const {
        getCourseById,
        hasUserProgress,
        getUserProgressForCourse,
        createCourseProgress,
        resetCourseProgress
    } = React.useContext(TrainingLogiTransContext);

    //navegacion
    const navigate = useNavigate();

    // Estados para los inputs
    const [nombre, setNombre] = React.useState('');
    const [cedula, setCedula] = React.useState('');
    const [errors, setErrors] = React.useState({});

    //estados para manejo de proceso actual del curso
    const [showContinueDialog, setShowContinueDialog] = React.useState(false);
    const [showChangeDataDialog, setShowChangeDataDialog] = React.useState(false);
    const [existingUserData, setExistingUserData] = React.useState(null);

    // Obtener el curso actual
    const currentCourse = getCourseById(courseId);

    //Efecto para verificar si ya existe un progreso
    React.useEffect(() => {
        // Verificar si ya existe progreso para este curso
        // Agregamos un pequeño delay para asegurar que el contexto esté completamente cargado
        const checkProgress = () => {
            if (hasUserProgress(courseId)) {
                const progress = getUserProgressForCourse(courseId);
                if (progress && progress.nombre && progress.cedula) {
                    setExistingUserData(progress);
                    setShowContinueDialog(true);
                }
            }
        };

        // Verificar inmediatamente
        checkProgress();

        // También verificar después de un pequeño delay por si el localStorage aún no se ha cargado
        const timeoutId = setTimeout(checkProgress, 100);

        return () => clearTimeout(timeoutId);
    }, [courseId, hasUserProgress, getUserProgressForCourse]);

    //validar datos del formulario
    const validateForm = () => {
        const newErrors = {};

        if (!nombre.trim()) {
            newErrors.nombre = 'El nombre es obligatorio';
        }

        if (!cedula.trim()) {
            newErrors.cedula = 'La cédula es obligatoria';
        } else if (!/^\d+$/.test(cedula.trim())) {
            newErrors.cedula = 'La cédula debe contener solo números';
        }
        

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    //boton para iniciar curso
    const handleStartCourse = () => {
        if (validateForm()) {
            const userData = {
                nombre: nombre.trim(),
                cedula: cedula.trim()
            };

            if (createCourseProgress(courseId, userData)) {
                navigate(`/training/${courseId}/module/1`);
            }
        }
    };

    //boton para continuar curso
    const handleContinueCourse = () => {
        navigate(`/training/${courseId}/module/${existingUserData.currentModule || 1}`);
    };

    //boton para cambiar datos
    const handleChangeData = () => {
        setShowContinueDialog(false);
        setShowChangeDataDialog(true);
    };

    //boton para cambiar data
    const handleConfirmChangeData = () => {
      
        if (validateForm()) {
            const userData = {
                nombre: nombre.trim(),
                cedula: cedula.trim()
            };

            if (resetCourseProgress(courseId, userData)) {
              
                navigate(`/training/${courseId}/module/1`);
            }
        }
    };

    //boton para cancelar cambio
    const handleCancelChangeData = () => {
        setShowChangeDataDialog(false);
        setShowContinueDialog(true);
        setNombre('');
        setCedula('');
        setErrors({});
    };

    

    //por si l curso no existe
    if (!currentCourse) {
        return (
            <div data-aos="fade-up" data-aos-delay={300} data-aos-duration="600" className="w-full bg-[#09090b] text-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Curso no encontrado</h1>
                    <p className="text-zinc-400 mb-4">El curso que buscas no existe o ha sido eliminado.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    //retornar si hay progreso
    if (showContinueDialog && existingUserData) {
        return (
            <div  className='w-full bg-[#09090b] text-white flex pt-10 items-center justify-center'>
                <div data-aos="fade-up" data-aos-delay={300} data-aos-duration="600" data-aos-once="false" className='w-[90%] md:w-[85%]  mx-auto bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 mb-6'>
                    <div className="text-center mb-6">
                        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Progreso del {existingUserData.cumplimiento}% Encontrado</h2>
                        <p className="text-zinc-300 mb-4"> Ya tienes progreso en este curso: </p>
                        <div className="bg-zinc-900/50 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Input Nombre */}
                                <div className='flex flex-col items-start'>
                                    <label htmlFor="nombre" className="block text-sm font-medium text-zinc-300 mb-2">
                                        Nombre Completo
                                    </label>
                                    <div className="relative w-full">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-zinc-400" />
                                        </div>
                                        <input disabled type="text" id="nombre" value={existingUserData.nombre} className={`block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-lg bg-zinc-800/50 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-colors duration-200`} />
                                    </div>

                                </div>
                                {/* Input Cédula */}
                                <div className='flex flex-col items-start w-full'>
                                    <label htmlFor="cedula" className="block text-sm font-medium text-zinc-300 mb-2">
                                        Número de Cédula
                                    </label>
                                    <div className="relative w-full">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <IdCard className="h-5 w-5 text-zinc-400" />
                                        </div>
                                        <input disabled type="text" id="cedula" value={existingUserData.cedula} className={`block w-full pl-10 pr-3 py-3 border border-zinc-700 rounded-lg bg-zinc-800/50 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-colors duration-200`} />
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className='md:flex space-x-3 md:space-y-0 space-y-3'>
                            <button onClick={handleContinueCourse} className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">Continuar curso</button>
                            <button onClick={handleChangeData} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">Cambiar datos</button>
                        </div>
                        <button onClick={() => navigate('/')} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300">Volver al inicio</button>
                    </div>

                </div>

            </div>
        )
    }

    if (showChangeDataDialog) {
        return (
            <div  className='w-full bg-[#09090b] text-white flex pt-10 items-center justify-center'>
                <div data-aos="fade-up" data-aos-delay={300} data-aos-duration="600" data-aos-once="false" className='w-[90%] md:w-[85%]  mx-auto bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 mb-6'>
                    <div className="text-center mb-6">
                        <AlertCircle className="h-16 w-16 text-orange-400 mx-auto mb-4"></AlertCircle>
                        <h2 className="text-2xl font-bold text-white mb-2">Confirmar Cambio</h2>
                        <p className="text-zinc-300 mb-6">⚠️ Al cambiar los datos, se perderá todo el progreso actual del curso. Esta acción no se puede deshacer.</p>
                    </div>

                    <div className=" grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                        <div>
                            <label htmlFor="nombre" className='block text-sm  font-medium text-zinc-300 mb-2'> Nuevo Nombre Completo *</label>
                            <div className="relative">
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center  pointer-events-none'>
                                    <User className="h-5 w-5 text-zinc-400"></User>
                                </div>
                                <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ingresa el nuevo nombre completo" className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-zinc-800/50  text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${errors.nombre ? 'border-red-500 focus:ring-red-500/50' : 'border-zinc-700 focus:ring-emerald-500/50 focus:border-emerald-500'}`} ></input>
                            </div>
                            {errors.nombre && (
                                <p className="mt-2 text-sm text-red-400">{errors.nombre}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="cedula" className="block text-sm font-medium text-zinc-300 mb-2">Nueva Cédula *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IdCard className="h-5 w-5 text-zinc-400"></IdCard>
                                </div>
                                <input type="text" id="cedula" value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="Ingresa la nueva cédula" className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-zinc-800/50 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${errors.cedula ? 'border-red-500 focus:ring-red-500/50' : 'border-zinc-700 focus:ring-emerald-500/50 focus:border-emerald-500'}`}></input>
                            </div>
                            {errors.cedula && (
                                <p className="mt-2 text-sm text-red-400">{errors.cedula}</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <button onClick={handleConfirmChangeData} className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300" >Confirmar y Reiniciar</button>
                        <button onClick={handleCancelChangeData} className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300">Cancelar</button>
                    </div>
                </div>

            </div>
        )
    }

    return (
        <div  className="w-full bg-[#09090b] text-white my-4 mt-12">
            <main data-aos="fade-up" data-aos-delay={300} data-aos-duration="600" data-aos-once="false" className="w-[90%] mx-auto flex items-center justify-center">
                <div className='"max-w-5xl mx-auto text-center'>
                    <h1 className="bg-gradient-to-br from-zinc-200 to-zinc-500 bg-clip-text text-5xl/[1.07] font-bold tracking-tight text-transparent leading-none mb-4">{currentCourse.title}</h1>
                    <div className="max-w-4xl mx-auto mb-10">
                        {currentCourse.content.description.map((paragraph, index) => (
                            <p key={index} className="text-base text-gray-300 text-justify leading-relaxed mb-4 last:mb-0">
                                {paragraph.split('**').map((text, i) =>
                                    i % 2 === 0 ? text : <strong key={i}></strong>
                                )}
                            </p>
                        ))}
                    </div>
                    <div className="max-w-4xl mb-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className='flex flex-col items-start'>
                                <label htmlFor="nombre" className="block text-sm font-medium text-zinc-300 mb-2"> Nombre Completo *</label>
                                <div className="relative w-full">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ingresa tu nombre completo"
                                        className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-zinc-800/50 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${errors.nombre ? 'border-red-500 focus:ring-red-500/50' : 'border-zinc-700 focus:ring-emerald-500/50 focus:border-emerald-500'}`}      >
                                    </input>
                                </div>
                                {errors.nombre && (
                                    <p className="mt-2 text-sm text-red-400">{errors.nombre}</p>
                                )}
                            </div>
                            <div className='flex flex-col items-start w-full'>
                                <label htmlFor="cedula" className="block text-sm font-medium text-zinc-300 mb-2">Número de Cédula *</label>
                                <div className="relative w-full">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IdCard className="h-5 w-5 text-zinc-400" />
                                    </div>
                                    <input type="text" id="cedula" value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="Ingresa tu número de cédula"
                                        className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-zinc-800/50 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 transition-colors duration-200 ${errors.cedula ? 'border-red-500 focus:ring-red-500/50' : 'border-zinc-700 focus:ring-emerald-500/50 focus:border-emerald-500'}`}>

                                    </input>
                                </div>
                                {errors.cedula && (
                                    <p className="mt-2 text-sm text-red-400">{errors.cedula}</p>
                                )}
                            </div>

                        </div>
                    </div>
                    <div className="flex justify-center">
                        <button onClick={handleStartCourse} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-32 w-full rounded-xl transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg text-lg">Comenzar</button>
                    </div>
                </div>
            </main>
        </div>
    )
}
export default Training;