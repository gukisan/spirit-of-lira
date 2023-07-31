export default class {
  hover = new PIXI_FILTERS.AdvancedBloomFilter({
    quality: 2,
    bloomScale: 0.23,
    blur: 6,
  })
  // it is offensive follow
  followed = new PIXI_FILTERS.AdjustmentFilter({
    red: 1.4,
    saturation: 0.9,
    brightness: 0.7,
  })
  lastContainer: Container | undefined
  process() {
    if (this.lastContainer) this.lastContainer.filters = []
    const id = WORLD.hero.target.id
    const entity = WORLD.entities.get(id)
    if (!id || !entity) return
    const animation = SPRITE.getLayer(id, "animation")
    if (animation) {
      animation.filters = [this.hover]
      // 📜 here cast is always offensive, when other cast added, think how to change that
      if (WORLD.hero.state.follow || WORLD.hero.state.cast) {
        animation.filters.push(this.followed)
      }
    }
    this.lastContainer = animation
  }
  init() {
    // Preload filters to prevent lag
    const container = SPRITE.getContainer(WORLD.heroId)
    if (container) {
      container.filters = [this.hover, this.followed]
      setTimeout(() => (container.filters = []), 0)
    }
  }
}
