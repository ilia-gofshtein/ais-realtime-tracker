import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { vesselsStore } from './stores/VesselsStore'
import { VesselsTable } from './features/vessels/components/VesslesTable'
import './App.css'

export const App = observer(() => {
    useEffect(() => {
        vesselsStore.connect()

        return () => {
            vesselsStore.disconnect()
        }
    }, [])

    return (
        <main className="app">
            <header className="app-header">
                <div>
                    <h1>AIS Ship Radar</h1>
                    <p>Live AIS prototype powered by local WebSocket proxy.</p>
                </div>
            </header>

            <section className="stats">
                <div className="stat-card">
                    <span className="stat-label">Status</span>
                    <strong>{vesselsStore.status}</strong>
                </div>

                <div className="stat-card">
                    <span className="stat-label">Vessels</span>
                    <strong>{vesselsStore.vesselsCount}</strong>
                </div>
            </section>

            <section className="content">
                <h2>Received vessels</h2>

                <VesselsTable vessels={vesselsStore.vesselsList} />
            </section>
        </main>
    )
})
