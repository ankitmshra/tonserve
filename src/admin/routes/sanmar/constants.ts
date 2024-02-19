export const ALPB_BASE_URL = process.env.ALPB_BASE_URL || 'http://51.20.90.110:8000';
export const GET_ALL_CATEGORIES = `${ALPB_BASE_URL}/api/snmr/categories/`;
export const GET_ALL_PRODUCTS = `${ALPB_BASE_URL}/api/snmr/products/`;
export const GET_PRODUCT_DETAILS_BY_PRODUCT_NUMBER = `${ALPB_BASE_URL}/api/snmr/`;
export const GET_PRODUCT_DETAILS = `${ALPB_BASE_URL}/api/snmr/products/?search=`;
export const GET_PRODUCTS_BY_CATEGORIES = `${ALPB_BASE_URL}/api/snmr/products/?category=`;