// Central API base URL - reads from Vite env var in production, falls back to localhost for dev
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
export default API_BASE;
