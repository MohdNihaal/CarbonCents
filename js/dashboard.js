import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements for profile display
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userPoints = document.getElementById('user-points'); // Element for user points
const userGreeting = document.getElementById('user-greeting'); // New element for user greeting

// Function to animate counting up to the target points value
function animatePoints(targetPoints) {
    console.log("Animating points to:", targetPoints); // Debugging statement
    let currentPoints = 0;
    const interval = setInterval(() => {
        if (currentPoints < targetPoints) {
            currentPoints++;
            userPoints.textContent = currentPoints; // Display only points, no "Points: "
        } else {
            clearInterval(interval); // Stop the animation when target is reached
        }
    }, 10); // Faster animation (decreased interval time)
}

// Initialize user data if points are missing
async function initializeUserData(user) {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    // If the user document doesn't exist or has no points, initialize it
    if (!userDoc.exists()) {
        await setDoc(userRef, {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            points: 0  // Initialize points to 0 if the user doesn't have any
        });
        console.log("User data initialized with points.");
    } else {
        // If points exist but are undefined, set them to 0
        if (userDoc.data().points === undefined) {
            await setDoc(userRef, { points: 0 }, { merge: true });
            console.log("Points initialized to 0.");
        }
    }
}

// Function to extract the first name from the full name
function getFirstName(fullName) {
    return fullName.split(' ')[0]; // Splits the full name and returns the first part (first name)
}

// Check for user login status and display profile information
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User logged in:", user); // Debugging statement

        // User is logged in, display their profile information
        userPhoto.src = user.photoURL || 'default-avatar.png';
        userName.textContent = user.displayName; // Full name
        userEmail.textContent = user.email;

        // Update greeting with the first name only
        const firstName = getFirstName(user.displayName); // Extract first name
        userGreeting.textContent = `Let's make a difference together, ${firstName}!`;

        // Initialize user data if it's missing points or other data
        await initializeUserData(user);

        // Fetch user points from Firestore
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const points = userDoc.data().points || 0; // Default to 0 if no points
            console.log("User points:", points); // Debugging statement
            
            // If points are not 0, animate them, otherwise display without animation
            if (points > 0) {
                animatePoints(points);
            } else {
                userPoints.textContent = points; // Just display points if 0
            }
        } else {
            console.warn("No user document found."); // Debugging statement
            userPoints.textContent = "0"; // Display 0 if user document is not found
        }
    } else {
        console.log("User not authenticated. Redirecting to login."); // Debugging statement
        window.location.href = "login.html"; // Redirect to login if not authenticated
    }
});

// Logout link
const logoutLink = document.getElementById('logout-link');
logoutLink.addEventListener('click', (event) => {
    event.preventDefault();
    signOut(auth)
        .then(() => {
            console.log("User logged out.");
            window.location.href = "login.html";
        })
        .catch((error) => {
            console.error("Error logging out:", error);
        });
});
