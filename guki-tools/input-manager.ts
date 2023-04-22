class InputManager {
  //
  private _states = defineStore("input-manager-states", () => {
    const raw: { [index: string]: any } = {
      //
      // updated manually
      activeDevice: "keyboard-mouse",

      // updated with user settings
      heroMouseMove: false,
    }
    const state = _.mapValues(raw, (key) => ref(key))
    return state
  })
  public get states() {
    return this._states()
  }

  private _signals = defineStore("input-manager-signals", () => {
    const raw: { [index: string]: any } = {
      //
      fullscreen: false,
    }
    const state = _.mapValues(raw, (key) => ref(key))
    return state
  })
  public get signals() {
    return this._signals()
  }
  private updateStatesManually() {
    if (gic.gamepad.justConnected) {
      this.states.activeDevice = "gamepad"
      this.states.heroMouseMove = false
    }
    if (gic.gamepad.justDisconnected) {
      this.states.activeDevice = "keyboard-mouse"
    }
  }
  private statesSources = {}
  private updateStatesWithUserSettings() {
    _.forEach(gud.settings.input.states, (value, key) => {
      for (let device of ["keyboard", "mouse", "gamepad"]) {
        if (!value[device]) continue

        if (value[device].hold !== undefined) {
          if (gic[device].pressed.includes(value[device].hold)) {
            this.statesSources[key] = { [device]: "hold" }
            this.states[key] = true
          } else if (this.statesSources[key]?.[device] === "hold") {
            this.states[key] = false
          }
        }
        if (value[device].tap !== undefined) {
          if (gic[device].justPressed.includes(value[device].tap)) {
            this.statesSources[key] = { [device]: "tap" }
            this.states[key] = !this.states[key]
          }
        }
      }
    })
  }
  private signalsSources = {}
  private updateSignalsWithUserSettings() {
    _.forEach(gud.settings.input.signals, (value, key) => {
      for (let device of ["keyboard", "mouse", "gamepad"]) {
        if (!value[device]) continue

        if (value[device].hold !== undefined) {
          if (gic[device].pressed.includes(value[device].hold)) {
            this.signalsSources[key] = { [device]: "hold" }
            this.signals[key] = true
          } else if (this.signalsSources[key]?.[device] === "hold") {
            this.signals[key] = false
          }
        }
        if (value[device].tap !== undefined) {
          if (gic[device].justPressed.includes(value[device].tap)) {
            this.signalsSources[key] = { [device]: "tap" }
            this.signals[key] = true
          } else if (this.signalsSources[key]?.[device] === "tap") {
            this.signalsSources[key] = { [device]: "tap" }
            this.signals[key] = false
          }
        }
      }
    })
  }
  public initialize() {
    gpm.app?.ticker.add(() => {
      gic.update()
      this.updateStatesManually()
      this.updateStatesWithUserSettings()
      this.updateSignalsWithUserSettings()
    })
  }
}

export const gim = new InputManager()