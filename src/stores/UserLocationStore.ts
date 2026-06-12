import { action, computed, makeObservable, observable, runInAction } from 'mobx'

export type UserLocation = {
    lat: number
    lon: number
    accuracy: number
}

export class UserLocationStore {
    location: UserLocation | null = null
    status = 'idle'
    error: string | null = null

    constructor() {
        makeObservable<this, 'setLocation' | 'setStatus' | 'setError'>(this, {
            location: observable,
            status: observable,
            error: observable,

            requestCurrentLocation: action,

            setLocation: action,
            setStatus: action,
            setError: action,

            hasLocation: computed,
        })
    }

    requestCurrentLocation(): Promise<UserLocation | null> {
        if (!navigator.geolocation) {
            this.setStatus('unsupported')
            this.setError('Geolocation is not supported')
            return Promise.resolve(null)
        }

        this.setStatus('requesting')
        this.setError(null)

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location: UserLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    }

                    runInAction(() => {
                        this.setLocation(location)
                        this.setStatus('available')
                    })

                    resolve(location)
                },
                (error) => {
                    runInAction(() => {
                        this.setStatus('error')
                        this.setError(error.message)
                    })

                    resolve(null)
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 10_000,
                    timeout: 15_000,
                }
            )
        })
    }

    get hasLocation(): boolean {
        return this.location !== null
    }

    private setLocation(location: UserLocation): void {
        this.location = location
    }

    private setStatus(status: string): void {
        this.status = status
    }

    private setError(error: string | null): void {
        this.error = error
    }
}

export const userLocationStore = new UserLocationStore()
