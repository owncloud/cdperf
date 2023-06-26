Performance Considerations
==========================

Link:
https://jira.owncloud.com/browse/OCIS-1705

## How can we model typical scenarios?

Getting comparable statement about performance of EFSS cloud installations is a non-trivial task.

To solve that, the idea is to model typical scenarios for EFSS cloud installations. That will make it possible to compare clouds objectively in terms of performance and stability.

There needs to be a standardized process to collect data that allows a valid comparison. It needs to be repeatable and clearly specified.

For that, ownCloud developed a tool called cdperf. cdperf is based on [k6](https://k6.io). It automates running certain test setups for currently three different test candidates: ownCloud 10, oCIS and NextCloud.

## Influential Parameters

First, it makes sense to think about all parameters that influence the performance of an EFSS system.

### Hardware

It is important to use capable hardware for the test. Capable means that enough resources on the computer are available for the test, so that during testing no hardware limits are reached. That is especially important if networking is involved.

Tests that should be compared need to be run on the same hardware in the same environment and on the same operating system.

### Machine Setup

Leaving things like hardware and operating system aside, the setup, ie. a virtualization- or bare metal setup, is important. To make it easy to repeat tests with different clouds on the same system, cdperf is using docker to run the cloud installations and the test tool.

By default, it uses the officially provided docker containers of the cloud flavours. The installations within might be a more or less optimal setup.

### Runtime Configuration

Especially for a distributed system like oCIS it is important how the runtime manages the services. Are they run as separate processes, system threads or go co-routines? That influences how many operations can be parallelized and how many processor cores can be used at the same time.

### Concurrent Access

To model a real life scenario of EFSS it is important to mimic parallel access to the system. That means that many virtual users access the cloud independently at the same time.

In addition to that it happens that for example the desktop client runs parallel requests to the server to achieve one job, i.e. a file upload. That triggers PUT requests that run in parallel.

### File Structure

Enterprise file sync and share is about unstructured data, or just files. Obviously the performance of the EFSS system is influenced by

* the amount of files
* their size
* the histogram of the sizes of a set of files
* the amount of directories
* the depth of the file tree

cdperf uses a histogram of file sizes that was seen on ownCloud instances with many users as average.

### Sharing

The amount of shares on the files that are involved in performance metering influences the overall performance, as well as the size of the single involved shares.

Examples:
1. One file shared with 1000 people.
2. A directory with depth 30 and 10,000 files shared with one person.
3. 1000 different file- and/or directory shares in a users file base.

### Request Baseline

Depending on the setup of the whole EFSS system with clients there is a ground noise of requests that happen without any user interaction, mainly through clients that check for availability of the cloud and sync states. This must be considered in performance checks.


