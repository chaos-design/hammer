import * as cp from 'node:child_process';

declare function pnpmPublish({ filter, cwd, force, tailCommands, onlyDependencies, ignore, }: {
    filter?: string[];
    cwd?: string;
    ignore?: string[];
    force?: boolean;
    tailCommands?: string[];
    onlyDependencies?: boolean;
}): Promise<cp.ChildProcess>;

export { pnpmPublish };
