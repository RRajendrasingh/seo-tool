"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AIChatClient({ user }) {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hi! I'm Sarah, your AI SEO Auditor. Give me any website URL (e.g. `example.com`), and I will launch a headless Puppeteer browser to crawl it and run a real-time audit for you!",
      time: "Just now"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startVoiceDictation = () => {
    setErrorMsg("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Speech dictation is not supported in this browser. Please type.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onerror = (e) => {
        console.error("Dictation error:", e.error);
        setIsListening(false);
        setErrorMsg(`Speech error: ${e.error}`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? prev + " " + transcript : transcript));
        }
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setInputText("");
    setErrorMsg("");

    // Append user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        text: userMsg,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);

    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: messages })
      });
      const data = await res.json();
      
      if (res.ok && data.response) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "ai",
            text: data.response,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      } else {
        setErrorMsg(data.error || "Failed to contact the audit agent.");
      }
    } catch (err) {
      setErrorMsg("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chipText) => {
    setInputText(chipText);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-300 flex flex-col font-sans transition-colors duration-300">
      {/* Header bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="h-8 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-xxs font-bold text-slate-400 hover:text-white transition-all border border-slate-800 cursor-pointer"
          >
            ← Back to Dashboard
          </button>
          <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
          <h1 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
            AI Crawl Consultant
          </h1>
        </div>

        <div className="flex items-center gap-3 p-1.5 rounded-2xl border border-slate-900 bg-slate-900/10">
          <div className="h-7 w-7 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-xs overflow-hidden shrink-0">
            {user.picture?.startsWith("http") ? (
              <img src={user.picture} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              user.picture || "👤"
            )}
          </div>
          <div className="text-left hidden sm:block pr-2">
            <span className="text-[7.5px] uppercase tracking-wider font-extrabold text-slate-500 block leading-none">Crawl Account</span>
            <p className="text-[9px] font-bold text-primary truncate max-w-[120px] leading-tight">{user.email}</p>
          </div>
        </div>
      </header>

      {/* Main chat window container */}
      <div className="flex-grow max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* Left Column: Sarah profile and suggestions */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-11 w-11 rounded-full border-2 border-emerald-500/80 flex items-center justify-center bg-violet-600/10 text-xl shadow-[0_0_10px_rgba(16,185,129,0.3)] overflow-hidden">
                  👩‍💼
                </div>
                <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950"></span>
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-white leading-none">Sarah</h3>
                <span className="text-[8px] uppercase font-black tracking-wider text-zinc-500 block mt-1">SEO Consultant</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              I can crawl websites directly using Puppeteer. Just type a message containing a URL, and I will perform an analysis of its titles, descriptions, missing images, and metadata!
            </p>

            <div className="border-t border-slate-850 pt-3">
              <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Capabilities:</span>
              <ul className="text-[9.5px] text-slate-400 space-y-1.5 list-disc pl-3">
                <li>Puppeteer browser crawler</li>
                <li>H1 heading tags audit</li>
                <li>Meta tag optimizations</li>
                <li>Image ALT attribute reports</li>
              </ul>
            </div>
          </div>

          <div className="hidden md:block bg-slate-900/20 border border-slate-850 rounded-3xl p-4 text-left">
            <span className="text-[8px] uppercase tracking-widest font-black text-slate-500 block mb-2">Helpful Tip</span>
            <p className="text-[9.5px] text-slate-500 leading-normal">
              Type `crawling speedcheck www.mysite.com` to analyze page structures, or query standard SEO tips.
            </p>
          </div>
        </div>

        {/* Right Column: Chat messages interface */}
        <div className="flex-grow flex flex-col bg-slate-900/20 border border-slate-800 rounded-3xl overflow-hidden h-[calc(100vh-140px)] shadow-xl relative">
          
          {/* Scrollable messages box */}
          <div className="flex-grow overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[calc(100vh-230px)]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto text-left"
                }`}
              >
                <div
                  className={`h-7 w-7 rounded-xl flex items-center justify-center text-xs flex-shrink-0 ${
                    msg.sender === "user" ? "bg-blue-600 text-white" : "bg-violet-600/10 border border-violet-500/20"
                  }`}
                >
                  {msg.sender === "user" ? "👤" : "👩‍💼"}
                </div>
                <div>
                  <div
                    className={`rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-none text-left"
                        : "bg-slate-950 text-slate-300 rounded-tl-none border border-slate-800"
                    }`}
                  >
                    {msg.text.split("\n").map((line, idx) => (
                      <p key={idx} className={line.trim() ? "mb-1.5 last:mb-0" : "h-2"}>
                        {line}
                      </p>
                    ))}
                  </div>
                  <span className="text-[8px] text-slate-550 block mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {/* Crawling loading animation */}
            {loading && (
              <div className="flex gap-3 mr-auto text-left max-w-[80%]">
                <div className="h-7 w-7 rounded-xl flex items-center justify-center bg-violet-600/10 border border-violet-500/20 text-xs">
                  👩‍💼
                </div>
                <div className="space-y-1.5">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-400 flex items-center gap-2">
                    <span className="animate-spin text-lg">⚙️</span>
                    <span>Sarah is launching Puppeteer to inspect the website...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-select Chip Suggestions */}
          <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/20 flex flex-wrap gap-2 text-left">
            {[
              "Audit example.com",
              "How do H1 tags help SEO?",
              "Crawl www.google.com"
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="py-1 px-2.5 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 text-[9.5px] font-bold text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input field area */}
          <div className="p-4 border-t border-slate-900 bg-slate-950/40 relative">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Message Sarah or enter a URL (e.g., mysite.com)..."}
                  disabled={loading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 pr-10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 disabled:opacity-50"
                />
                
                {/* Speech Dictation Mic button */}
                <button
                  type="button"
                  onClick={startVoiceDictation}
                  disabled={loading}
                  className={`absolute right-2.5 top-2.5 h-7.5 w-7.5 rounded-full flex items-center justify-center border-0 transition-all cursor-pointer ${
                    isListening 
                      ? "bg-red-500/20 text-red-500 animate-pulse" 
                      : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                  title="Speak message"
                >
                  🎙️
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="px-5 py-3 rounded-xl bg-blue-650 hover:bg-blue-500 disabled:bg-slate-900 disabled:text-slate-600 text-white font-extrabold text-xs uppercase tracking-widest transition-all duration-200 border-0 cursor-pointer shadow-md disabled:shadow-none active:scale-98 shrink-0"
              >
                Send
              </button>
            </form>

            {errorMsg && (
              <p className="text-[9px] text-red-400 font-bold text-left mt-2 pl-2">
                {errorMsg}
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
