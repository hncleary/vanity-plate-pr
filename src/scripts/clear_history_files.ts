import chalk = require('chalk');
import { getDirectoryFilesList } from '../helper_functions/def_files';

const fs = require('fs');
const path = require('path');

/**
 * Script to erase all history files from the database output folder
 * This script will find and delete all files matching the pattern *-history.json
 */
async function clearHistoryFiles(outputDir: string = '../vanity-plate-db/stats-v2/'): Promise<void> {
    try {
        console.log(chalk.blue(`Scanning directory: ${outputDir}`));

        // Check if directory exists
        if (!fs.existsSync(outputDir)) {
            console.log(chalk.red(`Directory does not exist: ${outputDir}`));
            return;
        }

        // Get all files in the directory
        const files = await getDirectoryFilesList(outputDir);

        // Filter for history files (files ending with -history.json)
        const historyFiles = files.filter((file) => file.endsWith('-history.json'));

        if (historyFiles.length === 0) {
            console.log(chalk.yellow('No history files found in the directory.'));
            return;
        }

        console.log(chalk.blue(`Found ${historyFiles.length} history file(s):`));
        historyFiles.forEach((file) => {
            console.log(chalk.gray(`   - ${file}`));
        });

        // Delete each history file
        let deletedCount = 0;
        for (const file of historyFiles) {
            const filePath = path.join(outputDir, file);
            try {
                fs.unlinkSync(filePath);
                console.log(chalk.green(`Deleted: ${file}`));
                deletedCount++;
            } catch (error) {
                console.log(chalk.red(`Failed to delete ${file}: ${error}`));
            }
        }

        console.log(chalk.green(`\nSuccessfully deleted ${deletedCount} out of ${historyFiles.length} history files.`));
    } catch (error) {
        console.error(chalk.red(`Error clearing history files: ${error}`));
        process.exit(1);
    }
}

/**
 * Main function to handle command line arguments
 */
async function main(): Promise<void> {
    const args = process.argv.slice(2);

    // Allow custom output directory as command line argument
    const outputDir = args[0] || '../vanity-plate-db/stats-v2/';

    console.log(chalk.cyan('Vanity Plate PR - History Files Cleanup Script'));
    console.log(chalk.cyan('================================================'));

    // Add trailing slash if not present
    const normalizedOutputDir = outputDir.endsWith('/') ? outputDir : outputDir + '/';

    await clearHistoryFiles(normalizedOutputDir);
}

// Run the script
if (require.main === module) {
    main().catch((error) => {
        console.error(chalk.red('Script failed:'), error);
        process.exit(1);
    });
}

export { clearHistoryFiles };
