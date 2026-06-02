import { WHATSAPP_NUMBER } from '../lib/constants.js'

/**
 * Formats a numeric price into Indian Rupee format with commas.
 * @param {number} price - The price to format
 * @returns {string} Formatted price string like ₹1,23,456.00
 */
export function formatPrice(price) {
  if (price === null || price === undefined) return '₹0.00'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

/**
 * Formats a date string or Date object into a human-readable string.
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date like "15 Jan 2026, 3:45 PM"
 */
export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d)
}

/**
 * Truncates text to a maximum length and appends an ellipsis.
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum character count before truncation
 * @returns {string} Truncated text with "..." if it exceeded maxLength
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

/**
 * Generates a WhatsApp deep link with a pre-filled order message.
 * @param {Array} cartItems - Array of cart item objects
 * @param {number} totalAmount - Total cart value
 * @param {Object} userInfo - Customer info { name, phone }
 * @returns {string} WhatsApp URL ready to open
 */
export function generateWhatsAppLink(cartItems = [], totalAmount = 0, userInfo = {}) {
  const separator = '━━━━━━━━━━━━━━━━━━━━'
  const now = new Date()
  const dateStr = formatDate(now)

  let message = `🛒 *New Order from ShopVerse*\n`
  message += `${separator}\n\n`

  /* Customer details */
  if (userInfo.name) {
    message += `👤 *Customer:* ${userInfo.name}\n`
  }
  if (userInfo.phone) {
    message += `📞 *Phone:* ${userInfo.phone}\n`
  }
  if (userInfo.name || userInfo.phone) {
    message += `\n`
  }

  /* Order items */
  message += `📦 *Order Items:*\n\n`
  cartItems.forEach((item, index) => {
    const itemTotal = item.price * item.quantity
    const sizeVal = item.selectedSize || item.selected_size;
    const sizeSuffix = sizeVal ? ` (Size: ${sizeVal})` : '';
    message += `${index + 1}. *${item.name}${sizeSuffix}*\n`
    message += `   Qty: ${item.quantity} × ${formatPrice(item.price)} = ${formatPrice(itemTotal)}\n\n`
  })

  message += `${separator}\n`
  message += `💰 *Total Amount: ${formatPrice(totalAmount)}*\n`
  message += `📅 *Date:* ${dateStr}\n\n`
  message += `Thank you for shopping with ShopVerse! 🙏\n`
  message += `We'll confirm your order shortly.`

  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
}
