import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { PatientState } from '../types'


export const usePatientStore = create<PatientState>()(
    devtools(
        (set, get) => ({

        }),
        {
            name: 'patient-store'
        }
    )
)