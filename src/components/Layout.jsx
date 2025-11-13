import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WalletConnector from "@/components/WalletConnector";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/authStore";

const navigation = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/funds", label: "Funds" },
];

const adminNavigation = [{ to: "/admin/funds", label: "Admin" }];

const linkClasses = ({ isActive }) =>
  cn(
    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );

function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-64 flex-col border-r bg-background p-6 md:flex">
        <div className="mb-10 text-2xl font-semibold">EUT Platform</div>
        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClasses}>
              {item.label}
            </NavLink>
          ))}
          {user?.role === "admin" &&
            adminNavigation.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClasses}>
                {item.label}
              </NavLink>
            ))}
        </nav>
        <div className="mt-auto space-y-2 text-sm text-muted-foreground">
          <div>{user?.fullName ?? user?.email}</div>
          <div className="capitalize">Role: {user?.role}</div>
        </div>
        <Button variant="outline" className="mt-4" onClick={handleLogout}>
          Logout
        </Button>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-background px-6 py-4 shadow-sm">
          <div className="md:hidden">
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value=""
              onChange={(event) => {
                if (event.target.value) {
                  navigate(event.target.value);
                }
              }}
            >
              <option value="" disabled>
                Navigate
              </option>
              {[...navigation, ...(user?.role === "admin" ? adminNavigation : [])].map((item) => (
                <option key={item.to} value={item.to}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[200px]">
            <h1 className="text-xl font-semibold">{user ? `Welcome, ${user.fullName ?? user.email}` : "EUT"}</h1>
            <p className="text-sm text-muted-foreground">European Unity Trust investment platform</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <WalletConnector />
            </div>
            <Button variant="outline" className="hidden md:inline-flex" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
