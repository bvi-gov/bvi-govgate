import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.applicationTimeline.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.govApplication.deleteMany();
  await prisma.officer.deleteMany();
  await prisma.govService.deleteMany();

  // Seed services
  const services = [
    {
      slug: 'birth-certificate',
      name: 'Birth Certificate',
      description: 'Apply for an official birth certificate issued by the Registry of Civil Status.',
      category: 'certificates',
      department: 'Registry of Civil Status',
      processingDays: 3,
      feeAmount: 20,
      currency: 'USD',
      icon: 'Baby',
      sortOrder: 1,
      requirements: JSON.stringify(['Government-issued photo ID', "Parent's photo ID", 'Completed application form']),
      formFields: JSON.stringify([
        { key: 'fullName', label: "Child's Full Name", type: 'text', required: true },
        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
        { key: 'placeOfBirth', label: 'Place of Birth', type: 'text', required: true },
        { key: 'sex', label: 'Sex', type: 'select', required: true, options: ['Male', 'Female'] },
        { key: 'fathersName', label: "Father's Full Name", type: 'text', required: true },
        { key: 'mothersName', label: "Mother's Full Name", type: 'text', required: true },
      ]),
    },
    {
      slug: 'death-certificate',
      name: 'Death Certificate',
      description: 'Apply for an official death certificate from the Registry of Civil Status.',
      category: 'certificates',
      department: 'Registry of Civil Status',
      processingDays: 3,
      feeAmount: 20,
      currency: 'USD',
      icon: 'Heart',
      sortOrder: 2,
      requirements: JSON.stringify(['Medical certificate of death', 'Informant photo ID']),
      formFields: JSON.stringify([
        { key: 'deceasedName', label: 'Full Name of Deceased', type: 'text', required: true },
        { key: 'dateOfDeath', label: 'Date of Death', type: 'date', required: true },
        { key: 'placeOfDeath', label: 'Place of Death', type: 'text', required: true },
        { key: 'sex', label: 'Sex', type: 'select', required: true, options: ['Male', 'Female'] },
        { key: 'causeOfDeath', label: 'Cause of Death', type: 'text', required: true },
        { key: 'informantName', label: 'Informant Name', type: 'text', required: true },
      ]),
    },
    {
      slug: 'marriage-certificate',
      name: 'Marriage Certificate',
      description: 'Apply for an official marriage certificate issued by the Registry of Civil Status.',
      category: 'certificates',
      department: 'Registry of Civil Status',
      processingDays: 5,
      feeAmount: 25,
      currency: 'USD',
      icon: 'HeartHandshake',
      sortOrder: 3,
      requirements: JSON.stringify(['Both parties photo IDs', 'Marriage license']),
      formFields: JSON.stringify([
        { key: 'brideName', label: "Bride's Full Name", type: 'text', required: true },
        { key: 'groomName', label: "Groom's Full Name", type: 'text', required: true },
        { key: 'dateOfMarriage', label: 'Date of Marriage', type: 'date', required: true },
        { key: 'placeOfMarriage', label: 'Place of Marriage', type: 'text', required: true },
        { key: 'officiantName', label: 'Officiant Name', type: 'text', required: true },
      ]),
    },
    {
      slug: 'trade-license',
      name: 'Trade License',
      description: 'Apply for a trade license to operate a business in the British Virgin Islands.',
      category: 'licenses',
      department: 'Department of Trade & Investment',
      processingDays: 7,
      feeAmount: 100,
      currency: 'USD',
      icon: 'Briefcase',
      sortOrder: 4,
      requirements: JSON.stringify(['Photo ID', 'Business plan', 'NIB registration', 'Lease agreement']),
      formFields: JSON.stringify([
        { key: 'businessName', label: 'Business Name', type: 'text', required: true },
        { key: 'businessAddress', label: 'Business Address', type: 'text', required: true },
        { key: 'businessType', label: 'Business Type', type: 'select', required: true, options: ['Retail', 'Restaurant', 'Professional Services', 'Construction', 'Tourism', 'Other'] },
        { key: 'ownerName', label: 'Owner Full Name', type: 'text', required: true },
        { key: 'ownerIdNumber', label: 'Owner ID Number', type: 'text', required: true },
        { key: 'contactPhone', label: 'Contact Phone', type: 'text', required: true },
        { key: 'email', label: 'Email Address', type: 'text', required: true },
      ]),
    },
    {
      slug: 'work-permit',
      name: 'Work Permit',
      description: 'Apply for a work permit to be employed in the British Virgin Islands.',
      category: 'immigration',
      department: 'Department of Immigration',
      processingDays: 14,
      feeAmount: 250,
      currency: 'USD',
      icon: 'Plane',
      sortOrder: 5,
      requirements: JSON.stringify(['Valid passport', 'Job offer letter', 'Police certificate from home country', 'Medical certificate', 'Two passport photos']),
      formFields: JSON.stringify([
        { key: 'applicantName', label: 'Applicant Full Name', type: 'text', required: true },
        { key: 'passportNumber', label: 'Passport Number', type: 'text', required: true },
        { key: 'nationality', label: 'Nationality', type: 'text', required: true },
        { key: 'positionApplied', label: 'Position Applied For', type: 'text', required: true },
        { key: 'employerName', label: 'Employer Name', type: 'text', required: true },
        { key: 'employerAddress', label: 'Employer Address', type: 'text', required: true },
        { key: 'salaryRange', label: 'Monthly Salary Range (USD)', type: 'text', required: true },
        { key: 'contractDuration', label: 'Contract Duration (months)', type: 'text', required: true },
      ]),
    },
    {
      slug: 'business-registration',
      name: 'Business Registration',
      description: 'Register a new business entity (LLC, Corporation, or Partnership) in the BVI.',
      category: 'registration',
      department: 'Financial Services Commission',
      processingDays: 5,
      feeAmount: 200,
      currency: 'USD',
      icon: 'Building2',
      sortOrder: 6,
      requirements: JSON.stringify(['Articles of incorporation', 'Directors photo IDs', 'Registered agent letter', 'Name reservation certificate']),
      formFields: JSON.stringify([
        { key: 'companyName', label: 'Company Name', type: 'text', required: true },
        { key: 'registeredAddress', label: 'Registered Address', type: 'text', required: true },
        { key: 'businessType', label: 'Business Entity Type', type: 'select', required: true, options: ['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship'] },
        { key: 'directorsNames', label: 'Directors Names (comma separated)', type: 'text', required: true },
        { key: 'shareCapital', label: 'Authorized Share Capital (USD)', type: 'text', required: true },
        { key: 'objectives', label: 'Business Objectives', type: 'textarea', required: true },
      ]),
    },
    {
      slug: 'drivers-license-renewal',
      name: "Driver's License Renewal",
      description: "Renew your existing BVI driver's license before it expires.",
      category: 'licenses',
      department: 'Department of Motor Vehicles',
      processingDays: 2,
      feeAmount: 35,
      currency: 'USD',
      icon: 'Car',
      sortOrder: 7,
      requirements: JSON.stringify(['Current driver license', 'Photo ID']),
      formFields: JSON.stringify([
        { key: 'fullName', label: 'Full Name', type: 'text', required: true },
        { key: 'licenseNumber', label: 'License Number', type: 'text', required: true },
        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
        { key: 'currentExpiry', label: 'Current License Expiry Date', type: 'date', required: true },
        { key: 'address', label: 'Current Address', type: 'text', required: true },
        { key: 'bloodType', label: 'Blood Type', type: 'select', required: true, options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
      ]),
    },
    {
      slug: 'tax-filing',
      name: 'Tax Filing - Individual',
      description: 'File your annual individual income tax return with the BVI Inland Revenue.',
      category: 'taxation',
      department: 'Inland Revenue Department',
      processingDays: 1,
      feeAmount: 0,
      currency: 'USD',
      icon: 'Receipt',
      sortOrder: 8,
      requirements: JSON.stringify(['Previous year tax return', 'W-2 forms or income statements']),
      formFields: JSON.stringify([
        { key: 'taxpayerName', label: 'Taxpayer Full Name', type: 'text', required: true },
        { key: 'tin', label: 'Tax Identification Number (TIN)', type: 'text', required: true },
        { key: 'taxYear', label: 'Tax Year', type: 'select', required: true, options: ['2025', '2024', '2023'] },
        { key: 'totalIncome', label: 'Total Income (USD)', type: 'text', required: true },
        { key: 'deductions', label: 'Total Deductions (USD)', type: 'text', required: false },
      ]),
    },
    {
      slug: 'passport-application',
      name: 'Passport Application',
      description: 'Apply for a new BVI passport or renew your existing passport.',
      category: 'immigration',
      department: 'Department of Immigration',
      processingDays: 10,
      feeAmount: 75,
      currency: 'USD',
      icon: 'BookOpen',
      sortOrder: 9,
      requirements: JSON.stringify(['Birth certificate', 'Photo ID', 'Two passport photos', 'Police certificate']),
      formFields: JSON.stringify([
        { key: 'fullName', label: 'Full Name (as on birth certificate)', type: 'text', required: true },
        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
        { key: 'placeOfBirth', label: 'Place of Birth', type: 'text', required: true },
        { key: 'sex', label: 'Sex', type: 'select', required: true, options: ['Male', 'Female'] },
        { key: 'height', label: 'Height (cm)', type: 'text', required: true },
        { key: 'eyeColor', label: 'Eye Color', type: 'select', required: true, options: ['Brown', 'Blue', 'Green', 'Hazel', 'Grey', 'Black'] },
        { key: 'address', label: 'Current Residential Address', type: 'text', required: true },
        { key: 'emergencyContact', label: 'Emergency Contact Name & Phone', type: 'text', required: true },
      ]),
    },
    {
      slug: 'police-certificate',
      name: 'Police Certificate',
      description: 'Apply for a police certificate (certificate of good conduct) from the BVI Royal Police Force.',
      category: 'certificates',
      department: 'Royal Virgin Islands Police Force',
      processingDays: 5,
      feeAmount: 15,
      currency: 'USD',
      icon: 'Shield',
      sortOrder: 10,
      requirements: JSON.stringify(['Valid passport or national ID', 'Two passport photos']),
      formFields: JSON.stringify([
        { key: 'fullName', label: 'Full Name', type: 'text', required: true },
        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
        { key: 'placeOfBirth', label: 'Place of Birth', type: 'text', required: true },
        { key: 'purpose', label: 'Purpose for Certificate', type: 'select', required: true, options: ['Employment', 'Immigration', 'Education', 'Adoption', 'Other'] },
        { key: 'address', label: 'Current Address', type: 'text', required: true },
        { key: 'addressHistory', label: 'Previous Addresses (5 years)', type: 'textarea', required: true },
      ]),
    },
  ];

  for (const service of services) {
    await prisma.govService.create({ data: service });
  }
  console.log('Services seeded:', services.length);

  // Seed officers
  const officers = [
    { name: 'Kendra Wheatley', email: 'k.wheatley@bvi.gov.vg', role: 'admin', department: 'Premier\'s Office', status: 'active' },
    { name: 'David Penn', email: 'd.penn@bvi.gov.vg', role: 'senior_officer', department: 'Department of Immigration', status: 'active' },
    { name: 'Shara Flax-Charles', email: 's.flax@bvi.gov.vg', role: 'officer', department: 'Registry of Civil Status', status: 'active' },
  ];

  for (const officer of officers) {
    await prisma.officer.create({ data: officer });
  }
  console.log('Officers seeded:', officers.length);

  // Helper
  function genTracking() {
    return 'BVI-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const now = new Date();
  const day = 86400000;

  // Seed sample applications
  const apps = [
    { slug: 'birth-certificate', name: 'Amara Smith', email: 'amara.smith@gmail.com', phone: '+1-284-542-1100', status: 'issued', daysAgo: 8, data: { fullName: 'Amara Jade Smith', dateOfBirth: '2024-01-15', placeOfBirth: 'Peebles Hospital, Tortola', sex: 'Female', fathersName: 'Marcus Smith', mothersName: 'Lisa Smith' } },
    { slug: 'trade-license', name: 'Ricardo Malone', email: 'ricardo@malonebiz.com', phone: '+1-284-496-2200', status: 'issued', daysAgo: 12, data: { businessName: 'Malone Marine Services', businessAddress: 'Wickhams Cay, Road Town', businessType: 'Tourism', ownerName: 'Ricardo Malone', ownerIdNumber: 'BVI-89421', contactPhone: '+1-284-496-2200', email: 'ricardo@malonebiz.com' } },
    { slug: 'work-permit', name: 'Carlos Mendez', email: 'carlos.mendez@email.com', phone: '+1-284-345-8800', status: 'approved', daysAgo: 5, data: { applicantName: 'Carlos Mendez', passportNumber: 'M12345678', nationality: 'Dominican Republic', positionApplied: 'Chef', employerName: 'The Cove Restaurant', employerAddress: 'Cane Garden Bay', salaryRange: '$2,500 - $3,000', contractDuration: '24' } },
    { slug: 'passport-application', name: 'Nia Thomas', email: 'nia.thomas@outlook.com', phone: '+1-284-540-3300', status: 'processing', daysAgo: 3, data: { fullName: 'Nia Elizabeth Thomas', dateOfBirth: '1995-06-22', placeOfBirth: 'Road Town, Tortola', sex: 'Female', height: '165', eyeColor: 'Brown', address: '71 Main Street, Road Town', emergencyContact: 'Lloyd Thomas +1-284-540-3301' } },
    { slug: 'marriage-certificate', name: 'James & Sarah Clarke', email: 'sarah.clarke@gmail.com', phone: '+1-284-545-7700', status: 'processing', daysAgo: 2, data: { brideName: 'Sarah Anne Williams', groomName: 'James Michael Clarke', dateOfMarriage: '2025-03-15', placeOfMarriage: 'St. George\'s Anglican Church, Road Town', officiantName: 'Reverend John Hodge' } },
    { slug: 'drivers-license-renewal', name: 'Tyrone Hodge', email: 'tyrone.h@bvi.gov.vg', phone: '+1-284-543-9900', status: 'payment_pending', daysAgo: 1, data: { fullName: 'Tyrone Hodge', licenseNumber: 'DL-4521', dateOfBirth: '1988-11-03', currentExpiry: '2025-05-15', address: 'Hannahs Estate, Tortola', bloodType: 'O+' } },
    { slug: 'birth-certificate', name: 'Destiny Gumbs', email: 'destiny.g@yahoo.com', phone: '+1-284-442-5600', status: 'payment_verified', daysAgo: 2, data: { fullName: 'Destiny Rose Gumbs', dateOfBirth: '2025-03-20', placeOfBirth: 'Peebles Hospital, Tortola', sex: 'Female', fathersName: 'Andre Gumbs', mothersName: 'Patricia Gumbs' } },
    { slug: 'business-registration', name: 'Island Tech Solutions', email: 'admin@islandtechbvi.com', phone: '+1-284-494-1200', status: 'submitted', daysAgo: 0, data: { companyName: 'Island Tech Solutions Ltd', registeredAddress: '2nd Floor, Banco Popular Building, Road Town', businessType: 'LLC', directorsNames: 'Mark Vanterpool, Lisa Penn', shareCapital: '50,000', objectives: 'Information technology consulting and software development services' } },
    { slug: 'police-certificate', name: 'Omar Fahie', email: 'omar.fahie@hotmail.com', phone: '+1-284-546-8800', status: 'approved', daysAgo: 6, data: { fullName: 'Omar Fahie', dateOfBirth: '1992-08-10', placeOfBirth: 'Virgin Gorda', purpose: 'Employment', address: 'The Valley, Virgin Gorda', addressHistory: 'The Valley, VG (2020-present)\nRoad Town, Tortola (2017-2020)' } },
    { slug: 'tax-filing', name: 'Patricia Scatliffe', email: 'p.scatliffe@bvi.gov.vg', phone: '+1-284-547-2200', status: 'issued', daysAgo: 15, data: { taxpayerName: 'Patricia Scatliffe', tin: 'TIN-100245', taxYear: '2024', totalIncome: '68,500', deductions: '12,000' } },
    { slug: 'work-permit', name: 'Priya Sharma', email: 'priya.sharma@email.com', phone: '+1-284-345-4400', status: 'submitted', daysAgo: 0, data: { applicantName: 'Priya Sharma', passportNumber: 'P88765432', nationality: 'India', positionApplied: 'Accountant', employerName: 'KPMG BVI', employerAddress: 'Oliver Estate, Road Town', salaryRange: '$4,000 - $5,000', contractDuration: '12' } },
    { slug: 'death-certificate', name: 'Estate of Vernon Vanterpool', email: 'j.vanterpool@gmail.com', phone: '+1-284-549-1100', status: 'issued', daysAgo: 20, data: { deceasedName: 'Vernon Vanterpool', dateOfDeath: '2025-02-10', placeOfDeath: 'Peebles Hospital, Tortola', sex: 'Male', causeOfDeath: 'Cardiac arrest', informantName: 'Janet Vanterpool' } },
    { slug: 'trade-license', name: 'Sunsail Beach Bar', email: 'sunsail@bvicommerce.com', phone: '+1-284-495-6600', status: 'rejected', daysAgo: 4, data: { businessName: 'Sunsail Beach Bar & Grill', businessAddress: 'Cane Garden Bay', businessType: 'Restaurant', ownerName: 'Peter Lettsome', ownerIdNumber: 'BVI-67123', contactPhone: '+1-284-495-6600', email: 'sunsail@bvicommerce.com' } },
    { slug: 'passport-application', name: 'Aaliyah Creque', email: 'aaliyah.c@gmail.com', phone: '+1-284-548-3300', status: 'payment_pending', daysAgo: 1, data: { fullName: 'Aaliyah Marie Creque', dateOfBirth: '2000-12-05', placeOfBirth: 'Road Town, Tortola', sex: 'Female', height: '170', eyeColor: 'Brown', address: '62 Purcell Estate, Tortola', emergencyContact: 'Michelle Creque +1-284-548-3301' } },
    { slug: 'drivers-license-renewal', name: 'Brandon Georges', email: 'brandon.g@email.com', phone: '+1-284-541-7700', status: 'issued', daysAgo: 5, data: { fullName: 'Brandon Georges', licenseNumber: 'DL-8832', dateOfBirth: '1994-04-18', currentExpiry: '2025-04-01', address: 'Sea Cows Bay, Tortola', bloodType: 'B+' } },
  ];

  for (const app of apps) {
    const service = await prisma.govService.findUnique({ where: { slug: app.slug } });
    if (!service) continue;

    const trackingNumber = genTracking();
    const createdAt = new Date(now.getTime() - app.daysAgo * day);

    let paidAt = null;
    let reviewedAt = null;
    let issuedAt = null;

    if (['payment_verified', 'processing', 'approved', 'issued', 'rejected'].includes(app.status)) {
      paidAt = new Date(createdAt.getTime() + day);
    }
    if (['processing', 'approved', 'issued', 'rejected'].includes(app.status)) {
      reviewedAt = new Date(createdAt.getTime() + 2 * day);
    }
    if (app.status === 'issued') {
      issuedAt = new Date(createdAt.getTime() + service.processingDays * day);
    }

    const application = await prisma.govApplication.create({
      data: {
        serviceId: service.id,
        trackingNumber,
        applicantName: app.name,
        applicantEmail: app.email,
        applicantPhone: app.phone,
        formData: JSON.stringify(app.data),
        status: app.status,
        paymentStatus: ['payment_pending', 'submitted'].includes(app.status) ? 'unpaid' : 'paid',
        paymentAmount: service.feeAmount,
        paidAt,
        reviewedBy: (app.status !== 'submitted' && app.status !== 'payment_pending') ? 'k.wheatley@bvi.gov.vg' : null,
        reviewedAt,
        issuedAt,
        certificateNumber: app.status === 'issued' ? 'CERT-' + Math.random().toString(36).substring(2, 10).toUpperCase() : null,
        rejectionReason: app.status === 'rejected' ? 'Incomplete documentation: Business plan and NIB registration not provided.' : null,
        createdAt,
      },
    });

    // Create timeline entries
    const timelineData = [
      { status: 'submitted', note: 'Application submitted online', actor: 'citizen', daysOffset: 0 },
    ];
    if (paidAt) timelineData.push({ status: 'payment_verified', note: 'Payment of $' + service.feeAmount + ' USD verified', actor: 'system', daysOffset: 1 });
    if (reviewedAt) timelineData.push({ status: 'processing', note: 'Application assigned to officer for review', actor: 'officer', daysOffset: 2 });
    if (app.status === 'approved') timelineData.push({ status: 'approved', note: 'Application approved, document pending issuance', actor: 'officer', daysOffset: 3 });
    if (app.status === 'issued') timelineData.push({ status: 'issued', note: 'Document issued and sent to applicant', actor: 'officer', daysOffset: service.processingDays });
    if (app.status === 'rejected') timelineData.push({ status: 'rejected', note: 'Application rejected: Incomplete documentation', actor: 'officer', daysOffset: 3 });

    for (const tl of timelineData) {
      await prisma.applicationTimeline.create({
        data: {
          applicationId: application.id,
          status: tl.status,
          note: tl.note,
          actor: tl.actor,
          createdAt: new Date(createdAt.getTime() + tl.daysOffset * day),
        },
      });
    }

    // Create payment record
    if (paidAt) {
      await prisma.payment.create({
        data: {
          applicationId: application.id,
          amount: service.feeAmount,
          method: 'credit_card',
          status: 'completed',
          receiptNumber: 'RCP-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          paidAt,
        },
      });
    }
  }
  console.log('Applications seeded:', apps.length);

  console.log('Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
