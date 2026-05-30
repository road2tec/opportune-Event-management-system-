import { SideNavItem } from "@/Types";
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconTrophy,
  IconUsersGroup,
  IconCoinRupee,
  IconMessageCircle,
  IconSettings,
  IconBook,
  IconSparkles
} from "@tabler/icons-react";

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Dashboard",
    path: "/organizer/dashboard",
    icon: <IconLayoutDashboard width="22" height="22" />,
  },
  {
    title: "Manage Programs",
    path: "/organizer/manage-programs",
    icon: <IconTrophy width="22" height="22" />,
  },
  {
    title: "Planning Guides",
    path: "/organizer/guides",
    icon: <IconBook width="22" height="22" />,
  },
  {
    title: "Participants",
    path: "/organizer/participants",
    icon: <IconUsersGroup width="22" height="22" />,
  },
  {
    title: "Revenue & Analytics",
    path: "/organizer/revenue-analytics",
    icon: <IconCoinRupee width="22" height="22" />,
  },
  {
    title: "Feedback & Reviews",
    path: "/organizer/feedback",
    icon: <IconMessageCircle width="22" height="22" />,
  },
  {
    title: "Smart Scheduling AI",
    path: "/organizer/scheduling",
    icon: <IconSparkles width="22" height="22" />,
  },
  {
    title: "Settings",
    path: "/organizer/settings",
    icon: <IconSettings width="22" height="22" />,
  },
];
