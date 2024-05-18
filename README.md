Lambda Repo is a serverless [Maven repository](https://maven.apache.org/guides/introduction/introduction-to-repositories.html)
built for AWS. You deploy your own copy to host your Maven artifacts, and it can be set up in just a couple of minutes.

Lambda Repo is useful for small teams or for individuals who work across more than one machine. You can use it to push
snapshots or releases to a remote location to share artifacts. Previously that required a server running all the
time which is a waste of resources if you're not interacting with the repository very often.

### 🤔 Why should I not use Lambda Repo?

It's serverless so may suffer from
[cold starts](https://docs.aws.amazon.com/lambda/latest/operatorguide/execution-environments.html), i.e. requests might be
slower.

Pricing with a traditional server is usually more predictable.

Alternatives to consider: [JFrog Artifactory](https://jfrog.com/artifactory/),
[Sonatype's Nexus](https://www.sonatype.com/products/sonatype-nexus-repository), [JitPack](https://jitpack.io/).

### 💵 Services and Cost

Most services are available on the AWS free tier. For reasonable usage you won't pay anything. If your
bill is non-zero but less than a few cents, AWS usually waive it too.

- [Lambda](https://aws.amazon.com/lambda/pricing/) - Always free up to 1M invocations per month
- [S3](https://aws.amazon.com/s3/pricing/) - Up to 5GB free for the first year, then
  - Storage: $0.02 per GB per month
  - HTTP PUT: $0.005 per 1000 requests
- [API Gateway](https://aws.amazon.com/api-gateway/pricing/) - Free for the first year, then $3.50 per million requests
- [Data transfer](https://aws.amazon.com/ec2/pricing/on-demand/)
  - Out: Always 100GB free per month
  - In: free
- [CloudFormation](https://aws.amazon.com/cloudformation/pricing/) - Always free

Prices depend on region and may change over time. This is just an indication.

### 💿 Installation

TODO
