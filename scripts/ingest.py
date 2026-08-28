import argparse
import sys
from pathlib import Path

from app.core.tls import use_system_trust_store

use_system_trust_store()

from app.core.config import get_settings
from app.services.chunking import parse_markdown
from app.services.embeddings import EmbeddingService
from app.services.pinecone_store import PineconeStore


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Index the public portfolio knowledge base")
    parser.add_argument("--source", type=Path, default=Path("data/portfolio_knowledge_base.md"))
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.source.is_file():
        print(f"Error: source does not exist: {args.source}", file=sys.stderr)
        return 2
    chunks = parse_markdown(args.source)
    hashes = {chunk.document_hash for chunk in chunks}
    projects = {chunk.project_id for chunk in chunks if chunk.project_id}
    print(f"Documents loaded: 1")
    print(f"Document hash: {next(iter(hashes), 'none')}")
    print(f"Projects represented: {len(projects)}")
    print(f"Chunks created: {len(chunks)}")
    if args.dry_run:
        print("Dry run complete; no model loaded and no vectors written.")
        return 0

    settings = get_settings()
    embeddings = EmbeddingService(settings)
    store = PineconeStore(settings)
    store.ensure_index(create=True)
    vectors = embeddings.encode([chunk.text for chunk in chunks])
    upserted = store.upsert(chunks, vectors)

    current_ids = {chunk.chunk_id for chunk in chunks}
    existing_ids: set[str] = set()
    try:
        for page in store.index.list(namespace=settings.pinecone_namespace):
            existing_ids.update(item.id if hasattr(item, "id") else str(item) for item in page)
    except Exception:
        print("Warning: could not enumerate stale vector IDs; upsert succeeded but cleanup was skipped.")
    stale = existing_ids - current_ids
    store.delete_ids(stale)
    print(f"Vectors upserted: {upserted}")
    print(f"Stale vectors removed: {len(stale)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
