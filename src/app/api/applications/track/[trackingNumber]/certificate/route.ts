import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES, mapApplication, mapService } from '@/lib/supabase';
import { generatePoliceCertificatePDF, generateGenericCertificatePDF } from '@/lib/generate-pdf';

/**
 * GET /api/applications/track/[trackingNumber]/certificate
 *
 * PUBLIC endpoint — no auth required.
 * Looks up an application by tracking number and, if its status is "issued",
 * generates and serves the PDF certificate.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await params;

    // ── 1. Lookup application by tracking number ──
    const { data: appRows, error: fetchError } = await supabase
      .from(TABLES.APPLICATIONS)
      .select('*')
      .eq('tracking_number', trackingNumber)
      .limit(1);

    if (fetchError || !appRows?.[0]) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const application = mapApplication(appRows[0]);

    if (application.status !== 'issued') {
      return NextResponse.json(
        { error: 'Certificate is not yet available for this application.' },
        { status: 404 }
      );
    }

    const formData = JSON.parse(application.formData || '{}');
    const certificateNumber = application.certificateNumber || `CERT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // ── 2. Fetch the associated service ──
    const { data: serviceRows } = await supabase
      .from(TABLES.SERVICES)
      .select('*')
      .eq('id', application.serviceId)
      .limit(1);
    const service = serviceRows?.[0] ? mapService(serviceRows[0]) : null;

    const slug = service?.slug || '';
    const dateIssued = application.issuedAt || new Date().toISOString();

    let pdfBuffer: Buffer;
    let fileName: string;

    if (slug === 'police-certificate') {
      const fullName = [formData.surname, formData.givenNames].filter(Boolean).join(' ') || application.applicantName;

      const pdfData = {
        certificateNumber,
        fullName,
        dateOfBirth: formData.dateOfBirth || '',
        placeOfBirth: formData.placeOfBirth || '',
        nationality: formData.nationality || '',
        passportNumber: formData.passportNumber || undefined,
        occupation: formData.occupation || undefined,
        address: formData.physicalAddress || undefined,
        dateIssued,
        dateExpires: new Date(Date.now() + 6 * 30 * 86400000).toISOString().split('T')[0],
        isConvicted: formData.convictedBVICrime === 'YES',
        convictionDetails: formData.convictionDetails || undefined,
        convictionYears: formData.convictionYears || undefined,
        purpose: formData.purpose || '',
        issuedBy: 'Commissioner of Police',
      };

      pdfBuffer = generatePoliceCertificatePDF(pdfData);
      fileName = `police-certificate-${certificateNumber}.pdf`;
    } else {
      let formFieldDefs: Array<{ key: string; label: string; type?: string }> = [];
      try {
        formFieldDefs = JSON.parse(service?.formFields || '[]');
      } catch {
        formFieldDefs = Object.keys(formData).map((key) => ({
          key,
          label: key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (s) => s.toUpperCase()),
        }));
      }

      const details: Record<string, string> = {};
      for (const field of formFieldDefs) {
        const value = formData[field.key];
        if (value !== undefined && value !== null && value !== '') {
          const label = field.label.endsWith(':') ? field.label : field.label + ':';
          details[label] = String(value);
        }
      }

      const applicantName =
        formData.fullName ||
        formData.applicantName ||
        formData.ownerName ||
        formData.businessName ||
        formData.companyName ||
        formData.taxpayerName ||
        formData.deceasedName ||
        application.applicantName;

      const certType = service?.name || 'Certificate';
      const department = service?.department || 'Government of the Virgin Islands';

      pdfBuffer = generateGenericCertificatePDF({
        certificateNumber,
        dateIssued,
        type: certType,
        applicantName,
        details,
        department,
        issuedBy: `Director, ${department}`,
      });

      fileName = `${slug}-certificate-${certificateNumber}.pdf`;
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error generating public certificate PDF:', error);
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}
