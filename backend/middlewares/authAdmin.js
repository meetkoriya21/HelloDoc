import  jwt  from "jsonwebtoken";

const authAdmin = async (req,res,next) => {
    try {
        const authHeader = req.headers['authorization']
        if (!authHeader) {
            return res.json({ success: false, message: "Not Authorized Login" });
        }
        const token = authHeader.split(' ')[1]
        if (!token) {
            return res.json({ success: false, message: "Not Authorized Login" });
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)

        if (token_decode.email !== process.env.ADMIN_EMAIL || token_decode.password !== process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: "Not Authorized Login" });
        }

        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default authAdmin