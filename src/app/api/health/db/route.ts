import { NextRequest } from 'next/server';
import { GET as handleHealthGET, POST as handleHealthPOST } from '../route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  return handleHealthGET(req);
}

export async function POST(req: NextRequest) {
  return handleHealthPOST(req);
}
