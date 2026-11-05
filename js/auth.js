/**
 * SecondServe – Authentication & Role Management
 * Supports role-based access for Donor, NGO, Volunteer, and Admin.
 * Provides instant 1-click demo role switching for testing & evaluation.
 */

import { DataStore } from './data.js';

export class AuthService {
  static getCurrentUser() {
    return DataStore.getCurrentUser();
  }

  static login(email, password) {
    const users = DataStore.getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      throw new Error('No account found with this email address.');
    }

    if (found.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    DataStore.setCurrentUser(found);
    return found;
  }

  static switchDemoRole(role) {
    const users = DataStore.getUsers();
    let target = users.find(u => u.role.toLowerCase() === role.toLowerCase());
    if (!target) {
      target = users[0];
    }
    DataStore.setCurrentUser(target);
    return target;
  }

  static register(userData) {
    const users = DataStore.getUsers();
    const exists = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      id: 'usr-' + userData.role.toLowerCase() + '-' + Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password || 'password123',
      role: userData.role,
      organization: userData.organization || userData.name,
      phone: userData.phone || '+1 (555) 000-0000',
      address: userData.address || 'Central City Area',
      licenseNumber: userData.licenseNumber || '',
      regNumber: userData.regNumber || '',
      vehicleType: userData.vehicleType || '',
      verified: userData.role === 'Admin' ? true : false, // Needs admin verification
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    };

    users.push(newUser);
    DataStore.set('secondserve_users_v1', users);
    DataStore.setCurrentUser(newUser);

    DataStore.addNotification({
      targetRole: 'Admin',
      title: 'New Account Registration',
      message: `${newUser.name} registered as a ${newUser.role} (${newUser.organization}). Verification pending.`,
      donationId: null
    });

    return newUser;
  }

  static logout() {
    // Revert to null or public view
    localStorage.removeItem('secondserve_current_user_v1');
  }

  static hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role.toLowerCase() === role.toLowerCase();
  }
}
