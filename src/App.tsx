import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import routes from "./utils/routes";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import NavBar from "./components/NavBar";
import { Container } from "@mui/material";
import AdminPage from "./pages/AdminPage";
import UsersPage from "./pages/admin/UsersPage";

function App() {
  return (
    <>
      <NavBar />
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path={routes.home()} element={<HomePage />}></Route>
            <Route path={routes.profile()} element={<ProfilePage />}></Route>
            <Route path={routes.admin.root()} element={<AdminPage />}>
              <Route
                path={routes.admin.users()}
                element={<UsersPage />}
              ></Route>
            </Route>
          </Route>
          <Route path={routes.login()} element={<LoginPage />}></Route>
          <Route path={routes.register()} element={<RegisterPage />}></Route>
        </Routes>
      </Container>
    </>
  );
}

export default App;
