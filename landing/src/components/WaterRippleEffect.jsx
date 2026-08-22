import { useEffect } from 'react';

const WaterRippleEffect = () => {
  useEffect(() => {
    const handlePointerDown = (e) => {
      // Crear contenedor de la primera onda concéntrica
      const rippleOuter = document.createElement('span');
      rippleOuter.className = 'water-ripple-effect';
      rippleOuter.style.left = `${e.clientX}px`;
      rippleOuter.style.top = `${e.clientY}px`;

      // Crear contenedor de la segunda onda secundaria
      const rippleInner = document.createElement('span');
      rippleInner.className = 'water-ripple-effect-inner';
      rippleInner.style.left = `${e.clientX}px`;
      rippleInner.style.top = `${e.clientY}px`;

      document.body.appendChild(rippleOuter);
      document.body.appendChild(rippleInner);

      // Eliminar elementos del DOM al terminar la animación
      setTimeout(() => {
        rippleOuter.remove();
        rippleInner.remove();
      }, 1000);
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return null;
};

export default WaterRippleEffect;
