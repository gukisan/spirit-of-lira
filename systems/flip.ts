export default class flip {
  process() {
    WORLD.entities.forEach((entity, id) => {
      if (!entity.move) return
      if (GPIXI.elapsedMS - entity.visual.flipMS < 200) return

      if (!CACHE.entities.get(id)) return
      const previousX = CACHE.entities.get(id).position.x
      const container = GPIXI.getMain(id)
      if (!container) return

      // exclude effect
      const back = GPIXI.getBack(id)
      const middle = GPIXI.getMiddle(id)
      const front = GPIXI.getFront(id)
      if (!back || !middle || !front) return
      const containers = [back, middle, front]

      // move
      if (entity.position.x < previousX) {
        containers.forEach((container) => (container.scale.x = -1))
        entity.visual.flipMS = GPIXI.elapsedMS
      } else if (entity.position.x > previousX) {
        containers.forEach((container) => (container.scale.x = 1))
        entity.visual.flipMS = GPIXI.elapsedMS
      }

      // attack target
      if (entity.target.id && entity.target.attacked) {
        const targetEntity = WORLD.entities.get(entity.target.id)
        if (targetEntity.position.x < entity.position.x) {
          containers.forEach((container) => (container.scale.x = -1))
          entity.visual.flipMS = GPIXI.elapsedMS
        } else if (targetEntity.position.x > entity.position.x) {
          containers.forEach((container) => (container.scale.x = 1))
          entity.visual.flipMS = GPIXI.elapsedMS
        }
      }
    })
  }
}
