/**
 * ADMIN DASHBOARD JS – SEBLAK GLEDEK
 */

document.addEventListener('DOMContentLoaded', () => {
    fetchReservations();

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            fetchReservations();
            showToast('🔄 Data diperbarui');
        });
    }
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
            updateStats(result.data);
        } else {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center">Error: ${result.message}</td></tr>`;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        tbody.innerHTML = `<tr><td colspan="9" class="text-center">Gagal memuat data dari server.</td></tr>`;
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

    // Sort by createdAt (newest first)
    const sortedData = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    tbody.innerHTML = sortedData.map(res => `
        <tr id="row-${res.id}">
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
                        <button class="btn-icon btn-confirm" data-id="${res.id}" title="Konfirmasi">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn-icon btn-delete" data-id="${res.id}" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Add event listeners to buttons
    tbody.querySelectorAll('.btn-confirm').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            console.log('Confirm clicked for ID:', id);
            updateStatus(id, 'confirmed');
        });
    });

    tbody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            console.log('Delete clicked for ID:', id);
            deleteReservation(id);
        });
    });
}

/**
 * Update the dashboard statistics cards
 */
function updateStats(data) {
    document.getElementById('totalReservations').textContent = data.length;
    
    const totalGuests = data.reduce((sum, res) => sum + (parseInt(res.guests) || 0), 0);
    const guestEl = document.getElementById('totalGuests');
    if (guestEl) guestEl.textContent = totalGuests;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayRes = data.filter(res => res.date === todayStr).length;
    const todayEl = document.getElementById('todayReservations');
    if (todayEl) todayEl.textContent = todayRes;
}

/**
 * Delete a reservation
 */
async function deleteReservation(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus reservasi ini?')) return;
    console.log('Deleting reservation ID:', id);

    try {
        const response = await fetch(`/api/reservation/${id}`, { method: 'DELETE' });
        console.log('Delete response status:', response.status);
        const result = await response.json();

        if (result.success) {
            showToast('✅ Reservasi dihapus');
            fetchReservations();
        } else {
            alert('Gagal menghapus: ' + result.message);
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Terjadi kesalahan saat menghubungi server.');
    }
}

/**
 * Update reservation status
 */
async function updateStatus(id, status) {
    console.log(`Updating ID ${id} to ${status}`);
    try {
        const response = await fetch(`/api/reservation/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        console.log('Update response status:', response.status);
        const result = await response.json();

        if (result.success) {
            showToast(`✅ Status diperbarui ke ${status}`);
            fetchReservations();
        } else {
            alert('Gagal memperbarui status: ' + result.message);
        }
    } catch (error) {
        console.error('Update error:', error);
        alert('Terjadi kesalahan saat menghubungi server.');
    }
}

/**
 * Show a simple toast notification
 */
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
