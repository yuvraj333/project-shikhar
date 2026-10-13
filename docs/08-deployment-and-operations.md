# Deployment and Operations

## 1. Purpose

This document defines how to configure, run, deploy, monitor, troubleshoot, roll back, and shut down Shikhar-AI.

The initial deployment target is Google Cloud Run. The prototype should remain simple to operate, cost-conscious, and reproducible.

This document describes the intended deployment procedure. Commands and deployment settings must be validated against the actual repository, Google Cloud project, and selected model provider before being treated as a tested procedure.

## 2. Deployment Principles

- Keep development and production configuration separate.
- Never commit API keys, passwords, service-account keys, or other secrets.
- Use `.env.example` only for variable names and placeholder values.
- Prefer managed services and least-privilege IAM permissions.
- Restrict access to the prototype during demonstrations.
- Apply explicit usage limits and cost alerts.
- Log workflow outcomes without unnecessarily logging sensitive report contents.
- Make deployments reproducible and preserve a known-good revision for rollback.
- Never connect a prototype deployment to real emergency dispatch or public alerting systems.

## 3. Google Cloud Project

Configure the following values before deployment.

| Setting | Configuration |
|---|---|
| Project ID | `YOUR_GCP_PROJECT_ID` |
| Project name | `Shikhar-AI Prototype` |
| Deployment region | `YOUR_SELECTED_REGION` |
| Primary compute | Cloud Run |
| Container registry | Artifact Registry |
| Build service | Cloud Build, if used |
| Model provider | Configured provider; Gemini/Vertex AI only if selected |
| Logging | Cloud Logging |
| Monitoring | Cloud Monitoring |
| Secrets | Secret Manager |
| Access | Restricted demonstration access |

### Region selection

Choose a region that supports the Cloud Run configuration and model services you need. Consider latency, availability, data residency requirements, and pricing.

If Cloud Run and Vertex AI are both used, verify that the selected model is available in the intended region. Do not assume every model is available in every region.

Record the final region in the project configuration and deployment notes. Avoid placing credentials or other sensitive configuration in this document.

## 4. Required APIs and IAM

Enable only the APIs required by the selected architecture.

Potential APIs include:

- Cloud Run Admin API: deploy and manage Cloud Run services.
- Artifact Registry API: store container images.
- Cloud Build API: build images in Google Cloud, if Cloud Build is used.
- Cloud Logging API: access application logs.
- Cloud Monitoring API: create alerts and inspect metrics.
- Secret Manager API: retrieve production secrets.
- Vertex AI API: required only if the application calls a supported Vertex AI model.

Cloud Run deployments can also require access to the Cloud Run and IAM APIs through the applicable deployment tooling. Verify the current Google Cloud setup requirements before deployment.

### Enable APIs

Replace the placeholder project ID before running these commands.

```bash
gcloud config set project YOUR_GCP_PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  secretmanager.googleapis.com
```

If Vertex AI is the selected model provider:

```bash
gcloud services enable aiplatform.googleapis.com
```

Do not enable optional services merely because they appear in this example.

### IAM guidelines

Use separate identities for deployment and runtime where practical.

**Deployment identity** may require permissions to:

- Build or submit container images.
- Push images to the designated Artifact Registry repository.
- Create or update the Cloud Run service.
- Attach the selected runtime service account.
- Configure required service settings.

**Runtime service account** should receive only the permissions needed by the running application, such as access to specifically authorized secrets or the selected Vertex AI resources.

Avoid broad project-wide roles such as Owner or Editor for routine application execution. Permissions vary by deployment method; have an administrator grant the minimum applicable roles.

Do not create or download a long-lived service-account key unless there is a documented, unavoidable need. Prefer Google Cloud-managed identities or short-lived credentials.

## 5. Local Development

### Prerequisites

Install and verify:

- Git
- Python version specified by the repository
- The project's chosen dependency manager
- Docker, if the application uses containerized local development
- Google Cloud CLI, only if required for cloud-related development
- Credentials for the configured model provider, if making real model calls

### Get the source code

```bash
git clone YOUR_REPOSITORY_URL
cd project-shikhar-ai
```

Replace the repository URL and directory name with the actual values. If the repository uses a different name, use that name instead.

### Configure the environment

Create a local environment file based on the example:

```bash
cp .env.example .env
```

Edit `.env` locally. Do not commit it.

Install dependencies using the repository's actual dependency manager and lockfile. For example, if the project uses Python and `requirements.txt`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Run the application using its actual entry point. For example, if the repository uses FastAPI:

```bash
uvicorn app.main:app --reload
```

The command above is illustrative. Replace `app.main:app` with the real module path.

### Run tests

Use the project's configured test commands. For a Python project using pytest:

```bash
pytest
```

Do not deploy until critical schema-validation, inventory arithmetic, uncertainty-preservation, and approval-gate tests pass.

## 6. Environment Variables and Secrets

Maintain a documented environment-variable contract. The following is a template, not a claim that every variable is already implemented.

Example `.env.example`:

```dotenv
APP_ENV=development
APP_HOST=127.0.0.1
APP_PORT=8000
LOG_LEVEL=INFO

GCP_PROJECT_ID=YOUR_GCP_PROJECT_ID
GCP_REGION=YOUR_SELECTED_REGION
GCP_ARTIFACT_REPOSITORY=shikhar-ai

MODEL_PROVIDER=YOUR_CONFIGURED_PROVIDER
MODEL_NAME=YOUR_CONFIGURED_MODEL

# Leave empty for local runs that do not need an external model.
MODEL_API_KEY=

DATABASE_URL=
MAX_REPORT_LENGTH=10000
MAX_AGENT_RETRIES=2
MAX_CONCURRENT_WORKFLOWS=2

ENABLE_EXTERNAL_DELIVERY=false
```

Keep this file aligned with the variables the application actually reads. Remove unused variables rather than allowing configuration to drift.

### Secret handling

- Add `.env` and other local secret files to `.gitignore`.
- Never place real secrets in source code, test fixtures, screenshots, logs, or documentation.
- Use Secret Manager for production secrets when applicable.
- Grant the runtime identity access only to the required secret versions.
- Rotate exposed or compromised credentials immediately.
- Use dummy credentials in examples and demonstrations.
- Prefer workload identity or managed credentials over manually stored cloud credentials.

Example `.gitignore` entries:

```gitignore
.env
.env.*
!.env.example
*.pem
*.key
service-account*.json
```

Review existing ignore rules before adding these entries. Never remove the `.env.example` exception.

### Secret Manager example

Create a secret only when the application requires that credential:

```bash
printf '%s' 'REPLACE_WITH_SECRET' | \
  gcloud secrets create shikhar-model-api-key \
  --data-file=-
```

For an existing secret, add a new version using the appropriate `gcloud secrets versions add` command. Do not paste real credentials into shared terminals or logs.

Configure the Cloud Run runtime identity and secret mapping according to the chosen deployment method. Avoid printing secret values during verification.

## 7. Cloud Run Deployment

### Step 1: Prepare the application

Before deployment:

- Confirm the application starts locally.
- Confirm the container listens on the port provided by the `PORT` environment variable.
- Confirm health endpoints behave as documented.
- Run the automated tests.
- Confirm secrets are not embedded in the image.
- Confirm the service uses simulated incident and inventory data by default.
- Confirm no code path automatically dispatches resources or broadcasts messages.

### Step 2: Create an Artifact Registry repository

Choose a supported repository region and keep it consistent with the deployment plan.

```bash
gcloud artifacts repositories create shikhar-ai \
  --repository-format=docker \
  --location=YOUR_SELECTED_REGION \
  --description="Shikhar-AI prototype container images"
```

If the repository already exists, do not recreate it.

### Step 3: Build and deploy

One possible workflow is to deploy from source using Google Cloud's build tooling:

```bash
gcloud run deploy shikhar-ai \
  --source . \
  --region YOUR_SELECTED_REGION \
  --no-allow-unauthenticated
```

This is a starting example, not a universal command. Verify the required IAM roles, build configuration, runtime identity, environment variables, secret mappings, resource limits, and authentication settings for the actual application.

For a container-based workflow, build and push the image to Artifact Registry, then deploy that image to Cloud Run.

Do not make the service publicly accessible unless public access is an explicit, reviewed requirement. For a prototype demonstration, authenticated access or another appropriately restricted access mechanism is preferable.

### Step 4: Configure runtime settings

Set and verify:

- Runtime service account.
- Required non-secret environment variables.
- Secret references.
- Request timeout.
- Memory and CPU allocation.
- Maximum instance count.
- Concurrency appropriate for the application.
- Authentication and ingress settings.
- Minimum instances, preferably zero for a low-traffic demo unless cold-start requirements justify otherwise.

Begin with conservative resource settings. Increase them only when measurements show they are necessary.

### Step 5: Verify the deployment

Inspect the service:

```bash
gcloud run services describe shikhar-ai \
  --region YOUR_SELECTED_REGION
```

Inspect recent revisions:

```bash
gcloud run revisions list \
  --service shikhar-ai \
  --region YOUR_SELECTED_REGION
```

Verify that:

- The service becomes ready.
- Health checks succeed.
- The application can access the configured model provider.
- An example simulated incident completes the workflow.
- The inventory service produces correct deterministic calculations.
- The review gate prevents unapproved outputs from being treated as approved.
- Failures appear as controlled errors.
- No external communication is sent.

Record the deployed revision and the date of verification.

## 8. Health Checks, Logs, and Error Monitoring

### Health endpoints

If the framework supports it, implement:

- `/healthz`: confirms the process is alive.
- `/readyz`: confirms the application is ready to serve requests.

Keep health endpoints lightweight. Do not expose credentials, stack traces, internal infrastructure details, or sensitive incident information.

A model-provider outage should be reported through application health or dependency status in a way that distinguishes the application's process health from its ability to complete AI workflows.

### Structured logging

Prefer structured log fields such as:

- Timestamp
- Environment
- Service and revision
- Request or correlation ID
- Incident ID or non-sensitive internal identifier
- Workflow stage
- Agent name
- Outcome and error category
- Retry count
- Duration
- Model name and token usage, where available and appropriate

Avoid logging full incident reports, personal information, authentication tokens, API keys, and entire model prompts by default. Use redaction and a documented retention policy.

### Error monitoring

Monitor:

- Application startup failures.
- HTTP 5xx responses.
- Request timeouts.
- Model-provider errors and rate limits.
- Schema-validation failures.
- Inventory-validation failures.
- Workflow retry exhaustion.
- Failed persistence operations.
- Unauthorized review actions.
- Unexpected growth in requests, tokens, or costs.

Use Cloud Logging for investigation and Cloud Monitoring alerts where appropriate. During early development, review logs after each demonstration instead of assuming alerts are already configured.

### Failure behavior

If a model call, inventory lookup, validation step, or database operation fails:

1. Record a sanitized error event.
2. Preserve the original report where safe and appropriate.
3. Mark the workflow with an explicit failure or clarification status.
4. Do not silently substitute fabricated facts or resource quantities.
5. Prevent unsafe progression.
6. Show a clear error to the reviewer.
7. Allow a bounded retry only when appropriate.

## 9. Usage Limits and Cost Management

Cloud costs depend on region, resource configuration, build activity, model choice, input/output tokens, traffic, storage, and logging. A free tier or a small demonstration does not guarantee zero charges.

### Initial demo limits

Use conservative application-level defaults and adjust after measuring actual usage.

| Resource | Initial policy |
|---|---|
| Concurrent workflows | Maximum 2 |
| Automatic correction retries | Maximum 2 after the initial attempt |
| Maximum report size | 10,000 characters |
| Cloud Run minimum instances | 0, unless justified |
| Cloud Run maximum instances | Set an explicit low cap |
| Model calls | Bound calls per workflow |
| Model output | Set an appropriate output-token limit |
| External delivery | Disabled |
| Demo data | Simulated reports and mock inventory only |

These are proposed prototype defaults. Enforce them in code and deployment settings; listing a limit in documentation does not enforce it.

### Per-demo cost estimate

Do not publish a precise dollar estimate until the model, region, request volume, and Cloud Run configuration are known.

Calculate the estimated cost using:

**Total demo cost = Cloud Run usage + model usage + build and registry usage + logging and monitoring + storage and other billable services.**

For model usage, estimate:

- Number of workflows.
- Average input tokens per workflow.
- Average output tokens per workflow.
- Number of calls per workflow, including retries.
- Published pricing for the selected model and region.

For Cloud Run, estimate active compute time, memory, request volume, and any other applicable charges. Include Artifact Registry storage and Cloud Build usage where applicable.

Before a demonstration:

1. Review current prices in the selected region.
2. Estimate expected usage.
3. Set a budget and budget alerts.
4. Set application-level usage caps.
5. Review actual billing after the demonstration.

Budget alerts notify you about spending; they do not necessarily stop services or prevent further charges. Application limits and resource configuration are separate controls.

## 10. Rollback Procedure

Use rollback if a new revision causes startup failures, schema incompatibilities, incorrect resource calculations, broken review controls, or other critical regressions.

1. Stop or restrict demonstration traffic if there is a safety or data-integrity issue.
2. Identify the last known-good Cloud Run revision.
3. Confirm that it is compatible with the current database schema and configuration.
4. Shift traffic back to that revision.
5. Verify health checks and a simulated end-to-end workflow.
6. Confirm that the approval gate and external-delivery restrictions still work.
7. Record the incident, affected revision, root cause, and corrective action.

Example revision inspection:

```bash
gcloud run revisions list \
  --service shikhar-ai \
  --region YOUR_SELECTED_REGION
```

After identifying the exact revision name:

```bash
gcloud run services update-traffic shikhar-ai \
  --region YOUR_SELECTED_REGION \
  --to-revisions EXACT_KNOWN_GOOD_REVISION=100
```

Replace the placeholder with the actual revision name. Do not guess revision names.

If a deployment includes database migrations, review backward compatibility before rolling back. A traffic rollback alone cannot reverse destructive data changes.

## 11. Teardown

After the demonstration or experiment, remove resources that are no longer needed.

### Remove the Cloud Run service

```bash
gcloud run services delete shikhar-ai \
  --region YOUR_SELECTED_REGION
```

### Remove an Artifact Registry repository

Only after confirming that the images are no longer needed:

```bash
gcloud artifacts repositories delete shikhar-ai \
  --location YOUR_SELECTED_REGION
```

### Review remaining resources

Check for:

- Other Cloud Run services and revisions.
- Artifact Registry images and repositories.
- Cloud Build history and stored artifacts.
- Secrets and secret versions.
- Service accounts and IAM bindings created for the project.
- Databases, storage buckets, or networking resources, if any were added.
- Log retention and monitoring resources.
- Budget alerts and scheduled jobs.

Delete only resources that belong to this prototype and are no longer needed. Preserve evidence required for debugging, billing review, or audit purposes.

Deleting a service or repository does not necessarily delete all associated data, secrets, logs, or billable resources. Confirm the remaining resources in the Google Cloud Console or with the appropriate CLI commands.

For a complete shutdown, review the project inventory and billing page. Disable APIs only after verifying that no remaining resource or service depends on them. Deleting the entire Google Cloud project is a last resort and requires explicit confirmation that its other resources and data are no longer needed.

## 12. Operational Checklist

### Before deployment

- [ ] Tests pass locally.
- [ ] `.env` and credentials are excluded from version control.
- [ ] Only necessary APIs are enabled.
- [ ] IAM follows least privilege.
- [ ] Cloud Run authentication and ingress are appropriate.
- [ ] Model and Cloud Run limits are configured.
- [ ] Simulated data is clearly labeled.
- [ ] External dispatch and broadcasting remain disabled.
- [ ] Budget alerts and cost controls have been reviewed.

### Before each demo

- [ ] Health and readiness checks pass.
- [ ] The intended revision is deployed.
- [ ] A known-good scenario completes successfully.
- [ ] Failure scenarios have clear outcomes.
- [ ] Inventory arithmetic and uncertainty handling are correct.
- [ ] Human approval is enforced.
- [ ] No unexpected external integrations are active.

### After each demo

- [ ] Review logs and errors.
- [ ] Record actual usage and cost when available.
- [ ] Capture evaluation results without inventing metrics.
- [ ] Remove temporary resources when no longer needed.
- [ ] Record deployment changes and unresolved issues.

## 13. Status and Definition of Done

This document defines the deployment plan. Mark an item as implemented only after its configuration has been applied and verified.

Deployment readiness requires a reproducible build, successful health checks, restricted access, protected secrets, bounded resource use, observable errors, a tested rollback path, and a documented teardown process.
