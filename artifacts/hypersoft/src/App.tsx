import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Projects from "@/pages/projects";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Services from "@/pages/services";
import RequestService from "@/pages/request";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminHome from "@/pages/admin-home";
import AdminOrders from "@/pages/admin-orders";
import AdminServices from "@/pages/admin-services";
import AdminCustomers from "@/pages/admin-customers";
import AdminUsers from "@/pages/admin-users";
import AdminRatings from "@/pages/admin-ratings";
import AdminStats from "@/pages/admin-stats";
import AdminSettings from "@/pages/admin-settings";
import AdminReset from "@/pages/admin-reset";
import AdminEditor from "@/pages/admin-editor";
import ProjectDetail from "@/pages/project-detail";
import { ADMIN_BASE_PATH } from "@/lib/admin-auth";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route path="/services" component={Services} />
      <Route path="/request" component={RequestService} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path={ADMIN_BASE_PATH} component={AdminLogin} />
      <Route path={`${ADMIN_BASE_PATH}/dashboard`} component={AdminDashboard} />
      <Route path={`${ADMIN_BASE_PATH}/dashboard/home`} component={AdminHome} />
      <Route path={`${ADMIN_BASE_PATH}/dashboard/orders`} component={AdminOrders} />
      <Route path={`${ADMIN_BASE_PATH}/dashboard/services`} component={AdminServices} />
      <Route path={`${ADMIN_BASE_PATH}/dashboard/customers`} component={AdminCustomers} />
      <Route path={`${ADMIN_BASE_PATH}/dashboard/users`} component={AdminUsers} />
      <Route path={`${ADMIN_BASE_PATH}/dashboard/ratings`} component={AdminRatings} />
      <Route path={`${ADMIN_BASE_PATH}/dashboard/stats`} component={AdminStats} />
      <Route path={`${ADMIN_BASE_PATH}/dashboard/settings`} component={AdminSettings} />
      <Route path={`${ADMIN_BASE_PATH}/new`} component={AdminEditor} />
      <Route path={`${ADMIN_BASE_PATH}/edit/:id`} component={AdminEditor} />
      <Route path={`${ADMIN_BASE_PATH}/reset/:token`} component={AdminReset} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
