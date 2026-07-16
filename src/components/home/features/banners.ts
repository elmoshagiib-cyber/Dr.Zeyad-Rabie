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
    image:
      "https://images.unsplash.com/photo-1584697964403-2bfa3b2e9f3f?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: 2,
    title: "حل آلاف الأسئلة",
    description:
      "تدريب مستمر على أسئلة متنوعة بأفكار مختلفة لتكون مستعدًا لأي امتحان.",
    image:
      "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: 3,
    title: "اختبارات تحاكي الامتحان الحقيقي",
    description:
      "اختبارات تفاعلية بنفس نظام الامتحان لقياس مستواك وتحسين أدائك باستمرار.",
    image:
      "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: 4,
    title: "مراجعات شاملة ومنظمة",
    description:
      "مراجعات مركزة تغطي جميع أجزاء المنهج حتى تدخل الامتحان بثقة كاملة.",
    image:
      "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1200&q=80",
  },

  {
    id: 5,
    title: "رحلتك إلى الدرجة النهائية",
    description:
      "شرح، واجبات، اختبارات ومتابعة مستمرة في مكان واحد لتحقيق أعلى الدرجات.",
    image:
      "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1200&q=80",
  },
];