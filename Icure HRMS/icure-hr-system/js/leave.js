// Leave Management functionality
function loadLeaveManagement(section) {
    const leaves = DB.getLeaves();
    const staff = DB.getStaff();
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Check if current user is staff (not owner)
    const isStaff = currentUser.role !== 'owner';
    
    section.innerHTML = `
        <div class="quick-actions">
            <div class="action-btn" onclick="openRequestLeaveModal()">
                <i class="fas fa-plus"></i>
                <span>Request Leave</span>
            </div>
            <div class="action-btn" onclick="exportLeaveReport()">
                <i class="fas fa-file-export"></i>
                <span>Export Report</span>
            </div>
        </div>

        <div class="filters" style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center;">
            <div class="form-group" style="margin-bottom: 0;">
                <label for="leaveStatusFilter">Status</label>
                <select id="leaveStatusFilter" class="form-control" onchange="filterLeaves()" style="width: 150px;">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label for="leaveTypeFilter">Type</label>
                <select id="leaveTypeFilter" class="form-control" onchange="filterLeaves()" style="width: 150px;">
                    <option value="">All Types</option>
                    <option value="annual">Annual</option>
                    <option value="sick">Sick</option>
                    <option value="maternity">Maternity</option>
                    <option value="paternity">Paternity</option>
                    <option value="emergency">Emergency</option>
                    <option value="unpaid">Unpaid</option>
                </select>
            </div>
            ${!isStaff ? `
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="leaveEmployeeFilter">Employee</label>
                    <select id="leaveEmployeeFilter" class="form-control" onchange="filterLeaves()" style="width: 200px;">
                        <option value="">All Employees</option>
                        ${staff.map(emp => `<option value="${emp.id}">${emp.name}</option>`).join('')}
                    </select>
                </div>
            ` : ''}
        </div>

        <h2 class="section-title">Leave Requests</h2>
        <div id="leaveTableContainer">
            ${renderLeaveTable(leaves, staff, isStaff)}
        </div>
    `;
}

function renderLeaveTable(leaves, staff, isStaff = false) {
    // If staff user, only show their leaves
    if (isStaff) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        leaves = leaves.filter(leave => leave.employeeId === currentUser.staffId);
    }
    
    return `
        <table>
            <thead>
                <tr>
                    <th>Staff Name</th>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Applied On</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${leaves.map(leave => {
                    const employee = staff.find(s => s.id === leave.employeeId);
                    const startDate = new Date(leave.startDate);
                    const endDate = new Date(leave.endDate);
                    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                    
                    return `
                        <tr>
                            <td>${employee ? employee.name : 'Unknown'}</td>
                            <td>${getLeaveTypeDisplay(leave.leaveType)}</td>
                            <td>${formatDate(startDate)}</td>
                            <td>${formatDate(endDate)}</td>
                            <td>${days}</td>
                            <td>${leave.reason || 'N/A'}</td>
                            <td><span class="status-badge status-${leave.status}">${leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}</span></td>
                            <td>${formatDate(new Date(leave.created))}</td>
                            <td>
                                ${leave.status === 'pending' && !isStaff ? `
                                    <button class="btn btn-success btn-sm" onclick="approveLeave('${leave.id}')">Approve</button>
                                    <button class="btn btn-danger btn-sm" onclick="rejectLeave('${leave.id}')">Reject</button>
                                ` : `
                                    <button class="btn btn-primary btn-sm" onclick="viewLeave('${leave.id}')">View</button>
                                    ${isStaff && leave.status === 'pending' ? `
                                        <button class="btn btn-warning btn-sm" onclick="editLeave('${leave.id}')">Edit</button>
                                        <button class="btn btn-danger btn-sm" onclick="cancelLeave('${leave.id}')">Cancel</button>
                                    ` : ''}
                                `}
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function getLeaveTypeDisplay(type) {
    const typeMap = {
        'annual': 'Annual Leave',
        'sick': 'Sick Leave',
        'maternity': 'Maternity Leave',
        'paternity': 'Paternity Leave',
        'emergency': 'Emergency Leave',
        'unpaid': 'Unpaid Leave'
    };
    return typeMap[type] || type;
}

function filterLeaves() {
    const statusFilter = document.getElementById('leaveStatusFilter').value;
    const typeFilter = document.getElementById('leaveTypeFilter').value;
    const employeeFilter = document.getElementById('leaveEmployeeFilter')?.value;
    
    let leaves = DB.getLeaves();
    const staff = DB.getStaff();
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const isStaff = currentUser.role !== 'owner';
    
    // Apply filters
    if (statusFilter) {
        leaves = leaves.filter(leave => leave.status === statusFilter);
    }
    
    if (typeFilter) {
        leaves = leaves.filter(leave => leave.leaveType === typeFilter);
    }
    
    if (employeeFilter) {
        leaves = leaves.filter(leave => leave.employeeId === employeeFilter);
    }
    
    // If staff user, only show their leaves
    if (isStaff) {
        leaves = leaves.filter(leave => leave.employeeId === currentUser.staffId);
    }
    
    document.getElementById('leaveTableContainer').innerHTML = renderLeaveTable(leaves, staff, isStaff);
}

function openRequestLeaveModal() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const isStaff = currentUser.role !== 'owner';
    const staff = DB.getStaff();
    
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Request Leave</h3>
                <span class="close" onclick="closeModal('requestLeaveModal')">&times;</span>
            </div>
            <div class="modal-body">
                ${!isStaff ? `
                    <div class="form-group">
                        <label for="leaveEmployee">Employee *</label>
                        <select id="leaveEmployee" class="form-control" required>
                            <option value="">Select Employee</option>
                            ${staff.map(emp => `<option value="${emp.id}">${emp.name}</option>`).join('')}
                        </select>
                    </div>
                ` : ''}
                
                <div class="form-group">
                    <label for="leaveType">Leave Type *</label>
                    <select id="leaveType" class="form-control" required>
                        <option value="">Select Leave Type</option>
                        <option value="annual">Annual Leave</option>
                        <option value="sick">Sick Leave</option>
                        <option value="maternity">Maternity Leave</option>
                        <option value="paternity">Paternity Leave</option>
                        <option value="emergency">Emergency Leave</option>
                        <option value="unpaid">Unpaid Leave</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="leaveStartDate">Start Date *</label>
                    <input type="date" id="leaveStartDate" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="leaveEndDate">End Date *</label>
                    <input type="date" id="leaveEndDate" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="leaveReason">Reason *</label>
                    <textarea id="leaveReason" class="form-control" placeholder="Enter reason for leave" rows="4" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="leaveContact">Contact During Leave</label>
                    <input type="text" id="leaveContact" class="form-control" placeholder="Phone number or email">
                </div>
                
                <div class="form-group">
                    <label for="leaveHandover">Handover Notes</label>
                    <textarea id="leaveHandover" class="form-control" placeholder="Any handover information" rows="3"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('requestLeaveModal')">Cancel</button>
                <button class="btn btn-primary" onclick="submitLeaveRequest()">Submit Request</button>
            </div>
        </div>
    `;
    
    createModal('requestLeaveModal', modalContent);
    openModal('requestLeaveModal');
    
    // Set default dates
    const today = new Date();
    document.getElementById('leaveStartDate').valueAsDate = today;
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    document.getElementById('leaveEndDate').valueAsDate = nextWeek;
    
    // If staff user, auto-select their name
    if (isStaff) {
        setTimeout(() => {
            document.getElementById('leaveEmployee').value = currentUser.staffId;
        }, 100);
    }
}

function submitLeaveRequest() {
    const employeeId = document.getElementById('leaveEmployee').value;
    const leaveType = document.getElementById('leaveType').value;
    const startDate = document.getElementById('leaveStartDate').value;
    const endDate = document.getElementById('leaveEndDate').value;
    const reason = document.getElementById('leaveReason').value;
    const contact = document.getElementById('leaveContact').value;
    const handover = document.getElementById('leaveHandover').value;
    
    // Validation
    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
        showNotification('End date cannot be before start date', 'error');
        return;
    }
    
    const leaves = DB.getLeaves();
    
    // Create new leave request
    const newLeave = {
        id: 'LEAVE-' + DB.generateId('LEAVE'),
        employeeId: employeeId,
        leaveType: leaveType,
        startDate: startDate,
        endDate: endDate,
        reason: reason,
        contact: contact,
        handover: handover,
        status: 'pending',
        created: new Date().toISOString()
    };
    
    leaves.push(newLeave);
    DB.saveLeaves(leaves);
    
    closeModal('requestLeaveModal');
    showNotification('Leave request submitted successfully', 'success');
    
    // Refresh the leave table
    loadSection('leaveManagement');
}

function approveLeave(leaveId) {
    if (!confirm('Are you sure you want to approve this leave request?')) {
        return;
    }
    
    const leaves = DB.getLeaves();
    const leaveIndex = leaves.findIndex(l => l.id === leaveId);
    
    if (leaveIndex === -1) {
        showNotification('Leave request not found', 'error');
        return;
    }
    
    leaves[leaveIndex].status = 'approved';
    leaves[leaveIndex].approvedBy = JSON.parse(sessionStorage.getItem('currentUser')).id;
    leaves[leaveIndex].approvedAt = new Date().toISOString();
    
    DB.saveLeaves(leaves);
    showNotification('Leave request approved', 'success');
    
    // Refresh the leave table
    loadSection('leaveManagement');
}

function rejectLeave(leaveId) {
    if (!confirm('Are you sure you want to reject this leave request?')) {
        return;
    }
    
    const leaves = DB.getLeaves();
    const leaveIndex = leaves.findIndex(l => l.id === leaveId);
    
    if (leaveIndex === -1) {
        showNotification('Leave request not found', 'error');
        return;
    }
    
    leaves[leaveIndex].status = 'rejected';
    leaves[leaveIndex].approvedBy = JSON.parse(sessionStorage.getItem('currentUser')).id;
    leaves[leaveIndex].approvedAt = new Date().toISOString();
    
    DB.saveLeaves(leaves);
    showNotification('Leave request rejected', 'success');
    
    // Refresh the leave table
    loadSection('leaveManagement');
}

function viewLeave(leaveId) {
    const leave = DB.getLeaves().find(l => l.id === leaveId);
    const employee = DB.findStaffById(leave.employeeId);
    const approver = leave.approvedBy ? DB.findUserById(leave.approvedBy) : null;
    
    if (!leave) {
        showNotification('Leave request not found', 'error');
        return;
    }
    
    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    const modalContent = `
        <div class="modal-content" style="width: 600px;">
            <div class="modal-header">
                <h3>Leave Request Details</h3>
                <span class="close" onclick="closeModal('viewLeaveModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4>Employee Information</h4>
                        <p><strong>Name:</strong> ${employee?.name || 'Unknown'}</p>
                        <p><strong>Employee ID:</strong> ${leave.employeeId}</p>
                        <p><strong>Department:</strong> ${employee?.department || 'N/A'}</p>
                    </div>
                    <div>
                        <h4>Leave Details</h4>
                        <p><strong>Type:</strong> ${getLeaveTypeDisplay(leave.leaveType)}</p>
                        <p><strong>Duration:</strong> ${days} days</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${leave.status}">${leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}</span></p>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <h4>Dates</h4>
                    <p><strong>Start Date:</strong> ${formatDate(startDate)}</p>
                    <p><strong>End Date:</strong> ${formatDate(endDate)}</p>
                    <p><strong>Applied On:</strong> ${formatDate(new Date(leave.created))}</p>
                    ${leave.approvedAt ? `<p><strong>${leave.status === 'approved' ? 'Approved' : 'Rejected'} On:</strong> ${formatDate(new Date(leave.approvedAt))}</p>` : ''}
                    ${approver ? `<p><strong>${leave.status === 'approved' ? 'Approved' : 'Rejected'} By:</strong> ${approver.name}</p>` : ''}
                </div>
                
                <div style="margin-top: 20px;">
                    <h4>Reason</h4>
                    <p>${leave.reason || 'N/A'}</p>
                </div>
                
                ${leave.contact ? `
                    <div style="margin-top: 20px;">
                        <h4>Contact During Leave</h4>
                        <p>${leave.contact}</p>
                    </div>
                ` : ''}
                
                ${leave.handover ? `
                    <div style="margin-top: 20px;">
                        <h4>Handover Notes</h4>
                        <p>${leave.handover}</p>
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('viewLeaveModal')">Close</button>
            </div>
        </div>
    `;
    
    createModal('viewLeaveModal', modalContent);
    openModal('viewLeaveModal');
}

function editLeave(leaveId) {
    // Implementation for editing leave requests
    showNotification('Edit leave functionality would be implemented here', 'info');
}

function cancelLeave(leaveId) {
    if (!confirm('Are you sure you want to cancel this leave request?')) {
        return;
    }
    
    const leaves = DB.getLeaves();
    const leaveIndex = leaves.findIndex(l => l.id === leaveId);
    
    if (leaveIndex === -1) {
        showNotification('Leave request not found', 'error');
        return;
    }
    
    leaves.splice(leaveIndex, 1);
    DB.saveLeaves(leaves);
    
    showNotification('Leave request cancelled', 'success');
    
    // Refresh the leave table
    loadSection('leaveManagement');
}

function exportLeaveReport() {
    const leaves = DB.getLeaves();
    const staff = DB.getStaff();
    
    const reportData = leaves.map(leave => {
        const employee = staff.find(s => s.id === leave.employeeId);
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        return {
            'Employee ID': leave.employeeId,
            'Employee Name': employee?.name || 'Unknown',
            'Leave Type': getLeaveTypeDisplay(leave.leaveType),
            'Start Date': formatDate(startDate),
            'End Date': formatDate(endDate),
            'Days': days,
            'Reason': leave.reason || 'N/A',
            'Status': leave.status.charAt(0).toUpperCase() + leave.status.slice(1),
            'Applied Date': formatDate(new Date(leave.created))
        };
    });
    
    const headers = Object.keys(reportData[0]);
    const csvContent = [
        headers.join(','),
        ...reportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    downloadTextFile(csvContent, `icure-leave-report-${new Date().toISOString().split('T')[0]}.csv`);
    showNotification('Leave report exported successfully', 'success');
}