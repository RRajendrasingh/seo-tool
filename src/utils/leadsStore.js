// Client-side lead store persisting data in localStorage.
// Compatible with static exports (output: 'export').

const LEADS_KEY = "seointellect_leads";
const SETTINGS_KEY = "seointellect_admin_settings";

const DEFAULT_SETTINGS = {
  adminPasscode: "admin123",
  webhookUrl: "",
  web3formsKey: "",
  gscVerificationToken: "",
  gtmId: "",
  clarityId: "",
  agencyName: "",
  agencyLogo: "",
  agencyAccentColor: "indigo",
};

// Helper to get relative ISO dates (relative to today)
const getRelativeDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const MOCK_LEADS = [
  {
    id: "lead_1",
    name: "Amit Kumar",
    email: "amit@kumartech.in",
    phone: "+91 98765 43210",
    website: "kumartech.in",
    date: getRelativeDate(1),
    seoScore: 45,
    grade: "D",
    status: "New",
    packageRequest: "Free Audit",
    amountPaid: 0,
    notes: "Lead submitted site with critical performance issues (LCP 4.8s). Needs page speed overhaul.",
  },
  {
    id: "lead_2",
    name: "Sarah Jenkins",
    email: "sarah@jenkinsconsulting.co.uk",
    phone: "+44 20 7946 0958",
    website: "jenkinsconsulting.co.uk",
    date: getRelativeDate(3),
    seoScore: 92,
    grade: "A",
    status: "Closed Won",
    packageRequest: "Premium Report",
    amountPaid: 29,
    notes: "Purchased Premium Report. Site looks great, but misses JSON-LD entity structures.",
  },
  {
    id: "lead_3",
    name: "David Miller",
    email: "d.miller@millergroup.com",
    phone: "+1 555-0199",
    website: "millergroup.com",
    date: getRelativeDate(5),
    seoScore: 68,
    grade: "C",
    status: "In Progress",
    packageRequest: "Growth Agency Plan",
    amountPaid: 0,
    notes: "Scheduled discovery call. Interested in custom local landing pages in New York and London.",
  },
  {
    id: "lead_4",
    name: "Rohan Malhotra",
    email: "rohan@mumbaifashionhub.com",
    phone: "+91 99887 76655",
    website: "mumbaifashionhub.com",
    date: getRelativeDate(7),
    seoScore: 78,
    grade: "B",
    status: "New",
    packageRequest: "Free Audit",
    amountPaid: 0,
    notes: "E-commerce platform. Good titles but images lack descriptive alt text.",
  },
  {
    id: "lead_5",
    name: "Jessica Taylor",
    email: "jessica@taylorglobal.com.au",
    phone: "+61 2 9382 0199",
    website: "taylorglobal.com.au",
    date: getRelativeDate(10),
    seoScore: 55,
    grade: "D",
    status: "New",
    packageRequest: "Premium Report",
    amountPaid: 29,
    notes: "Purchased Premium Report. Highly competitive niche. Lacking H1 headings and schema.",
  },
  {
    id: "lead_6",
    name: "Carlos Mendez",
    email: "carlos@mendezlaw.com",
    phone: "+1 305-555-0122",
    website: "mendezlaw.com",
    date: getRelativeDate(12),
    seoScore: 84,
    grade: "B",
    status: "In Progress",
    packageRequest: "Free Audit",
    amountPaid: 0,
    notes: "Local injury lawyer. Backlinks are low, but tags are clean.",
  },
  {
    id: "lead_7",
    name: "Emily Watson",
    email: "emily@watsonboutique.com",
    phone: "+1 212-555-0143",
    website: "watsonboutique.com",
    date: getRelativeDate(15),
    seoScore: 38,
    grade: "F",
    status: "New",
    packageRequest: "Free Audit",
    amountPaid: 0,
    notes: "Shopify store with 404 broken links on key collection pages.",
  },
  {
    id: "lead_8",
    name: "Kenji Sato",
    email: "k.sato@satomedia.jp",
    phone: "+81 3 5555 0188",
    website: "satomedia.jp",
    date: getRelativeDate(18),
    seoScore: 89,
    grade: "B",
    status: "Closed Won",
    packageRequest: "Premium Report",
    amountPaid: 29,
    notes: "Purchased Premium Report. Clean static pages, minor caching recommendations.",
  },
  {
    id: "lead_9",
    name: "Sophia Martinez",
    email: "sophia@martinezrealestate.es",
    phone: "+34 91 555 0177",
    website: "martinezrealestate.es",
    date: getRelativeDate(20),
    seoScore: 71,
    grade: "C",
    status: "In Progress",
    packageRequest: "Free Audit",
    amountPaid: 0,
    notes: "Real estate listings. Lacking unique meta descriptions on dynamically loaded properties.",
  },
  {
    id: "lead_10",
    name: "Liam O'Connor",
    email: "liam@oconnorconstruction.ie",
    phone: "+353 1 496 0123",
    website: "oconnorconstruction.ie",
    date: getRelativeDate(25),
    seoScore: 49,
    grade: "D",
    status: "Closed Lost",
    packageRequest: "Free Audit",
    amountPaid: 0,
    notes: "No reply to audit presentation. Leads lost.",
  },
  {
    id: "lead_11",
    name: "Chao Wei",
    email: "wei@weilogistics.cn",
    phone: "+86 21 5555 0199",
    website: "weilogistics.cn",
    date: getRelativeDate(30),
    seoScore: 95,
    grade: "A",
    status: "Closed Won",
    packageRequest: "Premium Report",
    amountPaid: 29,
    notes: "Upgraded to Premium. Clean entity tags and fast loading times.",
  },
  {
    id: "lead_12",
    name: "Elena Petrova",
    email: "elena@petrovaagency.ru",
    phone: "+7 495 555 0134",
    website: "petrovaagency.ru",
    date: getRelativeDate(35),
    seoScore: 61,
    grade: "C",
    status: "New",
    packageRequest: "Free Audit",
    amountPaid: 0,
    notes: "SEO configuration is correct, but images are not compressed (3.5MB home page payload).",
  }
];

export const getSettings = () => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings) => {
  if (typeof window === "undefined") return settings;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  return settings;
};

export const getAllLeads = () => {
  if (typeof window === "undefined") return MOCK_LEADS;
  const raw = localStorage.getItem(LEADS_KEY);
  if (!raw) {
    localStorage.setItem(LEADS_KEY, JSON.stringify(MOCK_LEADS));
    return MOCK_LEADS;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return MOCK_LEADS;
  }
};

export const triggerWebhook = async (event, lead) => {
  const settings = getSettings();
  if (!settings.webhookUrl) return;
  try {
    const payload = {
      event: event,
      timestamp: new Date().toISOString(),
      lead: lead
    };
    await fetch(settings.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      mode: "no-cors"
    });
  } catch (e) {
    console.error("Failed to trigger webhook:", e);
  }
};

export const addLead = async (leadData) => {
  const newLead = {
    id: leadData.id || `lead_${Date.now()}`,
    name: leadData.name || "",
    email: leadData.email || "",
    phone: leadData.phone || "",
    website: leadData.website || "",
    date: leadData.date || new Date().toISOString(),
    seoScore: leadData.seoScore || null,
    grade: leadData.grade || "",
    status: leadData.status || "New",
    packageRequest: leadData.packageRequest || "Free Audit",
    amountPaid: leadData.amountPaid || 0,
    notes: leadData.notes || "",
  };

  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLead)
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Failed to submit lead to database");
    }
    newLead.id = result.id || newLead.id;
  } catch (err) {
    console.error("Backend addLead failed:", err);
    throw err; // Propagate the error so that the form can show the limit message
  }

  // Also save locally for backward compatibility or offline access
  if (typeof window !== "undefined") {
    const leads = getAllLeads();
    leads.unshift(newLead);
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  }
  
  await triggerWebhook("lead_captured", newLead);
  return newLead;
};

export const updateLead = (id, updates) => {
  const leads = getAllLeads();
  let updatedLead = null;
  const updatedLeads = leads.map(lead => {
    if (lead.id === id) {
      updatedLead = { ...lead, ...updates };
      return updatedLead;
    }
    return lead;
  });
  
  if (typeof window !== "undefined") {
    localStorage.setItem(LEADS_KEY, JSON.stringify(updatedLeads));
  }
  
  if (updatedLead) {
    triggerWebhook("lead_updated", updatedLead);
  }
  
  return updatedLead;
};

export const deleteLead = (id) => {
  const leads = getAllLeads();
  const filtered = leads.filter(l => l.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(LEADS_KEY, JSON.stringify(filtered));
  }
  return filtered;
};

export const resetToMock = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LEADS_KEY, JSON.stringify(MOCK_LEADS));
  }
  return MOCK_LEADS;
};

export const clearAllLeads = () => {
  const empty = [];
  if (typeof window !== "undefined") {
    localStorage.setItem(LEADS_KEY, JSON.stringify(empty));
  }
  return empty;
};

export const exportToCSV = () => {
  const leads = getAllLeads();
  const headers = ["ID", "Name", "Email", "Phone", "Website", "Date", "SEO Score", "Grade", "Status", "Package Request", "Amount Paid", "Notes"];
  const rows = leads.map(l => [
    l.id,
    `"${(l.name || "").replace(/"/g, '""')}"`,
    l.email,
    l.phone,
    l.website,
    l.date,
    l.seoScore || "",
    l.grade || "",
    l.status,
    l.packageRequest,
    l.amountPaid,
    `"${(l.notes || "").replace(/"/g, '""')}"`
  ]);
  
  const csvContent = [
    headers.join(","),
    ...rows.map(r => r.join(","))
  ].join("\n");
  
  return csvContent;
};
