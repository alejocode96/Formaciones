import React, { useRef } from 'react';
import { Download } from 'lucide-react';

function CertificateGenerator() {
  const certificateRef = useRef(null);

  const generatePDF = async () => {
    // Importar dinámicamente las librerías
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    const element = certificateRef.current;
    
    // Configurar opciones para mejor calidad
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Crear PDF en orientación horizontal (landscape)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('certificado-curso.pdf');
  };

  // Datos del certificado (podrías recibirlos como props)
  const certificateData = {
    studentName: 'DIEGO ALEJANDRO GALEANO MADRIGAL',
    courseName: 'AGENTES AI',
    completionDate: '6 de MARZO de 2025',
    duration: '18 horas de teoría y práctica',
    instructorName: 'Christian Van Der Henst S',
    instructorTitle: 'COO DE PLATZI',
    ceoName: 'John Freddy Vega',
    ceoTitle: 'CEO DE PLATZI',
    verificationUrl: 'https://platzi.com/@diego.galeano/',
    verificationCode: 'Código: 1a1db44-5881-4c2c-a481-859cca2022e',
    logoUrl: 'image/png' // Aquí va la URL de tu logo
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Generador de Certificado
          </h1>
          <button
            onClick={generatePDF}
            className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg"
          >
            <Download className="w-5 h-5" />
            Descargar Certificado PDF
          </button>
        </div>

        {/* Certificado - Este div se convierte en PDF */}
        <div className="overflow-x-auto flex justify-center">
          <div 
            ref={certificateRef}
            className="bg-white shadow-2xl relative"
            style={{ 
              width: '297mm',
              height: '210mm',
            }}
          >
            {/* Marca de agua superior izquierda */}
            <div className="absolute top-8 left-8 opacity-5 pointer-events-none">
              <img 
                src={certificateData.logoUrl}
                alt="Watermark"
                className="w-96 h-96 object-contain grayscale"
              />
            </div>

            {/* Marca de agua inferior derecha */}
            <div className="absolute bottom-8 right-8 opacity-5 pointer-events-none">
              <img 
                src={certificateData.logoUrl}
                alt="Watermark"
                className="w-96 h-96 object-contain grayscale"
              />
            </div>

            {/* Borde del certificado */}
            <div className="absolute inset-4 border-8 border-black"></div>

            {/* Contenido del certificado */}
            <div className="relative h-full flex flex-col justify-between px-16 py-12">
              {/* Header con logo */}
              <div className="text-center mt-6">
                <div className="mb-8">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#000"/>
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#000" strokeWidth="2" fill="none"/>
                    </svg>
                    <span className="text-4xl font-bold text-black">Platzi</span>
                  </div>
                </div>
                
                <p className="text-base text-gray-600 mb-2">Certifica a</p>
                <h1 className="text-4xl font-bold text-black mb-8 tracking-wide uppercase" style={{ fontFamily: 'Arial, sans-serif' }}>
                  {certificateData.studentName}
                </h1>
                
                <p className="text-base text-gray-600 mb-1">Por participar y aprobar el</p>
                <p className="text-xl text-gray-700 mb-2">CURSO DE</p>
                <h2 className="text-5xl font-bold text-black mb-8">
                  {certificateData.courseName}
                </h2>
              </div>

              {/* Footer con firmas y detalles */}
              <div className="mb-6">
                {/* Firmas */}
                <div className="grid grid-cols-3 gap-8 mb-6 items-end">
                  {/* Firma 1 */}
                  <div className="text-center">
                    <div className="mb-2 h-12 flex items-end justify-center">
                      <svg className="w-32 h-10" viewBox="0 0 200 60">
                        <path 
                          d="M10,40 Q30,20 50,35 Q70,50 90,30 Q110,10 130,40" 
                          stroke="#000" 
                          strokeWidth="2.5" 
                          fill="none"
                        />
                      </svg>
                    </div>
                    <div className="border-t-2 border-black pt-2">
                      <p className="text-xs font-semibold">{certificateData.instructorName}</p>
                      <p className="text-xs text-gray-600">{certificateData.instructorTitle}</p>
                    </div>
                  </div>

                  {/* Sello central */}
                  <div className="flex justify-center items-center">
                    <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center border-4 border-green-800 shadow-lg">
                      <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 1.74.5 3.37 1.41 4.84.95 1.54 2.2 2.86 3.16 4.4.47.75.81 1.45 1.17 2.26.26.55.47 1.5 1.26 1.5s1-.95 1.26-1.5c.36-.81.7-1.51 1.17-2.26.96-1.54 2.21-2.86 3.16-4.4C18.5 12.37 19 10.74 19 9c0-3.87-3.13-7-7-7zm0 9.75c-1.52 0-2.75-1.23-2.75-2.75S10.48 6.25 12 6.25s2.75 1.23 2.75 2.75-1.23 2.75-2.75 2.75z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Firma 2 */}
                  <div className="text-center">
                    <div className="mb-2 h-12 flex items-end justify-center">
                      <svg className="w-32 h-10" viewBox="0 0 200 60">
                        <path 
                          d="M20,35 Q40,15 60,30 L80,45 Q100,25 120,40 L140,30" 
                          stroke="#000" 
                          strokeWidth="2.5" 
                          fill="none"
                        />
                      </svg>
                    </div>
                    <div className="border-t-2 border-black pt-2">
                      <p className="text-xs font-semibold">{certificateData.ceoName}</p>
                      <p className="text-xs text-gray-600">{certificateData.ceoTitle}</p>
                    </div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="text-center text-xs text-gray-600">
                  <p className="mb-1">Certificación de aprobación online:</p>
                  <p className="font-semibold text-black mb-1">
                    Aprobado el {certificateData.completionDate}
                  </p>
                  <p className="mb-2">{certificateData.duration}</p>
                  <p className="text-xs text-blue-600 mb-0.5">{certificateData.verificationUrl}</p>
                  <p className="text-xs text-gray-500">{certificateData.verificationCode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg max-w-4xl mx-auto">
          <p className="text-blue-300 text-sm">
            <strong>Nota:</strong> El certificado se genera en formato PDF de alta calidad.
            Las marcas de agua aparecen en gris con opacidad del 5%.
            Instala las librerías: <code className="bg-blue-900/50 px-2 py-1 rounded text-xs">npm install jspdf html2canvas</code>
          </p>
        </div>

        {/* Instrucciones de uso */}
        <div className="mt-4 p-4 bg-purple-900/20 border border-purple-500/50 rounded-lg max-w-4xl mx-auto">
          <p className="text-purple-300 text-sm mb-2">
            <strong>Configuración:</strong>
          </p>
          <ul className="text-purple-300 text-xs space-y-1 list-disc list-inside">
            <li>Reemplaza <code className="bg-purple-900/50 px-1 rounded">'image/png'</code> con la URL real de tu logo</li>
            <li>Las marcas de agua se posicionan en superior izquierda e inferior derecha</li>
            <li>El tamaño de las marcas es 96x96 (w-96 h-96), ajustable según necesites</li>
            <li>La clase <code className="bg-purple-900/50 px-1 rounded">grayscale</code> convierte la imagen a gris</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CertificateGenerator;    