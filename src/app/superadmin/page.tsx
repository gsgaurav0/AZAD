import { redirect } from 'next/navigation';

export default function SuperadminRedirect() {
  redirect('/admin');
}

