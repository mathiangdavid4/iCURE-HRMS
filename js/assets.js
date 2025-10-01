// Facility Assets Management functionality
function loadAssets(section) {
    const assets = DB.getAssets();
    const staff = DB.getStaff();
    
    section.innerHTML = `
        <div class="quick-actions">
            <div class="action-btn" onclick="openAddAssetModal()">
                <i class="fas fa-plus"></i>
                <span>Add Asset</span>
            </div>
            <div class="action-btn" onclick="generateAssetReport()">
                <i class="fas fa-file-export"></i>
                <span>Export Asset List</span>
            </div>
            <div class="action-btn" onclick="openAssetMaintenance()">
                <i class="fas fa-tools"></i>
                <span>Maintenance</span>
            </div>
            <div class="action-btn" onclick="openAssetCategories()">
                <i class="fas fa-tags"></i>
                <span>Categories</span>
            </div>
        </div>

        <div class="filters" style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center;">
            <div class="form-group" style="margin-bottom: 0;">
                <label for="assetCategoryFilter">Category</label>
                <select id="assetCategoryFilter" class="form-control" onchange="filterAssets()" style="width: 200px;">
                    <option value="">All Categories</option>
                    <option value="Medical Equipment">Medical Equipment</option>
                    <option value="Lab Equipment">Lab Equipment</option>
                    <option value="Office Equipment">Office Equipment</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="IT Equipment">IT Equipment</option>
                </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label for="assetStatusFilter">Status</label>
                <select id="assetStatusFilter" class="form-control" onchange="filterAssets()" style="width: 150px;">
                    <option value="">All Status</option>
                    <option value="in_use">In Use</option>
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label for="assetLocationFilter">Location</label>
                <select id="assetLocationFilter" class="form-control" onchange="filterAssets()" style="width: 200px;">
                    <option value="">All Locations</option>
                    <option value="Cardiology Department">Cardiology Department</option>
                    <option value="Emergency Department">Emergency Department</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Radiology Department">Radiology Department</option>
                    <option value="Administration">Administration</option>
                    <option value="Reception">Reception</option>
                    <option value="Storage">Storage</option>
                </select>
            </div>
        </div>

        <h2 class="section-title">Facility Assets</h2>
        <div id="assetsTableContainer">
            ${renderAssetsTable(assets, staff)}
        </div>
        
        <div style="margin-top: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h3>Assets Summary</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 15px;">
                <div class="card primary">
                    <div class="card-header">
                        <h3>Total Assets</h3>
                        <i class="fas fa-boxes"></i>
                    </div>
                    <div class="card-body">
                        <h2>${assets.length}</h2>
                        <p>All assets</p>
                    </div>
                </div>
                <div class="card success">
                    <div class="card-header">
                        <h3>In Use</h3>
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="card-body">
                        <h2>${assets.filter(a => a.status === 'in_use').length}</h2>
                        <p>Active assets</p>
                    </div>
                </div>
                <div class="card warning">
                    <div class="card-header">
                        <h3>Maintenance</h3>
                        <i class="fas fa-tools"></i>
                    </div>
                    <div class="card-body">
                        <h2>${assets.filter(a => a.status === 'maintenance').length}</h2>
                        <p>Under repair</p>
                    </div>
                </div>
                <div class="card danger">
                    <div class="card-header">
                        <h3>Total Value</h3>
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="card-body">
                        <h2>${formatCurrency(calculateTotalAssetValue(assets))}</h2>
                        <p>Current assets</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAssetsTable(assets, staff) {
    return `
        <table>
            <thead>
                <tr>
                    <th>Asset ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Purchase Date</th>
                    <th>Value</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${assets.map(asset => {
                    const assignedTo = asset.assignedTo ? staff.find(s => s.id === asset.assignedTo) : null;
                    
                    return `
                        <tr>
                            <td>${asset.id}</td>
                            <td><strong>${asset.name}</strong></td>
                            <td>${asset.category}</td>
                            <td>${asset.location}</td>
                            <td>
                                <span class="status-badge status-${getAssetStatusClass(asset.status)}">
                                    ${getAssetStatusDisplay(asset.status)}
                                </span>
                            </td>
                            <td>${assignedTo ? assignedTo.name : 'Not Assigned'}</td>
                            <td>${formatDate(new Date(asset.purchaseDate))}</td>
                            <td>${formatCurrency(asset.value || 0)}</td>
                            <td>
                                <button class="btn btn-primary btn-sm" onclick="viewAsset('${asset.id}')">View</button>
                                <button class="btn btn-warning btn-sm" onclick="editAsset('${asset.id}')">Edit</button>
                                <button class="btn btn-info btn-sm" onclick="assignAsset('${asset.id}')">Assign</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function getAssetStatusDisplay(status) {
    const statusMap = {
        'in_use': 'In Use',
        'available': 'Available',
        'maintenance': 'Maintenance',
        'retired': 'Retired'
    };
    return statusMap[status] || status;
}

function getAssetStatusClass(status) {
    const classMap = {
        'in_use': 'approved',
        'available': 'approved',
        'maintenance': 'pending',
        'retired': 'rejected'
    };
    return classMap[status] || 'pending';
}

function calculateTotalAssetValue(assets) {
    return assets.reduce((total, asset) => total + (asset.value || 0), 0);
}

function filterAssets() {
    const categoryFilter = document.getElementById('assetCategoryFilter').value;
    const statusFilter = document.getElementById('assetStatusFilter').value;
    const locationFilter = document.getElementById('assetLocationFilter').value;
    
    let assets = DB.getAssets();
    const staff = DB.getStaff();
    
    // Apply filters
    if (categoryFilter) {
        assets = assets.filter(asset => asset.category === categoryFilter);
    }
    
    if (statusFilter) {
        assets = assets.filter(asset => asset.status === statusFilter);
    }
    
    if (locationFilter) {
        assets = assets.filter(asset => asset.location === locationFilter);
    }
    
    document.getElementById('assetsTableContainer').innerHTML = renderAssetsTable(assets, staff);
}

function openAddAssetModal() {
    const staff = DB.getStaff();
    
    const modalContent = `
        <div class="modal-content" style="width: 600px;">
            <div class="modal-header">
                <h3>Add New Asset</h3>
                <span class="close" onclick="closeModal('addAssetModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="assetName">Asset Name *</label>
                    <input type="text" id="assetName" class="form-control" placeholder="Enter asset name" required>
                </div>
                
                <div class="form-group">
                    <label for="assetCategory">Category *</label>
                    <select id="assetCategory" class="form-control" required>
                        <option value="">Select Category</option>
                        <option value="Medical Equipment">Medical Equipment</option>
                        <option value="Lab Equipment">Lab Equipment</option>
                        <option value="Office Equipment">Office Equipment</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Vehicle">Vehicle</option>
                        <option value="IT Equipment">IT Equipment</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="assetLocation">Location *</label>
                    <select id="assetLocation" class="form-control" required>
                        <option value="">Select Location</option>
                        <option value="Cardiology Department">Cardiology Department</option>
                        <option value="Emergency Department">Emergency Department</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Laboratory">Laboratory</option>
                        <option value="Radiology Department">Radiology Department</option>
                        <option value="Administration">Administration</option>
                        <option value="Reception">Reception</option>
                        <option value="Storage">Storage</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="assetStatus">Status *</label>
                    <select id="assetStatus" class="form-control" required>
                        <option value="available">Available</option>
                        <option value="in_use">In Use</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="retired">Retired</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="assetAssignedTo">Assigned To</label>
                    <select id="assetAssignedTo" class="form-control">
                        <option value="">Not Assigned</option>
                        ${staff.map(emp => `<option value="${emp.id}">${emp.name} - ${emp.department}</option>`).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="assetPurchaseDate">Purchase Date *</label>
                    <input type="date" id="assetPurchaseDate" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="assetValue">Value ($) *</label>
                    <input type="number" id="assetValue" class="form-control" placeholder="Enter asset value" min="0" step="0.01" required>
                </div>
                
                <div class="form-group">
                    <label for="assetSerialNumber">Serial Number</label>
                    <input type="text" id="assetSerialNumber" class="form-control" placeholder="Enter serial number">
                </div>
                
                <div class="form-group">
                    <label for="assetModel">Model</label>
                    <input type="text" id="assetModel" class="form-control" placeholder="Enter model">
                </div>
                
                <div class="form-group">
                    <label for="assetSupplier">Supplier</label>
                    <input type="text" id="assetSupplier" class="form-control" placeholder="Enter supplier name">
                </div>
                
                <div class="form-group">
                    <label for="assetWarranty">Warranty Information</label>
                    <textarea id="assetWarranty" class="form-control" placeholder="Warranty details" rows="3"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="assetDescription">Description</label>
                    <textarea id="assetDescription" class="form-control" placeholder="Asset description" rows="3"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('addAssetModal')">Cancel</button>
                <button class="btn btn-primary" onclick="addNewAsset()">Add Asset</button>
            </div>
        </div>
    `;
    
    createModal('addAssetModal', modalContent);
    openModal('addAssetModal');
    
    // Set today's date as default purchase date
    document.getElementById('assetPurchaseDate').valueAsDate = new Date();
}

function addNewAsset() {
    const name = document.getElementById('assetName').value;
    const category = document.getElementById('assetCategory').value;
    const location = document.getElementById('assetLocation').value;
    const status = document.getElementById('assetStatus').value;
    const assignedTo = document.getElementById('assetAssignedTo').value;
    const purchaseDate = document.getElementById('assetPurchaseDate').value;
    const value = parseFloat(document.getElementById('assetValue').value);
    const serialNumber = document.getElementById('assetSerialNumber').value;
    const model = document.getElementById('assetModel').value;
    const supplier = document.getElementById('assetSupplier').value;
    const warranty = document.getElementById('assetWarranty').value;
    const description = document.getElementById('assetDescription').value;
    
    // Validation
    if (!name || !category || !location || !status || !purchaseDate || !value) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (value <= 0) {
        showNotification('Asset value must be greater than 0', 'error');
        return;
    }
    
    const assets = DB.getAssets();
    
    // Generate asset ID
    const assetId = 'AST-' + (assets.length + 1).toString().padStart(3, '0');
    
    // Create new asset
    const newAsset = {
        id: assetId,
        name: name,
        category: category,
        location: location,
        status: status,
        assignedTo: assignedTo || null,
        purchaseDate: purchaseDate,
        value: value,
        serialNumber: serialNumber,
        model: model,
        supplier: supplier,
        warranty: warranty,
        description: description,
        created: new Date().toISOString()
    };
    
    assets.push(newAsset);
    DB.saveAssets(assets);
    
    closeModal('addAssetModal');
    showNotification('Asset added successfully', 'success');
    
    // Refresh the assets table
    loadSection('assets');
}

function viewAsset(assetId) {
    const asset = DB.getAssets().find(a => a.id === assetId);
    const assignedTo = asset.assignedTo ? DB.findStaffById(asset.assignedTo) : null;
    
    if (!asset) {
        showNotification('Asset not found', 'error');
        return;
    }
    
    const modalContent = `
        <div class="modal-content" style="width: 700px;">
            <div class="modal-header">
                <h3>Asset Details - ${asset.name}</h3>
                <span class="close" onclick="closeModal('viewAssetModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4>Basic Information</h4>
                        <p><strong>Asset ID:</strong> ${asset.id}</p>
                        <p><strong>Name:</strong> ${asset.name}</p>
                        <p><strong>Category:</strong> ${asset.category}</p>
                        <p><strong>Location:</strong> ${asset.location}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${getAssetStatusClass(asset.status)}">${getAssetStatusDisplay(asset.status)}</span></p>
                    </div>
                    <div>
                        <h4>Financial Details</h4>
                        <p><strong>Value:</strong> ${formatCurrency(asset.value)}</p>
                        <p><strong>Purchase Date:</strong> ${formatDate(new Date(asset.purchaseDate))}</p>
                        <p><strong>Age:</strong> ${calculateAssetAge(asset.purchaseDate)}</p>
                        <p><strong>Depreciation:</strong> ${calculateDepreciation(asset.value, asset.purchaseDate)}</p>
                    </div>
                </div>
                
                <div style="margin-top: 20px;">
                    <h4>Assignment</h4>
                    <p><strong>Assigned To:</strong> ${assignedTo ? assignedTo.name : 'Not Assigned'}</p>
                    ${assignedTo ? `<p><strong>Department:</strong> ${assignedTo.department}</p>` : ''}
                    ${assignedTo ? `<p><strong>Role:</strong> ${assignedTo.role}</p>` : ''}
                </div>
                
                ${asset.serialNumber ? `
                    <div style="margin-top: 20px;">
                        <h4>Technical Details</h4>
                        <p><strong>Serial Number:</strong> ${asset.serialNumber}</p>
                        ${asset.model ? `<p><strong>Model:</strong> ${asset.model}</p>` : ''}
                        ${asset.supplier ? `<p><strong>Supplier:</strong> ${asset.supplier}</p>` : ''}
                    </div>
                ` : ''}
                
                ${asset.warranty ? `
                    <div style="margin-top: 20px;">
                        <h4>Warranty Information</h4>
                        <p>${asset.warranty}</p>
                    </div>
                ` : ''}
                
                ${asset.description ? `
                    <div style="margin-top: 20px;">
                        <h4>Description</h4>
                        <p>${asset.description}</p>
                    </div>
                ` : ''}
                
                <div style="margin-top: 20px;">
                    <h4>Additional Information</h4>
                    <p><strong>Created:</strong> ${formatDate(new Date(asset.created))}</p>
                    ${asset.updated ? `<p><strong>Last Updated:</strong> ${formatDate(new Date(asset.updated))}</p>` : ''}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('viewAssetModal')">Close</button>
                <button class="btn btn-warning" onclick="editAsset('${asset.id}')">Edit</button>
                <button class="btn btn-info" onclick="assignAsset('${asset.id}')">Assign</button>
            </div>
        </div>
    `;
    
    createModal('viewAssetModal', modalContent);
    openModal('viewAssetModal');
}

function calculateAssetAge(purchaseDate) {
    const purchase = new Date(purchaseDate);
    const now = new Date();
    const diffTime = Math.abs(now - purchase);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
    }
    return `${months} month${months > 1 ? 's' : ''}`;
}

function calculateDepreciation(value, purchaseDate) {
    const purchase = new Date(purchaseDate);
    const now = new Date();
    const diffTime = Math.abs(now - purchase);
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
    
    // Assume 10% annual depreciation for medical equipment
    const depreciationRate = 0.1;
    const depreciation = value * depreciationRate * diffYears;
    const currentValue = Math.max(0, value - depreciation);
    
    return `${formatCurrency(currentValue)} (${formatCurrency(depreciation)} depreciated)`;
}

function editAsset(assetId) {
    const asset = DB.getAssets().find(a => a.id === assetId);
    const staff = DB.getStaff();
    
    if (!asset) {
        showNotification('Asset not found', 'error');
        return;
    }
    
    const modalContent = `
        <div class="modal-content" style="width: 600px;">
            <div class="modal-header">
                <h3>Edit Asset - ${asset.name}</h3>
                <span class="close" onclick="closeModal('editAssetModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="editAssetName">Asset Name *</label>
                    <input type="text" id="editAssetName" class="form-control" value="${asset.name}" required>
                </div>
                
                <div class="form-group">
                    <label for="editAssetCategory">Category *</label>
                    <select id="editAssetCategory" class="form-control" required>
                        <option value="Medical Equipment" ${asset.category === 'Medical Equipment' ? 'selected' : ''}>Medical Equipment</option>
                        <option value="Lab Equipment" ${asset.category === 'Lab Equipment' ? 'selected' : ''}>Lab Equipment</option>
                        <option value="Office Equipment" ${asset.category === 'Office Equipment' ? 'selected' : ''}>Office Equipment</option>
                        <option value="Furniture" ${asset.category === 'Furniture' ? 'selected' : ''}>Furniture</option>
                        <option value="Vehicle" ${asset.category === 'Vehicle' ? 'selected' : ''}>Vehicle</option>
                        <option value="IT Equipment" ${asset.category === 'IT Equipment' ? 'selected' : ''}>IT Equipment</option>
                        <option value="Other" ${asset.category === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="editAssetLocation">Location *</label>
                    <select id="editAssetLocation" class="form-control" required>
                        <option value="Cardiology Department" ${asset.location === 'Cardiology Department' ? 'selected' : ''}>Cardiology Department</option>
                        <option value="Emergency Department" ${asset.location === 'Emergency Department' ? 'selected' : ''}>Emergency Department</option>
                        <option value="Pharmacy" ${asset.location === 'Pharmacy' ? 'selected' : ''}>Pharmacy</option>
                        <option value="Laboratory" ${asset.location === 'Laboratory' ? 'selected' : ''}>Laboratory</option>
                        <option value="Radiology Department" ${asset.location === 'Radiology Department' ? 'selected' : ''}>Radiology Department</option>
                        <option value="Administration" ${asset.location === 'Administration' ? 'selected' : ''}>Administration</option>
                        <option value="Reception" ${asset.location === 'Reception' ? 'selected' : ''}>Reception</option>
                        <option value="Storage" ${asset.location === 'Storage' ? 'selected' : ''}>Storage</option>
                        <option value="Other" ${asset.location === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="editAssetStatus">Status *</label>
                    <select id="editAssetStatus" class="form-control" required>
                        <option value="available" ${asset.status === 'available' ? 'selected' : ''}>Available</option>
                        <option value="in_use" ${asset.status === 'in_use' ? 'selected' : ''}>In Use</option>
                        <option value="maintenance" ${asset.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                        <option value="retired" ${asset.status === 'retired' ? 'selected' : ''}>Retired</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="editAssetAssignedTo">Assigned To</label>
                    <select id="editAssetAssignedTo" class="form-control">
                        <option value="">Not Assigned</option>
                        ${staff.map(emp => `
                            <option value="${emp.id}" ${asset.assignedTo === emp.id ? 'selected' : ''}>
                                ${emp.name} - ${emp.department}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="editAssetValue">Value ($) *</label>
                    <input type="number" id="editAssetValue" class="form-control" value="${asset.value}" min="0" step="0.01" required>
                </div>
                
                <div class="form-group">
                    <label for="editAssetSerialNumber">Serial Number</label>
                    <input type="text" id="editAssetSerialNumber" class="form-control" value="${asset.serialNumber || ''}">
                </div>
                
                <div class="form-group">
                    <label for="editAssetModel">Model</label>
                    <input type="text" id="editAssetModel" class="form-control" value="${asset.model || ''}">
                </div>
                
                <div class="form-group">
                    <label for="editAssetSupplier">Supplier</label>
                    <input type="text" id="editAssetSupplier" class="form-control" value="${asset.supplier || ''}">
                </div>
                
                <div class="form-group">
                    <label for="editAssetWarranty">Warranty Information</label>
                    <textarea id="editAssetWarranty" class="form-control" rows="3">${asset.warranty || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="editAssetDescription">Description</label>
                    <textarea id="editAssetDescription" class="form-control" rows="3">${asset.description || ''}</textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('editAssetModal')">Cancel</button>
                <button class="btn btn-primary" onclick="updateAsset('${asset.id}')">Update Asset</button>
            </div>
        </div>
    `;
    
    createModal('editAssetModal', modalContent);
    openModal('editAssetModal');
}

function updateAsset(assetId) {
    const name = document.getElementById('editAssetName').value;
    const category = document.getElementById('editAssetCategory').value;
    const location = document.getElementById('editAssetLocation').value;
    const status = document.getElementById('editAssetStatus').value;
    const assignedTo = document.getElementById('editAssetAssignedTo').value;
    const value = parseFloat(document.getElementById('editAssetValue').value);
    const serialNumber = document.getElementById('editAssetSerialNumber').value;
    const model = document.getElementById('editAssetModel').value;
    const supplier = document.getElementById('editAssetSupplier').value;
    const warranty = document.getElementById('editAssetWarranty').value;
    const description = document.getElementById('editAssetDescription').value;
    
    // Validation
    if (!name || !category || !location || !status || !value) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (value <= 0) {
        showNotification('Asset value must be greater than 0', 'error');
        return;
    }
    
    const assets = DB.getAssets();
    const assetIndex = assets.findIndex(a => a.id === assetId);
    
    if (assetIndex === -1) {
        showNotification('Asset not found', 'error');
        return;
    }
    
    // Update asset
    assets[assetIndex] = {
        ...assets[assetIndex],
        name: name,
        category: category,
        location: location,
        status: status,
        assignedTo: assignedTo || null,
        value: value,
        serialNumber: serialNumber,
        model: model,
        supplier: supplier,
        warranty: warranty,
        description: description,
        updated: new Date().toISOString()
    };
    
    DB.saveAssets(assets);
    
    closeModal('editAssetModal');
    showNotification('Asset updated successfully', 'success');
    
    // Refresh the assets table
    loadSection('assets');
}

function assignAsset(assetId) {
    const asset = DB.getAssets().find(a => a.id === assetId);
    const staff = DB.getStaff();
    
    if (!asset) {
        showNotification('Asset not found', 'error');
        return;
    }
    
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Assign Asset - ${asset.name}</h3>
                <span class="close" onclick="closeModal('assignAssetModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="alert alert-info" style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <strong>Current Assignment:</strong> ${asset.assignedTo ? DB.findStaffById(asset.assignedTo)?.name || 'Unknown' : 'Not Assigned'}
                </div>
                
                <div class="form-group">
                    <label for="assignToEmployee">Assign To Employee</label>
                    <select id="assignToEmployee" class="form-control">
                        <option value="">Not Assigned (Make Available)</option>
                        ${staff.map(emp => `
                            <option value="${emp.id}" ${asset.assignedTo === emp.id ? 'selected' : ''}>
                                ${emp.name} - ${emp.department} - ${emp.role}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="assignmentNotes">Assignment Notes</label>
                    <textarea id="assignmentNotes" class="form-control" placeholder="Reason for assignment or special instructions" rows="3"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="assignmentDate">Assignment Date</label>
                    <input type="date" id="assignmentDate" class="form-control">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('assignAssetModal')">Cancel</button>
                <button class="btn btn-primary" onclick="confirmAssetAssignment('${asset.id}')">Assign Asset</button>
            </div>
        </div>
    `;
    
    createModal('assignAssetModal', modalContent);
    openModal('assignAssetModal');
    
    // Set today's date as default assignment date
    document.getElementById('assignmentDate').valueAsDate = new Date();
}

function confirmAssetAssignment(assetId) {
    const assignedTo = document.getElementById('assignToEmployee').value;
    const notes = document.getElementById('assignmentNotes').value;
    const assignmentDate = document.getElementById('assignmentDate').value;
    
    const assets = DB.getAssets();
    const assetIndex = assets.findIndex(a => a.id === assetId);
    
    if (assetIndex === -1) {
        showNotification('Asset not found', 'error');
        return;
    }
    
    // Update asset assignment
    assets[assetIndex].assignedTo = assignedTo || null;
    assets[assetIndex].status = assignedTo ? 'in_use' : 'available';
    assets[assetIndex].assignmentNotes = notes;
    assets[assetIndex].assignmentDate = assignmentDate;
    assets[assetIndex].updated = new Date().toISOString();
    
    DB.saveAssets(assets);
    
    closeModal('assignAssetModal');
    showNotification('Asset assignment updated successfully', 'success');
    
    // Refresh the assets table
    loadSection('assets');
}

function generateAssetReport() {
    const assets = DB.getAssets();
    const staff = DB.getStaff();
    
    const reportData = assets.map(asset => {
        const assignedTo = asset.assignedTo ? staff.find(s => s.id === asset.assignedTo) : null;
        
        return {
            'Asset ID': asset.id,
            'Name': asset.name,
            'Category': asset.category,
            'Location': asset.location,
            'Status': getAssetStatusDisplay(asset.status),
            'Assigned To': assignedTo ? assignedTo.name : 'Not Assigned',
            'Department': assignedTo ? assignedTo.department : 'N/A',
            'Purchase Date': formatDate(new Date(asset.purchaseDate)),
            'Value': formatCurrency(asset.value),
            'Serial Number': asset.serialNumber || 'N/A',
            'Model': asset.model || 'N/A',
            'Supplier': asset.supplier || 'N/A'
        };
    });
    
    const headers = Object.keys(reportData[0]);
    const csvContent = [
        headers.join(','),
        ...reportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    downloadTextFile(csvContent, `icure-assets-report-${new Date().toISOString().split('T')[0]}.csv`);
    showNotification('Assets report exported successfully', 'success');
}

function openAssetMaintenance() {
    const assets = DB.getAssets();
    const maintenanceAssets = assets.filter(asset => asset.status === 'maintenance');
    
    const modalContent = `
        <div class="modal-content" style="width: 800px;">
            <div class="modal-header">
                <h3>Asset Maintenance</h3>
                <span class="close" onclick="closeModal('assetMaintenanceModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="quick-actions" style="margin-bottom: 20px;">
                    <div class="action-btn" onclick="openMaintenanceRequest()">
                        <i class="fas fa-plus"></i>
                        <span>New Maintenance</span>
                    </div>
                    <div class="action-btn" onclick="openMaintenanceSchedule()">
                        <i class="fas fa-calendar"></i>
                        <span>Maintenance Schedule</span>
                    </div>
                </div>
                
                <h4>Assets Under Maintenance (${maintenanceAssets.length})</h4>
                ${maintenanceAssets.length > 0 ? `
                    <table style="width: 100%; margin-top: 15px;">
                        <thead>
                            <tr>
                                <th>Asset</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Issue</th>
                                <th>Reported Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${maintenanceAssets.map(asset => `
                                <tr>
                                    <td>${asset.name}</td>
                                    <td>${asset.category}</td>
                                    <td>${asset.location}</td>
                                    <td>${asset.maintenanceIssue || 'General maintenance'}</td>
                                    <td>${asset.maintenanceReported ? formatDate(new Date(asset.maintenanceReported)) : 'N/A'}</td>
                                    <td>
                                        <button class="btn btn-success btn-sm" onclick="completeMaintenance('${asset.id}')">Complete</button>
                                        <button class="btn btn-primary btn-sm" onclick="viewMaintenance('${asset.id}')">Details</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : `
                    <p style="text-align: center; padding: 20px; color: #666;">No assets currently under maintenance</p>
                `}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('assetMaintenanceModal')">Close</button>
            </div>
        </div>
    `;
    
    createModal('assetMaintenanceModal', modalContent);
    openModal('assetMaintenanceModal');
}

function openAssetCategories() {
    const assets = DB.getAssets();
    
    // Calculate category statistics
    const categories = {};
    assets.forEach(asset => {
        categories[asset.category] = (categories[asset.category] || 0) + 1;
    });
    
    const modalContent = `
        <div class="modal-content" style="width: 600px;">
            <div class="modal-header">
                <h3>Asset Categories</h3>
                <span class="close" onclick="closeModal('assetCategoriesModal')">&times;</span>
            </div>
            <div class="modal-body">
                <div class="quick-actions" style="margin-bottom: 20px;">
                    <div class="action-btn" onclick="openAddCategoryModal()">
                        <i class="fas fa-plus"></i>
                        <span>Add Category</span>
                    </div>
                </div>
                
                <h4>Category Summary</h4>
                <table style="width: 100%; margin-top: 15px;">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Number of Assets</th>
                            <th>Total Value</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(categories).map(([category, count]) => {
                            const categoryAssets = assets.filter(a => a.category === category);
                            const totalValue = categoryAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);
                            
                            return `
                                <tr>
                                    <td>${category}</td>
                                    <td>${count}</td>
                                    <td>${formatCurrency(totalValue)}</td>
                                    <td>
                                        <button class="btn btn-primary btn-sm" onclick="viewCategoryAssets('${category}')">View</button>
                                        <button class="btn btn-warning btn-sm" onclick="editCategory('${category}')">Edit</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('assetCategoriesModal')">Close</button>
            </div>
        </div>
    `;
    
    createModal('assetCategoriesModal', modalContent);
    openModal('assetCategoriesModal');
}

// Placeholder functions for maintenance features
function openMaintenanceRequest() {
    showNotification('Maintenance request functionality would be implemented here', 'info');
}

function openMaintenanceSchedule() {
    showNotification('Maintenance schedule functionality would be implemented here', 'info');
}

function completeMaintenance(assetId) {
    showNotification(`Maintenance completed for asset ${assetId}`, 'success');
}

function viewMaintenance(assetId) {
    showNotification(`View maintenance details for asset ${assetId}`, 'info');
}

function openAddCategoryModal() {
    showNotification('Add category functionality would be implemented here', 'info');
}

function viewCategoryAssets(category) {
    showNotification(`View assets in category: ${category}`, 'info');
}

function editCategory(category) {
    showNotification(`Edit category: ${category}`, 'info');
}