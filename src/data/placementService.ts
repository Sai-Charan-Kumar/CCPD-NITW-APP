import { axiosClient } from '../api/axiosClient';
import {
  Application,
  Department,
  DrivePhase,
  Notice,
  PlacementDrive,
  PlacementStatistics,
  RegisteredStudent,
  StudentProfile,
  NotificationItem,
  GroupMessage,
  PlacementGroup,
} from '../types';

type DriveFilters = { category?: string; query?: string; onlyEligible?: boolean };
export type CoordinatorCandidate = {
  id: string;
  name: string;
  email: string;
  role: string;
  rollNumber: string;
  department: string;
  batch: string;
};

export const placementService = {
  async getStudentProfile(): Promise<StudentProfile> {
    const response = await axiosClient.get<StudentProfile>('/users/profile');
    return response.data;
  },

  async updateStudentProfile(input: Partial<Pick<StudentProfile,
    'name' | 'email' | 'phone' | 'rollNumber' | 'registrationNumber' | 'department'
    | 'degree' | 'batch' | 'cgpa' | 'activeBacklogs' | 'tenthPercentage'
    | 'twelfthPercentage' | 'skills'
  >>): Promise<StudentProfile> {
    const response = await axiosClient.put<StudentProfile>('/users/profile', input);
    return response.data;
  },

  async searchCoordinatorCandidates(query: string): Promise<CoordinatorCandidate[]> {
    const response = await axiosClient.get<CoordinatorCandidate[]>('/users/coordinator-candidates', {
      params: { query },
    });
    return response.data;
  },

  async getCoordinators(): Promise<CoordinatorCandidate[]> {
    const response = await axiosClient.get<CoordinatorCandidate[]>('/users/coordinators');
    return response.data;
  },

  async promoteStudentToCoordinator(id: string): Promise<CoordinatorCandidate> {
    const response = await axiosClient.patch<{ user: CoordinatorCandidate }>(
      `/users/coordinator-candidates/${id}/promote`
    );
    return response.data.user;
  },

  async demoteCoordinator(id: string): Promise<CoordinatorCandidate> {
    const response = await axiosClient.patch<{ user: CoordinatorCandidate }>(`/users/coordinators/${id}/demote`);
    return response.data.user;
  },

  updateStudentIdentity(_input: Pick<StudentProfile, 'name' | 'rollNumber' | 'email' | 'department' | 'cgpa'>): void {
    // Identity is owned by the authenticated backend user and updated through account APIs.
  },

  checkEligibility(student: StudentProfile, drive: PlacementDrive) {
    const reasons: string[] = [];
    const passedCriteria: string[] = [];
    if (student.cgpa < drive.eligibility.minCgpa) reasons.push(`CGPA too low: required minimum is ${drive.eligibility.minCgpa.toFixed(2)}`);
    else passedCriteria.push(`CGPA: ${student.cgpa.toFixed(2)} meets the minimum`);
    if (drive.eligibility.allowedDepartments.length > 0 && !drive.eligibility.allowedDepartments.includes(student.department)) {
      reasons.push('Department not eligible');
    }
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
    registrationDeadlineDate?: string;
    description: string;
    requiredExtraDocs: string[];
    eligibility: {
      minCgpa: number;
      allowedDepartments: Department[];
    };
  }): Promise<PlacementDrive> {
    const response = await axiosClient.post<PlacementDrive>('/drives', input);
    return response.data;
  },

  async updateDrive(driveId: string, input: {
    companyName: string;
    role: string;
    ctc: string;
    registrationDeadline: string;
    registrationDeadlineDate?: string;
    description: string;
    requiredExtraDocs: string[];
    eligibility: {
      minCgpa: number;
      allowedDepartments: Department[];
    };
  }): Promise<PlacementDrive> {
    const response = await axiosClient.put<PlacementDrive>(`/drives/${driveId}`, input);
    return response.data;
  },

  async deleteDrive(driveId: string): Promise<{ message: string }> {
    const response = await axiosClient.delete<{ message: string }>(`/drives/${driveId}`);
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

  async getNoticeRecipientDrives(): Promise<{ id: string; companyName: string; role: string; registrationDeadline: string }[]> {
    const response = await axiosClient.get('/notices/recipient-drives');
    return response.data;
  },

  async sendNotice(input: {
    title: string;
    content: string;
    recipientType: 'all_students' | 'company_group';
    driveId?: string;
  }): Promise<{ targeted: number; delivered: number; failed: number; message: string }> {
    const response = await axiosClient.post('/notices', input);
    return response.data;
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

  async getRegisteredStudents(): Promise<RegisteredStudent[]> {
    const response = await axiosClient.get<RegisteredStudent[]>('/users/registered-students');
    return response.data;
  },

  async updateTnpAccess(studentId: string, enabled: boolean): Promise<void> {
    await axiosClient.put(`/users/${studentId}/tnp-access`, { enabled });
  },

  async publishShortlist(driveId: string, identifiers: string[], csv?: string, notes?: string) {
    const response = await axiosClient.post<{ success: boolean; shortlistedCount: number; rejectedCount: number }>(
      `/applications/drive/${driveId}/shortlist`, { identifiers, csv, notes }
    );
    return response.data;
  },

  async getNotifications(): Promise<NotificationItem[]> {
    const response = await axiosClient.get<NotificationItem[]>('/notifications');
    return response.data;
  },

  async markNotificationRead(id: string): Promise<void> {
    await axiosClient.put(`/notifications/${id}/read`);
  },

  async markAllNotificationsRead(): Promise<void> {
    await axiosClient.put('/notifications/read-all');
  },

  async getGroupMessages(groupId: string): Promise<GroupMessage[]> {
    const response = await axiosClient.get<GroupMessage[]>(`/messages/${encodeURIComponent(groupId)}`);
    return response.data;
  },

  async getMyGroups(): Promise<PlacementGroup[]> {
    const response = await axiosClient.get<PlacementGroup[]>('/groups/mine');
    return response.data;
  },

  async sendGroupMessage(groupId: string, message: string): Promise<GroupMessage> {
    const response = await axiosClient.post<GroupMessage>(
      `/messages/${encodeURIComponent(groupId)}`, { message }
    );
    return response.data;
  },

};

export type { Department };
