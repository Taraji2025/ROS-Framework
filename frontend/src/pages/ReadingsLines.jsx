import { computeReadings, fmt } from '../ros-engine.js';
import { READING_META } from '../ros-model.js';

// Lectures Maturité / Influence affichées à côté du score principal (spec V4 §7).
// Elles n'entrent jamais dans le score : l'étiquette « hors score » le dit à l'écran,
// pour qu'aucun lecteur ne les additionne de tête au chiffre titre.
export default function ReadingsLines({ cells }) {
  const readings = computeReadings(cells ?? {});
  return (
    <div className="readings-lines">
      {Object.entries(READING_META).map(([key, meta]) => {
        const r = readings[key];
        const vide = r.score === null;
        return (
          <div className="reading-line" key={key} title={meta.question}>
            <span className="reading-label">{meta.label}</span>
            <span className="reading-val">{vide ? 'non renseignée' : fmt(r.score)}</span>
            <span className="reading-meta">{r.filled}/{r.applicable} lectures · hors score</span>
          </div>
        );
      })}
    </div>
  );
}
