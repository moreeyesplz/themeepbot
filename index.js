const core = require('@actions/core')
const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');

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
}

auth();

const { payload, event } = github.context.payload.inputs;
core.debug(`payload: ${payload}`);
core.debug(`event: ${event}`);

if (payload) {
    const decoded = Buffer.from(payload, 'base64');
    core.debug(JSON.parse(decoded));
}