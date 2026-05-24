export interface College {
  _id?: string;
  name: string;
  code?: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: "college";
  address: {
    street?: string;
    taluka?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
  website?: string;
  contactEmail?: string;
  admin: {
    name: string;
    email: string;
    phone: string;
    password: string;
  };
  stats?: {
    totalEvents?: number;
    totalStudents?: number;
  };
}

export interface Event {
  _id?: string;
  title: string;
  slug?: string;
  description?: string;
  college: College;
  role?: "organizer";
  organizer: {
    name: string;
    email: string;
    phone: string;
    password: string;
  };
  startDate?: Date;
  endDate?: Date;
  status?: "draft" | "published" | "ongoing" | "completed" | "cancelled";
  coverImage?: string;
  tags?: string[];
  programsCount?: number;
  meta?: Record<string, any>;
  popularityScore?: number;
  textSummary?: string;
  embeddingId?: string;
}

export interface Program {
  _id?: string;
  event: Event;
  coverImage?: string;
  manager: {
    name: string;
    email: string;
    phone: string;
    password: string;
  };
  title: string;
  slug?: string;
  description?: string;
  programType?:
    | "hackathon"
    | "coding"
    | "quiz"
    | "workshop"
    | "other"
    | "puzzle"
    | "ideathon"
    | "brainstorm";
  rules?: string;
  roundsCount?: number;
  rounds?: {
    name?: string;
    order?: number;
    startTime?: Date;
    endTime?: Date;
    instructions?: string;
    submissionAllowed?: boolean;
    scoringMethod?: "automatic" | "manual" | "hybrid";
    maxScore?: number;
  }[];
  type?: "individual" | "team";
  teamSize?: { min?: number; max?: number };
  maxTeams?: number;
  pricePerTeam?: number;
  status?: "draft" | "published" | "ongoing" | "completed" | "cancelled";
  submissionCriteria?: string;
  prizes?: { title?: string; amount?: number }[];
  registrationStart?: Date;
  registrationEnd?: Date;
  totalParticipants?: number;
  totalRegistrations?: number;
  totalTeams?: number;
  totalSubmissions?: number;
  totalWinners?: number;
  submissionDeadline?: Date;
  judgingCriteria?: string;
  winnersAnnouncedOn?: Date;
  meta?: Record<string, any>;
  popularityScore?: number;
  textSummary?: string;
  embeddingId?: string;
  isRegistered?: boolean;
}

export interface Student {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: "student";
  college?: College | string;
  profileImage?: string;
  profile?: {
    bio?: string;
    skills?: string[];
    interests?: string[];
  };
  badges?: { id: string; awardedAt: Date }[];
  status?: "active" | "inactive" | "banned";
  createdAt?: Date;
  lastSeen?: Date;
  textSummary?: string;
  embeddingId?: string;
}

export interface SideNavItem {
  title: string;
  path: string;
  icon?: JSX.Element;
  submenu?: boolean;
  subMenuItems?: SideNavItem[];
}

export interface Admin {
  id: string;
  email: string;
  role: "Admin";
  name: string;
  profileImage: string;
  isVerified: boolean;
}
