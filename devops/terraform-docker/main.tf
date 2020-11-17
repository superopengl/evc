terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 2.70"
    }
  }
}

provider "aws" {
  profile = var.aws_profile
  region  = var.aws_region
}

provider "aws" {
  # us-east-1 instance
  region = "us-east-1"
  alias  = "useast1"
}

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

  # provisioner "local-exec" {
  #   command = "aws s3 sync '${abspath(path.module)}/../../../../evc-web/build' s3://${aws_s3_bucket.evc_web.id}"
  # }
}


resource "aws_acm_certificate" "evc_certificate" {
  provider    = "aws.useast1"
  domain_name = "easyvaluecheck.com"
  subject_alternative_names = [
    "easyvaluecheck.net",
    "techseeding.com.au"
  ]
  validation_method = "DNS"
}

resource "aws_cloudfront_distribution" "evc_web" {
  origin {
    domain_name = aws_s3_bucket.evc_web.bucket_regional_domain_name
    origin_id   = "S3-evc-web"
  }

  comment             = "EVC frontend CDN"
  enabled             = true
  default_root_object = "index.html"
  aliases =[
    "easyvaluecheck.com",
    "www.easyvaluecheck.com"
  ]

  default_cache_behavior {
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    // This needs to match the `origin_id` above.
    target_origin_id = "S3-evc-web"
    min_ttl          = 86400
    default_ttl      = 86400
    max_ttl          = 86400

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.evc_certificate.arn
    ssl_support_method  = "sni-only"
  }
}

data "aws_route53_zone" "evc_dotcom_zone" {
  provider = "aws.useast1"
  name = "easyvaluecheck.com"
  private_zone = false
}

resource "aws_route53_record" "evc_dotcom_root_record" {
  zone_id = data.aws_route53_zone.evc_dotcom_zone.zone_id
  name = "easyvaluecheck.com"
  type = "A"

  alias {
    name = aws_cloudfront_distribution.evc_web.domain_name
    zone_id = aws_cloudfront_distribution.evc_web.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "evc_dotcom_www_record" {
  zone_id = data.aws_route53_zone.evc_dotcom_zone.zone_id
  name = "www"
  type = "A"

  alias {
    name = aws_route53_record.evc_dotcom_root_record.name
    zone_id = data.aws_route53_zone.evc_dotcom_zone.zone_id
    evaluate_target_health = false
  }
}
