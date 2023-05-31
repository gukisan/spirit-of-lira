class SystemData {
  //

  private _refs = glib.store({
    background: undefined, // to switch fullscreen
    viewport: undefined, // to init pixi and gic
    input: undefined,
    output: undefined,
  })
  get refs() {
    return this._refs()
  }

  private _states = glib.store({
    gameWindowScale: 1,
    fullscreen: false,
    loadingScreen: true,
    devMode: false,
    collisionEdit: false,
    collision: true,
    firstMouseMove: false,
    inputFocus: false,

    // UI on / off
    inventory: false,
    input: false,
  })
  get states() {
    return this._states()
  }
}
export const gsd = new SystemData()
