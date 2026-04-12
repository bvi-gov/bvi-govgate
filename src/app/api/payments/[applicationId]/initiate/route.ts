import { NextRequest, NextResponse } from 'next/server';
import { supabase, TABLES, mapApplication, mapService, mapPayment } from '@/lib/supabase';
import { getPaymentService, calculateTotal, getAvailablePaymentMethods } from '@/lib/payment';
import type { PaymentMethod } from '@/lib/payment';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const body = await request.json();
    const { method = 'credit_card' } = body;

    // Validate application
    const { data: appRows, error: fetchError } = await supabase
      .from(TABLES.APPLICATIONS)
      .select('*')
      .eq('id', applicationId)
      .limit(1);

    if (fetchError || !appRows?.[0]) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const application = mapApplication(appRows[0]);

    // Validate payment method
    const availableMethods = getAvailablePaymentMethods();
    const methodConfig = availableMethods.find((m) => m.method === method);
    if (!methodConfig) {
      return NextResponse.json(
        { error: `Payment method "${method}" is not available` },
        { status: 400 },
      );
    }

    // Check payment status
    if (application.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'Payment has already been completed for this application' },
        { status: 400 },
      );
    }

    const amount = application.paymentAmount;

    // Calculate fees and totals
    const totals = calculateTotal(amount, method as PaymentMethod);

    // Fetch service
    const { data: serviceRows } = await supabase
      .from(TABLES.SERVICES)
      .select('*')
      .eq('id', application.serviceId)
      .limit(1);
    const service = serviceRows?.[0] ? mapService(serviceRows[0]) : null;

    // Fetch existing payment
    const { data: paymentRows } = await supabase
      .from(TABLES.PAYMENTS)
      .select('*')
      .eq('application_id', applicationId)
      .limit(1);
    const existingPayment = paymentRows?.[0] ? mapPayment(paymentRows[0]) : null;

    // Process payment
    const paymentService = getPaymentService();
    const result = await paymentService.processPayment({
      applicationId: application.id,
      trackingNumber: application.trackingNumber,
      amount,
      currency: service?.currency || 'USD',
      applicantName: application.applicantName,
      applicantEmail: application.applicantEmail,
      description: `Payment for ${service?.name || 'service'} — ${application.trackingNumber}`,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Payment initiation failed' },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();

    if (result.status === 'completed') {
      // Payment completed immediately
      if (existingPayment?.id) {
        await supabase
          .from(TABLES.PAYMENTS)
          .update({
            status: 'completed',
            method,
            gateway_ref: result.paymentRef,
            receipt_number: result.receiptNumber,
            paid_at: now,
          })
          .eq('id', existingPayment.id);
      } else {
        await supabase.from(TABLES.PAYMENTS).insert({
          application_id: application.id,
          amount,
          method,
          status: 'completed',
          gateway_ref: result.paymentRef,
          receipt_number: result.receiptNumber,
          paid_at: now,
        });
      }

      // Update application
      await supabase
        .from(TABLES.APPLICATIONS)
        .update({
          status: 'processing',
          payment_status: 'paid',
          payment_method: method,
          payment_ref: result.paymentRef,
          paid_at: now,
        })
        .eq('id', applicationId);

      await supabase.from(TABLES.TIMELINE).insert({
        application_id: applicationId,
        status: 'payment_verified',
        note: `Payment completed via ${method}. Receipt: ${result.receiptNumber}`,
        actor: 'system',
      });
    } else {
      // Payment pending
      if (existingPayment?.id) {
        await supabase
          .from(TABLES.PAYMENTS)
          .update({
            method,
            gateway_ref: result.paymentRef,
          })
          .eq('id', existingPayment.id);
      } else {
        await supabase.from(TABLES.PAYMENTS).insert({
          application_id: application.id,
          amount,
          method,
          status: 'pending',
          gateway_ref: result.paymentRef,
        });
      }

      await supabase.from(TABLES.TIMELINE).insert({
        application_id: applicationId,
        status: 'payment_initiated',
        note: `Payment initiated via ${method}. Awaiting confirmation.`,
        actor: 'system',
      });
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      paymentRef: result.paymentRef,
      receiptNumber: result.receiptNumber,
      redirectUrl: result.redirectUrl || null,
      clientSecret: result.clientSecret || null,
      trackingNumber: application.trackingNumber,
      amount,
      currency: service?.currency || 'USD',
      method,
      feeBreakdown: {
        subtotal: totals.subtotal,
        processingFee: 0,
        tax: totals.tax,
        total: totals.total,
      },
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;

    const { data: appRows, error: fetchError } = await supabase
      .from(TABLES.APPLICATIONS)
      .select('*')
      .eq('id', applicationId)
      .limit(1);

    if (fetchError || !appRows?.[0]) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const application = mapApplication(appRows[0]);

    // Fetch service and payment
    const { data: serviceRows } = await supabase
      .from(TABLES.SERVICES)
      .select('*')
      .eq('id', application.serviceId)
      .limit(1);
    const service = serviceRows?.[0] ? mapService(serviceRows[0]) : null;

    const { data: paymentRows } = await supabase
      .from(TABLES.PAYMENTS)
      .select('*')
      .eq('application_id', applicationId)
      .limit(1);
    const payment = paymentRows?.[0] ? mapPayment(paymentRows[0]) : null;

    const availableMethods = getAvailablePaymentMethods();
    const amount = application.paymentAmount;

    return NextResponse.json({
      applicationId,
      trackingNumber: application.trackingNumber,
      amount,
      currency: service?.currency || 'USD',
      paymentStatus: application.paymentStatus,
      paymentMethod: payment?.method || null,
      receiptNumber: payment?.receiptNumber || null,
      paidAt: application.paidAt || null,
      availableMethods: availableMethods.map((m) => ({
        method: m.method,
        displayName: m.displayName,
        description: m.description,
        onlinePayment: m.onlinePayment,
      })),
    });
  } catch (error) {
    console.error('Error fetching payment info:', error);
    return NextResponse.json({ error: 'Failed to fetch payment information' }, { status: 500 });
  }
}
