export interface Repository<Entity> {
  find(id: string): Promise<Entity | undefined>;
}
