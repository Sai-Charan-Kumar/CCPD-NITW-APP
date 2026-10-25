export type UserRole = 'STUDENT' | 'TNP' | 'CCPD_HEAD';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  rollNumber?: string;
  department?: string;
  cgpa?: number;
  designation?: string;
  phone?: string;
  avatarUrl?: string;
}

export type Department =
  | 'Computer Science & Engineering'
  | 'Electronics & Communication Engineering'
  | 'Electrical & Electronics Engineering'
  | 'Mechanical Engineering'
  | 'Civil Engineering'
  | 'Chemical Engineering'
  | 'Metallurgical & Materials Engineering'
  | 'Biotechnology';

export type PlacementStatus = 'unplaced' | 'placed';

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  registrationNumber: string;
  email: string;
  phone: string;
  department: Department;
  degree: 'B.Tech' | 'M.Tech' | 'MCA';
  batch: string;
  cgpa: number;
  activeBacklogs: number;
  placementStatus: PlacementStatus;
  currentOffers: {
    companyName: string;
    role: string;
    ctc: string;
  }[];
  resume: {
    fileName: string;
    updatedAt: string;
    verified: boolean;
    url: string;
  };
  skills: string[];
  tenthPercentage: number;
  twelfthPercentage: number;
  avatarUrl?: string;
  isVerifiedByCCPD: boolean;
}

export type DriveCategory =
  | 'Software Development'
  | 'Data & AI'
  | 'Core Engineering'
  | 'Finance & Quant'
  | 'Product & Analytics'
  | 'Consulting';

export type JobType = 'Full Time (FTE)' | '6-Month Intern + FTE' | 'Summer Internship';

export type DriveStatus = 'upcoming' | 'ongoing' | 'deadline_near' | 'closed';

export interface SalaryBreakdown {
  ctcDisplay: string; // e.g. "44.5 LPA"
  baseSalary: string; // e.g. "22.0 LPA"
  joiningBonus?: string; // e.g. "4.0 Lakhs"
  performanceBonus?: string; // e.g. "3.5 Lakhs"
  stocksOrEsops?: string; // e.g. "15.0 Lakhs (vested over 4 yrs)"
  stipendDuringInternship?: string; // e.g. "1,25,000 / month"
}

export interface EligibilityCriteria {
  minCgpa: number;
  allowedDepartments: Department[];
  maxActiveBacklogs: number;
  minTenthMarks: number;
  minTwelfthMarks: number;
  genderEligibility: 'All' | 'Female Only';
  openForAlreadyPlaced: boolean;
}

export interface SelectionRound {
  id: string;
  roundNumber: number;
  name: string;
  type: 'Online Assessment' | 'Technical Interview' | 'System Design' | 'HR Interview' | 'Group Discussion';
  tentativeDate: string;
  venueOrPlatform: string;
  description: string;
}

export interface Drive {
  id: string;
  companyName: string;
  requiredExtraDocs: string[];
  companyLogo: string;
  accentColor: string;
  role: string;
  jobType: JobType;
  category: DriveCategory;
  location: string;
  workMode: 'On-site' | 'Hybrid' | 'Remote';
  salary: SalaryBreakdown;
  eligibility: EligibilityCriteria;
  description: string;
  responsibilities: string[];
  skillsRequired: string[];
  selectionRounds: SelectionRound[];
  registrationDeadline: string; // ISO date string
  driveDate: string;
  status: DriveStatus;
  appliedCount: number;
  tags: string[];
  attachmentName?: string;
  attachmentSize?: string;
  adminPhase?: DrivePhase;
}

export type DrivePhase =
  | 'OA'
  | 'Interview'
  | 'Final Selects';

export type PlacementDrive = Drive;

export interface PlacementGroup {
  id: string;
  companyName: string;
  currentPhase: DrivePhase;
  memberCount: number;
  role: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderName: string;
  message: string;
  sentAt: string;
}

export type ApplicationStageStatus = 'pending' | 'in_progress' | 'passed' | 'rejected' | 'scheduled';

export interface ApplicationTimelineItem {
  roundId: string;
  roundName: string;
  status: ApplicationStageStatus;
  date: string;
  time?: string;
  locationOrLink?: string;
  feedback?: string;
  instructions?: string;
}

export type OverallApplicationStatus =
  | 'Application Submitted'
  | 'OA Scheduled'
  | 'OA Cleared'
  | 'Interview In-Progress'
  | 'Shortlisted for Final'
  | 'Offer Extended'
  | 'Offer Accepted'
  | 'Not Shortlisted';

export interface Application {
  id: string;
  driveId: string;
  companyName: string;
  companyLogo: string;
  accentColor: string;
  role: string;
  appliedDate: string;
  status: OverallApplicationStatus;
  currentRound: string;
  nextEventDate?: string;
  salaryDisplay: string;
  timeline: ApplicationTimelineItem[];
  canWithdraw: boolean;
}

export type NoticePriority = 'high' | 'normal' | 'low';

export type NoticeCategory =
  | 'Urgent Alert'
  | 'Shortlist Published'
  | 'Schedule Update'
  | 'PPT & Orientation'
  | 'Policy & Guidelines'
  | 'Final Results';

export interface Notice {
  id: string;
  title: string;
  category: NoticeCategory;
  priority: NoticePriority;
  publishedAt: string;
  author: string;
  authorRole: string;
  summary: string;
  body: string;
  targetBranches: string[];
  isPinned: boolean;
  isRead: boolean;
  attachments?: {
    name: string;
    size: string;
    type: 'pdf' | 'doc' | 'sheet';
    downloadUrl: string;
  }[];
}

export interface InterviewExperience {
  id: string;
  companyName: string;
  role: string;
  companyLogo: string;
  studentName: string;
  batch: string;
  department: Department;
  verdict: 'Selected' | 'Offered' | 'Reached Final Round';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cgpa: number;
  packageOffered: string;
  rounds: {
    title: string;
    duration: string;
    questionsAsked: string[];
    tipsAndStrategy: string;
  }[];
  overallAdvice: string;
  postedDate: string;
}

export interface StudentInterviewRecord {
  id: string;
  studentId: string;
  companyName: string;
  role: string;
  interviewDate: string;
  outcome: 'Selected' | 'Offered' | 'Reached Final Round' | 'Not Selected' | 'In Progress';
  notes: string;
}

export interface PlacementStatistics {
  academicYear: string;
  totalStudentsEligible: number;
  totalOffers: number;
  highestPackage: string;
  averagePackage: string;
  medianPackage: string;
  placementPercentage: number;
  topRecruiters: {
    name: string;
    offersCount: number;
    highestPackage: string;
  }[];
  branchWiseStats: {
    branch: string;
    percentage: number;
    averagePackage: string;
    highestPackage: string;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'drive' | 'shortlist' | 'interview' | 'general';
  isRead: boolean;
  relatedId?: string;
}

// Navigation Param Lists
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  JobDetail: { driveId: string };
  ApplicationDetail: { applicationId: string };
  NoticeDetail: { noticeId: string };
  InterviewExperiences: undefined;
  InterviewExperienceDetail: { experienceId: string };
  PlacementStats: undefined;
  Notifications: undefined;
  TnpDriveManagement: undefined;
  CreateDrive: undefined;
  DriveAdmin: { driveId: string };
  GroupChat: { groupId: string; companyName: string };
};

export type BottomTabParamList = {
  Home: undefined;
  Groups: undefined;
  Profile: undefined;
  Drives: { categoryFilter?: string };
  Applications: undefined;
  Notices: undefined;
};

export type StudentBottomTabParamList = BottomTabParamList;

export type HeadTabParamList = {
  HeadDashboard: undefined;
  Drives: { categoryFilter?: string };
  PlacementStats: undefined;
  Profile: undefined;
};
