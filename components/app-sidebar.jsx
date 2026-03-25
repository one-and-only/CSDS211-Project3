import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import SidebarUserAuth from "./sidebar-user-auth"

export function AppSidebar() {
  return (
    <Sidebar collapsible="offcanvas" variant="floating">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarUserAuth />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}