export default class {
  items = {
    // value is an array of states that goes in front
    "common-sword": ["attack"],
  }
  itemSprites: AnimatedSprite[] = []

  process() {
    const heroSprite = GPIXI.getSprite(
      SYSTEM_DATA.world.heroId,
      SYSTEM_DATA.world.hero.sprite.animation
    )
    if (!heroSprite) return

    if (
      SYSTEM_DATA.world.hero.sprite.animation.includes("attack") ||
      (!SYSTEM_DATA.world.hero.sprite.animation.includes("attack") &&
        SYSTEM_DATA.world.lastHero.sprite.animation.includes("attack"))
    ) {
      this.itemSprites.forEach((sprite) => {
        //
        // instead of checking each state, just syncronizes all item sprites
        // and mock up if the frame difference for shorter state animations =)
        if (heroSprite.currentFrame > sprite.totalFrames - 1) return

        sprite.gotoAndPlay(heroSprite.currentFrame)
      })
    }

    this.updateVisibilityByState()
  }

  async init() {
    if (!GPIXI.app || !SYSTEM_DATA.world.heroId) return
    if (!GPIXI.getMain(SYSTEM_DATA.world.heroId)) return

    const promises: Promise<void>[] = []

    _.forEach(this.items, (frontStates, name) => {
      promises.push(
        new Promise(async (resolve) => {
          const spritesheet = await GPIXI.getSpritesheet(name)
          if (!spritesheet) return

          const backItemContainer = new PIXI.Container() as gContainer
          backItemContainer.name = name
          const back = GPIXI.getMain(SYSTEM_DATA.world.heroId)
            ?.children[0] as Container
          back.addChild(backItemContainer)

          const frontItemContainer = new PIXI.Container() as gContainer
          frontItemContainer.name = name
          const front = GPIXI.getMain(SYSTEM_DATA.world.heroId)
            ?.children[2] as Container
          front.addChild(frontItemContainer)

          _.forOwn(spritesheet.animations, (arrayOfwebpImages, stateName) => {
            const animatedSprite = new PIXI.AnimatedSprite(arrayOfwebpImages)
            animatedSprite.name = stateName
            animatedSprite.anchor.x = 0.5
            animatedSprite.anchor.y = 0.5
            animatedSprite.animationSpeed = 1 / 6
            animatedSprite.visible = false
            animatedSprite.cullable = true
            animatedSprite.play()
            this.itemSprites.push(animatedSprite)

            // classify items on back or in front
            if (frontStates.includes(stateName)) {
              frontItemContainer.addChild(animatedSprite)
            } else backItemContainer.addChild(animatedSprite)
          })

          resolve()
        })
      )
    })
    await Promise.all(promises)
  }
  private updateVisibilityByState() {
    const currentAnimation = SYSTEM_DATA.world.hero.sprite.animation

    // 📜 move to class scope
    const back = GPIXI.getMain(SYSTEM_DATA.world.heroId)
      ?.children[0] as Container
    const front = GPIXI.getMain(SYSTEM_DATA.world.heroId)
      ?.children[2] as Container
    if (!back || !front) return

    back.children.forEach((child) => {
      const itemContainer = child as Container
      itemContainer.children.forEach((sprite) => {
        if (
          sprite.name === currentAnimation ||
          (sprite.name === "idle" && currentAnimation === "run") ||
          (sprite.name === "idle" && currentAnimation === "walk")
        ) {
          sprite.visible = true
        } else {
          sprite.visible = false
        }
      })
    })
  }
}