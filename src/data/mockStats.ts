import { PlacementStatistics } from '../types';

export const mockPlacementStats: PlacementStatistics = {
  academicYear: '2025 - 2026',
  totalStudentsEligible: 980,
  totalOffers: 842,
  highestPackage: '54.5 LPA',
  averagePackage: '18.4 LPA',
  medianPackage: '16.0 LPA',
  placementPercentage: 85.9,
  topRecruiters: [
    { name: 'Microsoft', offersCount: 42, highestPackage: '44.0 LPA' },
    { name: 'Google', offersCount: 28, highestPackage: '48.5 LPA' },
    { name: 'Texas Instruments', offersCount: 22, highestPackage: '28.2 LPA' },
    { name: 'Goldman Sachs', offersCount: 18, highestPackage: '32.0 LPA' },
    { name: 'Qualcomm', offersCount: 26, highestPackage: '26.5 LPA' },
    { name: 'Oracle', offersCount: 35, highestPackage: '22.0 LPA' },
    { name: 'Wells Fargo', offersCount: 30, highestPackage: '20.0 LPA' },
    { name: 'Bajaj Auto', offersCount: 16, highestPackage: '14.5 LPA' },
  ],
  branchWiseStats: [
    {
      branch: 'Computer Science & Engineering',
      percentage: 97.4,
      averagePackage: '24.2 LPA',
      highestPackage: '54.5 LPA',
    },
    {
      branch: 'Electronics & Communication',
      percentage: 92.1,
      averagePackage: '19.8 LPA',
      highestPackage: '44.0 LPA',
    },
    {
      branch: 'Electrical & Electronics',
      percentage: 88.5,
      averagePackage: '16.5 LPA',
      highestPackage: '32.0 LPA',
    },
    {
      branch: 'Mechanical Engineering',
      percentage: 81.2,
      averagePackage: '12.4 LPA',
      highestPackage: '20.0 LPA',
    },
    {
      branch: 'Civil Engineering',
      percentage: 76.8,
      averagePackage: '10.2 LPA',
      highestPackage: '15.0 LPA',
    },
    {
      branch: 'Chemical Engineering',
      percentage: 79.4,
      averagePackage: '11.8 LPA',
      highestPackage: '18.0 LPA',
    },
    {
      branch: 'Metallurgical & Materials',
      percentage: 78.0,
      averagePackage: '11.0 LPA',
      highestPackage: '16.5 LPA',
    },
    {
      branch: 'Biotechnology',
      percentage: 74.5,
      averagePackage: '10.5 LPA',
      highestPackage: '14.0 LPA',
    },
  ],
};
