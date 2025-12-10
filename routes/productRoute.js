import express from 'express';


import  {addProduct, listProducts, removeProduct,singleProduct, updateProduct, fixNegativeStock} from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';




const productRouter=express.Router();


productRouter.post('/add',adminAuth,upload.fields([{ name: 'image1', maxCount: 1 },{ name: 'image2', maxCount: 1 },{ name: 'image3', maxCount: 1 },{ name: 'image4', maxCount: 1 }]),addProduct);
productRouter.put('/update',adminAuth,upload.fields([{ name: 'image1', maxCount: 1 },{ name: 'image2', maxCount: 1 },{ name: 'image3', maxCount: 1 },{ name: 'image4', maxCount: 1 }]),updateProduct);
productRouter.delete('/remove',adminAuth,removeProduct)   
productRouter.post('/single',singleProduct);
productRouter.get('/list',listProducts);
productRouter.post('/fix-negative-stock',adminAuth,fixNegativeStock);

export default productRouter;


