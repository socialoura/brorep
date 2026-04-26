import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Fanovaly",
  description: "Découvrez comment Fanovaly collecte, utilise et protège vos données personnelles.",
  alternates: { canonical: "https://fanovaly.com/confidentialite" },
};

export default function Confidentialite() {
  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#e8f7ed", fontFamily: "inherit" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "60px 20px" }}>
        <a href="/" style={{ fontSize: "13px", color: "rgb(0, 210, 106)", textDecoration: "none", marginBottom: "24px", display: "inline-block" }}>← Retour à l'accueil</a>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: "0 0 32px 0" }}>Politique de confidentialité</h1>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>1. Données collectées</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Nous collectons les données suivantes lors de votre utilisation du site :<br />
            • <strong style={{ color: "#fff" }}>Adresse e-mail</strong> — pour l'envoi de la confirmation de commande et des communications.<br />
            • <strong style={{ color: "#fff" }}>Nom d'utilisateur</strong> (TikTok/Instagram) — pour l'analyse de profil et la livraison du service.<br />
            • <strong style={{ color: "#fff" }}>Données de paiement</strong> — traitées directement par Stripe. Nous ne stockons jamais vos informations bancaires.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>2. Utilisation des données</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Vos données sont utilisées exclusivement pour :<br />
            • Traiter et livrer votre commande.<br />
            • Vous envoyer des e-mails de suivi et de confirmation.<br />
            • Améliorer nos services.<br />
            Nous ne vendons, ne louons et ne partageons jamais vos données personnelles avec des tiers à des fins commerciales.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>3. Sous-traitants</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Nous utilisons les services tiers suivants :<br />
            • <strong style={{ color: "#fff" }}>Stripe</strong> — traitement des paiements (conforme PCI DSS).<br />
            • <strong style={{ color: "#fff" }}>Vercel</strong> — hébergement du site.<br />
            • <strong style={{ color: "#fff" }}>Neon</strong> — base de données.<br />
            • <strong style={{ color: "#fff" }}>Resend</strong> — envoi d'e-mails transactionnels.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>4. Durée de conservation</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Vos données sont conservées pendant une durée maximale de 3 ans à compter de votre dernière commande, conformément aux obligations légales.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>5. Vos droits (RGPD)</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :<br />
            • <strong style={{ color: "#fff" }}>Droit d'accès</strong> — obtenir une copie de vos données.<br />
            • <strong style={{ color: "#fff" }}>Droit de rectification</strong> — corriger vos données.<br />
            • <strong style={{ color: "#fff" }}>Droit de suppression</strong> — demander l'effacement de vos données.<br />
            • <strong style={{ color: "#fff" }}>Droit à la portabilité</strong> — recevoir vos données dans un format structuré.<br /><br />
            Pour exercer vos droits, contactez-nous à <a href="mailto:support@fanovaly.com" style={{ color: "rgb(0, 210, 106)" }}>support@fanovaly.com</a>.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>6. Cookies</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Le site utilise des cookies techniques nécessaires au fonctionnement (session). Aucun cookie publicitaire ou de tracking tiers n'est utilisé sans votre consentement.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>7. Contact</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Pour toute question relative à la protection de vos données :<br />
            Email : <a href="mailto:support@fanovaly.com" style={{ color: "rgb(0, 210, 106)" }}>support@fanovaly.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
