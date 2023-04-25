import { Graphics } from "pixi.js"

class CollisionEditor {
  public collisionArray: number[] = []
  private collisionGrid: Graphics[][] = []

  public drawCollisionGrid() {
    const height = 13
    const width = 21
    for (let y of _.range(height)) {
      let row: Graphics[] = []
      for (let x of _.range(width)) {
        let square = new PIXI.Graphics()
        square.blendMode = PIXI.BLEND_MODES.MULTIPLY
        square.beginFill(0xffffff, 0.65)
        square.drawRect(x * 100, y * 100, 100, 100)
        square.endFill()
        row.push(square)
        gpm.collision.addChild(square)
      }
      this.collisionGrid.push(row)
    }
    for (let y of _.range(height)) {
      for (let x of _.range(width)) {
        let square = new PIXI.Graphics()
        square.blendMode = PIXI.BLEND_MODES.MULTIPLY
        square.lineStyle(5, 0xe6e6e6)
        square.drawRect(x * 100, y * 100, 100, 100)
        gpm.collision.addChild(square)
      }
    }
    gpm.collision.pivot.x = gpm.collision.width / 2
    gpm.collision.pivot.y = gpm.collision.height / 2
    gpm.collision.visible = false
  }
  public updateCollisionGrid() {
    if (!gef.instanciatedHero) return

    // center point of collision grid minus hero offset
    gpm.collision.x =
      1920 / 2 - glib.coordinateOffsetInTile(gef.instanciatedHero.x) + 50
    gpm.collision.y =
      1080 / 2 - glib.coordinateOffsetInTile(gef.instanciatedHero.y) + 50

    const startX = glib.coordinateToTile(gef.instanciatedHero.x) - 10
    const startY = glib.coordinateToTile(gef.instanciatedHero.y) - 6
    this.collisionGrid.forEach((row, y) => {
      row.forEach((square, x) => {
        const i = (startY + y) * 1000 + startX + x
        if (this.collisionArray[i] === 0) square.tint = 0xffffff
        else if (this.collisionArray[i] === 1) square.tint = 0x95d5b2
        else if (this.collisionArray[i] === 2) square.tint = 0x7e7eff
        else square.tint = 0x8f0005
      })
    })
  }
  private updateCollisionArray() {
    if (!gef.instanciatedHero) return

    let i = glib.tileIndexFromEntity(gef.instanciatedHero)

    if (gic.gamepad.pressed.includes("Y")) this.collisionArray[i] = 0
    else if (gic.gamepad.pressed.includes("X")) this.collisionArray[i] = 1
    else if (gic.gamepad.pressed.includes("B")) this.collisionArray[i] = 2
    else if (gic.gamepad.pressed.includes("A")) this.collisionArray[i] = 3
    else if (gic.gamepad.pressed.includes("RB"))
      this.debouncedSaveToLocalStorage()
  }
  private debouncedSaveToLocalStorage = _.debounce(() => {
    localStorage.setItem("collisionArray", JSON.stringify(this.collisionArray))
    console.log(timeNow() + " ✅ collision saved to local storage")

    const stringifiedArray = JSON.stringify(this.collisionArray)
    const blob = new Blob([stringifiedArray], { type: "application/json" })

    const url = URL.createObjectURL(blob)

    // Create a hidden link element
    const link = document.createElement("a")
    link.style.display = "none"
    link.href = url
    link.download = "collisionArray.json"

    // Add the link element to the document
    document.body.appendChild(link)

    // Trigger the download
    link.click()

    // Clean up the URL and link element
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)
  }, 30)
  public initialize() {
    const localStorageCollisionArray = localStorage.getItem("collisionArray")
    if (localStorageCollisionArray) {
      this.collisionArray = JSON.parse(localStorageCollisionArray)
    } else {
      this.collisionArray = _.times(1000 * 1000, _.constant(0))
    }

    this.drawCollisionGrid()

    gpm.app?.ticker.add(() => {
      if (gim.states.editingCollision) {
        gpm.collision.visible = true
        this.updateCollisionArray()
        this.updateCollisionGrid()
      } else {
        gpm.collision.visible = false
      }
    })
  }
}

export const gce = new CollisionEditor()