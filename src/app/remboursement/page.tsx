import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de remboursement — Fanovaly",
  description: "Politique de remboursement de Fanovaly. Satisfaction garantie, découvrez nos conditions de remboursement.",
  alternates: { canonical: "https://fanovaly.com/remboursement" },
};

export default function Remboursement() {
  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#e8f7ed", fontFamily: "inherit" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "60px 20px" }}>
        <a href="/" style={{ fontSize: "13px", color: "rgb(0, 210, 106)", textDecoration: "none", marginBottom: "24px", display: "inline-block" }}>← Retour à l'accueil</a>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: "0 0 32px 0" }}>Politique de remboursement</h1>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>Satisfaction garantie</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Chez Fanovaly, votre satisfaction est notre priorité. Nous nous engageons à livrer la totalité de votre commande dans les délais annoncés.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>Quand un remboursement est-il possible ?</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Un remboursement total ou partiel peut être accordé dans les cas suivants :<br /><br />
            • <strong style={{ color: "#fff" }}>Non-livraison</strong> — Si votre commande n'a pas été livrée dans un délai de 72 heures après le paiement.<br />
            • <strong style={{ color: "#fff" }}>Livraison partielle</strong> — Si la quantité livrée est significativement inférieure à la quantité commandée (moins de 80%).<br />
            • <strong style={{ color: "#fff" }}>Erreur de notre part</strong> — Si le service a été appliqué au mauvais compte.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>Cas non éligibles</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Le remboursement ne s'applique pas dans les cas suivants :<br /><br />
            • Le service a été intégralement livré.<br />
            • La baisse d&apos;abonnés/likes/vues est due à une action de la plateforme (purge).<br />
            • Le profil client est privé ou a été supprimé après la commande.<br />
            • Le nom d'utilisateur fourni est incorrect.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>Comment demander un remboursement ?</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Envoyez un e-mail à <a href="mailto:support@fanovaly.com" style={{ color: "rgb(0, 210, 106)" }}>support@fanovaly.com</a> avec :<br /><br />
            • Votre adresse e-mail de commande<br />
            • Votre nom d'utilisateur (TikTok ou Instagram)<br />
            • Une description du problème<br /><br />
            Nous répondons sous <strong style={{ color: "#fff" }}>24 heures</strong> maximum.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>Délai de remboursement</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Si votre demande est acceptée, le remboursement est effectué sous <strong style={{ color: "#fff" }}>5 à 10 jours ouvrés</strong> sur le moyen de paiement utilisé lors de la commande.
          </p>
        </section>
      </div>
    </div>
  );
}
