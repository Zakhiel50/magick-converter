import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function executable(): Promise<string | null> {
  try {
    await execPromise('magick -version');
    return 'magick';
  } catch (e) {
    try {
      await execPromise('convert -version');
      return 'convert';
    } catch (e2) {
      return null;
    }
  }
}
