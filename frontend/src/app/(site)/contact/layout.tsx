import { generatePageMetadata } from '../../../utils/seo';
import { PageSchema } from '../../../components/seo/json-ld';

export async function generateMetadata() {
  return generatePageMetadata('contact');
}

// Structured data for the contact page, rendered on the server.
export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSchema slug="contact" />
      {children}
    </>
  );
}
