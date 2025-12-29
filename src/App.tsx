import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import Login from "./components/Login";
import routes from "./utils/routes";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./components/Register";

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path={routes.home()} element={<HomePage />}></Route>
      </Route>
      <Route path={routes.login()} element={<Login />}></Route>
      <Route path={routes.register()} element={<Register />}></Route>
    </Routes>
  );
}

export default App;
