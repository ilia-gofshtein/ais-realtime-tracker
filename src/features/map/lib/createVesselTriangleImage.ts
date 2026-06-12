export function createVesselTriangleImageData(color = '#38bdf8', size = 64): ImageData {
    const canvas = document.createElement('canvas')

    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error('Failed to create vessel icon')
    }

    ctx.clearRect(0, 0, size, size)

    const centerX = size / 2

    const top = size * 0.12
    const bottom = size * 0.88
    const left = size * 0.22
    const right = size * 0.78

    ctx.beginPath()

    ctx.moveTo(centerX, top)
    ctx.lineTo(right, bottom)
    ctx.lineTo(left, bottom)

    ctx.closePath()

    ctx.fillStyle = color
    ctx.fill()

    return ctx.getImageData(0, 0, size, size)
}
