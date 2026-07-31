// TravelNova Admin Control Center Logic

let rawAdminData = { users: [], trips: [], bookings: [] };
let adminKey = sessionStorage.getItem('travelnova_admin_key');

function checkAdminAuth() {
  if (!adminKey) {
    const modal = document.getElementById('adminAuthModal');
    if (modal) modal.classList.remove('hidden');
    return false;
  }
  return true;
}

function submitAdminAuth() {
  const pwd = document.getElementById('adminPwd');
  if (!pwd || !pwd.value) return;
  adminKey = pwd.value;
  sessionStorage.setItem('travelnova_admin_key', adminKey);
  const modal = document.getElementById('adminAuthModal');
  if (modal) modal.classList.add('hidden');
  loadAdminData();
}

function logoutAdmin() {
  sessionStorage.removeItem('travelnova_admin_key');
  window.location.reload();
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



async function loadAdminData() {
  if (!checkAdminAuth()) return;
  try {
    const r = await fetch(getApiUrl('/api/admin/all-data'), {
      headers: { 'Admin-Key': adminKey }
    });
    const data = await r.json();
    if (!r.ok || !data.success && data.message === 'Unauthorized. Invalid Admin Password.') {
      alert("Invalid Admin Password or Unauthorized Access.");
      logoutAdmin();
      return;
    }
    rawAdminData = data;
    renderAdminUI(data);
  } catch (e) {
    console.error("Failed to fetch data from MongoDB.", e);
    const bTbl = document.getElementById('tblBookings');
    const uTbl = document.getElementById('tblUsers');
    const tTbl = document.getElementById('tblTrips');
    if (bTbl) bTbl.innerHTML = '<tr><td colspan="10" class="p-6 text-center text-rose-400 font-bold">⚠️ Failed to connect to server. Open http://127.0.0.1:5000/admin.html in your browser!</td></tr>';
    if (uTbl) uTbl.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-rose-400 font-bold">⚠️ Failed to connect to server. Open http://127.0.0.1:5000/admin.html in your browser!</td></tr>';
    if (tTbl) tTbl.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-rose-400 font-bold">⚠️ Failed to connect to server. Open http://127.0.0.1:5000/admin.html in your browser!</td></tr>';
  }
}

function renderAdminUI(data) {
  const s = data.summary || {};
  const statUsers = document.getElementById('statUsers');
  const statBookings = document.getElementById('statBookings');
  const statRevenue = document.getElementById('statRevenue');

  if (statUsers) statUsers.innerText = s.total_users || 0;
  if (statBookings) statBookings.innerText = s.total_bookings || 0;
  if (statRevenue) statRevenue.innerText = `₹${(s.total_revenue || 0).toLocaleString()}`;

  // Render Bookings Table
  const bTbl = document.getElementById('tblBookings');
  const countBookings = document.getElementById('countBookings');
  const bookingsList = data.bookings || [];
  if (countBookings) countBookings.innerText = `${bookingsList.length} records`;
  if (bTbl) {
    if (!bookingsList.length) {
      bTbl.innerHTML = '<tr><td colspan="10" class="p-6 text-center text-slate-500">No trip bookings found yet.</td></tr>';
    } else {
      bTbl.innerHTML = bookingsList.map(b => `
        <tr class="hover:bg-slate-800/40">
          <td class="p-3 font-mono font-bold text-emerald-400">${b.booking_ref || 'TN-BOOK'}</td>
          <td class="p-3 font-bold text-white">${b.user_name || 'Traveler'}</td>
          <td class="p-3 text-slate-400">${b.user_email}</td>
          <td class="p-3 text-slate-400">${b.user_phone || 'N/A'}</td>
          <td class="p-3 font-extrabold text-blue-300">${b.destination}</td>
          <td class="p-3">${b.days} Days</td>
          <td class="p-3 text-right font-black text-amber-400">₹${b.total_amount}</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">${b.payment_method || 'UPI/Card'}</span></td>
          <td class="p-3 text-slate-500">${b.booked_at || 'Just now'}</td>
          <td class="p-3 text-center"><button onclick="deleteRecord('bookings', '${b.booking_ref || b.id}')" class="px-2 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded text-[10px] font-bold transition border border-rose-500/20">🗑️ Delete</button></td>
        </tr>
      `).join('');
    }
  }

  // Render Users Table
  const uTbl = document.getElementById('tblUsers');
  const countUsers = document.getElementById('countUsers');
  const usersList = data.users || [];
  if (countUsers) countUsers.innerText = `${usersList.length} records`;
  if (uTbl) {
    if (!usersList.length) {
      uTbl.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-slate-500">No registered users found.</td></tr>';
    } else {
      uTbl.innerHTML = usersList.map(u => `
        <tr class="hover:bg-slate-800/40">
          <td class="p-3 font-mono font-bold text-slate-400">#${u.id}</td>
          <td class="p-3 font-bold text-white">${u.name}</td>
          <td class="p-3 text-blue-300">${u.email}</td>
          <td class="p-3 text-slate-500">${u.created_at || 'Recently'}</td>
          <td class="p-3 text-center"><button onclick="deleteRecord('users', ${u.id})" class="px-2 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded text-[10px] font-bold transition border border-rose-500/20">🗑️ Delete</button></td>
        </tr>
      `).join('');
    }
  }

  // Render Trips Table
  const tTbl = document.getElementById('tblTrips');
  const countTrips = document.getElementById('countTrips');
  const tripsList = data.trips || [];
  if (countTrips) countTrips.innerText = `${tripsList.length} records`;
  if (tTbl) {
    if (!tripsList.length) {
      tTbl.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-500">No saved trip plans found.</td></tr>';
    } else {
      tTbl.innerHTML = tripsList.map(t => `
        <tr class="hover:bg-slate-800/40">
          <td class="p-3 font-mono font-bold text-slate-400">#${t.id || '-'}</td>
          <td class="p-3 text-blue-300">${t.user_email || t.email || 'guest@travelnova.com'}</td>
          <td class="p-3 font-extrabold text-amber-300">${t.destination || t.dest}</td>
          <td class="p-3">${t.days || t.dur || '3'} Days</td>
          <td class="p-3 text-right font-black text-emerald-400">₹${t.budget || 10000}</td>
          <td class="p-3 flex flex-wrap gap-1">${(t.interests || 'General Sightseeing').split(', ').map(i => `<span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">${i}</span>`).join('')}</td>
          <td class="p-3 text-slate-500">${t.created_at || 'Recently'}</td>
          <td class="p-3 text-center"><button onclick="deleteRecord('trips', ${t.id || 0})" class="px-2 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded text-[10px] font-bold transition border border-rose-500/20">🗑️ Delete</button></td>
        </tr>
      `).join('');
    }
  }
}

function filterTables() {
  const qInput = document.getElementById('dbSearch');
  if (!qInput) return;
  const q = qInput.value.toLowerCase().trim();
  if (!q) {
    renderAdminUI(rawAdminData);
    return;
  }
  const filtered = {
    summary: rawAdminData.summary,
    users: (rawAdminData.users || []).filter(u => (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q))),
    trips: (rawAdminData.trips || []).filter(t => (t.destination && t.destination.toLowerCase().includes(q)) || (t.user_email && t.user_email.toLowerCase().includes(q)) || (t.interests && t.interests.toLowerCase().includes(q))),
    bookings: (rawAdminData.bookings || []).filter(b => (b.destination && b.destination.toLowerCase().includes(q)) || (b.user_name && b.user_name.toLowerCase().includes(q)) || (b.user_email && b.user_email.toLowerCase().includes(q)) || (b.booking_ref && b.booking_ref.toLowerCase().includes(q)))
  };
  renderAdminUI(filtered);
}

async function deleteRecord(tableName, recordId) {
  if (!confirm(`⚠️ Are you sure you want to delete this record (${recordId}) from "${tableName}" database?`)) {
    return;
  }
  try {
    const response = await fetch(getApiUrl('/api/admin/delete-record'), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Admin-Key': adminKey
      },
      body: JSON.stringify({ table: tableName, id: recordId })
    });
    const resData = await response.json();
    if (!resData.success) {
      alert(resData.message || 'Failed to delete record.');
    }
  } catch (e) {
    console.error('Failed to delete record', e);
  }
  loadAdminData();
}

async function resetDbTable(tableName) {
  if (!confirm(`⚠️ Are you sure you want to clear/reset all records in the "${tableName}" database table? This action CANNOT be undone.`)) {
    return;
  }
  try {
    const response = await fetch(getApiUrl('/api/admin/reset-table'), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Admin-Key': adminKey
      },
      body: JSON.stringify({ table: tableName })
    });
    const resData = await response.json();
    alert(resData.message || `Table ${tableName} reset successfully!`);
  } catch (e) {
    console.error('Failed to reset table', e);
  }
  loadAdminData();
}

document.addEventListener('DOMContentLoaded', loadAdminData);
