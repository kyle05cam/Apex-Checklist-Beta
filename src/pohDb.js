// ─────────────────────────────────────────────────────────────────────────────
// POH DATABASE — IndexedDB layer for aircraft profile persistence
// Replaces localStorage for profile storage. Falls back gracefully to
// localStorage if IndexedDB is unavailable.
// ─────────────────────────────────────────────────────────────────────────────

const DB_NAME    = "ApexKneeboard";
const DB_VERSION = 1;
const STORE_NAME = "profiles";
const PROFILE_KEY = "primary";

let _db = null;

function openDb() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror   = () => reject(req.error);
  });
}

export async function saveProfile(profile) {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req   = store.put(profile, PROFILE_KEY);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  } catch {
    // IndexedDB unavailable — fall back to localStorage
    try { localStorage.setItem("apex_kneeboard_profile", JSON.stringify(profile)); } catch {}
  }
}

export async function loadProfile() {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req   = store.get(PROFILE_KEY);
      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result);
        } else {
          // Nothing in IndexedDB — try migrating from localStorage
          try {
            const ls = localStorage.getItem("apex_kneeboard_profile");
            resolve(ls ? JSON.parse(ls) : null);
          } catch {
            resolve(null);
          }
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    try {
      const ls = localStorage.getItem("apex_kneeboard_profile");
      return ls ? JSON.parse(ls) : null;
    } catch {
      return null;
    }
  }
}
