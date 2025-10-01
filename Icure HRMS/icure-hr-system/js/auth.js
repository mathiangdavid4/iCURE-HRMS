// Enhanced Authentication with Security
document.addEventListener('DOMContentLoaded', function() {
    // Initialize database
    DB.init();

    // Tab switching
    const ownerTabBtn = document.getElementById('ownerTabBtn');
    const staffTabBtn = document.getElementById('staffTabBtn');
    
    if (ownerTabBtn && staffTabBtn) {
        ownerTabBtn.addEventListener('click', () => switchTab('owner'));
        staffTabBtn.addEventListener('click', () => switchTab('staff'));
    }

    // Login buttons
    const ownerLoginBtn = document.getElementById('ownerLoginBtn');
    const staffLoginBtn = document.getElementById('staffLoginBtn');
    
    if (ownerLoginBtn) {
        ownerLoginBtn.addEventListener('click', () => login('owner'));
    }
    
    if (staffLoginBtn) {
        staffLoginBtn.addEventListener('click', () => login('staff'));
    }

    // Enter key support
    const ownerEmail = document.getElementById('ownerEmail');
    const ownerPassword = document.getElementById('ownerPassword');
    const staffId = document.getElementById('staffId');
    const staffPassword = document.getElementById('staffPassword');

    [ownerEmail, ownerPassword, staffId, staffPassword].forEach(input => {
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const type = this.id.includes('owner') ? 'owner' : 'staff';
                    login(type);
                }
            });
        }
    });

    // Check if user is already logged in
    checkExistingSession();
});

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    if (tab === 'owner') {
        document.getElementById('ownerTabBtn').classList.add('active');
        document.getElementById('ownerTab').classList.add('active');
        document.getElementById('ownerEmail').focus();
    } else {
        document.getElementById('staffTabBtn').classList.add('active');
        document.getElementById('staffTab').classList.add('active');
        document.getElementById('staffId').focus();
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentNode.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function login(type) {
    const loginBtn = type === 'owner' ? 
        document.getElementById('ownerLoginBtn') : 
        document.getElementById('staffLoginBtn');
    
    // Show loading state
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    loginBtn.disabled = true;

    setTimeout(() => {
        let success = false;
        let user = null;

        if (type === 'owner') {
            const email = document.getElementById('ownerEmail').value;
            const password = document.getElementById('ownerPassword').value;
            
            user = DB.findUserByEmail(email);
            
            if (user && user.password === password && user.role === 'owner') {
                success = true;
            } else {
                showNotification('Invalid administrator credentials', 'error');
                // Security: Add delay for failed attempts
                setTimeout(() => {
                    resetLoginButton(loginBtn, originalText);
                }, 1000);
                return;
            }
        } else {
            const staffId = document.getElementById('staffId').value;
            const password = document.getElementById('staffPassword').value;
            
            user = DB.findUserByStaffId(staffId);
            
            if (user && user.password === password && user.role !== 'owner') {
                success = true;
            } else {
                showNotification('Invalid staff credentials', 'error');
                setTimeout(() => {
                    resetLoginButton(loginBtn, originalText);
                }, 1000);
                return;
            }
        }

        if (success && user) {
            // Store user session with timestamp
            const sessionData = {
                ...user,
                loginTime: new Date().toISOString(),
                sessionId: generateSessionId()
            };
            
            sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
            localStorage.setItem('lastLogin', new Date().toISOString());
            
            showNotification('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            resetLoginButton(loginBtn, originalText);
        }
    }, 1500); // Simulate authentication delay
}

function resetLoginButton(button, originalText) {
    button.innerHTML = originalText;
    button.disabled = false;
}

function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function checkExistingSession() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);
            // Check if session is less than 12 hours old
            const loginTime = new Date(user.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursDiff < 12) {
                window.location.href = 'dashboard.html';
            } else {
                // Session expired
                sessionStorage.removeItem('currentUser');
            }
        } catch (e) {
            sessionStorage.removeItem('currentUser');
        }
    }
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

// Online/Offline detection
window.addEventListener('online', function() {
    showNotification('Connection restored', 'success');
});

window.addEventListener('offline', function() {
    showNotification('Working offline - some features may be limited', 'warning');
});