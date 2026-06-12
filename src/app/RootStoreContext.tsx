import { createContext, type ReactNode, useContext } from 'react'
import type { RootStore } from '../stores/RootStore'
import type { UserLocationStore } from '../stores/UserLocationStore'
import type { VesselsStore } from '../stores/VesselsStore'

const RootStoreContext = createContext<RootStore | null>(null)

type RootStoreProviderProps = {
    store: RootStore
    children: ReactNode
}

export const RootStoreProvider = ({ store, children }: RootStoreProviderProps) => {
    return <RootStoreContext.Provider value={store}>{children}</RootStoreContext.Provider>
}

export const useRootStore = (): RootStore => {
    const store = useContext(RootStoreContext)

    if (!store) {
        throw new Error('useRootStore must be used within RootStoreProvider')
    }

    return store
}

export const useVesselsStore = (): VesselsStore => {
    return useRootStore().vesselsStore
}

export const useUserLocationStore = (): UserLocationStore => {
    return useRootStore().userLocationStore
}
