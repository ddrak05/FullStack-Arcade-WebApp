import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({message: "Session expired. Please log in again!"})
    }

    try{
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    }catch(err){
        res.status(401).json({message: "Invalid token"});
    }
}