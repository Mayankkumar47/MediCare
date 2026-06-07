// backend/config/paypal.js
import dotenv from 'dotenv';
dotenv.config();

let isPayPalConfigured = false;
const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";

const base = PAYPAL_MODE === "live" 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com";

if (PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET) {
  isPayPalConfigured = true;
  console.log("PayPal configured successfully in", PAYPAL_MODE, "mode.");
} else {
  console.warn("PayPal is not fully configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.");
}

export const getPayPalAccessToken = async () => {
  if (!isPayPalConfigured) return null;
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`PayPal auth failed: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching PayPal access token:", error);
    return null;
  }
};

export const createPayPalOrder = async (amountInINR, returnUrl, cancelUrl) => {
  if (!isPayPalConfigured) return null;
  try {
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) throw new Error("Could not authenticate with PayPal");

    // Convert INR to USD for sandbox compatibility (approx 1 USD = 85 INR)
    const usdAmount = (amountInINR / 85).toFixed(2);

    const response = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: usdAmount,
            },
            description: "MediCare Clinic Appointment Booking",
          },
        ],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`PayPal create order failed: ${response.status} - ${errText}`);
    }

    const order = await response.json();
    const approveLink = order.links.find((link) => link.rel === "approve" || link.rel === "payer-action");
    
    return {
      orderId: order.id,
      checkoutUrl: approveLink ? approveLink.href : null,
    };
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    return null;
  }
};

export const capturePayPalOrder = async (orderId) => {
  if (!isPayPalConfigured) return null;
  try {
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) throw new Error("Could not authenticate with PayPal");

    const response = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`PayPal capture order failed: ${response.status} - ${errText}`);
    }

    const captureData = await response.json();
    return {
      success: captureData.status === "COMPLETED",
      transactionId: captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id || orderId,
      status: captureData.status,
    };
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    return null;
  }
};
