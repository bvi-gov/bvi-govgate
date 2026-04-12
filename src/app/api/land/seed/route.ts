import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const LAND_SERVICES = [
  {
    slug: 'property-title-search',
    name: 'Property Title Search',
    description: 'Request a comprehensive title search on any registered parcel in the British Virgin Islands. Returns ownership history, liens, and encumbrances.',
    category: 'land',
    department: 'Lands & Survey Department',
    processing_days: 5,
    fee_amount: 35,
    currency: 'USD',
    icon: 'Mountain',
    sort_order: 20,
    requirements: JSON.stringify([
      'Parcel number or property address',
      'Government-issued photo ID of requester',
      'Completed application form',
    ]),
    form_fields: JSON.stringify([
      { key: 'parcelNumber', label: 'Parcel Number', type: 'text', required: true, placeholder: 'e.g., T-001-2024' },
      { key: 'propertyAddress', label: 'Property Address', type: 'text', required: true, placeholder: 'e.g., Road Town, Tortola' },
      { key: 'requesterName', label: 'Requester Full Name', type: 'text', required: true },
      { key: 'requesterIdNumber', label: 'Requester ID Number', type: 'text', required: true },
      { key: 'purpose', label: 'Purpose of Search', type: 'select', required: true, options: ['Property Purchase', 'Legal Proceedings', 'Mortgage Application', 'Personal Records', 'Other'] },
      { key: 'additionalNotes', label: 'Additional Notes', type: 'textarea', required: false },
    ]),
  },
  {
    slug: 'property-transfer',
    name: 'Property Transfer Registration',
    description: 'Register the transfer of property ownership in the British Virgin Islands. Includes deed registration and stamp duty processing.',
    category: 'land',
    department: 'Lands & Survey Department',
    processing_days: 14,
    fee_amount: 150,
    currency: 'USD',
    icon: 'Mountain',
    sort_order: 21,
    requirements: JSON.stringify([
      'Original signed deed of transfer',
      'Current land tax receipt',
      'Stamp duty payment receipt',
      "Purchaser's government-issued photo ID",
      "Vendor's government-issued photo ID",
      'Valuation report (for properties over $100,000)',
    ]),
    form_fields: JSON.stringify([
      { key: 'parcelNumber', label: 'Parcel Number', type: 'text', required: true, placeholder: 'e.g., T-001-2024' },
      { key: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
      { key: 'vendorName', label: 'Vendor (Seller) Full Name', type: 'text', required: true },
      { key: 'vendorIdNumber', label: 'Vendor ID Number', type: 'text', required: true },
      { key: 'purchaserName', label: 'Purchaser (Buyer) Full Name', type: 'text', required: true },
      { key: 'purchaserIdNumber', label: 'Purchaser ID Number', type: 'text', required: true },
      { key: 'purchasePrice', label: 'Purchase Price (USD)', type: 'number', required: true },
      { key: 'transferDate', label: 'Date of Transfer', type: 'date', required: true },
      { key: 'instrumentNumber', label: 'Instrument Number', type: 'text', required: false },
    ]),
  },
  {
    slug: 'lien-certificate',
    name: 'Lien Certificate',
    description: 'Apply for an official lien certificate showing all active encumbrances, mortgages, and liens registered against a property.',
    category: 'land',
    department: 'Lands & Survey Department',
    processing_days: 7,
    fee_amount: 25,
    currency: 'USD',
    icon: 'Mountain',
    sort_order: 22,
    requirements: JSON.stringify([
      'Parcel number or property address',
      'Government-issued photo ID',
      'Completed application form',
    ]),
    form_fields: JSON.stringify([
      { key: 'parcelNumber', label: 'Parcel Number', type: 'text', required: true, placeholder: 'e.g., T-001-2024' },
      { key: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
      { key: 'applicantName', label: 'Applicant Full Name', type: 'text', required: true },
      { key: 'applicantIdNumber', label: 'Applicant ID Number', type: 'text', required: true },
      { key: 'purpose', label: 'Purpose', type: 'select', required: true, options: ['Mortgage Application', 'Property Sale', 'Legal Proceedings', 'Personal Records'] },
      { key: 'numberOfCopies', label: 'Number of Copies', type: 'number', required: true, placeholder: '1' },
    ]),
  },
  {
    slug: 'mortgage-registration',
    name: 'Mortgage Registration',
    description: 'Register a new mortgage or charge against a property in the British Virgin Islands Land Registry.',
    category: 'land',
    department: 'Lands & Survey Department',
    processing_days: 10,
    fee_amount: 75,
    currency: 'USD',
    icon: 'Mountain',
    sort_order: 23,
    requirements: JSON.stringify([
      'Original mortgage deed',
      'Property title deed',
      'Borrower government-issued photo ID',
      'Lender authorization letter',
      'Valuation report',
    ]),
    form_fields: JSON.stringify([
      { key: 'parcelNumber', label: 'Parcel Number', type: 'text', required: true, placeholder: 'e.g., T-001-2024' },
      { key: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
      { key: 'borrowerName', label: 'Borrower Full Name', type: 'text', required: true },
      { key: 'borrowerIdNumber', label: 'Borrower ID Number', type: 'text', required: true },
      { key: 'lenderName', label: 'Lender Name', type: 'text', required: true },
      { key: 'mortgageAmount', label: 'Mortgage Amount (USD)', type: 'number', required: true },
      { key: 'mortgageType', label: 'Mortgage Type', type: 'select', required: true, options: ['First Mortgage', 'Second Mortgage', 'Charge', 'Equity Release'] },
      { key: 'registrationDate', label: 'Date of Mortgage Instrument', type: 'date', required: true },
      { key: 'interestRate', label: 'Interest Rate (%)', type: 'text', required: false },
    ]),
  },
  {
    slug: 'mortgage-release',
    name: 'Mortgage Release',
    description: 'Apply to register the discharge or release of an existing mortgage on a property.',
    category: 'land',
    department: 'Lands & Survey Department',
    processing_days: 5,
    fee_amount: 50,
    currency: 'USD',
    icon: 'Mountain',
    sort_order: 24,
    requirements: JSON.stringify([
      'Original letter of discharge from lender',
      'Parcel number',
      'Government-issued photo ID',
      'Original mortgage registration number',
    ]),
    form_fields: JSON.stringify([
      { key: 'parcelNumber', label: 'Parcel Number', type: 'text', required: true, placeholder: 'e.g., T-001-2024' },
      { key: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
      { key: 'borrowerName', label: 'Borrower Full Name', type: 'text', required: true },
      { key: 'lenderName', label: 'Lender Name', type: 'text', required: true },
      { key: 'originalMortgageNumber', label: 'Original Mortgage Instrument Number', type: 'text', required: true },
      { key: 'dischargeDate', label: 'Date of Discharge', type: 'date', required: true },
      { key: 'applicantName', label: 'Applicant Name', type: 'text', required: true },
      { key: 'applicantIdNumber', label: 'Applicant ID Number', type: 'text', required: true },
    ]),
  },
];

const SAMPLE_PARCELS = [
  { parcel_number: 'T-001-2024', plan_number: 'PLN-TT-100', address: 'Main Street, Road Town', district: 'Tortola', area_sqft: 8500, land_use_zone: 'commercial', status: 'registered', current_owner: 'Harrigan Holdings Ltd' },
  { parcel_number: 'T-002-2024', plan_number: 'PLN-TT-101', address: 'Wickhams Cay I, Road Town', district: 'Tortola', area_sqft: 12000, land_use_zone: 'commercial', status: 'registered', current_owner: 'BVI Financial Centre Corp' },
  { parcel_number: 'V-001-2024', plan_number: 'PLN-VG-100', address: 'The Valley, Virgin Gorda', district: 'Virgin Gorda', area_sqft: 15000, land_use_zone: 'residential', status: 'registered', current_owner: 'Spanish Town Development Co' },
  { parcel_number: 'A-001-2024', plan_number: 'PLN-AN-100', address: 'The Settlement, Anegada', district: 'Anegada', area_sqft: 25000, land_use_zone: 'residential', status: 'registered', current_owner: 'Anegada Beach Resort LLC' },
  { parcel_number: 'J-001-2024', plan_number: 'PLN-JC-100', address: 'Great Harbour, Jost Van Dyke', district: 'Jost Van Dyke', area_sqft: 5000, land_use_zone: 'residential', status: 'registered', current_owner: 'Ivan Chinnery' },
  { parcel_number: 'T-003-2025', plan_number: 'PLN-TT-102', address: 'Cane Garden Bay, Tortola', district: 'Tortola', area_sqft: 6500, land_use_zone: 'residential', status: 'pending_transfer', current_owner: 'Turnbull Properties Ltd' },
  { parcel_number: 'T-004-2025', plan_number: 'PLN-TT-103', address: 'Soper\'s Hole, West End', district: 'Tortola', area_sqft: 9200, land_use_zone: 'commercial', status: 'registered', current_owner: 'West End Marina Inc' },
  { parcel_number: 'T-005-2025', plan_number: 'PLN-TT-104', address: 'Sandy Ground, Tortola', district: 'Tortola', area_sqft: 7800, land_use_zone: 'mixed_use', status: 'registered', current_owner: 'Scatliffe Enterprises' },
];

const SAMPLE_OWNERSHIPS = [
  { parcel_idx: 0, owner_name: 'Harrigan Holdings Ltd', owner_id_type: 'Business Registration', owner_id_number: 'BVI-BR-12345', ownership_type: 'freehold', share_percentage: 100, acquired_date: '2018-03-15', instrument_number: 'INS-2018-001' },
  { parcel_idx: 1, owner_name: 'BVI Financial Centre Corp', owner_id_type: 'Business Registration', owner_id_number: 'BVI-BR-67890', ownership_type: 'freehold', share_percentage: 100, acquired_date: '2019-07-22', instrument_number: 'INS-2019-045' },
  { parcel_idx: 2, owner_name: 'Spanish Town Development Co', owner_id_type: 'Business Registration', owner_id_number: 'BVI-BR-24680', ownership_type: 'leasehold', share_percentage: 100, acquired_date: '2020-01-10', instrument_number: 'INS-2020-012' },
  { parcel_idx: 3, owner_name: 'Anegada Beach Resort LLC', owner_id_type: 'Business Registration', owner_id_number: 'BVI-BR-13579', ownership_type: 'freehold', share_percentage: 100, acquired_date: '2017-11-30', instrument_number: 'INS-2017-089' },
  { parcel_idx: 4, owner_name: 'Ivan Chinnery', owner_id_type: 'BVI Passport', owner_id_number: 'BV0012345', ownership_type: 'freehold', share_percentage: 100, acquired_date: '2005-06-01', instrument_number: 'INS-2005-023' },
  { parcel_idx: 5, owner_name: 'Turnbull Properties Ltd', owner_id_type: 'Business Registration', owner_id_number: 'BVI-BR-98765', ownership_type: 'freehold', share_percentage: 100, acquired_date: '2023-09-15', instrument_number: 'INS-2023-067' },
  { parcel_idx: 6, owner_name: 'West End Marina Inc', owner_id_type: 'Business Registration', owner_id_number: 'BVI-BR-11223', ownership_type: 'leasehold', share_percentage: 100, acquired_date: '2021-04-01', instrument_number: 'INS-2021-034' },
  { parcel_idx: 7, owner_name: 'Scatliffe Enterprises', owner_id_type: 'Business Registration', owner_id_number: 'BVI-BR-44556', ownership_type: 'freehold', share_percentage: 75, acquired_date: '2022-02-28', instrument_number: 'INS-2022-019' },
  { parcel_idx: 7, owner_name: 'Maria Scatliffe', owner_id_type: 'BVI Passport', owner_id_number: 'BV0067890', ownership_type: 'freehold', share_percentage: 25, acquired_date: '2022-02-28', instrument_number: 'INS-2022-019', is_current: true },
];

const SAMPLE_LIENS = [
  { parcel_idx: 1, lien_type: 'Mortgage', creditor_name: 'First Caribbean Bank', amount: 450000, filed_date: '2020-08-15', status: 'active' },
  { parcel_idx: 6, lien_type: 'Mortgage', creditor_name: 'VP Bank (BVI) Ltd', amount: 280000, filed_date: '2021-05-20', status: 'active' },
  { parcel_idx: 3, lien_type: 'Mortgage', creditor_name: 'Development Bank of the Virgin Islands', amount: 650000, filed_date: '2018-01-10', status: 'active' },
  { parcel_idx: 5, lien_type: 'Caveat', creditor_name: 'BVI Inland Revenue', amount: 12500, filed_date: '2024-11-01', status: 'active' },
  { parcel_idx: 2, lien_type: 'Mortgage', creditor_name: 'Scotiabank BVI', amount: 320000, filed_date: '2020-06-01', release_date: '2024-10-15', status: 'released' },
  { parcel_idx: 7, lien_type: 'Easement', creditor_name: 'BVI Electricity Corporation', amount: 0, filed_date: '2019-03-22', status: 'active' },
];

export async function POST() {
  try {
    let seededServices = 0;
    let seededParcels = 0;
    let seededOwnerships = 0;
    let seededLiens = 0;

    // 1. Seed LandGate services
    for (const service of LAND_SERVICES) {
      // Check if already exists
      const { data: existing } = await supabase
        .from('gov_services')
        .select('id')
        .eq('slug', service.slug)
        .limit(1);

      if (!existing?.[0]) {
        const { error } = await supabase.from('gov_services').insert({
          ...service,
          status: 'active',
        });
        if (!error) seededServices++;
      } else {
        seededServices++;
      }
    }

    // 2. Seed sample parcels
    const parcelIds: string[] = [];

    for (const parcel of SAMPLE_PARCELS) {
      const { data: existing } = await supabase
        .from('land_parcels')
        .select('id')
        .eq('parcel_number', parcel.parcel_number)
        .limit(1);

      if (existing?.[0]) {
        parcelIds.push(existing[0].id);
        seededParcels++;
        continue;
      }

      const { data: newParcel, error } = await supabase
        .from('land_parcels')
        .insert(parcel)
        .select('id')
        .single();

      if (!error && newParcel) {
        parcelIds.push(newParcel.id);
        seededParcels++;
      }
    }

    // 3. Seed ownerships
    for (const ownership of SAMPLE_OWNERSHIPS) {
      const parcelId = parcelIds[ownership.parcel_idx];
      if (!parcelId) continue;

      const { data: existing } = await supabase
        .from('land_ownerships')
        .select('id')
        .eq('parcel_id', parcelId)
        .eq('owner_name', ownership.owner_name)
        .limit(1);

      if (existing?.[0]) {
        seededOwnerships++;
        continue;
      }

      const { owner_idx, parcel_idx, ...insertData } = ownership;
      const { error } = await supabase.from('land_ownerships').insert({
        ...insertData,
        parcel_id: parcelId,
      });
      if (!error) seededOwnerships++;
    }

    // 4. Seed liens
    for (const lien of SAMPLE_LIENS) {
      const parcelId = parcelIds[lien.parcel_idx];
      if (!parcelId) continue;

      const { data: existing } = await supabase
        .from('land_liens')
        .select('id')
        .eq('parcel_id', parcelId)
        .eq('creditor_name', lien.creditor_name)
        .limit(1);

      if (existing?.[0]) {
        seededLiens++;
        continue;
      }

      const { lien_idx, parcel_idx, ...insertData } = lien;
      const { error } = await supabase.from('land_liens').insert({
        ...insertData,
        parcel_id: parcelId,
      });
      if (!error) seededLiens++;
    }

    return NextResponse.json({
      message: 'LandGate data seeded successfully',
      services: seededServices,
      parcels: seededParcels,
      ownerships: seededOwnerships,
      liens: seededLiens,
    });
  } catch (error) {
    console.error('Error seeding LandGate data:', error);
    return NextResponse.json({ error: 'Failed to seed LandGate data' }, { status: 500 });
  }
}
