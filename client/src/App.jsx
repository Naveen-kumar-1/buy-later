import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { routes } from "./routes";
import Loader from "./components/Loader";

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
