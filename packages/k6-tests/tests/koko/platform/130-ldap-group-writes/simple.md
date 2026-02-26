# Description

The `130 LDAP group writes` test simulates LDAP write operations by creating a group, adding a user to it, and then deleting the group.


## Procedure

* each `user` logs into the system individually.
* each `user iteration` performs the following steps:
  1. **Login** - Authenticate the user
  2. **Create Group** - Create a new test group with a unique name
  3. **Add User to Group** - Add a randomly selected user to the created group
  4. **Delete Group** - Remove the group from the system

the test runs `N` times for each user, for example if you define `--vus 2` and `--iterations 5`
the testing steps as a whole will run 10 times (5 times per user).


## Available options

* [Shared options](/k6-tests/src/values/env)


## How to run the test

please read [here](/k6-tests/docs/run) how the test can be executed, only the script is different
