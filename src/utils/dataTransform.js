/**
 * Data transformation utilities for API responses
 */

/**
 * Transform user data from backend format to frontend format
 * @param {Object} backendUserData - User data from backend API
 * @returns {Object} Transformed user data for frontend use
 */
export const transformUserData = (backendUserData) => {
  if (!backendUserData) {
    return null;
  }

  const transformed = {
    ...backendUserData,
    // Transform blood_type to bloodType for consistent frontend usage
    // Use explicit check to preserve null and empty string values
    bloodType: backendUserData.blood_type !== undefined 
      ? backendUserData.blood_type 
      : backendUserData.bloodType,
  };

  // Remove the original field to avoid confusion
  if (transformed.blood_type !== undefined) {
    delete transformed.blood_type;
  }

  return transformed;
};

/**
 * Get display value for blood type with proper fallback
 * @param {string|null|undefined} bloodType - Blood type value
 * @returns {string} Display-ready blood type or fallback text
 */
export const getBloodTypeDisplay = (bloodType) => {
  if (!bloodType || bloodType === 'Unknown') {
    return 'Not specified';
  }
  return bloodType;
};

/**
 * Transform array of user data (for donor lists, etc.)
 * @param {Array} users - Array of user objects from backend
 * @returns {Array} Array of transformed user objects
 */
export const transformUsersData = (users) => {
  if (!Array.isArray(users)) {
    return [];
  }
  
  return users.map(transformUserData);
};