const DB_NAME = 'edureach';
const DB_VERSION = 2;
let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains('profile')) {
        database.createObjectStore('profile', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('courses')) {
        const store = database.createObjectStore('courses', { keyPath: 'id' });
        store.createIndex('subject', 'subject', { unique: false });
      }
      if (!database.objectStoreNames.contains('lessons')) {
        const store = database.createObjectStore('lessons', { keyPath: 'id' });
        store.createIndex('courseId', 'courseId', { unique: false });
      }
      if (!database.objectStoreNames.contains('downloadedLessons')) {
        const store = database.createObjectStore('downloadedLessons', { keyPath: 'id' });
        store.createIndex('courseId', 'courseId', { unique: false });
      }
      if (!database.objectStoreNames.contains('quizzes')) {
        database.createObjectStore('quizzes', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('quizResults')) {
        const store = database.createObjectStore('quizResults', { keyPath: 'id' });
        store.createIndex('quizId', 'quizId', { unique: false });
      }
      if (!database.objectStoreNames.contains('assignments')) {
        database.createObjectStore('assignments', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('assignmentProgress')) {
        const store = database.createObjectStore('assignmentProgress', { keyPath: 'id' });
        store.createIndex('assignmentId', 'assignmentId', { unique: false });
      }
      if (!database.objectStoreNames.contains('lessonProgress')) {
        const store = database.createObjectStore('lessonProgress', { keyPath: 'id' });
        store.createIndex('lessonId', 'lessonId', { unique: false });
        store.createIndex('courseId', 'courseId', { unique: false });
      }
      if (!database.objectStoreNames.contains('syncQueue')) {
        const store = database.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' });
      }
      if (!database.objectStoreNames.contains('students')) {
        const store = database.createObjectStore('students', { keyPath: 'id' });
        store.createIndex('email', 'email', { unique: true });
        store.createIndex('studentId', 'studentId', { unique: true });
      }
      if (!database.objectStoreNames.contains('session')) {
        database.createObjectStore('session', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('downloadedQuizzes')) {
        const store = database.createObjectStore('downloadedQuizzes', { keyPath: 'id' });
        store.createIndex('courseId', 'courseId', { unique: false });
        store.createIndex('lessonId', 'lessonId', { unique: false });
      }
    };
  });
}

function getStore(storeName, mode = 'readonly') {
  if (!db) throw new Error('Database not initialized');
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

function put(storeName, data) {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const req = store.put(data);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function get(storeName, key) {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAll(storeName) {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function deleteItem(storeName, key) {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function clear(storeName) {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function count(storeName) {
  return new Promise((resolve, reject) => {
    const store = getStore(storeName);
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function initDB() {
  await openDB();
  const hasCourses = await getAll('courses');
  if (hasCourses.length === 0) {
    await seedData();
  }
  await seedExpandedContent();
}

async function seedData() {
  const courses = [
    {
      id: 'math-101',
      subject: 'Mathematics',
      title: 'Mathematics Fundamentals',
      description: 'Build a strong foundation in mathematics with lessons on numbers, algebra, geometry, and more.',
      icon: '📐',
      color: '#2563eb',
      lessons: 6
    },
    {
      id: 'sci-101',
      subject: 'Science',
      title: 'Science Explorers',
      description: 'Discover the wonders of science through lessons on matter, energy, and the natural world.',
      icon: '🔬',
      color: '#059669',
      lessons: 6
    },
    {
      id: 'eng-101',
      subject: 'English',
      title: 'English Language Basics',
      description: 'Improve your reading, writing, and grammar skills with structured English lessons.',
      icon: '📚',
      color: '#d97706',
      lessons: 6
    }
  ];

  for (const course of courses) {
    await put('courses', course);
  }

  const lessons = [
    {
      id: 'math-101-l1',
      courseId: 'math-101',
      title: 'Numbers and Place Value',
      objectives: ['Understand place value', 'Read and write large numbers', 'Compare numbers'],
      content: 'Place value is the value of each digit in a number. For example, in 345, the 3 represents 300, the 4 represents 40, and the 5 represents 5. To read large numbers, group digits in threes from the right: 1,234,567 is read as one million, two hundred thirty-four thousand, five hundred sixty-seven.',
      examples: '345 = 300 + 40 + 5',
      keyPoints: ['Each digit has a place value', 'Group digits in threes', 'Use commas for thousands']
    },
    {
      id: 'math-101-l2',
      courseId: 'math-101',
      title: 'Addition and Subtraction',
      objectives: ['Add numbers accurately', 'Subtract numbers accurately', 'Solve word problems'],
      content: 'Addition combines two or more numbers to find the total. Subtraction finds the difference between two numbers. Line up numbers by their place values and work from right to left.',
      examples: '456 + 123 = 579 | 456 - 123 = 333',
      keyPoints: ['Line up digits', 'Carry over when needed', 'Check your answer']
    },
    {
      id: 'math-101-l3',
      courseId: 'math-101',
      title: 'Multiplication Basics',
      objectives: ['Understand multiplication', 'Multiply single-digit numbers', 'Use multiplication tables'],
      content: 'Multiplication is repeated addition. 4 × 3 means 4 added 3 times: 4 + 4 + 4 = 12. Memorizing multiplication tables helps solve problems quickly.',
      examples: '4 × 3 = 12 | 7 × 8 = 56',
      keyPoints: ['Multiplication is repeated addition', 'Times tables are useful', 'Order does not matter']
    },
    {
      id: 'math-101-l4',
      courseId: 'math-101',
      title: 'Division Fundamentals',
      objectives: ['Understand division', 'Divide numbers', 'Interpret remainders'],
      content: 'Division splits a number into equal parts. 12 ÷ 3 = 4 means 12 is split into 3 equal groups of 4. If numbers do not divide evenly, the leftover is the remainder.',
      examples: '12 ÷ 3 = 4 | 15 ÷ 4 = 3 R 3',
      keyPoints: ['Division is sharing', 'Remainders are leftovers', 'Check by multiplying']
    },
    {
      id: 'math-101-l5',
      courseId: 'math-101',
      title: 'Fractions and Decimals',
      objectives: ['Understand fractions', 'Convert fractions to decimals', 'Compare fractions'],
      content: 'A fraction represents part of a whole. 1/2 means one part out of two equal parts. To convert a fraction to a decimal, divide the top number by the bottom number.',
      examples: '1/2 = 0.5 | 3/4 = 0.75',
      keyPoints: ['Numerator / Denominator', 'Equivalent fractions', 'Decimal conversion']
    },
    {
      id: 'math-101-l6',
      courseId: 'math-101',
      title: 'Introduction to Geometry',
      objectives: ['Identify shapes', 'Understand angles', 'Calculate perimeter'],
      content: 'Geometry studies shapes and space. Common shapes include circles, squares, rectangles, and triangles. The perimeter is the distance around a shape.',
      examples: 'Square perimeter = 4 × side | Triangle angles add to 180°',
      keyPoints: ['Shapes have properties', 'Angles measure turns', 'Perimeter is distance around']
    },
    {
      id: 'sci-101-l1',
      courseId: 'sci-101',
      title: 'What is Matter?',
      objectives: ['Define matter', 'Identify states of matter', 'Understand properties of matter'],
      content: 'Matter is anything that has mass and takes up space. The three common states are solid, liquid, and gas. Solids have a fixed shape, liquids take the shape of their container, and gases fill their container.',
      examples: 'Ice (solid) → Water (liquid) → Steam (gas)',
      keyPoints: ['Matter has mass and volume', 'Three states of matter', 'State changes happen']
    },
    {
      id: 'sci-101-l2',
      courseId: 'sci-101',
      title: 'The Water Cycle',
      objectives: ['Describe evaporation', 'Explain condensation', 'Understand precipitation'],
      content: 'The water cycle moves water through the environment. The sun heats water causing evaporation. Water vapor rises, cools, and condenses into clouds. When droplets get heavy, they fall as rain or snow.',
      examples: 'Ocean → Evaporation → Clouds → Rain → River',
      keyPoints: ['Evaporation: liquid to gas', 'Condensation: gas to liquid', 'Precipitation: rain, snow, hail']
    },
    {
      id: 'sci-101-l3',
      courseId: 'sci-101',
      title: 'Forces and Motion',
      objectives: ['Understand force', 'Learn about gravity', 'Identify friction'],
      content: 'A force is a push or pull. Gravity pulls objects toward Earth. Friction is a force that slows moving objects. Balanced forces do not change motion; unbalanced forces do.',
      examples: 'Pushing a cart = force | Friction stops a sliding book',
      keyPoints: ['Force = push or pull', 'Gravity pulls down', 'Friction opposes motion']
    },
    {
      id: 'sci-101-l4',
      courseId: 'sci-101',
      title: 'Living Things and Cells',
      objectives: ['Identify characteristics of life', 'Understand cells', 'Classify living things'],
      content: 'All living things grow, reproduce, and respond to their environment. Cells are the basic units of life. Plants and animals are made of cells. Some living things are made of just one cell.',
      examples: 'Humans have trillions of cells | Bacteria have one cell',
      keyPoints: ['Cells are basic units', 'Living things grow', 'Response to environment']
    },
    {
      id: 'sci-101-l5',
      courseId: 'sci-101',
      title: 'Plants and Photosynthesis',
      objectives: ['Describe plant parts', 'Explain photosynthesis', 'Understand plant needs'],
      content: 'Plants use sunlight, water, and carbon dioxide to make food. This process is called photosynthesis. Leaves capture sunlight. Roots absorb water. Stems transport nutrients.',
      examples: 'Sunlight + Water + CO2 → Sugar + Oxygen',
      keyPoints: ['Leaves make food', 'Roots absorb water', 'Photosynthesis uses sunlight']
    },
    {
      id: 'sci-101-l6',
      courseId: 'sci-101',
      title: 'Our Solar System',
      objectives: ['Name planets', 'Understand orbits', 'Learn about the Sun'],
      content: 'Our solar system has the Sun at its center and eight planets orbiting it. Mercury is closest to the Sun. Neptune is the farthest. The Sun provides light and heat to all planets.',
      examples: 'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune',
      keyPoints: ['Sun is the center', 'Eight planets', 'Planets orbit the Sun']
    },
    {
      id: 'eng-101-l1',
      courseId: 'eng-101',
      title: 'Parts of Speech',
      objectives: ['Identify nouns', 'Identify verbs', 'Identify adjectives'],
      content: 'Words are grouped into parts of speech. Nouns name people, places, or things. Verbs show action or state. Adjectives describe nouns. Understanding parts of speech helps you build correct sentences.',
      examples: 'Nouns: cat, school | Verbs: run, is | Adjectives: blue, tall',
      keyPoints: ['Nouns name things', 'Verbs show action', 'Adjectives describe']
    },
    {
      id: 'eng-101-l2',
      courseId: 'eng-101',
      title: 'Sentence Structure',
      objectives: ['Build simple sentences', 'Understand subjects and predicates', 'Avoid fragments'],
      content: 'A complete sentence needs a subject and a verb. The subject is who or what the sentence is about. The predicate tells what the subject does or is.',
      examples: 'The cat sleeps. | She runs fast.',
      keyPoints: ['Subject + Verb = Sentence', 'Fragments are incomplete', 'Capitalize first letter']
    },
    {
      id: 'eng-101-l3',
      courseId: 'eng-101',
      title: 'Reading Comprehension',
      objectives: ['Read actively', 'Identify main ideas', 'Draw conclusions'],
      content: 'Reading comprehension means understanding what you read. Read carefully, look for the main idea, and use clues in the text to understand meaning.',
      examples: 'Main idea: The paragraph is about healthy eating.',
      keyPoints: ['Read with purpose', 'Find the main idea', 'Use context clues']
    },
    {
      id: 'eng-101-l4',
      courseId: 'eng-101',
      title: 'Grammar and Punctuation',
      objectives: ['Use commas correctly', 'Use periods correctly', 'Understand basic punctuation'],
      content: 'Punctuation helps readers understand sentences. Use a period to end statements. Use a comma to pause or separate items in a list. Use question marks for questions.',
      examples: 'I like apples, bananas, and grapes. | Where are you?',
      keyPoints: ['Period ends sentences', 'Comma separates items', 'Question mark for questions']
    },
    {
      id: 'eng-101-l5',
      courseId: 'eng-101',
      title: 'Vocabulary Building',
      objectives: ['Learn new words', 'Use context clues', 'Practice synonyms and antonyms'],
      content: 'A strong vocabulary improves reading and writing. Learn one new word every day. Use context clues in sentences to guess meanings. Synonyms are words with similar meanings.',
      examples: 'Big = Large, Huge | Small = Tiny, Little',
      keyPoints: ['Learn daily', 'Use context clues', 'Practice synonyms']
    },
    {
      id: 'eng-101-l6',
      courseId: 'eng-101',
      title: 'Writing a Paragraph',
      objectives: ['Write topic sentences', 'Add supporting details', 'Conclude paragraphs'],
      content: 'A paragraph is a group of sentences about one idea. Start with a topic sentence. Add details and examples. End with a concluding sentence. Good paragraphs are clear and organized.',
      examples: 'Topic: Dogs are loyal pets. Detail: They wait for owners. Detail: They protect homes.',
      keyPoints: ['One idea per paragraph', 'Topic sentence first', 'Details support the topic']
    }
  ];

  for (const lesson of lessons) {
    await put('lessons', lesson);
  }

  const quizzes = [
    {
      id: 'math-101-q1',
      courseId: 'math-101',
      lessonId: 'math-101-l1',
      title: 'Numbers and Place Value Quiz',
      questions: [
        { id: 'q1', text: 'What is the value of 4 in 4,321?', options: ['4', '40', '400', '4000'], answer: '400' },
        { id: 'q2', text: 'How is 1,234 read?', options: ['One hundred twenty-four', 'One thousand two hundred thirty-four', 'Twelve thirty-four', 'One two three four'], answer: 'One thousand two hundred thirty-four' },
        { id: 'q3', text: 'Which number is greater: 567 or 576?', options: ['567', '576', 'Equal', 'Cannot tell'], answer: '576' },
        { id: 'q4', text: 'In 9,876, what place is the 8 in?', options: ['Ones', 'Tens', 'Hundreds', 'Thousands'], answer: 'Hundreds' },
        { id: 'q5', text: 'What is 200 + 300?', options: ['400', '500', '600', '300'], answer: '500' }
      ]
    },
    {
      id: 'math-101-q2',
      courseId: 'math-101',
      lessonId: 'math-101-l2',
      title: 'Addition and Subtraction Quiz',
      questions: [
        { id: 'q1', text: 'What is 456 + 123?', options: ['579', '569', '589', '599'], answer: '579' },
        { id: 'q2', text: 'What is 789 - 456?', options: ['333', '323', '343', '353'], answer: '333' },
        { id: 'q3', text: 'What is 999 + 1?', options: ['1000', '1001', '9999', '9990'], answer: '1000' },
        { id: 'q4', text: 'What is 200 - 150?', options: ['50', '40', '60', '30'], answer: '50' },
        { id: 'q5', text: 'If you have 5 apples and get 3 more, how many do you have?', options: ['7', '8', '9', '10'], answer: '8' }
      ]
    },
    {
      id: 'sci-101-q1',
      courseId: 'sci-101',
      lessonId: 'sci-101-l1',
      title: 'Matter Quiz',
      questions: [
        { id: 'q1', text: 'Which is a state of matter?', options: ['Solid', 'Energy', 'Force', 'Light'], answer: 'Solid' },
        { id: 'q2', text: 'What state is water in ice?', options: ['Solid', 'Liquid', 'Gas', 'Plasma'], answer: 'Solid' },
        { id: 'q3', text: 'Which has a fixed shape?', options: ['Solid', 'Liquid', 'Gas', 'All'], answer: 'Solid' },
        { id: 'q4', text: 'Matter takes up what?', options: ['Space', 'Time', 'Energy', 'Nothing'], answer: 'Space' },
        { id: 'q5', text: 'Which is NOT a state of matter?', options: ['Energy', 'Solid', 'Liquid', 'Gas'], answer: 'Energy' }
      ]
    },
    {
      id: 'eng-101-q1',
      courseId: 'eng-101',
      lessonId: 'eng-101-l1',
      title: 'Parts of Speech Quiz',
      questions: [
        { id: 'q1', text: 'Which word is a noun?', options: ['Dog', 'Run', 'Blue', 'Quickly'], answer: 'Dog' },
        { id: 'q2', text: 'Which word is a verb?', options: ['Jump', 'Happy', 'Table', 'Red'], answer: 'Jump' },
        { id: 'q3', text: 'Which word is an adjective?', options: ['Beautiful', 'Sing', 'Book', 'Yesterday'], answer: 'Beautiful' },
        { id: 'q4', text: '"She runs fast." What is "runs"?', options: ['Verb', 'Noun', 'Adjective', 'Adverb'], answer: 'Verb' },
        { id: 'q5', text: 'Which is a proper noun?', options: ['India', 'City', 'School', 'Girl'], answer: 'India' }
      ]
    }
  ];

  for (const quiz of quizzes) {
    await put('quizzes', quiz);
  }

  const assignments = [
    {
      id: 'math-101-a1',
      courseId: 'math-101',
      lessonId: 'math-101-l1',
      title: 'Place Value Practice',
      instructions: 'Write the place value of the underlined digit in each number. Example: 3**4**5 → 4 is in the tens place.',
      tasks: [
        { id: 't1', text: 'In 2**5**7, what is the place value of 5?' },
        { id: 't2', text: 'In 1**0**00, what is the place value of 0?' },
        { id: 't3', text: 'In 9**9**9, what is the place value of the first 9?' },
        { id: 't4', text: 'In 5**0**5, what is the place value of 0?' }
      ]
    },
    {
      id: 'sci-101-a1',
      courseId: 'sci-101',
      lessonId: 'sci-101-l1',
      title: 'Matter Worksheet',
      instructions: 'Answer the following questions about matter and its states.',
      tasks: [
        { id: 't1', text: 'Name the three states of matter.' },
        { id: 't2', text: 'What happens when ice melts?' },
        { id: 't3', text: 'Why do gases fill their container?' },
        { id: 't4', text: 'Give an example of a solid.' }
      ]
    },
    {
      id: 'eng-101-a1',
      courseId: 'eng-101',
      lessonId: 'eng-101-l1',
      title: 'Parts of Speech Worksheet',
      instructions: 'Identify the part of speech for each underlined word.',
      tasks: [
        { id: 't1', text: 'The **cat** sleeps. (Noun/Verb/Adjective)' },
        { id: 't2', text: 'She runs **quickly**. (Noun/Verb/Adverb)' },
        { id: 't3', text: 'The **red** apple is sweet. (Noun/Verb/Adjective)' },
        { id: 't4', text: 'They **play** outside. (Noun/Verb/Adverb)' }
      ]
    }
  ];

  for (const assignment of assignments) {
    await put('assignments', assignment);
  }
}

async function seedExpandedContent() {
  const extras = [
    { id: 'tam-101', subject: 'Tamil', title: 'Tamil Language and Literature', description: 'Read, write, and appreciate Tamil through language, stories, and everyday communication.', icon: 'அ', color: '#176B5B', lessons: 4 },
    { id: 'soc-101', subject: 'Social Science', title: 'Our Society and World', description: 'Explore history, geography, civics, and economics through everyday examples.', icon: '◎', color: '#176B5B', lessons: 4 },
    { id: 'cs-101', subject: 'Computer Science', title: 'Digital Foundations', description: 'Learn computer basics, the internet, coding ideas, and cyber safety.', icon: '⌘', color: '#176B5B', lessons: 4 },
    { id: 'gk-101', subject: 'General Knowledge', title: 'Everyday Knowledge', description: 'Build confidence with India, nature, health, and current-world basics.', icon: '✦', color: '#176B5B', lessons: 4 }
  ];
  for (const course of extras) if (!await get('courses', course.id)) await put('courses', course);

  const lessons = [
    ['tam-101-l1','tam-101','எழுத்தும் ஒலியும்','எழுத்துக்களின் ஒலியை அறிதல்','தமிழ் உயிரெழுத்துகளும் மெய்யெழுத்துகளும் சேர்ந்து சொற்களை உருவாக்குகின்றன. ஒலியை கவனித்து வாசிப்பது தெளிவான உச்சரிப்புக்கு உதவும்.','அ + மா = அம்மா','ஒலித்து வாசிக்கவும்; புதிய சொல்லை வாக்கியத்தில் பயன்படுத்தவும்','Tamil Language'],
    ['tam-101-l2','tam-101','சொல்லும் வாக்கியமும்','சொற்களை இணைத்து சரியான வாக்கியம் அமைத்தல்','ஒரு வாக்கியம் முழுமையான கருத்தைச் சொல்கிறது. பெயர்ச்சொல் யார் அல்லது எது என்பதைச் சொல்கிறது; வினைச்சொல் செயலைச் சொல்கிறது.','மாணவி பாடம் படிக்கிறாள்.','வாக்கியம் பெரிய எழுத்தில் தொடங்கும்; முடிவில் குறியீடு இடவும்','Tamil Grammar'],
    ['tam-101-l3','tam-101','சிறுகதை வாசிப்பு','கதையின் முக்கிய கருத்தை அறிதல்','ஒரு சிறுகதையில் பாத்திரங்கள், இடம், நிகழ்வுகள் மற்றும் ஒரு செய்தி இருக்கும். வாசித்த பின் யார், என்ன, ஏன் என்று கேள்வி கேளுங்கள்.','உதவும் நண்பன் உண்மையான நண்பன்.','முக்கிய நிகழ்வை வரிசையாக எழுதவும்','Tamil Literature'],
    ['tam-101-l4','tam-101','கடிதம் எழுதுதல்','எளிய தனிக்கடிதம் எழுதுதல்','கடிதத்தில் வாழ்த்து, செய்தி, நிறைவு ஆகிய மூன்று பகுதிகள் உள்ளன. எளிமையான, மரியாதையான மொழியைப் பயன்படுத்துங்கள்.','அன்புள்ள தோழிக்கு, நான் நலமாக இருக்கிறேன்.','தேதி இடவும்; தெளிவாக எழுதவும்','Tamil Writing'],
    ['soc-101-l1','soc-101','History: Reading the Past','Understand evidence from the past','History uses inscriptions, objects, buildings, and written records to understand how people lived. We compare evidence carefully before drawing conclusions.','A coin can tell us about trade and rulers.','Evidence needs context; ask who made it and why','History'],
    ['soc-101-l2','soc-101','Geography: Maps and Resources','Read simple maps and identify resources','Maps use symbols, direction, and scale to show places. Natural resources such as water, soil, forests, and minerals support life and work.','North is usually shown at the top of a map.','Use a key; protect resources','Geography'],
    ['soc-101-l3','soc-101','Civics: Rights and Duties','Explain responsible citizenship','Citizens have rights such as education and safety. They also have duties: respect others, follow fair rules, and care for shared spaces.','Voting is one way adults participate in democracy.','Rights and duties work together','Civics'],
    ['soc-101-l4','soc-101','Economics: Needs and Choices','Distinguish needs from wants','Families have limited money and time, so they make choices. Needs include food, shelter, health, and education; wants are things that are nice to have.','Saving a little regularly helps plan for a need.','Make a budget; compare choices','Economics'],
    ['cs-101-l1','cs-101','Computer Basics','Identify common computer parts','A computer accepts input, processes information, stores data, and gives output. Keyboard and mouse are input devices; a screen is an output device.','Typing on a keyboard is input.','Handle devices carefully; save work often','Computer Basics'],
    ['cs-101-l2','cs-101','Internet Basics','Use the web safely and purposefully','The internet connects computers around the world. A browser opens websites. Check trusted sources before sharing information.','A website address is called a URL.','Think before clicking; verify information','Internet'],
    ['cs-101-l3','cs-101','Programming Ideas','Understand instructions and algorithms','A program is a set of precise instructions. An algorithm is a step-by-step method for solving a problem, like a recipe.','Algorithm: start, take two numbers, add, show result.','Be precise; test and improve steps','Programming'],
    ['cs-101-l4','cs-101','Cyber Safety','Protect accounts and personal data','Use strong passwords, keep them private, and ask a trusted adult when a message feels suspicious. Do not share OTPs or personal details.','A real service will not ask you to share a password.','Pause before sharing; report suspicious messages','Cyber Safety'],
    ['gk-101-l1','gk-101','India: Diversity and Unity','Recognise India’s diversity','India has many languages, foods, festivals, and landscapes. Respecting differences helps communities live together peacefully.','Tamil is one of India’s classical languages.','Diversity is a strength','India'],
    ['gk-101-l2','gk-101','Nature Around Us','Observe ecosystems','Plants, animals, water, soil, and air are connected in an ecosystem. Small actions such as saving water protect local environments.','Bees help many plants reproduce through pollination.','Observe carefully; avoid waste','Nature'],
    ['gk-101-l3','gk-101','Healthy Habits','Choose daily habits for wellbeing','Balanced meals, clean water, sleep, movement, and handwashing support health. Good habits work best when practiced every day.','Wash hands before eating and after using the toilet.','Small habits add up','Health'],
    ['gk-101-l4','gk-101','World Awareness','Use reliable knowledge','Maps, books, teachers, and trusted news help us learn about the world. Ask questions and compare sources before believing a claim.','Oceans cover most of Earth’s surface.','Stay curious; check sources','World Awareness']
  ];
  for (const [id, courseId, title, objective, content, examples, keyPoint, unit] of lessons) {
    if (!await get('lessons', id)) await put('lessons', { id, courseId, unit, title, objectives:[objective], content, examples, keyPoints:keyPoint.split(';'), practiceQuestions:['Explain this idea in your own words.','Give one example from daily life.'] });
  }
  const quizCourses = extras.map(course => course.id);
  for (const courseId of quizCourses) {
    const quizId = `${courseId}-q1`;
    if (!await get('quizzes', quizId)) await put('quizzes', { id:quizId, courseId, lessonId:`${courseId}-l1`, title:'Quick Check', questions:[{id:'q1',text:'What is the main idea of this lesson?',options:['Review the lesson carefully','Ignore the topic','Only memorise one word','Skip practice'],answer:'Review the lesson carefully'},{id:'q2',text:'Which learning habit is useful?',options:['Ask questions and practise','Stop after the title','Share private data','Avoid examples'],answer:'Ask questions and practise'}] });
    const assignmentId = `${courseId}-a1`;
    if (!await get('assignments', assignmentId)) await put('assignments', { id:assignmentId, courseId, lessonId:`${courseId}-l1`, title:'Practice Reflection', instructions:'Use the lesson to answer in your own words.', tasks:[{id:'t1',text:'Write one key point you learned.'},{id:'t2',text:'Give one example related to the lesson.'}] });
  }
}
