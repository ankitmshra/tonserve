export const ALPB_BASE_URL = process.env.ALPB_BASE_URL || 'http://13.51.207.54:8000';
export const GET_ALL_CATEGORIES = `${ALPB_BASE_URL}/api/categories/`;
export const GET_ALL_PRODUCTS = `${ALPB_BASE_URL}/api/products/`;
export const GET_PRODUCT_DETAILS_BY_PRODUCT_NUMBER = `${ALPB_BASE_URL}/api/`;
export const GET_PRODUCT_DETAILS = `${ALPB_BASE_URL}/api/products/?search=`;
export const GET_PRODUCTS_BY_CATEGORIES = `${ALPB_BASE_URL}/api/products/?category=`;