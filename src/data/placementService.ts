import {
  StudentProfile,
  PlacementDrive,
  Application,
  Notice,
  PlacementStatistics,
  InterviewExperience,
  DrivePhase,
} from '../types';
import { mockStudent } from './mockStudent';
import { mockDrives } from './mockDrives';
import { mockApplications } from './mockApplications';
import { mockNotices } from './mockNotices';
import { mockPlacementStats } from './mockStats';
import { mockExperiences } from './mockExperiences';

// In-memory reactive state
let studentState: StudentProfile = { ...mockStudent };
let drivesState: PlacementDrive[] = [...mockDrives];
let applicationsState: Application[] = [...mockApplications];
let noticesState: Notice[] = [...mockNotices];

export const placementService = {
  // --- Student ---
  async getStudentProfile(): Promise<StudentProfile> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { ...studentState };
  },

  // --- Eligibility Checker ---
  checkEligibility(
    student: StudentProfile,
    drive: PlacementDrive
  ): { isEligible: boolean; reasons: string[]; passedCriteria: string[] } {
    const reasons: string[] = [];
    const passedCriteria: string[] = [];

    // CGPA check
    if (student.cgpa < drive.eligibility.minCgpa) {
      reasons.push(
        `CGPA too low: Your CGPA is ${student.cgpa.toFixed(2)}, required minimum is ${drive.eligibility.minCgpa.toFixed(2)}`
      );
    } else {
      passedCriteria.push(`CGPA: ${student.cgpa.toFixed(2)} >= ${drive.eligibility.minCgpa.toFixed(2)}`);
    }

    // Department check
    if (!drive.eligibility.allowedDepartments.includes(student.department)) {
      reasons.push(`Department not eligible: Only ${drive.eligibility.allowedDepartments.join(', ')} are eligible`);
    } else {
      passedCriteria.push(`Department: ${student.department} is eligible`);
    }

    // Active Backlogs check
    if (student.activeBacklogs > drive.eligibility.maxActiveBacklogs) {
      reasons.push(`Active backlogs: ${student.activeBacklogs} found (Max permitted is ${drive.eligibility.maxActiveBacklogs})`);
    } else {
      passedCriteria.push(`Backlogs: ${student.activeBacklogs} active backlogs (Permitted: ${drive.eligibility.maxActiveBacklogs})`);
    }

    // 10th & 12th Marks check
    if (student.tenthPercentage < drive.eligibility.minTenthMarks) {
      reasons.push(`10th Marks: ${student.tenthPercentage}% < required ${drive.eligibility.minTenthMarks}%`);
    }
    if (student.twelfthPercentage < drive.eligibility.minTwelfthMarks) {
      reasons.push(`12th Marks: ${student.twelfthPercentage}% < required ${drive.eligibility.minTwelfthMarks}%`);
    }

    // CCPD Verification
    if (!student.isVerifiedByCCPD) {
      reasons.push('CCPD Verification: Your student profile has not been verified yet by the placement office');
    }

    return {
      isEligible: reasons.length === 0,
      reasons,
      passedCriteria,
    };
  },

  // --- Drives ---
  async getDrives(filters?: {
    category?: string;
    query?: string;
    onlyEligible?: boolean;
  }): Promise<PlacementDrive[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    let result = [...drivesState];

    if (filters?.query) {
      const q = filters.query.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.companyName.toLowerCase().includes(q) ||
          d.role.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          d.skillsRequired.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filters?.category && filters.category !== 'All') {
      result = result.filter((d) => d.category === filters.category);
    }

    if (filters?.onlyEligible) {
      result = result.filter((d) => this.checkEligibility(studentState, d).isEligible);
    }

    return result;
  },

  async getDriveById(id: string): Promise<PlacementDrive | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return drivesState.find((d) => d.id === id);
  },

  async createDrive(input: {
    companyName: string;
    role: string;
    ctc: string;
    registrationDeadline: string;
    requiredExtraDocs: string[];
  }): Promise<PlacementDrive> {
    const drive: PlacementDrive = {
      id: `DRIVE-2026-${Date.now().toString().slice(-5)}`,
      companyName: input.companyName,
      companyLogo: '',
      accentColor: '#2563EB',
      role: input.role,
      jobType: 'Full Time (FTE)',
      category: 'Software Development',
      location: 'To be announced',
      workMode: 'On-site',
      salary: { ctcDisplay: input.ctc, baseSalary: input.ctc },
      eligibility: {
        minCgpa: 0,
        allowedDepartments: [
          'Computer Science & Engineering',
          'Electronics & Communication Engineering',
          'Electrical & Electronics Engineering',
          'Mechanical Engineering',
          'Civil Engineering',
          'Chemical Engineering',
          'Metallurgical & Materials Engineering',
          'Biotechnology',
        ],
        maxActiveBacklogs: 0,
        minTenthMarks: 0,
        minTwelfthMarks: 0,
        genderEligibility: 'All',
        openForAlreadyPlaced: false,
      },
      description: `Required documents: ${input.requiredExtraDocs.join(', ') || 'None'}`,
      responsibilities: [],
      skillsRequired: [],
      selectionRounds: [],
      registrationDeadline: input.registrationDeadline,
      driveDate: input.registrationDeadline,
      status: 'upcoming',
      appliedCount: 0,
      tags: [],
      adminPhase: 'OA',
      requiredExtraDocs: input.requiredExtraDocs,
    };
    drivesState = [drive, ...drivesState];
    return { ...drive };
  },

  async updateDriveAdmin(
    driveId: string,
    phase: DrivePhase,
    shortlistFileName?: string
  ): Promise<{ success: boolean; message: string }> {
    const drive = drivesState.find((item) => item.id === driveId);
    if (!drive) return { success: false, message: 'Drive not found.' };
    drive.adminPhase = phase;
    if (shortlistFileName) drive.attachmentName = shortlistFileName;
    return {
      success: true,
      message: shortlistFileName
        ? `${phase} phase saved and applicant group filtered from ${shortlistFileName}.`
        : `${phase} phase saved.`,
    };
  },

  async applyToDrive(
    driveId: string
  ): Promise<{ success: boolean; message: string; application?: Application }> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const drive = drivesState.find((d) => d.id === driveId);
    if (!drive) {
      return { success: false, message: 'Drive not found' };
    }

    const alreadyApplied = applicationsState.some((a) => a.driveId === driveId);
    if (alreadyApplied) {
      return { success: false, message: 'You have already applied to this drive' };
    }

    const { isEligible, reasons } = this.checkEligibility(studentState, drive);
    if (!isEligible) {
      return { success: false, message: `Ineligible: ${reasons.join('. ')}` };
    }

    const newApplication: Application = {
      id: `APP-2026-${Date.now().toString().slice(-4)}`,
      driveId: drive.id,
      companyName: drive.companyName,
      companyLogo: drive.companyLogo,
      accentColor: drive.accentColor,
      role: drive.role,
      appliedDate: 'Just now',
      status: 'Application Submitted',
      currentRound: drive.selectionRounds[0]?.name || 'Initial Review',
      salaryDisplay: drive.salary.ctcDisplay,
      canWithdraw: true,
      timeline: drive.selectionRounds.map((r, idx) => ({
        roundId: r.id,
        roundName: r.name,
        status: idx === 0 ? 'in_progress' : 'pending',
        date: r.tentativeDate,
        locationOrLink: r.venueOrPlatform,
      })),
    };

    applicationsState = [newApplication, ...applicationsState];
    drive.appliedCount += 1;

    return {
      success: true,
      message: `Successfully applied to ${drive.companyName} for ${drive.role}!`,
      application: newApplication,
    };
  },

  // --- Applications ---
  async getApplications(statusFilter?: string): Promise<Application[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (!statusFilter || statusFilter === 'All') {
      return [...applicationsState];
    }
    if (statusFilter === 'In-Progress') {
      return applicationsState.filter(
        (a) =>
          a.status === 'Application Submitted' ||
          a.status === 'OA Scheduled' ||
          a.status === 'OA Cleared' ||
          a.status === 'Interview In-Progress' ||
          a.status === 'Shortlisted for Final'
      );
    }
    if (statusFilter === 'Offers') {
      return applicationsState.filter(
        (a) => a.status === 'Offer Extended' || a.status === 'Offer Accepted'
      );
    }
    return applicationsState.filter((a) => a.status === statusFilter);
  },

  async getApplicationById(id: string): Promise<Application | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return applicationsState.find((a) => a.id === id);
  },

  async isApplied(driveId: string): Promise<boolean> {
    return applicationsState.some((a) => a.driveId === driveId);
  },

  // --- Notices ---
  async getNotices(category?: string): Promise<Notice[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    if (!category || category === 'All') {
      return [...noticesState];
    }
    return noticesState.filter((n) => n.category === category);
  },

  async getNoticeById(id: string): Promise<Notice | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const notice = noticesState.find((n) => n.id === id);
    if (notice) {
      notice.isRead = true;
    }
    return notice ? { ...notice } : undefined;
  },

  async getUnreadNoticesCount(): Promise<number> {
    return noticesState.filter((n) => !n.isRead).length;
  },

  // --- Statistics ---
  async getPlacementStats(): Promise<PlacementStatistics> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { ...mockPlacementStats };
  },

  // --- Interview Experiences ---
  async getInterviewExperiences(): Promise<InterviewExperience[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...mockExperiences];
  },

  async getInterviewExperienceById(id: string): Promise<InterviewExperience | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockExperiences.find((e) => e.id === id);
  },
};
