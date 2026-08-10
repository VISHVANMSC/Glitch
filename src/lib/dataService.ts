import { prisma } from './prisma';

// Memory store fallback for environments without live Postgres
const memoryStore: {
  users: any[];
  teams: any[];
  teamMembers: any[];
  problemStatements: any[];
  selectionWindow: any;
  coordinators: any[];
  cmsContent: Record<string, string>;
} = {
  users: [
    {
      id: 'admin-uuid-001',
      email: 'admin@glitch.com',
      passwordHash: '$2a$10$e8.Z/7tH4NlhJz9QhR5Kxe49V8kYg82x1P7gW8tKxP1z5d4e3f2g1', // Admin@123456
      name: 'GLITCH Admin',
      phone: '+91 9876543210',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  teams: [],
  teamMembers: [],
  problemStatements: [
    {
      id: 'ps-01',
      psNumber: 'PS-01',
      title: 'AI-Powered Disaster Management & Real-time Early Warning System',
      description: 'Design and develop an autonomous disaster prediction and response coordination platform utilizing satellite telemetry, social sensing, and edge AI to optimize rescue routes and resource allocation.',
      category: 'Artificial Intelligence & IoT',
      driveLink: 'https://drive.google.com/drive/folders/glitch-1-0-ps01-resource',
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'ps-02',
      psNumber: 'PS-02',
      title: 'Decentralized Identity & Verification Protocol for Academic Credentials',
      description: 'Build a zero-knowledge proof (ZKP) based decentralized credential verification network for educational institutions to instantly issue and audit tamper-proof diplomas and mark sheets.',
      category: 'Blockchain & Cybersecurity',
      driveLink: 'https://drive.google.com/drive/folders/glitch-1-0-ps02-resource',
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'ps-03',
      psNumber: 'PS-03',
      title: 'Next-Gen Smart Healthcare Analytics & ICU Patient Telemetry',
      description: 'Develop an intuitive, low-latency web dashboard with real-time biometric anomaly detection for multi-hospital patient telemetry using WebSockets and machine learning algorithms.',
      category: 'Healthcare & Web Engineering',
      driveLink: 'https://drive.google.com/drive/folders/glitch-1-0-ps03-resource',
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  selectionWindow: {
    id: 'default_window',
    isOpen: false,
    startTime: null,
    endTime: null,
    durationMinutes: 30,
    updatedAt: new Date(),
  },
  coordinators: [
    {
      id: 'coord-f1',
      type: 'FACULTY',
      name: 'Dr. R. Arunkumar',
      designation: 'Professor & Head of Department',
      department: 'Computer Science & Engineering',
      phone: '+91 98401 12345',
      email: 'arunkumar@glitch.edu',
      order: 1,
    },
    {
      id: 'coord-f2',
      type: 'FACULTY',
      name: 'Dr. Meenakshi Sundaram',
      designation: 'Associate Professor',
      department: 'Information Technology',
      phone: '+91 98402 67890',
      email: 'meenakshi@glitch.edu',
      order: 2,
    },
    {
      id: 'coord-s1',
      type: 'STUDENT',
      name: 'Karthik Subramanian',
      role: 'Overall Student President',
      department: 'Final Year CSE',
      phone: '+91 91234 56789',
      email: 'karthik.s@glitch.org',
      order: 1,
    },
    {
      id: 'coord-s2',
      type: 'STUDENT',
      name: 'Ananya Sharma',
      role: 'Technical Lead & Coordinator',
      department: 'Final Year IT',
      phone: '+91 92345 67890',
      email: 'ananya.s@glitch.org',
      order: 2,
    },
  ],
  cmsContent: {
    heroHeadline: 'BUILD THE FUTURE AT GLITCH - 1.0',
    heroSubtitle: 'A 24hrs Premier National Level Hackathon pushing the frontiers of Code, Intelligence, and Innovation.',
    eventDate: 'OCTOBER 24-25, 2026',
    eventTime: '08:30 AM IST (24 Hours Live Code)',
    venue: 'Convention Center, Main Campus, Tech Hub City',
    registrationDeadline: 'OCTOBER 20, 2026',
    bankName: 'State Bank of India',
    bankAccountName: 'GLITCH HACKATHON COMMITTEE',
    bankAccountNumber: '98765432109876',
    bankIfsc: 'SBIN0001234',
    upiId: 'glitch10@upi',
    regFee: '₹300 / Team',
    qrCodeUrl: '',
    rulesEligibility: `Team Size: Strictly 1 to 3 members per team. Registrations with fewer than 1 or more than 3 members will be rejected.
Institutional Uniformity: All team members must belong to the exact same college/institution as selected by the Team Leader.
Single Account Registration: Only the Team Leader creates an account and logs into the platform. Separate member accounts are not required.
Student Status: Open to all undergraduate & postgraduate engineering and technology students across India.`,
    rulesConduct: `Problem Statement Lock: Problem statement selection is permitted only during the active Admin timer window. Once locked, selection cannot be edited or changed.
Originality: All code written during GLITCH - 1.0 must be fresh work. Pre-existing projects are strictly prohibited.
Payment Proof Verification: Upload of valid payment receipt screenshot and UTR transaction number is mandatory for Admin approval.
Jury Verdict: The decision of the organizing committee and evaluation jury will be final and binding.`,
    agendaDay1: `08:30 AM | Reporting & Badge Verification | Check-in at venue and team badge collection.
09:30 AM | Grand Inauguration Ceremony | Welcome note by Faculty Chairs and Chief Guest address.
10:30 AM | PS Window Opens & Hackathon Commences | Problem statement selection window activates online.
01:30 PM | Networking Lunch | Lunch break served at college dining hall.
04:30 PM | Mentoring Round 1 | Industry mentors review initial architecture & ideas.
08:30 PM | Dinner & Power Hour | Dinner break and energetic coding sprint.`,
    agendaDay2: `08:00 AM | Breakfast & Code Freeze Warning | Final sprint before project freeze.
10:30 AM | Final Code Submission | Code repositories and project documentation locked.
11:30 AM | Jury Evaluation & Pitching | Live project demonstrations to judges.
03:30 PM | Valedictory & Prize Distribution | Grand finale ceremony and winner announcements.`,
  },
};

export const dataService = {
  // Users
  async findUserByEmail(email: string) {
    try {
      return await prisma.user.findUnique({ where: { email } });
    } catch {
      return memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
  },

  async createUser(data: { name: string; email: string; phone: string; passwordHash: string; role?: 'ADMIN' | 'TEAM_LEADER' }) {
    try {
      return await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          passwordHash: data.passwordHash,
          role: data.role || 'TEAM_LEADER',
        },
      });
    } catch {
      const newUser = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        role: data.role || 'TEAM_LEADER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.users.push(newUser);
      return newUser;
    }
  },

  // Teams & Registrations
  async getTeamByLeaderId(leaderId: string) {
    try {
      return await prisma.team.findFirst({
        where: { leaderId },
        include: { members: true, selectedPs: true },
      });
    } catch {
      const team = memoryStore.teams.find((t) => t.leaderId === leaderId);
      if (!team) return null;
      const members = memoryStore.teamMembers.filter((m) => m.teamId === team.id);
      const selectedPs = memoryStore.problemStatements.find((p) => p.id === team.selectedPsId) || null;
      return { ...team, members, selectedPs };
    }
  },

  async getAllTeams() {
    try {
      return await prisma.team.findMany({
        include: { leader: true, members: true, selectedPs: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      return memoryStore.teams.map((t) => {
        const leader = memoryStore.users.find((u) => u.id === t.leaderId);
        const members = memoryStore.teamMembers.filter((m) => m.teamId === t.id);
        const selectedPs = memoryStore.problemStatements.find((p) => p.id === t.selectedPsId) || null;
        return { ...t, leader, members, selectedPs };
      });
    }
  },

  async createTeam(data: {
    teamName: string;
    teamSize: number;
    leaderId: string;
    paymentScreenshotUrl: string;
    transactionUtor: string;
    members: Array<{
      name: string;
      email: string;
      phone: string;
      college: string;
      department: string;
      year: string;
      isLeader: boolean;
    }>;
  }) {
    try {
      return await prisma.team.create({
        data: {
          teamName: data.teamName,
          teamSize: data.teamSize,
          leaderId: data.leaderId,
          paymentScreenshotUrl: data.paymentScreenshotUrl,
          transactionUtor: data.transactionUtor,
          members: {
            create: data.members,
          },
        },
        include: { members: true },
      });
    } catch {
      const teamId = `team-${Date.now()}`;
      const newTeam = {
        id: teamId,
        teamId: null,
        teamName: data.teamName,
        teamSize: data.teamSize,
        leaderId: data.leaderId,
        status: 'PENDING',
        rejectionReason: null,
        paymentScreenshotUrl: data.paymentScreenshotUrl,
        transactionUtor: data.transactionUtor,
        paymentStatus: 'PENDING',
        selectedPsId: null,
        selectedAt: null,
        result: 'NONE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.teams.push(newTeam);

      const createdMembers = data.members.map((m) => ({
        id: `mem-${Math.random().toString(36).substring(7)}`,
        teamId: teamId,
        ...m,
        createdAt: new Date(),
      }));
      memoryStore.teamMembers.push(...createdMembers);

      return { ...newTeam, members: createdMembers };
    }
  },

  async approveTeam(teamDbId: string) {
    // Generate GL-01, GL-02 format
    let assignedTeamId = 'GL-01';
    try {
      const approvedCount = await prisma.team.count({
        where: { status: 'APPROVED' },
      });
      const nextNum = approvedCount + 1;
      assignedTeamId = `GL-${nextNum < 10 ? '0' + nextNum : nextNum}`;

      return await prisma.team.update({
        where: { id: teamDbId },
        data: {
          status: 'APPROVED',
          paymentStatus: 'VERIFIED',
          teamId: assignedTeamId,
          rejectionReason: null,
        },
        include: { leader: true, members: true },
      });
    } catch {
      const approvedTeams = memoryStore.teams.filter((t) => t.status === 'APPROVED');
      const nextNum = approvedTeams.length + 1;
      assignedTeamId = `GL-${nextNum < 10 ? '0' + nextNum : nextNum}`;

      const index = memoryStore.teams.findIndex((t) => t.id === teamDbId);
      if (index !== -1) {
        memoryStore.teams[index].status = 'APPROVED';
        memoryStore.teams[index].paymentStatus = 'VERIFIED';
        memoryStore.teams[index].teamId = assignedTeamId;
        memoryStore.teams[index].rejectionReason = null;
        const leader = memoryStore.users.find((u) => u.id === memoryStore.teams[index].leaderId);
        const members = memoryStore.teamMembers.filter((m) => m.teamId === teamDbId);
        return { ...memoryStore.teams[index], leader, members };
      }
      return null;
    }
  },

  async rejectTeam(teamDbId: string, rejectionReason: string) {
    try {
      return await prisma.team.update({
        where: { id: teamDbId },
        data: {
          status: 'REJECTED',
          paymentStatus: 'REJECTED',
          rejectionReason,
        },
        include: { leader: true, members: true },
      });
    } catch {
      const index = memoryStore.teams.findIndex((t) => t.id === teamDbId);
      if (index !== -1) {
        memoryStore.teams[index].status = 'REJECTED';
        memoryStore.teams[index].paymentStatus = 'REJECTED';
        memoryStore.teams[index].rejectionReason = rejectionReason;
        const leader = memoryStore.users.find((u) => u.id === memoryStore.teams[index].leaderId);
        const members = memoryStore.teamMembers.filter((m) => m.teamId === teamDbId);
        return { ...memoryStore.teams[index], leader, members };
      }
      return null;
    }
  },

  // Problem Statements
  async getAllProblemStatements() {
    try {
      return await prisma.problemStatement.findMany({
        orderBy: { psNumber: 'asc' },
      });
    } catch {
      return memoryStore.problemStatements;
    }
  },

  async createProblemStatement(data: { psNumber: string; title: string; description: string; category?: string; driveLink: string }) {
    try {
      return await prisma.problemStatement.create({
        data: {
          psNumber: data.psNumber,
          title: data.title,
          description: data.description,
          category: data.category || 'General',
          driveLink: data.driveLink,
        },
      });
    } catch {
      const newPs = {
        id: `ps-${Date.now()}`,
        psNumber: data.psNumber,
        title: data.title,
        description: data.description,
        category: data.category || 'General',
        driveLink: data.driveLink,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.problemStatements.push(newPs);
      return newPs;
    }
  },

  async updateProblemStatement(
    id: string,
    data: { psNumber?: string; title?: string; description?: string; category?: string; driveLink?: string }
  ) {
    try {
      return await prisma.problemStatement.update({
        where: { id },
        data: {
          ...(data.psNumber && { psNumber: data.psNumber }),
          ...(data.title && { title: data.title }),
          ...(data.description && { description: data.description }),
          ...(data.category && { category: data.category }),
          ...(data.driveLink && { driveLink: data.driveLink }),
        },
      });
    } catch {
      const index = memoryStore.problemStatements.findIndex((p) => p.id === id);
      if (index !== -1) {
        memoryStore.problemStatements[index] = {
          ...memoryStore.problemStatements[index],
          ...data,
          updatedAt: new Date(),
        };
        return memoryStore.problemStatements[index];
      }
      return null;
    }
  },

  async deleteProblemStatement(id: string) {
    try {
      return await prisma.problemStatement.delete({ where: { id } });
    } catch {
      memoryStore.problemStatements = memoryStore.problemStatements.filter((p) => p.id !== id);
      return { id };
    }
  },

  // PS Selection Window
  async getSelectionWindow() {
    try {
      const window = await prisma.psSelectionWindow.findUnique({
        where: { id: 'default_window' },
      });
      return window || memoryStore.selectionWindow;
    } catch {
      return memoryStore.selectionWindow;
    }
  },

  async setSelectionWindow(isOpen: boolean, durationMinutes: number) {
    const startTime = isOpen ? new Date() : null;
    const endTime = isOpen ? new Date(Date.now() + durationMinutes * 60 * 1000) : null;

    try {
      return await prisma.psSelectionWindow.upsert({
        where: { id: 'default_window' },
        create: {
          id: 'default_window',
          isOpen,
          durationMinutes,
          startTime,
          endTime,
        },
        update: {
          isOpen,
          durationMinutes,
          startTime,
          endTime,
        },
      });
    } catch {
      memoryStore.selectionWindow = {
        id: 'default_window',
        isOpen,
        durationMinutes,
        startTime,
        endTime,
        updatedAt: new Date(),
      };
      return memoryStore.selectionWindow;
    }
  },

  async selectProblemStatement(teamDbId: string, psId: string) {
    try {
      return await prisma.team.update({
        where: { id: teamDbId },
        data: {
          selectedPsId: psId,
          selectedAt: new Date(),
        },
        include: { selectedPs: true, leader: true },
      });
    } catch {
      const index = memoryStore.teams.findIndex((t) => t.id === teamDbId);
      if (index !== -1) {
        memoryStore.teams[index].selectedPsId = psId;
        memoryStore.teams[index].selectedAt = new Date();
        const selectedPs = memoryStore.problemStatements.find((p) => p.id === psId) || null;
        const leader = memoryStore.users.find((u) => u.id === memoryStore.teams[index].leaderId);
        return { ...memoryStore.teams[index], selectedPs, leader };
      }
      return null;
    }
  },

  // Results
  async updateTeamResult(teamDbId: string, result: 'NONE' | 'PARTICIPATED' | 'FIRST_PRIZE' | 'SECOND_PRIZE' | 'THIRD_PRIZE') {
    try {
      return await prisma.team.update({
        where: { id: teamDbId },
        data: { result },
      });
    } catch {
      const index = memoryStore.teams.findIndex((t) => t.id === teamDbId);
      if (index !== -1) {
        memoryStore.teams[index].result = result;
        return memoryStore.teams[index];
      }
      return null;
    }
  },

  // Coordinators
  async getCoordinators() {
    try {
      return await prisma.coordinator.findMany({
        orderBy: { order: 'asc' },
      });
    } catch {
      return memoryStore.coordinators;
    }
  },

  async createCoordinator(data: {
    type: 'FACULTY' | 'STUDENT';
    name: string;
    designation?: string;
    role?: string;
    department: string;
    phone?: string;
    email?: string;
    photoUrl?: string;
  }) {
    try {
      return await prisma.coordinator.create({ data });
    } catch {
      const newCoord = {
        id: `coord-${Date.now()}`,
        ...data,
        order: memoryStore.coordinators.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.coordinators.push(newCoord);
      return newCoord;
    }
  },

  async deleteCoordinator(id: string) {
    try {
      return await prisma.coordinator.delete({ where: { id } });
    } catch {
      memoryStore.coordinators = memoryStore.coordinators.filter((c) => c.id !== id);
      return { id };
    }
  },

  // Landing Page CMS
  async getCmsContent() {
    try {
      const rows = await prisma.landingPageContent.findMany();
      const content: Record<string, string> = { ...memoryStore.cmsContent };
      rows.forEach((r) => {
        content[r.key] = r.value;
      });
      return content;
    } catch {
      return memoryStore.cmsContent;
    }
  },

  async updateCmsContent(content: Record<string, string>) {
    for (const [key, value] of Object.entries(content)) {
      try {
        await prisma.landingPageContent.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        });
      } catch {
        memoryStore.cmsContent[key] = value;
      }
    }
    return memoryStore.cmsContent;
  },
};
