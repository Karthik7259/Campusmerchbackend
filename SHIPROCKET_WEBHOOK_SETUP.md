# Shiprocket Webhook Setup Guide

## Overview
This system automatically updates order status when Shiprocket ships the order using webhooks.

## Webhook Endpoint
```
POST https://yourdomain.com/api/shiprocket/webhook
```

## Setup Steps

### 1. Configure Webhook in Shiprocket Dashboard

1. Log in to your Shiprocket account
2. Go to **Settings** > **API** > **Webhooks**
3. Click **Add Webhook**
4. Configure the webhook:
   - **URL**: `https://yourdomain.com/api/shiprocket/webhook`
   - **Events**: Select the following events:
     - ✅ Order Picked Up
     - ✅ Order Shipped / In Transit
     - ✅ Out for Delivery
     - ✅ Order Delivered
     - ✅ Order Cancelled
     - ✅ RTO Initiated
   - **Status**: Active

### 2. Status Mapping

The webhook automatically maps Shiprocket statuses to your order statuses:

| Shiprocket Status | Your Order Status |
|------------------|-------------------|
| PICKUP_SCHEDULED | Order Placed |
| PICKUP_GENERATED | Order Placed |
| PICKED_UP | Shipped |
| MANIFESTED | Shipped |
| IN_TRANSIT | Shipped |
| OUT_FOR_DELIVERY | Shipped |
| DELIVERED | Delivered |
| CANCELLED | Cancelled |
| RTO_INITIATED | Cancelled |

### 3. Testing the Webhook

#### Local Testing (using ngrok)
```bash
# Install ngrok if you haven't
npm install -g ngrok

# Start your backend server
cd backend
npm start

# In another terminal, start ngrok
ngrok http 4000

# Use the ngrok URL in Shiprocket webhook settings
# Example: https://abc123.ngrok.io/api/shiprocket/webhook
```

#### Manual Test
```bash
# Test webhook with curl
curl -X POST https://yourdomain.com/api/shiprocket/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": 12345,
    "current_status": "PICKED_UP",
    "awb_code": "AWB123456"
  }'
```

### 4. Webhook Security (Optional)

To secure your webhook, you can add token verification:

1. In Shiprocket, set a custom header:
   - Header Name: `X-Shiprocket-Token`
   - Value: `your-secret-token`

2. Verify in webhook handler (add to shiprocketController.js):
```javascript
export const shiprocketWebhook = async (req, res) => {
    // Verify webhook token
    const token = req.headers['x-shiprocket-token'];
    if (token !== process.env.SHIPROCKET_WEBHOOK_TOKEN) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    // ... rest of the code
}
```

3. Add to .env:
```
SHIPROCKET_WEBHOOK_TOKEN=your-secret-token
```

## How It Works

1. **Order Placement**: When customer places order, it's created in Shiprocket
2. **Status Updates**: Shiprocket sends webhook when order status changes
3. **Automatic Update**: Webhook handler updates order status in database
4. **User Sees Update**: Customer sees updated status on Orders page

## Monitoring

Check webhook logs:
```bash
# Backend logs will show:
Shiprocket webhook received: { order_id: 12345, current_status: "PICKED_UP" }
Order 65f7a8b9c1d2e3f4a5b6c7d8 status updated to: Shipped (Shiprocket: PICKED_UP)
```

## Troubleshooting

### Webhook not receiving data
- Check if webhook URL is publicly accessible
- Verify URL in Shiprocket settings
- Check if backend server is running
- Review Shiprocket webhook logs in their dashboard

### Order status not updating
- Check backend logs for webhook data
- Verify `shiprocket_order_id` is saved in order
- Ensure status mapping is correct

### Testing without actual shipment
- Use Shiprocket's test mode
- Or manually call the webhook endpoint with test data

## Production Deployment

1. Deploy backend to production server
2. Get production URL (e.g., https://api.yourcampusmerch.com)
3. Update webhook URL in Shiprocket to production URL
4. Monitor webhook logs for first few orders
5. Verify order status updates correctly

## Notes

- Webhook always returns 200 status to prevent Shiprocket retries
- AWB code is automatically saved when received
- Status updates are logged for debugging
- Old orders without `shiprocket_order_id` won't be updated (expected)
