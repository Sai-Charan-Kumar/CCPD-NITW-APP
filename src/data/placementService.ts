import { axiosClient } from '../api/axiosClient';
import {
  Application,
  Department,
  DrivePhase,
  InterviewExperience,
  Notice,
  PlacementDrive,
  PlacementStatistics,
  StudentInterviewRecord,
  StudentProfile,
} from '../types';

type DriveFilters = { category?: string; query?: string; onlyEligible?: boolean };

export const placementService = {
  async getStudentProfile(): Promise<StudentProfile> {
    const response = await axiosClient.get<StudentProfile>('/users/profile');
    return response.data;
  },

  updateStudentIdentity(_input: Pick<StudentProfile, 'name' | 'rollNumber' | 'email' | 'department' | 'cgpa'>): void {
    // Identity is owned by the authenticated backend user and updated through account APIs.
  },

  checkEligibility(student: StudentProfile, drive: PlacementDrive) {
    const reasons: string[] = [];
    const passedCriteria: string[] = [];
    if (student.cgpa < drive.eligibility.minCgpa) reasons.push(`CGPA too low: required minimum is ${drive.eligibility.minCgpa.toFixed(2)}`);
    else passedCriteria.push(`CGPA: ${student.cgpa.toFixed(2)} meets the minimum`);
    if (!drive.eligibility.allowedDepartments.includes(student.department)) reasons.push('Department not eligible');
    else passedCriteria.push(`Department: ${student.department} is eligible`);
    if (student.activeBacklogs > drive.eligibility.maxActiveBacklogs) reasons.push(`Active backlogs exceed the maximum of ${drive.eligibility.maxActiveBacklogs}`);
    else passedCriteria.push(`Backlogs: ${student.activeBacklogs} permitted`);
    if (student.tenthPercentage < drive.eligibility.minTenthMarks) reasons.push('10th percentage is below the requirement');
    if (student.twelfthPercentage < drive.eligibility.minTwelfthMarks) reasons.push('12th percentage is below the requirement');
    if (student.placementStatus === 'placed' && !drive.eligibility.openForAlreadyPlaced) reasons.push('Already-placed students cannot apply');
    return { isEligible: reasons.length === 0, reasons, passedCriteria };
  },

  async getDrives(filters?: DriveFilters): Promise<PlacementDrive[]> {
    const response = await axiosClient.get<PlacementDrive[]>('/drives', { params: filters });
    return response.data;
  },

  async getDriveById(id: string): Promise<PlacementDrive | undefined> {
    try {
      const response = await axiosClient.get<PlacementDrive>(`/drives/${id}`);
      return response.data;
    } catch {
      return undefined;
    }
  },

  async createDrive(input: {
    companyName: string;
    role: string;
    ctc: string;
    registrationDeadline: string;
    description: string;
    requiredExtraDocs: string[];
  }): Promise<PlacementDrive> {
    const response = await axiosClient.post<PlacementDrive>('/drives', input);
    return response.data;
  },

  async updateDriveAdmin(driveId: string, phase: DrivePhase, shortlistFileName?: string) {
    const response = await axiosClient.put<{ success: boolean; message: string }>(`/drives/${driveId}/phase`, {
      phase,
      shortlistFileName,
    });
    return response.data;
  },

  async applyToDrive(driveId: string): Promise<{ success: boolean; message: string; application?: Application }> {
    const response = await axiosClient.post('/applications/apply', { driveId });
    return response.data;
  },

  async getApplications(statusFilter?: string): Promise<Application[]> {
    const response = await axiosClient.get<Application[]>('/applications/my-applications');
    if (!statusFilter || statusFilter === 'All') return response.data;
    if (statusFilter === 'Offers') return response.data.filter((a) => a.status === 'Offer Extended' || a.status === 'Offer Accepted');
    if (statusFilter === 'In-Progress') return response.data.filter((a) => !['Offer Extended', 'Offer Accepted', 'Not Shortlisted'].includes(a.status));
    return response.data.filter((a) => a.status === statusFilter);
  },

  async getApplicationById(id: string): Promise<Application | undefined> {
    const applications = await this.getApplications();
    return applications.find((application) => application.id === id);
  },

  async isApplied(driveId: string): Promise<boolean> {
    const applications = await this.getApplications();
    return applications.some((application) => application.driveId === driveId);
  },

  async getNotices(category?: string): Promise<Notice[]> {
    const response = await axiosClient.get<Notice[]>('/notices');
    return !category || category === 'All' ? response.data : response.data.filter((notice) => notice.category === category);
  },

  async getNoticeById(id: string): Promise<Notice | undefined> {
    const notices = await this.getNotices();
    return notices.find((notice) => notice.id === id);
  },

  async getUnreadNoticesCount(): Promise<number> {
    const notices = await this.getNotices();
    return notices.filter((notice) => !notice.isRead).length;
  },

  async getPlacementStats(): Promise<PlacementStatistics> {
    const response = await axiosClient.get<PlacementStatistics>('/stats');
    return response.data;
  },

  async getInterviewExperiences(): Promise<InterviewExperience[]> {
    return [];
  },

  async getInterviewExperienceById(_id: string): Promise<InterviewExperience | undefined> {
    return undefined;
  },

  async getStudentInterviewHistory(studentId: string): Promise<StudentInterviewRecord[]> {
    const applications = await this.getApplications();
    return applications.map((application) => ({
      id: `APPLICATION-INTERVIEW-${application.id}`,
      studentId,
      companyName: application.companyName,
      role: application.role,
      interviewDate: application.nextEventDate || application.appliedDate,
      outcome: application.status === 'Offer Extended' || application.status === 'Offer Accepted'
        ? 'Offered'
        : application.status === 'Not Shortlisted' ? 'Not Selected' : 'In Progress',
      notes: `Tracked from ${application.currentRound}.`,
    }));
  },
};

export type { Department };
