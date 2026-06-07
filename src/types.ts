export interface ConceptExplanation {
  topicName: string;
  subjectName?: string; // e.g. "Science", "Tech", "Math", "History"
  coreIdea: string;
  analogyTitle: string;
  analogy: string;
  summaryText: string;
  keyPoints: string[];
  similarTopics: string[];
  _apiFallbackUsed?: boolean;
  _cached?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface InteractiveData {
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
  _apiFallbackUsed?: boolean;
  _cached?: boolean;
}

export interface SavedExplanation {
  id: string;
  topicName: string;
  savedAt: string;
  explanation: ConceptExplanation;
  customNotes?: string;
  interactiveData?: InteractiveData; // Option to persist interactive quizzes/flashcards with the note
}
