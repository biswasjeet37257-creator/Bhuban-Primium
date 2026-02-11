// Initialize Lucide icons
lucide.createIcons();

// --- BACKEND SIMULATION LAYER (V6) ---
const MockDatabase = {
    getUsers: () => JSON.parse(localStorage.getItem('bhuban_db_users')) || [],
    saveUser: (user) => {
        const users = MockDatabase.getUsers();
        users.push(user);
        localStorage.setItem('bhuban_db_users', JSON.stringify(users));
    },
    findUser: (username) => MockDatabase.getUsers().find(u => u.username === username),
    getUploadedVideos: () => JSON.parse(localStorage.getItem('bhuban_uploads')) || [],
    saveUploadedVideo: (video) => {
        const uploads = MockDatabase.getUploadedVideos();
        uploads.unshift(video);
        localStorage.setItem('bhuban_uploads', JSON.stringify(uploads));
    }
};

const AuthService = {
    register: (username, password, dob) => {
        if (MockDatabase.findUser(username)) return { success: false, message: "Username already exists" };
        const age = calculateAge(dob);
        const newUser = {
            username,
            password,
            dob,
            age,
            isCreator: false,
            earnings: 0,
            subscriptions: [],
            likes: [],
            joinedDate: new Date().toISOString()
        };
        MockDatabase.saveUser(newUser);
        return { success: true };
    },
    login: (username, password) => {
        const user = MockDatabase.findUser(username);
        if (user && user.password === password) {
            SessionService.create(user);
            return { success: true };
        }
        return { success: false, message: "Invalid credentials" };
    },
    logout: () => {
        SessionService.destroy();
        location.reload();
    }
};

const SessionService = {
    current: () => JSON.parse(localStorage.getItem('bhuban_session')),
    create: (user) => {
        localStorage.setItem('bhuban_session', JSON.stringify(user));
        localStorage.setItem('bhuban_loggedIn', 'true');
    },
    destroy: () => {
        localStorage.removeItem('bhuban_session');
        localStorage.setItem('bhuban_loggedIn', 'false');
    },
    updateUser: (updatedUser) => {
        localStorage.setItem('bhuban_session', JSON.stringify(updatedUser));
        const users = MockDatabase.getUsers();
        const idx = users.findIndex(u => u.username === updatedUser.username);
        if (idx > -1) {
            users[idx] = updatedUser;
            localStorage.setItem('bhuban_db_users', JSON.stringify(users));
        }
    }
};

function calculateAge(dob) {
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}

// --- STATE MANAGEMENT ---
const state = {
    user: SessionService.current() || { username: "Guest", subscriptions: [], likes: [], age: 0 },
    lang: 'EN',
    firewallActive: true,
    view: 'home',
    uploadStep: 1,
    currentUpload: null
};

const baseVideos = [
    {
        id: 1,
        title: "Apple Vision Pro - The Future is Here",
        channel: "TechMaster",
        views: "1.2M views",
        time: "2 days ago",
        duration: "12:45",
        quality: "4K",
        adult: false,
        thumbnail: "https://images.unsplash.com/photo-1684369175833-0bb652431669?q=80&w=640",
    },
    {
        id: 2,
        title: "Extreme Adventure: The Edge of Life",
        channel: "NatureFocus",
        views: "850K views",
        time: "5 hours ago",
        duration: "08:12",
        quality: "HD",
        adult: true,
        thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=640",
    },
    {
        id: 3,
        title: "Web Development in 2024: Complete Guide",
        channel: "CodeCraft",
        views: "3.5M views",
        time: "1 month ago",
        duration: "45:00",
        quality: "4K",
        adult: false,
        thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=640",
    }
];

// --- V5 OMNI-SEARCH LOGIC ---

const OmniSearchService = {
    engines: {
        bhuban: (q) => `Bhuban AI: Found matching videos for "${q}".`,
        web: (q) => `Global Web: Trending topics for "${q}" include major tech releases.`,
        wiki: (q) => `Knowledge Base: "${q}" is a significant trend in 2024.`
    },
    getInsights: (query) => {
        if (!query || query.length < 2) return null;
        return {
            summary: OmniSearchService.engines.bhuban(query),
            multiSource: [OmniSearchService.engines.web(query), OmniSearchService.engines.wiki(query)]
        };
    }
};

function handleSearchInput(e) {
    const q = e.target.value.trim();
    const overlay = document.getElementById('ai-search-overlay');
    const results = document.getElementById('ai-search-results');

    if (!q) {
        overlay?.classList.remove('show');
        return;
    }

    const insights = OmniSearchService.getInsights(q);
    if (insights && overlay && results) {
        overlay.classList.add('show');
        results.innerHTML = `
            <p><strong>Summary:</strong> ${insights.summary}</p>
            <div style="margin-top:10px; opacity:0.7; font-size:0.85rem">
                ${insights.multiSource.map(s => `<div>• ${s}</div>`).join('')}
            </div>
        `;
    }
}

// --- V6 UPLOAD SYSTEM LOGIC ---

function initUploadSteps() {
    state.uploadStep = 1;
    updateUploadStepUI();
    document.getElementById('video-file-input').value = '';
    document.getElementById('dropzone').style.display = 'flex';
    document.getElementById('video-details-form').style.display = 'none';
    document.getElementById('upload-progress-container').style.display = 'none';
    document.getElementById('next-step').disabled = true;
    document.getElementById('upload-title').value = '';
    document.getElementById('upload-desc').value = '';
}

function updateUploadStepUI() {
    const steps = document.querySelectorAll('.step');
    const contents = document.querySelectorAll('.upload-step-content');

    steps.forEach(s => s.classList.toggle('active', parseInt(s.dataset.step) === state.uploadStep));
    contents.forEach((c, idx) => c.style.display = (idx + 1) === state.uploadStep ? 'block' : 'none');

    document.getElementById('prev-step').style.display = state.uploadStep > 1 ? 'block' : 'none';
    document.getElementById('next-step').style.display = state.uploadStep < 3 ? 'block' : 'none';
    document.getElementById('finish-upload').style.display = state.uploadStep === 3 ? 'block' : 'none';
}

function simulateUpload(file) {
    document.getElementById('upload-progress-container').style.display = 'block';
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            document.getElementById('dropzone').style.display = 'none';
            document.getElementById('video-details-form').style.display = 'flex';
            document.getElementById('next-step').disabled = false;
            document.getElementById('upload-title').value = file.name.split('.')[0];
        }
        document.getElementById('upload-progress-fill').style.width = `${progress}%`;
        document.getElementById('upload-progress-text').innerText = `${Math.round(progress)}% uploaded`;
    }, 300);
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        // Generate a temporary preview URL for the duration of the session
        const videoUrl = URL.createObjectURL(file);

        state.currentUpload = {
            fileName: file.name,
            size: file.size,
            type: file.type,
            videoSrc: videoUrl
        };
        simulateUpload(file);
    }
}

function finishUpload() {
    const newVideo = {
        id: Date.now(),
        title: document.getElementById('upload-title').value || "Untitled Video",
        channel: state.user.username,
        views: "0 views",
        time: "Just now",
        duration: "00:00",
        quality: "HD",
        adult: false,
        thumbnail: document.querySelector('.thumb-option.active img').src,
        description: document.getElementById('upload-desc').value,
        category: document.getElementById('upload-category').value,
        visibility: document.querySelector('input[name="visibility"]:checked').value,
        videoSrc: state.currentUpload ? state.currentUpload.videoSrc : null
    };

    MockDatabase.saveUploadedVideo(newVideo);
    document.getElementById('upload-modal').classList.remove('show');
    renderVideos();
    alert("Video Published Successfully!");
}

// --- PLATFORM ADAPTIVE UI ---

function detectPlatform() {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android') || ua.includes('iphone')) return 'mobile';
    if (ua.includes('smart-tv') || window.innerWidth > 2000) return 'tv';
    return 'desktop';
}

function initPlatformUI() {
    const platform = detectPlatform();
    if (platform === 'tv') document.body.classList.add('tv-mode');
}

window.showHome = function () {
    state.view = 'home';
    const mainContent = document.getElementById('main-content');
    mainContent.style.opacity = '0';

    setTimeout(() => {
        mainContent.innerHTML = `<div class="video-grid" id="video-grid"></div>`;
        renderVideos();
        mainContent.style.opacity = '1';
        window.scrollTo(0, 0);
    }, 300);
};

// --- CORE RENDERING ---

function updateUI() {
    const isLoggedIn = !!SessionService.current();
    const authSection = document.getElementById('auth-section');
    const profileTrigger = document.getElementById('profile-trigger');

    if (isLoggedIn) {
        authSection.style.display = 'none';
        profileTrigger.style.display = 'block';
        document.getElementById('user-name').innerText = state.user.username;
        document.getElementById('user-handle').innerText = `@${state.user.username.replace(/\s+/g, '').toLowerCase()}`;

        // Update avatars across the app
        const avatars = document.querySelectorAll('.user-avatar');
        avatars.forEach(av => {
            if (state.user.avatar) {
                av.style.backgroundImage = `url(${state.user.avatar})`;
                av.style.backgroundSize = 'cover';
                av.style.backgroundPosition = 'center';
            } else {
                av.style.background = 'linear-gradient(45deg, var(--accent), #ff9f0a)';
            }
        });

        // Ensure Creator Hub accessibility
        if (state.user.isCreator) {
            document.getElementById('total-earnings').innerText = `$${state.user.earnings.toLocaleString()}`;
            document.getElementById('ad-revenue').innerText = `$${(state.user.earnings * 0.4).toFixed(2)}`;
            document.getElementById('apply-creator-btn').innerText = 'Dashboard Active';
            document.getElementById('apply-creator-btn').disabled = true;
        }

        // Update stats in profile menu
        const subStat = document.querySelector('.profile-stats .stat:nth-child(1) .stat-value');
        if (subStat) subStat.innerText = state.user.subscriptions.length;

        const videoStat = document.querySelector('.profile-stats .stat:nth-child(2) .stat-value');
        if (videoStat) {
            const userVideos = MockDatabase.getUploadedVideos().filter(v => v.channel === state.user.username);
            videoStat.innerText = userVideos.length;
        }
    } else {
        authSection.style.display = 'block';
        profileTrigger.style.display = 'none';
    }
}

function renderVideos() {
    const grid = document.getElementById('video-grid');
    if (!grid) return;

    const userUploads = MockDatabase.getUploadedVideos();
    const allVideos = [...userUploads, ...baseVideos];

    grid.innerHTML = allVideos.map(video => {
        if (video.adult && state.user.age < 18) {
            return `
                <div class="video-card age-locked">
                    <div class="thumbnail-container">
                        <div class="quality-badge">18+</div>
                        <img src="${video.thumbnail}" style="filter: blur(15px)">
                    </div>
                </div>
            `;
        }
        return `
            <div class="video-card" onclick="playVideo(${video.id})">
                <div class="thumbnail-container">
                    <div class="quality-badge">${video.quality}</div>
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <div class="duration">${video.duration}</div>
                </div>
                <div class="video-info">
                    <div class="channel-icon"></div>
                    <div class="video-details">
                        <h3>${video.title}</h3>
                        <p>${video.channel}</p>
                        <p>${video.views} • ${video.time}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

function playVideo(id) {
    const allVideos = [...MockDatabase.getUploadedVideos(), ...baseVideos];
    const video = allVideos.find(v => String(v.id) === String(id));
    if (!video) return;

    state.view = 'watch';
    const mainContent = document.getElementById('main-content');
    mainContent.style.opacity = '0';

    setTimeout(() => {
        const isSubscribed = state.user.subscriptions.includes(video.channel);
        const playerContent = video.videoSrc ?
            `<video src="${video.videoSrc}" controls autoplay style="width:100%; height:100%; border-radius:16px; object-fit: contain;"></video>` :
            `<div class="video-placeholder">
                <i data-lucide="play-circle" size="64"></i>
                <p>Universal Engine 4K: ${video.title}</p>
            </div>`;

        mainContent.innerHTML = `
            <div class="player-container liquid-container">
                <div class="player-wrapper">
                    ${playerContent}
                </div>
                <div class="video-info-hero">
                    <h1>${video.title}</h1>
                    <div class="video-meta-bar">
                        <div class="channel-group">
                            <div class="channel-icon" style="${state.user.username === video.channel && state.user.avatar ? `background-image: url(${state.user.avatar}); background-size: cover;` : ''}"></div>
                            <div class="channel-meta">
                                <strong>${video.channel}</strong>
                                <span>1.5M subscribers</span>
                            </div>
                            <button class="sub-btn ${isSubscribed ? 'subscribed' : ''}" onclick="window.toggleSub('${video.channel}')">
                                ${isSubscribed ? 'Subscribed' : 'Subscribe'}
                            </button>
                        </div>
                        <div class="action-buttons">
                            <button class="action-btn" onclick="window.triggerLike(this)"><i data-lucide="thumbs-up"></i> Like</button>
                            <button class="action-btn" onclick="window.triggerShare(this)"><i data-lucide="share-2"></i> Share</button>
                            <button class="action-btn" onclick="window.triggerSave(this)"><i data-lucide="bookmark"></i> Save</button>
                            <button class="action-btn" onclick="window.triggerDownload('${video.title}')"><i data-lucide="download"></i> Download</button>
                        </div>
                    </div>
                    <div class="video-description-box glass" style="margin-top:20px; padding:24px; border-radius:16px;">
                        <div style="display: flex; gap: 20px; margin-bottom: 12px; font-weight: 600; font-size: 0.9rem;">
                            <span>${video.views}</span>
                            <span>${video.time}</span>
                        </div>
                        <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-primary); white-space: pre-wrap;">${video.description || "The creator has not provided a description for this video."}</p>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
        mainContent.style.opacity = '1';
        window.scrollTo(0, 0);
    }, 300);
}

// --- GLOBAL INTERACTION HANDLERS ---
window.triggerLike = function (btn) {
    const icon = btn.querySelector('i');
    btn.classList.toggle('active');
    if (btn.classList.contains('active')) {
        btn.style.color = 'var(--accent)';
        btn.style.background = 'rgba(255, 59, 48, 0.1)';
    } else {
        btn.style.color = 'white';
        btn.style.background = 'var(--bg-secondary)';
    }
};

window.triggerShare = function (btn) {
    alert("Share Link Copied to Clipboard!");
};

window.triggerSave = function (btn) {
    btn.classList.toggle('active');
    btn.style.color = btn.classList.contains('active') ? '#34c759' : 'white';
    alert(btn.classList.contains('active') ? "Saved to Library" : "Removed from Library");
};

window.triggerDownload = function (title) {
    alert(`Starting download for: ${title}.mp4 (Quality: 4K Original)`);
};

// --- INTERACTIONS ---

window.safeAction = function (callback) {
    if (!SessionService.current()) {
        document.getElementById('auth-modal').classList.add('show');
        return;
    }
    callback();
};

window.toggleSub = function (channel) {
    const idx = state.user.subscriptions.indexOf(channel);
    if (idx > -1) state.user.subscriptions.splice(idx, 1);
    else state.user.subscriptions.push(channel);
    SessionService.updateUser(state.user);
    updateUI();
};

// --- EVENT LISTENERS ---

// Navigation
document.querySelector('.logo')?.addEventListener('click', showHome);
document.querySelector('.sidebar-item.active')?.addEventListener('click', (e) => {
    e.preventDefault();
    showHome();
});
document.querySelector('.mobile-bottom-nav .nav-item.active')?.addEventListener('click', (e) => {
    e.preventDefault();
    showHome();
});

document.getElementById('search-input')?.addEventListener('input', handleSearchInput);

const openUploadHandler = (e) => {
    e.preventDefault();
    document.getElementById('upload-modal').classList.add('show');
    initUploadSteps();
};

document.getElementById('open-upload')?.addEventListener('click', openUploadHandler);
document.querySelector('.nav-item .upload-pulse')?.parentElement?.addEventListener('click', openUploadHandler);

document.getElementById('close-upload-modal')?.addEventListener('click', () => {
    document.getElementById('upload-modal').classList.remove('show');
});

document.getElementById('video-file-input')?.addEventListener('change', handleFileUpload);
document.getElementById('dropzone')?.addEventListener('click', () => {
    document.getElementById('video-file-input').click();
});

document.getElementById('next-step')?.addEventListener('click', () => {
    if (state.uploadStep < 3) {
        state.uploadStep++;
        updateUploadStepUI();
    }
});

document.getElementById('prev-step')?.addEventListener('click', () => {
    if (state.uploadStep > 1) {
        state.uploadStep--;
        updateUploadStepUI();
    }
});

document.getElementById('finish-upload')?.addEventListener('click', finishUpload);

document.querySelectorAll('.thumb-option').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.thumb-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
    });
});

// Creator Hub triggers
document.querySelector('#profile-menu a[href="#"]')?.addEventListener('click', (e) => {
    if (e.target.innerText.includes('Your Channel')) {
        e.preventDefault();
        document.getElementById('profile-menu').classList.remove('show');
        document.getElementById('creator-modal').classList.add('show');
    }
});

document.getElementById('close-creator')?.addEventListener('click', () => {
    document.getElementById('creator-modal').classList.remove('show');
});

document.getElementById('nav-signin-btn')?.addEventListener('click', () => document.getElementById('auth-modal').classList.add('show'));
document.getElementById('close-auth')?.addEventListener('click', () => document.getElementById('auth-modal').classList.remove('show'));

document.getElementById('signup-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('signup-username').value;
    const p = document.getElementById('signup-password').value;
    const d = document.getElementById('signup-dob').value;
    const res = AuthService.register(u, p, d);
    if (res.success) alert("Account Created! You can now Sign In.");
});

document.getElementById('signin-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('signin-username').value;
    const p = document.getElementById('signin-password').value;
    const res = AuthService.login(u, p);
    if (res.success) location.reload();
    else alert(res.message);
});

document.getElementById('shree-toggle')?.addEventListener('click', () => document.getElementById('shree-chat').classList.add('show'));
document.getElementById('close-shree')?.addEventListener('click', () => document.getElementById('shree-chat').classList.remove('show'));

document.getElementById('profile-trigger')?.addEventListener('click', () => document.getElementById('profile-menu').classList.toggle('show'));

document.getElementById('google-signin-btn')?.addEventListener('click', () => {
    // Simulate a Google Sign-In Flow
    const btn = document.getElementById('google-signin-btn');
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Connecting to Google...';

    setTimeout(() => {
        const googleUser = {
            username: "Bhuban Creator",
            password: "oauth_simulated",
            dob: "1995-01-01",
            age: 29,
            isCreator: true, // System auto-grants creator status for Google IDs
            earnings: 2450.75,
            subscriptions: ["TechMaster", "Apple", "Bhuban AI"],
            likes: [],
            joinedDate: new Date().toISOString(),
            isGoogle: true,
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200" // Valid Google-style avatar
        };

        SessionService.create(googleUser);
        location.reload();
    }, 1500);
});

document.querySelector('.logout-red')?.addEventListener('click', () => AuthService.logout());

// Custom Profile Menu Triggers
document.getElementById('switch-to-signup')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signin-form-container').style.display = 'none';
    document.getElementById('signup-form-container').style.display = 'block';
});

document.getElementById('switch-to-signin')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signup-form-container').style.display = 'none';
    document.getElementById('signin-form-container').style.display = 'block';
});

// Initial Init
initPlatformUI();
updateUI();
renderVideos();

// Handle Splash Screen Removal
window.onload = () => {
    const splash = document.getElementById('splash-screen');
    setTimeout(() => {
        splash.classList.add('fade-out');
    }, 2500); // 2.5s display time
};
