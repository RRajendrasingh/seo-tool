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
  updatePost,
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
  const [editingPostId, setEditingPostId] = useState(null);
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [blogSearch, setBlogSearch] = useState("");
  const ckeditorRef = useRef(null); // Holds the CKEditor instance

  // Auto-Draft Pipeline States
  const [drafts, setDrafts] = useState([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [draftMsg, setDraftMsg] = useState("");
  const [draftPreview, setDraftPreview] = useState(null); // post object for preview modal
  const [pollingStatus, setPollingStatus] = useState(null); // null | 'loading' | { processed, skipped, errors }

  // RSS Sources States
  const [rssSources, setRssSources] = useState([]);
  const [rssSourcesLoading, setRssSourcesLoading] = useState(false);
  const [newRssName, setNewRssName] = useState("");
  const [newRssUrl, setNewRssUrl] = useState("");
  const [newRssCategory, setNewRssCategory] = useState("SEO Strategy");
  const [newRssAuthor, setNewRssAuthor] = useState("Martin");
  const [editingRssId, setEditingRssId] = useState(null);

  // Auto-generate slug when title changes (only when creating a new post)
  useEffect(() => {
    if (editingPostId) return;
    const cleaned = postTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPostSlug(cleaned);
  }, [postTitle, editingPostId]);

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
  const [gscVerificationInput, setGscVerificationInput] = useState("");
  const [gtmIdInput, setGtmIdInput] = useState("");
  const [clarityIdInput, setClarityIdInput] = useState("");
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
    setGscVerificationInput(loadedSettings.gscVerificationToken || "");
    setGtmIdInput(loadedSettings.gtmId || "");
    setClarityIdInput(loadedSettings.clarityId || "");

    // Check session storage for auto-login during active session
    if (typeof window !== "undefined") {
      const authSession = sessionStorage.getItem("admin_authenticated");
      if (authSession === "true") {
        setIsAuthenticated(true);
        Promise.resolve(getAllLeads()).then(setLeads).catch(console.error);
        getAllPosts().then(setPosts).catch(console.error); // Fetch posts
        refreshRssSources();
      }
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === settings.adminPasscode) {
      setIsAuthenticated(true);
      Promise.resolve(getAllLeads()).then(setLeads).catch(console.error);
      getAllPosts().then(setPosts).catch(console.error); // Fetch posts
      refreshRssSources();
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
    Promise.resolve(getAllLeads()).then(setLeads).catch(console.error);
  };

  const refreshPosts = () => {
    getAllPosts().then(setPosts).catch(console.error);
  };

  async function refreshRssSources() {
    setRssSourcesLoading(true);
    try {
      const res = await fetch("/api/rss-sources");
      const data = await res.json();
      if (data.success) {
        setRssSources(data.sources || []);
      }
    } catch (e) {
      console.error(e);
    }
    setRssSourcesLoading(false);
  };

  const handleAddRssSource = async (e) => {
    e.preventDefault();
    try {
      const isEditing = !!editingRssId;
      const method = isEditing ? "PUT" : "POST";
      const payload = { name: newRssName, url: newRssUrl, category: newRssCategory, author: newRssAuthor };
      if (isEditing) payload.id = editingRssId;

      const res = await fetch("/api/rss-sources", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setNewRssName("");
        setNewRssUrl("");
        setNewRssCategory("SEO Strategy");
        setNewRssAuthor("Martin");
        setEditingRssId(null);
        refreshRssSources();
      } else {
        alert("Error saving source: " + data.error);
      }
    } catch (e) {
      alert("Failed to save source");
    }
  };

  const handleEditRssClick = (source) => {
    setEditingRssId(source.id);
    setNewRssName(source.name);
    setNewRssUrl(source.url);
    setNewRssCategory(source.category || "");
    setNewRssAuthor(source.author || "");
  };

  const handleDeleteRssSource = async (id) => {
    if (!confirm("Remove this RSS source?")) return;
    try {
      const res = await fetch(`/api/rss-sources?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        refreshRssSources();
      } else {
        alert("Error removing source: " + data.error);
      }
    } catch (e) {
      alert("Failed to delete source");
    }
  };

  const refreshDrafts = useCallback(() => {
    setDraftsLoading(true);
    fetch("/api/drafts")
      .then((r) => r.json())
      .then((data) => { setDrafts(Array.isArray(data) ? data : []); setDraftsLoading(false); })
      .catch(() => setDraftsLoading(false));
  }, []);

  const handleDraftAction = async (id, action) => {
    setDraftMsg("");
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      setDraftMsg(action === "publish" ? "✅ Post published successfully!" : "🗑 Draft discarded.");
      refreshDrafts();
      if (action === "publish") refreshPosts();
    } catch (err) {
      setDraftMsg(`❌ ${err.message}`);
    }
  };

  const handleManualPoll = async () => {
    setPollingStatus("loading");
    setDraftMsg("");
    try {
      const res = await fetch("/api/rss-poll");
      const data = await res.json();
      setPollingStatus(data);
      if (data.processed > 0) refreshDrafts();
    } catch (err) {
      setPollingStatus({ error: err.message });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBlogError("");
    setBlogSuccess("");
    setIsUploadingImage(true);

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

        // Upload to server to get clean URL
        fetch("/api/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: compressedBase64, mimeType: "image/webp" })
        })
          .then((res) => {
            if (!res.ok) throw new Error("Upload request failed");
            return res.json();
          })
          .then((data) => {
            if (data.error) throw new Error(data.error);
            setPostFeaturedImage(data.url);
          })
          .catch((err) => {
            console.error("Failed to upload image:", err);
            setBlogError(`Image upload failed: ${err.message}. Saving as local image data instead.`);
            // Fallback: save as raw Base64 if API fails
            setPostFeaturedImage(compressedBase64);
          })
          .finally(() => {
            setIsUploadingImage(false);
          });
      };
      img.onerror = () => {
        setBlogError("Failed to parse the selected image file.");
        setIsUploadingImage(false);
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setBlogError("Failed to read the selected image file.");
      setIsUploadingImage(false);
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

    const payload = {
      title: postTitle,
      slug: postSlug,
      desc: postDesc,
      content: richContent,
      featuredImage: postFeaturedImage,
      category: finalCategory,
      author: postAuthor,
      featured: postFeatured,
    };

    if (editingPostId) {
      updatePost(editingPostId, payload)
        .then(() => {
          setEditingPostId(null);
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
          setBlogSuccess("Article updated successfully and changes are live!");
          refreshPosts();
        })
        .catch(err => {
          setBlogError(`Update failed: ${err.message}`);
        });
    } else {
      addPost(payload)
        .then(() => {
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
        })
        .catch(err => {
          setBlogError(`Publish failed: ${err.message}`);
        });
    }
  };

  const handleEditPost = (post) => {
    setBlogSuccess("");
    setBlogError("");
    setEditingPostId(post.id);
    setPostTitle(post.title);
    setPostSlug(post.slug);
    setPostDesc(post.desc);
    setPostFeaturedImage(post.featuredImage || "");
    setPostAuthor(post.author || "Martin");
    setPostFeatured(!!post.featured);

    const defaultCategories = ["Core Updates", "AI Search", "Local SEO", "Technical Guides"];
    if (defaultCategories.includes(post.category)) {
      setPostCategory(post.category);
      setCustomCategory("");
    } else {
      setPostCategory("custom");
      setCustomCategory(post.category);
    }

    if (ckeditorRef.current) {
      ckeditorRef.current.setData(post.content || "");
    } else {
      setPostContent(post.content || "");
    }

    const formElement = document.getElementById("blog-editor-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
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
    setBlogSuccess("");
    setBlogError("");
  };

  const handleDeletePost = (id) => {
    if (confirm("Are you sure you want to delete this news article?")) {
      deletePost(id).then(() => {
        refreshPosts();
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
      Promise.resolve(deleteLead(id)).then(() => {
        refreshLeads();
      }).catch(console.error);
    }
  };

  const handleResetMockData = () => {
    if (confirm("This will overwrite existing leads with a set of realistic mock data. Proceed?")) {
      Promise.resolve(resetToMock()).then((fresh) => {
        setLeads(fresh);
      }).catch(console.error);
    }
  };

  const handleClearAllData = () => {
    if (confirm("Are you sure you want to clear ALL leads? This will empty the database.")) {
      Promise.resolve(clearAllLeads()).then(() => {
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
      gscVerificationToken: gscVerificationInput.trim(),
      gtmId: gtmIdInput.trim(),
      clarityId: clarityIdInput.trim(),
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


        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative isolate overflow-x-hidden">
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
              { id: "drafts", label: "Auto-Drafts", icon: "📥", badge: drafts.length || null },
              { id: "sources", label: "RSS Sources", icon: "🌐" },
              { id: "settings", label: "Dashboard Settings", icon: "⚙️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (tab.id === "drafts") refreshDrafts(); }}
                className={`pb-4 px-4 sm:px-6 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-violet-600 dark:text-violet-400 font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
                {tab.badge ? (
                  <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold bg-violet-600 text-white rounded-full">{tab.badge}</span>
                ) : null}
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
          <div className="max-w-3xl mx-auto space-y-6 text-left w-full">
            
            {/* Form settings configuration (full width centered) */}
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md space-y-6">
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
                      <p className="text-[9px] text-zinc-650 leading-relaxed mt-1">
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

                {/* Section C: SEO & Web Analytics Integrations */}
                <div className="space-y-4 pt-4 border-t border-zinc-850/60">
                  <div className="space-y-1">
                    <h3 className="text-xs uppercase font-extrabold text-emerald-400 tracking-wider">
                      📊 SEO & Web Analytics Integrations
                    </h3>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      Deploy search engine verification tags and traffic analytics container IDs across your static website.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 pl-0.5">
                        Google Search Console HTML Tag
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. wXyZ1234abcd..."
                        value={gscVerificationInput}
                        onChange={(e) => setGscVerificationInput(e.target.value)}
                        className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500 font-mono"
                      />
                      <p className="text-[8px] text-zinc-650 leading-relaxed mt-1">
                        Pasted from the <code className="text-violet-400">content=&quot;...&quot;</code> attribute of your Google HTML verification meta tag.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 pl-0.5">
                        Google Tag Manager (GTM ID)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. GTM-XXXXXXX"
                        value={gtmIdInput}
                        onChange={(e) => setGtmIdInput(e.target.value)}
                        className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500 font-mono"
                      />
                      <p className="text-[8px] text-zinc-650 leading-relaxed mt-1">
                        The GTM container ID from your Tag Manager workspace (contains GTM tag, GA4 metrics, and conversion pixels).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xxs font-bold text-zinc-400 uppercase tracking-wide mb-1.5 pl-0.5">
                        Microsoft Clarity Project ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. c89dfj12k3"
                        value={clarityIdInput}
                        onChange={(e) => setClarityIdInput(e.target.value)}
                        className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500 font-mono"
                      />
                      <p className="text-[8px] text-zinc-650 leading-relaxed mt-1">
                        Your MS Clarity project code (found in the setup tracking code URL, e.g. <code className="text-violet-400">clarity.ms/tag/ID</code>).
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
                    <p className="text-xxs text-rose-450 font-medium bg-rose-500/5 border border-rose-500/10 py-2.5 rounded-lg text-center">
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

            {/* Section C: Data Management */}
            <div className="rounded-2xl border border-zinc-850 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-white">Data Management & Testing</h2>
                <p className="text-xs text-zinc-550 leading-relaxed">
                  Clear your local storage cache or reset the dashboard to use mock data for testing purposes.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-zinc-850/60">
                <button
                  type="button"
                  onClick={handleClearAllData}
                  className="flex-1 rounded-xl bg-zinc-800 py-3 text-xs font-semibold text-rose-400 border border-zinc-700 hover:bg-zinc-700 hover:text-rose-300 transition-all cursor-pointer shadow-sm text-center"
                >
                  Clear All Data
                </button>
                <button
                  type="button"
                  onClick={handleResetMockData}
                  className="flex-1 rounded-xl bg-zinc-800 py-3 text-xs font-semibold text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all cursor-pointer shadow-sm text-center"
                >
                  Reset to Mock Leads
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 4: BLOG CMS MANAGER ==================== */}
        {/* ==================== TAB: AUTO-DRAFTS ==================== */}
        {/* ── RSS SOURCES TAB ─────────────────────────────────────────────────── */}
        {activeTab === "sources" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">RSS Sources</h2>
                <p className="text-sm text-zinc-500">Manage the websites that the system monitors for new articles.</p>
              </div>
            </div>

            {/* Guidelines */}
            <div className="rounded-xl border border-cyan-800/30 bg-cyan-950/10 p-4 text-sm text-cyan-300 space-y-2">
              <p><strong>URL Format:</strong> Use the direct <code>/feed</code>, <code>/rss</code>, or <code>/sitemap.xml</code> URL of the blog (e.g. <code>https://example.com/feed/</code>).</p>
              <ul className="list-disc pl-5 space-y-1 text-xs opacity-90">
                <li><strong>Fetching:</strong> Automatically polls daily on Vercel free tier (or instantly via the Fetch button). Use a free external cron service for 30-min polling.</li>
                <li><strong>How Much:</strong> Pulls the latest 10-50 articles currently broadcasting on the source website.</li>
                <li><strong>No Deletions:</strong> Old drafted/published news is never automatically deleted.</li>
                <li><strong>No Duplicates:</strong> Only brand-new, unseen articles are added to your drafts.</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Side */}
              <div className="lg:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 space-y-4 h-fit">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-white">{editingRssId ? "Edit Source" : "Add New Source"}</h3>
                  {editingRssId && (
                    <button type="button" onClick={() => { setEditingRssId(null); setNewRssName(""); setNewRssUrl(""); }} className="text-xs text-zinc-500 hover:text-white">Cancel</button>
                  )}
                </div>
                <form onSubmit={handleAddRssSource} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Website Name *</label>
                    <input
                      type="text"
                      required
                      value={newRssName}
                      onChange={(e) => setNewRssName(e.target.value)}
                      placeholder="e.g. Search Engine Journal"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">RSS/XML Feed URL *</label>
                    <input
                      type="url"
                      required
                      value={newRssUrl}
                      onChange={(e) => setNewRssUrl(e.target.value)}
                      placeholder="https://example.com/feed"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Default Category</label>
                    <input
                      type="text"
                      value={newRssCategory}
                      onChange={(e) => setNewRssCategory(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Default Author</label>
                    <input
                      type="text"
                      value={newRssAuthor}
                      onChange={(e) => setNewRssAuthor(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2 text-sm font-semibold text-white transition-all shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
                  >
                    {editingRssId ? "Update Source" : "+ Add Source"}
                  </button>
                </form>
              </div>

              {/* List Side */}
              <div className="lg:col-span-2 space-y-4">
                {rssSourcesLoading ? (
                  <div className="text-center py-10 text-zinc-500 text-sm animate-pulse">Loading sources...</div>
                ) : rssSources.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 py-20 text-center space-y-3">
                    <div className="text-4xl">🌐</div>
                    <p className="text-sm font-semibold text-zinc-400">No RSS sources yet</p>
                    <p className="text-xs text-zinc-600">Add your first website to start monitoring.</p>
                  </div>
                ) : (
                  rssSources.map((source) => (
                    <div key={source.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 flex items-center justify-between gap-4 hover:border-cyan-500/30 transition-all">
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{source.name}</h4>
                        <a href={source.url} target="_blank" rel="noreferrer" className="text-xs text-cyan-500 hover:underline truncate block max-w-sm mt-1">
                          {source.url}
                        </a>
                        <div className="flex gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">{source.category}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">✍️ {source.author}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleEditRssClick(source)}
                          className="p-2.5 rounded-lg border border-cyan-800/30 bg-cyan-950/20 text-cyan-500 hover:bg-cyan-500 hover:text-white transition-colors cursor-pointer"
                          title="Edit Source"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteRssSource(source.id)}
                          className="p-2.5 rounded-lg border border-rose-900/40 bg-rose-950/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                          title="Delete Source"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "drafts" && (
          <div className="space-y-6">

            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white">📥 Auto-Draft Pipeline</h2>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  AI-generated drafts from SEO news sources. Review, edit, and publish with one click.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleManualPoll}
                  disabled={pollingStatus === "loading"}
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-xs font-semibold text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {pollingStatus === "loading" ? "⏳ Fetching..." : "🔄 Fetch Latest News"}
                </button>
                <button
                  onClick={refreshDrafts}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
                >
                  ↻ Refresh
                </button>
              </div>
            </div>

            {/* ── Poll Result Toast ─────────────────────────────────── */}
            {pollingStatus && pollingStatus !== "loading" && (
              <div className={`relative rounded-2xl border overflow-hidden ${
                pollingStatus.error
                  ? "border-rose-800/50 bg-rose-950/20"
                  : pollingStatus.processed === 0
                  ? "border-amber-800/40 bg-amber-950/15"
                  : "border-emerald-800/40 bg-emerald-950/15"
              }`}>
                {/* Left accent stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  pollingStatus.error ? "bg-rose-500" : pollingStatus.processed === 0 ? "bg-amber-500" : "bg-emerald-500"
                }`} />
                <div className="pl-5 pr-4 py-4 flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">
                    {pollingStatus.error ? "❌" : pollingStatus.processed === 0 ? "ℹ️" : "✅"}
                  </span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className={`text-xs font-bold ${
                      pollingStatus.error ? "text-rose-300" : pollingStatus.processed === 0 ? "text-amber-300" : "text-emerald-300"
                    }`}>
                      {pollingStatus.error
                        ? "Poll Failed"
                        : pollingStatus.processed === 0
                        ? "No New Articles"
                        : `${pollingStatus.processed} New Draft${pollingStatus.processed > 1 ? "s" : ""} Created`}
                    </p>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {pollingStatus.error
                        ? pollingStatus.error
                        : `${pollingStatus.skipped} article${pollingStatus.skipped !== 1 ? "s" : ""} already seen and skipped.`}
                    </p>
                    {pollingStatus.errors?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {pollingStatus.errors.map((e, i) => (
                          <p key={i} className="text-[10px] text-amber-400/80 flex items-start gap-1.5">
                            <span className="flex-shrink-0">⚠️</span>
                            <span>{e}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setPollingStatus(null)}
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* ── Draft Action Toast ────────────────────────────────── */}
            {draftMsg && (
              <div className={`relative rounded-2xl border overflow-hidden ${
                draftMsg.startsWith("✅")
                  ? "border-emerald-800/40 bg-emerald-950/15"
                  : draftMsg.startsWith("🗑")
                  ? "border-zinc-800/60 bg-zinc-900/30"
                  : "border-rose-800/40 bg-rose-950/15"
              }`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  draftMsg.startsWith("✅") ? "bg-emerald-500" : draftMsg.startsWith("🗑") ? "bg-zinc-600" : "bg-rose-500"
                }`} />
                <div className="pl-5 pr-4 py-3.5 flex items-center gap-3">
                  <p className={`flex-1 text-xs font-medium ${
                    draftMsg.startsWith("✅") ? "text-emerald-300" : draftMsg.startsWith("🗑") ? "text-zinc-400" : "text-rose-300"
                  }`}>
                    {draftMsg}
                  </p>
                  <button
                    onClick={() => setDraftMsg("")}
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* ── Isolation Notice + Monitored Sources ─────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Isolation info */}
              <div className="rounded-2xl border border-cyan-800/30 bg-cyan-950/10 p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔒</span>
                  <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">100% Isolated Feature</h3>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  This pipeline runs <strong className="text-zinc-400">completely independent</strong> from your main website logic.
                  It directly extracts raw HTML from RSS sources with <strong className="text-zinc-400">zero AI dependencies or API costs</strong>.
                  Your public news page and SEO rankings are never affected by the background polling.
                </p>
                <p className="text-[10px] text-cyan-600">
                  Drafts only appear on the live site after you manually click Publish.
                </p>
              </div>

              {/* Monitored sources */}
              <div className="rounded-2xl border border-zinc-850 bg-zinc-900/30 p-5 space-y-3">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">📡 Monitored Sources</h3>
                <div className="space-y-2">
                  {rssSources.length > 0 ? (
                    rssSources.slice(0, 5).map((src, i) => (
                      <div key={src.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-medium
                        ${i % 2 === 0
                          ? "border-violet-500/25 bg-violet-500/8 text-violet-300"
                          : "border-cyan-500/25 bg-cyan-500/8 text-cyan-300"}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse flex-shrink-0" />
                        <span className="flex-1">{src.name}</span>
                        <span className="text-[9px] text-zinc-600 font-normal truncate max-w-[120px] sm:max-w-none">{src.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-zinc-500">No sources configured. Add some in the RSS Sources tab.</div>
                  )}
                </div>
                <p className="text-[10px] text-zinc-600 leading-relaxed">
                  Auto-polled daily (Vercel free tier limit). Trigger manually anytime, or use a free external ping service for 30-min polling.
                </p>
              </div>
            </div>

            {/* Drafts List */}
            {draftsLoading ? (
              <div className="text-center py-16 text-zinc-500 text-sm animate-pulse">Loading drafts...</div>
            ) : drafts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 py-20 text-center space-y-3">
                <div className="text-4xl">📭</div>
                <p className="text-sm font-semibold text-zinc-400">No drafts yet</p>
                <p className="text-xs text-zinc-600">Click &quot;Fetch Latest News&quot; to pull the latest articles from monitored sources.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">{drafts.length} draft(s) awaiting review</p>
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="rounded-2xl border border-zinc-850 bg-zinc-900/40 backdrop-blur-md overflow-hidden hover:border-violet-500/30 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row gap-0">
                      {/* Cover image */}
                      {draft.featuredImage && (
                        <div className="sm:w-56 flex-shrink-0 h-40 sm:h-auto relative overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={draft.featuredImage}
                            alt={draft.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        </div>
                      )}
                      {/* Content */}
                      <div className="flex-1 p-5 space-y-3">
                        <div className="flex items-start gap-3 justify-between">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
                                {draft.category}
                              </span>
                              <span className="text-[9px] text-zinc-600">{draft.author} · {draft.date}</span>
                              {draft.source_name && (
                                <span className="text-[9px] text-zinc-500 bg-zinc-900/40 px-1.5 py-0.5 rounded border border-zinc-700/50">via {draft.source_name}</span>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{draft.title}</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{draft.desc}</p>
                          </div>
                        </div>
                        {/* Action buttons */}
                        <div className="flex gap-2.5 flex-wrap pt-2">
                          <button
                            onClick={() => setDraftPreview(draft)}
                            className="flex items-center gap-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-sm"
                          >
                            👁 Preview
                          </button>
                          <button
                            onClick={() => {
                              setEditingPostId(draft.id);
                              setPostTitle(draft.title);
                              setPostDesc(draft.desc);
                              setPostContent(draft.content);
                              setPostCategory(draft.category);
                              setPostAuthor(draft.author);
                              setPostFeaturedImage(draft.featuredImage || "");
                              setPostSlug(draft.slug);
                              setActiveTab("blog");
                              setTimeout(() => document.getElementById("blog-editor-form")?.scrollIntoView({ behavior: "smooth" }), 100);
                            }}
                            className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-transparent px-4 py-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition-all cursor-pointer shadow-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDraftAction(draft.id, "publish")}
                            className="flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
                            style={{ color: "#ffffff" }}
                          >
                            🚀 Publish
                          </button>
                          <button
                            onClick={() => { if (confirm("Discard this draft permanently?")) handleDraftAction(draft.id, "discard"); }}
                            className="flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-transparent px-4 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer shadow-sm"
                          >
                            🗑 Discard
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: BLOG CMS ==================== */}
        {activeTab === "blog" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
            
            {/* Publisher Form (8 columns) */}
            <div id="blog-editor-form" className="lg:col-span-8 rounded-2xl border border-zinc-850 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-white">
                  {editingPostId ? "Edit Article" : "Create New Article"}
                </h2>
                <p className="text-xs text-zinc-550 leading-relaxed">
                  {editingPostId
                    ? "Modify the selected article's details and content, then click Save Changes."
                    : "Compose your update, choose a category, and publish it instantly to your news page."}
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
                        type="text"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={postFeaturedImage}
                        onChange={(e) => setPostFeaturedImage(e.target.value)}
                        className="w-full bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-850 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-violet-500 font-mono"
                      />
                    </div>
                  </div>

                  {isUploadingImage && (
                    <div className="mt-2 rounded-xl border border-zinc-850 p-6 bg-zinc-950/40 flex flex-col items-center justify-center gap-2.5 animate-pulse">
                      <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] text-zinc-500 font-semibold">Uploading &amp; Optimizing cover image...</span>
                    </div>
                  )}

                  {postFeaturedImage && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative h-40 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
                      <img
                        src={postFeaturedImage}
                        alt="Featured image preview"
                        className="w-full h-full object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div className="absolute bottom-1 right-1 bg-white/85 dark:bg-black/60 text-zinc-800 dark:text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold backdrop-blur-sm shadow-sm border border-black/5 dark:border-transparent">
                        Preview (Resized to 1280x720 WebP)
                      </div>
                      <button
                        type="button"
                        onClick={() => setPostFeaturedImage("")}
                        className="absolute top-1 right-1 bg-rose-100/95 dark:bg-rose-950/80 hover:bg-rose-200 dark:hover:bg-rose-900 border border-rose-200/50 dark:border-rose-900/40 text-rose-600 dark:text-rose-300 text-[10px] px-2 py-1 rounded cursor-pointer transition-all font-semibold shadow-sm backdrop-blur-sm"
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
                      initialData={postContent}
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
                  <div className="flex gap-3">
                    {editingPostId && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded-xl border border-zinc-750 bg-zinc-900 px-5 py-3 text-xs font-semibold text-zinc-400 hover:text-white transition-all cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-grow rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-xs font-semibold text-white shadow-md hover:from-violet-500 hover:to-fuchsia-500 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      {editingPostId ? "💾 Save Changes" : "🚀 Publish News Post Live"}
                    </button>
                  </div>
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
                    Management directory of active publications. You can edit or delete posts instantly.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full bg-zinc-955 px-3 py-2 rounded-xl border border-zinc-850 focus-within:border-violet-500 transition-all mt-2">
                  <svg
                    className="h-3 w-3 text-zinc-650 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search articles by title..."
                    value={blogSearch}
                    onChange={(e) => setBlogSearch(e.target.value)}
                    className="w-full bg-transparent border-0 p-0 text-xxs text-white placeholder-zinc-600 focus:outline-none focus:ring-0"
                  />
                  {blogSearch && (
                    <button
                      type="button"
                      onClick={() => setBlogSearch("")}
                      className="text-[9px] font-bold text-zinc-500 hover:text-white flex-shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-zinc-850/60">
                  {(() => {
                    const filtered = posts.filter(
                      (p) =>
                        !blogSearch ||
                        p.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
                        p.slug.toLowerCase().includes(blogSearch.toLowerCase())
                    );
                    if (filtered.length > 0) {
                      return filtered.map((post) => (
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

                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="text-xxs text-violet-400 hover:text-violet-300 font-bold border border-violet-950/20 hover:border-violet-900/40 hover:bg-violet-950/10 px-2.5 py-1.5 rounded-md transition-all cursor-pointer"
                              title="Edit Post"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="text-xxs text-rose-500 hover:text-rose-400 font-bold border border-rose-950/20 hover:border-rose-900/40 hover:bg-rose-950/10 px-2.5 py-1.5 rounded-md transition-all cursor-pointer"
                              title="Delete Post"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ));
                    } else {
                      return (
                        <div className="text-center py-12 text-zinc-550 text-xs">
                          {blogSearch ? `No articles matching "${blogSearch}"` : "No published articles in database."}
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Sidebar Stats & SEO Checklist (fills the RHS blank space) */}
              <div className="rounded-2xl border border-zinc-850 bg-zinc-900/20 p-6 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">CMS Stats &amp; SEO Checklist</h3>
                  <p className="text-xxs text-zinc-550 leading-normal">
                    Quick stats and SEO guidelines for publishing.
                  </p>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-850/60">
                  <div className="bg-zinc-950/40 border border-zinc-850/60 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Total Posts</span>
                    <span className="text-lg font-extrabold text-violet-400 block mt-0.5">{posts.length}</span>
                  </div>
                  <div className="bg-zinc-950/40 border border-zinc-850/60 p-3 rounded-xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Featured Slot</span>
                    <span className="text-xxs font-semibold text-emerald-400 block mt-1.5 line-clamp-1" title={posts.find(p => p.featured)?.title || "None"}>
                      {posts.find(p => p.featured)?.title || "None"}
                    </span>
                  </div>
                </div>

                {/* SEO Checklist */}
                <div className="space-y-3 pt-4 border-t border-zinc-850/60">
                  <span className="text-[10px] uppercase font-bold text-zinc-450 tracking-wider block">
                    📋 SEO Publishing Playbook
                  </span>
                  <ul className="space-y-2 text-xxs text-zinc-400 pl-0.5">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                      <span>URL slugs should be lowercase, using hyphens (no spaces).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                      <span>Short description ideal length: 120-160 characters.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                      <span>Organize long-form body text with Heading H2/H3 tags.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                      <span>Resize or compress large images (WebP is recommended).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                      <span>Add internal anchor links to drive visitor conversions.</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== MODAL DIALOG: LEAD DETAILS ==================== */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
            <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 space-y-6 relative shadow-2xl animate-scale-up text-left max-h-[90vh] overflow-y-auto">
              
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

        {/* ==================== DRAFT PREVIEW MODAL ==================== */}
        {draftPreview && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setDraftPreview(null)}
          >
            <div
              className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-850 sticky top-0 bg-zinc-900 rounded-t-2xl">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-violet-400">{draftPreview.category} · {draftPreview.readTime}</span>
                  <h2 className="text-base font-bold text-white leading-snug">{draftPreview.title}</h2>
                  <p className="text-[10px] text-zinc-500">{draftPreview.author} · {draftPreview.date}</p>
                </div>
                <button
                  onClick={() => setDraftPreview(null)}
                  className="ml-4 flex-shrink-0 w-8 h-8 rounded-full border border-zinc-800 text-zinc-500 hover:text-white flex items-center justify-center text-sm transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>
              {/* Cover image */}
              {draftPreview.featuredImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draftPreview.featuredImage} alt={draftPreview.title} className="w-full h-56 object-cover" />
              )}
              {/* Content */}
              <div
                className="p-6 prose prose-sm prose-invert max-w-none text-zinc-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: draftPreview.content }}
              />
              {/* Footer actions */}
              <div className="flex gap-3 p-6 border-t border-zinc-850">
                <button
                  onClick={() => { handleDraftAction(draftPreview.id, "publish"); setDraftPreview(null); }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 py-3 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  🚀 Publish Now
                </button>
                <button
                  onClick={() => setDraftPreview(null)}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-5 py-3 text-xs font-semibold text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
