import { Route, Routes } from "react-router";
import Home from "./pages/Home";
import Login from "./components/Login";
import routes from "./utils/routes";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path={routes.home()} element={<Home />}></Route>
      </Route>
      <Route path={routes.login()} element={<Login />}></Route>
    </Routes>
  );
}

export default App;
