"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export type Lang = "fr" | "en";
export type Currency = "eur" | "usd";

export function fmtPrice(amount: number, currency: Currency): string {
  if (currency === "usd") return `$${amount.toFixed(2)}`;
  return `${amount.toFixed(2)}\u20AC`;
}

const dict: Record<string, Record<Lang, string>> = {
  // ===== Footer =====
  "footer.cgv": { fr: "CGV", en: "Terms" },
  "footer.privacy": { fr: "Confidentialité", en: "Privacy" },
  "footer.legal": { fr: "Mentions légales", en: "Legal" },
  "footer.refund": { fr: "Remboursement", en: "Refund" },
  "footer.rights": { fr: "Tous droits réservés", en: "All rights reserved" },

  // ===== StatusBadge =====
  "status.aiRunning": { fr: "IA en cours", en: "AI running" },

  // ===== CTAButton =====
  "cta.launch": { fr: "Lancer l'IA →", en: "Launch AI →" },

  // ===== SocialProof =====
  "social.profilesAnalyzed": { fr: "profils analysés", en: "profiles analyzed" },
  "social.videosAnalyzed": { fr: "vidéos analysées", en: "videos analyzed" },
  "social.thisMonth": { fr: "ce mois-ci", en: "this month" },

  // ===== HomePage hero =====
  "hero.title1": { fr: "Notre IA analyse", en: "Our AI analyzes" },
  "hero.title2": { fr: "ton profil en 30s", en: "your profile in 30s" },
  "hero.subtitle1": { fr: "Notre IA scanne ton profil et te propose", en: "Our AI scans your profile and suggests" },
  "hero.subtitle2": { fr: "une stratégie de croissance personnalisée", en: "a personalized growth strategy" },
  "hero.moreProfiles": { fr: "de profils analysés par notre IA qu'hier", en: "more profiles analyzed by our AI than yesterday" },
  "hero.morePercent": { fr: "20% plus", en: "20% more" },

  // ===== How it works =====
  "howItWorks.title": { fr: "Comment ça marche", en: "How it works" },
  "howItWorks.step1.title": { fr: "L'IA scanne ton profil", en: "AI scans your profile" },
  "howItWorks.step1.desc": { fr: "Entre ton @ et notre IA analyse tes stats, posts et engagement en 30 secondes.", en: "Enter your @ and our AI analyzes your stats, posts and engagement in 30 seconds." },
  "howItWorks.step2.title": { fr: "Stratégie personnalisée", en: "Personalized strategy" },
  "howItWorks.step2.desc": { fr: "L'IA te recommande un plan sur mesure adapté à ton profil et tes objectifs.", en: "AI recommends a tailored plan adapted to your profile and goals." },
  "howItWorks.step3.title": { fr: "Croissance automatique", en: "Automatic growth" },
  "howItWorks.step3.desc": { fr: "Résultats visibles rapidement, directement sur ton compte.", en: "Results visible quickly, directly on your account." },

  // ===== FAQ =====
  "faq.title": { fr: "Questions fréquentes", en: "FAQ" },
  "faq.q1": { fr: "Comment l'IA analyse mon profil ?", en: "How does the AI analyze my profile?" },
  "faq.a1": { fr: "Notre IA scanne tes stats, ton taux d'engagement, tes derniers posts et ton audience pour identifier les axes de croissance les plus efficaces.", en: "Our AI scans your stats, engagement rate, latest posts and audience to identify the most effective growth opportunities." },
  "faq.q2": { fr: "Est-ce que c'est sûr pour mon compte ?", en: "Is it safe for my account?" },
  "faq.a2": { fr: "Oui. L'IA analyse ton profil sans aucun accès à ton compte. Aucun mot de passe requis, aucune connexion à tes réseaux.", en: "Yes. The AI analyzes your profile without any access to your account. No password required, no connection to your social media." },
  "faq.q3": { fr: "En combien de temps je vois des résultats ?", en: "How quickly will I see results?" },
  "faq.a3": { fr: "L'analyse IA prend 30 secondes. Les premiers résultats de la stratégie sont visibles en quelques minutes, tout est finalisé sous 24h.", en: "The AI analysis takes 30 seconds. First results are visible within minutes, everything is finalized within 24h." },
  "faq.q4": { fr: "Les résultats sont-ils durables ?", en: "Are results long-lasting?" },
  "faq.a4": { fr: "L'IA recommande une croissance progressive et naturelle. En cas de variation, on ajuste gratuitement pendant 30 jours.", en: "AI recommends progressive and natural growth. In case of variation, we adjust for free for 30 days." },

  // ===== Progress Steps =====
  "progress.platform": { fr: "Plateforme", en: "Platform" },
  "progress.profile": { fr: "Profil", en: "Profile" },
  "progress.services": { fr: "Services", en: "Services" },
  "progress.payment": { fr: "Paiement", en: "Payment" },

  // ===== PlatformSelect =====
  "platform.title1": { fr: "Où veux-tu booster ta", en: "Where do you want to boost your" },
  "platform.title2": { fr: "croissance", en: "growth" },
  "platform.subtitle": { fr: "Sélectionne la plateforme sur laquelle tu veux progresser", en: "Select the platform where you want to grow" },
  "platform.popular": { fr: "Populaire", en: "Popular" },
  "platform.footer": { fr: "Analyse disponible pour les deux plateformes", en: "Analysis available for both platforms" },

  // ===== UsernameInput =====
  "username.title1": { fr: "Entre ton", en: "Enter your" },
  "username.subtitle.channel": { fr: "On va analyser ta chaîne", en: "We'll analyze your channel" },
  "username.subtitle.profile": { fr: "On va analyser ton profil", en: "We'll analyze your profile" },
  "username.placeholder": { fr: "ton nom d'utilisateur", en: "your username" },
  "username.submit": { fr: "Analyser mon profil", en: "Analyze my profile" },
  "username.privacy": { fr: "Tes données restent privées et sécurisées", en: "Your data stays private and secure" },

  // ===== ScanLoading =====
  "scan.title": { fr: "L'IA analyse", en: "AI is analyzing" },
  "scan.subtitle": { fr: "Scan {platform} en cours…", en: "{platform} scan in progress…" },
  "scan.step1": { fr: "L'IA se connecte au profil", en: "AI connects to profile" },
  "scan.step2": { fr: "Récupération des données", en: "Retrieving data" },
  "scan.step3": { fr: "L'IA analyse l'engagement", en: "AI analyzes engagement" },
  "scan.step4": { fr: "Calcul du potentiel viral", en: "Calculating viral potential" },
  "scan.completed": { fr: "complété", en: "completed" },
  "scan.secure": { fr: "Analyse IA sécurisée", en: "Secure AI analysis" },
  "scan.errorCheck": { fr: "Vérifie le nom d'utilisateur et réessaie", en: "Check your username and try again" },
  "scan.retry": { fr: "Réessayer", en: "Retry" },
  "scan.changeUsername": { fr: "Changer de pseudo", en: "Change username" },
  "scan.profileNotFound": { fr: "Profil introuvable", en: "Profile not found" },
  "scan.scanError": { fr: "Erreur lors du scan", en: "Scan error" },
  "scan.privateAccount": { fr: "Ce compte est privé", en: "This account is private" },
  "scan.timeout": { fr: "Le scan a pris trop de temps", en: "Scan took too long" },
  "scan.serverError": { fr: "Impossible de contacter le serveur", en: "Unable to contact server" },

  // ===== ProfileConfirm =====
  "profile.detected": { fr: "Profil {platform} détecté", en: "{platform} profile detected" },
  "profile.followers": { fr: "Abonnés", en: "Followers" },
  "profile.videos": { fr: "Vidéos", en: "Videos" },
  "profile.isThisYou": { fr: "C'est bien ton compte ?", en: "Is this your account?" },
  "profile.confirm": { fr: "Oui, c'est moi", en: "Yes, that's me" },
  "profile.goBack": { fr: "Non, revenir en arrière", en: "No, go back" },

  // ===== ServiceSelect =====
  "service.composeTitle": { fr: "Compose ton", en: "Build your" },
  "service.pack": { fr: "pack", en: "pack" },
  "service.composeSubtitle": { fr: "Choisis dans chaque catégorie — ou prends un combo", en: "Choose from each category — or pick a combo" },
  "service.combosSoon": { fr: "Nos packs combo arrivent bientôt !", en: "Combo packs coming soon!" },
  "service.orCompose": { fr: "ou compose toi-même", en: "or build your own" },
  "service.top": { fr: "Top", en: "Top" },
  "service.yourCart": { fr: "Ton panier", en: "Your cart" },
  "service.total": { fr: "Total", en: "Total" },
  "service.checkout": { fr: "Passer commande", en: "Checkout" },
  "service.selectAtLeast": { fr: "Sélectionne au moins un pack", en: "Select at least one pack" },
  "service.backToProfile": { fr: "Retour au profil", en: "Back to profile" },

  // ===== PostPicker =====
  "posts.title": { fr: "Choisis tes", en: "Choose your" },
  "posts.posts": { fr: "posts", en: "posts" },
  "posts.whichPosts": { fr: "Sur quels posts veux-tu recevoir tes", en: "Which posts do you want to receive your" },
  "posts.selected": { fr: "sélectionné", en: "selected" },
  "posts.distributed": { fr: "seront répartis équitablement", en: "will be distributed equally" },
  "posts.selectAll": { fr: "Tout sélectionner", en: "Select all" },
  "posts.deselectAll": { fr: "Tout désélectionner", en: "Deselect all" },
  "posts.noPosts": { fr: "Aucun post récupéré pour ce profil.", en: "No posts found for this profile." },
  "posts.validate": { fr: "Valider", en: "Confirm" },
  "posts.selectAtLeast": { fr: "Sélectionne au moins un post", en: "Select at least one post" },
  "posts.editCart": { fr: "Modifier mon panier", en: "Edit my cart" },

  // ===== CheckoutForm =====
  "checkout.summary": { fr: "Récapitulatif", en: "Summary" },
  "checkout.discount": { fr: "Réduction", en: "Discount" },
  "checkout.promoLabel": { fr: "Code promo (optionnel)", en: "Promo code (optional)" },
  "checkout.apply": { fr: "Appliquer", en: "Apply" },
  "checkout.invalidCode": { fr: "Code invalide ou expiré", en: "Invalid or expired code" },
  "checkout.applied": { fr: "appliqué !", en: "applied!" },
  "checkout.emailLabel": { fr: "Adresse e-mail", en: "Email address" },
  "checkout.emailInvalid": { fr: "Entre une adresse e-mail valide", en: "Enter a valid email address" },
  "checkout.loyaltyUsePoints": { fr: "Utilise 500 pts pour -5€", en: "Use 500 pts for -€5" },
  "checkout.loyaltyApplied": { fr: "-5€ appliqué !", en: "-€5 applied!" },
  "checkout.loyaltyRemaining": { fr: "pts restants", en: "pts remaining" },
  "checkout.loyaltyUse": { fr: "Utiliser", en: "Use" },
  "checkout.paymentSecure": { fr: "Paiement", en: "Payment" },
  "checkout.secureLabel": { fr: "sécurisé", en: "secure" },
  "checkout.poweredByStripe": { fr: "Propulsé par Stripe — tes données sont chiffrées", en: "Powered by Stripe — your data is encrypted" },
  "checkout.orPayByCard": { fr: "ou payer par carte", en: "or pay by card" },
  "checkout.paymentError": { fr: "Erreur de paiement", en: "Payment error" },
  "checkout.processing": { fr: "Paiement en cours...", en: "Processing payment..." },
  "checkout.pay": { fr: "Payer", en: "Pay" },
  "checkout.emailRequired": { fr: "Entre ton e-mail ci-dessus pour accéder au paiement", en: "Enter your email above to access payment" },
  "checkout.back": { fr: "Retour", en: "Back" },
  "checkout.preparingPayment": { fr: "Préparation du paiement...", en: "Preparing payment..." },
  "checkout.serverError": { fr: "Impossible de contacter le serveur de paiement.", en: "Unable to contact payment server." },

  // ===== SuccessPage =====
  "success.title": { fr: "Paiement réussi !", en: "Payment successful!" },
  "success.orderRegistered": { fr: "Ta commande pour", en: "Your order for" },
  "success.orderRegistered2": { fr: "a été enregistrée. Tu recevras tes résultats très bientôt.", en: "has been registered. You'll receive your results very soon." },
  "success.giftTitle": { fr: "Cadeau pour ta prochaine commande", en: "Gift for your next order" },
  "success.offNextOrder": { fr: "sur ta prochaine commande", en: "off your next order" },
  "success.expiresIn": { fr: "Expire dans", en: "Expires in" },
  "success.expired": { fr: "Expiré", en: "Expired" },
  "success.codeCopied": { fr: "Code copié !", en: "Code copied!" },
  "success.clickToCopy": { fr: "Clique sur le code pour le copier", en: "Click the code to copy it" },
  "success.generatingPromo": { fr: "Génération de ton code promo...", en: "Generating your promo code..." },
  "success.trackOrder": { fr: "Suivre ma commande", en: "Track my order" },
  "success.viewAllOrders": { fr: "Voir toutes mes commandes", en: "View all my orders" },
  "success.newAnalysis": { fr: "Nouvelle analyse", en: "New analysis" },

  // ===== YouTube HomePage =====
  "yt.hero.title1": { fr: "Notre IA analyse", en: "Our AI analyzes" },
  "yt.hero.title2": { fr: "ta vidéo en 30s", en: "your video in 30s" },
  "yt.hero.subtitle1": { fr: "Notre IA scanne ta vidéo et te propose", en: "Our AI scans your video and suggests" },
  "yt.hero.subtitle2": { fr: "une stratégie de croissance personnalisée", en: "a personalized growth strategy" },
  "yt.hero.cta": { fr: "Lancer l'IA →", en: "Launch AI →" },
  "yt.hero.morePercent": { fr: "20% plus", en: "20% more" },
  "yt.hero.moreProfiles": { fr: "de vidéos analysées par notre IA qu'hier", en: "more videos analyzed by our AI than yesterday" },
  "yt.howItWorks.step1.title": { fr: "L'IA scanne ta vidéo", en: "AI scans your video" },
  "yt.howItWorks.step1.desc": { fr: "Colle le lien de ta vidéo et notre IA analyse tes stats et engagement en 30 secondes.", en: "Paste your video link and our AI analyzes your stats and engagement in 30 seconds." },
  "yt.howItWorks.step2.title": { fr: "Stratégie personnalisée", en: "Personalized strategy" },
  "yt.howItWorks.step2.desc": { fr: "L'IA te recommande un plan sur mesure adapté à ta vidéo et tes objectifs.", en: "AI recommends a custom plan adapted to your video and goals." },
  "yt.howItWorks.step3.title": { fr: "Croissance automatique", en: "Automatic growth" },
  "yt.howItWorks.step3.desc": { fr: "Résultats visibles rapidement, directement sur ta vidéo.", en: "Results visible quickly, directly on your video." },
  "yt.faq.q1": { fr: "Comment l'IA analyse ma vidéo ?", en: "How does the AI analyze my video?" },
  "yt.faq.a1": { fr: "Notre IA analyse les stats de ta vidéo (vues, likes, engagement) en 30 secondes et te recommande un plan de croissance adapté.", en: "Our AI analyzes your video stats (views, likes, engagement) in 30 seconds and recommends a growth plan tailored to you." },
  "yt.faq.q2": { fr: "Est-ce que c'est sûr pour mon compte ?", en: "Is it safe for my account?" },
  "yt.faq.a2": { fr: "Oui. Aucun mot de passe requis, aucun accès à ton compte Google. On a juste besoin du lien de ta vidéo.", en: "Yes. No password required, no access to your Google account. We just need your video link." },
  "yt.faq.q3": { fr: "En combien de temps je vois des résultats ?", en: "How quickly will I see results?" },
  "yt.faq.a3": { fr: "Les premiers résultats sont visibles en quelques heures. Selon le pack choisi, tout est finalisé sous 24-72h.", en: "First results visible within hours. Depending on the pack chosen, everything is finalized within 24-72h." },
  "yt.faq.q4": { fr: "Les résultats sont-ils durables ?", en: "Are results long-lasting?" },
  "yt.faq.a4": { fr: "On mise sur une croissance progressive et stable. En cas de variation, on compense gratuitement pendant 30 jours.", en: "We focus on progressive and stable growth. In case of variation, we compensate for free for 30 days." },
  "yt.linkToTikTok": { fr: "Tu cherches TikTok ou Instagram ? C'est par ici", en: "Looking for TikTok or Instagram? Click here" },

  // ===== YouTubeUrlInput =====
  "ytUrl.title1": { fr: "Colle le lien de ta", en: "Paste your" },
  "ytUrl.title2": { fr: "vidéo YouTube", en: "YouTube video" },
  "ytUrl.subtitle": { fr: "On va récupérer les infos de ta vidéo pour te proposer les meilleurs packs", en: "We'll fetch your video info to suggest the best packs" },
  "ytUrl.errorEmpty": { fr: "Colle un lien YouTube", en: "Paste a YouTube link" },
  "ytUrl.errorNotFound": { fr: "Vidéo introuvable", en: "Video not found" },
  "ytUrl.errorServer": { fr: "Impossible de contacter le serveur", en: "Unable to contact server" },
  "ytUrl.loading": { fr: "Chargement", en: "Loading" },
  "ytUrl.analyze": { fr: "Analyser", en: "Analyze" },
  "ytUrl.formats": { fr: "Formats acceptés : youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...", en: "Accepted formats: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/..." },

  // ===== YouTubeVideoPreview =====
  "ytPreview.views": { fr: "Vues", en: "Views" },
  "ytPreview.likes": { fr: "Likes", en: "Likes" },
  "ytPreview.subscribers": { fr: "Abonnés", en: "Subscribers" },
  "ytPreview.comments": { fr: "Commentaires", en: "Comments" },
  "ytPreview.isThisVideo": { fr: "C'est bien cette vidéo ?", en: "Is this the right video?" },
  "ytPreview.noChange": { fr: "Non, changer", en: "No, change" },
  "ytPreview.yesContinue": { fr: "Oui, continuer →", en: "Yes, continue →" },

  // ===== Orders page =====
  "orders.subtitle": { fr: "Suivi de tes commandes", en: "Track your orders" },
  "orders.emailLabel": { fr: "Entre ton adresse e-mail pour retrouver tes commandes", en: "Enter your email to find your orders" },
  "orders.search": { fr: "Rechercher", en: "Search" },
  "orders.noOrders": { fr: "Aucune commande trouvée", en: "No orders found" },
  "orders.checkEmail": { fr: "Vérifie que c'est bien l'email utilisé lors du paiement.", en: "Make sure this is the email used during payment." },
  "orders.found": { fr: "commande", en: "order" },
  "orders.foundPlural": { fr: "commandes", en: "orders" },
  "orders.foundSuffix": { fr: "trouvée", en: "found" },
  "orders.foundPluralSuffix": { fr: "trouvées", en: "found" },
  "orders.backHome": { fr: "Retour à l'accueil", en: "Back to home" },
  "orders.serverError": { fr: "Impossible de contacter le serveur", en: "Unable to contact server" },

  // ===== Order status =====
  "orderStatus.pending": { fr: "En attente", en: "Pending" },
  "orderStatus.paid": { fr: "Confirmée", en: "Confirmed" },
  "orderStatus.processing": { fr: "En cours", en: "Processing" },
  "orderStatus.delivered": { fr: "Livrée", en: "Delivered" },

  // ===== Order detail page =====
  "orderDetail.tracking": { fr: "Suivi de commande", en: "Order tracking" },
  "orderDetail.statusDelivered": { fr: "Commande livrée ✅", en: "Order delivered ✅" },
  "orderDetail.statusProcessing": { fr: "En cours de traitement...", en: "Processing..." },
  "orderDetail.statusPaid": { fr: "Commande confirmée, traitement imminent", en: "Order confirmed, processing imminent" },
  "orderDetail.statusPending": { fr: "En attente de confirmation", en: "Awaiting confirmation" },
  "orderDetail.deliveredOn": { fr: "Livrée le", en: "Delivered on" },
  "orderDetail.evolution": { fr: "Évolution de", en: "Evolution of" },
  "orderDetail.before": { fr: "Avant", en: "Before" },
  "orderDetail.now": { fr: "Maintenant", en: "Now" },
  "orderDetail.followers": { fr: "followers", en: "followers" },
  "orderDetail.orderDetail": { fr: "Détail de la commande", en: "Order details" },
  "orderDetail.orderedOn": { fr: "Commandé le", en: "Ordered on" },
  "orderDetail.relaunchBoost": { fr: "Relance un boost", en: "Boost again" },
  "orderDetail.loadError": { fr: "Impossible de charger la commande", en: "Unable to load order" },
};

export function useTranslation() {
  const searchParams = useSearchParams();
  const lang: Lang = searchParams.get("lang") === "en" ? "en" : "fr";

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>): string => {
      const entry = dict[key];
      let str = entry ? entry[lang] : key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    };
  }, [lang]);

  function href(path: string): string {
    if (lang === "en") {
      const sep = path.includes("?") ? "&" : "?";
      return `${path}${sep}lang=en`;
    }
    return path;
  }

  const currency: Currency = lang === "en" ? "usd" : "eur";

  return { t, lang, href, currency };
}
