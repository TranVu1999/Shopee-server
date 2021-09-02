// File này sẽ được chạy trước khi truy cập vào các router của chúng ta để tiến hành kiểm tra xác thực
const jwt = require('jsonwebtoken');

// Khi ta gởi request mà có header với jsonwebtoken thì nó sẽ có dạng
// Authorization: Bearer <token>

const verifyToken = (req, res, next) => {
    // Lấy giá trị của Authorization
    const authHeader = req.header('Authorization');
    // Nếu như có authHeader thì lấy cái vế thứ 2 và nếu không có thì lấy vế 1
    
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return res
        .status(401)
        .json({success: false, message: "Access token not found"})
    }

    try {
        
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // Vì kết quả trả về chính là dữ liệu trong cái access token của nó nên có thể lấy dữ liệu thông qua cách này
        req.accountId = decoded.accountId;
        // Lúc này, req mang theo trường userId nữa.
        next() // Cho phép vào trong router
    } catch (error) {
        console.log(error);
        return res
        .status(403)
        .json({success: false, message: "Invalid token"})
    }
}

module.exports = verifyToken