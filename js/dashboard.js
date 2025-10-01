// Dashboard functionality - FIXED
function loadDashboard(section) {
    console.log('Loading dashboard...');
    
    try {
        const staff = DB.getStaff();
        const leaves = DB.getLeaves();
        const advances = DB.getAdvances();
        const payroll = DB.getPayroll();
        const attendance = DB.getAttendance();
        
        const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
        const pendingAdvances = advances.filter(a => a.status === 'pending').length;
        
        // Calculate present staff today
        const today = new Date().toDateString();
        const presentToday = attendance.filter(a => 
            new Date(a.date).toDateString() === today && a.timeIn
        ).length;

        section.innerHTML = `
            <div class="dashboard-cards">
                <div class="card primary">
                    <div class="card-header">
                        <h3>Total Staff</h3>
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="card-body">
                        <h2>${staff.length}</h2>
                        <p>Active employees</p>
                    </div>
                </div>
                <div class="card success">
                    <div class="card-header">
                        <h3>Present Today</h3>
                        <i class="fas fa-user-check"></i>
                    </div>
                    <div class="card-body">
                        <h2>${presentToday}</h2>
                        <p>${staff.length - presentToday} absent</p>
                    </div>
                </div>
                <div class="card warning">
                    <div class="card-header">
                        <h3>Pending Requests</h3>
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="card-body">
                        <h2>${pendingLeaves + pendingAdvances}</h2>
                        <p>${pendingLeaves} leaves, ${pendingAdvances} advances</p>
                    </div>
                </div>
                <div class="card danger">
                    <div class="card-header">
                        <h3>Payroll Due</h3>
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="card-body">
                        <h2>5 days</h2>
                        <p>Next payroll: 25th Oct 2023</p>
                    </div>
                </div>
            </div>

            <div class="quick-actions">
                <div class="action-btn" onclick="openAddUserModal()">
                    <i class="fas fa-user-plus"></i>
                    <span>Add User</span>
                </div>
                <div class="action-btn" onclick="openAddStaffModal()">
                    <i class="fas fa-user-md"></i>
                    <span>Add Staff</span>
                </div>
                <div class="action-btn" onclick="openSalarySettingsModal()">
                    <i class="fas fa-cog"></i>
                    <span>Salary Settings</span>
                </div>
                <div class="action-btn" onclick="generateDashboardReport()">
                    <i class="fas fa-chart-bar"></i>
                    <span>Generate Report</span>
                </div>
            </div>

            <div class="dashboard-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
                <div>
                    <h2 class="section-title">Recent Staff</h2>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Full Name</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${staff.slice(0, 5).map(employee => `
                                    <tr>
                                        <td>${employee.id}</td>
                                        <td>${employee.name}</td>
                                        <td><span class="role-badge role-${employee.role.toLowerCase().replace(' ', '')}">${employee.role}</span></td>
                                        <td>${employee.department}</td>
                                        <td>
                                            <button class="btn btn-primary btn-sm" onclick="viewStaff('${employee.id}')">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                                ${staff.length === 0 ? `
                                    <tr>
                                        <td colspan="5" style="text-align: center; color: #666;">
                                            No staff members found. <a href="#" onclick="loadSection('staffManagement')">Add staff</a>
                                        </td>
                                    </tr>
                                ` : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div>
                    <h2 class="section-title">Pending Approvals</h2>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Staff Name</th>
                                    <th>Details</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${[...leaves, ...advances]
                                    .filter(item => item.status === 'pending')
                                    .slice(0, 5)
                                    .map(item => {
                                        const employee = DB.findStaffById(item.employeeId);
                                        const isLeave = item.hasOwnProperty('leaveType');
                                        
                                        return `
                                            <tr>
                                                <td>${isLeave ? 'Leave' : 'Advance'}</td>
                                                <td>${employee ? employee.name : 'Unknown'}</td>
                                                <td>${isLeave ? item.leaveType : formatCurrency(item.amount)}</td>
                                                <td>
                                                    <button class="btn btn-success btn-sm" onclick="${isLeave ? `approveLeave('${item.id}')` : `approveAdvance('${item.id}')`}">Approve</button>
                                                    <button class="btn btn-danger btn-sm" onclick="${isLeave ? `rejectLeave('${item.id}')` : `rejectAdvance('${item.id}')`}">Reject</button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                ${[...leaves, ...advances].filter(item => item.status === 'pending').length === 0 ? `
                                    <tr>
                                        <td colspan="4" style="text-align: center; color: #666;">
                                            No pending approvals
                                        </td>
                                    </tr>
                                ` : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        console.log('Dashboard loaded successfully');
    } catch (error) {
        console.error('Error loading dashboard:', error);
        section.innerHTML = `
            <div class="alert alert-danger">
                <h4>Error Loading Dashboard</h4>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="loadSection('dashboard')">Retry</button>
            </div>
        `;
    }
}

// Add placeholder functions for dashboard actions
function openAddUserModal() {
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New User</h3>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <p>User management functionality will be available in the Staff Management section.</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('addUserModal')">Close</button>
                <button class="btn btn-primary" onclick="closeModal('addUserModal'); loadSection('staffManagement');">Go to Staff Management</button>
            </div>
        </div>
    `;
    
    createModal('addUserModal', modalContent);
    openModal('addUserModal');
}

function openAddStaffModal() {
    // This will be implemented in staff.js
    loadSection('staffManagement');
}

function openSalarySettingsModal() {
    // This will be implemented in payroll.js
    loadSection('payroll');
}

function generateDashboardReport() {
    showNotification('Report generation feature coming soon', 'info');
}

function viewStaff(staffId) {
    // This will be implemented in staff.js
    loadSection('staffManagement');
}

function approveLeave(leaveId) {
    showNotification('Leave approval feature coming soon', 'info');
}

function rejectLeave(leaveId) {
    showNotification('Leave rejection feature coming soon', 'info');
}

function approveAdvance(advanceId) {
    showNotification('Advance approval feature coming soon', 'info');
}

function rejectAdvance(advanceId) {
    showNotification('Advance rejection feature coming soon', 'info');
}