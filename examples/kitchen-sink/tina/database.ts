import { createDatabase, TinaLevelClient } from '@tinacms/datalayer'

const localLevelStore = new TinaLevelClient()
localLevelStore.openConnection()

export default createDatabase({
  level: localLevelStore,
})
