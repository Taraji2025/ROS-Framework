import { Section, Step, Callout } from './guide-ui.jsx';
import { PROFILES, VOIES } from '../../ros-model.js';

// Applicabilité par profil : dérivée de PROFILES/VOIES, jamais écrite en dur.
const tousIds = VOIES.map(v => v.id);
const sansObjet = p => tousIds.filter(id => !PROFILES[p].applicable.includes(id))
  .map(id => VOIES.find(v => v.id === id).code);

export default function GuideWorkflow() {
  return (
    <div>
      <Section title="Le parcours d'une évaluation">
        <Step n={1} title="Choisir le profil de l'entreprise">
          Le profil (Standard, Banque, Industrie, Tech, Énergie) détermine quelles Voies sont <strong style={{ color: 'var(--text)' }}>applicables</strong> —
          il ne pondère rien. Une Voie sans objet pour le profil retenu n'apparaît pas dans la saisie et n'entre pas dans le score.
        </Step>
        <Step n={2} title="Réunir les porteurs de données">
          Chaque Voie appartient à un domaine (technique, juridique, achats…) : identifier, avant la saisie, qui détient l'information —
          DSI/RSSI, direction juridique, achats/supply chain — évite les cellules devinées.
        </Step>
        <Step n={3} title="Saisir les Voies applicables">
          Pour chaque Voie, sélectionner la bande (ou la valeur numérique) qui correspond à la situation réelle de l'entreprise, telle que définie
          dans le référentiel.
        </Step>
        <Step n={4} title="Sourcer chaque cellule">
          Renseigner la preuve associée : d'où vient l'information, quelle est la note qui la justifie. Sans preuve, une cellule reste une déclaration
          non vérifiable.
        </Step>
        <Step n={5} title="Vérifier la complétude">
          Une évaluation n'est publiable que lorsque toutes les Voies applicables au profil sont remplies — voir l'encadré ci-dessous.
        </Step>
        <Step n={6} title="Sauvegarder">
          L'évaluation est enregistrée avec l'horodatage de chaque preuve.
        </Step>
        <Step n={7} title="Consulter le rapport">
          Rendez-vous dans l'onglet <strong style={{ color: 'var(--text)' }}>/rapport</strong> pour lire le score, sa décomposition par dimension et
          les paliers d'interprétation.
        </Step>
      </Section>

      <Section title="Le profil détermine l'applicabilité, pas des pondérations">
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 12 }}>
          Chaque profil applique l'intégralité du référentiel, sauf les Voies qui n'ont pas de sens pour lui — elles sont alors <strong style={{ color: 'var(--text)' }}>sans objet</strong>,
          exclues de la saisie et du score, pas mises à zéro.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text2)' }}>Profil</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text2)' }}>Voies sans objet</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(PROFILES).map(p => (
              <tr key={p} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 8px', fontWeight: 600 }}>{PROFILES[p].label}</td>
                <td style={{ padding: '6px 8px', color: 'var(--text2)' }}>{sansObjet(p).join(', ') || 'aucune'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Callout tone="var(--orange)" title="Ne jamais saisir 0 pour « je ne sais pas »">
        C'est l'inverse exact du conseil de la version précédente du Guide. Une cellule <strong style={{ color: 'var(--text)' }}>vide</strong> signifie
        « non couverte » — elle compte contre la complétude, et donc contre le caractère publiable de l'évaluation. Un <strong style={{ color: 'var(--text)' }}>0</strong> est
        une <strong style={{ color: 'var(--text)' }}>affirmation</strong> : « mono-source », « aucun dispositif », « rien ». Saisir 0 par défaut quand on ne sait pas revient à
        déclarer le pire scénario comme un fait établi.
      </Callout>

      <Section title="La preuve : ce qui rend l'évaluation opposable">
        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
          Chaque cellule saisie porte une preuve à trois champs : <strong style={{ color: 'var(--text)' }}>source</strong> (d'où vient l'information),
          {' '}<strong style={{ color: 'var(--text)' }}>date</strong> (horodatée automatiquement au moment de la saisie, sans intervention manuelle) et
          {' '}<strong style={{ color: 'var(--text)' }}>note</strong> (contexte ou justification). C'est cette preuve qui distingue un score défendable
          d'une déclaration invérifiable.
        </p>
      </Section>

      <Callout title="Quand l'évaluation est-elle publiable ?">
        Quand <strong style={{ color: 'var(--text)' }}>toutes les Voies applicables au profil</strong> sont remplies — le nombre à atteindre est
        celui des Voies applicables au profil choisi, jamais un chiffre fixe. La Maturité et l'Influence sont des lectures complémentaires :
        elles enrichissent le diagnostic mais ne bloquent pas la publication.
      </Callout>
    </div>
  );
}
