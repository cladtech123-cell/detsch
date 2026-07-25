import api from './api';

/** Endpoints grouped by resource for the German Tutor application. */
export const apiService = {
  // Health
  health: () => api.get('/health').then((r) => r.data),

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

  // AI Connection Test
  testAIConnection: (provider: string, model: string | null = null) =>
    api.post('/ai/test-connection', { provider, model }).then((r) => r.data),

  // Exams
  generateExam: (exam_type: string) => api.post(`/exams/generate?exam_type=${exam_type}`).then((r) => r.data),

  // Reports
  getWeeklyReport: () => api.get('/reports/weekly').then((r) => r.data),
};
