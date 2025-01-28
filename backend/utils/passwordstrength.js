// Password validation helper
export const validatePasswordStrength = (password) => {
    const minLength = 8;
    const maxLength = 128;
    
    if (password.length < minLength || password.length > maxLength) {
      return {
        isValid: false,
        message: `Password must be between ${minLength} and ${maxLength} characters`
      };
    }
  
    const checks = {
      uppercase: /[A-Z]/,
      lowercase: /[a-z]/,
      numbers: /[0-9]/,
      special: /[!@#$%^&*(),.?":{}|<>]/
    };
  
    const failedChecks = Object.entries(checks)
      .filter(([, regex]) => !regex.test(password))
      .map(([type]) => type);
  
    if (failedChecks.length > 0) {
      return {
        isValid: false,
        message: `Password must include: ${failedChecks.join(', ')}`
      };
    }
  
    const strengthScore = Object.values(checks)
      .filter(regex => regex.test(password)).length;
    
    return {
      isValid: true,
      strength: strengthScore >= 4 ? 'strong' : strengthScore >= 3 ? 'medium' : 'weak'
    };
  };
  