/**
 * SecondServe – Donation Lifecycle Tracking Engine
 * Enforces the strict workflow:
 * Listed → Requested → Approved → Volunteer Assigned → Picked Up → Delivered → Distribution Completed
 */

import { DataStore } from './data.js';

export const TRACKING_STEPS = [
  { key: 'Listed', label: 'Food Listed', icon: 'bi-box-seam', desc: 'Surplus food posted by Donor' },
  { key: 'Requested', label: 'NGO Requested', icon: 'bi-hand-index-thumb', desc: 'NGO requested the surplus' },
  { key: 'Approved', label: 'Donor Approved', icon: 'bi-check2-circle', desc: 'Donor accepted NGO request' },
  { key: 'Volunteer Assigned', label: 'Volunteer Assigned', icon: 'bi-bicycle', desc: 'Courier accepted pickup route' },
  { key: 'Picked Up', label: 'Food Picked Up', icon: 'bi-truck', desc: 'Collected & in transit' },
  { key: 'Delivered', label: 'Delivered to NGO', icon: 'bi-geo-alt', desc: 'Received at destination' },
  { key: 'Distribution Completed', label: 'Meals Served', icon: 'bi-heart-fill', desc: 'Distributed to community' }
];

export class TrackingEngine {
  static getStepIndex(status) {
    return TRACKING_STEPS.findIndex(s => s.key === status);
  }

  static getStatusBadge(status) {
    const map = {
      'Listed': 'badge-status-listed',
      'Requested': 'badge-status-requested',
      'Approved': 'badge-status-approved',
      'Volunteer Assigned': 'badge-status-volunteer',
      'Picked Up': 'badge-status-pickedup',
      'Delivered': 'badge-status-delivered',
      'Distribution Completed': 'badge-status-completed'
    };
    const cls = map[status] || 'badge-status-listed';
    return `<span class="badge-status ${cls}"><i class="bi ${this.getIcon(status)}"></i> ${status}</span>`;
  }

  static getIcon(status) {
    const step = TRACKING_STEPS.find(s => s.key === status);
    return step ? step.icon : 'bi-circle';
  }

  /**
   * Generates interactive HTML stepper showing all 7 stages
   */
  static renderStepperHTML(currentStatus) {
    const currentIndex = this.getStepIndex(currentStatus);
    const progressPercent = currentIndex <= 0 ? 0 : Math.min(100, (currentIndex / (TRACKING_STEPS.length - 1)) * 100);

    let html = `
      <div class="tracking-stepper">
        <div class="tracking-stepper-progress" style="width: ${progressPercent}%;"></div>
    `;

    TRACKING_STEPS.forEach((step, idx) => {
      let stateClass = '';
      if (idx < currentIndex) {
        stateClass = 'completed';
      } else if (idx === currentIndex) {
        stateClass = 'active';
      }

      html += `
        <div class="step-node ${stateClass}">
          <div class="step-circle">
            <i class="bi ${idx < currentIndex ? 'bi-check-lg' : step.icon}"></i>
          </div>
          <div class="step-title">${step.label}</div>
        </div>
      `;
    });

    html += `</div>`;
    return html;
  }

  /**
   * Generates detailed audit timeline HTML with actors and timestamps
   */
  static renderAuditTimelineHTML(donation) {
    if (!donation.history || donation.history.length === 0) {
      return '<p class="text-muted small">No tracking events recorded yet.</p>';
    }

    let html = '<div class="timeline-container ps-3 border-start border-2 border-primary-subtle my-3">';
    donation.history.slice().reverse().forEach((event, idx) => {
      const date = new Date(event.timestamp);
      const formattedDate = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' +
                            date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      
      html += `
        <div class="timeline-item mb-3 position-relative">
          <div class="d-flex align-items-center gap-2">
            <span class="badge ${idx === 0 ? 'bg-primary' : 'bg-secondary'} rounded-pill" style="font-size: 0.72rem;">
              ${event.status}
            </span>
            <small class="text-muted" style="font-size: 0.76rem;">${formattedDate}</small>
          </div>
          <div class="fw-bold mt-1 text-navy" style="font-size: 0.88rem;">
            ${event.actorName} <span class="badge bg-light text-dark border ms-1" style="font-size: 0.7rem;">${event.actorRole}</span>
          </div>
          <div class="text-secondary small mt-0.5">${event.notes}</div>
        </div>
      `;
    });
    html += '</div>';
    return html;
  }

  /**
   * Verifies if this donation can be requested by an NGO
   */
  static canRequest(donation) {
    if (donation.status !== 'Listed') return false;
    const expiry = new Date(donation.availableUntil);
    if (expiry < new Date()) return false;
    return true;
  }
}
