"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useDetectedCurrency } from "@/components/CurrencyProvider";

export type Lang = "fr" | "en" | "es" | "pt" | "de";
export type Currency = "eur" | "usd" | "gbp" | "cad" | "nzd" | "chf" | "aud";

export function fmtPrice(amount: number, currency: Currency, lang?: Lang): string {
  const useComma = lang === "de";
  const fmt = (n: number) => useComma ? n.toFixed(2).replace(".", ",") : n.toFixed(2);
  switch (currency) {
    case "usd": return `$${fmt(amount)}`;
    case "gbp": return `£${fmt(amount)}`;
    case "cad": return `C$${fmt(amount)}`;
    case "nzd": return `NZ$${fmt(amount)}`;
    case "aud": return `A$${fmt(amount)}`;
    case "chf": return `CHF ${fmt(amount)}`;
    default: return `${fmt(amount)}\u20AC`;
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

const dict: Record<string, Partial<Record<Lang, string>>> = {
  // ===== Footer =====
  "footer.cgv": { fr: "CGV", en: "Terms", es: "Términos", pt: "Termos", de: "AGB" },
  "footer.privacy": { fr: "Confidentialité", en: "Privacy", es: "Privacidad", pt: "Privacidade", de: "Datenschutz" },
  "footer.legal": { fr: "Mentions légales", en: "Legal", es: "Aviso legal", pt: "Aviso legal", de: "Impressum" },
  "footer.refund": { fr: "Remboursement", en: "Refund", es: "Reembolso", pt: "Reembolso", de: "Erstattung" },
  "footer.rights": { fr: "Tous droits réservés", en: "All rights reserved", es: "Todos los derechos reservados", pt: "Todos os direitos reservados", de: "Alle Rechte vorbehalten" },

  // ===== StatusBadge =====
  "status.aiRunning": { fr: "IA en cours", en: "AI running", es: "IA en proceso", pt: "IA em execução", de: "KI läuft" },

  // ===== CTAButton =====
  "cta.launch": { fr: "Lancer ma croissance →", en: "Start my growth →", es: "Impulsar mi crecimiento →", pt: "Iniciar meu crescimento →", de: "Mein Wachstum starten →" },
  "cta.from": { fr: "à partir de", en: "from", es: "desde", pt: "a partir de", de: "ab" },

  // ===== Testimonials =====
  "testimonials.title": { fr: "Ils nous font confiance", en: "They trust us", es: "Confían en nosotros", pt: "Eles confiam em nós", de: "Sie vertrauen uns" },
  "testimonials.t1": { fr: "J'ai gagné 2 400 followers en 3 jours. Mon taux d'engagement a explosé et j'ai même eu des propositions de collab.", en: "I gained 2,400 followers in 3 days. My engagement rate skyrocketed and I even got collab offers.", es: "Gané 2.400 seguidores en 3 días. Mi tasa de engagement se disparó y hasta recibí propuestas de colaboración.", pt: "Ganhei 2.400 seguidores em 3 dias. Minha taxa de engajamento disparou e até recebi propostas de collab.", de: "Ich habe in 3 Tagen 2.400 Follower gewonnen. Meine Engagement-Rate ist explodiert und ich habe sogar Collab-Anfragen bekommen." },
  "testimonials.t2": { fr: "Service ultra rapide, mes likes sont arrivés en moins de 10 min. Je recommande à 100%, c'est le meilleur site que j'ai testé.", en: "Ultra fast service, my likes arrived in less than 10 min. I recommend 100%, it's the best site I've tried.", es: "Servicio ultra rápido, mis likes llegaron en menos de 10 min. Recomiendo al 100%, es el mejor sitio que he probado.", pt: "Serviço ultra rápido, meus likes chegaram em menos de 10 min. Recomendo 100%, é o melhor site que testei.", de: "Ultra schneller Service, meine Likes kamen in weniger als 10 Min. Ich empfehle es zu 100%, die beste Seite, die ich getestet habe." },
  "testimonials.t3": { fr: "J'avais peur au début mais tout est arrivé naturellement. Mon compte a pris un vrai boost et mes reels ont beaucoup plus de portée.", en: "I was scared at first but everything arrived naturally. My account got a real boost and my reels have much more reach.", es: "Tenía miedo al principio pero todo llegó de forma natural. Mi cuenta tuvo un verdadero impulso y mis reels tienen mucho más alcance.", pt: "Tinha medo no início mas tudo chegou naturalmente. Minha conta teve um verdadeiro impulso e meus reels têm muito mais alcance.", de: "Ich hatte anfangs Angst, aber alles kam natürlich an. Mein Account hat einen echten Boost bekommen und meine Reels haben viel mehr Reichweite." },

  // ===== Guarantee Badges =====
  "guarantee.fast": { fr: "Livraison en 10 min", en: "Delivery in 10 min", es: "Entrega en 10 min", pt: "Entrega em 10 min", de: "Lieferung in 10 Min" },
  "guarantee.secure": { fr: "Paiement 100% sécurisé", en: "100% secure payment", es: "Pago 100% seguro", pt: "Pagamento 100% seguro", de: "100% sichere Zahlung" },
  "guarantee.support": { fr: "Support 7j/7", en: "24/7 support", es: "Soporte 24/7", pt: "Suporte 24/7", de: "24/7-Support" },

  // ===== SocialProof =====
  "social.profilesAnalyzed": { fr: "packs vendus", en: "packs sold", es: "packs vendidos", pt: "packs vendidos", de: "Pakete verkauft" },
  "social.videosAnalyzed": { fr: "vidéos analysées", en: "videos analyzed", es: "videos analizados", pt: "vídeos analisados", de: "Videos analysiert" },
  "social.thisMonth": { fr: "ce mois-ci", en: "this month", es: "este mes", pt: "este mês", de: "diesen Monat" },

  // ===== HomePage hero =====
  "hero.title1": { fr: "Accélère ta croissance", en: "Accelerate your growth", es: "Acelera tu crecimiento", pt: "Acelere seu crescimento", de: "Beschleunige dein Wachstum" },
  "hero.title2": { fr: "", en: "", es: "", pt: "", de: "" },
  "hero.subtitle1": { fr: "On s'occupe de ta visibilité TikTok pendant que", en: "We handle your TikTok visibility while", es: "Nos encargamos de tu visibilidad en TikTok mientras", pt: "Cuidamos da sua visibilidade no TikTok enquanto", de: "Wir kümmern uns um deine TikTok-Sichtbarkeit, während" },
  "hero.subtitle2": { fr: "tu te concentres sur ton contenu.", en: "you focus on your content.", es: "tú te concentras en tu contenido.", pt: "você foca no seu conteúdo.", de: "du dich auf deinen Content konzentrierst." },
  "hero.moreProfiles": { fr: "de packs vendus de plus qu'hier", en: "more packs sold than yesterday", es: "más packs vendidos que ayer", pt: "mais packs vendidos que ontem", de: "mehr Pakete verkauft als gestern" },
  "hero.morePercent": { fr: "20% plus", en: "20% more", es: "20% más", pt: "20% mais", de: "20% mehr" },
  "hero.operational": { fr: "Tous nos services sont opérationnels", en: "All our services are operational", es: "Todos nuestros servicios están operativos", pt: "Todos os nossos serviços estão operacionais", de: "Alle unsere Dienste sind betriebsbereit" },
  "hero.startingAt": { fr: "À partir de", en: "Starting at", es: "Desde", pt: "A partir de", de: "Ab" },
  "hero.delivery": { fr: "Livraison en 10 minutes", en: "Delivery within 10 minutes", es: "Entrega en 10 minutos", pt: "Entrega em 10 minutos", de: "Lieferung in 10 Minuten" },

  // ===== How it works =====
  "howItWorks.title": { fr: "Comment ça marche", en: "How it works", es: "Cómo funciona", pt: "Como funciona", de: "So funktioniert's" },
  "howItWorks.step1.title": { fr: "L'IA scanne ton profil", en: "AI scans your profile", es: "La IA escanea tu perfil", pt: "A IA analisa seu perfil", de: "KI scannt dein Profil" },
  "howItWorks.step1.desc": { fr: "Entre ton @ et notre IA analyse tes stats, posts et engagement en 30 secondes.", en: "Enter your @ and our AI analyzes your stats, posts and engagement in 30 seconds.", es: "Ingresa tu @ y nuestra IA analiza tus stats, posts y engagement en 30 segundos.", pt: "Digite seu @ e nossa IA analisa suas stats, posts e engajamento em 30 segundos.", de: "Gib deinen @ ein und unsere KI analysiert deine Stats, Posts und Engagement in 30 Sekunden." },
  "howItWorks.step2.title": { fr: "Stratégie personnalisée", en: "Personalized strategy", es: "Estrategia personalizada", pt: "Estratégia personalizada", de: "Personalisierte Strategie" },
  "howItWorks.step2.desc": { fr: "L'IA te recommande un plan sur mesure adapté à ton profil et tes objectifs.", en: "AI recommends a tailored plan adapted to your profile and goals.", es: "La IA te recomienda un plan a medida adaptado a tu perfil y objetivos.", pt: "A IA recomenda um plano sob medida adaptado ao seu perfil e objetivos.", de: "Die KI empfiehlt einen maßgeschneiderten Plan für dein Profil und deine Ziele." },
  "howItWorks.step3.title": { fr: "Croissance automatique", en: "Automatic growth", es: "Crecimiento automático", pt: "Crescimento automático", de: "Automatisches Wachstum" },
  "howItWorks.step3.desc": { fr: "Résultats visibles rapidement, directement sur ton compte.", en: "Results visible quickly, directly on your account.", es: "Resultados visibles rápidamente, directamente en tu cuenta.", pt: "Resultados visíveis rapidamente, diretamente na sua conta.", de: "Ergebnisse schnell sichtbar, direkt auf deinem Konto." },

  // ===== FAQ =====
  "faq.title": { fr: "Questions fréquentes", en: "FAQ", es: "Preguntas frecuentes", pt: "Perguntas frequentes", de: "Häufige Fragen" },
  "faq.q1": { fr: "Comment l'IA analyse mon profil ?", en: "How does the AI analyze my profile?", es: "¿Cómo analiza la IA mi perfil?", pt: "Como a IA analisa meu perfil?", de: "Wie analysiert die KI mein Profil?" },
  "faq.a1": { fr: "Notre IA scanne tes stats, ton taux d'engagement, tes derniers posts et ton audience pour identifier les axes de croissance les plus efficaces.", en: "Our AI scans your stats, engagement rate, latest posts and audience to identify the most effective growth opportunities.", es: "Nuestra IA escanea tus stats, tasa de engagement, últimos posts y audiencia para identificar las mejores oportunidades de crecimiento.", pt: "Nossa IA analisa suas stats, taxa de engajamento, últimos posts e audiência para identificar as melhores oportunidades de crescimento.", de: "Unsere KI scannt deine Stats, Engagement-Rate, neuesten Posts und Zielgruppe, um die effektivsten Wachstumsmöglichkeiten zu identifizieren." },
  "faq.q2": { fr: "Est-ce que c'est sûr pour mon compte ?", en: "Is it safe for my account?", es: "¿Es seguro para mi cuenta?", pt: "É seguro para minha conta?", de: "Ist das sicher für mein Konto?" },
  "faq.a2": { fr: "Oui. L'IA analyse ton profil sans aucun accès à ton compte. Aucun mot de passe requis, aucune connexion à tes réseaux.", en: "Yes. The AI analyzes your profile without any access to your account. No password required, no connection to your social media.", es: "Sí. La IA analiza tu perfil sin ningún acceso a tu cuenta. Sin contraseña, sin conexión a tus redes.", pt: "Sim. A IA analisa seu perfil sem nenhum acesso à sua conta. Sem senha, sem conexão às suas redes.", de: "Ja. Die KI analysiert dein Profil ohne Zugang zu deinem Konto. Kein Passwort nötig, keine Verbindung zu deinen Netzwerken." },
  "faq.q3": { fr: "En combien de temps je vois des résultats ?", en: "How quickly will I see results?", es: "¿En cuánto tiempo veo resultados?", pt: "Em quanto tempo vejo resultados?", de: "Wie schnell sehe ich Ergebnisse?" },
  "faq.a3": { fr: "L'analyse IA prend 30 secondes. Les premiers résultats de la stratégie sont visibles en quelques minutes, tout est finalisé sous 24h.", en: "The AI analysis takes 30 seconds. First results are visible within minutes, everything is finalized within 24h.", es: "El análisis IA toma 30 segundos. Los primeros resultados son visibles en minutos, todo se finaliza en 24h.", pt: "A análise da IA leva 30 segundos. Os primeiros resultados são visíveis em minutos, tudo finalizado em 24h.", de: "Die KI-Analyse dauert 30 Sekunden. Erste Ergebnisse sind in Minuten sichtbar, alles ist in 24h abgeschlossen." },
  "faq.q4": { fr: "Les résultats sont-ils durables ?", en: "Are results long-lasting?", es: "¿Los resultados son duraderos?", pt: "Os resultados são duradouros?", de: "Sind die Ergebnisse dauerhaft?" },
  "faq.a4": { fr: "L'IA recommande une croissance progressive et naturelle. En cas de variation, on ajuste gratuitement pendant 30 jours.", en: "AI recommends progressive and natural growth. In case of variation, we adjust for free for 30 days.", es: "La IA recomienda un crecimiento progresivo y natural. En caso de variación, ajustamos gratis durante 30 días.", pt: "A IA recomenda crescimento progressivo e natural. Em caso de variação, ajustamos gratuitamente por 30 dias.", de: "Die KI empfiehlt progressives, natürliches Wachstum. Bei Schwankungen passen wir 30 Tage lang kostenlos an." },

  // ===== Progress Steps =====
  "progress.platform": { fr: "Plateforme", en: "Platform", es: "Plataforma", pt: "Plataforma", de: "Plattform" },
  "progress.profile": { fr: "Profil", en: "Profile", es: "Perfil", pt: "Perfil", de: "Profil" },
  "progress.services": { fr: "Services", en: "Services", es: "Servicios", pt: "Serviços", de: "Services" },
  "progress.payment": { fr: "Paiement", en: "Payment", es: "Pago", pt: "Pagamento", de: "Zahlung" },

  // ===== PlatformSelect =====
  "platform.title1": { fr: "Où veux-tu booster ta", en: "Where do you want to boost your", es: "¿Dónde quieres impulsar tu", pt: "Onde você quer impulsionar seu", de: "Wo möchtest du dein" },
  "platform.title2": { fr: "croissance", en: "growth", es: "crecimiento", pt: "crescimento", de: "Wachstum boosten" },
  "platform.subtitle": { fr: "Sélectionne la plateforme sur laquelle tu veux progresser", en: "Select the platform where you want to grow", es: "Selecciona la plataforma donde quieres crecer", pt: "Selecione a plataforma onde quer crescer", de: "Wähle die Plattform, auf der du wachsen willst" },
  "platform.popular": { fr: "Populaire", en: "Popular", es: "Popular", pt: "Popular", de: "Beliebt" },
  "platform.footer": { fr: "Analyse disponible pour les deux plateformes", en: "Analysis available for both platforms", es: "Análisis disponible para ambas plataformas", pt: "Análise disponível para ambas plataformas", de: "Analyse für beide Plattformen verfügbar" },

  // ===== UsernameInput =====
  "username.title1": { fr: "Entre ton", en: "Enter your", es: "Ingresa tu", pt: "Digite seu", de: "Gib deinen" },
  "username.subtitle.channel": { fr: "On va analyser ta chaîne", en: "We'll analyze your channel", es: "Vamos a analizar tu canal", pt: "Vamos analisar seu canal", de: "Wir analysieren deinen Kanal" },
  "username.subtitle.profile": { fr: "On va analyser ton profil", en: "We'll analyze your profile", es: "Vamos a analizar tu perfil", pt: "Vamos analisar seu perfil", de: "Wir analysieren dein Profil" },
  "username.placeholder": { fr: "ton nom d'utilisateur", en: "your username", es: "tu nombre de usuario", pt: "seu nome de usuário", de: "deinen Benutzernamen" },
  "username.submit": { fr: "Analyser mon profil", en: "Analyze my profile", es: "Analizar mi perfil", pt: "Analisar meu perfil", de: "Mein Profil analysieren" },
  "username.privacy": { fr: "Tes données restent privées et sécurisées", en: "Your data stays private and secure", es: "Tus datos permanecen privados y seguros", pt: "Seus dados permanecem privados e seguros", de: "Deine Daten bleiben privat und sicher" },

  // ===== ScanLoading =====
  "scan.title": { fr: "L'IA analyse", en: "AI is analyzing", es: "La IA analiza", pt: "A IA analisa", de: "KI analysiert" },
  "scan.subtitle": { fr: "Scan {platform} en cours…", en: "{platform} scan in progress…", es: "Escaneo {platform} en curso…", pt: "Escaneamento {platform} em andamento…", de: "{platform}-Scan läuft…" },
  "scan.step1": { fr: "L'IA se connecte au profil", en: "AI connects to profile", es: "La IA se conecta al perfil", pt: "A IA se conecta ao perfil", de: "KI verbindet sich mit dem Profil" },
  "scan.step2": { fr: "Récupération des données", en: "Retrieving data", es: "Recuperando datos", pt: "Recuperando dados", de: "Daten werden abgerufen" },
  "scan.step3": { fr: "L'IA analyse l'engagement", en: "AI analyzes engagement", es: "La IA analiza el engagement", pt: "A IA analisa o engajamento", de: "KI analysiert Engagement" },
  "scan.step4": { fr: "Calcul du potentiel viral", en: "Calculating viral potential", es: "Calculando potencial viral", pt: "Calculando potencial viral", de: "Virales Potenzial wird berechnet" },
  "scan.completed": { fr: "complété", en: "completed", es: "completado", pt: "concluído", de: "abgeschlossen" },
  "scan.secure": { fr: "Analyse IA sécurisée", en: "Secure AI analysis", es: "Análisis IA seguro", pt: "Análise IA segura", de: "Sichere KI-Analyse" },
  "scan.errorCheck": { fr: "Vérifie le nom d'utilisateur et réessaie", en: "Check your username and try again", es: "Verifica tu nombre de usuario e inténtalo de nuevo", pt: "Verifique seu nome de usuário e tente novamente", de: "Prüfe deinen Benutzernamen und versuche es erneut" },
  "scan.retry": { fr: "Réessayer", en: "Retry", es: "Reintentar", pt: "Tentar novamente", de: "Erneut versuchen" },
  "scan.changeUsername": { fr: "Changer de pseudo", en: "Change username", es: "Cambiar usuario", pt: "Alterar usuário", de: "Benutzernamen ändern" },
  "scan.profileNotFound": { fr: "Profil introuvable", en: "Profile not found", es: "Perfil no encontrado", pt: "Perfil não encontrado", de: "Profil nicht gefunden" },
  "scan.scanError": { fr: "Erreur lors du scan", en: "Scan error", es: "Error durante el escaneo", pt: "Erro durante o escaneamento", de: "Fehler beim Scan" },
  "scan.privateAccount": { fr: "Ce compte est privé", en: "This account is private", es: "Esta cuenta es privada", pt: "Esta conta é privada", de: "Dieses Konto ist privat" },
  "scan.timeout": { fr: "Le scan a pris trop de temps", en: "Scan took too long", es: "El escaneo tardó demasiado", pt: "O escaneamento demorou demais", de: "Scan hat zu lange gedauert" },
  "scan.serverError": { fr: "Impossible de contacter le serveur", en: "Unable to contact server", es: "No se pudo contactar el servidor", pt: "Não foi possível contatar o servidor", de: "Server nicht erreichbar" },

  // ===== ProfileConfirm =====
  "profile.detected": { fr: "Profil {platform} détecté", en: "{platform} profile detected", es: "Perfil {platform} detectado", pt: "Perfil {platform} detectado", de: "{platform}-Profil erkannt" },
  "profile.followers": { fr: "Abonnés", en: "Followers", es: "Seguidores", pt: "Seguidores", de: "Follower" },
  "profile.videos": { fr: "Vidéos", en: "Videos", es: "Videos", pt: "Vídeos", de: "Videos" },
  "profile.isThisYou": { fr: "C'est bien ton compte ?", en: "Is this your account?", es: "¿Es tu cuenta?", pt: "É a sua conta?", de: "Ist das dein Konto?" },
  "profile.confirm": { fr: "Oui, c'est moi", en: "Yes, that's me", es: "Sí, soy yo", pt: "Sim, sou eu", de: "Ja, das bin ich" },
  "profile.goBack": { fr: "Non, revenir en arrière", en: "No, go back", es: "No, volver atrás", pt: "Não, voltar", de: "Nein, zurück" },

  // ===== ServiceSelect =====
  "service.composeTitle": { fr: "Compose ton", en: "Build your", es: "Arma tu", pt: "Monte seu", de: "Stell dir dein" },
  "service.pack": { fr: "pack", en: "pack", es: "pack", pt: "pacote", de: "Paket" },
  "service.composeSubtitle": { fr: "Choisis dans chaque catégorie — ou prends un combo", en: "Choose from each category — or pick a combo", es: "Elige en cada categoría — o toma un combo", pt: "Escolha em cada categoria — ou pegue um combo", de: "Wähle aus jeder Kategorie — oder nimm ein Kombi-Paket" },
  "service.combosSoon": { fr: "Nos packs combo arrivent bientôt !", en: "Combo packs coming soon!", es: "¡Nuestros combos llegan pronto!", pt: "Nossos combos chegam em breve!", de: "Unsere Combo-Pakete kommen bald!" },
  "service.orCompose": { fr: "ou compose toi-même", en: "or build your own", es: "o arma el tuyo", pt: "ou monte o seu", de: "oder stelle dein eigenes zusammen" },
  "service.top": { fr: "Top", en: "Top", es: "Top", pt: "Top", de: "Top" },
  "service.yourCart": { fr: "Ton panier", en: "Your cart", es: "Tu carrito", pt: "Seu carrinho", de: "Dein Warenkorb" },
  "service.total": { fr: "Total", en: "Total", es: "Total", pt: "Total", de: "Gesamt" },
  "service.checkout": { fr: "Payer", en: "Pay", es: "Pagar", pt: "Pagar", de: "Bezahlen" },
  "service.emptyCart": { fr: "Choisis un pack", en: "Pick a pack", es: "Elige un pack", pt: "Escolha um pacote", de: "Wähle ein Paket" },
  "service.boostTip": { fr: "Booste tes résultats en combinant :", en: "Boost your results by combining:", es: "Potencia tus resultados combinando:", pt: "Potencialize seus resultados combinando:", de: "Verstärke deine Ergebnisse durch Kombination:" },
  "service.addAlso": { fr: "Ajoute aussi des", en: "Also add", es: "Agrega también", pt: "Adicione também", de: "Füge auch hinzu" },
  "service.discountHint": { fr: "-10% automatique en ajoutant 2 services ou plus", en: "-10% automatic when adding 2+ services", es: "-10% automático al agregar 2+ servicios", pt: "-10% automático ao adicionar 2+ serviços", de: "-10% automatisch ab 2 Services" },
  "service.discountApplied": { fr: "-10% appliqué ! Tu combines 2+ services", en: "-10% applied! You're combining 2+ services", es: "¡-10% aplicado! Combinas 2+ servicios", pt: "-10% aplicado! Você combina 2+ serviços", de: "-10% angewendet! Du kombinierst 2+ Services" },
  "service.toastMsg": { fr: "Les profils qui combinent avec des {service} grandissent 2x plus vite — et c'est -10% auto !", en: "Profiles that combine with {service} grow 2x faster — and it's -10% auto!", es: "Los perfiles que combinan con {service} crecen 2x más rápido — ¡y es -10% auto!", pt: "Perfis que combinam com {service} crescem 2x mais rápido — e é -10% auto!", de: "Profile mit {service} wachsen 2x schneller — plus -10% automatisch!" },
  "service.toastCta": { fr: "Voir les", en: "See", es: "Ver", pt: "Ver", de: "Anzeigen" },
  "service.usernameRequired": { fr: "Entre ton @username pour continuer", en: "Enter your @username to continue", es: "Ingresa tu @usuario para continuar", pt: "Digite seu @usuário para continuar", de: "Gib deinen @Benutzernamen ein, um fortzufahren" },
  "service.selectAtLeast": { fr: "Sélectionne au moins un pack", en: "Select at least one pack", es: "Selecciona al menos un pack", pt: "Selecione pelo menos um pacote", de: "Wähle mindestens ein Paket" },
  "service.backToProfile": { fr: "Retour", en: "Back", es: "Volver", pt: "Voltar", de: "Zurück" },
  "service.usernamePlaceholder": { fr: "Ton nom d'utilisateur", en: "Your username", es: "Tu nombre de usuario", pt: "Seu nome de usuário", de: "Dein Benutzername" },
  "service.usernameLabel": { fr: "Compte à booster", en: "Account to boost", es: "Cuenta a impulsar", pt: "Conta para impulsionar", de: "Profil zum Boosten" },
  "service.igPublicHint": { fr: "⚠️ Ton compte Instagram doit être public", en: "⚠️ Your Instagram account must be public", es: "⚠️ Tu cuenta de Instagram debe ser pública", pt: "⚠️ Sua conta do Instagram deve ser pública", de: "⚠️ Dein Instagram-Profil muss öffentlich sein" },
  "service.youtubeUrlLabel": { fr: "Vidéo YouTube à booster", en: "YouTube video to boost", es: "Video de YouTube a impulsar", pt: "Vídeo do YouTube para impulsionar", de: "YouTube-Video zum Boosten" },
  "service.youtubeUrlPlaceholder": { fr: "Colle l'URL de ta vidéo YouTube", en: "Paste your YouTube video URL", es: "Pega la URL de tu video de YouTube", pt: "Cole a URL do seu vídeo do YouTube", de: "Füge die URL deines YouTube-Videos ein" },
  "service.youtubeUrlInvalid": { fr: "Lien invalide ou vidéo introuvable", en: "Invalid link or video not found", es: "Enlace inválido o video no encontrado", pt: "Link inválido ou vídeo não encontrado", de: "Ungültiger Link oder Video nicht gefunden" },
  "service.youtubeUrlRequired": { fr: "Colle l'URL de ta vidéo YouTube pour continuer", en: "Paste your YouTube video URL to continue", es: "Pega la URL de tu video para continuar", pt: "Cole a URL do seu vídeo para continuar", de: "Füge die URL deines Videos ein, um fortzufahren" },
  "service.ordersThisWeek": { fr: "commandes cette semaine", en: "orders this week", es: "pedidos esta semana", pt: "pedidos esta semana", de: "Bestellungen diese Woche" },
  "service.trustReal": { fr: "Vrais comptes", en: "Real accounts", es: "Cuentas reales", pt: "Contas reais", de: "Echte Konten" },
  "service.trustFast": { fr: "Livraison rapide", en: "Fast delivery", es: "Entrega rápida", pt: "Entrega rápida", de: "Schnelle Lieferung" },
  "service.trustNoPassword": { fr: "Sans mot de passe", en: "No password needed", es: "Sin contraseña", pt: "Sem senha", de: "Kein Passwort nötig" },
  "service.guarantee": { fr: "Garanti 30j — Relivraison gratuite", en: "30-day guarantee — Free redelivery", es: "Garantía 30 días — Reenvío gratis", pt: "Garantia 30 dias — Reenvio grátis", de: "30-Tage-Garantie — Kostenlose Nachlieferung" },
  "service.aiReco": { fr: "Recommandation pour", en: "Recommendation for", es: "Recomendación para", pt: "Recomendação para", de: "Empfehlung für" },
  "service.aiRecoFollowers": { fr: "Avec {count} followers, booste ta crédibilité avec un pack followers pour attirer plus d'engagement.", en: "With {count} followers, boost your credibility with a followers pack to attract more engagement.", es: "Con {count} seguidores, impulsa tu credibilidad con un pack de seguidores para atraer más interacciones.", pt: "Com {count} seguidores, aumente sua credibilidade com um pacote de seguidores para atrair mais engajamento.", de: "Mit {count} Followern steigerst du deine Glaubwürdigkeit — hol dir ein Follower-Paket für mehr Engagement." },
  "service.aiRecoLikes": { fr: "Ton ratio likes/followers est faible — un boost de likes augmentera ton taux d'engagement.", en: "Your likes/followers ratio is low — a likes boost will increase your engagement rate.", es: "Tu ratio likes/seguidores es bajo — un boost de likes aumentará tu tasa de engagement.", pt: "Sua proporção likes/seguidores é baixa — um boost de likes aumentará sua taxa de engajamento.", de: "Dein Like-Follower-Verhältnis ist niedrig — ein Like-Boost steigert deine Engagement-Rate." },
  "service.aiRecoCombo": { fr: "Ton profil est prêt pour un pack combo — followers + likes + vues pour un boost complet.", en: "Your profile is ready for a combo pack — followers + likes + views for a full boost.", es: "Tu perfil está listo para un pack combo — seguidores + likes + vistas para un impulso completo.", pt: "Seu perfil está pronto para um pacote combo — seguidores + likes + visualizações para um boost completo.", de: "Dein Profil ist bereit für ein Kombi-Paket — Follower + Likes + Views für einen kompletten Boost." },
  "service.aiRecoSelect": { fr: "Sélectionner ce pack", en: "Select this pack", es: "Seleccionar este pack", pt: "Selecionar este pacote", de: "Dieses Paket wählen" },

  // ===== Spotify =====
  "spotify.heroTitle1": { fr: "Fais grandir ta", en: "Grow your", es: "Haz crecer tu", pt: "Faça crescer sua", de: "Lass deine Musik" },
  "spotify.heroTitle2": { fr: "musique sur", en: "music on", es: "música en", pt: "música no", de: "wachsen auf" },
  "spotify.heroHighlight": { fr: "Spotify", en: "Spotify", es: "Spotify", pt: "Spotify", de: "Spotify" },
  "spotify.subtitle1": { fr: "Touche plus d'auditeurs réels et débloque une meilleure visibilité algorithmique.", en: "Reach more real listeners and unlock better algorithm visibility.", es: "Llega a más oyentes reales y desbloquea mejor visibilidad algorítmica.", pt: "Alcance mais ouvintes reais e melhore sua visibilidade algorítmica.", de: "Erreiche mehr echte Hörer und verbessere deine Algorithmus-Sichtbarkeit." },
  "spotify.subtitle2": { fr: "Mets ton morceau devant une audience engagée et fais décoller ta carrière.", en: "Get your track in front of an engaged audience and grow your career.", es: "Pon tu canción frente a una audiencia comprometida y haz despegar tu carrera.", pt: "Coloque sua música diante de uma audiência engajada e impulsione sua carreira.", de: "Bring deinen Track vor ein engagiertes Publikum und starte deine Karriere durch." },
  "spotify.delivery": { fr: "Campagne lancée sous 24-72h", en: "Campaign starts within 24-72h", es: "Campaña inicia en 24-72h", pt: "Campanha inicia em 24-72h", de: "Kampagne startet in 24-72h" },
  "spotify.trackLabel": { fr: "Lien du morceau Spotify", en: "Spotify track link", es: "Enlace del tema en Spotify", pt: "Link da música no Spotify", de: "Spotify-Track-Link" },
  "spotify.trackPlaceholder": { fr: "https://open.spotify.com/track/...", en: "https://open.spotify.com/track/...", es: "https://open.spotify.com/track/...", pt: "https://open.spotify.com/track/...", de: "https://open.spotify.com/track/..." },
  "spotify.trackRequired": { fr: "Colle le lien de ton track Spotify", en: "Paste your Spotify track link", es: "Pega el enlace de tu tema de Spotify", pt: "Cole o link da sua música do Spotify", de: "Füge deinen Spotify-Track-Link ein" },
  "spotify.pickPack": { fr: "Choisis la taille de ta campagne", en: "Choose your campaign size", es: "Elige el tamaño de tu campaña", pt: "Escolha o tamanho da sua campanha", de: "Wähle deine Kampagnengröße" },
  "spotify.streams": { fr: "Streams", en: "Streams", es: "Streams", pt: "Streams", de: "Streams" },
  "spotify.startingAt": { fr: "À partir de", en: "Starting at", es: "Desde", pt: "A partir de", de: "Ab" },
  "spotify.cta": { fr: "Promouvoir mon morceau", en: "Promote my track", es: "Promocionar mi tema", pt: "Promover minha música", de: "Meinen Track promoten" },
  "spotify.social": { fr: "morceaux promus", en: "tracks promoted", es: "temas promocionados", pt: "músicas promovidas", de: "Tracks promotet" },
  "spotify.howItWorks.step1.title": { fr: "Colle ton lien", en: "Paste your link", es: "Pega tu enlace", pt: "Cole seu link", de: "Füge deinen Link ein" },
  "spotify.howItWorks.step1.desc": { fr: "Copie le lien de ton morceau Spotify et colle-le dans le champ prévu.", en: "Copy your Spotify track link and paste it in the field.", es: "Copia el enlace de tu tema de Spotify y pégalo en el campo.", pt: "Copie o link da sua música do Spotify e cole no campo.", de: "Kopiere deinen Spotify-Track-Link und füge ihn ein." },
  "spotify.howItWorks.step2.title": { fr: "Choisis ton pack", en: "Choose your pack", es: "Elige tu pack", pt: "Escolha seu pacote", de: "Wähle dein Paket" },
  "spotify.howItWorks.step2.desc": { fr: "Choisis la taille de campagne adaptée à tes objectifs de croissance.", en: "Pick the campaign size that fits your growth goals.", es: "Elige el tamaño de campaña adecuado a tus objetivos de crecimiento.", pt: "Escolha o tamanho de campanha adequado aos seus objetivos de crescimento.", de: "Wähle die Kampagnengröße passend zu deinen Wachstumszielen." },
  "spotify.howItWorks.step3.title": { fr: "Vois ton audience grandir", en: "Watch your audience grow", es: "Ve crecer tu audiencia", pt: "Veja sua audiência crescer", de: "Sieh dein Publikum wachsen" },
  "spotify.howItWorks.step3.desc": { fr: "De vrais auditeurs découvrent ton morceau progressivement et naturellement sous 24-72h.", en: "Real listeners discover your track progressively and naturally within 24-72h.", es: "Oyentes reales descubren tu tema progresiva y naturalmente en 24-72h.", pt: "Ouvintes reais descobrem sua música progressiva e naturalmente em 24-72h.", de: "Echte Hörer entdecken deinen Track progressiv und natürlich in 24-72h." },
  "spotify.faq.q1": { fr: "Les auditeurs sont-ils réels ?", en: "Are listeners real?", es: "¿Los oyentes son reales?", pt: "Os ouvintes são reais?", de: "Sind die Hörer echt?" },
  "spotify.faq.a1": { fr: "Oui — de vrais comptes Spotify découvrent ton morceau via des campagnes ciblées, avec une écoute naturelle et progressive pour respecter l'algorithme.", en: "Yes — real Spotify accounts discover your track through targeted campaigns, listening naturally and progressively to respect the algorithm.", es: "Sí — cuentas reales de Spotify descubren tu tema mediante campañas dirigidas, con escucha natural y progresiva para respetar el algoritmo.", pt: "Sim — contas reais do Spotify descobrem sua música por meio de campanhas direcionadas, com escuta natural e progressiva para respeitar o algoritmo.", de: "Ja — echte Spotify-Konten entdecken deinen Track durch gezielte Kampagnen, mit natürlichem und progressivem Hören, um den Algorithmus zu respektieren." },
  "spotify.faq.q2": { fr: "Est-ce que c'est sûr pour mon compte ?", en: "Is it safe for my account?", es: "¿Es seguro para mi cuenta?", pt: "É seguro para minha conta?", de: "Ist das sicher für mein Konto?" },
  "spotify.faq.a2": { fr: "Absolument. Nous ne demandons aucun accès à ton compte. Il suffit du lien de ton morceau.", en: "Absolutely. We don't ask for any access to your account. We just need your track link.", es: "Absolutamente. No pedimos ningún acceso a tu cuenta. Solo necesitamos el enlace de tu tema.", pt: "Absolutamente. Não pedimos nenhum acesso à sua conta. Só precisamos do link da sua música.", de: "Absolut. Wir brauchen keinen Zugang zu deinem Konto. Nur deinen Track-Link." },
  "spotify.faq.q3": { fr: "En combien de temps la campagne démarre ?", en: "How fast does the campaign start?", es: "¿En cuánto tiempo inicia la campaña?", pt: "Em quanto tempo a campanha inicia?", de: "Wie schnell startet die Kampagne?" },
  "spotify.faq.a3": { fr: "La campagne démarre sous quelques heures et se déploie progressivement sur 24 à 72h pour un rendu naturel.", en: "Campaigns start within hours and roll out progressively over 24-72h for a natural result.", es: "La campaña inicia en horas y se despliega progresivamente en 24-72h para un resultado natural.", pt: "A campanha inicia em horas e acontece progressivamente em 24-72h para um resultado natural.", de: "Die Kampagne startet in Stunden und läuft progressiv über 24-72h für ein natürliches Ergebnis." },
  "spotify.faq.q4": { fr: "Que se passe-t-il si les résultats baissent ?", en: "What if results drop?", es: "¿Qué pasa si los resultados bajan?", pt: "E se os resultados caírem?", de: "Was passiert, wenn die Ergebnisse zurückgehen?" },
  "spotify.faq.a4": { fr: "On garantit nos campagnes pendant 30 jours. En cas de baisse, on relance la campagne gratuitement.", en: "We back our campaigns for 30 days. If results drop, we re-run the campaign at no extra cost.", es: "Respaldamos nuestras campañas durante 30 días. Si los resultados bajan, relanzamos sin costo adicional.", pt: "Garantimos nossas campanhas por 30 dias. Se os resultados caírem, relançamos sem custo adicional.", de: "Wir garantieren unsere Kampagnen 30 Tage lang. Bei Rückgang starten wir die Kampagne kostenlos neu." },
  "spotify.modeSearch": { fr: "Rechercher un son", en: "Search a track", es: "Buscar un tema", pt: "Buscar uma música", de: "Track suchen" },
  "spotify.modeLink": { fr: "Coller un lien", en: "Paste a link", es: "Pegar un enlace", pt: "Colar um link", de: "Link einfügen" },
  "spotify.searchPlaceholder": { fr: "Nom du son + artiste", en: "Track name + artist", es: "Nombre del tema + artista", pt: "Nome da música + artista", de: "Trackname + Künstler" },
  "spotify.searching": { fr: "Recherche en cours...", en: "Searching...", es: "Buscando...", pt: "Buscando...", de: "Suche läuft..." },
  "spotify.trackNotFound": { fr: "Aucun résultat trouvé", en: "No results found", es: "Sin resultados", pt: "Nenhum resultado encontrado", de: "Keine Ergebnisse gefunden" },
  "spotify.trackConfirm": { fr: "C'est bien ce morceau ?", en: "Is this the right track?", es: "¿Es este el tema correcto?", pt: "É essa a música certa?", de: "Ist das der richtige Track?" },
  "spotify.trackChange": { fr: "Changer", en: "Change", es: "Cambiar", pt: "Alterar", de: "Ändern" },

  // ===== PostPicker =====
  "posts.loading": { fr: "Chargement de tes posts...", en: "Loading your posts...", es: "Cargando tus posts...", pt: "Carregando seus posts...", de: "Deine Posts werden geladen..." },
  "posts.title": { fr: "Choisis tes", en: "Choose your", es: "Elige tus", pt: "Escolha seus", de: "Wähle deine" },
  "posts.posts": { fr: "posts", en: "posts", es: "posts", pt: "posts", de: "Posts" },
  "posts.whichPosts": { fr: "Sur quels posts veux-tu recevoir tes", en: "Which posts do you want to receive your", es: "En cuáles posts quieres recibir tus", pt: "Em quais posts você quer receber seus", de: "Auf welche Posts willst du deine" },
  "posts.selected": { fr: "sélectionné", en: "selected", es: "seleccionado", pt: "selecionado", de: "ausgewählt" },
  "posts.distributed": { fr: "seront répartis équitablement", en: "will be distributed equally", es: "se distribuirán equitativamente", pt: "serão distribuídos igualmente", de: "werden gleichmäßig verteilt" },
  "posts.selectAll": { fr: "Tout sélectionner", en: "Select all", es: "Seleccionar todo", pt: "Selecionar tudo", de: "Alle auswählen" },
  "posts.deselectAll": { fr: "Tout désélectionner", en: "Deselect all", es: "Deseleccionar todo", pt: "Desmarcar tudo", de: "Alle abwählen" },
  "posts.noPosts": { fr: "Aucun post récupéré pour ce profil.", en: "No posts found for this profile.", es: "No se encontraron posts para este perfil.", pt: "Nenhum post encontrado para este perfil.", de: "Keine Posts für dieses Profil gefunden." },
  "posts.fetchFailed": { fr: "Impossible de récupérer tes posts. Vérifie ton nom d'utilisateur ou réessaie.", en: "Unable to fetch your posts. Check your username or try again.", es: "No se pudieron obtener tus posts. Verifica tu nombre de usuario o inténtalo de nuevo.", pt: "Não foi possível obter seus posts. Verifique seu nome de usuário ou tente novamente.", de: "Deine Posts konnten nicht abgerufen werden. Überprüfe deinen Benutzernamen oder versuche es erneut." },
  "posts.validate": { fr: "Valider", en: "Confirm", es: "Validar", pt: "Validar", de: "Bestätigen" },
  "posts.selectAtLeast": { fr: "Sélectionne au moins un post", en: "Select at least one post", es: "Selecciona al menos un post", pt: "Selecione pelo menos um post", de: "Wähle mindestens einen Post" },
  "posts.editCart": { fr: "Modifier mon panier", en: "Edit my cart", es: "Editar mi carrito", pt: "Editar meu carrinho", de: "Warenkorb bearbeiten" },

  // ===== CheckoutForm =====
  "checkout.summary": { fr: "Récapitulatif", en: "Summary", es: "Resumen", pt: "Resumo", de: "Übersicht" },
  "checkout.discount": { fr: "Réduction", en: "Discount", es: "Descuento", pt: "Desconto", de: "Rabatt" },
  "checkout.promoLabel": { fr: "Code promo (optionnel)", en: "Promo code (optional)", es: "Código promo (opcional)", pt: "Código promo (opcional)", de: "Promo-Code (optional)" },
  "checkout.apply": { fr: "Appliquer", en: "Apply", es: "Aplicar", pt: "Aplicar", de: "Anwenden" },
  "checkout.invalidCode": { fr: "Code invalide ou expiré", en: "Invalid or expired code", es: "Código inválido o expirado", pt: "Código inválido ou expirado", de: "Ungültiger oder abgelaufener Code" },
  "checkout.applied": { fr: "appliqué !", en: "applied!", es: "¡aplicado!", pt: "aplicado!", de: "angewendet!" },
  "checkout.emailLabel": { fr: "Adresse e-mail", en: "Email address", es: "Correo electrónico", pt: "Endereço de e-mail", de: "E-Mail-Adresse" },
  "checkout.emailInvalid": { fr: "Entre une adresse e-mail valide", en: "Enter a valid email address", es: "Ingresa un correo válido", pt: "Digite um e-mail válido", de: "Gib eine gültige E-Mail-Adresse ein" },
  "checkout.loyaltyUsePoints": { fr: "Utilise 500 pts pour -5€", en: "Use 500 pts for -€5", es: "Usa 500 pts por -5€", pt: "Use 500 pts por -5€", de: "500 Punkte für -5€ einlösen" },
  "checkout.loyaltyApplied": { fr: "-5€ appliqué !", en: "-€5 applied!", es: "¡-5€ aplicado!", pt: "-5€ aplicado!", de: "-5€ angewendet!" },
  "checkout.loyaltyRemaining": { fr: "pts restants", en: "pts remaining", es: "pts restantes", pt: "pts restantes", de: "Punkte übrig" },
  "checkout.loyaltyUse": { fr: "Utiliser", en: "Use", es: "Usar", pt: "Usar", de: "Einlösen" },
  "checkout.paymentSecure": { fr: "Paiement", en: "Payment", es: "Pago", pt: "Pagamento", de: "Zahlung" },
  "checkout.secureLabel": { fr: "sécurisé", en: "secure", es: "seguro", pt: "seguro", de: "sicher" },
  "checkout.poweredByStripe": { fr: "Propulsé par Stripe — tes données sont chiffrées", en: "Powered by Stripe — your data is encrypted", es: "Con tecnología Stripe — tus datos están cifrados", pt: "Powered by Stripe — seus dados são criptografados", de: "Powered by Stripe — deine Daten sind verschlüsselt" },
  "checkout.orPayByCard": { fr: "ou payer par carte", en: "or pay by card", es: "o pagar con tarjeta", pt: "ou pagar com cartão", de: "oder mit Karte bezahlen" },
  "checkout.paymentError": { fr: "Erreur de paiement", en: "Payment error", es: "Error de pago", pt: "Erro de pagamento", de: "Zahlungsfehler" },
  "checkout.processing": { fr: "Paiement en cours...", en: "Processing payment...", es: "Procesando pago...", pt: "Processando pagamento...", de: "Zahlung wird verarbeitet..." },
  "checkout.pay": { fr: "Payer", en: "Pay", es: "Pagar", pt: "Pagar", de: "Bezahlen" },
  "checkout.emailRequired": { fr: "Entre ton e-mail ci-dessus pour accéder au paiement", en: "Enter your email above to access payment", es: "Ingresa tu correo arriba para acceder al pago", pt: "Digite seu e-mail acima para acessar o pagamento", de: "Gib oben deine E-Mail ein, um zur Zahlung zu gelangen" },
  "checkout.back": { fr: "Retour", en: "Back", es: "Volver", pt: "Voltar", de: "Zurück" },

  // ===== Upsell =====
  "upsell.add": { fr: "Ajoute", en: "Add", es: "Agrega", pt: "Adicione", de: "Füge hinzu" },
  "upsell.onlyFor": { fr: "pour seulement", en: "for only", es: "por solo", pt: "por apenas", de: "für nur" },
  "upsell.addBtn": { fr: "Ajouter", en: "Add", es: "Agregar", pt: "Adicionar", de: "Hinzufügen" },
  "checkout.emailToUnlock": { fr: "Renseigne ton email ci-dessus pour accéder aux options de paiement", en: "Enter your email above to access payment options", es: "Ingresa tu correo arriba para acceder a las opciones de pago", pt: "Digite seu e-mail acima para acessar as opções de pagamento", de: "Gib oben deine E-Mail ein, um die Zahlungsoptionen freizuschalten" },
  "checkout.preparingPayment": { fr: "Préparation du paiement...", en: "Preparing payment...", es: "Preparando pago...", pt: "Preparando pagamento...", de: "Zahlung wird vorbereitet..." },
  "checkout.serverError": { fr: "Impossible de contacter le serveur de paiement.", en: "Unable to contact payment server.", es: "No se pudo contactar el servidor de pago.", pt: "Não foi possível contatar o servidor de pagamento.", de: "Zahlungsserver nicht erreichbar." },
  "checkout.trustSecure": { fr: "Paiement 100% sécurisé", en: "100% secure payment", es: "Pago 100% seguro", pt: "Pagamento 100% seguro", de: "100% sichere Zahlung" },
  "checkout.trustDelivery": { fr: "Livraison sous 24h", en: "Delivery within 24h", es: "Entrega en 24h", pt: "Entrega em 24h", de: "Lieferung in 24h" },
  "checkout.trustGuarantee": { fr: "Satisfait ou remboursé", en: "Satisfaction guaranteed", es: "Satisfecho o reembolsado", pt: "Satisfeito ou reembolsado", de: "Zufrieden oder Geld zurück" },
  "checkout.trustSupport": { fr: "Support 7j/7", en: "24/7 support", es: "Soporte 24/7", pt: "Suporte 24/7", de: "Support rund um die Uhr" },
  "checkout.urgencyOffer": { fr: "Offre spéciale expire dans", en: "Special offer expires in", es: "Oferta especial expira en", pt: "Oferta especial expira em", de: "Sonderangebot endet in" },

  // ===== SuccessPage =====
  "success.title": { fr: "Paiement réussi !", en: "Payment successful!", es: "¡Pago exitoso!", pt: "Pagamento realizado!", de: "Zahlung erfolgreich!" },
  "success.orderRegistered": { fr: "Ta commande pour", en: "Your order for", es: "Tu pedido para", pt: "Seu pedido para", de: "Deine Bestellung für" },
  "success.orderRegistered2": { fr: "a été enregistrée. Tu recevras tes résultats très bientôt.", en: "has been registered. You'll receive your results very soon.", es: "ha sido registrado. Recibirás tus resultados muy pronto.", pt: "foi registrado. Você receberá seus resultados em breve.", de: "wurde registriert. Du erhältst deine Ergebnisse sehr bald." },
  "success.giftTitle": { fr: "Cadeau pour ta prochaine commande", en: "Gift for your next order", es: "Regalo para tu próximo pedido", pt: "Presente para seu próximo pedido", de: "Geschenk für deine nächste Bestellung" },
  "success.offNextOrder": { fr: "sur ta prochaine commande", en: "off your next order", es: "en tu próximo pedido", pt: "no seu próximo pedido", de: "auf deine nächste Bestellung" },
  "success.expiresIn": { fr: "Expire dans", en: "Expires in", es: "Expira en", pt: "Expira em", de: "Läuft ab in" },
  "success.expired": { fr: "Expiré", en: "Expired", es: "Expirado", pt: "Expirado", de: "Abgelaufen" },
  "success.codeCopied": { fr: "Code copié !", en: "Code copied!", es: "¡Código copiado!", pt: "Código copiado!", de: "Code kopiert!" },
  "success.clickToCopy": { fr: "Clique sur le code pour le copier", en: "Click the code to copy it", es: "Haz clic en el código para copiarlo", pt: "Clique no código para copiá-lo", de: "Klicke auf den Code, um ihn zu kopieren" },
  "success.generatingPromo": { fr: "Génération de ton code promo...", en: "Generating your promo code...", es: "Generando tu código promo...", pt: "Gerando seu código promo...", de: "Dein Promo-Code wird generiert..." },
  "success.trackOrder": { fr: "Suivre ma commande", en: "Track my order", es: "Seguir mi pedido", pt: "Acompanhar meu pedido", de: "Meine Bestellung verfolgen" },
  "success.viewAllOrders": { fr: "Voir toutes mes commandes", en: "View all my orders", es: "Ver todos mis pedidos", pt: "Ver todos os meus pedidos", de: "Alle meine Bestellungen ansehen" },
  "success.newAnalysis": { fr: "Nouvelle analyse", en: "New analysis", es: "Nuevo análisis", pt: "Nova análise", de: "Neue Analyse" },

  // ===== Post-purchase Upsell =====
  "upsell.title": { fr: "Booste tes résultats", en: "Boost your results", es: "Potencia tus resultados", pt: "Potencialize seus resultados", de: "Verstärke deine Ergebnisse" },
  "upsell.followers": { fr: "Followers", en: "Followers", es: "Seguidores", pt: "Seguidores", de: "Follower" },
  "upsell.likes": { fr: "Likes", en: "Likes", es: "Likes", pt: "Curtidas", de: "Likes" },
  "upsell.views": { fr: "Vues", en: "Views", es: "Vistas", pt: "Visualizações", de: "Aufrufe" },
  "upsell.subscribers": { fr: "Abonnés", en: "Subscribers", es: "Suscriptores", pt: "Inscritos", de: "Abonnenten" },
  "upsell.retweets": { fr: "Retweets", en: "Retweets", es: "Retweets", pt: "Retweets", de: "Retweets" },
  "upsell.viewers": { fr: "Viewers live", en: "Live viewers", es: "Espectadores en vivo", pt: "Espectadores ao vivo", de: "Live-Zuschauer" },
  "upsell.pitch.followers": { fr: "2x plus d'impact avec une audience plus large", en: "2x more impact with a bigger audience", es: "2x más impacto con una audiencia más grande", pt: "2x mais impacto com uma audiência maior", de: "2x mehr Impact mit einer größeren Audience" },
  "upsell.pitch.likes": { fr: "Booste ton engagement et ta visibilité", en: "Boost your engagement and visibility", es: "Potencia tu engagement y visibilidad", pt: "Impulsione seu engajamento e visibilidade", de: "Steigere dein Engagement und deine Sichtbarkeit" },
  "upsell.pitch.views": { fr: "Plus de vues = plus de portée algorithmique", en: "More views = more algorithmic reach", es: "Más vistas = más alcance algorítmico", pt: "Mais views = mais alcance algorítmico", de: "Mehr Aufrufe = mehr algorithmische Reichweite" },
  "upsell.pitch.subscribers": { fr: "Plus d'abonnés pour une chaîne plus crédible", en: "More subscribers for a more credible channel", es: "Más suscriptores para un canal más creíble", pt: "Mais inscritos para um canal mais confiável", de: "Mehr Abonnenten für einen glaubwürdigeren Kanal" },
  "upsell.pitch.ytLikes": { fr: "Les likes boostent le classement de ta vidéo", en: "Likes boost your video ranking", es: "Los likes impulsan el ranking de tu video", pt: "Curtidas impulsionam o ranking do seu vídeo", de: "Likes steigern das Ranking deines Videos" },
  "upsell.pitch.ytViews": { fr: "Plus de vues = plus de recommandations YouTube", en: "More views = more YouTube recommendations", es: "Más vistas = más recomendaciones de YouTube", pt: "Mais views = mais recomendações do YouTube", de: "Mehr Aufrufe = mehr YouTube-Empfehlungen" },
  "upsell.pitch.retweets": { fr: "Les retweets multiplient ta portée organique", en: "Retweets multiply your organic reach", es: "Los retweets multiplican tu alcance orgánico", pt: "Retweets multiplicam seu alcance orgânico", de: "Retweets vervielfachen deine organische Reichweite" },
  "upsell.pitch.viewers": { fr: "Plus de viewers = meilleur classement sur Twitch", en: "More viewers = better Twitch ranking", es: "Más espectadores = mejor ranking en Twitch", pt: "Mais espectadores = melhor ranking na Twitch", de: "Mehr Zuschauer = besseres Twitch-Ranking" },

  // ===== YouTube HomePage =====
  "yt.hero.title1": { fr: "Notre IA booste", en: "Our AI boosts", es: "Nuestra IA impulsa", pt: "Nossa IA impulsiona", de: "Unsere KI beschleunigt" },
  "yt.hero.title2": { fr: "la croissance de votre vidéo", en: "your video growth", es: "el crecimiento de tu video", pt: "o crescimento do seu vídeo", de: "das Wachstum deines Videos" },
  "yt.hero.subtitle1": { fr: "Notre IA scanne ta vidéo et te propose", en: "Our AI scans your video and suggests", es: "Nuestra IA escanea tu video y te propone", pt: "Nossa IA analisa seu vídeo e sugere", de: "Unsere KI scannt dein Video und schlägt vor" },
  "yt.hero.subtitle2": { fr: "une stratégie de croissance personnalisée", en: "a personalized growth strategy", es: "una estrategia de crecimiento personalizada", pt: "uma estratégia de crescimento personalizada", de: "eine personalisierte Wachstumsstrategie" },
  "yt.hero.cta": { fr: "Lancer la croissance →", en: "Start my growth →", es: "Impulsar mi crecimiento →", pt: "Iniciar meu crescimento →", de: "Mein Wachstum starten →" },
  "yt.hero.morePercent": { fr: "20% plus", en: "20% more", es: "20% más", pt: "20% mais", de: "20% mehr" },
  "yt.hero.moreProfiles": { fr: "de vidéos analysées par notre IA qu'hier", en: "more videos analyzed by our AI than yesterday", es: "más videos analizados por nuestra IA que ayer", pt: "mais vídeos analisados pela nossa IA que ontem", de: "mehr Videos von unserer KI analysiert als gestern" },
  "yt.howItWorks.step1.title": { fr: "L'IA scanne ta vidéo", en: "AI scans your video", es: "La IA escanea tu video", pt: "A IA analisa seu vídeo", de: "KI scannt dein Video" },
  "yt.howItWorks.step1.desc": { fr: "Colle le lien de ta vidéo et notre IA analyse tes stats et engagement en 30 secondes.", en: "Paste your video link and our AI analyzes your stats and engagement in 30 seconds.", es: "Pega el enlace de tu video y nuestra IA analiza tus stats y engagement en 30 segundos.", pt: "Cole o link do seu vídeo e nossa IA analisa suas stats e engajamento em 30 segundos.", de: "Füge deinen Video-Link ein und unsere KI analysiert deine Stats und Engagement in 30 Sekunden." },
  "yt.howItWorks.step2.title": { fr: "Stratégie personnalisée", en: "Personalized strategy", es: "Estrategia personalizada", pt: "Estratégia personalizada", de: "Personalisierte Strategie" },
  "yt.howItWorks.step2.desc": { fr: "L'IA te recommande un plan sur mesure adapté à ta vidéo et tes objectifs.", en: "AI recommends a custom plan adapted to your video and goals.", es: "La IA te recomienda un plan a medida adaptado a tu video y objetivos.", pt: "A IA recomenda um plano sob medida adaptado ao seu vídeo e objetivos.", de: "Die KI empfiehlt einen maßgeschneiderten Plan für dein Video und deine Ziele." },
  "yt.howItWorks.step3.title": { fr: "Croissance automatique", en: "Automatic growth", es: "Crecimiento automático", pt: "Crescimento automático", de: "Automatisches Wachstum" },
  "yt.howItWorks.step3.desc": { fr: "Résultats visibles rapidement, directement sur ta vidéo.", en: "Results visible quickly, directly on your video.", es: "Resultados visibles rápidamente, directamente en tu video.", pt: "Resultados visíveis rapidamente, diretamente no seu vídeo.", de: "Ergebnisse schnell sichtbar, direkt auf deinem Video." },
  "yt.faq.q1": { fr: "Comment l'IA analyse ma vidéo ?", en: "How does the AI analyze my video?", es: "¿Cómo analiza la IA mi video?", pt: "Como a IA analisa meu vídeo?", de: "Wie analysiert die KI mein Video?" },
  "yt.faq.a1": { fr: "Notre IA analyse les stats de ta vidéo (vues, likes, engagement) en 30 secondes et te recommande un plan de croissance adapté.", en: "Our AI analyzes your video stats (views, likes, engagement) in 30 seconds and recommends a growth plan tailored to you.", es: "Nuestra IA analiza las stats de tu video (vistas, likes, engagement) en 30 segundos y te recomienda un plan de crecimiento adaptado.", pt: "Nossa IA analisa as stats do seu vídeo (views, likes, engajamento) em 30 segundos e recomenda um plano de crescimento adaptado.", de: "Unsere KI analysiert die Stats deines Videos (Views, Likes, Engagement) in 30 Sekunden und empfiehlt einen angepassten Wachstumsplan." },
  "yt.faq.q2": { fr: "Est-ce que c'est sûr pour mon compte ?", en: "Is it safe for my account?", es: "¿Es seguro para mi cuenta?", pt: "É seguro para minha conta?", de: "Ist das sicher für mein Konto?" },
  "yt.faq.a2": { fr: "Oui. Aucun mot de passe requis, aucun accès à ton compte Google. On a juste besoin du lien de ta vidéo.", en: "Yes. No password required, no access to your Google account. We just need your video link.", es: "Sí. Sin contraseña, sin acceso a tu cuenta de Google. Solo necesitamos el enlace de tu video.", pt: "Sim. Sem senha, sem acesso à sua conta Google. Só precisamos do link do seu vídeo.", de: "Ja. Kein Passwort nötig, kein Zugang zu deinem Google-Konto. Wir brauchen nur deinen Video-Link." },
  "yt.faq.q3": { fr: "En combien de temps je vois des résultats ?", en: "How quickly will I see results?", es: "¿En cuánto tiempo veo resultados?", pt: "Em quanto tempo vejo resultados?", de: "Wie schnell sehe ich Ergebnisse?" },
  "yt.faq.a3": { fr: "Les premiers résultats sont visibles en quelques heures. Selon le pack choisi, tout est finalisé sous 24-72h.", en: "First results visible within hours. Depending on the pack chosen, everything is finalized within 24-72h.", es: "Los primeros resultados son visibles en horas. Según el pack elegido, todo se finaliza en 24-72h.", pt: "Os primeiros resultados são visíveis em horas. Dependendo do pacote, tudo é finalizado em 24-72h.", de: "Erste Ergebnisse sind in Stunden sichtbar. Je nach Paket ist alles in 24-72h abgeschlossen." },
  "yt.faq.q4": { fr: "Les résultats sont-ils durables ?", en: "Are results long-lasting?", es: "¿Los resultados son duraderos?", pt: "Os resultados são duradouros?", de: "Sind die Ergebnisse dauerhaft?" },
  "yt.faq.a4": { fr: "On mise sur une croissance progressive et stable. En cas de variation, on compense gratuitement pendant 30 jours.", en: "We focus on progressive and stable growth. In case of variation, we compensate for free for 30 days.", es: "Apostamos por un crecimiento progresivo y estable. En caso de variación, compensamos gratis durante 30 días.", pt: "Apostamos em crescimento progressivo e estável. Em caso de variação, compensamos gratuitamente por 30 dias.", de: "Wir setzen auf progressives, stabiles Wachstum. Bei Schwankungen gleichen wir 30 Tage lang kostenlos aus." },
  "yt.linkToTikTok": { fr: "Tu cherches TikTok ou Instagram ? C'est par ici", en: "Looking for TikTok or Instagram? Click here", es: "¿Buscas TikTok o Instagram? Haz clic aquí", pt: "Procurando TikTok ou Instagram? Clique aqui", de: "Suchst du TikTok oder Instagram? Hier klicken" },

  // ===== Instagram HomePage =====
  "ig.hero.title1": { fr: "Accélère ta", en: "Accelerate your", es: "Acelera tu", pt: "Acelere seu", de: "Beschleunige dein" },
  "ig.hero.title2": { fr: "croissance Instagram", en: "Instagram growth", es: "crecimiento en Instagram", pt: "crescimento no Instagram", de: "Instagram-Wachstum" },
  "ig.hero.subtitle1": { fr: "On s'occupe de ta visibilité Instagram pendant que", en: "We handle your Instagram visibility while", es: "Nos encargamos de tu visibilidad en Instagram mientras", pt: "Cuidamos da sua visibilidade no Instagram enquanto", de: "Wir kümmern uns um deine Instagram-Sichtbarkeit, während" },
  "ig.hero.subtitle2": { fr: "tu te concentres sur ton contenu.", en: "you focus on your content.", es: "tú te concentras en tu contenido.", pt: "você foca no seu conteúdo.", de: "du dich auf deinen Content konzentrierst." },
  "ig.hero.cta": { fr: "Lancer ma croissance →", en: "Start my growth →", es: "Impulsar mi crecimiento →", pt: "Iniciar meu crescimento →", de: "Mein Wachstum starten →" },
  "ig.hero.morePercent": { fr: "30% plus", en: "30% more", es: "30% más", pt: "30% mais", de: "30% mehr" },
  "ig.hero.moreProfiles": { fr: "de profils analysés par notre IA qu'hier", en: "profiles analyzed by our AI than yesterday", es: "perfiles analizados por nuestra IA que ayer", pt: "perfis analisados pela nossa IA que ontem", de: "Profile heute von unserer KI analysiert als gestern" },
  "ig.howItWorks.step1.title": { fr: "L'IA scanne ton profil", en: "AI scans your profile", es: "La IA escanea tu perfil", pt: "A IA analisa seu perfil", de: "KI scannt dein Profil" },
  "ig.howItWorks.step1.desc": { fr: "Entre ton @ et notre IA analyse tes stats, posts et engagement en 30 secondes.", en: "Enter your @ and our AI analyzes your stats, posts and engagement in 30 seconds.", es: "Ingresa tu @ y nuestra IA analiza tus stats, posts y engagement en 30 segundos.", pt: "Digite seu @ e nossa IA analisa suas stats, posts e engajamento em 30 segundos.", de: "Gib deinen @ ein und unsere KI analysiert deine Stats, Posts und Engagement in 30 Sekunden." },
  "ig.howItWorks.step2.title": { fr: "Stratégie personnalisée", en: "Personalized strategy", es: "Estrategia personalizada", pt: "Estratégia personalizada", de: "Personalisierte Strategie" },
  "ig.howItWorks.step2.desc": { fr: "L'IA te recommande un plan sur mesure adapté à ton profil et tes objectifs Instagram.", en: "AI recommends a tailored plan adapted to your profile and Instagram goals.", es: "La IA te recomienda un plan a medida adaptado a tu perfil y objetivos en Instagram.", pt: "A IA recomenda um plano sob medida adaptado ao seu perfil e objetivos no Instagram.", de: "Die KI empfiehlt einen maßgeschneiderten Plan für dein Profil und deine Instagram-Ziele." },
  "ig.howItWorks.step3.title": { fr: "Croissance automatique", en: "Automatic growth", es: "Crecimiento automático", pt: "Crescimento automático", de: "Automatisches Wachstum" },
  "ig.howItWorks.step3.desc": { fr: "Résultats visibles rapidement, directement sur ton compte Instagram.", en: "Results visible quickly, directly on your Instagram account.", es: "Resultados visibles rápidamente, directamente en tu cuenta de Instagram.", pt: "Resultados visíveis rapidamente, diretamente na sua conta do Instagram.", de: "Ergebnisse schnell sichtbar, direkt auf deinem Instagram-Konto." },
  "ig.faq.q1": { fr: "Comment l'IA analyse mon profil Instagram ?", en: "How does the AI analyze my Instagram profile?", es: "¿Cómo analiza la IA mi perfil de Instagram?", pt: "Como a IA analisa meu perfil do Instagram?", de: "Wie analysiert die KI mein Instagram-Profil?" },
  "ig.faq.a1": { fr: "Notre IA scanne tes stats, ton taux d'engagement, tes derniers posts et ton audience Instagram pour identifier les axes de croissance les plus efficaces.", en: "Our AI scans your stats, engagement rate, latest posts and Instagram audience to identify the most effective growth opportunities.", es: "Nuestra IA escanea tus stats, tasa de engagement, últimos posts y audiencia de Instagram para identificar las mejores oportunidades de crecimiento.", pt: "Nossa IA analisa suas stats, taxa de engajamento, últimos posts e audiência do Instagram para identificar as melhores oportunidades de crescimento.", de: "Unsere KI scannt deine Stats, Engagement-Rate, neuesten Posts und Instagram-Zielgruppe, um die effektivsten Wachstumsmöglichkeiten zu identifizieren." },
  "ig.faq.q2": { fr: "Est-ce que c'est sûr pour mon compte ?", en: "Is it safe for my account?", es: "¿Es seguro para mi cuenta?", pt: "É seguro para minha conta?", de: "Ist das sicher für mein Konto?" },
  "ig.faq.a2": { fr: "Oui. L'IA analyse ton profil sans aucun accès à ton compte. Aucun mot de passe requis, aucune connexion à tes réseaux.", en: "Yes. The AI analyzes your profile without any access to your account. No password required, no connection to your social media.", es: "Sí. La IA analiza tu perfil sin ningún acceso a tu cuenta. Sin contraseña, sin conexión a tus redes.", pt: "Sim. A IA analisa seu perfil sem nenhum acesso à sua conta. Sem senha, sem conexão às suas redes.", de: "Ja. Die KI analysiert dein Profil ohne Zugang zu deinem Konto. Kein Passwort nötig, keine Verbindung zu deinen Netzwerken." },
  "ig.faq.q3": { fr: "En combien de temps je vois des résultats ?", en: "How quickly will I see results?", es: "¿En cuánto tiempo veo resultados?", pt: "Em quanto tempo vejo resultados?", de: "Wie schnell sehe ich Ergebnisse?" },
  "ig.faq.a3": { fr: "L'analyse IA prend 30 secondes. Les premiers résultats de la stratégie sont visibles en quelques minutes, tout est finalisé sous 24h.", en: "The AI analysis takes 30 seconds. First results are visible within minutes, everything is finalized within 24h.", es: "El análisis IA toma 30 segundos. Los primeros resultados son visibles en minutos, todo se finaliza en 24h.", pt: "A análise da IA leva 30 segundos. Os primeiros resultados são visíveis em minutos, tudo finalizado em 24h.", de: "Die KI-Analyse dauert 30 Sekunden. Erste Ergebnisse sind in Minuten sichtbar, alles ist in 24h abgeschlossen." },
  "ig.faq.q4": { fr: "Les résultats sont-ils durables ?", en: "Are results long-lasting?", es: "¿Los resultados son duraderos?", pt: "Os resultados são duradouros?", de: "Sind die Ergebnisse dauerhaft?" },
  "ig.faq.a4": { fr: "L'IA recommande une croissance progressive et naturelle. En cas de variation, on ajuste gratuitement pendant 30 jours.", en: "AI recommends progressive and natural growth. In case of variation, we adjust for free for 30 days.", es: "La IA recomienda un crecimiento progresivo y natural. En caso de variación, ajustamos gratis durante 30 días.", pt: "A IA recomenda crescimento progressivo e natural. Em caso de variação, ajustamos gratuitamente por 30 dias.", de: "Die KI empfiehlt progressives, natürliches Wachstum. Bei Schwankungen passen wir 30 Tage lang kostenlos an." },
  "ig.linkToTikTok": { fr: "Tu cherches TikTok ou YouTube ? C'est par ici", en: "Looking for TikTok or YouTube? Click here", es: "¿Buscas TikTok o YouTube? Haz clic aquí", pt: "Procurando TikTok ou YouTube? Clique aqui", de: "Suchst du TikTok oder YouTube? Hier klicken" },
  "ig.otherPlatforms": { fr: "Nos autres plateformes", en: "Our other platforms", es: "Nuestras otras plataformas", pt: "Nossas outras plataformas", de: "Unsere anderen Plattformen" },

  // ===== YouTubeUrlInput =====
  "ytUrl.title1": { fr: "Colle le lien de ta", en: "Paste your", es: "Pega el enlace de tu", pt: "Cole o link do seu", de: "Füge den Link deines" },
  "ytUrl.title2": { fr: "vidéo YouTube", en: "YouTube video", es: "video de YouTube", pt: "vídeo do YouTube", de: "YouTube-Videos ein" },
  "ytUrl.subtitle": { fr: "On va récupérer les infos de ta vidéo pour te proposer les meilleurs packs", en: "We'll fetch your video info to suggest the best packs", es: "Recuperaremos la info de tu video para sugerirte los mejores packs", pt: "Vamos buscar as infos do seu vídeo para sugerir os melhores pacotes", de: "Wir holen die Infos deines Videos, um die besten Pakete vorzuschlagen" },
  "ytUrl.errorEmpty": { fr: "Colle un lien YouTube", en: "Paste a YouTube link", es: "Pega un enlace de YouTube", pt: "Cole um link do YouTube", de: "Füge einen YouTube-Link ein" },
  "ytUrl.errorNotFound": { fr: "Vidéo introuvable", en: "Video not found", es: "Video no encontrado", pt: "Vídeo não encontrado", de: "Video nicht gefunden" },
  "ytUrl.errorServer": { fr: "Impossible de contacter le serveur", en: "Unable to contact server", es: "No se pudo contactar el servidor", pt: "Não foi possível contatar o servidor", de: "Server nicht erreichbar" },
  "ytUrl.loading": { fr: "Chargement", en: "Loading", es: "Cargando", pt: "Carregando", de: "Laden" },
  "ytUrl.analyze": { fr: "Analyser", en: "Analyze", es: "Analizar", pt: "Analisar", de: "Analysieren" },
  "ytUrl.formats": { fr: "Formats acceptés : youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...", en: "Accepted formats: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...", es: "Formatos aceptados: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...", pt: "Formatos aceitos: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...", de: "Akzeptierte Formate: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/..." },

  // ===== YouTubeVideoPreview =====
  "ytPreview.views": { fr: "Vues", en: "Views", es: "Vistas", pt: "Views", de: "Aufrufe" },
  "ytPreview.likes": { fr: "Likes", en: "Likes", es: "Likes", pt: "Likes", de: "Likes" },
  "ytPreview.subscribers": { fr: "Abonnés", en: "Subscribers", es: "Suscriptores", pt: "Inscritos", de: "Abonnenten" },
  "ytPreview.comments": { fr: "Commentaires", en: "Comments", es: "Comentarios", pt: "Comentários", de: "Kommentare" },
  "ytPreview.isThisVideo": { fr: "C'est bien cette vidéo ?", en: "Is this the right video?", es: "¿Es este el video correcto?", pt: "É esse o vídeo certo?", de: "Ist das das richtige Video?" },
  "ytPreview.noChange": { fr: "Non, changer", en: "No, change", es: "No, cambiar", pt: "Não, alterar", de: "Nein, ändern" },
  "ytPreview.yesContinue": { fr: "Oui, continuer →", en: "Yes, continue →", es: "Sí, continuar →", pt: "Sim, continuar →", de: "Ja, weiter →" },

  // ===== Orders page =====
  "orders.subtitle": { fr: "Suivi de tes commandes", en: "Track your orders", es: "Seguimiento de tus pedidos", pt: "Acompanhamento dos seus pedidos", de: "Deine Bestellungen verfolgen" },
  "orders.emailLabel": { fr: "Entre ton adresse e-mail pour retrouver tes commandes", en: "Enter your email to find your orders", es: "Ingresa tu correo para encontrar tus pedidos", pt: "Digite seu e-mail para encontrar seus pedidos", de: "Gib deine E-Mail ein, um deine Bestellungen zu finden" },
  "orders.search": { fr: "Rechercher", en: "Search", es: "Buscar", pt: "Buscar", de: "Suchen" },
  "orders.noOrders": { fr: "Aucune commande trouvée", en: "No orders found", es: "No se encontraron pedidos", pt: "Nenhum pedido encontrado", de: "Keine Bestellungen gefunden" },
  "orders.checkEmail": { fr: "Vérifie que c'est bien l'email utilisé lors du paiement.", en: "Make sure this is the email used during payment.", es: "Verifica que sea el correo usado durante el pago.", pt: "Verifique se é o e-mail usado durante o pagamento.", de: "Stelle sicher, dass es die E-Mail ist, die bei der Zahlung verwendet wurde." },
  "orders.found": { fr: "commande", en: "order", es: "pedido", pt: "pedido", de: "Bestellung" },
  "orders.foundPlural": { fr: "commandes", en: "orders", es: "pedidos", pt: "pedidos", de: "Bestellungen" },
  "orders.foundSuffix": { fr: "trouvée", en: "found", es: "encontrado", pt: "encontrado", de: "gefunden" },
  "orders.foundPluralSuffix": { fr: "trouvées", en: "found", es: "encontrados", pt: "encontrados", de: "gefunden" },
  "orders.backHome": { fr: "Retour à l'accueil", en: "Back to home", es: "Volver al inicio", pt: "Voltar ao início", de: "Zurück zur Startseite" },
  "orders.serverError": { fr: "Impossible de contacter le serveur", en: "Unable to contact server", es: "No se pudo contactar el servidor", pt: "Não foi possível contatar o servidor", de: "Server nicht erreichbar" },

  // ===== Order status =====
  "orderStatus.pending": { fr: "En attente", en: "Pending", es: "Pendiente", pt: "Pendente", de: "Ausstehend" },
  "orderStatus.paid": { fr: "Confirmée", en: "Confirmed", es: "Confirmado", pt: "Confirmado", de: "Bestätigt" },
  "orderStatus.processing": { fr: "En cours", en: "Processing", es: "En proceso", pt: "Em processamento", de: "In Bearbeitung" },
  "orderStatus.delivered": { fr: "Livrée", en: "Delivered", es: "Entregado", pt: "Entregue", de: "Geliefert" },

  // ===== Order detail page =====
  "orderDetail.tracking": { fr: "Suivi de commande", en: "Order tracking", es: "Seguimiento del pedido", pt: "Acompanhamento do pedido", de: "Bestellverfolgung" },
  "orderDetail.statusDelivered": { fr: "Commande livrée ✅", en: "Order delivered ✅", es: "Pedido entregado ✅", pt: "Pedido entregue ✅", de: "Bestellung geliefert ✅" },
  "orderDetail.statusProcessing": { fr: "En cours de traitement...", en: "Processing...", es: "En proceso...", pt: "Em processamento...", de: "Wird verarbeitet..." },
  "orderDetail.statusPaid": { fr: "Commande confirmée, traitement imminent", en: "Order confirmed, processing imminent", es: "Pedido confirmado, procesamiento inminente", pt: "Pedido confirmado, processamento iminente", de: "Bestellung bestätigt, Verarbeitung steht bevor" },
  "orderDetail.statusPending": { fr: "En attente de confirmation", en: "Awaiting confirmation", es: "Esperando confirmación", pt: "Aguardando confirmação", de: "Bestätigung ausstehend" },
  "orderDetail.deliveredOn": { fr: "Livrée le", en: "Delivered on", es: "Entregado el", pt: "Entregue em", de: "Geliefert am" },
  "orderDetail.evolution": { fr: "Évolution de", en: "Evolution of", es: "Evolución de", pt: "Evolução de", de: "Entwicklung von" },
  "orderDetail.before": { fr: "Avant", en: "Before", es: "Antes", pt: "Antes", de: "Vorher" },
  "orderDetail.now": { fr: "Maintenant", en: "Now", es: "Ahora", pt: "Agora", de: "Jetzt" },
  "orderDetail.followers": { fr: "followers", en: "followers", es: "seguidores", pt: "seguidores", de: "Follower" },
  "orderDetail.orderDetail": { fr: "Détail de la commande", en: "Order details", es: "Detalle del pedido", pt: "Detalhe do pedido", de: "Bestelldetails" },
  "orderDetail.orderedOn": { fr: "Commandé le", en: "Ordered on", es: "Pedido el", pt: "Pedido em", de: "Bestellt am" },
  "orderDetail.relaunchBoost": { fr: "Relance un boost", en: "Boost again", es: "Impulsar de nuevo", pt: "Impulsionar novamente", de: "Erneut boosten" },
  "orderDetail.loadError": { fr: "Impossible de charger la commande", en: "Unable to load order", es: "No se pudo cargar el pedido", pt: "Não foi possível carregar o pedido", de: "Bestellung konnte nicht geladen werden" },
  "orderDetail.serviceStatus": { fr: "Statut par service", en: "Status per service", es: "Estado por servicio", pt: "Status por serviço", de: "Status pro Dienst" },
  "orderStatus.error": { fr: "Erreur", en: "Error", es: "Error", pt: "Erro", de: "Fehler" },

  // ===== X (Twitter) HomePage =====
  "x.hero.title1": { fr: "Accélère ta", en: "Accelerate your", es: "Acelera tu", pt: "Acelere seu", de: "Beschleunige dein" },
  "x.hero.title2": { fr: "croissance ", en: "growth ", es: "crecimiento ", pt: "crescimento ", de: "Wachstum " },
  "x.hero.subtitle1": { fr: "On s'occupe de ta visibilité X pendant que", en: "We handle your X visibility while", es: "Nos encargamos de tu visibilidad en X mientras", pt: "Cuidamos da sua visibilidade no X enquanto", de: "Wir kümmern uns um deine X-Sichtbarkeit, während" },
  "x.hero.subtitle2": { fr: "tu te concentres sur ton contenu.", en: "you focus on your content.", es: "tú te concentras en tu contenido.", pt: "você foca no seu conteúdo.", de: "du dich auf deinen Content konzentrierst." },
  "x.hero.cta": { fr: "Lancer ma croissance →", en: "Start my growth →", es: "Impulsar mi crecimiento →", pt: "Iniciar meu crescimento →", de: "Mein Wachstum starten →" },
  "x.howItWorks.step1.title": { fr: "L'IA scanne ton profil", en: "AI scans your profile", es: "La IA escanea tu perfil", pt: "A IA analisa seu perfil", de: "KI scannt dein Profil" },
  "x.howItWorks.step1.desc": { fr: "Entre ton @ et notre IA analyse tes stats et engagement en 30 secondes.", en: "Enter your @ and our AI analyzes your stats and engagement in 30 seconds.", es: "Ingresa tu @ y nuestra IA analiza tus stats y engagement en 30 segundos.", pt: "Digite seu @ e nossa IA analisa suas stats e engajamento em 30 segundos.", de: "Gib deinen @ ein und unsere KI analysiert deine Stats und Engagement in 30 Sekunden." },
  "x.howItWorks.step2.title": { fr: "Stratégie personnalisée", en: "Personalized strategy", es: "Estrategia personalizada", pt: "Estratégia personalizada", de: "Personalisierte Strategie" },
  "x.howItWorks.step2.desc": { fr: "L'IA te recommande un plan sur mesure adapté à ton profil X.", en: "AI recommends a custom plan adapted to your X profile.", es: "La IA te recomienda un plan a medida para tu perfil de X.", pt: "A IA recomenda um plano sob medida adaptado ao seu perfil X.", de: "Die KI empfiehlt einen maßgeschneiderten Plan für dein X-Profil." },
  "x.howItWorks.step3.title": { fr: "Croissance automatique", en: "Automatic growth", es: "Crecimiento automático", pt: "Crescimento automático", de: "Automatisches Wachstum" },
  "x.howItWorks.step3.desc": { fr: "Résultats visibles rapidement, directement sur ton compte.", en: "Results visible quickly, directly on your account.", es: "Resultados visibles rápidamente, directamente en tu cuenta.", pt: "Resultados visíveis rapidamente, diretamente na sua conta.", de: "Ergebnisse schnell sichtbar, direkt auf deinem Konto." },
  "x.faq.q1": { fr: "Comment l'IA analyse mon profil X ?", en: "How does the AI analyze my X profile?", es: "¿Cómo analiza la IA mi perfil de X?", pt: "Como a IA analisa meu perfil X?", de: "Wie analysiert die KI mein X-Profil?" },
  "x.faq.a1": { fr: "Notre IA scanne tes tweets, ton taux d'engagement et ton audience pour identifier les meilleurs leviers de croissance.", en: "Our AI scans your tweets, engagement rate and audience to identify the best growth levers.", es: "Nuestra IA escanea tus tweets, tasa de engagement y audiencia para identificar las mejores palancas de crecimiento.", pt: "Nossa IA analisa seus tweets, taxa de engajamento e audiência para identificar as melhores alavancas de crescimento.", de: "Unsere KI scannt deine Tweets, Engagement-Rate und Zielgruppe, um die besten Wachstumshebel zu identifizieren." },
  "x.faq.q2": { fr: "Est-ce que c'est sûr pour mon compte ?", en: "Is it safe for my account?", es: "¿Es seguro para mi cuenta?", pt: "É seguro para minha conta?", de: "Ist das sicher für mein Konto?" },
  "x.faq.a2": { fr: "Oui. L'IA analyse ton profil sans aucun accès à ton compte. Aucun mot de passe requis.", en: "Yes. The AI analyzes your profile without any access to your account. No password required.", es: "Sí. La IA analiza tu perfil sin acceso a tu cuenta. Sin contraseña.", pt: "Sim. A IA analisa seu perfil sem acesso à sua conta. Sem senha.", de: "Ja. Die KI analysiert dein Profil ohne Zugang zu deinem Konto. Kein Passwort nötig." },
  "x.faq.q3": { fr: "En combien de temps je vois des résultats ?", en: "How quickly will I see results?", es: "¿En cuánto tiempo veo resultados?", pt: "Em quanto tempo vejo resultados?", de: "Wie schnell sehe ich Ergebnisse?" },
  "x.faq.a3": { fr: "Les premiers résultats sont visibles en quelques heures. Tout est finalisé sous 24h.", en: "First results visible within hours. Everything finalized within 24h.", es: "Los primeros resultados son visibles en horas. Todo finalizado en 24h.", pt: "Os primeiros resultados são visíveis em horas. Tudo finalizado em 24h.", de: "Erste Ergebnisse in Stunden sichtbar. Alles in 24h abgeschlossen." },
  "x.faq.q4": { fr: "Les résultats sont-ils durables ?", en: "Are results long-lasting?", es: "¿Los resultados son duraderos?", pt: "Os resultados são duradouros?", de: "Sind die Ergebnisse dauerhaft?" },
  "x.faq.a4": { fr: "On mise sur une croissance progressive. En cas de variation, on compense gratuitement pendant 30 jours.", en: "We focus on progressive growth. In case of variation, we compensate for free for 30 days.", es: "Apostamos por un crecimiento progresivo. En caso de variación, compensamos gratis durante 30 días.", pt: "Apostamos em crescimento progressivo. Em caso de variação, compensamos gratuitamente por 30 dias.", de: "Wir setzen auf progressives Wachstum. Bei Schwankungen gleichen wir 30 Tage lang kostenlos aus." },
  "x.linkToTikTok": { fr: "Tu cherches TikTok ou Instagram ? ", en: "Looking for TikTok or Instagram? ", es: "¿Buscas TikTok o Instagram? ", pt: "Procurando TikTok ou Instagram? ", de: "Suchst du TikTok oder Instagram? " },
  "x.linkToTikTok.cta": { fr: "C'est par ici", en: "Click here", es: "Haz clic aquí", pt: "Clique aqui", de: "Hier klicken" },

  // ===== Twitch HomePage =====
  "tw.hero.title1": { fr: "Fais connaître ta", en: "Promote your", es: "Promociona tu", pt: "Divulgue seu", de: "Mach deinen" },
  "tw.hero.title2": { fr: "chaîne ", en: "channel ", es: "canal ", pt: "canal ", de: "Kanal bekannt " },
  "tw.hero.subtitle1": { fr: "Une visibilité accrue auprès d'une audience", en: "Reach a wider audience of gaming", es: "Mayor visibilidad ante una audiencia", pt: "Maior visibilidade junto a uma audiência", de: "Mehr Sichtbarkeit bei einem Publikum" },
  "tw.hero.subtitle2": { fr: "passionnée de gaming et de streaming.", en: "and streaming enthusiasts.", es: "apasionada por gaming y streaming.", pt: "apaixonada por gaming e streaming.", de: "das Gaming und Streaming liebt." },
  "tw.hero.cta": { fr: "Promouvoir ma chaîne →", en: "Promote my channel →", es: "Promocionar mi canal →", pt: "Promover meu canal →", de: "Meinen Kanal bewerben →" },
  "tw.hero.delivery": { fr: "Promotion de ta chaîne Twitch", en: "Twitch channel promotion", es: "Promoción de tu canal de Twitch", pt: "Promoção do seu canal Twitch", de: "Twitch-Kanal-Promotion" },
  "tw.howItWorks.step1.title": { fr: "Entre ton @", en: "Enter your @", es: "Ingresa tu @", pt: "Digite seu @", de: "Gib deinen @ ein" },
  "tw.howItWorks.step1.desc": { fr: "Indique ta chaîne Twitch et choisis ta formule de promotion.", en: "Enter your Twitch channel and choose your promotion plan.", es: "Indica tu canal de Twitch y elige tu plan de promoción.", pt: "Indique seu canal Twitch e escolha seu plano de promoção.", de: "Gib deinen Twitch-Kanal ein und wähle dein Promotion-Paket." },
  "tw.howItWorks.step2.title": { fr: "Paie en sécurité", en: "Pay securely", es: "Paga de forma segura", pt: "Pague com segurança", de: "Sicher bezahlen" },
  "tw.howItWorks.step2.desc": { fr: "Paiement sécurisé par Stripe, en quelques secondes.", en: "Secure Stripe payment, takes only seconds.", es: "Pago seguro con Stripe, en segundos.", pt: "Pagamento seguro por Stripe, em segundos.", de: "Sichere Zahlung über Stripe in Sekunden." },
  "tw.howItWorks.step3.title": { fr: "Audience ciblée", en: "Targeted audience", es: "Audiencia segmentada", pt: "Audiência segmentada", de: "Zielgerichtetes Publikum" },
  "tw.howItWorks.step3.desc": { fr: "Ta chaîne est mise en avant auprès de viewers intéressés par ton contenu.", en: "Your channel is showcased to viewers interested in your content.", es: "Tu canal se destaca ante viewers interesados en tu contenido.", pt: "Seu canal é destacado para viewers interessados no seu conteúdo.", de: "Dein Kanal wird Zuschauern präsentiert, die sich für deinen Content interessieren." },
  "tw.faq.q1": { fr: "Comment fonctionnent les viewers live ?", en: "How do live viewers work?", es: "¿Cómo funcionan los viewers en vivo?", pt: "Como funcionam os viewers ao vivo?", de: "Wie funktionieren Live-Zuschauer?" },
  "tw.faq.a1": { fr: "Tu nous indiques l'heure exacte de ton stream. Au début du live, les viewers se connectent progressivement et restent jusqu'à la fin.", en: "You tell us the exact time of your stream. At the start, viewers connect progressively and stay until the end.", es: "Nos indicas la hora exacta de tu stream. Al inicio, los viewers se conectan progresivamente y se quedan hasta el final.", pt: "Você nos informa a hora exata do seu stream. No início, os viewers se conectam progressivamente e ficam até o final.", de: "Du gibst uns die genaue Uhrzeit deines Streams. Zum Start verbinden sich Zuschauer schrittweise und bleiben bis zum Ende." },
  "tw.faq.q2": { fr: "Est-ce que c'est sûr pour mon compte ?", en: "Is it safe for my account?", es: "¿Es seguro para mi cuenta?", pt: "É seguro para minha conta?", de: "Ist das sicher für mein Konto?" },
  "tw.faq.a2": { fr: "Oui. Aucun mot de passe requis, aucun accès à ton compte Twitch. On a juste besoin de ton pseudo.", en: "Yes. No password required, no access to your Twitch account. Just your username.", es: "Sí. Sin contraseña, sin acceso a tu cuenta de Twitch. Solo necesitamos tu usuario.", pt: "Sim. Sem senha, sem acesso à sua conta Twitch. Só precisamos do seu usuário.", de: "Ja. Kein Passwort nötig, kein Zugang zu deinem Twitch-Konto. Nur dein Benutzername." },
  "tw.faq.q3": { fr: "Que se passe-t-il si je décale mon live ?", en: "What if I postpone my live?", es: "¿Qué pasa si pospongo mi live?", pt: "E se eu adiar minha live?", de: "Was passiert, wenn ich meinen Stream verschiebe?" },
  "tw.faq.a3": { fr: "Contacte-nous au plus vite via le chat — on reprogramme la livraison sans frais.", en: "Contact us via chat asap — we'll reschedule delivery for free.", es: "Contáctanos por chat lo antes posible — reprogramamos la entrega gratis.", pt: "Entre em contato pelo chat — reagendamos a entrega gratuitamente.", de: "Kontaktiere uns schnellstmöglich per Chat — wir planen die Lieferung kostenlos um." },
  "tw.faq.q4": { fr: "Les followers sont-ils durables ?", en: "Are followers long-lasting?", es: "¿Los seguidores son duraderos?", pt: "Os seguidores são duradouros?", de: "Sind die Follower dauerhaft?" },
  "tw.faq.a4": { fr: "On vise une croissance progressive. Garantie 30 jours, on recharge gratuitement en cas de baisse.", en: "We aim for progressive growth. 30-day guarantee with free refill if any drop occurs.", es: "Apostamos por un crecimiento progresivo. Garantía de 30 días, recargamos gratis si hay bajada.", pt: "Apostamos em crescimento progressivo. Garantia de 30 dias, repomos gratuitamente em caso de queda.", de: "Wir setzen auf progressives Wachstum. 30 Tage Garantie, kostenlose Nachlieferung bei Rückgang." },
  "tw.linkToTikTok": { fr: "Tu cherches TikTok ou Instagram ? ", en: "Looking for TikTok or Instagram? ", es: "¿Buscas TikTok o Instagram? ", pt: "Procurando TikTok ou Instagram? ", de: "Suchst du TikTok oder Instagram? " },
  "tw.linkToTikTok.cta": { fr: "C'est par ici", en: "Click here", es: "Haz clic aquí", pt: "Clique aqui", de: "Hier klicken" },

  // ===== LiveSchedule =====
  "live.pickDateTime": { fr: "Sélectionne une date et une heure", en: "Pick a date and time", es: "Selecciona una fecha y hora", pt: "Selecione uma data e hora", de: "Wähle Datum und Uhrzeit" },
  "live.invalidDateTime": { fr: "Date/heure invalide", en: "Invalid date/time", es: "Fecha/hora inválida", pt: "Data/hora inválida", de: "Ungültiges Datum/Uhrzeit" },
  "live.mustBeFuture": { fr: "La date doit être dans le futur", en: "Date must be in the future", es: "La fecha debe ser en el futuro", pt: "A data deve ser no futuro", de: "Das Datum muss in der Zukunft liegen" },
  "live.title1": { fr: "Quand commence ton ", en: "When does your ", es: "¿Cuándo empieza tu ", pt: "Quando começa sua ", de: "Wann startet dein " },
  "live.title2": { fr: " ?", en: " start?", es: " ?", pt: " ?", de: " ?" },
  "live.subtitle": { fr: "Indique précisément quand tu lances ton stream", en: "Tell us exactly when you start streaming", es: "Indica exactamente cuándo empiezas tu stream", pt: "Indique exatamente quando você inicia seu stream", de: "Gib genau an, wann du deinen Stream startest" },
  "live.viewersDelivery": { fr: "{qty} viewers seront livrés progressivement dès le début", en: "{qty} viewers will be delivered progressively from the start", es: "{qty} viewers se entregarán progresivamente desde el inicio", pt: "{qty} viewers serão entregues progressivamente desde o início", de: "{qty} Zuschauer werden ab Start schrittweise geliefert" },
  "live.dateLabel": { fr: "Date", en: "Date", es: "Fecha", pt: "Data", de: "Datum" },
  "live.timeLabel": { fr: "Heure", en: "Time", es: "Hora", pt: "Hora", de: "Uhrzeit" },
  "live.liveStarts": { fr: "Début du live", en: "Live starts", es: "Inicio del live", pt: "Início da live", de: "Live-Start" },
  "live.continuePay": { fr: "Continuer vers le paiement", en: "Continue to payment", es: "Continuar al pago", pt: "Continuar para pagamento", de: "Weiter zur Zahlung" },
  "live.editCart": { fr: "Modifier mon panier", en: "Edit my cart", es: "Editar mi carrito", pt: "Editar meu carrinho", de: "Warenkorb bearbeiten" },

  // ===== RecentDeliveries =====
  "recent.agoPrefix": { fr: "il y a", en: "", es: "hace", pt: "há", de: "vor" },
  "recent.agoSuffix": { fr: "", en: "ago", es: "", pt: "", de: "" },
  "recent.delivered": { fr: "livrés", en: "delivered", es: "entregados", pt: "entregues", de: "geliefert" },
  "recent.deliveredFem": { fr: "livrées", en: "delivered", es: "entregadas", pt: "entregues", de: "geliefert" },

  // ===== LiveOrderCounter =====
  "liveCounter.ordersToday": { fr: "commandes aujourd'hui", en: "orders today", es: "pedidos hoy", pt: "pedidos hoje", de: "Bestellungen heute" },

  // ===== Misc =====
  "common.change": { fr: "Changer", en: "Change", es: "Cambiar", pt: "Alterar", de: "Ändern" },

  // ===== Service labels =====
  "svc.followers": { fr: "Followers", en: "Followers", es: "Seguidores", pt: "Seguidores", de: "Follower" },
  "svc.likes": { fr: "Likes", en: "Likes", es: "Likes", pt: "Likes", de: "Likes" },
  "svc.views": { fr: "Vues", en: "Views", es: "Vistas", pt: "Views", de: "Aufrufe" },
  "svc.yt_subscribers": { fr: "Abonnés", en: "Subscribers", es: "Suscriptores", pt: "Inscritos", de: "Abonnenten" },
  "svc.yt_likes": { fr: "Likes", en: "Likes", es: "Likes", pt: "Likes", de: "Likes" },
  "svc.yt_views": { fr: "Vues", en: "Views", es: "Vistas", pt: "Views", de: "Aufrufe" },
  "svc.sp_streams": { fr: "Streams", en: "Streams", es: "Streams", pt: "Streams", de: "Streams" },
  "svc.x_followers": { fr: "Followers", en: "Followers", es: "Seguidores", pt: "Seguidores", de: "Follower" },
  "svc.x_likes": { fr: "Likes", en: "Likes", es: "Likes", pt: "Likes", de: "Likes" },
  "svc.x_retweets": { fr: "Retweets", en: "Retweets", es: "Retweets", pt: "Retweets", de: "Retweets" },
  "svc.tw_followers": { fr: "Followers", en: "Followers", es: "Seguidores", pt: "Seguidores", de: "Follower" },
  "svc.tw_live_viewers": { fr: "Live Viewers", en: "Live Viewers", es: "Espectadores en vivo", pt: "Espectadores ao vivo", de: "Live-Zuschauer" },

  // ===== Growth Calculator =====
  "calc.title": { fr: "Calculateur de croissance Instagram", en: "Instagram Growth Calculator", es: "Calculadora de crecimiento de Instagram", pt: "Calculadora de crescimento do Instagram", de: "Instagram-Wachstumsrechner" },
  "calc.subtitle": { fr: "Combien de followers veux-tu dans 30 jours ?", en: "How many followers do you want in 30 days?", es: "¿Cuántos seguidores quieres en 30 días?", pt: "Quantos seguidores você quer em 30 dias?", de: "Wie viele Follower willst du in 30 Tagen?" },
  "calc.currentFollowers": { fr: "Tes followers actuels", en: "Your current followers", es: "Tus seguidores actuales", pt: "Seus seguidores atuais", de: "Deine aktuellen Follower" },
  "calc.targetFollowers": { fr: "Ton objectif de followers", en: "Your target followers", es: "Tu objetivo de seguidores", pt: "Seu objetivo de seguidores", de: "Dein Follower-Ziel" },
  "calc.followersNeeded": { fr: "Followers à gagner", en: "Followers to gain", es: "Seguidores a ganar", pt: "Seguidores a ganhar", de: "Follower zu gewinnen" },
  "calc.growthRate": { fr: "Taux de croissance", en: "Growth rate", es: "Tasa de crecimiento", pt: "Taxa de crescimento", de: "Wachstumsrate" },
  "calc.recommendedPack": { fr: "Pack recommandé", en: "Recommended pack", es: "Pack recomendado", pt: "Pacote recomendado", de: "Empfohlenes Paket" },
  "calc.startNow": { fr: "Lancer ma croissance →", en: "Start my growth →", es: "Impulsar mi crecimiento →", pt: "Iniciar meu crescimento →", de: "Mein Wachstum starten →" },
  "calc.perDay": { fr: "par jour", en: "per day", es: "por día", pt: "por dia", de: "pro Tag" },
  "calc.in30days": { fr: "dans 30 jours", en: "in 30 days", es: "en 30 días", pt: "em 30 dias", de: "in 30 Tagen" },
  "calc.organic": { fr: "Croissance organique estimée", en: "Estimated organic growth", es: "Crecimiento orgánico estimado", pt: "Crescimento orgânico estimado", de: "Geschätztes organisches Wachstum" },
  "calc.boosted": { fr: "Avec Fanovaly", en: "With Fanovaly", es: "Con Fanovaly", pt: "Com Fanovaly", de: "Mit Fanovaly" },
  "calc.freeToolTitle": { fr: "Outil gratuit", en: "Free tool", es: "Herramienta gratuita", pt: "Ferramenta gratuita", de: "Kostenloses Tool" },
  "calc.metaTitle": { fr: "Calculateur de croissance Instagram gratuit | Fanovaly", en: "Free Instagram Growth Calculator | Fanovaly", es: "Calculadora de crecimiento de Instagram gratis | Fanovaly", pt: "Calculadora de crescimento do Instagram grátis | Fanovaly", de: "Kostenloser Instagram-Wachstumsrechner | Fanovaly" },
  "calc.metaDesc": { fr: "Calcule combien de followers tu peux gagner en 30 jours et découvre le pack idéal pour booster ton profil Instagram.", en: "Calculate how many followers you can gain in 30 days and find the ideal pack to boost your Instagram profile.", es: "Calcula cuántos seguidores puedes ganar en 30 días y descubre el pack ideal para impulsar tu perfil de Instagram.", pt: "Calcule quantos seguidores você pode ganhar em 30 dias e descubra o pacote ideal para impulsionar seu perfil do Instagram.", de: "Berechne, wie viele Follower du in 30 Tagen gewinnen kannst, und finde das ideale Paket für dein Instagram-Profil." },
};

export const LANG_LOCALE: Record<Lang, string> = {
  fr: "fr-FR", en: "en-US", es: "es-ES", pt: "pt-BR", de: "de-DE",
};

export function useTranslation() {
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const lang: Lang = langParam === "en" ? "en" : langParam === "es" ? "es" : langParam === "pt" ? "pt" : langParam === "de" ? "de" : "fr";

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>): string => {
      const entry = dict[key];
      let str = entry ? (entry[lang] || entry["en"] || entry["fr"] || key) : key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    };
  }, [lang]);

  function href(path: string): string {
    if (lang !== "fr") {
      const sep = path.includes("?") ? "&" : "?";
      return `${path}${sep}lang=${lang}`;
    }
    return path;
  }

  const detectedCurrency = useDetectedCurrency();
  const currencyParam = searchParams.get("currency") as Currency | null;
  const currency: Currency = currencyParam && ["eur", "usd", "gbp", "cad", "nzd", "aud", "chf"].includes(currencyParam)
    ? currencyParam
    // lang=en => usd by default (overrides geo detection), unless user picked a currency explicitly via ?currency=
    : lang === "en"
      ? "usd"
      : detectedCurrency
        ? detectedCurrency
        : lang === "de" ? "eur" : lang === "pt" ? "eur" : lang === "es" ? "usd" : "eur";

  return { t, lang, href, currency };
}
