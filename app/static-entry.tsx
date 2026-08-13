import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import LearningApp from "./LearningApp";

const root = document.getElementById("root");
if (!root) throw new Error("Missing application root.");

createRoot(root).render(
  <StrictMode>
    <LearningApp />
  </StrictMode>,
);
