import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { ChevronDown, ChevronUp, User2 } from "lucide-react"
import React from "react"
import FolderList from "./FolderList"
import { ScrollArea } from "./ui/scroll-area"

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      {/* Workplace */}
      <SidebarHeader className="bg-white">
        <SidebarMenu>
          <SidebarMenuItem> 
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton >
                  Select Workspace
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem >
                  <span>Coming soon...</span>
                </DropdownMenuItem>
                
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Category List */}
      <ScrollArea className="bg-white h-screen rounded-md">

        <SidebarContent className="bg-white">
          <SidebarGroup>
              <SidebarGroupContent>
                <React.Suspense>
                  <FolderList />
                </React.Suspense>
              </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </ScrollArea>
      {/* Settings */}
      <SidebarFooter className="bg-white">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> Username
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                 
                  <DropdownMenuItem>
                    <span>Coming soon...</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  )
}
