export interface ActivityCategory {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export interface Activity {
  id?: string;
  description: string;
  duration: number;
  categoryId: string;
}

export type NewActivityCategory = Omit<ActivityCategory, 'id'>;
export type UpdateActivityCategory = Partial<NewActivityCategory>;