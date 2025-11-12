import * as CANNON from 'cannon-es'
import * as THREE from 'three'

export function createBoxShapeFromModel(model, scaleFactor = 0.6) { // reducir un poco el tamaño de la caja para evitar solapamientos
    const bbox = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    bbox.getSize(size)

    // Aplicar scaleFactor para crear una caja ligeramente más pequeña que el mesh visual.
    // Esto ayuda a evitar colisiones iniciales y teletransportes por solapamiento.
    const hx = (size.x / 2) * scaleFactor
    const hy = (size.y / 2) * scaleFactor
    const hz = (size.z / 2) * scaleFactor

    return new CANNON.Box(new CANNON.Vec3(hx, hy, hz))
}

export function createTrimeshShapeFromModel(model) {
    const mergedPositions = []
    const mergedIndices = []
    let vertexOffset = 0

    model.updateMatrixWorld(true) // ✅ Asegura matrices actualizadas

    model.traverse((child) => {
        if (child.isMesh && child.geometry) {
            const geometry = child.geometry.clone().toNonIndexed()
            const position = geometry.attributes.position

            if (!position) return

            const vertexCount = position.count

            for (let i = 0; i < vertexCount; i++) {
                const vertex = new THREE.Vector3().fromBufferAttribute(position, i)
                vertex.applyMatrix4(child.matrixWorld) // ✅ Aplica transformación del mesh
                mergedPositions.push(vertex.x, vertex.y, vertex.z)
            }

            for (let i = 0; i < vertexCount / 3; i++) {
                mergedIndices.push(
                    vertexOffset + i * 3,
                    vertexOffset + i * 3 + 1,
                    vertexOffset + i * 3 + 2
                )
            }

            vertexOffset += vertexCount
        }
    })

    if (mergedPositions.length === 0) {
        console.warn('❌ No se pudo construir un Trimesh: modelo sin vértices')
        return null
    }

    const vertices = new Float32Array(mergedPositions)
    const indices = new Uint16Array(mergedIndices)

    //console.log(`✅ Trimesh generado: ${vertices.length / 3} vértices`)

    return new CANNON.Trimesh(vertices, indices)
}



