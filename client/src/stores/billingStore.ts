import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { BillingState } from '../types'


export const useBillingStore = create<BillingState>()(
    devtools(
        (set, get) => ({

        }),
        {
            name: 'billing-store'
        }
    )
)