import * as core from "@actions/core";

/**
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
	try {
		//
	} catch (error) {
		// Fail the workflow run if an error occurs
		if (error instanceof Error) core.setFailed(error.message);
	}
}
