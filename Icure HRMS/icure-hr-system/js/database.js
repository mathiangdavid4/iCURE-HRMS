// Database simulation using localStorage with backup functionality
const DB = {
    init: function() {
        // Initialize default data if not exists
        if (!localStorage.getItem('icure_users')) {
            const defaultUsers = [
                {
                    id: 'owner',
                    email: 'mathiangdavid4@gmail.com',
                    password: 'Mathiangdavid@123',
                    name: 'System Administrator',
                    role: 'owner',
                    permissions: ['all'],
                    staffId: 'OWNER-001'
                }
            ];
            localStorage.setItem('icure_users', JSON.stringify(defaultUsers));
        }

        if (!localStorage.getItem('icure_staff')) {
            localStorage.setItem('icure_staff', JSON.stringify([]));
        }

        if (!localStorage.getItem('icure_payroll')) {
            localStorage.setItem('icure_payroll', JSON.stringify([]));
        }

        if (!localStorage.getItem('icure_leaves')) {
            localStorage.setItem('icure_leaves', JSON.stringify([]));
        }

        if (!localStorage.getItem('icure_advances')) {
            localStorage.setItem('icure_advances', JSON.stringify([]));
        }

        if (!localStorage.getItem('icure_attendance')) {
            localStorage.setItem('icure_attendance', JSON.stringify([]));
        }

        if (!localStorage.getItem('icure_settings')) {
            const defaultSettings = {
                nssfEmployee: 8,
                nssfEmployer: 17,
                payrollDate: 25,
                currency: 'USD',
                companyName: 'iCure Medical Centre',
                companyAddress: 'Juba, South Sudan',
                backupEnabled: true,
                autoBackupDays: 7
            };
            localStorage.setItem('icure_settings', JSON.stringify(defaultSettings));
        }

        if (!localStorage.getItem('icure_assets')) {
            const defaultAssets = [
                {
                    id: 'AST-001',
                    name: 'Ultrasound Machine',
                    category: 'Medical Equipment',
                    location: 'Radiology Department',
                    status: 'in_use',
                    assignedTo: 'EMP-001',
                    purchaseDate: '2023-01-15',
                    value: 50000
                },
                {
                    id: 'AST-002',
                    name: 'Blood Analyzer',
                    category: 'Lab Equipment',
                    location: 'Laboratory',
                    status: 'in_use',
                    assignedTo: 'EMP-005',
                    purchaseDate: '2023-02-20',
                    value: 25000
                }
            ];
            localStorage.setItem('icure_assets', JSON.stringify(defaultAssets));
        }

        // Initialize backup reminder
        this.checkBackupReminder();
    },

    // User management
    getUsers: function() {
        return JSON.parse(localStorage.getItem('icure_users') || '[]');
    },

    saveUsers: function(users) {
        localStorage.setItem('icure_users', JSON.stringify(users));
        this.updateLastBackup();
    },

    // Staff management
    getStaff: function() {
        return JSON.parse(localStorage.getItem('icure_staff') || '[]');
    },

    saveStaff: function(staff) {
        localStorage.setItem('icure_staff', JSON.stringify(staff));
        this.updateLastBackup();
    },

    // Payroll management
    getPayroll: function() {
        return JSON.parse(localStorage.getItem('icure_payroll') || '[]');
    },

    savePayroll: function(payroll) {
        localStorage.setItem('icure_payroll', JSON.stringify(payroll));
        this.updateLastBackup();
    },

    // Leave management
    getLeaves: function() {
        return JSON.parse(localStorage.getItem('icure_leaves') || '[]');
    },

    saveLeaves: function(leaves) {
        localStorage.setItem('icure_leaves', JSON.stringify(leaves));
        this.updateLastBackup();
    },

    // Advances management
    getAdvances: function() {
        return JSON.parse(localStorage.getItem('icure_advances') || '[]');
    },

    saveAdvances: function(advances) {
        localStorage.setItem('icure_advances', JSON.stringify(advances));
        this.updateLastBackup();
    },

    // Attendance management
    getAttendance: function() {
        return JSON.parse(localStorage.getItem('icure_attendance') || '[]');
    },

    saveAttendance: function(attendance) {
        localStorage.setItem('icure_attendance', JSON.stringify(attendance));
        this.updateLastBackup();
    },

    // Settings management
    getSettings: function() {
        return JSON.parse(localStorage.getItem('icure_settings') || '{}');
    },

    saveSettings: function(settings) {
        localStorage.setItem('icure_settings', JSON.stringify(settings));
        this.updateLastBackup();
    },

    // Assets management
    getAssets: function() {
        return JSON.parse(localStorage.getItem('icure_assets') || '[]');
    },

    saveAssets: function(assets) {
        localStorage.setItem('icure_assets', JSON.stringify(assets));
        this.updateLastBackup();
    },

    // Utility methods
    generateId: function(prefix) {
        const items = this.getStaff();
        const nextId = items.length + 1;
        return `${prefix}-${nextId.toString().padStart(3, '0')}`;
    },

    // Find methods
    findUserByEmail: function(email) {
        const users = this.getUsers();
        return users.find(user => user.email === email);
    },

    findUserByStaffId: function(staffId) {
        const users = this.getUsers();
        return users.find(user => user.staffId === staffId);
    },

    findStaffById: function(id) {
        const staff = this.getStaff();
        return staff.find(employee => employee.id === id);
    },

    findUserById: function(id) {
        const users = this.getUsers();
        return users.find(user => user.id === id);
    },

    // Backup and Restore Functions
    exportData: function() {
        try {
            const data = {
                users: this.getUsers(),
                staff: this.getStaff(),
                payroll: this.getPayroll(),
                leaves: this.getLeaves(),
                advances: this.getAdvances(),
                attendance: this.getAttendance(),
                settings: this.getSettings(),
                assets: this.getAssets(),
                exportDate: new Date().toISOString(),
                version: '1.0',
                system: 'iCure HR Management System'
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `icure-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Update last backup date
            this.updateLastBackup();
            
            showNotification('Data exported successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Export error:', error);
            showNotification('Error exporting data: ' + error.message, 'error');
            return false;
        }
    },

    importData: function(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate backup file
                if (!data.system || !data.version) {
                    throw new Error('Invalid backup file format');
                }

                if (confirm('This will replace ALL current data. Are you sure you want to continue?')) {
                    // Backup current data first
                    const currentBackup = {
                        users: this.getUsers(),
                        staff: this.getStaff(),
                        payroll: this.getPayroll(),
                        leaves: this.getLeaves(),
                        advances: this.getAdvances(),
                        attendance: this.getAttendance(),
                        settings: this.getSettings(),
                        assets: this.getAssets(),
                        backupDate: new Date().toISOString()
                    };
                    
                    localStorage.setItem('icure_pre_import_backup', JSON.stringify(currentBackup));

                    // Import new data
                    localStorage.setItem('icure_users', JSON.stringify(data.users || []));
                    localStorage.setItem('icure_staff', JSON.stringify(data.staff || []));
                    localStorage.setItem('icure_payroll', JSON.stringify(data.payroll || []));
                    localStorage.setItem('icure_leaves', JSON.stringify(data.leaves || []));
                    localStorage.setItem('icure_advances', JSON.stringify(data.advances || []));
                    localStorage.setItem('icure_attendance', JSON.stringify(data.attendance || []));
                    localStorage.setItem('icure_settings', JSON.stringify(data.settings || this.getSettings()));
                    localStorage.setItem('icure_assets', JSON.stringify(data.assets || []));

                    this.updateLastBackup();
                    
                    showNotification('Data imported successfully! Page will reload...', 'success');
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            } catch (error) {
                console.error('Import error:', error);
                showNotification('Error importing data: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    },

    restoreFromBackup: function() {
        const backup = localStorage.getItem('icure_pre_import_backup');
        if (!backup) {
            showNotification('No previous backup found', 'error');
            return;
        }

        if (confirm('Restore data from previous backup? This will replace current data.')) {
            try {
                const data = JSON.parse(backup);
                
                localStorage.setItem('icure_users', JSON.stringify(data.users || []));
                localStorage.setItem('icure_staff', JSON.stringify(data.staff || []));
                localStorage.setItem('icure_payroll', JSON.stringify(data.payroll || []));
                localStorage.setItem('icure_leaves', JSON.stringify(data.leaves || []));
                localStorage.setItem('icure_advances', JSON.stringify(data.advances || []));
                localStorage.setItem('icure_attendance', JSON.stringify(data.attendance || []));
                localStorage.setItem('icure_settings', JSON.stringify(data.settings || this.getSettings()));
                localStorage.setItem('icure_assets', JSON.stringify(data.assets || []));

                showNotification('Data restored from backup! Page will reload...', 'success');
                
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } catch (error) {
                showNotification('Error restoring backup: ' + error.message, 'error');
            }
        }
    },

    updateLastBackup: function() {
        localStorage.setItem('icure_last_backup', new Date().toISOString());
    },

    getLastBackupDate: function() {
        const lastBackup = localStorage.getItem('icure_last_backup');
        return lastBackup ? new Date(lastBackup) : null;
    },

    checkBackupReminder: function() {
        const lastBackup = this.getLastBackupDate();
        const settings = this.getSettings();
        
        if (!settings.backupEnabled) return;

        if (!lastBackup) {
            // First time - show backup reminder
            setTimeout(() => {
                if (confirm('It\'s recommended to create a backup of your data. Would you like to create one now?')) {
                    this.exportData();
                }
            }, 3000);
            return;
        }

        const daysSinceBackup = Math.floor((new Date() - lastBackup) / (1000 * 60 * 60 * 24));
        const reminderDays = settings.autoBackupDays || 7;

        if (daysSinceBackup >= reminderDays) {
            setTimeout(() => {
                if (confirm(`Your last backup was ${daysSinceBackup} days ago. Would you like to create a new backup now?`)) {
                    this.exportData();
                }
            }, 2000);
        }
    },

    // Data statistics
    getDataStatistics: function() {
        return {
            totalStaff: this.getStaff().length,
            totalUsers: this.getUsers().length,
            totalPayroll: this.getPayroll().length,
            totalLeaves: this.getLeaves().length,
            totalAdvances: this.getAdvances().length,
            totalAttendance: this.getAttendance().length,
            totalAssets: this.getAssets().length,
            lastBackup: this.getLastBackupDate(),
            storageUsage: this.calculateStorageUsage()
        };
    },

    calculateStorageUsage: function() {
        let total = 0;
        const keys = [
            'icure_users', 'icure_staff', 'icure_payroll', 'icure_leaves',
            'icure_advances', 'icure_attendance', 'icure_settings', 'icure_assets'
        ];
        
        keys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                total += new Blob([data]).size;
            }
        });
        
        return {
            bytes: total,
            kilobytes: (total / 1024).toFixed(2),
            megabytes: (total / (1024 * 1024)).toFixed(2)
        };
    },

    // Clear all data (dangerous - for admin use only)
    clearAllData: function() {
        if (confirm('⚠️ DANGER: This will delete ALL data including staff, payroll, leaves, etc. This action cannot be undone!')) {
            if (confirm('Are you absolutely sure? Type "DELETE ALL" to confirm:')) {
                const confirmation = prompt('Type "DELETE ALL" to confirm deletion:');
                if (confirmation === 'DELETE ALL') {
                    // Create final backup
                    this.exportData();
                    
                    // Clear all data
                    const keys = [
                        'icure_users', 'icure_staff', 'icure_payroll', 'icure_leaves',
                        'icure_advances', 'icure_attendance', 'icure_settings', 'icure_assets',
                        'icure_last_backup', 'icure_pre_import_backup'
                    ];
                    
                    keys.forEach(key => {
                        localStorage.removeItem(key);
                    });
                    
                    showNotification('All data has been cleared. Page will reload...', 'success');
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000);
                } else {
                    showNotification('Data deletion cancelled', 'info');
                }
            }
        }
    }
};

// Initialize database when script loads
DB.init();