-- iCure Medical Centre HR System Database Schema

-- Users table
CREATE TABLE users (
    id VARCHAR(20) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('owner', 'medical_doctor', 'nurse', 'finance', 'pharmacist', 'lab_tech', 'radiologist', 'support_staff') NOT NULL,
    permissions JSON,
    staff_id VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Staff table
CREATE TABLE staff (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role ENUM('medical_doctor', 'nurse', 'finance', 'pharmacist', 'lab_tech', 'radiologist', 'support_staff') NOT NULL,
    department VARCHAR(100) NOT NULL,
    salary DECIMAL(10,2) DEFAULT 0,
    join_date DATE NOT NULL,
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Payroll table
CREATE TABLE payroll (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    period DATE NOT NULL,
    basic_salary DECIMAL(10,2) NOT NULL,
    allowances DECIMAL(10,2) DEFAULT 0,
    advances DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    nssf_employee DECIMAL(10,2) DEFAULT 0,
    nssf_employer DECIMAL(10,2) DEFAULT 0,
    net_pay DECIMAL(10,2) NOT NULL,
    paid DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) DEFAULT 0,
    status ENUM('pending', 'paid', 'partial') DEFAULT 'pending',
    payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES staff(id)
);

-- Leave requests table
CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    leave_type ENUM('annual', 'sick', 'maternity', 'paternity', 'emergency', 'unpaid') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by VARCHAR(20),
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES staff(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Salary advances table
CREATE TABLE salary_advances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    request_date DATE NOT NULL,
    reason TEXT,
    repayment_plan ENUM('one_month', 'two_months', 'three_months', 'six_months') NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'repaid') DEFAULT 'pending',
    approved_by VARCHAR(20),
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES staff(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Attendance table
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    time_in TIME,
    time_out TIME,
    status ENUM('present', 'absent', 'late', 'half_day') DEFAULT 'absent',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES staff(id),
    UNIQUE KEY unique_attendance (employee_id, date)
);

-- Allowance categories table
CREATE TABLE allowance_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('fixed', 'percentage') DEFAULT 'fixed',
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff allowances table
CREATE TABLE staff_allowances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    allowance_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    effective_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES staff(id),
    FOREIGN KEY (allowance_id) REFERENCES allowance_categories(id)
);

-- Deductions table
CREATE TABLE deductions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    deduction_date DATE NOT NULL,
    type ENUM('loan', 'advance', 'other') DEFAULT 'other',
    status ENUM('active', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES staff(id)
);

-- Assets table
CREATE TABLE assets (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    status ENUM('in_use', 'maintenance', 'retired', 'available') DEFAULT 'available',
    assigned_to VARCHAR(20),
    purchase_date DATE,
    value DECIMAL(15,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES staff(id)
);

-- System settings table
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default owner user
INSERT INTO users (id, email, password, name, role, staff_id) VALUES 
('owner', 'mathiangdavid4@gmail.com', 'Mathiangdavid@123', 'System Administrator', 'owner', 'OWNER-001');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('nssf_employee', '8', 'Employee NSSF contribution percentage'),
('nssf_employer', '17', 'Employer NSSF contribution percentage'),
('payroll_date', '25', 'Day of month for payroll processing'),
('currency', 'USD', 'Default currency for the system'),
('company_name', 'iCure Medical Centre', 'Company name'),
('company_address', 'Juba, South Sudan', 'Company address');

-- Insert default allowance categories
INSERT INTO allowance_categories (name, type, amount, description) VALUES 
('Transport Allowance', 'fixed', 100.00, 'Monthly transport allowance'),
('Housing Allowance', 'fixed', 300.00, 'Monthly housing allowance'),
('Medical Allowance', 'fixed', 150.00, 'Monthly medical allowance'),
('Risk Allowance', 'percentage', 10.00, 'Risk allowance as percentage of basic salary');

-- Create indexes for better performance
CREATE INDEX idx_staff_department ON staff(department);
CREATE INDEX idx_staff_status ON staff(status);
CREATE INDEX idx_payroll_period ON payroll(period);
CREATE INDEX idx_payroll_employee ON payroll(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_leave_status ON leave_requests(status);
CREATE INDEX idx_advance_status ON salary_advances(status);