/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import { Config } from './configLocator';
import { mergeSets } from './mergeSets';
import fromEntries from 'fromentries';
import { Logger } from './logger';

type EntriesByGroup = Record<string, Set<string>>;

type Group = {
    name: string | number;
    modules: Set<string>;
    sharedSplitNames: Set<string>;
};

type Opts = { logger?: Logger };
export function createSplits(entriesByGroup: EntriesByGroup, opts: Opts) {
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

    const finalGroups = fromEntries(
        Object.entries(entriesByGroup).map(([name, deps]) => {
            const conf = {
                name,
                modules: new Set(),
                sharedSplitNames: new Set(['all']),
            };
            return [name, conf] as [string, Group];
        }),
    );

    const sharedGroups: Record<string, Set<string>> = {
        all: new Set(),
    };

    for (const [dep, groups] of Object.entries(depsWithGroups)) {
        // If the dependency is only in one group, keep it in
        // that group
        if (groups.size === 1) {
            const [group] = groups;
            finalGroups[group].modules.add(dep);
        }

        // If the dependency is in 2 groups, assign it
        // to a shared file made for those 2 groups
        if (groups.size === 2) {
            const [group1, group2] = groups;
            const key = `${group1}-${group2}-shared`;
            const modules = (sharedGroups[key] =
                sharedGroups[key] || new Set());

            modules.add(dep);
            finalGroups[group1].sharedSplitNames.add(key);
            finalGroups[group2].sharedSplitNames.add(key);
        }

        // Move to the global shared file
        if (groups.size > 2) {
            sharedGroups.all.add(dep);
        }
    }

    return { groups: finalGroups, sharedGroups };
}
