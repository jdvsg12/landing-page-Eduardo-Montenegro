export type Language = "es" | "en" | "fr"

export const translations = {
    es: {
        nav: {
            about: "Sobre mí",
            services: "Servicios",
            faq: "FAQ",
            contact: "Contacto",
        },
        hero: {
            title: "PSICÓLOGO - PSICONALISTA",
            subtitle: "Esp. Mg. Psicopatología y Salud Mental",
        },
        about: {
            title: "Sobre mí",
            description:
                "Soy psicólogo y psicoanalista, con especialización y maestría en Psicopatología y Salud Mental. Desde hace once años trabajo en el campo clínico con adultos, acompañando a quienes atraviesan distintos modos de sufrimiento subjetivo.\n\nMi práctica se orienta al trabajo con aquello que irrumpe y no encuentra palabras: el malestar persistente, las pérdidas, los duelos, las marcas del abuso sexual y otras experiencias que dejan huella en la vida psíquica. Trabajo desde el psicoanálisis, entendiendo que cada sujeto es singular y que no hay soluciones universales para lo que se sufre.",
        },
        profile: {
            title: "Perfil",
            title1: "Mi",
            title2: "Perfil",
            description:
                "Actualmente soy profesor universitario y dirijo el área de proyección social en UNICOC (Colombia), espacios desde los cuales continúo interrogando la clínica, el sufrimiento y los discursos contemporáneos sobre la salud mental.\n\nHe desarrollado mi labor clínica tanto de manera presencial como online, atendiendo personas en distintos países de América y Europa. Paralelamente, he participado activamente en espacios académicos y de investigación: fui secretario del Departamento de Investigación de IUSAM–APdeBA hasta 2021, formé parte del consejo editorial de la Revista Argentina de Humanidades y Ciencias Sociales, y participé como revisor en publicaciones vinculadas a metodología de la investigación en Argentina.\n\nConcibo el espacio analítico como un lugar de escucha rigurosa y respetuosa, donde es posible hablar sin exigencias ni promesas de bienestar inmediato, y donde cada proceso se construye a su propio tiempo.\n\nTe escucho.",
        },
        services: {
            title: "Servicios",
            seeMore: "Ver más",
            seeLess: "Ver menos",
            contactWhatsApp: "Contactar por WhatsApp",
            contactEmail: "Contactar por email",
            items: [
                {
                    title: "Psicoanálisis con adultos",
                    description:
                        "El psicoanálisis con adultos es un dispositivo clínico orientado al trabajo con el sufrimiento subjetivo, la angustia y los conflictos que se expresan de distintas maneras en la vida del sujeto.\n\nSe trata de un espacio de palabra y de escucha, en el que cada proceso se construye de manera singular y a su propio tiempo, a partir de lo que el sujeto trae como malestar, sufrimiento o interrogante.\n\nLas sesiones pueden realizarse de manera presencial u online, según el encuadre acordado.",
                    whatsapp: "+573142793431",
                    message: "Hola, estoy buscando iniciar psicoanalisis"
                },
                {
                    title: "Supervisión clínica",
                    description:
                        "La supervisión clínica es un espacio de trabajo dirigido a psicólogos/as y psicoanalistas que se encuentran ejerciendo la práctica clínica y desean interrogar su quehacer, sus impasses y sus decisiones.\n\nConsiste en un dispositivo de lectura clínica que permite situar la posición del analista, el lugar de la transferencia y los efectos de la intervención.\n\nLa supervisión se orienta por el caso, por lo singular de cada encuentro clínico y por las preguntas que allí emergen. \n\nModalidad online o presencial, según encuadre.",
                    whatsapp: "+573142793431",
                    message: "Hola, quisiera supervisar un caso clínico"
                },
                {
                    title: "Grupo de estudio",
                    description:
                        "El grupo de estudio propone un espacio de lectura y discusión clínica en torno al primer encuentro del sujeto con el analista, desde una orientación lacaniana.\n\nSe trabajarán los modos de llegada a la consulta, la formulación de la demanda, la instalación del dispositivo analítico y los primeros efectos de la transferencia.\n\nEl trabajo se realizará a partir de los textos de Sigmund Freud, los seminarios de Jacques Lacan, y de la discusión clínica. Está dirigido a estudiantes avanzados y profesionales interesados en interrogar la clínica en su punto de inicio. \n\nModalidad online, frecuencia quincenal, miércoles de 9 a 11 a.m. (hora Colombia).",
                    whatsapp: "+573142793431",
                    message: "Hola, quiero más información sobre el grupo de estudio"
                }
            ],
        },
        contact: {
            title: "Dejame un mensaje",
            name: "¿Cuál es tu nombre?",
            namePlaceholder: "Tu nombre",
            email: "¿Cuál es tu correo?",
            emailPlaceholder: "Tu correo electrónico",
            phone: "¿Cuál es tu teléfono?",
            phonePlaceholder: "Tu número",
            servicesLabel: "¿Qué servicios buscas?",
            servicesPlaceholder: "Tus servicios",
            message: "Tu mensaje",
            messagePlaceholder: "Este es un mensaje para Eduardo...",
            send: "Enviar",
            contactTitle: "Contacto",
            socialMedia: "Redes Sociales",
            validation: {
                nameMin: "El nombre debe tener al menos 2 caracteres",
                nameMax: "El nombre no puede exceder 100 caracteres",
                nameFormat: "El nombre solo puede contener letras y espacios",
                emailRequired: "El correo electrónico es obligatorio",
                emailInvalid: "Por favor ingresa un correo electrónico válido",
                emailMax: "El correo es demasiado largo",
                phoneRequired: "El teléfono es obligatorio",
                phoneFormat: "El teléfono solo puede contener números, espacios, guiones y paréntesis",
                phoneMin: "El teléfono debe tener al menos 7 dígitos",
                phoneMax: "El teléfono no puede tener más de 15 dígitos",
                servicesRequired: "Debes seleccionar un servicio",
                messageMax: "El mensaje no puede exceder 1000 caracteres",
                termsRequired: "Debes aceptar los términos y condiciones",
                formTitle: "Por favor corrige los siguientes errores:"
            }
        },
        faq: {
            title: "Preguntas frecuentes",
            categories: [
                {
                    name: "Sobre psicoanálisis",
                    items: [
                        {
                            question: "¿Qué se entiende por psicoanálisis?",
                            answer: "El psicoanálisis es una práctica clínica orientada por la enseñanza de Freud y Lacan, centrada en la palabra y en la singularidad del sujeto. Se ocupa del sufrimiento, la angustia y los conflictos que se juegan en la experiencia subjetiva del sujeto.",
                        },
                        {
                            question: "¿Cuándo consultar a un psicoanalista?",
                            answer: "Cuando algo del malestar, la angustia o la repetición insiste y no encuentra una vía de elaboración. La consulta no requiere un diagnóstico previo ni una demanda clara, sino la posibilidad de interrogar aquello que irrumpe en la experiencia del sujeto.",
                        },
                        {
                            question: "¿Tiene tiempo definido un análisis?",
                            answer: "No. Un análisis no responde a una duración estándar ni a un número fijo de sesiones. Su tiempo se construye en función del proceso del sujeto, de lo que se pone en juego en la transferencia y de los efectos que allí se producen.",
                        },
                        {
                            question: "¿En qué se diferencia el psicoanálisis de otras prácticas en salud mental?",
                            answer: "El psicoanálisis se orienta por la singularidad del sujeto y por la lectura de lo que se juega en la palabra y en la transferencia. La dirección del tratamiento se construye caso por caso, a partir de lo que emerge en la experiencia clínica y del modo en que cada sujeto se implica en su decir.",
                        },
                        {
                            question: "¿Cómo se establecen los honorarios?",
                            answer: "Los honorarios se establecen en el primer contacto, a partir de un encuadre inicial. Como referencia, el valor por sesión se encuentra entre COP 150.000 y COP 230.000. Para el exterior, entre USD 50 y USD 70 o EUR 45 y EUR 65. El valor concreto se acuerda caso por caso.",
                        },
                    ],
                },
                {
                    name: "Sobre supervisión",
                    items: [
                        {
                            question: "¿En qué momentos es pertinente supervisar un caso?",
                            answer: "La supervisión resulta pertinente cuando el analista se encuentra con impasses, dudas, efectos inesperados de la intervención o interrogantes clínicos. No responde únicamente a dificultades técnicas, sino a la lectura de la posición del analista en el caso.",
                        },
                        {
                            question: "¿La supervisión tiene una frecuencia establecida?",
                            answer: "La frecuencia de la supervisión no es fija. Se establece según el encuadre acordado, las características del caso y del profesional. Puede ser regular o puntual, dependiendo del momento clínico y de la demanda de supervisión.",
                        },
                        {
                            question: "¿Qué material se trabaja en una supervisión clínica?",
                            answer: "Se trabaja a partir de lo que llama la atención al analista del caso: sus intervenciones, su angustia, los impasses, las preguntas clínicas y los efectos de la transferencia.",
                        },
                        {
                            question: "¿Cuáles son los honorarios de la supervisión clínica?",
                            answer: "Los honorarios de supervisión clínica son COP 100.000 por encuentro. Para el exterior, USD 30 o EUR 25. La modalidad puede ser online o presencial, según el encuadre acordado.",
                        },
                    ],
                },
                {
                    name: "Sobre grupo de estudio",
                    items: [
                        {
                            question: "¿En qué consiste un grupo de estudio en psicoanálisis?",
                            answer: "Es un espacio de lectura, discusión y trabajo conceptual orientado por el psicoanálisis, desde una perspectiva clínica. El grupo se centra en textos y problemas específicos, privilegiando la elaboración colectiva y el intercambio riguroso entre los participantes.",
                        },
                        {
                            question: "¿Cuál es la duración del grupo de estudio?",
                            answer: "El grupo de estudio tiene una duración definida de veinte encuentros, con una frecuencia quincenal. Cada encuentro tiene una duración de dos horas. El recorrido se organiza en un tiempo delimitado, orientado al trabajo riguroso sobre el tema propuesto.",
                        },
                        {
                            question: "¿Cuántos integrantes puede tener un grupo de estudio?",
                            answer: "El grupo de estudio tiene un cupo reducido. Está conformado por un máximo de seis participantes, más el coordinador, con el fin de sostener un espacio de trabajo riguroso, clínico y de intercambio efectivo.",
                        },
                        {
                            question: "¿Cuáles son los honorarios del grupo de estudio?",
                            answer: "Los honorarios del grupo de estudio son COP 100.000 por encuentro. Para el exterior, USD 30 o EUR 25. La modalidad es online.",
                        },
                    ],
                },
            ],
        },
        footer: {
            socialMedia: "Social Media",
        },
    },
    en: {
        nav: {
            about: "About",
            services: "Services",
            faq: "FAQ",
            contact: "Contact",
        },
        hero: {
            title: "PSYCHOLOGIST - PSYCHOANALYST",
            subtitle: "Specialist. Master in Psychopathology and Mental Health",
        },
        about: {
            title: "About me",
            title1: "About",
            title2: "me",
            description:
                "I am a psychologist and psychoanalyst, with postgraduate training and a master's degree in Psychopathology and Mental Health. For over eleven years, I have worked in the clinical field with adults, accompanying those who experience different forms of subjective suffering.\n\nMy practice is oriented toward what irrupts and does not easily find words: persistent distress, loss, mourning, the marks left by sexual abuse, and other experiences that leave traces in psychic life. I work from a psychoanalytic perspective, understanding that each subject is singular and that there are no universal solutions to suffering.",
        },
        profile: {
            title: "Profile",
            title1: "My",
            title2: "Profile",
            description:
                "I am currently a university professor and Director of Social Outreach at UNICOC (Colombia), spaces from which I continue to question clinical practice, suffering, and contemporary discourses on mental health.\n\nI have developed my clinical work both in person and online, working with people in different countries across the Americas and Europe. In parallel, I have actively participated in academic and research spaces: I served as Secretary of the Research Department at IUSAM–APdeBA until 2021, was a member of the editorial board of the Revista Argentina de Humanidades y Ciencias Sociales and participated as a reviewer in publications on research methodology in Argentina.\n\nI conceive the analytic space as a place of rigorous and respectful listening, where it is possible to speak without demands or promises of immediate well-being, and where each process unfolds in its own time.\n\nI listen.",
        },
        services: {
            title: "I can help you with ...",
            items: [
                {
                    title: "Online Psychotherapy",
                    description:
                        "Taking a different path from the one that led you to your current situation is possible. From Psychoanalysis, a listening space is offered where you can speak, accompanying you in the process of going through and transforming what causes you suffering.",
                },
                {
                    title: "Clinical Supervision - professionals",
                    description:
                        "Taking a different path from the one that led you to your current situation is possible. From Psychoanalysis, a listening space is offered where you can speak, accompanying you in the process of going through and transforming what causes you suffering.",
                },
                {
                    title: "Clinical Supervision - professionals",
                    description:
                        "Taking a different path from the one that led you to your current situation is possible. From Psychoanalysis, a listening space is offered where you can speak, accompanying you in the process of going through and transforming what causes you suffering.",
                },
            ],
        },
        contact: {
            title: "Leave me a message",
            name: "What is your name?",
            namePlaceholder: "Your name",
            email: "What is your Email?",
            emailPlaceholder: "Your email",
            phone: "What phone number?",
            phonePlaceholder: "Your number",
            servicesLabel: "What services are you looking for?",
            servicesPlaceholder: "Your Services",
            message: "Your message",
            messagePlaceholder: "This is a message to Eduardo...",
            send: "Send it",
            contactTitle: "Contact",
            socialMedia: "Social Media",
            validation: {
                nameMin: "Name must be at least 2 characters",
                nameMax: "Name cannot exceed 100 characters",
                nameFormat: "Name can only contain letters and spaces",
                emailRequired: "Email is required",
                emailInvalid: "Please enter a valid email address",
                emailMax: "Email is too long",
                phoneRequired: "Phone number is required",
                phoneFormat: "Phone can only contain numbers, spaces, hyphens and parentheses",
                phoneMin: "Phone must have at least 7 digits",
                phoneMax: "Phone cannot have more than 15 digits",
                servicesRequired: "You must select a service",
                messageMax: "Message cannot exceed 1000 characters",
                termsRequired: "You must accept the terms and conditions",
                formTitle: "Please correct the following errors:"
            }
        },
        faq: {
            title: "Frequently Asked Questions",
            categories: [
                {
                    name: "About Psychoanalysis",
                    items: [
                        {
                            question: "What is meant by psychoanalysis?",
                            answer: "Psychoanalysis is a clinical practice oriented by the teaching of Freud and Lacan, centred on speech and on the singularity of the subject. It is concerned with suffering, anxiety, and conflicts as they unfold in the subject's subjective experience.",
                        },
                        {
                            question: "When should one consult a psychoanalyst?",
                            answer: "When something of discomfort, anxiety, or repetition persists and finds no path for elaboration. A consultation does not require a prior diagnosis or a clearly formulated demand, but rather the possibility of questioning what irrupts in the subject's experience.",
                        },
                        {
                            question: "Does an analysis have a defined duration?",
                            answer: "No. An analysis does not follow a standard duration or a fixed number of sessions. Its time is constructed according to the subject's process, what is at stake in transference, and the effects produced therein.",
                        },
                        {
                            question: "How does psychoanalysis differ from other mental health practices?",
                            answer: "Psychoanalysis is oriented by the singularity of the subject and by a reading of what is at stake in speech and in transference. The direction of the treatment is constructed case by case, based on what emerges in the clinical experience and on how each subject becomes involved in their own saying.",
                        },
                        {
                            question: "How are fees established?",
                            answer: "Fees are established during the first contact, based on an initial clinical framework. As a reference, the fee per session ranges between COP 150,000 and COP 230,000. For clients outside Colombia, fees range between USD 50 and USD 70 or EUR 45 and EUR 65. The final fee is agreed upon on a case-by-case basis.",
                        },
                    ],
                },
                {
                    name: "About Clinical Supervision",
                    items: [
                        {
                            question: "When is it appropriate to supervise a case?",
                            answer: "Supervision is pertinent when the analyst encounters impasses, doubts, unexpected effects of an intervention, or clinical questions. It does not respond solely to technical difficulties, but to a reading of the analyst's position within the case.",
                        },
                        {
                            question: "Does supervision have a fixed frequency?",
                            answer: "The frequency of supervision is not fixed. It is established according to the agreed clinical framework, the characteristics of the case, and the professional's needs. It may be regular or punctual, depending on the clinical moment and the demand for supervision.",
                        },
                        {
                            question: "What material is worked on in clinical supervision?",
                            answer: "The work is based on what draws the analyst's attention in the case: their interventions, their anxiety, impasses, clinical questions, and the effects of transference.",
                        },
                        {
                            question: "What are the fees for clinical supervision?",
                            answer: "The fee for clinical supervision is COP 100,000 per meeting. For clients outside Colombia, the fee is USD 30 or EUR 25. The modality may be online or in person, according to the agreed framework.",
                        },
                    ],
                },
                {
                    name: "About the Study Group",
                    items: [
                        {
                            question: "What does a psychoanalytic study group consist of?",
                            answer: "It is a space for reading, discussion, and conceptual work oriented by psychoanalysis from a clinical perspective. The group focuses on specific texts and problems, privileging collective elaboration and rigorous exchange among participants.",
                        },
                        {
                            question: "What is the duration of the study group?",
                            answer: "The study group has a defined duration of twenty meetings, held on a biweekly basis. Each meeting lasts two hours. The work is organized within a delimited time frame, oriented toward rigorous engagement with the proposed topic.",
                        },
                        {
                            question: "How many participants can a study group have?",
                            answer: "The study group has a limited number of participants. It is composed of a maximum of six participants, plus the coordinator, to sustain a rigorous clinical working space and effective exchange.",
                        },
                        {
                            question: "What are the fees for the study group?",
                            answer: "The fee for the study group is COP 100,000 per meeting. For participants outside Colombia, the fee is USD 30 or EUR 25. The modality is online.",
                        },
                    ],
                },
            ],
        },
        footer: {
            socialMedia: "Social Media",
        },
    },
    fr: {
        nav: {
            about: "À propos",
            services: "Services",
            faq: "FAQ",
            contact: "Contact",
        },
        hero: {
            title: "PSYCHOLOGUE - PSYCHANALYSTE",
            subtitle: "Spécialiste. Maîtrise en Psychopathologie et Santé Mentale",
        },
        about: {
            title: "À propos de moi",
            title1: "À propos",
            title2: "de moi",
            description:
                "Je suis psychologue et psychanalyste, titulaire d'une spécialisation et d'un master en psychopathologie et santé mentale. Depuis plus de onze ans, je travaille dans le champ clinique avec des adultes, en accompagnant des personnes confrontées à différentes formes de souffrance subjective.\n\nMa pratique s'oriente vers ce qui fait irruption et ne trouve pas facilement de mots : le malaise persistant, les pertes, les deuils, les marques laissées par les abus sexuels et d'autres expériences qui laissent une trace dans la vie psychique. Je travaille à partir de la psychanalyse, en considérant que chaque sujet est singulier et qu'il n'existe pas de solutions universelles à la souffrance.",
        },
        profile: {
            title: "Profil",
            title1: "Mon",
            title2: "Profil",
            description:
                "Je suis actuellement professeur universitaire et directeur de l'aire de projection sociale à l'UNICOC (Colombie), espaces à partir desquels je poursuis l'interrogation de la clinique, de la souffrance et des discours contemporains sur la santé mentale.\n\nJ'ai développé mon activité clinique en présentiel et en ligne, en accompagnant des personnes dans différents pays d'Amérique et d'Europe. Parallèlement, j'ai participé activement à des espaces académiques et de recherche : j'ai été secrétaire du Département de recherche de l'IUSAM–APdeBA jusqu'en 2021, membre du comité éditorial de la Revista Argentina de Humanidades y Ciencias Sociales, et relecteur pour des publications en méthodologie de la recherche en Argentine.\n\nJe conçois l'espace analytique comme un lieu d'écoute rigoureuse et respectueuse, où il est possible de parler sans exigences ni promesses de bien-être immédiat, et où chaque processus se construit à son propre rythme.\n\nJe vous écoute.",
        },
        services: {
            title: "Services",
            seeMore: "Voir plus",
            seeLess: "Voir moins",
            contactWhatsApp: "Contacter via WhatsApp",
            contactEmail: "Contacter par email",
            items: [
                {
                    title: "Psychanalyse avec des adultes",
                    description:
                        "La psychanalyse avec des adultes est un dispositif clinique orienté vers le travail de la souffrance subjective, de l'angoisse et des conflits qui s'expriment de différentes manières dans la vie du sujet.\n\nIl s'agit d'un espace de parole et d'écoute, dans lequel chaque processus se construit de manière singulière et à son propre rythme, à partir de ce que le sujet apporte comme malaise, souffrance ou question.\n\nLes séances peuvent se dérouler en présentiel ou en ligne, selon le cadre convenu.",
                    whatsapp: "+573142793431",
                    message: "Hola, estoy buscando iniciar psicoanalisis"
                },
                {
                    title: "Supervision clinique",
                    description:
                        "La supervision clinique est un espace de travail destiné aux psychologues et aux psychanalystes engagés dans la pratique clinique et souhaitant interroger leur travail, leurs impasses et leurs décisions.\n\nElle consiste en un dispositif de lecture clinique permettant de situer la position de l'analyste, la place du transfert et les effets de l'intervention.\n\nLa supervision s'oriente à partir du cas, de la singularité de chaque rencontre clinique et des questions qui y émergent. Modalité en ligne ou en présentiel, selon le cadre établi.",
                    whatsapp: "+573142793431",
                    message: "Hola, quisiera supervisar un caso clínico"
                },
                {
                    title: "Groupe d'étude",
                    description:
                        "Le groupe d'étude propose un espace de lecture et de discussion clinique autour de la première rencontre du sujet avec l'analyste, dans une orientation lacanienne.\n\nSeront travaillés les modes d'entrée en consultation, la formulation de la demande, l'installation du dispositif analytique et les premiers effets du transfert.\n\nLe travail s'appuie sur des textes de Sigmund Freud, les séminaires de Jacques Lacan et la discussion clinique. Le groupe s'adresse aux étudiants avancés et aux professionnels souhaitant interroger la clinique à son point d'entrée. Modalité en ligne, fréquence bimensuelle, le mercredi de 9h à 11h (heure Colombie).",
                    whatsapp: "+573142793431",
                    message: "Hola, quiero más información sobre el grupo de estudio"
                }
            ],
        },
        contact: {
            title: "Laissez-moi un message",
            name: "Quel est votre nom?",
            namePlaceholder: "Votre nom",
            email: "Quel est votre Email?",
            emailPlaceholder: "Votre email",
            phone: "Quel numéro de téléphone?",
            phonePlaceholder: "Votre numéro",
            servicesLabel: "Quels services recherchez-vous?",
            servicesPlaceholder: "Vos Services",
            message: "Votre message",
            messagePlaceholder: "Ceci est un message pour Eduardo...",
            send: "Envoyer",
            contactTitle: "Contact",
            socialMedia: "Réseaux Sociaux",
            validation: {
                nameMin: "Le nom doit contenir au moins 2 caractères",
                nameMax: "Le nom ne peut pas dépasser 100 caractères",
                nameFormat: "Le nom ne peut contenir que des lettres et des espaces",
                emailRequired: "L'email est obligatoire",
                emailInvalid: "Veuillez entrer une adresse email valide",
                emailMax: "L'email est trop long",
                phoneRequired: "Le numéro de téléphone est obligatoire",
                phoneFormat: "Le téléphone ne peut contenir que des chiffres, espaces, tirets et parenthèses",
                phoneMin: "Le téléphone doit avoir au moins 7 chiffres",
                phoneMax: "Le téléphone ne peut pas avoir plus de 15 chiffres",
                servicesRequired: "Vous devez sélectionner un service",
                messageMax: "Le message ne peut pas dépasser 1000 caractères",
                termsRequired: "Vous devez accepter les termes et conditions",
                formTitle: "Veuillez corriger les erreurs suivantes:"
            }
        },
        faq: {
            title: "Questions fréquentes",
            categories: [
                {
                    name: "À propos de la psychanalyse",
                    items: [
                        {
                            question: "Qu'entend-on par psychanalyse ?",
                            answer: "La psychanalyse est une pratique clinique orientée par l'enseignement de Freud et de Lacan, centrée sur la parole et sur la singularité du sujet. Elle s'occupe de la souffrance, de l'angoisse et des conflits qui se jouent dans l'expérience subjective du sujet.",
                        },
                        {
                            question: "Quand consulter un psychanalyste ?",
                            answer: "Lorsque quelque chose du malaise, de l'angoisse ou de la répétition insiste et ne trouve pas de voie d'élaboration. La consultation ne requiert ni diagnostic préalable ni demande clairement formulée, mais la possibilité d'interroger ce qui fait irruption dans l'expérience du sujet.",
                        },
                        {
                            question: "Une analyse a-t-elle une durée définie ?",
                            answer: "Non. Une analyse ne répond ni à une durée standard ni à un nombre fixe de séances. Son temps se construit en fonction du processus du sujet, de ce qui se joue dans le transfert et des effets qui s'y produisent.",
                        },
                        {
                            question: "En quoi la psychanalyse se distingue-t-elle des autres pratiques en santé mentale ?",
                            answer: "La psychanalyse s'oriente par la singularité du sujet et par la lecture de ce qui se joue dans la parole et dans le transfert. La direction de la cure se construit au cas par cas, à partir de ce qui émerge dans l'expérience clinique et de la manière dont chaque sujet s'implique dans son dire.",
                        },
                        {
                            question: "Comment les honoraires sont-ils établis ?",
                            answer: "Les honoraires sont établis lors du premier contact, à partir d'un cadre initial. À titre indicatif, le tarif par séance se situe entre COP 150 000 et COP 230 000. Pour l'étranger, entre USD 50 et USD 70 ou EUR 45 et EUR 65. Le montant précis est convenu au cas par cas.",
                        },
                    ],
                },
                {
                    name: "À propos de la supervision clinique",
                    items: [
                        {
                            question: "À quels moments est-il pertinent de superviser un cas ?",
                            answer: "La supervision est pertinente lorsque l'analyste rencontre des impasses, des doutes, des effets inattendus de l'intervention ou des questions cliniques. Elle ne répond pas uniquement à des difficultés techniques, mais à la lecture de la position de l'analyste dans le cas.",
                        },
                        {
                            question: "La supervision a-t-elle une fréquence établie ?",
                            answer: "La fréquence de la supervision n'est pas fixe. Elle est établie selon le cadre convenu, les caractéristiques du cas et du professionnel. Elle peut être régulière ou ponctuelle, selon le moment clinique et la demande de supervision.",
                        },
                        {
                            question: "Quel matériel est travaillé en supervision clinique ?",
                            answer: "Le travail s'appuie sur ce qui retient l'attention de l'analyste dans le cas : ses interventions, son angoisse, les impasses, les questions cliniques et les effets du transfert.",
                        },
                        {
                            question: "Quels sont les honoraires de la supervision clinique ?",
                            answer: "Les honoraires de la supervision clinique sont de COP 100 000 par rencontre. Pour l'étranger, USD 30 ou EUR 25. La modalité peut être en ligne ou en présentiel, selon le cadre convenu.",
                        },
                    ],
                },
                {
                    name: "À propos du groupe d'étude",
                    items: [
                        {
                            question: "En quoi consiste un groupe d'étude en psychanalyse ?",
                            answer: "Il s'agit d'un espace de lecture, de discussion et de travail conceptuel orienté par la psychanalyse, depuis une perspective clinique. Le groupe se centre sur des textes et des problématiques spécifiques, en privilégiant l'élaboration collective et l'échange rigoureux entre les participants.",
                        },
                        {
                            question: "Quelle est la durée du groupe d'étude ?",
                            answer: "Le groupe d'étude a une durée définie de vingt rencontres, à raison d'une fréquence bimensuelle. Chaque rencontre dure deux heures. Le parcours s'organise dans un temps délimité, orienté vers un travail rigoureux sur le thème proposé.",
                        },
                        {
                            question: "Combien de participants peut compter un groupe d'étude ?",
                            answer: "Le groupe d'étude a un nombre de places limité. Il est composé d'un maximum de six participants, plus le coordinateur, afin de soutenir un espace de travail rigoureux, clinique et propice à un échange effectif.",
                        },
                        {
                            question: "Quels sont les honoraires du groupe d'étude ?",
                            answer: "Les honoraires du groupe d'étude sont de COP 100 000 par rencontre. Pour l'étranger, USD 30 ou EUR 25. La modalité est en ligne.",
                        },
                    ],
                },
            ],
        },
        footer: {
            socialMedia: "Réseaux Sociaux",
        },
    },
}

export function getTranslation(lang: Language) {
    return translations[lang]
}
