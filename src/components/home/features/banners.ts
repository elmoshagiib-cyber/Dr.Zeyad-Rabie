export interface Banner {
  id: number;
  title: string;
  description: string;
  image: string;
}

export const BANNERS: Banner[] = [
  {
    id: 1,
    title: "شرح مبسط وواضح",
    description:
      "أسلوب شرح احترافي يبسّط أصعب الدروس ويحوّلها إلى أفكار سهلة الفهم.",
    image: "/images/banner1.jpg",
  },

  {
    id: 2,
    title: "حل آلاف الأسئلة",
    description:
      "تدريب مستمر على أسئلة متنوعة بأفكار مختلفة لتكون مستعدًا لأي امتحان.",
    image: "/images/banner2.jpg",
  },

  {
    id: 3,
    title: "اختبارات تحاكي الامتحان الحقيقي",
    description:
      "اختبارات تفاعلية بنفس نظام الامتحان لقياس مستواك وتحسين أدائك باستمرار.",
    image: "/images/banner3.jpg",
  },

  {
    id: 4,
    title: "مراجعات شاملة ومنظمة",
    description:
      "مراجعات مركزة تغطي جميع أجزاء المنهج حتى تدخل الامتحان بثقة كاملة.",
    image: "/images/banner4.jpg",
  },

  {
    id: 5,
    title: "رحلتك إلى الدرجة النهائية",
    description:
      "شرح، واجبات، اختبارات ومتابعة مستمرة في مكان واحد لتحقيق أعلى الدرجات.",
    image: "/images/banner5.jpg",
  },
];