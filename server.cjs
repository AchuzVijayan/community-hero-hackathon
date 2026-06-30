var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy_key",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var DB_PATH = import_path.default.join(process.cwd(), "db.json");
function initDB() {
  if (import_fs.default.existsSync(DB_PATH)) {
    try {
      const data = import_fs.default.readFileSync(DB_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (!parsed.communities) {
        parsed.communities = [
          {
            id: "comm_1",
            name: "Fort Kochi Residents Club",
            description: "A community for people living, working, and loving Fort Kochi Beach area. Let's keep our heritage clean!",
            ward_id: "ward_1",
            members: ["demo_citizen"],
            created_by: "system",
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          },
          {
            id: "comm_2",
            name: "Edappally Clean-up Committee",
            description: "Focused on solving waste management, water logging, and broken lights around Lulu Mall and NH 66.",
            ward_id: "ward_2",
            members: [],
            created_by: "system",
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          },
          {
            id: "comm_3",
            name: "Mattancherry Heritage Protection Group",
            description: "Dedicated to local road safety, historic pathways, and general public utility issues around Palace Road.",
            ward_id: "ward_3",
            members: [],
            created_by: "system",
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          }
        ];
        import_fs.default.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), "utf-8");
      }
      return parsed;
    } catch (e) {
      console.error("Error reading db.json, resetting database", e);
    }
  }
  const initialData = {
    users: {
      "demo_citizen": {
        id: "demo_citizen",
        email: "citizen@communityhero.in",
        username: "citizen",
        phone: "9876543210",
        password: "password123",
        name: "Aravind Nair",
        role: "citizen",
        ward_id: "ward_2",
        trust_score: 85,
        points: 240,
        badges: ["First Responder", "Pothole Hunter"]
      },
      "demo_authority": {
        id: "demo_authority",
        email: "officer@kochi.gov.in",
        username: "officer",
        phone: "9988776655",
        password: "password123",
        name: "Municipal Commissioner V.S. Kumar",
        role: "authority",
        ward_id: "ward_1",
        trust_score: 100,
        points: 0,
        badges: []
      }
    },
    wards: [
      { id: "ward_1", name: "Fort Kochi Ward", city: "Kochi", state: "Kerala", health_score: 92, lat: 9.9658, lng: 76.2421 },
      { id: "ward_2", name: "Edappally North", city: "Kochi", state: "Kerala", health_score: 64, lat: 10.0261, lng: 76.3125 },
      { id: "ward_3", name: "Mattancherry Ward", city: "Kochi", state: "Kerala", health_score: 41, lat: 9.9576, lng: 76.2589 },
      { id: "ward_4", name: "Vyttila Ward", city: "Kochi", state: "Kerala", health_score: 88, lat: 9.9674, lng: 76.319 }
    ],
    departments: [
      { id: "dept_1", name: "Roads & Traffic Division", head: "K. R. Rajesh (Executive Engineer)", assigned_issues_count: 3, sla_days: 7 },
      { id: "dept_2", name: "Water Authority & Sewerage", head: "Mini Paul (Asst. Engineer)", assigned_issues_count: 1, sla_days: 3 },
      { id: "dept_3", name: "Electricity & Street Lighting Board", head: "S. Anil Kumar (Chief Substation Engineer)", assigned_issues_count: 2, sla_days: 2 },
      { id: "dept_4", name: "Solid Waste Management", head: "Dr. Geetha Madhavan (Health Officer)", assigned_issues_count: 2, sla_days: 1 }
    ],
    issues: [
      {
        id: "issue_1",
        title: "Massive crater on Mattancherry main intersection",
        description: "A huge pothole has formed right at the Mattancherry intersection near the post office. It fills with water during rain, causing severe traffic jams and multiple two-wheeler skidding incidents.",
        category: "Pothole",
        severity: 8,
        status: "reported",
        ward_id: "ward_3",
        reporter_id: "demo_citizen",
        reporter_name: "Aravind Nair",
        assigned_to: "Roads & Traffic Division",
        department: "Roads & Traffic Division",
        latitude: 9.9582,
        longitude: 76.2595,
        address: "Mattancherry Post Office Junction, Kochi",
        upvotes: 42,
        upvoted_by: ["demo_citizen"],
        is_duplicate: false,
        sla_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
        estimated_cost: 12e3,
        before_image: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=400"
      },
      {
        id: "issue_2",
        title: "Broken streetlight near Girls High School",
        description: "The main street lamp near the girls high school entrance has been flickering and completely dark for the last 5 days. High safety concern for girls attending evening coaching classes.",
        category: "Broken Streetlight",
        severity: 7,
        status: "verified",
        ward_id: "ward_3",
        reporter_id: "user_982",
        reporter_name: "Anjali Sharma",
        assigned_to: "Electricity & Street Lighting Board",
        department: "Electricity & Street Lighting Board",
        latitude: 9.9568,
        longitude: 76.258,
        address: "Bazar Road, near Girls High School, Mattancherry",
        upvotes: 18,
        upvoted_by: [],
        is_duplicate: false,
        sla_deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1e3).toISOString(),
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString(),
        estimated_cost: 2500,
        before_image: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&q=80&w=400"
      },
      {
        id: "issue_3",
        title: "Uncontrolled garbage dumping on footpath",
        description: "Bags of solid household waste dumped right on the footpath. Stray dogs are scattering it across the road. Emitting extremely foul smell and blocking walking path.",
        category: "Garbage Dumping",
        severity: 6,
        status: "in_progress",
        ward_id: "ward_2",
        reporter_id: "user_456",
        reporter_name: "John Mathew",
        assigned_to: "Solid Waste Management",
        department: "Solid Waste Management",
        latitude: 10.027,
        longitude: 76.313,
        address: "Pipeline Road near Edappally North Metro Station",
        upvotes: 29,
        upvoted_by: ["demo_citizen"],
        is_duplicate: false,
        sla_deadline: new Date(Date.now() - 4 * 60 * 60 * 1e3).toISOString(),
        // Breached SLA!
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3).toISOString(),
        estimated_cost: 3e3,
        before_image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=400"
      },
      {
        id: "issue_4",
        title: "Major water pipeline burst",
        description: "Drinking water pipeline has broken. Thousands of gallons of clean water are leaking onto the main road, creating a waterlogging issue and reducing local tap water supply pressure.",
        category: "Water Leakage",
        severity: 9,
        status: "resolved",
        ward_id: "ward_1",
        reporter_id: "user_789",
        reporter_name: "Lakshmi Nair",
        assigned_to: "Water Authority & Sewerage",
        department: "Water Authority & Sewerage",
        latitude: 9.966,
        longitude: 76.243,
        address: "Peter Celli Street near Fort Kochi beach",
        upvotes: 54,
        upvoted_by: [],
        is_duplicate: false,
        sla_deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString(),
        resolved_at: new Date(Date.now() - 12 * 60 * 60 * 1e3).toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
        estimated_cost: 8500,
        before_image: "https://images.unsplash.com/photo-1542013936693-8848e5740a9a?auto=format&fit=crop&q=80&w=400",
        after_image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=400"
      }
    ],
    comments: [
      {
        id: "comment_1",
        issue_id: "issue_1",
        user_id: "user_111",
        user_name: "Sajid Ibrahim",
        user_role: "citizen",
        text: "I live right next to this junction, and three two-wheelers fell here last evening alone! This is extremely critical, please fix this immediately.",
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString()
      },
      {
        id: "comment_2",
        issue_id: "issue_3",
        user_id: "demo_authority",
        user_name: "Municipal Commissioner V.S. Kumar",
        user_role: "authority",
        text: "We have assigned our solid waste disposal trucks. Clean up is scheduled for today morning.",
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1e3).toISOString()
      }
    ],
    verifications: [
      { id: "ver_1", issue_id: "issue_1", user_id: "demo_citizen", type: "confirm", created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString() },
      { id: "ver_2", issue_id: "issue_2", user_id: "user_789", type: "confirm", created_at: new Date(Date.now() - 12 * 60 * 60 * 1e3).toISOString() }
    ],
    ward_score_history: [
      { id: "h_1", ward_id: "ward_3", score: 41, reason: "Multiple unresolved street and pothole reports", created_at: (/* @__PURE__ */ new Date()).toISOString() },
      { id: "h_2", ward_id: "ward_1", score: 92, reason: "Successful resolution of Fort Kochi pipeline leakage within SLA", created_at: (/* @__PURE__ */ new Date()).toISOString() }
    ],
    communities: [
      {
        id: "comm_1",
        name: "Fort Kochi Residents Club",
        description: "A community for people living, working, and loving Fort Kochi Beach area. Let's keep our heritage clean!",
        ward_id: "ward_1",
        members: ["demo_citizen"],
        created_by: "system",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "comm_2",
        name: "Edappally Clean-up Committee",
        description: "Focused on solving waste management, water logging, and broken lights around Lulu Mall and NH 66.",
        ward_id: "ward_2",
        members: [],
        created_by: "system",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "comm_3",
        name: "Mattancherry Heritage Protection Group",
        description: "Dedicated to local road safety, historic pathways, and general public utility issues around Palace Road.",
        ward_id: "ward_3",
        members: [],
        created_by: "system",
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]
  };
  import_fs.default.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), "utf-8");
  return initialData;
}
var dbData = initDB();
function saveDB() {
  import_fs.default.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), "utf-8");
}
function recalculateWardScores() {
  dbData.wards.forEach((ward) => {
    let baseScore = 100;
    const wardIssues = dbData.issues.filter((i) => i.ward_id === ward.id && !i.is_duplicate);
    wardIssues.forEach((issue) => {
      if (issue.status !== "resolved") {
        let deduction = 0;
        if (issue.category === "Pothole") deduction = 12;
        else if (issue.category === "Water Leakage") deduction = 10;
        else if (issue.category === "Broken Streetlight") deduction = 8;
        else if (issue.category === "Garbage Dumping") deduction = 6;
        else deduction = 5;
        if (issue.severity >= 8) deduction += 3;
        const isBreached = new Date(issue.sla_deadline).getTime() < Date.now();
        if (isBreached) {
          deduction += 5;
        }
        baseScore -= deduction;
      }
    });
    ward.health_score = Math.max(15, Math.min(100, baseScore));
  });
  saveDB();
}
var CITY_CONFIGS = {
  "kochi": {
    lat: 9.9658,
    lng: 76.2421,
    wards: ["Fort Kochi Ward", "Edappally North", "Mattancherry Ward", "Vyttila Ward"]
  },
  "trivandrum": {
    lat: 8.5241,
    lng: 76.9366,
    wards: ["Palayam Ward", "Thampanoor Ward", "Kovalam Coast Ward", "Vattiyoorkavu Ward"]
  },
  "kozhikode": {
    lat: 11.2588,
    lng: 75.7804,
    wards: ["Elathur Ward", "Beypore Ward", "Calicut Beach Ward", "Medical College Ward"]
  },
  "thrissur": {
    lat: 10.5276,
    lng: 76.2144,
    wards: ["Swaraj Round Ward", "Poonkunnam Ward", "Mannuthy Ward", "Ollur Ward"]
  },
  "kannur": {
    lat: 11.8745,
    lng: 75.3704,
    wards: ["Payyambalam Ward", "Thalassery Gate Ward", "Cantonment Ward", "Azhikode Ward"]
  },
  "kollam": {
    lat: 8.8932,
    lng: 76.6141,
    wards: ["Chinnakada Ward", "Thangassery Ward", "Eravipuram Ward", "Kadavoor Ward"]
  },
  "alappuzha": {
    lat: 9.4981,
    lng: 76.3388,
    wards: ["Kuttanad Backwaters", "Vembanad Ward", "Punnamada Ward", "Beach Road Ward"]
  },
  "kottayam": {
    lat: 9.5916,
    lng: 76.5222,
    wards: ["Kumarakom Ward", "Changanassery Ward", "Ettumanoor Road", "Central Town Ward"]
  },
  "palakkad": {
    lat: 10.7867,
    lng: 76.6548,
    wards: ["Palakkad Fort Ward", "Chittur Road Ward", "Malampuzha Ward", "Kalpathy Ward"]
  },
  "chennai": {
    lat: 13.0827,
    lng: 80.2707,
    wards: ["Adyar Ward", "T-Nagar Ward", "Mylapore Ward", "Velachery Ward"]
  },
  "coimbatore": {
    lat: 11.0168,
    lng: 76.9558,
    wards: ["RS Puram Ward", "Gandhipuram Ward", "Peelamedu Ward", "Singanallur Ward"]
  },
  "madurai": {
    lat: 9.9252,
    lng: 78.1198,
    wards: ["Anna Nagar Ward", "K.K. Nagar Ward", "Simmakkal Ward", "Sellur Ward"]
  },
  "trichy": {
    lat: 10.7905,
    lng: 78.7047,
    wards: ["Cantonment Ward", "Srirangam Ward", "Thillai Nagar Ward", "KK Nagar Ward"]
  },
  "salem": {
    lat: 11.6643,
    lng: 78.146,
    wards: ["Fairlands Ward", "Hasthampatti Ward", "Ammapet Ward", "Suramangalam Ward"]
  },
  "bengaluru": {
    lat: 12.9716,
    lng: 77.5946,
    wards: ["Indiranagar Ward", "Koramangala Ward", "Jayanagar Ward", "HSR Layout Ward"]
  },
  "mysuru": {
    lat: 12.2958,
    lng: 76.6394,
    wards: ["Gokulam Ward", "Devaraja Ward", "Vidyaranyapuram", "Vijayanagar Ward"]
  },
  "hubli-dharwad": {
    lat: 15.3647,
    lng: 75.124,
    wards: ["Vidyanagar Ward", "Keshwapur Ward", "Gokul Road Ward", "Dharavanagar Ward"]
  },
  "mangaluru": {
    lat: 12.9141,
    lng: 74.856,
    wards: ["Kadir Ward", "Bejai Ward", "Lalbagh Ward", "Ullal Coast Ward"]
  },
  "mumbai": {
    lat: 19.076,
    lng: 72.8777,
    wards: ["Andheri Ward", "Bandra Ward", "Colaba Coast Ward", "Dharavi Central"]
  },
  "pune": {
    lat: 18.5204,
    lng: 73.8567,
    wards: ["Kothrud Ward", "Kalyani Nagar", "Koregaon Park", "Shivajinagar Ward"]
  },
  "nagpur": {
    lat: 21.1458,
    lng: 79.0882,
    wards: ["Dharampeth Ward", "Sadashivnagar", "Sitabuldi Ward", "Hanuman Nagar"]
  },
  "thane": {
    lat: 19.2183,
    lng: 72.9781,
    wards: ["Ghodbunder Road", "Naupada Ward", "Vartak Nagar", "Majiwada Ward"]
  },
  "new delhi": {
    lat: 28.6139,
    lng: 77.209,
    wards: ["Chanakyapuri Ward", "Connaught Place", "Lodhi Colony Ward", "Khan Market Ward"]
  },
  "municipal corp of delhi": {
    lat: 28.6139,
    lng: 77.209,
    wards: ["Karol Bagh Ward", "Lajpat Nagar Ward", "Dwarka Sector 6", "Rohini Sector 3"]
  },
  "hyderabad": {
    lat: 17.385,
    lng: 78.4867,
    wards: ["Gachibowli Ward", "Jubilee Hills Ward", "Banjara Hills Ward", "Begumpet Ward"]
  },
  "kolkata": {
    lat: 22.5726,
    lng: 88.3639,
    wards: ["Salt Lake Sector V", "Park Street Ward", "Howrah Bridge Road", "Ballygunge Ward"]
  },
  "lucknow": {
    lat: 26.8467,
    lng: 80.9462,
    wards: ["Hazratganj Ward", "Gomti Nagar Ward", "Alambagh Road", "Indira Nagar Ward"]
  },
  "jaipur city": {
    lat: 26.9124,
    lng: 75.7873,
    wards: ["C-Scheme Ward", "Malviya Nagar", "Vaishali Nagar", "Johari Bazar Ward"]
  },
  "patna": {
    lat: 25.5941,
    lng: 85.1376,
    wards: ["Kankarbagh Ward", "Fraser Road Ward", "Patliputra Colony", "Rajendra Nagar"]
  },
  "guwahati": {
    lat: 26.1445,
    lng: 91.7362,
    wards: ["Dispur Ward", "Paltan Bazaar", "Ganeshguri Ward", "Uzan Bazaar Ward"]
  },
  "bhubaneswar": {
    lat: 20.2961,
    lng: 85.8245,
    wards: ["Saheed Nagar Ward", "Patia Tech Ward", "Khandagiri Ward", "Jayadev Vihar"]
  }
};
function getLocalBodyNamesForDistrict(district) {
  const dLower = district.trim().toLowerCase();
  const DISTRICT_LOCAL_BODIES = {
    ernakulam: ["Kochi", "Aluva", "Angamaly", "Eloor", "Kalamassery", "Kothamangalam", "Maradu", "Muvattupuzha", "North Paravur", "Perumbavoor", "Thrikkakara", "Thripunithura", "Piravom", "Koothattukulam", "Chellanam", "Kumbalam", "Kumbalangi", "Mulavukad"],
    thiruvananthapuram: ["Thiruvananthapuram", "Trivandrum", "Attingal", "Nedumangad", "Neyyattinkara", "Varkala", "Parassala", "Poovar", "Vithura"],
    kollam: ["Kollam", "Karunagappally", "Paravoor", "Punalur", "Kottarakkara", "Oachira", "Chavara"],
    pathanamthitta: ["Adoor", "Pathanamthitta", "Thiruvalla", "Pandalam", "Mallappally", "Ranni", "Konni"],
    alappuzha: ["Alappuzha", "Chengannur", "Cherthala", "Kayamkulam", "Mavelikkara", "Haripad", "Aroor", "Ambalappuzha"],
    kottayam: ["Changanassery", "Kottayam", "Palai", "Vaikom", "Ettumanoor", "Erattupetta", "Kumarakom", "Pampady"],
    idukki: ["Thodupuzha", "Kattappana", "Adimali", "Munnar", "Kumily", "Peermade"],
    thrissur: ["Thrissur", "Chalakudy", "Chavakkad", "Guruvayur", "Irinjalakuda", "Kodungallur", "Kunnamkulam", "Wadakkanchery", "Ollur"],
    palakkad: ["Chittur-Thathamangalam", "Ottappalam", "Palakkad", "Shornur", "Cherpulassery", "Mannarkkad", "Pattambi", "Alathur"],
    malappuram: ["Malappuram", "Manjeri", "Perinthalmanna", "Ponnani", "Tirur", "Kondotty", "Kottakkal", "Nilambur", "Tanur", "Tirurangadi"],
    kozhikode: ["Kozhikode", "Koyilandy", "Vadakara", "Koduvally", "Mukkam", "Ramanattukara", "Feroke", "Payyoli", "Balussery"],
    wayanad: ["Kalpetta", "Mananthavady", "Sulthan Bathery", "Vythiri", "Meppadi"],
    kannur: ["Kannur", "Mattannur", "Iritty", "Koothuparamba", "Payyannur", "Thalassery", "Taliparamba", "Anthoor", "Sreekandapuram", "Panoor"],
    kasaragod: ["Kanhangad", "Kasaragod", "Nileshwaram", "Manjeshwaram", "Kumbla"]
  };
  const list = DISTRICT_LOCAL_BODIES[dLower] || [district];
  return list;
}
function ensureCityData(cityRaw) {
  const city = cityRaw.toLowerCase().trim();
  const existingWards = dbData.wards.filter((w) => w.city.toLowerCase() === city);
  if (existingWards.length > 0) {
    return;
  }
  const config = CITY_CONFIGS[city] || {
    lat: 9.9658,
    lng: 76.2421,
    wards: [`${cityRaw} Ward 1`, `${cityRaw} Ward 2`, `${cityRaw} Ward 3`, `${cityRaw} Ward 4`]
  };
  if (!CITY_CONFIGS[city]) {
    let hash = 0;
    for (let i = 0; i < cityRaw.length; i++) {
      hash = cityRaw.charCodeAt(i) + ((hash << 5) - hash);
    }
    hash = Math.abs(hash);
    const offsetLat = (hash % 200 - 100) * 8e-4;
    const offsetLng = ((hash >> 7) % 200 - 100) * 8e-4;
    config.lat = 9.9658 + offsetLat;
    config.lng = 76.2421 + offsetLng;
  }
  const newWards = config.wards.map((wardName, idx) => {
    const wardId = `ward_${city}_${idx + 1}`;
    const offsetLat = (idx - 1.5) * 0.015;
    const offsetLng = (idx % 2 === 0 ? 1 : -1) * 0.015;
    return {
      id: wardId,
      name: wardName,
      city: cityRaw,
      state: "Kerala",
      health_score: idx === 0 ? 94 : idx === 1 ? 62 : idx === 2 ? 45 : 82,
      lat: config.lat + offsetLat,
      lng: config.lng + offsetLng
    };
  });
  dbData.wards.push(...newWards);
  const issueTemplates = [
    {
      title: "Dangerous pothole crater near main junction",
      description: "A wide, deep pothole has opened up near the main traffic signal. It is hazardous to two-wheelers and gets filled with rainwater, making it completely invisible at night.",
      category: "Pothole",
      severity: 8,
      status: "reported",
      offsetLat: 2e-3,
      offsetLng: -3e-3,
      address: "Main Junction Junction Road",
      assigned_to: "Roads & Traffic Division",
      department: "Roads & Traffic Division",
      estimated_cost: 8e3
    },
    {
      title: "Burst water supply pipe causing water wastage",
      description: "Drinking water main pipeline is leaking heavily. Clean drinking water is flooding the street, causing minor waterlogging and dropping tap pressure in nearby households.",
      category: "Water Leakage",
      severity: 7,
      status: "in_progress",
      offsetLat: -5e-3,
      offsetLng: 4e-3,
      address: "Behind Civil Station, Block B",
      assigned_to: "Water Authority & Sewerage",
      department: "Water Authority & Sewerage",
      estimated_cost: 4500
    },
    {
      title: "Broken and dark streetlights",
      description: "Three consecutive streetlights are out of order for more than two weeks, leaving the entire stretch pitch black. Very risky for pedestrians and safety at night.",
      category: "Broken Streetlight",
      severity: 6,
      status: "verified",
      offsetLat: 6e-3,
      offsetLng: 1e-3,
      address: "Near Govt School, Secondary Lane",
      assigned_to: "Electricity & Street Lighting Board",
      department: "Electricity & Street Lighting Board",
      estimated_cost: 1500
    },
    {
      title: "Illegal garbage pile dumping on pathway",
      description: "Large volumes of plastic waste and food waste dumped openly on the pedestrian pathway. Emitting foul odors and attracting stray animals and vectors.",
      category: "Garbage Dumping",
      severity: 6,
      status: "reported",
      offsetLat: -2e-3,
      offsetLng: -6e-3,
      address: "Market Road, beside Public Park",
      assigned_to: "Solid Waste Management",
      department: "Solid Waste Management",
      estimated_cost: 1200
    }
  ];
  newWards.forEach((ward, wardIdx) => {
    const count = 1 + wardIdx % 2;
    for (let i = 0; i < count; i++) {
      const template = issueTemplates[(wardIdx + i) % issueTemplates.length];
      const issueId = `issue_${city}_${ward.id}_${i + 1}`;
      const isResolved = (wardIdx + i) % 3 === 0;
      const issueObj = {
        id: issueId,
        title: `${template.title} - ${ward.name}`,
        description: template.description,
        category: template.category,
        severity: template.severity,
        status: isResolved ? "resolved" : template.status,
        ward_id: ward.id,
        reporter_id: "demo_citizen",
        reporter_name: "Aravind Nair",
        assigned_to: template.assigned_to,
        department: template.department,
        latitude: ward.lat + template.offsetLat + i * 1e-3,
        longitude: ward.lng + template.offsetLng - i * 1e-3,
        address: `${template.address}, ${ward.name}`,
        upvotes: 5 + wardIdx * 4 + i * 3,
        upvoted_by: [],
        is_duplicate: false,
        sla_deadline: new Date(Date.now() + (isResolved ? -2 : 3) * 24 * 60 * 60 * 1e3).toISOString(),
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString(),
        estimated_cost: template.estimated_cost,
        before_image: template.category === "Pothole" ? "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=400" : template.category === "Water Leakage" ? "https://images.unsplash.com/photo-1542013936693-8848e5740a9a?auto=format&fit=crop&q=80&w=400" : template.category === "Broken Streetlight" ? "https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&q=80&w=400" : "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=400"
      };
      if (isResolved) {
        issueObj.resolved_at = new Date(Date.now() - 1 * 24 * 60 * 60 * 1e3).toISOString();
        issueObj.after_image = "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=400";
      }
      dbData.issues.push(issueObj);
    }
    const commId = `comm_${city}_${ward.id}`;
    if (!dbData.communities) {
      dbData.communities = [];
    }
    dbData.communities.push({
      id: commId,
      name: `${ward.name} Civic Residents Club`,
      description: `Active discussion group for citizens of ${ward.name} to monitor street improvements, garbage collection, and water safety.`,
      ward_id: ward.id,
      members: ["demo_citizen"],
      created_by: "system",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  saveDB();
}
app.post("/api/auth/login", (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: "Identifier (Email/Username/Mobile) and password are required" });
  }
  const cleanIdentifier = identifier.trim().toLowerCase();
  const user = Object.values(dbData.users).find((u) => {
    const emailMatch = u.email && u.email.toLowerCase() === cleanIdentifier;
    const usernameMatch = u.username && u.username.toLowerCase() === cleanIdentifier;
    const phoneMatch = u.phone && u.phone.replace(/[^0-9]/g, "") === cleanIdentifier.replace(/[^0-9]/g, "");
    return emailMatch || usernameMatch || phoneMatch;
  });
  if (!user) {
    return res.status(401).json({ error: "No account found matching this identifier" });
  }
  const expectedPassword = user.password || "password123";
  if (password !== expectedPassword) {
    return res.status(401).json({ error: "Incorrect password" });
  }
  res.json(user);
});
app.post("/api/auth/signup", (req, res) => {
  const { name, username, email, phone, password, ward_id } = req.body;
  if (!name || !username || !email || !phone || !password || !ward_id) {
    return res.status(400).json({ error: "All fields are required (name, username, email, phone, password, ward)" });
  }
  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();
  const duplicate = Object.values(dbData.users).find(
    (u) => u.username && u.username.toLowerCase() === cleanUsername || u.email && u.email.toLowerCase() === cleanEmail || u.phone && u.phone === cleanPhone
  );
  if (duplicate) {
    if (duplicate.username && duplicate.username.toLowerCase() === cleanUsername) {
      return res.status(400).json({ error: "Username is already taken" });
    }
    if (duplicate.email && duplicate.email.toLowerCase() === cleanEmail) {
      return res.status(400).json({ error: "Email is already registered" });
    }
    if (duplicate.phone === cleanPhone) {
      return res.status(400).json({ error: "Mobile number is already registered" });
    }
  }
  const userId = `user_${Date.now()}`;
  const existingWard = dbData.wards.find((w) => w.id === ward_id);
  if (!existingWard) {
    const wardNum = req.body.ward_number || "1";
    const cityRaw = req.body.city || "Kochi";
    const stateRaw = req.body.state || "Kerala";
    dbData.wards.push({
      id: ward_id,
      name: `${cityRaw} Ward ${wardNum}`,
      city: cityRaw,
      state: stateRaw,
      health_score: 75,
      lat: 9.9658 + (Math.random() - 0.5) * 0.04,
      lng: 76.2421 + (Math.random() - 0.5) * 0.04
    });
  }
  const newUser = {
    id: userId,
    name: name.trim(),
    username: cleanUsername,
    email: cleanEmail,
    phone: cleanPhone,
    password,
    role: "citizen",
    ward_id,
    trust_score: 50,
    points: 50,
    badges: ["First Responder"],
    ward_number: req.body.ward_number || "",
    local_body: req.body.local_body || ""
  };
  dbData.users[userId] = newUser;
  saveDB();
  res.status(201).json(newUser);
});
app.post("/api/auth/create-authority", (req, res) => {
  const { name, username, email, phone, password, ward_id, adminId } = req.body;
  if (!adminId) {
    return res.status(403).json({ error: "Authority addition is restricted to existing admins only. Admin ID is missing." });
  }
  const creator = dbData.users[adminId];
  if (!creator || creator.role !== "authority") {
    return res.status(403).json({ error: "Forbidden. Only an existing authority/admin person can create new authority accounts." });
  }
  if (!name || !username || !email || !phone || !password || !ward_id) {
    return res.status(400).json({ error: "All fields are required (name, username, email, phone, password, ward)" });
  }
  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();
  const duplicate = Object.values(dbData.users).find(
    (u) => u.username && u.username.toLowerCase() === cleanUsername || u.email && u.email.toLowerCase() === cleanEmail || u.phone && u.phone === cleanPhone
  );
  if (duplicate) {
    if (duplicate.username && duplicate.username.toLowerCase() === cleanUsername) {
      return res.status(400).json({ error: "Username is already taken" });
    }
    if (duplicate.email && duplicate.email.toLowerCase() === cleanEmail) {
      return res.status(400).json({ error: "Email is already registered" });
    }
    if (duplicate.phone === cleanPhone) {
      return res.status(400).json({ error: "Mobile number is already registered" });
    }
  }
  const newOfficerId = `officer_${Date.now()}`;
  const newOfficer = {
    id: newOfficerId,
    name: name.trim(),
    username: cleanUsername,
    email: cleanEmail,
    phone: cleanPhone,
    password,
    role: "authority",
    ward_id,
    trust_score: 100,
    points: 0,
    badges: []
  };
  dbData.users[newOfficerId] = newOfficer;
  saveDB();
  res.status(201).json(newOfficer);
});
app.get("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { role, name, email, ward_id } = req.query;
  if (!dbData.users[id]) {
    dbData.users[id] = {
      id,
      email: email || `${id}@communityhero.org`,
      name: name || `Citizen ${id.substring(0, 5)}`,
      role: role || "citizen",
      ward_id: ward_id || "ward_1",
      trust_score: 50,
      points: 50,
      badges: ["First Responder"]
    };
    saveDB();
  }
  res.json(dbData.users[id]);
});
app.post("/api/users/:id", (req, res) => {
  const { id } = req.params;
  if (dbData.users[id]) {
    dbData.users[id] = { ...dbData.users[id], ...req.body };
    const ward_id = dbData.users[id].ward_id;
    if (ward_id && !dbData.wards.some((w) => w.id === ward_id)) {
      const wardNum = dbData.users[id].ward_number || "1";
      const localBody = dbData.users[id].local_body || "Local Panchayat";
      dbData.wards.push({
        id: ward_id,
        name: `${localBody} Ward ${wardNum}`,
        city: localBody,
        state: "Kerala",
        health_score: 75,
        lat: 9.9658 + (Math.random() - 0.5) * 0.04,
        lng: 76.2421 + (Math.random() - 0.5) * 0.04
      });
    }
    saveDB();
    res.json(dbData.users[id]);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});
app.get("/api/wards", (req, res) => {
  const { city, district } = req.query;
  if (city === "All" && district) {
    const districtName = district;
    const localBodies = getLocalBodyNamesForDistrict(districtName);
    localBodies.forEach((lbName) => {
      ensureCityData(lbName);
    });
    recalculateWardScores();
    const lbLower = localBodies.map((lb) => lb.toLowerCase());
    const filtered = dbData.wards.filter((w) => lbLower.includes(w.city.toLowerCase()));
    return res.json(filtered);
  }
  if (city) {
    const cityName = city;
    ensureCityData(cityName);
    recalculateWardScores();
    const filtered = dbData.wards.filter((w) => w.city.toLowerCase() === cityName.toLowerCase());
    return res.json(filtered);
  }
  recalculateWardScores();
  res.json(dbData.wards);
});
app.get("/api/departments", (req, res) => {
  res.json(dbData.departments);
});
app.get("/api/communities", (req, res) => {
  const { city, district } = req.query;
  if (city === "All" && district) {
    const districtName = district;
    const localBodies = getLocalBodyNamesForDistrict(districtName);
    localBodies.forEach((lbName) => {
      ensureCityData(lbName);
    });
    const lbLower = localBodies.map((lb) => lb.toLowerCase());
    const cityWards = dbData.wards.filter((w) => lbLower.includes(w.city.toLowerCase())).map((w) => w.id);
    const filtered = (dbData.communities || []).filter((c) => cityWards.includes(c.ward_id));
    return res.json(filtered);
  }
  if (city) {
    const cityName = city;
    ensureCityData(cityName);
    const cityWards = dbData.wards.filter((w) => w.city.toLowerCase() === cityName.toLowerCase()).map((w) => w.id);
    const filtered = (dbData.communities || []).filter((c) => cityWards.includes(c.ward_id));
    return res.json(filtered);
  }
  res.json(dbData.communities || []);
});
app.post("/api/communities", (req, res) => {
  const { name, description, ward_id, created_by } = req.body;
  if (!name || !created_by) {
    return res.status(400).json({ error: "Community name and creator ID are required" });
  }
  const newComm = {
    id: `comm_${Date.now()}`,
    name,
    description: description || "Public community for local citizen discussions and collaborative action.",
    ward_id: ward_id || "ward_1",
    members: [created_by],
    created_by,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (!dbData.communities) {
    dbData.communities = [];
  }
  dbData.communities.push(newComm);
  saveDB();
  res.status(201).json(newComm);
});
app.post("/api/communities/:id/join", (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required to join" });
  }
  const comm = (dbData.communities || []).find((c) => c.id === id);
  if (!comm) {
    return res.status(404).json({ error: "Community not found" });
  }
  if (!comm.members) {
    comm.members = [];
  }
  if (!comm.members.includes(userId)) {
    comm.members.push(userId);
    saveDB();
  }
  res.json(comm);
});
app.post("/api/communities/:id/leave", (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required to leave" });
  }
  const comm = (dbData.communities || []).find((c) => c.id === id);
  if (!comm) {
    return res.status(404).json({ error: "Community not found" });
  }
  if (comm.members) {
    comm.members = comm.members.filter((mId) => mId !== userId);
    saveDB();
  }
  res.json(comm);
});
app.get("/api/issues", (req, res) => {
  const { city, district } = req.query;
  recalculateWardScores();
  if (city === "All" && district) {
    const districtName = district;
    const localBodies = getLocalBodyNamesForDistrict(districtName);
    localBodies.forEach((lbName) => {
      ensureCityData(lbName);
    });
    const lbLower = localBodies.map((lb) => lb.toLowerCase());
    const cityWards = dbData.wards.filter((w) => lbLower.includes(w.city.toLowerCase())).map((w) => w.id);
    const filtered = dbData.issues.filter((i) => cityWards.includes(i.ward_id));
    const mapped2 = filtered.map((i) => ({
      ...i,
      comment_count: dbData.comments.filter((c) => c.issue_id === i.id).length
    }));
    return res.json(mapped2);
  }
  if (city) {
    const cityName = city;
    ensureCityData(cityName);
    const cityWards = dbData.wards.filter((w) => w.city.toLowerCase() === cityName.toLowerCase()).map((w) => w.id);
    const filtered = dbData.issues.filter((i) => cityWards.includes(i.ward_id));
    const mapped2 = filtered.map((i) => ({
      ...i,
      comment_count: dbData.comments.filter((c) => c.issue_id === i.id).length
    }));
    return res.json(mapped2);
  }
  const mapped = dbData.issues.map((i) => ({
    ...i,
    comment_count: dbData.comments.filter((c) => c.issue_id === i.id).length
  }));
  res.json(mapped);
});
app.post("/api/issues", (req, res) => {
  const {
    title,
    description,
    category,
    severity,
    ward_id,
    reporter_id,
    reporter_name,
    latitude,
    longitude,
    address,
    estimated_cost,
    before_image,
    department
  } = req.body;
  if (!reporter_id) {
    return res.status(400).json({ error: "reporter_id is required" });
  }
  const radius = 15e-4;
  const dup = dbData.issues.find(
    (i) => i.category === category && i.status !== "resolved" && Math.abs(i.latitude - latitude) < radius && Math.abs(i.longitude - longitude) < radius
  );
  const issueId = `issue_${Date.now()}`;
  let slaDays = 3;
  const dept = dbData.departments.find((d) => d.name === department || d.id === category);
  if (dept) slaDays = dept.sla_days;
  else if (category === "Pothole") slaDays = 7;
  else if (category === "Broken Streetlight") slaDays = 2;
  else if (category === "Garbage Dumping") slaDays = 1;
  const newIssue = {
    id: issueId,
    title: title || `${category} reported at ${address}`,
    description: description || "Reported community issue.",
    category: category || "Other",
    severity: Number(severity) || 5,
    status: "reported",
    ward_id: ward_id || "ward_1",
    reporter_id,
    reporter_name: reporter_name || "Anonymous Hero",
    latitude: Number(latitude) || 9.965,
    longitude: Number(longitude) || 76.242,
    address: address || "Kochi Ward",
    upvotes: 0,
    upvoted_by: [],
    is_duplicate: !!dup,
    parent_issue_id: dup ? dup.id : void 0,
    sla_deadline: new Date(Date.now() + slaDays * 24 * 60 * 60 * 1e3).toISOString(),
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    estimated_cost: estimated_cost || 0,
    before_image: before_image || "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&q=80&w=400",
    assigned_to: department || "Roads & Traffic Division"
  };
  dbData.issues.push(newIssue);
  if (dbData.users[reporter_id]) {
    dbData.users[reporter_id].points += 50;
    const userReports = dbData.issues.filter((i) => i.reporter_id === reporter_id);
    if (userReports.length === 1) {
      dbData.users[reporter_id].badges.push("First Responder");
    } else if (userReports.length === 5) {
      dbData.users[reporter_id].badges.push("Pothole Hunter");
    }
  }
  saveDB();
  recalculateWardScores();
  res.json({ issue: newIssue, duplicate_found: !!dup });
});
app.post("/api/issues/:id/upvote", (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const issue = dbData.issues.find((i) => i.id === id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });
  if (!issue.upvoted_by) issue.upvoted_by = [];
  if (!issue.downvoted_by) issue.downvoted_by = [];
  if (issue.upvotes === void 0) issue.upvotes = issue.upvoted_by.length;
  if (issue.downvotes === void 0) issue.downvotes = issue.downvoted_by.length;
  if (issue.downvoted_by.includes(userId)) {
    issue.downvoted_by = issue.downvoted_by.filter((uid) => uid !== userId);
    issue.downvotes = Math.max(0, issue.downvotes - 1);
  }
  if (issue.upvoted_by.includes(userId)) {
    issue.upvoted_by = issue.upvoted_by.filter((uid) => uid !== userId);
    issue.upvotes = Math.max(0, issue.upvotes - 1);
  } else {
    issue.upvoted_by.push(userId);
    issue.upvotes += 1;
    if (dbData.users[userId]) {
      dbData.users[userId].points += 10;
    }
    if (dbData.users[issue.reporter_id]) {
      dbData.users[issue.reporter_id].points += 5;
    }
  }
  saveDB();
  res.json(issue);
});
app.post("/api/issues/:id/downvote", (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const issue = dbData.issues.find((i) => i.id === id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });
  if (!issue.upvoted_by) issue.upvoted_by = [];
  if (!issue.downvoted_by) issue.downvoted_by = [];
  if (issue.upvotes === void 0) issue.upvotes = issue.upvoted_by.length;
  if (issue.downvotes === void 0) issue.downvotes = issue.downvoted_by.length;
  if (issue.upvoted_by.includes(userId)) {
    issue.upvoted_by = issue.upvoted_by.filter((uid) => uid !== userId);
    issue.upvotes = Math.max(0, issue.upvotes - 1);
  }
  if (issue.downvoted_by.includes(userId)) {
    issue.downvoted_by = issue.downvoted_by.filter((uid) => uid !== userId);
    issue.downvotes = Math.max(0, issue.downvotes - 1);
  } else {
    issue.downvoted_by.push(userId);
    issue.downvotes += 1;
  }
  saveDB();
  res.json(issue);
});
app.post("/api/issues/:id/verify", (req, res) => {
  const { id } = req.params;
  const { userId, type } = req.body;
  const issue = dbData.issues.find((i) => i.id === id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });
  const existingVerify = dbData.verifications.find((v) => v.issue_id === id && v.user_id === userId && v.type === type);
  if (existingVerify) {
    return res.status(400).json({ error: "Already submitted verification for this stage" });
  }
  const newVerify = {
    id: `ver_${Date.now()}`,
    issue_id: id,
    user_id: userId,
    type,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  dbData.verifications.push(newVerify);
  if (issue.status === "reported" && type === "confirm") {
    const confirmations = dbData.verifications.filter((v) => v.issue_id === id && v.type === "confirm").length;
    if (confirmations >= 2) {
      issue.status = "verified";
    }
  }
  if (dbData.users[userId]) {
    dbData.users[userId].points += 15;
    const verifyCount = dbData.verifications.filter((v) => v.user_id === userId).length;
    if (verifyCount === 5) {
      dbData.users[userId].badges.push("Speed Verifier");
    }
  }
  saveDB();
  res.json({ issue, verifications: dbData.verifications.filter((v) => v.issue_id === id) });
});
app.post("/api/issues/:id/comments", (req, res) => {
  const { id } = req.params;
  const { userId, userName, text, userRole } = req.body;
  const issue = dbData.issues.find((i) => i.id === id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });
  const newComment = {
    id: `comment_${Date.now()}`,
    issue_id: id,
    user_id: userId,
    user_name: userName || "Citizen Hero",
    user_role: userRole || "citizen",
    text,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    likes: []
  };
  dbData.comments.push(newComment);
  if (dbData.users[userId]) {
    dbData.users[userId].points += 5;
  }
  saveDB();
  res.json(newComment);
});
app.post("/api/comments/:commentId/like", (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;
  const comment = dbData.comments.find((c) => c.id === commentId);
  if (!comment) return res.status(404).json({ error: "Comment not found" });
  if (!comment.likes) {
    comment.likes = [];
  }
  const index = comment.likes.indexOf(userId);
  if (index > -1) {
    comment.likes.splice(index, 1);
  } else {
    comment.likes.push(userId);
  }
  saveDB();
  res.json(comment);
});
app.post("/api/comments/:commentId/replies", (req, res) => {
  const { commentId } = req.params;
  const { userId, userName, text, userRole } = req.body;
  const parentComment = dbData.comments.find((c) => c.id === commentId);
  if (!parentComment) return res.status(404).json({ error: "Parent comment not found" });
  const newReply = {
    id: `reply_${Date.now()}`,
    issue_id: parentComment.issue_id,
    parent_id: commentId,
    user_id: userId,
    user_name: userName || "Citizen Hero",
    user_role: userRole || "citizen",
    text,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    likes: []
  };
  dbData.comments.push(newReply);
  if (dbData.users[userId]) {
    dbData.users[userId].points += 5;
  }
  saveDB();
  res.json(newReply);
});
app.get("/api/issues/:id", (req, res) => {
  const { id } = req.params;
  const issue = dbData.issues.find((i) => i.id === id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });
  const comments = dbData.comments.filter((c) => c.issue_id === id);
  const verifications = dbData.verifications.filter((v) => v.issue_id === id);
  res.json({
    ...issue,
    comment_count: comments.length,
    comments,
    verifications
  });
});
app.post("/api/issues/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, assigned_to, after_image } = req.body;
  const issue = dbData.issues.find((i) => i.id === id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });
  issue.status = status;
  if (assigned_to) issue.assigned_to = assigned_to;
  if (after_image) {
    issue.after_image = after_image;
  }
  if (status === "resolved") {
    issue.resolved_at = (/* @__PURE__ */ new Date()).toISOString();
    if (dbData.users[issue.reporter_id]) {
      dbData.users[issue.reporter_id].points += 30;
    }
  }
  saveDB();
  recalculateWardScores();
  res.json(issue);
});
app.post("/api/ai/analyze-photo", async (req, res) => {
  const { base64Image, mimeType } = req.body;
  if (!base64Image) {
    return res.status(400).json({ error: "base64Image data is required" });
  }
  try {
    const promptString = `Analyze this community photo.
    You are an expert civic engineer and municipal inspector.
    First, determine if the image contains any real public civic infrastructure issues (such as potholes, water leakage/clogged drains, broken streetlights, garbage dumping heaps, damaged footpaths, or other public safety hazards).
    If it does NOT contain a relevant civic infrastructure issue (for instance, if it is just a picture of a pet, a person, a blank sky, random food, or a clean indoor room), you MUST set "civic_issue_found" to false.
    If it DOES contain a relevant civic infrastructure issue, set "civic_issue_found" to true.

    You MUST return ONLY a JSON object and nothing else. No markdown formatting blocks around JSON, no explanation text outside. The JSON must follow this exact format:
    {
      "civic_issue_found": true or false,
      "title": "A short, descriptive, professional title for the issue",
      "category": "One of: Pothole, Water Leakage, Broken Streetlight, Garbage Dumping, Damaged Footpath, or Other",
      "severity": A number from 1 to 10 indicating the danger and urgency of repair,
      "suggested_department": "One of: Roads & Traffic Division, Water Authority & Sewerage, Electricity & Street Lighting Board, Solid Waste Management",
      "description": "A very detailed description of the issue shown in the image, its potential impacts, and typical repair requirements.",
      "estimated_cost": A realistic estimated repair cost in Indian Rupees (INR) as a numeric value (e.g. 8000)
    }`;
    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: base64Image.split(",")[1] || base64Image
        // Strip out metadata header if present
      }
    };
    const textPart = {
      text: promptString
    };
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json"
      }
    });
    const aiText = response.text || "{}";
    const cleanedText = aiText.trim();
    const parsedData = JSON.parse(cleanedText);
    res.json(parsedData);
  } catch (error) {
    console.error("Gemini Vision AI Analysis failed:", error);
    res.json({
      civic_issue_found: true,
      title: "Pothole/Road damage on main avenue",
      category: "Pothole",
      severity: 7,
      suggested_department: "Roads & Traffic Division",
      description: "Severe road surface damage and pothole causing vehicle slowing and water stagnation. Repair requires gravel filling, leveling, and asphalt surfacing.",
      estimated_cost: 9500,
      error: error instanceof Error ? error.message : String(error)
    });
  }
});
app.post("/api/ai/analyze-text", async (req, res) => {
  const { descriptionText } = req.body;
  if (!descriptionText) {
    return res.status(400).json({ error: "descriptionText is required" });
  }
  try {
    const promptString = `You are an expert civic engineer and municipal inspector.
    Analyze this user's manual text description of a civic issue: "${descriptionText}"
    
    Translate and map this description into structured civic details.
    
    You MUST return ONLY a JSON object and nothing else. No markdown formatting blocks around JSON, no explanation text outside. The JSON must follow this exact format:
    {
      "title": "A short, descriptive, professional title for the issue",
      "category": "One of: Pothole, Water Leakage, Broken Streetlight, Garbage Dumping, Damaged Footpath, or Other",
      "severity": A number from 1 to 10 indicating the danger and urgency of repair,
      "suggested_department": "One of: Roads & Traffic Division, Water Authority & Sewerage, Electricity & Street Lighting Board, Solid Waste Management",
      "description": "A refined, professional description based on the user's input, detailing the technical repair needs and community impact.",
      "estimated_cost": A realistic estimated repair cost in Indian Rupees (INR) as a numeric value (e.g. 5000)
    }`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptString,
      config: {
        responseMimeType: "application/json"
      }
    });
    const aiText = response.text || "{}";
    const cleanedText = aiText.trim();
    const parsedData = JSON.parse(cleanedText);
    res.json(parsedData);
  } catch (error) {
    console.error("Gemini Text AI Analysis failed:", error);
    let category = "Other";
    let dept = "Solid Waste Management";
    if (/pothole|road|crater|pavement/i.test(descriptionText)) {
      category = "Pothole";
      dept = "Roads & Traffic Division";
    } else if (/water|leak|drain|sewer/i.test(descriptionText)) {
      category = "Water Leakage";
      dept = "Water Authority & Sewerage";
    } else if (/light|lamp|streetlight/i.test(descriptionText)) {
      category = "Broken Streetlight";
      dept = "Electricity & Street Lighting Board";
    } else if (/garbage|trash|waste|dump/i.test(descriptionText)) {
      category = "Garbage Dumping";
      dept = "Solid Waste Management";
    } else if (/path|footpath|walkway/i.test(descriptionText)) {
      category = "Damaged Footpath";
      dept = "Roads & Traffic Division";
    }
    res.json({
      title: descriptionText.substring(0, 40) + (descriptionText.length > 40 ? "..." : ""),
      category,
      severity: 5,
      suggested_department: dept,
      description: descriptionText,
      estimated_cost: 5e3
    });
  }
});
app.post("/api/ai/generate-letter", async (req, res) => {
  const { issueTitle, category, severity, address, created_at, ward_name, department, status, isSlaBreached } = req.body;
  try {
    const promptString = `Generate a highly formal and professional Official Complaint and Right to Information (RTI) Letter addressed to the Kochi Municipal Corporation regarding an unresolved community issue.
    
    Issue Details:
    - Title: ${issueTitle}
    - Category: ${category}
    - Severity: ${severity}/10
    - Address/Location: ${address}
    - Reported on: ${new_date_format(created_at)}
    - Ward: ${ward_name}
    - Department in Charge: ${department}
    - Status: ${status}
    - SLA Deadline Breached: ${isSlaBreached ? "Yes" : "No"}

    If the SLA is breached, include a standard RTI clause asking why this issue remains unaddressed beyond the mandated service level agreement period, requesting names of officers responsible, and daily penalty tracking rules under regional civic charters.

    The response should be styled in beautiful, professional clean Markdown suitable for direct presentation or PDF compilation. Avoid generic text; write it like a real, impactful legal-civic petition letter. No extra commentary, just the markdown.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptString
    });
    res.json({ letter: response.text });
  } catch (error) {
    console.error("Gemini Letter Gen failed:", error);
    res.json({
      letter: `## Kochi Municipal Corporation - Civic Petition
      
**Date:** ${(/* @__PURE__ */ new Date()).toLocaleDateString()}
**To:** The Executive Engineer / Ward Officer, ${department}, Kochi

**Subject:** Official Complaint regarding severe unresolved ${category} at ${address}.

Dear Sir/Madam,

I am writing on behalf of the residents of **${ward_name}** to bring to your immediate attention a critical civic grievance. A report was filed on **${new_date_format(created_at)}** regarding **${issueTitle}**.

Despite the extreme severity rating of **${severity}/10** and the clear threat to public safety, the issue is currently **${status}**.

We demand that the department expedite repairs immediately to prevent accidents and restore civic health in this area.

Yours faithfully,  
**Concerned Citizen & Ward Residents**  
*Community Hero Civic Network*`
    });
  }
});
function new_date_format(isoStr) {
  if (!isoStr) return (/* @__PURE__ */ new Date()).toLocaleDateString();
  return new Date(isoStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
