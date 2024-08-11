import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PackageInfo } from './types';

const getPackageInfo = (file: string): PackageInfo | null => {
  try {
    const packagePath: string = path.join(path.dirname(file), 'package.json');

    if (!fs.existsSync(packagePath) || !fs.lstatSync(file).isFile()) {
      return null;
    }

    const packageJson: string = fs.readFileSync(packagePath, 'utf-8');

    try {
      const packageJsonObj: PackageInfo = JSON.parse(packageJson);

      return {
        name: packageJsonObj.name,
        version: packageJsonObj.version,
        path: packagePath,
      };
    } catch (error) {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export default getPackageInfo;
