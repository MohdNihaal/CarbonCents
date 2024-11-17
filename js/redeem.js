// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// Firebase Configuration
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
console.log("Initializing Firebase...");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("Firebase Initialized.");

// Leaderboard Functionality
async function fetchLeaderboard() {
    console.log("Fetching leaderboard data...");
    try {
        const leaderboardRef = collection(db, "users");
        const q = query(leaderboardRef, orderBy("points", "desc"), limit(3));
        const querySnapshot = await getDocs(q);

        console.log("Query executed successfully. Snapshot size:", querySnapshot.size);

        if (querySnapshot.empty) {
            console.warn("No data found for leaderboard.");
        } else {
            console.log("Processing leaderboard data...");
            const leaderboard = [];
            querySnapshot.forEach((doc) => {
                console.log("Document data:", doc.data());
                leaderboard.push({
                    name: doc.data().name || "Unknown",
                    points: doc.data().points || 0,
                });
            });

            console.log("Leaderboard Data:", leaderboard);
            displayLeaderboard(leaderboard);
        }
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
    }
}

// Display leaderboard
// Display leaderboard in separate lists
function displayLeaderboard(leaderboard) {
    console.log("Displaying leaderboard data...");
    
    // Clear previous lists
    const rankList = document.getElementById("leaderboard-rank");
    const nameList = document.getElementById("leaderboard-name");
    const pointsList = document.getElementById("leaderboard-points");

    if (!rankList || !nameList || !pointsList) {
        console.error('One or more leaderboard list elements not found in DOM.');
        return;
    }

    rankList.innerHTML = "";
    nameList.innerHTML = "";
    pointsList.innerHTML = "";

    // Loop through the leaderboard data and create list items
    leaderboard.forEach((user, index) => {
        const rankItem = document.createElement("li");
        const nameItem = document.createElement("li");
        const pointsItem = document.createElement("li");

        rankItem.textContent = `${index + 1}`;
        nameItem.textContent = `${user.name}`;
        pointsItem.textContent = `${user.points}`;

        rankList.appendChild(rankItem);
        nameList.appendChild(nameItem);
        pointsList.appendChild(pointsItem);
    });
}


// Check for logged-in user and fetch leaderboard
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user.email);
        fetchLeaderboard();
    } else {
        console.warn("No user is logged in.");
    }
});
