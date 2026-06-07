import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Award, 
  BookOpen,
  Volume2,
  BookmarkCheck
} from 'lucide-react';
import { QuizQuestion, Flashcard, InteractiveData } from '../types';

interface InteractiveStudyBoxProps {
  topicName: string;
  summaryText: string;
  themeStyle: any;
  activeAge: number;
}

export function InteractiveStudyBox({
  topicName,
  summaryText,
  themeStyle,
  activeAge
}: InteractiveStudyBoxProps) {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz'>('flashcards');
  const [interactiveData, setInteractiveData] = useState<InteractiveData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Flashcards UI state
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredCards, setMasteredCards] = useState<number[]>([]);

  // Quiz UI state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<number, number>>({}); // questionIndex -> selectedIndex
  const [showQuizResults, setShowQuizResults] = useState<boolean>(false);

  // Trigger material generation
  const handleGenerate = async () => {
    setLoading(true);
    setErrorCode(null);
    try {
      const response = await fetch('/api/interactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicName,
          summaryText: summaryText,
          age: activeAge
        })
      });

      if (!response.ok) {
        throw new Error("Failed to load materials");
      }

      const data: InteractiveData = await response.json();
      setInteractiveData(data);
      // Reset game states
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setMasteredCards([]);
      setCurrentQuestionIndex(0);
      setSelectedOptionIndex(null);
      setQuizScore(0);
      setAnsweredQuestions({});
      setShowQuizResults(false);
    } catch (err: any) {
      console.error("AI Material generation error:", err);
      setErrorCode("Failed to synthesize the quiz/flashcard deck. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  // Reset interactive states
  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setQuizScore(0);
    setAnsweredQuestions({});
    setShowQuizResults(false);
  };

  const handleResetFlashcards = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setMasteredCards([]);
  };

  const currentFlashcard = interactiveData?.flashcards?.[currentCardIndex];
  const currentQuiz = interactiveData?.quiz?.[currentQuestionIndex];

  // Grade calculators based on score
  const getScoreGrade = (score: number) => {
    if (score === 5) return { text: "AI Certified Educator: Perfect A+!", description: "You mastered every single element of this topic. Sensational!", color: "text-emerald-500", banner: "bg-emerald-50 border-emerald-200" };
    if (score >= 4) return { text: "Outstanding: Grade A!", description: "Brilliant effort! You represent the top bracket of concept understanders.", color: "text-indigo-500", banner: "bg-indigo-50 border-indigo-200" };
    if (score >= 3) return { text: "Good: Grade B", description: "Nice job! You understand the foundational mechanisms perfectly.", color: "text-amber-500", banner: "bg-amber-50 border-amber-200" };
    return { text: "Need Review: Grade C", description: "A great start, but flipping through the flashcards or analogies will clarify doubts!", color: "text-red-500", banner: "bg-red-50 border-red-200" };
  };

  return (
    <div className={`p-6 rounded-2xl border ${themeStyle.cardBorder} ${themeStyle.cardBg} transition-all duration-300 shadow`}>
      {/* Header Topic Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-5 border-slate-100 dark:border-slate-800 space-y-3.5 md:space-y-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`font-bold font-display text-sm tracking-tight ${themeStyle.title}`}>
              Interactive AI Learning Kit
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Build fast recall through tailored quizzes & flashcards</p>
          </div>
        </div>

        {interactiveData && (
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/50 max-w-xs overflow-hidden shrink-0">
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'flashcards'
                  ? "bg-white dark:bg-slate-700 shadow-xs text-indigo-600 dark:text-indigo-200"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'quiz'
                  ? "bg-white dark:bg-slate-700 shadow-xs text-indigo-600 dark:text-indigo-200"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Quiz
            </button>
          </div>
        )}
      </div>

      {/* State A: Materials Not Created Yet */}
      {!interactiveData && !loading && (
        <div className="flex flex-col items-center justify-center text-center py-8 px-4 space-y-4">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/40 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-100/30">
            <BookOpen className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className={`text-sm font-bold font-display ${themeStyle.title}`}>Ready to transition into testing yourself?</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Generate a fast 5-card digital flashcard deck and a matching custom multi-mode feedback quiz tailored to this active concept.
            </p>
          </div>
          {errorCode && <p className="text-xs text-red-500 font-semibold">{errorCode}</p>}
          <button
            onClick={handleGenerate}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.02] flex items-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Interactive Materials</span>
          </button>
        </div>
      )}

      {/* State B: Loading Synthesis Spinner */}
      {loading && (
        <div className="flex flex-col items-center justify-center text-center py-12 space-y-4 animate-fade-in">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
          </div>
          <div className="space-y-1.5 max-w-sm">
            <p className={`text-xs font-bold leading-none ${themeStyle.title}`}>Synthesizing pedagogical metrics...</p>
            <p className="text-[10px] text-slate-400 font-medium italic">
              "Mapping summaries into game logic parameters..."
            </p>
          </div>
        </div>
      )}

      {/* State C: Loaded Materials rendering */}
      {interactiveData && !loading && (
        <div className="animate-fade-in min-h-[220px] flex flex-col justify-between">
          {interactiveData._apiFallbackUsed && (
            <div className="mb-3 p-2 border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/40 rounded-xl text-[10px] text-amber-700 dark:text-amber-300 font-medium">
              💡 <strong>Instant Study Set Activated:</strong> Showing highly relevant localized learning cards & quiz due to cloud rate limiting.
            </div>
          )}
          
          {/* TAB 1: FLASHCARDS SECTION */}
          {activeTab === 'flashcards' && currentFlashcard && (
            <div className="flex flex-col space-y-5">
              {/* Card Meta details */}
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-widest shrink-0">
                <span>Memory Deck</span>
                <span>Card {currentCardIndex + 1} of {interactiveData.flashcards.length}</span>
              </div>

              {/* Main Flipper Box */}
              <button
                onClick={() => setIsFlipped(prev => !prev)}
                className={`relative w-full h-44 rounded-2xl border text-left p-6 transition-all duration-350 transform cursor-pointer flex flex-col justify-between focus:outline-none focus:ring-1 focus:ring-indigo-100 ${
                  isFlipped 
                    ? "bg-amber-50/40 border-amber-200/60 dark:bg-amber-950/10 dark:border-amber-900/60 shadow-sm" 
                    : "bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700/80 hover:bg-slate-100/50"
                }`}
              >
                {/* Badge Indicator front vs back */}
                <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-extrabold self-start ${
                  isFlipped 
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                    : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                }`}>
                  {isFlipped ? "Answer / Back" : "Term / Front"}
                </span>

                {/* Content */}
                <div className="my-auto text-center px-4">
                  {isFlipped ? (
                    <p className={`text-sm italic font-sans leading-relaxed text-amber-950 dark:text-orange-200`}>
                      "{currentFlashcard.back}"
                    </p>
                  ) : (
                    <h4 className={`text-base font-extrabold font-display leading-tight tracking-tight ${themeStyle.title}`}>
                      {currentFlashcard.front}
                    </h4>
                  )}
                </div>

                {/* Instructions */}
                <span className="text-[9px] text-slate-400 self-center font-bold font-mono">
                  Click card to flip
                </span>
              </button>

              {/* Mastering Checkbox & Side Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    const isMastered = masteredCards.includes(currentCardIndex);
                    if (isMastered) {
                      setMasteredCards(prev => prev.filter(i => i !== currentCardIndex));
                    } else {
                      setMasteredCards(prev => [...prev, currentCardIndex]);
                    }
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                    masteredCards.includes(currentCardIndex)
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-transparent border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>
                    {masteredCards.includes(currentCardIndex) ? "Mastered!" : "Mark as Mastered"}
                  </span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={currentCardIndex === 0}
                    onClick={() => {
                      setCurrentCardIndex(prev => prev - 1);
                      setIsFlipped(false);
                    }}
                    className={`p-1.5 rounded-lg border border-slate-200 text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors ${
                      currentCardIndex === 0 ? "opacity-30 pointer-events-none" : ""
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {currentCardIndex + 1} / {interactiveData.flashcards.length}
                  </span>
                  <button
                    disabled={currentCardIndex === interactiveData.flashcards.length - 1}
                    onClick={() => {
                      setCurrentCardIndex(prev => prev + 1);
                      setIsFlipped(false);
                    }}
                    className={`p-1.5 rounded-lg border border-slate-200 text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors ${
                      currentCardIndex === interactiveData.flashcards.length - 1 ? "opacity-30 pointer-events-none" : ""
                    }`}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Master progress bar banner */}
              <div className="space-y-1 shrink-0">
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>Progress toward total topic mastery</span>
                  <span>{masteredCards.length} of {interactiveData.flashcards.length} cards</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${(masteredCards.length / interactiveData.flashcards.length) * 100}%` }}
                  />
                </div>
                {masteredCards.length === interactiveData.flashcards.length && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center space-x-2.5 mt-1.5 animate-bounce">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] text-emerald-800 font-bold">Outstanding! You have mastered all 5 memory cubes! Give yourself a high-five.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE QUIZ SECTION */}
          {activeTab === 'quiz' && currentQuiz && (
            <div className="flex flex-col space-y-4">
              {!showQuizResults ? (
                <div className="space-y-4">
                  {/* Meta */}
                  <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-widest shrink-0">
                    <span>Active Challenge</span>
                    <span>Q {currentQuestionIndex + 1} of {interactiveData.quiz.length}</span>
                  </div>

                  {/* Question Prompt */}
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 rounded bg-indigo-50 border border-indigo-100 flex items-center justify-center font-display text-xs font-bold text-indigo-600 shrink-0 mt-0.5">
                      Q
                    </div>
                    <h4 className={`text-sm font-bold font-sans leading-relaxed ${themeStyle.title}`}>
                      {currentQuiz.question}
                    </h4>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2">
                    {currentQuiz.options.map((option, idx) => {
                      const isAnswered = answeredQuestions[currentQuestionIndex] !== undefined;
                      const userSelection = answeredQuestions[currentQuestionIndex];
                      const isSelectedOption = userSelection === idx;
                      const isCorrectOption = idx === currentQuiz.correctAnswerIndex;

                      let rowStyle = "border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50";
                      let radioIcon = <div className="w-4 h-4 rounded-full border border-slate-300 bg-white" />;

                      if (isAnswered) {
                        if (isCorrectOption) {
                          rowStyle = "border-emerald-300 bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900";
                          radioIcon = <CheckCircle className="w-4 h-4 text-emerald-600" />;
                        } else if (isSelectedOption) {
                          rowStyle = "border-red-300 bg-red-50/40 text-red-800 dark:bg-red-950/20 dark:border-red-900";
                          radioIcon = <XCircle className="w-4 h-4 text-red-600" />;
                        } else {
                          rowStyle = "border-slate-100 bg-slate-50/50 opacity-60";
                        }
                      } else {
                        // Not answered yet but hoverable
                        rowStyle = "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/10 cursor-pointer";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isAnswered}
                          onClick={() => {
                            // Record answer
                            const scoreAdd = idx === currentQuiz.correctAnswerIndex ? 1 : 0;
                            setQuizScore(prev => prev + scoreAdd);
                            setAnsweredQuestions(prev => ({ ...prev, [currentQuestionIndex]: idx }));
                          }}
                          className={`w-full text-left p-3 border rounded-xl flex items-center space-x-3 transition-all ${rowStyle}`}
                        >
                          {radioIcon}
                          <span className="text-xs font-medium font-sans">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* AI Feedback explanation block */}
                  {answeredQuestions[currentQuestionIndex] !== undefined && (
                    <div className="p-4 bg-indigo-50/80 rounded-xl border border-indigo-100/50 shrink-0 space-y-1 animate-fade-in text-indigo-900">
                      <div className="flex items-center space-x-1">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">AI Explanation</span>
                      </div>
                      <p className="text-[11px] leading-relaxed font-sans font-medium italic">
                        {currentQuiz.explanation}
                      </p>
                    </div>
                  )}

                  {/* Bottom Navigation Control */}
                  <div className="flex justify-end pt-1">
                    {answeredQuestions[currentQuestionIndex] !== undefined && (
                      <button
                        onClick={() => {
                          if (currentQuestionIndex === interactiveData.quiz.length - 1) {
                            setShowQuizResults(true);
                          } else {
                            setCurrentQuestionIndex(prev => prev + 1);
                          }
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center space-x-1.5"
                      >
                        <span>{currentQuestionIndex === interactiveData.quiz.length - 1 ? "Calculate Grade" : "Next Question"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                /* Results card view */
                <div className="flex flex-col items-center justify-center text-center py-6 px-4 space-y-5 animate-fade-in">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-100">
                    <Award className="w-8 h-8 animate-bounce" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className={`text-base font-extrabold font-display ${themeStyle.title}`}>Quiz Completed!</h3>
                    <p className={`text-2xl font-black ${getScoreGrade(quizScore).color}`}>
                      {quizScore} / 5 Correct Answers
                    </p>
                    
                    <div className={`p-4 rounded-xl border text-[11px] leading-relaxed ${getScoreGrade(quizScore).banner} font-bold max-w-sm mx-auto`}>
                      <span className="uppercase tracking-widest text-[9px] block text-slate-400 mb-1">Grade Summary</span>
                      <p className={`text-xs font-black ${getScoreGrade(quizScore).color} mb-1`}>{getScoreGrade(quizScore).text}</p>
                      <p className="text-[11px] text-slate-600 leading-normal">{getScoreGrade(quizScore).description}</p>
                    </div>
                  </div>

                  <div className="flex space-x-3.5">
                    <button
                      onClick={handleResetQuiz}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 hover:scale-[1.01] transition-transform text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Quiz</span>
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Sync Fresh Quiz</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
