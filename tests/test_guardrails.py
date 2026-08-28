from app.core.security import safe_public_url, sanitize_answer


def test_internal_paths_and_secret_shapes_are_removed():
    value = sanitize_answer("See E:\\private\\file and GROQ_API_KEY=abc123")
    assert "E:\\private" not in value
    assert "abc123" not in value


def test_public_url_policy():
    assert safe_public_url("https://github.com/example/repo")
    assert safe_public_url("mailto:person@example.com")
    assert safe_public_url("#contact")
    assert not safe_public_url("javascript:alert(1)")
    assert not safe_public_url("http://insecure.example")
