import express from 'express';
import {
    checkServiceability,
    createShiprocketOrder,
    assignAWB,
    generatePickup,
    generateManifest,
    printManifest,
    generateLabel,
    printInvoice,
    trackShipment
} from '../controllers/shiprocketController.js';

import adminAuth from '../middleware/adminAuth.js';

const shiprocketRoute = express.Router();


// Check serviceability and get shipping charges
shiprocketRoute.post('/check-serviceability', checkServiceability);

// Create Shiprocket order
shiprocketRoute.post('/create-order', adminAuth, createShiprocketOrder);

// Assign AWB to shipment
shiprocketRoute.post('/assign-awb', adminAuth, assignAWB);

// Generate pickup request
shiprocketRoute.post('/generate-pickup', adminAuth, generatePickup);

// Generate manifest
shiprocketRoute.post('/generate-manifest', adminAuth, generateManifest);

// Print manifest
shiprocketRoute.post('/print-manifest', adminAuth, printManifest);

// Generate shipping label
shiprocketRoute.post('/generate-label', adminAuth, generateLabel);

// Print invoice
shiprocketRoute.post('/print-invoice', adminAuth, printInvoice);

// Track shipment by AWB code
shiprocketRoute.get('/track/:awb_code', trackShipment);

export default shiprocketRoute;
