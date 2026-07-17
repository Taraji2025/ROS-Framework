import { Section, Term } from './guide-ui.jsx';

// Glossaire V4 — prose seule, aucun import du modèle (aucun fait à lire, que du vocabulaire).
// Conservés : reprise verbatim du glossaire v3 (git show b240e6b~1, bloc active === 'glossaire').
// Un terme de résilience opérationnelle a été retiré : il était adossé à un indicateur qui n'existe
// plus dans le référentiel V4.
// Ajoutés : 12 notions du vocabulaire V4 (Voie, Maturité, Influence, non-compensation, Mazziotta-Pareto,
// coefficient de gouvernance, complétude, applicabilité, SecNumCloud, monitorship, minorité de blocage,
// Data Act) + la convention du référentiel elle-même, cf. spec §5 (SI-2, SD-3, SD-4) et §2 décision 3.
export default function GuideGlossaire() {
  return (
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

        <Term word="Voie">
          Indicateur élémentaire du référentiel : c'est la seule famille qui produit le score. Chaque Voie porte son propre
          barème (catégoriel ou numérique) et, si elle est applicable au profil sectoriel de l'entreprise, entre dans
          l'agrégation de sa dimension puis du score global.
        </Term>
        <Term word="Maturité">
          Famille d'indicateurs de lecture, volontairement tenue hors score. Elle mesure la capacité de l'entreprise à
          voir ses propres dépendances — processus, gouvernance, veille — sans préjuger de la maîtrise réelle de son
          exposition, qui reste l'affaire des Voies.
        </Term>
        <Term word="Influence">
          Famille d'indicateurs de lecture, elle aussi hors score. Elle mesure la capacité de l'entreprise à peser sur
          son environnement — normes, opinion, réseaux d'alliés — plutôt qu'à le subir passivement.
        </Term>
        <Term word="Non-compensation">
          Principe d'agrégation qui refuse de moyenner une force et une faiblesse : une Voie très en retrait pèse sur le
          résultat même si d'autres Voies du même ensemble sont excellentes. C'est ce qui distingue le calcul du RoS
          d'une simple moyenne arithmétique.
        </Term>
        <Term word="Indice Mazziotta-Pareto">
          Famille de méthodes d'agrégation non compensatoire, qui pénalise l'hétérogénéité d'un groupe d'indicateurs par
          un terme de variance plutôt que de se contenter d'une moyenne. La règle « pénalisée » du RoS s'en inspire.
        </Term>
        <Term word="Coefficient de gouvernance">
          Multiplicateur appliqué au score global qui traduit la solidité de la gouvernance de la souveraineté au sein
          de l'entreprise (reporting dédié, droit de veto formalisé, droit de veto effectivement exercé). Il modère le
          score sans jamais l'annuler complètement.
        </Term>
        <Term word="Complétude">
          État d'une évaluation dans laquelle toutes les Voies applicables au profil de l'entreprise ont été renseignées.
          C'est une condition binaire, pas un score supplémentaire : elle ouvre — ou non — le droit de publier le
          résultat comme définitif.
        </Term>
        <Term word="Applicabilité">
          Propriété d'une Voie déterminée par le profil sectoriel de l'entreprise. Une Voie sans objet pour un secteur
          donné (par exemple des stocks physiques pour une entreprise de services) sort du calcul de complétude et du
          score de ce profil ; elle n'est pas notée à zéro, elle est simplement hors périmètre.
        </Term>
        <Term word="SecNumCloud">
          Qualification de sécurité délivrée par l'ANSSI aux offres d'hébergement cloud. Elle conditionne la
          reconnaissance d'un hébergement comme réellement souverain et porte des exigences opposables, notamment en
          matière de réversibilité.
        </Term>
        <Term word="Monitorship">
          Dispositif imposé dans certains règlements transactionnels avec la justice (accord de poursuite différée,
          convention judiciaire d'intérêt public) où un tiers agréé, extérieur à l'entreprise, valide ses décisions de
          mise en conformité pendant une période donnée. Une souveraineté décisionnelle largement confisquée, sans être
          nulle pour autant.
        </Term>
        <Term word="Minorité de blocage">
          Seuil de détention qui permet à un actionnaire, seul ou allié à d'autres, de s'opposer à une décision requérant
          une majorité qualifiée (modification des statuts, fusion...), sans pour autant détenir le contrôle de la
          société.
        </Term>
        <Term word="Data Act">
          Règlement européen encadrant, entre autres, les conditions de changement de fournisseur cloud et la
          portabilité des données. Il vise une sortie effective d'un prestataire plutôt qu'une réversibilité purement
          théorique.
        </Term>
        <Term word="Convention du référentiel">
          Arbitrage assumé par le référentiel RoS lorsqu'aucun texte opposable ne fixe de seuil ou de barème. Une
          convention se distingue d'une source normative et s'affiche comme telle plutôt que d'être déguisée en norme —
          un jury ne reproche pas une convention explicitée, il démolit une convention qui se fait passer pour un texte
          de loi.
        </Term>
      </Section>
    </div>
  );
}
