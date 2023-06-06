class EntityFactory {
  private nextId = 1
  private componentPriority = {
    visual: 2,
    alive: 1,
  }

  init() {
    STORE.components.forEach((value, name) => {
      if (this.componentPriority[name]) return
      this.componentPriority[name] = 0
    })
  }

  /**  @returns promise of entity id or undefined */
  async createEntity(name: string, components?: { [key: string]: any }) {
    //
    const entity = _.cloneDeep(STORE.entities.get(name))
    if (!entity) {
      LIB.logWarning(`"${name}" not found (ENTITY_FACTORY)`)
      return
    }
    const id = this.nextId
    this.nextId++

    // inject / expand components from argument
    _.forEach(components, (value, name) => (entity[name] = _.cloneDeep(value)))

    // inject / expand components from components folder
    await this.injectComponents(entity, id)

    WORLD.entities.set(id, entity)
    return id
  }

  /** inject / expand components from components folder */
  private async injectComponents(entity: gEntity, id: number) {
    //
    const sortedPriority = LIB.sortedKeys(this.componentPriority)

    const promises: Promise<void>[] = []
    sortedPriority.forEach((name) => {
      const value = STORE.components.get(name)
      if (!value) return

      // entity model has this component or component is default
      if (entity[name] || value.default) {
        this.dependCounter = 0
        promises.push(this.mergeComponent(entity, id, name, value))
      }
    })
    await Promise.all(promises)
  }

  private dependCounter = 0

  private async mergeComponent(entity, id, name, value) {
    this.dependCounter++
    if (this.dependCounter > 100) {
      LIB.logWarning(
        `"more than 100 loops of merging components, likely a circular dependency (ENTITY_FACTORY)`
      )
      return
    }

    if (value.depend) {
      const promises: Promise<void>[] = []
      value.depend.forEach((dependName) => {
        if (entity[dependName]) return

        const dependValue = STORE.components.get(dependName)
        if (!dependValue) {
          LIB.logWarning(
            `"${dependName}" as a "${name}" dependency is not found (ENTITY_FACTORY)`
          )
          return
        }
        promises.push(this.mergeComponent(entity, id, dependName, dependValue))
      })
      await Promise.all(promises)
    }

    entity[name] = _.merge(_.cloneDeep(value), entity[name])

    if (entity[name].init) await entity[name].init(entity, id, name, value)

    delete entity[name].depend
    delete entity[name].default
    delete entity[name].init
  }
}
export const ENTITY_FACTORY = new EntityFactory()