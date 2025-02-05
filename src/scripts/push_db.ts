import { getSummaryCollectionFromFile } from '../helper_functions/def_files';

const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

async function run(command: string) {
    try {
        const { stdout, stderr } = await execAsync(command);
        console.log('stdout:', stdout);
        console.error('stderr:', stderr);
    } catch (err) {
        console.error('Error:', err);
    }
}

async function main() {
    const collection = await getSummaryCollectionFromFile('../vanity-plate-db/stats-v2/');
    console.log('db_summary time:', collection.timeRetrieved);
    await run(`cd ../vanity-plate-db/ && git add . && git commit -m "${collection.timeRetrieved}" && git push`);
}

main();
