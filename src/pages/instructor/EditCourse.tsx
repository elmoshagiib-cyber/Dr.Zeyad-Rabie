import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InstructorLayout from "../../layouts/InstructorLayout";
import { supabase } from "../../lib/supabase";

interface Question {
  id: string;
  title: string;
  type: 'multiple_choice' | 'true_false';
  choices: string[];
  correctAnswer: number;
  points: number;
}

interface VideoItem {
  type: 'video';
  id: string;
  title: string;
  description: string;
  videoFile: File | null;
  videoUrl: string;
  fileName: string;
  fileSize: number;
  duration: number;
  isFreePreview: boolean;
  allowDownload: boolean;
  uploadProgress: number;
  status: 'idle' | 'uploading' | 'completed' | 'error';
}

interface PdfItem {
  type: 'pdf';
  id: string;
  title: string;
  pdfFile: File | null;
  pdfUrl: string;
  fileName: string;
  fileSize: number;
  allowDownload: boolean;
  uploadProgress: number;
  status: 'idle' | 'uploading' | 'completed' | 'error';
}

interface QuizItem {
  type: 'quiz';
  id: string;
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  maxAttempts: number;
  isVisible: boolean;
  isPublished: boolean;
  questions: Question[];
}

interface HomeworkItem {
  type: 'homework';
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalScore: number;
  allowLateSubmission: boolean;
  instructions: string;
  attachmentPdf: File | null;
  attachmentPdfUrl: string;
  attachmentImage: File | null;
  attachmentImageUrl: string;
  allowedSubmissionTypes: {
    text: boolean;
    pdf: boolean;
    image: boolean;
    multipleFiles: boolean;
  };
  isVisible: boolean;
  isPublished: boolean;
}

type CourseItem = VideoItem | PdfItem | QuizItem | HomeworkItem;

interface Section {
  id: string;
  title: string;
  isCollapsed: boolean;
  items: CourseItem[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  thumbnail: string;
  thumbnailFile: File | null;
  grade: string;
  isPublished: boolean;
  isHidden: boolean;
  sections: Section[];
}

export function EditCourse() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        setError('معرف الدورة غير موجود');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('الدورة غير موجودة');
        setLoading(false);
        return;
      }

      const loadedCourse: Course = {
        id: data.id,
        title: data.title || '',
        description: data.description || '',
        price: data.price || 0,
        isFree: data.is_free || false,
        thumbnail: data.thumbnail || '',
        thumbnailFile: null,
        grade: data.grade || '',
        isPublished: data.is_published || false,
        isHidden: data.is_hidden || false,
        sections: data.sections || []
      };

      setCourse(loadedCourse);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل الدورة');
      setLoading(false);
    }
  };

  const saveCourse = async () => {
    console.log('Saving course:', course);
    alert('تم حفظ التغييرات بنجاح');
  };

  const deleteCourse = async () => {
    console.log('Deleting course:', id);
    alert('تم حذف الدورة');
    navigate('/instructor/courses');
  };

  const addSection = () => {
    if (!course) return;

    const newSection: Section = {
      id: `section_${Date.now()}`,
      title: 'قسم جديد',
      isCollapsed: false,
      items: []
    };

    setCourse({
      ...course,
      sections: [...course.sections, newSection]
    });
  };

  const removeSection = (sectionId: string) => {
    if (!course) return;

    setCourse({
      ...course,
      sections: course.sections.filter(s => s.id !== sectionId)
    });
  };

  const renameSection = (sectionId: string, newTitle: string) => {
    if (!course) return;

    setCourse({
      ...course,
      sections: course.sections.map(s =>
        s.id === sectionId ? { ...s, title: newTitle } : s
      )
    });
  };

  const toggleSectionCollapse = (sectionId: string) => {
    if (!course) return;

    setCourse({
      ...course,
      sections: course.sections.map(s =>
        s.id === sectionId ? { ...s, isCollapsed: !s.isCollapsed } : s
      )
    });
  };

  const moveSectionUp = (sectionId: string) => {
    if (!course) return;

    const index = course.sections.findIndex(s => s.id === sectionId);
    if (index <= 0) return;

    const newSections = [...course.sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];

    setCourse({
      ...course,
      sections: newSections
    });
  };

  const moveSectionDown = (sectionId: string) => {
    if (!course) return;

    const index = course.sections.findIndex(s => s.id === sectionId);
    if (index === -1 || index >= course.sections.length - 1) return;

    const newSections = [...course.sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];

    setCourse({
      ...course,
      sections: newSections
    });
  };

  const addItem = (sectionId: string, type: 'video' | 'pdf' | 'quiz' | 'homework') => {
    if (!course) return;

    let newItem: CourseItem;

    switch (type) {
      case 'video':
        newItem = {
          type: 'video',
          id: `video_${Date.now()}`,
          title: 'فيديو جديد',
          description: '',
          videoFile: null,
          videoUrl: '',
          fileName: '',
          fileSize: 0,
          duration: 0,
          isFreePreview: false,
          allowDownload: false,
          uploadProgress: 0,
          status: 'idle'
        };
        break;
      case 'pdf':
        newItem = {
          type: 'pdf',
          id: `pdf_${Date.now()}`,
          title: 'ملف PDF جديد',
          pdfFile: null,
          pdfUrl: '',
          fileName: '',
          fileSize: 0,
          allowDownload: true,
          uploadProgress: 0,
          status: 'idle'
        };
        break;
      case 'quiz':
        newItem = {
          type: 'quiz',
          id: `quiz_${Date.now()}`,
          title: 'اختبار جديد',
          description: '',
          duration: 30,
          passingScore: 70,
          maxAttempts: 3,
          isVisible: true,
          isPublished: false,
          questions: []
        };
        break;
      case 'homework':
        newItem = {
          type: 'homework',
          id: `homework_${Date.now()}`,
          title: 'واجب جديد',
          description: '',
          dueDate: '',
          totalScore: 100,
          allowLateSubmission: false,
          instructions: '',
          attachmentPdf: null,
          attachmentPdfUrl: '',
          attachmentImage: null,
          attachmentImageUrl: '',
          allowedSubmissionTypes: {
            text: true,
            pdf: true,
            image: true,
            multipleFiles: false
          },
          isVisible: true,
          isPublished: false
        };
        break;
    }

    setCourse({
      ...course,
      sections: course.sections.map(s =>
        s.id === sectionId
          ? { ...s, items: [...s.items, newItem] }
          : s
      )
    });

    setOpenDropdownId(null);
  };

  const removeItem = (sectionId: string, itemId: string) => {
    if (!course) return;

    setCourse({
      ...course,
      sections: course.sections.map(s =>
        s.id === sectionId
          ? { ...s, items: s.items.filter(item => item.id !== itemId) }
          : s
      )
    });
  };

  const moveItemUp = (sectionId: string, itemId: string) => {
    if (!course) return;

    setCourse({
      ...course,
      sections: course.sections.map(s => {
        if (s.id !== sectionId) return s;

        const index = s.items.findIndex(item => item.id === itemId);
        if (index <= 0) return s;

        const newItems = [...s.items];
        [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];

        return { ...s, items: newItems };
      })
    });
  };

  const moveItemDown = (sectionId: string, itemId: string) => {
    if (!course) return;

    setCourse({
      ...course,
      sections: course.sections.map(s => {
        if (s.id !== sectionId) return s;

        const index = s.items.findIndex(item => item.id === itemId);
        if (index === -1 || index >= s.items.length - 1) return s;

        const newItems = [...s.items];
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];

        return { ...s, items: newItems };
      })
    });
  };

  const updateItem = (sectionId: string, itemId: string, updates: Partial<CourseItem>) => {
    if (!course) return;

    setCourse({
      ...course,
      sections: course.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
              )
            }
          : s
      )
    });
  };

  const handleVideoUpload = (sectionId: string, itemId: string, file: File) => {
    updateItem(sectionId, itemId, {
      videoFile: file,
      fileName: file.name,
      fileSize: file.size,
      status: 'uploading',
      uploadProgress: 0
    } as Partial<VideoItem>);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      updateItem(sectionId, itemId, {
        uploadProgress: progress
      } as Partial<VideoItem>);

      if (progress >= 100) {
        clearInterval(interval);
        updateItem(sectionId, itemId, {
          status: 'completed',
          videoUrl: URL.createObjectURL(file)
        } as Partial<VideoItem>);
      }
    }, 300);
  };

  const handlePdfUpload = (sectionId: string, itemId: string, file: File) => {
    updateItem(sectionId, itemId, {
      pdfFile: file,
      fileName: file.name,
      fileSize: file.size,
      status: 'uploading',
      uploadProgress: 0
    } as Partial<PdfItem>);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      updateItem(sectionId, itemId, {
        uploadProgress: progress
      } as Partial<PdfItem>);

      if (progress >= 100) {
        clearInterval(interval);
        updateItem(sectionId, itemId, {
          status: 'completed',
          pdfUrl: URL.createObjectURL(file)
        } as Partial<PdfItem>);
      }
    }, 300);
  };

  const addQuestion = (sectionId: string, itemId: string) => {
    if (!course) return;

    const newQuestion: Question = {
      id: `question_${Date.now()}`,
      title: '',
      type: 'multiple_choice',
      choices: ['', '', '', ''],
      correctAnswer: 0,
      points: 10
    };

    setCourse({
      ...course,
      sections: course.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map(item =>
                item.id === itemId && item.type === 'quiz'
                  ? { ...item, questions: [...item.questions, newQuestion] }
                  : item
              )
            }
          : s
      )
    });
  };

  const updateQuestion = (sectionId: string, itemId: string, questionId: string, updates: Partial<Question>) => {
    if (!course) return;

    setCourse({
      ...course,
      sections: course.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map(item =>
                item.id === itemId && item.type === 'quiz'
                  ? {
                      ...item,
                      questions: item.questions.map(q =>
                        q.id === questionId ? { ...q, ...updates } : q
                      )
                    }
                  : item
              )
            }
          : s
      )
    });
  };

  const removeQuestion = (sectionId: string, itemId: string, questionId: string) => {
    if (!course) return;

    setCourse({
      ...course,
      sections: course.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map(item =>
                item.id === itemId && item.type === 'quiz'
                  ? {
                      ...item,
                      questions: item.questions.filter(q => q.id !== questionId)
                    }
                  : item
              )
            }
          : s
      )
    });
  };

  const handleThumbnailUpload = (file: File) => {
    if (!course) return;

    setCourse({
      ...course,
      thumbnailFile: file,
      thumbnail: URL.createObjectURL(file)
    });
  };

  const handleHomeworkAttachmentPdf = (sectionId: string, itemId: string, file: File) => {
    updateItem(sectionId, itemId, {
      attachmentPdf: file,
      attachmentPdfUrl: URL.createObjectURL(file)
    } as Partial<HomeworkItem>);
  };

  const handleHomeworkAttachmentImage = (sectionId: string, itemId: string, file: File) => {
    updateItem(sectionId, itemId, {
      attachmentImage: file,
      attachmentImageUrl: URL.createObjectURL(file)
    } as Partial<HomeworkItem>);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVideoItem = (sectionId: string, item: VideoItem, index: number, totalItems: number) => {
    return (
      <div key={item.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">فيديو</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => moveItemUp(sectionId, item.id)}
              disabled={index === 0}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="تحريك لأعلى"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={() => moveItemDown(sectionId, item.id)}
              disabled={index === totalItems - 1}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="تحريك لأسفل"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => removeItem(sectionId, item.id)}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              title="حذف"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان الفيديو</label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateItem(sectionId, item.id, { title: e.target.value } as Partial<VideoItem>)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              placeholder="أدخل عنوان الفيديو"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف</label>
            <textarea
              value={item.description}
              onChange={(e) => updateItem(sectionId, item.id, { description: e.target.value } as Partial<VideoItem>)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
              placeholder="أدخل وصف الفيديو"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">رفع الفيديو</label>
            {!item.videoFile ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="mb-2 text-base font-semibold text-gray-700">اسحب وأفلت الفيديو هنا</p>
                  <p className="text-sm text-gray-500">أو انقر للتحديد من جهازك</p>
                  <p className="text-xs text-gray-400 mt-2">MP4, MOV, AVI حتى 500 ميجابايت</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoUpload(sectionId, item.id, file);
                  }}
                />
              </label>
            ) : (
              <div className="space-y-4">
                {item.status === 'uploading' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">جاري الرفع...</span>
                      <span className="text-sm font-semibold text-blue-600">{item.uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {item.status === 'completed' && (
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                      {item.videoUrl ? (
                        <video
                          src={item.videoUrl}
                          controls
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                          <p className="text-white font-medium">معاينة الفيديو</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 mb-1 truncate">{item.fileName}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              {formatFileSize(item.fileSize)}
                            </span>
                            {item.duration > 0 && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatDuration(item.duration)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => updateItem(sectionId, item.id, { videoFile: null, videoUrl: '', fileName: '', fileSize: 0, status: 'idle' } as Partial<VideoItem>)}
                          className="mr-4 p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-8 pt-4 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={item.isFreePreview}
                  onChange={(e) => updateItem(sectionId, item.id, { isFreePreview: e.target.checked } as Partial<VideoItem>)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 transition-all duration-300"></div>
                <div className="absolute left-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">معاينة مجانية</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={item.allowDownload}
                  onChange={(e) => updateItem(sectionId, item.id, { allowDownload: e.target.checked } as Partial<VideoItem>)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-green-600 transition-all duration-300"></div>
                <div className="absolute left-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">السماح بالتحميل</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderPdfItem = (sectionId: string, item: PdfItem, index: number, totalItems: number) => {
    return (
      <div key={item.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">ملف PDF</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => moveItemUp(sectionId, item.id)}
              disabled={index === 0}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="تحريك لأعلى"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={() => moveItemDown(sectionId, item.id)}
              disabled={index === totalItems - 1}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="تحريك لأسفل"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => removeItem(sectionId, item.id)}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              title="حذف"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان الملف</label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateItem(sectionId, item.id, { title: e.target.value } as Partial<PdfItem>)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
              placeholder="أدخل عنوان الملف"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">رفع ملف PDF</label>
            {!item.pdfFile ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all duration-300 group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="mb-2 text-base font-semibold text-gray-700">اسحب وأفلت ملف PDF هنا</p>
                  <p className="text-sm text-gray-500">أو انقر للتحديد من جهازك</p>
                  <p className="text-xs text-gray-400 mt-2">PDF حتى 50 ميجابايت</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePdfUpload(sectionId, item.id, file);
                  }}
                />
              </label>
            ) : (
              <div className="space-y-4">
                {item.status === 'uploading' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-900">جاري الرفع...</span>
                      <span className="text-sm font-semibold text-red-600">{item.uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-red-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {item.status === 'completed' && (
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1 truncate">{item.fileName}</h4>
                        <p className="text-sm text-gray-600 mb-3">{formatFileSize(item.fileSize)}</p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            تم الرفع بنجاح
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => updateItem(sectionId, item.id, { pdfFile: null, pdfUrl: '', fileName: '', fileSize: 0, status: 'idle' } as Partial<PdfItem>)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={item.allowDownload}
                  onChange={(e) => updateItem(sectionId, item.id, { allowDownload: e.target.checked } as Partial<PdfItem>)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-green-600 transition-all duration-300"></div>
                <div className="absolute left-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">السماح بالتحميل</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderQuizItem = (sectionId: string, item: QuizItem, index: number, totalItems: number) => {
    return (
      <div key={item.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">اختبار</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => moveItemUp(sectionId, item.id)}
              disabled={index === 0}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="تحريك لأعلى"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={() => moveItemDown(sectionId, item.id)}
              disabled={index === totalItems - 1}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="تحريك لأسفل"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => removeItem(sectionId, item.id)}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              title="حذف"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان الاختبار</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(sectionId, item.id, { title: e.target.value } as Partial<QuizItem>)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                placeholder="أدخل عنوان الاختبار"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف</label>
              <textarea
                value={item.description}
                onChange={(e) => updateItem(sectionId, item.id, { description: e.target.value } as Partial<QuizItem>)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none"
                placeholder="أدخل وصف الاختبار"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">المدة (دقيقة)</label>
              <input
                type="number"
                value={item.duration}
                onChange={(e) => updateItem(sectionId, item.id, { duration: parseInt(e.target.value) || 0 } as Partial<QuizItem>)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">درجة النجاح (%)</label>
              <input
                type="number"
                value={item.passingScore}
                onChange={(e) => updateItem(sectionId, item.id, { passingScore: parseInt(e.target.value) || 0 } as Partial<QuizItem>)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                placeholder="70"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">عدد المحاولات</label>
              <input
                type="number"
                value={item.maxAttempts}
                onChange={(e) => updateItem(sectionId, item.id, { maxAttempts: parseInt(e.target.value) || 1 } as Partial<QuizItem>)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                placeholder="3"
                min="1"
              />
            </div>
          </div>

          <div className="flex items-center gap-8 pt-4 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={item.isVisible}
                  onChange={(e) => updateItem(sectionId, item.id, { isVisible: e.target.checked } as Partial<QuizItem>)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 transition-all duration-300"></div>
                <div className="absolute left-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">مرئي للطلاب</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={item.isPublished}
                  onChange={(e) => updateItem(sectionId, item.id, { isPublished: e.target.checked } as Partial<QuizItem>)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-green-600 transition-all duration-300"></div>
                <div className="absolute left-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">منشور</span>
            </label>
          </div>

          <div className="pt-6 border-t-2 border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-gray-900">الأسئلة ({item.questions.length})</h4>
              <button
                onClick={() => addQuestion(sectionId, item.id)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                إضافة سؤال
              </button>
            </div>

            {item.questions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">لا توجد أسئلة بعد</p>
                <p className="text-sm text-gray-400 mt-1">انقر على "إضافة سؤال" لإنشاء السؤال الأول</p>
              </div>
            ) : (
              <div className="space-y-4">
                {item.questions.map((question, qIndex) => (
                  <div key={question.id} className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 text-white flex items-center justify-center font-bold shadow-md">
                          {qIndex + 1}
                        </div>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(sectionId, item.id, question.id, { type: e.target.value as 'multiple_choice' | 'true_false' })}
                          className="px-4 py-2 bg-white border border-purple-300 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                          <option value="multiple_choice">اختيار من متعدد</option>
                          <option value="true_false">صح أو خطأ</option>
                        </select>
                      </div>
                      <button
                        onClick={() => removeQuestion(sectionId, item.id, question.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">نص السؤال</label>
                        <input
                          type="text"
                          value={question.title}
                          onChange={(e) => updateQuestion(sectionId, item.id, question.id, { title: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                          placeholder="أدخل نص السؤال"
                        />
                      </div>

                      {question.type === 'multiple_choice' ? (
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700">الخيارات</label>
                          {question.choices.map((choice, cIndex) => (
                            <div key={cIndex} className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={`question_${question.id}_correct`}
                                checked={question.correctAnswer === cIndex}
                                onChange={() => updateQuestion(sectionId, item.id, question.id, { correctAnswer: cIndex })}
                                className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                              />
                              <input
                                type="text"
                                value={choice}
                                onChange={(e) => {
                                  const newChoices = [...question.choices];
                                  newChoices[cIndex] = e.target.value;
                                  updateQuestion(sectionId, item.id, question.id, { choices: newChoices });
                                }}
                                className="flex-1 px-4 py-3 bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                                placeholder={`الخيار ${cIndex + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700">الإجابة الصحيحة</label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-3 flex-1 bg-white border-2 border-purple-300 rounded-xl p-4 cursor-pointer hover:bg-purple-50 transition-colors">
                              <input
                                type="radio"
                                name={`question_${question.id}_tf`}
                                checked={question.correctAnswer === 0}
                                onChange={() => updateQuestion(sectionId, item.id, question.id, { correctAnswer: 0, choices: ['صح', 'خطأ', '', ''] })}
                                className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="font-semibold text-gray-700">صح</span>
                            </label>
                            <label className="flex items-center gap-3 flex-1 bg-white border-2 border-purple-300 rounded-xl p-4 cursor-pointer hover:bg-purple-50 transition-colors">
                              <input
                                type="radio"
                                name={`question_${question.id}_tf`}
                                checked={question.correctAnswer === 1}
                                onChange={() => updateQuestion(sectionId, item.id, question.id, { correctAnswer: 1, choices: ['صح', 'خطأ', '', ''] })}
                                className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="font-semibold text-gray-700">خطأ</span>
                            </label>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">النقاط</label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(sectionId, item.id, question.id, { points: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                          placeholder="10"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHomeworkItem = (sectionId: string, item: HomeworkItem, index: number, totalItems: number) => {
    return (
      <div key={item.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">واجب</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => moveItemUp(sectionId, item.id)}
              disabled={index === 0}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="تحريك لأعلى"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={() => moveItemDown(sectionId, item.id)}
              disabled={index === totalItems - 1}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="تحريك لأسفل"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => removeItem(sectionId, item.id)}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              title="حذف"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">عنوان الواجب</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(sectionId, item.id, { title: e.target.value } as Partial<HomeworkItem>)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                placeholder="أدخل عنوان الواجب"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">الوصف</label>
              <textarea
                value={item.description}
                onChange={(e) => updateItem(sectionId, item.id, { description: e.target.value } as Partial<HomeworkItem>)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none resize-none"
                placeholder="أدخل وصف الواجب"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ التسليم</label>
              <input
                type="datetime-local"
                value={item.dueDate}
                onChange={(e) => updateItem(sectionId, item.id, { dueDate: e.target.value } as Partial<HomeworkItem>)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الدرجة الكلية</label>
              <input
                type="number"
                value={item.totalScore}
                onChange={(e) => updateItem(sectionId, item.id, { totalScore: parseInt(e.target.value) || 0 } as Partial<HomeworkItem>)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                placeholder="100"
                min="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">تعليمات التسليم</label>
              <textarea
                value={item.instructions}
                onChange={(e) => updateItem(sectionId, item.id, { instructions: e.target.value } as Partial<HomeworkItem>)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none resize-none"
                placeholder="أدخل تعليمات التسليم للطلاب"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer group mb-6">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={item.allowLateSubmission}
                  onChange={(e) => updateItem(sectionId, item.id, { allowLateSubmission: e.target.checked } as Partial<HomeworkItem>)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-orange-600 transition-all duration-300"></div>
                <div className="absolute left-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">السماح بالتسليم المتأخر</span>
            </label>

            <div className="space-y-4">
              <h5 className="text-sm font-bold text-gray-900">المرفقات</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">مرفق PDF</label>
                  {!item.attachmentPdf ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 group">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-xs text-gray-500">رفع PDF</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleHomeworkAttachmentPdf(sectionId, item.id, file);
                        }}
                      />
                    </label>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-700 truncate">{item.attachmentPdf.name}</span>
                      </div>
                      <button
                        onClick={() => updateItem(sectionId, item.id, { attachmentPdf: null, attachmentPdfUrl: '' } as Partial<HomeworkItem>)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">مرفق صورة</label>
                  {!item.attachmentImage ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 group">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs text-gray-500">رفع صورة</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleHomeworkAttachmentImage(sectionId, item.id, file);
                        }}
                      />
                    </label>
                  ) : (
                    <div className="relative h-32 rounded-xl overflow-hidden border-2 border-orange-200 group">
                      <img
                        src={item.attachmentImageUrl}
                        alt="Attachment"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => updateItem(sectionId, item.id, { attachmentImage: null, attachmentImageUrl: '' } as Partial<HomeworkItem>)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h5 className="text-sm font-bold text-gray-900 mb-4">أنواع التسليم المسموحة</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={item.allowedSubmissionTypes.text}
                  onChange={(e) => updateItem(sectionId, item.id, {
                    allowedSubmissionTypes: { ...item.allowedSubmissionTypes, text: e.target.checked }
                  } as Partial<HomeworkItem>)}
                  className="w-5 h-5 text-orange-600 focus:ring-orange-500 rounded"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">نص</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={item.allowedSubmissionTypes.pdf}
                  onChange={(e) => updateItem(sectionId, item.id, {
                    allowedSubmissionTypes: { ...item.allowedSubmissionTypes, pdf: e.target.checked }
                  } as Partial<HomeworkItem>)}
                  className="w-5 h-5 text-orange-600 focus:ring-orange-500 rounded"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">PDF</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={item.allowedSubmissionTypes.image}
                  onChange={(e) => updateItem(sectionId, item.id, {
                    allowedSubmissionTypes: { ...item.allowedSubmissionTypes, image: e.target.checked }
                  } as Partial<HomeworkItem>)}
                  className="w-5 h-5 text-orange-600 focus:ring-orange-500 rounded"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">صورة</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={item.allowedSubmissionTypes.multipleFiles}
                  onChange={(e) => updateItem(sectionId, item.id, {
                    allowedSubmissionTypes: { ...item.allowedSubmissionTypes, multipleFiles: e.target.checked }
                  } as Partial<HomeworkItem>)}
                  className="w-5 h-5 text-orange-600 focus:ring-orange-500 rounded"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">ملفات متعددة</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-8 pt-4 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={item.isVisible}
                  onChange={(e) => updateItem(sectionId, item.id, { isVisible: e.target.checked } as Partial<HomeworkItem>)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 transition-all duration-300"></div>
                <div className="absolute left-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">مرئي للطلاب</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={item.isPublished}
                  onChange={(e) => updateItem(sectionId, item.id, { isPublished: e.target.checked } as Partial<HomeworkItem>)}
                  className="sr-only peer"
                />
                <div className="w-12 h-7 bg-gray-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-green-600 transition-all duration-300"></div>
                <div className="absolute left-0.5 top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">منشور</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderItem = (sectionId: string, item: CourseItem, index: number, totalItems: number) => {
    switch (item.type) {
      case 'video':
        return renderVideoItem(sectionId, item, index, totalItems);
      case 'pdf':
        return renderPdfItem(sectionId, item, index, totalItems);
      case 'quiz':
        return renderQuizItem(sectionId, item, index, totalItems);
      case 'homework':
        return renderHomeworkItem(sectionId, item, index, totalItems);
      default:
        return null;
    }
  };

  const renderAddItemDropdown = (sectionId: string) => {
    return (
      <div className="relative inline-block" ref={openDropdownId === sectionId ? dropdownRef : null}>
        <button
          onClick={() => setOpenDropdownId(openDropdownId === sectionId ? null : sectionId)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة عنصر
        </button>
        {openDropdownId === sectionId && (
          <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
            <button
              onClick={() => addItem(sectionId, 'video')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-right"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">فيديو</div>
                <div className="text-xs text-gray-500">إضافة محاضرة فيديو</div>
              </div>
            </button>
            <button
              onClick={() => addItem(sectionId, 'pdf')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-right"
            >
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">ملف PDF</div>
                <div className="text-xs text-gray-500">إضافة ملف قراءة</div>
              </div>
            </button>
            <button
              onClick={() => addItem(sectionId, 'quiz')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-right"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">اختبار</div>
                <div className="text-xs text-gray-500">إضافة اختبار تقييمي</div>
              </div>
            </button>
            <button
              onClick={() => addItem(sectionId, 'homework')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-right"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">واجب</div>
                <div className="text-xs text-gray-500">إضافة واجب منزلي</div>
              </div>
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <InstructorLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl font-semibold text-gray-700">جاري تحميل الدورة...</p>
            <p className="text-sm text-gray-500 mt-2">الرجاء الانتظار</p>
          </div>
        </div>
      </InstructorLayout>
    );
  }

  if (error || !course) {
    return (
      <InstructorLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">حدث خطأ</h2>
            <p className="text-gray-600 mb-6">{error || 'فشل تحميل الدورة'}</p>
            <button
              onClick={() => navigate('/instructor/courses')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg font-medium"
            >
              العودة إلى الدورات
            </button>
          </div>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
        <div
          className={`sticky top-0 z-50 transition-all duration-300 ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-gray-900/5'
              : 'bg-white'
          }`}
        >
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">تحرير الدورة</h1>
                <p className="text-gray-600">{course.title}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/instructor/courses')}
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm"
                >
                  العودة إلى الدورات
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-3 bg-white border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-400 transition-all font-medium shadow-sm"
                >
                  حذف الدورة
                </button>
                <button
                  onClick={saveCourse}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 font-semibold"
                >
                  حفظ التغييرات
                </button>
              </div>
            </div>

            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
                  activeTab === 'content'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                المحتوى
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
                  activeTab === 'settings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                الإعدادات
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          {activeTab === 'content' ? (
            <div className="space-y-8">
              {course.sections.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">لا توجد أقسام بعد</h3>
                  <p className="text-gray-600 mb-6">ابدأ ببناء محتوى دورتك بإضافة القسم الأول</p>
                  <button
                    onClick={addSection}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 font-semibold"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    إضافة قسم جديد
                  </button>
                </div>
              ) : (
                <>
                  {course.sections.map((section, sIndex) => (
                    <div key={section.id} className="bg-white rounded-3xl shadow-lg shadow-gray-900/5 overflow-hidden border border-gray-100">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/30">
                              {sIndex + 1}
                            </div>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => renameSection(section.id, e.target.value)}
                              className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-semibold text-lg"
                              placeholder="اسم القسم"
                            />
                          </div>
                          <div className="flex items-center gap-2 mr-4">
                            <button
                              onClick={() => moveSectionUp(section.id)}
                              disabled={sIndex === 0}
                              className="p-2.5 hover:bg-white/80 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="تحريك لأعلى"
                            >
                              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => moveSectionDown(section.id)}
                              disabled={sIndex === course.sections.length - 1}
                              className="p-2.5 hover:bg-white/80 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="تحريك لأسفل"
                            >
                              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => toggleSectionCollapse(section.id)}
                              className="p-2.5 hover:bg-white/80 rounded-lg transition-colors"
                              title={section.isCollapsed ? 'توسيع' : 'طي'}
                            >
                              <svg
                                className={`w-5 h-5 text-gray-700 transition-transform ${
                                  section.isCollapsed ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removeSection(section.id)}
                              className="p-2.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              title="حذف القسم"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {!section.isCollapsed && (
                        <div className="p-8 space-y-6">
                          {section.items.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </div>
                              <p className="text-gray-600 font-medium mb-4">لا توجد عناصر في هذا القسم</p>
                              {renderAddItemDropdown(section.id)}
                            </div>
                          ) : (
                            <>
                              {section.items.map((item, itemIndex) => (
                                <div key={item.id}>
                                  {renderItem(section.id, item, itemIndex, section.items.length)}
                                </div>
                              ))}

                              <div className="pt-4">
                                {renderAddItemDropdown(section.id)}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={addSection}
                    className="w-full py-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="text-lg font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                        إضافة قسم جديد
                      </span>
                    </div>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-lg shadow-gray-900/5 p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">إعدادات الدورة</h2>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">عنوان الدورة</label>
                  <input
                    type="text"
                    value={course.title}
                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-lg"
                    placeholder="أدخل عنوان الدورة"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">الوصف</label>
                  <textarea
                    value={course.description}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    rows={6}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                    placeholder="أدخل وصف الدورة"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">السعر</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={course.price}
                        onChange={(e) => setCourse({ ...course, price: parseFloat(e.target.value) || 0 })}
                        disabled={course.isFree}
                        className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-medium">ريال</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">المرحلة الدراسية</label>
                    <input
                      type="text"
                      value={course.grade}
                      onChange={(e) => setCourse({ ...course, grade: e.target.value })}
                      className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      placeholder="المرحلة الدراسية"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">صورة الدورة</label>
                  {!course.thumbnail ? (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="mb-2 text-lg font-semibold text-gray-700">اسحب وأفلت الصورة هنا</p>
                        <p className="text-sm text-gray-500">أو انقر للتحديد من جهازك</p>
                        <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF حتى 10 ميجابايت</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleThumbnailUpload(file);
                        }}
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 group">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => setCourse({ ...course, thumbnail: '', thumbnailFile: null })}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium"
                        >
                          حذف الصورة
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-200 space-y-6">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={course.isFree}
                        onChange={(e) => setCourse({ ...course, isFree: e.target.checked, price: e.target.checked ? 0 : course.price })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-gray-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-green-600 transition-all duration-300"></div>
                      <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-6"></div>
                    </div>
                    <div>
                      <span className="text-base font-semibold text-gray-900 group-hover:text-gray-700">دورة مجانية</span>
                      <p className="text-sm text-gray-500">اجعل هذه الدورة متاحة مجاناً للجميع</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={course.isPublished}
                        onChange={(e) => setCourse({ ...course, isPublished: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-gray-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 transition-all duration-300"></div>
                      <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-6"></div>
                    </div>
                    <div>
                      <span className="text-base font-semibold text-gray-900 group-hover:text-gray-700">منشور</span>
                      <p className="text-sm text-gray-500">جعل الدورة متاحة للطلاب</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={course.isHidden}
                        onChange={(e) => setCourse({ ...course, isHidden: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-gray-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-gray-500 peer-checked:to-gray-600 transition-all duration-300"></div>
                      <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-6"></div>
                    </div>
                    <div>
                      <span className="text-base font-semibold text-gray-900 group-hover:text-gray-700">مخفي</span>
                      <p className="text-sm text-gray-500">إخفاء الدورة من القائمة العامة</p>
                    </div>
                  </label>
                </div>

                <div className="pt-6 border-t-2 border-red-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">منطقة الخطر</h3>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 font-semibold"
                  >
                    حذف الدورة نهائياً
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">تأكيد الحذف</h3>
            <p className="text-gray-600 text-center mb-8">
              هل أنت متأكد من حذف هذه الدورة؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع المحتويات المرتبطة بها.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={deleteCourse}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-500/30 font-semibold"
              >
                حذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </InstructorLayout>
  );
}