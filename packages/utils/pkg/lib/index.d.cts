interface PackageInfo {
    name: string;
    version: string;
    path: string;
}

declare const getChangedFiles: (commitId?: string) => string[];

declare const getChangedPackages: (commitId?: string, ignorePath?: (string | RegExp)[]) => PackageInfo[];

declare const getPackageInfo: (file: string) => PackageInfo | null;

declare const _default: {
    getPackageInfo: (file: string) => PackageInfo | null;
    getChangedFiles: (commitId?: string) => string[];
    getChangedPackages: (commitId?: string, ignorePath?: (string | RegExp)[]) => PackageInfo[];
};

export { _default as default, getChangedFiles, getChangedPackages, getPackageInfo };
