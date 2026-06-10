import type { Vessel } from '../../../shared/contracts/Vessel'

type VesselsTableProps = {
    vessels: Vessel[]
}

function formatNullableNumber(value: number | null, digits = 1): string {
    if (value === null) {
        return '—'
    }

    return value.toFixed(digits)
}

function formatTime(value: string): string {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return date.toLocaleTimeString()
}

export function VesselsTable({ vessels }: VesselsTableProps) {
    if (vessels.length === 0) {
        return <p className="empty-state">Пока нет AIS-сообщений. Подожди немного или расширь bounding box.</p>
    }

    return (
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th>MMSI</th>
                        <th>Name</th>
                        <th>Lat</th>
                        <th>Lon</th>
                        <th>SOG</th>
                        <th>COG</th>
                        <th>Heading</th>
                        <th>Updated</th>
                    </tr>
                </thead>

                <tbody>
                    {vessels.map((vessel) => (
                        <tr key={vessel.mmsi}>
                            <td>{vessel.mmsi}</td>
                            <td>{vessel.shipName ?? '—'}</td>
                            <td>{vessel.lat.toFixed(5)}</td>
                            <td>{vessel.lon.toFixed(5)}</td>
                            <td>{formatNullableNumber(vessel.sog)}</td>
                            <td>{formatNullableNumber(vessel.cog)}</td>
                            <td>{formatNullableNumber(vessel.heading, 0)}</td>
                            <td>{formatTime(vessel.timestamp)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
