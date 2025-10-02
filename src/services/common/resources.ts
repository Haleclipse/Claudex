/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../common/uri';

/**
 * Simplified resource utility functions based on VS Code's resources.ts
 */

/**
 * Tests whether a `candidate` URI is a parent or equal to a given `base` URI.
 * @param base The base URI which should be a parent or equal
 * @param parentCandidate The candidate URI to test for being a parent or equal to the base
 * @param ignoreFragment Ignore the fragment component of the URI (defaults to false)
 */
export function isEqualOrParent(base: URI, parentCandidate: URI, ignoreFragment: boolean = false): boolean {
	if (base.scheme !== parentCandidate.scheme) {
		return false;
	}

	// For file URIs, use simple path comparison
	if (base.scheme === 'file') {
		return isEqualOrParentPath(base.path, parentCandidate.path) &&
			(ignoreFragment || base.toString() === parentCandidate.toString());
	}

	// For other URIs, compare all components
	return isEqualOrParentPath(base.path, parentCandidate.path) &&
		base.toString() === parentCandidate.toString();
}

/**
 * Simple path-based parent/equal check
 */
function isEqualOrParentPath(basePath: string, candidatePath: string): boolean {
	if (basePath === candidatePath) {
		return true;
	}

	// Normalize paths
	basePath = normalizePath(basePath);
	candidatePath = normalizePath(candidatePath);

	// Check if candidate is a parent of base
	return basePath.startsWith(candidatePath + '/') || basePath === candidatePath;
}

/**
 * Normalize path separators
 */
function normalizePath(path: string): string {
	return path.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/\/$/, '');
}