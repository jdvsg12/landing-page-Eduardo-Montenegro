import type { LegalContent } from "./site-content"
import type { Language } from "./translations"

/** Un ítem de lista: texto simple o [término en negrita, descripción]. */
export type LegalItem = string | [string, string]

export interface LegalSection {
  heading: string
  paragraphs?: string[]
  items?: LegalItem[]
  after?: string[]
  link?: { href: string; label: string }
}

export interface LegalDocument {
  title: string
  intro: string
  sections: LegalSection[]
}

export type LegalDocumentKind = "privacy" | "terms"

type Labels = {
  name: string
  document: string
  address: string
  email: string
  phone: string
  website: string
}

const OWNER_LABELS: Record<Language, Labels> = {
  es: {
    name: "Nombre",
    document: "Documento de identidad",
    address: "Domicilio",
    email: "Correo electrónico",
    phone: "Teléfono / WhatsApp",
    website: "Sitio web",
  },
  en: {
    name: "Name",
    document: "ID document",
    address: "Address",
    email: "Email",
    phone: "Phone / WhatsApp",
    website: "Website",
  },
  fr: {
    name: "Nom",
    document: "Pièce d'identité",
    address: "Adresse",
    email: "E-mail",
    phone: "Téléphone / WhatsApp",
    website: "Site web",
  },
}

/** Solo se listan los datos que estén diligenciados en Ajustes: nunca se publica un marcador vacío. */
function ownerItems(legal: LegalContent, siteUrl: string, language: Language): LegalItem[] {
  const labels = OWNER_LABELS[language]
  const rows: [string, string][] = [
    [labels.name, legal.ownerName],
    [labels.document, legal.documentId],
    [labels.address, legal.address],
    [labels.email, legal.email],
    [labels.phone, legal.phone],
    [labels.website, siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")],
  ]
  return rows.filter(([, value]) => value.trim()).map(([label, value]) => [label, value.trim()])
}

function privacy(legal: LegalContent, siteUrl: string): Record<Language, LegalDocument> {
  const email = legal.email || "—"

  return {
    es: {
      title: "Política de privacidad y tratamiento de datos personales",
      intro:
        "Esta política explica cómo se recolectan, usan y protegen los datos personales que compartes a través de este sitio web, de conformidad con la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y las demás normas colombianas sobre protección de datos personales.",
      sections: [
        { heading: "Responsable del tratamiento", items: ownerItems(legal, siteUrl, "es") },
        {
          heading: "Definiciones",
          items: [
            ["Dato personal", "cualquier información vinculada o que pueda asociarse a una persona natural identificada o identificable."],
            ["Dato sensible", "aquel que afecta la intimidad del titular o cuyo uso indebido puede generar discriminación, como los datos relativos a la salud."],
            ["Titular", "persona natural cuyos datos personales son objeto de tratamiento."],
            ["Tratamiento", "cualquier operación sobre datos personales: recolección, almacenamiento, uso, circulación o supresión."],
            ["Encargado del tratamiento", "persona natural o jurídica que trata datos personales por cuenta del responsable."],
            ["Autorización", "consentimiento previo, expreso e informado del titular para el tratamiento de sus datos."],
          ],
        },
        {
          heading: "Datos que se recolectan",
          paragraphs: ["A través de los formularios de contacto y de inscripción del sitio se recolectan:"],
          items: [
            "Nombre.",
            "Correo electrónico.",
            "Número de teléfono o WhatsApp.",
            "Servicio o actividad de interés.",
            "El mensaje que decidas escribir.",
          ],
          after: [
            "Además, el sitio guarda en tu navegador el idioma que elegiste (mediante una cookie y almacenamiento local) y registra estadísticas de visitas agregadas y anónimas con Vercel Web Analytics, que no utiliza cookies ni permite identificarte.",
          ],
        },
        {
          heading: "Datos sensibles",
          paragraphs: [
            "Este sitio no solicita datos sobre tu salud ni otros datos sensibles. Si decides incluir información de ese tipo en un mensaje, lo haces de manera voluntaria y no estás obligado/a a hacerlo; será tratada con la máxima reserva y únicamente para responder tu consulta.",
            "La información clínica que surja en el marco de una consulta se rige por el secreto profesional y por la normativa que regula el ejercicio de la psicología en Colombia (Ley 1090 de 2006).",
          ],
        },
        {
          heading: "Finalidades del tratamiento",
          items: [
            "Responder consultas y solicitudes de información.",
            "Coordinar citas, sesiones, supervisiones, grupos de estudio o talleres que solicites.",
            "Gestionar tu inscripción a actividades grupales.",
            "Mantener la comunicación relacionada con el servicio solicitado.",
            "Cumplir obligaciones legales.",
            "Elaborar estadísticas agregadas de uso del sitio, sin identificar a las personas.",
          ],
          after: ["Tus datos no se usarán para enviarte publicidad ni se venderán a terceros."],
        },
        {
          heading: "Autorización",
          paragraphs: [
            "Al marcar la casilla de aceptación en los formularios otorgas tu autorización previa, expresa e informada para el tratamiento de tus datos conforme a esta política. Puedes revocarla en cualquier momento.",
          ],
        },
        {
          heading: "Encargados y transferencia internacional",
          paragraphs: [
            "Para funcionar, el sitio utiliza proveedores tecnológicos que actúan como encargados del tratamiento y pueden almacenar la información en servidores ubicados fuera de Colombia, principalmente en Estados Unidos:",
          ],
          items: [
            ["Vercel", "alojamiento del sitio y estadísticas anónimas de visitas."],
            ["Neon", "base de datos donde se guardan los formularios."],
            ["Resend", "envío de las notificaciones por correo electrónico."],
            ["Herramientas externas de inscripción o agenda", "como Google Forms o Google Calendar, cuando un servicio las utiliza. En ese caso también aplica la política de privacidad del proveedor."],
            ["WhatsApp (Meta)", "si decides escribir por ese canal."],
          ],
          after: [
            "Estos proveedores solo tratan los datos para prestar su servicio y bajo sus propias obligaciones de confidencialidad y seguridad. Fuera de estos casos, tus datos no se comparten con terceros sin tu autorización, salvo requerimiento de una autoridad competente.",
          ],
        },
        {
          heading: "Derechos del titular",
          paragraphs: ["De acuerdo con la Ley 1581 de 2012, tienes derecho a:"],
          items: [
            "Conocer, actualizar y rectificar tus datos personales.",
            "Solicitar prueba de la autorización otorgada.",
            "Ser informado/a sobre el uso que se ha dado a tus datos.",
            "Revocar la autorización o solicitar la supresión de tus datos, cuando no exista un deber legal o contractual de conservarlos.",
            "Acceder gratuitamente a tus datos personales.",
            "Presentar quejas ante la Superintendencia de Industria y Comercio (SIC), una vez agotado el trámite de consulta o reclamo ante el responsable.",
          ],
        },
        {
          heading: "Cómo ejercer tus derechos",
          paragraphs: [
            `Escribe a ${email} indicando tu nombre completo, el derecho que quieres ejercer, la descripción de tu solicitud y un medio de contacto para responderte.`,
          ],
          items: [
            ["Consultas", "se responden en un plazo máximo de diez (10) días hábiles, prorrogable por cinco (5) días hábiles más, informándote el motivo."],
            ["Reclamos", "(corrección, actualización, supresión o revocatoria) se responden en un plazo máximo de quince (15) días hábiles, prorrogable por ocho (8) días hábiles más, informándote el motivo."],
          ],
        },
        {
          heading: "Seguridad",
          paragraphs: [
            "Se aplican medidas razonables para proteger tus datos: conexión cifrada (HTTPS), acceso restringido con contraseña al panel de administración y a la base de datos, y proveedores con sus propios controles de seguridad. Ningún sistema es infalible, pero se trabaja para evitar el acceso no autorizado, la pérdida o el uso indebido de la información.",
          ],
        },
        {
          heading: "Conservación de los datos",
          paragraphs: [
            "Los datos se conservan mientras sean necesarios para las finalidades descritas o mientras exista una relación con el titular. Después se eliminan, salvo que una norma exija conservarlos por más tiempo.",
          ],
        },
        {
          heading: "Autoridad de control",
          paragraphs: [
            "La Superintendencia de Industria y Comercio (SIC) es la autoridad que vigila el cumplimiento de las normas de protección de datos personales en Colombia. Más información en www.sic.gov.co.",
          ],
        },
        {
          heading: "Vigencia y cambios",
          paragraphs: [
            "Esta política rige desde la fecha de su última actualización. Cualquier cambio sustancial se publicará en esta misma página.",
          ],
          link: { href: "/terminos", label: "Consulta también los términos y condiciones" },
        },
      ],
    },
    en: {
      title: "Privacy and personal data policy",
      intro:
        "This policy explains how the personal data you share through this website is collected, used and protected, in accordance with Colombian Statutory Law 1581 of 2012, Decree 1377 of 2013 (compiled in Decree 1074 of 2015) and other Colombian regulations on personal data protection.",
      sections: [
        { heading: "Data controller", items: ownerItems(legal, siteUrl, "en") },
        {
          heading: "Definitions",
          items: [
            ["Personal data", "any information linked to, or that can be associated with, an identified or identifiable natural person."],
            ["Sensitive data", "data that affects the privacy of the data subject or whose misuse may lead to discrimination, such as health-related data."],
            ["Data subject", "the natural person whose personal data is processed."],
            ["Processing", "any operation on personal data: collection, storage, use, circulation or deletion."],
            ["Data processor", "a natural or legal person who processes personal data on behalf of the controller."],
            ["Authorization", "the data subject's prior, express and informed consent to the processing of their data."],
          ],
        },
        {
          heading: "Data we collect",
          paragraphs: ["Through the contact and registration forms on this website we collect:"],
          items: [
            "Name.",
            "Email address.",
            "Phone or WhatsApp number.",
            "Service or activity of interest.",
            "The message you choose to write.",
          ],
          after: [
            "The website also stores the language you selected in your browser (through a cookie and local storage) and records aggregated, anonymous visit statistics with Vercel Web Analytics, which does not use cookies and cannot identify you.",
          ],
        },
        {
          heading: "Sensitive data",
          paragraphs: [
            "This website does not ask for health data or any other sensitive data. If you choose to include such information in a message, you do so voluntarily and are under no obligation to do so; it will be handled with the utmost discretion and only to answer your enquiry.",
            "Clinical information arising in the course of a consultation is governed by professional secrecy and by the regulations on the practice of psychology in Colombia (Law 1090 of 2006).",
          ],
        },
        {
          heading: "Purposes of processing",
          items: [
            "Answering enquiries and requests for information.",
            "Arranging the appointments, sessions, supervisions, study groups or workshops you request.",
            "Managing your registration for group activities.",
            "Keeping in touch about the service you requested.",
            "Complying with legal obligations.",
            "Producing aggregated website usage statistics that do not identify anyone.",
          ],
          after: ["Your data will not be used to send you advertising and will not be sold to third parties."],
        },
        {
          heading: "Authorization",
          paragraphs: [
            "By ticking the acceptance box on the forms, you give your prior, express and informed authorization for your data to be processed under this policy. You may revoke it at any time.",
          ],
        },
        {
          heading: "Processors and international transfers",
          paragraphs: [
            "To operate, the website relies on technology providers that act as data processors and may store information on servers located outside Colombia, mainly in the United States:",
          ],
          items: [
            ["Vercel", "website hosting and anonymous visit statistics."],
            ["Neon", "the database where form submissions are stored."],
            ["Resend", "delivery of email notifications."],
            ["External registration or scheduling tools", "such as Google Forms or Google Calendar, when a service uses them. In that case the provider's privacy policy also applies."],
            ["WhatsApp (Meta)", "if you choose to write through that channel."],
          ],
          after: [
            "These providers process data only to deliver their service and under their own confidentiality and security obligations. Beyond these cases, your data is not shared with third parties without your authorization, unless required by a competent authority.",
          ],
        },
        {
          heading: "Your rights",
          paragraphs: ["Under Law 1581 of 2012, you have the right to:"],
          items: [
            "Know, update and correct your personal data.",
            "Request proof of the authorization you gave.",
            "Be informed about how your data has been used.",
            "Revoke your authorization or request the deletion of your data, unless there is a legal or contractual duty to keep it.",
            "Access your personal data free of charge.",
            "File complaints with the Superintendence of Industry and Commerce (SIC) once the enquiry or claim process with the controller has been completed.",
          ],
        },
        {
          heading: "How to exercise your rights",
          paragraphs: [
            `Write to ${email} stating your full name, the right you wish to exercise, a description of your request and a way to reply to you.`,
          ],
          items: [
            ["Enquiries", "are answered within ten (10) business days, which may be extended by five (5) more business days, in which case you will be told why."],
            ["Claims", "(correction, update, deletion or revocation) are answered within fifteen (15) business days, which may be extended by eight (8) more business days, in which case you will be told why."],
          ],
        },
        {
          heading: "Security",
          paragraphs: [
            "Reasonable measures are in place to protect your data: encrypted connections (HTTPS), password-restricted access to the administration panel and the database, and providers with their own security controls. No system is infallible, but every effort is made to prevent unauthorized access, loss or misuse of information.",
          ],
        },
        {
          heading: "Data retention",
          paragraphs: [
            "Data is kept for as long as it is needed for the purposes described or while there is a relationship with the data subject. It is then deleted, unless a regulation requires it to be kept longer.",
          ],
        },
        {
          heading: "Supervisory authority",
          paragraphs: [
            "The Superintendence of Industry and Commerce (SIC) is the authority that oversees compliance with personal data protection regulations in Colombia. More information at www.sic.gov.co.",
          ],
        },
        {
          heading: "Validity and changes",
          paragraphs: [
            "This policy is effective from the date of its last update. Any substantial change will be published on this page.",
          ],
          link: { href: "/terminos", label: "See also the terms and conditions" },
        },
      ],
    },
    fr: {
      title: "Politique de confidentialité et de traitement des données personnelles",
      intro:
        "Cette politique explique comment les données personnelles que vous partagez sur ce site sont collectées, utilisées et protégées, conformément à la loi statutaire colombienne 1581 de 2012, au décret 1377 de 2013 (compilé dans le décret 1074 de 2015) et aux autres normes colombiennes sur la protection des données personnelles.",
      sections: [
        { heading: "Responsable du traitement", items: ownerItems(legal, siteUrl, "fr") },
        {
          heading: "Définitions",
          items: [
            ["Donnée personnelle", "toute information liée ou pouvant être associée à une personne physique identifiée ou identifiable."],
            ["Donnée sensible", "donnée qui touche à l'intimité de la personne ou dont l'usage abusif peut entraîner une discrimination, comme les données de santé."],
            ["Personne concernée", "la personne physique dont les données personnelles font l'objet d'un traitement."],
            ["Traitement", "toute opération portant sur des données personnelles : collecte, conservation, utilisation, circulation ou suppression."],
            ["Sous-traitant", "personne physique ou morale qui traite des données personnelles pour le compte du responsable."],
            ["Autorisation", "consentement préalable, exprès et éclairé de la personne concernée au traitement de ses données."],
          ],
        },
        {
          heading: "Données collectées",
          paragraphs: ["Les formulaires de contact et d'inscription du site collectent :"],
          items: [
            "Le nom.",
            "L'adresse e-mail.",
            "Le numéro de téléphone ou WhatsApp.",
            "Le service ou l'activité qui vous intéresse.",
            "Le message que vous choisissez d'écrire.",
          ],
          after: [
            "Le site enregistre également dans votre navigateur la langue choisie (au moyen d'un cookie et du stockage local) et mesure la fréquentation de manière agrégée et anonyme avec Vercel Web Analytics, qui n'utilise pas de cookies et ne permet pas de vous identifier.",
          ],
        },
        {
          heading: "Données sensibles",
          paragraphs: [
            "Ce site ne demande aucune donnée de santé ni aucune autre donnée sensible. Si vous choisissez d'inclure ce type d'information dans un message, vous le faites volontairement et n'y êtes pas tenu(e) ; elle sera traitée avec la plus grande discrétion et uniquement pour répondre à votre demande.",
            "Les informations cliniques qui apparaissent dans le cadre d'une consultation relèvent du secret professionnel et de la réglementation de l'exercice de la psychologie en Colombie (loi 1090 de 2006).",
          ],
        },
        {
          heading: "Finalités du traitement",
          items: [
            "Répondre aux questions et demandes d'information.",
            "Organiser les rendez-vous, séances, supervisions, groupes d'étude ou ateliers que vous demandez.",
            "Gérer votre inscription aux activités de groupe.",
            "Maintenir la communication liée au service demandé.",
            "Respecter les obligations légales.",
            "Établir des statistiques agrégées d'utilisation du site, sans identifier les personnes.",
          ],
          after: ["Vos données ne seront pas utilisées pour vous envoyer de la publicité et ne seront pas vendues à des tiers."],
        },
        {
          heading: "Autorisation",
          paragraphs: [
            "En cochant la case d'acceptation des formulaires, vous donnez votre autorisation préalable, expresse et éclairée au traitement de vos données conformément à cette politique. Vous pouvez la révoquer à tout moment.",
          ],
        },
        {
          heading: "Sous-traitants et transferts internationaux",
          paragraphs: [
            "Pour fonctionner, le site fait appel à des prestataires techniques qui agissent en tant que sous-traitants et peuvent héberger les informations sur des serveurs situés hors de Colombie, principalement aux États-Unis :",
          ],
          items: [
            ["Vercel", "hébergement du site et statistiques de fréquentation anonymes."],
            ["Neon", "base de données où sont enregistrés les formulaires."],
            ["Resend", "envoi des notifications par e-mail."],
            ["Outils externes d'inscription ou de prise de rendez-vous", "comme Google Forms ou Google Agenda, lorsqu'un service les utilise. La politique de confidentialité du prestataire s'applique alors également."],
            ["WhatsApp (Meta)", "si vous choisissez d'écrire par ce canal."],
          ],
          after: [
            "Ces prestataires ne traitent les données que pour fournir leur service et dans le respect de leurs propres obligations de confidentialité et de sécurité. En dehors de ces cas, vos données ne sont pas communiquées à des tiers sans votre autorisation, sauf demande d'une autorité compétente.",
          ],
        },
        {
          heading: "Vos droits",
          paragraphs: ["Conformément à la loi 1581 de 2012, vous avez le droit de :"],
          items: [
            "Connaître, mettre à jour et rectifier vos données personnelles.",
            "Demander la preuve de l'autorisation donnée.",
            "Être informé(e) de l'usage qui a été fait de vos données.",
            "Révoquer votre autorisation ou demander la suppression de vos données, en l'absence d'obligation légale ou contractuelle de les conserver.",
            "Accéder gratuitement à vos données personnelles.",
            "Déposer une plainte auprès de la Superintendance de l'Industrie et du Commerce (SIC), une fois la procédure de demande ou de réclamation auprès du responsable épuisée.",
          ],
        },
        {
          heading: "Comment exercer vos droits",
          paragraphs: [
            `Écrivez à ${email} en indiquant votre nom complet, le droit que vous souhaitez exercer, la description de votre demande et un moyen de vous répondre.`,
          ],
          items: [
            ["Demandes", "traitées dans un délai maximal de dix (10) jours ouvrables, prolongeable de cinq (5) jours ouvrables, auquel cas le motif vous sera indiqué."],
            ["Réclamations", "(rectification, mise à jour, suppression ou révocation) traitées dans un délai maximal de quinze (15) jours ouvrables, prolongeable de huit (8) jours ouvrables, auquel cas le motif vous sera indiqué."],
          ],
        },
        {
          heading: "Sécurité",
          paragraphs: [
            "Des mesures raisonnables protègent vos données : connexion chiffrée (HTTPS), accès protégé par mot de passe au panneau d'administration et à la base de données, et prestataires disposant de leurs propres contrôles de sécurité. Aucun système n'est infaillible, mais tout est fait pour éviter l'accès non autorisé, la perte ou l'usage abusif des informations.",
          ],
        },
        {
          heading: "Conservation des données",
          paragraphs: [
            "Les données sont conservées tant qu'elles sont nécessaires aux finalités décrites ou tant qu'une relation existe avec la personne concernée. Elles sont ensuite supprimées, sauf si une norme impose de les conserver plus longtemps.",
          ],
        },
        {
          heading: "Autorité de contrôle",
          paragraphs: [
            "La Superintendance de l'Industrie et du Commerce (SIC) est l'autorité chargée de veiller au respect des normes de protection des données personnelles en Colombie. Plus d'informations sur www.sic.gov.co.",
          ],
        },
        {
          heading: "Entrée en vigueur et modifications",
          paragraphs: [
            "Cette politique s'applique à compter de la date de sa dernière mise à jour. Toute modification substantielle sera publiée sur cette page.",
          ],
          link: { href: "/terminos", label: "Consultez aussi les conditions générales" },
        },
      ],
    },
  }
}

function terms(legal: LegalContent, siteUrl: string): Record<Language, LegalDocument> {
  const site = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") || "este sitio"
  const owner = legal.ownerName || "Eduardo Montenegro Flórez"
  const email = legal.email || "—"

  return {
    es: {
      title: "Términos y condiciones de uso",
      intro: `Estos términos regulan el uso del sitio web ${site} (en adelante, “el sitio”). Al navegar por él o enviar un formulario aceptas estas condiciones. Si no estás de acuerdo con ellas, te pedimos no utilizarlo.`,
      sections: [
        { heading: "Titular del sitio", items: ownerItems(legal, siteUrl, "es") },
        {
          heading: "Objeto del sitio",
          paragraphs: [
            `El sitio presenta de forma informativa la práctica clínica de ${owner}, psicólogo y psicoanalista, y los servicios que ofrece: psicoanálisis con adultos, supervisión clínica, grupos de estudio y talleres. Su contenido no constituye una consulta, un diagnóstico ni una indicación de tratamiento.`,
            "Enviar un formulario o escribir por WhatsApp no establece por sí mismo una relación terapéutica. Esta comienza cuando ambas partes acuerdan el encuadre de trabajo.",
          ],
        },
        {
          heading: "No es un servicio de urgencias",
          paragraphs: [
            "Este sitio y sus canales de contacto no atienden emergencias. Si tú o alguien cercano está en riesgo, comunícate con la línea de emergencias 123 en Colombia o con el número de emergencias de tu país, o acude al servicio de urgencias más cercano.",
          ],
        },
        {
          heading: "Honorarios, agenda y cancelaciones",
          paragraphs: [
            "Los valores publicados en el sitio son orientativos. Los honorarios, la frecuencia, la modalidad y las condiciones de reprogramación o cancelación se acuerdan directamente al inicio de cada proceso. Los cupos de los grupos de estudio y talleres son limitados y se confirman una vez completada la inscripción.",
          ],
        },
        {
          heading: "Atención online",
          paragraphs: [
            "En la modalidad online, cada persona es responsable de contar con una conexión estable y un espacio privado que resguarde la confidencialidad de la sesión. No está permitido grabar las sesiones sin el consentimiento expreso de ambas partes.",
          ],
        },
        {
          heading: "Confidencialidad",
          paragraphs: [
            "Lo que se trabaja en el espacio clínico está protegido por el secreto profesional, en los términos de la Ley 1090 de 2006 y demás normas aplicables. El tratamiento de los datos personales enviados a través del sitio se rige por la política de privacidad.",
          ],
          link: { href: "/privacidad", label: "Leer la política de privacidad" },
        },
        {
          heading: "Uso adecuado del sitio",
          paragraphs: [
            "Te comprometes a usar el sitio de forma lícita, a suministrar información veraz en los formularios y a no intentar acceder a zonas restringidas, alterar su funcionamiento ni enviar contenido ofensivo o malicioso.",
          ],
        },
        {
          heading: "Propiedad intelectual",
          paragraphs: [
            "Los textos, fotografías, diseño y demás contenidos del sitio pertenecen a su titular o se usan con autorización. No pueden reproducirse, distribuirse ni modificarse con fines comerciales sin permiso previo y por escrito. Puedes citar fragmentos breves indicando la fuente.",
          ],
        },
        {
          heading: "Enlaces a terceros",
          paragraphs: [
            "El sitio incluye enlaces a servicios de terceros, como WhatsApp, Instagram, LinkedIn, YouTube o formularios y calendarios externos. Su uso se rige por los términos y políticas de cada proveedor, sobre los cuales el titular del sitio no tiene control.",
          ],
        },
        {
          heading: "Responsabilidad",
          paragraphs: [
            "Se procura que la información del sitio sea exacta y esté actualizada, pero puede contener errores o cambiar sin previo aviso. El titular no responde por daños derivados de interrupciones del sitio, fallas técnicas ajenas a su control o del uso que se haga de la información publicada.",
          ],
        },
        {
          heading: "Modificaciones",
          paragraphs: [
            "Estos términos pueden actualizarse en cualquier momento. La versión vigente es la publicada en esta página, con su fecha de actualización.",
          ],
        },
        {
          heading: "Ley aplicable",
          paragraphs: [
            "Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia se intentará resolver primero de manera directa y, de no ser posible, ante las autoridades competentes de Colombia.",
          ],
        },
        {
          heading: "Contacto",
          paragraphs: [`Para cualquier pregunta sobre estos términos puedes escribir a ${email}.`],
        },
      ],
    },
    en: {
      title: "Terms and conditions of use",
      intro: `These terms govern the use of the website ${site} (the “website”). By browsing it or submitting a form you accept these conditions. If you do not agree with them, please do not use it.`,
      sections: [
        { heading: "Website owner", items: ownerItems(legal, siteUrl, "en") },
        {
          heading: "Purpose of the website",
          paragraphs: [
            `The website presents, for information purposes, the clinical practice of ${owner}, psychologist and psychoanalyst, and the services offered: psychoanalysis with adults, clinical supervision, study groups and workshops. Its content is not a consultation, a diagnosis or a treatment recommendation.`,
            "Submitting a form or writing on WhatsApp does not in itself create a therapeutic relationship. That relationship begins when both parties agree on the working framework.",
          ],
        },
        {
          heading: "Not an emergency service",
          paragraphs: [
            "This website and its contact channels do not handle emergencies. If you or someone close to you is at risk, call 123 in Colombia or the emergency number in your country, or go to the nearest emergency department.",
          ],
        },
        {
          heading: "Fees, scheduling and cancellations",
          paragraphs: [
            "The fees shown on the website are for reference only. Fees, frequency, modality and rescheduling or cancellation conditions are agreed directly at the start of each process. Places in study groups and workshops are limited and are confirmed once registration is complete.",
          ],
        },
        {
          heading: "Online sessions",
          paragraphs: [
            "For online sessions, each person is responsible for having a stable connection and a private space that protects the confidentiality of the session. Sessions may not be recorded without the express consent of both parties.",
          ],
        },
        {
          heading: "Confidentiality",
          paragraphs: [
            "What is worked on in the clinical space is protected by professional secrecy, under Colombian Law 1090 of 2006 and other applicable regulations. The processing of personal data sent through the website is governed by the privacy policy.",
          ],
          link: { href: "/privacidad", label: "Read the privacy policy" },
        },
        {
          heading: "Appropriate use",
          paragraphs: [
            "You agree to use the website lawfully, to provide truthful information in the forms and not to attempt to access restricted areas, interfere with its operation or send offensive or malicious content.",
          ],
        },
        {
          heading: "Intellectual property",
          paragraphs: [
            "The texts, photographs, design and other content of the website belong to its owner or are used with permission. They may not be reproduced, distributed or modified for commercial purposes without prior written permission. You may quote short excerpts citing the source.",
          ],
        },
        {
          heading: "Third-party links",
          paragraphs: [
            "The website includes links to third-party services such as WhatsApp, Instagram, LinkedIn, YouTube or external forms and calendars. Their use is governed by each provider's terms and policies, over which the website owner has no control.",
          ],
        },
        {
          heading: "Liability",
          paragraphs: [
            "Every effort is made to keep the information on the website accurate and up to date, but it may contain errors or change without notice. The owner is not liable for damages arising from website interruptions, technical failures beyond their control or the use made of the published information.",
          ],
        },
        {
          heading: "Changes",
          paragraphs: [
            "These terms may be updated at any time. The version in force is the one published on this page, with its update date.",
          ],
        },
        {
          heading: "Governing law",
          paragraphs: [
            "These terms are governed by the laws of the Republic of Colombia. Any dispute will first be addressed directly and, if that is not possible, before the competent authorities of Colombia.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [`For any question about these terms you can write to ${email}.`],
        },
      ],
    },
    fr: {
      title: "Conditions générales d'utilisation",
      intro: `Ces conditions régissent l'utilisation du site ${site} (ci-après « le site »). En le consultant ou en envoyant un formulaire, vous acceptez ces conditions. Si vous ne les acceptez pas, merci de ne pas l'utiliser.`,
      sections: [
        { heading: "Titulaire du site", items: ownerItems(legal, siteUrl, "fr") },
        {
          heading: "Objet du site",
          paragraphs: [
            `Le site présente, à titre informatif, la pratique clinique de ${owner}, psychologue et psychanalyste, ainsi que les services proposés : psychanalyse avec des adultes, supervision clinique, groupes d'étude et ateliers. Son contenu ne constitue ni une consultation, ni un diagnostic, ni une indication de traitement.`,
            "Envoyer un formulaire ou écrire sur WhatsApp n'établit pas à lui seul une relation thérapeutique. Celle-ci commence lorsque les deux parties conviennent du cadre de travail.",
          ],
        },
        {
          heading: "Ce n'est pas un service d'urgence",
          paragraphs: [
            "Ce site et ses canaux de contact ne traitent pas les urgences. Si vous ou un proche êtes en danger, appelez le 123 en Colombie ou le numéro d'urgence de votre pays, ou rendez-vous au service d'urgences le plus proche.",
          ],
        },
        {
          heading: "Honoraires, rendez-vous et annulations",
          paragraphs: [
            "Les tarifs publiés sur le site sont indicatifs. Les honoraires, la fréquence, la modalité et les conditions de report ou d'annulation sont convenus directement au début de chaque processus. Les places des groupes d'étude et des ateliers sont limitées et confirmées une fois l'inscription finalisée.",
          ],
        },
        {
          heading: "Séances en ligne",
          paragraphs: [
            "Pour les séances en ligne, chaque personne est responsable de disposer d'une connexion stable et d'un espace privé qui préserve la confidentialité de la séance. Il est interdit d'enregistrer les séances sans le consentement exprès des deux parties.",
          ],
        },
        {
          heading: "Confidentialité",
          paragraphs: [
            "Ce qui se travaille dans l'espace clinique est protégé par le secret professionnel, conformément à la loi colombienne 1090 de 2006 et aux autres normes applicables. Le traitement des données personnelles envoyées via le site est régi par la politique de confidentialité.",
          ],
          link: { href: "/privacidad", label: "Lire la politique de confidentialité" },
        },
        {
          heading: "Utilisation appropriée",
          paragraphs: [
            "Vous vous engagez à utiliser le site de manière licite, à fournir des informations exactes dans les formulaires et à ne pas tenter d'accéder aux zones restreintes, d'en perturber le fonctionnement ou d'envoyer des contenus offensants ou malveillants.",
          ],
        },
        {
          heading: "Propriété intellectuelle",
          paragraphs: [
            "Les textes, photographies, le design et les autres contenus du site appartiennent à son titulaire ou sont utilisés avec autorisation. Ils ne peuvent être reproduits, diffusés ni modifiés à des fins commerciales sans autorisation écrite préalable. Vous pouvez citer de courts extraits en indiquant la source.",
          ],
        },
        {
          heading: "Liens vers des tiers",
          paragraphs: [
            "Le site contient des liens vers des services tiers comme WhatsApp, Instagram, LinkedIn, YouTube ou des formulaires et agendas externes. Leur utilisation est régie par les conditions et politiques de chaque prestataire, sur lesquelles le titulaire du site n'a aucun contrôle.",
          ],
        },
        {
          heading: "Responsabilité",
          paragraphs: [
            "Tout est fait pour que les informations du site soient exactes et à jour, mais elles peuvent contenir des erreurs ou changer sans préavis. Le titulaire n'est pas responsable des dommages liés aux interruptions du site, aux défaillances techniques indépendantes de sa volonté ou à l'usage fait des informations publiées.",
          ],
        },
        {
          heading: "Modifications",
          paragraphs: [
            "Ces conditions peuvent être mises à jour à tout moment. La version en vigueur est celle publiée sur cette page, avec sa date de mise à jour.",
          ],
        },
        {
          heading: "Droit applicable",
          paragraphs: [
            "Ces conditions sont régies par les lois de la République de Colombie. Tout différend sera d'abord traité à l'amiable et, à défaut, devant les autorités compétentes de Colombie.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [`Pour toute question sur ces conditions, vous pouvez écrire à ${email}.`],
        },
      ],
    },
  }
}

export function getLegalDocuments(
  kind: LegalDocumentKind,
  legal: LegalContent,
  siteUrl: string
): Record<Language, LegalDocument> {
  return kind === "privacy" ? privacy(legal, siteUrl) : terms(legal, siteUrl)
}
