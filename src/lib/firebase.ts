import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import bundledAppletConfig from '../../firebase-applet-config.json';

// Static fallback credentials for production deployment on GitHub Pages
const DEFAULT_FIREBASE_CONFIG = {
  projectId: 'gen-lang-client-0529394373',
  appId: '1:931926308811:web:156f5d2c1ccb87f9ece84e',
  apiKey: 'AIzaSyAHYy44kSelXHBy4G6Y0gme2cdHnxK_2sk',
  authDomain: 'gen-lang-client-0529394373.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-dmssolution-a77c3d71-e4d1-4e10-9aeb-cc28d9a9d76b',
  storageBucket: 'gen-lang-client-0529394373.firebasestorage.app',
  messagingSenderId: '931926308811',
  measurementId: '',
  oAuthClientId: '931926308811-nmsah6goq0vqos28p7logvnl1k01am6p.apps.googleusercontent.com',
  recaptchaSiteKey: '',
};

export interface FirebaseWebConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
}

/**
 * Resolve the real Firebase web configuration.
 * Order of priority:
 * 1. Client environment variables (VITE_FIREBASE_* or FIREBASE_*)
 * 2. Bundled firebase-applet-config.json
 * 3. Default production web configuration constants
 * NOTE: Preview-only variables like `window.__FIREBASE__` are strictly avoided.
 */
function resolveFirebaseConfig(): FirebaseWebConfig {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {} as Record<string, string>;

  const config: FirebaseWebConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY || bundledAppletConfig?.apiKey || DEFAULT_FIREBASE_CONFIG.apiKey,
    projectId: env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID || bundledAppletConfig?.projectId || DEFAULT_FIREBASE_CONFIG.projectId,
    appId: env.VITE_FIREBASE_APP_ID || env.FIREBASE_APP_ID || bundledAppletConfig?.appId || DEFAULT_FIREBASE_CONFIG.appId,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.FIREBASE_AUTH_DOMAIN || bundledAppletConfig?.authDomain || DEFAULT_FIREBASE_CONFIG.authDomain,
    firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || env.FIREBASE_FIRESTORE_DATABASE_ID || bundledAppletConfig?.firestoreDatabaseId || DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET || bundledAppletConfig?.storageBucket || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.FIREBASE_MESSAGING_SENDER_ID || bundledAppletConfig?.messagingSenderId || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    measurementId: bundledAppletConfig?.measurementId || DEFAULT_FIREBASE_CONFIG.measurementId,
    oAuthClientId: bundledAppletConfig?.oAuthClientId || DEFAULT_FIREBASE_CONFIG.oAuthClientId,
    recaptchaSiteKey: bundledAppletConfig?.recaptchaSiteKey || DEFAULT_FIREBASE_CONFIG.recaptchaSiteKey,
  };

  return config;
}

export const firebaseConfig = resolveFirebaseConfig();
export default firebaseConfig;

// Safe runtime initialization tracking
let appInstance: FirebaseApp;
let dbInstance: Firestore;
let authInstance: Auth;
let storageInstance: FirebaseStorage;
let initError: Error | null = null;
let isInitialized = false;

try {
  if (getApps().length > 0) {
    appInstance = getApp();
  } else {
    appInstance = initializeApp(firebaseConfig);
  }

  // Initialize Firestore with specific database ID if specified
  const customDbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined;

  dbInstance = customDbId ? getFirestore(appInstance, customDbId) : getFirestore(appInstance);
  authInstance = getAuth(appInstance);
  storageInstance = getStorage(appInstance);
  isInitialized = true;
} catch (err) {
  console.error('CRITICAL: Firebase initialization failed:', err);
  initError = err instanceof Error ? err : new Error(String(err));
  
  // Create resilient stubs to prevent top-level module resolution crash
  try {
    appInstance = getApps()[0] || initializeApp({ apiKey: 'placeholder', projectId: 'placeholder', appId: 'placeholder' });
  } catch (e) {
    appInstance = {} as FirebaseApp;
  }
  try {
    dbInstance = getFirestore(appInstance);
  } catch (e) {
    dbInstance = {} as Firestore;
  }
  try {
    authInstance = getAuth(appInstance);
  } catch (e) {
    authInstance = {} as Auth;
  }
  try {
    storageInstance = getStorage(appInstance);
  } catch (e) {
    storageInstance = {} as FirebaseStorage;
  }
}

export const app = appInstance;
export const db = dbInstance;
export const auth = authInstance;
export const storage = storageInstance;
export const firebaseInitError = initError;
export const isFirebaseReady = isInitialized;

/**
 * Ensure Firebase initialization completes before authentication or database access.
 */
export async function ensureFirebaseInitialized(): Promise<boolean> {
  if (initError) {
    throw new Error(`Firebase failed to initialize: ${initError.message}`);
  }
  return isFirebaseReady;
}

// Helper to upload files to Firebase Storage with fallback
export async function uploadFileToStorage(
  file: File,
  path: string
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (err) {
    console.warn('Firebase Storage upload failed, falling back to base64 data URL:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Helper to strip undefined values so Firestore setDoc/updateDoc never fails
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (Array.isArray(val)) {
        clean[key] = val.map((item) =>
          item !== null && typeof item === 'object' && !(item instanceof Date)
            ? sanitizeForFirestore(item)
            : item
        );
      } else if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
        clean[key] = sanitizeForFirestore(val);
      } else {
        clean[key] = val;
      }
    }
  }
  return clean as T;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validation connection test as required by skill guidelines
export async function testConnection(): Promise<boolean> {
  try {
    if (!db || !isFirebaseReady) return false;
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Client is offline or checking connection.");
      return false;
    }
    // Any other permission or not-found status means the server is reachable
    return true;
  }
}
