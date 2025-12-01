// src/pages/Profile.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Save, Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { userQuery, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  // Initialize form when user data is loaded
  React.useEffect(() => {
    if (userQuery.data?.user) {
      const user = userQuery.data.user;
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        contact_number: user.contact_number || ''
      });
    }
  }, [userQuery.data]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const { data } = await api.put('/users/' + userQuery.data.user.id, profileData);
      return data;
    },
    onSuccess: (data) => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData) => {
      const { data } = await api.put('/auth/change-password', passwordData);
      return data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    changePasswordMutation.mutate(passwordForm);
  };

  const isProfileChanged = () => {
    if (!userQuery.data?.user) return false;
    const user = userQuery.data.user;
    return (
      profileForm.first_name !== user.first_name ||
      profileForm.last_name !== user.last_name ||
      profileForm.email !== user.email ||
      profileForm.contact_number !== (user.contact_number || '')
    );
  };

  if (!isAuthenticated()) {
    return (
      <div className="page-container">
        <div className="page-error">
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (userQuery.isLoading) {
    return (
      <div className="page-container">
        <div className="page-loading">
          <div className="page-loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (userQuery.isError) {
    return (
      <div className="page-container">
        <div className="page-error">
          <p>Failed to load profile. Please try again.</p>
        </div>
      </div>
    );
  }

  const user = userQuery.data?.user;

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">Profile Settings</h1>
            <p className="page-subtitle">Manage your account information and security</p>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'password'
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Change Password
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-card shadow rounded-lg border border-border">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-medium text-foreground">Personal Information</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Update your basic profile information
              </p>
            </div>
            <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
              {/* First Name & Last Name - One Row (matching AddUser) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="modal-label">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={profileForm.first_name}
                    onChange={handleProfileChange}
                    className="modal-input"
                  />
                </div>

                <div>
                  <label className="modal-label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    value={profileForm.last_name}
                    onChange={handleProfileChange}
                    className="modal-input"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="modal-label">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="modal-input pl-10"
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div>
                <label className="modal-label">Contact Number (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="tel"
                    name="contact_number"
                    value={profileForm.contact_number}
                    onChange={handleProfileChange}
                    className="modal-input pl-10"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Buttons - matching AddUser */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="submit"
                  disabled={!isProfileChanged() || updateProfileMutation.isPending}
                  className={`modal-btn-primary ${(!isProfileChanged() || updateProfileMutation.isPending) ? 'modal-btn-disabled' : ''}`}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-card shadow rounded-lg border border-border">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-medium text-foreground">Change Password</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Update your password to keep your account secure
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
              {/* Current Password */}
              <div>
                <label className="modal-label">Current Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="current_password"
                    required
                    value={passwordForm.current_password}
                    onChange={handlePasswordChange}
                    className="modal-input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="modal-label">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="new_password"
                    required
                    minLength="6"
                    value={passwordForm.new_password}
                    onChange={handlePasswordChange}
                    className="modal-input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="modal-label">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="new_password_confirmation"
                    required
                    minLength="6"
                    value={passwordForm.new_password_confirmation}
                    onChange={handlePasswordChange}
                    className="modal-input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Buttons - matching AddUser */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.new_password_confirmation}
                  className={`modal-btn-primary ${(changePasswordMutation.isPending || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.new_password_confirmation) ? 'modal-btn-disabled' : ''}`}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {changePasswordMutation.isPending ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;