// Main application functionality - FIXED INTEGRATION
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    console.log('App initialized for user:', currentUser.name);

    // Update user info in header
    updateUserInfo(currentUser);

    // Initialize event listeners
    initializeEventListeners();

    // Initialize mobile menu
    initMobileMenu();

    // Load dashboard by default
    loadSection('dashboard');
});

function updateUserInfo(user) {
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userName) {
        userName.textContent = user.name || 'User';
    }
    
    if (userAvatar) {
        const avatarName = user.name ? user.name.replace(' ', '+') : 'User';
        userAvatar.src = `https://ui-avatars.com/api/?name=${avatarName}&background=3498db&color=fff`;
    }
}

function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Sidebar navigation
    const menuItems = document.querySelectorAll('.sidebar-menu a[data-section]');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            console.log('Loading section:', section);
            loadSection(section);
        });
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        }
    });
}

function loadSection(sectionName) {
    console.log('Loading section:', sectionName);
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
    }
    
    // Add active class to clicked menu item
    const activeMenuItem = document.querySelector(`.sidebar-menu a[data-section="${sectionName}"]`);
    if (activeMenuItem) {
        activeMenuItem.parentElement.classList.add('active');
    }
    
    // Update page title and description
    updatePageTitle(sectionName);
    
    // Load section content
    loadSectionContent(sectionName);
}

function updatePageTitle(sectionName) {
    const titles = {
        dashboard: 'HR Dashboard',
        staffManagement: 'Staff Management',
        payroll: 'Payroll Management',
        leaveManagement: 'Leave Management',
        advances: 'Salary Advances',
        attendance: 'Attendance Tracking',
        settings: 'System Settings',
        assets: 'Facility Assets Management'
    };
    
    const descriptions = {
        dashboard: 'Welcome back, Administrator',
        staffManagement: 'Manage staff members and their information',
        payroll: 'Process payroll and manage salary payments',
        leaveManagement: 'Handle staff leave requests and approvals',
        advances: 'Manage salary advance requests',
        attendance: 'Track staff attendance and time records',
        settings: 'Configure system settings and preferences',
        assets: 'Manage facility assets and equipment'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');
    
    if (pageTitle) pageTitle.textContent = titles[sectionName] || 'HR System';
    if (pageDescription) pageDescription.textContent = descriptions[sectionName] || '';
}

function loadSectionContent(sectionName) {
    const section = document.getElementById(sectionName);
    if (!section) {
        console.error('Section not found:', sectionName);
        return;
    }

    console.log('Loading content for:', sectionName);

    // Clear existing content
    section.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Loading...</p></div>';

    // Load section content with error handling
    try {
        switch(sectionName) {
            case 'dashboard':
                if (typeof loadDashboard === 'function') {
                    setTimeout(() => loadDashboard(section), 100);
                } else {
                    throw new Error('loadDashboard function not found');
                }
                break;
            case 'staffManagement':
                if (typeof loadStaffManagement === 'function') {
                    setTimeout(() => loadStaffManagement(section), 100);
                } else {
                    throw new Error('loadStaffManagement function not found');
                }
                break;
            case 'payroll':
                if (typeof loadPayroll === 'function') {
                    setTimeout(() => loadPayroll(section), 100);
                } else {
                    throw new Error('loadPayroll function not found');
                }
                break;
            case 'leaveManagement':
                if (typeof loadLeaveManagement === 'function') {
                    setTimeout(() => loadLeaveManagement(section), 100);
                } else {
                    throw new Error('loadLeaveManagement function not found');
                }
                break;
            case 'advances':
                if (typeof loadAdvances === 'function') {
                    setTimeout(() => loadAdvances(section), 100);
                } else {
                    throw new Error('loadAdvances function not found');
                }
                break;
            case 'attendance':
                if (typeof loadAttendance === 'function') {
                    setTimeout(() => loadAttendance(section), 100);
                } else {
                    throw new Error('loadAttendance function not found');
                }
                break;
            case 'settings':
                if (typeof loadSettings === 'function') {
                    setTimeout(() => loadSettings(section), 100);
                } else {
                    throw new Error('loadSettings function not found');
                }
                break;
            case 'assets':
                if (typeof loadAssets === 'function') {
                    setTimeout(() => loadAssets(section), 100);
                } else {
                    throw new Error('loadAssets function not found');
                }
                break;
            default:
                section.innerHTML = '<div class="alert alert-warning">Section under development</div>';
        }
    } catch (error) {
        console.error('Error loading section:', sectionName, error);
        section.innerHTML = `
            <div class="alert alert-danger">
                <h4>Error Loading ${sectionName}</h4>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadSection('${sectionName}')">Retry</button>
            </div>
        `;
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Utility functions - MAKE THESE GLOBAL
window.formatCurrency = function(amount) {
    const settings = DB.getSettings();
    const symbol = settings.currency === 'USD' ? '$' : 'SSP ';
    return symbol + (amount || 0).toFixed(2);
}

window.formatDate = function(date) {
    if (!date) return '--';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

window.showNotification = function(message, type) {
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

// Modal functions - MAKE THESE GLOBAL
window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

window.createModal = function(modalId, content) {
    const modalsContainer = document.getElementById('modals-container');
    if (!modalsContainer) {
        console.error('Modals container not found');
        return;
    }

    // Remove existing modal if present
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal';
    modal.innerHTML = content;
    modalsContainer.appendChild(modal);
    
    // Add close event to close buttons
    const closeButtons = modal.querySelectorAll('.close');
    closeButtons.forEach(btn => {
        btn.onclick = function() {
            closeModal(modalId);
        };
    });
    
    return modal;
}

// Mobile menu functionality
window.initMobileMenu = function() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }

    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            document.querySelector('.main-content').classList.toggle('expanded');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar && !sidebar.contains(e.target) && 
            !e.target.closest('.mobile-toggle')) {
            sidebar.classList.remove('mobile-open');
        }
    });
}

// Download utility function
window.downloadTextFile = function(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Performance optimizations
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 250);
});

function handleResize() {
    if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-view');
    } else {
        document.body.classList.remove('mobile-view');
    }
}

// Error boundary for unhandled errors
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showNotification('An unexpected error occurred', 'error');
});

// Make sure all global functions are available
window.DB = DB;