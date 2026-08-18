// =========================================
// 1. NAVIGATION ENGINE
// =========================================
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        
        navButtons.forEach(b => b.classList.remove('active-nav'));
        btn.classList.add('active-nav');
        
        views.forEach(view => {
            view.classList.remove('active');
            view.classList.add('hidden');
        });
        
        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.classList.remove('hidden');
            targetView.classList.add('active');
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

function switchTab(tabId) {
    const allViews = document.querySelectorAll('.view');
    allViews.forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });

    const activeView = document.getElementById(tabId);
    if(activeView) {
        activeView.classList.remove('hidden');
        setTimeout(() => {
            activeView.classList.add('active');
        }, 10);
    }
}


// =========================================
// 2. ACTION-GATED SECURITY SYSTEM 🔒
// =========================================
const HER_SECRET_CODE = "1104"; 
const SHAON_SECRET_CODE = "1505"; 

const authModal = document.getElementById('auth-modal');
const authInput = document.getElementById('secret-code-input');
const authUnlockBtn = document.getElementById('auth-unlock-btn');
const authCancelBtn = document.getElementById('auth-cancel-btn');
const authError = document.getElementById('auth-error');
const logoutBtn = document.getElementById('logout-btn');

let pendingAction = null;

// The function that manually forces the logbook AND gallery to refresh privacy state
const refreshLogbookPrivacy = () => {
    if (typeof database !== 'undefined') {
        database.ref('locations/shaon').once('value').then(snap => updateLogbookUI(snap, 'rafi-location-log'));
        database.ref('locations/her').once('value').then(snap => updateLogbookUI(snap, 'ruhi-location-log'));
    }
    // Force the gallery to lock/unlock instantly
    if (typeof renderGallery === 'function') {
        renderGallery();
    }
};

const checkSecurityState = () => {
    const savedUser = localStorage.getItem('amader_golpo_user');
    const rafiTitle = document.getElementById('rafi-tracker-title');
    const ruhiTitle = document.getElementById('ruhi-tracker-title');

    if (logoutBtn) {
        if (savedUser) {
            logoutBtn.classList.remove('hidden');
        } else {
            logoutBtn.classList.add('hidden');
        }
    }

    // Switch names based on who is holding the phone
    if (savedUser === 'shaon') {
        if (rafiTitle) rafiTitle.innerText = "My Tracker 🛰️";
        if (ruhiTitle) ruhiTitle.innerText = "Ruhi's Tracker 🛰️";
    } else if (savedUser === 'her') {
        if (ruhiTitle) ruhiTitle.innerText = "My Tracker 🛰️";
        if (rafiTitle) rafiTitle.innerText = "Rafi's Tracker 🛰️";
    } else {
        if (rafiTitle) rafiTitle.innerText = "Rafi's Tracker 🔒";
        if (ruhiTitle) ruhiTitle.innerText = "Ruhi's Tracker 🔒";
    }

    // Force the logs to instantly hide or show based on this new state
    refreshLogbookPrivacy();
};

const requireIdentity = (actionFunction) => {
    const savedUser = localStorage.getItem('amader_golpo_user');
    
    if (savedUser === 'her' || savedUser === 'shaon') {
        actionFunction(savedUser);
    } else {
        pendingAction = actionFunction;
        if(authInput) authInput.value = "";
        if(authError) authError.classList.add('hidden');
        if(authModal) authModal.classList.remove('hidden');
        if(authInput) authInput.focus();
    }
};

const closeAuthModal = () => {
    if(authModal) authModal.classList.add('hidden');
    pendingAction = null;
};

if(authCancelBtn) authCancelBtn.addEventListener('click', closeAuthModal);

if(authUnlockBtn) {
    authUnlockBtn.addEventListener('click', () => {
        const enteredCode = authInput.value.trim();
        
        if (enteredCode === HER_SECRET_CODE) {
            localStorage.setItem('amader_golpo_user', 'her');
            closeAuthModal();
            checkSecurityState();
            if (pendingAction) pendingAction('her');
            
        } else if (enteredCode === SHAON_SECRET_CODE) {
            localStorage.setItem('amader_golpo_user', 'shaon');
            closeAuthModal();
            checkSecurityState();
            if (pendingAction) pendingAction('shaon');
            
        } else {
            if(authError) authError.classList.remove('hidden');
            if(authInput) authInput.value = "";
        }
    });
}

if(logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('amader_golpo_user');
        checkSecurityState();
        
        const statusText = document.querySelector('.location-status');
        if (statusText) statusText.innerText = "App locked securely. Identity cleared. 🔒";
        
        alert("Identity cleared! The app is now safely locked. ✨");
    });
}


// =========================================
// 3. UI FEATURES (Hearts, Envelopes, Timer)
// =========================================
const reasons = [
    "Tumhari masoomiyat🥹",
    "The way you talk about the things you love.",
    "Because you make my days 100x better.",
    "Tumhari bachpana🥹",
    "Because every time I see your message, I smile.",
    "The way u care for others🫠", 
    "তোমাকে বুঝালে বুঝো🙂",
    "তুমি আমার সাথে একবারও তর্ক করো নি😇",
    "Tumhari soch🥹🫡"
];

const reasonBtn = document.getElementById('reason-btn');
const reasonText = document.getElementById('reason-text');
const heartContainer = document.getElementById('heart-container');

if (reasonBtn && reasonText && heartContainer) {
    reasonBtn.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * reasons.length);
        reasonText.innerText = reasons[randomIndex];
        
        reasonText.style.animation = 'none';
        setTimeout(() => {
            reasonText.style.animation = 'textFadeIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        }, 10);

        createHearts();
    });
}

function createHearts() {
    const heartCount = Math.floor(Math.random() * 4) + 5; 
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerText = '💖';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = (Math.random() * 2 + 3) + 's';
        heart.style.fontSize = (Math.random() * 15 + 15) + 'px'; 
        heartContainer.appendChild(heart);
        setTimeout(() => heart.remove(), 5000);
    }
}

const envelopeMessages = {
    'env-miss': [
        "আমিও তোমাকে খুব মিস করছি! আকাশের চাঁদের দিকে তাকাও, আমরা একই আকাশের নিচেই আছি। ✨",
        "Close your eyes, I'm right there with you! ❤️"
    ],
    'env-sad': [
        "তোমার রব তোমাকে পরিত্যাগ করেননি এবং অসন্তুষ্টও হননি। (surah Ad-Duha 3)🌸",
        "And whoever relies upon Allah - then He is sufficient for him",
        "নিশ্চয় কষ্টের সাথেই রয়েছে সুখ। (সুরা আল-ইনশিরাহ)", 
        "This bad time will pass, but my love for you is permanent. ❤️"
    ],
    'env-mad': [
        "I am so sorry for whatever stupid thing I did! Please forgive me. 🥺❤️",
        "যারা সুসময়ে ও দুঃসময়ে ব্যয় করে এবং ক্রোধ সংবরণ করে ও মানুষকে ক্ষমা করে। আর আল্লাহ সৎকর্মশীলদের ভালবাসেন।",
        "আর যারা গুরুতর পাপ ও অশ্লীল কার্যকলাপ থেকে বেঁচে থাকে এবং যখন রাগান্বিত হয় তখন তারা ক্ষমা করে দেয়।",
        "Even when you are mad, you look incredibly cute. Just saying... 🙈"
    ],
    'env-sleep': [
        "ঘুমানোর চেষ্টা করো। স্বপ্নে দেখা হবে আমাদের! Good night... 🌙",
        "I'm probably sleeping right now, but my heart is still beating for you. 💖"
    ]
};

const envelopeCards = document.querySelectorAll('.envelope-card');
envelopeCards.forEach(card => {
    card.addEventListener('click', () => {
        const isFlipped = card.classList.contains('flipped');
        if (!isFlipped) {
            const envId = card.id;
            const messages = envelopeMessages[envId];
            if (messages) {
                const randomIndex = Math.floor(Math.random() * messages.length);
                const backTextElement = card.querySelector('.back-message');
                if(backTextElement) backTextElement.innerText = messages[randomIndex];
            }
        }
        card.classList.toggle('flipped');
    });
});

const calculateGrowthDays = () => {
    const startDate = new Date("July 3, 2026 00:00:00").getTime();
    const now = new Date().getTime();
    const difference = now - startDate;
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    
    const timerElement = document.getElementById('plant-timer');
    if (timerElement) {
        timerElement.innerText = `Growing for ${days} days 🌱`;
    }
};
calculateGrowthDays();


// =========================================
// 4. FIREBASE REALTIME LOCATION TRACKER 🌍
// =========================================
const firebaseConfig = {
  apiKey: "AIzaSyAUIqJ-WrfphkpOmROywfcitImPXlMyhX8",
  authDomain: "aestheticromancemiaw.firebaseapp.com",
  databaseURL: "https://aestheticromancemiaw-default-rtdb.firebaseio.com",
  projectId: "aestheticromancemiaw",
  storageBucket: "aestheticromancemiaw.firebasestorage.app",
  messagingSenderId: "415599074242",
  appId: "1:415599074242:web:7ea6cf0359e4ac839d545b"
};

// Initialize Firebase safely
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

const handleShareLocation = (userIdentity) => {
    const statusText = document.querySelector('.location-status');
    
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    if(statusText) statusText.innerText = "Acquiring GPS coordinates... 🛰️";

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            const latFixed = lat.toFixed(4);
            const lngFixed = lng.toFixed(4);
            let placeName = "";

            try {
                if(statusText) statusText.innerText = "Translating coordinates to area name... 🌍";
                
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`);
                const data = await response.json();

                if (data && data.address) {
                    let area = data.address.suburb || data.address.village || data.address.neighbourhood || data.address.town || "";
                    let upazila = data.address.county || data.address.city_district || ""; 
                    let district = data.address.state_district || data.address.city || data.address.state || "";

                    area = area.replace(/ Upazila/gi, "").replace(/ District/gi, "").trim();
                    upazila = upazila.replace(/ Upazila/gi, "").replace(/ District/gi, "").trim();
                    district = district.replace(/ District/gi, "").replace(/ Zila/gi, "").trim();

                    const rawParts = [area, upazila, district];
                    const parts = [...new Set(rawParts.filter(part => part !== ""))]; 
                    const finalPlace = parts.join(', ');

                    if (finalPlace) placeName = ` (${finalPlace})`;
                }
            } catch (error) {
                console.error("Map translation failed:", error);
            }

            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateString = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
            const fullTimestamp = `${dateString}, ${timeString}`;

            const locationData = {
                coords: `${latFixed}° N, ${lngFixed}° E${placeName}`,
                time: fullTimestamp
            };

            database.ref('locations/' + userIdentity).push(locationData)
                .then(() => {
                    if(statusText) statusText.innerText = "Location added to logbook! ✨";
                })
                .catch((error) => {
                    if(statusText) statusText.innerText = "Error syncing with database.";
                    console.error(error);
                });
        },
        (error) => {
            if(statusText) statusText.innerText = "Unable to retrieve your location. Check GPS permissions.";
            console.error(error);
        },
        { enableHighAccuracy: true }
    );
};

// --- Updated Logbook UI with Security Gate ---
const updateLogbookUI = (snapshot, elementId) => {
    const logList = document.getElementById(elementId);
    if (!logList) return;

    // 🔥 THE PRIVACY SHIELD: Blocks rendering if the app is locked
    const savedUser = localStorage.getItem('amader_golpo_user');
    if (!savedUser) {
        logList.innerHTML = `
            <div class="log-item">
                <span class="log-time">🔒</span>
                <span class="log-coords">Location data is locked.</span>
            </div>
        `;
        return; 
    }

    const data = snapshot.val();
    
    if (data) {
        logList.innerHTML = ''; 
        const logs = Object.values(data).reverse();
        
        logs.forEach((log, index) => {
            const isActive = index === 0 ? 'live-active' : '';
            const pulseDot = index === 0 ? '<span class="pulse-dot"></span>' : '';
            
            logList.innerHTML += `
                <div class="log-item ${isActive}">
                    <span class="log-time">${pulseDot}${log.time}</span>
                    <span class="log-coords">${log.coords}</span>
                </div>
            `;
        });
    } else {
         logList.innerHTML = `
            <div class="log-item">
                <span class="log-time">--:--</span>
                <span class="log-coords">No locations recorded yet.</span>
            </div>
        `;
    }
};

// Realtime Listeners
database.ref('locations/shaon').on('value', (snapshot) => {
    updateLogbookUI(snapshot, 'rafi-location-log');
});

database.ref('locations/her').on('value', (snapshot) => {
    updateLogbookUI(snapshot, 'ruhi-location-log');
});

// Run security check on first load
checkSecurityState();

const shareLocationBtn = document.getElementById('share-location-btn');
if (shareLocationBtn) {
    shareLocationBtn.addEventListener('click', () => {
        requireIdentity((userIdentity) => {
            handleShareLocation(userIdentity);
        });
    });
}


// =========================================
// 5. LIVE PHOTO GALLERY (Crash-Proof Engine) 📸
// =========================================

// 🔥 YOUR IMGBB API KEY:
var IMGBB_API_KEY = "c2c7c60a7e3679603c66f69e7abb8747"; 

var photoInput = document.getElementById('photo-input');
var uploadStatus = document.getElementById('upload-status');
var galleryGrid = document.getElementById('photo-gallery-grid');
var currentGalleryData = null;

if (photoInput) {
    
    photoInput.addEventListener('click', (event) => {
        const savedUser = localStorage.getItem('amader_golpo_user');
        if (savedUser !== 'her' && savedUser !== 'shaon') {
            event.preventDefault(); 
            requireIdentity((userIdentity) => {
                alert("App unlocked! ✨ Please tap 'Share a Moment' one more time.");
            });
        }
    });

    photoInput.addEventListener('change', async (event) => {
        try {
            const file = event.target.files[0];
            if (!file) return;

            console.log("File selected:", file.name);

            const savedUser = localStorage.getItem('amader_golpo_user');
            const uploaderName = savedUser === 'shaon' ? 'Rafi' : 'Ruhi';

            // Ensure upload status is visible
            if (!uploadStatus) uploadStatus = document.getElementById('upload-status');
            if (uploadStatus) {
                uploadStatus.classList.remove('hidden');
                uploadStatus.style.display = 'block'; 
                uploadStatus.innerText = "Sending moment... ☁️";
            }

            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();

            if (data && data.success) {
                const imageUrl = data.data.url;
                
                const now = new Date();
                const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateString = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
                
                const photoData = {
                    url: imageUrl,
                    uploadedBy: uploaderName,
                    date: `${dateString}, ${timeString}`,
                    timestamp: now.getTime() 
                };

                await database.ref('gallery').push(photoData);
                
                if (uploadStatus) {
                    uploadStatus.innerText = "Sent! ✨";
                    setTimeout(() => {
                        uploadStatus.style.display = 'none';
                        uploadStatus.classList.add('hidden');
                    }, 3000);
                }
            } else {
                throw new Error(data.error?.message || "ImgBB rejected the image file.");
            }
        } catch (error) {
            console.error(error);
            if (uploadStatus) {
                uploadStatus.innerText = "Failed to send. ❌";
                setTimeout(() => {
                    uploadStatus.style.display = 'none';
                    uploadStatus.classList.add('hidden');
                }, 3000);
            }
            alert("UPLOAD CRASH: " + error.message);
        } finally {
            event.target.value = ""; 
        }
    });
}

function renderGallery() {
    // Failsafe: If the grid variable hasn't loaded yet, go find it right now!
    if (!galleryGrid) {
        galleryGrid = document.getElementById('photo-gallery-grid');
    }
    if (!galleryGrid) return;
    
    const savedUser = localStorage.getItem('amader_golpo_user');
    
    if (!savedUser) {
        galleryGrid.innerHTML = `<div class="empty-gallery-msg">🔒 Chat is locked. Enter code to view.</div>`;
        return;
    }

    if (currentGalleryData) {
        galleryGrid.innerHTML = ''; 
        
        const photos = Object.values(currentGalleryData);
        
        photos.forEach(photo => {
            const isMe = (savedUser === 'shaon' && photo.uploadedBy === 'Rafi') || 
                         (savedUser === 'her' && photo.uploadedBy === 'Ruhi');
            
            const alignmentClass = isMe ? 'chat-me' : 'chat-them';
            const avatarIcon = photo.uploadedBy === 'Rafi' ? '👦🏻' : '👧🏻'; 
            
            galleryGrid.innerHTML += `
                <div class="chat-message ${alignmentClass}">
                    <div class="chat-avatar">${avatarIcon}</div>
                    <div class="chat-photo-bubble">
                        <img src="${photo.url}" alt="Shared Moment">
                        <span class="chat-timestamp">${photo.date}</span>
                    </div>
                </div>
            `;
        });
        
        setTimeout(() => {
            galleryGrid.scrollTop = galleryGrid.scrollHeight;
        }, 100);

    } else {
         galleryGrid.innerHTML = `<div class="empty-gallery-msg">No moments yet. Be the first to share one! 🌸</div>`;
    }
}

database.ref('gallery').orderByChild('timestamp').on('value', (snapshot) => {
    currentGalleryData = snapshot.val();
    renderGallery();
});


// =========================================
// 6. HOMEPAGE PROPOSAL LOGIC 💍💔
// =========================================

const marryBtn = document.getElementById('marry-btn');
const rejectBtn = document.getElementById('reject-btn');
const letterModal = document.getElementById('letter-modal');
const closeLetterBtn = document.getElementById('close-letter-btn');

// 1. The Runaway Reject Button!
const runAway = function(e) {
    e.preventDefault(); // Stops the click
    
    // Calculates a random position anywhere on the screen
    const x = Math.random() * (window.innerWidth - this.clientWidth - 20);
    const y = Math.random() * (window.innerHeight - this.clientHeight - 100);
    
    this.style.position = 'fixed';
    this.style.left = `${x}px`;
    this.style.top = `${y}px`;
    this.style.zIndex = '9999';
};

if (rejectBtn) {
    rejectBtn.addEventListener('mouseover', runAway); // Runs when the mouse touches it
    rejectBtn.addEventListener('touchstart', runAway, {passive: false}); // Runs when a finger taps it
}

// 2. Open the Letter Window
if (marryBtn) {
    marryBtn.addEventListener('click', () => {
        if(letterModal) {
            letterModal.classList.remove('hidden');
            // A little explosion of hearts when she clicks it!
            for(let i=0; i<6; i++) { setTimeout(createHearts, i*200); }
        }
    });
}

// 3. Close the Letter Window
if (closeLetterBtn) {
    closeLetterBtn.addEventListener('click', () => {
        if(letterModal) {
            letterModal.classList.add('hidden');
        }
    });
}


// =========================================
// 8. REAL-TIME FIREBASE PROPOSAL SYNC 💍
// =========================================

const openProposalBtn = document.getElementById('open-proposal-btn');
const proposalModal = document.getElementById('proposal-letter-modal');
const closeProposalBtn = document.getElementById('close-proposal-btn');
const connectBtn = document.getElementById('connect-btn');

// Store the database state globally so we can check it whenever we want
let currentProposalData = { rafi_ready: false, ruhi_ready: false };

// 🔥 THE FIX: A dedicated function that checks identity before updating the button
const updateProposalUI = () => {
    if (!connectBtn) return;
    
    const currentUser = localStorage.getItem('amader_golpo_user');
    
    // Clear old colors
    connectBtn.classList.remove('btn-red', 'btn-yellow', 'btn-green');

    // 1. If the user is logged out, ALWAYS reset to the locked default state!
    if (!currentUser) {
        connectBtn.classList.add('btn-red');
        connectBtn.innerText = "I Do 💍";
        return;
    }

    // 2. If logged in, figure out who is holding the phone
    const myKey = currentUser === 'shaon' ? 'rafi_ready' : 'ruhi_ready';
    const theirKey = currentUser === 'shaon' ? 'ruhi_ready' : 'rafi_ready';

    const amIReady = currentProposalData[myKey] === true;
    const areTheyReady = currentProposalData[theirKey] === true;

    // 3. Apply the correct button state based on the database
    if (amIReady && areTheyReady) {
        connectBtn.classList.add('btn-green');
        connectBtn.innerText = "Connected ✨";
    } 
    else if (amIReady && !areTheyReady) {
        connectBtn.classList.add('btn-yellow');
        connectBtn.innerText = "Waiting...";
    } 
    else if (!amIReady && areTheyReady) {
        connectBtn.classList.add('btn-red');
        connectBtn.innerText = "Answer? 🥺";
    } 
    else {
        connectBtn.classList.add('btn-red');
        connectBtn.innerText = "I Do 💍";
    }
};

// 1. Open / Close the Modal Window
if (openProposalBtn) {
    openProposalBtn.addEventListener('click', () => {
        if (proposalModal) proposalModal.classList.remove('hidden');
    });
}
if (closeProposalBtn) {
    closeProposalBtn.addEventListener('click', () => {
        if (proposalModal) proposalModal.classList.add('hidden');
    });
}

// 2. The 2-Player Database Sync
if (connectBtn) {
    // Write to database (Security gated!)
    connectBtn.addEventListener('click', () => {
        requireIdentity((userIdentity) => {
            const myKey = userIdentity === 'shaon' ? 'rafi_ready' : 'ruhi_ready';
            database.ref('proposal_status').update({
                [myKey]: true
            });
        });
    });

    // Listen to Firebase 24/7
    database.ref('proposal_status').on('value', (snapshot) => {
        currentProposalData = snapshot.val() || { rafi_ready: false, ruhi_ready: false };
        updateProposalUI();
        
        // Explode hearts if both connect!
        if (currentProposalData.rafi_ready && currentProposalData.ruhi_ready) {
             if(typeof createHearts === 'function') {
                for(let i=0; i<15; i++) { setTimeout(createHearts, i*150); }
            }
        }
    });

    // 🔥 THE EXTRA FIX: Instantly refresh the button when you log in or log out!
    if (logoutBtn) {
        logoutBtn.addEventListener('click', updateProposalUI);
    }
    if (authUnlockBtn) {
        authUnlockBtn.addEventListener('click', () => {
            setTimeout(updateProposalUI, 100); // Waits a split second for identity to save
        });
    }
}
