import { SideNavItem } from "@/Types";
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconTrophy,
  IconUsersGroup,
  IconCoinRupee,
  IconMessageCircle,
  IconSettings,
  IconSparkles
} from "@tabler/icons-react";

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Dashboard",
    path: "/college/dashboard",
    icon: <IconLayoutDashboard width="22" height="22" />,
  },
  {
    title: "Manage Events",
    path: "/college/manage-events",
    icon: <IconCalendarEvent width="22" height="22" />,
  },
  {
    title: "Manage Programs",
    path: "/college/manage-programs",
    icon: <IconTrophy width="22" height="22" />,
  },
  {
    title: "Participants",
    path: "/college/participants",
    icon: <IconUsersGroup width="22" height="22" />,
  },
  {
    title: "Revenue & Analytics",
    path: "/college/revenue-analytics",
    icon: <IconCoinRupee width="22" height="22" />,
  },
  {
    title: "Feedback & Reviews",
    path: "/college/feedback",
    icon: <IconMessageCircle width="22" height="22" />,
  },
  {
    title: "Smart Scheduling AI",
    path: "/college/scheduling",
    icon: <IconSparkles width="22" height="22" />,
  },
  {
    title: "Settings",
    path: "/college/settings",
    icon: <IconSettings width="22" height="22" />,
  },
];
