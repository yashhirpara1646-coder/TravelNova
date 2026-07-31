// TravelNova Admin Control Center Logic

let rawAdminData = { users: [], trips: [], bookings: [] };

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

async function syncOfflineData() {
  try {
    const localUsers = JSON.parse(localStorage.getItem('travelnova_users_db')) || [];
    const activeUser = JSON.parse(sessionStorage.getItem('travelnova_user'));
    if (activeUser && activeUser.email && !localUsers.some(u => u.email.toLowerCase() === activeUser.email.toLowerCase())) {
      localUsers.push(activeUser);
    }

    // Sync Users to Backend JSON DB
    for (const u of localUsers) {
      if (!u.email) continue;
      try {
        await fetch(getApiUrl('/api/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: u.name || 'Traveler', email: u.email, password: u.password || 'Password@123' })
        });
      } catch (e) {}
    }

    // Sync Bookings to Backend JSON DB
    const localBookings = JSON.parse(localStorage.getItem('travelnova_bookings_db')) || [];
    for (const b of localBookings) {
      if (!b.booking_ref) continue;
      try {
        await fetch(getApiUrl('/api/book-trip'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(b)
        });
      } catch (e) {}
    }
  } catch (err) {}
}

async function loadAdminData() {
  await syncOfflineData();
  try {
    const r = await fetch(getApiUrl('/api/admin/all-data'));
    const data = await r.json();
    rawAdminData = data;
    renderAdminUI(data);
  } catch (e) {
    // Local storage fallback
    const localUsers = JSON.parse(localStorage.getItem('travelnova_users_db')) || [];
    const localBookings = JSON.parse(localStorage.getItem('travelnova_bookings_db')) || [];
    const localTrips = JSON.parse(localStorage.getItem('sv2')) || [];
    
    rawAdminData = {
      summary: {
        total_users: localUsers.length,
        total_bookings: localBookings.length,
        total_revenue: localBookings.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0)
      },
      users: localUsers,
      trips: localTrips,
      bookings: localBookings
    };
    renderAdminUI(rawAdminData);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: tableName, id: recordId })
    });
    const resData = await response.json();
    if (!resData.success) {
      alert(resData.message || 'Failed to delete record.');
    }
  } catch (e) {
    if (tableName === 'users') {
      let localUsers = JSON.parse(localStorage.getItem('travelnova_users_db')) || [];
      localUsers = localUsers.filter(u => String(u.id) !== String(recordId) && u.email !== String(recordId));
      localStorage.setItem('travelnova_users_db', JSON.stringify(localUsers));
    } else if (tableName === 'bookings') {
      let localBookings = JSON.parse(localStorage.getItem('travelnova_bookings_db')) || [];
      localBookings = localBookings.filter(b => String(b.id) !== String(recordId) && b.booking_ref !== String(recordId));
      localStorage.setItem('travelnova_bookings_db', JSON.stringify(localBookings));
    } else if (tableName === 'trips') {
      let localTrips = JSON.parse(localStorage.getItem('sv2')) || [];
      localTrips = localTrips.filter(t => String(t.id) !== String(recordId));
      localStorage.setItem('sv2', JSON.stringify(localTrips));
    }
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: tableName })
    });
    const resData = await response.json();
    alert(resData.message || `Table ${tableName} reset successfully!`);
  } catch (e) {
    if (tableName === 'users') {
      localStorage.removeItem('travelnova_users_db');
    } else if (tableName === 'bookings') {
      localStorage.removeItem('travelnova_bookings_db');
    } else if (tableName === 'trips') {
      localStorage.removeItem('sv2');
    }
    alert(`Offline Fallback: Cleared "${tableName}" from local storage successfully!`);
  }
  loadAdminData();
}

document.addEventListener('DOMContentLoaded', loadAdminData);
