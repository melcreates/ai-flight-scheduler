const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const pool = require('./config/db');

const app = express();

/* -------------------- CORS -------------------- */
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json());

// ✅ Parse cookies
app.use(cookieParser());

/* -------------------- ROUTES -------------------- */
app.get('/', (req, res) => res.send('API is running'));

app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'OK', db_time: result.rows[0].now });
    } catch (err) {
        res.status(500).json({ error: 'DB connection failed' });
    }
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/completed', require('./routes/completedSessions'));
app.use('/api/availability', require('./routes/instructorAvailability'));
app.use('/api/requests', require('./routes/flightRequests'));
app.use('/api/fsi', require('./routes/fsiRoutes'));

/* -------------------- SOCKET.IO -------------------- */
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
});



io.on('connection', socket => {
    console.log('🟢 Client connected:', socket.id);

    socket.on('join-instructor', (instructorId) => {
        socket.join(`instructor-${instructorId}`);
        console.log(`📡 Joined availability-${instructorId}`);
    });

    // Availability-specific updates (requests page)
    socket.on('join-availability', availabilityId => {
        socket.join(`availability-${availabilityId}`);
        console.log(`📡 Joined availability-${availabilityId}`);
    });

    socket.on('disconnect', () => {
        console.log('🔴 Client disconnected:', socket.id);
    });
});

// export io so controllers can use it
module.exports.io = io;

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
    console.log(`🚀 Server running with WebSockets on port ${PORT}`)
);



