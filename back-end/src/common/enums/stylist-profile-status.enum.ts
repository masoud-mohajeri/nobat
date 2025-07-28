export enum StylistProfileStatus {
  DRAFT = 'draft', // Initial state when profile is created
  PENDING_APPROVAL = 'pending_approval', // Submitted for admin approval
  APPROVED = 'approved', // Approved by admin, visible to public
  REJECTED = 'rejected', // Rejected by admin
  SUSPENDED = 'suspended', // Temporarily suspended by admin
}
