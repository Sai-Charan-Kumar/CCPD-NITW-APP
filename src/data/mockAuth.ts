import { AuthUser } from '../types';

export interface MockAuthAccount {
  email: string;
  password: string;
  user: AuthUser;
}

export const mockAuthAccounts: MockAuthAccount[] = [
  {
    email: 'student@test.com',
    password: '1234',
    user: {
      id: 'STU2022CS089',
      email: 'student@test.com',
      name: 'Rahul Sharma',
      role: 'STUDENT',
      rollNumber: 'CS22B089',
      department: 'Computer Science & Engineering',
      cgpa: 8.84,
      phone: '+91 98765 43210',
    },
  },
  {
    email: 'tnp@test.com',
    password: '1234',
    user: {
      id: 'TNP2026-004',
      email: 'tnp@test.com',
      name: 'Dr. Ananya Rao',
      role: 'TNP',
      designation: 'Training & Placement Officer (TPO)',
      department: 'CCPD Operations Cell',
      phone: '+91 98765 11223',
    },
  },
  {
    email: 'head@test.com',
    password: '1234',
    user: {
      id: 'HEAD-NITW-01',
      email: 'head@test.com',
      name: 'Prof. K. Venkatesh',
      role: 'CCPD_HEAD',
      designation: 'Head of CCPD & Placement Dean',
      department: 'Directorate of Career Development',
      phone: '+91 870 246 2000',
    },
  },
];

export const authenticateMockUser = (
  email: string,
  password: string
): { success: boolean; user?: AuthUser; message?: string } => {
  const normalizedEmail = email.trim().toLowerCase();
  const account = mockAuthAccounts.find(
    (acc) => acc.email.toLowerCase() === normalizedEmail
  );

  if (!account) {
    return { success: false, message: 'No account found with this email' };
  }

  if (account.password !== password) {
    return { success: false, message: 'Invalid password. Hint: default is 1234' };
  }

  return { success: true, user: account.user };
};
