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
    <div className="bg-zinc-950 min-h-screen text-zinc-300 flex flex-col font-sans transition-colors duration-300 relative isolate overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 -z-10 h-[600px] w-[600px] translate-x-1/3 rounded-full bg-cyan-600/10 blur-[150px] opacity-60 pointer-events-none" />
      {/* Header bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-30 w-full">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => router.push("/dashboard/")}
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-[10px] sm:text-xs font-bold text-zinc-400 hover:text-white transition-all border border-zinc-800/80 shadow-inner cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </button>
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-700 hidden sm:block" />
            <h1 className="text-[10px] sm:text-xs font-black text-zinc-200 uppercase tracking-widest flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
              AI Crawl Consultant
            </h1>
          </div>

          <div className="flex items-center gap-3 p-1.5 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 shadow-inner">
            <div className="h-7 sm:h-8 w-7 sm:w-8 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-xs overflow-hidden shrink-0">
              {user.picture?.startsWith("http") ? (
                <img src={user.picture} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user.picture || "👤"
              )}
            </div>
            <div className="text-left hidden md:block pr-3 pl-1">
              <span className="text-[7.5px] uppercase tracking-wider font-extrabold text-zinc-500 block leading-none">Crawl Account</span>
              <p className="text-[10px] font-bold text-white truncate max-w-[140px] leading-tight mt-0.5">{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main chat window container */}
      <div className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6 lg:gap-10 overflow-hidden">
        
        {/* Left Column: Sarah profile and suggestions */}
        <div className="w-full md:w-72 lg:w-80 flex-shrink-0 space-y-6 flex flex-col h-full">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 lg:p-6 text-left space-y-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-11 w-11 rounded-full border-2 border-emerald-500/80 flex items-center justify-center bg-violet-600/10 text-xl shadow-[0_0_10px_rgba(16,185,129,0.3)] overflow-hidden">
                  👩‍💼
                </div>
                <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-zinc-950"></span>
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-none">Sarah</h3>
              <span className="text-[9px] uppercase font-black tracking-wider text-zinc-500 block mt-1.5">SEO Consultant</span>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            I can crawl websites directly using Puppeteer. Just type a message containing a URL, and I will perform an analysis of its titles, descriptions, missing images, and metadata!
          </p>

          <div className="border-t border-zinc-800/80 pt-4">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-2.5">Capabilities:</span>
            <ul className="text-[10px] text-zinc-400 space-y-2 list-disc pl-3">
              <li>Puppeteer browser crawler</li>
              <li>H1 heading tags audit</li>
              <li>Meta tag optimizations</li>
              <li>Image ALT attribute reports</li>
            </ul>
          </div>
        </div>

        <div className="hidden md:block bg-zinc-900/20 border border-zinc-800/60 rounded-3xl p-5 text-left shadow-inner mt-auto mb-6">
          <span className="text-[9px] uppercase tracking-widest font-black text-violet-500 block mb-2">Helpful Tip</span>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
            Type `crawling speedcheck www.mysite.com` to analyze page structures, or query standard SEO tips.
          </p>
        </div>
        </div>

        {/* Right Column: Chat messages interface */}
        <div className="flex-grow flex flex-col bg-zinc-900/30 border border-zinc-800/80 rounded-[2rem] overflow-hidden h-[calc(100vh-140px)] shadow-2xl relative backdrop-blur-md">
          
          {/* Scrollable messages box */}
          <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5 max-h-[calc(100vh-230px)] custom-scrollbar">
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
                    className={`rounded-2xl p-4 text-[13px] leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-violet-600 text-white rounded-tr-sm text-left shadow-[0_4px_15px_rgba(124,58,237,0.2)]"
                        : "bg-zinc-900/80 text-zinc-300 rounded-tl-sm border border-zinc-800/80 shadow-inner"
                    }`}
                  >
                    {msg.text.split("\n").map((line, idx) => (
                      <p key={idx} className={line.trim() ? "mb-2 last:mb-0" : "h-2"}>
                        {line}
                      </p>
                    ))}
                  </div>
                  <span className={`text-[9px] font-black tracking-wider text-zinc-500 block mt-1.5 px-1 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
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
                  <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl rounded-tl-sm p-4 text-[13px] text-zinc-400 flex items-center gap-3 shadow-inner">
                    <span className="animate-spin text-lg">⚙️</span>
                    <span>Sarah is launching Puppeteer to inspect the website...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-select Chip Suggestions */}
          <div className="px-6 py-3 border-t border-zinc-800/60 bg-zinc-950/40 flex flex-wrap gap-2 text-left backdrop-blur-md">
            {[
              "Audit example.com",
              "How do H1 tags help SEO?",
              "Crawl www.google.com"
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="py-1.5 px-3 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-violet-500/50 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_10px_rgba(139,92,246,0.1)]"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input field area */}
          <div className="p-4 sm:p-6 border-t border-zinc-800/80 bg-zinc-900/40 relative backdrop-blur-xl">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Message Sarah or enter a URL (e.g., mysite.com)..."}
                  disabled={loading}
                  className="w-full bg-zinc-950 border border-zinc-800/80 rounded-2xl py-4 px-5 pr-12 text-[13px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 shadow-inner disabled:opacity-50 transition-all"
                />
                
                {/* Speech Dictation Mic button */}
                <button
                  type="button"
                  onClick={startVoiceDictation}
                  disabled={loading}
                  className={`absolute right-3 top-3 h-8 w-8 rounded-full flex items-center justify-center border-0 transition-all cursor-pointer ${
                    isListening 
                      ? "bg-red-500/20 text-red-500 animate-pulse ring-2 ring-red-500/50" 
                      : "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/80"
                  }`}
                  title="Speak message"
                >
                  🎙️
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:opacity-90 disabled:from-zinc-900 disabled:to-zinc-900 disabled:text-zinc-600 text-white font-black text-xs uppercase tracking-widest transition-all duration-300 border-0 cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] disabled:shadow-none active:scale-[0.98] shrink-0"
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
