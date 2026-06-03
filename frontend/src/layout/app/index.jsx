// AppLayout.jsx
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Providers } from "../../redux/Providers";

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Providers>
        <Navbar />
        <main className="flex-1 min-h-[60vh]">{children}</main>
        <Footer />
      </Providers>
    </div>
  );
};

export default AppLayout;
