const languageSelect = document.querySelector("#page-language");
const languageStatus = document.querySelector("#language-status");
const originalText = new WeakMap();
const originalAttributes = new WeakMap();
let activeLanguage = "en";
let languageReady = false;
let providerTranslation = false;

function saveLanguage(target) {
  try {
    localStorage.setItem("common-ground-page-language", target);
  } catch (error) {
    console.warn("Page language could not be saved.", error);
  }
}

function restoreLanguage() {
  let saved;
  try {
    saved = localStorage.getItem("common-ground-page-language");
  } catch (error) {
    console.warn("Page language could not be restored.", error);
    return;
  }
  if (saved && [...languageSelect.options].some((option) => option.value === saved)) {
    languageSelect.value = saved;
    if (saved !== "en") applyLanguage(saved);
  }
}

const localLanguages = {
  es: "Español",
  fr: "Français",
  de: "Deutsch",
};

const localTranslationNotice = {
  es: "Solo se traducen algunas frases. Para traducir toda la página se necesita Microsoft Translator.",
  fr: "Seules certaines expressions sont traduites. Pour traduire toute la page, Microsoft Translator est nécessaire.",
  de: "Nur einige Formulierungen werden übersetzt. Für die gesamte Seite wird Microsoft Translator benötigt.",
};

const properNouns = [
  "Cartersville-Bartow Chamber",
  "Cartersville Downtown Development Authority",
  "Cartersville Parks & Recreation",
  "Cartersville Parks and Recreation",
  "Cartersville Little League",
  "Georgia Association of Broadcasters",
  "Georgia Southern University",
  "Cartersville City Schools",
  "Historic Preservation Commission",
  "Board of Zoning Appeals",
  "Downtown Development Authority",
  "Planning Commission",
  "Rotary International",
  "Microsoft Translator",
  "Rotary Club of Etowah",
  "The Autumn Leaves Project",
  "Cartersville High School",
  "City of Cartersville",
  "Common Ground",
  "Dellinger Park",
  "Floyd County",
  "Pine Mountain",
  "Bartow County",
  "Matt Santini",
  "Fairport",
  "New York",
  "Marietta",
  "City Hall",
  "Cartersville",
  "Georgia",
  "Etowah",
  "U.S.",
  "FBLA",
  "ACTIVE",
  "Microsoft",
  "Rome",
  "Emerson",
  "211.org",
];
const properNounPattern = new RegExp(
  properNouns
    .sort((left, right) => right.length - left.length)
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|"),
  "gi",
);

const localTranslations = {
  es: {
    "Find a local program, discover what's happening downtown, or get connected to support in Cartersville.": "Encuentre un programa local, descubra qué sucede en el centro o acceda a ayuda en Cartersville.",
    "Downtown Community Events": "Eventos comunitarios en el centro",
    "Browse the City of Cartersville's current calendar for downtown gatherings and happenings.": "Consulte el calendario actual de City of Cartersville para reuniones y eventos en el centro.",
    "Find parks, programs, athletic schedules, and ways to get active around Cartersville.": "Encuentre parques, programas, horarios deportivos y formas de mantenerse activo en Cartersville y sus alrededores.",
    "Find the right City of Cartersville department for questions, services, and municipal information.": "Encuentre el departamento de City of Cartersville adecuado para preguntas, servicios e información municipal.",
    "Connect with local referrals for food, housing, health care, utility help, and more.": "Encuentre ayuda local para alimentos, vivienda, atención médica, pago de servicios públicos y más.",
    "See activities offered through the city's recreation registration portal.": "Vea las actividades disponibles en el portal de inscripción para recreación de la ciudad.",
    "Check facility availability and reservation information with Parks & Recreation.": "Consulte la disponibilidad de instalaciones y la información para reservar con Parks & Recreation.",
    "Verified starting points for programs, recreation, community gatherings, and essential support in and around town.": "Puntos de partida verificados para programas, recreación, reuniones comunitarias y ayuda esencial en la ciudad y sus alrededores.",
    "Translate page": "Traducir página",
    "Skip to content": "Ir al contenido",
    "Home": "Inicio",
    "Main navigation": "Navegación principal",
    "Open navigation": "Abrir navegación",
    "Close navigation": "Cerrar navegación",
    "Accessibility": "Accesibilidad",
    "Accessibility settings": "Opciones de accesibilidad",
    "Larger text": "Texto más grande",
    "High contrast": "Alto contraste",
    "Underline links": "Subrayar enlaces",
    "Reduce motion": "Reducir movimiento",
    "Reset settings": "Restablecer opciones",
    "Explore local resources": "Explorar recursos locales",
    "See upcoming events": "Ver próximos eventos",
    "Start with what you need": "Comience con lo que necesita",
    "Parks & programs": "Parques y programas",
    "Community events": "Eventos comunitarios",
    "Everyday support": "Ayuda para la vida diaria",
    "Ask a neighbor": "Preguntar a un vecino",
    "Local places to begin": "Lugares locales para empezar",
    "Parks & recreation": "Parques y recreación",
    "Local events": "Eventos locales",
    "City services": "Servicios municipales",
    "Find local help": "Encontrar ayuda local",
    "Activities": "Actividades",
    "Reserve a space": "Reservar un espacio",
    "Explore city programs": "Explorar programas municipales",
    "Open downtown calendar": "Abrir calendario del centro",
    "Browse departments": "Ver departamentos",
    "Find an activity": "Encontrar una actividad",
    "View facilities": "Ver instalaciones",
    "On the city calendar": "En el calendario municipal",
    "Plan a little time together": "Planeen un momento juntos",
    "Selected date": "Fecha seleccionada",
    "Year-round volunteer listings": "Oportunidades de voluntariado durante todo el año",
    "Published dates": "Fechas publicadas",
    "My clubs calendar": "Calendario de mis clubes",
    "My favorites": "Mis favoritos",
    "Bookmark": "Guardar",
    "Saved": "Guardado",
    "Completed": "Finalizado",
    "RSVP / details": "Confirmar asistencia / detalles",
    "Add volunteer event": "Añadir evento de voluntariado",
    "Date and start time (Georgia local time)": "Fecha y hora de inicio (hora local de Georgia)",
    "Specific place": "Lugar específico",
    "Event description (10 words minimum)": "Descripción del evento (mínimo 10 palabras)",
    "Your private conversation": "Su conversación privada",
    "Your reply": "Su respuesta",
    "Write a reply...": "Escriba una respuesta...",
    "Reply": "Responder",
    "Close": "Cerrar",
    "Official email": "Correo electrónico oficial",
    "Office address": "Dirección de la oficina",
    "Mailing address": "Dirección postal",
    "Official city profile": "Perfil oficial de la ciudad",
    "English": "Inglés",
    "Page language": "Idioma de la página",
    "Local resources": "Recursos locales",
    "Calendar": "Calendario",
    "Volunteer": "Voluntariado",
    "Clubs & teams": "Clubes y equipos",
    "Mayor": "Alcalde",
    "Ask a question": "Hacer una pregunta",
    "Need help now": "Necesito ayuda ahora",
    "Good things are closer than you think.": "Las buenas cosas están más cerca de lo que piensa.",
    "A neighbor-to-neighbor guide": "Una guía de vecinos para vecinos",
    "A little help goes a long way.": "Un poco de ayuda hace una gran diferencia.",
    "What's happening around town": "Qué está sucediendo en la ciudad",
    "Community calendar": "Calendario comunitario",
    "Today": "Hoy",
    "Previous month": "Mes anterior",
    "Next month": "Mes siguiente",
    "All": "Todos",
    "Sports": "Deportes",
    "Clubs": "Clubes",
    "Volunteering": "Voluntariado",
    "Community": "Comunidad",
    "Work holidays": "Días festivos laborales",
    "My clubs": "Mis clubes",
    "Saved events": "Eventos guardados",
    "Find a way to pitch in.": "Encuentre una manera de ayudar.",
    "Send a private message": "Enviar un mensaje privado",
    "Your name": "Su nombre",
    "Email address": "Correo electrónico",
    "Your message": "Su mensaje",
    "Send privately": "Enviar de forma privada",
    "Find your people. Join a team.": "Encuentre a su gente. Únase a un equipo.",
    "Clubs and teams around Cartersville": "Clubes y equipos en Cartersville",
    "All groups": "Todos los grupos",
    "Community clubs": "Clubes comunitarios",
    "Favorite": "Agregar a favoritos",
    "Favorited": "En favoritos",
    "Open opportunities": "Ver oportunidades",
    "Join / signup": "Unirse / inscribirse",
    "Upcoming team and club events": "Próximos eventos de equipos y clubes",
    "Mayor Matt Santini": "Alcalde Matt Santini",
    "Contact the mayor's office": "Contactar con la oficina del alcalde",
  },
  fr: {
    "Find a local program, discover what's happening downtown, or get connected to support in Cartersville.": "Trouvez un programme local, découvrez ce qui se passe au centre-ville ou accédez à de l'aide à Cartersville.",
    "Downtown Community Events": "Événements communautaires du centre-ville",
    "Browse the City of Cartersville's current calendar for downtown gatherings and happenings.": "Consultez le calendrier actuel de City of Cartersville pour les rassemblements et événements du centre-ville.",
    "Find parks, programs, athletic schedules, and ways to get active around Cartersville.": "Découvrez les parcs, les programmes, les horaires sportifs et les activités autour de Cartersville.",
    "Find the right City of Cartersville department for questions, services, and municipal information.": "Trouvez le service de City of Cartersville adapté à vos questions et à vos besoins en services et informations municipales.",
    "Connect with local referrals for food, housing, health care, utility help, and more.": "Trouvez des ressources locales pour l'alimentation, le logement, les soins de santé, les factures de services publics et plus encore.",
    "See activities offered through the city's recreation registration portal.": "Découvrez les activités proposées sur le portail d'inscription aux loisirs de la ville.",
    "Check facility availability and reservation information with Parks & Recreation.": "Vérifiez la disponibilité des installations et les modalités de réservation auprès de Parks & Recreation.",
    "Verified starting points for programs, recreation, community gatherings, and essential support in and around town.": "Des ressources vérifiées pour les programmes, les loisirs, les rassemblements communautaires et l'aide essentielle dans la ville et ses environs.",
    "Translate page": "Traduire la page",
    "Skip to content": "Aller au contenu",
    "Home": "Accueil",
    "Main navigation": "Navigation principale",
    "Open navigation": "Ouvrir la navigation",
    "Close navigation": "Fermer la navigation",
    "Accessibility": "Accessibilité",
    "Accessibility settings": "Paramètres d'accessibilité",
    "Larger text": "Texte plus grand",
    "High contrast": "Contraste élevé",
    "Underline links": "Souligner les liens",
    "Reduce motion": "Réduire les animations",
    "Reset settings": "Réinitialiser les paramètres",
    "Explore local resources": "Découvrir les ressources locales",
    "See upcoming events": "Voir les événements à venir",
    "Start with what you need": "Commencez par ce dont vous avez besoin",
    "Parks & programs": "Parcs et programmes",
    "Community events": "Événements communautaires",
    "Everyday support": "Aide au quotidien",
    "Ask a neighbor": "Demander à un voisin",
    "Local places to begin": "Où commencer localement",
    "Parks & recreation": "Parcs et loisirs",
    "Local events": "Événements locaux",
    "City services": "Services municipaux",
    "Find local help": "Trouver de l'aide locale",
    "Activities": "Activités",
    "Reserve a space": "Réserver un espace",
    "Explore city programs": "Découvrir les programmes municipaux",
    "Open downtown calendar": "Ouvrir le calendrier du centre-ville",
    "Browse departments": "Consulter les services",
    "Find an activity": "Trouver une activité",
    "View facilities": "Voir les installations",
    "On the city calendar": "Au calendrier municipal",
    "Plan a little time together": "Prévoyez un moment ensemble",
    "Selected date": "Date sélectionnée",
    "Year-round volunteer listings": "Offres de bénévolat toute l'année",
    "Published dates": "Dates publiées",
    "My clubs calendar": "Calendrier de mes clubs",
    "My favorites": "Mes favoris",
    "Bookmark": "Enregistrer",
    "Saved": "Enregistré",
    "Completed": "Terminé",
    "RSVP / details": "Confirmer sa présence / détails",
    "Add volunteer event": "Ajouter un événement bénévole",
    "Date and start time (Georgia local time)": "Date et heure de début (heure locale de Georgia)",
    "Specific place": "Lieu précis",
    "Event description (10 words minimum)": "Description de l'événement (10 mots minimum)",
    "Your private conversation": "Votre conversation privée",
    "Your reply": "Votre réponse",
    "Write a reply...": "Écrivez une réponse...",
    "Reply": "Répondre",
    "Close": "Fermer",
    "Official email": "Adresse e-mail officielle",
    "Office address": "Adresse du bureau",
    "Mailing address": "Adresse postale",
    "Official city profile": "Profil officiel de la ville",
    "English": "Anglais",
    "Page language": "Langue de la page",
    "Local resources": "Ressources locales",
    "Calendar": "Calendrier",
    "Volunteer": "Bénévolat",
    "Clubs & teams": "Clubs et équipes",
    "Mayor": "Maire",
    "Ask a question": "Poser une question",
    "Need help now": "Besoin d'aide maintenant",
    "Good things are closer than you think.": "Les bonnes choses sont plus proches que vous ne le pensez.",
    "A neighbor-to-neighbor guide": "Un guide de voisin à voisin",
    "A little help goes a long way.": "Un petit coup de main peut beaucoup aider.",
    "What's happening around town": "Ce qui se passe en ville",
    "Community calendar": "Calendrier communautaire",
    "Today": "Aujourd'hui",
    "Previous month": "Mois précédent",
    "Next month": "Mois suivant",
    "All": "Tous",
    "Sports": "Sports",
    "Clubs": "Clubs",
    "Volunteering": "Bénévolat",
    "Community": "Communauté",
    "Work holidays": "Jours fériés",
    "My clubs": "Mes clubs",
    "Saved events": "Événements enregistrés",
    "Find a way to pitch in.": "Trouvez un moyen de donner un coup de main.",
    "Send a private message": "Envoyer un message privé",
    "Your name": "Votre nom",
    "Email address": "Adresse e-mail",
    "Your message": "Votre message",
    "Send privately": "Envoyer en privé",
    "Find your people. Join a team.": "Trouvez votre groupe. Rejoignez une équipe.",
    "Clubs and teams around Cartersville": "Clubs et équipes autour de Cartersville",
    "All groups": "Tous les groupes",
    "Community clubs": "Clubs communautaires",
    "Favorite": "Ajouter aux favoris",
    "Favorited": "Dans les favoris",
    "Open opportunities": "Voir les opportunités",
    "Join / signup": "Rejoindre / s'inscrire",
    "Upcoming team and club events": "Prochains événements sportifs et associatifs",
    "Mayor Matt Santini": "Maire Matt Santini",
    "Contact the mayor's office": "Contacter le bureau du maire",
  },
  de: {
    "Find a local program, discover what's happening downtown, or get connected to support in Cartersville.": "Finden Sie ein lokales Angebot, entdecken Sie Veranstaltungen in der Innenstadt oder erhalten Sie Unterstützung in Cartersville.",
    "Downtown Community Events": "Gemeinschaftsveranstaltungen in der Innenstadt",
    "Browse the City of Cartersville's current calendar for downtown gatherings and happenings.": "Im aktuellen Kalender von City of Cartersville finden Sie Treffen und Veranstaltungen in der Innenstadt.",
    "Find parks, programs, athletic schedules, and ways to get active around Cartersville.": "Entdecken Sie Parks, Programme, Sporttermine und Möglichkeiten, in und um Cartersville aktiv zu werden.",
    "Find the right City of Cartersville department for questions, services, and municipal information.": "Finden Sie die zuständige Abteilung von City of Cartersville für Fragen, Dienstleistungen und städtische Informationen.",
    "Connect with local referrals for food, housing, health care, utility help, and more.": "Finden Sie lokale Hilfsangebote für Lebensmittel, Wohnen, Gesundheitsversorgung, Versorgungsrechnungen und mehr.",
    "See activities offered through the city's recreation registration portal.": "Sehen Sie sich die Aktivitäten im städtischen Anmeldeportal für Freizeitangebote an.",
    "Check facility availability and reservation information with Parks & Recreation.": "Informieren Sie sich bei Parks & Recreation über verfügbare Einrichtungen und Reservierungen.",
    "Verified starting points for programs, recreation, community gatherings, and essential support in and around town.": "Geprüfte Anlaufstellen für Programme, Freizeit, Gemeinschaftstreffen und wichtige Unterstützung in der Stadt und Umgebung.",
    "Translate page": "Seite übersetzen",
    "Skip to content": "Zum Inhalt springen",
    "Home": "Startseite",
    "Main navigation": "Hauptnavigation",
    "Open navigation": "Navigation öffnen",
    "Close navigation": "Navigation schließen",
    "Accessibility": "Barrierefreiheit",
    "Accessibility settings": "Einstellungen zur Barrierefreiheit",
    "Larger text": "Größere Schrift",
    "High contrast": "Hoher Kontrast",
    "Underline links": "Links unterstreichen",
    "Reduce motion": "Bewegungen reduzieren",
    "Reset settings": "Einstellungen zurücksetzen",
    "Explore local resources": "Lokale Angebote entdecken",
    "See upcoming events": "Kommende Veranstaltungen ansehen",
    "Start with what you need": "Beginnen Sie mit dem, was Sie brauchen",
    "Parks & programs": "Parks und Programme",
    "Community events": "Gemeinschaftsveranstaltungen",
    "Everyday support": "Hilfe im Alltag",
    "Ask a neighbor": "Nachbarn fragen",
    "Local places to begin": "Anlaufstellen vor Ort",
    "Parks & recreation": "Parks und Freizeit",
    "Local events": "Lokale Veranstaltungen",
    "City services": "Städtische Dienstleistungen",
    "Find local help": "Hilfe vor Ort finden",
    "Activities": "Aktivitäten",
    "Reserve a space": "Einen Raum reservieren",
    "Explore city programs": "Städtische Programme entdecken",
    "Open downtown calendar": "Innenstadtkalender öffnen",
    "Browse departments": "Abteilungen ansehen",
    "Find an activity": "Eine Aktivität finden",
    "View facilities": "Einrichtungen ansehen",
    "On the city calendar": "Im städtischen Kalender",
    "Plan a little time together": "Planen Sie gemeinsame Zeit",
    "Selected date": "Ausgewähltes Datum",
    "Year-round volunteer listings": "Ganzjährige Angebote für Freiwillige",
    "Published dates": "Veröffentlichte Termine",
    "My clubs calendar": "Kalender meiner Vereine",
    "My favorites": "Meine Favoriten",
    "Bookmark": "Speichern",
    "Saved": "Gespeichert",
    "Completed": "Abgeschlossen",
    "RSVP / details": "Teilnahme anmelden / Details",
    "Add volunteer event": "Freiwilligenveranstaltung hinzufügen",
    "Date and start time (Georgia local time)": "Datum und Beginn (Ortszeit Georgia)",
    "Specific place": "Genauer Ort",
    "Event description (10 words minimum)": "Veranstaltungsbeschreibung (mindestens 10 Wörter)",
    "Your private conversation": "Ihre private Unterhaltung",
    "Your reply": "Ihre Antwort",
    "Write a reply...": "Schreiben Sie eine Antwort...",
    "Reply": "Antworten",
    "Close": "Schließen",
    "Official email": "Offizielle E-Mail-Adresse",
    "Office address": "Büroadresse",
    "Mailing address": "Postanschrift",
    "Official city profile": "Offizielles Stadtprofil",
    "English": "Englisch",
    "Page language": "Seitensprache",
    "Local resources": "Lokale Angebote",
    "Calendar": "Kalender",
    "Volunteer": "Freiwilligenarbeit",
    "Clubs & teams": "Vereine und Teams",
    "Mayor": "Bürgermeister",
    "Ask a question": "Eine Frage stellen",
    "Need help now": "Jetzt Hilfe benötigen",
    "Good things are closer than you think.": "Gute Dinge sind näher, als Sie denken.",
    "A neighbor-to-neighbor guide": "Ein Nachbarschaftsführer",
    "A little help goes a long way.": "Ein bisschen Hilfe bewirkt viel.",
    "What's happening around town": "Was passiert in der Stadt",
    "Community calendar": "Gemeinschaftskalender",
    "Today": "Heute",
    "Previous month": "Vorheriger Monat",
    "Next month": "Nächster Monat",
    "All": "Alle",
    "Sports": "Sport",
    "Clubs": "Vereine",
    "Volunteering": "Freiwilligenarbeit",
    "Community": "Gemeinschaft",
    "Work holidays": "Arbeitsfreie Feiertage",
    "My clubs": "Meine Vereine",
    "Saved events": "Gespeicherte Veranstaltungen",
    "Find a way to pitch in.": "Finden Sie eine Möglichkeit zu helfen.",
    "Send a private message": "Private Nachricht senden",
    "Your name": "Ihr Name",
    "Email address": "E-Mail-Adresse",
    "Your message": "Ihre Nachricht",
    "Send privately": "Privat senden",
    "Find your people. Join a team.": "Finden Sie Ihre Leute. Treten Sie einem Team bei.",
    "Clubs and teams around Cartersville": "Vereine und Teams in Cartersville",
    "All groups": "Alle Gruppen",
    "Community clubs": "Gemeinschaftsvereine",
    "Favorite": "Zu Favoriten hinzufügen",
    "Favorited": "Favorisiert",
    "Open opportunities": "Möglichkeiten ansehen",
    "Join / signup": "Beitreten / anmelden",
    "Upcoming team and club events": "Kommende Team- und Vereinsveranstaltungen",
    "Mayor Matt Santini": "Bürgermeister Matt Santini",
    "Contact the mayor's office": "Bürgermeisterbüro kontaktieren",
  },
};

const clubTranslations = {
  "youth-basketball": {
    es: ["Baloncesto juvenil", "Cartersville Parks & Recreation ofrece baloncesto para jóvenes de cinco a diecisiete años, con categorías por edad, inscripción, evaluaciones, entrenadores, medidas de seguridad y horarios de partidos. La inscripción para 2026 cerró; las próximas fechas se publicarán en línea. Confirme los límites de edad, tarifas, documentos, fechas de evaluación y gimnasios con el departamento antes de asistir.", "La inscripción de 2026 cerró. Las fechas de evaluación aparecen abajo; aún no se publican las inscripciones de la próxima temporada.", "Detalles del baloncesto de 2026"],
    fr: ["Basketball jeunesse", "Cartersville Parks & Recreation propose du basketball aux jeunes de cinq à dix-sept ans, avec catégories d'âge, inscription, évaluations, entraîneurs, mesures de sécurité et horaires des matchs. Les inscriptions pour 2026 sont closes ; les prochaines dates seront publiées en ligne. Vérifiez auprès du service les âges admissibles, frais, documents, dates d'évaluation et gymnases avant de venir.", "Les inscriptions pour 2026 sont closes. Les dates d'évaluation figurent ci-dessous ; celles de la prochaine saison ne sont pas encore publiées.", "Détails du basketball 2026"],
    de: ["Jugendbasketball", "Cartersville Parks & Recreation bietet Basketball für Kinder und Jugendliche von fünf bis siebzehn Jahren mit Altersklassen, Anmeldung, Sichtungen, Trainern, Sicherheitsmaßnahmen und Spielplänen an. Die Anmeldung für 2026 ist geschlossen; künftige Termine werden online veröffentlicht. Erkundigen Sie sich vor der Teilnahme bei der Abteilung nach Altersgrenzen, Gebühren, Unterlagen, Sichtungsterminen und Sporthallen.", "Die Anmeldung für 2026 ist geschlossen. Sichtungstermine stehen unten; Anmeldetermine für die nächste Saison sind noch nicht veröffentlicht.", "Basketball-Details 2026"],
  },
  "boys-baseball": {
    es: ["Tee ball y béisbol para niños", "El tee ball y el béisbol con lanzamiento del entrenador de Cartersville Parks & Recreation enseñan a los jóvenes fundamentos, confianza y trabajo en equipo. La inscripción de 2026 estuvo abierta del 12 de enero al 22 de febrero y ya terminó. La ciudad publica futuras categorías de edad, tarifas, entrenamientos e instrucciones de inscripción en la página del programa.", "La inscripción de 2026 cerró el 22 de febrero; consulte la página de la ciudad para la próxima temporada.", "Detalles del programa de béisbol"],
    fr: ["Tee-ball et baseball pour garçons", "Le tee-ball et le baseball avec lancer par l'entraîneur de Cartersville Parks & Recreation initient les jeunes aux techniques de base, à la confiance et au travail d'équipe. Les inscriptions 2026, ouvertes du 12 janvier au 22 février, sont closes. La ville publie les prochaines catégories d'âge, les frais, les entraînements et les instructions d'inscription sur la page du programme.", "Les inscriptions 2026 ont fermé le 22 février ; consultez la page de la ville pour la prochaine saison.", "Détails du programme de baseball"],
    de: ["Tee-Ball und Baseball für Jungen", "Beim Tee-Ball und Baseball mit Trainerwürfen von Cartersville Parks & Recreation lernen junge Spieler Grundlagen, Selbstvertrauen und Teamarbeit. Die Anmeldung für 2026 lief vom 12. Januar bis zum 22. Februar und ist beendet. Die Stadt veröffentlicht künftige Altersklassen, Gebühren, Trainingstermine und Anmeldehinweise auf der Programmseite.", "Die Anmeldung für 2026 endete am 22. Februar; Informationen zur nächsten Saison stehen auf der Stadtseite.", "Details zum Baseballprogramm"],
  },
  "girls-softball": {
    es: ["Sóftbol para niñas", "Cartersville Parks & Recreation ofrece sóftbol para jóvenes de la comunidad, con categorías de tee ball, lanzamiento del entrenador y lanzamiento rápido. La inscripción de 2026 cerró; consulte la página del programa para fechas de la próxima temporada, edades, tarifas y documentos requeridos. Las familias también pueden consultar los campamentos y horarios municipales antes de inscribirse.", "La inscripción de 2026 cerró el 22 de febrero; consulte la página de la ciudad para la próxima temporada.", "Detalles del programa de sóftbol"],
    fr: ["Softball pour filles", "Cartersville Parks & Recreation propose du softball aux jeunes locales, avec des catégories de tee-ball, de lancer par l'entraîneur et de lancer rapide. Les inscriptions 2026 sont closes ; la page du programme indique les dates de la prochaine saison, les âges, les frais et les documents requis. Les familles peuvent aussi consulter les camps et horaires municipaux avant de s'inscrire.", "Les inscriptions 2026 ont fermé le 22 février ; consultez la page de la ville pour la prochaine saison.", "Détails du programme de softball"],
    de: ["Softball für Mädchen", "Cartersville Parks & Recreation bietet Softball für Mädchen vor Ort mit Tee-Ball, Trainerwurf und schnellem Pitching an. Die Anmeldung für 2026 ist geschlossen; auf der Programmseite stehen Termine für die nächste Saison, Altersgruppen, Gebühren und erforderliche Unterlagen. Familien können sich vor der Anmeldung auch über städtische Camps und Termine informieren.", "Die Anmeldung für 2026 endete am 22. Februar; Informationen zur nächsten Saison stehen auf der Stadtseite.", "Details zum Softballprogramm"],
  },
  "adult-recreation": {
    es: ["Ligas recreativas para adultos", "Cartersville Parks & Recreation ofrece deportes y actividades para adultos como baloncesto, sóftbol de temporada, kickball, pickleball y fútbol bandera. Las ligas pueden tener plazos de inscripción, reglas de equipo y requisitos de edad. Consulte cada programa antes de formar un equipo, pagar o viajar a un partido, pues las fechas y formatos cambian.", "Las inscripciones de kickball y fútbol bandera de 2026 cerraron; no se han publicado nuevas fechas.", "Programas para adultos"],
    fr: ["Ligues de loisirs pour adultes", "Cartersville Parks & Recreation propose des sports et loisirs pour adultes, dont le basketball, le softball saisonnier, le kickball, le pickleball et le football sans contact. Les ligues peuvent imposer des périodes d'inscription, des règles d'équipe et des conditions d'âge. Consultez chaque programme avant de former une équipe, de payer ou de vous déplacer, car les dates et formats changent.", "Les inscriptions 2026 au kickball et au football sans contact sont closes ; aucune nouvelle date n'est publiée.", "Programmes pour adultes"],
    de: ["Freizeitligen für Erwachsene", "Cartersville Parks & Recreation bietet Sport und Freizeitaktivitäten für Erwachsene wie Basketball, saisonalen Softball, Kickball, Pickleball und Flag Football an. Für Mannschaftsligen können Anmeldefristen, Kaderregeln und Altersgrenzen gelten. Prüfen Sie vor der Mannschaftsplanung, Gebührenzahlung oder Anreise die jeweilige Programmseite, da Termine und Formate wechseln.", "Die Anmeldung für Kickball und Flag Football 2026 ist geschlossen; neue Termine sind noch nicht veröffentlicht.", "Programme für Erwachsene"],
  },
  "cartersville-little-league": {
    es: ["Cartersville Little League", "La ciudad incluye a Cartersville Little League entre sus programas recreativos juveniles como organización local de béisbol. Las familias pueden consultar el sitio oficial de la liga para conocer categorías, avisos de inscripción, información de temporada y datos de contacto. Como los plazos cambian, confirme con la liga las edades admitidas, tarifas y fechas antes de inscribirse.", "Consulte el sitio de la liga para conocer las fechas actuales de inscripción y partidos.", "Sitio oficial del club"],
    fr: ["Cartersville Little League", "La ville présente Cartersville Little League parmi ses programmes de loisirs jeunesse comme organisation locale de baseball. Les familles peuvent consulter le site officiel de la ligue pour les catégories, avis d'inscription, informations sur la saison et coordonnées. Les périodes d'inscription changent ; confirmez les âges admissibles, frais et dates auprès de la ligue avant de vous inscrire.", "Consultez le site de la ligue pour les dates actuelles d'inscription et de match.", "Site officiel du club"],
    de: ["Cartersville Little League", "Die Stadt führt Cartersville Little League neben ihren Jugendfreizeitprogrammen als lokale Baseballorganisation auf. Auf der offiziellen Website der Liga finden Familien Altersklassen, Anmeldehinweise, Informationen zur Saison und Kontaktdaten. Da sich Anmeldefristen ändern, bestätigen Sie vor der Anmeldung Altersgrenzen, Gebühren und Termine bei der Liga.", "Aktuelle Anmelde- und Spieltermine stehen auf der Website der Liga.", "Offizielle Vereinswebsite"],
  },
  "rotary-etowah": {
    es: ["Rotary Club of Etowah", "Rotary Club of Etowah es un club de servicio comunitario del área de Cartersville. La biografía oficial del alcalde registra su membresía fundadora desde 2002 y su presidencia del club en 2003. Las personas interesadas pueden usar el buscador de Rotary International para confirmar reuniones, contactos de membresía y oportunidades de servicio antes de visitar el club.", "Use el buscador oficial de Rotary para confirmar el horario actual de reuniones.", "Biografía municipal que menciona el club"],
    fr: ["Rotary Club of Etowah", "Rotary Club of Etowah est un club de service communautaire de la région de Cartersville. La biographie officielle du maire indique qu'il en est membre fondateur depuis 2002 et l'a présidé en 2003. Les personnes intéressées peuvent utiliser l'annuaire de Rotary International pour confirmer les réunions, contacts d'adhésion et possibilités de service avant une visite.", "Utilisez l'annuaire officiel de Rotary pour confirmer les horaires actuels des réunions.", "Biographie municipale mentionnant le club"],
    de: ["Rotary Club of Etowah", "Rotary Club of Etowah ist ein gemeinnütziger Club im Raum Cartersville. Die offizielle Biografie des Bürgermeisters nennt seine Gründungsmitgliedschaft seit 2002 und seine Clubpräsidentschaft im Jahr 2003. Interessierte können über die Clubsuche von Rotary International aktuelle Treffen, Kontakte zur Mitgliedschaft und lokale Einsatzmöglichkeiten vor einem Besuch bestätigen.", "Bestätigen Sie die aktuellen Treffen über die offizielle Clubsuche von Rotary.", "Städtische Biografie mit Erwähnung des Clubs"],
  },
  "cartersville-bartow-chamber": {
    es: ["Cartersville-Bartow Chamber", "Cartersville-Bartow Chamber conecta a empresas y miembros de la comunidad mediante membresías, redes profesionales, programas educativos, un directorio y calendarios y reuniones públicas. Las personas y organizaciones pueden consultar los eventos antes de decidir si desean unirse. Use la solicitud y el directorio oficiales para conocer contactos, beneficios, requisitos y tarifas actuales.", "El sitio de la cámara publica calendarios de eventos para miembros y la comunidad.", "Sitio de la cámara"],
    fr: ["Cartersville-Bartow Chamber", "Cartersville-Bartow Chamber relie les entreprises et les membres de la communauté par l'adhésion, le réseautage, les programmes éducatifs, un annuaire et des calendriers et rencontres publics. Les personnes et organisations peuvent consulter les événements avant de décider d'adhérer. Consultez la demande d'adhésion et l'annuaire officiels pour les contacts, avantages, conditions et frais actuels.", "Le site de la chambre publie les calendriers des événements destinés aux membres et à la communauté.", "Site de la chambre"],
    de: ["Cartersville-Bartow Chamber", "Cartersville-Bartow Chamber verbindet lokale Unternehmen und Gemeinschaftsmitglieder durch Mitgliedschaften, Netzwerke, Bildungsprogramme, ein Mitgliederverzeichnis sowie öffentliche Veranstaltungen und Kalender. Personen und Organisationen können Veranstaltungen ansehen, bevor sie über einen Beitritt entscheiden. Nutzen Sie den offiziellen Mitgliedsantrag und das Verzeichnis für aktuelle Kontakte, Vorteile, Voraussetzungen und Gebühren.", "Die Website der Kammer veröffentlicht Veranstaltungspläne für Mitglieder und die Gemeinschaft.", "Website der Kammer"],
  },
  "cartersville-high-volunteers": {
    es: ["Oportunidades de voluntariado de Cartersville High", "Los estudiantes de Cartersville High pueden proponer oportunidades de voluntariado exclusivas de la escuela mediante el calendario comunitario. El creador de eventos es una demostración local claramente identificada, no un inicio de sesión escolar; no recopila credenciales de Microsoft y está desactivado en producción. Marque esta opción como favorita para encontrar eventos escolares cuando se publiquen fechas oficiales.", "La verificación de cuentas escolares no está configurada; la creación de eventos es solo una demostración.", "Creador de eventos estudiantiles"],
    fr: ["Possibilités de bénévolat de Cartersville High", "Les élèves de Cartersville High peuvent proposer des activités de bénévolat réservées à l'école dans le calendrier communautaire. L'outil actuel est une démonstration locale clairement indiquée, et non une connexion scolaire ; il ne recueille aucun identifiant Microsoft et est désactivé en production. Ajoutez cette entrée aux favoris pour trouver les événements admissibles lorsque les dates officielles seront publiées.", "La vérification des comptes scolaires n'est pas configurée ; la création d'événements est une démonstration.", "Créateur d'événements étudiants"],
    de: ["Freiwilligenangebote von Cartersville High", "Schüler von Cartersville High können über den Gemeinschaftskalender schulinterne Freiwilligenangebote vorschlagen. Das aktuelle Werkzeug ist eine deutlich gekennzeichnete lokale Demo, keine Schulanmeldung; es erfasst keine Microsoft-Zugangsdaten und ist im Produktivbetrieb deaktiviert. Markieren Sie diesen Eintrag als Favorit, um passende Schulveranstaltungen zu finden, sobald offizielle Termine veröffentlicht werden.", "Die Prüfung von Schulkonten ist nicht eingerichtet; das Erstellen von Veranstaltungen ist nur eine Demo.", "Veranstaltungserstellung für Schüler"],
  },
};

const pageTranslations = [
  ["Sources & credits", "Fuentes y créditos", "Sources et crédits", "Quellen und Bildnachweise"],
  ["Information is summarized from official sources. Dates and availability can change; confirm details with the organizer.", "La información se resume de fuentes oficiales. Las fechas y la disponibilidad pueden cambiar; confirme los detalles con el organizador.", "Les informations résument des sources officielles. Les dates et disponibilités peuvent changer ; confirmez les détails auprès de l'organisateur.", "Die Informationen fassen offizielle Quellen zusammen. Termine und Verfügbarkeit können sich ändern; bestätigen Sie Details beim Veranstalter."],
  ["City of Cartersville events and meetings", "Eventos y reuniones de City of Cartersville", "Événements et réunions de City of Cartersville", "Veranstaltungen und Sitzungen von City of Cartersville"],
  ["City of Cartersville mayor biography and contact information", "Biografía y datos de contacto del alcalde de City of Cartersville", "Biographie et coordonnées du maire de City of Cartersville", "Biografie und Kontaktdaten des Bürgermeisters von City of Cartersville"],
  ["U.S. Office of Personnel Management federal holidays", "Días festivos federales de U.S. Office of Personnel Management", "Jours fériés fédéraux de U.S. Office of Personnel Management", "Bundesfeiertage des U.S. Office of Personnel Management"],
  ["Image and type credits", "Créditos de imágenes y tipografías", "Crédits des images et polices", "Bild- und Schriftquellen"],
  ["These photographs show Cartersville scenes and are illustrative, not necessarily the locations of the listed services.", "Estas fotografías muestran lugares de Cartersville y son ilustrativas; no necesariamente muestran las ubicaciones de los servicios indicados.", "Ces photographies montrent des lieux de Cartersville à titre illustratif, et pas nécessairement les lieux des services indiqués.", "Diese Fotos zeigen Orte in Cartersville und dienen zur Illustration; sie zeigen nicht unbedingt die Standorte der aufgeführten Angebote."],
  ["Photo titles link to their source pages on Wikimedia Commons.", "Los títulos de las fotografías enlazan a sus páginas de origen en Wikimedia Commons.", "Les titres des photographies renvoient à leurs pages sources sur Wikimedia Commons.", "Die Fototitel verlinken auf ihre Quellseiten bei Wikimedia Commons."],
  ["All photographs are available under", "Todas las fotografías están disponibles bajo", "Toutes les photographies sont disponibles sous", "Alle Fotos stehen unter"],
  [". Images are resized and may be cropped on screen.", ". Las imágenes se han redimensionado y pueden aparecer recortadas en pantalla.", ". Les images ont été redimensionnées et peuvent être recadrées à l'écran.", ". Die Bilder wurden verkleinert und können auf dem Bildschirm beschnitten dargestellt werden."],
  ["Hero", "Imagen principal", "Image principale", "Hauptbild"],
  ["Parks", "Parques", "Parcs", "Parks"],
  ["Events", "Eventos", "Événements", "Veranstaltungen"],
  ["Community support", "Apoyo comunitario", "Soutien communautaire", "Unterstützung für die Gemeinschaft"],
  ["Facility reservations", "Reservas de instalaciones", "Réservation d'installations", "Reservierung von Einrichtungen"],
  ["Downtown Main Street, Cartersville (2017)", "Main Street en el centro de Cartersville (2017)", "Main Street au centre de Cartersville (2017)", "Main Street in der Innenstadt von Cartersville (2017)"],
  ["Dellinger Park, Cartersville (2018, photo 1)", "Dellinger Park, Cartersville (2018, foto 1)", "Dellinger Park, Cartersville (2018, photo 1)", "Dellinger Park, Cartersville (2018, Foto 1)"],
  ["Downtown Cartersville from Pine Mountain (2015)", "Centro de Cartersville desde Pine Mountain (2015)", "Centre de Cartersville vu de Pine Mountain (2015)", "Innenstadt von Cartersville von Pine Mountain aus (2015)"],
  ["Cartersville City Hall (2015)", "Ayuntamiento de Cartersville (2015)", "Hôtel de ville de Cartersville (2015)", "Rathaus von Cartersville (2015)"],
  ["Cartersville Public Library (2017)", "Cartersville Public Library (2017)", "Cartersville Public Library (2017)", "Cartersville Public Library (2017)"],
  ["Dellinger Park, Cartersville (2018, photo 2)", "Dellinger Park, Cartersville (2018, foto 2)", "Dellinger Park, Cartersville (2018, photo 2)", "Dellinger Park, Cartersville (2018, Foto 2)"],
  ["Dellinger Park pavilion (2023)", "Pabellón de Dellinger Park (2023)", "Pavillon de Dellinger Park (2023)", "Pavillon im Dellinger Park (2023)"],
  ["Typefaces:", "Tipografías:", "Polices :", "Schriftarten:"],
  ["— The Manrope Project Authors. Both use the SIL Open Font License 1.1.", "— The Manrope Project Authors. Ambas utilizan la licencia SIL Open Font License 1.1.", "— The Manrope Project Authors. Les deux utilisent la licence SIL Open Font License 1.1.", "— The Manrope Project Authors. Beide verwenden die SIL Open Font License 1.1."],
  ["Lake and fountain at Dellinger Park", "Lago y fuente en Dellinger Park", "Lac et fontaine à Dellinger Park", "See und Springbrunnen im Dellinger Park"],
  ["Downtown Cartersville viewed from Pine Mountain", "Centro de Cartersville visto desde Pine Mountain", "Centre de Cartersville vu depuis Pine Mountain", "Innenstadt von Cartersville von Pine Mountain aus gesehen"],
  ["Cartersville City Hall", "Ayuntamiento de Cartersville", "Hôtel de ville de Cartersville", "Rathaus von Cartersville"],
  ["Cartersville Public Library in winter", "Cartersville Public Library en invierno", "Cartersville Public Library en hiver", "Cartersville Public Library im Winter"],
  ["Walkway to a pavilion at Dellinger Park", "Pasarela hacia un pabellón en Dellinger Park", "Passerelle vers un pavillon à Dellinger Park", "Weg zu einem Pavillon im Dellinger Park"],
  ["Lake and pavilion at Dellinger Park", "Lago y pabellón en Dellinger Park", "Lac et pavillon à Dellinger Park", "See und Pavillon im Dellinger Park"],
  ["Unsplash License", "Licencia de Unsplash", "Licence Unsplash", "Unsplash-Lizenz"],
  ["Unsplash image", "Imagen de Unsplash", "Image Unsplash", "Unsplash-Bild"],
  ["View the official mayor profile and portrait on the City of Cartersville website", "Ver el perfil y retrato oficiales del alcalde en el sitio de City of Cartersville", "Voir le profil et le portrait officiels du maire sur le site de City of Cartersville", "Das offizielle Bürgermeisterprofil und Porträt auf der Website von City of Cartersville ansehen"],
  ["Planning Commission Meeting", "Reunión de la Comisión de Planificación", "Réunion de la commission d'urbanisme", "Sitzung der Planungskommission"],
  ["Board of Zoning Appeals Meeting", "Reunión de la Junta de Apelaciones de Zonificación", "Réunion de la commission des recours en zonage", "Sitzung des Ausschusses für Bebauungseinsprüche"],
  ["Historic Preservation Commission Meeting", "Reunión de la Comisión de Conservación Histórica", "Réunion de la commission de conservation du patrimoine", "Sitzung der Denkmalschutzkommission"],
  ["City Council Meeting", "Reunión del concejo municipal", "Réunion du conseil municipal", "Stadtratssitzung"],
  ["Sun", "Dom", "dim.", "So"],
  ["Mon", "Lun", "lun.", "Mo"],
  ["Tue", "Mar", "mar.", "Di"],
  ["Wed", "Mié", "mer.", "Mi"],
  ["Thu", "Jue", "jeu.", "Do"],
  ["Fri", "Vie", "ven.", "Fr"],
  ["Sat", "Sáb", "sam.", "Sa"],
  ["5:30 PM Eastern · Cartersville, GA 30120; confirm venue on official page. Check the official page for attendance details.", "5:30 p. m., hora del este · Cartersville, GA 30120; confirme el lugar en la página oficial. Consulte esa página para conocer los requisitos de asistencia.", "17 h 30, heure de l'Est · Cartersville, GA 30120 ; confirmez le lieu sur la page officielle. Consultez cette page pour les conditions de participation.", "17:30 Uhr, US-Ostküstenzeit · Cartersville, GA 30120; bestätigen Sie den Veranstaltungsort auf der offiziellen Seite. Dort finden Sie auch Einzelheiten zur Teilnahme."],
  ["7:00 PM Eastern · Cartersville, GA 30120; confirm venue on official page. Check the official page for attendance details.", "7:00 p. m., hora del este · Cartersville, GA 30120; confirme el lugar en la página oficial. Consulte esa página para conocer los requisitos de asistencia.", "19 h, heure de l'Est · Cartersville, GA 30120 ; confirmez le lieu sur la page officielle. Consultez cette page pour les conditions de participation.", "19:00 Uhr, US-Ostküstenzeit · Cartersville, GA 30120; bestätigen Sie den Veranstaltungsort auf der offiziellen Seite. Dort finden Sie auch Einzelheiten zur Teilnahme."],
  ["Nothing listed for this day yet.", "Aún no hay eventos para este día.", "Aucun événement n'est encore prévu pour cette journée.", "Für diesen Tag sind noch keine Veranstaltungen eingetragen."],
  ["No saved events on this day.", "No hay eventos guardados para este día.", "Aucun événement enregistré pour cette journée.", "Für diesen Tag sind keine Veranstaltungen gespeichert."],
  ["No published dates from your favorite groups on this day yet.", "Aún no hay fechas publicadas de sus grupos favoritos para este día.", "Aucune date publiée par vos groupes favoris pour cette journée.", "Für diesen Tag sind noch keine Termine Ihrer Favoriten veröffentlicht."],
  ["Favorite a club on the clubs page to see its published dates here.", "Marque un club como favorito en la página de clubes para ver aquí sus fechas publicadas.", "Ajoutez un club aux favoris sur la page des clubs pour voir ses dates publiées ici.", "Markieren Sie einen Verein auf der Vereinsseite als Favoriten, um seine veröffentlichten Termine hier zu sehen."],
  ["Rome · current opportunities", "Rome · oportunidades actuales", "Rome · possibilités actuelles", "Rome · aktuelle Angebote"],
  ["Emerson · nearby listings", "Emerson · oportunidades cercanas", "Emerson · offres à proximité", "Emerson · Angebote in der Nähe"],
  ["Search near Emerson", "Buscar cerca de Emerson", "Rechercher près de Emerson", "In der Nähe von Emerson suchen"],
  ["A community guide for Cartersville, Georgia 30120. City event dates are subject to change; confirm details with the event host.", "Una guía comunitaria para Cartersville, Georgia 30120. Las fechas de los eventos municipales pueden cambiar; confirme los detalles con el organizador.", "Un guide communautaire pour Cartersville, Georgia 30120. Les dates des événements municipaux peuvent changer ; confirmez les détails auprès de l'organisateur.", "Ein Gemeinschaftsleitfaden für Cartersville, Georgia 30120. Termine städtischer Veranstaltungen können sich ändern; bestätigen Sie Einzelheiten beim Veranstalter."],
  ["For verified local referrals, contact", "Para recibir orientación local verificada, contacte a", "Pour des recommandations locales vérifiées, contactez", "Für geprüfte lokale Hilfsangebote wenden Sie sich an"],
  ["and the neighbors around it.", "y para los vecinos de sus alrededores.", "et pour les voisins des environs.", "und für die Nachbarn in der Umgebung."],
  ["Each listing goes straight to its event page on the official City of Cartersville website.", "Cada ficha lleva directamente a su página de evento en el sitio oficial de City of Cartersville.", "Chaque fiche mène directement à la page de l'événement sur le site officiel de City of Cartersville.", "Jeder Eintrag führt direkt zur Veranstaltungsseite auf der offiziellen Website von City of Cartersville."],
  ["RSVP / details opens the specific event page. City meetings may be open to the public without requiring an RSVP; check the host's page for attendance and schedule information.", "Confirmar asistencia / detalles abre la página específica del evento. Las reuniones municipales pueden estar abiertas al público sin confirmación; consulte la página del organizador para conocer los horarios y requisitos de asistencia.", "Confirmer sa présence / détails ouvre la page de l'événement. Les réunions municipales peuvent être ouvertes au public sans confirmation ; consultez la page de l'organisateur pour les horaires et les conditions de participation.", "Teilnahme anmelden / Details öffnet die jeweilige Veranstaltungsseite. Städtische Sitzungen können ohne Anmeldung öffentlich zugänglich sein; prüfen Sie Teilnahmebedingungen und Zeiten auf der Seite des Veranstalters."],
  ["More ways to get out and about", "Más formas de salir y participar", "D'autres façons de sortir et participer", "Weitere Möglichkeiten, unterwegs zu sein"],
  ["Races, parades, and neighborhood gatherings", "Carreras, desfiles y reuniones vecinales", "Courses, défilés et rencontres de quartier", "Läufe, Umzüge und Nachbarschaftstreffen"],
  ["Browse live organizer calendars for events that have not yet posted a date here.", "Consulte los calendarios actuales de los organizadores para eventos que aún no tienen fecha publicada aquí.", "Consultez les calendriers actuels des organisateurs pour les événements dont la date n'est pas encore publiée ici.", "Sehen Sie aktuelle Veranstalterkalender für Ereignisse an, deren Termin hier noch nicht veröffentlicht wurde."],
  ["Cartersville races and fun runs", "Carreras y recorridos recreativos en Cartersville", "Courses et parcours récréatifs à Cartersville", "Läufe und Freizeitläufe in Cartersville"],
  ["Search local running events, including 5Ks. Confirm the date, course, start time, and registration details with the organizer.", "Busque carreras locales, incluidas las de 5 km. Confirme la fecha, el recorrido, la hora de inicio y la inscripción con el organizador.", "Recherchez des courses locales, notamment de 5 km. Confirmez la date, le parcours, l'heure de départ et les modalités d'inscription auprès de l'organisateur.", "Suchen Sie lokale Laufveranstaltungen, darunter 5-km-Läufe. Bestätigen Sie Datum, Strecke, Startzeit und Anmeldung beim Veranstalter."],
  ["See current parade, festival, and downtown gathering announcements from the City of Cartersville calendar.", "Consulte los anuncios actuales de desfiles, festivales y reuniones en el centro en el calendario de City of Cartersville.", "Consultez les annonces actuelles de défilés, festivals et rassemblements du centre-ville dans le calendrier de City of Cartersville.", "Sehen Sie aktuelle Ankündigungen zu Umzügen, Festen und Treffen in der Innenstadt im Kalender von City of Cartersville."],
  ["Browse city meetings, office closures, U.S. holidays, parks programs, and other published local dates.", "Consulte reuniones municipales, cierres de oficinas, días festivos de Estados Unidos, programas de parques y otras fechas locales publicadas.", "Consultez les réunions municipales, fermetures de bureaux, jours fériés américains, programmes des parcs et autres dates locales publiées.", "Sehen Sie städtische Sitzungen, Büroschließungen, US-Feiertage, Parkprogramme und weitere veröffentlichte lokale Termine."],
  ["Browse city events and annual U.S. work holidays. Select a day to see its details.", "Consulte eventos municipales y días festivos laborales anuales de Estados Unidos. Seleccione un día para ver sus detalles.", "Consultez les événements municipaux et les jours fériés annuels aux États-Unis. Sélectionnez une journée pour voir les détails.", "Sehen Sie städtische Veranstaltungen und jährliche US-Feiertage an. Wählen Sie einen Tag für weitere Einzelheiten."],
  ["Suggest a school volunteering event for the calendar. Student access here is a local demo, not school-verified Microsoft sign-in.", "Sugiera un evento de voluntariado escolar para el calendario. El acceso estudiantil es una demostración local, no un inicio de sesión de Microsoft verificado por la escuela.", "Proposez une activité de bénévolat scolaire pour le calendrier. L'accès étudiant est une démonstration locale, et non une connexion Microsoft vérifiée par l'école.", "Schlagen Sie eine schulische Freiwilligenveranstaltung für den Kalender vor. Der Schülerzugang ist eine lokale Demo und keine von der Schule bestätigte Microsoft-Anmeldung."],
  ["No school credentials are collected. Production event creation stays disabled until real school sign-in is configured.", "No se recopilan credenciales escolares. La creación de eventos en producción permanece desactivada hasta configurar un inicio de sesión escolar real.", "Aucun identifiant scolaire n'est recueilli. La création d'événements en production reste désactivée jusqu'à la configuration d'une véritable connexion scolaire.", "Es werden keine Schulzugangsdaten erfasst. Die Veranstaltungserstellung im Produktivbetrieb bleibt deaktiviert, bis eine echte Schulanmeldung eingerichtet ist."],
  ["Holiday dates follow U.S. federal observances. Employer closures can differ. The City calendar remains the source for current local dates.", "Las fechas festivas siguen las observancias federales de Estados Unidos. Los cierres de empleadores pueden variar. El calendario municipal sigue siendo la fuente de las fechas locales actuales.", "Les dates fériées suivent les jours fédéraux américains. Les fermetures des employeurs peuvent varier. Le calendrier municipal reste la source des dates locales actuelles.", "Die Feiertage folgen den US-Bundesfeiertagen. Betriebsschließungen können abweichen. Der Stadtkalender bleibt die Quelle für aktuelle lokale Termine."],
  ["Use current local listings for real openings, shift times, and host requirements. Availability can change.", "Consulte las listas locales actuales para conocer oportunidades, horarios y requisitos de los organizadores. La disponibilidad puede cambiar.", "Consultez les offres locales actuelles pour les postes, horaires et conditions des organisateurs. Les disponibilités peuvent changer.", "Informieren Sie sich in aktuellen lokalen Angeboten über freie Plätze, Einsatzzeiten und Anforderungen der Veranstalter. Die Verfügbarkeit kann sich ändern."],
  ["Pine Mountain volunteer days", "Jornadas de voluntariado en Pine Mountain", "Journées de bénévolat à Pine Mountain", "Freiwilligentage am Pine Mountain"],
  ["Cartersville Parks & Recreation welcomes volunteers for a day or a few hours helping at Pine Mountain. Check the city page for current dates and tasks.", "Cartersville Parks & Recreation recibe a voluntarios por un día o unas horas de ayuda en Pine Mountain. Consulte la página municipal para conocer fechas y tareas actuales.", "Cartersville Parks & Recreation accueille les bénévoles pour une journée ou quelques heures à Pine Mountain. Consultez la page municipale pour les dates et tâches actuelles.", "Cartersville Parks & Recreation begrüßt Freiwillige, die einen Tag oder einige Stunden am Pine Mountain helfen. Aktuelle Termine und Aufgaben finden Sie auf der Stadtseite."],
  ["Search current Rome listings", "Buscar oportunidades actuales en Rome", "Rechercher les offres actuelles à Rome", "Aktuelle Angebote in Rome suchen"],
  ["Browse Rome-area volunteer roles by interest and timing. Confirm the organization, location, and shift details before signing up.", "Consulte puestos de voluntariado cerca de Rome según sus intereses y horarios. Confirme la organización, el lugar y los turnos antes de inscribirse.", "Consultez les postes bénévoles près de Rome selon vos intérêts et disponibilités. Confirmez l'organisation, le lieu et les horaires avant de vous inscrire.", "Suchen Sie Freiwilligenstellen im Raum Rome nach Interesse und Zeit. Bestätigen Sie Organisation, Ort und Einsatzzeiten vor der Anmeldung."],
  ["Explore current volunteer listings near Emerson. Check each host's address and travel distance because nearby matches may be outside town.", "Explore oportunidades actuales de voluntariado cerca de Emerson. Revise la dirección y distancia de cada organizador, ya que algunas opciones pueden estar fuera de la ciudad.", "Découvrez les offres de bénévolat actuelles près de Emerson. Vérifiez l'adresse et la distance de chaque organisateur, car certaines offres peuvent être hors de la ville.", "Entdecken Sie aktuelle Freiwilligenangebote nahe Emerson. Prüfen Sie Adresse und Entfernung jedes Veranstalters, da Angebote auch außerhalb des Ortes liegen können."],
  ["The city listing and location searches open on their source websites. Verify eligibility and details with each host before attending.", "La lista municipal y las búsquedas por ubicación se abren en sus sitios de origen. Verifique los requisitos y detalles con cada organizador antes de asistir.", "La liste municipale et les recherches par lieu s'ouvrent sur leurs sites sources. Vérifiez les conditions et détails auprès de chaque organisateur avant de participer.", "Die Stadtliste und Ortssuchen öffnen sich auf den jeweiligen Quellseiten. Prüfen Sie Teilnahmevoraussetzungen und Details vorab beim Veranstalter."],
  ["Questions, ideas, or something we missed?", "¿Preguntas, ideas o algo que hayamos pasado por alto?", "Des questions, des idées ou un oubli de notre part ?", "Fragen, Ideen oder etwas, das wir übersehen haben?"],
  ["Send a private message about a local resource or share a suggestion for this guide. A coordinator can reply in your private conversation.", "Envíe un mensaje privado sobre un recurso local o comparta una sugerencia para esta guía. Un coordinador puede responder en su conversación privada.", "Envoyez un message privé au sujet d'une ressource locale ou une suggestion pour ce guide. Un coordinateur peut répondre dans votre conversation privée.", "Senden Sie eine private Nachricht zu einem lokalen Angebot oder einen Vorschlag für diesen Leitfaden. Eine Koordinationsperson kann in Ihrer privaten Unterhaltung antworten."],
  ["Your message is stored on the site server. Only the authenticated coordinator can view and reply to it. Replies appear in your private thread; there are no email alerts.", "Su mensaje se guarda en el servidor del sitio. Solo el coordinador autenticado puede verlo y responder. Las respuestas aparecen en su conversación privada; no se envían avisos por correo electrónico.", "Votre message est stocké sur le serveur du site. Seul le coordinateur authentifié peut le lire et y répondre. Les réponses apparaissent dans votre conversation privée ; aucune alerte par e-mail n'est envoyée.", "Ihre Nachricht wird auf dem Server der Website gespeichert. Nur die angemeldete Koordinationsperson kann sie lesen und beantworten. Antworten erscheinen in Ihrer privaten Unterhaltung; es gibt keine E-Mail-Benachrichtigungen."],
  ["Share only what you need to. Please don't include emergency or highly sensitive personal information.", "Comparta solo lo necesario. No incluya información de emergencia ni datos personales altamente sensibles.", "Ne communiquez que le nécessaire. N'incluez pas d'informations d'urgence ni de données personnelles très sensibles.", "Teilen Sie nur das Nötige mit. Geben Sie bitte keine Notfallinformationen oder besonders sensiblen personenbezogenen Daten an."],
  ["After sending, you'll get a private link to return to this conversation and read replies.", "Después de enviar el mensaje, recibirá un enlace privado para volver a esta conversación y leer las respuestas.", "Après l'envoi, vous recevrez un lien privé pour revenir à cette conversation et lire les réponses.", "Nach dem Senden erhalten Sie einen privaten Link, über den Sie zu dieser Unterhaltung zurückkehren und Antworten lesen können."],
  ["Keep your private conversation link somewhere safe. Anyone with the link can read and reply to this thread.", "Guarde su enlace de conversación privada en un lugar seguro. Cualquier persona que tenga el enlace puede leer y responder en esta conversación.", "Conservez le lien de votre conversation privée en lieu sûr. Toute personne possédant ce lien peut lire et répondre à cette conversation.", "Bewahren Sie den Link zu Ihrer privaten Unterhaltung sicher auf. Jede Person mit dem Link kann diese Unterhaltung lesen und beantworten."],
  ["City leadership", "Gobierno municipal", "Direction municipale", "Stadtführung"],
  ["Official public biography and office contact details from the City of Cartersville.", "Biografía pública oficial y datos de contacto de la oficina de City of Cartersville.", "Biographie publique officielle et coordonnées du bureau de City of Cartersville.", "Offizielle öffentliche Biografie und Kontaktdaten des Büros von City of Cartersville."],
  ["Mayor since 2008", "Alcalde desde 2008", "Maire depuis 2008", "Bürgermeister seit 2008"],
  ["A public-service profile", "Perfil de servicio público", "Profil de service public", "Ein Profil im öffentlichen Dienst"],
  ["Matt Santini began serving as Cartersville's mayor in 2008. The City says he works with City Council and residents to preserve the community's quality of life while guiding a growing city.", "Matt Santini comenzó a ejercer como alcalde de Cartersville en 2008. La ciudad indica que trabaja con el concejo municipal y los residentes para preservar la calidad de vida de la comunidad mientras dirige una ciudad en crecimiento.", "Matt Santini est devenu maire de Cartersville en 2008. Selon la ville, il travaille avec le conseil municipal et les habitants pour préserver la qualité de vie de la communauté tout en dirigeant une ville en croissance.", "Matt Santini wurde 2008 Bürgermeister von Cartersville. Laut Stadt arbeitet er mit dem Stadtrat und den Einwohnern zusammen, um die Lebensqualität zu bewahren und die wachsende Stadt zu führen."],
  ["Santini earned a Bachelor of Science from Georgia Southern University in Marketing/Sales, Sales Management, and Advertising. His professional experience includes managing a local radio station and administering a local nonprofit organization.", "Santini obtuvo una licenciatura en ciencias de Georgia Southern University en mercadotecnia y ventas, gestión de ventas y publicidad. Su experiencia profesional incluye dirigir una estación de radio local y administrar una organización local sin fines de lucro.", "Santini a obtenu un baccalauréat en sciences de Georgia Southern University en marketing et ventes, gestion des ventes et publicité. Son expérience professionnelle comprend la direction d'une station de radio locale et l'administration d'un organisme local sans but lucratif.", "Santini erwarb einen Bachelor of Science an der Georgia Southern University in Marketing und Vertrieb, Vertriebsmanagement und Werbung. Zu seiner Berufserfahrung gehören die Leitung eines lokalen Radiosenders und die Verwaltung einer örtlichen gemeinnützigen Organisation."],
  ["The City profile says Santini was born in Fairport, New York, grew up in Marietta, and has lived in Cartersville since 1991. It lists golf, football, baseball, and reading among his interests.", "El perfil municipal indica que Santini nació en Fairport, New York, creció en Marietta y vive en Cartersville desde 1991. Entre sus intereses figuran el golf, el fútbol americano, el béisbol y la lectura.", "Selon le profil municipal, Santini est né à Fairport, New York, a grandi à Marietta et vit à Cartersville depuis 1991. Ses intérêts comprennent le golf, le football américain, le baseball et la lecture.", "Laut Stadtprofil wurde Santini in Fairport, New York, geboren, wuchs in Marietta auf und lebt seit 1991 in Cartersville. Zu seinen Interessen zählen Golf, Football, Baseball und Lesen."],
  ["His published community service includes board service with the Cartersville Downtown Development Authority and The Autumn Leaves Project, leadership and board roles with the Georgia Association of Broadcasters, and membership in the Rotary Club of Etowah.", "Su servicio comunitario publicado incluye cargos en las juntas de Cartersville Downtown Development Authority y The Autumn Leaves Project, puestos directivos y de junta en Georgia Association of Broadcasters y la membresía en Rotary Club of Etowah.", "Son engagement communautaire publié comprend des postes au conseil de Cartersville Downtown Development Authority et de The Autumn Leaves Project, des fonctions de direction et d'administration à Georgia Association of Broadcasters et une adhésion au Rotary Club of Etowah.", "Zu seinem veröffentlichten Engagement gehören Vorstandsarbeit bei Cartersville Downtown Development Authority und The Autumn Leaves Project, Führungs- und Vorstandsrollen bei Georgia Association of Broadcasters sowie die Mitgliedschaft im Rotary Club of Etowah."],
  ["Published public service and recognition", "Servicio público y reconocimientos publicados", "Services publics et distinctions publiés", "Veröffentlichte öffentliche Ämter und Auszeichnungen"],
  ["Cartersville Downtown Development Authority board member, 2003–2007", "Miembro de la junta de Cartersville Downtown Development Authority, 2003–2007", "Membre du conseil de Cartersville Downtown Development Authority, 2003–2007", "Vorstandsmitglied der Cartersville Downtown Development Authority, 2003–2007"],
  ["Downtown Development Authority president, 2006–August 2007", "Presidente de Downtown Development Authority, 2006–agosto de 2007", "Président de Downtown Development Authority, 2006–août 2007", "Präsident der Downtown Development Authority, 2006–August 2007"],
  ["Rotary Club of Etowah charter member, 2002; club president, 2003", "Miembro fundador de Rotary Club of Etowah, 2002; presidente del club, 2003", "Membre fondateur du Rotary Club of Etowah, 2002 ; président du club, 2003", "Gründungsmitglied des Rotary Club of Etowah, 2002; Clubpräsident, 2003"],
  ["The Autumn Leaves Project board member, 2016–present (per city profile)", "Miembro de la junta de The Autumn Leaves Project, desde 2016 (según el perfil municipal)", "Membre du conseil de The Autumn Leaves Project, depuis 2016 (selon le profil municipal)", "Vorstandsmitglied von The Autumn Leaves Project, seit 2016 (laut Stadtprofil)"],
  ["Georgia Association of Broadcasters board member, 2003–2017", "Miembro de la junta de Georgia Association of Broadcasters, 2003–2017", "Membre du conseil de Georgia Association of Broadcasters, 2003–2017", "Vorstandsmitglied der Georgia Association of Broadcasters, 2003–2017"],
  ["Georgia Association of Broadcasters president, 2012", "Presidente de Georgia Association of Broadcasters, 2012", "Président de Georgia Association of Broadcasters, 2012", "Präsident der Georgia Association of Broadcasters, 2012"],
  ["Georgia Association of Broadcasters Broadcaster of the Year, 2013", "Locutor del año de Georgia Association of Broadcasters, 2013", "Diffuseur de l'année de Georgia Association of Broadcasters, 2013", "Rundfunkpersönlichkeit des Jahres der Georgia Association of Broadcasters, 2013"],
  ["This summary uses the City's public mayor biography and council overview. For current duties, meeting agendas, and updates, use the", "Este resumen utiliza la biografía pública del alcalde y la información del concejo municipal. Para funciones, agendas y novedades actuales, consulte el", "Ce résumé utilise la biographie publique du maire et la présentation du conseil municipal. Pour les fonctions, ordres du jour et actualités, consultez le", "Diese Zusammenfassung verwendet die öffentliche Bürgermeisterbiografie und die Übersicht zum Stadtrat. Aktuelle Aufgaben, Tagesordnungen und Neuigkeiten finden Sie im"],
  ["official mayor profile", "perfil oficial del alcalde", "profil officiel du maire", "offiziellen Bürgermeisterprofil"],
  ["and", "y", "et", "und"],
  ["City Council page", "página del concejo municipal", "site du conseil municipal", "auf der Stadtratsseite"],
  ["Mayor Matt Santini, official City of Cartersville portrait", "Alcalde Matt Santini, retrato oficial de City of Cartersville", "Maire Matt Santini, portrait officiel de City of Cartersville", "Bürgermeister Matt Santini, offizielles Porträt von City of Cartersville"],
  ["Official City of Cartersville portrait", "Retrato oficial de City of Cartersville", "Portrait officiel de City of Cartersville", "Offizielles Porträt von City of Cartersville"],
  ["Public office", "Oficina pública", "Bureau public", "Öffentliches Amt"],
  ["Mayor's Office", "Oficina del alcalde", "Bureau du maire", "Bürgermeisterbüro"],
  ["Contact details and biography are from the", "Los datos de contacto y la biografía provienen de la", "Les coordonnées et la biographie proviennent de la", "Kontaktdaten und Biografie stammen von der"],
  ["City's official mayor page", "página oficial del alcalde", "page officielle du maire", "offiziellen Bürgermeisterseite der Stadt"],
  [". A direct office phone is not listed there.", ". No se indica un teléfono directo de la oficina.", ". Aucun numéro de téléphone direct du bureau n'y est indiqué.", ". Eine direkte Telefonnummer des Büros ist dort nicht angegeben."],
  ["Official City information can change; confirm details with the City of Cartersville.", "La información oficial puede cambiar; confirme los detalles con City of Cartersville.", "Les informations officielles peuvent changer ; confirmez les détails auprès de City of Cartersville.", "Offizielle Angaben können sich ändern; bestätigen Sie Details bei City of Cartersville."],
  ["View club events", "Ver eventos de clubes", "Voir les événements des clubs", "Vereinsveranstaltungen ansehen"],
  ["Sports, service, and shared interests", "Deportes, servicio e intereses compartidos", "Sports, service et intérêts communs", "Sport, Engagement und gemeinsame Interessen"],
  ["Browse local sports programs and community groups. Favorite a club to find its published dates in the calendar.", "Explore programas deportivos y grupos comunitarios locales. Marque un club como favorito para encontrar sus fechas publicadas en el calendario.", "Découvrez les programmes sportifs et groupes communautaires locaux. Ajoutez un club aux favoris pour trouver ses dates publiées dans le calendrier.", "Entdecken Sie lokale Sportprogramme und Gemeinschaftsgruppen. Markieren Sie einen Verein als Favoriten, um seine veröffentlichten Termine im Kalender zu finden."],
  ["Local groups", "Grupos locales", "Groupes locaux", "Lokale Gruppen"],
  ["Each listing has a 50-word description and an official program, membership, or club-finder link. Signup windows change; check the host's current page before registering.", "Cada ficha tiene una descripción de 50 palabras y un enlace oficial al programa, la membresía o el buscador de clubes. Los plazos de inscripción cambian; consulte la página actual del organizador antes de inscribirse.", "Chaque fiche comprend une description de 50 mots et un lien officiel vers le programme, l'adhésion ou l'annuaire des clubs. Les périodes d'inscription changent ; consultez la page actuelle de l'organisateur avant de vous inscrire.", "Jeder Eintrag enthält eine Beschreibung mit 50 Wörtern und einen offiziellen Link zum Programm, zur Mitgliedschaft oder zur Clubsuche. Anmeldefristen ändern sich; prüfen Sie vor der Anmeldung die aktuelle Seite des Veranstalters."],
  ["Filter clubs", "Filtrar clubes", "Filtrer les clubs", "Vereine filtern"],
  ["Only dates published by an official host appear here. Favorite the associated club to filter for its events on the main calendar.", "Aquí solo aparecen fechas publicadas por un organizador oficial. Marque el club correspondiente como favorito para filtrar sus eventos en el calendario principal.", "Seules les dates publiées par un organisateur officiel apparaissent ici. Ajoutez le club associé aux favoris pour filtrer ses événements dans le calendrier principal.", "Hier erscheinen nur Termine eines offiziellen Veranstalters. Markieren Sie den zugehörigen Verein als Favoriten, um seine Veranstaltungen im Hauptkalender zu filtern."],
  ["The City has listed basketball evaluation times but has not posted gym locations for these tryouts. Confirm the location and eligibility on the official program page before attending.", "La ciudad ha publicado los horarios de evaluación de baloncesto, pero no los gimnasios para estas pruebas. Confirme el lugar y los requisitos en la página oficial del programa antes de asistir.", "La ville a publié les heures d'évaluation de basketball, mais pas les gymnases pour ces essais. Confirmez le lieu et les conditions sur la page officielle du programme avant de venir.", "Die Stadt hat Zeiten für Basketballsichtungen, aber keine Sporthallen für diese Termine veröffentlicht. Bestätigen Sie Ort und Teilnahmevoraussetzungen vorab auf der offiziellen Programmseite."],
  ["Open the full calendar and choose “My clubs”", "Abra el calendario completo y elija «Mis clubes»", "Ouvrez le calendrier complet et choisissez « Mes clubs »", "Öffnen Sie den vollständigen Kalender und wählen Sie „Meine Vereine“"],
  ["Registration links open on the official City or organization website.", "Los enlaces de inscripción se abren en el sitio oficial de la ciudad o la organización.", "Les liens d'inscription ouvrent le site officiel de la ville ou de l'organisation.", "Anmeldelinks öffnen die offizielle Website der Stadt oder Organisation."],
  ["Local baseball organization", "Organización local de béisbol", "Organisation locale de baseball", "Lokale Baseballorganisation"],
  ["Community service club", "Club de servicio comunitario", "Club de service communautaire", "Gemeinnütziger Club"],
  ["Local membership organization", "Organización local de membresía", "Organisation locale d'adhésion", "Lokale Mitgliederorganisation"],
  ["School-only student opportunities", "Oportunidades escolares para estudiantes", "Possibilités étudiantes réservées à l'école", "Schulinterne Angebote für Schüler"],
  ["Favorite a club to see its published dates under My clubs on the calendar.", "Marque un club como favorito para ver sus fechas publicadas en Mis clubes del calendario.", "Ajoutez un club aux favoris pour voir ses dates publiées dans Mes clubs sur le calendrier.", "Markieren Sie einen Verein als Favoriten, um seine veröffentlichten Termine unter Meine Vereine im Kalender zu sehen."],
  ["No favorites yet. Choose a group and tap Favorite.", "Aún no hay favoritos. Elija un grupo y pulse Agregar a favoritos.", "Aucun favori pour le moment. Choisissez un groupe et ajoutez-le aux favoris.", "Noch keine Favoriten. Wählen Sie eine Gruppe und markieren Sie sie als Favorit."],
  ["No groups in this category yet.", "Aún no hay grupos en esta categoría.", "Aucun groupe dans cette catégorie pour le moment.", "In dieser Kategorie gibt es noch keine Gruppen."],
  ["No future team dates have been published. Check the program links above for signup announcements.", "No se han publicado fechas futuras de equipos. Consulte los enlaces de programas anteriores para anuncios de inscripción.", "Aucune date future d'équipe n'a été publiée. Consultez les liens des programmes ci-dessus pour les annonces d'inscription.", "Es wurden keine zukünftigen Mannschaftstermine veröffentlicht. Anmeldeankündigungen finden Sie unter den Programm-Links oben."],
  ["Upcoming club dates are unavailable.", "Las próximas fechas de clubes no están disponibles.", "Les prochaines dates des clubs ne sont pas disponibles.", "Kommende Vereinstermine sind nicht verfügbar."],
];

for (const [source, es, fr, de] of pageTranslations) {
  Object.assign(localTranslations.es, { [source]: es });
  Object.assign(localTranslations.fr, { [source]: fr });
  Object.assign(localTranslations.de, { [source]: de });
}

for (const club of window.communityClubs || []) {
  for (const [language, translations] of Object.entries(clubTranslations[club.id] || {})) {
    const [title, description, status, sourceLabel] = translations;
    Object.assign(localTranslations[language], {
      [club.title]: title,
      [club.description]: description,
      [club.status]: status,
      [club.sourceLabel]: sourceLabel,
    });
  }
}

function localTranslate(target, text) {
  const dictionary = localTranslations[target] || {};
  const trimmed = text.trim();
  if (dictionary[trimmed]) return text.replace(trimmed, dictionary[trimmed]);
  const arrow = trimmed.match(/^(.*?)\s*(↗|↓|→)$/);
  if (arrow && dictionary[arrow[1]]) return text.replace(trimmed, `${dictionary[arrow[1]]} ${arrow[2]}`);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const month = trimmed.match(/^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/);
  if (month && localLanguages[target]) {
    const date = new Date(Date.UTC(Number(month[2]), months.indexOf(month[1]), 1));
    return text.replace(trimmed, new Intl.DateTimeFormat(target, { month: "long", year: "numeric", timeZone: "UTC" }).format(date));
  }
  const date = trimmed.match(/^(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), (January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2}), (\d{4})$/);
  if (date && localLanguages[target]) {
    const day = new Date(Date.UTC(Number(date[3]), months.indexOf(date[1]), Number(date[2])));
    if (day.getUTCFullYear() === Number(date[3]) && day.getUTCDate() === Number(date[2])) {
      return text.replace(trimmed, new Intl.DateTimeFormat(target, { dateStyle: "full", timeZone: "UTC" }).format(day));
    }
  }
  return text;
}

function escapeHtml(text) {
  return text.replace(/[&<>"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  })[character]);
}

function providerHtml(text) {
  let html = "";
  let previousEnd = 0;
  for (const match of text.matchAll(properNounPattern)) {
    const [name] = match;
    const start = match.index;
    html += escapeHtml(text.slice(previousEnd, start));
    html += `<span class="notranslate">${escapeHtml(name)}</span>`;
    previousEnd = start + name.length;
  }
  return html + escapeHtml(text.slice(previousEnd));
}

function translatedPlainText(html) {
  return new DOMParser().parseFromString(html, "text/html").body.textContent;
}

function publicTextNodes() {
  const excluded = "script, style, option, #thread-messages, #inbox-list, .honeypot";
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    if (!node.nodeValue.trim() || node.parentElement.closest(excluded)) continue;
    nodes.push(node);
  }
  return nodes;
}

function publicAttributes() {
  const excluded = "script, style, #thread-messages, #inbox-list, .honeypot";
  const items = [];
  document.body.querySelectorAll("[placeholder], [aria-label], [title], img[alt]").forEach((element) => {
    if (element.closest(excluded)) return;
    for (const attribute of ["placeholder", "aria-label", "title", "alt"]) {
      const value = element.getAttribute(attribute);
      if (value) items.push({ element, attribute, value });
    }
  });
  return items;
}

async function requestTranslations(target, values) {
  const translated = [];
  for (let offset = 0; offset < values.length; offset += 40) {
    const batch = values.slice(offset, offset + 40);
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: target, texts: batch.map(providerHtml) }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Translation is temporarily unavailable.");
    translated.push(...result.texts.map(translatedPlainText));
  }
  return translated;
}

async function applyLanguage(target) {
  languageStatus.classList.remove("error");
  const textNodes = publicTextNodes();
  const attributes = publicAttributes();
  textNodes.forEach((node) => { if (!originalText.has(node)) originalText.set(node, node.nodeValue); });
  attributes.forEach(({ element, attribute, value }) => {
    let saved = originalAttributes.get(element);
    if (!saved) { saved = new Map(); originalAttributes.set(element, saved); }
    if (!saved.has(attribute)) saved.set(attribute, value);
  });
  const publicValues = [
    ...textNodes.map((node) => originalText.get(node)),
    ...attributes.map(({ element, attribute }) => originalAttributes.get(element).get(attribute)),
  ];

  if (target === "en") {
    textNodes.forEach((node) => { node.nodeValue = originalText.get(node); });
    attributes.forEach(({ element, attribute }) => element.setAttribute(attribute, originalAttributes.get(element).get(attribute)));
    document.documentElement.lang = "en";
    activeLanguage = "en";
    saveLanguage(target);
    languageStatus.textContent = providerTranslation
      ? "Page language: English."
      : "English selected. Full-page translation needs Microsoft Translator credentials.";
    languageStatus.classList.toggle("is-visible", !providerTranslation);
    return;
  }

  if (!providerTranslation) {
    textNodes.forEach((node) => {
      const source = originalText.get(node);
      node.nodeValue = localTranslate(target, source);
    });
    attributes.forEach(({ element, attribute }) => {
      const source = originalAttributes.get(element).get(attribute);
      element.setAttribute(attribute, localTranslate(target, source));
    });
    document.documentElement.lang = target;
    activeLanguage = target;
    saveLanguage(target);
    languageStatus.textContent = localTranslationNotice[target];
    languageStatus.classList.add("is-visible");
    languageSelect.disabled = false;
    return;
  }

  languageStatus.textContent = "Translating the public page...";
  languageSelect.disabled = true;
  try {
    const translated = await requestTranslations(target, publicValues);
    textNodes.forEach((node, index) => {
      const source = originalText.get(node);
      const leading = source.match(/^\s*/)[0];
      const trailing = source.match(/\s*$/)[0];
      node.nodeValue = `${leading}${translated[index]}${trailing}`;
    });
    attributes.forEach(({ element, attribute }, index) => {
      element.setAttribute(attribute, translated[textNodes.length + index]);
    });
    document.documentElement.lang = target;
    activeLanguage = target;
    saveLanguage(target);
    languageStatus.textContent = "Public page translated; known local names are kept in English. Private messages are never sent for translation.";
    languageStatus.classList.remove("is-visible");
  } catch (error) {
    languageSelect.value = activeLanguage;
    languageStatus.textContent = error.message;
    languageStatus.classList.add("error");
    languageStatus.classList.add("is-visible");
  } finally {
    languageSelect.disabled = false;
  }
}

languageSelect.addEventListener("change", () => applyLanguage(languageSelect.value));

async function initializeLanguages() {
  try {
    const response = await fetch("/api/languages", { cache: "no-store" });
    const result = await response.json();
    if (!result.configured) {
      providerTranslation = false;
      Object.entries(localLanguages).forEach(([code, name]) => {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = name;
        languageSelect.append(option);
      });
      languageSelect.disabled = false;
      languageReady = true;
      languageStatus.textContent = "Only some common phrases can be translated here. Full-page translation needs Microsoft Translator credentials.";
      languageStatus.classList.add("is-visible");
      restoreLanguage();
      return;
    }
    providerTranslation = true;
    result.languages.forEach(({ code, name }) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = name;
      languageSelect.append(option);
    });
    languageSelect.disabled = false;
    languageReady = true;
    languageStatus.textContent = `${result.languages.length} translation languages available.`;
    restoreLanguage();
    } catch {
    providerTranslation = false;

    Object.entries(localLanguages).forEach(([code, name]) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = name;
      languageSelect.append(option);
    });

    languageSelect.disabled = false;
    languageReady = true;
    languageStatus.textContent = "Some common phrases can be translated locally.";
    languageStatus.classList.add("is-visible");
    restoreLanguage();
  }}

window.applyCommunityLanguage = () => {
  if (languageReady && activeLanguage !== "en") applyLanguage(activeLanguage);
};

initializeLanguages();
