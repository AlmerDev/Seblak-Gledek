/**
 * ADMIN DASHBOARD JS – SEBLAK GLEDEK
 */

document.addEventListener('DOMContentLoaded', () => {
    fetchReservations();
    fetchOrders();

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            fetchReservations();
            fetchOrders();
            showToast('🔄 Data diperbarui');
        });
    }

    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Update buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}Section`) {
                    content.classList.add('active');
                }
            });
        });
    });
});

/**
 * Fetch all reservations from the API
 */
async function fetchReservations() {
    const tbody = document.getElementById('reservationsBody');
    if (!tbody) return;

    try {
        const response = await fetch('/api/reservations');
        const result = await response.json();

        if (result.success) {
            renderReservations(result.data);
            updateReservationStats(result.data);
        } else {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center">Error: ${result.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        tbody.innerHTML = `<tr><td colspan="9" class="text-center">Gagal memuat data dari server.</td></tr>`;
    }
}

/**
 * Fetch all orders from the API
 */
async function fetchOrders() {
    const tbody = document.getElementById('ordersBody');
    if (!tbody) return;

    try {
        const response = await fetch('/api/orders');
        const result = await response.json();

        if (result.success) {
            renderOrders(result.data);
            updateOrderStats(result.data);
        } else {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center">Error: ${result.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Fetch orders error:', error);
        tbody.innerHTML = `<tr><td colspan="9" class="text-center">Gagal memuat data pesanan.</td></tr>`;
    }
}

/**
 * Render reservation rows into the table
 */
function renderReservations(data) {
    const tbody = document.getElementById('reservationsBody');
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center">Belum ada reservasi masuk.</td></tr>`;
        return;
    }

    const sortedData = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    tbody.innerHTML = sortedData.map(res => `
        <tr id="res-row-${res.id}">
            <td>#${res.id}</td>
            <td style="font-weight:600">${res.name}</td>
            <td>${res.phone}</td>
            <td>${res.date}</td>
            <td>${res.time}</td>
            <td>${res.guests} orang</td>
            <td style="max-width:200px; font-size:0.8rem; color:#666">${res.notes || '-'}</td>
            <td>
                <span class="badge badge-${res.status}">${res.status}</span>
            </td>
            <td>
                <div style="display:flex; gap: 5px;">
                    ${res.status === 'pending' ? `
                        <button class="btn-icon btn-confirm" onclick="updateReservationStatus(${res.id}, 'confirmed')" title="Konfirmasi">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn-icon btn-delete" onclick="deleteReservation(${res.id})" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Render order rows into the table
 */
function renderOrders(data) {
    const tbody = document.getElementById('ordersBody');
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center">Belum ada pesanan masuk.</td></tr>`;
        return;
    }

    const sortedData = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    tbody.innerHTML = sortedData.map(order => `
        <tr id="order-row-${order.id}">
            <td>#${order.id}</td>
            <td>
                <div style="font-weight:600">${order.customerName}</div>
                <div style="font-size:0.75rem; color:#666">${order.customerPhone}</div>
            </td>
            <td style="font-weight:500; color: #ff6b35">${order.seblakType}</td>
            <td style="font-size:0.8rem; max-width: 150px">${order.toppings.join(', ') || '-'}</td>
            <td>Lvl ${order.spicyLevel}</td>
            <td style="font-weight:700">Rp ${order.totalPrice.toLocaleString()}</td>
            <td><span style="font-size:0.75rem">${order.paymentMethod}</span></td>
            <td>
                <span class="badge badge-${order.status}">${order.status}</span>
            </td>
            <td>
                <div style="display:flex; gap: 5px;">
                    ${order.status === 'pending' ? `
                        <button class="btn-icon btn-confirm" onclick="updateOrderStatus(${order.id}, 'processing')" title="Proses">
                            <i class="fas fa-spinner"></i>
                        </button>
                    ` : ''}
                    ${order.status === 'processing' ? `
                        <button class="btn-icon btn-confirm" style="background:#4CAF50" onclick="updateOrderStatus(${order.id}, 'completed')" title="Selesai">
                            <i class="fas fa-check-double"></i>
                        </button>
                    ` : ''}
                    <button class="btn-icon btn-delete" onclick="deleteOrder(${order.id})" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateReservationStats(data) {
    document.getElementById('totalReservations').textContent = data.length;
    const totalGuests = data.reduce((sum, res) => sum + (parseInt(res.guests) || 0), 0);
    if (document.getElementById('totalGuests')) document.getElementById('totalGuests').textContent = totalGuests;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRes = data.filter(res => res.date === todayStr).length;
    if (document.getElementById('todayReservations')) document.getElementById('todayReservations').textContent = todayRes;
}

function updateOrderStats(data) {
    document.getElementById('totalOrders').textContent = data.length;
    const totalRevenue = data.reduce((sum, order) => sum + order.totalPrice, 0);
    document.getElementById('totalRevenue').textContent = `Rp ${totalRevenue.toLocaleString()}`;
    const pendingCount = data.filter(o => o.status === 'pending' || o.status === 'processing').length;
    document.getElementById('pendingOrders').textContent = pendingCount;
}

async function deleteReservation(id) {
    if (!confirm('Hapus reservasi ini?')) return;
    try {
        const response = await fetch(`/api/reservation/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) { showToast('✅ Reservasi dihapus'); fetchReservations(); }
    } catch (error) { console.error(error); }
}

async function updateReservationStatus(id, status) {
    try {
        const response = await fetch(`/api/reservation/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const result = await response.json();
        if (result.success) { showToast(`✅ Status diperbarui`); fetchReservations(); }
    } catch (error) { console.error(error); }
}

async function deleteOrder(id) {
    if (!confirm('Hapus pesanan ini?')) return;
    try {
        const response = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) { showToast('✅ Pesanan dihapus'); fetchOrders(); }
    } catch (error) { console.error(error); }
}

async function updateOrderStatus(id, status) {
    try {
        const response = await fetch(`/api/orders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const result = await response.json();
        if (result.success) { showToast(`✅ Status pesanan diperbarui`); fetchOrders(); }
    } catch (error) { console.error(error); }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}
