const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Load env
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.length > 0 && (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    )) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

async function run() {
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    port: parseInt(env.DB_PORT || "3306", 10),
  });

  console.log("Clearing old leads table data...");
  await connection.execute("DELETE FROM leads");

  const getRelativeDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  };

  const MOCK_LEADS = [
    { id: "lead_1", name: "Amit Kumar", email: "amit@kumartech.in", phone: "+91 98765 43210", website: "kumartech.in", date: getRelativeDate(1), seoScore: 45, grade: "D", status: "New", packageRequest: "Free Audit", amountPaid: 0.00, notes: "Lead submitted site with critical performance issues (LCP 4.8s). Needs page speed overhaul." },
    { id: "lead_2", name: "Sarah Jenkins", email: "sarah@jenkinsconsulting.co.uk", phone: "+44 20 7946 0958", website: "jenkinsconsulting.co.uk", date: getRelativeDate(3), seoScore: 92, grade: "A", status: "Closed Won", packageRequest: "Premium Report", amountPaid: 29.00, notes: "Purchased Premium Report. Site looks great, but misses JSON-LD entity structures." },
    { id: "lead_3", name: "David Miller", email: "d.miller@millergroup.com", phone: "+1 555-0199", website: "millergroup.com", date: getRelativeDate(5), seoScore: 68, grade: "C", status: "In Progress", packageRequest: "Growth Agency Plan", amountPaid: 0.00, notes: "Scheduled discovery call. Interested in custom local landing pages in New York and London." },
    { id: "lead_4", name: "Rohan Malhotra", email: "rohan@mumbaifashionhub.com", phone: "+91 99887 76655", website: "mumbaifashionhub.com", date: getRelativeDate(8), seoScore: 38, grade: "F", status: "Contacted", packageRequest: "Free Audit", amountPaid: 0.00, notes: "Very poor mobile responsiveness score. Emailed standard optimization suggestions. Waiting for reply." },
    { id: "lead_5", name: "Priya Nair", email: "contact@nairclinics.org", phone: "+91 91234 56789", website: "nairclinics.org", date: getRelativeDate(11), seoScore: 84, grade: "B", status: "Closed Won", packageRequest: "Premium Report", amountPaid: 29.00, notes: "Paid Premium customer. Sent advanced reports. They are interested in local citation setups." },
    { id: "lead_6", name: "Jessica Taylor", email: "jessica@taylorlawyers.com.au", phone: "+61 2 9382 0192", website: "taylorlawyers.com.au", date: getRelativeDate(14), seoScore: 55, grade: "D", status: "Contacted", packageRequest: "Free Audit", amountPaid: 0.00, notes: "Called. Left message about Google Core Web Vitals audit results." }
  ];

  console.log("Writing 6 mock leads to database...");
  for (const l of MOCK_LEADS) {
    await connection.execute(
      "INSERT INTO leads (id, name, email, phone, website, date, seoScore, grade, status, packageRequest, amountPaid, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [l.id, l.name, l.email, l.phone, l.website, l.date, l.seoScore, l.grade, l.status, l.packageRequest, l.amountPaid, l.notes]
    );
  }

  await connection.end();
  console.log("✅ Seed completed successfully!");
}

run().catch(err => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
