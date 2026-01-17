export const adminPermissions = {
  users:{ view:true, edit:true, delete:false, suspend:true },
  products:{ view:true, edit:false, delete:false, verify:false },
  orders:{ view:true, edit:false, delete:false, create:true },
  rfqs:{ view:true, approve:true, reject:false },
  category:{ view:true, edit:true, delete:false, create:true },
  content:{ view:true, edit:true }
};