# Deployment Guide

Status: Draft v2  
Last updated: 2026-03-21

## Current Production State

Production is currently restored through GitHub Pages behind Cloudflare.

This is the short-term recovery path only. The target state is:

`private source repo -> GitHub Actions -> S3 -> CloudFront -> Cloudflare -> users`

## CloudFront Deployment Workflow

The repo includes a manual workflow at `.github/workflows/deploy-cloudfront.yml`.

Required repository configuration:

- Secret: `AWS_OIDC_ROLE_ARN`
- Variable: `AWS_REGION` (default `ap-southeast-2` if omitted)
- Variable: `WATERAPPS_FRONTEND_S3_BUCKET`
- Variable: `WATERAPPS_CLOUDFRONT_DISTRIBUTION_ID`

## Safe Rollout Sequence

1. Keep GitHub Pages live until the CloudFront path is validated.
2. Build and package the site with a workflow dry run.
3. Create the S3 + CloudFront infrastructure from the owning infra repo.
4. Run the deploy workflow with `dry_run = false` to upload the site bundle to S3.
5. Validate the CloudFront hostname first.
6. Update Cloudflare DNS/proxy to point production traffic at CloudFront.
7. Disable GitHub Pages only after cutover is confirmed healthy.

## Pre-Deploy Checks

Before any CloudFront deploy:

1. run `bash scripts/check-site.sh`
2. run `npm run build:css`
3. run `node --test tests/portal-auth.test.js`
4. confirm the S3 bucket and CloudFront distribution variables match the production frontend stack

## Rollback

If the CloudFront cutover fails:

1. point Cloudflare traffic back to the GitHub Pages origin
2. keep the repo public until the site is stable again
3. fix the CloudFront stack or deploy pipeline
4. retry cutover only after revalidation
