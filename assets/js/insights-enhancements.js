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

    function getCurrentFileName() {
        var rawPath = window.location.pathname || "";
        var parts = rawPath.split("/");
        var fileName = parts[parts.length - 1];
        return fileName || "";
    }

    function getMainElement() {
        return document.querySelector("main");
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

        renderMermaidBlocks();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
