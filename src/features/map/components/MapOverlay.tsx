import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useVesselsStore } from '../../../app/RootStoreContext'
import './MapOverlay.css'

export const MapOverlay = observer(() => {
    const vesselsStore = useVesselsStore()
    const [isVesselsListOpen, setIsVesselsListOpen] = useState(false)

    return (
        <div className="map-overlay">
            <div className="map-overlay__controls">
                <button
                    className="map-overlay__button"
                    type="button"
                    onClick={() => setIsVesselsListOpen((value) => !value)}
                >
                    Vessels: {vesselsStore.vesselsCount}
                </button>
            </div>

            {isVesselsListOpen && (
                <div className="map-overlay__panel">
                    <div className="map-overlay__panel-header">
                        <strong>Available vessels</strong>

                        <button
                            className="map-overlay__close-button"
                            type="button"
                            onClick={() => setIsVesselsListOpen(false)}
                            aria-label="Close vessels list"
                        >
                            ×
                        </button>
                    </div>

                    {vesselsStore.vesselsList.length === 0 ? (
                        <p className="map-overlay__empty">No vessels received yet.</p>
                    ) : (
                        <ul className="map-overlay__list">
                            {vesselsStore.vesselsList.map((vessel) => (
                                <li className="map-overlay__list-item" key={vessel.mmsi}>
                                    <div className="map-overlay__list-main">
                                        <strong>{vessel.shipName ?? 'Unknown vessel'}</strong>
                                        <span>MMSI: {vessel.mmsi}</span>
                                    </div>

                                    <div className="map-overlay__list-meta">
                                        <span>SOG: {vessel.sog ?? '—'}</span>
                                        <span>HDG: {vessel.heading ?? vessel.cog ?? '—'}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
})
