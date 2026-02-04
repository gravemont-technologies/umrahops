import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";


// Surgical Fetch Interceptor for Split Hosting
const originalFetch = window.fetch;
window.fetch = async (input, init) => {
    if (typeof input === 'string' && input.startsWith('/api') && import.meta.env.VITE_API_BASE_URL) {
        const cleanBase = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
        return originalFetch(`${cleanBase}${input}`, init);
    }
    return originalFetch(input, init);
};

createRoot(document.getElementById("root")!).render(<App />);
