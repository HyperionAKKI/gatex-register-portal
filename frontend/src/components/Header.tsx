import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import companyLogo from "@/assets/company-logo.png";
import schoolLogo from "@/assets/school-logo.jpg";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src={companyLogo}
            alt="GateX Innovations Logo"
            className="h-8 sm:h-10 w-auto object-contain flex-shrink-0"
          />
          <span className="hidden text-lg font-semibold text-foreground md:inline truncate">
            Student Registration System
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <Link to="/register">
            <Button size="sm" className="text-xs sm:text-sm px-2.5 sm:px-3">Register</Button>
          </Link>
          <img
            src={schoolLogo}
            alt="The Indian Revolutionary School Logo"
            className="h-8 sm:h-10 w-auto object-contain"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
