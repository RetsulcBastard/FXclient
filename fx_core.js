const dictionary = {"gIsSingleplayer":"j1","gIsTeamGame":"ha","playerId":"eu","playerNames":"k5","playerBalances":"ev","playerTerritories":"fP","uiOffset":"nf"};
const fx_version = '0.6.1.9'; // FX Client Version
const fx_update = 'Mar 7'; // FX Client Last Updated

if (localStorage.getItem("fx_winCount") == undefined || localStorage.getItem("fx_winCount") == null) {
    var wins_counter = 0;
    console.log('Couldn\'t find a saved win data. creating one...');
} else if (localStorage.getItem("fx_winCount") != undefined || localStorage.getItem("fx_winCount") != null) {
    var wins_counter = localStorage.getItem("fx_winCount");
}

const getVar = varName => window[dictionary[varName]];

// https://stackoverflow.com/a/6234804
function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function KeybindsInput(containerElement) {
    this.container = containerElement;
    this.keys = [ "key", "type", "value" ];
    this.objectArray = [];
    this.addObject = function () {
        this.objectArray.push({ key: "", type: "absolute", value: 1 });
        this.displayObjects();
    };
    document.getElementById("keybindAddButton").addEventListener("click", this.addObject.bind(this));
    this.displayObjects = function () {
        // Clear the content of the container
        this.container.innerHTML = "";
        if (this.objectArray.length === 0) return this.container.innerText = "No custom attack percentage keybinds added";
        // Loop through the array and display input fields for each object
        for (var i = 0; i < this.objectArray.length; i++) {
            var objectDiv = document.createElement("div");
            // Create input fields for each key
            this.keys.forEach(function (key) {
                let inputField = document.createElement(key === "type" ? "select" : "input");
                if (key === "type") {
                    inputField.innerHTML = '<option value="absolute">Absolute</option><option value="relative">Relative</option>';
                    inputField.addEventListener("change", this.updateObject.bind(this, i, key));
                } else if (key === "key") {
                    inputField.type = "text";
                    inputField.setAttribute("readonly", "");
                    inputField.setAttribute("placeholder", "No key set");
                    inputField.addEventListener("click", this.startKeyInput.bind(this, i, key));
                } else { // key === "value"
                    inputField.type = "number";
                    inputField.setAttribute("step", "0.1");
                    inputField.addEventListener("input", this.updateObject.bind(this, i, key));
                }
                inputField.value = this.objectArray[i][key];
                // Append input field to the object div
                objectDiv.appendChild(inputField);
            }, this);
            // Button to delete the object
            var deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", this.deleteObject.bind(this, i));
            // Append delete button to the object div
            objectDiv.appendChild(deleteButton);
            // Append the object div to the container
            this.container.appendChild(objectDiv);
        }
    };
    /** @param {PointerEvent} event */
    this.startKeyInput = function (index, property, event) {
        event.target.value = "Press any key";
        const handler = this.updateObject.bind(this, index, property);
        event.target.addEventListener('keydown', handler, { once: true });
        event.target.addEventListener("blur", () => {
            event.target.removeEventListener('keydown', handler, { once: true });
            event.target.value = this.objectArray[index][property];
            //this.displayObjects();
        }, { once: true });
    };
    this.updateObject = function (index, property, event) {
        if (index >= this.objectArray.length) return;
        // Update the corresponding property of the object in the array
        const value = property === "value" ? parseFloat(event.target.value) : property === "key" ? event.key : event.target.value;
        this.objectArray[index][property] = value;
        if (property === "key") this.displayObjects();
    };
    this.deleteObject = function (index) {
        // Remove the object from the array
        this.objectArray.splice(index, 1);
        // Display the updated input fields for objects
        this.displayObjects();
    };
    return this;
}

var settings = {
    "fontName": "Trebuchet MS",
    "showBotDonations": false,
    "displayWinCounter": true,
    "useFullscreenMode": false,
    "hideAllLinks": false,
    "realisticNames": false,
    "densityDisplayStyle": "percentage",
    //"customMapFileBtn": true
    "customBackgroundUrl": "",
    "attackPercentageKeybinds": [],
};
let makeMainMenuTransparent = false;
var settingsManager = new (function() {
    var inputFields = { // (includes select menus)
        fontName: document.getElementById("settings_fontname"),
        customBackgroundUrl: document.getElementById("settings_custombackgroundurl"),
        densityDisplayStyle: document.getElementById("settings_densityDisplayStyle")
    };
    var checkboxFields = {
        //showBotDonations: document.getElementById("settings_donations_bots"),
        hideAllLinks: document.getElementById("settings_hidealllinks"),
        realisticNames: document.getElementById("settings_realisticnames"),
        displayWinCounter: document.getElementById("settings_displaywincounter"),
        useFullscreenMode: document.getElementById("settings_usefullscreenmode"),
        //customMapFileBtn: document.getElementById("settings_custommapfileinput")
    };
    this.save = function() {
        Object.keys(inputFields).forEach(function(key) { settings[key] = inputFields[key].value.trim(); });
        Object.keys(checkboxFields).forEach(function(key) { settings[key] = checkboxFields[key].checked; });
        this.applySettings();
        WindowManager.closeWindow("settings");
        localStorage.setItem("fx_settings", JSON.stringify(settings));
        // should probably firgure out a way to do this without reloading - // You can't do it, localstorages REQUIRE you to reload
        window.location.reload();
    };
    let keybindsInput = new KeybindsInput(document.getElementById("keybinds"));
    this.syncFields = function() {
        Object.keys(inputFields).forEach(function(key) { inputFields[key].value = settings[key]; });
        Object.keys(checkboxFields).forEach(function(key) { checkboxFields[key].checked = settings[key]; });
        keybindsInput.objectArray = settings.attackPercentageKeybinds;
        keybindsInput.displayObjects();
    };
    this.resetAll = function() {
        if (!confirm("Are you Really SURE you want to RESET ALL SETTINGS back to the default?")) return;
        localStorage.removeItem("fx_settings");
        window.location.reload();
    };
    this.applySettings = function() {
        //setVarByName("bu", "px " + settings.fontName);
        if (settings.useFullscreenMode && document.fullscreenEnabled) {
            function tryEnterFullscreen() {
                if (document.fullscreenElement !== null) return;
                document.documentElement.requestFullscreen({ navigationUI: "hide" })
                    .then(() => { console.log('Fullscreen mode activated'); })
                    .catch((error) => { console.warn('Could not enter fullscreen mode:', error); });
            }
            document.addEventListener('mousedown', tryEnterFullscreen, { once: true });
            document.addEventListener('click', tryEnterFullscreen, { once: true });
        }
        if (settings.customBackgroundUrl !== "") {
            document.body.style.backgroundImage = "url(" + settings.customBackgroundUrl + ")";
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "center";
        }
        makeMainMenuTransparent = settings.customBackgroundUrl !== "";
    };
});
function removeWins() {
    var confirm1 = confirm('Do you really want to reset your Wins?');
    if (confirm1) {
        wins_counter = 0;
        localStorage.removeItem('fx_winCount');
        alert("Successfully reset wins");
    }
}
const openCustomBackgroundFilePicker = () => {
    const fileInput = document.getElementById("customBackgroundFileInput");
    fileInput.click();
    fileInput.addEventListener('change', handleFileSelect);
}
function handleFileSelect(event) {
    const fileInput = event.target;
    const selectedFile = fileInput.files[0];
    console.log(fileInput.files);
    console.log(fileInput.files[0]);
    if (selectedFile) {
        const fileUrl = URL.createObjectURL(selectedFile);
        console.log("File URL:", fileUrl);
        fileInput.value = "";
        fileInput.removeEventListener("change", handleFileSelect);
    }
}

var WindowManager = new (function() {
    var windows = {};
    this.add = function(newWindow) {
        windows[newWindow.name] = newWindow;
        windows[newWindow.name].isOpen = false;
    };
    this.openWindow = function(windowName, ...args) {
        if (windows[windowName].isOpen === true) return;
        if (windows[windowName].beforeOpen !== undefined) windows[windowName].beforeOpen(...args);
        windows[windowName].isOpen = true;
        windows[windowName].element.style.display = null;
    };
    this.closeWindow = function(windowName) {
        if (windows[windowName].isOpen === false) return;
        windows[windowName].isOpen = false;
        windows[windowName].element.style.display = "none";
    };
    this.closeAll = function() {
        Object.values(windows).forEach(function(windowObj) {
            WindowManager.closeWindow(windowObj.name);
        });
    };
});
WindowManager.add({
    name: "settings",
    element: document.querySelector(".settings"),
    beforeOpen: function() { settingsManager.syncFields(); }
});
WindowManager.add({
    name: "donationHistory",
    element: document.querySelector("#donationhistory"),
    beforeOpen: function(isSingleplayer) {
        document.getElementById("donationhistory_note").style.display = ((true || settings.showBotDonations || /*getVarByName("dt")*/ isSingleplayer) ? "none" : "block");
    }
});
WindowManager.add({
    name: "playerList",
    element: document.getElementById("playerlist"),
    beforeOpen: function() {}
});
document.getElementById("canvasA").addEventListener("mousedown", WindowManager.closeAll);
document.getElementById("canvasA").addEventListener("touchstart", WindowManager.closeAll, { passive: true });
document.addEventListener("keydown", event => { if (event.key === "Escape") WindowManager.closeAll(); });
var settingsGearIcon = document.createElement('img');
settingsGearIcon.setAttribute('src', 'assets/geari_white.png');

const playerList = new (function () {
    const playersIcon = document.createElement('img');
    playersIcon.setAttribute('src', 'assets/players_icon.png');
    document.getElementById("playerlist_content").addEventListener("click", event => {
        const playerId = event.target.closest("tr[data-player-id]")?.getAttribute("data-player-id");
        if (!playerId) return;
        if (getVar("gIsTeamGame")) WindowManager.closeWindow("playerList"), displayDonationsHistory(playerId);
    });
    this.display = function displayPlayerList(playerNames) {
        let listContent = "";
        for (let i = 0; i < playerNames.length; i++) {
            listContent += `<tr data-player-id="${i}"><td><span class="color-light-gray">${i}.</span> ${escapeHtml(playerNames[i])}</td></tr>`
        }
        document.getElementById("playerlist_content").innerHTML = listContent;
        document.getElementById("playerlist_content").setAttribute("class", getVar("gIsTeamGame") ? "clickable" : "");
        WindowManager.openWindow("playerList");
    }
    this.hoveringOverButton = false;
    this.drawButton = (canvas, x, y, size) => {
        canvas.fillRect(x, y, size, size);
        canvas.fillStyle = this.hoveringOverButton ? "#aaaaaaaa" : "#000000aa";
        canvas.clearRect(x + 1, y + 1, size - 2, size - 2);
        canvas.fillRect(x + 1, y + 1, size - 2, size - 2);
        canvas.fillStyle = "#ffffff";
        canvas.imageSmoothingEnabled = true;
        canvas.drawImage(playersIcon, x + 2, y + 2, size - 4, size - 4);
        canvas.imageSmoothingEnabled = false;
    }
});
var donationsTracker = new (function(){
    this.donationHistory = Array(512);
    // fill the array with empty arrays with length of 3
    //for (var i = 0; i < 512; i++) this.donationHistory.push([]); // not needed as .reset is called on game start
    // from inside of game:
    // ((!gE[g].startsWith("[Bot] ") || settings.showBotDonations) && donationsTracker.logDonation(g,k,x))
    this.logDonation = function(senderID, receiverID, amount) {
        const donationInfo = [senderID, receiverID, amount];
        this.donationHistory[receiverID].push(donationInfo);
        this.donationHistory[senderID].push(donationInfo);
    };
    this.getRecipientHistoryOf = function(playerID) {
        return this.donationHistory[playerID];
    };
    this.reset = function() { for (var i = 0; i < 512; i++) this.donationHistory[i] = []; };
});
function displayDonationsHistory(playerID, playerNames = getVar("playerNames"), isSingleplayer = getVar("gIsSingleplayer")) {
    var history = donationsTracker.getRecipientHistoryOf(playerID);
    console.log("History for " + playerNames[playerID] + ":");
    console.log(history);
    document.querySelector("#donationhistory h1").innerHTML = "Donation history for " + escapeHtml(playerNames[playerID]);
    var historyText = "";
    history.reverse();
    if (history.length > 0) history.forEach(function(historyItem, index) {
        historyText += `<span class="color-light-gray">${(history.length - index)}.</span> `;
        if (playerID === historyItem[1])
            historyText += `Received <span class="color-green">${historyItem[2]}</span> resources from ${escapeHtml(playerNames[historyItem[0]])}<br>`;
        else historyText += `Sent <span class="color-red">${historyItem[2]}</span> resources to ${escapeHtml(playerNames[historyItem[1]])}<br>`;
    });
    else historyText = "Nothing to display";
    document.querySelector("#donationhistory p#donationhistory_text").innerHTML = historyText;
    WindowManager.openWindow("donationHistory", isSingleplayer);
}

var utils = new (function() {
    this.getMaxTroops = function(playerTerritories, playerID) { return (playerTerritories[playerID]*150).toString(); };
    this.getDensity = function(playerBalances, playerTerritories, playerID) {
        if (settings.densityDisplayStyle === "percentage") return (((playerBalances[playerID] / ((playerTerritories[playerID] === 0 ? 1 : playerTerritories[playerID]) * 150)) * 100).toFixed(1) + "%");
        else return (playerBalances[playerID] / (playerTerritories[playerID] === 0 ? 1 : playerTerritories[playerID])).toFixed(1);
    };
    this.isPointInRectangle = function(x, y, rectangleStartX, rectangleStartY, width, height) {
        return x >= rectangleStartX && x <= rectangleStartX + width && y >= rectangleStartY && y <= rectangleStartY + height;
    }
});

const keybindFunctions = { setAbsolute: () => {}, setRelative: () => {} };
const keybindHandler = key => {
    const keybindData = settings.attackPercentageKeybinds.find(keybind => keybind.key === key);
    if (keybindData === undefined) return false;
    if (keybindData.type === "absolute") keybindFunctions.setAbsolute(keybindData.value);
    else keybindFunctions.setRelative(keybindData.value);
    return true;
};

if (localStorage.getItem("fx_settings") !== null) {
    settings = {...settings, ...JSON.parse(localStorage.getItem("fx_settings"))};
}
settingsManager.applySettings();

console.log('Successfully loaded FX Client');