import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Clock, Send, ChevronLeft, ChevronRight, HelpCircle, Loader2, AlertTriangle, ShieldCheck, Check, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  content: string;
}

interface Question {
  id: string;
  content: string;
  type: "single" | "multiple" | "text" | "ordering";
  options: Option[];
}

export default function QuizTakePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(0); // seconds
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const loadExam = async () => {
      try {
        const data = await apiFetch<any>(`/exams/${id}`);
        setExam(data);
        setTimeLeft((data.duration || 30) * 60);
      } catch (err) {
        toast.error("Không thể tải bài thi");
        navigate("/quizzes");
      } finally {
        setLoading(false);
      }
    };
    loadExam();
  }, [id, navigate]);

  // Initialize Ordering Answers if not already set
  useEffect(() => {
    if (!exam) return;
    const q = exam.questions[currentIdx];
    if (q.type === "ordering" && !userAnswers[q.id]) {
      const sentence = q.options?.[0]?.content || "";
      const words = sentence.trim().split(/\s+/).map((w, i) => ({ id: `w-${q.id}-${i}`, word: w }));
      // Shuffle once
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setUserAnswers(prev => ({ 
        ...prev, 
        [q.id]: { available: shuffled, selected: [] }
      }));
    }
  }, [currentIdx, exam]);

  const handleOrderingClick = (qId: string, item: any, from: "available" | "selected") => {
    const current = userAnswers[qId] || { available: [], selected: [] };
    if (from === "available") {
      setUserAnswers({
        ...userAnswers,
        [qId]: {
          available: current.available.filter((x: any) => x.id !== item.id),
          selected: [...current.selected, item]
        }
      });
    } else {
      setUserAnswers({
        ...userAnswers,
        [qId]: {
          available: [...current.available, item],
          selected: current.selected.filter((x: any) => x.id !== item.id)
        }
      });
    }
  };

  const handleSubmit = useCallback(() => {
    if (!exam) return;
    
    // Normalize userAnswers for backend (for ordering, join with spaces)
    const normalizedAnswers = { ...userAnswers };
    exam.questions.forEach(q => {
      if (q.type === "ordering" && normalizedAnswers[q.id]?.selected) {
        normalizedAnswers[q.id] = normalizedAnswers[q.id].selected.map((x: any) => x.word).join(" ");
      }
    });

    navigate("/quizzes/result", { 
      state: { 
        exam, 
        userAnswers: normalizedAnswers,
        timeTaken: (exam.duration * 60) - timeLeft
      } 
    });
    toast.success("Đã nộp bài thành công");
  }, [exam, userAnswers, timeLeft, navigate]);

  useEffect(() => {
    if (loading || !exam || timeLeft <= 0) {
      if (timeLeft === 0 && exam) handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, exam, timeLeft, handleSubmit]);

  const getFormattedTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return {
      minutes: m.toString().padStart(2, "0"),
      seconds: s.toString().padStart(2, "0")
    };
  };

  const TimerCard = ({ value, isDanger }: { value: string, isDanger: boolean }) => (
    <div className={`flex items-center justify-center rounded-lg p-1 transition-all duration-300 ${
      isDanger ? "text-red-600 animate-pulse" : "text-gray-800"
    }`}>
      <span className="text-xl sm:text-2xl font-black tabular-nums tracking-tighter">
        {value}
      </span>
    </div>
  );

  const handleAnswer = (qId: string, value: any) => {
    const q = exam?.questions.find(q => q.id === qId);
    if (!q) return;

    if (q.type === "multiple") {
      const current = (userAnswers[qId] || []) as string[];
      if (current.includes(value)) {
        setUserAnswers({ ...userAnswers, [qId]: current.filter(v => v !== value) });
      } else {
        setUserAnswers({ ...userAnswers, [qId]: [...current, value] });
      }
    } else {
      setUserAnswers({ ...userAnswers, [qId]: value });
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!exam) return null;

  const currentQuestion = exam.questions[currentIdx];

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 sticky top-0 z-40 w-full border-b bg-white px-2 sm:px-4 shadow-sm">
        <div className="container max-w-7xl py-2 flex items-center justify-between gap-2 sm:gap-4">
          {/* Title Area */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <div className="hidden sm:flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base font-black truncate text-gray-800 leading-tight">{exam.title}</h1>
              <p className="hidden sm:block text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-[0.1em]">Làm bài thi trắc nghiệm</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Timer */}
            <div className="flex items-center gap-1 bg-slate-50/80 rounded-xl p-1 px-3 border border-slate-100">
              <Clock className="h-3.5 w-3.5 text-slate-400 mr-0.5" />
              <TimerCard 
                value={getFormattedTime(timeLeft).minutes} 
                isDanger={timeLeft < 60} 
              />
              <div className={`text-lg font-bold mx-0.5 ${timeLeft < 60 ? "text-red-500" : "text-slate-300"}`}>:</div>
              <TimerCard 
                value={getFormattedTime(timeLeft).seconds} 
                isDanger={timeLeft < 60} 
              />
            </div>
            {/* Submit */}
            <Button 
              onClick={handleSubmit} 
              className="rounded-xl h-8 sm:h-10 px-4 sm:px-6 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nộp bài</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl flex-1 min-h-0 py-4 lg:py-6 px-4 flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Content Area */}
        <section className="flex-1 lg:flex-[3] flex flex-col order-1 w-full min-h-0 gap-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 flex-1 overflow-y-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div>
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
                  Câu hỏi {currentIdx + 1}
                </span>
                {currentQuestion.type === "ordering" && (
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                     <Gamepad2 className="h-3 w-3" /> Sắp xếp câu
                   </div>
                )}
              </div>
              
              <div className="mb-4 sm:mb-6 bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-100">
                <h2 className="text-base sm:text-lg font-medium leading-relaxed text-gray-800 whitespace-pre-wrap">
                  {(currentQuestion.type === "ordering" && (!currentQuestion.content || currentQuestion.content === "Sắp xếp câu")) 
                    ? "Sắp xếp lại theo thứ tự đúng của câu." 
                    : currentQuestion.content}
                </h2>
                {currentQuestion.type === "ordering" && (
                  <div className="text-sm text-muted-foreground flex items-center mt-3">
                    <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full"><HelpCircle className="w-4 h-4" /> Click vào từng từ để chuyển xuống ô trống bên dưới</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {currentQuestion.type === "ordering" ? (
                  <div className="space-y-6">
                    {/* Top list: Available Words */}
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 min-h-[60px]">
                      {(userAnswers[currentQuestion.id]?.available || []).map((item: any) => (
                        <button
                          key={item.id}
                          onClick={() => handleOrderingClick(currentQuestion.id, item, "available")}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border-2 shadow-sm font-heading text-sm sm:text-base font-bold transition-all border-green-500 bg-green-500 text-white hover:bg-green-600 hover:scale-105"
                        >
                          {item.word}
                        </button>
                      ))}
                    </div>
                    
                    {/* Bottom list: Selected Words */}
                    <div className="p-4 sm:p-6 rounded-3xl border-4 border-dashed bg-gray-50/50 border-gray-200 min-h-[120px] flex flex-wrap justify-center gap-2 sm:gap-3 items-center content-center">
                      {(userAnswers[currentQuestion.id]?.selected || []).map((item: any) => (
                        <button
                          key={item.id}
                          onClick={() => handleOrderingClick(currentQuestion.id, item, "selected")}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border-2 shadow-sm font-heading text-sm sm:text-base font-bold transition-all border-green-200 bg-green-50 text-green-700 hover:bg-red-50 hover:border-red-200 hover:text-red-500"
                        >
                          {item.word}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : currentQuestion.type === "text" ? (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-widest">Nhập đáp án của bạn:</p>
                    <textarea
                      placeholder="Nhập nội dung trả lời..."
                      value={userAnswers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      className="w-full min-h-[120px] p-4 sm:p-5 rounded-2xl border-2 border-gray-100 bg-gray-50/50 focus:border-primary/30 focus:bg-white focus:outline-none transition-all text-sm sm:text-base font-medium"
                    />
                  </div>
                ) : (
                  <div className="grid gap-2 sm:gap-3">
                    {currentQuestion.options.map((option, oIdx) => {
                      const isSelected = currentQuestion.type === "multiple" 
                        ? (userAnswers[currentQuestion.id] || []).includes(option.id)
                        : userAnswers[currentQuestion.id] === option.id;
                      
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleAnswer(currentQuestion.id, option.id)}
                          className={`flex items-center gap-3 p-3 sm:p-4 rounded-2xl border-2 text-left transition-all ${
                            isSelected 
                              ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/5" 
                              : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/30"
                          }`}
                        >
                          <div className={`flex shrink-0 h-6 w-6 items-center justify-center border-2 transition-all ${
                            currentQuestion.type === "single" ? "rounded-full" : "rounded-[6px]"
                          } ${
                            isSelected ? "bg-primary border-primary text-white" : "border-gray-300 bg-white"
                          }`}>
                            {isSelected && (
                              currentQuestion.type === "single" ? (
                                <div className="h-2 w-2 rounded-full bg-white" />
                              ) : (
                                <Check className="h-4 w-4" strokeWidth={3} />
                              )
                            )}
                          </div>
                          <span className={`text-sm sm:text-base font-semibold ${isSelected ? "text-primary" : "text-gray-700"}`}>
                            {option.content}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nav Controls */}
          <div className="shrink-0 flex items-center justify-between bg-white rounded-2xl p-2 sm:p-3 shadow-sm border border-gray-100">
            <Button
              variant="ghost"
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="rounded-xl h-9 sm:h-10 px-3 sm:px-5 font-bold flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <ChevronLeft className="h-4 w-4" /> Câu trước
            </Button>
            
            <div className="text-xs sm:text-sm font-bold text-muted-foreground tabular-nums px-2">
              {currentIdx + 1} / {exam.questions.length}
            </div>

            {currentIdx < exam.questions.length - 1 ? (
              <Button
                onClick={() => setCurrentIdx(prev => Math.max(0, prev + 1))}
                className="rounded-xl h-9 sm:h-10 px-3 sm:px-5 font-bold flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                Câu tiếp theo <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="rounded-xl h-9 sm:h-10 px-4 sm:px-6 font-bold flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-600/20 text-xs sm:text-sm"
              >
                Nộp bài
              </Button>
            )}
          </div>
        </section>

        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-[260px] shrink-0 flex flex-col gap-4 order-2 min-h-0">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 flex flex-col flex-1 min-h-0">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 shrink-0">Mục lục câu hỏi</h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-5 gap-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-1 content-start pr-1">
              {exam.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${
                    idx === currentIdx 
                      ? "bg-primary text-white shadow-md shadow-primary/20 ring-4 ring-primary/5 scale-110" 
                      : userAnswers[q.id] !== undefined && (
                          q.type === "ordering" ? userAnswers[q.id]?.selected?.length > 0 :
                          (Array.isArray(userAnswers[q.id]) ? userAnswers[q.id].length > 0 : userAnswers[q.id] !== "")
                        ) 
                        ? "bg-green-100 text-green-700 border border-green-200" 
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-orange-50 rounded-2xl p-4 sm:p-5 border border-orange-100 space-y-2 shrink-0">
            <div className="flex items-center gap-2 text-orange-700 font-bold text-sm">
              <AlertTriangle className="h-4 w-4" /> Lưu ý quan trọng
            </div>
            <p className="text-xs text-orange-600 leading-relaxed font-medium">
              Bạn không nên tải lại trang hoặc nhấn nút quay lại để tránh mất dữ liệu bài làm. Toàn bộ đáp án sẽ được nộp tự động khi hết giờ.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
