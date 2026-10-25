export const MAX_MISTAKES = 6
export const HINT_UNLOCK_MISTAKES = Math.ceil(MAX_MISTAKES / 2)
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export const DIFFICULTIES = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export const CATEGORIES = {
  'Science and Discovery': {
    topic: 'This word belongs to science and the study of how the world works.',
    words: {
      easy: [
        ['GRAVITY', 'This force keeps planets in orbit and objects on the ground.'],
        ['FOSSIL', 'This preserved trace or remains can tell us about ancient life.'],
        ['CATALYST', 'This substance speeds a chemical reaction without being used up.'],
        ['MUTATION', 'This is a change in the genetic code of an organism.'],
        ['ISOTOPE', 'This form of an element has a different number of neutrons.'],
        ['MINERAL', 'This naturally occurring solid has a distinct chemical makeup.'],
        ['FRICTION', 'This force resists motion when two surfaces rub together.'],
      ],
      medium: [
        ['ECOSYSTEM', 'This community includes living things and their surroundings.'],
        ['SYMBIOSIS', 'This close relationship links organisms of different species.'],
        ['REFRACTION', 'This bending of light occurs as it passes between materials.'],
        ['QUANTUM', 'This smallest discrete amount appears in physics.'],
        ['ENZYME', 'This biological molecule helps reactions happen faster.'],
        ['MOLECULE', 'This group of bonded atoms is the smallest unit of a compound.'],
        ['CONDUCTOR', 'This material allows heat or electric charge to flow easily.'],
      ],
      hard: [
        ['PHOTOSYNTHESIS', 'This process lets plants use light to make sugars.'],
        ['METAMORPHOSIS', 'This dramatic change transforms an animal as it develops.'],
        ['BIODIVERSITY', 'This describes the variety of life in a place or on Earth.'],
        ['EQUILIBRIUM', 'This balanced state has no net change in opposing processes.'],
        ['CHROMATOGRAPHY', 'This lab method separates substances as they travel through a medium.'],
        ['THERMODYNAMICS', 'This field studies heat, work, and energy transfers.'],
      ],
    },
  },
  'Technology and Computing': {
    topic: 'This word is connected to digital tools, computers, or communication.',
    words: {
      easy: [
        ['BROWSER', 'This program opens and displays pages on the internet.'],
        ['SOFTWARE', 'This is the set of programs that tells a computer what to do.'],
        ['NETWORK', 'This connected group of devices can share data.'],
        ['PIXEL', 'This tiny picture element is a basic unit of a digital image.'],
        ['SENSOR', 'This component detects changes such as light, motion, or heat.'],
        ['CIPHER', 'This method disguises a message so it is not easily read.'],
        ['MODEM', 'This device connects a home network to an internet service.'],
      ],
      medium: [
        ['ENCRYPTION', 'This process scrambles information so only authorised readers can use it.'],
        ['ALGORITHM', 'This step-by-step procedure solves a problem or performs a task.'],
        ['COMPILER', 'This program translates source code into another form.'],
        ['BANDWIDTH', 'This measures how much data a connection can carry over time.'],
        ['PROTOCOL', 'This shared set of rules lets devices exchange information.'],
        ['DATABASE', 'This organised collection makes information easier to store and search.'],
        ['FIRMWARE', 'This low-level software is stored inside an electronic device.'],
      ],
      hard: [
        ['CRYPTOGRAPHY', 'This discipline protects messages and information using mathematical methods.'],
        ['MICROPROCESSOR', 'This compact chip carries out a computer’s instructions.'],
        ['VIRTUALIZATION', 'This technique lets one physical machine run several simulated systems.'],
        ['ASYNCHRONOUS', 'This describes operations that can proceed without waiting for one another.'],
        ['SEMICONDUCTOR', 'This material conducts electricity better than an insulator but less than a metal.'],
        ['AUTHENTICATION', 'This process checks that a user or device is who it claims to be.'],
      ],
    },
  },
  'Nature and Wildlife': {
    topic: 'This word relates to nature and wildlife.',
    words: {
      easy: [
        ['LICHEN', 'This partnership of fungus and algae often grows on stone or bark.'],
        ['OTTER', 'This playful mammal swims well and uses dense fur for warmth.'],
        ['POLLEN', 'These tiny grains carry the male reproductive cells of seed plants.'],
        ['HERON', 'This long-legged wading bird often waits motionless near water.'],
        ['CORAL', 'This tiny marine animal builds reefs from a hard skeleton.'],
        ['BADGER', 'This powerful burrowing mammal has a distinctive striped face.'],
        ['MOSS', 'This small, soft plant grows in damp places without true roots.'],
      ],
      medium: [
        ['CAMOUFLAGE', 'This disguise helps an organism blend into its surroundings.'],
        ['POLLINATION', 'This transfer of plant grains helps flowers produce seeds.'],
        ['MANGROVE', 'This salt-tolerant tree grows along tropical shores.'],
        ['PREDATOR', 'This animal hunts other animals for food.'],
        ['WETLANDS', 'These waterlogged habitats support many specialised species.'],
        ['MIGRATION', 'This seasonal journey takes animals between regions.'],
        ['CARNIVORE', 'This animal gets most of its energy by eating other animals.'],
      ],
      hard: [
        ['BIOLUMINESCENCE', 'This natural process allows living organisms to produce light.'],
        ['HIBERNATION', 'This seasonal state helps some animals conserve energy through winter.'],
        ['POLLINATOR', 'This animal carries plant grains between flowers.'],
        ['DEFORESTATION', 'This large-scale clearing removes trees from a region.'],
        ['HABITAT', 'This natural home provides an organism with food and shelter.'],
        ['NOCTURNAL', 'This describes an animal that is mainly active after dark.'],
      ],
    },
  },
  'Geography and Civilisations': {
    topic: 'This word relates to places, maps, or human societies through history.',
    words: {
      easy: [
        ['PLATEAU', 'This broad, elevated area has a mostly level surface.'],
        ['DELTA', 'This landform forms where a river deposits material at its mouth.'],
        ['CANYON', 'This deep valley is often carved by a river over time.'],
        ['EMPIRE', 'This large political unit rules over many peoples or territories.'],
        ['OASIS', 'This fertile spot provides water in an otherwise dry region.'],
        ['ISTHMUS', 'This narrow strip of land connects two larger land areas.'],
        ['TEMPLE', 'This building is set aside for religious worship or ceremony.'],
      ],
      medium: [
        ['PENINSULA', 'This landform is surrounded by water on most, but not all, sides.'],
        ['LONGITUDE', 'These map lines measure position east or west of a reference meridian.'],
        ['AQUEDUCT', 'This engineered channel carries water over a distance.'],
        ['DYNASTY', 'This succession of rulers often comes from one family.'],
        ['LATITUDE', 'These map lines measure position north or south of the equator.'],
        ['CARTOGRAPHY', 'This practice involves making and studying maps.'],
        ['ARCHIPELAGO', 'This is a group or chain of islands.'],
      ],
      hard: [
        ['ARCHAEOLOGY', 'This field studies past societies through objects and remains.'],
        ['CIVILISATION', 'This organised society has developed complex institutions and culture.'],
        ['TOPOGRAPHY', 'This describes the shape and features of a region’s surface.'],
        ['METROPOLIS', 'This is a large, important city and its surrounding urban area.'],
        ['STRATIGRAPHY', 'This study of layered rock helps reveal the sequence of past events.'],
        ['ANTHROPOLOGY', 'This broad field studies humans, societies, and cultures.'],
      ],
    },
  },
  'Arts and Literature': {
    topic: 'This word comes from visual art, music, performance, or writing.',
    words: {
      easy: [
        ['SONNET', 'This fourteen-line poem often follows a set rhyme pattern.'],
        ['SATIRE', 'This kind of work uses humour to criticise human habits or institutions.'],
        ['METAPHOR', 'This figure of speech describes one thing as if it were another.'],
        ['STANZA', 'This grouped section of lines forms part of a poem.'],
        ['MURAL', 'This large artwork is painted directly onto a wall.'],
        ['RHYTHM', 'This pattern of beats gives music or poetry a sense of movement.'],
        ['LYRICS', 'These words are written to be sung with music.'],
      ],
      medium: [
        ['ALLEGORY', 'This story uses characters and events to represent broader ideas.'],
        ['PROTAGONIST', 'This is the central character whose actions drive a story.'],
        ['TYPOGRAPHY', 'This is the art of arranging letters and type on a page.'],
        ['RENAISSANCE', 'This European cultural movement renewed interest in classical learning and art.'],
        ['SYMPHONY', 'This extended musical work is usually written for an orchestra.'],
        ['CALLIGRAPHY', 'This decorative practice turns handwriting into a visual art.'],
        ['PARADOX', 'This statement seems self-contradictory but may reveal a truth.'],
      ],
      hard: [
        ['ONOMATOPOEIA', 'This word imitates a sound, such as a sharp knock or hiss.'],
        ['JUXTAPOSITION', 'This places contrasting ideas or images side by side for effect.'],
        ['IMPRESSIONISM', 'This art movement captures changing light and fleeting visual effects.'],
        ['ORCHESTRATION', 'This is the arrangement of music for different instruments.'],
        ['PALIMPSEST', 'This reused manuscript still shows traces of earlier writing.'],
        ['CHIAROSCURO', 'This artistic technique uses strong contrasts between light and shadow.'],
      ],
    },
  },
  'Space and Astronomy': {
    topic: 'This word describes objects or events beyond Earth’s atmosphere.',
    words: {
      easy: [
        ['ORBIT', 'This curved path carries one object around another in space.'],
        ['COMET', 'This icy space object can grow a bright tail near a star.'],
        ['LUNAR', 'This adjective describes something related to Earth’s natural satellite.'],
        ['NEBULA', 'This vast cloud of gas and dust can be a birthplace for stars.'],
        ['ECLIPSE', 'This event happens when one celestial body blocks another from view.'],
        ['METEOR', 'This streak of light appears when space debris burns in an atmosphere.'],
        ['CRATER', 'This bowl-shaped hollow can form when an object strikes a surface.'],
      ],
      medium: [
        ['ASTEROID', 'This rocky object travels around the Sun and is smaller than a planet.'],
        ['GALAXY', 'This enormous system contains stars, gas, dust, and dark matter.'],
        ['PULSAR', 'This rapidly spinning stellar remnant sends out regular beams of radiation.'],
        ['TELESCOPE', 'This instrument gathers light to help us observe distant objects.'],
        ['SUPERNOVA', 'This powerful stellar explosion can briefly outshine an entire galaxy.'],
        ['REDSHIFT', 'This shift toward longer light wavelengths can show that an object is receding.'],
        ['EXOPLANET', 'This planet orbits a star beyond our own solar system.'],
      ],
      hard: [
        ['CONSTELLATION', 'This recognised pattern of stars helps people map the night sky.'],
        ['INTERSTELLAR', 'This describes the space or matter found between stars.'],
        ['ASTROPHYSICS', 'This branch of science applies physical laws to celestial objects.'],
        ['SPECTROSCOPY', 'This technique studies how matter interacts with different wavelengths of light.'],
        ['HELIOSPHERE', 'This vast bubble marks the region influenced by the solar wind.'],
        ['COSMOLOGY', 'This field studies the origin, structure, and evolution of the universe.'],
      ],
    },
  },
  'Food and Culinary Arts': {
    topic: 'This word relates to ingredients, cooking, or the culture of food.',
    words: {
      easy: [
        ['SAFFRON', 'This prized spice comes from the delicate stigmas of a crocus flower.'],
        ['MISO', 'This savoury Japanese paste is made from fermented soybeans.'],
        ['CUMIN', 'This warm, earthy spice is common in many cuisines.'],
        ['BRIOCHE', 'This rich, soft bread is enriched with eggs and butter.'],
        ['TAHINI', 'This smooth paste is made from ground sesame seeds.'],
        ['RISOTTO', 'This creamy northern Italian dish is made by slowly cooking rice.'],
        ['CACAO', 'These seeds are the source of chocolate and cocoa products.'],
      ],
      medium: [
        ['FERMENTATION', 'This process uses microbes to transform food and develop flavour.'],
        ['EMULSION', 'This mixture combines liquids that would normally separate, such as oil and water.'],
        ['REDUCTION', 'This sauce-making method simmers liquid until it becomes more concentrated.'],
        ['MARINADE', 'This seasoned liquid adds flavour to food before it is cooked.'],
        ['UMAMI', 'This savoury taste is often described as the fifth basic flavour.'],
        ['GANACHE', 'This smooth mixture of chocolate and cream is used in desserts.'],
        ['FOCACCIA', 'This Italian flatbread is often topped with olive oil and herbs.'],
      ],
      hard: [
        ['CARAMELISATION', 'This browning process develops sweetness when sugar is heated.'],
        ['CHARCUTERIE', 'This culinary tradition prepares and serves cured or preserved meats.'],
        ['GASTRONOMY', 'This study explores food, cooking, and the culture surrounding meals.'],
        ['VINAIGRETTE', 'This dressing usually combines oil with an acidic ingredient.'],
        ['POMEGRANATE', 'This fruit contains many jewel-like seeds inside a leathery skin.'],
        ['CONSOMME', 'This clarified broth is prized for its clear appearance.'],
      ],
    },
  },
  'Sports and Games': {
    topic: 'This word is connected to a sport, competition, or pastime.',
    words: {
      easy: [
        ['RACKET', 'This strung piece of equipment is used to strike a ball in several sports.'],
        ['JIGSAW', 'This picture puzzle is assembled from many interlocking pieces.'],
        ['POKER', 'This card game combines betting with ranked hands.'],
        ['SNOOKER', 'This cue sport is played on a large table with coloured balls.'],
        ['SPRINT', 'This short race is run at top speed.'],
        ['TACTICS', 'These immediate plans help a team respond during a contest.'],
        ['GOALIE', 'This player guards the net in sports such as hockey.'],
      ],
      medium: [
        ['BACKGAMMON', 'This board game combines dice rolls with strategic movement of pieces.'],
        ['CHECKMATE', 'This move ends a chess game when the king cannot escape capture.'],
        ['TOURNAMENT', 'This organised series of matches determines a champion.'],
        ['STRATEGY', 'This long-term plan guides decisions in a contest or game.'],
        ['DECATHLON', 'This track-and-field competition includes ten different events.'],
        ['HANDBALL', 'This fast-paced team sport uses passing and throwing to score.'],
        ['BILLIARDS', 'This family of cue sports is played on a cloth-covered table.'],
      ],
      hard: [
        ['ORIENTEERING', 'This sport challenges participants to navigate between checkpoints using a map.'],
        ['BADMINTON', 'This racket sport sends a feathered projectile over a high net.'],
        ['PARKOUR', 'This discipline moves through obstacles using running, climbing, and vaulting.'],
        ['TRIATHLON', 'This endurance event combines swimming, cycling, and running.'],
        ['PENTATHLON', 'This multi-event contest includes five distinct athletic disciplines.'],
        ['CROQUET', 'This lawn game uses mallets to send balls through small hoops.'],
      ],
    },
  },
  'Psychology and Human Behaviour': {
    topic: 'This word describes the mind, feelings, or patterns of human behaviour.',
    words: {
      easy: [
        ['EMPATHY', 'This ability helps someone understand another person’s feelings.'],
        ['MEMORY', 'This mental ability lets us retain and recall information.'],
        ['HABIT', 'This repeated behaviour can become automatic over time.'],
        ['INSTINCT', 'This inborn tendency can guide behaviour without being taught.'],
        ['FOCUS', 'This is the act of directing attention toward one thing.'],
        ['BIAS', 'This tendency can unfairly influence a judgement or decision.'],
        ['ESTEEM', 'This word describes a person’s sense of self-worth or regard.'],
      ],
      medium: [
        ['COGNITION', 'This broad term covers processes such as thinking, learning, and remembering.'],
        ['PERCEPTION', 'This is the way the mind organises information from the senses.'],
        ['RESILIENCE', 'This capacity helps someone recover after difficulty or stress.'],
        ['MOTIVATION', 'This inner drive encourages a person to take action.'],
        ['NOSTALGIA', 'This warm or bittersweet feeling looks back on the past.'],
        ['INTUITION', 'This kind of understanding feels immediate rather than carefully reasoned.'],
        ['ATTACHMENT', 'This lasting emotional bond often forms between people.'],
      ],
      hard: [
        ['CONFIRMATION', 'This reasoning bias favours information that supports existing beliefs.'],
        ['NEUROPLASTICITY', 'This ability lets the brain change its connections through experience.'],
        ['METACOGNITION', 'This is the process of thinking about one’s own thinking.'],
        ['CONSCIENTIOUS', 'This describes someone who tends to be careful, organised, and dependable.'],
        ['DISSOCIATION', 'This experience can create a sense of disconnection from thoughts or surroundings.'],
        ['INTROSPECTION', 'This examination turns a person’s attention toward their own thoughts.'],
      ],
    },
  },
  'General Knowledge': {
    topic: 'This word is a useful concept from everyday life, society, or culture.',
    words: {
      easy: [
        ['COMPASS', 'This instrument uses a magnetic needle to show direction.'],
        ['ARCHIVE', 'This collection preserves records and historical documents.'],
        ['CURRENCY', 'This system of money is used for trade within a region.'],
        ['FOLKLORE', 'These traditional stories and customs are passed down through generations.'],
        ['CENSUS', 'This official count gathers information about a population.'],
        ['LANDMARK', 'This recognisable place can help people find their way.'],
        ['MOSAIC', 'This image is made from many small pieces of coloured material.'],
      ],
      medium: [
        ['LEGISLATURE', 'This group has the authority to create laws.'],
        ['DIPLOMACY', 'This practice manages relations between countries through discussion.'],
        ['LOGISTICS', 'This planning coordinates the movement of goods, people, or supplies.'],
        ['HERITAGE', 'This shared history and culture is passed from earlier generations.'],
        ['PHILANTHROPY', 'This practice supports the public good through generous giving.'],
        ['REFERENDUM', 'This public vote lets citizens decide a specific political question.'],
        ['MONUMENT', 'This structure commemorates a person or important event.'],
      ],
      hard: [
        ['BUREAUCRACY', 'This system organises public or business work through offices and procedures.'],
        ['JURISPRUDENCE', 'This is the philosophy and theory of law.'],
        ['INFRASTRUCTURE', 'These essential systems support a community, such as transport and utilities.'],
        ['ENTREPRENEUR', 'This person organises a business venture and accepts its risks.'],
        ['MERCANTILE', 'This describes activities connected with trade or the buying and selling of goods.'],
        ['ARCHITECTURE', 'This art and practice shapes the design of buildings and spaces.'],
      ],
    },
  },
}

export function getWords(category, difficulty) {
  const categoryData = CATEGORIES[category]
  if (!categoryData || !DIFFICULTIES[difficulty]) return []
  return categoryData.words[difficulty].map(([word, hint]) => ({
    word,
    category,
    topic: categoryData.topic,
    hint,
    difficulty,
  }))
}

export function getRandomWord(category, difficulty, previousWord = null) {
  const words = getWords(category, difficulty)
  if (words.length === 0) {
    throw new Error(`No words are available for ${category} at ${difficulty} difficulty.`)
  }
  const newOptions = words.filter(({ word }) => word !== previousWord)
  const choices = newOptions.length > 0 ? newOptions : words
  return choices[Math.floor(Math.random() * choices.length)]
}
