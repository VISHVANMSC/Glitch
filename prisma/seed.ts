import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/glitch_db';
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Supabase Database...');

  // Hash Admin Password
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);

  // 1. Seed Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@glitch.com' },
    update: {
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@glitch.com',
      passwordHash: adminPasswordHash,
      name: 'GLITCH Admin',
      phone: '+91 9876543210',
      role: 'ADMIN',
    },
  });
  console.log('✔ Admin user seeded:', admin.email);

  // 2. Seed Problem Statements
  const problemStatements = [
    {
      psNumber: 'PS-01',
      title: 'AI-Powered Disaster Management & Real-time Early Warning System',
      description:
        'Design and develop an autonomous disaster prediction and response coordination platform utilizing satellite telemetry, social sensing, and edge AI to optimize rescue routes and resource allocation.',
      category: 'Artificial Intelligence & IoT',
      driveLink: 'https://drive.google.com/drive/folders/glitch-1-0-ps01-resource',
    },
    {
      psNumber: 'PS-02',
      title: 'Decentralized Identity & Verification Protocol for Academic Credentials',
      description:
        'Build a zero-knowledge proof (ZKP) based decentralized credential verification network for educational institutions to instantly issue and audit tamper-proof diplomas and mark sheets.',
      category: 'Blockchain & Cybersecurity',
      driveLink: 'https://drive.google.com/drive/folders/glitch-1-0-ps02-resource',
    },
    {
      psNumber: 'PS-03',
      title: 'Next-Gen Smart Healthcare Analytics & ICU Patient Telemetry',
      description:
        'Develop an intuitive, low-latency web dashboard with real-time biometric anomaly detection for multi-hospital patient telemetry using WebSockets and machine learning algorithms.',
      category: 'Healthcare & Web Engineering',
      driveLink: 'https://drive.google.com/drive/folders/glitch-1-0-ps03-resource',
    },
  ];

  for (const ps of problemStatements) {
    await prisma.problemStatement.upsert({
      where: { psNumber: ps.psNumber },
      update: ps,
      create: ps,
    });
  }
  console.log('✔ Problem statements seeded');

  // 3. Seed Selection Window
  await prisma.psSelectionWindow.upsert({
    where: { id: 'default_window' },
    update: {},
    create: {
      id: 'default_window',
      isOpen: false,
      durationMinutes: 30,
    },
  });
  console.log('✔ Selection window seeded');

  // 4. Seed Coordinators
  const coordinators = [
    {
      type: 'FACULTY' as const,
      name: 'Dr. R. Arunkumar',
      designation: 'Professor & Head of Department',
      department: 'Computer Science & Engineering',
      phone: '+91 98401 12345',
      email: 'arunkumar@glitch.edu',
      order: 1,
    },
    {
      type: 'FACULTY' as const,
      name: 'Dr. Meenakshi Sundaram',
      designation: 'Associate Professor',
      department: 'Information Technology',
      phone: '+91 98402 67890',
      email: 'meenakshi@glitch.edu',
      order: 2,
    },
    {
      type: 'STUDENT' as const,
      name: 'Karthik Subramanian',
      role: 'Overall Student President',
      department: 'Final Year CSE',
      phone: '+91 91234 56789',
      email: 'karthik.s@glitch.org',
      order: 1,
    },
    {
      type: 'STUDENT' as const,
      name: 'Ananya Sharma',
      role: 'Technical Lead & Coordinator',
      department: 'Final Year IT',
      phone: '+91 92345 67890',
      email: 'ananya.s@glitch.org',
      order: 2,
    },
  ];

  for (const coord of coordinators) {
    const existing = await prisma.coordinator.findFirst({
      where: { name: coord.name },
    });
    if (!existing) {
      await prisma.coordinator.create({ data: coord });
    }
  }
  console.log('✔ Coordinators seeded');

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
