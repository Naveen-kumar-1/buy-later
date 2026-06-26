import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { lazy } from "react";
import { Navigate } from "react-router-dom";

const Home = lazy(() => import("@/pages/Home"));
const Auth = lazy(() => import("@/pages/Auth"));

export const routes = [
  {
    path: "/",
    element: (
      <>
        <SignedIn>
          <Navigate to="/home" replace />
        </SignedIn>
        <SignedOut>
          <Auth />
        </SignedOut>
      </>
    ),
  },
  {
    path: "/home",
    element: (
      <>
        <SignedIn>
          <Home />
        </SignedIn>
        <SignedOut>
          <Navigate to="/" replace />
        </SignedOut>
      </>
    ),
  },
];
