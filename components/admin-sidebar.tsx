'use client'
import * as React from "react"
import { usePathname } from "next/navigation"
import { BookOpen, Users, Calendar, Command, UserCog, CalendarDays, UsersRound, Briefcase, UserPlus, Trophy, ChevronDown, ChevronRight } from "lucide-react"
import { PERMISSIONS, hasPermission } from "@/lib/roles-utils"
import Image from "next/image"
import Link from "next/link"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter
} from "@/components/ui/sidebar"

import { NavUser } from "@/components/nav-user"
import { getUser } from "@/lib/utils"

const user = getUser() || {
    firstname: "You",
    lastname: "",
    email: "contact@programisto.fr",
    avatar: "/avatar.png",
}

const navigationGroups = [
    {
        title: "Admin dashboard",
        url: "/admin",
        icon: Command,
        permissions: undefined,
    },
    {
        title: "Sourcing",
        icon: UserPlus,
        items: [
            {
                title: "Pipeline Candidatures",
                url: "/admin/job-applications",
                icon: Users,
                permissions: undefined,
            },
            {
                title: "Gestion des offres d'emploi",
                url: "/admin/jobs",
                icon: Briefcase,
                permissions: undefined,
            },
            {
                title: "Gestion des candidats",
                url: "/admin/candidates",
                icon: Users,
                permissions: undefined,
            },
            {
                title: "Gestion des cooptations",
                url: "/admin/cooptations",
                icon: Users,
                permissions: undefined,
            }
        ]
    },
    {
        title: "CRM",
        icon: Users,
        items: [
            {
                title: "Gestion des contacts",
                url: "/admin/contacts",
                icon: Users,
                permissions: undefined,
            }
        ]
    },
    {
        title: "RH",
        icon: Briefcase,
        items: [
            {
                title: "Gestion des absences",
                url: "/admin/leaves",
                icon: Calendar,
                permissions: undefined,
            }
        ]
    },
    {
        title: "Utilisateurs",
        icon: Users,
        items: [
            {
                title: "Gestion des utilisateurs",
                url: "/admin/users",
                icon: Users,
                permissions: undefined,
            },
            {
                title: "Gestion des groupes",
                url: "/admin/groups",
                icon: UsersRound,
                permissions: undefined,
            },
            {
                title: "Gestion des rôles",
                url: "/admin/roles",
                icon: UserCog,
                permissions: undefined,
            }
        ]
    },
    {
        title: "Gamification",
        icon: Trophy,
        items: [
            {
                title: "Gestion des événements",
                url: "/admin/events",
                icon: CalendarDays,
                permissions: undefined,
            },
            {
                title: "Gestion des quêtes",
                url: "/admin/quests",
                icon: BookOpen,
                permissions: [PERMISSIONS.ADMIN_QUESTMANAGEMENT],
            },
            {
                title: "Gestion des badges",
                url: "/admin/badges",
                icon: BookOpen,
                permissions: [PERMISSIONS.ADMIN_QUESTMANAGEMENT],
            }
        ]
    }
]

const userAccess = {
    title: "Dashboard",
    url: "/dashboard",
    icon: Command,
    permissions: undefined,
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const [activeItem, setActiveItem] = React.useState(() => {
        return navigationGroups.flatMap(group =>
            group.items ? group.items : [{ ...group }]
        ).find(item => {
            if (item.url === "/admin" && pathname === "/admin") {
                return true;
            }
            return pathname.startsWith(item.url) && item.url !== "/admin";
        }) || navigationGroups[0]
    })

    // État d'ouverture/fermeture des groupes
    const [openGroups, setOpenGroups] = React.useState(() => {
        // Par défaut, tous les groupes sont ouverts
        const state: Record<string, boolean> = {}
        navigationGroups.forEach(group => {
            if (group.items) state[group.title] = true
        })
        return state
    })

    const toggleGroup = (title: string) => {
        setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }))
    }

    React.useEffect(() => {
        const currentItem = navigationGroups.flatMap(group =>
            group.items ? group.items : [{ ...group }]
        ).find(item => {
            if (item.url === "/admin" && pathname === "/admin") {
                return true;
            }
            return pathname.startsWith(item.url) && item.url !== "/admin";
        })
        if (currentItem) {
            setActiveItem(currentItem)
        }
    }, [pathname])

    const renderMenuItem = (item: any, isGroupItem = false) => {
        if (item.permissions && !hasPermission(user, item.permissions[0])) {
            return null;
        }

        return (
            <SidebarMenuItem key={item.title} className="w-full max-w-full p-0 m-0">
                <a href={item.url} className="block w-full max-w-full">
                    <SidebarMenuButton
                        tooltip={{
                            children: item.title,
                            hidden: false,
                        }}
                        onClick={() => {
                            setActiveItem(item)
                        }}
                        isActive={activeItem.title === item.title}
                        className={`w-full max-w-full px-2 md:px-1.5 data-[active=true]:bg-[rgb(251,191,36)] data-[active=true]:text-white ${isGroupItem ? 'ml-0' : ''}`}
                    >
                        <item.icon className="data-[active=true]:text-white" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </SidebarMenuButton>
                </a>
            </SidebarMenuItem>
        )
    }

    return (
        <Sidebar
            collapsible="offcanvas"
            {...props}
            className="overflow-x-hidden"
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                            <Link href="/admin">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                                    <Image src="/51.png" width="100" height="100" alt="Logo" className="h-8 w-8" />
                                </div>
                                <span className="hidden md:block text-lg font-bold">Administration</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="overflow-x-hidden w-full max-w-full">
                {navigationGroups.map((group) => (
                    <SidebarGroup key={group.title} className="w-full max-w-full">
                        <SidebarGroupContent className="px-1.5 md:px-0 w-full max-w-full">
                            <SidebarMenu>
                                {!group.items ? (
                                    renderMenuItem(group)
                                ) : (
                                    <>
                                        <SidebarMenuItem className="w-full max-w-full p-0 m-0">
                                            <SidebarMenuButton
                                                tooltip={{
                                                    children: group.title,
                                                    hidden: false,
                                                }}
                                                className="w-full max-w-full px-2 md:px-1.5 font-semibold"
                                                onClick={() => toggleGroup(group.title)}
                                            >
                                                <group.icon />
                                                <span className="group-data-[collapsible=icon]:hidden flex items-center gap-2">
                                                    {group.title}
                                                    <span className="ml-auto transition-transform duration-200" style={{ transform: openGroups[group.title] ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                                                        <ChevronDown size={16} />
                                                    </span>
                                                </span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <div className={`group-data-[collapsible=icon]:hidden transition-all duration-200 ${openGroups[group.title] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                            {group.items.map(item => renderMenuItem(item, true))}
                                        </div>
                                    </>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarGroup>
                    <SidebarGroupContent className="px-1.5 md:px-0">
                        <SidebarMenu>
                            {(!userAccess.permissions || hasPermission(user, userAccess.permissions[0])) && (
                                <SidebarMenuItem>
                                    <a href={userAccess.url} target="_blank" rel="noopener noreferrer">
                                        <SidebarMenuButton
                                            tooltip={{
                                                children: userAccess.title,
                                                hidden: false,
                                            }}
                                            className="px-2.5 md:px-2"
                                        >
                                            <userAccess.icon />
                                            <span>{userAccess.title}</span>
                                        </SidebarMenuButton>
                                    </a>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    )
} 