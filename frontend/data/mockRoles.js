// Mock roles data shared between roles list and role preview
export const seedPermissions = {
  users:{ view:true, edit:true, delete:false, suspend:true },
  products:{ view:true, edit:false, delete:false, approve:true, reject:true },
  orders:{ view:true, edit:false, delete:false, create:true },
  rfqs:{ view:true, approve:true, reject:false },
  category:{ view:true, edit:true, delete:false, create:true },
  content:{ view:true, edit:true }
};

export const mockRoles = [
  { id:'1', roleName:'Super Admin', isSuperAdmin:true, permissions: seedPermissions, users:42, createdAt:'2025-08-01T10:00:00Z' },
  { id:'2', roleName:'Operations Manager', isSuperAdmin:false, permissions: seedPermissions, users:7, createdAt:'2025-08-10T10:00:00Z' },
  { id:'3', roleName:'Content Admin', isSuperAdmin:false, permissions: { ...seedPermissions, users:{ view:true, edit:false, delete:false, suspend:false } }, users:3, createdAt:'2025-08-15T10:00:00Z' }
];

export function findRole(id){
  return mockRoles.find(r=> r.id === id);
}
