class RoleBasedAccessControl {
    constructor() {
        this.roles = this.initializeRoles();
        this.permissions = this.initializePermissions();
        this.userRoles = new Map(); // userId -> roleId
    }

    initializeRoles() {
        return {
            'SUPER_ADMIN': {
                id: 'SUPER_ADMIN',
                name: 'Super Administrator',
                description: 'Full system access',
                level: 100
            },
            'REGULATOR': {
                id: 'REGULATOR',
                name: 'Regulatory Authority',
                description: 'Compliance oversight and auditing',
                level: 90
            },
            'LAB_MANAGER': {
                id: 'LAB_MANAGER',
                name: 'Laboratory Manager',
                description: 'Quality testing management',
                level: 80
            },
            'MANUFACTURER': {
                id: 'MANUFACTURER',
                name: 'Manufacturer',
                description: 'Product creation and batch management',
                level: 70
            },
            'PROCESSOR': {
                id: 'PROCESSOR',
                name: 'Processor',
                description: 'Processing operations',
                level: 60
            },
            'LAB_TECHNICIAN': {
                id: 'LAB_TECHNICIAN',
                name: 'Lab Technician',
                description: 'Quality testing execution',
                level: 50
            },
            'FARMER_COOP_MANAGER': {
                id: 'FARMER_COOP_MANAGER',
                name: 'Farmer Cooperative Manager',
                description: 'Farmer group management',
                level: 40
            },
            'WILD_COLLECTOR_SUPERVISOR': {
                id: 'WILD_COLLECTOR_SUPERVISOR',
                name: 'Wild Collection Supervisor',
                description: 'Wild collection oversight',
                level: 35
            },
            'FARMER': {
                id: 'FARMER',
                name: 'Farmer',
                description: 'Cultivation and harvesting',
                level: 30
            },
            'WILD_COLLECTOR': {
                id: 'WILD_COLLECTOR',
                name: 'Wild Collector',
                description: 'Wild herb collection',
                level: 30
            },
            'AUDITOR': {
                id: 'AUDITOR',
                name: 'Auditor',
                description: 'Read-only access for auditing',
                level: 20
            },
            'CONSUMER': {
                id: 'CONSUMER',
                name: 'Consumer',
                description: 'Product verification only',
                level: 10
            }
        };
    }

    initializePermissions() {
        return {
            // Collection Management
            'CREATE_COLLECTION_EVENT': {
                allowedRoles: ['FARMER', 'WILD_COLLECTOR', 'FARMER_COOP_MANAGER', 'WILD_COLLECTOR_SUPERVISOR', 'SUPER_ADMIN'],
                description: 'Record new collection events'
            },
            'VIEW_COLLECTION_EVENTS': {
                allowedRoles: ['FARMER', 'WILD_COLLECTOR', 'FARMER_COOP_MANAGER', 'WILD_COLLECTOR_SUPERVISOR', 
                             'PROCESSOR', 'MANUFACTURER', 'LAB_MANAGER', 'LAB_TECHNICIAN', 'REGULATOR', 'AUDITOR', 'SUPER_ADMIN'],
                description: 'View collection event data'
            },
            'UPDATE_COLLECTION_EVENT': {
                allowedRoles: ['FARMER_COOP_MANAGER', 'WILD_COLLECTOR_SUPERVISOR', 'REGULATOR', 'SUPER_ADMIN'],
                description: 'Modify collection event data'
            },

            // Quality Testing
            'CREATE_QUALITY_TEST': {
                allowedRoles: ['LAB_TECHNICIAN', 'LAB_MANAGER', 'SUPER_ADMIN'],
                description: 'Record quality test results'
            },
            'VIEW_QUALITY_TESTS': {
                allowedRoles: ['LAB_TECHNICIAN', 'LAB_MANAGER', 'PROCESSOR', 'MANUFACTURER', 'REGULATOR', 'AUDITOR', 'SUPER_ADMIN'],
                description: 'View quality test results'
            },
            'APPROVE_QUALITY_TEST': {
                allowedRoles: ['LAB_MANAGER'],
                description: 'Approve and finalize quality test results'
            },

            // Processing
            'CREATE_PROCESSING_STEP': {
                allowedRoles: ['PROCESSOR', 'SUPER_ADMIN'],
                description: 'Record processing operations'
            },
            'VIEW_PROCESSING_STEPS': {
                allowedRoles: ['PROCESSOR', 'MANUFACTURER', 'LAB_MANAGER', 'REGULATOR', 'AUDITOR', 'SUPER_ADMIN'],
                description: 'View processing step data'
            },

            // Batch Management
            'CREATE_PRODUCT_BATCH': {
                allowedRoles: ['MANUFACTURER', 'SUPER_ADMIN'],
                description: 'Create new product batches'
            },
            'VIEW_PRODUCT_BATCHES': {
                allowedRoles: ['MANUFACTURER', 'LAB_MANAGER', 'REGULATOR', 'AUDITOR', 'SUPER_ADMIN'],
                description: 'View product batch information'
            },
            'GENERATE_QR_CODE': {
                allowedRoles: ['MANUFACTURER'],
                description: 'Generate QR codes for batches'
            },

            // Verification
            'VERIFY_QR_CODE': {
                allowedRoles: ['CONSUMER', 'FARMER', 'WILD_COLLECTOR', 'PROCESSOR', 'MANUFACTURER', 
                             'LAB_TECHNICIAN', 'LAB_MANAGER', 'REGULATOR', 'AUDITOR', 'SUPER_ADMIN'],
                description: 'Verify product authenticity via QR code'
            },

            // System Administration
            'MANAGE_USERS': {
                allowedRoles: ['SUPER_ADMIN'],
                description: 'Create, update, and delete user accounts'
            },
            'MANAGE_ROLES': {
                allowedRoles: ['SUPER_ADMIN'],
                description: 'Create and modify user roles'
            },
            'VIEW_SYSTEM_LOGS': {
                allowedRoles: ['SUPER_ADMIN', 'REGULATOR'],
                description: 'Access system audit logs'
            },
            'CONFIGURE_CONSERVATION_LIMITS': {
                allowedRoles: ['REGULATOR', 'SUPER_ADMIN'],
                description: 'Set conservation and harvesting limits'
            },

            // Reporting
            'GENERATE_COMPLIANCE_REPORTS': {
                allowedRoles: ['REGULATOR', 'AUDITOR', 'SUPER_ADMIN'],
                description: 'Generate regulatory compliance reports'
            },
            'VIEW_ANALYTICS': {
                allowedRoles: ['MANUFACTURER', 'REGULATOR', 'AUDITOR', 'SUPER_ADMIN'],
                description: 'View system analytics and dashboards'
            }
        };
    }

    // Assign role to user
    assignRole(userId, roleId, assignedBy) {
        if (!this.roles[roleId]) {
            throw new Error(`Role ${roleId} does not exist`);
        }

        // Check if assigner has permission
        const assignerRole = this.getUserRole(assignedBy);
        if (!assignerRole || assignerRole.level < 90) { // Only high-level roles can assign roles
            throw new Error('Insufficient permissions to assign roles');
        }

        // Cannot assign role higher than assigner's role
        if (this.roles[roleId].level >= assignerRole.level) {
            throw new Error('Cannot assign role with equal or higher privileges');
        }

        this.userRoles.set(userId, {
            roleId: roleId,
            assignedBy: assignedBy,
            assignedAt: new Date().toISOString()
        });

        console.log(`Role ${roleId} assigned to user ${userId} by ${assignedBy}`);
    }

    // Check if user has permission
    hasPermission(userId, permission) {
        const userRole = this.getUserRole(userId);
        if (!userRole) {
            return false;
        }

        const permissionDef = this.permissions[permission];
        if (!permissionDef) {
            return false;
        }

        return permissionDef.allowedRoles.includes(userRole.id);
    }

    // Get user's role
    getUserRole(userId) {
        const userRoleData = this.userRoles.get(userId);
        if (!userRoleData) {
            return null;
        }

        return this.roles[userRoleData.roleId];
    }

    // Middleware for Express.js
    requirePermission(permission) {
        return (req, res, next) => {
            const userId = req.user?.id; // Assume user ID is in req.user from authentication middleware

            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (!this.hasPermission(userId, permission)) {
                return res.status(403).json({ 
                    error: 'Insufficient permissions',
                    required: permission,
                    userRole: this.getUserRole(userId)?.name
                });
            }

            next();
        };
    }

    // Get user's permissions
    getUserPermissions(userId) {
        const userRole = this.getUserRole(userId);
        if (!userRole) {
            return [];
        }

        return Object.entries(this.permissions)
            .filter(([permission, def]) => def.allowedRoles.includes(userRole.id))
            .map(([permission, def]) => ({
                permission: permission,
                description: def.description
            }));
    }

    // Create organization-specific access controls
    createOrganizationalAccess(userId, organizationId, organizationType) {
        // Additional layer for multi-tenant access
        const orgAccess = {
            userId: userId,
            organizationId: organizationId,
            organizationType: organizationType, // 'farmers_coop', 'lab', 'processor', 'manufacturer'
            accessLevel: this.determineOrgAccessLevel(userId, organizationType),
            createdAt: new Date().toISOString()
        };

        // Store organizational access (would typically be in database)
        console.log('Organizational access created:', orgAccess);
        return orgAccess;
    }

    determineOrgAccessLevel(userId, organizationType) {
        const userRole = this.getUserRole(userId);
        if (!userRole) return 'none';

        const accessMatrix = {
            'farmers_coop': {
                'FARMER': 'member',
                'FARMER_COOP_MANAGER': 'admin',
                'REGULATOR': 'auditor',
                'SUPER_ADMIN': 'super_admin'
            },
            'lab': {
                'LAB_TECHNICIAN': 'technician',
                'LAB_MANAGER': 'admin',
                'REGULATOR': 'auditor',
                'SUPER_ADMIN': 'super_admin'
            },
            'processor': {
                'PROCESSOR': 'operator',
                'REGULATOR': 'auditor',
                'SUPER_ADMIN': 'super_admin'
            },
            'manufacturer': {
                'MANUFACTURER': 'admin',
                'REGULATOR': 'auditor',
                'SUPER_ADMIN': 'super_admin'
            }
        };

        const orgMatrix = accessMatrix[organizationType];
        return orgMatrix ? (orgMatrix[userRole.id] || 'none') : 'none';
    }
}

// User Management System
class UserManagementSystem {
    constructor(rbac) {
        this.rbac = rbac;
        this.users = new Map();
        this.authTokens = new Map();
    }

    // Create new user
    async createUser(userData, createdBy) {
        const userId = this.generateUserId();
        
        const user = {
            id: userId,
            username: userData.username,
            email: userData.email,
            fullName: userData.fullName,
            phoneNumber: userData.phoneNumber,
            organizationId: userData.organizationId,
            organizationType: userData.organizationType,
            location: userData.location,
            isActive: true,
            createdBy: createdBy,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            profileComplete: false
        };

        this.users.set(userId, user);

        // Assign default role based on organization type
        const defaultRole = this.getDefaultRole(userData.organizationType);
        if (defaultRole) {
            this.rbac.assignRole(userId, defaultRole, createdBy);
        }

        // Create organizational access
        this.rbac.createOrganizationalAccess(userId, userData.organizationId, userData.organizationType);

        console.log(`User created: ${userId} (${userData.username})`);
        return user;
    }

    getDefaultRole(organizationType) {
        const defaultRoles = {
            'farmers_coop': 'FARMER',
            'wild_collection': 'WILD_COLLECTOR',
            'lab': 'LAB_TECHNICIAN',
            'processor': 'PROCESSOR',
            'manufacturer': 'MANUFACTURER'
        };

        return defaultRoles[organizationType] || null;
    }

    // Authenticate user
    async authenticateUser(username, password) {
        // In a real implementation, this would check against a secure password hash
        const user = Array.from(this.users.values()).find(u => u.username === username);
        
        if (!user || !user.isActive) {
            throw new Error('Invalid credentials or inactive account');
        }

        // Generate auth token
        const token = this.generateAuthToken();
        this.authTokens.set(token, {
            userId: user.id,
            issuedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        });

        // Update last login
        user.lastLogin = new Date().toISOString();

        return {
            user: user,
            token: token,
            role: this.rbac.getUserRole(user.id),
            permissions: this.rbac.getUserPermissions(user.id)
        };
    }

    // Validate auth token
    validateToken(token) {
        const tokenData = this.authTokens.get(token);
        if (!tokenData) {
            return null;
        }

        // Check expiration
        if (new Date() > new Date(tokenData.expiresAt)) {
            this.authTokens.delete(token);
            return null;
        }

        const user = this.users.get(tokenData.userId);
        return user && user.isActive ? user : null;
    }

    generateUserId() {
        return 'USER_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    generateAuthToken() {
        return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
    }

    // Get user profile with role and permissions
    getUserProfile(userId) {
        const user = this.users.get(userId);
        if (!user) return null;

        return {
            ...user,
            role: this.rbac.getUserRole(userId),
            permissions: this.rbac.getUserPermissions(userId)
        };
    }
}

// Authentication middleware for Express.js
function createAuthMiddleware(userManagement) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header required' });
        }

        const token = authHeader.split(' ')[1]; // Bearer token
        const user = userManagement.validateToken(token);

        if (!user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.user = user;
        next();
    };
}

module.exports = { 
    RoleBasedAccessControl, 
    UserManagementSystem, 
    createAuthMiddleware 
};