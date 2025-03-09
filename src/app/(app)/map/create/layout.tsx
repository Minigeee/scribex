import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Map Generator',
  description: 'Generate procedural maps using perlin noise',
};

export default function MapCreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
