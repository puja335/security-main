import AdminLogin from "../components/auth/Login"
import AdminSignup from "../components/auth/Signup"
import Hero from "../components/hero/Hero"
import AdminLayout from "../layout/AdminLayout"
import HomeLayout from "../layout/HomeLayout"
import OwnerLayout from "../layout/OwnerLayout"
import UserLayout from "../layout/UserLayout"
import AdminDashboardPage from "../pages/admin/AdminDashboardPage"
import ApprovedTheatersPage from "../pages/admin/ApprovedTheatersPage"
import ApproveTheaterPage from "../pages/admin/ApproveTheaterPage"
import MoviePages from "../pages/admin/MoviePage"
import TransactionPage from "../pages/admin/TransactionPage"
import UserPage from "../pages/admin/UserPage"
import ErrorPage from "../pages/Errorpage"
import LoginPage from "../pages/LoginPage"
import MovieDetailPage from "../pages/MovieDetailPage"
import MoviePage from "../pages/MoviePage"
import AddTheaterPage from "../pages/owner/AddTheaterPage"
import AllMoviePage from "../pages/owner/AllMoviePage"
import MyTheaterPage from "../pages/owner/MyTheaterPage"
import OwnerDashboardPage from "../pages/owner/OwnerDashboardPage"
import ShowPage from "../pages/owner/ShowPage"
import ShowSeatPage from "../pages/ShowSeatPage"
import ShowsPage from "../pages/ShowsPage"
import SignupPage from "../pages/SignupPage"
import ViewBookingPage from "../pages/ViewBookingPage"
import AdminRoutes from "../protectRoute/AdminRoutes"
import AuthChecker from "../protectRoute/AuthChecker"
import OwnerRoutes from "../protectRoute/OwnerRoutes"
import UserRoutes from "../protectRoute/UserRoutes"

export const routes = [
  {
    element: <HomeLayout />,
    children: [
      {
        path: "/",
        element: (
          <AuthChecker>
            <Hero />
          </AuthChecker>
        ),
      },
      {
        path: "/movies",
        element: <MoviePage />,
      },
      {
        path: "/signup",
        element: (
          <AuthChecker>
            <SignupPage />
          </AuthChecker>
        ),
      },
      {
        path: "/admin/login",
        element: <AdminLogin />,
      },
      {
        path: "/admin/signup",
        element: <AdminSignup />,
      },
      {
        path: "/login",
        element: (
          <AuthChecker>
            <LoginPage />
          </AuthChecker>
        ),
      },
      {
        path: "*",
        element: <ErrorPage />,
      },
    ],
  },
  {
    element: <UserLayout />,
    children: [
      {
        path: "/home",
        element: (
          <UserRoutes>
            <Hero />
          </UserRoutes>
        ),
      },
      {
        path: "/userHome",
        element: (
          <UserRoutes>
            <MoviePage />
          </UserRoutes>
        ),
      },
      {
        path: "/movie/:id",
        element: (
          <UserRoutes>
            <MovieDetailPage />
          </UserRoutes>
        ),
      },
      {
        path: "/shows/:id",
        element: (
          <UserRoutes>
            <ShowsPage />{" "}
          </UserRoutes>
        ),
      },
      {
        path: "/showSeat/:showId",
        element: (
          <UserRoutes>
            <ShowSeatPage />
          </UserRoutes>
        ),
      },
      {
        path: "/bookings",
        element: (
          <UserRoutes>
            <ViewBookingPage />
          </UserRoutes>
        ),
      },
    ],
  },

  {
    element: <AdminLayout />,
    children: [
      {
        path: "/adminDashboard",
        element: (
          <AdminRoutes>
            <AdminDashboardPage />
          </AdminRoutes>
        ),
      },
      {
        path: "/transactions",
        element: (
          <AdminRoutes>
            <TransactionPage />
          </AdminRoutes>
        ),
      },
      {
        path: "/users",
        element: (
          <AdminRoutes>
            <UserPage />
          </AdminRoutes>
        ),
      },
      {
        path: "/theaters/approved",
        element: (
          <AdminRoutes>
            <ApprovedTheatersPage />
          </AdminRoutes>
        ),
      },
      {
        path: "/theater/pending-approval",
        element: (
          <AdminRoutes>
            <ApproveTheaterPage />
          </AdminRoutes>
        ),
      },
      {
        path: "/movie",
        element: (
          <AdminRoutes>
            <MoviePages />
          </AdminRoutes>
        ),
      },
    ],
  },
  {
    element: <OwnerLayout />,
    children: [
      {
        path: "/ownerDashboard",
        element: (
          <OwnerRoutes>
            <OwnerDashboardPage />
          </OwnerRoutes>
        ),
      },
      {
        path: "/movie-list",
        element: (
          <OwnerRoutes>
            <AllMoviePage />
          </OwnerRoutes>
        ),
      },
      {
        path: "/theater/add",
        element: (
          <OwnerRoutes>
            <AddTheaterPage />
          </OwnerRoutes>
        ),
      },
      {
        path: "/theaters/my-theaters",
        element: (
          <OwnerRoutes>
            <MyTheaterPage />
          </OwnerRoutes>
        ),
      },
      {
        path: "/shows",
        element: (
          <OwnerRoutes>
            <ShowPage />
          </OwnerRoutes>
        ),
      },
    ],
  },
]
