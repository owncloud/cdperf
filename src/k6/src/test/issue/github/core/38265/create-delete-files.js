import http from 'k6/http';
import encoding from 'k6/encoding';
import { check } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js';

// need to specify host and path
const host = ''; // http://localhost';
const path = ''; //core

export let options = {
    iterations: 200000,
    duration: '1000m',
    vus: 10,
};

const createFile = url => {
    const body = 'some content';
    const headers = {
        'Authorization': 'Basic ' + encoding.b64encode('admin:admin'),
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    const response = http.put(url, body, { headers: headers });
    if (response.status === 201 || 204) {
    } else {
        console.log('Error while creating');
        console.log(response.status);
        console.log(response.body);
    }
    check(response, {
        'status is 201': (r) => r.status === 201 || 204,
    });
};

const deleteFile = (url) => {
    const headers = {
        'Authorization': 'Basic ' + encoding.b64encode('admin:admin'),
    };
    const response = http.request('DELETE', url, undefined, { headers: headers });
    if (response.status === 204) {
    } else {
        console.log('Error while deleting');
        console.log(response.status);
        console.log(response.body);
    }
    check(response, {
        'status is 204': (r) => r.status === 204,
    });
};
export default function () {
    const fileName = `${uuidv4()}.txt`;
    const url = `${host}/${path}/remote.php/webdav/${fileName}`;
    createFile(url);
    deleteFile(url);
}
