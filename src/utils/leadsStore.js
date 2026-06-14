// Database-driven leads store communicating with server-side MySQL endpoints.
// Safe for server-side pre-rendering (SSR) and client hydration.

const SETTINGS_KEY = "seointellect_admin_settings";

const DEFAULT_SETTINGS = {
  adminPasscode: "admin123",
  webhookUrl: "",
  web3formsKey: "",
};

// Read settings (browser-only, persisted in localStorage)
export const getSettings = () => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (e) {
    console.error("Failed to read settings", e);
    return DEFAULT_SETTINGS;
  }
};

// Write settings (browser-only, persisted in localStorage)
export const saveSettings = (settings) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
};

// Trigger webhook integration (client-side)
export const triggerWebhook = async (event, lead) => {
  const settings = getSettings();
  if (!settings.webhookUrl) return;
  try {
    const payload = {
      event: event,
      timestamp: new Date().toISOString(),
      lead: lead,
    };
    await fetch(settings.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      mode: "no-cors",
    });
  } catch (e) {
    console.error("Failed to trigger webhook:", e);
  }
};

// Fetch all leads from Hostinger MySQL database via API
export const getAllLeads = async () => {
  if (typeof window === "undefined") return [];
  try {
    const settings = getSettings();
    const res = await fetch("/api/leads/", {
      headers: {
        "x-admin-passcode": settings.adminPasscode || "admin123",
      },
    });
    if (!res.ok) throw new Error("Failed to fetch leads");
    return await res.json();
  } catch (e) {
    console.error("leadsStore: Failed to get leads:", e);
    return [];
  }
};

// Add a new lead to Hostinger MySQL database via API
export const addLead = async (leadData) => {
  // 1. Strict Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!leadData.email || !emailRegex.test(leadData.email.trim())) {
    throw new Error("Invalid email format.");
  }

  const phoneRegex = /^[\+0-9\-\s\(\)]{8,20}$/;
  if (!leadData.phone || !phoneRegex.test(leadData.phone.trim())) {
    throw new Error("Invalid phone number format. Must be 8-20 digits long.");
  }

  if (!leadData.name || leadData.name.trim().length < 2) {
    throw new Error("Please enter a valid full name (minimum 2 characters).");
  }

  let cleanWebsite = (leadData.website || "").trim().toLowerCase();
  cleanWebsite = cleanWebsite.replace(/^(https?:\/\/)?(www\.)?/, "");
  cleanWebsite = cleanWebsite.split("/")[0];
  
  if (!cleanWebsite || !cleanWebsite.includes(".")) {
    throw new Error("Invalid website URL. Must include a domain extension (e.g., .com).");
  }

  const newLead = {
    id: leadData.id || "lead_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    name: (leadData.name || "Client").trim(),
    email: (leadData.email || "").trim(),
    phone: (leadData.phone || "Not Provided").trim(),
    website: cleanWebsite,
    date: leadData.date || new Date().toISOString(),
    seoScore: leadData.seoScore || 0,
    grade: leadData.grade || "Pending",
    status: leadData.status || "New",
    packageRequest: leadData.packageRequest || "Free Audit",
    amountPaid: leadData.amountPaid || 0,
    notes: leadData.notes || "",
  };

  try {
    const res = await fetch("/api/leads/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLead),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save lead");

    // Trigger webhook in background
    triggerWebhook("lead_captured", newLead);

    return newLead;
  } catch (e) {
    console.error("leadsStore: Failed to save lead:", e);
    throw e;
  }
};

// Update lead details in database via API
export const updateLead = async (id, updates) => {
  try {
    const settings = getSettings();
    const res = await fetch("/api/leads/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-passcode": settings.adminPasscode || "admin123",
      },
      body: JSON.stringify({ id, updates }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update lead");

    triggerWebhook("lead_updated", { id, ...updates });
    return true;
  } catch (e) {
    console.error("leadsStore: Failed to update lead:", e);
    throw e;
  }
};

// Delete a lead from database via API
export const deleteLead = async (id) => {
  try {
    const settings = getSettings();
    const res = await fetch(`/api/leads/?id=${id}`, {
      method: "DELETE",
      headers: {
        "x-admin-passcode": settings.adminPasscode || "admin123",
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete lead");
    return true;
  } catch (e) {
    console.error(`leadsStore: Failed to delete lead (${id}):`, e);
    throw e;
  }
};

// Clear all leads from database via API
export const clearAllLeads = async () => {
  return await deleteLead("all");
};

// Reset to mock database leads (seeded through client endpoints)
export const resetToMock = async () => {
  try {
    await clearAllLeads();

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
        notes: "Lead submitted site with critical performance issues (LCP 4.8s). Needs page speed overhaul."
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
        amountPaid: 29.00,
        notes: "Purchased Premium Report. Site looks great, but misses JSON-LD entity structures."
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
        notes: "Scheduled discovery call. Interested in custom local landing pages in New York and London."
      },
      {
        id: "lead_4",
        name: "Rohan Malhotra",
        email: "rohan@mumbaifashionhub.com",
        phone: "+91 99887 76655",
        website: "mumbaifashionhub.com",
        date: getRelativeDate(8),
        seoScore: 38,
        grade: "F",
        status: "Contacted",
        packageRequest: "Free Audit",
        amountPaid: 0,
        notes: "Very poor mobile responsiveness score. Emailed standard optimization suggestions. Waiting for reply."
      },
      {
        id: "lead_5",
        name: "Priya Nair",
        email: "contact@nairclinics.org",
        phone: "+91 91234 56789",
        website: "nairclinics.org",
        date: getRelativeDate(11),
        seoScore: 84,
        grade: "B",
        status: "Closed Won",
        packageRequest: "Premium Report",
        amountPaid: 29.00,
        notes: "Paid Premium customer. Sent advanced reports. They are interested in local citation setups."
      },
      {
        id: "lead_6",
        name: "Jessica Taylor",
        email: "jessica@taylorlawyers.com.au",
        phone: "+61 2 9382 0192",
        website: "taylorlawyers.com.au",
        date: getRelativeDate(14),
        seoScore: 55,
        grade: "D",
        status: "Contacted",
        packageRequest: "Free Audit",
        amountPaid: 0,
        notes: "Called. Left message about Google Core Web Vitals audit results."
      }
    ];

    for (const lead of MOCK_LEADS) {
      await addLead(lead);
    }

    return await getAllLeads();
  } catch (e) {
    console.error("leadsStore: Failed to reset leads:", e);
    return [];
  }
};

// Export database leads to CSV format
export const exportToCSV = async () => {
  try {
    const leads = await getAllLeads();
    const headers = ["ID", "Name", "Email", "Phone", "Website", "Date", "SEO Score", "Grade", "Status", "Package Request", "Amount Paid", "Notes"];
    
    const rows = leads.map((l) => [
      l.id,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.website || "").replace(/"/g, '""')}"`,
      l.date,
      l.seoScore,
      l.grade,
      `"${l.status}"`,
      `"${l.packageRequest}"`,
      l.amountPaid,
      `"${(l.notes || "").replace(/"/g, '""').replace(/\n/g, " ")}"`
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  } catch (e) {
    console.error("leadsStore: Failed to export CSV:", e);
    return "";
  }
};

// Compatibility helper to upgrade leads directly via payments
export const findAndUpgradeLeadToPaid = async (email, website, packageName, price) => {
  try {
    const newLead = await addLead({
      name: email.split("@")[0] || "Client",
      email: email,
      phone: "Not Provided",
      website: website,
      status: "Closed Won",
      packageRequest: packageName,
      amountPaid: price,
      notes: "Lead upgraded directly via payment system integration.",
    });
    return newLead;
  } catch (e) {
    console.error("leadsStore: Failed to upgrade lead:", e);
    return null;
  }
};
