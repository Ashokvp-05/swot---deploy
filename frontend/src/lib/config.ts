export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
    (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:4000/api` : "http://127.0.0.1:4000/api");
