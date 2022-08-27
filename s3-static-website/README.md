# A static website hosted in AWS S3
The project contains the infrastructure code to host a static website in an S3 bucket.

## Create and update Infrastructure
1. Create bucket and file 

Run `pulumi up` and select yes

Sample output

[<img src="./images/pulumi-create.png" width="400"/>](./images/pulumi-create.png)

Verify content using
```
curl $(pulumi stack output bucketEndpoint)
```


2. Update content
Run `pulumi up` and select yes

Sample output
[<img src="./images/pulumi-update.png" width="400"/>](./images/pulumi-update.png)


3. Delete Infrastructure
Run `pulumi destroy` and select yes

Sample output

[<img src="./images/pulumi-destroy.png" width="400"/>](./images/pulumi-destroy.png)

## Infrastructure Setup Steps
1. Create a bucket with wesite configuration
2. For each file in target folder,
   
   if folder, recurse into folder

   if file, create a bucket object with content from source file

## License
Copyright 2022, Edward Sumitra

Licensed under the MIT License.
