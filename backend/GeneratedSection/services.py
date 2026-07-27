import os
import threading
from pathlib import Path
from openai import OpenAI
from .models import GeneratedSection
from Answers.models import Answer

STYLE_GUIDE_PATH = Path(__file__).resolve().parent / "style_guide.md"
STYLE_GUIDE = STYLE_GUIDE_PATH.read_text(encoding="utf-8")

OPENROUTER_MODEL = "openai/gpt-oss-20b:free"


def build_prompt(section, raw_answer_text):
    return (
        f"{STYLE_GUIDE}\n\n"
        f"## Section\n{section.number} {section.name}\n\n"
        f"## Section instructions\n{section.template_instructions}\n\n"
        f"## Raw answers\n{raw_answer_text}"
    )


def get_section_answers_text(session, section):
    def get_all_questions_for_section(sec):
        questions = list(sec.questions.filter(is_required=True))
        for sub in sec.subsections.all():
            questions += get_all_questions_for_section(sub)
        return questions

    questions = get_all_questions_for_section(section)
    answer_by_question = {
        a.question_id: a.value
        for a in Answer.objects.filter(session=session, question__in=questions)
    }

    return "\n\n".join(
        f"Q: {q.text}\nA: {answer_by_question.get(q.id, '')}"
        for q in questions
    )


def polish_section_answers(session, section):
    gs, _ = GeneratedSection.objects.update_or_create(
        session=session, section=section,
        defaults={"status": "polishing"}
    )

    def do_the_work():
        try:
            answers_text = get_section_answers_text(session, section)
            prompt = build_prompt(section, answers_text)

            client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=os.environ.get("OPENROUTER_API_KEY"),
            )
            response = client.chat.completions.create(
                model=OPENROUTER_MODEL,
                messages=[{"role": "user", "content": prompt}]
            )
            result_text = response.choices[0].message.content

            GeneratedSection.objects.filter(id=gs.id).update(
                content=result_text,
                status="ready"
            )
        except Exception:
            GeneratedSection.objects.filter(id=gs.id).update(status="failed")

    threading.Thread(target=do_the_work).start()
    return gs