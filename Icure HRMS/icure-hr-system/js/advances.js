// Salary Advances Management functionality
function loadAdvances(section) {
    const advances = DB.getAdvances();
    const staff = DB.getStaff();
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Check if current user is staff (not owner)
    const isStaff = currentUser.role !== 'owner';
    
    section.innerHTML = `
        <div class="quick-actions">
            <div class="action-btn" onclick="openRequestAdvanceModal()">
                <i class="fas fa-plus"></i>
                <span>Request Advance</span>
            </div>
            <div class="action-btn" onclick="exportAdvancesReport()">
                <i class="fas fa-file-export"></i>
                <span>Export Report</span>
            </div>
            <div class="action-btn" onclick="openAdvanceSettings()">
                <i class="fas fa-cog"></i>
                <span>Settings</span>
            </div>
        </div>

        <div class="filters" style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center;">
            <div class="form-group" style="margin-bottom: 0;">
                <label for="advanceStatusFilter">Status</label>
                <select id="advanceStatusFilter" class="form-control" onchange="filterAdvances()" style="width: 150px;">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="repaid">Repaid</option>
                </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label for="advanceRepaymentFilter">Repayment Plan</label>
                <select id="advanceRepaymentFilter" class="form-control" onchange="filterAdvances()" style="width: 180px;">
                    <option value="">All Plans</option>
                    <option value="one_month">One Month</option>
                    <option value="two_months">Two Months</option>
                    <option value="three_months">Three Months</option>
                    <option value="six_months">Six Months</option>
                </select>
            </div>
            ${!isStaff ? `
                <div class="form-group" style="margin-bottom: 0;">
                    <label for="advanceEmployeeFilter">Employee</label>
                    <select id="advanceEmployeeFilter" class="form-control" onchange="filterAdvances()" style="width: 200px;">
                        <option value="">All Employees</option>
                        ${staff.map(emp => `<option value="${emp.id}">${emp.name}</option>`).join('')}
                    </select>
                </div>
            ` : ''}
        </div>

        <h2 class="section-title">Salary Advance Requests</h2>
        <div id="advancesTableContainer">
            ${renderAdvancesTable(advances, staff, isStaff)}
        </div>
        
        <div style="margin-top: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h3>Advance Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 15px;">
                <div class="card primary">
                    <div class="card-header">
                        <h3>Total Advances</h3>
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                    <div class="card-body">
                        <h2>${formatCurrency(calculateTotalAdvances(advances))}</h2>
                        <p>All time</p>
                    </div>
                </div>
                <div class="card warning">
                    <div class="card-header">
                        <h3>Pending Requests</h3>
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="card-body">
                        <h2>${advances.filter(a => a.status === 'pending').length}</h2>
                        <p>Awaiting approval</p>
                    </div>
                </div>
                <div class="card success">
                    <div class="card-header">
                        <h3>Active Advances</h3>
                        <i class="fas fa-sync"></i>
                    </div>
                    <div class="card-body">
                        <h2>${advances.filter(a => a.status === 'approved' && !a.repaid).length}</h2>
                        <p>Being repaid</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAdvancesTable(advances, staff, isStaff = false) {
    // If staff user, only show their advances
    if (isStaff) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        advances = advances.filter(advance => advance.employeeId === currentUser.staffId);
    }
    
    return `
        <table>
            <thead>
                <tr>
                    <th>Staff Name</th>
                    <th>Amount</th>
                    <th>Request Date</th>
                    <th>Reason</th>
                    <th>Repayment Plan</th>
                    <th>Monthly Payment</th>
                    <th>Status</th>
                    <th>Approved By</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${advances.map(advance => {
                    const employee = staff.find(s => s.id === advance.employeeId);
                    const approver = advance.approvedBy ? DB.findUserById(advance.approvedBy) : null;
                    const monthlyPayment = calculateMonthlyPayment(advance.amount, advance.repaymentPlan);
                    
                    return `
                        <tr>
                            <td>${employee ? employee.name : 'Unknown'}</td>
                            <td><strong>${formatCurrency(advance.amount)}</strong></td>
                            <td>${formatDate(new Date(advance.requestDate))}</td>
                            <td>${advance.reason || 'N/A'}</td>
                            <td>${getRepaymentPlanDisplay(advance.repaymentPlan)}</td>
                            <td>${formatCurrency(monthlyPayment)}</td>
                            <td>
                                <span class="status-badge status-${advance.status}">
                                    ${advance.status.charAt(0).toUpperCase() + advance.status.slice(1)}
                                    ${advance.repaid ? ' (Repaid)' : ''}
                                </span>
                            </td>
                            <td>${approver ? approver.name : 'N/A'}</td>
                            <td>
                                ${advance.status === 'pending' && !isStaff ? `
                                    <button class="btn btn-success btn-sm" onclick="approveAdvance('${advance.id}')">Approve</button>
                                    <button class="btn btn-danger btn-sm" onclick="rejectAdvance('${advance.id}')">Reject</button>
                                ` : `
                                    <button class="btn btn-primary btn-sm" onclick="viewAdvance('${advance.id}')">View</button>
                                    ${(isStaff && advance.status === 'pending') ? `
                                        <button class="btn btn-warning btn-sm" onclick="editAdvance('${advance.id}')">Edit</button>
                                        <button class="btn btn-danger btn-sm" onclick="cancelAdvance('${advance.id}')">Cancel</button>
                                    ` : ''}
                                    ${(advance.status === 'approved' && !advance.repaid && !isStaff) ? `
                                        <button class="btn btn-info btn-sm" onclick="markAsRepaid('${advance.id}')">Mark Repaid</button>
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

function getRepaymentPlanDisplay(plan) {
    const planMap = {
        'one_month': '1 Month',
        'two_months': '2 Months',
        'three_months': '3 Months',
        'six_months': '6 Months'
    };
    return planMap[plan] || plan;
}

function calculateMonthlyPayment(amount, repaymentPlan) {
    const monthsMap = {
        'one_month': 1,
        'two_months': 2,
        'three_months': 3,
        'six_months': 6
    };
    
    const months = monthsMap[repaymentPlan] || 1;
    return amount / months;
}

function calculateTotalAdvances(advances) {
    return advances.reduce((total, advance) => {
        if (advance.status === 'approved' && !advance.repaid) {
            return total + advance.amount;
        }
        return total;
    }, 0);
}

function filterAdvances() {
    const statusFilter = document.getElementById('advanceStatusFilter').value;
    const repaymentFilter = document.getElementById('advanceRepaymentFilter').value;
    const employeeFilter = document.getElementById('advanceEmployeeFilter')?.value;
    
    let advances = DB.getAdvances();
    const staff = DB.getStaff();
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const isStaff = currentUser.role !== 'owner';
    
    // Apply filters
    if (statusFilter) {
        advances = advances.filter(advance => advance.status === statusFilter);
    }
    
    if (repaymentFilter) {
        advances = advances.filter(advance => advance.repaymentPlan === repaymentFilter);
    }
    
    if (employeeFilter) {
        advances = advances.filter(advance => advance.employeeId === employeeFilter);
    }
    
    // If staff user, only show their advances
    if (isStaff) {
        advances = advances.filter(advance => advance.employeeId === currentUser.staffId);
    }
    
    document.getElementById('advancesTableContainer').innerHTML = renderAdvancesTable(advances, staff, isStaff);
}

function openRequestAdvanceModal() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const isStaff = currentUser.role !== 'owner';
    const staff = DB.getStaff();
    const employee = isStaff ? DB.findStaffById(currentUser.staffId) : null;
    
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Request Salary Advance</h3>
                <span class="close" onclick="closeModal('requestAdvanceModal')">&times;</span>
            </div>
            <div class="modal-body">
                ${!isStaff ? `
                    <div class="form-group">
                        <label for="advanceEmployee">Employee *</label>
                        <select id="advanceEmployee" class="form-control" required>
                            <option value="">Select Employee</option>
                            ${staff.map(emp => `<option value="${emp.id}">${emp.name} - ${formatCurrency(emp.salary || 0)} salary</option>`).join('')}
                        </select>
                    </div>
                ` : `
                    <div class="alert alert-info" style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <strong>Employee:</strong> ${employee?.name}<br>
                        <strong>Current Salary:</strong> ${formatCurrency(employee?.salary || 0)}<br>
                        <strong>Maximum Advance:</strong> ${formatCurrency(calculateMaxAdvance(employee?.salary || 0))}
                    </div>
                `}
                
                <div class="form-group">
                    <label for="advanceAmount">Advance Amount ($) *</label>
                    <input type="number" id="advanceAmount" class="form-control" 
                           placeholder="Enter amount" min="1" step="0.01" required
                           onchange="validateAdvanceAmount()">
                    <small id="amountHelp" class="form-text text-muted">
                        Maximum advance: ${formatCurrency(calculateMaxAdvance(employee?.salary || 0))}
                    </small>
                </div>
                
                <div class="form-group">
                    <label for="advanceRepayment">Repayment Plan *</label>
                    <select id="advanceRepayment" class="form-control" required onchange="updateMonthlyPayment()">
                        <option value="">Select Repayment Plan</option>
                        <option value="one_month">1 Month (Full amount next salary)</option>
                        <option value="two_months">2 Months (50% each month)</option>
                        <option value="three_months">3 Months (33% each month)</option>
                        <option value="six_months">6 Months (16.7% each month)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Monthly Payment</label>
                    <div id="monthlyPaymentDisplay" style="padding: 10px; background: #f8f9fa; border-radius: 4px;">
                        Please select amount and repayment plan
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="advanceReason">Reason for Advance *</label>
                    <textarea id="advanceReason" class="form-control" placeholder="Explain why you need this advance" rows="4" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="advanceEmergency">Emergency Contact</label>
                    <input type="text" id="advanceEmergency" class="form-control" placeholder="Emergency contact details">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('requestAdvanceModal')">Cancel</button>
                <button class="btn btn-primary" onclick="submitAdvanceRequest()">Submit Request</button>
            </div>
        </div>
    `;
    
    createModal('requestAdvanceModal', modalContent);
    openModal('requestAdvanceModal');
    
    // If staff user, auto-select their name and set max amount
    if (isStaff) {
        setTimeout(() => {
            document.getElementById('advanceEmployee').value = currentUser.staffId;
            document.getElementById('advanceAmount').max = calculateMaxAdvance(employee?.salary || 0);
        }, 100);
    }
}

function calculateMaxAdvance(salary) {
    // Maximum advance is 50% of monthly salary
    return salary * 0.5;
}

function validateAdvanceAmount() {
    const amountInput = document.getElementById('advanceAmount');
    const amount = parseFloat(amountInput.value);
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const isStaff = currentUser.role !== 'owner';
    
    if (isStaff) {
        const employee = DB.findStaffById(currentUser.staffId);
        const maxAdvance = calculateMaxAdvance(employee?.salary || 0);
        
        if (amount > maxAdvance) {
            showNotification(`Amount cannot exceed maximum advance of ${formatCurrency(maxAdvance)}`, 'error');
            amountInput.value = maxAdvance;
        }
    }
    
    updateMonthlyPayment();
}

function updateMonthlyPayment() {
    const amount = parseFloat(document.getElementById('advanceAmount').value) || 0;
    const repaymentPlan = document.getElementById('advanceRepayment').value;
    
    if (amount > 0 && repaymentPlan) {
        const monthlyPayment = calculateMonthlyPayment(amount, repaymentPlan);
        document.getElementById('monthlyPaymentDisplay').innerHTML = `
            <strong>${formatCurrency(monthlyPayment)}</strong> per month for ${getRepaymentPlanDisplay(repaymentPlan)}
        `;
    } else {
        document.getElementById('monthlyPaymentDisplay').textContent = 'Please select amount and repayment plan';
    }
}

function submitAdvanceRequest() {
    const employeeId = document.getElementById('advanceEmployee').value;
    const amount = parseFloat(document.getElementById('advanceAmount').value);
    const repaymentPlan = document.getElementById('advanceRepayment').value;
    const reason = document.getElementById('advanceReason').value;
    const emergencyContact = document.getElementById('advanceEmergency').value;
    
    // Validation
    if (!employeeId || !amount || !repaymentPlan || !reason) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (amount <= 0) {
        showNotification('Advance amount must be greater than 0', 'error');
        return;
    }
    
    const employee = DB.findStaffById(employeeId);
    if (!employee) {
        showNotification('Employee not found', 'error');
        return;
    }
    
    // Check if amount exceeds maximum
    const maxAdvance = calculateMaxAdvance(employee.salary || 0);
    if (amount > maxAdvance) {
        showNotification(`Advance amount cannot exceed ${formatCurrency(maxAdvance)} (50% of salary)`, 'error');
        return;
    }
    
    const advances = DB.getAdvances();
    
    // Check for existing pending advances
    const existingPending = advances.find(a => 
        a.employeeId === employeeId && a.status === 'pending'
    );
    
    if (existingPending) {
        showNotification('This employee already has a pending advance request', 'error');
        return;
    }
    
    // Create new advance request
    const newAdvance = {
        id: 'ADV-' + DB.generateId('ADV'),
        employeeId: employeeId,
        amount: amount,
        requestDate: new Date().toISOString().split('T')[0],
        reason: reason,
        repaymentPlan: repaymentPlan,
        emergencyContact: emergencyContact,
        status: 'pending',
        repaid: false,
        created: new Date().toISOString()
    };
    
    advances.push(newAdvance);
    DB.saveAdvances(advances);
    
    closeModal('requestAdvanceModal');
    showNotification('Advance request submitted successfully', 'success');
    
    // Refresh the advances table
    loadSection('advances');
}

function approveAdvance(advanceId) {
    if (!confirm('Are you sure you want to approve this advance request?')) {
        return;
    }
    
    const advances = DB.getAdvances();
    const advanceIndex = advances.findIndex(a => a.id === advanceId);
    
    if (advanceIndex === -1) {
        showNotification('Advance request not found', 'error');
        return;
    }
    
    advances[advanceIndex].status = 'approved';
    advances[advanceIndex].approvedBy = JSON.parse(sessionStorage.getItem('currentUser')).id;
    advances[advanceIndex].approvedAt = new Date().toISOString();
    
    DB.saveAdvances(advances);
    showNotification('Advance request approved', 'success');
    
    // Refresh the advances table
    loadSection('advances');
}

function rejectAdvance(advanceId) {
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Reject Advance Request</h3>
                <span class="close" onclick="closeModal('rejectAdvanceModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="rejectionReason">Reason for Rejection *</label>
                    <textarea id="rejectionReason" class="form-control" placeholder="Explain why this advance is being rejected" rows="4" required></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('rejectAdvanceModal')">Cancel</button>
                <button class="btn btn-danger" onclick="confirmRejectAdvance('${advanceId}')">Reject Advance</button>
            </div>
        </div>
    `;
    
    createModal('rejectAdvanceModal', modalContent);
    openModal('rejectAdvanceModal');
}

function confirmRejectAdvance(advanceId) {
    const rejectionReason = document.getElementById('rejectionReason').value;
    
    if (!rejectionReason) {
        showNotification('Please provide a reason for rejection', 'error');
        return;
    }
    
    const advances = DB.getAdvances();
    const advanceIndex = advances.findIndex(a => a.id === advanceId);
    
    if (advanceIndex === -1) {
        showNotification('Advance request not found', 'error');
        return;
    }
    
    advances[advanceIndex].status = 'rejected';
    advances[advanceIndex].approvedBy = JSON.parse(sessionStorage.getItem('currentUser')).id;
    advances[advanceIndex].approvedAt = new Date().toISOString();
    advances[advanceIndex].rejectionReason = rejectionReason;
    
    DB.saveAdvances(advances);
    
    closeModal('rejectAdvanceModal');
    showNotification('Advance request rejected', 'success');
    
    // Refresh the advances table
    loadSection('advances');
}

function viewAdvance(advanceId) {
    const advance = DB.getAdvances().find(a => a.id === advanceId);
    const employee = DB.findStaffById(advance.employeeId);
    const approver = advance.approvedBy ? DB.findUserById(advance.approvedBy) : null;
    
    if (!advance) {
        showNotification('Advance request not found', 'error');
        return;
    }
    
    const monthlyPayment = calculateMonthlyPayment(advance.amount, advance.repaymentPlan);
    
    const modalContent = `
        <div class="modal-content" style="width: 600px;">
            <div class="modal-header">
                <h3>Advance Request Details</h3>
                <span class="close" onclick="closeModal('viewAdvanceModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4>Employee Information</h4>
                        <p><strong>Name:</strong> ${employee?.name || 'Unknown'}</p>
                        <p><strong>Employee ID:</strong> ${advance.employeeId}</p>
                        <p><strong>Department:</strong> ${employee?.department || 'N/A'}</p>
                        <p><strong>Salary:</strong> ${formatCurrency(employee?.salary || 0)}</p>
                    </div>
                    <div>
                        <h4>Advance Details</h4>
                        <p><strong>Amount:</strong> ${formatCurrency(advance.amount)}</p>
                        <p><strong>Repayment Plan:</strong> ${getRepaymentPlanDisplay(advance.repaymentPlan)}</p>
                        <p><strong>Monthly Payment:</strong> ${formatCurrency(monthlyPayment)}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${advance.status}">${advance.status.charAt(0).toUpperCase() + advance.status.slice(1)}</span></p>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <h4>Timeline</h4>
                    <p><strong>Request Date:</strong> ${formatDate(new Date(advance.requestDate))}</p>
                    <p><strong>Applied On:</strong> ${formatDate(new Date(advance.created))}</p>
                    ${advance.approvedAt ? `<p><strong>${advance.status === 'approved' ? 'Approved' : 'Rejected'} On:</strong> ${formatDate(new Date(advance.approvedAt))}</p>` : ''}
                    ${approver ? `<p><strong>${advance.status === 'approved' ? 'Approved' : 'Rejected'} By:</strong> ${approver.name}</p>` : ''}
                </div>
                
                <div style="margin-top: 20px;">
                    <h4>Reason for Advance</h4>
                    <p>${advance.reason || 'N/A'}</p>
                </div>
                
                ${advance.emergencyContact ? `
                    <div style="margin-top: 20px;">
                        <h4>Emergency Contact</h4>
                        <p>${advance.emergencyContact}</p>
                    </div>
                ` : ''}
                
                ${advance.rejectionReason ? `
                    <div style="margin-top: 20px;">
                        <h4>Rejection Reason</h4>
                        <p style="color: #e74c3c;">${advance.rejectionReason}</p>
                    </div>
                ` : ''}
                
                ${advance.repaid ? `
                    <div style="margin-top: 20px;">
                        <h4>Repayment Status</h4>
                        <p><strong>Status:</strong> <span class="status-badge status-approved">Fully Repaid</span></p>
                        ${advance.repaidDate ? `<p><strong>Repaid On:</strong> ${formatDate(new Date(advance.repaidDate))}</p>` : ''}
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('viewAdvanceModal')">Close</button>
            </div>
        </div>
    `;
    
    createModal('viewAdvanceModal', modalContent);
    openModal('viewAdvanceModal');
}

function editAdvance(advanceId) {
    // Implementation for editing advance requests
    showNotification('Edit advance functionality would be implemented here', 'info');
}

function cancelAdvance(advanceId) {
    if (!confirm('Are you sure you want to cancel this advance request?')) {
        return;
    }
    
    const advances = DB.getAdvances();
    const advanceIndex = advances.findIndex(a => a.id === advanceId);
    
    if (advanceIndex === -1) {
        showNotification('Advance request not found', 'error');
        return;
    }
    
    advances.splice(advanceIndex, 1);
    DB.saveAdvances(advances);
    
    showNotification('Advance request cancelled', 'success');
    
    // Refresh the advances table
    loadSection('advances');
}

function markAsRepaid(advanceId) {
    if (!confirm('Mark this advance as fully repaid?')) {
        return;
    }
    
    const advances = DB.getAdvances();
    const advanceIndex = advances.findIndex(a => a.id === advanceId);
    
    if (advanceIndex === -1) {
        showNotification('Advance request not found', 'error');
        return;
    }
    
    advances[advanceIndex].repaid = true;
    advances[advanceIndex].repaidDate = new Date().toISOString();
    advances[advanceIndex].status = 'repaid';
    
    DB.saveAdvances(advances);
    showNotification('Advance marked as repaid', 'success');
    
    // Refresh the advances table
    loadSection('advances');
}

function exportAdvancesReport() {
    const advances = DB.getAdvances();
    const staff = DB.getStaff();
    
    const reportData = advances.map(advance => {
        const employee = staff.find(s => s.id === advance.employeeId);
        const monthlyPayment = calculateMonthlyPayment(advance.amount, advance.repaymentPlan);
        
        return {
            'Employee ID': advance.employeeId,
            'Employee Name': employee?.name || 'Unknown',
            'Department': employee?.department || 'N/A',
            'Amount': formatCurrency(advance.amount),
            'Request Date': formatDate(new Date(advance.requestDate)),
            'Reason': advance.reason || 'N/A',
            'Repayment Plan': getRepaymentPlanDisplay(advance.repaymentPlan),
            'Monthly Payment': formatCurrency(monthlyPayment),
            'Status': advance.status.charAt(0).toUpperCase() + advance.status.slice(1) + (advance.repaid ? ' (Repaid)' : ''),
            'Applied Date': formatDate(new Date(advance.created))
        };
    });
    
    const headers = Object.keys(reportData[0]);
    const csvContent = [
        headers.join(','),
        ...reportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    downloadTextFile(csvContent, `icure-advances-report-${new Date().toISOString().split('T')[0]}.csv`);
    showNotification('Advances report exported successfully', 'success');
}

function openAdvanceSettings() {
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Advance Settings</h3>
                <span class="close" onclick="closeModal('advanceSettingsModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="maxAdvancePercentage">Maximum Advance Percentage</label>
                    <input type="number" id="maxAdvancePercentage" class="form-control" value="50" min="1" max="100" step="1">
                    <small class="form-text text-muted">Percentage of salary that can be advanced (default: 50%)</small>
                </div>
                
                <div class="form-group">
                    <label for="approvalRequired">Approval Required For</label>
                    <select id="approvalRequired" class="form-control" multiple style="height: 120px;">
                        <option value="all" selected>All Advances</option>
                        <option value="over_1000">Advances over $1,000</option>
                        <option value="over_2000">Advances over $2,000</option>
                        <option value="six_months">6-month repayment plans</option>
                    </select>
                    <small class="form-text text-muted">Hold Ctrl to select multiple options</small>
                </div>
                
                <div class="form-group">
                    <label for="autoApprove">Auto-approve for</label>
                    <select id="autoApprove" class="form-control">
                        <option value="none">No auto-approval</option>
                        <option value="managers">Managers only</option>
                        <option value="doctors">Medical Doctors</option>
                        <option value="all_staff">All staff</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('advanceSettingsModal')">Cancel</button>
                <button class="btn btn-primary" onclick="saveAdvanceSettings()">Save Settings</button>
            </div>
        </div>
    `;
    
    createModal('advanceSettingsModal', modalContent);
    openModal('advanceSettingsModal');
}

function saveAdvanceSettings() {
    // This would save advance settings in a real application
    showNotification('Advance settings saved successfully', 'success');
    closeModal('advanceSettingsModal');
}