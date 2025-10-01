// Enhanced Settings functionality with backup features
function loadSettings(section) {
    const settings = DB.getSettings();
    const stats = DB.getDataStatistics();
    
    section.innerHTML = `
        <h2 class="section-title">System Settings</h2>
        
        <div class="card">
            <div class="card-header">
                <h3>Salary & NSSF Settings</h3>
            </div>
            <div class="card-body">
                <form id="settingsForm">
                    <div class="form-group">
                        <label for="nssfEmployee">NSSF Employee Contribution (%)</label>
                        <input type="number" id="nssfEmployee" class="form-control" value="${settings.nssfEmployee}" min="0" max="100" step="0.1">
                    </div>
                    <div class="form-group">
                        <label for="nssfEmployer">NSSF Employer Contribution (%)</label>
                        <input type="number" id="nssfEmployer" class="form-control" value="${settings.nssfEmployer}" min="0" max="100" step="0.1">
                    </div>
                    <div class="form-group">
                        <label for="payrollDate">Payroll Date</label>
                        <input type="number" id="payrollDate" class="form-control" value="${settings.payrollDate}" min="1" max="31">
                        <small>Day of the month when payroll is processed</small>
                    </div>
                    <div class="form-group">
                        <label for="currency">Currency</label>
                        <select id="currency" class="form-control">
                            <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                            <option value="SSP" ${settings.currency === 'SSP' ? 'selected' : ''}>South Sudanese Pound (SSP)</option>
                        </select>
                    </div>
                    <button type="button" class="btn btn-primary" onclick="saveSettings()">Save Settings</button>
                </form>
            </div>
        </div>

        <div class="card" style="margin-top: 30px;">
            <div class="card-header">
                <h3>Company Information</h3>
            </div>
            <div class="card-body">
                <div class="form-group">
                    <label for="companyName">Company Name</label>
                    <input type="text" id="companyName" class="form-control" value="${settings.companyName || 'iCure Medical Centre'}">
                </div>
                <div class="form-group">
                    <label for="companyAddress">Company Address</label>
                    <textarea id="companyAddress" class="form-control" rows="3">${settings.companyAddress || 'Juba, South Sudan'}</textarea>
                </div>
                <button type="button" class="btn btn-primary" onclick="saveCompanyInfo()">Save Company Info</button>
            </div>
        </div>

        <div class="card" style="margin-top: 30px;">
            <div class="card-header">
                <h3>Data Management & Backup</h3>
            </div>
            <div class="card-body">
                <div class="alert alert-warning" style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <strong><i class="fas fa-exclamation-triangle"></i> Important:</strong> 
                    Data is stored in your browser. Regular backups are recommended to prevent data loss.
                </div>

                <div class="data-statistics" style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <h4>Data Statistics</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 10px;">
                        <div>
                            <strong>Staff Records:</strong> ${stats.totalStaff}<br>
                            <strong>Leave Requests:</strong> ${stats.totalLeaves}<br>
                            <strong>Payroll Records:</strong> ${stats.totalPayroll}
                        </div>
                        <div>
                            <strong>Advance Requests:</strong> ${stats.totalAdvances}<br>
                            <strong>Attendance Records:</strong> ${stats.totalAttendance}<br>
                            <strong>Assets:</strong> ${stats.totalAssets}
                        </div>
                        <div>
                            <strong>Storage Used:</strong> ${stats.storageUsage.kilobytes} KB<br>
                            <strong>Last Backup:</strong> ${stats.lastBackup ? formatDate(stats.lastBackup) : 'Never'}
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="backupEnabled" ${settings.backupEnabled ? 'checked' : ''}> 
                        Enable backup reminders
                    </label>
                </div>

                <div class="form-group">
                    <label for="autoBackupDays">Backup Reminder Frequency (days)</label>
                    <input type="number" id="autoBackupDays" class="form-control" value="${settings.autoBackupDays || 7}" min="1" max="30">
                </div>

                <div style="display: flex; gap: 15px; margin-top: 20px; flex-wrap: wrap;">
                    <button class="btn btn-success" onclick="DB.exportData()">
                        <i class="fas fa-download"></i> Export Backup
                    </button>
                    <button class="btn btn-warning" onclick="document.getElementById('importFile').click()">
                        <i class="fas fa-upload"></i> Import Backup
                    </button>
                    ${localStorage.getItem('icure_pre_import_backup') ? `
                        <button class="btn btn-info" onclick="DB.restoreFromBackup()">
                            <i class="fas fa-history"></i> Restore Previous
                        </button>
                    ` : ''}
                    <button class="btn btn-danger" onclick="showClearDataModal()">
                        <i class="fas fa-trash"></i> Clear All Data
                    </button>
                </div>

                <input type="file" id="importFile" accept=".json" style="display: none;" 
                       onchange="DB.importData(this.files[0])">

                <div style="margin-top: 20px; font-size: 0.9rem; color: #666;">
                    <p><strong>Backup Tips:</strong></p>
                    <ul>
                        <li>Export backups regularly (weekly recommended)</li>
                        <li>Store backups in multiple locations</li>
                        <li>Test backup files by importing them</li>
                        <li>Keep historical backups for at least 3 months</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function saveSettings() {
    const nssfEmployee = parseFloat(document.getElementById('nssfEmployee').value);
    const nssfEmployer = parseFloat(document.getElementById('nssfEmployer').value);
    const payrollDate = parseInt(document.getElementById('payrollDate').value);
    const currency = document.getElementById('currency').value;
    const backupEnabled = document.getElementById('backupEnabled').checked;
    const autoBackupDays = parseInt(document.getElementById('autoBackupDays').value);

    const settings = {
        ...DB.getSettings(),
        nssfEmployee,
        nssfEmployer,
        payrollDate,
        currency,
        backupEnabled,
        autoBackupDays
    };

    DB.saveSettings(settings);
    showNotification('Settings saved successfully', 'success');
}

function saveCompanyInfo() {
    const companyName = document.getElementById('companyName').value;
    const companyAddress = document.getElementById('companyAddress').value;

    const settings = {
        ...DB.getSettings(),
        companyName,
        companyAddress
    };

    DB.saveSettings(settings);
    showNotification('Company information saved successfully', 'success');
}

function showClearDataModal() {
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header" style="background: #e74c3c;">
                <h3><i class="fas fa-exclamation-triangle"></i> Clear All Data</h3>
                <span class="close" onclick="closeModal('clearDataModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="alert alert-danger" style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px;">
                    <h4><i class="fas fa-radiation"></i> Extreme Danger</h4>
                    <p>This action will permanently delete:</p>
                    <ul>
                        <li>All staff records</li>
                        <li>All payroll data</li>
                        <li>All leave requests</li>
                        <li>All advance requests</li>
                        <li>All attendance records</li>
                        <li>All asset records</li>
                        <li>All system settings</li>
                    </ul>
                    <p><strong>This action cannot be undone!</strong></p>
                </div>
                
                <div class="form-group">
                    <p>Before proceeding, please ensure you have a recent backup.</p>
                    <button class="btn btn-success" onclick="DB.exportData(); closeModal('clearDataModal');">
                        <i class="fas fa-download"></i> Create Backup First
                    </button>
                </div>
                
                <div class="form-group">
                    <label for="confirmDelete">Type "DELETE ALL DATA" to confirm:</label>
                    <input type="text" id="confirmDelete" class="form-control" placeholder="DELETE ALL DATA">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('clearDataModal')">Cancel</button>
                <button class="btn btn-danger" id="confirmDeleteBtn" disabled onclick="confirmClearData()">
                    <i class="fas fa-trash"></i> Permanently Delete All Data
                </button>
            </div>
        </div>
    `;

    createModal('clearDataModal', modalContent);
    openModal('clearDataModal');

    // Enable delete button only when text matches
    const confirmInput = document.getElementById('confirmDelete');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    confirmInput.addEventListener('input', function() {
        confirmBtn.disabled = this.value !== 'DELETE ALL DATA';
    });
}

function confirmClearData() {
    closeModal('clearDataModal');
    DB.clearAllData();
}