// Firebase imports 
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update, set,} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";


// Firebase configuration
const appSettings = {
  databaseURL:
    "https://we-are-the-champions-48173-default-rtdb.firebaseio.com/",
};


// Initialize Firebase app and get a reference to the database
const app = initializeApp(appSettings);
const database = getDatabase(app);


// Get reference to the 'endorsements' path in the database
const endorsementsInDB = ref(database, "endorsements");


// Grab HTML elements by their ID
const publishButton = document.getElementById("publish-button");
const endorsementEl = document.getElementById("endorsement-text");
const fromEl = document.getElementById("input-from");
const reqField = document.getElementById("required-endorsement");
const toEl = document.getElementById("input-to");
const endorsementBoxes = document.getElementById("endorsement-boxes");


// Get the "loveArr" item from localStorage and parse it, if it exists
const loveStatus = JSON.parse(localStorage.getItem("loveArr"));
const loveArr = [];

// If loveStatus exists, spread its items into loveArr
if (loveStatus) {
  loveArr.push(...loveStatus);
}


// Add an event listener for the publish button click event
publishButton.addEventListener("click", function () {
  // Get the value of the input fields
  const endorsementText = endorsementEl.value;
  const fromText = fromEl.value;
  const toText = toEl.value;

  // Construct an object from the input fields and a default love count of 0
  const endorsementObj = {
    content: endorsementText,
    from: fromText,
    to: toText,
    love: 0,
  };

  // If any of the required input fields are empty, show the alert
  if (endorsementEl.value.length == 0 || toEl.value.length == 0) {
    showAlert();
  } else {
    // Otherwise, hide the alert, push the object to the database, and clear the input fields
    hideAlert();
    push(endorsementsInDB, endorsementObj);
    clearInputFields();
  }
});


// Listen for value changes on the 'endorsements' path in the database
onValue(endorsementsInDB, function (snapshot) {
  // Clear the endorsementBoxes container
  endorsementBoxes.innerHTML = "";

  // If the snapshot exists, render each endorsement
  if (snapshot.exists()) {
    const allEndorsement = Object.entries(snapshot.val());
    allEndorsement.forEach(([key, value]) => {
      renderText([key, value]);
    });
  }
});


// Function to render each endorsement
function renderText(endorsementArray) {
  // Destructure the endorsement array into ID and endorsement object
  const endorsementID = endorsementArray[0];
  const endorsement = endorsementArray[1];

  // Destructure the endorsement object
  const endorsementText = endorsement.content;
  const fromText = endorsement.from;
  const toText = endorsement.to;
  const love = endorsement.love;

  // Get an array of the IDs of all loved endorsements
  const loveIds = loveArr.map((item) => item.loveId);

  // Create a new div to hold the endorsement
  const endorsementBox = document.createElement("div");

  // If the current endorsement is loved, render it with a 'loved' class
  if (loveIds.includes(endorsementID)) {
    endorsementBox.classList.add("endorsement-box");
    endorsementBox.innerHTML = `
        <div class="detail-wrapper">
          <span>To: ${toText}</span>
          <span>From: ${fromText}</span>
        </div> 
        <p>${endorsementText}</p>
        <div class="love-wrapper">
          <button class="loved">❤</button>
          <span>${love}</span> 
        </div>
        `;
  } else {
    // Otherwise, render it with a 'love-button' class
    endorsementBox.classList.add("endorsement-box");
    endorsementBox.innerHTML = `
        <div class="detail-wrapper">
          <span>To: ${toText}</span>
          <span>From: ${fromText}</span>
        </div> 
        <p>${endorsementText}</p>
        <div class="love-wrapper">
          <button class="love-button">❤</button>
          <span>${love}</span> 
        </div>
        `;
  }

  // Append the endorsement box to the container and add a click listener for the love button
  endorsementBoxes.append(endorsementBox);
  addLove(endorsementBox, love, endorsementID);
}


// Function to add a click listener for the love button
function addLove(parent, love, id) {
  parent.addEventListener("click", function (e) {
    // Check if the clicked target is the love button or the loved button
    const loveButton = e.target.matches(".love-button");
    const lovedButton = e.target.matches(".loved");

    // Get an array of the IDs of all loved endorsements
    const loveIds = loveArr.map((item) => item.loveId);

    // Get the index of the current endorsement in the array
    const loveIndex = loveIds.indexOf(id);

    // If the love button was clicked, increment the love count and update localStorage and the database
    if (e.target && loveButton) {
      love += 1;
      loveArr.push({
        loveId: id,
        loveStatus: "loved",
      });
      localStorage.setItem("loveArr", JSON.stringify(loveArr));
      set(ref(database, `endorsements/${id}/love`), love);
    } else if (e.target && lovedButton) {
      // If the loved button was clicked, decrement the love count and update localStorage and the database
      love -= 1;
      loveArr.splice(loveIndex, 1);
      localStorage.setItem("loveArr", JSON.stringify(loveArr));
      set(ref(database, `endorsements/${id}/love`), love);
    }
  });
}


// Function to clear the input fields
function clearInputFields() {
  endorsementEl.value = null;
  toEl.value = null;
  fromEl.value = null;
}

// Function to hide the alert
function hideAlert() {
  endorsementEl.classList.remove("required-alert");
  toEl.classList.remove("required-alert");
  reqField.style.display = "none";
}

// Function to show the alert
function showAlert() {
  endorsementEl.classList.add("required-alert");
  toEl.classList.add("required-alert");
  reqField.style.display = "block";
  reqField.innerHTML = `<span>
                        Please insert message and recepient
                        </span>`;

  return false;
}