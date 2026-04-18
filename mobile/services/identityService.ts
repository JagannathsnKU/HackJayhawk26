import type { PermissionSet, UserProfile } from '../models/types';

export interface IdentityService {
  getUser(): Promise<UserProfile>;
  getPermissions(): Promise<PermissionSet>;
}

/**
 * No personal directory integration in this frontend — placeholders only.
 * Wire to your identity provider and scrub PII per Lockton data handling standards.
 */
export function createMockIdentityService(): IdentityService {
  return {
    async getUser() {
      return {
        id: 'directory-stub',
        displayName: 'Lockton Associate',
        employeeId: '—',
        department: '—',
        homeAirport: '—',
      };
    },
    async getPermissions() {
      return {
        canBookInternational: true,
        canApproveOverPolicy: false,
        allowedVendors: ['Use contracted / preferred suppliers per your travel program'],
      };
    },
  };
}
