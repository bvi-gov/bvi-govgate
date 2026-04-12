/**
 * Role-Based Access Control (RBAC) for BVI GovGate
 *
 * Permission matrix defining what each officer role can do.
 */

export type OfficerRole = 'admin' | 'senior_officer' | 'officer';

interface RolePermissions {
  canViewAllMinistries: boolean;
  canApproveAny: boolean;
  canManageOfficers: boolean;
  canViewReports: boolean;
  canUseTools: boolean;
}

const ROLE_PERMISSIONS: Record<OfficerRole, RolePermissions> = {
  admin: {
    canViewAllMinistries: true,
    canApproveAny: true,
    canManageOfficers: true,
    canViewReports: true,
    canUseTools: true,
  },
  senior_officer: {
    canViewAllMinistries: false,
    canApproveAny: true, // can approve apps in their department
    canManageOfficers: false,
    canViewReports: true,
    canUseTools: true,
  },
  officer: {
    canViewAllMinistries: false,
    canApproveAny: false,
    canManageOfficers: false,
    canViewReports: false,
    canUseTools: false,
  },
};

/**
 * Check if an officer can access a specific ministry's data.
 * Admins can access all ministries.
 * Senior officers and officers can only access their own department.
 */
export function canAccessMinistry(
  officerRole: string,
  officerDepartment: string,
  targetDepartment: string,
): boolean {
  if (officerRole === 'admin') return true;
  return officerDepartment.toLowerCase() === targetDepartment.toLowerCase();
}

/**
 * Check if an officer can approve/change application status.
 * Admins and senior officers can approve.
 */
export function canApproveApplication(officerRole: string): boolean {
  const perms = ROLE_PERMISSIONS[officerRole as OfficerRole];
  if (!perms) return false;
  return perms.canApproveAny;
}

/**
 * Check if an officer can issue certificates.
 * Only admins can issue certificates.
 */
export function canIssueCertificate(officerRole: string): boolean {
  return officerRole === 'admin';
}

/**
 * Get the list of ministries/departments visible to an officer.
 * Admins see all; others see only their own.
 */
export function getVisibleMinistries(
  officerRole: string,
  officerDepartment: string,
  allMinistries: string[],
): string[] {
  if (officerRole === 'admin') return allMinistries;
  return allMinistries.filter(
    (m) => m.toLowerCase() === officerDepartment.toLowerCase(),
  );
}

/**
 * Check if an officer can use tools (scanner, import, certificate generator).
 */
export function canUseTools(officerRole: string): boolean {
  const perms = ROLE_PERMISSIONS[officerRole as OfficerRole];
  return perms?.canUseTools ?? false;
}

/**
 * Check if an officer can view reports.
 */
export function canViewReports(officerRole: string): boolean {
  const perms = ROLE_PERMISSIONS[officerRole as OfficerRole];
  return perms?.canViewReports ?? false;
}

/**
 * Check if an officer can manage other officers.
 */
export function canManageOfficers(officerRole: string): boolean {
  const perms = ROLE_PERMISSIONS[officerRole as OfficerRole];
  return perms?.canManageOfficers ?? false;
}

export { ROLE_PERMISSIONS };
