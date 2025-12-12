import jwt from 'jsonwebtoken';

const authuser =async (req, res, next) => {
    try{
        const {token} = req.headers;    
        if(!token){
            return res.status(401).json({error:"Access denied."});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Ensure req.body exists before setting properties
        if (!req.body) {
            req.body = {};
        }
        req.body.userId = decoded.id;
        
        // Also set userId in req for easier access in GET requests
        req.userId = decoded.id;
        
        next();
    }catch(err){
        console.log(err);
        res.status(400).json({success:false, error:"Invalid token"});
    }
};

export default authuser;