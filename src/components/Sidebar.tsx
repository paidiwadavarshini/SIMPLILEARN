import React, { useState } from 'react';
import { 
  Book, 
  ChevronRight, 
  GraduationCap, 
  Trash2, 
  Atom, 
  Cpu, 
  Calculator, 
  History as HistoryIcon, 
  Palette, 
  CircleDollarSign,
  Sparkles,
  Edit,
  Download,
  Printer,
  Save,
  Check
} from 'lucide-react';
import { ConceptExplanation, SavedExplanation } from '../types';

interface SidebarProps {
  currentExplanation: ConceptExplanation | null;
  age: number;
  analogyStyle: string;
  onSelectTopic: (topic: string) => void;
  savedExplanations: SavedExplanation[];
  onDeleteSaved: (id: string) => void;
  onUpdateSaved: (id: string, updated: Partial<SavedExplanation>) => void;
  showNotebookOnly: boolean;
  onToggleNotebookView: () => void;
}

export function Sidebar({
  currentExplanation,
  age,
  analogyStyle,
  onSelectTopic,
  savedExplanations,
  onDeleteSaved,
  onUpdateSaved,
  showNotebookOnly,
  onToggleNotebookView
}: SidebarProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('math');
  const [activeNoteEditId, setActiveNoteEditId] = useState<string | null>(null);
  const [editedNotes, setEditedNotes] = useState<string>('');
  const [savedIndicatorId, setSavedIndicatorId] = useState<string | null>(null);

  const SUBJECTS = [
    {
      id: 'math',
      name: 'Mathematics',
      icon: Calculator,
      color: 'text-indigo-600 border-indigo-100 bg-indigo-50/50',
      activeColor: 'bg-indigo-600 text-white border-indigo-600',
      hoverColor: 'hover:bg-indigo-50/40 hover:text-indigo-700',
      topics: ["M2 Engineering Maths", "Fourier Series", "Laplace Transforms", "Bayes Theorem", "Infinity & Cantor's Sets"]
    },
    {
      id: 'science',
      name: 'Science & Physics',
      icon: Atom,
      color: 'text-emerald-700 border-emerald-100 bg-emerald-50/50',
      activeColor: 'bg-emerald-600 text-white border-emerald-600',
      hoverColor: 'hover:bg-emerald-50/40 hover:text-emerald-700',
      topics: ["Quantum Entanglement", "Photosynthesis", "Tectonic Plate Drift", "Black Holes", "CRISPR Gene Editing"]
    },
    {
      id: 'tech',
      name: 'Coding & Tech',
      icon: Cpu,
      color: 'text-violet-600 border-violet-100 bg-violet-50/50',
      activeColor: 'bg-violet-600 text-white border-violet-600',
      hoverColor: 'hover:bg-violet-50/40 hover:text-violet-700',
      topics: ["How Web Servers Work", "Blockchain & Bitcoin", "Recursion & Call Stack", "Neural Networks", "Cloud Computing"]
    },
    {
      id: 'history',
      name: 'History & Society',
      icon: HistoryIcon,
      color: 'text-amber-700 border-amber-100 bg-amber-50/50',
      activeColor: 'bg-amber-600 text-white border-amber-600',
      hoverColor: 'hover:bg-amber-50/40 hover:text-amber-700',
      topics: ["The French Revolution", "Industrial Revolution", "Magna Carta", "Apollo Moon Landing", "Feudalism"]
    },
    {
      id: 'literature',
      name: 'Literature & Art',
      icon: Palette,
      color: 'text-rose-600 border-rose-100 bg-rose-50/50',
      activeColor: 'bg-rose-600 text-white border-rose-600',
      hoverColor: 'hover:bg-rose-50/40 hover:text-rose-700',
      topics: ["Macbeth & Shakespeare", "Impressionist Painting", "The Hero's Journey", "Greek Mythology", "Metaphor & Symbolism"]
    },
    {
      id: 'economics',
      name: 'Economics / Finance',
      icon: CircleDollarSign,
      color: 'text-sky-600 border-sky-100 bg-sky-50/50',
      activeColor: 'bg-sky-600 text-white border-sky-600',
      hoverColor: 'hover:bg-sky-50/40 hover:text-sky-700',
      topics: ["How Inflation Works", "Central Banks & Money", "Supply and Demand", "Stock Market Basics", "Compound Interest"]
    }
  ];

  const activeSubject = SUBJECTS.find(s => s.id === selectedSubjectId) || SUBJECTS[0];

  return (
    <aside className="col-span-3 shrink-0 border-r border-slate-200 bg-white p-5 flex flex-col h-full overflow-hidden">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 mb-5 shrink-0">
        <button
          onClick={onToggleNotebookView}
          className={`flex-1 pb-3 text-xs uppercase tracking-wider font-bold text-center transition-all border-b-2 ${
            !showNotebookOnly
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-800"
          }`}
        >
          Explore Topics
        </button>
        <button
          onClick={onToggleNotebookView}
          className={`flex-1 pb-3 text-xs uppercase tracking-wider font-bold text-center transition-all border-b-2 ${
            showNotebookOnly
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-800"
          }`}
        >
          My Notebook ({savedExplanations.length})
        </button>
      </div>

      {!showNotebookOnly ? (
        <div className="flex flex-col flex-1 min-h-0 space-y-5 overflow-hidden">
          
          {/* Current Topic Section */}
          <div className="shrink-0">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Current Topic</h3>
            {currentExplanation ? (
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100/80 rounded-xl relative overflow-hidden group">
                <div className="absolute right-2 top-2 text-indigo-400/20 group-hover:text-indigo-400/40 transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 font-display mb-1 truncate">{currentExplanation.topicName}</h4>
                <p className="text-[11px] text-indigo-600 font-bold mb-1.5">
                  Subject: {currentExplanation.subjectName || "Multi-Disciplinary"}
                </p>
                <div className="flex items-center space-x-1.5 pt-2 border-t border-indigo-100/50">
                  <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    Age {age}
                  </span>
                  <span className="text-[9px] bg-slate-100/80 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase truncate">
                    Style: {analogyStyle}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <p className="text-xs text-slate-400">No active concept loaded.</p>
              </div>
            )}
          </div>

          {/* All Subjects Category Selector Grid */}
          <div className="shrink-0">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 font-display">Pick a Subject Hub</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {SUBJECTS.map((sub) => {
                const IconComponent = sub.icon;
                const isSelected = sub.id === selectedSubjectId;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`flex items-center space-x-1.5 p-2 rounded-lg text-left border text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? sub.activeColor
                        : `border-slate-100 bg-slate-50/50 text-slate-600 ${sub.hoverColor} hover:border-slate-200`
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{sub.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic selection lists for active subject */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                AI Preset Topics
              </h3>
              <span className="text-[9px] bg-slate-100 text-slate-500 font-mono font-medium px-1.5 py-0.5 rounded uppercase">
                {activeSubject.name}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {activeSubject.topics.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectTopic(topic)}
                  className="w-full text-left group flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-indigo-50/30 border border-slate-100 hover:border-indigo-100/50 transition-all font-sans cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-100"
                >
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors truncate">
                    {topic}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* Saved Notebook List */
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Saved Explanations ({savedExplanations.length})
            </h3>
            {savedExplanations.length > 0 && (
              <button
                onClick={() => {
                  let content = `# 📚 SimpliLearn Complete Study Notebook\nCreated on: ${new Date().toLocaleDateString()}\nTotal Archived Concepts: ${savedExplanations.length}\n\n=========================================\n\n`;
                  savedExplanations.forEach((item, index) => {
                    content += `\n## [${index + 1}] Concept: ${item.topicName}\nSubject: ${item.explanation.subjectName || "Multi-Disciplinary"}\nSaved on: ${new Date(item.savedAt).toLocaleDateString()}\n\n### 💡 Core Idea\n${item.explanation.coreIdea}\n\n### ✨ Analogy: ${item.explanation.analogyTitle}\n> "${item.explanation.analogy}"\n\n### 📝 Summary\n${item.explanation.summaryText}\n\n### 🔑 Key Takeaways\n${item.explanation.keyPoints.map((p, idx) => `${idx + 1}. ${p}`).join('\n')}\n\n### 📝 Personal Notes & Comments\n${item.customNotes || "No personal annotations/comments added yet."}\n\n-----------------------------------------\n`;
                  });
                  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.setAttribute("href", url);
                  link.setAttribute("download", `SimpliLearn_Complete_Study_Notebook.md`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center space-x-1 text-[9px] bg-slate-900 text-white font-extrabold px-2 py-1 rounded hover:bg-indigo-600 transition-colors shadow-xs cursor-pointer"
                title="Export entire notebook as formatted study guide"
              >
                <Download className="w-2.5 h-2.5" />
                <span>Export All (.md)</span>
              </button>
            )}
          </div>
          
          {savedExplanations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Book className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-500">Your notebook is empty.</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[180px]">Save your favorite explanations while exploring!</p>
            </div>
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {savedExplanations.map((item) => {
                const isEditing = activeNoteEditId === item.id;
                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-all group flex flex-col space-y-1.5"
                  >
                    <div className="flex justify-between items-start">
                      <button
                        onClick={() => {
                          onToggleNotebookView();
                          onSelectTopic(item.topicName);
                        }}
                        className="text-left font-bold text-slate-800 text-xs hover:text-indigo-600 transition-colors line-clamp-1 pr-1 cursor-pointer"
                        title="Load concept study cards"
                      >
                        {item.topicName}
                      </button>
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => {
                            if (isEditing) {
                              setActiveNoteEditId(null);
                            } else {
                              setActiveNoteEditId(item.id);
                              setEditedNotes(item.customNotes || "");
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Add comments & exports"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteSaved(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                          title="Delete saved concept"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {!isEditing && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {item.explanation.coreIdea}
                      </p>
                    )}

                    {!isEditing && item.customNotes && (
                      <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 text-[10px] text-amber-900 italic font-medium leading-relaxed">
                        <span className="font-extrabold not-italic text-amber-800 uppercase tracking-wide block text-[8px] mb-0.5">My Notes:</span>
                        "{item.customNotes}"
                      </div>
                    )}

                    {isEditing && (
                      <div className="space-y-2 pt-1.5 animate-fade-in text-left">
                        <div className="space-y-1">
                          <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider block">My Notes & Comments:</span>
                          <textarea
                            value={editedNotes}
                            onChange={(e) => setEditedNotes(e.target.value)}
                            placeholder="Add your study highlights, formula reminders, or custom classroom notes here..."
                            rows={3}
                            className="w-full text-[11px] p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-slate-50/50 text-slate-700 leading-relaxed font-sans resize-none"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <button
                            onClick={() => {
                              onUpdateSaved(item.id, { customNotes: editedNotes });
                              setActiveNoteEditId(null);
                              setSavedIndicatorId(item.id);
                              setTimeout(() => setSavedIndicatorId(null), 2000);
                            }}
                            className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-2.5 py-1 rounded cursor-pointer transition-all hover:scale-[1.01]"
                          >
                            <Save className="w-2.5 h-2.5" />
                            <span>Save Notes</span>
                          </button>

                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                const content = `# SimpliLearn Study Guide: ${item.topicName}\nSubject: ${item.explanation.subjectName || "Science/Technology"}\nSaved on: ${new Date(item.savedAt).toLocaleDateString()}\n\n## 💡 The Core Idea\n${item.explanation.coreIdea}\n\n## ✨ The Analogy: ${item.explanation.analogyTitle}\n> "${item.explanation.analogy}"\n\n## 📝 Summary\n${item.explanation.summaryText}\n\n## 🔑 Key Takeaways\n${item.explanation.keyPoints.map((p, idx) => `${idx + 1}. ${p}`).join('\n')}\n\n## ✍️ Personal Comments\n${editedNotes || item.customNotes || "No annotations added yet."}\n\n---\nExported from SimpliLearn`;
                                const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.setAttribute("href", url);
                                link.setAttribute("download", `${item.topicName.replace(/\s+/g, "_")}_Study_Guide.md`);
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="p-1 px-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[9px] font-bold rounded flex items-center space-x-0.5 cursor-pointer"
                              title="Download study guide (.md)"
                            >
                              <Download className="w-2.5 h-2.5" />
                              <span>MD</span>
                            </button>
                            <button
                              onClick={() => {
                                const printWindow = window.open('', '_blank');
                                if (!printWindow) {
                                  window.print();
                                  return;
                                }
                                printWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>SimpliLearn Study Guide: ${item.topicName}</title>
                                      <style>
                                        body { font-family: system-ui, sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
                                        h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; font-size: 26px; }
                                        .meta { font-family: monospace; font-size: 11px; color: #64748b; margin-bottom: 25px; text-transform: uppercase; letter-spacing: 0.1em; }
                                        .section { margin-bottom: 25px; }
                                        .section-title { font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin-bottom: 8px; border-left: 4px solid #4f46e5; padding-left: 10px; }
                                        .analogy-box { background: #fffbeb; border: 1px dashed #fef3c7; border-radius: 12px; padding: 15px; font-style: italic; color: #78350f; margin-top: 10px; }
                                        .points { list-style: decimal; padding-left: 20px; }
                                        .points li { margin-bottom: 10px; font-size: 14px; }
                                        .notes { background: #f8fafc; border-radius: 12px; padding: 15px; border: 1px solid #e2e8f0; min-height: 60px; font-style: italic; }
                                      </style>
                                    </head>
                                    <body>
                                      <h1>SimpliLearn STUDY GUIDE</h1>
                                      <div class="meta">
                                        Topic: ${item.topicName} <br/>
                                        Subject: ${item.explanation.subjectName || "General Topic Selection"} <br/>
                                        Saved Date: ${new Date(item.savedAt).toLocaleDateString()}
                                      </div>
                                      <div class="section">
                                        <div class="section-title">💡 General Concept / Idea</div>
                                        <p>${item.explanation.coreIdea}</p>
                                      </div>
                                      <div class="section">
                                        <div class="section-title">✨ Relatable Analogy: ${item.explanation.analogyTitle}</div>
                                        <div class="analogy-box">"${item.explanation.analogy}"</div>
                                      </div>
                                      <div class="section">
                                        <div class="section-title">📜 In a Nutshell Summary</div>
                                        <p><strong>${item.explanation.summaryText}</strong></p>
                                      </div>
                                      <div class="section">
                                        <div class="section-title">🔑 Key takeaways</div>
                                        <ol class="points">
                                          ${item.explanation.keyPoints.map(p => `<li>${p}</li>`).join('')}
                                        </ol>
                                      </div>
                                      <div class="section">
                                        <div class="section-title">✍️ Personal Study Notes & Comments</div>
                                        <div class="notes">${editedNotes || item.customNotes || "No custom annotations saved."}</div>
                                      </div>
                                    </body>
                                  </html>
                                `);
                                printWindow.document.close();
                                printWindow.focus();
                                setTimeout(() => {
                                  printWindow.print();
                                  printWindow.close();
                                }, 350);
                              }}
                              className="p-1 px-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[9px] font-bold rounded flex items-center space-x-0.5 cursor-pointer"
                              title="Print guide to PDF / physical paper"
                            >
                              <Printer className="w-2.5 h-2.5" />
                              <span>Print</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {savedIndicatorId === item.id && (
                      <div className="text-[10px] text-emerald-600 font-extrabold flex items-center space-x-1 animate-pulse">
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>Saved custom study comments!</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100">
                      <span className="text-[9px] font-bold text-indigo-600 truncate bg-indigo-50/50 px-1.5 py-0.5 rounded">
                        {item.explanation.subjectName || "General"}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(item.savedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* User Card */}
      <div className="mt-auto shrink-0 pt-3 border-t border-slate-100">
        <div className="flex items-center space-x-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold font-display shadow-inner shadow-black/10 shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-slate-800 truncate">Student Solver</span>
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Level 3 Explorer</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
