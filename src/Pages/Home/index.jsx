import React from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from "aos";
//contexto
import { TrainingLogiTransContext } from '../../Context';

//logo
import logo from '../../assets/logitranslogo.png'

//iconos
import { HelpCircle, CheckCircle, MoreHorizontal, ChevronRight } from 'lucide-react';


function Home() {

  //uso del contexto
  const { getTrainingsWithProgress } = React.useContext(TrainingLogiTransContext);

  //navegacion
  const navigate = useNavigate();

  //estado para hover
  const [hoveredCard, setHoveredCard] = React.useState(null);

  // Obtener cursos con su progreso actual
  const trainings = getTrainingsWithProgress();

  //obtener icono dependiendo del % del cumplimiento
  const getStatusIcon = (cumplimiento) => {
    if (cumplimiento <= 0) return HelpCircle;
    if (cumplimiento === 100) return CheckCircle;
    return MoreHorizontal;
  };

  // qobtener color segun % cumplimiento
  const getStatusColor = (cumplimiento) => {
    if (cumplimiento <= 0) return 'zinc';
    if (cumplimiento === 100) return 'emerald';
    return 'orange';
  };

  //direccionar a dar click
  const handleCardClick = (training) => {
    // Navegación dinámica usando el ID del curso
    navigate(`/training/${training.id}`);
  };

  // Refrescar AOS cuando el componente se monte
  React.useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <>
  

      <div className=''>
        <div className='absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500 '></div>

        <div className='w-[90%] mx-auto pt-16 pb-8'>
          <div className='text-start mb-4'>
            <div className='m-0 p-0 leading-0' data-aos="fade-up">
              <p className='text-zinc-400 text-3xl md:text-5xl font-extralight leading-none mb-0 '>FORMACIONES</p>
              <p className='bg-gradient-to-br from-zinc-200 to-zinc-500 bg-clip-text text-6xl/[1.07] font-bold tracking-tight text-transparent md:text-[7rem]/[1.07] lg:text-[10rem]/[1.07] leading-none'>LOGITRANS</p>
            </div>
          </div>
          <div className="space-y-4">
            {trainings.map((training, index) => {
              const statusColor = getStatusColor(training.cumplimiento);
              const StatusIcon = getStatusIcon(training.cumplimiento);
              const isHovered = hoveredCard === training.id;
              return (
                <div data-aos="fade-up" data-aos-delay={index * 100} data-aos-duration="600"  key={training.id}>
                  <div onClick={() => handleCardClick(training)} onMouseEnter={() => setHoveredCard(training.id)} onMouseLeave={() => setHoveredCard(null)} className={`group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 ease-out transform ${isHovered ? 'scale-[1.02] -translate-y-2' : 'hover:scale-[1.01]'}`} style={{ animationDelay: `${index * 100}ms` }}>
                    {/* Card background with glassmorphism */}
                    <div className={`absolute inset-0 ${training.cumplimiento <= 0 ? 'bg-gradient-to-br from-zinc-800-80 via-zinc-900/60 to-zinc-950/80' : training.cumplimiento === 100 ? 'bg-gradient-to-br from-emerald-900/40 via-zinc-900/60 to-zinc-950/80' : 'bg-gradient-to-br from-orange-900/40 via-zinc-900/60 to-zinc-950/80'} backdrop-blur-sm`}></div>

                    {/* Animated border */}
                    <div className={`absolute inset-0 rounded-3xl ${training.cumplimiento <= 0 ? 'border border-zinc-700/50' : training.cumplimiento === 100 ? 'border border-emerald-500/30' : 'border border-orange-500/30'} ${isHovered ? 'shadow-2xl shadow-current/20' : ''}`}></div>

                    {/* Content */}
                    <div className='relative p-4 md:p-6 flex items-center justify-between'>
                      <div className='flex items-center space-x-4 flex-1'>
                        {/* Status icon with glow */}
                        <div className={`relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl shrink-0 ${training.cumplimiento <= 0 ? 'bg-zinc-800/80' : training.cumplimiento === 100 ? 'bg-emerald-900/60' : 'bg-orange-900/60'} ${isHovered ? 'transform rotate-12 scale-110' : ''} transition-all duration-300`}>
                          <StatusIcon size={20} className={`${training.cumplimiento <= 0 ? 'text-zinc-400' : training.cumplimiento === 100 ? 'text-emerald-400' : 'text-orange-400'}`} strokeWidth={1.5}></StatusIcon>
                          {isHovered && (
                            <div className={`absolute inset-0 rounded-2xl blur-xl ${training.cumplimiento <= 0 ? 'bg-zinc-400/30' : training.cumplimiento === 100 ? 'bg-emerald-400/30' : 'bg-orange-400/30'}`}></div>
                          )}
                        </div>
                        {/* Content */}
                        <div className='flex-1'>
                          <div className='flex items-start justify-between '>
                            <div>
                              <h3 className={`text-md md:text-xl lg:text-2xl font-bold mb-0 leading-tight ${training.cumplimiento <= 0 ? 'text-zinc-200' : training.cumplimiento === 100 ? 'text-emerald-100' : 'text-orange-100'}`}>{training.title}</h3>
                              <p className={`text-sm md:text-base font-light leading-tight ${training.cumplimiento <= 0 ? 'text-zinc-400' : training.cumplimiento === 100 ? 'text-emerald-200/80' : 'text-orange-200/80'}`}>{training.subtitle}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Progress section */}
                      <div className='text-center ml-4'>
                        <div className={`text-2xl md:text-3xl font-black mb-2 ${training.cumplimiento <= 0 ? 'text-zinc-500' : training.cumplimiento === 100 ? 'text-emerald-400' : 'text-orange-400'}`}>{training.cumplimiento}%</div>
                        {/* Progress bar */}
                        <div className='w-20 h-2 bg-zinc-700 rounded-full overflow-hidden'>
                          <div className={`h-full rounded-full transition-all duration-1000 ${training.cumplimiento <= 0 ? 'bg-zinc-500' : training.cumplimiento === 0 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-orange-400 to-orange-500'}`} style={{ width: `${training.cumplimiento}%` }}></div>
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <ChevronRight className={`  ml-3 transition-all duration-300 ${isHovered ? 'transform translate-x-2 text-white' : 'text-zinc-600'} ${training.cumplimiento <= 0 ? 'text-zinc-600' : training.cumplimiento === 100 ? 'text-emerald-400' : 'text-orange-400'}  `} size={20} />
                    </div>
                    {/* Hover glow effect */}
                    {isHovered && (
                      <div className={`absolute inset-0 rounded-3xl pointer-events-none ${training.cumplimiento <= 0 ? 'bg-gradient-to-r from-zinc-500/5 to-transparent' : training.cumplimiento === 100 ? 'bg-gradient-to-r from-emerald-500/10 to-transparent' : 'bg-gradient-to-r from-orange-500/10 to-transparent'} `}></div>
                    )}
                  </div>
                </div>

              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home;