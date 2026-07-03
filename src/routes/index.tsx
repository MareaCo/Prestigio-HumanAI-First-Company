import { createFileRoute } from "@tanstack/react-router";
import { AppProvider, useApp } from "@/context/AppContext";
import { LoginScreen } from "@/screens/Login";
import { DashboardScreen } from "@/screens/Dashboard";
import { UsersScreen } from "@/screens/Users";
import { EmployeeDetailScreen } from "@/screens/EmployeeDetail";
import { QuizScreen } from "@/screens/Quiz";
import { ReportScreen } from "@/screens/Report";

export const Route = createFileRoute("/")({
  component: IndexRoute,
});

function IndexRoute() {
  return (
    <AppProvider>
      <ScreenRouter />
    </AppProvider>
  );
}

function ScreenRouter() {
  const { screen } = useApp();

  switch (screen) {
    case "login":
      return <LoginScreen />;
    case "dashboard":
      return <DashboardScreen />;
    case "users":
      return <UsersScreen />;
    case "quiz":
      return <QuizScreen />;
    case "employee-detail":
      return <EmployeeDetailScreen />;
    case "report":
      return <ReportScreen />;
    default:
      return <DashboardScreen />;
  }
}
