export type QuestionType = "mcq" | "essay" | "truefalse";

export interface MCQQuestion {
  id: string;
  type: "mcq";
  question: string;
  image?: File | null;

  options: string[];

  correctAnswer: number;
}

export interface EssayQuestion {
  id: string;
  type: "essay";

  question: string;

  image?: File | null;

  degree: number;
}

export interface TrueFalseQuestion {
  id: string;
  type: "truefalse";

  question: string;

  image?: File | null;

  answer: boolean;
}

export type ExamQuestion =
  | MCQQuestion
  | EssayQuestion
  | TrueFalseQuestion;

export interface Exam {
  id: string;

  title: string;

  hasTimer: boolean;

  duration: number;

  questions: ExamQuestion[];
}

export interface Homework {
  id: string;

  title: string;

  mode: "questions" | "upload";
}

export interface Lesson {
  id: string;

  title: string;

  videos: File[];

  pdfs: File[];

  homeworks: Homework[];

  exams: Exam[];
}

export interface Section {
  id: string;

  title: string;

  lessons: Lesson[];
}