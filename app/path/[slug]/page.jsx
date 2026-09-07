import PathReaderClient from './PathReaderClient';
import { pathsData } from '@/lib/paths-data';
import { notFound } from 'next/navigation';

function getPath(slug) {
  return pathsData.find((p) => p.slug === slug || (slug === 'asa-di-var' && p.slug === 'asa-di-vaar'));
}

export async function generateStaticParams() {
  const params = pathsData.map((p) => ({
    slug: p.slug,
  }));
  params.push({ slug: 'asa-di-var' });
  return params;
}

export async function generateMetadata({ params }) {
  const path = getPath(params.slug);
  if (!path) return { title: 'Path Not Found' };
  return {
    title: `${path.title} (${path.punjabiTitle}) | Read with Punjabi & English Meaning`,
    description: path.description,
  };
}

export default function PathDetailPage({ params }) {
  const path = getPath(params.slug);

  if (!path) {
    notFound();
  }

  return <PathReaderClient path={path} />;
}
