export interface Reward {
  id?: number;
  childId: number;
  activityId?: number | null;
  date: string;
  points: number;
}
