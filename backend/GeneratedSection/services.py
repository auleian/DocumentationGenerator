import threading
import time
from .models import GeneratedSection

def polish_section_answers(session, section):
    gs, _ = GeneratedSection.objects.update_or_create(
        session=session, section=section,
        defaults={"status": "polishing"}
    )

    def do_the_work():
        try:
            time.sleep(3)  # placeholder for the real LLM call, later
            fake_content = f"Polished content for section {section.number} (session {session.id})"
            GeneratedSection.objects.filter(id=gs.id).update(
                content=fake_content,
                status="ready"
            )
        except Exception:
            GeneratedSection.objects.filter(id=gs.id).update(status="failed")

    threading.Thread(target=do_the_work).start()
    return gs