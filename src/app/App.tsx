import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from './RootStoreContext'
import { VesselsMap } from '../features/map/components/VesselsMap'
import './App.css'

export const App = observer(() => {
    const rootStore = useRootStore()

    useEffect(() => {
        rootStore.start()

        void rootStore.requestUserLocation()

        return () => {
            rootStore.stop()
        }
    }, [rootStore])

    return (
        <main className="app">
            <VesselsMap />
        </main>
    )
})
