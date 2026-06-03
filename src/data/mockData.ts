// ============================================================
// MOCK DATA — Dr. Zeyad Rabie Educational Platform
// ============================================================

export const TEACHER = {
  name: "د. زياد ربيع",
  nameEn: "Dr. Zeyad Rabie",
  title: "أستاذ الكيمياء للمرحلة الثانوية",
  titleEn: "Chemistry Teacher — Secondary School",
  bio: "دكتور زياد ربيع، أستاذ متخصص في تدريس الكيمياء للمرحلة الثانوية والإعدادية منذ أكثر من 15 عامًا. حاصل على درجة الدكتوراه في الكيمياء العضوية من جامعة القاهرة، ومعروف بأسلوبه المبسّط والمميز الذي يجعل الكيمياء سهلة وممتعة لجميع الطلاب.",
  experience: "15+ سنة خبرة",
  university: "دكتوراه كيمياء عضوية — جامعة القاهرة",
  achievements: ["أكثر من 2,400 طالب", "معدل نجاح 98%", "أفضل مدرس كيمياء 2023"],
  image: "/images/teacher-hero.jpg",
};

export const STATS = [
  { label: "طالب مسجل", value: "2,400+", icon: "Users" },
  { label: "كورس متاح", value: "15+", icon: "BookOpen" },
  { label: "معدل النجاح", value: "98%", icon: "TrendingUp" },
  { label: "سنوات خبرة", value: "15+", icon: "Award" },
];

export const GRADES = [
  { id: "primary", label: "المرحلة الابتدائية", labelEn: "Primary School", color: "emerald" },
  { id: "first_sec", label: "الصف الأول الثانوي", labelEn: "First Secondary", color: "blue" },
  { id: "second_sec", label: "الصف الثاني الثانوي", labelEn: "Second Secondary", color: "violet" },
  { id: "third_sec", label: "الصف الثالث الثانوي", labelEn: "Third Secondary", color: "rose" },
];

export const COURSES = [
  {
    id: "c1",
    slug: "chemistry-grade-3-2024",
    title: "كيمياء الصف الثالث الثانوي 2024",
    titleEn: "Chemistry — Grade 3 Secondary",
    description: "كورس شامل ومتكامل لمنهج كيمياء الصف الثالث الثانوي، يغطي جميع أبواب المنهج مع حل مسائل وتدريبات متنوعة.",
    grade: "third_sec",
    gradeLabel: "الصف الثالث الثانوي",
    type: "yearly",
    typeLabel: "كورس سنوي",
    price: 450,
    thumbnail: "/images/course-chemistry3.jpg",
    lessonsCount: 48,
    studentsCount: 980,
    rating: 4.9,
    isFeatured: true,
    isFree: false,
    status: "published",
    units: [
      {
        id: "u1",
        title: "الوحدة الأولى: الكيمياء العضوية",
        order: 1,
        lessons: [
          { id: "l1", title: "مقدمة في الكيمياء العضوية", duration: "28:14", isFree: true, isCompleted: true, type: "video" },
          { id: "l2", title: "الهيدروكربونات الأليفاتية", duration: "34:22", isFree: false, isCompleted: true, type: "video" },
          { id: "l3", title: "مركبات الهيدروكربونات الحلقية", duration: "41:05", isFree: false, isCompleted: false, type: "video" },
          { id: "l4", title: "الكحولات والأثيرات", duration: "37:18", isFree: false, isCompleted: false, type: "video" },
          { id: "l5", title: "الألدهيدات والكيتونات", duration: "29:44", isFree: false, isCompleted: false, type: "video" },
          { id: "l6", title: "اختبار الوحدة الأولى", duration: "20 سؤال", isFree: false, isCompleted: false, type: "quiz" },
        ],
      },
      {
        id: "u2",
        title: "الوحدة الثانية: الكيمياء الحرارية",
        order: 2,
        lessons: [
          { id: "l7", title: "مفهوم الطاقة الحرارية", duration: "26:30", isFree: false, isCompleted: false, type: "video" },
          { id: "l8", title: "التغيرات الحرارية في التفاعلات", duration: "38:15", isFree: false, isCompleted: false, type: "video" },
          { id: "l9", title: "قانون هيس", duration: "32:08", isFree: false, isCompleted: false, type: "video" },
          { id: "l10", title: "اختبار الوحدة الثانية", duration: "15 سؤال", isFree: false, isCompleted: false, type: "quiz" },
        ],
      },
      {
        id: "u3",
        title: "الوحدة الثالثة: الكيمياء الكهربية",
        order: 3,
        lessons: [
          { id: "l11", title: "التوصيل الكهربي في المحاليل", duration: "31:20", isFree: false, isCompleted: false, type: "video" },
          { id: "l12", title: "خلايا الجلفانيك", duration: "43:55", isFree: false, isCompleted: false, type: "video" },
          { id: "l13", title: "التحليل الكهربي", duration: "39:10", isFree: false, isCompleted: false, type: "video" },
        ],
      },
    ],
  },
  {
    id: "c2",
    slug: "chemistry-grade-2-2024",
    title: "كيمياء الصف الثاني الثانوي 2024",
    titleEn: "Chemistry — Grade 2 Secondary",
    description: "منهج كيمياء الصف الثاني الثانوي كامل مع شرح مفصل وأمثلة عملية وتدريبات متنوعة لضمان الفهم الكامل.",
    grade: "second_sec",
    gradeLabel: "الصف الثاني الثانوي",
    type: "yearly",
    typeLabel: "كورس سنوي",
    price: 380,
    thumbnail: "/images/course-chemistry2.jpg",
    lessonsCount: 36,
    studentsCount: 720,
    rating: 4.8,
    isFeatured: true,
    isFree: false,
    status: "published",
    units: [
      {
        id: "u4",
        title: "الوحدة الأولى: الجدول الدوري",
        order: 1,
        lessons: [
          { id: "l14", title: "بناء الجدول الدوري", duration: "25:40", isFree: true, isCompleted: false, type: "video" },
          { id: "l15", title: "خواص العناصر", duration: "33:12", isFree: false, isCompleted: false, type: "video" },
          { id: "l16", title: "الخواص الدورية", duration: "28:55", isFree: false, isCompleted: false, type: "video" },
        ],
      },
      {
        id: "u5",
        title: "الوحدة الثانية: الروابط الكيميائية",
        order: 2,
        lessons: [
          { id: "l17", title: "الرابطة الأيونية", duration: "30:22", isFree: false, isCompleted: false, type: "video" },
          { id: "l18", title: "الرابطة التساهمية", duration: "35:44", isFree: false, isCompleted: false, type: "video" },
          { id: "l19", title: "الرابطة الفلزية", duration: "22:18", isFree: false, isCompleted: false, type: "video" },
          { id: "l20", title: "اختبار الروابط الكيميائية", duration: "18 سؤال", isFree: false, isCompleted: false, type: "quiz" },
        ],
      },
    ],
  },
  {
    id: "c3",
    slug: "integrated-science-grade-1",
    title: "علوم متكاملة الصف الأول الثانوي",
    titleEn: "Integrated Science — Grade 1 Secondary",
    description: "كورس العلوم المتكاملة للصف الأول الثانوي يشمل الكيمياء والفيزياء والأحياء بأسلوب مبسط وشامل.",
    grade: "first_sec",
    gradeLabel: "الصف الأول الثانوي",
    type: "yearly",
    typeLabel: "كورس سنوي",
    price: 320,
    thumbnail: "/images/course-science1.jpg",
    lessonsCount: 54,
    studentsCount: 560,
    rating: 4.7,
    isFeatured: true,
    isFree: false,
    status: "published",
    units: [],
  },
  {
    id: "c4",
    slug: "primary-science-basics",
    title: "علوم المرحلة الابتدائية",
    titleEn: "Primary School Science",
    description: "كورس علوم المرحلة الابتدائية بأسلوب ممتع وتفاعلي مناسب لجميع المستويات.",
    grade: "primary",
    gradeLabel: "المرحلة الابتدائية",
    type: "monthly",
    typeLabel: "كورس شهري",
    price: 200,
    thumbnail: "/images/course-primary.jpg",
    lessonsCount: 32,
    studentsCount: 340,
    rating: 4.9,
    isFeatured: false,
    isFree: false,
    status: "published",
    units: [],
  },
  {
    id: "c5",
    slug: "chemistry-revision-grade-3",
    title: "مراجعة نهائية كيمياء تالتة ثانوي",
    titleEn: "Final Revision — Grade 3 Chemistry",
    description: "مراجعة شاملة لمنهج كيمياء الثالث الثانوي قبل الامتحانات، مع أهم الأسئلة المتوقعة.",
    grade: "third_sec",
    gradeLabel: "الصف الثالث الثانوي",
    type: "revision",
    typeLabel: "كورس مراجعة",
    price: 0,
    thumbnail: "/images/course-chemistry3.jpg",
    lessonsCount: 12,
    studentsCount: 1200,
    rating: 5.0,
    isFeatured: false,
    isFree: true,
    status: "published",
    units: [],
  },
  {
    id: "c6",
    slug: "chemistry-grade-2-revision",
    title: "مراجعة كيمياء تانية ثانوي",
    titleEn: "Revision — Grade 2 Chemistry",
    description: "مراجعة متكاملة لمنهج كيمياء الصف الثاني الثانوي مع بنك أسئلة شامل.",
    grade: "second_sec",
    gradeLabel: "الصف الثاني الثانوي",
    type: "revision",
    typeLabel: "كورس مراجعة",
    price: 150,
    thumbnail: "/images/course-chemistry2.jpg",
    lessonsCount: 18,
    studentsCount: 480,
    rating: 4.8,
    isFeatured: false,
    isFree: false,
    status: "published",
    units: [],
  },
];

export const QUIZ_DATA = {
  id: "q1",
  title: "اختبار: الكيمياء العضوية — الوحدة الأولى",
  courseTitle: "كيمياء الصف الثالث الثانوي",
  timeLimit: 1200, // seconds = 20 min
  totalQuestions: 10,
  passingScore: 60,
  questions: [
    {
      id: "q1_1",
      text: "ما هو الاسم الصحيح لمركب CH₃-CH₂-OH وفقاً لتسمية IUPAC؟",
      type: "mcq",
      points: 10,
      options: [
        { id: "o1", text: "ميثانول", isCorrect: false },
        { id: "o2", text: "إيثانول", isCorrect: true },
        { id: "o3", text: "بروبانول", isCorrect: false },
        { id: "o4", text: "بيوتانول", isCorrect: false },
      ],
    },
    {
      id: "q1_2",
      text: "الكيمياء العضوية هي علم دراسة مركبات الكربون فقط.",
      type: "truefalse",
      points: 10,
      options: [
        { id: "o5", text: "صح", isCorrect: false },
        { id: "o6", text: "خطأ", isCorrect: true },
      ],
    },
    {
      id: "q1_3",
      text: "أي من الهيدروكربونات التالية يحتوي على رابطة ثلاثية؟",
      type: "mcq",
      points: 10,
      options: [
        { id: "o7", text: "الإيثان (C₂H₆)", isCorrect: false },
        { id: "o8", text: "الإيثيلين (C₂H₄)", isCorrect: false },
        { id: "o9", text: "الأسيتيلين (C₂H₂)", isCorrect: true },
        { id: "o10", text: "البروبان (C₃H₈)", isCorrect: false },
      ],
    },
    {
      id: "q1_4",
      text: "ما الصيغة العامة للألكانات؟",
      type: "mcq",
      points: 10,
      options: [
        { id: "o11", text: "CₙH₂ₙ", isCorrect: false },
        { id: "o12", text: "CₙH₂ₙ₋₂", isCorrect: false },
        { id: "o13", text: "CₙH₂ₙ₊₂", isCorrect: true },
        { id: "o14", text: "CₙHₙ", isCorrect: false },
      ],
    },
    {
      id: "q1_5",
      text: "البنزين (C₆H₆) مركب هيدروكربوني حلقي.",
      type: "truefalse",
      points: 10,
      options: [
        { id: "o15", text: "صح", isCorrect: true },
        { id: "o16", text: "خطأ", isCorrect: false },
      ],
    },
    {
      id: "q1_6",
      text: "ما نوع التفاعل الذي تخضع له الألكانات في الغالب؟",
      type: "mcq",
      points: 10,
      options: [
        { id: "o17", text: "تفاعل الإضافة", isCorrect: false },
        { id: "o18", text: "تفاعل الإحلال", isCorrect: true },
        { id: "o19", text: "تفاعل التكثيف", isCorrect: false },
        { id: "o20", text: "تفاعل التحلل", isCorrect: false },
      ],
    },
    {
      id: "q1_7",
      text: "ما عدد ذرات الهيدروجين في جزيء البروبان؟",
      type: "mcq",
      points: 10,
      options: [
        { id: "o21", text: "6", isCorrect: false },
        { id: "o22", text: "8", isCorrect: true },
        { id: "o23", text: "10", isCorrect: false },
        { id: "o24", text: "4", isCorrect: false },
      ],
    },
    {
      id: "q1_8",
      text: "الكحولات تحتوي على المجموعة الوظيفية (-OH).",
      type: "truefalse",
      points: 10,
      options: [
        { id: "o25", text: "صح", isCorrect: true },
        { id: "o26", text: "خطأ", isCorrect: false },
      ],
    },
    {
      id: "q1_9",
      text: "أي من التالي يعتبر مصدراً طبيعياً للهيدروكربونات؟",
      type: "mcq",
      points: 10,
      options: [
        { id: "o27", text: "الماء", isCorrect: false },
        { id: "o28", text: "البترول الخام", isCorrect: true },
        { id: "o29", text: "الملح", isCorrect: false },
        { id: "o30", text: "الهواء", isCorrect: false },
      ],
    },
    {
      id: "q1_10",
      text: "الألكينات تحتوي على رابطة مزدوجة بين ذرتي كربون.",
      type: "truefalse",
      points: 10,
      options: [
        { id: "o31", text: "صح", isCorrect: true },
        { id: "o32", text: "خطأ", isCorrect: false },
      ],
    },
  ],
};

export const ANNOUNCEMENTS = [
  {
    id: "a1",
    title: "🎉 تم رفع درس جديد: الهيدروكربونات الحلقية",
    content: "تم رفع الدرس الثالث من وحدة الكيمياء العضوية. الدرس يشمل شرح مفصل للبنزين وخواصه وتفاعلاته. لا تنسوا مشاهدته والإجابة على أسئلة الدرس.",
    type: "lesson",
    courseTitle: "كيمياء تالتة ثانوي",
    publishedAt: "منذ ساعتين",
    isNew: true,
  },
  {
    id: "a2",
    title: "⚠️ تنبيه: امتحان الوحدة الأولى السبت القادم",
    content: "يُذكّر جميع الطلاب بأن امتحان الوحدة الأولى (الكيمياء العضوية) سيكون يوم السبت 15 فبراير الساعة 10 صباحاً. الامتحان مدته 45 دقيقة ويشمل 20 سؤالاً.",
    type: "exam",
    courseTitle: "كيمياء تالتة ثانوي",
    publishedAt: "منذ يوم",
    isNew: true,
  },
  {
    id: "a3",
    title: "📚 تمرين إضافي: حل مسائل الكيمياء الحرارية",
    content: "تم رفع ملف PDF يحتوي على 30 مسألة محلولة في الكيمياء الحرارية. يُنصح بحل التمارين قبل الامتحان القادم.",
    type: "homework",
    courseTitle: "كيمياء تالتة ثانوي",
    publishedAt: "منذ 3 أيام",
    isNew: false,
  },
  {
    id: "a4",
    title: "🏆 نتائج اختبار الوحدة الأولى",
    content: "تهانينا لجميع الطلاب! معدل الدرجات كان 84%. أعلى درجة حصل عليها الطالب أحمد محمد بدرجة 98%. نتائج الاختبار متاحة الآن في قسم نتائجي.",
    type: "result",
    courseTitle: "كيمياء تالتة ثانوي",
    publishedAt: "منذ أسبوع",
    isNew: false,
  },
  {
    id: "a5",
    title: "📢 إعلان هام: بداية مذاكرة المراجعة النهائية",
    content: "انطلاق كورس المراجعة النهائية لطلاب الثالث الثانوي مجاناً! الكورس يشمل أهم أسئلة الامتحانات السابقة ومتوقعات 2024.",
    type: "general",
    courseTitle: null,
    publishedAt: "منذ أسبوعين",
    isNew: false,
  },
];

export const STUDENTS = [
  { id: "s1", name: "أحمد محمد علي", phone: "01012345678", grade: "third_sec", gradeLabel: "تالتة ثانوي", governorate: "القاهرة", status: "approved", code: "ZR-2024-001", avatar: null, score: 98, rank: 1, enrolledCourses: 2, joinedAt: "15 يناير 2024" },
  { id: "s2", name: "سارة خالد محمود", phone: "01112345678", grade: "third_sec", gradeLabel: "تالتة ثانوي", governorate: "الجيزة", status: "approved", code: "ZR-2024-002", avatar: null, score: 95, rank: 2, enrolledCourses: 2, joinedAt: "16 يناير 2024" },
  { id: "s3", name: "محمد عبدالله حسن", phone: "01212345678", grade: "second_sec", gradeLabel: "تانية ثانوي", governorate: "الإسكندرية", status: "approved", code: "ZR-2024-003", avatar: null, score: 92, rank: 3, enrolledCourses: 1, joinedAt: "18 يناير 2024" },
  { id: "s4", name: "نور أحمد سعد", phone: "01512345678", grade: "third_sec", gradeLabel: "تالتة ثانوي", governorate: "المنصورة", status: "approved", code: "ZR-2024-004", avatar: null, score: 89, rank: 4, enrolledCourses: 3, joinedAt: "20 يناير 2024" },
  { id: "s5", name: "كريم عمر فارس", phone: "01012349999", grade: "first_sec", gradeLabel: "أولى ثانوي", governorate: "أسيوط", status: "pending", code: "ZR-2024-005", avatar: null, score: 0, rank: 0, enrolledCourses: 0, joinedAt: "22 يناير 2024" },
  { id: "s6", name: "ياسمين علي إبراهيم", phone: "01112349999", grade: "second_sec", gradeLabel: "تانية ثانوي", governorate: "طنطا", status: "pending", code: "ZR-2024-006", avatar: null, score: 0, rank: 0, enrolledCourses: 0, joinedAt: "23 يناير 2024" },
  { id: "s7", name: "عمر حسين ناصر", phone: "01212349999", grade: "third_sec", gradeLabel: "تالتة ثانوي", governorate: "القاهرة", status: "approved", code: "ZR-2024-007", avatar: null, score: 87, rank: 5, enrolledCourses: 2, joinedAt: "25 يناير 2024" },
  { id: "s8", name: "مريم فاروق سالم", phone: "01512349999", grade: "primary", gradeLabel: "ابتدائي", governorate: "الإسكندرية", status: "approved", code: "ZR-2024-008", avatar: null, score: 85, rank: 6, enrolledCourses: 1, joinedAt: "28 يناير 2024" },
];

export const LEADERBOARD = [
  { rank: 1, name: "أحمد محمد علي", grade: "تالتة ثانوي", score: 98, badge: "🥇", avatar: null },
  { rank: 2, name: "سارة خالد محمود", grade: "تالتة ثانوي", score: 95, badge: "🥈", avatar: null },
  { rank: 3, name: "محمد عبدالله حسن", grade: "تانية ثانوي", score: 92, badge: "🥉", avatar: null },
  { rank: 4, name: "نور أحمد سعد", grade: "تالتة ثانوي", score: 89, badge: null, avatar: null },
  { rank: 5, name: "عمر حسين ناصر", grade: "تالتة ثانوي", score: 87, badge: null, avatar: null },
  { rank: 6, name: "مريم فاروق سالم", grade: "ابتدائي", score: 85, badge: null, avatar: null },
  { rank: 7, name: "لمياء عبدالرحمن", grade: "أولى ثانوي", score: 83, badge: null, avatar: null },
  { rank: 8, name: "يوسف ماهر جاد", grade: "تانية ثانوي", score: 81, badge: null, avatar: null },
  { rank: 9, name: "دينا مصطفى رضا", grade: "تالتة ثانوي", score: 80, badge: null, avatar: null },
  { rank: 10, name: "حسام وليد فتحي", grade: "تالتة ثانوي", score: 78, badge: null, avatar: null },
];

export const TESTIMONIALS = [
  { id: "t1", name: "أحمد محمد", grade: "طالب — الصف الثالث الثانوي", text: "بفضل دكتور زياد حصلت على 98% في الكيمياء! الشرح واضح جداً والأمثلة بتخلي المعلومة ثابتة في الدماغ. أنصح كل طالب يسجل في الكورس.", rating: 5, avatar: null },
  { id: "t2", name: "سارة خالد", grade: "طالبة — الصف الثالث الثانوي", text: "من أحسن مذاكرات الكيمياء اللي لقيتها. الدكتور بيشرح بطريقة مبسطة جداً ومش بتحسسك إن الكيمياء صعبة. شكراً دكتور زياد!", rating: 5, avatar: null },
  { id: "t3", name: "محمد عبدالله", grade: "طالب — الصف الثاني الثانوي", text: "الكورس بجد استحمل كل قرشه. الشرح متسلسل والأسئلة بعد كل وحدة بتساعدك تعرف مستواك. نتيجتي تحسنت من 60 لـ 91!", rating: 5, avatar: null },
  { id: "t4", name: "نور أحمد", grade: "طالبة — الأول الثانوي", text: "الدكتور بيحب التدريس ومحتاج يوصل المعلومة لكل طالب. الأسلوب ممتع والكيمياء بقت موضة بالنسبالي.", rating: 5, avatar: null },
];

export const FAQS = [
  { q: "كيف أشترك في الكورس؟", a: "قم بإنشاء حساب جديد وانتظر موافقة الإدارة، بعدها يمكنك الاشتراك في أي كورس وبدء المشاهدة فوراً." },
  { q: "هل يمكنني مشاهدة الدروس بدون إنترنت؟", a: "حالياً المنصة تعمل أونلاين فقط، لكن يمكنك تحميل ملفات PDF والأوراق للدراسة بدون إنترنت." },
  { q: "كم مدة صلاحية الاشتراك؟", a: "تختلف مدة الاشتراك حسب نوع الكورس: الكورسات السنوية صلاحيتها سنة كاملة، والشهرية شهر واحد." },
  { q: "هل هناك كورسات مجانية؟", a: "نعم! نوفر كورسات مراجعة مجانية خاصة قبل الامتحانات. تابعوا الإعلانات على المنصة." },
  { q: "كيف أتواصل مع الدكتور زياد؟", a: "يمكن التواصل عبر قسم الإعلانات والتعليقات داخل المنصة. الدكتور يرد على الأسئلة أثناء الجلسات المباشرة." },
  { q: "هل يوجد تطبيق موبايل؟", a: "المنصة مصممة بالكامل لتعمل على الموبايل والتابلت والكمبيوتر بجودة عالية من خلال المتصفح." },
];

export const CURRENT_STUDENT = {
  id: "s1",
  name: "أحمد محمد علي",
  phone: "01012345678",
  parentPhone: "01098765432",
  grade: "third_sec",
  gradeLabel: "الصف الثالث الثانوي",
  governorate: "القاهرة",
  code: "ZR-2024-001",
  rank: 12,
  totalPoints: 1240,
  completionRate: 67,
  enrolledCourses: [
    { courseId: "c1", progress: 67, lastLesson: "مركبات الهيدروكربونات الحلقية", lastAccessedAt: "منذ ساعة" },
    { courseId: "c5", progress: 100, lastLesson: "مراجعة شاملة", lastAccessedAt: "أمس" },
  ],
  recentActivity: [
    { type: "lesson", text: "أنهيت درس الهيدروكربونات الأليفاتية", time: "منذ ساعة" },
    { type: "quiz", text: "حللت اختبار الوحدة الأولى — النتيجة 90%", time: "منذ 3 ساعات" },
    { type: "file", text: "تحميل ملف ملخص الكيمياء العضوية", time: "أمس" },
  ],
};

export const ADMIN_STATS = {
  totalStudents: 2412,
  totalCourses: 15,
  pendingApprovals: 47,
  successRate: 98,
  monthlyRevenue: 84500,
  totalRevenue: 620000,
  activeEnrollments: 1840,
};

export const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "المنوفية", "الشرقية", "الغربية",
  "القليوبية", "الدقهلية", "كفر الشيخ", "البحيرة", "الإسماعيلية",
  "بورسعيد", "السويس", "دمياط", "المنصورة", "طنطا", "الفيوم",
  "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان",
];
// ============================================================
// HOMEWORKS
// ============================================================

export const HOMEWORKS = [
  {
    id: "hw1",
    title: "واجب الهيدروكربونات الأليفاتية",
    courseId: "c1",
    courseTitle: "كيمياء الصف الثالث الثانوي",
    dueDate: "2026-06-10",
    status: "submitted",
    submissionType: "pdf",
    grade: 18,
    totalGrade: 20,
    successRate: 90,
  },
  {
    id: "hw2",
    title: "واجب المركبات الحلقية",
    courseId: "c1",
    courseTitle: "كيمياء الصف الثالث الثانوي",
    dueDate: "2026-06-15",
    status: "pending",
    submissionType: "image",
    grade: null,
    totalGrade: 20,
    successRate: null,
  },
  {
    id: "hw3",
    title: "واجب الكيمياء الحرارية",
    courseId: "c1",
    courseTitle: "كيمياء الصف الثالث الثانوي",
    dueDate: "2026-06-18",
    status: "interactive",
    submissionType: "quiz",
    grade: null,
    totalGrade: 20,
    successRate: null,
  },
];


// ============================================================
// EXAMS
// ============================================================

export const EXAMS = [
  {
    id: "ex1",
    title: "اختبار الوحدة الأولى",
    courseId: "c1",
    courseTitle: "كيمياء الصف الثالث الثانوي",
    duration: 20,
    passingScore: 60,
    status: "completed",
    score: 90,
    correctAnswers: 9,
    wrongAnswers: 1,
  },
  {
    id: "ex2",
    title: "اختبار الكيمياء الحرارية",
    courseId: "c1",
    courseTitle: "كيمياء الصف الثالث الثانوي",
    duration: 30,
    passingScore: 60,
    status: "upcoming",
    score: null,
    correctAnswers: null,
    wrongAnswers: null,
  },
  {
    id: "ex3",
    title: "اختبار الكيمياء الكهربية",
    courseId: "c1",
    courseTitle: "كيمياء الصف الثالث الثانوي",
    duration: 25,
    passingScore: 60,
    status: "not_started",
    score: null,
    correctAnswers: null,
    wrongAnswers: null,
  },
];