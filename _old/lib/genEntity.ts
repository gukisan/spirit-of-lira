export function genEntity(
  rawCreature: { [index: string]: any },
  options: {
    x: number
    y: number
  }
): { [index: string]: any } {
  const creature = _.cloneDeep(rawCreature)
  creature.x = options.x
  creature.y = options.y
  return creature
}