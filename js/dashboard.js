import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDS3dtPGlpB0UTurWP-h5qWQJ6MyWPHb6o",
    authDomain: "carboncents-af7fa.firebaseapp.com",
    projectId: "carboncents-af7fa",
    storageBucket: "carboncents-af7fa.appspot.com",
    messagingSenderId: "64603666118",
    appId: "1:64603666118:web:8af4145ce9beabbad8c9c7",
    measurementId: "G-0SYHGXCJ1E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// DOM elements for profile display
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');

// Check for user login status and display profile information
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in, display their profile information
        userPhoto.src = user.photoURL || 'default-avatar.png'; // Fallback if no photoURL
        userName.textContent = user.displayName;
        userEmail.textContent = user.email;
    } else {
        // No user is logged in, redirect to login page
        window.location.href = "login.html";
    }
});

// Logout link
const logoutLink = document.getElementById('logout-link');

// Event listener for logout
logoutLink.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default link behavior
    signOut(auth)
        .then(() => {
            console.log("User logged out.");
            window.location.href = "login.html"; // Redirect to login page after logging out
        })
        .catch((error) => {
            console.error("Error logging out:", error);
        });
});
