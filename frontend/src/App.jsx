import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AddBatchPage from "./pages/AddBatchPage";
import AddProductPage from "./pages/AddProductPage";
import EditProductPage from "./pages/EditProductPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProductListPage from "./pages/ProductListPage";
import PublicVerifyPage from "./pages/PublicVerifyPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/p/:slug/:batchNo" element={<PublicVerifyPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="add-product" replace />} />
          <Route path="add-product" element={<AddProductPage />} />
          <Route path="add-batch" element={<AddBatchPage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="edit-product/:id" element={<EditProductPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
