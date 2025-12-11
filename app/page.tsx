"use client";
import React, { useState, useEffect } from 'react';
import { 
  Brain, Target, Shield, Zap, Info, 
  Filter, CheckCircle2, Lock, Save, Trash2,
  Network, Megaphone, Clock, Anchor, Eye, FileText, Download, LayoutDashboard,
  ChevronDown, ChevronUp, Flame, Trophy, LucideIcon
} from 'lucide-react';

// --- TYPES ---

interface Concept {
  id: number;
  title: string;
  category: string;
  icon: LucideIcon;
  color: string;
  insight: string;
  prescription: string[];
}

interface Log {
  id: number;
  text: string;
  conceptId: number;
  date: string | Date; // Can be a string (from JSON) or Date object (newly created)
}

// --- DATA: THE PM INFLUENCE TOOLKIT (v2) ---
const initialConcepts: Concept[] = [
  {
    id: 1,
    title: "The Dormant Tie Protocol",
    category: "Networks",
    icon: Anchor,
    color: "bg-blue-600",
    insight: "I often let relationships fade once I leave a project. Weak Ties are my best source of new info. Letting these rot is a career liability.",
    prescription: [
      "The 'No-Ask' Check-in: Send one note this week to a former colleague with zero agenda.",
      "The 'Alumni' Audit: Have I spoken to my top 3 past colleagues in 6 months?",
      "The 5-Minute Favor: Connect two people from my past who don't know each other."
    ]
  },
  {
    id: 2,
    title: "Structural Hole Engineering",
    category: "Networks",
    icon: Network,
    color: "bg-indigo-600",
    insight: "I stick to my 'home team', but value comes from bridging 'structural holes'. If I only talk to people who know what I know, it's not adding unique value.",
    prescription: [
      "The 'Outsider' Lunch: Eat with someone from a function I don't understand.",
      "The 50% Rule: At events, spend 50% of my time with people I don't know.",
      "Be the Broker: Identify stakeholders who are blocked because they're not talking."
    ]
  },
  {
    id: 3,
    title: "The 20-Slot Rule",
    category: "Intentionality",
    icon: Clock,
    color: "bg-amber-600",
    insight: "I get swept up in the whirlwind. I need to treat my time as a scarce, strategic asset.",
    prescription: [
      "Saying No: Delete one meeting that doesn't serve me.",
      "Strategic Blocking: Block 2-4 hours/week for 'Deep Work'.",
      "Goal Alignment: Ask today 'Which of my top 3 goals does this task advance?'"
    ]
  },
  {
    id: 4,
    title: "The Visibility Engine",
    category: "Ethos",
    icon: Megaphone,
    color: "bg-rose-600",
    insight: "I believe work should speak for itself, but this is a fallocy. If I don't shape the story of my competence, others will define it for me.",
    prescription: [
      "The Win Email: Send a weekly 3-bullet summary of wins to my boss.",
      "Contextual Credentialing: Share a learning that subtly highlights a success.",
      "The Hype Man Proxy: Ask a peer to mention my project in a meeting."
    ]
  },
  {
    id: 5,
    title: "The Authority Pivot",
    category: "Leadership",
    icon: Shield,
    color: "bg-emerald-700",
    insight: "I shy away from using authority. But legitimate power comes from the ROLE. I own the Roadmap.",
    prescription: [
      "Depersonalize any 'No': When you decline, it's strictly business.",
      "Communicate My Vision: Anchor my demands to the product vision.",
    ]
  },
  {
    id: 6,
    title: "The Pre-Wire Protocol",
    category: "Coalitions / Strategy",
    icon: Network, // Represents connecting nodes before the main event
    color: "bg-purple-600",
    insight: "The meeting is just a performance; the real decision is made in the 'meeting before the meeting.' I often hope my logic will win the room, but that's a gamble. Influence is done one-on-one beforehand.",
    prescription: [
      "The 'Stakeholder Scan': Before sending the invite, list who's a 'Yes', 'No', or 'Maybe'.",
      "The 'Safe Space' Preview: Show the rough draft to the loudest detractor 2 days early. Ask them 'What would stop you from supporting this?'",
      "The 'Ally Anchor': Ask a supporter to speak second in the meeting to validate my first point immediately."
    ]
  },
  {
    id: 7,
    title: "The Warmth Filter",
    category: "Awareness",
    icon: Flame, // Represents Warmth
    color: "bg-orange-500",
    insight: "I naturally lead with data/roadmaps to prove I belong. But in reality people assess intent before ability (aka warmth before compliance). I've got to signal as a friend first.",
    prescription: [
      "The First Two Minutes: Spend the start of the call on pure rapport, not the agenda",
      "The 'Humility Marker': Admit a small uncertainty or mistake early to lower people's defenses."
    ]
  },
  {
    id: 8,
    title: "The Narrative Transport",
    category: "Ethos",
    icon: Megaphone, // Represents Storytelling/Broadcast
    color: "bg-pink-600",
    insight: "In Entertainment Tech we create experiences, but I often communicate in 'Stats'. But stories are remembered way more than facts. I need to wrap the metric in some user story.",
    prescription: [
      "Visuals Over Text: Never send a text-heavy slide. Use a screenshot or diagram to make it 'Vivid' (Class 7).",
      "The 'One Thing' Rule: If they only remember one sentence from this presentation, what is it? Repeat it 3 times."
    ]
  },
  {
    id: 9,
    title: "The Opportunity Radar",
    category: "Awareness",
    icon: Eye, // Represents seeing what others miss
    color: "bg-teal-600",
    insight: "My weakness is not seeing opportunities others miss. Think about situational awareness and staying vigilant for changes in the environment. I get stuck in the weeds of execution and miss changes.",
    prescription: [
      "The 'Zoom Out' Ritual: Monday morning I can scan competitor news and industry shifts, not just my email.",
      "The 'Why Now?' Audit: When a stakeholder pushes a new feature, ask why it matters NOW. Is something shifting?",
      "Pattern Recognition: Note when 3 different people mention the same problem. That's a signal, not noise."
    ]
  },
  {
    id: 10,
    title: "The Reciprocity Trigger",
    category: "Networks",
    icon: Zap, // Represents the spark of exchange
    color: "bg-cyan-600",
    insight: "I tend to view favors as transactional. The Heidi Roizen case taught 'Quid Sine Quo', or giving without an immediate ask. This builds a savings account of influence I can cash out later.",
    prescription: [
      "The Gift: Send a resource (article, tool, intro) to a peer with the subject line 'Thinking of you! No reply needed'.",
      "Public Praise: Use the company Slack or all-hands to credit someone else for a win.",
    ]
  }
];

// --- HELPER FUNCTIONS FOR GAMIFICATION ---

// Get the Sunday of the week for a given date (to group logs by week)
const getWeekStart = (dateStr: string | Date): number => {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day; // adjust when day is sunday
  const sunday = new Date(d.setDate(diff));
  sunday.setHours(0,0,0,0);
  return sunday.getTime();
};

const calculateStreak = (logs: Log[]): number => {
  if (!logs || logs.length === 0) return 0;
  
  // Group counts by week timestamp
  const weeklyCounts: Record<number, number> = {};
  logs.forEach(log => {
    const weekStart = getWeekStart(log.date);
    weeklyCounts[weekStart] = (weeklyCounts[weekStart] || 0) + 1;
  });

  // Check current week
  const thisWeekStart = getWeekStart(new Date());
  let streak = 0;
  
  // If we met the goal this week, count it.
  if ((weeklyCounts[thisWeekStart] || 0) >= 3) {
    streak++;
  }

  // Check previous weeks backwards
  let checkWeek = thisWeekStart - (7 * 24 * 60 * 60 * 1000); // Go back 1 week
  
  while (true) {
    if ((weeklyCounts[checkWeek] || 0) >= 3) {
      streak++;
      checkWeek -= (7 * 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }
  
  return streak;
};

// --- COMPONENTS ---

interface StrategyHeaderProps {
  activeIds: number[];
  concepts: Concept[];
}

const StrategyHeader: React.FC<StrategyHeaderProps> = ({ activeIds, concepts }) => {
  const activeItems = concepts.filter(c => activeIds.includes(c.id));

  return (
    <div className="max-w-6xl mx-auto px-6 mb-8">
      <div className="bg-emerald-900 rounded-2xl p-8 text-white shadow-xl border border-emerald-800">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
              <Target className="text-emerald-400" /> 
              Current Focus
            </h3>
            <p className="text-emerald-100/80 max-w-xl">
               "Invest more in relationships than is convenient."
            </p>
          </div>
          
          <div className="w-full md:w-1/2 bg-emerald-950/50 p-4 rounded-xl border border-emerald-800">
             <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-widest text-emerald-400">
                <Zap size={14} /> Activated Protocols
             </div>
             {activeItems.length === 0 ? (
               <p className="text-sm text-emerald-100/50 italic">No protocols activated. Select a card below.</p>
             ) : (
               <div className="flex flex-wrap gap-2">
                 {activeItems.map(item => (
                   <span key={item.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-100 text-sm border border-emerald-500/30">
                     <item.icon size={12} /> {item.title}
                   </span>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProgressTrackerProps {
  logs: Log[];
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ logs }) => {
  // Calculate this week's progress
  const thisWeekStart = getWeekStart(new Date());
  const thisWeekLogs = logs.filter(l => getWeekStart(l.date) === thisWeekStart);
  const count = thisWeekLogs.length;
  const target = 3;
  const progress = Math.min((count / target) * 100, 100);
  const streak = calculateStreak(logs);
  const isGoalMet = count >= target;

  return (
    <div className="max-w-6xl mx-auto px-6 mb-8">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-8">
        
        {/* Streak Counter */}
        <div className="flex items-center gap-4 border-r border-slate-100 pr-8 min-w-[150px]">
          <div className={`p-3 rounded-full ${streak > 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
            <Flame size={28} fill={streak > 0 ? "currentColor" : "none"} />
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900">{streak}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Week Streak</p>
          </div>
        </div>

        {/* Weekly Progress Bar */}
        <div className="flex-grow w-full">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-bold text-slate-700">Weekly Influence Output</p>
              <p className="text-xs text-slate-400">Target: {target} scenarios / week</p>
            </div>
            <div className="text-right">
              {isGoalMet ? (
                 <span className="text-emerald-600 font-bold flex items-center gap-1 text-sm animate-pulse">
                   <Trophy size={14} /> Goal Met!
                 </span>
              ) : (
                <span className="text-slate-500 font-mono text-sm">{count} / {target}</span>
              )}
            </div>
          </div>
          
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${isGoalMet ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-blue-500'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

      </div>
    </div>
  );
};

interface SituationLogProps {
  onAddLog: (text: string, conceptId: number) => void;
  concepts: Concept[];
}

const SituationLog: React.FC<SituationLogProps> = ({ onAddLog, concepts }) => {
  const [newLog, setNewLog] = useState("");
  const [selectedConceptId, setSelectedConceptId] = useState<number>(concepts[0].id);

  const handleSave = () => {
    if (!newLog.trim()) return;
    onAddLog(newLog, selectedConceptId);
    setNewLog("");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 mb-12">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="text-blue-600" /> Log a New Situation
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category</label>
            <div className="relative">
              <select 
                value={selectedConceptId}
                onChange={(e) => setSelectedConceptId(parseInt(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700"
              >
                {concepts.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Observation / Action</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newLog}
                onChange={(e) => setNewLog(e.target.value)}
                placeholder="E.g., 'Met a PM from the Sales team. Used the 50% rule...'"
                className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button 
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Save size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ConceptCardProps {
  data: Concept;
  isActive: boolean;
  onToggleActive: (id: number) => void;
  logs: Log[];
  onDeleteLog: (id: number) => void;
}

const ConceptCard: React.FC<ConceptCardProps> = ({ data, isActive, onToggleActive, logs, onDeleteLog }) => {
  const [showLogs, setShowLogs] = useState(false);
  const relevantLogs = logs.filter(l => l.conceptId === data.id);

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full ${isActive ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/10' : 'bg-white border-slate-200'}`}>
      <div className={`${data.color} p-4 flex justify-between items-center text-white`}>
        <div className="flex items-center gap-3">
          <data.icon size={24} />
          <h3 className="font-bold text-lg">{data.title}</h3>
        </div>
        {relevantLogs.length > 0 && (
          <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
            {relevantLogs.length}
          </span>
        )}
      </div>
      
      <div className="p-6 flex-grow flex flex-col bg-white">
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Brain size={12} /> Personal Synthesis
          </p>
          <p className="text-slate-700 italic border-l-4 border-slate-100 pl-4 text-sm leading-relaxed">
            "{data.insight}"
          </p>
        </div>

        <div className="mb-6 flex-grow">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Target size={12} /> The Protocol
          </p>
          <ul className="space-y-2">
            {data.prescription.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5"></span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {relevantLogs.length > 0 && (
          <div className="mt-auto pt-4 border-t border-slate-100">
             <button 
              onClick={() => setShowLogs(!showLogs)}
              className="w-full flex items-center justify-between text-xs text-slate-500 font-semibold hover:text-slate-800 transition"
             >
               <span>Situation History ({relevantLogs.length})</span>
               {showLogs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
             </button>
             
             {showLogs && (
               <div className="mt-3 space-y-3 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                 {relevantLogs.map(log => (
                   <div key={log.id} className="bg-slate-50 p-3 rounded text-xs border border-slate-100 relative group">
                     <p className="text-slate-600 mb-1">{log.text}</p>
                     <div className="flex justify-between items-center mt-1">
                       <span className="text-slate-400 text-[10px]">{new Date(log.date).toLocaleDateString()}</span>
                       <button onClick={() => onDeleteLog(log.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Trash2 size={12} />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        <div className="mt-6 pt-4">
          <button 
            onClick={() => onToggleActive(data.id)}
            className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              isActive 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isActive ? (
              <> <CheckCircle2 size={16} /> Protocol Active </>
            ) : (
              <> <Lock size={16} /> Activate Protocol </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const CourseLibrary: React.FC = () => {
  const [selectedSlide, setSelectedSlide] = useState("class-1 slides.pdf");
  const slides = [
    { name: "Class 1: Introduction", file: "class-1 slides.pdf" },
    { name: "Class 2: Pragmatism", file: "class-2 slides.pdf" },
    { name: "Class 3: Authority", file: "class-3 slides.pdf" },
    { name: "Class 4: Ethics", file: "class-4 slides.pdf" },
    { name: "Class 5: Informal Networks (I)", file: "class-5 slides.pdf" },
    { name: "Class 6: Informal Networks (II)", file: "class-6 slides.pdf" },
    { name: "Class 7: Persuasion (I)", file: "class-7 slides.pdf" },
    { name: "Class 8: Persuasion (II)", file: "class-8 slides.pdf" },
    { name: "Class 9: Leverage Inventory", file: "class-9 slides.pdf" },
    { name: "Class 10: Coalitions", file: "class-10 slides.pdf" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 mb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="text-emerald-600" /> The Script Archive
        </h2>
        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Viewing: <span className="font-semibold text-emerald-700">{selectedSlide}</span>
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[75vh]">
        <div className="w-full lg:w-1/3 bg-white border border-slate-200 rounded-xl overflow-y-auto shadow-sm">
          <div className="p-2 space-y-1">
            {slides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSlide(slide.file)}
                className={`w-full text-left px-4 py-4 rounded-lg transition-all flex items-center justify-between group ${
                  selectedSlide === slide.file
                    ? 'bg-emerald-50 border border-emerald-200 shadow-sm'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${
                    selectedSlide === slide.file ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-500 group-hover:text-emerald-600'
                  }`}>
                    <FileText size={18} />
                  </div>
                  <span className={`text-sm font-medium ${selectedSlide === slide.file ? 'text-emerald-900' : 'text-slate-700'}`}>
                    {slide.name}
                  </span>
                </div>
                <a 
                  href={`/slides/${slide.file}`} 
                  download
                  onClick={(e) => e.stopPropagation()} 
                  className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-white rounded-full transition-colors"
                  title="Download PDF"
                >
                  <Download size={16} />
                </a>
              </button>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-2/3 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="ml-4 bg-slate-900 px-3 py-1 rounded text-xs font-mono text-slate-400 flex-grow text-center truncate">
              /public/slides/{selectedSlide}
            </div>
          </div>
          <div className="flex-grow bg-slate-200 relative">
            <iframe 
              src={`/slides/${selectedSlide}`} 
              className="w-full h-full absolute inset-0" 
              title="PDF Viewer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function InfluenceDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filter, setFilter] = useState("All");
  
  // STATE: Logs
  const [logs, setLogs] = useState<Log[]>([]);
  // STATE: Active Protocol IDs
  const [activeProtocolIds, setActiveProtocolIds] = useState<number[]>([]);

  useEffect(() => {
    const savedLogs = localStorage.getItem('influenceLogs');
    const savedProtocols = localStorage.getItem('activeProtocols');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedProtocols) setActiveProtocolIds(JSON.parse(savedProtocols));
  }, []);

  const handleAddLog = (text: string, conceptId: number) => {
    const newEntry: Log = { 
      id: Date.now(), 
      text, 
      conceptId, 
      date: new Date() // Store as Date object initially for sorting/logic
    };
    const updatedLogs = [newEntry, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('influenceLogs', JSON.stringify(updatedLogs));
  };

  const handleDeleteLog = (id: number) => {
    const updated = logs.filter(l => l.id !== id);
    setLogs(updated);
    localStorage.setItem('influenceLogs', JSON.stringify(updated));
  };

  const handleToggleProtocol = (id: number) => {
    let updated: number[];
    if (activeProtocolIds.includes(id)) {
      updated = activeProtocolIds.filter(pid => pid !== id);
    } else {
      updated = [...activeProtocolIds, id];
    }
    setActiveProtocolIds(updated);
    localStorage.setItem('activeProtocols', JSON.stringify(updated));
  };

  const visibleConcepts = filter === "All" 
    ? initialConcepts 
    : initialConcepts.filter(c => c.category === filter);

  const categories = ["All", ...Array.from(new Set(initialConcepts.map(c => c.category)))];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      
      <header className="bg-white border-b border-slate-200 pt-20 pb-8 px-6 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6">
            <div>
              <p className="text-emerald-600 font-mono text-sm mb-4 tracking-widest uppercase">
                LGST 6930 // Final Project
              </p>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Green Room</span>.
              </h1>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-lg mt-6 md:mt-0">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === "dashboard" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <LayoutDashboard size={16} /> Dashboard
              </button>
              <button
                onClick={() => setActiveTab("library")}
                className={`px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === "library" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <FileText size={16} /> Library
              </button>
            </div>
          </div>
          <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
            The backstage practice room for <strong>me</strong> to practice influence.
            Here I can save scenarios that arise, categorize them into my weakpoint protocols, and reference the course notes.
            I can assign current protocols to focus on, and gamify logigng with a weekly streak. 
          </p>
        </div>
      </header>

      {activeTab === "dashboard" ? (
        <>
          {/* New Progress Tracker */}
          <ProgressTracker logs={logs} />
          
          <StrategyHeader activeIds={activeProtocolIds} concepts={initialConcepts} />
          
          <SituationLog onAddLog={handleAddLog} concepts={initialConcepts} />

          <div className="sticky top-0 z-50 bg-slate-50/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 mb-8">
            <div className="max-w-6xl mx-auto flex items-center gap-4 overflow-x-auto no-scrollbar">
              <Filter size={16} className="text-slate-400" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === cat 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <section className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleConcepts.map(concept => (
                <ConceptCard 
                  key={concept.id} 
                  data={concept} 
                  isActive={activeProtocolIds.includes(concept.id)}
                  onToggleActive={handleToggleProtocol}
                  logs={logs}
                  onDeleteLog={handleDeleteLog}
                />
              ))}
            </div>
          </section>
        </>
      ) : (
        <CourseLibrary />
      )}

      <footer className="max-w-6xl mx-auto mt-24 px-6 text-center border-t border-slate-200 pt-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs text-slate-500">
          <Info size={12} />
          <span>Code architecture by AI. Content, insights and synthesis made with ♥️ by Student.</span>
        </div>
      </footer>

    </main>
  );
}