export default class target {
  //
  init() {
    //
    // Preload filters to prevent lag
    const container = GPIXI.getMain(GLOBAL.heroId)

    if (container) {
      container.filters = [
        new PIXI_FILTERS.AdvancedBloomFilter({
          quality: 2,
          bloomScale: 0.23,
          blur: 6,
        }),
      ]
      container.filters.push(
        new PIXI_FILTERS.AdjustmentFilter({
          red: 1.4,
          saturation: 0.9,
          brightness: 0.7,
        })
      )
      setTimeout(() => {
        container.filters = []
      }, 0)
    }
  }

  process() {
    //
    this.updateHoverEntity()

    this.autoTarget() // work on all entities and hero with gamepad

    this.heroTargetByGamepad()

    if (!SYSTEM_DATA.states.autoMouseMove) this.heroTargetByMouse()

    this.updateHeroTargetFilter()
    this.targetUnlock() // work on all entities when target is far away

    this.updateTargetEntity()
  }

  private updateTargetEntity() {
    WORLD.entities.forEach((entity) => {
      if (!entity.target) return
      entity.target.entity = WORLD.entities.get(entity.target.id)
    })
  }

  autoTarget() {
    WORLD.entities.forEach((entity, id) => {
      if (!entity.move) return

      if (entity.target.attacked) {
        const targetEntity = WORLD.entities.get(entity.target.id)
        const distance = LIB.distance(entity.position, targetEntity.position)

        if (id !== GLOBAL.heroId && distance > 300) {
          entity.target.id = undefined
          entity.target.locked = false
          entity.target.attacked = false
        } else {
          return
        }
      }

      if (entity.target.locked) return
      let minDistance = Infinity

      WORLD.entities.forEach((otherEntity, otherId) => {
        if (id === otherId || !otherEntity.move) return
        if (
          entity.attributes.faction === otherEntity.attributes.faction &&
          id !== GLOBAL.heroId
        ) {
          return
        }
        if (id === GLOBAL.heroId && INPUT.lastActiveDevice !== "gamepad") return

        const distance = LIB.distance(entity.position, otherEntity.position)
        if (distance < minDistance) {
          minDistance = distance
          entity.target.id = otherId
        }

        if (
          entity.attributes.faction !== otherEntity.attributes.faction &&
          id !== GLOBAL.heroId
        ) {
          entity.target.attacked = true
        }
      })

      let maxTargetDistance = 300
      if (id === GLOBAL.heroId) maxTargetDistance = 540

      if (minDistance > maxTargetDistance) {
        entity.target.id = undefined
      }
    })
  }

  heroTargetByGamepad() {
    if (GLOBAL.hero.target.locked) return
    if (INPUT.lastActiveDevice !== "gamepad") return
    if (!LIB.deadZoneExceed(USER_DATA.settings.inputOther.gamepad.deadZone)) {
      return
    }

    const axesVector = LIB.vector(INPUT.gamepad.axes[0], INPUT.gamepad.axes[1])
    const axesAngle = axesVector.angle

    let minAngle = Infinity
    let closestEntityId = 0

    // group to choose closest by distance not by angle if angle is small
    const closestGroup: number[] = []
    const correspondDistances: number[] = []
    const angleToGroup = 0.2 // about 12 degrees

    WORLD.entities.forEach((entity, id) => {
      if (!entity.move || id === GLOBAL.heroId) return

      const distance = LIB.distance(GLOBAL.hero.position, entity.position)
      if (distance > 750) return

      const entityAngle = LIB.angle(GLOBAL.hero.position, entity.position)
      const angle = Math.abs(entityAngle - axesAngle)

      if (angle < angleToGroup) {
        closestGroup.push(id)
        correspondDistances.push(distance)
      }

      // already set closest if group wont be used
      if (angle < minAngle) {
        minAngle = angle
        closestEntityId = id
      }
    })

    if (closestGroup.length > 0) {
      let minDistance = Infinity
      closestGroup.forEach((id, index) => {
        const distance = correspondDistances[index]
        if (distance < minDistance) {
          minDistance = distance
          closestEntityId = id
        }
      })
    }

    GLOBAL.hero.target.id = closestEntityId
  }
  heroTargetByMouse() {
    if (GLOBAL.hero.target.locked || !GLOBAL.hoverId) return
    GLOBAL.hero.target.id = GLOBAL.hoverId
  }

  updateHoverEntity() {
    if (INPUT.lastActiveDevice === "gamepad") return

    const point = LIB.mousePoint()
    const heroPosition = GLOBAL.hero.position
    const intersections: number[] = []
    let hoverEntityId = 0

    WORLD.entities.forEach((entity, id) => {
      if (id === GLOBAL.heroId || !entity.move || !entity.size) return

      // how mutch height goes under the y coordinate
      let offset = entity.size.width / 4

      const position = entity.position

      const rect = {
        x: position.x - heroPosition.x + 960 - entity.size.width / 2,
        y: position.y - heroPosition.y + 540 - entity.size.height + offset,
        width: entity.size.width,
        height: entity.size.height,
      }
      const intersectX = point.x < rect.x + rect.width && point.x > rect.x
      const intersectY = point.y < rect.y + rect.height && point.y > rect.y

      if (intersectX && intersectY) intersections.push(id)
    })

    // in case there is more than one entity under the mouse
    if (intersections.length > 1) {
      let higherY = 0

      intersections.forEach((id) => {
        if (WORLD.entities.get(id).position.y > higherY) {
          higherY = WORLD.entities.get(id).position.y
        }
        hoverEntityId = id
      })
    } else if (intersections.length === 1) {
      hoverEntityId = intersections[0]
      //
    }

    GLOBAL.hoverId = hoverEntityId
    GLOBAL.hover = WORLD.entities.get(hoverEntityId)
  }

  lastContainer: Container | undefined

  updateHeroTargetFilter() {
    // 📜 implement filter handler somewhere
    if (this.lastContainer) this.lastContainer.filters = []

    const id = GLOBAL.hero.target.id
    const entity = WORLD.entities.get(id)
    if (!id || !entity) return

    if (entity.attack.damageFilterStartMS + 100 > GPIXI.elapsedMS) return

    const container = GPIXI.getMiddle(id)

    if (container) {
      container.filters = [
        new PIXI_FILTERS.AdvancedBloomFilter({
          quality: 2,
          bloomScale: 0.23,
          blur: 6,
        }),
      ]
      if (GLOBAL.hero.target.attacked) {
        container.filters.push(
          new PIXI_FILTERS.AdjustmentFilter({
            red: 1.4,
            saturation: 0.9,
            brightness: 0.7,
          })
        )
      }
    }
    this.lastContainer = container
  }

  targetUnlock() {
    WORLD.entities.forEach((entity, id) => {
      if (!entity.move) return
      if (!entity.target.id) entity.target.locked = false
    })

    const targetEntity = WORLD.entities.get(GLOBAL.hero.target.id)
    if (!targetEntity) return
    const distance = LIB.distance(GLOBAL.hero.position, targetEntity.position)

    if (distance > 1000) GLOBAL.hero.target.locked = false
  }
}
