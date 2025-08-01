import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { MedicalRecordState } from '../types'


export const useMedicalRecordStore = create<MedicalRecordState>()(
    devtools(
        (set, get) => ({

        }),
        {
            name: 'medical-record-store'
        }
    )
)