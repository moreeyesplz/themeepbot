const core = require('@actions/core')
const github = require('@actions/github');
const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');

/*
async function auth() {
    const bot_id = parseInt(core.getInput('bot_id'));
    const install_id = parseInt(core.getInput('bot_install_id'));
    const pkey = core.getInput('bot_key');
    const octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
            id: bot_id,
            privateKey: pkey,
            installationId: install_id,
        }
    });
    await octokit.auth({ type: 'app' });
    return octokit;
}

async function close(owner, repo, commit_sha, author) {
    const octokit = await auth();
    // data is an array of comments
    const { data } = await octokit.repos.listCommentsForCommit({
        owner,
        repo,
        commit_sha,
    });

    core.debug(`Attempting to close meep for ${owner}/${repo}/${commit_sha} on behalf of ${author}`);

    // Scan for the comment from themeepbot[bot]
    for (let i = 0; i !== data.length; ++i) {
        const comment = data[i];
        if (comment.user.login === 'themeepbot[bot]') {
            const lines = comment.body.split('\n');
            if (lines.length === 0) {
                continue;
            }

            // Check that the commit author matches the comment author
            const first = lines[0];
            const name = first.match(/Hey there @(\S+)/);
            if (!name) {
                continue;
            }

            const user = name[1];
            if (user !== author) {
                // Don't handle close requests by users other than the
                // original meeper
                core.debug(`Received close request from ${user} instead of the meeper ${author}`);
                return;
            }

            // Parse the comment body for the issue number
            const last = lines[lines.length - 1];
            const matches = last.match(/meep no\. (\d+)/);
            if (!matches) {
                continue;
            }
            const issue_no = matches[1];
            // Close the corresponding issue in the meeps database
            core.debug(`Locking issue ${issue_no}`);
            octokit.issues.lock({
                owner: 'moreeyesplz',
                repo: 'meeps',
                issue_number: issue_no,
            });
            break;
        }
    }

    core.warning(`No comments found associated with themeepbot for ${owner}/${repo}/${commit_sha}`);
}
*/

function run() {
    core.info('Inputs: ' + JSON.stringify(github.context.payload.inputs));
    const { payload, event } = github.context.payload.inputs;
    core.debug(JSON.stringify(payload));
    core.debug(JSON.stringify(event));

    // The bot only responds to commit comments at the moment
    if (event !== 'commit_comment') {
        return;
    }

    if (!payload) {
        return;
    }

    const { action, comment, repository } = Buffer.from(payload, 'base64');
    core.debug(JSON.stringify(action));
    core.debug(JSON.stringify(comment));
    core.debug(JSON.stringify(repository));
    if (action !== 'created') {
        return;
    }

    if (!comment) {
        return;
    }

    const { user, body, commit_id, } = comment;

    if (user.login === 'themeepbot[bot]') {
        // Don't handle comments made by this bot.
        return;
    }

    const matches = body.match(/\[meep (.*)\]/);
    if (!matches) {
        // No bot command recognized
        return;
    }

    const command = matches[1];
    if (!command) {
        // Empty command specified
        return;
    }

    const args = command.split(' ');
    switch (args[0]) {
        case 'close':
            if (args.length === 1) {
                core.debug(`closing meep ${repository.owner.login}/${repository.name}/${commit_id} for ${user.login}`);
                // close(repository.owner.login, repository.name, commit_id, user.login);
            }
            break;
        default:
            // Unrecognized command
            core.debug(`Received unrecognized command ${command}`);
            return;
    }
}

try {
    run();
} catch (e) {
    core.setFailed(e);
}
