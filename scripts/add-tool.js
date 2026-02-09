const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const toolsPath = path.join(__dirname, '../data/tools.json');
const tools = require(toolsPath);

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer));
    });
}

async function addTool() {
    console.log('--- Add New AI Tool ---');

    const name = await ask('Tool Name: ');
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const tagline = await ask('Tagline: ');
    const website = await ask('Website URL: ');
    const category = await ask('Category (Writing, Images, Video, Audio, Productivity, Marketing, Coding, etc): ');
    const pricing = await ask('Pricing (Freemium, Free, Paid, Free Trial): ');
    const description = await ask('Description: ');

    const tool = {
        id,
        name,
        tagline,
        category,
        website,
        affiliateUrl: website, // Default to website
        description,
        featured: false,
        pricing,
        freeTrial: pricing.toLowerCase().includes('trial') || pricing.toLowerCase().includes('freemium'),
        logo: `/logos/${id}.svg`, // Placeholder
        features: [],
        tags: [category.toLowerCase()],
        useCases: [],
        pros: [],
        cons: []
    };

    console.log('\nPreview:');
    console.log(tool);

    const confirm = await ask('\nSave this tool? (y/n): ');

    if (confirm.toLowerCase() === 'y') {
        tools.unshift(tool); // Add to beginning
        fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2));
        console.log(`\nSuccess! Added ${name} (${id}) to tools.json`);
    } else {
        console.log('\nCancelled.');
    }

    rl.close();
}

addTool();
