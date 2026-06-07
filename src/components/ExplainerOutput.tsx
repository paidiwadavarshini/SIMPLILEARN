import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Share2, Volume2, VolumeX, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ConceptExplanation } from '../types';
import { InteractiveStudyBox } from './InteractiveStudyBox';

interface ExplainerOutputProps {
  explanation: ConceptExplanation | null;
  isLoading: boolean;
  loadingTip: string;
  isSaved: boolean;
  onSave: () => void;
  onRate: (rating: 'up' | 'down') => void;
  userRating: 'up' | 'down' | null;
  themeStyle: any;
  activeAge: number;
}

export function ExplainerOutput({
  explanation,
  isLoading,
  loadingTip,
  isSaved,
  onSave,
  onRate,
  userRating,
  themeStyle,
  activeAge,
}: ExplainerOutputProps) {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynth, setSpeechSynth] = useState<SpeechSynthesis | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynth(window.speechSynthesis);
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop reading if concept changes or unmounts
  useEffect(() => {
    if (speechSynth) {
      speechSynth.cancel();
      setIsPlaying(false);
    }
  }, [explanation, speechSynth]);

  const handleShare = () => {
    if (!explanation) return;
    const shareText = `📚 SimpliLearn Concept Explainer: ${explanation.topicName}\n\n💡 Core Idea: ${explanation.coreIdea}\n\n✨ Analogy (${explanation.analogyTitle}): ${explanation.analogy}\n\n📝 Summary: ${explanation.summaryText}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleSpeech = () => {
    if (!explanation || !speechSynth) return;

    if (isPlaying) {
      speechSynth.cancel();
      setIsPlaying(false);
    } else {
      const textToRead = `${explanation.topicName}. The core idea is: ${explanation.coreIdea}. Now, let's explore an analogy called ${explanation.analogyTitle}: ${explanation.analogy}. In a nutshell: ${explanation.summaryText}`;
      const newUtterance = new SpeechSynthesisUtterance(textToRead);
      
      newUtterance.onend = () => {
        setIsPlaying(false);
      };
      newUtterance.onerror = () => {
        setIsPlaying(false);
      };

      setUtterance(newUtterance);
      setIsPlaying(true);
      speechSynth.speak(newUtterance);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-12 px-6">
        {/* Animated Loading Skeleton Pulsing */}
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
        </div>
        
        <div className="text-center max-w-md space-y-2 animate-pulse">
          <h3 className="text-lg font-bold text-slate-800">Simplifying concepts for you...</h3>
          <p className="text-sm text-slate-500 min-h-[40px] font-medium italic">
            {loadingTip || "Running STEM optimization parameters..."}
          </p>
        </div>

        {/* Outer Skeleton Mock cards */}
        <div className="w-full max-w-4xl grid grid-cols-2 gap-6 opacity-30 pointer-events-none mt-4">
          <div className="bg-white h-44 rounded-2xl border border-slate-200 p-6 space-y-3">
            <div className="h-4 bg-slate-300 rounded w-1/3"></div>
            <div className="h-3 bg-slate-200 rounded w-full"></div>
            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
            <div className="h-3 bg-slate-200 rounded w-4/5"></div>
          </div>
          <div className="bg-white h-44 rounded-2xl border border-slate-200 p-6 space-y-3">
            <div className="h-4 bg-slate-300 rounded w-1/4"></div>
            <div className="h-3 bg-slate-200 rounded w-full"></div>
            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
            <div className="h-3 bg-slate-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8 text-center bg-slate-50/50 rounded-2xl">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Ready to Learn?</h3>
        <p className="text-sm text-slate-500 max-w-md">
          Type any study concept (such as "M2 Engineering Maths", "Quantum Physics", "Blockchain") above to translate it instantly into a fun, relatable analogy with strict summaries.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-2 animate-fade-in">
      {/* Fallback Warning / Notification Banner */}
      {explanation._apiFallbackUsed && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-start space-x-2.5 shadow-xs animate-pulse text-amber-900 dark:text-amber-300">
          <span className="text-base">💡</span>
          <div className="text-[11px] leading-relaxed">
            <span className="font-extrabold uppercase tracking-wide block text-[9px] mb-0.5">Offline Study Assistant Active</span>
            Gemini free-tier quota is currently exhausted. We have successfully prepared deep-dive offline study guides, matching analogies, memory decks, and quizzes so you can keep studying without interruption!
          </div>
        </div>
      )}

      {/* Subject Badge & Active Concept Breadcrumb */}
      <div className="flex items-center space-x-3 shrink-0 bg-slate-100/60 p-2.5 px-4 rounded-xl border border-slate-200/40">
        <span className="text-[9px] bg-indigo-600 text-white font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-md shadow-xs shadow-indigo-100">
          {explanation.subjectName || "Multi-Disciplinary"}
        </span>
        <span className="text-xs text-slate-300 font-semibold">/</span>
        <span className="text-xs text-slate-600 font-bold font-sans">Active concept: <span className="text-slate-900 font-extrabold">{explanation.topicName}</span></span>
      </div>

      {/* Top Section: Simple Terms and Analogies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 shrink-0">
        
        {/* Core Idea Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col">
          <div className="flex items-center space-x-2.5 mb-4">
            <div className="w-2.5 h-6 bg-blue-500 rounded-full shadow-sm shadow-blue-200"></div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs font-display">The Core Idea</h3>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed flex-1 font-sans">
            {explanation.coreIdea}
          </p>
        </div>

        {/* Fun Analogy Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-6 bg-amber-500 rounded-full shadow-sm shadow-amber-200"></div>
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-xs font-display">The Magic Analogy</h3>
            </div>
            {speechSynth && (
              <button
                onClick={toggleSpeech}
                title={isPlaying ? "Stop listening" : "Listen to explanation"}
                className={`p-1.5 rounded-lg border transition-all flex items-center space-x-1 text-xs font-medium cursor-pointer ${
                  isPlaying 
                    ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {isPlaying ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Read Aloud</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="flex-1 bg-amber-50/50 border border-amber-100/70 rounded-xl p-4 flex flex-col justify-center">
            <h4 className="text-xs font-bold text-amber-800 mb-1.5 uppercase tracking-wide">
              {explanation.analogyTitle}
            </h4>
            <p className="text-amber-900/90 text-sm italic leading-relaxed font-sans">
              "{explanation.analogy}"
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section: Summary Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden hover:border-slate-300 transition-all">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs font-display">Summary: In a Nutshell</h3>
          <span className="text-[10px] bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">AI VERIFIED</span>
        </div>
        <div className="p-6 lg:p-8 flex flex-col space-y-6">
          
          {/* Main 3 to 8 sentence summary blocks */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-100 rounded-full"></div>
            <p className="text-base text-slate-700 leading-relaxed font-sans pl-5 italic">
              "{explanation.summaryText}"
            </p>
          </div>

          <div className="h-px bg-slate-100"></div>

          {/* Key Bullet Breakdowns */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Key Takeaways</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {explanation.keyPoints.map((point, index) => (
                <div key={index} className="flex items-start space-x-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100/50 hover:bg-slate-50 hover:border-slate-200 transition-all">
                  <div className="shrink-0 w-6 h-6 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center font-bold text-xs text-indigo-600 font-display">
                    {index + 1}
                  </div>
                  <p className="text-slate-600 text-xs leading-normal font-sans">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Interactive AI Quizzes & Flashcards Learning Kit Box */}
      <InteractiveStudyBox 
        topicName={explanation.topicName} 
        summaryText={explanation.summaryText} 
        themeStyle={themeStyle} 
        activeAge={activeAge} 
      />

      {/* Footer controls: Save, Share, Rating states */}
      <div className="shrink-0 flex items-center justify-between py-3">
        <div className="flex space-x-2.5">
          <button
            onClick={onSave}
            disabled={isSaved}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg shadow-xs flex items-center space-x-2 transition-all cursor-pointer ${
              isSaved
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? "Saved to Notebook" : "Save to Notebook"}</span>
          </button>

          <button
            onClick={handleShare}
            className={`px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-all flex items-center space-x-2 cursor-pointer`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied Shareable Info!" : "Share Explainer"}</span>
          </button>
        </div>

        <div className="flex items-center space-x-3.5">
          <span className="text-xs font-medium text-slate-400">Did this help?</span>
          <div className="flex space-x-1.5">
            <button
              onClick={() => onRate('up')}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                userRating === 'up'
                  ? "bg-green-100 border-green-300 text-green-700 animate-pulse"
                  : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onRate('down')}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                userRating === 'down'
                  ? "bg-red-100 border-red-300 text-red-700 animate-pulse"
                  : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
