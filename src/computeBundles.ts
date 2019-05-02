/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import { mergeSets } from './mergeSets';
import fromEntries from 'fromentries';
import { Logger } from './logger';

type EntriesByGroup = Record<string, Set<string>>;

export type Group = {
    name: string;
    modules: Set<string>;
    sharedBundleNames: Set<string>;
};

export type BundleSpec = {
    groups: Map<string, Group>;
    sharedGroups: Record<string, Set<string>>;
};

type Opts = { logger?: Logger };
export function computeBundles(
    entriesByGroup: EntriesByGroup,
    opts: Opts,
): BundleSpec {
    const allDeps = Array.from(mergeSets(Object.values(entriesByGroup)));
    const depsWithGroups = fromEntries(
        allDeps.map(dep => {
            const pair: [string, Set<string>] = [dep, new Set()];
            return pair;
        }),
    );

    for (const [group, deps] of Object.entries(entriesByGroup)) {
        for (const dep of deps) {
            depsWithGroups[dep].add(group);
        }
    }

    const finalGroups = new Map(
        Object.keys(entriesByGroup).map(name => {
            const conf = {
                name,
                modules: new Set(),
                sharedBundleNames: new Set(['all']),
            };
            return [name, conf] as [string, Group];
        }),
    );

    const sharedGroups: Map<string, Set<string>> = new Map([
        ['all', new Set()],
    ]);

    for (const [dep, groups] of Object.entries(depsWithGroups)) {
        // If the dependency is only in one group, keep it in
        // that group
        if (groups.size === 1) {
            const [group] = groups;
            finalGroups.get(group)!.modules.add(dep);
        }

        // If the dependency is in 2 groups, assign it
        // to a shared file made for those 2 groups
        if (groups.size === 2) {
            const [group1, group2] = groups;
            const key = `${group1}-${group2}-shared`;
            let modules = sharedGroups.get(key);
            if (!modules) sharedGroups.set(key, (modules = new Set()));
            modules.add(dep);
            finalGroups.get(group1)!.sharedBundleNames.add(key);
            finalGroups.get(group2)!.sharedBundleNames.add(key);
        }

        // Move to the global shared file
        if (groups.size > 2) {
            sharedGroups.get('all')!.add(dep);
        }
    }

    return { groups: finalGroups, sharedGroups };
}
