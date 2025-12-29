import { useAuth } from "../hooks/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <>
      <h1>{user?.firstName}</h1>
      <h1>{user?.lastName}</h1>
      <h1>{user?.email}</h1>
    </>
  );
}
