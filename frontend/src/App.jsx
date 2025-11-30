import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import Navbar from "./common/components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import CommentPage from "./pages/CommentPage";
import SocketDebug from "./common/SocketDebug";

function App() {
  return (
    <div className="App">
      {/* <SocketDebug /> */}
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comments"
          element={
            <ProtectedRoute>
              <CommentPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
