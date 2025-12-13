/**
 * The Dive - Localized Lesson Data
 *
 * This module contains all lesson content with translations.
 * The backend is the single source of truth for lesson content.
 */

export type DiveZone = 'The Shallows' | 'The Twilight Zone' | 'The Midnight Zone' | 'The Trench';

export type SupportedLanguage = 'en-US' | 'de-DE';

export interface LocalizedLessonContent {
  title: string;
  zone: string; // Translated zone name
  clinicalConcept: string;
  oceanMetaphor: string;
  commonResistance: string;
  socraticGoal: string;
  suggestedReading?: string;
  safetyNotes?: string;
}

export interface DiveLessonBase {
  id: string;
  zone: DiveZone;
  source_material: string;
}

export interface DiveLessonFull extends DiveLessonBase {
  content: LocalizedLessonContent;
}

/**
 * Zone translations
 */
const ZONE_TRANSLATIONS: Record<DiveZone, Record<SupportedLanguage, string>> = {
  'The Shallows': {
    'en-US': 'The Shallows',
    'de-DE': 'Die Untiefen',
  },
  'The Twilight Zone': {
    'en-US': 'The Twilight Zone',
    'de-DE': 'Die Dämmerungszone',
  },
  'The Midnight Zone': {
    'en-US': 'The Midnight Zone',
    'de-DE': 'Die Mitternachtszone',
  },
  'The Trench': {
    'en-US': 'The Trench',
    'de-DE': 'Der Graben',
  },
};

/**
 * Lesson content translations
 */
const LESSON_CONTENT: Record<
  string,
  Record<SupportedLanguage, Omit<LocalizedLessonContent, 'zone'>>
> = {
  L01: {
    'en-US': {
      title: 'The Emergency Hatch',
      clinicalConcept: 'Mammalian Dive Reflex',
      oceanMetaphor:
        "Just as diving mammals automatically slow their hearts when submerged to conserve oxygen, you can 'hack' your biology. Cold water on the eyes or nose triggers the Vagus Nerve to instantly lower heart rate, acting as a mechanical brake for panic.",
      commonResistance:
        '"Splashing water on my face is too simple. My panic is complex, so the solution must be complex."',
      socraticGoal:
        'To demonstrate that anxiety is physiological before it is psychological. By changing the physiology (heart rate) mechanically, we prove the mind can be regulated via the body.',
      safetyNotes:
        "Avoid extreme cold shock if you have heart conditions or Raynaud's syndrome. Use a cool damp cloth instead of immersion.",
      suggestedReading: 'Stephen Porges: The Polyvagal Theory',
    },
    'de-DE': {
      title: 'Die Notluke',
      clinicalConcept: 'Tauchreflex der Säugetiere',
      oceanMetaphor:
        "So wie Tauchmammalien automatisch ihren Herzschlag verlangsamen, wenn sie untertauchen, um Sauerstoff zu sparen, kannst du deine Biologie 'hacken'. Kaltes Wasser auf Augen oder Nase aktiviert den Vagusnerv und senkt sofort die Herzfrequenz – wie eine mechanische Bremse für Panik.",
      commonResistance:
        '"Wasser ins Gesicht zu spritzen ist zu simpel. Meine Panik ist komplex, also muss die Lösung auch komplex sein."',
      socraticGoal:
        'Zu zeigen, dass Angst zuerst physiologisch ist, bevor sie psychologisch wird. Indem wir die Physiologie (Herzfrequenz) mechanisch verändern, beweisen wir, dass der Geist über den Körper reguliert werden kann.',
      safetyNotes:
        'Vermeide extremen Kälteschock bei Herzerkrankungen oder Raynaud-Syndrom. Verwende stattdessen ein kühles, feuchtes Tuch.',
      suggestedReading: 'Stephen Porges: The Polyvagal Theory',
    },
  },
  L02: {
    'en-US': {
      title: 'Mapping Your Waters',
      clinicalConcept: 'Polyvagal Hierarchy',
      oceanMetaphor:
        'The Buoy (Ventral/Safe), The Current (Sympathetic/Fight), and The Sinking (Dorsal/Freeze). You must know where you are in the water before you can swim.',
      commonResistance: '"I\'m overreacting, I should just calm down."',
      socraticGoal:
        "To validate that your body reacts to 'threat' (Neuroception) faster than your mind can think. 'Story follows State.'",
      suggestedReading: 'Deb Dana: Anchored',
    },
    'de-DE': {
      title: 'Deine Gewässer kartieren',
      clinicalConcept: 'Polyvagale Hierarchie',
      oceanMetaphor:
        'Die Boje (Ventral/Sicher), Die Strömung (Sympathisch/Kampf), und Das Sinken (Dorsal/Erstarren). Du musst wissen, wo du im Wasser bist, bevor du schwimmen kannst.',
      commonResistance: '"Ich überreagiere, ich sollte mich einfach beruhigen."',
      socraticGoal:
        "Zu bestätigen, dass dein Körper auf 'Bedrohung' (Neurozeption) schneller reagiert als dein Verstand denken kann. 'Die Geschichte folgt dem Zustand.'",
      suggestedReading: 'Deb Dana: Anchored',
    },
  },
  L03: {
    'en-US': {
      title: 'Checking the Gauges',
      clinicalConcept: 'Respiratory Regulation',
      oceanMetaphor:
        'Panic makes us feel like we are running out of air, but usually, we are hyperventilating—too much oxygen. Slow the exhale to conserve the tank.',
      commonResistance: '"Deep breathing makes me panic more/feels like I\'m suffocating."',
      socraticGoal:
        "To differentiate between 'calming breath' (long exhale) and 'panic breath' (gasping), addressing the 'Air Hunger' illusion.",
      suggestedReading: 'James Nestor: Breath',
    },
    'de-DE': {
      title: 'Die Anzeigen prüfen',
      clinicalConcept: 'Atemregulation',
      oceanMetaphor:
        'Panik lässt uns fühlen, als würde uns die Luft ausgehen, aber meist hyperventilieren wir – zu viel Sauerstoff. Verlangsame das Ausatmen, um den Tank zu schonen.',
      commonResistance: '"Tiefes Atmen macht meine Panik schlimmer / fühlt sich an wie Ersticken."',
      socraticGoal:
        "Den Unterschied zwischen 'beruhigendem Atem' (langes Ausatmen) und 'Panikatem' (Schnappen) zu erkennen und die Illusion des 'Lufthungers' zu adressieren.",
      suggestedReading: 'James Nestor: Breath',
    },
  },
  L04: {
    'en-US': {
      title: "The Dead Man's Float",
      clinicalConcept: 'Somatic Release & Tension',
      oceanMetaphor:
        "Fighting the water exhausts you. Trusting the buoyancy of the water lets you rest. The 'Dead Man's Float' is a survival position, not a giving-up position.",
      commonResistance: '"If I relax, I\'ll lose control/drown."',
      socraticGoal:
        "To experience the physical difference between 'bracing' against life and 'resting' in it.",
      suggestedReading: 'Bessel van der Kolk: The Body Keeps the Score',
    },
    'de-DE': {
      title: 'Der Toter-Mann-Float',
      clinicalConcept: 'Somatische Entspannung & Spannung',
      oceanMetaphor:
        "Gegen das Wasser zu kämpfen erschöpft dich. Dem Auftrieb des Wassers zu vertrauen lässt dich ruhen. Der 'Toter-Mann-Float' ist eine Überlebensposition, keine Aufgabe.",
      commonResistance: '"Wenn ich mich entspanne, verliere ich die Kontrolle / ertrinke."',
      socraticGoal:
        "Den körperlichen Unterschied zwischen 'sich gegen das Leben stemmen' und 'darin ruhen' zu erfahren.",
      suggestedReading: 'Bessel van der Kolk: The Body Keeps the Score',
    },
  },
  L05: {
    'en-US': {
      title: 'Glimmers in the Reef',
      clinicalConcept: 'Ventral Vagal Anchoring',
      oceanMetaphor:
        "Finding shiny shells in the sand. 'Triggers' pull us into danger; 'Glimmers' are tiny cues of safety—a color, a sound, a texture—that anchor us in the shallows.",
      commonResistance: '"Looking for good things is toxic positivity."',
      socraticGoal:
        "To reframe 'glimmers' not as ignoring the bad, but as biologically necessary cues to keep the nervous system regulated.",
      suggestedReading: 'Deb Dana: Polyvagal Card Deck',
    },
    'de-DE': {
      title: 'Schimmern im Riff',
      clinicalConcept: 'Ventral Vagale Verankerung',
      oceanMetaphor:
        "Glänzende Muscheln im Sand finden. 'Trigger' ziehen uns in Gefahr; 'Glimmers' sind winzige Sicherheitssignale – eine Farbe, ein Klang, eine Textur – die uns in den Untiefen verankern.",
      commonResistance: '"Nach guten Dingen zu suchen ist toxische Positivität."',
      socraticGoal:
        "'Glimmers' nicht als Ignorieren des Schlechten zu verstehen, sondern als biologisch notwendige Signale, um das Nervensystem reguliert zu halten.",
      suggestedReading: 'Deb Dana: Polyvagal Card Deck',
    },
  },
  L06: {
    'en-US': {
      title: 'Refraction Errors',
      clinicalConcept: 'Cognitive Distortions',
      oceanMetaphor:
        'Objects underwater look 33% larger and closer than they really are. Anxiety does the same to threats—magnifying and drawing them closer.',
      commonResistance: '"My problems are real, I\'m not imagining them."',
      socraticGoal:
        "To validate the threat is real, but challenge the *perception* of its size and immediacy due to the 'water' (anxiety).",
      suggestedReading: 'David Burns: Feeling Good',
    },
    'de-DE': {
      title: 'Brechungsfehler',
      clinicalConcept: 'Kognitive Verzerrungen',
      oceanMetaphor:
        'Objekte unter Wasser erscheinen 33% größer und näher als sie wirklich sind. Angst macht dasselbe mit Bedrohungen – sie vergrößert und zieht sie näher heran.',
      commonResistance: '"Meine Probleme sind real, ich bilde mir nichts ein."',
      socraticGoal:
        "Zu bestätigen, dass die Bedrohung real ist, aber die *Wahrnehmung* ihrer Größe und Unmittelbarkeit aufgrund des 'Wassers' (Angst) zu hinterfragen.",
      suggestedReading: 'David Burns: Feeling Good',
    },
  },
  L07: {
    'en-US': {
      title: 'The Rip Current',
      clinicalConcept: 'Cognitive Defusion',
      oceanMetaphor:
        'If you fight the rip current, you drown. Swim parallel—accept the feeling, change the action—to survive.',
      commonResistance: '"I just want the anxiety to stop right now."',
      socraticGoal:
        'To show that the struggle *against* anxiety is often more dangerous than the anxiety itself. Control is the problem.',
      suggestedReading: 'Steven Hayes: Get Out of Your Mind and Into Your Life',
    },
    'de-DE': {
      title: 'Die Strömung',
      clinicalConcept: 'Kognitive Defusion',
      oceanMetaphor:
        'Wenn du gegen die Strömung kämpfst, ertrinkst du. Schwimm parallel – akzeptiere das Gefühl, ändere die Handlung – um zu überleben.',
      commonResistance: '"Ich will nur, dass die Angst sofort aufhört."',
      socraticGoal:
        'Zu zeigen, dass der Kampf *gegen* Angst oft gefährlicher ist als die Angst selbst. Kontrolle ist das Problem.',
      suggestedReading: 'Steven Hayes: Get Out of Your Mind and Into Your Life',
    },
  },
  L08: {
    'en-US': {
      title: 'Monsters on the Boat',
      clinicalConcept: 'Acceptance & Willingness',
      oceanMetaphor:
        "You are the Captain. The monsters—intrusive thoughts—scream from the lower deck. You can't throw them overboard, but you don't have to let them steer.",
      commonResistance: '"I can\'t function with these thoughts screaming at me."',
      socraticGoal:
        "To practice 'willingness'—sailing *with* the monsters rather than rotting in the harbor to avoid them.",
      suggestedReading: 'Russ Harris: The Happiness Trap',
    },
    'de-DE': {
      title: 'Monster an Bord',
      clinicalConcept: 'Akzeptanz & Bereitschaft',
      oceanMetaphor:
        'Du bist der Kapitän. Die Monster – aufdringliche Gedanken – schreien vom Unterdeck. Du kannst sie nicht über Bord werfen, aber du musst sie nicht steuern lassen.',
      commonResistance: '"Ich kann nicht funktionieren, wenn diese Gedanken mich anschreien."',
      socraticGoal:
        "'Bereitschaft' üben – *mit* den Monstern segeln, statt im Hafen zu verrotten, um ihnen auszuweichen.",
      suggestedReading: 'Russ Harris: The Happiness Trap',
    },
  },
  L09: {
    'en-US': {
      title: 'The Beach Ball',
      clinicalConcept: 'Emotional Suppression',
      oceanMetaphor:
        'Trying to hold a beach ball underwater takes all your energy. Eventually, it pops up and hits you in the face. Let it float next to you.',
      commonResistance: '"If I let the emotion up, it will overwhelm me/I will never stop crying."',
      socraticGoal:
        "To demonstrate that suppression requires more effort than feeling. The ball floats gently if you don't fight it.",
      suggestedReading: 'Susan David: Emotional Agility',
    },
    'de-DE': {
      title: 'Der Wasserball',
      clinicalConcept: 'Emotionale Unterdrückung',
      oceanMetaphor:
        'Einen Wasserball unter Wasser zu halten kostet all deine Energie. Irgendwann springt er hoch und trifft dich im Gesicht. Lass ihn neben dir treiben.',
      commonResistance:
        '"Wenn ich die Emotion hochlasse, wird sie mich überwältigen / ich werde nie aufhören zu weinen."',
      socraticGoal:
        'Zu zeigen, dass Unterdrückung mehr Anstrengung erfordert als Fühlen. Der Ball treibt sanft, wenn du nicht dagegen ankämpfst.',
      suggestedReading: 'Susan David: Emotional Agility',
    },
  },
  L10: {
    'en-US': {
      title: 'The Ocean Floor',
      clinicalConcept: 'Self-as-Context',
      oceanMetaphor:
        'You are the Ocean, not the Waves. The surface is stormy, but the deep water—the Observer Self—remains calm and unchanged.',
      commonResistance: '"I feel like I *am* the storm. I can\'t find the calm."',
      socraticGoal:
        'To access the part of the self that can watch the pain without *being* the pain. Disidentifying from the symptom.',
      suggestedReading: 'Eckhart Tolle: The Power of Now',
    },
    'de-DE': {
      title: 'Der Meeresboden',
      clinicalConcept: 'Selbst-als-Kontext',
      oceanMetaphor:
        'Du bist der Ozean, nicht die Wellen. Die Oberfläche ist stürmisch, aber das tiefe Wasser – das beobachtende Selbst – bleibt ruhig und unverändert.',
      commonResistance:
        '"Ich fühle mich, als *wäre* ich der Sturm. Ich kann die Ruhe nicht finden."',
      socraticGoal:
        'Den Teil des Selbst zu erreichen, der den Schmerz beobachten kann, ohne der Schmerz zu *sein*. Sich vom Symptom lösen.',
      suggestedReading: 'Eckhart Tolle: The Power of Now',
    },
  },
  L11: {
    'en-US': {
      title: 'Hooked on the Line',
      clinicalConcept: 'Fusion vs. Defusion',
      oceanMetaphor:
        'Thoughts are like shiny lures. You are the fish. You can look at the lure without biting. Biting drags you to the surface.',
      commonResistance: '"But the thought feels so true."',
      socraticGoal:
        "To create a gap between 'having a thought' and 'buying the thought'. Thoughts are events, not facts.",
      suggestedReading: 'Russ Harris: ACT Made Simple',
    },
    'de-DE': {
      title: 'Am Haken',
      clinicalConcept: 'Fusion vs. Defusion',
      oceanMetaphor:
        'Gedanken sind wie glänzende Köder. Du bist der Fisch. Du kannst den Köder betrachten, ohne anzubeißen. Anbeißen zieht dich an die Oberfläche.',
      commonResistance: '"Aber der Gedanke fühlt sich so wahr an."',
      socraticGoal:
        "Eine Lücke zwischen 'einen Gedanken haben' und 'dem Gedanken glauben' zu schaffen. Gedanken sind Ereignisse, keine Fakten.",
      suggestedReading: 'Russ Harris: ACT Made Simple',
    },
  },
  L12: {
    'en-US': {
      title: 'Dropping Anchor',
      clinicalConcept: 'Grounding in Emotional Storms',
      oceanMetaphor:
        'When the storm is too heavy to sail, drop anchor. Connect with the body and the earth to ride it out.',
      commonResistance: '"I don\'t have time to stop/I need to fix this now."',
      socraticGoal:
        'To teach a rapid stabilization technique (ACE: Acknowledge, Connect, Engage) for emotional flooding.',
      suggestedReading: 'Russ Harris: The Reality Slap',
    },
    'de-DE': {
      title: 'Anker werfen',
      clinicalConcept: 'Erdung in emotionalen Stürmen',
      oceanMetaphor:
        'Wenn der Sturm zu schwer zum Segeln ist, wirf den Anker. Verbinde dich mit dem Körper und der Erde, um es durchzustehen.',
      commonResistance: '"Ich habe keine Zeit anzuhalten / Ich muss das jetzt lösen."',
      socraticGoal:
        'Eine schnelle Stabilisierungstechnik (ACE: Anerkennen, Verbinden, Engagieren) für emotionale Überflutung zu lehren.',
      suggestedReading: 'Russ Harris: The Reality Slap',
    },
  },
  L13: {
    'en-US': {
      title: 'Sonar Pings',
      clinicalConcept: 'Labeling Affect',
      oceanMetaphor:
        "Using sonar to name the shape in the dark. Is it a shark or a dolphin? Labeling 'Fear' reduces its size.",
      commonResistance: '"Naming it makes it real/scarier."',
      socraticGoal:
        "To reduce limbic arousal by engaging the prefrontal cortex through labeling. 'To name is to contain.'",
      suggestedReading: 'Dan Siegel: Mindsight',
    },
    'de-DE': {
      title: 'Sonar-Pings',
      clinicalConcept: 'Emotionen benennen',
      oceanMetaphor:
        "Sonar benutzen, um die Form im Dunkeln zu benennen. Ist es ein Hai oder ein Delfin? 'Angst' zu benennen reduziert ihre Größe.",
      commonResistance: '"Es zu benennen macht es real / beängstigender."',
      socraticGoal:
        "Die limbische Erregung zu reduzieren, indem der präfrontale Kortex durch Benennung aktiviert wird. 'Benennen ist Eindämmen.'",
      suggestedReading: 'Dan Siegel: Mindsight',
    },
  },
  L14: {
    'en-US': {
      title: 'The Fog',
      clinicalConcept: 'Confusion & Rumination',
      oceanMetaphor:
        "Nitrogen Narcosis creates a 'fog' where you lose direction. Rumination is paddling in circles in the fog. Trust your instruments—your Values—not your feelings.",
      commonResistance: '"I need to think my way out of this."',
      socraticGoal: 'To practice moving forward despite lack of clarity. Tolerating ambiguity.',
      suggestedReading: 'Pema Chödrön: When Things Fall Apart',
    },
    'de-DE': {
      title: 'Der Nebel',
      clinicalConcept: 'Verwirrung & Grübeln',
      oceanMetaphor:
        "Stickstoffnarkose erzeugt einen 'Nebel', in dem du die Orientierung verlierst. Grübeln ist Paddeln im Kreis im Nebel. Vertraue deinen Instrumenten – deinen Werten – nicht deinen Gefühlen.",
      commonResistance: '"Ich muss mich da rausdenken."',
      socraticGoal: 'Vorwärtsgehen trotz mangelnder Klarheit zu üben. Ambiguität aushalten.',
      suggestedReading: 'Pema Chödrön: When Things Fall Apart',
    },
  },
  L15: {
    'en-US': {
      title: 'Schools of Thought',
      clinicalConcept: 'Automatic Negative Thoughts',
      oceanMetaphor:
        "Thoughts move in schools. One negative thought usually brings a thousand friends. Notice the 'school' swarming without trying to catch every fish.",
      commonResistance: '"I have to analyze why I\'m thinking this."',
      socraticGoal:
        "To recognize the *pattern* of thinking rather than the *content* of individual thoughts. 'Oh, here is the Not-Good-Enough school again.'",
      suggestedReading: 'Daniel Goleman: Emotional Intelligence',
    },
    'de-DE': {
      title: 'Gedankenschwärme',
      clinicalConcept: 'Automatische negative Gedanken',
      oceanMetaphor:
        "Gedanken bewegen sich in Schwärmen. Ein negativer Gedanke bringt meist tausend Freunde mit. Beobachte den 'Schwarm', der vorbeiströmt, ohne jeden Fisch fangen zu wollen.",
      commonResistance: '"Ich muss analysieren, warum ich das denke."',
      socraticGoal:
        "Das *Muster* des Denkens zu erkennen statt den *Inhalt* einzelner Gedanken. 'Oh, da ist wieder der Nicht-Gut-Genug-Schwarm.'",
      suggestedReading: 'Daniel Goleman: Emotional Intelligence',
    },
  },
  L16: {
    'en-US': {
      title: 'Crush Depth',
      clinicalConcept: 'Shame & Worthiness',
      oceanMetaphor:
        "Shame is hydrostatic pressure. It feels like it's inside you, but it's the weight of the water—society, judgment—around you. You are not broken; you are at crush depth.",
      commonResistance: '"I really am just broken/defective. It\'s not the pressure."',
      socraticGoal:
        'To externalize shame as an environmental force rather than an internal defect.',
      suggestedReading: 'Brené Brown: I Thought It Was Just Me',
    },
    'de-DE': {
      title: 'Erdrückende Tiefe',
      clinicalConcept: 'Scham & Würdigkeit',
      oceanMetaphor:
        'Scham ist hydrostatischer Druck. Es fühlt sich an, als wäre sie in dir, aber es ist das Gewicht des Wassers – Gesellschaft, Bewertung – um dich herum. Du bist nicht kaputt; du bist in erdrückender Tiefe.',
      commonResistance: '"Ich bin wirklich einfach kaputt/defekt. Es ist nicht der Druck."',
      socraticGoal: 'Scham als Umweltkraft zu externalisieren, statt als inneren Defekt.',
      suggestedReading: 'Brené Brown: I Thought It Was Just Me',
    },
  },
  L17: {
    'en-US': {
      title: 'The Hermit Crab',
      clinicalConcept: 'Shame Shield: Moving Away',
      oceanMetaphor:
        'Withdrawal. Hiding in a shell to avoid being seen. Safe, but lonely. The shell protects you but also confines you.',
      commonResistance: '"People drain me, I prefer to be alone."',
      socraticGoal:
        'To distinguish between *solitude* (restorative/choice) and *isolation* (fear-based/shame).',
      suggestedReading: 'Brené Brown: Daring Greatly',
    },
    'de-DE': {
      title: 'Der Einsiedlerkrebs',
      clinicalConcept: 'Scham-Schild: Rückzug',
      oceanMetaphor:
        'Rückzug. Sich in einer Schale verstecken, um nicht gesehen zu werden. Sicher, aber einsam. Die Schale schützt dich, aber sie begrenzt dich auch.',
      commonResistance: '"Menschen erschöpfen mich, ich bin lieber allein."',
      socraticGoal:
        'Zwischen *Einsamkeit* (erholsam/gewählt) und *Isolation* (angstbasiert/Scham) zu unterscheiden.',
      suggestedReading: 'Brené Brown: Daring Greatly',
    },
  },
  L18: {
    'en-US': {
      title: 'The Pufferfish',
      clinicalConcept: 'Shame Shield: Moving Against',
      oceanMetaphor:
        'Aggression, defensiveness. Puffing up to look big and spiky so no one gets close enough to hurt you. Using shame to fight shame.',
      commonResistance: '"I\'m just protecting myself/asserting boundaries."',
      socraticGoal:
        "To identify when 'boundaries' are actually 'armor' preventing connection. Real strength doesn't need spikes.",
      suggestedReading: 'Kristin Neff: Self-Compassion',
    },
    'de-DE': {
      title: 'Der Kugelfisch',
      clinicalConcept: 'Scham-Schild: Angriff',
      oceanMetaphor:
        'Aggression, Abwehr. Sich aufblähen, um groß und stachelig auszusehen, damit niemand nah genug kommt, um zu verletzen. Scham mit Scham bekämpfen.',
      commonResistance: '"Ich schütze mich nur / setze Grenzen."',
      socraticGoal:
        "Zu erkennen, wann 'Grenzen' eigentlich 'Panzerung' sind, die Verbindung verhindert. Echte Stärke braucht keine Stacheln.",
      suggestedReading: 'Kristin Neff: Self-Compassion',
    },
  },
  L19: {
    'en-US': {
      title: 'The Schooling Fish',
      clinicalConcept: 'Shame Shield: Moving Toward',
      oceanMetaphor:
        "People pleasing, camouflage. Moving exactly like everyone else so you don't get eaten. Loss of individual color.",
      commonResistance: '"I just want to be helpful/nice. I don\'t like conflict."',
      socraticGoal:
        "To explore the cost of blending in: the loss of the authentic self. 'Fitting in is the opposite of Belonging.'",
      suggestedReading: 'Gabor Maté: The Myth of Normal',
    },
    'de-DE': {
      title: 'Der Schwarmfisch',
      clinicalConcept: 'Scham-Schild: Anpassung',
      oceanMetaphor:
        'People-Pleasing, Tarnung. Sich genau wie alle anderen bewegen, um nicht gefressen zu werden. Verlust der individuellen Farbe.',
      commonResistance: '"Ich will nur hilfreich/nett sein. Ich mag keinen Konflikt."',
      socraticGoal:
        "Die Kosten des Anpassens zu erkunden: der Verlust des authentischen Selbst. 'Reinpassen ist das Gegenteil von Dazugehören.'",
      suggestedReading: 'Gabor Maté: The Myth of Normal',
    },
  },
  L20: {
    'en-US': {
      title: 'Bioluminescence',
      clinicalConcept: 'Values & Inner Guidance',
      oceanMetaphor:
        'In the Midnight Zone, there is no sunlight—no external validation. You must generate your own light—your Values—to navigate the dark.',
      commonResistance: '"I don\'t know who I am or what I want. Nothing matters."',
      socraticGoal:
        "To identify 2-3 core values that shine even when 'happiness' is absent. 'What would you stand for if no one was watching?'",
      suggestedReading: "Viktor Frankl: Man's Search for Meaning",
    },
    'de-DE': {
      title: 'Biolumineszenz',
      clinicalConcept: 'Werte & innere Führung',
      oceanMetaphor:
        'In der Mitternachtszone gibt es kein Sonnenlicht – keine externe Bestätigung. Du musst dein eigenes Licht erzeugen – deine Werte – um durch die Dunkelheit zu navigieren.',
      commonResistance: '"Ich weiß nicht, wer ich bin oder was ich will. Nichts bedeutet etwas."',
      socraticGoal:
        "2-3 Kernwerte zu identifizieren, die auch leuchten, wenn 'Glück' abwesend ist. 'Wofür würdest du stehen, wenn niemand zuschaut?'",
      suggestedReading: "Viktor Frankl: Man's Search for Meaning",
    },
  },
  L21: {
    'en-US': {
      title: 'The Abyss Stares Back',
      clinicalConcept: 'Existential Dread & The Void',
      oceanMetaphor:
        "The bottom of the trench. The Void. It isn't 'empty'—it's 'open'. It's the blank canvas of existence.",
      commonResistance: '"It\'s all meaningless. Why bother?"',
      socraticGoal:
        "To pivot from 'Passive Nihilism' (despair) to 'Optimistic Nihilism' (freedom). If nothing matters, you are free.",
      suggestedReading: 'Irvin Yalom: Staring at the Sun',
    },
    'de-DE': {
      title: 'Der Abgrund blickt zurück',
      clinicalConcept: 'Existenzielle Angst & Die Leere',
      oceanMetaphor:
        "Der Boden des Grabens. Die Leere. Sie ist nicht 'leer' – sie ist 'offen'. Sie ist die unbeschriebene Leinwand der Existenz.",
      commonResistance: '"Es ist alles bedeutungslos. Warum sich bemühen?"',
      socraticGoal:
        "Von 'passivem Nihilismus' (Verzweiflung) zu 'optimistischem Nihilismus' (Freiheit) zu wechseln. Wenn nichts zählt, bist du frei.",
      suggestedReading: 'Irvin Yalom: Staring at the Sun',
    },
  },
  L22: {
    'en-US': {
      title: 'Diving into the Fear',
      clinicalConcept: 'Paradoxical Intention',
      oceanMetaphor:
        'If you are afraid of sinking, try to sink. If you fear the pressure, invite it in. Swimming toward the fear short-circuits the panic.',
      commonResistance: '"You want me to make it WORSE? That sounds insane."',
      socraticGoal:
        'To prove that the *anticipation* of fear is worse than the fear itself. Taking control of the symptom destroys the anxiety loop.',
      suggestedReading: 'Viktor Frankl: The Will to Meaning',
    },
    'de-DE': {
      title: 'In die Angst tauchen',
      clinicalConcept: 'Paradoxe Intention',
      oceanMetaphor:
        'Wenn du Angst vor dem Sinken hast, versuche zu sinken. Wenn du den Druck fürchtest, lade ihn ein. Auf die Angst zuschwimmen unterbricht die Panik.',
      commonResistance: '"Du willst, dass ich es SCHLIMMER mache? Das klingt verrückt."',
      socraticGoal:
        'Zu beweisen, dass die *Erwartung* der Angst schlimmer ist als die Angst selbst. Die Kontrolle über das Symptom zu übernehmen zerstört die Angstschleife.',
      suggestedReading: 'Viktor Frankl: The Will to Meaning',
    },
  },
  L23: {
    'en-US': {
      title: 'Amor Fati',
      clinicalConcept: 'Acceptance of Fate',
      oceanMetaphor:
        'Loving the Ocean. Not just the sunny surface, but the storms, the pressure, and the cold. Embracing the entire ecosystem of your life.',
      commonResistance: '"I refuse to accept this suffering. It\'s unfair."',
      socraticGoal:
        "To move from 'resignation' (giving up) to 'affirmation' (saying yes to life, including the pain). 'This is my life, and I will not wish it away.'",
      suggestedReading: 'Friedrich Nietzsche: The Gay Science',
    },
    'de-DE': {
      title: 'Amor Fati',
      clinicalConcept: 'Akzeptanz des Schicksals',
      oceanMetaphor:
        'Den Ozean lieben. Nicht nur die sonnige Oberfläche, sondern auch die Stürme, den Druck und die Kälte. Das gesamte Ökosystem deines Lebens umarmen.',
      commonResistance: '"Ich weigere mich, dieses Leiden zu akzeptieren. Es ist unfair."',
      socraticGoal:
        "Von 'Resignation' (Aufgeben) zu 'Bejahung' (Ja zum Leben sagen, einschließlich des Schmerzes) zu gehen. 'Das ist mein Leben, und ich werde es nicht wegwünschen.'",
      suggestedReading: 'Friedrich Nietzsche: The Gay Science',
    },
  },
  L24: {
    'en-US': {
      title: 'Tragic Optimism',
      clinicalConcept: 'Meaning in Suffering',
      oceanMetaphor:
        'Deep sea life thrives in extreme conditions. You can find life—meaning—even in the trench.',
      commonResistance: '"There is no silver lining."',
      socraticGoal:
        "To find meaning *despite* the lack of a silver lining. We don't need the suffering to be 'good' to survive it.",
      suggestedReading: "Viktor Frankl: Man's Search for Meaning",
    },
    'de-DE': {
      title: 'Tragischer Optimismus',
      clinicalConcept: 'Sinn im Leiden',
      oceanMetaphor:
        'Tiefsee-Leben gedeiht unter extremen Bedingungen. Du kannst Leben – Sinn – sogar im Graben finden.',
      commonResistance: '"Es gibt keinen Silberstreifen."',
      socraticGoal:
        "Sinn zu finden *trotz* des fehlenden Silberstreifens. Wir brauchen nicht, dass das Leiden 'gut' ist, um es zu überleben.",
      suggestedReading: "Viktor Frankl: Man's Search for Meaning",
    },
  },
  L25: {
    'en-US': {
      title: 'The Bends',
      clinicalConcept: 'Integration & Decompression',
      oceanMetaphor:
        "Returning to the surface too fast causes 'The Bends'. You cannot rush healing. You must decompress slowly to integrate the deep lessons.",
      commonResistance: '"I\'m fixed now. I want to go back to normal immediately."',
      socraticGoal:
        'To understand that the ocean is always there; we just get better at diving. The cycle continues.',
      suggestedReading: 'Irvin Yalom: Existential Psychotherapy',
    },
    'de-DE': {
      title: 'Die Taucherkrankheit',
      clinicalConcept: 'Integration & Dekompression',
      oceanMetaphor:
        "Zu schnell an die Oberfläche zurückzukehren verursacht 'Die Taucherkrankheit'. Du kannst Heilung nicht beschleunigen. Du musst langsam dekomprimieren, um die tiefen Lektionen zu integrieren.",
      commonResistance: '"Ich bin jetzt geheilt. Ich will sofort zur Normalität zurück."',
      socraticGoal:
        'Zu verstehen, dass der Ozean immer da ist; wir werden nur besser im Tauchen. Der Kreislauf geht weiter.',
      suggestedReading: 'Irvin Yalom: Existential Psychotherapy',
    },
  },
};

/**
 * Base lesson data (language-independent)
 */
const LESSON_BASE: Record<string, DiveLessonBase> = {
  L01: { id: 'L01', zone: 'The Shallows', source_material: 'Ochsner Health [2]; NCBI [1]' },
  L02: { id: 'L02', zone: 'The Shallows', source_material: 'Deb Dana [26]; Stephen Porges [2]' },
  L03: { id: 'L03', zone: 'The Shallows', source_material: 'Psychology Today; Othership [27]' },
  L04: { id: 'L04', zone: 'The Shallows', source_material: 'Khiron Clinics; Leading Edge [28]' },
  L05: { id: 'L05', zone: 'The Shallows', source_material: 'Deb Dana; Rhythm of Regulation [29]' },
  L06: { id: 'L06', zone: 'The Twilight Zone', source_material: 'Skyland Trail [30]; Scielo' },
  L07: { id: 'L07', zone: 'The Twilight Zone', source_material: 'Contextual Science' },
  L08: {
    id: 'L08',
    zone: 'The Twilight Zone',
    source_material: 'Sonia Jaeger [31]; Psychwire [32]',
  },
  L09: {
    id: 'L09',
    zone: 'The Twilight Zone',
    source_material: 'Aspire Counseling [33]; Contextual Science [34]',
  },
  L10: {
    id: 'L10',
    zone: 'The Twilight Zone',
    source_material: 'Providence [35]; Art Therapy Spot [36]',
  },
  L11: {
    id: 'L11',
    zone: 'The Twilight Zone',
    source_material: 'Contextual Science [34]; Hayes [37]',
  },
  L12: { id: 'L12', zone: 'The Twilight Zone', source_material: 'Psychwire [32]; Providence [35]' },
  L13: {
    id: 'L13',
    zone: 'The Twilight Zone',
    source_material: 'Trauma Therapist Institute; Haven',
  },
  L14: { id: 'L14', zone: 'The Twilight Zone', source_material: 'Scuba Tech; Psychwire [32]' },
  L15: { id: 'L15', zone: 'The Twilight Zone', source_material: 'Skyland Trail [30]' },
  L16: { id: 'L16', zone: 'The Midnight Zone', source_material: 'Brene Brown; UTEP' },
  L17: {
    id: 'L17',
    zone: 'The Midnight Zone',
    source_material: 'Laura Golding [38]; Wild Tree Wellness [39]',
  },
  L18: { id: 'L18', zone: 'The Midnight Zone', source_material: 'Think Better [40]; Scribd' },
  L19: {
    id: 'L19',
    zone: 'The Midnight Zone',
    source_material: 'Care Clinics; Julia Counseling [41]',
  },
  L20: { id: 'L20', zone: 'The Midnight Zone', source_material: 'Guilford; Polly Castor' },
  L21: { id: 'L21', zone: 'The Trench', source_material: 'Medium; Yalom' },
  L22: { id: 'L22', zone: 'The Trench', source_material: 'Verywell Mind [42]; Google Books [43]' },
  L23: { id: 'L23', zone: 'The Trench', source_material: 'The Stoic App [44]; Reddit [15]' },
  L24: { id: 'L24', zone: 'The Trench', source_material: 'Tokinomo; Livemint' },
  L25: { id: 'L25', zone: 'The Trench', source_material: 'Reddit; Quora' },
};

/**
 * Get a lesson with localized content
 */
export function getLocalizedLesson(
  lessonId: string,
  language: SupportedLanguage
): DiveLessonFull | undefined {
  const base = LESSON_BASE[lessonId];
  const content = LESSON_CONTENT[lessonId]?.[language];

  if (!base || !content) {
    return undefined;
  }

  return {
    ...base,
    content: {
      ...content,
      zone: ZONE_TRANSLATIONS[base.zone][language],
    },
  };
}

/**
 * Get translated zone name
 */
export function getTranslatedZone(zone: DiveZone, language: SupportedLanguage): string {
  return ZONE_TRANSLATIONS[zone][language];
}

/**
 * Get all lesson IDs
 */
export function getAllLessonIds(): string[] {
  return Object.keys(LESSON_BASE);
}

/**
 * Get lesson base data (without localized content)
 */
export function getLessonBase(lessonId: string): DiveLessonBase | undefined {
  return LESSON_BASE[lessonId];
}
