import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home as HomeIcon, FileText, Settings, Bell } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

// 🚀 Voice Assistant Import
import VoiceAssistant from "@/components/VoiceAssistant";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <div className="flex min-h-screen bg-background w-full">
            <Sidebar>
              <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-4">
                  <SidebarTrigger />
                  <span className="font-bold text-lg text-primary">HealthScan AI</span>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/">
                        <HomeIcon className="mr-2" /> Dashboard
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#history">
                        <FileText className="mr-2" /> History
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#reports">
                        <Bell className="mr-2" /> Reports
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#settings">
                        <Settings className="mr-2" /> Settings
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
              <SidebarSeparator />
              <SidebarFooter>
                <div className="flex items-center gap-3 px-2 py-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="Doctor" />
                    <AvatarFallback>DR</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">User</div>
                    <div className="text-xs text-muted-foreground">B.Tech CSE Student</div>
                  </div>
                </div>
              </SidebarFooter>
            </Sidebar>
            
            <main className="flex-1 relative">
              <Toaster />
              {/* 🎙️ Voice Assistant Component - Har page par dikhega */}
              <VoiceAssistant /> 
              <Router />
            </main>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;