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
4. Run the deploy workflow with `dry_run = false` to upload the stamped site bundle to S3.
5. Validate the CloudFront hostname first.
6. Update Cloudflare DNS/proxy to point production traffic at CloudFront.
7. Disable GitHub Pages only after cutover is confirmed healthy.

## Release Artifact Model

The deployment path now produces a stamped bundle rather than an anonymous copy of the working tree.

Each bundle contains:
- `release.json`
- `release.txt`

CloudFront deploys also keep an immutable copy at:

`s3://<frontend-bucket>/releases/<commit-sha>/`

The bucket root still serves the active site, but the `releases/` prefix provides:
- commit-level rollback targets
- evidence of what was deployed
- a stable way to compare live content against a known artifact

Use `https://www.waterapps.com.au/release.json` to verify the currently served release metadata after deployment.

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
3. if the infrastructure is healthy but the current bundle is bad, redeploy a previously known-good `ref` or restore the matching bundle from `releases/<commit-sha>/`
4. fix the CloudFront stack or deploy pipeline
5. retry cutover only after revalidation
