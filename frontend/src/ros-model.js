// RoS v4 — Source unique de vérité (données seules, aucune logique)

export const DIMENSIONS = ['SI', 'SD', 'SN', 'SO'];
export const RULES = ['linear', 'geometric', 'penalized'];
export const K_VALUES = [1, 2, 3];

// Famille VOIES — 11 indicateurs, produisent le score.
// kind 'cat' : cellule.band ∈ bands[].key. kind 'num' : cellule.value + steps.
//   dir 'lower'  → 1er step (thresholds ascendants) où value < threshold.
//   dir 'higher' → 1er step (thresholds descendants) où value >= threshold.
export const VOIES = [
  { id: 'si1', code: 'SI-1', dim: 'SI', label: 'Contrôle des données critiques', kind: 'cat',
    justification: 'Le palier « souverain qualifié » exige une qualification SecNumCloud : seule garantie contre l\'extraterritorialité (CLOUD Act). L\'hébergement UE sans qualification (60) reste exposé via maisons-mères US.',
    source: 'ANSSI SecNumCloud v3.2 ; CLOUD Act (2018)',
    bands: [
      { key: 'souverain', score: 100, label: 'Souverain qualifié' },
      { key: 'ue', score: 60, label: 'Hébergeur UE hors qualification' },
      { key: 'us-eu', score: 30, label: 'US « région Europe »' },
      { key: 'us', score: 0, label: 'Full US' },
    ] },
  { id: 'si2', code: 'SI-2', dim: 'SI', label: 'Réversibilité cloud', kind: 'cat',
    justification: "La réversibilité n'existe que si elle est écrite : un multi-cloud de fait, sans clause de sortie opposable, laisse le commanditaire dépendant du bon vouloir du prestataire. Le palier 100 exige donc les deux — la capacité technique (multi-cloud) et le droit (clause). Le mono-cloud vaut 0 : le verrouillage y est structurel, aucune clause ne le compense.",
    source: "ANSSI SecNumCloud v3.2, exigences 19.1.h (clause de réversibilité — récupération de l'ensemble des données) et 19.1.i (modalités techniques) ; Règlement (UE) 2023/2854 « Data Act », chap. VI, art. 25-27 (changement de fournisseur), applicable depuis le 12/09/2025.",
    bands: [
      { key: 'contractuelle', score: 100, label: 'Réversibilité contractuelle + multi-cloud' },
      { key: 'multi', score: 50, label: 'Multi-cloud sans clause' },
      { key: 'mono', score: 0, label: 'Mono-cloud' },
    ] },
  { id: 'si3', code: 'SI-3', dim: 'SI', label: 'Dépendance tech étrangère', kind: 'num', dir: 'lower',
    justification: 'Une dépendance sous 20 % envers les technologies étrangères garantit l\'autonomie décisionnelle ; au-delà de 40 %, la marge de manœuvre rétrécit ; dépasser 70 % crée une vulnérabilité critique face aux embargos ou restrictions d\'accès.',
    convention: "Aucun texte ne fixe de seuil de dépendance technologique étrangère. Les paliers 20/40/70 sont un arbitrage du référentiel, calé sur la capacité de substitution : sous 20 %, le remplacement d'un fournisseur reste absorbable ; entre 40 et 70 %, il engage une reconfiguration lourde ; au-delà de 70 %, la substitution devient structurellement impossible à court terme.",
    steps: [ { threshold: 20, score: 100 }, { threshold: 40, score: 60 }, { threshold: 70, score: 30 }, { threshold: Infinity, score: 0 } ] },

  { id: 'sd3', code: 'SD-3', dim: 'SD', label: 'Exposition capitalistique du conseil', kind: 'num', dir: 'lower',
    justification: "Les paliers se calent sur les seuils de contrôle du droit des sociétés : à 50 %, le contrôle est acquis — le conseil n'arbitre plus, il entérine. Les paliers 10 et 25 sont placés en deçà du seuil légal de blocage (33,34 %) pour capter l'approche du pouvoir avant qu'il ne soit constitué : à 25 %, un actionnaire n'a plus besoin de beaucoup d'alliés pour bloquer une modification statutaire.",
    source: "Code de commerce, art. L.225-96 (AGE à la majorité des deux tiers ⇒ minorité de blocage au-delà d'un tiers) ; art. L.233-3 (contrôle par la majorité des droits de vote).",
    convention: "Le placement des paliers 10 et 25 est un arbitrage du référentiel ; seuls 33,34 % et 50 % sont des seuils de droit.",
    steps: [ { threshold: 10, score: 100 }, { threshold: 25, score: 70 }, { threshold: 50, score: 30 }, { threshold: Infinity, score: 0 } ] },
  { id: 'sd4', code: 'SD-4', dim: 'SD', label: 'Exposition aux clauses extraterritoriales', kind: 'cat',
    justification: "Les paliers mesurent la matérialisation du risque, pas son existence théorique. Une exposition citée comme risque (50) signale que l'entreprise la reconnaît sans la subir encore. Une procédure en cours ou un monitorship (10, et non 0) traduit une souveraineté décisionnelle largement confisquée — un tiers agréé valide les décisions de conformité — sans être nulle : les autres leviers subsistent.",
    source: "Cas de référence : Alstom (DPA et monitorship, 2014), Airbus (CJIP, 2020) ; FCPA (1977) ; loi n° 68-678 dite « de blocage ».",
    convention: "Le critère « CA en dollars < 10 % » est une convention de matérialité, pas un seuil juridique : en droit américain, une seule transaction compensée en dollars peut suffire à fonder la compétence (cf. BNP Paribas, 2014). Le seuil distingue une exposition résiduelle d'une exposition structurelle.",
    bands: [
      { key: 'aucune', score: 100, label: 'Aucune exposition + CA dollar < 10 %' },
      { key: 'citee', score: 50, label: 'Exposition citée comme risque' },
      { key: 'procedure', score: 10, label: 'Procédure en cours / monitorship' },
    ] },

  { id: 'sn2', code: 'SN-2', dim: 'SN', label: 'Normes subies vs influencées', kind: 'cat',
    justification: "La gradation distingue la présence directe de la présence médiée. Siéger au comité où le texte s'écrit permet d'agir sur la rédaction ; passer par une fédération, c'est faire porter un intérêt collectif — négocié, moyenné — qui n'est plus exactement le sien : d'où le palier intermédiaire à 50. L'absence vaut 0 : la norme est alors intégralement subie.",
    convention: "Aucun texte ne gradue la participation normative. La hiérarchie s'appuie sur la doctrine française d'intelligence économique (rapport Martre, 1994 ; rapport Carayon, 2003) : « qui fait la norme fait le marché ».",
    bands: [
      { key: 'comites', score: 100, label: 'Présente aux comités des normes clés' },
      { key: 'federation', score: 50, label: 'Présente via fédération seulement' },
      { key: 'absente', score: 0, label: 'Absente partout' },
    ] },
  // Sentinelle 0.0001 : proxy pour « 0 % du CA → 100 » (un % de sanctions non nul, même infime, sort du palier 100).
  { id: 'sn5', code: 'SN-5', dim: 'SN', label: 'Sanctions de juridictions tierces (% CA, 5 ans)', kind: 'num', dir: 'lower',
    justification: 'L\'absence de sanctions en 5 ans confirme la capacité à naviguer les régimes internationaux ; un impact au-delà de 0,5 % du CA signale une exposition régulière à des mesures restrictives ; au-delà de 5 %, l\'entreprise subit une pression stratégique chronique qui entrave sa liberté d\'action.',
    convention: "Aucun texte ne fixe de seuil de matérialité pour les sanctions. Les paliers 0,5 % et 5 % du CA sont un arbitrage du référentiel : en deçà de 0,5 %, la sanction relève de l'incident absorbable ; au-delà de 5 %, elle pèse sur la trajectoire stratégique de l'entreprise. La sentinelle à 0 traduit qu'une sanction non nulle, même infime, fait sortir du palier d'excellence.",
    steps: [ { threshold: 0.0001, score: 100 }, { threshold: 0.5, score: 70 }, { threshold: 5, score: 30 }, { threshold: Infinity, score: 0 } ] },

  { id: 'so1', code: 'SO-1', dim: 'SO', label: 'Diversification fournisseurs critiques', kind: 'cat',
    justification: "Le seuil de 30 % marque le point où la perte d'un fournisseur cesse d'être absorbable par les autres : au-delà, il n'existe plus de capacité de report à court terme. Le palier 50 sanctionne l'entreprise qui identifie sa dépendance sans l'avoir traitée ; le mono-source vaut 0 — la continuité dépend entièrement d'un tiers.",
    convention: "Aucune norme ne fixe de seuil de concentration fournisseur hors secteur financier. Le 30 % est calé sur la capacité de report.",
    bands: [
      { key: 'diversifie', score: 100, label: 'Aucune dépendance > 30 %' },
      { key: 'concentre', score: 50, label: 'Une dépendance forte citée' },
      { key: 'monosource', score: 0, label: 'Mono-source sur un intrant critique' },
    ] },
  { id: 'so2', code: 'SO-2', dim: 'SO', label: 'Stocks stratégiques (jours de couverture)', kind: 'num', dir: 'higher',
    justification: "Les paliers traduisent des horizons de crise : 15 jours couvrent une rupture logistique ponctuelle, 30 jours une crise fournisseur avec réapprovisionnement alternatif, 60 jours une crise géopolitique le temps de reconfigurer une chaîne. La cible haute est placée à 60 et non 90 : au-delà, le coût d'immobilisation rend l'exigence irréaliste pour une entreprise.",
    convention: "Les 90 jours de la directive 2009/119/CE s'imposent aux États pour les stocks pétroliers, pas aux entreprises. Aucune obligation générale de stock stratégique ne pèse sur l'entreprise.",
    steps: [ { threshold: 60, score: 100 }, { threshold: 30, score: 60 }, { threshold: 15, score: 30 }, { threshold: 0, score: 0 } ] },
  { id: 'so4', code: 'SO-4', dim: 'SO', label: 'Autonomie énergétique / ressources', kind: 'cat',
    justification: "Le seuil de 72 h sépare l'autonomie qui permet d'attendre un rétablissement de celle qui ne fait que retarder l'arrêt. L'exigence porte surtout sur le caractère documenté : un dispositif cité sans durée mesurée (50) n'est pas une autonomie, c'est une intention.",
    convention: "Le 72 h est un usage de la doctrine de continuité d'activité, non une norme opposable.",
    bands: [
      { key: 'documentee', score: 100, label: '> 72 h documenté' },
      { key: 'dispositif', score: 50, label: 'Dispositif cité sans durée' },
      { key: 'rien', score: 0, label: 'Rien' },
    ] },
  { id: 'so5', code: 'SO-5', dim: 'SO', label: 'Dispersion en zone souveraine', kind: 'cat',
    justification: "Trois sites est le minimum qui survit à la perte d'un site sans revenir à un point unique de défaillance (à deux sites, une perte laisse un site seul). La zone compte autant que le nombre : trois sites dont certains hors zone souveraine (60) dispersent le risque physique mais pas le risque juridique. Un site unique, même souverain, vaut 20 et non 0 — la souveraineté juridique y est acquise, seule la résilience manque.",
    convention: "Aucune norme ne fixe de nombre de sites. Le 3 dérive de la règle « survivre à une perte sans point unique restant ».",
    bands: [
      { key: 'disperse-souverain', score: 100, label: '≥ 3 sites indépendants, tous souverains' },
      { key: 'disperse-mixte', score: 60, label: '≥ 3 sites dont certains hors zone' },
      { key: 'concentre', score: 20, label: '1 seul site, même souverain' },
    ] },
];

// Paliers d'interprétation (repris de v3). Entrées gelées : rosLevel() en retourne une
// par référence — Object.freeze empêche qu'un consommateur (UI) corrompe la table partagée.
export const LEVELS = [
  { max: 30,  label: '⚠ Critique',  color: 'var(--red)',        cls: 'badge-red',
    verdict: 'Souveraineté critique : dépendances majeures non maîtrisées, exposition directe à des leviers externes.' },
  { max: 50,  label: '↓ Faible',    color: 'var(--orange)',     cls: 'badge-orange',
    verdict: 'Souveraineté faible : plusieurs angles morts structurels, marge de manœuvre réduite face aux pressions extérieures.' },
  { max: 65,  label: '~ Moyen',     color: 'var(--gold-light)', cls: 'badge-yellow',
    verdict: 'Souveraineté moyenne : socle partiel, des dépendances subsistent sur des fonctions sensibles.' },
  { max: 80,  label: '↑ Élevé',     color: 'var(--green)',      cls: 'badge-green',
    verdict: 'Souveraineté élevée : maîtrise solide, quelques leviers restent à sécuriser.' },
  { max: Infinity, label: '★ Souverain', color: 'var(--teal)',  cls: 'badge-teal',
    verdict: "Souveraineté maîtrisée : l'entreprise contrôle ses dépendances critiques et pèse sur son environnement." },
].map(Object.freeze);

const ALL_VOIE_IDS = VOIES.map(v => v.id);

// Profils : applicabilité seule, poids égaux (D-D).
// Tech : SO-2 (stocks physiques) et SO-4 (autonomie énergétique) sans objet.
// Banque : SO-2 sans objet uniquement ; SO-4 applicable (décision de session 16/07 — 10 voies).
export const PROFILES = {
  standard:  { label: 'Standard',  applicable: ALL_VOIE_IDS },
  banque:    { label: 'Banque',    applicable: ALL_VOIE_IDS.filter(id => !['so2'].includes(id)) },
  industrie: { label: 'Industrie', applicable: ALL_VOIE_IDS },
  tech:      { label: 'Tech',      applicable: ALL_VOIE_IDS.filter(id => !['so2', 'so4'].includes(id)) },
  energie:   { label: 'Énergie',   applicable: ALL_VOIE_IDS },
};

// Famille MATURITÉ — 8 indicateurs, lecture « capacité à voir ». Hors score.
export const MATURITE = [
  { id: 'sd2', code: 'SD-2', label: 'Diversification des options stratégiques', kind: 'num', target: 100 },
  { id: 'sd5', code: 'SD-5', label: 'Couverture cartographie des dépendances', kind: 'num', target: 80 },
  { id: 'sn4', code: 'SN-4', label: 'Conformité proactive vs réactive', kind: 'num', target: 70 },
  { id: 'siq1', code: 'SI-Q1', label: 'Maturité classification info', kind: 'qual' },
  { id: 'sdq1', code: 'SD-Q1', label: 'Maturité IE interne', kind: 'qual' },
  { id: 'snq1', code: 'SN-Q1', label: 'Maturité veille réglementaire', kind: 'qual' },
  { id: 'soq1', code: 'SO-Q1', label: 'Maturité PCA (condition de licéité)', kind: 'qual' },
  { id: 'ciq1', code: 'CI-Q1', label: 'Maturité guerre cognitive', kind: 'qual' },
];

// Famille INFLUENCE — 5 indicateurs (doublons SN/CI fusionnés). Lecture « capacité à peser ». Hors score.
export const INFLUENCE = [
  { id: 'inf_sieges', code: 'INF-1', label: 'Sièges en instances (ex SN-1/CI-1)', kind: 'num', target: 50 },
  { id: 'inf_lobbying', code: 'INF-2', label: 'Budget lobbying (ex SN-3/CI-5)', kind: 'num', target: 60 },
  { id: 'ci2', code: 'CI-2', label: 'Part de voix + tonalité', kind: 'num', target: 75 },
  { id: 'ci3', code: 'CI-3', label: 'Capacité de contre-influence', kind: 'num', target: 60 },
  { id: 'ci4', code: 'CI-4', label: 'Réseau d\'alliés activables', kind: 'num', target: 60 },
];
