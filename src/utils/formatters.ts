/**
 * Format price in Nigerian Naira
 */
export const formatPrice = (price: number | null | undefined): string => {
  if (!price) return 'Price not available';
  return `₦${price.toLocaleString('en-NG', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

/**
 * Format time ago from timestamp
 */
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Less than 1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString('en-NG');
};

/**
 * Validate Nigerian phone number
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Nigerian phone number patterns
  const patterns = [
    /^\+234[789][01]\d{8}$/, // +234 format
    /^0[789][01]\d{8}$/, // 0 format
    /^[789][01]\d{8}$/ // Without country code
  ];
  
  return patterns.some(pattern => pattern.test(phone));
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};