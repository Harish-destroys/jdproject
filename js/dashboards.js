/**
 * SecondServe – Dashboards Controller
 * Renders and handles interactions for all 4 user roles:
 * - Donor (Restaurant / Hotel)
 * - NGO (Charity / Shelter)
 * - Volunteer (Logistics Hero)
 * - Admin (Operations & Project Evaluation)
 */

import { DataStore } from './data.js';
import { AuthService } from './auth.js';
import { TrackingEngine } from './tracking.js';

export class DashboardController {
  // ==========================================
  // 1. DONOR DASHBOARD
  // ==========================================
  static renderDonorDashboard(container) {
    const user = AuthService.getCurrentUser();
    const donations = DataStore.getDonations().filter(d => d.donorId === user.id);
    const requests = DataStore.getRequests().filter(r => {
      const d = DataStore.getDonationById(r.donationId);
      return d && d.donorId === user.id;
    });

    const activeListings = donations.filter(d => ['Listed', 'Requested', 'Approved', 'Volunteer Assigned', 'Picked Up'].includes(d.status));
    const pendingRequests = requests.filter(r => r.status === 'Pending');
    const totalServings = donations.reduce((acc, d) => acc + (parseInt(d.servings) || 0), 0);

    container.innerHTML = `
      <div class="container-fluid px-3 px-md-4 py-4">
        <!-- Dashboard Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-primary text-white"><i class="bi bi-building"></i> Restaurant & Hotel Portal</span>
              ${user.verified ? '<span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-patch-check-fill"></i> Verified FSSAI Kitchen</span>' : '<span class="badge bg-warning-subtle text-warning">Verification Pending</span>'}
            </div>
            <h2 class="h3 fw-bold mb-0 text-navy">${user.organization || user.name}</h2>
            <small class="text-muted"><i class="bi bi-geo-alt"></i> ${user.address || '450 Grand Avenue, Financial Bay'}</small>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-royal" data-bs-toggle="modal" data-bs-target="#modalAddDonation">
              <i class="bi bi-plus-circle me-1"></i> Add Surplus Food Donation
            </button>
          </div>
        </div>

        <!-- Metric Stat Cards -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3">
            <div class="card-custom p-3 bg-white">
              <div class="text-muted small fw-semibold">Active Rescues</div>
              <div class="h2 fw-bold text-royal mb-0">${activeListings.length}</div>
              <small class="text-muted"><i class="bi bi-arrow-repeat text-sky"></i> Currently in pipeline</small>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card-custom p-3 bg-white">
              <div class="text-muted small fw-semibold">Pending NGO Requests</div>
              <div class="h2 fw-bold text-warning mb-0">${pendingRequests.length}</div>
              <small class="text-muted"><i class="bi bi-exclamation-circle text-warning"></i> Needs your review</small>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card-custom p-3 bg-white">
              <div class="text-muted small fw-semibold">Meals Rescued</div>
              <div class="h2 fw-bold text-emerald mb-0">${totalServings}</div>
              <small class="text-muted"><i class="bi bi-heart-fill text-emerald"></i> Portions donated</small>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card-custom p-3 bg-white">
              <div class="text-muted small fw-semibold">Total Listings</div>
              <div class="h2 fw-bold text-navy mb-0">${donations.length}</div>
              <small class="text-muted"><i class="bi bi-check2-all text-success"></i> 100% Zero-Waste Goal</small>
            </div>
          </div>
        </div>

        <!-- Pending NGO Requests Alert Section -->
        ${pendingRequests.length > 0 ? `
          <div class="card-custom p-3 p-md-4 mb-4 border-warning bg-warning-subtle bg-opacity-25">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h5 class="fw-bold text-navy mb-0">
                <i class="bi bi-bell-fill text-warning me-2"></i> Incoming NGO Requests Awaiting Your Approval (${pendingRequests.length})
              </h5>
            </div>
            <div class="row g-3">
              ${pendingRequests.map(req => {
                const don = DataStore.getDonationById(req.donationId);
                return `
                  <div class="col-12 col-lg-6">
                    <div class="card-custom p-3 bg-white border">
                      <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span class="badge bg-primary-subtle text-primary fw-bold">${don ? don.id : 'Rescue'}</span>
                          <h6 class="fw-bold text-navy mb-0 mt-1">${don ? don.foodName : 'Surplus Food'}</h6>
                        </div>
                        <span class="badge bg-warning text-dark"><i class="bi bi-clock"></i> Action Needed</span>
                      </div>
                      <div class="p-2 rounded bg-light small mb-3">
                        <div class="fw-semibold text-navy"><i class="bi bi-building"></i> ${req.ngoName}</div>
                        <div><i class="bi bi-people text-muted"></i> Serving: <strong>${req.beneficiaryCount} people</strong> (${req.targetCommunity})</div>
                        <div><i class="bi bi-chat-left-quote text-muted"></i> "${req.notes}"</div>
                      </div>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-emerald flex-grow-1 btn-approve-req" data-req-id="${req.id}">
                          <i class="bi bi-check-lg"></i> Approve Request
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-reject-req" data-req-id="${req.id}">
                          <i class="bi bi-x-lg"></i> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- My Food Donations Table -->
        <div class="card-custom p-3 p-md-4 bg-white">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div>
              <h5 class="fw-bold text-navy mb-0">Manage Surplus Food Donations</h5>
              <small class="text-muted">Track life-cycle status, view volunteer pickups, and edit listings</small>
            </div>
            <button class="btn btn-sm btn-outline-custom" data-bs-toggle="modal" data-bs-target="#modalAddDonation">
              <i class="bi bi-plus-lg"></i> New Listing
            </button>
          </div>

          <div class="table-responsive">
            <table class="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Food Item & ID</th>
                  <th>Quantity & Portions</th>
                  <th>Category</th>
                  <th>Prep & Expiry</th>
                  <th>Current Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${donations.map(don => `
                  <tr>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <img src="${don.image}" alt="${don.foodName}" class="rounded" style="width: 44px; height: 44px; object-fit: cover;">
                        <div>
                          <div class="fw-bold text-navy" style="font-size: 0.92rem;">${don.foodName}</div>
                          <small class="text-muted">${don.id} • ${don.dietary === 'Veg' ? '<span class="text-success">Veg</span>' : '<span class="text-danger">Non-Veg</span>'}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="fw-semibold text-navy">${don.quantity}</div>
                      <small class="text-muted">${don.servings} portions</small>
                    </td>
                    <td>
                      <span class="badge-category">${don.category}</span>
                    </td>
                    <td>
                      <div class="small fw-semibold text-navy">${don.prepTime}</div>
                      <small class="text-muted">${don.expiryDisplay}</small>
                    </td>
                    <td>
                      ${TrackingEngine.getStatusBadge(don.status)}
                    </td>
                    <td>
                      <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-primary btn-track-view" data-don-id="${don.id}" title="View Live Tracking Stepper">
                          <i class="bi bi-geo-alt"></i> Track
                        </button>
                        ${don.status === 'Listed' ? `
                          <button class="btn btn-sm btn-outline-danger btn-delete-don" data-don-id="${don.id}" title="Remove Listing">
                            <i class="bi bi-trash"></i>
                          </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Attach button listeners
    container.querySelectorAll('.btn-approve-req').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.getAttribute('data-req-id');
        try {
          DataStore.approveFoodRequest(reqId, user);
          window.showNotificationToast('Success', 'Request approved! Volunteer assigned notice triggered.');
          DashboardController.renderDonorDashboard(container);
        } catch (err) {
          window.showNotificationToast('Error', err.message);
        }
      });
    });

    container.querySelectorAll('.btn-reject-req').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.getAttribute('data-req-id');
        const reason = prompt('Please provide reason for declining (e.g. storage capacity, already packed for alternate delivery):');
        if (reason !== null) {
          DataStore.rejectFoodRequest(reqId, user, reason);
          window.showNotificationToast('Info', 'Request declined. Listing re-opened for other charities.');
          DashboardController.renderDonorDashboard(container);
        }
      });
    });

    container.querySelectorAll('.btn-track-view').forEach(btn => {
      btn.addEventListener('click', () => {
        const donId = btn.getAttribute('data-don-id');
        window.openTrackerModal(donId);
      });
    });

    container.querySelectorAll('.btn-delete-don').forEach(btn => {
      btn.addEventListener('click', () => {
        const donId = btn.getAttribute('data-don-id');
        if (confirm(`Are you sure you want to cancel food listing ${donId}?`)) {
          DataStore.deleteDonation(donId);
          window.showNotificationToast('Listing Deleted', `Food listing ${donId} was removed.`);
          DashboardController.renderDonorDashboard(container);
        }
      });
    });
  }

  // ==========================================
  // 2. NGO DASHBOARD
  // ==========================================
  static renderNgoDashboard(container) {
    const user = AuthService.getCurrentUser();
    const allDonations = DataStore.getDonations();
    const availableFood = allDonations.filter(d => d.status === 'Listed');
    const myRequests = DataStore.getRequests().filter(r => r.ngoId === user.id);
    
    // In-progress or claimed by this NGO
    const myActiveRescues = allDonations.filter(d => {
      return myRequests.some(r => r.donationId === d.id && ['Approved', 'Volunteer Assigned', 'Picked Up', 'Delivered'].includes(d.status));
    });

    const completedRescues = allDonations.filter(d => {
      return myRequests.some(r => r.donationId === d.id && d.status === 'Distribution Completed');
    });

    const totalMealsRescued = completedRescues.reduce((acc, d) => acc + (parseInt(d.servings) || 0), 0);

    container.innerHTML = `
      <div class="container-fluid px-3 px-md-4 py-4">
        <!-- Dashboard Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-teal text-white" style="background-color: var(--color-teal);"><i class="bi bi-heart-pulse-fill"></i> NGO & Shelter Portal</span>
              ${user.verified ? '<span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-patch-check-fill"></i> Verified 80G Charity</span>' : '<span class="badge bg-warning-subtle text-warning">Pending Verification</span>'}
            </div>
            <h2 class="h3 fw-bold mb-0 text-navy">${user.organization || user.name}</h2>
            <small class="text-muted"><i class="bi bi-geo-alt"></i> ${user.address || '89 Community Way, Shelter District'} • Reg: ${user.regNumber || 'NGO-80G-49204'}</small>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-emerald" onclick="window.navigateTo('available-food')">
              <i class="bi bi-search me-1"></i> Browse Available Food Catalog
            </button>
          </div>
        </div>

        <!-- Metric Stat Cards -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3">
            <div class="card-custom p-3 bg-white">
              <div class="text-muted small fw-semibold">Available for Rescue Now</div>
              <div class="h2 fw-bold text-emerald mb-0">${availableFood.length}</div>
              <small class="text-muted"><i class="bi bi-box-seam text-emerald"></i> Ready for instant claim</small>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card-custom p-3 bg-white">
              <div class="text-muted small fw-semibold">Active In-Transit Rescues</div>
              <div class="h2 fw-bold text-royal mb-0">${myActiveRescues.length}</div>
              <small class="text-muted"><i class="bi bi-truck text-royal"></i> En route to shelter</small>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card-custom p-3 bg-white">
              <div class="text-muted small fw-semibold">Meals Distributed</div>
              <div class="h2 fw-bold text-navy mb-0">${totalMealsRescued}</div>
              <small class="text-muted"><i class="bi bi-people text-navy"></i> Individuals fed</small>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card-custom p-3 bg-white">
              <div class="text-muted small fw-semibold">Total Requests Logged</div>
              <div class="h2 fw-bold text-sky mb-0">${myRequests.length}</div>
              <small class="text-muted"><i class="bi bi-file-earmark-check text-sky"></i> Coordinated rescues</small>
            </div>
          </div>
        </div>

        <!-- Action Items: Delivered Orders Awaiting Distribution Confirmation -->
        ${myActiveRescues.filter(d => d.status === 'Delivered').length > 0 ? `
          <div class="card-custom p-3 p-md-4 mb-4 border-success bg-success-subtle bg-opacity-25">
            <h5 class="fw-bold text-navy mb-2"><i class="bi bi-check-circle-fill text-success me-2"></i> Food Delivered! Complete Distribution Log</h5>
            <p class="text-muted small mb-3">The following rescues have been delivered by our volunteer. Please confirm receipt and log beneficiary numbers to complete the cycle.</p>
            <div class="row g-3">
              ${myActiveRescues.filter(d => d.status === 'Delivered').map(don => `
                <div class="col-12 col-md-6">
                  <div class="card-custom p-3 bg-white border">
                    <div class="fw-bold text-navy">${don.foodName} (${don.id})</div>
                    <div class="text-muted small mb-2">${don.quantity} from ${don.donorName}</div>
                    <button class="btn btn-emerald btn-sm w-100 btn-confirm-distribution" data-don-id="${don.id}">
                      <i class="bi bi-check2-all me-1"></i> Confirm Distribution to Community
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Active Requests & Tracking -->
        <div class="card-custom p-3 p-md-4 bg-white mb-4">
          <h5 class="fw-bold text-navy mb-3">My Food Requests & Real-Time Tracking</h5>
          <div class="table-responsive">
            <table class="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Donor Organization</th>
                  <th>Beneficiaries Target</th>
                  <th>Current Status</th>
                  <th>Volunteer Info</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${myRequests.length === 0 ? `
                  <tr><td colspan="6" class="text-center py-4 text-muted">No food requests yet. Browse available food to request your first rescue!</td></tr>
                ` : myRequests.map(req => {
                  const don = DataStore.getDonationById(req.donationId);
                  if (!don) return '';
                  return `
                    <tr>
                      <td>
                        <div class="fw-bold text-navy">${don.foodName}</div>
                        <small class="text-muted">${don.id} • ${don.quantity}</small>
                      </td>
                      <td>
                        <div class="fw-semibold text-navy">${don.donorName}</div>
                        <small class="text-muted"><i class="bi bi-geo-alt"></i> ${don.pickupAddress}</small>
                      </td>
                      <td>
                        <div class="fw-bold text-navy">${req.beneficiaryCount} people</div>
                        <small class="text-muted">${req.targetCommunity}</small>
                      </td>
                      <td>
                        ${TrackingEngine.getStatusBadge(don.status)}
                      </td>
                      <td>
                        ${don.assignedVolunteerName ? `
                          <div class="small fw-semibold text-navy"><i class="bi bi-person-check text-royal"></i> ${don.assignedVolunteerName}</div>
                          <small class="text-muted">${don.assignedVolunteerVehicle || 'Eco Courier'}</small>
                        ` : '<span class="badge bg-light text-muted border">Awaiting Dispatch</span>'}
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary btn-track-view" data-don-id="${don.id}">
                          <i class="bi bi-clock-history"></i> Track
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Available Surplus Food Quick Claim Section -->
        <div class="card-custom p-3 p-md-4 bg-white">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h5 class="fw-bold text-navy mb-0">Urgent Surplus Food Ready for Claim</h5>
            <button class="btn btn-sm btn-royal" onclick="window.navigateTo('available-food')">View Full Catalog</button>
          </div>
          <div class="row g-3">
            ${availableFood.slice(0, 4).map(don => `
              <div class="col-12 col-md-6 col-lg-3">
                <div class="card-custom h-100 d-flex flex-column border">
                  <div class="position-relative" style="height: 140px; overflow: hidden;">
                    <img src="${don.image}" alt="${don.foodName}" class="w-100 h-100" style="object-fit: cover;">
                    <span class="badge bg-dark bg-opacity-75 text-white position-absolute top-0 end-0 m-2 small">
                      <i class="bi bi-clock"></i> ${don.expiryDisplay}
                    </span>
                  </div>
                  <div class="p-3 d-flex flex-column flex-grow-1">
                    <span class="badge-category mb-1">${don.category}</span>
                    <h6 class="fw-bold text-navy mb-1" style="font-size: 0.95rem;">${don.foodName}</h6>
                    <small class="text-muted mb-2"><i class="bi bi-shop"></i> ${don.donorName}</small>
                    <div class="fw-bold text-royal mb-3 small"><i class="bi bi-pie-chart"></i> ${don.quantity} (${don.servings} portions)</div>
                    <button class="btn btn-emerald btn-sm mt-auto btn-request-food-modal" data-don-id="${don.id}">
                      <i class="bi bi-hand-index-thumb"></i> Request Surplus
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Attach listeners
    container.querySelectorAll('.btn-track-view').forEach(btn => {
      btn.addEventListener('click', () => {
        window.openTrackerModal(btn.getAttribute('data-don-id'));
      });
    });

    container.querySelectorAll('.btn-request-food-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        window.openRequestModal(btn.getAttribute('data-don-id'));
      });
    });

    container.querySelectorAll('.btn-confirm-distribution').forEach(btn => {
      btn.addEventListener('click', () => {
        window.openDistributionModal(btn.getAttribute('data-don-id'));
      });
    });
  }

  // ==========================================
  // 3. VOLUNTEER DASHBOARD
  // ==========================================
  static renderVolunteerDashboard(container) {
    const user = AuthService.getCurrentUser();
    const allDonations = DataStore.getDonations();

    // Pickups assigned to this volunteer
    const myAssignedTasks = allDonations.filter(d => {
      return d.assignedVolunteerId === user.id && ['Volunteer Assigned', 'Picked Up'].includes(d.status);
    });

    // Unassigned rescues waiting for a volunteer!
    const availableForPickup = allDonations.filter(d => d.status === 'Approved' && !d.assignedVolunteerId);

    // Completed history
    const completedTasks = allDonations.filter(d => {
      return d.assignedVolunteerId === user.id && ['Delivered', 'Distribution Completed'].includes(d.status);
    });

    const totalMealsRescued = completedTasks.reduce((acc, d) => acc + (parseInt(d.servings) || 0), 0);

    container.innerHTML = `
      <div class="container-fluid px-3 px-md-4 py-4">
        <!-- Dashboard Header -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-primary text-white"><i class="bi bi-bicycle"></i> Volunteer Logistics Portal</span>
              <span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-star-fill"></i> ${user.rating || 4.9} Rating • Eco Courier</span>
            </div>
            <h2 class="h3 fw-bold mb-0 text-navy">${user.name}</h2>
            <small class="text-muted"><i class="bi bi-truck"></i> Vehicle: ${user.vehicleType || 'Eco Insulated Carrier'} • Phone: ${user.phone}</small>
          </div>
          <div class="d-flex gap-2">
            <span class="badge bg-emerald text-navy p-2 px-3 fw-bold d-flex align-items-center gap-1">
              <i class="bi bi-award-fill"></i> ${completedTasks.length + 42} Deliveries Completed
            </span>
          </div>
        </div>

        <!-- Metrics -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-3">
            <div class="card-custom p-3 bg-white">
              <div class="text-muted small fw-semibold">Active Tasks In-Hand</div>
              <div class="h2 fw-bold text-royal mb-0">${myAssignedTasks.length}</div>
              <small class="text-muted"><i class="bi bi-geo-alt text-royal"></i> Active delivery routes</small>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card-custom p-3 bg-white">
              <div class="text-muted small fw-semibold">Unassigned Rescue Runs</div>
              <div class="h2 fw-bold text-warning mb-0">${availableForPickup.length}</div>
              <small class="text-muted"><i class="bi bi-lightning-charge text-warning"></i> Ready for pickup</small>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card-custom p-3 bg-white">
              <div class="text-muted small fw-semibold">Meals Delivered</div>
              <div class="h2 fw-bold text-emerald mb-0">${totalMealsRescued}</div>
              <small class="text-muted"><i class="bi bi-heart-fill text-emerald"></i> Delivered to shelters</small>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card-custom p-3 bg-white">
              <div class="text-muted small fw-semibold">Carbon Emissions Saved</div>
              <div class="h2 fw-bold text-navy mb-0">${Math.round(totalMealsRescued * 0.9)} kg</div>
              <small class="text-muted"><i class="bi bi-tree-fill text-success"></i> Green transport</small>
            </div>
          </div>
        </div>

        <!-- Current Active Task Card -->
        ${myAssignedTasks.length > 0 ? `
          <div class="card-custom p-3 p-md-4 mb-4 border-primary bg-primary-subtle bg-opacity-25">
            <h5 class="fw-bold text-navy mb-3"><i class="bi bi-navigation-fill text-royal me-2"></i> Current Active Pickup & Delivery Assignment</h5>
            <div class="row g-3">
              ${myAssignedTasks.map(don => `
                <div class="col-12 col-lg-6">
                  <div class="card-custom p-3 bg-white border">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="badge bg-royal text-white">${don.id}</span>
                      ${TrackingEngine.getStatusBadge(don.status)}
                    </div>
                    <h5 class="fw-bold text-navy mb-1">${don.foodName}</h5>
                    <div class="text-muted small mb-3">${don.quantity} • ${don.storageCondition}</div>

                    <!-- Route Details -->
                    <div class="p-3 bg-light rounded mb-3">
                      <div class="mb-2">
                        <small class="text-muted text-uppercase fw-bold" style="font-size: 0.72rem;">STEP 1: PICKUP ORIGIN</small>
                        <div class="fw-bold text-navy"><i class="bi bi-geo-alt-fill text-danger me-1"></i> ${don.donorName}</div>
                        <div class="small text-muted">${don.pickupAddress} (Tel: ${don.donorPhone})</div>
                      </div>
                      <div class="border-top pt-2">
                        <small class="text-muted text-uppercase fw-bold" style="font-size: 0.72rem;">STEP 2: DROP-OFF DESTINATION</small>
                        <div class="fw-bold text-navy"><i class="bi bi-flag-fill text-success me-1"></i> Hope & Nutrition Shelter / Community Receiving</div>
                        <div class="small text-muted">89 Community Way, Shelter District</div>
                      </div>
                    </div>

                    <!-- Volunteer Action Stepper -->
                    <div class="d-flex gap-2">
                      ${don.status === 'Volunteer Assigned' ? `
                        <button class="btn btn-royal flex-grow-1 btn-pickup-action" data-don-id="${don.id}">
                          <i class="bi bi-box-arrow-in-down me-1"></i> Confirm Food Picked Up from Donor
                        </button>
                      ` : `
                        <button class="btn btn-emerald flex-grow-1 btn-deliver-action" data-don-id="${don.id}">
                          <i class="bi bi-check2-circle me-1"></i> Confirm Delivered to NGO
                        </button>
                      `}
                      <button class="btn btn-outline-custom btn-track-view" data-don-id="${don.id}">
                        <i class="bi bi-clock-history"></i>
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Available Rescues Needing Volunteers -->
        <div class="card-custom p-3 p-md-4 bg-white mb-4">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 class="fw-bold text-navy mb-0">Available Rescues Awaiting Transport</h5>
              <small class="text-muted">Donations approved by restaurants waiting for an eco-courier</small>
            </div>
            <span class="badge bg-warning-subtle text-warning border border-warning">${availableForPickup.length} open runs</span>
          </div>

          ${availableForPickup.length === 0 ? `
            <div class="text-center py-4 text-muted">
              <i class="bi bi-check2-circle text-success fs-1 d-block mb-2"></i>
              Great job! All approved food rescue runs currently have couriers assigned. Check back shortly.
            </div>
          ` : `
            <div class="row g-3">
              ${availableForPickup.map(don => `
                <div class="col-12 col-md-6">
                  <div class="card-custom p-3 border">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <span class="badge bg-primary-subtle text-primary">${don.id}</span>
                      <span class="badge bg-danger text-white"><i class="bi bi-alarm"></i> ${don.expiryDisplay}</span>
                    </div>
                    <h6 class="fw-bold text-navy mb-1">${don.foodName}</h6>
                    <div class="text-muted small mb-2"><i class="bi bi-building"></i> ${don.donorName} • ${don.quantity}</div>
                    <div class="small p-2 bg-light rounded mb-3">
                      <i class="bi bi-geo-alt text-danger"></i> <strong>Pickup:</strong> ${don.pickupAddress}
                    </div>
                    <button class="btn btn-emerald w-100 btn-accept-task" data-don-id="${don.id}">
                      <i class="bi bi-hand-thumbs-up me-1"></i> Accept This Pickup Run
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Completed Runs History -->
        <div class="card-custom p-3 p-md-4 bg-white">
          <h5 class="fw-bold text-navy mb-3">My Completed Rescue Runs</h5>
          <div class="table-responsive">
            <table class="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Rescue ID & Item</th>
                  <th>Quantity Rescued</th>
                  <th>Origin / Donor</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${completedTasks.length === 0 ? `
                  <tr><td colspan="5" class="text-center py-4 text-muted">No completed deliveries recorded in this session.</td></tr>
                ` : completedTasks.map(don => `
                  <tr>
                    <td>
                      <div class="fw-bold text-navy">${don.foodName}</div>
                      <small class="text-muted">${don.id}</small>
                    </td>
                    <td>${don.quantity}</td>
                    <td>${don.donorName}</td>
                    <td>${TrackingEngine.getStatusBadge(don.status)}</td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary btn-track-view" data-don-id="${don.id}">
                        <i class="bi bi-clock-history"></i> Log
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Listeners
    container.querySelectorAll('.btn-accept-task').forEach(btn => {
      btn.addEventListener('click', () => {
        const donId = btn.getAttribute('data-don-id');
        try {
          DataStore.assignVolunteer(donId, user);
          window.showNotificationToast('Task Accepted', `You have accepted rescue run for ${donId}. Safe travels!`);
          DashboardController.renderVolunteerDashboard(container);
        } catch (e) {
          window.showNotificationToast('Error', e.message);
        }
      });
    });

    container.querySelectorAll('.btn-pickup-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const donId = btn.getAttribute('data-don-id');
        const notes = prompt('Enter condition notes (e.g. Temperature checked 70°C, clean packaging):', 'Food temperature and hygienic seal verified. Loaded into insulated cargo container.');
        if (notes !== null) {
          DataStore.markFoodPickedUp(donId, user, notes);
          window.showNotificationToast('Status Updated', 'Marked as Picked Up! Delivery route navigation active.');
          DashboardController.renderVolunteerDashboard(container);
        }
      });
    });

    container.querySelectorAll('.btn-deliver-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const donId = btn.getAttribute('data-don-id');
        const notes = prompt('Enter drop-off notes (e.g. Received by shelter manager):', 'Delivered safely to shelter cold storage. Handed over to kitchen coordinator.');
        if (notes !== null) {
          DataStore.markFoodDelivered(donId, user, notes);
          window.showNotificationToast('Delivery Complete', 'Food successfully delivered to NGO!');
          DashboardController.renderVolunteerDashboard(container);
        }
      });
    });

    container.querySelectorAll('.btn-track-view').forEach(btn => {
      btn.addEventListener('click', () => {
        window.openTrackerModal(btn.getAttribute('data-don-id'));
      });
    });
  }

  // ==========================================
  // 4. ADMIN DASHBOARD
  // ==========================================
  static renderAdminDashboard(container) {
    const metrics = DataStore.getPlatformMetrics();
    const users = DataStore.getUsers();
    const donations = DataStore.getDonations();
    const requests = DataStore.getRequests();

    container.innerHTML = `
      <div class="container-fluid px-3 px-md-4 py-4">
        <!-- Top Operations Bar -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-danger text-white"><i class="bi bi-shield-lock-fill"></i> Central System Administration</span>
              <span class="badge bg-dark text-white"><i class="bi bi-mortarboard-fill"></i> College Project Demo Mode Active</span>
            </div>
            <h2 class="h3 fw-bold mb-0 text-navy">SecondServe HQ Command Center</h2>
            <small class="text-muted">Master oversight of Donors, NGOs, Volunteers, Lifecycle Trackers, and Database Engine</small>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-royal" data-bs-toggle="modal" data-bs-target="#modalBackendViewer">
              <i class="bi bi-filetype-java me-1"></i> View Java Spring Boot & MySQL Schema
            </button>
            <button class="btn btn-outline-danger" id="btnResetDatabase">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Demo Data
            </button>
          </div>
        </div>

        <!-- Global Metrics -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-md-4 col-lg-2">
            <div class="card-custom p-3 bg-white text-center">
              <div class="text-muted small fw-semibold">Total Donors</div>
              <div class="h3 fw-bold text-navy mb-0">${metrics.donorsCount}</div>
              <small class="text-success"><i class="bi bi-shop"></i> Kitchens</small>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <div class="card-custom p-3 bg-white text-center">
              <div class="text-muted small fw-semibold">Partner NGOs</div>
              <div class="h3 fw-bold text-royal mb-0">${metrics.ngosCount}</div>
              <small class="text-royal"><i class="bi bi-building"></i> Charities</small>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <div class="card-custom p-3 bg-white text-center">
              <div class="text-muted small fw-semibold">Active Volunteers</div>
              <div class="h3 fw-bold text-emerald mb-0">${metrics.volunteersCount}</div>
              <small class="text-emerald"><i class="bi bi-bicycle"></i> Couriers</small>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <div class="card-custom p-3 bg-white text-center">
              <div class="text-muted small fw-semibold">Rescued Meals</div>
              <div class="h3 fw-bold text-vibrant mb-0" style="color: var(--color-teal);">${metrics.totalPortions}</div>
              <small class="text-muted"><i class="bi bi-heart"></i> Portions</small>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <div class="card-custom p-3 bg-white text-center">
              <div class="text-muted small fw-semibold">Food Rescued</div>
              <div class="h3 fw-bold text-sky mb-0">${metrics.kgSaved} kg</div>
              <small class="text-sky"><i class="bi bi-box"></i> Weight</small>
            </div>
          </div>
          <div class="col-6 col-md-4 col-lg-2">
            <div class="card-custom p-3 bg-white text-center">
              <div class="text-muted small fw-semibold">CO2 Prevented</div>
              <div class="h3 fw-bold text-success mb-0">${metrics.co2Saved} kg</div>
              <small class="text-success"><i class="bi bi-tree"></i> Offset</small>
            </div>
          </div>
        </div>

        <!-- User Verification & Role Management -->
        <div class="card-custom p-3 p-md-4 bg-white mb-4">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 class="fw-bold text-navy mb-0">Platform User Management & Verification</h5>
              <small class="text-muted">Verify food safety compliance for restaurants and legal charity registration for NGOs</small>
            </div>
            <span class="badge bg-light text-dark border">${users.length} Registered Accounts</span>
          </div>
          <div class="table-responsive">
            <table class="table table-custom align-middle">
              <thead>
                <tr>
                  <th>User / Organization</th>
                  <th>Role</th>
                  <th>License / Reg No</th>
                  <th>Contact Details</th>
                  <th>Verification Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <img src="${u.avatar}" class="rounded-circle" style="width: 36px; height: 36px; object-fit: cover;">
                        <div>
                          <div class="fw-bold text-navy">${u.name}</div>
                          <small class="text-muted">${u.organization || 'Individual'}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge ${u.role === 'Donor' ? 'bg-primary' : u.role === 'NGO' ? 'bg-success' : u.role === 'Volunteer' ? 'bg-info text-dark' : 'bg-dark'}">
                        ${u.role}
                      </span>
                    </td>
                    <td>
                      <small class="font-monospace text-muted">${u.licenseNumber || u.regNumber || u.vehicleType || 'System Root'}</small>
                    </td>
                    <td>
                      <div class="small text-navy">${u.email}</div>
                      <small class="text-muted">${u.phone}</small>
                    </td>
                    <td>
                      ${u.verified ? `
                        <span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-patch-check-fill"></i> Verified</span>
                      ` : `
                        <span class="badge bg-warning-subtle text-warning border border-warning"><i class="bi bi-clock-history"></i> Unverified</span>
                      `}
                    </td>
                    <td>
                      <button class="btn btn-sm ${u.verified ? 'btn-outline-secondary' : 'btn-emerald'} btn-toggle-verify" data-user-id="${u.id}">
                        ${u.verified ? 'Revoke Verification' : '<i class="bi bi-check-lg"></i> Verify Account'}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Master Donations & Real-Time Tracking Overview -->
        <div class="card-custom p-3 p-md-4 bg-white mb-4">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h5 class="fw-bold text-navy mb-0">Master Donations Pipeline Audit</h5>
              <small class="text-muted">Live audit across all 7 statuses with real-time override controls</small>
            </div>
            <span class="badge bg-light text-dark border">${donations.length} total entries</span>
          </div>
          <div class="table-responsive">
            <table class="table table-custom align-middle">
              <thead>
                <tr>
                  <th>Rescue ID</th>
                  <th>Food Title</th>
                  <th>Donor</th>
                  <th>Quantity</th>
                  <th>Lifecycle Status</th>
                  <th>Audit Stepper</th>
                </tr>
              </thead>
              <tbody>
                ${donations.map(don => `
                  <tr>
                    <td><span class="fw-bold font-monospace text-royal">${don.id}</span></td>
                    <td>
                      <div class="fw-bold text-navy">${don.foodName}</div>
                      <small class="text-muted">${don.category} • ${don.dietary}</small>
                    </td>
                    <td>
                      <div class="small fw-semibold text-navy">${don.donorName}</div>
                      <small class="text-muted">${don.donorPhone}</small>
                    </td>
                    <td>${don.quantity}</td>
                    <td>${TrackingEngine.getStatusBadge(don.status)}</td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary btn-track-view" data-don-id="${don.id}">
                        <i class="bi bi-diagram-3"></i> Full Stepper Audit
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Listeners
    container.querySelectorAll('.btn-toggle-verify').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.getAttribute('data-user-id');
        DataStore.toggleUserVerification(userId);
        window.showNotificationToast('Verification Updated', 'User verification state changed.');
        DashboardController.renderAdminDashboard(container);
      });
    });

    container.querySelectorAll('.btn-track-view').forEach(btn => {
      btn.addEventListener('click', () => {
        window.openTrackerModal(btn.getAttribute('data-don-id'));
      });
    });

    const resetBtn = container.querySelector('#btnResetDatabase');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all mock database tables to their original sample seed data? This will reset all new entries.')) {
          DataStore.resetToDefault();
          window.showNotificationToast('Database Reset', 'All database tables restored to initial seed state.');
          DashboardController.renderAdminDashboard(container);
        }
      });
    }
  }
}
