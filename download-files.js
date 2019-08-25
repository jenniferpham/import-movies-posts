const fs = require('fs');
const csv = require('csvtojson');
const request = require('request');

var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};


const csvFilePath = './data/movies-test.csv';

csv().fromFile(csvFilePath).then((movies) => {
    // Convert CSV to JSON
    fs.writeFileSync('./data/movies-data.json', JSON.stringify(movies));

    // loop through movies json
    // use template and keep appending to file
    for (let movie of movies) {
        const moviePostName = movie.title.toLowerCase().replace(/\s/g, "-").replace(/[!@#$%^&*]/g, "");
        const columnName = "FILM STILL 1";
        const photoUrl = movie[columnName];
        const extension = getExtension(photoUrl);
        const newFileName = `./files-to-upload/${moviePostName}-director.${extension}`;

        console.log('moviePostName', moviePostName);
        console.log('photoUrl', photoUrl);
        console.log('newFileName', newFileName);

        download(photoUrl, newFileName, function () {
            console.log('done' + photoUrl);
        });
    };
});

function getExtension(filename) {
    return filename.split('.').pop();
}