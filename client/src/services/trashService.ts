import axios from './httpClient'
import API_BASE_URL from '../ApiBaseUrl'
import { FetchParams } from '../types'

export const getDeletedMedicalRecords = async (params: FetchParams = {}) => {
    try {
        const defaultParams = {
            page: 1,
            limit: 10
        }

        const queryParams = { ...defaultParams, ...params }

        const response = await axios.get(
            `${API_BASE_URL}/api/medicalRecords/getDeletedMedicalRecords`,
            { params: queryParams }
        )
        
        return response.data
    } catch (error) {
        console.error('Error fetching deleted medical records:', error)
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message
        }
        throw error
    }
}

export const restoreMedicalRecord = async (medicalRecordId: string) => {
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/api/medicalRecords/restoreMedicalRecord/${medicalRecordId}`
        )
        return response.data
    } catch (error) {
        console.error('Error restoring medical record:', error)
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message
        }
        throw error
    }
}

export const bulkRestoreMedicalRecords = async (medicalRecordIds: string[]) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/medicalRecords/bulkRestore`,
            { medicalRecordIds }
        )
        return response.data
    } catch (error) {
        console.error('Error bulk restoring medical records:', error)
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message
        }
        throw error
    }
}

export const bulkPermanentDeleteMedicalRecords = async (medicalRecordIds: string[]) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/medicalRecords/bulkPermanentDelete`,
            { medicalRecordIds }
        )
        return response.data
    } catch (error) {
        console.error('Error bulk deleting medical records:', error)
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message
        }
        throw error
    }
}