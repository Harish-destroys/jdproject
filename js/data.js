/**
 * SecondServe – Data Store & LocalStorage Persistence
 * Manages database entities: Users, Donors, NGOs, Volunteers, Food Donations,
 * Food Requests, Volunteer Assignments, Tracking Logs, Notifications, and Feedback.
 */

const STORAGE_KEYS = {
  DONATIONS: 'secondserve_donations_v1',
  REQUESTS: 'secondserve_requests_v1',
  USERS: 'secondserve_users_v1',
  ASSIGNMENTS: 'secondserve_assignments_v1',
  NOTIFICATIONS: 'secondserve_notifications_v1',
  FEEDBACK: 'secondserve_feedback_v1',
  CURRENT_USER: 'secondserve_current_user_v1'
};

// Realistic Seed Users
const INITIAL_USERS = [
  {
    id: 'usr-admin-1',
    name: 'Harish Solaiyappan',
    email: 'admin@secondserve.org',
    password: 'password123',
    role: 'Admin',
    organization: 'SecondServe HQ Central Operations',
    phone: '+1 (555) 019-2831',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr-donor-1',
    name: 'Chef Marcus Sterling',
    email: 'donor@grandhyatt.com',
    password: 'password123',
    role: 'Donor',
    donorType: 'Hotel & Convention Center',
    organization: 'The Grand Hyatt Ballroom & Kitchens',
    licenseNumber: 'FSSAI-100293847291',
    phone: '+1 (555) 234-8901',
    address: '450 Grand Avenue, Financial Bay, Suite 100',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr-donor-2',
    name: 'Elena Rostova',
    email: 'elena@artisanbakes.com',
    password: 'password123',
    role: 'Donor',
    donorType: 'Bakery & Cafe',
    organization: 'Artisan Heritage Boulangerie',
    licenseNumber: 'FSSAI-100984712093',
    phone: '+1 (555) 345-6789',
    address: '128 Baker Street, Old Quarter',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr-ngo-1',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah@hopefeeding.org',
    password: 'password123',
    role: 'NGO',
    organization: 'Hope & Nutrition Foundation',
    regNumber: 'NGO-80G-49204/2021',
    phone: '+1 (555) 876-5432',
    address: '89 Community Way, Shelter District',
    beneficiariesServed: 42000,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr-ngo-2',
    name: 'Father David Morales',
    email: 'david@citymealsrescue.org',
    password: 'password123',
    role: 'NGO',
    organization: 'City Meals Relief Society',
    regNumber: 'NGO-80G-99381/2019',
    phone: '+1 (555) 432-1098',
    address: '312 Harbor Boulevard, Eastside Outreach',
    beneficiariesServed: 28500,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr-vol-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@volunteer.net',
    password: 'password123',
    role: 'Volunteer',
    organization: 'Green Wheels Eco Logistics',
    vehicleType: 'Refrigerated Cargo Van (Clean EV)',
    phone: '+1 (555) 789-0123',
    rating: 4.95,
    deliveriesCount: 142,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  },
  {
    id: 'usr-vol-2',
    name: 'Priya Sharma',
    email: 'priya.s@volunteer.net',
    password: 'password123',
    role: 'Volunteer',
    organization: 'Campus Rescue Brigade',
    vehicleType: 'Motorcycle with Insulated Carrier Bags',
    phone: '+1 (555) 890-1234',
    rating: 4.88,
    deliveriesCount: 78,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  }
];

// Helper to calculate future/past hours relative to right now
function getRelativeTime(hoursOffset) {
  const date = new Date(Date.now() + hoursOffset * 60 * 60 * 1000);
  return date.toISOString();
}

function formatDisplayTime(hoursOffset) {
  const date = new Date(Date.now() + hoursOffset * 60 * 60 * 1000);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' +
    date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// Initial Food Donations
const INITIAL_DONATIONS = [
  {
    id: 'SEC-1001',
    foodName: 'Executive Banquet Basmati Pilaf & Paneer Curry',
    category: 'Cooked Meals',
    dietary: 'Veg',
    quantity: '65 portions (~28 kg)',
    servings: 65,
    donorId: 'usr-donor-1',
    donorName: 'The Grand Hyatt Ballroom & Kitchens',
    pickupAddress: '450 Grand Avenue, Loading Dock B, Financial Bay',
    donorPhone: '+1 (555) 234-8901',
    prepTime: 'Today, 2:00 PM',
    availableUntil: getRelativeTime(4),
    expiryDisplay: 'In 4 hours (Tonight 8:30 PM)',
    storageCondition: 'Hot Insulated Containers (Maintained above 68°C)',
    foodSafetyInfo: 'Prepared in HACCP & FSSAI certified five-star kitchen. Untouched buffet surplus. Zero cross-contamination.',
    allergens: 'Contains Dairy (Paneer/Butter), Gluten-Free, Nut-Free',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    status: 'Listed',
    urgency: 'High',
    currentRequestId: null,
    assignedVolunteerId: null,
    history: [
      {
        status: 'Listed',
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        actorName: 'Chef Marcus Sterling',
        actorRole: 'Donor',
        notes: 'Excess prepared for corporate tech summit luncheon. Packed in sanitized stainless warming vessels.'
      }
    ]
  },
  {
    id: 'SEC-1002',
    foodName: 'Artisan Sourdough Loaves & Croissants Assortment',
    category: 'Bakery',
    dietary: 'Veg',
    quantity: '40 Loaves & 55 Pastries',
    servings: 95,
    donorId: 'usr-donor-2',
    donorName: 'Artisan Heritage Boulangerie',
    pickupAddress: '128 Baker Street, Old Quarter Side Entrance',
    donorPhone: '+1 (555) 345-6789',
    prepTime: 'Today, 6:30 AM',
    availableUntil: getRelativeTime(8),
    expiryDisplay: 'In 8 hours (Midnight)',
    storageCondition: 'Dry, Ambient Temperature in Food-Grade Bakery Crates',
    foodSafetyInfo: 'Freshly baked today at dawn. No artificial preservatives. Sealed in biodegradable greaseproof wraps.',
    allergens: 'Contains Wheat/Gluten, Butter/Eggs in croissants',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    status: 'Requested',
    urgency: 'Medium',
    currentRequestId: 'REQ-501',
    assignedVolunteerId: null,
    history: [
      {
        status: 'Listed',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        actorName: 'Elena Rostova',
        actorRole: 'Donor',
        notes: 'End of morning batch surplus available for distribution.'
      },
      {
        status: 'Requested',
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        actorName: 'Dr. Sarah Jenkins',
        actorRole: 'NGO',
        notes: 'Requested for Hope Children Shelter breakfast & evening shelter snacks.'
      }
    ]
  },
  {
    id: 'SEC-1003',
    foodName: 'Grilled Herb Lemon Chicken & Roasted Medley',
    category: 'Cooked Meals',
    dietary: 'Non-Veg',
    quantity: '50 portions (~22 kg)',
    servings: 50,
    donorId: 'usr-donor-1',
    donorName: 'The Grand Hyatt Ballroom & Kitchens',
    pickupAddress: '450 Grand Avenue, Loading Dock B, Financial Bay',
    donorPhone: '+1 (555) 234-8901',
    prepTime: 'Today, 1:30 PM',
    availableUntil: getRelativeTime(3),
    expiryDisplay: 'In 3 hours (Urgent Rescue)',
    storageCondition: 'Insulated Hot Box (>65°C)',
    foodSafetyInfo: 'Internal temperature verified at 74°C before packaging. Packed immediately post-service.',
    allergens: 'Contains Garlic/Herbs, Dairy-Free, Gluten-Free',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    status: 'Approved',
    urgency: 'High',
    currentRequestId: 'REQ-502',
    assignedVolunteerId: null,
    history: [
      {
        status: 'Listed',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        actorName: 'Chef Marcus Sterling',
        actorRole: 'Donor',
        notes: 'Unserved heated portions from luncheon buffet.'
      },
      {
        status: 'Requested',
        timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
        actorName: 'Father David Morales',
        actorRole: 'NGO',
        notes: 'Requested for Harbor Homeless Community Kitchen Dinner.'
      },
      {
        status: 'Approved',
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        actorName: 'Chef Marcus Sterling',
        actorRole: 'Donor',
        notes: 'Approved! Ready at Dock B for volunteer collection.'
      }
    ]
  },
  {
    id: 'SEC-1004',
    foodName: 'Organic Hydroponic Greens, Tomatoes & Citrus Crates',
    category: 'Fresh Produce',
    dietary: 'Vegan',
    quantity: '18 Crates (~65 kg)',
    servings: 180,
    donorId: 'usr-donor-1',
    donorName: 'The Grand Hyatt Ballroom & Kitchens',
    pickupAddress: '450 Grand Avenue, Cold Store 3',
    donorPhone: '+1 (555) 234-8901',
    prepTime: 'Harvested Yesterday',
    availableUntil: getRelativeTime(24),
    expiryDisplay: 'In 24 hours (Fresh)',
    storageCondition: 'Refrigerated Storage (4°C - 6°C)',
    foodSafetyInfo: 'Washed and sanitized whole produce from supplier over-order. Firm texture, excellent freshness.',
    allergens: 'None',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    status: 'Volunteer Assigned',
    urgency: 'Low',
    currentRequestId: 'REQ-503',
    assignedVolunteerId: 'usr-vol-1',
    history: [
      {
        status: 'Listed',
        timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
        actorName: 'Chef Marcus Sterling',
        actorRole: 'Donor',
        notes: 'Surplus organic produce boxes.'
      },
      {
        status: 'Requested',
        timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
        actorName: 'Dr. Sarah Jenkins',
        actorRole: 'NGO',
        notes: 'Hope Foundation communal kitchen will process into community stews.'
      },
      {
        status: 'Approved',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        actorName: 'Chef Marcus Sterling',
        actorRole: 'Donor',
        notes: 'Approval confirmed.'
      },
      {
        status: 'Volunteer Assigned',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        actorName: 'Alex Rivera',
        actorRole: 'Volunteer',
        notes: 'Alex accepted assignment with refrigerated EV van. ETA 20 mins.'
      }
    ]
  },
  {
    id: 'SEC-1005',
    foodName: 'Wholesome Lentil Dal, Steamed Rice & Roti Packs',
    category: 'Cooked Meals',
    dietary: 'Vegan',
    quantity: '120 Packed Meal Boxes',
    servings: 120,
    donorId: 'usr-donor-1',
    donorName: 'The Grand Hyatt Ballroom & Kitchens',
    pickupAddress: '450 Grand Avenue, Loading Dock B',
    donorPhone: '+1 (555) 234-8901',
    prepTime: 'Today, 11:00 AM',
    availableUntil: getRelativeTime(1),
    expiryDisplay: 'In 1 hour (Critical)',
    storageCondition: 'Hot Insulated Catering Boxes (>70°C)',
    foodSafetyInfo: 'Packed in eco-friendly meal trays with tamper evident labels.',
    allergens: 'Gluten in Roti, Nut-Free',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    status: 'Picked Up',
    urgency: 'Critical',
    currentRequestId: 'REQ-504',
    assignedVolunteerId: 'usr-vol-2',
    history: [
      {
        status: 'Listed',
        timestamp: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
        actorName: 'Chef Marcus Sterling',
        actorRole: 'Donor',
        notes: 'Packed boxed lunches from cancelled seminar.'
      },
      {
        status: 'Requested',
        timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
        actorName: 'Father David Morales',
        actorRole: 'NGO',
        notes: 'City Meals team requested.'
      },
      {
        status: 'Approved',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        actorName: 'Chef Marcus Sterling',
        actorRole: 'Donor',
        notes: 'Approved.'
      },
      {
        status: 'Volunteer Assigned',
        timestamp: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
        actorName: 'Priya Sharma',
        actorRole: 'Volunteer',
        notes: 'Priya Sharma dispatched.'
      },
      {
        status: 'Picked Up',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        actorName: 'Priya Sharma',
        actorRole: 'Volunteer',
        notes: 'Collected 120 meal boxes from Chef Marcus. En route to City Meals shelter (ETA 15 min).'
      }
    ]
  },
  {
    id: 'SEC-1006',
    foodName: 'Greek Yogurt Parfaits & Chilled Dairy Fruit Beverages',
    category: 'Dairy & Packaged',
    dietary: 'Veg',
    quantity: '85 Cups & 40 Bottles',
    servings: 125,
    donorId: 'usr-donor-2',
    donorName: 'Artisan Heritage Boulangerie',
    pickupAddress: '128 Baker Street',
    donorPhone: '+1 (555) 345-6789',
    prepTime: 'Today, 8:00 AM',
    availableUntil: getRelativeTime(14),
    expiryDisplay: 'In 14 hours',
    storageCondition: 'Refrigerated Cold Case (<4°C)',
    foodSafetyInfo: 'Factory sealed lids. Maintained continuously in commercial cold display.',
    allergens: 'Contains Dairy (Milk/Yogurt), Honey',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
    status: 'Delivered',
    urgency: 'Low',
    currentRequestId: 'REQ-505',
    assignedVolunteerId: 'usr-vol-1',
    history: [
      {
        status: 'Listed',
        timestamp: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
        actorName: 'Elena Rostova',
        actorRole: 'Donor',
        notes: 'Overstocked artisanal yogurts.'
      },
      {
        status: 'Requested',
        timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
        actorName: 'Dr. Sarah Jenkins',
        actorRole: 'NGO',
        notes: 'Requested for children morning nutritional supplement.'
      },
      {
        status: 'Approved',
        timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
        actorName: 'Elena Rostova',
        actorRole: 'Donor',
        notes: 'Confirmed.'
      },
      {
        status: 'Volunteer Assigned',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        actorName: 'Alex Rivera',
        actorRole: 'Volunteer',
        notes: 'Alex assigned.'
      },
      {
        status: 'Picked Up',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        actorName: 'Alex Rivera',
        actorRole: 'Volunteer',
        notes: 'Picked up cold crates.'
      },
      {
        status: 'Delivered',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        actorName: 'Alex Rivera',
        actorRole: 'Volunteer',
        notes: 'Safely dropped off at Hope Foundation receiving fridge. Awaiting final distribution confirmation.'
      }
    ]
  },
  {
    id: 'SEC-1007',
    foodName: 'Catering Gourmet Sandwiches & Fresh Fruit Platters',
    category: 'Cooked Meals',
    dietary: 'Veg',
    quantity: '90 Sandwiches & 6 Platters',
    servings: 110,
    donorId: 'usr-donor-1',
    donorName: 'The Grand Hyatt Ballroom & Kitchens',
    pickupAddress: '450 Grand Avenue',
    donorPhone: '+1 (555) 234-8901',
    prepTime: 'Yesterday, 12:00 PM',
    availableUntil: getRelativeTime(-10),
    expiryDisplay: 'Completed Yesterday',
    storageCondition: 'Insulated Refrigeration',
    foodSafetyInfo: 'Strict cold chain adherence.',
    allergens: 'Contains Gluten, Dairy',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    status: 'Distribution Completed',
    urgency: 'Low',
    currentRequestId: 'REQ-500',
    assignedVolunteerId: 'usr-vol-1',
    history: [
      { status: 'Listed', timestamp: new Date(Date.now() - 1400 * 60 * 1000).toISOString(), actorName: 'Chef Marcus', actorRole: 'Donor', notes: 'Listed' },
      { status: 'Requested', timestamp: new Date(Date.now() - 1300 * 60 * 1000).toISOString(), actorName: 'Dr. Sarah', actorRole: 'NGO', notes: 'Requested' },
      { status: 'Approved', timestamp: new Date(Date.now() - 1200 * 60 * 1000).toISOString(), actorName: 'Chef Marcus', actorRole: 'Donor', notes: 'Approved' },
      { status: 'Volunteer Assigned', timestamp: new Date(Date.now() - 1100 * 60 * 1000).toISOString(), actorName: 'Alex Rivera', actorRole: 'Volunteer', notes: 'Assigned' },
      { status: 'Picked Up', timestamp: new Date(Date.now() - 1000 * 60 * 1000).toISOString(), actorName: 'Alex Rivera', actorRole: 'Volunteer', notes: 'Picked Up' },
      { status: 'Delivered', timestamp: new Date(Date.now() - 900 * 60 * 1000).toISOString(), actorName: 'Alex Rivera', actorRole: 'Volunteer', notes: 'Delivered' },
      { status: 'Distribution Completed', timestamp: new Date(Date.now() - 800 * 60 * 1000).toISOString(), actorName: 'Dr. Sarah Jenkins', actorRole: 'NGO', notes: 'Distributed 110 meals to shelter families. Zero waste achieved!' }
    ]
  }
];

// Initial Requests
const INITIAL_REQUESTS = [
  {
    id: 'REQ-501',
    donationId: 'SEC-1002',
    ngoId: 'usr-ngo-1',
    ngoName: 'Hope & Nutrition Foundation',
    requestedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    beneficiaryCount: 95,
    targetCommunity: 'Hope Children Shelter & Senior Daycare Center',
    deliveryEta: 'Today, 5:30 PM',
    status: 'Pending',
    notes: 'We have 95 kids and seniors awaiting evening supper. We can pick up within 45 minutes.'
  },
  {
    id: 'REQ-502',
    donationId: 'SEC-1003',
    ngoId: 'usr-ngo-2',
    ngoName: 'City Meals Relief Society',
    requestedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    beneficiaryCount: 50,
    targetCommunity: 'Harbor District Homeless Kitchen',
    deliveryEta: 'Today, 4:00 PM',
    status: 'Approved',
    notes: 'Urgent hot dinner meal for community shelter residents.'
  },
  {
    id: 'REQ-503',
    donationId: 'SEC-1004',
    ngoId: 'usr-ngo-1',
    ngoName: 'Hope & Nutrition Foundation',
    requestedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    beneficiaryCount: 180,
    targetCommunity: 'Hope Community Kitchen Central',
    deliveryEta: 'Today, 6:00 PM',
    status: 'Approved',
    notes: 'Will be used in cooking healthy vegetable stews for 180 families.'
  },
  {
    id: 'REQ-504',
    donationId: 'SEC-1005',
    ngoId: 'usr-ngo-2',
    ngoName: 'City Meals Relief Society',
    requestedAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    beneficiaryCount: 120,
    targetCommunity: 'Eastside Emergency Shelter',
    deliveryEta: 'Today, 2:30 PM',
    status: 'Approved',
    notes: 'Immediate distribution to shelter residents.'
  },
  {
    id: 'REQ-505',
    donationId: 'SEC-1006',
    ngoId: 'usr-ngo-1',
    ngoName: 'Hope & Nutrition Foundation',
    requestedAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    beneficiaryCount: 125,
    targetCommunity: 'Hope Foundation Youth Center',
    deliveryEta: 'Today, 3:00 PM',
    status: 'Approved',
    notes: 'Delivered to youth center.'
  }
];

// Initial Notifications
const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    targetRole: 'Donor',
    targetUserId: 'usr-donor-2',
    title: 'New Food Request Received!',
    message: 'Hope & Nutrition Foundation requested your Artisan Sourdough Loaves (SEC-1002).',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    read: false,
    donationId: 'SEC-1002'
  },
  {
    id: 'notif-2',
    targetRole: 'Volunteer',
    targetUserId: 'usr-vol-1',
    title: 'New Pickup Assigned: SEC-1004',
    message: 'You have been assigned to collect 18 Crates of Organic Greens from Grand Hyatt.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
    donationId: 'SEC-1004'
  },
  {
    id: 'notif-3',
    targetRole: 'NGO',
    targetUserId: 'usr-ngo-2',
    title: 'Donation Approved by Chef Marcus!',
    message: 'Your request for Grilled Herb Chicken (SEC-1003) has been approved. Awaiting volunteer pickup.',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    read: false,
    donationId: 'SEC-1003'
  },
  {
    id: 'notif-4',
    targetRole: 'Admin',
    targetUserId: 'usr-admin-1',
    title: 'Milestone: 5,000 Rescued Meals this Month',
    message: 'SecondServe network has prevented 2.4 tons of carbon emissions across 140+ donations.',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    read: true,
    donationId: null
  }
];

// Data Store Class
export class DataStore {
  static get(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn('LocalStorage read error, returning default:', e);
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  static init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.set(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DONATIONS)) {
      this.set(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      this.set(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.set(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    // Set default demo current user to Donor so the user lands in an interactive authenticated experience
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.set(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[1]); // Chef Marcus
    }
  }

  static resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.DONATIONS);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.FEEDBACK);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.init();
  }

  // --- Donations Operations ---
  static getDonations() {
    return this.get(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
  }

  static getDonationById(id) {
    const list = this.getDonations();
    return list.find(d => d.id === id) || null;
  }

  static addDonation(donationData, currentUser) {
    const list = this.getDonations();
    const newId = 'SEC-' + (1000 + list.length + 1);
    const newDonation = {
      id: newId,
      foodName: donationData.foodName,
      category: donationData.category,
      dietary: donationData.dietary || 'Veg',
      quantity: donationData.quantity,
      servings: parseInt(donationData.servings) || 40,
      donorId: currentUser.id,
      donorName: currentUser.organization || currentUser.name,
      pickupAddress: donationData.pickupAddress || currentUser.address || 'Kitchen Main Entrance',
      donorPhone: currentUser.phone || '+1 (555) 000-0000',
      prepTime: donationData.prepTime || 'Today, Just Prepared',
      availableUntil: donationData.availableUntil || getRelativeTime(6),
      expiryDisplay: donationData.expiryDisplay || 'In 6 hours',
      storageCondition: donationData.storageCondition,
      foodSafetyInfo: donationData.foodSafetyInfo || 'Food inspected, safe & hygienically stored.',
      allergens: donationData.allergens || 'None declared',
      image: donationData.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      status: 'Listed',
      urgency: donationData.urgency || 'Medium',
      currentRequestId: null,
      assignedVolunteerId: null,
      history: [
        {
          status: 'Listed',
          timestamp: new Date().toISOString(),
          actorName: currentUser.name,
          actorRole: 'Donor',
          notes: 'New surplus food listing created and verified for pickup.'
        }
      ]
    };

    list.unshift(newDonation);
    this.set(STORAGE_KEYS.DONATIONS, list);

    // Push notification to NGOs and Admin
    this.addNotification({
      targetRole: 'NGO',
      title: 'New Surplus Food Available!',
      message: `${newDonation.donorName} just listed ${newDonation.quantity} of ${newDonation.foodName}.`,
      donationId: newId
    });

    return newDonation;
  }

  static updateDonation(id, updatedFields) {
    const list = this.getDonations();
    const index = list.findIndex(d => d.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields };
      this.set(STORAGE_KEYS.DONATIONS, list);
      return list[index];
    }
    return null;
  }

  static deleteDonation(id) {
    const list = this.getDonations().filter(d => d.id !== id);
    this.set(STORAGE_KEYS.DONATIONS, list);
  }

  // --- Requests Operations ---
  static getRequests() {
    return this.get(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
  }

  static createFoodRequest(donationId, ngoUser, requestData) {
    const donation = this.getDonationById(donationId);
    if (!donation) throw new Error('Donation not found.');

    // PREVENT RACE CONDITION / MULTIPLE CLAIMS
    if (donation.status !== 'Listed') {
      throw new Error(`This food donation is already in status '${donation.status}' and cannot be requested.`);
    }

    // Check expiry
    const expiryDate = new Date(donation.availableUntil);
    if (expiryDate < new Date()) {
      throw new Error('This food listing has already expired and is no longer available for rescue.');
    }

    const requests = this.getRequests();
    const newReqId = 'REQ-' + (500 + requests.length + 1);
    const newRequest = {
      id: newReqId,
      donationId: donationId,
      ngoId: ngoUser.id,
      ngoName: ngoUser.organization || ngoUser.name,
      requestedAt: new Date().toISOString(),
      beneficiaryCount: parseInt(requestData.beneficiaryCount) || donation.servings,
      targetCommunity: requestData.targetCommunity || 'Local Community Distribution',
      deliveryEta: requestData.deliveryEta || 'Within 2 hours',
      status: 'Pending',
      notes: requestData.notes || 'Surplus requested for urgent community distribution.'
    };

    requests.unshift(newRequest);
    this.set(STORAGE_KEYS.REQUESTS, requests);

    // Update donation status to "Requested"
    donation.status = 'Requested';
    donation.currentRequestId = newReqId;
    donation.history.push({
      status: 'Requested',
      timestamp: new Date().toISOString(),
      actorName: ngoUser.name,
      actorRole: 'NGO',
      notes: `Requested for ${newRequest.beneficiaryCount} beneficiaries at ${newRequest.targetCommunity}.`
    });

    this.updateDonation(donationId, donation);

    // Notify Donor
    this.addNotification({
      targetRole: 'Donor',
      targetUserId: donation.donorId,
      title: 'Incoming Food Request!',
      message: `${newRequest.ngoName} requested your surplus "${donation.foodName}". Please review and approve.`,
      donationId: donationId
    });

    return newRequest;
  }

  static approveFoodRequest(requestId, donorUser) {
    const requests = this.getRequests();
    const req = requests.find(r => r.id === requestId);
    if (!req) throw new Error('Request not found.');

    const donation = this.getDonationById(req.donationId);
    if (!donation) throw new Error('Donation not found.');

    req.status = 'Approved';
    this.set(STORAGE_KEYS.REQUESTS, requests);

    donation.status = 'Approved';
    donation.history.push({
      status: 'Approved',
      timestamp: new Date().toISOString(),
      actorName: donorUser.name,
      actorRole: 'Donor',
      notes: `Request approved by ${donorUser.organization || donorUser.name}. Packaging ready for volunteer collection.`
    });

    this.updateDonation(donation.id, donation);

    // Notify NGO
    this.addNotification({
      targetRole: 'NGO',
      targetUserId: req.ngoId,
      title: 'Request Approved!',
      message: `Your request for ${donation.foodName} was approved! Dispatching volunteer for pickup.`,
      donationId: donation.id
    });

    // Notify Available Volunteers
    this.addNotification({
      targetRole: 'Volunteer',
      title: 'Urgent Pickup Available!',
      message: `New rescue ready at ${donation.pickupAddress} (${donation.quantity}). Click to accept task.`,
      donationId: donation.id
    });

    return req;
  }

  static rejectFoodRequest(requestId, donorUser, reason) {
    const requests = this.getRequests();
    const req = requests.find(r => r.id === requestId);
    if (!req) throw new Error('Request not found.');

    const donation = this.getDonationById(req.donationId);

    req.status = 'Rejected';
    this.set(STORAGE_KEYS.REQUESTS, requests);

    if (donation) {
      donation.status = 'Listed'; // Re-open for other NGOs
      donation.currentRequestId = null;
      donation.history.push({
        status: 'Listed',
        timestamp: new Date().toISOString(),
        actorName: donorUser.name,
        actorRole: 'Donor',
        notes: `Previous request declined (${reason || 'Logistical constraints'}). Listing returned to available pool.`
      });
      this.updateDonation(donation.id, donation);
    }

    // Notify NGO
    this.addNotification({
      targetRole: 'NGO',
      targetUserId: req.ngoId,
      title: 'Request Declined',
      message: `Your request for ${donation ? donation.foodName : 'food'} could not be fulfilled: ${reason || 'Capacity mismatch'}. Listing re-opened.`,
      donationId: donation ? donation.id : null
    });

    return req;
  }

  // --- Volunteer Tracking Steps ---
  static assignVolunteer(donationId, volunteerUser) {
    const donation = this.getDonationById(donationId);
    if (!donation) throw new Error('Donation not found.');

    if (donation.status !== 'Approved' && donation.status !== 'Listed') {
      throw new Error(`Cannot assign volunteer when donation status is ${donation.status}`);
    }

    donation.status = 'Volunteer Assigned';
    donation.assignedVolunteerId = volunteerUser.id;
    donation.assignedVolunteerName = volunteerUser.name;
    donation.assignedVolunteerVehicle = volunteerUser.vehicleType;
    donation.history.push({
      status: 'Volunteer Assigned',
      timestamp: new Date().toISOString(),
      actorName: volunteerUser.name,
      actorRole: 'Volunteer',
      notes: `${volunteerUser.name} accepted transport duty with ${volunteerUser.vehicleType}. En route to pickup.`
    });

    this.updateDonation(donationId, donation);

    // Notify Donor & NGO
    this.addNotification({
      targetRole: 'Donor',
      targetUserId: donation.donorId,
      title: 'Volunteer Dispatched for Pickup',
      message: `${volunteerUser.name} is on the way to pick up ${donation.foodName}.`,
      donationId: donation.id
    });

    return donation;
  }

  static markFoodPickedUp(donationId, volunteerUser, notes) {
    const donation = this.getDonationById(donationId);
    if (!donation) throw new Error('Donation not found.');

    donation.status = 'Picked Up';
    donation.history.push({
      status: 'Picked Up',
      timestamp: new Date().toISOString(),
      actorName: volunteerUser.name,
      actorRole: 'Volunteer',
      notes: notes || 'Food inspected, temperature verified, and loaded into insulated carrier. In transit to NGO.'
    });

    this.updateDonation(donationId, donation);

    this.addNotification({
      targetRole: 'NGO',
      title: 'Rescue En Route to You!',
      message: `${volunteerUser.name} has picked up ${donation.foodName} and is delivering it now.`,
      donationId: donation.id
    });

    return donation;
  }

  static markFoodDelivered(donationId, volunteerUser, notes) {
    const donation = this.getDonationById(donationId);
    if (!donation) throw new Error('Donation not found.');

    donation.status = 'Delivered';
    donation.history.push({
      status: 'Delivered',
      timestamp: new Date().toISOString(),
      actorName: volunteerUser.name,
      actorRole: 'Volunteer',
      notes: notes || 'Safely handed over to NGO shelter staff. Digital receipt acknowledged.'
    });

    this.updateDonation(donationId, donation);

    this.addNotification({
      targetRole: 'NGO',
      title: 'Food Delivery Arrived!',
      message: `${donation.foodName} has been delivered. Please confirm receipt and log distribution.`,
      donationId: donation.id
    });

    return donation;
  }

  static markDistributionCompleted(donationId, ngoUser, distributionDetails) {
    const donation = this.getDonationById(donationId);
    if (!donation) throw new Error('Donation not found.');

    donation.status = 'Distribution Completed';
    donation.history.push({
      status: 'Distribution Completed',
      timestamp: new Date().toISOString(),
      actorName: ngoUser.name,
      actorRole: 'NGO',
      notes: `Successfully distributed ${distributionDetails.mealsServed || donation.servings} meals to ${distributionDetails.community || 'shelter residents'}. Zero food waste achieved!`
    });

    this.updateDonation(donationId, donation);

    // Save feedback
    const feedbacks = this.get(STORAGE_KEYS.FEEDBACK, []);
    feedbacks.push({
      id: 'FB-' + Date.now(),
      donationId: donation.id,
      foodName: donation.foodName,
      donorName: donation.donorName,
      ngoName: ngoUser.organization || ngoUser.name,
      mealsServed: distributionDetails.mealsServed || donation.servings,
      rating: distributionDetails.rating || 5,
      comments: distributionDetails.comments || 'High quality food in fresh condition. Immense gratitude from all beneficiaries.',
      timestamp: new Date().toISOString()
    });
    this.set(STORAGE_KEYS.FEEDBACK, feedbacks);

    // Notify Donor
    this.addNotification({
      targetRole: 'Donor',
      targetUserId: donation.donorId,
      title: 'Rescue Cycle Complete! 🎉',
      message: `${ngoUser.organization || ngoUser.name} confirmed all ${donation.foodName} was happily distributed!`,
      donationId: donation.id
    });

    return donation;
  }

  // --- Users & Auth ---
  static getUsers() {
    return this.get(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static getUserById(id) {
    return this.getUsers().find(u => u.id === id) || null;
  }

  static getCurrentUser() {
    return this.get(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[1]);
  }

  static setCurrentUser(user) {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  static toggleUserVerification(userId) {
    const users = this.getUsers();
    const u = users.find(x => x.id === userId);
    if (u) {
      u.verified = !u.verified;
      this.set(STORAGE_KEYS.USERS, users);
      return u;
    }
    return null;
  }

  // --- Notifications ---
  static getNotifications(role, userId) {
    const notifs = this.get(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return notifs.filter(n => {
      if (n.targetUserId && userId && n.targetUserId === userId) return true;
      if (n.targetRole && role && n.targetRole === role) return true;
      if (!n.targetRole && !n.targetUserId) return true;
      return false;
    });
  }

  static addNotification(item) {
    const notifs = this.get(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif = {
      id: 'notif-' + Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...item
    };
    notifs.unshift(newNotif);
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  }

  static markAllNotificationsRead() {
    const notifs = this.get(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    notifs.forEach(n => n.read = true);
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  // --- Summary Metrics for Admin / Home ---
  static getPlatformMetrics() {
    const donations = this.getDonations();
    const users = this.getUsers();
    const requests = this.getRequests();

    const donorsCount = users.filter(u => u.role === 'Donor').length;
    const ngosCount = users.filter(u => u.role === 'NGO').length;
    const volunteersCount = users.filter(u => u.role === 'Volunteer').length;

    const totalPortions = donations.reduce((sum, d) => sum + (parseInt(d.servings) || 0), 0);
    const completedDonations = donations.filter(d => d.status === 'Distribution Completed').length;
    const inProgressDonations = donations.filter(d => ['Requested', 'Approved', 'Volunteer Assigned', 'Picked Up', 'Delivered'].includes(d.status)).length;
    const availableDonations = donations.filter(d => d.status === 'Listed').length;

    // Approximate CO2 reduction: ~2.5 kg CO2 saved per kg of food rescued
    const kgSaved = Math.round(totalPortions * 0.42);
    const co2Saved = Math.round(kgSaved * 2.5);

    return {
      donorsCount,
      ngosCount,
      volunteersCount,
      totalPortions,
      completedDonations,
      inProgressDonations,
      availableDonations,
      totalDonations: donations.length,
      kgSaved,
      co2Saved
    };
  }
}

// Automatically initialize store on module load
DataStore.init();
