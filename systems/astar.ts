import { p } from "vitest/dist/index-40ebba2b"

export default class {
  openList: any = []
  closedList: any = []
  clean = true

  grid = []

  init() {
    this.grid = SYSTEMS.collision.collisionArray
  }

  process() {
    let executes: any = []
    ENTITIES.forEach((entity, id) => {
      executes.push(() => {
        if (entity.move) {
          if (!entity.move.finaldestination) return
          if (_.round(GPIXI.elapsedMS / 100) % _.random(1, 5) !== 0) {
            return
          }
          const startTile = {
            x: LIB.coordinateToTile(entity.position.x),
            y: LIB.coordinateToTile(entity.position.y),
          }
          const endTile = {
            x: LIB.coordinateToTile(entity.move.finaldestination.x),
            y: LIB.coordinateToTile(entity.move.finaldestination.y),
          }
          entity.move.path = this.findPath(startTile, endTile, entity)
          if (GPIXI.elapsedMS < entity.move.lastClosestTileFoundMS + 100) return

          entity.move.destination = _.cloneDeep(entity.position)
          if (entity.move.path.length <= 1 && entity.move.destination) {
            entity.move.destination.x = entity.move.finaldestination.x
            entity.move.destination.y = entity.move.finaldestination.y
          } else if (entity.move.path.length > 0 && entity.move.destination) {
            entity.move.destination.x =
              LIB.tileToCoordinate(entity.move.path[0].x) + 10
            entity.move.destination.y =
              LIB.tileToCoordinate(entity.move.path[0].y) + 10
          }
        }
      })
    })
    executes.forEach((func) => func())
  }

  getAllNeighbors(node) {
    const neighbors: any = []

    // Add neighbor left
    if (
      this.grid[node.y][node.x - 1] === 0 ||
      this.grid[node.y][node.x - 1] === 1
    ) {
      neighbors.push({ x: node.x - 1, y: node.y })
    }
    // Add neighbor right
    if (
      this.grid[node.y][node.x + 1] === 0 ||
      this.grid[node.y][node.x + 1] === 1
    ) {
      neighbors.push({ x: node.x + 1, y: node.y })
    }
    // Add neighbor above
    if (
      this.grid[node.y - 1][node.x] === 0 ||
      this.grid[node.y - 1][node.x] === 1
    ) {
      neighbors.push({ x: node.x, y: node.y - 1 })
    }

    // Add neighbor below
    if (
      this.grid[node.y + 1][node.x] === 0 ||
      this.grid[node.y + 1][node.x] === 1
    ) {
      neighbors.push({ x: node.x, y: node.y + 1 })
    }

    // Top left
    if (
      this.grid[node.y - 1][node.x - 1] === 0 ||
      this.grid[node.y - 1][node.x - 1] === 1
    ) {
      neighbors.push({ x: node.x - 1, y: node.y - 1 })
    }

    // Top right
    if (
      this.grid[node.y - 1][node.x + 1] === 0 ||
      this.grid[node.y - 1][node.x + 1] === 1
    ) {
      neighbors.push({ x: node.x + 1, y: node.y - 1 })
    }

    // Bottom left
    if (
      this.grid[node.y + 1][node.x - 1] === 0 ||
      this.grid[node.y + 1][node.x - 1] === 1
    ) {
      neighbors.push({ x: node.x - 1, y: node.y + 1 })
    }

    // Bottom right
    if (
      this.grid[node.y + 1][node.x + 1] === 0 ||
      this.grid[node.y + 1][node.x + 1] === 1
    ) {
      neighbors.push({ x: node.x + 1, y: node.y + 1 })
    }

    return neighbors
  }
  getCardinalNeighbors(node) {
    const neighbors: any = []
    // Add neighbor left
    if (
      this.grid[node.y][node.x - 1] === 0 ||
      this.grid[node.y][node.x - 1] === 1
    ) {
      neighbors.push({ x: node.x - 1, y: node.y })
    }
    // Add neighbor right
    if (
      this.grid[node.y][node.x + 1] === 0 ||
      this.grid[node.y][node.x + 1] === 1
    ) {
      neighbors.push({ x: node.x + 1, y: node.y })
    }
    // Add neighbor above
    if (
      this.grid[node.y - 1][node.x] === 0 ||
      this.grid[node.y - 1][node.x] === 1
    ) {
      neighbors.push({ x: node.x, y: node.y - 1 })
    }

    // Add neighbor below
    if (
      this.grid[node.y + 1][node.x] === 0 ||
      this.grid[node.y + 1][node.x] === 1
    ) {
      neighbors.push({ x: node.x, y: node.y + 1 })
    }
    return neighbors
  }
  getDiagonalNeighbors(node) {
    const neighbors: any = []

    // Top left
    if (
      this.grid[node.y - 1][node.x - 1] === 0 ||
      this.grid[node.y - 1][node.x - 1] === 1
    ) {
      neighbors.push({ x: node.x - 1, y: node.y - 1 })
    }

    // Top right
    if (
      this.grid[node.y - 1][node.x + 1] === 0 ||
      this.grid[node.y - 1][node.x + 1] === 1
    ) {
      neighbors.push({ x: node.x + 1, y: node.y - 1 })
    }

    // Bottom left
    if (
      this.grid[node.y + 1][node.x - 1] === 0 ||
      this.grid[node.y + 1][node.x - 1] === 1
    ) {
      neighbors.push({ x: node.x - 1, y: node.y + 1 })
    }

    // Bottom right
    if (
      this.grid[node.y + 1][node.x + 1] === 0 ||
      this.grid[node.y + 1][node.x + 1] === 1
    ) {
      neighbors.push({ x: node.x + 1, y: node.y + 1 })
    }

    return neighbors
  }
  isCardinal(current, neighbor) {
    // Check if neighbor is strictly horizontal or vertical
    if (current.x === neighbor.x || current.y === neighbor.y) {
      return true
    }

    // If x and y both differ, it is diagonal
    if (current.x !== neighbor.x && current.y !== neighbor.y) {
      return false
    }

    return true
  }

  findPath(startPos, endPos, entity) {
    this.clean = true
    this.openList = []
    this.closedList = []
    startPos.g = 0

    this.openList.push(startPos)

    let maxSteps = 2000

    while (this.openList.length > 0) {
      maxSteps--

      let current = this.getLowestF(this.openList)

      if (maxSteps < 0) {
        if (this.clean) return [endPos]

        if (
          (this.grid[endPos.y][endPos.x] !== 0 ||
            this.grid[endPos.y][endPos.x] !== 1) &&
          GPIXI.elapsedMS > entity.move.lastClosestTileFoundMS + 100
        ) {
          this.setFinalDestinationToWalkable(endPos, entity)
          entity.move.lastClosestTileFoundMS = GPIXI.elapsedMS
        }
        let path = this.reconstructPath(current, startPos)
        return this.refinePath(path)
      }

      this.openList = this.openList.filter((p) => p !== current)
      this.closedList.push(current)

      if (current.x === endPos.x && current.y === endPos.y) {
        if (this.clean) return [endPos]
        let path = this.reconstructPath(current, startPos)
        return this.refinePath(path)
      }

      let neighbors = this.getAllNeighbors(current)
      if (neighbors.length < 8) this.clean = false

      neighbors.forEach((neighbor) => {
        if (
          this.closedList.find((p) => p.x === neighbor.x && p.y === neighbor.y)
        ) {
          return
        }
        let secondNeighbors = this.getAllNeighbors(neighbor)

        let g = current.g
        if (
          this.isCardinal(current, neighbor) ||
          secondNeighbors.length === 8
        ) {
          g = current.g + 1
        } else {
          g = current.g + 2
        }
        let h = this.heuristic(neighbor, endPos)
        let f = g + h

        let inOpen = this.openList.find(
          (p) => p.x === neighbor.x && p.y === neighbor.y
        )
        if (inOpen && inOpen.f < f) return

        neighbor.g = g
        neighbor.f = f
        neighbor.parent = current

        if (!inOpen) this.openList.push(neighbor)
      })
    }

    return []
  }

  refinePath(path) {
    const indexes: number[] = []
    for (let i = 0; i < path.length; i++) {
      let tile = path[i]
      if (!tile) continue

      let neighbors = this.getAllNeighbors(tile)

      if (neighbors.length === 8) {
        indexes.push(i)
      }
      // let diagonalNeighbors = this.getDiagonalNeighbors(tile)
      // let cardinalNeighbors = this.getCardinalNeighbors(tile)
      // if (diagonalNeighbors.length < 4 && cardinalNeighbors === 4) {
      //   indexes.push(i)
      // }
    }
    indexes.forEach((i) => {
      if ((indexes.includes(i - 1) && indexes.includes(i + 1)) || i === 0) {
        path[i] = undefined
      }
    })
    let newPath = path.filter((p) => p !== undefined)

    return newPath
  }

  setFinalDestinationToWalkable(endPos, entity) {
    let closestTile
    let minDist = Infinity

    let filteredList = this.closedList.filter((p, i) => i % 10 === 0)

    for (let tile of filteredList) {
      if (this.grid[tile.y][tile.x] === 0 || this.grid[tile.y][tile.x] === 1) {
        let dist = this.heuristic(tile, endPos)
        if (dist < minDist) {
          closestTile = tile
          minDist = dist
        }
      }
    }
    if (closestTile) {
      entity.move.finaldestination.x = LIB.tileToCoordinate(closestTile.x)
      entity.move.finaldestination.y = LIB.tileToCoordinate(closestTile.y)
    }
  }

  // Compute heuristic cost between current node and end node

  heuristic(current, end) {
    // Ensure positions are valid
    if (!current || !end) {
      return 0
    }
    let xDiff = Math.abs(current.x - end.x)
    let yDiff = Math.abs(current.y - end.y)

    if (xDiff > 0 && yDiff > 0) {
      // diagonal difference - add penalty
      return (xDiff + yDiff) * 1.1
    } else {
      return xDiff + yDiff
    }
  }

  // Get node in open list with lowest f cost
  getLowestF(openList) {
    return openList.reduce((lowest, node) => {
      if (node.f < lowest.f) {
        lowest = node
      }
      return lowest
    }, openList[0])
  }

  reconstructPath(endNode, startPos) {
    let path: number[] = []
    let current = endNode

    let minG = Infinity
    let minH = Infinity
    let max = 300
    while (current && max > 0) {
      path.unshift(current) // add to front
      const neighbors = this.getAllNeighbors(current)

      let closest
      _.reverse(neighbors)
      neighbors.forEach((neighbor) => {
        let found = false
        this.closedList.forEach((p) => {
          if (found) return
          if (p.x === neighbor.x && p.y === neighbor.y) {
            let newH = this.heuristic(p, startPos)
            if ((p.g <= minG && newH < minH) || p.g < minG) {
              minG = p.g
              minH = newH
              closest = p
              found = true
            }
          }
        })
      })
      current = closest
      max--
    }
    path.shift()
    return path
  }
}