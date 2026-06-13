type VesselPopupProps = {
    shipName?: string
    mmsi?: string
    sog?: number | string | null
    cog?: number | string | null
    heading?: number | string | null
    timestamp?: string
}

function formatNullableValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
        return '—'
    }

    return String(value)
}

function formatTime(value: unknown): string {
    if (typeof value !== 'string') {
        return '—'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return date.toLocaleString()
}

async function copyToClipboard(value: string): Promise<void> {
    if (!value || value === '—') {
        return
    }

    await navigator.clipboard.writeText(value)
}

function CopyButton({ value }: { value: string }) {
    return (
        <button
            className="vessel-popup__copy-button"
            type="button"
            onClick={(event) => {
                event.stopPropagation()
                void copyToClipboard(value)
            }}
        >
            Copy
        </button>
    )
}

function PopupRow({ label, value, copyable = false }: { label: string; value: string; copyable?: boolean }) {
    return (
        <div className="vessel-popup__row">
            <span>{label}</span>

            <div className="vessel-popup__value">
                <b>{value}</b>
                {copyable && value !== '—' && <CopyButton value={value} />}
            </div>
        </div>
    )
}

export const VesselPopup = (props: VesselPopupProps) => {
    const shipName = formatNullableValue(props.shipName ?? 'Unknown vessel')
    const mmsi = formatNullableValue(props.mmsi)

    return (
        <div className="vessel-popup">
            <div className="vessel-popup__title-row">
                <strong className="vessel-popup__title">{shipName}</strong>
                {shipName !== '—' && <CopyButton value={shipName} />}
            </div>

            <PopupRow label="MMSI" value={mmsi} copyable />
            <PopupRow label="SOG" value={formatNullableValue(props.sog)} />
            <PopupRow label="COG" value={formatNullableValue(props.cog)} />
            <PopupRow label="Heading" value={formatNullableValue(props.heading)} />
            <PopupRow label="Updated" value={formatTime(props.timestamp)} />
        </div>
    )
}
