import hashlib
import re
from dataclasses import asdict, dataclass
from pathlib import Path


HEADING = re.compile(r"^(#{1,4})\s+(.+?)\s*$")
PROJECT_ID = re.compile(r"\*\*Project ID:\*\*\s*`?([^`\n]+)`?", re.I)
REPO_URL = re.compile(r"\*\*Repository URL:\*\*\s*(https://\S+)", re.I)


@dataclass(frozen=True)
class Chunk:
    chunk_id: str
    owner: str
    content_type: str
    project_id: str
    project_name: str
    section: str
    source_title: str
    public_url: str
    text: str
    document_hash: str

    def metadata(self) -> dict[str, str]:
        return asdict(self)


def _words(text: str) -> list[str]:
    return text.split()


def _split_words(text: str, target: int, overlap: int) -> list[str]:
    words = _words(text)
    if len(words) <= target:
        return [text.strip()]
    chunks, start = [], 0
    while start < len(words):
        end = min(start + target, len(words))
        chunks.append(" ".join(words[start:end]))
        if end == len(words):
            break
        start = max(end - overlap, start + 1)
    return chunks


def parse_markdown(source: Path, target_words: int = 190, overlap_words: int = 40) -> list[Chunk]:
    raw = source.read_text(encoding="utf-8")
    document_hash = hashlib.sha256(raw.encode()).hexdigest()[:16]
    headings: dict[int, str] = {}
    sections: list[tuple[dict[int, str], str]] = []
    body: list[str] = []

    def flush() -> None:
        nonlocal body
        content = "\n".join(body).strip()
        if content:
            sections.append((headings.copy(), content))
        body = []

    for line in raw.splitlines():
        match = HEADING.match(line)
        if match:
            flush()
            level, title = len(match.group(1)), match.group(2).strip()
            headings[level] = title
            for deeper in range(level + 1, 5):
                headings.pop(deeper, None)
        else:
            body.append(line)
    flush()

    result: list[Chunk] = []
    current_project_id = ""
    current_project_name = ""
    current_project_url = ""
    for section_headings, content in sections:
        level3 = section_headings.get(3, "")
        if level3.startswith("Project: `"):
            current_project_name = level3.removeprefix("Project: `").removesuffix("`")
            current_project_id = ""
            current_project_url = ""
        id_match = PROJECT_ID.search(content)
        if id_match:
            current_project_id = id_match.group(1).strip()
        url_match = REPO_URL.search(content)
        if url_match:
            current_project_url = url_match.group(1).rstrip(".,)")

        section_title = section_headings.get(4) or level3 or section_headings.get(2) or section_headings.get(1, "Portfolio")
        content_type = "project" if current_project_name and section_headings.get(2) == "Detailed Project Documentation" else "portfolio"
        prefix = " > ".join(section_headings[level] for level in sorted(section_headings))
        parts = _split_words(content, target_words, overlap_words)
        semantic_key = f"{content_type}|{current_project_id}|{prefix}"
        for position, part in enumerate(parts):
            chunk_text = f"{prefix}\n\n{part}".strip()
            chunk_hash = hashlib.sha256(f"{semantic_key}|{position}".encode()).hexdigest()[:24]
            result.append(Chunk(
                chunk_id=chunk_hash,
                owner="Babar Ali Khan",
                content_type=content_type,
                project_id=current_project_id if content_type == "project" else "",
                project_name=current_project_name if content_type == "project" else "",
                section=section_title,
                source_title="Babar Ali Khan — Portfolio Knowledge Base",
                public_url=current_project_url if content_type == "project" else "",
                text=chunk_text,
                document_hash=document_hash,
            ))
    return result
