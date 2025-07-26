export enum UserStatus {
  PENDING = 'pending', // Phone verified but profile not completed
  ACTIVE = 'active', // Profile completed and account active
  LOCKED = 'locked', // Account locked due to failed attempts
  INACTIVE = 'inactive', // Account deactivated
}
