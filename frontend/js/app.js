// TravelNova Main Application Logic

// Force login check on load
if (!sessionStorage.getItem('travelnova_user') && !window.location.pathname.endsWith('login.html')) {
  window.location.href = 'login.html';
}

// Dynamic API URL Resolver
function getApiUrl(endpoint) {
  const hn = window.location.hostname;
  const proto = window.location.protocol;
  const isLocalHost = !hn || hn === 'localhost' || hn === '127.0.0.1' || proto === 'file:';
  if (isLocalHost) {
    return 'http://127.0.0.1:5000' + endpoint;
  }
  return endpoint;
}

// ========== APP STATE ==========
let hs = ['home'];
let as = 'home';
let cc = '₹';
let sf = ['Vegetarian', 'Local Traditional Food'];
let CI = null;
let lm = null;
let currentUser = null;
let currentBookingData = null;

const ALL_INTERESTS = [
  '🏛️ Culture & Heritage',
  '🌿 Nature & Wildlife',
  '⛰️ Adventure & Trekking',
  '🛍️ Shopping & Markets',
  '💆 Relaxation & Wellness',
  '🍷 Nightlife & Entertainment',
  '📷 Photography & Sightseeing',
  '🍲 Food & Culinary'
];

let sInt = ['🏛️ Culture & Heritage', '📷 Photography & Sightseeing'];

const FO = [
  'Vegetarian',
  'Non-Vegetarian',
  'Vegan',
  'Jain',
  'Gluten-Free',
  'Halal',
  'Seafood',
  'Local Traditional Food'
];

// ========== POPULAR BUTTONS ==========
const indBtns = [
  ['🌸', 'Jaipur'], ['🏖️', 'Goa'], ['🏔️', 'Manali'], ['🏰', 'Udaipur'],
  ['🕌', 'Agra'], ['🛕', 'Varanasi'], ['🌲', 'Shimla'], ['🪔', 'Amritsar'],
  ['🇮🇳', 'Delhi'], ['🌊', 'Mumbai'], ['🏙️', 'Ahmedabad'], ['🦁', 'Rajkot']
];

const intBtns = [
  ['🇫🇷', 'Paris'], ['🇯🇵', 'Tokyo'], ['🇬🇧', 'London'], ['🇦🇪', 'Dubai'],
  ['🇸🇬', 'Singapore'], ['🇮🇹', 'Rome'], ['🇹🇭', 'Bangkok'], ['🇮🇩', 'Bali'],
  ['🇺🇸', 'New York'], ['🇪🇬', 'Cairo'], ['🇦🇺', 'Sydney'], ['🇳🇱', 'Amsterdam']
];

// ========== COORDINATES CACHE ==========
const GC = {
  // India (1 per state/region)
  'jaipur':[26.91,75.79], 'goa':[15.3,74.12], 'manali':[32.24,77.19], 'delhi':[28.61,77.21],
  'mumbai':[19.08,72.88], 'ahmedabad':[23.02,72.57], 'varanasi':[25.32,82.97], 'amritsar':[31.63,74.87],
  'bangalore':[12.97,77.59], 'kolkata':[22.57,88.36], 'srinagar':[34.08,74.8], 'chennai':[13.08,80.27],
  
  // International (2 per country)
  'paris':[48.86,2.35], 'lyon':[45.76,4.84], // France
  'tokyo':[35.68,139.65], 'kyoto':[35.01,135.77], // Japan
  'london':[51.51,-0.13], 'manchester':[53.48,-2.24], // UK
  'new york':[40.71,-74.01], 'san francisco':[37.77,-122.42], // USA
  'dubai':[25.2,55.27], 'abu dhabi':[24.45,54.65] // UAE
};

// ==================== CITIES DATABASE ====================
const DB = {
  'jaipur':{p:['Hawa Mahal','Amber Fort & Sheesh Mahal','City Palace Jaipur','Jantar Mantar','Nahargarh Fort','Jal Mahal','Albert Hall Museum','Birla Mandir','Bapu Bazaar','Rambagh Palace Gardens'],h:['Rambagh Palace','Taj Jai Mahal Palace','ITC Rajputana','Oberoi Rajvilas','Clarks Amer'],f:['LMB Restaurant','Rawat Mishthan Bhandar','Suvarna Mahal','Tapri Central','Niros MI Road']},
  'goa':{p:['Baga Beach','Basilica of Bom Jesus','Fort Aguada','Dudhsagar Waterfalls','Calangute Beach','Anjuna Flea Market','Chapora Fort','Se Cathedral','Palolem Beach','Spice Plantation Tour'],h:['Taj Exotica','The Leela','W Goa','Alila Diwa','Park Hyatt Goa'],f:['Britto\'s Baga','Gunpowder Assagao','Martin\'s Corner','Fisherman\'s Wharf','Vinayak Restaurant']},
  'manali':{p:['Solang Valley','Rohtang Pass','Hadimba Temple','Old Manali Walk','Jogini Waterfall','Manu Temple','Vashisht Hot Springs','Mall Road','Naggar Castle','Atal Tunnel'],h:['The Himalayan','Manu Allaya Resort','Snow Valley Resorts','Hotel Beas','Solang Valley Resort'],f:['Johnson\'s Café','Cafe 1947','Lazy Dog Lounge','Chopsticks','Dylan\'s Toasted & Roasted']},
  'delhi':{p:['Red Fort','Qutub Minar','India Gate','Humayun\'s Tomb','Lotus Temple','Jama Masjid','Akshardham Temple','Chandni Chowk','Rashtrapati Bhavan','Connaught Place'],h:['Taj Mahal Hotel','The Imperial','ITC Maurya','Leela Palace','Oberoi Delhi'],f:['Karim\'s','Paranthe Wali Gali','Bukhara ITC','Indian Accent','Natraj Dahi Bhalle']},
  'mumbai':{p:['Gateway of India','Marine Drive','CST Station','Elephanta Caves','Sea Link','Juhu Beach','Siddhivinayak Temple','Haji Ali Dargah','Colaba Causeway','Dharavi Walk'],h:['Taj Mahal Palace','Oberoi Mumbai','ITC Maratha','Trident Nariman Point','JW Marriott Juhu'],f:['Leopold Café','Bademiya Colaba','Swati Snacks','Britannia & Co','Cafe Madras']},
  'paris':{p:['Eiffel Tower','Louvre Museum','Notre-Dame','Arc de Triomphe','Sacré-Cœur Montmartre','Musée d\'Orsay','Palace of Versailles','Seine River Cruise','Luxembourg Gardens','Pont Alexandre III'],h:['The Ritz Paris','Le Meurice','Four Seasons George V','Hôtel Plaza Athénée','Shangri-La Paris'],f:['L\'Ambroisie','Le Jules Verne','Bistrot Paul Bert','Bouillon Chartier','Angelina Paris']},
  'tokyo':{p:['Senso-ji Temple','Tokyo Skytree','Shibuya Crossing','Meiji Shrine','Imperial Palace','Akihabara Electric Town','TeamLab Planets','Tsukiji Outer Market','Ueno Park','Odaiba View'],h:['Aman Tokyo','Park Hyatt Tokyo','Mandarin Oriental','The Ritz-Carlton','Hoshinoya Tokyo'],f:['Sukiyabashi Jiro','Ichiran Ramen','Ginza Kojyu','Toriki Yakitori','Tsuta Ramen']},
  'london':{p:['Big Ben & Parliament','Tower of London','London Eye','British Museum','Tower Bridge','Buckingham Palace','Hyde Park','Westminster Abbey','Covent Garden','St Paul\'s Cathedral'],h:['The Ritz London','The Savoy','Claridge\'s','The Langham','Rosewood London'],f:['The Ledbury','Dishoom Covent Garden','Gordon Ramsay Royal Hospital Rd','Duck & Waffle','Padella']},
  'dubai':{p:['Burj Khalifa','Dubai Mall & Fountain','Palm Jumeirah & Atlantis','Miracle Garden','Global Village','Dubai Frame','Museum of the Future','Desert Safari','Gold Souk','La Mer Beach'],h:['Burj Al Arab','Atlantis The Palm','Jumeirah Al Qasr','Armani Hotel','Raffles Dubai'],f:['Zuma Dubai','Al Fanar Emirati','Pierchic','Nusr-Et Steakhouse','Aroos Damascus']}
};

let sv = JSON.parse(localStorage.getItem('sv2') || '[]');

// ========== AUTH INTERFACE logic ==========
function initAuthUI() {
  const user = JSON.parse(sessionStorage.getItem('travelnova_user'));
  currentUser = user;
  const authNavBtn = document.getElementById('authNavBtn');

  if (authNavBtn) {
    if (user && user.email) {
      const displayName = user.name || user.email.split('@')[0];
      authNavBtn.innerHTML = `👤 ${displayName}`;
      authNavBtn.onclick = () => {
        if (confirm(`Logged in as ${displayName} (${user.email}). Sign Out?`)) {
          signOutUser();
        }
      };
    } else {
      authNavBtn.innerHTML = `🔐 Sign In`;
      authNavBtn.onclick = () => openAuthModal();
    }
  }
}

function openAuthModal() {
  window.location.href = 'login.html';
}

function signOutUser() {
  sessionStorage.removeItem('travelnova_user');
  window.location.reload();
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();
  initDateLimits();
  renderFP();
  renderInterests();
  updateBudgetRanges();

  const indEl = document.getElementById('indCities');
  if (indEl) {
    indEl.innerHTML = indBtns.map(b => `<button onclick="pd('${b[1]}')" class="p-3 bg-white dark:bg-slate-800 rounded-xl border hover:border-blue-500 shadow-sm text-left">${b[0]} ${b[1]}</button>`).join('');
  }

  const intEl = document.getElementById('intCities');
  if (intEl) {
    intEl.innerHTML = intBtns.map(b => `<button onclick="pd('${b[1]}')" class="p-3 bg-white dark:bg-slate-800 rounded-xl border hover:border-blue-500 shadow-sm text-left">${b[0]} ${b[1]}</button>`).join('');
  }

  const chatForm = document.querySelector('#chatDr form');
  if (chatForm) {
    chatForm.onsubmit = (e) => {
      e.preventDefault();
      const input = document.getElementById('chatI');
      if (input && input.value.trim()) {
        askBot(input.value.trim());
      }
    };
  }
});

// Helper Functions
function fc(s) {
  if (!s) return '';
  return s.split(' ').map(w => w.length ? w[0].toUpperCase() + w.slice(1).toLowerCase() : '').join(' ');
}

function aci(e) {
  const v = e.value, c = e.selectionStart, f = fc(v);
  if (f !== v) {
    e.value = f;
    e.setSelectionRange(c, c);
  }
}

function handleAC(el, rid) {
  aci(el);
  const q = el.value.trim().toLowerCase();
  const ctr = document.getElementById(rid);
  if (!q) {
    if (ctr) { ctr.innerHTML = ''; ctr.classList.add('hidden'); }
    return;
  }
  const dbKeys = Object.keys(DB);
  const dbM = dbKeys.filter(k => k.startsWith(q) || k.includes(q)).map(k => ({ n: fc(k) }));
  if (!dbM.length) {
    if (ctr) {
      ctr.innerHTML = `<div class="p-3 text-sm text-slate-800 dark:text-slate-200 font-extrabold text-center bg-white dark:bg-slate-800">Press Search & Plan for "${fc(q)}"</div>`;
      ctr.classList.remove('hidden');
    }
    return;
  }
  if (ctr) {
    ctr.innerHTML = dbM.slice(0, 12).map(c => `<div onclick="selAC('${c.n}','${el.id}','${rid}')" class="p-3 bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700"><span class="font-black text-sm text-slate-900 dark:text-white">${c.n}</span></div>`).join('');
    ctr.classList.remove('hidden');
  }
}

function selAC(n, eid, rid) {
  const input = document.getElementById(eid);
  if (input) input.value = n;
  const ctr = document.getElementById(rid);
  if (ctr) ctr.classList.add('hidden');
  if (eid === 'qIn') startQS();
}

function closeDD() {
  ['fACR', 'qACR'].forEach(id => {
    const e = document.getElementById(id);
    if (e) e.classList.add('hidden');
  });
}

function renderFP() {
  const c = document.getElementById('foodCtr');
  if (!c) return;
  c.innerHTML = FO.map(f => {
    const s = sf.includes(f);
    return `<button type="button" onclick="tf('${f}')" class="px-3 py-1.5 rounded-full text-xs font-semibold border ${s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200'}">${s ? '✓ ' : ''}${f}</button>`;
  }).join('');
}

function tf(t) {
  if (sf.includes(t)) {
    if (sf.length > 1) sf = sf.filter(x => x !== t);
  } else {
    sf.push(t);
  }
  renderFP();
}

function renderInterests() {
  const c = document.getElementById('interestsCtr');
  if (!c) return;
  c.innerHTML = ALL_INTERESTS.map(i => {
    const s = sInt.includes(i);
    return `<button type="button" onclick="toggleInterest('${i}')" class="px-3 py-1.5 rounded-full text-xs font-semibold border ${s ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200'}">${s ? '✓ ' : ''}${i}</button>`;
  }).join('');
}

function toggleInterest(t) {
  if (sInt.includes(t)) {
    if (sInt.length > 1) sInt = sInt.filter(x => x !== t);
  } else {
    sInt.push(t);
  }
  renderInterests();
}

function showS(id, push = true) {
  if (push && as !== id) hs.push(as);
  document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
  const section = document.getElementById('view-' + id);
  if (section) section.classList.remove('hidden');
  as = id;
  const navBack = document.getElementById('navBack');
  if (navBack) navBack.classList.toggle('hidden', id === 'home');
  if (id === 'dashboard') renderDash();
}

function goBack() {
  if (hs.length > 0) {
    showS(hs.pop(), false);
  } else {
    showS('home', false);
  }
}

function pd(c) {
  const destInput = document.getElementById('fDest');
  if (destInput) destInput.value = fc(c);
  showS('planner');
}

async function startQS() {
  const qInput = document.getElementById('qIn');
  if (!qInput) return;
  const q = qInput.value.trim();
  if (!q) {
    showToast('Please enter a city name!', 'error');
    return;
  }
  
  const btn = document.querySelector('button[onclick="startQS()"]');
  const oldText = btn ? btn.innerText : 'Search & Plan';
  if (btn) { btn.innerText = 'Verifying...'; btn.disabled = true; }

  const isReal = await verifyRealWorldCity(q);
  
  if (btn) { btn.innerText = oldText; btn.disabled = false; }

  if (!isReal) {
    alert(`⚠️ Invalid Destination City!\n\n"${q}" does not exist in the real world. Please enter a valid real-world city name (e.g. Ahmedabad, Mumbai, Paris).`);
    showToast(`⚠️ "${q}" does not exist in the real world!`, 'error');
    return;
  }

  const destInput = document.getElementById('fDest');
  if (destInput) destInput.value = fc(q);
  showS('planner');
  
  // Auto-fetch data if real world city
  setTimeout(() => {
    const subBtn = document.getElementById('subBtn');
    if (subBtn) subBtn.click();
  }, 300);
}

const CURRENCY_MAP = {
  '₹': { symbol: '₹', code: 'INR', baseDayMin: 2000, baseDayMid: 4000, baseDayMax: 8000, baseDayLux: 15000 },
  '$': { symbol: '$', code: 'USD', baseDayMin: 30, baseDayMid: 60, baseDayMax: 120, baseDayLux: 250 },
  '€': { symbol: '€', code: 'EUR', baseDayMin: 25, baseDayMid: 55, baseDayMax: 110, baseDayLux: 220 },
  '£': { symbol: '£', code: 'GBP', baseDayMin: 20, baseDayMid: 45, baseDayMax: 90, baseDayLux: 180 },
  'AED': { symbol: 'AED', code: 'AED', baseDayMin: 100, baseDayMid: 200, baseDayMax: 400, baseDayLux: 800 }
};

function updateBudgetRanges() {
  const dbText = document.getElementById('fDB')?.innerText || '3 Days';
  const days = parseInt(dbText) || 3;
  const curr = document.getElementById('fCurr')?.value || '₹';
  cc = curr;
  
  const cData = CURRENCY_MAP[curr] || CURRENCY_MAP['₹'];
  const selRange = document.getElementById('fBudRange');
  const noticeEl = document.getElementById('budgetNotice');
  if (!selRange) return;

  const fmt = (num) => {
    if (curr === '₹') return '₹' + num.toLocaleString('en-IN');
    if (curr === 'AED') return num.toLocaleString() + ' AED';
    return curr + num.toLocaleString();
  };

  const minLow = cData.baseDayMin * days;
  const minMid = cData.baseDayMid * days;
  const minMax = cData.baseDayMax * days;
  const minLux = cData.baseDayLux * days;

  const options = [
    { label: `Economy (${fmt(minLow)} - ${fmt(minMid)})`, min: minLow, max: minMid, midVal: Math.round((minLow + minMid)/2), isLow: true },
    { label: `Standard (${fmt(minMid)} - ${fmt(minMax)})`, min: minMid, max: minMax, midVal: Math.round((minMid + minMax)/2), isLow: false },
    { label: `Premium (${fmt(minMax)} - ${fmt(minLux)})`, min: minMax, max: minLux, midVal: Math.round((minMax + minLux)/2), isLow: false },
    { label: `Luxury (${fmt(minLux)}+)`, min: minLux, max: minLux * 2, midVal: Math.round(minLux * 1.5), isLow: false }
  ];

  // Deactivate lowest tier for trips of 7 days or more
  const deactivateLow = days >= 7;

  selRange.innerHTML = options.map((opt, idx) => {
    const disabled = (deactivateLow && opt.isLow) ? 'disabled' : '';
    const labelText = (deactivateLow && opt.isLow) ? `${opt.label} 🚫 (Too low for ${days} days)` : opt.label;
    const selected = (idx === 1 || (!deactivateLow && idx === 0)) ? 'selected' : '';
    return `<option value="${opt.midVal}" data-label="${opt.label}" ${disabled} ${selected}>${labelText}</option>`;
  }).join('');

  onBudgetRangeChange();

  if (noticeEl) {
    if (days >= 7) {
      noticeEl.innerHTML = `💡 <strong>${days}-Day Trip Recommended Budget:</strong> For a ${days}-day itinerary, low budget options are deactivated. Minimum recommended budget range is <strong>${fmt(minMid)} - ${fmt(minMax)}</strong>.`;
      noticeEl.classList.remove('hidden');
    } else {
      noticeEl.classList.add('hidden');
    }
  }
}

function onBudgetRangeChange() {
  const selRange = document.getElementById('fBudRange');
  const hiddenBud = document.getElementById('fBud');
  if (selRange && hiddenBud) {
    hiddenBud.value = selRange.value;
  }
}

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function initDateLimits() {
  const fSD = document.getElementById('fSD');
  const fED = document.getElementById('fED');
  if (!fSD || !fED) return;

  const todayStr = getLocalDateString();
  fSD.min = todayStr;
  
  if (!fSD.value || fSD.value < todayStr) {
    fSD.value = todayStr;
  }

  onStartDateChange();
}

function onStartDateChange() {
  const fSD = document.getElementById('fSD');
  const fED = document.getElementById('fED');
  if (!fSD || !fED) return;

  const todayStr = getLocalDateString();
  if (fSD.value < todayStr) {
    fSD.value = todayStr;
    showToast('⚠️ Past dates are disabled. Selected today\'s date.', 'error');
  }

  const parts = fSD.value.split('-');
  const sDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  
  const maxEDate = new Date(sDate);
  maxEDate.setDate(maxEDate.getDate() + 19); // Max 20 days (Day 1 to Day 20)

  const minEndStr = fSD.value;
  const maxEndStr = getLocalDateString(maxEDate);

  fED.min = minEndStr;
  fED.max = maxEndStr;

  if (!fED.value || fED.value < minEndStr) {
    const defaultED = new Date(sDate);
    defaultED.setDate(defaultED.getDate() + 2); // 3 Days default
    fED.value = getLocalDateString(defaultED);
  } else if (fED.value > maxEndStr) {
    fED.value = maxEndStr;
    showToast('⚠️ Maximum trip duration allowed is 20 days.', 'error');
  }

  calcD();
}

function calcD() {
  const fSD = document.getElementById('fSD');
  const fED = document.getElementById('fED');
  if (!fSD || !fED || !fSD.value || !fED.value) return;

  const sParts = fSD.value.split('-');
  const eParts = fED.value.split('-');
  const s = new Date(parseInt(sParts[0]), parseInt(sParts[1]) - 1, parseInt(sParts[2]));
  const e = new Date(parseInt(eParts[0]), parseInt(eParts[1]) - 1, parseInt(eParts[2]));
  
  let d = Math.ceil((e - s) / 864e5) + 1;

  if (d > 20) {
    d = 20;
    const maxE = new Date(s);
    maxE.setDate(maxE.getDate() + 19);
    fED.value = getLocalDateString(maxE);
    showToast('⚠️ Maximum trip duration allowed is 20 days.', 'error');
  } else if (d < 1) {
    d = 1;
    fED.value = fSD.value;
  }

  const countDisplay = (d > 0 ? d : 1) + (d === 1 ? ' Day' : ' Days');
  const dbElem = document.getElementById('fDB');
  if (dbElem) dbElem.innerText = countDisplay;
  updateBudgetRanges();
}

function showToast(m, t = 'info') {
  const e = document.getElementById('toast');
  if (!e) return;
  e.innerText = m;
  e.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border ${t === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`;
  e.classList.remove('hidden');
  setTimeout(() => e.classList.add('hidden'), 4000);
}

function valD(d) {
  if (!d || typeof d !== 'string') return false;
  const c = d.trim().toLowerCase();
  if (c.length < 2 || /^\d/.test(c)) return false;
  if (!/^[a-zA-Z\s\-\.\',]+$/.test(c)) return false;
  return true;
}

// ===== DATA FETCHER (GOOGLE PLACES API VIA BACKEND) =====
async function fetchData(city, days = 3) {
  const cl = city.trim().toLowerCase();
  
  showToast(`✨ Discovering live travel recommendations for ${city}...`);
  
  try {
    const res = await fetch(getApiUrl('/api/places/city-data'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination: city, days: days })
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data && data.data.P && data.data.P.length >= 3) {
        return {
          coords: GC[cl] || null,
          P: data.data.P || [],
          H: data.data.H || [],
          F: data.data.F || [],
          src: data.source,
          valid: true
        };
      }
    }
  } catch (e) {
    console.error("Error fetching city data from backend:", e);
  }

  // Use DB data as fallback if backend API is unreachable
  const kb = DB[cl];
  if (kb) {
    return {
      coords: GC[cl] || null,
      P: [...kb.p],
      H: [...kb.h],
      F: [...kb.f],
      src: 'Verified Database',
      valid: true
    };
  }

  // Final absolute fallback if backend is unreachable
  return {
    coords: GC[cl] || null,
    P: [
      `${city} Viewpoint`, `${city} Museum`, `${city} Park`, `Historic ${city}`,
      `${city} Market`, `Central Square`, `${city} Palace`, `${city} Lake`,
      `${city} Gardens`, `Old Town ${city}`, `${city} Tower`, `${city} Bridge`,
      `Art Gallery ${city}`, `Sunset Point`
    ],
    H: [
      `Grand ${city} Hotel`, `${city} Resort`, `Central Inn`, `Royal ${city} Stay`,
      `The Boutique Hotel`, `City Center Lodge`, `${city} Heritage`, `Comfort Inn`
    ],
    F: [
      `${city} Authentic Dining`, `Bistro ${city}`, `Street Food ${city}`,
      `${city} Cafe`, `The Spice Restaurant`, `Local Thali House`, 
      `Terrace Dining`, `Royal Kitchen`
    ],
    src: 'City Template',
    valid: true
  };
}

async function verifyRealWorldCity(city) {
  if (!city || typeof city !== 'string') return false;
  const clean = city.trim().toLowerCase();
  if (clean.length < 2 || /^\d+$/.test(clean) || !/^[a-zA-Z\s\-\.\',]+$/.test(clean)) {
    return false;
  }

  // 1. Instant match in known local database & coordinate cache
  if (DB[clean] || GC[clean]) return true;

  // 2. Online Geocoding Check via Nominatim OpenStreetMap
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=3&q=${encodeURIComponent(clean)}`);
    const data = await res.json();
    if (data && data.length > 0) {
      for (const item of data) {
        const type = (item.type || '').toLowerCase();
        const classType = (item.class || '').toLowerCase();
        const addressType = (item.addresstype || '').toLowerCase();
        const displayName = (item.display_name || '').toLowerCase();

        const nameTokens = displayName.split(/[\s,-]+/).map(t => t.trim());
        const hasName = nameTokens.includes(clean) || displayName.startsWith(clean + ',') || displayName === clean;

        if (
          hasName && 
          (
            ['city', 'town', 'village', 'administrative', 'country', 'state', 'island', 'municipality', 'locality', 'suburb'].includes(type) ||
            ['city', 'town', 'village', 'administrative', 'country', 'state'].includes(addressType) ||
            ['place', 'boundary', 'tourism'].includes(classType)
          )
        ) {
          return true;
        }
      }
    }
  } catch (e) {}

  // 3. Check via OpenWeather Live City API
  try {
    const wRes = await fetch(getApiUrl(`/api/weather?city=${encodeURIComponent(clean)}`));
    if (wRes.ok) {
      const wData = await wRes.json();
      if (wData && wData.success && wData.data && wData.data.temp !== undefined) {
        return true;
      }
    }
  } catch (e) {}

  return false;
}

async function handleSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const destInput = document.getElementById('fDest');
  if (!destInput) return;
  const raw = destInput.value, city = fc(raw);
  const errEl = document.getElementById('errA'), errMsg = document.getElementById('errMsg');
  if (!valD(city)) {
    if (errMsg) errMsg.innerText = 'Please enter a valid city name.';
    if (errEl) errEl.classList.remove('hidden');
    alert(`⚠️ Invalid Destination City!\n\nPlease enter a valid destination city name (e.g. Ahmedabad, Mumbai, Paris, Tokyo, Goa).`);
    showToast('Enter valid city!', 'error');
    return;
  }
  
  const btn = document.getElementById('subBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = `🔍 Verifying "${city}"...`; }

  // Verify if city actually exists in the real world
  const isRealCity = await verifyRealWorldCity(city);
  if (!isRealCity) {
    if (errMsg) errMsg.innerText = `⚠️ "${city}" is not a valid real-world destination city. Please enter a real city name!`;
    if (errEl) errEl.classList.remove('hidden');
    alert(`⚠️ Invalid Destination City!\n\n"${city}" does not exist in the real world. Please enter a valid real-world city name (e.g. Ahmedabad, Mumbai, Paris, Tokyo, Goa).`);
    showToast(`⚠️ "${city}" does not exist in the real world!`, 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = '✨ Generate Travel Itinerary'; }
    return;
  }

  if (errEl) errEl.classList.add('hidden');
  if (btn) { btn.innerHTML = `⏳ Generating Plan for ${city}...`; }
  showToast(`Creating custom travel plan for ${city}...`);
  const days = parseInt(document.getElementById('fDB').innerText) || 3;
  const budget = parseInt(document.getElementById('fBud').value) || 10000;
  const tp = document.getElementById('fTP').value || 'Any';
  const hp = document.getElementById('fHP').value || 'Standard';
  const adults = parseInt(document.getElementById('fAdults').value) || 1;
  const children = parseInt(document.getElementById('fChildren').value) || 0;
  const seniors = parseInt(document.getElementById('fSeniors').value) || 0;
  const primaryDiet = sf.length ? sf[0] : 'Vegetarian';

  try {
    const api = await fetchData(city, days);
    if (!api.valid) {
      if (errMsg) errMsg.innerText = `"${city}" is not a valid city. Please enter a valid city name.`;
      if (errEl) errEl.classList.remove('hidden');
      showToast('City not found on map!', 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = '✨ Generate Travel Itinerary'; }
      return;
    }

    // Call Gemini 2.5 Flash AI Service Endpoint
    let aiPlanData = null;
    try {
      const aiResp = await fetch(getApiUrl('/api/ai/generate-plan'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: city,
          days: days,
          budget: budget,
          interests: sInt.join(', '),
          dietary_pref: sf.join(', '),
          adults: adults,
          children: children,
          seniors: seniors,
          hotel_pref: hp,
          transport_pref: tp
        })
      });
      const aiResult = await aiResp.json();
      if (aiResult && aiResult.success && aiResult.plan) {
        aiPlanData = aiResult.plan;
      }
    } catch(aiErr) {
      console.warn("AI plan API call failed, using default itinerary builder:", aiErr);
    }

    CI = buildIt(city, days, budget, tp, sf, sInt, api, aiPlanData);
    renderIt(CI);
    showS('itinerary');

    // Trigger preference-aware API requests in parallel
    loadWeatherAPI(city);
    loadFoodPlacesAPI(city, sf);
    loadInterestPlacesAPI(city, sInt);

    showToast(`✨ ${city} travel plan generated successfully!`);
  } catch (err) {
    showToast('Error generating plan', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '✨ Generate Travel Itinerary'; }
  }
}

async function loadWeatherAPI(city) {
  try {
    const res = await fetch(getApiUrl(`/api/weather?destination=${encodeURIComponent(city)}`));
    const d = await res.json();
    if (d && d.success) {
      document.getElementById('weatherCity').innerText = `${d.destination} Weather`;
      document.getElementById('weatherTemp').innerText = `${d.temperature_c}°C`;
      document.getElementById('weatherDesc').innerText = `${d.weather_condition} — ${d.description}`;
      document.getElementById('weatherDetails').innerHTML = `
        <div>🌡️ Feels: ${d.feels_like_c}°C</div>
        <div>💧 Humidity: ${d.humidity}%</div>
        <div>💨 Wind: ${d.wind_speed_kmh} km/h</div>
      `;
    }
  } catch(e) {}
}

async function loadDirectionsAPI(origin, destination, transportPref) {
  try {
    const res = await fetch(getApiUrl('/api/transport/directions'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination })
    });
    const d = await res.json();
    if (d && d.success && d.data) {
      const drive = d.data.driving_route || {};
      const walk = d.data.walking_route || {};
      const prefLabel = transportPref && transportPref !== 'Any' ? transportPref : 'Cab/Taxi';
      document.getElementById('transportDist').innerText = `${drive.distance || '18.5 km'} (${drive.duration || '35 mins'})`;
      document.getElementById('transportContent').innerHTML = `
        <div class="flex justify-between border-b border-white/10 pb-1"><span>🚘 Driving Route:</span> <span class="text-amber-300 font-bold">${drive.distance || '18.5 km'} • ${drive.duration || '35 mins'}</span></div>
        <div class="flex justify-between border-b border-white/10 pb-1"><span>🚶 Walking Route:</span> <span class="text-amber-300 font-bold">${walk.distance || '16 km'} • ${walk.duration || '3 hrs'}</span></div>
        <div class="flex justify-between border-b border-white/10 pb-1"><span>🚗 Your Preference:</span> <span class="text-emerald-300 font-bold">${prefLabel}</span></div>
        <div class="pt-1 text-[11px] text-slate-400">📍 Route from ${origin} to ${destination}</div>
      `;
    }
  } catch(e) {}
}

async function loadFoodPlacesAPI(city, dietaryPrefs) {
  // dietaryPrefs can be an array or string — use all selected preferences
  const prefList = Array.isArray(dietaryPrefs) ? dietaryPrefs : [dietaryPrefs];
  const primaryPref = prefList[0] || 'Vegetarian';
  try {
    const res = await fetch(getApiUrl('/api/food/places'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination: city, dietary_pref: primaryPref })
    });
    const d = await res.json();
    if (d && d.success && d.places) {
      const prefLabel = prefList.join(', ');
      document.getElementById('dietarySubhead').innerText = `Top-rated spots for ${prefLabel} food in ${city}`;
      document.getElementById('dietaryPlacesCtr').innerHTML = d.places.map(p => `
        <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-1.5 shadow-sm">
          <div class="flex justify-between items-start">
            <span class="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">🍽️ ${p.name}</span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px]">⭐ ${p.rating}</span>
          </div>
          <p class="text-[11px] text-slate-500 font-normal truncate">📍 ${p.address}</p>
          <div class="text-[10px] font-bold text-slate-400 pt-1 border-t flex justify-between">
            <span>Category: ${p.dietary_category}</span>
            <span>(${p.user_ratings_total} Reviews)</span>
          </div>
        </div>
      `).join('');
    }
  } catch(e) {}
}

async function loadInterestPlacesAPI(city, interestsList) {
  // Fetch places based on the user's Travel Interests via Google Places API
  if (!interestsList || !interestsList.length) return;
  const interestsStr = interestsList.join(', ');
  try {
    const res = await fetch(getApiUrl('/api/places/interests'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination: city, interests: interestsStr })
    });
    const d = await res.json();
    if (d && d.success && d.places && d.places.length) {
      // Update interest-based places section if it exists
      const ctr = document.getElementById('interestPlacesCtr');
      const subhead = document.getElementById('interestPlacesSubhead');
      if (subhead) subhead.innerText = `Google Places API: ${interestsStr} spots in ${city}`;
      if (ctr) {
        ctr.innerHTML = d.places.map(p => `
          <div class="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border space-y-1.5 shadow-sm">
            <div class="flex justify-between items-start">
              <span class="text-sm font-extrabold text-blue-600 dark:text-blue-400">📍 ${p.name}</span>
              <span class="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px]">⭐ ${p.rating}</span>
            </div>
            <p class="text-[11px] text-slate-500 font-normal truncate">📍 ${p.address}</p>
            <div class="text-[10px] font-bold text-slate-400 pt-1 border-t">
              <span>Category: ${p.interest_category}</span>
            </div>
          </div>
        `).join('');
      }
    }
  } catch(e) {}
}

function generateSpecificDescription(placeName, city) {
  const nameLower = (placeName || '').toLowerCase();
  
  if (nameLower.includes('dam') || nameLower.includes('reservoir')) {
    return `Major water dam near ${city} famous for scenic nature views, serene reservoir waters and photography.`;
  }
  if (nameLower.includes('temple') || nameLower.includes('mandir') || nameLower.includes('gompa') || nameLower.includes('monastery') || nameLower.includes('shrine') || nameLower.includes('masjid') || nameLower.includes('trimandir')) {
    return `Revered spiritual site in ${city} known for traditional architectural grandeur, peaceful ambiance and cultural heritage.`;
  }
  if (nameLower.includes('fort') || nameLower.includes('castle') || nameLower.includes('palace') || nameLower.includes('tomb') || nameLower.includes('heritage') || nameLower.includes('monument')) {
    return `Historic landmark featuring royal heritage architecture, ancient artifacts and panoramic views of ${city}.`;
  }
  if (nameLower.includes('lake') || nameLower.includes('owaro') || nameLower.includes('waterfront') || nameLower.includes('river') || nameLower.includes('beach') || nameLower.includes('ghat')) {
    return `Picturesque waterfront spot in ${city} ideal for morning walks, peaceful lake views and relaxing atmosphere.`;
  }
  if (nameLower.includes('park') || nameLower.includes('garden') || nameLower.includes('zoo') || nameLower.includes('sanctuary') || nameLower.includes('valley') || nameLower.includes('reserve')) {
    return `Lush green nature park in ${city} featuring rich flora, scenic walking trails and family recreation.`;
  }
  if (nameLower.includes('stupa') || nameLower.includes('viewpoint') || nameLower.includes('point') || nameLower.includes('hill') || nameLower.includes('peak')) {
    return `Elevated vantage point offering breathtaking 360-degree panoramic views of ${city} and surrounding countryside.`;
  }
  if (nameLower.includes('market') || nameLower.includes('bazaar') || nameLower.includes('complex') || nameLower.includes('mall') || nameLower.includes('center')) {
    return `Vibrant commercial hub in ${city} famous for authentic local handicrafts, traditional textiles and lively shopping.`;
  }
  if (nameLower.includes('museum') || nameLower.includes('gallery') || nameLower.includes('hall of fame')) {
    return `Cultural museum in ${city} showcasing historical artifacts, regional artwork and educational exhibits.`;
  }

  return `Prominent attraction in ${city} popular for sightseeing, local culture and unique photo opportunities.`;
}

function getUniquePlaceForDay(P, index, city) {
  if (P && P.length > index) {
    return P[index];
  }
  const placeTypes = [
    { type: 'Viewpoint & Hillside Park', nameSuffix: 'Panoramic Overlook' },
    { type: 'Heritage Shrine & Temple', nameSuffix: 'Spiritual Complex' },
    { type: 'Botanical Reserve & Gardens', nameSuffix: 'Nature Trails' },
    { type: 'Waterfront Promenade & Lake', nameSuffix: 'Lakeside' },
    { type: 'Historic Palace & Museum', nameSuffix: 'Heritage Hall' },
    { type: 'Eco Tourism Reserve', nameSuffix: 'Valley Spot' },
    { type: 'Sunset Point & Observation Deck', nameSuffix: 'Sunset Ridge' },
    { type: 'Central Heritage Square', nameSuffix: 'Clock Tower Plaza' },
    { type: 'Architectural Monument', nameSuffix: 'Memorial' },
    { type: 'Riverside Walkway', nameSuffix: 'River View' }
  ];
  const offset = P ? (index - P.length) : index;
  const t = placeTypes[offset % placeTypes.length];
  const zoneNum = Math.floor(offset / placeTypes.length) + 1;
  const suffix = zoneNum > 1 ? ` (Zone ${zoneNum})` : '';

  return {
    name: `${city} ${t.nameSuffix}${suffix}`,
    address: `${city} Central Area, ${city}`,
    rating: (4.5 + (offset % 4) * 0.1).toFixed(1)
  };
}

function extractPlaceInfo(item, city, categoryLabel) {
  let name = '', address = '';
  if (typeof item === 'object' && item !== null) {
    name = item.name || `${city} Attraction`;
    address = item.address || '';
  } else {
    name = String(item || `${city} Attraction`);
  }

  let area = `${city} Zone`;
  if (address) {
    const parts = address.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      area = parts.slice(-3, -1).join(', ');
    } else if (parts.length === 1) {
      area = parts[0];
    }
  }

  const desc = generateSpecificDescription(name, city);
  return { name, area, desc };
}

function buildIt(city, days, budget, transport, foodTypes, interestsList, api, aiPlanData) {
  const c = cc, dw = [], tp = [];
  const selInterests = interestsList && interestsList.length ? interestsList.join(', ') : 'Culture & Sightseeing';

  const transportLabel = (transport && transport !== 'Any') ? transport : 'Taxi/Cab';
  const foodLabel = foodTypes && foodTypes.length ? foodTypes.join(' & ') : 'Local Cuisine';

  // Flexible Range Calculation (±15%)
  const hotelTotal = Math.round(budget * 0.35);
  const hotelPerNight = Math.round(hotelTotal / Math.max(1, days - 1 || 1));
  const foodTotal = Math.round(budget * 0.30);
  const foodPerDay = Math.round(foodTotal / days);
  const transportTotal = Math.round(budget * 0.15);
  const transportPerDay = Math.round(transportTotal / days);
  const ticketsTotal = Math.round(budget * 0.12);
  const ticketsPerDay = Math.round(ticketsTotal / days);
  const miscTotal = budget - (hotelTotal + foodTotal + transportTotal + ticketsTotal);

  const budgetMin = Math.round(budget * 0.85);
  const budgetMax = Math.round(budget * 1.15);

  const expBreakdown = [
    { cat: '🏨 Hotel & Accommodation', amt: `${c}${Math.round(hotelTotal*0.85)} - ${c}${Math.round(hotelTotal*1.15)}`, perDay: `${c}${Math.round(hotelPerNight*0.85)} - ${c}${Math.round(hotelPerNight*1.15)}/night`, pct: 35, color: 'bg-blue-500', desc: `Total ${Math.max(1, days - 1)} Night Stay` },
    { cat: '🍽️ Food & Dining', amt: `${c}${Math.round(foodTotal*0.85)} - ${c}${Math.round(foodTotal*1.15)}`, perDay: `${c}${Math.round(foodPerDay*0.85)} - ${c}${Math.round(foodPerDay*1.15)}/day`, pct: 30, color: 'bg-emerald-500', desc: foodLabel },
    { cat: '🚗 Transport & Travel', amt: `${c}${Math.round(transportTotal*0.85)} - ${c}${Math.round(transportTotal*1.15)}`, perDay: `${c}${Math.round(transportPerDay*0.85)} - ${c}${Math.round(transportPerDay*1.15)}/day`, pct: 15, color: 'bg-amber-500', desc: `${transportLabel} & Local Cabs` },
    { cat: '🎟️ Sightseeing & Tickets', amt: `${c}${Math.round(ticketsTotal*0.85)} - ${c}${Math.round(ticketsTotal*1.15)}`, perDay: `${c}${Math.round(ticketsPerDay*0.85)} - ${c}${Math.round(ticketsPerDay*1.15)}/day`, pct: 12, color: 'bg-purple-500', desc: 'Monument Fees & Guide' },
    { cat: '🛍️ Shopping & Emergency', amt: `${c}${Math.round(miscTotal*0.85)} - ${c}${Math.round(miscTotal*1.15)}`, perDay: `${c}${Math.round(miscTotal*0.85/days)} - ${c}${Math.round(miscTotal*1.15/days)}/day`, pct: 8, color: 'bg-rose-500', desc: 'Souvenirs & Buffer' }
  ];

  const aiDays = (aiPlanData && aiPlanData.day_wise_itinerary) ? aiPlanData.day_wise_itinerary : [];
  const aiFoods = (aiPlanData && aiPlanData.food_recommendations) ? aiPlanData.food_recommendations : [];

  const P = api.P || [];
  const H = api.H || [];
  const F = api.F || [];

  for (let d = 1; d <= days; d++) {
    const aiDay = aiDays[d - 1] || null;

    const p1Raw = getUniquePlaceForDay(P, (d - 1) * 2, city);
    const p2Raw = getUniquePlaceForDay(P, (d - 1) * 2 + 1, city);
    
    const moInfo = extractPlaceInfo(p1Raw, city, 'Morning Sightseeing');
    const afInfo = extractPlaceInfo(p2Raw, city, 'Afternoon Sightseeing');

    const morningPlace = moInfo.name;
    const afterPlace = afInfo.name;

    const eveningAct = (aiDay && aiDay.evening && !aiDay.evening.includes("Sunset viewing")) ? aiDay.evening : `Sunset & Local Market Exploration in ${city}`;
    const dayTitle = `Day ${d}: Exploring ${city} (${morningPlace.split(' ')[0]} & ${afterPlace.split(' ')[0]})`;

    const stayRaw = H.length ? H[(d - 1) % H.length] : `${city} ${['Heritage Hotel', 'Grand Resort', 'City Inn', 'Palace Hotel'][(d-1) % 4]}`;
    const stay = (typeof stayRaw === 'object' && stayRaw !== null) ? (stayRaw.name || stayRaw) : String(stayRaw);

    const breakfastOptions = {
      'Vegan': ['Vegan Café', 'Green Bowl Café', 'Plant-Based Kitchen', 'Organic Sunrise Café'],
      'Jain': ['Jain Sattvik Breakfast', 'Pure Jain Café', 'Satvik Morning Thali'],
      'Gluten-Free': ['Gluten-Free Bakery', 'Healthy Start Café', 'GF Morning Bistro'],
      'Vegetarian': ['Vegetarian Breakfast Corner', 'Satvik Café', 'Shudh Veg Breakfast'],
      'Halal': ['Halal Breakfast Hub', 'Morning Halal Kitchen'],
    };
    const primaryFoodType = foodTypes && foodTypes.length ? foodTypes[0] : 'Vegetarian';
    const bkList = breakfastOptions[primaryFoodType] || [`${city} Heritage Bakery`, 'Old Town Café', 'Artisan Coffee', 'Tea Lounge'];
    const bk = bkList[(d - 1) % bkList.length];

    let lunchRaw = F.length ? F[((d - 1) * 2) % F.length] : `${city} ${primaryFoodType} Dining`;
    let dinnerRaw = F.length ? F[((d - 1) * 2 + 1) % F.length] : `${city} Restaurant`;
    
    const lunch = (typeof lunchRaw === 'object' && lunchRaw !== null) ? (lunchRaw.name || lunchRaw) : String(lunchRaw);
    const dinner = (typeof dinnerRaw === 'object' && dinnerRaw !== null) ? (dinnerRaw.name || dinnerRaw) : String(dinnerRaw);

    dw.push({
      day: d,
      title: dayTitle,
      hotel: stay,
      bk: bk,
      mo: { place: morningPlace, area: moInfo.area, desc: moInfo.desc, time: "08:30 AM - 11:30 AM", tr: transportLabel, cost: `${c}${Math.round(transportPerDay * 0.5)}`, dur: "3 Hrs" },
      lu: { rest: lunch, time: "01:00 PM - 02:30 PM", cost: `${c}${Math.round(foodPerDay * 0.45)}`, ft: foodLabel },
      af: { place: afterPlace, area: afInfo.area, desc: afInfo.desc, time: "03:00 PM - 06:00 PM", tr: transportLabel === 'Flight' ? 'Local Taxi' : transportLabel, cost: `${c}${Math.round(transportPerDay * 0.5)}`, dur: "3 Hrs" },
      ev: { act: eveningAct, time: "06:30 PM - 08:00 PM" },
      di: { rest: dinner, time: "08:30 PM - 10:30 PM", cost: `${c}${Math.round(foodPerDay * 0.55)}`, ft: foodTypes[d % Math.max(foodTypes.length,1)] || primaryFoodType }
    });
    if (d <= 4) tp.push({ name: morningPlace.substring(0, 50), time: "08:30 AM - 05:30 PM", fee: `${c}${Math.round(ticketsPerDay * 0.6)}`, spot: `${morningPlace.substring(0,30)} Viewpoint`, dur: "3 Hrs" });
  }

  const defaultPacking = [
    "Comfortable walking shoes & socks",
    "Weather-appropriate clothing & jacket",
    "Universal travel adapter & power bank",
    "Personal ID, government documents & trip vouchers",
    "First aid kit & essential medications",
    "Sunscreen, sunglasses & reusable water bottle"
  ];

  const defaultTips = [
    `Respect local customs and dress appropriately when visiting heritage sites in ${city}.`,
    `For ${foodLabel} food lovers: always check restaurant certification before ordering.`,
    "Keep emergency contact numbers and digital copies of your passport/ID handy.",
    `Use ${transportLabel} for intercity travel and local cabs for city sightseeing.`,
    "Verify ticket timings in advance to avoid long queue lines at popular spots."
  ];

  const packingList = (aiPlanData && aiPlanData.packing_list) ? aiPlanData.packing_list : defaultPacking;
  const travelTips = (aiPlanData && aiPlanData.travel_tips) ? aiPlanData.travel_tips : defaultTips;

  return {
    dest: city, dur: days + " Days", budget, budgetRange: `${c}${budgetMin} - ${c}${budgetMax}`, interests: selInterests, expBreakdown, dw, tp, packingList, travelTips,
    sh: H.slice(0, Math.min(4, H.length)).map((h, i) => ({ name: (typeof h === 'object' ? h.name : h), price: `${c}${hotelPerNight}/night`, rating: (4.9 - i * 0.1).toFixed(1) + " ⭐" })),
    fh: (aiFoods.length ? aiFoods : F).slice(0, Math.min(4, (aiFoods.length || F.length))).map((f, i) => ({
      name: typeof f === 'object' ? (f.dish_name || f.name || f) : f,
      type: typeof f === 'object' ? (f.category || foodLabel) : (foodTypes[i % Math.max(foodTypes.length,1)] || 'Local'),
      cost: `${c}${Math.round(foodPerDay * 0.5)} for two`, hrs: "11 AM-11 PM"
    })),
    src: 'Smart Travel System Engine',
    apiData: api
  };
}

function renderIt(d) {
  document.getElementById('iT').innerText = d.dest + " Travel Plan";
  document.getElementById('iS').innerText = `Guide for ${d.dest}`;
  document.getElementById('iD').innerText = d.dur;
  document.getElementById('mB').innerText = d.dest;
  const intHtml = d.interests ? d.interests.split(', ').map(i => `<span class="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700 text-[11px] font-extrabold">${i}</span>`).join('') : '<span class="text-slate-400">Sightseeing</span>';
  const intElem = document.getElementById('iIntCtr');
  if (intElem) intElem.innerHTML = `<span class="text-slate-500 font-bold">🎯 Focus & Interests:</span> ${intHtml}`;
  document.getElementById('srcI').innerHTML = `<span class="text-sm font-black">✨ Smart Travel Plan & Live Insights</span><br><span class="text-blue-100">Personalized day-by-day itinerary, live weather forecast & curated local recommendations.</span>`;
  
  // Render Packing List & Travel Tips
  const packElem = document.getElementById('packingListCtr');
  if (packElem && d.packingList) {
    packElem.innerHTML = d.packingList.map(item => `<li class="flex items-center gap-2"><span class="text-purple-500">✔</span> <span>${item}</span></li>`).join('');
  }

  const tipsElem = document.getElementById('travelTipsCtr');
  if (tipsElem && d.travelTips) {
    tipsElem.innerHTML = d.travelTips.map(item => `<li class="flex items-center gap-2"><span class="text-blue-500">💡</span> <span>${item}</span></li>`).join('');
  }
  document.getElementById('dC').innerHTML = d.dw.map(dp => `<div class="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border space-y-4 shadow-sm"><div class="flex justify-between items-center border-b pb-2 dark:border-slate-700"><span class="text-sm font-black text-blue-600">${dp.title}</span><span class="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">🏨 ${dp.hotel}</span></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"><div class="bg-white dark:bg-slate-900 p-3.5 rounded-xl border space-y-1.5 shadow-sm"><div class="flex justify-between font-bold text-amber-600"><span>🌅 Morning Spot</span><span>${dp.mo.time}</span></div><p class="font-black text-sm text-slate-900 dark:text-white">📍 ${dp.mo.place}</p>${dp.mo.area ? `<div class="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">🏙️ Area: ${dp.mo.area}</div>` : ''}${dp.mo.desc ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed">ℹ️ ${dp.mo.desc}</p>` : ''}<p class="text-amber-700 font-semibold text-xs pt-1 border-t dark:border-slate-800">🥐 ${dp.bk}</p><div class="text-[11px] text-blue-600 font-bold pt-1 border-t dark:border-slate-800">🚗 ${dp.mo.tr} (${dp.mo.cost}) • ${dp.mo.dur}</div></div><div class="bg-white dark:bg-slate-900 p-3.5 rounded-xl border space-y-1.5 shadow-sm"><div class="flex justify-between font-bold text-emerald-600"><span>🍲 Lunch</span><span>${dp.lu.time}</span></div><p class="font-extrabold text-sm">🍽️ ${dp.lu.rest}</p><p class="text-slate-500">${dp.lu.ft}</p><div class="text-[11px] text-emerald-600 font-bold pt-1 border-t dark:border-slate-800">Cost: ${dp.lu.cost}</div></div><div class="bg-white dark:bg-slate-900 p-3.5 rounded-xl border space-y-1.5 shadow-sm"><div class="flex justify-between font-bold text-blue-600"><span>📸 Afternoon Spot</span><span>${dp.af.time}</span></div><p class="font-black text-sm text-slate-900 dark:text-white">📍 ${dp.af.place}</p>${dp.af.area ? `<div class="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">🏙️ Area: ${dp.af.area}</div>` : ''}${dp.af.desc ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed">ℹ️ ${dp.af.desc}</p>` : ''}<div class="text-[11px] text-blue-600 font-bold pt-1 border-t dark:border-slate-800">🚌 ${dp.af.tr} (${dp.af.cost}) • ${dp.af.dur}</div></div><div class="bg-white dark:bg-slate-900 p-3.5 rounded-xl border space-y-1.5 shadow-sm"><div class="flex justify-between font-bold text-rose-600"><span>🌙 Dinner</span><span>${dp.di.time}</span></div><p class="font-extrabold text-sm">🍷 ${dp.di.rest}</p><p class="text-slate-500">${dp.di.ft}</p><div class="text-[11px] text-rose-600 font-bold pt-1 border-t dark:border-slate-800">Cost: ${dp.di.cost}</div></div></div></div>`).join('');
  document.getElementById('pC').innerHTML = d.tp.map(t => `<div class="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border space-y-2 text-xs"><h4 class="font-bold text-sm text-blue-600">📍 ${t.name}</h4><p class="text-slate-500">${t.time}</p><p class="text-emerald-600 font-bold">Fee: ${t.fee} • ${t.dur}</p><p class="text-amber-600">📷 ${t.spot}</p></div>`).join('');
  document.getElementById('hC').innerHTML = d.sh.map(h => `<div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex justify-between text-xs font-bold"><div><span>🏨 ${h.name}</span><p class="text-slate-400 font-normal">${h.rating}</p></div><span class="text-blue-600">${h.price}</span></div>`).join('');
  document.getElementById('fC2').innerHTML = d.fh.map(f => `<div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border flex justify-between text-xs font-bold"><div><span>🍽️ ${f.name}</span><p class="text-slate-400 font-normal">${f.type}</p></div><span class="text-rose-600">${f.cost}</span></div>`).join('');

  const eb = d.expBreakdown;
  document.getElementById('totExpBadge').innerHTML = `Estimated Trip Budget Range: <span class="text-emerald-600 dark:text-emerald-400 text-sm font-black ml-1 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">${d.budgetRange || (cc + d.budget)}</span>`;
  const ebHtml = `
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
  ${eb.map(item => `
  <div class="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border space-y-1">
    <span class="text-[11px] font-extrabold text-slate-500 block truncate">${item.cat}</span>
    <p class="text-sm font-black text-slate-800 dark:text-slate-100">${item.amt}</p>
    <div class="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t">
      <span>Rate: ${item.perDay}</span>
      <span class="font-bold text-emerald-600">${item.pct}%</span>
    </div>
  </div>
  `).join('')}
  </div>

  <div class="space-y-1.5">
    <div class="flex justify-between text-xs font-extrabold text-slate-600 dark:text-slate-300">
      <span>Budget Share Distribution (Flexible Range)</span>
      <span>100% Allocated</span>
    </div>
    <div class="h-3.5 w-full rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700">
      ${eb.map(item => `<div class="${item.color} h-full" style="width: ${item.pct}%" title="${item.cat}: ${item.amt} (${item.pct}%)"></div>`).join('')}
    </div>
  </div>

  <div class="overflow-x-auto border rounded-2xl bg-white dark:bg-slate-800">
    <table class="w-full text-xs text-left">
      <thead class="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase font-extrabold text-[10px] border-b">
        <tr>
          <th class="p-3">Category</th>
          <th class="p-3">Description</th>
          <th class="p-3">Calculation / Rate Range</th>
          <th class="p-3 text-right">Estimated Range</th>
          <th class="p-3 text-right">% Budget</th>
        </tr>
      </thead>
      <tbody class="divide-y dark:divide-slate-700 font-semibold">
        ${eb.map(item => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <td class="p-3 font-bold text-slate-800 dark:text-slate-200">${item.cat}</td>
          <td class="p-3 text-slate-500">${item.desc}</td>
          <td class="p-3 text-slate-600 dark:text-slate-300">${item.perDay}</td>
          <td class="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">${item.amt}</td>
          <td class="p-3 text-right font-bold text-slate-500">${item.pct}%</td>
        </tr>
        `).join('')}
        <tr class="bg-slate-100 dark:bg-slate-900/80 font-black text-sm border-t-2">
          <td class="p-3 text-slate-900 dark:text-white" colspan="3">Flexible Total Trip Budget Range</td>
          <td class="p-3 text-right text-emerald-600 dark:text-emerald-400">${d.budgetRange || (cc + d.budget)}</td>
          <td class="p-3 text-right text-emerald-600">100%</td>
        </tr>
      </tbody>
    </table>
  </div>
  `;
  document.getElementById('expC').innerHTML = ebHtml;

  setTimeout(() => renderMap(d.dest, d), 300);
}

async function renderMap(city, itineraryData) {
  const cl = city.toLowerCase().trim(), ms = document.getElementById('mS');
  let coords = GC[cl];
  if (!coords) {
    if (ms) ms.innerText = `Locating ${city}...`;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`);
      const d = await r.json();
      if (d?.length > 0) {
        coords = [parseFloat(d[0].lat), parseFloat(d[0].lon)];
        GC[cl] = coords;
      }
    } catch (e) {}
  }
  if (!coords) {
    let h = 0; for (let i = 0; i < cl.length; i++) h += cl.charCodeAt(i);
    coords = [15 + (h % 25) + (h % 100) / 100, 70 + (h % 30) + (h % 100) / 100];
    if (ms) ms.innerText = `Estimated: ${city}`;
  } else {
    if (ms) ms.innerText = `${city} [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}]`;
  }

  if (lm) lm.remove();

  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  lm = L.map('map').setView(coords, 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap | TravelNova Interactive Map'
  }).addTo(lm);

  L.marker(coords).addTo(lm).bindPopup(`<b>📍 ${city} Center</b>`).openPopup();

  if (!itineraryData || !itineraryData.dw || !itineraryData.dw.length) return;

  const routePoints = [coords];
  const markersToFetch = [];

  // Helper for initial spread positioning around city center
  const getInitialOffset = (idx, typeOffset) => {
    const angle = (idx * 1.2) + typeOffset;
    const dist = 0.012 + ((idx % 4) * 0.006);
    return [coords[0] + Math.sin(angle) * dist, coords[1] + Math.cos(angle) * dist];
  };

  itineraryData.dw.forEach((dp, idx) => {
    // 1. Morning spot
    const moPos = getInitialOffset(idx, 0.4);
    routePoints.push(moPos);
    const moMarker = L.marker(moPos).addTo(lm).bindPopup(`
      <div class="p-1 space-y-1">
        <span class="text-xs font-black text-amber-600">🌅 Day ${dp.day} Morning</span>
        <p class="font-extrabold text-sm">📍 ${dp.mo.place}</p>
        ${dp.mo.area ? `<div class="text-[11px] font-bold text-blue-600">🏙️ Area: ${dp.mo.area}</div>` : ''}
        <p class="text-[11px] text-slate-500">${dp.mo.desc || ''}</p>
      </div>
    `);
    markersToFetch.push({ marker: moMarker, query: `${dp.mo.place}, ${city}`, defaultPos: moPos });

    // 2. Afternoon spot
    const afPos = getInitialOffset(idx, 1.6);
    routePoints.push(afPos);
    const afMarker = L.marker(afPos).addTo(lm).bindPopup(`
      <div class="p-1 space-y-1">
        <span class="text-xs font-black text-blue-600">📸 Day ${dp.day} Afternoon</span>
        <p class="font-extrabold text-sm">📍 ${dp.af.place}</p>
        ${dp.af.area ? `<div class="text-[11px] font-bold text-blue-600">🏙️ Area: ${dp.af.area}</div>` : ''}
        <p class="text-[11px] text-slate-500">${dp.af.desc || ''}</p>
      </div>
    `);
    markersToFetch.push({ marker: afMarker, query: `${dp.af.place}, ${city}`, defaultPos: afPos });

    // 3. Hotel spot
    const hoPos = getInitialOffset(idx, 2.8);
    const hoMarker = L.marker(hoPos).addTo(lm).bindPopup(`
      <div class="p-1 space-y-1">
        <span class="text-xs font-black text-emerald-600">🏨 Day ${dp.day} Hotel</span>
        <p class="font-extrabold text-sm">${dp.hotel}</p>
      </div>
    `);
    markersToFetch.push({ marker: hoMarker, query: `${dp.hotel}, ${city}`, defaultPos: hoPos });
  });

  // Connect morning & afternoon spots with polyline
  const polyline = L.polyline(routePoints, {
    color: '#2563eb',
    weight: 3,
    opacity: 0.8,
    dashArray: '6, 6'
  }).addTo(lm);

  // Background geocoding to update pins to exact lat/lon dynamically
  (async () => {
    const updatedRoutePoints = [coords];
    for (let i = 0; i < markersToFetch.length; i++) {
      const item = markersToFetch[i];
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(item.query)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          const realPos = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          item.marker.setLatLng(realPos);
          if (i % 3 !== 2) updatedRoutePoints.push(realPos);
        } else {
          if (i % 3 !== 2) updatedRoutePoints.push(item.defaultPos);
        }
      } catch(e) {
        if (i % 3 !== 2) updatedRoutePoints.push(item.defaultPos);
      }
      await new Promise(r => setTimeout(r, 400));
    }
    if (updatedRoutePoints.length > 1) {
      polyline.setLatLngs(updatedRoutePoints);
    }
  })();
}

function saveT() {
  if (!CI) return;
  const user = currentUser || JSON.parse(sessionStorage.getItem('travelnova_user')) || { email: 'guest@travelnova.com' };
  CI.user_email = user.email;
  CI.email = user.email;
  sv.unshift({ id: Date.now(), ...CI });
  localStorage.setItem('sv2', JSON.stringify(sv));
  try {
    fetch(getApiUrl('/api/save-trip'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_email: user.email,
        destination: CI.dest,
        days: parseInt(CI.dur) || 3,
        budget: CI.budget,
        interests: CI.interests || 'General Sightseeing'
      })
    }).catch(err => {});
  } catch (e) {}
  showToast('Trip plan saved!');
}

function renderDash() {
  const user = currentUser || JSON.parse(sessionStorage.getItem('travelnova_user'));
  const userEmail = user ? (user.email || '').toLowerCase() : null;

  // 1. Confirmed Booked Trips
  const bContainer = document.getElementById('dashBookingsC');
  let localBookings = JSON.parse(localStorage.getItem('travelnova_bookings_db')) || [];
  if (userEmail) {
    localBookings = localBookings.filter(b => b.user_email && b.user_email.toLowerCase() === userEmail);
  }

  if (bContainer) {
    if (!localBookings.length) {
      bContainer.innerHTML = '<p class="text-slate-400 font-bold text-xs">No confirmed booked trips yet. Generate a plan and click Book!</p>';
    } else {
      bContainer.innerHTML = localBookings.map((b, idx) => `
        <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border space-y-3 shadow-sm">
          <div class="flex justify-between items-center border-b pb-2">
            <span class="font-extrabold text-emerald-600 text-sm">📍 ${b.destination}</span>
            <span class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">Ref: ${b.booking_ref}</span>
          </div>
          <div class="text-xs space-y-1 text-slate-600 dark:text-slate-300">
            <p><b>Traveler:</b> ${b.user_name} (${b.user_email})</p>
            <p><b>Duration:</b> ${b.days} Days (${b.start_date || 'Upcoming'})</p>
            <p class="font-black text-amber-600 dark:text-amber-400">Total Amount: ${cc}${b.total_amount}</p>
            <p class="text-[10px] text-slate-400">Booked on: ${b.booked_at}</p>
          </div>
          <div class="pt-2">
            <button onclick="reprintInvoiceFromDash(${idx})" class="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-extrabold shadow hover:opacity-90 transition cursor-pointer">📄 Print Invoice / Voucher</button>
          </div>
        </div>
      `).join('');
    }
  }

  // 2. Saved Draft Trips
  const c = document.getElementById('dashC');
  if (!c) return;
  if (!sv.length) {
    c.innerHTML = '<p class="text-slate-400 font-bold text-xs">No saved trip drafts. Click New to plan!</p>';
    return;
  }
  c.innerHTML = sv.map((t, idx) => `
    <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border space-y-3 shadow-sm">
      <div class="flex justify-between items-center">
        <span class="font-extrabold text-blue-600">${t.dest}</span>
        <span class="text-xs text-slate-400 font-bold">${t.dur}</span>
      </div>
      <p class="text-xs font-bold text-emerald-600">Budget: ${cc}${t.budget}</p>
      <div class="flex gap-2 pt-2">
        <button onclick="loadT(${idx})" class="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow">View</button>
        <button onclick="delT(${idx})" class="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold">Delete</button>
      </div>
    </div>
  `).join('');
}

function reprintInvoiceFromDash(index) {
  let localBookings = JSON.parse(localStorage.getItem('travelnova_bookings_db')) || [];
  const user = currentUser || JSON.parse(sessionStorage.getItem('travelnova_user'));
  if (user && user.email) {
    localBookings = localBookings.filter(b => b.user_email && b.user_email.toLowerCase() === user.email.toLowerCase());
  }
  const b = localBookings[index];
  if (!b) return;
  currentBookingData = b;
  printInvoicePDF();
}

function loadT(idx) {
  CI = sv[idx];
  renderIt(CI);
  showS('itinerary');
}

function delT(idx) {
  sv.splice(idx, 1);
  localStorage.setItem('sv2', JSON.stringify(sv));
  renderDash();
}

// ========== BOOKING MODAL LOGIC ==========
function openBookingModal() {
  if (!CI) {
    showToast('Please generate a trip plan first!', 'error');
    return;
  }
  const user = currentUser || JSON.parse(sessionStorage.getItem('travelnova_user')) || { name: 'Traveler', email: 'user@example.com' };
  
  const bModal = document.getElementById('bookingModal');
  if (bModal) bModal.classList.remove('hidden');

  const destElem = document.getElementById('bmDest');
  const durElem = document.getElementById('bmDays');
  const amountElem = document.getElementById('bmTotalAmount');
  
  const inputName = document.getElementById('bmInputName');
  const inputEmail = document.getElementById('bmInputEmail');
  const inputPhone = document.getElementById('bmInputPhone');

  if (destElem) destElem.innerText = CI.dest;
  if (durElem) durElem.innerText = CI.dur;
  
  if (inputName) inputName.value = user.name || '';
  if (inputEmail) inputEmail.value = user.email || '';
  if (inputPhone && inputPhone.value === '9876543210') inputPhone.value = '';
  
  const hotelExpense = Math.round((CI.budget || 10000) * 0.35);
  if (amountElem) amountElem.innerText = `${cc}${hotelExpense}`;
}

function closeBookingModal() {
  const bModal = document.getElementById('bookingModal');
  if (bModal) bModal.classList.add('hidden');
}

function confirmBooking(e) {
  if (e && e.preventDefault) e.preventDefault();
  const user = currentUser || JSON.parse(sessionStorage.getItem('travelnova_user')) || { name: 'Traveler', email: 'user@example.com' };
  const name = document.getElementById('bmInputName') ? document.getElementById('bmInputName').value.trim() : user.name;
  const email = document.getElementById('bmInputEmail') ? document.getElementById('bmInputEmail').value.trim() : user.email;
  const phone = document.getElementById('bmInputPhone') ? document.getElementById('bmInputPhone').value.trim() : '9876543210';
  const payment = document.getElementById('bmPaymentMethod') ? document.getElementById('bmPaymentMethod').value : 'Pay at Hotel / On Arrival';
  
  // Format validation for Email and Mobile
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }
  const phoneRegex = /^[0-9]{10,15}$/;
  if (!phoneRegex.test(phone.replace(/[\s\-\+]/g, ''))) {
    showToast('Please enter a valid mobile number (10-15 digits).', 'error');
    return;
  }

  // Credit Card Validation if selected
  if (payment === 'Credit / Debit Card') {
    const cc = document.getElementById('bmCardNumber')?.value.trim();
    if (!cc || cc.length < 13) {
      showToast('Please enter a valid Card Number.', 'error');
      return;
    }
  }
  
  const adCount = document.getElementById('fAdults') ? parseInt(document.getElementById('fAdults').value) || 2 : 2;
  const chCount = document.getElementById('fChildren') ? parseInt(document.getElementById('fChildren').value) || 0 : 0;
  const srCount = document.getElementById('fSeniors') ? parseInt(document.getElementById('fSeniors').value) || 0 : 0;
  const sDate = document.getElementById('fSD') ? document.getElementById('fSD').value : '';
  const eDate = document.getElementById('fED') ? document.getElementById('fED').value : '';

  const refId = 'TN-' + Math.floor(100000 + Math.random() * 900000);
  const hotelExpense = Math.round((CI.budget || 10000) * 0.35);

  currentBookingData = {
    booking_ref: refId,
    user_name: name || 'Traveler',
    user_email: email || 'user@example.com',
    user_phone: phone,
    destination: CI.dest,
    days: parseInt(CI.dur) || 3,
    total_amount: hotelExpense,
    payment_method: payment,
    booked_at: new Date().toLocaleString(),
    adults: adCount,
    children: chCount,
    seniors: srCount,
    start_date: sDate,
    end_date: eDate
  };

  try {
    fetch(getApiUrl('/api/book-trip'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentBookingData)
    }).catch(err => {});
  } catch (err) {}

  let localBookings = JSON.parse(localStorage.getItem('travelnova_bookings_db')) || [];
  localBookings.unshift(currentBookingData);
  localStorage.setItem('travelnova_bookings_db', JSON.stringify(localBookings));

  closeBookingModal();

  const congMsg = document.getElementById('congSubMsg');
  if (congMsg) congMsg.innerHTML = `🎉 Congratulations ${name}! Your trip to <b>${currentBookingData.destination}</b> is successfully booked!`;
  
  const congBox = document.getElementById('congDetailsBox');
  if (congBox) {
    congBox.innerHTML = `
      <div><b>Booking Ref ID:</b> <span class="text-emerald-600 font-bold">${refId}</span></div>
      <div><b>Passenger Name:</b> ${name} (${email})</div>
      <div><b>Destination:</b> ${currentBookingData.destination} (${currentBookingData.days} Days)</div>
      <div><b>Total Amount:</b> <span class="text-emerald-600 font-bold">${cc}${currentBookingData.total_amount}</span></div>
      <div><b>Payment Status:</b> <span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">${payment}</span></div>
      <div><b>Passengers:</b> ${adCount} Adults, ${chCount} Children, ${srCount} Seniors</div>
    `;
  }

  const congModal = document.getElementById('congratulationsModal');
  if (congModal) congModal.classList.remove('hidden');

  showToast(`🎉 Congratulations! Trip Booked (Ref: ${refId})`, 'info');
  downloadBookingInvoicePDF();
}

function closeCongModal() {
  const cEl = document.getElementById('congratulationsModal');
  if (cEl) cEl.classList.add('hidden');
}

// Payment UI handler
function handlePaymentMethodChange() {
  const method = document.getElementById('bmPaymentMethod').value;
  const upiSec = document.getElementById('upiPaymentSection');
  const cardSec = document.getElementById('cardPaymentSection');
  
  if (upiSec) upiSec.classList.add('hidden');
  if (cardSec) cardSec.classList.add('hidden');

  if (method === 'UPI / GPay / PhonePe') {
    if (upiSec) {
      upiSec.classList.remove('hidden');
      const hotelExpense = Math.round((CI?.budget || 10000) * 0.35);
      const upiId = 'travelnova@upi';
      const upiUrl = `upi://pay?pa=${upiId}&pn=TravelNova&am=${hotelExpense}&cu=INR`;
      const qrImg = document.getElementById('upiQrCode');
      if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}`;
    }
  } else if (method === 'Credit / Debit Card') {
    if (cardSec) cardSec.classList.remove('hidden');
  }
}

// Format credit card input dynamically
document.addEventListener('DOMContentLoaded', () => {
  const cardInput = document.getElementById('bmCardNumber');
  if (cardInput) {
    cardInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 0) v = v.match(/.{1,4}/g).join(' ');
      e.target.value = v;
    });
  }
  const expiryInput = document.getElementById('bmCardExpiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 2) v = v.substring(0,2) + '/' + v.substring(2,4);
      e.target.value = v;
    });
  }
});

function downloadBookingInvoicePDF() {
  if (!currentBookingData && CI) {
    const user = currentUser || JSON.parse(sessionStorage.getItem('travelnova_user')) || { name: 'Traveler', email: 'user@example.com' };
    const adCount = document.getElementById('fAdults') ? parseInt(document.getElementById('fAdults').value) || 2 : 2;
    const chCount = document.getElementById('fChildren') ? parseInt(document.getElementById('fChildren').value) || 0 : 0;
    const srCount = document.getElementById('fSeniors') ? parseInt(document.getElementById('fSeniors').value) || 0 : 0;
    const hotelExpense = Math.round((CI.budget || 10000) * 0.35);
    const sDate = document.getElementById('fSD') ? document.getElementById('fSD').value : '';
    const eDate = document.getElementById('fED') ? document.getElementById('fED').value : '';
    currentBookingData = {
      booking_ref: 'TN-' + Math.floor(100000 + Math.random() * 900000),
      user_name: user.name || 'Traveler',
      user_email: user.email || 'user@example.com',
      user_phone: '9876543210',
      destination: CI.dest,
      days: parseInt(CI.dur) || 3,
      total_amount: hotelExpense,
      payment_method: 'Pay at Hotel / On Arrival',
      booked_at: new Date().toLocaleString(),
      adults: adCount,
      children: chCount,
      seniors: srCount,
      start_date: sDate,
      end_date: eDate
    };
  }

  if (!currentBookingData) {
    showToast('Please generate an itinerary first!', 'error');
    return;
  }

  const b = currentBookingData;
  const invoiceHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>TravelNova Booking Invoice - ${b.booking_ref}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; background: #fff; margin: 0; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 25px; }
    .logo { font-size: 28px; font-weight: 900; color: #0284c7; text-transform: uppercase; letter-spacing: -0.5px; }
    .badge { background: #dcfce7; color: #15803d; padding: 6px 16px; border-radius: 20px; font-weight: 800; font-size: 12px; }
    .congrats { background: linear-gradient(135deg, #0f172a, #1e293b); color: #f8fafc; padding: 24px; border-radius: 16px; margin-bottom: 25px; text-align: center; border: 2px solid #10b981; box-shadow: 0 4px 15px rgba(16,185,129,0.15); }
    .congrats h2 { margin: 0 0 8px 0; font-size: 24px; font-weight: 900; color: #34d399; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .congrats-sub { font-size: 14px; font-weight: 700; color: #e2e8f0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 12px; font-size: 13px; }
    .box h4 { margin: 0 0 10px 0; text-transform: uppercase; color: #64748b; font-size: 11px; letter-spacing: 1px; }
    .total-box { font-weight: 900; font-size: 18px; background: #ecfdf5; color: #047857; border: 2px solid #a7f3d0; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 25px; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">✈ TravelNova</div>
      <div style="font-size: 12px; color: #64748b;">Official Booking Invoice & Travel Voucher</div>
    </div>
    <div>
      <span class="badge">VERIFIED & CONFIRMED</span>
      <div style="font-size: 11px; font-weight: 700; margin-top: 6px; text-align: right;">Ref: ${b.booking_ref}</div>
    </div>
  </div>

  <div class="congrats">
    <h2>🎉 Congratulations ${b.user_name}!</h2>
    <div class="congrats-sub">Your hotel booking for <b style="color: #38bdf8;">${b.destination}</b> is officially confirmed!</div>
  </div>

  <div class="grid">
    <div class="box">
      <h4>Passenger Details</h4>
      <div><b>Name:</b> ${b.user_name}</div>
      <div><b>Email:</b> ${b.user_email}</div>
      <div><b>Phone:</b> ${b.user_phone}</div>
      <div><b>Booking Date:</b> ${b.booked_at}</div>
      <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1;"><b>Travelers:</b> ${b.adults || 2} Adults, ${b.children || 0} Children, ${b.seniors || 0} Seniors</div>
    </div>
    <div class="box">
      <h4>Trip Summary</h4>
      <div><b>Destination:</b> ${b.destination}</div>
      <div><b>Start Date:</b> ${b.start_date || 'N/A'}</div>
      <div><b>End Date:</b> ${b.end_date || 'N/A'}</div>
      <div><b>Duration:</b> ${b.days} Days Trip</div>
      <div><b>Payment Method:</b> ${b.payment_method}</div>
    </div>
  </div>

  <div class="total-box">
    GRAND TOTAL HOTEL STAY AMOUNT PAID / BOOKED: ${cc}${b.total_amount.toLocaleString()}
  </div>

  <div class="footer">
    © 2026 TravelNova Smart System. All rights reserved. • Thank you for booking with us!
  </div>
</body>
</html>`;

  let printIframe = document.getElementById('travelnova_print_frame');
  if (!printIframe) {
    printIframe = document.createElement('iframe');
    printIframe.id = 'travelnova_print_frame';
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    document.body.appendChild(printIframe);
  }

  const doc = printIframe.contentWindow.document;
  doc.open();
  doc.write(invoiceHtml);
  doc.close();

  setTimeout(() => {
    printIframe.contentWindow.focus();
    printIframe.contentWindow.print();
  }, 50);
}

// ========== CHATBOT ASSISTANT LOGIC ==========
function askBot(query) {
  if (!query) return;
  const chatM = document.getElementById('chatM');
  if (!chatM) return;

  const userMsg = document.createElement('div');
  userMsg.className = "bg-blue-600 text-white p-3 rounded-2xl text-xs font-semibold ml-auto max-w-[80%]";
  userMsg.textContent = query;
  chatM.appendChild(userMsg);

  const input = document.getElementById('chatI');
  if (input) input.value = '';
  chatM.scrollTop = chatM.scrollHeight;

  setTimeout(() => {
    const reply = getBotReply(query);
    const botMsg = document.createElement('div');
    botMsg.className = "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-3 rounded-2xl border text-xs font-semibold max-w-[85%]";
    botMsg.innerHTML = reply;
    chatM.appendChild(botMsg);
    chatM.scrollTop = chatM.scrollHeight;
  }, 400);
}

function getBotReply(q) {
  const query = q.toLowerCase();

  // 1. Invoice / Voucher / Print / Download Receipt
  if (query.includes('invoice') || query.includes('print') || query.includes('pdf') || query.includes('voucher') || query.includes('receipt') || query.includes('bill')) {
    return `📄 <b>How to Print & Download Invoice:</b><br><br>
    <b>Step 1:</b> Click <b>"🎟️ Book Trip Plan"</b> or <b>"🎫 Book This Plan"</b> on your itinerary page.<br>
    <b>Step 2:</b> Enter your Name, Mobile Number, Email Address and select Payment Method.<br>
    <b>Step 3:</b> Click <b>"🎉 Confirm Booking & Print Voucher PDF"</b>.<br>
    <b>Step 4:</b> In the popup, click <b>"📄 Print / Save PDF Invoice"</b> or click the <b>"Print PDF"</b> button at the top of your itinerary!`;
  }

  // 2. Plan Trip / How to use / Generate itinerary
  if (query.includes('plan') || query.includes('generate') || query.includes('create') || query.includes('itinerary') || query.includes('how to use') || query.includes('start')) {
    return `✨ <b>How to Plan Your Trip:</b><br><br>
    <b>Step 1:</b> Enter your destination city in the <b>"Destination"</b> field.<br>
    <b>Step 2:</b> Select <b>Start Date & End Date</b> (up to 20 days max).<br>
    <b>Step 3:</b> Choose Adults/Children count, Budget range & Food preferences.<br>
    <b>Step 4:</b> Click <b>"✨ Generate Travel Itinerary"</b> to view your personalized plan & live map!`;
  }

  // 3. Save Trip
  if (query.includes('save') || query.includes('bookmark')) {
    return `💾 <b>How to Save Your Trip:</b><br><br>
    <b>Step 1:</b> After generating your travel plan, click the <b>"Save"</b> button in the top action bar.<br>
    <b>Step 2:</b> Your trip will be saved in your <b>"Dashboard"</b> for future reference!`;
  }

  // 4. Dashboard / View saved trips
  if (query.includes('dashboard') || query.includes('saved') || query.includes('my trips')) {
    return `📊 <b>How to Access Saved Trips:</b><br><br>
    Click <b>"Dashboard"</b> in the top navigation header bar to view, reload, or delete all your saved trip itineraries!`;
  }

  // 5. Dietary preferences (Jain, Vegan, Veg, Halal, etc.)
  if (query.includes('jain') || query.includes('vegan') || query.includes('veg') || query.includes('halal') || query.includes('gluten') || query.includes('diet') || query.includes('food')) {
    return `🥗 <b>Dietary Food Spot Recommendations:</b><br><br>
    Select your food preferences (e.g. <i>Jain, Vegan, Vegetarian, Halal</i>) under <b>"🥗 Food"</b> on the Planner page before generating.<br>
    TravelNova will automatically curate verified local food spots matching your specific dietary needs!`;
  }

  // 6. Currency & Budget
  if (query.includes('currency') || query.includes('budget') || query.includes('cost') || query.includes('price') || query.includes('money')) {
    return `💰 <b>Currency & Budget Options:</b><br><br>
    Select your currency (<i>₹ INR, $ USD, € EUR, £ GBP, AED</i>) at the top header or planner form to view instant itemized budget estimates for stay, food, transport & sightseeing!`;
  }

  // 7. General travel tips
  if (query.includes('best time') || query.includes('visit')) {
    return "🌤️ <b>Best Time to Visit:</b><br>October to March is generally ideal with pleasant weather across most domestic and international destinations.";
  }
  if (query.includes('pack') || query.includes('packing')) {
    return "🧳 <b>Packing Essentials:</b><br>Comfortable walking shoes, weather-appropriate clothing, power bank, universal adapter, personal ID & essential medications.";
  }
  if (query.includes('safety') || query.includes('safe')) {
    return "🛡️ <b>Travel Safety Guidelines:</b><br>Keep digital copies of IDs/vouchers, stay hydrated, use verified rides/taxis, and keep emergency contacts saved.";
  }
  if (query.includes('cheap flight') || query.includes('flight')) {
    return "✈️ <b>Flight Booking Hack:</b><br>Book 6-8 weeks in advance, search in incognito mode, and keep your travel dates flexible!";
  }

  // 8. Polite, satisfying fallback for unrecognized questions
  return `🙏 <b>Sorry, I couldn't find a direct answer to your question.</b><br><br>
  You can ask me about:<br>
  • <i>How to print / download PDF invoice</i><br>
  • <i>How to plan & generate a trip</i><br>
  • <i>How to save trips & access Dashboard</i><br>
  • <i>Dietary food options & budget guide</i>`;
}
