/**
 * Admin Users Management Page
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// User Table Row
function UserRow({ user, onEdit, onDelete, onToggleStatus }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
            {user.name.charAt(0)}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${
          user.role === 'instructor' 
            ? 'bg-purple-100 text-purple-700' 
            : user.role === 'admin'
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.enrolledCourses || 0} courses
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${
          user.status === 'active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {user.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.joinDate}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onEdit(user)}
          className="text-blue-600 hover:text-blue-900 mr-3"
        >
          Edit
        </button>
        <button
          onClick={() => onToggleStatus(user)}
          className="text-yellow-600 hover:text-yellow-900 mr-3"
        >
          {user.status === 'active' ? 'Suspend' : 'Activate'}
        </button>
        <button
          onClick={() => onDelete(user)}
          className="text-red-600 hover:text-red-900"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated users data
    setUsers([
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'student', status: 'active', enrolledCourses: 5, joinDate: '2024-01-15' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'instructor', status: 'active', enrolledCourses: 0, joinDate: '2023-11-20' },
      { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'student', status: 'active', enrolledCourses: 3, joinDate: '2024-02-01' },
      { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'student', status: 'suspended', enrolledCourses: 2, joinDate: '2023-12-10' },
      { id: 5, name: 'Admin User', email: 'admin@edux.com', role: 'admin', status: 'active', enrolledCourses: 0, joinDate: '2023-01-01' },
    ]);
    setIsLoading(false);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (user) => {
    console.log('Edit user:', user);
  };

  const handleDelete = (user) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers(users.filter((u) => u.id !== user.id));
    }
  };

  const handleToggleStatus = (user) => {
    setUsers(users.map((u) => 
      u.id === user.id 
        ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
        : u
    ));
  };

  return (
    <>
      <Head>
        <title>User Management | EduX Admin</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-64 bg-slate-800 text-white p-4 z-50">
          <div className="flex items-center mb-8">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-400">EduX</span>
              <span className="ml-2 text-xs bg-blue-500 px-2 py-0.5 rounded">Admin</span>
            </Link>
          </div>

          <nav className="space-y-1">
            <Link href="/admin" className="flex items-center px-4 py-3 text-gray-300 hover:bg-slate-700 rounded-lg">
              <span className="mr-3">📊</span>Overview
            </Link>
            <Link href="/admin/users" className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg">
              <span className="mr-3">👥</span>Users
            </Link>
            <Link href="/admin/courses" className="flex items-center px-4 py-3 text-gray-300 hover:bg-slate-700 rounded-lg">
              <span className="mr-3">📚</span>Courses
            </Link>
            <Link href="/admin/analytics" className="flex items-center px-4 py-3 text-gray-300 hover:bg-slate-700 rounded-lg">
              <span className="mr-3">📈</span>Analytics
            </Link>
            <Link href="/admin/settings" className="flex items-center px-4 py-3 text-gray-300 hover:bg-slate-700 rounded-lg">
              <span className="mr-3">⚙️</span>Settings
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="ml-64 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
              <p className="text-gray-500">Manage all platform users</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              + Add User
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredUsers.length} of {users.length} users
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                Previous
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">1</button>
              <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">2</button>
              <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">3</button>
              <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
