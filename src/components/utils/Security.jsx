
import { AuditLog } from "@/api/entities";
import { User } from "@/api/entities";
import { RoleAssignment } from "@/api/entities";

const rolePermissions = {
  super_admin: ['*'], // OneCareDesk platform owner - can do anything across all agencies
  admin: ['*'], // OneCareDesk staff - can do anything across all agencies
  agency_admin: [
    '*_within_agency', // Can do anything within their own agency
    'manage_agency_users', 'invite_agency_users', 'remove_agency_users',
    'manage_agency_settings', 'view_agency_billing',
    'view_dashboard',
    'manage_leads', 'view_leads',
    'manage_patients', 'view_patients',
    'manage_caregivers', 'view_caregivers',
    'manage_documents', 'view_documents',
    'manage_signatures', 'view_signatures',
    'manage_calendar', 'view_calendar',
    'manage_tasks', 'view_tasks'
  ],
  care_manager: [
    'view_dashboard',
    'manage_leads', 'view_leads',
    'manage_patients', 'view_patients',
    'manage_caregivers', 'view_caregivers',
    'manage_documents', 'view_documents',
    'manage_signatures', 'view_signatures',
    'manage_calendar', 'view_calendar'
  ],
  caregiver: [
    'view_dashboard_limited',
    'view_assigned_patients',
    'view_assigned_tasks',
    'view_calendar_personal'
  ]
};

/**
 * Checks if a user has permission to perform an action using the new RoleAssignment system.
 * @param {object} user - The user object from User.me()
 * @param {string} requiredPermission - The permission string to check
 * @returns {boolean} - True if the user has permission, false otherwise.
 */
export const checkPermission = async (user, requiredPermission) => {
  if (!user || !user.email) {
    return false;
  }

  // Fetch all roles for the current user from the new RoleAssignment entity
  const assignments = await RoleAssignment.filter({ user_email: user.email });

  if (assignments.length > 0) {
    // New Role System: Check permissions based on all assigned roles.
    for (const assignment of assignments) {
      const userPermissions = rolePermissions[assignment.role] || [];
      if (userPermissions.includes('*') || userPermissions.includes(requiredPermission)) {
        return true; // Permission granted by one of the roles
      }
      // Special case for agency-wide permissions
      if (userPermissions.includes('*_within_agency') && assignment.agency_id === user.agency_id) {
        return true;
      }
    }
  } else if (user.role) {
    // Fallback to the old system if no roles are assigned in the new table
    const userPermissions = rolePermissions[user.role] || [];
    if (userPermissions.includes('*') || userPermissions.includes(requiredPermission)) {
      return true;
    }
    // Fallback specific for agency_admin's *_within_agency if user.role is agency_admin and no assignments exist
    if (user.role === 'agency_admin' && userPermissions.includes('*_within_agency')) {
      return true;
    }
  }

  return false; // No permission found
};

/**
 * Gets all roles for a user using the new RoleAssignment system.
 * Falls back to the old user.role if no assignments exist.
 * @param {object} user - The user object from User.me()
 * @returns {Promise<Array<string>>} - A promise that resolves to an array of role strings.
 */
export const getUserRoles = async (user) => {
    if (!user || !user.email) return [];
    
    try {
        const assignments = await RoleAssignment.filter({ user_email: user.email });
        if (assignments.length > 0) {
            return assignments.map(a => a.role);
        }
        // Fallback to old system if no role assignments exist
        return user.role ? [user.role] : [];
    } catch (error) {
        console.error("Error getting user roles:", error);
        // Fallback to old system on error
        return user.role ? [user.role] : [];
    }
};


/**
 * Checks if user can manage other users (for User Management page)
 */
export const canManageUsers = async (user) => {
  if (!user) return false;
  const roles = await getUserRoles(user);
  return roles.some(role => ['super_admin', 'admin', 'agency_admin'].includes(role));
};

/**
 * Checks if user can see all agencies (platform level access)
 */
export const canAccessAllAgencies = async (user) => {
  if (!user) return false;
  const roles = await getUserRoles(user);
  return roles.some(role => ['super_admin', 'admin'].includes(role));
};

/**
 * Logs an audit event.
 * @param {object} user - The user object from User.me()
 * @param {string} action - The action performed (e.g., 'view_patient_details')
 * @param {string} entityType - The type of entity (e.g., 'Patient')
 * @param {string} entityId - The ID of the specific entity record
 * @param {object} details - Optional additional data about the event
 */
export const logAuditEvent = async (user, action, entityType, entityId = null, details = {}) => {
  if (!user) return;
  try {
    await AuditLog.create({
      user_email: user.email,
      user_role: user.role,
      action: action,
      entity_type: entityType,
      entity_id: entityId,
      details: details,
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
};
