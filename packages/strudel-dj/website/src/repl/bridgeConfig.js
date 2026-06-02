// Centralized bridge URL config — single source of truth for vital-bridge connection.
// In production, set the VITE_BRIDGE_URL environment variable at build time.
// In local dev, defaults to localhost:8765.

const BRIDGE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BRIDGE_URL)
  || 'http://localhost:8765';

export default BRIDGE_URL;
