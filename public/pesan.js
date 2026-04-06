// pesan.js – Ordering Logic for Seblak Gledek

document.addEventListener('DOMContentLoaded', () => {
    const typeGrid = document.getElementById('seblakTypeGrid');
    const toppingGrid = document.getElementById('toppingsSelectionGrid');
    const spicySlider = document.getElementById('spicyLevel');
    const spicyIndicator = document.getElementById('spicyIndicator');
    const orderForm = document.getElementById('orderForm');
    const totalPriceDisplay = document.getElementById('totalPriceDisplay');
    
    // Summary elements
    const summaryType = document.querySelector('#summary-type .value');
    const summaryToppings = document.querySelector('#summary-toppings .toppings-list-summary');
    const summarySpicy = document.querySelector('#summary-spicy .value');

    let selectedType = null;
    let selectedToppings = [];
    let totalPrice = 0;

    const spicyLevels = {
        1: "Biasa",
        2: "Sedang",
        3: "Pedas",
        4: "Gledek",
        5: "Nyerah!"
    };

    // Fetch Menu Types
    async function fetchMenu() {
        try {
            const response = await fetch('/api/menu');
            const result = await response.json();
            if (result.success) {
                renderTypes(result.data);
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
            typeGrid.innerHTML = '<div class="error">Gagal memuat jenis seblak.</div>';
        }
    }

    // Fetch Toppings
    async function fetchToppings() {
        try {
            const response = await fetch('/api/toppings');
            const result = await response.json();
            if (result.success) {
                renderToppings(result.data);
            }
        } catch (error) {
            console.error('Error fetching toppings:', error);
            toppingGrid.innerHTML = '<div class="error">Gagal memuat topping.</div>';
        }
    }

    function renderTypes(types) {
        typeGrid.innerHTML = '';
        types.forEach(type => {
            const card = document.createElement('div');
            card.className = 'type-card';
            card.innerHTML = `
                <img src="${type.image}" alt="${type.name}" class="type-img">
                <span class="type-name">${type.name}</span>
                <span class="type-price">Rp ${type.price.toLocaleString()}</span>
            `;
            card.onclick = () => selectType(type, card);
            typeGrid.appendChild(card);
        });
    }

    function renderToppings(toppings) {
        toppingGrid.innerHTML = '';
        toppings.forEach(topping => {
            const card = document.createElement('div');
            card.className = 'topping-select-card';
            card.innerHTML = `
                <span class="topping-icon">${topping.icon}</span>
                <span class="topping-name">${topping.name}</span>
                <span class="topping-price">+Rp ${topping.price.toLocaleString()}</span>
            `;
            card.onclick = () => toggleTopping(topping, card);
            toppingGrid.appendChild(card);
        });
    }

    function selectType(type, card) {
        document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedType = type;
        summaryType.textContent = type.name;
        updatePrice();
    }

    function toggleTopping(topping, card) {
        const index = selectedToppings.findIndex(t => t.id === topping.id);
        if (index > -1) {
            selectedToppings.splice(index, 1);
            card.classList.remove('selected');
        } else {
            selectedToppings.push(topping);
            card.classList.add('selected');
        }
        
        summaryToppings.textContent = selectedToppings.length > 0 
            ? selectedToppings.map(t => t.name).join(', ') 
            : 'Belum ada';
        
        updatePrice();
    }

    function updatePrice() {
        let basePrice = selectedType ? selectedType.price : 0;
        let toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
        totalPrice = basePrice + toppingsPrice;
        totalPriceDisplay.textContent = `Rp ${totalPrice.toLocaleString()}`;
    }

    // Spicy Slider Listener
    spicySlider.oninput = function() {
        const val = this.value;
        const label = spicyLevels[val];
        spicyIndicator.innerHTML = `<i class="fas fa-fire"></i> Level ${val}: ${label}`;
        summarySpicy.textContent = `Level ${val} (${label})`;
        
        // Visual feedback
        const intensity = (val - 1) * 0.25;
        spicyIndicator.style.backgroundColor = `rgba(225, 46, 46, ${intensity + 0.1})`;
        spicyIndicator.style.color = val > 3 ? '#fff' : 'var(--secondary)';
    };

    // Form Submission
    orderForm.onsubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting order...');
        
        if (!selectedType) {
            showToast('Silakan pilih jenis seblak terlebih dahulu!', 'error');
            return;
        }

        const formData = new FormData(orderForm);
        const orderData = {
            customerName: formData.get('customerName'),
            customerPhone: formData.get('customerPhone'),
            seblakType: selectedType.name,
            toppings: selectedToppings.map(t => t.name),
            spicyLevel: spicySlider.value,
            paymentMethod: formData.get('paymentMethod'),
            totalPrice: totalPrice,
            notes: formData.get('notes')
        };

        console.log('Order data:', orderData);

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Result:', result);

            if (result.success) {
                showToast('Pesanan berhasil dikirim ke dapur!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showToast(result.message || 'Gagal mengirim pesanan', 'error');
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            showToast('Gagal mengirim pesanan. Pastikan server berjalan.', 'error');
        }
    };

    // WhatsApp Order Button
    document.getElementById('whatsappOrderBtn').onclick = () => {
        if (!selectedType) {
            showToast('Silakan pilih jenis seblak terlebih dahulu!', 'error');
            return;
        }

        const name = document.getElementById('custName').value || 'Pelanggan';
        const toppingsText = selectedToppings.length > 0 
            ? selectedToppings.map(t => t.name).join(', ') 
            : 'Tanpa Topping';
        
        const message = `Halo Seblak Gledek! 🔥%0A%0ASaya ingin memesan:%0A- *Jenis:* ${selectedType.name}%0A- *Topping:* ${toppingsText}%0A- *Level Pedas:* ${spicySlider.value} (${spicyLevels[spicySlider.value]})%0A- *Metode Bayar:* ${document.getElementById('paymentMethod').value || '-'}%0A- *Total Harga:* Rp ${totalPrice.toLocaleString()}%0A%0A*Catatan:* ${document.getElementById('orderNotes').value || '-'}%0A%0A*Nama:* ${name}%0A*WhatsApp:* ${document.getElementById('custPhone').value || '-'}%0A%0ATolong diproses ya! 🙏`;
        
        const whatsappUrl = `https://wa.me/6281234567890?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    function showToast(message, type) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }

    // Initialize
    fetchMenu();
    fetchToppings();
});
