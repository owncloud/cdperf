# Description

The `130 LDAP create group add users and delete group` test simulates LDAP write operations by creating a group, adding users to it and then deleting the group.


## Procedure

* the `admin` user logs into the system.
* each `iteration` performs the following steps:
  1. **Login Admin & Load Existing Users** - Authenticate as admin and load all existing users via Graph API
  2. **Create Group** - Admin creates a new test group with a unique name
  3. **Add Users to Group** - Admin adds each resolved user to the created group
  4. **Delete Group** - Admin removes the group from the system

the test runs `N` times, for example if you define `--iterations 5`
the testing steps as a whole will run 5 times.


## Available options

* [Shared options](/k6-tests/src/values/env)


## How to run the test

please read [here](/k6-tests/docs/run) how the test can be executed, only the script is different
