const fs = require('fs');
const path = require('path');

// Raw cities lists
const indiaCities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", 
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", 
  "Ghaziabad", "Ludhiana", "Coimbatore", "Agra", "Madurai", "Nashik", "Vijayawada", "Faridabad", "Meerut", "Rajkot", 
  "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Howrah", 
  "Ranchi", "Gwalior", "Jabalpur", "Raipur", "Jodhpur", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad", "Bareilly", 
  "Moradabad", "Mysore", "Gurgaon", "Noida", "Aligarh", "Jalandhar", "Tiruchirappalli", "Bhubaneswar", "Salem", "Mira-Bhayandar", 
  "Warangal", "Thiruvananthapuram", "Guntur", "Bhiwandi", "Saharanpur", "Amravati", "Bikaner", "Nanded", "Kolhapur", "Jhansi", 
  "Gulbarga", "Ajmer", "Jammu", "Ujjain", "Sangli", "Loni", "Nellore", "Mangalore", "Belgaum", "Jamnagar", 
  "Tirupur", "Andaman", "Kurnool", "Rourkela", "Secunderabad", "Gandhinagar", "Malegaon", "Gaya", "Udaipur", "Korba", 
  "Maheshtala", "Davanagere", "Kozhikode", "Akola", "Rajamahendravaram", "Rajahmundry", "Bellary", "Shimla", "Durgapur", "Gopalpur", 
  "Haridwar", "Panaji", "Gangtok", "Shillong", "Imphal", "Agartala", "Kohima", "Aizawl", "Itanagar", "Bokaro", 
  "Muzaffarpur", "Bhagalpur", "Darbhanga", "Munger", "Purnia", "Arrah", "Begusarai", "Katihar", "Mathura", "Firozabad", 
  "Hapur", "Greater Noida", "Muzaffarnagar", "Rampur", "Shahjahanpur", "Lakhimpur", "Sitapur", "Hardoi", "Unnao", "Rae Bareli", 
  "Barabanki", "Faizabad", "Ayodhya", "Basti", "Gonda", "Bahraich", "Gorakhpur", "Deoria", "Azamgarh", "Mau", 
  "Ballia", "Jaunpur", "Ghazipur", "Chandauli", "Mirzapur", "Sonbhadra", "Fatehpur", "Pratapgarh", "Banda", "Hamirpur", 
  "Mahoba", "Lalitpur", "Jalaun", "Orai", "Etawah", "Mainpuri", "Farrukhabad", "Kannauj", "Auraiya", "Kanpur Dehat", 
  "Bilhaur", "Ghatampur", "Rania", "Akbarpur", "Rohtak", "Hisar", "Karnal", "Panipat", "Sonipat", "Ambala", 
  "Yamunanagar", "Kurukshetra", "Panchkula", "Bhiwani", "Sirsa", "Bahadurgarh", "Jind", "Thanesar", "Kaithal", "Rewari", 
  "Palwal", "Hansi", "Narnaul", "Fatehabad", "Gohana", "Tohana", "Jagraon", "Kharar", "Zirakpur", "Bathinda", 
  "Patiala", "Mohali", "Pathankot", "Hoshiarpur", "Batala", "Moga", "Abohar", "Malerkotla", "Khanna", "Muktsar", 
  "Barnala", "Firozpur", "Kapurthala", "Phagwara", "Rajpura", "Sangrur", "Rupnagar", "Nabha", "Faridkot", "Fazilka", 
  "Govindgarh", "Siliguri", "Kharagpur", "Bardhaman", "Malda", "Baharampur", "Habra", "Jalpaiguri", "Kharar", "Shantipur", 
  "Krishnanagar", "Dankuni", "Ranaghat", "Haldia", "Midnapore", "Balurghat", "Darjeeling", "Kalimpong", "Alipurduar", "Cooch Behar",
  "Purulia", "Bankura", "Suri", "Katwa", "Asansol", "Raniganj", "Bolpur", "Rampurhat", "Bishnupur", "Jhargram",
  "Contai", "Ghatal", "Tamluk", "Basirhat", "Bongaon", "Barasat", "Barrackpore", "Kalyani", "Kanchrapara", "Naihati"
];

const usCities = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", 
  "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", "Seattle", "Denver", "Washington", 
  "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City", "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore", 
  "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento", "Mesa", "Kansas City", "Atlanta", "Omaha", "Colorado Springs", 
  "Raleigh", "Miami", "Long Beach", "Virginia Beach", "Oakland", "Minneapolis", "Tampa", "Tulsa", "Arlington", "New Orleans", 
  "Wichita", "Bakersfield", "Cleveland", "Aurora", "Anaheim", "Honolulu", "Santa Ana", "Riverside", "Corpus Christi", "Lexington", 
  "Henderson", "Stockton", "Saint Paul", "Cincinnati", "St. Louis", "Pittsburgh", "Greensboro", "Lincoln", "Anchorage", "Plano", 
  "Orlando", "Irvine", "Newark", "Durham", "Chula Vista", "Toledo", "Fort Wayne", "St. Petersburg", "Laredo", "Jersey City", 
  "Chandler", "Madison", "Lubbock", "Scottsdale", "Reno", "Buffalo", "Gilbert", "Glendale", "North Las Vegas", "Winston-Salem", 
  "Chesapeake", "Norfolk", "Fremont", "Garland", "Irving", "Hialeah", "Richmond", "Boise", "Spokane", "Baton Rouge", 
  "Tacoma", "San Bernardino", "Modesto", "Huntsville", "Des Moines", "Yonkers", "Rochester", "Fayetteville", "Frisco", "Americus", 
  "Athens", "Augusta", "Savannah", "Macon", "Albany", "Valdosta", "Marietta", "Alpharetta", "Roswell", "Sandy Springs", 
  "Johns Creek", "Smyrna", "Dunwoody", "Brookhaven", "Peachtree City", "Gainesville", "Rome", "Dalton", "Hinesville", "Kennesaw", 
  "LaGrange", "Statesboro", "Lawrenceville", "Duluth", "Woodstock", "Carrollton", "Newnan", "Douglasville", "Snellville", "Decatur", 
  "Milledgeville", "Stockbridge", "Conyers", "Sugar Hill", "Acworth", "Cartersville", "Union City", "Suwanee", "Griffin", "Warner Robins", 
  "Perry", "Pooler", "Forest Park", "Thomasville", "Milton", "North Decatur", "Redan", "Wilmington", "Dover", "Middletown", 
  "Milford", "Seaford", "Georgetown", "Elsmere", "New Castle", "Delaware City", "Lewes", "Rehoboth Beach", "Hartford", "New Haven", 
  "Stamford", "Bridgeport", "Waterbury", "Norwalk", "Danbury", "New Britain", "West Hartford", "Bristol", "Meriden", "Shelton", 
  "Norwich", "Torrington", "Naugatuck", "East Hartford", "Manchester", "Stratford", "Greenwich", "Hamden", "Fairfield", "Enfield", 
  "Wallingford", "Southington", "Groton", "Vernon", "New London", "Ansonia", "Windsor", "South Windsor", "Wethersfield", "Farmington", 
  "Mansfield", "Simsbury", "Ridgefield", "Cheshire", "Darien", "Salt Lake City", "Provo", "West Valley City", "West Jordan", "Orem", 
  "Sandy", "Ogden", "St. George", "Layton", "South Jordan", "Taylorsville", "Lehi", "Logan", "Murray", "Bountiful", 
  "Draper", "Riverton", "Roy", "Spanish Fork", "Pleasant Grove", "Cottonwood Heights", "Tooele", "Springville", "Midvale", "Kaysville", 
  "Clearfield", "Syracuse", "Herriman", "Clinton", "Washington City", "Payson", "Vernal", "Heber City", "Brigham City", "Park City",
  "Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs", "Sheridan", "Green River", "Evanston", "Riverton", "Cody"
];

const ukCities = [
  "London", "Birmingham", "Glasgow", "Liverpool", "Bristol", "Manchester", "Sheffield", "Leeds", "Edinburgh", "Leicester", 
  "Coventry", "Bradford", "Cardiff", "Belfast", "Nottingham", "Kingston upon Hull", "Newcastle upon Tyne", "Stoke-on-Trent", "Southampton", "Derby", 
  "Portsmouth", "Plymouth", "Brighton", "Reading", "Northampton", "Luton", "Wolverhampton", "Huddersfield", "Southend-on-Sea", "Worcester", 
  "York", "Bath", "Exeter", "Oxford", "Cambridge", "Norwich", "Gloucester", "Canterbury", "Salisbury", "St Albans", 
  "Wakefield", "Sunderland", "Swansea", "Salford", "Preston", "Westminster", "City of London", "Newport", "Carlisle", "Lancaster", 
  "Lincoln", "Winchester", "Chester", "Chichester", "Durham", "Hereford", "Lichfield", "St Davids", "Bangor", "St Asaph", 
  "Ripon", "Truro", "Ely", "Wells", "Armagh", "Londonderry", "Lisburn", "Newry", "Inverness", "Stirling", 
  "Dundee", "Aberdeen", "Perth", "Elgin", "Hamilton", "Livingston", "Dunfermline", "Kirkcaldy", "East Kilbride", "Paisley", 
  "Greenock", "Coatbridge", "Glenrothes", "Airdrie", "Falkirk", "Kilmarnock", "St Andrews", "Motherwell", "Wishaw", "Dumbarton", 
  "Cumbernauld", "Alloa", "Bathgate", "Peterhead", "Fraserburgh", "Inverurie", "Stonehaven", "Huntly", "Turriff", "Ellon"
];

const australiaCities = [
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle", "Wollongong", "Logan City", 
  "Geelong", "Hobart", "Townsville", "Cairns", "Toowoomba", "Darwin", "Ballarat", "Bendigo", "Albury", "Launceston", 
  "Mackay", "Rockhampton", "Bunbury", "Coffs Harbour", "Bundaberg", "Wagga Wagga", "Hervey Bay", "Mildura", "Gladstone", "Shepparton", 
  "Tamworth", "Port Macquarie", "Orange", "Dubbo", "Geraldton", "Nowra", "Bathurst", "Warrnambool", "Lismore", "Kalgoorlie", 
  "Albany", "Mount Gambier", "Devonport", "Alice Springs", "Maryborough", "Whyalla", "Goulburn", "Armidale", "Gympie", "Traralgon", 
  "Wangaratta", "Karratha", "Port Hedland", "Port Augusta", "Port Lincoln", "Horsham", "Murray Bridge", "Busselton", "Broken Hill", "Sale", 
  "Singleton", "Muswellbrook", "Cessnock", "Maitland", "Grafton", "Ballina", "Tweed Heads", "Lithgow", "Bowral", "Mittagong", 
  "Moss Vale", "Kiama", "Shellharbour", "Queanbeyan", "Yass", "Gundagai", "Tumut", "Cooma", "Jindabyne", "Bega", 
  "Merimbula", "Eden", "Narooma", "Moruya", "Batemans Bay", "Ulladulla", "Shoalhaven Heads", "Gerringong", "Berry", "Kangaroo Valley", 
  "Culburra Beach", "Callala Bay", "Narre Warren", "Sunbury", "Pakenham", "Cranbourne", "Melton", "Werribee", "Bacchus Marsh", "Torquay"
];

function getSlug(name) {
  return name.toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove special characters except spaces and hyphens
    .replace(/[\s_]+/g, '-')   // replace spaces/underscores with hyphens
    .replace(/-+/g, '-');      // remove duplicate hyphens
}

// Generate structured data for a city
function hydrateCity(cityName, country, index) {
  const slug = getSlug(cityName);
  
  // Categorize based on country & index to create diverse, high-quality, realistic niches
  let niche = "";
  let marketSize = "";
  let competitiveness = "";
  
  const isTechHub = ["bangalore", "hyderabad", "pune", "gurgaon", "noida", "new-york", "san-francisco", "seattle", "austin", "boston", "london", "edinburgh", "sydney", "melbourne", "adelaide"].includes(slug);
  const isFinanceHub = ["mumbai", "delhi", "chicago", "charlotte", "dallas", "jersey-city", "london", "sydney"].includes(slug);
  const isTourismHub = ["darjeeling", "kalimpong", "goa", "miami", "orlando", "las-vegas", "honolulu", "st-george", "park-city", "brighton", "salisbury", "gold-coast", "cairns", "hobart", "alice-springs"].includes(slug);
  const isManufacturingHub = ["surat", "ahmedabad", "ludhiana", "coimbatore", "detroit", "cleveland", "pittsburgh", "birmingham", "manchester", "newcastle", "wollongong", "geelong"].includes(slug);
  
  // Niche assignment
  if (country === "India") {
    if (isTechHub) niche = "SaaS, Software Development, & Tech Startups";
    else if (isFinanceHub) niche = "Fintech, E-commerce, & Enterprise Brands";
    else if (isManufacturingHub) niche = "Manufacturing, B2B Exports, & Logistics Services";
    else if (isTourismHub) niche = "Hospitality, Tourism, & Local Retail";
    else {
      // Rotation for diversity
      const niches = [
        "Local Services, Retail, & Professional Firms",
        "Healthcare Clinics, Diagnostics, & Local Doctors",
        "Real Estate Agencies, Builders, & Property Firms",
        "Educational Institutes, Coaching, & Training Centers"
      ];
      niche = niches[index % niches.length];
    }
  } else if (country === "United States") {
    if (isTechHub) niche = "SaaS, Tech Startups, & Digital Platforms";
    else if (isFinanceHub) niche = "Finance, Real Estate, & Corporate Law";
    else if (isManufacturingHub) niche = "Logistics, Manufacturing, & B2B Distribution";
    else if (isTourismHub) niche = "Hospitality, Tourism, & Premium Retail";
    else {
      const niches = [
        "Home Services, HVAC, Plumbers, & Local Contractors",
        "Medical Clinics, Dental Practices, & Healthcare Services",
        "Professional Services, Law Firms, & CPAs",
        "E-commerce Brands, Local Shops, & Delivery Services"
      ];
      niche = niches[index % niches.length];
    }
  } else if (country === "United Kingdom") {
    if (isTechHub || isFinanceHub) niche = "Fintech, Corporate Finance, & Tech Agencies";
    else if (isManufacturingHub) niche = "Industrial Manufacturing, Trade, & Logistics";
    else if (isTourismHub) niche = "Hospitality, Tour Operators, & Heritage Retail";
    else {
      const niches = [
        "Local Trade Services, Construction, & Contractors",
        "Professional Services, Solicitors, & Consultancies",
        "Independent Retail, E-commerce, & Local Dining",
        "Dental Practices, Care Homes, & Wellness Clinics"
      ];
      niche = niches[index % niches.length];
    }
  } else { // Australia
    if (isTechHub || isFinanceHub) niche = "Creative Agencies, Finance, & E-commerce Hubs";
    else if (isManufacturingHub) niche = "Construction, Civil Contracting, & Heavy Industry";
    else if (isTourismHub) niche = "Tourism, Accommodation, & Real Estate Agencies";
    else {
      const niches = [
        "Medical Practitioners, Physiotherapy, & Dental Clinics",
        "Local Service Businesses, Plumbers, & Electricians",
        "Boutique Retail, Cafes, & Professional Services",
        "Real Estate, Property Management, & Brokers"
      ];
      niche = niches[index % niches.length];
    }
  }
  
  // Market size assignment (first 10 cities of each country get high sizes, rest get standard sizes)
  if (index < 3) {
    marketSize = country === "India" ? "15 Million+" : (country === "United States" ? "8 Million+" : (country === "United Kingdom" ? "5 Million+" : "3.5 Million+"));
    competitiveness = "Extreme";
  } else if (index < 10) {
    marketSize = country === "India" ? "8 Million+" : (country === "United States" ? "3 Million+" : (country === "United Kingdom" ? "1.5 Million+" : "1.2 Million+"));
    competitiveness = "Very High";
  } else if (index < 40) {
    marketSize = country === "India" ? "2 Million - 5 Million" : (country === "United States" ? "1 Million - 2.5 Million" : (country === "United Kingdom" ? "500k - 1 Million" : "400k - 800k"));
    competitiveness = "High";
  } else {
    marketSize = country === "India" ? "500k - 1.5 Million" : (country === "United States" ? "150k - 600k" : (country === "United Kingdom" ? "100k - 400k" : "80k - 300k"));
    competitiveness = "Medium";
  }
  
  // Top keywords
  const topKeywords = [
    `seo agency ${slug.replace(/-/g, ' ')}`,
    `best seo company in ${slug.replace(/-/g, ' ')}`,
    `seo services ${slug.replace(/-/g, ' ')}`
  ];
  
  // Dynamic description
  const description = `${cityName} is a key economic hub for ${niche.toLowerCase()} in ${country === "United States" ? "the US" : country === "United Kingdom" ? "the UK" : country}. We deploy advanced schema markup, localized keyword strategies, and high-performance speed parameters to dominate ${cityName} local search engines.`;
  
  return {
    name: cityName,
    country: country,
    niche: niche,
    marketSize: marketSize,
    competitiveness: competitiveness,
    topKeywords: topKeywords,
    description: description
  };
}

// Compile all cities into a single database object
const citiesDb = {};

// indiaCities.forEach((city, index) => {
//   const slug = getSlug(city);
//   citiesDb[slug] = hydrateCity(city, "India", index);
// });

usCities.forEach((city, index) => {
  const slug = getSlug(city);
  citiesDb[slug] = hydrateCity(city, "United States", index);
});

// ukCities.forEach((city, index) => {
//   const slug = getSlug(city);
//   citiesDb[slug] = hydrateCity(city, "United Kingdom", index);
// });

// australiaCities.forEach((city, index) => {
//   const slug = getSlug(city);
//   citiesDb[slug] = hydrateCity(city, "Australia", index);
// });

// Output code generation
const outputDir = path.join(__dirname);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'cities.js');
let fileContent = `// Automatically generated cities database for location SEO targeting
// Total targeted cities: ${Object.keys(citiesDb).length}

export const citiesDb = ${JSON.stringify(citiesDb, null, 2)};
`;

fs.writeFileSync(outputPath, fileContent, 'utf-8');
console.log(`Successfully generated cities.js containing ${Object.keys(citiesDb).length} cities at: ${outputPath}`);
