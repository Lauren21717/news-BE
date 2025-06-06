const fs = require('fs/promises');

exports.selectEndpoints = async () => {
    const data = await fs.readFile('./endpoints.json', 'utf8');
    return JSON.parse(data);
};