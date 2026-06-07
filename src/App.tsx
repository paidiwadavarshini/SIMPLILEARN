import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ExplainerConfigurator } from './components/ExplainerConfigurator';
import { ExplainerOutput } from './components/ExplainerOutput';
import { ConceptExplanation, SavedExplanation } from './types';

export default function App() {
  const [activeTopic, setActiveTopic] = useState<string>("M2 Engineering Maths");
  const [explanation, setExplanation] = useState<ConceptExplanation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingTip, setLoadingTip] = useState<string>("");
  const [age, setAge] = useState<number>(14); // Defaults to 14 as requested by the user prompt
  const [analogyStyle, setAnalogyStyle] = useState<string>("magic and fantasy");
  
  // Local Notebook state
  const [savedExplanations, setSavedExplanations] = useState<SavedExplanation[]>([]);
  const [showNotebookOnly, setShowNotebookOnly] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<'up' | 'down' | null>(null);

  // Dynamic Theme (Light, Dark, Sepia Presets) & Reading focus presets
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('simplilearn_theme') as 'light' | 'dark' | 'sepia') || 'light';
    }
    return 'light';
  });
  const [focusMode, setFocusMode] = useState<boolean>(false);

  const themeStyles = {
    light: {
      bg: "bg-slate-50",
      text: "text-slate-900 border-slate-200",
      cardBg: "bg-white",
      cardText: "text-slate-700",
      cardBorder: "border-slate-200 hover:border-slate-300",
      subtitle: "text-slate-500",
      title: "text-slate-800",
      sidebarBg: "bg-white border-slate-200",
      headerBg: "bg-white border-slate-200",
      inputBg: "bg-slate-100 border-transparent text-slate-800 focus:bg-white focus:border-indigo-400"
    },
    dark: {
      bg: "bg-[#0a0f1d]", // rich obsidian
      text: "text-slate-100 border-slate-800",
      cardBg: "bg-slate-900/60",
      cardText: "text-slate-300",
      cardBorder: "border-slate-800 hover:border-slate-700",
      subtitle: "text-slate-400",
      title: "text-white",
      sidebarBg: "bg-[#0f172a] border-slate-800",
      headerBg: "bg-[#0f172a] border-slate-800",
      inputBg: "bg-slate-900 border-slate-800 text-slate-200 focus:bg-slate-900 focus:border-indigo-500"
    },
    sepia: {
      bg: "bg-[#f5efe6]", // creamy eye-friendly warm paper text
      text: "text-[#433422] border-[#e6d9c5]",
      cardBg: "bg-[#fcf8f2]", // clean textured cream
      cardText: "text-[#5c4a37]",
      cardBorder: "border-[#e6d9c5] hover:border-[#ebd2b1]",
      subtitle: "text-[#8a765e]",
      title: "text-[#433422]",
      sidebarBg: "bg-[#faf6f0] border-[#e6d9c5]",
      headerBg: "bg-[#faf6f0] border-[#e6d9c5]",
      inputBg: "bg-[#fcf8f2] border-[#e6d9c5] text-[#433422] focus:bg-[#fcf8f2] focus:border-[#ebd2b1]"
    }
  };

  const activeThemeStyle = themeStyles[theme];

  // Tips cycling reference
  const tipsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadingTips = [
    "Translating complex academic concepts into simple everyday terms...",
    "Polishing a creative and vivid analogy for rapid retention...",
    "Formulating a concise, high-contrast 3-to-8 sentence summary...",
    "Structuring step-by-step key takeaways for easy study...",
    "Refining age-appropriate syntax for immediate comprehension...",
    "Locating related curriculum topics for further self-led discovery...",
    "Securing AI-powered teacher validation layers..."
  ];

  // Load saved notebook on first mount
  useEffect(() => {
    const saved = localStorage.getItem('simplilearn_notebook');
    if (saved) {
      try {
        setSavedExplanations(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing saved notebook", e);
      }
    }

    // Automatically trigger initial explanation for "M2 Engineering Maths"
    handleExplain("M2 Engineering Maths", 14, "magic and fantasy");
  }, []);

  // Save notebook updates to localStorage
  const saveNotebook = (updated: SavedExplanation[]) => {
    setSavedExplanations(updated);
    localStorage.setItem('simplilearn_notebook', JSON.stringify(updated));
  };

  const handleExplain = async (topicToSearch: string, targetAge = age, style = analogyStyle) => {
    if (!topicToSearch || !topicToSearch.trim()) return;
    
    setIsLoading(true);
    setUserRating(null); // Reset rating for new topic
    
    // Cycle helpful loading tips every 2.5 seconds
    let tipIndex = 0;
    setLoadingTip(loadingTips[0]);
    if (tipsIntervalRef.current) clearInterval(tipsIntervalRef.current);
    tipsIntervalRef.current = setInterval(() => {
      tipIndex = (tipIndex + 1) % loadingTips.length;
      setLoadingTip(loadingTips[tipIndex]);
    }, 2500);

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToSearch.trim(),
          age: targetAge,
          analogyStyle: style
        })
      });

      if (!response.ok) {
        throw new Error("Failed to calculate explanation");
      }

      const data: ConceptExplanation = await response.json();
      setExplanation(data);
      setActiveTopic(data.topicName);
    } catch (err) {
      console.error("Explanation calculation failed:", err);
      // Fallback fallback is handled gracefully via the Express Mock endpoint responses
    } finally {
      setIsLoading(false);
      if (tipsIntervalRef.current) {
        clearInterval(tipsIntervalRef.current);
        tipsIntervalRef.current = null;
      }
    }
  };

  const handleSaveToNotebook = () => {
    if (!explanation) return;
    
    // Check if already saved
    if (savedExplanations.some(item => item.topicName.toLowerCase() === explanation.topicName.toLowerCase())) {
      return;
    }

    const newItem: SavedExplanation = {
      id: Date.now().toString(),
      topicName: explanation.topicName,
      savedAt: new Date().toISOString(),
      explanation: explanation
    };

    saveNotebook([...savedExplanations, newItem]);
  };

  const handleDeleteSaved = (id: string) => {
    const filtered = savedExplanations.filter(item => item.id !== id);
    saveNotebook(filtered);
  };

  const handleRate = (rating: 'up' | 'down') => {
    setUserRating(prev => prev === rating ? null : rating);
  };

  const handleUpdateSaved = (id: string, updatedFields: Partial<SavedExplanation>) => {
    const updated = savedExplanations.map(item => {
      if (item.id === id) {
        return { ...item, ...updatedFields };
      }
      return item;
    });
    saveNotebook(updated);
  };

  const handleSetTheme = (newTheme: 'light' | 'dark' | 'sepia') => {
    setTheme(newTheme);
    localStorage.setItem('simplilearn_theme', newTheme);
  };

  const isSaved = explanation 
    ? savedExplanations.some(item => item.topicName.toLowerCase() === explanation.topicName.toLowerCase()) 
    : false;

  return (
    <div className={`flex flex-col w-full h-screen font-sans transition-all duration-300 overflow-hidden ${activeThemeStyle.bg} ${activeThemeStyle.text}`}>
      {/* Header Bar */}
      <Header 
        onSearch={(topic) => handleExplain(topic, age, analogyStyle)} 
        onOpenNotebook={() => setShowNotebookOnly(true)}
        savedCount={savedExplanations.length}
        theme={theme}
        setTheme={handleSetTheme}
        focusMode={focusMode}
        setFocusMode={setFocusMode}
        themeStyle={activeThemeStyle}
      />

      {/* Main Layout Area */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        
        {/* Navigation Sidebar Drawer */}
        {!focusMode && (
          <Sidebar 
            currentExplanation={explanation}
            age={age}
            analogyStyle={analogyStyle}
            onSelectTopic={(topic) => handleExplain(topic, age, analogyStyle)}
            savedExplanations={savedExplanations}
            onDeleteSaved={handleDeleteSaved}
            onUpdateSaved={handleUpdateSaved}
            showNotebookOnly={showNotebookOnly}
            onToggleNotebookView={() => setShowNotebookOnly(prev => !prev)}
          />
        )}

        {/* Content Section */}
        <main className={`${focusMode ? "col-span-12 max-w-4xl mx-auto w-full px-4 md:px-12 py-8" : "col-span-9 p-8"} flex flex-col space-y-5 overflow-y-auto transition-all duration-300`}>
          
          {focusMode && (
            <div className={`shrink-0 flex items-center justify-between p-3.5 rounded-xl border ${activeThemeStyle.cardBorder} ${activeThemeStyle.cardBg} bg-amber-50/50`}>
              <div className="flex items-center space-x-2 text-amber-800">
                <span className="text-xs font-bold font-mono">ADHD Distraction-free Mode is Active</span>
              </div>
              <button
                onClick={() => setFocusMode(false)}
                className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Show Left Sidebar Topic Picker
              </button>
            </div>
          )}

          {/* Top Custom Configuration Toolbar */}
          <ExplainerConfigurator 
            age={age}
            setAge={(newAge) => {
              setAge(newAge);
              // Instantly re-explain with the updated age
              if (explanation) {
                handleExplain(explanation.topicName, newAge, analogyStyle);
              }
            }}
            analogyStyle={analogyStyle}
            setAnalogyStyle={(newStyle) => {
              setAnalogyStyle(newStyle);
              // Instantly re-explain with the updated style
              if (explanation) {
                handleExplain(explanation.topicName, age, newStyle);
              }
            }}
            onExplainAgain={() => {
              if (explanation) {
                handleExplain(explanation.topicName, age, analogyStyle);
              }
            }}
            activeTopic={activeTopic}
            isLoading={isLoading}
            themeStyle={activeThemeStyle}
          />

          {/* Interactive Card Explanations Blocks */}
          <ExplainerOutput 
            explanation={explanation}
            isLoading={isLoading}
            loadingTip={loadingTip}
            isSaved={isSaved}
            onSave={handleSaveToNotebook}
            onRate={handleRate}
            userRating={userRating}
            themeStyle={activeThemeStyle}
            activeAge={age}
          />
          
        </main>

      </div>
    </div>
  );
}
