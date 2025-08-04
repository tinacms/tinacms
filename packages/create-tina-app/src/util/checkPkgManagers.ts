import { exec } from 'child_process';
import { PackageManager } from './packageManagers';

export async function checkPackageExists(name: PackageManager) {
  try {
    await new Promise((resolve, reject) => {
      exec(`${name} -v`, (error, stdout, stderr) => {
        if (error) {
          reject(stderr);
        }
        resolve(stdout);
      });
    });
    return true;
  } catch (_) {
    return false;
  }
}
