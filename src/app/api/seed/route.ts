import { NextResponse } from 'next/server';
import { supabase, TABLES } from '@/lib/supabase';
import { hashPassword } from '@/lib/hash';

// ... (services and officerData arrays remain exactly the same — keeping them as-is from the original)
// We only change the database operations below.

const services = [
  {
    slug: 'birth-certificate',
    name: 'Birth Certificate',
    description: 'Apply for an official birth certificate issued by the Registry of Civil Status. Required for passport applications, school enrollment, and official identification purposes.',
    category: 'certificates',
    department: 'Registry of Civil Status',
    processing_days: 3,
    fee_amount: 20,
    currency: 'USD',
    icon: 'Baby',
    sort_order: 1,
    requirements: JSON.stringify([
      'Government-issued photo ID of applicant',
      "Parent's government-issued photo ID",
      'Completed application form',
    ]),
    form_fields: JSON.stringify([
      { key: 'fullName', label: "Child's Full Name", type: 'text', required: true },
      { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
      { key: 'placeOfBirth', label: 'Place of Birth', type: 'text', required: true, placeholder: 'e.g., Peebles Hospital, Tortola' },
      { key: 'sex', label: 'Sex', type: 'select', required: true, options: ['Male', 'Female'] },
      { key: 'fathersName', label: "Father's Full Name", type: 'text', required: true },
      { key: 'mothersName', label: "Mother's Full Name / Maiden Name", type: 'text', required: true },
      { key: 'parentAddress', label: "Parent's Address at time of birth", type: 'text', required: false },
    ]),
  },
  {
    slug: 'death-certificate',
    name: 'Death Certificate',
    description: 'Apply for an official death certificate from the Registry of Civil Status. Required for estate settlement, insurance claims, and legal proceedings.',
    category: 'certificates',
    department: 'Registry of Civil Status',
    processing_days: 3,
    fee_amount: 20,
    currency: 'USD',
    icon: 'Heart',
    sort_order: 2,
    requirements: JSON.stringify([
      'Medical certificate of death',
      'Informant photo ID',
      'Deceased person ID (if available)',
    ]),
    form_fields: JSON.stringify([
      { key: 'deceasedName', label: 'Full Name of Deceased', type: 'text', required: true },
      { key: 'dateOfDeath', label: 'Date of Death', type: 'date', required: true },
      { key: 'placeOfDeath', label: 'Place of Death', type: 'text', required: true },
      { key: 'sex', label: 'Sex', type: 'select', required: true, options: ['Male', 'Female'] },
      { key: 'causeOfDeath', label: 'Cause of Death', type: 'text', required: true },
      { key: 'ageAtDeath', label: 'Age at Death', type: 'text', required: false },
      { key: 'informantName', label: "Informant's Name", type: 'text', required: true },
      { key: 'informantRelation', label: "Informant's Relationship to Deceased", type: 'text', required: true },
    ]),
  },
  {
    slug: 'marriage-certificate',
    name: 'Marriage Certificate',
    description: 'Apply for a certified copy of your marriage certificate. Required for name changes, joint financial applications, and immigration purposes.',
    category: 'certificates',
    department: 'Registry of Civil Status',
    processing_days: 5,
    fee_amount: 25,
    currency: 'USD',
    icon: 'HeartHandshake',
    sort_order: 3,
    requirements: JSON.stringify([
      "Both parties' government-issued photo IDs",
      'Original marriage license',
      'Completed application form',
    ]),
    form_fields: JSON.stringify([
      { key: 'brideFullName', label: "Bride's Full Name (Maiden)", type: 'text', required: true },
      { key: 'groomFullName', label: "Groom's Full Name", type: 'text', required: true },
      { key: 'dateOfMarriage', label: 'Date of Marriage', type: 'date', required: true },
      { key: 'placeOfMarriage', label: 'Place of Marriage', type: 'text', required: true },
      { key: 'officiantName', label: 'Officiant Name', type: 'text', required: true },
      { key: 'witnessNames', label: 'Witness Names (2)', type: 'text', required: false },
      { key: 'applicantName', label: 'Applicant Name (requesting copy)', type: 'text', required: true },
    ]),
  },
  {
    slug: 'trade-license',
    name: 'Trade License',
    description: 'Apply for a Trade License to operate a business in the British Virgin Islands. All businesses must hold a valid trade license as per the Trade License Act.',
    category: 'licenses',
    department: 'Inland Revenue Department',
    processing_days: 7,
    fee_amount: 100,
    currency: 'USD',
    icon: 'Store',
    sort_order: 4,
    requirements: JSON.stringify([
      'Government-issued photo ID',
      'Business plan or description of activities',
      'NIB (National Insurance Board) registration',
      'Lease agreement or proof of business premises',
    ]),
    form_fields: JSON.stringify([
      { key: 'businessName', label: 'Business Name', type: 'text', required: true },
      { key: 'businessAddress', label: 'Business Address', type: 'text', required: true },
      { key: 'businessType', label: 'Business Type', type: 'select', required: true, options: ['Retail', 'Restaurant/Food Service', 'Professional Services', 'Construction', 'Tourism/Hospitality', 'Wholesale', 'Manufacturing', 'Financial Services', 'Other'] },
      { key: 'ownerName', label: 'Owner/Proprietor Name', type: 'text', required: true },
      { key: 'ownerIdNumber', label: "Owner's ID/Passport Number", type: 'text', required: true },
      { key: 'contactPhone', label: 'Business Contact Phone', type: 'text', required: true },
      { key: 'contactEmail', label: 'Business Email', type: 'email', required: true },
      { key: 'numberOfEmployees', label: 'Number of Employees', type: 'number', required: false },
    ]),
  },
  {
    slug: 'work-permit',
    name: 'Work Permit',
    description: 'Apply for a work permit to be legally employed in the British Virgin Islands. Required for all non-belongers seeking employment.',
    category: 'immigration',
    department: 'Labour Department',
    processing_days: 14,
    fee_amount: 250,
    currency: 'USD',
    icon: 'Briefcase',
    sort_order: 5,
    requirements: JSON.stringify([
      'Valid passport (at least 6 months validity)',
      'Job offer letter from BVI employer',
      'Police certificate from home country',
      'Medical certificate (within 3 months)',
      'Two passport-size photographs',
      'Copy of employer trade license',
    ]),
    form_fields: JSON.stringify([
      { key: 'applicantName', label: 'Applicant Full Name', type: 'text', required: true },
      { key: 'passportNumber', label: 'Passport Number', type: 'text', required: true },
      { key: 'nationality', label: 'Nationality', type: 'text', required: true },
      { key: 'positionApplied', label: 'Position Applied For', type: 'text', required: true },
      { key: 'employerName', label: 'Employer Name', type: 'text', required: true },
      { key: 'employerAddress', label: 'Employer Address', type: 'text', required: true },
      { key: 'salaryRange', label: 'Monthly Salary Range (USD)', type: 'text', required: true, placeholder: 'e.g., $2,500 - $3,500' },
      { key: 'contractDuration', label: 'Contract Duration', type: 'select', required: true, options: ['6 months', '1 year', '2 years', '3 years'] },
      { key: 'qualifications', label: 'Relevant Qualifications', type: 'textarea', required: false },
    ]),
  },
  {
    slug: 'business-registration',
    name: 'Business Registration',
    description: 'Register a new company or business entity in the British Virgin Islands. Includes LLC, Corporation, and Partnership registrations.',
    category: 'registration',
    department: 'Financial Services Commission',
    processing_days: 5,
    fee_amount: 200,
    currency: 'USD',
    icon: 'Building2',
    sort_order: 6,
    requirements: JSON.stringify([
      'Articles of incorporation / Partnership agreement',
      "Directors' government-issued photo IDs",
      'Registered agent authorization letter',
      'Company name search clearance',
      'Proof of registered office address',
    ]),
    form_fields: JSON.stringify([
      { key: 'companyName', label: 'Company Name', type: 'text', required: true },
      { key: 'registeredAddress', label: 'Registered Address', type: 'text', required: true },
      { key: 'businessType', label: 'Business Type', type: 'select', required: true, options: ['LLC (Limited Liability Company)', 'Corporation', 'Partnership', 'Sole Proprietorship'] },
      { key: 'directorsNames', label: "Directors' Names", type: 'textarea', required: true, placeholder: 'One per line' },
      { key: 'shareCapital', label: 'Authorized Share Capital (USD)', type: 'text', required: false },
      { key: 'objectives', label: 'Business Objectives', type: 'textarea', required: true },
      { key: 'registeredAgent', label: 'Registered Agent Name', type: 'text', required: true },
    ]),
  },
  {
    slug: 'drivers-license-renewal',
    name: "Driver's License Renewal",
    description: 'Renew your existing BVI driver\'s license. Licenses must be renewed before expiry to maintain driving privileges.',
    category: 'licenses',
    department: 'Department of Motor Vehicles',
    processing_days: 2,
    fee_amount: 35,
    currency: 'USD',
    icon: 'Car',
    sort_order: 7,
    requirements: JSON.stringify([
      'Current/expired driver license',
      'Government-issued photo ID',
      'Proof of address (utility bill, bank statement)',
    ]),
    form_fields: JSON.stringify([
      { key: 'fullName', label: 'Full Name', type: 'text', required: true },
      { key: 'licenseNumber', label: 'License Number', type: 'text', required: true },
      { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
      { key: 'currentExpiry', label: 'Current License Expiry Date', type: 'date', required: true },
      { key: 'address', label: 'Current Address', type: 'text', required: true },
      { key: 'bloodType', label: 'Blood Type', type: 'select', required: false, options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
      { key: 'licenseClass', label: 'License Class', type: 'select', required: true, options: ['Class 1 (Motorcycle)', 'Class 2 (Private Car)', 'Class 3 (Commercial)', 'Class 4 (Heavy Goods)'] },
    ]),
  },
  {
    slug: 'tax-filing-individual',
    name: 'Tax Filing - Individual',
    description: 'Submit your annual individual income tax return to the Inland Revenue Department. Filing deadline is March 31st each year.',
    category: 'taxation',
    department: 'Inland Revenue Department',
    processing_days: 1,
    fee_amount: 0,
    currency: 'USD',
    icon: 'Calculator',
    sort_order: 8,
    requirements: JSON.stringify([
      "Previous year's tax return",
      'W-2 forms or equivalent income documentation',
      'Receipts for deductions claimed',
    ]),
    form_fields: JSON.stringify([
      { key: 'taxpayerName', label: 'Taxpayer Full Name', type: 'text', required: true },
      { key: 'ssnTin', label: 'SSN / TIN', type: 'text', required: true },
      { key: 'taxYear', label: 'Tax Year', type: 'number', required: true, placeholder: '2024' },
      { key: 'totalIncome', label: 'Total Income (USD)', type: 'number', required: true },
      { key: 'deductions', label: 'Total Deductions (USD)', type: 'number', required: false },
      { key: 'taxPayable', label: 'Tax Payable (USD)', type: 'number', required: true },
      { key: 'additionalNotes', label: 'Additional Notes', type: 'textarea', required: false },
    ]),
  },
  {
    slug: 'passport-application',
    name: 'Passport Application',
    description: 'Apply for a new British Virgin Islands passport. Processing includes verification, security checks, and production.',
    category: 'immigration',
    department: 'Immigration Department',
    processing_days: 10,
    fee_amount: 75,
    currency: 'USD',
    icon: 'BookOpen',
    sort_order: 9,
    requirements: JSON.stringify([
      'Birth certificate',
      'Government-issued photo ID',
      'Two passport-size photographs (2x2 inches)',
      'Police certificate (for applicants 16+)',
      'Completed application form',
    ]),
    form_fields: JSON.stringify([
      { key: 'fullName', label: 'Full Name (as on birth certificate)', type: 'text', required: true },
      { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
      { key: 'placeOfBirth', label: 'Place of Birth', type: 'text', required: true },
      { key: 'sex', label: 'Sex', type: 'select', required: true, options: ['Male', 'Female'] },
      { key: 'height', label: 'Height', type: 'text', required: true, placeholder: 'e.g., 5\'10"' },
      { key: 'eyeColor', label: 'Eye Color', type: 'select', required: true, options: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Black'] },
      { key: 'address', label: 'Current Residential Address', type: 'text', required: true },
      { key: 'emergencyContact', label: 'Emergency Contact Name & Phone', type: 'text', required: true },
      { key: 'passportType', label: 'Passport Type', type: 'select', required: true, options: ['Standard (32 pages)', 'Frequent Traveller (48 pages)'] },
    ]),
  },
  {
    slug: 'police-certificate',
    name: 'Police Certificate',
    description: 'Apply for a Police Certificate of Character from the Royal Virgin Islands Police Force. Required for immigration, employment, and visa applications. All fields must be completed in BLOCK LETTERS.',
    category: 'certificates',
    department: 'Royal Virgin Islands Police Force',
    processing_days: 3,
    fee_amount: 20,
    currency: 'USD',
    icon: 'Shield',
    sort_order: 10,
    requirements: JSON.stringify([
      'Valid passport (must be presented at collection)',
      'Two (2) passport-size photographs (no older than 6 months)',
      'Completed application form (all fields in BLOCK LETTERS)',
      'Non-refundable fee of $20.00 per certificate',
      'Letter of consent if applying by proxy',
      'Collection after 3 working days with receipt',
    ]),
    form_fields: JSON.stringify([
      { key: 'surname', label: '1. SURNAME(S)', type: 'text', required: true, placeholder: 'Enter in BLOCK LETTERS' },
      { key: 'givenNames', label: '2. GIVEN NAME(S)', type: 'text', required: true, placeholder: 'Enter in BLOCK LETTERS' },
      { key: 'sex', label: '3. SEX', type: 'select', required: true, options: ['MALE', 'FEMALE'] },
      { key: 'dateOfBirth', label: '4. DATE OF BIRTH', type: 'date', required: true },
      { key: 'age', label: '5. AGE', type: 'text', required: true, placeholder: 'e.g., 32' },
      { key: 'placeOfBirth', label: '6. PLACE OF BIRTH', type: 'text', required: true },
      { key: 'nationality', label: '7. NATIONALITY', type: 'text', required: true },
      { key: 'occupation', label: '8. OCCUPATION', type: 'text', required: true },
      { key: 'physicalAddress', label: '9. PHYSICAL ADDRESS (OWNER OF PREMISES)', type: 'text', required: true },
      { key: 'contactNumbers', label: '10. CONTACT NUMBERS', type: 'text', required: true, placeholder: 'e.g., +1 284 542 3100' },
      { key: 'countriesResidingBefore', label: '11(a). COUNTRIES RESIDING BEFORE MOVING TO BVI', type: 'textarea', required: false, placeholder: 'List all countries with dates' },
      { key: 'dateArrivedBVI', label: '11(b). DATE ARRIVED INTO BVI', type: 'date', required: false },
      { key: 'dateOfApplication', label: '12. DATE OF APPLICATION', type: 'date', required: true },
      { key: 'purposeOfCertificate', label: '13. PURPOSE OF POLICE CERTIFICATE(S)', type: 'select', required: true, options: ['Immigration', 'Employment', 'Visa Application', 'Education', 'Adoption', 'Other'] },
      { key: 'numberOfCertificates', label: '14. NUMBER OF CERTIFICATES REQUIRED', type: 'number', required: true, placeholder: 'e.g., 1' },
      { key: 'convictedBVICrime', label: '15(a). HAVE YOU EVER BEEN CONVICTED OF ANY CRIME(S) OR TRAFFIC OFFENCE(S) IN BVI?', type: 'select', required: true, options: ['NO', 'YES'] },
      { key: 'convictionYears', label: '15(b). IF YES TO 15(a), GIVE YEAR(S)', type: 'text', required: false, placeholder: 'e.g., 2018, 2020' },
      { key: 'submittedByName', label: '16. APPLICATION SUBMITTED BY (NAME)', type: 'text', required: true },
    ]),
  },
];

const officerData = [
  { name: 'Karen Wheatley', email: 'k.wheatley@bvi.gov.vg', plainPassword: 'Admin@2025', role: 'admin', department: 'Office of the Governor', status: 'active' },
  { name: 'David Malone', email: 'd.malone@bvi.gov.vg', plainPassword: 'Officer@2025', role: 'senior_officer', department: 'Inland Revenue Department', status: 'active' },
  { name: 'Sharlene George', email: 's.george@bvi.gov.vg', plainPassword: 'Officer@2025', role: 'officer', department: 'Immigration Department', status: 'active' },
];

function generateTrackingNumber() {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BVI-${dateStr}-${random}`;
}

const sampleApplications = [
  { serviceName: 'trade-license', applicantName: 'Michael Turnbull', applicantEmail: 'm.turnbull@surfsidebvi.com', applicantPhone: '+1 284 542 3100', formData: JSON.stringify({ businessName: 'Turnbull Construction Ltd' }), status: 'payment_pending', paymentStatus: 'unpaid', paymentAmount: 100, paymentMethod: null, createdAt: new Date(Date.now() - 2 * 86400000), timelineEntries: [{ status: 'payment_pending', note: 'Application created.', actor: 'system' }] },
  { serviceName: 'passport-application', applicantName: 'Anika Liburd', applicantEmail: 'anika.liburd@gmail.com', applicantPhone: '+1 284 345 8900', formData: JSON.stringify({ fullName: 'Anika Liburd' }), status: 'payment_pending', paymentStatus: 'unpaid', paymentAmount: 75, paymentMethod: null, createdAt: new Date(Date.now() - 86400000), timelineEntries: [{ status: 'payment_pending', note: 'Application created.', actor: 'system' }] },
  { serviceName: 'work-permit', applicantName: 'Carlos Mendez', applicantEmail: 'c.mendez@islandresorts.com', applicantPhone: '+1 284 495 2200', formData: JSON.stringify({ applicantName: 'Carlos Mendez' }), status: 'processing', paymentStatus: 'paid', paymentAmount: 250, paymentMethod: 'bank_transfer', paidAt: new Date(Date.now() - 8 * 86400000), createdAt: new Date(Date.now() - 10 * 86400000), reviewedBy: 'Sharlene George', reviewedAt: new Date(Date.now() - 7 * 86400000), timelineEntries: [{ status: 'payment_pending', note: 'Application created.', actor: 'system' }, { status: 'processing', note: 'Under review.', actor: 'Sharlene George' }] },
  { serviceName: 'business-registration', applicantName: 'Patricia Harrigan', applicantEmail: 'p.harrigan@bviattorneys.com', applicantPhone: '+1 284 494 5500', formData: JSON.stringify({ companyName: 'Caribbean Digital Solutions LLC' }), status: 'processing', paymentStatus: 'paid', paymentAmount: 200, paymentMethod: 'credit_card', paidAt: new Date(Date.now() - 6 * 86400000), createdAt: new Date(Date.now() - 7 * 86400000), reviewedBy: 'David Malone', reviewedAt: new Date(Date.now() - 5 * 86400000), timelineEntries: [{ status: 'payment_pending', note: 'Application created.', actor: 'system' }, { status: 'processing', note: 'Under review.', actor: 'David Malone' }] },
  { serviceName: 'drivers-license-renewal', applicantName: 'James Fahie', applicantEmail: 'j.fahie@bvicommunications.com', applicantPhone: '+1 284 445 1200', formData: JSON.stringify({ fullName: 'James Fahie' }), status: 'approved', paymentStatus: 'paid', paymentAmount: 35, paymentMethod: 'credit_card', paidAt: new Date(Date.now() - 5 * 86400000), createdAt: new Date(Date.now() - 7 * 86400000), reviewedBy: 'Sharlene George', reviewedAt: new Date(Date.now() - 4 * 86400000), timelineEntries: [{ status: 'payment_pending', note: 'Application created.', actor: 'system' }, { status: 'approved', note: 'Approved.', actor: 'Sharlene George' }] },
  { serviceName: 'birth-certificate', applicantName: 'Samantha Blyden', applicantEmail: 's.blyden@outlook.com', applicantPhone: '+1 284 340 6700', formData: JSON.stringify({ fullName: 'Zara Amara Blyden' }), status: 'approved', paymentStatus: 'paid', paymentAmount: 20, paymentMethod: 'credit_card', paidAt: new Date(Date.now() - 10 * 86400000), createdAt: new Date(Date.now() - 12 * 86400000), reviewedBy: 'Karen Wheatley', reviewedAt: new Date(Date.now() - 8 * 86400000), timelineEntries: [{ status: 'payment_pending', note: 'Application created.', actor: 'system' }, { status: 'approved', note: 'Approved.', actor: 'Karen Wheatley' }] },
  { serviceName: 'police-certificate', applicantName: 'Andrew Vanterpool', applicantEmail: 'a.vanterpool@gmail.com', applicantPhone: '+1 284 541 9300', formData: JSON.stringify({ surname: 'VANTERPOOL' }), status: 'issued', paymentStatus: 'paid', paymentAmount: 20, paymentMethod: 'credit_card', paidAt: new Date(Date.now() - 15 * 86400000), createdAt: new Date(Date.now() - 20 * 86400000), reviewedBy: 'Sharlene George', reviewedAt: new Date(Date.now() - 14 * 86400000), issuedAt: new Date(Date.now() - 14 * 86400000), certificateNumber: 'CERT-2025-KP8M3R', certificateUrl: '/documents/CERT-2025-KP8M3R.pdf', timelineEntries: [{ status: 'payment_pending', note: 'Application created.', actor: 'system' }, { status: 'issued', note: 'Issued.', actor: 'system' }] },
  { serviceName: 'marriage-certificate', applicantName: 'Lisa and Ronald Penn', applicantEmail: 'lisa.penn@yahoo.com', applicantPhone: '+1 284 496 7800', formData: JSON.stringify({ brideFullName: 'Lisa Marie Creque' }), status: 'issued', paymentStatus: 'paid', paymentAmount: 25, paymentMethod: 'bank_transfer', paidAt: new Date(Date.now() - 30 * 86400000), createdAt: new Date(Date.now() - 35 * 86400000), reviewedBy: 'Karen Wheatley', reviewedAt: new Date(Date.now() - 28 * 86400000), issuedAt: new Date(Date.now() - 28 * 86400000), certificateNumber: 'CERT-2024-RN7X2W', certificateUrl: '/documents/CERT-2024-RN7X2W.pdf', timelineEntries: [{ status: 'payment_pending', note: 'Application created.', actor: 'system' }, { status: 'issued', note: 'Issued.', actor: 'system' }] },
  { serviceName: 'death-certificate', applicantName: 'Oswald Browne', applicantEmail: 'o.browne@bvi.gov.vg', applicantPhone: '+1 284 468 2100', formData: JSON.stringify({ deceasedName: 'Eulalie Venetta Browne' }), status: 'issued', paymentStatus: 'paid', paymentAmount: 20, paymentMethod: 'credit_card', paidAt: new Date(Date.now() - 45 * 86400000), createdAt: new Date(Date.now() - 50 * 86400000), reviewedBy: 'David Malone', reviewedAt: new Date(Date.now() - 42 * 86400000), issuedAt: new Date(Date.now() - 42 * 86400000), certificateNumber: 'CERT-2025-MQ3H8T', certificateUrl: '/documents/CERT-2025-MQ3H8T.pdf', timelineEntries: [{ status: 'payment_pending', note: 'Application created.', actor: 'system' }, { status: 'issued', note: 'Issued.', actor: 'system' }] },
  { serviceName: 'work-permit', applicantName: 'Raj Patel', applicantEmail: 'raj.patel@hotmail.com', applicantPhone: '+1 284 342 5600', formData: JSON.stringify({ applicantName: 'Raj Patel' }), status: 'rejected', paymentStatus: 'paid', paymentAmount: 250, paymentMethod: 'credit_card', paidAt: new Date(Date.now() - 18 * 86400000), createdAt: new Date(Date.now() - 22 * 86400000), reviewedBy: 'Sharlene George', reviewedAt: new Date(Date.now() - 16 * 86400000), rejectionReason: 'Incomplete documentation.', timelineEntries: [{ status: 'payment_pending', note: 'Application created.', actor: 'system' }, { status: 'rejected', note: 'Rejected.', actor: 'Sharlene George' }] },
  { serviceName: 'tax-filing-individual', applicantName: 'Christine Scatliffe', applicantEmail: 'c.scatliffe@bvi.gov.vg', applicantPhone: '+1 284 494 3300', formData: JSON.stringify({ taxpayerName: 'Christine Scatliffe' }), status: 'approved', paymentStatus: 'n/a', paymentAmount: 0, paymentMethod: null, createdAt: new Date(Date.now() - 3 * 86400000), reviewedBy: 'David Malone', reviewedAt: new Date(Date.now() - 2 * 86400000), timelineEntries: [{ status: 'submitted', note: 'Tax return submitted.', actor: 'system' }, { status: 'approved', note: 'Accepted.', actor: 'David Malone' }] },
  { serviceName: 'drivers-license-renewal', applicantName: 'Tyrone Hodge', applicantEmail: 't.hodge@gmail.com', applicantPhone: '+1 284 540 8800', formData: JSON.stringify({ fullName: 'Tyrone Hodge' }), status: 'payment_pending', paymentStatus: 'unpaid', paymentAmount: 35, paymentMethod: null, createdAt: new Date(Date.now() - 5 * 86400000), timelineEntries: [{ status: 'payment_pending', note: 'Application created.', actor: 'system' }] },
  { serviceName: 'birth-certificate', applicantName: 'Denise Forde', applicantEmail: 'd.forde@gmail.com', applicantPhone: '+1 284 443 2900', formData: JSON.stringify({ fullName: 'Marcus Jerome Forde' }), status: 'issued', paymentStatus: 'paid', paymentAmount: 20, paymentMethod: 'credit_card', paidAt: new Date(Date.now() - 60 * 86400000), createdAt: new Date(Date.now() - 65 * 86400000), reviewedBy: 'Karen Wheatley', reviewedAt: new Date(Date.now() - 58 * 86400000), issuedAt: new Date(Date.now() - 58 * 86400000), certificateNumber: 'CERT-2024-XZ2B9C', certificateUrl: '/documents/CERT-2024-XZ2B9C.pdf', timelineEntries: [{ status: 'payment_pending', note: 'Application created.', actor: 'system' }, { status: 'issued', note: 'Issued.', actor: 'system' }] },
  { serviceName: 'trade-license', applicantName: 'Kimberly Malone', applicantEmail: 'k.malone@natureswaybvi.com', applicantPhone: '+1 284 495 6600', formData: JSON.stringify({ businessName: "Nature's Way Organics" }), status: 'processing', paymentStatus: 'paid', paymentAmount: 100, paymentMethod: 'credit_card', paidAt: new Date(Date.now() - 4 * 86400000), createdAt: new Date(Date.now() - 5 * 86400000), reviewedBy: 'David Malone', reviewedAt: new Date(Date.now() - 3 * 86400000), timelineEntries: [{ status: 'payment_pending', note: 'Application created.', actor: 'system' }, { status: 'processing', note: 'Under review.', actor: 'David Malone' }] },
  { serviceName: 'passport-application', applicantName: 'Dwight Lewis', applicantEmail: 'd.lewis@bvi.gov.vg', applicantPhone: '+1 284 445 9900', formData: JSON.stringify({ fullName: 'Dwight Ronaldo Lewis' }), status: 'issued', paymentStatus: 'paid', paymentAmount: 75, paymentMethod: 'credit_card', paidAt: new Date(Date.now() - 40 * 86400000), createdAt: new Date(Date.now() - 50 * 86400000), reviewedBy: 'Sharlene George', reviewedAt: new Date(Date.now() - 38 * 86400000), issuedAt: new Date(Date.now() - 38 * 86400000), certificateNumber: 'CERT-2025-GW4T6Y', certificateUrl: '/documents/CERT-2025-GW4T6Y.pdf', timelineEntries: [{ status: 'payment_pending', note: 'Application created.', actor: 'system' }, { status: 'issued', note: 'Issued.', actor: 'system' }] },
];

export async function POST() {
  try {
    // Check if data already exists (idempotent)
    const { count: existingCount } = await supabase
      .from(TABLES.SERVICES)
      .select('*', { count: 'exact', head: true });

    if ((existingCount || 0) > 0) {
      return NextResponse.json({ message: 'Database already seeded', services: existingCount });
    }

    // Seed services
    for (const service of services) {
      await supabase.from(TABLES.SERVICES).insert({
        ...service,
        status: 'active',
      });
    }

    // Seed officers
    for (const officer of officerData) {
      const { plainPassword, ...rest } = officer;
      const hashedPassword = await hashPassword(plainPassword);
      await supabase.from(TABLES.OFFICERS).insert({
        ...rest,
        password_hash: hashedPassword,
      });
    }

    // Seed applications
    for (const app of sampleApplications) {
      const { data: serviceRows } = await supabase
        .from(TABLES.SERVICES)
        .select('id')
        .eq('slug', app.serviceName)
        .limit(1);

      if (!serviceRows?.[0]) continue;
      const serviceId = serviceRows[0].id;

      const trackingNumber = generateTrackingNumber();

      const { data: newApp } = await supabase
        .from(TABLES.APPLICATIONS)
        .insert({
          service_id: serviceId,
          tracking_number: trackingNumber,
          applicant_name: app.applicantName,
          applicant_email: app.applicantEmail,
          applicant_phone: app.applicantPhone,
          form_data: app.formData,
          status: app.status,
          payment_status: app.paymentStatus,
          payment_amount: app.paymentAmount,
          payment_method: app.paymentMethod,
          paid_at: app.paidAt ? app.paidAt.toISOString() : null,
          created_at: app.createdAt ? app.createdAt.toISOString() : new Date().toISOString(),
          reviewed_by: app.reviewedBy || null,
          reviewed_at: app.reviewedAt ? app.reviewedAt.toISOString() : null,
          issued_at: app.issuedAt ? app.issuedAt.toISOString() : null,
          certificate_number: app.certificateNumber || null,
          certificate_url: app.certificateUrl || null,
          rejection_reason: app.rejectionReason || null,
        })
        .select()
        .single();

      if (!newApp) continue;

      // Insert timeline entries
      for (const entry of app.timelineEntries) {
        await supabase.from(TABLES.TIMELINE).insert({
          application_id: newApp.id,
          status: entry.status,
          note: entry.note,
          actor: entry.actor,
          created_at: (entry as Record<string, unknown>).createdAt
            ? new Date((entry as Record<string, unknown>).createdAt as string).toISOString()
            : new Date().toISOString(),
        });
      }

      // Create payment if fee > 0
      if (app.paymentAmount > 0) {
        await supabase.from(TABLES.PAYMENTS).insert({
          application_id: newApp.id,
          amount: app.paymentAmount,
          method: app.paymentMethod || 'pending',
          status: app.paymentStatus === 'paid' ? 'completed' : 'pending',
          paid_at: app.paidAt ? app.paidAt.toISOString() : null,
        });
      }
    }

    return NextResponse.json({ message: 'Database seeded successfully', services: services.length, applications: sampleApplications.length });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
