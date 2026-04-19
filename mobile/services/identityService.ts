import type { PermissionSet, UserProfile } from '../models/types';

export interface IdentityService {
  getUser(): Promise<UserProfile>;
  getPermissions(): Promise<PermissionSet>;
}

export function createMockIdentityService(): IdentityService {
  return {
    async getUser() {
      return {
        id: 'user-001',
        displayName: 'Alex Morgan',
        employeeId: 'LKT-88421',
        department: 'Global Risk',
        homeAirport: 'SFO',
      };
    },
    async getPermissions() {
      return {
        canBookInternational: true,
        canApproveOverPolicy: false,
        allowedVendors: ['ANA', 'JAL', 'Hotel New Otani', 'Marriott Corporate'],
      };
    },
  };
}
