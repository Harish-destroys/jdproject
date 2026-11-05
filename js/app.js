/**
 * SecondServe – Main Application Orchestrator
 * Connects page navigation, live filters, modals, toasts, countdown timers,
 * and audio chimes without any external frontend framework.
 */

import { DataStore } from './data.js';
import { AuthService } from './auth.js';
import { TrackingEngine } from './tracking.js';
import { DashboardController } from './dashboards.js';

class SecondServeApp {
  constructor() {
    this.currentView = 'home';
    this.activeFilters = {
      search: '',
      category: 'All',
      dietary: 'All',
      location: 'All'
    };
  }

  init() {
    this.bindEvents();
    this.setupRouter();
    this.renderHeaderUserUI();
    this.renderAvailableFoodGrid();
    this.renderHomeFeaturedFood();
    this.renderHomeStats();
    this.startCountdownTimer();
  }

  setupRouter() {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      this.navigateTo(hash);
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
  }

  navigateTo(viewId) {
    this.currentView = viewId;

    // Hide all view sections
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.add('d-none');
    });

    // Show target view
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.remove('d-none');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const home = document.getElementById('view-home');
      if (home) home.classList.remove('d-none');
    }

    // Update nav active states
    document.querySelectorAll('.nav-link-custom').forEach(link => {
      const targetHash = link.getAttribute('href')?.replace('#', '');
      if (targetHash === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Special dashboard renderings
    if (viewId === 'dashboard-donor') {
      const cont = document.getElementById('donor-dashboard-container');
      if (cont) DashboardController.renderDonorDashboard(cont);
    } else if (viewId === 'dashboard-ngo') {
      const cont = document.getElementById('ngo-dashboard-container');
      if (cont) DashboardController.renderNgoDashboard(cont);
    } else if (viewId === 'dashboard-volunteer') {
      const cont = document.getElementById('volunteer-dashboard-container');
      if (cont) DashboardController.renderVolunteerDashboard(cont);
    } else if (viewId === 'dashboard-admin') {
      const cont = document.getElementById('admin-dashboard-container');
      if (cont) DashboardController.renderAdminDashboard(cont);
    } else if (viewId === 'available-food') {
      this.renderAvailableFoodGrid();
    } else if (viewId === 'home') {
      this.renderHomeStats();
      this.renderHomeFeaturedFood();
    }
  }

  bindEvents() {
    // Quick Demo Role Switcher Chips
    document.querySelectorAll('.demo-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const role = chip.getAttribute('data-role');
        const user = AuthService.switchDemoRole(role);
        document.querySelectorAll('.demo-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        this.renderHeaderUserUI();
        this.playNotificationSound();
        this.showToast('Role Switched', `Logged in as ${user.role} - ${user.organization || 'Verified Account'}`);

        // Automatically navigate to their dashboard
        const dashboardView = `dashboard-${role.toLowerCase()}`;
        this.navigateTo(dashboardView);
        window.location.hash = '#' + dashboardView;
      });
    });

    // Food Catalog Search & Filters
    const searchInput = document.getElementById('foodSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.activeFilters.search = e.target.value.toLowerCase();
        this.renderAvailableFoodGrid();
      });
    }

    // Category Filter Chips
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-filter-btn').forEach(b => {
          b.classList.remove('btn-royal', 'text-white');
          b.classList.add('btn-outline-custom');
        });
        btn.classList.remove('btn-outline-custom');
        btn.classList.add('btn-royal', 'text-white');

        this.activeFilters.category = btn.getAttribute('data-category');
        this.renderAvailableFoodGrid();
      });
    });

    // Dietary Filter Select
    const dietarySelect = document.getElementById('dietaryFilterSelect');
    if (dietarySelect) {
      dietarySelect.addEventListener('change', (e) => {
        this.activeFilters.dietary = e.target.value;
        this.renderAvailableFoodGrid();
      });
    }

    // Add Food Donation Form Submit
    const formAddDonation = document.getElementById('formAddDonation');
    if (formAddDonation) {
      formAddDonation.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = AuthService.getCurrentUser();
        if (!user || user.role !== 'Donor') {
          this.showToast('Authentication Required', 'Please switch to or log in as a Restaurant/Hotel Donor to list food.');
          return;
        }

        const formData = new FormData(formAddDonation);
        const donationData = {
          foodName: formData.get('foodName'),
          category: formData.get('category'),
          dietary: formData.get('dietary'),
          quantity: formData.get('quantity'),
          servings: formData.get('servings'),
          storageCondition: formData.get('storageCondition'),
          foodSafetyInfo: formData.get('foodSafetyInfo'),
          allergens: formData.get('allergens'),
          pickupAddress: formData.get('pickupAddress'),
          image: formData.get('imagePreset') || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
          prepTime: formData.get('prepTime') || 'Freshly Prepared',
          expiryDisplay: `In ${formData.get('expiryHours') || 4} hours`
        };

        const newDon = DataStore.addDonation(donationData, user);
        formAddDonation.reset();

        // Close modal
        const modalEl = document.getElementById('modalAddDonation');
        if (modalEl && window.bootstrap) {
          const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) modalInstance.hide();
        }

        this.playNotificationSound();
        this.showToast('Donation Listed!', `"${newDon.foodName}" is now live and broadcasted to local NGOs.`);
        this.navigateTo('dashboard-donor');
      });
    }

    // Request Food Form Submit (NGO)
    const formRequestFood = document.getElementById('formRequestFood');
    if (formRequestFood) {
      formRequestFood.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = AuthService.getCurrentUser();
        if (!user || user.role !== 'NGO') {
          this.showToast('NGO Authorization', 'Please switch to an NGO profile to request food.');
          return;
        }

        const donationId = document.getElementById('requestFoodDonationId').value;
        const beneficiaryCount = document.getElementById('requestBeneficiaryCount').value;
        const targetCommunity = document.getElementById('requestTargetCommunity').value;
        const notes = document.getElementById('requestNotes').value;

        try {
          DataStore.createFoodRequest(donationId, user, { beneficiaryCount, targetCommunity, notes });
          formRequestFood.reset();

          const modalEl = document.getElementById('modalRequestFood');
          if (modalEl && window.bootstrap) {
            const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
          }

          this.playNotificationSound();
          this.showToast('Request Submitted', 'Your request was dispatched to the donor. They have been notified for immediate approval.');
          this.navigateTo('dashboard-ngo');
        } catch (err) {
          this.showToast('Request Error', err.message);
        }
      });
    }

    // Distribution Completed Form Submit (NGO)
    const formDistribution = document.getElementById('formDistribution');
    if (formDistribution) {
      formDistribution.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = AuthService.getCurrentUser();
        const donationId = document.getElementById('distributionDonationId').value;
        const mealsServed = document.getElementById('distributionMealsServed').value;
        const community = document.getElementById('distributionCommunity').value;
        const comments = document.getElementById('distributionComments').value;

        try {
          DataStore.markDistributionCompleted(donationId, user, { mealsServed, community, comments });
          formDistribution.reset();

          const modalEl = document.getElementById('modalDistribution');
          if (modalEl && window.bootstrap) {
            const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
          }

          this.playNotificationSound();
          this.showToast('Rescue Cycle Completed!', `Successfully logged distribution of ${mealsServed} meals. Thank you!`);
          this.navigateTo('dashboard-ngo');
        } catch (err) {
          this.showToast('Error', err.message);
        }
      });
    }

    // Contact Form Submit
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.playNotificationSound();
        this.showToast('Message Received', 'Thank you for reaching out to SecondServe. Our coordination desk will respond within 2 hours.');
        contactForm.reset();
      });
    }

    // Login Form Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;

        try {
          const user = AuthService.login(email, pass);
          this.renderHeaderUserUI();
          this.playNotificationSound();
          this.showToast('Welcome Back!', `Signed in as ${user.name} (${user.role})`);
          this.navigateTo(`dashboard-${user.role.toLowerCase()}`);
        } catch (err) {
          this.showToast('Sign-In Failed', err.message);
        }
      });
    }

    // Registration Form Submit
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const role = document.getElementById('regRole').value;
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const org = document.getElementById('regOrg').value;
        const phone = document.getElementById('regPhone').value;
        const license = document.getElementById('regLicense')?.value || '';

        try {
          const newUser = AuthService.register({
            role,
            name,
            email,
            organization: org,
            phone,
            licenseNumber: license
          });
          this.renderHeaderUserUI();
          this.playNotificationSound();
          this.showToast('Account Created!', `Welcome to SecondServe, ${newUser.name}. Your ${newUser.role} workspace is ready.`);
          this.navigateTo(`dashboard-${newUser.role.toLowerCase()}`);
        } catch (err) {
          this.showToast('Registration Error', err.message);
        }
      });
    }

    // Role select dynamically reveals role-specific input
    const regRoleSelect = document.getElementById('regRole');
    if (regRoleSelect) {
      regRoleSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        const licenseGroup = document.getElementById('regLicenseGroup');
        const licenseLabel = document.getElementById('regLicenseLabel');
        if (licenseGroup && licenseLabel) {
          if (val === 'Donor') {
            licenseGroup.classList.remove('d-none');
            licenseLabel.innerText = 'FSSAI / Food Hygiene License Number';
          } else if (val === 'NGO') {
            licenseGroup.classList.remove('d-none');
            licenseLabel.innerText = '80G Charity / Society Registration Number';
          } else if (val === 'Volunteer') {
            licenseGroup.classList.remove('d-none');
            licenseLabel.innerText = 'Vehicle Type & Driving License / ID Number';
          } else {
            licenseGroup.classList.add('d-none');
          }
        }
      });
    }

    // Live Tracker Search Input (Public View)
    const searchTrackerBtn = document.getElementById('btnSearchTracker');
    const searchTrackerInput = document.getElementById('inputTrackerId');
    if (searchTrackerBtn && searchTrackerInput) {
      searchTrackerBtn.addEventListener('click', () => {
        const id = searchTrackerInput.value.trim().toUpperCase();
        if (id) {
          this.openTrackerModal(id);
        }
      });
    }
  }

  renderHeaderUserUI() {
    const user = AuthService.getCurrentUser();
    const userBadgeEl = document.getElementById('navUserBadge');
    const userPortalBtn = document.getElementById('navDashboardLink');

    if (userBadgeEl) {
      userBadgeEl.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <img src="${user.avatar}" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover; border: 2px solid var(--color-emerald);">
          <div class="d-none d-lg-block text-start lh-1">
            <div class="text-white fw-bold" style="font-size: 0.85rem;">${user.name}</div>
            <small class="text-emerald" style="font-size: 0.72rem;">${user.role} • ${user.organization?.split(' ')[0] || 'Active'}</small>
          </div>
        </div>
      `;
    }

    if (userPortalBtn) {
      userPortalBtn.setAttribute('href', `#dashboard-${user.role.toLowerCase()}`);
      userPortalBtn.innerHTML = `<i class="bi bi-speedometer2 me-1"></i> ${user.role} Dashboard`;
    }

    // Update notification bell count
    const notifs = DataStore.getNotifications(user.role, user.id);
    const unreadCount = notifs.filter(n => !n.read).length;
    const notifBadge = document.getElementById('notifCountBadge');
    if (notifBadge) {
      notifBadge.innerText = unreadCount;
      notifBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }

    // Populate notification dropdown list
    const notifListEl = document.getElementById('notificationListContainer');
    if (notifListEl) {
      if (notifs.length === 0) {
        notifListEl.innerHTML = '<div class="p-3 text-center text-muted small">No notifications yet</div>';
      } else {
        notifListEl.innerHTML = notifs.map(n => `
          <div class="notification-item ${n.read ? '' : 'unread'}" data-don-id="${n.donationId || ''}">
            <div class="fw-bold text-navy" style="font-size: 0.86rem;">${n.title}</div>
            <div class="text-secondary small">${n.message}</div>
            <div class="text-muted mt-1" style="font-size: 0.7rem;">
              <i class="bi bi-clock"></i> ${new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        `).join('');

        // Click on notif opens tracker if donationId present
        notifListEl.querySelectorAll('.notification-item').forEach(item => {
          item.addEventListener('click', () => {
            const donId = item.getAttribute('data-don-id');
            if (donId) {
              this.openTrackerModal(donId);
            }
          });
        });
      }
    }
  }

  renderHomeStats() {
    const metrics = DataStore.getPlatformMetrics();
    const statMeals = document.getElementById('statTotalMeals');
    const statCo2 = document.getElementById('statCo2Saved');
    const statDonors = document.getElementById('statPartnerDonors');
    const statNgos = document.getElementById('statActiveNgos');

    if (statMeals) statMeals.innerText = metrics.totalPortions.toLocaleString();
    if (statCo2) statCo2.innerText = metrics.co2Saved.toLocaleString() + ' kg';
    if (statDonors) statDonors.innerText = metrics.donorsCount + ' Verified';
    if (statNgos) statNgos.innerText = metrics.ngosCount + ' Shelters';
  }

  renderHomeFeaturedFood() {
    const container = document.getElementById('homeFeaturedFoodRow');
    if (!container) return;

    const available = DataStore.getDonations().filter(d => d.status === 'Listed').slice(0, 3);
    if (available.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-4 text-muted">
          <i class="bi bi-emoji-smile fs-1 text-success mb-2 d-block"></i>
          All current surplus batches have been claimed! Check back soon or register as a donor to list fresh surplus.
        </div>
      `;
      return;
    }

    container.innerHTML = available.map(don => `
      <div class="col-12 col-md-4">
        <div class="card-custom h-100 d-flex flex-column">
          <div class="food-card-img-wrap">
            <img src="${don.image}" alt="${don.foodName}">
            <span class="food-card-category-pill">${don.category}</span>
            <span class="food-card-urgent-pill">
              <i class="bi bi-alarm text-warning"></i> ${don.expiryDisplay}
            </span>
          </div>
          <div class="food-card-body d-flex flex-column flex-grow-1">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <span class="badge ${don.dietary === 'Veg' ? 'badge-veg' : 'badge-nonveg'}">${don.dietary}</span>
              <span class="text-muted small"><i class="bi bi-geo-alt"></i> Financial Bay</span>
            </div>
            <h5 class="food-card-title">${don.foodName}</h5>
            <div class="food-donor-meta">
              <i class="bi bi-shop text-royal"></i> ${don.donorName}
            </div>
            <div class="p-2 bg-light rounded small mb-3">
              <div class="fw-semibold text-navy"><i class="bi bi-pie-chart text-royal"></i> ${don.quantity}</div>
              <div class="text-muted"><i class="bi bi-thermometer-half"></i> ${don.storageCondition}</div>
            </div>
            <div class="mt-auto d-flex gap-2">
              <button class="btn btn-emerald flex-grow-1 btn-sm btn-request-modal-open" data-don-id="${don.id}">
                <i class="bi bi-hand-index-thumb"></i> Request Surplus
              </button>
              <button class="btn btn-outline-custom btn-sm btn-details-modal-open" data-don-id="${don.id}">
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    this.attachCardModalButtons(container);
  }

  renderAvailableFoodGrid() {
    const container = document.getElementById('availableFoodGrid');
    if (!container) return;

    let list = DataStore.getDonations();

    // Search filter
    if (this.activeFilters.search) {
      const q = this.activeFilters.search;
      list = list.filter(d =>
        d.foodName.toLowerCase().includes(q) ||
        d.donorName.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (this.activeFilters.category !== 'All') {
      list = list.filter(d => d.category.toLowerCase() === this.activeFilters.category.toLowerCase());
    }

    // Dietary filter
    if (this.activeFilters.dietary !== 'All') {
      list = list.filter(d => d.dietary.toLowerCase() === this.activeFilters.dietary.toLowerCase());
    }

    const countBadge = document.getElementById('foodResultsCount');
    if (countBadge) countBadge.innerText = `${list.length} Listings Available`;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-search fs-1 text-muted mb-3 d-block"></i>
          <h4 class="fw-bold text-navy">No Food Donations Found</h4>
          <p class="text-muted">Try adjusting your search criteria or resetting filters.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(don => {
      const isClaimable = TrackingEngine.canRequest(don);
      return `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card-custom h-100 d-flex flex-column">
            <div class="food-card-img-wrap">
              <img src="${don.image}" alt="${don.foodName}">
              <span class="food-card-category-pill">${don.category}</span>
              <span class="food-card-urgent-pill">
                <i class="bi bi-clock-history text-sky"></i> ${don.expiryDisplay}
              </span>
            </div>
            <div class="food-card-body d-flex flex-column flex-grow-1">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="badge ${don.dietary === 'Veg' ? 'badge-veg' : 'badge-nonveg'}">${don.dietary}</span>
                ${TrackingEngine.getStatusBadge(don.status)}
              </div>
              <h5 class="food-card-title mb-1">${don.foodName}</h5>
              <div class="food-donor-meta">
                <i class="bi bi-building text-royal"></i> ${don.donorName}
              </div>
              
              <div class="p-2 rounded bg-light small mb-3">
                <div class="fw-bold text-navy"><i class="bi bi-box2 text-royal"></i> ${don.quantity} (${don.servings} portions)</div>
                <div class="text-muted"><i class="bi bi-geo-alt text-danger"></i> ${don.pickupAddress}</div>
                <div class="text-muted"><i class="bi bi-thermometer-sun"></i> ${don.storageCondition}</div>
              </div>

              <div class="mt-auto d-flex gap-2">
                ${isClaimable ? `
                  <button class="btn btn-emerald flex-grow-1 btn-sm btn-request-modal-open" data-don-id="${don.id}">
                    <i class="bi bi-hand-index-thumb"></i> Request Surplus
                  </button>
                ` : `
                  <button class="btn btn-outline-secondary flex-grow-1 btn-sm btn-track-view" data-don-id="${don.id}">
                    <i class="bi bi-diagram-3"></i> View Progress (${don.status})
                  </button>
                `}
                <button class="btn btn-outline-custom btn-sm btn-details-modal-open" data-don-id="${don.id}">
                  <i class="bi bi-info-circle"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.attachCardModalButtons(container);
  }

  attachCardModalButtons(container) {
    container.querySelectorAll('.btn-request-modal-open').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openRequestModal(btn.getAttribute('data-don-id'));
      });
    });

    container.querySelectorAll('.btn-details-modal-open').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openDetailsModal(btn.getAttribute('data-don-id'));
      });
    });

    container.querySelectorAll('.btn-track-view').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openTrackerModal(btn.getAttribute('data-don-id'));
      });
    });
  }

  openDetailsModal(donationId) {
    const don = DataStore.getDonationById(donationId);
    if (!don) return;

    const modalBody = document.getElementById('detailsModalContent');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="row g-4">
        <div class="col-12 col-md-5">
          <img src="${don.image}" alt="${don.foodName}" class="img-fluid rounded-3 mb-3 shadow-sm w-100" style="height: 240px; object-fit: cover;">
          <div class="p-3 bg-light rounded-3 small">
            <div class="fw-bold text-navy mb-1"><i class="bi bi-shield-check text-success"></i> Food Safety & Hygiene</div>
            <div class="text-muted mb-2">${don.foodSafetyInfo}</div>
            <div class="fw-bold text-navy mb-1"><i class="bi bi-exclamation-triangle text-warning"></i> Allergen Declaration</div>
            <div class="text-muted">${don.allergens}</div>
          </div>
        </div>
        <div class="col-12 col-md-7">
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge ${don.dietary === 'Veg' ? 'badge-veg' : 'badge-nonveg'}">${don.dietary}</span>
            <span class="badge-category">${don.category}</span>
            ${TrackingEngine.getStatusBadge(don.status)}
          </div>
          <h4 class="fw-bold text-navy">${don.foodName}</h4>
          <p class="text-muted small mb-3">Rescue Reference: <code>${don.id}</code></p>

          <div class="card p-3 mb-3 border bg-white">
            <div class="row g-2 small">
              <div class="col-6">
                <span class="text-muted d-block">Quantity Rescued:</span>
                <span class="fw-bold text-navy fs-6">${don.quantity}</span>
              </div>
              <div class="col-6">
                <span class="text-muted d-block">Estimated Servings:</span>
                <span class="fw-bold text-royal fs-6">${don.servings} Meals</span>
              </div>
              <div class="col-6">
                <span class="text-muted d-block">Preparation Time:</span>
                <span class="fw-semibold text-navy">${don.prepTime}</span>
              </div>
              <div class="col-6">
                <span class="text-muted d-block">Available Until:</span>
                <span class="fw-semibold text-danger">${don.expiryDisplay}</span>
              </div>
              <div class="col-12 mt-2 pt-2 border-top">
                <span class="text-muted d-block">Storage Requirement:</span>
                <span class="fw-semibold text-navy"><i class="bi bi-thermometer-half text-primary"></i> ${don.storageCondition}</span>
              </div>
            </div>
          </div>

          <div class="p-3 border rounded mb-3 bg-light">
            <div class="fw-bold text-navy"><i class="bi bi-building"></i> ${don.donorName}</div>
            <div class="text-muted small"><i class="bi bi-geo-alt"></i> ${don.pickupAddress}</div>
            <div class="text-muted small"><i class="bi bi-telephone"></i> ${don.donorPhone}</div>
          </div>

          <div class="d-flex gap-2">
            ${TrackingEngine.canRequest(don) ? `
              <button class="btn btn-emerald flex-grow-1" onclick="window.bootstrap.Modal.getInstance(document.getElementById('modalFoodDetails')).hide(); window.openRequestModal('${don.id}');">
                <i class="bi bi-hand-index-thumb me-1"></i> Request This Surplus for NGO
              </button>
            ` : `
              <button class="btn btn-royal flex-grow-1" onclick="window.bootstrap.Modal.getInstance(document.getElementById('modalFoodDetails')).hide(); window.openTrackerModal('${don.id}');">
                <i class="bi bi-diagram-3 me-1"></i> View Live Tracking Stepper
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    if (window.bootstrap) {
      const modal = new window.bootstrap.Modal(document.getElementById('modalFoodDetails'));
      modal.show();
    }
  }

  openRequestModal(donationId) {
    const don = DataStore.getDonationById(donationId);
    if (!don) return;

    if (!TrackingEngine.canRequest(don)) {
      this.showToast('Notice', `This food donation cannot be requested because it is in '${don.status}' status.`);
      return;
    }

    const hiddenInput = document.getElementById('requestFoodDonationId');
    const headerTitle = document.getElementById('requestModalFoodTitle');
    const headerDetails = document.getElementById('requestModalFoodDetails');
    const servingsInput = document.getElementById('requestBeneficiaryCount');

    if (hiddenInput) hiddenInput.value = don.id;
    if (headerTitle) headerTitle.innerText = don.foodName;
    if (headerDetails) headerDetails.innerText = `${don.id} • ${don.quantity} (${don.servings} portions) from ${don.donorName}`;
    if (servingsInput) servingsInput.value = don.servings;

    if (window.bootstrap) {
      const modal = new window.bootstrap.Modal(document.getElementById('modalRequestFood'));
      modal.show();
    }
  }

  openDistributionModal(donationId) {
    const don = DataStore.getDonationById(donationId);
    if (!don) return;

    const hiddenInput = document.getElementById('distributionDonationId');
    const foodTitle = document.getElementById('distributionModalFoodTitle');
    const mealsInput = document.getElementById('distributionMealsServed');

    if (hiddenInput) hiddenInput.value = don.id;
    if (foodTitle) foodTitle.innerText = `${don.foodName} (${don.id})`;
    if (mealsInput) mealsInput.value = don.servings;

    if (window.bootstrap) {
      const modal = new window.bootstrap.Modal(document.getElementById('modalDistribution'));
      modal.show();
    }
  }

  openTrackerModal(donationId) {
    const don = DataStore.getDonationById(donationId);
    if (!don) {
      this.showToast('Search Result', `Donation ${donationId} was not found.`);
      return;
    }

    const modalBody = document.getElementById('trackerModalBody');
    if (!modalBody) return;

    const stepperHTML = TrackingEngine.renderStepperHTML(don.status);
    const auditHTML = TrackingEngine.renderAuditTimelineHTML(don);

    modalBody.innerHTML = `
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <h4 class="fw-bold text-navy mb-0">${don.foodName}</h4>
          ${TrackingEngine.getStatusBadge(don.status)}
        </div>
        <div class="text-muted small">Tracking ID: <span class="font-monospace fw-bold text-royal">${don.id}</span> • Listed by <strong>${don.donorName}</strong></div>
      </div>

      <!-- 7-Stage Visual Stepper -->
      <div class="p-3 bg-light rounded-3 mb-4">
        ${stepperHTML}
      </div>

      <!-- Route & Logistics Cards -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-6">
          <div class="p-3 border rounded-3 bg-white h-100">
            <small class="text-muted fw-bold text-uppercase d-block" style="font-size: 0.72rem;">PICKUP ORIGIN</small>
            <div class="fw-bold text-navy"><i class="bi bi-geo-alt-fill text-danger me-1"></i> ${don.donorName}</div>
            <div class="small text-secondary">${don.pickupAddress}</div>
            <div class="small text-muted mt-1"><i class="bi bi-telephone"></i> ${don.donorPhone}</div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="p-3 border rounded-3 bg-white h-100">
            <small class="text-muted fw-bold text-uppercase d-block" style="font-size: 0.72rem;">LOGISTICS & HANDLER</small>
            ${don.assignedVolunteerName ? `
              <div class="fw-bold text-navy"><i class="bi bi-bicycle text-royal me-1"></i> ${don.assignedVolunteerName}</div>
              <div class="small text-secondary">${don.assignedVolunteerVehicle || 'Eco Insulated Courier'}</div>
              <div class="small text-success mt-1"><i class="bi bi-shield-check"></i> Identity & Temperature Verified</div>
            ` : `
              <div class="text-muted small pt-1"><i class="bi bi-hourglass-split"></i> Awaiting volunteer assignment dispatch</div>
            `}
          </div>
        </div>
      </div>

      <!-- Timestamped Audit Trail -->
      <h6 class="fw-bold text-navy mb-2"><i class="bi bi-clock-history me-1"></i> Chain of Custody & Audit Log</h6>
      ${auditHTML}
    `;

    if (window.bootstrap) {
      const modal = new window.bootstrap.Modal(document.getElementById('modalTracker'));
      modal.show();
    }
  }

  showToast(title, message) {
    const toastEl = document.getElementById('liveAppToast');
    const titleEl = document.getElementById('toastTitle');
    const msgEl = document.getElementById('toastMessage');

    if (titleEl) titleEl.innerText = title;
    if (msgEl) msgEl.innerText = message;

    if (toastEl && window.bootstrap) {
      const toast = new window.bootstrap.Toast(toastEl, { delay: 4500 });
      toast.show();
    }
  }

  playNotificationSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  startCountdownTimer() {
    setInterval(() => {
      // Refresh home stats or active timer labels
      this.renderHomeStats();
    }, 60000);
  }
}

// Global exposure for in-HTML onclick handlers
const app = new SecondServeApp();
window.secondServeApp = app;
window.navigateTo = (viewId) => {
  window.location.hash = '#' + viewId;
  app.navigateTo(viewId);
};
window.openTrackerModal = (id) => app.openTrackerModal(id);
window.openRequestModal = (id) => app.openRequestModal(id);
window.openDistributionModal = (id) => app.openDistributionModal(id);
window.showNotificationToast = (title, msg) => app.showToast(title, msg);

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
