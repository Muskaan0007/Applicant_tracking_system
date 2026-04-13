"""
services/agent.py
Multi-step Grok AI agent for resume processing.
Each step sends a fresh, focused request to avoid token limit issues.
"""
import json
import re
from services.pdf_parser import extract_text_from_pdf
from services.grok_client import chat


def _log(log: list, step: str, role: str, content: str):
    log.append({"step": step, "role": role, "content": content})


def _truncate(text: str, max_chars: int = 3000) -> str:
    """Truncate text to avoid hitting token limits."""
    return text[:max_chars] + "..." if len(text) > max_chars else text


def run_resume_agent(application) -> None:
    """
    Runs 4 Grok AI steps and saves results to the Application model.
    """
    agent_log = []

    # ── 0. Extract PDF text ───────────────────────────────────
    pdf_path = application.resume.path
    resume_text = extract_text_from_pdf(pdf_path)

    if not resume_text or len(resume_text.strip()) < 20:
        resume_text = "No readable text found in the uploaded PDF."

    # Truncate to avoid token limits
    resume_text = _truncate(resume_text, 3000)

    job = application.job
    job_context = _truncate(
        f"Title: {job.title}\n"
        f"Company: {job.company}\n"
        f"Description: {job.description}\n"
        f"Requirements: {job.requirements}\n"
        f"Skills Required: {job.skills_required}",
        1500
    )

    _log(agent_log, "init", "system",
         f"Agent started. Resume: {len(resume_text)} chars. Job: {job.title}")

    system_msg = {
        "role": "system",
        "content": "You are an expert ATS resume analyser. Return ONLY what is asked — no preamble, no markdown formatting."
    }

    # ── Step 1: Extract Skills ────────────────────────────────
    print("[Agent] Step 1: Extracting skills...")
    try:
        skills_raw = chat([
            system_msg,
            {
                "role": "user",
                "content": (
                    f"Extract all skills from this resume text.\n\n"
                    f"RESUME:\n{resume_text}\n\n"
                    f"Return ONE line: a comma-separated list of skills only.\n"
                    f"Example: Python, Django, MySQL, REST API, Docker, Git"
                )
            }
        ])
        _log(agent_log, "extract_skills", "assistant", skills_raw)
        print(f"[Agent] Skills: {skills_raw[:100]}")
    except Exception as e:
        skills_raw = "Could not extract skills"
        _log(agent_log, "extract_skills", "error", str(e))
        print(f"[Agent] Step 1 failed: {e}")

    # ── Step 2: Summarise Experience ──────────────────────────
    print("[Agent] Step 2: Summarising experience...")
    try:
        experience_raw = chat([
            system_msg,
            {
                "role": "user",
                "content": (
                    f"Summarise this candidate's work experience in 3-4 sentences.\n\n"
                    f"RESUME:\n{resume_text}\n\n"
                    f"Focus on: job titles held, years of experience, industries, achievements."
                )
            }
        ])
        _log(agent_log, "summarise_experience", "assistant", experience_raw)
        print(f"[Agent] Experience: {experience_raw[:100]}")
    except Exception as e:
        experience_raw = "Could not summarise experience"
        _log(agent_log, "summarise_experience", "error", str(e))
        print(f"[Agent] Step 2 failed: {e}")

    # ── Step 3: Score Candidate ───────────────────────────────
    print("[Agent] Step 3: Scoring candidate...")
    score = 50.0
    reasoning = ""
    try:
        score_raw = chat([
            system_msg,
            {
                "role": "user",
                "content": (
                    f"Score this candidate for the job below. Return JSON only.\n\n"
                    f"JOB:\n{job_context}\n\n"
                    f"CANDIDATE SKILLS: {skills_raw}\n"
                    f"CANDIDATE EXPERIENCE: {experience_raw}\n\n"
                    f"Respond with ONLY this JSON (no markdown, no extra text):\n"
                    f'{"{"}"score": <number 0-100>, "reasoning": "<one sentence>{"}"}'
                )
            }
        ])
        _log(agent_log, "score_candidate", "assistant", score_raw)
        print(f"[Agent] Score raw: {score_raw[:150]}")

        # Parse score
        clean = score_raw.strip()
        clean = re.sub(r'```[a-z]*', '', clean).strip('`').strip()
        score_data = json.loads(clean)
        score = float(score_data.get("score", 50))
        reasoning = score_data.get("reasoning", "")

    except json.JSONDecodeError:
        # Fallback: extract number from text
        numbers = re.findall(r'\b([0-9]{1,3})\b', score_raw if 'score_raw' in dir() else "50")
        score = float(numbers[0]) if numbers else 50.0
        reasoning = score_raw if 'score_raw' in dir() else ""
        _log(agent_log, "score_parse_fallback", "system", f"JSON parse failed, extracted score: {score}")
    except Exception as e:
        _log(agent_log, "score_candidate", "error", str(e))
        print(f"[Agent] Step 3 failed: {e}")

    # ── Step 4: Generate Feedback ─────────────────────────────
    print("[Agent] Step 4: Generating feedback...")
    try:
        feedback_raw = chat([
            system_msg,
            {
                "role": "user",
                "content": (
                    f"Write a 2-sentence recruiter note about this candidate.\n\n"
                    f"Job: {job.title} at {job.company}\n"
                    f"Score: {score}/100\n"
                    f"Skills: {skills_raw}\n"
                    f"Experience: {experience_raw}\n\n"
                    f"Be professional. Mention top skills and whether to proceed."
                )
            }
        ])
        _log(agent_log, "generate_feedback", "assistant", feedback_raw)
        print(f"[Agent] Feedback: {feedback_raw[:100]}")
    except Exception as e:
        feedback_raw = "AI feedback could not be generated."
        _log(agent_log, "generate_feedback", "error", str(e))
        print(f"[Agent] Step 4 failed: {e}")

    _log(agent_log, "done", "system", f"Complete. Score: {score}/100")

    # ── Save to database ──────────────────────────────────────
    application.extracted_skills = skills_raw.strip()
    application.experience_summary = experience_raw.strip()
    application.match_score = round(min(max(score, 0), 100), 1)
    application.ai_feedback = feedback_raw.strip()
    application.agent_log = json.dumps(agent_log, ensure_ascii=False)
    application.save(update_fields=[
        'extracted_skills', 'experience_summary',
        'match_score', 'ai_feedback', 'agent_log',
    ])

    print(f"[Agent] ✅ Done. Application #{application.id} scored {score}/100")