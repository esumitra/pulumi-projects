#
# Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance
# with the License. A copy of the License is located at
#
#      http://aws.amazon.com/asl/
#
# or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
# OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
# and limitations under the License.
#

# Instructions to run on EMR Serverless
# 1. copy one or more input files from s3://us-east-1.elasticmapreduce/emr-containers/samples/wordcount/input to the S3 input path
#  e.g., s3://es-emr-data/emr-serverless-spark/input
# 2. copy the script to the S3 location
#  e.g., s3://es-emr-data/scripts/wordcount.py
# 3. create a new job to execute on the EMR serverless application
# aws emr-serverless start-job-run \
#     --application-id $EMR_APP_ID \
#     --execution-role-arn $EMR_JOB_ROLE_ARN \
#     --name wordCountPython \
#     --job-driver '{
#         "sparkSubmit": {
#           "entryPoint": "s3://es-emr-data/scripts/wordcount.py",
#           "entryPointArguments": ["s3://es-emr-data/emr-serverless-spark/input", "s3://es-emr-data/emr-serverless-spark/output"],
#           "sparkSubmitParameters": "--conf spark.executor.cores=1 --conf spark.executor.memory=4g --conf spark.driver.cores=1 --conf spark.driver.memory=4g --conf spark.executor.instances=1"
#         }
#     }'


import os
import sys
import pyspark.sql.functions as F
from pyspark.sql import SparkSession

if __name__ == "__main__":
    """
        Usage: wordcount [input_path] [destination_path]
    """
    output_path = None
    if len(sys.argv) > 1:
        input_path = sys.argv[1]
    else:
        print("S3 input location not specified; exiting program")
        sys.exit(1)

    if len(sys.argv) > 2:
        output_path = sys.argv[2]
    else:
        print("S3 output location not specified printing top 10 results to output stream")
        
    print(f"input_path: {input_path} , output_path: {output_path}")

    spark = SparkSession\
        .builder\
        .appName("WordCount")\
        .getOrCreate()


    
    text_file = spark.sparkContext.textFile(input_path)
    counts = text_file.flatMap(lambda line: line.split(" ")).map(lambda word: (word, 1)).reduceByKey(lambda a, b: a + b).sortBy(lambda x: x[1], False)
    counts_df = counts.toDF(["word","count"])

    if output_path:
        counts_df.write.format('csv').option('header','true').mode("overwrite").save(output_path)
        print("WordCount job completed successfully. Refer output at S3 path: " + output_path)
    else:
        counts_df.show(10, False)
        print("WordCount job completed successfully.")

    spark.stop()
