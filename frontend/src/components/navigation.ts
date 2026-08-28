import { Bell, CirclePlus, CircleUser, Layers, LayoutDashboard, Logs, MessageCircle, ShieldCheck, UserPlus, Users } from "lucide-react"
import type{ Role } from "../utils/constant";
 import { PERMISSIONS } from "../utils/constant";

interface NavItem {
    label:string,
    icon:React.ElementType;
    href?:string,
    onClick?:()=>void
    permission:string | null
    hideFrom?:Role
}

export const navigation:NavItem[]= [
    {
        label:"Dashboard",
        icon:LayoutDashboard,
        href:"/dashboard",
        permission:null
    },
    {
        label:"Admin Dashboard",
        icon:ShieldCheck,
        href:"/admin-dashboard",
        permission:PERMISSIONS.VIEW_ADMIN_DASHBOARD
    },
    {
        label:"Audit Logs",
        icon:Logs,
        href:"/audit",
        permission:PERMISSIONS.VIEW_ANALYTICS

    },
    {
        label:"Create Blog",
        icon:CirclePlus,
        href:"/create-blog",
        permission:PERMISSIONS.CREATE_BLOG,
        hideFrom:"ADMIN"


    },
    
   
    {
        label:"My Blogs",
        icon:Layers,
        href:"/view-blogs",
        permission:PERMISSIONS.VIEW_BLOG,
        hideFrom:"ADMIN"
    },
     {
        label:"Users",
        icon:Users,
        href:"/users",
        permission:PERMISSIONS.VIEW_USERS
        
    },
    {
        label:"Profile",
        icon:CircleUser,
        href:"/profile",
        permission:PERMISSIONS.VIEW_PROFILE
    },
   
   
    
    
] 