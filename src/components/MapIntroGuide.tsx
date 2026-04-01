import { safeStorage } from '@/utils/safeStorage';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const MapIntroGuide = ({ onComplete }: { onComplete: () => void }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ca') ? 'ca' : 'es';
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      icon: '🗺️',
      title: lang === 'ca' ? 'El mapa de perill' : 'El mapa de peligro',
      text: lang === 'ca'
        ? 'Veu les alertes actives de procesionària i altres perills a la teva zona en temps real'
        : 'Ve las alertas activas de procesionaria y otros peligros en tu zona en tiempo real',
    },
    {
      icon: '➕',
      title: lang === 'ca' ? 'Reporta un avistament' : 'Reporta un avistamiento',
      text: lang === 'ca'
        ? 'Veus un niu o una processó? Prem el botó + o mantén el mapa per crear una alerta'
        : '¿Ves un nido o una procesión? Pulsa el botón + o mantén el mapa para crear una alerta',
    },
    {
      icon: '✅',
      title: lang === 'ca' ? 'Valida avistaments' : 'Valida avistamientos',
      text: lang === 'ca'
        ? 'Confirma reportes d\'altres usuaris quan estiguis a prop. Guanyes punts!'
        : 'Confirma reportes de otros usuarios cuando estés cerca. ¡Ganas puntos!',
    },
    {
      icon: '🆘',
      title: lang === 'ca' ? 'Botó SOS' : 'Botón SOS',
      text: lang === 'ca'
        ? 'En cas d\'emergència, el botó SOS et dona accés immediat als veterinaris i serveis locals de la teva zona'
        : 'En caso de emergencia, el botón SOS te da acceso inmediato a veterinarios y servicios locales de tu zona',
    },
  ];

  const isLast = slide === slides.length - 1;
  const s = slides[slide];

  const handleNext = () => {
    if (isLast) {
      safeStorage.setItem('map_intro_shown', 'true');
      onComplete();
    } else {
      setSlide(slide + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[9998] bg-black/60 flex items-center justify-center p-6" onClick={handleNext}>
      <div
        className="bg-card rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-5xl mb-4">{s.icon}</div>
        <h2 className="text-lg font-bold text-foreground mb-2">{s.title}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{s.text}</p>
        <div className="flex gap-2 justify-center mb-6">
          {slides.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === slide ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
        <Button onClick={handleNext} className="w-full">
          {isLast
            ? (lang === 'ca' ? 'Entès! Explorar el mapa →' : '¡Entendido! Explorar el mapa →')
            : (lang === 'ca' ? 'Següent →' : 'Siguiente →')}
        </Button>
      </div>
    </div>
  );
};

export default MapIntroGuide;
