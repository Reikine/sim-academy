import rawData from '../data/data.json';
import { getStorage } from './index.js';

export const loadStockData = () => getStorage('stock_db', rawData.initialStockData);
export const loadTrackingData = () => getStorage('trackingData', rawData.trackingData);
export const loadUserData = () => getStorage('user_db', rawData.initialUserData);
export const loadPackageData = () => getStorage('package_db', rawData.packageList);
export const loadConstants = () => ({
    regions: rawData.regionList || [],
    categories: rawData.categoryList || [],
    deliveryList: rawData.deliveryList || []
});