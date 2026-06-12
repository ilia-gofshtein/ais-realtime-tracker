import { observer } from 'mobx-react-lite'
import { useUserLocationStore } from '../../../app/RootStoreContext'
import './LocateMeButton.css'

type LocateMeButtonProps = {
    onLocate: () => void
}

export const LocateMeButton = observer(({ onLocate }: LocateMeButtonProps) => {
    const userLocationStore = useUserLocationStore()

    return (
        <button
            className="locate-me-button"
            type="button"
            onClick={onLocate}
            disabled={userLocationStore.status === 'requesting'}
            title={userLocationStore.error ?? 'Center map on my location'}
        >
            ◎
        </button>
    )
})
