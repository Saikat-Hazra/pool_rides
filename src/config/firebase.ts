import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'mock_key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mock_domain',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mock_project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mock_bucket',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'mock_sender',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'mock_app_id',
}

// We wrap initialization in a try/catch just in case Firebase throws on totally invalid keys
let app;
let auth: any;
let googleProvider: GoogleAuthProvider | null = null;

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
} catch (err) {
  console.warn('Firebase init warning:', err)
}

/**
 * Executes a Google Sign-In popup. 
 * If no real API keys are detected, it safely falls back to a visual mock 
 * so you can test the college domain routing logic without breaking the app.
 */
export async function getGoogleUser() {
  if (firebaseConfig.apiKey !== 'mock_key' && auth && googleProvider) {
    // ─── Real Firebase OAuth Flow ───
    const result = await signInWithPopup(auth, googleProvider)
    return {
      name: result.user.displayName || 'Google User',
      email: result.user.email || '',
    }
  } else {
    // ─── Mock Flow (No API Keys yet) ───
    return new Promise<{ name: string; email: string }>((resolve, reject) => {
      setTimeout(() => {
        const email = window.prompt(
          'Simulate Google Popup (No API keys provided yet).\n\nEnter an email domain to test college detection:\n(Valid domains: @rvce.edu.in, @pes.edu, @scaler.com, etc)', 
          'demo_student@pes.edu'
        )
        if (!email) return reject(new Error('Google Sign-In Cancelled by User'))
        
        const namePart = email.split('@')[0]
        const name = namePart.charAt(0).toUpperCase() + namePart.slice(1) // Capitalize first letter
        resolve({ name: `${name} (Google SSO)`, email })
      }, 300)
    })
  }
}
