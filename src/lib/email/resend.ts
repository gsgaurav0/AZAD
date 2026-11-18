// ==============================================================================
// MEWAK LUXURY COMMERCE - RESEND EMAIL INTEGRATION & LUXURY HTML TEMPLATES
// ==============================================================================

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
  devMode?: boolean;
}

const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Dispatches an email using Resend API (https://resend.com).
 * In development or when RESEND_API_KEY is not set, safely logs a preview and succeeds.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const recipientList = Array.isArray(to) ? to : [to];
  const sender = from || process.env.RESEND_FROM_EMAIL || 'Mewak Luxury <onboarding@resend.dev>';

  // Dev mode or unconfigured API key: log safely without crashing
  if (!apiKey || apiKey.startsWith('re_placeholder') || apiKey === 'your_resend_api_key_here') {
    console.log('\n======================================================');
    console.log('💎 [MEWAK RESEND EMAIL - DEV LOG]');
    console.log(`📤 FROM: ${sender}`);
    console.log(`📥 TO: ${recipientList.join(', ')}`);
    console.log(`📌 SUBJECT: ${subject}`);
    console.log('📝 TEXT PREVIEW:');
    console.log(text || html.replace(/<[^>]*>?/gm, '').slice(0, 300) + '...');
    console.log('======================================================\n');
    return {
      success: true,
      id: `dev_${Date.now()}`,
      devMode: true,
    };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: recipientList,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ''),
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('❌ Resend API Error:', data);
      return {
        success: false,
        error: data.message || data.error || `Failed to dispatch email (HTTP ${res.status})`,
      };
    }

    console.log(`✅ Resend Email Dispatched [ID: ${data.id}] to ${recipientList.join(', ')}`);
    return {
      success: true,
      id: data.id,
    };
  } catch (err: any) {
    console.error('❌ Resend Network Exception:', err);
    return {
      success: false,
      error: err.message || 'Network error communicating with Resend server.',
    };
  }
}

// ------------------------------------------------------------------------------
// LUXURY HTML TEMPLATES
// ------------------------------------------------------------------------------

const BASE_CONTAINER_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #EFE8DD;
  margin: 0;
  padding: 30px 15px;
  color: #2B1A16;
`;

const CARD_STYLE = `
  max-width: 580px;
  margin: 0 auto;
  background-color: #FBF7F0;
  border: 1px solid #DDD2C0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(43, 26, 22, 0.06);
`;

const HEADER_STYLE = `
  background-color: #2B1A16;
  padding: 30px 25px;
  text-align: center;
`;

const BRAND_TITLE_STYLE = `
  color: #EFE8DD;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: 4px;
  margin: 0;
`;

const BRAND_SUB_STYLE = `
  color: #9A8029;
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-top: 6px;
  font-weight: 500;
`;

const BODY_STYLE = `
  padding: 35px 30px;
`;

const OTP_BOX_STYLE = `
  background-color: #EFE8DD;
  border: 1px solid #DDD2C0;
  border-radius: 4px;
  padding: 18px 24px;
  text-align: center;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 10px;
  color: #2B1A16;
  margin: 25px 0;
`;

const BUTTON_STYLE = `
  display: inline-block;
  background-color: #9A8029;
  color: #FFFFFF !important;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 14px 28px;
  border-radius: 3px;
  margin: 20px 0;
  text-align: center;
`;

const FOOTER_STYLE = `
  background-color: #F5EFE6;
  border-top: 1px solid #DDD2C0;
  padding: 24px 20px;
  text-align: center;
  font-size: 11px;
  color: #7A6F68;
  line-height: 1.6;
`;

/**
 * 1. Email Verification Template (Sign Up / Resend Verification)
 */
export function renderVerificationEmailTemplate({
  name,
  code,
  verifyUrl,
}: {
  name: string;
  code: string;
  verifyUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify Your Mewak Luxury Account</title>
</head>
<body style="${BASE_CONTAINER_STYLE}">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <div style="${CARD_STYLE}">
          <!-- Header -->
          <div style="${HEADER_STYLE}">
            <h1 style="${BRAND_TITLE_STYLE}">MEWAK</h1>
            <div style="${BRAND_SUB_STYLE}">ELECTRONICS & AUDIO • FLAGSHIP ATELIER</div>
          </div>

          <!-- Body -->
          <div style="${BODY_STYLE}">
            <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; color: #2B1A16; font-weight: 500; margin-top: 0;">
              Verify Your Patron Email
            </h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4A3E39; margin-bottom: 20px;">
              Greetings ${name || 'Patron'},<br/><br/>
              Thank you for registering with Mewak Luxury Tech. To secure your account and activate your Gold Patron benefits, please use the 6-digit authentication token below:
            </p>

            <!-- OTP Box -->
            <div style="${OTP_BOX_STYLE}">
              ${code}
            </div>

            <p style="font-size: 13px; line-height: 1.6; color: #6E625B; text-align: center;">
              This authentication token is valid for <strong>15 minutes</strong>. If you did not request this verification, you can safely ignore this email.
            </p>

            <div style="text-align: center; margin-top: 25px;">
              <a href="${verifyUrl}" style="${BUTTON_STYLE}" target="_blank">
                One-Click Verify Email
              </a>
            </div>

            <p style="font-size: 11px; color: #9A8E85; text-align: center; margin-top: 15px;">
              Or copy and paste this verification URL into your browser:<br/>
              <a href="${verifyUrl}" style="color: #9A8029; word-break: break-all;">${verifyUrl}</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="${FOOTER_STYLE}">
            <p style="margin: 0 0 6px 0; font-weight: 600; color: #4A3E39;">MEWAK FLAGSHIP BOUTIQUES</p>
            <p style="margin: 0 0 6px 0;">New Delhi • Mumbai • Bengaluru • London</p>
            <p style="margin: 0; color: #9A8E85;">
              256-Bit Encrypted Secure Communication • 2-Year Official Brand Warranty Included
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 2. Password Reset Template (Forgot Password / Resend Reset Link)
 */
export function renderPasswordResetEmailTemplate({
  name,
  code,
  resetUrl,
}: {
  name: string;
  code: string;
  resetUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Mewak Password</title>
</head>
<body style="${BASE_CONTAINER_STYLE}">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <div style="${CARD_STYLE}">
          <!-- Header -->
          <div style="${HEADER_STYLE}">
            <h1 style="${BRAND_TITLE_STYLE}">MEWAK</h1>
            <div style="${BRAND_SUB_STYLE}">SECURITY & PATRON RECOVERY</div>
          </div>

          <!-- Body -->
          <div style="${BODY_STYLE}">
            <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; color: #2B1A16; font-weight: 500; margin-top: 0;">
              Password Reset Request
            </h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4A3E39; margin-bottom: 20px;">
              Hello ${name || 'Patron'},<br/><br/>
              We received a request to reset the password for your Mewak luxury account. You can enter the 6-digit recovery code on the website, or click the button below to configure a new password directly:
            </p>

            <!-- OTP Box -->
            <div style="${OTP_BOX_STYLE}">
              ${code}
            </div>

            <div style="text-align: center; margin-top: 25px;">
              <a href="${resetUrl}" style="${BUTTON_STYLE}" target="_blank">
                Reset My Password
              </a>
            </div>

            <p style="font-size: 13px; line-height: 1.6; color: #6E625B; text-align: center; margin-top: 20px;">
              This password reset link and token expire in <strong>15 minutes</strong>.<br/>
              If you did not initiate this recovery, please disregard this notice or contact our concierge immediately.
            </p>

            <p style="font-size: 11px; color: #9A8E85; text-align: center; margin-top: 15px;">
              Direct link: <a href="${resetUrl}" style="color: #9A8029; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="${FOOTER_STYLE}">
            <p style="margin: 0 0 6px 0; font-weight: 600; color: #4A3E39;">MEWAK CLIENT CONCIERGE</p>
            <p style="margin: 0 0 6px 0;">Need immediate help? Reach us at support@mewak.com</p>
            <p style="margin: 0; color: #9A8E85;">
              Bank-Grade TLS Security • Never share your recovery codes with anyone.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 3. Order Confirmation Receipt Template
 */
export function renderOrderConfirmationEmailTemplate({
  name,
  orderId,
  items,
  total,
  paymentMethod,
  address,
  trackingUrl,
}: {
  name: string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
  }>;
  total: number;
  paymentMethod: string;
  address: {
    name?: string;
    street: string;
    city: string;
    state?: string;
    pincode: string;
  };
  trackingUrl: string;
}) {
  const itemRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #DDD2C0; font-size: 13px; color: #2B1A16;">
        <strong>${item.name}</strong><br/>
        <span style="font-size: 11px; color: #7A6F68;">
          ${item.color ? `Color: ${item.color} ` : ''}
          ${item.size ? `• Edition: ${item.size}` : ''}
        </span>
      </td>
      <td align="center" style="padding: 12px 0; border-bottom: 1px solid #DDD2C0; font-size: 13px; color: #2B1A16;">
        × ${item.quantity}
      </td>
      <td align="right" style="padding: 12px 0; border-bottom: 1px solid #DDD2C0; font-size: 13px; color: #2B1A16; font-weight: 600;">
        ₹${(item.price * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmed - Mewak Luxury Tech</title>
</head>
<body style="${BASE_CONTAINER_STYLE}">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <div style="${CARD_STYLE}">
          <!-- Header -->
          <div style="${HEADER_STYLE}">
            <h1 style="${BRAND_TITLE_STYLE}">MEWAK</h1>
            <div style="${BRAND_SUB_STYLE}">ORDER CONFIRMATION & INVOICE</div>
          </div>

          <!-- Body -->
          <div style="${BODY_STYLE}">
            <div style="text-align: center; margin-bottom: 25px;">
              <span style="background-color: #4C7A34; color: #FFFFFF; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 5px 12px; border-radius: 2px;">
                CONFIRMED & SCHEDULED FOR DISPATCH
              </span>
            </div>

            <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; color: #2B1A16; font-weight: 500; margin: 0 0 10px 0; text-align: center;">
              Thank you for your order, ${name || 'Patron'}.
            </h2>
            <p style="font-size: 13px; text-align: center; color: #6E625B; margin: 0 0 25px 0;">
              Order Number: <strong style="color: #2B1A16; font-family: monospace;">#${orderId}</strong> • Payment: <strong>${paymentMethod}</strong>
            </p>

            <!-- Items Table -->
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
              <thead>
                <tr style="border-bottom: 2px solid #2B1A16;">
                  <th align="left" style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #7A6F68; padding-bottom: 8px;">Product</th>
                  <th align="center" style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #7A6F68; padding-bottom: 8px;">Qty</th>
                  <th align="right" style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #7A6F68; padding-bottom: 8px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
                <tr>
                  <td colspan="2" style="padding-top: 15px; font-size: 14px; font-weight: 700; color: #2B1A16;">
                    Total Invoiced Amount
                  </td>
                  <td align="right" style="padding-top: 15px; font-size: 16px; font-weight: 700; color: #9A8029;">
                    ₹${total.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Shipping Destination -->
            <div style="background-color: #EFE8DD; border: 1px solid #DDD2C0; border-radius: 4px; padding: 15px 18px; margin: 25px 0;">
              <h4 style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #9A8029;">
                Delivery Destination
              </h4>
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #4A3E39;">
                <strong>${address.name || name}</strong><br/>
                ${address.street}, ${address.city}, ${address.state || ''} - ${address.pincode}
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center;">
              <a href="${trackingUrl}" style="${BUTTON_STYLE}" target="_blank">
                Track Live Shipment
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="${FOOTER_STYLE}">
            <p style="margin: 0 0 6px 0; font-weight: 600; color: #4A3E39;">EXPRESS AIR DISPATCH VIA BLUEDART</p>
            <p style="margin: 0 0 6px 0;">Includes complimentary 15-day home trials & 2-year official brand replacement warranty.</p>
            <p style="margin: 0; color: #9A8E85;">
              Mewak Commerce • Automated Order Notification
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
