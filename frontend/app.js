// Herb Abhilekh Blockchain Frontend Application
class HerbAbhilekhApp {
    constructor() {
        this.apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://unenlightening-lisha-unsurveyable.ngrok-free.app';
        this.currentUser = null;
        this.currentToken = null;
        this.currentRole = null;
        
        // Load saved authentication state on initialization
        this.loadAuthState();
        this.initializeEventListeners();
        this.checkHealth();
        
        // Check if user is already logged in and show appropriate section
        if (this.currentToken && this.currentUser) {
            this.validateTokenAndShowDashboard();
        }
        
        // Set up periodic token validation (every 30 minutes)
        this.setupTokenRefresh();
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

    // Authentication state persistence methods
    saveAuthState() {
        try {
            const authState = {
                user: this.currentUser,
                token: this.currentToken,
                role: this.currentRole,
                timestamp: Date.now()
            };
            localStorage.setItem('herbAbhilekhAuth', JSON.stringify(authState));
        } catch (error) {
            console.error('Failed to save auth state:', error);
        }
    }

    loadAuthState() {
        try {
            const authStateStr = localStorage.getItem('herbAbhilekhAuth');
            if (!authStateStr) return;

            const authState = JSON.parse(authStateStr);
            
            // Check if the stored auth is not too old (24 hours)
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            if (Date.now() - authState.timestamp > maxAge) {
                this.clearAuthState();
                return;
            }

            this.currentUser = authState.user;
            this.currentToken = authState.token;
            this.currentRole = authState.role;

            // Update UI to reflect logged-in state
            if (this.currentUser) {
                document.getElementById('currentUser').textContent = this.currentUser.username;
            }
        } catch (error) {
            console.error('Failed to load auth state:', error);
            this.clearAuthState();
        }
    }

    clearAuthState() {
        try {
            localStorage.removeItem('herbAbhilekhAuth');
        } catch (error) {
            console.error('Failed to clear auth state:', error);
        }
        this.currentUser = null;
        this.currentToken = null;
        this.currentRole = null;
        
        // Clear token refresh interval if it exists
        if (this.tokenRefreshInterval) {
            clearInterval(this.tokenRefreshInterval);
            this.tokenRefreshInterval = null;
        }
    }

    setupTokenRefresh() {
        // Clear any existing interval
        if (this.tokenRefreshInterval) {
            clearInterval(this.tokenRefreshInterval);
        }
        
        // Set up token validation every 30 minutes
        this.tokenRefreshInterval = setInterval(() => {
            if (this.currentToken) {
                this.validateToken();
            }
        }, 30 * 60 * 1000); // 30 minutes
    }

    async validateToken() {
        if (!this.currentToken) return;
        
        try {
            const response = await fetch(`${this.apiBase}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.currentToken}`
                }
            });

            if (!response.ok || response.status === 401 || response.status === 403) {
                // Token is invalid, clear auth state
                this.clearAuthState();
                document.getElementById('currentUser').textContent = 'Guest';
                this.hideAllSections();
                document.getElementById('welcomeSection').classList.remove('hidden');
                this.showAlert('Your session has expired. Please login again.', 'warning');
            }
        } catch (error) {
            console.error('Token validation error:', error);
        }
    }

    async validateTokenAndShowDashboard() {
        try {
            // Try to make an authenticated request to validate the token
            const response = await fetch(`${this.apiBase}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.currentToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Token is valid, update user info and show dashboard
                    this.currentUser = data.user;
                    this.currentRole = data.user.role;
                    this.saveAuthState(); // Update stored auth state
                    this.showDashboard();
                    return;
                }
            }
            
            // Token is invalid, clear auth state and show welcome
            this.clearAuthState();
            document.getElementById('currentUser').textContent = 'Guest';
            this.showAlert('Your session has expired. Please login again.', 'warning');
        } catch (error) {
            // Error validating token, clear auth state
            this.clearAuthState();
            document.getElementById('currentUser').textContent = 'Guest';
            console.error('Token validation error:', error);
        }
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
                
                // Save authentication state to localStorage
                this.saveAuthState();
                
                // Start token refresh monitoring
                this.setupTokenRefresh();
                
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
        // Debug: Check if form fields exist
        const usernameField = document.getElementById('regUsername');
        const emailField = document.getElementById('regEmail');
        const passwordField = document.getElementById('regPassword');
        const fullNameField = document.getElementById('regFullName');
        const orgTypeField = document.getElementById('regOrgType');
        
        console.log('Form fields check:', {
            username: usernameField ? usernameField.value : 'FIELD NOT FOUND',
            email: emailField ? emailField.value : 'FIELD NOT FOUND',
            password: passwordField ? passwordField.value : 'FIELD NOT FOUND',
            fullName: fullNameField ? fullNameField.value : 'FIELD NOT FOUND',
            orgType: orgTypeField ? orgTypeField.value : 'FIELD NOT FOUND'
        });
        
        const formData = {
            username: usernameField ? usernameField.value : '',
            email: emailField ? emailField.value : '',
            password: passwordField ? passwordField.value : '',
            fullName: fullNameField ? fullNameField.value : '',
            organizationType: orgTypeField ? orgTypeField.value : ''
        };

        // Debug: Log the form data
        console.log('Registration form data:', formData);
        
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
                console.error('Registration error details:', data);
                let errorMessage = data.error || 'Registration failed';
                if (data.details && Array.isArray(data.details)) {
                    errorMessage += '\nDetails: ' + data.details.map(d => d.msg).join(', ');
                }
                this.showAlert(errorMessage, 'danger');
            }
        } catch (error) {
            this.showAlert('Registration error: ' + error.message, 'danger');
        }
    }

    logout() {
        // Clear authentication state from localStorage
        this.clearAuthState();
        
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
                                    <button class="btn btn-info mb-2 me-2" onclick="app.loadBlockchainInfo()">
                                        <i class="fas fa-link"></i> Blockchain Info
                                    </button>
                                    <button class="btn btn-secondary mb-2" onclick="app.loadRecentActivity()">
                                        <i class="fas fa-history"></i> Recent Activity
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
                                        <div class="mb-3">
                                            <label class="form-label">Herb Image</label>
                                            <input type="file" class="form-control" id="herbImage" accept="image/*">
                                            <div class="form-text">Upload an image of the collected herbs (optional)</div>
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
                                            <label class="form-label">QR Code</label>
                                            <input type="text" class="form-control" id="qrCode" placeholder="Enter QR code of the collection" required>
                                            <div class="form-text">Scan or enter the QR code from the herb collection</div>
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
                                                    <label class="form-label">Pesticides</label>
                                                    <input type="text" class="form-control" id="pesticides" placeholder="e.g., Not Detected, 0.5 ppm">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label">Heavy Metals</label>
                                                    <input type="text" class="form-control" id="heavyMetals" placeholder="e.g., Within Limits, Below Detection">
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label">DNA Barcode</label>
                                                    <input type="text" class="form-control" id="dnaBarcode">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label">Microbiological</label>
                                                    <input type="text" class="form-control" id="microbiological" placeholder="e.g., Pass, Fail">
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="mb-3">
                                                    <label class="form-label">Overall Result</label>
                                                    <select class="form-control" id="overallResult" required>
                                                        <option value="">Select Result</option>
                                                        <option value="approved">Approved</option>
                                                        <option value="rejected">Rejected</option>
                                                        <option value="pending">Pending</option>
                                                    </select>
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
        
        // Handle the actual API response structure
        if (!data.data) {
            resultDiv.innerHTML = `
                <div class="alert alert-warning">
                    <h6><i class="fas fa-exclamation-triangle"></i> Invalid QR Response</h6>
                    <p>The QR code response doesn't contain the expected data structure.</p>
                </div>
            `;
            return;
        }

        const herbData = data.data;
        const collection = herbData.collection || {};
        const supplyChainSteps = herbData.supplyChainSteps || [];
        const qualityTests = herbData.qualityTests || [];

        // Build timeline from supply chain steps
        const timelineHtml = supplyChainSteps.map(step => `
            <div class="timeline-item">
                <h6>${(step.step || 'Unknown Step').replace('_', ' ').toUpperCase()}</h6>
                <p class="text-muted">${step.timestamp ? new Date(step.timestamp).toLocaleString() : 'No timestamp'}</p>
                <p><strong>Actor:</strong> ${step.actorName || step.actor || 'Unknown'} (${step.role || 'Unknown role'})</p>
                ${step.data ? `<p><strong>Details:</strong> ${JSON.stringify(step.data, null, 2)}</p>` : ''}
            </div>
        `).join('') || '<p class="text-muted">No supply chain steps recorded.</p>';

        // Handle location display safely
        let locationText = 'Location not provided';
        if (collection.location) {
            if (collection.location.latitude !== undefined && collection.location.longitude !== undefined) {
                locationText = `${collection.location.latitude}, ${collection.location.longitude}`;
            }
        }

        resultDiv.innerHTML = `
            <div class="card mt-3">
                <div class="card-header">
                    <h5><i class="fas fa-leaf"></i> ${collection.species || 'Unknown Species'} - Herb Traceability</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Collection Details</h6>
                            <p><strong>QR Code:</strong> ${herbData.qrCode || 'N/A'}</p>
                            ${collection.qrCodeImage ? `
                                <p><strong>QR Image:</strong><br>
                                    <img src="${this.apiBase}${collection.qrCodeImage}" alt="QR Code" style="max-width: 150px; border: 1px solid #ddd; border-radius: 5px; padding: 5px;">
                                </p>
                            ` : ''}
                            <p><strong>Species:</strong> ${collection.species || 'Unknown'}</p>
                            <p><strong>Quantity:</strong> ${collection.quantity || 'N/A'}</p>
                            <p><strong>Status:</strong> <span class="badge bg-success">${herbData.status || 'Unknown'}</span></p>
                            <p><strong>Collection Date:</strong> ${collection.collectionDate ? new Date(collection.collectionDate).toLocaleString() : 'N/A'}</p>
                        </div>
                        <div class="col-md-6">
                            <h6>Collector Information</h6>
                            <p><strong>Name:</strong> ${collection.collectorName || 'Unknown'}</p>
                            <p><strong>ID:</strong> ${collection.id || 'N/A'}</p>
                            <p><strong>Location:</strong> ${locationText}</p>
                            ${collection.qualityNotes ? `<p><strong>Notes:</strong> ${collection.qualityNotes}</p>` : ''}
                            ${collection.herbImage ? `<p><strong>Image:</strong> <img src="${collection.herbImage}" alt="Herb" style="max-width: 100px; border-radius: 5px;"></p>` : ''}
                        </div>
                    </div>
                    
                    ${qualityTests.length > 0 ? `
                        <div class="mt-3">
                            <h6>Quality Tests</h6>
                            ${qualityTests.map(test => `
                                <div class="alert alert-info">
                                    <strong>Test ID:</strong> ${test.id || 'N/A'}<br>
                                    <strong>Lab:</strong> ${test.labId || 'Unknown'}<br>
                                    <strong>Date:</strong> ${test.testDate ? new Date(test.testDate).toLocaleString() : 'N/A'}<br>
                                    ${test.moisture ? `<strong>Moisture:</strong> ${test.moisture}%<br>` : ''}
                                    ${test.dnaBarcode ? `<strong>DNA Barcode:</strong> ${test.dnaBarcode}<br>` : ''}
                                    ${test.pesticides ? `<strong>Pesticides:</strong> ${test.pesticides}<br>` : ''}
                                    ${test.heavyMetals ? `<strong>Heavy Metals:</strong> ${test.heavyMetals}<br>` : ''}
                                    ${test.microbiological ? `<strong>Microbiological:</strong> ${test.microbiological}<br>` : ''}
                                    ${test.overallResult ? `<strong>Overall Result:</strong> <span class="badge ${test.overallResult === 'approved' ? 'bg-success' : test.overallResult === 'rejected' ? 'bg-danger' : 'bg-warning'}">${test.overallResult.toUpperCase()}</span><br>` : ''}
                                    ${test.notes ? `<strong>Notes:</strong> ${test.notes}` : ''}
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
                    
                    <div class="mt-3">
                        <small class="text-muted">
                            <i class="fas fa-clock"></i> Verified at: ${herbData.verifiedAt ? new Date(herbData.verifiedAt).toLocaleString() : 'Unknown'}
                            ${herbData.lastUpdated ? ` | Last updated: ${new Date(herbData.lastUpdated).toLocaleString()}` : ''}
                        </small>
                    </div>
                </div>
            </div>
        `;
    }


    async createCollection() {
        // Build FHIR Procedure + Observation payload
        const species = document.getElementById('species').value;
        const latitude = parseFloat(document.getElementById('latitude').value) || 0;
        const longitude = parseFloat(document.getElementById('longitude').value) || 0;
        const quantity = parseFloat(document.getElementById('quantity').value);
        const unitEl = document.getElementById('unit');
        const unit = unitEl ? unitEl.value : 'kg';

        const procedure = {
            resourceType: 'CollectionEvent',
            status: 'completed',
            code: { text: species || 'Herb Collection' },
            subject: { reference: `RelatedPerson/${this.currentUser.username}` },
            performedDateTime: new Date().toISOString(),
            extension: [
                { url: 'urn:ayurveda:speciesCode', valueString: species },
                { url: 'urn:geo:gpsLatitude', valueDecimal: latitude },
                { url: 'urn:geo:gpsLongitude', valueDecimal: longitude }
            ]
        };

        const observation = {
            resourceType: 'Observation',
            status: 'final',
            code: { text: 'Harvest Quantity' },
            subject: { reference: `RelatedPerson/${this.currentUser.username}` },
            effectiveDateTime: new Date().toISOString(),
            valueQuantity: {
                value: quantity,
                unit: unit,
                system: 'http://unitsofmeasure.org',
                code: unit
            }
        };

        try {
            const response = await fetch(`${this.apiBase}/api/protected/collection-events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentToken}`
                },
                body: JSON.stringify({ procedure, observation, userId: this.currentUser.username })
            });
            const result = await response.json();
            if (result.success) {
                this.showAlert(`Collection created successfully`, 'success');
                document.getElementById('collectionForm').reset();
                this.loadMyCollections();
            } else {
                this.showAlert(result.error || 'Failed to create collection', 'danger');
            }
        } catch (error) {
            this.showAlert('Error creating collection: ' + error.message, 'danger');
        }
    }

    async createQualityTest() {
        const subjectId = document.getElementById('qrCode').value;
        const testDate = document.getElementById('testDate').value;
        const performer = this.currentUser.username;
        const observations = [];
        const moisture = document.getElementById('moisture').value;
        if (moisture && !isNaN(parseFloat(moisture))) {
            observations.push({
                resourceType: 'Observation',
                status: 'final',
                code: { text: 'Moisture' },
                effectiveDateTime: testDate || new Date().toISOString(),
                valueQuantity: { value: parseFloat(moisture), unit: '%', system: 'http://unitsofmeasure.org', code: '%' }
            });
        }

        const diagnosticReport = {
            resourceType: 'DiagnosticReport',
            status: 'final',
            code: { text: 'Ayurveda Quality Panel' },
            subject: subjectId ? { reference: `CollectionEvent/${subjectId}` } : undefined,
            effectiveDateTime: testDate || new Date().toISOString(),
            performer: [{ display: performer }],
            conclusionCode: [{ code: (document.getElementById('overallResult').value || '').toLowerCase() === 'pass' ? 'pass' : 'fail' }]
        };

        try {
            const response = await fetch(`${this.apiBase}/api/protected/quality-tests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentToken}`
                },
                body: JSON.stringify({ diagnosticReport, observations, userId: this.currentUser.username })
            });
            const result = await response.json();
            if (result.success) {
                this.showAlert('Quality test created successfully!', 'success');
                document.getElementById('qualityTestForm').reset();
                this.loadMyTests();
            } else {
                this.showAlert(result.error || 'Failed to create quality test', 'danger');
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

        const html = collections.map(collection => {
            // Handle missing or undefined GPS coordinates
            let locationText = 'Location not provided';
            if (collection.gpsCoordinates && 
                collection.gpsCoordinates.latitude !== undefined && 
                collection.gpsCoordinates.longitude !== undefined) {
                locationText = `${collection.gpsCoordinates.latitude}, ${collection.gpsCoordinates.longitude}`;
            } else if (collection.location && 
                       collection.location.latitude !== undefined && 
                       collection.location.longitude !== undefined) {
                locationText = `${collection.location.latitude}, ${collection.location.longitude}`;
            }

            return `
                <div class="alert alert-light">
                    <h6>${collection.species || 'Unknown Species'}</h6>
                    <p><strong>Quantity:</strong> ${collection.quantity || 'N/A'}</p>
                    <p><strong>Date:</strong> ${collection.collectionDate ? new Date(collection.collectionDate).toLocaleString() : 'N/A'}</p>
                    <p><strong>Location:</strong> ${locationText}</p>
                    ${collection.qrCode ? `
                        <p><strong>QR Code:</strong> ${collection.qrCode}</p>
                        ${collection.qrCodeImage ? `
                            <p><strong>QR Image:</strong><br>
                                <img src="${this.apiBase}${collection.qrCodeImage}" alt="QR Code" style="max-width: 150px; border: 1px solid #ddd; border-radius: 5px; padding: 5px;">
                                <br><small class="text-muted">
                                    <a href="${this.apiBase}${collection.qrCodeImage}" target="_blank" class="btn btn-sm btn-outline-primary mt-1">
                                        <i class="fas fa-download"></i> Download QR
                                    </a>
                                </small>
                            </p>
                        ` : '<p><small class="text-muted">QR code image not available</small></p>'}
                    ` : ''}
                    ${collection.status ? `<p><strong>Status:</strong> <span class="badge bg-success">${collection.status}</span></p>` : ''}
                    ${collection.qualityNotes ? `<p><strong>Notes:</strong> ${collection.qualityNotes}</p>` : ''}
                    <small class="text-muted">ID: ${collection.id}</small>
                </div>
            `;
        }).join('');

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
        
        // Check if the response indicates token expiration
        if (response.status === 401 || response.status === 403) {
            const errorData = await response.json();
            if (errorData.error && (errorData.error.includes('expired') || errorData.error.includes('invalid'))) {
                // Token has expired or is invalid
                this.clearAuthState();
                document.getElementById('currentUser').textContent = 'Guest';
                this.hideAllSections();
                document.getElementById('welcomeSection').classList.remove('hidden');
                this.showAlert('Your session has expired. Please login again.', 'warning');
                throw new Error('Authentication expired');
            }
        }
        
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

    async loadBlockchainInfo() {
        try {
            const response = await this.apiCall('/api/protected/blockchain-info');
            
            if (response.success) {
                const html = `
                    <div class="alert alert-info">
                        <h6><i class="fas fa-cube"></i> Blockchain Network Status</h6>
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Network Status:</strong> <span class="badge bg-success">${response.networkStatus}</span></p>
                                <p><strong>Chain Length:</strong> ${response.chainLength} blocks</p>
                                <p><strong>Peer Count:</strong> ${response.peerCount}</p>
                                <p><strong>Channel:</strong> ${response.channelName}</p>
                                <p><strong>Chaincode:</strong> ${response.chaincodeName}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Latest Block Hash:</strong><br><code>${response.latestBlock.hash}</code></p>
                                <p><strong>Block Number:</strong> ${response.latestBlock.number}</p>
                                <p><strong>Block Time:</strong> ${new Date(response.latestBlock.timestamp).toLocaleString()}</p>
                                <p><strong>QR Code:</strong> ${response.latestBlock.qrCode}</p>
                                <p><strong>Steps in Block:</strong> ${response.latestBlock.steps}</p>
                            </div>
                        </div>
                        <hr>
                        <h6><i class="fas fa-chart-bar"></i> Blockchain Statistics</h6>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h4 class="text-primary">${response.statistics.totalBlocks}</h4>
                                    <small>QR Code Blocks</small>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h4 class="text-success">${response.statistics.totalCollections}</h4>
                                    <small>Collections</small>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h4 class="text-info">${response.statistics.totalQualityTests}</h4>
                                    <small>Quality Tests</small>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h4 class="text-warning">${response.statistics.totalSteps}</h4>
                                    <small>Total Steps</small>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <h6><i class="fas fa-cubes"></i> QR Code Blocks (One Block per QR)</h6>
                        <div class="blocks-history" style="max-height: 500px; overflow-y: auto;">
                            ${response.blocks && response.blocks.length > 0 ? 
                                response.blocks.slice(0, 8).map(block => `
                                    <div class="card mb-3" style="border: 2px solid #007bff;">
                                        <div class="card-header bg-light">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 class="mb-0">
                                                        <i class="fas fa-qrcode"></i> ${block.qrCode}
                                                        <span class="badge bg-info ms-2">${block.species}</span>
                                                    </h6>
                                                    <small class="text-muted">Block: ${block.blockHash.substring(0, 12)}...</small>
                                                </div>
                                                <div class="text-end">
                                                    <span class="badge ${block.currentStatus === 'approved' ? 'bg-success' : block.currentStatus === 'rejected' ? 'bg-danger' : block.currentStatus === 'tested' ? 'bg-info' : 'bg-secondary'}">${block.currentStatus}</span>
                                                    <br><small class="text-muted">${block.totalSteps} step${block.totalSteps > 1 ? 's' : ''}</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="card-body p-2">
                                            <div class="supply-chain-timeline">
                                                ${block.steps.map((step, index) => `
                                                    <div class="timeline-step d-flex align-items-center mb-2 ${index === block.steps.length - 1 ? '' : 'border-bottom pb-2'}">
                                                        <div class="step-icon me-3">
                                                            <div class="rounded-circle d-flex align-items-center justify-content-center" 
                                                                 style="width: 35px; height: 35px; background-color: ${step.type === 'collection_event' ? '#007bff' : '#28a745'}; color: white;">
                                                                <i class="fas ${step.type === 'collection_event' ? 'fa-leaf' : 'fa-vial'} fa-sm"></i>
                                                            </div>
                                                        </div>
                                                        <div class="flex-grow-1">
                                                            <h6 class="mb-1">${step.stepNumber}. ${step.type === 'collection_event' ? 'Collection' : 'Quality Testing'}</h6>
                                                            <p class="mb-1 small">
                                                                <strong>${step.actor}</strong> (${step.role})
                                                                ${step.type === 'collection_event' ? 
                                                                    `- Collected ${block.quantity}kg of ${block.species}` :
                                                                    `- Result: ${step.data.overallResult}, Moisture: ${step.data.moisture}%`
                                                                }
                                                            </p>
                                                            <small class="text-muted"><i class="fas fa-clock"></i> ${new Date(step.timestamp).toLocaleString()}</small>
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                `).join('') : 
                                '<p class="text-muted">No blocks found</p>'
                            }
                            ${response.blocks && response.blocks.length > 8 ? 
                                `<p class="text-center text-muted mt-2">... and ${response.blocks.length - 8} more blocks</p>` : ''
                            }
                        </div>
                    </div>
                `;
                
                document.getElementById('analyticsContent').innerHTML = html;
            }
        } catch (error) {
            this.showAlert('Error loading blockchain info: ' + error.message, 'danger');
        }
    }

    showCreateUserForm() {
        const html = `
            <div class="card mt-3">
                <div class="card-header">
                    <h6><i class="fas fa-user-plus"></i> Create New User</h6>
                </div>
                <div class="card-body">
                    <form id="createUserForm">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Username</label>
                                    <input type="text" class="form-control" id="newUsername" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" id="newEmail" required>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Full Name</label>
                                    <input type="text" class="form-control" id="newFullName" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">Password</label>
                                    <input type="password" class="form-control" id="newPassword" required minlength="6">
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Organization Type</label>
                            <select class="form-control" id="newOrgType" required>
                                <option value="">Select Role</option>
                                <option value="collector">Farmer/Collector</option>
                                <option value="lab">Laboratory</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>
                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-save"></i> Create User
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.card').remove()">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Insert form after the users list
        const usersList = document.getElementById('usersList');
        usersList.insertAdjacentHTML('afterend', html);
        
        // Add form event listener
        document.getElementById('createUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createUser();
        });
    }

    async createUser() {
        const formData = {
            username: document.getElementById('newUsername').value,
            email: document.getElementById('newEmail').value,
            fullName: document.getElementById('newFullName').value,
            password: document.getElementById('newPassword').value,
            organizationType: document.getElementById('newOrgType').value
        };
        
        try {
            const response = await this.apiCall('/api/protected/users', 'POST', formData);
            
            if (response.success) {
                this.showAlert('User created successfully!', 'success');
                document.getElementById('createUserForm').closest('.card').remove();
                this.loadUsers(); // Refresh users list
            } else {
                this.showAlert(response.error || 'Failed to create user', 'danger');
            }
        } catch (error) {
            this.showAlert('Error creating user: ' + error.message, 'danger');
        }
    }

    async loadRecentActivity() {
        try {
            const response = await this.apiCall('/api/protected/analytics/recent-activity');
            
            if (response.success) {
                const html = response.activities.slice(0, 10).map(activity => `
                    <div class="alert alert-light">
                        <h6><i class="fas ${activity.type === 'Collection Event' ? 'fa-leaf' : 'fa-vial'}"></i> ${activity.type}</h6>
                        <p>${activity.description}</p>
                        <small class="text-muted">
                            <i class="fas fa-clock"></i> ${new Date(activity.timestamp).toLocaleString()}
                            ${activity.qrCode ? `| QR: ${activity.qrCode}` : ''}
                        </small>
                    </div>
                `).join('');
                
                document.getElementById('analyticsContent').innerHTML = html;
            }
        } catch (error) {
            this.showAlert('Error loading recent activity: ' + error.message, 'danger');
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
            { name: 'Get My Collections', method: 'GET', endpoint: '/api/protected/collections/my-collections', auth: true },
            { name: 'Get All Users', method: 'GET', endpoint: '/api/protected/users', auth: true },
            { name: 'Recent Activity', method: 'GET', endpoint: '/api/protected/analytics/recent-activity', auth: true },
            { name: 'Blockchain Info', method: 'GET', endpoint: '/api/protected/blockchain-info', auth: true },
            { name: 'Verify QR Code (Public)', method: 'GET', endpoint: '/api/public/qr/HERB_SAMPLE123', auth: false }
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
        app = new HerbAbhilekhApp();
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
