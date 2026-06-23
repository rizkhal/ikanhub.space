import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout";
import Landing from "./pages/landing";
import Docs from "./pages/docs";
import Explore from "./pages/explore";
import FishDetail from "./pages/fish-detail";
import About from "./pages/about";
import { ThemeProvider } from "./hooks/use-theme";

export default function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/fish/:id" element={<FishDetail />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}
