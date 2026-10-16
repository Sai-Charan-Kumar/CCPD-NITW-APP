import { InterviewExperience } from '../types';

export const mockExperiences: InterviewExperience[] = [
  {
    id: 'EXP-2026-001',
    companyName: 'Microsoft',
    role: 'Software Engineer (Azure)',
    companyLogo: 'https://images.unsplash.com/photo-1642132652806-8153303c20db?w=128&q=80',
    studentName: 'Ananya Deshmukh',
    batch: 'Class of 2025',
    department: 'Computer Science & Engineering',
    verdict: 'Selected',
    difficulty: 'Medium',
    cgpa: 9.12,
    packageOffered: '44.0 LPA',
    postedDate: '15 Sep 2025',
    rounds: [
      {
        title: 'Round 1: Online Assessment (Codility)',
        duration: '80 Mins',
        questionsAsked: [
          'Find maximum value after inserting digit 5 into integer N (handling negatives)',
          'Longest semi-alternating substring with at most two consecutive duplicate chars',
          'Min steps to reduce binary representation to zero using bit shifts and decrements',
        ],
        tipsAndStrategy:
          'Codility is very strict with edge cases and integer overflow. Always check negative ranges and extreme array lengths.',
      },
      {
        title: 'Round 2: Technical Interview 1 (DSA & Pointers)',
        duration: '60 Mins',
        questionsAsked: [
          'Clone a directed graph with cycle detection using HashMaps',
          'Design an LRU Cache with O(1) get and put, with thread-safety consideration',
          'Difference between virtual functions, vtable, and vptr in C++',
        ],
        tipsAndStrategy:
          'The interviewer asked me to write dry-run execution on a whiteboard first before typing. Always communicate your thought process.',
      },
      {
        title: 'Round 3: Technical Interview 2 & Low-Level Design',
        duration: '50 Mins',
        questionsAsked: [
          'Design an In-Memory File System (createDirectory, addFile, readContent)',
          'How does the OS handle Page Faults and TLB misses?',
          'Walkthrough of my B.Tech Distributed Key-Value Store project',
        ],
        tipsAndStrategy:
          'Deep questions on project trade-offs. Be completely honest about what libraries you used vs what you built from scratch.',
      },
      {
        title: 'Round 4: Director / AA Round',
        duration: '45 Mins',
        questionsAsked: [
          'Tell me about a time when you disagreed with a teammate during a hackathon and how you resolved it.',
          'Why Microsoft over other big tech companies?',
          'If you had unlimited cloud compute, what problem would you solve?',
        ],
        tipsAndStrategy:
          'Use the STAR method (Situation, Task, Action, Result). Show genuine passion for cloud and systems engineering.',
      },
    ],
    overallAdvice:
      'Master LeetCode Mediums thoroughly. Microsoft values clean code, descriptive variable naming, and solid CS fundamentals (OS, OOPs, DBMS) as much as algorithmic brilliance.',
  },
  {
    id: 'EXP-2026-002',
    companyName: 'Texas Instruments',
    role: 'Analog & Mixed Signal IC Design Engineer',
    companyLogo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=128&q=80',
    studentName: 'Vikramaditya Rao',
    batch: 'Class of 2025',
    department: 'Electronics & Communication Engineering',
    verdict: 'Selected',
    difficulty: 'Hard',
    cgpa: 8.95,
    packageOffered: '28.2 LPA',
    postedDate: '22 Aug 2025',
    rounds: [
      {
        title: 'Round 1: Technical Written Test (Offline)',
        duration: '90 Mins',
        questionsAsked: [
          'Draw transfer characteristics for CMOS Inverter and derive noise margins (NML & NMH)',
          'Calculate output resistance of Cascode Current Mirror with channel length modulation (lambda)',
          'Small signal analysis of Common Source Amplifier with source degeneration',
        ],
        tipsAndStrategy:
          'Be crystal clear with Razavi (Design of Analog CMOS Integrated Circuits). The questions were directly conceptual.',
      },
      {
        title: 'Round 2: Technical Interview 1',
        duration: '75 Mins',
        questionsAsked: [
          'Derive phase margin and gain margin of a 2-stage Miller compensated op-amp',
          'Slew rate calculation with capacitive load',
          'Thermal noise vs Flicker (1/f) noise in sub-micron MOSFETs',
        ],
        tipsAndStrategy:
          'The panel asked me to sketch Bode plots by hand and locate dominant poles and zeros.',
      },
    ],
    overallAdvice:
      'For TI Core, textbook clarity beats everything. Revise Op-amps, Bode plots, poles-zeros, RC step responses, and semiconductor physics.',
  },
];
