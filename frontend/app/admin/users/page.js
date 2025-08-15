'use client';
import { useState, useCallback } from 'react';
import { AdminCard } from '@/components/admin/AdminComponents';
import ManagementPanel from '@/components/common/ManagementPanel';

// Mock data - replace with API integration
const initialUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'seller', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'buyer', status: 'active' },
  { id: 3, name: 'Sam Admin', email: 'sam@platform.com', role: 'admin', status: 'active' },
  { id: 4, name: 'Peter Pending', email: 'peter@wait.com', role: 'seller', status: 'pending' },
];

const roleFilter = [
  { value: 'admin', label: 'Admin' },
  { value: 'seller', label: 'Seller' },
  { value: 'buyer', label: 'Buyer' },
];
const statusFilter = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' },
];

export default function UsersPage(){
  const [users, setUsers] = useState(initialUsers);
  const [selected, setSelected] = useState([]);

  const toggleSuspend = useCallback((user) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } : u));
  }, []);

  const banUser = useCallback((user) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'banned' } : u));
  }, []);

  const bulkSetStatus = (status) => {
    setUsers(prev => prev.map(u => selected.includes(u.id) ? { ...u, status } : u));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AdminCard title="Stats">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total</p>
              <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{users.length}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Active</p>
              <p className="mt-1 text-xl font-semibold text-green-600 dark:text-green-400">{users.filter(u=>u.status==='active').length}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Suspended</p>
              <p className="mt-1 text-xl font-semibold text-yellow-600 dark:text-yellow-400">{users.filter(u=>u.status==='suspended').length}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Banned</p>
              <p className="mt-1 text-xl font-semibold text-red-600 dark:text-red-400">{users.filter(u=>u.status==='banned').length}</p>
            </div>
          </div>
        </AdminCard>
      </div>

      <ManagementPanel
        title={null}
        items={users}
        searchableKeys={['name','email','role','status']}
        filters={[
          { key: 'role', label: 'Role', options: roleFilter },
          { key: 'status', label: 'Status', options: statusFilter },
        ]}
        enableSorting
        initialSort={{ key: 'name', direction: 'asc' }}
        columns={[
          { key: 'name', header: 'Name', sortable: true, render: u => (
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
            </div>
          ) },
          { key: 'role', header: 'Role', sortable: true, render: u => (
            <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">{u.role}</span>
          ) },
          { key: 'status', header: 'Status', sortable: true, render: u => (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${u.status==='active'?'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200':u.status==='pending'?'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200':u.status==='suspended'?'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200':u.status==='banned'?'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200':'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{u.status}</span>
          ) },
        ]}
        rowActions={[{
          label: 'Suspend',
          onClick: (user) => toggleSuspend(user)
        },
        {
          label: 'Delete',
          onClick: (user) => setUsers(prev => prev.filter(u => u.id !== user.id)),
        },
      ]}
        bulkActions={[
          { key: 'activate', label: 'Set Active', onClick: ids => { setUsers(prev => prev.map(u => ids.includes(u.id) ? { ...u, status: 'active' } : u)); } },
          { key: 'suspend', label: 'Set Suspended', onClick: ids => bulkSetStatus('suspended') }
        ]}
        onSelectionChange={setSelected}
        primaryAction={{ label: 'Add User', onClick: ()=>{/* open add user modal */} }}
      />
    </div>
  );
}