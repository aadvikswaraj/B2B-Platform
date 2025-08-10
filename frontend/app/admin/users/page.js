'use client';

import { useState } from 'react';
import { AdminCard, DataTable, FilterBar, SearchBar, Pagination } from '@/components/admin/AdminComponents';

// Mock data - replace with actual API calls
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'seller', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'buyer', status: 'active' },
  // Add more mock users...
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' }
];

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'seller', label: 'Seller' },
  { value: 'buyer', label: 'Buyer' }
];

export default function UsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewUser(row.id)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View
          </button>
          <button
            onClick={() => handleEditUser(row.id)}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Edit
          </button>
          {row.status !== 'banned' && (
            <button
              onClick={() => handleSuspendUser(row.id)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              {row.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
            </button>
          )}
        </div>
      ),
    },
  ];

  // Filter and sort users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || user.status === filters.status;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewUser = (userId) => {
    // Implement view user logic
  };

  const handleEditUser = (userId) => {
    // Implement edit user logic
  };

  const handleSuspendUser = (userId) => {
    // Implement suspend user logic
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <AdminCard title="Quick Stats">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {users.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={handleSearch}
                placeholder="Search users..."
              />
            </div>
            <div className="flex-1 md:flex-initial md:w-48">
              <button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => {/* Implement add user */}}
              >
                Add User
              </button>
            </div>
          </div>

          <FilterBar
            filters={[
              {
                key: 'role',
                label: 'Role',
                value: filters.role,
                options: roleOptions
              },
              {
                key: 'status',
                label: 'Status',
                value: filters.status,
                options: statusOptions
              }
            ]}
            onChange={handleFilterChange}
          />

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <DataTable
              columns={columns}
              data={paginatedUsers}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
