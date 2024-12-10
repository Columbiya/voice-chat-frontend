export interface RoomWithUsersDTO {
  id: string;
  name: string;
  users: { userId: string; username: string }[];
}
