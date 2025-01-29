import User from "../models/user.model";

export const requireEmailVerification = async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user.isEmailVerified) {
        return res.status(403).json({ 
          error: 'Please verify your email to access this resource' 
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };