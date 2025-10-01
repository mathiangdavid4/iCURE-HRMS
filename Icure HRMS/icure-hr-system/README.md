# iCure Medical Centre HR Management System

A comprehensive Human Resource Management System designed specifically for iCure Medical Centre with all essential HR functionalities.

## Complete File Structure
icure-hr-system/
│
├── index.html # Redirects to login page
├── login.html # Login page with authentication
├── dashboard.html # Main application dashboard
├── css/
│ ├── style.css # Main application styles
│ └── auth.css # Authentication page styles
├── js/
│ ├── app.js # Main application logic
│ ├── auth.js # Authentication functionality
│ ├── database.js # Database simulation (localStorage)
│ ├── dashboard.js # Dashboard functionality
│ ├── staff.js # Staff management
│ ├── payroll.js # Payroll processing
│ ├── leave.js # Leave management
│ ├── attendance.js # Attendance tracking
│ ├── advances.js # Salary advances management
│ └── assets.js # Facility assets management
├── sql/
│ └── database.sql # Database schema for SQL implementation
└── README.md

text

## Features

- **Staff Management**: Complete staff records with roles and departments
- **Payroll System**: Automated salary calculations with NSSF contributions (8% employee, 17% employer)
- **Leave Management**: Request and approval workflow for staff leaves
- **Salary Advances**: Manage advance salary requests and repayments
- **Attendance Tracking**: Time in/out functionality with reporting
- **Assets Management**: Track facility assets and equipment
- **Role-Based Access**: Different permissions for owners and staff

## User Roles

- Medical Doctor
- Nurse
- Finance
- Pharmacist
- Lab Tech
- Radiologist
- Support Staff (cleaner, cook, security guard)

## Default Login Credentials

**Staff Login:**
- Use staff credentials created by the owner

## Installation & Setup

1. Clone or download this repository
2. Upload all files to your web server maintaining the folder structure
3. The system uses browser localStorage, so no database setup is required
4. Open `login.html` in your web browser

## NSSF Calculations

The system automatically calculates NSSF contributions:
- Employee Contribution: 8% of basic salary
- Employer Contribution: 17% of basic salary
- Total NSSF: 25% of basic salary

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser localStorage (simulated database)
- **Icons**: Font Awesome 6.4.0
- **Design**: Responsive design with CSS Grid and Flexbox

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Security Features

- Password protection
- Session management
- Role-based access control
- Input validation

## Hosting on GitHub Pages

1. Create a new GitHub repository
2. Upload all files maintaining the folder structure
3. Enable GitHub Pages in repository settings
4. The system will be available at `https://yourusername.github.io/repository-name/login.html`

## License

This system is developed for iCure Medical Centre. All rights reserved.

## Support


For technical support or questions, please contact the system administrator.
