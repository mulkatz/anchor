/**
 * The Dive - Somatic Learning Curriculum
 *
 * 25 lessons based on Polyvagal Theory, organized by ocean depth zones:
 * - The Shallows (L01-L05): Ventral Vagal basics, safety cues, breath
 * - The Twilight Zone (L06-L15): Cognitive patterns, ACT techniques
 * - The Midnight Zone (L16-L20): Shame, values, deeper work
 * - The Trench (L21-L25): Existential depths, meaning, integration
 */

export type DiveZone = 'The Shallows' | 'The Twilight Zone' | 'The Midnight Zone' | 'The Trench';

export interface DiveLesson {
  id: string; // "L01" - "L25"
  zone: DiveZone;
  title: string;
  clinical_concept: string;
  source_material: string;
  ocean_metaphor: string;
  common_resistance: string;
  socratic_goal: string;
  suggested_reading?: string;
  suggested_reading_isbn_link?: string; // Amazon search link: https://www.amazon.com/s?k={ISBN}
  safety_notes?: string;
}

/**
 * Zone theme configuration for UI
 * Colors progress from light (safe) to dark (deep) as user descends
 */
export const zoneThemes: Record<
  DiveZone,
  {
    primary: string;
    glow: string;
    description: string;
    descriptionKey: string; // i18n key for translated description
  }
> = {
  'The Shallows': {
    primary: '#64FFDA', // Biolum cyan - Safe/Social
    glow: 'rgba(100, 255, 218, 0.3)',
    description: 'Ventral Vagal - Calm, Connected',
    descriptionKey: 'dive.zones.shallowsDesc',
  },
  'The Twilight Zone': {
    primary: '#FFB38A', // Warm ember - Cognitive work
    glow: 'rgba(255, 179, 138, 0.3)',
    description: 'Cognitive Patterns - Thoughts & Feelings',
    descriptionKey: 'dive.zones.twilightDesc',
  },
  'The Midnight Zone': {
    primary: '#A78BFA', // Violet - Shame/Values
    glow: 'rgba(167, 139, 250, 0.3)',
    description: 'Shame & Values - Deep Identity Work',
    descriptionKey: 'dive.zones.midnightDesc',
  },
  'The Trench': {
    primary: '#60A5FA', // Deep blue - Existential
    glow: 'rgba(96, 165, 250, 0.3)',
    description: 'Existential Depths - Meaning & Integration',
    descriptionKey: 'dive.zones.trenchDesc',
  },
};

/**
 * The 25-lesson curriculum
 * TODO: Add remaining lessons (L01, L05-L25)
 */
export const diveLessons: DiveLesson[] = [
  {
    id: 'L01',
    zone: 'The Shallows',
    title: 'The Emergency Hatch',
    clinical_concept: 'Mammalian Dive Reflex (MDR)',
    source_material: 'Ochsner Health [2]; NCBI [1]',
    ocean_metaphor:
      "Just as diving mammals automatically slow their hearts when submerged to conserve oxygen, you can 'hack' your biology. Cold water on the eyes/nose triggers the Vagus Nerve to instantly lower heart rate, acting as a mechanical brake for panic.",
    common_resistance:
      '"Splashing water on my face is too simple. My panic is complex, so the solution must be complex."',
    socratic_goal:
      'To demonstrate that anxiety is physiological before it is psychological. By changing the physiology (heart rate) mechanically, we prove the mind can be regulated via the body.',
    safety_notes:
      "Avoid extreme cold shock if you have heart conditions or Raynaud's syndrome. Use a cool damp cloth instead of immersion.",
    suggested_reading: 'Stephen Porges: The Polyvagal Theory',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9780393707007',
  },
  {
    id: 'L02',
    zone: 'The Shallows',
    title: 'Mapping Your Waters',
    clinical_concept: 'Polyvagal Hierarchy (Neuroception)',
    source_material: 'Deb Dana [26]; Stephen Porges [2]',
    ocean_metaphor:
      'The Buoy (Ventral/Safe), The Current (Sympathetic/Fight), and The Sinking (Dorsal/Freeze). You must know where you are in the water before you can swim.',
    common_resistance: '"I\'m overreacting, I should just calm down."',
    socratic_goal:
      "To validate that your body reacts to 'threat' (Neuroception) faster than your mind can think. 'Story follows State.'",
    suggested_reading: 'Deb Dana: Anchored',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9781683647065',
  },
  {
    id: 'L03',
    zone: 'The Shallows',
    title: 'Checking the Gauges',
    clinical_concept: 'Respiratory Regulation vs. Air Hunger',
    source_material: 'Psychology Today ; Othership [27]',
    ocean_metaphor:
      'Panic makes us feel like we are running out of air, but usually, we are hyperventilating (too much oxygen). Slow the exhale to conserve the tank.',
    common_resistance: '"Deep breathing makes me panic more/feels like I\'m suffocating."',
    socratic_goal:
      "To differentiate between 'calming breath' (long exhale) and 'panic breath' (gasping), addressing the 'Air Hunger' illusion.",
    suggested_reading: 'James Nestor: Breath',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9780735213616',
  },
  {
    id: 'L04',
    zone: 'The Shallows',
    title: "The Dead Man's Float",
    clinical_concept: 'Somatic Release & Tension',
    source_material: 'Khiron Clinics ; Leading Edge [28]',
    ocean_metaphor:
      "Fighting the water exhausts you. Trusting the buoyancy of the water lets you rest. The 'Dead Man's Float' is a survival position, not a giving-up position.",
    common_resistance: '"If I relax, I\'ll lose control/drown."',
    socratic_goal:
      "To experience the physical difference between 'bracing' against life and 'resting' in it.",
    suggested_reading: 'Bessel van der Kolk: The Body Keeps the Score',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9780143127741',
  },
  {
    id: 'L05',
    zone: 'The Shallows',
    title: 'Glimmers in the Reef',
    clinical_concept: 'Ventral Vagal Anchoring (Glimmers)',
    source_material: 'Deb Dana ; Rhythm of Regulation [29]',
    ocean_metaphor:
      "Finding shiny shells in the sand. 'Triggers' pull us into danger; 'Glimmers' are tiny cues of safety (a color, a sound, a texture) that anchor us in the shallows.",
    common_resistance: '"Looking for good things is toxic positivity."',
    socratic_goal:
      "To reframe 'glimmers' not as ignoring the bad, but as biologically necessary cues to keep the nervous system regulated.",
    suggested_reading: 'Deb Dana: Polyvagal Card Deck',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9781324019763',
  },
  {
    id: 'L06',
    zone: 'The Twilight Zone',
    title: 'Refraction Errors',
    clinical_concept: 'Cognitive Distortions (CBT)',
    source_material: 'Skyland Trail [30]; Scielo',
    ocean_metaphor:
      'Underwater Refraction. Objects underwater look 33% larger and closer than they really are. Anxiety does the same to threats—magnifying and drawing them closer.',
    common_resistance: '"My problems are real, I\'m not imagining them."',
    socratic_goal:
      "To validate the threat is real, but challenge the *perception* of its size and immediacy due to the 'water' (anxiety).",
    suggested_reading: 'David Burns: Feeling Good',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9780380731763',
  },
  {
    id: 'L07',
    zone: 'The Twilight Zone',
    title: 'The Rip Current',
    clinical_concept: 'Cognitive Defusion (ACT)',
    source_material: 'Contextual Science ',
    ocean_metaphor:
      'If you fight the rip current (anxiety/panic loop), you drown. Swim parallel (accept the feeling, change the action) to survive.',
    common_resistance: '"I just want the anxiety to stop right now."',
    socratic_goal:
      'To show that the struggle *against* anxiety is often more dangerous than the anxiety itself. Control is the problem.',
    suggested_reading: 'Steven Hayes: Get Out of Your Mind and Into Your Life',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9781572244252',
  },
  {
    id: 'L08',
    zone: 'The Twilight Zone',
    title: 'Monsters on the Boat',
    clinical_concept: 'Acceptance & Willingness (ACT)',
    source_material: 'Sonia Jaeger [31]; Psychwire [32]',
    ocean_metaphor:
      "You are the Captain. The monsters (intrusive thoughts) scream from the lower deck. You can't throw them overboard, but you don't have to let them steer.",
    common_resistance: '"I can\'t function with these thoughts screaming at me."',
    socratic_goal:
      "To practice 'willingness'—sailing *with* the monsters rather than rotting in the harbor to avoid them.",
    suggested_reading: 'Russ Harris: The Happiness Trap',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9781645471165',
  },
  {
    id: 'L09',
    zone: 'The Twilight Zone',
    title: 'The Beach Ball',
    clinical_concept: 'Emotional Suppression',
    source_material: 'Aspire Counseling [33]; Contextual Science [34]',
    ocean_metaphor:
      'Trying to hold a beach ball (emotions) underwater takes all your energy. Eventually, it pops up and hits you in the face. Let it float next to you.',
    common_resistance: '"If I let the emotion up, it will overwhelm me/I will never stop crying."',
    socratic_goal:
      "To demonstrate that suppression requires more effort than feeling. The ball floats gently if you don't fight it.",
    suggested_reading: 'Susan David: Emotional Agility',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9781592409495',
  },
  {
    id: 'L10',
    zone: 'The Twilight Zone',
    title: 'The Ocean Floor',
    clinical_concept: 'Self-as-Context (Observer Self)',
    source_material: 'Providence [35]; Art Therapy Spot [36]',
    ocean_metaphor:
      'You are the Ocean, not the Waves. The surface is stormy (emotions), but the deep water (Observer Self) remains calm and unchanged.',
    common_resistance: '"I feel like I *am* the storm. I can\'t find the calm."',
    socratic_goal:
      'To access the part of the self that can watch the pain without *being* the pain. Disidentifying from the symptom.',
    suggested_reading: 'Eckhart Tolle: The Power of Now',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9781577314806',
  },
  {
    id: 'L11',
    zone: 'The Twilight Zone',
    title: 'Hooked on the Line',
    clinical_concept: 'Fusion vs. Defusion',
    source_material: 'Contextual Science [34]; Hayes [37]',
    ocean_metaphor:
      'Thoughts are like shiny lures. You are the fish. You can look at the lure without biting (getting hooked/fused). Biting drags you to the surface.',
    common_resistance: '"But the thought feels so true."',
    socratic_goal:
      "To create a gap between 'having a thought' and 'buying the thought'. Thoughts are events, not facts.",
    suggested_reading: 'Russ Harris: ACT Made Simple',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9781684033010',
  },
  {
    id: 'L12',
    zone: 'The Twilight Zone',
    title: 'Dropping Anchor',
    clinical_concept: 'Grounding in Emotional Storms',
    source_material: 'Psychwire [32]; Providence [35]',
    ocean_metaphor:
      'When the storm is too heavy to sail, drop anchor. Connect with the body (hull) and the earth (seabed) to ride it out.',
    common_resistance: '"I don\'t have time to stop/I need to fix this now."',
    socratic_goal:
      'To teach a rapid stabilization technique (ACE: Acknowledge, Connect, Engage) for emotional flooding.',
    suggested_reading: 'Russ Harris: The Reality Slap',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9781472146366',
  },
  {
    id: 'L13',
    zone: 'The Twilight Zone',
    title: 'Sonar Pings',
    clinical_concept: 'Labeling Affect (Name it to Tame it)',
    source_material: 'Trauma Therapist Institute; Haven',
    ocean_metaphor:
      "Using sonar to name the shape in the dark. Is it a shark (danger) or a dolphin (play)? Labeling 'Fear' reduces its size.",
    common_resistance: '"Naming it makes it real/scarier."',
    socratic_goal:
      "To reduce limbic arousal by engaging the prefrontal cortex through labeling. 'To name is to contain.'",
    suggested_reading: 'Dan Siegel: Mindsight',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9780553386394',
  },
  {
    id: 'L14',
    zone: 'The Twilight Zone',
    title: 'The Fog',
    clinical_concept: 'Nitrogen Narcosis (Confusion/Rumination)',
    source_material: 'Scuba Tech; Psychwire [32]',
    ocean_metaphor:
      "Nitrogen Narcosis creates a 'fog' where you lose direction. Rumination is paddling in circles in the fog. Trust your instruments (Values), not your feelings.",
    common_resistance: '"I need to think my way out of this."',
    socratic_goal: 'To practice moving forward despite lack of clarity. Tolerating ambiguity.',
    suggested_reading: 'Pema Chödrön: When Things Fall Apart',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9781611803433',
  },
  {
    id: 'L15',
    zone: 'The Twilight Zone',
    title: 'Schools of Thought',
    clinical_concept: 'Automatic Negative Thoughts (ANTs)',
    source_material: 'Skyland Trail [30]',
    ocean_metaphor:
      "Thoughts move in schools. One negative thought usually brings a thousand friends. Notice the 'school' swarming without trying to catch every fish.",
    common_resistance: '"I have to analyze why I\'m thinking this."',
    socratic_goal:
      "To recognize the *pattern* of thinking rather than the *content* of individual thoughts. 'Oh, here is the Not-Good-Enough school again.'",
    suggested_reading: 'Daniel Goleman: Emotional Intelligence',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9781526633620',
  },
  {
    id: 'L16',
    zone: 'The Midnight Zone',
    title: 'Crush Depth',
    clinical_concept: 'Shame & Worthiness',
    source_material: 'Brene Brown ; UTEP',
    ocean_metaphor:
      "Shame is hydrostatic pressure. It feels like it's inside you, but it's the weight of the water (society/judgment) around you. You are not broken; you are at crush depth.",
    common_resistance: '"I really am just broken/defective. It\'s not the pressure."',
    socratic_goal: 'To externalize shame as an environmental force rather than an internal defect.',
    suggested_reading: 'Brené Brown: I Thought It Was Just Me',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9781592403356',
  },
  {
    id: 'L17',
    zone: 'The Midnight Zone',
    title: 'The Hermit Crab',
    clinical_concept: 'Shame Shield: Moving Away',
    source_material: 'Laura Golding [38]; Wild Tree Wellness [39]',
    ocean_metaphor:
      'Withdrawal. Hiding in a shell to avoid being seen. Safe, but lonely. The shell protects you but also confines you.',
    common_resistance: '"People drain me, I prefer to be alone."',
    socratic_goal:
      'To distinguish between *solitude* (restorative/choice) and *isolation* (fear-based/shame).',
    suggested_reading: 'Brené Brown: Daring Greatly',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9781592408412',
  },
  {
    id: 'L18',
    zone: 'The Midnight Zone',
    title: 'The Pufferfish',
    clinical_concept: 'Shame Shield: Moving Against',
    source_material: 'Think Better [40]; Scribd ',
    ocean_metaphor:
      'Aggression/Defensiveness. Puffing up to look big and spiky so no one gets close enough to hurt you. Using shame to fight shame.',
    common_resistance: '"I\'m just protecting myself/asserting boundaries."',
    socratic_goal:
      "To identify when 'boundaries' are actually 'armor' preventing connection. Real strength doesn't need spikes.",
    suggested_reading: 'Kristin Neff: Self-Compassion',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9780061733529',
  },
  {
    id: 'L19',
    zone: 'The Midnight Zone',
    title: 'The Schooling Fish',
    clinical_concept: 'Shame Shield: Moving Toward',
    source_material: 'Care Clinics ; Julia Counseling [41]',
    ocean_metaphor:
      "People Pleasing/Camouflage. Moving exactly like everyone else so you don't get eaten. Loss of individual color.",
    common_resistance: '"I just want to be helpful/nice. I don\'t like conflict."',
    socratic_goal:
      "To explore the cost of blending in: the loss of the authentic self. 'Fitting in is the opposite of Belonging.'",
    suggested_reading: 'Gabor Maté: The Myth of Normal',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9781785042737',
  },
  {
    id: 'L20',
    zone: 'The Midnight Zone',
    title: 'Bioluminescence',
    clinical_concept: 'Values & Inner Guidance',
    source_material: 'Guilford ; Polly Castor',
    ocean_metaphor:
      'In the Midnight Zone, there is no sunlight (external validation). You must generate your own light (Values) to navigate the dark.',
    common_resistance: '"I don\'t know who I am or what I want. Nothing matters."',
    socratic_goal:
      "To identify 2-3 core values that shine even when 'happiness' is absent. 'What would you stand for if no one was watching?'",
    suggested_reading: "Viktor Frankl: Man's Search for Meaning",
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9780807014271',
  },
  {
    id: 'L21',
    zone: 'The Trench',
    title: 'The Abyss Stares Back',
    clinical_concept: 'Existential Dread & The Void',
    source_material: 'Medium; Yalom ',
    ocean_metaphor:
      "The bottom of the trench. The Void. It isn't 'empty'—it's 'open'. It's the blank canvas of existence.",
    common_resistance: '"It\'s all meaningless. Why bother?"',
    socratic_goal:
      "To pivot from 'Passive Nihilism' (despair) to 'Optimistic Nihilism' (freedom). If nothing matters, you are free.",
    suggested_reading: 'Irvin Yalom: Staring at the Sun',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9780470401811',
  },
  {
    id: 'L22',
    zone: 'The Trench',
    title: 'Diving into the Fear',
    clinical_concept: 'Paradoxical Intention (Logotherapy)',
    source_material: 'Verywell Mind [42]; Google Books [43]',
    ocean_metaphor:
      'If you are afraid of sinking, try to sink. If you fear the pressure, invite it in. Swimming *toward* the fear short-circuits the panic.',
    common_resistance: '"You want me to make it WORSE? That sounds insane."',
    socratic_goal:
      'To prove that the *anticipation* of fear is worse than the fear itself. Taking control of the symptom destroys the anxiety loop.',
    suggested_reading: 'Viktor Frankl: The Will to Meaning',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9780142181263',
  },
  {
    id: 'L23',
    zone: 'The Trench',
    title: 'Amor Fati',
    clinical_concept: 'Acceptance of Fate (Stoicism/Existentialism)',
    source_material: 'The Stoic App [44]; Reddit [15]',
    ocean_metaphor:
      'Loving the Ocean. Not just the sunny surface, but the storms, the pressure, and the cold. Embracing the *entire* ecosystem of your life.',
    common_resistance: '"I refuse to accept this suffering. It\'s unfair."',
    socratic_goal:
      "To move from 'resignation' (giving up) to 'affirmation' (saying yes to life, including the pain). 'This is my life, and I will not wish it away.'",
    suggested_reading: 'Friedrich Nietzsche: The Gay Science',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9780394719856',
  },
  {
    id: 'L24',
    zone: 'The Trench',
    title: 'Tragic Optimism',
    clinical_concept: 'Meaning in Suffering',
    source_material: 'Tokinomo; Livemint',
    ocean_metaphor:
      'Deep sea life thrives in extreme conditions. You can find life (meaning) even in the trench.',
    common_resistance: '"There is no silver lining."',
    socratic_goal:
      "To find meaning *despite* the lack of a silver lining. We don't need the suffering to be 'good' to survive it.",
    suggested_reading: "Viktor Frankl: Man's Search for Meaning",
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9780807014271',
  },
  {
    id: 'L25',
    zone: 'The Trench',
    title: 'The Bends',
    clinical_concept: 'Integration & Decompression',
    source_material: 'Reddit; Quora',
    ocean_metaphor:
      "Returning to the surface too fast causes 'The Bends' (decompression sickness). You cannot rush healing. You must decompress slowly to integrate the deep lessons.",
    common_resistance: '"I\'m fixed now. I want to go back to normal immediately."',
    socratic_goal:
      'To understand that the ocean is always there; we just get better at diving. The cycle continues.',
    suggested_reading: 'Irvin Yalom: Existential Psychotherapy',
    suggested_reading_isbn_link: 'https://www.amazon.com/s?k=9780465021475',
  },
];

/**
 * Get a lesson by ID
 */
export function getLessonById(id: string): DiveLesson | undefined {
  return diveLessons.find((lesson) => lesson.id === id);
}

/**
 * Get all lessons in a specific zone
 */
export function getLessonsByZone(zone: DiveZone): DiveLesson[] {
  return diveLessons.filter((lesson) => lesson.zone === zone);
}

/**
 * Get the next lesson after a given lesson ID
 */
export function getNextLesson(currentId: string): DiveLesson | undefined {
  const currentIndex = diveLessons.findIndex((lesson) => lesson.id === currentId);
  if (currentIndex === -1 || currentIndex === diveLessons.length - 1) {
    return undefined;
  }
  return diveLessons[currentIndex + 1];
}

/**
 * Get total lesson count
 */
export function getTotalLessonCount(): number {
  return diveLessons.length;
}

/**
 * Get i18n key for zone name
 */
export function getZoneTranslationKey(zone: DiveZone): string {
  const zoneKeys: Record<DiveZone, string> = {
    'The Shallows': 'dive.zones.shallows',
    'The Twilight Zone': 'dive.zones.twilight',
    'The Midnight Zone': 'dive.zones.midnight',
    'The Trench': 'dive.zones.trench',
  };
  return zoneKeys[zone];
}

/**
 * Get i18n key for zone description
 */
export function getZoneDescriptionKey(zone: DiveZone): string {
  const descKeys: Record<DiveZone, string> = {
    'The Shallows': 'dive.zones.shallowsDesc',
    'The Twilight Zone': 'dive.zones.twilightDesc',
    'The Midnight Zone': 'dive.zones.midnightDesc',
    'The Trench': 'dive.zones.trenchDesc',
  };
  return descKeys[zone];
}

/**
 * Get i18n key for lesson title
 */
export function getLessonTitleKey(lessonId: string): string {
  return `dive.lessons.${lessonId}`;
}

/**
 * Get all unique zones in order of depth
 */
export function getZonesInOrder(): DiveZone[] {
  return ['The Shallows', 'The Twilight Zone', 'The Midnight Zone', 'The Trench'];
}
