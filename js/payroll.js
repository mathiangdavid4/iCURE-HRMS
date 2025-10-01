// Payroll Management functionality
function loadPayroll(section) {
    const staff = DB.getStaff();
    const payroll = DB.getPayroll();
    const settings = DB.getSettings();
    
    section.innerHTML = `
        <div class="export-options">
            <button class="btn btn-primary" onclick="exportPayrollPDF()">
                <i class="fas fa-file-pdf"></i> Export PDF
            </button>
            <button class="btn btn-success" onclick="exportPayrollCSV()">
                <i class="fas fa-file-csv"></i> Export CSV
            </button>
            <select class="form-control" id="payrollPeriod" style="width: auto;">
                <option value="monthly">Monthly Report</option>
                <option value="annual">Annual Report</option>
            </select>
            <button class="btn btn-warning" onclick="openSalarySettingsModal()">
                <i class="fas fa-cog"></i> Salary Settings
            </button>
        </div>

        <div class="filters" style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center;">
            <div class="form-group" style="margin-bottom: 0;">
                <label for="payrollMonth">Month</label>
                <input type="month" id="payrollMonth" class="form-control" value="${new Date().toISOString().slice(0, 7)}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label for="payrollDepartment">Department</label>
                <select id="payrollDepartment" class="form-control" onchange="filterPayroll()" style="width: 200px;">
                    <option value="">All Departments</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Administration">Administration</option>
                    <option value="Support">Support</option>
                </select>
            </div>
            <button class="btn btn-primary" onclick="calculatePayroll()" style="margin-top: 20px;">
                <i class="fas fa-calculator"></i> Calculate Payroll
            </button>
        </div>

        <h2 class="section-title">Payroll Management</h2>
        <div id="payrollTableContainer">
            ${renderPayrollTable(staff, payroll, settings)}
        </div>
        
        <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>Total Payroll: <span id="totalPayroll">${calculateTotalPayroll(staff, settings)}</span></strong>
            </div>
            <button class="btn btn-success" onclick="processAllPayments()">
                <i class="fas fa-money-bill-wave"></i> Process All Payments
            </button>
        </div>
    `;
}

function renderPayrollTable(staff, payroll, settings) {
    return `
        <table>
            <thead>
                <tr>
                    <th>Full Name</th>
                    <th>Basic Salary</th>
                    <th>NSSF Employee</th>
                    <th>NSSF Employer</th>
                    <th>Allowance</th>
                    <th>Advances</th>
                    <th>Deductions</th>
                    <th>Net Pay</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${staff.map(employee => {
                    const employeePayroll = payroll.find(p => p.employeeId === employee.id && 
                        p.period === document.getElementById('payrollMonth').value) || {};
                    
                    const basicSalary = employee.salary || 0;
                    const nssfEmployee = basicSalary * (settings.nssfEmployee / 100);
                    const nssfEmployer = basicSalary * (settings.nssfEmployer / 100);
                    const allowance = employeePayroll.allowance || 0;
                    const advances = employeePayroll.advances || 0;
                    const deductions = employeePayroll.deductions || 0;
                    const netPay = basicSalary - nssfEmployee + allowance - advances - deductions;
                    const paid = employeePayroll.paid || 0;
                    const balance = netPay - paid;
                    const status = balance <= 0 ? 'paid' : (paid > 0 ? 'partial' : 'pending');
                    
                    return `
                        <tr>
                            <td>${employee.name}</td>
                            <td>${formatCurrency(basicSalary)}</td>
                            <td>${formatCurrency(nssfEmployee)}</td>
                            <td>${formatCurrency(nssfEmployer)}</td>
                            <td>${formatCurrency(allowance)}</td>
                            <td>${formatCurrency(advances)}</td>
                            <td>${formatCurrency(deductions)}</td>
                            <td><strong>${formatCurrency(netPay)}</strong></td>
                            <td>${formatCurrency(paid)}</td>
                            <td>${formatCurrency(balance)}</td>
                            <td>
                                <span class="status-badge status-${status}">
                                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                            </td>
                            <td>
                                ${balance > 0 ? 
                                    `<button class="btn btn-primary btn-sm" onclick="processPayment('${employee.id}')">Pay</button>` : 
                                    `<button class="btn btn-success btn-sm">Paid</button>`
                                }
                                <button class="btn btn-warning btn-sm" onclick="editPayroll('${employee.id}')">Edit</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function calculateTotalPayroll(staff, settings) {
    const total = staff.reduce((sum, employee) => {
        const basicSalary = employee.salary || 0;
        const nssfEmployee = basicSalary * (settings.nssfEmployee / 100);
        const allowance = 0; // You might want to calculate actual allowances
        const advances = 0; // You might want to calculate actual advances
        const deductions = 0; // You might want to calculate actual deductions
        const netPay = basicSalary - nssfEmployee + allowance - advances - deductions;
        return sum + netPay;
    }, 0);
    
    return formatCurrency(total);
}

function filterPayroll() {
    const department = document.getElementById('payrollDepartment').value;
    const month = document.getElementById('payrollMonth').value;
    
    let staff = DB.getStaff();
    const payroll = DB.getPayroll();
    const settings = DB.getSettings();
    
    if (department) {
        staff = staff.filter(emp => emp.department === department);
    }
    
    document.getElementById('payrollTableContainer').innerHTML = renderPayrollTable(staff, payroll, settings);
    document.getElementById('totalPayroll').textContent = calculateTotalPayroll(staff, settings);
}

function calculatePayroll() {
    const month = document.getElementById('payrollMonth').value;
    const staff = DB.getStaff();
    const settings = DB.getSettings();
    
    let payroll = DB.getPayroll();
    
    staff.forEach(employee => {
        const existingRecord = payroll.find(p => p.employeeId === employee.id && p.period === month);
        
        if (!existingRecord) {
            const basicSalary = employee.salary || 0;
            const nssfEmployee = basicSalary * (settings.nssfEmployee / 100);
            const nssfEmployer = basicSalary * (settings.nssfEmployer / 100);
            const allowance = calculateAllowances(employee.id);
            const advances = calculateAdvances(employee.id);
            const deductions = calculateDeductions(employee.id);
            const netPay = basicSalary - nssfEmployee + allowance - advances - deductions;
            
            payroll.push({
                id: 'PAY-' + DB.generateId('PAY'),
                employeeId: employee.id,
                period: month,
                basicSalary: basicSalary,
                allowances: allowance,
                advances: advances,
                deductions: deductions,
                nssfEmployee: nssfEmployee,
                nssfEmployer: nssfEmployer,
                netPay: netPay,
                paid: 0,
                balance: netPay,
                status: 'pending',
                created: new Date().toISOString()
            });
        }
    });
    
    DB.savePayroll(payroll);
    showNotification('Payroll calculated successfully', 'success');
    
    // Refresh the payroll table
    loadSection('payroll');
}

function calculateAllowances(employeeId) {
    // This would calculate actual allowances from allowance records
    // For now, return a fixed amount based on role
    const employee = DB.findStaffById(employeeId);
    if (!employee) return 0;
    
    const allowanceMap = {
        'Medical Doctor': 500,
        'Nurse': 300,
        'Finance': 200,
        'Pharmacist': 250,
        'Lab Tech': 200,
        'Radiologist': 450,
        'Support Staff': 100
    };
    
    return allowanceMap[employee.role] || 0;
}

function calculateAdvances(employeeId) {
    const advances = DB.getAdvances();
    const employeeAdvances = advances.filter(a => 
        a.employeeId === employeeId && 
        a.status === 'approved' && 
        !a.repaid
    );
    
    return employeeAdvances.reduce((sum, advance) => sum + (advance.amount || 0), 0);
}

function calculateDeductions(employeeId) {
    // This would calculate actual deductions
    // For now, return a fixed amount
    return 0;
}

function processPayment(employeeId) {
    const month = document.getElementById('payrollMonth').value;
    const payroll = DB.getPayroll();
    const payrollRecord = payroll.find(p => p.employeeId === employeeId && p.period === month);
    
    if (!payrollRecord) {
        showNotification('No payroll record found for this employee', 'error');
        return;
    }
    
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Process Payment</h3>
                <span class="close" onclick="closeModal('processPaymentModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="payment-details" style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <h4>Payment Details</h4>
                    <p><strong>Employee:</strong> ${DB.findStaffById(employeeId)?.name}</p>
                    <p><strong>Net Pay:</strong> ${formatCurrency(payrollRecord.netPay)}</p>
                    <p><strong>Already Paid:</strong> ${formatCurrency(payrollRecord.paid)}</p>
                    <p><strong>Balance:</strong> ${formatCurrency(payrollRecord.balance)}</p>
                </div>
                
                <div class="form-group">
                    <label for="paymentAmount">Payment Amount *</label>
                    <input type="number" id="paymentAmount" class="form-control" 
                           value="${payrollRecord.balance}" min="0" max="${payrollRecord.balance}" 
                           step="0.01" required>
                </div>
                
                <div class="form-group">
                    <label for="paymentDate">Payment Date *</label>
                    <input type="date" id="paymentDate" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="paymentMethod">Payment Method *</label>
                    <select id="paymentMethod" class="form-control" required>
                        <option value="">Select Method</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="check">Check</option>
                        <option value="mobile_money">Mobile Money</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="paymentReference">Reference Number</label>
                    <input type="text" id="paymentReference" class="form-control" placeholder="Transaction reference">
                </div>
                
                <div class="form-group">
                    <label for="paymentNotes">Notes</label>
                    <textarea id="paymentNotes" class="form-control" placeholder="Additional notes" rows="3"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('processPaymentModal')">Cancel</button>
                <button class="btn btn-primary" onclick="confirmPayment('${employeeId}')">Process Payment</button>
            </div>
        </div>
    `;
    
    createModal('processPaymentModal', modalContent);
    openModal('processPaymentModal');
    
    // Set today's date as default
    document.getElementById('paymentDate').valueAsDate = new Date();
}

function confirmPayment(employeeId) {
    const month = document.getElementById('payrollMonth').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentDate = document.getElementById('paymentDate').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const reference = document.getElementById('paymentReference').value;
    const notes = document.getElementById('paymentNotes').value;
    
    if (!amount || !paymentDate || !paymentMethod) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const payroll = DB.getPayroll();
    const payrollIndex = payroll.findIndex(p => p.employeeId === employeeId && p.period === month);
    
    if (payrollIndex === -1) {
        showNotification('Payroll record not found', 'error');
        return;
    }
    
    const payrollRecord = payroll[payrollIndex];
    
    if (amount > payrollRecord.balance) {
        showNotification('Payment amount cannot exceed balance', 'error');
        return;
    }
    
    // Update payroll record
    payroll[payrollIndex].paid += amount;
    payroll[payrollIndex].balance = payrollRecord.netPay - payroll[payrollIndex].paid;
    payroll[payrollIndex].status = payroll[payrollIndex].balance <= 0 ? 'paid' : 'partial';
    payroll[payrollIndex].paymentDate = paymentDate;
    payroll[payrollIndex].paymentMethod = paymentMethod;
    payroll[payrollIndex].reference = reference;
    payroll[payrollIndex].notes = notes;
    payroll[payrollIndex].updated = new Date().toISOString();
    
    DB.savePayroll(payroll);
    
    closeModal('processPaymentModal');
    showNotification('Payment processed successfully', 'success');
    
    // Refresh the payroll table
    loadSection('payroll');
}

function editPayroll(employeeId) {
    const month = document.getElementById('payrollMonth').value;
    const payroll = DB.getPayroll();
    const payrollRecord = payroll.find(p => p.employeeId === employeeId && p.period === month);
    const employee = DB.findStaffById(employeeId);
    
    if (!payrollRecord) {
        showNotification('No payroll record found for this employee', 'error');
        return;
    }
    
    const modalContent = `
        <div class="modal-content" style="width: 500px;">
            <div class="modal-header">
                <h3>Edit Payroll - ${employee?.name}</h3>
                <span class="close" onclick="closeModal('editPayrollModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="editAllowance">Allowance ($)</label>
                    <input type="number" id="editAllowance" class="form-control" 
                           value="${payrollRecord.allowances}" min="0" step="0.01">
                </div>
                
                <div class="form-group">
                    <label for="editAdvances">Advances ($)</label>
                    <input type="number" id="editAdvances" class="form-control" 
                           value="${payrollRecord.advances}" min="0" step="0.01">
                </div>
                
                <div class="form-group">
                    <label for="editDeductions">Deductions ($)</label>
                    <input type="number" id="editDeductions" class="form-control" 
                           value="${payrollRecord.deductions}" min="0" step="0.01">
                </div>
                
                <div class="form-group">
                    <label for="editPaid">Amount Paid ($)</label>
                    <input type="number" id="editPaid" class="form-control" 
                           value="${payrollRecord.paid}" min="0" step="0.01" max="${payrollRecord.netPay}">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('editPayrollModal')">Cancel</button>
                <button class="btn btn-primary" onclick="updatePayroll('${employeeId}')">Update</button>
            </div>
        </div>
    `;
    
    createModal('editPayrollModal', modalContent);
    openModal('editPayrollModal');
}

function updatePayroll(employeeId) {
    const month = document.getElementById('payrollMonth').value;
    const allowance = parseFloat(document.getElementById('editAllowance').value) || 0;
    const advances = parseFloat(document.getElementById('editAdvances').value) || 0;
    const deductions = parseFloat(document.getElementById('editDeductions').value) || 0;
    const paid = parseFloat(document.getElementById('editPaid').value) || 0;
    
    const payroll = DB.getPayroll();
    const payrollIndex = payroll.findIndex(p => p.employeeId === employeeId && p.period === month);
    
    if (payrollIndex === -1) {
        showNotification('Payroll record not found', 'error');
        return;
    }
    
    const payrollRecord = payroll[payrollIndex];
    const basicSalary = payrollRecord.basicSalary;
    const nssfEmployee = basicSalary * (DB.getSettings().nssfEmployee / 100);
    const netPay = basicSalary - nssfEmployee + allowance - advances - deductions;
    const balance = netPay - paid;
    
    // Update payroll record
    payroll[payrollIndex].allowances = allowance;
    payroll[payrollIndex].advances = advances;
    payroll[payrollIndex].deductions = deductions;
    payroll[payrollIndex].netPay = netPay;
    payroll[payrollIndex].paid = paid;
    payroll[payrollIndex].balance = balance;
    payroll[payrollIndex].status = balance <= 0 ? 'paid' : (paid > 0 ? 'partial' : 'pending');
    payroll[payrollIndex].updated = new Date().toISOString();
    
    DB.savePayroll(payroll);
    
    closeModal('editPayrollModal');
    showNotification('Payroll updated successfully', 'success');
    
    // Refresh the payroll table
    loadSection('payroll');
}

function processAllPayments() {
    const month = document.getElementById('payrollMonth').value;
    const payroll = DB.getPayroll().filter(p => p.period === month && p.balance > 0);
    
    if (payroll.length === 0) {
        showNotification('No pending payments to process', 'info');
        return;
    }
    
    if (!confirm(`Process payments for ${payroll.length} employees?`)) {
        return;
    }
    
    const updatedPayroll = DB.getPayroll().map(record => {
        if (record.period === month && record.balance > 0) {
            return {
                ...record,
                paid: record.paid + record.balance,
                balance: 0,
                status: 'paid',
                paymentDate: new Date().toISOString().split('T')[0],
                paymentMethod: 'batch_processing',
                updated: new Date().toISOString()
            };
        }
        return record;
    });
    
    DB.savePayroll(updatedPayroll);
    showNotification(`Processed payments for ${payroll.length} employees`, 'success');
    
    // Refresh the payroll table
    loadSection('payroll');
}

function exportPayrollPDF() {
    showNotification('PDF export would be implemented here', 'info');
    // In a real application, this would generate a PDF using a library like jsPDF
}

function exportPayrollCSV() {
    const month = document.getElementById('payrollMonth').value;
    const staff = DB.getStaff();
    const payroll = DB.getPayroll();
    const settings = DB.getSettings();
    
    const csvData = staff.map(employee => {
        const employeePayroll = payroll.find(p => p.employeeId === employee.id && p.period === month) || {};
        const basicSalary = employee.salary || 0;
        const nssfEmployee = basicSalary * (settings.nssfEmployee / 100);
        const allowance = employeePayroll.allowance || 0;
        const advances = employeePayroll.advances || 0;
        const deductions = employeePayroll.deductions || 0;
        const netPay = basicSalary - nssfEmployee + allowance - advances - deductions;
        const paid = employeePayroll.paid || 0;
        const balance = netPay - paid;
        
        return {
            'Employee ID': employee.id,
            'Full Name': employee.name,
            'Department': employee.department,
            'Role': employee.role,
            'Basic Salary': basicSalary,
            'NSSF Employee': nssfEmployee,
            'Allowance': allowance,
            'Advances': advances,
            'Deductions': deductions,
            'Net Pay': netPay,
            'Paid': paid,
            'Balance': balance,
            'Status': balance <= 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Pending')
        };
    });
    
    const headers = Object.keys(csvData[0]);
    const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    downloadTextFile(csvContent, `icure-payroll-${month}.csv`);
    showNotification('Payroll exported to CSV successfully', 'success');
}

function openSalarySettingsModal() {
    const settings = DB.getSettings();
    
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Salary Settings</h3>
                <span class="close" onclick="closeModal('salarySettingsModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="nssfEmployee">NSSF Employee Contribution (%)</label>
                    <input type="number" id="nssfEmployee" class="form-control" 
                           value="${settings.nssfEmployee}" min="0" max="100" step="0.1">
                </div>
                <div class="form-group">
                    <label for="nssfEmployer">NSSF Employer Contribution (%)</label>
                    <input type="number" id="nssfEmployer" class="form-control" 
                           value="${settings.nssfEmployer}" min="0" max="100" step="0.1">
                </div>
                <div class="form-group">
                    <label for="payrollDate">Payroll Date</label>
                    <input type="number" id="payrollDate" class="form-control" 
                           value="${settings.payrollDate}" min="1" max="31">
                    <small>Day of the month when payroll is processed</small>
                </div>
                <div class="form-group">
                    <label for="currency">Currency</label>
                    <select id="currency" class="form-control">
                        <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                        <option value="SSP" ${settings.currency === 'SSP' ? 'selected' : ''}>South Sudanese Pound (SSP)</option>
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('salarySettingsModal')">Cancel</button>
                <button class="btn btn-primary" onclick="saveSalarySettings()">Save Settings</button>
            </div>
        </div>
    `;
    
    createModal('salarySettingsModal', modalContent);
    openModal('salarySettingsModal');
}

function saveSalarySettings() {
    const nssfEmployee = parseFloat(document.getElementById('nssfEmployee').value);
    const nssfEmployer = parseFloat(document.getElementById('nssfEmployer').value);
    const payrollDate = parseInt(document.getElementById('payrollDate').value);
    const currency = document.getElementById('currency').value;
    
    const settings = {
        nssfEmployee,
        nssfEmployer,
        payrollDate,
        currency
    };
    
    DB.saveSettings(settings);
    closeModal('salarySettingsModal');
    showNotification('Salary settings saved successfully', 'success');
}