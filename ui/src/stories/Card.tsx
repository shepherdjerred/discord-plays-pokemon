import "twin.macro";
export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div tw="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
      <div tw="px-4 py-5 sm:px-6">{title}</div>
      <div tw="px-4 py-5 sm:p-6">{children}</div>
    </div>
  );
}
