// TravelNova Auth & Login Logic

let mode = 'login';

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

// Redirect if already logged in
const existingUser = JSON.parse(sessionStorage.getItem('travelnova_user'));
if (existingUser) {
  window.location.href = 'index.html';
}

// Tab Switch Function
function switchTab(m) {
  mode = m;
  const tL = document.getElementById('tabLogin');
  const tR = document.getElementById('tabRegister');
  const nF = document.getElementById('nameField');
  const btn = document.getElementById('submitBtn');
  const pwdRules = document.getElementById('pwdRules');
  
  const alertBox = document.getElementById('alertBox');
  if (alertBox) alertBox.classList.add('hidden');

  if (m === 'login') {
    if (tL) tL.className = "flex-1 text-center py-3 text-sm font-black uppercase tracking-wider border-b-2 border-blue-600 text-blue-600 transition-all";
    if (tR) tR.className = "flex-1 text-center py-3 text-sm font-black uppercase tracking-wider border-b-2 border-transparent text-slate-400 hover:text-slate-600 transition-all";
    if (nF) nF.classList.add('hidden');
    if (pwdRules) pwdRules.classList.add('hidden');
    if (btn) {
      btn.innerHTML = "🔑 Sign In to TravelNova";
      btn.className = "w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md transition-all";
    }
  } else {
    if (tR) tR.className = "flex-1 text-center py-3 text-sm font-black uppercase tracking-wider border-b-2 border-emerald-600 text-emerald-600 transition-all";
    if (tL) tL.className = "flex-1 text-center py-3 text-sm font-black uppercase tracking-wider border-b-2 border-transparent text-slate-400 hover:text-slate-600 transition-all";
    if (nF) nF.classList.remove('hidden');
    if (pwdRules) pwdRules.classList.remove('hidden');
    if (btn) {
      btn.innerHTML = "📝 Create Account & Save";
      btn.className = "w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-all";
    }
  }
}

// Toggle Password Visibility
function togglePwd() {
  const el = document.getElementById('fPwd');
  if (el) {
    el.type = el.type === 'password' ? 'text' : 'password';
  }
}

// Email Validation
function checkEmail() {
  const emailInput = document.getElementById('fEmail');
  if (!emailInput) return false;
  
  const email = emailInput.value.trim();
  const err = document.getElementById('emailErr');
  const pattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  
  if (email.length > 0 && !pattern.test(email)) {
    if (err) err.classList.remove('hidden');
    return false;
  }
  if (err) err.classList.add('hidden');
  return email.length > 0 && pattern.test(email);
}

// Password Live Validation
function checkPwd() {
  const pwdInput = document.getElementById('fPwd');
  if (!pwdInput) return false;
  
  const pwd = pwdInput.value;
  const r1 = document.getElementById('r1');
  const r2 = document.getElementById('r2');
  const r3 = document.getElementById('r3');
  const r4 = document.getElementById('r4');

  const ok1 = pwd.length >= 8;
  const ok2 = pwd.length > 0 && /^[A-Z]/.test(pwd);
  const ok3 = /[!@#$%^&*()\-_=+{}[\]:;"'<>,.?/\\|`~]/.test(pwd);
  const ok4 = /\d/.test(pwd);

  if (r1) setRule(r1, ok1);
  if (r2) setRule(r2, ok2);
  if (r3) setRule(r3, ok3);
  if (r4) setRule(r4, ok4);

  return ok1 && ok2 && ok3 && ok4;
}

function setRule(el, pass) {
  el.className = `flex items-center gap-2 text-[11px] ${pass ? 'rule-pass' : 'rule-fail'}`;
  const icon = el.querySelector('span');
  if (icon) icon.textContent = pass ? '✅' : '❌';
}

// Show Alert Banner
function showAlert(msg, type) {
  const el = document.getElementById('alertBox');
  if (!el) return;
  el.textContent = msg;
  const colors = {
    error: 'bg-rose-50 border-rose-200 text-rose-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700'
  };
  el.className = `p-3.5 rounded-2xl text-xs font-bold border ${colors[type] || colors.info}`;
  el.classList.remove('hidden');
}

// Form Submit Handler
async function handleAuth(e) {
  e.preventDefault();
  const name = document.getElementById('fName').value.trim();
  const email = document.getElementById('fEmail').value.trim();
  const password = document.getElementById('fPwd').value;

  if (!checkEmail()) {
    showAlert("⚠️ Email is compulsory! Enter a valid email address (e.g. user@example.com).", "error");
    return;
  }

  if (!password) {
    showAlert("⚠️ Please enter your password.", "error");
    return;
  }

  if (mode === 'register') {
    if (!name || name.length < 2) {
      showAlert("⚠️ Please enter your full name (min 2 characters).", "error");
      return;
    }
    if (!checkPwd()) {
      showAlert("⚠️ Password does not meet all the required rules. Please check!", "error");
      return;
    }
  }

  const endpoint = mode === 'register' ? '/api/register' : '/api/login';
  const payload = mode === 'register' ? { name, email, password } : { email, password };



  try {
    const res = await fetch(getApiUrl(endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (res.ok && data.success) {
      const user = data.user || { name: name || email.split('@')[0], email };
      sessionStorage.setItem('travelnova_user', JSON.stringify(user));
      localStorage.setItem('travelnova_user', JSON.stringify(user));

      // Save user to local storage users DB
      let usersDb = JSON.parse(localStorage.getItem('travelnova_users_db')) || [];
      if (user.email && !usersDb.some(u => u.email && u.email.toLowerCase() === user.email.toLowerCase())) {
        usersDb.push(user);
        localStorage.setItem('travelnova_users_db', JSON.stringify(usersDb));
      }

      showAlert(`🎉 ${data.message}`, "success");
      setTimeout(() => { window.location.href = 'index.html'; }, 1200);
    } else {
      showAlert(`⚠️ ${data.message || 'Authentication failed.'}`, "error");
    }
  } catch (err) {
    // Fallback local storage
    let usersDb = JSON.parse(localStorage.getItem('travelnova_users_db')) || [];

    if (mode === 'register') {
      if (usersDb.some(u => u.email === email.toLowerCase())) {
        showAlert("⚠️ This email is already registered. Please login.", "error");
        return;
      }
      const newUser = { id: Date.now(), name: name || email.split('@')[0], email: email.toLowerCase(), password };
      usersDb.push(newUser);
      localStorage.setItem('travelnova_users_db', JSON.stringify(usersDb));
      sessionStorage.setItem('travelnova_user', JSON.stringify(newUser));
      showAlert("🎉 Account created & saved successfully!", "success");
      setTimeout(() => { window.location.href = 'index.html'; }, 1200);
    } else {
      const found = usersDb.find(u => u.email === email.toLowerCase() && u.password === password);
      if (found) {
        sessionStorage.setItem('travelnova_user', JSON.stringify(found));
        showAlert(`🎉 Welcome back, ${found.name}!`, "success");
        setTimeout(() => { window.location.href = 'index.html'; }, 1200);
      } else {
        showAlert("⚠️ Invalid email or password. Please try again.", "error");
      }
    }
  }
}
