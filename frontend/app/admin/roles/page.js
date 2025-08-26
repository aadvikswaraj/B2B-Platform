"use client";
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import ManagementPanel from '@/components/common/ManagementPanel';
import useSampleList from '@/hooks/useSampleList';
import Badge from '@/components/ui/Badge';

// Mock roles aligning with backend adminRolesSchema (user, roleName, isSuperAdmin, permissions)
const seedPermissions = {
  users:{ view:true, edit:true, delete:false, suspend:true },
  products:{ view:true, edit:false, delete:false, approve:true, reject:true },
  orders:{ view:true, edit:false, delete:false, create:true },
  rfqs:{ view:true, approve:true, reject:false },
  category:{ view:true, edit:true, delete:false, create:true },
  content:{ view:true, edit:true }
};

const initialRoles = [
  { id:'1', roleName:'Super Admin', isSuperAdmin:true, permissions: seedPermissions, users:42, createdAt:'2025-08-01T10:00:00Z' },
  { id:'2', roleName:'Operations Manager', isSuperAdmin:false, permissions: seedPermissions, users:7, createdAt:'2025-08-10T10:00:00Z' },
  { id:'3', roleName:'Content Admin', isSuperAdmin:false, permissions: { ...seedPermissions, users:{ view:true, edit:false, delete:false, suspend:false } }, users:3, createdAt:'2025-08-15T10:00:00Z' }
];

export default function RolesPage(){
  const [roles, setRoles] = useState(initialRoles);
  const [query, setQuery] = useState({ search:'', filters:{}, page:1, pageSize:10, sort:{ key:'roleName', direction:'asc' } });
  const { items, totalCount } = useSampleList(roles, query, { searchableKeys:['roleName'] });

  const columns = useMemo(()=>[
    { key:'roleName', header:'Role', sortable:true, render:r=> (
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">{r.roleName}</span>
        <span className="text-[11px] text-gray-500">{r.isSuperAdmin ? 'Full platform access' : Object.keys(r.permissions).length + ' modules'}</span>
      </div>) },
  { key:'isSuperAdmin', header:'Super', sortable:true, render:r=> r.isSuperAdmin ? <Badge variant='rose'>Yes</Badge> : <span className='text-xs text-gray-500'>No</span> },
    { key:'users', header:'Users', sortable:true },
    { key:'createdAt', header:'Created', sortable:true, render:r=> new Date(r.createdAt).toLocaleDateString() },
  ], []);

  return (
    <div className='mt-5'>
      <ManagementPanel
        title="Roles"
        items={items}
        totalCount={totalCount}
        search={query.search}
        primaryActions={[
          {
            type:'link',
            label:'New Role',
            icon:PlusIcon,
            href:'/admin/roles/new'
          }
        ]}
        onSearchChange={v=>setQuery(q=>({ ...q, search:v, page:1 }))}
        sort={query.sort}
        onSortChange={s=>setQuery(q=>({ ...q, sort:s, page:1 }))}
        page={query.page}
        pageSize={query.pageSize}
        onPageChange={p=>setQuery(q=>({ ...q, page:p }))}
        onPageSizeChange={ps=>setQuery(q=>({ ...q, pageSize:ps, page:1 }))}
        enableSorting
        columns={columns}
        renderCard={({ item }) => (
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{item.roleName}</p>
                <p className="text-[11px] text-gray-500">{item.isSuperAdmin ? 'Super Admin' : 'Modules: '+Object.keys(item.permissions).length}</p>
              </div>
              {item.isSuperAdmin && <Badge variant='rose'>Super</Badge>}
            </div>
            <div className="flex flex-wrap gap-1 text-[10px] text-gray-500">
              <span>{item.users} users</span>
              <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}
