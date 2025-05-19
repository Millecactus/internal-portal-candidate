'use client'
import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Command, Bolt, CircleParking, Star, Users } from "lucide-react"
import { PERMISSIONS, hasPermission } from "@/lib/roles-utils"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"

import { getUser } from "@/lib/utils"

const user = getUser() || {
  firstname: "You",
  lastname: "",
  email: "contact@programisto.fr",
  avatar: "/avatar.png",
}
const data = {
  user: user,
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Bolt,
      isActive: true,
      permissions: undefined,
    },
    {
      title: "Presence",
      url: "/presence",
      icon: CircleParking,
      isActive: false,
      permissions: undefined,
    },
    {
      title: "Levelling",
      url: "/levelling",
      icon: Star,
      isActive: false,
      permissions: undefined,
    },
    {
      title: "Cooptation",
      url: "/cooptation",
      icon: Users,
      isActive: false,
      permissions: undefined,
    }/*,
    {
      title: "Absences",
      url: "/leaves",
      icon: Calendar,
      isActive: false,
    }*/
  ],
  admin: {
    title: "Admin",
    url: "/admin",
    icon: Command,
    isActive: false,
    permissions: [PERMISSIONS.ADMIN_ACCESS],
  },
  mails: [
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [activeItem, setActiveItem] = React.useState(() => {
    return data.navMain.find(item => pathname.startsWith(item.url)) || data.navMain[0]
  })

  React.useEffect(() => {
    const currentItem = data.navMain.find(item => pathname.startsWith(item.url))
    if (currentItem) {
      setActiveItem(currentItem)
    }
  }, [pathname])

  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  <Command className="size-4" />
                  <Image src="/50.png" width="100" height="100" alt="Logo" className="h-8 w-8" />
                </div>
                <span className="hidden md:block text-lg font-bold">My Programisto</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {(!item.permissions || hasPermission(data.user, item.permissions[0])) && (
                    <a href={item.url}>
                      <SidebarMenuButton
                        tooltip={{
                          children: item.title,
                          hidden: false,
                        }}
                        onClick={() => {
                          setActiveItem(item)
                        }}
                        isActive={activeItem.title === item.title}
                        className="px-2.5 md:px-2 data-[active=true]:bg-[rgb(251,191,36)] data-[active=true]:text-white"
                      >
                        <item.icon className="data-[active=true]:text-white" />
                        <span className="data-[active=true]:text-white">{item.title}</span>
                      </SidebarMenuButton>
                    </a>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              {(!data.admin.permissions || hasPermission(data.user, data.admin.permissions[0])) && (
                <SidebarMenuItem>
                  <a href={data.admin.url} target="_blank" rel="noopener noreferrer">
                    <SidebarMenuButton
                      tooltip={{
                        children: data.admin.title,
                        hidden: false,
                      }}
                      className="px-2.5 md:px-2"
                    >
                      <data.admin.icon />
                      <span>{data.admin.title}</span>
                    </SidebarMenuButton>
                  </a>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
