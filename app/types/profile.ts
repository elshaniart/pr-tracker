export type Profile = {
  id: string;
  height_cm: number | null;
  weight_kg: number | null;
  birthday: string | null;
  bench_press_pr: number | null;
  squat_pr: number | null;
  deadlift_pr: number | null;
  onboarded: boolean;
  name: string | null;
  thiefofjoy: boolean; // Add thiefOfJoy to the Profile type
  username: string | null;
  friends: string[] | null;
  profile_pic: string | null;
};
