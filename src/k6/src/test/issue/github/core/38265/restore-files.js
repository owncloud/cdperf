// Restore files
import http from 'k6/http';
import encoding from 'k6/encoding';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js';

// need to specify host and path
const host = ''; // http://localhost';
const path = ''; //core

// variables
const vus = 10;
const iterations = 20000; // iteration per vu
const chunkingSize = 20000;
const maxDuration = '6000m';

export let options = {
    scenarios: {
        restore: {
            executor: 'per-vu-iterations',
            vus: vus,
            iterations: iterations,
            maxDuration: maxDuration,
        },
    },
};

// This function is used to chunk a large array into a group of smaller arrays
const chunkArray = (array, size) => {
    let result = [];
    for (let i = 0; i < array.length; i += size) {
        let chunk = array.slice(i, i + size);
        result.push(chunk);
    }
    return result;
};

// returns a chunked array of file id of files in trashbin
export function setup() {
    let fileIds = [];
    const propfindHeader = {
        'Authorization': 'Basic ' + encoding.b64encode('admin:admin'),
    };
    const propfindUrl = `${host}/${path}/remote.php/dav/trash-bin/admin`;
    const propfindBody = '<?xml version="1.0"?>\n' +
        '<d:propfind xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">\n' +
        '    <!-- retrieve the file\'s id -->\n' +
        '    <d:prop><oc:trashbin-original-filename /></d:prop>\n' +
        '</d:propfind>';
    try {
        const propfindResponse = http.request('PROPFIND', propfindUrl, propfindBody, {
            headers: propfindHeader,
            timeout: 180000,
        });
        // extracting file id from the response
        const regex = /<d:href>\/core1\/remote\.php\/dav\/trash-bin\/admin\/(?<id>\d+)<\/d:href>/gm;
        let m;
        while ((m = regex.exec(JSON.stringify(propfindResponse))) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            fileIds.push(m[1]);
        }
    } catch (e) {
        console.log(e);
    }
    return chunkArray(fileIds, chunkingSize);
}

const restoreFile = fileId => {
    const fileName = `${uuidv4()}.txt`;
    const headers = {
        'Overwrite': 'F',
        'Destination': `${host}/${path}/remote.php/dav/files/admin/${fileName}`,
        'Authorization': 'Basic ' + encoding.b64encode('admin:admin'),
    };

    const url = `${host}/${path}/remote.php/dav/trash-bin/admin/${fileId}/`;

    const response = http.request('MOVE', url, undefined, { headers: headers });
    check(response, {
        'status is 201': (r) => r.status === 201,
    });
    if (response.status === 201) {
    } else {
        console.log(response.status);
        console.log(response.body);
    }
};

export default function(fileIdArrays) {
    // Since all the 10 VU cannot restore the same file(blocking), fileIds array is divided into 10 chunks
    // and each VU will restore file from their respecive chunk
    switch (__VU) {
        case 1:
            restoreFile(fileIdArrays[0][__ITER]);
            break;
        case 2:
            restoreFile(fileIdArrays[1][__ITER]);
            break;
        case 3:
            restoreFile(fileIdArrays[2][__ITER]);
            break;
        case 4:
            restoreFile(fileIdArrays[3][__ITER]);
            break;
        case 5:
            restoreFile(fileIdArrays[4][__ITER]);
            break;
        case 6:
            restoreFile(fileIdArrays[5][__ITER]);
            break;
        case 7:
            restoreFile(fileIdArrays[6][__ITER]);
            break;
        case 8:
            restoreFile(fileIdArrays[7][__ITER]);
            break;
        case 9:
            restoreFile(fileIdArrays[8][__ITER]);
            break;
        case 10:
            restoreFile(fileIdArrays[9][__ITER]);
    }
    sleep(0.5);
}