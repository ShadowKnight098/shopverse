/**
 * Validates an email address against a standard pattern.
 * @param {string} email - Email to validate
 * @returns {boolean} True if the email is valid
 */
export function validateEmail(email) {
  if (!email) return false
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return pattern.test(email.trim())
}

/**
 * Validates a password and returns detailed feedback.
 * Requirements: min 8 chars, at least one uppercase, one lowercase, one digit.
 * @param {string} password - Password to validate
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, message: 'Password is required.' }
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter.' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' }
  }
  return { valid: true, message: 'Password is strong.' }
}

/**
 * Validates an Indian phone number (10 digits, optionally prefixed with +91 or 91).
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if the phone number is valid
 */
export function validatePhone(phone) {
  if (!phone) return false
  const cleaned = phone.replace(/[\s\-()]/g, '')
  const pattern = /^(\+91|91)?[6-9]\d{9}$/
  return pattern.test(cleaned)
}

/**
 * Validates that a value is not empty or whitespace-only.
 * @param {string} value - The value to check
 * @param {string} fieldName - The field name for the error message
 * @returns {{ valid: boolean, message: string }}
 */
export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return { valid: false, message: `${fieldName} is required.` }
  }
  return { valid: true, message: '' }
}
