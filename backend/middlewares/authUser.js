import  jwt  from "jsonwebtoken";

// User authentication middleware
const authUser = async (req,res,next) => {
    try {

        // Token can be sent in headers as 'token' or 'authorization'
        let token = req.headers.token || req.headers.authorization;
        if (!token) {
            return res.status(401).json({success:false,message:"Not Authorized. Invalid token."});
        }
        // If token is in format "Bearer <token>", extract the token part
        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length).trim();
        }

        if (!token || token.length === 0) {
            return res.status(401).json({success:false,message:"Not Authorized. Token missing or invalid."});
        }

        try {
            const token_decode = jwt.verify(token,process.env.JWT_SECRET)
            req.body = req.body || {};
            req.body.userId = token_decode.id
            req.userId = token_decode.id; // Set on req to avoid overwrite by multer

            next()
        } catch (error) {
            console.log("JWT verification error:", error.message)
            return res.status(401).json({success:false,message:"Not Authorized. Invalid token."});
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

export default authUser