export interface UserStore {
  addUser(username: string, password: string): Promise<boolean>
  getUser(username: string): Promise<any>
  getUsers(): Promise<any[]>
  isInitialized(): Promise<boolean>
  deleteUser(username: string): Promise<boolean>
  updatePassword(username: string, password: string): Promise<boolean>
}
