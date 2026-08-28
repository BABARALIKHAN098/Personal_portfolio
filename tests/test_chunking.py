from pathlib import Path

from app.services.chunking import parse_markdown


def test_chunks_are_deterministic():
    source = Path("data/portfolio_knowledge_base.md")
    first = parse_markdown(source)
    second = parse_markdown(source)
    assert first
    assert [item.chunk_id for item in first] == [item.chunk_id for item in second]
    assert len({item.chunk_id for item in first}) == len(first)


def test_project_metadata_is_preserved():
    chunks = parse_markdown(Path("data/portfolio_knowledge_base.md"))
    delivery = [item for item in chunks if item.project_id == "delivery-guard"]
    assert delivery
    assert all(item.project_name == "DeliveryGuard AI" for item in delivery)
    assert any("github.com/BABARALIKHAN098" in item.public_url for item in delivery)
