import { prisma } from './prisma';
import { generateTeamQrAndBarcode } from './qrcode';

// Memory store fallback for environments without live Postgres
const memoryStore: {
  users: any[];
  teams: any[];
  teamMembers: any[];
  problemStatements: any[];
  selectionWindow: any;
  coordinators: any[];
  cmsContent: Record<string, string>;
  events: any[];
  attendanceRecords: any[];
  auditLogs: any[];
} = {
  users: [
    {
      id: 'admin-uuid-001',
      email: 'admin@glitch.com',
      passwordHash: '$2b$10$S.tEVMD93GqW8kAgvEhjvef1Qr49uRjPJb7xX.JBzPTpbJaCbcimC', // Admin@123456
      name: 'GLITCH Admin',
      phone: '+91 9876543210',
      role: 'ADMIN',
      isActive: true,
      allowedEvents: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'scanner-uuid-001',
      email: 'scanner@glitch.com',
      passwordHash: '$2b$10$S.tEVMD93GqW8kAgvEhjvef1Qr49uRjPJb7xX.JBzPTpbJaCbcimC', // Admin@123456
      name: 'Main Gate Scanner',
      phone: '+91 9876543211',
      role: 'SCANNER',
      isActive: true,
      allowedEvents: JSON.stringify(['CHECK_IN', 'BREAKFAST', 'LUNCH', 'REFRESHMENT', 'CHECK_OUT']),
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
    regFee: '₹300 / Team (₹150 / Head)',
    totalPrizePool: '₹1,50,000+',
    firstPrize: '₹75,000',
    secondPrize: '₹40,000',
    thirdPrize: '₹25,000',
    qrCodeUrl: '',
    rulesEligibility: `Team Size: Strictly 2 to 3 members per team. Registrations with fewer than 2 or more than 3 members will be rejected.
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
  events: [
    {
      id: 'event-01',
      name: 'Main Venue Check-In',
      type: 'CHECK_IN',
      startDate: new Date('2026-10-24T08:00:00Z'),
      endDate: new Date('2026-10-24T11:00:00Z'),
      isActive: true,
      allowDuplicate: false,
      description: 'Official participant verification & badge issuance at entrance gate.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'event-02',
      name: 'Day 1 Lunch Sprint',
      type: 'LUNCH',
      startDate: new Date('2026-10-24T13:00:00Z'),
      endDate: new Date('2026-10-24T14:30:00Z'),
      isActive: false,
      allowDuplicate: false,
      description: 'Main food hall lunch scanning.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  attendanceRecords: [],
  auditLogs: [],
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

  async findUserById(id: string) {
    try {
      return await prisma.user.findUnique({ where: { id } });
    } catch {
      return memoryStore.users.find((u) => u.id === id) || null;
    }
  },

  async createUser(data: { name: string; email: string; phone: string; passwordHash: string; role?: 'ADMIN' | 'TEAM_LEADER' | 'SCANNER'; allowedEvents?: string }) {
    try {
      return await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          passwordHash: data.passwordHash,
          role: data.role || 'TEAM_LEADER',
          isActive: true,
          allowedEvents: data.allowedEvents || null,
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
        isActive: true,
        allowedEvents: data.allowedEvents || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.users.push(newUser);
      return newUser;
    }
  },

  // Scanner Account Management
  async getScanners() {
    try {
      return await prisma.user.findMany({
        where: { role: 'SCANNER' },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      return memoryStore.users.filter((u) => u.role === 'SCANNER');
    }
  },

  async updateScanner(id: string, data: { name?: string; phone?: string; allowedEvents?: string; isActive?: boolean }) {
    try {
      return await prisma.user.update({
        where: { id },
        data,
      });
    } catch {
      const idx = memoryStore.users.findIndex((u) => u.id === id);
      if (idx !== -1) {
        memoryStore.users[idx] = { ...memoryStore.users[idx], ...data, updatedAt: new Date() };
        return memoryStore.users[idx];
      }
      return null;
    }
  },

  async resetScannerPassword(id: string, passwordHash: string) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { passwordHash },
      });
    } catch {
      const idx = memoryStore.users.findIndex((u) => u.id === id);
      if (idx !== -1) {
        memoryStore.users[idx].passwordHash = passwordHash;
        memoryStore.users[idx].updatedAt = new Date();
        return memoryStore.users[idx];
      }
      return null;
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

  async checkUniqueMembers(
    members: Array<{ email: string; phone: string; name?: string }>,
    currentLeaderId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      for (const m of members) {
        const emailLower = m.email.trim().toLowerCase();
        const phoneTrim = m.phone.trim();

        const existingUser = await prisma.user.findFirst({
          where: {
            email: { equals: emailLower, mode: 'insensitive' },
            id: { not: currentLeaderId },
          },
        });
        if (existingUser) {
          return {
            success: false,
            error: `Email address "${m.email}" is already registered by another account.`,
          };
        }

        const existingUserPhone = await prisma.user.findFirst({
          where: {
            phone: phoneTrim,
            id: { not: currentLeaderId },
          },
        });
        if (existingUserPhone) {
          return {
            success: false,
            error: `Phone number "${m.phone}" is already registered by another account.`,
          };
        }

        const existingMemberEmail = await prisma.teamMember.findFirst({
          where: {
            email: { equals: emailLower, mode: 'insensitive' },
            team: { leaderId: { not: currentLeaderId } },
          },
        });
        if (existingMemberEmail) {
          return {
            success: false,
            error: `Email address "${m.email}" is already registered with another team.`,
          };
        }

        const existingMemberPhone = await prisma.teamMember.findFirst({
          where: {
            phone: phoneTrim,
            team: { leaderId: { not: currentLeaderId } },
          },
        });
        if (existingMemberPhone) {
          return {
            success: false,
            error: `Phone number "${m.phone}" is already registered with another team.`,
          };
        }
      }
      return { success: true };
    } catch {
      for (const m of members) {
        const emailLower = m.email.trim().toLowerCase();
        const phoneTrim = m.phone.trim();

        const existingUser = memoryStore.users.find(
          (u) => u.email.toLowerCase() === emailLower && u.id !== currentLeaderId
        );
        if (existingUser) {
          return {
            success: false,
            error: `Email address "${m.email}" is already registered by another account.`,
          };
        }

        const existingUserPhone = memoryStore.users.find(
          (u) => u.phone === phoneTrim && u.id !== currentLeaderId
        );
        if (existingUserPhone) {
          return {
            success: false,
            error: `Phone number "${m.phone}" is already registered by another account.`,
          };
        }

        const existingMemberEmail = memoryStore.teamMembers.find(
          (tm) => tm.email.toLowerCase() === emailLower
        );
        if (existingMemberEmail) {
          const team = memoryStore.teams.find((t) => t.id === existingMemberEmail.teamId);
          if (!team || team.leaderId !== currentLeaderId) {
            return {
              success: false,
              error: `Email address "${m.email}" is already registered with another team.`,
            };
          }
        }

        const existingMemberPhone = memoryStore.teamMembers.find(
          (tm) => tm.phone === phoneTrim
        );
        if (existingMemberPhone) {
          const team = memoryStore.teams.find((t) => t.id === existingMemberPhone.teamId);
          if (!team || team.leaderId !== currentLeaderId) {
            return {
              success: false,
              error: `Phone number "${m.phone}" is already registered with another team.`,
            };
          }
        }
      }
      return { success: true };
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
        qrCodeData: null,
        barcodeData: null,
        qrCodeUrl: null,
        barcodeUrl: null,
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
    let assignedTeamId = 'GL-01';
    try {
      const approvedCount = await prisma.team.count({
        where: { status: 'APPROVED' },
      });
      const nextNum = approvedCount + 1;
      assignedTeamId = `GL-${nextNum < 10 ? '0' + nextNum : nextNum}`;

      // Generate unique QR & Barcode
      const qrBarcode = await generateTeamQrAndBarcode(assignedTeamId);

      const updated = await prisma.team.update({
        where: { id: teamDbId },
        data: {
          status: 'APPROVED',
          paymentStatus: 'VERIFIED',
          teamId: assignedTeamId,
          rejectionReason: null,
          qrCodeData: qrBarcode.qrCodeData,
          barcodeData: qrBarcode.barcodeData,
          qrCodeUrl: qrBarcode.qrCodeUrl,
          barcodeUrl: qrBarcode.barcodeUrl,
        },
        include: { leader: true, members: true },
      });

      return updated;
    } catch {
      const approvedTeams = memoryStore.teams.filter((t) => t.status === 'APPROVED');
      const nextNum = approvedTeams.length + 1;
      assignedTeamId = `GL-${nextNum < 10 ? '0' + nextNum : nextNum}`;

      const qrBarcode = await generateTeamQrAndBarcode(assignedTeamId);

      const index = memoryStore.teams.findIndex((t) => t.id === teamDbId);
      if (index !== -1) {
        memoryStore.teams[index].status = 'APPROVED';
        memoryStore.teams[index].paymentStatus = 'VERIFIED';
        memoryStore.teams[index].teamId = assignedTeamId;
        memoryStore.teams[index].rejectionReason = null;
        memoryStore.teams[index].qrCodeData = qrBarcode.qrCodeData;
        memoryStore.teams[index].barcodeData = qrBarcode.barcodeData;
        memoryStore.teams[index].qrCodeUrl = qrBarcode.qrCodeUrl;
        memoryStore.teams[index].barcodeUrl = qrBarcode.barcodeUrl;
        const leader = memoryStore.users.find((u) => u.id === memoryStore.teams[index].leaderId);
        const members = memoryStore.teamMembers.filter((m) => m.teamId === teamDbId);
        return { ...memoryStore.teams[index], leader, members };
      }
      return null;
    }
  },

  async regenerateTeamQr(teamDbId: string) {
    try {
      const team = await prisma.team.findUnique({ where: { id: teamDbId } });
      if (!team || !team.teamId) throw new Error('Team or Team ID not found');

      const qrBarcode = await generateTeamQrAndBarcode(team.teamId);

      return await prisma.team.update({
        where: { id: teamDbId },
        data: {
          qrCodeData: qrBarcode.qrCodeData,
          barcodeData: qrBarcode.barcodeData,
          qrCodeUrl: qrBarcode.qrCodeUrl,
          barcodeUrl: qrBarcode.barcodeUrl,
        },
        include: { leader: true, members: true },
      });
    } catch {
      const team = memoryStore.teams.find((t) => t.id === teamDbId);
      if (!team || !team.teamId) return null;

      const qrBarcode = await generateTeamQrAndBarcode(team.teamId);
      team.qrCodeData = qrBarcode.qrCodeData;
      team.barcodeData = qrBarcode.barcodeData;
      team.qrCodeUrl = qrBarcode.qrCodeUrl;
      team.barcodeUrl = qrBarcode.barcodeUrl;

      const leader = memoryStore.users.find((u) => u.id === team.leaderId);
      const members = memoryStore.teamMembers.filter((m) => m.teamId === teamDbId);
      return { ...team, leader, members };
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

  // Event Management
  async getEvents() {
    try {
      return await prisma.event.findMany({ orderBy: { startDate: 'asc' } });
    } catch {
      return memoryStore.events;
    }
  },

  async getActiveEvents() {
    try {
      return await prisma.event.findMany({ where: { isActive: true } });
    } catch {
      return memoryStore.events.filter((e) => e.isActive);
    }
  },

  async createEvent(data: {
    name: string;
    type: 'CHECK_IN' | 'CHECK_OUT' | 'BREAKFAST' | 'LUNCH' | 'REFRESHMENT' | 'BREAK' | 'CUSTOM';
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
    allowDuplicate?: boolean;
    description?: string;
  }) {
    try {
      return await prisma.event.create({
        data: {
          name: data.name,
          type: data.type,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive || false,
          allowDuplicate: data.allowDuplicate || false,
          description: data.description || null,
        },
      });
    } catch {
      const newEvt = {
        id: `evt-${Date.now()}`,
        name: data.name,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive || false,
        allowDuplicate: data.allowDuplicate || false,
        description: data.description || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.events.push(newEvt);
      return newEvt;
    }
  },

  async updateEvent(id: string, data: any) {
    try {
      return await prisma.event.update({ where: { id }, data });
    } catch {
      const idx = memoryStore.events.findIndex((e) => e.id === id);
      if (idx !== -1) {
        memoryStore.events[idx] = { ...memoryStore.events[idx], ...data, updatedAt: new Date() };
        return memoryStore.events[idx];
      }
      return null;
    }
  },

  async toggleEventActive(id: string, isActive: boolean) {
    try {
      return await prisma.event.update({ where: { id }, data: { isActive } });
    } catch {
      const idx = memoryStore.events.findIndex((e) => e.id === id);
      if (idx !== -1) {
        memoryStore.events[idx].isActive = isActive;
        memoryStore.events[idx].updatedAt = new Date();
        return memoryStore.events[idx];
      }
      return null;
    }
  },

  async deleteEvent(id: string) {
    try {
      return await prisma.event.delete({ where: { id } });
    } catch {
      memoryStore.events = memoryStore.events.filter((e) => e.id !== id);
      return { id };
    }
  },

  // Scanning & Attendance Logic
  async findTeamByCode(code: string) {
    const query = code.trim().toUpperCase();
    // Handle formats like "GLITCH-TEAM:GL-01", "GL-01", "GL2026001", or UUID
    let targetTeamId = query;
    if (query.startsWith('GLITCH-TEAM:')) {
      targetTeamId = query.replace('GLITCH-TEAM:', '').trim();
    }

    try {
      const team = await prisma.team.findFirst({
        where: {
          OR: [
            { teamId: targetTeamId },
            { id: targetTeamId },
            { qrCodeData: query },
            { barcodeData: query },
            { teamName: { equals: query, mode: 'insensitive' } },
          ],
        },
        include: { members: true, leader: true },
      });
      return team;
    } catch {
      const team = memoryStore.teams.find(
        (t) =>
          t.teamId === targetTeamId ||
          t.id === targetTeamId ||
          t.qrCodeData === query ||
          t.barcodeData === query ||
          t.teamName?.toUpperCase() === query
      );
      if (!team) return null;
      const members = memoryStore.teamMembers.filter((m) => m.teamId === team.id);
      const leader = memoryStore.users.find((u) => u.id === team.leaderId);
      return { ...team, members, leader };
    }
  },

  async checkDuplicateAttendance(eventId: string, memberIds: string[]) {
    try {
      const records = await prisma.attendanceRecord.findMany({
        where: {
          eventId,
          memberId: { in: memberIds },
        },
      });
      return records;
    } catch {
      return memoryStore.attendanceRecords.filter(
        (r) => r.eventId === eventId && memberIds.includes(r.memberId)
      );
    }
  },

  async recordAttendance(data: {
    eventId: string;
    teamId: string;
    memberSelections: Array<{ memberId: string; present: boolean }>;
    scannerId: string;
    notes?: string;
  }) {
    const savedRecords: any[] = [];
    const event = await (async () => {
      try {
        return await prisma.event.findUnique({ where: { id: data.eventId } });
      } catch {
        return memoryStore.events.find((e) => e.id === data.eventId);
      }
    })();

    if (!event) throw new Error('Active scanning event not found');

    for (const sel of data.memberSelections) {
      const status = sel.present ? 'PRESENT' : 'ABSENT';
      try {
        if (!event.allowDuplicate) {
          // Upsert attendance record to handle retry or re-scanning gracefully
          const rec = await prisma.attendanceRecord.upsert({
            where: {
              eventId_memberId: {
                eventId: data.eventId,
                memberId: sel.memberId,
              },
            },
            create: {
              eventId: data.eventId,
              teamId: data.teamId,
              memberId: sel.memberId,
              scannerId: data.scannerId,
              status,
              notes: data.notes || null,
            },
            update: {
              status,
              scannedAt: new Date(),
              scannerId: data.scannerId,
              notes: data.notes || null,
            },
          });
          savedRecords.push(rec);
        } else {
          const rec = await prisma.attendanceRecord.create({
            data: {
              eventId: data.eventId,
              teamId: data.teamId,
              memberId: sel.memberId,
              scannerId: data.scannerId,
              status,
              notes: data.notes || null,
            },
          });
          savedRecords.push(rec);
        }
      } catch {
        // Memory fallback
        const existingIdx = memoryStore.attendanceRecords.findIndex(
          (r) => r.eventId === data.eventId && r.memberId === sel.memberId
        );
        const recordObj = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          eventId: data.eventId,
          teamId: data.teamId,
          memberId: sel.memberId,
          scannerId: data.scannerId,
          status,
          scannedAt: new Date(),
          notes: data.notes || null,
        };

        if (existingIdx !== -1 && !event.allowDuplicate) {
          memoryStore.attendanceRecords[existingIdx] = recordObj;
          savedRecords.push(recordObj);
        } else {
          memoryStore.attendanceRecords.push(recordObj);
          savedRecords.push(recordObj);
        }
      }
    }
    return savedRecords;
  },

  async getAllAttendanceRecords() {
    try {
      return await prisma.attendanceRecord.findMany({
        include: {
          event: true,
          team: true,
          member: true,
          scanner: { select: { id: true, name: true, email: true } },
        },
        orderBy: { scannedAt: 'desc' },
      });
    } catch {
      return memoryStore.attendanceRecords.map((r) => {
        const event = memoryStore.events.find((e) => e.id === r.eventId);
        const team = memoryStore.teams.find((t) => t.id === r.teamId);
        const member = memoryStore.teamMembers.find((m) => m.id === r.memberId);
        const scanner = memoryStore.users.find((u) => u.id === r.scannerId);
        return { ...r, event, team, member, scanner };
      });
    }
  },

  // Audit Logs
  async logAudit(data: {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    action: string;
    teamId?: string;
    memberId?: string;
    eventId?: string;
    details?: string;
    ipAddress?: string;
  }) {
    try {
      return await prisma.auditLog.create({ data });
    } catch {
      const entry = {
        id: `audit-${Date.now()}`,
        ...data,
        createdAt: new Date(),
      };
      memoryStore.auditLogs.unshift(entry);
      return entry;
    }
  },

  async getAuditLogs() {
    try {
      return await prisma.auditLog.findMany({
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
    } catch {
      return memoryStore.auditLogs.slice(0, 100);
    }
  },
};

