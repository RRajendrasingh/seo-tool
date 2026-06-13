"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getAllLeads,
  updateLead,
  deleteLead,
  resetToMock,
  clearAllLeads,
  exportToCSV,
  getSettings,
  saveSettings,
  triggerWebhook,
} from "@/utils/leadsStore";
import {
  getAllPosts,
  addPost,
  deletePost,
  resetToDefaultPosts
} from "@/utils/postsStore";
import dynamic from "next/dynamic";

const CKEditorBlock = dynamic(() => import("@/components/CKEditorBlock"), {
  ssr: false,
  loading: () => (
    <div className="bg-zinc-950 text-zinc-500 text-xs p-8 text-center rounded-xl border border-zinc-850 animate-pulse">
      Loading Rich Text Editor...
    </div>
  ),
});

export default function AdminDashboard() {
  const router = useRouter();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState("");

  // Leads & Data States
  const [leads, setLeads] = useState([]);
  const [settings, setSettings] = useState({ adminPasscode: "admin123", webhookUrl: "", web3formsKey: "" });
  const [activeTab, setActiveTab] = useState("leads"); // 'leads' | 'analytics' | 'settings'

  // Blog CMS States
  const [posts, setPosts] = useState([]);
  const [postTitle, setPostTitle] = useState("");
  const [postSlug, setPostSlug] = useState(""); // Customizable slug state
  const [postDesc, setPostDesc] = useState("");
  const [postContent, setPostContent] = useState(""); // Rich HTML from CKEditor
  const [postFeaturedImage, setPostFeaturedImage] = useState(""); // Featured image URL
  const [postCategory, setPostCategory] = useState("Core Updates");
  const [customCategory, setCustomCategory] = useState(""); // Custom Category input
  const [postAuthor, setPostAuthor] = useState("Martin"); // Default is Martin
  const [postFeatured, setPostFeatured] = useState(false);
  const [blogSuccess, setBlogSuccess] = useState("");
  const [blogError, setBlogError] = useState("");
  const ckeditorRef = useRef(null); // Holds the CKEditor instance

  // Auto-generate slug when title changes
  useEffect(() => {
    const cleaned = postTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPostSlug(cleaned);
  }, [postTitle]);

  // Filter & Search States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [packageFilter, setPackageFilter] = useState("All");
  const [scoreFilter, setScoreFilter] = useState("All"); // 'All' | 'Excellent' | 'Good' | 'Fair' | 'Critical'
  const [sortBy, setSortBy] = useState("date"); // 'date' | 'score' | 'name'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' | 'desc'

  // Selected Lead Modal State
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadStatus, setLeadStatus] = useState("");
  const [leadNotes, setLeadNotes] = useState("");

  // Settings State Updates
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [webhookInput, setWebhookInput] = useState("");
  const [web3formsInput, setWeb3formsInput] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState("");

  // Load configuration and session status on mount
  useEffect(() => {
    const loadedSettings = getSettings();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadedSettings);
    setWebhookInput(loadedSettings.webhookUrl || "");
    setWeb3formsInput(loadedSettings.web3formsKey || "");

    // Check session storage for auto-login during active session
    if (typeof window !== "undefined") {
      const authSession = sessionStorage.getItem("admin_authenticated");
      if (authSession === "true") {
        setIsAuthenticated(true);
        getAllLeads().then(setLeads).catch(console.error);
        getAllPosts().then(setPosts).catch(console.error); // Fetch posts
      }
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === settings.adminPasscode) {
      setIsAuthenticated(true);
      getAllLeads().then(setLeads).catch(console.error);
      getAllPosts().then(setPosts).catch(console.error); // Fetch posts
      sessionStorage.setItem("admin_authenticated", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid passcode. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasscode("");
    sessionStorage.removeItem("admin_authenticated");
  };

  // Sync state after modifications
  const refreshLeads = () => {
    getAllLeads().then(setLeads).catch(console.error);
  };

  const refreshPosts = () => {
    getAllPosts().then(setPosts).catch(console.error);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext("2d");

        const imgWidth = img.width;
        const imgHeight = img.height;
        const targetWidth = 1280;
        const targetHeight = 720;

        const ratio = Math.max(targetWidth / imgWidth, targetHeight / imgHeight);
        const newWidth = imgWidth * ratio;
        const newHeight = imgHeight * ratio;
        const x = (targetWidth - newWidth) / 2;
        const y = (targetHeight - newHeight) / 2;

        ctx.drawImage(img, x, y, newWidth, newHeight);
        const compressedBase64 = canvas.toDataURL("image/webp", 0.75);
        setPostFeaturedImage(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePublishPost = (e) => {
    e.preventDefault();
    setBlogSuccess("");
    setBlogError("");

    // Grab the latest HTML from CKEditor instance if it exists
    const richContent = ckeditorRef.current ? ckeditorRef.current.getData() : postContent;

    if (!postTitle.trim() || !postDesc.trim()) {
      setBlogError("Article title and short description are required.");
      return;
    }

    const finalCategory = postCategory === "custom" ? customCategory.trim() : postCategory;
    if (!finalCategory) {
      setBlogError("Category is required.");
      return;
    }

    try {
      addPost({
        title: postTitle,
        slug: postSlug,
        desc: postDesc,
        content: richContent,
        featuredImage: postFeaturedImage,
        category: finalCategory,
        author: postAuthor,
        featured: postFeatured,
      }).then(() => {
        setPostTitle("");
        setPostSlug("");
        setPostDesc("");
        setPostFeaturedImage("");
        setPostContent("");
        setCustomCategory("");
        setPostCategory("Core Updates");
        if (ckeditorRef.current) {
          ckeditorRef.current.setData("");
        }
        setPostFeatured(false);
        setBlogSuccess("Article published successfully and is now live on the /news page!");
        refreshPosts();
      }).catch(err => {
        setBlogError(`Publish failed: ${err.message}`);
      });
    } catch (err) {
      setBlogError(`Publish failed: ${err.message}`);
    }
  };

  const handleDeletePost = (id) => {
    if (confirm("Are you sure you want to delete this news article?")) {
      deletePost(id).then(() => {
        refreshPosts();
      }).catch(console.error);
    }
  };

  const handleResetPosts = () => {
    if (confirm("This will overwrite custom posts and reset to the 5 default news articles. Proceed?")) {
      resetToDefaultPosts().then((reset) => {
        setPosts(reset);
      }).catch(console.error);
    }
  };

  // Status/Notes Updates
  const handleOpenLeadDetails = (lead) => {
    setSelectedLead(lead);
    setLeadStatus(lead.status);
    setLeadNotes(lead.notes || "");
  };

  const handleSaveLeadChanges = () => {
    if (!selectedLead) return;
    updateLead(selectedLead.id, {
      status: leadStatus,
      notes: leadNotes,
    }).then((updated) => {
      if (updated) {
        refreshLeads();
        setSelectedLead(null);
      }
    }).catch(console.error);
  };

  const handleDeleteLead = (id) => {
    if (confirm("Are you sure you want to delete this lead? This action cannot be undone.")) {
      deleteLead(id).then(() => {
        refreshLeads();
      }).catch(console.error);
    }
  };

  const handleResetMockData = () => {
    if (confirm("This will overwrite existing leads with a set of realistic mock data. Proceed?")) {
      resetToMock().then((fresh) => {
        setLeads(fresh);
      }).catch(console.error);
    }
  };

  const handleClearAllData = () => {
    if (confirm("Are you sure you want to clear ALL leads? This will empty the database.")) {
      clearAllLeads().then(() => {
        setLeads([]);
      }).catch(console.error);
    }
  };

  // Settings modification
  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSettingsSuccess("");
    setSettingsError("");

    const updatedSettings = {
      ...settings,
      webhookUrl: webhookInput.trim(),
      web3formsKey: web3formsInput.trim(),
    };

    if (newPasscode) {
      if (newPasscode !== confirmPasscode) {
        setSettingsError("New passcodes do not match.");
        return;
      }
      if (newPasscode.length < 4) {
        setSettingsError("Passcode must be at least 4 characters long.");
        return;
      }
      updatedSettings.adminPasscode = newPasscode;
    }

    saveSettings(updatedSettings);
    setSettings(updatedSettings);
    setNewPasscode("");
    setConfirmPasscode("");
    setSettingsSuccess("Settings saved successfully!");
  };

  // Webhook Tester
  const handleTestWebhook = async () => {
    if (!webhookInput) {
      setWebhookTestResult("Please provide a webhook URL first.");
      return;
    }
    setWebhookTesting(true);
    setWebhookTestResult("");
    try {
      const mockLead = {
        id: "lead_test",
        name: "Test Lead System",
        email: "test@seointellect.com",
        phone: "+1 555-999-0000",
        website: "test-site.com",
        date: new Date().toISOString(),
        seoScore: 88,
        grade: "B",
        status: "New",
        packageRequest: "Premium Report",
        amountPaid: 29,
        notes: "Automated verification test lead.",
      };
      
      const payload = {
        event: "test_webhook",
        timestamp: new Date().toISOString(),
        lead: mockLead,
      };

      const res = await fetch(webhookInput, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        mode: "no-cors",
      });
      setWebhookTestResult("Test request sent! Verify your endpoint (Zapier, Make, Discord) received the payload.");
    } catch (e) {
      setWebhookTestResult(`Test failed: ${e.message}`);
    } finally {
      setWebhookTesting(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = exportToCSV();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `seointellect_leads_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Search Logic
  const filteredLeads = leads
    .filter((l) => {
      const matchesSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        l.website.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "All" || l.status === statusFilter;
      const matchesPackage = packageFilter === "All" || l.packageRequest === packageFilter;
      
      let matchesScore = true;
      if (scoreFilter !== "All") {
        const score = l.seoScore;
        if (scoreFilter === "Excellent") matchesScore = score >= 90;
        else if (scoreFilter === "Good") matchesScore = score >= 80 && score < 90;
        else if (scoreFilter === "Fair") matchesScore = score >= 50 && score < 80;
        else if (scoreFilter === "Critical") matchesScore = score < 50;
      }

      return matchesSearch && matchesStatus && matchesPackage && matchesScore;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "score") {
        comparison = a.seoScore - b.seoScore;
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Calculate Dashboard KPI stats
  const totalLeadsCount = leads.length;
  const closedWonLeads = leads.filter((l) => l.status === "Closed Won");
  const totalPaidRevenue = leads.reduce((sum, l) => sum + parseFloat(l.amountPaid || 0), 0);
  const conversionRate = totalLeadsCount
    ? Math.round((closedWonLeads.length / totalLeadsCount) * 100)
    : 0;

  const validScoreLeads = leads.filter((l) => l.seoScore > 0);
  const averageSeoScore = validScoreLeads.length
    ? Math.round(validScoreLeads.reduce((sum, l) => sum + Number(l.seoScore || 0), 0) / validScoreLeads.length)
    : 0;

  // Compile Chart data for SVGs
  // 1. Leads by Date (Timeline over past 30 days)
  const getTimelineData = () => {
    // Collect counts of leads for each of the last 15 days
    const dailyMap = {};
    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      dailyMap[dateStr] = 0;
    }

    leads.forEach((l) => {
      const dateStr = new Date(l.date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      if (dateStr in dailyMap) {
        dailyMap[dateStr]++;
      }
    });

    const entries = Object.entries(dailyMap);
    return entries.map(([date, count]) => ({ label: date, val: count }));
  };

  const timelineData = getTimelineData();
  const maxTimelineCount = Math.max(...timelineData.map((d) => d.val), 1);

  // 2. SEO Score Buckets
  const scoreBuckets = {
    Excellent: leads.filter((l) => l.seoScore >= 90).length,
    Good: leads.filter((l) => l.seoScore >= 80 && l.seoScore < 90).length,
    Fair: leads.filter((l) => l.seoScore >= 50 && l.seoScore < 80).length,
    Critical: leads.filter((l) => l.seoScore > 0 && l.seoScore < 50).length,
  };

  // 3. Package Requests
  const packageData = {
    FreeAudit: leads.filter((l) => l.packageRequest === "Free Audit").length,
    Premium: leads.filter((l) => l.packageRequest === "Premium Report").length,
    Growth: leads.filter((l) => l.packageRequest === "Growth Agency Plan").length,
  };
  const maxPackageCount = Math.max(packageData.FreeAudit, packageData.Premium, packageData.Growth, 1);

  // Helper colors
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "New":
        return "bg-violet-500/10 text-violet-400 border border-violet-500/20";
      case "Contacted":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "In Progress":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "Closed Won":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Closed Lost":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border border-zinc-700";
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/10 bg-emerald-500/5";
    if (score >= 80) return "text-cyan-400 border-cyan-500/10 bg-cyan-500/5";
    if (score >= 50) return "text-amber-400 border-amber-500/10 bg-amber-500/5";
    if (score > 0) return "text-rose-400 border-rose-500/10 bg-rose-500/5";
    return "text-zinc-500 border-zinc-850 bg-zinc-950/20";
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-zinc-950 min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative isolate flex items-center justify-center text-zinc-100">
        <div className="absolute top-1/4 left-1/4 -z-10 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />

        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-md space-y-8 text-center relative overflow-hidden shadow-2xl">
          {/* Glowing decoration */}
          <div className="absolute -inset-x-20 top-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
          
          <div className="space-y-3">
            <span className="text-xxs uppercase tracking-wider font-extrabold text-violet-400 block">
              SEOIntellect AI Console
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Administrator Login
            </h1>
            <p className="text-xs text-zinc-400">
              Access the secure dashboard to view your visitor audits, pipeline conversions, and leads analytics.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 text-left">
                Security Passcode
              </label>
              <input
                type="password"
                required
                placeholder="Enter passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-850 text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500 font-mono tracking-widest text-center"
              />
            </div>

            {loginError && (
              <p className="text-xxs text-rose-400 font-medium bg-rose-500/5 border border-rose-500/10 py-2 rounded-lg">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-xs font-semibold text-white shadow-md hover:from-violet-500 hover:to-fuchsia-500 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="border-t border-zinc-850/60 pt-4 text-xxs text-zinc-500 leading-relaxed text-left">
            <span className="font-bold text-zinc-400 block mb-1">🔑 First Time Login?</span>
            The default passcode is <span className="font-mono text-zinc-300 bg-zinc-950 px-1.5 py-0.5 border border-zinc-800 rounded-md">admin123</span>. You can change this immediately in the dashboard settings panel.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative isolate">
      {/* Background ambient glow */}
      <div className="absolute top-10 left-10 -z-10 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 -z-10 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Console */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-850 pb-6">
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">Leads Management Hub</h1>
              <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                Live Data
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Analyze organic traffic conversions and manage client audits in real-time.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportCSV}
              disabled={leads.length === 0}
              className="rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              📥 Export to CSV
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-rose-900/20 bg-rose-950/10 hover:bg-rose-900/10 px-4 py-2.5 text-xs font-semibold text-rose-400 transition-all"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Dashboard Tabs Bar */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="flex border-b border-zinc-850 pb-[1px] min-w-max px-4 sm:px-0">
            {[
              { id: "leads", label: "Leads Database", icon: "📊" },
              { id: "analytics", label: "Visual Analytics", icon: "📈" },
              { id: "blog", label: "Manage Blog", icon: "📰" },
              { id: "settings", label: "Dashboard Settings", icon: "⚙️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-violet-400 font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-violet-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ==================== TAB 1: LEADS LIST DATABASE ==================== */}
        {activeTab === "leads" && (
          <div className="space-y-6">
            
            {/* KPI STATS ROW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Total Generated Leads", value: totalLeadsCount, desc: "Total system submissions", color: "text-violet-400" },
                { name: "Total Paid Revenue", value: `$${totalPaidRevenue.toFixed(2)}`, desc: "From premium report buyouts", color: "text-emerald-400" },
                { name: "Conversion Rate", value: `${conversionRate}%`, desc: "Leads upgraded to Closed Won", color: "text-cyan-400" },
                { name: "Average Target SEO Score", value: averageSeoScore > 0 ? `${averageSeoScore}%` : "Pending", desc: "Average audited site grade", color: "text-amber-400" },
              ].map((kpi, idx) => (
                <div key={idx} className="rounded-2xl border border-zinc-850 bg-zinc-900/30 p-5 space-y-1.5 text-left relative overflow-hidden group hover:border-zinc-800 transition-all">
                  <span className="text-xxs uppercase tracking-wider font-bold text-zinc-500 block">
                    {kpi.name}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-extrabold ${kpi.color}`}>
                      {kpi.value}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 leading-relaxed block">
                    {kpi.desc}
                  </span>
                </div>
              ))}
            </div>

            {/* FILTERS & SEARCH ROW */}
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/20 p-5 space-y-4 backdrop-blur-md">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Search field (5 cols) */}
                <div className="md:col-span-4 text-left">
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5 pl-0.5">
                    Search Leads
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name, email, or website..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500"
                  />
                </div>

                {/* Filters (6 cols) */}
                <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5 pl-0.5">
                      Lead Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-zinc-950 px-3 py-2.5 rounded-xl border border-zinc-850 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed Won">Closed Won</option>
                      <option value="Closed Lost">Closed Lost</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5 pl-0.5">
                      Service Package
                    </label>
                    <select
                      value={packageFilter}
                      onChange={(e) => setPackageFilter(e.target.value)}
                      className="w-full bg-zinc-950 px-3 py-2.5 rounded-xl border border-zinc-850 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="All">All Packages</option>
                      <option value="Free Audit">Free Audit</option>
                      <option value="Premium Report">Premium Report</option>
                      <option value="Growth Agency Plan">Growth Plan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5 pl-0.5">
                      Audit Score Range
                    </label>
                    <select
                      value={scoreFilter}
                      onChange={(e) => setScoreFilter(e.target.value)}
                      className="w-full bg-zinc-950 px-3 py-2.5 rounded-xl border border-zinc-850 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="All">All Scores</option>
                      <option value="Excellent">Excellent (&ge;90)</option>
                      <option value="Good">Good (80-89)</option>
                      <option value="Fair">Needs Work (50-79)</option>
                      <option value="Critical">Critical (&lt;50)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5 pl-0.5">
                      Sort Sequence
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="flex-grow bg-zinc-950 px-3 py-2.5 rounded-xl border border-zinc-850 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
                      >
                        <option value="date">Date</option>
                        <option value="score">SEO Score</option>
                        <option value="name">Client Name</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 text-xs text-zinc-400 hover:text-white hover:border-zinc-700 transition-all font-mono"
                        title={sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
                      >
                        {sortOrder === "asc" ? "▲" : "▼"}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* LEADS DATABASE TABLE */}
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/30 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-850 text-left text-xs">
                  <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Client Detail</th>
                      <th className="px-6 py-4">Audited Website</th>
                      <th className="px-6 py-4">SEO Grade</th>
                      <th className="px-6 py-4">Request Package</th>
                      <th className="px-6 py-4">Lead Status</th>
                      <th className="px-6 py-4">Submission Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850/60 text-zinc-300">
                    {filteredLeads.length > 0 ? (
                      filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-zinc-900/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <span className="font-bold text-white block">{lead.name}</span>
                              <span className="text-[10px] text-zinc-500 font-mono block">{lead.email}</span>
                              {lead.phone && <span className="text-[10px] text-zinc-650 font-mono block">{lead.phone}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={`https://${lead.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-violet-400 hover:text-violet-300 font-mono hover:underline inline-flex items-center gap-1"
                            >
                              {lead.website}
                              <span className="text-[9px]">↗</span>
                            </a>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center justify-center rounded-lg border text-xs font-extrabold h-8 w-8 ${getScoreBadgeClass(lead.seoScore)}`}>
                                {lead.grade === "Pending" ? "-" : lead.grade}
                              </span>
                              {lead.seoScore > 0 && (
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  {lead.seoScore}%
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <span className="text-zinc-200 font-medium block">
                                {lead.packageRequest}
                              </span>
                              {lead.amountPaid > 0 && (
                                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-md">
                                  Paid ${lead.amountPaid}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${getStatusBadgeClass(lead.status)}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-zinc-450 font-mono text-[10px]">
                            {new Date(lead.date).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleOpenLeadDetails(lead)}
                              className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 font-semibold text-[10px] tracking-wide uppercase transition-all"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-zinc-500">
                          <span className="text-xl block mb-2">🔍</span>
                          No leads matched your search query or filter settings.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 2: VISUAL ANALYTICS ==================== */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            
            {/* Upper Grid - Timeline & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Timeline graph (7 columns) */}
              <div className="lg:col-span-8 rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-6 text-left flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Leads Generation Velocity</h3>
                  <p className="text-xxs text-zinc-500 leading-relaxed">
                    Timeline charts showing lead generation frequencies compiled across the last 15 active days.
                  </p>
                </div>

                {/* SVG Line Graph */}
                <div className="h-60 w-full relative pt-2">
                  <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal grid lines */}
                    <line x1="0" y1="40" x2="500" y2="40" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="3" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="3" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="3" />
                    <line x1="0" y1="160" x2="500" y2="160" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="3" />
                    <line x1="0" y1="199" x2="500" y2="199" stroke="#374151" strokeWidth="0.5" />

                    {/* Area fill under curve */}
                    <path
                      d={`
                        M 0 200 
                        ${timelineData.map((d, idx) => {
                          const x = (idx / 14) * 500;
                          const y = 200 - (d.val / maxTimelineCount) * 160;
                          return `L ${x} ${y}`;
                        }).join(" ")}
                        L 500 200 Z
                      `}
                      fill="url(#line-grad)"
                    />

                    {/* Bezier Line path */}
                    <path
                      d={timelineData.map((d, idx) => {
                        const x = (idx / 14) * 500;
                        const y = 200 - (d.val / maxTimelineCount) * 160;
                        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                      }).join(" ")}
                      fill="none"
                      stroke="#a78bfa"
                      strokeWidth="2.5"
                    />

                    {/* Interactive dots */}
                    {timelineData.map((d, idx) => {
                      const x = (idx / 14) * 500;
                      const y = 200 - (d.val / maxTimelineCount) * 160;
                      return (
                        <g key={idx} className="group/dot cursor-pointer">
                          <circle cx={x} cy={y} r="3.5" fill="#a78bfa" stroke="#090d16" strokeWidth="1.5" />
                          <circle cx={x} cy={y} r="8" fill="#a78bfa" fillOpacity="0" />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Timeline labels */}
                <div className="flex justify-between text-[8px] font-mono text-zinc-550 border-t border-zinc-850/60 pt-3">
                  {timelineData.filter((_, idx) => idx % 2 === 0).map((d, idx) => (
                    <span key={idx}>{d.label}</span>
                  ))}
                </div>
              </div>

              {/* Status Breakdown Pipeline (4 columns) */}
              <div className="lg:col-span-4 rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-6 text-left flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Conversion Pipeline</h3>
                  <p className="text-xxs text-zinc-500 leading-relaxed">
                    Visual breakdown of pipeline leads grouped by outreach stages.
                  </p>
                </div>

                {/* Vertical bars representing status */}
                <div className="space-y-4 py-2 flex-grow flex flex-col justify-center">
                  {[
                    { key: "New", color: "bg-violet-500", label: "New Leads" },
                    { key: "Contacted", color: "bg-cyan-500", label: "Contacted" },
                    { key: "In Progress", color: "bg-amber-500", label: "In Progress" },
                    { key: "Closed Won", color: "bg-emerald-500", label: "Closed (Won)" },
                    { key: "Closed Lost", color: "bg-rose-500", label: "Closed (Lost)" },
                  ].map((statusObj) => {
                    const count = leads.filter((l) => l.status === statusObj.key).length;
                    const pct = totalLeadsCount ? Math.round((count / totalLeadsCount) * 100) : 0;
                    return (
                      <div key={statusObj.key} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xxs font-semibold">
                          <span className="text-zinc-400">{statusObj.label}</span>
                          <span className="text-white font-mono">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                          <div className={`h-full ${statusObj.color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Lower Grid - Target Scores & Package Splits */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Target Quality Distribution (6 columns) */}
              <div className="lg:col-span-6 rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-6 text-left flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Target Lead Quality</h3>
                  <p className="text-xxs text-zinc-500 leading-relaxed">
                    Grouping targets by audited SEO scores. Perfect to target prospects with critical scores.
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-4 h-48 items-end relative pt-6 border-b border-zinc-850/60">
                  {Object.entries(scoreBuckets).map(([bucket, count]) => {
                    const maxVal = Math.max(...Object.values(scoreBuckets), 1);
                    const pctHeight = Math.round((count / maxVal) * 100);
                    
                    let barColor = "bg-rose-500 shadow-rose-500/10";
                    if (bucket === "Excellent") barColor = "bg-emerald-500 shadow-emerald-500/10";
                    else if (bucket === "Good") barColor = "bg-cyan-500 shadow-cyan-500/10";
                    else if (bucket === "Fair") barColor = "bg-amber-500 shadow-amber-500/10";

                    return (
                      <div key={bucket} className="flex flex-col items-center gap-2 group cursor-pointer relative h-full justify-end">
                        <span className="text-[10px] font-mono font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4">
                          {count}
                        </span>
                        <div
                          className={`w-10 sm:w-16 ${barColor} rounded-t-xl transition-all duration-500 shadow-md group-hover:scale-y-[1.03] origin-bottom`}
                          style={{ height: `${Math.max(pctHeight, 5)}%` }}
                        />
                        <span className="text-[10px] font-medium text-zinc-400 mt-2 block">
                          {bucket}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="text-[10px] text-zinc-500 flex justify-between pt-2">
                  <span>Critical: &lt;50%</span>
                  <span>Fair: 50-79%</span>
                  <span>Good: 80-89%</span>
                  <span>Excellent: &ge;90%</span>
                </div>
              </div>

              {/* Package Requests Split (6 columns) */}
              <div className="lg:col-span-6 rounded-2xl border border-zinc-850 bg-zinc-900/30 p-6 space-y-6 text-left flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Service Requests split</h3>
                  <p className="text-xxs text-zinc-500 leading-relaxed">
                    Breakdown of initial packages chosen by users when generating leads.
                  </p>
                </div>

                {/* SVG Custom Doughnut Chart */}
                <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
                  <div className="relative h-36 w-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* background track */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#18181b" strokeWidth="10" />

                      {/* Doughnut segment 1: Free Audit (violet) */}
                      {(() => {
                        const total = packageData.FreeAudit + packageData.Premium + packageData.Growth || 1;
                        const pctFree = (packageData.FreeAudit / total) * 100;
                        const pctPrem = (packageData.Premium / total) * 100;
                        const pctGrowth = (packageData.Growth / total) * 100;

                        const circ = 2 * Math.PI * 40; // 251.2
                        
                        const dashFree = (pctFree / 100) * circ;
                        const dashPrem = (pctPrem / 100) * circ;
                        const dashGrowth = (pctGrowth / 100) * circ;

                        const offsetFree = 0;
                        const offsetPrem = -dashFree;
                        const offsetGrowth = -(dashFree + dashPrem);

                        return (
                          <>
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="#8b5cf6"
                              strokeWidth="10"
                              strokeDasharray={`${dashFree} ${circ - dashFree}`}
                              strokeDashoffset={offsetFree}
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="#ec4899"
                              strokeWidth="10"
                              strokeDasharray={`${dashPrem} ${circ - dashPrem}`}
                              strokeDashoffset={offsetPrem}
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="#06b6d4"
                              strokeWidth="10"
                              strokeDasharray={`${dashGrowth} ${circ - dashGrowth}`}
                              strokeDashoffset={offsetGrowth}
                            />
                          </>
                        );
                      })()}
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xs uppercase tracking-wider font-extrabold text-zinc-500">Total</span>
                      <span className="text-xl font-extrabold text-white">{totalLeadsCount}</span>
                    </div>
                  </div>

                  {/* Chart Legends */}
                  <div className="space-y-3 text-left">
                    {[
                      { label: "Free Website Audit", count: packageData.FreeAudit, color: "bg-violet-500" },
                      { label: "Premium AI Report", count: packageData.Premium, color: "bg-fuchsia-500" },
                      { label: "Growth Agency Plan", count: packageData.Growth, color: "bg-cyan-500" },
                    ].map((pkg, idx) => {
                      const pct = totalLeadsCount ? Math.round((pkg.count / totalLeadsCount) * 100) : 0;
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <span className={`h-3 w-3 rounded-md ${pkg.color} flex-shrink-0`} />
                          <div className="space-y-0.5">
                            <span className="text-xxs text-zinc-400 block font-semibold">{pkg.label}</span>
                            <span className="text-xxs font-bold text-white block font-mono">
                              {pkg.count} leads ({pct}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 3: SETTINGS PANEL ==================== */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
            
            {/* Form settings configuration (8 columns) */}
            <div className="lg:col-span-8 rounded-2xl border border-zinc-850 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-white">Platform Settings & Integrations</h2>
                <p className="text-xs text-zinc-550 leading-relaxed">
                  Configure external webhooks or change administrator access passcodes.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* Section A: Security */}
                <div className="space-y-4 pt-2 border-t border-zinc-850/60">
                  <h3 className="text-xs uppercase font-extrabold text-violet-400 tracking-wider">
                    🔐 Access Passcode Settings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 pl-0.5">
                        New Passcode (Leave blank to keep current)
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new passcode"
                        value={newPasscode}
                        onChange={(e) => setNewPasscode(e.target.value)}
                        className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500 font-mono tracking-widest"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 pl-0.5">
                        Confirm New Passcode
                      </label>
                      <input
                        type="password"
                        placeholder="Re-type passcode"
                        value={confirmPasscode}
                        onChange={(e) => setConfirmPasscode(e.target.value)}
                        className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500 font-mono tracking-widest"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Integrations */}
                <div className="space-y-4 pt-4 border-t border-zinc-850/60">
                  <div className="space-y-1">
                    <h3 className="text-xs uppercase font-extrabold text-cyan-400 tracking-wider">
                      🔌 Third Party Integrations
                    </h3>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Post leads instantly to external spreadsheets, CRM servers, or trigger instant email alerts.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 pl-0.5">
                        Webhook API URL (POST JSON)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="e.g. https://hooks.zapier.com/hooks/catch/..."
                          value={webhookInput}
                          onChange={(e) => setWebhookInput(e.target.value)}
                          className="flex-grow bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleTestWebhook}
                          disabled={webhookTesting || !webhookInput}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 rounded-xl border border-zinc-750 text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer"
                        >
                          {webhookTesting ? "Testing..." : "Test"}
                        </button>
                      </div>
                      <p className="text-[9px] text-zinc-600 leading-relaxed mt-1">
                        Sends a test payload to Webhook. Suitable for Zapier, Make, Discord Webhooks, or custom REST APIs.
                      </p>
                      {webhookTestResult && (
                        <p className="text-[10px] font-mono text-zinc-450 mt-2 p-2 bg-zinc-950 rounded-lg border border-zinc-850">
                          {webhookTestResult}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 pl-0.5">
                        Web3Forms Access Key (Email Notifications)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 562145fb-c7db-4c12-bd74-..."
                        value={web3formsInput}
                        onChange={(e) => setWeb3formsInput(e.target.value)}
                        className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500 font-mono"
                      />
                      <p className="text-[9px] text-zinc-650 leading-relaxed mt-1">
                        Don&apos;t want to code webhooks? Get a free API key at{" "}
                        <a href="https://web3forms.com" target="_blank" rel="noreferrer" className="text-violet-400 underline">
                          Web3Forms
                        </a>
                        . Your visitors&apos; leads details will be emailed directly to your inbox immediately upon submission.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notifications & Submit */}
                <div className="pt-4 border-t border-zinc-850/60 space-y-4">
                  {settingsSuccess && (
                    <p className="text-xxs text-emerald-400 font-medium bg-emerald-500/5 border border-emerald-500/10 py-2.5 rounded-lg text-center">
                      ✓ {settingsSuccess}
                    </p>
                  )}
                  {settingsError && (
                    <p className="text-xxs text-rose-400 font-medium bg-rose-500/5 border border-rose-500/10 py-2.5 rounded-lg text-center">
                      ⚠️ {settingsError}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-xs font-semibold text-white shadow-md hover:from-violet-500 hover:to-fuchsia-500 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    Save Changes & Settings
                  </button>
                </div>

              </form>
            </div>

            {/* Quick database operations (4 columns) */}
            <div className="lg:col-span-4 rounded-2xl border border-zinc-850 bg-zinc-900/20 p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">
                  ⚠️ Danger Zone
                </h3>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Perform reset sweep operations or delete the local storage tables.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-850/60">
                <button
                  onClick={handleResetMockData}
                  className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 py-3 text-xs font-semibold transition-all cursor-pointer"
                >
                  Seed / Reset Mock Data
                </button>
                <p className="text-[9px] text-zinc-650 leading-normal pl-1">
                  Resets database to 12 pre-configured mock leads with staggered calendar dates for demo charts display.
                </p>

                <div className="h-[1px] bg-zinc-850 my-2" />

                <button
                  onClick={handleClearAllData}
                  className="w-full rounded-xl bg-rose-950/10 hover:bg-rose-950/20 border border-rose-900/30 text-rose-400 py-3 text-xs font-semibold transition-all cursor-pointer"
                >
                  Clear All Database Records
                </button>
                <p className="text-[9px] text-zinc-650 leading-normal pl-1">
                  Wipes out all local leads. Ensure you exported a CSV backup first.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 4: BLOG CMS MANAGER ==================== */}
        {activeTab === "blog" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
            
            {/* Publisher Form (8 columns) */}
            <div className="lg:col-span-8 rounded-2xl border border-zinc-850 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-white">Create New Article</h2>
                <p className="text-xs text-zinc-550 leading-relaxed">
                  Compose your update, choose a category, and publish it instantly to your news page.
                </p>
              </div>

              <form onSubmit={handlePublishPost} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 pl-0.5">
                      Article Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Google Maps API Updates"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 pl-0.5">
                      Author Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Martin"
                      value={postAuthor}
                      onChange={(e) => setPostAuthor(e.target.value)}
                      className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 pl-0.5">
                    🔗 Article URL Slug (Auto-generated, fully editable)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. google-maps-api-updates"
                    value={postSlug}
                    onChange={(e) => setPostSlug(e.target.value)}
                    className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500 font-mono"
                  />
                  <p className="text-[9px] text-zinc-600 mt-1 leading-normal pl-0.5">
                    The URL path for this article (e.g. `/news/{postSlug}/`). Automatically derived from title, edit manually if needed.
                  </p>
                </div>

                <div>
                  <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 pl-0.5">
                    Category
                  </label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className="w-full bg-zinc-950 px-3 py-2.5 rounded-xl border border-zinc-850 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    {Array.from(new Set([
                      "Core Updates",
                      "AI Search",
                      "Local SEO",
                      "Technical Guides",
                      ...posts.map(p => p.category).filter(Boolean)
                    ])).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="custom">— Add Custom Category —</option>
                  </select>

                  {postCategory === "custom" && (
                    <div className="mt-3 animate-fade-in">
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 pl-0.5">
                        Custom Category Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ranking Case Study"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  )}
                </div>

                {/* Featured Image (Upload or URL) */}
                <div className="space-y-3">
                  <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide pl-0.5">
                    🖼️ Featured / Cover Image (1280x720 WebP)
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* File Upload Option */}
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1 pl-0.5">
                        Option A: Upload Image File
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full bg-zinc-950 px-3 py-2 rounded-xl border border-zinc-850 text-xs text-zinc-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xxs file:font-semibold file:bg-violet-600/20 file:text-violet-300 hover:file:bg-violet-600/30 file:cursor-pointer cursor-pointer"
                      />
                    </div>

                    {/* URL Option */}
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-1 pl-0.5">
                        Option B: Paste Image URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={postFeaturedImage}
                        onChange={(e) => setPostFeaturedImage(e.target.value)}
                        className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500 font-mono"
                      />
                    </div>
                  </div>

                  {postFeaturedImage && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-zinc-800 relative h-40 bg-zinc-950 flex items-center justify-center">
                      <img
                        src={postFeaturedImage}
                        alt="Featured image preview"
                        className="w-full h-full object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                        Preview (Resized to 1280x720 WebP)
                      </div>
                      <button
                        type="button"
                        onClick={() => setPostFeaturedImage("")}
                        className="absolute top-1 right-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-900/40 text-rose-300 text-[10px] px-2 py-1 rounded cursor-pointer transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <p className="text-[9px] text-zinc-600 leading-relaxed">
                    Upload any image to automatically convert and compress it to WebP at 1280x720, or paste an external image URL.
                  </p>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 pl-0.5">
                    Short Description (Card Preview)
                  </label>
                  <textarea
                    rows="2"
                    required
                    placeholder="A short summary shown on the news card (1-2 sentences)"
                    value={postDesc}
                    onChange={(e) => setPostDesc(e.target.value)}
                    className="w-full bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500 resize-none font-sans"
                  />
                </div>

                {/* Rich Body Content — CKEditor 5 */}
                <div>
                  <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 pl-0.5">
                    📝 Article Body (Rich Text Editor)
                  </label>
                  <div className="rounded-xl overflow-hidden border border-zinc-700">
                    <CKEditorBlock
                      ckeditorRef={ckeditorRef}
                      onChange={setPostContent}
                    />
                  </div>
                  <p className="text-[9px] text-zinc-600 mt-1 leading-relaxed">
                    Use the toolbar to add headings, bold, italic, lists, and inline images. Full HTML is saved.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="postFeatured"
                    checked={postFeatured}
                    onChange={(e) => setPostFeatured(e.target.checked)}
                    className="h-4 w-4 bg-zinc-950 border border-zinc-850 rounded focus:ring-violet-500 text-violet-600 cursor-pointer"
                  />
                  <label htmlFor="postFeatured" className="text-xs text-zinc-400 select-none cursor-pointer">
                    Feature this article (Pin it to the top/banner slot on the news page)
                  </label>
                </div>

                <div className="space-y-3 pt-4 border-t border-zinc-850/60">
                  {blogSuccess && (
                    <p className="text-xxs text-emerald-400 font-medium bg-emerald-500/5 border border-emerald-500/10 py-2.5 rounded-lg text-center animate-fade-in">
                      ✓ {blogSuccess}
                    </p>
                  )}
                  {blogError && (
                    <p className="text-xxs text-rose-400 font-medium bg-rose-500/5 border border-rose-500/10 py-2.5 rounded-lg text-center">
                      ⚠️ {blogError}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-xs font-semibold text-white shadow-md hover:from-violet-500 hover:to-fuchsia-500 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    🚀 Publish News Post Live
                  </button>
                </div>
              </form>
            </div>

            {/* Published Posts Directory (4 columns) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Directory list card */}
              <div className="rounded-2xl border border-zinc-850 bg-zinc-900/20 p-6 space-y-4 flex-grow max-h-[600px] overflow-y-auto font-sans">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">Active News Articles</h3>
                  <p className="text-xxs text-zinc-550 leading-normal">
                    Management directory of active publications. You can delete posts instantly.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-zinc-850/60">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <div
                        key={post.id}
                        className="rounded-xl border border-zinc-850/80 bg-zinc-950/40 p-3.5 flex justify-between items-center gap-4 hover:border-zinc-800 transition-all relative group"
                      >
                        <div className="flex items-center gap-3 flex-grow min-w-0">
                          {post.featuredImage ? (
                            <img
                              src={post.featuredImage}
                              alt=""
                              className="w-10 h-7 object-cover rounded border border-zinc-800 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-7 bg-zinc-900 rounded border border-zinc-800 flex-shrink-0 flex items-center justify-center text-[10px]">
                              🖼️
                            </div>
                          )}
                          <div className="min-w-0 space-y-0.5 text-left">
                            <h4 className="text-xs font-bold text-white line-clamp-1">{post.title}</h4>
                            <p className="text-[9px] font-mono text-zinc-500">{post.date}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-xxs text-rose-500 hover:text-rose-400 font-bold border border-rose-950/20 hover:border-rose-900/40 hover:bg-rose-950/10 px-2.5 py-1.5 rounded-md transition-all flex-shrink-0 cursor-pointer"
                          title="Delete Post"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-zinc-500 text-xs">
                      No published articles in local storage.
                    </div>
                  )}
                </div>
              </div>

              {/* Maintenance Tools */}
              <div className="rounded-2xl border border-zinc-850 bg-zinc-900/20 p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">
                    🔄 Blog Database Maintenance
                  </h3>
                  <p className="text-[10px] text-zinc-550 leading-relaxed">
                    Reset local blog configurations or clean up custom articles list.
                  </p>
                </div>
                <div className="pt-3 border-t border-zinc-850/60">
                  <button
                    onClick={handleResetPosts}
                    className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 py-2.5 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Reset to Default 5 Articles
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== MODAL DIALOG: LEAD DETAILS ==================== */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
            <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900/95 p-6 sm:p-8 space-y-6 relative shadow-2xl animate-scale-up text-left max-h-[90vh] overflow-y-auto">
              
              <button
                onClick={() => setSelectedLead(null)}
                className="absolute top-5 right-5 text-zinc-500 hover:text-white"
              >
                ✕
              </button>

              <div className="border-b border-zinc-800 pb-4">
                <span className="text-xxs uppercase tracking-wider font-bold text-violet-400">
                  Lead Details & Remarks
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedLead.name}
                </h3>
                <p className="text-xxs text-zinc-550 font-mono mt-0.5">
                  ID: {selectedLead.id} • Submitted: {new Date(selectedLead.date).toLocaleString()}
                </p>
              </div>

              {/* Detail fields grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Column 1: Contact Details */}
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase font-extrabold text-zinc-450 tracking-wider">
                    Contact & Website
                  </h4>
                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3 text-xs">
                    <div>
                      <span className="text-zinc-600 block text-[9px] uppercase font-bold">Email Address</span>
                      <span className="text-zinc-200 font-mono select-all block">{selectedLead.email}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 block text-[9px] uppercase font-bold">Phone Number</span>
                      <span className="text-zinc-200 font-mono select-all block">{selectedLead.phone || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 block text-[9px] uppercase font-bold">Audited Target Website</span>
                      <a
                        href={`https://${selectedLead.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-400 hover:underline font-mono select-all block"
                      >
                        {selectedLead.website} ↗
                      </a>
                    </div>
                  </div>
                </div>

                {/* Column 2: Audit Performance */}
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase font-extrabold text-zinc-450 tracking-wider">
                    SEO Audit summary
                  </h4>
                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-around gap-4">
                    <div className="text-center">
                      <span className="text-zinc-600 block text-[9px] uppercase font-bold mb-1">Grade</span>
                      <span className={`inline-flex items-center justify-center rounded-2xl border text-3xl font-extrabold h-16 w-16 shadow-md ${getScoreBadgeClass(selectedLead.seoScore)}`}>
                        {selectedLead.grade === "Pending" ? "-" : selectedLead.grade}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-zinc-650 text-[9px] uppercase font-bold block">Calculated Score</span>
                        <span className="text-xs font-mono font-bold text-white">
                          {selectedLead.seoScore > 0 ? `${selectedLead.seoScore}% / 100` : "Pending audit execution"}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-650 text-[9px] uppercase font-bold block">Interested Package</span>
                        <span className="text-xs font-semibold text-zinc-300 block">
                          {selectedLead.packageRequest}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Status & Remarks update */}
              <div className="space-y-4 pt-2 border-t border-zinc-800">
                <h4 className="text-[10px] uppercase font-extrabold text-zinc-450 tracking-wider">
                  Lead Management Actions
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-1">
                    <label className="block text-xxs font-bold text-zinc-500 uppercase mb-1.5 pl-0.5">
                      Lead Pipeline Stage
                    </label>
                    <select
                      value={leadStatus}
                      onChange={(e) => setLeadStatus(e.target.value)}
                      className="w-full bg-zinc-950 px-3 py-2.5 rounded-xl border border-zinc-850 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed Won">Closed Won</option>
                      <option value="Closed Lost">Closed Lost</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xxs font-bold text-zinc-500 uppercase mb-1.5 pl-0.5">
                      Service Interest Package (Change)
                    </label>
                    <select
                      value={selectedLead.packageRequest}
                      onChange={(e) => {
                        const updated = updateLead(selectedLead.id, {
                          packageRequest: e.target.value,
                          amountPaid: e.target.value === "Premium Report" ? 29 : e.target.value === "Growth Agency Plan" ? 199 : 0,
                        });
                        if (updated) {
                          setSelectedLead(updated);
                          refreshLeads();
                        }
                      }}
                      className="w-full bg-zinc-950 px-3 py-2.5 rounded-xl border border-zinc-850 text-xs text-zinc-300 focus:outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="Free Audit">Free Audit ($0)</option>
                      <option value="Premium Report">Premium Report ($29)</option>
                      <option value="Growth Agency Plan">Growth Agency Plan ($199)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xxs font-bold text-zinc-500 uppercase mb-1.5 pl-0.5">
                    Follow-up remarks & Admin notes
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Enter sales outreach remarks, meeting schedules, or client preferences here..."
                    value={leadNotes}
                    onChange={(e) => setLeadNotes(e.target.value)}
                    className="w-full bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500 resize-none font-sans"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row justify-between gap-4">
                <button
                  type="button"
                  onClick={() => handleDeleteLead(selectedLead.id)}
                  className="rounded-xl border border-rose-900/40 bg-rose-950/5 hover:bg-rose-950/15 text-rose-450 hover:text-rose-400 px-5 py-3 text-xs font-semibold transition-all cursor-pointer text-center"
                >
                  🗑️ Delete Lead Record
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedLead(null)}
                    className="rounded-xl border border-zinc-750 bg-zinc-900 px-5 py-3 text-xs font-semibold text-zinc-400 hover:text-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveLeadChanges}
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-xs font-semibold text-white shadow-md hover:from-violet-500 hover:to-fuchsia-500 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
