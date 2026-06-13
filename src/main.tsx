import React from 'react'
import ReactDOM from 'react-dom/client'
import 'maplibre-gl/dist/maplibre-gl.css'

import { App } from './app/App'
import { RootStoreProvider } from './app/RootStoreContext'
import { rootStore } from './app/rootStore'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RootStoreProvider store={rootStore}>
            <App />
        </RootStoreProvider>
    </React.StrictMode>
)
