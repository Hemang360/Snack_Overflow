// Ayurvedic Blockchain Frontend Application
class AyurvedicApp {
    constructor() {
        this.apiBase = 'http://localhost:5000';
        this.currentUser = null;
        this.currentToken = null;
        this.currentRole = null;
        
        this.initializeEventListeners();
        this.checkHealth();
    }

    initializeEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // QR code input
        document.getElementById('qrCodeInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.verifyQR();
            }
        });
    }

    async checkHealth() {
        try {
            const response = await fetch(`${this.apiBase}/health`);
            const data = await response.json();
            if (data.ok) {
                this.showAlert('API is healthy and running!', 'success');
            }
        } catch (error) {
            this.showAlert('API is not responding. Please check if the server is running.', 'danger');
        }
    }

    selectRole(role) {
        console.log('selectRole called with:', role);
        
        // Remove previous selection
        document.querySelectorAll('.role-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked card
        const clickedCard = event.target.closest('.role-card');
        if (clickedCard) {
            clickedCard.classList.add('selected');
        }

        this.currentRole = role;
        const roleElement = document.getElementById('selectedRole');
        if (roleElement) {
            roleElement.textContent = role.charAt(0).toUpperCase() + role.slice(1);
        }
        
        // Show login section
        this.hideAllSections();
        const loginSection = document.getElementById('loginSection');
        if (loginSection) {
            loginSection.classList.remove('hidden');
        }
        
        console.log('selectRole completed');
    }

    showRegister() {
        this.hideAllSections();
        document.getElementById('registerSection').classList.remove('hidden');
    }

    showLogin() {
        this.hideAllSections();
        document.getElementById('loginSection').classList.remove('hidden');
    }

    showQRScanner() {
        this.hideAllSections();
        document.getElementById('qrScannerSection').classList.remove('hidden');
    }

    hideAllSections() {
        document.querySelectorAll('[id$="Section"]').forEach(section => {
            section.classList.add('hidden');
        });
    }

    async login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            this.showAlert('Please fill in all fields', 'warning');
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                this.currentToken = data.token;
                this.currentRole = data.user.role;
                
                document.getElementById('currentUser').textContent = data.user.username;
                this.showAlert('Login successful!', 'success');
                this.showDashboard();
            } else {
                this.showAlert(data.error || 'Login failed', 'danger');
            }
        } catch (error) {
            this.showAlert('Login error: ' + error.message, 'danger');
        }
    }

    async register() {
        const formData = {
            username: document.getElementById('regUsername').value,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
            fullName: document.getElementById('regFullName').value,
            organizationType: document.getElementById('regOrgType').value
        };

        if (!Object.values(formData).every(value => value.trim())) {
            this.showAlert('Please fill in all fields', 'warning');
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                this.showAlert('Registration successful! Please login.', 'success');
                this.showLogin();
            } else {
                this.showAlert(data.error || 'Registration failed', 'danger');
            }
        } catch (error) {
            this.showAlert('Registration error: ' + error.message, 'danger');
        }
    }

    logout() {
        this.currentUser = null;
        this.currentToken = null;
        this.currentRole = null;
        document.getElementById('currentUser').textContent = 'Guest';
        
        this.hideAllSections();
        document.getElementById('welcomeSection').classList.remove('hidden');
        
        // Clear selections
        document.querySelectorAll('.role-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        this.showAlert('Logged out successfully', 'info');
    }

    showDashboard() {
        this.hideAllSections();
        document.getElementById('dashboardSection').classList.remove('hidden');
        
        document.getElementById('dashboardRole').textContent = 
            this.currentRole.charAt(0).toUpperCase() + this.currentRole.slice(1);
        
        this.loadDashboardContent();
    }

    async loadDashboardContent() {
        await this.loadStats();
        this.loadRoleSpecificContent();
    }

    async loadStats() {
        if (!this.hasPermission('VIEW_ANALYTICS')) {
            return;
        }

        try {
            const response = await this.apiCall('/api/protected/analytics/dashboard-stats');
            
            if (response.success) {
                const stats = response.stats;
                const statsHtml = `
                    <div class="col-md-3">
                        <div class="stats-card">
                            <h6>Collections</h6>
                            <div class="stats-number">${stats.totalCollections}</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card">
                            <h6>Quality Tests</h6>
                            <div class="stats-number">${stats.totalQualityTests}</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card">
                            <h6>Products</h6>
                            <div class="stats-number">${stats.totalProducts}</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card">
                            <h6>Species</h6>
                            <div class="stats-number">${stats.speciesCount}</div>
                        </div>
                    </div>
                `;
                document.getElementById('statsCards').innerHTML = statsHtml;
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    loadRoleSpecificContent() {
        console.log('Loading role-specific content for:', this.currentRole);
        const content = document.getElementById('roleContent');
        
        if (!content) {
            console.error('roleContent element not found');
            return;
        }
        
        switch (this.currentRole) {
            case 'admin':
                content.innerHTML = this.getAdminContent();
                console.log('Loaded admin content');
                break;
            case 'collector':
                content.innerHTML = this.getCollectorContent();
                console.log('Loaded collector content');
                break;
            case 'lab':
                content.innerHTML = this.getLabContent();
                console.log('Loaded lab content');
                break;
            case 'manufacturer':
                content.innerHTML = this.getManufacturerContent();
                console.log('Loaded manufacturer content');
                break;
            default:
                content.innerHTML = '<p>No specific content available for this role.</p>';
                console.log('Loaded default content');
        }
        
        // Initialize form handlers after content is loaded
        setTimeout(() => {
            console.log('Initializing form handlers...');
            this.initializeFormHandlers();
        }, 100);
    }

    getAdminContent() {
        return `
            <div class="row">
                <div class="col-md-12">
                    <h4><i class="fas fa-tachometer-alt"></i> Admin Dashboard</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-users"></i> User Management</h5>
                                </div>
                                <div class="card-body">
                                    <button class="btn btn-primary mb-2" onclick="app.loadUsers()">
                                        <i class="fas fa-list"></i> View All Users
                                    </button>
                                    <button class="btn btn-success mb-2" onclick="app.showCreateUserForm()">
                                        <i class="fas fa-user-plus"></i> Create User
                                    </button>
                                    <div id="usersList"></div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-chart-line"></i> Analytics</h5>
                                </div>
                                <div class="card-body">
                                    <button class="btn btn-info mb-2" onclick="app.loadRecentActivity()">
                                        <i class="fas fa-history"></i> Recent Activity
                                    </button>
                                    <button class="btn btn-warning mb-2" onclick="app.loadBlockchainInfo()">
                                        <i class="fas fa-link"></i> Blockchain Info
                                    </button>
                                    <div id="analyticsContent"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row mt-4">
                        <div class="col-md-12">
                            <button class="btn btn-secondary" onclick="app.showAPITesting()">
                                <i class="fas fa-code"></i> API Testing Console
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getCollectorContent() {
        return `
            <div class="row">
                <div class="col-md-12">
                    <h4><i class="fas fa-seedling"></i> Collector Dashboard</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-plus"></i> Create Collection Event</h5>
                                </div>
                                <div class="card-body">
                                    <form id="collectionForm">
                                        <div class="mb-3">
                                            <label class="form-label">Species</label>
                                            <input type="text" class="form-control" id="species" placeholder="e.g., Ashwagandha" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Quantity</label>
                                            <input type="number" class="form-control" id="quantity" step="0.1" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">GPS Latitude</label>
                                            <input type="number" class="form-control" id="latitude" step="0.000001" placeholder="30.3165">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">GPS Longitude</label>
                                            <input type="number" class="form-control" id="longitude" step="0.000001" placeholder="79.5598">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Collection Date</label>
                                            <input type="datetime-local" class="form-control" id="collectionDate" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Quality Notes</label>
                                            <textarea class="form-control" id="qualityNotes" rows="3"></textarea>
                                        </div>
                                        <button type="submit" class="btn btn-primary">
                                            <i class="fas fa-save"></i> Create Collection
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-list"></i> My Collections</h5>
                                </div>
                                <div class="card-body">
                                    <button class="btn btn-info mb-2" onclick="app.loadMyCollections()">
                                        <i class="fas fa-refresh"></i> Refresh
                                    </button>
                                    <div id="collectionsList"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getLabContent() {
        return `
            <div class="row">
                <div class="col-md-12">
                    <h4><i class="fas fa-flask"></i> Laboratory Dashboard</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-vial"></i> Create Quality Test</h5>
                                </div>
                                <div class="card-body">
                                    <form id="qualityTestForm">
                                        <div class="mb-3">
                                            <label class="form-label">Batch ID</label>
                                            <input type="text" class="form-control" id="batchId" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Test Date</label>
                                            <input type="datetime-local" class="form-control" id="testDate" required>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label">Moisture (%)</label>
                                                    <input type="number" class="form-control" id="moisture" step="0.1" min="0" max="100">
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label">Pesticides (ppm)</label>
                                                    <input type="number" class="form-control" id="pesticides" step="0.01" min="0">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label">Heavy Metals (ppm)</label>
                                                    <input type="number" class="form-control" id="heavyMetals" step="0.01" min="0">
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label">DNA Barcode</label>
                                                    <input type="text" class="form-control" id="dnaBarcode">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Test Notes</label>
                                            <textarea class="form-control" id="testNotes" rows="3"></textarea>
                                        </div>
                                        <button type="submit" class="btn btn-primary">
                                            <i class="fas fa-save"></i> Create Test
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-list"></i> My Tests</h5>
                                </div>
                                <div class="card-body">
                                    <button class="btn btn-info mb-2" onclick="app.loadMyTests()">
                                        <i class="fas fa-refresh"></i> Refresh
                                    </button>
                                    <div id="testsList"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getManufacturerContent() {
        return `
            <div class="row">
                <div class="col-md-12">
                    <h4><i class="fas fa-industry"></i> Manufacturer Dashboard</h4>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-box"></i> Create Product Batch</h5>
                                </div>
                                <div class="card-body">
                                    <form id="productBatchForm">
                                        <div class="mb-3">
                                            <label class="form-label">Product Name</label>
                                            <input type="text" class="form-control" id="productName" placeholder="e.g., Ashwagandha Root Powder" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Species</label>
                                            <input type="text" class="form-control" id="species" placeholder="e.g., Ashwagandha" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Quantity</label>
                                            <input type="number" class="form-control" id="quantity" step="0.1" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Estimated Shelf Life</label>
                                            <input type="text" class="form-control" id="shelfLife" placeholder="e.g., 24 months">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Batch Notes</label>
                                            <textarea class="form-control" id="batchNotes" rows="3"></textarea>
                                        </div>
                                        <button type="submit" class="btn btn-primary">
                                            <i class="fas fa-save"></i> Create Batch
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-list"></i> My Batches</h5>
                                </div>
                                <div class="card-body">
                                    <button class="btn btn-info mb-2" onclick="app.loadMyBatches()">
                                        <i class="fas fa-refresh"></i> Refresh
                                    </button>
                                    <div id="batchesList"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async verifyQR() {
        const qrCode = document.getElementById('qrCodeInput').value.trim();
        
        if (!qrCode) {
            this.showAlert('Please enter a QR code', 'warning');
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/api/public/qr/${qrCode}`);
            const data = await response.json();

            if (data.success) {
                this.displayQRResult(data);
            } else {
                this.showAlert(data.error || 'QR code not found', 'danger');
            }
        } catch (error) {
            this.showAlert('Error verifying QR code: ' + error.message, 'danger');
        }
    }

    displayQRResult(data) {
        const resultDiv = document.getElementById('qrResult');
        
        const timelineHtml = data.traceability.timeline.map(event => `
            <div class="timeline-item">
                <h6>${event.type.replace('_', ' ').toUpperCase()}</h6>
                <p class="text-muted">${new Date(event.timestamp).toLocaleString()}</p>
                <p>${event.description}</p>
                ${event.location ? `<small class="text-info">📍 ${event.location}</small>` : ''}
            </div>
        `).join('');

        resultDiv.innerHTML = `
            <div class="card mt-3">
                <div class="card-header">
                    <h5><i class="fas fa-leaf"></i> ${data.product.herbName} - Product Traceability</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Product Details</h6>
                            <p><strong>Species:</strong> ${data.product.speciesCode}</p>
                            <p><strong>Quantity:</strong> ${data.product.quantity}</p>
                            <p><strong>Status:</strong> <span class="badge bg-success">${data.product.status}</span></p>
                        </div>
                        <div class="col-md-6">
                            <h6>Farmer Information</h6>
                            <p><strong>Name:</strong> ${data.traceability.farmer.name}</p>
                            <p><strong>ID:</strong> ${data.traceability.farmer.farmerId}</p>
                            <p><strong>Location:</strong> ${data.traceability.farmer.location.latitude}, ${data.traceability.farmer.location.longitude}</p>
                        </div>
                    </div>
                    
                    ${data.traceability.labTests.length > 0 ? `
                        <div class="mt-3">
                            <h6>Laboratory Tests</h6>
                            ${data.traceability.labTests.map(test => `
                                <div class="alert alert-info">
                                    <strong>${test.testType}</strong> by ${test.labName}<br>
                                    <small>${new Date(test.testDate).toLocaleString()}</small><br>
                                    <strong>Results:</strong> ${JSON.stringify(test.results)}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="mt-3">
                        <h6>Supply Chain Timeline</h6>
                        <div class="timeline">
                            ${timelineHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }


    async createCollection() {
        const formData = {
            species: document.getElementById('species').value,
            collectorId: this.currentUser.username,
            gpsCoordinates: {
                latitude: parseFloat(document.getElementById('latitude').value) || 0,
                longitude: parseFloat(document.getElementById('longitude').value) || 0
            },
            quantity: parseFloat(document.getElementById('quantity').value),
            collectionDate: document.getElementById('collectionDate').value,
            qualityNotes: document.getElementById('qualityNotes').value
        };

        try {
            const response = await this.apiCall('/api/protected/collection-events', 'POST', formData);
            
            if (response.success) {
                this.showAlert('Collection event created successfully!', 'success');
                document.getElementById('collectionForm').reset();
                this.loadMyCollections();
            } else {
                this.showAlert(response.error || 'Failed to create collection', 'danger');
            }
        } catch (error) {
            this.showAlert('Error creating collection: ' + error.message, 'danger');
        }
    }

    async createQualityTest() {
        const formData = {
            batchId: document.getElementById('batchId').value,
            labId: this.currentUser.username,
            testDate: document.getElementById('testDate').value,
            moisture: parseFloat(document.getElementById('moisture').value) || null,
            pesticides: parseFloat(document.getElementById('pesticides').value) || null,
            heavyMetals: parseFloat(document.getElementById('heavyMetals').value) || null,
            dnaBarcode: document.getElementById('dnaBarcode').value,
            notes: document.getElementById('testNotes').value
        };

        try {
            const response = await this.apiCall('/api/protected/quality-tests', 'POST', formData);
            
            if (response.success) {
                this.showAlert('Quality test created successfully!', 'success');
                document.getElementById('qualityTestForm').reset();
                this.loadMyTests();
            } else {
                this.showAlert(response.error || 'Failed to create quality test', 'danger');
            }
        } catch (error) {
            this.showAlert('Error creating quality test: ' + error.message, 'danger');
        }
    }

    async createProductBatch() {
        const formData = {
            productName: document.getElementById('productName').value,
            species: document.getElementById('species').value,
            quantity: parseFloat(document.getElementById('quantity').value),
            manufacturerId: this.currentUser.username,
            estimatedShelfLife: document.getElementById('shelfLife').value,
            batchNotes: document.getElementById('batchNotes').value
        };

        try {
            const response = await this.apiCall('/api/protected/product-batches', 'POST', formData);
            
            if (response.success) {
                this.showAlert('Product batch created successfully!', 'success');
                document.getElementById('productBatchForm').reset();
                this.loadMyBatches();
            } else {
                this.showAlert(response.error || 'Failed to create product batch', 'danger');
            }
        } catch (error) {
            this.showAlert('Error creating product batch: ' + error.message, 'danger');
        }
    }

    // Loading methods
    async loadMyCollections() {
        try {
            const response = await this.apiCall('/api/protected/collection-events');
            
            if (response.success) {
                const collections = response.collectionEvents.filter(c => c.collectorId === this.currentUser.username);
                this.displayCollections(collections);
            }
        } catch (error) {
            this.showAlert('Error loading collections: ' + error.message, 'danger');
        }
    }

    async loadMyTests() {
        try {
            const response = await this.apiCall('/api/protected/quality-tests');
            
            if (response.success) {
                const tests = response.qualityTests.filter(t => t.labId === this.currentUser.username);
                this.displayTests(tests);
            }
        } catch (error) {
            this.showAlert('Error loading tests: ' + error.message, 'danger');
        }
    }

    async loadMyBatches() {
        try {
            // This would need a specific endpoint for user's batches
            // For now, we'll show all batches
            this.showAlert('Loading batches...', 'info');
        } catch (error) {
            this.showAlert('Error loading batches: ' + error.message, 'danger');
        }
    }

    displayCollections(collections) {
        const container = document.getElementById('collectionsList');
        
        if (collections.length === 0) {
            container.innerHTML = '<p class="text-muted">No collections found.</p>';
            return;
        }

        const html = collections.map(collection => `
            <div class="alert alert-light">
                <h6>${collection.species}</h6>
                <p><strong>Quantity:</strong> ${collection.quantity}</p>
                <p><strong>Date:</strong> ${new Date(collection.collectionDate).toLocaleString()}</p>
                <p><strong>Location:</strong> ${collection.gpsCoordinates.latitude}, ${collection.gpsCoordinates.longitude}</p>
                <small class="text-muted">ID: ${collection.id}</small>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    displayTests(tests) {
        const container = document.getElementById('testsList');
        
        if (tests.length === 0) {
            container.innerHTML = '<p class="text-muted">No tests found.</p>';
            return;
        }

        const html = tests.map(test => `
            <div class="alert alert-light">
                <h6>Batch: ${test.batchId}</h6>
                <p><strong>Date:</strong> ${new Date(test.testDate).toLocaleString()}</p>
                ${test.moisture ? `<p><strong>Moisture:</strong> ${test.moisture}%</p>` : ''}
                ${test.pesticides ? `<p><strong>Pesticides:</strong> ${test.pesticides} ppm</p>` : ''}
                <small class="text-muted">ID: ${test.id}</small>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // API utility methods
    async apiCall(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (this.currentToken) {
            options.headers['Authorization'] = `Bearer ${this.currentToken}`;
        }

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${this.apiBase}${endpoint}`, options);
        return await response.json();
    }

    hasPermission(permission) {
        return this.currentUser && this.currentUser.permissions && 
               this.currentUser.permissions.includes(permission);
    }

    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        const alertId = 'alert-' + Date.now();
        
        const alertHtml = `
            <div id="${alertId}" class="alert alert-${type} alert-custom alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        alertContainer.insertAdjacentHTML('beforeend', alertHtml);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                alertElement.remove();
            }
        }, 5000);
    }

    // Admin methods
    async loadUsers() {
        try {
            const response = await this.apiCall('/api/protected/users');
            
            if (response.success) {
                const html = response.users.map(user => `
                    <div class="alert alert-light">
                        <h6>${user.fullName}</h6>
                        <p><strong>Username:</strong> ${user.username}</p>
                        <p><strong>Role:</strong> ${user.role}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <small class="text-muted">Created: ${new Date(user.createdAt).toLocaleDateString()}</small>
                    </div>
                `).join('');
                
                document.getElementById('usersList').innerHTML = html;
            }
        } catch (error) {
            this.showAlert('Error loading users: ' + error.message, 'danger');
        }
    }

    async loadRecentActivity() {
        try {
            const response = await this.apiCall('/api/protected/analytics/recent-activity');
            
            if (response.success) {
                const html = response.activities.slice(0, 10).map(activity => `
                    <div class="alert alert-light">
                        <h6>${activity.description}</h6>
                        <small class="text-muted">${new Date(activity.timestamp).toLocaleString()}</small>
                    </div>
                `).join('');
                
                document.getElementById('analyticsContent').innerHTML = html;
            }
        } catch (error) {
            this.showAlert('Error loading recent activity: ' + error.message, 'danger');
        }
    }

    async loadBlockchainInfo() {
        try {
            const response = await this.apiCall('/api/protected/blockchain-info');
            
            if (response.success) {
                const html = `
                    <div class="alert alert-info">
                        <h6>Blockchain Network Status</h6>
                        <p><strong>Chain Length:</strong> ${response.chainLength}</p>
                        <p><strong>Network Status:</strong> ${response.networkStatus}</p>
                        <p><strong>Peer Count:</strong> ${response.peerCount}</p>
                        <p><strong>Latest Block:</strong> ${response.latestBlock.hash}</p>
                    </div>
                `;
                
                document.getElementById('analyticsContent').innerHTML = html;
            }
        } catch (error) {
            this.showAlert('Error loading blockchain info: ' + error.message, 'danger');
        }
    }

    showAPITesting() {
        this.hideAllSections();
        document.getElementById('apiTestingSection').classList.remove('hidden');
        this.loadAPITestingInterface();
    }

    loadAPITestingInterface() {
        const endpoints = [
            { name: 'Health Check', method: 'GET', endpoint: '/health', auth: false },
            { name: 'Get All Collections', method: 'GET', endpoint: '/api/protected/collection-events', auth: true },
            { name: 'Get All Quality Tests', method: 'GET', endpoint: '/api/protected/quality-tests', auth: true },
            { name: 'Get All Products', method: 'GET', endpoint: '/api/protected/product-batches', auth: true },
            { name: 'Dashboard Stats', method: 'GET', endpoint: '/api/protected/analytics/dashboard-stats', auth: true },
            { name: 'Recent Activity', method: 'GET', endpoint: '/api/protected/analytics/recent-activity', auth: true },
            { name: 'Blockchain Info', method: 'GET', endpoint: '/api/protected/blockchain-info', auth: true },
            { name: 'Get All Users', method: 'GET', endpoint: '/api/protected/users', auth: true }
        ];

        const html = endpoints.map(ep => `
            <div class="api-endpoint">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${ep.method}</strong> ${ep.endpoint}
                        <br><small class="text-muted">${ep.name}</small>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="app.testEndpoint('${ep.method}', '${ep.endpoint}', ${ep.auth})">
                        Test
                    </button>
                </div>
            </div>
        `).join('');

        document.getElementById('endpointsList').innerHTML = html;
    }

    async testEndpoint(method, endpoint, requiresAuth) {
        if (requiresAuth && !this.currentToken) {
            this.showAlert('Authentication required for this endpoint', 'warning');
            return;
        }

        try {
            const response = await this.apiCall(endpoint, method);
            
            const responseHtml = `
                <div class="mb-2">
                    <span class="badge bg-success">${method}</span>
                    <span class="badge bg-info">${endpoint}</span>
                    <span class="badge bg-success">${response.success ? 'Success' : 'Error'}</span>
                </div>
                <pre>${JSON.stringify(response, null, 2)}</pre>
            `;
            
            document.getElementById('apiResponse').innerHTML = responseHtml;
        } catch (error) {
            const responseHtml = `
                <div class="mb-2">
                    <span class="badge bg-success">${method}</span>
                    <span class="badge bg-info">${endpoint}</span>
                    <span class="badge bg-danger">Error</span>
                </div>
                <pre>${JSON.stringify({ error: error.message }, null, 2)}</pre>
            `;
            
            document.getElementById('apiResponse').innerHTML = responseHtml;
        }
    }

    // Initialize form handlers after content is loaded
    initializeFormHandlers() {
        console.log('Setting up form handlers...');
        
        // Collection form
        const collectionForm = document.getElementById('collectionForm');
        if (collectionForm) {
            console.log('Found collection form, adding event listener');
            collectionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createCollection();
            });
        } else {
            console.log('Collection form not found');
        }

        // Quality test form
        const qualityTestForm = document.getElementById('qualityTestForm');
        if (qualityTestForm) {
            console.log('Found quality test form, adding event listener');
            qualityTestForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createQualityTest();
            });
        } else {
            console.log('Quality test form not found');
        }

        // Product batch form
        const productBatchForm = document.getElementById('productBatchForm');
        if (productBatchForm) {
            console.log('Found product batch form, adding event listener');
            productBatchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createProductBatch();
            });
        } else {
            console.log('Product batch form not found');
        }
        
        console.log('Form handlers setup complete');
    }
}

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    try {
        app = new AyurvedicApp();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

// Global functions for HTML onclick handlers
function selectRole(role) {
    console.log('Global selectRole called with:', role);
    if (app && app.selectRole) {
        app.selectRole(role);
    } else {
        console.error('App not initialized or selectRole method not available');
    }
}

function logout() {
    app.logout();
}

function showRegister() {
    app.showRegister();
}

function showLogin() {
    app.showLogin();
}

function showQRScanner() {
    app.showQRScanner();
}

function verifyQR() {
    app.verifyQR();
}
