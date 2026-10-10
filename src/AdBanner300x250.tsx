import AdSlot from './AdSlot';

const KEY = '20fc9e612591866e215158a0c4eae20b';

// Adsterra — bannière 300x250
export default function AdBanner300x250() {
  return (
    <AdSlot
      maxWidth={300}
      minHeight={250}
      mount={(container) => {
        const conf = document.createElement('script');
        conf.text =
          "atOptions = {'key': '" + KEY + "', 'format': 'iframe', 'height': 250, 'width': 300, 'params': {}};";
        const invoke = document.createElement('script');
        invoke.src = 'https://bicea.org/22/' + KEY;
        container.appendChild(conf);
        container.appendChild(invoke);
      }}
    />
  );
}
