import { Notice } from '../types';

export const mockNotices: Notice[] = [
  {
    id: 'NOT-2026-042',
    title: 'Urgent: Microsoft Technical Round 2 Shortlist & Interview Schedule Released',
    category: 'Shortlist Published',
    priority: 'high',
    publishedAt: 'Today, 10:30 AM',
    author: 'Prof. K. Venkatesh',
    authorRole: 'Faculty In-Charge, CCPD NITW',
    summary:
      'Total 34 students have been shortlisted for Round 2 following the technical interview on 18th Oct. Interviews will commence tomorrow at 10:00 AM.',
    body: `Dear 2026 Batch Students,

The recruitment team from Microsoft India Development Center (IDC) has finalized the shortlist for Technical Round 2 (Design & Core) and the Director Round.

All shortlisted candidates must:
1. Be in formal attire and report to the virtual lobby 15 minutes prior to their assigned slot.
2. Keep their NITW Student ID Card and Government Photo ID (Aadhaar / Passport) ready.
3. Ensure stable broadband connection with webcam active throughout.

Check the attached PDF for your individual interview slot timings and Teams meeting room links. For any immediate clash or technical support, contact your student placement coordinator immediately.`,
    targetBranches: ['CSE', 'ECE', 'EEE'],
    isPinned: true,
    isRead: false,
    attachments: [
      {
        name: 'Microsoft_Round_2_Shortlist_Slots.pdf',
        size: '1.4 MB',
        type: 'pdf',
        downloadUrl: 'https://ccpd.nitw.ac.in/notices/docs/ms_r2_shortlist.pdf',
      },
      {
        name: 'Virtual_Interview_Code_of_Conduct.pdf',
        size: '420 KB',
        type: 'pdf',
        downloadUrl: 'https://ccpd.nitw.ac.in/notices/docs/ccpd_conduct.pdf',
      },
    ],
  },
  {
    id: 'NOT-2026-041',
    title: 'Pre-Placement Talk (PPT): Texas Instruments at Dr. B.R. Ambedkar Auditorium',
    category: 'PPT & Orientation',
    priority: 'normal',
    publishedAt: 'Yesterday, 04:15 PM',
    author: 'Placement Executive Office',
    authorRole: 'CCPD Operations Team',
    summary:
      'Mandatory PPT for all registered candidates of Texas Instruments on 26th Oct at 04:30 PM. Attendance will be monitored via biometric scanners.',
    body: `Notice for all students registered for Texas Instruments recruitment drive (Analog & Embedded Systems):

The Leadership and Technical Architecture team of Texas Instruments India will conduct their Pre-Placement Talk on 26th October at 04:30 PM in the Dr. B.R. Ambedkar Central Auditorium.

Key Agenda:
- Introduction to TI Silicon & Embedded Systems Division
- Deep-dive into technical assessment syllabus and interview expectations
- Q&A session with alumni currently working at TI Bangalore

Attendance is strictly mandatory for registered students. Non-attendance will lead to de-registration from the ongoing drive as per CCPD Placement Policy Clause 4.2.`,
    targetBranches: ['ECE', 'EEE'],
    isPinned: true,
    isRead: true,
    attachments: [
      {
        name: 'TI_PPT_Brochure_2026.pdf',
        size: '3.8 MB',
        type: 'pdf',
        downloadUrl: 'https://ccpd.nitw.ac.in/notices/docs/ti_ppt.pdf',
      },
    ],
  },
  {
    id: 'NOT-2026-040',
    title: 'Google University Grad: Online Assessment Link & Proctoring Guidelines',
    category: 'Schedule Update',
    priority: 'high',
    publishedAt: '15 Oct 2026, 02:00 PM',
    author: 'Student Placement Committee',
    authorRole: 'CCPD Lead Coordinator',
    summary:
      'The assessment will be hosted on HackerEarth on 24th Oct from 06:00 PM to 07:30 PM. Please check system compatibility.',
    body: `Registered candidates for Google SDE campus drive:

Your personalized assessment invitations from HackerEarth will be dispatched directly to your official Institute email (@student.nitw.ac.in) by 23rd Oct evening.

Assessment Format:
- Duration: 90 Minutes
- Questions: 3 Algorithmic Coding Problems (Strings, DP, Graph Theory)
- Permitted Languages: C++, Java, Python, Go

Proctoring Rules:
- Full screen mode is enforced. Tab switching or secondary monitors will automatically flag and terminate the session.
- System check links must be completed at least 24 hours prior.`,
    targetBranches: ['CSE', 'ECE', 'EEE'],
    isPinned: false,
    isRead: false,
  },
  {
    id: 'NOT-2026-039',
    title: 'Revised CCPD Placement Code of Conduct & Interview Guidelines (2025-2026)',
    category: 'Policy & Guidelines',
    priority: 'normal',
    publishedAt: '12 Oct 2026, 11:00 AM',
    author: 'Directorate of CCPD',
    authorRole: 'Dean (Corporate Relations & Placements)',
    summary:
      'Official guidelines regarding student professional conduct, interview attendance policies, and offer acceptance protocols.',
    body: `To promote equitable opportunities for all students and uphold professional standards, the Placement Senate has ratified the Placement Regulations for 2025-26:

1. Mandatory Attendance:
   - Students shortlisted for tests or interviews must attend all scheduled sessions in formal attire.
   - Any absence without prior formal permission results in automatic debarment.

2. Offer Acceptance:
   - Once a student accepts a formal offer through CCPD, they must submit Form C within 3 working days.
   - Transparent communication with the corporate recruiters must be routed exclusively via the placement office.

Please review the attached Placement Manual for complete guidelines.`,
    targetBranches: ['All Branches'],
    isPinned: false,
    isRead: true,
    attachments: [
      {
        name: 'CCPD_Placement_Manual_2025_2026.pdf',
        size: '850 KB',
        type: 'pdf',
        downloadUrl: 'https://ccpd.nitw.ac.in/policies/ccpd_policy_2026.pdf',
      },
    ],
  },
  {
    id: 'NOT-2026-038',
    title: 'Goldman Sachs Final Selects - Congratulations Batch of 2026!',
    category: 'Final Results',
    priority: 'normal',
    publishedAt: '10 Oct 2026, 07:30 PM',
    author: 'CCPD Results Committee',
    authorRole: 'Head Coordinator',
    summary:
      'Goldman Sachs has extended full-time offers to 18 students from B.Tech 2026 batch at 32.0 LPA CTC. Congratulations to all selected students!',
    body: `Hearty congratulations to the 18 students who have secured full-time offers with Goldman Sachs Engineering Analyst Program for the 2026 graduating batch!

All selected students must submit the Acceptance Undertaking Form (Form C) to the CCPD office by Monday, 20th Oct 2026.`,
    targetBranches: ['CSE', 'ECE', 'EEE'],
    isPinned: false,
    isRead: true,
  },
];
