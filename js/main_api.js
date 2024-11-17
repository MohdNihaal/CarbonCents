let countInterval;
let v4Interval;
let countValues = []; // Array to store all count values
let stopChecking = false; // Flag to stop checking count

// Function to update button state via API
function updateButtonV2() {
    fetch('https://blynk.cloud/external/api/update?token=CSsP2GNfjZDFUWD9oPUVALABu4Vn3cgx&V2=1')
        .then(response => response.json())
        .then(data => {
            console.log("V2 updated", data);
        });
}

function updateButtonV5(value) {
    fetch(`https://blynk.cloud/external/api/update?token=CSsP2GNfjZDFUWD9oPUVALABu4Vn3cgx&V5=${value}`)
        .then(response => response.json())
        .then(data => {
            console.log("V5 updated to", value, data);
        })
        .catch(error => console.error("Error updating V5:", error));
}

// Function to get count and update if it changes
function checkCount() {
    if (!stopChecking) {
        fetch('https://blynk.cloud/external/api/get?token=CSsP2GNfjZDFUWD9oPUVALABu4Vn3cgx&V1')
            .then(response => response.json())
            .then(data => {
                console.log("Count Response Data:", data);

                if (data && data.V1 !== undefined) {
                    const currentCount = parseInt(data.V1, 10);
                    console.log("Current Count:", currentCount);

                    // Store the count value
                    if (countValues.length < 10) {
                        countValues.push(currentCount);
                    }

                    // Update DOM
                    document.getElementById("count").innerText = `Count: ${currentCount}`;
                } else {
                    console.log("Count value is undefined or not available in the response");
                }
            })
            .catch(error => console.error("Error fetching count:", error));
    }
}

// Function to fetch V4 value and update the DOM
const url = "https://blynk.cloud/external/api/get?token=CSsP2GNfjZDFUWD9oPUVALABu4Vn3cgx&V4";

async function updateData() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.text();
        document.getElementById("v4Value").textContent = `AQI index: ${data}`;
        console.log("V4 Value:", data);
    } catch (error) {
        console.error("Error fetching V4 data:", error);
        document.getElementById("v4Value").textContent = "Error fetching V4 data";
    }
}

// Start monitoring both V4 and count every second
function startMonitoring() {
    document.getElementById("count").innerText = "Loading...";
    document.getElementById("v4Value").innerText = "Loading...";

    countInterval = setInterval(checkCount, 1000);
    v4Interval = setInterval(updateData, 1000);

    setTimeout(() => {
        stopChecking = true;
        clearInterval(countInterval);
        clearInterval(v4Interval);
        updateButtonV5(0);
        console.log("Stopped checking count after 10 seconds, V5 set to 0");

        // Determine the largest count
        if (countValues.length > 0) {
            const largestCount = Math.max(...countValues);
            document.getElementById("count").innerText = `Largest Count: ${largestCount}`;
            console.log("All Count Values:", countValues);
            console.log("Largest Count:", largestCount);
        } else {
            document.getElementById("count").innerText = "No count data available";
        }
    }, 10000);
}

updateButtonV2();
updateButtonV5(1);
startMonitoring();
