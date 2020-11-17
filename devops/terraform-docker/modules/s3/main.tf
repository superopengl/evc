resource "aws_s3_bucket" "easyvaluecheck_net" {
  bucket = "easyvaluecheck.net"

  website {
    redirect_all_requests_to = "easyvaluecheck.com"
  }
}


resource "aws_s3_bucket" "evc_web" {
  bucket = "evc-web"

  policy = <<POLICY
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "1",
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::evc-web/*"
        },
        {
            "Sid": "2",
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::evc-web"
        }
    ]
}
POLICY

  website {
    index_document = "index.html"

    routing_rules = <<EOF
[
    {
        "Condition": {
            "HttpErrorCodeReturnedEquals": "404"
        },
        "Redirect": {
            "HostName": "easyvaluecheck.com",
            "ReplaceKeyWith": ""
        }
    }
]
EOF
  }

  provisioner "local-exec" {
    command = "aws s3 sync '${abspath(path.module)}/../../../../evc-web/build' s3://${aws_s3_bucket.evc_web.id}"
  }
}


# variable "mime_types" {
#   default = {
#     htm  = "text/html"
#     html = "text/html"
#     css  = "text/css"
#     ttf  = "font/ttf"
#     js   = "application/javascript"
#     map  = "application/javascript"
#     json = "application/json"
#   }
# }

# resource "aws_s3_bucket_object" "upload_website_files" {
#   for_each     = fileset("${path.module}/../../../evc-web/build/" , "**/*")
#   bucket       = aws_s3_bucket.evc_web.bucket
#   key          = replace(each.value, "${path.module}/../../../evc-web/build/" , "")
#   source       = "${path.module}/../../../evc-web/build/${each.value}"
#   acl          = "public-read"
#   etag         = filemd5("${path.module}/../../../evc-web/build/${each.value}")
#   content_type = lookup(var.mime_types, split(".", each.value)[length(split(".", each.value)) - 1])
# }

