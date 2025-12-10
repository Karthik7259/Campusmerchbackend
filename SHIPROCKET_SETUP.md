# Shiprocket Integration Setup Guide

## Overview
Complete Shiprocket shipping integration for YourCampusMerch e-commerce platform. Automatically creates shipments, assigns tracking numbers, and schedules pickups when orders are placed.

## Features Implemented

### Backend
✅ **OrderModel Updates**
- Added shipping fields: `shiprocket_order_id`, `shipment_id`, `awb_code`, `courier_name`, `tracking_url`

✅ **Shiprocket Configuration** (`config/shiprocket.js`)
- Token-based authentication with 9-day caching
- Automatic token refresh
- Axios client with Bearer token

✅ **Shiprocket Controller** (`controllers/shiprocketController.js`)
- 10 API functions covering complete shipping workflow
- Automatic order creation and courier assignment
- Pickup scheduling
- Tracking integration

✅ **Order Controller Integration**
- Automatic Shiprocket shipment creation on COD orders
- Automatic Shiprocket shipment creation on successful Razorpay payments
- Non-blocking error handling (orders succeed even if Shiprocket fails)
- Tracking endpoint: `GET /api/order/tracking/:orderId`

✅ **Routes**
- `/api/shiprocket/*` - All Shiprocket operations (admin protected)
- `/api/order/tracking/:orderId` - Get order tracking details

### Frontend
✅ **TrackingModal Component**
- Beautiful animated modal with Framer Motion
- Displays order status, AWB code, courier name
- Direct link to courier tracking website
- Status-based color coding and icons

✅ **Orders Page Updates**
- Track Order button for each order
- Integration with tracking API
- Loading states and error handling
- Real-time tracking information display

## Setup Instructions

### 1. Environment Variables
Add to your `.env` file:

```env
# Shiprocket API Credentials
SHIPROCKET_EMAIL=your-shiprocket-api-email@example.com
SHIPROCKET_PASSWORD=your-shiprocket-api-password
```

**Important Notes:**
- These are **API credentials**, not your regular Shiprocket login
- Get them from: Shiprocket Dashboard → Settings → API
- Generate new API user if you don't have one

### 2. Shiprocket Dashboard Configuration

#### A. Setup Pickup Location
1. Go to Shiprocket Dashboard → Settings → Pickup Addresses
2. Add your warehouse/pickup location:
   ```
   Ananthaa
   No.7-2, 2nd Floor, 3rd Main Rd
   Jayanagar 6th Block
   Bangalore, Karnataka - 560070
   ```
3. Set it as "Primary" (or note the location name)
4. The pickup location is already configured in the code as "Primary"

#### B. Pickup Pincode Configuration
✅ **Already Configured:** Pickup pincode is set to **560070** (Bangalore warehouse)
- Backend: `shiprocketController.js` - Line ~307
- Frontend PlaceOrder: `PlaceOrder.jsx` - Line ~42
- Frontend PincodeChecker: `PincodeChecker.jsx` - Line ~17

### 3. Test Mode (Optional)
For testing, Shiprocket provides a test environment:
- Test API URL: `https://apiv2.shiprocket.in/v1/external/`
- You'll need test credentials from Shiprocket support

### 4. Database
No migration needed - Mongoose will automatically add new fields when orders are updated.

## API Endpoints

### Order Tracking (User)
```http
GET /api/order/tracking/:orderId
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "tracking": {
    "orderId": "order_id",
    "status": "Shipped",
    "awb_code": "AWBXXXX",
    "courier_name": "Delhivery",
    "tracking_url": "https://shiprocket.co/tracking/AWBXXXX",
    "shipment_id": 12345,
    "date": 1234567890
  }
}
```

### Shiprocket Operations (Admin)

#### Check Serviceability
```http
POST /api/shiprocket/check-serviceability
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "pickup_postcode": "110001",
  "delivery_postcode": "400001",
  "weight": 1,
  "cod": 0
}
```

#### Create Complete Order (Automated)
```http
POST /api/shiprocket/create-complete-order
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "orderId": "mongodb_order_id",
  "orderAmount": 1000,
  "items": [...],
  "address": {...}
}
```

#### Track Shipment
```http
GET /api/shiprocket/track/:awb_code
Authorization: Bearer {admin_token}
```

## Order Flow

### COD Orders
1. User places COD order → `placeOrder()`
2. Order saved to database
3. Product stock reduced
4. **Shiprocket shipment created** (async, non-blocking)
5. AWB assigned, pickup scheduled
6. Tracking details saved to order
7. Response sent to user

### Razorpay Orders
1. User initiates payment → `placeOrderRazorpay()`
2. Order created (payment pending)
3. Payment completed → `verifyRazor()`
4. Payment verified with Razorpay
5. Product stock reduced
6. Confirmation email sent
7. **Shiprocket shipment created** (async, non-blocking)
8. AWB assigned, pickup scheduled
9. Tracking details saved to order
10. Success response sent

## Error Handling

### Non-Blocking Integration
Shiprocket errors **do not** fail the order placement:
- If Shiprocket API fails, order still succeeds
- Errors logged to console for debugging
- Admin can manually create shipment later

### Common Issues

#### 1. "Invalid Token" Error
**Cause:** Token expired or invalid credentials
**Fix:** Check `.env` credentials, delete cached token

#### 2. "No Couriers Available"
**Cause:** Unserviceable pincode or invalid pickup location
**Fix:** 
- Verify delivery pincode
- Check pickup location configuration
- Contact Shiprocket support for serviceability

#### 3. "Pickup Location Not Found"
**Cause:** Pickup location name mismatch
**Fix:** Update `pickup_location` in `shiprocketController.js`

## Frontend Usage

### Track Order Button
Users can track orders from the Orders page:
1. Click "Track Order" button
2. Modal displays tracking information
3. Click "Track on Courier Website" for detailed tracking

### Tracking Modal Features
- Order status with color-coded badges
- AWB tracking number
- Courier partner name
- Order date and time
- Direct link to courier website
- Responsive design with animations

## Customization

### Product Dimensions
Update default dimensions in `shiprocketController.js` line ~267-271:
```javascript
length: 10,      // cm
breadth: 10,     // cm  
height: 5,       // cm
weight: totalWeight // kg (auto-calculated)
```

### Weight Calculation
Default: 0.5kg per item. Update line ~250:
```javascript
const totalWeight = items.reduce((sum, item) => 
  sum + (item.quantity * 0.5), 0); // Change 0.5 to your average weight
```

### Payment Method
COD vs Prepaid setting (line ~265):
```javascript
payment_method: "Prepaid", // Change to "COD" for cash on delivery
```

Also update serviceability check (line ~279):
```javascript
cod: 0 // 0 for prepaid, 1 for COD
```

## Testing Checklist

- [ ] Add Shiprocket credentials to `.env`
- [ ] Configure pickup location in Shiprocket dashboard
- [ ] Update pickup location name in code
- [ ] Update pickup pincode in code
- [ ] Place a test COD order
- [ ] Verify Shiprocket order created in dashboard
- [ ] Place a test Razorpay order
- [ ] Check tracking information in Orders page
- [ ] Test tracking modal functionality
- [ ] Verify AWB code displays correctly
- [ ] Test courier website redirect

## Production Checklist

- [ ] Replace test credentials with production credentials
- [ ] Configure actual pickup location(s)
- [ ] Set correct pickup pincode(s)
- [ ] Update product dimensions and weights
- [ ] Test with real orders
- [ ] Monitor Shiprocket dashboard for pickups
- [ ] Setup webhook for status updates (optional)
- [ ] Configure email notifications for shipping updates
- [ ] Test serviceability for common pincodes
- [ ] Setup customer support for shipping queries

## Advanced Features (Future)

### Webhook Integration
Receive real-time shipment updates from Shiprocket:
- Order shipped notification
- Out for delivery notification
- Delivery confirmation
- RTO (Return to Origin) alerts

### Multiple Pickup Locations
Support different warehouses based on:
- Product location
- Delivery pincode
- Stock availability

### Custom Packaging
Set dimensions based on:
- Product category
- Number of items
- Special requirements

## Support

### Shiprocket Support
- Email: care@shiprocket.in
- Phone: +91-120-6644464
- Dashboard: https://app.shiprocket.in/

### API Documentation
- Docs: https://apidocs.shiprocket.in/
- Postman Collection: Available in Shiprocket Dashboard

## Notes

- Shiprocket charges per shipment (check pricing in dashboard)
- AWB codes are unique tracking numbers from courier partners
- Pickup requests should be scheduled at least 2 hours in advance
- Some couriers may not be available for all pincodes
- Token expires after 9 days and auto-refreshes
- Test thoroughly before going live

---

**Integration Status:** ✅ Complete and Ready for Testing
**Last Updated:** December 10, 2025
