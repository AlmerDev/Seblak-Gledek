const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve images from images directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// In-memory storage for reservations/orders
let reservations = [];
let nextReservationId = 1;
let messages = [];
let orders = [];
let nextOrderId = 1;

// API Routes

// GET menu items
// GET menu items
app.get('/api/menu', (req, res) => {
  const menuItems = [
    {
      id: 1,
      name: 'Seblak Basah',
      description: 'Seblak kuah pedas gurih dengan pilihan topping melimpah. Kerupuk kenyal, bakso, ceker, dan sayuran segar.',
      price: 15000,
      image: '/images/Menu 1.png',
      category: 'Seblak Basah',
      spicyLevel: 3
    },
    {
      id: 2,
      name: 'Seblak Kuah Spesial',
      description: 'Seblak kuah merah pedas dengan topping premium. Udang, cumi, siomay, dan makaroni dalam kuah rempah khas.',
      price: 20000,
      image: '/images/Menu 2.png',
      category: 'Seblak Spesial',
      spicyLevel: 4
    },
    {
      id: 3,
      name: 'Seblak Goreng Krispy',
      description: 'Seblak goreng renyah dengan bumbu pedas kering. Topping crispy, sayuran, dan perasan jeruk nipis segar.',
      price: 18000,
      image: '/images/Menu 3.png',
      category: 'Seblak Goreng',
      spicyLevel: 3
    }
  ];
  res.json({ success: true, data: menuItems });
});

// GET toppings
app.get('/api/toppings', (req, res) => {
  const toppings = [
    { id: 1, name: 'Ceker Ayam', price: 3000, icon: '🍗' },
    { id: 2, name: 'Bakso Sapi', price: 3000, icon: '🥩' },
    { id: 3, name: 'Udang', price: 5000, icon: '🦐' },
    { id: 4, name: 'Cumi-cumi', price: 5000, icon: '🦑' },
    { id: 5, name: 'Telur', price: 3000, icon: '🥚' },
    { id: 6, name: 'Siomay', price: 2000, icon: '🥟' },
    { id: 7, name: 'Makaroni', price: 2000, icon: '🍝' },
    { id: 8, name: 'Keju', price: 4000, icon: '🧀' },
    { id: 9, name: 'Sosis', price: 3000, icon: '🌭' },
    { id: 10, name: 'Jamur', price: 3000, icon: '🍄' },
    { id: 11, name: 'Pangsit', price: 2000, icon: '🥠' },
    { id: 12, name: 'Kerupuk', price: 1000, icon: '🫓' }
  ];
  res.json({ success: true, data: toppings });
});


// POST reservation
app.post('/api/reservation', (req, res) => {
  const { name, phone, date, time, guests, notes } = req.body;

  if (!name || !phone || !date || !time || !guests) {
    return res.status(400).json({
      success: false,
      message: 'Semua field wajib diisi!'
    });
  }

  const reservation = {
    id: nextReservationId++,
    name,
    phone,
    date,
    time,
    guests: parseInt(guests),
    notes: notes || '',
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  reservations.push(reservation);
  console.log('New reservation:', reservation);

  res.json({
    success: true,
    message: `Reservasi berhasil! Selamat datang ${name}, kami tunggu pada ${date} pukul ${time}.`,
    data: reservation
  });
});

// POST contact message
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Semua field wajib diisi!'
    });
  }

  const msg = {
    id: messages.length + 1,
    name,
    email,
    message,
    createdAt: new Date().toISOString()
  };

  messages.push(msg);

  console.log('New message:', msg);

  res.json({
    success: true,
    message: 'Pesan berhasil dikirim! Kami akan segera menghubungi Anda.'
  });
});

// ORDERS API

// GET all orders (admin)
app.get('/api/orders', (req, res) => {
  res.json({ success: true, data: orders });
});

// POST new order
app.post('/api/orders', (req, res) => {
  const { 
    customerName, 
    customerPhone, 
    seblakType, 
    toppings, 
    spicyLevel, 
    paymentMethod, 
    totalPrice,
    notes 
  } = req.body;

  if (!customerName || !customerPhone || !seblakType || !totalPrice) {
    return res.status(400).json({
      success: false,
      message: 'Data pesanan tidak lengkap!'
    });
  }

  const order = {
    id: nextOrderId++,
    customerName,
    customerPhone,
    seblakType,
    toppings: toppings || [],
    spicyLevel: spicyLevel || 1,
    paymentMethod,
    totalPrice: parseInt(totalPrice),
    notes: notes || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  console.log('New order received:', order);

  res.json({
    success: true,
    message: 'Pesanan berhasil dibuat!',
    data: order
  });
});

// PATCH update order status
app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = orders.find(o => o.id === parseInt(id));
  if (!order) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  }

  if (status) {
    order.status = status;
  }

  res.json({ success: true, message: 'Status pesanan diperbarui', data: order });
});

// DELETE order
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = orders.length;
  orders = orders.filter(o => o.id !== parseInt(id));

  if (orders.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  }

  res.json({ success: true, message: 'Pesanan berhasil dihapus' });
});

// GET reservations (admin)
app.get('/api/reservations', (req, res) => {
  res.json({ success: true, data: reservations });
});

// PATCH update reservation status
app.patch('/api/reservation/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log(`PATCH /api/reservation/${id} with status: ${status}`);

  const reservation = reservations.find(r => r.id === parseInt(id));
  if (!reservation) {
    console.log(`Reservation ID ${id} not found`);
    return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });
  }

  if (status) {
    reservation.status = status;
  }

  console.log(`Status updated for ID ${id}`);
  res.json({ success: true, message: 'Status berhasil diperbarui', data: reservation });
});

// DELETE reservation
app.delete('/api/reservation/:id', (req, res) => {
  const { id } = req.params;
  console.log(`DELETE /api/reservation/${id}`);

  const initialLength = reservations.length;
  reservations = reservations.filter(r => r.id !== parseInt(id));

  if (reservations.length === initialLength) {
    console.log(`Reservation ID ${id} not found for deletion`);
    return res.status(404).json({ success: false, message: 'Reservasi tidak ditemukan' });
  }

  console.log(`Reservation ID ${id} deleted`);
  res.json({ success: true, message: 'Reservasi berhasil dihapus' });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🔥 Seblak Gledek Server berjalan di http://localhost:${PORT}`);
  console.log(`📍 Buka browser dan akses http://localhost:${PORT}`);
});

// Global Error Handling to keep server running
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
