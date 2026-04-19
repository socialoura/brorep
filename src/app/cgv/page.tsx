import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — Fanovaly",
};

export default function CGV() {
  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#e8f7ed", fontFamily: "inherit" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "60px 20px" }}>
        <a href="/" style={{ fontSize: "13px", color: "rgb(0, 210, 106)", textDecoration: "none", marginBottom: "24px", display: "inline-block" }}>← Retour à l'accueil</a>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: "0 0 32px 0" }}>Conditions Générales de Vente</h1>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>1. Objet</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Les présentes Conditions Générales de Vente (CGV) régissent l'ensemble des prestations de services proposées par Fanovaly sur le site <strong style={{ color: "#fff" }}>fanovaly.com</strong>. Toute commande implique l'acceptation sans réserve des présentes CGV.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>2. Services proposés</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Fanovaly propose des services de promotion sur les réseaux sociaux, incluant :<br />
            • Augmentation de followers (abonnés)<br />
            • Augmentation de likes (j'aime)<br />
            • Augmentation de vues<br /><br />
            Ces services sont disponibles pour TikTok et Instagram. Les quantités et tarifs sont indiqués sur le site au moment de la commande.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>3. Commande et paiement</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Le paiement s'effectue en ligne par carte bancaire via la plateforme sécurisée <strong style={{ color: "#fff" }}>Stripe</strong>. La commande est confirmée dès réception du paiement. Un e-mail de confirmation est envoyé à l'adresse fournie.<br /><br />
            Les prix sont indiqués en euros (€) TTC.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>4. Livraison</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            La livraison des services commence dès la confirmation du paiement. Les délais de livraison varient selon le service et la quantité commandée :<br />
            • <strong style={{ color: "#fff" }}>Followers</strong> : livraison progressive sous 1 à 24 heures.<br />
            • <strong style={{ color: "#fff" }}>Likes</strong> : livraison sous 30 minutes à 6 heures.<br />
            • <strong style={{ color: "#fff" }}>Vues</strong> : livraison sous 30 minutes à 12 heures.<br /><br />
            Ces délais sont indicatifs et peuvent varier en fonction de la charge.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>5. Droit de rétractation</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux prestations de services pleinement exécutées avant la fin du délai de rétractation. La livraison commençant immédiatement après le paiement, le client accepte expressément que le service soit exécuté avant l'expiration du délai de rétractation.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>6. Responsabilité</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Fanovaly ne peut être tenu responsable des éventuelles sanctions appliquées par les plateformes de réseaux sociaux (TikTok, Instagram) suite à l'utilisation de nos services. L'utilisateur reconnaît utiliser ces services en connaissance de cause et sous sa propre responsabilité.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>7. Garantie de livraison</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            En cas de non-livraison totale du service commandé, Fanovaly s'engage à relancer la livraison ou à procéder à un remboursement. Voir notre <a href="/remboursement" style={{ color: "rgb(0, 210, 106)" }}>politique de remboursement</a>.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>8. Propriété intellectuelle</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Tous les éléments du site (logo, textes, design, code) sont la propriété de Fanovaly. Toute reproduction est interdite sans autorisation.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 12px 0" }}>9. Droit applicable</h2>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "rgb(169, 181, 174)", margin: 0 }}>
            Les présentes CGV sont soumises au droit français. Tout litige sera porté devant les tribunaux compétents.
          </p>
        </section>
      </div>
    </div>
  );
}
