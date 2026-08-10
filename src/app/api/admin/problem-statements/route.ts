import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dataService } from '@/lib/dataService';

export async function GET() {
  const problemStatements = await dataService.getAllProblemStatements();
  const selectionWindow = await dataService.getSelectionWindow();
  return NextResponse.json({ problemStatements, selectionWindow });
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();

    if (body.action === 'set_window') {
      const { isOpen, durationMinutes } = body;
      const window = await dataService.setSelectionWindow(Boolean(isOpen), Number(durationMinutes) || 30);
      return NextResponse.json({ message: 'Problem statement selection window updated', window });
    }

    const { psNumber, title, description, category, driveLink } = body;
    if (!psNumber || !title || !description || !driveLink) {
      return NextResponse.json({ error: 'PS Number, Title, Description, and Drive Link are required.' }, { status: 400 });
    }

    const ps = await dataService.createProblemStatement({
      psNumber,
      title,
      description,
      category,
      driveLink,
    });

    return NextResponse.json({ message: 'Problem statement published successfully', problemStatement: ps });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, psNumber, title, description, category, driveLink } = body;

    if (!id) {
      return NextResponse.json({ error: 'Problem Statement ID is required.' }, { status: 400 });
    }

    const updatedPs = await dataService.updateProblemStatement(id, {
      psNumber,
      title,
      description,
      category,
      driveLink,
    });

    return NextResponse.json({ message: 'Problem statement updated successfully', problemStatement: updatedPs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'PS ID is required' }, { status: 400 });
    }

    await dataService.deleteProblemStatement(id);
    return NextResponse.json({ message: 'Problem statement deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
