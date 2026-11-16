'use client';

import React, { useState } from 'react';
import { loadRazorpayScript } from '@/lib/loadRazorpay';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

export default function TestPaymentPage() {
  const [amountRupees, setAmountRupees] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusLog, setStatusLog] = useState<Array<{ stage: string; status: 'pending' | 'success' | 'error'; message: string; timestamp: string }>>([]);
  const [lastPaymentResult, setLastPaymentResult] = useState<any>(null);

  const addLog = (stage: string, status: 'pending' | 'success' | 'error', message: string) => {
    setStatusLog((prev) => [
      ...prev,
      {
        stage,
        status,
        message,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleTestCheckout = async () => {
    setIsLoading(true);
    setStatusLog([]);
    setLastPaymentResult(null);

    try {
      // Step 1: Ensure Razorpay SDK script is loaded
      addLog('SDK Load', 'pending', 'Loading Razorpay Standard Checkout script...');
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !(window as any).Razorpay) {
        addLog('SDK Load', 'error', 'Failed to load https://checkout.razorpay.com/v1/checkout.js');
        setIsLoading(false);
        return;
      }
      addLog('SDK Load', 'success', 'Razorpay Standard Checkout SDK loaded successfully.');

      // Step 2: Call backend /api/create-order (amount in paise)
      const amountInPaise = Math.round(amountRupees * 100);
      addLog('Order Creation', 'pending', `Calling POST /api/create-order for ₹${amountRupees} (${amountInPaise} paise)...`);

      const createRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `test_rcpt_${Date.now()}`,
          notes: {
            purpose: 'Razorpay Standard Integration Verification',
            environment: 'test',
          },
        }),
      });

      const orderData = await createRes.json();
      if (!createRes.ok || !orderData.success) {
        addLog('Order Creation', 'error', orderData.error || 'Failed to create Razorpay order.');
        setIsLoading(false);
        return;
      }

      addLog(
        'Order Creation',
        'success',
        `Razorpay Order created: ${orderData.order_id} | Amount: ${orderData.amount} paise`
      );

      // Step 3: Open Razorpay modal
      const keyId = orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Mewak Tech India',
        description: 'Razorpay Test Checkout Verification',
        order_id: orderData.order_id,
        prefill: {
          name: 'Patron Tester',
          email: 'patron.test@mewak.in',
          contact: '9999999999',
        },
        theme: {
          color: '#2B1A16',
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          addLog(
            'Payment Modal',
            'success',
            `Payment authorized: ${response.razorpay_payment_id}. Proceeding to HMAC verification...`
          );

          // Step 4: Verify signature via POST /api/verify-payment
          addLog('Signature Verification', 'pending', 'Sending signature to POST /api/verify-payment...');
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              addLog('Signature Verification', 'success', 'HMAC-SHA256 signature verified successfully!');
              setLastPaymentResult({
                status: 'PAID & VERIFIED',
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              });
            } else {
              addLog('Signature Verification', 'error', verifyData.error || 'Signature mismatch detected!');
              setLastPaymentResult({
                status: 'VERIFICATION FAILED',
                error: verifyData.error,
              });
            }
          } catch (vErr: any) {
            addLog('Signature Verification', 'error', vErr.message || 'Network error verifying signature.');
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            addLog('Payment Modal', 'error', 'Checkout modal was dismissed by user (cancelled).');
            setIsLoading(false);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);

      razorpayInstance.on('payment.failed', function (failureData: any) {
        console.error('Razorpay payment.failed:', failureData?.error);
        addLog(
          'Payment Error',
          'error',
          failureData?.error?.description || 'Razorpay reports payment failed or was declined.'
        );
        setIsLoading(false);
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      addLog('Process Error', 'error', err.message || 'An error occurred during test checkout.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFE8DD] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-8 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#9A8029] mb-2">
            <ShieldCheck className="w-4 h-4" /> Razorpay Standard Web Checkout
          </div>
          <h1 className="font-serif text-3xl text-[#2B1A16] font-medium mb-3">
            Payment Gateway Integration Test
          </h1>
          <p className="text-sm text-[#2B1A16]/80 font-sans leading-relaxed">
            This harness directly tests the complete 3-step Razorpay Standard Web Checkout workflow with live test credentials (<code>rzp_test_U0snyeo2Seeyra</code>).
          </p>

          <div className="mt-6 pt-6 border-t border-[#DDD2C0] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="bg-[#EFE8DD] p-3 rounded">
              <span className="text-[#2B1A16]/60 block mb-1">Step 1: Order API</span>
              <span className="font-semibold text-[#2B1A16]">POST /api/create-order</span>
            </div>
            <div className="bg-[#EFE8DD] p-3 rounded">
              <span className="text-[#2B1A16]/60 block mb-1">Step 2: Modal UI</span>
              <span className="font-semibold text-[#2B1A16]">Razorpay Standard SDK</span>
            </div>
            <div className="bg-[#EFE8DD] p-3 rounded">
              <span className="text-[#2B1A16]/60 block mb-1">Step 3: Verification</span>
              <span className="font-semibold text-[#2B1A16]">POST /api/verify-payment</span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-[#FBF7F0] border border-[#DDD2C0] rounded-[4px] p-8 shadow-sm space-y-6">
          <h2 className="font-serif text-xl text-[#2B1A16] font-medium">Trigger Test Checkout</h2>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-1/2">
              <label className="block text-xs uppercase tracking-wider text-[#2B1A16]/70 mb-1.5 font-sans font-medium">
                Test Amount (INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-[#2B1A16]/60 font-sans">₹</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(Math.max(1, Number(e.target.value)))}
                  className="w-full pl-8 pr-3 py-2 bg-[#EFE8DD] border border-[#DDD2C0] rounded text-sm font-sans focus:outline-none focus:border-[#2B1A16]"
                />
              </div>
              <span className="text-[11px] text-[#2B1A16]/60 font-sans mt-1 block">
                Min. 100 paise (₹1.00)
              </span>
            </div>

            <div className="w-full sm:w-1/2 flex items-end">
              <button
                onClick={handleTestCheckout}
                disabled={isLoading}
                className="w-full bg-[#2B1A16] hover:bg-[#9A8029] disabled:bg-[#2B1A16]/50 text-[#EFE8DD] text-xs font-semibold uppercase tracking-widest py-3 px-6 rounded-[4px] transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    Pay ₹{amountRupees.toLocaleString('en-IN')} via Razorpay <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 bg-[#EFE8DD]/70 rounded border border-[#DDD2C0] text-xs text-[#2B1A16]/80 font-sans leading-relaxed">
            <span className="font-semibold block mb-1 text-[#2B1A16]">Test Payment Tip:</span>
            In the Razorpay test modal, select <strong>Netbanking</strong> (any bank) or <strong>Card</strong> (e.g. <code>4111 1111 1111 1111</code>, exp date in future, CVV <code>123</code>, OTP <code>123456</code>) to simulate an instant authorized payment.
          </div>
        </div>

        {/* Live Execution Logs */}
        {statusLog.length > 0 && (
          <div className="bg-[#2B1A16] text-[#EFE8DD] rounded-[4px] p-6 shadow-md font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="text-[#9A8029] uppercase tracking-wider font-semibold">Live Transaction Trace</span>
              <button
                onClick={() => setStatusLog([])}
                className="text-white/60 hover:text-white flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" /> Clear
              </button>
            </div>

            <div className="space-y-2">
              {statusLog.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="text-white/40 text-[10px] whitespace-nowrap mt-0.5">{log.timestamp}</span>
                  {log.status === 'pending' && <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-400 shrink-0 mt-0.5" />}
                  {log.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                  {log.status === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />}
                  <div>
                    <span className="text-white/60 font-semibold mr-1.5">[{log.stage}]</span>
                    <span>{log.message}</span>
                  </div>
                </div>
              ))}
            </div>

            {lastPaymentResult && (
              <div className="mt-4 pt-4 border-t border-white/10 bg-black/20 p-3 rounded">
                <div className="text-[#9A8029] font-bold mb-1">Verification Summary:</div>
                <pre className="text-[11px] overflow-x-auto text-emerald-300">
                  {JSON.stringify(lastPaymentResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
