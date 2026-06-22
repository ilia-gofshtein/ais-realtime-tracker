import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'

import { useRootStore } from './RootStoreContext'
import { VesselsMap } from '../features/map/components/VesselsMap'
import { AMSTERDAM_PRESET } from '../features/map/config/mapPresets'

import './App.css'

export const App = observer(() => {
    const rootStore = useRootStore()

    useEffect(() => {
        rootStore.start()
        rootStore.subscribeToAisBoundingBoxes(AMSTERDAM_PRESET.boundingBoxes)

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
