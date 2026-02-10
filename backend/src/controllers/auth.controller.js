const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { signToken } = require('../../utils/jwt');

const me = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, role FROM users WHERE id = $1',
            [req.user.id]
        );

        if (!result.rowCount) {
            return res.status(401).json({ user: null });
        }

        res.json({ user: result.rows[0] });
    } catch (err) {
        console.error('ME ERROR:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, role`,
        [name, email, hash, role]
    );

    const user = result.rows[0];

    const token = signToken(user);

    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false // true in prod
    });

    res.json({ user });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    // 1. Find user in DB
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    if (!user.rowCount) return res.status(401).json({ error: 'Invalid credentials' });

    // 2. Check password
    const valid = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // 3. Generate JWT
    const token = signToken(
        { id: user.rows[0].id, role: user.rows[0].role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    // 4. Set cookie
    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax', // or 'none' if HTTPS
        secure: process.env.NODE_ENV === 'production',
    });

    // 5. Send response
    res.json({ user: { id: user.rows[0].id, name: user.rows[0].name, role: user.rows[0].role } });
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
};

module.exports = { register, login, me, logout };
