import modal
import httpx
import os
import json

# Create the Modal app
app = modal.App("definitelynotai")

# Define the image with dependencies
image = modal.Image.debian_slim(python_version="3.11").pip_install(
    "httpx",
    "anthropic",
    "openai",
)


@app.function(
    image=image,
    timeout=1800,  # 30 minutes max
    secrets=[modal.Secret.from_name("definitelynotai-secrets")],
)
async def run_agent_workflow(project_id: str, prompt: str, platforms: list[str]) -> dict:
    """
    Run the full agent workflow for a project.
    This is called from our TypeScript API when a build is triggered.
    """
    import anthropic

    # Initialize clients
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    # Callback URL to report progress
    callback_url = os.environ.get("CALLBACK_URL", "http://localhost:8787")

    async def report_progress(step: str, message: str, metadata: dict = None):
        """Report progress back to our API"""
        async with httpx.AsyncClient() as http:
            await http.post(
                f"{callback_url}/api/v1/agents/progress",
                json={
                    "projectId": project_id,
                    "step": step,
                    "message": message,
                    "metadata": metadata or {},
                },
                timeout=10,
            )

    try:
        # Step 1: Planning
        await report_progress("planning", "Analyzing requirements...")

        planning_response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=8000,
            messages=[
                {
                    "role": "user",
                    "content": f"""Create a detailed plan for this app:

Prompt: {prompt}
Platforms: {', '.join(platforms)}

Output JSON with: appName, summary, features, dataModels, apiEndpoints""",
                }
            ],
        )

        plan = json.loads(planning_response.content[0].text)
        await report_progress(
            "planning", f"Created plan for {plan.get('appName', 'app')}", {"plan": plan}
        )

        # Step 2: Code Generation
        await report_progress("generating", "Generating code...")

        generation_response = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=16000,
            messages=[
                {
                    "role": "user",
                    "content": f"""Generate TypeScript code for this app:

Plan: {json.dumps(plan)}

Output JSON mapping filename to content.
Include: schema.ts, routes.ts, handlers.ts, components/""",
                }
            ],
        )

        generated_code = json.loads(generation_response.content[0].text)
        await report_progress("generating", f"Generated {len(generated_code)} files")

        # Step 3: Return results (validation happens in E2B)
        return {
            "status": "complete",
            "plan": plan,
            "generatedCode": generated_code,
        }

    except Exception as e:
        await report_progress("failed", str(e))
        return {
            "status": "failed",
            "error": str(e),
        }


@app.function(image=image, timeout=300)
async def health_check() -> dict:
    """Simple health check endpoint"""
    return {"status": "ok", "service": "definitelynotai-modal"}


# Local entrypoint for testing
@app.local_entrypoint()
def main():
    result = health_check.remote()
    print(f"Health check: {result}")
