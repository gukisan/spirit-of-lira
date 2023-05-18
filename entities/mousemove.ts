export default class mousemove {
  visual = {
    parentContainer: "ground",
  }
  position = { x: 0, y: 0 }
  process(entity, id) {
    let position = entity.get("position")
    if (!position) return

    const targetPosition = gworld.entities
      .get(gsd.states.heroId)
      .get("alive").targetPosition
    if (!targetPosition) {
      position.x = 0
      position.y = 0
      return
    }
    position.x = targetPosition.x
    position.y = targetPosition.y

    const displacement = glib.vectorFromPoints(
      position,
      gworld.entities.get(gsd.states.heroId).get("position")
    )
    const distance = displacement.distance
    const speedPerTick = glib.speedPerTick(
      gworld.entities.get(gsd.states.heroId)
    )

    // hide
    if (distance < speedPerTick) {
      position.x = 0
      position.y = 0
      return
    }

    const container = gp.getContainer(id)
    if (container) {
      container.children[1].angle += 80 * gp.deltaSec
      const scale = 1
      container.scale = { x: 1, y: 0.5 }
      container.scale.x *= scale
      container.scale.y *= scale
      const animationSprite = gp.getAnimationSprite(id, "idle")
      if (!animationSprite) return
      animationSprite.blendMode = PIXI.BLEND_MODES.OVERLAY
      animationSprite.alpha = distance / 100
    }
  }
}
