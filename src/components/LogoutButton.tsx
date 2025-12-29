import { useApolloClient, useMutation } from "@apollo/client/react";
import { LogoutDocument } from "../graphql/types/__generated__/graphql";
import { useNavigate } from "react-router";
import { Button } from "@mui/material";
import routes from "../utils/routes";

export default function LogoutButton() {
  const [logout] = useMutation(LogoutDocument);
  const client = useApolloClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      await client.resetStore();
      navigate(routes.login());
    } catch (error) {
      console.warn("Logout faied", error);
      await client.resetStore();
      navigate(routes.login());
    }
  };
  return <Button onClick={handleLogout}>Выйти</Button>;
}
