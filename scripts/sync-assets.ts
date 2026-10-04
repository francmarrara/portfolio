import fs from 'node:fs';
import path from 'node:path';

interface SyncOptions {
  from?: string;
  to?: string;
}

// Next.js only serves public/, while the source of truth for images is content/assets/.
export function syncAssets({
  from = path.join(process.cwd(), 'content/assets'),
  to = path.join(process.cwd(), 'public/assets'),
}: SyncOptions = {}): number {
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(to, { recursive: true });
  if (!fs.existsSync(from)) return 0;

  let copied = 0;
  fs.cpSync(from, to, {
    recursive: true,
    filter: (source) => {
      if (path.basename(source) === '.gitkeep') return false;
      if (fs.statSync(source).isFile()) copied++;
      return true;
    },
  });
  return copied;
}

if (process.argv[1]?.endsWith('sync-assets.ts')) {
  console.log(`Synced ${syncAssets()} asset files to public/assets.`);
}
