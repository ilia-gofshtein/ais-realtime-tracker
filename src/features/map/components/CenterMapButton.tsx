import './CenterMapButton.css'

type CenterMapButtonProps = {
    onClick: () => void
}

export function CenterMapButton({ onClick }: CenterMapButtonProps) {
    return (
        <button
            className="center-map-button"
            type="button"
            onClick={onClick}
            title="Center map on Amsterdam"
            aria-label="Center map on Amsterdam"
        >
            ◎
        </button>
    )
}
