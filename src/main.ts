import * as core from "@actions/core";
import * as github from "@actions/github";

/**
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
	try {
		const githubToken = core.getInput("github-token");
		const octokit = github.getOctokit(githubToken);

		const workflowRun = await octokit.rest.actions.getWorkflowRun({
			owner: github.context.repo.owner,
			repo: github.context.repo.repo,
			run_id: github.context.payload.workflow_run.id,
		});

		const commitSHA = workflowRun.data.head_sha;

		const PRs = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
			owner: github.context.repo.owner,
			repo: github.context.repo.repo,
			commit_sha: commitSHA,
		});

		const mergedPRs = PRs.data.filter((pr) => !!pr.merged_at);

		if (mergedPRs.length === 0) {
			core.setFailed(`No PRs found for commit ${commitSHA}`);
			return;
		}
		if (mergedPRs.length >= 2) {
			const msg = `commit: ${commitSHA}, merged PRs: ${mergedPRs.map((pr) => pr.number).join(", ")}`;
			core.debug(msg);
			core.setFailed("Multiple merged PRs found associated with commit, not sure what to do..");
			return;
		}

		const PR = mergedPRs[0];
		const labels = PR.labels.map((label) => label.name);

		core.debug(`PR labels: ${labels.join(", ")}`);
		core.setOutput("labels", labels);
	} catch (err) {
		if (err instanceof Error) {
			core.setFailed(err.message);
		} else {
			core.debug(err as any);
			core.setFailed("Unknown error");
		}
	}
}
