(function () {
    "use strict";

    var DIAGRAMS = {
        "insights-400-enterprise-aws-stack.html": {
            slug: "insights-400-enterprise-aws-stack",
            title: "Stack Delivery Flow",
            description: "How a lean enterprise stack moves from architecture to a cost-governed launch.",
            mermaid: [
                "flowchart LR",
                "A[Requirements and Risk Profile] --> B[Core Modules: VPC ECS RDS CloudFront KMS Monitoring CI/CD]",
                "B --> C[Cost Model and Right Sizing]",
                "C --> D[Security and Compliance Guardrails]",
                "D --> E[Production Release with Evidence]"
            ].join("\n")
        },
        "insights-australian-compliance-baseline.html": {
            slug: "insights-australian-compliance-baseline",
            title: "Compliance Baseline Sequence",
            description: "A practical order for building controls before full certification programs.",
            mermaid: [
                "flowchart LR",
                "A[Data and Risk Mapping] --> B[Identity and Access Controls]",
                "B --> C[Logging and Monitoring Baseline]",
                "C --> D[Policy and Evidence Runbook]",
                "D --> E[Audit Ready Client Delivery]"
            ].join("\n")
        },
        "insights-beyond-apply-button-infrastructure-code.html": {
            slug: "insights-beyond-apply-button-infrastructure-code",
            title: "Infrastructure Code Operating Model",
            description: "How module design, testing, state discipline, and release controls reinforce each other at scale.",
            mermaid: [
                "flowchart LR",
                "A[Provider and Environment Reality] --> B[Service-Oriented Module Boundaries]",
                "B --> C[Remote State and Locking Discipline]",
                "C --> D[Automated Test Pyramid]",
                "D --> E[Versioned Promotion and Release Evidence]"
            ].join("\n")
        },
        "insights-cyber-scan-devsecops-pipeline.html": {
            slug: "insights-cyber-scan-devsecops-pipeline",
            title: "DevSecOps Scan Orchestration",
            description: "Scanning stages aligned to release decisions and false-positive control.",
            mermaid: [
                "flowchart LR",
                "A[Code Commit] --> B[SAST and Secret Scan]",
                "B --> C[Dependency and Container Scan]",
                "C --> D[Risk-Based Gate with Triage]",
                "D --> E[Deploy with Exceptions Logged]"
            ].join("\n")
        },
        "insights-engineering-governance-best-practices.html": {
            slug: "insights-engineering-governance-best-practices",
            title: "Governance to Delivery Flow",
            description: "Governance controls that accelerate engineering throughput instead of stalling it.",
            mermaid: [
                "flowchart LR",
                "A[Strategy and Guardrails] --> B[Reusable Standards and Templates]",
                "B --> C[Automated Checks in CI/CD]",
                "C --> D[Risk-Based Approval Model]",
                "D --> E[Faster and Safer Releases]"
            ].join("\n")
        },
        "insights-finops-50-budget-guardrails.html": {
            slug: "insights-finops-50-budget-guardrails",
            title: "FinOps Guardrail Loop",
            description: "A weekly control loop to keep spend low while preserving delivery speed.",
            mermaid: [
                "flowchart LR",
                "A[Budget Targets and Service Limits] --> B[Deploy Cost-Aware Defaults]",
                "B --> C[Daily Cost Signals and Alerts]",
                "C --> D[Weekly Optimization Decisions]",
                "D --> E[Reinvest Savings into Product Delivery]"
            ].join("\n")
        },
        "insights-iam-access-keys-cicd.html": {
            slug: "insights-iam-access-keys-cicd",
            title: "From Keys to Federated Identity",
            description: "Transition path from static secrets to OIDC-based workload identity.",
            mermaid: [
                "flowchart LR",
                "A[Legacy Access Keys in CI] --> B[Risk and Rotation Overhead]",
                "B --> C[OIDC Federation Setup]",
                "C --> D[Short-Lived Scoped Credentials]",
                "D --> E[Auditable and Keyless Pipeline]"
            ].join("\n")
        },
        "insights-n8n-aiops-platform.html": {
            slug: "insights-n8n-aiops-platform",
            title: "AIOps Automation Pipeline",
            description: "How event signals become remediation workflows with operator visibility.",
            mermaid: [
                "flowchart LR",
                "A[Telemetry and Alert Inputs] --> B[n8n Event Correlation]",
                "B --> C[AI-Assisted Triage]",
                "C --> D[Automated Action with Controls]",
                "D --> E[Ops Feedback and Continuous Tuning]"
            ].join("\n")
        },
        "insights-performance-testing-major-releases.html": {
            slug: "insights-performance-testing-major-releases",
            title: "Release Readiness Performance Flow",
            description: "A practical flow from baseline data to go-live performance decisions.",
            mermaid: [
                "flowchart LR",
                "A[User Load Profile] --> B[Test Environment Baseline]",
                "B --> C[Load and Stress Scenarios]",
                "C --> D[Threshold and Regression Analysis]",
                "D --> E[Go Live Decision Pack]"
            ].join("\n")
        },
        "insights-sas-viya-aks-phase00-infrastructure.html": {
            slug: "insights-sas-viya-aks-phase00-infrastructure",
            title: "SAS Viya Phase 00 Foundation",
            description: "Core infrastructure controls that prevent rework later in the SAS program.",
            mermaid: [
                "flowchart LR",
                "A[Network and Capacity Planning] --> B[AKS Node Pool Segregation]",
                "B --> C[Keyless Identity and Key Vault Controls]",
                "C --> D[Terraform Plan and Approval Workflow]",
                "D --> E[Audit-Ready Platform Foundation]"
            ].join("\n")
        },
        "insights-terraform-apra-regulated.html": {
            slug: "insights-terraform-apra-regulated",
            title: "Terraform Module Governance",
            description: "Module lifecycle pattern for APRA-aligned environments.",
            mermaid: [
                "flowchart LR",
                "A[Control Requirements] --> B[Composable Terraform Modules]",
                "B --> C[Policy and Lint Gates]",
                "C --> D[Versioned Release and Evidence]",
                "D --> E[Reusable Regulated Infrastructure]"
            ].join("\n")
        },
        "insights-test-automation-regulated-cicd.html": {
            slug: "insights-test-automation-regulated-cicd",
            title: "Risk-Based Test Automation Sequence",
            description: "What to automate first when release controls and audit evidence both matter.",
            mermaid: [
                "flowchart LR",
                "A[Release Decision Mapping] --> B[Critical API and Integration Tests]",
                "B --> C[Deployment Smoke Gates]",
                "C --> D[Targeted UI and Performance Checks]",
                "D --> E[Evidence-Backed Release Approval]"
            ].join("\n")
        },
        "insights-zero-trust-networking-aws.html": {
            slug: "insights-zero-trust-networking-aws",
            title: "Zero-Trust Network Control Flow",
            description: "Network segmentation and identity validation tied to continuous monitoring.",
            mermaid: [
                "flowchart LR",
                "A[Workload and Trust Zone Definition] --> B[Identity-Aware Access Policies]",
                "B --> C[East West Traffic Controls]",
                "C --> D[Continuous Monitoring and Alerting]",
                "D --> E[Verified Access for Production]"
            ].join("\n")
        }
    };

    var TRUST_CONTENT = {
        "insights-400-enterprise-aws-stack.html": {
            published: "February 27, 2026",
            lastReviewed: "March 8, 2026",
            sources: [
                { label: "AWS Pricing Calculator", url: "https://calculator.aws/" },
                { label: "AWS Well-Architected Framework", url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html" },
                { label: "AWS Security Pillar", url: "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html" }
            ],
            related: [
                { label: "Enterprise Readiness", url: "enterprise-readiness.html" },
                { label: "Capability Statement", url: "capability-statement.html" },
                { label: "Book a Discovery Call", url: "index.html#contact" }
            ]
        },
        "insights-australian-compliance-baseline.html": {
            published: "March 1, 2026",
            lastReviewed: "March 8, 2026",
            sources: [
                { label: "OAIC: Australian Privacy Principles", url: "https://www.oaic.gov.au/privacy/australian-privacy-principles" },
                { label: "ACSC Essential Eight", url: "https://www.cyber.gov.au/resources-business-and-government/essential-cyber-security/essential-eight" },
                { label: "Privacy Act 1988 (Cth)", url: "https://www.legislation.gov.au/C2004A03712/latest/text" }
            ],
            related: [
                { label: "Enterprise Readiness", url: "enterprise-readiness.html" },
                { label: "Capability Statement", url: "capability-statement.html" },
                { label: "Book a Discovery Call", url: "index.html#contact" }
            ]
        },
        "insights-beyond-apply-button-infrastructure-code.html": {
            published: "March 13, 2026",
            lastReviewed: "March 13, 2026",
            sources: [
                { label: "Terraform Language Documentation", url: "https://developer.hashicorp.com/terraform/language" },
                { label: "Terratest Documentation", url: "https://terratest.gruntwork.io/" },
                { label: "Packer Documentation", url: "https://developer.hashicorp.com/packer/docs" },
                { label: "Yevgeniy Brikman: Terraform Up & Running", url: "https://www.terraformupandrunning.com/" }
            ],
            related: [
                { label: "Terraform Module Design for APRA-Regulated Environments", url: "insights-terraform-apra-regulated.html" },
                { label: "GitHub Best Practices: Features That Actually Improve Delivery", url: "insights-github-best-practices-features.html" },
                { label: "Book a Discovery Call", url: "index.html#contact" }
            ]
        },
        "insights-cyber-scan-devsecops-pipeline.html": {
            published: "March 6, 2026",
            lastReviewed: "March 8, 2026",
            sources: [
                { label: "NIST SSDF (SP 800-218)", url: "https://csrc.nist.gov/pubs/sp/800/218/final" },
                { label: "OWASP ASVS", url: "https://owasp.org/www-project-application-security-verification-standard/" },
                { label: "CISA Known Exploited Vulnerabilities Catalog", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" }
            ],
            related: [
                { label: "Enterprise Readiness", url: "enterprise-readiness.html" },
                { label: "Quality Engineering", url: "quality-engineering.html" },
                { label: "Book a Discovery Call", url: "index.html#contact" }
            ]
        },
        "insights-engineering-governance-best-practices.html": {
            published: "March 1, 2026",
            lastReviewed: "March 8, 2026",
            sources: [
                { label: "DORA Research Program", url: "https://dora.dev/research/" },
                { label: "Google SRE Workbook", url: "https://sre.google/workbook/table-of-contents/" },
                { label: "NIST Cybersecurity Framework 2.0", url: "https://www.nist.gov/cyberframework" }
            ],
            related: [
                { label: "Enterprise Readiness", url: "enterprise-readiness.html" },
                { label: "Capability Statement", url: "capability-statement.html" },
                { label: "Book a Discovery Call", url: "index.html#contact" }
            ]
        },
        "insights-finops-50-budget-guardrails.html": {
            published: "March 6, 2026",
            lastReviewed: "March 8, 2026",
            sources: [
                { label: "FinOps Framework", url: "https://www.finops.org/framework/" },
                { label: "AWS Budgets Documentation", url: "https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html" },
                { label: "AWS Cost Anomaly Detection", url: "https://docs.aws.amazon.com/cost-management/latest/userguide/manage-ad.html" }
            ],
            related: [
                { label: "Enterprise Readiness", url: "enterprise-readiness.html" },
                { label: "Capability Statement", url: "capability-statement.html" },
                { label: "Book a Discovery Call", url: "index.html#contact" }
            ]
        },
        "insights-iam-access-keys-cicd.html": {
            published: "February 27, 2026",
            lastReviewed: "March 8, 2026",
            sources: [
                { label: "AWS IAM Security Best Practices", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html" },
                { label: "GitHub Actions OIDC in AWS", url: "https://docs.github.com/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services" },
                { label: "APRA CPS 234", url: "https://www.apra.gov.au/prudential-standard-cps-234-information-security" }
            ],
            related: [
                { label: "Enterprise Readiness", url: "enterprise-readiness.html" },
                { label: "Quality Engineering", url: "quality-engineering.html" },
                { label: "Book a Discovery Call", url: "index.html#contact" }
            ]
        },
        "insights-n8n-aiops-platform.html": {
            published: "February 27, 2026",
            lastReviewed: "March 8, 2026",
            sources: [
                { label: "n8n Documentation", url: "https://docs.n8n.io/" },
                { label: "n8n Self-Hosting Guide", url: "https://docs.n8n.io/hosting/" },
                { label: "ACSC Essential Eight", url: "https://www.cyber.gov.au/resources-business-and-government/essential-cyber-security/essential-eight" }
            ],
            related: [
                { label: "Enterprise Readiness", url: "enterprise-readiness.html" },
                { label: "Capability Statement", url: "capability-statement.html" },
                { label: "Book a Discovery Call", url: "index.html#contact" }
            ]
        },
        "insights-performance-testing-major-releases.html": {
            published: "February 24, 2026",
            lastReviewed: "March 8, 2026",
            sources: [
                { label: "Google SRE Workbook: Implementing SLOs", url: "https://sre.google/workbook/implementing-slos/" },
                { label: "AWS Builders Library: Load Shedding", url: "https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/" },
                { label: "Azure Well-Architected: Performance Efficiency", url: "https://learn.microsoft.com/azure/well-architected/performance-efficiency/" }
            ],
            related: [
                { label: "Quality Engineering", url: "quality-engineering.html" },
                { label: "Test Automation in Regulated CI/CD", url: "insights-test-automation-regulated-cicd.html" },
                { label: "Book a Discovery Call", url: "index.html#contact" }
            ]
        },
        "insights-sas-viya-aks-phase00-infrastructure.html": {
            published: "March 5, 2026",
            lastReviewed: "March 8, 2026",
            sources: [
                { label: "AKS Node Pools", url: "https://learn.microsoft.com/azure/aks/use-node-pools" },
                { label: "AKS Workload Identity", url: "https://learn.microsoft.com/azure/aks/workload-identity-overview" },
                { label: "Azure Key Vault Security Baseline", url: "https://learn.microsoft.com/security/benchmark/azure/baselines/key-vault-security-baseline" }
            ],
            related: [
                { label: "Enterprise Readiness", url: "enterprise-readiness.html" },
                { label: "Capability Statement", url: "capability-statement.html" },
                { label: "Book a Discovery Call", url: "index.html#contact" }
            ]
        },
        "insights-terraform-apra-regulated.html": {
            published: "February 27, 2026",
            lastReviewed: "March 8, 2026",
            sources: [
                { label: "Terraform Language Documentation", url: "https://developer.hashicorp.com/terraform/language" },
                { label: "Terraform Module Development", url: "https://developer.hashicorp.com/terraform/language/modules/develop" },
                { label: "APRA Prudential Standards", url: "https://www.apra.gov.au/prudential-framework" }
            ],
            related: [
                { label: "Enterprise Readiness", url: "enterprise-readiness.html" },
                { label: "Capability Statement", url: "capability-statement.html" },
                { label: "Book a Discovery Call", url: "index.html#contact" }
            ]
        },
        "insights-test-automation-regulated-cicd.html": {
            published: "February 24, 2026",
            lastReviewed: "March 8, 2026",
            sources: [
                { label: "NIST SSDF (SP 800-218)", url: "https://csrc.nist.gov/pubs/sp/800/218/final" },
                { label: "DORA Research Program", url: "https://dora.dev/research/" },
                { label: "OWASP ASVS", url: "https://owasp.org/www-project-application-security-verification-standard/" }
            ],
            related: [
                { label: "Quality Engineering", url: "quality-engineering.html" },
                { label: "Performance Testing Before Major Releases", url: "insights-performance-testing-major-releases.html" },
                { label: "Book a Discovery Call", url: "index.html#contact" }
            ]
        },
        "insights-zero-trust-networking-aws.html": {
            published: "February 27, 2026",
            lastReviewed: "March 8, 2026",
            sources: [
                { label: "NIST SP 800-207: Zero Trust Architecture", url: "https://csrc.nist.gov/pubs/sp/800/207/final" },
                { label: "CISA Zero Trust Maturity Model", url: "https://www.cisa.gov/zero-trust-maturity-model" },
                { label: "AWS Zero Trust on AWS", url: "https://aws.amazon.com/identity/zero-trust/" }
            ],
            related: [
                { label: "Enterprise Readiness", url: "enterprise-readiness.html" },
                { label: "Capability Statement", url: "capability-statement.html" },
                { label: "Book a Discovery Call", url: "index.html#contact" }
            ]
        }
    };

    function getCurrentFileName() {
        var rawPath = window.location.pathname || "";
        var parts = rawPath.split("/");
        var fileName = parts[parts.length - 1];
        return fileName || "";
    }

    function getMainElement() {
        return document.querySelector("main");
    }

    function buildMetaText(trust) {
        var parts = [];
        if (trust && trust.published) {
            parts.push("Published: " + trust.published);
        }
        if (trust && trust.lastReviewed) {
            parts.push("Last reviewed: " + trust.lastReviewed);
        }
        return parts.join(" | ");
    }

    function hasSectionHeading(main, heading) {
        return Array.prototype.slice.call(main.querySelectorAll("h2")).some(function (el) {
            return el.textContent.trim().toLowerCase() === heading.toLowerCase();
        });
    }

    function upgradePageShell(main) {
        document.body.classList.add("insights-enhanced");

        var children = Array.prototype.slice.call(main.children);
        var hero = children.find(function (child) {
            return child.tagName === "DIV";
        });
        if (hero) {
            hero.classList.add("insight-hero");
        }

        children.forEach(function (child) {
            if (child.tagName === "SECTION") {
                child.classList.add("insight-section");
            }
        });
    }

    function buildDiagramSection(config) {
        var section = document.createElement("section");
        section.className = "bg-white rounded-xl border border-gray-200 p-8 mb-8 insight-diagram-section";
        section.setAttribute("data-insight-visual-flow", "true");

        var header = document.createElement("div");
        header.className = "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6";

        var headerText = document.createElement("div");
        var h2 = document.createElement("h2");
        h2.className = "text-2xl font-semibold mb-2";
        h2.textContent = config.title;

        var p = document.createElement("p");
        p.className = "text-gray-600";
        p.textContent = config.description;

        headerText.appendChild(h2);
        headerText.appendChild(p);

        var badge = document.createElement("span");
        badge.className = "insight-badge";
        badge.textContent = "Visual Flow";

        header.appendChild(headerText);
        header.appendChild(badge);

        var wrapper = document.createElement("div");
        wrapper.className = "insight-mermaid-wrap";

        var mermaidBlock = document.createElement("pre");
        mermaidBlock.className = "mermaid";
        mermaidBlock.textContent = config.mermaid;
        if (config.slug) {
            mermaidBlock.dataset.fallbackSvg = "assets/diagrams/insights/" + config.slug + ".svg";
        }
        wrapper.appendChild(mermaidBlock);

        section.appendChild(header);
        section.appendChild(wrapper);
        return section;
    }

    function injectDiagram(main, config) {
        if (main.querySelector("[data-insight-visual-flow]")) {
            return;
        }

        var sections = Array.prototype.slice.call(main.children).filter(function (child) {
            return child.tagName === "SECTION";
        });
        if (!sections.length) return;

        var target = sections[1] || sections[0];
        var visualSection = buildDiagramSection(config);
        target.insertAdjacentElement("afterend", visualSection);
    }

    function getSectionIntro(title) {
        if (title === "Sources") {
            return "Primary standards, official documentation, and reference material used to support the article.";
        }
        if (title === "Related WaterApps Links") {
            return "Related service pages and supporting insights to help you go deeper on the same delivery problem.";
        }
        return "";
    }

    function buildLinksSection(title, links) {
        var section = document.createElement("section");
        section.className = "bg-white rounded-xl border border-gray-200 p-8 mb-8";

        var h2 = document.createElement("h2");
        h2.className = "text-2xl font-semibold mb-4";
        h2.textContent = title;

        var introText = getSectionIntro(title);
        var intro = null;
        if (introText) {
            intro = document.createElement("p");
            intro.className = "insight-section-intro";
            intro.textContent = introText;
        }

        var list = document.createElement("ul");
        list.className = "list-disc pl-6 text-gray-700 space-y-2 insight-links-list";

        links.forEach(function (item) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.href = item.url;
            a.textContent = item.label;
            a.className = "text-blue-600 hover:text-blue-700 underline";
            if (/^https?:\/\//i.test(item.url)) {
                a.target = "_blank";
                a.rel = "noopener noreferrer";
            }
            li.appendChild(a);
            list.appendChild(li);
        });

        section.appendChild(h2);
        if (intro) {
            section.appendChild(intro);
        }
        section.appendChild(list);
        if (title === "Sources") {
            var note = document.createElement("div");
            note.className = "insight-trust-note";
            note.textContent = "References are selected for direct operational relevance rather than generic reading lists.";
            section.appendChild(note);
        }
        return section;
    }

    function getPrimaryCtaSection(main) {
        return Array.prototype.slice.call(main.children).find(function (child) {
            return (
                child.tagName === "SECTION" &&
                child.className.includes("bg-blue-900") &&
                child.className.includes("text-white")
            );
        });
    }

    function syncHeroMeta(main, fileName) {
        var trust = TRUST_CONTENT[fileName];
        var metaText = buildMetaText(trust);
        if (!metaText) return;

        var hero = Array.prototype.slice.call(main.children).find(function (child) {
            return child.tagName === "DIV";
        });
        if (!hero) return;

        var meta = Array.prototype.slice.call(hero.querySelectorAll("div, p, span")).find(function (el) {
            return (
                el.className.includes("text-sm") &&
                el.className.includes("text-gray-500") &&
                (el.textContent.indexOf("Published:") !== -1 || el.textContent.indexOf("Last reviewed:") !== -1)
            );
        });

        if (meta) {
            meta.classList.add("insight-meta");
            meta.textContent = metaText;
            return;
        }

        var fallbackMeta = document.createElement("div");
        fallbackMeta.className = "mt-4 text-sm text-gray-500 insight-meta";
        fallbackMeta.textContent = metaText;
        hero.appendChild(fallbackMeta);
    }

    function injectTrustSections(main, fileName) {
        var trust = TRUST_CONTENT[fileName];
        if (!trust) return;

        var cta = getPrimaryCtaSection(main);
        var insertedSources = null;

        if (trust.sources && trust.sources.length && !hasSectionHeading(main, "Sources")) {
            insertedSources = buildLinksSection("Sources", trust.sources);
            if (cta) {
                cta.insertAdjacentElement("beforebegin", insertedSources);
            } else {
                main.appendChild(insertedSources);
            }
        }

        if (trust.related && trust.related.length && !hasSectionHeading(main, "Related WaterApps Links")) {
            var relatedSection = buildLinksSection("Related WaterApps Links", trust.related);
            if (insertedSources) {
                insertedSources.insertAdjacentElement("afterend", relatedSection);
            } else if (cta) {
                cta.insertAdjacentElement("beforebegin", relatedSection);
            } else {
                main.appendChild(relatedSection);
            }
        }
    }

    function parseEdge(line) {
        var withLabel = line.match(/^([A-Za-z0-9_]+)\[(.+?)\]\s*-->\|(.+?)\|\s*([A-Za-z0-9_]+)\[(.+?)\]\s*$/);
        if (withLabel) {
            return {
                from: withLabel[2].trim(),
                label: withLabel[3].trim(),
                to: withLabel[5].trim()
            };
        }

        var plain = line.match(/^([A-Za-z0-9_]+)\[(.+?)\]\s*-->\s*([A-Za-z0-9_]+)\[(.+?)\]\s*$/);
        if (plain) {
            return {
                from: plain[2].trim(),
                label: "",
                to: plain[4].trim()
            };
        }
        return null;
    }

    function renderFallbackDiagram(block) {
        var fallbackSvg = block.dataset.fallbackSvg;
        if (fallbackSvg) {
            var image = document.createElement("img");
            image.className = "insight-diagram-image";
            image.src = fallbackSvg;
            image.alt = "Visual flow diagram";
            image.loading = "lazy";
            image.onerror = function () {
                if (image.parentNode) {
                    image.replaceWith(block);
                    renderTextFallback(block);
                }
            };
            block.replaceWith(image);
            return;
        }

        renderTextFallback(block);
    }

    function renderTextFallback(block) {
        var lines = block.textContent
            .split("\n")
            .map(function (line) {
                return line.trim();
            })
            .filter(function (line) {
                return line && !line.toLowerCase().startsWith("flowchart");
            });

        var edges = lines
            .map(parseEdge)
            .filter(function (edge) {
                return edge !== null;
            });

        var fallback = document.createElement("div");
        fallback.className = "mermaid-fallback";
        fallback.setAttribute("role", "img");
        fallback.setAttribute("aria-label", "Process flow diagram");

        if (!edges.length) {
            lines.forEach(function (line) {
                var item = document.createElement("div");
                item.className = "mermaid-line-fallback";
                item.textContent = line;
                fallback.appendChild(item);
            });
            block.replaceWith(fallback);
            return;
        }

        edges.forEach(function (edge) {
            if (edge.label) {
                var label = document.createElement("span");
                label.className = "mermaid-edge-label";
                label.textContent = edge.label;
                fallback.appendChild(label);
            }

            var row = document.createElement("div");
            row.className = "mermaid-flow-row";

            var from = document.createElement("span");
            from.className = "mermaid-node";
            from.textContent = edge.from;

            var arrow = document.createElement("span");
            arrow.className = "mermaid-arrow";
            arrow.textContent = "→";

            var to = document.createElement("span");
            to.className = "mermaid-node";
            to.textContent = edge.to;

            row.appendChild(from);
            row.appendChild(arrow);
            row.appendChild(to);
            fallback.appendChild(row);
        });

        block.replaceWith(fallback);
    }

    function renderMermaidBlocks() {
        var blocks = Array.prototype.slice.call(document.querySelectorAll(".mermaid"));
        if (!blocks.length) return;

        var hasRealMermaid =
            window.mermaid &&
            typeof window.mermaid.initialize === "function" &&
            typeof window.mermaid.run === "function" &&
            typeof window.mermaid.render === "function";

        if (hasRealMermaid) {
            window.mermaid.initialize({
                startOnLoad: false,
                theme: "base",
                securityLevel: "strict",
                flowchart: { useMaxWidth: true, htmlLabels: false },
                themeVariables: {
                    primaryColor: "#dbeafe",
                    primaryBorderColor: "#60a5fa",
                    primaryTextColor: "#1f2937",
                    lineColor: "#2563eb",
                    secondaryColor: "#f8fbff",
                    tertiaryColor: "#eff6ff"
                }
            });

            window.mermaid.run({ nodes: blocks }).catch(function () {
                blocks.forEach(renderFallbackDiagram);
            });
            return;
        }

        blocks.forEach(renderFallbackDiagram);
    }

    function init() {
        var fileName = getCurrentFileName();
        var diagramConfig = DIAGRAMS[fileName];
        var main = getMainElement();

        if (!main) return;
        upgradePageShell(main);

        if (diagramConfig) {
            injectDiagram(main, diagramConfig);
        }

        syncHeroMeta(main, fileName);
        injectTrustSections(main, fileName);
        renderMermaidBlocks();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
