/**
 * Statement Page - Redirect to About
 * 
 * This redirect prevents 404 on /statement links.
 * If a dedicated statement page is needed in the future,
 * replace this redirect with actual content.
 */

import { redirect } from 'next/navigation';

export default function StatementPage() {
    redirect('/about');
}
