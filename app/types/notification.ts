export type Notification = {
  id: string;
  text: string | null;
  date: string | null;
  creator_id: string;
  recipients: string[] | null;
  opened_by: string[] | null;
};
