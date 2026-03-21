# Third-Party Icon Sources

WaterApps stores a curated subset of vendor and tool icons for website diagrams, docs, and architecture content.

Refresh script:

- `scripts/fetch_curated_icons.sh`

## Azure

- Source: Microsoft Azure Architecture Icons
- Official page: https://learn.microsoft.com/azure/architecture/icons/
- Package used: `Azure_Public_Service_Icons_V23.zip`

Current subset:

- `azure/10023-icon-service-Kubernetes-Services.svg`
- `azure/10316-icon-service-Policy.svg`
- `azure/10832-icon-service-Auto-Scale.svg`

## AWS

- Source: AWS Architecture Icons
- Official page: https://aws.amazon.com/architecture/icons/
- Package used: `Icon-package_01302026...zip`

Current subset:

- `aws/Virtual-private-cloud-VPC_32.svg`
- `aws/Arch_AWS-Fargate_32.svg`
- `aws/Arch_Amazon-RDS_32.svg`
- `aws/Arch_Amazon-CloudFront_32.svg`
- `aws/Arch_Amazon-CloudWatch_32.svg`

Store only the icon files actively used by production diagrams so the public repo stays tidy.

## GitHub

- Source: GitHub Primer Octicons
- Official page: https://primer.style/octicons/
- Package source used: `@primer/octicons`

Current subset:

- `github/issue-opened-16.svg`
- `github/git-pull-request-16.svg`
- `github/mark-github-16.svg`

## Generic Tooling

- Source: Simple Icons
- Official page: https://simpleicons.org/
- CDN source used: `unpkg.com/simple-icons`

Current subset:

- `simple/kubernetes.svg`
- `simple/terraform.svg`
- `simple/docker.svg`
- `simple/python.svg`
- `simple/n8n.svg`
- `simple/prometheus.svg`
- `simple/grafana.svg`
- `simple/githubactions.svg`
- `simple/postgresql.svg`
- `simple/nginx.svg`
- `simple/react.svg`
- `simple/nodejs.svg`
- `simple/typescript.svg`

## Selection Rule

- Prefer official cloud architecture icons for Azure and AWS services.
- Prefer official GitHub icons for GitHub concepts such as issues, pull requests, and repository state.
- Use Simple Icons for general tools and open-source technologies where a cloud-vendor pack does not apply.
- Keep the pack curated. Add icons with intent, not in bulk.
