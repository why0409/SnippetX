"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import api from "@/lib/api";
import axios from "axios";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark, solarizedlight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { 
  Search, Plus, Pin, Globe, LogOut, 
  Copy, Check, Pencil, Trash2, Menu, X, ArrowLeft,
  ChevronLeft, ChevronRight, Palette, Sparkles, Lightbulb, Loader2,
  Lock, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import CreateSnippetModal from "@/components/CreateSnippetModal";

type Theme = 'modern' | 'smartisan' | 'classic-ios';

// 搜索高亮组件
function HighlightedText({ text, highlight, theme }: { text: string, highlight: string, theme: string }) {
  if (!text) return null;
  if (!highlight.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className={`rounded-sm px-0.5 ${theme === 'modern' ? 'bg-blue-500/40 text-blue-200' : 'bg-yellow-200 text-black'}`}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export default function SnippetX() {
  const [theme, setTheme] = useState<Theme>('modern');
  const [activeTab, setActiveTab] = useState<'my' | 'community'>('my');
  const [allSnippets, setAllSnippets] = useState<any[]>([]); 
  const [selectedSnippet, setSelectedSnippet] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<{explanation: string, suggestions: string} | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);
  const [snippetToEdit, setSnippetToEdit] = useState<any>(null);
  const [copyStatus, setCopyStatus] = useState(false);

  const filteredSnippets = useMemo(() => {
    if (!searchText.trim()) return allSnippets;
    const lowerSearch = searchText.toLowerCase();
    return allSnippets.filter(s => 
      s.title?.toLowerCase().includes(lowerSearch) || 
      s.description?.toLowerCase().includes(lowerSearch) ||
      s.content?.toLowerCase().includes(lowerSearch)
    );
  }, [allSnippets, searchText]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchSnippets = useCallback(async (category?: string | null, keyword?: string) => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (category) params.category = category;
      if (keyword) params.keyword = keyword;

      const endpoint = activeTab === 'my' ? "/snippet/my" : "/snippet/community";
      
      // 未登录且在我的片段，则不请求数据
      if (activeTab === 'my' && !localStorage.getItem("auth_token")) {
        setAllSnippets([]);
        setIsLoading(false);
        return;
      }

      const res = await api.get(endpoint, { params });
      const data = res.data.data || [];
      setAllSnippets(data);
      if (data.length > 0 && !selectedSnippet && typeof window !== 'undefined' && window.innerWidth >= 768) {
        setSelectedSnippet(data[0]);
      }
    } catch (err) { 
      console.error(err); 
      if (activeTab === 'my') setAllSnippets([]); 
    } finally { setIsLoading(false); }
  }, [activeTab, selectedSnippet]);

  useEffect(() => { 
    fetchSnippets(selectedCategory, debouncedSearch); 
  }, [selectedCategory, debouncedSearch, activeTab, fetchSnippets]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme) setTheme(savedTheme);
    const token = localStorage.getItem("auth_token");
    if (token) { setIsLoggedIn(true); fetchUser(); }
    else { setActiveTab('community'); } // 未登录默认展示社区
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const onAuthSuccess = () => { setIsLoggedIn(true); fetchUser(); setActiveTab('my'); fetchSnippets(); };
  const onCreateSuccess = () => { fetchSnippets(selectedCategory, searchText); if (isLoggedIn) fetchUser(); };

  const fetchUser = async () => {
    try {
      const res = await api.get("/user/me");
      setUser(res.data.data);
      const catRes = await api.get("/snippet/categories");
      setCategories(catRes.data.data);
    } catch (err) {}
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsLoggedIn(false); setUser(null); setSelectedSnippet(null); setIsMobileDetailView(false); setActiveTab('community');
  };

  const getHighlighterStyle = () => {
    const baseStyle = theme === 'modern' ? atomDark : solarizedlight;
    return {
      ...baseStyle,
      'pre[class*="language-"]': { ...baseStyle['pre[class*="language-"]'], background: 'transparent', backgroundColor: 'transparent' },
      'code[class*="language-"]': { ...baseStyle['code[class*="language-"]'], background: 'transparent', backgroundColor: 'transparent' }
    };
  };

  const handleAiInsight = async () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!selectedSnippet) return;
    setIsInsightLoading(true);
    setAiInsight(null);
    try {
      const res = await axios.post("/api/ai/process", { code: selectedSnippet.content, action: "insight" });
      setAiInsight(res.data);
    } catch (err) { alert("AI 分析失败"); }
    finally { setIsInsightLoading(false); }
  };

  const handleCopy = async () => {
    if (!selectedSnippet) return;
    await navigator.clipboard.writeText(selectedSnippet.content);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个片段吗？")) return;
    try {
      await api.delete(`/snippet/${id}`);
      setSelectedSnippet(null); setIsMobileDetailView(false); fetchSnippets(selectedCategory, searchText);
    } catch (err) { alert("删除失败"); }
  };

  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);
  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < 600) setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => { window.removeEventListener("mousemove", resize); window.removeEventListener("mouseup", stopResizing); };
  }, [resize, stopResizing]);

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${isResizing ? 'cursor-col-resize select-none' : ''}`} 
         style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}>
      
      <aside 
        style={{ width: isSidebarCollapsed ? 0 : sidebarWidth, backgroundColor: 'var(--bg-sidebar)' }}
        className={`relative flex-shrink-0 border-r border-black/10 flex flex-col transition-[width] duration-300 ease-in-out ${isMobileDetailView ? 'hidden md:flex' : 'flex'} ${isSidebarCollapsed ? 'overflow-hidden border-none' : ''}`}
      >
        <header className={`p-6 flex justify-between items-center shrink-0 border-b border-black/10 ${theme === 'classic-ios' ? 'bg-[#2d3033] ios-glossy' : ''}`}>
          <h1 className={`text-xl font-black ${theme === 'modern' ? 'bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent' : 'text-white'}`}>
            SnippetX
          </h1>
          {isLoggedIn && activeTab === 'my' && (
            <button onClick={() => setIsCreateModalOpen(true)} className={`p-2 rounded-lg transition-all shadow-md ${theme === 'smartisan' ? 'bg-[#b22222] text-white' : 'bg-blue-600 text-white'}`}>
              <Plus size={18} />
            </button>
          )}
        </header>

        {/* Tab 切换器 */}
        <div className="px-6 py-2 flex gap-1 bg-black/10 shrink-0">
          <button 
            onClick={() => setActiveTab('my')}
            className={`flex-1 py-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'my' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Lock size={12} /> 我的片段
          </button>
          <button 
            onClick={() => setActiveTab('community')}
            className={`flex-1 py-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'community' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Users size={12} /> 发现社区
          </button>
        </div>

        <div className="p-4 space-y-4 shrink-0">
          <div className="relative group">
            <Search className={`absolute left-3 top-3 transition-colors ${isLoading ? 'animate-pulse text-blue-500' : 'opacity-40'}`} size={16} />
            <input type="text" placeholder={activeTab === 'my' ? "搜索我的代码..." : "在社区中发现..."} className={`w-full py-2 pl-9 pr-4 text-sm focus:outline-none transition-all ${theme === 'modern' ? 'bg-[#0d1117] border border-gray-800 rounded-xl focus:border-blue-500' : 'bg-white/10 border-none rounded-md'}`} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            {isLoading && <Loader2 className="absolute right-3 top-3 animate-spin opacity-40 text-blue-500" size={14} />}
          </div>

          {activeTab === 'my' && isLoggedIn && categories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {["全部", ...categories].map(cat => (
                <button key={cat} onClick={() => { const val = cat === "全部" ? null : cat; setSelectedCategory(val); }} className={`text-[10px] uppercase font-bold px-2.5 py-1.5 rounded-md transition-all ${((cat === "全部" && !selectedCategory) || selectedCategory === cat) ? (theme === 'smartisan' ? 'bg-[#b22222] text-white' : 'bg-blue-600 text-white') : 'bg-black/20 text-gray-400'}`}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          {activeTab === 'my' && !isLoggedIn ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center opacity-40">
              <Globe size={40} className="mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest mb-4">登录以同步您的云端仓库</p>
              <button onClick={() => setIsLoginModalOpen(true)} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">立即登录</button>
            </div>
          ) : filteredSnippets.length > 0 ? (
            filteredSnippets.map(s => (
              <div key={s.id} onClick={() => { setSelectedSnippet(s); setAiInsight(null); setIsMobileDetailView(true); }} className={`p-4 cursor-pointer transition-all border ${theme === 'smartisan' ? 'smartisan-card bg-[#f5f5f5] text-gray-800 rounded-lg' : theme === 'classic-ios' ? 'bg-white text-black border-gray-300 rounded-md' : 'bg-white/5 border-transparent hover:bg-white/10 rounded-xl'} ${selectedSnippet?.id === s.id ? (theme === 'modern' ? 'border-blue-500/50 bg-blue-500/10' : 'ring-2 ring-blue-500') : ''}`}>
                <h3 className="text-sm font-bold truncate mb-2"><HighlightedText text={s.title} highlight={searchText} theme={theme} /></h3>
                <div className="flex gap-2 items-center">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${theme === 'modern' ? 'bg-blue-400/10 text-blue-400' : 'bg-gray-200 text-gray-600'}`}>{s.language}</span>
                  {s.isPinned && <Pin size={10} className="text-orange-400" />}
                  {activeTab === 'community' && s.isPublic && <Globe size={10} className="text-blue-400" />}
                </div>
                {s.description && <p className="text-[10px] opacity-50 mt-2 line-limit-1 truncate"><HighlightedText text={s.description} highlight={searchText} theme={theme} /></p>}
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center opacity-20">
              <Search size={30} className="mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest">{isLoading ? "加载中..." : "暂无相关片段"}</p>
            </div>
          )}
        </div>

        <footer className={`p-4 border-t border-black/10 flex flex-col gap-4 ${theme === 'classic-ios' ? 'bg-[#2d3033]' : ''}`}>
          <div className="flex gap-2 justify-center">
            {(['modern', 'smartisan', 'classic-ios'] as Theme[]).map(t => (
              <button key={t} onClick={() => setTheme(t)} className={`w-6 h-6 rounded-full border-2 transition-all ${theme === t ? 'border-blue-500 scale-110' : 'border-transparent opacity-50'} ${t === 'modern' ? 'bg-[#161b22]' : t === 'smartisan' ? 'bg-[#b22222]' : t === 'classic-ios' ? 'bg-[#147efb]' : ''}`} title={t} />
            ))}
          </div>
          {isLoggedIn && user ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold truncate text-gray-400">{user.username}</span>
              <button onClick={handleLogout} className="text-red-400 text-[10px] uppercase font-black hover:underline">退出登录</button>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black uppercase transition-all shadow-lg shadow-blue-900/20"
            >
              登录 / 加入社区
            </button>
          )}
        </footer>
        <div onMouseDown={startResizing} className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-blue-500/50 z-10" />
      </aside>

      <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 w-6 h-12 items-center justify-center transition-all shadow-xl ${theme === 'smartisan' ? 'bg-gray-200 rounded-r-lg border border-l-0' : 'bg-gray-800 rounded-r-xl text-gray-400'}`} style={{ left: isSidebarCollapsed ? 0 : sidebarWidth }}>
        {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <main className={`flex-1 flex flex-col min-w-0 ${isMobileDetailView ? 'flex' : 'hidden md:flex'}`} style={{ backgroundColor: 'var(--bg-app)' }}>
        {selectedSnippet ? (
          <div className="flex flex-col h-full min-w-0 overflow-y-auto custom-scrollbar">
            <header className={`p-6 md:p-8 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0 ${theme === 'classic-ios' ? 'bg-[#f0f0f0] border-b border-gray-300 shadow-sm' : ''}`}>
              <div className="flex items-start gap-4 min-w-0">
                {isMobileDetailView && <button onClick={() => setIsMobileDetailView(false)} className="md:hidden p-2 opacity-50"><ArrowLeft size={20} /></button>}
                <div className="min-w-0">
                  <p className="text-[10px] font-mono text-blue-500 uppercase tracking-widest mb-1">{selectedSnippet.language}</p>
                  <h2 className={`text-2xl md:text-3xl font-black truncate ${theme === 'modern' ? 'text-white' : 'text-gray-900'}`}>{selectedSnippet.title}</h2>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={handleAiInsight} disabled={isInsightLoading} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-bold ${isInsightLoading ? 'bg-purple-900/50 text-purple-300 animate-pulse' : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'}`}>
                  <Sparkles size={18} /><span>{isInsightLoading ? "分析中" : "AI 洞察"}</span>
                </button>
                <button onClick={handleCopy} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-bold ${copyStatus ? 'bg-green-600/20 text-green-500' : (theme === 'modern' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 text-gray-700 shadow-sm')}`}>
                  {copyStatus ? <Check size={18} /> : <Copy size={18} />}<span>{copyStatus ? "已复制" : "复制"}</span>
                </button>
                {isLoggedIn && user && selectedSnippet.userId === user.id && (
                  <div className="flex gap-2">
                    <button onClick={() => { setSnippetToEdit(selectedSnippet); setIsCreateModalOpen(true); }} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold ${theme === 'modern' ? 'bg-gray-800 text-blue-400' : 'bg-white border border-gray-300 text-blue-600 shadow-sm'}`}><Pencil size={18} /><span>编辑</span></button>
                    <button onClick={() => handleDelete(selectedSnippet.id)} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold ${theme === 'modern' ? 'bg-gray-800 text-red-500' : 'bg-white border border-gray-300 text-red-600 shadow-sm'}`}><Trash2 size={18} /><span>删除</span></button>
                  </div>
                )}
              </div>
            </header>

            <div className="flex-1 p-4 md:p-8 pt-4 flex flex-col gap-6">
              {/* AI Insight 区域 */}
              <AnimatePresence>
                {aiInsight && (
                  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-purple-600/5 border border-purple-500/20 rounded-2xl shadow-lg shadow-purple-900/5">
                      <div className="flex items-center gap-2 mb-4 text-purple-400 font-black text-xs uppercase tracking-widest"><Lightbulb size={16} /> 逻辑拆解</div>
                      <p className="text-sm text-gray-300 leading-relaxed italic">"{aiInsight.explanation}"</p>
                    </div>
                    <div className="p-6 bg-green-600/5 border border-green-500/20 rounded-2xl shadow-lg shadow-green-900/5">
                      <div className="flex items-center gap-2 mb-4 text-green-400 font-black text-xs uppercase tracking-widest"><Check size={16} /> 改进建议</div>
                      <div className="text-sm text-gray-300 space-y-2">{aiInsight.suggestions.split('\n').filter(s => s.trim()).map((s, i) => <p key={i} className="flex gap-2"><span>•</span> {s.replace(/^[•\-\d.]\s*/, '')}</p>)}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`flex flex-col min-w-0 overflow-hidden ${theme === 'smartisan' ? 'smartisan-card rounded-xl' : theme === 'classic-ios' ? 'border border-gray-300 rounded-lg shadow-inner' : 'rounded-2xl border border-gray-800 shadow-2xl'}`} style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className={`px-4 py-2 flex gap-1.5 items-center shrink-0 border-b border-black/10 ${theme === 'classic-ios' ? 'bg-gray-100' : 'bg-black/20'}`}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  <span className="ml-4 text-[9px] font-bold opacity-40 uppercase">Editor</span>
                </div>
                <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                  <div className="min-w-fit">
                    <SyntaxHighlighter language={selectedSnippet.language?.toLowerCase() || 'text'} style={getHighlighterStyle() as any} customStyle={{ fontSize: "14px", margin: 0, padding: 0 }} showLineNumbers={true} wrapLines={false}>
                      {selectedSnippet.content}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>
              
              {selectedSnippet.description && (
                <div className={`p-6 shrink-0 ${theme === 'smartisan' ? 'bg-white border border-gray-200 rounded-xl shadow-sm' : 'bg-blue-600/5 border-l-4 border-blue-500 rounded-r-xl'}`}>
                  <p className={`text-sm leading-relaxed ${theme === 'modern' ? 'text-gray-400' : 'text-gray-600'}`}>{selectedSnippet.description}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20"><Plus size={100} strokeWidth={1} /><p className="mt-4 font-black tracking-widest uppercase text-xs">Select Snippet to view details</p></div>
        )}
      </main>

      <AuthModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onSuccess={onAuthSuccess} />
      <CreateSnippetModal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setSnippetToEdit(null); }} onSuccess={onCreateSuccess} editData={snippetToEdit} />
    </div>
  );
}
