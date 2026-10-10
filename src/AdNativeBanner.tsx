import AdSlot from './AdSlot';

const KEY = '4e2be52272380774a825aa653412c2c4';

// Adsterra — bannière native
export default function AdNativeBanner() {
  return (
    <AdSlot
      maxWidth={480}
      minHeight={120}
      mount={(container) => {
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = 'https://bicea.org/21/' + KEY;
        const target = document.createElement('div');
        target.id = 'container-' + KEY;
        target.style.width = '100%';
        container.appendChild(script);
        container.appendChild(target);
      }}
    />
  );
}
