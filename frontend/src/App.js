// App.js
// App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider, useSelector, useDispatch } from "react-redux";

import { store } from "./store/store";
import { fetchUser } from "./store/authSlice";
import { setCart } from "./store/cartSlice";
import api from "./services/api";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import NotFoundPage from "./components/NotFoundPage";
import OrdersPage from "./components/OrdersPage";

// Pages
import HomePage from "./pages/HomePage";
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AddressesPage from "./pages/AddressPage";

// Seller Pages
import SellerRegisterPage from "./pages/seller/SellerRegisterPage";
import SellerLayout from "./pages/seller/SellerLayout";
import AddProduct from "./pages/seller/AddProduct";
import UpdateProduct from "./pages/seller/UpdateProduct";

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import ScrollToTop from "./ScrollToTop";
import { Loader } from "lucide-react";


// =====================
// APP CONTENT
// =====================
const AppContent = () => {
  const dispatch = useDispatch();
  const { loading, user } = useSelector((state) => state.auth);

  // 🔐 Restore user from cookie
  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  // 🛒 Fetch cart after login
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get("/cart");

        if (res.data.success) {
          const formattedItems = res.data.data.items.map((item) => ({
            id: item._id,
            productId: item.product._id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.images?.[0]?.url || "",
          }));

          dispatch(setCart(formattedItems));
        }
      } catch (err) {
        console.error("Cart fetch error:", err);
      }
    };

    if (user) {
      fetchCart();
    }
  }, [user, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-[calc(100vh+64px)]">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-orange-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Navbar />

      <main className="flex-grow">
        <Routes>
          {/* 🌐 Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/search" element={<ProductList />} />

          {/* 🔓 Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* 🔒 Protected User Routes */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/order-success"
            element={
              <ProtectedRoute>
                <OrderSuccessPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/addresses"
            element={
              <ProtectedRoute>
                <AddressesPage />
              </ProtectedRoute>
            }
          />

          {/* 🧑‍💼 Seller */}
          <Route
            path="/seller/register"
            element={
              <PublicRoute>
                <SellerRegisterPage />
              </PublicRoute>
            }
          />

          <Route
            path="/seller/*"
            element={
              <ProtectedRoute requiredRole="seller">
                <SellerLayout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/add-product"
            element={
              <ProtectedRoute requiredRole="seller">
                <AddProduct />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/update-product/:id"
            element={
              <ProtectedRoute requiredRole="seller">
                <UpdateProduct />
              </ProtectedRoute>
            }
          />

          {/* 🛠 Admin */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          />

          {/* ❌ 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

   
    </>
  );
};


// =====================
// ROOT APP
// =====================
function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <AppContent />
        </div>
      </Router>
    </Provider>
  );
}

export default App;