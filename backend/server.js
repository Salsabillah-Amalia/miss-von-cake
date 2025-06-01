const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));
// Data storage (dalam production sebaiknya gunakan database)
let orders = [];
let products = [
    {
        id: 1,
        name: 'Strawberry Chiffon Cake',
        price: 25000,
        image: 'images/strawberry-chiffon-cake.jpg',
        description: 'Kue chiffon lembut dengan topping strawberry segar dan whipped cream',
        category: 'bestseller',
        stock: 50
    },
    {
        id: 2,
        name: 'Lotus Biscoff Cheesecake',
        price: 28000,
        image: 'images/lotus-biscoff-cheesecake.jpg',
        description: 'Cheesecake creamy dengan crumble lotus biscoff yang renyah',
        category: 'bestseller',
        stock: 30
    },
    {
        id: 3,
        name: 'Whoopie Pie Chocolate',
        price: 20000,
        image: 'images/whoopie-pie-chocolate.jpg',
        description: 'Kue sandwich coklat dengan filling cream cheese yang lembut',
        category: 'bestseller',
        stock: 40
    },
    {
        id: 4,
        name: 'Strawberry Shortcake',
        price: 60000,
        image: 'images/strawberry-shortcake.jpg',
        description: 'Kue spons lembut berlapis whipped cream dan strawberry segar',
        category: 'all',
        stock: 20
    },
    {
        id: 5,
        name: 'Chocolate Cupcake',
        price: 30000,
        image: 'images/chocolate-cupcake.jpg',
        description: 'Cupcake coklat dengan frosting buttercream dan topping cherry',
        category: 'all',
        stock: 35
    },
    {
        id: 6,
        name: 'Choco Sponge Cake',
        price: 40000,
        image: 'images/choco-sponge-cake.jpg',
        description: 'Kue spons coklat dengan lapisan cream dan hiasan buah',
        category: 'all',
        stock: 25
    },
    {
        id: 7,
        name: 'Rainbow Macaron',
        price: 30000,
        image: 'images/rainbow-macaron.jpg',
        description: 'Set macaron warna-warni dengan berbagai rasa dalam satu box',
        category: 'all',
        stock: 45
    },
    {
        id: 8,
        name: 'Matcha Berry Shortcake',
        price: 30000,
        image: 'images/matcha-berry-shortcake.jpg',
        description: 'Perpaduan matcha dan berry dalam kue yang menyegarkan',
        category: 'all',
        stock: 30
    },
    {
        id: 9,
        name: 'Lovely Cookies',
        price: 20000,
        image: 'images/lovely-cookies.jpg',
        description: 'Cookies manis dengan bentuk hati dan dekorasi yang menggemaskan',
        category: 'all',
        stock: 60
    },
    {
        id: 10,
        name: 'Pudding Caramel',
        price: 15000,
        image: 'images/pudding-caramel.jpg',
        description: 'Pudding lembut dengan saus caramel yang manis',
        category: 'all',
        stock: 40
    },
    {
        id: 11,
        name: 'Mixed Donuts',
        price: 50000,
        image: 'images/mixed-donuts.jpg',
        description: 'Paket donut dengan berbagai topping dan rasa dalam satu box',
        category: 'all',
        stock: 15
    }
];

// Routes

// GET - Ambil semua produk
app.get('/api/products', (req, res) => {
    try {
        const { category } = req.query;
        let filteredProducts = products;
        
        if (category && category !== 'all') {
            filteredProducts = products.filter(product => product.category === category);
        }
        
        res.json({
            success: true,
            data: filteredProducts,
            message: 'Produk berhasil diambil'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil produk',
            error: error.message
        });
    }
});

// GET - Ambil produk berdasarkan ID
app.get('/api/products/:id', (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            data: product,
            message: 'Produk berhasil diambil'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil produk',
            error: error.message
        });
    }
});

// POST - Buat pesanan baru
app.post('/api/orders', (req, res) => {
    try {
        const { tableNumber, items } = req.body;
        
        // Validasi input
        if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Nomor meja dan items pesanan wajib diisi'
            });
        }
        
        // Validasi dan hitung total
        let totalPrice = 0;
        const orderItems = [];
        
        for (const item of items) {
            const product = products.find(p => p.id === item.productId);
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Produk dengan ID ${item.productId} tidak ditemukan`
                });
            }
            
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Stok ${product.name} tidak mencukupi. Tersedia: ${product.stock}`
                });
            }
            
            const itemTotal = product.price * item.quantity;
            totalPrice += itemTotal;
            
            orderItems.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                subtotal: itemTotal
            });
            
            // Update stok
            product.stock -= item.quantity;
        }
        
        // Buat pesanan baru
        const newOrder = {
            id: orders.length + 1,
            tableNumber: tableNumber,
            items: orderItems,
            totalPrice: totalPrice,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        orders.push(newOrder);
        
        res.status(201).json({
            success: true,
            data: newOrder,
            message: 'Pesanan berhasil dibuat'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal membuat pesanan',
            error: error.message
        });
    }
});

// GET - Ambil semua pesanan
app.get('/api/orders', (req, res) => {
    try {
        const { status, tableNumber } = req.query;
        let filteredOrders = orders;
        
        if (status) {
            filteredOrders = filteredOrders.filter(order => order.status === status);
        }
        
        if (tableNumber) {
            filteredOrders = filteredOrders.filter(order => order.tableNumber === tableNumber);
        }
        
        res.json({
            success: true,
            data: filteredOrders,
            message: 'Pesanan berhasil diambil'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil pesanan',
            error: error.message
        });
    }
});

// GET - Ambil pesanan berdasarkan ID
app.get('/api/orders/:id', (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Pesanan tidak ditemukan'
            });
        }
        
        res.json({
            success: true,
            data: order,
            message: 'Pesanan berhasil diambil'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil pesanan',
            error: error.message
        });
    }
});

// PUT - Update status pesanan
app.put('/api/orders/:id/status', (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;
        
        const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
        
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status tidak valid. Gunakan: ' + validStatuses.join(', ')
            });
        }
        
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Pesanan tidak ditemukan'
            });
        }
        
        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();
        
        res.json({
            success: true,
            data: orders[orderIndex],
            message: 'Status pesanan berhasil diupdate'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate status pesanan',
            error: error.message
        });
    }
});

// DELETE - Hapus pesanan
app.delete('/api/orders/:id', (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Pesanan tidak ditemukan'
            });
        }
        
        const deletedOrder = orders.splice(orderIndex, 1)[0];
        
        res.json({
            success: true,
            data: deletedOrder,
            message: 'Pesanan berhasil dihapus'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus pesanan',
            error: error.message
        });
    }
});

// GET - Dashboard statistics
app.get('/api/dashboard/stats', (req, res) => {
    try {
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const completedOrders = orders.filter(order => order.status === 'delivered').length;
        
        const stats = {
            totalOrders,
            totalRevenue,
            pendingOrders,
            completedOrders,
            averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
        };
        
        res.json({
            success: true,
            data: stats,
            message: 'Statistik berhasil diambil'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil statistik',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📱 Frontend tersedia di http://localhost:${PORT}`);
    console.log(`🔗 API endpoints tersedia di http://localhost:${PORT}/api`);
});

module.exports = app;