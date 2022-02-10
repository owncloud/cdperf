
## cdperf Tests

This lists and briefly explains the tests that are done in the K6 based test framework cdperf.

### Most used file sizes upload

Script: `/root/cdperf/tests/k6/test-issue-github-enterprise-4115-most-used-sizes-upload.js`

This test creates a pattern of the so called *most used file sizes*. It contains a collection of test files in sizes how we find them in typical larger ownCloud installations. Specifically, that contains 84% files with a size smaller than 1MB, 12.5% files between 1MB and 10MB, 3% files between 1MB and 100MB and 0.8% files larger than 100MB.

The files are created, uploaded, downloaded and afterwards deleted in this test. The current implementation tests with in total 15GB data per User.

This simulates a "normal" upload/download scenario with a common file set.

### Deep Propfind

Script: `/root/cdperf/tests/k6/test-issue-github-ocis-1018-propfind-deep.js`

This test creates a nested directory structure that is five levels deep and distributes 1000 files within that tree.

The files are created and uploaded. After that, one PROPFIND on the top directory is done.

This simulates the ETag check of a large nested directory.

### Flat Propfind

Script: `/root/cdperf/tests/k6/test-issue-github-ocis-1018-propfind-flat.js`

This test crates many (1000 a 1kB) files in the root of the cloud.

The files are uploaded and afterwards, a PROPFIND to the root directory is done.

This test gives an indication on the PROPFIND speed for a larger structure of nested folders and files and also measures the pure upload speed of small files.

### Upload Big Files

Script: `/root/cdperf/tests/k6/test-issue-github-ocis-1018-upload-download-delete-many-large.js`

In total this test creates 5 GB of files which distributes from 5 MB up to 1 GB per file.

The files are uploaded, downloaded and deleted afterwards.

This gives indication about the transmission speed of big files.

### Upload Small Files

Script: `/root/cdperf/tests/k6/test-issue-github-ocis-1018-upload-download-delete-many-small.js`

This test creates files between 500 kB and 25 MB, with a total size of 1.7 GB.

The files are uploaded, downloaded and deleted.

This measures the up- and download speed of smaller files.

### Up- and Download with New User

Script: `/root/cdperf/tests/k6/test-issue-github-ocis-1018-upload-download-delete-with-new-user.js`

This script creates a small amount of 1 kB files.

The files are uploaded, downloaded and deleted with a freshly created user.

### Propfind and Rename

Script: `/root/cdperf/tests/k6/test-issue-github-ocis-1399-propfind-deep-rename.js`

The script creates 50 folders in the root with in sum 10 MB content files.

The folders and files are uploaded, renamed and after the rename, a PROPFIND is done.

This reflects the behaviour of renames of folders.

### Share with User

This script creates a folder and provisions the folder with some files right after.

Right after the the test folder is uploaded, it will be shared with a different user. With the share receiver, the files are downloaded. Finally the share is removed and the user and files are deleted.

This reflects the transmission performance of shared folders.

