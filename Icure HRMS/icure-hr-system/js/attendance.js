// Attendance Management functionality
function loadAttendance(section) {
    const attendance = DB.getAttendance();
    const staff = DB.getStaff();
    
    section.innerHTML = `
        <div class="quick-actions">
            <div class="action-btn" onclick="markBulkAttendance()">
                <i class="fas fa-users"></i>
                <span>Bulk Attendance</span>
            </div>
            <div class="action-btn" onclick="generateAttendanceReport()">
                <i class="fas fa-file-export"></i>
                <span>Export Report</span>
            </div>
            <div class="action-btn" onclick="openAttendanceSettings()">
                <i class="fas fa-cog"></i>
                <span>Settings</span>
            </div>
        </div>

        <div class="filters" style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center;">
            <div class="form-group" style="margin-bottom: 0;">
                <label for="attendanceDate">Date</label>
                <input type="date" id="attendanceDate" class="form-control" value="${new Date().toISOString().split('T')[0]}" onchange="filterAttendance()">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label for="attendanceDepartment">Department</label>
                <select id="attendanceDepartment" class="form-control" onchange="filterAttendance()" style="width: 200px;">
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
                <label for="attendanceStatus">Status</label>
                <select id="attendanceStatus" class="form-control" onchange="filterAttendance()" style="width: 150px;">
                    <option value="">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                </select>
            </div>
        </div>

        <h2 class="section-title">Attendance Records</h2>
        <div id="attendanceTableContainer">
            ${renderAttendanceTable(staff, attendance)}
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
            <button class="btn btn-primary" onclick="markAllPresent()">
                <i class="fas fa-user-check"></i> Mark All as Present
            </button>
            <button class="btn btn-warning" onclick="markAllAbsent()" style="margin-left: 10px;">
                <i class="fas fa-user-times"></i> Mark All as Absent
            </button>
        </div>
    `;
}

function renderAttendanceTable(staff, attendance) {
    const selectedDate = document.getElementById('attendanceDate').value;
    const departmentFilter = document.getElementById('attendanceDepartment')?.value;
    const statusFilter = document.getElementById('attendanceStatus')?.value;
    
    // Filter staff by department
    let filteredStaff = staff;
    if (departmentFilter) {
        filteredStaff = staff.filter(emp => emp.department === departmentFilter);
    }
    
    return `
        <table>
            <thead>
                <tr>
                    <th>Staff Name</th>
                    <th>Department</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Hours Worked</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filteredStaff.map(employee => {
                    const todayAttendance = attendance.find(a => 
                        a.employeeId === employee.id && a.date === selectedDate
                    );
                    
                    const timeIn = todayAttendance ? todayAttendance.timeIn : '--:--';
                    const timeOut = todayAttendance ? todayAttendance.timeOut : '--:--';
                    const status = todayAttendance ? todayAttendance.status : 'absent';
                    const notes = todayAttendance ? todayAttendance.notes : '';
                    
                    // Calculate hours worked
                    let hoursWorked = '--';
                    if (timeIn !== '--:--' && timeOut !== '--:--') {
                        const [inHours, inMinutes] = timeIn.split(':').map(Number);
                        const [outHours, outMinutes] = timeOut.split(':').map(Number);
                        const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
                        hoursWorked = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
                    }
                    
                    // Apply status filter
                    if (statusFilter && status !== statusFilter) {
                        return '';
                    }
                    
                    return `
                        <tr>
                            <td>${employee.name}</td>
                            <td>${employee.department}</td>
                            <td>${timeIn}</td>
                            <td>${timeOut}</td>
                            <td>${hoursWorked}</td>
                            <td>
                                <span class="status-badge status-${status === 'present' ? 'approved' : status === 'absent' ? 'rejected' : 'pending'}">
                                    ${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                </span>
                            </td>
                            <td>${notes || 'N/A'}</td>
                            <td>
                                ${!todayAttendance ? 
                                    `<button class="btn btn-primary btn-sm" onclick="markTimeIn('${employee.id}')">Time In</button>` :
                                    (!todayAttendance.timeOut ? 
                                        `<button class="btn btn-warning btn-sm" onclick="markTimeOut('${employee.id}')">Time Out</button>` :
                                        `<button class="btn btn-success btn-sm" onclick="viewAttendance('${employee.id}')">View</button>`
                                    )
                                }
                                <button class="btn btn-info btn-sm" onclick="editAttendance('${employee.id}')">Edit</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function filterAttendance() {
    const staff = DB.getStaff();
    const attendance = DB.getAttendance();
    
    document.getElementById('attendanceTableContainer').innerHTML = renderAttendanceTable(staff, attendance);
}

function markTimeIn(employeeId) {
    const selectedDate = document.getElementById('attendanceDate').value;
    const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format
    
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Mark Time In</h3>
                <span class="close" onclick="closeModal('markTimeInModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="timeIn">Time In *</label>
                    <input type="time" id="timeIn" class="form-control" value="${currentTime}" required>
                </div>
                
                <div class="form-group">
                    <label for="timeInNotes">Notes</label>
                    <textarea id="timeInNotes" class="form-control" placeholder="Any notes (late reason, etc.)" rows="3"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('markTimeInModal')">Cancel</button>
                <button class="btn btn-primary" onclick="confirmTimeIn('${employeeId}')">Mark Time In</button>
            </div>
        </div>
    `;
    
    createModal('markTimeInModal', modalContent);
    openModal('markTimeInModal');
}

function confirmTimeIn(employeeId) {
    const selectedDate = document.getElementById('attendanceDate').value;
    const timeIn = document.getElementById('timeIn').value;
    const notes = document.getElementById('timeInNotes').value;
    
    if (!timeIn) {
        showNotification('Please enter time in', 'error');
        return;
    }
    
    const attendance = DB.getAttendance();
    
    // Check if attendance already exists for this date
    const existingIndex = attendance.findIndex(a => 
        a.employeeId === employeeId && a.date === selectedDate
    );
    
    const attendanceRecord = {
        employeeId: employeeId,
        date: selectedDate,
        timeIn: timeIn,
        timeOut: null,
        status: 'present',
        notes: notes,
        created: new Date().toISOString()
    };
    
    if (existingIndex !== -1) {
        attendance[existingIndex] = {
            ...attendance[existingIndex],
            timeIn: timeIn,
            notes: notes
        };
    } else {
        attendance.push(attendanceRecord);
    }
    
    DB.saveAttendance(attendance);
    
    closeModal('markTimeInModal');
    showNotification('Time in marked successfully', 'success');
    
    // Refresh the attendance table
    loadSection('attendance');
}

function markTimeOut(employeeId) {
    const selectedDate = document.getElementById('attendanceDate').value;
    const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format
    
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Mark Time Out</h3>
                <span class="close" onclick="closeModal('markTimeOutModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="timeOut">Time Out *</label>
                    <input type="time" id="timeOut" class="form-control" value="${currentTime}" required>
                </div>
                
                <div class="form-group">
                    <label for="timeOutNotes">Notes</label>
                    <textarea id="timeOutNotes" class="form-control" placeholder="Any additional notes" rows="3"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('markTimeOutModal')">Cancel</button>
                <button class="btn btn-primary" onclick="confirmTimeOut('${employeeId}')">Mark Time Out</button>
            </div>
        </div>
    `;
    
    createModal('markTimeOutModal', modalContent);
    openModal('markTimeOutModal');
}

function confirmTimeOut(employeeId) {
    const selectedDate = document.getElementById('attendanceDate').value;
    const timeOut = document.getElementById('timeOut').value;
    const notes = document.getElementById('timeOutNotes').value;
    
    if (!timeOut) {
        showNotification('Please enter time out', 'error');
        return;
    }
    
    const attendance = DB.getAttendance();
    const attendanceIndex = attendance.findIndex(a => 
        a.employeeId === employeeId && a.date === selectedDate
    );
    
    if (attendanceIndex === -1) {
        showNotification('No time in record found for this date', 'error');
        return;
    }
    
    attendance[attendanceIndex].timeOut = timeOut;
    if (notes) {
        attendance[attendanceIndex].notes = (attendance[attendanceIndex].notes || '') + ' ' + notes;
    }
    
    DB.saveAttendance(attendance);
    
    closeModal('markTimeOutModal');
    showNotification('Time out marked successfully', 'success');
    
    // Refresh the attendance table
    loadSection('attendance');
}

function viewAttendance(employeeId) {
    const selectedDate = document.getElementById('attendanceDate').value;
    const attendance = DB.getAttendance().find(a => 
        a.employeeId === employeeId && a.date === selectedDate
    );
    const employee = DB.findStaffById(employeeId);
    
    if (!attendance) {
        showNotification('Attendance record not found', 'error');
        return;
    }
    
    // Calculate hours worked
    let hoursWorked = '--';
    if (attendance.timeIn && attendance.timeOut) {
        const [inHours, inMinutes] = attendance.timeIn.split(':').map(Number);
        const [outHours, outMinutes] = attendance.timeOut.split(':').map(Number);
        const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
        hoursWorked = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
    }
    
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Attendance Details</h3>
                <span class="close" onclick="closeModal('viewAttendanceModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4>Employee Information</h4>
                        <p><strong>Name:</strong> ${employee?.name || 'Unknown'}</p>
                        <p><strong>Employee ID:</strong> ${employeeId}</p>
                        <p><strong>Department:</strong> ${employee?.department || 'N/A'}</p>
                    </div>
                    <div>
                        <h4>Attendance Details</h4>
                        <p><strong>Date:</strong> ${formatDate(new Date(selectedDate))}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${attendance.status === 'present' ? 'approved' : 'rejected'}">${attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}</span></p>
                        <p><strong>Hours Worked:</strong> ${hoursWorked}</p>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <h4>Time Records</h4>
                    <p><strong>Time In:</strong> ${attendance.timeIn || '--:--'}</p>
                    <p><strong>Time Out:</strong> ${attendance.timeOut || '--:--'}</p>
                </div>
                
                ${attendance.notes ? `
                    <div style="margin-top: 20px;">
                        <h4>Notes</h4>
                        <p>${attendance.notes}</p>
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('viewAttendanceModal')">Close</button>
                <button class="btn btn-warning" onclick="editAttendance('${employeeId}')">Edit</button>
            </div>
        </div>
    `;
    
    createModal('viewAttendanceModal', modalContent);
    openModal('viewAttendanceModal');
}

function editAttendance(employeeId) {
    const selectedDate = document.getElementById('attendanceDate').value;
    const attendance = DB.getAttendance().find(a => 
        a.employeeId === employeeId && a.date === selectedDate
    );
    const employee = DB.findStaffById(employeeId);
    
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Attendance - ${employee?.name}</h3>
                <span class="close" onclick="closeModal('editAttendanceModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="editTimeIn">Time In</label>
                    <input type="time" id="editTimeIn" class="form-control" value="${attendance?.timeIn || ''}">
                </div>
                
                <div class="form-group">
                    <label for="editTimeOut">Time Out</label>
                    <input type="time" id="editTimeOut" class="form-control" value="${attendance?.timeOut || ''}">
                </div>
                
                <div class="form-group">
                    <label for="editAttendanceStatus">Status</label>
                    <select id="editAttendanceStatus" class="form-control">
                        <option value="present" ${attendance?.status === 'present' ? 'selected' : ''}>Present</option>
                        <option value="absent" ${attendance?.status === 'absent' ? 'selected' : ''}>Absent</option>
                        <option value="late" ${attendance?.status === 'late' ? 'selected' : ''}>Late</option>
                        <option value="half_day" ${attendance?.status === 'half_day' ? 'selected' : ''}>Half Day</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="editAttendanceNotes">Notes</label>
                    <textarea id="editAttendanceNotes" class="form-control" rows="3">${attendance?.notes || ''}</textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('editAttendanceModal')">Cancel</button>
                <button class="btn btn-primary" onclick="updateAttendance('${employeeId}')">Update</button>
            </div>
        </div>
    `;
    
    createModal('editAttendanceModal', modalContent);
    openModal('editAttendanceModal');
}

function updateAttendance(employeeId) {
    const selectedDate = document.getElementById('attendanceDate').value;
    const timeIn = document.getElementById('editTimeIn').value;
    const timeOut = document.getElementById('editTimeOut').value;
    const status = document.getElementById('editAttendanceStatus').value;
    const notes = document.getElementById('editAttendanceNotes').value;
    
    const attendance = DB.getAttendance();
    const attendanceIndex = attendance.findIndex(a => 
        a.employeeId === employeeId && a.date === selectedDate
    );
    
    const attendanceRecord = {
        employeeId: employeeId,
        date: selectedDate,
        timeIn: timeIn || null,
        timeOut: timeOut || null,
        status: status,
        notes: notes,
        updated: new Date().toISOString()
    };
    
    if (attendanceIndex !== -1) {
        attendance[attendanceIndex] = {
            ...attendance[attendanceIndex],
            ...attendanceRecord
        };
    } else {
        attendanceRecord.created = new Date().toISOString();
        attendance.push(attendanceRecord);
    }
    
    DB.saveAttendance(attendance);
    
    closeModal('editAttendanceModal');
    showNotification('Attendance updated successfully', 'success');
    
    // Refresh the attendance table
    loadSection('attendance');
}

function markBulkAttendance() {
    const staff = DB.getStaff();
    const selectedDate = document.getElementById('attendanceDate').value;
    
    const modalContent = `
        <div class="modal-content" style="width: 700px;">
            <div class="modal-header">
                <h3>Bulk Attendance - ${formatDate(new Date(selectedDate))}</h3>
                <span class="close" onclick="closeModal('bulkAttendanceModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="alert alert-info" style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <strong>Instructions:</strong> Select employees and set their attendance status for ${formatDate(new Date(selectedDate))}.
                </div>
                
                <div style="max-height: 400px; overflow-y: auto;">
                    <table style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Time In</th>
                                <th>Time Out</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${staff.map(employee => {
                                const existingAttendance = DB.getAttendance().find(a => 
                                    a.employeeId === employee.id && a.date === selectedDate
                                );
                                
                                return `
                                    <tr>
                                        <td><input type="checkbox" id="bulk_${employee.id}" checked></td>
                                        <td>${employee.name}</td>
                                        <td>${employee.department}</td>
                                        <td>
                                            <select id="status_${employee.id}" style="width: 100px;">
                                                <option value="present" ${existingAttendance?.status === 'present' ? 'selected' : ''}>Present</option>
                                                <option value="absent" ${existingAttendance?.status === 'absent' ? 'selected' : ''}>Absent</option>
                                                <option value="late" ${existingAttendance?.status === 'late' ? 'selected' : ''}>Late</option>
                                                <option value="half_day" ${existingAttendance?.status === 'half_day' ? 'selected' : ''}>Half Day</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input type="time" id="timeIn_${employee.id}" value="${existingAttendance?.timeIn || '08:00'}" style="width: 100px;">
                                        </td>
                                        <td>
                                            <input type="time" id="timeOut_${employee.id}" value="${existingAttendance?.timeOut || '17:00'}" style="width: 100px;">
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('bulkAttendanceModal')">Cancel</button>
                <button class="btn btn-primary" onclick="confirmBulkAttendance()">Save Bulk Attendance</button>
            </div>
        </div>
    `;
    
    createModal('bulkAttendanceModal', modalContent);
    openModal('bulkAttendanceModal');
}

function confirmBulkAttendance() {
    const selectedDate = document.getElementById('attendanceDate').value;
    const staff = DB.getStaff();
    const attendance = DB.getAttendance();
    
    let updatedCount = 0;
    
    staff.forEach(employee => {
        const isSelected = document.getElementById(`bulk_${employee.id}`)?.checked;
        if (!isSelected) return;
        
        const status = document.getElementById(`status_${employee.id}`).value;
        const timeIn = document.getElementById(`timeIn_${employee.id}`).value;
        const timeOut = document.getElementById(`timeOut_${employee.id}`).value;
        
        const existingIndex = attendance.findIndex(a => 
            a.employeeId === employee.id && a.date === selectedDate
        );
        
        const attendanceRecord = {
            employeeId: employee.id,
            date: selectedDate,
            timeIn: status !== 'absent' ? timeIn : null,
            timeOut: status !== 'absent' ? timeOut : null,
            status: status,
            updated: new Date().toISOString()
        };
        
        if (existingIndex !== -1) {
            attendance[existingIndex] = {
                ...attendance[existingIndex],
                ...attendanceRecord
            };
        } else {
            attendanceRecord.created = new Date().toISOString();
            attendance.push(attendanceRecord);
        }
        
        updatedCount++;
    });
    
    DB.saveAttendance(attendance);
    closeModal('bulkAttendanceModal');
    showNotification(`Updated attendance for ${updatedCount} employees`, 'success');
    
    // Refresh the attendance table
    loadSection('attendance');
}

function markAllPresent() {
    const selectedDate = document.getElementById('attendanceDate').value;
    const staff = DB.getStaff();
    const attendance = DB.getAttendance();
    
    staff.forEach(employee => {
        const existingIndex = attendance.findIndex(a => 
            a.employeeId === employee.id && a.date === selectedDate
        );
        
        const attendanceRecord = {
            employeeId: employee.id,
            date: selectedDate,
            timeIn: '08:00',
            timeOut: '17:00',
            status: 'present',
            updated: new Date().toISOString()
        };
        
        if (existingIndex !== -1) {
            attendance[existingIndex] = {
                ...attendance[existingIndex],
                ...attendanceRecord
            };
        } else {
            attendanceRecord.created = new Date().toISOString();
            attendance.push(attendanceRecord);
        }
    });
    
    DB.saveAttendance(attendance);
    showNotification('All employees marked as present', 'success');
    
    // Refresh the attendance table
    loadSection('attendance');
}

function markAllAbsent() {
    const selectedDate = document.getElementById('attendanceDate').value;
    const staff = DB.getStaff();
    const attendance = DB.getAttendance();
    
    staff.forEach(employee => {
        const existingIndex = attendance.findIndex(a => 
            a.employeeId === employee.id && a.date === selectedDate
        );
        
        const attendanceRecord = {
            employeeId: employee.id,
            date: selectedDate,
            timeIn: null,
            timeOut: null,
            status: 'absent',
            updated: new Date().toISOString()
        };
        
        if (existingIndex !== -1) {
            attendance[existingIndex] = {
                ...attendance[existingIndex],
                ...attendanceRecord
            };
        } else {
            attendanceRecord.created = new Date().toISOString();
            attendance.push(attendanceRecord);
        }
    });
    
    DB.saveAttendance(attendance);
    showNotification('All employees marked as absent', 'success');
    
    // Refresh the attendance table
    loadSection('attendance');
}

function generateAttendanceReport() {
    const staff = DB.getStaff();
    const attendance = DB.getAttendance();
    const selectedDate = document.getElementById('attendanceDate').value;
    
    const reportData = staff.map(employee => {
        const employeeAttendance = attendance.find(a => 
            a.employeeId === employee.id && a.date === selectedDate
        );
        
        return {
            'Employee ID': employee.id,
            'Employee Name': employee.name,
            'Department': employee.department,
            'Date': formatDate(new Date(selectedDate)),
            'Time In': employeeAttendance?.timeIn || '--:--',
            'Time Out': employeeAttendance?.timeOut || '--:--',
            'Status': employeeAttendance?.status ? 
                employeeAttendance.status.charAt(0).toUpperCase() + employeeAttendance.status.slice(1).replace('_', ' ') : 
                'Absent',
            'Notes': employeeAttendance?.notes || 'N/A'
        };
    });
    
    const headers = Object.keys(reportData[0]);
    const csvContent = [
        headers.join(','),
        ...reportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    downloadTextFile(csvContent, `icure-attendance-${selectedDate}.csv`);
    showNotification('Attendance report exported successfully', 'success');
}

function openAttendanceSettings() {
    showNotification('Attendance settings would be configured here', 'info');
}