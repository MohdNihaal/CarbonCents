import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDS3dtPGlpB0UTurWP-h5qWQJ6MyWPHb6o",
    authDomain: "carboncents-af7fa.firebaseapp.com",
    projectId: "carboncents-af7fa",
    storageBucket: "carboncents-af7fa.firebasestorage.app",
    messagingSenderId: "64603666118",
    appId: "1:64603666118:web:8af4145ce9beabbad8c9c7",
    measurementId: "G-0SYHGXCJ1E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Force account selection by adding 'prompt' parameter
provider.setCustomParameters({
    prompt: 'select_account'
});

// Get the login, logout, and increase points button elements
const googleLogin = document.getElementById('google-login-btn');

// Function to initialize user data in Firestore
async function initializeUserData(user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    // If user document doesn't exist, create it with initial points and wasteDeposited field
    if (!userDoc.exists()) {
        await setDoc(userRef, {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            points: 0,  // Initialize points to 0
            wasteDeposited: 0  // Initialize wasteDeposited to 0
        });
        console.log("User data initialized with points and waste deposited.");
    }
}

// Function to update user points
async function updatePoints(user, pointsToAdd) {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
        points: increment(pointsToAdd)  // Increment points by specified amount
    });
    console.log(`${pointsToAdd} points added to user account.`);
}

// Function to handle Google sign-in
googleLogin.addEventListener('click', function () {

    signInWithPopup(auth, provider)
        .then(async (result) => {
            const user = result.user;
            console.log('User Info:', user);
            await initializeUserData(user);  // Initialize user data if new
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            googleLogin.disabled = false;
            console.error("Error signing in:", error.message);
            alert('Failed to sign in with Google');
        });
});

// Example: After sign-in, redirect to dashboard with user data
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User logged in:", user); // Debugging statement

        // Initialize user data if it's missing
        await initializeUserData(user);
        
        // You can fetch and display user data here (e.g., points, wasteDeposited)
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const points = userDoc.data().points || 0;  // Default to 0 if no points
            const wasteDeposited = userDoc.data().wasteDeposited || 0;  // Default to 0 if no waste deposited

            // Display points and waste deposited on the dashboard
            document.getElementById('user-points').textContent = `Points: ${points}`;
            document.getElementById('user-waste-count').textContent = `Waste Deposited: ${wasteDeposited}`;
        } else {
            console.warn("No user document found.");
        }
    } else {
        console.log("User not authenticated. Redirecting to login.");
        window.location.href = "login.html";  // Redirect to login if not authenticated
    }
});

// Logout functionality
const logoutLink = document.getElementById('logout-link');
logoutLink.addEventListener('click', (event) => {
    event.preventDefault();
    signOut(auth)
        .then(() => {
            console.log("User logged out.");
            window.location.href = "login.html";  // Redirect to login page
        })
        .catch((error) => {
            console.error("Error logging out:", error);
        });
});