import { useState } from 'react';

const SECTIONS = [
  { id: 'intro',       label: '🎯 Introduction' },
  { id: 'workflow',    label: '📋 Comment utiliser' },
  { id: 'dimensions',  label: '🧭 Les 5 dimensions' },
  { id: 'indicateurs', label: '📊 Remplir les indicateurs' },
  { id: 'scores',      label: '📈 Interpréter les scores' },
  { id: 'glossaire',   label: '📖 Glossaire' },
  { id: 'methodo',     label: '⚙ Méthodologie' },
];

function Section({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-title" style={{ marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function Term({ word, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontWeight: 600, color: 'var(--blue)', fontSize: 13, marginBottom: 3 }}>{word}</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
      <div style={{
        minWidth: 28, height: 28, borderRadius: '50%',
        background: 'var(--blue-dark)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Space Mono', fontSize: 12, fontWeight: 700
      }}>{n}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{children}</div>
      </div>
    </div>
  );
}

function DimCard({ code, label, color, desc, examples }) {
  return (
    <div style={{
      border: `1px solid ${color}33`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 8,
      padding: '12px 14px',
      marginBottom: 12,
      background: 'var(--bg3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontFamily: 'Space Mono', fontSize: 12, color, fontWeight: 700 }}>{code}</span>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, margin: '0 0 8px' }}>{desc}</p>
      <div style={{ fontSize: 12, color: 'var(--text3)' }}>
        <strong style={{ color: 'var(--text2)' }}>Exemples concrets :</strong> {examples}
      </div>
    </div>
  );
}

export default function Guide() {
  const [active, setActive] = useState('intro');

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Guide utilisateur</div>
          <div className="page-sub">Return on Sovereignty v3.0 — Manuel de référence</div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={active === s.id ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ fontSize: 12, padding: '6px 14px' }}
          >{s.label}</button>
        ))}
      </div>

      {/* ── INTRODUCTION ─────────────────────────────────────── */}
      {active === 'intro' && (
        <div>
          <Section title="Qu'est-ce que le Return on Sovereignty ?">
            <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text2)', marginBottom: 14 }}>
              Le <strong style={{ color: 'var(--text)' }}>Return on Sovereignty (RoS)</strong> est un cadre d'audit stratégique qui mesure le degré
              d'<strong style={{ color: 'var(--text)' }}>autonomie réelle</strong> d'une organisation face aux pressions externes : dépendances
              technologiques, extraterritorialité juridique, vulnérabilités opérationnelles et influence concurrentielle.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text2)', marginBottom: 14 }}>
              Contrairement aux audits classiques qui mesurent la performance financière, le RoS mesure la capacité
              de l'entreprise à <strong style={{ color: 'var(--text)' }}>décider librement, agir sans contrainte imposée</strong> et
              <strong style={{ color: 'var(--text)' }}> protéger ses actifs stratégiques</strong>.
            </p>
            <div style={{
              background: 'var(--bg3)', borderRadius: 8, padding: '14px 16px',
              borderLeft: '3px solid var(--gold)', marginTop: 8
            }}>
              <div style={{ fontWeight: 600, color: 'var(--gold)', marginBottom: 6, fontSize: 13 }}>Pourquoi c'est important ?</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
                Une entreprise peut être très rentable et pourtant <strong style={{ color: 'var(--text)' }}>totalement exposée</strong> :
                ses données hébergées chez un prestataire étranger, ses décisions contraintes par des contrats extraterritoriaux,
                sa chaîne logistique dépendante d'un seul fournisseur. Le RoS révèle ces vulnérabilités <strong style={{ color: 'var(--text)' }}>avant qu'elles deviennent des crises</strong>.
              </div>
            </div>
          </Section>

          <Section title="À qui s'adresse cet outil ?">
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2 }}>
              <div>• <strong style={{ color: 'var(--text)' }}>Dirigeants et CODIR</strong> — pour obtenir une vision stratégique consolidée de l'exposition souveraine</div>
              <div>• <strong style={{ color: 'var(--text)' }}>DSI / RSSI</strong> — pour évaluer la dimension informationnelle et les risques cyber/cloud</div>
              <div>• <strong style={{ color: 'var(--text)' }}>Directeurs juridiques</strong> — pour les dimensions normatives et les clauses extraterritoriales</div>
              <div>• <strong style={{ color: 'var(--text)' }}>Directeurs des achats / supply chain</strong> — pour la souveraineté opérationnelle</div>
              <div>• <strong style={{ color: 'var(--text)' }}>Responsables communication / affaires publiques</strong> — pour la capacité d'influence</div>
            </div>
          </Section>

          <Section title="Ce que le score RoS n'est PAS">
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2 }}>
              <div>✗ Ce n'est <strong style={{ color: 'var(--text)' }}>pas</strong> une certification ou un label — c'est un outil de diagnostic interne</div>
              <div>✗ Ce n'est <strong style={{ color: 'var(--text)' }}>pas</strong> une mesure de performance financière</div>
              <div>✗ Ce n'est <strong style={{ color: 'var(--text)' }}>pas</strong> figé — il évolue avec la stratégie et le contexte géopolitique</div>
              <div>✓ C'est un <strong style={{ color: 'var(--green)' }}>outil de pilotage</strong> qui s'améliore avec des évaluations régulières (recommandé : 1 à 2 fois par an)</div>
            </div>
          </Section>
        </div>
      )}

      {/* ── WORKFLOW ─────────────────────────────────────────── */}
      {active === 'workflow' && (
        <div>
          <Section title="Parcours recommandé pour une première évaluation">
            <Step n="1" title="Configurer le profil entreprise (Admin)">
              Avant toute évaluation, allez dans <strong>Admin → Profil entreprise</strong> pour renseigner le nom, le secteur d'activité et
              une description. Le secteur détermine les <strong>pondérations des dimensions</strong> — une banque n'a pas les mêmes priorités
              qu'un industriel.
            </Step>
            <Step n="2" title="Réunir les parties prenantes">
              Le formulaire couvre 5 domaines distincts. Il est conseillé d'impliquer :
              la DSI (SI), la direction générale (SD), le juridique (SN), la supply chain (SO), et la communication (CI).
              Chaque responsable remplit sa partie en s'appuyant sur des données réelles.
            </Step>
            <Step n="3" title="Ouvrir le formulaire Évaluation">
              Sélectionnez la <strong>période</strong> (trimestre) et le <strong>secteur</strong>, puis remplissez les 30 indicateurs.
              Utilisez le bouton <strong>ⓘ</strong> pour comprendre ce que mesure chaque indicateur avant de saisir une valeur.
            </Step>
            <Step n="4" title="Interpréter le score en direct">
              Le score RoS et les scores par dimension se calculent en temps réel à mesure que vous saisissez.
              Identifiez les dimensions les plus faibles — ce sont vos priorités d'action.
            </Step>
            <Step n="5" title="Sauvegarder et suivre l'évolution">
              Sauvegardez l'évaluation. Elle apparaîtra dans <strong>Historique</strong> avec un graphique d'évolution.
              En renouvelant l'exercice à intervalle régulier, vous mesurerez le progrès des actions engagées.
            </Step>
          </Section>

          <Section title="Conseils pratiques">
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2 }}>
              <div>• Si une donnée est inconnue, saisissez <strong style={{ color: 'var(--text)' }}>0</strong> — une valeur non renseignée pénalise le score comme une absence réelle</div>
              <div>• Commencez par les indicateurs que vous maîtrisez — le score s'affine progressivement</div>
              <div>• Documentez vos hypothèses de calcul dans un fichier externe pour assurer la continuité entre évaluations</div>
              <div>• Une évaluation honnête avec un score faible est plus utile qu'une évaluation flatteuse sans fondement</div>
            </div>
          </Section>
        </div>
      )}

      {/* ── DIMENSIONS ───────────────────────────────────────── */}
      {active === 'dimensions' && (
        <div>
          <Section title="Les 5 dimensions de la souveraineté">
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 16 }}>
              Chaque dimension mesure une facette de l'autonomie stratégique. Elles sont complémentaires : une entreprise
              peut être très souveraine informationnellement mais totalement exposée en capacité d'influence.
            </p>
            <DimCard
              code="SI" label="Souveraineté Informationnelle"
              color="var(--dim1)"
              desc="Mesure le contrôle que l'entreprise exerce sur ses données et ses flux d'information. Elle couvre l'hébergement des données critiques, la capacité à sortir d'un fournisseur cloud (réversibilité), le chiffrement, et la vitesse de détection des fuites."
              examples="Données clients hébergées en France vs. chez un hyperscaler américain soumis au Cloud Act. Capacité à changer de prestataire cloud en moins de 6 mois. Politique de classification des informations sensibles."
            />
            <DimCard
              code="SD" label="Souveraineté Décisionnelle"
              color="var(--dim2)"
              desc="Évalue la liberté réelle de l'entreprise dans ses prises de décision stratégiques. Sont notamment examinés : la présence de clauses contractuelles qui contraignent les choix, la dépendance à des partenaires uniques, l'indépendance du conseil d'administration."
              examples="Contrats avec des clauses de droit américain (FCPA, CLOUD Act). Administrateurs indépendants vs. représentants d'actionnaires étrangers. Existence de scénarios alternatifs documentés en cas de rupture fournisseur."
            />
            <DimCard
              code="SN" label="Souveraineté Normative"
              color="var(--dim3)"
              desc="Mesure la capacité de l'entreprise à peser sur les règles qui régissent son secteur (normes, réglementations, standards) plutôt que de les subir passivement. Inclut la veille réglementaire proactive et la gestion du risque de sanctions extraterritoriales."
              examples="Siège actif dans un comité de normalisation ISO ou ETSI. Anticipation de la réglementation IA de l'UE avant sa mise en vigueur. Absence de sanctions OFAC ou de mises en demeure réglementaires."
            />
            <DimCard
              code="SO" label="Souveraineté Opérationnelle"
              color="var(--dim4)"
              desc="Analyse la résilience des opérations face aux ruptures : diversification des fournisseurs, capacité de fonctionnement en mode dégradé, autonomie énergétique, et localisation des actifs critiques."
              examples="Plan de continuité d'activité testé et à jour. Stocks stratégiques couvrant 72h d'autonomie. Fournisseurs critiques avec alternatives qualifiées identifiées. Serveurs localisés en zones non-extraterritoriales."
            />
            <DimCard
              code="CI" label="Capacité d'Influence"
              color="var(--dim5)"
              desc="Dimension offensive : mesure la capacité de l'entreprise à façonner son environnement, à influencer les décisions qui la concernent, et à se défendre contre les attaques informationnelles. C'est la différence entre subir le narratif et le construire."
              examples="Présence dans les think tanks et fédérations professionnelles. Capacité de réponse rapide à une campagne de désinformation. Réseau d'alliés stratégiques mobilisables en cas de crise. Budget de communication d'influence."
            />
          </Section>
        </div>
      )}

      {/* ── INDICATEURS ──────────────────────────────────────── */}
      {active === 'indicateurs' && (
        <div>
          <Section title="Types d'indicateurs">
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '12px 14px', borderLeft: '3px solid var(--green)' }}>
                <div style={{ fontWeight: 600, color: 'var(--green)', fontSize: 13, marginBottom: 6 }}>Indicateurs directs — plus c'est haut, mieux c'est</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                  Exemple : <em>Taux de contrôle des données critiques</em> (SI-1) — saisissez le pourcentage réel (ex: 65 pour 65%).
                  La cible est indiquée dans la bulle ⓘ. Un score de 80% ou plus sur un indicateur cible à 80% donne un score normalisé de 100.
                </div>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '12px 14px', borderLeft: '3px solid var(--orange)' }}>
                <div style={{ fontWeight: 600, color: 'var(--orange)', fontSize: 13, marginBottom: 6 }}>Indicateurs inverses — plus c'est bas, mieux c'est</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                  Exemple : <em>Délai de détection des fuites</em> (SI-4) — saisissez le nombre d'heures réel (ex: 48).
                  Plus le chiffre est bas, meilleur est le score. <strong style={{ color: 'var(--text)' }}>Ces indicateurs sont signalés "(inverse)" dans leur description ⓘ.</strong>
                  Si la valeur est inconnue, saisissez une estimation prudente plutôt que 0 (0 heure serait un score parfait irréaliste).
                </div>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '12px 14px', borderLeft: '3px solid var(--purple)' }}>
                <div style={{ fontWeight: 600, color: 'var(--purple)', fontSize: 13, marginBottom: 6 }}>Indicateurs qualitatifs — échelle 1 à 5</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                  Exemple : <em>Maturité politique de classification de l'information</em> (SI-Q1) — il n'y a pas de chiffre objectif
                  à mesurer, mais une appréciation de maturité. La bulle ⓘ affiche la grille de lecture complète.
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  {['1 — Inexistant','2 — Initial','3 — Partiel','4 — Avancé','5 — Mature'].map(l => (
                    <span key={l} style={{ fontSize: 11, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 8px', color: 'var(--text2)' }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section title="Règles de saisie importantes">
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2 }}>
              <div>• Les valeurs en <strong style={{ color: 'var(--text)' }}>pourcentage</strong> se saisissent de 0 à 100 (sans le symbole %)</div>
              <div>• Les valeurs en <strong style={{ color: 'var(--text)' }}>heures</strong> (MTTR, délai détection) se saisissent telles quelles</div>
              <div>• Les valeurs <strong style={{ color: 'var(--text)' }}>qualitatives</strong> se saisissent de 1 à 5 uniquement</div>
              <div>• Une valeur <strong style={{ color: 'var(--text)' }}>0</strong> sur un indicateur inverse donne un score de 100 (performance parfaite) — n'utilisez 0 que si c'est réellement le cas</div>
              <div>• Un champ non renseigné vaut <strong style={{ color: 'var(--text)' }}>0</strong> par défaut — il pénalise le score</div>
            </div>
          </Section>

          <Section title="Comment obtenir les données ?">
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2 }}>
              <div>• <strong style={{ color: 'var(--dim1)' }}>SI :</strong> rapports DSI, contrats cloud, politique de sécurité de l'information, rapports d'incidents</div>
              <div>• <strong style={{ color: 'var(--dim2)' }}>SD :</strong> revue des contrats fournisseurs stratégiques, PV de conseil d'administration, cartographie des dépendances</div>
              <div>• <strong style={{ color: 'var(--dim3)' }}>SN :</strong> veille réglementaire, adhésions aux associations sectorielles, historique de conformité</div>
              <div>• <strong style={{ color: 'var(--dim4)' }}>SO :</strong> rapport supply chain, tests PCA, plan de continuité, contrats d'énergie et d'hébergement</div>
              <div>• <strong style={{ color: 'var(--dim5)' }}>CI :</strong> revue de presse, budget communication, cartographie des parties prenantes, analyse des réseaux d'influence</div>
            </div>
          </Section>
        </div>
      )}

      {/* ── SCORES ───────────────────────────────────────────── */}
      {active === 'scores' && (
        <div>
          <Section title="Échelle d'interprétation du score RoS">
            <table className="guide-table">
              <thead><tr><th>Score</th><th>Niveau</th><th>Signification opérationnelle</th></tr></thead>
              <tbody>
                <tr>
                  <td><span className="badge badge-red">&lt; 30</span></td>
                  <td><strong>Critique</strong></td>
                  <td>L'organisation subit totalement son environnement. Refonte structurelle impérative. Risque de captation ou de déstabilisation à court terme.</td>
                </tr>
                <tr>
                  <td><span className="badge badge-orange">30 – 49</span></td>
                  <td><strong>Faible</strong></td>
                  <td>Dépendances majeures non maîtrisées. Des vecteurs d'attaque exploitables existent. Actions correctives urgentes sur les dimensions les plus faibles.</td>
                </tr>
                <tr>
                  <td><span className="badge badge-yellow">50 – 64</span></td>
                  <td><strong>Moyen</strong></td>
                  <td>Capacité partielle — des efforts sont engagés mais insuffisants. Bonne base pour progresser avec un plan structuré sur 12 mois.</td>
                </tr>
                <tr>
                  <td><span className="badge badge-green">65 – 79</span></td>
                  <td><strong>Élevé</strong></td>
                  <td>Autonomie forte, position de force relative dans le secteur. L'organisation maîtrise l'essentiel. Objectif : consolider et passer en mode offensif.</td>
                </tr>
                <tr>
                  <td><span className="badge badge-teal">≥ 80</span></td>
                  <td><strong>Souverain</strong></td>
                  <td>L'organisation dicte les règles de son marché. Elle influence ses concurrents, les normes, les narratifs. Score difficile à atteindre et à maintenir.</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="Comment lire les scores par dimension ?">
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 12 }}>
              Le score global RoS est une moyenne pondérée des 5 dimensions. Un score global de 60 peut masquer
              une dimension à 20 (vulnérabilité critique) compensée par d'autres à 80.
            </p>
            <div style={{
              background: 'var(--bg3)', borderRadius: 8, padding: '12px 14px',
              borderLeft: '3px solid var(--orange)', marginBottom: 12
            }}>
              <div style={{ fontWeight: 600, color: 'var(--orange)', fontSize: 13, marginBottom: 4 }}>Attention aux compensations</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                Une entreprise avec SI=80, SD=85, SN=75, SO=80, CI=5 obtient un RoS de ~65 (Élevé).
                Pourtant, sa Capacité d'Influence quasi-nulle la rend totalement exposée aux attaques informationnelles.
                <strong style={{ color: 'var(--text)' }}> Analysez toujours le profil radar, pas seulement le score global.</strong>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2 }}>
              <div>• Prioritisez les actions sur les dimensions <strong style={{ color: 'var(--red)' }}>en dessous de 50</strong></div>
              <div>• Les dimensions entre 50 et 65 nécessitent un <strong style={{ color: 'var(--orange)' }}>plan de consolidation</strong></div>
              <div>• Les dimensions au-dessus de 65 peuvent être transformées en <strong style={{ color: 'var(--green)' }}>leviers offensifs</strong></div>
            </div>
          </Section>

          <Section title="Fréquence d'évaluation recommandée">
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2 }}>
              <div>• <strong style={{ color: 'var(--text)' }}>Annuelle (minimum)</strong> — bilan stratégique de fin d'année</div>
              <div>• <strong style={{ color: 'var(--text)' }}>Semestrielle (recommandée)</strong> — permet de mesurer l'impact des actions engagées</div>
              <div>• <strong style={{ color: 'var(--text)' }}>Post-événement</strong> — après une crise, une acquisition, un changement réglementaire majeur</div>
            </div>
          </Section>
        </div>
      )}

      {/* ── GLOSSAIRE ────────────────────────────────────────── */}
      {active === 'glossaire' && (
        <div>
          <Section title="Glossaire des notions clés">
            <Term word="Cloud Act (USA, 2018)">
              Loi américaine autorisant les autorités américaines à accéder aux données stockées par des entreprises
              américaines, y compris sur des serveurs situés en dehors des États-Unis. Une entreprise qui stocke ses données
              chez AWS, Azure ou Google Cloud est potentiellement soumise à cette loi, même si les serveurs sont en Europe.
            </Term>
            <Term word="Extraterritorialité">
              Capacité d'un État à étendre l'application de sa législation au-delà de ses frontières nationales. Le droit américain
              (FCPA, sanctions OFAC, Cloud Act) et le droit européen (RGPD) ont des effets extraterritoriaux. Une clause
              contractuelle soumettant un litige au droit de l'État de New York, par exemple, est une clause extraterritoriale.
            </Term>
            <Term word="MTTR — Mean Time To Recovery">
              Temps moyen nécessaire pour rétablir le fonctionnement normal d'un système ou d'une fonction critique après une
              panne ou incident. Indicateur clé de résilience opérationnelle. Se mesure en heures. Un MTTR inférieur à 4h est
              considéré comme le seuil de résilience minimale pour une fonction critique.
            </Term>
            <Term word="PCA — Plan de Continuité d'Activité">
              Document stratégique définissant les procédures et ressources nécessaires pour maintenir ou reprendre rapidement
              les activités essentielles en cas de crise (cyberattaque, catastrophe naturelle, défaillance fournisseur). Un PCA
              qui n'est pas testé régulièrement n'est pas fiable.
            </Term>
            <Term word="Réversibilité cloud (Vendor Lock-in)">
              Capacité à sortir d'un fournisseur cloud (AWS, Azure, GCP, etc.) sans perte majeure de données ou interruption
              prolongée. Le vendor lock-in survient quand les architectures techniques sont trop dépendantes des services
              propriétaires d'un fournisseur. Un plan de réversibilité documenté inclut les procédures de migration et les délais estimés.
            </Term>
            <Term word="Guerre cognitive">
              Ensemble des opérations visant à influencer les perceptions, les croyances et les décisions d'un acteur cible.
              Dans un contexte d'entreprise : campagnes de désinformation sur les réseaux sociaux, manipulation de narratifs
              sectoriels, attaques réputationnelles. La capacité de contre-influence mesure le délai de détection et de réponse.
            </Term>
            <Term word="Soft power">
              Capacité d'influencer par l'attractivité, le prestige et la cooptation plutôt que par la contrainte ou la coercition.
              Pour une entreprise : capacité à attirer des talents, à être une référence sectorielle, à peser sur les agendas
              réglementaires ou médiatiques sans recourir à des pressions directes.
            </Term>
            <Term word="Intelligence Économique (IE)">
              Démarche structurée de collecte, analyse et exploitation de l'information stratégique dans un objectif de compétitivité.
              Comprend la veille (passive), l'influence (active) et la protection du patrimoine informationnel. L'IE interne mesure
              la capacité de l'organisation à anticiper les menaces et opportunités de son environnement.
            </Term>
            <Term word="Lobbying réglementaire">
              Activité légitime consistant à faire valoir les intérêts d'une organisation auprès des législateurs et régulateurs
              lors de l'élaboration de normes ou réglementations. Les organisations qui pratiquent le lobbying proactif
              influencent les règles avant leur adoption, plutôt que de les subir après.
            </Term>
            <Term word="FCPA — Foreign Corrupt Practices Act">
              Loi américaine de 1977 interdisant la corruption d'agents publics étrangers. S'applique à toute entité ayant
              un lien avec les États-Unis (cotation en bourse, filiale, partenaire américain). Des entreprises françaises ont
              été condamnées à des amendes record (Alstom, Total) en application de cette loi extraterritoriale.
            </Term>
            <Term word="Souveraineté numérique">
              Capacité d'un acteur (État ou entreprise) à maîtriser ses données, ses infrastructures numériques et les algorithmes
              qui traitent son information, sans dépendance critique à des acteurs étrangers. Elle couvre l'hébergement, le chiffrement,
              la gouvernance des accès et la propriété intellectuelle des outils utilisés.
            </Term>
          </Section>
        </div>
      )}

      {/* ── MÉTHODOLOGIE ─────────────────────────────────────── */}
      {active === 'methodo' && (
        <div className="grid2" style={{ gap: 16 }}>
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">Échelle d'interprétation</div>
              <table className="guide-table">
                <thead><tr><th>Score RoS</th><th>Niveau</th><th>Signification</th></tr></thead>
                <tbody>
                  <tr><td><span className="badge badge-red">&lt; 30</span></td><td>Critique</td><td>Souveraineté quasi-nulle</td></tr>
                  <tr><td><span className="badge badge-orange">30–49</span></td><td>Faible</td><td>Dépendances majeures</td></tr>
                  <tr><td><span className="badge badge-yellow">50–64</span></td><td>Moyen</td><td>Capacité partielle</td></tr>
                  <tr><td><span className="badge badge-green">65–79</span></td><td>Élevé</td><td>Autonomie forte</td></tr>
                  <tr><td><span className="badge badge-teal">≥ 80</span></td><td>Souverain</td><td>L'entreprise dicte les règles</td></tr>
                </tbody>
              </table>
            </div>
            <div className="card">
              <div className="card-title">Pondérations sectorielles</div>
              <table className="guide-table">
                <thead><tr><th>Secteur</th><th>SI</th><th>SD</th><th>SN</th><th>SO</th><th style={{ color: 'var(--pink)' }}>CI</th></tr></thead>
                <tbody>
                  <tr><td>Standard</td><td>25%</td><td>20%</td><td>15%</td><td>20%</td><td>20%</td></tr>
                  <tr><td>Banque</td><td>30%</td><td>20%</td><td>15%</td><td>15%</td><td>20%</td></tr>
                  <tr><td>Industrie</td><td>20%</td><td>20%</td><td>15%</td><td>25%</td><td>20%</td></tr>
                  <tr><td>Tech</td><td>25%</td><td>15%</td><td>20%</td><td>15%</td><td>25%</td></tr>
                  <tr><td>Énergie</td><td>20%</td><td>25%</td><td>10%</td><td>25%</td><td>20%</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title">Formule RoS v3.0</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 13, lineHeight: 2, color: 'var(--text2)' }}>
                <div style={{ color: 'var(--text)', fontSize: 15, marginBottom: 12 }}><strong>RoS = Σ (Poids<sub>i</sub> × Score<sub>i</sub>)</strong></div>
                <div><span style={{ color: 'var(--dim1)' }}>SI</span> = Souveraineté Informationnelle</div>
                <div><span style={{ color: 'var(--dim2)' }}>SD</span> = Souveraineté Décisionnelle</div>
                <div><span style={{ color: 'var(--dim3)' }}>SN</span> = Souveraineté Normative</div>
                <div><span style={{ color: 'var(--dim4)' }}>SO</span> = Souveraineté Opérationnelle</div>
                <div><span style={{ color: 'var(--dim5)' }}>CI</span> = Capacité d'Influence</div>
                <br />
                <div style={{ fontSize: 12 }}>Indicateurs inverses : SI-3, SI-4, SD-4, SN-2, SN-5, SO-3, CI-3</div>
                <div style={{ fontSize: 12 }}>Indicateurs qualitatifs (1-5) : SI-Q1, SD-Q1, SN-Q1, SO-Q1, CI-Q1</div>
              </div>
            </div>
            <div className="card">
              <div className="card-title">Normalisation des indicateurs</div>
              <div style={{ fontSize: 13, lineHeight: 1.9, color: 'var(--text2)' }}>
                <div>• <strong style={{ color: 'var(--green)' }}>Direct</strong> : score = (valeur / cible) × 100, plafonné à 100</div>
                <div>• <strong style={{ color: 'var(--orange)' }}>Inverse</strong> : score = (cible / valeur) × 100 — pénalise les grandes valeurs</div>
                <div>• <strong style={{ color: 'var(--purple)' }}>Qualitatif</strong> : score = (valeur − 1) / 4 × 100</div>
                <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text3)' }}>
                  Développé par Naouphel Ouakaoui<br />
                  Mémoire CRO 3.0 — École de Guerre Économique<br />
                  2025-2026 · MaCyb09
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
