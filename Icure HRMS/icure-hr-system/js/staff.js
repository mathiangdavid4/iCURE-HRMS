// Staff Management functionality
function loadStaffManagement(section) {
    const staff = DB.getStaff();
    
    section.innerHTML = `
        <div class="quick-actions">
            <div class="action-btn" onclick="openAddStaffModal()">
                <i class="fas fa-user-plus"></i>
                <span>Add Staff</span>
            </div>
            <div class="action-btn" onclick="generateStaffReport()">
                <i class="fas fa-file-export"></i>
                <span>Export Staff List</span>
            </div>
            <div class="action-btn" onclick="openBulkUploadModal()">
                <i class="fas fa-upload"></i>
                <span>Bulk Upload</span>
            </div>
        </div>

        <div class="filters" style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center;">
            <div class="form-group" style="margin-bottom: 0;">
                <select id="departmentFilter" class="form-control" onchange="filterStaff()" style="width: 200px;">
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
            <div class="form-group" style="margin-bottom: 0;">
                <select id="roleFilter" class="form-control" onchange="filterStaff()" style="width: 200px;">
                    <option value="">All Roles</option>
                    <option value="Medical Doctor">Medical Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Finance">Finance</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Lab Tech">Lab Tech</option>
                    <option value="Radiologist">Radiologist</option>
                    <option value="Support Staff">Support Staff</option>
                </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <input type="text" id="searchStaff" class="form-control" placeholder="Search staff..." onkeyup="filterStaff()" style="width: 250px;">
            </div>
        </div>

        <h2 class="section-title">All Staff Members</h2>
        <div id="staffTableContainer">
            ${renderStaffTable(staff)}
        </div>
    `;
}

function renderStaffTable(staff) {
    return `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Salary</th>
                    <th>Join Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${staff.map(employee => `
                    <tr>
                        <td>${employee.id}</td>
                        <td>${employee.name}</td>
                        <td><span class="role-badge role-${employee.role.toLowerCase().replace(' ', '')}">${employee.role}</span></td>
                        <td>${employee.department}</td>
                        <td>${employee.email || 'N/A'}</td>
                        <td>${employee.phone || 'N/A'}</td>
                        <td>${formatCurrency(employee.salary || 0)}</td>
                        <td>${formatDate(employee.joinDate)}</td>
                        <td><span class="status-badge status-approved">Active</span></td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="viewStaff('${employee.id}')">View</button>
                            <button class="btn btn-warning btn-sm" onclick="editStaff('${employee.id}')">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteStaff('${employee.id}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function filterStaff() {
    const departmentFilter = document.getElementById('departmentFilter').value;
    const roleFilter = document.getElementById('roleFilter').value;
    const searchTerm = document.getElementById('searchStaff').value.toLowerCase();
    
    let staff = DB.getStaff();
    
    // Apply filters
    if (departmentFilter) {
        staff = staff.filter(emp => emp.department === departmentFilter);
    }
    
    if (roleFilter) {
        staff = staff.filter(emp => emp.role === roleFilter);
    }
    
    if (searchTerm) {
        staff = staff.filter(emp => 
            emp.name.toLowerCase().includes(searchTerm) ||
            emp.email.toLowerCase().includes(searchTerm) ||
            emp.id.toLowerCase().includes(searchTerm)
        );
    }
    
    document.getElementById('staffTableContainer').innerHTML = renderStaffTable(staff);
}

function openAddStaffModal() {
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New Staff Member</h3>
                <span class="close" onclick="closeModal('addStaffModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="staffFullName">Full Name *</label>
                    <input type="text" id="staffFullName" class="form-control" placeholder="Enter full name" required>
                </div>
                <div class="form-group">
                    <label for="staffEmail">Email Address *</label>
                    <input type="email" id="staffEmail" class="form-control" placeholder="Enter email address" required>
                </div>
                <div class="form-group">
                    <label for="staffPhone">Phone Number</label>
                    <input type="tel" id="staffPhone" class="form-control" placeholder="Enter phone number">
                </div>
                <div class="form-group">
                    <label for="staffRole">Role *</label>
                    <select id="staffRole" class="form-control" required>
                        <option value="">Select Role</option>
                        <option value="Medical Doctor">Medical Doctor</option>
                        <option value="Nurse">Nurse</option>
                        <option value="Finance">Finance</option>
                        <option value="Pharmacist">Pharmacist</option>
                        <option value="Lab Tech">Lab Tech</option>
                        <option value="Radiologist">Radiologist</option>
                        <option value="Support Staff">Support Staff</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="staffDepartment">Department *</label>
                    <select id="staffDepartment" class="form-control" required>
                        <option value="">Select Department</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Laboratory">Laboratory</option>
                        <option value="Radiology">Radiology</option>
                        <option value="Administration">Administration</option>
                        <option value="Support">Support</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="staffSalary">Basic Salary ($) *</label>
                    <input type="number" id="staffSalary" class="form-control" placeholder="Enter basic salary" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="staffJoinDate">Join Date *</label>
                    <input type="date" id="staffJoinDate" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="staffAddress">Address</label>
                    <textarea id="staffAddress" class="form-control" placeholder="Enter address" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="staffEmergencyContact">Emergency Contact</label>
                    <input type="text" id="staffEmergencyContact" class="form-control" placeholder="Emergency contact name and number">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('addStaffModal')">Cancel</button>
                <button class="btn btn-primary" onclick="addNewStaff()">Add Staff</button>
            </div>
        </div>
    `;
    
    createModal('addStaffModal', modalContent);
    openModal('addStaffModal');
    
    // Set today's date as default join date
    document.getElementById('staffJoinDate').valueAsDate = new Date();
}

function addNewStaff() {
    const name = document.getElementById('staffFullName').value;
    const email = document.getElementById('staffEmail').value;
    const phone = document.getElementById('staffPhone').value;
    const role = document.getElementById('staffRole').value;
    const department = document.getElementById('staffDepartment').value;
    const salary = parseFloat(document.getElementById('staffSalary').value);
    const joinDate = document.getElementById('staffJoinDate').value;
    const address = document.getElementById('staffAddress').value;
    const emergencyContact = document.getElementById('staffEmergencyContact').value;
    
    // Validation
    if (!name || !email || !role || !department || !salary || !joinDate) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const staff = DB.getStaff();
    
    // Check if email already exists
    if (staff.find(emp => emp.email === email)) {
        showNotification('Staff member with this email already exists', 'error');
        return;
    }
    
    // Generate staff ID
    const staffId = 'EMP-' + (staff.length + 1).toString().padStart(3, '0');
    
    // Create new staff member
    const newStaff = {
        id: staffId,
        name: name,
        email: email,
        phone: phone,
        role: role,
        department: department,
        salary: salary,
        joinDate: joinDate,
        address: address,
        emergencyContact: emergencyContact,
        status: 'active',
        created: new Date().toISOString()
    };
    
    staff.push(newStaff);
    DB.saveStaff(staff);
    
    closeModal('addStaffModal');
    showNotification('Staff member added successfully', 'success');
    
    // Refresh the staff table
    loadSection('staffManagement');
}

function viewStaff(staffId) {
    const staff = DB.findStaffById(staffId);
    if (!staff) {
        showNotification('Staff member not found', 'error');
        return;
    }
    
    const modalContent = `
        <div class="modal-content" style="width: 600px;">
            <div class="modal-header">
                <h3>Staff Details - ${staff.name}</h3>
                <span class="close" onclick="closeModal('viewStaffModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4>Personal Information</h4>
                        <p><strong>Staff ID:</strong> ${staff.id}</p>
                        <p><strong>Name:</strong> ${staff.name}</p>
                        <p><strong>Email:</strong> ${staff.email}</p>
                        <p><strong>Phone:</strong> ${staff.phone || 'N/A'}</p>
                        <p><strong>Role:</strong> <span class="role-badge role-${staff.role.toLowerCase().replace(' ', '')}">${staff.role}</span></p>
                    </div>
                    <div>
                        <h4>Employment Details</h4>
                        <p><strong>Department:</strong> ${staff.department}</p>
                        <p><strong>Salary:</strong> ${formatCurrency(staff.salary)}</p>
                        <p><strong>Join Date:</strong> ${formatDate(staff.joinDate)}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-approved">Active</span></p>
                    </div>
                </div>
                ${staff.address ? `
                    <div style="margin-top: 20px;">
                        <h4>Address</h4>
                        <p>${staff.address}</p>
                    </div>
                ` : ''}
                ${staff.emergencyContact ? `
                    <div style="margin-top: 20px;">
                        <h4>Emergency Contact</h4>
                        <p>${staff.emergencyContact}</p>
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="editStaff('${staff.id}')">Edit</button>
                <button class="btn btn-secondary" onclick="closeModal('viewStaffModal')">Close</button>
            </div>
        </div>
    `;
    
    createModal('viewStaffModal', modalContent);
    openModal('viewStaffModal');
}

function editStaff(staffId) {
    const staff = DB.findStaffById(staffId);
    if (!staff) {
        showNotification('Staff member not found', 'error');
        return;
    }
    
    const modalContent = `
        <div class="modal-content" style="width: 600px;">
            <div class="modal-header">
                <h3>Edit Staff Member - ${staff.name}</h3>
                <span class="close" onclick="closeModal('editStaffModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="editStaffFullName">Full Name *</label>
                    <input type="text" id="editStaffFullName" class="form-control" value="${staff.name}" required>
                </div>
                <div class="form-group">
                    <label for="editStaffEmail">Email Address *</label>
                    <input type="email" id="editStaffEmail" class="form-control" value="${staff.email}" required>
                </div>
                <div class="form-group">
                    <label for="editStaffPhone">Phone Number</label>
                    <input type="tel" id="editStaffPhone" class="form-control" value="${staff.phone || ''}">
                </div>
                <div class="form-group">
                    <label for="editStaffRole">Role *</label>
                    <select id="editStaffRole" class="form-control" required>
                        <option value="Medical Doctor" ${staff.role === 'Medical Doctor' ? 'selected' : ''}>Medical Doctor</option>
                        <option value="Nurse" ${staff.role === 'Nurse' ? 'selected' : ''}>Nurse</option>
                        <option value="Finance" ${staff.role === 'Finance' ? 'selected' : ''}>Finance</option>
                        <option value="Pharmacist" ${staff.role === 'Pharmacist' ? 'selected' : ''}>Pharmacist</option>
                        <option value="Lab Tech" ${staff.role === 'Lab Tech' ? 'selected' : ''}>Lab Tech</option>
                        <option value="Radiologist" ${staff.role === 'Radiologist' ? 'selected' : ''}>Radiologist</option>
                        <option value="Support Staff" ${staff.role === 'Support Staff' ? 'selected' : ''}>Support Staff</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editStaffDepartment">Department *</label>
                    <select id="editStaffDepartment" class="form-control" required>
                        <option value="Cardiology" ${staff.department === 'Cardiology' ? 'selected' : ''}>Cardiology</option>
                        <option value="Emergency" ${staff.department === 'Emergency' ? 'selected' : ''}>Emergency</option>
                        <option value="Pharmacy" ${staff.department === 'Pharmacy' ? 'selected' : ''}>Pharmacy</option>
                        <option value="Laboratory" ${staff.department === 'Laboratory' ? 'selected' : ''}>Laboratory</option>
                        <option value="Radiology" ${staff.department === 'Radiology' ? 'selected' : ''}>Radiology</option>
                        <option value="Administration" ${staff.department === 'Administration' ? 'selected' : ''}>Administration</option>
                        <option value="Support" ${staff.department === 'Support' ? 'selected' : ''}>Support</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editStaffSalary">Basic Salary ($) *</label>
                    <input type="number" id="editStaffSalary" class="form-control" value="${staff.salary}" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="editStaffAddress">Address</label>
                    <textarea id="editStaffAddress" class="form-control" rows="3">${staff.address || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="editStaffEmergencyContact">Emergency Contact</label>
                    <input type="text" id="editStaffEmergencyContact" class="form-control" value="${staff.emergencyContact || ''}">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('editStaffModal')">Cancel</button>
                <button class="btn btn-primary" onclick="updateStaff('${staff.id}')">Update</button>
            </div>
        </div>
    `;
    
    createModal('editStaffModal', modalContent);
    openModal('editStaffModal');
}

function updateStaff(staffId) {
    const name = document.getElementById('editStaffFullName').value;
    const email = document.getElementById('editStaffEmail').value;
    const phone = document.getElementById('editStaffPhone').value;
    const role = document.getElementById('editStaffRole').value;
    const department = document.getElementById('editStaffDepartment').value;
    const salary = parseFloat(document.getElementById('editStaffSalary').value);
    const address = document.getElementById('editStaffAddress').value;
    const emergencyContact = document.getElementById('editStaffEmergencyContact').value;
    
    if (!name || !email || !role || !department || !salary) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const staff = DB.getStaff();
    const staffIndex = staff.findIndex(emp => emp.id === staffId);
    
    if (staffIndex === -1) {
        showNotification('Staff member not found', 'error');
        return;
    }
    
    // Check if email is already used by another staff member
    const emailExists = staff.some((emp, index) => index !== staffIndex && emp.email === email);
    if (emailExists) {
        showNotification('Email already exists for another staff member', 'error');
        return;
    }
    
    // Update staff member
    staff[staffIndex] = {
        ...staff[staffIndex],
        name: name,
        email: email,
        phone: phone,
        role: role,
        department: department,
        salary: salary,
        address: address,
        emergencyContact: emergencyContact,
        updated: new Date().toISOString()
    };
    
    DB.saveStaff(staff);
    
    closeModal('editStaffModal');
    showNotification('Staff member updated successfully', 'success');
    
    // Refresh the staff table
    loadSection('staffManagement');
}

function deleteStaff(staffId) {
    if (!confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
        return;
    }
    
    const staff = DB.getStaff();
    const staffIndex = staff.findIndex(emp => emp.id === staffId);
    
    if (staffIndex === -1) {
        showNotification('Staff member not found', 'error');
        return;
    }
    
    // Check if staff member has any associated data
    const leaves = DB.getLeaves().filter(leave => leave.employeeId === staffId);
    const advances = DB.getAdvances().filter(advance => advance.employeeId === staffId);
    
    if (leaves.length > 0 || advances.length > 0) {
        showNotification('Cannot delete staff member with associated records (leaves, advances, etc.)', 'error');
        return;
    }
    
    // Remove staff member
    staff.splice(staffIndex, 1);
    DB.saveStaff(staff);
    
    showNotification('Staff member deleted successfully', 'success');
    
    // Refresh the staff table
    loadSection('staffManagement');
}

function generateStaffReport() {
    const staff = DB.getStaff();
    
    const reportData = staff.map(emp => ({
        ID: emp.id,
        Name: emp.name,
        Role: emp.role,
        Department: emp.department,
        Email: emp.email,
        Phone: emp.phone || 'N/A',
        Salary: formatCurrency(emp.salary),
        'Join Date': formatDate(emp.joinDate),
        Status: 'Active'
    }));
    
    // Convert to CSV
    const headers = Object.keys(reportData[0]);
    const csvContent = [
        headers.join(','),
        ...reportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    downloadTextFile(csvContent, `icure-staff-report-${new Date().toISOString().split('T')[0]}.csv`);
    showNotification('Staff report exported successfully', 'success');
}

function openBulkUploadModal() {
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Bulk Upload Staff</h3>
                <span class="close" onclick="closeModal('bulkUploadModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="alert alert-info" style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <strong>Instructions:</strong> Download the template, fill in staff details, and upload the CSV file.
                    Required fields: Name, Email, Role, Department, Salary, Join Date.
                </div>
                
                <div class="form-group">
                    <button class="btn btn-secondary" onclick="downloadStaffTemplate()">
                        <i class="fas fa-download"></i> Download Template
                    </button>
                </div>
                
                <div class="form-group">
                    <label for="staffCsvFile">Upload CSV File</label>
                    <input type="file" id="staffCsvFile" class="form-control" accept=".csv">
                </div>
                
                <div id="uploadPreview" style="display: none; margin-top: 20px;">
                    <h4>Preview</h4>
                    <div id="previewTable" style="max-height: 200px; overflow-y: auto;"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('bulkUploadModal')">Cancel</button>
                <button class="btn btn-primary" onclick="processBulkUpload()" id="uploadBtn" disabled>Upload Staff</button>
            </div>
        </div>
    `;
    
    createModal('bulkUploadModal', modalContent);
    openModal('bulkUploadModal');
    
    // Add event listener for file input
    setTimeout(() => {
        const fileInput = document.getElementById('staffCsvFile');
        if (fileInput) {
            fileInput.addEventListener('change', handleFileUpload);
        }
    }, 100);
}

function downloadStaffTemplate() {
    const template = `Name,Email,Phone,Role,Department,Salary,Join Date,Address,Emergency Contact
John Doe,john.doe@icure.com,+211123456789,Medical Doctor,Cardiology,5000,2023-10-01,"Juba, South Sudan","Jane Doe +211987654321"
Jane Smith,jane.smith@icure.com,+211123456788,Nurse,Emergency,3200,2023-10-01,"Juba, South Sudan","John Smith +211987654320"`;
    
    downloadTextFile(template, 'icure-staff-template.csv');
    showNotification('Template downloaded successfully', 'success');
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const lines = content.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Simple validation
        const requiredHeaders = ['Name', 'Email', 'Role', 'Department', 'Salary', 'Join Date'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
            showNotification(`Missing required columns: ${missingHeaders.join(', ')}`, 'error');
            return;
        }
        
        // Parse CSV and create preview
        const previewData = lines.slice(1, 6).filter(line => line.trim()); // First 5 rows
        let previewHtml = '<table style="width: 100%; border-collapse: collapse;">';
        previewHtml += '<thead><tr>' + headers.map(h => `<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">${h}</th>`).join('') + '</tr></thead>';
        previewHtml += '<tbody>';
        
        previewData.forEach(line => {
            const cells = line.split(',').map(c => c.trim());
            previewHtml += '<tr>' + cells.map(c => `<td style="border: 1px solid #ddd; padding: 8px;">${c}</td>`).join('') + '</tr>';
        });
        
        previewHtml += '</tbody></table>';
        
        document.getElementById('previewTable').innerHTML = previewHtml;
        document.getElementById('uploadPreview').style.display = 'block';
        document.getElementById('uploadBtn').disabled = false;
    };
    
    reader.readAsText(file);
}

function processBulkUpload() {
    // This would process the actual file upload in a real application
    // For now, we'll simulate success
    showNotification('Bulk upload feature would process the CSV file here', 'success');
    closeModal('bulkUploadModal');
}