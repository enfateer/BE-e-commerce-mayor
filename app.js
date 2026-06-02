require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const baseConfig = require('./config/base.config');
const routes = require('./routes');
const { response } = require('./helpers/response.formatter');

const app = express();

// ─── Middleware ────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request Logging ─────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Static Files (uploads) ──────────────────────────
const uploadDirs = ['uploads/profile', 'uploads/services', 'uploads/projects'];
uploadDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});
// Uploads harus bisa diakses dari /api/uploads supaya sesuai frontend
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ─── API Routes ───────────────────────────────────────
app.use('/api', routes);

// ─── Welcome Route ────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json(response(200, `Welcome to ${baseConfig.app.name} API`));
});

// ─── 404 Handler ──────────────────────────────────────
app.use((req, res) => {
  return res.status(404).json(response(404, 'Route not found'));
});

// ─── Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  return res.status(500).json(response(500, 'server error', err.message || 'Internal Server Error'));
});

// ─── Start Server ─────────────────────────────────────
const PORT = baseConfig.app.port;
app.listen(PORT, () => {
  console.log(`Database Terhubung`);
});

module.exports = app;
