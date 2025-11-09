import axios from './httpClient'
import API_BASE_URL from '../ApiBaseUrl'
import { ReportParams } from '../types'

export const getInventoryReport = async (params: ReportParams = {}) => {
    try {
        const defaultParams = {
            page: 1,
            limit: 10
        }

        const queryParams = { ...defaultParams, ...params }

        const response = await axios.get(
            `${API_BASE_URL}/api/reports/getInventoryReport`,
            { params: queryParams }
        )
        
        return response.data
    } catch (error) {
        console.error('Error fetching inventory report:', error)
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message
        }
        throw error
    }
}

export const getInventorySummary = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/reports/getInventorySummary`
        )
        return response.data
    } catch (error) {
        console.error('Error fetching inventory summary:', error)
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message
        }
        throw error
    }
}

export const getSalesReport = async (params: ReportParams = {}) => {
    try {
        const defaultParams = {
            page: 1,
            limit: 10
        }

        const queryParams = { ...defaultParams, ...params }

        const response = await axios.get(
            `${API_BASE_URL}/api/reports/getSalesReport`,
            { params: queryParams }
        )
        
        return response.data
    } catch (error) {
        console.error('Error fetching sales report:', error)
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message
        }
        throw error
    }
}

export const getSalesSummary = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/reports/getSalesSummary`
        )
        return response.data
    } catch (error) {
        console.error('Error fetching sales summary:', error)
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message
        }
        throw error
    }
}

export const getDashboardReport = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/reports/getDashboardReport`
        )
        return response.data
    } catch (error) {
        console.error('Error fetching dashboard report:', error)
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message
        }
        throw error
    }
}