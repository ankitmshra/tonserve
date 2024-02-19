export const ALPB_BASE_URL = process.env.ALPB_BASE_URL || 'http://51.20.90.110:8000';
export const GET_ALL_CATEGORIES = `${ALPB_BASE_URL}/api/alpb/categories/`;
export const GET_ALL_PRODUCTS = `${ALPB_BASE_URL}/api/alpb/products/`;
export const GET_PRODUCT_DETAILS_BY_PRODUCT_NUMBER = `${ALPB_BASE_URL}/api/alpb/`;
export const GET_PRODUCT_DETAILS = `${ALPB_BASE_URL}/api/alpb/products/?search=`;
export const GET_PRODUCTS_BY_CATEGORIES = `${ALPB_BASE_URL}/api/alpb/products/?category=`;