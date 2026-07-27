import api from './api';

export const apiService = {
  // Health
  health: () => api.get('/health').then((r) => r.data),

  // Auth
  register: (data: any) => api.post('/auth/register', data).then((r) => r.data),
  login: (data: any) => api.post('/auth/login', data).then((r) => r.data),
  googleLogin: (credential: string) => api.post('/auth/google', { credential }).then((r) => r.data),
  getMe: () => api.get('/auth/me').then((r) => r.data),

  // Dashboard
  getDashboard: () => api.get('/dashboard').then((r) => r.data),

  // Tutor
  getTutorMessages: () => api.get('/tutor/messages').then((r) => r.data),
  sendTutorMessage: (content: string) => api.post('/tutor/chat', { content }).then((r) => r.data),
  clearTutorHistory: () => api.delete('/tutor/clear').then((r) => r.data),

  // Vocabulary
  getVocabulary: () => api.get('/vocabulary').then((r) => r.data),
  getDueVocabulary: () => api.get('/vocabulary/due').then((r) => r.data),
  addVocabulary: (data: { german: string; translation: string; example_sentence: string; cefr_level: string; category: string; lesson: string }) =>
    api.post('/vocabulary', data).then((r) => r.data),
  submitVocabReview: (word_id: number, is_correct: boolean) =>
    api.post('/vocabulary/review', { word_id, is_correct }).then((r) => r.data),
  generateVocabExample: (word: string, translation: string) =>
    api.post(`/vocabulary/generate-example?word=${encodeURIComponent(word)}&translation=${encodeURIComponent(translation)}`).then((r) => r.data),
  bulkGenerateVocabulary: (items: { german: string; translation?: string | null }[]) =>
    api.post('/vocabulary/bulk-generate', { items }).then((r) => r.data),
  bulkImportVocabulary: (words: { german: string; translation: string; example_sentence: string; cefr_level: string; category: string; lesson?: string }[]) =>
    api.post('/vocabulary/bulk-import', { words }).then((r) => r.data),

  // Grammar
  getGrammar: () => api.get('/grammar').then((r) => r.data),
  getGrammarTopic: (id: number) => api.get(`/grammar/${id}`).then((r) => r.data),
  toggleGrammarComplete: (id: number) => api.post(`/grammar/${id}/toggle-complete`).then((r) => r.data),
  submitGrammarQuiz: (topic_id: number, answers: Record<string, string>) =>
    api.post('/grammar/quiz', { topic_id, answers }).then((r) => r.data),

  // OCR
  uploadOCRImport: (formData: FormData) =>
    api.post('/ocr/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  // Homework
  uploadHomework: (formData: FormData) =>
    api.post('/homework/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  getHomeworkHistory: () => api.get('/homework/history').then((r) => r.data),

  // Progress
  getProgress: () => api.get('/progress').then((r) => r.data),
  updateProgress: (params: {
    current_lesson?: number;
    reading?: string;
    writing?: string;
    listening?: string;
    speaking?: string;
    grammar?: string;
    vocabulary?: string;
    weekly_goal?: number;
    ai_provider?: string;
    ai_model?: string;
  }) => api.post('/progress/update', null, { params }).then((r) => r.data),
  completeLessonSection: (lesson_number: number, section_name: string) =>
    api.post(`/progress/lesson/section?lesson_number=${lesson_number}&section_name=${section_name}`).then((r) => r.data),

  // Study Session Logging
  logStudySession: (data: {
    activity_type: string;
    xp_earned: number;
    duration_minutes?: number;
    lesson_number?: number;
  }) => api.post('/progress/log-session', data).then((r) => r.data),

  // Activity Chart
  getActivityData: () => api.get('/progress/activity').then((r) => r.data),

  // AI Connection Test
  testAIConnection: (provider: string, model: string | null = null) =>
    api.post('/ai/test-connection', { provider, model }).then((r) => r.data),

  // Exams
  generateExam: (exam_type: string) => api.post(`/exams/generate?exam_type=${exam_type}`).then((r) => r.data),
  submitExamResult: (data: {
    exam_type: string;
    title: string;
    score: number;
    correct_count: number;
    total_questions: number;
    lesson_number?: number;
    time_taken_seconds?: number;
    questions_json?: Record<string, any>;
  }) => api.post('/exams/submit', data).then((r) => r.data),
  getExamHistory: () => api.get('/exams/history').then((r) => r.data),

  // Reports
  getWeeklyReport: () => api.get('/reports/weekly').then((r) => r.data),

  // Curriculum
  getCurriculumBooks: () => api.get('/curriculum/books').then((r) => r.data),
  getCurriculumLessons: () => api.get('/curriculum/lessons').then((r) => r.data),
  getCurriculumLesson: (book_code: string, lesson_number: number) =>
    api.get(`/curriculum/lessons/${book_code}/${lesson_number}`).then((r) => r.data),
  seedCurriculum: () => api.post('/curriculum/seed').then((r) => r.data),
};
