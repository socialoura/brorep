"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useDetectedCurrency } from "@/components/CurrencyProvider";

export type Lang = "fr" | "en";
export type Currency = "eur" | "usd" | "gbp" | "cad" | "nzd" | "chf" | "aud";

export function fmtPrice(amount: number, currency: Currency): string {
  switch (currency) {
    case "usd": return `$${amount.toFixed(2)}`;
    case "gbp": return `£${amount.toFixed(2)}`;
    case "cad": return `C$${amount.toFixed(2)}`;
    case "nzd": return `NZ$${amount.toFixed(2)}`;
    case "aud": return `A$${amount.toFixed(2)}`;
    case "chf": return `CHF ${amount.toFixed(2)}`;
    default: return `${amount.toFixed(2)}\u20AC`;
  }
}

export function currencyField(currency: Currency): string {
  switch (currency) {
    case "usd": return "priceUsd";
    case "gbp": return "priceGbp";
    case "cad": return "priceCad";
    case "nzd": return "priceNzd";
    case "aud": return "priceAud";
    case "chf": return "priceChf";
    default: return "price";
  }
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
  "cta.launch": { fr: "Lancer ma croissance →", en: "Start my growth →" },
  "cta.from": { fr: "à partir de", en: "from" },

  // ===== SocialProof =====
  "social.profilesAnalyzed": { fr: "packs vendus", en: "packs sold" },
  "social.videosAnalyzed": { fr: "vidéos analysées", en: "videos analyzed" },
  "social.thisMonth": { fr: "ce mois-ci", en: "this month" },

  // ===== HomePage hero =====
  "hero.title1": { fr: "Accélère ta croissance TikTok", en: "Accelerate your TikTok growth" },
  "hero.title2": { fr: "TikTok", en: "TikTok" },
  "hero.subtitle1": { fr: "On s'occupe de ta visibilité TikTok pendant que", en: "We handle your TikTok visibility while" },
  "hero.subtitle2": { fr: "tu te concentres sur ton contenu.", en: "you focus on your content." },
  "hero.moreProfiles": { fr: "de packs vendus de plus qu'hier", en: "more packs sold than yesterday" },
  "hero.morePercent": { fr: "20% plus", en: "20% more" },
  "hero.operational": { fr: "Tous nos services sont opérationnels", en: "All our services are operational" },
  "hero.startingAt": { fr: "À partir de", en: "Starting at" },
  "hero.delivery": { fr: "Livraison sous 24h", en: "Delivery within 24h" },

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
  "service.checkout": { fr: "Payer", en: "Pay" },
  "service.emptyCart": { fr: "Choisis un pack", en: "Pick a pack" },
  "service.boostTip": { fr: "Booste tes résultats en combinant :", en: "Boost your results by combining:" },
  "service.addAlso": { fr: "Ajoute aussi des", en: "Also add" },
  "service.discountHint": { fr: "-10% automatique en ajoutant 2 services ou plus", en: "-10% automatic when adding 2+ services" },
  "service.discountApplied": { fr: "-10% appliqué ! Tu combines 2+ services", en: "-10% applied! You're combining 2+ services" },
  "service.toastMsg": { fr: "Les profils qui combinent avec des {service} grandissent 2x plus vite — et c'est -10% auto !", en: "Profiles that combine with {service} grow 2x faster — and it's -10% auto!" },
  "service.toastCta": { fr: "Voir les", en: "See" },
  "service.usernameRequired": { fr: "Entre ton @username pour continuer", en: "Enter your @username to continue" },
  "service.selectAtLeast": { fr: "Sélectionne au moins un pack", en: "Select at least one pack" },
  "service.backToProfile": { fr: "Retour", en: "Back" },
  "service.usernamePlaceholder": { fr: "Ton nom d'utilisateur", en: "Your username" },
  "service.usernameLabel": { fr: "Compte à booster", en: "Account to boost" },
  "service.youtubeUrlLabel": { fr: "Vidéo YouTube à booster", en: "YouTube video to boost" },
  "service.youtubeUrlPlaceholder": { fr: "Colle l'URL de ta vidéo YouTube", en: "Paste your YouTube video URL" },
  "service.youtubeUrlInvalid": { fr: "Lien invalide ou vidéo introuvable", en: "Invalid link or video not found" },
  "service.youtubeUrlRequired": { fr: "Colle l'URL de ta vidéo YouTube pour continuer", en: "Paste your YouTube video URL to continue" },
  "service.ordersThisWeek": { fr: "commandes cette semaine", en: "orders this week" },
  "service.trustReal": { fr: "Vrais comptes", en: "Real accounts" },
  "service.trustFast": { fr: "Livraison rapide", en: "Fast delivery" },
  "service.trustNoPassword": { fr: "Sans mot de passe", en: "No password needed" },

  // ===== Spotify =====
  "spotify.heroTitle1": { fr: "Booste tes", en: "Boost your" },
  "spotify.heroTitle2": { fr: "streams", en: "streams" },
  "spotify.heroHighlight": { fr: "Spotify", en: "Spotify" },
  "spotify.subtitle1": { fr: "Plus de streams = plus de royalties et un meilleur placement dans l'algorithme.", en: "More streams = more royalties and better algorithm placement." },
  "spotify.subtitle2": { fr: "Fais décoller ton morceau et commence à générer des revenus.", en: "Launch your track and start generating revenue." },
  "spotify.delivery": { fr: "Livraison sous 24-72h", en: "Delivery within 24-72h" },
  "spotify.trackLabel": { fr: "Lien du morceau Spotify", en: "Spotify track link" },
  "spotify.trackPlaceholder": { fr: "https://open.spotify.com/track/...", en: "https://open.spotify.com/track/..." },
  "spotify.trackRequired": { fr: "Colle le lien de ton track Spotify", en: "Paste your Spotify track link" },
  "spotify.pickPack": { fr: "Choisis ton pack de streams", en: "Choose your streams pack" },
  "spotify.streams": { fr: "Streams", en: "Streams" },
  "spotify.startingAt": { fr: "À partir de", en: "Starting at" },
  "spotify.cta": { fr: "Booster mon morceau", en: "Boost my track" },
  "spotify.social": { fr: "morceaux boostés", en: "tracks boosted" },
  "spotify.howItWorks.step1.title": { fr: "Colle ton lien", en: "Paste your link" },
  "spotify.howItWorks.step1.desc": { fr: "Copie le lien de ton morceau Spotify et colle-le dans le champ prévu.", en: "Copy your Spotify track link and paste it in the field." },
  "spotify.howItWorks.step2.title": { fr: "Choisis ton pack", en: "Choose your pack" },
  "spotify.howItWorks.step2.desc": { fr: "Sélectionne le nombre de streams souhaité parmi nos packs.", en: "Select how many streams you want from our packs." },
  "spotify.howItWorks.step3.title": { fr: "Reçois tes streams", en: "Receive your streams" },
  "spotify.howItWorks.step3.desc": { fr: "Livraison progressive et naturelle sous 24-72h directement sur ton morceau.", en: "Progressive & natural delivery within 24-72h directly on your track." },
  "spotify.faq.q1": { fr: "Les streams sont-ils réels ?", en: "Are the streams real?" },
  "spotify.faq.a1": { fr: "Oui, les streams proviennent de comptes réels avec une écoute naturelle et progressive pour respecter l'algorithme Spotify.", en: "Yes, streams come from real accounts with natural and progressive listening to respect Spotify's algorithm." },
  "spotify.faq.q2": { fr: "Est-ce que c'est sûr pour mon compte ?", en: "Is it safe for my account?" },
  "spotify.faq.a2": { fr: "Absolument. Nous ne demandons aucun accès à ton compte. Il suffit du lien de ton morceau.", en: "Absolutely. We don't ask for any access to your account. We just need your track link." },
  "spotify.faq.q3": { fr: "En combien de temps je reçois mes streams ?", en: "How fast will I receive my streams?" },
  "spotify.faq.a3": { fr: "La livraison commence sous quelques heures et se fait progressivement sur 24 à 72h pour un rendu naturel.", en: "Delivery starts within hours and happens progressively over 24-72h for a natural result." },
  "spotify.faq.q4": { fr: "Que se passe-t-il si je perds des streams ?", en: "What if I lose streams?" },
  "spotify.faq.a4": { fr: "Nous garantissons tes streams pendant 30 jours. En cas de baisse, on recharge gratuitement.", en: "We guarantee your streams for 30 days. If they drop, we refill for free." },
  "spotify.modeSearch": { fr: "Rechercher un son", en: "Search a track" },
  "spotify.modeLink": { fr: "Coller un lien", en: "Paste a link" },
  "spotify.searchPlaceholder": { fr: "Nom du son + artiste", en: "Track name + artist" },
  "spotify.searching": { fr: "Recherche en cours...", en: "Searching..." },
  "spotify.trackNotFound": { fr: "Aucun résultat trouvé", en: "No results found" },
  "spotify.trackConfirm": { fr: "C'est bien ce morceau ?", en: "Is this the right track?" },
  "spotify.trackChange": { fr: "Changer", en: "Change" },

  // ===== PostPicker =====
  "posts.loading": { fr: "Chargement de tes posts...", en: "Loading your posts..." },
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

  // ===== Upsell =====
  "upsell.add": { fr: "Ajoute", en: "Add" },
  "upsell.onlyFor": { fr: "pour seulement", en: "for only" },
  "upsell.addBtn": { fr: "Ajouter", en: "Add" },
  "checkout.emailToUnlock": { fr: "Renseigne ton email ci-dessus pour accéder aux options de paiement", en: "Enter your email above to access payment options" },
  "checkout.preparingPayment": { fr: "Préparation du paiement...", en: "Preparing payment..." },
  "checkout.serverError": { fr: "Impossible de contacter le serveur de paiement.", en: "Unable to contact payment server." },
  "checkout.trustSecure": { fr: "Paiement 100% sécurisé", en: "100% secure payment" },
  "checkout.trustDelivery": { fr: "Livraison sous 24h", en: "Delivery within 24h" },
  "checkout.trustGuarantee": { fr: "Satisfait ou remboursé", en: "Satisfaction guaranteed" },
  "checkout.trustSupport": { fr: "Support 7j/7", en: "24/7 support" },
  "checkout.urgencyOffer": { fr: "Offre spéciale expire dans", en: "Special offer expires in" },

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
  "orderDetail.serviceStatus": { fr: "Statut par service", en: "Status per service" },
  "orderStatus.error": { fr: "Erreur", en: "Error" },
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

  const detectedCurrency = useDetectedCurrency();
  const currencyParam = searchParams.get("currency") as Currency | null;
  const currency: Currency = currencyParam && ["eur", "usd", "gbp", "cad", "nzd", "chf"].includes(currencyParam)
    ? currencyParam
    : detectedCurrency
      ? detectedCurrency
      : lang === "en" ? "usd" : "eur";

  return { t, lang, href, currency };
}
