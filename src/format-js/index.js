const fs = require('fs');

fs.readFile('file.txt', "utf-8", function(error, result) {
    const ret = result.replace(/[\r\n]|[\s+]/g, '').split(',').map(item => item.split(':').map(_ => _.replace(/['+]|["+]|[\{]|[\}]/g, ''))).filter(_ => _.length === 2)
    let content = "export default [";
    for (const [prop, label] of ret) {
        content += `\n\t{label: '${label}', prop: '${prop}'},`
    }
    content += '\n]\n';

    fs.writeFile('file.js', content, err => {
        if (err) {
            throw err;
        }
        console.log('done');
    })
})