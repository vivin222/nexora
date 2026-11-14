import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Bookmark, 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  Sparkles, 
  Code2, 
  HelpCircle, 
  Send,
  Check,
  Copy,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../../api/client';
import { Course, CourseLesson, CourseModule } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const LearningCenterView: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [courseLoading, setCourseLoading] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Contextual Tutor State
  const [tutorOpen, setTutorOpen] = useState<boolean>(false);
  const [tutorInput, setTutorInput] = useState<string>('');
  const [tutorMessages, setTutorMessages] = useState<Array<{ sender: 'user' | 'tutor'; text: string }>>([]);
  const [tutorLoading, setTutorLoading] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await api.getCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = async (courseId: string) => {
    try {
      setCourseLoading(true);
      const detail = await api.getCourseDetails(courseId);
      setSelectedCourse(detail);
      // Automatically select first lesson of first module if available
      if (detail.modules && detail.modules.length > 0 && detail.modules[0].lessons.length > 0) {
        selectLesson(detail.modules[0].lessons[0]);
      } else {
        setActiveLesson(null);
      }
    } catch (err) {
      console.error('Failed to load course details:', err);
    } finally {
      setCourseLoading(false);
    }
  };

  const selectLesson = (lesson: CourseLesson) => {
    setActiveLesson(lesson);
    setSelectedOption(null);
    setQuizSubmitted(false);
    // Reset or seed contextual tutor messages for this lesson
    setTutorMessages([
      {
        sender: 'tutor',
        text: `Hello! I'm your contextual AI tutor for "${lesson.title}". Ask me to explain the code snippet, explore edge cases, or test your architectural understanding.`
      }
    ]);
  };

  const handleToggleComplete = async () => {
    if (!activeLesson) return;
    try {
      const nextCompleted = !activeLesson.completed;
      await api.updateLessonProgress(activeLesson.id, nextCompleted, activeLesson.bookmarked || false);
      setActiveLesson({ ...activeLesson, completed: nextCompleted });
      // Update in selectedCourse hierarchy
      if (selectedCourse && selectedCourse.modules) {
        const updatedModules = selectedCourse.modules.map(mod => ({
          ...mod,
          lessons: mod.lessons.map(l => l.id === activeLesson.id ? { ...l, completed: nextCompleted } : l)
        }));
        setSelectedCourse({ ...selectedCourse, modules: updatedModules });
      }
    } catch (err) {
      console.error('Failed to update lesson progress:', err);
    }
  };

  const handleToggleBookmark = async () => {
    if (!activeLesson) return;
    try {
      const nextBookmark = !activeLesson.bookmarked;
      await api.updateLessonProgress(activeLesson.id, activeLesson.completed || false, nextBookmark);
      setActiveLesson({ ...activeLesson, bookmarked: nextBookmark });
    } catch (err) {
      console.error('Failed to bookmark lesson:', err);
    }
  };

  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorInput.trim() || !activeLesson) return;

    const userQ = tutorInput.trim();
    setTutorMessages(prev => [...prev, { sender: 'user', text: userQ }]);
    setTutorInput('');
    setTutorLoading(true);

    try {
      const res = await api.askTutor(activeLesson.id, userQ);
      setTutorMessages(prev => [...prev, { sender: 'tutor', text: res.response }]);
    } catch (err) {
      console.error('Failed to ask tutor:', err);
      setTutorMessages(prev => [
        ...prev, 
        { sender: 'tutor', text: 'Apologies, I encountered a latency issue. Let us revisit the core lesson concepts.' }
      ]);
    } finally {
      setTutorLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!activeLesson?.code_snippet) return;
    navigator.clipboard.writeText(activeLesson.code_snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const categories = ['all', 'Frontend', 'Backend', 'Architecture', 'DevOps'];
  const filteredCourses = filterCategory === 'all' 
    ? courses 
    : courses.filter(c => c.category.toLowerCase() === filterCategory.toLowerCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        <div className="w-5 h-5 border-2 border-[#35D9F2] border-t-transparent rounded-full animate-spin mr-3" />
        <span>Loading structured curriculum catalog...</span>
      </div>
    );
  }

  // COURSE CATALOG VIEW
  if (!selectedCourse) {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="cyan" size="sm">STRUCTURED CURRICULUM</Badge>
              <span className="text-xs font-mono text-zinc-500">• 100% Topologically Sequenced</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Learning Center
            </h1>
            <p className="text-sm text-[#929CA3] mt-1">
              Curated, production-grade topic modules with interactive code snippets, knowledge checks, and embedded Socratic tutoring.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-[#0B0F12] p-1 rounded-xl border border-white/8 self-start sm:self-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filterCategory === cat
                    ? 'bg-[#161D22] text-[#35D9F2] shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div
              key={course.id}
              onClick={() => handleSelectCourse(course.id)}
              className="bg-[#0B0F12] border border-white/8 hover:border-[#35D9F2]/40 rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:shadow-[0_0_30px_rgba(53,217,242,0.06)]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-md bg-[#161D22] text-[#35D9F2] text-xs font-mono font-medium border border-[#35D9F2]/20">
                    {course.category}
                  </span>
                  <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.estimated_hours}h
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#35D9F2] transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-[#929CA3] leading-relaxed line-clamp-3 mb-6">
                  {course.description}
                </p>
              </div>

              <div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-mono">
                    {course.difficulty_level}
                  </span>
                  <span className="text-[#35D9F2] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Enter Course</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ACTIVE COURSE & LESSON SPLIT VIEW
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/8">
        <button
          onClick={() => setSelectedCourse(null)}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO COURSE CATALOG</span>
        </button>

        <div className="flex items-center gap-3">
          <Badge variant="cyan" size="sm">{selectedCourse.category}</Badge>
          <button
            onClick={() => setTutorOpen(!tutorOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              tutorOpen
                ? 'bg-[#35D9F2]/20 text-[#35D9F2] border-[#35D9F2]/50 shadow-[0_0_15px_rgba(53,217,242,0.2)]'
                : 'bg-[#11171B] text-zinc-300 border-white/10 hover:border-[#35D9F2]/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#35D9F2]" />
            <span>{tutorOpen ? 'Hide AI Tutor' : 'Open AI Tutor'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Syllabus / Module Hierarchy (4 cols) */}
        <div className="lg:col-span-4 bg-[#0B0F12] border border-white/8 rounded-2xl p-5 space-y-5">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Curriculum Syllabus</span>
            <h2 className="text-xl font-bold text-white mt-1">{selectedCourse.title}</h2>
            <p className="text-xs text-[#929CA3] mt-1">{selectedCourse.description}</p>
          </div>

          <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
            {selectedCourse.modules?.map((mod, modIdx) => (
              <div key={mod.id} className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 px-1">
                  <Layers className="w-3.5 h-3.5 text-[#35D9F2]" />
                  <span>Module {modIdx + 1}: {mod.title}</span>
                </div>

                <div className="space-y-1 pl-2 border-l border-white/10">
                  {mod.lessons.map(lesson => {
                    const isActive = activeLesson?.id === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                          isActive
                            ? 'bg-[#161D22] text-[#35D9F2] font-semibold border border-[#35D9F2]/30 shadow-sm'
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {lesson.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#C5F45B] shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-600 shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 shrink-0 ml-2">
                          {lesson.estimated_minutes}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center / Right Column: Active Lesson Workspace (8 cols or 5 cols if Tutor open) */}
        <div className={`${tutorOpen ? 'lg:col-span-5' : 'lg:col-span-8'} space-y-6`}>
          {activeLesson ? (
            <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Lesson Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/8">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{activeLesson.estimated_minutes} MIN ESTIMATED</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {activeLesson.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleBookmark}
                    className={`p-2 rounded-lg border transition-colors ${
                      activeLesson.bookmarked
                        ? 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                        : 'bg-[#11171B] text-zinc-500 border-white/10 hover:text-white'
                    }`}
                    title="Bookmark Lesson"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <Button
                    onClick={handleToggleComplete}
                    variant={activeLesson.completed ? 'lime' : 'outline'}
                    size="sm"
                    icon={activeLesson.completed ? <Check className="w-3.5 h-3.5" /> : undefined}
                  >
                    {activeLesson.completed ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              </div>

              {/* Lesson Markdown Content */}
              <div className="text-sm text-[#F5F7F4] leading-relaxed whitespace-pre-line prose-dark">
                {activeLesson.content_markdown}
              </div>

              {/* Code Snippet Box */}
              {activeLesson.code_snippet && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
                    <span className="flex items-center gap-1.5 text-[#35D9F2]">
                      <Code2 className="w-4 h-4" />
                      <span>PRODUCTION REFERENCE CODE</span>
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 hover:text-white text-zinc-500 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-[#C5F45B]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="relative bg-[#050608] border border-white/10 rounded-xl p-4 overflow-x-auto font-mono text-xs text-emerald-300">
                    <pre>{activeLesson.code_snippet}</pre>
                  </div>
                </div>
              )}

              {/* Key Takeaways */}
              {activeLesson.key_takeaways && activeLesson.key_takeaways.length > 0 && (
                <div className="bg-[#11171B] border border-white/5 rounded-xl p-5 space-y-3">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#C5F45B]">
                    Key Architectural Takeaways
                  </h4>
                  <ul className="space-y-2">
                    {activeLesson.key_takeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <Check className="w-4 h-4 text-[#C5F45B] shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Knowledge Check Interactive Quiz */}
              {activeLesson.quiz_question && activeLesson.quiz_question.question && (
                <div className="bg-[#11171B] border border-white/10 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#35D9F2]">
                    <HelpCircle className="w-4 h-4" />
                    <span>EMBEDDED KNOWLEDGE CHECK</span>
                  </div>

                  <p className="text-sm font-semibold text-white">
                    {activeLesson.quiz_question.question}
                  </p>

                  <div className="space-y-2">
                    {activeLesson.quiz_question.options?.map((opt, idx) => {
                      const isCorrect = idx === activeLesson.quiz_question?.correct_index;
                      const isSelected = selectedOption === idx;
                      let optionClasses = 'bg-[#0B0F12] border-white/10 text-zinc-300 hover:border-white/20';
                      
                      if (quizSubmitted) {
                        if (isCorrect) {
                          optionClasses = 'bg-[#C5F45B]/15 border-[#C5F45B]/50 text-[#C5F45B] font-semibold';
                        } else if (isSelected && !isCorrect) {
                          optionClasses = 'bg-rose-500/15 border-rose-500/40 text-rose-300';
                        }
                      } else if (isSelected) {
                        optionClasses = 'bg-[#35D9F2]/10 border-[#35D9F2] text-[#35D9F2] font-medium';
                      }

                      return (
                        <button
                          key={idx}
                          disabled={quizSubmitted}
                          onClick={() => setSelectedOption(idx)}
                          className={`w-full text-left p-3.5 rounded-xl text-xs border transition-all flex items-center justify-between ${optionClasses}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-[#C5F45B]" />}
                        </button>
                      );
                    })}
                  </div>

                  {!quizSubmitted ? (
                    <Button
                      onClick={() => setQuizSubmitted(true)}
                      disabled={selectedOption === null}
                      variant="primary"
                      size="sm"
                      className="mt-2"
                    >
                      Verify Answer
                    </Button>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-[#0B0F12] border border-white/5 text-xs space-y-1">
                      <span className="font-semibold text-white block">Explanation:</span>
                      <p className="text-zinc-400">
                        {activeLesson.quiz_question.explanation || 'Option validated against conceptual standard.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#0B0F12] border border-white/8 rounded-2xl p-12 text-center text-zinc-500">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a lesson from the syllabus to begin learning.</p>
            </div>
          )}
        </div>

        {/* Right Drawer: Contextual AI Tutor (3 cols when open) */}
        {tutorOpen && (
          <div className="lg:col-span-3 bg-[#0B0F12] border border-[#35D9F2]/30 rounded-2xl p-4 flex flex-col h-[650px] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#35D9F2]" />
                <span className="text-xs font-mono font-bold text-white uppercase">AI Socratic Tutor</span>
              </div>
              <span className="text-[10px] font-mono text-[#C5F45B]">CONTEXT-ACTIVE</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 custom-scrollbar pr-1">
              {tutorMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#161D22] text-[#F5F7F4] ml-4 border border-white/5'
                      : 'bg-[#11171B] text-zinc-300 mr-2 border border-[#35D9F2]/20'
                  }`}
                >
                  <span className="text-[10px] font-mono block text-zinc-500 mb-1">
                    {msg.sender === 'user' ? 'YOU' : 'NEXORA TUTOR'}
                  </span>
                  {msg.text}
                </div>
              ))}
              {tutorLoading && (
                <div className="p-3 rounded-xl bg-[#11171B] text-xs text-zinc-400 animate-pulse flex items-center gap-2">
                  <div className="w-3 h-3 border border-[#35D9F2] border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing code context...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleAskTutor} className="pt-2 border-t border-white/8 flex gap-2">
              <input
                type="text"
                value={tutorInput}
                onChange={e => setTutorInput(e.target.value)}
                placeholder="Ask about this code..."
                className="flex-1 bg-[#11171B] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#35D9F2]"
              />
              <button
                type="submit"
                disabled={tutorLoading || !tutorInput.trim()}
                className="p-2 rounded-lg bg-[#35D9F2] text-[#050608] hover:bg-[#2bc4dc] disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};