/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */

import { mergeSets } from './mergeSets';

type EntriesByGroup = Map<string, Set<string>>;

export type Group = {
    name: string;
    modules: Set<string>;
    dependsOnGroups: Set<string>;
};
/**
 * @summary Splits modules into separate chunks, and creates shared chunks
 *          for modules that are shared. See docs/diagram.png for an illustration
 */
export function computeBundles(entriesByGroup: EntriesByGroup) {
    const allDeps: string[] = Array.from(
        mergeSets([...entriesByGroup.values()]),
    );
    // Generate and populate Map with empty sets eagerly to
    // avoid safety checks everywhere in later code
    const depsWithGroups = new Map(
        allDeps.map(dep => [dep, new Set()] as [string, Set<string>]),
    );

    for (const [group, deps] of entriesByGroup) {
        for (const dep of deps) {
            depsWithGroups.get(dep)!.add(group);
        }
    }

    const finalGroups = new Map(
        [...entriesByGroup.keys()].map(name => {
            return [name, conf(name)] as [string, Group];
        }),
        // Special-case the "all" group
    ).set('all', conf('all'));

    for (const [dep, groups] of depsWithGroups) {
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
            if (!finalGroups.get(key)) {
                finalGroups.set(key, conf(key));
            }
            finalGroups.get(key)!.modules.add(dep);
            finalGroups.get(group1)!.dependsOnGroups.add(key);
            finalGroups.get(group2)!.dependsOnGroups.add(key);
        }

        // TODO: Either make this threshold configurable,
        // or use a heuristic, something like (total bundles - 2)
        if (groups.size > 2) {
            // Move to the global shared file
            finalGroups.get('all')!.modules.add(dep);
        }
    }

    return finalGroups;
}

const conf = (name: string): Group => ({
    name,
    modules: new Set(),
    dependsOnGroups: new Set(['all']),
});
