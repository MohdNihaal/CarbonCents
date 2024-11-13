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
const googleLogout = document.getElementById('google-logout-btn');
const increasePointsBtn = document.getElementById('increase-points-btn');
const userInfoDiv = document.getElementById('user-info');

// Function to initialize user data in Firestore
async function initializeUserData(user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    // If user document doesn't exist, create it with initial points
    if (!userDoc.exists()) {
        await setDoc(userRef, {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            points: 0  // Initialize points to 0
        });
        console.log("User data initialized with points.");
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

// Function to get and display user points from Firestore
async function displayUserPoints(user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
        const points = userDoc.data().points;
        userInfoDiv.innerHTML = `
            <p>Welcome, ${user.displayName}!</p>
            <img src="${user.photoURL}" alt="User Photo" width="50">
            <h3>Points: ${points}</h3>
        `;
    } else {
        console.error("User data not found.");
    }
}

// Function to handle Google sign-in
googleLogin.addEventListener('click', function () {
    googleLogin.disabled = true;
    googleLogout.disabled = false;

    signInWithPopup(auth, provider)
        .then(async (result) => {
            const user = result.user;
            console.log('User Info:', user);
            await initializeUserData(user);  // Initialize user data if new
            await displayUserPoints(user); // Display user points after login
            increasePointsBtn.disabled = false; // Enable the Increase Points button after login
        })
        .catch((error) => {
            googleLogin.disabled = false;
            console.error("Error signing in:", error.message);
            alert('Failed to sign in with Google');
        });
});

// Function to handle sign-out
googleLogout.addEventListener('click', function () {
    signOut(auth)
        .then(() => {
            console.log('User signed out successfully');
            userInfoDiv.innerHTML = '';
            googleLogin.disabled = false;
            googleLogout.disabled = true;
            increasePointsBtn.disabled = true; // Disable the Increase Points button on logout
        })
        .catch((error) => {
            console.error("Error signing out:", error.message);
            alert('Failed to sign out');
        });
});

// Check if the user is already signed in and update the UI accordingly
auth.onAuthStateChanged((user) => {
    if (user) {
        initializeUserData(user);  // Ensure user data is initialized
        displayUserPoints(user);   // Display the points for the user
        googleLogin.disabled = true;
        googleLogout.disabled = false;
        increasePointsBtn.disabled = false; // Enable the Increase Points button
    } else {
        userInfoDiv.innerHTML = '';
        googleLogin.disabled = false;
        googleLogout.disabled = true;
        increasePointsBtn.disabled = true; // Disable the Increase Points button when not logged in
    }
});

// Example of adding points (you can call this function wherever needed in your app)
increasePointsBtn.addEventListener('click', async function () {
    const user = auth.currentUser; // Get the current signed-in user
    if (user) {
        await updatePoints(user, 10);  // Adds 10 points to the user's account
        await displayUserPoints(user); // Refresh the points display after adding points
    } else {
        alert("Please log in to increase points.");
    }
});
