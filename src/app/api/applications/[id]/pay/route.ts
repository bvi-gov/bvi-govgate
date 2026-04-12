import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES, mapApplication, mapService, mapPayment } from '@/lib/supabase';
import { getPaymentService } from '@/lib/payment';
import type { PaymentMethod } from '@/lib/payment';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { method = 'credit_card', reviewedBy, providerPaymentRef, providerReceiptNumber } = body;

    // Fetch application with relations
    const { data: appRows, error: fetchError } = await supabase
      .from(TABLES.APPLICATIONS)
      .select('*')
      .eq('id', id)
      .limit(1);

    if (fetchError || !appRows?.[0]) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const appRow = appRows[0];
    const application = mapApplication(appRow);

    // Prevent double-payment
    if (application.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
    }

    // Fetch service
    const { data: serviceRows } = await supabase
      .from(TABLES.SERVICES)
      .select('*')
      .eq('id', application.serviceId)
      .limit(1);
    const service = serviceRows?.[0] ? mapService(serviceRows[0]) : null;

    // Fetch payment
    const { data: paymentRows } = await supabase
      .from(TABLES.PAYMENTS)
      .select('*')
      .eq('application_id', id)
      .limit(1);
    const payment = paymentRows?.[0] ? mapPayment(paymentRows[0]) : null;

    const paymentService = getPaymentService();

    // Determine if this is an admin verification or provider-confirmed payment
    const isAdminVerification = !!reviewedBy && reviewedBy !== 'system';
    let paymentRef: string;
    let receiptNumber: string;

    if (isAdminVerification) {
      const manual = paymentService.createManualPaymentRecord(
        method as PaymentMethod,
        application.paymentAmount,
      );
      paymentRef = manual.paymentRef;
      receiptNumber = manual.receiptNumber;
    } else if (providerPaymentRef && providerReceiptNumber) {
      paymentRef = providerPaymentRef;
      receiptNumber = providerReceiptNumber;
    } else {
      const result = await paymentService.processPayment({
        applicationId: application.id,
        trackingNumber: application.trackingNumber,
        amount: application.paymentAmount,
        currency: service?.currency || 'USD',
        applicantName: application.applicantName,
        applicantEmail: application.applicantEmail,
        description: `Payment for ${service?.name || 'service'} — ${application.trackingNumber}`,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Payment processing failed' },
          { status: 400 },
        );
      }

      paymentRef = result.paymentRef;
      receiptNumber = result.receiptNumber;
    }

    const now = new Date().toISOString();

    // Update the application
    const { data: updatedApp, error: updateAppError } = await supabase
      .from(TABLES.APPLICATIONS)
      .update({
        status: 'processing',
        payment_status: 'paid',
        payment_method: method,
        payment_ref: paymentRef,
        paid_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateAppError) {
      console.error('Error updating application:', updateAppError.message);
      return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
    }

    // Update or create the payment record
    if (payment?.id) {
      await supabase
        .from(TABLES.PAYMENTS)
        .update({
          status: 'completed',
          method,
          gateway_ref: paymentRef,
          receipt_number: receiptNumber,
          paid_at: now,
        })
        .eq('id', payment.id);
    } else {
      await supabase.from(TABLES.PAYMENTS).insert({
        application_id: id,
        amount: application.paymentAmount,
        method,
        status: 'completed',
        gateway_ref: paymentRef,
        receipt_number: receiptNumber,
        paid_at: now,
      });
    }

    // Create timeline entry
    await supabase.from(TABLES.TIMELINE).insert({
      application_id: id,
      status: 'payment_verified',
      note: `Payment verified via ${method}. Receipt: ${receiptNumber}`,
      actor: reviewedBy || 'system',
    });

    return NextResponse.json(mapApplication(updatedApp));
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
