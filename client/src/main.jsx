import { ClerkProvider } from "@clerk/clerk-react";
import { shadcn } from "@clerk/ui/themes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import "./index.css";
import App from "./App.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider
      appearance={{ theme: shadcn }}
      afterSignOutUrl="/"
      publishableKey={PUBLISHABLE_KEY}
    >
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ClerkProvider>
  </StrictMode>,
);
