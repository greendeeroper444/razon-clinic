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

export const getInventoryLineChart = async (params: ReportParams = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/reports/getInventoryLineChart`,
            { params }
        )
        return response.data
    } catch (error) {
        console.error('Error fetching inventory line chart:', error)
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

export const getSalesLineChart = async (params: ReportParams = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/reports/getSalesLineChart`,
            { params }
        )
        return response.data
    } catch (error) {
        console.error('Error fetching sales line chart:', error)
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message
        }
        throw error
    }
}

export const getMedicalRecordsReport = async (params: ReportParams = {}) => {
    try {
        const defaultParams = {
            page: 1,
            limit: 10
        }

        const queryParams = { ...defaultParams, ...params }

        const response = await axios.get(
            `${API_BASE_URL}/api/reports/getMedicalRecordsReport`,
            { params: queryParams }
        )
        
        return response.data
    } catch (error) {
        console.error('Error fetching medical records report:', error)
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message
        }
        throw error
    }
}

export const getMedicalRecordsSummary = async () => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/reports/getMedicalRecordsSummary`
        )
        return response.data
    } catch (error) {
        console.error('Error fetching medical records summary:', error)
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message
        }
        throw error
    }
}

export const getMedicalRecordsLineChart = async (params: ReportParams = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/reports/getMedicalRecordsLineChart`,
            { params }
        )
        return response.data
    } catch (error) {
        console.error('Error fetching medical records line chart:', error)
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


// ==================== EXPORT FUNCTIONS ====================
export const exportInventoryReport = async (params: ReportParams = {}) => {
    try {
        const queryParams = { ...params }

        const response = await axios.get(
            `${API_BASE_URL}/api/reports/exportInventoryReport`,
            { 
                params: queryParams,
                responseType: 'blob'
            }
        )

        const blob = new Blob([response.data], {
            type: response.headers['content-type']
        })

        const contentDisposition = response.headers['content-disposition']
        let filename = `inventory_report_${new Date().toISOString().split('T')[0]}.xlsx`
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1]
            }
        }

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        return {
            success: true,
            filename
        }
    } catch (error) {
        console.error('Error exporting inventory report:', error)
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message
        }
        throw error
    }
}

export const exportSalesReport = async (params: ReportParams = {}) => {
    try {
        const queryParams = { ...params }

        const response = await axios.get(
            `${API_BASE_URL}/api/reports/exportSalesReport`,
            { 
                params: queryParams,
                responseType: 'blob' 
            }
        )

        const blob = new Blob([response.data], {
            type: response.headers['content-type']
        })

        const contentDisposition = response.headers['content-disposition']
        let filename = `sales_report_${new Date().toISOString().split('T')[0]}.xlsx`
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1]
            }
        }

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        return {
            success: true,
            filename
        }
    } catch (error) {
        console.error('Error exporting sales report:', error)
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message
        }
        throw error
    }
}

export const exportMedicalRecordsReport = async (params: ReportParams = {}) => {
    try {
        const queryParams = { ...params }

        const response = await axios.get(
            `${API_BASE_URL}/api/reports/exportMedicalRecordsReport`,
            { 
                params: queryParams,
                responseType: 'blob' 
            }
        )

        const blob = new Blob([response.data], {
            type: response.headers['content-type']
        })

        const contentDisposition = response.headers['content-disposition']
        let filename = `medical_records_report_${new Date().toISOString().split('T')[0]}.xlsx`
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1]
            }
        }

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        return {
            success: true,
            filename
        }
    } catch (error) {
        console.error('Error exporting medical records report:', error)
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message
        }
        throw error
    }
}