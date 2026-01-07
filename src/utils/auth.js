export const restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'You do not have permission to perform this action' });
      }
      next();
    };
  };

  export const protect = async (req, res, next) => {
    try {
      let token;
  
      if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
      } else if (req.cookies.userToken) {
        token = req.cookies.userToken;
      }
  
      if (!token) {
        return res.status(401).json({ message: "Not authorized, no token provided" });
      }
  
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token expired, please login again" });
        }
        return res.status(401).json({ message: "Invalid token" });
      }
  
      // Fetch user from database
      const user = await User.findById(decoded.userId).select("-password"); 
  
      if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };