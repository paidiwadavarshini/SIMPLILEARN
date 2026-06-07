import { Settings, Users, Orbit } from 'lucide-react';

interface ExplainerConfiguratorProps {
  age: number;
  setAge: (age: number) => void;
  analogyStyle: string;
  setAnalogyStyle: (style: string) => void;
  onExplainAgain: () => void;
  activeTopic: string;
  isLoading: boolean;
  themeStyle: any;
}

export function ExplainerConfigurator({
  age,
  setAge,
  analogyStyle,
  setAnalogyStyle,
  onExplainAgain,
  activeTopic,
  isLoading,
  themeStyle
}: ExplainerConfiguratorProps) {
  
  const ages = [
    { value: 10, label: "Child (10)" },
    { value: 14, label: "Teen (14)" },
    { value: 18, label: "Student (18)" },
    { value: 25, label: "Pro (25)" }
  ];

  const styles = [
    { value: 'relatable', label: '🏡 Everyday' },
    { value: 'video games', label: '🎮 Games' },
    { value: 'magic and fantasy', label: '✨ Magic' },
    { value: 'sports', label: '⚽ Sports' },
    { value: 'cooking & recipes', label: '🍳 Kitchen' }
  ];

  return (
    <div className={`p-4 rounded-2xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 transition-all duration-300 ${themeStyle.cardBg} ${themeStyle.cardBorder}`}>
      <div className="flex flex-wrap items-center gap-6">
        
        {/* Age Level Picker */}
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-indigo-600/10 border border-indigo-600/20 rounded-lg text-indigo-600 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className={`text-[10px] uppercase tracking-wider font-bold font-display ${themeStyle.subtitle}`}>Target Audience</span>
            <div className="flex space-x-1 mt-1 flex-wrap gap-y-1">
              {ages.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setAge(item.value)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    age === item.value
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Vertical divider on desktop */}
        <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-slate-800"></div>

        {/* Analogy Theme Selection */}
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600 shrink-0">
            <Orbit className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className={`text-[10px] uppercase tracking-wider font-bold font-display ${themeStyle.subtitle}`}>Analogy Theme</span>
            <div className="flex space-x-1 mt-1 overflow-x-auto max-w-[280px] md:max-w-none pr-1 flex-wrap gap-y-1">
              {styles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => setAnalogyStyle(style.value)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    analogyStyle === style.value
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Recalculate Trigger Option */}
      <button
        onClick={onExplainAgain}
        disabled={isLoading || !activeTopic}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
      >
        <Settings className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        <span>Update Explanation</span>
      </button>
    </div>
  );
}
