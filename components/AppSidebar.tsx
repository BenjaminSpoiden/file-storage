import { Plus } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/Sidebar"
import { UserButton } from "./UserButton"
import { OrganizationSwitcher } from "@clerk/nextjs"


export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <OrganizationSwitcher />
            </SidebarMenuItem>
          </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
          <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupAction>
              <Plus /> <span className="sr-only">Add Project</span>
          </SidebarGroupAction>
          <SidebarGroupContent></SidebarGroupContent>
          </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
